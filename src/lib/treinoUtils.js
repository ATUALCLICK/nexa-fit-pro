/**
 * treinoUtils.js — Lógica de adaptação de treinos e utilitários de data (fuso Brasília UTC-3)
 * Compartilhado entre Dashboard.jsx e Treino.jsx
 */

// ──────────────────────────────────────────
// FUSO HORÁRIO BRASÍLIA (America/Sao_Paulo)
// ──────────────────────────────────────────

/** Retorna um objeto Date ajustado para o horário de Brasília */
export function getBrasiliaDate() {
  return new Date(new Date().toLocaleString('en-US', { timeZone: 'America/Sao_Paulo' }))
}

/** Retorna a data de hoje em Brasília no formato ISO (YYYY-MM-DD) */
export function getBrasiliaISODate() {
  const d = getBrasiliaDate()
  const yyyy = d.getFullYear()
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  return `${yyyy}-${mm}-${dd}`
}

/** Retorna a string de data local legível no fuso de Brasília, ex: "24/04/2026" */
export function getBrasiliaLocaleDateString() {
  return new Date().toLocaleDateString('pt-BR', { timeZone: 'America/Sao_Paulo' })
}

/** Retorna o dia da semana (0=Dom … 6=Sáb) no fuso de Brasília */
export function getBrasiliaWeekDay() {
  return getBrasiliaDate().getDay()
}

/** Retorna a data ISO (YYYY-MM-DD) de uma string ou objeto de data no fuso de Brasília */
export function toBrasiliaISODate(dateInput) {
  if (typeof dateInput === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(dateInput)) {
    return dateInput;
  }
  const d = new Date(new Date(dateInput).toLocaleString('en-US', { timeZone: 'America/Sao_Paulo' }))
  const yyyy = d.getFullYear()
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  return `${yyyy}-${mm}-${dd}`
}

/** Retorna os últimos 7 dias no formato ISO */
export function getBrasiliaLast7Days() {
  const dates = []
  for (let i = 6; i >= 0; i--) {
    const d = getBrasiliaDate()
    d.setDate(d.getDate() - i)
    const yyyy = d.getFullYear()
    const mm = String(d.getMonth() + 1).padStart(2, '0')
    const dd = String(d.getDate()).padStart(2, '0')
    dates.push(`${yyyy}-${mm}-${dd}`)
  }
  return dates
}

// ──────────────────────────────────────────
// BASES DE TREINO
// ──────────────────────────────────────────

const GIF_BASE = 'https://cdn.jsdelivr.net/gh/hasaneyldrm/exercises-dataset@main/videos/'
export const IMG = {
  bench:          `${GIF_BASE}0025-EIeI8Vf.gif`,
  crucifixo:      `${GIF_BASE}0314-ns0SIbU.gif`,
  crossover:      `${GIF_BASE}0179-FVmZVhk.gif`,
  lat:            `${GIF_BASE}2330-LEprlgG.gif`,
  squat:          `${GIF_BASE}0043-qXTaZnJ.gif`,
  shoulder:       `${GIF_BASE}0405-znQUdHY.gif`,
  tricepsCorda:   `${GIF_BASE}0200-dU605di.gif`,
  remada:         `${GIF_BASE}0027-eZyBC3j.gif`,
  rosca:          `${GIF_BASE}0031-25GPyDY.gif`,
  legPress:       `${GIF_BASE}0739-10Z2DXU.gif`,
  extensora:      `${GIF_BASE}0585-my33uHU.gif`,
  elevLateral:    `${GIF_BASE}0334-DsgkuIt.gif`,
  crunch:         `${GIF_BASE}0001-2gPfomN.gif`,
  stiff:          `${GIF_BASE}1409-qKBpF7I.gif`,
  pantorrinha:    `${GIF_BASE}1372-8ozhUIZ.gif`,
  pushups:        `${GIF_BASE}0259-x6KpKpq.gif`,
  pushupDiamond:  `${GIF_BASE}0283-soIB2rj.gif`,
  chinUps:        `${GIF_BASE}2330-LEprlgG.gif`,
  pullUps:        `${GIF_BASE}2330-LEprlgG.gif`,
  invertedRow:    `${GIF_BASE}0239-Tq6gbK6.gif`,
  benchDips:      `${GIF_BASE}0200-dU605di.gif`,
  gluteBridge:    `${GIF_BASE}1409-qKBpF7I.gif`,
  gobletSquat:    `${GIF_BASE}0043-qXTaZnJ.gif`,
  plank:          `${GIF_BASE}0464-CosupLu.gif`,
  inclineMachine: `${GIF_BASE}0314-ns0SIbU.gif`,
  frontRaise:     `${GIF_BASE}0310-3eGE2JC.gif`,
}

export const BASE = {
  A: {
    titulo: 'Peito & Tríceps',
    exercicios: [
      { id: 1,  nome: 'Supino Reto com Halteres',   series: 4, reps: '8-12',  descanso: 90,  img: IMG.bench,          gifKey: 'dumbbellBench',   videoId: 'VmB1G1K7v94', descricao: 'Deite no banco segurando um halter em cada mão. Desça até a altura do peito, empurre contraindo o peitoral.' },
      { id: 2,  nome: 'Crucifixo Inclinado',         series: 3, reps: '10-12', descanso: 60,  img: IMG.crucifixo,      gifKey: 'dumbbellFly',     videoId: 'bDaIL_wOXNw', descricao: 'Banco 30-45°. Abra em arco até alongar o peitoral, feche como abraço.' },
      { id: 3,  nome: 'Supino Inclinado na Máquina', series: 3, reps: '10-15', descanso: 60,  img: IMG.inclineMachine, gifKey: 'inclineMachine', videoId: 'SrqOu55lrYU', descricao: 'Ajuste o assento, pressione em direção à parte superior do peito.' },
      { id: 4,  nome: 'Crossover Polia Alta',        series: 3, reps: '12-15', descanso: 45,  img: IMG.crossover,      gifKey: 'cableCrossover', videoId: 'taI4XduLpTk', descricao: 'Puxe em arco para baixo cruzando as mãos. Contraia o peitoral no final.' },
      { id: 5,  nome: 'Tríceps na Corda',            series: 4, reps: '10-15', descanso: 60,  img: IMG.tricepsCorda,   gifKey: 'tricepsPushdown',videoId: 'kiuVA0gs3EI', descricao: 'Cotovelos fixos. Empurre a corda para baixo abrindo levemente.' },
      { id: 6,  nome: 'Tríceps Testa',               series: 3, reps: '10-12', descanso: 60,  img: IMG.tricepsCorda,   gifKey: 'skullCrusher',   videoId: 'ir5PsbniVSc', descricao: 'Deitado, barra desce em direção à testa com cotovelos fixos.' },
    ]
  },
  B: {
    titulo: 'Costas & Bíceps',
    exercicios: [
      { id: 7,  nome: 'Puxada Frontal Polia',        series: 4, reps: '8-12',  descanso: 90, img: IMG.lat,    gifKey: 'latPulldown',  videoId: 'CAwf7n6Luuc', descricao: 'Puxe a barra até o peito retraindo as escápulas.' },
      { id: 8,  nome: 'Remada Curvada com Barra',    series: 4, reps: '8-12',  descanso: 90, img: IMG.remada, gifKey: 'barbellRow',   videoId: 'vT2GjY_Umpw', descricao: 'Tronco 45°, puxe ao abdômen mantendo costas retas.' },
      { id: 9,  nome: 'Remada Unilateral Halter',    series: 3, reps: '10-12', descanso: 60, img: IMG.remada, gifKey: 'barbellRow',   videoId: 'roCP_6QLTP0', descricao: 'Apoio no banco, puxe cotovelo para cima focando no lat.' },
      { id: 10, nome: 'Rosca Direta com Barra',      series: 3, reps: '10-12', descanso: 60, img: IMG.rosca,  gifKey: 'barbellCurl',  videoId: 'ykJmrZ5v0Oo', descricao: 'Cotovelos fixos, suba até contração máxima.' },
      { id: 11, nome: 'Rosca Alternada com Halteres',series: 3, reps: '12-15', descanso: 45, img: IMG.rosca,  gifKey: 'altBicepCurl', videoId: 'soxrZlIl35U', descricao: 'Curl alternado com supinação para maximizar a contração.' },
    ]
  },
  C: {
    titulo: 'Pernas Completas',
    exercicios: [
      { id: 12, nome: 'Agachamento Livre',   series: 4, reps: '8-10',  descanso: 120, img: IMG.squat,      gifKey: 'barbellSquat', videoId: 'aclHkVaku9U', descricao: 'Pés na largura dos ombros, desça até coxas paralelas.' },
      { id: 13, nome: 'Leg Press 45°',       series: 4, reps: '10-12', descanso: 90,  img: IMG.legPress,   gifKey: 'sledLegPress', videoId: 'IZxyjW7MPJQ', descricao: 'Pés na plataforma, desça até 90° e empurre.' },
      { id: 14, nome: 'Cadeira Extensora',   series: 3, reps: '12-15', descanso: 60,  img: IMG.extensora,  gifKey: 'legExtension', videoId: 'YyvSfVjQeL0', descricao: 'Estenda os joelhos segurando 1s no topo.' },
      { id: 15, nome: 'Stiff com Halteres', series: 3, reps: '10-12', descanso: 60,  img: IMG.stiff,      gifKey: 'romanianDL',   videoId: '1uDiW5--rAE', descricao: 'Incline empurrando o quadril para trás, costas retas.' },
      { id: 16, nome: 'Panturrilha em Pé',  series: 4, reps: '15-20', descanso: 45,  img: IMG.pantorrinha,gifKey: 'calfRaise',    videoId: 'gwLzBJYoWlQ', descricao: 'Calcanhar abaixo do degrau, suba máximo.' },
    ]
  },
  D: {
    titulo: 'Ombros & Abdômen',
    exercicios: [
      { id: 17, nome: 'Desenvolvimento com Halteres', series: 4, reps: '8-12',  descanso: 90, img: IMG.shoulder,    gifKey: 'shoulderPress', videoId: 'qEwKCR5JCog', descricao: 'Empurre halteres diretamente para cima sem arquear lombar.' },
      { id: 18, nome: 'Elevação Lateral',             series: 4, reps: '12-15', descanso: 45, img: IMG.elevLateral, gifKey: 'lateralRaise',  videoId: 'FeJPLCpQDVc', descricao: 'Eleve lateralmente até os ombros, polegar levemente para baixo.' },
      { id: 19, nome: 'Elevação Frontal',             series: 3, reps: '12-15', descanso: 45, img: IMG.frontRaise,  gifKey: 'frontRaise',    videoId: 'sOoBKAiPzJU', descricao: 'Eleve à frente até a altura dos ombros.' },
      { id: 20, nome: 'Crunch Abdominal',             series: 4, reps: '15-20', descanso: 45, img: IMG.crunch,      gifKey: 'crunch',        videoId: 'Xyd_fa5zoEU', descricao: 'Eleve o tronco superior contraindo o abdômen.' },
      { id: 21, nome: 'Prancha',                      series: 3, reps: '30-45s',descanso: 45, img: IMG.plank,      gifKey: 'plank',         videoId: 'ASdvN_XEl_c', descricao: 'Corpo reto da cabeça ao calcanhar, contraia core e glúteos.' },
    ]
  }
}

export const BASE_CALISTENIA = {
  A: { titulo: 'Peito & Tríceps (Calistenia)', exercicios: [
    { id: 101, nome: 'Flexão de Braço Padrão',    series: 4, reps: '10-20', descanso: 60, img: IMG.pushups,   gifKey: 'pushup',      videoId: 'IODxDxX7oi4' },
    { id: 102, nome: 'Flexão Diamante',           series: 3, reps: '8-15',  descanso: 60, img: IMG.pushups,   gifKey: 'pushup',      videoId: 'J0DnG1_S92I' },
    { id: 103, nome: 'Mergulho no Banco (Dips)',  series: 3, reps: '10-15', descanso: 60, img: IMG.benchDips, gifKey: 'benchDip',    videoId: 'c3ZGl4pAwZ4' },
  ]},
  B: { titulo: 'Costas & Bíceps (Calistenia)', exercicios: [
    { id: 104, nome: 'Barra Fixa Supinada (Chin-ups)', series: 4, reps: '5-12', descanso: 90, img: IMG.chinUps,     gifKey: 'chinUp',      videoId: 'mRy9m2Q9_1I' },
    { id: 105, nome: 'Barra Fixa Pronada (Pull-ups)',  series: 4, reps: '5-12', descanso: 90, img: IMG.pullUps,     gifKey: 'pullUp',      videoId: 'eGo4IYtlbpU' },
    { id: 106, nome: 'Remada Invertida',               series: 3, reps: '10-15',descanso: 60, img: IMG.invertedRow, gifKey: 'invertedRow', videoId: 'XZV9IwluPjw' },
  ]},
  C: { titulo: 'Pernas & Core (Calistenia)', exercicios: [
    { id: 107, nome: 'Agachamento Livre',        series: 4, reps: '15-30', descanso: 60, img: IMG.squat,       gifKey: 'barbellSquat', videoId: 'aclHkVaku9U' },
    { id: 108, nome: 'Afundo Alternado',         series: 4, reps: '10-20', descanso: 60, img: IMG.squat,       gifKey: 'barbellSquat', videoId: 'D7KaRcUTQeE' },
    { id: 109, nome: 'Elevação Pélvica Solo',    series: 3, reps: '15-20', descanso: 45, img: IMG.gluteBridge, gifKey: 'gluteBridge',  videoId: '0H0v_V2Vq1A' },
    { id: 110, nome: 'Prancha',                  series: 4, reps: '45-60s',descanso: 45, img: IMG.plank,       gifKey: 'plank',        videoId: 'ASdvN_XEl_c' },
  ]}
}

export const BASE_CASA = {
  A: { titulo: 'Superiores em Casa (Halteres)', exercicios: [
    { id: 201, nome: 'Supino com Halteres no Chão',     series: 4, reps: '10-15', descanso: 60, img: IMG.bench,        gifKey: 'dumbbellBench',   videoId: 'uUGDRwge4F8' },
    { id: 202, nome: 'Crucifixo com Halteres no Chão',  series: 3, reps: '10-15', descanso: 60, img: IMG.crucifixo,    gifKey: 'dumbbellFly',     videoId: '1Tq3Qd_n4pI' },
    { id: 203, nome: 'Tríceps Coice com Halter',        series: 3, reps: '10-12', descanso: 60, img: IMG.tricepsCorda, gifKey: 'tricepsPushdown', videoId: '1uDiW5--rAE' },
    { id: 204, nome: 'Remada Curvada com Halteres',     series: 4, reps: '10-12', descanso: 60, img: IMG.remada,       gifKey: 'barbellRow',      videoId: 'vT2GjY_Umpw' },
    { id: 205, nome: 'Rosca Direta com Halteres',       series: 3, reps: '10-15', descanso: 60, img: IMG.rosca,        gifKey: 'altBicepCurl',    videoId: 'ykJmrZ5v0Oo' },
  ]},
  B: { titulo: 'Inferiores em Casa (Halteres)', exercicios: [
    { id: 206, nome: 'Agachamento Goblet com Halter',       series: 4, reps: '10-15', descanso: 60, img: IMG.gobletSquat, gifKey: 'gobletSquat',  videoId: 'MeIiIdhgPyg' },
    { id: 207, nome: 'Afundo com Halteres',                 series: 4, reps: '10-12', descanso: 60, img: IMG.squat,       gifKey: 'barbellSquat', videoId: 'D7KaRcUTQeE' },
    { id: 208, nome: 'Stiff com Halteres',                  series: 3, reps: '10-15', descanso: 60, img: IMG.stiff,       gifKey: 'romanianDL',   videoId: '1uDiW5--rAE' },
    { id: 209, nome: 'Elevação de Panturrilha c/ Halter',   series: 4, reps: '15-20', descanso: 45, img: IMG.pantorrinha, gifKey: 'calfRaise',    videoId: 'gwLzBJYoWlQ' },
  ]}
}

export const BASE_HIBRIDO = {
  A: { titulo: 'Força Superior + Tiro de Corrida', exercicios: [
    { id: 301, nome: 'Supino Reto com Halteres',   series: 4, reps: '8-12',  descanso: 90, img: IMG.bench,        gifKey: 'dumbbellBench',   videoId: 'VmB1G1K7v94' },
    { id: 302, nome: 'Remada Curvada',             series: 4, reps: '8-12',  descanso: 90, img: IMG.remada,       gifKey: 'barbellRow',      videoId: 'vT2GjY_Umpw' },
    { id: 303, nome: 'Desenvolvimento Ombros',     series: 3, reps: '10-12', descanso: 60, img: IMG.shoulder,     gifKey: 'shoulderPress',   videoId: 'qEwKCR5JCog' },
    { id: 304, nome: 'Tiro de Corrida (HIIT)',     series: 5, reps: '1 min', descanso: 60, img: IMG.plank,        gifKey: 'plank',           videoId: 'vT2GjY_Umpw', descricao: 'Corra no seu máximo por 1 minuto e caminhe por 1 minuto.' },
  ]},
  B: { titulo: 'Força Inferior + Endurance', exercicios: [
    { id: 305, nome: 'Agachamento Livre',          series: 4, reps: '8-10',  descanso: 90, img: IMG.squat,        gifKey: 'barbellSquat',    videoId: 'aclHkVaku9U' },
    { id: 306, nome: 'Stiff',                      series: 4, reps: '10-12', descanso: 90, img: IMG.stiff,        gifKey: 'romanianDL',      videoId: '1uDiW5--rAE' },
    { id: 307, nome: 'Elevação Pélvica',           series: 3, reps: '12-15', descanso: 60, img: IMG.gluteBridge,  gifKey: 'gluteBridge',     videoId: '0H0v_V2Vq1A' },
    { id: 308, nome: 'Corrida Contínua (Meta 3km)',series: 1, reps: 'Meta',  descanso: 0,  img: IMG.plank,        gifKey: 'plank',           videoId: 'vT2GjY_Umpw', descricao: 'Corra em ritmo moderado até atingir 3km. Caminhe se precisar.' },
  ]},
  C: { titulo: 'Cardio Longo + Core', exercicios: [
    { id: 309, nome: 'Prancha Isométrica',         series: 4, reps: '1 min', descanso: 45, img: IMG.plank,        gifKey: 'plank',           videoId: 'ASdvN_XEl_c' },
    { id: 310, nome: 'Crunch Abdominal',           series: 4, reps: '20',    descanso: 45, img: IMG.crunch,       gifKey: 'crunch',          videoId: 'Xyd_fa5zoEU' },
    { id: 311, nome: 'Corrida ou Bike (Meta 5km/10km)', series: 1, reps: 'Meta', descanso: 0, img: IMG.plank,        gifKey: 'plank',           videoId: 'vT2GjY_Umpw', descricao: 'Atividade cardiovascular longa para melhorar condicionamento.' },
  ]}
}

// Seeded PRNG simple implementation
function mulberry32(a) {
    return function() {
      var t = a += 0x6D2B79F5;
      t = Math.imul(t ^ t >>> 15, t | 1);
      t ^= t + Math.imul(t ^ t >>> 7, t | 61);
      return ((t ^ t >>> 14) >>> 0) / 4294967296;
    }
}

function getStringHash(str) {
  let hash = 0;
  if (!str || str.length === 0) return hash;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash) + str.charCodeAt(i);
    hash |= 0;
  }
  return hash;
}

export function adaptarTreinos(user) {
  const objetivo   = user?.objetivo || ''
  const nivel      = user?.nivel || 'Iniciante'
  const equipamentos = user?.equipamentos || []
  const genero     = user?.genero || 'Masculino'
  const foco       = user?.foco_muscular || ''
  const seedString = String(user?.celular || '0') + String(user?.ultimo_reset_plano || '0');
  const rng = mulberry32(getStringHash(seedString));

  const emagrecer  = objetivo.toLowerCase().includes('emagre') || objetivo.toLowerCase().includes('secar')
  const forca      = objetivo.toLowerCase().includes('força')
  const hibrido    = objetivo.toLowerCase().includes('híbrido') || objetivo.toLowerCase().includes('hibrido')
  const iniciante  = nivel === 'Iniciante'

  let baseAtual = { ...BASE }
  if (hibrido) {
    baseAtual = { ...BASE_HIBRIDO }
  } else if (equipamentos.some(e => e.includes('calistenia'))) {
    baseAtual = { ...BASE_CALISTENIA }
  } else if (equipamentos.includes('Halteres em casa') && !equipamentos.includes('Academia completa')) {
    baseAtual = { ...BASE_CASA }
  }

  // Reordenação para Mulheres (prioriza glúteos e pernas)
  if (genero === 'Feminino') {
    const novaBase = {}
    if (baseAtual.C && baseAtual.A) {
      novaBase.A = { ...baseAtual.C, titulo: 'Glúteos & Pernas (Foco)' }
      novaBase.B = { ...baseAtual.B, titulo: 'Costas & Braços (Tonificação)' }
      novaBase.C = { ...baseAtual.A, titulo: 'Membros Superiores & Cardio' }
      if (baseAtual.D) novaBase.D = { ...baseAtual.D, titulo: 'Abdômen & Glúteos (Extra)' }
      baseAtual = novaBase
    }
  }

  const dbTreinos = {}
  for (const key in baseAtual) {
    dbTreinos[key] = {
      titulo: baseAtual[key].titulo,
      exercicios: baseAtual[key].exercicios.map((ex, index) => {
        let reps = ex.reps, descanso = ex.descanso, series = ex.series
        let nomeFinal = ex.nome
        let imgFinal = ex.img
        let gifKeyFinal = ex.gifKey
        let videoIdFinal = ex.videoId
        let descricaoFinal = ex.descricao
        
        const isPeito = ex.nome.toLowerCase().includes('supino') || ex.nome.toLowerCase().includes('crucifixo')
        const isCostas = ex.nome.toLowerCase().includes('remada') || ex.nome.toLowerCase().includes('puxada')
        const isPerna = ex.nome.toLowerCase().includes('agachamento') || ex.nome.toLowerCase().includes('leg press')
        
        // Variação Aleatória de Exercícios Básicos (Dynamic Workouts based on Seed)
        if (isPeito && rng() > 0.5) {
          if (ex.nome.includes('Reto')) { nomeFinal = 'Supino Reto com Barra'; descricaoFinal = 'Substituição: Use a barra em vez de halteres.'; videoIdFinal = 'sqOw2Y6uDWQ' }
          if (ex.nome.includes('Inclinado')) { nomeFinal = 'Supino Inclinado com Halteres'; descricaoFinal = 'Substituição: Use halteres soltos.'; videoIdFinal = '5CEABJj7Z3s' }
        }
        if (isCostas && rng() > 0.5) {
          if (ex.nome.includes('Barra')) { nomeFinal = 'Remada Curvada Pegada Supinada'; descricaoFinal = 'Substituição: Pegada invertida para recrutar mais bíceps.'; videoIdFinal = 'vT2GjY_Umpw' }
          if (ex.nome.includes('Polia')) { nomeFinal = 'Puxada com Triângulo'; descricaoFinal = 'Substituição: Use o triângulo puxando próximo ao corpo.'; videoIdFinal = 'CAwf7n6Luuc' }
        }
        if (isPerna && rng() > 0.5) {
          if (ex.nome.includes('Agachamento Livre')) { nomeFinal = 'Agachamento Frontal'; descricaoFinal = 'Substituição: Barra à frente, foca mais nos quadríceps.'; videoIdFinal = 'vT2GjY_Umpw' }
          if (ex.nome.includes('Leg Press')) { nomeFinal = 'Hack Machine'; descricaoFinal = 'Substituição: Faça no Hack Machine, desça profundo.'; videoIdFinal = 'IZxyjW7MPJQ' }
        }

        const nome = nomeFinal.toLowerCase()

        if (emagrecer)      { reps = nome.includes('prancha') ? reps : '15-20'; descanso = 45 }
        else if (forca)     { reps = '4-6'; descanso = 180; series = Math.min(5, series + 1) }
        if (iniciante)      { series = Math.max(2, series - 1) }

        if (genero === 'Feminino') {
          if (nome.includes('glúteo') || nome.includes('perna') || nome.includes('agachamento') || nome.includes('leg press') || nome.includes('stiff')) {
            series = Math.min(5, series + 1)
            if (!forca) reps = '12-15'
          } else if (nome.includes('supino') || nome.includes('peito') || nome.includes('tríceps')) {
            series = Math.max(2, series - 1)
          }
        }

        if (foco) {
          const f = foco.toLowerCase()
          if (f.includes('perna') && (nome.includes('agachamento') || nome.includes('leg press') || nome.includes('extensora'))) series = Math.min(5, series + 1)
          if (f.includes('bumbum') && (nome.includes('glúteo') || nome.includes('stiff') || nome.includes('agachamento'))) series = Math.min(5, series + 1)
          if (f.includes('braço') && (nome.includes('rosca') || nome.includes('tríceps'))) series = Math.min(5, series + 1)
          if (f.includes('barriga') && (nome.includes('crunch') || nome.includes('abdominal') || nome.includes('plank'))) series = Math.min(5, series + 1)
          if (f.includes('peito') && nome.includes('supino')) series = Math.min(5, series + 1)
          if (f.includes('costas') && (nome.includes('remada') || nome.includes('puxada'))) series = Math.min(5, series + 1)
        }

        return { ...ex, nome: nomeFinal, img: imgFinal, gifKey: gifKeyFinal, videoId: videoIdFinal, descricao: descricaoFinal, reps, descanso, series, concluido: false }
      })
    }
  }
  return dbTreinos
}

// ──────────────────────────────────────────
// CALCULAR QUAL TREINO É HOJE (Brasília)
// ──────────────────────────────────────────

/**
 * Dado um histórico de workouts do Dexie e as chaves disponíveis,
 * calcula qual treino deve ser feito hoje (rotação A→B→C→D→A…)
 * Verifica se já treinou hoje antes de avançar.
 */
export function calcularTreinoHoje(logs, treinosKeys) {
  const hojeStr = getBrasiliaISODate()
  const completed = logs.filter(l => l.completado)
  
  // Já treinou hoje?
  const treinouHoje = completed.some(l => toBrasiliaISODate(l.data) === hojeStr)
  
  if (treinouHoje) {
    const ultimo = completed.filter(l => toBrasiliaISODate(l.data) === hojeStr)
    return ultimo[ultimo.length - 1]?.tipo || treinosKeys[0]
  }

  // Próximo na rotação
  const completedTreinos = completed.filter(l => l.tipo !== 'Descanso').sort((a, b) => new Date(a.data) - new Date(b.data))
  if (completedTreinos.length === 0) return treinosKeys[0]
  
  const lastType = completedTreinos[completedTreinos.length - 1].tipo
  const idx = treinosKeys.indexOf(lastType)
  if (idx >= 0) return treinosKeys[(idx + 1) % treinosKeys.length]
  return treinosKeys[0]
}
