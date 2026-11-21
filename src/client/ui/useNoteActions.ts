/** Row actions: archive a note, reorder the open ones, take one back into the composer. */
import { moveOpenItem } from '../domain/items'

export function useNoteActions({ commit, report }) {
  /**
   * Archive one note. There is no manual toggle: a note is archived when it
   * has been put into the conversation, and only `takeBack` brings it back.
   * The stored shape keeps `done` / `completedAt`, so existing lists read as-is.
   */
  const archive = async item => {
    return commit(item.workspaceId, currentItems => currentItems.map(candidate => {
      if (candidate.id !== item.noteId || candidate.done) return candidate
      const now = Date.now()
      return { ...candidate, done: true, updatedAt: now, completedAt: now }
    }))
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
  const takeBack = async item => {
    const ok = await commit(item.workspaceId, currentItems => currentItems.filter(candidate => candidate.id !== item.noteId))
    if (!ok) {
      report('saveFailed')
      return false
    }
    return true
  }

  return { archive, move, takeBack }
}
