/**
 * The demo notes live in two places: `NOTES` in tools/screenshots/lib/notes.mts
 * drives the capture, and the table in docs/screenshot-sop.md documents it for
 * whoever reruns the flow. Keep them in lockstep so a copy edit cannot silently
 * ship screenshots whose text no longer matches the SOP.
 */
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'
import { runInNewContext } from 'node:vm'

import { NOTES, anchorExpression, clearStoresExpression, restoreStoresExpression } from '../tools/screenshots/lib/notes.mts'

const sop = readFileSync(new URL('../docs/screenshot-sop.md', import.meta.url), 'utf8')

/** Rows of the first markdown table whose header starts with 便笺. */
function sopNotes() {
  const lines = sop.split(/\r?\n/)
  const start = lines.findIndex(line => /^\s*\|\s*便笺\s*\|/.test(line))
  assert.notEqual(start, -1, 'docs/screenshot-sop.md no longer documents a 便笺 table')
  const rows = []
  for (const line of lines.slice(start + 1)) {
    if (!line.trim().startsWith('|')) break
    const cells = line.split('|').slice(1, -1).map(cell => cell.trim())
    if (cells.length < 3) continue
    if (cells.every(cell => /^:?-{3,}:?$/.test(cell))) continue
    rows.push({ text: cells[0], state: cells[1], when: cells[2] })
  }
  return rows
}

/** Same wording the panel uses for the anchored ages. */
function ago(ms) {
  const minutes = Math.round(ms / 60000)
  if (minutes < 60) return `${minutes} 分钟前`
  const hours = Math.round(minutes / 60)
  if (hours < 24) return `${hours} 小时前`
  return `${Math.round(hours / 24)} 天前`
}

function stamp(note) {
  const created = ago(note.age)
  if (!note.done) return created
  return `写于 ${created} · 归档于 ${ago(note.doneAge ?? note.age)}`
}

test('the SOP note table lists exactly the notes the capture types in', () => {
  const rows = sopNotes()
  assert.deepEqual(rows.map(row => row.text), NOTES.map(note => note.text))
  assert.deepEqual(rows.map(row => row.state), NOTES.map(note => (note.done ? '归档' : '待续')))
  assert.equal(new Set(NOTES.map(note => note.text)).size, NOTES.length, 'note texts must stay unique')
})

test('the SOP note ages match the anchored ages', () => {
  const rows = sopNotes()
  assert.deepEqual(rows.map(row => row.when), NOTES.map(stamp))
})

test('the serialized screenshot expressions anchor and restore demo notes in a separate JavaScript realm', async () => {
  const now = 2_000_000_000_000
  const item = { id: 'demo', text: NOTES[2].text, done: false, createdAt: now, updatedAt: now }
  const snapshot = { data: { sessions: {}, workspaces: { demo: { items: [item] } } } }
  const mutations = []
  const realm = {
    Date: { now: () => now },
    fetch: async (route, options) => {
      assert.equal(route, '/dsh-sideby-note/store')
      if (options.method === 'POST') mutations.push(JSON.parse(options.body))
      return { ok: true, json: async () => snapshot }
    },
  }
  const target = { op: 'list.patch', kind: 'workspace', listKey: 'demo' }

  assert.equal(await runInNewContext(anchorExpression(), realm), true)
  const saved = await runInNewContext(clearStoresExpression(), realm)
  assert.equal(await runInNewContext(restoreStoresExpression(saved), realm), true)
  assert.deepEqual(mutations, [
    {
      ...target,
      upserts: [{
        ...item, done: true, createdAt: now - NOTES[2].age,
        updatedAt: now - NOTES[2].doneAge, completedAt: now - NOTES[2].doneAge,
      }],
      order: ['demo'],
    },
    { ...target, deletes: ['demo'] },
    { ...target, upserts: [item], order: ['demo'] },
  ])
})
