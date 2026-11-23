import assert from 'node:assert/strict'
import { registerHooks } from 'node:module'
import { extname } from 'node:path'
import test from 'node:test'
import { act, renderHook } from '@testing-library/react'
import { JSDOM } from 'jsdom'

// These source-level regressions run independently of the generated bundle.
const clientSource = new URL('../src/client/', import.meta.url).href
const resolver = registerHooks({
  resolve(specifier, context, next) {
    if (context.parentURL?.startsWith(clientSource)) {
      if (specifier === '@deepseek-ai/dsh-client-ui-primitives') {
        return next('data:text/javascript,export {}', context)
      }
      if (/^\.{1,2}\//.test(specifier) && !extname(specifier)) return next(`${specifier}.ts`, context)
    }
    return next(specifier, context)
  },
})
const { MAX_ATTACHMENT_BYTES } = await import('../src/client/domain/attachments.ts')
const { clearAddDraft, readScopeDrafts, saveAddDraft, subscribeDraftAttachments } = await import('../src/client/storage/drafts.ts')
const {
  acceptDraftUploadText, addDraftUploads, disposeDraftUploads, hasDraftUploads, readDraftUploadView,
  removeDraftAttachment, removeDraftUpload, retryDraftUpload,
} = await import('../src/client/storage/draftUploads.ts')
const { useComposerDraft } = await import('../src/client/ui/useComposerDraft.ts')
resolver.deregister()

const draftKey = 'ws:mine'
const hostId = (n: number) => n.toString(16).padStart(64, '0')
const file = (name: string) => new File(['original-bytes'], name, { type: 'text/plain' })
const view = (key = draftKey) => readDraftUploadView(key, readScopeDrafts(key))
const uploads = (key = draftKey) => view(key)?.items.filter(item => item.kind === 'upload') ?? []
const savedNames = (key = draftKey) => readScopeDrafts(key).attachments.map(attachment => attachment.name)
const settle = () => new Promise<void>(resolve => setImmediate(resolve))

function setup(t) {
  const { window } = new JSDOM('', { url: 'https://example.test/' })
  const requests: XMLHttpRequestMock[] = []
  class XMLHttpRequestMock {
    upload: { onprogress?: (event: Partial<ProgressEvent>) => void } = {}
    onload?: () => void
    onabort?: () => void
    status = 0
    responseText = ''
    aborted = false
    method = ''
    path = ''
    headers = new Map<string, string>()
    body?: File

    open(method: string, path: string) {
      this.method = method
      this.path = path
    }
    setRequestHeader(name: string, value: string) {
      this.headers.set(name, value)
    }
    send(body: File) {
      this.body = body
      requests.push(this)
    }
    abort() {
      this.aborted = true
      this.onabort?.()
    }
    progress(loaded: number, total?: number) {
      this.upload.onprogress?.({ loaded, total: total ?? 0, lengthComputable: total !== undefined })
    }
    succeed(id: string) {
      this.status = 200
      this.responseText = JSON.stringify({ ok: true, id })
      this.onload?.()
    }
    fail() {
      this.status = 502
      this.onload?.()
    }
  }
  Object.defineProperties(globalThis, {
    window: { value: window, configurable: true },
    document: { value: window.document, configurable: true },
    XMLHttpRequest: { value: XMLHttpRequestMock, configurable: true },
  })
  t.after(() => {
    disposeDraftUploads()
    window.close()
    delete globalThis.window
    delete globalThis.document
    delete globalThis.XMLHttpRequest
  })
  return { requests, window }
}

test('attachment limits reject the full invalid selection and count unresolved entries', t => {
  const { requests } = setup(t)
  const max = new File([new Uint8Array(MAX_ATTACHMENT_BYTES)], 'max-size.bin')
  const oversized = new File([max, new Uint8Array(1)], 'oversized.bin')
  const valid = file('valid.txt')
  assert.equal(addDraftUploads(draftKey, [valid, new File([], 'empty.txt')]), false)
  assert.equal(addDraftUploads(draftKey, [valid, oversized]), false)
  assert.equal(addDraftUploads(draftKey, Array<File>(11).fill(valid)), false)
  assert.equal(requests.length, 0)
  assert.equal(addDraftUploads(draftKey, [max, ...Array<File>(9).fill(valid)]), true)
  assert.equal(requests.length, 10)
  assert.equal(addDraftUploads(draftKey, [valid]), false)
  removeDraftUpload(draftKey, uploads()[0].id)
  assert.equal(requests[0].aborted, true)
  assert.equal(addDraftUploads(draftKey, [valid]), true)
  assert.equal(requests.length, 11)
})

test('independent successes are saved in selection order around failed and duplicate files', async t => {
  const { requests } = setup(t)
  const duplicate = file('duplicate.txt')
  const failed = file('failed.txt')
  const last = file('last.txt')
  const otherKey = 'ws:other'
  assert.equal(saveAddDraft(draftKey, 'draft text', [], 'recalled-owner'), true)
  assert.equal(addDraftUploads(draftKey, [duplicate, failed, duplicate, last]), true)
  assert.equal(requests[0].body, duplicate)
  assert.equal(requests[0].method, 'POST')
  assert.equal(requests[0].path, '/dsh-sideby-note/attachments')
  assert.equal(requests[0].headers.get('Content-Type'), 'application/octet-stream')
  const [firstCard, secondCard] = uploads()
  const changes: string[] = []
  const unsubscribe = subscribeDraftAttachments(key => changes.push(key))
  try {
    requests[0].progress(5)
    assert.equal(uploads()[0].loaded, 5)
    assert.equal(uploads()[0].total, null)
    requests[0].progress(9, duplicate.size)
    assert.deepEqual(uploads()[0], { ...firstCard, loaded: 9, total: duplicate.size })
    assert.equal(uploads()[1], secondCard)
    assert.deepEqual(changes, [draftKey, draftKey])
  } finally {
    unsubscribe()
  }

  // The original draft can settle while a different workspace is open.
  assert.equal(addDraftUploads(otherKey, [file('other.txt')]), true)
  requests[4].succeed(hostId(4))
  requests[3].succeed(hostId(3))
  requests[2].succeed(hostId(1))
  requests[1].fail()
  await settle()
  assert.deepEqual(savedNames(otherKey), ['other.txt'])
  assert.deepEqual(savedNames(), ['duplicate.txt', 'last.txt'])
  assert.equal(readScopeDrafts(draftKey).workspaceId, 'recalled-owner')
  assert.equal(readScopeDrafts(draftKey).add, 'draft text')
  assert.equal(hasDraftUploads(draftKey), true)

  // Reopening the composer uses the retained queue and latest persisted refs.
  const failedCard = uploads().find(item => item.status === 'failed')
  assert.equal(failedCard?.id, secondCard.id)
  assert.equal(failedCard?.error, 'attachmentUploadFailed')
  assert.equal(failedCard?.retryable, true)
  requests[0].succeed(hostId(1))
  await settle()
  assert.deepEqual(view()?.items.map(item => item.kind === 'upload' ? item.name : item.attachment.name),
    ['duplicate.txt', 'failed.txt', 'duplicate.txt', 'last.txt'])
  assert.deepEqual(savedNames(), ['duplicate.txt', 'duplicate.txt', 'last.txt'])
  retryDraftUpload(draftKey, secondCard.id)
  retryDraftUpload(draftKey, secondCard.id)
  assert.equal(requests.length, 6)
  assert.equal(requests[5].body, failed)
  requests[5].succeed(hostId(2))
  await settle()
  assert.equal(hasDraftUploads(draftKey), false)
  assert.deepEqual(readScopeDrafts(draftKey).attachments.map(attachment => attachment.id),
    [hostId(1), hostId(2), hostId(1), hostId(3)])
})

test('removing an upload ignores completion racing with cancellation and permits confirmed removal', async t => {
  const { requests } = setup(t)
  addDraftUploads(draftKey, [file('cancel.txt'), file('race.txt'), file('ready.txt'), file('still-pending.txt')])
  const [cancel, race, , stillPending] = uploads()
  const staleLoad = requests[0].onload
  removeDraftUpload(draftKey, cancel.id)
  assert.equal(requests[0].aborted, true)
  requests[0].succeed(hostId(1))
  staleLoad?.()
  requests[1].succeed(hostId(2))
  removeDraftUpload(draftKey, race.id)
  requests[2].succeed(hostId(3))
  await settle()
  assert.deepEqual(savedNames(), ['ready.txt'])
  assert.equal(removeDraftAttachment(draftKey, 0, readScopeDrafts(draftKey)), undefined)
  assert.deepEqual(savedNames(), [])
  assert.deepEqual(uploads().map(item => item.id), [stillPending.id])
  removeDraftUpload(draftKey, stillPending.id)
  assert.equal(requests[3].aborted, true)
  assert.equal(hasDraftUploads(draftKey), false)
})

test('cross-tab owner and draft changes guard delayed writes and retry reuses uploaded bytes', async t => {
  const { requests } = setup(t)
  const remote = { id: hostId(3), name: 'remote.txt', type: '', size: 5 }
  saveAddDraft(draftKey, 'original draft', [], 'old-owner')
  addDraftUploads(draftKey, [file('waiting.txt')])
  saveAddDraft(draftKey, 'other tab changed the draft', [remote], 'current-owner')
  requests[0].succeed(hostId(2))
  await settle()
  const [conflicted] = uploads()
  assert.equal(conflicted.error, 'attachmentDraftChanged')
  assert.deepEqual(readScopeDrafts(draftKey), {
    add: 'other tab changed the draft', attachments: [remote], workspaceId: 'current-owner',
  })
  retryDraftUpload(draftKey, conflicted.id)
  assert.equal(requests.length, 1)
  assert.deepEqual(savedNames(), ['remote.txt', 'waiting.txt'])
  assert.equal(readScopeDrafts(draftKey).workspaceId, 'current-owner')
  assert.equal(readScopeDrafts(draftKey).add, 'other tab changed the draft')
})

test('a local storage failure keeps the confirmed ref and typing preserves recalled ownership', async t => {
  const { requests, window } = setup(t)
  saveAddDraft(draftKey, 'draft text', [], 'recalled-owner')
  addDraftUploads(draftKey, [file('confirmed.txt')])
  // Clearing local text while the request is active may prune the saved record.
  clearAddDraft(draftKey)
  acceptDraftUploadText(draftKey, '', undefined)
  const fail = t.mock.method(window.Storage.prototype, 'setItem', () => { throw new Error('quota') })
  requests[0].succeed(hostId(1))
  await settle()
  assert.deepEqual(savedNames(), [])
  const [confirmed] = uploads()
  assert.equal(confirmed.error, 'saveFailed')
  assert.equal(view()?.workspaceId, 'recalled-owner')
  fail.mock.restore()
  retryDraftUpload(draftKey, confirmed.id)
  assert.equal(requests.length, 1)
  assert.equal(readScopeDrafts(draftKey).workspaceId, 'recalled-owner')
  assert.deepEqual(savedNames(), ['confirmed.txt'])
})

test('the hook blocks unfinished files and preserves cross-tab draft updates during submit', async t => {
  const { requests } = setup(t)
  const commit = Promise.withResolvers<boolean>()
  const submissions = []
  const original = { id: hostId(1), name: 'original.txt', type: '', size: 8 }
  const replacement = { id: hostId(2), name: 'replacement.txt', type: '', size: 11 }
  saveAddDraft(draftKey, 'held text', [original], 'original-owner')
  const { result, unmount } = renderHook(() => useComposerDraft({
    draftKey, workspaceId: 'mine', canUpload: true, storageInUse: false, focusOnMount: false,
    commit: (owner, update) => { submissions.push({ owner, notes: update([]) }); return commit.promise },
    report: () => {},
  }))
  try {
    act(() => result.current.addFiles([file('failed.txt')]))
    assert.equal(result.current.attachmentItems.at(-1)?.status, 'uploading')
    await act(async () => { requests[0].fail(); await settle() })
    assert.equal(result.current.attachmentItems.at(-1)?.status, 'failed')
    assert.equal(result.current.hasUnresolvedAttachments, true)
    await act(async () => { await result.current.add() })
    assert.equal(submissions.length, 0)
    const failed = result.current.attachmentItems.find(item => item.kind === 'upload')
    act(() => result.current.removeUpload(failed.id))
    assert.equal(result.current.hasUnresolvedAttachments, false)
    let submitting: Promise<void>
    act(() => { submitting = result.current.add() })
    assert.equal(submissions.length, 1)
    assert.equal(submissions[0].owner, 'original-owner')
    assert.deepEqual(submissions[0].notes[0].attachments, [original])
    act(() => { saveAddDraft(draftKey, 'held text', [replacement], 'replacement-owner') })
    await act(async () => { commit.resolve(true); await submitting })
    assert.deepEqual(readScopeDrafts(draftKey), {
      add: 'held text', attachments: [replacement], workspaceId: 'replacement-owner',
    })
    assert.deepEqual(result.current.draft, readScopeDrafts(draftKey))
  } finally {
    unmount()
  }
})

test('retry after local draft cleanup failure does not create a second note', async t => {
  setup(t)
  saveAddDraft(draftKey, 'already saved')
  let submissions = 0
  const { result, unmount } = renderHook(() => useComposerDraft({
    draftKey, workspaceId: 'mine', canUpload: true, storageInUse: false, focusOnMount: false,
    commit: async () => { submissions++; return true }, report: () => {},
  }))
  const fail = t.mock.method(window.Storage.prototype, 'setItem', () => { throw new Error('quota') })
  try {
    await act(async () => { await result.current.add() })
    assert.equal(submissions, 1)
    assert.equal(result.current.draft.add, 'already saved')
    fail.mock.restore()
    await act(async () => { await result.current.add() })
    assert.equal(submissions, 1)
    assert.equal(result.current.draft.add, '')
    assert.equal(readScopeDrafts(draftKey).add, '')
  } finally {
    unmount()
  }
})

test('a full reload drops the in-memory unresolved files and restores the settled refs', async t => {
  const { requests } = setup(t)
  addDraftUploads(draftKey, [file('failed.txt'), file('saved.txt'), file('active.txt')])
  requests[0].fail()
  requests[1].succeed(hostId(1))
  await settle()
  assert.equal(hasDraftUploads(draftKey), true)
  disposeDraftUploads()
  assert.equal(requests[2].aborted, true)
  assert.equal(view(), undefined)
  assert.deepEqual(savedNames(), ['saved.txt'])
})
