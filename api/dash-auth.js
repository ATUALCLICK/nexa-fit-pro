// Vercel Serverless Function: /api/dash-auth
// Autenticação Segura do Dashboard Privilegiado
// A senha NUNCA é exposta no frontend.

import crypto from 'crypto'

const DASH_PASSWORD = process.env.DASH_PASSWORD || '15062929'
const TOKEN_SECRET = process.env.DASH_SECRET || 'nexa_fit_dash_secret_salt_2026'

/**
 * Cria token seguro assinado com HMAC SHA-256 e expiração
 */
function createToken() {
  const expires = Date.now() + 1000 * 60 * 60 * 48 // 48 horas
  const payload = `admin:${expires}`
  const hmac = crypto.createHmac('sha256', TOKEN_SECRET).update(payload).digest('hex')
  return `${Buffer.from(payload).toString('base64')}.${hmac}`
}

/**
 * Valida se um token é legítimo e não expirou
 */
function verifyToken(token) {
  try {
    if (!token || typeof token !== 'string') return false
    const [encodedPayload, receivedHmac] = token.split('.')
    if (!encodedPayload || !receivedHmac) return false

    const payload = Buffer.from(encodedPayload, 'base64').toString('utf-8')
    const expectedHmac = crypto.createHmac('sha256', TOKEN_SECRET).update(payload).digest('hex')

    if (crypto.timingSafeEqual(Buffer.from(receivedHmac), Buffer.from(expectedHmac))) {
      const parts = payload.split(':')
      const expires = parseInt(parts[1], 10)
      return Date.now() < expires
    }
    return false
  } catch (e) {
    return false
  }
}

export default async function handler(req, res) {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, x-dash-token')

  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }

  try {
    let body = req.body || {}
    if (typeof body === 'string') {
      try { body = JSON.parse(body) } catch (e) {}
    }

    const authHeader = req.headers['authorization'] || ''
    const bearerToken = authHeader.replace(/^Bearer\s+/i, '') || req.headers['x-dash-token'] || body.token

    // Ação 1: Verificar se token existente ainda é válido
    if (req.method === 'GET' || body.action === 'verify') {
      if (bearerToken && verifyToken(bearerToken)) {
        return res.status(200).json({ valid: true, message: 'Sessão ativa e autenticada' })
      }
      return res.status(401).json({ valid: false, error: 'Sessão expirada ou inválida' })
    }

    // Ação 2: Login com senha
    if (req.method === 'POST') {
      const inputPassword = (body.password || '').toString().trim()

      if (!inputPassword) {
        return res.status(400).json({ success: false, error: 'Por favor, informe a senha de acesso.' })
      }

      if (inputPassword === DASH_PASSWORD) {
        const token = createToken()
        return res.status(200).json({
          success: true,
          token,
          expiresIn: '48h',
          user: {
            role: 'superadmin',
            title: 'Administrador Nexa Fit'
          }
        })
      } else {
        // Delay intencional para prevenir ataques de força bruta
        await new Promise(r => setTimeout(r, 600))
        return res.status(401).json({
          success: false,
          error: 'Senha de acesso incorreta.'
        })
      }
    }

    return res.status(405).json({ error: 'Method Not Allowed' })
  } catch (error) {
    console.error('Dash auth error:', error)
    return res.status(500).json({ error: 'Erro interno ao processar autenticação' })
  }
}
