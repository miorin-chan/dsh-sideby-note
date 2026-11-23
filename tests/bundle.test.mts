/**
 * Boots the built bundle the way the shell does.
 *
 * The contract test only reads text; this one actually runs `client/client.js`
 * inside a jsdom realm, hands its factory a module table, calls `apply(ctx)`
 * and checks the two registrations, the injected stylesheet and the host-DOM
 * header entry. It is the P1 stand-in for the real-GUI smoke test.
 */
import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import test from 'node:test'
import { fileURLToPath } from 'node:url'
import { JSDOM } from 'jsdom'
import * as ReactJSXRuntime from 'react/jsx-runtime'
import { captureWithFrame } from './testkit/slots.mts'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const bundlePath = path.join(root, 'client', 'client.js')
const bundle = fs.readFileSync(bundlePath, 'utf8')

const manifest = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8'))
// Update-flow fixtures move with the build. LATEST is one major above the
// running version, IN_BETWEEN sits in the gap so the panel lists two releases,
// and OLD is below the build so it must never be listed. Pinning these broke
// every release: the build bumps and the "newer" fixture silently becomes older.
const RUNNING = manifest.version
// A build from a published channel (`X.Y.Z-beta.N`) also reads `next`; a stable
// build reads `latest` alone. The expected request list follows the shipped
// version instead of pinning one shape, which broke every release.
const CHANNELS = /-(?:alpha|beta|rc)\./.test(RUNNING) ? ['latest', 'next'] : ['latest']
const REGISTRY_URLS = ['https://registry.npmjs.org', 'https://registry.npmmirror.com']
  .flatMap(host => CHANNELS.map(channel => `${host}/%40miorin%2Fdsh-sideby-note/${channel}`))
// The core only: a prerelease build (1.1.2-beta.1) would otherwise make PATCH NaN.
const [MAJOR, MINOR, PATCH] = RUNNING.replace(/-.*$/, '').split('.').map(Number)
const LATEST = `${MAJOR + 1}.0.0`
const IN_BETWEEN = `${MAJOR}.${MINOR}.${PATCH + 1}`
const OLD = '0.0.1'
const PRERELEASE = `${LATEST}-beta.1`
const DRAFT = `${MAJOR + 1}.0.1`
const WORKSPACE_KEY = 'dsh.aside-note.workspaces'
const UNASSIGNED = 'sideby-note:unassigned'
const browserWorkspaceItems = (window, workspaceId = UNASSIGNED) =>
  JSON.parse(window.localStorage.getItem(WORKSPACE_KEY))?.workspaces[workspaceId]?.items ?? []

test('the built bundle boots, applies, and seats its slots', async t => {
  const dom = new JSDOM(
    '<!doctype html><html><body><div class="_headerUtilities"></div>' +
      '<div data-conversation-session="session-1"><textarea data-composer-input></textarea></div></body></html>',
    { url: 'https://example.test/', pretendToBeVisual: true, runScripts: 'outside-only' },
  )
  const { window } = dom
  t.after(() => window.close())
  globalThis.window = window
  globalThis.document = window.document
  globalThis.IS_REACT_ACT_ENVIRONMENT = true

  // Seed a legacy session note and a stale send preference. The note moves to
  // the unassigned list when the session is captured. Enter still submits.
  window.localStorage.setItem('dsh.aside-note', JSON.stringify({
    version: 1,
    sessions: { 'session-1': { items: [{ id: 'seed', text: '旧便笺', done: false, createdAt: 1, updatedAt: 1 }] } },
  }))
  window.localStorage.setItem('dsh.aside-note.send-shortcut', 'ctrl-enter')

  // Loaded after the DOM globals exist: react-dom decides `canUseDOM` at import.
  const React = await import('react')
  const ReactDOM = await import('react-dom')
  const ReactDOMClient = await import('react-dom/client')
  const { act } = React

  // The panel probes npm when it opens and asks the host only when a newer
  // version exists. Answer inside this realm so the shipped notes fetch,
  // cache and update flow run without touching the network.
  const RELEASE_BODY = `# English

<!-- app-update-notes:en:start -->
### Added
- **Update centre:** Notes are readable in the panel. (#31)
<!-- app-update-notes:en:end -->

# 中文

<!-- app-update-notes:zh:start -->
### 新增
- **更新中心：** 可以直接在面板里查看更新说明。 （#31）

### 修复
- **提示点：** 已是最新版本时不再显示。 （#32）
<!-- app-update-notes:zh:end -->
`
  const OLDER_BODY = `# 中文

<!-- app-update-notes:zh:start -->
### 修复
- **旧版本：** 修复了上一个版本的问题。 （#30）
<!-- app-update-notes:zh:end -->
`
  const releaseUrl = version => `https://github.com/miorin-chan/dsh-sideby-note/releases/tag/v${version}`
  const RELEASES = [
    { tag_name: `v${LATEST}`, html_url: releaseUrl(LATEST), body: RELEASE_BODY },
    { tag_name: `v${IN_BETWEEN}`, html_url: releaseUrl(IN_BETWEEN), body: OLDER_BODY },
    // Older than the running build and a prerelease: neither may appear.
    { tag_name: `v${OLD}`, html_url: releaseUrl(OLD), body: OLDER_BODY },
    { tag_name: `v${PRERELEASE}`, prerelease: true, body: RELEASE_BODY },
    { tag_name: `v${DRAFT}`, draft: true, body: RELEASE_BODY },
  ]
  const calls = []
  let hostUpdates = 0
  let hostTarget = null
  // One manual check is held open so the test can see the in-flight render.
  let holdManualCheck = false
  let releaseManualCheck = null
  const json = (status, body) => ({ ok: status >= 200 && status < 300, status, json: async () => body })
  window.fetch = async (input, init = {}) => {
    const url = String(input)
    const method = init.method || 'GET'
    calls.push({ url, method })
    if (url.startsWith('https://registry.npmjs.org/')) return json(404, {})
    if (url.startsWith('https://registry.npmmirror.com/')) {
      if (holdManualCheck) {
        holdManualCheck = false
        return new Promise(resolve => {
          releaseManualCheck = () => resolve(json(200, { version: LATEST }))
        })
      }
      return json(200, { version: LATEST })
    }
    if (url === 'https://api.github.com/repos/miorin-chan/dsh-sideby-note/releases?per_page=50') {
      return json(200, RELEASES)
    }
    if (url === '/dsh-sideby-note/update/apply' && method === 'POST') {
      hostUpdates += 1
      hostTarget = JSON.parse(init.body).target
      return json(200, {
        ok: true,
        route: 'dsh',
        previousVersion: RUNNING,
        installedVersion: hostTarget,
        updated: true,
        restartRequired: true,
      })
    }
    return json(404, {})
  }
  const registryCalls = () => calls.filter(call => call.url.includes('registry.'))

  let loaded = null
  window.__ModuleLoader__ = { load: spec => { loaded = spec } }
  window.eval(bundle)

  assert.equal(loaded.id, '@miorin/dsh-sideby-note')
  const moduleTable = {
    react: React,
    'react/jsx-runtime': ReactJSXRuntime,
    'react-dom': ReactDOM,
    'react-dom/client': ReactDOMClient,
    '@deepseek-ai/dsh-client-ui-primitives': {},
  }
  const requireShim = id => {
    if (!(id in moduleTable)) throw new Error(`module table cannot answer ${id}`)
    return moduleTable[id]
  }
  const exported = loaded.factory(requireShim)
  // Bindings the subtests hand to each other: they run in order, as one session.
  let button, popover, reactRoot, valueSetter, beforeCheck, updateButton
  assert.deepEqual([...exported.inject], ['slots'])
  assert.equal(typeof exported.apply, 'function')

  const effects = []
  const disposers = []
  const registered = []
  const injected = []
  const dictionaries = []
  const locale = {
    bind: () => key => key,
    register: (ns, dict) => { dictionaries.push({ ns, dict }) },
    getLocale: () => ({ active: 'zh' }),
  }
  const ctx = {
    get: name => (name === 'locale' ? locale : undefined),
    effect: (fn, label) => {
      effects.push(label)
      const dispose = fn()
      if (typeof dispose === 'function') disposers.push(dispose)
    },
    slots: {
      inject: (name, factory) => {
        injected.push(name)
        factory()
      },
      register: (meta, component) => {
        registered.push({ meta, component })
        return () => {}
      },
    },
  }

  await act(async () => { exported.apply(ctx) })

  await t.test('PKG-001 构建产物注册三个座位与八种语言', async () => {
    const panelSlots = ['conversation.composer.dock', 'conversation.hero.options', 'shell.overlay']
    assert.deepEqual(injected.filter(name => panelSlots.includes(name)).sort(), panelSlots)
    assert.deepEqual(registered.map(entry => entry.meta.name).sort(), injected.sort())
    assert.equal(dictionaries.length, 1, 'the bundle registers one locale namespace')
    assert.deepEqual(
      Object.keys(dictionaries[0].dict).sort(),
      ['de', 'en', 'es', 'fr', 'ja', 'pt', 'ru', 'zh'],
      'the built bundle must carry every DSH-official locale',
    )
  })

  await t.test('STORE-001 宿主不可用时启动保留既有便笺且不切换', async () => {
    const seeded = JSON.parse(window.localStorage.getItem('dsh.aside-note'))
    assert.equal(seeded.sessions['session-1'].items[0].text, '旧便笺')
    assert.equal(window.localStorage.getItem('dsh.aside-note.send-shortcut'), 'ctrl-enter')
    assert.equal(window.localStorage.getItem('dsh.aside-note.storage-mode'), null, 'no mode marker is written')
    assert.equal(window.localStorage.getItem('dsh.aside-note.migrated'), null, 'no legacy marker is written')
  })

  await t.test('only one stylesheet is injected', async () => {
    const styles = document.querySelectorAll('style[data-dsh-plugin="dsh-sideby-note"]')
    assert.equal(styles.length, 1, 'exactly one document-level stylesheet is injected')
    assert.match(styles[0].textContent, /\.dsh-an-popover\{/)
  })

  await t.test('PANEL-002 header 入口挂进宿主工具行并显示未完成数', async () => {
    // Render the session capture the shell would mount, then let its effect seat
    // the header entry into the host-owned utilities row.
    const capture = captureWithFrame(React, registered)
    const container = document.createElement('div')
    document.body.appendChild(container)
    reactRoot = ReactDOMClient.createRoot(container)
    await act(async () => {
      reactRoot.render(React.createElement(capture, { sessionId: 'session-1' }))
    })

    assert.equal(container.childElementCount, 0, 'the composer slot captures context without rendering a chip')
    button = document.querySelector('._headerUtilities > .dsh-an-headerBtn')
    assert.ok(button, 'the header entry must be injected into the host utilities row')
    assert.equal(button.dataset.sessionId, 'session-1')
    assert.match(button.getAttribute('aria-label'), /边记部/)
    // The seeded note is open, so the entry already shows a count.
    assert.equal(button.querySelector('.dsh-an-headerCount').textContent, '1')
  })

  await t.test('PANEL-003 点击入口打开面板并渲染标题', async () => {
    // Open the panel from that entry and write a note through the real form.
    await act(async () => { button.click() })
    popover = document.querySelector('.dsh-an-popover')
    assert.ok(popover, 'clicking the header entry must open the panel')
    assert.equal(popover.querySelector('.dsh-an-popTitle').textContent, '边记部', 'the panel title is the product name')
  })

  await t.test('NOTE-001 经表单新增便笺写入存储并刷新角标', async () => {
    const addField = popover.querySelector('.dsh-an-input')
    assert.ok(addField, 'the panel must render the add field')
    assert.equal(addField.getAttribute('placeholder'), '随手记一条')
    assert.equal(document.getElementById(addField.getAttribute('aria-describedby'))?.textContent, '记到 未归属',
      'the standalone composer names the destination omitted by the global count')
    const addButton = popover.querySelector('.dsh-an-addBtn')
    assert.equal(addButton.disabled, true)
    assert.equal(addButton.getAttribute('aria-label'), '添加')
    assert.equal(addButton.textContent, '', 'the submit button shows only the icon')
    assert.ok(addButton.querySelector('svg[aria-hidden="true"] path'), 'the submit button renders a decorative icon')
    const formCopy = addField.form.cloneNode(true)
    formCopy.querySelector('.dsh-an-attachBtn').remove()
    formCopy.querySelector('.dsh-an-destination').remove()
    assert.equal(formCopy.textContent.trim(), '', 'the composer has no visible keyboard hint')
    // Set the value through the prototype setter so React's value tracker sees a
    // change, then dispatch the input event React listens for. fireEvent would
    // resolve the prototype in the Node realm, not this jsdom one.
    valueSetter = Object.getOwnPropertyDescriptor(window.HTMLTextAreaElement.prototype, 'value').set
    await act(async () => {
      valueSetter.call(addField, '新的一条')
      addField.dispatchEvent(new window.Event('input', { bubbles: true }))
    })
    assert.equal(addButton.disabled, false, 'the add button enables once the draft has text')
    await act(async () => { addButton.click() })
    const written = browserWorkspaceItems(window)
    assert.equal(written[0].text, '新的一条')
    assert.equal(written.length, 2)
    assert.deepEqual(JSON.parse(window.localStorage.getItem('dsh.aside-note')).sessions, {})
    // The entry refreshes on a rAF after the store write; give jsdom one frame.
    await act(async () => { await new Promise(resolve => window.setTimeout(resolve, 40)) })
    assert.equal(document.querySelector('.dsh-an-headerCount').textContent, '2')
  })

  const footer = () => popover.querySelector('.dsh-an-popFoot details.dsh-an-footerDetails')
  const storageToggle = () => footer().querySelector(':scope > summary.dsh-an-storageToggle')

  await t.test('PANEL-004 页脚存储详情展示版本与检查入口', async () => {
    assert.ok(footer(), 'the panel footer always offers storage details')
    assert.equal(footer().open, false)
    assert.equal(footer().textContent.trim(), '存储与更新')
    const css = document.querySelector('style[data-dsh-plugin="dsh-sideby-note"]').textContent
    assert.match(css, /\.dsh-an-storageToggle\s*\{[^}]*\blist-style:\s*none\b/)
    assert.match(css, /\.dsh-an-storageToggle::-webkit-details-marker\s*\{[^}]*\bdisplay:\s*none\b/)
    assert.equal(footer().querySelector('.dsh-an-footerBody'), null)
    assert.equal(popover.querySelector('.dsh-an-settingsBtn, .dsh-an-settings, .dsh-an-settingsViewport'), null)
    assert.equal(popover.hasAttribute('data-settings'), false)

    await act(async () => { storageToggle().click() })
    await act(async () => { await new Promise(resolve => window.setTimeout(resolve, 20)) })
    assert.equal(footer().open, true)
    assert.ok(footer().textContent.includes(RUNNING), 'the footer displays the running version')
    assert.equal(footer().querySelector('button.dsh-an-updateCheck').textContent, '检查更新')
    assert.equal(popover.querySelector('#dsh-an-forward-prefix, input[type="radio"]'), null)

    await act(async () => { storageToggle().click() })
  })

  await t.test('PANEL-005 使用面板和存储详情不会上报统计', async () => {
    await act(async () => { storageToggle().click() })
    await act(async () => { await new Promise(resolve => window.setTimeout(resolve, 20)) })
    assert.equal(footer().open, true)
    assert.equal(popover.querySelector('#dsh-an-analytics-hint, input[role="switch"]'), null)
    assert.equal(window.localStorage.getItem('dsh.aside-note.analytics'), null)
    await act(async () => { storageToggle().click() })
    const allowed = new Set([...REGISTRY_URLS, '/dsh-sideby-note/store',
      '/dsh-sideby-note/store/location', 'https://api.github.com/repos/miorin-chan/dsh-sideby-note/releases?per_page=50'])
    assert.deepEqual(calls.filter(call => call.method !== 'GET' || !allowed.has(call.url)), [],
      'opening the panel and storage details only reads storage and update endpoints')
  })

  const updateDetails = () => popover.querySelector('details.dsh-an-updateDetails')

  await t.test('UPD-001 npm 失败回退镜像并显示更新卡片与说明', async () => {
    await act(async () => { await new Promise(resolve => window.setTimeout(resolve, 20)) })
    assert.deepEqual(registryCalls().map(call => call.url), REGISTRY_URLS, 'the npmjs miss must fall back to the npmmirror host')
    const details = updateDetails()
    assert.ok(details, 'a newer version gives the panel an update disclosure')
    assert.equal(details.parentElement, footer().closest('.dsh-an-popFoot'))
    assert.equal(footer().open, false, 'storage stays collapsed when a newer version is offered')
    const summary = details.querySelector(':scope > summary.dsh-an-updateToggle')
    assert.ok(summary.textContent.trim(), 'the available update has a visible label')
    assert.equal(details.open, false)
    assert.equal(popover.querySelector('.dsh-an-updateCard'), null)

    await act(async () => { summary.click() })
    await act(async () => { await new Promise(resolve => window.setTimeout(resolve, 80)) })
    assert.equal(details.open, true)
    assert.ok(details.querySelector('.dsh-an-updateCard .dsh-an-updateNotes'), 'release notes load inside the open disclosure')

    await act(async () => { summary.click() })
    await act(async () => { await new Promise(resolve => window.setTimeout(resolve, 20)) })
    assert.equal(details.open, false)
    assert.equal(popover.querySelector('.dsh-an-updateCard'), null, 'closing the disclosure unmounts the update card')
    await act(async () => { summary.click() })
    await act(async () => { await new Promise(resolve => window.setTimeout(resolve, 20)) })
  })

  await t.test('UPD-002 手动检查绕过缓存且卡片不卸载', async () => {
    // The manual check bypasses the hourly cache and reads the registry again.
    // Hold its answer to assert the card does not unmount while the check runs.
    await act(async () => { storageToggle().click() })
    await act(async () => { await new Promise(resolve => window.setTimeout(resolve, 20)) })
    const updateCard = updateDetails().querySelector('.dsh-an-updateCard')
    assert.ok(updateCard)
    const check = footer().querySelector('.dsh-an-updateCheck')
    beforeCheck = registryCalls().length
    holdManualCheck = true
    check.focus()
    await act(async () => { check.click() })
    await act(async () => { await new Promise(resolve => window.setTimeout(resolve, 60)) })
    assert.equal(updateDetails().open, true)
    assert.equal(updateDetails().querySelector('.dsh-an-updateCard'), updateCard, 'the card must stay mounted while a manual check runs')
    assert.equal(check.textContent, '正在检查…', 'the manual check button reports progress')
    assert.equal(check.getAttribute('aria-disabled'), 'true')
    assert.equal(document.activeElement, check, 'a pending check keeps keyboard focus on the button')
    releaseManualCheck()
    await act(async () => { await new Promise(resolve => window.setTimeout(resolve, 80)) })
    assert.equal(registryCalls().length, beforeCheck + REGISTRY_URLS.length, 'a manual check must bypass the cache')
    // The checking state is deliberately held for at least three seconds; wait it
    // out before expecting an available release again.
    await act(async () => { await new Promise(resolve => window.setTimeout(resolve, 3200)) })
    assert.ok(footer().textContent.includes(`有新版本 v${LATEST}`), 'the footer reports the result of the manual check')
    await act(async () => { storageToggle().click() })
  })

  await t.test('UPD-003 更新说明列出区间版本并支持展开', async () => {
    // The release list is already visible: two releases in the gap, the newest
    // open and the older one collapsed until its version heading is clicked.
    const notes = popover.querySelector('.dsh-an-updateNotes')
    assert.ok(notes, 'release notes stay visible after a check')
    assert.match(notes.textContent, /本次更新包含 2 个版本/)
    const heads = [...notes.querySelectorAll('.dsh-an-updateVersionHead')]
    assert.deepEqual(heads.map(head => head.textContent.replace('▸', '')), [`v${LATEST}最新`, `v${IN_BETWEEN}`])
    assert.match(notes.textContent, /更新中心/)
    assert.ok(!notes.textContent.includes(`v${PRERELEASE}`), 'prereleases are not offered')
    assert.ok(!notes.textContent.includes(`v${OLD}`), 'releases older than the build are not listed')
    assert.equal(heads[0].getAttribute('aria-expanded'), 'true', 'the release being installed opens')
    assert.equal(heads[1].getAttribute('aria-expanded'), 'false', 'older releases wait for a click')
    await act(async () => { heads[1].click() })
    assert.match(notes.textContent, /修复了上一个版本的问题/, 'clicking an older version expands its notes')
    const fullLink = popover.querySelector('.dsh-an-updateFull')
    assert.equal(fullLink.getAttribute('href'), releaseUrl(LATEST))
    assert.equal(fullLink.getAttribute('target'), '_blank')
    const actions = popover.querySelector('.dsh-an-updateActions')
    assert.ok(actions, 'the action row carries the update button and the full-release link')
    assert.equal(actions.lastElementChild, fullLink, 'the full-release link sits to the right of the update button')
    updateButton = actions.querySelector('.dsh-an-updatePrimary')
    assert.ok(updateButton, 'the update button shares that row')
    assert.equal(updateButton.textContent, '立即更新')
    assert.equal(popover.querySelector('.dsh-an-updateFallback'), null,
      'a reachable host shows no manual fallback before it is needed')
  })

  await t.test('UPD-004 立即更新只走宿主端点并落到刷新', async () => {
    // "Update now" posts one host request and settles on the refresh action.
    await act(async () => { updateButton.click() })
    await act(async () => { await new Promise(resolve => window.setTimeout(resolve, 200)) })
    assert.equal(hostUpdates, 1, 'the update must POST to the host exactly once')
    assert.equal(hostTarget, LATEST, 'the host receives the offered version')
    assert.equal(calls.filter(call => call.url.includes('/dsh-market/')).length, 0,
      'the update path must not probe the plugin market')
    const done = [...popover.querySelectorAll('.dsh-an-updatePrimary')].map(node => node.textContent)
    assert.ok(done.includes('刷新页面'), `the finished host update offers a refresh, saw ${JSON.stringify(done)}`)
  })

  let addField = popover.querySelector('.dsh-an-input')
  const openRows = () => [...popover.querySelectorAll('.dsh-an-listSection:first-child .dsh-an-row')]
  const openTexts = () => openRows().map(node => node.querySelector('.dsh-an-text').textContent)
  const storedTexts = () => browserWorkspaceItems(window).map(item => item.text)

  await t.test('NOTE-010 键盘调整待续排序并保留焦点', async () => {
    assert.equal(popover.querySelector('.dsh-an-check'), null, 'notes are no longer completed by hand')
    assert.deepEqual(openTexts(), ['新的一条', '旧便笺'])
    const firstInsert = openRows()[0].querySelector('.dsh-an-leading .dsh-an-insert')
    assert.ok(firstInsert, 'Insert leads the note content')
    assert.equal(openRows()[0].querySelector('.dsh-an-workspaceName').textContent, '未归属')
    assert.equal(openRows()[0].querySelector('.dsh-an-workspaceJump'), null)
    assert.equal(firstInsert.getAttribute('aria-label'), '填入')
    assert.equal(firstInsert.getAttribute('aria-keyshortcuts'), 'ArrowUp ArrowDown')
    firstInsert.focus()
    const press = async (node, key) => {
      await act(async () => {
        node.dispatchEvent(new window.KeyboardEvent('keydown', { key, bubbles: true, cancelable: true }))
      })
    }
    await press(firstInsert, 'ArrowDown')
    assert.deepEqual(openTexts(), ['旧便笺', '新的一条'], 'ArrowDown moves the note down')
    assert.deepEqual(storedTexts(), ['旧便笺', '新的一条'], 'the new order is stored')
    assert.equal(document.activeElement, firstInsert, 'the moved note keeps focus on Insert')
    await press(firstInsert, 'ArrowDown')
    assert.deepEqual(storedTexts(), ['旧便笺', '新的一条'], 'the last note cannot move further down')
    await press(firstInsert, 'ArrowUp')
    assert.deepEqual(storedTexts(), ['新的一条', '旧便笺'], 'ArrowUp moves it back')
  })

  await t.test('NOTE-002 归档便笺与清除归档需二次确认', async () => {
    // 填入 needs a composer on screen; without one nothing changes.
    const composer = document.querySelector('[data-composer-input]')
    const insertButton = text => openRows()
      .find(node => node.querySelector('.dsh-an-text').textContent === text)
      .querySelector('.dsh-an-iconBtn[aria-label="填入"]')
    await act(async () => { insertButton('新的一条').click() })
    assert.equal(composer.value, '', 'a hidden composer receives nothing')
    assert.ok(storedTexts().length === 2 && browserWorkspaceItems(window).every(item => item.done === false), 'a failed insert keeps the note open')

    // With the composer visible the note lands there and is archived in one step.
    composer.getBoundingClientRect = () => ({
      width: 320, height: 24, top: 0, left: 0, right: 320, bottom: 24, x: 0, y: 0, toJSON: () => ({}),
    })
    await act(async () => { insertButton('新的一条').click() })
    assert.equal(composer.value, '新的一条', 'the note goes into the chat composer as plain text')
    const inserted = browserWorkspaceItems(window).find(item => item.text === '新的一条')
    assert.equal(inserted.done, true, 'putting the note into the chat archives it')
    assert.ok(Number.isFinite(inserted.completedAt), 'the archive time is stamped')
    assert.equal(window.localStorage.getItem('dsh.aside-note.forwarded'), null, 'no forward marks are written')
    await act(async () => { await new Promise(resolve => window.setTimeout(resolve, 40)) })
    assert.equal(document.querySelector('.dsh-an-headerCount').textContent, '1')
    assert.deepEqual(openTexts(), ['旧便笺'])

    // The archive is collapsed by default.
    const archiveToggle = popover.querySelector('.dsh-an-doneHead .dsh-an-doneToggle')
    assert.match(archiveToggle.textContent, /归档/)
    await act(async () => { archiveToggle.click() })
    const archivedRow = popover.querySelector('.dsh-an-rowArchived')
    assert.ok(archivedRow, 'the archived note renders in the archive')
    assert.equal(archivedRow.hasAttribute('data-sortable'), false, 'archived rows retain archive order')
    assert.ok(archivedRow.querySelector('.dsh-an-leading'), 'the text keeps the shared edge')
    assert.equal(archivedRow.querySelector('.dsh-an-insert'), null, 'an archived note cannot be inserted again')
    assert.ok(archivedRow.querySelector('.dsh-an-iconBtn[aria-label="退回"]'), 'an archived note can still be taken back')
    const clearButton = popover.querySelector('.dsh-an-clear')
    assert.ok(clearButton, 'the archive must offer clear')
    assert.equal(clearButton.textContent, '清空归档')
    await act(async () => { clearButton.click() })
    assert.ok(popover.querySelector('.dsh-an-clearConfirm'), 'clearing asks for a second click')
    await act(async () => { popover.querySelector('.dsh-an-miniDanger').click() })
    const afterClear = browserWorkspaceItems(window)
    assert.equal(afterClear.length, 1)
    assert.equal(afterClear[0].done, false)
  })

  await t.test('NOTE-003 退回顶部输入框后可续写并持久化', async () => {
    // 退回 is the only way back into the composer: it moves the remaining note
    // into the top input and clears the row. A non-empty draft is never replaced.
    const recallButton = popover.querySelector('.dsh-an-iconBtn[aria-label="退回"]')
    assert.ok(recallButton, 'the row must offer 退回')
    await act(async () => {
      valueSetter.call(addField, '未发送的草稿')
      addField.dispatchEvent(new window.Event('input', { bubbles: true }))
    })
    await act(async () => { recallButton.click() })
    const blocked = browserWorkspaceItems(window)
    assert.equal(blocked.length, 1, 'a non-empty composer blocks 退回')
    assert.equal(addField.value, '未发送的草稿', 'the existing draft is left untouched')
    await act(async () => {
      valueSetter.call(addField, '')
      addField.dispatchEvent(new window.Event('input', { bubbles: true }))
    })
    await act(async () => { recallButton.click() })
    await act(async () => { await new Promise(resolve => window.setTimeout(resolve, 40)) })
    const afterRecall = browserWorkspaceItems(window)
    assert.equal(afterRecall.length, 0, '退回 removes the row')
    assert.equal(addField.value, '旧便笺', 'the note text lands in the top composer')
    assert.equal(popover.querySelector('.dsh-an-editInput'), null, 'there is no inline editor')
    const empty = popover.querySelector('.dsh-an-empty')
    assert.ok(empty, 'the list falls back to the empty state')
    assert.match(empty.textContent, /边记摸鱼中\.\./)
    assert.match(empty.textContent, /趁 agent 工作时，异步记下你的想法/)

    // Submitting the recalled text adds it back as a fresh open note.
    await act(async () => {
      valueSetter.call(addField, '改过的便笺')
      addField.dispatchEvent(new window.Event('input', { bubbles: true }))
    })
    await act(async () => { popover.querySelector('.dsh-an-addBtn').click() })
    const afterReturn = browserWorkspaceItems(window)
    assert.equal(afterReturn[0].text, '改过的便笺')
    assert.equal(afterReturn[0].done, false)
    assert.equal(addField.value, '', 'the composer clears after adding the recalled note')
  })

  await t.test('PANEL-006 键盘调整面板宽度并持久化', async () => {
    const widthHandle = popover.querySelector('.dsh-an-resizeHandle')
    assert.ok(widthHandle, 'a right-side panel exposes the width handle')
    const widthBefore = Number(window.localStorage.getItem('dsh.aside-note.panel-width')) || 360
    await act(async () => { widthHandle.dispatchEvent(new window.KeyboardEvent('keydown', { key: 'ArrowLeft', bubbles: true })) })
    assert.ok(Number(window.localStorage.getItem('dsh.aside-note.panel-width')) > widthBefore)
  })

  await t.test('the top composer uses Enter, the command chord and Shift+Enter', async () => {
    // Enter behaves like the main composer: plain Enter adds, Shift+Enter only
    // breaks the line, and the stale shortcut preference does not change that.
    await act(async () => {
      valueSetter.call(addField, '回车提交')
      addField.dispatchEvent(new window.Event('input', { bubbles: true }))
    })
    await act(async () => {
      addField.dispatchEvent(new window.KeyboardEvent('keydown', { key: 'Enter', bubbles: true, cancelable: true }))
    })
    const viaEnter = browserWorkspaceItems(window)
    assert.equal(viaEnter[0].text, '回车提交', 'Enter must add the note')
    assert.equal(addField.value, '', 'Enter clears the composer after adding')
    // The main composer also sends on the command chord; so does this one.
    await act(async () => {
      valueSetter.call(addField, '组合键提交')
      addField.dispatchEvent(new window.Event('input', { bubbles: true }))
    })
    await act(async () => {
      addField.dispatchEvent(new window.KeyboardEvent('keydown', { key: 'Enter', ctrlKey: true, bubbles: true, cancelable: true }))
    })
    const viaChord = browserWorkspaceItems(window)
    assert.equal(viaChord[0].text, '组合键提交', 'the command chord submits like the main composer')
    await act(async () => {
      valueSetter.call(addField, '换行草稿')
      addField.dispatchEvent(new window.Event('input', { bubbles: true }))
    })
    await act(async () => {
      addField.dispatchEvent(new window.KeyboardEvent('keydown', { key: 'Enter', shiftKey: true, bubbles: true, cancelable: true }))
    })
    const afterShift = browserWorkspaceItems(window)
    assert.equal(
      afterShift.length,
      viaChord.length,
      'Shift+Enter must not add a note',
    )
    assert.equal(addField.value, '换行草稿', 'Shift+Enter leaves the draft in the composer')

    const keyDown = (key, options = {}) => {
      const event = new window.KeyboardEvent('keydown', { key, bubbles: true, cancelable: true, ...options })
      addField.dispatchEvent(event)
      return event
    }
    await act(async () => {
      addField.focus()
      addField.setSelectionRange(1, 3)
      addField.dispatchEvent(new window.CompositionEvent('compositionstart', { bubbles: true }))
      assert.equal(keyDown('Escape', { isComposing: true }).defaultPrevented, false)
      addField.dispatchEvent(new window.CompositionEvent('compositionend', { bubbles: true }))
      assert.equal(keyDown('Enter').defaultPrevented, false, 'the IME closing Enter stays with the browser')
    })
    assert.equal(addField.value, '换行草稿')
    assert.equal(browserWorkspaceItems(window).length, viaChord.length)
    await new Promise(resolve => window.setTimeout(resolve, 12))
    await act(async () => { assert.equal(keyDown('Escape').defaultPrevented, true) })
    assert.equal(document.activeElement, button)
    await act(async () => { button.click() })
    popover = document.querySelector('.dsh-an-popover')
    addField = popover.querySelector('.dsh-an-input')
    assert.equal(document.activeElement, addField)
    assert.deepEqual([addField.selectionStart, addField.selectionEnd], [1, 3])
  })

  await t.test('NOTE-004 删除最后一条后回到空状态', async () => {
    const clearDraft = async () => {
      await act(async () => {
        valueSetter.call(addField, '')
        addField.dispatchEvent(new window.Event('input', { bubbles: true }))
      })
    }
    await clearDraft()
    for (const text of ['组合键提交', '回车提交', '改过的便笺']) {
      const row = openRows().find(node => node.querySelector('.dsh-an-text').textContent === text)
      await act(async () => { row.querySelector('button[aria-label="退回"]').click() })
      assert.equal(addField.value, text)
      await clearDraft()
    }
    assert.deepEqual(storedTexts(), [])
    const empty = popover.querySelector('.dsh-an-empty')
    assert.ok(empty, 'the list falls back to the empty state')
    assert.match(empty.textContent, /边记摸鱼中\.\./)
    assert.match(empty.textContent, /趁 agent 工作时，异步记下你的想法/)
  })

  await t.test('PANEL-007 分区折叠状态持久化', async () => {
    // Section collapse is remembered.
    await act(async () => { popover.querySelector('.dsh-an-sectionHead .dsh-an-doneToggle').click() })
    const sections = JSON.parse(window.localStorage.getItem('dsh.aside-note.sections'))
    assert.equal(sections.open, false)
  })

  await t.test('UPD-005 重开面板复用探测缓存', async () => {
    // The probe caches its answer, so reopening the panel reads no registry again.
    await act(async () => { popover.querySelector('.dsh-an-popClose').click() })
    assert.equal(document.querySelector('.dsh-an-popover'), null, 'the close button removes the panel')
    await act(async () => { button.click() })
    await act(async () => { await new Promise(resolve => window.setTimeout(resolve, 20)) })
    assert.equal(registryCalls().length, beforeCheck + REGISTRY_URLS.length, 'the cached answer must be reused by a reopened panel')
    const reopened = document.querySelector('.dsh-an-popover')
    const update = reopened.querySelector('details.dsh-an-updateDetails')
    assert.ok(update.querySelector('summary.dsh-an-updateToggle'))
    assert.equal(update.open, false)
    assert.equal(reopened.querySelector('.dsh-an-sectionHead .dsh-an-doneToggle').getAttribute('aria-expanded'), 'false')
  })

  await t.test('Escape returns focus from the footer to the panel entry', async () => {
    const summary = document.querySelector('.dsh-an-popover summary.dsh-an-storageToggle')
    summary.focus()
    assert.equal(document.activeElement, summary)
    await act(async () => {
      summary.dispatchEvent(new window.KeyboardEvent('keydown', { key: 'Escape', bubbles: true, cancelable: true }))
    })
    assert.equal(document.querySelector('.dsh-an-popover'), null)
    assert.equal(document.activeElement, button)
  })

  await t.test('PKG-002 卸载时移除注入的样式', async () => {
    await act(async () => { reactRoot.unmount() })
    for (const dispose of disposers) dispose()
    assert.equal(document.querySelector('style[data-dsh-plugin="dsh-sideby-note"]'), null,
      'the stylesheet must be removed when the plugin is disposed')
    dom.window.close()
  })

})

test('workspace notes share a list and global actions preserve ownership', async t => {
  const dom = new JSDOM(
    '<!doctype html><html><body>' +
      '<div class="_headerUtilities"></div>' +
      '<div data-conversation-session="session-1"><textarea data-composer-input></textarea></div>' +
      '<div data-conversation-session="session-2"><textarea data-composer-input></textarea></div>' +
    '</body></html>',
    { url: 'https://example.test/', pretendToBeVisual: true, runScripts: 'outside-only' },
  )
  const { window } = dom
  t.after(() => window.close())
  globalThis.window = window
  globalThis.document = window.document
  globalThis.IS_REACT_ACT_ENVIRONMENT = true

  // jsdom returns a zero rect for every node; the composer and panel both treat
  // a zero-size node as invisible, so give them a layout box.
  window.HTMLElement.prototype.getBoundingClientRect = () => ({
    width: 320, height: 24, top: 0, left: 0, right: 320, bottom: 24, x: 0, y: 0,
    toJSON: () => ({}),
  })

  // The second workspace already copied one legacy note at an earlier upgrade.
  // Its original session still has that note and a newer, distinct item.
  window.localStorage.setItem('dsh.aside-note', JSON.stringify({
    version: 1,
    sessions: {
      'session-1': { items: [{ id: 'seed-1', text: '会话一的事项', done: false, createdAt: 1, updatedAt: 1 }] },
      'session-2': { items: [{ id: 'seed-2', text: '会话二的事项', done: false, createdAt: 2, updatedAt: 2 }] },
      'session-3': { items: [
        { id: 'seed-2', text: '另一工作区的旧事项', done: false, createdAt: 3, updatedAt: 3 },
        { id: 'seed-3', text: '先前未并入的事项', done: false, createdAt: 4, updatedAt: 4 },
      ] },
    },
  }))
  window.localStorage.setItem(WORKSPACE_KEY, JSON.stringify({
    version: 1,
    workspaces: {
      'ws-2': {
        workspaceId: 'ws-2',
        items: [{ id: 'seed-2', text: '另一工作区的旧事项', done: false, createdAt: 3, updatedAt: 3 }],
        seededSessionIds: ['session-3'],
      },
    },
  }))
  window.localStorage.setItem('dsh.aside-note.drafts', JSON.stringify({
    version: 1,
    sessions: {
      'session-1': { add: '会话一的旧草稿', edits: { 'seed-1': '旧编辑草稿' } },
      'session-2': { add: '会话二的旧草稿' },
    },
  }))
  window.fetch = async () => ({ ok: false, status: 404, json: async () => ({}) })

  const React = await import('react')
  const ReactDOMClient = await import('react-dom/client')
  const { act } = React

  let loaded = null
  window.__ModuleLoader__ = { load: spec => { loaded = spec } }
  window.eval(bundle)

  const moduleTable = {
    react: React,
    'react/jsx-runtime': ReactJSXRuntime,
    'react-dom': await import('react-dom'),
    'react-dom/client': ReactDOMClient,
    '@deepseek-ai/dsh-client-ui-primitives': {},
  }
  const exported = loaded.factory(id => {
    if (!(id in moduleTable)) throw new Error(`module table cannot answer ${id}`)
    return moduleTable[id]
  })

  const disposers = []
  const registered = []
  const locale = {
    bind: () => key => key,
    register: () => {},
    getLocale: () => ({ active: 'zh' }),
  }
  const workspaceStarts = []
  let finishWorkspaceOpen
  const uiWorkspace = {
    openWorkspace(id, beforeOpen) {
      workspaceStarts.push(id)
      finishWorkspaceOpen?.()
      return new Promise(resolve => {
        finishWorkspaceOpen = sessionId => {
          if (sessionId) beforeOpen(sessionId)
          finishWorkspaceOpen = undefined
          resolve()
        }
      })
    },
  }
  const ctx = {
    get: name => ({ locale, uiWorkspace })[name],
    effect: fn => {
      const dispose = fn()
      if (typeof dispose === 'function') disposers.push(dispose)
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

  const capture = captureWithFrame(React, registered)
  const workspace = {
    workspaceId: 'ws-1',
    path: '/repo',
    title: '共享工作区',
    sessionIds: ['session-1', 'session-2'],
    createdAt: '',
    updatedAt: '',
  }
  // Stand-in for the global standard prop ui-workspace publishes on every slot.
  const otherWorkspace = { ...workspace, workspaceId: 'ws-2', path: '/other', title: '另一工作区', sessionIds: ['session-3'] }
  const useWorkspaces = selector => selector({ items: [workspace, otherWorkspace], archivedSessionIds: [], pinnedSessionIds: [], state: 'idle', phase: 'ready', error: null })

  // Cross-subtest bindings: the flow is one session, each step seeds the next.
  let header, popover, firstRoot, secondPopover, secondRoot
  const openStorageDetails = async panel => {
    const summary = panel.querySelector('summary.dsh-an-storageToggle')
    await act(async () => {
      const toggled = new Promise(resolve => summary.parentElement.addEventListener('toggle', resolve, { once: true }))
      summary.click()
      await toggled
    })
  }
  const assertLocalStorageDetails = panel => {
    assert.match(panel.querySelector('.dsh-an-footerBody')?.textContent ?? '', /便笺仍保存在本浏览器/)
  }

  await t.test('SCOPE-001 首次见到工作区时一次性并入成员会话便笺', async () => {
    const host = document.createElement('div')
    document.body.appendChild(host)
    firstRoot = ReactDOMClient.createRoot(host)
    const pendingWorkspaces = selector => selector({ phase: 'pending', state: 'loading', items: [] })
    await act(async () => {
      firstRoot.render(React.createElement(capture, { sessionId: 'session-1', useWorkspaces: pendingWorkspaces }))
    })
    assert.ok(JSON.parse(window.localStorage.getItem('dsh.aside-note')).sessions['session-1'])
    assert.deepEqual(browserWorkspaceItems(window, UNASSIGNED), [], 'pending workspace membership cannot trigger migration')
    const button = document.querySelector('.dsh-an-headerBtn')
    await act(async () => { button.click() })
    const pendingPanel = document.querySelector('.dsh-an-popover')
    assert.match(pendingPanel.textContent, /正在确认工作区归属/)
    assert.equal(pendingPanel.querySelector('.dsh-an-scopePending .dsh-an-scopeCount').textContent, '—')
    assert.equal(pendingPanel.querySelector('[data-scope-mode="workspace"]'), null)
    assert.equal(button.querySelector('.dsh-an-headerCount'), null, 'pending membership hides the badge')
    const pendingField = pendingPanel.querySelector('textarea')
    assert.equal(pendingField.value, '会话一的旧草稿')
    assert.equal(pendingPanel.querySelector('.dsh-an-addBtn').disabled, true, 'pending membership also prevents writing the draft')
    await act(async () => {
      firstRoot.render(React.createElement(capture, { sessionId: 'session-1', useWorkspaces }))
    })
    assert.equal(document.querySelector('.dsh-an-popover'), pendingPanel, 'workspace resolution keeps the open panel')
    assert.equal(pendingPanel.querySelector('.dsh-an-scopePending'), null)

    const sessionStore = JSON.parse(window.localStorage.getItem('dsh.aside-note'))
    assert.equal(sessionStore.version, 1, 'the session key keeps its original shape')
    assert.deepEqual(sessionStore.sessions, {}, 'legacy browser rows are removed after both moves')
    assert.equal(sessionStore.workspaces, undefined, 'workspace data stays under the workspace key')
    const workspaceStore = JSON.parse(window.localStorage.getItem('dsh.aside-note.workspaces'))
    assert.equal(workspaceStore.version, 1)
    const shared = workspaceStore.workspaces['ws-1']
    assert.ok(shared, 'the workspace list must be created on first sight')
    assert.deepEqual(shared.items.map(item => item.text).sort(), ['会话二的事项', '会话一的事项'].sort())
    assert.deepEqual(shared.seededSessionIds.sort(), ['session-1', 'session-2'])
    assert.deepEqual(browserWorkspaceItems(window, 'ws-2').map(item => item.id).sort(), ['seed-2', 'seed-3'],
      'a previously seeded session still contributes distinct IDs without repeating copied IDs')
    assert.equal(window.localStorage.getItem('dsh.aside-note.migrated'), null,
      'the fold is recorded in the store, not with a second marker key')
  })

  await t.test('SCOPE-002 面板默认工作区范围并显示本地存储提示', async () => {
    header = document.querySelector('.dsh-an-headerBtn')
    popover = document.querySelector('.dsh-an-popover')
    assert.ok(popover, 'the shared list is visible after the workspace resolves')
    const scopeButtons = () => [...popover.querySelectorAll('.dsh-an-scopeBtn')]
    assert.deepEqual(scopeButtons().map(node => node.querySelector('.dsh-an-scopeCount').textContent), ['4', '2'])
    assert.equal(scopeButtons()[1].querySelector('.dsh-an-scopeName').textContent, '共享工作区')
    assert.equal(scopeButtons()[1].getAttribute('aria-label'), '当前工作区：共享工作区 · 2 条待续')
    assert.ok(scopeButtons()[1].querySelector('.dsh-an-scopeIcon'))
    assert.equal(popover.querySelector('.dsh-an-popMeta'), null)
    assert.equal(popover.querySelector('[data-scope-mode="workspace"]').getAttribute('aria-pressed'), 'true',
      'the workspace list is the default scope')
    const footer = popover.querySelector('.dsh-an-popFoot')
    assert.equal(footer.querySelectorAll('details').length, 1)
    assert.equal(footer.textContent.trim(), '存储与更新')
    await openStorageDetails(popover)
    assertLocalStorageDetails(popover)
  })

  const inputOf = root => root.querySelector('.dsh-an-input')
  const setter = Object.getOwnPropertyDescriptor(window.HTMLTextAreaElement.prototype, 'value').set
  const typeInto = async (node, text) => {
    await act(async () => {
      setter.call(node, text)
      node.dispatchEvent(new window.Event('input', { bubbles: true }))
    })
  }

  await t.test('STORE-002 会话草稿并入工作区键并退役旧副本', async () => {
    // The pre-workspace draft is folded under the shared workspace key on first
    // open; the per-session copies are retired so they cannot reappear later.
    const migrated = JSON.parse(window.localStorage.getItem('dsh.aside-note.drafts'))
    assert.equal(migrated.sessions['ws:ws-1'].add, '会话一的旧草稿')
    assert.equal(migrated.sessions['ws:ws-1'].edits, undefined,
      'retired inline edit drafts are not carried into the top composer')
    assert.equal(migrated.sessions['session-1'], undefined, 'the legacy session draft is retired')
    assert.equal(migrated.sessions['session-2'], undefined, 'member-session copies are retired too')
    assert.equal(inputOf(popover).value, '会话一的旧草稿', 'the shared draft starts from the legacy text')
  })

  await t.test('SCOPE-003 全局范围汇总各工作区便笺', async () => {
    const workspaceRows = [...popover.querySelectorAll('.dsh-an-row')]
    const currentOrder = workspaceRows.map(row => row.querySelector('.dsh-an-text').textContent)
    const otherOrder = browserWorkspaceItems(window, 'ws-2').map(item => item.text)
    const workspaceRow = workspaceRows.find(row => row.querySelector('.dsh-an-text').textContent === '会话二的事项')
    assert.equal(workspaceRow.dataset.rowId, 'seed-2')
    assert.equal(workspaceRow.querySelector('.dsh-an-workspaceJump'), null)
    await act(async () => { popover.querySelector('[data-scope-mode="global"]').click() })
    assertLocalStorageDetails(popover)
    const rows = [...popover.querySelectorAll('.dsh-an-row')]
    assert.deepEqual(rows.map(row => row.querySelector('.dsh-an-text').textContent), [...currentOrder, ...otherOrder],
      'Global shows the current workspace first and keeps the saved order in each workspace')
    const duplicateRows = rows.filter(row => ['会话二的事项', '另一工作区的旧事项'].includes(row.querySelector('.dsh-an-text').textContent))
    const ids = duplicateRows.map(row => row.dataset.rowId)
    assert.equal(new Set(ids).size, 2, 'equal raw IDs in different workspaces get distinct row IDs')
    assert.ok(ids.every(id => id && id !== 'seed-2'))
    const currentJump = popover.querySelector('button[aria-label="当前工作区：共享工作区"]')
    const otherJump = popover.querySelector('button[aria-label="在 另一工作区 打开新会话"]')
    assert.equal(currentJump.getAttribute('aria-current'), 'location')
    assert.equal(otherJump.getAttribute('aria-current'), null)
    const workspaceLine = otherJump.closest('.dsh-an-rowWorkspace')
    const otherName = otherJump.querySelector('.dsh-an-workspaceName')
    assert.equal(otherName.textContent, '另一工作区')
    const body = workspaceLine.previousElementSibling
    assert.ok(body.matches('.dsh-an-rowBody'), 'the workspace link follows the draggable note content')
    assert.ok(body.querySelector('.dsh-an-text'))
    assert.ok(body.previousElementSibling.querySelector('.dsh-an-insert'))
    await act(async () => { currentJump.querySelector('.dsh-an-workspaceName').click() })
    assert.deepEqual(workspaceStarts, [], 'the current workspace keeps the current conversation')
    assert.equal(document.querySelector('.dsh-an-popover'), popover)
    await act(async () => { otherName.click() })
    assert.deepEqual(workspaceStarts, ['ws-2'], 'clicking the workspace name starts a session in the target')
    await act(async () => { otherJump.querySelector('.dsh-an-workspaceGlyph').click() })
    assert.deepEqual(workspaceStarts, ['ws-2', 'ws-2'], 'the glyph activates the same button')
    assert.equal(window.localStorage.getItem('dsh.aside-note.scope-mode'), 'global')
    await act(async () => { await new Promise(resolve => window.setTimeout(resolve, 40)) })
    assert.equal(header.querySelector('.dsh-an-headerCount').textContent, '2',
      'the entry badge counts the current workspace even when Global is selected')
    assert.match(header.title, /当前工作区：共享工作区 · 2 条待续/)
    assert.deepEqual([...popover.querySelectorAll('.dsh-an-scopeCount')].map(node => node.textContent), ['4', '2'])
  })

  await t.test('SCOPE-004 切回工作区恢复共享清单并记住选择', async () => {
    // Switching back restores the shared list and remembers the choice.
    await act(async () => { popover.querySelector('[data-scope-mode="workspace"]').click() })
    assert.equal(window.localStorage.getItem('dsh.aside-note.scope-mode'), 'workspace')
    assertLocalStorageDetails(popover)
    assert.deepEqual(
      [...popover.querySelectorAll('.dsh-an-text')].map(node => node.textContent).sort(),
      ['会话二的事项', '会话一的事项'].sort(),
    )
    await act(async () => { await new Promise(resolve => window.setTimeout(resolve, 40)) })
    assert.equal(header.querySelector('.dsh-an-headerCount').textContent, '2')
  })

  await t.test('STORE-003 草稿在范围切换后保留', async () => {
    // The workspace draft stays available across both filters.
    await typeInto(inputOf(popover), '工作区草稿')
    const sharedDrafts = JSON.parse(window.localStorage.getItem('dsh.aside-note.drafts'))
    assert.equal(sharedDrafts.sessions['ws:ws-1'].add, '工作区草稿')
    assert.equal(sharedDrafts.sessions['session-1'], undefined,
      'the workspace draft never falls back to the session key')
    await act(async () => { popover.querySelector('[data-scope-mode="global"]').click() })
    assert.equal(inputOf(popover).value, '工作区草稿', 'the draft survives the scope switch')
    await act(async () => { popover.querySelector('[data-scope-mode="workspace"]').click() })
    assert.equal(inputOf(popover).value, '工作区草稿', 'and comes back with the workspace list')
  })

  await t.test('STORE-004 退回形成的草稿在范围切换后保留', async () => {
    const composer = inputOf(popover)
    await typeInto(composer, '')
    const seedRow = [...popover.querySelectorAll('.dsh-an-row')]
      .find(node => node.querySelector('.dsh-an-text')?.textContent === '会话一的事项')
    await act(async () => { seedRow.querySelector('button[aria-label="退回"]').click() })
    assert.equal(composer.value, '会话一的事项')
    await typeInto(composer, '会话一的事项 · 改')
    await act(async () => { popover.querySelector('[data-scope-mode="global"]').click() })
    assert.equal(composer.value, '会话一的事项 · 改')
    await act(async () => { popover.querySelector('[data-scope-mode="workspace"]').click() })
    assert.equal(composer.value, '会话一的事项 · 改')
    await typeInto(composer, '会话一的事项')
    await act(async () => { popover.querySelector('.dsh-an-addBtn').click() })
    const workspace = JSON.parse(window.localStorage.getItem('dsh.aside-note.workspaces')).workspaces['ws-1']
    assert.equal(workspace.items.filter(item => item.text === '会话一的事项').length, 1)
  })

  await t.test('SCOPE-005 工作区范围新增便笺落在共享清单', async () => {
    // A note created from session-1 belongs to its workspace.
    await typeInto(inputOf(popover), '新增的共享事项')
    await act(async () => { popover.querySelector('.dsh-an-addBtn').click() })
    const afterAdd = JSON.parse(window.localStorage.getItem('dsh.aside-note.workspaces'))
    assert.equal(afterAdd.workspaces['ws-1'].items.length, 3)
    const sessionAfterAdd = JSON.parse(window.localStorage.getItem('dsh.aside-note'))
    assert.deepEqual(sessionAfterAdd.sessions, {}, 'the removed session rows stay removed')
    assert.equal(JSON.parse(window.localStorage.getItem('dsh.aside-note.drafts')).sessions['ws:ws-1'], undefined,
      'submitting the shared draft consumes it')
    assert.equal(inputOf(popover).value, '')
    assert.equal(inputOf(popover).placeholder, '关于共享工作区...')
  })

  await t.test('STORE-005 未提交草稿留在工作区缓冲', async () => {
    // Leave an unsaved draft behind before the conversation switch.
    await typeInto(inputOf(popover), '跨会话草稿')
    assert.equal(
      JSON.parse(window.localStorage.getItem('dsh.aside-note.drafts')).sessions['ws:ws-1'].add,
      '跨会话草稿',
      'the last typing lives in the workspace buffer',
    )
  })

  await t.test('SCOPE-006 另一个会话打开同一工作区读到同一清单', async () => {
    await act(async () => { popover.querySelector('.dsh-an-popClose').click() })
    await act(async () => { firstRoot.unmount() })

    // Open the same workspace from session-2: it reads the same list.
    const secondHost = document.createElement('div')
    document.body.appendChild(secondHost)
    secondRoot = ReactDOMClient.createRoot(secondHost)
    await act(async () => {
      secondRoot.render(React.createElement(capture, { sessionId: 'session-2', useWorkspaces }))
    })
    await act(async () => { document.querySelector('.dsh-an-headerBtn').click() })
    secondPopover = document.querySelector('.dsh-an-popover')
    assert.ok(secondPopover, 'the panel opens in the second session')
    const texts = [...secondPopover.querySelectorAll('.dsh-an-text')].map(node => node.textContent).sort()
    assert.deepEqual(texts, ['会话二的事项', '会话一的事项', '新增的共享事项'].sort())
  })

  await t.test('STORE-006 草稿跨会话与跨范围可见', async () => {
    // The draft typed in session-1 is visible from session-2 in both scopes: the
    // workspace owns the buffer, so switching conversations never strands it.
    assert.equal(inputOf(secondPopover).value, '跨会话草稿',
      'the unsaved draft stays visible after switching conversations')
    await act(async () => { secondPopover.querySelector('[data-scope-mode="global"]').click() })
    assert.equal(inputOf(secondPopover).value, '跨会话草稿',
      'the shared draft stays visible in Global too')
    assert.equal(window.localStorage.getItem('dsh.aside-note.scope-mode'), 'global')
    await act(async () => { secondPopover.querySelector('[data-scope-mode="workspace"]').click() })
    await openStorageDetails(secondPopover)
    assertLocalStorageDetails(secondPopover)
  })

  const workspaceItems = () => JSON.parse(window.localStorage.getItem('dsh.aside-note.workspaces')).workspaces['ws-1'].items

  await t.test('FWD-002 递入只写当前可见会话且归档到原工作区', async () => {
    // 填入 writes into session-2's composer only: session-1's stays empty,
    // proving the shared note follows the conversation currently on screen.
    const row = [...secondPopover.querySelectorAll('.dsh-an-row')]
      .find(node => node.querySelector('.dsh-an-text').textContent === '新增的共享事项')
    const insert = row.querySelector('.dsh-an-iconBtn[aria-label="填入"]')
    assert.ok(insert, 'the open note offers 填入')
    await act(async () => { insert.click() })
    const composers = [...window.document.querySelectorAll('[data-conversation-session]')]
    const valueOf = id => composers
      .find(node => node.getAttribute('data-conversation-session') === id)
      .querySelector('[data-composer-input]').value
    assert.equal(valueOf('session-2'), '新增的共享事项', 'the note lands in the visible composer as plain text')
    assert.equal(valueOf('session-1'), '', 'the hidden session composer is untouched')
    assert.equal(workspaceItems().find(item => item.text === '新增的共享事项').done, true,
      'the shared note is archived for every conversation of the workspace')
  })

  const Pointer = window.PointerEvent || window.MouseEvent
  const pointer = (node, type, clientY, pointerType = 'mouse') => node.dispatchEvent(new Pointer(type, {
    bubbles: true, cancelable: true, button: 0, pointerId: 1, clientY, pointerType,
  }))
  const openList = () => secondPopover.querySelector('.dsh-an-listSection:first-child .dsh-an-rows')

  await t.test('NOTE-010 拖动调整排序且 Escape 取消拖动', async () => {
    const openOrder = () => [...openList().querySelectorAll('.dsh-an-text')].map(node => node.textContent)
    const storedOpen = () => workspaceItems().filter(item => !item.done).map(item => item.text)
    const before = openOrder()
    assert.equal(before.length, 2)
    assert.deepEqual(storedOpen(), before)
    const insert = openList().querySelector('.dsh-an-insert')
    await act(async () => {
      pointer(insert, 'pointerdown', 0)
      pointer(insert, 'pointermove', 60)
      assert.equal(openList().dataset.dragging, undefined, 'Insert does not start a drag')
      pointer(insert, 'pointerup', 60)
    })
    assert.deepEqual(storedOpen(), before)

    const trail = openList().querySelector('.dsh-an-trail')
    await act(async () => {
      pointer(trail, 'pointerdown', 0, 'touch')
      pointer(trail, 'pointermove', 60, 'touch')
      assert.equal(openList().dataset.dragging, undefined, 'a swipe in the side column can scroll')
      pointer(trail, 'pointerup', 60, 'touch')
    })

    let text = openList().querySelector('.dsh-an-text')
    await act(async () => {
      pointer(text, 'pointerdown', 0)
      pointer(text, 'pointermove', 3)
      assert.equal(openList().dataset.dragging, undefined, 'small pointer movement leaves the row in place')
      pointer(text, 'pointermove', 60)
    })
    assert.equal(openList().dataset.dragging, 'true', 'the list marks the drag')
    assert.equal(text.closest('.dsh-an-row').dataset.dragging, 'true', 'dragging the text lifts the row')
    await act(async () => { pointer(text, 'pointerup', 60) })
    const after = [...before.slice(1), before[0]]
    assert.deepEqual(openOrder(), after, 'the drop reorders the rendered list')
    assert.deepEqual(storedOpen(), after, 'the drop is stored')
    assert.equal(openList().dataset.dragging, undefined, 'the drag mark is cleared')
    assert.equal(secondPopover.querySelector('.dsh-an-row[data-dragging]'), null)

    // Escape cancels a drag in flight without closing the panel or moving anything.
    text = openList().querySelector('.dsh-an-text')
    await act(async () => {
      pointer(text, 'pointerdown', 0)
      pointer(text, 'pointermove', 60)
      document.body.dispatchEvent(new window.KeyboardEvent('keydown', { key: 'Escape', bubbles: true, cancelable: true }))
      pointer(text, 'pointerup', 60)
    })
    assert.ok(document.querySelector('.dsh-an-popover'), 'Escape during a drag keeps the panel open')
    assert.deepEqual(storedOpen(), after, 'a cancelled drag stores nothing')
    assert.deepEqual([...openList().querySelectorAll('.dsh-an-row')].map(node => node.style.transform), ['', ''],
      'every row returns to its own slot')
  })

  await t.test('SCOPE-007 全局范围新增便笺写入当前工作区', async () => {
    const secondInput = inputOf(secondPopover)
    await typeInto(secondInput, '第二个会话的草稿')
    const sharedAgain = JSON.parse(window.localStorage.getItem('dsh.aside-note.drafts'))
    assert.equal(sharedAgain.sessions['ws:ws-1'].add, '第二个会话的草稿',
      'session-2 types into the shared workspace draft')
    const otherBefore = browserWorkspaceItems(window, 'ws-2')
    await act(async () => { secondPopover.querySelector('[data-scope-mode="global"]').click() })
    assert.equal(secondInput.value, '第二个会话的草稿', 'the draft follows the workspace across conversations')
    await act(async () => { secondPopover.querySelector('.dsh-an-addBtn').click() })
    assert.ok(workspaceItems().some(item => item.text === '第二个会话的草稿'))
    assert.deepEqual(browserWorkspaceItems(window, 'ws-2'), otherBefore)
    assert.deepEqual(JSON.parse(window.localStorage.getItem('dsh.aside-note')).sessions, {})
    assert.equal(JSON.parse(window.localStorage.getItem('dsh.aside-note.drafts')).sessions['ws:ws-1'], undefined,
      'the shared draft is consumed by the save')
    assert.equal(document.getElementById(secondInput.getAttribute('aria-describedby'))?.textContent, '记到 共享工作区')
  })

  await t.test('SCOPE-014 全局范围操作更新便笺所属工作区', async () => {
    const rowByText = text => [...secondPopover.querySelectorAll('.dsh-an-row')]
      .find(row => row.querySelector('.dsh-an-text').textContent === text)
    const currentBefore = workspaceItems()
    const scopeCounts = () => [...secondPopover.querySelectorAll('.dsh-an-scopeCount')].map(node => Number(node.textContent))
    const [globalBefore, workspaceBefore] = scopeCounts()
    const otherText = '另一工作区的旧事项'
    await act(async () => { rowByText(otherText).querySelector('.dsh-an-insert').click() })
    assert.equal(document.querySelector('[data-conversation-session="session-2"] textarea').value,
      `新增的共享事项\n${otherText}`)
    assert.equal(browserWorkspaceItems(window, 'ws-2').find(item => item.id === 'seed-2').done, true)
    assert.deepEqual(workspaceItems(), currentBefore, 'archiving a matching raw ID leaves the current workspace alone')
    assert.deepEqual(scopeCounts(), [globalBefore - 1, workspaceBefore])

    await act(async () => { secondPopover.querySelector('.dsh-an-doneHead .dsh-an-doneToggle').click() })
    assert.deepEqual([...secondPopover.querySelectorAll('.dsh-an-rowArchived .dsh-an-text')].map(node => node.textContent),
      ['新增的共享事项', otherText], 'the current workspace archive appears before a newer archive from another workspace')
    const archivedRow = rowByText(otherText)
    assert.ok(archivedRow.querySelector('button[aria-label="在 另一工作区 打开新会话"]'))
    assert.equal(archivedRow.querySelector('.dsh-an-insert'), null)
    await act(async () => { secondPopover.querySelector('.dsh-an-clear').click() })
    assert.match(secondPopover.querySelector('.dsh-an-clearConfirm').textContent, /清空所有工作区中这 2 条归档便笺/)
    await act(async () => { secondPopover.querySelector('.dsh-an-clearConfirmActions button').click() })
    await act(async () => { rowByText(otherText).querySelector('[aria-label="退回"]').click() })
    assert.equal(inputOf(secondPopover).value, otherText)
    assert.equal(secondPopover.querySelector('.dsh-an-destination').textContent, '记到 另一工作区')
    assert.ok(!browserWorkspaceItems(window, 'ws-2').some(item => item.id === 'seed-2'))
    assert.deepEqual(workspaceItems(), currentBefore)

    await typeInto(inputOf(secondPopover), '另一工作区改过的事项')
    await act(async () => { secondPopover.querySelector('.dsh-an-addBtn').click() })
    assert.ok(browserWorkspaceItems(window, 'ws-2').some(item => item.text === '另一工作区改过的事项' && !item.done))
    assert.deepEqual(workspaceItems(), currentBefore, 'resubmitting the recalled note keeps its ownership')

    await act(async () => { rowByText('另一工作区改过的事项').querySelector('.dsh-an-insert').click() })
    await act(async () => { secondPopover.querySelector('.dsh-an-clear').click() })
    await act(async () => { secondPopover.querySelector('.dsh-an-miniDanger').click() })
    assert.ok(workspaceItems().every(item => !item.done), 'global clear reaches the current workspace')
    assert.ok(browserWorkspaceItems(window, 'ws-2').every(item => !item.done), 'global clear reaches other workspaces')
  })

  await t.test('SCOPE-015 面板内跳转工作区时保持面板打开', async t => {
    const openTarget = { id: 'seed-2', text: '目标工作区的待续便笺', done: false, createdAt: 8, updatedAt: 8 }
    const archivedTarget = { id: 'archive-jump', text: '共享工作区的归档便笺', done: true, createdAt: 9, updatedAt: 9, completedAt: 9 }
    const store = JSON.parse(window.localStorage.getItem(WORKSPACE_KEY))
    store.workspaces['ws-2'].items.push(openTarget)
    store.workspaces['ws-1'].items.push(archivedTarget)
    await act(async () => {
      window.localStorage.setItem(WORKSPACE_KEY, JSON.stringify(store))
      window.dispatchEvent(new window.StorageEvent('storage', { key: WORKSPACE_KEY }))
    })
    const rowByText = text => [...secondPopover.querySelectorAll('.dsh-an-row')]
      .find(row => row.querySelector('.dsh-an-text').textContent === text)
    const highlightedRows = () => [...secondPopover.querySelectorAll('[data-jump-highlight]')]
    const rowOffsets = new Map([
      [JSON.stringify(['ws-2', openTarget.id]), 340],
      [JSON.stringify(['ws-1', archivedTarget.id]), 640],
    ])
    t.mock.getter(window.HTMLElement.prototype, 'offsetTop', function () {
      return rowOffsets.get(this.dataset.rowId) ?? 0
    })
    t.mock.getter(window.HTMLElement.prototype, 'offsetHeight', function () {
      return this.dataset.rowId === JSON.stringify(['ws-1', archivedTarget.id]) ? 360 : 48
    })
    const setTimeout = window.setTimeout.bind(window)
    let expireHighlight
    t.mock.method(window, 'setTimeout', (callback, delay, ...args) => {
      if (delay !== 2500) return setTimeout(callback, delay, ...args)
      expireHighlight = callback
      return setTimeout(callback, 60000, ...args)
    })

    await typeInto(inputOf(secondPopover), '原工作区的草稿')
    const draftsKey = 'dsh.aside-note.drafts'
    const drafts = JSON.parse(window.localStorage.getItem(draftsKey))
    const targetDraft = '目标工作区的草稿\n第二行'
    drafts.sessions['ws:ws-2'] = { add: targetDraft }
    t.mock.getter(window.Element.prototype, 'scrollHeight', function () {
      return this.matches('.dsh-an-input') && this.value === targetDraft ? 118 : 0
    })
    window.localStorage.setItem(draftsKey, JSON.stringify(drafts))
    const fieldBeforeJump = inputOf(secondPopover)
    const list = secondPopover.querySelector('.dsh-an-listArea')
    const listRect = list.getBoundingClientRect()
    list.getBoundingClientRect = () => ({ ...listRect, height: 320, bottom: listRect.top + 320 })
    Object.defineProperty(list, 'clientHeight', {
      get: () => inputOf(secondPopover).style.height === '120px' ? 200 : 320,
    })
    list.scrollTop = 32
    const targetRow = rowByText(openTarget.text)
    const jump = targetRow.querySelector('button[aria-label="在 另一工作区 打开新会话"]')
    await act(async () => {
      jump.focus()
      jump.dispatchEvent(new window.MouseEvent('click', { bubbles: true, detail: 0 }))
    })
    assert.equal(document.querySelector('.dsh-an-popover'), secondPopover)
    assert.equal(fieldBeforeJump.value, '原工作区的草稿')
    assert.deepEqual(highlightedRows(), [])
    assert.equal(list.scrollTop, 32, 'the source list stays in place until the target session appears')

    const itemsBeforeJump = workspaceItems()
    const draggedText = openList().querySelector('.dsh-an-text')
    await act(async () => {
      pointer(draggedText, 'pointerdown', 0)
      pointer(draggedText, 'pointermove', 60)
    })
    assert.equal(openList().dataset.dragging, 'true', 'a drag can start while the workspace opens')

    const utilities = document.querySelector('._headerUtilities')
    const useBlankSessions = selector => selector({ byId: { 'session-4': { blank: true } } })
    await act(async () => {
      finishWorkspaceOpen('session-4')
      utilities.remove()
      secondRoot.render(React.createElement(capture, { sessionId: 'session-4', useWorkspaces, useSessions: useBlankSessions }))
    })
    assert.equal(document.querySelector('.dsh-an-popover'), secondPopover, 'the same panel stays open while the header is absent')
    assert.equal(secondPopover.querySelector('.dsh-an-listArea'), list)
    assert.equal(list.scrollTop, 252, 'the note is centered in the space left after the destination draft grows')
    assert.equal(inputOf(secondPopover).value, targetDraft)
    assert.equal(document.activeElement, targetRow, 'keyboard activation moves focus to the revealed note')
    assert.equal(secondPopover.querySelector('.dsh-an-destination'), null,
      'the global composer does not repeat the current workspace shown in the scope switch')
    assert.equal(jump.getAttribute('aria-current'), 'location')
    assert.equal(openList().firstElementChild.querySelector('.dsh-an-workspaceJump').getAttribute('aria-current'), 'location',
      'the target workspace moves to the front as soon as the panel follows the jump')
    assert.notEqual(openList().firstElementChild, targetRow, 'the selected note is not the first note in the workspace')
    assert.deepEqual(highlightedRows(), [targetRow], 'only the clicked note is outlined, even with a duplicate ID in another workspace')
    await act(async () => { pointer(draggedText, 'pointerup', 60) })
    assert.deepEqual(workspaceItems(), itemsBeforeJump, 'the old drop position must not reorder the workspace after the jump')
    assert.equal(openList().dataset.dragging, undefined, 'the drag ends when the list is reordered by the jump')

    const corner = document.createElement('div')
    corner.className = '_headerCorner'
    const confirmedWorkspaces = selector => useWorkspaces(snapshot => selector({
      ...snapshot,
      items: [workspace, { ...otherWorkspace, sessionIds: [...otherWorkspace.sessionIds, 'session-4'] }],
    }))
    await act(async () => {
      document.body.append(corner)
      secondRoot.render(React.createElement(capture, { sessionId: 'session-4', useWorkspaces: confirmedWorkspaces, useSessions: useBlankSessions }))
    })
    const newEntry = corner.querySelector('.dsh-an-headerBtn')
    assert.equal(newEntry.getAttribute('aria-expanded'), 'true')
    assert.equal(document.querySelector('.dsh-an-popover'), secondPopover)
    const targetInput = inputOf(secondPopover)
    await typeInto(targetInput, '')
    assert.equal(targetInput.value, '')
    assert.equal(targetInput.placeholder, '关于另一工作区...')
    await typeInto(targetInput, '目标工作区的新草稿')
    const saved = JSON.parse(window.localStorage.getItem(draftsKey)).sessions
    assert.equal(saved['ws:ws-1'].add, '原工作区的草稿')
    assert.equal(saved['ws:ws-2'].add, '目标工作区的新草稿')
    await act(async () => { expireHighlight() })
    assert.deepEqual(highlightedRows(), [], 'the outline disappears after the reveal interval')
    assert.equal(list.scrollTop, 252, 'clearing the outline does not scroll again')

    const archivedToggle = secondPopover.querySelector('.dsh-an-doneHead .dsh-an-doneToggle')
    await act(async () => { archivedToggle.click() })
    await act(async () => {
      rowByText(archivedTarget.text).querySelector('.dsh-an-workspaceJump').click()
      archivedToggle.click()
    })
    assert.equal(archivedToggle.getAttribute('aria-expanded'), 'false')
    assert.equal(workspaceStarts.at(-1), 'ws-1')
    await act(async () => {
      finishWorkspaceOpen('session-1')
      corner.replaceWith(utilities)
      secondRoot.render(React.createElement(capture, { sessionId: 'session-1', useWorkspaces: confirmedWorkspaces }))
    })
    assert.equal(archivedToggle.getAttribute('aria-expanded'), 'true', 'the target archive is reopened when necessary')
    assert.equal(list.scrollTop, 616, 'a tall note starts just below the sticky archive header')
    assert.deepEqual(highlightedRows(), [rowByText(archivedTarget.text)])

    await act(async () => { secondPopover.querySelector('button[aria-label="在 另一工作区 打开新会话"]').click() })
    assert.equal(workspaceStarts.at(-1), 'ws-2')
    await act(async () => {
      finishWorkspaceOpen()
      secondRoot.render(React.createElement(capture, { sessionId: 'session-2', useWorkspaces: confirmedWorkspaces }))
    })
    assert.equal(document.querySelector('.dsh-an-popover'), null,
      'an ordinary session switch superseding the jump still closes the panel')
  })

  await act(async () => { secondRoot.unmount() })
  for (const dispose of disposers) dispose()
  dom.window.close()
})

test('a blank new session opens a usable notes panel from the header corner', async t => {
  const dom = new JSDOM(
    '<!doctype html><html><body>' +
      '<div class="_headerCorner"><button type="button" id="host-rightbar">rightbar</button></div>' +
      '<div data-conversation-session="session-new"><textarea data-composer-input></textarea></div>' +
    '</body></html>',
    { url: 'https://example.test/', pretendToBeVisual: true, runScripts: 'outside-only' },
  )
  const { window } = dom
  t.after(() => window.close())
  globalThis.window = window
  globalThis.document = window.document
  globalThis.IS_REACT_ACT_ENVIRONMENT = true

  window.HTMLElement.prototype.getBoundingClientRect = () => ({
    width: 320, height: 24, top: 0, left: 0, right: 320, bottom: 24, x: 0, y: 0,
    toJSON: () => ({}),
  })
  // A note written before the workspace list existed is folded in when the
  // new session first captures the workspace.
  window.localStorage.setItem('dsh.aside-note', JSON.stringify({
    version: 1,
    sessions: {
      'session-new': { items: [{ id: 'seed-new', text: '新会话前的事项', done: false, createdAt: 1, updatedAt: 1 }] },
    },
  }))
  window.fetch = async () => ({ ok: false, status: 404, json: async () => ({}) })

  const React = await import('react')
  const ReactDOMClient = await import('react-dom/client')
  const { act } = React

  let loaded = null
  window.__ModuleLoader__ = { load: spec => { loaded = spec } }
  window.eval(bundle)
  // The real host seeds the shared Tooltip; this clone keeps its label
  // inspectable without building the portal and hover machinery in jsdom.
  const Tooltip = ({ label, children }) => React.cloneElement(children, { 'data-tooltip': label })
  const moduleTable = {
    react: React,
    'react/jsx-runtime': ReactJSXRuntime,
    'react-dom': await import('react-dom'),
    'react-dom/client': ReactDOMClient,
    '@deepseek-ai/dsh-client-ui-primitives': { Tooltip },
  }
  const exported = loaded.factory(id => {
    if (!(id in moduleTable)) throw new Error(`module table cannot answer ${id}`)
    return moduleTable[id]
  })

  const disposers = []
  const registered = []
  const locale = {
    bind: () => key => key,
    register: () => {},
    getLocale: () => ({ active: 'zh' }),
  }
  const ctx = {
    get: name => (name === 'locale' ? locale : undefined),
    effect: fn => {
      const dispose = fn()
      if (typeof dispose === 'function') disposers.push(dispose)
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

  const hero = captureWithFrame(React, registered, 'conversation.hero.options')
  const workspace = {
    workspaceId: 'ws-new',
    path: '/repo/new',
    title: '新会话工作区',
    sessionIds: ['session-new'],
    createdAt: '',
    updatedAt: '',
  }
  const useWorkspaces = selector => selector({
    items: [workspace], archivedSessionIds: [], pinnedSessionIds: [], state: 'idle', phase: 'ready', error: null,
  })
  let sessionsSnapshot = { byId: { 'session-new': { id: 'session-new', blank: true } } }
  const sessionListeners = new Set()
  const useSessions = selector => React.useSyncExternalStore(
    callback => {
      sessionListeners.add(callback)
      return () => { sessionListeners.delete(callback) }
    },
    () => selector(sessionsSnapshot),
    () => selector(sessionsSnapshot),
  )

  // Cross-subtest bindings: the entry moves and the panel stays open between cases.
  let button, popover, input, setter, root, scopeButtons
  await t.test('PANEL-008 空白新会话把入口挂在右上角并显示工作区计数', async () => {
    const host = document.createElement('div')
    document.body.appendChild(host)
    root = ReactDOMClient.createRoot(host)
    await act(async () => {
      root.render(React.createElement(hero, { sessionId: 'session-new', useWorkspaces, useSessions }))
    })

    assert.equal(host.innerHTML, '',
      'the hero seat only captures context; the visible entry stays the single header button')

    button = document.querySelector('.dsh-an-headerBtn')
    assert.ok(button, 'the blank new session must show the notes entry')
    const corner = document.querySelector('[class*="_headerCorner"]')
    assert.equal(button.parentElement, corner, 'the entry uses the header corner when there are no utilities')
    assert.equal(corner.firstElementChild, button, 'the host right-sidebar button stays rightmost')
    assert.equal(button.dataset.anchor, 'corner')
    assert.equal(button.dataset.scope, 'workspace')
    assert.equal(button.querySelector('.dsh-an-headerCount').textContent, '1',
      'the corner entry counts the workspace notes')
  })

  await t.test('SCOPE-008 空白会话可切换筛选并写入工作区', async () => {
    await act(async () => { button.click() })
    popover = document.querySelector('.dsh-an-popover')
    assert.ok(popover, 'the corner entry opens the panel')
    scopeButtons = () => [...popover.querySelectorAll('.dsh-an-scopeBtn')]
    assert.deepEqual(scopeButtons().map(node => node.dataset.scopeMode), ['global', 'workspace'])
    assert.equal(scopeButtons()[1].querySelector('.dsh-an-scopeName').textContent, '新会话工作区')
    assert.equal(scopeButtons()[1].getAttribute('aria-pressed'), 'true',
      'a bound blank session opens on the workspace list')
    await act(async () => { scopeButtons()[0].click() })
    assert.equal(scopeButtons()[0].getAttribute('aria-pressed'), 'true')

    input = popover.querySelector('.dsh-an-input')
    setter = Object.getOwnPropertyDescriptor(window.HTMLTextAreaElement.prototype, 'value').set
    await act(async () => {
      setter.call(input, '新会话里记一条')
      input.dispatchEvent(new window.Event('input', { bubbles: true }))
    })
    await act(async () => { popover.querySelector('.dsh-an-addBtn').click() })
    const workspaceStore = JSON.parse(window.localStorage.getItem('dsh.aside-note.workspaces'))
    assert.ok(
      workspaceStore.workspaces['ws-new'].items.some(item => item.text === '新会话里记一条'),
      'a note written before the first turn lands in the workspace list',
    )
  })

  await t.test('SCOPE-009 首轮对话后入口迁移并保留筛选', async () => {
    // The panel stays open and the header entry moves to the utilities row.
    const utilities = document.createElement('div')
    utilities.className = '_headerUtilities'
    document.body.appendChild(utilities)
    await act(async () => {
      sessionsSnapshot = { byId: { 'session-new': { id: 'session-new', blank: false } } }
      for (const listener of [...sessionListeners]) listener()
      await new Promise(resolve => window.setTimeout(resolve, 80))
    })

    assert.ok(document.querySelector('.dsh-an-popover'), 'the open panel survives the first turn')
    assert.equal(document.querySelector('._headerUtilities > .dsh-an-headerBtn'), button,
      'the entry moves into the conversation utilities row once the session starts')
    assert.equal(button.dataset.anchor, 'utilities')
    assert.deepEqual(scopeButtons().map(node => node.dataset.scopeMode), ['global', 'workspace'])
    assert.equal(scopeButtons()[1].querySelector('.dsh-an-scopeName').textContent, '新会话工作区')
    assert.equal(scopeButtons()[0].getAttribute('aria-pressed'), 'true', 'Global stays selected across the first turn')
    await act(async () => {
      setter.call(input, '会话开始后的事项')
      input.dispatchEvent(new window.Event('input', { bubbles: true }))
    })
    await act(async () => { popover.querySelector('.dsh-an-addBtn').click() })
    assert.ok(browserWorkspaceItems(window, 'ws-new').some(item => item.text === '会话开始后的事项'),
      'notes still go to the workspace after the first turn')
    assert.equal(JSON.parse(window.localStorage.getItem('dsh.aside-note')).sessions['session-new'], undefined)
  })

  await act(async () => { popover.querySelector('.dsh-an-popClose').click() })
  await act(async () => { root.unmount() })
  for (const dispose of disposers) dispose()
  dom.window.close()
})

test('handing notes to chat joins them on new lines, without a prefix or list marker', async t => {
  const dom = new JSDOM(
    '<!doctype html><html><body>' +
      '<div class="_headerUtilities"></div>' +
      '<div data-conversation-session="session-1"><textarea data-composer-input></textarea></div>' +
    '</body></html>',
    { url: 'https://example.test/', pretendToBeVisual: true, runScripts: 'outside-only' },
  )
  const { window } = dom
  t.after(() => window.close())
  globalThis.window = window
  globalThis.document = window.document
  globalThis.IS_REACT_ACT_ENVIRONMENT = true

  window.HTMLElement.prototype.getBoundingClientRect = () => ({
    width: 320, height: 24, top: 0, left: 0, right: 320, bottom: 24, x: 0, y: 0,
    toJSON: () => ({}),
  })
  window.localStorage.setItem('dsh.aside-note', JSON.stringify({
    version: 1,
    sessions: {
      'session-1': {
        items: ['Alpha', 'Beta', 'Gamma', 'Delta'].map((text, index) => ({
          id: `seed-${index}`, text, done: false, createdAt: index + 1, updatedAt: index + 1,
        })),
      },
    },
  }))
  window.fetch = async () => ({ ok: false, status: 404, json: async () => ({}) })

  const React = await import('react')
  const ReactDOMClient = await import('react-dom/client')
  const { act } = React

  let loaded = null
  window.__ModuleLoader__ = { load: spec => { loaded = spec } }
  window.eval(bundle)

  const moduleTable = {
    react: React,
    'react/jsx-runtime': ReactJSXRuntime,
    'react-dom': await import('react-dom'),
    'react-dom/client': ReactDOMClient,
    '@deepseek-ai/dsh-client-ui-primitives': {},
  }
  const exported = loaded.factory(id => {
    if (!(id in moduleTable)) throw new Error(`module table cannot answer ${id}`)
    return moduleTable[id]
  })

  // A stand-in for the DSH locale service: `bind` defers to the plugin's own
  // bundle (the fallback in makeSay), while the subscription drives live switches.
  let active = 'zh'
  let revision = 0
  const listeners = new Set()
  const locale = {
    bind: () => key => key,
    register: () => {},
    getLocale: () => ({ id: active, revision }),
    getSnapshot: () => ({ active, revision }),
    subscribe: listener => {
      listeners.add(listener)
      return () => { listeners.delete(listener) }
    },
    setLocale: next => {
      active = next
      revision += 1
      for (const listener of [...listeners]) listener()
    },
  }

  const disposers = []
  const registered = []
  const ctx = {
    get: name => (name === 'locale' ? locale : undefined),
    effect: fn => {
      const dispose = fn()
      if (typeof dispose === 'function') disposers.push(dispose)
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

  const capture = captureWithFrame(React, registered)
  const workspace = {
    workspaceId: 'ws-1',
    path: '/repo',
    title: '工作区',
    sessionIds: ['session-1'],
    createdAt: '',
    updatedAt: '',
  }
  const useWorkspaces = selector => selector({ items: [workspace], archivedSessionIds: [], pinnedSessionIds: [], state: 'idle', phase: 'ready', error: null })

  const rootHost = document.createElement('div')
  document.body.appendChild(rootHost)
  const root = ReactDOMClient.createRoot(rootHost)
  await act(async () => {
    root.render(React.createElement(capture, { sessionId: 'session-1', useWorkspaces }))
  })
  const header = document.querySelector('.dsh-an-headerBtn')
  await act(async () => { header.click() })
  const popover = document.querySelector('.dsh-an-popover')
  assert.ok(popover, 'the notes panel must open')

  const setter = Object.getOwnPropertyDescriptor(window.HTMLTextAreaElement.prototype, 'value').set
  const composer = document.querySelector('[data-composer-input]')
  const setComposer = async text => {
    await act(async () => {
      setter.call(composer, text)
      composer.dispatchEvent(new window.Event('input', { bubbles: true }))
    })
  }
  const insert = async text => {
    const row = [...popover.querySelectorAll('.dsh-an-row')]
      .find(node => node.querySelector('.dsh-an-text')?.textContent === text)
    assert.ok(row, `missing note ${text}`)
    await act(async () => { row.querySelector('.dsh-an-insert').click() })
    return composer.value
  }

  await t.test('I18N-001 面板文案跟随当前语言且递入保留原文', async () => {
    assert.equal(popover.querySelector('.dsh-an-popTitle').textContent, '边记部')
    assert.equal(popover.querySelector('.dsh-an-input').placeholder, '关于工作区...')
    const storageToggle = popover.querySelector('summary.dsh-an-storageToggle')
    assert.equal(storageToggle.textContent.trim(), '存储与更新')
    await act(async () => { locale.setLocale('en') })
    assert.equal(popover.querySelector('.dsh-an-popTitle').textContent, 'Sideby Note')
    assert.equal(popover.querySelector('.dsh-an-input').placeholder, 'About 工作区...')
    assert.equal(storageToggle.textContent.trim(), 'Storage & updates')
    assert.equal(await insert('Alpha'), 'Alpha')
  })

  await t.test('FWD-003 第二条便笺另起一行追加', async () => {
    assert.equal(await insert('Beta'), 'Alpha\nBeta')
  })

  await t.test('FWD-004 递入保留会话现有草稿', async () => {
    await setComposer('已经写好的内容')
    assert.equal(await insert('Gamma'), '已经写好的内容\nGamma')
  })

  await t.test('FWD-005 草稿末尾已有换行时直接追加', async () => {
    await setComposer('上一行\n')
    assert.equal(await insert('Delta'), '上一行\nDelta')
  })

  await act(async () => { popover.querySelector('.dsh-an-popClose').click() })
  await act(async () => { root.unmount() })
  for (const dispose of disposers) dispose()
  dom.window.close()
})

test('a damaged note store is set aside before anything overwrites it', async t => {
  const dom = new JSDOM(
    '<!doctype html><html><body><div class="_headerUtilities"></div><div data-conversation-session="session-1"><textarea data-composer-input></textarea></div></body></html>',
    { url: 'https://example.test/', pretendToBeVisual: true, runScripts: 'outside-only' },
  )
  const { window } = dom
  t.after(() => window.close())
  globalThis.window = window
  globalThis.document = window.document
  globalThis.IS_REACT_ACT_ENVIRONMENT = true

  window.HTMLElement.prototype.getBoundingClientRect = () => ({
    width: 320, height: 24, top: 0, left: 0, right: 320, bottom: 24, x: 0, y: 0,
    toJSON: () => ({}),
  })
  // Half-written JSON is what a crashed tab or a hand-edited store looks like.
  const BROKEN = '{"version":1,"sessions":{"session-1":{"items":['
  window.localStorage.setItem('dsh.aside-note', BROKEN)
  window.fetch = async () => ({ ok: false, status: 404, json: async () => ({}) })

  const React = await import('react')
  const ReactDOMClient = await import('react-dom/client')
  const { act } = React

  let loaded = null
  window.__ModuleLoader__ = { load: spec => { loaded = spec } }
  window.eval(bundle)
  const moduleTable = {
    react: React,
    'react/jsx-runtime': ReactJSXRuntime,
    'react-dom': await import('react-dom'),
    'react-dom/client': ReactDOMClient,
    '@deepseek-ai/dsh-client-ui-primitives': {},
  }
  const exported = loaded.factory(id => {
    if (!(id in moduleTable)) throw new Error(`module table cannot answer ${id}`)
    return moduleTable[id]
  })

  const disposers = []
  const registered = []
  const locale = { bind: () => key => key, register: () => {}, getLocale: () => ({ active: 'zh' }) }
  const ctx = {
    get: name => (name === 'locale' ? locale : undefined),
    effect: fn => {
      const dispose = fn()
      if (typeof dispose === 'function') disposers.push(dispose)
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

  const capture = captureWithFrame(React, registered)
  const host = document.createElement('div')
  document.body.appendChild(host)
  const root = ReactDOMClient.createRoot(host)
  await act(async () => { root.render(React.createElement(capture, { sessionId: 'session-1' })) })

  let button, popover
  await t.test('STORE-007 损坏的存储先备份再继续', async () => {
    button = document.querySelector('.dsh-an-headerBtn')
    await act(async () => { button.click() })
    popover = document.querySelector('.dsh-an-popover')
    assert.ok(popover, 'a damaged store must not stop the panel from opening')
    // The raw payload is parked beside the live key before the empty store
    // takes its place, so nothing is lost by the next write.
    const backup = JSON.parse(window.localStorage.getItem('dsh.aside-note.corrupt'))
    assert.equal(backup.raw, BROKEN, 'the unreadable payload must be kept verbatim')
    assert.ok(Number.isFinite(backup.at), 'the backup carries when it was taken')

    const field = popover.querySelector('.dsh-an-input')
    field.focus()
    await act(async () => {
      const setter = Object.getOwnPropertyDescriptor(window.HTMLTextAreaElement.prototype, 'value').set
      setter.call(field, '损坏后新记的一条')
      field.dispatchEvent(new window.Event('input', { bubbles: true }))
    })
    await act(async () => { popover.querySelector('.dsh-an-addBtn').click() })
    assert.equal(browserWorkspaceItems(window).length, 1, 'the store recovers and accepts new notes')
    assert.equal(JSON.parse(window.localStorage.getItem('dsh.aside-note.corrupt')).raw, BROKEN,
      'writing again must not overwrite the backup')
  })

  await act(async () => { root.unmount() })
  for (const dispose of disposers) dispose()
  dom.window.close()
})

test('two tabs writing at once keep both sets of notes', async t => {
  const dom = new JSDOM(
    '<!doctype html><html><body><div class="_headerUtilities"></div><div data-conversation-session="session-1"><textarea data-composer-input></textarea></div></body></html>',
    { url: 'https://example.test/', pretendToBeVisual: true, runScripts: 'outside-only' },
  )
  const { window } = dom
  t.after(() => window.close())
  globalThis.window = window
  globalThis.document = window.document
  globalThis.IS_REACT_ACT_ENVIRONMENT = true

  window.HTMLElement.prototype.getBoundingClientRect = () => ({
    width: 320, height: 24, top: 0, left: 0, right: 320, bottom: 24, x: 0, y: 0,
    toJSON: () => ({}),
  })
  const note = (id, text, createdAt, updatedAt = createdAt) => ({ id, text, done: false, createdAt, updatedAt })
  window.localStorage.setItem(WORKSPACE_KEY, JSON.stringify({
    version: 1,
    workspaces: { [UNASSIGNED]: { workspaceId: UNASSIGNED, updatedAt: 2, items: [note('b', '乙', 2), note('a', '甲', 1)] } },
  }))
  window.fetch = async () => ({ ok: false, status: 404, json: async () => ({}) })

  const React = await import('react')
  const ReactDOMClient = await import('react-dom/client')
  const { act } = React

  let loaded = null
  window.__ModuleLoader__ = { load: spec => { loaded = spec } }
  window.eval(bundle)
  const moduleTable = {
    react: React,
    'react/jsx-runtime': ReactJSXRuntime,
    'react-dom': await import('react-dom'),
    'react-dom/client': ReactDOMClient,
    '@deepseek-ai/dsh-client-ui-primitives': {},
  }
  const exported = loaded.factory(id => {
    if (!(id in moduleTable)) throw new Error(`module table cannot answer ${id}`)
    return moduleTable[id]
  })

  const disposers = []
  const registered = []
  const locale = { bind: () => key => key, register: () => {}, getLocale: () => ({ active: 'zh' }) }
  const ctx = {
    get: name => (name === 'locale' ? locale : undefined),
    effect: fn => {
      const dispose = fn()
      if (typeof dispose === 'function') disposers.push(dispose)
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

  const capture = captureWithFrame(React, registered)
  const host = document.createElement('div')
  document.body.appendChild(host)
  const root = ReactDOMClient.createRoot(host)
  await act(async () => { root.render(React.createElement(capture, { sessionId: 'session-1' })) })

  const button = document.querySelector('.dsh-an-headerBtn')
  await act(async () => { button.click() })
  const popover = document.querySelector('.dsh-an-popover')

  // Another tab writes without this one seeing the storage event: the panel
  // still renders its own last read, which is exactly the race to survive.
  const writeFromOtherTab = items => {
    window.localStorage.setItem(WORKSPACE_KEY, JSON.stringify({
      version: 1,
      workspaces: { [UNASSIGNED]: { workspaceId: UNASSIGNED, updatedAt: Date.now(), items } },
    }))
  }
  const storedItems = () => browserWorkspaceItems(window)
  const typeInto = async (node, text) => {
    await act(async () => {
      const setter = Object.getOwnPropertyDescriptor(window.HTMLTextAreaElement.prototype, 'value').set
      setter.call(node, text)
      node.dispatchEvent(new window.Event('input', { bubbles: true }))
    })
  }

  await t.test('STORE-013 另一个标签页新增的便笺不会被覆盖', async () => {
    writeFromOtherTab([note('c', '另一标签页记的', 3), note('b', '乙', 2), note('a', '甲', 1)])
    await typeInto(popover.querySelector('.dsh-an-input'), '这一页记的')
    await act(async () => { popover.querySelector('.dsh-an-addBtn').click() })
    const texts = storedItems().map(item => item.text)
    assert.ok(texts.includes('另一标签页记的'), 'the other tab’s note must survive this tab’s write')
    assert.ok(texts.includes('这一页记的'), 'this tab’s note must be stored')
    assert.equal(storedItems().length, 4)
  })

  await t.test('STORE-014 同一条目两端并发修改取较新版本', async () => {
    const ahead = note('a', '另一标签页改过', 1, Date.now() + 60000)
    writeFromOtherTab([note('c', '另一标签页记的', 3), note('b', '乙', 2), ahead])
    const row = [...popover.querySelectorAll('.dsh-an-row')]
      .find(node => node.querySelector('.dsh-an-text')?.textContent === '甲')
    await act(async () => { row.querySelector('.dsh-an-insert').click() })
    const kept = storedItems().find(item => item.id === 'a')
    assert.equal(kept.text, '另一标签页改过', 'the later edit wins, even when it came from the other tab')
    assert.ok(popover.textContent.includes('另一标签页改过'), 'the panel renders what was actually stored')
  })

  await t.test('STORE-015 本页删除不会被并发写入复活', async () => {
    writeFromOtherTab([note('d', '并发新增', 4), ...storedItems()])
    const row = [...popover.querySelectorAll('.dsh-an-row')]
      .find(node => node.querySelector('.dsh-an-text')?.textContent === '乙')
    await act(async () => { row.querySelector('button[aria-label="退回"]').click() })
    assert.equal(popover.querySelector('.dsh-an-input').value, '乙')
    const ids = storedItems().map(item => item.id)
    assert.ok(!ids.includes('b'), 'the note deleted here stays deleted')
    assert.ok(ids.includes('d'), 'the note added elsewhere is kept')
  })

  await act(async () => { root.unmount() })
  for (const dispose of disposers) dispose()
  dom.window.close()
})

test('note text rules', async t => {
  const dom = new JSDOM(
    '<!doctype html><html><body><div class="_headerUtilities"></div><div data-conversation-session="session-1"><textarea data-composer-input></textarea></div></body></html>',
    { url: 'https://example.test/', pretendToBeVisual: true, runScripts: 'outside-only' },
  )
  const { window } = dom
  t.after(() => window.close())
  globalThis.window = window
  globalThis.document = window.document
  globalThis.IS_REACT_ACT_ENVIRONMENT = true

  window.HTMLElement.prototype.getBoundingClientRect = () => ({
    width: 320, height: 24, top: 0, left: 0, right: 320, bottom: 24, x: 0, y: 0,
    toJSON: () => ({}),
  })
  window.fetch = async () => ({ ok: false, status: 404, json: async () => ({}) })

  const React = await import('react')
  const ReactDOMClient = await import('react-dom/client')
  const { act } = React

  let loaded = null
  window.__ModuleLoader__ = { load: spec => { loaded = spec } }
  window.eval(bundle)
  const moduleTable = {
    react: React,
    'react/jsx-runtime': ReactJSXRuntime,
    'react-dom': await import('react-dom'),
    'react-dom/client': ReactDOMClient,
    '@deepseek-ai/dsh-client-ui-primitives': {},
  }
  const exported = loaded.factory(id => {
    if (!(id in moduleTable)) throw new Error(`module table cannot answer ${id}`)
    return moduleTable[id]
  })

  const disposers = []
  const registered = []
  const locale = { bind: () => key => key, register: () => {}, getLocale: () => ({ active: 'zh' }) }
  const ctx = {
    get: name => (name === 'locale' ? locale : undefined),
    effect: fn => {
      const dispose = fn()
      if (typeof dispose === 'function') disposers.push(dispose)
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

  const capture = captureWithFrame(React, registered)
  const host = document.createElement('div')
  document.body.appendChild(host)
  const root = ReactDOMClient.createRoot(host)
  await act(async () => { root.render(React.createElement(capture, { sessionId: 'session-1' })) })

  const button = document.querySelector('.dsh-an-headerBtn')
  await act(async () => { button.click() })
  const popover = document.querySelector('.dsh-an-popover')
  const field = popover.querySelector('.dsh-an-input')
  const addButton = popover.querySelector('.dsh-an-addBtn')

  const type = async text => {
    await act(async () => {
      const setter = Object.getOwnPropertyDescriptor(window.HTMLTextAreaElement.prototype, 'value').set
      setter.call(field, text)
      field.dispatchEvent(new window.Event('input', { bubbles: true }))
    })
  }
  const storedItems = () => browserWorkspaceItems(window)

  await t.test('NOTE-005 纯空白文本不产生记录', async () => {
    await type('   \n\t  ')
    assert.equal(addButton.disabled, true, 'whitespace alone cannot be submitted')
    await act(async () => { addButton.click() })
    assert.equal(storedItems().length, 0, 'a rejected submit writes nothing')
  })

  await t.test('NOTE-006 超长文本截断到 280 字符', async () => {
    const exact = '边'.repeat(280)
    await type(exact)
    assert.equal(addButton.disabled, false)
    await act(async () => { addButton.click() })
    assert.equal(storedItems()[0].text.length, 280, 'exactly 280 characters are kept in full')
    assert.equal(storedItems()[0].text, exact)

    const over = '长'.repeat(281)
    await type(over)
    await act(async () => { addButton.click() })
    const head = storedItems()[0]
    assert.equal(head.text.length, 280, 'the 281st character is truncated, not rejected')
    assert.equal(head.text, '长'.repeat(280))

    // The store itself can hold an over-long record (hand-edited, or written by
    // an older version): reading it must clip to 280 as well, not just the form.
    const store = JSON.parse(window.localStorage.getItem(WORKSPACE_KEY))
    store.workspaces[UNASSIGNED].items.unshift({
      id: 'stored-long', text: '超'.repeat(300), done: false, createdAt: 9, updatedAt: 9,
    })
    window.localStorage.setItem(WORKSPACE_KEY, JSON.stringify(store))
    await act(async () => {
      window.dispatchEvent(new window.StorageEvent('storage', { key: WORKSPACE_KEY }))
    })
    await act(async () => { await new Promise(resolve => window.setTimeout(resolve, 60)) })
    const stored = [...popover.querySelectorAll('.dsh-an-text')]
      .find(node => node.textContent.startsWith('超'))
    assert.ok(stored, 'the stored record is rendered')
    assert.equal(stored.textContent.length, 280, 'a stored over-long record is clipped on read')
  })

  await act(async () => { root.unmount() })
  for (const dispose of disposers) dispose()
  dom.window.close()
})
