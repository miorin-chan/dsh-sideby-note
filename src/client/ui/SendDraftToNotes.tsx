import React from 'react'
import type { PropsRuntime, SessionIdOf } from '@deepseek-ai/dsh-client-ui-slots'
import { MAX_TEXT } from '../constants'
import type { ComposerInputForSession, ComposerInputSource } from '../domain/forward'
import { uid } from '../domain/id'
import type { MessageKey } from '../i18n/zh'
import { UNASSIGNED_WORKSPACE, workspaceCatalogReady, workspaceForSession } from '../scope'
import { updateWorkspaceNotes } from '../storage/workspace'
import { NOTE_ICON_MARKUP } from './headerEntry'
import { Tooltip, withTooltip } from './primitives'

export type ComposerNoteSlotProps = Pick<PropsRuntime<'conversation.input.right'>, 'useInput' | 'inputActions'> & {
  sessionId: SessionIdOf
}

interface SendDraftProps extends ComposerNoteSlotProps {
  getComposerInput: ComposerInputForSession
  say: (key: MessageKey, vars?: Record<string, number>) => string
  showToast: (text: string, tone: 'success' | null) => void
}

const attempts = new WeakMap<ComposerInputSource['state'], {
  workspaceId: string
  revision: number
  id: string
  writtenAt: number
  pending: boolean
}>()

export function SendDraftToNotes({ sessionId, useInput, inputActions, getComposerInput, say, showToast }: SendDraftProps) {
  const unavailable = useInput(state => state.phase !== 'plain' || (!state.draft.trim() && !state.attachmentIds.length))
  const [savingSession, setSavingSession] = React.useState<string>()
  const saving = savingSession === sessionId
  const label = say('composer.sendToNotes')

  const send = async (button: HTMLButtonElement, keyboard: boolean) => {
    const input = getComposerInput(sessionId)
    if (!input) {
      showToast(say('toast.saveFailed'), null)
      return
    }
    const before = input.state.getSnapshot()
    const previous = attempts.get(input.state)
    if (previous?.pending || before.phase !== 'plain') return
    if (before.attachmentIds.length) {
      showToast(say('composer.attachments'), null)
      return
    }
    const text = before.draft.trim()
    if (!text) return
    if (text.length > MAX_TEXT) {
      showToast(say('composer.tooLong', { n: MAX_TEXT }), null)
      return
    }
    if (!workspaceCatalogReady()) {
      showToast(say('scope.loading'), null)
      return
    }
    const workspaceId = workspaceForSession(sessionId)?.workspaceId ?? UNASSIGNED_WORKSPACE
    // A timed-out host write may have already created this note. Retrying the
    // same draft revision reuses its id even if the toolbar is remounted.
    const attempt = previous?.revision === before.draftRev && previous.workspaceId === workspaceId
      ? previous
      : { workspaceId, revision: before.draftRev, id: uid(), writtenAt: Date.now(), pending: false }
    attempts.set(input.state, attempt)
    attempt.pending = true
    setSavingSession(sessionId)
    try {
      const saved = await updateWorkspaceNotes(workspaceId, items => {
        if (items.some(item => item.id === attempt.id)) return items
        const note = { id: attempt.id, text, done: false, createdAt: attempt.writtenAt, updatedAt: attempt.writtenAt }
        return [note, ...items]
      }).catch(() => false)
      if (!saved) {
        showToast(say('toast.saveFailed'), null)
        return
      }
      let cleared = false
      // The note stores trimmed text. DSH's quote nodes appear as Markdown
      // blockquotes in the public clipboard projection, even when inline.
      const plainText = !before.occurrences.length && before.draft === text && !/>[ \n]/u.test(text)
      const current = input.state.getSnapshot()
      const focused = button.ownerDocument.activeElement
      if (plainText && !(focused instanceof HTMLElement && focused.isContentEditable)
        && getComposerInput(sessionId)?.state === input.state && current.phase === 'plain'
        && current.draftRev === before.draftRev && current.draft === before.draft && !current.attachmentIds.length) {
        inputActions.setDraft('')
        cleared = input.state.getSnapshot().draft === ''
        if (cleared) {
          attempts.delete(input.state)
          inputActions.persistDraft()
          if (keyboard && focused === button) input.focus?.()
        }
      }
      showToast(say(cleared ? 'composer.saved' : 'composer.savedDraftKept'), 'success')
    } finally {
      attempt.pending = false
      setSavingSession(current => current === sessionId ? undefined : current)
    }
  }

  const button = (
    <button type="button" className="dsh-an-sendDraft" aria-label={label} title={Tooltip ? undefined : label}
      disabled={unavailable} aria-busy={saving} aria-disabled={saving || undefined} data-loading={saving || undefined}
      onClick={event => { void send(event.currentTarget, event.detail === 0) }}>
      <span aria-hidden="true" dangerouslySetInnerHTML={{ __html: NOTE_ICON_MARKUP }} />
      <span className="dsh-an-sendDraftLabel">{label}</span>
    </button>
  )
  return withTooltip(label, button)
}
