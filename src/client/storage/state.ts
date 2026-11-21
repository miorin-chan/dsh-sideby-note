/**
 * Browser-side storage state shared by the facade modules.
 *
 * Two sources coexist by design: `localStorage` (the device-local state and
 * the pre-switch fallback) and the in-memory host snapshot. Reads stay
 * synchronous, so the UI keeps its current shape; this module is the single
 * place that answers "which one is authoritative right now".
 */
import { notifyTodoChange } from './events'
import { fetchSnapshot, HostRequestError, type HostSnapshot } from './host-client'

export type StorageMode = 'probing' | 'host' | 'local' | 'error'

export interface HostFailure {
  code: string
  message: string
  status?: number
}

type HostTable = 'sessions' | 'workspaces'

let mode: StorageMode = 'probing'
let data: HostSnapshot | null = null
let failure: HostFailure | null = null
let pendingWrites = 0
let refreshRequested = false
let refreshing = false

let channel: BroadcastChannel | null = null
let listening = false

/** Current mode; `probing` means boot has not decided yet. */
export function storageMode(): StorageMode {
  return mode
}

/** True while the host is (or must be) the only source: `host` and the error state after it. */
export function hostAuthoritative(): boolean {
  return mode === 'host' || mode === 'error'
}

export function setStorageMode(next: StorageMode) {
  mode = next
  if (next === 'host') void refreshHost()
}

/** The last host failure, for in-panel diagnostics. */
export function storageFailure(): HostFailure | null {
  return failure
}

export function setStorageFailure(next: HostFailure | null) {
  failure = next
}

/** Connection failures are actionable even while the last host snapshot is readable. */
export function isHostConnectionFailure(value: HostFailure | null): boolean {
  return value != null && (
    value.code === 'STORE_UNREACHABLE' || value.code === 'STORE_TIMEOUT' || value.code === 'STORE_IN_USE'
    || value.status === 403 || value.status === 404 || value.status === 503
  )
}

/** Replace the cache with a fresh host snapshot. */
export function hydrateHost(next: HostSnapshot) {
  data = next
}

/** One host table, or an empty map. */
export function hostTable(name: HostTable): Record<string, any> {
  return data?.[name] ?? {}
}

/** One host record, or undefined. */
export function hostRecord(name: HostTable, key: string) {
  if (!key) return undefined
  return hostTable(name)[key]
}

/** Host preferences (user intent that travels with the notes). */
export function hostPrefs(): Record<string, any> {
  return data?.prefs ?? {}
}

/** Merge one record into the cache and wake same-tab readers. */
export function applyHostRecord(name: HostTable, key: string, value: any) {
  if (!data || !key) return
  if (value === undefined) delete data[name][key]
  else data[name][key] = value
  notifyTodoChange()
}

/** Replace cached preferences and wake readers. */
export function applyHostPrefs(prefs: Record<string, any>) {
  if (!data) return
  data.prefs = prefs && typeof prefs === 'object' ? prefs : {}
  notifyTodoChange()
}

/** Include the local cache update or rollback in the lifetime of a write. */
export function beginPending() {
  pendingWrites += 1
  if (refreshing) refreshRequested = true
}

export function endPending() {
  pendingWrites -= 1
  void refreshHost()
}

async function refreshHost() {
  if (mode !== 'host' || pendingWrites !== 0 || refreshing || !refreshRequested) return
  refreshing = true
  refreshRequested = false
  const previousFailure = failure
  try {
    const { data: snapshot } = await fetchSnapshot()
    // A write or notification during GET can make even a successful response stale.
    if (mode === 'host' && !refreshRequested) {
      hydrateHost(snapshot)
      if (failure === previousFailure && isHostConnectionFailure(failure)) setStorageFailure(null)
      notifyTodoChange()
    }
  } catch (error) {
    // Keep the last usable view. The next notification can try again.
    if (mode === 'host' && !refreshRequested && error instanceof HostRequestError && isHostConnectionFailure(error)) {
      setStorageFailure(error)
      notifyTodoChange()
    }
  } finally {
    refreshing = false
    if (refreshRequested) void refreshHost()
  }
}

function ensureChannel(): BroadcastChannel | null {
  if (channel) return channel
  if (typeof BroadcastChannel !== 'function') return null
  try {
    channel = new BroadcastChannel('dsh-aside-note')
  } catch {
    channel = null
  }
  return channel
}

type HostChange = { kind: 'record'; name: HostTable; key: string; value: any; rev?: number }
  | { kind: 'prefs'; prefs: Record<string, any>; rev?: number }

/** Older tabs consume the payload. Sideby Note treats it as a signal to refetch. */
export function broadcastHostChange(change: HostChange) {
  ensureChannel()?.postMessage(change)
}

/** Schedule a fresh read without racing pending writes. */
export function requestHostRefresh() {
  refreshRequested = true
  void refreshHost()
}

/**
 * Listen for same-browser tab updates once. BroadcastChannel is optional (jsdom
 * and older runtimes), so a missing implementation only loses that nicety.
 */
export function startCrossTabSync() {
  if (listening) return
  const bus = ensureChannel()
  if (!bus) return
  listening = true
  bus.onmessage = event => {
    const message = event?.data
    if (mode === 'local' || (message?.kind !== 'prefs' && message?.kind !== 'record')) return
    // Notifications can arrive out of order. Always read the host.
    requestHostRefresh()
  }
}
