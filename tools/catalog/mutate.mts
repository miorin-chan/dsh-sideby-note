#!/usr/bin/env node
/**
 * Mutation check: does the suite actually notice when behaviour breaks?
 *
 * For each mutation below: apply it to a source file, rebuild the bundle, run
 * the catalog runner, record which cases failed or went missing, then restore.
 * A mutation the suite does not catch is a hole in the tests, not a pass.
 *
 *   node tools/catalog/mutate.mts
 *
 * Output: docs/test-validity.md (evidence) and a per-mutation console table.
 * This script edits source files temporarily; it always restores them.
 */
import fs from 'node:fs'
import path from 'node:path'
import { spawnSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'
import type { RunRecord } from './run.mts'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..')
const runsDir = path.join(root, '.test/runs')

const MUTATIONS = [
  {
    id: 'note-text-truncation',
    rule: 'R-NOTE-TEXT',
    file: 'src/client/domain/items.ts',
    find: "const text = String(raw.text || '').trim().slice(0, MAX_TEXT)",
    replace: "const text = String(raw.text || '').trim()",
    expect: ['NOTE-006'],
  },
  {
    id: 'corrupt-backup',
    rule: 'R-STORE-CORRUPT',
    file: 'src/client/storage/session.ts',
    find: '    parsed = JSON.parse(raw)\n  } catch {\n    setAsideUnreadable(SESSION_STORAGE_KEY, raw)',
    replace: '    parsed = JSON.parse(raw)\n  } catch {',
    expect: ['STORE-007'],
  },
  {
    id: 'merge-removed',
    rule: 'R-STORE-MERGE',
    file: 'src/client/storage/session.ts',
    find: '    items: mergeItems(normalizeItems(previous && previous.items), normalizeItems(record.items), base),',
    replace: '    items: normalizeItems(record.items),',
    expect: ['STORE-013', 'STORE-014', 'STORE-015'],
  },
  {
    id: 'storage-guard',
    rule: 'R-STORE-READ-FAIL',
    file: 'src/client/storage/codec.ts',
    find: '  try {\n    return window.localStorage\n  } catch {\n    return null\n  }',
    replace: '  return window.localStorage',
    expect: ['STORE-011'],
  },
  {
    id: 'write-swallows-failure',
    rule: 'R-STORE-WRITE-FAIL',
    file: 'src/client/storage/session.ts',
    find: '  } catch {\n    return false\n  }',
    replace: '  } catch {\n    return true\n  }',
    expect: ['STORE-012'],
  },
  {
    id: 'confirm-never-expires',
    rule: 'R-NOTE-CONFIRM',
    file: 'src/client/ui/useClearConfirm.ts',
    find: '    }, CLEAR_CONFIRM_MS)',
    replace: '    }, CLEAR_CONFIRM_MS * 1000)',
    expect: ['PANEL-010'],
  },
  {
    id: 'blank-session-unlocks',
    rule: 'R-SCOPE-BLANK',
    file: 'src/client/scope.ts',
    find: '  return Boolean(text(sessionId)) && sessionReadyFor(sessionId)',
    replace: '  return Boolean(text(sessionId))',
    expect: ['SCOPE-008', 'SCOPE-011'],
  },
  {
    id: 'append-adds-extra-newline',
    rule: 'R-FWD-PLAIN',
    file: 'src/client/domain/forward.ts',
    find: "    return value.endsWith('\\n') ? note : `\\n${note}`",
    replace: '    return `\\n${note}`',
    expect: ['FWD-005'],
  },
  {
    id: 'update-notes-keep-drafts',
    rule: 'R-UPD-NOTES',
    file: 'src/client/update/releaseHistory.ts',
    find: '    if (release.draft === true) continue\n    if (release.prerelease === true && !allowPrerelease) continue\n',
    replace: '',
    expect: ['UPD-003'],
  },
  {
    id: 'capacity-cap-returns',
    rule: 'R-STORE-CAPACITY',
    file: 'src/client/domain/items.ts',
    find: '  return normalized\n}',
    replace: '  return normalized.slice(0, 300)\n}',
    expect: ['STORE-018'],
  },
  {
    id: 'width-clamp-removed',
    rule: 'R-PANEL-GEOMETRY',
    file: 'src/client/ui/usePanelGeometry.ts',
    find: '    const max = Math.min(PANEL_MAX_WIDTH, Math.max(PANEL_MIN_WIDTH, window.innerWidth - 32))\n    return Math.max(PANEL_MIN_WIDTH, Math.min(max, value))',
    replace: '    return value',
    expect: ['PANEL-009'],
  },
  {
    id: 'age-always-now',
    rule: 'R-NOTE-AGE',
    file: 'src/client/domain/items.ts',
    find: "  if (elapsed < 60 * 1000) return say('time.now')",
    replace: "  if (elapsed >= 0) return say('time.now')",
    expect: ['NOTE-009'],
  },
  {
    id: 'legacy-ids-random',
    rule: 'R-STORE-SANITIZE',
    file: 'src/client/domain/items.ts',
    find: ' ? raw.id : legacyId(text, raw.createdAt, raw.updatedAt)',
    replace: ' ? raw.id : uid()',
    expect: ['STORE-017'],
  },
]

const run = (args: string[], options: { shell?: boolean } = {}) => spawnSync(args[0], args.slice(1), {
  cwd: root,
  encoding: 'utf8',
  shell: false,
  ...options,
})

const build = () => {
  const result = run(['npm', 'run', 'build'], { shell: true })
  if (result.status !== 0) {
    console.error(result.stdout || '', result.stderr || '')
    throw new Error('build failed')
  }
}

const latestRunId = () => fs.readdirSync(runsDir).sort().at(-1)

type MutationResult = (typeof MUTATIONS)[number] & { failed: string[]; missing: string[]; killed: boolean }
const results: MutationResult[] = []
for (const mutation of MUTATIONS) {
  const file = path.join(root, mutation.file)
  const original = fs.readFileSync(file, 'utf8')
  if (!original.includes(mutation.find)) {
    console.log(`NOT-APPLIED ${mutation.id} (pattern not found)`)
    results.push({ ...mutation, failed: [], missing: [], killed: false })
    continue
  }
  fs.writeFileSync(file, original.replace(mutation.find, mutation.replace))
  try {
    build()
    run([process.execPath, 'tools/catalog/run.mts'])
    const runId = latestRunId()
    if (!runId) throw new Error('catalog runner did not write a run record')
    const record: RunRecord = JSON.parse(fs.readFileSync(path.join(runsDir, runId, 'run.json'), 'utf8'))
    const failed = record.cases.filter(item => item.result === 'FAIL').map(item => item.case_id)
    const missing = record.cases.filter(item => item.result === 'MISSING').map(item => item.case_id)
    const caught = [...failed, ...missing]
    const killed = mutation.expect.some(id => caught.includes(id))
    results.push({ ...mutation, failed, missing, killed })
    console.log(`${killed ? 'killed  ' : 'SURVIVED'} ${mutation.id.padEnd(28)} expect=${mutation.expect.join(',')} caught=${caught.join(',') || '-'}`)
  } finally {
    fs.writeFileSync(file, original)
  }
}
build()

const killed = results.filter(item => item.killed).length
const lines = [
  '# 测试有效性证据（变异测试）',
  '',
  `- 时间：${new Date().toISOString()}`,
  `- 变异数：**${results.length}** · 被抓到：**${killed}** · 存活：**${results.length - killed}**`,
  '- 方法：对实现注入一处真实缺陷 → 重建产物 → 跑全部用例 → 记录哪些用例失败或缺失 → 还原源码。',
  '  存活的变异代表测试没覆盖到，不是通过。',
  '',
  '| 变异 | 针对规则 | 预期抓到 | 实际失败/缺失 | 判定 |',
  '| --- | --- | --- | --- | --- |',
  ...results.map(item => `| \`${item.id}\` | ${item.rule} | ${item.expect.join(', ')} | ${[...item.failed, ...item.missing].join(', ') || '—'} | ${item.killed ? '✅ 抓到' : '❌ 存活'} |`),
  '',
  '## 怎么跑',
  '',
  '```bash',
  'node tools/catalog/mutate.mts',
  '```',
  '',
  '脚本会临时改源码、重建、跑用例，结束时恢复并使用还原后的源码重新构建；最后再跑一次完整用例确认工作树是干净的。',
  '',
]
fs.mkdirSync(path.join(root, 'docs'), { recursive: true })
fs.writeFileSync(path.join(root, 'docs/test-validity.md'), lines.join('\n'))
console.log(`\n${killed}/${results.length} mutations caught · docs/test-validity.md`)
process.exit(killed === results.length ? 0 : 1)
