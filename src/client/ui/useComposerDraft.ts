/** The add box: draft persistence, auto-grow and the composer key gestures. */
import React from 'react'
import { MAX_TEXT } from '../constants'
import { notifyDraftAttachments, readScopeDrafts, saveAddDraft, subscribeDraftAttachments } from '../storage/drafts'
import { uid } from '../domain/id'
import { PRIMITIVES } from './primitives'
import {
  acceptDraftUploadText, addDraftUploads, attachedItems, hasDraftUploads, readDraftUploadView,
  removeDraftAttachment, removeDraftUpload, retryDraftUpload, sameAttachments,
} from '../storage/draftUploads'

// A write can outlive the composer when the panel follows a workspace jump.
const actionsByDraft = new Map<string, 'submit' | 'recall'>()
type DraftCleanup = { saved: ReturnType<typeof readScopeDrafts>; remainingText: string }
const pendingCleanup = new Map<string, DraftCleanup>()
const selectionsByDraft = new Map<string, { text: string; from: number; to: number; direction: 'forward' | 'backward' | 'none' }>()

const focusOnDesktop = (node: HTMLTextAreaElement) => {
  if (PRIMITIVES.isMobileDevice?.()) return false
  if (typeof window.matchMedia === 'function' && !window.matchMedia('(hover: hover) and (pointer: fine)').matches) return false
  node.focus({ preventScroll: true })
  return true
}

export function useComposerDraft({ draftKey, workspaceId, commit, report, storageInUse, canUpload, focusOnMount }) {
  const key = draftKey ? String(draftKey) : ''
  const [draft, setDraft] = React.useState(() => readScopeDrafts(key))
  const draftRef = React.useRef(draft)
  const [uploadView, setUploadView] = React.useState(() => readDraftUploadView(key, draft))
  const inheritedAction = React.useRef(actionsByDraft.get(key))
  const [action, setAction] = React.useState(inheritedAction.current)
  React.useLayoutEffect(() => {
    const syncDraft = (changedKey: string) => {
      if (changedKey && changedKey !== key) return
      const pending = actionsByDraft.get(key)
      setAction(pending)
      if (pending) return
      const saved = readScopeDrafts(key)
      const uploads = readDraftUploadView(key, saved)
      setUploadView(uploads)
      const next = inheritedAction.current ? saved : {
        ...saved, add: draftRef.current.add, workspaceId: saved.workspaceId ?? uploads?.workspaceId,
      }
      inheritedAction.current = undefined
      const current = draftRef.current
      if (next.add === current.add && next.workspaceId === current.workspaceId && sameAttachments(next.attachments, current.attachments)) return
      draftRef.current = next
      setDraft(next)
    }
    const unsubscribe = subscribeDraftAttachments(syncDraft)
    syncDraft(key)
    return unsubscribe
  }, [key])
  const isSubmitting = action === 'submit'
  const isRecalling = action === 'recall'
  const draftLocked = isRecalling || Boolean(inheritedAction.current)
  const finishAction = () => {
    actionsByDraft.delete(key)
    notifyDraftAttachments(key)
  }
  const addRef = React.useRef<HTMLTextAreaElement>(null)
  const composingRef = React.useRef(false)
  // DSH 0.2.2-rc.5, ui-conversation/src/client/input/editor/keymap.ts,
  // registerComposerKeymap (MIT). Safari can deliver the closing key late.
  const composingUntil = React.useRef(0)
  const isComposing = () => composingRef.current || Date.now() < composingUntil.current
  const onCompositionStart = () => { composingRef.current = true }
  const onCompositionEnd = () => { composingRef.current = false; composingUntil.current = Date.now() + 10 }

  const resizeAdd = node => {
    if (!node) return
    node.style.height = 'auto'
    node.style.height = `${node.scrollHeight + 2}px`
  }

  React.useLayoutEffect(() => {
    resizeAdd(addRef.current)
  }, [draft.add])

  React.useLayoutEffect(() => {
    const node = addRef.current
    if (!node) return
    if (focusOnMount && focusOnDesktop(node)) {
      const saved = selectionsByDraft.get(key)
      if (saved?.text === node.value) node.setSelectionRange(saved.from, saved.to, saved.direction)
      else node.setSelectionRange(node.value.length, node.value.length)
    }
    return () => {
      if (!node.value) selectionsByDraft.delete(key)
      else selectionsByDraft.set(key, {
        text: node.value, from: node.selectionStart, to: node.selectionEnd, direction: node.selectionDirection,
      })
    }
  }, [key, focusOnMount])

  const hasContent = (value: typeof draft) => Boolean(value.add.trim() || value.attachments.length)
  const showDraft = (next: typeof draft) => {
    draftRef.current = next
    setDraft(next)
  }
  const attachmentItems = uploadView?.items ?? attachedItems(draft.attachments)
  const hasUnresolvedAttachments = uploadView !== undefined
  const addFiles = (files: readonly File[]) => {
    if (!key || !files.length || !canUpload || actionsByDraft.has(key)) return
    if (!addDraftUploads(key, files)) report('attachmentLimit')
  }
  const retryUpload = (id: string) => {
    if (canUpload && !actionsByDraft.has(key)) retryDraftUpload(key, id)
  }
  const removeUpload = (id: string) => {
    if (!actionsByDraft.has(key)) removeDraftUpload(key, id)
  }
  const removeAttachment = (index: number) => {
    if (actionsByDraft.has(key)) return
    const error = removeDraftAttachment(key, index, draft)
    if (error) report(error)
  }

  const clearSavedAttachments = ({ remainingText }: DraftCleanup) => {
    if (saveAddDraft(key, remainingText, [], null)) {
      pendingCleanup.delete(key)
      showDraft({ add: remainingText, attachments: [], workspaceId: undefined })
    } else report('saveFailed')
  }

  const add = async () => {
    const submitted = draftRef.current
    const text = submitted.add.trim().slice(0, MAX_TEXT)
    const { attachments } = submitted
    if ((!submitted.workspaceId && !workspaceId) || !hasContent(submitted) || actionsByDraft.has(key) || hasDraftUploads(key) || storageInUse) return
    const latest = readScopeDrafts(key)
    if (!sameAttachments(attachments, latest.attachments) || submitted.workspaceId !== latest.workspaceId) {
      notifyDraftAttachments(key)
      report('attachmentDraftChanged')
      return
    }
    const cleanup = pendingCleanup.get(key)
    if (cleanup && latest.add === submitted.add.slice(0, MAX_TEXT) && latest.add === cleanup.saved.add
      && latest.workspaceId === cleanup.saved.workspaceId && sameAttachments(latest.attachments, cleanup.saved.attachments)) {
      clearSavedAttachments(cleanup)
      return
    }
    pendingCleanup.delete(key)
    if (attachments.length && !canUpload) {
      report('attachmentUploadFailed')
      return
    }
    actionsByDraft.set(key, 'submit')
    notifyDraftAttachments(key)
    try {
      const now = Date.now()
      const item = { id: uid(), text, ...(attachments.length ? { attachments } : {}), done: false, createdAt: now, updatedAt: now }
      const ok = await commit(submitted.workspaceId ?? workspaceId, currentItems => [item, ...currentItems])
      if (!ok) {
        report('saveFailed')
        return
      }
      const saved = readScopeDrafts(key)
      const current = draftRef.current
      if (!sameAttachments(saved.attachments, attachments) || saved.workspaceId !== submitted.workspaceId
        || saved.add !== current.add.slice(0, MAX_TEXT)) {
        if (current === submitted) showDraft(saved)
        return
      }
      const cleanup = { saved, remainingText: current === submitted ? '' : current.add }
      pendingCleanup.set(key, cleanup)
      clearSavedAttachments(cleanup)
    } finally {
      finishAction()
    }
  }

  /**
   * Replace the composer with a recalled note and put the caret at its end.
   *
   * This is the only text editor for a note: the row leaves the list and its
   * text lands here, where the user can change it and submit it again.
   */
  const recall = async (item, takeBack) => {
    if (actionsByDraft.has(key) || hasDraftUploads(key) || hasContent(draftRef.current) || hasContent(readScopeDrafts(key))) {
      report('recallBlocked')
      return
    }
    actionsByDraft.set(key, 'recall')
    notifyDraftAttachments(key)
    try {
      const before = readScopeDrafts(key)
      const next = {
        add: String(item.text || '').slice(0, MAX_TEXT),
        attachments: item.attachments ?? [],
        workspaceId: item.workspaceId === workspaceId ? undefined : item.workspaceId,
      }
      if (!saveAddDraft(key, next.add, next.attachments, next.workspaceId ?? null)) {
        report('saveFailed')
        return
      }
      if (!(await takeBack(item))) {
        if (JSON.stringify(readScopeDrafts(key)) === JSON.stringify(next)) {
          saveAddDraft(key, before.add, before.attachments, before.workspaceId ?? null)
        }
        return
      }
      showDraft(next)
      report('recalled')
    } finally {
      finishAction()
    }
    window.requestAnimationFrame(() => {
      const node = addRef.current
      if (!node) return
      if (focusOnDesktop(node)) node.setSelectionRange(node.value.length, node.value.length)
      resizeAdd(node)
    })
  }

  const onDraftChange = event => {
    if (draftLocked) return
    const value = event.target.value
    const saved = readScopeDrafts(key)
    const uploads = readDraftUploadView(key, saved)
    const keepOwner = value.trim() || saved.attachments.length
    const owner = keepOwner || uploads ? saved.workspaceId ?? uploads?.workspaceId : undefined
    const storedOwner = keepOwner ? owner : undefined
    const next = { ...saved, add: value, workspaceId: owner }
    showDraft(next)
    if (uploads) setUploadView(uploads)
    if (saveAddDraft(key, value, undefined, storedOwner ?? null) && uploads) {
      acceptDraftUploadText(key, value, storedOwner)
    }
    resizeAdd(event.target)
  }

  /**
   * Match the main composer: Enter adds the note, Shift+Enter keeps the
   * textarea's native line break, and Enter that belongs to an IME candidate
   * pick is left to the browser. A held Enter must not add note after note.
   */
  const onDraftKeyDown: React.KeyboardEventHandler<HTMLTextAreaElement> = event => {
    const composing = isComposing() || event.nativeEvent.isComposing || event.nativeEvent.keyCode === 229
    if (event.key === 'Escape' && composing) event.stopPropagation()
    if (event.key !== 'Enter' || event.defaultPrevented) return
    const accelerated = event.ctrlKey || event.metaKey
    if (event.altKey || event.getModifierState('AltGraph')
      || (event.ctrlKey && event.metaKey) || (accelerated && event.shiftKey)) {
      event.preventDefault()
      return
    }
    if (event.shiftKey || composing) return
    event.preventDefault()
    if (!event.repeat) void add()
  }

  return {
    draft, draftLocked, isSubmitting, isRecalling, hasUnresolvedAttachments, attachmentItems,
    addRef, isComposing, onCompositionStart, onCompositionEnd,
    add, recall, addFiles, removeAttachment, retryUpload, removeUpload, onDraftChange, onDraftKeyDown,
  }
}
