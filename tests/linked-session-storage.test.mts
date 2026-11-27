import assert from 'node:assert/strict'
import { registerHooks } from 'node:module'
import { extname } from 'node:path'
import test, { type TestContext } from 'node:test'
import { JSDOM } from 'jsdom'

// Load the browser source without a generated client bundle.
const clientSource = new URL('../src/client/', import.meta.url).href
const resolver = registerHooks({
  resolve(specifier, context, next) {
    if (context.parentURL?.startsWith(clientSource) && /^\.{1,2}\//.test(specifier) && !extname(specifier)) {
      return next(`${specifier}.ts`, context)
    }
    return next(specifier, context)
  },
})
const { DRAFT_STORAGE_KEY, SESSION_STORAGE_KEY, WORKSPACE_STORAGE_KEY } = await import('../src/client/constants.ts')
const { clearAddDraft, ensureDraftScope, readScopeDrafts, saveAddDraft, subscribeDraftAttachments } = await import('../src/client/storage/drafts.ts')
const { hydrateHost, setStorageMode, storageFailure } = await import('../src/client/storage/state.ts')
const { migrateWorkspaceNotes, readVisibleNotes, readWorkspaceRecord, updateWorkspaceNotes } = await import('../src/client/storage/workspace.ts')
resolver.deregister()

function setup(t: TestContext) {
  const { window } = new JSDOM('', { url: 'https://example.test/' })
  Object.defineProperty(globalThis, 'window', { value: window, configurable: true })
  t.after(() => {
    window.close()
    Reflect.deleteProperty(globalThis, 'window')
  })
  return window.localStorage
}

const note = (id: string) => ({ id, text: id, done: false, createdAt: 1, updatedAt: 1 })

test('浏览器便笺会话关联在本地和宿主模式往返', async t => {
  const local = setup(t)
  const legacy = note('legacy')
  const attachment = { id: 'a'.repeat(64), name: 'ref.txt', type: 'text/plain', size: 5 }
  // The host schema serializes attachments after the timestamps, unlike the client normalizer.
  const linked = { ...note('linked'), attachments: [attachment], linkedSessionId: 'session:original' }
  setStorageMode('local')
  local.setItem(SESSION_STORAGE_KEY, JSON.stringify({ version: 1, sessions: { source: { items: [legacy, linked] } } }))
  await migrateWorkspaceNotes([{ workspaceId: 'w1', title: 'Workspace 1', sessionIds: ['source'] }])
  assert.deepEqual(readWorkspaceRecord('w1').items, [legacy, linked])
  assert.equal(readVisibleNotes(null).find(item => item.noteId === linked.id)?.linkedSessionId, linked.linkedSessionId)
  const updated = { ...linked, linkedSessionId: 'session:local' }
  assert.equal(await updateWorkspaceNotes('w1', () => [legacy, updated]), true)
  const localRaw = local.getItem(WORKSPACE_STORAGE_KEY)!
  assert.deepEqual(JSON.parse(localRaw).workspaces.w1.items, [legacy, updated])
  assert.deepEqual(readWorkspaceRecord('w1').items, [legacy, updated])

  const record = { updatedAt: 1, items: [legacy, linked], seededSessionIds: [] }
  hydrateHost({ sessions: {}, workspaces: { w1: record }, prefs: {} })
  setStorageMode('host')
  t.after(() => setStorageMode('local'))
  const broadcast = Object.getOwnPropertyDescriptor(globalThis, 'BroadcastChannel')!
  Object.defineProperty(globalThis, 'BroadcastChannel', { value: class { postMessage() {} }, configurable: true })
  t.after(() => Object.defineProperty(globalThis, 'BroadcastChannel', broadcast))
  const post = t.mock.method(globalThis, 'fetch', async (_url, init) => {
    const { upserts, order } = JSON.parse(init.body)
    const items = new Map(record.items.map(item => [item.id, item]))
    for (const item of upserts) items.set(item.id, item)
    record.items = order.map(id => items.get(id))
    return Response.json({ ok: true, record })
  })
  assert.deepEqual(readWorkspaceRecord('w1').items, [legacy, linked])
  assert.equal(await updateWorkspaceNotes('w1', items => items), true)
  assert.equal(post.mock.callCount(), 0, 'different field order does not cause an upsert')

  const { linkedSessionId: _, ...unlinked } = linked
  const removed = await updateWorkspaceNotes('w1', () => [legacy, unlinked])
  assert.equal(removed, true, storageFailure()?.message)
  assert.equal(post.mock.callCount(), 1)
  assert.deepEqual(JSON.parse(post.mock.calls[0].arguments[1].body).upserts, [unlinked])
  assert.deepEqual(readWorkspaceRecord('w1').items, [legacy, unlinked])

  assert.equal(await updateWorkspaceNotes('w1', () => [legacy, linked]), true)
  assert.equal(post.mock.callCount(), 2)
  assert.deepEqual(JSON.parse(post.mock.calls[1].arguments[1].body).upserts, [linked])
  assert.deepEqual(readWorkspaceRecord('w1').items, [legacy, linked])
  assert.equal(local.getItem(WORKSPACE_STORAGE_KEY), localRaw, 'Host mode leaves the local copy untouched')
})

test('浏览器草稿会话关联支持保留、清除与旧记录迁移', t => {
  let unsubscribe: (() => void) | undefined
  t.after(() => unsubscribe?.())
  const local = setup(t)
  const key = 'ws:w1'
  const link = 'session:next'
  const next = 'session:changed'
  local.setItem(DRAFT_STORAGE_KEY, JSON.stringify({ version: 1, sessions: {
    old: { add: 'old text', edits: { n1: 'obsolete' } },
    malformed: { add: 'readable', linkedSessionId: 3 },
    blank: { add: 'also readable', linkedSessionId: '   ' },
  } }))
  assert.deepEqual(readScopeDrafts('old'), { add: 'old text', attachments: [], workspaceId: undefined })
  assert.equal(readScopeDrafts('malformed').linkedSessionId, undefined)
  assert.equal(readScopeDrafts('blank').linkedSessionId, undefined)
  assert.equal(ensureDraftScope('ws:old', 'old', ['old']), true)
  assert.deepEqual(readScopeDrafts('ws:old'), { add: 'old text', attachments: [], workspaceId: undefined })

  const changes: string[] = []
  unsubscribe = subscribeDraftAttachments(changed => changes.push(changed))
  assert.equal(saveAddDraft('source', '', undefined, undefined, link), true)
  assert.deepEqual(changes, ['source'])
  assert.equal(ensureDraftScope(key, 'source', ['source']), true)
  assert.equal(readScopeDrafts('source').linkedSessionId, undefined)
  assert.deepEqual(readScopeDrafts(key), { add: '', attachments: [], workspaceId: undefined, linkedSessionId: link })

  assert.equal(saveAddDraft(key, 'typed'), true)
  assert.equal(readScopeDrafts(key).linkedSessionId, link)
  assert.equal(saveAddDraft(key, 'typed', undefined, undefined, '  '), true)
  assert.equal(readScopeDrafts(key).linkedSessionId, link, 'a blank value does not remove an existing link')
  assert.equal(saveAddDraft(key, 'typed', undefined, undefined, next), true)
  assert.equal(readScopeDrafts(key).linkedSessionId, next)
  assert.equal(saveAddDraft(key, 'typed', undefined, undefined, null), true)
  assert.deepEqual(readScopeDrafts(key), { add: 'typed', attachments: [], workspaceId: undefined, linkedSessionId: null })
  assert.equal(ensureDraftScope('ws:unlinked', key, [key]), true)
  assert.equal(readScopeDrafts('ws:unlinked').linkedSessionId, null)
  assert.deepEqual(changes, ['source', key, key])

  assert.equal(saveAddDraft(key, '', undefined, undefined, link), true)
  assert.deepEqual(JSON.parse(local.getItem(DRAFT_STORAGE_KEY)!).sessions[key], { linkedSessionId: link })
  assert.equal(clearAddDraft(key), true)
  assert.equal(JSON.parse(local.getItem(DRAFT_STORAGE_KEY)!).sessions[key], undefined)
})
