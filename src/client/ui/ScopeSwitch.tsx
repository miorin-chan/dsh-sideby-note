/** Segmented switch with a pending-note count for each list scope. */
import React from 'react'
import type { ScopeMode } from '../scope'
import { Glyph, withTooltip } from './primitives'

const h = React.createElement

export interface ScopeSwitchProps {
  say: (key: string, vars?: Record<string, string | number>) => string
  scopeMode: ScopeMode
  globalOpenCount: number | null
  workspaceOpenCount: number | null
  workspaceName: string | null
  workspacePending: boolean
  countStatus: string
  onScopeChange: (mode: ScopeMode) => void
}

function countText(count: number | null) {
  return h('span', { className: 'dsh-an-scopeCount' }, count ?? '—')
}

export function ScopeSwitch({
  say, scopeMode, globalOpenCount, workspaceOpenCount, workspaceName, workspacePending, countStatus, onScopeChange,
}: ScopeSwitchProps) {
  const countLabel = (count: number | null) => count === null ? countStatus : say('dock.count', { n: count })
  const globalName = say('scope.global')
  const globalLabel = `${globalName} · ${countLabel(globalOpenCount)}`
  const globalContent = [h('span', null, globalName), countText(globalOpenCount)]
  const workspaceIcon = h('span', { className: 'dsh-an-scopeIcon', 'aria-hidden': true },
    h(Glyph, { name: 'IconFolderOpenOutlineRegular', size: 14 }),
  )

  if (!workspaceName) {
    return h('div', { className: workspacePending ? 'dsh-an-scope' : 'dsh-an-scopeSummary' },
      h('span', { className: 'dsh-an-srOnly' }, globalLabel),
      h('span', { className: 'dsh-an-scopeSummaryContent', title: globalLabel, 'aria-hidden': true }, ...globalContent),
      workspacePending && h('span', { className: 'dsh-an-scopePending', title: say('scope.loading'), 'aria-hidden': true },
        workspaceIcon, countText(null),
      ),
    )
  }

  const workspaceLabel = `${say('item.currentWorkspace', { workspace: workspaceName })} · ${countLabel(workspaceOpenCount)}`
  const scopeButton = (mode: ScopeMode, label: string, hint: string, ...content: React.ReactNode[]) => withTooltip(
    `${hint} · ${label}`,
    h('button', {
      type: 'button',
      className: mode === 'workspace' ? 'dsh-an-scopeBtn dsh-an-scopeWorkspace' : 'dsh-an-scopeBtn',
      'data-scope-mode': mode,
      'aria-label': label,
      'aria-pressed': scopeMode === mode,
      onClick: () => onScopeChange(mode),
    }, ...content),
  )
  return h('div', { className: 'dsh-an-scope', role: 'group', 'aria-label': say('scope.label') },
    scopeButton('global', globalLabel, say('scope.globalHint'), ...globalContent),
    scopeButton('workspace', workspaceLabel, say('scope.workspaceHint'),
      workspaceIcon, h('bdi', { className: 'dsh-an-scopeName' }, workspaceName), countText(workspaceOpenCount),
    ),
  )
}
