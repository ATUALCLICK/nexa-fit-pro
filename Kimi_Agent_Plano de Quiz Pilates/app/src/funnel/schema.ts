import { z } from 'zod'

/*
 * Contrato do funnel.json — validação zod + tipos.
 * A mini-DSL declarativa substitui as funções TS do antigo screens.config.ts:
 *   guard/next com regras {all|any|not|key,op,value}
 *   copy dinâmica com {{tokens}} e blocos {"@switch": ...}
 */

/* ---------------- DSL de regras ---------------- */

export const CondOp = z.enum([
  'eq', 'neq', 'in', 'not-in',
  'includes', 'excludes',
  'empty', 'not-empty',
  'gt', 'gte', 'lt', 'lte',
  'truthy', 'falsy',
])
export type CondOp = z.infer<typeof CondOp>

/* uma condição atômica; key pode ser answers[key], $flag:x, $persona:x, $calc:x */
export interface Cond {
  key: string
  op: CondOp
  value?: string | number | string[]
}

/* regra = condição ou combinador */
export type Rule =
  | Cond
  | { all: Rule[] }
  | { any: Rule[] }
  | { not: Rule }

export const RuleSchema: z.ZodType<Rule> = z.lazy(() =>
  z.union([
    z.object({ key: z.string(), op: CondOp, value: z.union([z.string(), z.number(), z.array(z.string())]).optional() }),
    z.object({ all: z.array(RuleSchema) }),
    z.object({ any: z.array(RuleSchema) }),
    z.object({ not: RuleSchema }),
  ]),
) as z.ZodType<Rule>

/* ---------------- navegação ---------------- */

export const NextSchema = z.union([
  z.string(),
  z.object({
    default: z.string(),
    cases: z.array(z.object({ when: RuleSchema, goto: z.string() })),
  }),
])
export type NextRule = z.infer<typeof NextSchema>

/* ---------------- tokens derivados (icp.tokens) ---------------- */

export const DerivedTokenSchema = z.union([
  /* lookup de mapa sobre resposta(s): first | priority | join */
  z.object({
    source: z.string(),
    map: z.record(z.string(), z.string()),
    first: z.boolean().optional(),
    priority: z.array(z.string()).optional(),
    join: z.boolean().optional(),
    exclude: z.array(z.string()).optional(),
    default: z.string().optional(),
  }),
  /* primeira condição que bate, em sequência */
  z.object({
    firstMatch: z.array(z.object({ key: z.string(), eq: z.string(), token: z.string() })),
    default: z.string(),
  }),
])
export type DerivedToken = z.infer<typeof DerivedTokenSchema>

/* ---------------- ICP ---------------- */

export const PersonaSchema = z.object({
  id: z.string(),
  name: z.string().optional(),
  detect: RuleSchema,
  suppressIf: z.array(z.string()).optional(),
  layer: z.boolean().optional(), // camada transversal (ex.: cética) — sempre adicionada se detect bater
})
export type PersonaDef = z.infer<typeof PersonaSchema>

export const DiagnosisSchema = z.object({
  id: z.string(),
  title: z.string(),
  cardLabel: z.string(),
  cardValue: z.string(),
  copy: z.string(),
  when: RuleSchema.optional(), // ausente = fallback (último da lista)
})
export type DiagnosisDef = z.infer<typeof DiagnosisSchema>

export const VariantRuleSchema = z.union([
  z.object({ key: z.string(), when: RuleSchema }),
  z.object({ keyPrefix: z.string(), source: z.string(), exclude: z.array(z.string()).optional() }),
])
export type VariantRule = z.infer<typeof VariantRuleSchema>

export const IcpSchema = z.object({
  personas: z.array(PersonaSchema),
  flags: z.record(z.string(), RuleSchema),
  variantRules: z.array(VariantRuleSchema),
  planRules: z.array(z.object({ plan: z.string(), when: RuleSchema })),
  defaultPlan: z.string(),
  diagnoses: z.array(DiagnosisSchema),
  tokens: z.record(z.string(), DerivedTokenSchema),
})
export type Icp = z.infer<typeof IcpSchema>

/* ---------------- telas ---------------- */

export const ScreenJsonSchema = z.object({
  id: z.string(),
  template: z.enum([
    'select-cards', 'question-single', 'question-multi', 'interstitial',
    'input-measure', 'loading', 'result', 'scratch',
  ]),
  section: z.enum(['none', 'meu-perfil', 'atividade', 'estilo-de-vida', 'nutricao', 'quase-la']),
  countsForProgress: z.boolean(),
  saveAs: z.string().optional(),
  guard: RuleSchema.optional(),
  next: NextSchema.optional(),
  payload: z.record(z.string(), z.unknown()).optional(),
})
export type ScreenJson = z.infer<typeof ScreenJsonSchema>

/* ---------------- checkout ---------------- */

export const PlanJsonSchema = z.object({
  id: z.string(),
  name: z.string(),
  weeks: z.number(),
  regular: z.number(),
  price: z.number(),
  perDay: z.number(),
  cycle: z.string(),
  popular: z.boolean().optional(),
  discountPct: z.number(),
})
export type PlanJson = z.infer<typeof PlanJsonSchema>

export const CheckoutSchema = z.object({
  brandLine: z.string(),
  planReady: z.string(),
  headlines: z.record(z.string(), z.string()), // por mainReason + "default"
  heroNowLabel: z.string(),
  heroNowLabelWhen: z.array(z.object({ when: RuleSchema, label: z.string() })).optional(),
  dreamLabels: z.record(z.string(), z.string()), // por dreamBody + "default"
  bars: z.array(z.object({
    label: z.string(), from: z.string(), to: z.string(), pct: z.number(),
    /* F2 — barra reativa à resposta: primeiro match vence; sem match, from/pct padrão */
    fromWhen: z.array(z.object({ when: RuleSchema, from: z.string(), pct: z.number() })).optional(),
  })),
  painBar: z.object({
    when: RuleSchema,
    labelTpl: z.string(),
    from: z.string(),
    to: z.string(),
    pct: z.number(),
  }).optional(),
  included: z.array(z.object({
    icon: z.string(),
    title: z.string(),
    desc: z.string(),
    descWhen: z.array(z.object({ when: RuleSchema, desc: z.string() })).optional(),
    boostWhen: RuleSchema.optional(),
  })),
  plans: z.array(PlanJsonSchema),
  stories: z.array(z.object({
    persona: z.string().optional(),
    name: z.string(),
    kg: z.string(),
    text: z.string(),
  })),
  faqs: z.array(z.object({
    q: z.string(),
    a: z.string(),
    when: RuleSchema.optional(),
    openWhen: RuleSchema.optional(),
  })),
  reviews: z.array(z.object({ name: z.string(), text: z.string() })),
  media: z.array(z.string()),
  rating: z.object({ score: z.string(), line1: z.string(), line2: z.string() }),
  trustLine: z.string(),
  plansHeadline2: z.string(),
  guaranteeDays: z.number(),
  guaranteeEarlyWhen: RuleSchema.optional(),
  legal: z.object({ company: z.string(), cnpj: z.string(), city: z.string() }),
  countdownMin: z.number(),
})
export type CheckoutDef = z.infer<typeof CheckoutSchema>

/* ---------------- QA dirigido por dados ---------------- */

export const QaSchema = z.object({
  base: z.record(z.string(), z.union([z.string(), z.number(), z.array(z.string())])),
  personas: z.record(z.string(), z.record(z.string(), z.union([z.string(), z.number(), z.array(z.string())]))),
  expect: z.array(z.object({
    persona: z.string(), // "*" = todas
    terminal: z.string().optional(),
    maxExtra: z.number().optional(),
    vs: z.string().optional(),
    includes: z.array(z.string()).optional(),
    excludes: z.array(z.string()).optional(),
    plan: z.string().optional(),
    variant: z.string().optional(),
    hasPersona: z.string().optional(),
    diagnosis: z.string().optional(),
  })),
})
export type QaDef = z.infer<typeof QaSchema>

/* ---------------- funil ---------------- */

export const FunnelSchema = z.object({
  meta: z.object({
    slug: z.string(),
    product: z.string(),
    brand: z.string(),
    locale: z.string(),
    coupon: z.string(),
    planLabel: z.string(),
    palette: z.object({ accent: z.string(), cta: z.string(), bg: z.string() }).optional(),
  }),
  icp: IcpSchema,
  screens: z.array(ScreenJsonSchema),
  checkout: CheckoutSchema,
  qa: QaSchema.optional(),
})
export type Funnel = z.infer<typeof FunnelSchema>

export function parseFunnel(json: unknown): Funnel {
  const r = FunnelSchema.safeParse(json)
  if (!r.success) {
    const issues = r.error.issues.slice(0, 5).map((i) => `${i.path.join('.')}: ${i.message}`).join(' | ')
    throw new Error(`funnel.json inválido — ${issues}`)
  }
  return r.data
}
