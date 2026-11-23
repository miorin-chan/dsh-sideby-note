/** A note with a leading insert action and a trailing cell for its age and secondary actions. */
import React from 'react'
import { copyText } from '../domain/clipboard'
import { metaLabel, rowAge } from '../domain/items'
import { AttachmentList } from './AttachmentList'
import { Glyph, IconCopy, IconInsert, IconRewind, Tooltip, withTooltip } from './primitives'

const h = React.createElement

export function TodoRow(props) {
  const {
    item, archived, insertPending, retryArchive, workspaceName, isCurrentWorkspace, onOpenWorkspace,
    say, renderFactorySlot, localeId, onToast, onInsert, onRecall, dragProps, onReorderKey,
  } = props
  const attachments = item.attachments ?? []
  const hasText = Boolean(item.text)
  const insertLabel = say(retryArchive ? 'item.retryArchive' : 'item.insert')
  const workspaceLabel = onOpenWorkspace
    ? say(isCurrentWorkspace ? 'item.currentWorkspace' : 'item.openWorkspace', { workspace: workspaceName })
    : undefined
  const workspaceText = h('span', {
    className: 'dsh-an-workspaceName',
    title: workspaceLabel ? undefined : workspaceName,
  }, workspaceName)
  const [copying, setCopying] = React.useState(false)
  const mountedRef = React.useRef(true)

  React.useEffect(() => {
    mountedRef.current = true
    return () => {
      mountedRef.current = false
    }
  }, [])

  const copy = async () => {
    if (copying) return
    setCopying(true)
    let ok = false
    try {
      ok = await copyText(item.text)
    } finally {
      if (mountedRef.current) setCopying(false)
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
    h('div', { className: 'dsh-an-leading' }, archived ? null : withTooltip(insertLabel, h(
      'button',
      {
        type: 'button',
        className: 'dsh-an-iconBtn dsh-an-insert',
        'aria-label': insertLabel,
        'aria-description': say('item.reorder'),
        'aria-keyshortcuts': 'ArrowUp ArrowDown',
        'aria-busy': insertPending || undefined,
        'aria-disabled': insertPending || undefined,
        'data-loading': insertPending ? 'true' : undefined,
        onKeyDown: onReorderKey,
        onClick: (event: React.MouseEvent<HTMLButtonElement>) => { void onInsert(item, event.currentTarget) },
      },
      retryArchive ? h(Glyph, { name: 'IconRefreshOutlineRegular', size: 14 }) : h(IconInsert),
    ))),
    h('div', { className: 'dsh-an-rowBody' },
      hasText ? h('div', { className: 'dsh-an-text' }, item.text) : null,
      h(AttachmentList, { attachments, say, renderFactorySlot }),
    ),
    workspaceName && h('div', { className: 'dsh-an-rowWorkspace' },
      workspaceLabel ? withTooltip(workspaceLabel, h('button', {
        type: 'button',
        className: 'dsh-an-workspaceJump',
        'aria-label': workspaceLabel,
        'aria-current': isCurrentWorkspace ? 'location' : undefined,
        title: Tooltip ? undefined : workspaceLabel,
        onClick: onOpenWorkspace,
      },
      h('span', { className: 'dsh-an-workspaceGlyph', 'aria-hidden': true }, isCurrentWorkspace ? '•' : '↗'),
      workspaceText,
      )) : workspaceText,
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
            'aria-busy': copying,
            'data-loading': copying ? 'true' : undefined,
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
            'aria-disabled': insertPending || undefined,
            onClick: () => onRecall(item),
          },
          h(IconRewind, null),
        )),
      ),
    ),
  )
}
