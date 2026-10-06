import React, { useState, useEffect } from 'react'
import {
  getAllDailyLogs,
  getDayLog,
  getFormattedDate,
  getNextSequentialWorkout,
  completeWorkoutForDay,
  addMealToDay,
  initSeedDataIfEmpty,
  WORKOUT_SEQUENCE
} from '../lib/dailyLogs'

/* ========================================================
   NEXA FIT PRO — Minimalist & Futuristic Dashboard Engine
   Inspirado no visual Cyber-Dark / SocialFit
   Ultra-leve, profissional, tipografia nítida e micro-interações
   ======================================================== */

export default function FitnessCalendar({ onOpenRunningTracker, onNavigateToTreinos, onNavigateToDieta }) {
  const [selectedDate, setSelectedDate] = useState(() => getFormattedDate())
  const [logs, setLogs] = useState({})
  const [sequentialWorkoutInfo, setSequentialWorkoutInfo] = useState(null)
  const [isAddingMeal, setIsAddingMeal] = useState(false)
  const [activeTab, setActiveTab] = useState('refeicoes') // 'refeicoes' | 'corrida'
  const [mealForm, setMealForm] = useState({ type: 'Almoço', name: '', cals: 450, protein: 35, carbs: 40, fats: 12 })

  useEffect(() => {
    initSeedDataIfEmpty()
    refreshData()
  }, [selectedDate])

  const refreshData = () => {
    const all = getAllDailyLogs()
    setLogs(all)
    setSequentialWorkoutInfo(getNextSequentialWorkout())
  }

  // Gera os 7 dias da semana atual
  const getWeekDates = () => {
    const current = new Date(selectedDate + 'T12:00:00')
    const dayOfWeek = current.getDay() // 0 = Dom, 1 = Seg...
    const startOfWeek = new Date(current)
    startOfWeek.setDate(current.getDate() - dayOfWeek)

    const days = []
    const dayNames = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']

    for (let i = 0; i < 7; i++) {
      const d = new Date(startOfWeek)
      d.setDate(startOfWeek.getDate() + i)
      const dateStr = getFormattedDate(d)
      days.push({
        dateStr,
        dayName: dayNames[i],
        dayNumber: d.getDate(),
        isToday: dateStr === getFormattedDate(),
        isSelected: dateStr === selectedDate
      })
    }
    return days
  }

  const weekDays = getWeekDates()
  const currentDayLog = getDayLog(selectedDate)
  const nextWorkout = sequentialWorkoutInfo?.workout

  // Cálculos de macros do dia
  const totalCals = (currentDayLog.meals || []).reduce((acc, m) => acc + (Number(m.cals) || 0), 0)
  const totalProtein = (currentDayLog.meals || []).reduce((acc, m) => acc + (Number(m.protein) || 0), 0)
  const totalCarbs = (currentDayLog.meals || []).reduce((acc, m) => acc + (Number(m.carbs) || 0), 0)
  const totalFats = (currentDayLog.meals || []).reduce((acc, m) => acc + (Number(m.fats) || 0), 0)
  const calorieGoal = currentDayLog.caloriesGoal || 2200

  // Marcar treino sequencial como feito hoje
  const handleCompleteSequentialWorkout = () => {
    if (!nextWorkout) return
    completeWorkoutForDay(selectedDate, {
      code: nextWorkout.code,
      name: nextWorkout.name,
      category: nextWorkout.category,
      durationMin: nextWorkout.durationMin,
      caloriesEst: nextWorkout.caloriesEst,
      exercisesCount: nextWorkout.exercises.length
    })
    refreshData()
  }

  // Adicionar refeição
  const handleAddMeal = (e) => {
    e.preventDefault()
    if (!mealForm.name) return
    addMealToDay(selectedDate, mealForm)
    setMealForm({ type: 'Lanche', name: '', cals: 350, protein: 25, carbs: 30, fats: 10 })
    setIsAddingMeal(false)
    refreshData()
  }

  // Estatísticas calculadas de hoje
  const caloriesBurned = (currentDayLog.workout ? currentDayLog.workout.caloriesEst : 0) + (currentDayLog.running ? currentDayLog.running.calories : 0) || 367
  const trainingMinutes = (currentDayLog.workout ? currentDayLog.workout.durationMin : 0) + (currentDayLog.running ? Math.round((currentDayLog.running.durationSec || 0) / 60) : 0) || 55

  return (
    <div style={{ color: '#fff' }}>
      
      {/* ── 1. SELETOR HORIZONTAL DA SEMANA (SLIM & FUTURISTA) ── */}
      <div style={{ marginBottom: 22 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10, padding: '0 2px' }}>
          <span style={{ fontSize: 11, fontWeight: 800, color: '#71717A', letterSpacing: 1, textTransform: 'uppercase' }}>
            {new Date(selectedDate + 'T12:00:00').toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}
          </span>
          {selectedDate !== getFormattedDate() && (
            <button
              onClick={() => setSelectedDate(getFormattedDate())}
              style={{
                background: 'rgba(163,230,53,0.1)',
                border: '1px solid rgba(163,230,53,0.3)',
                color: 'var(--neon)',
                fontSize: 10,
                fontWeight: 800,
                padding: '3px 8px',
                borderRadius: 6,
                cursor: 'pointer'
              }}
            >
              Hoje ➔
            </button>
          )}
        </div>

        {/* 7 Dias em Grid Flex Slim */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(7, 1fr)',
          gap: 6,
          background: 'rgba(255,255,255,0.02)',
          border: '1px solid rgba(255,255,255,0.05)',
          borderRadius: 16,
          padding: '6px'
        }}>
          {weekDays.map(day => {
            const dayLog = logs[day.dateStr] || {}
            const hasWorkout = !!dayLog.workout
            const hasMeals = (dayLog.meals || []).length > 0
            const hasRunning = !!dayLog.running
            const isSelected = day.isSelected

            return (
              <button
                key={day.dateStr}
                onClick={() => setSelectedDate(day.dateStr)}
                style={{
                  background: isSelected ? 'var(--neon)' : 'transparent',
                  color: isSelected ? '#000' : '#fff',
                  border: isSelected ? 'none' : day.isToday ? '1px solid rgba(163,230,53,0.4)' : '1px solid transparent',
                  borderRadius: 12,
                  padding: '8px 2px 6px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  transition: 'all 0.2s cubic-bezier(0.2, 0.8, 0.2, 1)',
                  boxShadow: isSelected ? '0 4px 14px rgba(163,230,53,0.35)' : 'none'
                }}
              >
                <span style={{
                  fontSize: 10,
                  fontWeight: 700,
                  color: isSelected ? '#000' : '#71717A',
                  textTransform: 'uppercase',
                  marginBottom: 2
                }}>
                  {day.dayName}
                </span>
                <span style={{ fontSize: 15, fontWeight: 900, lineHeight: 1 }}>
                  {day.dayNumber}
                </span>

                {/* Marcadores discretos de atividades */}
                <div style={{ display: 'flex', gap: 2, height: 4, marginTop: 4, alignItems: 'center' }}>
                  {hasWorkout && (
                    <span style={{ width: 4, height: 4, borderRadius: '50%', background: isSelected ? '#000' : 'var(--neon)' }} />
                  )}
                  {hasRunning && (
                    <span style={{ width: 4, height: 4, borderRadius: '50%', background: isSelected ? '#000' : '#38BDF8' }} />
                  )}
                  {hasMeals && (
                    <span style={{ width: 4, height: 4, borderRadius: '50%', background: isSelected ? '#000' : '#F59E0B' }} />
                  )}
                </div>
              </button>
            )
          })}
        </div>
      </div>

      {/* ── 2. HERO CARD: PRÓXIMO TREINO (INSPIRADO NO SOCIALFIT) ── */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10, padding: '0 2px' }}>
          <h2 style={{ fontSize: 15, fontWeight: 800, color: '#fff', margin: 0, letterSpacing: -0.2 }}>
            {currentDayLog.workout ? 'Treino Concluído' : 'Próximo Treino'}
          </h2>
          <span style={{
            fontSize: 10,
            fontWeight: 800,
            color: currentDayLog.workout ? '#22C55E' : 'var(--neon)',
            background: currentDayLog.workout ? 'rgba(34,197,94,0.12)' : 'rgba(163,230,53,0.12)',
            padding: '3px 8px',
            borderRadius: 6,
            border: `1px solid ${currentDayLog.workout ? 'rgba(34,197,94,0.3)' : 'rgba(163,230,53,0.3)'}`
          }}>
            {currentDayLog.workout ? 'CONCLUÍDO HOJE' : `SEQUÊNCIA • TREINO ${nextWorkout?.code || 'A'}`}
          </span>
        </div>

        {/* Card Cinematográfico Dark */}
        <div style={{
          position: 'relative',
          borderRadius: 20,
          overflow: 'hidden',
          background: '#121214',
          border: '1px solid rgba(255,255,255,0.08)',
          boxShadow: '0 12px 30px rgba(0,0,0,0.5)'
        }}>
          {/* Imagem de Fundo / GIF do Treino com Vignette */}
          <div style={{ position: 'relative', height: 180, width: '100%', overflow: 'hidden' }}>
            <img
              src={nextWorkout?.img || 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=800&q=80'}
              alt={nextWorkout?.name}
              style={{ width: '100%', height: '100%', objectFit: 'cover', filter: 'brightness(0.75)' }}
            />
            {/* Gradientes e Vinhetas futuristas */}
            <div style={{
              position: 'absolute', inset: 0,
              background: 'linear-gradient(180deg, rgba(0,0,0,0.2) 0%, rgba(10,10,12,0.6) 50%, #121214 100%)'
            }} />

            {/* Badges Flutuantes de Duração e Calorias */}
            <div style={{ position: 'absolute', top: 12, right: 12, display: 'flex', gap: 6 }}>
              <div style={{
                background: 'rgba(0,0,0,0.65)',
                backdropFilter: 'blur(8px)',
                border: '1px solid rgba(255,255,255,0.1)',
                padding: '4px 8px',
                borderRadius: 8,
                fontSize: 11,
                fontWeight: 800,
                color: '#fff',
                display: 'flex',
                alignItems: 'center',
                gap: 4
              }}>
                <span style={{ color: 'var(--neon)' }}>⏱</span>
                <span>{currentDayLog.workout ? currentDayLog.workout.durationMin : (nextWorkout?.durationMin || 45)} min</span>
              </div>
              <div style={{
                background: 'rgba(0,0,0,0.65)',
                backdropFilter: 'blur(8px)',
                border: '1px solid rgba(255,255,255,0.1)',
                padding: '4px 8px',
                borderRadius: 8,
                fontSize: 11,
                fontWeight: 800,
                color: '#fff',
                display: 'flex',
                alignItems: 'center',
                gap: 4
              }}>
                <span style={{ color: '#F97316' }}>🔥</span>
                <span>{currentDayLog.workout ? currentDayLog.workout.caloriesEst : (nextWorkout?.caloriesEst || 340)} kcal</span>
              </div>
            </div>

            {/* Título Sobreposto */}
            <div style={{ position: 'absolute', bottom: 12, left: 14, right: 14 }}>
              <span style={{ fontSize: 10, fontWeight: 800, color: 'var(--neon)', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                {nextWorkout?.category ? `Foco: ${nextWorkout.category}` : 'Hipertrofia & Definição'}
              </span>
              <h3 style={{ fontSize: 19, fontWeight: 900, color: '#fff', margin: '2px 0 0', lineHeight: 1.2 }}>
                {currentDayLog.workout ? currentDayLog.workout.name : nextWorkout?.name || 'Peito, Tríceps & Core'}
              </h3>
            </div>
          </div>

          {/* Barra de Progresso XP Nível (Como no SocialFit) */}
          <div style={{ padding: '12px 14px 14px', background: '#121214' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, fontWeight: 800, color: '#D4D4D8' }}>
                <span style={{ color: 'var(--neon)' }}>★</span>
                <span>Nível 2 • Pro Athlete</span>
              </div>
              <span style={{ fontSize: 11, fontWeight: 700, color: '#71717A' }}>
                320 / 400 XP
              </span>
            </div>
            
            {/* Barra Fina Neon */}
            <div style={{ height: 4, background: 'rgba(255,255,255,0.08)', borderRadius: 2, overflow: 'hidden', marginBottom: 14 }}>
              <div style={{
                width: '80%',
                height: '100%',
                background: 'linear-gradient(90deg, #84CC16, var(--neon))',
                borderRadius: 2,
                boxShadow: '0 0 8px rgba(163,230,53,0.8)'
              }} />
            </div>

            {/* Botões de Ação */}
            <div style={{ display: 'flex', gap: 8 }}>
              {currentDayLog.workout ? (
                <button
                  onClick={onNavigateToTreinos}
                  style={{
                    flex: 1,
                    padding: '11px',
                    background: 'rgba(34,197,94,0.15)',
                    border: '1px solid rgba(34,197,94,0.4)',
                    borderRadius: 12,
                    color: '#22C55E',
                    fontSize: 12,
                    fontWeight: 900,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 6
                  }}
                >
                  <span>✓ Treino Concluído • Ver Catálogo</span>
                </button>
              ) : (
                <>
                  <button
                    onClick={handleCompleteSequentialWorkout}
                    style={{
                      flex: 1,
                      padding: '11px',
                      background: 'var(--neon)',
                      border: 'none',
                      borderRadius: 12,
                      color: '#000',
                      fontSize: 13,
                      fontWeight: 900,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 6,
                      boxShadow: '0 4px 15px rgba(163,230,53,0.3)'
                    }}
                  >
                    <span>CONCLUIR TREINO {nextWorkout?.code || 'A'}</span>
                    <span>➔</span>
                  </button>
                  <button
                    onClick={onNavigateToTreinos}
                    style={{
                      padding: '11px 14px',
                      background: 'rgba(255,255,255,0.05)',
                      border: '1px solid rgba(255,255,255,0.08)',
                      borderRadius: 12,
                      color: '#fff',
                      fontSize: 12,
                      fontWeight: 800,
                      cursor: 'pointer'
                    }}
                  >
                    Exercícios
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── 3. ESTATÍSTICAS DE HOJE (CARDS FROSTED SIDE-BY-SIDE) ── */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10, padding: '0 2px' }}>
          <h2 style={{ fontSize: 15, fontWeight: 800, color: '#fff', margin: 0, letterSpacing: -0.2 }}>
            Estatísticas de Hoje
          </h2>
          <span style={{ fontSize: 11, color: '#71717A', fontWeight: 600 }}>
            Tempo Real ⚡
          </span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          {/* Card 1: Calorias Queimadas */}
          <div style={{
            background: '#121214',
            borderRadius: 18,
            padding: '14px 16px',
            border: '1px solid rgba(255,255,255,0.06)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <div>
              <span style={{ fontSize: 11, color: '#888', fontWeight: 700, display: 'block', marginBottom: 4 }}>
                Calorias queimadas
              </span>
              <div style={{ fontSize: 24, fontWeight: 900, color: '#fff', lineHeight: 1 }}>
                {caloriesBurned} <span style={{ fontSize: 11, color: '#71717A', fontWeight: 700 }}>kcal</span>
              </div>
            </div>
            <div style={{
              width: 38, height: 38, borderRadius: '50%', background: 'rgba(163,230,53,0.1)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, color: 'var(--neon)'
            }}>
              🔥
            </div>
          </div>

          {/* Card 2: Minutos de Treino */}
          <div style={{
            background: '#121214',
            borderRadius: 18,
            padding: '14px 16px',
            border: '1px solid rgba(255,255,255,0.06)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <div>
              <span style={{ fontSize: 11, color: '#888', fontWeight: 700, display: 'block', marginBottom: 4 }}>
                Minutos de treino
              </span>
              <div style={{ fontSize: 24, fontWeight: 900, color: '#fff', lineHeight: 1 }}>
                {trainingMinutes} <span style={{ fontSize: 11, color: '#71717A', fontWeight: 700 }}>min</span>
              </div>
            </div>
            <div style={{
              width: 38, height: 38, borderRadius: '50%', background: 'rgba(56,189,248,0.1)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, color: '#38BDF8'
            }}>
              ⏱
            </div>
          </div>
        </div>
      </div>

      {/* ── 4. MAIS TREINOS (CAROUSEL HORIZONTAL CINEMATOGRÁFICO) ── */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, padding: '0 2px' }}>
          <h2 style={{ fontSize: 15, fontWeight: 800, color: '#fff', margin: 0, letterSpacing: -0.2 }}>
            Mais Treinos
          </h2>
          <button
            onClick={onNavigateToTreinos}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--neon)',
              fontSize: 12,
              fontWeight: 800,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 3
            }}
          >
            <span>Ver todos</span>
            <span>➔</span>
          </button>
        </div>

        {/* Carousel com Snap Horizontal */}
        <div style={{
          display: 'flex',
          gap: 12,
          overflowX: 'auto',
          paddingBottom: 6,
          scrollbarWidth: 'none',
          msOverflowStyle: 'none'
        }}>
          {WORKOUT_SEQUENCE.map((item) => (
            <div
              key={item.code}
              onClick={onNavigateToTreinos}
              style={{
                minWidth: 140,
                maxWidth: 140,
                borderRadius: 16,
                overflow: 'hidden',
                background: '#141416',
                border: '1px solid rgba(255,255,255,0.06)',
                cursor: 'pointer',
                flexShrink: 0,
                transition: 'transform 0.2s ease',
              }}
            >
              <div style={{ height: 100, position: 'relative', width: '100%' }}>
                <img
                  src={item.img}
                  alt={item.name}
                  style={{ width: '100%', height: '100%', objectFit: 'cover', filter: 'brightness(0.8)' }}
                />
                <div style={{
                  position: 'absolute', inset: 0,
                  background: 'linear-gradient(180deg, transparent 40%, rgba(0,0,0,0.85) 100%)'
                }} />
                <span style={{
                  position: 'absolute', top: 6, left: 6,
                  background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)',
                  color: 'var(--neon)', fontSize: 9, fontWeight: 900,
                  padding: '2px 6px', borderRadius: 4, border: '1px solid rgba(163,230,53,0.3)'
                }}>
                  {item.code}
                </span>
              </div>
              <div style={{ padding: '8px 10px' }}>
                <h4 style={{
                  fontSize: 12,
                  fontWeight: 800,
                  color: '#fff',
                  margin: 0,
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis'
                }}>
                  {item.name}
                </h4>
                <span style={{ fontSize: 10, color: '#71717A', fontWeight: 600 }}>
                  {item.durationMin} min • {item.caloriesEst} kcal
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── 5. DIÁRIO DIÁRIO (TABS COMPACTAS: NUTRIÇÃO & CORRIDA GPS) ── */}
      <div style={{
        background: '#121214',
        borderRadius: 20,
        padding: '16px',
        border: '1px solid rgba(255,255,255,0.06)',
        boxShadow: '0 8px 24px rgba(0,0,0,0.3)'
      }}>
        {/* Switch de Abas Minimalistas */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
          <div style={{ display: 'flex', gap: 4, background: 'rgba(255,255,255,0.04)', padding: 3, borderRadius: 10 }}>
            <button
              onClick={() => setActiveTab('refeicoes')}
              style={{
                background: activeTab === 'refeicoes' ? 'rgba(255,255,255,0.1)' : 'transparent',
                color: activeTab === 'refeicoes' ? '#fff' : '#71717A',
                border: 'none',
                padding: '6px 12px',
                borderRadius: 8,
                fontSize: 11,
                fontWeight: 800,
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              🥗 Nutrição ({totalCals} kcal)
            </button>
            <button
              onClick={() => setActiveTab('corrida')}
              style={{
                background: activeTab === 'corrida' ? 'rgba(56,189,248,0.15)' : 'transparent',
                color: activeTab === 'corrida' ? '#38BDF8' : '#71717A',
                border: 'none',
                padding: '6px 12px',
                borderRadius: 8,
                fontSize: 11,
                fontWeight: 800,
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              🏃 Corrida GPS
            </button>
          </div>

          {activeTab === 'refeicoes' ? (
            <button
              onClick={() => setIsAddingMeal(true)}
              style={{
                background: 'rgba(163,230,53,0.12)',
                border: '1px solid rgba(163,230,53,0.3)',
                color: 'var(--neon)',
                fontSize: 11,
                fontWeight: 800,
                padding: '5px 10px',
                borderRadius: 8,
                cursor: 'pointer'
              }}
            >
              + Adicionar
            </button>
          ) : (
            <button
              onClick={onOpenRunningTracker}
              style={{
                background: 'rgba(56,189,248,0.15)',
                border: '1px solid #38BDF8',
                color: '#38BDF8',
                fontSize: 11,
                fontWeight: 800,
                padding: '5px 10px',
                borderRadius: 8,
                cursor: 'pointer'
              }}
            >
              Abrir GPS
            </button>
          )}
        </div>

        {/* Conteúdo da Aba Ativa */}
        {activeTab === 'refeicoes' ? (
          <div>
            {/* Macros Compactos */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 6, marginBottom: 12 }}>
              <div style={{ background: 'rgba(255,255,255,0.02)', padding: '6px 8px', borderRadius: 8, textAlign: 'center' }}>
                <span style={{ fontSize: 9, color: '#71717A', display: 'block' }}>Proteína</span>
                <span style={{ fontSize: 13, fontWeight: 900, color: '#fff' }}>{totalProtein}g</span>
              </div>
              <div style={{ background: 'rgba(255,255,255,0.02)', padding: '6px 8px', borderRadius: 8, textAlign: 'center' }}>
                <span style={{ fontSize: 9, color: '#71717A', display: 'block' }}>Carboidratos</span>
                <span style={{ fontSize: 13, fontWeight: 900, color: '#fff' }}>{totalCarbs}g</span>
              </div>
              <div style={{ background: 'rgba(255,255,255,0.02)', padding: '6px 8px', borderRadius: 8, textAlign: 'center' }}>
                <span style={{ fontSize: 9, color: '#71717A', display: 'block' }}>Gorduras</span>
                <span style={{ fontSize: 13, fontWeight: 900, color: '#fff' }}>{totalFats}g</span>
              </div>
            </div>

            {/* Lista de Refeições */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {(currentDayLog.meals || []).length === 0 ? (
                <div style={{ textAlign: 'center', padding: '14px', color: '#71717A', fontSize: 11 }}>
                  Nenhuma refeição registrada hoje. Clique em "+ Adicionar".
                </div>
              ) : (
                currentDayLog.meals.map(meal => (
                  <div
                    key={meal.id}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      background: 'rgba(255,255,255,0.02)',
                      padding: '8px 10px',
                      borderRadius: 10,
                      border: '1px solid rgba(255,255,255,0.04)'
                    }}
                  >
                    <div>
                      <span style={{ fontSize: 11, fontWeight: 800, color: '#fff' }}>{meal.type}</span>
                      <span style={{ fontSize: 10, color: '#71717A', marginLeft: 6 }}>{meal.name}</span>
                    </div>
                    <span style={{ fontSize: 11, fontWeight: 900, color: 'var(--neon)' }}>
                      {meal.cals} kcal
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        ) : (
          <div>
            {currentDayLog.running ? (
              <div style={{
                background: 'rgba(56,189,248,0.06)',
                borderRadius: 12,
                padding: '12px',
                border: '1px solid rgba(56,189,248,0.2)'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                  <div>
                    <span style={{ fontSize: 11, color: '#38BDF8', fontWeight: 800 }}>Corrida Registrada</span>
                    <div style={{ fontSize: 20, fontWeight: 900, color: '#fff' }}>
                      {currentDayLog.running.distanceKm} <span style={{ fontSize: 11, color: '#71717A' }}>km</span>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <span style={{ fontSize: 10, color: '#71717A', display: 'block' }}>Pace Médio</span>
                    <span style={{ fontSize: 14, fontWeight: 800, color: '#fff' }}>{currentDayLog.running.pace} /km</span>
                  </div>
                </div>
                <button
                  onClick={onOpenRunningTracker}
                  style={{
                    width: '100%',
                    padding: '8px',
                    background: '#38BDF8',
                    color: '#000',
                    border: 'none',
                    borderRadius: 8,
                    fontSize: 11,
                    fontWeight: 900,
                    cursor: 'pointer'
                  }}
                >
                  Ver Percurso no Mapa
                </button>
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '14px 6px' }}>
                <p style={{ fontSize: 11, color: '#71717A', margin: '0 0 10px' }}>
                  Nenhum percurso de corrida registrado para este dia.
                </p>
                <button
                  onClick={onOpenRunningTracker}
                  style={{
                    padding: '8px 16px',
                    background: '#38BDF8',
                    color: '#000',
                    border: 'none',
                    borderRadius: 10,
                    fontSize: 11,
                    fontWeight: 900,
                    cursor: 'pointer'
                  }}
                >
                  🏃 Iniciar Rastreamento GPS
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Modal Minimalista de Adicionar Refeição */}
      {isAddingMeal && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 999, background: 'rgba(0,0,0,0.85)',
          backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16
        }}>
          <div style={{
            background: '#141416', borderRadius: 20, padding: 20, width: '100%', maxWidth: 380,
            border: '1px solid rgba(255,255,255,0.1)', boxShadow: '0 16px 40px rgba(0,0,0,0.9)'
          }}>
            <h3 style={{ fontSize: 15, fontWeight: 900, marginBottom: 14, color: '#fff' }}>Registrar Refeição</h3>
            <form onSubmit={handleAddMeal}>
              <div style={{ marginBottom: 10 }}>
                <label style={{ fontSize: 10, color: '#71717A', fontWeight: 700, textTransform: 'uppercase' }}>Tipo de Refeição</label>
                <select
                  value={mealForm.type}
                  onChange={(e) => setMealForm({ ...mealForm, type: e.target.value })}
                  style={{ width: '100%', padding: '9px 10px', borderRadius: 10, background: '#1E1E22', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', marginTop: 4, fontSize: 12 }}
                >
                  <option>Café da Manhã</option>
                  <option>Almoço</option>
                  <option>Lanche da Tarde</option>
                  <option>Jantar</option>
                  <option>Ceia / Pós-Treino</option>
                </select>
              </div>

              <div style={{ marginBottom: 10 }}>
                <label style={{ fontSize: 10, color: '#71717A', fontWeight: 700, textTransform: 'uppercase' }}>Alimento / Prato</label>
                <input
                  type="text"
                  placeholder="Ex: Frango grelhado + Batata doce"
                  value={mealForm.name}
                  onChange={(e) => setMealForm({ ...mealForm, name: e.target.value })}
                  style={{ width: '100%', padding: '9px 10px', borderRadius: 10, background: '#1E1E22', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', marginTop: 4, fontSize: 12 }}
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 16 }}>
                <div>
                  <label style={{ fontSize: 10, color: '#71717A', fontWeight: 700, textTransform: 'uppercase' }}>Calorias (kcal)</label>
                  <input
                    type="number"
                    value={mealForm.cals}
                    onChange={(e) => setMealForm({ ...mealForm, cals: Number(e.target.value) })}
                    style={{ width: '100%', padding: '9px 10px', borderRadius: 10, background: '#1E1E22', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', marginTop: 4, fontSize: 12 }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: 10, color: '#71717A', fontWeight: 700, textTransform: 'uppercase' }}>Proteína (g)</label>
                  <input
                    type="number"
                    value={mealForm.protein}
                    onChange={(e) => setMealForm({ ...mealForm, protein: Number(e.target.value) })}
                    style={{ width: '100%', padding: '9px 10px', borderRadius: 10, background: '#1E1E22', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', marginTop: 4, fontSize: 12 }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', gap: 8 }}>
                <button
                  type="button"
                  onClick={() => setIsAddingMeal(false)}
                  style={{ flex: 1, padding: 10, background: '#222', color: '#fff', border: 'none', borderRadius: 10, fontWeight: 700, fontSize: 12 }}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  style={{ flex: 1, padding: 10, background: 'var(--neon)', color: '#000', border: 'none', borderRadius: 10, fontWeight: 900, fontSize: 12 }}
                >
                  Salvar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  )
}
