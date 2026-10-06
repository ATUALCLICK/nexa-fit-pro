import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import FitnessCalendar from '../components/FitnessCalendar'
import RunningTrackerModal from '../components/RunningTrackerModal'
import { getDayLog, getFormattedDate } from '../lib/dailyLogs'

/* ========================================================
   NEXA FIT PRO — Dashboard Principal
   Design Ultra-Profissional, Futurista, Leve e de Alta Performance
   ======================================================== */

export default function DashboardNexaFit() {
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [isRunModalOpen, setIsRunModalOpen] = useState(false)
  const [runModalMode, setRunModalMode] = useState('running')
  const [waterMl, setWaterMl] = useState(() => {
    return Number(localStorage.getItem('nexafit_water_ml')) || 1750
  })
  const [waterGoal] = useState(2500)
  const [todayLog, setTodayLog] = useState(() => getDayLog(getFormattedDate()))

  useEffect(() => {
    setName(localStorage.getItem('nexafit_name') || 'Welington')
    setTodayLog(getDayLog(getFormattedDate()))
  }, [isRunModalOpen])

  const addWater = (amount) => {
    setWaterMl(prev => {
      const next = Math.min(prev + amount, waterGoal * 1.5)
      localStorage.setItem('nexafit_water_ml', next)
      return next
    })
  }

  const resetWater = () => {
    setWaterMl(0)
    localStorage.setItem('nexafit_water_ml', 0)
  }

  const waterPercent = Math.min(Math.round((waterMl / waterGoal) * 100), 100)

  return (
    <div style={{
      paddingBottom: 110,
      background: '#090A0C',
      minHeight: '100vh',
      color: '#fff',
      padding: '16px 16px 120px',
      maxWidth: 520,
      margin: '0 auto'
    }}>
      
      {/* ── TOP HEADER MINIMALISTA & FUTURISTA ── */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 18,
        paddingTop: 4
      }}>
        {/* Perfil & Saudação */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            width: 44,
            height: 44,
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #1E1E24 0%, #121214 100%)',
            border: '2px solid var(--neon)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 18,
            fontWeight: 900,
            color: 'var(--neon)',
            boxShadow: '0 0 16px rgba(163,230,53,0.25)',
            flexShrink: 0
          }}>
            {name.charAt(0).toUpperCase()}
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ fontSize: 11, color: '#71717A', fontWeight: 800, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                Olá,
              </span>
              <span style={{
                background: 'rgba(163,230,53,0.15)',
                color: 'var(--neon)',
                fontSize: 9,
                fontWeight: 900,
                padding: '1px 6px',
                borderRadius: 4,
                border: '1px solid rgba(163,230,53,0.3)'
              }}>
                PRO ⚡
              </span>
            </div>
            <h1 style={{ fontSize: 18, fontWeight: 900, margin: 0, color: '#fff', letterSpacing: -0.3 }}>
              {name}
            </h1>
          </div>
        </div>

        {/* Ações Rápidas de Topo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <button
            onClick={() => {
              setRunModalMode('running')
              setIsRunModalOpen(true)
            }}
            style={{
              background: 'rgba(56,189,248,0.1)',
              border: '1px solid rgba(56,189,248,0.3)',
              color: '#38BDF8',
              padding: '7px 11px',
              borderRadius: 12,
              fontSize: 11,
              fontWeight: 800,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 4,
              transition: 'all 0.2s'
            }}
          >
            <span>🏃</span>
            <span>GPS</span>
          </button>
          <button
            onClick={() => navigate('/musica')}
            style={{
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.1)',
              color: '#D4D4D8',
              padding: '7px 11px',
              borderRadius: 12,
              fontSize: 11,
              fontWeight: 800,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 4
            }}
          >
            <span>🎧</span>
            <span>Rádio</span>
          </button>
        </div>
      </div>

      {/* ── CARDS DE CORRIDA E CICLISMO OUTDOOR (IMAGENS DE ALTA PERFORMANCE) ── */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
          <span style={{ fontSize: 11, fontWeight: 900, color: 'var(--neon)', textTransform: 'uppercase', letterSpacing: 0.8 }}>
            🛰️ ATIVIDADES OUTDOOR GPS
          </span>
          <span style={{ fontSize: 10, color: '#71717A', fontWeight: 700 }}>
            Satélite Ativo
          </span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          
          {/* Card 1: Corrida Outdoor (Homem e Mulher correndo) */}
          <div
            onClick={() => {
              setRunModalMode('running')
              setIsRunModalOpen(true)
            }}
            style={{
              background: '#121216',
              borderRadius: 18,
              overflow: 'hidden',
              border: '1.5px solid rgba(163,230,53,0.35)',
              boxShadow: '0 6px 20px rgba(0,0,0,0.6)',
              cursor: 'pointer',
              position: 'relative',
              transition: 'transform 0.2s ease'
            }}
            onMouseDown={(e) => e.currentTarget.style.transform = 'scale(0.98)'}
            onMouseUp={(e) => e.currentTarget.style.transform = 'scale(1)'}
          >
            <div style={{ position: 'relative', height: 110, background: '#000' }}>
              <img
                src="/images/running-couple.jpg"
                alt="Corrida Outdoor"
                style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
              />
              <div style={{
                position: 'absolute', inset: 0,
                background: 'linear-gradient(to top, #121216 10%, rgba(0,0,0,0.2) 60%, transparent 100%)'
              }} />
              <div style={{
                position: 'absolute', top: 8, left: 8,
                background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(6px)',
                border: '1px solid rgba(163,230,53,0.5)', borderRadius: 6,
                padding: '2px 6px', fontSize: 9, fontWeight: 900, color: 'var(--neon)'
              }}>
                🏃 CORRIDA
              </div>
            </div>

            <div style={{ padding: '8px 12px 12px' }}>
              <h3 style={{ fontSize: 13, fontWeight: 900, margin: '0 0 2px', color: '#fff' }}>
                Corrida Outdoor
              </h3>
              <p style={{ fontSize: 10, color: '#A1A1AA', margin: '0 0 8px', lineHeight: 1.3 }}>
                Ritmo, pace & queima
              </p>
              <button style={{
                width: '100%', padding: '6px 0', borderRadius: 8,
                background: 'var(--neon)', color: '#000', border: 'none',
                fontWeight: 900, fontSize: 11, cursor: 'pointer'
              }}>
                Iniciar ⚡
              </button>
            </div>
          </div>

          {/* Card 2: Ciclismo & Bike */}
          <div
            onClick={() => {
              setRunModalMode('cycling')
              setIsRunModalOpen(true)
            }}
            style={{
              background: '#121216',
              borderRadius: 18,
              overflow: 'hidden',
              border: '1.5px solid rgba(56,189,248,0.35)',
              boxShadow: '0 6px 20px rgba(0,0,0,0.6)',
              cursor: 'pointer',
              position: 'relative',
              transition: 'transform 0.2s ease'
            }}
            onMouseDown={(e) => e.currentTarget.style.transform = 'scale(0.98)'}
            onMouseUp={(e) => e.currentTarget.style.transform = 'scale(1)'}
          >
            <div style={{ position: 'relative', height: 110, background: '#000' }}>
              <img
                src="/images/cycling-bike.jpg"
                alt="Ciclismo & Bike"
                style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
              />
              <div style={{
                position: 'absolute', inset: 0,
                background: 'linear-gradient(to top, #121216 10%, rgba(0,0,0,0.2) 60%, transparent 100%)'
              }} />
              <div style={{
                position: 'absolute', top: 8, left: 8,
                background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(6px)',
                border: '1px solid rgba(56,189,248,0.5)', borderRadius: 6,
                padding: '2px 6px', fontSize: 9, fontWeight: 900, color: '#38BDF8'
              }}>
                🚴 CICLISMO
              </div>
            </div>

            <div style={{ padding: '8px 12px 12px' }}>
              <h3 style={{ fontSize: 13, fontWeight: 900, margin: '0 0 2px', color: '#fff' }}>
                Treino de Bike
              </h3>
              <p style={{ fontSize: 10, color: '#A1A1AA', margin: '0 0 8px', lineHeight: 1.3 }}>
                Velocidade & percurso
              </p>
              <button style={{
                width: '100%', padding: '6px 0', borderRadius: 8,
                background: '#38BDF8', color: '#000', border: 'none',
                fontWeight: 900, fontSize: 11, cursor: 'pointer'
              }}>
                Iniciar ⚡
              </button>
            </div>
          </div>

        </div>
      </div>

      {/* ── CARD SLIM DE HIDRATAÇÃO RÁPIDA ── */}
      <div style={{
        background: '#121214',
        borderRadius: 16,
        padding: '12px 14px',
        border: '1px solid rgba(59,130,246,0.2)',
        marginBottom: 20,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 12
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1 }}>
          <div
            onClick={() => addWater(250)}
            style={{
              width: 36, height: 36, borderRadius: '50%',
              background: 'rgba(59,130,246,0.12)', border: '1px solid #3B82F6',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', flexShrink: 0
            }}
          >
            <span style={{ fontSize: 16 }}>💧</span>
          </div>

          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
              <span style={{ fontSize: 11, fontWeight: 800, color: '#E4E4E7' }}>
                Hidratação <span style={{ color: '#3B82F6', fontWeight: 700 }}>({waterPercent}%)</span>
              </span>
              <span style={{ fontSize: 11, color: '#A1A1AA', fontWeight: 700 }}>
                {(waterMl / 1000).toFixed(2)} / {(waterGoal / 1000).toFixed(1)}L
              </span>
            </div>
            <div style={{ height: 4, background: 'rgba(255,255,255,0.06)', borderRadius: 2, overflow: 'hidden' }}>
              <div style={{
                width: `${waterPercent}%`,
                height: '100%',
                background: 'linear-gradient(90deg, #3B82F6, #60A5FA)',
                borderRadius: 2,
                transition: 'width 0.4s ease'
              }} />
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 4 }}>
          <button
            onClick={() => addWater(250)}
            style={{
              background: 'rgba(59,130,246,0.1)',
              border: '1px solid rgba(59,130,246,0.25)',
              color: '#60A5FA',
              borderRadius: 8,
              padding: '4px 8px',
              fontSize: 10,
              fontWeight: 800,
              cursor: 'pointer'
            }}
          >
            +250ml
          </button>
          {waterMl > 0 && (
            <button
              onClick={resetWater}
              style={{ background: 'none', border: 'none', color: '#52525B', fontSize: 12, cursor: 'pointer', padding: '0 4px' }}
            >
              ↺
            </button>
          )}
        </div>
      </div>

      {/* ── CALENDÁRIO, PRÓXIMO TREINO, ESTATÍSTICAS E DIÁRIO COMPLETO ── */}
      <FitnessCalendar
        onOpenRunningTracker={() => {
          setRunModalMode('running')
          setIsRunModalOpen(true)
        }}
        onNavigateToTreinos={() => navigate('/treinos')}
        onNavigateToDieta={() => navigate('/dieta')}
      />

      {/* ── MODAL DE RASTREAMENTO DE CORRIDA GPS ── */}
      <RunningTrackerModal
        isOpen={isRunModalOpen}
        initialMode={runModalMode}
        onClose={() => setIsRunModalOpen(false)}
        onRunSaved={(run) => {
          setTodayLog(getDayLog(getFormattedDate()))
        }}
      />

    </div>
  )
}
