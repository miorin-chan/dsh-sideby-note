/** Read an opaque session id without coercing, trimming or resolving it. */
export function normalizeLinkedSessionId(value: unknown): string | undefined {
  return typeof value === 'string' && value.trim() ? value : undefined
}

/** Stable ids for notes and drafts. */
export function uid() {
  try {
    if (globalThis.crypto && typeof globalThis.crypto.randomUUID === 'function') {
      return globalThis.crypto.randomUUID()
    }
  } catch {
    /* fall through */
  }
  return `todo-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 9)}`
}
