#!/usr/bin/env node
/**
 * Shared loader for the design source and its review hash.
 *
 * `design.yaml` is the only place business rules live; the catalog and the
 * review tool both read it through here so they cannot disagree about shape.
 */
import fs from 'node:fs'
import path from 'node:path'
import crypto from 'node:crypto'
import { parse } from 'yaml'

export const BRANCH_KINDS = ['valid', 'invalid', 'boundary', 'n-a']
export const TECHNIQUES = ['等价类', '边界值', '决策表', '状态迁移', '故障注入', '并发测试', '不变量', '时序']

/** Normalise a branch entry; `n-a` carries a reason instead of text. */
export function normaliseBranch(branch) {
  if (!branch || typeof branch !== 'object') return null
  const kind = String(branch.kind || '').trim()
  if (!BRANCH_KINDS.includes(kind)) return null
  if (kind === 'n-a') return { kind, reason: String(branch.reason || '').trim() }
  return { kind, text: String(branch.text || '').trim() }
}

/**
 * Content hash of the parts a human signs off on.
 *
 * The statement, the failure it prevents, and every branch are hashed; touching
 * any of them invalidates a previous approval on purpose.
 */
export function ruleHash(rule) {
  const payload = {
    statement: String(rule.statement || '').trim(),
    failure: String(rule.failure || '').trim(),
    branches: (rule.branches || []).map(normaliseBranch).filter(Boolean),
  }
  return crypto.createHash('sha256').update(JSON.stringify(payload)).digest('hex').slice(0, 16)
}

/**
 * Load `design.yaml`.
 *
 * Returns `{ features, rules, invariants, errors }`; shape problems are
 * reported through `errors` so the caller decides whether to fail or warn.
 */
export function loadDesign(file) {
  const errors = []
  const rules = new Map()
  const invariants = new Map()
  const features = []
  if (!fs.existsSync(file)) {
    errors.push(`${path.relative(process.cwd(), file)} is missing`)
    return { features, rules, invariants, errors }
  }
  let doc
  try {
    doc = parse(fs.readFileSync(file, 'utf8'))
  } catch (error) {
    errors.push(`design.yaml: cannot parse YAML (${error.message})`)
    return { features, rules, invariants, errors }
  }

  for (const feature of doc?.features ?? []) {
    if (!feature?.id) errors.push('design.yaml: a feature without an id')
    features.push(feature)
    for (const rule of feature?.rules ?? []) {
      if (!rule?.id) {
        errors.push(`design.yaml: ${feature?.id}: a rule without an id`)
        continue
      }
      if (rules.has(rule.id)) errors.push(`design.yaml: duplicate rule ${rule.id}`)
      rules.set(rule.id, {
        ...rule,
        feature: feature.id,
        owner: rule.owner || feature.owner || '',
        branches: Array.isArray(rule.branches) ? rule.branches.map(normaliseBranch).filter(Boolean) : [],
      })
    }
  }
  for (const invariant of doc?.invariants ?? []) {
    if (!invariant?.id) {
      errors.push('design.yaml: an invariant without an id')
      continue
    }
    invariants.set(invariant.id, invariant)
    for (const ruleId of invariant.rules ?? []) {
      if (!rules.has(ruleId)) errors.push(`design.yaml: ${invariant.id} points at unknown rule ${ruleId}`)
    }
  }
  return { features, rules, invariants, errors }
}
