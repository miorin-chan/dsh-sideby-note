/** Row actions: archive a note, reorder the open ones, take one back into the composer. */
import { moveOpenItem } from '../domain/items'
import type { Note } from '../domain/items'
import type { WorkspaceNote } from './useSessionMemoStore'

function matchesNote(candidate: Note, item: WorkspaceNote) {
  return candidate.id === item.noteId && candidate.text === item.text
    && candidate.linkedSessionId === item.linkedSessionId
    && JSON.stringify(candidate.attachments ?? []) === JSON.stringify(item.attachments ?? [])
}

export function useNoteActions({ commit, report }) {
  /**
   * Archive one note. There is no manual toggle: a note is archived when it
   * has been put into the conversation, and only `takeBack` brings it back.
   * The stored shape keeps `done` / `completedAt`, so existing lists read as-is.
   */
  const archive = async item => {
    let matches = false
    const ok = await commit(item.workspaceId, currentItems => currentItems.map(candidate => {
      if (!matchesNote(candidate, item)) return candidate
      matches = true
      if (candidate.done) return candidate
      const now = Date.now()
      return { ...candidate, done: true, updatedAt: now, completedAt: now }
    }))
    return matches && ok
  }

  /** Move an open note to `toIndex` among the open notes; archived ones keep their order. */
  const move = async (item, toIndex) => {
    let changed = false
    const ok = await commit(item.workspaceId, currentItems => {
      const next = moveOpenItem(currentItems, item.noteId, toIndex)
      changed = next !== currentItems
      return next
    })
    if (!ok) report('saveFailed')
    return ok && changed
  }

  /**
   * Remove a note so its text can be recalled into the composer.
   *
   * A failed write keeps the row and its text exactly as they were; the
   * caller writes the recalled text only after this succeeds.
   */
  const takeBack = async (item: WorkspaceNote) => {
    let removed = false
    const ok = await commit(item.workspaceId, currentItems => currentItems.filter(candidate => {
      if (!matchesNote(candidate, item)) return true
      removed = true
      return false
    }))
    if (!ok || !removed) report('saveFailed')
    return ok && removed
  }

  const setSessionBinding = async (item: WorkspaceNote, linkedSessionId: string | null) => {
    let matched = false
    const ok = await commit(item.workspaceId, currentItems => currentItems.map(candidate => {
      if (candidate.id !== item.noteId || candidate.linkedSessionId !== item.linkedSessionId) return candidate
      matched = true
      const { linkedSessionId: _previous, ...note } = candidate
      return { ...note, ...(linkedSessionId ? { linkedSessionId } : {}), updatedAt: Date.now() }
    })).catch(() => false)
    if (!ok || !matched) report('saveFailed')
    return ok && matched
  }

  return { archive, move, takeBack, setSessionBinding }
}
