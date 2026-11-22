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
import type { WorkspaceId, WorkspaceSnapshot } from '@deepseek-ai/dsh-api-workspace-controller/client'
import type { UiWorkspace } from '@deepseek-ai/dsh-client-ui-workspace/client'
import type { ShortcutBinding, ShortcutCatalogEntry, ShortcutCommandId, Shortcuts } from '@deepseek-ai/dsh-client-shortcuts/client'

import CSS from './styles/panel.css?inline'
import { officialAttachmentCSS } from './ui/AttachmentList'
import { NS, PANEL_ID, STORAGE_MODE_KEY } from './constants'
import { DICT, fill, makeSay } from './i18n'
import { bindWorkspace, draftKeyForSession, workspaceById, workspaceForSession, type NoteWorkspace } from './scope'
import { setForwardTarget } from './domain/forward'
import { bootStorage, retryStorage } from './storage/boot'
import { ensureDraftScope } from './storage/drafts'
import {
  STORE_ERROR_LISTENERS,
  STORE_NOTICE_LISTENERS,
  STORE_READY_LISTENERS,
  notifyTodoChange,
} from './storage/events'
import { requestHostRefresh, storageMode } from './storage/state'
import { migrateWorkspaceNotes } from './storage/workspace'
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











































/** Workspace hooks are optional on profiles without the workspace UI. */
const useNoWorkspace = () => null
/** Hosts without a session list cannot tell a new session from an old one. */
const useNoSessions = () => undefined

function isWorkspaceSnapshot(value: unknown): value is {
  items: unknown[]
  phase?: WorkspaceSnapshot['phase']
} {
  return Boolean(value && typeof value === 'object' && 'items' in value && Array.isArray(value.items))
}

/** Compact floating memo list, anchored to the entry that opened it. */
function apply(ctx: DshClientCtx) {
  const locale = ctx.get('locale')
  let workspaceCatalog: NoteWorkspace[] | null = null

  // One document-level sheet covers both the panel and the composer dock;
  // the dock mounts outside the panel tree, so a panel-local <style> would
  // leave it unstyled until the panel had been opened once.
  ctx.effect(() => {
    const style = document.createElement('style')
    style.dataset.dshPlugin = 'dsh-sideby-note'
    style.textContent = `${officialAttachmentCSS}\n${CSS}`
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
  let activePopover: {
    container: HTMLElement
    root: ReturnType<typeof ReactDOMClient.createRoot>
    anchorRef: { current: HTMLButtonElement }
    sessionId: string
    focusComposerOnMount: boolean
    navigation?: { sessionId: string; workspace: NoteWorkspace }
  } | null = null
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

  const closeMemoPopover = (restoreFocus = true) => {
    const current = activePopover
    activePopover = null
    if (!current) return
    // Only hand focus back to the entry when the panel itself had it; a click
    // elsewhere must leave focus where the user put it.
    const hadFocus = restoreFocus && current.container.contains(document.activeElement)
    try {
      current.root.unmount()
    } catch {
      /* already unmounted */
    }
    current.container.remove()
    const anchor = current.anchorRef.current
    if (hadFocus && anchor && anchor.isConnected && typeof anchor.focus === 'function') {
      anchor.focus({ preventScroll: true })
    }
    refreshHeaderEntry()
  }

  const getWorkspaceNavigation = (): Pick<UiWorkspace, 'openWorkspace'> | undefined => {
    const service: UiWorkspace | undefined = ctx.get('uiWorkspace')
    return typeof service?.openWorkspace === 'function' ? service : undefined
  }

  const openNoteWorkspace = (targetId: string) => {
    if (workspaceForSession(activeSessionId)?.workspaceId === targetId) return
    const panel = activePopover
    const target = workspaceById(targetId)
    const navigation = getWorkspaceNavigation()
    if (!panel || !target || !navigation) return
    // Record the exact session only when the host is about to open it. Failed
    // or superseded requests leave ordinary conversation switches alone.
    void navigation.openWorkspace(target.workspaceId, sessionId => {
      if (activePopover === panel) panel.navigation = { sessionId, workspace: target }
    }).catch((error: unknown) => { console.warn('workspace jump failed:', error) })
  }

  const prepareMemoSession = (sessionId: string) => {
    const workspace = workspaceForSession(sessionId)
    if (workspace) ensureDraftScope(draftKeyForSession(sessionId), sessionId, workspace.sessionIds)
  }

  const renderMemoPopover = (panel: NonNullable<typeof activePopover>) => {
    panel.root.render(h(MemoPopover, {
      sessionId: panel.sessionId,
      say: tr,
      locale,
      getLocaleId: localeId,
      anchorRef: panel.anchorRef,
      placement: 'right',
      focusComposerOnMount: panel.focusComposerOnMount,
      onClose: closeMemoPopover,
      onOpenWorkspace: getWorkspaceNavigation() ? openNoteWorkspace : undefined,
      onToast: kind => toastSeat.show(kind),
    }))
  }

  const openMemoPopover = (sessionId: string, anchor: HTMLButtonElement) => {
    if (activePopover && activePopover.anchorRef.current === anchor) {
      closeMemoPopover()
      return
    }
    closeMemoPopover()
    if (storageMode() === 'host') requestHostRefresh()
    if (workspaceCatalog) void migrateWorkspaceNotes(workspaceCatalog)
    prepareMemoSession(sessionId)
    setForwardTarget(sessionId)
    const container = document.createElement('div')
    container.dataset.dshMemoPopoverRoot = 'true'
    document.body.appendChild(container)
    const root = ReactDOMClient.createRoot(container)
    activePopover = { container, root, anchorRef: { current: anchor }, sessionId, focusComposerOnMount: true }
    renderMemoPopover(activePopover)
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
    getActiveAnchor: () => activePopover?.anchorRef.current ?? null,
    getLocaleId: () => localeId(),
    tr,
    onOpen: openMemoPopover,
    onAnchor: (sessionId, anchor) => {
      const panel = activePopover
      if (!panel || panel.sessionId !== sessionId || panel.anchorRef.current === anchor) return
      panel.anchorRef = { current: anchor }
      renderMemoPopover(panel)
    },
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
    const hasWorkspaceHook = typeof props.useWorkspaces === 'function'
    const useWorkspaces = hasWorkspaceHook ? props.useWorkspaces : useNoWorkspace
    const useSessions = typeof props.useSessions === 'function' ? props.useSessions : useNoSessions
    const snapshot: unknown = useWorkspaces(state => state)
    const summary = useSessions(state => state?.byId?.[sessionId])
    const sessionReady = summary?.blank !== true
    const catalog = React.useMemo(() => {
      if (!hasWorkspaceHook) return []
      if (!isWorkspaceSnapshot(snapshot) || (snapshot.phase !== undefined && snapshot.phase !== 'ready')) return null
      return snapshot.items.flatMap((candidate: unknown): NoteWorkspace[] => {
        if (!candidate || typeof candidate !== 'object' || !('workspaceId' in candidate)
          || typeof candidate.workspaceId !== 'string' || !candidate.workspaceId) return []
        return [{
          workspaceId: candidate.workspaceId as WorkspaceId,
          title: 'title' in candidate && typeof candidate.title === 'string' ? candidate.title : '',
          sessionIds: 'sessionIds' in candidate && Array.isArray(candidate.sessionIds)
            ? candidate.sessionIds.filter((id: unknown): id is string => typeof id === 'string')
            : [],
        }]
      })
    }, [hasWorkspaceHook, snapshot])
    const listedWorkspace = catalog?.find(candidate => candidate.sessionIds.includes(sessionId))

    React.useEffect(() => {
      const panel = activePopover
      const navigation = panel?.navigation
      const followedJump = navigation?.sessionId === sessionId
      // The host can select the new session before its membership reaches the catalog.
      const workspace = listedWorkspace ?? (followedJump ? navigation.workspace : null)
      const sessionChanged = activeSessionId !== sessionId
      const workspaceChanged = workspaceForSession(activeSessionId)?.workspaceId !== workspace?.workspaceId
      const resolvedCurrentWorkspace = !sessionChanged && workspaceCatalog === null && catalog !== null
      workspaceCatalog = catalog
      bindWorkspace(sessionId, workspace, sessionReady, catalog)
      activeSessionId = sessionId
      if (sessionChanged) setForwardTarget(sessionId)
      if (panel && (followedJump || resolvedCurrentWorkspace)) {
        if (followedJump && listedWorkspace) delete panel.navigation
        if (sessionChanged || workspaceChanged) {
          prepareMemoSession(sessionId)
          panel.sessionId = sessionId
          panel.focusComposerOnMount = false
          renderMemoPopover(panel)
        }
      } else if (sessionChanged || workspaceChanged) {
        closeMemoPopover()
      }
      if (catalog) void migrateWorkspaceNotes(catalog)
      notifyTodoChange()
      refreshHeaderEntry()
    }, [sessionId, listedWorkspace, sessionReady, catalog])
    return null
  }

  // Storage boot runs after the entry exists so its ready notification can
  // refresh the badge; it never blocks the panel from mounting.
  ctx.effect(() => {
    const onReady = () => {
      if (workspaceCatalog) void migrateWorkspaceNotes(workspaceCatalog)
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
