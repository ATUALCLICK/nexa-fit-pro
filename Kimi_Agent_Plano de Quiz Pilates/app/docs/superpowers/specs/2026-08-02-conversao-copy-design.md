# Design — Otimização de conversão e copywriting (3 frentes)

Data: 2026-08-02 · Processo: superpowers/brainstorming · Status: aprovado pelo usuário

## Contexto

Auditoria de copy das 62 telas do `pilates.json` + checkout identificou 10
pontos de otimização de conversão. O usuário aprovou atacar **todos, em três
frentes sequenciais, cada uma com sua própria versão** (F1 → F2 → F3).

## Decisões tomadas no brainstorm

| # | Pergunta | Decisão |
|---|----------|---------|
| 1 | Escopo | Tudo, na ordem: quick wins → contradições → estrutura |
| 2 | CTAs de valor | Só nos 6 momentos-chave |
| 3 | Prova social 2 | Reativa ao objetivo (`@switch` no `goal`) |

## Frente 1 — Quick wins de copy

### §1.1 CTAs de valor (6 telas; demais seguem CONTINUAR)

| tela | CTA novo |
|------|----------|
| i-goal | VER COMO VOU CHEGAR LÁ |
| i-diagnosis | VER MEU DIAGNÓSTICO |
| projection | VER MINHA PROJEÇÃO |
| email | RECEBER MEU PLANO |
| plan-ready | DESBLOQUEAR MEU PLANO |
| scratch | REVELAR MEU DESCONTO |

### §1.2 social-proof-2 reativa ao goal

Headline vira `@switch` em `goal` (stats 55–85%, regra S4 nº8):
perder-peso → 76% viram diferença na balança em 4 semanas; tonificar → 72%
notaram firmeza; postura → 79% relataram menos dores; manter → 68% mantêm a
rotina há 3+ meses. Sub nova: "4,8★ · 12.400 avaliações na comunidade".
Tela 1 (98.000 mulheres) permanece — as duas provas passam a ser de tipos
diferentes (escala × resultado).

### §1.3 Headlines

- i-welcome: "Você vai amar!" → "Começar era a parte difícil — e você já fez."
- i-activity: "Ótimo, entendido!" → "Seu mapa de treino está traçado."
- age (tela 0): sai do caps lock; H1 vira "Pilates em casa, adaptado à sua
  faixa etária" (template select-cards mantém layout).

### §1.4 Inconsistências

- Tela 8: "corpo de sonho" → "corpo dos sonhos".
- email: headline encurtada ("Digite seu e-mail para receber o plano de
  {{goalLabel}}").
- diet-type (33): ganha sub ("Para receber receitas no seu estilo — sem
  alimentos que você não come.").
- confidence (53): opções 2 e 3 viram compromisso ativo ("Vou tentar com
  tudo!" / "Quero provar para mim que consigo").

## Frente 2 — Copy que não contradiz a resposta

### §2.1 i-meal-preview reativa ao goal

Headline `@switch`: perder-peso mantém "Emagreça com um plano alimentar
adaptado."; tonificar → "Refeições que constroem músculo e firmeza.";
postura → "Alimentação que reduz inflamação e dores."; manter → "Um plano
alimentar para manter o ritmo — sem neura."

### §2.2 Barras do checkout reativas

Novo mecanismo opcional por barra em `checkout.bars[]`:
`fromWhen: [{when: Rule, from: string, pct: number}]` (mesmo padrão do
`descWhen` de `included`). Avaliado em ordem, primeiro match vence; sem
match, usa `from`/`pct` padrão. Aplicações:

- Flexibilidade: `flexibility` bastante-flexivel → from "Boa", pct 55.
- Nível de Pilates: `experience` sim → from "Básico", pct 55.
- Gordura corporal: `body-type` magra → from "Normal", pct 60.
- `heroNowLabel`: `@switch` em `body-type` (magra → "Pouco tônus · core
  inativo"; grande/afinado → mantém padrão).

### §2.3 Reutilização do evento

`projection` ganha sub reativo: quando `event` ≠ nenhum e `eventDate`
existe, adiciona "— com foco no seu evento em {{eventDateLabel}}."
Checkout: chip de urgência sob o headline quando houver evento
("Seu evento é em {{eventDateLabel}} — o plano de 4 semanas cobre.").

## Frente 3 — Estrutura

### §3.1 Inverter nome → e-mail

Nova ordem: social-proof-2 → **name → email** → plan-ready → country →
scratch. Tokens verificados: `plan-ready` usa `firstName` (disponível),
`email` usa `goalLabel` (independente). Apenas reordenação + ponteiros
`next` no JSON.

### §3.2 Anti-fadiga 26–31

Micro-subheads explicando o porquê da pergunta (sem mudar ordem nem
remover telas): water → "Para calibrar seus lembretes de hidratação.";
sleep → "Sono regula fome e recuperação — seu plano considera isso.";
stress → "Para dosar as sessões de respiração do plano."; breakfast →
"Seu plano alimentar respeita seus horários reais." (lunch/dinner seguem
sem sub para não repetir o recurso).

## Restrições globais

- Stats novos seguem a regra S4 nº8 (55–85%, redondos, sem claim médico,
  framing "usuárias/mulheres").
- `meter` continua válido após qualquer reordenação (copy-qa nº9).
- Os dois JSONs (`src/funnels/` e `public/funnels/`) sempre idênticos.
- `persona-qa` e `copy-qa` verdes ao fim de cada frente; Playwright
  390×844 nas telas tocadas; build com loop de integridade; uma versão
  salva por frente.
