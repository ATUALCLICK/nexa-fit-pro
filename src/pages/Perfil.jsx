import React, { useState, useEffect } from 'react'
import { getCurrentAuthSession, logoutUser } from '../lib/authAccess'

/* ========================================================
   NEXA FIT PRO — Perfil & Evolução
   Nome, Telefone, Dieta, Foco Muscular, Histórico & Ranking
   ======================================================== */

const RANKING_DATA = [
  { pos: 1, name: 'Lucas "Monstro" Silva', points: '3.420 pts', badge: '🥇 Campeão Ouro', avatar: '👨' },
  { pos: 2, name: 'Fernanda Rocha', points: '3.150 pts', badge: '🥈 Elite Prata', avatar: '👩' },
  { pos: 3, name: 'Rodrigo Alcantara', points: '2.980 pts', badge: '🥉 Bronze Pro', avatar: '👨' },
  { pos: 4, name: 'Camila Mendonça', points: '2.740 pts', badge: '⚡ Top 5', avatar: '👩' },
  { pos: 5, name: 'Você (Nexa Pro)', points: '2.650 pts', badge: '🔥 Subindo', avatar: '⭐', isUser: true },
  { pos: 6, name: 'Mateus Duarte', points: '2.410 pts', badge: '💪 Consistente', avatar: '👨' },
  { pos: 7, name: 'Juliana Paes', points: '2.280 pts', badge: '✨ Foco Total', avatar: '👩' },
]

export default function Perfil() {
  const [profile, setProfile] = useState(() => {
    const raw = localStorage.getItem('nexafit_answers')
    const answers = raw ? JSON.parse(raw) : {}
    return {
      name: localStorage.getItem('nexafit_name') || answers.name || 'Guerreiro(a)',
      phone: localStorage.getItem('nexafit_phone') || '',
      email: localStorage.getItem('nexafit_email') || answers.email || '',
      weight: localStorage.getItem('nexafit_weight') || answers.weight || '78',
      goalWeight: answers.goalWeight || '68',
      height: answers.height || '175',
      diet: localStorage.getItem('nexafit_diet_type') || 'tradicional',
      focus: localStorage.getItem('nexafit_focus_group') || (answers.focusZones && answers.focusZones[0]) || 'ombros',
      gender: answers.gender || 'female'
    }
  })

  const [activeTab, setActiveTab] = useState('perfil') // 'perfil' | 'evolucao' | 'ranking'
  const [savedSuccess, setSavedSuccess] = useState(false)
  const [weightLogs, setWeightLogs] = useState(() => {
    const raw = localStorage.getItem('nexafit_weight_logs')
    return raw ? JSON.parse(raw) : [
      { date: '10/01', weight: 80.5 },
      { date: '25/01', weight: 79.2 },
      { date: '10/02', weight: 78.0 },
    ]
  })
  const [newLogWeight, setNewLogWeight] = useState('')

  const handleSave = () => {
    localStorage.setItem('nexafit_name', profile.name)
    localStorage.setItem('nexafit_phone', profile.phone)
    localStorage.setItem('nexafit_email', profile.email)
    localStorage.setItem('nexafit_weight', profile.weight)
    localStorage.setItem('nexafit_diet_type', profile.diet)
    localStorage.setItem('nexafit_focus_group', profile.focus)
    
    // Atualizar answers
    const currentAns = JSON.parse(localStorage.getItem('nexafit_answers') || '{}')
    localStorage.setItem('nexafit_answers', JSON.stringify({
      ...currentAns,
      name: profile.name,
      weight: profile.weight,
      email: profile.email
    }))

    setSavedSuccess(true)
    setTimeout(() => setSavedSuccess(false), 2500)
  }

  const addWeightLog = () => {
    if (!newLogWeight) return
    const today = new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })
    const updated = [...weightLogs, { date: today, weight: Number(newLogWeight) }]
    setWeightLogs(updated)
    localStorage.setItem('nexafit_weight_logs', JSON.stringify(updated))
    setProfile(p => ({ ...p, weight: newLogWeight }))
    setNewLogWeight('')
  }

  return (
    <div style={{ background: '#000', minHeight: '100vh', color: '#fff', padding: '16px 16px 100px', fontFamily: 'var(--font-primary)' }}>
      
      {/* Header com Avatar & Plano Ativo */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{
            width: 56, height: 56, borderRadius: '50%', background: 'linear-gradient(135deg, #A3E635, #22C55E)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, color: '#000',
            fontWeight: 900, boxShadow: '0 0 20px rgba(163,230,53,0.4)', border: '2px solid #fff', flexShrink: 0
          }}>
            {profile.name[0]?.toUpperCase() || 'N'}
          </div>
          <div>
            <h1 style={{ fontSize: 20, fontWeight: 900, lineHeight: 1.2, margin: 0 }}>{profile.name}</h1>
            <div style={{ display: 'flex', gap: 6, alignItems: 'center', marginTop: 4, flexWrap: 'wrap' }}>
              <span style={{ fontSize: 10, background: 'rgba(163,230,53,0.15)', color: 'var(--neon)', border: '1px solid rgba(163,230,53,0.3)', padding: '2px 8px', borderRadius: 8, fontWeight: 800 }}>
                {getCurrentAuthSession()?.subscription?.planName || 'PLANO ANUAL VIP'}
              </span>
            </div>
          </div>
        </div>

        {/* Botão Sair */}
        <button
          onClick={logoutUser}
          style={{
            background: '#1a1a1a', border: '1px solid #333', color: '#aaa',
            padding: '6px 12px', borderRadius: 10, fontSize: 11, fontWeight: 800, cursor: 'pointer',
            display: 'flex', alignItems: 'center', gap: 4
          }}
          title="Sair da conta"
        >
          <span>Sair</span>
          <span>🚪</span>
        </button>
      </div>

      {/* Tabs: Perfil | Evolução | Ranking */}
      <div style={{ display: 'flex', background: '#111', borderRadius: 14, padding: 4, marginBottom: 20, border: '1px solid rgba(255,255,255,0.06)' }}>
        <button
          onClick={() => setActiveTab('perfil')}
          style={{
            flex: 1, padding: '10px 0', border: 'none', borderRadius: 10, fontWeight: 800, fontSize: 13,
            background: activeTab === 'perfil' ? 'var(--neon)' : 'transparent',
            color: activeTab === 'perfil' ? '#000' : '#888',
            cursor: 'pointer', transition: 'all 0.2s ease'
          }}
        >
          👤 Meus Dados
        </button>
        <button
          onClick={() => setActiveTab('evolucao')}
          style={{
            flex: 1, padding: '10px 0', border: 'none', borderRadius: 10, fontWeight: 800, fontSize: 13,
            background: activeTab === 'evolucao' ? 'var(--neon)' : 'transparent',
            color: activeTab === 'evolucao' ? '#000' : '#888',
            cursor: 'pointer', transition: 'all 0.2s ease'
          }}
        >
          📈 Evolução
        </button>
        <button
          onClick={() => setActiveTab('ranking')}
          style={{
            flex: 1, padding: '10px 0', border: 'none', borderRadius: 10, fontWeight: 800, fontSize: 13,
            background: activeTab === 'ranking' ? 'var(--neon)' : 'transparent',
            color: activeTab === 'ranking' ? '#000' : '#888',
            cursor: 'pointer', transition: 'all 0.2s ease'
          }}
        >
          🏆 Ranking
        </button>
      </div>

      {/* ── ABA 1: DADOS E CONFIGURAÇÕES ── */}
      {activeTab === 'perfil' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          
          {/* Nome e Contato */}
          <div style={{ background: '#111', borderRadius: 18, padding: 16, border: '1px solid rgba(255,255,255,0.06)' }}>
            <h3 style={{ fontSize: 14, fontWeight: 800, color: 'var(--neon)', marginBottom: 12 }}>Informações Pessoais</h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div>
                <label style={{ fontSize: 11, color: '#888', fontWeight: 700 }}>Nome Completo</label>
                <input
                  type="text"
                  value={profile.name}
                  onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                  style={{ width: '100%', background: '#1c1c1c', border: '1px solid #333', borderRadius: 10, padding: '10px 12px', color: '#fff', fontSize: 14, marginTop: 4 }}
                />
              </div>

              <div>
                <label style={{ fontSize: 11, color: '#888', fontWeight: 700 }}>Telefone / WhatsApp</label>
                <input
                  type="tel"
                  placeholder="(11) 99999-9999"
                  value={profile.phone}
                  onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                  style={{ width: '100%', background: '#1c1c1c', border: '1px solid #333', borderRadius: 10, padding: '10px 12px', color: '#fff', fontSize: 14, marginTop: 4 }}
                />
              </div>

              <div>
                <label style={{ fontSize: 11, color: '#888', fontWeight: 700 }}>E-mail de Acesso</label>
                <input
                  type="email"
                  value={profile.email}
                  onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                  style={{ width: '100%', background: '#1c1c1c', border: '1px solid #333', borderRadius: 10, padding: '10px 12px', color: '#fff', fontSize: 14, marginTop: 4 }}
                />
              </div>
            </div>
          </div>

          {/* Dieta e Foco de Treino */}
          <div style={{ background: '#111', borderRadius: 18, padding: 16, border: '1px solid rgba(255,255,255,0.06)' }}>
            <h3 style={{ fontSize: 14, fontWeight: 800, color: 'var(--neon)', marginBottom: 12 }}>Preferências do Protocolo</h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div>
                <label style={{ fontSize: 11, color: '#888', fontWeight: 700 }}>Estilo de Dieta Ativo</label>
                <select
                  value={profile.diet}
                  onChange={(e) => setProfile({ ...profile, diet: e.target.value })}
                  style={{ width: '100%', background: '#1c1c1c', border: '1px solid #333', borderRadius: 10, padding: '10px 12px', color: '#fff', fontSize: 14, marginTop: 4 }}
                >
                  <option value="tradicional">Tradicional Equilibrada (Carbos Limpos)</option>
                  <option value="lowcarb">Low Carb Alta Proteína (Queima Acelerada)</option>
                  <option value="carnivora">Dieta Carnívora (Carnes, Ovos & Manteiga)</option>
                  <option value="cetogenica">Cetogênica / Keto (Gorduras Boas & Proteína)</option>
                  <option value="vegetariana">Vegetariana Fitness</option>
                </select>
              </div>

              <div>
                <label style={{ fontSize: 11, color: '#888', fontWeight: 700 }}>Músculo Foco para Evolução</label>
                <select
                  value={profile.focus}
                  onChange={(e) => setProfile({ ...profile, focus: e.target.value })}
                  style={{ width: '100%', background: '#1c1c1c', border: '1px solid #333', borderRadius: 10, padding: '10px 12px', color: '#fff', fontSize: 14, marginTop: 4 }}
                >
                  <option value="ombros">Ombros & Trapézio</option>
                  <option value="peito">Peitoral & Tríceps</option>
                  <option value="costas">Costas & Bíceps</option>
                  <option value="pernas">Pernas & Glúteos</option>
                  <option value="abdomen">Abdômen & Cintura</option>
                </select>
              </div>
            </div>
          </div>

          {/* Botão Salvar */}
          <button
            onClick={handleSave}
            style={{
              width: '100%', background: 'var(--neon)', color: '#000', border: 'none',
              padding: '14px 0', borderRadius: 14, fontWeight: 900, fontSize: 15, cursor: 'pointer',
              boxShadow: '0 4px 20px rgba(163,230,53,0.4)', marginTop: 6
            }}
          >
            {savedSuccess ? '✓ Alterações Salvas com Sucesso!' : 'Salvar Alterações'}
          </button>
        </div>
      )}

      {/* ── ABA 2: EVOLUÇÃO & LOGS DE PESO ── */}
      {activeTab === 'evolucao' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div style={{ background: '#111', borderRadius: 18, padding: 16, border: '1px solid rgba(255,255,255,0.06)' }}>
            <h3 style={{ fontSize: 15, fontWeight: 800, marginBottom: 12 }}>Registrar Novo Peso</h3>
            
            <div style={{ display: 'flex', gap: 10 }}>
              <input
                type="number"
                placeholder="Ex: 77.5"
                value={newLogWeight}
                onChange={(e) => setNewLogWeight(e.target.value)}
                style={{ flex: 1, background: '#1c1c1c', border: '1px solid #333', borderRadius: 10, padding: '10px 14px', color: '#fff', fontSize: 14 }}
              />
              <button
                onClick={addWeightLog}
                style={{ background: 'var(--neon)', color: '#000', border: 'none', padding: '0 18px', borderRadius: 10, fontWeight: 900, cursor: 'pointer' }}
              >
                + Registrar
              </button>
            </div>
          </div>

          {/* Histórico */}
          <div style={{ background: '#111', borderRadius: 18, padding: 16, border: '1px solid rgba(255,255,255,0.06)' }}>
            <h3 style={{ fontSize: 15, fontWeight: 800, marginBottom: 12 }}>Histórico de Pesagens</h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {weightLogs.slice().reverse().map((log, idx) => (
                <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', background: '#161616', borderRadius: 10 }}>
                  <span style={{ fontSize: 13, color: '#aaa' }}>{log.date}</span>
                  <span style={{ fontSize: 15, fontWeight: 800, color: 'var(--neon)' }}>{log.weight} kg</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── ABA 3: RANKING COMUNIDADE ── */}
      {activeTab === 'ranking' && (
        <div style={{ background: '#111', borderRadius: 18, padding: 16, border: '1px solid rgba(255,255,255,0.06)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
            <h3 style={{ fontSize: 15, fontWeight: 800 }}>Ranking Semanal da Comunidade</h3>
            <span style={{ fontSize: 11, color: 'var(--neon)', fontWeight: 700 }}>Atualizado hoje</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {RANKING_DATA.map(item => (
              <div
                key={item.pos}
                style={{
                  display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px',
                  background: item.isUser ? 'rgba(163,230,53,0.12)' : '#161616',
                  borderRadius: 12, border: item.isUser ? '1px solid var(--neon)' : '1px solid rgba(255,255,255,0.03)'
                }}
              >
                <div style={{ fontSize: 14, fontWeight: 900, width: 24, color: item.pos <= 3 ? 'var(--neon)' : '#666' }}>
                  #{item.pos}
                </div>
                <div style={{ fontSize: 20 }}>{item.avatar}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: 800, color: item.isUser ? 'var(--neon)' : '#fff' }}>{item.name}</div>
                  <div style={{ fontSize: 11, color: '#888' }}>{item.badge}</div>
                </div>
                <div style={{ fontSize: 13, fontWeight: 900, color: 'var(--neon)' }}>{item.points}</div>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  )
}
