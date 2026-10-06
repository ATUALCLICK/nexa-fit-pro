# Estrutura — Gerador de Funis de Quiz por Nicho
### App recebe um nicho → gera ICP + funil completo → publica como JSON consumido pela engine existente

**Decisões:** funnel.json multi-tenant (um deploy, nicho via URL) · Kimi API · gerador como área `/admin` dentro do app atual.

---

## 1. O QUE JÁ EXISTE (inventário → destino)

| Existente | Linhas | Destino no gerador |
|---|---|---|
| **7 templates** (SelectCards → Scratch) | ~1.100 | ✅ **Intocáveis** — são a engine de renderização |
| **Máquina de estados** (`screens.config.ts`: resolveNext/Prev, guards, progresso) | incluída no config | ✅ **Intocável** — mas o config vira **artefato compilado**, não fonte |
| **Profile Engine** (`profile.ts`: personas, variantes, plano recomendado) | 160 | ⚠️ Regras hard-coded viram **regras declarativas (dados)** lidas do funnel.json |
| **Personalization** (IMC, projeção, diagnóstico, datas) | 177 | ⚠️ Diagnósticos D1–D5 hard-coded viram **matriz declarativa** no JSON; cálculos (IMC/0,75kg-sem) ficam |
| **Store/sessão** (zustand + localStorage) | 33 | ✅ Intocável |
| **Analytics** | 17 | ✅ Intocável |
| **Checkout** (12 seções + modal) | ~510 | ⚠️ Estrutura fica; **todo o texto vira slot do funnel.json** |
| **QA por personas** (`scripts/persona-qa.ts`) | ~120 | 🔁 Generalizado: roda **contra qualquer funnel.json gerado** (vira validador automático do pipeline) |
| **7 documentos de método** (varredura, spec, ICP, auditoria, oportunidades) | — | 📚 Viram **conhecimento dos prompts** (few-shot + regras) |

**A separação fundamental:** hoje, engine e conteúdo vivem misturados em `screens.config.ts` (940 linhas com copy + lógica em funções TS). O gerador exige separar em:

```
ENGINE (código, imutável entre nichos)     ← templates, máquina, store, analytics, cálculos
JORNADA (esqueleto, imutável)              ← os 7 tipos de tela na ordem 1→61 com suas regras de interação
CONTEÚDO (funnel.json, gerado por nicho)   ← copies, opções, personas, diagnósticos, planos, checkout
```

---

## 2. ARQUITETURA GERAL

```
┌─────────────────────────────────────────────────────────────┐
│ APP ÚNICO (este projeto)                                    │
│                                                             │
│  /admin  ────────────────────────────────────────────────┐  │
│  ┌─────────────────────────────────────────────────────┐ │  │
│  │ GERADOR (4 estágios LLM + validação + preview)      │ │  │
│  │  input nicho → ICP → telas → checkout → QA → publica│ │  │
│  └──────────────────────┬──────────────────────────────┘ │  │
│                         │ funnel.json                     │  │
│                         ▼                                 │  │
│  /funis (public/funnels/{slug}.json)                      │  │
│                         │                                 │  │
│  /#/quiz/...  ◄── FunnelLoader (?f={slug} | default)     │  │
│  /#/checkout     engine + jornada + conteúdo             │  │
└─────────────────────────────────────────────────────────────┘
```

**Fluxo de consumo:** `viva.app/#/quiz/age?f=yoga` → `FunnelLoader` busca `/funnels/yoga.json` → hidrata engine → funil idêntico em comportamento, 100% outro nicho. Sem `?f=`, carrega o funil default (pilates — nosso seed).

---

## 3. O FUNNEL.JSON (contrato central)

O maior desafio técnico: hoje o config usa **funções TS** (copy dinâmica, `next` com branching, `guard`). JSON não tem funções — então criamos uma **mini-DSL declarativa** que cobre 100% dos casos atuais:

```jsonc
{
  "meta": {
    "slug": "yoga-iniciantes",
    "product": "Plano de Yoga em Casa",
    "brand": "Flow Yoga",
    "locale": "pt-BR",
    "coupon": "yoga_30",
    "palette": { "accent": "#7D8F74", "cta": "#292524", "bg": "#FAF7F2" }
  },

  "icp": {
    "personas": [
      {
        "id": "mae-exausta",
        "name": "A Mãe Exausta",
        "ageRange": "30-45",
        "pains": ["sem tempo", "culpa", "dor lombar"],
        "detect": { "any": [                        // DSL de detecção (mesma lógica do profile.ts)
          { "key": "weightTriggers", "op": "includes", "value": "filhos" }
        ]},
        "plan": "4w",
        "checkoutHeadline": "Cuidar de você também é cuidar deles."
      }
    ],
    "diagnoses": [                                   // matriz D1–D5 como dados
      { "id": "D1", "title": "Corpo Rígido",
        "when": { "all": [{ "key": "goal", "op": "eq", "value": "flexibilidade" }] },
        "cardLabel": "Perfil", "cardValue": "Rígido",
        "copy": "Seus músculos encurtados..." }
    ]
  },

  "screens": [
    {
      "id": "age", "template": "select-cards", "section": "none",
      "countsForProgress": true, "saveAs": "ageBucket",
      "payload": {
        "headline": "PLANO DE YOGA",
        "options": [{ "value": "25-34", "label": "Idade: 25–34" }]
      },
      "next": "social-proof"
    },
    {
      "id": "i-goal", "template": "interstitial",
      "payload": {
        "headline": "Nós sabemos como fazer isso acontecer!",
        "body": "Vamos criar um plano para {{goalLabel}}...",
        "variants": {                                 // merge por persona (já existe na engine)
          "mae-exausta": { "headline": "Você merece 15 minutos só seus." }
        }
      }
    },
    {
      "id": "event-date",
      "guard": { "key": "event", "op": "neq", "value": "nenhum" },   // guard declarativo
      "next": "i-alinhamento"
    },
    {
      "id": "event",
      "next": { "default": "i-alinhamento",                          // branching declarativo
                "cases": [{ "when": { "key": "event", "op": "eq", "value": "nenhum" }, "goto": "projection" }] }
    }
  ],

  "checkout": {
    "plans": [{ "id": "4w", "name": "4 semanas", "regular": 171.41, "price": 119.99 }],
    "included": [{ "title": "...", "desc": "...", "icon": "home" }],
    "stories": [{ "persona": "mae-exausta", "name": "...", "kg": "-4 kg", "text": "..." }],
    "faqs": [{ "q": "...", "a": "...", "whenPersona": "mae-exausta" }],
    "guaranteeDays": 30
  }
}
```

**A DSL cobre tudo que hoje é função:**
| Hoje (TS) | No JSON (DSL) |
|---|---|
| `headline: (a) => \`...${ageLabel(a)}\`` | `"headline": "...{{ageLabel}}"` — interpolação de tokens |
| `next: (a) => a.event === 'nenhum' ? 'x' : 'y'` | `next: { default, cases: [{when, goto}] }` |
| `guard: (a) => pain.length > 0` | `guard: { key, op: includes|eq|neq|gt|lt|empty, value? }` (com `all`/`any`) |
| `variants` por persona | idêntico (já é dados) |
| diagnósticos D1–D5 (if/else) | `icp.diagnoses[]` com `when` + prioridade = ordem do array |
| plano recomendado (if/else) | `icp.personas[].plan` + regra de precedência |

**Tokens de interpolação** (calculados pela engine, nunca pelo LLM): `{{ageLabel}}`, `{{goalLabel}}`, `{{firstName}}`, `{{goalWeight}}`, `{{projectionDate}}`, `{{bmi}}`, `{{foco}}`, `{{dorAlvo}}` — a lógica matemática/calendário fica no código; o LLM só escreve texto com placeholders.

---

## 4. O GERADOR (`/admin`) — PIPELINE DE 5 ESTÁGIOS

```
[Nicho/produto] → S1 ICP → S2 Jornada/Telas → S3 Checkout → S4 QA+Repair → S5 Preview/Publicar
```

### Entrada (form /admin)
- **Nicho ou produto** (texto livre, obrigatório) — ex.: "yoga para iniciantes", "reedução alimentar para mulheres 40+"
- Campos opcionais: público-alvo, faixa de preço, país/idioma, nome da marca, tom de voz
- **Chave da Kimi API** (campo password, salva só em localStorage do admin — ver §7 segurança)

### S1 — Geração do ICP
- **Prompt:** system com o nosso documento `icp-personas-rotas-dinamicas.md` como referência de formato + few-shot do ICP pilates
- **Saída (JSON validado por zod):** 4–6 personas com dores, desejos, gatilhos detectáveis, plano recomendado, headline de checkout
- **Regra de ouro:** cada persona deve ser detectável por respostas que a jornada já captura (o validador checa se os `detect.key` existem no esqueleto)

### S2 — Geração das telas
- **Prompt:** o **esqueleto da jornada é fixo no código** (61 telas com template/seção/ordem/regras — NÃO é gerado). O LLM recebe o esqueleto e **preenche os slots**: headlines, opções, subheadlines, interstitials, variantes por persona
- Saída em 3–4 lotes (bloco A–B, C–D, E–F, G–I) para não estourar contexto; cada lote validado
- O esqueleto carrega "instruções por slot": ex., tela 12 = "diagnóstico pseudo-científico do nicho, formato 'Parece que você tem o perfil de X'"

### S3 — Geração do checkout
- Planos (3, com preço/dia e âncora), 6 benefícios, 3 histórias (1 por persona prioritária), 4 FAQs, headlines por razão emocional
- **Textos legais não são gerados** — vêm de template fixo com placeholders de marca (compliance não se delega ao LLM)

### S4 — QA automático + auto-repair
1. **Validação estrutural (zod):** schema completo do funnel.json
2. **Persona-scripts:** o `persona-qa.ts` generalizado roda contra o JSON gerado — toda persona do ICP deve ativar sua rota; toda rota deve terminar na raspadinha; saldo de telas ≤ +3
3. **Congruência:** tokens `{{...}}` existem? `next/guard` apontam para ids válidos? opções exclusivas marcadas? disclaimers presentes nas telas de projeção?
4. **Auto-repair:** erros → prompt de correção com a lista de falhas (máx 2 loops; depois, reporta ao usuário)

### S5 — Preview e publicação
- Preview instantâneo: `?f=draft` carrega o JSON da memória (sem publicar) — o admin percorre o funil gerado na hora
- Publicar: grava `public/funnels/{slug}.json` (+ registro em `public/funnels/index.json`)
- Versionamento: cada publicação salva `{slug}.v{n}.json` — rollback instantâneo

---

## 5. INTEGRAÇÃO KIMI API

```ts
// src/generator/kimi.ts
const r = await fetch('https://api.moonshot.ai/anthropic/v1/messages', {
  method: 'POST',
  headers: { 'x-api-key': key, 'Content-Type': 'application/json' },
  body: JSON.stringify({
    model: 'kimi-k2.5',            // ajustar ao modelo disponível na conta
    max_tokens: 8000,
    temperature: 0.7,              // copy: criativa; S4/repair: 0.2
    system: SYSTEM_PROMPTS[stage], // por estágio
    messages: [{ role: 'user', content: userPrompt }],
    // saída forçada: instrução "responda APENAS JSON válido conforme o schema" + zod parse + retry
  }),
})
```

- **Estratégia de saída estruturada:** schema JSON embutido no prompt + `zod.safeParse` + 1 retry com o erro de parse anexado (padrão que funciona bem com Kimi)
- **Few-shot:** o funil pilates (nosso JSON seed) vai como exemplo-âncora em S2/S3 — é o que garante "seguir exatamente a engine e jornada"
- **Custo estimado por funil gerado:** ~60–90k tokens (S1 ~10k, S2 ~50k, S3 ~15k, repair ~15k) — na faixa de centavos de dólar por funil

---

## 6. MUDANÇAS NA ENGINE EXISTENTE (mínimas e cirúrgicas)

| Arquivo | Mudança |
|---|---|
| `src/funnel/schema.ts` 🆕 | Tipos + zod do funnel.json + DSL (`when`, `next.cases`, tokens) |
| `src/funnel/loader.ts` 🆕 | `?f={slug}` → fetch → cache; fallback pilates; modo `draft` (memória) |
| `src/funnel/interpolate.ts` 🆕 | Resolve `{{tokens}}` usando personalization.ts |
| `src/funnel/rules.ts` 🆕 | Avalia `guard`/`next.cases`/`detect` declarativos (substitui funções do config) |
| `screens.config.ts` | vira **artefato compilado**: `pilates.json` + import do seed; a máquina (resolveNext/Prev) passa a ler rules, não funções |
| `profile.ts` | lê `icp.personas[].detect` e `diagnoses[]` do funnel ativo (lógica de avaliação fica, dados saem) |
| `personalization.ts` | intocável nos cálculos; diagnósticos vêm do JSON |
| `CheckoutPage.tsx` | textos viram slots do `checkout` no JSON (estrutura das 12 seções fixa) |
| `scripts/persona-qa.ts` | generalizado: `npx tsx persona-qa.ts --funnel public/funnels/x.json` |
| 7 templates, store, analytics, máquina | **zero mudanças** |

---

## 7. SEGURANÇA & COMPLIANCE

- **Chave Kimi:** nesta fase (front-only), a chave fica no navegador do admin (localStorage) — aceitável para uso interno; **Fase 2:** proxy backend (`/api/generate`) para nunca expor a chave e esconder os prompts
- `/admin` sem link público + senha simples (Fase 2: auth real)
- **Textos legais/disclaimers:** templates fixos com placeholder de marca — o LLM nunca gera termos de renovação, garantia ou disclaimer de saúde
- Nichos de saúde: validador exige as frases "consulte seu médico" nas telas de projeção/dor (S4 bloqueia publicação sem elas)

---

## 8. ESTRUTURA DE PASTAS NOVA

```
src/
├── funnel/                  # runtime multi-tenant
│   ├── schema.ts            # zod + tipos do funnel.json + DSL
│   ├── loader.ts            # ?f=slug, cache, draft mode
│   ├── interpolate.ts       # {{tokens}}
│   └── rules.ts             # avaliador declarativo (guard/next/detect)
├── generator/               # área /admin
│   ├── AdminPage.tsx        # formulário + pipeline visual (5 estágios)
│   ├── kimi.ts              # cliente da API
│   ├── prompts/             # system prompts por estágio + few-shot pilates
│   ├── stages/              # s1-icp.ts, s2-screens.ts, s3-checkout.ts
│   ├── qa.ts                # validador + persona-scripts + auto-repair
│   └── publish.ts           # grava/versona em public/funnels/
├── quiz/                    # INTACÁVEL (engine)
└── checkout/                # estrutura fixa, textos via slots
public/
└── funnels/
    ├── index.json           # registro de funis publicados
    ├── pilates.json         # seed (funil atual compilado)
    └── {slug}.json          # funis gerados
```

---

## 9. ROADMAP

| Fase | Entrega | Estimativa |
|---|---|---|
| **F1 — Fundação** | schema zod + DSL + loader + engine lendo JSON; pilates compilado como seed; QA generalizado; regressão verde | 2–3 dias |
| **F2 — Gerador MVP** | /admin com S1→S3 chamando Kimi; validação zod; preview `?f=draft`; publicação em public/funnels | 2–3 dias |
| **F3 — QA + Repair** | persona-scripts no pipeline, checagens de congruência, loop de auto-repair | 1–2 dias |
| **F4 — Polimento** | versionamento de funis, registro/index, duplicar funil, editar copy no admin antes de publicar | 1–2 dias |
| **F5 — Fase 2** | proxy backend da API, auth do admin, geração de imagens por nicho (plugin), moeda/geo | sob demanda |

**Marco de aceite do MVP:** digitar "yoga para iniciantes" no /admin → em ~2 minutos ter um funil completo navegável em `?f=yoga-iniciantes`, com ICP próprio, rotas dinâmicas ativas e QA verde — indistinguível em comportamento do funil pilates.

---

## 10. RISCOS

| Risco | Mitigação |
|---|---|
| LLM gerar copy fora do tom/estrutura | Few-shot com o funil pilates + schema rígido + temperature por estágio |
| JSON inválido ou ids quebrados | zod + validador de grafo (todo `next` aponta para id existente) no S4 antes de publicar |
| Personas indetectáveis (regra aponta para variável inexistente) | S4 checa `detect.key` contra a lista de `saveAs` do esqueleto |
| Custo/latência da geração | Lotes por bloco + cache de rascunho; retry só do lote falho |
| Qualidade variar por nicho | Métrica de aceite fixa: QA verde + revisão humana no preview antes de publicar |
