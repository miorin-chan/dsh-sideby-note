/**
 * Resilience cases: ordering, undo, scope fallbacks, storage failures and
 * cross-tab refreshes. Every case here was designed in tests/catalog first and
 * its acceptance criteria live there; this file is the implementation.
 */
import test from 'node:test'
import assert from 'node:assert/strict'
import { bindingIssue, isWebBindingAllowed, normalizeBinding } from '@deepseek-ai/dsh-client-shortcuts/protocol'
import { bootBundle } from './testkit/bundle.mts'

const note = (id, text, createdAt, extra = {}) => ({
  id, text, done: false, createdAt, updatedAt: createdAt, ...extra,
})

const seedSession = (window, items) => {
  window.localStorage.setItem('dsh.aside-note', JSON.stringify({
    version: 1,
    sessions: { 'session-1': { sessionId: 'session-1', updatedAt: 1, items } },
  }))
}

const WORKSPACE_KEY = 'dsh.aside-note.workspaces'
const UNASSIGNED = 'sideby-note:unassigned'
const standaloneItems = window => JSON.parse(window.localStorage.getItem(WORKSPACE_KEY))
  .workspaces[UNASSIGNED].items
const seedStandalone = (window, items) => {
  window.localStorage.setItem(WORKSPACE_KEY, JSON.stringify({
    version: 1,
    workspaces: { [UNASSIGNED]: { workspaceId: UNASSIGNED, updatedAt: 1, items } },
  }))
}

const workspaceProps = (title = '共享工作区') => ({
  useWorkspaces: selector => selector({
    items: [{
      workspaceId: 'ws-1', path: '/repo', title,
      sessionIds: ['session-1'], createdAt: '', updatedAt: '',
    }],
    archivedSessionIds: [],
    pinnedSessionIds: [],
    state: 'idle',
    phase: 'ready',
    error: null,
  }),
})

const blankSessions = () => ({
  useSessions: selector => selector({ byId: { 'session-1': { id: 'session-1', blank: true } } }),
})

const rowsOf = root => [...root.querySelectorAll('.dsh-an-row')]
const textOf = row => row.querySelector('.dsh-an-text')?.textContent ?? ''

const typeInto = async (app, node, text) => {
  await app.act(async () => {
    const setter = Object.getOwnPropertyDescriptor(app.window.HTMLTextAreaElement.prototype, 'value').set
    setter.call(node, text)
    node.dispatchEvent(new app.window.Event('input', { bubbles: true }))
  })
}

const rowByText = (root, text) => rowsOf(root).find(row => textOf(row) === text)

test('NOTE-007 已完成条目按完成时间倒序', async t => {
  const app = await bootBundle(t, {
    prepare: window => seedSession(window, [note('a', '甲', 1), note('b', '乙', 2), note('c', '丙', 3)]),
  })
  await app.open()

  // Complete 甲 first, then 丙: the later completion must sit on top.
  for (const text of ['甲', '丙']) {
    await app.act(async () => { rowByText(app.popover, text).querySelector('.dsh-an-insert').click() })
    await app.settle(20)
  }
  await app.act(async () => { app.popover.querySelector('.dsh-an-doneHead .dsh-an-doneToggle').click() })
  await app.settle(20)

  const done = [...app.popover.querySelectorAll('.dsh-an-doneRows .dsh-an-row')].map(textOf)
  assert.deepEqual(done, ['丙', '甲'], 'the most recently completed note comes first')
  assert.equal(app.button.querySelector('.dsh-an-headerCount').textContent, '1', 'the badge counts the one open note')
  await app.dispose()
})

test('NOTE-008 归档条目退回后可重新提交到待续区', async t => {
  const app = await bootBundle(t, {
    prepare: window => seedSession(window, [note('a', '甲', 1), note('b', '乙', 2)]),
  })
  await app.open()

  await app.act(async () => { rowByText(app.popover, '甲').querySelector('.dsh-an-insert').click() })
  await app.settle(40)
  assert.equal(app.button.querySelector('.dsh-an-headerCount').textContent, '1')
  const archived = standaloneItems(app.window).find(item => item.id === 'a')
  assert.equal(archived.done, true)
  assert.ok(archived.completedAt > 0, 'archiving stamps the completion time')

  await app.act(async () => { app.popover.querySelector('.dsh-an-doneHead .dsh-an-doneToggle').click() })
  await app.act(async () => { rowByText(app.popover, '甲').querySelector('button[aria-label="退回"]').click() })
  assert.equal(app.popover.querySelector('.dsh-an-input').value, '甲')
  assert.equal(standaloneItems(app.window).some(item => item.id === 'a'), false, 'recall removes the archived row')
  await app.act(async () => { app.popover.querySelector('.dsh-an-addBtn').click() })
  await app.settle(40)

  const returned = standaloneItems(app.window).find(item => item.text === '甲')
  assert.equal(returned.done, false)
  assert.equal('completedAt' in returned, false)
  assert.equal(app.button.querySelector('.dsh-an-headerCount').textContent, '2')
  await app.dispose()
})

test('SCOPE-010 无工作区时只显示全局并写入未归属清单', async t => {
  const existingList = {
    workspaceId: 'ws-other', updatedAt: 1, items: [note('a', '其他工作区的便笺', 1)],
  }
  const app = await bootBundle(t, {
    prepare: window => window.localStorage.setItem(WORKSPACE_KEY, JSON.stringify({
      version: 1,
      workspaces: { 'ws-other': existingList },
    })),
    props: blankSessions(),
  })
  await app.open()

  assert.equal(app.popover.querySelector('.dsh-an-scopeBtn'), null, 'a single available scope has no switch')
  assert.equal(app.popover.querySelector('.dsh-an-scopeSummary .dsh-an-scopeCount').textContent, '1')
  assert.equal(app.button.dataset.scope, 'global')
  assert.match(app.button.title, /全局 · 1 条待续/)
  assert.deepEqual(rowsOf(app.popover).map(textOf), ['其他工作区的便笺'])
  const input = app.popover.querySelector('.dsh-an-input')
  assert.equal(input.placeholder, '随手记一条')

  await typeInto(app, input, '不绑定工作区的便笺')
  await app.act(async () => { app.popover.querySelector('.dsh-an-addBtn').click() })
  await app.settle(20)

  assert.deepEqual(standaloneItems(app.window).map(item => item.text), ['不绑定工作区的便笺'])
  assert.deepEqual(rowsOf(app.popover).map(textOf), ['不绑定工作区的便笺', '其他工作区的便笺'],
    'Global still orders by time when there is no current workspace')
  assert.deepEqual(JSON.parse(app.window.localStorage.getItem(WORKSPACE_KEY)).workspaces['ws-other'], existingList)
  assert.equal(app.window.localStorage.getItem('dsh.aside-note'), null, 'no legacy session list is created')
  await app.dispose()
})

test('SCOPE-011 空白会话遵循显式全局选择', async t => {
  const app = await bootBundle(t, {
    prepare: window => {
      seedSession(window, [note('a', '甲', 1)])
      window.localStorage.setItem('dsh.aside-note.scope-mode', 'global')
    },
    props: { ...workspaceProps(), ...blankSessions() },
  })
  await app.open()

  const counts = [...app.popover.querySelectorAll('.dsh-an-scopeCount')].map(node => node.textContent)
  assert.deepEqual(counts, ['1', '1'])
  assert.equal(app.popover.querySelector('.dsh-an-scopeName').textContent, '共享工作区')
  assert.equal(app.popover.querySelector('[data-scope-mode="global"]').getAttribute('aria-pressed'), 'true')
  assert.deepEqual(rowsOf(app.popover).map(textOf), ['甲'])
  assert.equal(app.window.localStorage.getItem('dsh.aside-note.scope-mode'), 'global',
    'opening a blank session does not rewrite the stored choice')
  await app.dispose()
})

test('SCOPE-016 待续计数等待宿主快照并保留完整工作区名称', async t => {
  const workspaceName = '一个用于检验单行标题栏在空间不足时如何显示完整名称的工作区'
  let resolveSnapshot
  const snapshot = new Promise(resolve => { resolveSnapshot = resolve })
  t.after(() => resolveSnapshot({ ok: false, status: 404, json: async () => ({}) }))
  const app = await bootBundle(t, {
    props: workspaceProps(workspaceName),
    fetch: url => url === '/dsh-sideby-note/store' ? snapshot : Promise.resolve({ ok: false, status: 404 }),
  })
  await app.open()
  const countTexts = () => [...app.popover.querySelectorAll('.dsh-an-scopeCount')].map(node => node.textContent)
  const workspaceButton = app.popover.querySelector('[data-scope-mode="workspace"]')
  assert.deepEqual(countTexts(), ['—', '—'])
  assert.equal(workspaceButton.querySelector('.dsh-an-scopeName').textContent, workspaceName)
  assert.match(workspaceButton.getAttribute('aria-label'), /正在读取便笺/)
  assert.match(app.popover.querySelector('.dsh-an-listStatus').textContent, /正在读取便笺/)
  assert.equal(app.popover.querySelector('.dsh-an-empty'), null)
  assert.equal(app.button.querySelector('.dsh-an-headerCount'), null)

  await app.act(async () => {
    resolveSnapshot({ ok: true, status: 200, json: async () => ({
      ok: true, data: { sessions: {}, prefs: {}, workspaces: {
        'ws-1': { workspaceId: 'ws-1', updatedAt: 1, items: [note('a', '归档', 1, { done: true, completedAt: 2 })] },
        'ws-2': { workspaceId: 'ws-2', updatedAt: 1, items: [note('b', '待续', 1)] },
      } },
    }) })
  })
  assert.deepEqual(countTexts(), ['1', '0'], 'archive does not count toward either scope')
  assert.equal(workspaceButton.getAttribute('aria-label'), `当前工作区：${workspaceName} · 0 条待续`)
  assert.equal(app.popover.querySelector('.dsh-an-listStatus'), null)
  assert.equal(app.button.querySelector('.dsh-an-headerCount'), null)
  assert.match(app.button.title, /0 条待续/)
  await app.dispose()
})

test('STORE-011 存储读不到时按空继续且不丢输入', async t => {
  const app = await bootBundle(t, {
    prepare: window => {
      Object.defineProperty(window, 'localStorage', {
        configurable: true,
        get() { throw new Error('denied') },
      })
    },
  })
  await app.open()

  assert.equal(rowsOf(app.popover).length, 0, 'an unreadable store renders an empty list')
  assert.equal(app.button.querySelector('.dsh-an-headerCount'), null,
    'an empty list hides the badge instead of showing 0')

  const input = app.popover.querySelector('.dsh-an-input')
  await typeInto(app, input, '还能打字吗')
  await app.act(async () => { app.popover.querySelector('.dsh-an-addBtn').click() })
  await app.settle(20)

  assert.equal(input.value, '还能打字吗', 'the typed text stays in the input')
  assert.equal(rowsOf(app.popover).length, 0, 'no phantom note is rendered')
  assert.match(app.popover.querySelector('.dsh-an-popFoot').textContent, /本地存储不可用/,
    'the panel says storage is unavailable')
  await app.dispose()
})

test('STORE-012 写入失败时读取不降级且保留输入', async t => {
  const app = await bootBundle(t, {
    prepare: window => {
      seedStandalone(window, [note('a', '已经保存的', 1)])
      const real = window.localStorage
      window.__realStorage = real
      Object.defineProperty(window, 'localStorage', {
        configurable: true,
        value: {
          getItem: key => real.getItem(key),
          removeItem: key => real.removeItem(key),
          setItem() {
            const error = new Error('quota')
            error.name = 'QuotaExceededError'
            throw error
          },
        },
      })
    },
  })
  await app.open()

  assert.deepEqual(rowsOf(app.popover).map(textOf), ['已经保存的'], 'a full store still reads normally')

  const input = app.popover.querySelector('.dsh-an-input')
  await typeInto(app, input, '写不进去的')
  await app.act(async () => { app.popover.querySelector('.dsh-an-addBtn').click() })
  await app.settle(20)

  assert.equal(input.value, '写不进去的', 'the typed text is kept')
  assert.deepEqual(rowsOf(app.popover).map(textOf), ['已经保存的'], 'the failed note never appears')
  const footer = app.popover.querySelector('.dsh-an-popFoot')
  assert.equal(footer.querySelector('details.dsh-an-footerDetails').open, false)
  assert.equal(footer.querySelector('.dsh-an-footerBody'), null)
  assert.match(footer.querySelector(':scope > [role="status"]')?.textContent ?? '', /本地存储不可用/,
    'the failure is visible outside the collapsed disclosure')

  assert.equal(standaloneItems({ localStorage: app.window.__realStorage }).length, 1, 'nothing half-written reached the store')
  await app.dispose()
})

test('STORE-016 另一个标签页写入后本页视图同步', async t => {
  const app = await bootBundle(t, {
    prepare: window => seedStandalone(window, [note('a', '甲', 1)]),
  })
  await app.open()
  assert.equal(rowsOf(app.popover).length, 1)

  // Another tab writes without this one seeing the event; the event is what the
  // browser would deliver afterwards.
  const store = JSON.parse(app.window.localStorage.getItem(WORKSPACE_KEY))
  store.workspaces[UNASSIGNED].items.unshift(note('b', '乙', 2))
  app.window.localStorage.setItem(WORKSPACE_KEY, JSON.stringify(store))
  await app.act(async () => {
    app.window.dispatchEvent(new app.window.StorageEvent('storage', { key: WORKSPACE_KEY }))
  })
  await app.settle(80)

  assert.deepEqual(rowsOf(app.popover).map(textOf).sort(), ['乙', '甲'].sort(), 'the open panel follows the other tab')
  assert.equal(app.button.querySelector('.dsh-an-headerCount').textContent, '2', 'the badge follows too')

  // A deletion in the other tab must reach this view as well.
  const trimmed = JSON.parse(app.window.localStorage.getItem(WORKSPACE_KEY))
  trimmed.workspaces[UNASSIGNED].items = trimmed.workspaces[UNASSIGNED].items.filter(item => item.id !== 'b')
  app.window.localStorage.setItem(WORKSPACE_KEY, JSON.stringify(trimmed))
  await app.act(async () => {
    app.window.dispatchEvent(new app.window.StorageEvent('storage', { key: WORKSPACE_KEY }))
  })
  await app.settle(80)
  assert.deepEqual(rowsOf(app.popover).map(textOf), ['甲'], 'the removed note disappears here too')
  assert.equal(app.button.querySelector('.dsh-an-headerCount').textContent, '1', 'the badge counts the removal')
  await app.dispose()
})

test('PANEL-009 面板宽度夹在 280 到 720 之间', async t => {
  const app = await bootBundle(t)
  await app.open()
  const handle = app.popover.querySelector('.dsh-an-resizeHandle')
  const press = async key => {
    await app.act(async () => {
      handle.dispatchEvent(new app.window.KeyboardEvent('keydown', { key, bubbles: true }))
    })
  }
  const width = () => Number(app.window.localStorage.getItem('dsh.aside-note.panel-width'))

  for (let i = 0; i < 40; i += 1) await press('ArrowLeft')
  const max = Math.min(720, app.window.innerWidth - 32)
  assert.ok(width() <= max, `width ${width()} must not exceed ${max}`)
  assert.ok(width() > 0)

  const desktopWidth = app.window.innerWidth
  const resizeViewport = async viewportWidth => {
    await app.act(async () => {
      app.window.innerWidth = viewportWidth
      app.window.dispatchEvent(new app.window.Event('resize'))
    })
  }
  await resizeViewport(390)
  const panelWidth = Number.parseFloat(app.popover.style.width)
  const rightInset = Number.parseFloat(app.popover.style.right)
  assert.ok(rightInset >= 12, 'the narrow panel keeps its right margin')
  assert.ok(390 - rightInset - panelWidth >= 12, 'the anchor offset must leave room for the panel and left margin')
  await resizeViewport(desktopWidth)

  for (let i = 0; i < 80; i += 1) await press('ArrowRight')
  assert.ok(width() >= 280, `width ${width()} must not go below 280`)
  await app.dispose()
})

test('PANEL-010 清除确认 5 秒后失效', async t => {
  const app = await bootBundle(t, {
    prepare: window => {
      // Let the five-second confirm window expire without waiting five seconds.
      const real = window.setTimeout.bind(window)
      window.setTimeout = (fn, ms, ...rest) => real(fn, ms === 5000 ? 150 : ms, ...rest)
      seedSession(window, [
        note('a', '已完成的一条', 1, { done: true, completedAt: 2 }),
        note('b', '还开着', 3),
      ])
    },
  })
  await app.open()
  await app.act(async () => { app.popover.querySelector('.dsh-an-doneHead .dsh-an-doneToggle').click() })
  await app.settle(20)

  await app.act(async () => { app.popover.querySelector('.dsh-an-clear').click() })
  assert.ok(app.popover.querySelector('.dsh-an-clearConfirm'), 'the first click asks for confirmation')

  await app.settle(220)
  assert.equal(app.popover.querySelector('.dsh-an-clearConfirm'), null, 'the confirmation dismisses itself')
  assert.equal(standaloneItems(app.window).length, 2, 'nothing was deleted by the timeout')

  await app.act(async () => { app.popover.querySelector('.dsh-an-clear').click() })
  assert.ok(app.popover.querySelector('.dsh-an-clearConfirm'), 'a later click asks again instead of deleting')
  await app.dispose()
})

test('I18N-002 未知语言回落英文', async t => {
  const app = await bootBundle(t, { locale: 'xx' })
  await app.open()

  assert.equal(app.popover.querySelector('.dsh-an-popTitle').textContent, 'Sideby Note',
    'an unknown locale falls back to English')
  const text = app.popover.textContent
  assert.equal(text.includes('边记部'), false, 'never falls back to Chinese')
  assert.equal(/popover\.[a-z]/i.test(text), false, 'never renders a raw dictionary key')
  await app.dispose()
})

test('SCOPE-012 迁移失败时保留源记录且重试不重复', async t => {
  const legacyNotes = [note('a', '甲', 1), note('b', '乙', 2)]
  let failWrite = true
  const app = await bootBundle(t, {
    prepare: window => {
      seedSession(window, legacyNotes)
      const storage = window.localStorage
      Object.defineProperty(window, 'localStorage', {
        configurable: true,
        value: {
          getItem: key => storage.getItem(key),
          removeItem: key => storage.removeItem(key),
          setItem(key, value) {
            if (failWrite && key === WORKSPACE_KEY) throw new Error('quota')
            storage.setItem(key, value)
          },
        },
      })
    },
    props: workspaceProps(),
  })
  const storage = app.window.localStorage
  assert.equal(storage.getItem(WORKSPACE_KEY), null, 'the destination write failed')
  assert.deepEqual(JSON.parse(storage.getItem('dsh.aside-note')).sessions['session-1'].items, legacyNotes)

  failWrite = false
  await app.remount(workspaceProps())
  const migrated = () => JSON.parse(storage.getItem(WORKSPACE_KEY)).workspaces['ws-1']
  assert.deepEqual(migrated().items.map(item => item.id), ['a', 'b'])
  assert.deepEqual(JSON.parse(storage.getItem('dsh.aside-note')).sessions, {}, 'the successful retry removes the source')

  const first = migrated()
  await app.remount(workspaceProps())
  assert.deepEqual(migrated(), first, 'reopening the workspace keeps the migrated list identical')
  await app.dispose()
})

test('SCOPE-013 切换范围本身不写入任何清单', async t => {
  const app = await bootBundle(t, {
    prepare: window => seedSession(window, [note('a', '甲', 1)]),
    props: workspaceProps(),
  })
  await app.open()
  await app.settle(40)

  const storedLists = () => [app.window.localStorage.getItem('dsh.aside-note'), app.window.localStorage.getItem(WORKSPACE_KEY)]
  const before = storedLists()

  const input = app.popover.querySelector('.dsh-an-input')
  await typeInto(app, input, '半截草稿')
  await app.act(async () => { app.popover.querySelector('[data-scope-mode="global"]').click() })
  await app.settle(40)

  assert.deepEqual(storedLists(), before, 'changing the view leaves note storage identical')
  await app.act(async () => { app.popover.querySelector('[data-scope-mode="workspace"]').click() })
  await app.settle(20)
  assert.deepEqual(storedLists(), before, 'returning to Workspace leaves note storage identical')
  assert.equal(input.value, '半截草稿', 'the draft survives the round trip')
  await app.dispose()
})

test('STORE-017 畸形记录被清洗而不是渲染成乱码', async t => {
  const app = await bootBundle(t, {
    prepare: window => window.localStorage.setItem('dsh.aside-note', JSON.stringify({
      version: 1,
      sessions: {
        'session-1': {
          items: [
            'not-an-object',
            { id: 'a', text: '甲', done: false, createdAt: 1 },
            { id: 'a', text: '乙', done: false, createdAt: 2 },
            { text: '丙', done: 'yes', createdAt: 'bad' },
            { id: 'c', text: '   ', done: false, createdAt: 3 },
            null,
          ],
        },
      },
    })),
  })
  await app.open()

  const rows = rowsOf(app.popover)
  assert.equal(rows.length, 3, 'non-objects and blank text are dropped')
  assert.deepEqual(rows.map(textOf), ['丙', '乙', '甲'], 'the surviving records display newest first')
  assert.equal(app.popover.textContent.includes('undefined'), false, 'nothing renders as undefined')

  await typeInto(app, app.popover.querySelector('.dsh-an-input'), '新增一条')
  await app.act(async () => { app.popover.querySelector('.dsh-an-addBtn').click() })
  await app.settle(20)

  const stored = standaloneItems(app.window)
  assert.equal(stored.length, 4, 'the store is rewritten with sanitised records')
  assert.equal(new Set(stored.map(item => item.id)).size, 4, 'duplicate ids were reassigned')
  assert.equal(stored.find(item => item.text === '丙').done, false, 'a non-boolean done reads as false')
  await app.dispose()
})

test('NOTE-009 相对时间按经过时长分档', async t => {
  const now = Date.now()
  const app = await bootBundle(t, {
    prepare: window => seedSession(window, [
      note('d', '丁', now - 2 * 86400_000),
      note('c', '丙', now - 3 * 3600_000),
      note('b', '乙', now - 2 * 60_000),
      note('a', '甲', now - 30_000),
      note('e', '戊', now - 10 * 86400_000),
    ]),
  })
  await app.open()

  const meta = Object.fromEntries(rowsOf(app.popover).map(row => [
    textOf(row),
    row.querySelector('.dsh-an-meta').textContent,
  ]))
  assert.equal(meta['甲'], '刚刚')
  assert.equal(meta['乙'], '2 分钟前')
  assert.equal(meta['丙'], '3 小时前')
  assert.equal(meta['丁'], '2 天前')
  assert.match(meta['戊'], /^\d{1,2}月\d{1,2}日$/, 'older notes show a date')
  await app.dispose()
})

test('STORE-018 大清单仍可展示与新增', async t => {
  const items = Array.from({ length: 400 }, (_, index) => note(`n${index}`, `第 ${index} 条`, index + 1))
  const app = await bootBundle(t, { prepare: window => seedSession(window, items) })
  await app.open()

  assert.equal(rowsOf(app.popover).length, 400, 'a list well past 300 renders in full')

  await typeInto(app, app.popover.querySelector('.dsh-an-input'), '大清单里再加一条')
  await app.act(async () => { app.popover.querySelector('.dsh-an-addBtn').click() })
  await app.settle(20)
  assert.equal(standaloneItems(app.window).length, 401, 'adding to a large list is not refused')
  await app.dispose()
})

test('FWD-001 旧前缀偏好不会影响递入', async t => {
  const legacyKey = 'dsh.aside-note.forward-prefix'
  const app = await bootBundle(t, {
    prepare: window => {
      seedSession(window, [note('a', '原始便笺', 1)])
      window.localStorage.setItem(legacyKey, '旧版前缀：')
    },
  })
  await app.open()

  await app.act(async () => { rowByText(app.popover, '原始便笺').querySelector('.dsh-an-insert').click() })
  assert.equal(app.window.document.querySelector('[data-composer-input]').value, '原始便笺')
  assert.equal(app.window.localStorage.getItem(legacyKey), '旧版前缀：')
  await app.dispose()
})

test('FWD-006 归档条目没有再次递入操作', async t => {
  const app = await bootBundle(t, {
    prepare: window => seedSession(window, [note('a', '要递入的', 1)]),
  })
  await app.open()

  const row = () => rowByText(app.popover, '要递入的')
  const composer = app.window.document.querySelector('[data-composer-input]')
  await app.act(async () => { row().querySelector('.dsh-an-insert').click() })
  await app.act(async () => { app.popover.querySelector('.dsh-an-doneHead .dsh-an-doneToggle').click() })
  assert.equal(composer.value, '要递入的')
  assert.ok(row().classList.contains('dsh-an-rowArchived'))
  assert.equal(row().querySelector('.dsh-an-insert'), null)
  assert.equal(app.window.localStorage.getItem('dsh.aside-note.forwarded'), null)
  await app.dispose()
})

test('PANEL-011 DSH 快捷键切换面板并跟随当前绑定', async t => {
  let command, onCatalogChange
  let rows = []
  const shortcuts = {
    config: { getSnapshot: () => ({ status: 'ready' }) },
    catalog: {
      getSnapshot: () => rows,
      subscribe(listener) {
        onCatalogChange = listener
        return () => { onCatalogChange = undefined }
      },
    },
    register(value) {
      command = value
      return () => { command = undefined }
    },
  }
  const app = await bootBundle(t, { shortcuts })
  assert.equal(command.id, 'dsh-sideby-note.toggle')
  assert.equal(command.label(), '打开或收起边记部')
  for (const [profile, binding] of Object.entries(command.defaults)) {
    const [runtime, platform] = profile.split(':')
    assert.equal(binding.code, 'KeyE')
    assert.deepEqual([...binding.modifiers], runtime === 'desktop' ? ['primary'] : ['primary', 'alt'])
    assert.equal(bindingIssue(normalizeBinding(binding, platform), runtime, platform), null)
  }
  assert.equal(Object.keys(command.defaults).length, 5)
  assert.equal(command.defaults['web:linux'], undefined)
  assert.equal(isWebBindingAllowed(normalizeBinding(command.defaults['desktop:macos'], 'macos'), 'macos'), false)

  const publishBinding = (keys, aria) => {
    rows = [{ id: command.id, keys, aria, conflicts: [], issue: null }]
    onCatalogChange()
  }
  const button = app.button
  const title = button.title
  publishBinding(['⌘', 'E'], 'Meta+E')
  assert.equal(button.getAttribute('aria-keyshortcuts'), 'Meta+E')
  assert.equal(button.title, `${title} (⌘ E)`)

  const context = { region: 'editable', target: null, modal: null }
  assert.equal(command.resolve(context).status, 'pass', 'a hidden button cannot toggle notes')
  button.getClientRects = () => [button.getBoundingClientRect()]
  assert.equal(command.resolve({ ...context, modal: 'settings' }).status, 'pass')
  for (const expanded of [true, false]) {
    const result = command.resolve(context)
    assert.equal(result.status, 'handled')
    await app.act(async () => result.run())
    assert.equal(Boolean(app.document.querySelector('.dsh-an-popover')), expanded)
    assert.equal(button.getAttribute('aria-expanded'), String(expanded))
  }
  publishBinding(['⌥', '⌘', 'N'], 'Alt+Meta+N')
  assert.equal(button.getAttribute('aria-keyshortcuts'), 'Alt+Meta+N')
  publishBinding([], undefined)
  assert.equal(button.hasAttribute('aria-keyshortcuts'), false)
  assert.equal(button.title, title)

  await app.dispose()
  assert.equal(command, undefined)
  assert.equal(onCatalogChange, undefined)
})
