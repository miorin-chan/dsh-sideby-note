/** The add box: draft persistence, auto-grow and the composer key gestures. */
import React from 'react'
import { MAX_TEXT } from '../constants'
import { clearAddDraft, notifyDraftAttachments, readScopeDrafts, saveAddDraft, subscribeDraftAttachments } from '../storage/drafts'
import { uid } from '../domain/id'
import { MAX_ATTACHMENTS, MAX_ATTACHMENT_BYTES, uploadAttachment, type NoteAttachment } from '../domain/attachments'

const uploadsByDraft = new Set<string>()
// A write can outlive the composer when the panel follows a workspace jump.
const actionsByDraft = new Map<string, 'submit' | 'recall'>()
const sameAttachments = (a: NoteAttachment[], b: NoteAttachment[]) => JSON.stringify(a) === JSON.stringify(b)

export function useComposerDraft({ draftKey, workspaceId, commit, report, storageInUse, canUpload, focusOnMount }) {
  const key = draftKey ? String(draftKey) : ''
  const [draft, setDraft] = React.useState(() => readScopeDrafts(key))
  const draftRef = React.useRef(draft)
  const [isUploading, setIsUploading] = React.useState(() => uploadsByDraft.has(key))
  const inheritedAction = React.useRef(actionsByDraft.get(key))
  const [action, setAction] = React.useState(inheritedAction.current)
  React.useLayoutEffect(() => {
    const syncDraft = (changedKey: string) => {
      if (changedKey && changedKey !== key) return
      setIsUploading(uploadsByDraft.has(key))
      const pending = actionsByDraft.get(key)
      setAction(pending)
      if (pending) return
      const saved = readScopeDrafts(key)
      const next = inheritedAction.current ? saved : { ...saved, add: draftRef.current.add }
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
  const addRef = React.useRef(null)
  const composingRef = React.useRef(false)

  const resizeAdd = node => {
    if (!node) return
    node.style.height = 'auto'
    node.style.height = `${node.scrollHeight + 2}px`
  }

  React.useEffect(() => {
    resizeAdd(addRef.current)
  }, [draft.add])

  // Opening the panel focuses the composer on pointer devices only: on touch
  // the same focus raises the software keyboard before the user asked for it.
  const hasFinePointer = () => (
    typeof window.matchMedia !== 'function' || window.matchMedia('(hover: hover) and (pointer: fine)').matches
  )

  React.useLayoutEffect(() => {
    const node = addRef.current
    if (!node || !focusOnMount || !hasFinePointer()) return
    node.focus()
    const end = node.value.length
    try {
      node.setSelectionRange(end, end)
    } catch {
      /* selection APIs are best effort */
    }
  }, [])

  const hasContent = (value: typeof draft) => Boolean(value.add.trim() || value.attachments.length)
  const showDraft = (next: typeof draft) => {
    draftRef.current = next
    setDraft(next)
  }
  const addFiles = async (files: readonly File[]) => {
    if (!files.length || !canUpload || actionsByDraft.has(key) || uploadsByDraft.has(key)) return
    if (files.length + readScopeDrafts(key).attachments.length > MAX_ATTACHMENTS
      || files.some(file => file.size < 1 || file.size > MAX_ATTACHMENT_BYTES)) {
      report('attachmentLimit')
      return
    }
    uploadsByDraft.add(key)
    notifyDraftAttachments(key)
    try {
      const attachments: NoteAttachment[] = []
      for (const file of files) attachments.push(await uploadAttachment(file, AbortSignal.timeout(120_000)))
      const latest = readScopeDrafts(key)
      const next = [...latest.attachments, ...attachments]
      if (next.length > MAX_ATTACHMENTS) report('attachmentLimit')
      else if (!saveAddDraft(key, latest.add, next)) report('saveFailed')
    } catch {
      report('attachmentUploadFailed')
    } finally {
      uploadsByDraft.delete(key)
      notifyDraftAttachments(key)
    }
  }

  const removeAttachment = (index: number) => {
    if (actionsByDraft.has(key) || uploadsByDraft.has(key)) return
    const latest = readScopeDrafts(key)
    if (!sameAttachments(latest.attachments, draftRef.current.attachments)) {
      notifyDraftAttachments(key)
      report('attachmentDraftChanged')
      return
    }
    const remaining = latest.attachments.filter((_, position) => position !== index)
    if (!saveAddDraft(key, latest.add, remaining, latest.add.trim() || remaining.length ? latest.workspaceId : null)) report('saveFailed')
  }

  const add = async () => {
    const submitted = draftRef.current
    const text = submitted.add.trim().slice(0, MAX_TEXT)
    const { attachments } = submitted
    if ((!submitted.workspaceId && !workspaceId) || !hasContent(submitted) || actionsByDraft.has(key) || uploadsByDraft.has(key) || storageInUse) return
    const latest = readScopeDrafts(key)
    if (!sameAttachments(attachments, latest.attachments) || submitted.workspaceId !== latest.workspaceId) {
      notifyDraftAttachments(key)
      report('attachmentDraftChanged')
      return
    }
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
      const sameFiles = sameAttachments(saved.attachments, attachments)
      const remaining = sameFiles ? [] : saved.attachments
      if (draftRef.current === submitted) {
        showDraft({ add: '', attachments: remaining, workspaceId: remaining.length ? saved.workspaceId : undefined })
        if (saved.add === submitted.add.slice(0, MAX_TEXT)) {
          if (sameFiles) clearAddDraft(key)
          else saveAddDraft(key, '', undefined, remaining.length ? saved.workspaceId : null)
        }
      } else if (sameFiles && saved.workspaceId === submitted.workspaceId) {
        showDraft({ ...draftRef.current, attachments: remaining, workspaceId: undefined })
        saveAddDraft(key, saved.add, [], null)
      }
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
    if (actionsByDraft.has(key) || uploadsByDraft.has(key) || hasContent(draftRef.current) || hasContent(readScopeDrafts(key))) {
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
      // Touch keeps its soft keyboard closed until the field itself is tapped.
      if (hasFinePointer()) {
        node.focus()
        const end = node.value.length
        try {
          node.setSelectionRange(end, end)
        } catch {
          /* selection APIs are best effort */
        }
      }
      resizeAdd(node)
    })
  }

  const onDraftChange = event => {
    if (draftLocked) return
    const value = event.target.value
    const owner = value.trim() || draftRef.current.attachments.length ? draftRef.current.workspaceId : undefined
    const next = { ...draftRef.current, add: value, workspaceId: owner }
    showDraft(next)
    saveAddDraft(key, next.add, undefined, owner ?? null)
    resizeAdd(event.target)
  }

  /**
   * Match the main composer: Enter adds the note, Shift+Enter keeps the
   * textarea's native line break, and Enter that belongs to an IME candidate
   * pick is left to the browser. A held Enter must not add note after note.
   */
  const onDraftKeyDown = event => {
    const composing = composingRef.current || event.nativeEvent.isComposing || event.nativeEvent.keyCode === 229
    if (event.key === 'Escape') {
      event.currentTarget.blur()
      return
    }
    if (event.key !== 'Enter') return
    if (composing) return
    if (event.shiftKey) return
    if (event.altKey || (typeof event.getModifierState === 'function' && event.getModifierState('AltGraph'))) {
      event.preventDefault()
      return
    }
    event.preventDefault()
    if (event.repeat) return
    add()
  }

  return { draft, draftLocked, isSubmitting, isRecalling, isUploading, addRef, composingRef, add, recall, addFiles, removeAttachment, onDraftChange, onDraftKeyDown }
}
