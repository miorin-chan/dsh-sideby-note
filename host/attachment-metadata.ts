export const MAX_ATTACHMENT_BYTES = 25 * 1024 * 1024
export const MAX_ATTACHMENTS = 10
export const MAX_ATTACHMENT_NAME = 255
export const MAX_ATTACHMENT_MIME = 127
export const ATTACHMENT_ID = /^[a-f0-9]{64}$/
export const ATTACHMENT_MIME = /^(?:[a-z0-9][a-z0-9!#$&^_.+-]*\/[a-z0-9][a-z0-9!#$&^_.+-]*)?$/

export interface NoteAttachment {
  id: string
  name: string
  type: string
  size: number
}

function normalizeAttachment(raw: unknown): NoteAttachment | undefined {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return
  const { id, name, type, size } = raw as Record<string, unknown>
  if (typeof id !== 'string' || !ATTACHMENT_ID.test(id)) return
  if (typeof name !== 'string' || !name || name.length > MAX_ATTACHMENT_NAME) return
  if (typeof type !== 'string' || type.length > MAX_ATTACHMENT_MIME || !ATTACHMENT_MIME.test(type)) return
  if (typeof size !== 'number' || !Number.isInteger(size) || size < 1 || size > MAX_ATTACHMENT_BYTES) return
  return { id, name, type, size }
}

export function normalizeAttachments(raw: unknown): NoteAttachment[] {
  if (!Array.isArray(raw)) return []
  const attachments: NoteAttachment[] = []
  for (const candidate of raw) {
    const attachment = normalizeAttachment(candidate)
    if (attachment) attachments.push(attachment)
    if (attachments.length === MAX_ATTACHMENTS) break
  }
  return attachments
}
