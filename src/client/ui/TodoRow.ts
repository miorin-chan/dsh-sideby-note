/** A note with a leading insert action and a trailing cell for its age and secondary actions. */
import React from 'react'
import { copyText } from '../domain/clipboard'
import { metaLabel, rowAge } from '../domain/items'
import { AttachmentList } from './AttachmentList'
import { Glyph, IconCopy, IconInsert, IconRewind, Tooltip, icon, withTooltip } from './primitives'
import type { WorkspaceNote } from './useSessionMemoStore'

const h = React.createElement

interface TodoRowProps {
  item: WorkspaceNote
  archived: boolean
  insertPending: boolean
  retryArchive: boolean
  workspaceName?: string
  isCurrentWorkspace: boolean
  onOpenWorkspace?: React.MouseEventHandler<HTMLButtonElement>
  sessionLink?: { current: boolean; onOpen?: React.MouseEventHandler<HTMLButtonElement>; title?: string }
  onToggleSession?: () => void
  rowRef?: React.Ref<HTMLLIElement>
  highlighted?: boolean
  say: (key: string, vars?: Record<string, string>) => string
  renderFactorySlot?: React.ComponentProps<typeof AttachmentList>['renderFactorySlot']
  localeId: string
  onToast?: (kind: 'copied' | 'copyFailed') => void
  onInsert: (item: WorkspaceNote, trigger: HTMLButtonElement) => void | Promise<void>
  onRecall: (item: WorkspaceNote) => void | Promise<void>
  dragProps?: React.DOMAttributes<HTMLLIElement>
  onReorderKey?: React.KeyboardEventHandler<HTMLButtonElement>
}

export function TodoRow(props: TodoRowProps) {
  const {
    item, archived, insertPending, retryArchive, workspaceName, isCurrentWorkspace, onOpenWorkspace,
    sessionLink, onToggleSession, rowRef, highlighted,
    say, renderFactorySlot, localeId, onToast, onInsert, onRecall, dragProps, onReorderKey,
  } = props
  const attachments = item.attachments ?? []
  const hasText = Boolean(item.text)
  const insertLabel = say(retryArchive ? 'item.retryArchive' : 'item.insert')
  const linkedElsewhere = Boolean(sessionLink && !sessionLink.current)
  const insertDisabled = insertPending || linkedElsewhere
  const insertHint = linkedElsewhere ? say('toast.sessionMismatch') : undefined
  const reorderLabel = say('item.reorder')
  const sessionToggleLabel = onToggleSession ? say(sessionLink ? 'session.unbind' : 'session.bind') : undefined
  const openSessionLabel = sessionLink?.onOpen && !sessionLink.current ? say('session.open') : undefined
  const sessionTitle = sessionLink?.title
  const sessionText = sessionLink?.current ? say('session.current') : sessionTitle || openSessionLabel || say('session.linked')
  const sessionGlyph = () => h('span', { className: 'dsh-an-sessionGlyph', 'aria-hidden': true }, icon('IconLinkOutlineRegular')
    ? h(Glyph, { name: 'IconLinkOutlineRegular', size: 14 }) : '🔗')
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
      ref: rowRef,
      className: archived ? 'dsh-an-row dsh-an-rowArchived' : 'dsh-an-row',
      'data-row-id': item.id,
      'data-jump-highlight': highlighted ? '' : undefined,
      tabIndex: rowRef ? -1 : undefined,
      'data-sortable': dragProps ? 'true' : undefined,
      ...dragProps,
    },
    h('div', { className: 'dsh-an-leading' }, archived ? null : withTooltip(insertLabel + (insertHint ? ` — ${insertHint}` : ''), h(
      'button',
      {
        type: 'button',
        className: 'dsh-an-iconBtn dsh-an-insert',
        'aria-label': insertLabel,
        'aria-description': insertHint ? `${insertHint} ${reorderLabel}` : reorderLabel,
        'aria-keyshortcuts': 'ArrowUp ArrowDown',
        'aria-busy': insertPending || undefined,
        'aria-disabled': insertDisabled || undefined,
        'data-loading': insertPending ? 'true' : undefined,
        onKeyDown: onReorderKey,
        onClick: (event: React.MouseEvent<HTMLButtonElement>) => {
          if (!insertDisabled) void onInsert(item, event.currentTarget)
        },
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
    sessionLink && h('div', { className: 'dsh-an-rowSession' },
      openSessionLabel ? withTooltip(openSessionLabel, h('button', {
        type: 'button',
        className: 'dsh-an-sessionJump',
        'aria-label': sessionTitle ? `${openSessionLabel} — ${sessionTitle}` : openSessionLabel,
        title: Tooltip ? undefined : sessionTitle || openSessionLabel,
        onClick: sessionLink.onOpen,
      }, sessionGlyph(), h('span', { className: 'dsh-an-contextName' }, sessionText),
      h('span', { className: 'dsh-an-sessionGlyph', 'aria-hidden': true }, '↗')))
        : h('span', { className: 'dsh-an-sessionLabel', title: sessionTitle },
            sessionGlyph(), h('span', { className: 'dsh-an-contextName' }, sessionText)),
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
        sessionToggleLabel && withTooltip(sessionToggleLabel, h('button', {
          type: 'button',
          className: 'dsh-an-iconBtn dsh-an-sessionBinding',
          'aria-label': sessionToggleLabel,
          disabled: insertPending,
          onClick: onToggleSession,
        }, sessionGlyph())),
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
