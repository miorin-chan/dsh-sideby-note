import type { InputState } from '@deepseek-ai/dsh-client-ui-conversation/client'
import { readAttachment, type NoteAttachment } from './attachments'

export interface ComposerInputSource {
  getSnapshot(): Pick<InputState, 'draft' | 'attachmentIds'>
}
export type ComposerInputForSession = (sessionId: string) => ComposerInputSource | undefined

type ForwardResult = 'inserted' | 'insertFailed' | 'attachmentReadFailed' | 'attachmentInsertFailed' | 'cancelled'

function findEditor(sessionId: string): HTMLElement | undefined {
  if (!sessionId) return undefined
  const sessionMarker = '[data-conversation-session]'
  const hasSessionMarkers = document.querySelector(sessionMarker) !== null
  const inSession = (editor: HTMLElement) => !hasSessionMarkers
    || editor.closest(sessionMarker)?.getAttribute('data-conversation-session') === sessionId
  const available = (editor: HTMLElement) => {
    if (editor.closest('[hidden], [inert], [aria-hidden="true"]') || editor.hasAttribute('data-composer-composing')) return false
    const editable = editor instanceof HTMLTextAreaElement
      ? !editor.disabled && !editor.readOnly
      : editor.getAttribute('contenteditable') === 'true'
    if (!editable) return false
    const { width, height } = editor.getBoundingClientRect()
    return width > 0 && height > 0
  }
  const editors = (selector: string) => [...document.querySelectorAll<HTMLElement>(selector)].filter(inSession)
  const marked = editors('[data-composer-input]')
  return (marked.length ? marked : editors('[contenteditable="true"][role="textbox"], textarea[role="textbox"]')).find(available)
}

function dispatchPaste(editor: HTMLElement, data: DataTransfer): boolean {
  return !editor.dispatchEvent(new ClipboardEvent('paste', { bubbles: true, cancelable: true, clipboardData: data }))
}

async function appendText(editor: HTMLElement, text: string, input?: ComposerInputSource): Promise<boolean> {
  const current = input?.getSnapshot().draft ?? (editor instanceof HTMLTextAreaElement ? editor.value : editor.innerText ?? '')
  const payload = current.trim() && !current.endsWith('\n') ? `\n${text}` : text
  if (editor instanceof HTMLTextAreaElement) {
    const setter = Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype, 'value')!.set!
    setter.call(editor, current + payload)
    editor.dispatchEvent(new Event('input', { bubbles: true }))
    editor.focus()
    editor.setSelectionRange(editor.value.length, editor.value.length)
    return true
  }

  editor.focus({ preventScroll: true })
  const selection = window.getSelection()
  if (!selection) return false
  const range = document.createRange()
  range.selectNodeContents(editor.lastChild ?? editor)
  range.collapse(false)
  selection.removeAllRanges()
  selection.addRange(range)
  // Lexical uses its stored selection for paste. Publish the moved caret
  // before a second paste event can reuse the previous selection.
  document.dispatchEvent(new Event('selectionchange'))
  try {
    const data = new DataTransfer()
    data.setData('text/plain', payload)
    if (dispatchPaste(editor, data)) {
      if (!input) return true
      // Lexical commits the paste after the event handler returns.
      await Promise.resolve()
      return input.getSnapshot().draft === current + payload
    }
  } catch {
    // The text-only fallback also works on browsers without a constructible clipboard event.
  }
  try {
    return document.execCommand('insertText', false, payload)
  } catch {
    return false
  }
}

/** Transfer the saved originals through the addressed composer's normal paste validation. */
export async function appendToConversation(
  sessionId: string,
  note: { text: string; attachments?: readonly NoteAttachment[] },
  getInput: ComposerInputForSession,
  signal: AbortSignal,
): Promise<ForwardResult> {
  if (signal.aborted) return 'cancelled'
  const editor = findEditor(sessionId)
  if (!editor) return 'insertFailed'
  const text = note.text.trim()
  const input = getInput(sessionId)
  if (!note.attachments?.length) return text && await appendText(editor, text, input) ? 'inserted' : 'insertFailed'
  if (!input || !editor.closest('[data-conversation-session]')) return 'attachmentInsertFailed'
  const readSignal = AbortSignal.any([signal, AbortSignal.timeout(120_000)])
  let files: File[]
  try {
    files = await Promise.all(note.attachments.map(async attachment => {
      const blob = await readAttachment(attachment, readSignal)
      return new File([blob], attachment.name, { type: attachment.type })
    }))
  } catch {
    return signal.aborted ? 'cancelled' : 'attachmentReadFailed'
  }

  if (signal.aborted) return 'cancelled'
  if (findEditor(sessionId) !== editor || getInput(sessionId) !== input) return 'insertFailed'
  const before = input.getSnapshot()
  try {
    const data = new DataTransfer()
    for (const file of files) data.items.add(file)
    if (data.files.length !== files.length) return 'attachmentInsertFailed'
    dispatchPaste(editor, data)
  } catch {
    return 'attachmentInsertFailed'
  }
  // The native handler can consume the event while refusing the batch. Read
  // the Session input store to confirm every file actually entered its draft.
  const after = input.getSnapshot()
  if (after.attachmentIds.length !== before.attachmentIds.length + files.length) return 'attachmentInsertFailed'
  if (text && !await appendText(editor, text, input)) return 'insertFailed'
  return 'inserted'
}
