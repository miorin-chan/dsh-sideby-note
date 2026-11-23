import { createHash, randomUUID } from 'node:crypto'
import { constants } from 'node:fs'
import { link, lstat, mkdir, open, unlink } from 'node:fs/promises'
import type { IncomingMessage, ServerResponse } from 'node:http'
import { dirname, join } from 'node:path'
import { pipeline } from 'node:stream/promises'
import type { Context } from '@deepseek-ai/cordis'
import type { WebServer } from '@deepseek-ai/dsh-host-webserver'
import { ATTACHMENT_ID, MAX_ATTACHMENT_NAME, MAX_ATTACHMENT_BYTES } from './attachment-metadata.js'
import { requestRejection, sendJson } from './http.js'
import { resolveStoreFile } from './store-route.js'

const ATTACHMENTS_PATH = '/dsh-sideby-note/attachments'
const SIDECAR = 'dsh-sideby-note-attachments'
const OCTET_STREAM = 'application/octet-stream'

class AttachmentError extends Error {
  constructor(readonly status: number, readonly code: string, message: string) {
    super(message)
  }
}

function isFsError(error: unknown, code: string): boolean {
  return error instanceof Error && 'code' in error && error.code === code
}

function tooLarge(): AttachmentError {
  return new AttachmentError(413, 'ATTACHMENT_TOO_LARGE', 'attachments must be at most 25 MiB')
}

function empty(): AttachmentError {
  return new AttachmentError(400, 'ATTACHMENT_EMPTY', 'an attachment must have at least one byte')
}

function notFound(): AttachmentError {
  return new AttachmentError(404, 'ATTACHMENT_NOT_FOUND', 'attachment not found')
}

async function checkDirectory(directory: string): Promise<void> {
  if (!(await lstat(directory)).isDirectory()) throw new Error('attachment sidecar is not a directory')
}

async function upload(request: IncomingMessage, directory: string): Promise<string> {
  if (request.headers['content-type']?.trim().toLowerCase() !== OCTET_STREAM) {
    throw new AttachmentError(415, 'ATTACHMENT_MEDIA_TYPE', 'content-type must be application/octet-stream')
  }
  const length = request.headers['content-length']
  if (length !== undefined) {
    if (Number(length) > MAX_ATTACHMENT_BYTES) throw tooLarge()
    if (Number(length) === 0) throw empty()
  }

  await mkdir(directory, { recursive: true, mode: 0o700 })
  await checkDirectory(directory)
  const tempPath = join(directory, `.upload-${randomUUID()}`)
  const handle = await open(tempPath, 'wx', 0o600)
  try {
    const hash = createHash('sha256')
    let size = 0
    async function* readBody() {
      // Keep the socket open long enough to return 413 for a chunked upload.
      for await (const chunk of request.iterator({ destroyOnReturn: false })) {
        const bytes = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk)
        size += bytes.length
        if (size > MAX_ATTACHMENT_BYTES) throw tooLarge()
        hash.update(bytes)
        yield bytes
      }
    }

    try {
      await handle.writeFile(readBody())
      if (!size) throw empty()
      if (!request.complete) throw new AttachmentError(400, 'ATTACHMENT_INCOMPLETE', 'upload was interrupted')
      await handle.sync()
    } finally {
      await handle.close()
    }

    const id = hash.digest('hex')
    const destination = join(directory, id)
    // A hard link publishes a closed file atomically and lets concurrent
    // writers keep the first completed blob for a given hash.
    try {
      await link(tempPath, destination)
    } catch (error) {
      if (!isFsError(error, 'EEXIST')) throw error
      const existing = await lstat(destination)
      if (!existing.isFile() || existing.size !== size) throw error
    }
    return id
  } finally {
    await unlink(tempPath)
  }
}

function disposition(name: string | null): string {
  const filename = name?.replace(/[\\/\p{Cc}]/gu, '_').trim().slice(0, MAX_ATTACHMENT_NAME)
  if (!filename || filename === '.' || filename === '..') return 'attachment'
  const encoded = encodeURIComponent(filename.replace(/[\uD800-\uDFFF]/gu, '\uFFFD'))
    .replace(/['()*]/g, char => `%${char.charCodeAt(0).toString(16).toUpperCase()}`)
  return `attachment; filename="attachment"; filename*=UTF-8''${encoded}`
}

async function download(request: IncomingMessage, response: ServerResponse, directory: string): Promise<void> {
  const query = new URL(request.url ?? '', 'http://localhost').searchParams
  const id = query.get('id')
  if (!id || !ATTACHMENT_ID.test(id) || query.getAll('id').length !== 1) {
    throw new AttachmentError(400, 'ATTACHMENT_BAD_ID', 'expected a lowercase SHA-256 id')
  }
  try {
    await checkDirectory(directory)
    const handle = await open(join(directory, id), constants.O_RDONLY | constants.O_NOFOLLOW | constants.O_NONBLOCK)
    try {
      const stat = await handle.stat()
      if (!stat.isFile() || stat.size < 1 || stat.size > MAX_ATTACHMENT_BYTES) throw notFound()
      response.writeHead(200, {
        'cache-control': 'no-store',
        'content-type': OCTET_STREAM,
        'content-length': stat.size,
        'x-content-type-options': 'nosniff',
        'content-disposition': disposition(query.get('name')),
      })
      await pipeline(handle.createReadStream(), response)
    } finally {
      await handle.close()
    }
  } catch (error) {
    if (isFsError(error, 'ENOENT') || isFsError(error, 'ELOOP')) throw notFound()
    throw error
  }
}

export function registerAttachmentRoute(server: Pick<WebServer, 'register'>, ctx: Context) {
  if (typeof server?.register !== 'function') return undefined
  return server.register({
    kind: 'exact',
    path: ATTACHMENTS_PATH,
    async handler(request, response) {
      const rejected = requestRejection(ctx, request)
      if (rejected !== undefined) {
        sendJson(response, rejected, { ok: false, code: 'ATTACHMENT_FORBIDDEN', message: 'forbidden' })
        return
      }
      if (request.method !== 'GET' && request.method !== 'POST') {
        response.setHeader('allow', 'GET, POST')
        sendJson(response, 405, { ok: false, code: 'METHOD_NOT_ALLOWED', message: 'use GET or POST' })
        return
      }
      try {
        const { path } = resolveStoreFile(ctx)
        if (!path) {
          throw new AttachmentError(503, 'ATTACHMENT_UNAVAILABLE', 'attachments require a JSON note store')
        }
        const directory = join(dirname(path), SIDECAR)
        if (request.method === 'GET') {
          await download(request, response, directory)
        } else {
          const id = await upload(request, directory)
          sendJson(response, 200, { ok: true, id })
        }
      } catch (error) {
        if (response.destroyed) return
        if (response.headersSent) {
          response.destroy()
          return
        }
        const { status, code, message } = error instanceof AttachmentError
          ? error
          : new AttachmentError(502, 'ATTACHMENT_FAILED', 'attachment storage failed')
        sendJson(response, status, { ok: false, code, message })
      }
    },
  })
}
