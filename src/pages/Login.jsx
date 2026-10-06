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
  const [showDemoModal, setShowDemoModal] = useState(false)
  const [demoName, setDemoName] = useState('')
  const [demoEmail, setDemoEmail] = useState('')
  const [demoPlan, setDemoPlan] = useState('12m')
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

  // Criar compra de teste rápida (para o administrador / cliente testar planos)
  const handleCreateDemoPurchase = async () => {
    if (!demoEmail || !demoEmail.includes('@')) {
      alert('Informe um e-mail para o teste.')
      return
    }
    await registerWebhookPurchase({
      email: demoEmail,
      name: demoName || 'Aluno VIP',
      planId: demoPlan,
      status: 'paid'
    })
    setEmail(demoEmail)
    setShowDemoModal(false)
    // Tenta logar automaticamente com a conta criada
    const res = await validatePurchaseEmail(demoEmail)
    if (res.success) {
      setSuccessInfo(res.subscription)
      setTimeout(() => navigate('/'), 1000)
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

        {/* Links de Suporte & Testes */}
        <div style={{ textAlign: 'center', marginTop: 22, display: 'flex', flexDirection: 'column', gap: 10 }}>
          <p style={{ fontSize: 13, color: '#aaa', margin: 0 }}>
            Ainda não adquiriu o seu plano?{' '}
            <Link to="/quiz" style={{ color: 'var(--neon)', fontWeight: 800, textDecoration: 'none' }}>
              Fazer Avaliação & Comprar
            </Link>
          </p>

          <button
            onClick={() => setShowDemoModal(true)}
            style={{
              background: 'transparent',
              border: '1px dashed rgba(163,230,53,0.4)',
              color: 'var(--neon)',
              padding: '8px 14px',
              borderRadius: 10,
              fontSize: 11,
              fontWeight: 800,
              cursor: 'pointer',
              margin: '6px auto 0',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6
            }}
          >
            <span>🛠️</span>
            <span>Simulador de Webhook / Testar Planos (1m, 3m, 12m)</span>
          </button>
        </div>

      </div>

      {/* Modal de Simulação de Webhook / Teste Rápido de Planos */}
      {showDemoModal && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(12px)',
          zIndex: 500, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16
        }}>
          <div style={{
            background: '#161616', borderRadius: 20, padding: 20, width: '100%', maxWidth: 400,
            border: '1.5px solid var(--neon)', boxShadow: '0 10px 40px rgba(0,0,0,0.9)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
              <h3 style={{ fontSize: 16, fontWeight: 900, color: 'var(--neon)', margin: 0 }}>
                ⚡ Simulador de Webhook de Pagamento
              </h3>
              <button
                onClick={() => setShowDemoModal(false)}
                style={{ background: '#222', border: 'none', color: '#fff', width: 28, height: 28, borderRadius: '50%', cursor: 'pointer' }}
              >
                ✕
              </button>
            </div>

            <p style={{ fontSize: 12, color: '#ccc', marginBottom: 14 }}>
              Cadastre um e-mail de compra simulado para testar o login imediato em qualquer plano:
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 16 }}>
              <div>
                <label style={{ fontSize: 11, color: '#888', fontWeight: 700 }}>Nome do Aluno:</label>
                <input
                  type="text"
                  placeholder="Ex: João Victor"
                  value={demoName}
                  onChange={e => setDemoName(e.target.value)}
                  style={{ width: '100%', height: 42, background: '#222', border: '1px solid #333', borderRadius: 8, padding: '0 10px', color: '#fff', marginTop: 4, boxSizing: 'border-box' }}
                />
              </div>

              <div>
                <label style={{ fontSize: 11, color: '#888', fontWeight: 700 }}>E-mail da Compra:</label>
                <input
                  type="email"
                  placeholder="exemplo@teste.com"
                  value={demoEmail}
                  onChange={e => setDemoEmail(e.target.value)}
                  style={{ width: '100%', height: 42, background: '#222', border: '1px solid #333', borderRadius: 8, padding: '0 10px', color: '#fff', marginTop: 4, boxSizing: 'border-box' }}
                />
              </div>

              <div>
                <label style={{ fontSize: 11, color: '#888', fontWeight: 700 }}>Plano Adquirido:</label>
                <select
                  value={demoPlan}
                  onChange={e => setDemoPlan(e.target.value)}
                  style={{ width: '100%', height: 42, background: '#222', border: '1px solid #333', borderRadius: 8, padding: '0 10px', color: '#fff', marginTop: 4, boxSizing: 'border-box' }}
                >
                  <option value="12m">Plano Anual (12 Meses • 365 dias) — R$ 78,46</option>
                  <option value="6m">Plano Semestral (6 Meses • 180 dias) — R$ 47,90</option>
                  <option value="1m">Plano Mensal (1 Mês • 30 dias) — R$ 29,90</option>
                </select>
              </div>
            </div>

            <button
              onClick={handleCreateDemoPurchase}
              style={{
                width: '100%', height: 48, borderRadius: 12, border: 'none',
                background: 'var(--neon)', color: '#000', fontWeight: 900, fontSize: 14, cursor: 'pointer'
              }}
            >
              Simular Pagamento Aprovado & Entrar 🚀
            </button>
          </div>
        </div>
      )}

    </div>
  )
}
