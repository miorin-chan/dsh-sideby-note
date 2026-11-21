#!/usr/bin/env node
/**
 * Runs the suite, records one result per catalog case, and renders a report.
 *
 * The catalog says what must be verified; this turns a test run into evidence:
 *
 *   node tools/catalog/run.mjs                  # run, write .test/runs/<id>/
 *   node tools/catalog/run.mjs --suite release  # same run, only release cases counted
 *   node tools/catalog/run.mjs --compare        # diff against the previous run
 *   node tools/catalog/run.mjs --approve --by <name>
 *   node tools/catalog/run.mjs --strict         # release gate: all pass + reviewed
 *
 * A case's result is PASS / FAIL / SKIPPED / MISSING. MISSING (the case exists
 * in the catalog but no test produced a result) is never reported as a pass.
 */
import fs from 'node:fs'
import path from 'node:path'
import crypto from 'node:crypto'
import { spawnSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'
import { parse } from 'yaml'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..')
const catalogDir = path.join(root, 'tests/catalog')
const testsDir = path.join(root, 'tests')
const runsDir = path.join(root, '.test/runs')

const argv = process.argv.slice(2)
const flag = name => argv.includes(name)
const valueOf = name => {
  const index = argv.indexOf(name)
  return index >= 0 ? argv[index + 1] : ''
}

const decode = text => text
  .replace(/&lt;/g, '<').replace(/&gt;/g, '>')
  .replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&amp;/g, '&')

/** test name -> { result, duration, failure } */
function parseJunit(xml) {
  const results = new Map()
  const pattern = /<testcase\b([^>]*?)(?:\/>|>([\s\S]*?)<\/testcase>)/g
  for (const match of xml.matchAll(pattern)) {
    const attrs = match[1]
    const body = match[2] ?? ''
    const name = decode((attrs.match(/name="([^"]*)"/) || [])[1] ?? '')
    if (!name) continue
    const duration = Number((attrs.match(/time="([^"]*)"/) || [])[1] ?? 0) * 1000
    const failure = /<failure\b[^>]*>([\s\S]*?)<\/failure>/.exec(body)
    const skipped = /<skipped\b/.test(body)
    results.set(name, {
      result: failure ? 'FAIL' : skipped ? 'SKIPPED' : 'PASS',
      duration_ms: Math.round(duration),
      failure: failure ? decode(failure[1]).trim().split('\n').slice(0, 6).join('\n') : null,
    })
  }
  return results
}

function loadCases() {
  const cases = []
  for (const file of fs.readdirSync(catalogDir).filter(name => name.endsWith('.yaml') && name !== 'design.yaml')) {
    const doc = parse(fs.readFileSync(path.join(catalogDir, file), 'utf8'))
    for (const entry of doc?.cases ?? []) {
      cases.push({
        id: entry.id,
        title: entry.title,
        domain: entry.domain || doc.domain,
        priority: entry.priority,
        class: entry.class,
        suites: entry.suites ?? [],
        automation: entry.automation ?? [],
      })
    }
  }
  return cases
}

function gitValue(args) {
  const result = spawnSync('git', args, { cwd: root, encoding: 'utf8' })
  return result.status === 0 ? result.stdout.trim() : ''
}

function digestOf(cases) {
  const payload = cases.map(item => `${item.case_id}:${item.result}`).sort().join('\n')
  return crypto.createHash('sha256').update(payload).digest('hex').slice(0, 16)
}

function latestRun(excludeId = '') {
  if (!fs.existsSync(runsDir)) return null
  const dirs = fs.readdirSync(runsDir).filter(name => name !== excludeId).sort()
  for (let index = dirs.length - 1; index >= 0; index -= 1) {
    const file = path.join(runsDir, dirs[index], 'run.json')
    if (fs.existsSync(file)) return { id: dirs[index], data: JSON.parse(fs.readFileSync(file, 'utf8')) }
  }
  return null
}

const escapeHtml = value => String(value)
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')

function renderMarkdown(run) {
  const s = run.summary
  const lines = [
    `# 测试执行记录 · ${run.run_id}`,
    '',
    `- 用例：**${s.total}** · PASS **${s.pass}** · FAIL **${s.fail}** · SKIPPED **${s.skipped}** · MISSING **${s.missing}**`,
    `- 提交：\`${run.commit || 'unknown'}\`（${run.branch || 'unknown'}）`,
    `- 环境：node ${run.node} · ${run.started_at}`,
    `- 复核：${run.reviewed ? `${run.reviewed.by} · ${run.reviewed.at}` : '**未复核**'}`,
    '',
  ]
  for (const [domain, stats] of Object.entries(run.byDomain)) {
    lines.push(`- ${domain}: ${stats.pass}/${stats.total}`)
  }
  const problems = run.cases.filter(item => item.result !== 'PASS')
  if (problems.length) {
    lines.push('', '## 未通过', '', '| 用例 | 优先级 | 结果 | 说明 |', '| --- | --- | --- | --- |')
    for (const item of problems) {
      lines.push(`| \`${item.case_id}\` | ${item.priority} | ${item.result} | ${String(item.failure || '没有产生结果').replace(/\n/g, '<br>')} |`)
    }
  }
  if (run.compare) {
    lines.push('', '## 与上次相比', '', `- 上次：\`${run.compare.run_id}\``)
    lines.push(`- 新失败：${run.compare.newlyFailed.join(', ') || '无'}`)
    lines.push(`- 已修复：${run.compare.fixed.join(', ') || '无'}`)
    lines.push(`- 新缺失：${run.compare.newlyMissing.join(', ') || '无'}`)
  }
  lines.push('', '## 全部结果', '', '| 用例 | 优先级 | 结果 | 耗时 |', '| --- | --- | --- | --- |')
  for (const item of run.cases) {
    lines.push(`| \`${item.case_id}\` ${item.title} | ${item.priority} | ${item.result} | ${item.duration_ms}ms |`)
  }
  return `${lines.join('\n')}\n`
}

function renderHtml(run) {
  const s = run.summary
  const rows = run.cases.map(item => `<tr class="${item.result}"><td>${escapeHtml(item.case_id)}</td><td>${escapeHtml(item.title)}</td><td>${item.priority}</td><td>${item.result}</td><td>${item.duration_ms}ms</td></tr>`).join('\n')
  return `<!doctype html>
<html lang="zh"><head><meta charset="utf-8"><title>测试执行记录 ${escapeHtml(run.run_id)}</title>
<style>
body{font:14px/1.6 -apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;margin:32px;color:#1f2937}
h1{font-size:20px;margin:0 0 12px}
.meta{color:#6b7280;margin-bottom:20px}
.cards{display:flex;gap:12px;margin-bottom:20px}
.card{border:1px solid #e5e7eb;border-radius:8px;padding:10px 16px;min-width:120px}
.card b{display:block;font-size:22px}
table{border-collapse:collapse;width:100%}
th,td{border-bottom:1px solid #e5e7eb;padding:6px 8px;text-align:left}
tr.FAIL td{background:#fef2f2}
tr.MISSING td{background:#fffbeb}
tr.SKIPPED td{color:#6b7280}
</style></head><body>
<h1>测试执行记录 · ${escapeHtml(run.run_id)}</h1>
<div class="meta">提交 ${escapeHtml(run.commit || 'unknown')}（${escapeHtml(run.branch || 'unknown')}）· node ${escapeHtml(run.node)} · ${escapeHtml(run.started_at)}<br>
复核：${run.reviewed ? `${escapeHtml(run.reviewed.by)} · ${escapeHtml(run.reviewed.at)}` : '<b>未复核</b>'}</div>
<div class="cards">
<div class="card"><b>${s.total}</b>用例</div><div class="card"><b style="color:#047857">${s.pass}</b>PASS</div>
<div class="card"><b style="color:#b91c1c">${s.fail}</b>FAIL</div><div class="card"><b style="color:#b45309">${s.skipped}</b>SKIPPED</div>
<div class="card"><b style="color:#b45309">${s.missing}</b>MISSING</div>
</div>
<table><thead><tr><th>用例</th><th>标题</th><th>优先级</th><th>结果</th><th>耗时</th></tr></thead>
<tbody>${rows}</tbody></table></body></html>`
}

/* ---------------------------------------------------------------- strict/approve */

function loadRunForReview() {
  const explicit = valueOf('--run')
  if (explicit) return JSON.parse(fs.readFileSync(path.resolve(root, explicit), 'utf8'))
  const latest = latestRun()
  if (!latest) {
    console.error('还没有任何执行记录，先跑一次 node tools/catalog/run.mjs')
    process.exit(1)
  }
  return latest.data
}

if (flag('--strict')) {
  const run = loadRunForReview()
  const pending = run.cases.filter(item => item.result !== 'PASS')
  const digest = digestOf(run.cases)
  if (pending.length) {
    for (const item of pending) console.error(`  ${item.result} ${item.case_id} ${item.title}`)
    console.error(`strict: ${run.run_id} 有 ${pending.length} 条未通过`)
    process.exit(1)
  }
  if (!run.reviewed) {
    console.error(`strict: ${run.run_id} 尚未复核（node tools/catalog/run.mjs --approve --by <name>）`)
    process.exit(1)
  }
  if (run.reviewed.digest !== digest) {
    console.error(`strict: ${run.run_id} 的复核哈希与结果不一致，记录被改过`)
    process.exit(1)
  }
  console.log(`strict: ${run.run_id} 全部通过，复核人为 ${run.reviewed.by}`)
  process.exit(0)
}

if (flag('--approve')) {
  const by = valueOf('--by')
  if (!by) {
    console.error('需要 --by <复核人>')
    process.exit(1)
  }
  const run = loadRunForReview()
  const pending = run.cases.filter(item => item.result !== 'PASS')
  if (pending.length) {
    console.error(`不能复核未通过的执行：${pending.map(item => item.case_id).join(', ')}`)
    process.exit(1)
  }
  run.reviewed = { by, at: new Date().toISOString(), digest: digestOf(run.cases) }
  const file = path.join(runsDir, run.run_id, 'run.json')
  fs.writeFileSync(file, `${JSON.stringify(run, null, 2)}\n`)
  console.log(`已复核 ${run.run_id}（${run.summary.pass}/${run.summary.total}），复核人 ${by}`)
  process.exit(0)
}

/* ---------------------------------------------------------------- run */

const suite = valueOf('--suite')
const startedAt = new Date()
const runId = `${startedAt.toISOString().replace(/[-:]/g, '').replace(/\..+/, '').replace('T', '-')}-${gitValue(['rev-parse', '--short', 'HEAD']) || 'nocommit'}`
const outDir = path.join(runsDir, runId)
fs.mkdirSync(outDir, { recursive: true })

const testFiles = fs.readdirSync(testsDir)
  .filter(name => name.endsWith('.test.mjs'))
  .map(name => path.join('tests', name))
const junitPath = path.join(outDir, 'junit.xml')
const run = spawnSync(process.execPath, [
  '--test', '--test-reporter=junit', `--test-reporter-destination=${junitPath}`, ...testFiles,
], { cwd: root, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] })

const xml = fs.existsSync(junitPath) ? fs.readFileSync(junitPath, 'utf8') : ''
const results = parseJunit(xml)
const cases = loadCases().filter(entry => (!suite || entry.suites.includes(suite)))
  .map(entry => {
    const links = entry.automation.map(link => link.test)
    const hit = links.map(name => results.get(name)).find(Boolean)
    const declared = links.map(name => results.get(name)).filter(Boolean)
    return {
      case_id: entry.id,
      title: entry.title,
      priority: entry.priority,
      domain: entry.domain,
      suites: entry.suites,
      result: declared.length === 0 ? 'MISSING' : declared.every(item => item.result === 'PASS') ? 'PASS' : (declared.find(item => item.result === 'FAIL') ? 'FAIL' : 'SKIPPED'),
      duration_ms: declared.reduce((sum, item) => sum + item.duration_ms, 0),
      failure: declared.find(item => item.failure)?.failure ?? null,
      _hit: hit,
    }
  })

const byDomain = {}
for (const item of cases) {
  const stat = byDomain[item.domain] ?? { total: 0, pass: 0 }
  stat.total += 1
  if (item.result === 'PASS') stat.pass += 1
  byDomain[item.domain] = stat
}

const summary = {
  total: cases.length,
  pass: cases.filter(item => item.result === 'PASS').length,
  fail: cases.filter(item => item.result === 'FAIL').length,
  skipped: cases.filter(item => item.result === 'SKIPPED').length,
  missing: cases.filter(item => item.result === 'MISSING').length,
}

const previous = flag('--compare') ? latestRun(runId) : null
const compare = previous ? {
  run_id: previous.id,
  newlyFailed: cases.filter(item => item.result === 'FAIL' && previous.data.cases.find(old => old.case_id === item.case_id)?.result === 'PASS').map(item => item.case_id),
  fixed: cases.filter(item => item.result === 'PASS' && previous.data.cases.find(old => old.case_id === item.case_id)?.result === 'FAIL').map(item => item.case_id),
  newlyMissing: cases.filter(item => item.result === 'MISSING' && previous.data.cases.find(old => old.case_id === item.case_id)?.result !== 'MISSING').map(item => item.case_id),
} : null

const record = {
  run_id: runId,
  started_at: startedAt.toISOString(),
  suite: suite || 'all',
  commit: gitValue(['rev-parse', 'HEAD']),
  branch: gitValue(['rev-parse', '--abbrev-ref', 'HEAD']),
  node: process.version,
  summary,
  byDomain,
  compare,
  cases: cases.map(({ _hit, ...rest }) => rest),
}
fs.writeFileSync(path.join(outDir, 'run.json'), `${JSON.stringify(record, null, 2)}\n`)
fs.writeFileSync(path.join(outDir, 'report.md'), renderMarkdown(record))
fs.writeFileSync(path.join(outDir, 'report.html'), renderHtml(record))

const failed = summary.fail + summary.missing
console.log(`run ${runId}: ${summary.pass}/${summary.total} PASS · fail ${summary.fail} · missing ${summary.missing}`)
console.log(`报告：${path.relative(root, path.join(outDir, 'report.html'))}（同目录还有 run.json / report.md / junit.xml）`)
if (compare) {
  console.log(`对比 ${compare.run_id}: 新失败 ${compare.newlyFailed.length} · 已修复 ${compare.fixed.length} · 新缺失 ${compare.newlyMissing.length}`)
}
process.exit(failed > 0 || run.status !== 0 ? 1 : 0)
