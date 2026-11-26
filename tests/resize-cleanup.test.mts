import assert from 'node:assert/strict'
import { registerHooks } from 'node:module'
import { extname } from 'node:path'
import test from 'node:test'
import { pathToFileURL } from 'node:url'
import { act, renderHook } from '@testing-library/react'
import { JSDOM } from 'jsdom'

const clientSource = pathToFileURL(new URL('../src/client/', import.meta.url).pathname).href
const resolver = registerHooks({
  resolve(specifier, context, next) {
    if (context.parentURL?.startsWith(clientSource)) {
      if (specifier === '@deepseek-ai/dsh-client-ui-primitives') {
        return next('data:text/javascript,export {}', context)
      }
      if (/^\.{1,2}\//.test(specifier) && !extname(specifier)) return next(`${specifier}.ts`, context)
    }
    return next(specifier, context)
  },
})
const { usePanelGeometry } = await import('../src/client/ui/usePanelGeometry.ts')
resolver.deregister()

function setupDom(t: test.TestContext) {
  const dom = new JSDOM('<!doctype html><html><body></body></html>', { url: 'http://localhost/' })
  const had = {
    window: Object.getOwnPropertyDescriptor(globalThis, 'window'),
    document: Object.getOwnPropertyDescriptor(globalThis, 'document'),
    localStorage: Object.getOwnPropertyDescriptor(globalThis, 'localStorage'),
    ResizeObserver: Object.getOwnPropertyDescriptor(globalThis, 'ResizeObserver'),
  }
  Object.defineProperties(globalThis, {
    window: { value: dom.window, configurable: true },
    document: { value: dom.window.document, configurable: true },
    localStorage: { value: dom.window.localStorage, configurable: true },
    ResizeObserver: { value: undefined, configurable: true },
  })
  dom.window.document.body.style.userSelect = 'text'
  dom.window.document.body.style.cursor = 'auto'

  t.after(() => {
    dom.window.close()
    for (const [key, desc] of Object.entries(had)) {
      if (desc) Object.defineProperty(globalThis, key, desc)
      else Reflect.deleteProperty(globalThis, key)
    }
  })
  return dom.window
}

test('usePanelGeometry restores body styles and stops dragging on pointercancel and blur', t => {
  const win = setupDom(t)
  const anchorRef = { current: null }
  const panelRef = { current: null }
  const { result, unmount } = renderHook(() => usePanelGeometry(anchorRef, 'right', panelRef))

  try {
    act(() => {
      result.current.startPanelResize({ button: 0, clientX: 400, preventDefault() {} })
    })
    assert.equal(win.document.body.style.userSelect, 'none')
    assert.equal(win.document.body.style.cursor, 'ew-resize')

    act(() => {
      win.dispatchEvent(Object.assign(new win.Event('pointermove'), { clientX: 360 }))
    })
    const widthAfterMove = result.current.style.width

    act(() => {
      win.dispatchEvent(new win.Event('pointercancel'))
    })
    assert.equal(win.document.body.style.userSelect, 'text')
    assert.equal(win.document.body.style.cursor, 'auto')

    act(() => {
      win.dispatchEvent(Object.assign(new win.Event('pointermove'), { clientX: 250 }))
    })
    assert.equal(result.current.style.width, widthAfterMove)

    act(() => {
      result.current.startPanelResize({ button: 0, clientX: 360, preventDefault() {} })
    })
    assert.equal(win.document.body.style.cursor, 'ew-resize')

    act(() => {
      win.dispatchEvent(new win.Event('blur'))
    })
    assert.equal(win.document.body.style.userSelect, 'text')
    assert.equal(win.document.body.style.cursor, 'auto')
  } finally {
    unmount()
  }
})

test('usePanelGeometry cleans up active height resize on unmount without committing', t => {
  const win = setupDom(t)
  const anchorRef = { current: null }
  const panelRef = { current: { getBoundingClientRect: () => ({ height: 360 }) } }
  const { result, unmount } = renderHook(() => usePanelGeometry(anchorRef, 'right', panelRef))

  act(() => {
    result.current.startPanelHeightResize({ button: 0, clientY: 200, preventDefault() {} })
  })
  assert.equal(win.document.body.style.userSelect, 'none')
  assert.equal(win.document.body.style.cursor, 'ns-resize')

  act(() => {
    win.dispatchEvent(Object.assign(new win.Event('pointermove'), { clientY: 240 }))
  })
  assert.equal(win.localStorage.getItem('aside-note:panel-height'), null)

  unmount()
  assert.equal(win.document.body.style.userSelect, 'text')
  assert.equal(win.document.body.style.cursor, 'auto')
  assert.equal(win.localStorage.getItem('aside-note:panel-height'), null)
})
