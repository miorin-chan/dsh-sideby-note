/**
 * The unsaved composer draft, so closing the panel never loses text.
 *
 * Records are keyed by draft scope, not by conversation: inside a workspace
 * every member session shares one buffer (`ws:<workspaceId>`), so switching
 * conversations or the workspace/session scope never strands half-typed text.
 * A session outside a workspace keeps its own key. Saving still writes the
 * list selected at that moment. The map field stays `sessions` so the existing
 * store keeps its shape.
 */
import { DRAFT_STORAGE_KEY, MAX_TEXT } from '../constants'
import { setAsideUnreadable, storage } from './codec'

const keyOf = value => (value ? String(value) : '')

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
  if (!ls) return
  try {
    ls.setItem(DRAFT_STORAGE_KEY, JSON.stringify(store))
  } catch {
    /* storage is best effort */
  }
}

/** The unsaved composer draft of one scope (a workspace or a lone session). */
export function readScopeDrafts(key) {
  const id = keyOf(key)
  const record = id ? readDraftStore().sessions[id] : null
  if (!record || typeof record !== 'object' || Array.isArray(record)) return { add: '' }
  return { add: typeof record.add === 'string' ? record.add : '' }
}

export function pruneDraftScope(store, key) {
  const record = store.sessions[key]
  if (!record) return
  const hasAdd = typeof record.add === 'string' && record.add.length > 0
  if (!hasAdd) delete store.sessions[key]
}

export function saveAddDraft(key, text) {
  const id = keyOf(key)
  if (!id) return
  const store = readDraftStore()
  const record = store.sessions[id] || {}
  const value = String(text || '').slice(0, MAX_TEXT)
  if (value) record.add = value
  else delete record.add
  // Inline editing is gone; retire an edit map left by an older version.
  delete record.edits
  store.sessions[id] = record
  pruneDraftScope(store, id)
  writeDraftStore(store)
}

export function clearAddDraft(key) {
  saveAddDraft(key, '')
}

/**
 * Move a conversation's pre-workspace draft under the shared workspace key.
 *
 * Runs once per workspace: the draft the user is looking at becomes the shared
 * buffer, and the workspace members' per-session copies are retired so that
 * clearing the buffer cannot resurrect them. A no-op outside a workspace, once
 * the shared key exists, or when the legacy record holds no text.
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
  if (!add) return false

  store.sessions[target] = { add }
  for (const member of members) delete store.sessions[member]
  // A stale workspace binding may not list the source; retire it regardless so
  // it cannot seed the shared key a second time.
  delete store.sessions[source]
  writeDraftStore(store)
  return true
}
