import { compareDoneItems, type Note } from './items'

export type ArchiveOrder = 'time' | 'workspace'
export type OpenOrder = ArchiveOrder | 'manual'
export type SectionOrders = { open: OpenOrder; done: ArchiveOrder }

export function normalizeArchiveOrder(value: unknown): ArchiveOrder {
  return value === 'workspace' ? 'workspace' : 'time'
}

export function normalizeOpenOrder(value: unknown): OpenOrder {
  return value === 'manual' ? 'manual' : normalizeArchiveOrder(value)
}

export function orderNotes<T extends Note & { workspaceId: string }>(
  notes: T[],
  section: keyof SectionOrders,
  order: OpenOrder,
  workspaceId: string | undefined,
  sessionId: string,
): T[] {
  const rows = notes.filter(note => note.done === (section === 'done'))
  const byTime = section === 'done' ? compareDoneItems : (a: T, b: T) => b.createdAt - a.createdAt
  if (order === 'time') return rows.sort(byTime)

  // Keep workspace groups contiguous and manual order intact within each group.
  const groups = new Map<string, T[]>()
  for (const note of rows) {
    const group = groups.get(note.workspaceId)
    if (group) group.push(note)
    else groups.set(note.workspaceId, [note])
  }
  const current = workspaceId === undefined ? [] : groups.get(workspaceId) ?? []
  if (workspaceId !== undefined) groups.delete(workspaceId)
  if (order === 'workspace') {
    const inSession = (note: T) => Boolean(sessionId && note.linkedSessionId === sessionId)
    current.sort((a, b) => Number(inSession(b)) - Number(inSession(a)) || byTime(a, b))
    for (const group of groups.values()) group.sort(byTime)
  }
  return [...current, ...Array.from(groups.values()).flatMap(group => group)]
}
