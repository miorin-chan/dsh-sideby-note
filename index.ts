/**
 * Host half of the Sideby Note panel.
 *
 * Owns the durable note store through DSH's storage domain
 * (`$DSH_HOME/storages/aside_note.json`) and serves notes and attachments over
 * authenticated routes, because browser code cannot reach host storage directly.
 *
 * The store route is registered even when storage is not mounted: it answers
 * 503 so the browser can tell "this host has no storage" apart from "this host
 * is too old to know the route" without guessing from the SPA fallback.
 */
import type { Context } from '@deepseek-ai/cordis'
import { registerAttachmentRoute } from './host/attachment-route.js'
import { createStore } from './host/store.js'
import { registerStoreRoutes } from './host/store-route.js'

export function apply(ctx: Context): void {
  // The store is lazy: `ctx.storageDomain` may never mount (custom profiles,
  // older hosts), and the route answers 503 in that case instead of failing
  // activation. Closing the domain belongs to the effect that opened it.
  ctx.inject(['webServer'], hostCtx => {
    hostCtx.effect(() => {
      const dispose = registerAttachmentRoute(hostCtx.webServer, hostCtx)
      return () => {
        if (typeof dispose === 'function') dispose()
      }
    }, 'dsh-sideby-note: attachments')
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
