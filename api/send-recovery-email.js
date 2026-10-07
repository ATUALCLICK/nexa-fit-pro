// Vercel Serverless Function: /api/send-recovery-email
// Envio e Automação de E-mails de Recuperação de Leads via Resend

export default async function handler(req, res) {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, x-dash-token')

  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' })
  }

  try {
    let body = req.body || {}
    if (typeof body === 'string') {
      try { body = JSON.parse(body) } catch (e) {}
    }

    const {
      apiKey = process.env.RESEND_API_KEY,
      to,
      subject,
      leadName = 'Atleta Nexa',
      goal = 'Secar e transformar o corpo',
      targetWeight = '',
      planType = 'Anual',
      checkoutUrl = 'https://pay.lastlink.com/nexafit-pro',
      customHtml = null,
      fromEmail = 'Nexa FIT PRO <onboarding@resend.dev>'
    } = body

    if (!to || !to.includes('@')) {
      return res.status(400).json({ success: false, error: 'E-mail de destinatário inválido.' })
    }

    if (!apiKey) {
      return res.status(400).json({
        success: false,
        error: 'Chave de API do Resend não configurada. Insira sua chave (ex: re_123456789) no painel ou nas variáveis de ambiente.'
      })
    }

    // Template padrão premium caso não seja enviado HTML customizado
    const defaultHtml = customHtml || `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${subject}</title>
      </head>
      <body style="margin: 0; padding: 0; background-color: #0c0d0e; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #ffffff;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #0c0d0e; padding: 30px 15px;">
          <tr>
            <td align="center">
              <table width="100%" max-width="580" style="max-width: 580px; background-color: #141618; border-radius: 16px; border: 1px solid #23272b; overflow: hidden; box-shadow: 0 10px 40px rgba(0,0,0,0.6);">
                
                <!-- HEADER COM LOGO -->
                <tr>
                  <td style="padding: 35px 30px 20px 30px; text-align: center; border-bottom: 1px solid rgba(255,255,255,0.06); background: linear-gradient(180deg, #181b1e 0%, #141618 100%);">
                    <div style="display: inline-block; padding: 6px 14px; background: rgba(190,242,100,0.1); border: 1px solid rgba(190,242,100,0.3); border-radius: 99px; margin-bottom: 15px;">
                      <span style="color: #bef264; font-size: 11px; font-weight: 800; letter-spacing: 1.5px; text-transform: uppercase;">⚡ AVALIAÇÃO CONCLUÍDA</span>
                    </div>
                    <h1 style="margin: 0; color: #ffffff; font-size: 26px; font-weight: 900; letter-spacing: -0.5px;">
                      NEXA <span style="color: #bef264;">FIT PRO</span>
                    </h1>
                  </td>
                </tr>

                <!-- CONTEÚDO PRINCIPAL -->
                <tr>
                  <td style="padding: 35px 30px;">
                    <p style="font-size: 18px; font-weight: 700; color: #ffffff; margin-top: 0; margin-bottom: 16px;">
                      Olá, ${leadName}! 👋
                    </p>
                    
                    <p style="font-size: 15px; line-height: 1.6; color: #c4c7c5; margin-bottom: 22px;">
                      Vimos que você finalizou sua avaliação individual de condicionamento com o objetivo de <strong style="color: #bef264;">${goal}</strong>${targetWeight ? ` (alcançar ${targetWeight})` : ''}, mas ainda não liberou seu acesso ao protocolo exclusivo.
                    </p>

                    <div style="background-color: #1c2024; border-left: 4px solid #bef264; padding: 18px 20px; border-radius: 8px; margin-bottom: 26px;">
                      <p style="margin: 0 0 6px 0; font-size: 13px; font-weight: 800; text-transform: uppercase; color: #bef264; letter-spacing: 0.5px;">
                        🎯 SEU PROTOCOLO ESTÁ RESERVADO POR TEMPO LIMITADO:
                      </p>
                      <ul style="margin: 0; padding-left: 20px; color: #d0d4d8; font-size: 14px; line-height: 1.6;">
                        <li>Treinos curtos de 15 a 30 minutos em casa ou na academia</li>
                        <li>Cardápio adaptativo com cálculo dos seus macros</li>
                        <li>Acesso imediato no aplicativo web e mobile</li>
                      </ul>
                    </div>

                    <p style="font-size: 15px; line-height: 1.6; color: #c4c7c5; margin-bottom: 30px;">
                      Liberamos uma condição especial de ativação com <strong style="color: #ffffff;">garantia incondicional de 7 dias</strong>. Se você não notar diferença no espelho nas primeiras 2 semanas, devolvemos 100% do seu dinheiro.
                    </p>

                    <!-- BOTÃO DE CTA -->
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td align="center">
                          <a href="${checkoutUrl}" target="_blank" style="display: inline-block; width: 100%; box-sizing: border-box; text-align: center; background: linear-gradient(135deg, #bef264 0%, #a3e635 100%); color: #000000; font-size: 16px; font-weight: 900; text-transform: uppercase; letter-spacing: 0.5px; padding: 18px 30px; border-radius: 12px; text-decoration: none; box-shadow: 0 6px 25px rgba(163,230,53,0.35);">
                            👉 ATIVAR MEU PROTOCOLO AGORA
                          </a>
                        </td>
                      </tr>
                    </table>

                    <p style="font-size: 12px; color: #73777f; text-align: center; margin-top: 15px; margin-bottom: 0;">
                      🔒 Link criptografado e seguro com liberação imediata
                    </p>
                  </td>
                </tr>

                <!-- FOOTER -->
                <tr>
                  <td style="padding: 24px 30px; background-color: #0f1113; border-top: 1px solid rgba(255,255,255,0.06); text-align: center;">
                    <p style="font-size: 12px; color: #6c727a; margin: 0 0 6px 0;">
                      © 2026 Nexa FIT PRO — Todos os direitos reservados.
                    </p>
                    <p style="font-size: 11px; color: #50565e; margin: 0;">
                      Você recebeu este e-mail porque iniciou o teste no nexafitpro.store.
                    </p>
                  </td>
                </tr>

              </table>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `

    // Dispara requisição direta para a API oficial do Resend
    const resendResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: fromEmail,
        to: [to],
        subject: subject || `🔥 ${leadName}, seu plano personalizado Nexa Fit Pro foi gerado`,
        html: defaultHtml
      })
    })

    const resendData = await resendResponse.json()

    if (!resendResponse.ok) {
      return res.status(resendResponse.status).json({
        success: false,
        error: resendData.message || 'Erro retornado pela API do Resend',
        details: resendData
      })
    }

    return res.status(200).json({
      success: true,
      id: resendData.id,
      recipient: to,
      sentAt: new Date().toISOString()
    })
  } catch (error) {
    console.error('Error sending recovery email:', error)
    return res.status(500).json({
      success: false,
      error: error.message || 'Erro interno ao disparar e-mail de recuperação'
    })
  }
}
