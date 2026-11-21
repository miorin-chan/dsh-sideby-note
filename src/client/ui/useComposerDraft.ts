/** The add box: draft persistence, auto-grow and the composer key gestures. */
import React from 'react'
import { MAX_TEXT } from '../constants'
import { clearAddDraft, notifyDraftAttachments, readScopeDrafts, saveAddDraft, subscribeDraftAttachments } from '../storage/drafts'
import { uid } from '../domain/id'
import { MAX_ATTACHMENTS, MAX_ATTACHMENT_BYTES, uploadAttachment, type NoteAttachment } from '../domain/attachments'

const uploadsByDraft = new Set<string>()
const sameAttachments = (a: NoteAttachment[], b: NoteAttachment[]) => JSON.stringify(a) === JSON.stringify(b)

export function useComposerDraft({ draftKey, commit, report, storageInUse, canUpload }) {
  const key = draftKey ? String(draftKey) : ''
  const [draft, setDraft] = React.useState(() => readScopeDrafts(key))
  const draftRef = React.useRef(draft)
  const [isUploading, setIsUploading] = React.useState(() => uploadsByDraft.has(key))
  const pendingAction = React.useRef(false)
  React.useEffect(() => subscribeDraftAttachments(changedKey => {
    if (changedKey && changedKey !== key) return
    setIsUploading(uploadsByDraft.has(key))
    if (pendingAction.current) return
    const saved = readScopeDrafts(key)
    if (sameAttachments(saved.attachments, draftRef.current.attachments)) return
    const next = { ...draftRef.current, attachments: saved.attachments }
    draftRef.current = next
    setDraft(next)
  }), [key])
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [isRecalling, setIsRecalling] = React.useState(false)
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
    if (!node) return
    if (!hasFinePointer()) return
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
    if (!files.length || !canUpload || pendingAction.current || uploadsByDraft.has(key)) return
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
    if (pendingAction.current || uploadsByDraft.has(key)) return
    const latest = readScopeDrafts(key)
    if (!sameAttachments(latest.attachments, draftRef.current.attachments)) {
      notifyDraftAttachments(key)
      report('attachmentDraftChanged')
      return
    }
    if (!saveAddDraft(key, latest.add, latest.attachments.filter((_, position) => position !== index))) report('saveFailed')
  }

  const add = async () => {
    const submitted = draftRef.current
    const text = submitted.add.trim().slice(0, MAX_TEXT)
    const { attachments } = submitted
    if (!hasContent(submitted) || pendingAction.current || uploadsByDraft.has(key) || storageInUse) return
    if (!sameAttachments(attachments, readScopeDrafts(key).attachments)) {
      notifyDraftAttachments(key)
      report('attachmentDraftChanged')
      return
    }
    if (attachments.length && !canUpload) {
      report('attachmentUploadFailed')
      return
    }
    pendingAction.current = true
    setIsSubmitting(true)
    try {
      const now = Date.now()
      const item = { id: uid(), text, ...(attachments.length ? { attachments } : {}), done: false, createdAt: now, updatedAt: now }
      const ok = await commit(currentItems => [item, ...currentItems])
      if (!ok) {
        report('saveFailed')
        return
      }
      const saved = readScopeDrafts(key)
      const sameFiles = sameAttachments(saved.attachments, attachments)
      const remaining = sameFiles ? [] : saved.attachments
      if (draftRef.current === submitted) {
        showDraft({ add: '', attachments: remaining })
        if (saved.add === submitted.add.slice(0, MAX_TEXT)) {
          if (sameFiles) clearAddDraft(key)
          else saveAddDraft(key, '')
        }
      } else if (attachments.length) {
        showDraft({ ...draftRef.current, attachments: remaining })
        if (sameFiles) saveAddDraft(key, saved.add, [])
      }
    } finally {
      pendingAction.current = false
      setIsSubmitting(false)
    }
  }

  /**
   * Replace the composer with a recalled note and put the caret at its end.
   *
   * This is the only text editor for a note: the row leaves the list and its
   * text lands here, where the user can change it and submit it again.
   */
  const recall = async (item, takeBack) => {
    if (pendingAction.current || uploadsByDraft.has(key) || hasContent(draftRef.current) || hasContent(readScopeDrafts(key))) {
      report('recallBlocked')
      return
    }
    pendingAction.current = true
    setIsRecalling(true)
    try {
      const before = readScopeDrafts(key)
      const next = { add: String(item.text || '').slice(0, MAX_TEXT), attachments: item.attachments ?? [] }
      if (next.attachments.length && !saveAddDraft(key, next.add, next.attachments)) {
        report('saveFailed')
        return
      }
      if (!(await takeBack(item))) {
        if (next.attachments.length && JSON.stringify(readScopeDrafts(key)) === JSON.stringify(next)) {
          saveAddDraft(key, before.add, before.attachments)
        }
        return
      }
      if (!next.attachments.length) saveAddDraft(key, next.add)
      showDraft(next)
      report('recalled')
    } finally {
      pendingAction.current = false
      setIsRecalling(false)
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
    if (isRecalling) return
    const next = { ...draftRef.current, add: event.target.value }
    showDraft(next)
    saveAddDraft(key, next.add)
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

  return { draft, isSubmitting, isRecalling, isUploading, addRef, composingRef, add, recall, addFiles, removeAttachment, onDraftChange, onDraftKeyDown }
}
