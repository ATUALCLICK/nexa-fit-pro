interface Props {
  icon: string // slug thiings.co — servido de /icons/thiings/{slug}.png
}

/*
 * Herói visual padronizado dos ecos (interstitials sem grid de conteúdo).
 *
 * Antes: figuras line-art (stick figures) visíveis só em xl+ — no mobile o eco
 * era uma parede de texto, e no desktop a linguagem line-art colidia com os
 * ícones 3D das etapas. Agora: mesmo sistema thiings 3D das opções, em escala
 * hero, com halo creme que ecoa o círculo das antigas ilustrações.
 *
 * Regra da camada visual dos ecos: exatamente UMA — heroIcon OU grid de
 * conteúdo (meals/authority/awards/logos), nunca os dois, nunca nenhum.
 */
export default function EchoHero({ icon }: Props) {
  return (
    <div className="relative mx-auto mb-6 flex h-[120px] w-[120px] items-center justify-center animate-[fadeSlideIn_0.4s_ease-out] md:h-[136px] md:w-[136px]">
      <span className="absolute inset-0 rounded-full bg-[#F3EFE8]" />
      <img
        src={`${import.meta.env.BASE_URL}icons/thiings/${icon}.png`}
        alt=""
        width={88}
        height={88}
        loading="lazy"
        className="relative h-[88px] w-[88px] object-contain md:h-24 md:w-24"
      />
    </div>
  )
}
