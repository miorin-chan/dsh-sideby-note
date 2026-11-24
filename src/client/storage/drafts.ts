/**
 * The unsaved composer draft, so closing the panel never loses text.
 *
 * Records are keyed by draft scope, not by conversation: inside a workspace
 * every member session shares one buffer (`ws:<workspaceId>`), so switching
 * conversations or filters never strands half-typed text.
 * A session outside a workspace keeps its own key. Recalled notes remember
 * their original workspace. The map field stays `sessions` so the existing
 * store keeps its shape.
 */
import { DRAFT_STORAGE_KEY, MAX_TEXT } from '../constants'
import { setAsideUnreadable, storage } from './codec'
import { normalizeAttachments, type NoteAttachment } from '../domain/attachments'
import { normalizeLinkedSessionId } from '../domain/id'

interface ScopeDraft {
  add: string
  attachments: NoteAttachment[]
  workspaceId: string | undefined
  linkedSessionId?: string
}

const keyOf = value => (value ? String(value) : '')
const attachmentChanges = new Set<(key: string) => void>()

export function notifyDraftAttachments(key: string) {
  for (const listener of attachmentChanges) listener(key)
}

export function subscribeDraftAttachments(listener: (key: string) => void) {
  const onStorage = (event: StorageEvent) => {
    if (event.key === DRAFT_STORAGE_KEY || event.key === null) listener('')
  }
  attachmentChanges.add(listener)
  window.addEventListener('storage', onStorage)
  return () => {
    attachmentChanges.delete(listener)
    window.removeEventListener('storage', onStorage)
  }
}

/** Empty unsaved-draft store. */
export function emptyDraftStore() {
  return { version: 1, sessions: {} }
}

/**
 * Read the unsaved composer drafts; corrupt or unavailable reads as empty.
 * An unreadable payload is parked under `<key>.corrupt` first, so half-typed
 * text is never destroyed by the next write.
 */
export function readDraftStore() {
  const ls = storage()
  if (!ls) return emptyDraftStore()
  let raw
  try {
    raw = ls.getItem(DRAFT_STORAGE_KEY)
  } catch {
    return emptyDraftStore()
  }
  if (!raw) return emptyDraftStore()
  let parsed
  try {
    parsed = JSON.parse(raw)
  } catch {
    setAsideUnreadable(DRAFT_STORAGE_KEY, raw)
    return emptyDraftStore()
  }
  const sessions = parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? parsed.sessions : undefined
  const broken = !parsed || typeof parsed !== 'object' || Array.isArray(parsed)
    || (sessions !== undefined && (!sessions || typeof sessions !== 'object' || Array.isArray(sessions)))
  if (broken) {
    setAsideUnreadable(DRAFT_STORAGE_KEY, raw)
    return emptyDraftStore()
  }
  return { version: 1, sessions: bucketOf(sessions) }
}

/** The stored map, or an empty one when the field is absent. */
function bucketOf(value) {
  return value && typeof value === 'object' && !Array.isArray(value) ? value : {}
}

export function writeDraftStore(store) {
  const ls = storage()
  if (!ls) return false
  try {
    ls.setItem(DRAFT_STORAGE_KEY, JSON.stringify(store))
    return true
  } catch {
    return false
  }
}

/** The unsaved composer draft of one scope (a workspace or a lone session). */
export function readScopeDrafts(key): ScopeDraft {
  const id = keyOf(key)
  const record = id ? readDraftStore().sessions[id] : null
  const linkedSessionId = normalizeLinkedSessionId(record?.linkedSessionId)
  return {
    add: typeof record?.add === 'string' ? record.add : '',
    attachments: normalizeAttachments(record?.attachments),
    workspaceId: typeof record?.workspaceId === 'string' ? record.workspaceId : undefined,
    ...(linkedSessionId === undefined ? {} : { linkedSessionId }),
  }
}

export function pruneDraftScope(store, key) {
  const record = store.sessions[key]
  if (!record) return
  const hasAdd = typeof record.add === 'string' && record.add.length > 0
  if (!hasAdd && !normalizeLinkedSessionId(record.linkedSessionId) && normalizeAttachments(record.attachments).length === 0) {
    delete store.sessions[key]
  }
}

/** Leave the link intact when omitted and remove it when explicitly null. */
export function saveAddDraft(
  key: string, text: string, attachments?: NoteAttachment[], workspaceId?: string | null, linkedSessionId?: string | null,
) {
  const id = keyOf(key)
  if (!id) return false
  const store = readDraftStore()
  const record = store.sessions[id] || {}
  const value = String(text || '').slice(0, MAX_TEXT)
  if (value) record.add = value
  else delete record.add
  if (attachments?.length) record.attachments = attachments
  else if (attachments) delete record.attachments
  if (workspaceId) record.workspaceId = workspaceId
  else if (workspaceId === null) delete record.workspaceId
  const previousLink = normalizeLinkedSessionId(record.linkedSessionId)
  const link = normalizeLinkedSessionId(linkedSessionId)
  if (link !== undefined) record.linkedSessionId = link
  else if (linkedSessionId === null) delete record.linkedSessionId
  const linkChanged = previousLink !== normalizeLinkedSessionId(record.linkedSessionId)
  // Inline editing is gone; retire an edit map left by an older version.
  delete record.edits
  store.sessions[id] = record
  pruneDraftScope(store, id)
  const written = writeDraftStore(store)
  if (written && (attachments || linkChanged)) notifyDraftAttachments(id)
  return written
}

export function clearAddDraft(key: string) {
  return saveAddDraft(key, '', [], null, null)
}

/**
 * Move a conversation's pre-workspace draft under the shared workspace key.
 *
 * Runs once per workspace: the draft the user is looking at becomes the shared
 * buffer, and the workspace members' per-session copies are retired so that
 * clearing the buffer cannot resurrect them. A no-op outside a workspace, once
 * the shared key exists, or when the legacy record has no draft to keep.
 */
export function ensureDraftScope(key, sessionId, sessionIds) {
  const target = keyOf(key)
  const source = keyOf(sessionId)
  if (!target || !source || target === source) return false
  const members = (Array.isArray(sessionIds) ? sessionIds : []).map(keyOf).filter(Boolean)
  const store = readDraftStore()
  if (store.sessions[target]) return false
  const legacy = store.sessions[source]
  if (!legacy || typeof legacy !== 'object' || Array.isArray(legacy)) return false

  const add = typeof legacy.add === 'string' ? legacy.add.slice(0, MAX_TEXT) : ''
  const attachments = normalizeAttachments(legacy.attachments)
  const linkedSessionId = normalizeLinkedSessionId(legacy.linkedSessionId)
  if (!add && attachments.length === 0 && linkedSessionId === undefined) return false

  store.sessions[target] = {
    ...(add ? { add } : {}),
    ...(attachments.length ? { attachments } : {}),
    ...(legacy.workspaceId ? { workspaceId: legacy.workspaceId } : {}),
    ...(linkedSessionId === undefined ? {} : { linkedSessionId }),
  }
  for (const member of members) delete store.sessions[member]
  // A stale workspace binding may not list the source; retire it regardless so
  // it cannot seed the shared key a second time.
  delete store.sessions[source]
  return writeDraftStore(store)
}
