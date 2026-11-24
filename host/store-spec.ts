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
import type { DomainGlobalSpec, DomainSpec, DomainTableSpec } from '@deepseek-ai/dsh-storage-domain'
import { z } from 'zod'
import {
  MAX_SEEDED_SESSIONS,
  MAX_TEXT,
} from './normalize.js'
import { DOMAIN_NAME, DOMAIN_VERSION, TABLES } from './constants.js'
import {
  ATTACHMENT_ID,
  ATTACHMENT_MIME,
  MAX_ATTACHMENTS,
  MAX_ATTACHMENT_MIME,
  MAX_ATTACHMENT_NAME,
  MAX_ATTACHMENT_BYTES,
} from './attachment-metadata.js'

export { DOMAIN_NAME, DOMAIN_VERSION, TABLES }

const UNIT_NAME_RE = /^[a-z][a-z0-9_]*$/

const attachmentSchema = z.object({
  id: z.string().regex(ATTACHMENT_ID),
  name: z.string().min(1).max(MAX_ATTACHMENT_NAME),
  type: z.string().max(MAX_ATTACHMENT_MIME).regex(ATTACHMENT_MIME),
  size: z.number().int().min(1).max(MAX_ATTACHMENT_BYTES),
})

export const noteSchema = z.object({
  id: z.string().min(1),
  text: z.string().max(MAX_TEXT),
  done: z.boolean(),
  createdAt: z.number(),
  updatedAt: z.number(),
  completedAt: z.number().optional(),
  attachments: z.array(attachmentSchema).max(MAX_ATTACHMENTS).optional(),
  linkedSessionId: z.string().regex(/\S/).optional(),
}).refine(note => note.text.trim().length > 0 || Boolean(note.attachments?.length), {
  path: ['text'],
  message: 'a note requires text or an attachment',
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
  sidebyNoteScopeMode: z.enum(['workspace', 'global']).optional(),
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

export type Note = z.infer<typeof noteSchema>
export type SessionRecord = z.infer<typeof sessionSchema>
export type WorkspaceRecord = z.infer<typeof workspaceSchema>
export type ForwardedRecord = z.infer<typeof forwardedSchema>
export type Prefs = z.infer<typeof prefsSchema>

// The Host domain types pin Zod 4.6.6 and this package uses 4.6.7 or newer.
// The domain reads schemas through parse and safeParse, which share the same contract.
function domainSchema<T>(schema: Pick<z.ZodType<T>, 'parse' | 'safeParse'>): DomainTableSpec<string, T>['valueSchema'] {
  return schema as unknown as DomainTableSpec<string, T>['valueSchema']
}

/** Build the domain spec handed to `ctx.storageDomain.open()`. */
export function createSpec() {
  const global: DomainGlobalSpec<Prefs> = { schema: domainSchema(prefsSchema), initial: { version: 1 } }
  const spec = {
    name: DOMAIN_NAME,
    version: DOMAIN_VERSION,
    layout: 'single',
    tables: {
      [TABLES.sessions]: { valueSchema: domainSchema(sessionSchema) },
      [TABLES.workspaces]: { valueSchema: domainSchema(workspaceSchema) },
      [TABLES.forwarded]: { valueSchema: domainSchema(forwardedSchema) },
    },
    global,
  } satisfies DomainSpec
  validateSpec(spec)
  return spec
}

/** Same loud failures `defineDomain` applies, minus the zod type machinery. */
function validateSpec(spec: DomainSpec): void {
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
