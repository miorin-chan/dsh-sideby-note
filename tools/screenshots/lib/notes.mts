// The demo notes: the only source of truth for their copy, archive state and ages.
//
// bootstrap.mts types them into the panel and anchors their stamps; capture.mts
// re-anchors them right before each theme so the light and dark shots agree on
// the reported ages even when the two runs are minutes apart.
//
// The isolated screenshot profile uses the same host store as the panel.
import type { Note, SessionRecord, WorkspaceRecord } from '../../../host/store-spec.js'

const storePath = '/dsh-sideby-note/store'

interface DemoNote {
  text: string
  done: boolean
  age: number
  doneAge?: number
}

interface ListLocation {
  kind: 'session' | 'workspace'
  listKey: string
}

export interface DemoList extends ListLocation {
  items: Note[]
  order: string[]
}

interface DemoSnapshot {
  data: {
    sessions: Record<string, SessionRecord>
    workspaces: Record<string, WorkspaceRecord>
  }
}

interface ListChanges {
  upserts?: Note[]
  deletes?: string[]
  order?: string[]
}

type StoreAction = { action: 'anchor' | 'clear' } | { action: 'restore'; saved: DemoList[] }
type StoreOptions = StoreAction & { route: string; plan: DemoNote[] }

export const NOTES: DemoNote[] = [
  { text: '把发布说明里的截图换成新版面板', done: false, age: 46 * 60000 },
  { text: '核对暗色主题下的对比度', done: false, age: 12 * 60000 },
  { text: '确认 390px 视口下面板不溢出', done: true, age: 2 * 3600000, doneAge: 1 * 3600000 },
  { text: '补一条空状态说明文案', done: true, age: 26 * 3600000, doneAge: 20 * 60000 },
]

// This function also runs as a serialized expression in Chrome via CDP.
async function withDemoStore(options: StoreOptions) {
  const { route, plan, action } = options

  async function request(body?: { op: 'list.patch' } & ListLocation & ListChanges): Promise<unknown> {
    const response = await fetch(route, body === undefined ? {} : {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(body),
    })
    if (!response.ok) throw new Error(`Demo note store returned HTTP ${response.status}`)
    return response.json()
  }

  async function patch({ kind, listKey }: ListLocation, changes: ListChanges) {
    await request({ op: 'list.patch', kind, listKey, ...changes })
  }

  if (action === 'restore') {
    for (const entry of options.saved) await patch(entry, { upserts: entry.items, order: entry.order })
    return true
  }

  const { data } = await request() as DemoSnapshot
  const lists: DemoList[] = []
  for (const kind of ['session', 'workspace'] as const) {
    const table: Record<string, SessionRecord | WorkspaceRecord> = kind === 'session' ? data.sessions : data.workspaces
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
      // Only items selected from the plan above are included here.
      const note = plan.find(candidate => candidate.text === item.text)!
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

function storeExpression(action: StoreAction) {
  return `(${withDemoStore})(${JSON.stringify({ route: storePath, plan: NOTES, ...action })})`
}

export const anchorExpression = () => storeExpression({ action: 'anchor' })
export const clearStoresExpression = () => storeExpression({ action: 'clear' })
export const restoreStoresExpression = (saved: DemoList[]) => storeExpression({ action: 'restore', saved })
