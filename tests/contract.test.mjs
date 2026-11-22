import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import test from 'node:test'
import { fileURLToPath } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const read = name => fs.readFileSync(path.join(root, name), 'utf8')
const exists = name => fs.existsSync(path.join(root, name))

/** The locale ids the DSH client ships; the plugin follows them one for one. */
const LOCALE_IDS = ['zh', 'en', 'ja', 'es', 'fr', 'de', 'ru', 'pt']

test('package declares the DSH bundle and web client halves', () => {
  const manifest = JSON.parse(read('package.json'))
  assert.equal(manifest.name, 'dsh-sideby-note')
  assert.equal(manifest.type, 'module')
  assert.equal(manifest.exports['.'], './index.js')
  assert.equal(manifest.exports['./client'], './client/client.js')
  assert.equal(manifest.dsh.bundle.patch, './cordis.patch.yml')
  assert.equal(manifest.dsh.client.platform, 'web')
  assert.equal(manifest.dsh.client.immediately, true)
  for (const dependency of [
    '@deepseek-ai/dsh-client-locale',
    '@deepseek-ai/dsh-client-ui-chat',
    '@deepseek-ai/dsh-client-ui-conversation',
    '@deepseek-ai/dsh-client-ui-layout',
    '@deepseek-ai/dsh-client-ui-sidebar',
    '@deepseek-ai/dsh-client-ui-workspace',
  ]) {
    assert.ok(manifest.dsh.client.inject.includes(dependency), `missing inject ${dependency}`)
  }
  for (const file of ['client/client.js', 'index.js', 'cordis.patch.yml', 'icon.svg', 'docs/assets', 'README.md', 'README.en.md', 'LICENSE', 'CHANGELOG.md']) {
    assert.ok(manifest.files.includes(file), `missing files entry ${file}`)
  }
})

test('the operations log stays beside the changelog, out of the notes and the tarball', () => {
  assert.ok(exists('CHANGELOG-OPS.md'), 'missing CHANGELOG-OPS.md; operations history has nowhere to go')
  const ops = read('CHANGELOG-OPS.md')
  // The markers are how tools/release/notes.mjs and the panel find the notes.
  // Ops entries must never carry them, or build chores leak into the update card.
  assert.doesNotMatch(
    ops,
    /<!--\s*app-update-notes:/,
    'the operations log must not carry release-note markers',
  )
  const manifest = JSON.parse(read('package.json'))
  assert.ok(!manifest.files.includes('CHANGELOG-OPS.md'), 'the operations log stays out of the npm tarball')
  // Same version headings as the changelog, so a release rotates both files.
  const changelog = read('CHANGELOG.md')
  const headings = [...ops.matchAll(/^## (.+)$/gm)].map((match) => match[1].trim())
  assert.equal(headings[0], 'next-released', 'CHANGELOG-OPS.md must start with "## next-released"')
  for (const title of headings.slice(1)) {
    assert.ok(
      changelog.includes(`\n## ${title}\n`),
      `CHANGELOG.md has no "## ${title}" section to pair with the operations log`,
    )
  }
})

test('client version matches the package version', () => {
  const manifest = JSON.parse(read('package.json'))
  assert.match(read('src/client/constants.ts'), new RegExp(`PLUGIN_VERSION = '${manifest.version.replace(/\./g, '\\.')}'`))
})

test('the release body is composed from CHANGELOG markers and used by the publish workflow', () => {
  assert.ok(exists('tools/release/notes.mjs'))
  const workflow = read('.github/workflows/publish.yml')
  assert.match(workflow, /tools\/release\/notes\.mjs/)
  assert.match(workflow, /--notes-file/)
  // The tag gate proves the section exists, so a builder failure must fail the
  // release instead of quietly publishing generated notes without markers.
  assert.match(workflow, /tools\/release\.mjs check/)
  assert.doesNotMatch(workflow, /--generate-notes/)
  const changelog = read('CHANGELOG.md')
  const version = JSON.parse(read('package.json')).version
  // Development keeps a next-released section; the release commit renames it to
  // the version chosen then, so either title is valid for this check.
  const heading = changelog.match(/^## (.+)$/m)
  assert.ok(heading, 'CHANGELOG needs a section heading')
  assert.ok(
    heading[1] === 'next-released' || heading[1] === version,
    `the first section is next-released until release day (saw ${heading[1]})`,
  )
  // After a release the notes live under the version heading, with the fresh
  // next-released placeholder above it; before one they live under next-released.
  const target = changelog.includes(`\n## ${version}\n`) ? version : heading[1]
  const start = changelog.indexOf(`## ${target}`)
  const next = changelog.indexOf('\n## ', start + 3)
  const section = next === -1 ? changelog.slice(start) : changelog.slice(start, next)
  const markers = ['en', 'zh'].map(locale => `<!-- app-update-notes:${locale}:start -->`)
  for (const marker of markers) assert.ok(section.includes(marker), `the release section for ${target} needs ${marker}`)
})

test('the client checks for a newer release, reads its notes inline and falls back to the update command', () => {
  const client = readClientTree()
  const css = readCss()
  assert.match(client, /https:\/\/registry\.npmjs\.org/)
  assert.match(client, /https:\/\/registry\.npmmirror\.com/)
  assert.match(client, /api\.github\.com\/repos/)
  // The tag is a variable now: a prerelease build also reads `next`.
  assert.match(client, /dsh-sideby-note\/\$\{channel\}/)
  assert.match(client, /const channels = isPrereleaseVersion/)
  assert.match(client, /tag_name/)
  assert.match(client, /export function createUpdateProbe/)
  assert.match(client, /export function isNewerVersion/)
  assert.match(client, /export function createReleaseHistoryProbe/)
  assert.match(client, /export const UPDATE_GITHUB_API/)
  assert.match(client, /per_page=50/)
  assert.match(client, /selectReleaseHistory/)
  assert.match(client, /'update\.historyCount'/)
  assert.match(client, /export function resetUpdateChecks/)
  assert.match(client, /export function useUpdateCenter/)
  assert.match(client, /updateNotesForLocale/)
  // The market is not a dependency of any kind: the update goes through the
  // host route, then the terminal command.
  assert.match(client, /\/dsh-sideby-note\/update\/apply/)
  assert.match(client, /export async function applyHostUpdate/)
  assert.doesNotMatch(client, /dsh-market|createMarketClient|marketClient/)
  assert.equal(exists('src/client/update/market.ts'), false, 'the market client must be gone')
  assert.doesNotMatch(read('client/client.js'), /createMarketClient/, 'the shipped bundle must not carry the market client')
  assert.doesNotMatch(client, /update\.notesShow|update\.notesHide/)
  assert.match(client, /'update\.now'/)
  assert.match(client, /'update\.copyPrompt'/)
  assert.match(client, /'update\.manualHint'/)
  assert.match(client, /'update\.prompt'/)
  // A manual command always pins the offered version; prereleases also tell
  // npx where to fetch the package from.
  assert.match(client, /const UPDATE_PACKAGE = 'dsh-sideby-note'/)
  assert.match(client, /npx -y\$\{registry\}/)
  assert.match(client, /--version \$\{latestVersion\}/)
  assert.match(client, /PLUGIN_VERSION\.includes\('-'\)/)
  assert.match(css, /\.dsh-an-updateCard\{/)
  assert.match(css, /\.dsh-an-updateVersionHead\{/)
  assert.match(css, /--dsh-scrollbar-width:var\(--dsh-an-scrollRail\)/)
  assert.match(css, /\.dsh-an-updateNotes\[data-fade="true"\]\{/)
  assert.match(client, /'update\.notesTitle'/)
  assert.match(client, /'aria-controls': `\$\{NOTES_ID\}/)
  assert.match(client, /copyText/)
  assert.match(css, /\.dsh-an-updateChevron\[data-open="true"\]\{/)
  assert.match(css, /\.dsh-an-updatePrimary\{/)
  assert.match(read('client/client.js'), /function createUpdateProbe/, 'the shipped bundle carries the check')
  assert.match(read('client/client.js'), /function applyHostUpdate/, 'the shipped bundle carries the host client')
  assert.match(read('client/client.js'), /function extractUpdateNotes/, 'the shipped bundle carries the notes parser')
  // Read-only check: it installs and executes nothing.
  assert.doesNotMatch(client, /child_process|node:child_process/)
})

test('the update probe falls back from npm to the mirror and GitHub, and caches both hits and misses', async () => {
  const { createUpdateProbe, isNewerVersion } = readUpdateHelpers()
  const hour = 60 * 60 * 1000
  const calls = []
  let now = 1000
  const probe = createUpdateProbe({
    fetchImpl: async url => {
      calls.push(url)
      if (url.startsWith('https://registry.npmjs.org/')) throw new Error('offline')
      return { ok: true, json: async () => ({ version: '2.1.0' }) }
    },
    now: () => now,
    ttlMs: hour,
  })
  assert.equal(await probe.latest(), '2.1.0')
  assert.deepEqual(calls, [
    'https://registry.npmjs.org/dsh-sideby-note/latest',
    'https://registry.npmmirror.com/dsh-sideby-note/latest',
  ], 'npm is consulted first and the mirror is the fallback')
  calls.length = 0
  now += hour - 1
  assert.equal(await probe.latest(), '2.1.0')
  assert.equal(calls.length, 0, 'a version inside the TTL is reused')
  now += 1
  await probe.latest()
  assert.equal(calls.length, 2, 'the TTL expiry reads the registry again')

  const releaseCalls = []
  const releaseOnly = createUpdateProbe({
    fetchImpl: async url => {
      releaseCalls.push(url)
      if (url.startsWith('https://api.github.com/')) {
        return { ok: true, json: async () => ({ tag_name: 'v2.1.2' }) }
      }
      return { ok: false, json: async () => ({}) }
    },
    now: () => 0,
    ttlMs: hour,
  })
  assert.equal(await releaseOnly.latest(), '2.1.2', 'a GitHub Release backs a checkout that is not on npm, with its v prefix stripped')
  assert.deepEqual(releaseCalls, [
    'https://registry.npmjs.org/dsh-sideby-note/latest',
    'https://registry.npmmirror.com/dsh-sideby-note/latest',
    'https://api.github.com/repos/LighghtEeloo/dsh-sideby-note/releases/latest',
  ], 'GitHub is consulted only after both npm hosts miss')

  let offline = true
  const flaky = createUpdateProbe({
    fetchImpl: async () => {
      if (offline) throw new Error('offline')
      return { ok: true, json: async () => ({ version: '2.1.1' }) }
    },
    now: () => 0,
    ttlMs: hour,
  })
  assert.equal(await flaky.latest(), null, 'an unreachable registry resolves null')
  offline = false
  assert.equal(await flaky.latest(), null, 'the miss is cached too, so repeated opens make no request')

  assert.equal(isNewerVersion('2.1.0', '2.0.0'), true)
  assert.equal(isNewerVersion('v3.0.0', '2.0.0'), true)
  assert.equal(isNewerVersion('2.0.0', '2.0.0'), false)
  assert.equal(isNewerVersion('1.9.9', '2.0.0'), false)
  assert.equal(isNewerVersion('2.1', '2.0.9'), true)
  assert.equal(isNewerVersion('2.1.0-rc.1', '2.1.0'), false)
  assert.equal(isNewerVersion('x.y', '0.0.0'), false)
})

test('patch inserts exactly the package host row', () => {
  const patch = read('cordis.patch.yml')
  assert.match(patch, /- insert:/)
  assert.match(patch, /id: dsh-sideby-note/)
  assert.match(patch, /name: 'dsh-sideby-note'/)
  assert.doesNotMatch(patch, /@local\//)
})

test('the browser half never reaches for Node globals', () => {
  // tsconfig now carries Node types for the build config; this keeps them out
  // of the bundle, where `process` happens to exist under the jsdom test.
  const tree = readClientTree()
  assert.doesNotMatch(tree, /from ['"]node:/, 'client code must not import Node builtins')
  assert.doesNotMatch(tree, /\bprocess\.[a-z]/, 'client code must not read process')
  assert.doesNotMatch(tree, /\bBuffer\b/, 'client code must not use Buffer')
})

test('host and browser entries use the package identity', () => {
  // The host half carries the in-app update route now, so the entry takes the
  // host context instead of being a loadable no-op row.
  assert.match(read('index.js'), /export function apply\(ctx, config\)/)
  assert.match(read('host/route.js'), /registerUpdateRoutes/)
  assert.match(read('host/apply-update.js'), /already-installed/)
  // The client half is several modules now; identity checks span the tree.
  const client = readClientTree()
  // The loader shell is now emitted by tsdown, not hand-written in the source.
  const bundle = read('client/client.js')
  assert.match(bundle, /^window\.__ModuleLoader__\.load\(/)
  assert.match(bundle, /id: "dsh-sideby-note"/)
  assert.match(bundle, /return module\.exports; \} \}\);/)
  assert.doesNotMatch(client, /__ModuleLoader__/, 'the source must not carry a hand-written shell')
  // The blank new-session page renders hero options but not the composer
  // dock, so a second seat captures the session/workspace context there. It
  // paints nothing; the visible entry stays the one header button.
  assert.match(client, /ctx\.slots\.inject\('conversation\.hero\.options'/)
  assert.match(client, /id: `\$\{PANEL_ID\}\.new-session`/)
  assert.match(client, /ctx\.slots\.inject\('conversation\.composer\.dock'/)
  assert.doesNotMatch(client, /conversation\.chat\.assistant-actions/)
  assert.match(client, /function MemoPopover/)
  assert.match(client, /refreshHeaderEntry/)
  assert.match(client, /dsh-an-headerBtn/)
  assert.match(read('src/client/ui/headerEntry.ts'), /button\.dataset\.entryTitle = `\$\{tr\('title'\)\}/)
  assert.match(client, /scope\.workspaceHint/)
  assert.match(client, /scope\.globalHint/)
  assert.doesNotMatch(client, /add\.shortcut/)
  assert.match(client, /data-sidebar-right-panel\]\[data-sidebar-right-open\]/)
  assert.match(client, /DRAFT_STORAGE_KEY/)
  assert.match(client, /saveAddDraft/)
  const composer = read('src/client/ui/useComposerDraft.ts')
  const recall = composer.slice(composer.indexOf('const recall ='), composer.indexOf('const onDraftChange'))
  assert.ok(recall.includes('if (!(await takeBack(item)))'))
  assert.ok(recall.indexOf('await takeBack(item)') < recall.indexOf('showDraft(next)'),
    'the top composer displays the draft after the row is durably removed')
  assert.match(client, /item\.recall/)
  assert.doesNotMatch(client, /saveEditDraft|readEditDraft|item\.edit|item\.delete/, 'the inline editor is gone')
  assert.match(client, /dsh-an-listArea/)
  assert.match(client, /dsh-an-listSection/)
  // Sticky heads stay transparent in flow and only take the panel's raised
  // surface while pinned, so no differently coloured block sits at rest.
  assert.match(readCss(), /\.dsh-an-sectionHead,\.dsh-an-doneHead\{[^}]*position:sticky[^}]*top:0[^}]*background:transparent/)
  assert.match(readCss(), /\[data-stuck\][^{]*\{[^}]*background:var\(--dsh-an-panelSurface,var\(--dsw-alias-bg-layer-2\)\)/)
  // Legacy metadata can travel in the one-time migration only.
  const clientWithoutMigration = client.replace(read('src/client/storage/legacy.ts'), '')
  assert.doesNotMatch(clientWithoutMigration, /FORWARDED_STORAGE_KEY|dsh-an-forwardMark|item\.forwarded|useForwardMarks|readForwardedIds|forward\.set/)
  assert.ok(!exists('src/client/storage/forwarded.ts'), 'the forward-mark store is removed')
  assert.ok(!exists('src/client/ui/useForwardMarks.ts'), 'the forward-mark hook is removed')
  assert.doesNotMatch(client, /dsh-an-checkHalf|dsh-an-checkForwarded|HALF_DONE_|item\.pendingCountdown|settings\.halfCheck/)
  assert.match(client, /h\(IconRewind, null\)/)
  assert.doesNotMatch(clientWithoutMigration, /settings\.forward(?:Check|Mark|Prefix)|forward\.prefix|FORWARD_PREFIX|readForwardPrefix/, 'the forward prefix prompt is gone')
  assert.match(client, /SECTION_STATE_KEY/)
  assert.match(client, /readSectionState/)
  assert.doesNotMatch(client, /const bullet = |- \$\{note\}/, 'notes are no longer written as list items')
  assert.match(client, /value\.endsWith\('\\n'\) \? note : `\\n\$\{note\}`/, 'successive notes join the draft on new lines')
  assert.match(client, /appendToConversation/)
  assert.match(client, /IconInsert/)
  assert.match(client, /item\.insert/)
  assert.doesNotMatch(client, /IconForward|item\.forward\b|'item\.mark(?:Done|Open)'/)
  assert.match(client, /PLUGIN_VERSION/)
  assert.doesNotMatch(clientWithoutMigration, /SEND_SHORTCUT|sendShortcut|settings\.shortcut/, 'the send shortcut setting is gone')
  assert.match(client, /conversation\.session\.header\.utilities|_headerUtilities/)
  assert.match(client, /placement === 'right'|placement === "right"/)
  assert.match(client, /BoundSessionCapture/)
  assert.match(client, /dsh-an-resizeHandle/)
  assert.match(client, /dsh-an-resizeHandleBottom/)
  assert.match(client, /PANEL_WIDTH_KEY/)
  assert.match(client, /PANEL_HEIGHT_KEY/)
  assert.match(client, /startPanelResize/)
  assert.match(client, /startPanelHeightResize/)
  assert.doesNotMatch(client, /refreshMemoBadges/)
  assert.doesNotMatch(client, /BoundDock/)
  assert.match(client, /ReactDOMClient\.createRoot/)
  assert.match(client, /IconCopy/)
  assert.match(client, /copyText/)
  assert.match(client, /toast\.copied/)
  assert.match(client, /time\.createdArchived/)
  assert.match(client, /sort\(compareDoneItems\)/)
  assert.match(client, /PLUGIN_REPO_URL/)
  assert.match(client, /SESSION_STORAGE_KEY/)
  const storageKeys = read('src/client/constants.ts')
  assert.match(storageKeys, /'dsh\.aside-note'/)
  assert.doesNotMatch(storageKeys, /dsh\.aside-notes/, 'the storage prefix intentionally keeps the upstream dsh.aside-note namespace')
  assert.doesNotMatch(storageKeys, /dsh\.aside-note[^']*\.v2/, 'storage keys must not carry a version suffix')
  assert.ok(!exists('src/client/storage/migrate.ts'), 'legacy storage migration must stay removed')
  assert.doesNotMatch(client, /dsh\.session-memos\.v1|dsh\.memo\./, 'legacy keys must not be read or copied')
  assert.doesNotMatch(client, /selectPanel/)
  assert.match(client, /document\.head\.appendChild\(style\)/)
  assert.doesNotMatch(client, /h\('style'/)
  assert.match(client, /(?:module\.exports = |return )\{ inject: \['slots'\], apply \}/)
  assert.doesNotMatch(client, /@local\//)
})

test('the retired page entry is gone, not kept as a second implementation', () => {
  const client = read('src/client/index.ts')
  for (const dead of ['function PanelBody', 'function PageShell', 'function MemoEntry', 'useTodoStore', 'dsh.dsh-sideby-note.v1']) {
    assert.ok(!client.includes(dead), `dead surface still present: ${dead}`)
  }
  assert.doesNotMatch(readCss(), /dsh-an-(?:page|shell|heroBtn|footerBtn|dockBtn|badge|statNum|track|select)\b/)
})

test('locale files carry metadata and the dictionary stays in sync', () => {
  const metas = Object.fromEntries(LOCALE_IDS.map(id => [id, JSON.parse(read(`locale/${id}.json`))]))
  for (const id of LOCALE_IDS) {
    assert.ok(metas[id].meta && metas[id].meta.title, `locale/${id}.json needs meta.title`)
    assert.ok(metas[id].meta.description, `locale/${id}.json needs meta.description`)
  }
  const zhMeta = metas.zh
  const enMeta = metas.en
  assert.match(zhMeta.meta.title, /边记部/, 'the Chinese listing must use the product name')
  assert.match(zhMeta.meta.description, /按工作区保存.*全局查看/)
  assert.match(enMeta.meta.description, /by workspace.*view them all/)

  const dict = readDict()
  assert.equal(dict.zh['nav.label'], '边记部')
  assert.equal(dict.zh['popover.title'], '边记部')
  assert.equal(dict.zh['add.placeholder'], '随手记一条')
  assert.equal(dict.zh['popover.empty.title'], '边记摸鱼中..')
  assert.equal(dict.zh['popover.empty.body'], '趁 agent 工作时，异步记下你的想法')
  assert.equal(dict.en['nav.label'], 'Sideby Note')
  assert.equal(dict.en['add.placeholder'], 'Jot one down')
  assert.match(dict.en['popover.empty.body'], /while the agent is working/)
  const placeholders = text => [...text.matchAll(/\{(\w+)\}/g)].map(m => m[1]).sort()
  for (const id of LOCALE_IDS) {
    assert.deepEqual(Object.keys(dict[id]).sort(), Object.keys(dict.zh).sort(), `${id} and zh drifted apart`)
    for (const key of Object.keys(dict.zh)) {
      assert.equal(typeof dict[id][key], 'string')
      assert.ok(dict[id][key].length > 0, `${id} ${key} is empty`)
      assert.deepEqual(placeholders(dict[id][key]), placeholders(dict.zh[key]), `placeholders differ for ${key} in ${id}`)
    }
  }
  // The archive term stays, but the panel labels stay short enough to stay quiet.
  assert.equal(dict.zh['popover.archived'], '归档')
  assert.equal(dict.zh['list.open'], '待续')
  assert.equal(dict.zh['popover.clearConfirm'], '清空归档中的 {n} 条？')
  assert.equal(dict.en['popover.clearConfirm'], 'Clear {n} archived notes?')
  for (const key of ['popover.archived', 'list.open', 'popover.clearArchived', 'item.insert', 'toast.inserted', 'toast.cleared']) {
    assert.ok([...dict.zh[key]].length <= 6, `${key} grew past a short label: ${dict.zh[key]}`)
  }
  for (const [key, value] of Object.entries(dict.zh)) {
    // Update copy may talk about finishing an install.
    if (key.startsWith('update.')) continue
    assert.doesNotMatch(value, /完成/, `${key} still says 完成`)
  }
  assert.equal(dict.zh['item.insert'], '填入')
  assert.equal(dict.en['item.insert'], 'Insert')
  for (const id of LOCALE_IDS) {
    for (const gone of ['item.markDone', 'item.markOpen', 'item.forward', 'item.forwarded', 'toast.forwarded', 'toast.unforwarded', 'toast.forwardFailed']) {
      assert.equal(dict[id][gone], undefined, `${id} still carries ${gone}`)
    }
  }
})

test('runtime fallbacks land on English, never Chinese', () => {
  const i18n = read('src/client/i18n/index.ts')
  // Selected dictionary first, then the complete English bundle, then the raw key.
  assert.match(i18n, /return dict\[key\] \|\| DICT\.en\[key as MessageKey\] \|\| key/)
  assert.doesNotMatch(i18n, /DICT\.zh\[key/, 'a drifted dictionary must not fall back to Chinese')

  const client = read('src/client/index.ts')
  // The live LocaleSnapshot exposes `active`; `id`/string are legacy shapes.
  assert.match(client, /current\.active \|\| current\.id \|\| current\.locale/)
  assert.match(client, /return typeof id === 'string' && id \? id : 'en'/, 'an absent locale id reads as English')
  assert.match(client, /\} catch \{\n\s+return 'en'\n\s+\}/, 'a throwing locale service reads as English')
  // The dictionary binding must not be pinned to the service captured at apply:
  // a client-plugin reload replaces the service and the old binding goes silent.
  assert.match(i18n, /locale = ctx\.get\('locale'\)/)
  assert.match(i18n, /locale === boundService/)
})

test('documentation and preview assets are present', () => {
  const previews = [
    'docs/assets/preview-badge.png',
    'docs/assets/preview-badge-dark.png',
    'docs/assets/preview-right.png',
    'docs/assets/preview-right-dark.png',
  ]
  for (const file of ['README.md', 'README.en.md', 'LICENSE', 'CHANGELOG.md', ...previews, 'icon.svg']) {
    assert.ok(exists(file), `missing ${file}`)
  }
  for (const file of previews) {
    assert.ok(fs.statSync(path.join(root, file)).size > 1000, `${file} looks empty`)
  }
})

test('the marketplace screenshot declaration points at shipped images', () => {
  // The plugin market reads screenshots.json from the repository root and shows
  // these images in that order — the card strip only takes the first three.
  const declared = JSON.parse(read('screenshots.json'))
  assert.ok(Array.isArray(declared), 'screenshots.json must be a JSON array')
  assert.ok(declared.length >= 1 && declared.length <= 8, 'the market accepts 1-8 screenshots')
  for (const file of declared) {
    assert.equal(typeof file, 'string')
    assert.ok(file.length > 0, 'a declared screenshot path is empty')
    assert.ok(!file.startsWith('/') && !file.split('/').includes('..'), `${file} must be a repo-relative path`)
    assert.ok(/\.(png|jpe?g|webp)$/i.test(file), `${file} is not a bitmap the market accepts`)
    assert.ok(exists(file), `screenshots.json declares a missing file: ${file}`)
    assert.ok(fs.statSync(path.join(root, file)).size > 1000, `${file} looks empty`)
  }
  assert.equal(declared[0], 'docs/assets/preview-right.png', 'the card cover should stay the full-window preview')
  assert.equal(new Set(declared).size, declared.length, 'screenshots.json repeats a file')
})

test('the marketplace icon is a shipped square bitmap', () => {
  // awesome-dsh-plugin only accepts a GitHub-hosted raster icon, and the plugin
  // card crops it into a 16px circle. The SVG kept in docs/assets is the master
  // that regenerates icon.png; the market reads the PNG at the repository root.
  assert.ok(exists('docs/assets/storefront-icon.svg'), 'missing docs/assets/storefront-icon.svg')
  assert.ok(exists('icon.png'), 'missing icon.png')
  const bytes = fs.readFileSync(path.join(root, 'icon.png'))
  assert.ok(bytes.length > 1000, 'icon.png looks empty')
  assert.ok(bytes.length <= 256 * 1024, `icon.png is ${bytes.length} bytes, over the 256 KiB icon budget`)
  const signature = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]
  assert.deepEqual([...bytes.subarray(0, 8)], signature, 'icon.png does not start with a PNG signature')
  const width = bytes.readUInt32BE(16)
  const height = bytes.readUInt32BE(20)
  assert.equal(width, height, 'the card crops the icon into a circle, so icon.png must be square')
  assert.equal(width, 180, 'icon.png ships at 180px; regenerating it at another size needs a look at 16px')
})

test('feature screenshots ship in both themes', () => {
  const features = ['panel', 'settings', 'actions', 'clear', 'empty']
  for (const name of features) {
    for (const file of [`docs/assets/features/${name}.png`, `docs/assets/features/${name}-dark.png`]) {
      assert.ok(exists(file), `missing ${file}`)
      assert.ok(fs.statSync(path.join(root, file)).size > 1000, `${file} looks empty`)
    }
  }
  for (const readme of ['README.md', 'README.en.md']) {
    const text = read(readme)
    for (const name of features) {
      assert.match(text, new RegExp(`docs/assets/features/${name}\\.png`), `${readme} does not show ${name}`)
      assert.match(text, new RegExp(`docs/assets/features/${name}-dark\\.png`), `${readme} does not show ${name} in dark`)
    }
  }
})

/** Every file under src/client, joined — for assertions about the tree as a whole. */
function readClientTree() {
  const files = []
  const walk = dir => {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name)
      if (entry.isDirectory()) walk(full)
      else if (/\.(ts|tsx|css)$/.test(entry.name)) files.push(fs.readFileSync(full, 'utf8'))
    }
  }
  walk(path.join(root, 'src', 'client'))
  return files.join('\n')
}

/** The panel stylesheet is a plain .css file now. */
function readCss() {
  return read('src/client/styles/panel.css')
}

/** Split the stylesheet into whole rules, keeping their at-rule context. */
function cssRules() {
  const css = readCss().replace(/\/\*[\s\S]*?\*\//g, '')
  const rules = []
  let media = ''
  const mediaRe = /@media([^{]+)\{([\s\S]*?)\n\}/g
  let rest = css
  for (const match of css.matchAll(mediaRe)) {
    rest = rest.replace(match[0], '\n')
    for (const rule of match[2].split('}')) {
      const [selector, body] = rule.split('{')
      if (!selector || !body) continue
      rules.push({ selector: selector.trim(), body: body.trim(), media: match[1].trim() })
    }
    media = match[1].trim()
  }
  void media
  for (const rule of rest.split('}')) {
    const [selector, body] = rule.split('{')
    if (!selector || !body) continue
    if (selector.includes('@keyframes')) continue
    rules.push({ selector: selector.trim(), body: body.trim(), media: '' })
  }
  return rules
}

/** The bundled dictionary, evaluated straight from the module sources. */
function readDict() {
  return Object.fromEntries(LOCALE_IDS.map(id => [id, readLiteral(`src/client/i18n/${id}.ts`, id)]))
}

/** Pull one JSON-compatible object literal out of a TypeScript module. */
function readLiteral(file, name) {
  const text = read(file)
  const start = text.indexOf('{', text.indexOf(`export const ${name}`))
  const end = text.lastIndexOf('}')
  assert.ok(start >= 0 && end > start, `${name} literal not found in ${file}`)
  return JSON.parse(text.slice(start, end + 1))
}

/** The shipped update probe and comparator, evaluated from the built bundle. */
function readUpdateHelpers() {
  const bundle = read('client/client.js')
  // The probe block derives the GitHub endpoint from PLUGIN_REPO_URL; carry
  // that one line so the snippet stands alone outside the module scope.
  const repoLine = bundle.match(/const PLUGIN_REPO_URL = "[^"]+";/)[0]
  const start = bundle.indexOf('const UPDATE_REGISTRY_HOSTS = ')
  const end = bundle.indexOf('const updateProbe = createUpdateProbe', start)
  assert.ok(start > 0 && end > start, 'update helpers not found in the bundle')
  return new Function(`${repoLine}\n${bundle.slice(start, end)}\nreturn { createUpdateProbe, isNewerVersion }`)()
}

test('colours come from theme aliases, never from a second palette', () => {
  const css = readCss()
  assert.doesNotMatch(css, /#[0-9a-f]{3,8}\b/i, 'raw hex colours belong to the theme')
  assert.doesNotMatch(css, /\brgba?\(/i, 'raw colour functions belong to the theme')
  assert.doesNotMatch(css, /--an-n-\d+/, 'the parallel grey ramp duplicates --dsw-alias-* tokens')
  for (const token of ['--dsw-alias-interactive-bg-hover', '--dsw-alias-label-primary', '--dsw-alias-label-secondary', '--dsw-alias-border-l2', '--dsw-alias-border-l4']) {
    assert.ok(css.includes(`var(${token})`), `missing shared token ${token}`)
  }
  for (const match of css.matchAll(/var\((--[a-z0-9-]+)/g)) {
    const token = match[1]
    assert.ok(
      token.startsWith('--dsw-') || token.startsWith('--ds-') || token.startsWith('--an-') || token.startsWith('--dsh-an-') || token.startsWith('--dsh-scrollbar'),
      `unknown token ${token}`,
    )
  }
})

test('type scale stays at the product sizes and weights cap at 500', () => {
  const css = readCss()
  const sizes = [...new Set([...css.matchAll(/font-size:([^;}]+)/g)].map(match => match[1].trim()))]
  for (const size of sizes) assert.match(size, /^var\(--an-fs-(?:caption|row|title)\)$/)
  const scale = [...css.matchAll(/--an-fs-[a-z]+:([0-9.]+)px/g)].map(match => Number(match[1])).sort((a, b) => a - b)
  assert.deepEqual(scale, [12, 13, 14])
  const weights = [...new Set([...css.matchAll(/font-weight:([0-9]+)/g)].map(match => Number(match[1])))]
  for (const weight of weights) assert.ok(weight <= 500, `font-weight ${weight} exceeds the 500 cap`)
})

test('spacing snaps to the 4px scale', () => {
  const css = readCss()
  const scale = new Set(['0', '1px', '2px', '4px', '8px', '12px', '16px', '24px', '32px', '48px', '64px', 'auto', '100%'])
  for (const match of css.matchAll(/(?:^|[;{])(?:padding|margin|gap)(?:-[a-z]+)?:([^;}]+)/g)) {
    const value = match[1].trim()
    if (value.includes('var(') || value.includes('calc(') || value.includes('inset')) continue
    for (const part of value.split(/\s+/)) {
      assert.ok(scale.has(part) || /^-\d+px$/.test(part), `off-scale spacing "${value}"`)
    }
  }
})

test('radii use the shared scale and pills declare their curve', () => {
  const rules = cssRules()
  const allowed = new Set(['var(--dsw-radius-sm)', 'var(--dsw-radius-md)', 'var(--dsw-radius-lg)', 'var(--dsw-radius-panel)', 'var(--an-radius-pill)'])
  for (const rule of rules) {
    for (const match of rule.body.matchAll(/border-radius:([^;}]+)/g)) {
      assert.ok(allowed.has(match[1].trim()), `off-scale radius ${match[1].trim()} in ${rule.selector}`)
    }
    if (/border-radius:var\(--an-radius-pill\)/.test(rule.body)) {
      assert.match(rule.body, /corner-shape:round/, `${rule.selector} must pair the pill radius with corner-shape:round`)
    }
  }
  for (const match of readCss().matchAll(/--an-radius-pill:([^;}]+)/g)) assert.equal(match[1], '999px')
})

test('hairlines stay at 0.5px and only state or dashed borders use 1px', () => {
  const rules = cssRules()
  for (const rule of rules) {
    for (const match of rule.body.matchAll(/(?:^|;)border(?:-(?:top|right|bottom|left))?:([^;}]+)/g)) {
      const value = match[1].trim()
      if (value === '0' || value.startsWith('0 ')) continue
      if (value.includes('dashed')) {
        assert.match(value, /^1px dashed /, `dashed affordance keeps 1px: ${value}`)
        continue
      }
      if (value.includes('1.5px')) {
        assert.match(rule.selector, /data-loading/, `only the spinner ring keeps 1.5px: ${rule.selector}`)
        continue
      }
      assert.match(value, /^0\.5px solid /, `neutral border must be 0.5px: "${value}" in ${rule.selector}`)
    }
  }
})

test('the floating panel is borderless and elevated, with no second stroke', () => {
  const rules = cssRules()
  const panel = rules.find(rule => rule.body.includes('position:fixed'))
  assert.ok(panel, 'panel rule missing')
  assert.match(panel.body, /border:0(?:;|$)/)
  assert.match(panel.body, /box-shadow:var\(--dsw-elevation-panel\)/)
  assert.match(panel.body, /background:var\(--dsh-an-panelSurface\)/)
  assert.doesNotMatch(panel.body, /backdrop-filter/, 'the opaque panel no longer blurs its backdrop')
  for (const rule of rules) {
    const hasNeutralBorder = /border:0?\.?5?px solid var\(--dsw-alias-border/.test(rule.body)
    const hasElevation = /box-shadow:var\(--dsw-elevation-/.test(rule.body)
    assert.ok(!(hasNeutralBorder && hasElevation), `${rule.selector} pairs a border with an elevation shadow`)
  }
})

test('scrollbars keep the shared theme skin at the DSH rail geometry', () => {
  const css = readCss()
  assert.doesNotMatch(css, /::-webkit-scrollbar/, 'component scrollbar selectors replace the shared skin')
  assert.doesNotMatch(css, /(?:^|[;{])scrollbar-(?:width|color):/, 'the standard scrollbar properties silence the shared hover skin')
  // The popover is an elevated menu surface, so the l2 pair is the DSH binding;
  // the fallback keeps a visible thumb on a theme that lacks the alias.
  assert.match(css, /--dsh-scrollbar-thumb:var\(--dsw-alias-scrollbar-bg-l2,var\(--an-divider\)\)/)
  assert.match(css, /--dsh-scrollbar-thumb-hover:var\(--dsw-alias-scrollbar-hover-l2,var\(--dsw-alias-scrollbar-bg-l2,var\(--an-divider\)\)\)/)
  // A 9px rail whose 2px transparent border leaves a 5px inset pill. Only the
  // geometry is rebound; the shared skin still owns every pseudo-element.
  assert.match(css, /--dsh-an-scrollRail:9px/)
  assert.match(css, /--dsh-an-scrollInset:2px/)
  assert.match(css, /--dsh-scrollbar-width:var\(--dsh-an-scrollRail\)/)
  assert.match(css, /--dsh-scrollbar-thumb-border:var\(--dsh-an-scrollInset\)/)
})

test('the rail grows into the popover padding without shrinking the cards', () => {
  const css = readCss()
  assert.match(css, /--dsh-an-listGutter:var\(--an-space-4\)/)
  assert.match(css, /@media \(max-width:480px\)\{[^@]*--dsh-an-listGutter:var\(--an-space-3\)/)
  const viewport = /\.dsh-an-listViewport\{([^}]*)\}/.exec(css)
  assert.ok(viewport, 'missing list viewport')
  assert.match(viewport[1], /margin-right:calc\(var\(--dsh-an-listGutter\) \* -1\)/)
  const list = [...css.matchAll(/\.dsh-an-listArea\{([^}]*)\}/g)].find(match => match[1].includes('display:flex'))
  assert.ok(list, 'missing list scroll container')
  // Cards and the add field keep one content width: the padding pays back what
  // the rail consumes, and the stable gutter keeps that width when idle.
  assert.match(list[1], /padding-right:calc\(var\(--dsh-an-listGutter\) - var\(--dsh-an-scrollRail\)\)/)
  assert.match(list[1], /scrollbar-gutter:stable/)
})

test('the retired settings surface leaves no settings styles or panel state', () => {
  const retiredSelectors = /dsh-an-setting[\w-]*|dsh-an-updateDot|data-settings/
  assert.doesNotMatch(readCss(), retiredSelectors)
  assert.doesNotMatch(readClientTree(), retiredSelectors)
  assert.equal(exists('src/client/ui/SettingsPanel.ts'), false)
})

test('the bottom edge fades only while notes sit below the fold', () => {
  const css = readCss()
  const client = read('src/client/index.ts') + read('src/client/ui/NoteList.ts') + read('src/client/ui/MemoPopover.ts') + read('src/client/ui/useListEdge.ts')
  // The fade is an alpha mask on the scroller, not a blurred overlay: a mask
  // has no compositing edge to show as a crisp-to-blurred line.
  assert.doesNotMatch(css, /\.dsh-an-listViewport::(?:before|after)/, 'the bottom fade must not use an overlay pseudo-element')
  const mask = /\.dsh-an-listViewport\[data-bottom="true"\] \.dsh-an-listArea\{([^}]*)\}/.exec(css)
  assert.ok(mask, 'missing the bottom fade mask')
  assert.match(mask[1], /--dsh-an-fadeHeight:calc\(var\(--an-space-6\) \+ var\(--an-space-4\)\)/, 'the fade must cover 48px')
  assert.match(mask[1], /mask-image:linear-gradient\(to bottom,currentColor 0,currentColor calc\(100% - var\(--dsh-an-fadeHeight\)\),transparent 100%\)/, 'the content must fade over 48px')
  assert.match(mask[1], /mask-image:[^;]*linear-gradient\(to right,transparent calc\(100% - var\(--dsh-an-scrollRail\)\),currentColor calc\(100% - var\(--dsh-an-scrollRail\)\)\)/, 'the scrollbar rail must stay opaque')
  assert.match(mask[1], /mask-composite:add/, 'the two mask layers union so the rail stays crisp')
  assert.doesNotMatch(mask[1], /backdrop-filter/, 'a backdrop-filter overlay would reintroduce the hard edge')
  assert.match(css, /\.dsh-an-listViewport\[data-bottom="true"\] \.dsh-an-listArea/, 'the mask must follow the scroll state')
  // It follows scroll + ResizeObserver state.
  assert.match(client, /className: 'dsh-an-listViewport'[\s\S]{0,240}className: 'dsh-an-listArea', ref: listRef/)
  assert.match(client, /'data-bottom': listHasMore \? 'true' : undefined/)
  assert.match(client, /onScroll: syncListEdge/)
  assert.match(client, /new ResizeObserver\(syncListEdge\)/)
  assert.match(client, /node.scrollTop \+ node.clientHeight < node.scrollHeight - 1/)
})

test('hover styling is gated on hover capability', () => {
  const css = readCss().replace(/\/\*[\s\S]*?\*\//g, '')
  const block = css.match(/@media \(hover:hover\)\{([\s\S]*?)\n\}/)
  assert.ok(block, 'missing @media (hover:hover) block')
  const outside = css.replace(block[0], '')
  assert.doesNotMatch(outside, /:hover/, 'hover rules must live inside @media (hover:hover)')
  assert.doesNotMatch(outside, /@media \(hover:none\)/, 'hover support is detected by capability, not by a negative fallback')
  assert.doesNotMatch(outside, /:hover[^{]*\{[^}]*opacity:0/)

  const rules = cssRules()
  const actions = rules.find(rule => rule.selector === '.dsh-an-actions' && rule.media.includes('hover:hover'))
  assert.ok(actions, 'action row visibility must be decided under the hover media query')
  assert.match(actions.body, /opacity:0/)
  const base = rules.find(rule => rule.selector === '.dsh-an-actions' && rule.media === '')
  assert.ok(base, 'action row needs a hover-less default')
  assert.doesNotMatch(base.body, /opacity:0/, 'touch devices must keep the row actions visible')
})

test('no product copy is hardcoded outside the dictionary', () => {
  const client = read('src/client/index.ts')
  const start = client.indexOf('const DICT = ')
  const end = client.indexOf('const CSS = [')
  const cssStart = client.indexOf('const CSS = [')
  const cssEnd = client.indexOf("].join('')", cssStart)
  const js = `${client.slice(0, start)}${client.slice(end, cssStart)}${client.slice(cssEnd)}`
  // A person's name is a proper noun, not translatable copy.
  const scannable = js.replace(/const PLUGIN_AUTHOR = '[^']*'/, '')
  const cjk = [...scannable.matchAll(/[^\s]*[\u4e00-\u9fff][^\n]*/g)].map(match => match[0].trim())
  assert.deepEqual(cjk, [], `hardcoded copy: ${cjk.join(' | ')}`)
})

test('chinese hints drop the trailing full stop', () => {
  const dict = readDict()
  for (const key of Object.keys(dict.zh)) {
    if (!/^(toast\.|storage\.)|hint|Hint/.test(key)) continue
    assert.ok(!dict.zh[key].endsWith('。'), `${key} ends with a full stop`)
  }
})

test('transient outcomes go to the frame-wide toast seat', () => {
  const client = read('src/client/index.ts') + read('src/client/ui/primitives.ts') + read('src/client/ui/toastSeat.ts')
  assert.match(client, /@deepseek-ai\/dsh-client-ui-primitives/)
  assert.match(client, /ctx\.slots\.inject\('shell\.overlay'/)
  assert.match(client, /name: 'shell\.overlay'/)
  assert.match(client, /h\(Toast, \{/)
  for (const kind of ['copied', 'inserted', 'recalled', 'recallBlocked', 'cleared', 'copyFailed', 'insertFailed', 'saveFailed']) {
    assert.match(client, new RegExp(`toast\\.${kind}`), `missing toast copy for ${kind}`)
  }
  assert.doesNotMatch(client, /toast\.(?:un)?forwarded|toast\.forwardFailed/, 'the forward-mark toasts are gone')
  assert.doesNotMatch(client, /dsh-an-copied|dsh-an-forwarded/, 'inline success marks duplicate the toast')
})

test('a failed write keeps the row and says so', () => {
  const client = read('src/client/index.ts') + read('src/client/ui/useSessionMemoStore.ts') + read('src/client/ui/MemoPopover.ts') + read('src/client/ui/useNoteActions.ts') + read('src/client/ui/useComposerDraft.ts')
  // The store writer returns a promise now; a rejection becomes `false`, and
  // only a successful durable write may replace the rendered record.
  assert.match(client, /setSyncError\(!ok\)\n\s+if \(ok\) setAllItems\(readVisibleNotes\(null\)\)/)
  assert.match(client, /if \(!ok\) \{\n\s+report\('saveFailed'\)/)
  assert.match(client, /A failed write keeps the row/)
})

test('notes stay behind one host-owned domain file', () => {
  const constants = read('src/client/constants.ts')
  const route = read('host/store-route.js')
  const spec = read('host/store-spec.js')
  const identity = read('host/constants.js')
  assert.match(constants, /HOST_STORE_PATH = '\/dsh-sideby-note\/store'/)
  assert.match(route, /STORE_PATH = '\/dsh-sideby-note\/store'/, 'both halves must name the same endpoint')
  assert.match(constants, /HOST_STORE_LOCATION_PATH = '\/dsh-sideby-note\/store\/location'/)
  assert.match(constants, /HOST_STORE_REVEAL_PATH = '\/dsh-sideby-note\/store\/reveal'/)
  assert.match(route, /LOCATION_PATH = `\$\{STORE_PATH\}\/location`/)
  assert.match(route, /REVEAL_PATH = `\$\{STORE_PATH\}\/reveal`/)
  assert.match(identity, /DOMAIN_NAME = 'aside_note'/, 'the unit name also names the JSON file')
  assert.match(identity, /DOMAIN_VERSION = 1/)
  assert.match(spec, /layout: 'single'/)
  for (const table of ['sessions', 'workspaces', 'forwarded']) {
    assert.match(identity, new RegExp(`${table}: '${table}'`), `missing table ${table}`)
  }
  // The browser bundle must not reach into the host side or its schema library.
  const built = fs.readFileSync(path.join(root, 'client', 'client.js'), 'utf8')
  assert.doesNotMatch(built, /storageDomain|store-spec|zod/, 'host storage code must not ship in the browser bundle')
})

test('icon-only controls use the shared tooltip', () => {
  const client = read('src/client/index.ts') + read('src/client/ui/primitives.ts') + read('src/client/ui/TodoRow.ts')
  assert.match(client, /function withTooltip\(/)
  assert.match(client, /h\(Tooltip, \{ label, side: 'top'/)
  const iconButtons = [...client.matchAll(/className: 'dsh-an-iconBtn[^']*',\n\s+'aria-label': (?:say\([^)]+\)|insertLabel)/g)]
  assert.equal(iconButtons.length, 3, 'rewind, copy and insert or archive are icon actions')
  const buttonTitles = [...client.matchAll(/'aria-label': say\('[^']+'\),\n\s+title:/g)]
  assert.deepEqual(buttonTitles, [], 'aria-labelled buttons must not carry a second native title')
})

test('rewind is the product refresh arc flipped counter-clockwise', () => {
  const primitives = read('src/client/ui/primitives.ts')
  // The icon set has no undo glyph; mirroring the shell's own refresh arc keeps
  // its stroke and optical size instead of drawing a plugin-specific SVG.
  assert.match(primitives, /IconRewind = \(\) => h\(Glyph, \{ name: 'IconRefreshOutlineRegular', size: 14, className: 'dsh-an-glyphFlip' \}\)/)
  assert.match(primitives, /h\(Component, \{ size: props\.size, className: props\.className \}\)/)
  assert.match(readCss(), /\.dsh-an-glyphFlip\{transform:scaleX\(-1\)\}/)
  assert.doesNotMatch(readCss(), /dsh-an-recall/, 'the text-button style is gone')
})

test('archived notes drop the insert action and keep rewind plus copy', () => {
  const client = read('src/client/ui/TodoRow.ts')
  const start = client.indexOf("{ className: 'dsh-an-actions' }")
  assert.ok(start > 0, 'row actions missing')
  const actions = client.slice(start)
  assert.match(client.slice(0, start), /archived \? null : withTooltip\(insertLabel/)
  assert.match(actions, /hasText \? withTooltip\(say\('item\.copy'\)/, 'copy appears when the note has text')
  assert.match(actions, /withTooltip\(say\('item\.recall'\)/)
  assert.doesNotMatch(actions, /withTooltip\(insertLabel/)
  assert.ok(actions.indexOf("withTooltip(say('item.copy')") < actions.indexOf("withTooltip(say('item.recall')"))
  assert.doesNotMatch(actions, /item\.(?:edit|delete)|dsh-an-iconBtnDanger/, 'inline edit and delete are gone')
})

test('animations and transitions stay tokenised', () => {
  const css = readCss()
  const animations = [...css.matchAll(/@keyframes [^{]+\{([^@]*)\}\}/g)].map(match => match[1])
  for (const frames of animations) {
    const props = [...frames.matchAll(/([a-z-]+):/g)].map(match => match[1])
    for (const prop of props) assert.ok(['opacity', 'transform'].includes(prop), `animates ${prop}`)
  }
  for (const match of css.matchAll(/transition:[^;}]+/g)) {
    assert.doesNotMatch(match[0], /(?<!var\(--an-dur)[^)]\b\d+m?s\b/, `untokenised duration in "${match[0]}"`)
  }
  assert.match(css, /@media \(prefers-reduced-motion:reduce\)/)
  assert.match(css, /@media \(prefers-reduced-motion:no-preference\)/)
})

test('the panel opens in place with an opacity fade', () => {
  const css = readCss()
  assert.match(css, /@keyframes dsh-an-pop-in\{from\{opacity:0\}to\{opacity:1\}\}/, 'the panel keyframes must be opacity only')
  assert.doesNotMatch(css, /@keyframes dsh-an-pop-in\{[^@]*?(?:transform|translate|scale)/, 'the panel must not move or scale on open')
  // The entry is also the positioning anchor. A pressed transform makes the
  // anchor rect smaller, so the first panel position is computed from the
  // scaled rect and snaps right/down once the press transition ends.
  assert.doesNotMatch(css, /\.dsh-an-headerBtn:active\{[^}]*transform/, 'the panel anchor must not scale while pressed')
})

test('section toggles stay inside the scrolling list', () => {
  const css = readCss()
  // .dsh-an-listArea clips on the x axis, so any horizontal pull on a section
  // toggle (margin-left, including the calc(* -1) form) slices the rounded left
  // edge off its hover pill.
  assert.doesNotMatch(
    css,
    /[^{}]*\.dsh-an-(?:doneToggle|sectionHead|doneHead)[^{]*\{[^}]*margin-left:/,
    'section toggles must not pull left: .dsh-an-listArea clips the rounded edge',
  )
})

test('the section counts carry the status hierarchy', () => {
  const css = readCss()
  // Section labels are quiet captions now, so the panel title is the only
  // 14px/500 line at the top of the popover.
  assert.match(css, /\.dsh-an-doneToggle\{[^}]*font-size:var\(--an-fs-caption\)/)
  assert.match(css, /\.dsh-an-doneToggle\{[^}]*color:var\(--dsw-alias-label-secondary\)/)
  assert.match(css, /\.dsh-an-scopeCount\{[^}]*flex:none[^}]*font-size:var\(--an-fs-caption\)[^}]*line-height:16px[^}]*font-weight:400/)
  assert.match(css, /\.dsh-an-scopeName\{[^}]*min-width:0[^}]*overflow:hidden[^}]*text-overflow:ellipsis/)
  assert.match(css, /\.dsh-an-popTitleLine\{[^}]*flex:1 1 auto/)
  assert.match(css, /\.dsh-an-popActions\{[^}]*display:flex/)
  const client = read('src/client/index.ts') + read('src/client/ui/PanelHead.ts') + read('src/client/ui/NoteList.ts')
  assert.match(client, /className: 'dsh-an-popActions'/)
  assert.match(client, /className: 'dsh-an-popTitleLine' \},\n\s+h\('div', \{ className: 'dsh-an-popTitle' \}[^]*?h\(ScopeSwitch, scope\)/)
  // Both counts share the one neutral badge style: the completed number is not
  // important, so it must not draw attention with a success tint. An empty open
  // section still shows no zero badge, which is noise rather than information.
  assert.doesNotMatch(css, /\.dsh-an-sectionCount\[data-tone/, 'no done-specific count badge rule')
  assert.doesNotMatch(client, /data-tone/, 'no done-specific count badge attribute')
  assert.match(
    css,
    /\.dsh-an-sectionCount\{[^}]*border:0\.5px solid var\(--dsw-alias-border-l3\)[^}]*background:var\(--dsw-alias-interactive-bg-hover-solid\)[^}]*color:var\(--dsw-alias-label-primary\)/,
  )
  assert.match(client, /openCount \? h\('span', \{ className: 'dsh-an-sectionCount' \}, String\(openCount\)\) : null/)
  assert.match(client, /h\('span', \{ className: 'dsh-an-sectionCount' \}, String\(doneItems\.length\)\)/)
  // The add field keeps the card surface so the panel material stays the
  // quietest layer, while the 0.5px card edge stays the strongest line.
  assert.match(css, /\.dsh-an-add\{[^}]*border:0\.5px solid var\(--dsw-alias-settings-card-stroke\)[^}]*background:var\(--dsw-alias-settings-card-fill\)/)
  // The notes themselves sit bare on the panel, so the add card is the one framed surface.
  assert.doesNotMatch(css, /\.dsh-an-rows\{[^}]*(?:border|background):/)
})

test('scope hover tints the shared track beneath the inset selection pill', () => {
  const css = readCss()
  assert.match(css, /\.dsh-an-scope\{[^}]*padding:1px[^}]*border-radius:var\(--an-radius-pill\)/)
  assert.match(css, /\.dsh-an-scopeBtn\{height:20px[^}]*border-radius:var\(--an-radius-pill\)/)
  assert.match(css, /\.dsh-an-scope\[role="group"\]:hover\{background-color:color-mix\(in srgb,var\(--dsw-alias-bg-layer-1\) 70%,var\(--dsw-alias-interactive-bg-hover-solid\)\)/)
  assert.match(css, /\.dsh-an-scopeBtn:hover\{color:var\(--dsw-alias-label-primary\)\}/)
  assert.match(css, /\.dsh-an-scopeBtn\[aria-pressed="true"\]\{background:var\(--dsw-alias-interactive-bg-hover-solid\)/)
  assert.match(css, /\.dsh-an-scopeBtn:focus-visible\{[^}]*outline-offset:1px/)
})

test('the panel never raises the soft keyboard on touch devices', () => {
  const client = read('src/client/index.ts') + read('src/client/ui/MemoPopover.ts') + read('src/client/ui/useComposerDraft.ts')
  assert.match(client, /\(hover: hover\) and \(pointer: fine\)/)
})

test('archived notes sort by newest archive', () => {
  const client = read('src/client/domain/items.ts')
  const extract = name => {
    const start = client.indexOf(`function ${name}(`)
    assert.ok(start > 0, `missing ${name}`)
    const end = client.indexOf('\n}\n', start) + '\n}\n'.length
    assert.ok(end > start, `unterminated ${name}`)
    return client.slice(start, end)
  }
  const factory = new Function(`${extract('completedStamp')}\n${extract('compareDoneItems')}\nreturn { completedStamp, compareDoneItems }`)()
  const items = [
    { id: 'a', completedAt: 1000 },
    { id: 'b', completedAt: 3000 },
    { id: 'c', updatedAt: 2000 },
    { id: 'd', createdAt: 500 },
  ]
  assert.deepEqual([...items].sort(factory.compareDoneItems).map(item => item.id), ['b', 'c', 'a', 'd'])
  assert.equal(factory.completedStamp({ updatedAt: 42, createdAt: 1 }), 42)
  assert.equal(factory.completedStamp({}), 0)
})

test('the composer sends on Enter and breaks on Shift+Enter, like the main composer', () => {
  const composer = read('src/client/ui/useComposerDraft.ts')
  // Plain Enter adds; Shift+Enter keeps the textarea's native line break.
  assert.match(composer, /if \(event\.shiftKey\) return/)
  assert.match(composer, /event\.preventDefault\(\)\n    if \(event\.repeat\) return\n    add\(\)/)
  // An IME candidate Enter is left to the browser, never adding a note.
  assert.match(composer, /if \(composing\) return/)
  // The old configurable chord path is gone.
  assert.doesNotMatch(composer, /sendShortcut|insertDraftNewline|isSendModifier/)
  assert.doesNotMatch(read('src/client/constants.ts'), /SEND_SHORTCUT|MOD_LABEL|isSendModifier/)
  const dict = readDict()
  for (const id of LOCALE_IDS) {
    assert.equal(dict[id]['settings.shortcut'], undefined, `${id} must drop the shortcut setting`)
    assert.equal(dict[id]['add.shortcutEnter'], undefined, `${id} must drop the alternate hint`)
    assert.equal(dict[id]['add.shortcut'], undefined, `${id} must drop the composer hint`)
  }
})

test('open rows lead with Insert and support direct dragging', () => {
  const row = read('src/client/ui/TodoRow.ts')
  const css = readCss()
  assert.doesNotMatch(row, /role: 'checkbox'|aria-checked|onToggle/, 'there is no manual completion any more')
  assert.doesNotMatch(css, /dsh-an-check|dsh-an-rowFoot|dsh-an-itemBody/, 'the checkbox and footer styles are gone')
  assert.doesNotMatch(read('src/client/ui/useNoteActions.ts'), /done: !candidate\.done/, 'nothing toggles a note back and forth')
  assert.match(row, /className: 'dsh-an-leading' \}, archived \? null : withTooltip\(insertLabel/)
  assert.match(row, /'aria-keyshortcuts': 'ArrowUp ArrowDown'/)
  const popover = read('src/client/ui/MemoPopover.ts')
  assert.match(popover, /dragProps: item\.done \? undefined : reorder\.dragProps\(item\.id\)/)
  assert.match(css, /\.dsh-an-row\[data-sortable\]\{cursor:grab\}/)
  assert.match(css, /\.dsh-an-row\[data-sortable\] \.dsh-an-rowBody\{touch-action:none\}/)
  const hook = read('src/client/ui/useRowReorder.ts')
  assert.match(hook, /setPointerCapture/)
  assert.match(hook, /event\.key !== 'ArrowUp' && event\.key !== 'ArrowDown'/)
  // Escape cancels the drag without also closing the panel.
  assert.match(hook, /window\.addEventListener\('keydown', onEscape, true\)/)
  assert.match(hook, /event\.stopPropagation\(\)\n\s+finish\(false\)/)
})

test('rows are bare lines whose age gives way to the actions', () => {
  const css = readCss()
  const rows = css.match(/\.dsh-an-rows\{([^}]*)\}/)
  assert.ok(rows, 'rows rule missing')
  assert.doesNotMatch(rows[1], /border|background/, 'the note list is not a card')
  const row = css.match(/\.dsh-an-row\{([^}]*)\}/)
  assert.ok(row, 'row rule missing')
  assert.doesNotMatch(row[1], /border-top/, 'rows have no dividers')
  assert.match(row[1], /grid-template-columns:16px minmax\(0,1fr\) auto/)
  // Age and actions overlap in one cell; hover-capable devices swap them.
  assert.match(css, /\.dsh-an-trail>\*\{grid-area:1\/1\}/)
  const rules = cssRules()
  const meta = rules.find(rule => rule.selector === '.dsh-an-meta' && rule.media.includes('hover:hover'))
  assert.ok(meta && /opacity:1/.test(meta.body), 'pointer devices show the age at rest')
  const swap = rules.find(rule => rule.selector === '.dsh-an-row:hover .dsh-an-meta,.dsh-an-row:focus-within .dsh-an-meta')
  assert.ok(swap && /opacity:0/.test(swap.body), 'hover and focus hide the age behind the actions')
  // Archived notes only step down in ink; they are not struck through.
  assert.match(css, /\.dsh-an-rowArchived \.dsh-an-text\{color:var\(--dsw-alias-label-secondary\)\}/)
  assert.doesNotMatch(css, /line-through/)
  // The enter animation must not pin `transform` once it ends, or the drag's
  // inline transforms would be overridden by the filled keyframe.
  assert.match(css, /\.dsh-an-rows>\.dsh-an-row\{animation:dsh-an-row-in var\(--an-dur-base\) var\(--an-ease\) backwards\}/)
  // The held row lifts on the panel surface with the shared elevation.
  assert.match(css, /\.dsh-an-row\[data-dragging="true"\]\{[^}]*background:var\(--dsh-an-panelSurface\);box-shadow:var\(--dsw-elevation-prominent\)/)
})

test('the insert action uses the product list-pen glyph', () => {
  const primitives = read('src/client/ui/primitives.ts')
  assert.match(primitives, /IconInsert = \(\) => h\(Glyph, \{ name: 'IconListPenOutlineRegular', size: 14 \}\)/)
  assert.doesNotMatch(primitives, /IconShareOutlineRegular/, 'the share arrow no longer stands for this action')
})

test('putting a note into the chat archives it in the same step', () => {
  const popover = read('src/client/ui/MemoPopover.ts')
  const start = popover.indexOf('const insertItem = async item => {')
  assert.ok(start > 0, 'insert handler missing')
  const handler = popover.slice(start, popover.indexOf('\n  }\n', start))
  // The note is written bare; no prompt and no list marker.
  assert.doesNotMatch(handler, /prefix|forward\.prefix|`- /)
  // No composer on screen: nothing changes and the note stays open.
  assert.match(handler, /if \(hasText && !appendToConversation\(item\.text\)\) \{\n\s+report\('insertFailed'\)\n\s+return\n\s+\}/)
  assert.match(handler, /const ok = await archive\(item\)/)
  assert.match(handler, /'inserted'[^\n]*'archiveFailed'/)
  assert.ok(handler.indexOf('appendToConversation') < handler.indexOf('archive(item)'), 'archive only after the text landed')
  const actions = read('src/client/ui/useNoteActions.ts')
  assert.match(actions, /if \(candidate\.id !== item\.noteId \|\| candidate\.done\) return candidate/, 'archiving is one-way')
  assert.match(actions, /done: true, updatedAt: now, completedAt: now/)
})

test('moving a note reorders the open notes and leaves archived slots alone', () => {
  const items = read('src/client/domain/items.ts')
  const start = items.indexOf('export function moveOpenItem(')
  assert.ok(start > 0, 'missing moveOpenItem')
  const end = items.indexOf('\n}\n', start) + 3
  const moveOpenItem = new Function(`${items.slice(start, end).replace('export ', '')}\nreturn moveOpenItem`)()
  const list = [
    { id: 'a', done: false },
    { id: 'x', done: true },
    { id: 'b', done: false },
    { id: 'c', done: false },
  ]
  const ids = next => next.map(item => item.id)
  assert.deepEqual(ids(moveOpenItem(list, 'a', 2)), ['b', 'x', 'c', 'a'], 'open notes flow around the archived slot')
  assert.deepEqual(ids(moveOpenItem(list, 'c', 0)), ['c', 'x', 'a', 'b'])
  assert.deepEqual(ids(moveOpenItem(list, 'b', 99)), ['a', 'x', 'c', 'b'], 'the target is clamped')
  assert.equal(moveOpenItem(list, 'a', 0), list, 'a no-op move returns the same array')
  assert.equal(moveOpenItem(list, 'x', 0), list, 'archived notes cannot be moved')
  assert.equal(moveOpenItem(list, 'missing', 0), list)
})

test('clearing archived notes asks for a second confirmation', () => {
  const client = read('src/client/index.ts') + read('src/client/ui/ClearConfirm.ts') + read('src/client/ui/NoteList.ts') + read('src/client/ui/MemoPopover.ts') + read('src/client/ui/useClearConfirm.ts')
  assert.match(client, /const \[confirmClear, setConfirmClear\] = React\.useState\(false\)/)
  assert.match(client, /const clearConfirmTimerRef = React\.useRef\(0\)/)
  // The section button opens the band; it never clears on the first click.
  assert.match(client, /className: 'dsh-an-clear',\n\s+'aria-expanded': confirmClear \? 'true' : 'false',\n\s+onClick: askClearConfirm/)
  assert.doesNotMatch(client, /className: 'dsh-an-clear', onClick: clearDone/)
  assert.match(client, /const askClearConfirm = \(\) => \{\n\s+stopClearConfirmTimer\(\)\n\s+setConfirmClear\(true\)/)
  // Cancel and confirm both close the band; only confirm reaches clearDone.
  assert.match(client, /const dismissClearConfirm = \(\) => \{\n\s+stopClearConfirmTimer\(\)\n\s+setConfirmClear\(false\)\n\s+\}/)
  assert.match(client, /const confirmClearDone = \(\) => \{\n\s+dismissClearConfirm\(\)\n\s+onConfirm\(\)\n\s+\}/)
  assert.match(client, /onConfirm: clearDone/)
  assert.match(client, /onClick: onCancel \}, say\('popover\.clearCancel'\)/)
  assert.match(client, /onClick: onConfirm \}, say\('popover\.clearConfirmAction'\)/)
  // The band names the completed count and is announced politely.
  assert.match(client, /className: 'dsh-an-clearConfirm',\n\s+role: 'group',\n\s+'aria-live': 'polite',/)
  assert.match(client, /onCancel: dismissClearConfirm/)
  assert.match(client, /onConfirm: confirmClearDone/)
  assert.match(client, /say\(workspaceFilter \? 'popover\.clearConfirm' : 'popover\.clearGlobalConfirm', \{ n: doneItems\.length \}\)/)
  // Five-second auto-dismiss, with every teardown path dropping the timer.
  assert.match(read('src/client/constants.ts'), /const CLEAR_CONFIRM_MS = 5000/)
  assert.match(client, /clearConfirmTimerRef\.current = window\.setTimeout\(\(\) => \{\n\s+clearConfirmTimerRef\.current = 0\n\s+setConfirmClear\(false\)\n\s+\}, CLEAR_CONFIRM_MS\)/)
  assert.match(client, /React\.useEffect\(\(\) => \(\) => stopClearConfirmTimer\(\), \[\]\)/)
  assert.match(client, /if \(confirmClear && \(!showDone \|\| doneCount === 0\)\) dismissClearConfirm\(\)/)
  assert.match(client, /doneCount: doneItems\.length/)
  assert.match(client, /React\.useEffect\(\(\) => \{\n\s+dismissClearConfirm\(\)\n\s+\}, \[scope\]\)/)
})

test('the clear confirmation band reuses card tokens and a danger confirm', () => {
  const css = readCss()
  assert.match(
    css,
    /\.dsh-an-clearConfirm\{[^}]*border:0\.5px solid var\(--dsw-alias-settings-card-stroke\)[^}]*background:var\(--dsw-alias-settings-card-fill\)/,
  )
  assert.match(css, /\.dsh-an-clearConfirmText\{[^}]*font-size:var\(--an-fs-caption\)[^}]*color:var\(--dsw-alias-label-primary\)/)
  const rules = cssRules()
  const confirm = rules.find(rule => rule.selector === '.dsh-an-miniDanger')
  assert.ok(confirm, 'danger confirm rule missing')
  assert.match(confirm.body, /background:var\(--dsw-alias-state-error-primary\)/)
  assert.match(confirm.body, /color:var\(--dsw-alias-label-primary-foreground\)/)
  assert.doesNotMatch(confirm.body, /#[0-9a-f]{3,8}\b|\brgba?\(/i)
  const hover = rules.find(rule => rule.selector === '.dsh-an-miniDanger:hover:not([disabled])')
  assert.ok(hover, 'danger hover rule must stay inside the hover media block')
  assert.match(hover.media, /hover:hover/)
})

test('the forward prefix prompt and its storage are gone', () => {
  const dict = readDict()
  for (const id of LOCALE_IDS) {
    for (const gone of [
      'settings.forward',
      'settings.forwardPrefixItem',
      'settings.forwardPrefixHint',
      'settings.forwardPrefixHintCustom',
      'settings.forwardPrefixReset',
      'forward.prefix',
    ]) {
      assert.equal(dict[id][gone], undefined, `${id} still carries ${gone}`)
    }
  }
  assert.doesNotMatch(read('src/client/constants.ts'), /FORWARD_PREFIX|forward-prefix/)
  assert.doesNotMatch(read('src/client/storage/prefs.ts'), /ForwardPrefix|FORWARD_PREFIX/)
  const popover = read('src/client/ui/MemoPopover.ts')
  assert.doesNotMatch(popover, /forwardPrefix|appendToConversation\(item\.text,/)
  assert.ok(!exists('src/client/ui/usePanelSettings.ts'), 'the prefix-only settings hook is gone')
  assert.doesNotMatch(readCss(), /dsh-an-setting(?:Input|Textarea|Reset|Hint|Item)\b/, 'field-only settings styles are gone')
})

test('the open panel follows a live locale switch', () => {
  const popover = read('src/client/ui/MemoPopover.ts')
  assert.match(popover, /React\.useSyncExternalStore\(subscribeLocale, readLocaleRevision/)
  assert.match(popover, /const localeId = typeof props\.getLocaleId === 'function'/)
  assert.match(read('src/client/index.ts'), /root\.render\(h\(MemoPopover, \{\n\s+sessionId: panel\.sessionId,\n\s+say: tr,\n\s+locale,/)
})


test('sticky heads are filled only while pinned, not at rest', () => {
  const client = read('src/client/index.ts') + read('src/client/ui/position.ts')
  assert.match(client, /function syncStickyHeads\(node\)/)
  assert.match(client, /const section = head\.parentElement/)
  assert.match(client, /const rect = section\.getBoundingClientRect\(\)/)
  assert.match(client, /head\.toggleAttribute\('data-stuck', rect\.top < areaTop && rect\.bottom > areaTop\)/)
  assert.match(client, /syncStickyHeads\(node\)/)

  // The stuck state uses the same raised surface token as the panel, so the
  // fill does not read as a differently coloured block. Blur is deferred.
  const rules = cssRules()
  const stuck = rules.find(rule => rule.selector === '.dsh-an-sectionHead[data-stuck],.dsh-an-doneHead[data-stuck]')
  assert.ok(stuck, 'stuck header rule missing')
  assert.match(stuck.body, /background:var\(--dsh-an-panelSurface,var\(--dsw-alias-bg-layer-2\)\)/)
  assert.doesNotMatch(stuck.body, /backdrop-filter/, 'the stuck fill stays opaque until the blur is approved')
  const base = rules.find(rule => rule.selector === '.dsh-an-sectionHead,.dsh-an-doneHead')
  assert.ok(base, 'base header rule missing')
  assert.doesNotMatch(base.body, /backdrop-filter/, 'the header must not blur while it sits in flow')
})

test('the pinned header keeps its plain title style over a solid fill', () => {
  const css = readCss()
  const client = read('src/client/index.ts')
  const rule = css.match(/\.dsh-an-sectionHead\[data-stuck\],\.dsh-an-doneHead\[data-stuck\]\{([^}]*)\}/)
  assert.ok(rule, 'stuck header rule missing')
  assert.match(rule[1], /background:var\(--dsh-an-panelSurface,var\(--dsw-alias-bg-layer-2\)\)/)
  assert.doesNotMatch(rule[1], /border-radius|border-top-left-radius|border-top-right-radius/, 'the title keeps its plain shape')
  assert.doesNotMatch(rule[1], /backdrop-filter|opacity/, 'the header does not go translucent')
  assert.doesNotMatch(css, /\[data-stuck\][^{]*::before/, 'no extra corner underlay')

  // The opaque panel makes a top blur band unnecessary.
  assert.doesNotMatch(css, /dsh-an-headBlur/)
  assert.doesNotMatch(client, /HeadBlur/)
})
