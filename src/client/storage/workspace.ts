/** Workspace note lists and migration of the browser's legacy session lists. */
import { WORKSPACE_STORAGE_KEY } from '../constants'
import { normalizeItems } from '../domain/items'
import { UNASSIGNED_WORKSPACE, type NoteWorkspace } from '../scope'
import { setAsideUnreadable, storage } from './codec'
import { notifyTodoChange } from './events'
import { mergeItems } from './merge'
import { commitList, ensureWorkspace } from './ops'
import { hostAuthoritative, hostRecord, hostTable, storageMode } from './state'
import { readSessionStore, writeSessionStore } from './session'

const text = value => (value ? String(value) : '')
const bucket = value => (value && typeof value === 'object' && !Array.isArray(value) ? value : {})

function seededOf(record) {
  const raw = record && record.seededSessionIds
  if (!Array.isArray(raw)) return []
  const seen = new Set()
  const next = []
  for (const value of raw) {
    const id = text(value)
    if (!id || seen.has(id)) continue
    seen.add(id)
    next.push(id)
  }
  return next
}

/** Empty workspace-note store. */
export function emptyWorkspaceStore() {
  return { version: 1, workspaces: {} as Record<string, any>, pendingSessionCleanup: [] as string[] }
}

/**
 * Read the browser workspace store; corrupt or unavailable reads as empty.
 * An unreadable payload is parked under `<key>.corrupt` before any write.
 */
function readLocalStore() {
  const ls = storage()
  if (!ls) return emptyWorkspaceStore()
  let raw
  try {
    raw = ls.getItem(WORKSPACE_STORAGE_KEY)
  } catch {
    return emptyWorkspaceStore()
  }
  if (!raw) return emptyWorkspaceStore()
  let parsed
  try {
    parsed = JSON.parse(raw)
  } catch {
    setAsideUnreadable(WORKSPACE_STORAGE_KEY, raw)
    return emptyWorkspaceStore()
  }
  const workspaces = parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? parsed.workspaces : undefined
  const broken = !parsed || typeof parsed !== 'object' || Array.isArray(parsed)
    || (workspaces !== undefined && (!workspaces || typeof workspaces !== 'object' || Array.isArray(workspaces)))
  if (broken) {
    setAsideUnreadable(WORKSPACE_STORAGE_KEY, raw)
    return emptyWorkspaceStore()
  }
  return {
    version: 1,
    workspaces: bucket(workspaces) as Record<string, any>,
    pendingSessionCleanup: Array.isArray(parsed.pendingSessionCleanup)
      ? parsed.pendingSessionCleanup.filter((id: unknown): id is string => typeof id === 'string')
      : [],
  }
}

/** Read the workspace-note store from the authoritative medium. */
export function readWorkspaceStore() {
  if (hostAuthoritative()) return { version: 1, workspaces: { ...hostTable('workspaces') } }
  return readLocalStore()
}

/** Persist the whole browser workspace store. */
export function writeWorkspaceStore(store) {
  const ls = storage()
  if (!ls) return false
  try {
    ls.setItem(WORKSPACE_STORAGE_KEY, JSON.stringify({
      version: 1,
      workspaces: bucket(store && store.workspaces),
      ...(store.pendingSessionCleanup?.length ? { pendingSessionCleanup: store.pendingSessionCleanup } : {}),
    }))
    notifyTodoChange()
    return true
  } catch {
    return false
  }
}

/** One workspace's memo record. */
export function readWorkspaceRecord(workspaceId) {
  const key = text(workspaceId)
  if (!key) return { items: [], updatedAt: 0, seededSessionIds: [] }
  if (hostAuthoritative()) {
    const record = hostRecord('workspaces', key)
    return {
      items: normalizeItems(record && record.items),
      updatedAt: record && Number.isFinite(record.updatedAt) ? record.updatedAt : 0,
      seededSessionIds: seededOf(record),
    }
  }
  const record = readLocalStore().workspaces[key]
  return {
    items: normalizeItems(record && record.items),
    updatedAt: record && Number.isFinite(record.updatedAt) ? record.updatedAt : 0,
    seededSessionIds: seededOf(record),
  }
}

/**
 * Persist one workspace's memo record.
 *
 * Host mode sends only the changed notes; the host merges them atomically.
 * Local mode reads the latest stored record and merges by id, keeping this
 * tab's deletions (`base`) from being resurrected by a concurrent writer.
 *
 * @returns resolution with whether the write was accepted/durable
 */
export async function writeWorkspaceRecord(workspaceId, record, base = null) {
  const key = text(workspaceId)
  if (!key) return false
  const mode = storageMode()
  if (mode === 'probing' || mode === 'error') return false
  if (mode === 'host') {
    return commitList(key, normalizeItems(record && record.items))
  }
  const store = readLocalStore()
  const previous = store.workspaces[key]
  const seededSource = Array.isArray(record.seededSessionIds) ? record : previous
  store.workspaces[key] = {
    workspaceId: key,
    updatedAt: Math.max(
      record.updatedAt || 0,
      previous && Number.isFinite(previous.updatedAt) ? previous.updatedAt : 0,
    ) || Date.now(),
    items: mergeItems(normalizeItems(previous && previous.items), normalizeItems(record.items), base),
    seededSessionIds: seededOf(seededSource),
  }
  return writeWorkspaceStore(store)
}

/** Migrate known memberships, with a recovery bucket for unassigned browser notes. */
export async function migrateWorkspaceNotes(workspaces: NoteWorkspace[]) {
  if (storageMode() === 'probing' || storageMode() === 'error') return
  const sessions = readSessionStore()
  if (Object.keys(sessions.sessions).length === 0) return
  const owners = new Map(workspaces.flatMap(workspace => workspace.sessionIds.map(id => [id, workspace.workspaceId] as const)))
  if (storageMode() === 'host') {
    const membersByWorkspace = new Map<string, string[]>()
    for (const id of Object.keys(sessions.sessions)) {
      const owner = owners.get(id) ?? UNASSIGNED_WORKSPACE
      const members = membersByWorkspace.get(owner)
      if (members) members.push(id)
      else membersByWorkspace.set(owner, [id])
    }
    for (const [workspaceId, members] of membersByWorkspace) {
      await ensureWorkspace(workspaceId, members)
    }
    return
  }
  if (storageMode() === 'local') moveBrowserSessions(sessions, owners)
}

function moveBrowserSessions(sessions: ReturnType<typeof readSessionStore>, owners: Map<string, string>) {
  const store = readLocalStore()
  const moved = new Set(store.pendingSessionCleanup)
  for (const [sessionId, source] of Object.entries(sessions.sessions)) {
    if (moved.has(sessionId)) continue
    const workspaceId = owners.get(sessionId) ?? UNASSIGNED_WORKSPACE
    const record = store.workspaces[workspaceId]
    const items = normalizeItems(record?.items)
    const seen = new Set(items.map(item => item.id))
    for (const item of normalizeItems(source?.items)) {
      if (seen.has(item.id)) continue
      seen.add(item.id)
      items.push(item)
    }
    store.workspaces[workspaceId] = {
      workspaceId,
      updatedAt: Math.max(record?.updatedAt || 0, source?.updatedAt || 0),
      items,
      seededSessionIds: [...new Set([...seededOf(record), sessionId])],
    }
    moved.add(sessionId)
  }
  // Save notes and the cleanup checkpoint together. Retrying a failed source
  // removal must not resurrect notes edited or removed after the first write.
  if (writeWorkspaceStore({ ...store, pendingSessionCleanup: [...moved] }) && writeSessionStore({ sessions: {} })) {
    writeWorkspaceStore({ ...store, pendingSessionCleanup: [] })
  }
}

/** Project the workspace filter or the aggregate view from the same records. */
export function readVisibleNotes(workspaceId: string | null) {
  const records = workspaceId ? [[workspaceId, readWorkspaceRecord(workspaceId)]] as const : Object.entries(readWorkspaceStore().workspaces)
  return records.flatMap(([owner, record]) => normalizeItems(record?.items).map(item => ({
    ...item,
    id: workspaceId ? item.id : JSON.stringify([owner, item.id]),
    noteId: item.id,
    workspaceId: owner,
  })))
}
