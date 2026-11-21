/** The browser store, or null when storage is blocked. */
export function storage() {
  try {
    return window.localStorage
  } catch {
    return null
  }
}

/** Suffix appended to a store key when its payload could not be read. */
export const CORRUPT_SUFFIX = '.corrupt'

/**
 * Keep an unreadable payload beside its key before anything overwrites it.
 *
 * Notes only exist in this browser, so a bad parse must not be allowed to turn
 * into silent data loss: the raw string is parked under `<key>.corrupt` and the
 * store continues from empty. Best effort — when storage itself is blocked or
 * full there is nowhere to keep the copy.
 *
 * Repeated reads of the same damage do not rewrite the backup.
 */
export function setAsideUnreadable(key: string, raw: string): boolean {
  const ls = storage()
  if (!ls) return false
  try {
    const backupKey = `${key}${CORRUPT_SUFFIX}`
    const previous = ls.getItem(backupKey)
    if (previous) {
      try {
        const parsed = JSON.parse(previous)
        if (parsed && parsed.raw === raw) return true
      } catch {
        /* an unreadable backup is replaced by the newer payload */
      }
    }
    ls.setItem(backupKey, JSON.stringify({ at: Date.now(), raw }))
    return true
  } catch {
    return false
  }
}
