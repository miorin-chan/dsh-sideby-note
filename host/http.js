/** Shared HTTP helpers for the plugin's host routes. */

/**
 * @param {import('node:http').ServerResponse} response
 * @param {number} status
 * @param {unknown} body
 */
export function sendJson(response, status, body) {
  response.writeHead(status, { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' })
  response.end(JSON.stringify(body))
}

/**
 * Use the Host's authority, origin, and browser-session checks.
 * @param {{ get?: (name: string) => any }} ctx
 * @param {import('node:http').IncomingMessage} request
 * @returns {401 | 403 | undefined}
 */
export function requestRejection(ctx, request) {
  try {
    const connection = ctx.get?.('connection')
    if (typeof connection?.requestRejection === 'function') {
      const rejection = connection.requestRejection(request)
      if (rejection === undefined || rejection === 401) return rejection
    }
  } catch {
    // The route needs a working Host authenticator before serving the request.
  }
  return 403
}

/** A request body that cannot be accepted; `code` is the route's discriminant. */
export class BodyError extends Error {
  /**
   * @param {'BODY_TOO_LARGE' | 'BAD_JSON'} code
   * @param {string} message
   */
  constructor(code, message) {
    super(message)
    this.name = 'BodyError'
    this.code = code
  }
}

/**
 * Read and parse one JSON body with a byte ceiling.
 * @param {import('node:http').IncomingMessage} request
 * @param {number} limit
 * @returns {Promise<any>}
 */
export async function readJsonBody(request, limit) {
  const chunks = []
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
