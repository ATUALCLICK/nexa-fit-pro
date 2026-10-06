import { Check } from 'lucide-react'

interface Props {
  label: string
  hint?: string
  icon?: string // slug thiings.co (3D) — servido de /icons/thiings/{slug}.png
  selected: boolean
  multi?: boolean
  onSelect: () => void
}

export default function OptionCard({ label, hint, icon, selected, multi, onSelect }: Props) {
  return (
    <button
      onClick={onSelect}
      className={`flex w-full items-center justify-between gap-3 rounded-xl border px-4 py-3.5 text-left transition-all duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#292524] focus-visible:ring-offset-2 ${
        selected
          ? 'border-[#292524] bg-[#F3EFE8]'
          : 'border-[#E7E2DA] bg-white hover:-translate-y-px hover:border-[#C9C2B6]'
      }`}
    >
      <span className="flex min-w-0 items-center gap-3.5">
        {icon && (
          <img
            src={`${import.meta.env.BASE_URL}icons/thiings/${icon}.png`}
            alt=""
            width={44}
            height={44}
            loading="lazy"
            className="h-11 w-11 shrink-0 object-contain"
          />
        )}
        <span>
          <span className="block text-[15px] font-medium text-[#1C1917]">{label}</span>
          {hint && <span className="mt-0.5 block text-xs text-[#78716C]">{hint}</span>}
        </span>
      </span>

      <span
        className={`flex h-6 w-6 shrink-0 items-center justify-center border transition-all ${
          multi ? 'rounded-md' : 'rounded-full'
        } ${selected ? 'border-[#292524] bg-[#292524]' : 'border-[#D6CFC4] bg-white'}`}
      >
        {selected && <Check className="h-4 w-4 text-white" strokeWidth={3} />}
      </span>
    </button>
  )
}
