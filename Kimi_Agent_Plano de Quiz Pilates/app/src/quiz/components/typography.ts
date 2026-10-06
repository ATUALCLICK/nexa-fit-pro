/*
 * Sistema tipográfico e espacial canônico do funil — UMA escala para todas as telas.
 *
 * Antes da padronização havia 5 escalas de H1 (24/26/28/30/32, bold vs semibold),
 * duas subs (14px #78716C vs 15px #57534E) e ritmos de conteúdo aleatórios.
 * Qualquer headline/sub fora destes tokens é regressão de padronização.
 *
 * Anatomia canônica de tela (topo → base):
 *   [KICKER]  etiqueta opcional (eyebrow)
 *   [herói]   EchoHero nos ecos sem grid de conteúdo (ver EchoHero.tsx)
 *   H1        sempre o mesmo token, todas as telas
 *   SUB       apoio opcional, um único token
 *   NOTE      ressalva itálica opcional
 *   conteúdo  slot principal, sempre CONTENT (mt-8) abaixo da cabeça
 *   FOOTNOTE  fecho opcional
 *   CTA       CTAButton (largura da coluna) — exige SHELL_WITH_CTA no shell
 */

export const H1 =
  'text-center text-[27px] font-semibold leading-[1.18] tracking-[-0.01em] text-[#1C1917] md:text-[32px]'

export const SUB = 'mt-3 text-center text-[15px] leading-relaxed text-[#57534E]'

export const NOTE = 'mt-2 text-center text-xs italic text-[#A8A29E]'

export const FOOTNOTE = 'mt-4 text-center text-xs text-[#A8A29E]'

export const KICKER =
  'text-center text-[11px] font-semibold uppercase tracking-[0.18em] text-[#A8A29E]'

/* variante esquerda do kicker — títulos de grupo dentro de listas */
export const KICKER_LEFT =
  'text-[11px] font-semibold uppercase tracking-[0.18em] text-[#A8A29E]'

export const SECTION_H2 = 'text-2xl font-semibold tracking-[-0.01em] text-[#1C1917]'

/* coluna de conteúdo do quiz — uma única largura, todos os templates */
export const SHELL = 'relative mx-auto w-full max-w-[560px] px-4'

/* respiro inferior obrigatório quando a tela tem CTAButton fixo */
export const SHELL_WITH_CTA = 'pb-36'

/* distância padrão cabeça → conteúdo */
export const CONTENT = 'mt-8'
