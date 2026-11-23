import type { DraftAttachmentId, InputState, SessionInput } from '@deepseek-ai/dsh-client-ui-conversation/client'
import { readAttachment, type NoteAttachment } from './attachments.ts'

export interface ComposerInputSource {
  state: Pick<SessionInput['state'], 'getSnapshot'>
  removeAttachment?: SessionInput['removeAttachment']
}
export type ComposerInputForSession = (sessionId: string) => ComposerInputSource | undefined

type InsertFailure = 'insertFailed' | 'attachmentInsertFailed' | 'cancelled'
export type ForwardResult =
  | { status: 'inserted' | 'attachmentReadFailed' | InsertFailure }
  | {
    status: 'partial'
    cause: InsertFailure
    draftBefore: string
    draftChanged: boolean
    attachmentIdsBefore: readonly DraftAttachmentId[]
    attachmentListChanged: boolean
    remainingAttachmentIds: readonly DraftAttachmentId[]
    state?: ComposerInputSource['state']
  }

type DraftSnapshot = Pick<InputState, 'draft' | 'attachmentIds'>
  & Partial<Pick<InputState, 'draftRev' | 'occurrences' | 'claim'>>

const SESSION_MARKER = '[data-conversation-session]'
const pendingInsertions = new WeakMap<ComposerInputSource['state'] | HTMLElement, Promise<ForwardResult>>()

// Match the paste projection in DSH 0.2.2-rc.5, ui-conversation/src/client/input/editor/runtime.ts.
const REFERENCE_PLACEHOLDER = /[\uE100-\uE11D\uFFFC]/gu

function frozen(phase: string | null | undefined): boolean {
  return phase === 'adjudicating' || phase === 'submitting' || phase === 'sending'
}

function findEditor(sessionId: string): HTMLElement | undefined {
  if (!sessionId) return undefined
  const hasSessionMarkers = document.querySelector(SESSION_MARKER) !== null
  const inSession = (editor: HTMLElement) => !hasSessionMarkers
    || editor.closest(SESSION_MARKER)?.getAttribute('data-conversation-session') === sessionId
  const available = (editor: HTMLElement) => {
    if (editor.closest('[hidden], [inert], [aria-hidden="true"], [data-composer-composing]')
      || editor.matches('[aria-disabled="true"], [aria-readonly="true"]') || frozen(editor.getAttribute('data-phase'))) return false
    const editable = editor instanceof HTMLTextAreaElement
      ? !editor.disabled && !editor.readOnly
      : editor.getAttribute('contenteditable') === 'true'
    if (!editable) return false
    const { width, height } = editor.getBoundingClientRect()
    return width > 0 && height > 0 && editor.ownerDocument.defaultView?.getComputedStyle(editor).visibility === 'visible'
  }
  const editors = (selector: string) => [...document.querySelectorAll<HTMLElement>(selector)].filter(inSession)
  const marked = editors('[data-composer-input]')
  const candidates = (marked.length ? marked : editors('[contenteditable="true"][role="textbox"], textarea[role="textbox"]'))
    .filter(available)
  return candidates.length === 1 ? candidates[0] : undefined
}

function snapshotOf(editor: HTMLElement, input: ComposerInputSource | undefined): DraftSnapshot {
  return input?.state.getSnapshot() ?? {
    draft: editor instanceof HTMLTextAreaElement ? editor.value : editor.innerText ?? editor.textContent ?? '',
    attachmentIds: [],
  }
}

function hasPrefix(ids: readonly DraftAttachmentId[], prefix: readonly DraftAttachmentId[]): boolean {
  return ids.length >= prefix.length && prefix.every((id, index) => ids[index] === id)
}

function sameIds(ids: readonly DraftAttachmentId[], other: readonly DraftAttachmentId[]): boolean {
  return ids.length === other.length && hasPrefix(ids, other)
}

function sameReferences(before: DraftSnapshot, after: DraftSnapshot): boolean {
  const previous = before.occurrences ?? []
  const current = after.occurrences ?? []
  return before.claim?.token === after.claim?.token && previous.length === current.length
    && previous.every((ref, index) => {
      const next = current[index]
      return ref.occurrenceId === next.occurrenceId && ref.offset === next.offset && ref.length === next.length
    })
}

function sameDraft(before: DraftSnapshot, after: DraftSnapshot): boolean {
  return before.draft === after.draft && before.draftRev === after.draftRev && sameReferences(before, after)
}

function dispatchPaste(editor: HTMLElement, data: DataTransfer): boolean {
  return !editor.dispatchEvent(new ClipboardEvent('paste', { bubbles: true, cancelable: true, clipboardData: data }))
}

function placeCaretAtEnd(editor: HTMLElement): boolean {
  const doc = editor.ownerDocument
  const selection = doc.getSelection()
  if (!selection) return false
  const range = doc.createRange()
  const last = editor.lastChild
  // An atomic element itself is not an editable caret position.
  if (last instanceof HTMLElement && last.getAttribute('contenteditable') === 'false') range.setStartAfter(last)
  else range.selectNodeContents(last ?? editor)
  range.collapse(false)
  selection.removeAllRanges()
  selection.addRange(range)
  // Lexical's paste command uses the editor selection, so publish the moved caret.
  doc.dispatchEvent(new Event('selectionchange'))
  return true
}

async function pasteText(
  editor: HTMLElement,
  payload: string,
  lexical: boolean,
  checkTarget: () => 'insertFailed' | 'cancelled' | undefined,
): Promise<InsertFailure | undefined> {
  const blocked = checkTarget()
  if (blocked) return blocked
  editor.focus({ preventScroll: true })
  const blockedAfterFocus = checkTarget()
  if (blockedAfterFocus) return blockedAfterFocus
  if (editor instanceof HTMLTextAreaElement) {
    const setter = Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype, 'value')!.set!
    setter.call(editor, editor.value + payload)
    editor.setSelectionRange(editor.value.length, editor.value.length)
    editor.dispatchEvent(new Event('input', { bubbles: true }))
    return undefined
  }
  if (!placeCaretAtEnd(editor)) return 'insertFailed'
  const blockedAfterCaret = checkTarget()
  if (blockedAfterCaret) return blockedAfterCaret

  let handled = false
  try {
    const data = new DataTransfer()
    data.setData('text/plain', payload)
    handled = dispatchPaste(editor, data)
  } catch {
    // Older editors can fall back when clipboard events cannot be constructed.
  }
  await Promise.resolve()
  if (!handled && !lexical && !checkTarget()) {
    try { editor.ownerDocument.execCommand('insertText', false, payload) } catch { /* No native text fallback. */ }
    await Promise.resolve()
  }
  return undefined
}

/** Transfer saved originals through the addressed composer's native intake. */
export async function appendToConversation(
  sessionId: string,
  note: { text: string; attachments?: readonly NoteAttachment[] },
  getInput: ComposerInputForSession,
  signal: AbortSignal,
): Promise<ForwardResult> {
  if (signal.aborted) return { status: 'cancelled' }
  const editor = findEditor(sessionId)
  if (!editor) return { status: 'insertFailed' }
  const resolveInput = () => {
    try { return getInput(sessionId) } catch { return null }
  }
  const input = resolveInput()
  if (input === null) return { status: 'insertFailed' }
  const lexical = editor.getAttribute('data-lexical-editor') === 'true'
  const attachments = note.attachments ?? []
  const text = note.text.trim()
  const projectedText = lexical ? text.replace(REFERENCE_PLACEHOLDER, '')
    : editor instanceof HTMLTextAreaElement ? text.replace(/\r\n?/gu, '\n') : text
  if (text && !projectedText.trim()) return { status: 'insertFailed' }
  if (attachments.length && (!input || !editor.closest(SESSION_MARKER))) return { status: 'attachmentInsertFailed' }
  if ((lexical && !input) || (!text && !attachments.length) || frozen(input?.state.getSnapshot().phase)) {
    return { status: 'insertFailed' }
  }

  let fileData: DataTransfer | undefined
  if (attachments.length) {
    const readSignal = AbortSignal.any([signal, AbortSignal.timeout(120_000)])
    let files: File[]
    try {
      files = await Promise.all(attachments.map(async attachment => {
        const blob = await readAttachment(attachment, readSignal)
        return new File([blob], attachment.name, { type: attachment.type })
      }))
    } catch {
      return { status: signal.aborted ? 'cancelled' : 'attachmentReadFailed' }
    }
    if (signal.aborted) return { status: 'cancelled' }
    try {
      fileData = new DataTransfer()
      for (const file of files) fileData.items.add(file)
      if (fileData.files.length !== files.length) return { status: 'attachmentInsertFailed' }
    } catch {
      return { status: 'attachmentInsertFailed' }
    }
  }

  const target = input?.state ?? editor
  const sameTarget = () => {
    const current = resolveInput()
    return current !== null && current?.state === input?.state
  }
  const blocked = () => {
    if (signal.aborted) return 'cancelled'
    if (findEditor(sessionId) !== editor || !sameTarget() || frozen(input?.state.getSnapshot().phase)) return 'insertFailed'
    return undefined
  }
  const insert = async (): Promise<ForwardResult> => {
    const unavailable = blocked()
    if (unavailable) return { status: unavailable }
    const snapshot = () => snapshotOf(editor, input)
    const before = snapshot()
    let expectedIds = before.attachmentIds
    let admittedIds: DraftAttachmentId[] = []
    const fail = (cause: InsertFailure): ForwardResult => {
      for (const id of admittedIds) {
        if (!input?.removeAttachment || !sameTarget()) break
        if (!snapshot().attachmentIds.includes(id)) continue
        try { input.removeAttachment(id) } catch { /* Verify rollback against the retained store. */ }
      }
      const after = snapshot()
      const draftChanged = !sameDraft(before, after)
      const attachmentListChanged = !sameIds(before.attachmentIds, after.attachmentIds)
      if (!draftChanged && !attachmentListChanged) return { status: cause }
      return {
        status: 'partial',
        cause,
        draftBefore: before.draft,
        draftChanged,
        attachmentIdsBefore: before.attachmentIds,
        attachmentListChanged,
        remainingAttachmentIds: admittedIds.filter(id => after.attachmentIds.includes(id)),
        state: input?.state,
      }
    }
    if (fileData) {
      let dispatched = false
      try {
        dispatchPaste(editor, fileData)
        dispatched = true
      } catch { /* Read the store even if the native event failed partway. */ }
      // rc.5 admits draft IDs synchronously. Later snapshot changes cannot be
      // attributed to this paste or used as rollback candidates.
      expectedIds = snapshot().attachmentIds
      const existingIds = new Set(before.attachmentIds)
      admittedIds = [...new Set(expectedIds.filter(id => !existingIds.has(id)))]
      const accepted = dispatched && hasPrefix(expectedIds, before.attachmentIds)
        && expectedIds.length === before.attachmentIds.length + attachments.length
        && admittedIds.length === attachments.length && admittedIds.every(id => id.length > 0)
      // File intake can also start a Lexical update. Verify its committed text.
      await Promise.resolve()
      const afterFiles = snapshot()
      if (!accepted || !sameIds(afterFiles.attachmentIds, expectedIds) || !sameDraft(before, afterFiles)) {
        return fail(signal.aborted ? 'cancelled' : 'attachmentInsertFailed')
      }
    }
    if (text) {
      const separator = before.draft.trim() && !before.draft.endsWith('\n') ? '\n' : ''
      const checkTarget = () => {
        const unavailable = blocked()
        if (unavailable) return unavailable
        const current = snapshot()
        if (!sameDraft(before, current) || !sameIds(current.attachmentIds, expectedIds)) return 'insertFailed'
        return undefined
      }
      // DSH rc.5 initializes with HISTORY_MERGE_TAG, including an empty draft.
      // Native PASTE_TAG gives a forwarded note its own undo step.
      let failure: InsertFailure | undefined
      try { failure = await pasteText(editor, separator + text, lexical, checkTarget) } catch { failure = 'insertFailed' }
      const after = snapshot()
      if (failure) return fail(failure)
      if (after.draft !== before.draft + separator + projectedText || !sameReferences(before, after)
        || !sameIds(after.attachmentIds, expectedIds)) return fail(signal.aborted ? 'cancelled' : 'insertFailed')
    }
    return { status: 'inserted' }
  }

  // Serialize mutations for the same retained draft, while reading files in parallel.
  const operation = (pendingInsertions.get(target) ?? Promise.resolve()).then(insert, insert)
  pendingInsertions.set(target, operation)
  try {
    return await operation
  } finally {
    if (pendingInsertions.get(target) === operation) pendingInsertions.delete(target)
  }
}
