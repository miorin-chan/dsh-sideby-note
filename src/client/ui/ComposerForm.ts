/** The add form: one growing textarea and its submit button. */
import React from 'react'
import { MAX_TEXT } from '../constants'
import { withTooltip } from './primitives'

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
      h('svg', {
        width: 16,
        height: 16,
        viewBox: '0 0 16 16',
        fill: 'none',
        stroke: 'currentColor',
        strokeWidth: 1.5,
        strokeLinecap: 'round',
        strokeLinejoin: 'round',
        'aria-hidden': true,
      }, h('path', { d: 'M13 3v5a2 2 0 0 1-2 2H3m0 0 3-3m-3 3 3 3' })),
    )),
  )
}
