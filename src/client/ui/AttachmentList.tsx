/** @jsxRuntime classic */
import React from 'react'
// @deepseek-ai/dsh-client-ui-attachment 0.2.2-rc.5, src/AttachmentRail.tsx and
// src/FileCard.tsx, with their CSS Modules. Copyright (c) 2026 DeepSeek, MIT.
import { AttachmentRail } from '@deepseek-ai/dsh-client-ui-attachment/src/AttachmentRail.tsx'
import { FileCard } from '@deepseek-ai/dsh-client-ui-attachment/src/FileCard.tsx'
import { stylesheet as railCSS } from '@deepseek-ai/dsh-client-ui-attachment/src/AttachmentRail.module.css'
import cardClasses, { stylesheet as cardCSS } from '@deepseek-ai/dsh-client-ui-attachment/src/FileCard.module.css'
import { attachmentUrl, previewKind, readAttachment, type NoteAttachment } from '../domain/attachments'
import { Glyph, icon, withTooltip } from './primitives'

export const officialAttachmentCSS = `${railCSS}\n${cardCSS}
.dsh-an-attachment[data-remove-disabled] .${cardClasses.remove}{display:none}
.dsh-an-attachment > .${cardClasses.card}{max-width:100%;width:min(240px,100cqi);padding-inline-end:var(--an-space-6);vertical-align:top}
.dsh-an-attachment[data-previewable] > .${cardClasses.card}{padding-inline-end:calc(var(--an-space-6) + var(--an-space-4))}
@media (hover:hover){.dsh-an-attachment:hover .${cardClasses.remove}{opacity:1}}`

interface AttachmentListProps {
  attachments: readonly NoteAttachment[]
  say: (key: string, vars?: Record<string, string>) => string
  onRemove?: (index: number) => void
  disabled?: boolean
}

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
  const [openKey, setOpenKey] = React.useState<string>()
  const previewId = React.useId()

  // The same file can be added more than once. An unrelated removal should
  // preserve the remaining cards' keys and any open preview.
  const occurrences = new Map<string, number>()
  const entries = attachments.map((attachment, index) => {
    const identity = JSON.stringify([attachment.id, attachment.name, attachment.type, attachment.size])
    const occurrence = occurrences.get(identity) ?? 0
    occurrences.set(identity, occurrence + 1)
    return { attachment, id: `${identity}:${occurrence}`, index }
  })
  const selected = entries.find(entry => entry.id === openKey)
  React.useEffect(() => {
    if (openKey && !selected) setOpenKey(undefined)
  }, [openKey, selected])

  if (!entries.length) return null
  const preview = selected && <AttachmentPreview key={selected.id} attachment={selected.attachment} id={previewId} say={say} />
  const renderCard = ({ attachment, id, index }: typeof entries[number]) => {
    const { name, size, type } = attachment
    const open = id === openKey
    const download = say('attachment.download', { name })
    const previewLabel = say('attachment.preview', { name })
    const canPreview = previewKind(type) !== null
    return (
      <div className="dsh-an-attachment" data-previewable={canPreview ? '' : undefined}
        data-remove-disabled={!onRemove || disabled ? '' : undefined}>
        <FileCard name={name} bytes={size} state="ready" labels={{
          label: name, remove: say('attachment.remove', { name }), uploading: '', failed: '', retry: '',
        }} onRemove={() => {
          if (!onRemove || disabled) return
          if (open) setOpenKey(undefined)
          onRemove(index)
        }} onRetry={() => {}} />
        {canPreview && withTooltip(previewLabel, <button type="button" className="dsh-an-attachmentBody"
          aria-label={previewLabel} aria-expanded={open} aria-controls={open ? previewId : undefined}
          onClick={() => setOpenKey(open ? undefined : id)}>
          <span aria-hidden="true"><Glyph name="IconChevronRightOutlineRegular" size={12} /></span>
        </button>)}
        {withTooltip(download, <a className="dsh-an-iconBtn dsh-an-attachmentAction" href={attachmentUrl(attachment)}
          download={name} aria-label={download}>{icon('IconDownloadOutlineRegular')
            ? <Glyph name="IconDownloadOutlineRegular" size={14} /> : <span aria-hidden="true">↓</span>}</a>)}
      </div>
    )
  }
  return (
    <div className="dsh-an-attachments" data-draft={onRemove ? '' : undefined}>
      {onRemove ? <AttachmentRail items={entries} renderItem={renderCard} labels={{
        group: say('attachment.list'), scrollLeft: say('attachment.scrollLeft'), scrollRight: say('attachment.scrollRight'),
      }} /> : (
        <ul className="dsh-an-attachmentCards" aria-label={say('attachment.list')}>
          {entries.map(entry => <React.Fragment key={entry.id}>
            <li>{renderCard(entry)}</li>
            {selected === entry && <li className="dsh-an-attachmentPreviewRow">{preview}</li>}
          </React.Fragment>)}
        </ul>
      )}
      {onRemove && preview}
    </div>
  )
}
