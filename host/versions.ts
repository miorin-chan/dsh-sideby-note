/**
 * Version comparison for the host-side update path.
 *
 * The panel asks npm for a published version and compares it with what is on
 * disk before offering anything. A string sort would order `1.10.0` below
 * `1.9.0`, and a prerelease must rank below the release it leads to, so the
 * comparison lives here and is tested on its own.
 */

/** Split a version into its numeric parts and prerelease identifiers. */
export function parseSemver(value: unknown) {
  if (typeof value !== 'string') return undefined
  const match = /^v?(\d+)\.(\d+)\.(\d+)(?:-([0-9A-Za-z.-]+))?(?:\+[0-9A-Za-z.-]+)?$/.exec(value.trim())
  if (match === null) return undefined
  return {
    major: Number(match[1]),
    minor: Number(match[2]),
    patch: Number(match[3]),
    prerelease: match[4] === undefined ? [] : match[4].split('.'),
  }
}

/**
 * Order two versions. An unparsable version sorts below a parsable one, which
 * keeps a malformed registry answer from ever reading as "newer".
 */
export function compareVersions(a: unknown, b: unknown): number {
  const left = parseSemver(a)
  const right = parseSemver(b)
  if (left === undefined && right === undefined) return 0
  if (left === undefined) return -1
  if (right === undefined) return 1
  for (const field of ['major', 'minor', 'patch'] as const) {
    if (left[field] !== right[field]) return left[field] < right[field] ? -1 : 1
  }
  // A release outranks any prerelease on the same core (`1.2.0` > `1.2.0-rc.1`).
  if (left.prerelease.length === 0 && right.prerelease.length === 0) return 0
  if (left.prerelease.length === 0) return 1
  if (right.prerelease.length === 0) return -1
  for (let index = 0; index < Math.max(left.prerelease.length, right.prerelease.length); index += 1) {
    const aPart = left.prerelease[index]
    const bPart = right.prerelease[index]
    if (aPart === undefined) return -1
    if (bPart === undefined) return 1
    if (aPart === bPart) continue
    const aNumeric = /^\d+$/.test(aPart)
    const bNumeric = /^\d+$/.test(bPart)
    if (aNumeric && bNumeric) return Number(aPart) < Number(bPart) ? -1 : 1
    // Numeric identifiers rank below alphanumeric ones, as semver requires.
    if (aNumeric) return -1
    if (bNumeric) return 1
    return aPart < bPart ? -1 : 1
  }
  return 0
}

/** Whether `latest` is a strictly newer release than `current`. */
export function isNewer(latest: unknown, current: unknown): boolean {
  return compareVersions(latest, current) > 0
}

/** Whether a version carries a prerelease part, e.g. `1.2.0-beta.1`. */
export function isPrerelease(value: unknown): boolean {
  return /^\D*\d+\.\d+\.\d+-/.test(String(value ?? '').trim())
}

/**
 * Whether a string can be used as an install target without shell access.
 * The update path passes it to a package manager, so it must be a plain
 * version and never a spec, a range or a path.
 */
export function isExactVersion(value: unknown): value is string {
  return typeof value === 'string' && /^\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?(?:\+[0-9A-Za-z.-]+)?$/.test(value)
}
