/**
 * Merge the note list another tab may have written with the one this tab holds.
 *
 * A whole-record write would otherwise overwrite whatever the other tab added
 * while this one was typing: two tabs, two additions, one survivor. Writes now
 * read the latest record first and union it with the incoming list:
 *
 *   - both sides keep their additions;
 *   - for the same id, the newer `updatedAt` wins;
 *   - ids this tab removed since its last read (`base`) stay removed.
 *
 * A deletion made in another tab is not observable from here, so a concurrent
 * write can bring that note back. Losing a note is worse than reviving one.
 *
 * The incoming list supplies the authored order. Notes unseen by this tab
 * remain present in their existing relative order.
 */
const stampOf = item => {
  if (item && Number.isFinite(item.updatedAt)) return item.updatedAt
  if (item && Number.isFinite(item.createdAt)) return item.createdAt
  return 0
}

/** Union two lists by id, honouring this tab's removals. */
export function mergeItems(existing, incoming, base = null) {
  const incomingIds = new Set(incoming.map(item => item && item.id).filter(Boolean))
  const removed = new Set()
  if (Array.isArray(base)) {
    for (const item of base) {
      if (item && item.id && !incomingIds.has(item.id)) removed.add(item.id)
    }
  }

  const byId = new Map()
  for (const item of existing) {
    if (item && item.id) byId.set(item.id, item)
  }
  for (const item of incoming) {
    if (!item || !item.id) continue
    const other = byId.get(item.id)
    if (!other || stampOf(item) >= stampOf(other)) byId.set(item.id, item)
  }
  for (const id of removed) byId.delete(id)

  const ordered = []
  for (const id of incomingIds) {
    const item = byId.get(id)
    if (!item) continue
    ordered.push(item)
    byId.delete(id)
  }
  return [...ordered, ...byId.values()]
}
