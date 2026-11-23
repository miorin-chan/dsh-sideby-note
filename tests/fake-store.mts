/**
 * In-memory stand-ins for the DSH storage domain, shared by host unit tests
 * and the host-mode bundle test.
 */
export function fakeDomain({ beforeWrite } = {}) {
  const tables = new Map()
  const state = { global: { version: 1 } }
  const table = name => {
    if (!tables.has(name)) tables.set(name, new Map())
    const map = tables.get(name)
    return {
      get: key => map.get(key),
      entries: () => map.entries(),
      keys: () => map.keys(),
      get size() {
        return map.size
      },
      async put(key, value) {
        await beforeWrite?.(name, 'put')
        map.set(key, structuredClone(value))
      },
      async delete(key) {
        return map.delete(key)
      },
      async deleteMany(keys) {
        await beforeWrite?.(name, 'deleteMany')
        return keys.reduce((count, key) => count + Number(map.delete(key)), 0)
      },
      async update(key, fn) {
        await beforeWrite?.(name, 'update')
        if (!map.has(key)) {
          const error = new Error(`missing key '${key}'`)
          error.code = 'missing-key'
          throw error
        }
        const next = fn(map.get(key))
        map.set(key, structuredClone(next))
        return next
      },
    }
  }
  return {
    table,
    global: {
      get: () => structuredClone(state.global),
      set: async value => {
        state.global = structuredClone(value)
      },
    },
    async close() {},
  }
}

export function fakeCtx(domain, workspaceRegistry) {
  return {
    get(name) {
      if (name === 'workspaceRegistry') return workspaceRegistry
      if (name === 'storageDomain') {
        return {
          async open() {
            if (!domain) throw Object.assign(new Error('backend broken'), { code: 'malformed-medium' })
            return domain
          },
        }
      }
      return undefined
    },
  }
}

/** Stand-in for the Host authority checks used by route fixtures. */
export function requestRejection(request) {
  return request.headers['sec-fetch-site'] === 'cross-site' ? 403 : undefined
}
