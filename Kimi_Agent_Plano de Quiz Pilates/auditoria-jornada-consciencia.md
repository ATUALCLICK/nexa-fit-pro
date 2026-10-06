# Auditoria da Jornada — Níveis de Consciência × Retenção × CTA

**Funil auditado:** `pilates.json` (61 telas + checkout) · **Data:** 2026-07-28
**Objetivo:** mapear a jornada do primeiro clique ao CTA de compra, identificando o nível de consciência de cada etapa e os pontos de risco de abandono.

---

## 1. Framework — os 5 níveis de consciência aplicados ao funil

Adaptado de Schwartz (*Breakthrough Advertising*) para quiz funnels:

| Nível | Estado mental da usuária | O que a etapa precisa fazer |
|---|---|---|
| **N0 · Curiosa** | "Vi um anúncio, o que é isso?" | Compromisso mínimo (1 clique), promessa clara |
| **N1 · Consciente do problema** | "Quero emagrecer / minha postura dói" | Espelhar e nomear o problema; diagnóstico |
| **N2 · Consciente da solução** | "Sei que preciso mudar… mas como?" | Mostrar que Pilates é O mecanismo — e que cabe nela |
| **N3 · Consciente do produto** | "Esse plano parece ser pra mim" | Provar personalização, autoridade, resultados |
| **N4 · Pronta** | "Quero. Quanto custa?" | Remover fricção, urgência honesta, CTA |

**Regra de ouro do funil:** cada tela deve elevar a consciência *ou* aumentar o investimento (sunk cost). Tela que não faz nenhum dos dois é candidata a corte ou fundição.

---

## 2. Anatomia do fluxo (extraída do JSON)

- **61 telas:** 33 perguntas · 7 inputs · 21 recompensas (interstitial/result/loading/scratch)
- **7 telas condicionais** (rotas dinâmicas): i-adaptacao, i-jejum, i-mamae, q-liberacao, i-menopausa, event-date, i-alinhamento
- **3 streaks ≥5 sem recompensa:** 5 (perfil corporal) · **7 (avaliação física)** · 6–7 (nutrição, recompensa condicional)

---

## 3. Mapa da jornada por fase

### F0 · Entrada — N0 → N1 *(telas 1–2: age, social-proof)*
- **Função:** 1 clique = micro-compromisso; prova social ("98.000 mulheres na sua faixa") ancora relevância.
- **Gatilhos:** segmentação por idade imediata, logos de mídia, zero fricção.
- **Avaliação:** exemplar. Nenhuma mudança.

### F1 · Objetivo — N1 *(telas 3–6: experience, i-welcome, goal, i-goal)*
- **Função:** ela declara o objetivo; o funil devolve eco personalizado (@switch por goal).
- **Gatilhos:** alternância perfeita pergunta→recompensa (1:1), auto-advance 220ms.
- **Avaliação:** exemplar. O "sim, é pra mim" acontece aqui.

### F2 · Aprofundamento do problema — N1 → N2 *(telas 7–12: secondary-goals → i-diagnosis)*
- **Streak de 5** perguntas (corpo atual, corpo sonho, melhor forma, padrão de peso) antes do payoff.
- **Payoff:** i-diagnosis **nomeia o problema** (8 diagnósticos dinâmicos D0–D5/D1b/D2b) — o momento de virada de consciência mais importante do funil. Posicionado cedo (tela 12/61) = hook excelente.
- **Risco:** médio. As 5 perguntas são visualmente variadas (silhuetas) o que compensa o streak.

### F3 · Avaliação física — N2 *(telas 13–20: flexibility → i-activity)*
- **⚠️ Streak de 7 — o mais longo do funil.** Perguntas de auto-exposição (prancha, tocar os pés, equilíbrio, dores) exigem esforço imaginado e vulnerabilidade.
- **Payoff tardio:** i-activity ("Ótimo, entendido!") só chega na 7ª — e é genérica; a recompensa *real* (i-adaptacao com a dor dela) é condicional.
- **Risco de abandono: ALTO.** Zona mais frágil da primeira metade.

### F4 · Estilo de vida — N2 *(telas 21–25: work-routine → i-energy)*
- Streak de 3 + recompensa personalizada por energia (@switch). Saudável.
- **Risco:** baixo-médio. Perguntas "neutras" (trabalho, dia típico) têm baixo custo emocional.

### F5 · Nutrição — N2 → N3 *(telas 26–37: water → i-authority)*
- **⚠️ Streak de 6** (water→dinner) cuja recompensa (**i-jejum é condicional**) só existe para quem pula refeição. **Quem não pula faz streak efetivo de 7** até i-meal-preview.
- **Payoffs fortes:** i-meal-preview (refeições da dieta dela — valor tangível) e i-authority (credibilidade → N3). Bem posicionados, mas tardios.
- **Risco de abandono: ALTO** na primeira metade do bloco; excelente recuperação depois.

### F6 · Dados + Perfil — N3 *(telas 38–43: height → wellness-profile)*
- 4 inputs seguidos (fricção real), mas com feedback instantâneo (IMC, % da meta) que transforma input em recompensa.
- **Payoff máximo:** wellness-profile — a prova de personalização ("o plano me conhece"). Consolida N3.
- **Risco:** baixo. O consentimento de dados de saúde (height) é bem blindado por i-authority imediatamente antes.

### F7 · Emoção → Projeção — N3 → N4 *(telas 44–51: weight-triggers → projection)*
- **Melhor sequência do funil:** gatilhos emocionais → interstitials de persona (mamãe/menopausa) → evento/data → projeção de peso com data.
- projection ("60 kg até novembro") é o **maior propulsor ao CTA** do funil inteiro: transforma desejo em plano concreto.
- **Risco:** baixo. Rotas condicionais fazem cada usuária sentir que a tela é dela.

### F8 · Compromisso — N4 *(telas 52–56: main-reason → social-proof-2)*
- Sequência Cialdini: razão emocional declarada → confiança declarada (consistência) → prova (awards/variante cética) → loading com depoimentos → prova social.
- **Detalhe fino:** confidence ("quão confiante você está?") seguido de i-awards = a dúvida dela é respondida na tela seguinte. Variante cética cobre o pior caso.
- **Risco:** baixo. Redundância de prova social (repete a tela 2) é intencional: blinda o pedido que vem a seguir.

### F9 · Captura — N4, zona crítica *(telas 57–61: email → scratch)*
- **⚠️ O email é pedido ANTES de ver o plano pronto** — o ponto de maior fricção de valor do funil. O que blinda: loading-plan + social-proof-2 imediatamente antes + headline do email personalizada ({{goalLabel}}) + privacy note.
- plan-ready (nome em destaque + badges dinâmicas + meta) recompensa o investimento; scratch injeta dopamina final e o countdown de 4s empurra ao checkout.
- **Risco de abandono: ALTO no email** (inerente ao modelo BetterMe), baixo depois.

### F10 · Checkout — N4 → compra
- Headline por razão emocional, barras antes→depois, plano pré-selecionado por persona, countdown persistente, garantia (antecipada para céticas), FAQ dinâmico por dor/pós-parto, 2 blocos de planos, CTA fixo no header.
- **Risco:** baixo-médio. Sólido do início ao fim.

---

## 4. Scoreboard

Escala 0–10. **Retenção** = chance de seguir para a próxima tela · **Engajamento** = resposta emocional/personalização · **Propulsão** = quanto a fase empurra rumo ao CTA de compra.

| Fase | Telas | Consciência | Retenção | Engajamento | Propulsão | Risco |
|---|---|---|---|---|---|---|
| F0 Entrada | 1–2 | N0→N1 | **9,5** | 8,0 | 7,0 | 🟢 baixo |
| F1 Objetivo | 3–6 | N1 | **9,0** | 8,5 | 8,0 | 🟢 baixo |
| F2 Problema | 7–12 | N1→N2 | 7,5 | 8,0 | **8,5** | 🟡 médio |
| F3 Avaliação física | 13–20 | N2 | **5,5** | 6,0 | 7,0 | 🔴 **alto** |
| F4 Estilo de vida | 21–25 | N2 | 7,5 | 6,5 | 6,5 | 🟡 médio |
| F5 Nutrição | 26–37 | N2→N3 | **6,0** | 7,0 | 7,5 | 🔴 **alto** |
| F6 Dados + Perfil | 38–43 | N3 | 7,5 | 8,5 | 8,5 | 🟢 baixo |
| F7 Emoção→Projeção | 44–51 | N3→N4 | 8,5 | **9,0** | **9,5** | 🟢 baixo |
| F8 Compromisso | 52–56 | N4 | 8,5 | 8,0 | 9,0 | 🟢 baixo |
| F9 Captura | 57–61 | N4 | **6,5** | 8,0 | 8,5 | 🟠 email |
| F10 Checkout | — | N4→💰 | 7,5 | 8,5 | 9,0 | 🟡 médio |
| **Média** | | | **7,6** | **7,8** | **8,2** | |

**Leitura:** a máquina de conversão (F7–F10) é forte; o funil sangra no meio — F3 e F5, onde o investimento pedido é alto e a recompensa vem tarde ou é condicional. É lá que moram os pontos percentuais de conclusão.

---

## 5. Recomendações priorizadas

### P0 — ataca as duas zonas vermelhas

1. **Quebrar o streak de 7 da avaliação física (F3).** Inserir interstitial curta após `focus-zones` ecoando as zonas escolhidas (o token `{{foco}}` já existe, pronto para uso): *"Barriga e glúteos — as duas regiões que mais respondem ao Pilates. Vamos medir seu ponto de partida."* Transforma as perguntas seguintes (prancha, flexibilidade) em "medição com propósito".
2. **Recompensa incondicional após `dinner` (F5).** Hoje i-jejum é condicional → quem não pula refeição faz 7 seguidas. Converter i-jejum em interstitial de base para todos (*"Entendido — seu plano alimentar se adapta à sua rotina real"*) com a variante jejum como personalização (o mecanismo `variants` já suporta isso sem mexer na engine).
3. **Blindar o email (F9).** Sem mudar a ordem (modelo validado pelo original): adicionar ao loading-plan uma linha de estado *"Seu plano está 100% pronto"* e ao email uma micro-prova (mini-estrelas + "junte-se a 312 mil mulheres"). Medir antes de qualquer teste A/B de inversão (name → plan-ready → email).

### P1 — eleva engajamento nas zonas amarelas

4. **Celebração de seção no Chrome:** transição "Meu perfil ✓ → Atividade" ao cruzar seções — marco de progresso barato e frequente.
5. **i-activity ecoar `{{foco}}`** além da dor: *"sequências para barriga e glúteos que protegem sua lombar"*.
6. **Projection com o evento dela:** quando houver `eventDate`, ecoar no subheadline (*"…até o seu casamento"*). Os dados já existem; é só copy condicional.
7. **i-diagnosis → segunda dose:** repetir o nome do diagnóstico na wellness-profile (já acontece via cardLabel ✓) e no plan-ready (badge "Feito para Core Adormecido" — slot de badge já existe).

### P2 — polimento

8. Haptic feedback (vibrate 10ms) ao raspar no mobile; 9. Auto-advance também após selecionar data do evento; 10. Micro-copy de progresso nas seções longas ("pergunta 3 de 6" no subheadline).

---

## 6. Métricas para validar (eventos já instrumentados)

| Hipótese | Evento | Sinal esperado pós-fix |
|---|---|---|
| F3 abandona no streak de 7 | `screen_viewed` por tela | queda/tela em F3 passa de ~?% para <2% |
| F5 idem (sem jejum) | funil segmentado por `breakfast/lunch/dinner` | convergência jejum vs não-jejum |
| Email é o gargalo final | `screen_viewed` email → name | taxa de passagem sobe após blindagem |
| projection é o propulsor | tempo médio em projection vs média | manter como referência de "tela forte" |

**Próximo passo sugerido:** implementar P0.1 + P0.2 (ambas são *somente dados* no funnel.json — zero risco de engine) e medir.
