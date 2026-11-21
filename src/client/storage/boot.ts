/**
 * The one-time decision: switch this browser's notes to host storage or stay
 * on localStorage.
 *
 * Rules (docs/design/host-storage-migration.md §7.1/§7.5):
 * - probe before deciding; an unavailable host means "don't switch", keep
 *   working locally, notify, and retry on the next load;
 * - migrate only after a successful open, and write the one-way marker only
 *   after the data is durable;
 * - after the switch the host is authoritative: a later outage is an error
 *   state, never a silent fallback that would fork the data.
 */
import { fetchSnapshot } from './host-client'
import { migrate } from './ops'
import {
  hasLegacyData,
  hostModeMarked,
  legacyNoteCount,
  markHostMode,
  readLegacySnapshot,
  rememberStorageNotice,
  shouldNoticeStorage,
} from './legacy'
import { notifyStoreError, notifyStoreNotice, notifyStoreReady } from './events'
import {
  hydrateHost,
  setStorageFailure,
  setStorageMode,
  startCrossTabSync,
  storageMode,
  type HostFailure,
  type StorageMode,
} from './state'

let booting: Promise<StorageMode> | null = null
let inFlight = false

function failureOf(error: unknown): HostFailure {
  const code = typeof (error as any)?.code === 'string' ? (error as any).code : 'STORE_FAILED'
  return {
    code,
    message: error instanceof Error ? error.message : String(error),
    status: (error as any)?.status,
  }
}

function refuse(failure: HostFailure): StorageMode {
  const readOnly = storageMode() === 'error' || hostModeMarked() || failure.code === 'STORE_IN_USE'
  const mode = readOnly ? 'error' : 'local'
  setStorageFailure(failure)
  setStorageMode(mode)
  notifyStoreReady()
  if (shouldNoticeStorage(failure.code)) {
    rememberStorageNotice(failure.code)
    if (readOnly) notifyStoreError({ code: failure.code, message: failure.message })
    else notifyStoreNotice({ kind: 'notSwitched', code: failure.code })
  }
  return mode
}

async function runBoot(): Promise<StorageMode> {
  startCrossTabSync()
  const marked = hostModeMarked()

  // Already switched: the host is the only truth. No localStorage fallback.
  if (marked) {
    try {
      const snapshot = await fetchSnapshot()
      hydrateHost(snapshot.data)
      setStorageFailure(null)
      setStorageMode('host')
      notifyStoreReady()
      return 'host'
    } catch (error) {
      return refuse(failureOf(error))
    }
  }

  let snapshot
  try {
    snapshot = await fetchSnapshot()
  } catch (error) {
    return refuse(failureOf(error))
  }

  // Take the legacy snapshot after the probe succeeds. Note writes remain
  // blocked until the new authoritative snapshot is ready.
  const legacy = readLegacySnapshot()
  const incomplete = snapshot.data.prefs?.migration?.complete === false
  const localNoteCount = legacyNoteCount(legacy)

  try {
    if (incomplete || snapshot.empty) {
      // A previous attempt may have stopped midway; re-sending is idempotent.
      if (hasLegacyData(legacy)) {
        const result = await migrate(legacy)
        snapshot = await fetchSnapshot()
        if (result.keptLocal && localNoteCount > 0) notifyStoreNotice({ kind: 'keptLocal' })
        else if (!result.alreadyComplete && result.notesMigrated > 0) {
          notifyStoreNotice({ kind: 'migrated', count: result.notesMigrated })
        }
      }
    } else if (localNoteCount > 0) {
      notifyStoreNotice({ kind: 'keptLocal' })
    }
  } catch (error) {
    return refuse(failureOf(error))
  }

  hydrateHost(snapshot.data)
  markHostMode()
  setStorageFailure(null)
  setStorageMode('host')
  notifyStoreReady()
  return 'host'
}

/** Decide once per page load; later callers share the same promise. */
export function bootStorage(): Promise<StorageMode> {
  if (!booting) return startBoot()
  return booting
}

/** Force a new probe (settings retry button). */
export function retryStorage(): Promise<StorageMode> {
  if (inFlight) return bootStorage()
  if (storageMode() === 'local') setStorageMode('probing')
  return startBoot()
}

function startBoot(): Promise<StorageMode> {
  inFlight = true
  booting = runBoot()
    .catch(error => refuse(failureOf(error)))
    .finally(() => { inFlight = false })
  return booting
}

/** Current mode without waiting. */
export function currentStorageMode(): StorageMode {
  return storageMode()
}
