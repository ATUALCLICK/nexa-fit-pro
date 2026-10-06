import { useEffect, useState } from 'react'
import {
  BadgeCheck, ChevronDown, Clock, HeartPulse, Home, Leaf, Lock,
  Salad, ShieldCheck, Sparkles, Star, Timer, Wind,
} from 'lucide-react'
import PaymentModal from './PaymentModal'
import { track } from '../quiz/engine/analytics'
import { useQuiz } from '../quiz/engine/store'
import { useFunnel } from '../funnel/loader'
import type { PlanJson as Plan } from '../funnel/schema'
import { H1, SECTION_H2, SUB } from '../quiz/components/typography'

const BRL = (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })

const ICONS: Record<string, React.ReactNode> = {
  home: <Home className="h-5 w-5 text-[#B57E5B]" />,
  sparkles: <Sparkles className="h-5 w-5 text-[#B57E5B]" />,
  timer: <Timer className="h-5 w-5 text-[#B57E5B]" />,
  leaf: <Leaf className="h-5 w-5 text-[#B57E5B]" />,
  salad: <Salad className="h-5 w-5 text-[#B57E5B]" />,
  wind: <Wind className="h-5 w-5 text-[#B57E5B]" />,
}

/* ---------- countdown persistido por funil (não zera no F5) ---------- */
function useCountdown(storageKey: string, startMin = 10) {
  const [secs, setSecs] = useState(() => {
    const saved = localStorage.getItem(storageKey)
    if (saved) {
      const left = Math.round((Number(saved) - Date.now()) / 1000)
      if (left > 0) return left
    }
    const end = Date.now() + startMin * 60 * 1000
    localStorage.setItem(storageKey, String(end))
    return startMin * 60
  })
  useEffect(() => {
    const t = setInterval(() => setSecs((s) => Math.max(s - 1, 0)), 1000)
    return () => clearInterval(t)
  }, [])
  const mm = String(Math.floor(secs / 60)).padStart(2, '0')
  const ss = String(secs % 60).padStart(2, '0')
  return { mm, ss, done: secs === 0 }
}

/* ---------- card de plano ---------- */
function PlanCard({ plan, selected, onSelect }: { plan: Plan; selected: boolean; onSelect: () => void }) {
  return (
    <button
      onClick={onSelect}
      className={`relative w-full rounded-2xl border-2 bg-white p-5 text-left transition-all ${
        selected ? 'border-[#292524] shadow-md' : 'border-[#E7E2DA] hover:border-[#C9C2B6]'
      }`}
    >
      {plan.popular && (
        <span className="absolute -top-3 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-[#B57E5B] px-4 py-1 text-[11px] font-bold uppercase tracking-wider text-white">
          Mais popular
        </span>
      )}
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="font-semibold text-[#1C1917]">{plan.name}</p>
          <p className="mt-1 text-sm text-[#78716C]">
            <span className="line-through">{BRL(plan.regular)}</span>{' '}
            <span className="font-semibold text-[#1C1917]">{BRL(plan.price)}</span>
          </p>
          <p className="mt-1 text-lg font-bold text-[#B57E5B]">{BRL(plan.perDay)}<span className="text-xs font-medium text-[#78716C]">/dia</span></p>
        </div>
        <span className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 transition ${
          selected ? 'border-[#292524] bg-[#292524]' : 'border-[#D6CFC4] bg-white'
        }`}>
          {selected && <span className="h-2 w-2 rounded-full bg-white" />}
        </span>
      </div>
    </button>
  )
}

/* ---------- bloco de planos (usado 2x na página) ---------- */
function PlansBlock({ plans, brand, countdownKey, countdownMin, selected, setSelected, onCta, position }: {
  plans: Plan[]; brand: string; countdownKey: string; countdownMin: number
  selected: Plan; setSelected: (p: Plan) => void; onCta: (pos: string) => void; position: string
}) {
  const { mm, ss } = useCountdown(countdownKey, countdownMin)
  const coupon = useQuiz((s) => s.coupon)
  return (
    <div className="mx-auto w-full max-w-3xl px-4">
      <div className="flex flex-wrap items-center justify-center gap-2 rounded-full bg-[#7D8F74]/10 px-5 py-2.5 text-sm font-medium text-[#3F4A38]">
        <BadgeCheck className="h-4 w-4" />
        Seu código promocional foi aplicado!
        <span className="font-mono font-bold">{coupon}</span>
        <span className="flex items-center gap-1 font-bold text-[#C96A5B]"><Clock className="h-4 w-4" />{mm}:{ss}</span>
      </div>

      <div className="mt-6 grid gap-3 md:grid-cols-3">
        {plans.map((p) => (
          <PlanCard key={p.id} plan={p} selected={selected.id === p.id} onSelect={() => { setSelected(p); track('plan_card_selected', { plan: p.id, price: p.price, position }) }} />
        ))}
      </div>

      <p className="mt-4 text-center text-[11px] leading-snug text-[#A8A29E]">
        Sem cancelamento, antes do término do plano selecionado, aceito que {brand} cobre
        automaticamente {BRL(selected.regular)} a cada {selected.cycle} até eu cancelar.
        Cancele online pelo perfil no site ou app.
      </p>

      <button
        onClick={() => onCta(position)}
        className="mx-auto mt-5 block h-[52px] w-full max-w-[400px] rounded-full bg-[#292524] text-sm font-semibold tracking-wide text-white transition hover:bg-[#1C1917] active:scale-[0.99]"
      >
        QUERO MEU PLANO
      </button>

      <div className="mt-4 flex items-center justify-center gap-3 text-[#A8A29E]">
        <Lock className="h-3.5 w-3.5" />
        <span className="text-[11px] font-medium">SSL seguro · Visa · Mastercard · PCI · Pix</span>
      </div>
    </div>
  )
}

/* ---------- página ---------- */
export default function CheckoutPage() {
  const runtime = useFunnel()
  const { funnel } = runtime
  const c = funnel.checkout
  const { answers, scratched } = useQuiz()

  /* modelo final do checkout — toda a derivação vive atrás da seam do runtime */
  const m = runtime.checkoutModel(answers)

  const initialPlan = m.plans.find((p) => p.id === m.initialPlanId) ?? m.plans[0]
  const [selected, setSelected] = useState<Plan>(initialPlan)
  const [modal, setModal] = useState(false)
  const countdownKey = `vp-countdown-end-${funnel.meta.slug}`
  const { mm, ss, done } = useCountdown(countdownKey, c.countdownMin)

  useEffect(() => { track('screen_viewed', { screen_id: 'checkout', scratched }) }, [scratched])

  const openModal = (position: string) => {
    track('checkout_cta_clicked', { position, plan: selected.id })
    track('payment_modal_opened', { plan: selected.id })
    setModal(true)
  }

  const { headline, stories, faqs, bars, guaranteeEarly, goalW, dateLabel, dreamLabel } = m

  /* ícones são apresentação: o modelo traz a chave, a página resolve o glyph */
  const included = m.included.map((it) => ({
    ...it,
    icon: ICONS[it.icon] ?? <Sparkles className="h-5 w-5 text-[#B57E5B]" />,
  }))

  const [openFaq, setOpenFaq] = useState<number | null>(() => {
    const i = faqs.findIndex((f) => f.open)
    return i >= 0 ? i : null
  })

  const guarantee = (
    <section className="mx-auto mt-14 max-w-2xl px-4">
      <div className="flex items-start gap-4 rounded-2xl border-2 border-[#7D8F74] bg-white p-6">
        <ShieldCheck className="h-10 w-10 shrink-0 text-[#7D8F74]" />
        <div>
          <p className="font-semibold text-[#1C1917]">Garantia de {c.guaranteeDays} dias</p>
          <p className="mt-1 text-sm leading-relaxed text-[#57534E]">
            Acreditamos que o nosso plano funciona e você verá resultados visíveis em apenas 4 semanas!
            Devolvemos o seu dinheiro se você demonstrar que seguiu o plano e não viu resultados.
            Consulte as condições na nossa <span className="underline">política de reembolso</span>.
          </p>
        </div>
      </div>
    </section>
  )

  return (
    <div className="min-h-screen bg-[#FAF7F2]">
      {/* header fixo com urgência */}
      <header className="sticky top-0 z-40 border-b border-[#E7E2DA] bg-[#FAF7F2]/95 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4">
          <span className="font-serif text-lg font-semibold italic text-[#292524]">{c.brandLine}</span>
          {!done && (
            <span className="hidden items-center gap-1.5 text-sm font-semibold text-[#C96A5B] sm:flex">
              <Clock className="h-4 w-4" /> Desconto reservado por: {mm}:{ss}
            </span>
          )}
          <button
            onClick={() => openModal('header')}
            className="rounded-full bg-[#292524] px-5 py-2 text-xs font-bold tracking-wide text-white transition hover:bg-[#1C1917]"
          >
            QUERO MEU PLANO
          </button>
        </div>
      </header>

      {/* J1 — hero do resultado */}
      <section className="mx-auto max-w-3xl px-4 pt-10 text-center">
        <h1 className={H1}>{headline}</h1>
        <p className={SUB}>{c.planReady}</p>
        {/* F2 — urgência personalizada: evento com data capturada no quiz */}
        {m.eventLine && (
          <p className="mx-auto mt-4 inline-flex items-center gap-2 rounded-full border border-[#E7D9C9] bg-[#FDF9F4] px-4 py-2 text-[13px] font-medium text-[#8A6642]">
            {m.eventLine}
          </p>
        )}
        <div className="mt-6 grid grid-cols-2 gap-3">
          <div className="rounded-2xl border border-[#E7E2DA] bg-white p-5">
            <p className="text-xs font-semibold uppercase tracking-wider text-[#A8A29E]">Agora</p>
            <svg viewBox="0 0 80 120" className="mx-auto mt-2 h-28 w-auto">
              <ellipse cx="40" cy="14" rx="9" ry="10" fill="#E8C4A8" stroke="#292524" strokeWidth="1.5" />
              <path d="M40 25 C 22 29, 20 52, 24 66 C 20 84, 26 96, 28 104 L 52 104 C 54 96, 60 84, 56 66 C 60 52, 58 29, 40 25 Z" fill="#F3EFE8" stroke="#292524" strokeWidth="1.5" />
              <path d="M26 34 C 30 44, 34 48, 40 48" stroke="#C96A5B" strokeWidth="1.5" fill="none" strokeDasharray="3 2" />
            </svg>
            <p className="mt-2 text-xs text-[#78716C]">{m.heroNowLabel}</p>
          </div>
          <div className="rounded-2xl border-2 border-[#7D8F74] bg-white p-5">
            <p className="text-xs font-semibold uppercase tracking-wider text-[#3F4A38]">Seu objetivo</p>
            <svg viewBox="0 0 80 120" className="mx-auto mt-2 h-28 w-auto">
              <ellipse cx="40" cy="14" rx="9" ry="10" fill="#E8C4A8" stroke="#292524" strokeWidth="1.5" />
              <path d="M40 25 C 28 29, 27 52, 30 66 C 28 84, 31 96, 32 104 L 48 104 C 49 96, 52 84, 50 66 C 53 52, 52 29, 40 25 Z" fill="#DCE3D4" stroke="#3F4A38" strokeWidth="1.5" />
              <path d="M40 30 L40 100" stroke="#7D8F74" strokeWidth="1.5" strokeDasharray="3 2" />
            </svg>
            <p className="mt-2 text-xs font-medium text-[#3F4A38]">{dreamLabel}</p>
          </div>
        </div>

        {/* barras comparativas */}
        <div className="mt-4 space-y-3 rounded-2xl border border-[#E7E2DA] bg-white p-5 text-left">
          {bars.map((b) => (
            <div key={b.label}>
              <div className="flex justify-between text-xs">
                <span className="font-medium text-[#1C1917]">{b.label}</span>
                <span className="text-[#78716C]">{b.from} → <span className="font-semibold text-[#3F4A38]">{b.to}</span></span>
              </div>
              <div className="mt-1 h-2 overflow-hidden rounded-full bg-[#F3EFE8]">
                <div className="h-full rounded-full bg-gradient-to-r from-[#C96A5B] to-[#7D8F74]" style={{ width: `${b.pct}%` }} />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* J2 — planos */}
      <section className="mt-10">
        <PlansBlock plans={c.plans} brand={c.brandLine} countdownKey={countdownKey} countdownMin={c.countdownMin}
          selected={selected} setSelected={setSelected} onCta={openModal} position="plans_1" />
      </section>

      {/* garantia antecipada (ex.: camada cética) */}
      {guaranteeEarly && guarantee}

      {/* J4 — o que está incluído */}
      <section className="mx-auto mt-16 max-w-3xl px-4">
        <h2 className={`text-center ${SECTION_H2}`}>O que está incluído no seu plano</h2>
        <div className="mt-6 grid gap-3 md:grid-cols-2">
          {included.map((it) => (
            <div key={it.title} className="flex items-start gap-3 rounded-2xl border border-[#E7E2DA] bg-white p-4">
              <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#F3EFE8]">{it.icon}</span>
              <div>
                <p className="text-sm font-semibold text-[#1C1917]">{it.title}</p>
                <p className="mt-0.5 text-xs leading-snug text-[#78716C]">{it.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* J5 — avaliações */}
      <section className="mx-auto mt-12 max-w-3xl px-4">
        <div className="flex flex-col items-center gap-4 rounded-2xl border border-[#E7E2DA] bg-white p-6 text-center md:flex-row md:text-left">
          <div className="flex-1">
            <div className="flex items-center justify-center gap-1 md:justify-start">
              {[...Array(5)].map((_, i) => <Star key={i} className="h-5 w-5 fill-[#D9A05B] text-[#D9A05B]" />)}
            </div>
            <p className="mt-2 text-lg font-semibold text-[#1C1917]">{c.rating.line1}</p>
            <p className="text-sm text-[#78716C]">{c.rating.line2}</p>
          </div>
          <div className="rounded-xl bg-[#F3EFE8] px-5 py-3">
            <p className="text-2xl font-bold text-[#292524]">{c.rating.score}</p>
            <p className="text-xs text-[#78716C]">nota média</p>
          </div>
        </div>
      </section>

      {/* J6 — histórias */}
      <section className="mx-auto mt-16 max-w-3xl px-4">
        <h2 className={`text-center ${SECTION_H2}`}>Resultados que nos orgulham</h2>
        <div className="mt-6 grid gap-3 md:grid-cols-3">
          {stories.map((s) => (
            <div key={s.name} className="flex flex-col rounded-2xl border border-[#E7E2DA] bg-white p-5">
              <span className="w-fit rounded-full bg-[#7D8F74]/10 px-3 py-1 text-sm font-bold text-[#3F4A38]">{s.kg}</span>
              <p className="mt-3 flex-1 text-sm leading-relaxed text-[#57534E]">"{s.text}"</p>
              <p className="mt-3 text-xs font-semibold text-[#1C1917]">{s.name}</p>
            </div>
          ))}
        </div>
        <p className="mt-3 text-center text-[11px] leading-snug text-[#A8A29E]">
          Estas usuárias tiveram acesso a acompanhamento personalizado, disponível como recurso adicional
          pago. Usuárias compensadas por compartilhar seu feedback.
        </p>
      </section>

      {/* J7 — FAQ */}
      <section className="mx-auto mt-16 max-w-2xl px-4">
        <h2 className={`text-center ${SECTION_H2}`}>Perguntas frequentes</h2>
        <div className="mt-6 space-y-2">
          {faqs.map((f, i) => (
            <div key={i} className="overflow-hidden rounded-xl border border-[#E7E2DA] bg-white">
              <button
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
                className="flex w-full items-center justify-between px-5 py-4 text-left text-sm font-semibold text-[#1C1917]"
              >
                {f.q}
                <ChevronDown className={`h-4 w-4 shrink-0 text-[#78716C] transition-transform ${openFaq === i ? 'rotate-180' : ''}`} />
              </button>
              {openFaq === i && (
                <p className="border-t border-[#F3EFE8] px-5 py-4 text-sm leading-relaxed text-[#57534E]">{f.a}</p>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* J8 — mídia */}
      <section className="mx-auto mt-14 max-w-3xl px-4 text-center">
        <p className="text-xs font-semibold uppercase tracking-widest text-[#A8A29E]">Como exibido em</p>
        <div className="mt-4 flex flex-wrap items-center justify-center gap-x-10 gap-y-3">
          {c.media.map((l) => (
            <span key={l} className="font-serif text-xl italic text-[#78716C]">{l}</span>
          ))}
        </div>
      </section>

      {/* J9 — reviews */}
      <section className="mx-auto mt-14 max-w-3xl px-4">
        <h2 className={`text-center ${SECTION_H2}`}>{c.trustLine}</h2>
        <div className="mt-6 grid gap-3 md:grid-cols-3">
          {c.reviews.map((r) => (
            <div key={r.name} className="rounded-2xl border border-[#E7E2DA] bg-white p-5">
              <div className="flex gap-0.5">
                {[...Array(5)].map((_, i) => <Star key={i} className="h-3.5 w-3.5 fill-[#7D8F74] text-[#7D8F74]" />)}
              </div>
              <p className="mt-2 text-sm leading-relaxed text-[#57534E]">"{r.text}"</p>
              <p className="mt-2 text-xs font-semibold text-[#1C1917]">{r.name}</p>
            </div>
          ))}
        </div>
        <div className="mt-4 flex items-center justify-center gap-2 text-sm">
          <Star className="h-5 w-5 fill-[#7D8F74] text-[#7D8F74]" />
          <span className="font-semibold text-[#1C1917]">Excelente</span>
          <span className="text-[#78716C]">{c.rating.score} de 5 nas plataformas de avaliação</span>
        </div>
      </section>

      {/* J10 — planos de novo */}
      <section className="mt-16">
        <h2 className={`mb-6 text-center ${SECTION_H2}`}>{c.plansHeadline2}</h2>
        <PlansBlock plans={c.plans} brand={c.brandLine} countdownKey={countdownKey} countdownMin={c.countdownMin}
          selected={selected} setSelected={setSelected} onCta={openModal} position="plans_2" />
      </section>

      {/* J11 — garantia (posição padrão) */}
      {!guaranteeEarly && guarantee}

      {/* J12 — footer */}
      <footer className="mt-16 border-t border-[#E7E2DA] py-10 text-center">
        <p className="font-serif text-lg font-semibold italic text-[#292524]">{c.brandLine}</p>
        <p className="mt-2 text-xs text-[#A8A29E]">
          {c.legal.company} · CNPJ {c.legal.cnpj} · {c.legal.city}
        </p>
        <div className="mt-3 flex items-center justify-center gap-4 text-xs text-[#78716C]">
          <span className="underline">Política de Privacidade</span>
          <span className="underline">Termos de Serviço</span>
          <span className="underline">Reembolso</span>
        </div>
        <p className="mx-auto mt-4 flex max-w-md items-start justify-center gap-1.5 text-[11px] leading-snug text-[#A8A29E]">
          <HeartPulse className="mt-0.5 h-3.5 w-3.5 shrink-0" />
          Este programa não substitui orientação médica. Consulte seu médico antes de iniciar.
          Meta estimada: {goalW} kg até {dateLabel} — resultados individuais podem variar.
        </p>
        <p className="mt-3 text-[10px] text-[#C9C2B6]">Ícones 3D por thiings.co</p>
      </footer>

      <PaymentModal plan={selected} open={modal} onClose={() => setModal(false)} />
    </div>
  )
}
