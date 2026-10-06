import { useState } from 'react'
import type { Answers, Option, Screen } from '../engine/types'
import OptionCard from '../components/OptionCard'
import CTAButton from '../components/CTAButton'
import { CONTENT, FOOTNOTE, H1, SHELL, SHELL_WITH_CTA, SUB } from '../components/typography'

interface Props {
  screen: Screen
  answers: Answers
  onAnswer: (value: string[]) => void
}

/* T3 — múltipla escolha, "Próximo passo" condicional, opção exclusiva */
export default function QuestionMulti({ screen, answers, onAnswer }: Props) {
  const p = screen.payload ?? {}
  const headline = (p.headline as string) ?? ''
  const sub = p.subheadline as string | undefined
  const footnote = p.footnote as string | undefined
  const options = (p.options as Option[]) ?? []
  const saved = screen.saveAs ? (answers[screen.saveAs] as string[] | undefined) : undefined

  const [selected, setSelected] = useState<string[]>(saved ?? [])

  const toggle = (o: Option) => {
    setSelected((prev) => {
      const has = prev.includes(o.value)
      if (o.exclusive) return has ? [] : [o.value]
      const withoutExclusive = prev.filter(
        (v) => !options.find((x) => x.value === v)?.exclusive,
      )
      return has
        ? withoutExclusive.filter((v) => v !== o.value)
        : [...withoutExclusive, o.value]
    })
  }

  return (
    <div className={`${SHELL} ${SHELL_WITH_CTA}`}>
      <h1 className={H1}>{headline}</h1>
      {sub && <p className={SUB}>{sub}</p>}

      <div className={`${CONTENT} space-y-3`}>
        {options.map((o) => (
          <OptionCard
            key={o.value}
            label={o.label}
            hint={o.hint}
            icon={o.icon}
            multi
            selected={selected.includes(o.value)}
            onSelect={() => toggle(o)}
          />
        ))}
      </div>

      {footnote && <p className={FOOTNOTE}>{footnote}</p>}

      <CTAButton
        label="PRÓXIMO PASSO"
        disabled={selected.length === 0}
        onClick={() => onAnswer(selected)}
      />
    </div>
  )
}
