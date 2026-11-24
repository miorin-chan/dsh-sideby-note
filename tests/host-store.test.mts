/**
 * Host-side store contract: the operations the browser route exposes.
 *
 * A fake storage domain stands in for `ctx.storageDomain`, so these tests
 * exercise the exact read-modify-write and migration logic without touching a
 * real profile or file.
 */
import assert from 'node:assert/strict'
import path from 'node:path'
import test from 'node:test'
import { createStore, StoreError } from '../host/store.js'
import { LOCATION_PATH, REVEAL_PATH, registerStoreRoutes, revealCommand, resolveStoreFile, STORE_PATH } from '../host/store-route.js'
import { createSpec, prefsSchema, sessionSchema, workspaceSchema } from '../host/store-spec.js'
import { fakeCtx, fakeDomain, requestRejection } from './fake-store.mts'

function fakeServer() {
  const routes = new Map()
  return {
    register(route) {
      routes.set(route.path, route)
      return () => routes.delete(route.path)
    },
    route(path) {
      return routes.get(path)
    },
  }
}

function response() {
  return {
    status: 0,
    body: undefined,
    writeHead(status) {
      this.status = status
    },
    end(payload) {
      this.body = JSON.parse(payload)
    },
  }
}

function request(method, headers = {}, body) {
  const chunks = body === undefined ? [] : [Buffer.from(JSON.stringify(body))]
  return {
    method,
    headers: { host: '127.0.0.1:53272', ...headers },
    async *[Symbol.asyncIterator]() {
      yield* chunks
    },
  }
}

async function storeWith(domain, workspaceRegistry) {
  return createStore(fakeCtx(domain, workspaceRegistry))
}

const note = (id, text = id) => ({ id, text, done: false, createdAt: 1, updatedAt: 1 })
const list = (...items) => ({ updatedAt: 1, items })

test('empty snapshot reports empty and a stable revision', async () => {
  const store = await storeWith(fakeDomain())
  const snapshot = await store.snapshot()
  assert.equal(snapshot.empty, true)
  assert.equal(snapshot.rev, 0)
  assert.deepEqual(snapshot.data.sessions, {})
  assert.deepEqual(snapshot.data.prefs, { version: 1 })
})

test('list.patch creates, orders and deletes notes', async () => {
  const store = await storeWith(fakeDomain())
  const a = { id: 'a', text: 'A', done: false, createdAt: 1, updatedAt: 1 }
  const b = { id: 'b', text: 'B', done: false, createdAt: 2, updatedAt: 2 }

  await assert.rejects(store.apply({ op: 'list.patch', kind: 'session', listKey: 's1', upserts: [a] }),
    { code: 'STORE_BAD_REQUEST' })
  assert.deepEqual((await store.snapshot()).data.sessions, {})
  let result = await store.apply({ op: 'list.patch', kind: 'workspace', listKey: 'w1', order: ['a'], upserts: [a] })
  assert.equal(result.record.items.length, 1)
  assert.equal(result.rev, 1)

  result = await store.apply({ op: 'list.patch', kind: 'workspace', listKey: 'w1', order: ['b', 'a'], upserts: [b] })
  assert.deepEqual(result.record.items.map(item => item.id), ['b', 'a'])

  result = await store.apply({ op: 'list.patch', kind: 'workspace', listKey: 'w1', order: ['b'], deletes: ['a'] })
  assert.deepEqual(result.record.items.map(item => item.id), ['b'])

  const snapshot = await store.snapshot()
  assert.equal(snapshot.data.workspaces.w1.items.length, 1)
  assert.equal(snapshot.empty, false)
})

test('STORE-033 宿主便笺会话关联往返且兼容旧记录', async () => {
  const domain = fakeDomain()
  const store = await storeWith(domain)
  const legacy = note('legacy')
  const linked = { ...note('linked'), linkedSessionId: 'session:not-in-registry' }
  const invalid = { ...note('invalid'), linkedSessionId: '  ' }
  const record = { ...list(legacy, linked), seededSessionIds: [] }
  assert.deepEqual(workspaceSchema.parse(record), record)
  assert.deepEqual(sessionSchema.parse(list(legacy, linked)), list(legacy, linked))
  assert.equal(workspaceSchema.safeParse({ ...record, items: [invalid] }).success, false)

  await store.apply({ op: 'migrate', snapshot: { sessions: { old: list(legacy, linked) } } })
  const ensured = await store.apply({ op: 'list.ensure', workspaceId: 'w1', sessionIds: ['old'] })
  assert.deepEqual(ensured.record.items, [legacy, linked])

  const patch = { op: 'list.patch', kind: 'workspace', listKey: 'w1' }
  const reordered = await store.apply({ ...patch, order: ['linked', 'legacy'], upserts: [invalid] })
  assert.deepEqual(reordered.record.items, [linked, legacy, note('invalid')])
  const relinked = { ...linked, linkedSessionId: 'session:other' }
  await store.apply({ ...patch, upserts: [relinked] })
  await store.close()
  const reopened = await storeWith(domain)
  assert.deepEqual((await reopened.snapshot()).data.workspaces.w1.items, [relinked, legacy, note('invalid')])

  await reopened.apply({ ...patch, upserts: [note('linked')] })
  assert.deepEqual((await reopened.snapshot()).data.workspaces.w1.items, [note('linked'), legacy, note('invalid')])
})

test('STORE-023 宿主合并另一标签页新增的条目', async () => {
  const store = await storeWith(fakeDomain())
  const a = { id: 'a', text: 'A', done: false, createdAt: 1, updatedAt: 1 }
  const b = { id: 'b', text: 'B', done: false, createdAt: 2, updatedAt: 2 }
  const c = { id: 'c', text: 'C', done: false, createdAt: 3, updatedAt: 3 }

  await store.apply({ op: 'list.patch', kind: 'workspace', listKey: 'w1', order: ['a'], upserts: [a] })
  // Tab 2 still sees only [a] and adds b.
  await store.apply({ op: 'list.patch', kind: 'workspace', listKey: 'w1', order: ['b', 'a'], upserts: [b] })
  // Tab 1 writes a stale order [a] plus c; b must survive.
  const result = await store.apply({ op: 'list.patch', kind: 'workspace', listKey: 'w1', order: ['c', 'a'], upserts: [c] })
  assert.deepEqual(result.record.items.map(item => item.id), ['c', 'a', 'b'])
})

test('list.ensure folds member sessions in exactly once', async () => {
  const domain = fakeDomain()
  const store = await storeWith(domain)
  const note = { id: 'n1', text: 'from s1', done: false, createdAt: 1, updatedAt: 1 }
  await domain.table('sessions').put('s1', list(note))

  let result = await store.apply({ op: 'list.ensure', workspaceId: 'w1', sessionIds: ['s1'] })
  assert.deepEqual(result.record.items.map(item => item.id), ['n1'])
  assert.deepEqual(result.record.seededSessionIds, ['s1'])
  assert.deepEqual(result.migratedSessionIds, ['s1'])
  assert.deepEqual((await store.snapshot()).data.sessions, {})

  // Deleting the workspace note must not resurrect it on the next ensure.
  await store.apply({ op: 'list.patch', kind: 'workspace', listKey: 'w1', order: [], deletes: ['n1'] })
  result = await store.apply({ op: 'list.ensure', workspaceId: 'w1', sessionIds: ['s1'] })
  assert.deepEqual(result.record.items, [])
  assert.deepEqual(result.migratedSessionIds, [])
  assert.equal(result.rev, 2)
})

test('snapshot preserves new notes from previously seeded sessions and migrates every workspace', async () => {
  const domain = fakeDomain()
  const current = note('shared', 'workspace edit')
  const added = { ...note('new'), done: true, completedAt: 3 }
  await domain.table('workspaces').put('w1', { ...list(current), seededSessionIds: ['s1'] })
  await domain.table('sessions').put('s1', list({ ...note('shared', 'legacy edit'), updatedAt: 4 }, added))
  await domain.table('sessions').put('s2', list(note('another member')))
  await domain.table('sessions').put('s3', list(note('workspace never opened in panel')))
  await domain.table('sessions').put('s4', list(note('outside registered workspaces')))
  const store = await storeWith(domain, {
    list: () => [{ id: 'w1', sessionIds: ['s1', 's2'] }, { id: 'w2', sessionIds: ['s3'] }],
  })

  const snapshot = await store.snapshot()
  const { sessions, workspaces } = snapshot.data
  assert.deepEqual(sessions, {})
  assert.deepEqual(workspaces.w1.items, [current, added, note('another member')])
  assert.deepEqual(workspaces.w1.seededSessionIds, ['s1', 's2'])
  assert.deepEqual(workspaces.w2.items, [note('workspace never opened in panel')])
  assert.deepEqual(workspaces['sideby-note:unassigned'].items, [note('outside registered workspaces')])
  assert.deepEqual(await store.snapshot(), snapshot, 'an already migrated snapshot performs no writes')
})

test('an unavailable registry preserves unresolved rows until membership is known', async () => {
  const domain = fakeDomain()
  let workspaces
  const store = await storeWith(domain, { list: () => workspaces })
  await domain.table('sessions').put('s1', list(note('explicit member')))
  await domain.table('sessions').put('unknown', list(note('unresolved')))

  assert.deepEqual(Object.keys((await store.snapshot()).data.sessions), ['s1', 'unknown'])
  const unassigned = await store.apply({ op: 'list.ensure', workspaceId: 'sideby-note:unassigned', sessionIds: ['unknown'] })
  assert.deepEqual(unassigned.migratedSessionIds, [])
  assert.deepEqual(unassigned.record.items, [])
  assert.equal(domain.table('workspaces').get('sideby-note:unassigned'), undefined)
  const explicit = await store.apply({ op: 'list.ensure', workspaceId: 'w1', sessionIds: ['s1', 's1'] })
  assert.deepEqual(explicit.migratedSessionIds, ['s1'])
  assert.deepEqual(explicit.record.items, [note('explicit member')])
  assert.deepEqual(Object.keys((await store.snapshot()).data.sessions), ['unknown'])

  workspaces = []
  const snapshot = await store.snapshot()
  assert.deepEqual(snapshot.data.sessions, {})
  assert.deepEqual(snapshot.data.workspaces['sideby-note:unassigned'].items, [note('unresolved')])
})

test('list.ensure uses authoritative membership whenever the registry is mounted', async () => {
  const domain = fakeDomain()
  const store = await storeWith(domain, { list: () => [{ id: 'w1', sessionIds: ['s1'] }, { id: 'w2', sessionIds: ['s2'] }] })
  await domain.table('sessions').put('s1', list(note('first')))
  await domain.table('sessions').put('s2', list(note('second')))

  const ensured = await store.apply({ op: 'list.ensure', workspaceId: 'w1', sessionIds: ['s2'] })
  assert.deepEqual(ensured.migratedSessionIds, ['s1'])
  assert.deepEqual(ensured.record.items, [note('first')])
  assert.deepEqual([...domain.table('sessions').keys()], ['s2'])
  assert.deepEqual((await store.snapshot()).data.workspaces.w2.items, [note('second')])
})

test('session migration retries safely before the copy and between copy and cleanup', async () => {
  let failedWrite
  let workspaceWrites = 0
  const domain = fakeDomain({ beforeWrite(table, method) {
    if (`${table}.${method}` === failedWrite) throw new Error(`interrupted at ${failedWrite}`)
    if (table === 'workspaces') workspaceWrites += 1
  } })
  const registry = { list: () => [{ id: 'w1', sessionIds: ['s1', 's2'] }] }
  const source = list(note('same-id'))
  await domain.table('sessions').put('s1', source)
  await domain.table('sessions').put('s2', list(note('same-id'), note('additional')))

  const store = await storeWith(domain, registry)
  failedWrite = 'workspaces.put'
  await assert.rejects(store.snapshot(), /interrupted at workspaces\.put/)
  assert.equal(domain.table('workspaces').get('w1'), undefined)
  assert.deepEqual(domain.table('sessions').get('s1'), source)

  failedWrite = 'sessions.deleteMany'
  await assert.rejects(store.snapshot(), /interrupted at sessions\.deleteMany/)
  const copied = domain.table('workspaces').get('w1')
  assert.deepEqual(copied.items, [note('same-id'), note('additional')])
  assert.deepEqual([...domain.table('sessions').keys()], ['s1', 's2'])
  await store.close()

  failedWrite = undefined
  const retried = await storeWith(domain, registry)
  const { data } = await retried.snapshot()
  assert.deepEqual(data.workspaces.w1, copied)
  assert.deepEqual(data.sessions, {})
  assert.equal(workspaceWrites, 1, 'retry only needs the source cleanup')
})

test('a workspace deletion cannot run ahead of a failed source cleanup', async () => {
  let failCleanup = true
  const domain = fakeDomain({ beforeWrite(table, method) {
    if (failCleanup && table === 'sessions' && method === 'deleteMany') throw new Error('cleanup interrupted')
  } })
  const store = await storeWith(domain, { list: () => [{ id: 'w1', sessionIds: ['s1'] }] })
  await domain.table('sessions').put('s1', list(note('pending')))
  await assert.rejects(store.snapshot(), /cleanup interrupted/)

  const patch = { op: 'list.patch', kind: 'workspace', listKey: 'w1', deletes: ['pending'] }
  await assert.rejects(store.apply(patch), /cleanup interrupted/)
  assert.deepEqual(domain.table('workspaces').get('w1').items, [note('pending')])

  failCleanup = false
  assert.deepEqual((await store.apply(patch)).record.items, [])
  const { data } = await store.snapshot()
  assert.deepEqual(data.sessions, {})
  assert.deepEqual(data.workspaces.w1.items, [])
})

test('STORE-026 宿主模式清单保存归档状态', async () => {
  const domain = fakeDomain()
  const store = await storeWith(domain)
  const mark = { n1: true }
  await domain.table('forwarded').put('ws:w1', mark)
  assert.equal((await store.snapshot()).empty, false, 'compatibility records count as existing host data')
  await assert.rejects(store.apply({ op: 'forward.set', listKey: 'ws:w1', itemId: 'n1', on: false }),
    error => error instanceof StoreError && error.code === 'STORE_BAD_REQUEST')

  const note = { id: 'n1', text: '便笺', done: true, createdAt: 1, updatedAt: 2, completedAt: 2 }
  await store.apply({ op: 'list.patch', kind: 'workspace', listKey: 'w1', order: ['n1'], upserts: [note] })
  const snapshot = await store.snapshot()
  assert.deepEqual(snapshot.data.workspaces.w1.items, [note])
  assert.deepEqual(domain.table('forwarded').get('ws:w1'), mark, 'existing compatibility marks survive fork writes')
})

test('STORE-026 宿主模式偏好持久化', async () => {
  const domain = fakeDomain()
  await domain.global.set({ version: 1, scopeMode: 'session', forwardPrefix: '上游前缀', sendShortcut: 'enter' })
  const store = await storeWith(domain)
  assert.equal((await store.snapshot()).data.prefs.scopeMode, 'session', 'legacy preferences are readable')
  await store.apply({ op: 'prefs.set', patch: { scopeMode: 'workspace' } })
  await store.apply({ op: 'prefs.set', patch: { scopeMode: 'global', forwardPrefix: '应忽略', sendShortcut: 'ctrl-enter' } })
  for (const scopeMode of ['session', 'other']) {
    await assert.rejects(store.apply({ op: 'prefs.set', patch: { scopeMode } }),
      error => error instanceof StoreError && error.code === 'STORE_BAD_REQUEST')
  }
  const snapshot = await store.snapshot()
  assert.equal(snapshot.data.prefs.sidebyNoteScopeMode, 'global')
  assert.deepEqual(domain.global.get(), { version: 1, scopeMode: 'session', sidebyNoteScopeMode: 'global', forwardPrefix: '上游前缀', sendShortcut: 'enter' })
})

test('migrate is two-phase and idempotent', async () => {
  const store = await storeWith(fakeDomain())
  const snapshot = {
    sessions: { s1: { updatedAt: 1, items: [{ id: 'n1', text: 'old', done: true, createdAt: 1, updatedAt: 2, completedAt: 2 }] } },
    workspaces: { w1: { updatedAt: 2, items: [], seededSessionIds: ['s1'] } },
    forwarded: { 'ws:w1': { n1: true, invalid: false } },
    prefs: { scopeMode: 'workspace', forwardPrefix: '', sendShortcut: 'ctrl-enter' },
  }
  const first = await store.apply({ op: 'migrate', snapshot, source: 'localStorage' })
  assert.equal(first.migrated, 3)
  assert.equal(first.notesMigrated, 1, 'only notes count toward the migration notice')
  const data = (await store.snapshot()).data
  assert.equal(data.sessions.s1.items[0].text, 'old')
  assert.equal(data.workspaces.w1.seededSessionIds[0], 's1')
  assert.equal(data.prefs.migration.complete, true)
  assert.equal(data.prefs.scopeMode, 'workspace')
  assert.equal(data.prefs.forwardPrefix, '')
  assert.equal(data.prefs.sendShortcut, 'ctrl-enter')
  assert.equal(data.sessions.s1.items[0].completedAt, 2)
  assert.deepEqual(data.forwarded, { 'ws:w1': { n1: true } })

  const second = await store.apply({ op: 'migrate', snapshot, source: 'localStorage' })
  assert.equal(second.alreadyComplete, true)
  assert.equal(second.migrated, 0)
  assert.equal(second.notesMigrated, 0)
})

test('browser import compacts durable session rows after it finishes, including on cleanup retry', async () => {
  let failCleanup = true
  const domain = fakeDomain({ beforeWrite(table, method) {
    if (failCleanup && table === 'sessions' && method === 'deleteMany') throw new Error('interrupted after browser import')
  } })
  const store = await storeWith(domain, { list: () => [{ id: 'w1', sessionIds: ['s1'] }] })
  const persisted = note('n1', 'persisted before interruption')
  const workspace = note('n2', 'from browser workspace')
  await domain.table('sessions').put('s1', list(persisted))
  await domain.global.set({ version: 1, migration: { complete: false, at: 1, source: 'localStorage' } })
  const op = {
    op: 'migrate',
    snapshot: {
      sessions: { s1: list(note('n1', 'stale from browser')), unknown: list(note('n3')) },
      workspaces: { w1: { ...list(workspace), seededSessionIds: ['s1'] } },
      prefs: { scopeMode: 'global' },
    },
  }

  assert.deepEqual((await store.snapshot()).data.sessions.s1.items, [persisted], 'pending import retains its source rows')
  await assert.rejects(store.apply(op), /interrupted after browser import/)
  assert.deepEqual(domain.table('workspaces').get('w1').items, [workspace, persisted])
  assert.equal(domain.global.get().migration.complete, true)

  failCleanup = false
  assert.equal((await store.apply(op)).alreadyComplete, true)
  assert.equal(domain.table('sessions').size, 0, 'a successful import retry already finishes cleanup before the next GET')
  const { data } = await store.snapshot()
  assert.deepEqual(data.workspaces.w1.items, [workspace, persisted])
  assert.deepEqual(data.workspaces['sideby-note:unassigned'].items, [note('n3')])
  assert.equal(data.prefs.sidebyNoteScopeMode, 'global')
})

test('STORE-021 探测后已有宿主数据时拒绝迁移', async () => {
  const domain = fakeDomain()
  const store = await storeWith(domain)
  assert.equal((await store.snapshot()).empty, true)
  await domain.table('forwarded').put('ws:w1', { note: true })

  const result = await store.apply({
    op: 'migrate',
    snapshot: { sessions: { s1: { updatedAt: 1, items: [] } } },
    source: 'localStorage',
  })
  assert.equal(result.keptLocal, true)
  assert.equal(result.migrated, 0)
  const data = (await store.snapshot()).data
  assert.deepEqual(data.forwarded, { 'ws:w1': { note: true } })
  assert.deepEqual(data.sessions, {})
  assert.equal(data.prefs.migration, undefined)
})

test('STORE-024 迁移中断后重启补完且不重复', async () => {
  const domain = fakeDomain()
  const store = await storeWith(domain)
  // Simulate a crash after writing the marker and some records.
  const persisted = { id: 'n1', text: 'already persisted', done: false, createdAt: 1, updatedAt: 3 }
  await domain.table('sessions').put('s1', { sessionId: 's1', updatedAt: 3, items: [persisted] })
  await domain.global.set({ version: 1, scopeMode: 'session', migration: { complete: false, at: 1, source: 'localStorage' } })

  const result = await store.apply({
    op: 'migrate',
    snapshot: {
      sessions: {
        s1: { updatedAt: 1, items: [{ ...persisted, text: 'stale snapshot', updatedAt: 1 }] },
        s9: { updatedAt: 1, items: [] },
      },
      prefs: { scopeMode: 'workspace' },
    },
    source: 'localStorage',
  })
  assert.equal(result.migrated, 1)
  const data = (await store.snapshot()).data
  assert.equal(data.prefs.migration.complete, true)
  assert.ok(data.sessions.s9)
  assert.deepEqual(data.sessions.s1.items, [persisted])
  assert.equal(data.prefs.scopeMode, 'session')
})

test('STORE-025 宿主文件打不开时报告存储错误', async () => {
  const noStorage = createStore({ get: () => undefined })
  await assert.rejects(noStorage.snapshot(), error => error instanceof StoreError && error.code === 'STORE_UNAVAILABLE' && error.status === 503)

  const broken = createStore(fakeCtx(undefined))
  await assert.rejects(broken.snapshot(), error => error instanceof StoreError && error.code === 'STORE_OPEN_FAILED')
})

test('the spec is valid and rejects malformed records', () => {
  const spec = createSpec()
  assert.equal(spec.name, 'aside_note')
  assert.equal(spec.version, 1)
  assert.equal(spec.layout, 'single')
  assert.deepEqual(Object.keys(spec.tables).sort(), ['forwarded', 'sessions', 'workspaces'])
  assert.equal(sessionSchema.safeParse({ updatedAt: 1, items: [{ id: 'a', text: '', done: false, createdAt: 1, updatedAt: 1 }] }).success, false)
  assert.equal(workspaceSchema.safeParse({ updatedAt: 1, items: [], seededSessionIds: [] }).success, true)
  assert.equal(prefsSchema.safeParse({ sidebyNoteScopeMode: 'global' }).success, true)
  assert.equal(prefsSchema.safeParse({ scopeMode: 'global' }).success, false)
  assert.equal(prefsSchema.safeParse({ scopeMode: 'session' }).success, true)
  assert.equal(prefsSchema.safeParse({ scopeMode: 'other' }).success, false)
})

test('store routes enforce method, origin, content type and JSON body', async () => {
  const server = fakeServer()
  const store = await storeWith(fakeDomain())
  const dispose = registerStoreRoutes(server, { ctx: { get: name => name === 'connection' ? { requestRejection } : undefined }, store })
  const route = server.route(STORE_PATH)
  assert.equal(route.kind, 'exact')

  let res = response()
  await route.handler(request('GET'), res)
  assert.equal(res.status, 200)
  assert.equal(res.body.ok, true)
  assert.equal(res.body.empty, true)

  res = response()
  await route.handler(request('GET', { 'sec-fetch-site': 'cross-site' }), res)
  assert.equal(res.status, 403)
  assert.equal(res.body.code, 'STORE_FORBIDDEN')

  res = response()
  await route.handler(request('PUT'), res)
  assert.equal(res.status, 405)

  res = response()
  await route.handler(request('POST', { 'content-type': 'text/plain' }, {}), res)
  assert.equal(res.status, 400)

  res = response()
  await route.handler(request('POST', { 'content-type': 'application/json' }, { op: 'list.patch', kind: 'workspace', listKey: 'w1', order: [], upserts: [] }), res)
  assert.equal(res.status, 200)
  assert.equal(res.body.ok, true)

  res = response()
  await route.handler(request('POST', { 'content-type': 'application/json' }, { op: 'nope' }), res)
  assert.equal(res.status, 400)
  assert.equal(res.body.code, 'STORE_BAD_REQUEST')

  if (typeof dispose === 'function') dispose()
})

test('store routes require the shared browser-session check', async () => {
  const denied = [
    { connection: { requestRejection: () => 401 }, status: 401 },
    { connection: { requestRejection: () => 403 }, status: 403 },
    { connection: undefined, status: 403 },
  ]
  for (const { connection, status } of denied) {
    const server = fakeServer()
    const ctx = { get: name => name === 'connection' ? connection : undefined }
    const store = { snapshot: () => assert.fail('unauthorized request reached storage') }
    registerStoreRoutes(server, { ctx, store })
    for (const [endpoint, method] of [[STORE_PATH, 'GET'], [LOCATION_PATH, 'GET'], [REVEAL_PATH, 'POST']]) {
      const res = response()
      await server.route(endpoint).handler(request(method), res)
      assert.equal(res.status, status)
      assert.equal(res.body.code, 'STORE_FORBIDDEN')
    }
  }
})

test('STORE-027 宿主模式 400 条仍可新增', async () => {
  const store = await storeWith(fakeDomain())
  const notes = Array.from({ length: 400 }, (_, index) => ({
    id: `n${index}`,
    text: `条目 ${index}`,
    done: false,
    createdAt: index,
    updatedAt: index,
  }))
  const first = await store.apply({
    op: 'list.patch',
    kind: 'workspace',
    listKey: 'big',
    order: notes.map(note => note.id),
    upserts: notes,
  })
  assert.equal(first.record.items.length, 400)

  const extra = { id: 'n400', text: '第 401 条', done: false, createdAt: 400, updatedAt: 400 }
  const second = await store.apply({
    op: 'list.patch',
    kind: 'workspace',
    listKey: 'big',
    order: [...notes.map(note => note.id), extra.id],
    upserts: [extra],
  })
  assert.equal(second.record.items.length, 401)
  const snapshot = await store.snapshot()
  assert.equal(snapshot.data.workspaces.big.items.length, 401)
})

test('STORE-028 存储文件路径可查看', async () => {
  const root = '/tmp/sideby-note-location-test'
  const backend = { root }
  const ctx = {
    get(name) {
      if (name === 'connection') return { requestRejection }
      if (name === 'storage') return { backend: { names: () => ['json'], get: () => backend } }
      if (name === 'storageDomain') return { config: { routes: { aside_note: 'json' } } }
      return undefined
    },
  }
  const file = path.join(root, 'aside_note.json')
  assert.deepEqual(resolveStoreFile(ctx), { path: file, backend: 'json' })

  const server = fakeServer()
  registerStoreRoutes(server, { ctx, store: {} })
  const location = response()
  await server.route(LOCATION_PATH).handler(request('GET'), location)
  assert.equal(location.status, 200)
  assert.equal(location.body.path, file)
  assert.equal(location.body.exists, false)
  assert.equal(location.body.backend, 'json')

  assert.deepEqual(revealCommand(file, 'darwin', true), { command: 'open', args: ['-R', file] })
  assert.deepEqual(revealCommand(file, 'win32', true), { command: 'explorer.exe', args: [`/select,${file}`] })
  assert.deepEqual(revealCommand(file, 'linux', false), { command: 'xdg-open', args: [root] })

  // A backend without a file path is reported, never guessed.
  const emptyServer = fakeServer()
  registerStoreRoutes(emptyServer, { ctx: { get: name => name === 'connection' ? { requestRejection } : undefined }, store: {} })
  const missing = response()
  await emptyServer.route(REVEAL_PATH).handler(request('POST'), missing)
  assert.equal(missing.status, 404)
  assert.equal(missing.body.code, 'STORE_PATH_UNAVAILABLE')
})

test('STORE-029 宿主区分文件已被占用与普通打开错误', async () => {
  const store = createStore({
    get: name => name === 'storageDomain' ? {
      async open() {
        throw Object.assign(new Error('domain already open'), { code: 'already-open' })
      },
    } : undefined,
  })
  const server = fakeServer()
  const ctx = { get: name => name === 'connection' ? { requestRejection } : undefined }
  registerStoreRoutes(server, { ctx, store })
  const res = response()
  await server.route(STORE_PATH).handler(request('GET'), res)
  assert.equal(res.status, 503)
  assert.equal(res.body.code, 'STORE_IN_USE')
})
