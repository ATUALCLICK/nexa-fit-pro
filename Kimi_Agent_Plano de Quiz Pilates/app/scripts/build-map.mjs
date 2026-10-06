/*
 * Gera o mapeamento navegável do funil:
 *   - public/mapa-fluxo.html  (mapa interativo: telas, transições, rotas, objetivos)
 *   - /mnt/agents/output/mapeamento-telas-objetivos.md (registro técnico-estratégico)
 * Uso: node scripts/build-map.mjs
 */
import { readFileSync, writeFileSync } from 'node:fs'

const funnel = JSON.parse(readFileSync('src/funnels/pilates.json', 'utf8'))

/* ---------- registro tela a tela: análise técnica + estratégica ---------- */
const OBJ = {
  'age':            { n: 'N0→N1', f: 'Segmentação instantânea por faixa etária; primeiro micro-compromisso (1 clique).', d: 'ageBucket → {{ageLabel}} (prova social), persona madura 55+', a: 'Fricção quase zero + cards visuais: a porta de entrada mais barata possível.' },
  'social-proof':   { n: 'N1', f: 'Ancoragem de relevância ("98 mil mulheres na SUA faixa") + autoridade de mídia.', d: '— (consome ageBucket = 1ª personalização do funil)', a: 'Prova social + pertencimento logo na 2ª tela.' },
  'experience':     { n: 'N1', f: 'Calibra nível de experiência com Pilates.', d: 'experience → flag inicianteTotal, persona iniciante, {{pilatesLevel}}', a: 'Binária, resposta em <2s.' },
  'i-welcome':      { n: 'N1', f: 'Recompensa imediata; entrega a promessa central (suave, sem equipamento, em casa).', d: '—', a: 'Dopamina antecipada + desativa a objeção "não sei fazer".' },
  'goal':           { n: 'N1', f: 'Declaração do objetivo principal — eixo de copy do funil inteiro.', d: 'goal → @switch i-goal, diagnósticos D1/D2, email, plan-ready', a: 'Auto-compromisso declarado (consistência).' },
  'i-goal':         { n: 'N1→N2', f: 'Eco empático do objetivo + primeiro "nós sabemos como fazer" (solução implícita).', d: '— (4 variações via @switch)', a: 'Reciprocidade: ela fala, o funil responde.' },
  'secondary-goals':{ n: 'N1→N2', f: 'Enriquece motivações secundárias (multi-seleção).', d: 'secondaryGoals → {{secundarios}} (badge plan-ready)', a: 'Mais cliques = mais investimento (sunk cost).' },
  'body-type':      { n: 'N1→N2', f: 'Auto-avaliação corporal por silhuetas (sem números ainda).', d: 'bodyType → diagnóstico D3', a: 'Visual > texto: decisão rápida, baixa carga.' },
  'dream-body':     { n: 'N2', f: 'Visualização da meta — cria o gap atual × desejado.', d: 'dreamBody → dreamLabels no checkout', a: 'Tensão aspiracional (a motivação do funil inteiro).' },
  'best-shape':     { n: 'N2', f: '"Há quanto tempo esteve na melhor forma?" — ativa nostalgia e perda.', d: 'bestShape → detecção cética', a: 'Aversão à perda.' },
  'weight-pattern': { n: 'N2', f: 'Calibra a narrativa metabólica (peso difícil de perder).', d: 'weightPattern → D2/D2b, flag transicaoRaw', a: 'Explica "por que outras tentativas falharam" sem culpar ela.' },
  'i-diagnosis':    { n: 'N2 ★', f: 'PAYOFF: nomeia o problema (1 de 8 diagnósticos dinâmicos). Maior virada de consciência da 1ª metade.', d: '— (consome tudo até aqui)', a: 'Rótulo = identificação ("isso sou eu"). Posicionado cedo (tela 12/62) como hook.' },
  'flexibility':    { n: 'N2', f: 'Baseline de flexibilidade auto-reportada.', d: 'flexibility → {{flexibilityLabel}}', a: 'Início do bloco de "medição" (streak física 1/4).' },
  'frequency':      { n: 'N2', f: 'Baseline de frequência de exercício.', d: 'frequency → inicianteTotal, cética', a: 'Streak física 2/4.' },
  'focus-zones':    { n: 'N2', f: 'Escolha das zonas-alvo do corpo (multi).', d: 'focusZones → {{foco}} (i-foco, card Foco)', a: 'Agência: ela "monta" o próprio plano.' },
  'i-foco':         { n: 'N2', f: 'Recompensa do meio do bloco (P0): ecoa as zonas e enquadra as próximas perguntas como "medição com propósito".', d: '— ({{foco}})', a: 'Quebra o maior streak do funil (7→4); reforça agência.' },
  'plank':          { n: 'N2', f: 'Teste de força imaginado (prancha).', d: 'plank → D3, {{pilatesLevel}}', a: 'Auto-exposição física — custo emocional alto, já blindado por i-foco.' },
  'toe-touch':      { n: 'N2', f: 'Teste de flexibilidade imaginado.', d: 'toeTouch → D4', a: 'Idem.' },
  'balance':        { n: 'N2', f: 'Teste de equilíbrio; variante 55+ troca para "firmeza ao descer escadas".', d: 'balance → {{pilatesLevel}}', a: 'Variante por persona: pergunta relevante para a idade dela.' },
  'pain-points':    { n: 'N2', f: 'Mapeamento de dores (multi).', d: 'painPoints → dorCronica, {{dorAlvo}}, i-adaptacao, FAQ checkout', a: 'Footnote médica = segurança; exclusiva "Nenhuma" preserva qualidade do dado.' },
  'i-activity':     { n: 'N2→N3', f: 'Recompensa do bloco físico; promessa adaptada à dor ({{dorAlvoFrase}}).', d: '—', a: 'Alívio de objeção física ("dá pra fazer mesmo com dor").' },
  'i-adaptacao':    { n: 'N3 ◆', f: 'CONDICIONAL (dor ≠ nenhuma): prova cirúrgica de adaptação à região dela ({{dorAdaptacao}}).', d: '—', a: '"O plano é seguro pra MIM" — personalização visível.' },
  'work-routine':   { n: 'N2', f: 'Contexto de agenda/trabalho.', d: 'workRoutine → (contexto)', a: 'Pergunta neutra de baixo custo (respiro pós-bloco físico).' },
  'typical-day':    { n: 'N2', f: 'Mede sedentarismo do dia típico.', d: 'typicalDay → D5, persona executiva', a: 'Neutra.' },
  'energy':         { n: 'N2', f: 'Mapeia a dor energética do dia.', d: 'energy → @switch i-energy', a: 'Amplia o problema para além do corpo.' },
  'i-energy':       { n: 'N2→N3', f: 'Reframe: Pilates como solução de ENERGIA, não só de estética.', d: '— (4 variações)', a: 'Benefício funcional imediato — nova razão para continuar.' },
  'water':          { n: 'N2', f: 'Hábito de hidratação.', d: 'water → boost hidratação no checkout', a: 'Nota educativa (250ml) reduz ambiguidade.' },
  'sleep':          { n: 'N2', f: 'Hábito de sono.', d: 'sleep → (objetivo secundário sono)', a: 'Streak nutrição 1/6.' },
  'stress':         { n: 'N2', f: 'Nível de estresse.', d: 'stress → persona executiva, boost respiração no checkout', a: 'Conecta corpo × mente.' },
  'breakfast':      { n: 'N2', f: 'Rotina alimentar 1/3 (café da manhã).', d: 'breakfast → flag jejum, {{refeicaoPulada}}', a: 'Sequência ritualística rápida.' },
  'lunch':          { n: 'N2', f: 'Rotina alimentar 2/3.', d: 'lunch → flag jejum', a: 'Idem.' },
  'dinner':         { n: 'N2', f: 'Rotina alimentar 3/3.', d: 'dinner → flag jejum', a: 'Idem.' },
  'i-jejum':        { n: 'N2→N3', f: 'Recompensa INCONDICIONAL do bloco nutrição (P0); variante jejum introduz jejum intermitente orientado.', d: '—', a: 'Todo mundo recebe payoff na 6ª tela; quem pula refeição recebe espelho exato.' },
  'diet-type':      { n: 'N2→N3', f: 'Preferência alimentar — 10 dietas em 4 grupos.', d: 'dietType → variante diet-*, mealsByDiet', a: 'Inclusão ("tem a MINHA dieta") + layout agrupado escaneável.' },
  'i-meal-preview': { n: 'N3 ★', f: 'PAYOFF tangível: 3 refeições da dieta DELA com kcal/min.', d: '—', a: 'Concretude de valor ANTES do pedido de dados pessoais.' },
  'bad-habits':     { n: 'N2', f: 'Hábitos sabotadores (multi).', d: 'badHabits → (copy futura)', a: 'Autoria do diagnóstico: ela mesma lista os vilões.' },
  'cravings':       { n: 'N2', f: 'Vontades alimentares específicas (multi).', d: 'cravings → (copy futura)', a: 'Idem; streak curto antes da autoridade.' },
  'i-authority':    { n: 'N3', f: 'Credenciais das especialistas (BASI, fisio, nutri).', d: '—', a: 'Autoridade (Cialdini) posicionada exatamente ANTES do pedido invasivo de dados corporais.' },
  'height':         { n: 'N3', f: 'Input corporal 1/4 + consentimento de dados de saúde.', d: 'height → IMC', a: 'Consent blindado pela autoridade; toggle CM/FT.' },
  'weight':         { n: 'N3', f: 'Input corporal 2/4.', d: 'weight → IMC, projeção', a: 'Feedback de IMC instantâneo transforma input em recompensa.' },
  'goal-weight':    { n: 'N3', f: 'Input corporal 3/4 — o número do sonho.', d: 'goalWeight → projeção, confidence, checkout', a: 'Feedback "% da meta" instantâneo.' },
  'age-input':      { n: 'N3', f: 'Input corporal 4/4.', d: 'ageYears → (refino)', a: 'Justificativa embutida (sarcopenia) responde "por que perguntam isso".' },
  'loading-analysis':{ n: 'N3', f: 'Processamento percebido (4 barras por seção).', d: '—', a: 'Labor illusion: "estão trabalhando pra mim" + badge 40 países.' },
  'wellness-profile':{ n: 'N3 ★', f: 'PAYOFF MÁXIMO do quiz: perfil completo (IMC + diagnóstico + nível + flexibilidade + foco).', d: '—', a: 'Prova de personalização: "o plano me conhece". Consolida N3.' },
  'weight-triggers':{ n: 'N3→N4', f: 'Causa emocional do ganho de peso (multi).', d: 'weightTriggers → personas mamae/transição', a: 'Empatia situacional; abre as rotas dinâmicas emocionais.' },
  'i-mamae':        { n: 'N4 ◆', f: 'CONDICIONAL (gravidez/pós-parto): validação da fase — "seu corpo passou por uma transformação enorme".', d: '—', a: '"Finalmente algo pra MINHA fase" — maior pico emocional da rota mamãe.' },
  'q-liberacao':    { n: 'N4 ◆', f: 'CONDICIONAL: liberação médica pós-parto.', d: 'liberacaoMedica → intensidade inicial', a: 'Cuidado explícito = confiança; única pergunta exclusiva de rota.' },
  'i-menopausa':    { n: 'N4 ◆', f: 'CONDICIONAL (menopausa/metabolismo): "seu corpo mudou as regras — o método também precisa mudar".', d: '—', a: 'Valida a frustração hormonal sem prometer milagre.' },
  'event':          { n: 'N3→N4', f: 'Gancho temporal: evento importante chegando?', d: 'event → branch (event-date × i-alinhamento)', a: 'Deadline natural = motivador concreto.' },
  'event-date':     { n: 'N4 ◆', f: 'CONDICIONAL (evento ≠ nenhum): data do evento (pulável).', d: 'eventDate → flag metaAgressiva (>8% até a data)', a: 'Compromisso com data; "Pular" preserva quem não quer dizer.' },
  'i-alinhamento':  { n: 'N4 ◆', f: 'CONDICIONAL (meta agressiva): gestão de expectativa — "ambiciosa, e vamos em etapas".', d: '—', a: 'Anti-decepção = anti-abandono/anti-reembolso no futuro.' },
  'projection':     { n: 'N4 ★', f: 'PROPULSOR-MOR do funil: gráfico peso→meta com data + quote da instrutora.', d: '— ({{goalWeight}} {{projectionDate}})', a: 'Concretização do futuro: desejo vira plano com data.' },
  'main-reason':    { n: 'N4', f: 'Declaração emocional final ("por que essa transformação?").', d: 'mainReason → headline do checkout, persona mamae', a: 'Consistência (Cialdini): ela disse o porquê — o checkout cobra.' },
  'confidence':     { n: 'N4', f: 'Declaração de confiança na meta.', d: 'confidence → persona cética', a: 'Compromisso; quem duvida recebe a variante certa na tela seguinte.' },
  'i-awards':       { n: 'N4', f: 'Resposta à dúvida recém-declarada: prêmios/confiabilidade; variante cética = garantia 30 dias.', d: '—', a: 'Redução de risco no ponto mais cético do funil.' },
  'loading-plan':   { n: 'N4', f: 'Labor illusion final + 3 depoimentos + "Seu plano está 100% pronto!".', d: '—', a: 'Antecipação máxima antes do pedido de email (blindagem P0).' },
  'social-proof-2': { n: 'N4', f: 'Reblindagem de prova social (repete tela 2, intencional).', d: '—', a: 'Segurança de pertencimento imediatamente antes da fricção.' },
  'email':          { n: 'N4 ⚠', f: 'Captura de lead — MAIOR fricção de valor do funil.', d: 'email → (envio do plano)', a: 'Blindagens: headline {{goalLabel}}, micro-prova ★312 mil, privacy note, plano "100% pronto" na tela anterior.' },
  'name':           { n: 'N4', f: 'Captura de nome (fricção baixa pós-email).', d: 'name → {{firstName}} (plan-ready)', a: 'Compromisso escalonado: depois do email, o nome é fácil.' },
  'plan-ready':     { n: 'N4 ★', f: 'PAYOFF pessoal: nome em destaque + plano pronto + badges dinâmicas + meta com data.', d: '—', a: 'Possessão ("é MEU plano") — efeito dotação.' },
  'country':        { n: 'N4', f: 'Segmentação de país para a oferta.', d: 'country → (oferta)', a: 'Pergunta leve posicionada DEPOIS do payoff — custo mínimo.' },
  'scratch':        { n: 'N4→💰', f: 'Dopamina final: raspadinha revela 30% + countdown de 4s empurra ao checkout.', d: 'scratched → analytics', a: 'Recompensa variável (jogo) + urgência imediata.' },
}

/* ---------- máquina de caminhos (port do runtime) ---------- */
const S = funnel.screens
const MAP = new Map(S.map((s) => [s.id, s]))
const pct = (a) => {
  const w = Number(a.weight), g = Number(a.goalWeight)
  return w && g && g < w ? Math.round(((w - g) / w) * 100) : 0
}
function cond(c, a, flags) {
  const key = c.key
  let raw
  if (key.startsWith('$flag:')) raw = flags[key.slice(6)]
  else if (key.startsWith('$calc:')) raw = key === '$calc:goalPct' ? pct(a) : 0
  else raw = a[key]
  const arr = Array.isArray(raw) ? raw : null
  const num = typeof raw === 'number' ? raw : null
  switch (c.op) {
    case 'eq': return raw === c.value
    case 'neq': return raw !== c.value
    case 'in': return (c.value || []).includes(raw)
    case 'not-in': return !(c.value || []).includes(raw)
    case 'includes': return !!arr && arr.includes(c.value)
    case 'excludes': return !!arr && !arr.includes(c.value)
    case 'empty': return raw === undefined || raw === '' || (!!arr && arr.length === 0)
    case 'not-empty': return raw !== undefined && raw !== '' && (!arr || arr.length > 0)
    case 'gt': return num !== null && num > Number(c.value)
    case 'gte': return num !== null && num >= Number(c.value)
    case 'lt': return num !== null && num < Number(c.value)
    case 'lte': return num !== null && num <= Number(c.value)
    case 'truthy': return !!raw
    case 'falsy': return !raw
    default: return false
  }
}
function rule(r, a, flags) {
  if (!r) return true
  if (r.all) return r.all.every((x) => rule(x, a, flags))
  if (r.any) return r.any.some((x) => rule(x, a, flags))
  if (r.not) return !rule(r.not, a, flags)
  return cond(r, a, flags)
}
function flagsOf(a) {
  const f = {}
  for (const [k, r] of Object.entries(funnel.icp.flags)) f[k] = rule(r, a, f)
  return f
}
function nextId(s, a, flags) {
  if (!s.next) return S[S.length - 1].id
  let id = typeof s.next === 'string' ? s.next
    : (s.next.cases.find((c) => rule(c.when, a, flags))?.goto ?? s.next.default)
  let hops = 0
  while (hops++ < 10) {
    const t = MAP.get(id)
    if (!t || !t.guard || rule(t.guard, a, flags)) return id
    id = typeof t.next === 'string' ? t.next
      : (t.next.cases.find((c) => rule(c.when, a, flags))?.goto ?? t.next?.default) ?? id
  }
  return id
}
function walk(a) {
  const flags = flagsOf(a)
  const path = []
  let cur = S[0]
  let hops = 0
  while (cur && hops++ < 100) {
    path.push(cur.id)
    if (cur.template === 'scratch') break
    const n = nextId(cur, a, flags)
    if (n === cur.id) break
    cur = MAP.get(n)
  }
  return path
}

const paths = {}
for (const [name, over] of Object.entries(funnel.qa.personas)) {
  paths[name] = walk({ ...funnel.qa.base, ...over })
}

/* ---------- descrição legível de regras ---------- */
function ruleText(r) {
  if (!r) return ''
  if (r.all) return r.all.map(ruleText).join(' E ')
  if (r.any) return r.any.map(ruleText).join(' OU ')
  if (r.not) return `NÃO(${ruleText(r.not)})`
  const ops = { eq: '=', neq: '≠', in: '∈', includes: '∋', excludes: '∌', 'not-empty': 'preenchido', truthy: 'ativo' }
  return `${r.key} ${ops[r.op] ?? r.op} ${Array.isArray(r.value) ? r.value.join('|') : r.value ?? ''}`.trim()
}
function edgesText(s) {
  if (!s.next) return []
  if (typeof s.next === 'string') return [{ t: `→ ${s.next}`, cond: false }]
  const out = s.next.cases.map((c) => ({ t: `⤳ se ${ruleText(c.when)} → ${c.goto}`, cond: true }))
  out.push({ t: `→ senão: ${s.next.default}`, cond: false })
  return out
}

/* ---------- dados para o HTML ---------- */
const nodes = S.map((s, i) => ({
  i: i + 1,
  id: s.id,
  template: s.template,
  section: s.section,
  cfp: s.countsForProgress,
  saveAs: s.saveAs ?? null,
  guard: s.guard ? ruleText(s.guard) : null,
  edges: edgesText(s),
  artwork: s.artwork ?? null,
  headline: typeof s.payload?.headline === 'string' ? s.payload.headline
    : (s.payload?.headline?.['@switch'] ? `⎇ switch por ${s.payload.headline['@switch'].key}` : null),
  variants: s.payload?.variants ? Object.keys(s.payload.variants) : [],
  obj: OBJ[s.id] ?? null,
}))

const pathData = Object.fromEntries(Object.entries(paths).map(([k, v]) => [k, v]))
const linear = paths.linear
const diff = {}
for (const [k, v] of Object.entries(paths)) {
  diff[k] = { plus: v.filter((x) => !linear.includes(x)), minus: linear.filter((x) => !v.includes(x)) }
}

const KIND = { 'question-single': 'Q', 'question-multi': 'Q', 'select-cards': 'Q', 'input-measure': 'I' }
const kindOf = (t) => KIND[t] ?? 'R'
const counts = { Q: 0, I: 0, R: 0 }
S.forEach((s) => counts[kindOf(s.template)]++)

/* ---------- HTML ---------- */
const html = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>Mapa do Funil — ${funnel.meta.product}</title>
<style>
  :root { --bg:#FAF7F2; --ink:#1C1917; --mut:#78716C; --line:#E7E2DA; --sage:#7D8F74; --terra:#B57E5B; --violet:#7C6AAE; --amber:#D9A05B; }
  * { box-sizing: border-box; margin: 0; }
  body { background: var(--bg); color: var(--ink); font: 14px/1.5 -apple-system, 'Segoe UI', system-ui, sans-serif; }
  header { position: sticky; top: 0; z-index: 50; background: rgba(250,247,242,.96); backdrop-filter: blur(8px); border-bottom: 1px solid var(--line); padding: 12px 20px; }
  h1 { font-size: 17px; } .stats { color: var(--mut); font-size: 12px; margin-top: 2px; }
  .chips { display: flex; gap: 6px; flex-wrap: wrap; margin-top: 10px; }
  .chip { border: 1px solid var(--line); background: #fff; border-radius: 999px; padding: 4px 12px; font-size: 12px; cursor: pointer; font-weight: 600; color: var(--mut); }
  .chip.on { background: var(--ink); color: #fff; border-color: var(--ink); }
  .layout { display: grid; grid-template-columns: minmax(0,700px) minmax(300px,1fr); gap: 20px; max-width: 1200px; margin: 0 auto; padding: 20px; }
  @media (max-width: 900px) { .layout { grid-template-columns: 1fr; } }
  .node { background: #fff; border: 1px solid var(--line); border-left: 4px solid var(--mut); border-radius: 12px; padding: 10px 14px; cursor: pointer; transition: opacity .2s, transform .1s; }
  .node:hover { transform: translateX(2px); }
  .node.kQ { border-left-color: var(--ink); } .node.kI { border-left-color: var(--amber); } .node.kR { border-left-color: var(--sage); }
  .node.cond { border-left-style: dashed; border-left-color: var(--violet); }
  .node.star { box-shadow: 0 0 0 1px var(--sage) inset; }
  .node.dim { opacity: .25; }
  .node.sel { outline: 2px solid var(--terra); }
  .nhead { display: flex; align-items: baseline; gap: 8px; flex-wrap: wrap; }
  .nnum { color: var(--mut); font-size: 11px; font-variant-numeric: tabular-nums; }
  .nid { font-weight: 700; font-family: ui-monospace, monospace; font-size: 13px; }
  .badge { font-size: 10px; font-weight: 700; padding: 1px 7px; border-radius: 999px; background: #F3EFE8; color: var(--mut); }
  .badge.kQ { background:#292524; color:#fff; } .badge.kI { background: var(--amber); color:#fff; } .badge.kR { background: var(--sage); color:#fff; }
  .badge.cond { background: var(--violet); color: #fff; }
  .badge.star { background: transparent; color: var(--sage); }
  .nhead2 { color: var(--mut); font-size: 12px; margin-top: 3px; }
  .nobj { font-size: 12.5px; margin-top: 5px; }
  .edges { margin: 0 0 0 22px; padding: 3px 0 3px 12px; border-left: 2px solid var(--line); }
  .edge { font-size: 11.5px; color: var(--mut); font-family: ui-monospace, monospace; }
  .edge.c { color: var(--violet); font-weight: 600; }
  .secdiv { margin: 22px 0 8px; font-size: 11px; font-weight: 800; letter-spacing: .12em; text-transform: uppercase; color: var(--terra); }
  #panel { position: sticky; top: 150px; align-self: start; background: #fff; border: 1px solid var(--line); border-radius: 14px; padding: 18px; max-height: calc(100vh - 170px); overflow: auto; }
  #panel h2 { font-size: 15px; font-family: ui-monospace, monospace; }
  #panel .row { margin-top: 10px; font-size: 12.5px; } #panel .k { font-size: 10px; font-weight: 800; letter-spacing: .1em; text-transform: uppercase; color: var(--mut); }
  #panel pre { background: #F3EFE8; border-radius: 8px; padding: 8px; font-size: 11px; white-space: pre-wrap; }
  .paths { max-width: 1200px; margin: 0 auto; padding: 0 20px 60px; }
  .pathcard { background: #fff; border: 1px solid var(--line); border-radius: 12px; padding: 14px; margin-top: 10px; }
  .pathcard h3 { font-size: 13px; } .pathcard .d { font-size: 12px; color: var(--mut); margin: 4px 0 8px; }
  .seq { display: flex; flex-wrap: wrap; gap: 4px; }
  .sq { font-size: 10.5px; font-family: ui-monospace, monospace; background: #F3EFE8; border-radius: 6px; padding: 2px 6px; }
  .sq.plus { background: var(--sage); color: #fff; font-weight: 700; }
  .legend { display: flex; gap: 14px; flex-wrap: wrap; font-size: 11px; color: var(--mut); margin-top: 8px; }
  .sw { display:inline-block; width:10px; height:10px; border-radius:3px; margin-right:4px; vertical-align:-1px; }
</style>
</head>
<body>
<header>
  <h1>Mapa do Funil — ${funnel.meta.product} (${funnel.meta.brand})</h1>
  <div class="stats">${S.length} telas · ${counts.Q} perguntas · ${counts.I} inputs · ${counts.R} recompensas · ${S.filter((s) => s.guard).length} condicionais · ★ telas-chave · ◆ condicionais de rota</div>
  <div class="chips" id="chips"></div>
  <div class="legend">
    <span><span class="sw" style="background:#292524"></span><b>Q</b> pergunta</span>
    <span><span class="sw" style="background:var(--amber)"></span><b>I</b> input</span>
    <span><span class="sw" style="background:var(--sage)"></span><b>R</b> recompensa</span>
    <span><span class="sw" style="background:var(--violet)"></span>condicional</span>
    <span>★ payoff/virada · N0–N4 nível de consciência</span>
  </div>
</header>
<div class="layout">
  <div id="flow"></div>
  <div id="panel"><p style="color:var(--mut);font-size:13px">Clique em uma tela para ver a análise técnica e estratégica.</p></div>
</div>
<div class="paths"><h2 style="margin-top:10px;font-size:16px">Todos os caminhos possíveis (${Object.keys(paths).length} personas simuladas)</h2><div id="paths"></div></div>
<script>
const NODES = ${JSON.stringify(nodes)};
const PATHS = ${JSON.stringify(pathData)};
const DIFF = ${JSON.stringify(diff)};
const SEC_LABEL = { none:'Entrada','meu-perfil':'Meu Perfil','atividade':'Atividade','estilo-de-vida':'Estilo de Vida','nutricao':'Nutrição','quase-la':'Quase Lá' };
let active = 'linear', sel = null;

const flow = document.getElementById('flow');
function renderChips(){
  const c = document.getElementById('chips');
  c.innerHTML = '';
  ['linear', ...Object.keys(PATHS).filter(k=>k!=='linear')].forEach(name=>{
    const b = document.createElement('button');
    b.className = 'chip' + (name===active?' on':'');
    const d = DIFF[name];
    b.textContent = name + (name!=='linear' && d ? (d.plus.length? ' +'+d.plus.length : ' ·') : '');
    b.onclick = ()=>{ active = name; renderChips(); renderFlow(); };
    c.appendChild(b);
  });
}
function renderFlow(){
  flow.innerHTML = '';
  const inPath = new Set(PATHS[active]);
  let lastSec = null;
  NODES.forEach(n=>{
    if (n.section !== lastSec) {
      lastSec = n.section;
      const d = document.createElement('div');
      d.className = 'secdiv';
      d.textContent = SEC_LABEL[lastSec] ?? lastSec;
      flow.appendChild(d);
    }
    const el = document.createElement('div');
    const k = n.template.startsWith('question')||n.template==='select-cards' ? 'kQ' : n.template==='input-measure' ? 'kI' : 'kR';
    el.className = 'node '+k+(n.guard?' cond':'')+(n.obj&&n.obj.n.includes('\\u2605')?' star':'')+(inPath.has(n.id)?'':' dim')+(sel===n.id?' sel':'');
    el.innerHTML = '<div class="nhead"><span class="nnum">'+String(n.i).padStart(2,'0')+'</span>'
      +'<span class="nid">'+n.id+'</span>'
      +'<span class="badge '+k+'">'+k.replace('k','')+'</span>'
      +(n.guard?'<span class="badge cond">condicional</span>':'')
      +(n.obj?'<span class="badge star">'+n.obj.n+'</span>':'')
      +(n.variants.length?'<span class="badge">⎇ '+n.variants.join(',')+'</span>':'')
      +'</div>'
      +(n.headline?'<div class="nhead2">'+n.headline.slice(0,90)+'</div>':'')
      +(n.obj?'<div class="nobj">'+n.obj.f+'</div>':'');
    el.onclick = ()=>{ sel = n.id; renderPanel(n); renderFlow(); };
    flow.appendChild(el);
    if (n.edges.length){
      const eg = document.createElement('div');
      eg.className = 'edges';
      n.edges.forEach(e=>{
        const t = document.createElement('div');
        t.className = 'edge'+(e.cond?' c':'');
        t.textContent = e.t;
        eg.appendChild(t);
      });
      flow.appendChild(eg);
    }
  });
}
function renderPanel(n){
  const p = document.getElementById('panel');
  p.innerHTML = '<h2>#'+n.i+' · '+n.id+'</h2>'
    +'<div class="row"><div class="k">Função estratégica</div>'+(n.obj?n.obj.f:'—')+'</div>'
    +'<div class="row"><div class="k">Nível de consciência</div>'+(n.obj?n.obj.n:'—')+'</div>'
    +'<div class="row"><div class="k">Alavanca / mecanismo</div>'+(n.obj?n.obj.a:'—')+'</div>'
    +'<div class="row"><div class="k">Dado capturado → uso</div>'+(n.obj?n.obj.d:'—')+'</div>'
    +'<div class="row"><div class="k">Template / seção</div>'+n.template+' · '+(SEC_LABEL[n.section]??n.section)+(n.cfp?' · conta no progresso':' · não conta')+'</div>'
    +(n.saveAs?'<div class="row"><div class="k">saveAs</div><pre>'+n.saveAs+'</pre></div>':'')
    +(n.guard?'<div class="row"><div class="k">Guarda (só entra se)</div><pre>'+n.guard+'</pre></div>':'')
    +'<div class="row"><div class="k">Transições</div><pre>'+(n.edges.map(e=>e.t).join('\\n')||'(fim)')+'</pre></div>'
    +(n.headline?'<div class="row"><div class="k">Headline</div>'+n.headline+'</div>':'')
    +(n.variants.length?'<div class="row"><div class="k">Variantes ativas por</div>'+n.variants.join(', ')+'</div>':'')
    +(n.artwork?'<div class="row"><div class="k">Artwork</div>'+n.artwork+'</div>':'');
}
function renderPaths(){
  const el = document.getElementById('paths');
  el.innerHTML = '';
  Object.entries(PATHS).forEach(([name, seq])=>{
    const d = DIFF[name];
    const card = document.createElement('div');
    card.className = 'pathcard';
    card.innerHTML = '<h3>'+name+' <span style="color:var(--mut);font-weight:400">'+seq.length+' telas</span></h3>'
      +'<div class="d">'+(name==='linear'?'caminho base':(d.plus.length?'+ '+d.plus.join(', '):'mesmas telas do linear — diverge o CONTEÚDO (variantes/plano)')+(d.minus.length?' · − '+d.minus.join(', '):''))+'</div>'
      +'<div class="seq">'+seq.map(id=>'<span class="sq'+(d.plus.includes(id)?' plus':'')+'">'+id+'</span>').join('')+'</div>';
    el.appendChild(card);
  });
}
renderChips(); renderFlow(); renderPaths();
</script>
</body>
</html>`

writeFileSync('public/mapa-fluxo.html', html)

/* ---------- Markdown ---------- */
const SEC = { none: 'Entrada', 'meu-perfil': 'Meu Perfil', atividade: 'Atividade', 'estilo-de-vida': 'Estilo de Vida', nutricao: 'Nutrição', 'quase-la': 'Quase Lá' }
const md = []
md.push('# Mapeamento Completo do Funil — Objetivo de Cada Tela\n')
md.push(`**Funil:** ${funnel.meta.product} (${funnel.meta.brand}) · **${S.length} telas:** ${counts.Q} perguntas · ${counts.I} inputs · ${counts.R} recompensas · ${S.filter((s) => s.guard).length} condicionais`)
md.push('**Níveis:** N0 curiosa → N1 problema → N2 solução → N3 produto → N4 pronta · ★ tela-chave · ◆ condicional\n')
md.push('---')
let lastSec = null
S.forEach((s, i) => {
  if (s.section !== lastSec) { lastSec = s.section; md.push(`\n## ${SEC[lastSec] ?? lastSec}\n`) }
  const o = OBJ[s.id] ?? { n: '—', f: '—', d: '—', a: '—' }
  md.push(`### ${String(i + 1).padStart(2, '0')} · \`${s.id}\` — ${kindOf(s.template)} · ${o.n}`)
  md.push(`- **Função estratégica:** ${o.f}`)
  md.push(`- **Dado → uso:** ${o.d}`)
  md.push(`- **Alavanca:** ${o.a}`)
  md.push(`- **Técnica:** ${s.template} · progresso: ${s.countsForProgress ? 'sim' : 'não'}${s.saveAs ? ` · saveAs \`${s.saveAs}\`` : ''}${s.guard ? ` · **guarda:** ${ruleText(s.guard)}` : ''}${edgesText(s).length ? ` · **transições:** ${edgesText(s).map((e) => e.t).join(' | ')}` : ''}${s.payload?.variants ? ` · **variantes:** ${Object.keys(s.payload.variants).join(', ')}` : ''}`)
  md.push('')
})
md.push('\n---\n\n## Todos os caminhos possíveis\n')
md.push('| Persona | Telas | Δ vs linear | Divergências de caminho | Divergências de conteúdo |')
md.push('|---|---|---|---|---|')
const CONTENT = {
  mamae: 'diagnóstico D1b, badge pós-parto, headline checkout, FAQ extra', menopausa: 'diagnóstico D2b, plano 12 semanas',
  madura55: 'pergunta balance adaptada (escadas), variante 55plus', dor: 'i-activity personalizada, FAQ dor primeiro',
  cetica: 'i-awards→garantia 30d, garantia antecipada no checkout', jejum: 'i-jejum personalizado (refeição pulada)',
  metaAgressiva: 'plano 12 semanas', inicianteTotal: 'plano 1 semana, badge plan-ready', vegana: 'refeições veganas no i-meal-preview', linear: '—',
}
for (const [name, seq] of Object.entries(paths)) {
  const d = diff[name]
  md.push(`| ${name} | ${seq.length} | ${seq.length - linear.length >= 0 ? '+' : ''}${seq.length - linear.length} | ${d.plus.length ? '+ ' + d.plus.join(', ') : '—'}${d.minus.length ? ' / − ' + d.minus.join(', ') : ''} | ${CONTENT[name] ?? '—'} |`)
}
md.push('\n### Sequências completas\n')
for (const [name, seq] of Object.entries(paths)) {
  md.push(`**${name}** (${seq.length}): ${seq.map((id) => `\`${id}\``).join(' → ')}\n`)
}
md.push('---\n\n## Checkout (destino de todos os caminhos)\n')
md.push('J1 hero (headline por mainReason + antes/depois) → J2 planos (pré-selecionado por persona, countdown) → garantia (antecipada p/ céticas) → incluídos (boost por estresse/água) → avaliações → histórias (persona primeiro) → FAQ (dinâmico por dor/pós-parto) → mídia → reviews → planos 2 → garantia → footer. CTA fixo no header. Modal de pagamento com resumo + desconto 30%.\n')
writeFileSync('/mnt/agents/output/mapeamento-telas-objetivos.md', md.join('\n'))

console.log(`OK — ${S.length} telas mapeadas · ${Object.keys(paths).length} caminhos · mapa-fluxo.html (${Math.round(html.length / 1024)}KB) · md gerado`)
