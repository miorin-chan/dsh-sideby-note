/**
 * The v1 storage schema shared with AsideNote.
 *
 * `aside_note` is a `single`-layout domain: every list and preference lives in
 * `$DSH_HOME/storages/aside_note.json`, published atomically by the JSON
 * backend. The schema below is the durable boundary — the browser must reach
 * it only through the host route, never by writing the file itself.
 *
 * The spec is built locally instead of calling storage-domain's
 * `defineDomain`: `open()` consumes the plain object, and the same guards are
 * applied here so a misconfigured deployment still fails loud at startup.
 */
import { z } from 'zod'
import {
  MAX_SEEDED_SESSIONS,
  MAX_TEXT,
} from './normalize.js'
import { DOMAIN_NAME, DOMAIN_VERSION, TABLES } from './constants.js'

export { DOMAIN_NAME, DOMAIN_VERSION, TABLES }

const UNIT_NAME_RE = /^[a-z][a-z0-9_]*$/

export const noteSchema = z.object({
  id: z.string().min(1),
  text: z.string().min(1).max(MAX_TEXT),
  done: z.boolean(),
  createdAt: z.number(),
  updatedAt: z.number(),
  completedAt: z.number().optional(),
})

export const sessionSchema = z.object({
  sessionId: z.string().min(1).optional(),
  updatedAt: z.number(),
  items: z.array(noteSchema),
})

export const workspaceSchema = z.object({
  workspaceId: z.string().min(1).optional(),
  updatedAt: z.number(),
  items: z.array(noteSchema),
  seededSessionIds: z.array(z.string().min(1)).max(MAX_SEEDED_SESSIONS),
})

export const forwardedSchema = z.record(z.string().min(1), z.literal(true))

export const prefsSchema = z.object({
  version: z.literal(1).default(1),
  scopeMode: z.enum(['workspace', 'session']).optional(),
  // Preserve these upstream preferences across storage ownership changes.
  sendShortcut: z.enum(['enter', 'ctrl-enter']).optional(),
  forwardPrefix: z.string().max(80).optional(),
  migration: z.object({
    complete: z.boolean(),
    at: z.number(),
    source: z.string(),
  }).optional(),
})

/**
 * Build the domain spec handed to `ctx.storageDomain.open()`.
 * @returns the plain DomainSpec object.
 */
export function createSpec() {
  const spec = {
    name: DOMAIN_NAME,
    version: DOMAIN_VERSION,
    layout: 'single',
    tables: {
      [TABLES.sessions]: { valueSchema: sessionSchema },
      [TABLES.workspaces]: { valueSchema: workspaceSchema },
      [TABLES.forwarded]: { valueSchema: forwardedSchema },
    },
    global: { schema: prefsSchema, initial: { version: 1 } },
  }
  validateSpec(spec)
  return spec
}

/** Same loud failures `defineDomain` applies, minus the zod type machinery. */
function validateSpec(spec) {
  if (!UNIT_NAME_RE.test(spec.name)) {
    throw new Error(`domain name '${spec.name}' must match ${UNIT_NAME_RE}`)
  }
  if (!Number.isInteger(spec.version) || spec.version < 0) {
    throw new Error(`domain '${spec.name}' version must be a non-negative integer`)
  }
  if (spec.layout !== 'single') {
    throw new Error(`domain '${spec.name}' layout must be 'single'`)
  }
  for (const table of Object.keys(spec.tables)) {
    if (!UNIT_NAME_RE.test(table)) {
      throw new Error(`domain '${spec.name}' table name '${table}' must match ${UNIT_NAME_RE}`)
    }
  }
  if (spec.global && spec.global.schema.safeParse(null).success) {
    throw new Error(`domain '${spec.name}' global schema must not accept null`)
  }
}
