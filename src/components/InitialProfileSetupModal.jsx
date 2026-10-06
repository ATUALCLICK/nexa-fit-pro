import React, { useState } from 'react'
import { createPortal } from 'react-dom'

/* ========================================================
   NEXA FIT PRO — Configuração Inicial Rápida do Aluno
   Ativado no 1º Login: Gera Dieta, Treino e Metas em 20s
   ======================================================== */

export default function InitialProfileSetupModal({ isOpen, onClose, onConfigured }) {
  const [formData, setFormData] = useState({
    name: localStorage.getItem('nexafit_name') || '',
    gender: 'male',
    age: '28',
    height: '175',
    weight: '78',
    goalWeight: '72',
    goal: 'emagrecer', // 'emagrecer' | 'hipertrofia' | 'recomposicao'
    level: 'intermediario', // 'iniciante' | 'intermediario' | 'avancado'
    focus: 'ombros',
    diet: 'tradicional'
  })

  const [isGenerating, setIsGenerating] = useState(false)

  if (!isOpen) return null

  const handleSubmit = (e) => {
    e.preventDefault()
    setIsGenerating(true)

    const w = parseFloat(formData.weight) || 75
    const h = parseFloat(formData.height) || 175
    const age = parseInt(formData.age) || 25
    const isMale = formData.gender === 'male'

    // Cálculo TMB (Mifflin-St Jeor)
    let bmr = isMale
      ? (10 * w) + (6.25 * h) - (5 * age) + 5
      : (10 * w) + (6.25 * h) - (5 * age) - 161

    // Fator de Atividade
    let tdee = bmr * 1.45

    // Ajuste por Objetivo
    let targetCalories = Math.round(tdee)
    if (formData.goal === 'emagrecer') targetCalories = Math.round(tdee - 450)
    if (formData.goal === 'hipertrofia') targetCalories = Math.round(tdee + 350)

    // Meta de Água (35ml por kg)
    const waterTargetMl = Math.round(w * 38)

    // Salva no LocalStorage
    localStorage.setItem('nexafit_name', formData.name.trim() || (isMale ? 'Guerreiro' : 'Guerreira'))
    localStorage.setItem('nexafit_profile_configured', 'true')
    localStorage.setItem('nexafit_water_ml', '0')
    localStorage.setItem('nexafit_diet_type', formData.diet)
    localStorage.setItem('nexafit_focus_group', formData.focus)

    const answersObject = {
      name: formData.name.trim(),
      gender: formData.gender,
      age: formData.age,
      height: formData.height,
      weight: formData.weight,
      goalWeight: formData.goalWeight,
      goal: formData.goal,
      level: formData.level,
      focusZones: [formData.focus],
      targetCalories,
      waterTargetMl
    }

    localStorage.setItem('nexafit_answers', JSON.stringify(answersObject))

    setTimeout(() => {
      setIsGenerating(false)
      if (onConfigured) onConfigured(answersObject)
      if (onClose) onClose()
    }, 1200)
  }

  return createPortal(
    <div style={{
      position: 'fixed',
      inset: 0,
      zIndex: 999999,
      background: 'rgba(0,0,0,0.88)',
      backdropFilter: 'blur(14px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '16px',
      color: '#fff',
      fontFamily: 'var(--font-primary)'
    }}>
      <div style={{
        width: '100%',
        maxWidth: 480,
        background: '#111216',
        borderRadius: 24,
        border: '1.5px solid rgba(163,230,53,0.4)',
        boxShadow: '0 20px 60px rgba(0,0,0,0.9), 0 0 30px rgba(163,230,53,0.15)',
        padding: '24px 20px',
        maxHeight: '90vh',
        overflowY: 'auto'
      }}>

        {isGenerating ? (
          <div style={{ textAlign: 'center', padding: '40px 10px' }}>
            <div style={{ fontSize: 50, animation: 'bounce 1s infinite' }}>⚡</div>
            <h2 style={{ fontSize: 20, fontWeight: 900, color: 'var(--neon)', margin: '14px 0 6px' }}>
              Montando Seu Plano Personalizado...
            </h2>
            <p style={{ fontSize: 13, color: '#A1A1AA', margin: 0 }}>
              Calculando macros, periodização de treinos e metas calóricas ideais.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            {/* Header */}
            <div style={{ textAlign: 'center', marginBottom: 18 }}>
              <span style={{
                background: 'rgba(163,230,53,0.15)',
                color: 'var(--neon)',
                padding: '4px 10px',
                borderRadius: 8,
                fontSize: 10,
                fontWeight: 900,
                border: '1px solid rgba(163,230,53,0.3)',
                textTransform: 'uppercase',
                letterSpacing: 0.5
              }}>
                Configuração Rápida • 1º Acesso
              </span>
              <h2 style={{ fontSize: 20, fontWeight: 900, margin: '10px 0 4px', color: '#fff' }}>
                Monte seu Perfil & Protocolo
              </h2>
              <p style={{ fontSize: 12, color: '#A1A1AA', margin: 0 }}>
                Preencha seus dados físicos para adaptarmos os treinos e a dieta à você.
              </p>
            </div>

            {/* 1. Nome & Gênero */}
            <div style={{ marginBottom: 14 }}>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 800, color: 'var(--neon)', marginBottom: 6, textTransform: 'uppercase' }}>
                1. Seu Nome:
              </label>
              <input
                type="text"
                required
                placeholder="Ex: Lucas Silva"
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
                style={{
                  width: '100%',
                  height: 44,
                  background: '#1A1B20',
                  border: '1px solid #333',
                  borderRadius: 12,
                  padding: '0 14px',
                  color: '#fff',
                  fontSize: 14,
                  boxSizing: 'border-box',
                  outline: 'none'
                }}
              />
            </div>

            {/* Gênero */}
            <div style={{ marginBottom: 14 }}>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 800, color: 'var(--neon)', marginBottom: 6, textTransform: 'uppercase' }}>
                2. Sexo Biológico:
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, gender: 'male' })}
                  style={{
                    padding: '10px',
                    borderRadius: 12,
                    border: formData.gender === 'male' ? '1.5px solid var(--neon)' : '1px solid #333',
                    background: formData.gender === 'male' ? 'rgba(163,230,53,0.12)' : '#1A1B20',
                    color: formData.gender === 'male' ? 'var(--neon)' : '#aaa',
                    fontWeight: 800,
                    fontSize: 13,
                    cursor: 'pointer'
                  }}
                >
                  👨 Masculino
                </button>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, gender: 'female' })}
                  style={{
                    padding: '10px',
                    borderRadius: 12,
                    border: formData.gender === 'female' ? '1.5px solid #F43F5E' : '1px solid #333',
                    background: formData.gender === 'female' ? 'rgba(244,63,94,0.12)' : '#1A1B20',
                    color: formData.gender === 'female' ? '#F43F5E' : '#aaa',
                    fontWeight: 800,
                    fontSize: 13,
                    cursor: 'pointer'
                  }}
                >
                  👩 Feminino
                </button>
              </div>
            </div>

            {/* 3. Idade, Altura, Peso Atual, Meta */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 14 }}>
              <div>
                <label style={{ display: 'block', fontSize: 10, fontWeight: 800, color: '#A1A1AA', marginBottom: 4 }}>
                  IDADE (ANOS)
                </label>
                <input
                  type="number"
                  placeholder="28"
                  value={formData.age}
                  onChange={e => setFormData({ ...formData, age: e.target.value })}
                  style={{
                    width: '100%', height: 42, background: '#1A1B20', border: '1px solid #333',
                    borderRadius: 10, padding: '0 10px', color: '#fff', fontSize: 14, boxSizing: 'border-box'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 10, fontWeight: 800, color: '#A1A1AA', marginBottom: 4 }}>
                  ALTURA (CM)
                </label>
                <input
                  type="number"
                  placeholder="175"
                  value={formData.height}
                  onChange={e => setFormData({ ...formData, height: e.target.value })}
                  style={{
                    width: '100%', height: 42, background: '#1A1B20', border: '1px solid #333',
                    borderRadius: 10, padding: '0 10px', color: '#fff', fontSize: 14, boxSizing: 'border-box'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 10, fontWeight: 800, color: '#A1A1AA', marginBottom: 4 }}>
                  PESO ATUAL (KG)
                </label>
                <input
                  type="number"
                  step="0.5"
                  placeholder="78"
                  value={formData.weight}
                  onChange={e => setFormData({ ...formData, weight: e.target.value })}
                  style={{
                    width: '100%', height: 42, background: '#1A1B20', border: '1px solid #333',
                    borderRadius: 10, padding: '0 10px', color: '#fff', fontSize: 14, boxSizing: 'border-box'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 10, fontWeight: 800, color: '#A1A1AA', marginBottom: 4 }}>
                  PESO META (KG)
                </label>
                <input
                  type="number"
                  step="0.5"
                  placeholder="70"
                  value={formData.goalWeight}
                  onChange={e => setFormData({ ...formData, goalWeight: e.target.value })}
                  style={{
                    width: '100%', height: 42, background: '#1A1B20', border: '1px solid #333',
                    borderRadius: 10, padding: '0 10px', color: '#fff', fontSize: 14, boxSizing: 'border-box'
                  }}
                />
              </div>
            </div>

            {/* 4. Objetivo Principal */}
            <div style={{ marginBottom: 14 }}>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 800, color: 'var(--neon)', marginBottom: 6, textTransform: 'uppercase' }}>
                3. Objetivo Principal:
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 6 }}>
                {[
                  { id: 'emagrecer', label: 'Secar Gordura', icon: '🔥' },
                  { id: 'hipertrofia', label: 'Ganhar Massa', icon: '💪' },
                  { id: 'recomposicao', label: 'Definição Pro', icon: '⚡' }
                ].map(item => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setFormData({ ...formData, goal: item.id })}
                    style={{
                      padding: '8px 4px',
                      borderRadius: 10,
                      border: formData.goal === item.id ? '1.5px solid var(--neon)' : '1px solid #333',
                      background: formData.goal === item.id ? 'rgba(163,230,53,0.15)' : '#1A1B20',
                      color: formData.goal === item.id ? 'var(--neon)' : '#aaa',
                      fontSize: 11,
                      fontWeight: 800,
                      cursor: 'pointer',
                      textAlign: 'center'
                    }}
                  >
                    <div>{item.icon}</div>
                    <div>{item.label}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* 5. Nível & Foco Muscular */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 18 }}>
              <div>
                <label style={{ display: 'block', fontSize: 10, fontWeight: 800, color: '#A1A1AA', marginBottom: 4 }}>
                  NÍVEL DE TREINO
                </label>
                <select
                  value={formData.level}
                  onChange={e => setFormData({ ...formData, level: e.target.value })}
                  style={{
                    width: '100%', height: 42, background: '#1A1B20', border: '1px solid #333',
                    borderRadius: 10, padding: '0 8px', color: '#fff', fontSize: 12, boxSizing: 'border-box'
                  }}
                >
                  <option value="iniciante">Iniciante (0-6 meses)</option>
                  <option value="intermediario">Intermediário (6m-2a)</option>
                  <option value="avancado">Avançado (+ 2 anos)</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 10, fontWeight: 800, color: '#A1A1AA', marginBottom: 4 }}>
                  MÚSCULO FOCO
                </label>
                <select
                  value={formData.focus}
                  onChange={e => setFormData({ ...formData, focus: e.target.value })}
                  style={{
                    width: '100%', height: 42, background: '#1A1B20', border: '1px solid #333',
                    borderRadius: 10, padding: '0 8px', color: '#fff', fontSize: 12, boxSizing: 'border-box'
                  }}
                >
                  <option value="ombros">Ombros & Braços</option>
                  <option value="peito">Peitoral & Tríceps</option>
                  <option value="costas">Costas & Bíceps</option>
                  <option value="pernas">Pernas & Glúteos</option>
                  <option value="abdomen">Abdômen & Cintura</option>
                </select>
              </div>
            </div>

            {/* Botão de Conclusão */}
            <button
              type="submit"
              style={{
                width: '100%',
                height: 52,
                borderRadius: 14,
                border: 'none',
                background: 'linear-gradient(135deg, #BEF264 0%, #A3E635 100%)',
                color: '#000',
                fontWeight: 900,
                fontSize: 15,
                cursor: 'pointer',
                boxShadow: '0 4px 25px rgba(163,230,53,0.45)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                textTransform: 'uppercase',
                letterSpacing: 0.5
              }}
            >
              <span>⚡ GERAR MEU PLANO PERSONALIZADO</span>
            </button>
          </form>
        )}

      </div>
    </div>,
    document.body
  )
}
