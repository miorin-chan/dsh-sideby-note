import assert from 'node:assert/strict'
import { execFileSync, spawnSync } from 'node:child_process'
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join } from 'node:path'
import { test } from 'node:test'
import { fileURLToPath } from 'node:url'

import {
  NEXT_HEADING,
  checkNextReleased,
  compareVersions,
  extractSection,
  parseStatusPaths,
  prepareChangelog,
  prepareOpsChangelog,
  splitSections,
} from '../tools/release.mjs'

const CHANGELOG = `# Changelog

## next-released

- Fix A.
- Fix B.

## 2.0.1

- Shipped.

## 2.0.0

- Older.
`

test('splitSections keeps each section body and its order', () => {
  const sections = splitSections(CHANGELOG)
  assert.deepEqual(
    sections.map((section) => section.title),
    ['next-released', '2.0.1', '2.0.0'],
  )
  assert.equal(sections[0].body, '- Fix A.\n- Fix B.')
  assert.equal(sections[1].body, '- Shipped.')
})

test('extractSection stops at the next version heading', () => {
  assert.equal(extractSection(CHANGELOG, '2.0.1'), '- Shipped.')
  assert.equal(extractSection(CHANGELOG, 'next-released'), '- Fix A.\n- Fix B.')
})

test('extractSection rejects a missing or empty section', () => {
  assert.throws(() => extractSection(CHANGELOG, '9.9.9'), /has no "## 9\.9\.9" section/)
  assert.throws(
    () => extractSection('## 2.0.2\n\n## 2.0.1\n\n- Shipped.\n', '2.0.2'),
    /"## 2\.0\.2" section is empty/,
  )
})

test('checkNextReleased requires next-released at the top', () => {
  assert.equal(checkNextReleased(CHANGELOG).title, NEXT_HEADING)
  assert.throws(
    () => checkNextReleased('## 2.0.1\n\n- Shipped.\n'),
    /must start with "## next-released"/,
  )
})

test('prepareChangelog renames next-released and inserts a fresh placeholder', () => {
  const prepared = prepareChangelog(CHANGELOG, '2.1.0')
  assert.equal(
    prepared,
    `# Changelog

## next-released

## 2.1.0

- Fix A.
- Fix B.

## 2.0.1

- Shipped.

## 2.0.0

- Older.
`,
  )
  assert.equal(checkNextReleased(prepared).title, NEXT_HEADING)
  assert.equal(checkNextReleased(prepared).body, '')
  assert.equal(extractSection(prepared, '2.1.0'), '- Fix A.\n- Fix B.')
  assert.equal(extractSection(prepared, '2.0.1'), '- Shipped.')
})

test('prepareChangelog refuses an empty next-released section', () => {
  assert.throws(
    () => prepareChangelog('## next-released\n\n## 2.0.1\n\n- Shipped.\n', '2.1.0'),
    /is empty; write the release notes/,
  )
})

test('prepareOpsChangelog rotates the operations log and steps aside when it is empty', () => {
  const ops = '# 运营记录\n\n## next-released\n\n- 重拍 README 截图。\n\n## 1.0.1\n\n- 旧记录。\n'
  const prepared = prepareOpsChangelog(ops, '1.1.0')
  assert.equal(
    prepared,
    '# 运营记录\n\n## next-released\n\n## 1.1.0\n\n- 重拍 README 截图。\n\n## 1.0.1\n\n- 旧记录。\n',
  )
  // An empty next-released, a missing heading or a missing file is not a
  // release failure: the operations log simply stays as it is.
  assert.equal(prepareOpsChangelog('## next-released\n\n## 1.0.1\n\n- 旧记录。\n', '1.1.0'), null)
  assert.equal(prepareOpsChangelog('## 1.0.1\n\n- 旧记录。\n', '1.1.0'), null)
  assert.equal(prepareOpsChangelog(undefined, '1.1.0'), null)
})

test('parseStatusPaths keeps the filename when the index column is blank', () => {
  assert.deepEqual(parseStatusPaths(' M CHANGELOG.md\nM  package.json\n'), [
    'CHANGELOG.md',
    'package.json',
  ])
})

test('compareVersions orders stable and prerelease versions', () => {
  assert.equal(compareVersions('2.1.0', '2.0.1'), 1)
  assert.equal(compareVersions('2.1.0', '2.1.0'), 0)
  assert.equal(compareVersions('2.0.1', '2.1.0'), -1)
  assert.equal(compareVersions('2.1.0-beta.1', '2.1.0'), -1)
  assert.equal(compareVersions('2.1.0', '2.1.0-beta.9'), 1)
  assert.equal(compareVersions('2.1.0-beta.2', '2.1.0-beta.1'), 1)
  assert.equal(compareVersions('2.1.0-beta.10', '2.1.0-beta.9'), 1)
})

function releaseFixture(t, { failCheck = false } = {}) {
  const root = mkdtempSync(join(tmpdir(), 'sideby-note-release-'))
  t.after(() => rmSync(root, { recursive: true, force: true }))
  const git = (...args) => execFileSync('git', args, { cwd: root, encoding: 'utf8' }).trim()
  const write = (file, text) => writeFileSync(join(root, file), text)
  mkdirSync(join(root, 'src/client'), { recursive: true })
  write('.gitignore', '/client/client.js\n')
  write('package.json', JSON.stringify({ version: '2.0.1', scripts: { check: 'node check.mjs' } }))
  write('src/client/constants.ts', "export const PLUGIN_VERSION = '2.0.1'\n")
  write('CHANGELOG.md', CHANGELOG)
  write('CHANGELOG-OPS.md', '# Operations\n\n## next-released\n\n- Build changes.\n')
  write('check.mjs', `
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
mkdirSync('client', { recursive: true })
writeFileSync('client/client.js', JSON.parse(readFileSync('package.json', 'utf8')).version)
process.exitCode = ${Number(failCheck)}
`)
  git('init', '--quiet', '--initial-branch=main')
  git('add', '.')
  git('-c', 'user.name=Fixture', '-c', 'user.email=fixture@example.invalid', '-c', 'commit.gpgSign=false',
    'commit', '--no-verify', '--quiet', '--message=fixture')
  const release = fileURLToPath(new URL('../tools/release.mjs', import.meta.url))
  return {
    git,
    client: join(root, 'client/client.js'),
    dryRun: (...flags) => spawnSync(process.execPath, [release, '2.1.0', '--dry-run', ...flags], { cwd: root, encoding: 'utf8' }),
  }
}

for (const skipCheck of [false, true]) {
  test(`release dry run works without prebuilt JavaScript${skipCheck ? ' when skipping checks' : ''}`, t => {
    const fixture = releaseFixture(t)
    const head = fixture.git('rev-parse', 'HEAD')
    const result = fixture.dryRun(...(skipCheck ? ['--skip-check'] : []))
    assert.equal(result.status, 0, result.stderr)
    assert.match(result.stdout, /Dry run for 2\.1\.0/)
    assert.equal(fixture.git('rev-parse', 'HEAD'), head)
    assert.equal(fixture.git('tag', '--list'), '')
    assert.deepEqual(fixture.git('diff', '--name-only').split('\n'), [
      'CHANGELOG-OPS.md', 'CHANGELOG.md', 'package.json', 'src/client/constants.ts',
    ])
    if (skipCheck) assert.equal(existsSync(fixture.client), false)
    else assert.equal(readFileSync(fixture.client, 'utf8'), '2.1.0')
  })
}

for (const hasClient of [false, true]) {
  test(`release rollback restores ${hasClient ? 'the existing client bundle' : 'an initially absent client bundle'}`, t => {
    const fixture = releaseFixture(t, { failCheck: true })
    const prior = Buffer.from('previous bundle\r\n')
    if (hasClient) {
      mkdirSync(dirname(fixture.client), { recursive: true })
      writeFileSync(fixture.client, prior)
    }
    const result = fixture.dryRun()
    assert.equal(result.status, 1)
    assert.match(result.stderr, /npm run check failed/)
    assert.equal(fixture.git('status', '--porcelain'), '')
    assert.equal(fixture.git('tag', '--list'), '')
    if (hasClient) assert.deepEqual(readFileSync(fixture.client), prior)
    else assert.equal(existsSync(fixture.client), false)
  })
}
