/**
 * syncHelpers.js - Utilitários centralizados de sincronização com Supabase
 * Salva dados de água, treino e atividades complementares em tempo real.
 */
import { supabase } from './supabase'
import { getBrasiliaISODate, toBrasiliaISODate } from './treinoUtils'

const toISODate = (date) => date ? toBrasiliaISODate(date) : getBrasiliaISODate()

// ──────────────────────────────────────────
// HIDRATAÇÃO
// ──────────────────────────────────────────

/**
 * Salva/atualiza registro de água do dia no Supabase (upsert por celular+data)
 */
export async function saveWaterLog(celular, garrafas, mlPorGarrafa = 500) {
  if (!celular) return
  const hoje = toISODate()
  const ml = garrafas * mlPorGarrafa
  try {
    const { error } = await supabase
      .from('water_logs')
      .upsert(
        { celular, data: hoje, garrafas, ml },
        { onConflict: 'celular,data' }
      )
    if (error) console.warn('[Water] Erro ao salvar:', error.message)
    else console.log(`[Water] ✅ ${garrafas} garrafas (${ml}ml) salvo`)
  } catch (e) {
    console.warn('[Water] Offline:', e.message)
  }
}

/**
 * Busca log de água do dia para um celular
 */
export async function loadTodayWater(celular) {
  if (!celular) return null
  const hoje = toISODate()
  try {
    const { data, error } = await supabase
      .from('water_logs')
      .select('garrafas, ml')
      .eq('celular', celular)
      .eq('data', hoje)
      .maybeSingle()
    if (error) return null
    return data
  } catch (e) {
    return null
  }
}

// ──────────────────────────────────────────
// TREINO
// ──────────────────────────────────────────

/**
 * Salva/atualiza log de treino do dia (upsert por celular+data)
 * Chamado a cada série concluída e ao finalizar o treino
 */
export async function saveWorkoutLog(celular, { tipo, seriesFeitas, exerciciosConcluidos, totalExercicios, completado = false }) {
  if (!celular) return
  const hoje = toISODate()
  try {
    const { error } = await supabase
      .from('workout_logs')
      .upsert(
        {
          celular,
          data: hoje,
          tipo,
          series_feitas: seriesFeitas,
          exercicios_concluidos: exerciciosConcluidos,
          total_exercicios: totalExercicios,
          completado,
          updated_at: new Date().toISOString()
        },
        { onConflict: 'celular,data' }
      )
    if (error) console.warn('[Workout] Erro ao salvar:', error.message)
    else console.log(`[Workout] ✅ Treino ${tipo} salvo (${exerciciosConcluidos}/${totalExercicios})`)
  } catch (e) {
    console.warn('[Workout] Offline:', e.message)
  }
}

/**
 * Busca log de treino do dia para um celular
 */
export async function loadTodayWorkout(celular) {
  if (!celular) return null
  const hoje = toISODate()
  try {
    const { data, error } = await supabase
      .from('workout_logs')
      .select('*')
      .eq('celular', celular)
      .eq('data', hoje)
      .maybeSingle()
    if (error) return null
    return data
  } catch (e) {
    return null
  }
}

// ──────────────────────────────────────────
// ATIVIDADES COMPLEMENTARES
// ──────────────────────────────────────────

/**
 * Marca/desmarca atividade complementar como concluída no dia
 */
export async function saveActivityLog(celular, atividade, completada) {
  if (!celular) return
  const hoje = toISODate()
  try {
    const { error } = await supabase
      .from('activity_logs')
      .upsert(
        { celular, data: hoje, atividade, completada },
        { onConflict: 'celular,data,atividade' }
      )
    if (error) console.warn('[Activity] Erro ao salvar:', error.message)
    else console.log(`[Activity] ✅ ${atividade} = ${completada}`)
  } catch (e) {
    console.warn('[Activity] Offline:', e.message)
  }
}

/**
 * Busca atividades completadas no dia
 */
export async function loadTodayActivities(celular) {
  if (!celular) return []
  const hoje = toISODate()
  try {
    const { data, error } = await supabase
      .from('activity_logs')
      .select('atividade, completada')
      .eq('celular', celular)
      .eq('data', hoje)
    if (error) return []
    return data || []
  } catch (e) {
    return []
  }
}

/**
 * Busca logs de um intervalo de datas para o relatório de progresso
 */
export async function loadLogsRange(celular, diasAtras = 30) {
  if (!celular) return { water: [], workouts: [], activities: [] }
  const inicio = new Date()
  inicio.setDate(inicio.getDate() - diasAtras)
  const inicioStr = toISODate(inicio)
  const hoje = toISODate()

  try {
    const [waterRes, workoutRes, activityRes] = await Promise.all([
      supabase.from('water_logs').select('*').eq('celular', celular).gte('data', inicioStr).lte('data', hoje),
      supabase.from('workout_logs').select('*').eq('celular', celular).gte('data', inicioStr).lte('data', hoje),
      supabase.from('activity_logs').select('*').eq('celular', celular).gte('data', inicioStr).lte('data', hoje),
    ])
    return {
      water: waterRes.data || [],
      workouts: workoutRes.data || [],
      activities: activityRes.data || []
    }
  } catch (e) {
    console.warn('[Logs] Erro ao buscar histórico:', e.message)
    return { water: [], workouts: [], activities: [] }
  }
}

/**
 * Salva atividades extras no perfil do usuário (ao editar perfil)
 */
export async function saveAtividadesExtras(celular, atividadesExtras) {
  if (!celular) return
  try {
    const { error } = await supabase
      .from('profiles')
      .update({ atividades_extras: atividadesExtras })
      .eq('celular', celular)
    if (error) console.warn('[Perfil] Erro ao salvar atividades:', error.message)
    else console.log('[Perfil] ✅ Atividades extras salvas no Supabase')
  } catch (e) {
    console.warn('[Perfil] Offline:', e.message)
  }
}
