import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { parseFunnel, type Funnel } from './schema'
import { buildRuntime, type FunnelRuntime } from './runtime'
import { useQuiz } from '../quiz/engine/store'
import pilatesSeed from '../funnels/pilates.json'

/*
 * FunnelLoader — multi-tenant:
 *   sem param        → funil default (seed pilates, bundled, zero latência)
 *   ?f={slug}        → fetch /funnels/{slug}.json
 *   ?f=draft         → JSON da memória (localStorage 'funnel:draft') — preview do gerador
 */

const DEFAULT_SLUG = 'pilates'
const seedFunnel = parseFunnel(pilatesSeed)

export function getFunnelSlug(): string {
  const fromSearch = new URLSearchParams(window.location.search).get('f')
  if (fromSearch) return fromSearch
  const hashQuery = window.location.hash.split('?')[1]
  if (hashQuery) {
    const fromHash = new URLSearchParams(hashQuery).get('f')
    if (fromHash) return fromHash
  }
  return DEFAULT_SLUG
}

async function fetchFunnel(slug: string): Promise<Funnel> {
  if (slug === DEFAULT_SLUG) return seedFunnel
  if (slug === 'draft') {
    const raw = localStorage.getItem('funnel:draft')
    if (!raw) throw new Error('Nenhum rascunho em funnel:draft')
    return parseFunnel(JSON.parse(raw))
  }
  const r = await fetch(`/funnels/${encodeURIComponent(slug)}.json`)
  if (!r.ok) throw new Error(`Funil "${slug}" não encontrado (${r.status})`)
  return parseFunnel(await r.json())
}

interface FunnelState {
  status: 'loading' | 'ready' | 'error'
  runtime: FunnelRuntime | null
  error: string | null
}

const FunnelCtx = createContext<FunnelState>({ status: 'loading', runtime: null, error: null })

export function FunnelProvider({ children }: { children: ReactNode }) {
  const slug = useMemo(getFunnelSlug, [])
  const [state, setState] = useState<FunnelState>(() => {
    if (slug === DEFAULT_SLUG) {
      return { status: 'ready', runtime: buildRuntime(seedFunnel), error: null }
    }
    return { status: 'loading', runtime: null, error: null }
  })

  /* invariante sessão × funil: slug mudou ⇒ sessão resetada + cupom aplicado.
     * Vive AQUI e só aqui — páginas não precisam saber que ela existe. */
  useEffect(() => {
    if (state.runtime) {
      useQuiz.getState().setFunnel(state.runtime.funnel.meta.slug, state.runtime.funnel.meta.coupon)
    }
  }, [state.runtime])

  useEffect(() => {
    if (slug === DEFAULT_SLUG) return
    let alive = true
    fetchFunnel(slug)
      .then((funnel) => {
        if (alive) setState({ status: 'ready', runtime: buildRuntime(funnel), error: null })
      })
      .catch((e: Error) => {
        console.warn(`[funnel] ${e.message} — carregando pilates default`)
        if (alive) setState({ status: 'ready', runtime: buildRuntime(seedFunnel), error: e.message })
      })
    return () => { alive = false }
  }, [slug])

  if (state.status === 'loading') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#FAF7F2]">
        <p className="text-sm font-medium text-[#78716C]">Carregando seu plano…</p>
      </div>
    )
  }

  return <FunnelCtx.Provider value={state}>{children}</FunnelCtx.Provider>
}

export function useFunnel(): FunnelRuntime {
  const { runtime } = useContext(FunnelCtx)
  if (!runtime) throw new Error('useFunnel fora do FunnelProvider')
  return runtime
}
