# Otimização de Conversão e Copy — Implementation Plan

**Goal:** executar as 3 frentes da spec `2026-08-02-conversao-copy-design.md` — F1 quick wins, F2 contradições, F3 estrutura — uma versão por frente.

**Architecture:** F1 e F3 são patches declarativos no `pilates.json` (copy/ordem), F2 adiciona o mecanismo `fromWhen`/`pctWhen` nas barras do checkout (runtime TS) + `@switch`/tokens já existentes. QA: `copy-qa` + `persona-qa` verdes, Playwright 390×844, build com loop de integridade.

**Tech Stack:** React 18 + TS, zod (payload aberto), Python (patch JSON), tsx, Playwright.

## Global Constraints

- Stats novos: 55–85%, redondos, sem claim médico (regra S4 nº8).
- `src/funnels/pilates.json` e `public/funnels/pilates.json` sempre idênticos.
- copy-qa (incl. validações meter/proof/icons) + persona-qa verdes ao fim de cada frente.
- Build íntegro: assets≥2, icons=100, funnels=1 (loop ≤6). Uma `build_version` por frente.

---

### Frente 1 — Quick wins (versão própria)

**Task 1.1 — patch JSON** (`src/funnels/pilates.json` → copia p/ `public/funnels/`):
- `cta` novos: i-goal `VER COMO VOU CHEGAR LÁ`; i-diagnosis `VER MEU DIAGNÓSTICO`; projection `VER MINHA PROJEÇÃO`; email `RECEBER MEU PLANO`; plan-ready `DESBLOQUEAR MEU PLANO`; scratch `REVELAR MEU DESCONTO` (verificar se scratch usa `cta` no payload antes).
- social-proof-2: headline `@switch` goal {perder-peso: "76% das mulheres com o seu objetivo viram diferença na balança em 4 semanas", tonificar: "72% das mulheres com o seu objetivo notaram firmeza nos braços e na barriga", postura: "79% das mulheres com o seu objetivo relataram menos dores no dia a dia", manter: "68% das mulheres com o seu objetivo mantêm a rotina há mais de 3 meses"}; body: "4,8★ de média em 12.400 avaliações — **a comunidade que caminha com você.**"
- i-welcome headline → "Começar era a parte difícil — **e você já fez.**"
- i-activity headline → "Seu mapa de treino está **traçado**."
- age headline → "Pilates em casa, adaptado à sua faixa etária"
- dream-body headline → "Qual é o seu corpo dos sonhos?"
- email headline → "Digite seu e-mail para receber o plano de {{goalLabel}}"
- diet-type body → "Para você receber receitas no seu estilo — **sem alimentos que não come.**"
- confidence opções: `incerta` → "Vou tentar com tudo!"; `insegura` → "Quero provar para mim que consigo"

**Task 1.2 — QA**: `npx tsx scripts/copy-qa.ts` + `npx tsx scripts/persona-qa.ts` verdes; `diff` dos JSONs vazio.

**Task 1.3 — visual**: Playwright 390×844 em age, i-goal, social-proof-2 (seed goal=postura p/ ver @switch), plan-ready.

**Task 1.4 — build íntegro + `build_version` "CTAs e headlines de valor (F1)" + commit.**

---

### Frente 2 — Contradições (versão própria)

**Task 2.1 — i-meal-preview `@switch` goal** no headline (4 casos da spec §2.1; fallback = perder-peso).

**Task 2.2 — mecanismo `fromWhen`/`pctWhen`**:
- Modify `src/checkout/CheckoutPage.tsx`: ao renderizar cada barra, avaliar `bar.fromWhen` (array de `{when: Rule, from: string, pct: number}`) com o mesmo avaliador de regras usado em `descWhen` (já existe no runtime/checkout — localizar e reusar).
- Modify `src/funnel/runtime.ts` (checkoutModel): só se o avaliador de `descWhen` morar lá — seguir o padrão existente.
- Patch JSON: barras Flexibilidade (`flexibility=bastante` → from "Boa", pct 55), Nível de Pilates (`experience=sim` → from "Básico", pct 55), Gordura corporal (`body-type=magra` → from "Normal", pct 60); `heroNowLabel` vira `@switch` body-type {magra: "Pouco tônus · core inativo", default: "Postura desalinhada · core inativo"}.

**Task 2.3 — evento reutilizado**: projection body ganha sufixo condicional quando `event` ≠ `nenhum` e `eventDate` preenchido (usar token existente ou criar `{{eventDateLabel}}` no resolve se necessário); checkout chip de urgência sob o headline com a mesma condição.

**Task 2.4 — QA + visual (Playwright: i-meal-preview com goal=postura; checkout com seeds flexibility=bastante + event/data) + build + `build_version` "Copy reativa sem contradições (F2)" + commit.**

---

### Frente 3 — Estrutura (versão própria)

**Task 3.1 — inverter name/email no array `screens` + ponteiros `next`** (verificar se screens usam `next` explícito ou ordem implícita; ajustar ambos). Revalidar tokens: plan-ready usa `firstName` ✓.

**Task 3.2 — micro-subheads**: water/sleep/stress/breakfast ganham `body` (spec §3.2).

**Task 3.3 — QA + visual (Playwright: fluxo social-proof-2 → name → email → plan-ready; water) + build + `build_version` "Ordem nome→email + anti-fadiga (F3)" + commit.**
