/** The filtered view and a serialized writer for workspace records. */
import React from 'react'
import { SESSION_STORAGE_KEY, WORKSPACE_STORAGE_KEY } from '../constants'
import { normalizeItems } from '../domain/items'
import { STORE_READY_LISTENERS, TODO_LISTENERS } from '../storage/events'
import { storageMode } from '../storage/state'
import { readVisibleNotes, readWorkspaceRecord, writeWorkspaceRecord } from '../storage/workspace'

export type WorkspaceNote = ReturnType<typeof readVisibleNotes>[number]
type NoteUpdater = (items: ReturnType<typeof normalizeItems>) => ReturnType<typeof normalizeItems>

export function useMemoStore(workspaceFilter: string | null) {
  const filterRef = React.useRef(workspaceFilter)
  filterRef.current = workspaceFilter
  const [items, setItems] = React.useState(() => readVisibleNotes(workspaceFilter))
  const [syncError, setSyncError] = React.useState(false)
  const chainRef = React.useRef<Promise<unknown>>(Promise.resolve())

  React.useLayoutEffect(() => {
    setItems(readVisibleNotes(workspaceFilter))
    setSyncError(false)
  }, [workspaceFilter])

  React.useEffect(() => {
    const refresh = () => setItems(readVisibleNotes(filterRef.current))
    const onStorage = (event: StorageEvent) => {
      if (event.key === SESSION_STORAGE_KEY || event.key === WORKSPACE_STORAGE_KEY || event.key === null) refresh()
    }
    const onReady = () => {
      refresh()
      if (storageMode() === 'host') setSyncError(false)
    }
    TODO_LISTENERS.add(refresh)
    STORE_READY_LISTENERS.add(onReady)
    window.addEventListener('storage', onStorage)
    return () => {
      TODO_LISTENERS.delete(refresh)
      STORE_READY_LISTENERS.delete(onReady)
      window.removeEventListener('storage', onStorage)
    }
  }, [])

  const commit = React.useCallback((workspaceId: string, update: NoteUpdater) => {
    const run = chainRef.current.then(async () => {
      const current = readWorkspaceRecord(workspaceId)
      const next = { ...current, items: normalizeItems(update(current.items)), updatedAt: Date.now() }
      const ok = await writeWorkspaceRecord(workspaceId, next, current.items)
      setSyncError(!ok)
      if (ok) setItems(readVisibleNotes(filterRef.current))
      return ok
    })
    chainRef.current = run.catch(() => undefined)
    return run
  }, [])

  return { items, syncError, commit }
}
