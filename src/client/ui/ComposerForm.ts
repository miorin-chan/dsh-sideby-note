/** The add form: one growing textarea, the Enter hint and the submit button. */
import React from 'react'
import { MAX_TEXT } from '../constants'

const h = React.createElement

export function ComposerForm(props) {
  const { say, draft, isSubmitting, isRecalling, storageInUse, inputRef, onDraftChange, onCompositionStart, onCompositionEnd, onKeyDown, onSubmit } = props
  return h(
    'form',
    { className: 'dsh-an-add', onSubmit },
    h('textarea', {
      ref: inputRef,
      className: 'dsh-an-input',
      value: draft,
      rows: 1,
      maxLength: MAX_TEXT,
      readOnly: isRecalling,
      placeholder: say('add.placeholder'),
      'aria-label': say('add.placeholder'),
      onChange: onDraftChange,
      onCompositionStart,
      onCompositionEnd,
      onKeyDown,
    }),
    h(
      'div',
      { className: 'dsh-an-addFoot' },
      storageInUse ? null : h('span', { className: 'dsh-an-addShortcut' }, say('add.shortcut')),
      h('button', { type: 'submit', className: 'dsh-an-addBtn', disabled: storageInUse || isSubmitting || isRecalling || !draft.trim() }, say('add.action')),
    ),
  )
}
