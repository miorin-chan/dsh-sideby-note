import React from 'react'
import { copyText } from '../domain/clipboard'
import { fetchStoreLocation, revealStoreFile } from '../storage/host-client'
import { storageFailure, type StorageMode } from '../storage/state'

const h = React.createElement

type StorageDetailsProps = {
  say: (key: string, vars?: Record<string, string>) => string
  mode: StorageMode
  showStatus: boolean
  onToast: (kind: string) => void
}

function HostLocation({ say, onToast }: Pick<StorageDetailsProps, 'say' | 'onToast'>) {
  const [location, setLocation] = React.useState<Awaited<ReturnType<typeof fetchStoreLocation>>>()
  React.useEffect(() => {
    let open = true
    void fetchStoreLocation().then(next => { if (open) setLocation(next) })
    return () => { open = false }
  }, [])

  if (location === undefined) return h('p', null, say('storage.pathLoading'))
  if (!location?.path) return h('p', null, say('storage.pathUnavailable'))

  const path = location.path
  return h('div', { className: 'dsh-an-storagePathRow' },
    h('code', { className: 'dsh-an-storagePath', title: path }, path),
    h('div', { className: 'dsh-an-storageActions' },
      h('button', {
        type: 'button',
        className: 'dsh-an-mini dsh-an-storageAction',
        onClick: async () => onToast(await copyText(path) ? 'pathCopied' : 'copyFailed'),
      }, say('storage.copyPath')),
      h('button', {
        type: 'button',
        className: 'dsh-an-mini dsh-an-storageAction',
        onClick: async () => { if (!(await revealStoreFile())) onToast('revealFailed') },
      }, say('storage.reveal')),
    ),
    !location.exists && h('p', null, say('storage.pathMissing')),
  )
}

export function StorageDetails({ say, mode, showStatus, onToast }: StorageDetailsProps) {
  const failure = storageFailure()
  if (mode === 'error') return null
  if (mode === 'probing') return h('p', { role: 'status' }, say('storage.loading'))

  return h('div', { className: 'dsh-an-storageBlock' },
    showStatus && h('p', { role: 'status' }, say(mode === 'host' ? 'storage.whereHost' : 'storage.notSwitched')),
    mode === 'host' && h(HostLocation, { say, onToast }),
    failure && h('p', null, say('storage.failure', { code: failure.code })),
  )
}
