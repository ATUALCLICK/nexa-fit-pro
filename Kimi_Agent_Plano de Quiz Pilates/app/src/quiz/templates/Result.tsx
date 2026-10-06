import { Activity, HeartPulse, Info, Sparkles, Target, ThumbsUp, Wind } from 'lucide-react'
import type { Answers } from '../engine/types'
import { bold } from '../engine/resolve'
import CTAButton from '../components/CTAButton'
import type { View } from '../../funnel/view'
import { H1, SHELL, SHELL_WITH_CTA, SUB } from '../components/typography'

interface Props {
  view: View
  answers: Answers
  onContinue: () => void
}

/* ---------- escala de IMC 15–40 com marcador ---------- */
function BmiScale({ value }: { value: number }) {
  const pct = Math.max(0, Math.min(((value - 15) / 25) * 100, 100))
  return (
    <div className="mt-10">
      <div className="relative h-3 w-full overflow-visible rounded-full"
        style={{ background: 'linear-gradient(to right,#7D8F74 0%,#7D8F74 14%,#D9C98A 14%,#D9C98A 40%,#D9A05B 40%,#D9A05B 60%,#C96A5B 60%,#C96A5B 100%)' }}>
        <div className="absolute -top-2.5 h-8 w-1.5 rounded bg-[#292524] transition-all duration-500" style={{ left: `calc(${pct}% - 3px)` }} />
        <div className="absolute -top-9 -translate-x-1/2 whitespace-nowrap rounded-full bg-[#292524] px-2.5 py-0.5 text-[11px] font-semibold text-white" style={{ left: `${pct}%` }}>
          O Seu – {String(value).replace('.', ',')}
        </div>
      </div>
      <div className="mt-2 flex justify-between text-[10px] font-medium text-[#78716C]">
        <span>Abaixo do peso</span><span>Normal</span><span>Acima do peso</span><span>Obeso</span>
      </div>
    </div>
  )
}

/* ---------- gráfico de projeção de peso ---------- */
function ProjectionChart({ from, to, dateLabel }: { from: number; to: number; dateLabel: string }) {
  const W = 560, H = 240, PAD = 36
  const pts = [0, 1, 2, 3].map((i) => {
    const t = i / 3
    const eased = 1 - Math.pow(1 - t, 1.6)
    const kg = from - (from - to) * eased
    return { x: PAD + (t * (W - PAD * 2)), y: PAD + ((from - kg) / Math.max(from - to, 1)) * (H - PAD * 2), kg }
  })
  const path = pts.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x},${p.y}`).join(' ')
  const area = `${path} L${pts[3].x},${H - PAD} L${pts[0].x},${H - PAD} Z`
  const now = new Date()
  const months = [0, 1, 2, 3].map((i) => {
    const d = new Date(now); d.setMonth(d.getMonth() + i)
    return d.toLocaleDateString('pt-BR', { month: 'short' }).replace('.', '')
  })

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="mt-4 w-full">
      <defs>
        <linearGradient id="proj" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#7D8F74" stopOpacity="0.35" />
          <stop offset="100%" stopColor="#7D8F74" stopOpacity="0.02" />
        </linearGradient>
      </defs>
      <path d={area} fill="url(#proj)" />
      <path d={path} fill="none" stroke="#7D8F74" strokeWidth="3" strokeLinecap="round" />
      {pts.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r="5" fill="#fff" stroke="#7D8F74" strokeWidth="3" />
      ))}
      <g>
        <rect x={pts[3].x - 70} y={pts[3].y - 40} width="140" height="28" rx="14" fill="#292524" />
        <text x={pts[3].x} y={pts[3].y - 21} textAnchor="middle" fill="#fff" fontSize="13" fontWeight="600">
          Objetivo {to} kg
        </text>
      </g>
      <text x={pts[0].x} y={pts[0].y - 12} textAnchor="middle" fill="#57534E" fontSize="13" fontWeight="600">{from} kg</text>
      {months.map((m, i) => (
        <text key={m + i} x={pts[i].x} y={H - 12} textAnchor="middle" fill="#A8A29E" fontSize="12">{m}</text>
      ))}
      <text x={PAD} y={20} fill="#A8A29E" fontSize="11">hoje → {dateLabel}</text>
    </svg>
  )
}

/* ---------- T7 — render puro: tudo derivado chega na View ---------- */
export default function Result({ view, answers, onContinue }: Props) {
  const { screen, calc, labelOf } = view
  const p = screen.payload ?? {}
  const variant = (p.variant as string) ?? 'profile'
  const cta = (p.cta as string) ?? 'CONTINUAR'

  if (variant === 'profile') {
    const cardLabels = (p.cards as Record<string, string> | undefined) ?? {}
    const zones = Array.isArray(answers.focusZones) ? (answers.focusZones as string[]) : []
    const cards = [
      { icon: <HeartPulse className="h-5 w-5 text-[#B57E5B]" />, label: calc.diagnosisCardLabel, value: calc.diagnosisCardValue, info: true },
      { icon: <Activity className="h-5 w-5 text-[#B57E5B]" />, label: cardLabels.lifestyle ?? 'Estilo de vida', value: calc.lifestyle, info: false },
      { icon: <Sparkles className="h-5 w-5 text-[#B57E5B]" />, label: cardLabels.level ?? 'Nível', value: calc.pilatesLevel, info: false },
      { icon: <Wind className="h-5 w-5 text-[#B57E5B]" />, label: cardLabels.flexibility ?? 'Flexibilidade', value: calc.flexibilityLabel, info: false },
      ...(zones.length
        ? [{ icon: <Target className="h-5 w-5 text-[#B57E5B]" />, label: cardLabels.focus ?? 'Foco especial', value: zones.map((z) => labelOf('focusZones', z)).join(' + '), info: false }]
        : []),
    ]
    return (
      <div className={`${SHELL} ${SHELL_WITH_CTA}`}>
        <h1 className={H1}>{p.headline as string}</h1>

        <div className="mt-6 rounded-2xl border border-[#E7E2DA] bg-white p-6 pt-12">
          <p className="text-sm font-semibold text-[#1C1917]">Índice de Massa Corporal (IMC)</p>
          <BmiScale value={calc.bmi ?? 25.7} />
          <div className={`mt-5 flex items-start gap-2 rounded-xl p-4 text-sm leading-relaxed ${calc.bmiBandOk ? 'bg-[#7D8F74]/10 text-[#3F4A38]' : 'bg-[#C96A5B]/10 text-[#7A3A30]'}`}>
            <Info className="mt-0.5 h-4 w-4 shrink-0" />
            {calc.bmiBandOk
              ? 'Seu IMC está na faixa saudável — o foco do seu plano será tônus, postura e flexibilidade.'
              : 'Riscos de IMC não saudável: tensão arterial elevada, risco acrescido de problemas cardíacos, diabetes tipo 2, dores crônicas nas costas e articulações.'}
          </div>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-3">
          {cards.map((c) => (
            <div key={c.label} className="rounded-2xl border border-[#E7E2DA] bg-white p-4">
              <div className="flex items-center gap-2">{c.icon}
                <span className="text-xs text-[#78716C]">{c.label}</span>
                {c.info && <Info className="h-3 w-3 text-[#C9C2B6]" />}
              </div>
              <p className="mt-2 text-[15px] font-semibold text-[#1C1917]">{c.value}</p>
            </div>
          ))}
        </div>

        <CTAButton label={cta} onClick={onContinue} />
      </div>
    )
  }

  if (variant === 'projection') {
    const sub = (p.subheadline as string) ?? ''
    const coach = p.coach as { quote: string; name: string; role: string }
    return (
      <div className={`${SHELL} ${SHELL_WITH_CTA}`}>
        <h1 className={H1}>{p.headline as string}</h1>
        <p className={SUB}>{bold(sub)}</p>

        <div className="mt-4 rounded-2xl border border-[#E7E2DA] bg-white p-5">
          <ProjectionChart from={calc.weight} to={calc.goalWeight} dateLabel={calc.projectionDate} />
          <p className="mt-2 text-[11px] leading-snug text-[#A8A29E]">
            *Baseado em dados de usuárias que registram o progresso no app. Seguir o plano de treinos e
            alimentação influencia significativamente os resultados. O gráfico é uma ilustração não
            personalizada e os resultados podem variar. Consulte seu médico antes de começar.
          </p>
        </div>

        <div className="mt-4 flex items-start gap-4 rounded-2xl border border-[#E7E2DA] bg-white p-5">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-[#F3EFE8] text-base font-semibold text-[#B57E5B]">
            {coach.name.split(' ').map((w) => w[0]).slice(0, 2).join('')}
          </div>
          <div>
            <p className="text-sm leading-relaxed text-[#57534E]">"{coach.quote}"</p>
            <p className="mt-2 text-xs font-semibold text-[#1C1917]">{coach.name}</p>
            <p className="text-xs text-[#78716C]">{coach.role}</p>
          </div>
        </div>

        <CTAButton label={cta} onClick={onContinue} />
      </div>
    )
  }

  /* plan-ready — badges chegam pré-avaliadas no payload (audience: string|null, extra: string[]) */
  const name = calc.firstName
  const kg = Math.max(Math.round((calc.weight - calc.goalWeight) * 10) / 10, 0)
  const headline = (p.headline as string) ?? ''
  const badgeDefs = (p.badges as { audience: string | null; extra: string[] } | undefined) ?? { audience: null, extra: [] }

  /* nome em destaque no headline (posição do {{firstName}} interpolado) */
  const nameIdx = name !== 'você' ? headline.indexOf(name) : -1

  const badges = [
    ...(badgeDefs.audience ? [{ icon: <ThumbsUp className="h-5 w-5 text-[#7D8F74]" />, text: badgeDefs.audience }] : []),
    ...badgeDefs.extra.map((text) => ({
      icon: <Sparkles className="h-5 w-5 text-[#7D8F74]" />,
      text,
    })),
    { icon: <Target className="h-5 w-5 text-[#7D8F74]" />, text: `Meta: Perder ${kg} kg até ${calc.projectionDate}*` },
  ]

  return (
    <div className={`${SHELL} ${SHELL_WITH_CTA}`}>
      <h1 className={H1}>
        {nameIdx >= 0 ? (
          <>
            {headline.slice(0, nameIdx)}
            <span className="text-[#B57E5B]">{name}</span>
            {headline.slice(nameIdx + name.length)}
          </>
        ) : (
          bold(headline)
        )}
      </h1>

      <div className="mt-6 rounded-2xl border border-[#E7E2DA] bg-white p-5">
        <svg viewBox="0 0 560 180" className="w-full">
          {[0, 1, 2, 3].map((i) => {
            const x = 60 + i * 146
            return (
              <g key={i}>
                <line x1={x} y1="20" x2={x} y2="140" stroke="#F3EFE8" strokeWidth="1" />
                <text x={x} y="160" textAnchor="middle" fill="#A8A29E" fontSize="12">Semana {i + 1}</text>
              </g>
            )
          })}
          <path d="M60 130 C 180 120, 300 80, 498 45" fill="none" stroke="#7D8F74" strokeWidth="3" strokeLinecap="round" strokeDasharray="600" strokeDashoffset="0" />
          <circle cx="60" cy="130" r="6" fill="#292524" />
          <text x="60" y="115" textAnchor="middle" fill="#292524" fontSize="12" fontWeight="600">Agora</text>
          <circle cx="498" cy="45" r="6" fill="#7D8F74" />
          <text x="498" y="30" textAnchor="middle" fill="#3F4A38" fontSize="12" fontWeight="600">4 semanas</text>
        </svg>
        <p className="mt-1 text-center text-[11px] text-[#A8A29E]">Este gráfico é apenas para fins ilustrativos</p>
      </div>

      <div className="mt-4 space-y-2">
        {badges.map((b, i) => (
          <div key={i} className="flex items-center gap-3 rounded-xl border border-[#E7E2DA] bg-white px-4 py-3">
            {b.icon}
            <span className="text-sm font-medium text-[#1C1917]">{b.text}</span>
          </div>
        ))}
      </div>

      <p className="mt-4 text-center text-[11px] leading-snug text-[#A8A29E]">
        *Seguir o plano de treinos e alimentação influencia significativamente os resultados.
        Resultados individuais podem variar. Consulte seu médico antes de começar.
      </p>

      <CTAButton label={cta} onClick={onContinue} />
    </div>
  )
}
