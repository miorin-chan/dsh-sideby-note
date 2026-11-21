#!/usr/bin/env node
/**
 * Human review helper for tests/catalog/design.yaml.
 *
 * Review is the slow part of the catalog, so this tool removes everything that
 * is not a judgement call:
 *
 *   node tools/catalog/review.mjs                 # one-screen rule index
 *   node tools/catalog/review.mjs --since origin/main   # only what changed
 *   node tools/catalog/review.mjs --approve --by <name> [--rules R-…]
 *   node tools/catalog/review.mjs --strict        # fail when P0 rules are unreviewed
 *
 * An approval stores a content hash; editing statement/failure/branches makes
 * the approval stale automatically, so nobody signs off on text they did not read.
 */
import fs from 'node:fs'
import path from 'node:path'
import { execFileSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'
import { parse } from 'yaml'
import { loadDesign, ruleHash } from './design.mjs'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..')
const designFile = path.join(root, 'tests/catalog/design.yaml')
const catalogDir = path.join(root, 'tests/catalog')

const argv = process.argv.slice(2)
const flag = name => argv.includes(name)
const valueOf = name => {
  const index = argv.indexOf(name)
  return index >= 0 ? argv[index + 1] : ''
}

const relative = path.relative(root, designFile)
const { rules, features, errors } = loadDesign(designFile)
if (errors.length) {
  for (const message of errors) console.error(`error: ${message}`)
  process.exit(1)
}

/** rule id -> { automated, planned, total, p0 } */
function loadCaseStats() {
  const stats = new Map()
  const files = fs.readdirSync(catalogDir).filter(name => name.endsWith('.yaml') && name !== 'design.yaml')
  for (const file of files) {
    const doc = parse(fs.readFileSync(path.join(catalogDir, file), 'utf8'))
    for (const entry of doc?.cases ?? []) {
      for (const ruleId of entry.rules ?? []) {
        const stat = stats.get(ruleId) ?? { automated: 0, planned: 0, total: 0, p0: 0 }
        stat.total += 1
        if ((entry.state || 'automated') === 'planned') stat.planned += 1
        else if ((entry.automation ?? []).some(link => link.status === 'automated')) stat.automated += 1
        if (entry.priority === 'P0') stat.p0 += 1
        stats.set(ruleId, stat)
      }
    }
  }
  return stats
}

const caseStats = loadCaseStats()
const reviewState = rule => {
  if (!rule.reviewed) return '—'
  return rule.reviewed.hash === ruleHash(rule) ? 'ok' : 'stale'
}

const pad = (text, width) => {
  const value = String(text)
  const length = [...value].length
  return length >= width ? value : value + ' '.repeat(width - length)
}
const short = (text, width) => {
  const chars = [...String(text)]
  return chars.length <= width ? String(text) : `${chars.slice(0, width - 1).join('')}…`
}

function printIndex(entries) {
  console.log(`${pad('FEATURE', 9)}${pad('RULE', 20)}${pad('BR', 4)}${pad('CASES auto/plan', 16)}${pad('REVIEW', 8)}STATEMENT`)
  for (const rule of entries) {
    const stat = caseStats.get(rule.id) ?? { automated: 0, planned: 0 }
    console.log(
      pad(rule.feature, 9)
      + pad(rule.id, 20)
      + pad(rule.branches.length, 4)
      + pad(`${stat.automated}/${stat.planned}`, 16)
      + pad(reviewState(rule), 8)
      + short(rule.statement, 64),
    )
  }
}

function gitShowDesign(ref) {
  try {
    return execFileSync('git', ['show', `${ref}:${relative}`], { cwd: root, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] })
  } catch {
    return null
  }
}

function printSince(ref) {
  const previous = gitShowDesign(ref)
  if (previous === null) {
    console.log(`（${ref} 里没有 ${relative}，全部按新增处理）\n`)
    printIndex([...rules.values()])
    return
  }
  let oldDoc
  try {
    oldDoc = parse(previous)
  } catch {
    console.log(`（${ref} 里的 design.yaml 无法解析，全部按新增处理）\n`)
    printIndex([...rules.values()])
    return
  }
  const previousRules = new Map()
  for (const feature of oldDoc?.features ?? []) {
    for (const rule of feature?.rules ?? []) previousRules.set(rule.id, rule)
  }
  const rows = []
  for (const rule of rules.values()) {
    const before = previousRules.get(rule.id)
    if (!before) rows.push({ status: 'added', rule })
    else if (ruleHash(before) !== ruleHash(rule)) rows.push({ status: 'changed', rule })
  }
  for (const [id, rule] of previousRules) {
    if (!rules.has(id)) rows.push({ status: 'removed', rule: { ...rule, feature: '', branches: [] } })
  }
  if (rows.length === 0) {
    console.log(`自 ${ref} 以来业务规则没有变化。`)
    return
  }
  console.log(`自 ${ref} 以来有 ${rows.length} 条规则需要评审：\n`)
  for (const { status, rule } of rows) {
    const stat = caseStats.get(rule.id) ?? { automated: 0, planned: 0 }
    console.log(`[${status}] ${rule.id}`)
    console.log(`  statement : ${rule.statement}`)
    if (rule.failure) console.log(`  failure   : ${rule.failure}`)
    console.log(`  cases     : ${stat.automated} 自动化 / ${stat.planned} planned`)
    if (status === 'removed') console.log('  ⚠️ 规则被删除，检查是否还有用例引用它')
    console.log('')
  }
}

function setReviewed(text, id, by, at, hash) {
  const lines = text.split('\n')
  const start = lines.findIndex(line => new RegExp(`^\\s*- id: ${id}$`).test(line))
  if (start < 0) return { text, ok: false }
  const indent = (lines[start].match(/^\s*/) || [''])[0]
  let end = lines.length
  for (let i = start + 1; i < lines.length; i += 1) {
    if (lines[i].startsWith('invariants:')) { end = i; break }
    const next = lines[i].match(/^(\s*)- id:/)
    if (next && next[1].length <= indent.length) { end = i; break }
  }
  const body = lines.slice(start, end).filter(line => !/^\s*reviewed:/.test(line))
  let insertAt = body.length
  while (insertAt > 0 && body[insertAt - 1].trim() === '') insertAt -= 1
  body.splice(insertAt, 0, `${indent}  reviewed: { by: ${JSON.stringify(by)}, at: '${at}', hash: '${hash}' }`)
  lines.splice(start, end - start, ...body)
  return { text: lines.join('\n'), ok: true }
}

function approve(by, only) {
  if (!by) {
    console.error('需要 --by <评审人>')
    process.exit(1)
  }
  const targets = only
    ? only.split(',').map(id => id.trim()).filter(Boolean)
    : [...rules.keys()]
  const missing = targets.filter(id => !rules.has(id))
  if (missing.length) {
    console.error(`未知规则：${missing.join(', ')}`)
    process.exit(1)
  }
  const at = new Date().toISOString().slice(0, 10)
  let text = fs.readFileSync(designFile, 'utf8')
  let count = 0
  for (const id of targets) {
    const hash = ruleHash(rules.get(id))
    const next = setReviewed(text, id, by, at, hash)
    if (!next.ok) {
      console.error(`找不到规则 ${id} 的块，跳过`)
      continue
    }
    text = next.text
    count += 1
  }
  fs.writeFileSync(designFile, text)
  console.log(`已标记 ${count} 条规则由 ${by} 在 ${at} 评审通过；改动内容后哈希会自动失效。`)
  // Print what was signed so the record shows the text, not just the ids.
  for (const id of targets) console.log(`  - ${id}: ${short(rules.get(id)?.statement ?? '', 42)}`)
  console.log('接着跑：npm run catalog:check')
}

function strictReview() {
  const p0 = [...rules.values()].filter(rule => (caseStats.get(rule.id)?.p0 ?? 0) > 0)
  const pending = p0.filter(rule => reviewState(rule) !== 'ok')
  if (pending.length === 0) {
    console.log(`strict: ${p0.length} 条 P0 相关规则均已评审。`)
    return
  }
  console.error(`strict: ${pending.length}/${p0.length} 条 P0 相关规则未评审或评审已过期：`)
  for (const rule of pending) console.error(`  - ${rule.id} (${reviewState(rule)})`)
  process.exit(1)
}

if (flag('--approve')) approve(valueOf('--by'), valueOf('--rules'))
else if (flag('--strict')) strictReview()
else if (valueOf('--since')) printSince(valueOf('--since'))
else printIndex([...rules.values()])
