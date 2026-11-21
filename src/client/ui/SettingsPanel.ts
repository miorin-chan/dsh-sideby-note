/** Settings card: about and updates. */
import React from 'react'
import {
  PLUGIN_AUTHOR,
  PLUGIN_REPO_LABEL,
  PLUGIN_REPO_URL,
  PLUGIN_VERSION,
} from '../constants'
import { UpdateNotice } from './UpdateNotice'
import { StorageSettings } from './StorageSettings'

const h = React.createElement

export function SettingsPanel(props) {
  const {
    say,
    update,
  } = props
  return h(
            'div',
            { className: 'dsh-an-settings' },
            h('div', { className: 'dsh-an-settingsHead' }, say('settings.title')),
            h(
              'div',
              { className: 'dsh-an-settingGroup' },
              h('div', { className: 'dsh-an-settingLabel' }, say('settings.storage')),
              h(
                'div',
                { className: 'dsh-an-settingBody' },
                h(StorageSettings, { say, onToast: props.onToast }),
              ),
            ),
            h(
              'div',
              { className: 'dsh-an-settingGroup' },
              h('div', { className: 'dsh-an-settingLabel' }, say('settings.about')),
              h(
                'div',
                { className: 'dsh-an-settingBody' },
                // Product identity first, then the build and update controls.
                h(
                  'div',
                  { className: 'dsh-an-settingBrand' },
                  h('span', { className: 'dsh-an-settingBrandName' }, say('title')),
                  h('span', { className: 'dsh-an-settingBrandTagline' }, say('settings.tagline')),
                ),
                // One line: version, check control and result, then the author
                // pushed to the far right. Wrapping keeps the author right-aligned
                // when the panel is narrow.
                h(
                  'div',
                  { className: 'dsh-an-settingAbout' },
                  h('span', { className: 'dsh-an-settingAboutVersion' }, `${say('settings.version')} ${PLUGIN_VERSION}`),
                  h(
                    'button',
                    {
                      type: 'button',
                      className: 'dsh-an-updateCheck',
                      disabled: update.check.status === 'checking',
                      onClick: update.checkNow,
                    },
                    say(update.check.status === 'checking'
                      ? 'update.checking'
                      : update.check.status === 'error'
                        ? 'update.retryCheck'
                        : 'update.check'),
                  ),
                  update.check.status === 'current'
                    ? h('span', { className: 'dsh-an-updateHint', role: 'status' }, say('update.current'))
                    : null,
                  update.check.status === 'error'
                    ? h('span', { className: 'dsh-an-updateHint dsh-an-updateHintError', role: 'status' }, say('update.checkFailed'))
                    : null,
                ),
                update.latestVersion
                  ? h(UpdateNotice, {
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
                      onToast: props.onToast,
                    })
                  : null,
                h(
                  'div',
                  { className: 'dsh-an-settingMetaRow' },
                  h('span', null, say('settings.author')),
                  h('span', { className: 'dsh-an-settingDot', 'aria-hidden': true }, '·'),
                  h('span', null, PLUGIN_AUTHOR),
                ),
                // The improver sits right below the author, same key/value row.
                // The name itself is copy: Chinese credits 光吟, every other
                // language credits the GitHub handle.
                h(
                  'div',
                  { className: 'dsh-an-settingMetaRow' },
                  h('span', null, say('settings.improver')),
                  h('span', { className: 'dsh-an-settingDot', 'aria-hidden': true }, '·'),
                  h('span', null, say('settings.improverName')),
                ),
                h(
                  'div',
                  { className: 'dsh-an-settingMetaRow' },
                  h('span', null, say('settings.project')),
                  h('span', { className: 'dsh-an-settingDot', 'aria-hidden': true }, '·'),
                  h(
                    'a',
                    {
                      className: 'dsh-an-settingLink',
                      href: PLUGIN_REPO_URL,
                      target: '_blank',
                      rel: 'noreferrer',
                      title: PLUGIN_REPO_URL,
                    },
                    PLUGIN_REPO_LABEL,
                  ),
                ),
              ),
            ),
          )
}
