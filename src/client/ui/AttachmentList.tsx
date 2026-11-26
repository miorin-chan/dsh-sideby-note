/** @jsxRuntime classic */
import React from 'react'
import type { RenderFactorySlot } from '@deepseek-ai/dsh-client-ui-slots'
import type { MessageImageLoader } from '@deepseek-ai/dsh-client-ui-conversation/client'
import { attachedItems, type ComposerAttachmentItem } from '../storage/draftUploads'
import {
  FileTypeIcon,
  IconChevronLeftOutlineRegular,
  IconChevronRightOutlineRegular,
  IconCloseFillRegular,
  ImageLightbox,
  fileExtension,
  fileSizeText,
} from '@deepseek-ai/dsh-client-ui-primitives'
import { attachmentUrl, previewKind, readAttachment, type NoteAttachment } from '../domain/attachments'
import { Glyph, icon, withTooltip } from './primitives'

export const attachmentCSS = `
.dsh-an-railWrap{position:relative;min-width:0}
.dsh-an-rail{display:flex;align-items:stretch;gap:var(--an-space-2);overflow-x:auto;scrollbar-width:none;padding:2px 0}
.dsh-an-rail::-webkit-scrollbar{display:none}
.dsh-an-railItem{flex:none;max-width:100%}
.dsh-an-railScroll{position:absolute;top:50%;transform:translateY(-50%);z-index:2;display:grid;place-items:center;width:22px;height:22px;padding:0;border:0.5px solid var(--dsw-alias-border-l2);border-radius:var(--an-radius-pill);background:var(--dsw-alias-bg-layer-2);box-shadow:var(--dsw-elevation-panel);color:var(--dsw-alias-label-primary);cursor:pointer;transition:var(--an-transition)}
.dsh-an-railScrollLeft{left:2px}
.dsh-an-railScrollRight{right:2px}
.dsh-an-fileCard{position:relative;display:flex;align-items:center;gap:var(--an-space-2);box-sizing:border-box;min-width:0;max-width:100%;width:min(240px,100cqi);padding:6px var(--an-space-2);padding-inline-end:var(--an-space-6);border:0.5px solid var(--dsw-alias-border-l2);border-radius:var(--dsw-radius-md);background:var(--dsw-alias-bg-layer-1);overflow:hidden;vertical-align:top}
.dsh-an-fileCard[data-state='error']{border-color:var(--dsw-alias-state-error-primary)}
.dsh-an-fileCardIcon{display:grid;place-items:center;flex:none;width:24px;height:24px}
.dsh-an-fileCardBody{display:flex;flex-direction:column;min-width:0;flex:1 1 auto}
.dsh-an-fileCardName{min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;color:var(--dsw-alias-label-primary);font-size:var(--an-fs-caption);line-height:16px;font-weight:500}
.dsh-an-fileCardMeta{min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;color:var(--dsw-alias-label-secondary);font-size:11px;line-height:14px}
.dsh-an-fileCard[data-state='error'] .dsh-an-fileCardMeta{color:var(--dsw-alias-state-error-primary)}
.dsh-an-fileCardProgress{position:absolute;left:0;bottom:0;height:2px;background:var(--dsw-alias-state-business-primary);pointer-events:none}
.dsh-an-fileCardRetry,.dsh-an-fileCardRemove,.dsh-an-imageRemove{position:relative;z-index:1;display:grid;place-items:center;flex:none;width:18px;height:18px;padding:0;border:0;border-radius:var(--an-radius-pill);background:transparent;color:var(--dsw-alias-label-secondary);cursor:pointer;transition:var(--an-transition)}
.dsh-an-fileCardRemove{position:absolute;top:4px;inset-inline-end:4px;opacity:.75}
.dsh-an-imageItem{position:relative;width:52px;height:52px;border-radius:var(--dsw-radius-md);overflow:hidden;border:0.5px solid var(--dsw-alias-border-l2);background:var(--dsw-alias-bg-layer-1)}
.dsh-an-imageThumb{display:block;width:100%;height:100%;padding:0;border:0;background:transparent;cursor:pointer}
.dsh-an-imageThumb img{display:block;width:100%;height:100%;object-fit:cover}
.dsh-an-imageRemove{position:absolute;top:2px;inset-inline-end:2px;background:var(--dsw-alias-bg-layer-2);color:var(--dsw-alias-label-primary);opacity:.85}
.dsh-an-imageDownload.dsh-an-imageRemove{inset:auto 2px 2px auto;opacity:1;text-decoration:none}
.dsh-an-imageLoading{display:grid;place-items:center;cursor:default}
.dsh-an-railItem:has(>.dsh-an-imageFallback,>[data-upload-blocked]){height:auto}
.dsh-an-imageFallback{width:min(240px,100cqi)}
.dsh-an-attachment[data-remove-disabled] .dsh-an-fileCardRemove{display:none}
.dsh-an-attachment[data-previewable] > .dsh-an-fileCard{padding-inline-end:calc(var(--an-space-6) + var(--an-space-4))}
@media (hover:hover){
  .dsh-an-railScroll:hover,.dsh-an-fileCardRetry:hover{background:var(--an-hover)}
  .dsh-an-attachment:hover .dsh-an-fileCardRemove,.dsh-an-imageItem:hover .dsh-an-imageRemove{opacity:1}
}
.dsh-an-railScroll:focus-visible,.dsh-an-fileCardRetry:focus-visible,.dsh-an-fileCardRemove:focus-visible,.dsh-an-imageThumb:focus-visible,.dsh-an-imageRemove:focus-visible{outline:var(--dsw-focus-ring-width,2px) solid var(--dsw-focus-ring-color,var(--dsw-alias-state-business-primary));outline-offset:1px}
`

type PendingAttachment = Extract<ComposerAttachmentItem, { kind: 'upload' }>
type ReadyAttachment = Extract<ComposerAttachmentItem, { kind: 'attached' }>

interface AttachmentListProps {
  attachments: readonly NoteAttachment[]
  attachmentItems?: readonly ComposerAttachmentItem[]
  say: (key: string, vars?: Record<string, string>) => string
  renderFactorySlot?: RenderFactorySlot
  onRemove?: (index: number) => void
  onRemoveUpload?: (id: string) => void
  onRetryUpload?: (id: string) => void
  disabled?: boolean
}

function AttachmentRail<T extends { readonly id: string }>({
  items,
  renderItem,
  labels,
}: {
  items: readonly T[]
  renderItem: (item: T) => React.ReactNode
  labels: { group: string; scrollLeft: string; scrollRight: string }
}) {
  const railRef = React.useRef<HTMLDivElement>(null)
  const [scrollState, setScrollState] = React.useState({ left: false, right: false })

  const syncScroll = React.useCallback(() => {
    const el = railRef.current
    if (!el) return
    const left = el.scrollLeft > 1
    const right = el.scrollLeft + el.clientWidth < el.scrollWidth - 1
    setScrollState(prev => (prev.left === left && prev.right === right ? prev : { left, right }))
  }, [])

  React.useLayoutEffect(() => {
    syncScroll()
    const el = railRef.current
    if (!el || typeof ResizeObserver !== 'function') return
    const observer = new ResizeObserver(syncScroll)
    observer.observe(el)
    return () => observer.disconnect()
  }, [items.length, syncScroll])

  return (
    <div className="dsh-an-railWrap">
      <div ref={railRef} role="group" aria-label={labels.group} className="dsh-an-rail" onScroll={syncScroll}>
        {items.map(item => (
          <div key={item.id} className="dsh-an-railItem">{renderItem(item)}</div>
        ))}
      </div>
      {scrollState.left && (
        <button
          type="button"
          className="dsh-an-railScroll dsh-an-railScrollLeft"
          aria-label={labels.scrollLeft}
          onClick={() => railRef.current?.scrollBy({ left: -200, behavior: 'smooth' })}
        >
          <IconChevronLeftOutlineRegular size={12} />
        </button>
      )}
      {scrollState.right && (
        <button
          type="button"
          className="dsh-an-railScroll dsh-an-railScrollRight"
          aria-label={labels.scrollRight}
          onClick={() => railRef.current?.scrollBy({ left: 200, behavior: 'smooth' })}
        >
          <IconChevronRightOutlineRegular size={12} />
        </button>
      )}
    </div>
  )
}

function FileCard({
  name,
  bytes,
  state,
  progress,
  labels,
  onRemove,
  onRetry,
}: {
  name: string
  bytes: number
  state: 'ready' | 'uploading' | 'error'
  progress?: number
  labels: { label: string; remove: string; uploading: string; failed: string; retry: string }
  onRemove: () => void
  onRetry: () => void
}) {
  const ext = typeof fileExtension === 'function' ? fileExtension(name) : ''
  const sizeLabel = typeof fileSizeText === 'function' ? fileSizeText(bytes) : `${bytes} B`
  const meta = state === 'uploading'
    ? labels.uploading
    : state === 'error'
      ? labels.failed
      : [ext ? ext.toUpperCase() : '', sizeLabel].filter(Boolean).join(' · ')

  return (
    <div className="dsh-an-fileCard" data-state={state} aria-label={labels.label}>
      <span className="dsh-an-fileCardIcon" aria-hidden="true">
        <FileTypeIcon path={name} />
      </span>
      <div className="dsh-an-fileCardBody">
        <span className="dsh-an-fileCardName" title={name}>{name}</span>
        <span className="dsh-an-fileCardMeta">{meta}</span>
      </div>
      {state === 'error' && (
        <button type="button" className="dsh-an-fileCardRetry" aria-label={labels.retry} onClick={onRetry}>
          {icon('IconRefreshOutlineRegular') ? <Glyph name="IconRefreshOutlineRegular" size={12} /> : <span aria-hidden="true">↻</span>}
        </button>
      )}
      <button type="button" className="dsh-an-fileCardRemove" aria-label={labels.remove} onClick={onRemove}>
        <IconCloseFillRegular size={12} />
      </button>
      {state === 'uploading' && progress !== undefined && (
        <span className="dsh-an-fileCardProgress" style={{ width: `${Math.round(progress * 100)}%` }} />
      )}
    </div>
  )
}

// These are browser-owned previews. Note hashes never enter the message-image loader.
const loadMessageImage: MessageImageLoader = async () => { throw new Error('Expected a local preview') }

function useAttachmentPreview(attachment: NoteAttachment, enabled = true) {
  const { id: attachmentId, name, size, type } = attachment
  const [preview, setPreview] = React.useState<{ url?: string; failed?: boolean }>({})

  React.useEffect(() => {
    if (!enabled) return
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
  }, [attachmentId, name, size, type, enabled])

  return { ...preview, fail: () => setPreview({ failed: true }) }
}

function AttachmentPreview({ attachment, id, say }: Pick<AttachmentListProps, 'say'> & {
  attachment: NoteAttachment
  id: string
}) {
  const preview = useAttachmentPreview(attachment)
  const kind = previewKind(attachment.type)
  const { name } = attachment
  const { fail } = preview
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

function AttachmentImage({ attachment, say, renderFactorySlot, disabled, onRemove, fallback }: Pick<AttachmentListProps, 'say' | 'renderFactorySlot' | 'disabled'> & {
  attachment: NoteAttachment
  onRemove?: () => void
  fallback: React.ReactNode
}) {
  const { name } = attachment
  const itemRef = React.useRef<HTMLDivElement>(null)
  const triggerRef = React.useRef<HTMLButtonElement>(null)
  const [visible, setVisible] = React.useState(typeof IntersectionObserver === 'undefined')
  const [decoded, setDecoded] = React.useState(false)
  const [open, setOpen] = React.useState(false)
  const { url, failed, fail } = useAttachmentPreview(attachment, visible)
  React.useEffect(() => {
    if (visible || !itemRef.current) return
    const observer = new IntersectionObserver(entries => {
      if (!entries.some(entry => entry.isIntersecting)) return
      observer.disconnect()
      setVisible(true)
    })
    observer.observe(itemRef.current)
    return () => observer.disconnect()
  }, [visible])
  const previewLabel = say('attachment.preview', { name })
  const download = say('attachment.download', { name })

  if (failed) return (
    <div className="dsh-an-imageFallback">
      {fallback}
      <div className="dsh-an-attachmentStatus" role="status">{say('attachment.previewFailed')}</div>
    </div>
  )

  const thumbnail = <button ref={triggerRef} type="button"
    className={decoded ? 'dsh-an-imageThumb' : 'dsh-an-imageThumb dsh-an-imageLoading'}
    title={decoded ? previewLabel : name} aria-label={previewLabel} aria-haspopup="dialog"
    disabled={!decoded || !ImageLightbox} onClick={() => setOpen(true)}>
    {url ? <img src={url} alt="" onLoad={() => setDecoded(true)} />
      : <Glyph name="IconImageOutlineRegular" size={16} />}
  </button>
  const gallery = url && renderFactorySlot?.('conversation.images.content', {
    images: [{ preview: { url, name } }], loadImage: loadMessageImage, align: 'start', compact: true,
  }, { fallback: thumbnail })

  return (
    <div ref={itemRef} className="dsh-an-attachment dsh-an-imageItem" onErrorCapture={fail}>
      {gallery || thumbnail}
      {!url && <span className="dsh-an-srOnly" role="status">{say('attachment.loading')}</span>}
      {onRemove && (
        <button type="button" className="dsh-an-imageRemove" aria-label={say('attachment.remove', { name })}
          disabled={disabled} onClick={onRemove}>
          <IconCloseFillRegular size={12} />
        </button>
      )}
      {withTooltip(download, <a className="dsh-an-imageRemove dsh-an-imageDownload" aria-label={download}
        href={attachmentUrl(attachment)} download={name}>
        {icon('IconDownloadOutlineRegular') ? <Glyph name="IconDownloadOutlineRegular" size={12} /> : <span aria-hidden="true">↓</span>}
      </a>)}
      {open && url && <ImageLightbox src={url} alt={name} labels={{ dialog: previewLabel, close: say('attachment.closePreview') }}
        onClose={() => {
          setOpen(false)
          triggerRef.current?.focus()
        }} />}
    </div>
  )
}

export function AttachmentList({ attachments, attachmentItems, say, renderFactorySlot, onRemove, onRemoveUpload, onRetryUpload, disabled }: AttachmentListProps) {
  const [openKey, setOpenKey] = React.useState<string>()
  const previewId = React.useId()

  const entries = attachmentItems ?? attachedItems(attachments)
  const selected = entries.find((entry): entry is ReadyAttachment => entry.kind === 'attached' && entry.id === openKey)
  React.useEffect(() => {
    if (openKey && !selected) setOpenKey(undefined)
  }, [openKey, selected])

  if (!entries.length) return null
  const preview = selected && <AttachmentPreview key={selected.id} attachment={selected.attachment} id={previewId} say={say} />
  const renderCard = ({ attachment, id, index }: ReadyAttachment, previewUnavailable = false) => {
    const { name, size, type } = attachment
    const open = id === openKey
    const download = say('attachment.download', { name })
    const previewLabel = say('attachment.preview', { name })
    const canPreview = !previewUnavailable && previewKind(type) !== null
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
  const renderUpload = ({ id, name, size, status, loaded, total, error, retryable }: PendingAttachment) => {
    const uploading = status === 'uploading'
    const blocked = !uploading && !retryable
    const progress = uploading && total > 0 ? Math.min(1, loaded / total) : undefined
    const failure = error === 'attachmentDraftChanged' ? 'attachment.draftChanged'
      : error === 'attachmentLimit' ? 'attachment.limit'
        : error === 'saveFailed' ? 'toast.saveFailed' : 'attachment.uploadFailed'
    return (
      <div className="dsh-an-attachment" data-upload-blocked={blocked ? '' : undefined}>
        <FileCard name={name} bytes={size} state={uploading ? 'uploading' : blocked ? 'ready' : 'error'} progress={progress} labels={{
          label: name, remove: say('attachment.remove', { name }), uploading: say('attachment.uploading'),
          failed: say(failure), retry: say('attachment.retry', { name }),
        }} onRemove={() => onRemoveUpload?.(id)} onRetry={() => onRetryUpload?.(id)} />
        {blocked && <div className="dsh-an-attachmentStatus" role="status">{say(failure)}</div>}
        {uploading && <span className="dsh-an-srOnly" role="progressbar" aria-label={name}
          aria-valuenow={progress === undefined ? undefined : Math.round(progress * 100)} />}
      </div>
    )
  }
  const renderAttachment = (entry: typeof entries[number]) => {
    if (entry.kind === 'upload') return renderUpload(entry)
    return previewKind(entry.attachment.type) === 'img' && (renderFactorySlot || ImageLightbox)
      ? <AttachmentImage attachment={entry.attachment} say={say} renderFactorySlot={renderFactorySlot} disabled={disabled}
          onRemove={onRemove && (() => onRemove(entry.index))} fallback={renderCard(entry, true)} />
      : renderCard(entry)
  }
  return (
    <div className="dsh-an-attachments" data-draft={onRemove ? '' : undefined}>
      {onRemove ? <AttachmentRail items={entries} renderItem={renderAttachment} labels={{
        group: say('attachment.list'), scrollLeft: say('attachment.scrollLeft'), scrollRight: say('attachment.scrollRight'),
      }} /> : (
        <ul className="dsh-an-attachmentCards" aria-label={say('attachment.list')}>
          {entries.map(entry => <React.Fragment key={entry.id}>
            <li>{renderAttachment(entry)}</li>
            {selected === entry && <li className="dsh-an-attachmentPreviewRow">{preview}</li>}
          </React.Fragment>)}
        </ul>
      )}
      {onRemove && preview}
    </div>
  )
}
