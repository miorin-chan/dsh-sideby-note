/**
 * Host half of the Sideby Note panel.
 *
 * Two responsibilities live here, both impossible from the browser:
 * - install a newer build of this same plugin into the profile (the update
 *   endpoints), which the plugin market cannot do while this bundle is in use;
 * - own the durable note store through DSH's storage domain
 *   (`$DSH_HOME/storages/aside_note.json`) and serve it over authenticated
 *   routes, because browser code cannot reach host storage directly.
 *
 * The store route is registered even when storage is not mounted: it answers
 * 503 so the browser can tell "this host has no storage" apart from "this host
 * is too old to know the route" without guessing from the SPA fallback.
 */
import { registerAttachmentRoute } from './host/attachment-route.js'
import { registerUpdateRoutes } from './host/route.js'
import { createStore } from './host/store.js'
import { registerStoreRoutes } from './host/store-route.js'

/**
 * @param {import('@deepseek-ai/cordis').Context} ctx
 * @param {{ updateEnabled?: boolean } | undefined} config
 */
export function apply(ctx, config) {
  // Headless and ACP hosts can run without a web server.
  if (config?.updateEnabled !== false) {
    ctx.inject(['webServer'], hostCtx => {
      hostCtx.effect(() => {
        const dispose = registerUpdateRoutes(hostCtx.webServer, { ctx, config })
        return () => {
          if (typeof dispose === 'function') dispose()
        }
      }, 'dsh-sideby-note: update routes')
    })
  }

  // The store is lazy: `ctx.storageDomain` may never mount (custom profiles,
  // older hosts), and the route answers 503 in that case instead of failing
  // activation. Closing the domain belongs to the effect that opened it.
  ctx.inject(['webServer'], hostCtx => {
    hostCtx.effect(() => registerAttachmentRoute(hostCtx.webServer, hostCtx), 'dsh-sideby-note: attachments')
    hostCtx.effect(() => {
      const store = createStore(hostCtx)
      const dispose = registerStoreRoutes(hostCtx.webServer, { ctx: hostCtx, store })
      return async () => {
        if (typeof dispose === 'function') dispose()
        await store.close()
      }
    }, 'dsh-sideby-note: note store')
  })
}
