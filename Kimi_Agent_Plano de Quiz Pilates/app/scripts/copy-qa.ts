/*
 * QA de copy — valida interpolação de {{tokens}} e variantes por persona.
 * Testa pela MESMA seam que a engine usa: runtime.view() + runtime.checkoutModel().
 * Uso: npx tsx scripts/copy-qa.ts [caminho-do-funnel.json]
 */
import { existsSync, readFileSync } from 'node:fs'
import { parseFunnel } from '../src/funnel/schema'
import { buildRuntime } from '../src/funnel/runtime'
import type { Answers } from '../src/quiz/engine/types'

const file = process.argv[2] ?? 'src/funnels/pilates.json'
const funnel = parseFunnel(JSON.parse(readFileSync(file, 'utf8')))
const runtime = buildRuntime(funnel)
const qa = funnel.qa!

const answersOf = (name: string): Answers => ({ ...qa.base, ...qa.personas[name] }) as Answers

function render(screenId: string, persona: string, field: string): string {
  const view = runtime.view(screenId, answersOf(persona))
  const payload = (view?.screen.payload ?? {}) as Record<string, unknown>
  return String(payload[field] ?? '')
}

let fail = 0
const check = (got: string, mustContain: string, label: string) => {
  const ok = got.includes(mustContain)
  console.log(`${ok ? '✅' : '❌'} ${label}${ok ? '' : ` — esperava "${mustContain}" em: "${got.slice(0, 120)}"`}`)
  if (!ok) fail++
}

/* tokens calculados */
check(render('social-proof', 'linear', 'headline'), 'casa dos 30 e 40 anos', 'ageLabel interpolado')
check(render('i-goal', 'linear', 'headline'), 'Nós sabemos como fazer isso acontecer', '@switch goal (perder-peso)')
check(render('i-goal', 'linear', 'body'), 'emagrecer no seu ritmo', '@switch body')
check(render('i-diagnosis', 'mamae', 'headline'), 'Core em Recuperação Pós-Parto', 'diagnóstico D1b no headline')
check(render('i-diagnosis', 'menopausa', 'body'), 'menopausa', 'diagnóstico D2b no body')
check(render('i-activity', 'dor', 'body'), 'protegem sua lombar', 'dorAlvoFrase (priority)')
check(render('i-activity', 'linear', 'body'), 'protegem suas articulações', 'dorAlvoFrase default')
check(render('i-adaptacao', 'dor', 'body'), 'variações sem carga na lombar', 'dorAdaptacao (first)')
check(render('i-jejum', 'jejum', 'headline'), 'pular o café da manhã', 'refeicaoPulada (firstMatch)')
check(render('i-jejum', 'linear', 'headline'), 'rotina real', 'i-jejum base incondicional')
check(render('i-foco', 'linear', 'headline'), 'barriga e glúteos', 'i-foco ecoa {{foco}}')
check(render('i-energy', 'linear', 'headline'), 'queda de energia pós-almoço', '@switch energy')
check(render('projection', 'linear', 'subheadline'), '60 kg até', 'goalWeight + projectionDate')
check(render('confidence', 'linear', 'headline'), 'alcançar 60 kg', 'confidence com tokens')
check(render('email', 'linear', 'headline'), 'emagrecer', 'goalLabel no email')
check(render('plan-ready', 'linear', 'headline'), 'QA, o seu Plano de Pilates de 4 semanas para emagrecer', 'plan-ready headline completo')

/* variantes por persona */
check(render('balance', 'madura55', 'headline'), 'descer escadas', 'variante 55plus em balance')
check(render('balance', 'linear', 'headline'), 'uma perna só', 'balance base sem variante')
check(render('i-awards', 'cetica', 'headline'), 'É normal duvidar', 'variante cetica em i-awards')
check(render('i-awards', 'linear', 'headline'), 'escolha confiável', 'i-awards base')

/* badges pré-avaliadas na View (plan-ready) */
{
  const view = runtime.view('plan-ready', answersOf('linear'))
  const badges = view?.screen.payload?.badges as { audience: string | null; extra: string[] }
  check(badges.audience ?? '', 'nunca treinou', 'badge audience avaliada (inicianteTotal)')
  check(badges.extra.join(' | '), 'Feito para', 'badge extra com diagnóstico avaliada')
}

/* checkout — pela mesma seam da página */
{
  const m = runtime.checkoutModel(answersOf('mamae'))
  check(m.headline, 'Seu corpo de volta', 'checkout headline pós-parto')
  check(m.faqs.map((f) => f.q).join(' | '), 'região lombar', 'FAQ dor com {{dorAlvo}}')
  check(m.bars.map((b) => String(b.from)).join(' | '), 'Iniciante', 'barra com {{pilatesLevel}}')
  check(m.stories.map((s) => s.name).join(' > '), 'Mariana, 38 > Carla, 33 > Sônia, 54', 'stories: personas detectadas primeiro (ordem do JSON), não-detectada por último')
}

/* ícones thiings — todo slug referenciado em options deve existir em public/icons/thiings/ */
{
  const missing: string[] = []
  let total = 0
  for (const s of funnel.screens) {
    const p = (s.payload ?? {}) as { heroIcon?: string; options?: { value: string; icon?: string }[]; groups?: { options: { value: string; icon?: string }[] }[] }
    if (p.heroIcon) {
      total++
      if (!existsSync(`public/icons/thiings/${p.heroIcon}.png`)) missing.push(`${s.id}:hero→${p.heroIcon}`)
    }
    const lists = p.groups ? p.groups.map((g) => g.options) : [p.options ?? []]
    for (const opts of lists)
      for (const o of opts)
        if (o.icon) {
          total++
          if (!existsSync(`public/icons/thiings/${o.icon}.png`)) missing.push(`${s.id}:${o.value}→${o.icon}`)
        }
  }
  console.log(`${missing.length === 0 ? '✅' : '❌'} ícones thiings: ${total} referências, ${missing.length} ausentes${missing.length ? ' — ' + missing.join(', ') : ''}`)
  if (missing.length) fail++
}

/* D-provaResposta — proof.saveAs existe, cobertura por opção (ou fallback), stat 55–85% redondo */
{
  const bad: string[] = []
  const saveAsOptions = new Map<string, Set<string>>()
  for (const s of funnel.screens) {
    if (!s.saveAs) continue
    const p = (s.payload ?? {}) as { options?: { value: string }[]; groups?: { options: { value: string }[] }[] }
    const vals = new Set<string>()
    const lists = p.groups ? p.groups.map((g) => g.options) : [p.options ?? []]
    for (const opts of lists) for (const o of opts) vals.add(o.value)
    saveAsOptions.set(s.saveAs, vals)
  }
  let proofs = 0
  for (const s of funnel.screens) {
    const proof = (s.payload ?? {}).proof as { saveAs?: string; byAnswer?: Record<string, { stat: string; text: string }>; fallback?: { stat: string; text: string } } | undefined
    if (!proof) continue
    proofs++
    const vals = proof.saveAs ? saveAsOptions.get(proof.saveAs) : undefined
    if (!vals) { bad.push(`${s.id}: saveAs desconhecido '${proof.saveAs}'`); continue }
    if (!proof.fallback)
      for (const v of vals) if (!proof.byAnswer?.[v]) bad.push(`${s.id}: sem proof para '${v}' e sem fallback`)
    const entries = [...Object.values(proof.byAnswer ?? {}), ...(proof.fallback ? [proof.fallback] : [])]
    for (const e of entries) {
      const m = /^(\d{2})%$/.exec(e.stat ?? '')
      if (!m || +m[1] < 55 || +m[1] > 85) bad.push(`${s.id}: stat inválido '${e.stat}' (regra: 55–85%, redondo)`)
    }
  }
  console.log(`${bad.length === 0 ? '✅' : '❌'} prova social reativa: ${proofs} ecos, ${bad.length} problemas${bad.length ? ' — ' + bad.join(', ') : ''}`)
  if (bad.length) fail++
}

/* PlanMeter — todo eco tem meter; pct 1–99 crescente; milestone só nos marcos (15/35/55/75/95) */
{
  const MILESTONES: Record<string, number> = {
    'i-goal': 15, 'i-activity': 35, 'i-jejum': 55, 'i-authority': 75, 'social-proof-2': 95,
  }
  const bad: string[] = []
  let prevPct = 0, prevBlock = 0, ecos = 0
  for (const s of funnel.screens) {
    if (s.template !== 'interstitial') continue
    ecos++
    const m = (s.payload ?? {}).meter as { pct?: number; block?: number; blockName?: string; milestone?: string } | undefined
    if (!m) { bad.push(`${s.id}: eco sem meter`); continue }
    if (!Number.isInteger(m.pct) || m.pct! < 1 || m.pct! > 99) bad.push(`${s.id}: pct inválido '${m.pct}'`)
    else if (m.pct! <= prevPct) bad.push(`${s.id}: pct ${m.pct} não cresce (anterior ${prevPct})`)
    if (!Number.isInteger(m.block) || m.block! < 1 || m.block! > 5) bad.push(`${s.id}: block inválido '${m.block}'`)
    else if (m.block! < prevBlock) bad.push(`${s.id}: block ${m.block} retrocede (anterior ${prevBlock})`)
    if (!m.blockName) bad.push(`${s.id}: sem blockName`)
    const isMarco = s.id in MILESTONES
    if (isMarco && m.milestone === undefined) bad.push(`${s.id}: marco sem milestone`)
    if (!isMarco && m.milestone !== undefined) bad.push(`${s.id}: milestone fora de marco`)
    if (isMarco && m.pct !== MILESTONES[s.id]) bad.push(`${s.id}: marco deveria ter pct ${MILESTONES[s.id]}, tem ${m.pct}`)
    prevPct = m.pct ?? prevPct
    prevBlock = m.block ?? prevBlock
  }
  if (ecos !== 16) bad.push(`esperava 16 ecos, achei ${ecos}`)
  console.log(`${bad.length === 0 ? '✅' : '❌'} medidor de plano: ${ecos} ecos, ${bad.length} problemas${bad.length ? ' — ' + bad.slice(0, 5).join(', ') + (bad.length > 5 ? ` (+${bad.length - 5})` : '') : ''}`)
  if (bad.length) fail++
}

console.log(fail === 0 ? '\n🎉 COPY QA VERDE' : `\n💥 ${fail} FALHAS`)
process.exit(fail === 0 ? 0 : 1)
