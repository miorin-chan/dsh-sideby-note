import { MAX_TEXT } from '../constants'
import { MAX_ATTACHMENTS, MAX_ATTACHMENT_BYTES, uploadAttachment, type NoteAttachment } from '../domain/attachments'
import { uid } from '../domain/id'
import { notifyDraftAttachments, readScopeDrafts, saveAddDraft } from './drafts'

export type DraftUploadError = 'attachmentUploadFailed' | 'attachmentDraftChanged' | 'attachmentLimit' | 'saveFailed'

type UploadItem = {
  kind: 'upload'
  id: string
  name: string
  size: number
  type: string
  loaded: number
  total: number | null
} & (
  | { status: 'uploading'; retryable: false; error?: undefined }
  | { status: 'failed'; retryable: boolean; error: DraftUploadError }
)

export type ComposerAttachmentItem =
  | { kind: 'attached'; id: string; attachment: NoteAttachment; index: number }
  | UploadItem

interface UploadEntry {
  item: UploadItem
  source: { file: File } | { attachment: NoteAttachment }
  attempt?: AbortController
}

type DraftEntry = NoteAttachment | UploadEntry
type SavedDraft = ReturnType<typeof readScopeDrafts>

interface DraftUploads {
  key: string
  entries: DraftEntry[]
  saved: SavedDraft
  workspaceId?: string
  revision: number
}

// The page owns unresolved files so closing or changing the panel leaves the
// requests and their original draft keys intact. Each completed ref is saved.
const uploadsByDraft = new Map<string, DraftUploads>()
const isUpload = (entry: DraftEntry): entry is UploadEntry => 'item' in entry

export function sameAttachments(a: readonly NoteAttachment[], b: readonly NoteAttachment[]) {
  return JSON.stringify(a) === JSON.stringify(b)
}

export function attachedItems(attachments: readonly NoteAttachment[]): ComposerAttachmentItem[] {
  const occurrences = new Map<string, number>()
  return attachments.map((attachment, index) => {
    const { id, name, type, size } = attachment
    const identity = JSON.stringify([id, name, type, size])
    const occurrence = occurrences.get(identity) ?? 0
    occurrences.set(identity, occurrence + 1)
    return { kind: 'attached', id: `${identity}:${occurrence}`, attachment, index }
  })
}

function syncQueue(key: string, saved: SavedDraft) {
  const queue = uploadsByDraft.get(key)
  if (!queue) return undefined
  const sameFiles = sameAttachments(saved.attachments, queue.saved.attachments)
  const sameOwner = saved.workspaceId === queue.saved.workspaceId
  if (!sameFiles || !sameOwner || saved.add !== queue.saved.add) {
    // An external change invalidates older attempts. A deliberate retry can
    // attach their bytes to the now-current draft after the latest saved refs.
    if (!sameFiles || !sameOwner) queue.entries = [...saved.attachments, ...queue.entries.filter(isUpload)]
    queue.saved = saved
    queue.workspaceId = saved.workspaceId
    queue.revision++
  }
  return queue
}

export function readDraftUploadView(key: string, saved: SavedDraft) {
  const queue = syncQueue(key, saved)
  if (!queue || !queue.entries.some(isUpload)) return undefined
  const attached = attachedItems(saved.attachments)
  const hasRoom = saved.attachments.length < MAX_ATTACHMENTS
  let index = 0
  const items = queue.entries.map(entry => {
    if (!isUpload(entry)) return attached[index++]
    return entry.item.status === 'failed' && !hasRoom ? { ...entry.item, retryable: false } : entry.item
  })
  return { items, workspaceId: queue.workspaceId }
}

export function hasDraftUploads(key: string) {
  return uploadsByDraft.has(key)
}

/** Keep the queue's guard in sync with text entered in this composer. */
export function acceptDraftUploadText(key: string, value: string, workspaceId: string | undefined) {
  const queue = uploadsByDraft.get(key)
  if (!queue) return
  const add = value.slice(0, MAX_TEXT)
  queue.saved = { ...queue.saved, add, workspaceId: add || queue.saved.attachments.length ? workspaceId : undefined }
}

function saveEntries(queue: DraftUploads, entries: DraftEntry[]) {
  const attachments = entries.filter((entry): entry is NoteAttachment => !isUpload(entry))
  const unresolved = entries.some(isUpload)
  const add = queue.saved.add.slice(0, MAX_TEXT)
  const workspaceId = (add.trim() || attachments.length) ? queue.workspaceId : undefined
  const { saved: previousSaved, entries: previousEntries } = queue
  // saveAddDraft notifies listeners synchronously. They should see the matching
  // queue and persisted refs, including when a later file finishes first.
  queue.entries = entries
  queue.saved = { add, attachments, workspaceId }
  if (saveAddDraft(queue.key, add, attachments, workspaceId ?? null)) {
    if (!unresolved) uploadsByDraft.delete(queue.key)
    return true
  }
  queue.entries = previousEntries
  queue.saved = previousSaved
  return false
}

function markFailed(queue: DraftUploads, entry: UploadEntry, error: DraftUploadError) {
  entry.attempt = undefined
  entry.item = { ...entry.item, status: 'failed', retryable: true, error }
  notifyDraftAttachments(queue.key)
}

async function startUpload(queue: DraftUploads, entry: UploadEntry) {
  const attempt = new AbortController()
  const revision = queue.revision
  entry.attempt = attempt
  entry.item = { ...entry.item, status: 'uploading', retryable: false, loaded: 0, total: null, error: undefined }
  let attachment: NoteAttachment
  try {
    const { source } = entry
    attachment = 'attachment' in source ? source.attachment : await uploadAttachment(source.file, attempt.signal, progress => {
      if (entry.attempt !== attempt) return
      entry.item = { ...entry.item, ...progress }
      notifyDraftAttachments(queue.key)
    })
    if (entry.attempt !== attempt) return
    // A failed local save keeps the successful ref for retry without another POST.
    entry.source = { attachment }
  } catch {
    if (entry.attempt === attempt) markFailed(queue, entry, 'attachmentUploadFailed')
    return
  }
  const latest = readScopeDrafts(queue.key)
  syncQueue(queue.key, latest)
  if (revision !== queue.revision) {
    markFailed(queue, entry, 'attachmentDraftChanged')
    return
  }
  if (latest.attachments.length >= MAX_ATTACHMENTS) {
    markFailed(queue, entry, 'attachmentLimit')
    return
  }
  const entries = queue.entries.map(candidate => candidate === entry ? attachment : candidate)
  if (!saveEntries(queue, entries)) markFailed(queue, entry, 'saveFailed')
  else entry.attempt = undefined
}

/** Reject the selection as a unit before starting any byte requests. */
export function addDraftUploads(key: string, files: readonly File[]) {
  if (!files.length) return true
  if (!key) return false
  const saved = readScopeDrafts(key)
  const current = syncQueue(key, saved)
  if (files.length + (current?.entries.length ?? saved.attachments.length) > MAX_ATTACHMENTS
    || files.some(file => file.size < 1 || file.size > MAX_ATTACHMENT_BYTES)) return false
  const queue = current ?? { key, entries: saved.attachments, saved, workspaceId: saved.workspaceId, revision: 0 }
  const entries = files.map((file): UploadEntry => ({
    item: {
      kind: 'upload', id: uid(), name: file.name, size: file.size, type: file.type,
      status: 'uploading', retryable: false, loaded: 0, total: null,
    },
    source: { file },
  }))
  queue.entries = [...queue.entries, ...entries]
  uploadsByDraft.set(key, queue)
  for (const entry of entries) void startUpload(queue, entry)
  notifyDraftAttachments(key)
  return true
}

export function retryDraftUpload(key: string, id: string) {
  const saved = readScopeDrafts(key)
  const queue = syncQueue(key, saved)
  const entry = queue?.entries.find((candidate): candidate is UploadEntry => isUpload(candidate) && candidate.item.id === id)
  if (!queue || entry?.item.status !== 'failed') return
  if (saved.attachments.length >= MAX_ATTACHMENTS) {
    markFailed(queue, entry, 'attachmentLimit')
    return
  }
  void startUpload(queue, entry)
  notifyDraftAttachments(key)
}

export function removeDraftUpload(key: string, id: string) {
  const queue = syncQueue(key, readScopeDrafts(key))
  const entry = queue?.entries.find((candidate): candidate is UploadEntry => isUpload(candidate) && candidate.item.id === id)
  if (!queue || !entry) return
  const attempt = entry.attempt
  entry.attempt = undefined
  queue.entries = queue.entries.filter(candidate => candidate !== entry)
  if (!queue.entries.some(isUpload)) uploadsByDraft.delete(key)
  attempt?.abort()
  notifyDraftAttachments(key)
}

export function removeDraftAttachment(key: string, index: number, rendered: SavedDraft): DraftUploadError | undefined {
  const saved = readScopeDrafts(key)
  const queue = syncQueue(key, saved)
  if (!sameAttachments(saved.attachments, rendered.attachments) || saved.workspaceId !== rendered.workspaceId) {
    notifyDraftAttachments(key)
    return 'attachmentDraftChanged'
  }
  if (!saved.attachments[index]) return
  if (queue) {
    let position = 0
    if (!saveEntries(queue, queue.entries.filter(entry => isUpload(entry) || position++ !== index))) return 'saveFailed'
  } else {
    const remaining = saved.attachments.filter((_, position) => position !== index)
    if (!saveAddDraft(key, saved.add, remaining, saved.add.trim() || remaining.length ? saved.workspaceId : null)) return 'saveFailed'
  }
}

export function disposeDraftUploads() {
  for (const [key, queue] of uploadsByDraft) {
    uploadsByDraft.delete(key)
    for (const entry of queue.entries.filter(isUpload)) {
      const attempt = entry.attempt
      entry.attempt = undefined
      attempt?.abort()
    }
    notifyDraftAttachments(key)
  }
}
