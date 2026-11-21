/** Panel title, counts, the list-scope switch and close action. */
import React from 'react'
import { IconClose, withTooltip } from './primitives'
import { ScopeSwitch } from './ScopeSwitch'

const h = React.createElement

export function PanelHead(props) {
  const {
    say,
    openCount,
    total,
    onClose,
    scopeMode,
    canUseWorkspace,
    canUseSession,
    onScopeChange,
  } = props
  return h(
    'div',
    { className: 'dsh-an-popHead' },
    h(
      'div',
      { className: 'dsh-an-popTitleLine' },
      h('div', { className: 'dsh-an-popTitle' }, say('popover.title')),
      h('p', { className: 'dsh-an-popMeta' }, say('popover.count', { open: openCount, total })),
      canUseWorkspace
        ? h(ScopeSwitch, { say, mode: scopeMode, canUseSession, onChange: onScopeChange })
        : null,
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
