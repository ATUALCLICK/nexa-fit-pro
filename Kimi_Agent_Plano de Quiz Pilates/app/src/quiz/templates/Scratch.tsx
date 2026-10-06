import { useEffect, useRef, useState } from 'react'
import { BadgePercent, Check } from 'lucide-react'
import type { Screen } from '../engine/types'
import { track } from '../engine/analytics'
import { useQuiz } from '../engine/store'
import { H1, SHELL, SUB } from '../components/typography'

interface Props {
  screen: Screen
  onDone: () => void
}

/* Raspadinha gamificada — sempre revela 30% (teatro de posse) */
export default function Scratch({ screen, onDone }: Props) {
  const p = screen.payload ?? {}
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const scratching = useRef(false)
  const [revealed, setRevealed] = useState(false)
  const [countdown, setCountdown] = useState(4)
  const setScratched = useQuiz((s) => s.setScratched)

  useEffect(() => {
    track('scratch_started')
    const c = canvasRef.current
    if (!c) return
    const ctx = c.getContext('2d')!
    const { width, height } = c.getBoundingClientRect()
    c.width = width * 2
    c.height = height * 2
    ctx.scale(2, 2)
    ctx.fillStyle = '#292524'
    ctx.fillRect(0, 0, width, height)
    ctx.fillStyle = '#FAF7F2'
    ctx.font = '600 18px system-ui'
    ctx.textAlign = 'center'
    ctx.fillText('Raspe aqui', width / 2, height / 2 - 8)
    ctx.font = '13px system-ui'
    ctx.fillStyle = '#B9B2A8'
    ctx.fillText('arraste para revelar', width / 2, height / 2 + 16)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const erase = (clientX: number, clientY: number) => {
    const c = canvasRef.current
    if (!c || revealed) return
    const rect = c.getBoundingClientRect()
    const ctx = c.getContext('2d')!
    ctx.globalCompositeOperation = 'destination-out'
    ctx.beginPath()
    ctx.arc(clientX - rect.left, clientY - rect.top, 30, 0, Math.PI * 2)
    ctx.fill()
  }

  const checkRevealed = () => {
    const c = canvasRef.current
    if (!c || revealed) return
    const ctx = c.getContext('2d')!
    const data = ctx.getImageData(0, 0, c.width, c.height).data
    let clear = 0
    let total = 0
    for (let i = 3; i < data.length; i += 16) {
      total++
      if (data[i] < 60) clear++
    }
    if (total > 0 && clear / total > 0.4) reveal()
  }

  const reveal = () => {
    if (revealed) return
    setRevealed(true)
    setScratched()
    track('scratch_revealed', { discount: 30, code: p.code })
  }

  useEffect(() => {
    if (!revealed) return
    if (countdown <= 0) { onDone(); return }
    const t = setTimeout(() => setCountdown((c) => c - 1), 1000)
    return () => clearTimeout(t)
  }, [revealed, countdown, onDone])

  return (
    <div className={`${SHELL} flex flex-col items-center`}>
      <h1 className={H1}>{p.headline as string}</h1>
      <p className={SUB}>{p.subheadline as string}</p>

      <div className="relative mt-10 w-full max-w-[360px]">
        <div className="relative overflow-hidden rounded-2xl border-2 border-dashed border-[#C9C2B6] bg-white">
          <div className="flex flex-col items-center px-6 py-12 text-center">
            <BadgePercent className="h-10 w-10 text-[#B57E5B]" />
            <p className="mt-3 text-5xl font-bold text-[#1C1917]">{p.discount as string}</p>
            <p className="mt-1 text-sm font-medium text-[#57534E]">de desconto no seu Plano de Pilates</p>
            <div className="mt-5 flex items-center gap-2 rounded-lg bg-[#F3EFE8] px-4 py-2">
              <span className="text-xs text-[#78716C]">Código promocional</span>
              <span className="font-mono text-sm font-bold text-[#1C1917]">{p.code as string}</span>
            </div>
            <p className="mt-3 flex items-center gap-1 text-xs font-medium text-[#7D8F74]">
              <Check className="h-3.5 w-3.5" /> Aplicado automaticamente no checkout
            </p>
          </div>

          <canvas
            ref={canvasRef}
            className={`absolute inset-0 h-full w-full touch-none transition-opacity duration-500 ${revealed ? 'pointer-events-none opacity-0' : 'cursor-crosshair'}`}
            onPointerDown={(e) => { scratching.current = true; erase(e.clientX, e.clientY) }}
            onPointerMove={(e) => scratching.current && erase(e.clientX, e.clientY)}
            onPointerUp={() => { scratching.current = false; checkRevealed() }}
            onPointerLeave={() => { scratching.current = false; checkRevealed() }}
            onClick={reveal}
          />
        </div>
      </div>

      {revealed && (
        <div className="mt-8 flex flex-col items-center gap-2 animate-[fadeSlideIn_0.4s_ease-out]">
          <div className="flex h-14 w-14 items-center justify-center rounded-full border-4 border-[#292524] text-xl font-bold text-[#292524]">
            {countdown}
          </div>
          <p className="text-sm text-[#78716C]">Indo para o checkout…</p>
        </div>
      )}
    </div>
  )
}
