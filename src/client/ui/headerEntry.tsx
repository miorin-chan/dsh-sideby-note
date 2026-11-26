/**
 * Conversation header notes button.
 *
 * Active sessions mount inside DSH's official `conversation.session.header.utilities`
 * slot. Blank new sessions omit that header row, so `FrameOverlay` portals this
 * component into `[data-conversation-header-corner], [class*="_headerCorner"]`.
 */
import React from 'react'
import type { ShortcutCatalogEntry } from '@deepseek-ai/dsh-client-shortcuts/client'
import { SESSION_STORAGE_KEY, WORKSPACE_STORAGE_KEY } from '../constants'
import { sessionReadyFor, workspaceCatalogReady, workspaceForSession } from '../scope'
import { storageMode } from '../storage/state'
import { readVisibleNotes } from '../storage/workspace'
import { TODO_LISTENERS } from '../storage/events'

export const NOTE_ICON_MARKUP = '<svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linejoin="round" aria-hidden="true"><path d="M3.25 2.75h6.5l3 3v7.5c0 .55-.45 1-1 1H3.25c-.55 0-1-.45-1-1V3.75c0-.55.45-1 1-1Z"/><path d="M9.75 2.75v3h3"/><path d="M4.9 7.6h5.4M4.9 9.9h3.6" stroke-linecap="round"/></svg>'

function NoteIcon() {
  return (
    <svg
      width={16}
      height={16}
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.3}
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M3.25 2.75h6.5l3 3v7.5c0 .55-.45 1-1 1H3.25c-.55 0-1-.45-1-1V3.75c0-.55.45-1 1-1Z" />
      <path d="M9.75 2.75v3h3" />
      <path d="M4.9 7.6h5.4M4.9 9.9h3.6" strokeLinecap="round" />
    </svg>
  )
}

export type HeaderAnchorKind = 'utilities' | 'corner'

interface HeaderEntryOptions {
  getSessionId: () => string
  getActiveAnchor: () => HTMLButtonElement | null
  getActiveSessionId: () => string | null
  getLocaleId: () => string
  getShortcut: () => ShortcutCatalogEntry | undefined
  tr: (key: string, vars?: Record<string, string | number>) => string
  onOpen: (sessionId: string, anchor: HTMLButtonElement) => void
  onAnchor: (sessionId: string, anchor: HTMLButtonElement) => void
}

interface MountedRecord {
  kind: HeaderAnchorKind
  sessionId: string
  element: HTMLButtonElement
}

function shortcutMeta(shortcut: ShortcutCatalogEntry | undefined, baseTitle: string) {
  const available = Boolean(shortcut && !shortcut.issue && shortcut.conflicts.length === 0)
  const keys = available && shortcut ? shortcut.keys.join(' ') : ''
  const title = keys ? `${baseTitle} (${keys})` : baseTitle
  const ariaKeyshortcuts = available && shortcut?.aria ? shortcut.aria : undefined
  return { title, ariaKeyshortcuts }
}

function syncButtonShortcutAttrs(button: HTMLButtonElement, shortcut: ShortcutCatalogEntry | undefined): void {
  const baseTitle = button.dataset.entryTitle ?? ''
  const { title, ariaKeyshortcuts } = shortcutMeta(shortcut, baseTitle)
  button.title = title
  if (ariaKeyshortcuts) button.setAttribute('aria-keyshortcuts', ariaKeyshortcuts)
  else button.removeAttribute('aria-keyshortcuts')
}

export function createHeaderEntry({
  getSessionId,
  getActiveAnchor,
  getActiveSessionId,
  getLocaleId,
  getShortcut,
  tr,
  onOpen,
  onAnchor,
}: HeaderEntryOptions) {
  let revision = 0
  const listeners = new Set<() => void>()
  const mounts = new Map<HeaderAnchorKind, MountedRecord>()

  const notify = () => {
    revision += 1
    for (const listener of [...listeners]) listener()
  }

  const subscribe = (listener: () => void) => {
    listeners.add(listener)
    return () => { listeners.delete(listener) }
  }

  const getRevision = () => revision

  const buttonForSession = (): HTMLButtonElement | null => {
    const activeId = getSessionId()
    const fromUtilities = mounts.get('utilities')
    if (fromUtilities?.element.isConnected && (!activeId || fromUtilities.sessionId === activeId)) {
      return fromUtilities.element
    }
    const fromCorner = mounts.get('corner')
    if (fromCorner?.element.isConnected && (!activeId || fromCorner.sessionId === activeId)) {
      return fromCorner.element
    }
    const button = document.querySelector<HTMLButtonElement>('.dsh-an-headerBtn')
    return button && (!activeId || button.dataset.sessionId === activeId) ? button : null
  }

  const hasUtilitiesMount = (): boolean => {
    const record = mounts.get('utilities')
    return Boolean(record?.element.isConnected)
  }

  const syncAnchor = () => {
    const activeId = getSessionId()
    const button = buttonForSession()
    if (activeId && button) onAnchor(activeId, button)
  }

  const refresh = () => {
    syncAnchor()
    notify()
  }

  const refreshShortcut = () => {
    const button = buttonForSession()
    if (button) syncButtonShortcutAttrs(button, getShortcut())
    notify()
  }

  const setMount = (kind: HeaderAnchorKind, sessionId: string, element: HTMLButtonElement | null) => {
    const current = mounts.get(kind)
    if (element) {
      const changed = current?.element !== element || current.sessionId !== sessionId
      mounts.set(kind, { kind, sessionId, element })
      const resolvedId = sessionId || getSessionId()
      if (resolvedId) onAnchor(resolvedId, element)
      if (changed && kind === 'utilities') notify()
    } else if (current) {
      mounts.delete(kind)
      if (kind === 'utilities') notify()
    }
  }

  const viewFor = (explicitSessionId?: string) => {
    const sessionId = explicitSessionId || getSessionId()
    const workspace = sessionId ? workspaceForSession(sessionId) : undefined
    const workspaceFilter = workspace?.workspaceId ?? null
    const catalogPending = Boolean(sessionId && !workspace && !workspaceCatalogReady())
    const mode = storageMode()
    const open = sessionId && !catalogPending && (mode === 'host' || mode === 'local')
      ? readVisibleNotes(workspaceFilter).filter(item => !item.done).length
      : null
    const scope = workspace
      ? tr('item.currentWorkspace', { workspace: workspace.title || tr('scope.workspace') })
      : tr('scope.global')
    const count = open === null
      ? tr(mode === 'error' ? 'storage.hostError' : 'storage.loading')
      : tr('dock.count', { n: open })
    const detail = catalogPending ? tr('scope.loading') : `${scope} · ${count}`
    const entryTitle = `${tr('title')} · ${detail}`
    const { title, ariaKeyshortcuts } = shortcutMeta(getShortcut(), entryTitle)
    const scopeKind = catalogPending ? 'pending' : workspace ? 'workspace' : 'global'
    const localeId = getLocaleId()
    return {
      sessionId,
      open,
      scopeKind,
      entryTitle,
      title,
      ariaKeyshortcuts,
      ariaLabel: `${tr('dock.open')} · ${detail}`,
      localeId,
      isExpanded: (button: HTMLButtonElement | null) => {
        const activeAnchor = getActiveAnchor()
        if (button && activeAnchor === button) return true
        return Boolean(sessionId && getActiveSessionId() === sessionId)
      },
    }
  }

  const attach = (onDispose: () => void) => {
    const onStorage = (event: StorageEvent) => {
      if (event.key === SESSION_STORAGE_KEY || event.key === WORKSPACE_STORAGE_KEY || event.key === null) notify()
    }
    TODO_LISTENERS.add(notify)
    window.addEventListener('storage', onStorage)
    notify()
    return () => {
      TODO_LISTENERS.delete(notify)
      window.removeEventListener('storage', onStorage)
      onDispose()
    }
  }

  return {
    attach,
    refresh,
    refreshShortcut,
    buttonForSession,
    hasUtilitiesMount,
    subscribe,
    getRevision,
    setMount,
    viewFor,
    openFor: (sessionId: string, button: HTMLButtonElement) => {
      onOpen(sessionId || getSessionId(), button)
    },
    isBlankReady: (sessionId: string) => Boolean(sessionId && sessionReadyFor(sessionId)),
  }
}

export type HeaderEntryController = ReturnType<typeof createHeaderEntry>

export function HeaderEntryButton({
  anchorKind,
  sessionId,
  controller,
}: {
  anchorKind: HeaderAnchorKind
  sessionId?: string
  controller: HeaderEntryController
}) {
  React.useSyncExternalStore(controller.subscribe, controller.getRevision, controller.getRevision)
  const buttonRef = React.useRef<HTMLButtonElement | null>(null)
  const view = controller.viewFor(sessionId)
  const resolvedId = view.sessionId

  React.useLayoutEffect(() => {
    const el = buttonRef.current
    if (!el || !resolvedId) {
      controller.setMount(anchorKind, resolvedId, null)
      return undefined
    }
    if (anchorKind === 'corner') {
      const host = el.parentElement
      if (host && host.firstElementChild !== el) host.insertBefore(el, host.firstElementChild)
    }
    controller.setMount(anchorKind, resolvedId, el)
    return () => {
      controller.setMount(anchorKind, resolvedId, null)
    }
  }, [anchorKind, controller, resolvedId])

  if (!resolvedId) return null

  const expanded = view.isExpanded(buttonRef.current) ? 'true' : 'false'

  return (
    <button
      ref={buttonRef}
      type="button"
      className="dsh-an-headerBtn"
      data-anchor={anchorKind}
      data-session-id={resolvedId}
      data-scope={view.scopeKind}
      data-active={expanded}
      data-entry-title={view.entryTitle}
      aria-expanded={expanded}
      aria-label={view.ariaLabel}
      aria-keyshortcuts={view.ariaKeyshortcuts}
      title={view.title}
      onPointerDown={event => event.stopPropagation()}
      onClick={event => {
        event.preventDefault()
        event.stopPropagation()
        controller.openFor(resolvedId, event.currentTarget)
      }}
    >
      <span className="dsh-an-headerIcon"><NoteIcon /></span>
      {view.open !== null && view.open > 0 && (
        <span className="dsh-an-headerCount">{view.open > 99 ? '99+' : String(view.open)}</span>
      )}
    </button>
  )
}
