#!/usr/bin/env node
/**
 * Validates the case catalog against its design source and the tests.
 *
 * The chain is one-way: business rules (design.yaml) → cases (cases/*.yaml) →
 * tests (*.test.mjs). This script checks every link of it:
 *
 *   - every case cites at least one rule, and the rule exists;
 *   - every rule is covered by at least one case;
 *   - every invariant points at real rules;
 *   - every automation pointer resolves to a real test in a real file;
 *   - every P0 case is automated or explicitly waived;
 *   - every id-prefixed test in the repo is catalogued (no orphan ids).
 *
 * Run it in CI: `npm run catalog:check`. It exits non-zero on any error.
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { parse } from 'yaml'
import { BRANCH_KINDS, TECHNIQUES, loadDesign, ruleHash } from './design.mjs'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..')
const catalogDir = path.join(root, 'tests/catalog')
const designFile = path.join(catalogDir, 'design.yaml')
const testsDir = path.join(root, 'tests')

const PRIORITIES = ['P0', 'P1', 'P2', 'P3']
// Test-design classes: normal path, legal variants, rules/boundaries, invalid
// input or state, technical failures, concurrency and interaction ordering.
const CLASSES = ['A', 'B', 'C', 'D', 'E', 'F']
const RISKS = ['data_loss', 'crash', 'ux', 'privacy', 'docs', 'build']
const STATUSES = ['automated', 'manual', 'planned', 'waived']
const STATES = ['automated', 'planned', 'manual', 'retired']
const TYPES = ['unit', 'contract', 'integration', 'e2e', 'policy']
const SUITES = ['smoke', 'pr', 'nightly', 'release', 'deep']
const ID_PATTERN = /^[A-Z][A-Z0-9]{1,5}-\d{3}$/

const errors = []
const warnings = []
const fail = message => errors.push(message)
const warn = message => warnings.push(message)

/** test name -> file, for every test declared under tests/. */
const declared = new Map()

function collectTests() {
  const files = fs.readdirSync(testsDir, { withFileTypes: true })
    .filter(entry => entry.isFile() && entry.name.endsWith('.test.mjs'))
    .map(entry => entry.name)
  for (const file of files) {
    const text = fs.readFileSync(path.join(testsDir, file), 'utf8')
    // `test('NAME', …)` and `t.test('NAME', …)`; the quote is back-referenced
    // so an apostrophe inside a name cannot truncate the match.
    for (const match of text.matchAll(/(?:^|[^\w.])(?:t\.test|test)\(\s*(['"])([\s\S]*?)\1/g)) {
      const name = match[2]
      if (!name.includes('\n')) declared.set(name, `tests/${file}`)
    }
  }
}

function loadCases() {
  const files = fs.readdirSync(catalogDir)
    .filter(name => (name.endsWith('.yaml') || name.endsWith('.yml')) && name !== 'design.yaml')
    .sort()
  const cases = []
  const byId = new Map()
  for (const file of files) {
    const relative = `tests/catalog/${file}`
    let doc
    try {
      doc = parse(fs.readFileSync(path.join(catalogDir, file), 'utf8'))
    } catch (error) {
      fail(`${relative}: cannot parse YAML (${error.message})`)
      continue
    }
    if (!doc || !Array.isArray(doc.cases)) {
      fail(`${relative}: expected a top-level "cases:" list`)
      continue
    }
    for (const entry of doc.cases) {
      if (!entry || typeof entry !== 'object') {
        fail(`${relative}: empty case entry`)
        continue
      }
      if (byId.has(entry.id)) {
        fail(`${relative}: duplicate id ${entry.id} (already in ${byId.get(entry.id)})`)
        continue
      }
      byId.set(entry.id, relative)
      cases.push({ domain: doc.domain, owner: doc.owner, ...entry, file: relative })
    }
  }
  return cases
}

function checkShape(entry) {
  const where = `${entry.file}: ${entry.id ?? '<missing id>'}`
  if (!ID_PATTERN.test(String(entry.id))) fail(`${where}: id must look like NOTE-004`)
  if (!entry.title || typeof entry.title !== 'string') fail(`${where}: missing title`)
  if (!PRIORITIES.includes(entry.priority)) fail(`${where}: priority must be one of ${PRIORITIES.join('/')}`)
  if (!CLASSES.includes(entry.class)) fail(`${where}: class must be one of ${CLASSES.join('/')}`)
  if (!RISKS.includes(entry.risk)) fail(`${where}: risk must be one of ${RISKS.join('/')}`)
  if (!entry.owner) fail(`${where}: missing owner`)
  if (!entry.domain) fail(`${where}: missing domain (case or file level)`)
  if (!Array.isArray(entry.expected) || entry.expected.length === 0) fail(`${where}: expected must be a non-empty list`)
  if (!Array.isArray(entry.rules) || entry.rules.length === 0) fail(`${where}: rules must name at least one business rule`)
  if (!Array.isArray(entry.suites) || entry.suites.length === 0) fail(`${where}: suites must be a non-empty list`)
  for (const suite of entry.suites ?? []) {
    if (!SUITES.includes(suite)) fail(`${where}: unknown suite ${suite}`)
  }
  const state = entry.state || 'automated'
  if (!STATES.includes(state)) fail(`${where}: state must be one of ${STATES.join('/')}`)
  if (state === 'planned' && !entry.reason) fail(`${where}: a planned case needs a reason`)
  if (state !== 'planned' && state !== 'retired' && (!Array.isArray(entry.automation) || entry.automation.length === 0)) {
    fail(`${where}: automation must be a non-empty list unless the case is planned`)
  }
  for (const link of entry.automation ?? []) {
    if (!TYPES.includes(link.type)) fail(`${where}: unknown automation type ${link.type}`)
    if (!STATUSES.includes(link.status)) fail(`${where}: unknown status ${link.status}`)
    if (!link.file) fail(`${where}: automation entry without a file`)
    if (!link.test) fail(`${where}: automation entry without a test name`)
  }
}

function checkAutomation(entry) {
  const where = `${entry.file}: ${entry.id}`
  for (const link of entry.automation ?? []) {
    const absolute = path.join(root, link.file ?? '')
    if (!fs.existsSync(absolute)) {
      fail(`${where}: ${link.file} does not exist`)
      continue
    }
    const declaredIn = declared.get(link.test)
    if (!declaredIn) {
      fail(`${where}: no test named "${link.test}" under tests/`)
      continue
    }
    if (declaredIn !== link.file) {
      fail(`${where}: "${link.test}" lives in ${declaredIn}, not ${link.file}`)
    }
  }
  const automated = (entry.automation ?? []).filter(link => link.status === 'automated').length
  if (entry.priority === 'P0' && automated === 0 && !entry.waiver) {
    fail(`${where}: a P0 case needs an automated test or a waiver with a reason`)
  }
  if (entry.priority === 'P0' && !(entry.suites ?? []).includes('release')) {
    warn(`${where}: P0 cases usually belong to the release suite`)
  }
}

function checkRule(rule) {
  const where = `design.yaml: ${rule.id}`
  if (!rule.statement) fail(`${where}: missing statement`)
  if (!rule.failure) fail(`${where}: missing failure (what goes wrong when the rule is broken)`)
  if (!rule.owner) fail(`${where}: missing owner (rule or feature level)`)
  if (!Array.isArray(rule.technique) || rule.technique.length === 0) fail(`${where}: missing technique`)
  for (const technique of rule.technique ?? []) {
    if (!TECHNIQUES.includes(technique)) fail(`${where}: unknown technique ${technique}`)
  }
  if (!Array.isArray(rule.branches) || rule.branches.length === 0) {
    fail(`${where}: needs structured branches`)
    return
  }
  const kinds = rule.branches.map(branch => branch.kind)
  if (!kinds.includes('valid')) fail(`${where}: needs a valid branch`)
  if (!kinds.includes('invalid') && !kinds.includes('boundary') && !kinds.includes('n-a')) {
    fail(`${where}: needs an invalid, boundary, or n-a branch`)
  }
  for (const branch of rule.branches) {
    if (branch.kind === 'n-a') {
      if (!branch.reason) fail(`${where}: an n-a branch needs a reason`)
    } else if (!branch.text) {
      fail(`${where}: a ${branch.kind} branch needs text`)
    }
  }
  const statement = String(rule.statement || '')
  if (statement.length > 160) warn(`${where}: statement is ${statement.length} chars; reviewers read one line at a time`)
  if (/`|\b\w+\.(?:ts|js|mjs)\b|should/i.test(statement)) {
    fail(`${where}: statement reads like implementation (code identifier or "should")`)
  }
  if (rule.reviewed) {
    if (!rule.reviewed.by || !rule.reviewed.at) fail(`${where}: reviewed needs by and at`)
    if (rule.reviewed.hash !== ruleHash(rule)) {
      fail(`${where}: reviewed hash is stale — the rule changed after approval, ask for a re-review`)
    }
  }
}

function checkRuleLinks(cases, rules) {
  const covered = new Map()
  for (const entry of cases) {
    for (const ruleId of entry.rules ?? []) {
      if (!rules.has(ruleId)) {
        fail(`${entry.file}: ${entry.id}: unknown rule ${ruleId}`)
        continue
      }
      covered.set(ruleId, (covered.get(ruleId) ?? 0) + 1)
    }
  }
  for (const ruleId of rules.keys()) {
    if (!covered.has(ruleId)) fail(`design.yaml: rule ${ruleId} has no case`)
  }
  return covered
}

function checkOrphans(cases) {
  const catalogued = new Set()
  for (const entry of cases) {
    for (const link of entry.automation ?? []) catalogued.add(link.test)
  }
  for (const [name, file] of declared) {
    if (!/^[A-Z][A-Z0-9]{1,5}-\d{3}\b/.test(name)) continue
    if (!catalogued.has(name)) fail(`${file}: test "${name}" carries an id that is not in the catalog`)
  }
}

function checkDuplicates(cases) {
  const seen = new Map()
  for (const entry of cases) {
    for (const link of entry.automation ?? []) {
      const key = `${link.file}::${link.test}`
      if (seen.has(key)) warn(`${entry.id} and ${seen.get(key)} both point at "${link.test}"`)
      else seen.set(key, entry.id)
    }
  }
}

function report(cases, rules, invariants, covered) {
  const count = (predicate) => cases.filter(predicate).length
  const automated = count(entry => (entry.automation ?? []).some(link => link.status === 'automated'))
  const planned = count(entry => (entry.state || 'automated') === 'planned')
  const p0 = cases.filter(entry => entry.priority === 'P0')
  const p0Automated = p0.filter(entry => (entry.automation ?? []).some(link => link.status === 'automated'))
  const p0Waived = p0.filter(entry => !(entry.automation ?? []).some(link => link.status === 'automated') && entry.waiver)
  const lines = [
    `catalog: ${cases.length} cases in ${new Set(cases.map(entry => entry.domain)).size} domains`,
    `  by priority   ${PRIORITIES.map(p => `${p}=${count(entry => entry.priority === p)}`).join(' ')}`,
    `  by class      ${CLASSES.map(c => `${c}=${count(entry => entry.class === c)}`).join(' ')}`,
    `  by state      automated=${automated} planned=${planned}`,
    `  rules         ${covered.size}/${rules.size} covered, invariants=${invariants.size}`,
    `  P0 covered    ${p0Automated.length}/${p0.length} automated${p0Waived.length ? `, ${p0Waived.length} waived` : ''}`,
  ]
  console.log(lines.join('\n'))
}

collectTests()
const { rules, invariants, errors: designErrors } = loadDesign(designFile)
for (const message of designErrors) fail(message)
const cases = loadCases()
for (const rule of rules.values()) checkRule(rule)
for (const entry of cases) checkShape(entry)
for (const entry of cases) checkAutomation(entry)
const covered = checkRuleLinks(cases, rules)
checkOrphans(cases)
checkDuplicates(cases)
report(cases, rules, invariants, covered)

for (const message of warnings) console.warn(`warning: ${message}`)
if (errors.length > 0) {
  for (const message of errors) console.error(`error: ${message}`)
  console.error(`\ncatalog:check failed with ${errors.length} error(s)`)
  process.exit(1)
}
console.log('catalog:check ok')
