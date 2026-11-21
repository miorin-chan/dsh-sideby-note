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

export async function uploadAttachment(file: File, signal: AbortSignal): Promise<NoteAttachment> {
  const response = await fetch(ATTACHMENT_PATH, {
    method: 'POST',
    headers: { 'Content-Type': 'application/octet-stream' },
    body: file,
    signal,
  })
  if (!response.ok) throw new Error('Attachment upload failed')
  const result: unknown = await response.json()
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
