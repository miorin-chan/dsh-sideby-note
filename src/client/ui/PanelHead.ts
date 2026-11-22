/** Panel title, counts, the list-scope switch and close action. */
import React from 'react'
import { IconClose, withTooltip } from './primitives'
import { ScopeSwitch, type ScopeSwitchProps } from './ScopeSwitch'

const h = React.createElement

export function PanelHead({ onClose, ...scope }: ScopeSwitchProps & { onClose: () => void }) {
  const { say } = scope
  return h(
    'div',
    { className: 'dsh-an-popHead' },
    h(
      'div',
      { className: 'dsh-an-popTitleLine' },
      h('div', { className: 'dsh-an-popTitle' }, say('popover.title')),
      h(ScopeSwitch, scope),
    ),
    h(
      'div',
      { className: 'dsh-an-popActions' },
      withTooltip(say('popover.close'), h(
        'button',
        { type: 'button', className: 'dsh-an-popClose', 'aria-label': say('popover.close'), onClick: () => onClose() },
        h(IconClose, null),
      )),
    ),
  )
}
