import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Answers, AnswerValue } from './types'

interface QuizState {
  orderId: string
  funnelSlug: string
  answers: Answers
  scratched: boolean
  coupon: string
  setAnswer: (key: string, value: AnswerValue) => void
  setScratched: () => void
  setFunnel: (slug: string, coupon: string) => void
  reset: () => void
}

function uuid(): string {
  return crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`
}

export const useQuiz = create<QuizState>()(
  persist(
    (set) => ({
      orderId: uuid(),
      funnelSlug: '',
      answers: {},
      scratched: false,
      coupon: '',
      setAnswer: (key, value) =>
        set((st) => ({ answers: { ...st.answers, [key]: value } })),
      setScratched: () => set({ scratched: true }),
      setFunnel: (slug, coupon) =>
        set((st) =>
          st.funnelSlug === slug
            ? { coupon }
            : { funnelSlug: slug, coupon, orderId: uuid(), answers: {}, scratched: false },
        ),
      reset: () => set({ orderId: uuid(), answers: {}, scratched: false }),
    }),
    { name: 'viva-pilates-session' },
  ),
)
