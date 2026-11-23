import type { KvTable } from '@deepseek-ai/dsh-storage-domain'
import { MAX_SEEDED_SESSIONS } from './normalize.js'
import type { SessionRecord, WorkspaceRecord } from './store-spec.js'

export const UNASSIGNED_WORKSPACE_ID = 'sideby-note:unassigned'

/** Return no membership when the host registry cannot provide a complete projection. */
export function workspaceMembership(registry: unknown): Map<string, string> | undefined {
  if (!registry || typeof registry !== 'object' || !('list' in registry) || typeof registry.list !== 'function') {
    return undefined
  }

  let workspaces: unknown
  try {
    workspaces = registry.list()
  } catch {
    return undefined
  }
  if (!Array.isArray(workspaces)) return undefined

  const membership = new Map<string, string>()
  for (const entry of workspaces as unknown[]) {
    if (!entry || typeof entry !== 'object' || !('id' in entry) || typeof entry.id !== 'string' || !entry.id
      || !('sessionIds' in entry) || !Array.isArray(entry.sessionIds)) return undefined
    for (const id of entry.sessionIds as unknown[]) {
      if (typeof id !== 'string' || !id) return undefined
      membership.set(id, entry.id)
    }
  }
  return membership
}

export function workspaceForSession(membership: ReadonlyMap<string, string>, sessionId: string): string {
  return membership.get(sessionId) ?? UNASSIGNED_WORKSPACE_ID
}

type SessionTable = Pick<KvTable<string, SessionRecord>, 'get' | 'deleteMany'>
type WorkspaceTable = Pick<KvTable<string, WorkspaceRecord>, 'get' | 'put' | 'update'>

/** The caller serializes these operations with snapshots and note edits. */
export async function moveLegacySessions(
  sessions: SessionTable,
  workspaces: WorkspaceTable,
  workspaceId: string,
  sessionIds: Iterable<string>,
): Promise<{ record: WorkspaceRecord, migratedSessionIds: string[], changed: boolean }> {
  const current = workspaces.get(workspaceId)
  const items = [...(current?.items ?? [])]
  const visible = new Set(items.map(item => item.id))
  const seeded = new Set(current?.seededSessionIds)
  const migratedSessionIds = []
  for (const id of sessionIds) {
    const source = sessions.get(id)
    if (!source) continue
    migratedSessionIds.push(id)
    if (seeded.size < MAX_SEEDED_SESSIONS) seeded.add(id)
    // Seeding previously copied notes. Since then the session may have gained
    // new notes, while the workspace copy of an existing ID may have been edited.
    for (const item of source.items) {
      if (visible.has(item.id)) continue
      visible.add(item.id)
      items.push(item)
    }
  }

  const needsWorkspaceWrite = !current || items.length !== current.items.length
    || seeded.size > current.seededSessionIds.length
  const record = needsWorkspaceWrite
    ? { ...current, workspaceId, updatedAt: current?.updatedAt ?? Date.now(), items, seededSessionIds: [...seeded] }
    : current
  if (!current) await workspaces.put(workspaceId, record)
  else if (needsWorkspaceWrite) await workspaces.update(workspaceId, () => record)
  // Durable copy first. A retry after failed cleanup keeps the workspace copy
  // for duplicate IDs and can finish deleting the remaining source rows.
  if (migratedSessionIds.length > 0) await sessions.deleteMany(migratedSessionIds)
  return { record, migratedSessionIds, changed: needsWorkspaceWrite || migratedSessionIds.length > 0 }
}
