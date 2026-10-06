import { useEffect, useRef, useState } from 'react'

/*
 * PlanMeter — medidor de plano evolutivo dos ecos (momentum).
 * Dados declarativos via payload.meter (ver docs/superpowers/specs).
 * O % conta do valor anterior ao novo (count-up 1,2s ease-out cúbico)
 * a cada eco; o anel acompanha o mesmo valor animado.
 * milestone = eco que fecha um bloco: card dourado, anel dourado com
 * brilho, selo "Bloco X completo" + partículas discretas.
 */
export interface Meter {
  pct: number
  block: number
  blockName: string
  milestone?: string
}

const R = 27
const CIRC = 2 * Math.PI * R
const BLOCKS = 5

function useCountUp(target: number, duration = 1200): number {
  const [value, setValue] = useState(0)
  const prev = useRef(0)
  useEffect(() => {
    const from = prev.current
    let raf = 0
    const start = window.setTimeout(() => {
      const t0 = performance.now()
      const tick = (t: number) => {
        const k = Math.min((t - t0) / duration, 1)
        const e = 1 - Math.pow(1 - k, 3)
        setValue(Math.round(from + (target - from) * e))
        if (k < 1) raf = requestAnimationFrame(tick)
        else prev.current = target
      }
      raf = requestAnimationFrame(tick)
    }, 350)
    return () => {
      window.clearTimeout(start)
      cancelAnimationFrame(raf)
    }
  }, [target, duration])
  return value
}

const CONFETTI = [
  { top: 10, right: 18, size: 7, color: '#D9A05B', round: false, delay: 0 },
  { top: 26, right: 44, size: 5, color: '#B57E5B', round: false, delay: 0.4 },
  { bottom: 14, right: 26, size: 6, color: '#7D8F74', round: true, delay: 0.9 },
  { top: 14, right: 70, size: 5, color: '#D9A05B', round: true, delay: 1.3 },
] as const

export default function PlanMeter({ meter }: { meter: Meter }) {
  const pct = useCountUp(meter.pct)
  const milestone = Boolean(meter.milestone)
  const ringColor = milestone ? '#D9A05B' : '#B57E5B'

  return (
    <div
      className={`relative mt-6 flex w-full animate-[fadeSlideIn_0.4s_ease-out] items-center gap-4 rounded-2xl border p-5 ${
        milestone
          ? 'border-[#DED2C4] bg-gradient-to-br from-[#FDF9F4] to-[#FBF3EA]'
          : 'border-[#E7E2DA] bg-white'
      }`}
    >
      {milestone &&
        CONFETTI.map((c, i) => (
          <span
            key={i}
            className="absolute animate-[drift_2.8s_ease-in-out_infinite]"
            style={{
              top: 'top' in c ? c.top : undefined,
              bottom: 'bottom' in c ? c.bottom : undefined,
              right: c.right,
              width: c.size,
              height: c.size,
              background: c.color,
              borderRadius: c.round ? '50%' : 2,
              opacity: 0.9,
              animationDelay: `${c.delay}s`,
            }}
          />
        ))}

      <div
        className={`relative h-16 w-16 shrink-0 ${
          milestone ? 'animate-[goldPulse_1.8s_ease-in-out_infinite]' : ''
        }`}
      >
        <svg width="64" height="64" viewBox="0 0 64 64" className="-rotate-90">
          <circle cx="32" cy="32" r={R} fill="none" stroke="#F3EFE8" strokeWidth="6" />
          <circle
            cx="32"
            cy="32"
            r={R}
            fill="none"
            stroke={ringColor}
            strokeWidth="6"
            strokeLinecap="round"
            strokeDasharray={CIRC}
            strokeDashoffset={CIRC * (1 - pct / 100)}
          />
        </svg>
        <span className="absolute inset-0 flex items-center justify-center text-base font-extrabold tracking-tight text-[#1C1917]">
          {pct}%
        </span>
      </div>

      <div className="min-w-0 flex-1">
        <p className="text-[10.5px] font-semibold uppercase tracking-[0.16em] text-[#A8A29E]">Seu plano</p>
        <p className="mt-0.5 text-[14.5px] font-semibold text-[#1C1917]">{pct}% montado</p>
        <p className="mt-0.5 text-[12.5px] text-[#78716C]">
          Bloco {meter.block} de {BLOCKS} · {meter.blockName}
        </p>
        <div className="mt-2 flex gap-1">
          {Array.from({ length: BLOCKS }, (_, i) => (
            <span
              key={i}
              className="h-1 flex-1 rounded-full"
              style={{
                background:
                  i < meter.block - 1
                    ? '#B57E5B'
                    : i === meter.block - 1
                      ? 'linear-gradient(90deg,#B57E5B 40%,#F3EFE8 40%)'
                      : '#F3EFE8',
              }}
            />
          ))}
        </div>
        {milestone && (
          <span className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-[#7D8F74] px-3 py-1.5 text-xs font-semibold text-white">
            <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="#fff" strokeWidth="3">
              <path d="M4 12l5 5L20 6" />
            </svg>
            {meter.milestone}
          </span>
        )}
      </div>
    </div>
  )
}
