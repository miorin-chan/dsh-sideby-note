/** @jsxRuntime classic */
import React from 'react'
import { attachmentUrl, previewKind, readAttachment, type NoteAttachment } from '../domain/attachments'
import { Glyph, IconClose, icon, withTooltip } from './primitives'

interface AttachmentListProps {
  attachments: readonly NoteAttachment[]
  say: (key: string, vars?: Record<string, string>) => string
  onRemove?: (index: number) => void
  disabled?: boolean
}

function DownloadIcon() {
  return icon('IconDownloadOutlineRegular')
    ? <Glyph name="IconDownloadOutlineRegular" size={14} />
    : <span aria-hidden="true">↓</span>
}

function AttachmentEntry({ attachment, say, onRemove, disabled }: Omit<AttachmentListProps, 'attachments' | 'onRemove'> & {
  attachment: NoteAttachment
  onRemove?: () => void
}) {
  const kind = previewKind(attachment.type)
  const [open, setOpen] = React.useState(false)
  const [preview, setPreview] = React.useState<{ url?: string; failed?: boolean }>({})
  const previewId = React.useId()

  React.useEffect(() => {
    if (!open) return
    const controller = new AbortController()
    let url: string | undefined
    setPreview({})
    void readAttachment(attachment, controller.signal).then(blob => {
      if (controller.signal.aborted) return
      url = URL.createObjectURL(blob)
      setPreview({ url })
    }).catch(() => {
      if (!controller.signal.aborted) setPreview({ failed: true })
    })
    return () => {
      controller.abort()
      if (url) URL.revokeObjectURL(url)
    }
  }, [attachment.id, attachment.name, attachment.size, attachment.type, open])

  const download = say('attachment.download', { name: attachment.name })
  const remove = say('attachment.remove', { name: attachment.name })
  return (
    <li className="dsh-an-attachment">
      <div className="dsh-an-attachmentBar">
        {kind
          ? <button type="button" className="dsh-an-attachmentName" title={attachment.name}
              aria-expanded={open} aria-controls={open ? previewId : undefined}
              onClick={() => { setPreview({}); setOpen(!open) }}>{attachment.name}</button>
          : <span className="dsh-an-attachmentName" title={attachment.name}>{attachment.name}</span>}
        {withTooltip(download, <a className="dsh-an-iconBtn" href={attachmentUrl(attachment)}
          download={attachment.name} aria-label={download}><DownloadIcon /></a>)}
        {onRemove && withTooltip(remove, <button type="button" className="dsh-an-iconBtn" disabled={disabled}
          aria-label={remove} onClick={onRemove}><IconClose /></button>)}
      </div>
      {open && <div id={previewId} className="dsh-an-attachmentPreview">
        {preview.failed ? <span role="status">{say('attachment.previewFailed')}</span>
          : !preview.url ? <span role="status">{say('attachment.loading')}</span>
            : kind === 'img' ? <img src={preview.url} alt={attachment.name} onError={() => setPreview({ failed: true })} />
              : React.createElement(kind, {
                src: preview.url, controls: true, preload: 'metadata', 'aria-label': attachment.name,
                onError: () => setPreview({ failed: true }),
              })}
      </div>}
    </li>
  )
}

export function AttachmentList({ attachments, say, onRemove, disabled }: AttachmentListProps) {
  if (!attachments.length) return null
  return (
    <ul className="dsh-an-attachments" aria-label={say('attachment.list')}>
      {attachments.map((attachment, index) => <AttachmentEntry key={`${attachment.id}:${attachment.name}:${index}`}
        attachment={attachment} say={say} disabled={disabled}
        onRemove={onRemove && (() => onRemove(index))} />)}
    </ul>
  )
}
