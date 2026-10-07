/* ================================================================
   NEXA FIT PRO — Módulo de Rastreamento Avançado de Funil (Quiz Tracker)
   Inlead-Model Tracking:
   - Captura de UTMs (Campanha, Criativo/utm_content, Origem, etc.)
   - Rastreamento etapa por etapa e respostas em tempo real
   - Persistência híbrida (Supabase + localStorage de contingência)
   - Prontidão para Remarketing e Automação de E-mails
   ================================================================ */

import { supabase } from './supabase'

const STORAGE_SESSION_KEY = 'nexafit_active_session_id'
const STORAGE_SESSIONS_LIST = 'nexafit_quiz_sessions_cache'
const STORAGE_UTMS_KEY = 'nexafit_tracked_utms'

/**
 * Detecta tipo de dispositivo
 */
function getDeviceType() {
  if (typeof navigator === 'undefined') return 'Desktop'
  const ua = navigator.userAgent
  if (/(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(ua)) return 'Tablet'
  if (/Mobile|Android|iP(hone|od)|IEMobile|BlackBerry|Kindle|Silk-Accelerated|(hpw|web)OS|Opera M(obi|ini)/.test(ua)) return 'Mobile'
  return 'Desktop'
}

/**
 * Captura todas as UTMs e parâmetros de rastreamento da URL
 */
export function captureUtms() {
  if (typeof window === 'undefined') return {}

  try {
    const params = new URLSearchParams(window.location.search)
    const existing = JSON.parse(localStorage.getItem(STORAGE_UTMS_KEY) || '{}')

    const currentUtms = {
      utm_source: params.get('utm_source') || existing.utm_source || 'direto',
      utm_medium: params.get('utm_medium') || existing.utm_medium || 'organico',
      utm_campaign: params.get('utm_campaign') || existing.utm_campaign || 'padrao',
      utm_content: params.get('utm_content') || existing.utm_content || 'criativo_padrao', // Criativo do anúncio!
      utm_term: params.get('utm_term') || existing.utm_term || '',
      src: params.get('src') || existing.src || '',
      sck: params.get('sck') || existing.sck || '',
      referrer: document.referrer || existing.referrer || 'direto',
      captured_at: new Date().toISOString()
    }

    // Se houver novos parâmetros na URL, sobrescreve
    if (params.get('utm_source') || params.get('utm_campaign') || params.get('utm_content')) {
      localStorage.setItem(STORAGE_UTMS_KEY, JSON.stringify(currentUtms))
    } else if (!localStorage.getItem(STORAGE_UTMS_KEY)) {
      localStorage.setItem(STORAGE_UTMS_KEY, JSON.stringify(currentUtms))
    }

    return currentUtms
  } catch (e) {
    return { utm_source: 'direto', utm_campaign: 'padrao', utm_content: 'criativo_padrao' }
  }
}

/**
 * Obtém ou inicia uma sessão única para o visitante atual
 */
export function getOrInitSession() {
  if (typeof window === 'undefined') return null

  try {
    let sessionId = sessionStorage.getItem(STORAGE_SESSION_KEY)
    if (!sessionId) {
      sessionId = `nexa_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`
      sessionStorage.setItem(STORAGE_SESSION_KEY, sessionId)
    }

    return sessionId
  } catch (e) {
    return `nexa_${Date.now()}`
  }
}

/**
 * Salva a sessão no cache local para resiliência imediata
 */
function saveSessionToLocalCache(sessionData) {
  try {
    const raw = localStorage.getItem(STORAGE_SESSIONS_LIST)
    let list = raw ? JSON.parse(raw) : []

    const index = list.findIndex(s => s.session_id === sessionData.session_id)
    if (index >= 0) {
      list[index] = { ...list[index], ...sessionData, updated_at: new Date().toISOString() }
    } else {
      list.unshift({ ...sessionData, updated_at: new Date().toISOString() })
    }

    // Mantém as últimas 200 sessões locais
    if (list.length > 200) list = list.slice(0, 200)

    localStorage.setItem(STORAGE_SESSIONS_LIST, JSON.stringify(list))
  } catch (e) {
    console.warn('[QuizTracker] Erro ao salvar cache local:', e)
  }
}

// Timer para debouncing de sync com Supabase
let syncTimeout = null

/**
 * Rastreia etapa e respostas do Quiz
 */
export async function trackQuizStep(screen, stepIndex, totalSteps, answers = {}, extra = {}) {
  try {
    const sessionId = getOrInitSession()
    const utms = captureUtms()
    const device = getDeviceType()

    // Determina o status com base no avanço
    let status = 'in_progress'
    const progressPct = totalSteps > 0 ? (stepIndex / totalSteps) * 100 : 0

    if (answers?.email) {
      status = 'lead_captured'
    } else if (progressPct >= 50) {
      status = 'qualified'
    }

    if (screen?.type === 'checkout' || screen?.id === 'checkout') {
      status = 'checkout_reached'
    }

    // Recupera histórico de etapas anteriores para rastrear toda a jornada
    let currentHistory = []
    try {
      const raw = localStorage.getItem(STORAGE_SESSIONS_LIST)
      if (raw) {
        const list = JSON.parse(raw)
        const found = list.find(s => s.session_id === sessionId)
        if (found && Array.isArray(found.steps_history)) {
          currentHistory = found.steps_history
        }
      }
    } catch (e) {}

    const screenId = screen?.id || `etapa_${stepIndex}`
    const lastHistoryItem = currentHistory[currentHistory.length - 1]
    if (!lastHistoryItem || lastHistoryItem.screen_id !== screenId) {
      currentHistory = [
        ...currentHistory,
        {
          step_number: stepIndex,
          screen_id: screenId,
          type: screen?.type || 'question',
          visited_at: new Date().toISOString()
        }
      ]
    }

    const payload = {
      id: sessionId,
      session_id: sessionId,
      email: answers?.email || null,
      name: answers?.name || null,
      gender: answers?.gender || null,
      age: answers?.age || answers?.ageInput || null,
      goal: answers?.goal || null,
      location: answers?.location || null,
      body_type: answers?.bodyType || null,
      dream_body: answers?.dreamBody || null,
      current_weight: answers?.weight ? `${answers.weight}kg` : null,
      target_weight: answers?.goalWeight ? `${answers.goalWeight}kg` : null,
      height: answers?.height ? `${answers.height}cm` : null,
      imc: answers?.imc ? String(answers.imc) : null,
      highest_screen: screen?.id || `etapa_${stepIndex}`,
      step_number: stepIndex,
      total_steps: totalSteps || 32,
      status,
      answers: answers || {},
      steps_history: currentHistory,
      utm_source: utms.utm_source || 'direto',
      utm_medium: utms.utm_medium || 'organico',
      utm_campaign: utms.utm_campaign || 'padrao',
      utm_content: utms.utm_content || 'criativo_padrao',
      utm_term: utms.utm_term || '',
      referrer: utms.referrer || 'direto',
      user_agent: typeof navigator !== 'undefined' ? navigator.userAgent : '',
      device_type: device,
      recovery_status: extra?.recovery_status || 'pending',
      updated_at: new Date().toISOString()
    }

    // 1. Grava no cache local imediatamente (síncrono e ultra rápido)
    saveSessionToLocalCache(payload)

    // 2. Sincroniza com Supabase via debounce para evitar saturação
    if (syncTimeout) clearTimeout(syncTimeout)
    syncTimeout = setTimeout(async () => {
      try {
        const { error } = await supabase
          .from('quiz_sessions')
          .upsert(payload, { onConflict: 'session_id' })

        if (error) {
          // Pode ocorrer se a tabela ainda não foi criada via SQL
          // Mantemos silencioso pois o cache local já protege os dados
        }
      } catch (err) {
        // Falha de rede ou tabela ausente
      }
    }, 400)

    return payload
  } catch (e) {
    console.warn('[QuizTracker] Erro ao registrar etapa:', e)
    return null
  }
}

/**
 * Rastreia clique no botão de compra do checkout
 */
export async function trackQuizCheckout(plan, answers = {}) {
  try {
    const sessionId = getOrInitSession()
    const utms = captureUtms()

    const payload = {
      session_id: sessionId,
      status: 'checkout_clicked',
      answers: {
        ...answers,
        selected_plan: plan?.id || 'anual',
        checkout_clicked_at: new Date().toISOString()
      },
      updated_at: new Date().toISOString()
    }

    saveSessionToLocalCache(payload)

    await supabase
      .from('quiz_sessions')
      .update(payload)
      .eq('session_id', sessionId)
  } catch (e) {
    console.warn('[QuizTracker] Erro ao registrar checkout:', e)
  }
}

/**
 * Busca todas as sessões registradas (Supabase com merge do cache local)
 */
export async function getTrackedSessions() {
  let remoteSessions = []
  let localSessions = []

  // 1. Tenta buscar do cache local
  try {
    const local = localStorage.getItem(STORAGE_SESSIONS_LIST)
    if (local) localSessions = JSON.parse(local)
  } catch (e) {}

  // 2. Tenta buscar do Supabase
  try {
    const { data, error } = await supabase
      .from('quiz_sessions')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(500)

    if (!error && Array.isArray(data)) {
      remoteSessions = data
    }
  } catch (e) {}

  // 3. Mescla sessões remotas e locais sem duplicação
  const map = new Map()

  // Adiciona locais primeiro
  localSessions.forEach(s => {
    if (s.session_id) map.set(s.session_id, s)
  })

  // Sobrescreve/adiciona remotas
  remoteSessions.forEach(s => {
    if (s.session_id) {
      const existing = map.get(s.session_id)
      map.set(s.session_id, { ...existing, ...s })
    }
  })

  const merged = Array.from(map.values()).sort((a, b) => {
    const tA = new Date(a.updated_at || a.created_at || 0).getTime()
    const tB = new Date(b.updated_at || b.created_at || 0).getTime()
    return tB - tA
  })

  return merged
}

/**
 * Atualiza o status de recuperação de e-mail de um lead
 */
export async function updateLeadRecoveryStatus(sessionId, status, emailSubject = '') {
  try {
    const updateData = {
      recovery_status: status,
      recovery_sent_at: new Date().toISOString(),
      last_email_subject: emailSubject,
      updated_at: new Date().toISOString()
    }

    // Atualiza no cache local
    saveSessionToLocalCache({ session_id: sessionId, ...updateData })

    // Atualiza no Supabase
    await supabase
      .from('quiz_sessions')
      .update(updateData)
      .eq('session_id', sessionId)

    return true
  } catch (e) {
    console.warn('[QuizTracker] Erro ao atualizar status de recuperação:', e)
    return false
  }
}

/**
 * Calcula métricas de alto nível estilo Inlead a partir de uma lista de sessões
 */
export function calculateInleadMetrics(sessions = []) {
  const total = sessions.length
  if (total === 0) {
    return {
      visitors: 0,
      leads: 0,
      interactionRate: '0.0%',
      qualifiedLeads: 0,
      completeFlows: 0,
      withEmail: 0,
      checkoutClicks: 0
    }
  }

  // Visitantes que interagiram além da primeira tela
  const leads = sessions.filter(s => s.step_number > 0 || Object.keys(s.answers || {}).length > 0).length

  // Taxa de interação
  const interactionRate = total > 0 ? ((leads / total) * 100).toFixed(1) + '%' : '0.0%'

  // Leads qualificados: mais de 50% das etapas
  const qualifiedLeads = sessions.filter(s => {
    const pct = s.total_steps ? (s.step_number / s.total_steps) * 100 : 0
    return pct >= 50 || s.status === 'qualified' || s.status === 'lead_captured' || s.status === 'checkout_reached'
  }).length

  // Fluxos completos: passaram da última etapa ou chegaram no checkout
  const completeFlows = sessions.filter(s => {
    return s.status === 'checkout_reached' || s.status === 'checkout_clicked' || s.highest_screen === 'checkout' || (s.step_number >= (s.total_steps || 30) - 2)
  }).length

  // Leads com e-mail capturado
  const withEmail = sessions.filter(s => s.email && s.email.includes('@')).length

  // Cliques no checkout
  const checkoutClicks = sessions.filter(s => s.status === 'checkout_clicked').length

  return {
    visitors: total,
    leads,
    interactionRate,
    qualifiedLeads,
    completeFlows,
    withEmail,
    checkoutClicks
  }
}
