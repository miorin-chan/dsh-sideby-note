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
import * as ReactJSXRuntime from 'react/jsx-runtime'
import { createStore } from '../host/store.js'
import { fakeCtx, fakeDomain } from './fake-store.mts'

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
  const composerScopes = new Map()
  const previewUrls = []
  window.URL.createObjectURL = blob => `blob:https://example.test/preview-${previewUrls.push(blob.type)}`
  const revokedPreviews = []
  window.URL.revokeObjectURL = url => revokedPreviews.push(url)
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
      if (await options.rejectAttachmentRead?.(id, init.signal)) return json(404, {})
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
    'react/jsx-runtime': ReactJSXRuntime,
    'react-dom': ReactDOM,
    'react-dom/client': ReactDOMClient,
    '@deepseek-ai/dsh-client-ui-primitives': {
      ImageLightbox: ({ src, alt, labels, onClose }) => ReactDOM.createPortal(
        React.createElement('div', {
          role: 'dialog', 'aria-label': labels.dialog,
          onKeyDown: event => { if (event.key === 'Escape') onClose() },
        }, React.createElement('img', { src, alt }), React.createElement('button', { onClick: onClose }, labels.close)),
        window.document.body,
      ),
      FileTypeIcon: ({ path }) => React.createElement('svg', { 'data-file-type-path': path }),
      IconCloseFillRegular: () => React.createElement('svg'),
      IconChevronLeftOutlineRegular: () => React.createElement('svg'),
      IconChevronRightOutlineRegular: () => React.createElement('svg'),
      fileExtension: name => name.split('.').at(-1),
      fileSizeText: bytes => `${bytes} B`,
      Toast: ({ text }) => React.createElement('span', { 'data-test-toast': '' }, text),
    },
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
    get: name => ({ locale, sessions: { scope: sessionId => composerScopes.get(sessionId) } })[name],
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
      const ToastHost = registered.find(entry => entry.meta.name === 'shell.overlay').component
      reactRoot.render(React.createElement(React.Fragment, null,
        React.createElement(capture, { sessionId: 'session-1', ...props }),
        React.createElement(ToastHost),
      ))
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

  return { window, dom, domain, store, calls, composerScopes, previewUrls, revokedPreviews, openPanel, addNote, settle, act }
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
  const staleRejectedWrite = Promise.withResolvers()
  const latestWrite = Promise.withResolvers()
  const writes = [globalWrite, workspaceWrite, rejectedWrite, staleRejectedWrite, latestWrite]
  const queue = [...writes]
  const ctx = await setup({ beforeSetPrefs: () => queue.shift()?.promise })
  t.after(async () => {
    await ctx.act(async () => { for (const write of writes) write.resolve() })
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

  await ctx.act(async () => { scopeButton('global').click() })
  await ctx.act(async () => { scopeButton('workspace').click() })
  await ctx.act(async () => { staleRejectedWrite.resolve(json(403, {})) })
  assert.equal(selectedScope(), 'workspace')
  assert.ok(!ctx.window.document.querySelector('.dsh-an-reconnect'), 'a superseded failure does not interrupt switching')
  await ctx.act(async () => { latestWrite.resolve() })
  assert.equal(selectedScope(), 'workspace')
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

function mountChatComposer({ window, composerScopes }, sessionId = 'session-1', draft = '', existingFiles = []) {
  // jsdom has no ClipboardEvent or DataTransfer constructor. The fake host
  // consumes the browser event and publishes ids like the shipped Composer.
  window.ClipboardEvent ??= class extends window.Event {
    constructor(type, init) {
      super(type, init)
      this.clipboardData = init.clipboardData
    }
  }
  window.DataTransfer ??= class {
    files = []
    items = { add: file => this.files.push(file) }
    text = ''
    setData(type, value) { assert.equal(type, 'text/plain'); this.text = value }
    getData(type) { return type === 'text/plain' ? this.text : '' }
  }
  const root = window.document.createElement('div')
  root.dataset.conversationSession = sessionId
  root.innerHTML = '<div data-composer-input contenteditable="true" role="textbox"></div>'
  window.document.body.appendChild(root)
  const editor = root.firstElementChild
  editor.getBoundingClientRect = () => ({ width: 480, height: 50 })
  const chat = { draft, files: [...existingFiles], acceptFiles: true, pastes: 0 }
  const textNode = editor.appendChild(window.document.createTextNode(draft))
  const selection = window.getSelection()
  let start = draft.length
  let end = draft.length
  // The native editor keeps its own selection until selectionchange is delivered.
  window.document.addEventListener('selectionchange', () => {
    if (selection.anchorNode === editor && selection.focusNode === editor) {
      start = end = textNode.length
    } else if (selection.anchorNode === textNode && selection.focusNode === textNode) {
      start = selection.anchorOffset
      end = selection.focusOffset
    }
  })
  chat.select = (anchor, focus) => {
    editor.focus()
    selection.setBaseAndExtent(textNode, anchor, textNode, focus)
    window.document.dispatchEvent(new window.Event('selectionchange'))
  }
  Object.defineProperty(editor, 'innerText', { get: () => chat.draft })
  const state = { getSnapshot: () => ({ draft: chat.draft, attachmentIds: chat.files.map((_, index) => String(index)) }) }
  const sessionInput = { state }
  composerScopes.set(sessionId, { get: name => name === 'conversation' ? { input: { for: () => sessionInput } } : undefined })
  editor.addEventListener('paste', event => {
    chat.pastes += 1
    const { files } = event.clipboardData
    event.preventDefault()
    if (chat.acceptFiles) chat.files.push(...files)
    const text = event.clipboardData.getData('text/plain')
    if (text) {
      const draft = chat.draft.slice(0, start) + text + chat.draft.slice(end)
      window.queueMicrotask(() => {
        chat.draft = draft
        textNode.data = draft
      })
    }
  })
  return chat
}

test('NOTE-011 附件可选择粘贴拖放并随便笺恢复', async t => {
  const ctx = await setup()
  const { window, act, store } = ctx
  t.after(() => window.close())
  const composer = mountChatComposer(ctx)
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
  const draftRail = () => panel().querySelector('form [role="group"][aria-label="附件"]')
  const draftNames = () => [...(draftRail()?.querySelectorAll('a[download]') ?? [])].map(node => node.download)
  assert.deepEqual(draftNames(), ['截图.png', '语音.wav', '录屏.mp4', '数据.csv'])
  const thumbnail = draftRail().querySelector('[aria-label="预览 截图.png"]')
  const image = thumbnail.querySelector('img')
  assert.equal(thumbnail.disabled, true, 'preview waits for the thumbnail to decode')
  assert.match(thumbnail.className, /ComposerAttachments-module-thumbnail/)
  await act(async () => { image.dispatchEvent(new window.Event('load')) })
  assert.equal(thumbnail.disabled, false)
  await act(async () => { thumbnail.click() })
  const dialog = window.document.querySelector('[role="dialog"][aria-label="预览 截图.png"]')
  assert.equal(dialog.querySelector('img').src, image.src)
  await act(async () => {
    dialog.dispatchEvent(new window.Event('pointerdown', { bubbles: true }))
    dialog.dispatchEvent(new window.KeyboardEvent('keydown', { key: 'Escape', bubbles: true }))
  })
  assert.equal(dialog.isConnected, false)
  assert.ok(panel())
  assert.equal(window.document.activeElement, thumbnail)
  const rail = draftRail()
  Object.defineProperties(rail, { clientWidth: { value: 240 }, scrollWidth: { value: 990 } })
  let page
  rail.scrollBy = options => { page = options }
  rail.scrollLeft = 0
  await act(async () => { rail.dispatchEvent(new window.Event('scroll')) })
  const next = rail.parentElement.querySelector('[aria-label="向右滚动附件"]')
  assert.ok(next)
  await act(async () => { next.click() })
  assert.equal(page.left, 200)
  assert.equal(page.behavior, 'smooth')
  await toggle()
  assert.deepEqual(ctx.revokedPreviews, [image.src])
  await toggle()
  assert.deepEqual(draftNames(), ['截图.png', '语音.wav', '录屏.mp4', '数据.csv'])
  await act(async () => { draftRail().querySelector('img').dispatchEvent(new window.Event('error')) })
  assert.equal(draftRail().querySelector('button[aria-label="预览 截图.png"]'), null)
  assert.ok(draftRail().querySelector('[data-file-type-path="截图.png"]'))
  assert.match(draftRail().textContent, /无法预览，可下载原文件/)
  await act(async () => { panel().querySelector('[aria-label="移除 数据.csv"]').click() })
  await act(async () => { panel().querySelector('.dsh-an-addBtn').click() })
  assert.deepEqual(draftNames(), [])
  const note = (await store.snapshot()).data.workspaces[UNASSIGNED].items[0]
  assert.equal(note.text, '')
  assert.deepEqual(note.attachments.map(attachment => attachment.name), ['截图.png', '语音.wav', '录屏.mp4'])
  const checkSavedImage = async row => {
    assert.deepEqual([...row.querySelectorAll('a[download]')].map(link => link.download), ['截图.png', '语音.wav', '录屏.mp4'])
    assert.equal(row.querySelector('[aria-label="移除 截图.png"]'), null)
    const thumb = row.querySelector('button[aria-label="预览 截图.png"]')
    assert.match(thumb.className, /ComposerAttachments-module-thumbnail/)
    const original = thumb.querySelector('img')
    await act(async () => { original.dispatchEvent(new window.Event('load')) })
    await act(async () => { thumb.click() })
    const lightbox = window.document.querySelector('[role="dialog"][aria-label="预览 截图.png"]')
    assert.equal(lightbox.querySelector('img').src, original.src)
    await act(async () => {
      lightbox.dispatchEvent(new window.Event('pointerdown', { bubbles: true }))
      lightbox.dispatchEvent(new window.KeyboardEvent('keydown', { key: 'Escape', bubbles: true }))
    })
    assert.equal(lightbox.isConnected, false)
    assert.equal(window.document.activeElement, thumb)
    return original.src
  }
  const row = panel().querySelector('.dsh-an-row')
  const openImageUrl = await checkSavedImage(row)
  const previews = [...row.querySelectorAll('button.dsh-an-attachmentBody')]
  for (const [index, media] of ['audio[controls]', 'video[controls]'].entries()) {
    const trigger = previews[index]
    await act(async () => { trigger.click() })
    assert.deepEqual(previews.filter(button => button.getAttribute('aria-expanded') === 'true'), [trigger])
    assert.equal(row.querySelectorAll('.dsh-an-attachmentPreview').length, 1)
    const preview = window.document.getElementById(trigger.getAttribute('aria-controls'))
    assert.equal(preview.closest('li'), trigger.closest('li').nextElementSibling)
    assert.ok(preview.querySelector(media))
  }
  await act(async () => { previews[1].click() })
  assert.equal(row.querySelector('.dsh-an-attachmentPreview'), null)
  assert.deepEqual(ctx.previewUrls.slice(-3), ['image/png', 'audio/wav', 'video/mp4'])
  const download = row.querySelector('[download="截图.png"]')
  assert.equal(new window.URL(download.href).searchParams.get('id'), note.attachments[0].id)
  await act(async () => { row.querySelector('[aria-label="填入"]').click() })
  assert.deepEqual(composer.files.map(file => file.name), ['截图.png', '语音.wav', '录屏.mp4'])
  assert.equal(composer.draft, '')
  assert.ok(ctx.revokedPreviews.includes(openImageUrl))
  const archiveToggle = [...panel().querySelectorAll('.dsh-an-doneToggle')].find(button => button.textContent.includes('归档'))
  if (archiveToggle.getAttribute('aria-expanded') === 'false') await act(async () => { archiveToggle.click() })
  const archive = panel().querySelector('.dsh-an-rowArchived')
  const archivedImageUrl = await checkSavedImage(archive)
  await act(async () => { archive.querySelector('[aria-label="退回"]').click() })
  assert.ok(ctx.revokedPreviews.includes(archivedImageUrl))
  assert.deepEqual(draftNames(), ['截图.png', '语音.wav', '录屏.mp4'])
  assert.deepEqual((await store.snapshot()).data.workspaces[UNASSIGNED].items, [])
})

async function addNoteWithFiles(ctx, text, files) {
  const panel = ctx.window.document.querySelector('.dsh-an-popover')
  await ctx.act(async () => transferFiles(ctx.window, panel.querySelector('form'), 'drop', files))
  await ctx.addNote(text)
  return panel.querySelector('.dsh-an-row:not(.dsh-an-rowArchived) .dsh-an-insert')
}

const openHostNotes = async ctx => {
  const { button } = await ctx.openPanel()
  await ctx.act(async () => { button.click() })
}

test('FWD-007 填入保留正文和全部原文件', async t => {
  const ctx = await setup()
  const { window, act, store } = ctx
  t.after(() => window.close())
  const oldFile = new window.File(['original'], '已有.txt')
  const chat = mountChatComposer(ctx, 'session-1', '原草稿\n', [oldFile])
  await openHostNotes(ctx)
  const originals = [
    new window.File(['image'], '截图.png', { type: 'image/png' }),
    new window.File(['audio'], '录音.wav', { type: 'audio/wav' }),
    new window.File(['video'], '录屏.mp4', { type: 'video/mp4' }),
    new window.File(['data'], '数据.csv', { type: 'text/csv' }),
  ]
  const insert = await addNoteWithFiles(ctx, '便笺正文', originals)
  assert.equal(insert.getAttribute('aria-label'), '填入')
  chat.select(0, 1)
  await act(async () => { insert.click() })
  assert.equal(chat.draft, '原草稿\n便笺正文')
  assert.equal(chat.files[0], oldFile)
  for (const [index, original] of originals.entries()) {
    const inserted = chat.files[index + 1]
    assert.equal(inserted.name, original.name)
    assert.equal(inserted.type, original.type)
    assert.equal(await inserted.text(), await original.text())
  }
  assert.equal(chat.files.length, 5)
  assert.equal((await store.snapshot()).data.workspaces[UNASSIGNED].items[0].done, true)

  const onlyFiles = await addNoteWithFiles(ctx, '', [originals[1]])
  await act(async () => { onlyFiles.click() })
  assert.equal(chat.draft, '原草稿\n便笺正文')
  assert.equal(chat.files.at(-1).name, '录音.wav')
  assert.ok((await store.snapshot()).data.workspaces[UNASSIGNED].items.every(item => item.done))
})

test('FWD-008 附件不可用或拒收时保留待续便笺', async t => {
  let readFails = false
  const ctx = await setup({ rejectAttachmentRead: id => readFails && id.endsWith('2') })
  const { window, act, store } = ctx
  t.after(() => window.close())
  const chat = mountChatComposer(ctx, 'session-1', '原草稿')
  await openHostNotes(ctx)
  const insert = await addNoteWithFiles(ctx, '带两个文件', [
    new window.File(['audio'], '录音.wav', { type: 'audio/wav' }),
    new window.File(['data'], '文件.txt'),
  ])
  readFails = true
  await act(async () => { insert.click() })
  assert.equal(chat.draft, '原草稿')
  assert.equal(chat.pastes, 0)
  assert.equal((await store.snapshot()).data.workspaces[UNASSIGNED].items[0].done, false)
  const toast = () => window.document.querySelector('[data-test-toast]').textContent
  assert.match(toast(), /无法读取便笺附件/)

  readFails = false
  chat.acceptFiles = false
  await act(async () => { insert.click() })
  assert.equal(chat.draft, '原草稿')
  assert.deepEqual(chat.files, [])
  assert.equal((await store.snapshot()).data.workspaces[UNASSIGNED].items[0].done, false)
  assert.match(toast(), /无法接收这组附件/)

  chat.acceptFiles = true
  await act(async () => { insert.click() })
  assert.equal(chat.draft, '原草稿\n带两个文件')
  assert.deepEqual(chat.files.map(file => file.name), ['录音.wav', '文件.txt'])
  assert.equal((await store.snapshot()).data.workspaces[UNASSIGNED].items[0].done, true)
})

test('FWD-009 附件读取期间切换会话不写错草稿', async t => {
  const entered = Promise.withResolvers()
  const release = Promise.withResolvers()
  let reads = 0
  const ctx = await setup({ rejectAttachmentRead: async (_id, signal) => {
    reads += 1
    entered.resolve(signal)
    await release.promise
    return false
  } })
  const { window, act, store } = ctx
  t.after(() => window.close())
  const first = mountChatComposer(ctx, 'session-1', '原会话')
  const second = mountChatComposer(ctx, 'session-2', '新会话')
  await openHostNotes(ctx)
  const insert = await addNoteWithFiles(ctx, '等待附件读取', [new window.File(['audio'], '录音.wav', { type: 'audio/wav' })])
  await act(async () => { insert.click(); insert.click() })
  const signal = await entered.promise
  assert.equal(reads, 1)
  assert.equal(insert.getAttribute('aria-busy'), 'true')
  await ctx.openPanel({ sessionId: 'session-2' })
  assert.equal(signal.aborted, true)
  await act(async () => { release.resolve() })
  assert.deepEqual([first.draft, second.draft], ['原会话', '新会话'])
  assert.equal(first.pastes + second.pastes, 0)
  assert.equal((await store.snapshot()).data.workspaces[UNASSIGNED].items[0].done, false)
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
