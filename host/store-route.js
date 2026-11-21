/**
 * The note store's same-origin endpoints.
 *
 * Three exact paths:
 * - `/store`          GET hydrates the browser cache, POST applies a mutation;
 * - `/store/location` reports the durable file's absolute path for Settings;
 * - `/store/reveal`   asks the host to show that file in the OS file manager.
 *
 * Reads are served from the domain's in-memory state, so a snapshot is cheap;
 * writes go through the domain's durable chain before the response is sent,
 * which is what lets the panel keep "a failed save changes nothing" as its
 * contract. The reveal endpoint never accepts a path from the browser: it
 * resolves the same backend root the store writes to.
 */
import fs from 'node:fs'
import path from 'node:path'
import { spawn } from 'node:child_process'
import { DOMAIN_NAME } from './constants.js'
import { BodyError, readJsonBody, requestRejection, sendJson } from './http.js'
import { StoreError } from './store.js'

/** Main store endpoint; keep in sync with the browser half. */
export const STORE_PATH = '/dsh-sideby-note/store'
/** Where Settings reads the absolute file path. */
export const LOCATION_PATH = `${STORE_PATH}/location`
/** Ask the host's file manager to reveal the store file. */
export const REVEAL_PATH = `${STORE_PATH}/reveal`
/** Whole-snapshot writes are bounded; a note list cannot approach this. */
const BODY_LIMIT = 2 * 1024 * 1024

/**
 * Resolve the file the domain actually writes to.
 *
 * The JSON backend keeps its root on the instance; the domain facility keeps
 * the backend route for this domain. Both are read best-effort: a custom
 * backend (SQLite, a future medium) simply has no file path, and Settings says
 * so instead of guessing a default.
 *
 * @param {any} ctx
 * @returns {{ path: string | null, backend: string | null, reason?: string }}
 */
export function resolveStoreFile(ctx) {
  const storage = typeof ctx?.get === 'function' ? ctx.get('storage') : undefined
  const registry = storage && storage.backend
  if (!registry || typeof registry.get !== 'function') {
    return { path: null, backend: null, reason: 'storage-unavailable' }
  }
  const config = ctx.get('storageDomain')?.config
  const routed = config?.routes?.[DOMAIN_NAME] ?? config?.backend
  if (routed === undefined) {
    return { path: null, backend: null, reason: 'storage-unavailable' }
  }
  if (routed === 'json') {
    try {
      const root = registry.get(routed)?.root
      if (typeof root === 'string' && root) {
        return { path: path.resolve(root, `${DOMAIN_NAME}.json`), backend: routed }
      }
    } catch {
      // The routed JSON backend could be unavailable in a custom profile.
    }
  }
  return { path: null, backend: routed, reason: 'backend-has-no-path' }
}

/**
 * The platform command that reveals `file` (or its folder when it is absent).
 * Pure so tests can assert all three platforms without launching anything.
 * @param {string} file absolute store file path
 * @param {NodeJS.Platform} [platform]
 * @param {boolean} [exists]
 */
export function revealCommand(file, platform = process.platform, exists = true) {
  const directory = path.dirname(file)
  if (platform === 'darwin') {
    return { command: 'open', args: exists ? ['-R', file] : [directory] }
  }
  if (platform === 'win32') {
    return { command: 'explorer.exe', args: [exists ? `/select,${file}` : directory] }
  }
  return { command: 'xdg-open', args: [directory] }
}

/**
 * @param {import('node:http').ServerResponse} response
 * @param {unknown} error
 */
function sendError(response, error) {
  const failure = error instanceof StoreError
    ? error
    : new StoreError('STORE_FAILED', error instanceof Error ? error.message : String(error), 502)
  sendJson(response, failure.status, {
    ok: false,
    code: failure.code,
    message: failure.message,
    retryable: failure.retryable,
  })
}

async function sendLocation(ctx, request, response) {
  if (request.method !== 'GET') {
    sendJson(response, 405, { ok: false, code: 'METHOD_NOT_ALLOWED', message: 'use GET' })
    return
  }
  const resolved = resolveStoreFile(ctx)
  let exists = false
  if (resolved.path) {
    try {
      exists = fs.existsSync(resolved.path)
    } catch {
      exists = false
    }
  }
  sendJson(response, 200, {
    ok: true,
    path: resolved.path,
    exists,
    backend: resolved.backend,
    ...(resolved.reason === undefined ? {} : { reason: resolved.reason }),
  })
}

async function sendReveal(ctx, request, response) {
  if (request.method !== 'POST') {
    sendJson(response, 405, { ok: false, code: 'METHOD_NOT_ALLOWED', message: 'use POST' })
    return
  }
  const resolved = resolveStoreFile(ctx)
  if (!resolved.path) {
    sendJson(response, 404, {
      ok: false,
      code: 'STORE_PATH_UNAVAILABLE',
      message: 'the storage backend has no file path to reveal',
    })
    return
  }
  let exists = false
  try {
    exists = fs.existsSync(resolved.path)
  } catch {
    exists = false
  }
  const spec = revealCommand(resolved.path, process.platform, exists)
  let child
  try {
    child = spawn(spec.command, spec.args, { detached: true, stdio: 'ignore' })
  } catch (error) {
    sendJson(response, 502, {
      ok: false,
      code: 'STORE_REVEAL_FAILED',
      message: error instanceof Error ? error.message : 'could not start the file manager',
    })
    return
  }
  const launched = await new Promise(resolve => {
    let settled = false
    child.once('spawn', () => {
      if (settled) return
      settled = true
      resolve(true)
    })
    child.once('error', () => {
      if (settled) return
      settled = true
      resolve(false)
    })
  })
  if (!launched) {
    sendJson(response, 502, {
      ok: false,
      code: 'STORE_REVEAL_FAILED',
      message: 'could not start the file manager',
    })
    return
  }
  child.unref()
  sendJson(response, 200, { ok: true })
}

/**
 * Register the store endpoints on the host's web server.
 * @param {{ register?: (route: { kind: 'exact', path: string, handler: (request: any, response: any) => unknown }) => unknown }} server
 * @param {{ ctx: any, store: import('./store.js').Store }} options
 * @returns {(() => void) | undefined}
 */
export function registerStoreRoutes(server, options) {
  if (typeof server?.register !== 'function') return undefined
  const { ctx, store } = options

  const main = server.register({
    kind: 'exact',
    path: STORE_PATH,
    handler: async (request, response) => {
      const rejection = requestRejection(ctx, request)
      if (rejection !== undefined) {
        sendJson(response, rejection, { ok: false, code: 'STORE_FORBIDDEN', message: 'forbidden' })
        return
      }
      if (request.method === 'GET') {
        try {
          const snapshot = await store.snapshot()
          sendJson(response, 200, { ok: true, ...snapshot })
        } catch (error) {
          sendError(response, error)
        }
        return
      }
      if (request.method !== 'POST') {
        sendJson(response, 405, { ok: false, code: 'METHOD_NOT_ALLOWED', message: 'use GET or POST' })
        return
      }
      const contentType = String(request.headers['content-type'] || '')
      if (!contentType.includes('application/json')) {
        sendJson(response, 400, { ok: false, code: 'STORE_BAD_REQUEST', message: 'content-type must be application/json' })
        return
      }
      let body
      try {
        body = await readJsonBody(request, BODY_LIMIT)
      } catch (error) {
        if (error instanceof BodyError) {
          sendJson(response, error.code === 'BODY_TOO_LARGE' ? 413 : 400, {
            ok: false,
            code: error.code === 'BODY_TOO_LARGE' ? 'STORE_TOO_LARGE' : 'STORE_BAD_REQUEST',
            message: error.message,
          })
          return
        }
        sendError(response, error)
        return
      }
      try {
        const result = await store.apply(body)
        sendJson(response, 200, { ok: true, ...result })
      } catch (error) {
        sendError(response, error)
      }
    },
  })

  const location = server.register({
    kind: 'exact',
    path: LOCATION_PATH,
    handler: async (request, response) => {
      const rejection = requestRejection(ctx, request)
      if (rejection !== undefined) {
        sendJson(response, rejection, { ok: false, code: 'STORE_FORBIDDEN', message: 'forbidden' })
        return
      }
      await sendLocation(ctx, request, response)
    },
  })

  const reveal = server.register({
    kind: 'exact',
    path: REVEAL_PATH,
    handler: async (request, response) => {
      const rejection = requestRejection(ctx, request)
      if (rejection !== undefined) {
        sendJson(response, rejection, { ok: false, code: 'STORE_FORBIDDEN', message: 'forbidden' })
        return
      }
      await sendReveal(ctx, request, response)
    },
  })

  return () => {
    for (const dispose of [main, location, reveal]) {
      try {
        if (typeof dispose === 'function') dispose()
      } catch {
        // A route that already went away is not a failure to report.
      }
    }
  }
}
