import { useEffect, useRef, useState } from 'react'
import { Star } from 'lucide-react'
import type { Screen } from '../engine/types'
import { track } from '../engine/analytics'
import { H1, KICKER, SHELL } from '../components/typography'

interface Props {
  screen: Screen
  onDone: () => void
}

interface Testimonial { name: string; text: string }

/* T6 — loadings teatrais: (a) barras sequenciais · (b) círculo 0→100% */
export default function Loading({ screen, onDone }: Props) {
  const p = screen.payload ?? {}
  const variant = (p.variant as string) ?? 'bars'
  const bars = (p.bars as string[]) ?? []
  const testimonials = (p.testimonials as Testimonial[]) ?? []

  const [progress, setProgress] = useState(0) // 0..100 global
  const done = useRef(false)

  const DURATION = variant === 'bars' ? 11000 : 13000

  useEffect(() => {
    track(variant === 'bars' ? 'analysis_started' : 'plan_creation_started', { screen: screen.id })
    const start = Date.now()
    const timer = setInterval(() => {
      const pct = Math.min(((Date.now() - start) / DURATION) * 100, 100)
      setProgress(pct)
      if (pct >= 100 && !done.current) {
        done.current = true
        clearInterval(timer)
        track(variant === 'bars' ? 'analysis_done' : 'plan_ready', { screen: screen.id })
        setTimeout(onDone, variant === 'bars' ? 400 : 1500)
      }
    }, 80)
    return () => clearInterval(timer)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  /* carrossel de depoimentos */
  const [tIdx, setTIdx] = useState(0)
  useEffect(() => {
    if (!testimonials.length) return
    const t = setInterval(() => setTIdx((i) => (i + 1) % testimonials.length), 4000)
    return () => clearInterval(t)
  }, [testimonials.length])

  if (variant === 'bars') {
    const perBar = 100 / bars.length
    return (
      <div className={SHELL}>
        <h1 className={H1}>{p.headline as string}</h1>
        <div className="mt-10 space-y-5">
          {bars.map((label, i) => {
            const barPct = Math.max(0, Math.min(((progress - i * perBar) / perBar) * 100, 100))
            return (
              <div key={label}>
                <div className="mb-1.5 flex items-center justify-between text-sm">
                  <span className={barPct > 0 ? 'font-medium text-[#1C1917]' : 'text-[#A8A29E]'}>{label}</span>
                  <span className="tabular-nums text-[#78716C]">{Math.round(barPct)}%</span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-[#E7E2DA]">
                  <div className="h-full rounded-full bg-[#292524] transition-[width] duration-100" style={{ width: `${barPct}%` }} />
                </div>
              </div>
            )
          })}
        </div>
        <div className="mt-12 text-center">
          <p className={KICKER}>{p.badge as string}</p>
          <div className="mt-2 flex items-center justify-center gap-1">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="h-4 w-4 fill-[#7D8F74] text-[#7D8F74]" />
            ))}
            <span className="ml-1 text-sm font-medium text-[#57534E]">{p.rating as string}</span>
          </div>
        </div>
      </div>
    )
  }

  /* variant: circle */
  const r = 70
  const circ = 2 * Math.PI * r
  const finished = progress >= 100
  return (
    <div className={`${SHELL} flex flex-col items-center`}>
      <div className="relative">
        <svg width="180" height="180" viewBox="0 0 180 180">
          <circle cx="90" cy="90" r={r} fill="none" stroke="#E7E2DA" strokeWidth="10" />
          <circle
            cx="90" cy="90" r={r} fill="none" stroke="#292524" strokeWidth="10"
            strokeLinecap="round" strokeDasharray={circ}
            strokeDashoffset={circ - (circ * progress) / 100}
            transform="rotate(-90 90 90)"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-3xl font-semibold tabular-nums text-[#1C1917]">{Math.round(progress)}%</span>
        </div>
      </div>

      <h1 className={`mt-8 ${H1}`}>
        {finished ? (p.doneHeadline as string) : (p.headline as string)}
      </h1>

      {!finished && (
        <>
          <p className="mt-4 text-center text-lg font-semibold text-[#B57E5B]">{p.social as string}</p>
          {testimonials.length > 0 && (
            <div className="mt-6 w-full rounded-2xl border border-[#E7E2DA] bg-white p-5 text-center transition-opacity">
              <div className="flex items-center justify-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-3.5 w-3.5 fill-[#D9A05B] text-[#D9A05B]" />
                ))}
              </div>
              <p className="mt-2 text-sm leading-relaxed text-[#57534E]">"{testimonials[tIdx].text}"</p>
              <p className="mt-2 text-xs font-semibold text-[#1C1917]">{testimonials[tIdx].name}</p>
            </div>
          )}
          <p className="mt-6 text-center text-[11px] leading-snug text-[#A8A29E]">{p.disclaimer as string}</p>
        </>
      )}
    </div>
  )
}
