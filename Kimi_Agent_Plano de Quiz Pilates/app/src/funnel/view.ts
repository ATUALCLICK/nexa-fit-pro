import type { Answers, Screen } from '../quiz/engine/types'
import {
  bmi, bmiBand, eventDateLabel, eventLabel, firstName, flexibilityLabel, goalPct,
  lifestyle, pilatesLevel, projectionDate,
} from './personalization'
import { applyVariants, baseCtx, deriveProfile, resolveDiagnosis } from './derive'
import { buildTokens, resolvePayload } from './interpolate'
import { evalRule, type RuleCtx } from './rules'
import type { Funnel, PlanJson } from './schema'

/*
 * View — a tela final: tudo derivado, nenhuma regra à vista.
 * Este módulo é o ÚNICO intérprete da DSL para consumo de UI:
 * tokens, @switch, variants e fragmentos {when,...} chegam aqui como dados
 * e saem daqui como valores finais. Templates e checkout são render puro.
 */

/* ---------- calc: valores estruturados (não-string) que a UI precisa ---------- */
export interface ViewCalc {
  bmi: number | null
  bmiBandOk: boolean
  bmiLabel: string
  weight: number
  goalWeight: number
  goalPct: number
  projectionDate: string
  firstName: string
  lifestyle: string
  pilatesLevel: string
  flexibilityLabel: string
  diagnosisCardLabel: string
  diagnosisCardValue: string
}

export interface View {
  screen: Screen
  calc: ViewCalc
  /** rótulo da opção escolhida (eco de resposta) */
  labelOf: (key: string, value: string) => string
}

function calcOf(a: Answers, funnel: Funnel): ViewCalc {
  const v = bmi(a)
  const d = resolveDiagnosis(a, funnel.icp)
  return {
    bmi: v,
    bmiBandOk: v ? bmiBand(v).ok : true,
    bmiLabel: v ? bmiBand(v).label : '',
    weight: Number(a.weight) || 70,
    goalWeight: Number(a.goalWeight) || 60,
    goalPct: goalPct(a),
    projectionDate: projectionDate(a),
    firstName: firstName(a),
    lifestyle: lifestyle(a),
    pilatesLevel: pilatesLevel(a),
    flexibilityLabel: flexibilityLabel(a),
    diagnosisCardLabel: d.cardLabel,
    diagnosisCardValue: d.cardValue,
  }
}

function ctxOf(a: Answers, funnel: Funnel): RuleCtx {
  const profile = deriveProfile(a, funnel.icp)
  const ctx = baseCtx(a, funnel.icp)
  ctx.personas = profile.personas
  return ctx
}

/* ---------- fragmentos declarativos conhecidos da DSL ---------- */

/* badges (template result): audience = first-match; extra = all-match */
function evalBadges(payload: Record<string, unknown>, ctx: RuleCtx): Record<string, unknown> {
  const b = payload.badges as
    | { audience?: { when?: unknown; text: string }[]; extra?: { when?: unknown; text: string }[] }
    | undefined
  if (!b) return payload
  const audience = (b.audience ?? []).find((x) => !x.when || evalRule(x.when as never, ctx))
  const extra = (b.extra ?? []).filter((x) => !x.when || evalRule(x.when as never, ctx))
  return {
    ...payload,
    badges: { audience: audience?.text ?? null, extra: extra.map((x) => x.text) },
  }
}

/* ---------- a View ---------- */
export function buildView(
  funnel: Funnel,
  map: Map<string, Screen>,
  labelOf: (key: string, value: string) => string,
  screenId: string,
  answers: Answers,
): View | undefined {
  const raw = map.get(screenId)
  if (!raw) return undefined
  const profile = deriveProfile(answers, funnel.icp)
  const tokens = buildTokens(answers, funnel, profile)
  const ctx = ctxOf(answers, funnel)
  const payload = raw.payload
    ? resolvePayload(evalBadges(applyVariants(raw.payload, profile.variantKeys), ctx), tokens)
    : raw.payload
  return { screen: { ...raw, payload }, calc: calcOf(answers, funnel), labelOf }
}

/* ---------- checkout model ---------- */

export interface CheckoutModel {
  headline: string
  planReady: string
  heroNowLabel: string
  dreamLabel: string
  bars: { label: string; from: string; to: string | number; pct: number }[]
  plans: PlanJson[]
  initialPlanId: string
  countdownMin: number
  included: { icon: string; title: string; desc: string; boosted: boolean }[]
  stories: { kg: string; text: string; name: string }[]
  faqs: { q: string; a: string; open: boolean }[]
  guaranteeEarly: boolean
  guaranteeDays: number
  rating: { line1: string; line2: string; score: string }
  media: string[]
  reviews: { text: string; name: string }[]
  trustLine: string
  plansHeadline2: string
  brandLine: string
  legal: { company: string; cnpj: string; city: string }
  goalW: number
  dateLabel: string
  eventLine: string
}

export function buildCheckoutModel(funnel: Funnel, answers: Answers): CheckoutModel {
  const c = funnel.checkout
  const profile = deriveProfile(answers, funnel.icp)
  const tokens = buildTokens(answers, funnel, profile)
  const ctx = ctxOf(answers, funnel)
  const t = <T,>(v: T): T => resolvePayload(v, tokens)

  const initialPlan =
    c.plans.find((p) => p.id === profile.plan.recommended) ??
    c.plans.find((p) => p.popular) ??
    c.plans[0]

  const includedBase = c.included.map((it) => ({
    icon: it.icon,
    title: it.title,
    desc: t(it.descWhen?.find((d) => evalRule(d.when, ctx))?.desc ?? it.desc),
    boosted: it.boostWhen ? evalRule(it.boostWhen, ctx) : false,
  }))

  const faqs = c.faqs
    .filter((f) => !f.when || evalRule(f.when, ctx))
    .map((f) => ({ q: t(f.q), a: t(f.a), open: f.openWhen ? evalRule(f.openWhen, ctx) : false }))

  return {
    headline: t(c.headlines[(answers.mainReason as string) ?? ''] ?? c.headlines.default),
    planReady: c.planReady,
    heroNowLabel: t(c.heroNowLabelWhen?.find((h) => evalRule(h.when, ctx))?.label ?? c.heroNowLabel),
    dreamLabel: t(c.dreamLabels[(answers.dreamBody as string) ?? ''] ?? c.dreamLabels.default),
    bars: [
      ...(c.painBar && evalRule(c.painBar.when, ctx)
        ? [{ label: t(c.painBar.labelTpl), from: c.painBar.from, to: c.painBar.to, pct: c.painBar.pct }]
        : []),
      ...c.bars.map((b) => {
        const m = b.fromWhen?.find((f) => evalRule(f.when, ctx))
        return { label: b.label, from: t(m?.from ?? b.from), to: b.to, pct: m?.pct ?? b.pct }
      }),
    ],
    plans: c.plans,
    initialPlanId: initialPlan.id,
    countdownMin: c.countdownMin,
    included: [...includedBase.filter((i) => i.boosted), ...includedBase.filter((i) => !i.boosted)],
    stories: [
      ...c.stories.filter((s) => s.persona && profile.personas.includes(s.persona)),
      ...c.stories.filter((s) => !s.persona || !profile.personas.includes(s.persona)),
    ],
    faqs,
    guaranteeEarly: c.guaranteeEarlyWhen ? evalRule(c.guaranteeEarlyWhen, ctx) : false,
    guaranteeDays: c.guaranteeDays,
    rating: c.rating,
    media: c.media,
    reviews: c.reviews,
    trustLine: c.trustLine,
    plansHeadline2: c.plansHeadline2,
    brandLine: c.brandLine,
    legal: c.legal,
    goalW: Number(answers.goalWeight) || 60,
    dateLabel: projectionDate(answers),
    eventLine: (() => {
      const ev = eventLabel(answers)
      const dt = eventDateLabel(answers)
      if (!ev || !dt) return ''
      return `${ev.charAt(0).toUpperCase() + ev.slice(1)} é em ${dt} — o plano de 4 semanas te leva até lá.`
    })(),
  }
}
