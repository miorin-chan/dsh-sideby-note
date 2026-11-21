/**
 * The host-side note store.
 *
 * This module opens the `aside_note` domain lazily through `ctx.storageDomain`,
 * serves snapshots, and serializes mutations so two tabs editing different
 * notes cannot overwrite each other's records. DSH grants one owner for this
 * domain, which uses the same durable schema as AsideNote.
 */
import { DOMAIN_NAME, TABLES } from './constants.js'
import {
  normalizeForwardedRecord,
  normalizeItems,
  normalizeSessionRecord,
  normalizeWorkspaceRecord,
} from './normalize.js'
import { moveLegacySessions, UNASSIGNED_WORKSPACE_ID, workspaceForSession, workspaceMembership } from './workspace-migration.js'

/** Stable failure vocabulary shared with the browser route. */
export class StoreError extends Error {
  /**
   * @param {string} code stable machine code
   * @param {string} message diagnostic prose
   * @param {number} [status] HTTP status the route maps to
   */
  constructor(code, message, status = 502) {
    super(message)
    this.name = 'StoreError'
    this.code = code
    this.status = status
    this.retryable = status === 503 || status === 502
  }
}

const OPEN_ATTEMPTS = 3
const OPEN_RETRY_MS = 80

const delay = ms => new Promise(resolve => setTimeout(resolve, ms))
const text = value => (value ? String(value) : '')

function bad(message) {
  return new StoreError('STORE_BAD_REQUEST', message, 400)
}

function tableObject(table) {
  return Object.fromEntries(table.entries())
}

function isEmptySnapshot(data) {
  return Object.keys(data.sessions).length === 0
    && Object.keys(data.workspaces).length === 0
    && Object.keys(data.forwarded).length === 0
    && data.prefs?.migration === undefined
}

/**
 * Create the store bound to one plugin context.
 * @param {{ get?: (name: string) => unknown }} ctx host context
 */
export function createStore(ctx) {
  return new Store(ctx)
}

class Store {
  /** @param {{ get?: (name: string) => unknown }} ctx */
  constructor(ctx) {
    this.ctx = ctx
    this.domain = undefined
    this.opening = undefined
    this.rev = 0
    this.closed = false
    /** Serializes read-modify-write mutations before they reach the domain chain. */
    this.chain = Promise.resolve()
  }

  /** Open (or reuse) the domain; rejects with a StoreError. */
  async ready() {
    return this.#domain()
  }

  /** Whole-domain snapshot for the browser's initial hydration. */
  async snapshot() {
    return this.#serialize(async () => {
      const domain = await this.#domain()
      await this.#migrateRegisteredSessions(domain)
      const data = {
        sessions: tableObject(domain.table(TABLES.sessions)),
        workspaces: tableObject(domain.table(TABLES.workspaces)),
        forwarded: tableObject(domain.table(TABLES.forwarded)),
        prefs: domain.global.get() || {},
      }
      return {
        rev: this.rev,
        empty: isEmptySnapshot(data),
        data: structuredClone(data),
      }
    })
  }

  /** Apply one browser mutation. @param {any} op */
  async apply(op) {
    return this.#serialize(() => this.#apply(op))
  }

  #serialize(task) {
    if (this.closed) throw new StoreError('STORE_UNAVAILABLE', 'the note store is closed', 503)
    const run = this.chain.then(task)
    this.chain = run.then(() => undefined, () => undefined)
    return run
  }

  /** Release the domain; safe to call repeatedly. */
  async close() {
    this.closed = true
    const domain = this.domain
    this.domain = undefined
    const opening = this.opening
    this.opening = undefined
    if (domain) {
      try {
        await domain.close()
      } catch {
        // A domain already gone is not a failure to report.
      }
    } else {
      await opening?.catch(() => undefined)
    }
  }

  async #domain() {
    if (this.closed) throw new StoreError('STORE_UNAVAILABLE', 'the note store is closed', 503)
    if (this.domain) return this.domain
    if (!this.opening) {
      this.opening = this.#open().then(async domain => {
        // Disposal can land while the domain is still opening; release it
        // instead of leaking an open unit after the plugin is gone.
        if (this.closed) {
          await domain.close().catch(() => undefined)
          throw new StoreError('STORE_UNAVAILABLE', 'the note store is closed', 503)
        }
        this.domain = domain
        return domain
      }).catch(error => {
        this.opening = undefined
        throw error
      })
    }
    return this.opening
  }

  async #open() {
    const facility = typeof this.ctx?.get === 'function' ? this.ctx.get('storageDomain') : undefined
    if (!facility || typeof facility.open !== 'function') {
      throw new StoreError('STORE_UNAVAILABLE', 'storage is not mounted in this profile', 503)
    }
    // Loaded lazily so a missing schema library degrades to STORE_UNAVAILABLE
    // without taking the update routes down with it.
    let createSpec
    try {
      ({ createSpec } = await import('./store-spec.js'))
    } catch (error) {
      throw new StoreError('STORE_UNAVAILABLE', `note schema is unavailable (${error?.message ?? error})`, 503)
    }
    let lastError
    for (let attempt = 0; attempt < OPEN_ATTEMPTS; attempt += 1) {
      try {
        return await facility.open(createSpec())
      } catch (error) {
        lastError = error
        // A hot re-apply can race the previous store's asynchronous close.
        if (error?.code !== 'already-open') break
        if (attempt + 1 < OPEN_ATTEMPTS) await delay(OPEN_RETRY_MS)
      }
    }
    if (lastError?.code === 'already-open') {
      throw new StoreError('STORE_IN_USE', `${DOMAIN_NAME}.json is already open in another plugin`, 503)
    }
    const reason = lastError?.code ?? (lastError instanceof Error ? lastError.message : 'open failed')
    throw new StoreError('STORE_OPEN_FAILED', `${DOMAIN_NAME}.json cannot be opened (${reason})`, 503)
  }

  async #apply(op) {
    if (!op || typeof op !== 'object' || Array.isArray(op)) throw bad('operation body must be an object')
    const domain = await this.#domain()
    switch (op.op) {
      case 'list.patch':
        return this.#patchList(domain, op)
      case 'list.ensure':
        return this.#ensureWorkspace(domain, op)
      case 'prefs.set':
        return this.#setPrefs(domain, op)
      case 'migrate':
        return this.#migrate(domain, op)
      default:
        throw bad(`unknown operation '${String(op.op)}'`)
    }
  }

  async #patchList(domain, op) {
    const key = text(op.listKey)
    if (!key) throw bad('listKey is required')
    if (op.kind !== 'workspace') throw bad("kind must be 'workspace'")
    const table = domain.table(TABLES.workspaces)
    // Finish any staged move to this list before applying deletions or edits.
    // Otherwise a later cleanup retry could restore an item just deleted here.
    await this.#migrateRegisteredSessions(domain, key)

    const deletes = new Set((Array.isArray(op.deletes) ? op.deletes : []).map(text).filter(Boolean))
    const upserts = Array.isArray(op.upserts) ? normalizeItems(op.upserts) : []
    const order = (Array.isArray(op.order) ? op.order : []).map(text).filter(Boolean)
    const current = table.get(key)
    const byId = new Map(normalizeItems(current?.items).map(item => [item.id, item]))
    for (const id of deletes) byId.delete(id)
    for (const item of upserts) byId.set(item.id, item)

    const ordered = []
    const seen = new Set()
    for (const id of order) {
      const item = byId.get(id)
      if (!item || seen.has(id)) continue
      seen.add(id)
      ordered.push(item)
    }
    // Items another tab added while this patch was in flight are kept; the
    // sender's order only decides position, never deletion by omission.
    for (const item of byId.values()) {
      if (seen.has(item.id)) continue
      seen.add(item.id)
      ordered.push(item)
    }

    const next = normalizeWorkspaceRecord({ ...current, items: ordered, updatedAt: Date.now() }, key)
    await writeRecord(table, key, current, next)
    this.rev += 1
    return { rev: this.rev, record: next }
  }

  async #ensureWorkspace(domain, op) {
    const workspaceId = text(op.workspaceId)
    if (!workspaceId) throw bad('workspaceId is required')
    const sessions = domain.table(TABLES.sessions)
    const workspaces = domain.table(TABLES.workspaces)
    const registry = this.ctx?.get?.('workspaceRegistry')
    const membership = workspaceMembership(registry)
    if (domain.global.get()?.migration?.complete === false || (registry && !membership && workspaceId === UNASSIGNED_WORKSPACE_ID)) {
      const record = normalizeWorkspaceRecord(workspaces.get(workspaceId), workspaceId)
      return { rev: this.rev, record, migratedSessionIds: [] }
    }

    const sessionIds = membership
      ? [...sessions.keys()].filter(id => workspaceForSession(membership, id) === workspaceId)
      : explicitMembers(op.sessionIds)
    return this.#moveSessions(sessions, workspaces, workspaceId, sessionIds)
  }

  async #moveSessions(sessions, workspaces, workspaceId, sessionIds) {
    const { record, migratedSessionIds, changed } = await moveLegacySessions(sessions, workspaces, workspaceId, sessionIds)
    if (changed) this.rev += 1
    return { rev: this.rev, record, migratedSessionIds }
  }

  async #migrateRegisteredSessions(domain, targetWorkspaceId) {
    const sessions = domain.table(TABLES.sessions)
    // Resume a pending browser import with its original source rows in place.
    if (sessions.size === 0 || domain.global.get()?.migration?.complete === false) return
    const membership = workspaceMembership(this.ctx?.get?.('workspaceRegistry'))
    if (!membership) return

    const byWorkspace = new Map()
    for (const id of sessions.keys()) {
      const workspaceId = workspaceForSession(membership, id)
      if (targetWorkspaceId && workspaceId !== targetWorkspaceId) continue
      const members = byWorkspace.get(workspaceId)
      if (members) members.push(id)
      else byWorkspace.set(workspaceId, [id])
    }
    const workspaces = domain.table(TABLES.workspaces)
    for (const [workspaceId, sessionIds] of byWorkspace) {
      await this.#moveSessions(sessions, workspaces, workspaceId, sessionIds)
    }
  }

  async #setPrefs(domain, op) {
    const patch = op.patch
    if (!patch || typeof patch !== 'object' || Array.isArray(patch)) throw bad('patch must be an object')
    const current = domain.global.get() || {}
    const next = { ...current, version: 1 }
    if (patch.scopeMode !== 'workspace' && patch.scopeMode !== 'global') {
      throw bad("scopeMode must be 'workspace' or 'global'")
    }
    next.sidebyNoteScopeMode = patch.scopeMode
    await domain.global.set(next)
    this.rev += 1
    return { rev: this.rev, prefs: next }
  }

  async #migrate(domain, op) {
    const snapshot = op.snapshot
    if (!snapshot || typeof snapshot !== 'object' || Array.isArray(snapshot)) throw bad('snapshot must be an object')
    const current = domain.global.get() || {}
    if (current.migration?.complete === true) {
      await this.#migrateRegisteredSessions(domain)
      return { rev: this.rev, migrated: 0, notesMigrated: 0, alreadyComplete: true }
    }
    const sessions = domain.table(TABLES.sessions)
    const workspaces = domain.table(TABLES.workspaces)
    const forwarded = domain.table(TABLES.forwarded)
    // Recheck under the store's operation queue in case the file gained data
    // since the browser fetched its snapshot.
    if (current.migration === undefined && (sessions.size || workspaces.size || forwarded.size)) {
      return { rev: this.rev, migrated: 0, notesMigrated: 0, keptLocal: true }
    }
    const source = current.migration?.source ?? (text(op.source) || 'localStorage')
    await domain.global.set({
      ...current,
      version: 1,
      migration: { complete: false, at: Date.now(), source },
    })
    let migrated = 0
    let notesMigrated = 0

    for (const [sessionId, raw] of Object.entries(snapshot.sessions || {})) {
      const key = text(sessionId)
      if (!key) continue
      const next = normalizeSessionRecord(raw, key)
      if (await putIfMissing(sessions, key, next)) {
        migrated += 1
        notesMigrated += next.items.length
      }
    }
    for (const [workspaceId, raw] of Object.entries(snapshot.workspaces || {})) {
      const key = text(workspaceId)
      if (!key) continue
      const next = normalizeWorkspaceRecord(raw, key)
      if (await putIfMissing(workspaces, key, next)) {
        migrated += 1
        notesMigrated += next.items.length
      }
    }
    for (const [listKey, raw] of Object.entries(snapshot.forwarded || {})) {
      if (!listKey) continue
      const next = normalizeForwardedRecord(raw)
      if (Object.keys(next).length > 0 && await putIfMissing(forwarded, listKey, next)) {
        migrated += 1
      }
    }

    const merged = { ...current, version: 1 }
    const prefs = snapshot.prefs && typeof snapshot.prefs === 'object' ? snapshot.prefs : {}
    if (current.scopeMode === undefined && (prefs.scopeMode === 'workspace' || prefs.scopeMode === 'session')) {
      merged.scopeMode = prefs.scopeMode
    }
    if (current.sidebyNoteScopeMode === undefined && prefs.scopeMode === 'global') {
      merged.sidebyNoteScopeMode = 'global'
    }
    if (current.sendShortcut === undefined && (prefs.sendShortcut === 'enter' || prefs.sendShortcut === 'ctrl-enter')) {
      merged.sendShortcut = prefs.sendShortcut
    }
    if (current.forwardPrefix === undefined && typeof prefs.forwardPrefix === 'string') {
      merged.forwardPrefix = prefs.forwardPrefix.slice(0, 80)
    }
    await domain.global.set({
      ...merged,
      migration: { complete: true, at: Date.now(), source },
    })
    this.rev += 1
    await this.#migrateRegisteredSessions(domain)
    return { rev: this.rev, migrated, notesMigrated }
  }
}

function explicitMembers(sessionIds) {
  return Array.isArray(sessionIds) ? new Set(sessionIds.filter(id => typeof id === 'string' && id)) : []
}

/** Leave records already persisted by an interrupted migration in place. */
async function putIfMissing(table, key, value) {
  if (table.get(key) !== undefined) return false
  await table.put(key, value)
  return true
}

async function writeRecord(table, key, current, next) {
  if (current === undefined) await table.put(key, next)
  else await table.update(key, () => next)
}
