/**
 * Identity of the host-side note domain, kept free of the schema module so a
 * missing `zod` can only fail the storage endpoints, never plugin activation
 * or the update routes.
 */
/** Shared v1 storage domain and JSON filename used by AsideNote. */
export const DOMAIN_NAME = 'aside_note'
/** Domain format version; bump only with `compatibleVersions` per DSH docs. */
export const DOMAIN_VERSION = 1
/** Table names; each must match the backend's unit-name rule. */
export const TABLES = Object.freeze({
  sessions: 'sessions',
  workspaces: 'workspaces',
  forwarded: 'forwarded',
})
