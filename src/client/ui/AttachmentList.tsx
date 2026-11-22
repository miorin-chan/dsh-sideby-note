/** @jsxRuntime classic */
import React from 'react'
import { attachmentUrl, previewKind, readAttachment, type NoteAttachment } from '../domain/attachments'
import { Glyph, IconClose, PRIMITIVES, icon, withTooltip } from './primitives'

interface AttachmentListProps {
  attachments: readonly NoteAttachment[]
  say: (key: string, vars?: Record<string, string>) => string
  onRemove?: (index: number) => void
  disabled?: boolean
}

// Adapted from @deepseek-ai/dsh-client-ui-attachment 0.2.2-rc.5,
// src/FileCard.tsx (FileCard) and src/AttachmentRail.tsx (AttachmentRail).
// Copyright (c) 2026 DeepSeek, MIT. See LICENSE.
const FileTypeIcon = PRIMITIVES.FileTypeIcon as React.ComponentType<{ path: string }> | undefined
const fileExtension = PRIMITIVES.fileExtension as ((name: string) => string) | undefined
const fileSizeText = PRIMITIVES.fileSizeText as ((bytes: number) => string) | undefined

function AttachmentPreview({ attachment, id, say }: Pick<AttachmentListProps, 'say'> & {
  attachment: NoteAttachment
  id: string
}) {
  const { id: attachmentId, name, size, type } = attachment
  const [preview, setPreview] = React.useState<{ url?: string; failed?: boolean }>({})

  React.useEffect(() => {
    const controller = new AbortController()
    let url: string | undefined
    void readAttachment({ id: attachmentId, name, size, type }, controller.signal).then(blob => {
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
  }, [attachmentId, name, size, type])

  const kind = previewKind(type)
  const fail = () => setPreview({ failed: true })
  return (
    <div id={id} className="dsh-an-attachmentPreview">
      {preview.failed ? <span role="status">{say('attachment.previewFailed')}</span>
        : !preview.url ? <span role="status">{say('attachment.loading')}</span>
          : kind === 'img' ? <img src={preview.url} alt={name} onError={fail} />
            : kind && React.createElement(kind, {
              src: preview.url, controls: true, preload: 'metadata', 'aria-label': name, onError: fail,
            })}
    </div>
  )
}

export function AttachmentList({ attachments, say, onRemove, disabled }: AttachmentListProps) {
  const rail = React.useRef<HTMLUListElement>(null)
  const previousCount = React.useRef(attachments.length)
  const [openKey, setOpenKey] = React.useState<string>()
  const previewId = React.useId()
  const count = attachments.length
  React.useLayoutEffect(() => {
    if (onRemove && count > previousCount.current && rail.current) {
      rail.current.scrollLeft = rail.current.scrollWidth - rail.current.clientWidth
    }
    previousCount.current = count
  }, [count, onRemove])

  // The same file can be added more than once. An unrelated removal should
  // preserve the remaining cards' keys and any open preview.
  const occurrences = new Map<string, number>()
  const entries = attachments.map(attachment => {
    const identity = JSON.stringify([attachment.id, attachment.name, attachment.type, attachment.size])
    const occurrence = occurrences.get(identity) ?? 0
    occurrences.set(identity, occurrence + 1)
    return { attachment, key: `${identity}:${occurrence}` }
  })
  const selected = entries.find(entry => entry.key === openKey)
  React.useEffect(() => {
    if (openKey && !selected) setOpenKey(undefined)
  }, [openKey, selected])

  if (!count) return null
  const preview = selected && <AttachmentPreview key={selected.key} attachment={selected.attachment} id={previewId} say={say} />
  return (
    <div className="dsh-an-attachments" data-draft={onRemove ? '' : undefined}>
      <ul ref={rail} className="dsh-an-attachmentCards" aria-label={say('attachment.list')}
        tabIndex={onRemove && count > 1 ? 0 : undefined}>
        {entries.map(({ attachment, key }, index) => {
          const { name, size, type } = attachment
          const open = key === openKey
          const meta = [fileExtension?.(name).toUpperCase().slice(0, 8), fileSizeText?.(size)].filter(Boolean).join(' ')
          const download = say('attachment.download', { name })
          const remove = say('attachment.remove', { name })
          const body = <span className="dsh-an-attachmentText">
            <span className="dsh-an-attachmentName">{name}</span>
            {meta && <span className="dsh-an-attachmentMeta">{meta}</span>}
          </span>
          return (
            <React.Fragment key={key}>
              <li className="dsh-an-attachment" title={name}>
                <span className="dsh-an-attachmentIcon" aria-hidden="true">
                  {FileTypeIcon ? <FileTypeIcon path={name} /> : <Glyph name="IconPaperclipOutlineRegular" size={18} />}
                </span>
                {previewKind(type)
                  ? <button type="button" className="dsh-an-attachmentBody" aria-expanded={open}
                      aria-controls={open ? previewId : undefined} onClick={() => setOpenKey(open ? undefined : key)}>
                      {body}<span className="dsh-an-attachmentDisclosure" aria-hidden="true"><Glyph name="IconChevronRightOutlineRegular" size={12} /></span>
                    </button>
                  : <span className="dsh-an-attachmentBody">{body}</span>}
                {withTooltip(download, <a className="dsh-an-iconBtn dsh-an-attachmentAction" href={attachmentUrl(attachment)}
                  download={name} aria-label={download}>{icon('IconDownloadOutlineRegular')
                    ? <Glyph name="IconDownloadOutlineRegular" size={14} /> : <span aria-hidden="true">↓</span>}</a>)}
                {onRemove && withTooltip(remove, <button type="button" className="dsh-an-iconBtn dsh-an-attachmentAction"
                  disabled={disabled} aria-label={remove} onClick={() => {
                    if (open) setOpenKey(undefined)
                    onRemove(index)
                  }}><IconClose /></button>)}
              </li>
              {!onRemove && open && <li className="dsh-an-attachmentPreviewRow">{preview}</li>}
            </React.Fragment>
          )
        })}
      </ul>
      {onRemove && preview}
    </div>
  )
}
