// The demo notes: the only source of truth for their copy, archive state and ages.
//
// bootstrap.mjs types them into the panel and anchors their stamps; capture.mjs
// re-anchors them right before each theme so the light and dark shots agree on
// the reported ages even when the two runs are minutes apart.
//
// The isolated screenshot profile uses the same host store as the panel.
const storePath = '/dsh-sideby-note/store'

export const NOTES = [
  { text: '把发布说明里的截图换成新版面板', done: false, age: 46 * 60000 },
  { text: '核对暗色主题下的对比度', done: false, age: 12 * 60000 },
  { text: '确认 390px 视口下面板不溢出', done: true, age: 2 * 3600000, doneAge: 1 * 3600000 },
  { text: '补一条空状态说明文案', done: true, age: 26 * 3600000, doneAge: 20 * 60000 },
]

async function withDemoStore({ route, plan, action, saved }) {
  async function request(body) {
    const response = await fetch(route, body === undefined ? {} : {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(body),
    })
    if (!response.ok) throw new Error(`Demo note store returned HTTP ${response.status}`)
    return response.json()
  }

  async function patch({ kind, listKey }, changes) {
    await request({ op: 'list.patch', kind, listKey, ...changes })
  }

  if (action === 'restore') {
    for (const entry of saved) await patch(entry, { upserts: entry.items, order: entry.order })
    return true
  }

  const { data } = await request()
  const lists = []
  for (const kind of ['session', 'workspace']) {
    const table = kind === 'session' ? data.sessions : data.workspaces
    for (const [listKey, record] of Object.entries(table)) {
      const items = record.items.filter(item => plan.some(note => note.text === item.text))
      if (items.length) lists.push({ kind, listKey, items, order: record.items.map(item => item.id) })
    }
  }

  const now = Date.now()
  for (const entry of lists) {
    if (action === 'clear') {
      await patch(entry, { deletes: entry.items.map(item => item.id) })
      continue
    }
    const upserts = entry.items.map(item => {
      const note = plan.find(candidate => candidate.text === item.text)
      const updatedAt = now - (note.doneAge ?? note.age)
      const next = { ...item, done: note.done, createdAt: now - note.age, updatedAt }
      if (note.done) next.completedAt = updatedAt
      else delete next.completedAt
      return next
    })
    await patch(entry, { upserts, order: entry.order })
  }
  return action === 'clear' ? lists : lists.length > 0
}

function storeExpression(action, saved) {
  return `(${withDemoStore})(${JSON.stringify({ route: storePath, plan: NOTES, action, saved })})`
}

export const anchorExpression = () => storeExpression('anchor')
export const clearStoresExpression = () => storeExpression('clear')
export const restoreStoresExpression = saved => storeExpression('restore', saved)
