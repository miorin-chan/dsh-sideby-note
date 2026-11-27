/**
 * The host store as the browser sees it.
 *
 * One same-origin endpoint, two calls: GET hydrates, POST applies a mutation.
 * Nothing here throws a raw network error to the UI: every branch becomes a
 * `HostRequestError` carrying the stable `code` the route documented, so the
 * boot logic can distinguish "this host cannot store" from "this write failed".
 */
import {
  HOST_READ_TIMEOUT_MS,
  HOST_STORE_PATH,
  HOST_WRITE_TIMEOUT_MS,
} from '../constants'

/** Durable snapshot served by `GET /dsh-sideby-note/store`. */
export interface HostSnapshot {
  sessions: Record<string, any>
  workspaces: Record<string, any>
  prefs: Record<string, any>
}

/** One mutation response: `record` for list ops, `prefs` for preferences. */
export interface HostOpResult {
  ok?: boolean
  rev?: number
  record?: any
  prefs?: Record<string, any>
  migrated?: number
  notesMigrated?: number
  migratedSessionIds?: string[]
  keptLocal?: boolean
  alreadyComplete?: boolean
}

/** A storage request that did not succeed, with the route's stable code. */
export class HostRequestError extends Error {
  readonly code: string
  readonly status: number
  readonly retryable: boolean

  constructor(code: string, message: string, status = 0, retryable = false) {
    super(message)
    this.name = 'HostRequestError'
    this.code = code
    this.status = status
    this.retryable = retryable
  }
}

const RETRY_MS = 250

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

function abortSignal(timeoutMs: number): { signal?: AbortSignal; done: () => void } {
  if (typeof AbortController !== 'function') return { done: () => {} }
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeoutMs)
  return { signal: controller.signal, done: () => clearTimeout(timer) }
}

function failureOf(response: Response, body: any): HostRequestError {
  const code = typeof body?.code === 'string' ? body.code : ''
  const message = typeof body?.message === 'string' ? body.message : `host answered ${response.status}`
  if (response.status === 404) return new HostRequestError('STORE_ROUTE_MISSING', 'this host has no note-store route', 404)
  if (response.status === 403) return new HostRequestError('STORE_FORBIDDEN', 'the host refused this page', 403)
  if (response.status === 405) return new HostRequestError('STORE_METHOD', 'the host rejected the method', 405)
  if (response.status === 413) return new HostRequestError('STORE_TOO_LARGE', message, 413)
  if (response.status === 400) return new HostRequestError(code || 'STORE_BAD_REQUEST', message, 400)
  if (response.status === 503) return new HostRequestError(code || 'STORE_UNAVAILABLE', message, 503, true)
  return new HostRequestError(code || 'STORE_FAILED', message, response.status, response.status >= 500)
}

async function readJson(response: Response): Promise<any> {
  try {
    return await response.json()
  } catch {
    return undefined
  }
}

async function request(
  path: string,
  init: RequestInit,
  options: { timeoutMs: number; attempts: number },
): Promise<any> {
  let last: HostRequestError | undefined
  for (let attempt = 0; attempt < options.attempts; attempt += 1) {
    const abort = abortSignal(options.timeoutMs)
    let response: Response
    try {
      response = await fetch(path, { ...init, ...(abort.signal === undefined ? {} : { signal: abort.signal }) })
    } catch (error) {
      abort.done()
      last = new HostRequestError(
        (error as any)?.name === 'AbortError' ? 'STORE_TIMEOUT' : 'STORE_UNREACHABLE',
        error instanceof Error ? error.message : 'the host did not answer',
        0,
        true,
      )
      if (attempt + 1 < options.attempts) {
        await sleep(RETRY_MS)
        continue
      }
      throw last
    } finally {
      abort.done()
    }
    const body = await readJson(response)
    if (response.ok && body?.ok === true) return body
    if (response.ok) {
      throw new HostRequestError('STORE_FAILED', 'the host returned an unexpected body', response.status)
    }
    last = failureOf(response, body)
    if (!last.retryable || attempt + 1 >= options.attempts) throw last
    await sleep(RETRY_MS)
  }
  throw last ?? new HostRequestError('STORE_FAILED', 'the host did not answer')
}

/** Read the authoritative snapshot; retries one transient failure. */
export async function fetchSnapshot(): Promise<{ rev: number; empty: boolean; data: HostSnapshot }> {
  const body = await request(HOST_STORE_PATH, { method: 'GET', headers: { accept: 'application/json' } }, {
    timeoutMs: HOST_READ_TIMEOUT_MS,
    attempts: 2,
  })
  const data = body?.data
  if (!data || typeof data !== 'object') {
    throw new HostRequestError('STORE_FAILED', 'the host snapshot has no data', 200)
  }
  return {
    rev: Number.isFinite(body.rev) ? body.rev : 0,
    empty: body.empty === true,
    data: {
      sessions: data.sessions && typeof data.sessions === 'object' ? data.sessions : {},
      workspaces: data.workspaces && typeof data.workspaces === 'object' ? data.workspaces : {},
      prefs: data.prefs && typeof data.prefs === 'object' ? data.prefs : {},
    },
  }
}

/** Apply one mutation; retries once because every operation is idempotent. */
export async function postOp(op: Record<string, any>): Promise<HostOpResult> {
  return request(HOST_STORE_PATH, {
    method: 'POST',
    headers: { 'content-type': 'application/json', accept: 'application/json' },
    body: JSON.stringify(op),
  }, { timeoutMs: HOST_WRITE_TIMEOUT_MS, attempts: 2 })
}
