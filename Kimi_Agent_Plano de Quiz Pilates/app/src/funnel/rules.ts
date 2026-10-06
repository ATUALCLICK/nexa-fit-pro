import type { Answers } from '../quiz/engine/types'
import type { Cond, Rule } from './schema'

/*
 * Avaliador da DSL declarativa (guard / next.cases / detect / when).
 * Chaves especiais: $flag:<nome> · $persona:<id> · $calc:<nome> — demais leem answers[key].
 */

export interface RuleCtx {
  answers: Answers
  flags: Record<string, boolean>
  personas: string[]
  calc: Record<string, number>
}

export const emptyCtx = (answers: Answers): RuleCtx => ({
  answers, flags: {}, personas: [], calc: {},
})

function readKey(key: string, ctx: RuleCtx): unknown {
  if (key.startsWith('$flag:')) return ctx.flags[key.slice(6)] ?? false
  if (key.startsWith('$persona:')) return ctx.personas.includes(key.slice(9))
  if (key.startsWith('$calc:')) return ctx.calc[key.slice(6)] ?? 0
  return ctx.answers[key]
}

export function evalCond(c: Cond, ctx: RuleCtx): boolean {
  const raw = readKey(c.key, ctx)
  const arr = Array.isArray(raw) ? (raw as string[]) : null
  const str = typeof raw === 'string' ? raw : null
  const num = typeof raw === 'number' ? raw : null

  switch (c.op) {
    case 'eq': return raw === c.value
    case 'neq': return raw !== c.value
    case 'in': return Array.isArray(c.value) && str !== null && (c.value as string[]).includes(str)
    case 'not-in': return Array.isArray(c.value) && str !== null && !(c.value as string[]).includes(str)
    case 'includes': return arr !== null && arr.includes(String(c.value))
    case 'excludes': return arr !== null && !arr.includes(String(c.value))
    case 'empty': return raw === undefined || raw === '' || (arr !== null && arr.length === 0)
    case 'not-empty': return raw !== undefined && raw !== '' && (arr === null || arr.length > 0)
    case 'gt': return num !== null && num > Number(c.value)
    case 'gte': return num !== null && num >= Number(c.value)
    case 'lt': return num !== null && num < Number(c.value)
    case 'lte': return num !== null && num <= Number(c.value)
    case 'truthy': return Boolean(raw)
    case 'falsy': return !raw
    default: return false
  }
}

export function evalRule(rule: Rule, ctx: RuleCtx): boolean {
  if ('all' in rule) return rule.all.every((r) => evalRule(r, ctx))
  if ('any' in rule) return rule.any.some((r) => evalRule(r, ctx))
  if ('not' in rule) return !evalRule(rule.not, ctx)
  return evalCond(rule, ctx)
}
