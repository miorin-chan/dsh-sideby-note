/**
 * Where this plugin is installed, and which version is actually there.
 *
 * The update path never trusts the running module: DSH keeps the loaded build
 * in memory after the files on disk change, so "installed" always means the
 * manifest under the profile's `node_modules`. Everything here is a read.
 */
import { readFileSync } from 'node:fs'
import { homedir } from 'node:os'
import { isAbsolute, join, resolve } from 'node:path'

/** The package this host half updates and reports on. */
export const PACKAGE = '@miorin/dsh-sideby-note'

/** Parse a JSON file, or answer undefined when it is missing or malformed. */
export function readJson(path: string): unknown {
  try {
    return JSON.parse(readFileSync(path, 'utf8'))
  } catch {
    return undefined
  }
}

/** The DSH home directory, as DSH itself resolves it. */
export function dshHome(env: NodeJS.ProcessEnv = process.env): string {
  const configured = typeof env.DSH_HOME === 'string' ? env.DSH_HOME.trim() : ''
  return configured === '' ? join(homedir(), '.dsh') : configured
}

/**
 * The profile directory this host runs in.
 *
 * The launcher records the profile it opened (`profileContext`); the fallback
 * follows DSH's own layout so a host without that service still behaves.
 */
export function profileDirOf(profileContext: unknown, env: NodeJS.ProcessEnv = process.env): string {
  const recorded = profileContext && typeof profileContext === 'object' && 'dir' in profileContext
    ? profileContext.dir
    : undefined
  if (typeof recorded === 'string' && recorded.trim() !== '') return resolve(recorded)
  const explicit = typeof env.DSH_PROFILE_DIR === 'string' ? env.DSH_PROFILE_DIR.trim() : ''
  if (explicit !== '') return resolve(explicit)
  const name = typeof env.DSH_PROFILE === 'string' && env.DSH_PROFILE.trim() !== '' ? env.DSH_PROFILE.trim() : 'desktop'
  return join(dshHome(env), 'profiles', name)
}

/** Whether a directory looks like a DSH profile. */
export function isProfileDir(dir: string): boolean {
  const manifest = readJson(join(dir, 'package.json'))
  if (!manifest || typeof manifest !== 'object' || !('dsh' in manifest)) return false
  const dsh = manifest.dsh
  return dsh !== null && typeof dsh === 'object' && 'profile' in dsh && typeof dsh.profile === 'object'
}

/**
 * The version on disk for this package, read from the profile's public link
 * rather than from whatever versioned directory pnpm left behind.
 */
export function installedVersion(profileDir: string): string | undefined {
  const manifest = readJson(join(profileDir, 'node_modules', PACKAGE, 'package.json'))
  if (!manifest || typeof manifest !== 'object' || !('version' in manifest)) return undefined
  return typeof manifest.version === 'string' ? manifest.version : undefined
}

/**
 * The dependency spec the profile records, which DSH restores when an install
 * fails — so it is the recorded intent, not necessarily what is on disk.
 */
export function dependencySpec(profileDir: string): string | undefined {
  const manifest = readJson(join(profileDir, 'package.json'))
  if (!manifest || typeof manifest !== 'object') return undefined
  const { dependencies, devDependencies } = manifest as Record<string, unknown>
  const from = (deps: unknown) => deps && typeof deps === 'object' && PACKAGE in deps ? deps[PACKAGE] : undefined
  const spec = from(dependencies) ?? from(devDependencies)
  return typeof spec === 'string' ? spec : undefined
}

/**
 * How this profile installed the package: from the registry, from a checkout,
 * or by something this host cannot drive.
 */
export function installMode(spec: string | undefined): 'npm' | 'link' | 'manual' {
  if (spec === undefined) return 'manual'
  if (/^(?:link|file|workspace):/.test(spec) || /^\.{1,2}(?:[/\\]|$)/.test(spec)) return 'link'
  return isAbsolute(spec) ? 'link' : 'npm'
}
