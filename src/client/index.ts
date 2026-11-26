/**
 * Sideby Note browser half.
 *
 * The plugin entry: injects the stylesheet, binds the locale namespace and
 * seats the session capture, composer action and frame overlay alongside
 * the host-owned header entry.
 */
import React from 'react'
import { createPortal } from 'react-dom'
import type { PropsRenderFactories } from '@deepseek-ai/dsh-client-ui-slots'
import type { FileDragService } from '@deepseek-ai/dsh-client-ui-file-drag/client'
import type { ISessions } from '@deepseek-ai/dsh-api-session-controller/client'
import type { WorkspaceId, WorkspaceSnapshot } from '@deepseek-ai/dsh-api-workspace-controller/client'
import type { IConversation } from '@deepseek-ai/dsh-client-ui-conversation/client'
import type { UiWorkspace } from '@deepseek-ai/dsh-client-ui-workspace/client'
import type { ShortcutBinding, ShortcutCatalogEntry, ShortcutCommandId, Shortcuts } from '@deepseek-ai/dsh-client-shortcuts/client'

import CSS from './styles/panel.css?inline'
import { attachmentCSS } from './ui/AttachmentList'
import { NS, PANEL_ID, STORAGE_MODE_KEY } from './constants'
import { DICT, fill, makeSay } from './i18n'
import { bindWorkspace, draftKeyForSession, workspaceById, workspaceForSession, type NoteWorkspace } from './scope'
import type { ComposerInputForSession } from './domain/forward'
import { bootStorage, retryStorage } from './storage/boot'
import { ensureDraftScope } from './storage/drafts'
import { disposeDraftUploads } from './storage/draftUploads'
import {
  STORE_ERROR_LISTENERS,
  STORE_NOTICE_LISTENERS,
  STORE_READY_LISTENERS,
  notifyTodoChange,
} from './storage/events'
import { requestHostRefresh, storageMode } from './storage/state'
import { migrateWorkspaceNotes } from './storage/workspace'
import { createToastSeat } from './ui/toastSeat'
import { createHeaderEntry, HeaderEntryButton } from './ui/headerEntry'
import { MemoPopover, type NoteJump } from './ui/MemoPopover'
import { SendDraftToNotes, type ComposerNoteSlotProps } from './ui/SendDraftToNotes'

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
    style.textContent = `${attachmentCSS}\n${CSS}`
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
  let panelSequence = 0
  let activePopover: {
    id: number
    containerRef: React.RefObject<HTMLDivElement>
    anchorRef: { current: HTMLButtonElement }
    sessionId: string
    focusComposerOnMount: boolean
    noteToReveal?: NoteJump
    navigation?: { sessionId: string; workspace?: NoteWorkspace; note: NoteJump }
  } | null = null
  const panelListeners = new Set<() => void>()
  const readPanel = () => activePopover
  const subscribePanel = (listener: () => void) => {
    panelListeners.add(listener)
    return () => { panelListeners.delete(listener) }
  }
  const updatePanel = (panel: typeof activePopover) => {
    activePopover = panel
    for (const listener of panelListeners) listener()
  }
  let activeSessionId = ''
  const getComposerInput: ComposerInputForSession = sessionId => {
    if (sessionId !== activeSessionId) return undefined
    const sessions: ISessions | undefined = ctx.get('sessions')
    const scope = sessions?.scope(sessionId as Parameters<ISessions['scope']>[0])
    const conversation: IConversation | undefined = scope?.get('conversation')
    if (!scope || !conversation?.input) return undefined
    return conversation.input.for(scope)
  }
  const readFileDrag: FileDragService['read'] = transfer => {
    const service: FileDragService | undefined = ctx.get('fileDrag')
    return service?.read(transfer)
  }

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
    if (!current) return
    const hadFocus = restoreFocus && current.containerRef.current?.contains(document.activeElement)
    updatePanel(null)
    const anchor = current.anchorRef.current
    if (hadFocus && anchor.isConnected) anchor.focus({ preventScroll: true })
    refreshHeaderEntry()
  }

  const panelClicks = new WeakSet<MouseEvent>()

  const getWorkspaceNavigation = (): Pick<UiWorkspace, 'openWorkspace'> | undefined => {
    const service: UiWorkspace | undefined = ctx.get('uiWorkspace')
    return typeof service?.openWorkspace === 'function' ? service : undefined
  }

  const openNoteWorkspace = (note: NoteJump) => {
    const panel = activePopover
    const target = workspaceById(note.workspaceId)
    const navigation = getWorkspaceNavigation()
    if (!panel || !target || !navigation) return
    // Record the exact session only when the host is about to open it. Failed
    // or superseded requests leave ordinary conversation switches alone.
    void navigation.openWorkspace(target.workspaceId, sessionId => {
      if (activePopover?.id !== panel.id) return
      const keyboardTrigger = document.activeElement === note.keyboardTrigger ? note.keyboardTrigger : undefined
      activePopover.navigation = { sessionId, workspace: target, note: { ...note, keyboardTrigger } }
    }).catch((error: unknown) => { console.warn('workspace jump failed:', error) })
  }

  const openNoteSession = (sessionId: string, note: NoteJump) => {
    const panel = activePopover
    if (!panel || sessionId === activeSessionId) return
    const navigation: UiWorkspace | undefined = ctx.get('uiWorkspace')
    const sessions: ISessions | undefined = ctx.get('sessions')
    const id = sessionId as Parameters<ISessions['scope']>[0]
    const catalog = sessions?.list?.getSnapshot()
    if (typeof navigation?.openSession !== 'function' || (catalog?.phase === 'ready' && !Object.hasOwn(catalog.byId, id))) {
      toastSeat.show('sessionUnavailable')
      return
    }
    const pending = { sessionId, note }
    panel.navigation = pending
    try {
      navigation.openSession(id)
    } catch {
      if (panel.navigation === pending) delete panel.navigation
      toastSeat.show('sessionUnavailable')
    }
  }

  const prepareMemoSession = (sessionId: string) => {
    const workspace = workspaceForSession(sessionId)
    if (workspace) ensureDraftScope(draftKeyForSession(sessionId), sessionId, workspace.sessionIds)
  }

  const getSessionList = () => (ctx.get('sessions') as ISessions | undefined)?.list
  const subscribeSessions = (listener: () => void) => getSessionList()?.subscribe(listener) ?? (() => {})
  const readSessionList = () => getSessionList()?.getSnapshot()

  function FrameOverlay({ renderFactorySlot, t }: Partial<PropsRenderFactories> & { t?: (key: string) => string }) {
    const panel = React.useSyncExternalStore(subscribePanel, readPanel)
    const sessions = React.useSyncExternalStore(subscribeSessions, readSessionList)
    const headerRevision = React.useSyncExternalStore(
      headerEntry.subscribe,
      headerEntry.getRevision,
      headerEntry.getRevision,
    )
    const panelId = panel?.id
    const blankSessionId = activeSessionId && !headerEntry.hasUtilitiesMount() && !headerEntry.isBlankReady(activeSessionId)
      ? activeSessionId
      : ''
    const findCornerHost = () => (typeof document === 'undefined'
      ? null
      : document.querySelector('[data-conversation-header-corner], [class*="_headerCorner"]'))
    const [cornerHost, setCornerHost] = React.useState<Element | null>(() => (blankSessionId ? findCornerHost() : null))
    React.useLayoutEffect(() => {
      if (!blankSessionId) {
        setCornerHost(null)
        return undefined
      }
      const immediate = findCornerHost()
      if (immediate) {
        setCornerHost(immediate)
        return undefined
      }
      setCornerHost(null)
      let cancelled = false
      let attempts = 0
      let frame = 0
      const poll = () => {
        if (cancelled) return
        const next = findCornerHost()
        if (next) {
          setCornerHost(next)
          return
        }
        attempts += 1
        if (attempts < 4 && typeof requestAnimationFrame === 'function') {
          frame = requestAnimationFrame(poll)
        }
      }
      if (typeof requestAnimationFrame === 'function') frame = requestAnimationFrame(poll)
      return () => {
        cancelled = true
        if (frame && typeof cancelAnimationFrame === 'function') cancelAnimationFrame(frame)
      }
    }, [blankSessionId, headerRevision, panelId])
    const resolvedCornerHost = blankSessionId ? (cornerHost?.isConnected ? cornerHost : findCornerHost()) : null
    React.useEffect(() => {
      if (panelId === undefined) return
      let pendingClose: number | undefined
      let startedInside = false
      const isInside = (event: Event) => {
        const current = readPanel()
        if (!current) return false
        const path = event.composedPath()
        return path.includes(current.anchorRef.current)
          || (current.containerRef.current !== null && path.includes(current.containerRef.current))
      }
      const onPointerDown = (event: PointerEvent) => { startedInside = isInside(event) }
      const onClick = (event: MouseEvent) => {
        if (event.detail === 0) return
        const inside = startedInside || isInside(event)
        startedInside = false
        if (inside) return

        // Let the target act and React mark clicks from portaled panel children.
        window.clearTimeout(pendingClose)
        pendingClose = window.setTimeout(() => {
          if (readPanel()?.id === panelId && !panelClicks.has(event)) closeMemoPopover(false)
        }, 0)
      }
      window.addEventListener('pointerdown', onPointerDown, true)
      window.addEventListener('click', onClick, true)
      return () => {
        window.removeEventListener('pointerdown', onPointerDown, true)
        window.removeEventListener('click', onClick, true)
        window.clearTimeout(pendingClose)
      }
    }, [panelId])
    return h(React.Fragment, null,
      h(toastSeat.ToastHost, { t }),
      resolvedCornerHost && createPortal(h(HeaderEntryButton, {
        anchorKind: 'corner',
        sessionId: blankSessionId,
        controller: headerEntry,
      }), resolvedCornerHost, 'corner-entry'),
      panel && createPortal(h('div', {
        ref: panel.containerRef,
        onClickCapture: (event: React.MouseEvent) => panelClicks.add(event.nativeEvent),
        'data-dsh-memo-popover-root': 'true',
      }, h(MemoPopover, {
        sessionId: panel.sessionId,
        say: tr,
        locale,
        noteToReveal: panel.noteToReveal,
        getComposerInput,
        renderFactorySlot,
        readFileDrag,
        getLocaleId: localeId,
        anchorRef: panel.anchorRef,
        placement: 'right',
        focusComposerOnMount: panel.focusComposerOnMount,
        onClose: closeMemoPopover,
        onOpenWorkspace: getWorkspaceNavigation() ? openNoteWorkspace : undefined,
        onOpenSession: openNoteSession,
        getActiveSessionId: () => activeSessionId,
        sessionTitle: id => Object.hasOwn(sessions?.byId ?? {}, id)
          ? sessions?.byId[id as Parameters<ISessions['scope']>[0]]?.displayTitle
          : undefined,
        onToast: toastSeat.show,
      })), document.body, String(panel.id)),
    )
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
    updatePanel({
      id: ++panelSequence, containerRef: React.createRef(), anchorRef: { current: anchor }, sessionId, focusComposerOnMount: true,
    })
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
    getActiveSessionId: () => activePopover?.sessionId ?? null,
    getLocaleId: () => localeId(),
    tr,
    onOpen: openMemoPopover,
    onAnchor: (sessionId, anchor) => {
      const panel = activePopover
      if (!panel || panel.sessionId !== sessionId || panel.anchorRef.current === anchor) return
      updatePanel({ ...panel, anchorRef: { current: anchor } })
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

  ctx.effect(() => headerEntry.attach(() => {
    closeMemoPopover(false)
    disposeDraftUploads()
  }), 'dsh-sideby-note: right-side entry')

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
    const sessionReady = summary?.blank === undefined ? !props.newSessionPage : !summary.blank
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
      const workspace = listedWorkspace ?? (followedJump ? navigation.workspace ?? null : null)
      const sessionChanged = activeSessionId !== sessionId
      const workspaceChanged = workspaceForSession(activeSessionId)?.workspaceId !== workspace?.workspaceId
      workspaceCatalog = catalog
      bindWorkspace(sessionId, workspace, sessionReady, catalog)
      activeSessionId = sessionId
      if (panel && (sessionChanged || workspaceChanged)) {
        prepareMemoSession(sessionId)
        updatePanel({
          ...panel,
          sessionId,
          focusComposerOnMount: false,
          noteToReveal: followedJump ? navigation.note : sessionChanged ? undefined : panel.noteToReveal,
          navigation: followedJump
            ? (!listedWorkspace && navigation.workspace ? navigation : undefined)
            : (sessionChanged ? undefined : navigation),
        })
      } else if (panel && followedJump && listedWorkspace) {
        delete panel.navigation
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

  function NewSessionCapture(props: React.ComponentProps<typeof BoundSessionCapture>) {
    return h(BoundSessionCapture, { ...props, newSessionPage: true })
  }

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
      NewSessionCapture,
    ),
  )

  function ComposerNoteEntry(props: ComposerNoteSlotProps) {
    return h(SendDraftToNotes, { ...props, getComposerInput, say: tr, showToast: toastSeat.showText })
  }

  ctx.slots.inject('conversation.input.right', () =>
    ctx.slots.register(
      {
        name: 'conversation.input.right',
        id: `${PANEL_ID}.send-draft`,
        locale: NS,
      },
      ComposerNoteEntry,
    ),
  )

  function HeaderUtilitiesEntry(props: { sessionId?: string }) {
    return h(HeaderEntryButton, {
      anchorKind: 'utilities',
      sessionId: props.sessionId || activeSessionId,
      controller: headerEntry,
    })
  }

  ctx.slots.inject('conversation.session.header.utilities', () =>
    ctx.slots.register(
      {
        name: 'conversation.session.header.utilities',
        id: PANEL_ID,
        order: 90,
        locale: NS,
      },
      HeaderUtilitiesEntry,
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
      FrameOverlay,
    ),
  )
}


module.exports = { inject: ['slots'], apply }
