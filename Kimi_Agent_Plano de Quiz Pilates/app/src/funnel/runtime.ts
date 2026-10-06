import type { Answers, Screen } from '../quiz/engine/types'
import type { Funnel, ScreenJson } from './schema'
import { baseCtx } from './derive'
import { evalRule } from './rules'
import { buildCheckoutModel, buildView, type CheckoutModel, type View } from './view'

/*
 * Runtime do funil — compila ScreenJson (DSL) para Screen (máquina)
 * e expõe a máquina de estados: resolveNext / resolvePrev / progressOf.
 * Substitui o antigo screens.config.ts.
 */

export interface FunnelRuntime {
  funnel: Funnel
  screens: Screen[]
  map: Map<string, Screen>
  firstId: string
  totalProgress: number
  progressOf: (screenId: string) => number
  resolveNext: (screen: Screen, answers: Answers) => string
  resolvePrev: (screenId: string, answers: Answers) => string | null
  /** rótulo da opção escolhida (busca na tela que tem saveAs=key) */
  labelOf: (key: string, value: string) => string
  /** View: a tela final — tudo derivado, nenhuma regra à vista */
  view: (screenId: string, answers: Answers) => View | undefined
  /** modelo final do checkout (headline, planos, stories, faqs…) */
  checkoutModel: (answers: Answers) => CheckoutModel
}

function compileScreen(json: ScreenJson, funnel: Funnel): Screen {
  const guard = json.guard
    ? (a: Answers) => evalRule(json.guard!, baseCtx(a, funnel.icp))
    : undefined
  const nextRule = json.next
  const next =
    nextRule && typeof nextRule === 'object'
      ? (a: Answers) => {
          const ctx = baseCtx(a, funnel.icp)
          for (const c of nextRule.cases) {
            if (evalRule(c.when, ctx)) return c.goto
          }
          return nextRule.default
        }
      : nextRule
  return {
    id: json.id,
    template: json.template,
    section: json.section,
    countsForProgress: json.countsForProgress,
    saveAs: json.saveAs,
    guard,
    next,
    payload: json.payload,
  }
}

export function buildRuntime(funnel: Funnel): FunnelRuntime {
  const screens = funnel.screens.map((s) => compileScreen(s, funnel))
  const map = new Map(screens.map((s) => [s.id, s]))
  const totalProgress = screens.filter((s) => s.countsForProgress).length

  /* índice saveAs → rótulos das opções (para ecos de resposta) */
  const labelIndex = new Map<string, Map<string, string>>()
  for (const s of funnel.screens) {
    if (!s.saveAs || !s.payload) continue
    const opts = [
      ...((s.payload.options as { value: string; label: string }[] | undefined) ?? []),
      ...(((s.payload.groups as { options: { value: string; label: string }[] }[] | undefined) ?? []).flatMap((g) => g.options)),
    ]
    if (opts.length) labelIndex.set(s.saveAs, new Map(opts.map((o) => [o.value, o.label])))
  }

  function progressOf(screenId: string): number {
    const idx = screens.findIndex((s) => s.id === screenId)
    if (idx < 0) return 0
    const done = screens.slice(0, idx + 1).filter((s) => s.countsForProgress).length
    return Math.round((done / totalProgress) * 100)
  }

  function resolveNext(screen: Screen, answers: Answers): string {
    const nxt = screen.next
    if (!nxt) return screens[screens.length - 1].id
    let id = typeof nxt === 'function' ? nxt(answers) : nxt
    let guardCount = 0
    while (guardCount++ < 10) {
      const s = map.get(id)
      if (!s || !s.guard || s.guard(answers)) return id
      const n2 = s.next
      if (!n2) return id
      id = typeof n2 === 'function' ? n2(answers) : n2
    }
    return id
  }

  function resolvePrev(screenId: string, answers: Answers): string | null {
    const idx = screens.findIndex((s) => s.id === screenId)
    if (idx <= 0) return null
    for (let i = idx - 1; i >= 0; i--) {
      const s = screens[i]
      if (s.guard && !s.guard(answers)) continue
      if (s.template === 'loading') continue
      return s.id
    }
    return screens[0].id
  }

  function labelOf(key: string, value: string): string {
    return labelIndex.get(key)?.get(value) ?? value
  }

  return {
    funnel,
    screens,
    map,
    firstId: screens[0]?.id ?? '',
    totalProgress,
    progressOf,
    resolveNext,
    resolvePrev,
    labelOf,
    view: (screenId, answers) => buildView(funnel, map, labelOf, screenId, answers),
    checkoutModel: (answers) => buildCheckoutModel(funnel, answers),
  }
}
