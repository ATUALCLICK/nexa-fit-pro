// Vercel Serverless API Route: /api/lastlink-webhook
// URL: https://[SEU-DOMINIO-VERCEL]/api/lastlink-webhook?token=0e0071cf2ab14a2a9bbb0b5aec9d622c

import { createClient } from '@supabase/supabase-js'

const LASTLINK_SECRET_TOKEN = '0e0071cf2ab14a2a9bbb0b5aec9d622c'
const VALID_TOKENS = new Set([
  '0e0071cf2ab14a2a9bbb0b5aec9d622c',
  '6d9a16cc47634266a6983c8aec4ce319',
  'a342d08de5754a8abfa9e79c27aa060c',
  '9af28bbe1fea4c16a2e4f860e2b388cd'
])

// Mapeamento dos Códigos de Produtos da LastLink para Planos Nexa Fit
const PRODUCT_MAP = {
  'C29E63DD9': { id: '1m', name: 'Plano Mensal (30 dias)', days: 30 },
  'CD478083B': { id: '6m', name: 'Plano Semestral (180 dias)', days: 180 },
  'C3DFDBF21': { id: '12m', name: 'Plano Anual Completo (365 dias)', days: 365 }
}

const SUPABASE_URL = process.env.SUPABASE_URL || 'https://zebunzuydwsudexdvmhu.supabase.co'
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_wLYMf9X2A5nDtdR3kcT87g_z8FUpseM'

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

export default async function handler(req, res) {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, x-lastlink-token, token')

  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }

  if (req.method === 'GET') {
    return res.status(200).json({
      status: 'online',
      message: 'Nexa Fit Pro LastLink Webhook endpoint está ativo e pronto para receber notificações de compra.'
    })
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' })
  }

  try {
    const queryToken = req.query?.token
    let body = req.body || {}
    if (typeof body === 'string') {
      try {
        body = JSON.parse(body)
      } catch (e) {
        console.warn('Could not parse string body as JSON:', e)
      }
    }

    const headerToken = req.headers['x-lastlink-token'] || req.headers['token'] || req.headers['authorization']?.replace('Bearer ', '')

    // Validação de Token de Segurança
    const receivedToken = headerToken || queryToken || body.token || body.secret
    if (receivedToken && !VALID_TOKENS.has(receivedToken)) {
      console.warn('Unauthorized webhook attempt with token:', receivedToken)
      return res.status(401).json({ error: 'Unauthorized token' })
    }

    console.log('LastLink Webhook received payload:', JSON.stringify(body))

    // Identificação do Evento
    const eventType = (body.event || body.type || body.status || body.event_name || 'venda-aprovada').toString().toLowerCase()

    // Extração dos dados do comprador
    const buyerEmail = (
      body.buyer?.email ||
      body.customer?.email ||
      body.client?.email ||
      body.data?.buyer?.email ||
      body.data?.customer?.email ||
      body.email ||
      ''
    ).toString().toLowerCase().trim()

    const buyerName = (
      body.buyer?.name ||
      body.customer?.name ||
      body.client?.name ||
      body.data?.buyer?.name ||
      body.data?.customer?.name ||
      body.name ||
      buyerEmail.split('@')[0] ||
      'Aluno Nexa Fit'
    ).toString().trim()

    // Identificação do Produto / Plano
    const rawProductId = (
      body.product?.id ||
      body.product?.code ||
      body.product_id ||
      body.productId ||
      body.data?.product?.id ||
      body.data?.product?.code ||
      body.offer_id ||
      body.offerCode ||
      ''
    ).toString().toUpperCase().trim()

    const planConfig = PRODUCT_MAP[rawProductId] || PRODUCT_MAP['C3DFDBF21'] // Default Anual
    const transactionId = body.transaction_id || body.order_id || body.id || `LL-${Date.now()}`

    if (!buyerEmail) {
      return res.status(400).json({ error: 'No buyer email found in payload', received: body })
    }

    // Eventos de Cancelamento ou Reembolso
    const isCancelled = eventType.includes('cancel') || eventType.includes('reembols') || eventType.includes('estorno') || eventType.includes('refund')

    const now = new Date()
    const purchasedAt = now.toISOString()
    const expiresDate = new Date()
    expiresDate.setDate(expiresDate.getDate() + (isCancelled ? -1 : planConfig.days))
    const expiresAt = expiresDate.toISOString()

    const subscriptionRecord = {
      email: buyerEmail,
      name: buyerName,
      planId: planConfig.id,
      planName: planConfig.name,
      productId: rawProductId,
      durationDays: planConfig.days,
      purchasedAt,
      expiresAt,
      status: isCancelled ? 'refunded' : 'paid',
      transactionId,
      source: 'lastlink',
      updatedAt: purchasedAt
    }

    // Salva ou atualiza no Supabase na tabela 'profiles'
    const { data: profile, error: profileErr } = await supabase
      .from('profiles')
      .upsert({
        email: buyerEmail,
        nome: buyerName,
        daily_logs: {
          subscription: subscriptionRecord,
          updated_at: purchasedAt
        }
      }, { onConflict: 'email' })
      .select()

    if (profileErr) {
      console.error('Supabase profile upsert error:', profileErr)
    }

    return res.status(200).json({
      success: true,
      message: isCancelled ? 'Access revoked successfully' : 'Access granted successfully',
      email: buyerEmail,
      plan: planConfig.name,
      expiresAt,
      status: subscriptionRecord.status
    })
  } catch (error) {
    console.error('Webhook error:', error)
    return res.status(500).json({ error: error.message })
  }
}
