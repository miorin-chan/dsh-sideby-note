/**
 * The floating notes panel.
 *
 * State, handlers and effects for the list in view; the markup lives in the
 * sibling components, the geometry in usePanelGeometry and the store in
 * useSessionMemoStore.
 */
import React from 'react'
import type { RenderFactorySlot } from '@deepseek-ai/dsh-client-ui-slots'
import type { FileDragService } from '@deepseek-ai/dsh-client-ui-file-drag/client'
import { PANEL_DEFAULT_WIDTH, SCOPE_MODE_KEY } from '../constants'
import { draftKeyForSession, UNASSIGNED_WORKSPACE, workspaceCatalogReady, workspaceForSession, workspaceById, type ScopeMode } from '../scope'
import { STORE_READY_LISTENERS, TODO_LISTENERS, notifyTodoChange } from '../storage/events'
import { retryStorage } from '../storage/boot'
import { readScopeMode, writeScopeMode } from '../storage/prefs'
import { hasArchiveRetry, setArchiveRetry } from '../storage/archiveRetries'
import { isHostConnectionFailure, storageFailure, storageMode } from '../storage/state'
import { readWorkspaceRecord } from '../storage/workspace'
import { useMemoStore, type WorkspaceNote } from './useSessionMemoStore'
import { usePanelGeometry } from './usePanelGeometry'

import { useSections } from './useSections'
import { useUpdateCenter } from './useUpdateCenter'
import { useComposerDraft } from './useComposerDraft'
import { useNoteActions } from './useNoteActions'
import { useRowReorder } from './useRowReorder'
import { useClearConfirm } from './useClearConfirm'
import { useListEdge } from './useListEdge'
import { useOutsideDismiss } from './useOutsideDismiss'
import { scrollNoteIntoView } from './position'
import { compareDoneItems } from '../domain/items'
import { appendToConversation, type ComposerInputForSession } from '../domain/forward'

import { TodoRow } from './TodoRow'
import { PanelHead } from './PanelHead'
import { PanelFooter } from './PanelFooter'
import { ComposerForm } from './ComposerForm'
import { NoteList } from './NoteList'

const h = React.createElement
const NOTE_HIGHLIGHT_MS = 2500

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
  say: (key: string, vars?: Record<string, string>) => string
  renderFactorySlot?: RenderFactorySlot
  readFileDrag: FileDragService['read']
  canBindSession: boolean
  sessionTitle: (id: string) => string | undefined
}

function MemoComposer({ composerRef, nameOfWorkspace, say, renderFactorySlot, readFileDrag, canBindSession, sessionTitle, ...options }: MemoComposerProps) {
  const { workspaceId, canUpload, storageInUse, report } = options
  const {
    draft, draftLocked, isSubmitting, isRecalling, hasUnresolvedAttachments, attachmentItems,
    addRef, isComposing, onCompositionStart, onCompositionEnd,
    add, recall, addFiles, removeAttachment, removeUpload, retryUpload, toggleSessionBinding, onDraftChange, onDraftKeyDown,
  } = useComposerDraft(options)
  React.useImperativeHandle(composerRef, (): MemoComposerHandle => ({
    recall,
    focus: () => addRef.current?.focus({ preventScroll: true }),
  }))
  const destination = draft.workspaceId ?? workspaceId
  const workspaceTitle = destination ? workspaceById(destination)?.title : undefined
  const showDestination = !destination || destination !== workspaceId || destination === UNASSIGNED_WORKSPACE
  let destinationHint: string | undefined
  if (!destination) destinationHint = say('scope.loading')
  else if (showDestination || workspaceTitle) {
    destinationHint = say('add.destination', { workspace: workspaceTitle || nameOfWorkspace(destination) })
  }
  return h(ComposerForm, {
    say,
    draft: draft.add,
    placeholder: workspaceTitle
      ? say('add.workspacePlaceholder', { workspace: workspaceTitle })
      : say('add.placeholder'),
    destination: destinationHint ? { text: destinationHint, visible: showDestination } : undefined,
    destinationPending: !destination,
    sessionBinding: canBindSession || draft.linkedSessionId ? {
      linked: Boolean(draft.linkedSessionId),
      title: draft.linkedSessionId ? sessionTitle(draft.linkedSessionId) : undefined,
      onToggle: toggleSessionBinding,
    } : undefined,
    attachments: draft.attachments,
    attachmentItems,
    renderFactorySlot,
    readFileDrag,
    draftLocked,
    isSubmitting,
    isRecalling,
    hasUnresolvedAttachments,
    canUpload,
    storageInUse,
    onFiles: addFiles,
    onRemove: removeAttachment,
    onRemoveUpload: removeUpload,
    onRetryUpload: retryUpload,
    onReadFailed: () => report('attachmentReadFailed'),
    onUnavailable: () => report('attachmentUnavailable'),
    onBusy: () => report('attachmentBusy'),
    inputRef: addRef,
    onDraftChange,
    onCompositionStart,
    onCompositionEnd,
    onKeyDown: onDraftKeyDown,
    onSubmit: event => {
      event.preventDefault()
      if (!isComposing()) void add()
    },
  })
}

const noteKey = (item: WorkspaceNote) => JSON.stringify([item.workspaceId, item.noteId])
const noteContentKey = (item: WorkspaceNote) => JSON.stringify([noteKey(item), item.text, item.attachments ?? []])
type PartialForward = Extract<Awaited<ReturnType<typeof appendToConversation>>, { status: 'partial' }>

// Partial handoffs reference the retained draft instance on this page.
const partialForwards = new Map<string, PartialForward>()

function hasUnresolvedForward(result: PartialForward, current: ReturnType<ComposerInputForSession>): boolean {
  if (!result.state) return result.draftChanged
  if (!current) return true
  const draft = current.state.getSnapshot()
  if (result.draftChanged && draft.draft && draft.draft !== result.draftBefore) return true
  if (result.remainingAttachmentIds.some(id => draft.attachmentIds.includes(id))) return true
  return current.state === result.state && result.attachmentListChanged && draft.attachmentIds.length > 0
    && result.attachmentIdsBefore.some((id, index) => draft.attachmentIds[index] !== id)
}

export type NoteJump = Pick<WorkspaceNote, 'workspaceId' | 'noteId'> & {
  keyboardTrigger?: HTMLButtonElement
  viaSession?: true
}

interface MemoPopoverProps {
  sessionId: string
  noteToReveal?: NoteJump
  getComposerInput: ComposerInputForSession
  renderFactorySlot?: RenderFactorySlot
  readFileDrag: FileDragService['read']
  say: (key: string, vars?: Record<string, string | number>) => string
  locale?: DshLocaleService
  getLocaleId?: () => string
  localeId?: string
  anchorRef: React.RefObject<HTMLButtonElement>
  placement: string
  focusComposerOnMount: boolean
  onClose: (restoreFocus?: boolean) => void
  onOpenWorkspace?: (note: NoteJump) => void
  onOpenSession: (sessionId: string, note: NoteJump) => void
  getActiveSessionId: () => string
  sessionTitle: (id: string) => string | undefined
  onToast?: (kind: string) => void
}

export function MemoPopover(props: MemoPopoverProps) {
  const say = props.say
  const localeService = props.locale
  // Re-render the open panel on language changes independently of the frame seat.
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
      return snapshot && typeof snapshot === 'object' ? snapshot.revision ?? 0 : 0
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
  const [dismissedSessionJump, dismissSessionJump] = React.useState<NoteJump>()
  const jump = props.noteToReveal
  const showLinkedNote = jump?.viaSession && jump !== dismissedSessionJump && jump.workspaceId !== workspace?.workspaceId
  const workspaceFilter = mode === 'workspace' && !showLinkedNote ? workspace?.workspaceId ?? null : null
  const getBindableSessionId = () => sessionId && props.getActiveSessionId() === sessionId ? sessionId : null
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
  const changingBindings = React.useRef(new Set<string>())
  const inserting = React.useRef(new Map<string, AbortController>())
  const [insertingKeys, setInsertingKeys] = React.useState<ReadonlySet<string>>(() => new Set())
  React.useLayoutEffect(() => {
    const operations = inserting.current
    setInsertingKeys(new Set())
    return () => {
      for (const operation of operations.values()) operation.abort()
      operations.clear()
    }
  }, [sessionId])
  const canUpload = storeMode === 'host'
  const composerRef = React.useRef<MemoComposerHandle>(null)
  const { archive, move, takeBack, setSessionBinding } = useNoteActions({ commit, report })
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

  const currentWorkspaceFirst = (notes: WorkspaceNote[]) => {
    if (!workspace || workspaceFilter) return notes
    const id = workspace.workspaceId
    return [
      ...notes.filter(item => item.workspaceId === id),
      ...notes.filter(item => item.workspaceId !== id),
    ]
  }
  const openItems = currentWorkspaceFirst(items.filter(item => !item.done))
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

  const [revealedNote, setRevealedNote] = React.useState<{ note: NoteJump; highlighted: boolean }>()
  const revealRowRef = React.useRef<HTMLLIElement>(null)
  const noteToReveal = props.noteToReveal
  const revealItem = noteToReveal && (noteToReveal.viaSession || workspace?.workspaceId === noteToReveal.workspaceId)
    ? items.find(item => item.workspaceId === noteToReveal.workspaceId && item.noteId === noteToReveal.noteId)
    : undefined
  React.useLayoutEffect(() => {
    if (!noteToReveal || !revealItem || revealedNote?.note === noteToReveal) return
    const section = revealItem.done ? 'done' : 'open'
    if (!sectionsRef.current[section]) {
      applySections({ ...sectionsRef.current, [section]: true })
      return
    }
    const list = listRef.current
    const row = revealRowRef.current
    if (!list || !row) return
    scrollNoteIntoView(list, row)
    const { keyboardTrigger } = noteToReveal
    if (keyboardTrigger && (document.activeElement === keyboardTrigger || document.activeElement === document.body)) {
      row.focus({ preventScroll: true })
    }
    syncListEdge()
    setRevealedNote({ note: noteToReveal, highlighted: true })
  })
  React.useEffect(() => {
    if (!revealedNote?.highlighted) return
    const timer = window.setTimeout(() => {
      setRevealedNote(current => current === revealedNote ? { ...revealedNote, highlighted: false } : current)
    }, NOTE_HIGHLIGHT_MS)
    return () => window.clearTimeout(timer)
  }, [revealedNote])

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
    if (jump?.viaSession) dismissSessionJump(jump)
    writeScopeMode(next)
    setMode(next)
    dismissClearConfirm()
    notifyTodoChange()
  }

  const insertItem = async (item: WorkspaceNote, trigger: HTMLButtonElement) => {
    const key = noteKey(item)
    const contentKey = noteContentKey(item)
    const partialKey = JSON.stringify([contentKey, sessionId])
    if (inserting.current.has(key) || changingBindings.current.has(key)) return
    const mode = storageMode()
    if (mode === 'probing' || mode === 'error') {
      report('saveFailed')
      return
    }
    const bindingIsCurrent = () => {
      if (props.getActiveSessionId() !== sessionId) return false
      const current = readWorkspaceRecord(item.workspaceId).items.find(note => note.id === item.noteId)
      return Boolean(current && current.linkedSessionId === item.linkedSessionId
        && (!current.linkedSessionId || current.linkedSessionId === sessionId))
    }
    if (!bindingIsCurrent()) {
      report('sessionMismatch')
      return
    }
    const retryArchive = hasArchiveRetry(contentKey)
    const previous = partialForwards.get(partialKey)
    if (!retryArchive && previous && hasUnresolvedForward(previous, props.getComposerInput(sessionId))) {
      report('insertPartial')
      return
    }
    partialForwards.delete(partialKey)

    const operation = new AbortController()
    inserting.current.set(key, operation)
    setInsertingKeys(new Set(inserting.current.keys()))
    try {
      if (!retryArchive) {
        const result = await appendToConversation(sessionId, item, props.getComposerInput, operation.signal, bindingIsCurrent)
        if (result.status === 'partial') {
          partialForwards.set(partialKey, result)
          report('insertPartial')
          return
        }
        if (result.status !== 'inserted') {
          if (result.status !== 'cancelled') report(result.status)
          return
        }
        setArchiveRetry(contentKey, true)
      }
      const restoreFocus = document.activeElement === trigger
      const ok = await archive(item).catch(() => false)
      if (ok) {
        setArchiveRetry(contentKey, false)
        if (restoreFocus) requestAnimationFrame(() => {
          if (document.activeElement !== document.body && document.activeElement !== trigger) return
          panelRef.current?.querySelector('.dsh-an-doneToggle')?.focus({ preventScroll: true })
        })
      }
      const success = retryArchive ? 'archiveRetried' : item.attachments?.length ? 'insertedWithAttachments' : 'inserted'
      report(ok ? success : 'archiveFailed')
    } finally {
      operation.abort()
      if (inserting.current.get(key) === operation) {
        inserting.current.delete(key)
        setInsertingKeys(new Set(inserting.current.keys()))
      }
    }
  }

  /**
   * 退回 moves the note's text into the top composer and removes the row.
   * The composer is the only text editor, so recalling over an existing draft
   * would silently destroy it; ask the user to send or clear it first instead.
   */
  const recallItem = (item: WorkspaceNote) => {
    const key = noteKey(item)
    if (!inserting.current.has(key) && !changingBindings.current.has(key)) void composerRef.current?.recall(item, takeBack)
  }

  const toggleRowBinding = async (item: WorkspaceNote) => {
    const key = noteKey(item)
    const pending = changingBindings.current
    if (inserting.current.has(key) || pending.has(key) || !countsAvailable) return
    const next = item.linkedSessionId ? null : getBindableSessionId()
    if (!item.linkedSessionId && !next) return
    pending.add(key)
    try {
      await setSessionBinding(item, next)
    } finally {
      pending.delete(key)
    }
  }

  const row = (item: WorkspaceNote) => {
    const owner: string = item.workspaceId
    const linkedSessionId = item.linkedSessionId
    const currentSession = linkedSessionId === sessionId
    const sessionLink = linkedSessionId ? {
      current: currentSession,
      title: props.sessionTitle(linkedSessionId),
      onOpen: currentSession ? undefined : (event: React.MouseEvent<HTMLButtonElement>) => props.onOpenSession(linkedSessionId, {
        workspaceId: owner, noteId: item.noteId, viaSession: true,
        keyboardTrigger: event.detail === 0 && event.currentTarget === document.activeElement ? event.currentTarget : undefined,
      }),
    } : undefined
    const showWorkspace = effectiveMode === 'global'
    const canOpenWorkspace = showWorkspace && owner !== UNASSIGNED_WORKSPACE
      && workspaceById(owner) !== undefined && props.onOpenWorkspace
    return h(TodoRow, {
      key: item.id,
      item,
      archived: item.done === true,
      insertPending: insertingKeys.has(noteKey(item)),
      retryArchive: hasArchiveRetry(noteContentKey(item)),
      sessionLink,
      onToggleSession: countsAvailable && (linkedSessionId || getBindableSessionId()) ? () => toggleRowBinding(item) : undefined,
      workspaceName: showWorkspace ? nameOfWorkspace(owner) : undefined,
      isCurrentWorkspace: workspace?.workspaceId === owner,
      onOpenWorkspace: canOpenWorkspace
        ? (event: React.MouseEvent<HTMLButtonElement>) => props.onOpenWorkspace({
            workspaceId: owner,
            noteId: item.noteId,
            keyboardTrigger: event.detail === 0 && event.currentTarget === document.activeElement ? event.currentTarget : undefined,
          })
        : undefined,
      rowRef: item === revealItem ? revealRowRef : undefined,
      highlighted: item === revealItem && revealedNote?.note === noteToReveal && revealedNote.highlighted,
      say,
      renderFactorySlot: props.renderFactorySlot,
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
      say,
      draftKey,
      workspaceId,
      canBindSession: Boolean(sessionId),
      sessionTitle: props.sessionTitle,
      getBindableSessionId,
      commit,
      report,
      storageInUse,
      canUpload,
      focusOnMount: props.focusComposerOnMount,
      renderFactorySlot: props.renderFactorySlot,
      readFileDrag: props.readFileDrag,
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
      doneItems: currentWorkspaceFirst(doneItems),
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
