import type { Answers } from '../quiz/engine/types'

/* ---------- helpers de leitura ---------- */
const s = (a: Answers, k: string) => (typeof a[k] === 'string' ? (a[k] as string) : '')
const n = (a: Answers, k: string) => (typeof a[k] === 'number' ? (a[k] as number) : 0)
const arr = (a: Answers, k: string) => (Array.isArray(a[k]) ? (a[k] as string[]) : [])

/* ---------- idade ---------- */
export function ageLabel(a: Answers): string {
  switch (s(a, 'ageBucket')) {
    case '25-34': return 'casa dos 20 e 30 anos'
    case '35-44': return 'casa dos 30 e 40 anos'
    case '45-54': return 'casa dos 40 e 50 anos'
    default: return 'acima dos 50 anos'
  }
}

/* ---------- medidas ---------- */
export function bmi(a: Answers): number {
  const h = n(a, 'height') / 100
  const w = n(a, 'weight')
  if (!h || !w) return 0
  return Math.round((w / (h * h)) * 10) / 10
}

export function bmiBand(v: number): { label: string; ok: boolean } {
  if (v < 18.5) return { label: 'abaixo do peso', ok: false }
  if (v < 25) return { label: 'normal', ok: true }
  if (v < 30) return { label: 'acima do peso', ok: false }
  return { label: 'obesidade', ok: false }
}

export function goalPct(a: Answers): number {
  const w = n(a, 'weight')
  const g = n(a, 'goalWeight')
  if (!w || !g || g >= w) return 0
  return Math.round(((w - g) / w) * 100)
}

/* ---------- data da projeção ---------- */
function fmt(d: Date): string {
  return d.toLocaleDateString('pt-BR', { day: 'numeric', month: 'long' })
}

export function projectionDate(a: Answers): string {
  const w = n(a, 'weight')
  const g = n(a, 'goalWeight')
  const kg = Math.max(w - g, 1)
  const weeks = kg / 0.75
  const target = new Date()
  target.setDate(target.getDate() + Math.round(weeks * 7))

  // arredonda para o dia 1º ou 15 mais próximo
  const day = target.getDate()
  const rounded = new Date(target)
  if (day <= 8) rounded.setDate(1)
  else if (day <= 22) rounded.setDate(15)
  else { rounded.setMonth(rounded.getMonth() + 1); rounded.setDate(1) }

  // se a usuária definiu data de evento, usar a menor das duas
  const ev = s(a, 'eventDate')
  if (ev) {
    const evDate = new Date(ev + 'T12:00:00')
    if (!isNaN(evDate.getTime()) && evDate < rounded && evDate > new Date()) {
      return fmt(evDate)
    }
  }
  return fmt(rounded)
}

/* ---------- evento da usuária (urgência personalizada) ---------- */
export function eventLabel(a: Answers): string {
  switch (s(a, 'event')) {
    case 'ferias': return 'suas férias'
    case 'casamento': return 'seu casamento'
    case 'praia': return 'sua viagem de praia'
    case 'festa': return 'sua festa de fim de ano'
    case 'reencontro': return 'seu reencontro'
    case 'aniversario': return 'seu aniversário'
    case 'outro': return 'seu evento'
    default: return ''
  }
}

export function eventDateLabel(a: Answers): string {
  const ev = s(a, 'eventDate')
  if (!ev) return ''
  const d = new Date(ev + 'T12:00:00')
  return isNaN(d.getTime()) ? '' : fmt(d)
}

/* ---------- diagnóstico D1–D5 (prioridade: primeiro match vence) ---------- */
export interface Diagnosis {
  id: string
  title: string
  cardLabel: string
  cardValue: string
  copy: string
}

export function diagnosis(a: Answers): Diagnosis {
  const goal = s(a, 'goal')
  const pattern = s(a, 'weightPattern')
  const plank = s(a, 'plank')
  const body = s(a, 'bodyType')
  const toe = s(a, 'toeTouch')
  const day = s(a, 'typicalDay')
  const pain = arr(a, 'painPoints')

  const triggers = arr(a, 'weightTriggers')
  const bucket = s(a, 'ageBucket')

  if (goal === 'postura')
    return {
      id: 'D1', title: 'Postura Sobrecarregada',
      cardLabel: 'Perfil de postura', cardValue: 'Sobrecarregada',
      copy: 'Ombros curvados e tensão cervical indicam desequilíbrio da cadeia posterior. Os nossos **treinos guiados por vídeo de mobilidade e fortalecimento postural** vão realinhar seu corpo de forma progressiva.',
    }
  if (triggers.includes('gravidez'))
    return {
      id: 'D1b', title: 'Core em Recuperação Pós-Parto',
      cardLabel: 'Perfil de core', cardValue: 'Em recuperação',
      copy: 'Após a gravidez, os músculos profundos do abdômen e o assoalho pélvico precisam ser **reconstruídos com cuidado e na ordem certa**. O Pilates é o método mais recomendado para essa fase — seguro, progressivo e sem impacto.',
    }
  if (triggers.includes('menopausa') || triggers.includes('metabolismo') ||
      ((bucket === '45-54' || bucket === '55+') && pattern === 'dificil'))
    return {
      id: 'D2b', title: 'Metabolismo Hormonal',
      cardLabel: 'Metabolismo', cardValue: 'Hormonal — mais lento',
      copy: 'Com a menopausa, o corpo redistribui gordura para a barriga e perde músculo mais rápido — por isso o que funcionava antes parou de funcionar. O Pilates combate **exatamente esses dois efeitos**, com baixo impacto.',
    }
  if (goal === 'perder-peso' && pattern === 'dificil')
    return {
      id: 'D2', title: 'Metabolismo de Baixa Queima',
      cardLabel: 'Metabolismo', cardValue: 'Lento',
      copy: 'Seu corpo tende a preservar energia — o segredo é queimar com **baixo impacto e constância**. As séries dinâmicas de Pilates elevam o gasto calórico sem sobrecarregar as articulações.',
    }
  if ((plank === 'nao' || plank === 'menos-30') && (body === 'media' || body === 'grande' || body === 'acima'))
    return {
      id: 'D3', title: 'Core Adormecido',
      cardLabel: 'Perfil de core', cardValue: 'Adormecido',
      copy: 'Quando os músculos profundos do abdômen não são ativados, a barriga projeta-se para fora e a postura sofre — mesmo em pessoas magras. Os nossos **treinos guiados por vídeo com foco em ativação do core** vão reverter isso de forma progressiva.',
    }
  if (toe === 'nem-perto' || toe === 'quase')
    return {
      id: 'D4', title: 'Encurtamento Muscular',
      cardLabel: 'Flexibilidade', cardValue: 'Baixa',
      copy: 'Cadeias musculares encurtadas limitam o movimento e pioram a postura. Os **alongamentos dinâmicos diários de 10 minutos** do seu plano vão devolver amplitude e leveza ao seu corpo.',
    }
  if (day === 'sentada' && pain.includes('lombar'))
    return {
      id: 'D5', title: 'Quadril Preso',
      cardLabel: 'Mobilidade de quadril', cardValue: 'Restrita',
      copy: 'Horas sentada encurtam os flexores do quadril e sobrecarregam a lombar. As **sequências de liberação de quadril e glúteo médio** vão destravar seu movimento e aliviar a dor.',
    }
  return {
    id: 'D0', title: 'Perfil Equilibrado',
    cardLabel: 'Perfil geral', cardValue: 'Equilibrado',
    copy: 'Você tem uma base sólida — o seu plano vai **acelerar o que já funciona** e levar seus resultados para o próximo nível.',
  }
}

/* ---------- nível de pilates ---------- */
export function pilatesLevel(a: Answers): string {
  let score = 0
  score += s(a, 'experience') === 'sim' ? 2 : 0
  score += { nunca: 0, mes: 1, semana: 2, diaria: 3 }[s(a, 'frequency')] ?? 0
  score += { nao: 0, 'menos-30': 1, '30-60': 2, 'mais-60': 3 }[s(a, 'plank')] ?? 0
  score += { nao: 0, dificuldade: 1, uma: 2, duas: 3 }[s(a, 'balance')] ?? 0
  if (score <= 2) return 'Iniciante'
  if (score <= 6) return 'Iniciante+'
  if (score <= 9) return 'Intermediário'
  return 'Avançado'
}

export function lifestyle(a: Answers): string {
  return s(a, 'typicalDay') === 'sentada' ? 'Sedentário' : 'Ativo'
}

export function flexibilityLabel(a: Answers): string {
  const f = s(a, 'flexibility')
  if (f === 'bastante') return 'Boa'
  if (f === 'comecando') return 'Em desenvolvimento'
  return 'Baixa — encurtamento'
}

export function goalLabel(a: Answers): string {
  return {
    'perder-peso': 'emagrecer',
    tonificar: 'tonificar o corpo',
    postura: 'corrigir a postura',
    manter: 'manter a forma',
  }[s(a, 'goal')] ?? 'transformar o corpo'
}

export function firstName(a: Answers): string {
  return s(a, 'name') || 'você'
}
