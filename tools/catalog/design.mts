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

export const BRANCH_KINDS = ['valid', 'invalid', 'boundary', 'n-a'] as const
export const TECHNIQUES = ['等价类', '边界值', '决策表', '状态迁移', '故障注入', '并发测试', '不变量', '时序']

type BranchKind = typeof BRANCH_KINDS[number]
type Branch = { kind: 'n-a'; reason: string } | { kind: Exclude<BranchKind, 'n-a'>; text: string }

export interface DesignRuleInput {
  id: string
  owner?: string
  statement?: string
  failure?: string
  technique?: string[]
  branches?: unknown[]
  reviewed?: { by?: string; at?: string; hash?: string }
}

interface Feature {
  id: string
  owner?: string
  rules?: DesignRuleInput[]
}

interface Invariant {
  id: string
  rules?: string[]
}

export interface DesignDocument {
  features?: Feature[]
  invariants?: Invariant[]
}

export interface DesignRule extends DesignRuleInput {
  feature: string
  owner: string
  branches: Branch[]
}

export interface CatalogCase {
  id: string
  title: string
  domain?: string
  owner?: string
  priority: string
  class: string
  risk: string
  expected: string[]
  rules?: string[]
  suites?: string[]
  state?: string
  automation?: Array<{ type: string; file: string; test: string; status: string }>
  reason?: string
  waiver?: string
}

export interface CatalogDocument {
  domain: string
  owner?: string
  cases?: CatalogCase[]
}

/** Normalise a branch entry; `n-a` carries a reason instead of text. */
export function normaliseBranch(branch: unknown): Branch | null {
  if (!branch || typeof branch !== 'object') return null
  const { kind: rawKind, reason, text } = branch as Record<string, unknown>
  const kind = String(rawKind || '').trim() as BranchKind
  if (!BRANCH_KINDS.includes(kind)) return null
  if (kind === 'n-a') return { kind, reason: String(reason || '').trim() }
  return { kind, text: String(text || '').trim() }
}

/**
 * Content hash of the parts a human signs off on.
 *
 * The statement, the failure it prevents, and every branch are hashed; touching
 * any of them invalidates a previous approval on purpose.
 */
export function ruleHash(rule: Pick<DesignRuleInput, 'statement' | 'failure' | 'branches'>) {
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
export function loadDesign(file: string) {
  const errors: string[] = []
  const rules = new Map<string, DesignRule>()
  const invariants = new Map<string, Invariant>()
  const features: Feature[] = []
  if (!fs.existsSync(file)) {
    errors.push(`${path.relative(process.cwd(), file)} is missing`)
    return { features, rules, invariants, errors }
  }
  let doc: DesignDocument | null
  try {
    doc = parse(fs.readFileSync(file, 'utf8'))
  } catch (error) {
    errors.push(`design.yaml: cannot parse YAML (${error instanceof Error ? error.message : String(error)})`)
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
        branches: Array.isArray(rule.branches) ? rule.branches.map(normaliseBranch).filter(branch => branch !== null) : [],
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
