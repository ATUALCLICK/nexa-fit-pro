# PlanMeter nos Ecos — Implementation Plan

**Goal:** adicionar um medidor de plano evolutivo (anel de % + bloco atual) a todos os 16 ecos do funil, com estado de celebração nos 5 ecos-marco, para criar momentum e reduzir abandono.

**Architecture:** componente novo `PlanMeter.tsx` (SVG + rAF count-up, sem deps novas) renderizado pelo template `Interstitial` depois do `ProofBlock`; dados 100% declarativos no `pilates.json` (`payload.meter`), validados pelo `copy-qa.ts` (o schema zod usa `payload: z.record(z.unknown())` — aberto — então o contrato é enforced pelo copy-qa, precedente do `proof`).

**Tech Stack:** React 18 + TS, Tailwind (classes arbitrárias), zod, tsx (QA), Playwright (QA visual).

## Global Constraints

- Cores da marca: terracota `#B57E5B`, creme `#F3EFE8`, borda `#E7E2DA`, tinta `#1C1917`, corpo `#57534E`, muted `#78716C`, sálvia `#7D8F74`, dourado `#D9A05B`.
- Anatomia do eco: herói → H1 → SUB → conteúdo → proof → **PlanMeter** → CTA. PlanMeter é elemento de dados (como proof), não viola a regra de uma camada visual.
- `meter.pct`: inteiro 1–99, estritamente crescente na ordem da jornada. Nunca 100% no quiz (100% = plan-ready).
- `milestone` exatamente nos 5 ecos-marco: `i-goal` (15%), `i-activity` (35%), `i-jejum` (55%), `i-authority` (75%), `social-proof-2` (95%).
- Os dois JSONs (`src/funnels/pilates.json` e `public/funnels/pilates.json`) devem permanecer idênticos.
- Build só é válido com: `dist/assets` ≥ 2, `dist/icons/thiings` = 100, `dist/funnels` = 1 (loop de até 6 tentativas — mount flaky).
- Não criar dependências novas.

---

### Task 1: Componente PlanMeter + keyframes

**Files:**
- Create: `src/quiz/components/PlanMeter.tsx`
- Modify: `src/index.css` (após `@keyframes fadeSlideIn`, linha ~89)

**Interfaces:**
- Produces: `export interface Meter { pct: number; block: number; blockName: string; milestone?: string }` e `export default function PlanMeter({ meter }: { meter: Meter })` — consumidos pelo Task 2.

- [ ] **Step 1: keyframes em `src/index.css`** (logo após o bloco `@keyframes fadeSlideIn`):

```css
@keyframes drift {
  0%, 100% { transform: translateY(0) rotate(0deg); }
  50% { transform: translateY(-6px) rotate(12deg); }
}
@keyframes goldPulse {
  0%, 100% { filter: drop-shadow(0 0 0 rgba(217, 160, 91, 0)); }
  50% { filter: drop-shadow(0 0 10px rgba(217, 160, 91, 0.55)); }
}
```

- [ ] **Step 2: criar `src/quiz/components/PlanMeter.tsx`**:

```tsx
import { useEffect, useRef, useState } from 'react'

/*
 * PlanMeter — medidor de plano evolutivo dos ecos (momentum).
 * Dados declarativos via payload.meter (ver spec). O % conta do valor
 * anterior ao novo (count-up 1,2s ease-out cúbico) a cada eco; o anel
 * acompanha o mesmo valor animado. milestone = eco que fecha um bloco:
 * card dourado, anel dourado com brilho, selo + partículas discretas.
 */
export interface Meter {
  pct: number
  block: number
  blockName: string
  milestone?: string
}

const R = 27
const CIRC = 2 * Math.PI * R
const BLOCKS = 5

function useCountUp(target: number, duration = 1200): number {
  const [value, setValue] = useState(0)
  const prev = useRef(0)
  useEffect(() => {
    const from = prev.current
    let raf = 0
    const start = window.setTimeout(() => {
      const t0 = performance.now()
      const tick = (t: number) => {
        const k = Math.min((t - t0) / duration, 1)
        const e = 1 - Math.pow(1 - k, 3)
        setValue(Math.round(from + (target - from) * e))
        if (k < 1) raf = requestAnimationFrame(tick)
        else prev.current = target
      }
      raf = requestAnimationFrame(tick)
    }, 350)
    return () => { window.clearTimeout(start); cancelAnimationFrame(raf) }
  }, [target, duration])
  return value
}

const CONFETTI = [
  { top: 10, right: 18, size: 7, color: '#D9A05B', round: false, delay: 0 },
  { top: 26, right: 44, size: 5, color: '#B57E5B', round: false, delay: 0.4 },
  { bottom: 14, right: 26, size: 6, color: '#7D8F74', round: true, delay: 0.9 },
  { top: 14, right: 70, size: 5, color: '#D9A05B', round: true, delay: 1.3 },
] as const

export default function PlanMeter({ meter }: { meter: Meter }) {
  const pct = useCountUp(meter.pct)
  const milestone = Boolean(meter.milestone)
  const ringColor = milestone ? '#D9A05B' : '#B57E5B'

  return (
    <div
      className={`relative mt-6 flex w-full items-center gap-4 rounded-2xl border p-5 animate-[fadeSlideIn_0.4s_ease-out] ${
        milestone
          ? 'border-[#DED2C4] bg-gradient-to-br from-[#FDF9F4] to-[#FBF3EA]'
          : 'border-[#E7E2DA] bg-white'
      }`}
    >
      {milestone &&
        CONFETTI.map((c, i) => (
          <span
            key={i}
            className="absolute animate-[drift_2.8s_ease-in-out_infinite]"
            style={{
              top: 'top' in c ? c.top : undefined,
              bottom: 'bottom' in c ? c.bottom : undefined,
              right: c.right,
              width: c.size,
              height: c.size,
              background: c.color,
              borderRadius: c.round ? '50%' : 2,
              opacity: 0.9,
              animationDelay: `${c.delay}s`,
            }}
          />
        ))}

      <div className={`relative h-16 w-16 shrink-0 ${milestone ? 'animate-[goldPulse_1.8s_ease-in-out_infinite]' : ''}`}>
        <svg width="64" height="64" viewBox="0 0 64 64" className="-rotate-90">
          <circle cx="32" cy="32" r={R} fill="none" stroke="#F3EFE8" strokeWidth="6" />
          <circle
            cx="32" cy="32" r={R} fill="none"
            stroke={ringColor} strokeWidth="6" strokeLinecap="round"
            strokeDasharray={CIRC} strokeDashoffset={CIRC * (1 - pct / 100)}
          />
        </svg>
        <span className="absolute inset-0 flex items-center justify-center text-base font-extrabold tracking-tight text-[#1C1917]">
          {pct}%
        </span>
      </div>

      <div className="min-w-0 flex-1">
        <p className="text-[10.5px] font-semibold uppercase tracking-[0.16em] text-[#A8A29E]">Seu plano</p>
        <p className="mt-0.5 text-[14.5px] font-semibold text-[#1C1917]">{pct}% montado</p>
        <p className="mt-0.5 text-[12.5px] text-[#78716C]">Bloco {meter.block} de {BLOCKS} · {meter.blockName}</p>
        <div className="mt-2 flex gap-1">
          {Array.from({ length: BLOCKS }, (_, i) => (
            <span
              key={i}
              className="h-1 flex-1 rounded-full"
              style={{
                background:
                  i < meter.block - 1 ? '#B57E5B'
                  : i === meter.block - 1 ? 'linear-gradient(90deg,#B57E5B 40%,#F3EFE8 40%)'
                  : '#F3EFE8',
              }}
            />
          ))}
        </div>
        {milestone && (
          <span className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-[#7D8F74] px-3 py-1.5 text-xs font-semibold text-white">
            <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="#fff" strokeWidth="3">
              <path d="M4 12l5 5L20 6" />
            </svg>
            {meter.milestone}
          </span>
        )}
      </div>
    </div>
  )
}
```

- [ ] **Step 3: typecheck**

Run: `cd /mnt/agents/output/app && npx tsc --noEmit`
Expected: PASS sem erros em PlanMeter.

- [ ] **Step 4: Commit**

```bash
git add src/quiz/components/PlanMeter.tsx src/index.css
git commit -m "feat: PlanMeter — anel de progresso do plano com estado de marco"
```

---

### Task 2: Integração no Interstitial

**Files:**
- Modify: `src/quiz/templates/Interstitial.tsx` (imports linha 1–6; render após ProofBlock linha ~138)

**Interfaces:**
- Consumes: `Meter` + `PlanMeter` do Task 1.

- [ ] **Step 1: import + leitura do payload**

Adicionar ao bloco de imports:

```tsx
import PlanMeter, { type Meter } from '../components/PlanMeter'
```

Após `const proof = p.proof as Proof | undefined`:

```tsx
const meter = p.meter as Meter | undefined
```

- [ ] **Step 2: render depois do proof, antes do CTA**

Substituir a linha `{proof && <ProofBlock proof={proof} answers={answers} />}` por:

```tsx
        {proof && <ProofBlock proof={proof} answers={answers} />}

        {/* PlanMeter — momentum: % do plano montado, em todos os ecos */}
        {meter && <PlanMeter meter={meter} />}
```

- [ ] **Step 3: typecheck + build smoke**

Run: `npx tsc --noEmit && npm run build`
Expected: PASS.

- [ ] **Step 4: Commit**

```bash
git add src/quiz/templates/Interstitial.tsx
git commit -m "feat: render PlanMeter nos ecos (após proof, antes do CTA)"
```

---

### Task 3: Validação copy-qa (red — escrever antes dos dados)

**Files:**
- Modify: `scripts/copy-qa.ts` (após o bloco "D-provaResposta", ~linha 120)

**Interfaces:**
- Consumes: `funnel.screens` (ordem da jornada) com `s.id`, `s.template`, `s.payload`.

- [ ] **Step 1: adicionar bloco de validação ao final do script (antes do resumo `fail`)**:

```ts
/* PlanMeter — todo eco tem meter; pct 1–99 crescente; milestone só nos marcos */
{
  const MILESTONES: Record<string, number> = {
    'i-goal': 15, 'i-activity': 35, 'i-jejum': 55, 'i-authority': 75, 'social-proof-2': 95,
  }
  const bad: string[] = []
  let prevPct = 0, prevBlock = 0, ecos = 0
  for (const s of funnel.screens) {
    if (s.template !== 'interstitial') continue
    ecos++
    const m = (s.payload ?? {}).meter as { pct?: number; block?: number; blockName?: string; milestone?: string } | undefined
    if (!m) { bad.push(`${s.id}: eco sem meter`); continue }
    if (!Number.isInteger(m.pct) || m.pct! < 1 || m.pct! > 99) bad.push(`${s.id}: pct inválido '${m.pct}'`)
    else if (m.pct! <= prevPct) bad.push(`${s.id}: pct ${m.pct} não cresce (anterior ${prevPct})`)
    if (!Number.isInteger(m.block) || m.block! < 1 || m.block! > 5) bad.push(`${s.id}: block inválido '${m.block}'`)
    else if (m.block! < prevBlock) bad.push(`${s.id}: block ${m.block} retrocede (anterior ${prevBlock})`)
    if (!m.blockName) bad.push(`${s.id}: sem blockName`)
    const isMarco = s.id in MILESTONES
    if (isMarco && m.milestone === undefined) bad.push(`${s.id}: marco sem milestone`)
    if (!isMarco && m.milestone !== undefined) bad.push(`${s.id}: milestone fora de marco`)
    if (isMarco && m.pct !== MILESTONES[s.id]) bad.push(`${s.id}: marco deveria ter pct ${MILESTONES[s.id]}, tem ${m.pct}`)
    prevPct = m.pct ?? prevPct
    prevBlock = m.block ?? prevBlock
  }
  if (ecos !== 16) bad.push(`esperava 16 ecos, achei ${ecos}`)
  if (bad.length) { bad.forEach((b) => console.log(`❌ meter — ${b}`)); fail += bad.length }
  else console.log(`✅ medidor de plano: ${ecos} ecos, 0 problemas`)
}
```

- [ ] **Step 2: rodar e confirmar RED**

Run: `npx tsx scripts/copy-qa.ts`
Expected: ❌ `eco sem meter` ×16.

- [ ] **Step 3: Commit**

```bash
git add scripts/copy-qa.ts
git commit -m "test(copy-qa): validação do meter dos ecos (red)"
```

---

### Task 4: Dados — meter nos 16 ecos dos dois JSONs

**Files:**
- Modify: `src/funnels/pilates.json`
- Modify: `public/funnels/pilates.json` (cópia idêntica)

**Interfaces:**
- Consumes: shape `Meter` do Task 1. Valores:

| eco | pct | block | blockName | milestone |
|---|---|---|---|---|
| social-proof | 4 | 1 | Começo | — |
| i-welcome | 8 | 1 | Começo | — |
| i-goal | 15 | 1 | Começo | Bloco Começo completo |
| i-diagnosis | 22 | 2 | Seu corpo | — |
| i-foco | 28 | 2 | Seu corpo | — |
| i-activity | 35 | 2 | Seu corpo | Bloco Seu corpo completo |
| i-adaptacao | 38 | 3 | Sua rotina | — |
| i-energy | 46 | 3 | Sua rotina | — |
| i-jejum | 55 | 3 | Sua rotina | Bloco Sua rotina completo |
| i-meal-preview | 63 | 4 | Alimentação | — |
| i-authority | 75 | 4 | Alimentação | Bloco Alimentação completo |
| i-mamae | 78 | 5 | Seu plano | — |
| i-menopausa | 81 | 5 | Seu plano | — |
| i-alinhamento | 85 | 5 | Seu plano | — |
| i-awards | 90 | 5 | Seu plano | — |
| social-proof-2 | 95 | 5 | Seu plano | Bloco Seu plano completo |

- [ ] **Step 1: script Python que injeta `meter` nos 16 ecos e sincroniza os dois JSONs**:

```python
import json, shutil

METER = {
  'social-proof':   {'pct': 4,  'block': 1, 'blockName': 'Começo'},
  'i-welcome':      {'pct': 8,  'block': 1, 'blockName': 'Começo'},
  'i-goal':         {'pct': 15, 'block': 1, 'blockName': 'Começo', 'milestone': 'Bloco Começo completo'},
  'i-diagnosis':    {'pct': 22, 'block': 2, 'blockName': 'Seu corpo'},
  'i-foco':         {'pct': 28, 'block': 2, 'blockName': 'Seu corpo'},
  'i-activity':     {'pct': 35, 'block': 2, 'blockName': 'Seu corpo', 'milestone': 'Bloco Seu corpo completo'},
  'i-adaptacao':    {'pct': 38, 'block': 3, 'blockName': 'Sua rotina'},
  'i-energy':       {'pct': 46, 'block': 3, 'blockName': 'Sua rotina'},
  'i-jejum':        {'pct': 55, 'block': 3, 'blockName': 'Sua rotina', 'milestone': 'Bloco Sua rotina completo'},
  'i-meal-preview': {'pct': 63, 'block': 4, 'blockName': 'Alimentação'},
  'i-authority':    {'pct': 75, 'block': 4, 'blockName': 'Alimentação', 'milestone': 'Bloco Alimentação completo'},
  'i-mamae':        {'pct': 78, 'block': 5, 'blockName': 'Seu plano'},
  'i-menopausa':    {'pct': 81, 'block': 5, 'blockName': 'Seu plano'},
  'i-alinhamento':  {'pct': 85, 'block': 5, 'blockName': 'Seu plano'},
  'i-awards':       {'pct': 90, 'block': 5, 'blockName': 'Seu plano'},
  'social-proof-2': {'pct': 95, 'block': 5, 'blockName': 'Seu plano', 'milestone': 'Bloco Seu plano completo'},
}

src = 'src/funnels/pilates.json'
d = json.load(open(src))
patched = 0
for s in d['screens']:
    if s['id'] in METER:
        s.setdefault('payload', {})['meter'] = METER[s['id']]
        patched += 1
assert patched == 16, patched
with open(src, 'w') as f:
    json.dump(d, f, ensure_ascii=False, indent=2)
    f.write('\n')
shutil.copy(src, 'public/funnels/pilates.json')
print(f'OK: {patched} ecos com meter')
```

- [ ] **Step 2: rodar copy-qa e confirmar GREEN**

Run: `npx tsx scripts/copy-qa.ts`
Expected: `✅ medidor de plano: 16 ecos, 0 problemas` + `🎉 COPY QA VERDE`.

- [ ] **Step 3: `diff` dos dois JSONs vazio** (`diff src/funnels/pilates.json public/funnels/pilates.json`).

- [ ] **Step 4: Commit**

```bash
git add src/funnels/pilates.json public/funnels/pilates.json
git commit -m "feat: meter declarativo nos 16 ecos (5 blocos, marcos 15/35/55/75/95)"
```

---

### Task 5: QA visual + build íntegro + versão

**Files:**
- Nenhum (verificação).

- [ ] **Step 1: build com loop de integridade** (até 6 tentativas; assets≥2, icons=100, funnels=1).

- [ ] **Step 2: Playwright 390×844** (server + teste na mesma célula; seed zustand com `funnelSlug:'pilates'`):
  - `#/quiz/i-foco` (answers `{focusZones:['bracos']}`) — eco comum: proof 63% + anel 28% terracota + "Bloco 2 de 5 · Seu corpo";
  - `#/quiz/i-goal` (answers `{goal:'perder-peso'}`) — eco-marco: card dourado, anel 15% dourado, selo "Bloco Começo completo", partículas;
  - `#/quiz/i-adaptacao` — eco sem proof: medidor sozinho acima do CTA.
  Aguardar ≥1,6s para o count-up terminar antes do screenshot.

- [ ] **Step 3: inspeção visual dos 3 screenshots** — anel preenchido, % correto, selo só no marco, sem overflow.

- [ ] **Step 4: salvar versão** (`build_version`, type `static`, project_dir `/mnt/agents/output/app`, message ≤ 6 palavras: "Medidor de plano nos ecos").

- [ ] **Step 5: commit final da spec/plan se pendente + atualizar `mapa-visual.md` e `journey-skeleton.json`** (D-medidorPlano: ✅ implementado).
