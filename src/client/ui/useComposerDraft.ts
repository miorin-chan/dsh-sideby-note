/** The add box: draft persistence, auto-grow and the composer key gestures. */
import React from 'react'
import { MAX_TEXT } from '../constants'
import { clearAddDraft, readScopeDrafts, saveAddDraft } from '../storage/drafts'
import { uid } from '../domain/id'

export function useComposerDraft({ draftKey, commit, report, storageInUse }) {
  const key = draftKey ? String(draftKey) : ''
  const [draft, setDraft] = React.useState(() => readScopeDrafts(key).add)
  const draftRef = React.useRef({ value: draft })
  const pendingAction = React.useRef(false)
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
  }, [draft])

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

  const updateDraft = value => {
    draftRef.current = { value }
    setDraft(value)
    saveAddDraft(key, value)
  }

  const add = async () => {
    const submitted = draftRef.current
    const text = submitted.value.trim().slice(0, MAX_TEXT)
    if (!text || pendingAction.current || storageInUse) return
    pendingAction.current = true
    setIsSubmitting(true)
    try {
      const now = Date.now()
      const ok = await commit(currentItems => [{ id: uid(), text, done: false, createdAt: now, updatedAt: now }, ...currentItems])
      if (!ok) {
        report('saveFailed')
        return
      }
      if (draftRef.current === submitted) {
        draftRef.current = { value: '' }
        setDraft('')
        if (readScopeDrafts(key).add === submitted.value.slice(0, MAX_TEXT)) clearAddDraft(key)
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
    if (pendingAction.current || draftRef.current.value.trim() || readScopeDrafts(key).add.trim()) {
      report('recallBlocked')
      return
    }
    pendingAction.current = true
    setIsRecalling(true)
    try {
      if (!(await takeBack(item))) return
      updateDraft(String(item.text || '').slice(0, MAX_TEXT))
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
    updateDraft(event.target.value)
    resizeAdd(event.target)
  }

  /**
   * Match the main composer: Enter adds the note, Shift+Enter keeps the
   * textarea's native line break, and Enter that belongs to an IME candidate
   * pick is left to the browser. A held Enter must not add note after note.
   */
  const onDraftKeyDown = event => {
    const composing = event.isComposing || (event.nativeEvent && event.nativeEvent.isComposing)
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

  return { draft, isSubmitting, isRecalling, addRef, composingRef, add, recall, onDraftChange, onDraftKeyDown }
}
