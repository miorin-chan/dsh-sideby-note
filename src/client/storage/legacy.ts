/**
 * The pre-switch browser store: migration payload and mode markers.
 *
 * Once the switch succeeds this data is never read as authority again; it is
 * kept untouched as the recovery source. The parser mirrors the old modules so
 * a hand-edited or older shape migrates as far as it can instead of failing.
 */
import {
  SCOPE_MODE_KEY,
  SESSION_STORAGE_KEY,
  STORAGE_MODE_KEY,
  STORAGE_NOTICE_KEY,
  STORAGE_NOTICE_MS,
  WORKSPACE_STORAGE_KEY,
} from '../constants'
import { storage } from './codec'

// AsideNote still uses these fields. Preserve them in the shared host file
// during migration even though Sideby Note does not use them in its UI.
const FORWARDED_STORAGE_KEY = 'dsh.aside-note.forwarded'
const SEND_SHORTCUT_KEY = 'dsh.aside-note.send-shortcut'
const FORWARD_PREFIX_STORAGE_KEY = 'dsh.aside-note.forward-prefix'

export interface LegacySnapshot {
  sessions: Record<string, any>
  workspaces: Record<string, any>
  forwarded: Record<string, any>
  prefs: { scopeMode?: 'workspace' | 'global'; sendShortcut?: 'enter' | 'ctrl-enter'; forwardPrefix?: string }
}

const bucket = (value: unknown) => (value && typeof value === 'object' && !Array.isArray(value) ? value as Record<string, any> : {})

function parse(raw: string | null): any {
  if (!raw) return undefined
  try {
    return JSON.parse(raw)
  } catch {
    return undefined
  }
}

function readItem(key: string): string | null {
  const ls = storage()
  if (!ls) return null
  try {
    return ls.getItem(key)
  } catch {
    return null
  }
}

function writeItem(key: string, value: string) {
  const ls = storage()
  if (!ls) return false
  try {
    ls.setItem(key, value)
    return true
  } catch {
    return false
  }
}

/** Read everything a one-time migration needs, in the old on-disk shapes. */
export function readLegacySnapshot(): LegacySnapshot {
  const sessionStore = parse(readItem(SESSION_STORAGE_KEY))
  const workspaceStore = parse(readItem(WORKSPACE_STORAGE_KEY))
  const forwardedStore = parse(readItem(FORWARDED_STORAGE_KEY))
  const prefs: LegacySnapshot['prefs'] = {}

  const scope = readItem(SCOPE_MODE_KEY)
  if (scope === 'workspace' || scope === 'global') prefs.scopeMode = scope
  const shortcut = readItem(SEND_SHORTCUT_KEY)
  if (shortcut === 'enter' || shortcut === 'ctrl-enter') prefs.sendShortcut = shortcut
  const prefix = readItem(FORWARD_PREFIX_STORAGE_KEY)
  if (typeof prefix === 'string') prefs.forwardPrefix = prefix.slice(0, 80)

  const pendingCleanup = new Set<string>(Array.isArray(workspaceStore?.pendingSessionCleanup) ? workspaceStore.pendingSessionCleanup : [])
  const sessions = Object.fromEntries(Object.entries(bucket(sessionStore?.sessions)).filter(([id]) => !pendingCleanup.has(id)))
  return {
    sessions,
    workspaces: bucket(workspaceStore?.workspaces),
    forwarded: bucket(forwardedStore?.sessions),
    prefs,
  }
}

/** Number of notes the migration would carry, for the success notice. */
export function legacyNoteCount(snapshot: LegacySnapshot): number {
  let count = 0
  for (const record of Object.values(snapshot.sessions)) {
    if (Array.isArray(record?.items)) count += record.items.length
  }
  for (const record of Object.values(snapshot.workspaces)) {
    if (Array.isArray(record?.items)) count += record.items.length
  }
  return count
}

/** True when the browser holds anything worth migrating. */
export function hasLegacyData(snapshot: LegacySnapshot): boolean {
  return legacyNoteCount(snapshot) > 0
    || Object.keys(snapshot.forwarded).length > 0
    || Object.keys(snapshot.prefs).length > 0
}

/** Whether this browser already switched to host storage. */
export function hostModeMarked(): boolean {
  return readItem(STORAGE_MODE_KEY) === 'host'
}

/** Remember the one-way switch. Best effort: clearing site data loses it. */
export function markHostMode() {
  return writeItem(STORAGE_MODE_KEY, 'host')
}

/**
 * Whether a failure notice should surface now. The same reason is throttled to
 * once per day so a broken host does not toast on every reload.
 */
export function shouldNoticeStorage(code: string): boolean {
  const saved = parse(readItem(STORAGE_NOTICE_KEY))
  if (!saved || typeof saved !== 'object') return true
  if (saved.code !== code) return true
  const at = Number(saved.at)
  return !Number.isFinite(at) || Date.now() - at >= STORAGE_NOTICE_MS
}

export function rememberStorageNotice(code: string) {
  writeItem(STORAGE_NOTICE_KEY, JSON.stringify({ code, at: Date.now() }))
}
