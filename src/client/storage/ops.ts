/**
 * Host mutations.
 *
 * Notes are written as a diff (`order` + changed `upserts` + removed ids) and
 * the host applies it atomically, so two tabs editing different rows merge
 * instead of replacing each other's whole list. The scope preference is
 * optimistic and rolls back on failure.
 */
import { postOp, type HostOpResult } from './host-client'
import { notifyStoreError } from './events'
import {
  applyHostPrefs,
  applyHostRecord,
  beginPending,
  broadcastHostChange,
  endPending,
  hostPrefs,
  hostRecord,
  setStorageFailure,
} from './state'

type TableName = 'sessions' | 'workspaces'

const chains = new Map<string, Promise<unknown>>()

function serialize<T>(key: string, task: () => Promise<T>): Promise<T> {
  const tail = chains.get(key) ?? Promise.resolve()
  const run = tail.then(task, task)
  chains.set(key, run.then(() => undefined, () => undefined))
  beginPending()
  return run.finally(endPending)
}

function report(error: unknown) {
  const failure = {
    code: typeof (error as any)?.code === 'string' ? (error as any).code : 'STORE_FAILED',
    message: error instanceof Error ? error.message : String(error),
  }
  setStorageFailure({ ...failure, status: (error as any)?.status })
  notifyStoreError(failure)
}

function tableFor(kind: 'workspace' | 'session'): TableName {
  return kind === 'workspace' ? 'workspaces' : 'sessions'
}

function sameJson(a: unknown, b: unknown) {
  return JSON.stringify(a) === JSON.stringify(b)
}

function toItems(record: any): any[] {
  return record && Array.isArray(record.items) ? record.items : []
}

/**
 * Persist the next ordered list for one scope.
 * @returns true when the host accepted (or nothing changed)
 */
export async function commitList(kind: 'workspace' | 'session', listKey: string, nextItems: any[]): Promise<boolean> {
  if (!listKey) return false
  const table = tableFor(kind)
  const current = hostRecord(table, listKey)
  const base = toItems(current)
  const baseById = new Map(base.map(item => [item.id, item]))
  const nextById = new Map(nextItems.map(item => [item.id, item]))
  const upserts = nextItems.filter(item => {
    const previous = baseById.get(item.id)
    return previous === undefined || !sameJson(previous, item)
  })
  const deletes = [...baseById.keys()].filter(id => !nextById.has(id))
  const order = nextItems.map(item => item.id)
  const sameOrder = order.length === base.length && base.every((item, index) => item.id === order[index])
  if (upserts.length === 0 && deletes.length === 0 && sameOrder) return true

  try {
    await serialize(`${table}:${listKey}`, async () => {
      const result = await postOp({ op: 'list.patch', kind, listKey, order, upserts, deletes })
      applyHostRecord(table, listKey, result.record)
      broadcastHostChange({ kind: 'record', name: table, key: listKey, value: result.record, rev: result.rev })
    })
    return true
  } catch (error) {
    // The caller already shows `saveFailed`; record the reason for Settings.
    const failure = {
      code: typeof (error as any)?.code === 'string' ? (error as any).code : 'STORE_FAILED',
      message: error instanceof Error ? error.message : String(error),
    }
    setStorageFailure({ ...failure, status: (error as any)?.status })
    return false
  }
}

/** Fold member sessions into a workspace list once, on the host. */
export async function ensureWorkspace(workspaceId: string, sessionIds: string[]): Promise<boolean> {
  if (!workspaceId) return false
  const current = hostRecord('workspaces', workspaceId)
  const seeded = new Set(Array.isArray(current?.seededSessionIds) ? current.seededSessionIds : [])
  const pendingMembers = (Array.isArray(sessionIds) ? sessionIds : []).filter(id => id && !seeded.has(id))
  if (current && pendingMembers.length === 0) return true
  try {
    await serialize(`workspaces:${workspaceId}`, async () => {
      const latest = hostRecord('workspaces', workspaceId)
      const seeded = new Set(Array.isArray(latest?.seededSessionIds) ? latest.seededSessionIds : [])
      if (latest && pendingMembers.every(id => seeded.has(id))) return
      const result = await postOp({
        op: 'list.ensure', workspaceId, sessionIds: Array.isArray(sessionIds) ? sessionIds : [],
      })
      applyHostRecord('workspaces', workspaceId, result.record)
      broadcastHostChange({ kind: 'record', name: 'workspaces', key: workspaceId, value: result.record, rev: result.rev })
    })
    return true
  } catch (error) {
    report(error)
    return false
  }
}

/** Merge user preferences on the host; optimistic with the same rollback rule. */
export function setPrefs(patch: { scopeMode: 'workspace' | 'session' }): boolean {
  const previous = hostPrefs()
  const next = { ...previous, ...patch, version: 1 }
  applyHostPrefs(next)

  void serialize('prefs', async () => {
    try {
      const result = await postOp({ op: 'prefs.set', patch })
      applyHostPrefs(result.prefs)
      broadcastHostChange({ kind: 'prefs', prefs: result.prefs, rev: result.rev })
    } catch (error) {
      if (sameJson(hostPrefs(), next)) applyHostPrefs(previous)
      report(error)
    }
  })
  return true
}

/** Upload the pre-switch browser store; safe to re-run after an interruption. */
export async function migrate(snapshot: unknown): Promise<HostOpResult> {
  return postOp({ op: 'migrate', snapshot, source: 'localStorage' })
}
