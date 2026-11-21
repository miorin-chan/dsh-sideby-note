/** Segmented switch between the global and workspace filters. */
import React from 'react'
import { withTooltip } from './primitives'

const h = React.createElement

export function ScopeSwitch(props) {
  const { say, mode, canUseWorkspace, onChange } = props
  const options = [
    { value: 'global', label: say('scope.global'), hint: say('scope.globalHint') },
    ...(canUseWorkspace ? [{ value: 'workspace', label: say('scope.workspace'), hint: say('scope.workspaceHint') }] : []),
  ]
  return h(
    'div',
    { className: 'dsh-an-scope', role: 'group', 'aria-label': say('scope.label') },
    options.map(option => h(
      React.Fragment,
      { key: option.value },
      withTooltip(
        option.hint,
        h(
          'button',
          {
            type: 'button',
            className: 'dsh-an-scopeBtn',
            'data-scope-mode': option.value,
            'data-active': mode === option.value ? 'true' : undefined,
            'aria-pressed': mode === option.value,
            onClick: () => onChange(option.value),
          },
          option.label,
        ),
      ),
    )),
  )
}
