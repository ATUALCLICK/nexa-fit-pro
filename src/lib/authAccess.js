/* ========================================================
   NEXA FIT PRO — Gerenciador de Autenticação, Planos & Webhooks
   Validação por E-mail de Compra • Duração de Planos (1, 3 e 12 meses)
   Sincronização com Supabase e IndexedDB Local
   ======================================================== */

import { supabase } from './supabase'

// Definição dos Planos Disponíveis com Links da Lastlink
export const PLANS_CONFIG = {
  '1m': {
    id: '1m',
    productId: 'C29E63DD9',
    name: 'Plano Mensal (30 dias)',
    durationDays: 30,
    durationMonths: 1,
    priceFormatted: 'R$ 29,90',
    checkoutUrl: 'https://lastlink.com/p/C29E63DD9/checkout-payment/'
  },
  '6m': {
    id: '6m',
    productId: 'CD478083B',
    name: 'Plano Semestral (180 dias)',
    durationDays: 180,
    durationMonths: 6,
    priceFormatted: 'R$ 47,90',
    checkoutUrl: 'https://lastlink.com/p/CD478083B/checkout-payment/'
  },
  '12m': {
    id: '12m',
    productId: 'C3DFDBF21',
    name: 'Plano Anual Completo (365 dias)',
    durationDays: 365,
    durationMonths: 12,
    priceFormatted: 'R$ 78,46',
    checkoutUrl: 'https://lastlink.com/p/C3DFDBF21/checkout-payment/'
  }
}

// Banco local de compras simuladas/sincronizadas (persistido em localStorage)
const STORAGE_KEY_PURCHASES = 'nexafit_purchases_registry'
const STORAGE_KEY_AUTH_USER = 'nexafit_auth_user'
const STORAGE_KEY_SUBSCRIPTION = 'nexafit_subscription'

// Inicializa banco de compras pré-cadastradas para testes imediatos
export function getRegisteredPurchases() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_PURCHASES)
    if (raw) return JSON.parse(raw)
  } catch (e) {}

  // Contas padrão de demonstração e teste
  const initial = [
    {
      email: 'demo@nexafit.pro',
      name: 'Aluno VIP Demonstração',
      planId: '12m',
      planName: 'Plano Anual Completo (365 dias)',
      purchasedAt: new Date(Date.now() - 5 * 24 * 3600 * 1000).toISOString(),
      expiresAt: new Date(Date.now() + 360 * 24 * 3600 * 1000).toISOString(),
      status: 'paid',
      transactionId: 'NEXA-DEMO-2026-VIP'
    },
    {
      email: 'aluno@nexafit.pro',
      name: 'Aluno Nexa Fit',
      planId: '3m',
      planName: 'Plano Trimestral (90 dias)',
      purchasedAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 90 * 24 * 3600 * 1000).toISOString(),
      status: 'paid',
      transactionId: 'NEXA-3M-TRIMESTRAL'
    }
  ]
  localStorage.setItem(STORAGE_KEY_PURCHASES, JSON.stringify(initial))
  return initial
}

/**
 * Registra ou atualiza uma compra recebida via Webhook (Kiwify, Hotmart, Cakto, PerfectPay, Eduzz, Stripe)
 */
export async function registerWebhookPurchase({
  email,
  name = '',
  planId = '12m',
  status = 'paid',
  transactionId = `TX-${Date.now()}`,
  customDurationDays = null
}) {
  if (!email) throw new Error('E-mail obrigatório')
  const cleanEmail = email.toLowerCase().trim()
  const plan = PLANS_CONFIG[planId] || PLANS_CONFIG['12m']
  const durationDays = customDurationDays || plan.durationDays

  const purchasedAt = new Date().toISOString()
  const expiresDate = new Date()
  expiresDate.setDate(expiresDate.getDate() + durationDays)
  const expiresAt = expiresDate.toISOString()

  const newRecord = {
    email: cleanEmail,
    name: name || cleanEmail.split('@')[0],
    planId: plan.id,
    planName: plan.name,
    durationDays,
    purchasedAt,
    expiresAt,
    status,
    transactionId
  }

  // 1. Salva no banco local
  const current = getRegisteredPurchases()
  const filtered = current.filter(p => p.email !== cleanEmail)
  filtered.push(newRecord)
  localStorage.setItem(STORAGE_KEY_PURCHASES, JSON.stringify(filtered))

  // 2. Tenta sincronizar com Supabase se disponível
  try {
    if (supabase) {
      await supabase.from('profiles').upsert({
        email: cleanEmail,
        nome: newRecord.name,
        daily_logs: {
          subscription: newRecord,
          updated_at: purchasedAt
        }
      }, { onConflict: 'email' })
    }
  } catch (err) {
    console.warn('Supabase webhook sync fallback to local:', err)
  }

  return newRecord
}

/**
 * Valida o acesso do aluno pelo e-mail de compra
 */
export async function validatePurchaseEmail(inputEmail) {
  if (!inputEmail) {
    return { success: false, error: 'Por favor, informe seu e-mail de compra.' }
  }

  const cleanEmail = inputEmail.toLowerCase().trim()

  // 1. Busca no Supabase se houver conexão
  let remoteRecord = null
  try {
    if (supabase) {
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('email', cleanEmail)
        .maybeSingle()

      if (data && data.daily_logs?.subscription) {
        remoteRecord = data.daily_logs.subscription
      }
    }
  } catch (e) {
    console.warn('Supabase query error:', e)
  }

  // 2. Busca no registro local de compras
  const localPurchases = getRegisteredPurchases()
  const localRecord = localPurchases.find(p => p.email === cleanEmail)

  const purchase = remoteRecord || localRecord

  // Se não encontrou compra aprovada
  if (!purchase) {
    return {
      success: false,
      error: 'E-mail não encontrado na base de compradores.',
      hint: 'Certifique-se de usar o mesmo e-mail digitado no momento do pagamento do PIX ou Cartão.'
    }
  }

  // 3. Verifica expiração do plano
  const now = new Date()
  const expiresAtDate = new Date(purchase.expiresAt)
  const isExpired = now > expiresAtDate

  if (isExpired) {
    return {
      success: false,
      error: 'Seu período de acesso ao plano expirou.',
      isExpired: true,
      planName: purchase.planName,
      expiredDateFormatted: expiresAtDate.toLocaleDateString('pt-BR'),
      hint: 'Renove seu plano com desconto especial para continuar acessando todos os treinos e cardápios.'
    }
  }

  // 4. Calcula dias restantes
  const diffTime = Math.abs(expiresAtDate - now)
  const daysRemaining = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

  const session = {
    user: {
      email: cleanEmail,
      name: purchase.name || cleanEmail.split('@')[0],
      avatar: '/logo.png'
    },
    subscription: {
      ...purchase,
      daysRemaining,
      expiresDateFormatted: expiresAtDate.toLocaleDateString('pt-BR'),
      isValid: true
    }
  }

  // Persiste sessão ativa
  localStorage.setItem(STORAGE_KEY_AUTH_USER, JSON.stringify(session.user))
  localStorage.setItem(STORAGE_KEY_SUBSCRIPTION, JSON.stringify(session.subscription))
  localStorage.setItem('nexafit_purchased', 'true')
  localStorage.setItem('nexafit_email', cleanEmail)
  if (purchase.name) localStorage.setItem('nexafit_name', purchase.name)

  return {
    success: true,
    user: session.user,
    subscription: session.subscription
  }
}

/**
 * Retorna o usuário e plano atualmente autenticados
 */
export function getCurrentAuthSession() {
  try {
    const userRaw = localStorage.getItem(STORAGE_KEY_AUTH_USER)
    const subRaw = localStorage.getItem(STORAGE_KEY_SUBSCRIPTION)
    if (!userRaw || !subRaw) return null

    const user = JSON.parse(userRaw)
    const subscription = JSON.parse(subRaw)

    // Verifica se ainda está válido no momento
    const now = new Date()
    const expiresAtDate = new Date(subscription.expiresAt)
    if (now > expiresAtDate) {
      return { user, subscription: { ...subscription, isExpired: true, isValid: false } }
    }

    const diffTime = Math.abs(expiresAtDate - now)
    const daysRemaining = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    return {
      user,
      subscription: {
        ...subscription,
        daysRemaining,
        isValid: true
      }
    }
  } catch (e) {
    return null
  }
}

/**
 * Desconecta a sessão atual
 */
export function logoutUser() {
  localStorage.removeItem(STORAGE_KEY_AUTH_USER)
  localStorage.removeItem(STORAGE_KEY_SUBSCRIPTION)
  localStorage.removeItem('nexafit_purchased')
  window.location.href = '/login'
}
