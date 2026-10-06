/*
 * Silhueta de biotipo (telas body-type/dream-body).
 *
 * Único resquício do antigo sistema line-art: as figuras decorativas
 * (stick figures) foram removidas na padronização — a linguagem visual
 * do funil é thiings 3D (opções + heróis dos ecos). A silhueta fica
 * porque é visualização funcional de dados (largura = biotipo), não
 * decoração.
 */

const INK = '#292524'
const SKIN = '#E8C4A8'

/* Silhueta de biotipo para as telas 8–9 (variações de largura) */
export function Silhouette({ width }: { width: number }) {
  const w = width // 0.7 magra → 1.3 acima
  return (
    <svg viewBox="0 0 80 140" className="mx-auto h-24 w-auto">
      <ellipse cx="40" cy="18" rx="10" ry="11" fill={SKIN} stroke={INK} strokeWidth="2" />
      <path
        d={`M40 30
            C ${40 - 16 * w} 34, ${40 - 15 * w} 50, ${40 - 13 * w} 62
            C ${40 - 15 * w} 76, ${40 - 12 * w} 88, ${40 - 11 * w} 100
            L ${40 - 9 * w} 132 L ${40 - 3 * w} 132 L 40 104
            L ${40 + 3 * w} 132 L ${40 + 9 * w} 132 L ${40 + 11 * w} 100
            C ${40 + 12 * w} 88, ${40 + 15 * w} 76, ${40 + 13 * w} 62
            C ${40 + 15 * w} 50, ${40 + 16 * w} 34, 40 30 Z`}
        fill="#F3EFE8"
        stroke={INK}
        strokeWidth="2"
      />
      <path d={`M${40 - 13 * w} 40 L${40 - 22 * w} 66 M${40 + 13 * w} 40 L${40 + 22 * w} 66`} stroke={INK} strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}
