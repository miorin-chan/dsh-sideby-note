/** The add form: one growing textarea and its submit button. */
import React from 'react'
import type { FileDragService } from '@deepseek-ai/dsh-client-ui-file-drag/client'
import { MAX_TEXT } from '../constants'
import { AttachmentList } from './AttachmentList'
import { Glyph, SessionLinkGlyph, Tooltip, icon, withTooltip } from './primitives'

const h = React.createElement

interface ComposerFormProps {
  say: (key: string, vars?: Record<string, string>) => string
  draft: string
  placeholder: string
  destination?: { text: string; visible: boolean }
  destinationPending: boolean
  sessionBinding?: { linked: boolean; disabled: boolean; onToggle: React.MouseEventHandler<HTMLButtonElement>; title?: string }
  attachments: React.ComponentProps<typeof AttachmentList>['attachments']
  attachmentItems: React.ComponentProps<typeof AttachmentList>['attachmentItems']
  renderFactorySlot?: React.ComponentProps<typeof AttachmentList>['renderFactorySlot']
  readFileDrag: FileDragService['read']
  draftLocked: boolean
  isSubmitting: boolean
  isRecalling: boolean
  hasUnresolvedAttachments: boolean
  canUpload: boolean
  storageInUse: boolean
  inputRef: React.Ref<HTMLTextAreaElement>
  onDraftChange: React.ChangeEventHandler<HTMLTextAreaElement>
  onCompositionStart: React.CompositionEventHandler<HTMLTextAreaElement>
  onCompositionEnd: React.CompositionEventHandler<HTMLTextAreaElement>
  onKeyDown: React.KeyboardEventHandler<HTMLTextAreaElement>
  onSubmit: React.FormEventHandler<HTMLFormElement>
  onFiles: (files: File[]) => void
  onRemove: (index: number) => void
  onRemoveUpload: (id: string) => void
  onRetryUpload: (id: string) => void
  onReadFailed: () => void
  onUnavailable: () => void
  onBusy: () => void
}

// @deepseek-ai/dsh-util-file-drag 0.2.2-rc.5, src/index.ts, FILE_DRAG_TOKEN_TYPE (MIT).
const FILE_DRAG_TOKEN_TYPE = 'application/x-dsh-file'

export function ComposerForm(props: ComposerFormProps) {
  const {
    say, draft, placeholder, destination, destinationPending, sessionBinding, attachments, attachmentItems, renderFactorySlot,
    readFileDrag, draftLocked, isSubmitting, isRecalling, hasUnresolvedAttachments, canUpload, storageInUse,
    inputRef, onDraftChange, onCompositionStart, onCompositionEnd, onKeyDown, onSubmit,
    onFiles, onRemove, onRemoveUpload, onRetryUpload, onReadFailed, onUnavailable, onBusy,
  } = props
  const pickerRef = React.useRef<HTMLInputElement>(null)
  const attachRef = React.useRef<HTMLButtonElement>(null)
  const dragDepth = React.useRef(0)
  const [dropping, setDropping] = React.useState(false)
  const busy = isSubmitting || isRecalling
  const acceptsDrop = (transfer: DataTransfer) => transfer.types.includes('Files') || transfer.types.includes(FILE_DRAG_TOKEN_TYPE)
  const focusPickerFromCard = () => {
    if (document.activeElement?.closest('.dsh-an-attachment')) attachRef.current?.focus({ preventScroll: true })
  }
  const addLabel = say('add.action')
  const destinationId = React.useId()
  const attachLabel = say('attachment.add')
  const sessionAction = sessionBinding ? say(sessionBinding.linked ? 'session.unbind' : 'session.bind') : undefined
  const linkedTitle = sessionBinding?.linked ? sessionBinding.title : undefined
  const sessionHint = linkedTitle ? `${sessionAction} — ${linkedTitle}` : sessionAction
  const takeFiles = (files: File[]) => {
    if (!files.length) return
    if (!canUpload) onUnavailable()
    else if (busy || destinationPending) onBusy()
    else onFiles(files)
  }
  return h(
    'form',
    {
      className: 'dsh-an-add',
      'data-file-drag': dropping ? 'true' : undefined,
      onSubmit,
      onDragEnter: (event: React.DragEvent) => {
        if (!acceptsDrop(event.dataTransfer)) return
        event.preventDefault()
        event.stopPropagation()
        dragDepth.current++
        setDropping(canUpload && !busy && !destinationPending)
      },
      onDragOver: (event: React.DragEvent) => {
        if (!acceptsDrop(event.dataTransfer)) return
        event.preventDefault()
        event.stopPropagation()
        event.dataTransfer.dropEffect = canUpload && !busy && !destinationPending ? 'copy' : 'none'
      },
      onDragLeave: (event: React.DragEvent) => {
        if (!acceptsDrop(event.dataTransfer)) return
        event.stopPropagation()
        dragDepth.current = Math.max(0, dragDepth.current - 1)
        if (!dragDepth.current) setDropping(false)
      },
      onDrop: (event: React.DragEvent) => {
        dragDepth.current = 0
        setDropping(false)
        const transfer = event.dataTransfer
        if (!acceptsDrop(transfer)) return
        event.preventDefault()
        const nativeToken = transfer.types.includes(FILE_DRAG_TOKEN_TYPE)
        // OS file drops would also reach the main input. Web tokens are scoped
        // by the host to its own composer and bubble to its drag cleanup.
        if (!nativeToken) event.stopPropagation()
        const dropped = nativeToken ? readFileDrag(transfer) : undefined
        const files = dropped ? [dropped] : Array.from(transfer.files)
        if (!files.length) onReadFailed()
        else takeFiles(files)
      },
    },
    destination && h('div', {
      id: destinationId,
      className: destination.visible ? 'dsh-an-destination' : undefined,
      hidden: !destination.visible,
    }, destination.text),
    h(AttachmentList, {
      attachments, attachmentItems, say, renderFactorySlot, disabled: busy,
      onRemove: index => { focusPickerFromCard(); onRemove(index) },
      onRemoveUpload: id => { focusPickerFromCard(); onRemoveUpload(id) },
      onRetryUpload: id => {
        if (!canUpload) onUnavailable()
        else { focusPickerFromCard(); onRetryUpload(id) }
      },
    }),
    h('textarea', {
      ref: inputRef,
      className: 'dsh-an-input',
      value: draft,
      rows: 1,
      maxLength: MAX_TEXT,
      readOnly: draftLocked,
      placeholder,
      'aria-describedby': destination ? destinationId : undefined,
      'aria-label': say('add.placeholder'),
      onChange: onDraftChange,
      onCompositionStart,
      onCompositionEnd,
      onKeyDown,
      onPaste: (event: React.ClipboardEvent) => {
        const transfer = event.clipboardData
        const files = Array.from(transfer.files)
        if (!files.length) return
        event.stopPropagation()
        if (!transfer.getData('text/plain')) event.preventDefault()
        takeFiles(files)
      },
    }),
    h('input', {
      ref: pickerRef,
      type: 'file',
      hidden: true,
      multiple: true,
      onChange: (event: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(event.currentTarget.files ?? [])
        event.currentTarget.value = ''
        if (files.length) takeFiles(files)
      },
    }),
    h('div', { className: 'dsh-an-composerTools' },
    withTooltip(attachLabel, h('button', {
      type: 'button',
      ref: attachRef,
      className: 'dsh-an-attachBtn',
      'aria-label': attachLabel,
      disabled: busy || destinationPending,
      onClick: () => canUpload ? pickerRef.current?.click() : onUnavailable(),
    }, icon('IconPaperclipOutlineRegular')
      ? h(Glyph, { name: 'IconPaperclipOutlineRegular', size: 16 })
      : h('span', { 'aria-hidden': true }, '+'))),
    sessionBinding && withTooltip(sessionHint, h('button', {
      type: 'button',
      className: 'dsh-an-attachBtn dsh-an-sessionBinding',
      'aria-label': say('session.bind'),
      'aria-pressed': sessionBinding.linked,
      'data-linked': sessionBinding.linked,
      'aria-description': sessionBinding.linked ? sessionHint : undefined,
      title: Tooltip ? undefined : sessionHint,
      disabled: sessionBinding.disabled || busy || draftLocked || destinationPending || storageInUse,
      onClick: sessionBinding.onToggle,
    }, h(SessionLinkGlyph, { size: 16, slashed: !sessionBinding.linked }))),
    withTooltip(addLabel, h(
      'button',
      {
        type: 'submit',
        className: 'dsh-an-addBtn',
        'aria-label': addLabel,
        disabled: destinationPending || storageInUse || busy || hasUnresolvedAttachments || (!draft.trim() && !attachments.length),
      },
      h('svg', {
        width: 16,
        height: 16,
        viewBox: '0 0 16 16',
        fill: 'none',
        stroke: 'currentColor',
        strokeWidth: 1.5,
        strokeLinecap: 'round',
        strokeLinejoin: 'round',
        'aria-hidden': true,
      }, h('path', { d: 'M13 4v3a2 2 0 0 1-2 2H3m0 0 3-3m-3 3 3 3' })),
    )),
    ),
  )
}
