# Design — Medidor de plano evolutivo nos ecos (PlanMeter)

Data: 2026-08-02 · Processo: superpowers/brainstorming · Status: aprovado pelo usuário

## Contexto e objetivo

Os ecos (interstitials) do funil Viva Pilates já têm anatomia padronizada
(`EchoHero` → H1 → SUB → conteúdo → `ProofBlock` → CTA) e prova social reativa
que valida a resposta anterior. Falta um incentivo visual de **momentum**: a
sensação concreta de avanço acumulado ("meu plano está sendo montado") que reduz
o abandono entre as 62 telas.

**Objetivo principal (decisão 1):** momentum — reduzir drop-off entre etapas.
Não é celebração por si só, nem personalização, nem aquecimento de venda.

**Mecanismos aprovados (decisão 2):** medidor de plano evolutivo + celebração
animada apenas nos marcos de bloco.

## Decisões tomadas no brainstorm

| # | Pergunta | Decisão |
|---|----------|---------|
| 1 | Objetivo | Momentum / reduzir abandono |
| 2 | Mecanismos | Medidor evolutivo + celebração em marcos |
| 3 | Posição | Card acima do CTA, em todos os ecos |
| 4 | Cálculo do % | Blocos temáticos + progresso parcial no bloco atual |
| 5 | Intensidade da celebração | Duas camadas: conta-up sempre; burst + selo só nos marcos |
| 6 | Formato visual | Variante A — anel de progresso (mockups em `public/mockups/eco-medidor.html`) |

## Design

### §1 — Componente `PlanMeter`

Novo: `src/quiz/components/PlanMeter.tsx`.

- Anel SVG 64×64 (raio 27, stroke 6): track `#F3EFE8`, fill `#B57E5B`,
  `stroke-linecap: round`, preenchimento animado 1,2s
  `cubic-bezier(.22,1,.36,1)` a cada entrada no eco.
- % no centro do anel (16px, peso 800, `#1C1917`) com **conta-up** do valor
  anterior para o novo (1,2s, ease-out cúbico).
- Coluna ao lado: kicker "SEU PLANO" (token KICKER_LEFT), "X% montado"
  (14,5px semibold), "Bloco N de 5 · Nome" (12,5px `#78716C`).
- 5 mini-segmentos (4px, `rounded-full`): completo `#B57E5B`, atual com
  preenchimento parcial, futuro `#F3EFE8`.
- Card: `rounded-2xl border border-[#E7E2DA] bg-white p-5`, entrada com
  `fadeSlideIn 0.4s ease-out` (mesma animação do ProofBlock).
- Sem dependências novas: SVG + CSS + requestAnimationFrame.

### §2 — Estado de marco (milestone)

Quando `meter.milestone` está presente:

- Card: gradiente dourado suave (`#FDF9F4` → `#FBF3EA`), borda `#DED2C4`.
- Anel dourado `#D9A05B` com `drop-shadow` pulsante (1,8s).
- Selo verde-sálvia `#7D8F74`: "✓ Bloco {nome} completo" (chip 12px).
- 4–6 partículas CSS (`@keyframes drift`, 2,8s) nas cores da marca
  (dourado/terracota/sálvia), posicionadas no canto do card.
- Ocorre exatamente 5 vezes no funil (uma por bloco).

### §3 — Anatomia do eco

`herói → H1 → SUB → conteúdo → proof → PlanMeter → CTA`

O medidor é elemento de **dados** (mesma categoria do ProofBlock), não
decoração: a regra de uma camada visual por eco (herói OU grid) permanece.
Presente nos 16 ecos; nos 7 sem proof, aparece na mesma posição relativa.

### §4 — Blocos e percentuais

| Bloco | Telas (índices) | Eco-marco | % no marco |
|-------|-----------------|-----------|------------|
| 1 · Começo | 0–5 | i-goal | 15% |
| 2 · Seu corpo | 6–20 | i-activity | 35% |
| 3 · Sua rotina | 21–32 | i-jejum | 55% |
| 4 · Alimentação | 33–43 | i-authority | 75% |
| 5 · Seu plano | 44–61 | social-proof-2 | 95% |

Ecos intermediários crescem dentro do bloco (valores definidos na
implementação, monotônicos entre ecos consecutivos).

**Regra dos 100%:** o medidor nunca mostra 100% durante o quiz — o 100% é a
tela `plan-ready`, que se torna a recompensa final da metáfora.

### §5 — Modelo de dados (declarativo)

Cada eco em `src/funnels/pilates.json` (+ cópia em `public/funnels/`):

```json
"meter": {
  "pct": 28,
  "block": 2,
  "blockName": "Seu corpo",
  "milestone": "Bloco Seu corpo completo"   // opcional, só no eco-marco
}
```

Sem lógica de cálculo no engine — segue o precedente de `proof` e `heroIcon`
(tudo declarativo, amigável ao gerador de funis). Schema zod em
`src/funnel/schema.ts` + tipo em `src/quiz/engine/types.ts`.

### §6 — Validação (copy-qa estendido)

Novo bloco de validação em `scripts/copy-qa.ts`:

1. Todo eco (template interstitial) tem `meter`.
2. `pct` inteiro 1–99, monotônico crescente na ordem da jornada.
3. `block` ∈ 1–5, consistente com a faixa de telas da §4.
4. `milestone` presente exatamente nos 5 ecos-marco (i-goal, i-activity,
   i-jejum, i-authority, social-proof-2) e em nenhum outro.
5. % nos marcos = 15/35/55/75/95.

### §7 — Verificação visual

Playwright 390×844 em 3 ecos representativos: eco comum com proof
(i-foco), eco-marco (i-goal), eco sem proof (i-adaptacao). Seed zustand
com `funnelSlug:'pilates'`. Build com loop de integridade
(assets=2, icons=100, funnels=1) antes de salvar versão.

## Fora de escopo

- Selos colecionáveis / trilha de blocos completa (variante C) — descartados
  no brainstorm; o estado de marco preserva só o selo efêmero.
- Artefato que se transforma (silhueta evolutiva) — backlog futuro.
- Medidor em telas que não são ecos (perguntas, loading, result, checkout).
