import { X, Flame, CreditCard, Smartphone } from 'lucide-react'
import type { PlanJson as Plan } from '../funnel/schema'
import { track } from '../quiz/engine/analytics'
import { useQuiz } from '../quiz/engine/store'

interface Props {
  plan: Plan
  open: boolean
  onClose: () => void
}

const BRL = (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })

export default function PaymentModal({ plan, open, onClose }: Props) {
  const coupon = useQuiz((s) => s.coupon)
  if (!open) return null
  const savings = plan.regular - plan.price

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 md:items-center" onClick={onClose}>
      <div
        className="w-full max-w-md rounded-t-3xl bg-white p-6 md:rounded-3xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-[#1C1917]">Complete seu checkout</h2>
          <button onClick={onClose} className="rounded-full p-1.5 hover:bg-[#F3EFE8]">
            <X className="h-5 w-5 text-[#78716C]" />
          </button>
        </div>

        {/* resumo do pedido */}
        <div className="mt-5 space-y-2 rounded-2xl border border-[#E7E2DA] p-4 text-sm">
          <div className="flex justify-between text-[#57534E]">
            <span>Preço regular — {plan.name}</span>
            <span className="line-through">{BRL(plan.regular)}</span>
          </div>
          <div className="flex justify-between font-medium text-[#7D8F74]">
            <span>Desconto de {plan.discountPct}%</span>
            <span>−{BRL(savings)}</span>
          </div>
          <div className="flex justify-between text-[#57534E]">
            <span>Código aplicado</span>
            <span className="font-mono text-xs font-semibold">{coupon}</span>
          </div>
          <div className="flex justify-between border-t border-[#E7E2DA] pt-2 text-base font-semibold text-[#1C1917]">
            <span>Total:</span>
            <span>{BRL(plan.price)}</span>
          </div>
        </div>

        <div className="mt-3 flex items-center gap-2 rounded-xl bg-[#D9A05B]/10 px-4 py-3 text-sm font-medium text-[#8A5A1E]">
          <Flame className="h-4 w-4" />
          Você economiza {BRL(savings)} ({plan.discountPct}% OFF)
        </div>

        {/* pagamento expresso */}
        <div className="mt-5 space-y-2">
          <button
            onClick={() => track('purchase_completed', { plan: plan.id, value: plan.price, coupon, method: 'wallet' })}
            className="flex h-12 w-full items-center justify-center gap-2 rounded-full bg-[#292524] text-sm font-semibold text-white transition hover:bg-[#1C1917]"
          >
            <Smartphone className="h-4 w-4" /> Pagar com carteira digital
          </button>
          <div className="flex items-center gap-3 py-1">
            <span className="h-px flex-1 bg-[#E7E2DA]" />
            <span className="text-xs text-[#A8A29E]">ou pague com cartão</span>
            <span className="h-px flex-1 bg-[#E7E2DA]" />
          </div>
          <button
            onClick={() => track('purchase_completed', { plan: plan.id, value: plan.price, coupon, method: 'card' })}
            className="flex h-12 w-full items-center justify-center gap-2 rounded-full border border-[#292524] text-sm font-semibold text-[#292524] transition hover:bg-[#F3EFE8]"
          >
            <CreditCard className="h-4 w-4" /> Cartão de crédito ou Pix
          </button>
        </div>

        <p className="mt-4 text-center text-[11px] leading-snug text-[#A8A29E]">
          Pagamento seguro com criptografia SSL. Renovação automática — cancele quando quiser.
        </p>
      </div>
    </div>
  )
}
