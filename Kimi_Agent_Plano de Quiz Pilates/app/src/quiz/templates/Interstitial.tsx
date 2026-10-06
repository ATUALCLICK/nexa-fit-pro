import { BadgeCheck, Flame, Star } from 'lucide-react'
import type { Answers, Screen } from '../engine/types'
import { bold } from '../engine/resolve'
import CTAButton from '../components/CTAButton'
import EchoHero from '../components/EchoHero'
import PlanMeter, { type Meter } from '../components/PlanMeter'
import { CONTENT, H1, KICKER, SHELL, SHELL_WITH_CTA, SUB } from '../components/typography'

interface Props {
  screen: Screen
  answers: Answers
  onContinue: () => void
}

interface Meal { name: string; kcal: number; min: number }
interface Expert { name: string; role: string }
interface Award { title: string; org: string; year: string }
interface Proof { saveAs: string; byAnswer: Record<string, { stat: string; text: string }>; fallback?: { stat: string; text: string } }

/*
 * D-provaResposta — stat callout que valida a resposta da etapa anterior.
 * Multi-select: usa a primeira marcação (a mais prioritária para o usuário).
 * Sem resposta (visita direta): cai no fallback; sem fallback, o bloco some.
 */
function ProofBlock({ proof, answers }: { proof: Proof; answers: Answers }) {
  const raw = answers[proof.saveAs]
  const value = Array.isArray(raw) ? (raw as string[])[0] : (raw as string | undefined)
  const data = (value && proof.byAnswer[value]) || proof.fallback
  if (!data) return null
  return (
    <div className="mt-6 flex items-center gap-4 rounded-2xl border border-[#E7E2DA] bg-white p-5 animate-[fadeSlideIn_0.4s_ease-out]">
      <span className="shrink-0 text-[32px] font-bold leading-none tracking-tight text-[#B57E5B]">
        {data.stat}
      </span>
      <p className="text-sm leading-snug text-[#57534E]">{data.text}</p>
    </div>
  )
}

/*
 * T4 — interstitials (ecos): motivação, diagnóstico, prova social, autoridade,
 * refeições, prêmios.
 *
 * Anatomia canônica: [EchoHero] → H1 → SUB → conteúdo → CTA.
 * Camada visual: exatamente UMA por eco — payload.heroIcon (thiings 3D) OU
 * grid de conteúdo (meals/authority/awards/logos), nunca os dois, nunca nenhum.
 */
export default function Interstitial({ screen, answers, onContinue }: Props) {
  const p = screen.payload ?? {}
  const variant = (p.variant as string) ?? 'motivation'
  const headline = (p.headline as string) ?? ''
  const body = p.body as string | undefined
  const cta = (p.cta as string) ?? 'CONTINUAR'
  const heroIcon = p.heroIcon as string | undefined
  const proof = p.proof as Proof | undefined
  const meter = p.meter as Meter | undefined

  /* refeições adaptadas ao tipo de dieta — vêm do funnel.json (mealsByDiet) */
  const diet = (answers.dietType as string) ?? 'tradicional'
  const byDiet = (p.mealsByDiet as Record<string, { meals: Meal[]; label: string }> | undefined) ?? {}
  const adapted = byDiet[diet]
  const meals: Meal[] = adapted?.meals ?? ((p.meals as Meal[]) ?? [])
  const dietLabel = adapted?.label ?? ''

  return (
    <div className={`${SHELL} ${SHELL_WITH_CTA}`}>
      <div>
        {heroIcon && <EchoHero icon={heroIcon} />}

        <h1 className={H1}>
          {bold(headline)}
        </h1>

        {body && <p className={SUB}>{bold(body)}</p>}

        {/* T4c — prova social com logos */}
        {variant === 'social' && (
          <div className={CONTENT}>
            <p className={KICKER}>Como visto em</p>
            <div className="mt-4 flex flex-wrap items-center justify-center gap-x-8 gap-y-3">
              {((p.logos as string[]) ?? []).map((l) => (
                <span key={l} className="font-serif text-lg italic text-[#78716C]">{l}</span>
              ))}
            </div>
          </div>
        )}

        {/* T4e — preview de refeições (adaptado à dieta escolhida — R7) */}
        {variant === 'meals' && (
          <div className={CONTENT}>
            <p className={`mb-3 ${KICKER}`}>
              Suas refeições{dietLabel ? ` · ${dietLabel}` : ''}
            </p>
            <div className="grid grid-cols-3 gap-3">
              {meals.map((m) => (
                <div key={m.name} className="rounded-xl border border-[#E7E2DA] bg-white p-3 text-center">
                  <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-[#F3EFE8]">
                    <Flame className="h-4 w-4 text-[#B57E5B]" />
                  </div>
                  <p className="flex min-h-[2.5em] items-center justify-center text-[13px] font-semibold leading-tight text-[#1C1917]">{m.name}</p>
                  <p className="mt-1 whitespace-nowrap text-[11px] text-[#78716C]">{m.kcal} kcal · {m.min} min</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* T4d — autoridade */}
        {variant === 'authority' && (
          <div className={`${CONTENT} grid gap-3 md:grid-cols-3`}>
            {((p.experts as Expert[]) ?? []).map((e) => (
              <div key={e.name} className="rounded-xl border border-[#E7E2DA] bg-white p-5 text-center">
                <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-[#F3EFE8] text-lg font-semibold text-[#B57E5B]">
                  {e.name.split(' ').map((w) => w[0]).slice(0, 2).join('')}
                </div>
                <p className="flex items-center justify-center gap-1 text-sm font-semibold text-[#1C1917]">
                  {e.name}
                  <BadgeCheck className="h-4 w-4 text-[#7D8F74]" />
                </p>
                <p className="mt-1 text-xs leading-snug text-[#78716C]">{e.role}</p>
              </div>
            ))}
          </div>
        )}

        {/* prêmios */}
        {variant === 'awards' && (
          <div className={`${CONTENT} grid gap-3 md:grid-cols-3`}>
            {((p.awards as Award[]) ?? []).map((a) => (
              <div key={a.title} className="rounded-xl border border-[#E7E2DA] bg-white p-5 text-center">
                <Star className="mx-auto mb-3 h-7 w-7 fill-[#D9A05B] text-[#D9A05B]" />
                <p className="text-sm font-semibold leading-snug text-[#1C1917]">{a.title}</p>
                <p className="mt-1 text-xs text-[#78716C]">{a.org} · {a.year}</p>
              </div>
            ))}
          </div>
        )}

        {/* D-provaResposta — depois de body e conteúdo, antes do CTA */}
        {proof && <ProofBlock proof={proof} answers={answers} />}

        {/* PlanMeter — momentum: % do plano montado, em todos os ecos */}
        {meter && <PlanMeter meter={meter} />}
      </div>

      <CTAButton label={cta} onClick={onContinue} />
    </div>
  )
}
