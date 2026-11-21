/** Settings › Data storage: the medium, the host file path and its actions. */
import React from 'react'
import { copyText } from '../domain/clipboard'
import { currentStorageMode, retryStorage } from '../storage/boot'
import { STORE_READY_LISTENERS } from '../storage/events'
import { fetchStoreLocation, revealStoreFile } from '../storage/host-client'
import { storageFailure } from '../storage/state'

const h = React.createElement

/**
 * The storage decision can change after this block mounts (retry, or a probe
 * finishing late); refresh on the same ready channel the entry uses. The path
 * is host-owned state and is fetched only while host storage is in use.
 */
export function StorageSettings(props) {
  const { say } = props
  const [storage, setStorage] = React.useState(() => ({
    mode: currentStorageMode(),
    failure: storageFailure(),
  }))
  React.useEffect(() => {
    const onReady = () => setStorage({ mode: currentStorageMode(), failure: storageFailure() })
    STORE_READY_LISTENERS.add(onReady)
    return () => { STORE_READY_LISTENERS.delete(onReady) }
  }, [])

  const [location, setLocation] = React.useState<{ path: string | null, exists: boolean } | null>(null)
  const [locating, setLocating] = React.useState(false)
  React.useEffect(() => {
    if (storage.mode !== 'host') {
      setLocation(null)
      setLocating(false)
      return
    }
    let alive = true
    setLocating(true)
    void fetchStoreLocation().then(next => {
      if (!alive) return
      setLocation(next)
      setLocating(false)
    })
    return () => { alive = false }
  }, [storage.mode])

  const notify = typeof props.onToast === 'function' ? props.onToast : () => {}
  const copyStorePath = async () => {
    if (!location || !location.path) return
    notify((await copyText(location.path)) ? 'pathCopied' : 'copyFailed')
  }
  const showStoreFile = async () => {
    if (!(await revealStoreFile())) notify('revealFailed')
  }

  const modeLabel = storage.mode === 'host'
    ? say('storage.modeHost')
    : storage.mode === 'local'
      ? say('storage.modeLocal')
      : storage.mode === 'probing'
        ? say('storage.loading')
        : say(storage.failure?.code === 'STORE_IN_USE' ? 'storage.inUse' : 'storage.hostError')

  return h(
    'div',
    { className: 'dsh-an-storageBlock' },
    h(
      'div',
      { className: 'dsh-an-settingMetaRow' },
      h('span', null, modeLabel),
      storage.mode === 'error'
        ? h('button', {
            type: 'button',
            className: 'dsh-an-updateCheck',
            onClick: () => { void retryStorage() },
          }, say('storage.retry'))
        : null,
    ),
    storage.mode === 'host'
      ? locating
        ? h('p', { className: 'dsh-an-settingHint' }, say('storage.pathLoading'))
        : location && location.path
          ? h(
              'div',
              { className: 'dsh-an-storagePathRow' },
              h('code', {
                className: 'dsh-an-storagePath',
                title: location.path,
              }, location.path),
              h(
                'div',
                { className: 'dsh-an-storageActions' },
                h('button', {
                  type: 'button',
                  className: 'dsh-an-storageAction',
                  onClick: () => { void copyStorePath() },
                }, say('storage.copyPath')),
                h('button', {
                  type: 'button',
                  className: 'dsh-an-storageAction',
                  onClick: () => { void showStoreFile() },
                }, say('storage.reveal')),
              ),
              location.exists
                ? null
                : h('p', { className: 'dsh-an-settingHint' }, say('storage.pathMissing')),
            )
          : h('p', { className: 'dsh-an-settingHint' }, say('storage.pathUnavailable'))
      : storage.mode === 'local'
        ? h('p', { className: 'dsh-an-settingHint' }, say('storage.notSwitched'))
        : null,
    storage.failure
      ? h(
          'p',
          { className: 'dsh-an-settingHint' },
          say('storage.failure').replace('{code}', storage.failure.code),
        )
      : null,
  )
}
