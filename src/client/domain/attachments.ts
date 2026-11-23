import {
  ATTACHMENT_MIME,
  MAX_ATTACHMENT_MIME,
  MAX_ATTACHMENT_NAME,
  normalizeAttachments,
  type NoteAttachment,
} from '../../../host/attachment-metadata.ts'

export {
  MAX_ATTACHMENT_BYTES,
  MAX_ATTACHMENTS,
  normalizeAttachments,
  type NoteAttachment,
} from '../../../host/attachment-metadata.ts'

const ATTACHMENT_PATH = '/dsh-sideby-note/attachments'

export interface AttachmentUploadProgress {
  loaded: number
  total: number | null
}

export function uploadAttachment(
  file: File,
  signal: AbortSignal,
  onProgress: (progress: AttachmentUploadProgress) => void,
): Promise<NoteAttachment> {
  return new Promise((resolve, reject) => {
    if (signal.aborted) {
      reject(signal.reason)
      return
    }
    const request = new XMLHttpRequest()
    const cleanup = () => {
      signal.removeEventListener('abort', abort)
      request.upload.onprogress = null
      request.onload = request.onerror = request.ontimeout = request.onabort = null
    }
    const fail = (error: unknown) => {
      cleanup()
      reject(error)
    }
    const abort = () => {
      cleanup()
      request.abort()
      reject(signal.reason)
    }
    request.upload.onprogress = event => {
      onProgress({ loaded: event.loaded, total: event.lengthComputable ? event.total : null })
    }
    request.onload = () => {
      if (request.status < 200 || request.status >= 300) {
        fail(new Error('Attachment upload failed'))
        return
      }
      try {
        const attachment = attachmentFromResponse(file, JSON.parse(request.responseText))
        cleanup()
        resolve(attachment)
      } catch (error) {
        fail(error)
      }
    }
    request.onerror = request.ontimeout = () => fail(new Error('Attachment upload failed'))
    request.onabort = () => fail(new DOMException('Attachment upload aborted', 'AbortError'))
    signal.addEventListener('abort', abort, { once: true })
    try {
      request.open('POST', ATTACHMENT_PATH)
      request.timeout = 120_000
      request.setRequestHeader('Content-Type', 'application/octet-stream')
      request.send(file)
    } catch (error) {
      fail(error)
    }
  })
}

function attachmentFromResponse(file: File, result: unknown): NoteAttachment {
  if (!result || typeof result !== 'object' || !('ok' in result) || result.ok !== true || !('id' in result)) {
    throw new Error('Invalid attachment upload response')
  }
  const type = file.type.toLowerCase()
  const [attachment] = normalizeAttachments([{
    id: result.id,
    name: file.name.slice(0, MAX_ATTACHMENT_NAME),
    type: type.length <= MAX_ATTACHMENT_MIME && ATTACHMENT_MIME.test(type) ? type : '',
    size: file.size,
  }])
  if (!attachment) throw new Error('Invalid attachment metadata')
  return attachment
}

export function attachmentUrl(attachment: NoteAttachment): string {
  const query = new URLSearchParams({ id: attachment.id, name: attachment.name })
  return `${ATTACHMENT_PATH}?${query}`
}

export async function readAttachment(attachment: NoteAttachment, signal: AbortSignal): Promise<Blob> {
  const response = await fetch(attachmentUrl(attachment), { signal })
  if (!response.ok) throw new Error('Attachment download failed')
  const blob = await response.blob()
  if (blob.size !== attachment.size) throw new Error('Attachment size mismatch')
  return blob.slice(0, blob.size, attachment.type)
}

const imageTypes = new Set(['image/png', 'image/jpeg', 'image/webp', 'image/gif', 'image/avif', 'image/bmp'])
const audioTypes = new Set(['audio/aac', 'audio/flac', 'audio/mp4', 'audio/mpeg', 'audio/ogg', 'audio/wav', 'audio/webm', 'audio/x-wav', 'audio/x-m4a'])
const videoTypes = new Set(['video/mp4', 'video/ogg', 'video/quicktime', 'video/webm'])

export function previewKind(type: string) {
  if (imageTypes.has(type)) return 'img'
  if (audioTypes.has(type)) return 'audio'
  if (videoTypes.has(type)) return 'video'
  return null
}
