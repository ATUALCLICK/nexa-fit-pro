import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import crypto from 'crypto'

// Plugin local para emular os endpoints /api do Vercel durante o desenvolvimento local
function devApiPlugin() {
  const DASH_PASSWORD = process.env.DASH_PASSWORD || '15062929'
  const TOKEN_SECRET = process.env.DASH_SECRET || 'nexa_fit_dash_secret_salt_2026'

  function createToken() {
    const expires = Date.now() + 1000 * 60 * 60 * 48
    const payload = `admin:${expires}`
    const hmac = crypto.createHmac('sha256', TOKEN_SECRET).update(payload).digest('hex')
    return `${Buffer.from(payload).toString('base64')}.${hmac}`
  }

  function verifyToken(token) {
    try {
      if (!token) return false
      const [encodedPayload, receivedHmac] = token.split('.')
      if (!encodedPayload || !receivedHmac) return false
      const payload = Buffer.from(encodedPayload, 'base64').toString('utf-8')
      const expectedHmac = crypto.createHmac('sha256', TOKEN_SECRET).update(payload).digest('hex')
      if (crypto.timingSafeEqual(Buffer.from(receivedHmac), Buffer.from(expectedHmac))) {
        const parts = payload.split(':')
        return Date.now() < parseInt(parts[1], 10)
      }
      return false
    } catch {
      return false
    }
  }

  return {
    name: 'dev-api-middleware',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        // Intercepta /api/dash-auth
        if (req.url?.startsWith('/api/dash-auth')) {
          res.setHeader('Content-Type', 'application/json')
          res.setHeader('Access-Control-Allow-Origin', '*')

          if (req.method === 'POST') {
            let bodyStr = ''
            req.on('data', chunk => { bodyStr += chunk })
            req.on('end', () => {
              try {
                const body = JSON.parse(bodyStr || '{}')
                if (body.action === 'verify') {
                  const isValid = verifyToken(body.token)
                  res.statusCode = isValid ? 200 : 401
                  res.end(JSON.stringify({ valid: isValid }))
                  return
                }

                if (body.password === DASH_PASSWORD) {
                  res.statusCode = 200
                  res.end(JSON.stringify({ success: true, token: createToken() }))
                } else {
                  res.statusCode = 401
                  res.end(JSON.stringify({ success: false, error: 'Senha de acesso incorreta.' }))
                }
              } catch (e) {
                res.statusCode = 400
                res.end(JSON.stringify({ error: 'Payload inválido' }))
              }
            })
            return
          }

          if (req.method === 'GET') {
            const authHeader = req.headers['authorization'] || ''
            const token = authHeader.replace(/^Bearer\s+/i, '')
            const isValid = verifyToken(token)
            res.statusCode = isValid ? 200 : 401
            res.end(JSON.stringify({ valid: isValid }))
            return
          }
        }

        // Intercepta /api/send-recovery-email
        if (req.url?.startsWith('/api/send-recovery-email')) {
          res.setHeader('Content-Type', 'application/json')
          res.setHeader('Access-Control-Allow-Origin', '*')

          if (req.method === 'POST') {
            let bodyStr = ''
            req.on('data', chunk => { bodyStr += chunk })
            req.on('end', async () => {
              try {
                const body = JSON.parse(bodyStr || '{}')
                const apiKey = body.apiKey || process.env.RESEND_API_KEY

                if (!apiKey) {
                  res.statusCode = 400
                  res.end(JSON.stringify({ success: false, error: 'Chave do Resend não informada.' }))
                  return
                }

                const resendRes = await fetch('https://api.resend.com/emails', {
                  method: 'POST',
                  headers: {
                    'Authorization': `Bearer ${apiKey}`,
                    'Content-Type': 'application/json'
                  },
                  body: JSON.stringify({
                    from: body.fromEmail || 'Nexa FIT PRO <onboarding@resend.dev>',
                    to: [body.to],
                    subject: body.subject || 'Seu plano Nexa Fit Pro',
                    html: body.customHtml || '<p>Acesse seu plano agora!</p>'
                  })
                })

                const resData = await resendRes.json()
                res.statusCode = resendRes.status
                res.end(JSON.stringify(resData))
              } catch (err) {
                res.statusCode = 500
                res.end(JSON.stringify({ success: false, error: err.message }))
              }
            })
            return
          }
        }

        next()
      })
    }
  }
}

export default defineConfig({
  plugins: [react(), devApiPlugin()],
  server: {
    port: 5173,
    open: true
  }
})
