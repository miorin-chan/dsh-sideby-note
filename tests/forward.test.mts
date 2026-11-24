import assert from 'node:assert/strict'
import test from 'node:test'
import { JSDOM } from 'jsdom'
import { appendToConversation, type ComposerInputSource } from '../src/client/domain/forward.ts'
import type { DraftAttachmentId, InputState } from '@deepseek-ai/dsh-client-ui-conversation/client'

class TestDataTransfer {
  files: File[] = []
  items = { add: (file: File) => this.files.push(file) }
  text = ''
  setData(_type: string, value: string) { this.text = value }
  getData(_type: string) { return this.text }
}

const originals = [
  { id: 'audio', name: 'recording.wav', type: 'audio/wav', size: 5 },
  { id: 'image', name: 'picture.png', type: 'image/png', size: 5 },
]
const filesAndText = { text: 'From the note', attachments: originals }
const id = (value: string) => value as DraftAttachmentId

function mount(t, draft = '', attachmentIds = ['existing'], textarea = false) {
  const { window } = new JSDOM(`<main data-conversation-session="session"><button>Note</button>${textarea
    ? '<textarea data-composer-input></textarea>'
    : '<div data-composer-input data-lexical-editor="true" contenteditable="true" role="textbox"></div>'}</main>`)
  class TestClipboardEvent extends window.Event {
    clipboardData: TestDataTransfer
    constructor(type: string, options: EventInit & { clipboardData: TestDataTransfer }) {
      super(type, options)
      this.clipboardData = options.clipboardData
    }
  }
  const originals = Object.getOwnPropertyDescriptors(globalThis)
  const globals = {
    document: window.document,
    HTMLElement: window.HTMLElement,
    HTMLTextAreaElement: window.HTMLTextAreaElement,
    Event: window.Event,
    DataTransfer: TestDataTransfer,
    ClipboardEvent: TestClipboardEvent,
  }
  for (const [name, value] of Object.entries(globals)) {
    Object.defineProperty(globalThis, name, { configurable: true, writable: true, value })
  }
  t.after(() => {
    window.close()
    for (const name of Object.keys(globals)) {
      if (originals[name]) Object.defineProperty(globalThis, name, originals[name])
      else Reflect.deleteProperty(globalThis, name)
    }
  })
  t.mock.method(globalThis, 'fetch', async (url: string) => {
    const { searchParams } = new URL(url, 'https://test.invalid')
    return new Response(searchParams.get('id') === 'audio' ? 'audio' : 'image')
  })

  const editor = window.document.querySelector('[data-composer-input]')
  editor.getBoundingClientRect = () => ({ width: 480, height: 64 })
  let snapshot: InputState = { draft, attachmentIds: attachmentIds.map(id), draftRev: 0, phase: 'plain', occurrences: [], queue: [] }
  const state = { getSnapshot: () => snapshot }
  const removed: DraftAttachmentId[] = []
  const removeAttachment = (value: DraftAttachmentId) => {
    removed.push(value)
    if (snapshot.phase === 'sending') return false
    snapshot = { ...snapshot, attachmentIds: snapshot.attachmentIds.filter(attachment => attachment !== value) }
    return true
  }
  const getInput = (): ComposerInputSource => ({ state, removeAttachment })
  const update = (change: Partial<InputState>) => { snapshot = { ...snapshot, ...change } }
  const updateDraft = (text: string) => {
    update({ draft: text, draftRev: snapshot.draftRev + 1 })
    editor.textContent = text
  }
  if (textarea) editor.value = draft
  else editor.textContent = draft
  window.document.querySelector('button').focus()

  const forward = (
    note = filesAndText as Parameters<typeof appendToConversation>[1],
    resolve: Parameters<typeof appendToConversation>[2] = getInput,
    signal = new AbortController().signal,
  ) => appendToConversation('session', note, resolve, signal)
  return { editor, forward, getInput, removed, state, update, updateDraft, window }
}

function onPaste(editor, handle: (transfer: TestDataTransfer) => void) {
  editor.addEventListener('paste', event => {
    event.preventDefault()
    handle(event.clipboardData)
  })
}

test('mixed forwarding keeps the old draft and adds the ordered original files before text', async t => {
  const chat = mount(t, 'existing\n')
  const oldText = chat.editor.firstChild
  chat.window.getSelection().setBaseAndExtent(oldText, 0, oldText, 3)
  const steps: string[] = []
  let files: File[] = []
  onPaste(chat.editor, transfer => {
    if (transfer.files.length) {
      steps.push('files')
      files = transfer.files
      chat.update({ attachmentIds: ['existing', 'first-new', 'second-new'].map(id) })
    } else {
      steps.push('text')
      const caret = chat.window.getSelection()
      assert.equal(caret.isCollapsed, true)
      assert.equal(caret.anchorOffset, 'existing\n'.length)
      queueMicrotask(() => chat.updateDraft('existing\n' + transfer.text))
    }
  })

  // A resolver can return a new wrapper every time. The store still owns one retained draft.
  assert.deepEqual(await chat.forward(), { status: 'inserted' })
  assert.deepEqual(steps, ['files', 'text'])
  assert.deepEqual(await Promise.all(files.map(async file => [file.name, file.type, await file.text()])), [
    ['recording.wav', 'audio/wav', 'audio'], ['picture.png', 'image/png', 'image'],
  ])
  assert.equal(chat.state.getSnapshot().draft, 'existing\nFrom the note')
  assert.deepEqual(chat.state.getSnapshot().attachmentIds, ['existing', 'first-new', 'second-new'])
  assert.equal(chat.window.document.activeElement, chat.editor)
  assert.deepEqual(chat.removed, [])
})

test('attachment admission refuses a short or duplicated delta and rolls back only new IDs', async t => {
  for (const [title, offered] of [
    ['short batch', ['existing', 'new']],
    ['duplicate IDs', ['existing', 'new', 'new']],
    ['old ID repeated as a new ID', ['existing', 'existing', 'new']],
  ] as const) {
    await t.test(title, async t => {
      const chat = mount(t, 'keep')
      onPaste(chat.editor, transfer => {
        assert.equal(transfer.text, '')
        chat.update({ attachmentIds: offered.map(id) })
      })
      const result = await chat.forward()
      if (title === 'old ID repeated as a new ID') {
        assert.equal(result.status, 'partial')
        assert.deepEqual(chat.state.getSnapshot().attachmentIds, ['existing', 'existing'])
      } else {
        assert.deepEqual(result, { status: 'attachmentInsertFailed' })
        assert.deepEqual(chat.state.getSnapshot().attachmentIds, ['existing'])
      }
      assert.equal(chat.state.getSnapshot().draft, 'keep')
      assert.deepEqual(chat.removed, ['new'])
    })
  }
})

test('an equal-length addition with a reordered prefix still rejects and reports the remaining change', async t => {
  const chat = mount(t, 'keep', ['old-a', 'old-b'])
  onPaste(chat.editor, transfer => {
    assert.equal(transfer.text, '')
    chat.update({ attachmentIds: ['old-b', 'old-a', 'new-a', 'new-b'].map(id) })
  })
  assert.deepEqual(await chat.forward(), {
    status: 'partial', cause: 'attachmentInsertFailed', state: chat.state,
    draftBefore: 'keep', draftChanged: false,
    attachmentIdsBefore: ['old-a', 'old-b'], attachmentListChanged: true, remainingAttachmentIds: [],
  })
  assert.deepEqual(chat.removed, ['new-a', 'new-b'])
  assert.deepEqual(chat.state.getSnapshot().attachmentIds, ['old-b', 'old-a'])
})

test('file intake preserves the text projection and never rolls back a later unrelated ID', async t => {
  const chat = mount(t, 'keep')
  onPaste(chat.editor, transfer => {
    assert.equal(transfer.text, '')
    chat.update({ attachmentIds: ['existing', 'new-a', 'new-b'].map(id) })
    queueMicrotask(() => {
      chat.update({ attachmentIds: [...chat.state.getSnapshot().attachmentIds, id('later')] })
      chat.updateDraft('keep added a reference')
    })
  })
  assert.deepEqual(await chat.forward(), {
    status: 'partial', cause: 'attachmentInsertFailed', state: chat.state,
    draftBefore: 'keep', draftChanged: true,
    attachmentIdsBefore: ['existing'], attachmentListChanged: true, remainingAttachmentIds: [],
  })
  assert.deepEqual(chat.removed, ['new-a', 'new-b'])
  assert.deepEqual(chat.state.getSnapshot().attachmentIds, ['existing', 'later'])
})

test('a consumed text paste without the expected projection rolls back admitted attachments', async t => {
  const chat = mount(t, 'keep')
  onPaste(chat.editor, transfer => {
    if (transfer.files.length) chat.update({ attachmentIds: ['existing', 'new-a', 'new-b'].map(id) })
  })
  assert.deepEqual(await chat.forward(), { status: 'insertFailed' })
  assert.deepEqual(chat.removed, ['new-a', 'new-b'])
  assert.equal(chat.state.getSnapshot().draft, 'keep')
  assert.deepEqual(chat.state.getSnapshot().attachmentIds, ['existing'])
})

test('a failed rollback carries the current draft receipt for recovery', async t => {
  const chat = mount(t, 'keep')
  onPaste(chat.editor, transfer => {
    if (transfer.files.length) chat.update({ attachmentIds: ['existing', 'new-a', 'new-b'].map(id) })
    else {
      chat.updateDraft('modified rather than appended')
      chat.update({ phase: 'sending' })
    }
  })
  assert.deepEqual(await chat.forward(), {
    status: 'partial', cause: 'insertFailed', state: chat.state,
    draftBefore: 'keep', draftChanged: true,
    attachmentIdsBefore: ['existing'], attachmentListChanged: true, remainingAttachmentIds: ['new-a', 'new-b'],
  })
  assert.deepEqual(chat.state.getSnapshot().attachmentIds, ['existing', 'new-a', 'new-b'])
})

test('a binding replacement or newly locked composer during file reads receives no paste', async t => {
  for (const change of ['replace the retained store', 'start composition', 'freeze the input', 'navigate and abort']) {
    await t.test(change, async t => {
      const chat = mount(t, 'keep')
      const started = Promise.withResolvers<void>()
      const response = Promise.withResolvers<Response>()
      t.mock.method(globalThis, 'fetch', () => { started.resolve(); return response.promise })
      const controller = new AbortController()
      let getInput = chat.getInput
      const next = chat.forward({ text: '', attachments: originals.slice(0, 1) }, () => getInput(), controller.signal)
      await started.promise
      if (change === 'replace the retained store') {
        getInput = () => ({ state: { getSnapshot: chat.state.getSnapshot } })
      } else if (change === 'start composition') {
        chat.editor.setAttribute('data-composer-composing', '')
      } else if (change === 'freeze the input') {
        chat.update({ phase: 'adjudicating' })
      } else {
        chat.editor.parentElement.setAttribute('data-conversation-session', 'other-session')
        controller.abort()
      }
      let pastes = 0
      onPaste(chat.editor, () => { pastes += 1 })
      response.resolve(new Response('audio'))
      assert.deepEqual(await next, { status: controller.signal.aborted ? 'cancelled' : 'insertFailed' })
      assert.equal(pastes, 0)
      assert.equal(chat.state.getSnapshot().draft, 'keep')
      assert.deepEqual(chat.state.getSnapshot().attachmentIds, ['existing'])
    })
  }
})

test('a note whose session link changes during attachment reads never pastes', async t => {
  const chat = mount(t, 'keep')
  const started = Promise.withResolvers<void>()
  const response = Promise.withResolvers<Response>()
  t.mock.method(globalThis, 'fetch', () => { started.resolve(); return response.promise })
  const note = { text: 'linked', attachments: originals.slice(0, 1), linkedSessionId: 'session' }
  let sameLink = true
  const signal = new AbortController().signal
  assert.deepEqual(await appendToConversation('other', note, chat.getInput, signal), { status: 'sessionMismatch' })
  const operation = appendToConversation('session', note, chat.getInput, signal, () => sameLink)
  await started.promise
  sameLink = false
  let pastes = 0
  onPaste(chat.editor, () => { pastes += 1 })
  response.resolve(new Response('audio'))
  assert.deepEqual(await operation, { status: 'sessionMismatch' })
  assert.equal(pastes, 0)
  assert.equal(chat.state.getSnapshot().draft, 'keep')
  assert.deepEqual(chat.state.getSnapshot().attachmentIds, ['existing'])

  chat.editor.parentElement.removeAttribute('data-conversation-session')
  assert.deepEqual(await appendToConversation('session', { text: 'linked', linkedSessionId: 'session' }, chat.getInput, signal),
    { status: 'insertFailed' }, 'never fall back to an unmarked editor for a linked note')
})

test('text uses native paste to preserve separators, references, and host placeholder sanitization', async t => {
  for (const [draft, separator] of [['old', '\n'], ['old\n', ''], [' \t', ''], ['', '']]) {
    await t.test(JSON.stringify(draft), async t => {
      const chat = mount(t, draft)
      if (draft === 'old') {
        chat.update({ occurrences: [{
          occurrenceId: 1, source: 'file', ref: 'old', label: 'old', offset: 0, length: 3, clipboardText: 'old',
        }] })
      }
      let pastes = 0
      onPaste(chat.editor, transfer => {
        pastes += 1
        assert.equal(transfer.text, `${separator}\uE100line 1\nline 2\uFFFC`)
        queueMicrotask(() => chat.updateDraft(`${draft}${separator}line 1\nline 2`))
      })
      assert.deepEqual(await chat.forward({ text: '\uFFFC\uE100' }), { status: 'insertFailed' })
      assert.equal(pastes, 0)
      assert.deepEqual(await chat.forward({ text: '\uE100line 1\nline 2\uFFFC' }), { status: 'inserted' })
      assert.equal(pastes, 1)
      assert.equal(chat.state.getSnapshot().draft, `${draft}${separator}line 1\nline 2`)
      assert.deepEqual(chat.state.getSnapshot().occurrences.map(ref => ref.occurrenceId), draft === 'old' ? [1] : [])
    })
  }
})

test('matching clipboard text cannot hide a lost structured reference', async t => {
  const chat = mount(t, 'old')
  chat.update({ occurrences: [{
    occurrenceId: 1, source: 'file', ref: 'old', label: 'old', offset: 0, length: 3, clipboardText: 'old',
  }] })
  onPaste(chat.editor, transfer => {
    chat.updateDraft('old' + transfer.text)
    chat.update({ occurrences: [] })
  })
  assert.deepEqual(await chat.forward({ text: 'new' }), {
    status: 'partial', cause: 'insertFailed', state: chat.state,
    draftBefore: 'old', draftChanged: true,
    attachmentIdsBefore: ['existing'], attachmentListChanged: false, remainingAttachmentIds: [],
  })
})

test('a recognized textarea still appends and focuses with no Session store', async t => {
  const chat = mount(t, 'old\n', [], true)
  const noStore = () => undefined
  let inputs = 0
  chat.editor.addEventListener('input', () => { inputs += 1 })
  assert.deepEqual(await chat.forward({ text: 'line 1\r\nline 2' }, noStore), { status: 'inserted' })
  assert.equal(inputs, 1)
  assert.equal(chat.editor.value, 'old\nline 1\nline 2')
  assert.equal(chat.editor.selectionStart, chat.editor.value.length)
  assert.equal(chat.window.document.activeElement, chat.editor)
})

test('a recognized contenteditable without native paste can use the legacy text fallback', async t => {
  const chat = mount(t, 'old')
  chat.editor.removeAttribute('data-lexical-editor')
  chat.window.document.execCommand = (command: string, _ui: boolean, text: string) => {
    assert.equal(command, 'insertText')
    chat.editor.textContent += text
    return true
  }
  assert.deepEqual(await chat.forward({ text: 'new' }, () => undefined), { status: 'inserted' })
  assert.equal(chat.editor.textContent, 'old\nnew')
})

test('different notes can target the same stable draft without interleaving paste verification', async t => {
  const chat = mount(t, '')
  onPaste(chat.editor, transfer => {
    const next = chat.state.getSnapshot().draft + transfer.text
    queueMicrotask(() => chat.updateDraft(next))
  })
  assert.deepEqual(await Promise.all([chat.forward({ text: 'one' }), chat.forward({ text: 'two' })]), [
    { status: 'inserted' }, { status: 'inserted' },
  ])
  assert.equal(chat.state.getSnapshot().draft, 'one\ntwo')
})
