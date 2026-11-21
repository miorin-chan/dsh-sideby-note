/** The add form: one growing textarea and its submit button. */
import React from 'react'
import { MAX_TEXT } from '../constants'
import { Glyph, withTooltip } from './primitives'

const h = React.createElement

export function ComposerForm(props) {
  const { say, draft, isSubmitting, isRecalling, storageInUse, inputRef, onDraftChange, onCompositionStart, onCompositionEnd, onKeyDown, onSubmit } = props
  const addLabel = say('add.action')
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
    withTooltip(addLabel, h(
      'button',
      {
        type: 'submit',
        className: 'dsh-an-addBtn',
        'aria-label': addLabel,
        disabled: storageInUse || isSubmitting || isRecalling || !draft.trim(),
      },
      h(Glyph, { name: 'IconPlusOutlineRegular', size: 16 }),
    )),
  )
}
