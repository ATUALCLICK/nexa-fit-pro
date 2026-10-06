import type { Answers } from '../quiz/engine/types'
import {
  ageLabel, bmi, bmiBand, eventDateLabel, eventLabel, firstName, flexibilityLabel, goalLabel,
  goalPct, lifestyle, pilatesLevel, projectionDate,
} from './personalization'
import type { Funnel } from './schema'
import { resolveDiagnosis, type Profile } from './derive'

/*
 * Interpolação de {{tokens}} e resolução de blocos {"@switch": ...}.
 * A lógica matemática/calendário fica no código (builtins);
 * o conteúdo gerado só referencia placeholders.
 */

export function buildTokens(a: Answers, funnel: Funnel, profile: Profile): Record<string, string> {
  const d = resolveDiagnosis(a, funnel.icp)
  const v = bmi(a)
  const builtins: Record<string, string> = {
    ageLabel: ageLabel(a),
    goalLabel: goalLabel(a),
    firstName: firstName(a),
    weight: String(a.weight ?? ''),
    goalWeight: String(a.goalWeight ?? 60),
    bmi: v ? String(v).replace('.', ',') : '',
    bmiLabel: v ? bmiBand(v).label : '',
    goalPct: String(goalPct(a)),
    projectionDate: projectionDate(a),
    eventLabel: eventLabel(a),
    eventDateLabel: eventDateLabel(a),
    diagnosisTitle: d.title,
    diagnosisCopy: d.copy,
    diagnosisCardLabel: d.cardLabel,
    diagnosisCardValue: d.cardValue,
    pilatesLevel: pilatesLevel(a),
    lifestyle: lifestyle(a),
    flexibilityLabel: flexibilityLabel(a),
    planLabel: funnel.meta.planLabel,
    product: funnel.meta.product,
    brand: funnel.meta.brand,
  }
  const raw: Record<string, string> = {}
  for (const [k, val] of Object.entries(a)) {
    if (typeof val === 'string' || typeof val === 'number') raw[k] = String(val)
  }
  /* precedência: respostas crus < derivados do icp < builtins calculados */
  return { ...raw, ...profile.tokens, ...builtins }
}

export function interpolate(text: string, tokens: Record<string, string>): string {
  return text.replace(/\{\{\s*([\w.-]+)\s*\}\}/g, (_, name) => tokens[name] ?? '')
}

interface SwitchBlock {
  '@switch': { key: string; cases: Record<string, string>; default?: string }
}

function isSwitch(v: unknown): v is SwitchBlock {
  return typeof v === 'object' && v !== null && '@switch' in v
}

/* resolve recursivamente strings {{token}} e blocos @switch em qualquer payload */
export function resolvePayload<T = unknown>(value: T, tokens: Record<string, string>): T {
  if (typeof value === 'string') return interpolate(value, tokens) as T
  if (Array.isArray(value)) return value.map((v) => resolvePayload(v, tokens)) as T
  if (isSwitch(value)) {
    const sw = value['@switch']
    const picked = sw.cases[tokens[sw.key]] ?? sw.default ?? ''
    return interpolate(picked, tokens) as T
  }
  if (typeof value === 'object' && value !== null) {
    const out: Record<string, unknown> = {}
    for (const [k, v] of Object.entries(value)) out[k] = resolvePayload(v, tokens)
    return out as T
  }
  return value
}
