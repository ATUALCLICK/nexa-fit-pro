import { useState } from 'react'
import type { Answers, Option, OptionGroup, Screen } from '../engine/types'
import OptionCard from '../components/OptionCard'
import { Silhouette } from '../components/Artwork'
import { CONTENT, H1, KICKER_LEFT, NOTE, SHELL, SUB } from '../components/typography'

interface Props {
  screen: Screen
  answers: Answers
  onAnswer: (value: string) => void
}

/* T2 — escolha única com auto-advance (delay de 220ms no estado selected) */
export default function QuestionSingle({ screen, answers, onAnswer }: Props) {
  const p = screen.payload ?? {}
  const headline = (p.headline as string) ?? ''
  const sub = p.subheadline as string | undefined
  const note = p.note as string | undefined
  const layout = (p.layout as string | undefined) ?? 'list'
  const groups = p.groups as OptionGroup[] | undefined
  const options = p.options as Option[] | undefined
  const saved = screen.saveAs ? (answers[screen.saveAs] as string) : undefined

  const [picked, setPicked] = useState<string | undefined>(saved)

  const pick = (value: string) => {
    if (picked && picked !== saved) return // já avançando
    setPicked(value)
    setTimeout(() => onAnswer(value), 220)
  }

  const silhouetteW: Record<string, number> = {
    magra: 0.7, esguia: 0.72, media: 0.92, tonificada: 0.88, curvas: 1.05,
    grande: 1.15, acima: 1.35,
  }

  return (
    <div className={SHELL}>
      <div>
        <h1 className={H1}>{headline}</h1>
        {sub && <p className={SUB}>{sub}</p>}
        {note && <p className={NOTE}>{note}</p>}

        {layout === 'silhouette' && options ? (
          <div className={`${CONTENT} grid grid-cols-2 gap-3 md:grid-cols-4`}>
            {options.map((o) => (
              <button
                key={o.value}
                onClick={() => pick(o.value)}
                className={`rounded-xl border bg-white px-3 pb-3 pt-4 transition-all duration-150 ${
                  picked === o.value
                    ? 'border-[#292524] bg-[#F3EFE8]'
                    : 'border-[#E7E2DA] hover:-translate-y-px hover:border-[#C9C2B6]'
                }`}
              >
                <Silhouette width={silhouetteW[o.value] ?? 0.95} />
                <span className="mt-2 block text-center text-[13px] font-medium leading-tight text-[#1C1917]">
                  {o.label}
                </span>
              </button>
            ))}
          </div>
        ) : layout === 'grouped' && groups ? (
          <div className={`${CONTENT} space-y-6`}>
            {groups.map((g) => (
              <div key={g.title}>
                <p className={`mb-2 ${KICKER_LEFT}`}>
                  {g.title}
                </p>
                <div className="space-y-2">
                  {g.options.map((o) => (
                    <OptionCard
                      key={o.value}
                      label={o.label}
                      hint={o.hint}
                      icon={o.icon}
                      selected={picked === o.value}
                      onSelect={() => pick(o.value)}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className={`${CONTENT} space-y-3`}>
            {(options ?? []).map((o) => (
              <OptionCard
                key={o.value}
                label={o.label}
                hint={o.hint}
                icon={o.icon}
                selected={picked === o.value}
                onSelect={() => pick(o.value)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
