import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { validatePurchaseEmail, registerWebhookPurchase, PLANS_CONFIG } from '../lib/authAccess'

/* ========================================================
   NEXA FIT PRO — Portal de Acesso do Aluno (Login por E-mail de Compra)
   Validação de Pagamento via Webhook / Supabase & Duração de Planos
   ======================================================== */

export default function Login() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [hint, setHint] = useState('')
  const [successInfo, setSuccessInfo] = useState(null)
  const navigate = useNavigate()

  const handleLogin = async (e) => {
    e.preventDefault()
    setError('')
    setHint('')
    setSuccessInfo(null)

    if (!email.trim() || !/\S+@\S+\.\S+/.test(email)) {
      setError('Por favor, digite um e-mail válido.')
      return
    }

    setLoading(true)

    try {
      const result = await validatePurchaseEmail(email)

      if (result.success) {
        setSuccessInfo(result.subscription)
        setTimeout(() => {
          navigate('/')
        }, 1200)
      } else {
        setError(result.error)
        setHint(result.hint || '')
      }
    } catch (err) {
      console.error(err)
      setError('Erro ao validar acesso. Tente novamente em instantes.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'radial-gradient(ellipse at top, #141a0d 0%, #0a0a0a 60%, #050505 100%)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px 16px',
      color: '#fff',
      fontFamily: 'var(--font-primary)'
    }}>
      
      {/* Container Principal */}
      <div style={{ width: '100%', maxWidth: 420 }}>
        
        {/* Logotipo */}
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <img
            src="/logo.png"
            alt="NEXA FIT PRO"
            style={{ height: 48, margin: '0 auto 12px', display: 'block', objectFit: 'contain' }}
          />
          <h1 style={{ fontSize: 22, fontWeight: 900, letterSpacing: -0.5, margin: '0 0 6px' }}>
            Portal do Aluno
          </h1>
          <p style={{ fontSize: 13, color: 'var(--text-muted)', margin: 0 }}>
            Digite o e-mail utilizado na sua compra para acessar
          </p>
        </div>

        {/* Card de Login */}
        <div style={{
          background: '#121212',
          border: '1.5px solid rgba(163,230,53,0.3)',
          borderRadius: 24,
          padding: '26px 20px',
          boxShadow: '0 10px 40px rgba(0,0,0,0.8), 0 0 20px rgba(163,230,53,0.1)'
        }}>
          
          {/* Mensagem de Sucesso */}
          {successInfo && (
            <div style={{
              background: 'rgba(34,197,94,0.15)',
              border: '1.5px solid #22C55E',
              borderRadius: 14,
              padding: '14px 16px',
              marginBottom: 18,
              textAlign: 'center',
              animation: 'pulse 1s'
            }}>
              <div style={{ fontSize: 22, marginBottom: 4 }}>🎉</div>
              <div style={{ fontSize: 14, fontWeight: 900, color: '#22C55E' }}>
                ACESSO LIBERADO COM SUCESSO!
              </div>
              <div style={{ fontSize: 12, color: '#ddd', marginTop: 4 }}>
                <strong>{successInfo.planName}</strong> • {successInfo.daysRemaining} dias restantes
              </div>
              <div style={{ fontSize: 11, color: '#aaa', marginTop: 2 }}>
                Entrando no seu aplicativo...
              </div>
            </div>
          )}

          {/* Mensagem de Erro */}
          {error && (
            <div style={{
              background: 'rgba(239,68,68,0.12)',
              border: '1.5px solid #EF4444',
              borderRadius: 14,
              padding: '12px 14px',
              marginBottom: 18,
              color: '#FCA5A5',
              fontSize: 13,
              lineHeight: 1.4
            }}>
              <div style={{ fontWeight: 800, display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4, color: '#EF4444' }}>
                <span>⚠️</span>
                <span>{error}</span>
              </div>
              {hint && <div style={{ fontSize: 11, color: '#ccc' }}>{hint}</div>}
            </div>
          )}

          {/* Formulário de Login */}
          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <label style={{
                display: 'block',
                fontSize: 11,
                fontWeight: 800,
                color: 'var(--neon)',
                textTransform: 'uppercase',
                letterSpacing: 0.5,
                marginBottom: 8
              }}>
                SEU E-MAIL DE COMPRA
              </label>
              
              <div style={{ position: 'relative' }}>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="exemplo@gmail.com"
                  autoFocus
                  required
                  style={{
                    width: '100%',
                    height: 52,
                    background: '#1a1a1a',
                    border: '1.5px solid rgba(255,255,255,0.12)',
                    borderRadius: 14,
                    padding: '0 16px 0 42px',
                    color: '#fff',
                    fontSize: 15,
                    outline: 'none',
                    transition: 'all 0.2s ease',
                    boxSizing: 'border-box'
                  }}
                  onFocus={(e) => e.target.style.borderColor = 'var(--neon)'}
                  onBlur={(e) => e.target.style.borderColor = 'rgba(255,255,255,0.12)'}
                />
                <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', fontSize: 18, opacity: 0.7 }}>
                  ✉️
                </span>
              </div>
              
              <p style={{ fontSize: 11, color: '#777', margin: '8px 0 0', lineHeight: 1.4 }}>
                O mesmo e-mail preenchido na confirmação de pagamento do PIX ou Cartão.
              </p>
            </div>

            {/* Botão Entrar */}
            <button
              type="submit"
              disabled={loading}
              style={{
                height: 52,
                borderRadius: 14,
                border: 'none',
                background: 'linear-gradient(135deg, #BEF264 0%, #A3E635 100%)',
                color: '#000',
                fontWeight: 900,
                fontSize: 15,
                cursor: loading ? 'default' : 'pointer',
                boxShadow: '0 4px 20px rgba(163,230,53,0.45)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                textTransform: 'uppercase',
                letterSpacing: 0.5,
                transition: 'all 0.2s'
              }}
            >
              {loading ? 'VALIDANDO ACESSO...' : 'ENTRAR NO APP ⚡'}
            </button>
          </form>

          {/* Badges de Segurança */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-around',
            borderTop: '1px solid rgba(255,255,255,0.06)',
            marginTop: 20,
            paddingTop: 16,
            fontSize: 11,
            color: '#888'
          }}>
            <span>🔒 Acesso Seguro</span>
            <span>⚡ Sincronização Instantânea</span>
          </div>

        </div>

        {/* Link para o Quiz/Compra */}
        <div style={{ textAlign: 'center', marginTop: 22 }}>
          <p style={{ fontSize: 13, color: '#aaa', margin: 0 }}>
            Ainda não adquiriu o seu plano?{' '}
            <Link to="/quiz" style={{ color: 'var(--neon)', fontWeight: 800, textDecoration: 'none' }}>
              Fazer Avaliação & Comprar
            </Link>
          </p>
        </div>

      </div>

    </div>
  )
}
