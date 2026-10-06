# Plano de Implementação — Quiz Pilates (Funil Completo)
### Build do funil 1–55 + checkout | React + Vite + Tailwind | front-end com dados simulados

**Decisões registradas:**
- **Stack:** React + Vite + Tailwind CSS
- **Dados/pagamento:** sem backend nesta fase — sessão e respostas persistidas em `localStorage` (simulando o `order` UUID); checkout e modal de pagamento construídos como UI completa com lógica simulada; integração real (API, e-mail, Stripe/Mercado Pago, Pix) fica para a Fase 2
- **Escopo:** funil completo — telas 1–55 + página de checkout longa (12 seções) + modal de pagamento

**Documentos de referência (fonte da verdade):**
1. `varredura-quiz-betterme.md` — o original mapeado
2. `plano-quiz-pilates.md` — adaptação de nicho e copies
3. `especificacao-profunda-quiz-pilates.md` — comportamento, templates e estados (**prevalece em divergências**)

---

## 1. ARQUITETURA DA APLICAÇÃO

### 1.1 Estrutura de pastas

```
src/
├── main.tsx
├── App.tsx                      # rotas
├── quiz/
│   ├── engine/
│   │   ├── screens.config.ts    # as 55 telas declarativas (id, template, copy, opções, regras)
│   │   ├── machine.ts           # state machine: navegação, guards, transições
│   │   ├── session.ts           # order UUID + persistência localStorage + reidratação
│   │   ├── personalization.ts   # variáveis dinâmicas (idade, goal, diagnóstico, IMC, projeção)
│   │   ├── diagnosis.ts         # matriz D1–D5 + score de nível
│   │   └── analytics.ts         # camada de eventos (console/dataLayer nesta fase)
│   ├── templates/
│   │   ├── SelectCards.tsx      # T1
│   │   ├── QuestionSingle.tsx   # T2 (+ variantes silhueta, agrupado)
│   │   ├── QuestionMulti.tsx    # T3
│   │   ├── Interstitial.tsx     # T4 (a–e)
│   │   ├── InputMeasure.tsx     # T5 (+ variantes email/nome/data)
│   │   ├── Loading.tsx          # T6 (a: barras / b: círculo)
│   │   └── Result.tsx           # T7 (a: perfil / b: projeção / c: plano pronto)
│   ├── components/
│   │   ├── Chrome.tsx           # header (voltar, logo, seção, menu) + barra de progresso
│   │   ├── OptionCard.tsx       # card com radio/check e estados
│   │   ├── CTAButton.tsx        # fixo na base, enabled/disabled
│   │   ├── Toast.tsx
│   │   ├── BmiScale.tsx         # escala colorida 15–40 com marcador
│   │   ├── ProjectionChart.tsx  # curva de peso (SVG)
│   │   └── ScratchCard.tsx      # canvas destination-out
│   └── QuizPage.tsx             # orquestra template ativo + transições
├── checkout/
│   ├── CheckoutPage.tsx         # página longa (12 seções)
│   ├── sections/                # Hero, Plans, Security, Included, Ratings, Results,
│   │                            # Faq, Media, Reviews, PlansRepeat, Guarantee, Footer
│   ├── PlanCard.tsx
│   ├── Countdown.tsx
│   └── PaymentModal.tsx
├── data/
│   ├── copy.pt-BR.ts            # todo o copy deck (Parte 5 da spec)
│   ├── testimonials.ts
│   └── plans.ts                 # 3 planos, preços, âncoras
└── lib/
    └── utils.ts
```

### 1.2 Decisões técnicas

| Tema | Decisão | Motivo |
|---|---|---|
| Roteamento | React Router — `/` (tela 1), `/quiz/:stepId`, `/email`, `/raspadinha`, `/checkout` | URL por etapa = voltar do navegador funciona (paridade com o original) |
| Estado | **Zustand** (único store do quiz) | Leve, suficiente; sem boilerplate de Redux |
| Telas | **Configuração declarativa** (`screens.config.ts`) — array de objetos com template, copy e regras | As 55 telas viram dados; os 7 templates viram código. Adicionar/editar pergunta = editar config, não componente |
| Transições | Framer Motion (`AnimatePresence`, fade+slide 200ms) | Paridade com a suavidade do original |
| Gráficos | SVG próprio (curva de projeção, escala IMC) | Sem dependência pesada; visual idêntico ao original |
| Raspadinha | Canvas nativo (`destination-out`) | Sem lib |
| Countdown | `useCountdown` + persistência em `localStorage` | Não zera no F5 (paridade) |
| Moeda/preços | `plans.ts` com valores fixos BRL nesta fase | Geo-IP entra na Fase 2 |
| Analytics | `analytics.ts` emitindo para `console` + `window.dataLayer` | Troca por provider real na Fase 2 sem tocar nas telas |
| Imagens | Placeholders locais/gerados nesta fase (mesma proporção e tratamento: fundo claro, tons neutros) | Assets finais entram quando disponíveis |

### 1.3 O coração: `screens.config.ts`

Cada tela é um objeto — é aqui que a fidelidade vive:

```ts
{
  id: 'q-goal',                    // tela 05
  template: 'question-single',     // T2
  section: 'meu-perfil',           // alimenta header + progresso
  countsForProgress: true,
  headline: 'Qual é o seu principal objetivo?',
  options: [
    { value: 'perder-peso',  label: 'Perder peso' },
    { value: 'tonificar',    label: 'Tonificar e definir' },
    { value: 'postura',      label: 'Corrigir a postura e aliviar dores' },
    { value: 'manter',       label: 'Manter o peso e ficar em forma' },
  ],
  saveAs: 'goal',
  next: 'i-goal',                  // pode ser função (branching)
}
```

A `machine.ts` lê o config, resolve `next`, aplica guards (ex.: tela 43 "Nenhum evento" → pula 44), e grava respostas no store + localStorage.

---

## 2. SPRINTS DE EXECUÇÃO

> Estimativas em dias de dev (1 dev front). Total: **~13–16 dias úteis**.

---

### SPRINT 0 — Fundação (0,5–1 dia)

**Objetivo:** projeto rodando com o chrome do quiz e tokens visuais.

- [ ] Setup Vite + React + Tailwind (+ Zustand, Framer Motion, React Router)
- [ ] Design tokens no `tailwind.config`: cores (off-white `#FAF7F2`, texto `#1C1917`, bege `#F3EFE8`, borda `#E7E2DA`, CTA `#292524`, disabled `#B9B2A8`, erro `#E5484D`), radius 12–16px, tipografia (serifada leve para headlines de resultado + sans para corpo)
- [ ] Componente `Chrome`: header (voltar/logo/seção/menu) + barra de progresso segmentada
- [ ] Rotas esqueleto: `/`, `/quiz/:stepId`, `/email`, `/raspadinha`, `/checkout`
- [ ] `session.ts`: geração de `order` UUID + persistência/reidratação

**Aceite:** navegar entre rotas vazias com header e barra renderizando; F5 mantém estado.

---

### SPRINT 1 — Motor do quiz + templates de pergunta (2–3 dias)

**Objetivo:** o "DNA comportamental" funcionando de ponta a ponta com telas de exemplo.

- [ ] `machine.ts`: navegação, `next` estático/dinâmico, guards, voltar com resposta preservada
- [ ] `screens.config.ts`: esquema + 5 telas de exemplo cobrindo todos os caminhos
- [ ] **T2 QuestionSingle:** card de opção (estados default/hover/selected), auto-advance com feedback de 200ms, variante silhueta (grid 2×2), variante agrupada (divisores de categoria)
- [ ] **T3 QuestionMulti:** checkbox, botão "Próximo passo" condicional, regra de exclusividade do "Nenhum"
- [ ] **T4 Interstitial:** variantes a–e (motivação, diagnóstico, prova social, autoridade, preview de refeições)
- [ ] Transições fade+slide entre telas (sem reload)
- [ ] Cálculo da barra de progresso (só perguntas contam; interstitial não move)
- [ ] `analytics.ts` com `screen_viewed` e `answer_submitted`

**Aceite (paridade):** escolha única avança sem botão; múltipla exige seleção; "Nenhum" limpa as demais; voltar preserva tudo; barra congela em interstitial.

---

### SPRINT 2 — Conteúdo completo das seções 1–5 (2 dias)

**Objetivo:** telas 1–39 implementadas com copy e personalização.

- [ ] Tela 1 (T1): cards de idade com foto + footer legal + botão Ajuda
- [ ] Telas 3–39 no config (copy deck da Parte 5 da spec, palavra por palavra)
- [ ] `personalization.ts`: variáveis `age_bucket`, `goal`, `focus_zones`, `pain_points`, `energy` ecoando nos interstitials (telas 2, 4, 6, 12, 20, 24)
- [ ] **T5 InputMeasure** (telas 36–39): toggle de unidade, validação de range com erro inline, CTA cinza→escuro, consentimento obrigatório + toast vermelho (36), feedback instantâneo de IMC (37) e % de meta (38)
- [ ] `diagnosis.ts`: matriz D1–D5 com prioridade + score de nível de Pilates → alimenta telas 12 e 41

**Aceite:** fluxo 1→39 completo; copies dinâmicas refletem as respostas; IMC calcula ao digitar; sem consentimento não avança (toast).

---

### SPRINT 3 — Resultado e ancoragem emocional (2–3 dias)

**Objetivo:** telas 40–49 — o clímax do funil.

- [ ] **T6a Loading 40:** 4 barras sequenciais com % (2,5–3s cada), rodapé de credibilidade, auto-advance
- [ ] **T7a Tela 41:** `BmiScale` (escala 15–40 com marcador "O Seu – {x}"), caixa de alerta condicional (IMC fora da faixa normal → riscos; dentro → caixa verde), 4 cards de diagnóstico, imagem "corpo atual" conforme resposta 8
- [ ] Telas 42–44: gatilhos (multi), evento (single com branch "Nenhum" → pula 44), date picker com "PULAR ESTA ETAPA"
- [ ] **T7b Tela 45:** `ProjectionChart` — curva SVG com gradiente vermelho→verde, decaimento não-linear, tooltip "Objetivo {x} kg", regra da data (`kg ÷ 0,75/semana`, ou data do evento se menor), disclaimer + quote da instrutora
- [ ] Telas 46–48: razão, compromisso (copy com `{meta}` e `{data}`), prêmios
- [ ] **T6b Loading 49:** círculo 0→100% (~12–15s), número social, carrossel de 3 depoimentos (auto-rotate 4s), troca de headline no 100% + redirect automático

**Aceite:** projeção matematicamente correta a partir dos inputs; loadings com duração e sequência fiéis; redirect automático funciona.

---

### SPRINT 4 — Captura, nome e raspadinha (1,5–2 dias)

**Objetivo:** telas 50–55.

- [ ] Tela 50: reprise da prova social (mesmo componente da tela 2)
- [ ] Tela 51: e-mail (validação RFC + erro inline) → grava no store; stub do transacional (log)
- [ ] Tela 52: nome (input gigante, habilita com ≥2 chars)
- [ ] **T7c Tela 53:** headline com `{nome}`, gráfico de 4 semanas, 3 badges, disclaimer
- [ ] Tela 54: confirmação de país (Brasil fixo nesta fase; seletor manual como fallback)
- [ ] **ScratchCard (55):** canvas com overlay "Raspe aqui", brush `destination-out`, revelação automática aos 40%, fallback de clique, cupom 30% + código `{pilates_jul26}`, countdown circular 4s → `/checkout`

**Aceite:** raspadinha funciona com gesto real no touch e mouse; código aparece "aplicado"; redirect no tempo certo.

---

### SPRINT 5 — Checkout longo + modal de pagamento (2–3 dias)

**Objetivo:** Bloco J completo (12 seções) com a estrutura do original.

- [ ] Header fixo: logo + "Desconto reservado por {MM:SS}" (persistido) + CTA
- [ ] J1 Hero: antes/depois + barras comparativas (gordura, postura, nível, flexibilidade) — dados do store
- [ ] J2/J10 `PlanCard` ×3: preço riscado → final, "R$ X/dia", "MAIS POPULAR" no meio **pré-selecionado**, selo de cupom aplicado + countdown, disclaimer de renovação que **muda conforme o plano selecionado**
- [ ] J3 selos de segurança (SSL, Visa, Mastercard, PCI, Pix)
- [ ] J4 "O que está incluído": 6 benefícios + 5 screenshots do app
- [ ] J5 card de avaliações · J6 histórias com -kg + disclaimer de compensação · J7 FAQ acordeão (4 itens) · J8 mídia · J9 reviews com estrelas
- [ ] J11 garantia 30 dias · J12 footer (CNPJ, Privacidade, Termos)
- [ ] **PaymentModal:** resumo (regular → desconto → código → total), "🔥 Você economiza R$ X", botões wallet/Pix + "ou pague com cartão" (form fake nesta fase)
- [ ] Eventos: `plan_card_selected`, `checkout_cta_clicked` (por posição), `payment_modal_opened`

**Aceite:** trocar de plano atualiza renovação e modal; countdown não zera no F5; página replica a ordem das 12 seções do original.

---

### SPRINT 6 — Polish, responsivo e QA de paridade (2 dias)

- [ ] Mobile 360×640: nenhuma pergunta com scroll; imagens laterais ocultas/empilhadas; cards 2×2
- [ ] Acessibilidade: navegação por teclado nos cards, focus visível, labels nos inputs
- [ ] Microinterações: hover/elevate nos cards, ripple no card de idade, haptic na raspadinha
- [ ] **Checklist de paridade (17 itens da spec, Parte 10)** — testar um a um contra o original
- [ ] Funil de eventos: conferir disparo e payload de todos os eventos
- [ ] Review de copy: palavra por palavra vs. copy deck (Parte 5)
- [ ] Review legal: 6 textos da Parte 8 presentes nas telas corretas

**Aceite:** 17/17 no checklist de paridade; Lighthouse mobile ≥ 90 em performance.

---

## 3. TIMELINE CONSOLIDADO

| Sprint | Entrega | Duração | Acumulado |
|---|---|---|---|
| S0 | Fundação + tokens + chrome | 0,5–1 d | 1 d |
| S1 | Motor + templates T2/T3/T4 | 2–3 d | 4 d |
| S2 | Telas 1–39 + inputs + diagnóstico | 2 d | 6 d |
| S3 | Telas 40–49 (loadings, IMC, projeção) | 2–3 d | 9 d |
| S4 | Telas 50–55 + raspadinha | 1,5–2 d | 11 d |
| S5 | Checkout + modal | 2–3 d | 14 d |
| S6 | QA de paridade + polish | 2 d | **~16 d** |

**Marcos de validação:**
- **M1 (fim S2):** quiz navegável até a tela 39 — validar UX e copy com stakeholders
- **M2 (fim S4):** funil até o plano pronto + raspadinha — primeira demonstração completa
- **M3 (fim S6):** funil completo pronto para tráfego pago (front) — Fase 2 vira desbloqueio de venda real

---

## 4. FASE 2 (fora deste escopo — já mapeada para não retrabalhar)

| Item | O que muda | Preparação já feita na Fase 1 |
|---|---|---|
| API de sessão/respostas | `session.ts` troca localStorage → sync no backend (`order` real) | interface isolada |
| E-mails transacionais | tela 51 dispara Brevo/Mailchimp real | evento `email_submitted` pronto |
| Recuperação de abandono | fluxos 1h/24h/72h | `order` + eventos por tela |
| Pagamento real | PaymentModal → Stripe/Mercado Pago + Pix + recorrência | UI e seleção de plano prontas |
| Geo-IP/moeda | tela 54 + `plans.ts` por país | componente já existe com fallback |
| Analytics real | provider (GA4/Meta Pixel/Posthog) | camada `analytics.ts` plugável |
| Testes A/B | parâmetro `flow` regendo variantes | config declarativo já suporta |

---

## 5. RISCOS E MITIGAÇÕES

| Risco | Impacto | Mitigação |
|---|---|---|
| Copy divergir da spec durante o build | Perda de fidelidade | Copy deck em `copy.pt-BR.ts` como fonte única; review palavra por palavra no S6 |
| Auto-advance parecer "pulado" demais | UX confusa | Manter delay de 200ms com estado `selected` visível — igual ao original |
| Raspadinha falhar em browsers antigos | Tela quebrada no funil | Fallback de clique + detecção de canvas |
| Scope creep no checkout | Atraso do S5 | Travar nas 12 seções mapeadas; nada além |
| Imagens placeholder virarem definitivas | Perda de qualidade visual | Lista de assets finais como dependência do go-live (S6) |
| Compliance esquecido | Risco legal no ar | Checklist legal no S6 com os 6 textos obrigatórios (Parte 8) |

---

## 6. DEFINITION OF DONE (funil completo)

1. Usuário percorre da tela 1 ao modal de pagamento sem reload e sem erros
2. Todas as personalizações ecoam corretamente (idade, goal, dores, nome, IMC, meta, data)
3. Diagnóstico exibido corresponde à matriz D1–D5
4. Projeção de peso matematicamente consistente com os inputs
5. Raspadinha, countdown e plano pré-selecionado funcionando com persistência
6. 17/17 no checklist de paridade
7. Eventos de analytics disparando com payload correto em todas as telas
8. Textos legais da Parte 8 presentes, palavra por palavra
9. Mobile-first validado em 360×640 e desktop em 1920×1080
10. Build de produção (`npm run build`) sem warnings críticos
