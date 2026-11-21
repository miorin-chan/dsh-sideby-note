import React from 'react'
import { PLUGIN_VERSION } from '../constants'
import type { StorageMode } from '../storage/state'
import { StorageDetails } from './StorageDetails'
import { UpdateNotice } from './UpdateNotice'
import type { useUpdateCenter } from './useUpdateCenter'

const h = React.createElement

type Say = React.ComponentProps<typeof UpdateNotice>['say']
type UpdateCenter = ReturnType<typeof useUpdateCenter>
type UpdateDetailsProps = {
  say: Say
  update: UpdateCenter
  onToast: (kind: string) => void
}

function UpdateDetails({ say, update, onToast }: UpdateDetailsProps) {
  const [open, setOpen] = React.useState(false)

  return h('details', {
    className: 'dsh-an-updateDetails',
    onToggle: (event: React.SyntheticEvent<HTMLDetailsElement>) => setOpen(event.currentTarget.open),
  },
  h('summary', { className: 'dsh-an-updateToggle' }, say('update.label')),
  open && h(UpdateNotice, {
    say,
    latestVersion: update.latestVersion,
    notes: update.notes,
    expandedVersions: update.expandedVersions,
    releasesUrl: update.releasesUrl,
    run: update.run,
    fullReleaseUrl: update.fullReleaseUrl,
    onToggleVersion: update.toggleVersion,
    onStartUpdate: update.startUpdate,
    onRefresh: update.refreshPage,
    onCopyPrompt: update.copyPrompt,
    onToast,
  }))
}

export function PanelFooter({ say, mode, syncError, update, onToast }: UpdateDetailsProps & {
  mode: StorageMode
  syncError: boolean
}) {
  const [detailsOpen, setDetailsOpen] = React.useState(false)
  const { check, latestVersion } = update
  const saveError = syncError && mode !== 'error'
  const checkResult = check.status === 'current' ? say('update.current')
    : check.status === 'error' ? say('update.checkFailed')
      : check.status === 'available' ? say('update.available', { version: `v${latestVersion}` }) : null
  const checking = check.status === 'checking'
  const installing = update.run.phase === 'starting' || update.run.phase === 'running'

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
        h('div', { className: 'dsh-an-versionRow' },
          h('span', null, `${say('update.version')} ${PLUGIN_VERSION}`),
          h('button', {
            type: 'button',
            className: 'dsh-an-updateCheck',
            'aria-disabled': checking || installing,
            onClick: () => { if (!checking && !installing) void update.checkNow() },
          }, say(checking ? 'update.checking'
            : check.status === 'error' ? 'update.retryCheck' : 'update.check')),
          h('span', { role: 'status', className: check.status === 'error' ? 'dsh-an-updateHintError' : undefined }, checkResult),
        ),
      ),
    ),
    latestVersion && h(UpdateDetails, { say, update, onToast }),
  )
}
