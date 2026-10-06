/* Camada de analytics — Fase 1: console + dataLayer. Fase 2: plugar provider real. */

declare global {
  interface Window {
    dataLayer?: Record<string, unknown>[]
  }
}

export function track(event: string, payload: Record<string, unknown> = {}) {
  const entry = { event, ...payload, ts: Date.now() }
  if (typeof window !== 'undefined') {
    window.dataLayer = window.dataLayer || []
    window.dataLayer.push(entry)
  }
  // eslint-disable-next-line no-console
  console.log('[analytics]', entry)
}
