import React from 'react'
import type { StorageMode } from '../storage/state'
import { StorageDetails } from './StorageDetails'

const h = React.createElement

type Say = React.ComponentProps<typeof StorageDetails>['say']

export function PanelFooter({ say, mode, syncError, onToast }: {
  say: Say
  mode: StorageMode
  syncError: boolean
  onToast: (kind: string) => void
}) {
  const [detailsOpen, setDetailsOpen] = React.useState(false)
  const saveError = syncError && mode !== 'error'

  return h('footer', { className: 'dsh-an-popFoot' },
    saveError && h('div', { role: 'status', className: 'dsh-an-error' },
      say(mode === 'host' ? 'toast.saveFailed' : 'storage.failed')),
    h('details', {
      className: 'dsh-an-footerDetails',
      onToggle: (event: React.SyntheticEvent<HTMLDetailsElement>) => setDetailsOpen(event.currentTarget.open),
    },
      h('summary', { className: 'dsh-an-storageToggle' }, say('storage.details')),
      detailsOpen && h('div', { className: 'dsh-an-footerBody' },
        h(StorageDetails, { say, mode, showStatus: !saveError, onToast }),
      ),
    ),
  )
}
