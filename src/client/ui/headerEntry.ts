/**
 * The host-owned notes button in the conversation header.
 *
 * It is a plain DOM node beside the shell's utilities row: a React portal there
 * would be reconciled away. The glyph is inlined for the same reason.
 */
import type { ShortcutCatalogEntry } from '@deepseek-ai/dsh-client-shortcuts/client'
import { SCOPE_MODE_KEY, SESSION_STORAGE_KEY, WORKSPACE_STORAGE_KEY } from '../constants'
import { sessionReadyFor, workspaceForSession } from '../scope'
import { readScopeMode } from '../storage/prefs'
import { readVisibleNotes } from '../storage/workspace'
import { TODO_LISTENERS } from '../storage/events'

const HEADER_ICON = '<svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linejoin="round" aria-hidden="true"><path d="M3.25 2.75h6.5l3 3v7.5c0 .55-.45 1-1 1H3.25c-.55 0-1-.45-1-1V3.75c0-.55.45-1 1-1Z"/><path d="M9.75 2.75v3h3"/><path d="M4.9 7.6h5.4M4.9 9.9h3.6" stroke-linecap="round"/></svg>'

interface HeaderEntryOptions {
  getSessionId: () => string
  getActiveAnchor: () => HTMLButtonElement | null
  getLocaleId: () => string
  getShortcut: () => ShortcutCatalogEntry | undefined
  tr: (key: string, vars?: { n: number }) => string
  onOpen: (sessionId: string, anchor: HTMLButtonElement) => void
  onAnchor: (sessionId: string, anchor: HTMLButtonElement) => void
}

export function createHeaderEntry({ getSessionId, getActiveAnchor, getLocaleId, getShortcut, tr, onOpen, onAnchor }: HeaderEntryOptions) {
  const buttonForSession = () => {
    const button = document.querySelector<HTMLButtonElement>('.dsh-an-headerBtn')
    return button?.dataset.sessionId === getSessionId() ? button : null
  }
  const refreshShortcut = () => {
    const button = buttonForSession()
    if (!button) return
    const shortcut = getShortcut()
    const available = shortcut && !shortcut.issue && shortcut.conflicts.length === 0
    const keys = available ? shortcut.keys.join(' ') : ''
    const title = button.dataset.entryTitle ?? ''
    button.title = keys ? `${title} (${keys})` : title
    if (available && shortcut.aria) button.setAttribute('aria-keyshortcuts', shortcut.aria)
    else button.removeAttribute('aria-keyshortcuts')
  }

  const refresh = () => {
    const sessionId = getSessionId()
    let button = document.querySelector('.dsh-an-headerBtn') as HTMLButtonElement | null
    if (!sessionId) {
      if (button) button.remove()
      return
    }
    const ready = sessionReadyFor(sessionId)
    const utilities = document.querySelector('[class*="_headerUtilities"]')
    const corner = ready ? null : document.querySelector('[class*="_headerCorner"]')
    const host = utilities || corner
    if (!host) {
      if (button) button.remove()
      return
    }
    const workspaceId = workspaceForSession(sessionId)?.workspaceId
    const workspaceFilter = readScopeMode() === 'workspace' ? workspaceId ?? null : null
    const open = readVisibleNotes(workspaceFilter).filter(item => !item.done).length
    if (!button) {
      button = document.createElement('button')
      button.type = 'button'
      button.className = 'dsh-an-headerBtn'
      button.addEventListener('pointerdown', event => event.stopPropagation())
      button.addEventListener('click', event => {
        event.preventDefault()
        event.stopPropagation()
        // The dock can switch conversations while this button stays mounted, so
        // resolve the open session at click time instead of capturing the first.
        onOpen(getSessionId(), button)
      })
    }
    // In the corner, the host's own right-sidebar button remains rightmost;
    // the notes entry sits before it like the utilities-row order.
    if (host === corner) {
      if (host.firstElementChild !== button) host.insertBefore(button, host.firstElementChild)
    } else if (button.parentElement !== host) {
      host.appendChild(button)
    }
    button.dataset.anchor = host === utilities ? 'utilities' : 'corner'
    button.dataset.sessionId = sessionId
    onAnchor(sessionId, button)
    const expanded = getActiveAnchor() === button ? 'true' : 'false'
    button.dataset.active = expanded
    button.setAttribute('aria-expanded', expanded)
    button.dataset.scope = workspaceFilter ? 'workspace' : 'global'
    const signature = `${getLocaleId()}:${workspaceFilter ?? 'global'}:${open}`
    if (button.dataset.signature !== signature) {
      const icon = document.createElement('span')
      icon.className = 'dsh-an-headerIcon'
      icon.innerHTML = HEADER_ICON
      button.replaceChildren(icon)
      if (open > 0) {
        const count = document.createElement('span')
        count.className = 'dsh-an-headerCount'
        count.textContent = open > 99 ? '99+' : String(open)
        button.appendChild(count)
      }
      button.dataset.signature = signature
    }
    // The header entry is host-owned DOM (a React portal beside it would be
    // reconciled away), so the shared Tooltip cannot wrap it; a native title
    // keeps the icon-only control explained on hover.
    button.dataset.entryTitle = open > 0 ? tr('header.tooltip', { n: open }) : tr('header.tooltipEmpty')
    refreshShortcut()
    button.setAttribute('aria-label', open > 0
      ? `${tr('dock.open')}, ${tr('dock.count', { n: open })}`
      : tr('dock.open'))
  }

  /** Watch the store, the DOM and the viewport; returns the cleanup. */
  const attach = onDispose => {
    let scheduled = false
    const schedule = () => {
      if (scheduled) return
      scheduled = true
      requestAnimationFrame(() => {
        scheduled = false
        refresh()
      })
    }
    const onStorage = event => {
      if (event.key === SESSION_STORAGE_KEY || event.key === WORKSPACE_STORAGE_KEY || event.key === SCOPE_MODE_KEY) schedule()
    }
    TODO_LISTENERS.add(schedule)
    window.addEventListener('storage', onStorage)
    const observer = new MutationObserver(schedule)
    observer.observe(document.body, { childList: true, subtree: true })
    refresh()
    return () => {
      TODO_LISTENERS.delete(schedule)
      window.removeEventListener('storage', onStorage)
      observer.disconnect()
      onDispose()
      for (const button of document.querySelectorAll('.dsh-an-headerBtn')) button.remove()
    }
  }

  return { refresh, attach, buttonForSession, refreshShortcut }
}
