import React, { useState, useEffect } from 'react'
import RunningTrackerModal from '../components/RunningTrackerModal'
import { getAllDailyLogs, getDayLog, getFormattedDate } from '../lib/dailyLogs'

/* ========================================================
   NEXA FIT PRO — Página de Corrida GPS
   Rastreamento de Percurso • Estatísticas • Histórico
   ======================================================== */

export default function Corrida() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [todayRun, setTodayRun] = useState(null)

  useEffect(() => {
    const day = getDayLog(getFormattedDate())
    if (day.running) setTodayRun(day.running)
  }, [isModalOpen])

  return (
    <div style={{ padding: '20px 16px 110px', minHeight: '100vh', color: '#fff', maxWidth: 540, margin: '0 auto', fontFamily: 'var(--font-primary)' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 900, margin: 0 }}>
            Nexa <span style={{ color: '#38BDF8' }}>Running GPS</span>
          </h1>
          <p style={{ fontSize: 12, color: 'var(--text-muted)', margin: '4px 0 0' }}>
            Rastreamento de percurso, pace e queima calórica ao vivo
          </p>
        </div>
        <div style={{
          background: 'rgba(56,189,248,0.15)',
          border: '1px solid #38BDF8',
          color: '#38BDF8',
          fontSize: 10,
          fontWeight: 900,
          padding: '4px 9px',
          borderRadius: 8
        }}>
          100% GRÁTIS
        </div>
      </div>

      {/* Banner Principal de Iniciar Corrida */}
      <div style={{
        background: 'linear-gradient(135deg, #0f1d2e 0%, #08101a 100%)',
        borderRadius: 22,
        padding: '24px 20px',
        border: '1.5px solid rgba(56,189,248,0.35)',
        boxShadow: '0 10px 30px rgba(0,0,0,0.6)',
        marginBottom: 24,
        textAlign: 'center'
      }}>
        <div style={{ fontSize: 44, marginBottom: 8 }}>🏃💨</div>
        <h2 style={{ fontSize: 20, fontWeight: 900, color: '#fff', marginBottom: 6 }}>
          Pronto para o Treino Cardiovascular?
        </h2>
        <p style={{ fontSize: 13, color: '#93C5FD', lineHeight: 1.5, marginBottom: 20 }}>
          Grave seu percurso no mapa com precisão de satélite, acompanhe seu ritmo em tempo real e salve no seu calendário diário.
        </p>

        <button
          onClick={() => setIsModalOpen(true)}
          style={{
            width: '100%',
            padding: '16px 24px',
            background: 'linear-gradient(135deg, #38BDF8 0%, #0284C7 100%)',
            color: '#000',
            border: 'none',
            borderRadius: 16,
            fontWeight: 900,
            fontSize: 15,
            cursor: 'pointer',
            boxShadow: '0 4px 20px rgba(56,189,248,0.4)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8
          }}
        >
          <span>▶ INICIAR RASTREADOR GPS</span>
        </button>
      </div>

      {/* Resumo da Corrida de Hoje */}
      {todayRun && (
        <div style={{
          background: '#131313',
          borderRadius: 20,
          padding: 16,
          border: '1px solid rgba(255,255,255,0.08)',
          marginBottom: 20
        }}>
          <h3 style={{ fontSize: 14, fontWeight: 900, color: '#38BDF8', textTransform: 'uppercase', marginBottom: 12 }}>
            ✓ Corrida Gravada Hoje
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, textAlign: 'center' }}>
            <div style={{ background: '#181818', borderRadius: 12, padding: 10 }}>
              <div style={{ fontSize: 10, color: '#888' }}>Distância</div>
              <div style={{ fontSize: 18, fontWeight: 900, color: 'var(--neon)' }}>{todayRun.distanceKm} km</div>
            </div>
            <div style={{ background: '#181818', borderRadius: 12, padding: 10 }}>
              <div style={{ fontSize: 10, color: '#888' }}>Pace</div>
              <div style={{ fontSize: 18, fontWeight: 900, color: '#fff' }}>{todayRun.pace} /km</div>
            </div>
            <div style={{ background: '#181818', borderRadius: 12, padding: 10 }}>
              <div style={{ fontSize: 10, color: '#888' }}>Tempo</div>
              <div style={{ fontSize: 18, fontWeight: 900, color: '#38BDF8' }}>{todayRun.durationFormatted}</div>
            </div>
          </div>
        </div>
      )}

      {/* Card de Benefícios e Zonas Cardíacas */}
      <div style={{
        background: '#111',
        borderRadius: 20,
        padding: 16,
        border: '1px solid rgba(255,255,255,0.06)'
      }}>
        <h3 style={{ fontSize: 14, fontWeight: 900, marginBottom: 12, textTransform: 'uppercase', color: '#ddd' }}>
          Zonas de Queima Lipolítica
        </h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, fontSize: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: '#161616', padding: 10, borderRadius: 10 }}>
            <span style={{ fontSize: 20 }}>🟢</span>
            <div>
              <strong>Zona 2 (60-70% FCM):</strong> Máxima oxidação de gordura corporal pura.
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: '#161616', padding: 10, borderRadius: 10 }}>
            <span style={{ fontSize: 20 }}>🟡</span>
            <div>
              <strong>Zona 3 (70-80% FCM):</strong> Resistência aeróbica e condicionamento pulmonar.
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: '#161616', padding: 10, borderRadius: 10 }}>
            <span style={{ fontSize: 20 }}>🔴</span>
            <div>
              <strong>Zona 4/HIIT (80-90% FCM):</strong> Aceleração metabólica pós-treino (Efeito EPOC).
            </div>
          </div>
        </div>
      </div>

      {/* Modal GPS Tracker */}
      <RunningTrackerModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onRunSaved={(run) => setTodayRun(run)}
      />
    </div>
  )
}
