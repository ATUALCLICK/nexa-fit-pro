/* ========================================================
   NEXA FIT PRO — Gerenciador Central de Logs Diários & Calendário
   Sequência Inteligente de Treinos • Registro de Refeições • Corridas GPS
   ======================================================== */

// Sequência padrão de Treinos (Periodização de Alta Definição)
export const WORKOUT_SEQUENCE = [
  {
    code: 'A',
    name: 'Peito, Tríceps & Core',
    category: 'peito',
    focus: 'Hipertrofia de Peitoral, Tríceps & Abdômen',
    durationMin: 45,
    caloriesEst: 340,
    img: 'https://cdn.jsdelivr.net/gh/hasaneyldrm/exercises-dataset@main/videos/0025-EIeI8Vf.gif',
    exercises: [
      { name: 'Supino Reto com Barra', sets: 4, reps: '10-12', weight: 40 },
      { name: 'Crucifixo Inclinado com Halteres', sets: 4, reps: '12-15', weight: 16 },
      { name: 'Tríceps Corda na Polia', sets: 4, reps: '12-15', weight: 25 },
      { name: 'Tríceps Testa com Barra W', sets: 3, reps: '10-12', weight: 20 },
      { name: 'Prancha Abdominal Isométrica', sets: 3, reps: '45 seg', weight: 0 },
    ]
  },
  {
    code: 'B',
    name: 'Costas, Bíceps & Lombar',
    category: 'costas',
    focus: 'Densidade Dorsal, V-Taper & Bíceps Braquial',
    durationMin: 50,
    caloriesEst: 380,
    img: 'https://cdn.jsdelivr.net/gh/hasaneyldrm/exercises-dataset@main/videos/2330-LEprlgG.gif',
    exercises: [
      { name: 'Puxada Frontal Aberta', sets: 4, reps: '10-12', weight: 45 },
      { name: 'Remada Curvada com Barra', sets: 4, reps: '10-12', weight: 35 },
      { name: 'Rosca Direta com Barra W', sets: 4, reps: '10-12', weight: 18 },
      { name: 'Rosca Martelo com Halteres', sets: 3, reps: '12-15', weight: 14 },
      { name: 'Extensão Lombar (Hiperextensão)', sets: 3, reps: '15', weight: 0 },
    ]
  },
  {
    code: 'C',
    name: 'Pernas Completas & Panturrilhas',
    category: 'pernas',
    focus: 'Quadríceps, Isquiotibiais & Gastrocnêmio',
    durationMin: 55,
    caloriesEst: 420,
    img: 'https://cdn.jsdelivr.net/gh/hasaneyldrm/exercises-dataset@main/videos/0043-qXTaZnJ.gif',
    exercises: [
      { name: 'Agachamento Livre com Barra', sets: 4, reps: '8-12', weight: 50 },
      { name: 'Leg Press 45º Tradicional', sets: 4, reps: '12-15', weight: 120 },
      { name: 'Cadeira Extensora (Drop-set)', sets: 4, reps: '15', weight: 40 },
      { name: 'Mesa Flexora (Posteriores)', sets: 4, reps: '12', weight: 35 },
      { name: 'Gêmeos em Pé (Panturrilha)', sets: 4, reps: '20', weight: 60 },
    ]
  },
  {
    code: 'D',
    name: 'Ombros, Trapézio & Abdômen',
    category: 'ombros',
    focus: 'Deltoides 3D, Postura Alinhada & Serrátil',
    durationMin: 45,
    caloriesEst: 320,
    img: 'https://cdn.jsdelivr.net/gh/hasaneyldrm/exercises-dataset@main/videos/0405-znQUdHY.gif',
    exercises: [
      { name: 'Desenvolvimento com Halteres', sets: 4, reps: '10-12', weight: 18 },
      { name: 'Elevação Lateral com Halteres', sets: 4, reps: '15-20', weight: 10 },
      { name: 'Elevação Frontal na Polia', sets: 3, reps: '12-15', weight: 15 },
      { name: 'Encolhimento com Barra (Trapézio)', sets: 4, reps: '15', weight: 50 },
      { name: 'Abdominal Supra na Polia (Crunch)', sets: 4, reps: '20', weight: 35 },
    ]
  },
  {
    code: 'E',
    name: 'Corrida & Queima Lipolítica HIIT',
    category: 'corrida',
    focus: 'Capacidade Cardiorrespiratória & Gordura Visceral',
    durationMin: 40,
    caloriesEst: 450,
    img: 'https://images.unsplash.com/photo-1502680390469-be75c86b636f?w=600&auto=format&fit=crop&q=80',
    exercises: [
      { name: 'Aquecimento / Trote Leve', sets: 1, reps: '5 min', weight: 0 },
      { name: 'Corrida Contínua em Zona 2/3', sets: 1, reps: '25 min', weight: 0 },
      { name: 'Tiros de Explosão HIIT (30s max / 30s trote)', sets: 6, reps: '6 tiros', weight: 0 },
      { name: 'Desaquecimento & Caminhada', sets: 1, reps: '5 min', weight: 0 },
    ]
  }
]

// Formata data em formato YYYY-MM-DD local
export function getFormattedDate(date = new Date()) {
  const d = new Date(date)
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

// Obtém todos os logs salvos
export function getAllDailyLogs() {
  try {
    const raw = localStorage.getItem('nexafit_daily_logs')
    return raw ? JSON.parse(raw) : {}
  } catch (e) {
    console.error('Erro ao ler logs diários:', e)
    return {}
  }
}

// Salva todos os logs
export function saveAllDailyLogs(logs) {
  try {
    localStorage.setItem('nexafit_daily_logs', JSON.stringify(logs))
  } catch (e) {
    console.error('Erro ao salvar logs diários:', e)
  }
}

// Obtém o log de uma data específica
export function getDayLog(dateStr = getFormattedDate()) {
  const logs = getAllDailyLogs()
  return logs[dateStr] || {
    workout: null,
    meals: [],
    running: null,
    waterMl: 0,
    caloriesGoal: 2200,
    notes: ''
  }
}

// Salva o log de uma data específica
export function updateDayLog(dateStr, partial) {
  const logs = getAllDailyLogs()
  const current = logs[dateStr] || {
    workout: null,
    meals: [],
    running: null,
    waterMl: 0,
    caloriesGoal: 2200,
    notes: ''
  }
  logs[dateStr] = { ...current, ...partial }
  saveAllDailyLogs(logs)
  return logs[dateStr]
}

// Calcula o próximo treino sequencial baseado no último treino feito
export function getNextSequentialWorkout() {
  const logs = getAllDailyLogs()
  const dates = Object.keys(logs).sort().reverse()

  let lastWorkoutCode = null
  for (const d of dates) {
    if (logs[d]?.workout?.code) {
      lastWorkoutCode = logs[d].workout.code
      break
    }
  }

  if (!lastWorkoutCode) {
    // Se nunca treinou, começa no Treino A
    return {
      workout: WORKOUT_SEQUENCE[0],
      isSequential: false,
      lastWorkout: null,
      nextIndex: 0
    }
  }

  const lastIndex = WORKOUT_SEQUENCE.findIndex(w => w.code === lastWorkoutCode)
  const nextIndex = (lastIndex + 1) % WORKOUT_SEQUENCE.length
  return {
    workout: WORKOUT_SEQUENCE[nextIndex],
    isSequential: true,
    lastWorkout: WORKOUT_SEQUENCE[lastIndex],
    nextIndex
  }
}

// Registra uma refeição no dia
export function addMealToDay(dateStr = getFormattedDate(), meal) {
  const day = getDayLog(dateStr)
  const newMeal = {
    id: Date.now(),
    time: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
    type: meal.type || 'Refeição',
    name: meal.name,
    cals: Number(meal.cals) || 0,
    protein: Number(meal.protein) || 0,
    carbs: Number(meal.carbs) || 0,
    fats: Number(meal.fats) || 0
  }
  const updatedMeals = [...(day.meals || []), newMeal]
  updateDayLog(dateStr, { meals: updatedMeals })
  return newMeal
}

// Registra um treino no dia
export function completeWorkoutForDay(dateStr = getFormattedDate(), workoutData) {
  return updateDayLog(dateStr, {
    workout: {
      ...workoutData,
      completedAt: new Date().toISOString(),
    }
  })
}

// Registra uma corrida GPS no dia
export function completeRunForDay(dateStr = getFormattedDate(), runData) {
  return updateDayLog(dateStr, {
    running: {
      ...runData,
      completedAt: new Date().toISOString(),
    }
  })
}

// Popula dados de exemplo se estiver vazio para demonstração rica
export function initSeedDataIfEmpty() {
  const logs = getAllDailyLogs()
  if (Object.keys(logs).length === 0) {
    const today = new Date()
    const d1 = new Date(today); d1.setDate(today.getDate() - 2)
    const d2 = new Date(today); d2.setDate(today.getDate() - 1)

    const dateStr1 = getFormattedDate(d1)
    const dateStr2 = getFormattedDate(d2)
    const dateToday = getFormattedDate(today)

    logs[dateStr1] = {
      workout: {
        code: 'A',
        name: 'Peito, Tríceps & Core',
        category: 'peito',
        durationMin: 45,
        caloriesEst: 340,
        completedAt: d1.toISOString()
      },
      meals: [
        { id: 1, type: 'Café da Manhã', name: '4 Ovos mexidos + Pão 100% integral', cals: 450, protein: 34, carbs: 38, fats: 14, time: '08:15' },
        { id: 2, type: 'Almoço', name: '200g Frango grelhado + Arroz + Feijão + Salada', cals: 680, protein: 58, carbs: 62, fats: 16, time: '12:40' },
        { id: 3, type: 'Jantar', name: 'Patinho moído + Mandioca cozida', cals: 520, protein: 48, carbs: 40, fats: 14, time: '20:10' }
      ],
      running: null,
      waterMl: 2500,
      caloriesGoal: 2200
    }

    logs[dateStr2] = {
      workout: {
        code: 'B',
        name: 'Costas, Bíceps & Lombar',
        category: 'costas',
        durationMin: 48,
        caloriesEst: 375,
        completedAt: d2.toISOString()
      },
      meals: [
        { id: 4, type: 'Café da Manhã', name: 'Whey Protein + Banana + Aveia', cals: 420, protein: 38, carbs: 46, fats: 8, time: '08:00' },
        { id: 5, type: 'Almoço', name: 'Filé de Tilápia + Batata doce + Brócolis', cals: 580, protein: 52, carbs: 48, fats: 12, time: '13:00' },
        { id: 6, type: 'Jantar', name: 'Omelete de 4 claras e 2 gemas com queijo branco', cals: 410, protein: 36, carbs: 12, fats: 20, time: '20:30' }
      ],
      running: null,
      waterMl: 2250,
      caloriesGoal: 2200
    }

    logs[dateToday] = {
      workout: null, // Hoje aguardando o Treino C!
      meals: [
        { id: 7, type: 'Café da Manhã', name: '3 Ovos na manteiga + Café preto', cals: 380, protein: 28, carbs: 4, fats: 26, time: '08:30' }
      ],
      running: {
        distanceKm: '5.01',
        pace: '7:21',
        durationSec: 2412, // 40:12
        durationFormatted: '40:12',
        calories: 463,
        elevationM: 20,
        avgHeartRate: 120,
        completedAt: today.toISOString(),
        polyline: [
          [-23.5874, -46.6576],
          [-23.5888, -46.6550],
          [-23.5912, -46.6535],
          [-23.5940, -46.6548],
          [-23.5955, -46.6580],
          [-23.5930, -46.6610],
          [-23.5895, -46.6605],
          [-23.5874, -46.6576]
        ]
      },
      waterMl: 1500,
      caloriesGoal: 2200
    }

    saveAllDailyLogs(logs)
  }
}
