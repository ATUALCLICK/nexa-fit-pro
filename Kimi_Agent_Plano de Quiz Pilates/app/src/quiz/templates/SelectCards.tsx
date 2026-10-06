import { ArrowRight, CircleHelp } from 'lucide-react'
import { createPortal } from 'react-dom'
import type { Option, Screen } from '../engine/types'
import { CONTENT, H1, SUB } from '../components/typography'

interface Props {
  screen: Screen
  onAnswer: (value: string) => void
}

const GRADIENTS = [
  'from-[#E8C4A8] to-[#D9A05B]',
  'from-[#C9D1BF] to-[#7D8F74]',
  'from-[#E5D3C3] to-[#B57E5B]',
  'from-[#D8D3CB] to-[#8A8278]',
]

/* T1 — cards grandes com imagem (tela de idade) */
export default function SelectCards({ screen, onAnswer }: Props) {
  const p = screen.payload ?? {}
  const options = (p.options as Option[]) ?? []

  return (
    <div className="mx-auto w-full max-w-5xl px-4 pb-10">
      <h1 className={H1}>{p.headline as string}</h1>
      <p className={SUB}>{p.subheadline as string}</p>

      <div className={`${CONTENT} grid grid-cols-2 gap-4 lg:grid-cols-4`}>
        {options.map((o, i) => (
          <button
            key={o.value}
            onClick={() => onAnswer(o.value)}
            className="group relative overflow-hidden rounded-2xl text-left transition-transform duration-150 hover:-translate-y-1 active:scale-[0.98]"
          >
            <div className={`relative aspect-[3/4] bg-gradient-to-br ${GRADIENTS[i % 4]}`}>
              <svg viewBox="0 0 200 260" className="absolute inset-0 h-full w-full opacity-90">
                <circle cx="100" cy="72" r="26" fill="#F5E0CC" />
                <path d="M100 100 C 62 108, 56 160, 62 260 L 138 260 C 144 160, 138 108, 100 100 Z" fill="#F5E0CC" />
                <path d="M62 260 C 70 210, 86 190, 100 190 C 114 190, 130 210, 138 260 Z" fill="#fff" opacity="0.55" />
              </svg>
              <div className="absolute inset-x-3 bottom-3 flex items-center justify-between rounded-full bg-[#292524] px-4 py-2.5">
                <span className="text-sm font-semibold text-white">{o.label}</span>
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white/15 transition group-hover:bg-white/30">
                  <ArrowRight className="h-4 w-4 text-white" />
                </span>
              </div>
            </div>
          </button>
        ))}
      </div>

      {Boolean(p.help) &&
        createPortal(
          <button className="fixed bottom-5 right-5 z-40 flex items-center gap-1.5 rounded-full bg-[#292524] px-4 py-2.5 text-xs font-semibold text-white shadow-lg">
            <CircleHelp className="h-4 w-4" /> Ajuda
          </button>,
          document.body,
        )}
    </div>
  )
}
