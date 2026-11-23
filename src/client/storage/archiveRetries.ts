const RETRIES_KEY = 'dsh.aside-note.archive-retries'

/** Archive receipts live in this tab alongside the session draft handoff. */
function readRetries(): Set<string> {
  try {
    const value: unknown = JSON.parse(window.sessionStorage.getItem(RETRIES_KEY) ?? '[]')
    if (Array.isArray(value)) return new Set(value.filter((entry): entry is string => typeof entry === 'string'))
  } catch { /* The current page can still retry when tab storage is unavailable. */ }
  return new Set()
}

const retries = readRetries()

export const hasArchiveRetry = (key: string) => retries.has(key)

export function setArchiveRetry(key: string, retry: boolean) {
  if (retry) retries.add(key)
  else retries.delete(key)
  try {
    if (retries.size) window.sessionStorage.setItem(RETRIES_KEY, JSON.stringify([...retries]))
    else window.sessionStorage.removeItem(RETRIES_KEY)
  } catch { /* Keep the receipt in memory for this page. */ }
}
