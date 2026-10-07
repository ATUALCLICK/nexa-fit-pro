/* ================================================================
   NEXA FIT PRO — Meta Tracking Module
   ================================================================
   Gerencia:
   1. Cookie _fbp (Browser ID) — gerado pelo Pixel ou manualmente
   2. Cookie _fbc (Click ID)  — capturado do parâmetro fbclid na URL
   3. Eventos do Pixel (browser-side via fbq)
   4. API de Conversões (server-side via Supabase Edge Function)
   5. Desduplicação entre browser e servidor via event_id
   ================================================================ */

import { supabase } from './supabase'

// ─── Configuração ───────────────────────────────────────────────
const META_PIXEL_ID = '1047082891638328'

// ─── Utilitários de Cookie ──────────────────────────────────────

/**
 * Lê o valor de um cookie pelo nome
 */
function getCookie(name) {
  const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'))
  return match ? decodeURIComponent(match[2]) : null
}

/**
 * Define um cookie com expiração em dias
 */
function setCookie(name, value, days = 90) {
  const expires = new Date(Date.now() + days * 864e5).toUTCString()
  // Usa SameSite=Lax para compatibilidade e segurança
  document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/; SameSite=Lax`
}

// ─── Gerenciamento do _fbp (Browser ID) ─────────────────────────

/**
 * Obtém ou gera o _fbp (Facebook Browser Parameter).
 * Formato: fb.1.<creationTime>.<randomNumber>
 * 
 * O Pixel da Meta normalmente gera isso automaticamente,
 * mas garantimos que sempre exista para envio via CAPI.
 */
export function getFbp() {
  let fbp = getCookie('_fbp')
  if (!fbp) {
    // Gera um _fbp no mesmo formato do Pixel
    const creationTime = Date.now()
    const randomNumber = Math.floor(Math.random() * 9999999999) + 1000000000
    fbp = `fb.1.${creationTime}.${randomNumber}`
    setCookie('_fbp', fbp, 90)
  }
  return fbp
}

// ─── Gerenciamento do _fbc (Click ID) ───────────────────────────

/**
 * Captura o fbclid da URL e formata como _fbc.
 * Formato: fb.1.<creationTime>.<fbclid>
 * 
 * - subdomainIndex = 1 (padrão para domínio principal)
 * - creationTime = timestamp em ms quando o fbclid foi observado
 * - fbclid = valor do parâmetro de consulta
 * 
 * Só sobrescreve o cookie se:
 *   1. O cookie _fbc não existir, OU
 *   2. O fbclid na URL for diferente do armazenado no cookie
 */
export function captureFbclid() {
  try {
    const urlParams = new URLSearchParams(window.location.search)
    const fbclid = urlParams.get('fbclid')

    if (!fbclid) return getCookie('_fbc')

    const existingFbc = getCookie('_fbc')

    // Extrai o fbclid do cookie existente (último segmento após o 3º ponto)
    if (existingFbc) {
      const parts = existingFbc.split('.')
      const storedClickId = parts.slice(3).join('.')
      if (storedClickId === fbclid) {
        return existingFbc // Já temos o mesmo ClickID, não precisa atualizar
      }
    }

    // Formata: fb.1.<timestamp_ms>.<fbclid>
    const fbc = `fb.1.${Date.now()}.${fbclid}`
    setCookie('_fbc', fbc, 90)

    // Também salva no localStorage como backup (cookies podem ser limpos)
    try {
      localStorage.setItem('nexafit_fbc', fbc)
      localStorage.setItem('nexafit_fbclid', fbclid)
    } catch (e) { /* localStorage pode não estar disponível */ }

    return fbc
  } catch (e) {
    console.warn('[MetaTracking] Erro ao capturar fbclid:', e)
    return getCookie('_fbc')
  }
}

/**
 * Obtém o _fbc atual (do cookie ou localStorage como fallback)
 */
export function getFbc() {
  return getCookie('_fbc') || localStorage.getItem('nexafit_fbc') || null
}

// ─── Gerador de Event ID para Desduplicação ─────────────────────

/**
 * Gera um event_id único para desduplicação entre Pixel (browser)
 * e API de Conversões (servidor). Ambos devem enviar o mesmo
 * event_id para que a Meta descarte a duplicata.
 */
function generateEventId() {
  return `nfp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

// ─── Hashing SHA-256 (para dados PII no CAPI) ──────────────────

/**
 * Faz hash SHA-256 de um valor string.
 * Obrigatório para: em, ph, fn, ln, ge, db, ct, st, zp, country
 * NÃO fazer hash em: fbc, fbp, client_ip_address, client_user_agent
 */
async function sha256(value) {
  if (!value) return null
  const normalized = value.toString().trim().toLowerCase()
  if (!normalized) return null
  const encoder = new TextEncoder()
  const data = encoder.encode(normalized)
  const hashBuffer = await crypto.subtle.digest('SHA-256', data)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
}

// ─── Eventos do Pixel (Browser-side) ────────────────────────────

/**
 * Dispara um evento padrão do Pixel com event_id para desduplicação
 */
function firePixelEvent(eventName, params = {}, eventId) {
  if (typeof window.fbq !== 'function') {
    console.warn('[MetaTracking] fbq não disponível')
    return
  }
  window.fbq('track', eventName, params, { eventID: eventId })
}

/**
 * Dispara um evento personalizado do Pixel
 */
function firePixelCustomEvent(eventName, params = {}, eventId) {
  if (typeof window.fbq !== 'function') {
    console.warn('[MetaTracking] fbq não disponível')
    return
  }
  window.fbq('trackCustom', eventName, params, { eventID: eventId })
}

// ─── API de Conversões (Server-side via Supabase Edge Function) ─

/**
 * Envia evento para a API de Conversões da Meta via Supabase Edge Function.
 * 
 * Isso garante que o token de acesso fique seguro no servidor
 * e permite enviar dados adicionais como IP do cliente.
 */
async function sendServerEvent(eventName, eventId, userData = {}, customData = {}) {
  try {
    const fbp = getFbp()
    const fbc = getFbc()

    // Prepara user_data com hashing obrigatório
    const hashedUserData = {
      // Não converter em hashes:
      fbp: fbp,
      fbc: fbc,
      client_user_agent: navigator.userAgent,
      // client_ip_address será capturado pela Edge Function no servidor

      // Com hashing (SHA-256):
      ...(userData.email && { em: [await sha256(userData.email)] }),
      ...(userData.phone && { ph: [await sha256(userData.phone)] }),
      ...(userData.firstName && { fn: [await sha256(userData.firstName)] }),
      ...(userData.lastName && { ln: [await sha256(userData.lastName)] }),
      ...(userData.externalId && { external_id: [await sha256(userData.externalId)] }),
    }

    const eventData = {
      event_name: eventName,
      event_time: Math.floor(Date.now() / 1000),
      event_id: eventId,
      event_source_url: window.location.href,
      action_source: 'website',
      user_data: hashedUserData,
      ...(Object.keys(customData).length > 0 && { custom_data: customData }),
    }

    // Envia para a Edge Function do Supabase (token fica seguro no servidor)
    const { data, error } = await supabase.functions.invoke('meta-capi', {
      body: {
        data: [eventData],
        pixel_id: META_PIXEL_ID,
      },
    })

    if (error) {
      console.warn('[MetaTracking] Erro CAPI:', error)
    } else {
      console.log(`[MetaTracking] CAPI ${eventName} enviado:`, data)
    }

    return data
  } catch (err) {
    console.warn('[MetaTracking] Erro ao enviar evento servidor:', err)
  }
}

// ─── API Pública: Eventos de Tracking ───────────────────────────

/**
 * Inicializa o tracking: captura fbclid, gera/valida _fbp.
 * Chamar no carregamento da aplicação (App.jsx).
 */
export function initMetaTracking() {
  // 1. Garante que _fbp existe
  getFbp()

  // 2. Captura fbclid da URL se presente
  captureFbclid()

  // 3. Limpa o fbclid da URL para não poluir (opcional, mantém URL limpa)
  cleanFbclidFromUrl()

  console.log('[MetaTracking] Inicializado', {
    fbp: getFbp(),
    fbc: getFbc(),
  })
}

/**
 * Remove o parâmetro fbclid da URL sem recarregar a página.
 * Mantém todos os outros parâmetros intactos.
 */
function cleanFbclidFromUrl() {
  try {
    const url = new URL(window.location.href)
    if (url.searchParams.has('fbclid')) {
      url.searchParams.delete('fbclid')
      const cleanUrl = url.pathname + url.search + url.hash
      window.history.replaceState({}, '', cleanUrl || '/')
    }
  } catch (e) { /* silencioso */ }
}

/**
 * Track PageView — disparado no carregamento da página
 * O Pixel já faz isso no <head>, mas enviamos também via CAPI.
 */
export function trackPageView(userData = {}) {
  const eventId = generateEventId()
  // Pixel já dispara PageView no <head>, mas podemos enviar via CAPI
  sendServerEvent('PageView', eventId, userData)
}

/**
 * Track ViewContent — quando o usuário visualiza conteúdo relevante
 * Ex: página de produto, treino específico, etc.
 */
export function trackViewContent(contentName, contentCategory, value, currency = 'BRL', userData = {}) {
  const eventId = generateEventId()
  const params = {
    content_name: contentName,
    content_category: contentCategory,
    ...(value && { value: value.toString(), currency }),
  }
  firePixelEvent('ViewContent', params, eventId)
  sendServerEvent('ViewContent', eventId, userData, params)
}

/**
 * Track Lead — quando o usuário demonstra interesse
 * Ex: completar quiz, cadastro, etc.
 */
export function trackLead(userData = {}, customData = {}) {
  const eventId = generateEventId()
  firePixelEvent('Lead', customData, eventId)
  sendServerEvent('Lead', eventId, userData, customData)
}

/**
 * Track CompleteRegistration — registro/cadastro finalizado
 */
export function trackCompleteRegistration(userData = {}, customData = {}) {
  const eventId = generateEventId()
  const params = { status: 'complete', ...customData }
  firePixelEvent('CompleteRegistration', params, eventId)
  sendServerEvent('CompleteRegistration', eventId, userData, params)
}

/**
 * Track InitiateCheckout — início do checkout/pagamento
 */
export function trackInitiateCheckout(value, currency = 'BRL', userData = {}, customData = {}) {
  const eventId = generateEventId()
  const params = {
    value: value.toString(),
    currency,
    ...customData,
  }
  firePixelEvent('InitiateCheckout', params, eventId)
  sendServerEvent('InitiateCheckout', eventId, userData, params)
}

/**
 * Track Purchase — compra finalizada
 */
export function trackPurchase(value, currency = 'BRL', userData = {}, customData = {}) {
  const eventId = generateEventId()
  const params = {
    value: value.toString(),
    currency,
    ...customData,
  }
  firePixelEvent('Purchase', params, eventId)
  sendServerEvent('Purchase', eventId, userData, params)
}

/**
 * Track AddToCart — item adicionado ao carrinho
 */
export function trackAddToCart(contentName, value, currency = 'BRL', userData = {}) {
  const eventId = generateEventId()
  const params = {
    content_name: contentName,
    value: value.toString(),
    currency,
  }
  firePixelEvent('AddToCart', params, eventId)
  sendServerEvent('AddToCart', eventId, userData, params)
}

/**
 * Track evento personalizado genérico
 */
export function trackCustomEvent(eventName, params = {}, userData = {}) {
  const eventId = generateEventId()
  firePixelCustomEvent(eventName, params, eventId)
  sendServerEvent(eventName, eventId, userData, params)
}

/**
 * Retorna os parâmetros atuais de tracking para debug ou envio manual
 */
export function getTrackingParams() {
  return {
    pixelId: META_PIXEL_ID,
    fbp: getFbp(),
    fbc: getFbc(),
    userAgent: navigator.userAgent,
    currentUrl: window.location.href,
  }
}
