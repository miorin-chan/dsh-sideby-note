/**
 * The floating notes panel.
 *
 * State, handlers and effects for the list in view; the markup lives in the
 * sibling components, the geometry in usePanelGeometry and the store in
 * useSessionMemoStore.
 */
import React from 'react'
import ReactDOM from 'react-dom'
import { PANEL_DEFAULT_WIDTH, SCOPE_MODE_KEY } from '../constants'
import { canUseSessionScope, draftKeyForSession, scopeForSession, scopeVersion, subscribeScope, workspaceScopeForSession } from '../scope'
import { TODO_LISTENERS, notifyTodoChange } from '../storage/events'
import { readScopeMode, writeScopeMode } from '../storage/prefs'
import { ensureWorkspaceRecord } from '../storage/workspace'
import { storageFailure, storageMode } from '../storage/state'
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
import { SettingsPanel } from './SettingsPanel'
import { ComposerForm } from './ComposerForm'
import { NoteList } from './NoteList'

const h = React.createElement

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
  /** The header switch remembers its choice; a workspace-less session stays session-scoped. */
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
  // Readiness lives in the module binding, not in React state: the header
  // entry and the panel must agree without a parent component between them.
  React.useSyncExternalStore(subscribeScope, scopeVersion, scopeVersion)
  const canUseWorkspace = Boolean(workspaceScopeForSession(sessionId))
  const canUseSession = canUseSessionScope(sessionId)
  // A blank new session keeps the workspace list even when the stored mode is
  // `session`; once its first turn lands, the stored mode applies again.
  const effectiveMode = canUseSession ? mode : 'workspace'
  const scope = scopeForSession(sessionId, effectiveMode)
  // Drafts follow the workspace, not the tab; the writer below still follows `scope`.
  const draftKey = draftKeyForSession(sessionId)
  /** Settled outcomes go to the frame-wide toast host, not to inline marks. */
  const report = typeof props.onToast === 'function' ? props.onToast : () => {}
  const { record, syncError, commit } = useMemoStore(scope)
  const storageInUse = storageMode() === 'error' && storageFailure()?.code === 'STORE_IN_USE'
  const { sectionsRef, showOpen, showDone, toggleOpen, toggleDone, applySections } = useSections()
  const [showSettings, setShowSettings] = React.useState(false)
  // Version check, release notes and the in-app update share one hook; the
  // registry answer is cached for an hour across panel opens.
  const update = useUpdateCenter(localeId)
  const newerVersion = update.latestVersion
  const inserting = React.useRef(new Set<string>())
  const canUpload = storageMode() === 'host'
  const { draft, isSubmitting, isRecalling, isUploading, addRef, composingRef, add, recall, addFiles, removeAttachment, onDraftChange, onDraftKeyDown } = useComposerDraft({
    draftKey,
    commit,
    report,
    storageInUse,
    canUpload,
  })
  const { archive, move, takeBack } = useNoteActions({ commit, report })
  const { confirmClear, askClearConfirm, dismissClearConfirm, confirmClearDone } = useClearConfirm({
    sessionId,
    showDone,
    doneCount: record.items.filter(item => item.done).length,
    onConfirm: () => clearDone(),
  })
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

  const items = record.items || []
  const openItems = items.filter(item => !item.done)
  const doneItems = items.filter(item => item.done).sort(compareDoneItems)
  const openCount = openItems.length
  const total = items.length
  const { listRef, listHasMore, syncListEdge } = useListEdge({ items, showOpen, showDone })
  const reorder = useRowReorder({ ids: openItems.map(item => item.id), scrollRef: listRef, onMove: move })
  useOutsideDismiss(panelRef, props.anchorRef, props.onClose)

  const chooseScope = next => {
    if (next === mode) return
    if (next === 'session' && !canUseSession) return
    if (next === 'workspace' && !canUseWorkspace) return
    // The workspace may not have been seeded yet if the panel opened while the
    // session list was selected; fold member notes in before reading it.
    if (next === 'workspace') {
      const workspace = scopeForSession(sessionId, 'workspace')
      if (workspace.kind === 'workspace') void ensureWorkspaceRecord(workspace.id, workspace.sessionIds)
    }
    // Leaving a list discards a pending clear confirmation; the composer
    // draft belongs to the workspace, so it survives the switch.
    writeScopeMode(next)
    setMode(next)
    dismissClearConfirm()
    notifyTodoChange()
  }

  const clearDone = async () => {
    const ok = await commit(currentItems => currentItems.filter(item => !item.done))
    if (!ok) {
      report('saveFailed')
      return
    }
    report('cleared')
    applySections({ open: sectionsRef.current.open, done: false })
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
    if (!inserting.current.has(item.id)) void recall(item, takeBack)
  }

  const row = item => h(TodoRow, {
    key: item.id,
    item,
    archived: item.done === true,
    say,
    localeId,
    onToast: report,
    onInsert: insertItem,
    onRecall: recallItem,
    // Archived notes sort by archive time, so only open rows carry a grip.
    grip: item.done ? null : reorder.gripProps(item.id),
  })

  const content = h(
    'div',
    {
      ref: panelRef,
      className: props.placement === 'right' ? 'dsh-an-popover dsh-an-popoverRight' : 'dsh-an-popover',
      style,
      'data-settings': showSettings ? 'true' : undefined,
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
      openCount,
      total,
      showSettings,
      onToggleSettings: () => setShowSettings(value => !value),
      onClose: props.onClose,
      newerVersion,
      scopeMode: effectiveMode,
      canUseWorkspace,
      canUseSession,
      onScopeChange: chooseScope,
    }),
    showSettings
      // The card scrolls on its own rail when the panel is shorter than the
      // settings, so nothing falls below the popover's clipped bottom edge.
      ? h(
          'div',
          { className: 'dsh-an-settingsViewport' },
          h(SettingsPanel, {
            say,
            update,
            onToast: report,
          }),
        )
      : null,
    h(ComposerForm, {
      say,
      draft: draft.add,
      attachments: draft.attachments,
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
        if (composingRef.current) return
        add()
      },
    }),
    h(NoteList, {
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
      confirmClear,
      askClearConfirm,
      dismissClearConfirm,
      confirmClearDone,
    }),
    h(
      'div',
      { className: 'dsh-an-popFoot', role: 'status' },
      h('span', { className: syncError || storageMode() === 'error' ? 'dsh-an-error' : undefined }, say(storageMode() === 'error'
        ? (storageInUse ? 'storage.inUse' : 'storage.hostError')
        : syncError
          ? 'storage.failed'
          : storageMode() === 'host'
            ? 'storage.whereHost'
            : storageMode() === 'probing'
              ? 'storage.loading'
              : 'popover.local')),
    ),
  )

  return ReactDOM.createPortal(content, document.body)
}
