/**
 * Same-tab change bus plus storage lifecycle notifications.
 *
 * The `storage` event only crosses tabs, so a write here wakes the readers in
 * this tab — the header count and an open panel. Host-backed storage has no
 * `storage` event at all, so the host cache notifies through the same bus and
 * adds two lifecycle channels: "the mode is decided / data hydrated" and
 * "a storage operation failed".
 */

/** Same-tab subscribers, so the composer dock's count follows panel edits. */
export const TODO_LISTENERS = new Set<() => void>()

/** Listeners told once the storage mode is decided (host hydrated, or local chosen). */
export const STORE_READY_LISTENERS = new Set<() => void>()

/** Listeners told about a failed host read or write worth surfacing as a Toast. */
export const STORE_ERROR_LISTENERS = new Set<(failure: { code: string; message: string }) => void>()

/** One-time switch notices: migrated, kept-local, or "not switched" with a reason code. */
export type StoreNotice =
  | { kind: 'migrated'; count: number }
  | { kind: 'keptLocal' }
  | { kind: 'notSwitched'; code: string }

/** Listeners told about a completed or refused switch (translated by the UI). */
export const STORE_NOTICE_LISTENERS = new Set<(notice: StoreNotice) => void>()

/** Notify same-tab readers after a successful write (storage events only cross tabs). */
export function notifyTodoChange() {
  for (const listener of TODO_LISTENERS) {
    try {
      listener()
    } catch (error) {
      console.error('dsh-sideby-note: listener failed', error)
    }
  }
}

/** Announce that the storage mode is decided and the cache is usable. */
export function notifyStoreReady() {
  for (const listener of STORE_READY_LISTENERS) {
    try {
      listener()
    } catch (error) {
      console.error('dsh-sideby-note: ready listener failed', error)
    }
  }
}

/** Announce a switch outcome; the panel turns it into a Toast. */
export function notifyStoreNotice(notice: StoreNotice) {
  for (const listener of STORE_NOTICE_LISTENERS) {
    try {
      listener(notice)
    } catch (error) {
      console.error('dsh-sideby-note: notice listener failed', error)
    }
  }
}

/** Announce a failed storage operation; the panel turns it into a Toast. */
export function notifyStoreError(failure: { code: string; message: string }) {
  for (const listener of STORE_ERROR_LISTENERS) {
    try {
      listener(failure)
    } catch (error) {
      console.error('dsh-sideby-note: error listener failed', error)
    }
  }
}
