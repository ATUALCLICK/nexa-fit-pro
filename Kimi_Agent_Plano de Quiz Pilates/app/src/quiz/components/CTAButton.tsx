import { createPortal } from 'react-dom'

interface Props {
  label: string
  onClick: () => void
  disabled?: boolean
}

/*
 * CTA pill escuro fixo na base, com fade do fundo.
 * Renderizado via portal no document.body: assim o position:fixed é SEMPRE
 * relativo à viewport — ancestrais com transform (transições das telas)
 * jamais deslocam o botão de lugar.
 */
export default function CTAButton({ label, onClick, disabled }: Props) {
  return createPortal(
    <div className="fixed inset-x-0 bottom-0 z-40 bg-gradient-to-t from-[#FAF7F2] via-[#FAF7F2]/95 to-transparent pt-10 [padding-bottom:max(1.5rem,env(safe-area-inset-bottom))]">
      <div className="mx-auto w-full max-w-[560px] px-4">
        <button
          onClick={onClick}
          disabled={disabled}
          className={`h-[52px] w-full rounded-full text-sm font-semibold tracking-wide transition-all duration-200 ${
            disabled
              ? 'cursor-not-allowed bg-[#B9B2A8] text-white'
              : 'bg-[#292524] text-white hover:bg-[#1C1917] active:scale-[0.99]'
          }`}
        >
          {label}
        </button>
      </div>
    </div>,
    document.body,
  )
}
