/**
 * The note store's same-origin endpoint.
 *
 * One exact path:
 * - `/store`          GET hydrates the browser cache, POST applies a mutation.
 *
 * Reads are served from the domain's in-memory state, so a snapshot is cheap;
 * writes go through the domain's durable chain before the response is sent,
 * which is what lets the panel keep "a failed save changes nothing" as its
 * contract. `resolveStoreFile` also locates the JSON store file so the
 * attachment route can place its sidecar directory beside it.
 */
import path from 'node:path'
import type { IncomingMessage, ServerResponse } from 'node:http'
import type { Context } from '@deepseek-ai/cordis'
import type { WebServer } from '@deepseek-ai/dsh-host-webserver'
import type { Config as DomainConfig } from '@deepseek-ai/dsh-storage-domain'
import { DOMAIN_NAME } from './constants.js'
import { BodyError, readJsonBody, requestRejection, sendJson } from './http.js'
import { StoreError, type Store } from './store.js'

/** Main store endpoint; keep in sync with the browser half. */
export const STORE_PATH = '/dsh-sideby-note/store'
/** Whole-snapshot writes are bounded; a note list cannot approach this. */
const BODY_LIMIT = 2 * 1024 * 1024

/**
 * Resolve the file the domain actually writes to.
 *
 * The JSON backend keeps its root on the instance; the domain facility keeps
 * the backend route for this domain. Both are read best-effort: a custom
 * backend (SQLite, a future medium) simply has no file path.
 */
export function resolveStoreFile(ctx: Context): { path: string | null; backend: string | null; reason?: string } {
  const storage = typeof ctx?.get === 'function' ? ctx.get('storage') : undefined
  const registry = storage && storage.backend
  if (!registry || typeof registry.get !== 'function') {
    return { path: null, backend: null, reason: 'storage-unavailable' }
  }
  // These fields are best-effort compatibility reads of the existing JSON backend.
  const facility: unknown = ctx.get('storageDomain')
  const config = facility && typeof facility === 'object' && 'config' in facility ? facility.config : undefined
  const { routes, backend } = config && typeof config === 'object' ? config as Partial<DomainConfig> : {}
  const routed = routes?.[DOMAIN_NAME] ?? backend
  if (typeof routed !== 'string') {
    return { path: null, backend: null, reason: 'storage-unavailable' }
  }
  if (routed === 'json') {
    try {
      const backend = registry.get(routed)
      const root = backend && 'root' in backend ? backend.root : undefined
      if (typeof root === 'string' && root) {
        return { path: path.resolve(root, `${DOMAIN_NAME}.json`), backend: routed }
      }
    } catch {
      // The routed JSON backend could be unavailable in a custom profile.
    }
  }
  return { path: null, backend: routed, reason: 'backend-has-no-path' }
}

function sendError(response: ServerResponse, error: unknown): void {
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

/** Register the store endpoint on the host's web server. */
export function registerStoreRoutes(server: Pick<WebServer, 'register'>, options: { ctx: Context; store: Store }) {
  if (typeof server?.register !== 'function') return undefined
  const { ctx, store } = options

  const main = server.register({
    kind: 'exact',
    path: STORE_PATH,
    handler: async (request, response, peer?: unknown) => {
      const rejection = requestRejection(ctx, request, peer)
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
      let body: unknown
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

  return () => {
    try {
      if (typeof main === 'function') main()
    } catch {
      // A route that already went away is not a failure to report.
    }
  }
}
