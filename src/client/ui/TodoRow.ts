/** A note with a leading insert action and a trailing cell for its age and secondary actions. */
import React from 'react'
import { copyText } from '../domain/clipboard'
import { metaLabel, rowAge } from '../domain/items'
import { AttachmentList } from './AttachmentList'
import { Glyph, IconCopy, IconInsert, IconRewind, icon, withTooltip } from './primitives'

const h = React.createElement

export function TodoRow(props) {
  const { item, archived, workspaceName, isCurrentWorkspace, onOpenWorkspace, say, localeId, onToast, onInsert, onRecall, dragProps, onReorderKey } = props
  const attachments = item.attachments ?? []
  const hasText = Boolean(item.text)
  const insertLabel = say(hasText ? (attachments.length ? 'attachment.insertText' : 'item.insert') : 'attachment.archive')
  const workspaceLabel = onOpenWorkspace
    ? say(isCurrentWorkspace ? 'item.currentWorkspace' : 'item.openWorkspace', { workspace: workspaceName })
    : undefined
  const workspaceText = h('span', {
    className: 'dsh-an-workspaceName',
    title: workspaceLabel ? undefined : workspaceName,
  }, workspaceName)
  const [pending, setPending] = React.useState('')
  const mountedRef = React.useRef(true)

  React.useEffect(() => {
    mountedRef.current = true
    return () => {
      mountedRef.current = false
    }
  }, [])

  const copy = async () => {
    if (pending) return
    setPending('copy')
    let ok = false
    try {
      ok = await copyText(item.text)
    } finally {
      if (mountedRef.current) setPending('')
    }
    if (!mountedRef.current) return
    // Settled outcome goes to the frame-wide toast, which outlives the panel.
    if (onToast) onToast(ok ? 'copied' : 'copyFailed')
  }

  return h(
    'li',
    {
      className: archived ? 'dsh-an-row dsh-an-rowArchived' : 'dsh-an-row',
      'data-row-id': item.id,
      'data-sortable': dragProps ? 'true' : undefined,
      ...dragProps,
    },
    workspaceName ? h('div', { className: 'dsh-an-rowWorkspace' },
      workspaceLabel ? withTooltip(workspaceLabel, h('button', {
        type: 'button',
        className: 'dsh-an-workspaceJump',
        'aria-label': workspaceLabel,
        'aria-current': isCurrentWorkspace ? 'location' : undefined,
        onClick: onOpenWorkspace,
      },
      h('span', { className: 'dsh-an-workspaceGlyph', 'aria-hidden': true }, isCurrentWorkspace ? '•' : '↗'),
      workspaceText,
      )) : workspaceText,
    ) : null,
    h('div', { className: 'dsh-an-leading' }, archived ? null : withTooltip(insertLabel, h(
      'button',
      {
        type: 'button',
        className: 'dsh-an-iconBtn dsh-an-insert',
        'aria-label': insertLabel,
        'aria-description': say('item.reorder'),
        'aria-keyshortcuts': 'ArrowUp ArrowDown',
        onKeyDown: onReorderKey,
        onClick: () => onInsert(item),
      },
      hasText ? h(IconInsert) : icon('IconArchiveOutlineRegular')
        ? h(Glyph, { name: 'IconArchiveOutlineRegular', size: 14 })
        : h('span', { 'aria-hidden': true }, '✓'),
    ))),
    h('div', { className: 'dsh-an-rowBody' },
      hasText ? h('div', { className: 'dsh-an-text' }, item.text) : null,
      h(AttachmentList, { attachments, say }),
    ),
    h(
      'div',
      { className: 'dsh-an-trail' },
      h('span', { className: 'dsh-an-meta', title: metaLabel(item, say, localeId) }, rowAge(item, say, localeId)),
      h(
        'div',
        { className: 'dsh-an-actions' },
        hasText ? withTooltip(say('item.copy'), h(
          'button',
          {
            type: 'button',
            className: 'dsh-an-iconBtn',
            'aria-label': say('item.copy'),
            'aria-busy': pending === 'copy' ? 'true' : 'false',
            'data-loading': pending === 'copy' ? 'true' : undefined,
            onClick: copy,
          },
          h(IconCopy, null),
        )) : null,
        // Rewind moves the note back to the panel's editor.
        withTooltip(say('item.recall'), h(
          'button',
          {
            type: 'button',
            className: 'dsh-an-iconBtn',
            'aria-label': say('item.recall'),
            onClick: () => onRecall(item),
          },
          h(IconRewind, null),
        )),
      ),
    ),
  )
}
