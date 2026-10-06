# Oportunidades — Otimização Visual & Engajamento
### Audit do funil implementado (v0bcde3f) com evidência de screenshots

> ⚠️ DEGRADED: single-context (sem sub-agentes nesta sessão) — Assessment A (design review) feito inline com evidência de browser; Assessment B (detector) rodou limpo, zero findings.
> **Modo:** Persuade — o design É o produto; cada tela vende a próxima.

**Veredito de especificidade:** o funil está funcionalmente fiel e limpo, mas visualmente **"estéril"** — poderia ser o quiz de qualquer produto. O original BetterMe ganha por fotografia vibrante, presença de marca e micro-celebrações constantes. Nosso gap não é código: é **temperatura emocional**.

---

## 1. ACHADOS VISUAIS (com evidência)

| # | Tela | Achado | Severidade |
|---|---|---|---|
| V1 | Entrada (age) | Cards "fantasma": silhueta quase invisível no gradiente (contraste ~1.1:1), muito espaço morto vertical, headline cinza fraco, **sem logo** — a porta de entrada não tem punch nem prova social | 🔴 Alta |
| V2 | Global | **Tipografia genérica** (system-ui). A spec pedia serifada leve para headlines de resultado + sans humanista. Hoje tudo é a mesma fonte — sem hierarquia de voz | 🔴 Alta |
| V3 | Global | **Paleta sub-utilizada:** terracota/sálvia só aparecem em ícones. CTA preto puro, sem calor. O funil é 95% bege/cinza | 🟡 Média |
| V4 | Perguntas | Opções texto-puro com radio discreto; zero apoio visual (ícone/ilustração) — cognitivamente correto, emocionalmente frio | 🟡 Média |
| V5 | Wellness profile | Bubble "O Seu – 25,7" **sobrepõe o título** do card; falta a imagem do "corpo atual" (estava na spec); escala funciona | 🟡 Média |
| V6 | Raspadinha | Overlay cinza chapado, sem textura metálica/brilho de raspadinha real; revelação sem celebração | 🟡 Média |
| V7 | Checkout | Sólido, mas hero antes/depois é estático e o CTA some ao rolar (mobile) | 🟢 Baixa |

---

## 2. OPORTUNIDADES VISUAIS (quick wins → big swings)

### ⚡ Quick wins (1 dia, alto retorno)

**W1 — Tipografia com voz (V2):** duas fontes do Google Fonts, self-hosted:
- Headlines: **Fraunces** (serifada contemporânea, "wellness premium") — peso 500–600
- Corpo/UI: **Outfit** (humanista, ótima em tamanhos pequenos)
- Regra: serifada só em headlines de interstitials/resultados/checkout; sans em perguntas e opções

**W2 — Entrada com punch (V1):**
- Cards com gradiente mais saturado + silhueta com contraste real (ou fotos geradas por faixa etária — temos o plugin de geração)
- Headline escuro (#1C1917), sub com tracking wide; adicionar wordmark "Viva Pilates" no header de todas as telas
- Linha de prova social sob o título: "★ 4.8 · 312.000 mulheres já começaram"

**W3 — Aquecer a paleta (V3):**
- CTA: preto → **terracota profundo `#A96F4B`** (ou manter preto e terracota só no hover — testar)
- Radios/checks selecionados: preto → sálvia profundo `#5F7057` (cor de "saúde")
- Barra de progresso: preto → gradiente terracota→sálvia (a barra "floresce" conforme avança)

**W4 — Ícones nas opções (V4):** cada opção ganha um ícone Lucide à esquerda (Perder peso → TrendingDown, Postura → PersonStanding, Sono → Moon, Água → Droplets…). Custo: mapear ~120 opções; ganho: escaneabilidade e calor imediatos.

**W5 — Fix wellness profile (V5):** bubble do IMC acima do card (não sobre o título); adicionar a ilustração "corpo atual" (silhueta por biotipo, já temos o componente Silhouette).

### 🎯 Big swings (2–3 dias cada)

**S1 — Direção de arte fotográfica:** gerar 12–16 imagens reais (IA) no estilo editorial wellness — fundo creme, luz suave, modelos por faixa etária e biotipo, poses de pilates. Substituir os SVGs line-art. É o maior salto de percepção de valor disponível.

**S2 — Antes/depois interativo no checkout:** slider arrastável sobre o hero (hoje são dois cards estáticos). Com as imagens geradas por `dreamBody`, vira a peça mais persuasiva da página.

**S3 — Raspadinha "de verdade":** overlay com gradiente metálico + textura noise + brilho especular que segue o dedo; partículas ao raspar; **confetti + pulso** ao revelar; o cupom "treme" levemente chamando o gesto.

**S4 — Header vivo:** wordmark + progresso com estimativa ("~2 min restantes") + dots de seção (5 marcos) — transforma a barra muda em senso de jornada.

---

## 3. OPORTUNIDADES DE ENGAJAMENTO

### E1 — Micro-celebrações constantes (maior alavanca)
- **Seleção:** check "pop" com spring (scale 0.8→1.15→1) + flash sálvia no card
- **Fim de seção:** mini-interstitial de 1,2s com check animado + "Seção Meu Perfil completa!" (não bloqueante)
- **Marcos de progresso:** aos 50% e 75%, o header pulsa e mostra "Metade do caminho! 🎉" → "Quase lá, {faltam 6 perguntas}"

### E2 — "Plano sendo montado" visível
Chips acumulativos discretos no topo (desktop lateral / mobile abaixo do header): `🎯 Perder peso · 🍑 Barriga · 🦵 Lombar`. Cada resposta vira um chip — a sensação literal de personalização ao vivo. É o complemento visual das rotas dinâmicas já implementadas.

### E3 — Count-up nos números sociais
"312.000 mulheres" e o IMC/contadores animam de 0 até o valor (1s, ease-out) nos loadings e telas de resultado. Números estáticos não impressionam; números subindo sim.

### E4 — Retomada inteligente
A sessão já persiste em localStorage — mas ninguém sabe disso. Ao voltar: banner "👋 Que bom te ver de novo! **Continue de onde parou**" com botão "Retomar" vs "Recomeçar". Reduz abandono de retorno a zero custo.

### E5 — Idle nudge
15s sem interação numa pergunta → micro-toast na base: "Quase lá — seu plano personalizado está a poucas perguntas". Sem modal, sem bloqueio.

### E6 — Loading com narrativa
Hoje as barras enchem em silêncio. Adicionar frases rotativas sob o círculo: "Calculando seu IMC…" → "Cruzando 32 respostas…" → "Selecionando seus exercícios…" → "Ajustando para a sua lombar…" (usa a persona!). O loading teatral vira loading **personalizado** — sinergia direta com a Profile Engine.

### E7 — Haptics mobile
`navigator.vibrate(8)` na seleção, `vibrate([12,40,12])` na revelação da raspadinha. Feedback físico = retenção em mobile.

### E8 — Prova social viva no checkout (com moderação)
Toast discreto a cada ~25s: "**Mariana de São Paulo** começou o plano dela há 12 minutos". Máximo 3 por sessão, pausado quando o modal abre. Padrão da categoria, eficaz — mas manter elegante (nada de popup agressivo).

### E9 — Sticky CTA no checkout mobile
Ao rolar 40% da página: barra fixa inferior com preço/dia do plano selecionado + "QUERO MEU PLANO". O CTA nunca some (o original mantém o header, mas mobile pede reforço).

### E10 — Confetti programado
3 momentos apenas (não banalizar): revelação da raspadinha, "plano pronto" (53) e após seleção do plano no checkout. Canvas-confetti, cores da paleta (terracota/sálvia/areia — nunca arco-íris).

---

## 4. MATRIZ DE PRIORIZAÇÃO

| Item | Impacto | Esforço | Ordem |
|---|---|---|---|
| W1 Tipografia | 🔺 Alto | 2h | **1** |
| W2 Entrada com punch | 🔺 Alto | 4h | **2** |
| E1 Micro-celebrações | 🔺 Alto | 4h | **3** |
| W4 Ícones nas opções | 🔺 Alto | 3h | **4** |
| E6 Loading narrativo | 🔺 Alto (usa personas) | 2h | **5** |
| W3 Paleta quente | Médio | 2h | **6** |
| W5 Fix profile | Médio | 1h | **7** |
| E3 Count-up | Médio | 1h | **8** |
| E4 Retomada | Médio | 2h | **9** |
| E9 Sticky CTA | Médio | 1h | **10** |
| S3 Raspadinha real | Médio-alto | 1d | **11** |
| E2 Chips de plano | Médio-alto | 4h | **12** |
| S1 Fotografia IA | 🔺 Altíssimo | 2–3d | **13** |
| S2 Slider antes/depois | Alto | 1d | **14** |
| E5/E7/E8/E10/S4 | Incrementais | variável | sob demanda |

**Sugestão de sprint:** itens 1–10 formam um pacote de ~2 dias ("pass de temperatura") que tira o funil do "estéril" sem tocar na estrutura. S1 (fotografia) é o passo seguinte e pode rodar em paralelo via plugin de geração de imagens.

---

## 5. GUARDRAILS (para não descarrilhar)

- Nada de animação > 400ms em telas de pergunta — velocidade percebida é sagrada
- Confetti só nos 3 momentos do E10; popups sociais no máximo 3/sessão
- Toda animação respeita `prefers-reduced-motion`
- Contraste AA mínimo 4.5:1 em qualquer texto novo (terracota sobre creme precisa do tom profundo, não o claro)
- Mobile 360×640 continua sem scroll em telas de pergunta após adicionar ícones
