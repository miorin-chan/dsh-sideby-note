/**
 * Boots the shipped bundle in jsdom for the resilience tests.
 *
 * The bundle is what the shell loads, so these tests exercise the built
 * artifact, not the sources. Each call gets its own window; `prepare` runs
 * before the plugin boots (seed storage, break storage), `props` are passed to
 * the composer capture the shell would mount.
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { JSDOM } from 'jsdom'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..')
const bundle = fs.readFileSync(path.join(root, 'client', 'client.js'), 'utf8')

const DEFAULT_HTML = '<!doctype html><html><body>'
  + '<div class="_headerUtilities"></div>'
  + '<div data-conversation-session="session-1"><textarea data-composer-input></textarea></div>'
  + '</body></html>'

const json = (status, body) => ({ ok: status >= 200 && status < 300, status, json: async () => body })

export async function bootBundle(t, options = {}) {
  const dom = new JSDOM(options.html ?? DEFAULT_HTML, {
    url: 'https://example.test/',
    pretendToBeVisual: true,
    runScripts: 'outside-only',
  })
  const { window } = dom
  t.after(() => { try { window.close() } catch { /* already closed */ } })
  globalThis.window = window
  globalThis.document = window.document
  globalThis.IS_REACT_ACT_ENVIRONMENT = true

  window.HTMLElement.prototype.getBoundingClientRect = () => ({
    width: 320, height: 24, top: 0, left: 0, right: 320, bottom: 24, x: 0, y: 0,
    toJSON: () => ({}),
  })
  if (options.prepare) await options.prepare(window)
  window.fetch = options.fetch ?? (async () => json(404, {}))

  const React = await import('react')
  const ReactDOM = await import('react-dom')
  const ReactDOMClient = await import('react-dom/client')
  const { act } = React

  let loaded = null
  window.__ModuleLoader__ = { load: spec => { loaded = spec } }
  window.eval(bundle)
  const moduleTable = {
    react: React,
    'react-dom': ReactDOM,
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
    getLocale: () => ({ active: options.locale ?? 'zh' }),
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

  const capture = registered.find(entry => entry.meta.name === 'conversation.composer.dock').component
  const host = document.createElement('div')
  document.body.appendChild(host)
  const reactRoot = ReactDOMClient.createRoot(host)
  await act(async () => {
    reactRoot.render(React.createElement(capture, { sessionId: 'session-1', ...(options.props ?? {}) }))
  })

  let button = document.querySelector('.dsh-an-headerBtn')
  let currentRoot = reactRoot
  let popover = null
  const open = async () => {
    await act(async () => { button.click() })
    popover = document.querySelector('.dsh-an-popover')
    ensure(popover, 'the header entry must open the panel')
    return popover
  }
  const settle = async (ms = 40) => {
    await act(async () => { await new Promise(resolve => window.setTimeout(resolve, ms)) })
  }
  const remount = async (nextProps = {}) => {
    await act(async () => { currentRoot.unmount() })
    const nextHost = document.createElement('div')
    document.body.appendChild(nextHost)
    currentRoot = ReactDOMClient.createRoot(nextHost)
    await act(async () => {
      currentRoot.render(React.createElement(capture, { sessionId: 'session-1', ...nextProps }))
    })
    button = document.querySelector('.dsh-an-headerBtn')
  }
  const dispose = async () => {
    await act(async () => { currentRoot.unmount() })
    for (const dispose of disposers) dispose()
    try { window.close() } catch { /* already closed */ }
  }

  return {
    window,
    document: window.document,
    React,
    act,
    get button() { return button },
    open,
    remount,
    settle,
    dispose,
    get popover() { return popover },
  }
}

function ensure(value, message) {
  if (!value) throw new Error(message)
}
