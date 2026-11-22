/**
 * Browser-half integration for the host switch: the built bundle boots against
 * a fake `/dsh-sideby-note/store` endpoint backed by the real host store code.
 *
 * These cover the three states that matter: migrate-and-switch, refuse-to-switch
 * (stay on localStorage), and already-switched-but-unavailable (error state,
 * no writes anywhere).
 */
import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import test from 'node:test'
import { fileURLToPath } from 'node:url'
import { JSDOM } from 'jsdom'
import { createStore } from '../host/store.js'
import { fakeCtx, fakeDomain } from './fake-store.mjs'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const bundle = fs.readFileSync(path.join(root, 'client', 'client.js'), 'utf8')

const STORE_PATH = '/dsh-sideby-note/store'
const LOCATION_PATH = `${STORE_PATH}/location`
const REVEAL_PATH = `${STORE_PATH}/reveal`
const SESSION_KEY = 'dsh.aside-note'
const WORKSPACE_KEY = 'dsh.aside-note.workspaces'
const UNASSIGNED = 'sideby-note:unassigned'
const browserNotes = window => JSON.parse(window.localStorage.getItem(WORKSPACE_KEY)).workspaces[UNASSIGNED].items
const MODE_KEY = 'dsh.aside-note.storage-mode'

const json = (status, body) => ({ ok: status >= 200 && status < 300, status, json: async () => body })

/** Boot the built bundle in a fresh jsdom realm. */
async function setup(options = {}) {
  const dom = new JSDOM(
    '<!doctype html><html><body><div class="_headerUtilities"></div></body></html>',
    { url: 'https://example.test/', pretendToBeVisual: true, runScripts: 'outside-only' },
  )
  const { window } = dom
  globalThis.window = window
  globalThis.document = window.document
  globalThis.IS_REACT_ACT_ENVIRONMENT = true

  if (options.legacyNote) {
    window.localStorage.setItem(SESSION_KEY, JSON.stringify({
      version: 1,
      sessions: {
        'session-1': {
          sessionId: 'session-1',
          updatedAt: 1,
          items: [{ id: 'seed', text: '旧便笺', done: false, createdAt: 1, updatedAt: 1 }],
        },
      },
    }))
  }
  if (options.legacyMetadata) {
    window.localStorage.setItem('dsh.aside-note.forwarded', JSON.stringify({ version: 1, sessions: { 'session-1': { seed: true } } }))
    window.localStorage.setItem('dsh.aside-note.send-shortcut', 'ctrl-enter')
    window.localStorage.setItem('dsh.aside-note.forward-prefix', '')
  }
  if (options.markedHost) window.localStorage.setItem(MODE_KEY, 'host')

  const domain = fakeDomain()
  const store = createStore(fakeCtx(domain, { list: () => [] }))
  const calls = []
  const attachments = new Map()
  const previewUrls = []
  window.URL.createObjectURL = blob => `blob:https://example.test/preview-${previewUrls.push(blob.type)}`
  window.URL.revokeObjectURL = () => {}
  if (options.hostSeed) {
    for (const [sessionId, items] of Object.entries(options.hostSeed.sessions || {})) {
      await domain.table('sessions').put(sessionId, { sessionId, updatedAt: 1, items })
    }
  }
  window.fetch = async (input, init = {}) => {
    const url = String(input)
    const method = init.method || 'GET'
    calls.push({ url, method })
    if (url === STORE_PATH) {
      if (options.storeDown) {
        return json(503, {
          ok: false,
          code: options.storeCode || 'STORE_UNAVAILABLE',
          message: options.storeCode === 'STORE_OPEN_FAILED' ? 'aside_note.json cannot be opened' : 'storage is not mounted',
        })
      }
      if (method === 'GET') {
        await options.storeReady
        const snapshot = await store.snapshot()
        return json(200, { ok: true, ...snapshot })
      }
      const op = JSON.parse(init.body)
      if (op.op === 'prefs.set') {
        const rejection = await options.beforeSetPrefs?.(op.patch.scopeMode)
        if (rejection) return rejection
      }
      const result = await store.apply(op)
      return json(200, { ok: true, ...result })
    }
    if (url === '/dsh-sideby-note/attachments' && method === 'POST') {
      if (options.uploadDown) return json(502, { ok: false })
      const id = String(attachments.size + 1).padStart(64, '0')
      attachments.set(id, init.body)
      return json(200, { ok: true, id })
    }
    if (url.startsWith('/dsh-sideby-note/attachments?')) {
      const id = new window.URL(url, window.location.href).searchParams.get('id')
      const blob = attachments.get(id)
      return { ok: Boolean(blob), blob: async () => blob }
    }
    if (url === LOCATION_PATH) {
      return json(200, {
        ok: true,
        path: options.storePath || null,
        exists: options.storePath ? options.storePathExists !== false : false,
        backend: options.storePath ? 'json' : null,
      })
    }
    if (url === REVEAL_PATH) {
      return options.revealDown
        ? json(502, { ok: false, code: 'STORE_REVEAL_FAILED', message: 'no file manager' })
        : json(200, { ok: true })
    }
    // The panel's update check must not reach the network in this realm.
    return json(404, {})
  }

  let loaded = null
  window.__ModuleLoader__ = { load: spec => { loaded = spec } }
  window.eval(bundle)
  const React = await import('react')
  const ReactDOM = await import('react-dom')
  const ReactDOMClient = await import('react-dom/client')
  const { act } = React
  const moduleTable = {
    react: React,
    'react-dom': ReactDOM,
    'react-dom/client': ReactDOMClient,
    '@deepseek-ai/dsh-client-ui-primitives': {},
  }
  const requireShim = id => {
    if (!(id in moduleTable)) throw new Error(`module table cannot answer ${id}`)
    return moduleTable[id]
  }
  const exported = loaded.factory(requireShim)

  const registered = []
  const locale = {
    bind: () => key => key,
    register: () => {},
    getLocale: () => ({ id: 'zh' }),
  }
  const ctx = {
    get: name => (name === 'locale' ? locale : undefined),
    effect: fn => {
      const dispose = fn()
      if (typeof dispose === 'function') dispose()
    },
    slots: {
      inject: (name, factory) => factory(),
      register: (meta, component) => {
        registered.push({ meta, component })
        return () => {}
      },
    },
  }

  await act(async () => { exported.apply(ctx) })
  // Let the boot probe, migration and ready notification settle.
  await act(async () => { await new Promise(resolve => window.setTimeout(resolve, 60)) })

  const settle = async (ms = 40) => {
    await act(async () => { await new Promise(resolve => window.setTimeout(resolve, ms)) })
  }

  const openPanel = async (props = {}) => {
    const capture = registered.find(entry => entry.meta.name === 'conversation.composer.dock').component
    const container = window.document.createElement('div')
    window.document.body.appendChild(container)
    const reactRoot = ReactDOMClient.createRoot(container)
    await act(async () => {
      reactRoot.render(React.createElement(capture, { sessionId: 'session-1', ...props }))
    })
    await settle()
    const button = window.document.querySelector('._headerUtilities > .dsh-an-headerBtn')
    return { button, reactRoot, settle }
  }

  const addNote = async text => {
    const popover = window.document.querySelector('.dsh-an-popover')
    const field = popover.querySelector('.dsh-an-input')
    const setter = Object.getOwnPropertyDescriptor(window.HTMLTextAreaElement.prototype, 'value').set
    await act(async () => {
      setter.call(field, text)
      field.dispatchEvent(new window.Event('input', { bubbles: true }))
    })
    await act(async () => { popover.querySelector('.dsh-an-addBtn').click() })
    await settle(40)
    return popover
  }

  return { window, dom, domain, store, calls, previewUrls, openPanel, addNote, settle, act }
}

test('STORE-019 首次启动把浏览器便笺迁移到宿主并写模式标记', async t => {
  const ctx = await setup({ legacyNote: true, legacyMetadata: true })
  t.after(() => ctx.window.close())

  assert.equal(ctx.window.localStorage.getItem(MODE_KEY), 'host', 'a successful switch writes the one-way marker')
  assert.ok(ctx.calls.some(call => call.method === 'POST'), 'the empty host receives the migrated snapshot')
  let snapshot = await ctx.store.snapshot()
  assert.equal(snapshot.data.workspaces[UNASSIGNED].items[0].text, '旧便笺')
  assert.deepEqual(snapshot.data.sessions, {}, 'the imported host session row is moved into the unassigned workspace')
  assert.deepEqual(snapshot.data.forwarded, { 'session-1': { seed: true } })
  assert.equal(snapshot.data.prefs.sendShortcut, 'ctrl-enter')
  assert.equal(snapshot.data.prefs.forwardPrefix, '', 'an explicitly empty upstream prefix survives migration')

  const { button } = await ctx.openPanel()
  assert.equal(button.querySelector('.dsh-an-headerCount').textContent, '1', 'the badge reads the migrated note')
  await ctx.act(async () => { button.click() })
  const popover = await ctx.addNote('宿主新条目')

  snapshot = await ctx.store.snapshot()
  assert.deepEqual(snapshot.data.workspaces[UNASSIGNED].items.map(item => item.text), ['宿主新条目', '旧便笺'])
  assert.deepEqual(snapshot.data.sessions, {}, 'standalone writes leave the legacy host table empty')
  const legacy = JSON.parse(ctx.window.localStorage.getItem(SESSION_KEY))
  assert.equal(legacy.sessions['session-1'].items.length, 1, 'host mode never writes the legacy browser store')
  await ctx.act(async () => { popover.querySelector('summary.dsh-an-storageToggle').click() })
  await ctx.settle()
  assert.match(popover.querySelector('.dsh-an-footerBody').textContent, /便笺保存在 DSH 本地文件/)
  const migratedRow = [...popover.querySelectorAll('.dsh-an-row')]
    .find(row => row.querySelector('.dsh-an-text').textContent === '旧便笺')
  assert.ok(migratedRow.querySelector('.dsh-an-insert'), 'compatibility marks do not disable the fork insert action')
  assert.equal(migratedRow.querySelector('[data-forwarded]'), null)
})

test('SCOPE-017 连续切换范围时旧保存响应不覆盖最新选择', async t => {
  const globalWrite = Promise.withResolvers()
  const workspaceWrite = Promise.withResolvers()
  const rejectedWrite = Promise.withResolvers()
  let globalRequests = 0
  const ctx = await setup({
    beforeSetPrefs: mode => {
      if (mode === 'workspace') return workspaceWrite.promise
      globalRequests += 1
      return globalRequests === 1 ? globalWrite.promise : rejectedWrite.promise
    },
  })
  t.after(async () => {
    await ctx.act(async () => {
      globalWrite.resolve()
      workspaceWrite.resolve()
      rejectedWrite.resolve(json(400, { code: 'STORE_BAD_REQUEST' }))
    })
    ctx.window.close()
  })

  const { button } = await ctx.openPanel({
    useWorkspaces: select => select({ phase: 'ready', items: [{
      workspaceId: 'ws-1', title: '工作区 A', sessionIds: ['session-1'],
    }] }),
  })
  await ctx.act(async () => { button.click() })
  const scopeButton = mode => ctx.window.document.querySelector(`[data-scope-mode="${mode}"]`)
  const selectedScope = () => ctx.window.document.querySelector('[data-scope-mode][aria-pressed="true"]').dataset.scopeMode
  await ctx.act(async () => { scopeButton('global').click() })
  assert.equal(selectedScope(), 'global')
  await ctx.act(async () => { scopeButton('workspace').click() })
  assert.equal(selectedScope(), 'workspace')

  await ctx.act(async () => { globalWrite.resolve() })
  assert.equal((await ctx.store.snapshot()).data.prefs.sidebyNoteScopeMode, 'global', 'the first click was saved first')
  assert.equal(selectedScope(), 'workspace', 'the first response cannot undo the second click')

  await ctx.act(async () => { workspaceWrite.resolve() })
  assert.equal((await ctx.store.snapshot()).data.prefs.sidebyNoteScopeMode, 'workspace')
  assert.equal(selectedScope(), 'workspace')

  await ctx.act(async () => { scopeButton('global').click() })
  assert.equal(selectedScope(), 'global')
  await ctx.act(async () => { rejectedWrite.resolve(json(400, { code: 'STORE_BAD_REQUEST' })) })
  assert.equal(selectedScope(), 'workspace', 'a rejected latest selection restores the saved scope')
  assert.equal((await ctx.store.snapshot()).data.prefs.sidebyNoteScopeMode, 'workspace')
})

test('STORE-020 宿主不可用时不切换并保留浏览器写入', async t => {
  const ctx = await setup({ legacyNote: true, storeDown: true })
  t.after(() => ctx.window.close())
  // The probe retries once with a 250 ms pause before refusing the switch.
  await ctx.settle(400)

  assert.equal(ctx.window.localStorage.getItem(MODE_KEY), null, 'no marker is written when the host refuses')
  const { button } = await ctx.openPanel()
  assert.equal(button.querySelector('.dsh-an-headerCount').textContent, '1')
  await ctx.act(async () => { button.click() })
  await ctx.addNote('仍然本地')

  assert.deepEqual(browserNotes(ctx.window).map(item => item.text), ['仍然本地', '旧便笺'])
  assert.deepEqual(JSON.parse(ctx.window.localStorage.getItem(SESSION_KEY)).sessions, {})
  const snapshot = await ctx.store.snapshot()
  assert.deepEqual(snapshot.data.workspaces, {}, 'no host write happened before the switch')
})

test('STORE-022 已切换后宿主不可用进入错误态且不改写浏览器', async t => {
  const hostNote = { id: 'host-1', text: '宿主便笺', done: false, createdAt: 2, updatedAt: 2 }
  const options = {
    legacyNote: true,
    markedHost: true,
    storeDown: true,
    storeCode: 'STORE_OPEN_FAILED',
    hostSeed: { sessions: { 'session-1': [hostNote] } },
  }
  const ctx = await setup(options)
  t.after(() => ctx.window.close())
  await ctx.settle(400)

  const { button } = await ctx.openPanel()
  assert.equal(button.querySelector('.dsh-an-headerCount'), null, 'legacy notes are not shown once the host is authoritative')
  await ctx.act(async () => { button.click() })
  const popover = ctx.window.document.querySelector('.dsh-an-popover')
  const status = popover.querySelector('.dsh-an-storageStatus')
  assert.match(status.textContent, /便笺存储暂不可用/)
  assert.match(status.textContent, /STORE_OPEN_FAILED/)
  assert.equal(popover.querySelector('details.dsh-an-footerDetails').open, false)
  assert.doesNotMatch(popover.textContent, /旧便笺/)
  const reconnect = status.querySelector('button.dsh-an-reconnect')
  assert.ok(reconnect, 'reconnection is available directly in the panel')

  const field = popover.querySelector('.dsh-an-input')
  assert.ok(status.compareDocumentPosition(field) & ctx.window.Node.DOCUMENT_POSITION_FOLLOWING,
    'the failure appears above the note composer')
  const setter = Object.getOwnPropertyDescriptor(ctx.window.HTMLTextAreaElement.prototype, 'value').set
  await ctx.act(async () => {
    setter.call(field, '不应写入')
    field.dispatchEvent(new ctx.window.Event('input', { bubbles: true }))
  })
  await ctx.act(async () => { popover.querySelector('.dsh-an-addBtn').click() })
  await ctx.settle(40)

  const legacy = ctx.window.localStorage.getItem(SESSION_KEY)
  assert.deepEqual(JSON.parse(legacy).sessions['session-1'].items.map(item => item.text), ['旧便笺'])
  assert.equal(ctx.calls.some(call => call.url === STORE_PATH && call.method === 'POST'), false)

  options.storeDown = false
  const count = ctx.calls.length
  await ctx.act(async () => { reconnect.click() })
  await ctx.settle()
  assert.ok(ctx.calls.slice(count).some(call => call.url === STORE_PATH && call.method === 'GET'))
  assert.equal(popover.querySelector('.dsh-an-storageStatus, .dsh-an-reconnect'), null)
  assert.equal(popover.querySelector('details.dsh-an-footerDetails').open, false)
  assert.deepEqual([...popover.querySelectorAll('.dsh-an-text')].map(row => row.textContent), ['宿主便笺'])
  assert.equal(field.value, '不应写入', 'the failed draft stays available after reconnection')
  assert.equal(ctx.window.localStorage.getItem(MODE_KEY), 'host')

  await ctx.act(async () => { popover.querySelector('.dsh-an-addBtn').click() })
  await ctx.settle()
  const snapshot = await ctx.store.snapshot()
  assert.deepEqual(snapshot.data.workspaces[UNASSIGNED].items.map(item => item.text), ['不应写入', '宿主便笺'])
  assert.deepEqual(snapshot.data.sessions, {})
  assert.equal(ctx.window.localStorage.getItem(SESSION_KEY), legacy)
})

test('STORE-022 已连接宿主写入失败后可重新连接', async t => {
  const options = { markedHost: true, legacyNote: true }
  const ctx = await setup(options)
  t.after(() => ctx.window.close())
  const { button } = await ctx.openPanel()
  await ctx.act(async () => { button.click() })
  const popover = ctx.window.document.querySelector('.dsh-an-popover')
  assert.equal(popover.querySelector('.dsh-an-storageStatus'), null)
  const legacy = ctx.window.localStorage.getItem(SESSION_KEY)

  options.storeDown = true
  const beforeWrite = ctx.calls.length
  await ctx.addNote('连接中断期间的草稿')
  // A 503 gets one retry before the store reports the failed write.
  await ctx.settle(350)
  assert.ok(ctx.calls.slice(beforeWrite).some(call => call.url === STORE_PATH && call.method === 'POST'))
  const status = popover.querySelector('.dsh-an-storageStatus')
  assert.match(status.textContent, /STORE_UNAVAILABLE/)
  const input = popover.querySelector('.dsh-an-input')
  assert.equal(input.value, '连接中断期间的草稿')
  assert.deepEqual((await ctx.store.snapshot()).data.workspaces, {})
  assert.equal(ctx.window.localStorage.getItem(SESSION_KEY), legacy)

  options.storeDown = false
  const count = ctx.calls.length
  const reconnect = status.querySelector('button.dsh-an-reconnect')
  reconnect.focus()
  await ctx.act(async () => { reconnect.click() })
  await ctx.settle()
  assert.ok(ctx.calls.slice(count).some(call => call.url === STORE_PATH && call.method === 'GET'))
  assert.equal(popover.querySelector('.dsh-an-storageStatus'), null)
  assert.equal(ctx.window.document.activeElement, input, 'reconnection returns focus to the preserved draft')
  assert.equal(input.value, '连接中断期间的草稿')

  await ctx.act(async () => { popover.querySelector('.dsh-an-addBtn').click() })
  await ctx.settle()
  const saved = (await ctx.store.snapshot()).data.workspaces[UNASSIGNED].items
  assert.deepEqual(saved.map(item => item.text), ['连接中断期间的草稿'])
  assert.equal(ctx.window.localStorage.getItem(SESSION_KEY), legacy)
})

test('STORE-021 宿主已有数据时不迁移并保留本地旧副本', async t => {
  const hostNote = { id: 'host-1', text: '宿主便笺', done: false, createdAt: 2, updatedAt: 2 }
  const ctx = await setup({ legacyNote: true, hostSeed: { sessions: { 'session-1': [hostNote] } } })
  t.after(() => ctx.window.close())

  assert.equal(ctx.window.localStorage.getItem(MODE_KEY), 'host')
  assert.equal(ctx.calls.filter(call => call.method === 'POST').length, 0, 'a non-empty host is never migrated into')
  const snapshot = await ctx.store.snapshot()
  assert.deepEqual(snapshot.data.workspaces[UNASSIGNED].items.map(item => item.text), ['宿主便笺'])

  const { button } = await ctx.openPanel()
  assert.equal(button.querySelector('.dsh-an-headerCount').textContent, '1')
  await ctx.act(async () => { button.click() })
  const popover = ctx.window.document.querySelector('.dsh-an-popover')
  assert.match(popover.textContent, /宿主便笺/)
  const legacy = JSON.parse(ctx.window.localStorage.getItem(SESSION_KEY))
  assert.equal(legacy.sessions['session-1'].items[0].text, '旧便笺', 'the browser copy stays as a recovery source')
})

test('STORE-025 宿主文件打不开时不切换并提示', async t => {
  const ctx = await setup({ legacyNote: true, storeDown: true, storeCode: 'STORE_OPEN_FAILED' })
  t.after(() => ctx.window.close())
  await ctx.settle(400)

  assert.equal(ctx.window.localStorage.getItem(MODE_KEY), null, 'an unreadable host file is not a switch')
  const { button } = await ctx.openPanel()
  assert.equal(button.querySelector('.dsh-an-headerCount').textContent, '1')
  await ctx.act(async () => { button.click() })
  await ctx.addNote('仍然本地')

  assert.deepEqual(browserNotes(ctx.window).map(item => item.text), ['仍然本地', '旧便笺'])
  assert.deepEqual(JSON.parse(ctx.window.localStorage.getItem(SESSION_KEY)).sessions, {})
  const snapshot = await ctx.store.snapshot()
  assert.deepEqual(snapshot.data.workspaces, {}, 'no host write happened')
})

test('STORE-028 存储详情按需加载路径并支持拷贝与定位', async t => {
  const file = '/Users/me/.dsh/storages/aside_note.json'
  const probe = Promise.withResolvers()
  const options = { legacyNote: true, storePath: file, storeReady: probe.promise }
  t.after(() => probe.resolve())
  const ctx = await setup(options)
  t.after(() => ctx.window.close())
  const copied = []
  Object.defineProperty(ctx.window.navigator, 'clipboard', {
    configurable: true,
    value: { writeText: async value => { copied.push(value) } },
  })

  const { button } = await ctx.openPanel()
  await ctx.act(async () => { button.click() })
  const popover = ctx.window.document.querySelector('.dsh-an-popover')
  const footer = popover.querySelector('.dsh-an-popFoot')
  const details = footer.querySelector('details.dsh-an-footerDetails')
  const summary = details.querySelector(':scope > summary.dsh-an-storageToggle')
  const body = () => details.querySelector('.dsh-an-footerBody')
  const locationCalls = () => ctx.calls.filter(call => call.url === LOCATION_PATH)
  const toggleStorage = async () => {
    await ctx.act(async () => { summary.click() })
    await ctx.settle()
  }

  assert.equal(details.open, false)
  assert.equal(footer.textContent.trim(), '存储与更新')
  assert.equal(body(), null)
  assert.deepEqual(locationCalls(), [], 'opening the panel does not fetch a file path')

  await toggleStorage()
  assert.equal(details.open, true)
  assert.match(body().textContent, /正在读取便笺…/)
  assert.deepEqual(locationCalls(), [], 'the path is unavailable while the host probe is pending')

  await toggleStorage()
  await ctx.act(async () => { probe.resolve() })
  await ctx.settle()
  assert.equal(ctx.window.localStorage.getItem(MODE_KEY), 'host')
  assert.equal(footer.textContent.trim(), '存储与更新')
  assert.equal(body(), null)
  assert.deepEqual(locationCalls(), [], 'connecting to the host with the disclosure closed does not fetch a path')

  await toggleStorage()
  assert.equal(details.open, true)
  assert.match(body().textContent, /便笺保存在 DSH 本地文件/)
  assert.deepEqual(locationCalls(), [{ url: LOCATION_PATH, method: 'GET' }])
  assert.equal(details.querySelector('.dsh-an-storagePath').textContent, file)
  const actions = [...details.querySelectorAll('button.dsh-an-storageAction')]
  assert.equal(actions.length, 2)

  await ctx.act(async () => { actions[0].click() })
  await ctx.settle(10)
  assert.deepEqual(copied, [file])

  await ctx.act(async () => { actions[1].click() })
  await ctx.settle(10)
  assert.ok(ctx.calls.some(call => call.url === REVEAL_PATH && call.method === 'POST'))

  await toggleStorage()
  assert.equal(details.open, false)
  assert.equal(body(), null)
  assert.equal(locationCalls().length, 1, 'closing the disclosure does not fetch the path again')

  options.storePath = null
  await toggleStorage()
  assert.equal(locationCalls().length, 2)
  assert.match(details.textContent, /无法定位存储文件/)
  assert.equal(details.querySelector('.dsh-an-storagePath, .dsh-an-storageAction'), null)
})

test('STORE-029 共用宿主文件已被占用时停止写入', async t => {
  const ctx = await setup({ legacyNote: true, storeDown: true, storeCode: 'STORE_IN_USE' })
  t.after(() => ctx.window.close())
  await ctx.settle(400)

  assert.equal(ctx.window.localStorage.getItem(MODE_KEY), null)
  const legacy = ctx.window.localStorage.getItem(SESSION_KEY)
  const { button } = await ctx.openPanel()
  assert.equal(button.querySelector('.dsh-an-headerCount'), null)
  await ctx.act(async () => { button.click() })
  const popover = ctx.window.document.querySelector('.dsh-an-popover')
  const status = () => popover.querySelector('.dsh-an-storageStatus')
  assert.match(status().textContent, /AsideNote/)
  assert.match(status().textContent, /STORE_IN_USE/)
  assert.doesNotMatch(popover.textContent, /旧便笺/)
  await ctx.addNote('不得改写浏览器便笺')

  const count = ctx.calls.length
  await ctx.act(async () => { status().querySelector('button.dsh-an-reconnect').click() })
  await ctx.settle(400)
  assert.ok(ctx.calls.slice(count).some(call => call.url === STORE_PATH && call.method === 'GET'))
  assert.match(status().textContent, /STORE_IN_USE/, 'the status stays visible if reconnection fails')
  assert.equal(popover.querySelector('.dsh-an-addBtn').disabled, true)
  assert.equal(popover.querySelector('.dsh-an-empty, .dsh-an-row'), null)
  assert.equal(ctx.window.localStorage.getItem(SESSION_KEY), legacy)
  assert.equal(ctx.window.localStorage.getItem(MODE_KEY), null)
  assert.equal(ctx.calls.some(call => call.url === STORE_PATH && call.method === 'POST'), false)
})

function transferFiles(window, target, eventType, files) {
  const event = new window.Event(eventType, { bubbles: true, cancelable: true })
  const transfer = { types: ['Files'], files, getData: () => '' }
  Object.defineProperty(event, eventType === 'paste' ? 'clipboardData' : 'dataTransfer', { value: transfer })
  target.dispatchEvent(event)
  assert.equal(event.defaultPrevented, true)
}

test('NOTE-011 附件可选择粘贴拖放并随便笺恢复', async t => {
  const ctx = await setup()
  const { window, act, store } = ctx
  t.after(() => window.close())
  const { button } = await ctx.openPanel()
  const panel = () => window.document.querySelector('.dsh-an-popover')
  const toggle = () => act(async () => { button.click() })
  await toggle()

  const select = (name, type) => {
    const picker = panel().querySelector('input[type=file]')
    Object.defineProperty(picker, 'files', { configurable: true, value: [new window.File(['file'], name, { type })] })
    picker.dispatchEvent(new window.Event('change', { bubbles: true }))
  }
  await act(async () => select('截图.png', 'image/png'))
  await act(async () => transferFiles(window, panel().querySelector('textarea'), 'paste', [new window.File(['audio'], '语音.wav', { type: 'audio/wav' })]))
  await act(async () => transferFiles(window, panel().querySelector('form'), 'drop', [new window.File(['video'], '录屏.mp4', { type: 'video/mp4' })]))
  await act(async () => select('数据.csv', 'text/csv'))
  const draftNames = () => [...panel().querySelectorAll('form .dsh-an-attachmentName')].map(node => node.textContent)
  assert.deepEqual(draftNames(), ['截图.png', '语音.wav', '录屏.mp4', '数据.csv'])
  await toggle()
  await toggle()
  assert.deepEqual(draftNames(), ['截图.png', '语音.wav', '录屏.mp4', '数据.csv'])
  await act(async () => { panel().querySelector('[aria-label="移除 数据.csv"]').click() })
  await act(async () => { panel().querySelector('.dsh-an-addBtn').click() })
  assert.deepEqual(draftNames(), [])
  const note = (await store.snapshot()).data.workspaces[UNASSIGNED].items[0]
  assert.equal(note.text, '')
  assert.deepEqual(note.attachments.map(attachment => attachment.name), ['截图.png', '语音.wav', '录屏.mp4'])
  const row = panel().querySelector('.dsh-an-row')
  await act(async () => { for (const preview of row.querySelectorAll('.dsh-an-attachmentName')) preview.click() })
  assert.deepEqual(ctx.previewUrls, ['image/png', 'audio/wav', 'video/mp4'])
  assert.ok(row.querySelector('img[alt="截图.png"]'))
  assert.ok(row.querySelector('audio[controls]'))
  assert.ok(row.querySelector('video[controls]'))
  const download = row.querySelector('[download="截图.png"]')
  assert.equal(new window.URL(download.href).searchParams.get('id'), note.attachments[0].id)
  await act(async () => { row.querySelector('[aria-label="退回"]').click() })
  assert.deepEqual(draftNames(), ['截图.png', '语音.wav', '录屏.mp4'])
  assert.deepEqual((await store.snapshot()).data.workspaces[UNASSIGNED].items, [])
})

test('NOTE-012 拒绝无效附件并保留上传失败前的草稿', async t => {
  const ctx = await setup({ uploadDown: true })
  const { window, act, calls } = ctx
  t.after(() => window.close())
  const { button } = await ctx.openPanel()
  await act(async () => { button.click() })
  const textarea = window.document.querySelector('.dsh-an-input')
  const form = textarea.closest('form')
  const uploads = () => calls.filter(call => call.url === '/dsh-sideby-note/attachments' && call.method === 'POST')
  await act(async () => {
    const setter = Object.getOwnPropertyDescriptor(window.HTMLTextAreaElement.prototype, 'value').set
    setter.call(textarea, '先留在这里')
    textarea.dispatchEvent(new window.Event('input', { bubbles: true }))
    transferFiles(window, form, 'drop', [new window.File([], '空文件.txt')])
  })
  assert.equal(uploads().length, 0)
  await act(async () => transferFiles(window, form, 'drop', [new window.File(['data'], '读不到.txt')]))
  assert.equal(uploads().length, 1)
  assert.equal(textarea.value, '先留在这里')
  assert.equal(form.querySelector('.dsh-an-attachments'), null)
  assert.equal(form.querySelector('.dsh-an-addBtn').disabled, false)
})
