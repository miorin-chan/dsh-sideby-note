/**
 * Sideby Note browser half.
 *
 * The plugin entry: injects the stylesheet, binds the locale namespace and
 * seats the two slots (session capture + frame-wide toast host) plus the
 * host-owned header entry. Copy, storage, domain rules and the panel UI live
 * in their own modules; P2 splits the remaining UI out of this file.
 */
import React from 'react'
import ReactDOMClient from 'react-dom/client'
import type { ShortcutBinding, ShortcutCatalogEntry, ShortcutCommandId, Shortcuts } from '@deepseek-ai/dsh-client-shortcuts/client'

import CSS from './styles/panel.css?inline'
import { NS, PANEL_ID, STORAGE_MODE_KEY } from './constants'
import { DICT, fill, makeSay } from './i18n'
import { bindWorkspace, draftKeyForSession, scopeForSession, workspaceScopeForSession } from './scope'
import { setForwardTarget } from './domain/forward'
import { readScopeMode } from './storage/prefs'
import { bootStorage, retryStorage } from './storage/boot'
import { ensureDraftScope } from './storage/drafts'
import {
  STORE_ERROR_LISTENERS,
  STORE_NOTICE_LISTENERS,
  STORE_READY_LISTENERS,
  notifyTodoChange,
} from './storage/events'
import { requestHostRefresh, storageMode } from './storage/state'
import { ensureWorkspaceRecord } from './storage/workspace'
import { createToastSeat } from './ui/toastSeat'
import { createHeaderEntry } from './ui/headerEntry'
import { MemoPopover } from './ui/MemoPopover'

const h = React.createElement
const toggleCommandId = `${NS}.toggle` as ShortcutCommandId
const desktopToggle: ShortcutBinding = { code: 'KeyE', modifiers: ['primary'] }
const webToggle: ShortcutBinding = { code: 'KeyE', modifiers: ['primary', 'alt'] }

// Shared controls come from the seeded platform module, so the panel uses the
// product's Tooltip and Toast instead of a second copy. The bundle declares it
// external: a host that cannot resolve it fails the build, never ships a duplicate.











































/** Hosts without ui-workspace (and the bundle test) keep the session list. */
const useNoWorkspace = () => null
/** Hosts without a session list cannot tell a new session from an old one. */
const useNoSessions = () => undefined

/** Compact floating memo list, anchored to the entry that opened it. */
function apply(ctx: DshClientCtx) {
  const locale = ctx.get('locale')

  // One document-level sheet covers both the panel and the composer dock;
  // the dock mounts outside the panel tree, so a panel-local <style> would
  // leave it unstyled until the panel had been opened once.
  ctx.effect(() => {
    const style = document.createElement('style')
    style.dataset.dshPlugin = 'dsh-sideby-note'
    style.textContent = CSS
    document.head.appendChild(style)
    return () => { style.remove() }
  }, 'dsh-sideby-note: styles')

  if (locale && typeof locale.register === 'function') {
    ctx.effect(() => locale.register(NS, DICT), 'dsh-sideby-note: dictionaries')
  }

  const localeId = () => {
    try {
      // Prefer the live service so a client-plugin reload cannot pin an old one.
      const service = ctx.get('locale') || locale
      const current = service && typeof service.getSnapshot === 'function'
        ? service.getSnapshot()
        : service && typeof service.getLocale === 'function'
          ? service.getLocale()
          : null
      // LocaleSnapshot carries `active`; older shapes carried `id` or the bare
      // string. Read all of them so a service change can never pin English.
      const id = typeof current === 'string'
        ? current
        : current && (current.active || current.id || current.locale)
      return typeof id === 'string' && id ? id : 'en'
    } catch {
      return 'en'
    }
  }

  const say = makeSay(ctx, localeId)

  const tr = (key: string, vars?: Record<string, any>) => fill(say(key), vars)
  let activePopover = null
  let activeSessionId = ''

  const toastSeat = createToastSeat(tr)
  let refreshHeaderEntry = () => {}

  // Storage switch outcomes are one-time notices; write failures are already
  // reported by the panel that initiated them, so this only covers background
  // failures (preference writes and workspace seeding).
  ctx.effect(() => {
    const onNotice = notice => {
      if (notice.kind === 'migrated') toastSeat.showText(tr('storage.migrated', { n: notice.count }))
      else if (notice.kind === 'keptLocal') toastSeat.showText(tr('storage.keptLocal'))
      else toastSeat.showText(tr('storage.notSwitched'))
    }
    const onError = (failure: { code: string; message: string }) => {
      if (failure.code === 'STORE_IN_USE') {
        toastSeat.showText(tr('storage.inUse'), null)
        return
      }
      const hostDown = failure.code === 'STORE_UNREACHABLE'
        || failure.code === 'STORE_TIMEOUT'
        || failure.code === 'STORE_UNAVAILABLE'
        || failure.code === 'STORE_OPEN_FAILED'
        || failure.code === 'STORE_FORBIDDEN'
      toastSeat.showText(tr(hostDown ? 'storage.hostError' : 'toast.saveFailed'))
    }
    STORE_NOTICE_LISTENERS.add(onNotice)
    STORE_ERROR_LISTENERS.add(onError)
    return () => {
      STORE_NOTICE_LISTENERS.delete(onNotice)
      STORE_ERROR_LISTENERS.delete(onError)
    }
  }, 'dsh-sideby-note: storage notices')

  const closeMemoPopover = () => {
    const current = activePopover
    activePopover = null
    if (!current) return
    // Only hand focus back to the entry when the panel itself had it; a click
    // elsewhere must leave focus where the user put it.
    const hadFocus = current.container.contains(document.activeElement)
    try {
      current.root.unmount()
    } catch {
      /* already unmounted */
    }
    current.container.remove()
    const anchor = current.anchor
    if (hadFocus && anchor && anchor.isConnected && typeof anchor.focus === 'function') {
      anchor.focus({ preventScroll: true })
    }
    refreshHeaderEntry()
  }

  const openMemoPopover = (sessionId, anchor, placement = 'popover') => {
    if (activePopover && activePopover.anchor === anchor) {
      closeMemoPopover()
      return
    }
    closeMemoPopover()
    // A workspace list must already contain its members' older notes before
    // the panel reads it; the first open is where that merge happens.
    const scope = scopeForSession(sessionId, readScopeMode())
    if (storageMode() === 'host') requestHostRefresh()
    // Host seeding is async and writes straight into the cache the panel reads.
    if (scope.kind === 'workspace') void ensureWorkspaceRecord(scope.id, scope.sessionIds)
    // Drafts belong to the workspace even while the session list is showing,
    // so fold a pre-workspace draft in before the panel reads its composer.
    const workspace = workspaceScopeForSession(sessionId)
    if (workspace) ensureDraftScope(draftKeyForSession(sessionId), sessionId, workspace.sessionIds)
    setForwardTarget(sessionId)
    const container = document.createElement('div')
    container.dataset.dshMemoPopoverRoot = 'true'
    document.body.appendChild(container)
    const root = ReactDOMClient.createRoot(container)
    activePopover = { container, root, anchor, placement }
    root.render(h(MemoPopover, {
      sessionId,
      say: tr,
      locale,
      getLocaleId: localeId,
      anchorRef: { current: anchor },
      placement,
      onClose: closeMemoPopover,
      onToast: kind => toastSeat.show(kind),
    }))
    refreshHeaderEntry()
  }

  let shortcuts: Shortcuts | undefined
  const readToggleShortcut = (): ShortcutCatalogEntry | undefined => {
    if (shortcuts?.config.getSnapshot().status === 'loading') return undefined
    return shortcuts?.catalog.getSnapshot().find(row => row.id === toggleCommandId)
  }
  const headerEntry = createHeaderEntry({
    getShortcut: readToggleShortcut,
    getSessionId: () => activeSessionId,
    getActiveAnchor: () => (activePopover ? activePopover.anchor : null),
    getLocaleId: () => localeId(),
    tr,
    onOpen: (sessionId, anchor) => openMemoPopover(sessionId, anchor, 'right'),
  })
  refreshHeaderEntry = headerEntry.refresh

  // A language switch does not necessarily mutate the header DOM, so the native
  // entry has to be refreshed from the locale service as well.
  if (locale && typeof locale.subscribe === 'function') {
    ctx.effect(
      () => locale.subscribe(() => refreshHeaderEntry()),
      'dsh-sideby-note: locale changes',
    )
  }

  ctx.effect(() => headerEntry.attach(() => closeMemoPopover()), 'dsh-sideby-note: right-side entry')

  // Keep the notes entry available on hosts without the shortcuts service.
  ctx.inject?.(['shortcuts'], shortcutCtx => {
    const service: Shortcuts = shortcutCtx.get('shortcuts')
    shortcutCtx.effect(() => {
      const unregister = service.register({
        id: toggleCommandId,
        label: () => say('shortcut.toggle'),
        aliases: ['sideby note'],
        defaults: {
          'desktop:macos': desktopToggle,
          'desktop:windows': desktopToggle,
          'desktop:linux': desktopToggle,
          'web:macos': webToggle,
          'web:windows': webToggle,
        },
        regions: ['page', 'editable'],
        modals: [],
        resolve: ({ modal }) => {
          if (modal !== null) return { status: 'pass' }
          const button = headerEntry.buttonForSession()
          if (!button || !button.getClientRects().length) return { status: 'pass' }
          return { status: 'handled', run: () => button.click() }
        },
      })
      shortcuts = service
      const unsubscribe = service.catalog.subscribe(headerEntry.refreshShortcut)
      headerEntry.refreshShortcut()
      return () => {
        unsubscribe()
        unregister()
        shortcuts = undefined
        headerEntry.refreshShortcut()
      }
    }, 'dsh-sideby-note: toggle shortcut')
  })

  function BoundSessionCapture(props) {
    const sessionId = props.sessionId || ''
    // `useWorkspaces` and `useSessions` are global standard props; a host
    // without them (or a test harness) keeps the previous, session-only
    // behaviour and never mistakes a conversation for a new session.
    const useWorkspaces = typeof props.useWorkspaces === 'function' ? props.useWorkspaces : useNoWorkspace
    const useSessions = typeof props.useSessions === 'function' ? props.useSessions : useNoSessions
    const snapshot = useWorkspaces(state => state)
    const summary = useSessions(state => (state && state.byId ? state.byId[sessionId] : undefined))
    const sessionReady = !(summary && summary.blank === true)
    const workspace = React.useMemo(() => {
      const items = snapshot && Array.isArray(snapshot.items) ? snapshot.items : []
      return items.find(candidate => (
        candidate && Array.isArray(candidate.sessionIds) && candidate.sessionIds.includes(sessionId)
      )) || null
    }, [snapshot, sessionId])
    // Readiness changes without changing the workspace; the open panel gains
    // the session scope in place instead of being closed on the first turn.
    const workspaceRef = React.useRef({ sessionId: '', workspaceId: '' })

    React.useEffect(() => {
      const workspaceId = workspace ? String(workspace.workspaceId) : ''
      const previous = workspaceRef.current
      const workspaceChanged = previous.sessionId === sessionId && previous.workspaceId !== workspaceId
      workspaceRef.current = { sessionId, workspaceId }
      bindWorkspace(sessionId, workspace, sessionReady)
      if (activeSessionId !== sessionId) {
        activeSessionId = sessionId
        setForwardTarget(sessionId)
        closeMemoPopover()
      } else if (workspaceChanged) {
        // The same conversation gained (or lost) a workspace: the open panel
        // was reading the other list, so reopen it against the right one.
        closeMemoPopover()
      }
      if (workspace) void ensureWorkspaceRecord(workspace.workspaceId, workspace.sessionIds)
      refreshHeaderEntry()
    }, [sessionId, workspace, sessionReady])
    return null
  }

  // Storage boot runs after the entry exists so its ready notification can
  // refresh the badge; it never blocks the panel from mounting.
  ctx.effect(() => {
    const onReady = () => {
      refreshHeaderEntry()
      notifyTodoChange()
    }
    const onStorage = (event: StorageEvent) => {
      if (event.key === STORAGE_MODE_KEY && event.newValue === 'host' && storageMode() === 'local') {
        void retryStorage()
      }
    }
    STORE_READY_LISTENERS.add(onReady)
    window.addEventListener('storage', onStorage)
    void bootStorage()
    return () => {
      STORE_READY_LISTENERS.delete(onReady)
      window.removeEventListener('storage', onStorage)
    }
  }, 'dsh-sideby-note: storage boot')

  ctx.slots.inject('conversation.composer.dock', () =>
    ctx.slots.register(
      {
        name: 'conversation.composer.dock',
        id: PANEL_ID,
        order: 30,
        locale: NS,
      },
      BoundSessionCapture,
    ),
  )

  // The blank new-session page renders hero options but not the composer dock,
  // so this second seat captures the same session/workspace context there. It
  // paints nothing; the entry itself stays the host-owned header button.
  ctx.slots.inject('conversation.hero.options', () =>
    ctx.slots.register(
      {
        name: 'conversation.hero.options',
        id: `${PANEL_ID}.new-session`,
        order: 30,
        locale: NS,
      },
      BoundSessionCapture,
    ),
  )

  // Transient outcomes belong to the frame, not to the panel that raised
  // them; the layout's overlay seat keeps them alive after the panel closes.
  ctx.slots.inject('shell.overlay', () =>
    ctx.slots.register(
      {
        name: 'shell.overlay',
        id: `${PANEL_ID}.toast`,
        order: 60,
        locale: NS,
      },
      toastSeat.ToastHost,
    ),
  )
}


module.exports = { inject: ['slots'], apply }
