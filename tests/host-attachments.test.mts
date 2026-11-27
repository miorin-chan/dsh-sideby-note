import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { once } from 'node:events'
import { mkdtemp, readdir, readFile, rm, stat } from 'node:fs/promises'
import { createServer, request } from 'node:http'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import test from 'node:test'
import { apply } from '../index.js'
import { createStore } from '../host/store.js'
import { noteSchema } from '../host/store-spec.js'
import { fakeCtx, fakeDomain } from './fake-store.mts'

const endpoint = '/dsh-sideby-note/attachments'
const mime = 'application/octet-stream'
const limit = 25 * 1024 * 1024
const digest = bytes => createHash('sha256').update(bytes).digest('hex')

async function fixture(t, backend = 'json') {
  const root = await mkdtemp(join(tmpdir(), 'sideby-attachments-'))
  const jsonRoot = join(root, 'custom-store')
  const directory = join(jsonRoot, 'dsh-sideby-note-attachments')
  const routes = new Map()
  const effects = []
  const ctx = {
    inject(_deps, mount) { mount(ctx) },
    effect(factory) { effects.push(factory()) },
    webServer: {
      register(route) {
        assert.equal(route.kind, 'exact')
        routes.set(route.path, route.handler)
        return () => routes.delete(route.path)
      },
    },
    get(name) {
      if (name === 'connection') return {
        admit(req) {
          if (req.headers['sec-fetch-site'] === 'cross-site') return { rejection: 403 }
          return req.headers.cookie === 'session=fixture' ? { peer: {} } : { rejection: 401 }
        },
      }
      if (name === 'storage') return { backend: new Map([['json', { root: jsonRoot }]]) }
      if (name === 'storageDomain') return { config: { backend: 'default', routes: { aside_note: backend } } }
    },
  }
  apply(ctx, { updateEnabled: false })

  const pending = new Set()
  const server = createServer((req, res) => {
    const handler = routes.get(new URL(req.url, 'http://localhost').pathname)
    if (!handler) return res.writeHead(404).end()
    const handled = handler(req, res)
    pending.add(handled)
    handled.finally(() => pending.delete(handled)).catch(error => res.destroy(error))
  }).listen(0, '127.0.0.1')
  t.after(async () => {
    server.closeAllConnections()
    await new Promise((resolve, reject) => server.close(error => error ? reject(error) : resolve()))
    await Promise.allSettled(pending)
    await Promise.all(effects.map(dispose => dispose?.()))
    assert.equal(routes.has(endpoint), false, 'the host effect removes the route')
    await rm(root, { recursive: true, force: true })
  })
  await once(server, 'listening')
  const origin = `http://127.0.0.1:${server.address().port}`
  function get(id, name, headers = { cookie: 'session=fixture' }) {
    const query = new URLSearchParams({ id })
    if (name !== undefined) query.set('name', name)
    return fetch(`${origin}${endpoint}?${query}`, { headers })
  }
  function post(body, options = {}) {
    return fetch(`${origin}${endpoint}`, {
      method: 'POST',
      body,
      ...options,
      headers: { cookie: 'session=fixture', 'content-type': mime, ...options.headers },
    })
  }
  return { directory, get, post, origin, pending, server }
}

async function fileAppears(directory, predicate) {
  for (let attempt = 0; attempt < 200; attempt++) {
    const entries = await readdir(directory).catch(error => {
      if (error.code !== 'ENOENT') throw error
      return []
    })
    const match = entries.find(predicate)
    if (match) return match
    await new Promise(resolve => setTimeout(resolve, 5))
  }
  assert.fail(`waited for a streamed upload in ${directory}`)
}

async function expectJson(response, status, code) {
  assert.equal(response.status, status)
  const body = await response.json()
  assert.equal(body.ok, false)
  assert.equal(body.code, code)
}

test('宿主附件并发上传和重试按内容去重', async t => {
  const { directory, get, post, origin } = await fixture(t)
  const prefix = Buffer.from([0, 255, 2])
  const suffix = Buffer.from([65, 66, 67])
  const bytes = Buffer.concat([prefix, suffix])
  const id = digest(bytes)
  const headers = { cookie: 'session=fixture', 'content-type': mime }
  const first = request(origin + endpoint, { method: 'POST', headers })
  const response = once(first, 'response')
  t.after(() => first.destroy())
  first.write(prefix)
  await fileAppears(directory, name => name.startsWith('.upload-'))
  await expectJson(await get(id), 404, 'ATTACHMENT_NOT_FOUND')

  first.end(suffix)
  const competing = post(bytes)
  const [initial] = await response
  const chunks = []
  for await (const chunk of initial) chunks.push(chunk)
  assert.equal(initial.statusCode, 200)
  assert.deepEqual(JSON.parse(Buffer.concat(chunks)), { ok: true, id })
  for (const result of [await competing, await post(bytes)]) {
    assert.equal(result.status, 200)
    assert.deepEqual(await result.json(), { ok: true, id })
  }
  assert.deepEqual(await readdir(directory), [id])
  assert.deepEqual(await readFile(join(directory, id)), bytes)
  assert.equal((await fetch(`${origin}${endpoint}/other`)).status, 404)

  const download = await get(id, "../你好 '(()).pdf\r\n")
  assert.equal(download.status, 200)
  assert.equal(download.headers.get('content-type'), mime)
  assert.equal(download.headers.get('x-content-type-options'), 'nosniff')
  assert.equal(download.headers.get('content-disposition'),
    `attachment; filename="attachment"; filename*=UTF-8''.._%E4%BD%A0%E5%A5%BD%20%27%28%28%29%29.pdf__`)
  assert.deepEqual(Buffer.from(await download.arrayBuffer()), bytes)
  const noName = await get(id)
  assert.equal(noName.headers.get('content-disposition'), 'attachment')
  await noName.arrayBuffer()
})

test('宿主拒绝未授权请求和无效附件', async t => {
  const { directory, get, post, origin, pending } = await fixture(t)
  const bytes = Buffer.from([1])
  const id = digest(bytes)
  await expectJson(await post(bytes, { headers: { cookie: '' } }), 401, 'ATTACHMENT_FORBIDDEN')
  await expectJson(await post(bytes, { headers: { 'sec-fetch-site': 'cross-site' } }), 403, 'ATTACHMENT_FORBIDDEN')
  await expectJson(await post(bytes, { headers: { 'content-type': 'text/plain' } }), 415, 'ATTACHMENT_MEDIA_TYPE')
  await expectJson(await post(Buffer.alloc(0)), 400, 'ATTACHMENT_EMPTY')
  await expectJson(await get('../aside_note.json'), 400, 'ATTACHMENT_BAD_ID')
  await expectJson(await get(id.toUpperCase()), 400, 'ATTACHMENT_BAD_ID')
  await expectJson(await get(id, undefined, {}), 401, 'ATTACHMENT_FORBIDDEN')
  await assert.rejects(stat(directory), { code: 'ENOENT' })
  const unsupported = await fetch(`${origin}${endpoint}`, { method: 'PUT', headers: { cookie: 'session=fixture' } })
  assert.equal(unsupported.headers.get('allow'), 'GET, POST')
  await expectJson(unsupported, 405, 'METHOD_NOT_ALLOWED')
  await expectJson(await post(Buffer.alloc(limit + 1)), 413, 'ATTACHMENT_TOO_LARGE')

  const streamed = async function* () {
    yield Buffer.alloc(limit)
    yield bytes
  }
  await expectJson(await post(streamed(), { duplex: 'half' }), 413, 'ATTACHMENT_TOO_LARGE')
  assert.deepEqual(await readdir(directory), [])

  const interrupted = request(origin + endpoint, {
    method: 'POST', headers: { cookie: 'session=fixture', 'content-type': mime },
  })
  interrupted.on('error', () => {})
  t.after(() => interrupted.destroy())
  interrupted.write(bytes)
  await fileAppears(directory, name => name.startsWith('.upload-'))
  interrupted.destroy()
  await Promise.allSettled(pending)
  await expectJson(await get(id), 404, 'ATTACHMENT_NOT_FOUND')
  assert.deepEqual(await readdir(directory), [])

  for (const body of [bytes, Buffer.alloc(limit)]) {
    const uploaded = await post(body)
    assert.equal(uploaded.status, 200)
    const id = digest(body)
    assert.deepEqual(await uploaded.json(), { ok: true, id })
    assert.equal((await stat(join(directory, id))).size, body.length)
  }
  const unavailable = await fixture(t, 'memory')
  await expectJson(await unavailable.post(bytes), 503, 'ATTACHMENT_UNAVAILABLE')
  await assert.rejects(stat(unavailable.directory), { code: 'ENOENT' })
})

test('宿主清单兼容纯文本与仅附件便笺', async t => {
  const store = createStore(fakeCtx(fakeDomain()))
  t.after(() => store.close())
  const legacy = { id: 'old', text: 'Legacy note', done: false, createdAt: 1, updatedAt: 1 }
  const image = { id: digest('image'), name: 'x'.repeat(255), type: 'image/png', size: limit }
  const generic = { id: digest('generic'), name: 'file', type: '', size: 1 }
  const fileOnly = { ...legacy, id: 'files', text: '', attachments: [image, generic] }
  const invalid = [
    { ...image, name: 'x'.repeat(256) },
    { ...image, name: '' },
    { ...image, type: 'Image/png' },
    { ...image, type: 'text/plain; charset=utf8' },
    { ...image, type: `a/${'x'.repeat(126)}` },
    { ...image, size: 0 },
    { ...image, size: 1.5 },
    { ...image, size: limit + 1 },
    { ...image, id: image.id.toUpperCase() },
    { ...image, id: 'b'.repeat(63) },
  ]
  const ten = Array.from({ length: 10 }, (_, index) => ({ ...generic, name: `file-${index}` }))
  const maxed = { ...fileOnly, id: 'maxed', attachments: ten }
  assert.deepEqual(noteSchema.parse(legacy), legacy)
  assert.deepEqual(noteSchema.parse(fileOnly), fileOnly)
  assert.deepEqual(noteSchema.parse(maxed), maxed)
  assert.equal(noteSchema.safeParse({ ...legacy, text: '  ' }).success, false)
  assert.equal(noteSchema.safeParse({ ...fileOnly, attachments: [] }).success, false)
  assert.equal(noteSchema.safeParse({ ...fileOnly, attachments: [...ten, image] }).success, false)
  for (const attachment of invalid) {
    assert.equal(noteSchema.safeParse({ ...fileOnly, attachments: [attachment] }).success, false)
  }

  await store.apply({
    op: 'list.patch', kind: 'workspace', listKey: 'workspace',
    upserts: [
      { ...legacy, attachments: [] },
      { ...fileOnly, attachments: [invalid[0], ...fileOnly.attachments] },
      { ...maxed, attachments: [...ten, image] },
      { ...fileOnly, id: 'empty', attachments: invalid },
    ],
  })
  assert.deepEqual((await store.snapshot()).data.workspaces.workspace.items, [legacy, fileOnly, maxed])
})

test('store list.patch unlinks unreferenced attachment blobs while preserving shared and unattached files', async t => {
  const { mkdir, writeFile } = await import('node:fs/promises')
  const { tmpdir } = await import('node:os')
  const { join } = await import('node:path')
  const { createStore } = await import('../host/store.js')

  const root = await mkdtemp(join(tmpdir(), 'dsh-note-gc-'))
  t.after(() => rm(root, { recursive: true, force: true }))
  const sidecar = join(root, 'dsh-sideby-note-attachments')
  await mkdir(sidecar, { recursive: true })

  const idRemoved = 'a'.repeat(64)
  const idShared = 'b'.repeat(64)
  const idUnattached = 'c'.repeat(64)
  await Promise.all([
    writeFile(join(sidecar, idRemoved), 'removed'),
    writeFile(join(sidecar, idShared), 'shared'),
    writeFile(join(sidecar, idUnattached), 'unattached'),
  ])

  const domain = fakeDomain()
  const baseCtx = fakeCtx(domain)
  const ctx = {
    get(name: string) {
      if (name === 'storage') return { backend: new Map([['json', { root }]]) }
      if (name === 'storageDomain') {
        return {
          config: { backend: 'default', routes: { aside_note: 'json' } },
          open: () => (baseCtx.get('storageDomain') as { open: () => Promise<unknown> }).open(),
        }
      }
      return baseCtx.get(name)
    },
  }
  const store = createStore(ctx as never)
  t.after(() => store.close())

  const makeAttachment = (id: string) => ({ id, name: `${id.slice(0, 6)}.txt`, type: 'text/plain', size: 6 })
  const noteA = noteSchema.parse({
    id: 'note-a',
    text: 'first note',
    done: false,
    createdAt: 1,
    updatedAt: 1,
    attachments: [makeAttachment(idRemoved), makeAttachment(idShared)],
  })
  const noteB = noteSchema.parse({
    id: 'note-b',
    text: 'second note',
    done: false,
    createdAt: 1,
    updatedAt: 1,
    attachments: [makeAttachment(idShared)],
  })

  await store.apply({ op: 'list.patch', kind: 'workspace', listKey: 'workspace', upserts: [noteA, noteB] })
  assert.deepEqual((await readdir(sidecar)).sort(), [idRemoved, idShared, idUnattached])

  await store.apply({
    op: 'list.patch',
    kind: 'workspace',
    listKey: 'workspace',
    upserts: [{ ...noteA, updatedAt: 2, attachments: [] }],
  })
  assert.deepEqual((await readdir(sidecar)).sort(), [idShared, idUnattached])

  await store.apply({ op: 'list.patch', kind: 'workspace', listKey: 'workspace', deletes: [noteB.id] })
  assert.deepEqual((await readdir(sidecar)).sort(), [idUnattached])
})
