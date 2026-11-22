/**
 * The floating notes panel.
 *
 * State, handlers and effects for the list in view; the markup lives in the
 * sibling components, the geometry in usePanelGeometry and the store in
 * useSessionMemoStore.
 */
import React from 'react'
import { PANEL_DEFAULT_WIDTH, SCOPE_MODE_KEY } from '../constants'
import { draftKeyForSession, UNASSIGNED_WORKSPACE, workspaceCatalogReady, workspaceForSession, workspaceById, type ScopeMode } from '../scope'
import { STORE_READY_LISTENERS, TODO_LISTENERS, notifyTodoChange } from '../storage/events'
import { retryStorage } from '../storage/boot'
import { readScopeMode, writeScopeMode } from '../storage/prefs'
import { isHostConnectionFailure, storageFailure, storageMode } from '../storage/state'
import { useMemoStore } from './useSessionMemoStore'
import { usePanelGeometry } from './usePanelGeometry'

import { useSections } from './useSections'
import { useUpdateCenter } from './useUpdateCenter'
import { useComposerDraft } from './useComposerDraft'
import { useNoteActions } from './useNoteActions'
import { useRowReorder } from './useRowReorder'
import { useClearConfirm } from './useClearConfirm'
import { useListEdge } from './useListEdge'
import { useOutsideDismiss } from './useOutsideDismiss'
import { compareDoneItems } from '../domain/items'
import { appendToConversation } from '../domain/forward'

import { TodoRow } from './TodoRow'
import { PanelHead } from './PanelHead'
import { PanelFooter } from './PanelFooter'
import { ComposerForm } from './ComposerForm'
import { NoteList } from './NoteList'

const h = React.createElement

function subscribeStorageStatus(callback: () => void) {
  STORE_READY_LISTENERS.add(callback)
  TODO_LISTENERS.add(callback)
  return () => {
    STORE_READY_LISTENERS.delete(callback)
    TODO_LISTENERS.delete(callback)
  }
}

interface MemoComposerHandle {
  recall: ReturnType<typeof useComposerDraft>['recall']
  focus: () => void
}

type MemoComposerProps = Parameters<typeof useComposerDraft>[0] & {
  composerRef: React.Ref<MemoComposerHandle>
  nameOfWorkspace: (id: string) => string
  showDestination: boolean
  say: (key: string, vars?: Record<string, string>) => string
}

function MemoComposer({ composerRef, nameOfWorkspace, showDestination, say, ...options }: MemoComposerProps) {
  const { workspaceId, canUpload, storageInUse, report } = options
  const { draft, draftLocked, isSubmitting, isRecalling, isUploading, addRef, composingRef, add, recall, addFiles, removeAttachment, onDraftChange, onDraftKeyDown } = useComposerDraft(options)
  React.useImperativeHandle(composerRef, (): MemoComposerHandle => ({
    recall,
    focus: () => addRef.current?.focus({ preventScroll: true }),
  }))
  const destination = draft.workspaceId ?? workspaceId
  return h(ComposerForm, {
    say,
    draft: draft.add,
    destination: destination
      ? showDestination || draft.workspaceId
        ? say('add.destination', { workspace: nameOfWorkspace(destination) })
        : undefined
      : say('scope.loading'),
    destinationPending: !destination,
    attachments: draft.attachments,
    draftLocked,
    isSubmitting,
    isRecalling,
    isUploading,
    canUpload,
    storageInUse,
    onFiles: addFiles,
    onRemove: removeAttachment,
    onUnavailable: () => report('attachmentUnavailable'),
    onBusy: () => report('attachmentBusy'),
    inputRef: addRef,
    onDraftChange,
    onCompositionStart: () => { composingRef.current = true },
    onCompositionEnd: () => { composingRef.current = false },
    onKeyDown: onDraftKeyDown,
    onSubmit: event => {
      event.preventDefault()
      if (!composingRef.current) add()
    },
  })
}

export function MemoPopover(props) {
  const say = props.say
  const localeService = props.locale
  // The locale service publishes a revision on every language switch. The
  // popover lives in its own React root, so without this subscription a panel
  // opened before the switch would keep the previous language until reopened.
  const subscribeLocale = React.useCallback(callback => {
    if (localeService && typeof localeService.subscribe === 'function') return localeService.subscribe(callback)
    return () => {}
  }, [localeService])
  const readLocaleRevision = React.useCallback(() => {
    if (!localeService) return 0
    try {
      const snapshot = typeof localeService.getSnapshot === 'function'
        ? localeService.getSnapshot()
        : localeService.getLocale()
      return snapshot && typeof snapshot.revision === 'number' ? snapshot.revision : 0
    } catch {
      return 0
    }
  }, [localeService])
  React.useSyncExternalStore(subscribeLocale, readLocaleRevision, () => 0)
  const localeId = typeof props.getLocaleId === 'function'
    ? props.getLocaleId()
    : (props.localeId || 'en')
  const sessionId = props.sessionId || ''
  /** The saved filter applies whenever its workspace is available. */
  const [mode, setMode] = React.useState(() => readScopeMode())
  React.useEffect(() => {
    const onStorage = event => {
      if (event && event.key === SCOPE_MODE_KEY) setMode(readScopeMode())
    }
    const onStoreChange = () => {
      const current = storageMode()
      if (current === 'host' || current === 'error') setMode(readScopeMode())
    }
    TODO_LISTENERS.add(onStoreChange)
    window.addEventListener('storage', onStorage)
    return () => {
      TODO_LISTENERS.delete(onStoreChange)
      window.removeEventListener('storage', onStorage)
    }
  }, [])
  const workspace = workspaceForSession(sessionId)
  const catalogReady = workspaceCatalogReady()
  const workspaceId = workspace?.workspaceId ?? (catalogReady ? UNASSIGNED_WORKSPACE : null)
  const workspaceFilter = mode === 'workspace' ? workspace?.workspaceId ?? null : null
  const effectiveMode = workspaceFilter ? 'workspace' : 'global'
  const nameOfWorkspace = (id: string) => id === UNASSIGNED_WORKSPACE
    ? say('scope.unassigned')
    : workspaceById(id)?.title || id
  const draftKey = draftKeyForSession(sessionId)
  const report = typeof props.onToast === 'function' ? props.onToast : () => {}
  const { allItems, syncError, commit } = useMemoStore(workspaceFilter)
  const workspaceItems = React.useMemo(() => workspace
    ? allItems.filter(item => item.workspaceId === workspace.workspaceId)
    : [], [allItems, workspace])
  const items = React.useMemo(() => workspaceFilter
    ? workspaceItems.map(item => ({ ...item, id: item.noteId }))
    : allItems, [allItems, workspaceFilter, workspaceItems])
  const storeMode = React.useSyncExternalStore(subscribeStorageStatus, storageMode, storageMode)
  const countsAvailable = storeMode === 'host' || storeMode === 'local'
  const globalOpenCount = countsAvailable ? allItems.filter(item => !item.done).length : null
  const workspaceOpenCount = countsAvailable && workspace ? workspaceItems.filter(item => !item.done).length : null
  const countStatus = storeMode === 'error' ? say('storage.hostError') : say('storage.loading')
  const failure = React.useSyncExternalStore(subscribeStorageStatus, storageFailure, storageFailure)
  const connectionError = storeMode === 'error' || (storeMode === 'host' && isHostConnectionFailure(failure))
  const storageInUse = connectionError && failure?.code === 'STORE_IN_USE'
  const [retrying, setRetrying] = React.useState(false)
  const { sectionsRef, showOpen, showDone, toggleOpen, toggleDone, applySections } = useSections()
  // Version check, release notes and the in-app update share one hook; the
  // registry answer is cached for an hour across panel opens.
  const update = useUpdateCenter(localeId)
  const inserting = React.useRef(new Set<string>())
  const canUpload = storeMode === 'host'
  const composerRef = React.useRef<MemoComposerHandle>(null)
  const { archive, move, takeBack } = useNoteActions({ commit, report })
  const panelRef = React.useRef(null)
  const {
    style,
    commitPanelWidth,
    commitPanelHeight,
    startPanelResize,
    startPanelHeightResize,
    onPanelResizeKeyDown,
    onPanelHeightKeyDown,
  } = usePanelGeometry(props.anchorRef, props.placement, panelRef)

  const openItems = items.filter(item => !item.done)
  const doneItems = items.filter(item => item.done).sort(compareDoneItems)
  const openCount = openItems.length
  const total = items.length
  const { listRef, listHasMore, syncListEdge } = useListEdge({ items, showOpen, showDone })
  const openById = new Map(openItems.map(item => [item.id, item]))
  const reorder = useRowReorder({
    ids: openItems.map(item => item.id),
    groupFor: id => openById.get(id)?.workspaceId,
    scrollRef: listRef,
    onMove: (id, index) => {
      const item = openById.get(id)
      if (!item) return Promise.resolve(false)
      const first = openItems.findIndex(candidate => candidate.workspaceId === item.workspaceId)
      return move(item, index - first)
    },
  })
  useOutsideDismiss(panelRef, props.anchorRef, props.onClose)

  const clearDone = async () => {
    const idsByWorkspace = new Map<string, Set<string>>()
    for (const item of doneItems) {
      const ids = idsByWorkspace.get(item.workspaceId)
      if (ids) ids.add(item.noteId)
      else idsByWorkspace.set(item.workspaceId, new Set([item.noteId]))
    }
    let clearedAny = false
    for (const [owner, ids] of idsByWorkspace) {
      const ok = await commit(owner, current => current.filter(item => !item.done || !ids.has(item.id)))
      if (!ok) {
        report(clearedAny ? 'clearPartial' : 'saveFailed')
        return
      }
      clearedAny = true
    }
    report('cleared')
    applySections({ open: sectionsRef.current.open, done: false })
  }
  const { confirmClear, askClearConfirm, dismissClearConfirm, confirmClearDone } = useClearConfirm({
    scope: workspaceFilter,
    showDone,
    doneCount: doneItems.length,
    onConfirm: clearDone,
  })

  const chooseScope = (next: ScopeMode) => {
    if (next === effectiveMode) return
    writeScopeMode(next)
    setMode(next)
    dismissClearConfirm()
    notifyTodoChange()
  }

  /**
   * Inserting a note into the conversation archives it: its text goes into the
   * conversation composer and the row moves to the archive in the same step.
   * When no composer is on screen nothing changes, so the note stays open.
   */
  const insertItem = async item => {
    if (inserting.current.has(item.id)) return
    const mode = storageMode()
    if (mode === 'probing' || mode === 'error') {
      report('saveFailed')
      return
    }
    // Attachment-only notes use the archive action after a manual hand-off.
    const hasText = Boolean(item.text)
    if (hasText && !appendToConversation(item.text)) {
      report('insertFailed')
      return
    }
    inserting.current.add(item.id)
    try {
      const ok = await archive(item)
      if (ok && hasText && item.attachments?.length) report('attachmentTextInserted')
      else report(hasText ? (ok ? 'inserted' : 'archiveFailed') : (ok ? 'archived' : 'saveFailed'))
    } finally {
      inserting.current.delete(item.id)
    }
  }

  /**
   * 退回 moves the note's text into the top composer and removes the row.
   * The composer is the only text editor, so recalling over an existing draft
   * would silently destroy it; ask the user to send or clear it first instead.
   */
  const recallItem = item => {
    if (!inserting.current.has(item.id)) void composerRef.current?.recall(item, takeBack)
  }

  const row = item => {
    const owner: string = item.workspaceId
    const showWorkspace = effectiveMode === 'global'
    const canOpenWorkspace = showWorkspace && owner !== UNASSIGNED_WORKSPACE
      && workspaceById(owner) !== undefined && props.onOpenWorkspace
    return h(TodoRow, {
      key: item.id,
      item,
      archived: item.done === true,
      workspaceName: showWorkspace ? nameOfWorkspace(owner) : undefined,
      isCurrentWorkspace: workspace?.workspaceId === owner,
      onOpenWorkspace: canOpenWorkspace ? () => props.onOpenWorkspace(owner) : undefined,
      say,
      localeId,
      onToast: report,
      onInsert: insertItem,
      onRecall: recallItem,
      dragProps: item.done ? undefined : reorder.dragProps(item.id),
      onReorderKey: item.done ? undefined : reorder.reorderKey(item.id),
    })
  }

  const content = h(
    'div',
    {
      ref: panelRef,
      className: props.placement === 'right' ? 'dsh-an-popover dsh-an-popoverRight' : 'dsh-an-popover',
      style,
      role: 'dialog',
      'aria-label': say('popover.title'),
    },
    props.placement === 'right'
      ? h('div', {
          className: 'dsh-an-resizeHandle',
          role: 'separator',
          'aria-orientation': 'vertical',
          'aria-label': say('resize.width'),
          tabIndex: 0,
          title: say('resize.hint'),
          onPointerDown: startPanelResize,
          onDoubleClick: () => commitPanelWidth(PANEL_DEFAULT_WIDTH),
          onKeyDown: onPanelResizeKeyDown,
        })
      : null,
    props.placement === 'right'
      ? h('div', {
          className: 'dsh-an-resizeHandleBottom',
          role: 'separator',
          'aria-orientation': 'horizontal',
          'aria-label': say('resize.height'),
          tabIndex: 0,
          title: say('resize.hint'),
          onPointerDown: startPanelHeightResize,
          onDoubleClick: () => commitPanelHeight(0),
          onKeyDown: onPanelHeightKeyDown,
        })
      : null,
    h(PanelHead, {
      say,
      globalOpenCount,
      workspaceOpenCount,
      workspaceName: workspace ? workspace.title || say('scope.workspace') : null,
      workspacePending: !workspace && !catalogReady,
      countStatus,
      onClose: props.onClose,
      scopeMode: effectiveMode,
      onScopeChange: chooseScope,
    }),
    connectionError && h('div', { className: 'dsh-an-storageStatus' },
      h('div', { role: 'status' },
        h('p', null, say(storageInUse ? 'storage.inUse' : 'storage.hostError')),
        failure && h('p', { className: 'dsh-an-storageFailure' }, say('storage.failure', { code: failure.code })),
      ),
      h('button', {
        type: 'button',
        className: 'dsh-an-mini dsh-an-reconnect',
        'aria-disabled': retrying,
        'aria-busy': retrying,
        onClick: async (event: React.MouseEvent<HTMLButtonElement>) => {
          if (retrying) return
          const button = event.currentTarget
          const hadFocus = document.activeElement === button
          setRetrying(true)
          try {
            const restored = await retryStorage() === 'host'
            if (restored && hadFocus && (document.activeElement === button || document.activeElement === document.body)) {
              composerRef.current?.focus()
            }
          } finally {
            setRetrying(false)
          }
        },
      }, say(retrying ? 'storage.reconnecting' : 'storage.retry')),
    ),
    h(MemoComposer, {
      key: draftKey,
      composerRef,
      nameOfWorkspace,
      showDestination: effectiveMode === 'global',
      say,
      draftKey,
      workspaceId,
      commit,
      report,
      storageInUse,
      canUpload,
      focusOnMount: props.focusComposerOnMount,
    }),
    storeMode === 'probing' && h('p', { className: 'dsh-an-listStatus', role: 'status' }, countStatus),
    storeMode !== 'probing' && h(NoteList, {
      say,
      listRef,
      listHasMore,
      syncListEdge,
      showOpen,
      toggleOpen,
      openItems,
      openListRef: reorder.listRef,
      hideEmptyState: storageInUse,
      openCount,
      total,
      row,
      showDone,
      toggleDone,
      doneItems,
      clearConfirmText: say(workspaceFilter ? 'popover.clearConfirm' : 'popover.clearGlobalConfirm', { n: doneItems.length }),
      confirmClear,
      askClearConfirm,
      dismissClearConfirm,
      confirmClearDone,
    }),
    h(PanelFooter, { say, mode: connectionError ? 'error' : storeMode, syncError, update, onToast: report }),
  )

  return content
}
