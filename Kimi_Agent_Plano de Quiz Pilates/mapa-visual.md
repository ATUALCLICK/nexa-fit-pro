# Mapa Visual da Jornada — Escaneabilidade, Moção e Gamificação

**Como cada uma das 74 posições (62 slots + 12 checkout) fica mais visual — sem quebrar a propriedade zero-asset.**

Complementa `template-jornada.md` (por que cada etapa existe) e `journey-skeleton.json` (contrato por slot, agora com o campo `upgradeVisual`). Este documento é a especificação legível; o JSON é o que o gerador consome.

---

## Premissas (decisões do grilling)

1. **Zero-asset**: nenhum upgrade usa foto, ilustração externa ou logo-imagem. Tudo é tipografia, ícone lucide (conjunto fechado), data-viz e CSS. A replicabilidade por nicho é intocável.
2. **Etiquetagem híbrida**: todo mecanismo é `DSL` (fragmento novo — o gerador controla o conteúdo por nicho) ou `MOTOR` (evolução do template — todos os nichos herdam automaticamente). Slots marcados `AMBOS` combinam os dois.
3. **Moção com função**: animação só existe para guiar o olhar ou recompensar — nunca decorativa. Gamificação entra onde sustenta o comprometimento (streak, contadores, celebração de pico).
4. **Cobertura total, profundidade assimétrica**: 27 posições com spec detalhado (8 densas + 15 médias + 4 picos), 35 com padrão de template, 12 seções de checkout.

## O vocabulário de mecanismos (17)

### DSL — fragmentos novos (o gerador produz por nicho)

| Mecanismo | Fragmento | O que faz |
|---|---|---|
| `D-iconOpcao` ✅ **implementado** | `icon` por opção | Ícone **3D thiings.co** ao lado de cada opção (100 slugs curados, `public/icons/thiings/`, 128px) |
| `D-statCallout` ✅ **implementado** | `proof: {saveAs, byAnswer, fallback}` | Stat callout **reativo à resposta anterior** nos ecos (9 ecos; stat terracota 32px + legenda; multi-select usa a 1ª marcação; stats 55–85% redondos — regra S4 nº8) |
| `D-checklist` | `checklist: [...]` | Corpo como lista de checks em vez de prosa corrida |
| `D-miniCards` | `[{icon, titulo, texto}]` | Quebra prosa densa em 3–4 mini-cards com ícone |
| `D-contador` | `{valor, sufixo, rotulo}` | Número que o motor anima subindo |
| `D-medidorPlano` ✅ **implementado** | `meter: {pct, block, blockName, milestone?}` | Anel de % do plano nos 16 ecos (momentum; count-up 1,2s; 5 blocos, marcos 15/35/55/75/95 com selo dourado + partículas; nunca 100% — o 100% é o plan-ready) |
| `D-destaqueHero` ✅ **parcial** | `heroIcon` por eco | Herói 3D thiings (88px + halo creme) nos ecos sem grid — `EchoHero`; regra: 1 camada visual por eco (herói OU grid) |
| `D-confettiWhen` | regra | Dispara celebração (confete CSS) quando a regra bate |

### MOTOR — evoluções de template (todos os nichos herdam)

| Mecanismo | O que faz |
|---|---|
| `M-streak` | Chip "pergunta X de Y" + dots de sequência nas perguntas (gamificação do progresso) |
| `M-animPreench` | Barras/gráficos/curvas se preenchem até o valor real na entrada |
| `M-animContador` | Números sobem animados (IMC, kg, %, nota) |
| `M-stagger` | Filhos entram em sequência (40–80ms) — guia a varredura do olho |
| `M-confetti` | Confete CSS em picos (100% do loading, cupom, plano pronto) |
| `M-haptics` | Vibração sutil ao selecionar (mobile) |
| `M-selCount` | Contador "N selecionadas" nas multi-seleção |
| `M-pulse` | Pulso sutil em elemento-chave (CTA validado, badge, countdown final) |
| `M-popSelecao` | Feedback de escala/cor ao selecionar card |
| `M-steps` | Etapas do loading com check progressivo sincronizado ao % |

**Distribuição:** 40 slots `AMBOS`, 11 `DSL`, 11 `MOTOR` · checkout: 11 `MOTOR`, 1 `NENHUM` (footer legal — consentimento não se anima).

---

## As 8 telas densas (spec completo)

São as paredes de texto do funil — onde a escaneabilidade mais falha hoje:

### 1. `projection` (52) · 1090 chars · AMBOS — a tela mais importante do funil
**Antes:** headline + subheadline longa + gráfico estático.
**Depois:** contador animado do peso atual → meta; data em tipografia hero ("**novembro** — a tempo do seu casamento"); curva que se desenha na entrada (`M-animPreench`); confete quando `goalPct` é alto (`D-confettiWhen`); cards em stagger. **A projeção deixa de ser lida — é assistida.**

### 2. `i-meal-preview` (35) · 826 chars · AMBOS
**Antes:** prosa sobre as refeições do plano.
**Depois:** 4 mini-cards (café / almoço / lanche / jantar) com ícone + título + 1 linha, em stagger (`D-miniCards`). Tangibilização escaneável em 3 segundos.

### 3. `i-energy` (26) · 723 chars · AMBOS
**Antes:** eco de energia em parágrafo.
**Depois:** `D-statCallout` com o número-chave + 3 checks (`D-checklist`). O eco vira estrutura, não parágrafo.

### 4. `loading-plan` (56) · 628 chars · MOTOR (textos dos steps via DSL)
**Antes:** círculo de progresso + depoimentos rotativos.
**Depois:** steps com check progressivo ("Analisando respostas ✓ → Montando sequências ✓ → Calculando projeção…") sincronizados ao % animado; confete no 100%. O teatro ganha roteiro visível.

### 5. `i-goal` (6) · 625 chars · DSL
**Antes:** eco do objetivo em prosa.
**Depois:** o objetivo declarado por ela (token) em tipografia hero + 3 checks de como o método ataca. O eco vira espelho visual.

### 6. `diet-type` (34) · 527 chars · DSL
**Antes:** opções longas de tipo de dieta (a pergunta mais densa do F5).
**Depois:** opção rica — ícone + título curto + descrição de 1 linha (`D-iconOpcao`).

### 7. `i-awards` (55) · 427 chars · AMBOS
**Antes:** autoridade em prosa (prêmios, experts).
**Depois:** 3 `D-statCallout` grandes (usuárias, anos, nota) em stagger. **Autoridade se prova com número, não com adjetivo.**

### 8. `i-jejum` (33) · 403 chars · DSL
**Antes:** prosa sobre jejum/alimentação.
**Depois:** statCallout + checklist de 3 itens — mesmo padrão dos ecos densos.

## As 15 médias + 4 picos (spec focado)

| Slot | Upgrade |
|---|---|
| `age` (1) | Stagger + pop de seleção + haptics |
| `i-welcome` (4) | Promessa do método em hero |
| `secondary-goals` (7) | Ícone por objetivo + "N selecionadas" |
| `balance` (19) | Ícones para conceitos corporais abstratos |
| `pain-points` (20) | Ícone por região de dor + contador |
| `i-activity` (21) | Benefícios em 3 checks |
| `age-input` (42) | Feedback numérico animado |
| `weight-triggers` (45) | Ícone por gatilho + contador |
| `i-mamae` / `i-menopausa` (46/48) | Fala da persona em tipografia hero |
| `event` (49) | Ícone por ocasião |
| `i-alinhamento` (51) | Checks curtos |
| `main-reason` (53) | Ícone por razão emocional |
| `email` (58) | "Seu plano está pronto" em hero + pulso no CTA ao validar |
| `plan-ready` (60) | Barras preenchem + badges em stagger + confete |
| `i-diagnosis` (12) ★ | Rótulo do diagnóstico em hero **com pulso — nunca confete** (a virada de consciência pede peso, não festa) |
| `scratch` (62) ★ | Confete sincronizado ao reveal do cupom |
| `wellness-profile` (44) ★ | Barras/cards do perfil preenchem em sequência |
| `loading-analysis` (43) ★ | Steps com check + % animado |

## As 35 leves — padrão por template

| Template | Padrão |
|---|---|
| `question-single` (22) | Ícone por opção quando o conceito é visual + haptics |
| `question-multi` (3) | Ícone por opção + "N selecionadas" |
| `interstitial` (6) | Checklist ou destaque hero (o que couber) + stagger |
| `input-measure` (5) | Feedback numérico animado (IMC, faixa, data) |
| demais | Já visuais por natureza (result, select-cards, scratch) |

## Checkout — 12 seções

| Seção | Upgrade |
|---|---|
| header-urgencia | Pulso no countdown no último minuto |
| hero-resultado | Barras de transformação preenchem + kg em contador animado |
| planos-1 / planos-2 | Pulso no badge do recomendado; preço/dia em destaque tipográfico |
| garantia | Pulso sutil no shield na entrada |
| incluidos | 6 cards com ícone em stagger |
| avaliacoes | Nota sobe animada; estrelas preenchem em sequência |
| historias | Cards em stagger com aspas tipográficas grandes |
| faq | Acordeão com abertura animada |
| midia | Nomes dos veículos em fade sequencial |
| reviews | Cards em stagger; estrelas preenchem |
| footer | **Nenhum — legal fixo não se anima** |

---

## Impacto no view seam (o que o motor precisa implementar)

Os 7 fragmentos DSL novos entram no vocabulário do `runtime.view()` ao lado dos existentes (tokens, @switch, variants, badges, descWhen…):

1. `icon` em opções (question-single/multi) — resolve chave lucide do conjunto fechado
2. `statCallout` — interpolável com tokens, suporta `when`
3. `checklist` — array de strings com tokens
4. `miniCards` — array de `{icon, titulo, texto}`
5. `contador` — `{valor, sufixo, rotulo}`, valor interpolável
6. `hero` — string com tokens promovida a tipografia hero
7. `confettiWhen` — regra avaliada no ctx (mesmo avaliador das badges)

Os mecanismos MOTOR não tocam o DSL — são evolução de template (framer-motion já é dependência).

## Regras S4 adicionais (validação do gerador)

8. **Slot `T` não referencia imagem/asset** (já existente como regra 7 — reforçada aqui).
9. **`icon` só aceita slug do conjunto thiings curado** (`public/icons/thiings/`) — slug sem arquivo = erro (validado no copy-qa: 122 referências, 0 ausentes). Ícones de chrome de UI continuam lucide.
10. **`D-confettiWhen` proibido em slots de `diagnostico` e `consentimento`** — celebração só em `recompensa` e `projecao`.
11. **Nenhuma seção `consentimento` recebe mecanismo de moção** — legal é estático.
12. **`statCallout`/`contador` devem usar número real do funil** (token ou dado do plano) — estatística inventada = erro.

## O que NÃO fazer (anti-padrões)

- ❌ Confete no diagnóstico — banaliza a virada de consciência
- ❌ Animar o footer legal ou textos de consentimento
- ❌ Ícone em opção cujo conceito não é visual (vira ruído)
- ❌ Mais de 1 statCallout por tela leve (pico diluído não é pico — mesma lei dos papéis)
- ❌ Animação decorativa sem função de varredura ou recompensa
- ❌ Stagger em telas de input (o olho deve ir direto ao campo)

---

*Derivado de: densidade medida por tela (`pilates.json`), classificação T/H/V do skeleton, decisões do grilling (zero-asset, etiquetagem híbrida, engajamento total, cobertura 74, spec + demo). Ver `mapa-visual.html` para o antes/depois das 8 telas densas.*
