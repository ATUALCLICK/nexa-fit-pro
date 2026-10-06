import type { Answers } from '../quiz/engine/types'
import { goalPct } from './personalization'
import type { DerivedToken, DiagnosisDef, Icp } from './schema'
import { evalRule, type RuleCtx } from './rules'

/*
 * Profile Engine dirigido por dados — as regras vivem em funnel.icp (JSON),
 * aqui só fica a máquina de avaliação. Substitui o antigo profile.ts hard-coded.
 */

export interface Profile {
  personas: string[]
  variantKeys: string[]
  plan: { recommended: string }
  flags: Record<string, boolean>
  tokens: Record<string, string>
}

/* numéricos calculados disponíveis como $calc:* nas regras */
function buildCalc(a: Answers): Record<string, number> {
  return { goalPct: goalPct(a) }
}

export function baseCtx(a: Answers, icp: Icp): RuleCtx {
  const calc = buildCalc(a)
  const flags: Record<string, boolean> = {}
  for (const [name, rule] of Object.entries(icp.flags)) {
    flags[name] = evalRule(rule, { answers: a, flags, personas: [], calc })
  }
  return { answers: a, flags, personas: [], calc }
}

export function deriveProfile(a: Answers, icp: Icp): Profile {
  const ctx = baseCtx(a, icp)

  /* personas: ordem do array; suppressIf remove; layer sempre entra se detect bater */
  const personas: string[] = []
  for (const p of icp.personas) {
    if (!evalRule(p.detect, ctx)) continue
    if (p.suppressIf?.some((s) => personas.includes(s))) continue
    personas.push(p.id)
  }
  ctx.personas = personas

  /* variant keys: ordem do array = prioridade crescente no merge */
  const variantKeys: string[] = []
  for (const v of icp.variantRules) {
    if ('keyPrefix' in v) {
      const val = a[v.source]
      if (typeof val === 'string' && val && !(v.exclude ?? []).includes(val)) {
        variantKeys.push(`${v.keyPrefix}${val}`)
      }
    } else if (evalRule(v.when, ctx)) {
      variantKeys.push(v.key)
    }
  }

  /* plano recomendado: primeira regra que bate; senão default */
  let recommended = icp.defaultPlan
  for (const r of icp.planRules) {
    if (evalRule(r.when, ctx)) { recommended = r.plan; break }
  }

  return {
    personas,
    variantKeys,
    plan: { recommended },
    flags: ctx.flags,
    tokens: deriveTokens(a, icp.tokens),
  }
}

/* ---------------- tokens derivados (icp.tokens) ---------------- */

const arr = (a: Answers, k: string) => (Array.isArray(a[k]) ? (a[k] as string[]) : [])

export function joinPt(list: string[]): string {
  if (list.length <= 1) return list[0] ?? ''
  return `${list.slice(0, -1).join(', ')} e ${list[list.length - 1]}`
}

export function evalDerivedToken(a: Answers, def: DerivedToken): string {
  if ('firstMatch' in def) {
    for (const c of def.firstMatch) {
      if (a[c.key] === c.eq) return c.token
    }
    return def.default
  }
  const values = arr(a, def.source).filter((v) => !(def.exclude ?? []).includes(v))
  const single = typeof a[def.source] === 'string' ? (a[def.source] as string) : null

  if (def.priority) {
    for (const p of def.priority) {
      if (values.includes(p) && def.map[p]) return def.map[p]
    }
    return def.default ?? ''
  }
  if (def.first) {
    const v = values[0] ?? single
    return (v && def.map[v]) || def.default || ''
  }
  if (def.join) {
    const labels = values.map((v) => def.map[v]).filter(Boolean)
    if (single && def.map[single]) labels.push(def.map[single])
    return labels.length ? joinPt(labels) : (def.default ?? '')
  }
  /* lookup simples sobre valor escalar */
  return (single && def.map[single]) || def.default || ''
}

export function deriveTokens(a: Answers, defs: Record<string, DerivedToken>): Record<string, string> {
  const out: Record<string, string> = {}
  for (const [name, def] of Object.entries(defs)) out[name] = evalDerivedToken(a, def)
  return out
}

/* ---------------- diagnóstico ---------------- */

export function resolveDiagnosis(a: Answers, icp: Icp): DiagnosisDef {
  const ctx = baseCtx(a, icp)
  let fallback: DiagnosisDef | null = null
  for (const d of icp.diagnoses) {
    if (!d.when) { fallback = d; continue }
    if (evalRule(d.when, ctx)) return d
  }
  if (fallback) return fallback
  throw new Error('funnel.icp.diagnoses precisa de uma entrada fallback (sem "when")')
}

/* merge de variants sobre o payload base (ordem crescente de prioridade) */
export function applyVariants(
  payload: Record<string, unknown>,
  variantKeys: string[],
): Record<string, unknown> {
  const variants = payload.variants as Record<string, Record<string, unknown>> | undefined
  if (!variants) return payload
  let merged = { ...payload }
  for (const key of variantKeys) {
    if (variants[key]) merged = { ...merged, ...variants[key] }
  }
  return merged
}
