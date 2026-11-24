import assert from 'node:assert/strict'
import test from 'node:test'
import { bootBundle } from './testkit/bundle.mts'

const WORKSPACES = 'dsh.aside-note.workspaces'
const DRAFTS = 'dsh.aside-note.drafts'
const workspaceId = 'workspace-1'
const bindLabel = '绑定到当前会话'
const unbindLabel = '解除会话绑定'
const openLabel = '打开绑定的会话'
const old = { id: 'old', text: '旧便笺', done: false, createdAt: 1, updatedAt: 1 }
const workspaces = [{ workspaceId, title: 'Demo', sessionIds: ['session-1', 'session-2'] }]
const useWorkspaces = select => select({ items: workspaces, phase: 'ready' })
const sessionRows = Object.fromEntries(['session-1', 'session-2'].map((id, index) => [id, { displayTitle: `Talk ${index + 1}` }]))

function clickOf(root, label: string): HTMLButtonElement {
  const button = [...root.querySelectorAll('button')].find(node => node.getAttribute('aria-label') === label)
  assert.ok(button, `button ${label}`)
  return button
}

async function fixture(t) {
  let navigation: string | undefined
  const app = await bootBundle(t, {
    html: '<!doctype html><html><body><div class="_headerUtilities"></div>'
      + ['session-1', 'session-2'].map(id => `<div data-conversation-session="${id}"><textarea data-composer-input></textarea></div>`).join('')
      + '</body></html>',
    props: { useWorkspaces },
    services: {
      sessions: { scope: () => undefined, list: {
        getSnapshot: (() => {
          const snapshot = { phase: 'ready', byId: sessionRows }
          return () => snapshot
        })(),
        subscribe: () => () => {},
      } },
      uiWorkspace: { openSession: id => { navigation = id }, openWorkspace: async () => {} },
    },
    prepare(window) {
      window.localStorage.setItem('dsh.aside-note', JSON.stringify({ version: 1, sessions: { 'session-2': { items: [old] } } }))
    },
  })
  const selectSession = (sessionId: string) => app.render({ sessionId, useWorkspaces })
  const items = () => JSON.parse(app.window.localStorage.getItem(WORKSPACES)).workspaces[workspaceId].items
  const panel = () => app.document.querySelector('.dsh-an-popover')!
  const row = (text: string) => [...panel().querySelectorAll('.dsh-an-row')].find(row => row.querySelector('.dsh-an-text')?.textContent === text)!
  const field = () => panel().querySelector<HTMLTextAreaElement>('.dsh-an-input')!
  const chat = (sessionId: string) => app.document.querySelector<HTMLTextAreaElement>(`[data-conversation-session="${sessionId}"] textarea`)!
  const click = async (button: HTMLElement) => app.act(async () => { button.click() })
  const type = async (text: string) => {
    const setter = Object.getOwnPropertyDescriptor(app.window.HTMLTextAreaElement.prototype, 'value')!.set!
    await app.act(async () => {
      setter.call(field(), text)
      field().dispatchEvent(new app.window.Event('input', { bubbles: true }))
    })
  }
  const add = async () => click(panel().querySelector<HTMLButtonElement>('.dsh-an-addBtn')!)
  await app.open()
  return { app, items, panel, row, field, chat, click, type, add, selectSession, get navigation() { return navigation } }
}

test('NOTE-014 可选绑定不改变工作区且随退回草稿保留', async t => {
  const f = await fixture(t)
  try {
    assert.equal(f.items()[0].linkedSessionId, undefined, 'legacy session migration does not infer a link')
    const toggle = () => clickOf(f.panel().querySelector('form'), bindLabel)
    assert.equal(toggle().getAttribute('aria-pressed'), 'true', 'a fresh draft already links the active session')
    assert.equal(toggle().dataset.linked, 'true')
    assert.ok(toggle().querySelector('[data-link-state="linked"]'))
    const oldToggle = clickOf(f.row('旧便笺'), bindLabel)
    assert.equal(oldToggle.dataset.linked, 'false')
    assert.ok(oldToggle.querySelector('[data-link-state="unlinked"]'))
    await f.type('绑定便笺')
    await f.add()
    assert.equal(f.items().find(note => note.text === '绑定便笺').linkedSessionId, 'session-1')
    assert.equal(toggle().getAttribute('aria-pressed'), 'true', 'each new draft starts linked')
    await f.click(toggle())
    assert.equal(toggle().getAttribute('aria-pressed'), 'false')
    assert.equal(toggle().dataset.linked, 'false')
    assert.ok(toggle().querySelector('[data-link-state="unlinked"]'))
    await f.type('手动解绑的便笺')
    await f.selectSession('session-2')
    await f.app.open()
    assert.equal(toggle().getAttribute('aria-pressed'), 'false', 'explicit unlink survives switching sessions')
    await f.add()
    assert.equal(f.items().find(note => note.text === '手动解绑的便笺').linkedSessionId, undefined)
    assert.equal(toggle().getAttribute('aria-pressed'), 'true', 'saving resets the override for the next note')
    await f.click(clickOf(f.row('绑定便笺'), '退回'))
    assert.equal(f.items().some(note => note.text === '绑定便笺'), false)
    assert.equal(JSON.parse(f.app.window.localStorage.getItem(DRAFTS)).sessions[`ws:${workspaceId}`].linkedSessionId, 'session-1')
    await f.click(f.app.button)
    await f.app.open()
    assert.equal(f.field().value, '绑定便笺')
    assert.equal(toggle().getAttribute('aria-pressed'), 'true')
    await f.type('编辑后的便笺')
    await f.add()
    const recalled = f.items().find(note => note.text === '编辑后的便笺')
    assert.equal(recalled.linkedSessionId, 'session-1', 'recall does not rebind to the editing session')
    const unlink = clickOf(f.row('编辑后的便笺'), unbindLabel)
    assert.equal(unlink.dataset.linked, 'true')
    assert.ok(unlink.querySelector('[data-link-state="linked"]'))
    await f.click(unlink)
    assert.deepEqual(f.items().find(note => note.id === recalled.id), {
      id: recalled.id, text: recalled.text, done: recalled.done, createdAt: recalled.createdAt,
      updatedAt: f.items().find(note => note.id === recalled.id).updatedAt,
    })
    await f.click(clickOf(f.row('编辑后的便笺'), bindLabel))
    assert.equal(f.items().find(note => note.id === recalled.id).linkedSessionId, 'session-2')
    assert.equal(f.items().find(note => note.id === 'old').linkedSessionId, undefined)
    await f.click(clickOf(f.row('旧便笺'), '退回'))
    assert.equal(toggle().getAttribute('aria-pressed'), 'false', 'recalling a legacy note does not add a link')
    await f.add()
    assert.equal(f.items().find(note => note.text === '旧便笺').linkedSessionId, undefined)

    await f.type('当前标签页的草稿')
    await f.app.act(async () => {
      const storage = f.app.window.localStorage
      const drafts = JSON.parse(storage.getItem(DRAFTS))
      drafts.sessions[`ws:${workspaceId}`] = { add: '另一标签页的草稿', linkedSessionId: 'session-1' }
      storage.setItem(DRAFTS, JSON.stringify(drafts))
      f.app.window.dispatchEvent(new f.app.window.StorageEvent('storage', { key: DRAFTS }))
    })
    await f.add()
    assert.equal(f.field().value, '当前标签页的草稿')
    assert.equal(f.items().some(note => note.text === '当前标签页的草稿'), false, 'text and session from different tabs are never combined')
  } finally {
    await f.app.dispose()
  }
})

test('FWD-010 绑定便笺只在目标会话填入且返回本身不写草稿', async t => {
  const f = await fixture(t)
  try {
    await f.click(clickOf(f.row('旧便笺'), bindLabel))
    await f.selectSession('session-2')
    await f.app.open()
    const insert = () => f.row('旧便笺').querySelector<HTMLButtonElement>('.dsh-an-insert')!
    assert.equal(insert().getAttribute('aria-disabled'), 'true')
    await f.click(insert())
    assert.equal(f.chat('session-2').value, '')
    assert.equal(f.items()[0].done, false)
    assert.equal(f.row('旧便笺').querySelector('.dsh-an-contextDivider'), null, 'a lone session link needs no separator')
    await f.click(f.panel().querySelector('[data-scope-mode="global"]')!)
    const returnButton = clickOf(f.row('旧便笺'), `${openLabel} — Talk 1`)
    const context = returnButton.closest('.dsh-an-rowContext')!
    assert.ok(context.querySelector('.dsh-an-workspaceJump'), 'the workspace remains a separate action')
    assert.equal(context.querySelector('.dsh-an-contextDivider')?.textContent, '/')
    returnButton.focus()
    await f.click(returnButton)
    assert.equal(f.navigation, 'session-1')
    assert.equal(f.chat('session-1').value, '')
    assert.equal(f.items()[0].done, false)
    await f.selectSession(f.navigation!)
    assert.ok(f.panel(), 'opening the linked session preserves the panel')
    assert.equal(f.app.document.activeElement, f.row('旧便笺'), 'keyboard return moves focus to the revealed note')
    assert.notEqual(insert().getAttribute('aria-disabled'), 'true')
    await f.click(insert())
    assert.equal(f.chat('session-1').value, '旧便笺')
    assert.equal(f.chat('session-2').value, '')
    assert.equal(f.items()[0].done, true)
    assert.equal(f.items()[0].linkedSessionId, 'session-1')
  } finally {
    await f.app.dispose()
  }
})

test('FWD-011 会话不可用或绑定刚变更时不填入', async t => {
  const f = await fixture(t)
  try {
    const store = JSON.parse(f.app.window.localStorage.getItem(WORKSPACES))
    store.workspaces[workspaceId].items[0].linkedSessionId = 'deleted-session'
    // Before a different tab's storage event reaches the view, the stale row
    // still offers Insert. The action must consult the authoritative local copy.
    f.app.window.localStorage.setItem(WORKSPACES, JSON.stringify(store))
    await f.click(f.row('旧便笺').querySelector('.dsh-an-insert')!)
    assert.equal(f.chat('session-1').value, '')
    assert.equal(f.items()[0].done, false)
    await f.app.act(async () => {
      f.app.window.dispatchEvent(new f.app.window.StorageEvent('storage', { key: WORKSPACES }))
    })
    await f.click(clickOf(f.row('旧便笺'), openLabel))
    assert.equal(f.navigation, undefined, 'an absent session is not reopened or silently replaced')
    assert.equal(f.items()[0].linkedSessionId, 'deleted-session')
    await f.click(clickOf(f.row('旧便笺'), unbindLabel))
    await f.click(f.row('旧便笺').querySelector('.dsh-an-insert')!)
    assert.equal(f.chat('session-1').value, '旧便笺', 'unlinked notes still fill the current session')
    assert.equal(f.items()[0].done, true)
  } finally {
    await f.app.dispose()
  }
})
