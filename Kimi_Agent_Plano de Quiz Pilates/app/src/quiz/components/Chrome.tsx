import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ArrowLeft, Check } from 'lucide-react'
import { SECTION_LABELS, type SectionId } from '../engine/types'

interface Props {
  section: SectionId
  progress: number // 0-100
  onBack?: () => void
  minimal?: boolean // loadings: sem voltar/menu
}

/* ordem das seções — celebração só dispara em avanço, nunca ao voltar */
const SECTION_ORDER: SectionId[] = ['none', 'meu-perfil', 'atividade', 'estilo-de-vida', 'nutricao', 'quase-la']

export default function Chrome({ section, progress, onBack, minimal }: Props) {
  const prevRef = useRef<SectionId>(section)
  const [celebrating, setCelebrating] = useState<SectionId | null>(null)

  useEffect(() => {
    const prev = prevRef.current
    const advanced = SECTION_ORDER.indexOf(section) > SECTION_ORDER.indexOf(prev)
    if (prev !== section && advanced && prev !== 'none') {
      setCelebrating(prev)
      const t = setTimeout(() => setCelebrating(null), 1100)
      prevRef.current = section
      return () => clearTimeout(t)
    }
    prevRef.current = section
  }, [section])

  return (
    <header className="sticky top-0 z-40 bg-[#FAF7F2]/95 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-5xl items-center px-4">
        {!minimal && onBack ? (
          <button
            onClick={onBack}
            aria-label="Voltar"
            className="rounded-full p-2 text-[#292524] transition hover:bg-[#F3EFE8]"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
        ) : (
          <span className="w-9" />
        )}

        <div className="flex-1 text-center">
          <AnimatePresence mode="wait" initial={false}>
            {celebrating ? (
              <motion.span
                key={`done-${celebrating}`}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.18 }}
                className="inline-flex items-center gap-1 text-sm font-semibold text-[#4A7C59]"
              >
                {SECTION_LABELS[celebrating]} <Check className="h-4 w-4" strokeWidth={3} />
              </motion.span>
            ) : (
              <motion.span
                key={section}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.18 }}
                className="text-sm font-medium text-[#57534E]"
              >
                {SECTION_LABELS[section]}
              </motion.span>
            )}
          </AnimatePresence>
        </div>

        <span className="w-9" />
      </div>

      {/* barra de progresso fina */}
      <div className="h-[3px] w-full bg-[#E7E2DA]">
        <div
          className="h-full bg-[#292524] transition-[width] duration-300 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>
    </header>
  )
}
