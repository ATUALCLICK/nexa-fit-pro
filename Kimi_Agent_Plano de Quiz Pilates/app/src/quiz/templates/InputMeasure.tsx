import { useEffect, useMemo, useState } from 'react'
import { AlertTriangle, Lock } from 'lucide-react'
import type { Answers, Screen } from '../engine/types'
import CTAButton from '../components/CTAButton'
import { useQuiz } from '../engine/store'
import { bmi, bmiBand, goalPct } from '../../funnel/personalization'
import { CONTENT, H1, SHELL, SHELL_WITH_CTA, SUB } from '../components/typography'

interface Props {
  screen: Screen
  answers: Answers
  onAnswer: (value: string | number) => void
}

const KG_PER_LB = 0.453592
const CM_PER_FT = 30.48

/* T5 — inputs com validação, toggle de unidade, consentimento e feedback instantâneo */
export default function InputMeasure({ screen, answers, onAnswer }: Props) {
  const p = screen.payload ?? {}
  const kind = p.kind as string
  const headline = (p.headline as string) ?? ''
  const sub = p.subheadline as string | undefined
  const range = p.range as { min: number; max: number } | undefined
  const rangeHint = p.rangeHint as string | undefined
  const needsConsent = Boolean(p.consent)
  const feedback = p.feedback as string | undefined
  const staticFeedback = p.staticFeedback as string | undefined
  const units = p.units as { id: string; label: string }[] | undefined
  const placeholder = p.placeholder as string | undefined
  const skippable = Boolean(p.skippable)
  const cta = (p.cta as string) ?? 'PRÓXIMO PASSO'

  const savedRaw = screen.saveAs ? answers[screen.saveAs] : undefined
  const [unit, setUnit] = useState(units?.[0]?.id ?? '')
  const [text, setText] = useState(savedRaw !== undefined ? String(savedRaw) : '')
  const [consent, setConsent] = useState(Boolean(needsConsent && savedRaw !== undefined))
  const [toast, setToast] = useState(false)
  const [touched, setTouched] = useState(false)

  const setAnswer = useQuiz((s) => s.setAnswer)

  /* valor normalizado (sempre cm/kg) */
  const normalized = useMemo(() => {
    const v = parseFloat(text.replace(',', '.'))
    if (isNaN(v)) return NaN
    if (unit === 'lbs') return Math.round(v * KG_PER_LB)
    if (unit === 'ft') return Math.round(v * CM_PER_FT)
    return v
  }, [text, unit])

  const valid = useMemo(() => {
    if (kind === 'email') return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(text.trim())
    if (kind === 'name') return text.trim().length >= 2
    if (kind === 'date') return Boolean(text)
    if (isNaN(normalized) || !range) return false
    return normalized >= range.min && normalized <= range.max
  }, [kind, text, normalized, range])

  useEffect(() => {
    if (toast) {
      const t = setTimeout(() => setToast(false), 3000)
      return () => clearTimeout(t)
    }
  }, [toast])

  const submit = () => {
    if (!valid) { setTouched(true); return }
    if (needsConsent && !consent) { setToast(true); return }
    if (kind === 'email' || kind === 'name' || kind === 'date') onAnswer(text.trim())
    else onAnswer(normalized)
  }

  /* feedback instantâneo */
  const previewAnswers = useMemo(() => {
    if (!valid || kind === 'email' || kind === 'name' || kind === 'date') return answers
    return { ...answers, [screen.saveAs!]: normalized }
  }, [valid, kind, answers, screen.saveAs, normalized])

  const fb = useMemo(() => {
    if (!valid) return null
    if (feedback === 'bmi') {
      const v = bmi(previewAnswers)
      const band = bmiBand(v)
      return {
        title: `Seu IMC é ${String(v).replace('.', ',')}, o que é considerado ${band.label}.`,
        body: 'Você pode ganhar muito ao perder pouco peso. Vamos usar o seu IMC para criar o programa ideal para você.',
      }
    }
    if (feedback === 'goal') {
      const pct = goalPct(previewAnswers)
      if (pct <= 0)
        return {
          title: 'Ótima meta!',
          body: 'Manter o peso com tônus e postura é um objetivo poderoso — seu plano será focado em definição e bem-estar.',
        }
      return {
        title: `Desbloqueie benefícios para a saúde: perca ${pct}% do seu peso.`,
        body: 'Estudos demonstraram que perder 10% ou mais do peso corporal pode reduzir o risco de doenças associadas à obesidade, como problemas cardíacos, glicemia alta e inflamação.',
      }
    }
    if (staticFeedback) return { title: '', body: staticFeedback }
    return null
  }, [valid, feedback, previewAnswers, staticFeedback])

  /* grava o valor no store ao digitar (para voltar preservado) */
  useEffect(() => {
    if (!screen.saveAs) return
    if ((kind === 'email' || kind === 'name' || kind === 'date') && text) setAnswer(screen.saveAs, text)
  }, [text, kind, screen.saveAs, setAnswer])

  return (
    <div className={`${SHELL} ${SHELL_WITH_CTA}`}>
      <h1 className={H1}>{headline}</h1>
      {sub && <p className={SUB}>{sub}</p>}

      <div className={`${CONTENT} rounded-2xl border border-[#E7E2DA] bg-white p-6`}>
        {units && (
          <div className="mb-5 flex justify-center gap-2">
            {units.map((u) => (
              <button
                key={u.id}
                onClick={() => setUnit(u.id)}
                className={`rounded-full px-5 py-1.5 text-xs font-semibold tracking-wide transition ${
                  unit === u.id ? 'bg-[#292524] text-white' : 'bg-[#F3EFE8] text-[#78716C]'
                }`}
              >
                {u.label}
              </button>
            ))}
          </div>
        )}

        {kind === 'date' ? (
          <input
            type="date"
            value={text}
            min={new Date().toISOString().split('T')[0]}
            onChange={(e) => { setText(e.target.value); setTouched(false) }}
            className="w-full rounded-xl border border-[#E7E2DA] px-4 py-3 text-center text-lg text-[#1C1917] outline-none focus:border-[#292524]"
          />
        ) : kind === 'email' || kind === 'name' ? (
          <input
            type={kind === 'email' ? 'email' : 'text'}
            value={text}
            placeholder={placeholder}
            onChange={(e) => { setText(e.target.value); setTouched(false) }}
            className="w-full border-b-2 border-[#E7E2DA] bg-transparent py-3 text-center text-2xl text-[#1C1917] outline-none placeholder:text-[#C9C2B6] focus:border-[#292524]"
          />
        ) : (
          <div className="flex items-end justify-center gap-2">
            <input
              type="number"
              inputMode="numeric"
              value={text}
              onChange={(e) => { setText(e.target.value); setTouched(false) }}
              className="w-40 border-b-2 border-[#E7E2DA] bg-transparent py-2 text-center text-4xl font-semibold text-[#1C1917] outline-none focus:border-[#292524] [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
            />
            <span className="pb-3 text-lg text-[#78716C]">
              {(p.unitSuffix as string) ?? unit}
            </span>
          </div>
        )}

        {rangeHint && (
          <p className={`mt-3 text-center text-xs ${touched && !valid && text ? 'text-[#E5484D]' : 'text-[#A8A29E]'}`}>
            {rangeHint}
          </p>
        )}
        {kind === 'email' && touched && !valid && (
          <p className="mt-3 text-center text-xs text-[#E5484D]">Introduza um e-mail válido</p>
        )}

        {needsConsent && (
          <label className="mt-5 flex cursor-pointer items-start gap-3 text-left">
            <button
              type="button"
              role="checkbox"
              aria-checked={consent}
              onClick={() => setConsent((c) => !c)}
              className={`mt-0.5 flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded border transition ${
                consent ? 'border-[#292524] bg-[#292524]' : 'border-[#C9C2B6] bg-white'
              }`}
            >
              {consent && (
                <svg viewBox="0 0 10 8" className="h-2.5 w-2.5 fill-none stroke-white" strokeWidth="2">
                  <path d="M1 4l3 3 5-6" />
                </svg>
              )}
            </button>
            <span className="text-xs leading-snug text-[#78716C]">
              Eu concordo que Viva Pilates processe meus dados de saúde para fornecer serviços e
              melhorar minha experiência de usuária.{' '}
              <span className="underline">Política de Privacidade</span>.
            </span>
          </label>
        )}
      </div>

      {/* feedback instantâneo */}
      {fb && (
        <div className="mt-4 animate-[fadeSlideIn_0.3s_ease-out] rounded-2xl border border-[#7D8F74]/30 bg-[#7D8F74]/10 p-5">
          {fb.title && <p className="text-sm font-semibold text-[#1C1917]">{fb.title}</p>}
          <p className="mt-1 text-sm leading-relaxed text-[#57534E]">{fb.body}</p>
        </div>
      )}

      {(p.privacyNote as string) && (
        <p className="mt-4 flex items-start justify-center gap-1.5 text-center text-xs leading-snug text-[#A8A29E]">
          <Lock className="mt-0.5 h-3 w-3 shrink-0" />
          {p.privacyNote as string}
        </p>
      )}

      {skippable && (
        <button
          onClick={() => onAnswer('')}
          className="mx-auto mt-4 block text-xs font-semibold uppercase tracking-wider text-[#A8A29E] underline underline-offset-4 hover:text-[#78716C]"
        >
          Pular esta etapa
        </button>
      )}

      {/* toast de consentimento */}
      {toast && (
        <div className="fixed inset-x-0 bottom-24 z-50 mx-auto flex w-fit max-w-[90vw] items-center gap-2 rounded-xl bg-[#E5484D] px-4 py-3 text-sm font-medium text-white shadow-lg animate-[toastUp_0.25s_ease-out]">
          <AlertTriangle className="h-4 w-4" />
          O consentimento é necessário para continuar
        </div>
      )}

      <CTAButton label={cta} disabled={!valid} onClick={submit} />
    </div>
  )
}
