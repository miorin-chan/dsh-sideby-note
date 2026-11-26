/** Shared HTTP helpers for the plugin's host routes. */
import type { IncomingMessage, ServerResponse } from 'node:http'
import type { Context } from '@deepseek-ai/cordis'
import type {} from '@deepseek-ai/dsh-client-connection'

export type RouteRejection = 401 | 403 | undefined

export function sendJson(response: ServerResponse, status: number, body: unknown): void {
  response.writeHead(status, { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' })
  response.end(JSON.stringify(body))
}

/**
 * Use the Host's authority, origin, and browser-session checks.
 *
 * DSH 0.2.3+ WebServer authenticates routes up front and passes the admitted
 * `peer` as the third handler argument; 0.2.2-rc.5 calls handlers without a
 * peer, so we fall back to `connection.admit(request)` only when `peer` is absent.
 */
export function requestRejection(ctx: Context, request: IncomingMessage, peer?: unknown): RouteRejection {
  if (peer !== undefined) {
    if (peer === null || typeof peer !== 'object') return 403
    if (
      'signal' in peer
      && peer.signal !== null
      && typeof peer.signal === 'object'
      && 'aborted' in peer.signal
      && peer.signal.aborted === true
    ) {
      return 401
    }
    return undefined
  }
  try {
    const connection = ctx.get?.('connection')
    if (typeof connection?.admit === 'function') {
      const admission = connection.admit(request)
      if (admission !== null && typeof admission === 'object') {
        if ('rejection' in admission) {
          return admission.rejection === 401 ? 401 : 403
        }
        if ('peer' in admission && admission.peer !== undefined) {
          return undefined
        }
      }
    }
  } catch {
    // The route needs a working Host authenticator before serving the request.
  }
  return 403
}

/** A request body that cannot be accepted; `code` is the route's discriminant. */
export class BodyError extends Error {
  constructor(readonly code: 'BODY_TOO_LARGE' | 'BAD_JSON', message: string) {
    super(message)
    this.name = 'BodyError'
  }
}

/** Read and parse one JSON body with a byte ceiling. */
export async function readJsonBody(request: IncomingMessage, limit: number): Promise<unknown> {
  const chunks: Buffer[] = []
  let size = 0
  for await (const chunk of request) {
    const buffer = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk)
    size += buffer.length
    if (size > limit) throw new BodyError('BODY_TOO_LARGE', 'request body too large')
    chunks.push(buffer)
  }
  if (chunks.length === 0) return {}
  const body = Buffer.concat(chunks).toString('utf8')
  try {
    return JSON.parse(body)
  } catch {
    throw new BodyError('BAD_JSON', 'invalid JSON body')
  }
}
