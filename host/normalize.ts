/**
 * Host-side normalization for note records.
 *
 * The browser half already normalizes before writing, but the host is the
 * durable boundary: a stale client, a hand-edited JSON file, or a migration
 * payload must not be able to store junk. The rules mirror
 * `src/client/domain/items.ts`; the contract test keeps the two in step.
 */
import { randomUUID } from 'node:crypto'
import { normalizeAttachments } from './attachment-metadata.js'
import type { ForwardedRecord, Note, SessionRecord, WorkspaceRecord } from './store-spec.js'

/** A note is meant to stay brief. */
export const MAX_TEXT = 280
/** How many member sessions one workspace may remember as merged. */
export const MAX_SEEDED_SESSIONS = 200

const text = (value: unknown) => (value ? String(value) : '')

function isFiniteNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value)
}

function newId() {
  try {
    return randomUUID()
  } catch {
    return `n-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`
  }
}

/** Sanitize one list's notes, preserving the authored order. */
export function normalizeItems(items: unknown): Note[] {
  if (!Array.isArray(items)) return []
  const seen = new Set<string>()
  const normalized: Note[] = []
  for (const raw of items as unknown[]) {
    if (!raw || typeof raw !== 'object') continue
    const item = raw as Record<string, unknown>
    const value = String(item.text || '').trim().slice(0, MAX_TEXT)
    const attachments = normalizeAttachments(item.attachments)
    if (!value && attachments.length === 0) continue
    let id = typeof item.id === 'string' && item.id ? item.id : newId()
    if (seen.has(id)) id = newId()
    seen.add(id)
    const done = item.done === true
    const createdAt = isFiniteNumber(item.createdAt) ? item.createdAt : Date.now()
    const updatedAt = isFiniteNumber(item.updatedAt) ? item.updatedAt : createdAt
    const linkedSessionId = typeof item.linkedSessionId === 'string' && item.linkedSessionId.trim() ? item.linkedSessionId : undefined
    normalized.push({
      id,
      text: value,
      done,
      createdAt,
      updatedAt,
      ...(done && isFiniteNumber(item.completedAt) ? { completedAt: item.completedAt } : {}),
      ...(attachments.length > 0 ? { attachments } : {}),
      ...(linkedSessionId === undefined ? {} : { linkedSessionId }),
    })
  }
  return normalized
}

/** One session's record, keyed by the session id it is stored under. */
export function normalizeSessionRecord(raw: unknown, sessionId: string): SessionRecord {
  const record = raw && typeof raw === 'object' && !Array.isArray(raw) ? raw as Record<string, unknown> : {}
  const key = text(sessionId) || text(record.sessionId)
  return {
    ...(key ? { sessionId: key } : {}),
    updatedAt: isFiniteNumber(record.updatedAt) ? record.updatedAt : Date.now(),
    items: normalizeItems(record.items),
  }
}

/** One workspace's record: its shared list plus the sessions already merged. */
export function normalizeWorkspaceRecord(raw: unknown, workspaceId: string): WorkspaceRecord {
  const record = raw && typeof raw === 'object' && !Array.isArray(raw) ? raw as Record<string, unknown> : {}
  const key = text(workspaceId) || text(record.workspaceId)
  const seeded: string[] = []
  const seen = new Set<string>()
  for (const value of Array.isArray(record.seededSessionIds) ? record.seededSessionIds : []) {
    const id = text(value)
    if (!id || seen.has(id)) continue
    seen.add(id)
    seeded.push(id)
    if (seeded.length >= MAX_SEEDED_SESSIONS) break
  }
  return {
    ...(key ? { workspaceId: key } : {}),
    updatedAt: isFiniteNumber(record.updatedAt) ? record.updatedAt : Date.now(),
    items: normalizeItems(record.items),
    seededSessionIds: seeded,
  }
}

/** Read the true flags in an upstream legacy forwarding record. */
export function normalizeForwardedRecord(raw: unknown): ForwardedRecord {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return {}
  const entries = Object.entries(raw as Record<string, unknown>)
  return Object.fromEntries(entries.filter((entry): entry is [string, true] => Boolean(entry[0]) && entry[1] === true))
}
