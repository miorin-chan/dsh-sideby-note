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

/** A note is meant to stay brief. */
export const MAX_TEXT = 280
/** How many member sessions one workspace may remember as merged. */
export const MAX_SEEDED_SESSIONS = 200

const text = value => (value ? String(value) : '')

function newId() {
  try {
    return randomUUID()
  } catch {
    return `n-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`
  }
}

/** Sanitize one list's notes, preserving the authored order. */
export function normalizeItems(items) {
  if (!Array.isArray(items)) return []
  const seen = new Set()
  const normalized = []
  for (const raw of items) {
    if (!raw || typeof raw !== 'object') continue
    const value = String(raw.text || '').trim().slice(0, MAX_TEXT)
    const attachments = normalizeAttachments(raw.attachments)
    if (!value && attachments.length === 0) continue
    let id = typeof raw.id === 'string' && raw.id ? raw.id : newId()
    if (seen.has(id)) id = newId()
    seen.add(id)
    const done = raw.done === true
    const createdAt = Number.isFinite(raw.createdAt) ? raw.createdAt : Date.now()
    const updatedAt = Number.isFinite(raw.updatedAt) ? raw.updatedAt : createdAt
    normalized.push({
      id,
      text: value,
      done,
      createdAt,
      updatedAt,
      ...(done && Number.isFinite(raw.completedAt) ? { completedAt: raw.completedAt } : {}),
      ...(attachments.length > 0 ? { attachments } : {}),
    })
  }
  return normalized
}

/** One session's record, keyed by the session id it is stored under. */
export function normalizeSessionRecord(raw, sessionId) {
  const record = raw && typeof raw === 'object' && !Array.isArray(raw) ? raw : {}
  const key = text(sessionId) || text(record.sessionId)
  return {
    ...(key ? { sessionId: key } : {}),
    updatedAt: Number.isFinite(record.updatedAt) ? record.updatedAt : Date.now(),
    items: normalizeItems(record.items),
  }
}

/** One workspace's record: its shared list plus the sessions already merged. */
export function normalizeWorkspaceRecord(raw, workspaceId) {
  const record = raw && typeof raw === 'object' && !Array.isArray(raw) ? raw : {}
  const key = text(workspaceId) || text(record.workspaceId)
  const seeded = []
  const seen = new Set()
  for (const value of Array.isArray(record.seededSessionIds) ? record.seededSessionIds : []) {
    const id = text(value)
    if (!id || seen.has(id)) continue
    seen.add(id)
    seeded.push(id)
    if (seeded.length >= MAX_SEEDED_SESSIONS) break
  }
  return {
    ...(key ? { workspaceId: key } : {}),
    updatedAt: Number.isFinite(record.updatedAt) ? record.updatedAt : Date.now(),
    items: normalizeItems(record.items),
    seededSessionIds: seeded,
  }
}

/** Read the true flags in an upstream legacy forwarding record. */
export function normalizeForwardedRecord(raw) {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return {}
  return Object.fromEntries(Object.entries(raw).filter(([itemId, flag]) => itemId && flag === true))
}
