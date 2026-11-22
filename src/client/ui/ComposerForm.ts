/** The add form: one growing textarea and its submit button. */
import React from 'react'
import { MAX_TEXT } from '../constants'
import type { NoteAttachment } from '../domain/attachments'
import { AttachmentList } from './AttachmentList'
import { Glyph, icon, withTooltip } from './primitives'

const h = React.createElement

interface ComposerFormProps {
  say: (key: string, vars?: Record<string, string>) => string
  draft: string
  destination?: string
  destinationPending: boolean
  attachments: NoteAttachment[]
  draftLocked: boolean
  isSubmitting: boolean
  isRecalling: boolean
  isUploading: boolean
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
  onUnavailable: () => void
  onBusy: () => void
}

export function ComposerForm(props: ComposerFormProps) {
  const { say, draft, destination, destinationPending, attachments, draftLocked, isSubmitting, isRecalling, isUploading, canUpload, storageInUse, inputRef, onDraftChange, onCompositionStart, onCompositionEnd, onKeyDown, onSubmit, onFiles, onRemove, onUnavailable, onBusy } = props
  const pickerRef = React.useRef<HTMLInputElement>(null)
  const attachRef = React.useRef<HTMLButtonElement>(null)
  const dragDepth = React.useRef(0)
  const [dropping, setDropping] = React.useState(false)
  const busy = isSubmitting || isRecalling || isUploading
  const addLabel = say('add.action')
  const destinationId = React.useId()
  const attachLabel = say('attachment.add')
  const takeFiles = (files: File[]) => {
    if (!files.length) return
    if (!canUpload) onUnavailable()
    else if (busy) onBusy()
    else onFiles(files)
  }
  return h(
    'form',
    {
      className: 'dsh-an-add',
      'data-file-drag': dropping ? 'true' : undefined,
      'aria-busy': isUploading,
      onSubmit,
      onDragEnter: (event: React.DragEvent) => {
        if (!event.dataTransfer.types.includes('Files')) return
        event.preventDefault()
        dragDepth.current++
        setDropping(true)
      },
      onDragOver: (event: React.DragEvent) => {
        if (!event.dataTransfer.types.includes('Files')) return
        event.preventDefault()
        event.stopPropagation()
        event.dataTransfer.dropEffect = canUpload && !busy ? 'copy' : 'none'
      },
      onDragLeave: () => {
        dragDepth.current = Math.max(0, dragDepth.current - 1)
        if (!dragDepth.current) setDropping(false)
      },
      onDrop: (event: React.DragEvent) => {
        dragDepth.current = 0
        setDropping(false)
        if (!event.dataTransfer.types.includes('Files')) return
        event.preventDefault()
        event.stopPropagation()
        takeFiles(Array.from(event.dataTransfer.files))
      },
    },
    destination && h('div', { id: destinationId, className: 'dsh-an-destination' }, destination),
    h(AttachmentList, { attachments, say, onRemove: index => {
      if (document.activeElement?.closest('.dsh-an-attachment')) attachRef.current?.focus()
      onRemove(index)
    }, disabled: busy }),
    h('textarea', {
      ref: inputRef,
      className: 'dsh-an-input',
      value: draft,
      rows: 1,
      maxLength: MAX_TEXT,
      readOnly: draftLocked,
      placeholder: say('add.placeholder'),
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
      disabled: busy,
      onClick: () => canUpload ? pickerRef.current?.click() : onUnavailable(),
    }, icon('IconPaperclipOutlineRegular')
      ? h(Glyph, { name: 'IconPaperclipOutlineRegular', size: 16 })
      : h('span', { 'aria-hidden': true }, '+'))),
    withTooltip(addLabel, h(
      'button',
      {
        type: 'submit',
        className: 'dsh-an-addBtn',
        'aria-label': addLabel,
        disabled: destinationPending || storageInUse || busy || (!draft.trim() && !attachments.length),
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
    isUploading ? h('span', { className: 'dsh-an-attachmentStatus', role: 'status' }, say('attachment.uploading')) : null,
  )
}
