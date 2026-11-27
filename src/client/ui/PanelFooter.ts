import React from 'react'
import type { StorageMode } from '../storage/state'

const h = React.createElement

export function PanelFooter({ say, mode, syncError }: {
  say: (key: string, vars?: Record<string, string>) => string
  mode: StorageMode
  syncError: boolean
}) {
  if (!syncError || mode === 'error') return null

  return h('footer', { className: 'dsh-an-popFoot' },
    h('div', { role: 'status', className: 'dsh-an-error' },
      say(mode === 'host' ? 'toast.saveFailed' : 'storage.failed')),
  )
}
