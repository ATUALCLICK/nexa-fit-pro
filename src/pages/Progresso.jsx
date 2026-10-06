import { useState, useEffect, useRef } from 'react'
import { Camera, TrendingUp, Plus, X, Weight, Trash2, CheckCircle, XCircle, Clock, Trophy, Star, Medal } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import db from '../db/database'
import { loadTodayWater, loadTodayWorkout, loadTodayActivities } from '../lib/syncHelpers'

export default function Progresso() {
  const [user, setUser] = useState(null)
  const [pesosLog, setPesosLog] = useState([])
  const [fotos, setFotos] = useState([])
  const [showAddPeso, setShowAddPeso] = useState(false)
  const [novoPeso, setNovoPeso] = useState('')
  const [showAddFoto, setShowAddFoto] = useState(false)
  const [descFoto, setDescFoto] = useState('')
  const [fotoPreview, setFotoPreview] = useState(null)
  const [relatorio, setRelatorio] = useState(null)
  const [ranking, setRanking] = useState([])
  const fileRef = useRef(null)
  const navigate = useNavigate()

  useEffect(() => {
    db.users.toArray().then(async users => {
      if (users.length > 0) {
        const u = users[0]
        setUser(u)
        
        // Carrega histórico de peso de daily_logs (salvo em nuvem) ou localStorage
        let savedPesos = u.daily_logs?.pesos || JSON.parse(localStorage.getItem('bronks_pesos_' + u.id) || '[]')
        if (u.peso && savedPesos.length === 0) {
          savedPesos = [{ data: new Date().toLocaleDateString('pt-BR'), peso: Number(u.peso), iso: new Date().toISOString() }]
          localStorage.setItem('bronks_pesos_' + u.id, JSON.stringify(savedPesos))
          // Atualiza no Dexie
          u.daily_logs = { ...(u.daily_logs || {}), pesos: savedPesos }
          await db.users.put(u)
        } else {
          localStorage.setItem('bronks_pesos_' + u.id, JSON.stringify(savedPesos))
        }
        setPesosLog(savedPesos)
        
        const savedFotos = JSON.parse(localStorage.getItem('bronks_fotos_' + u.id) || '[]')
        setFotos(savedFotos)

        // Carrega relatório do dia
        if (u.celular) {
          const [water, workout, activities] = await Promise.all([
            loadTodayWater(u.celular),
            loadTodayWorkout(u.celular),
            loadTodayActivities(u.celular)
          ])
          const hoje = new Date().toDateString()
          const localHydration = Number(localStorage.getItem('hydration_' + hoje) || 0)
          const litrosMeta = ((Number(u.peso)||70) * 35) / 1000
          const garrafasMeta = Math.ceil((Number(u.peso)||70) * 35 / 500)
          const garrafasAtivas = water?.garrafas ?? localHydration
          const localActivities = JSON.parse(localStorage.getItem('bronks_activities_' + hoje) || '{}')
          const diaSemana = new Date().getDay()
          const atividadesDoDia = u.atividades_extras
            ? Object.entries(u.atividades_extras).filter(([,dias]) => dias.includes(diaSemana)).map(([nome]) => nome)
            : []
          const atividadesStatus = atividadesDoDia.map(nome => ({
            nome,
            completada: activities.find(a => a.atividade === nome)?.completada ?? localActivities[nome] ?? false
          }))
          setRelatorio({
            agua: { garrafas: garrafasAtivas, meta: garrafasMeta, ml: garrafasAtivas * 500, mlMeta: litrosMeta * 1000 },
            treino: workout ? { tipo: workout.tipo, completado: workout.completado, exercicios: workout.exercicios_concluidos, total: workout.total_exercicios } : null,
            atividades: atividadesStatus
          })
        }

        // Carrega Ranking Real com 5 usuários e Top 3 em destaque
        try {
          const { supabase } = await import('../lib/supabase')
          
          // 1. Busca perfis reais
          const { data: profiles } = await supabase.from('profiles').select('nome, avatar_url, nivel, celular, created_at')
          // 2. Busca logs de treino reais
          const { data: workouts } = await supabase.from('workout_logs').select('celular, completado, exercicios_concluidos')

          if (profiles && profiles.length > 0) {
            // Agrupar treinos por celular
            const workoutsByUser = {}
            if (workouts) {
              workouts.forEach(w => {
                if (!workoutsByUser[w.celular]) {
                  workoutsByUser[w.celular] = { completed: 0, exercises: 0 }
                }
                if (w.completado) workoutsByUser[w.celular].completed += 1
                workoutsByUser[w.celular].exercises += Number(w.exercicios_concluidos || 0)
              })
            }

            // Calcular pontuação real
            let ranked = profiles.map(p => {
              const stats = workoutsByUser[p.celular] || { completed: 0, exercises: 0 }
              const creationDate = p.created_at ? new Date(p.created_at) : new Date()
              const daysOfUse = Math.max(1, Math.ceil((new Date() - myCreationDateSafe(creationDate)) / (1000 * 60 * 60 * 24)))
              
              // Pontuação baseada em tempo de uso + treinos concluídos + séries/exercícios
              const pontosTempo = daysOfUse * 5
              const pontosTreinos = stats.completed * 50
              const pontosExercicios = stats.exercises * 10
              const totalPontos = pontosTempo + pontosTreinos + pontosExercicios

              return {
                nome: p.nome || 'Atleta Bronks',
                avatar_url: p.avatar_url,
                nivel: p.nivel || 'Iniciante',
                pontos: totalPontos,
                celular: p.celular
              }
            })

            // Auxiliar para datas
            function myCreationDateSafe(dateVal) {
              return isNaN(dateVal.getTime()) ? new Date() : dateVal
            }

            // Garante que o usuário logado está na lista e com pontuação real recalculada
            const myIndex = ranked.findIndex(r => r.celular === u.celular)
            if (myIndex === -1) {
              const myStats = workoutsByUser[u.celular] || { completed: 0, exercises: 0 }
              const myCreationDate = u.created_at ? new Date(u.created_at) : new Date()
              const myDaysOfUse = Math.max(1, Math.ceil((new Date() - myCreationDateSafe(myCreationDate)) / (1000 * 60 * 60 * 24)))
              const myPoints = (myDaysOfUse * 5) + (myStats.completed * 50) + (myStats.exercises * 10)
              ranked.push({
                nome: u.nome || 'Você',
                avatar_url: u.avatar_url,
                nivel: u.nivel || 'Iniciante',
                pontos: myPoints,
                celular: u.celular
              })
            }

            ranked.sort((a, b) => b.pontos - a.pontos)

            // Se tiver menos de 5 usuários, completa com mock realísticos de alto nível para motivar competição
            if (ranked.length < 5) {
              const mockAvatars = [
                'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=100&auto=format&fit=crop&q=60',
                'https://images.unsplash.com/photo-1568602471122-7832951cc4c5?w=100&auto=format&fit=crop&q=60',
                'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=60',
                'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&auto=format&fit=crop&q=60',
                'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=60'
              ]
              const mockNames = ['Rodrigo Monstro', 'Lucas Ferraz', 'Ana Silva', 'Carla Souza', 'Felipe Santos']
              const mockNiveis = ['Monstro', 'Avançado', 'Intermediário', 'Focado', 'Iniciante']
              
              let i = 0
              while (ranked.length < 5 && i < mockNames.length) {
                const name = mockNames[i]
                if (!ranked.some(r => r.nome.toLowerCase().includes(name.toLowerCase().split(' ')[0]))) {
                  ranked.push({
                    nome: name,
                    avatar_url: mockAvatars[i],
                    nivel: mockNiveis[i],
                    pontos: 480 - i * 90
                  })
                }
                i++
              }
              ranked.sort((a, b) => b.pontos - a.pontos)
            }

            setRanking(ranked.slice(0, 5))
          }
        } catch(e) {
          console.warn('Erro ao carregar ranking real', e)
        }
      }
    })
  }, [])

  const adicionarPeso = async () => {
    if (!novoPeso || !user) return
    const pesoNum = Number(novoPeso)
    const hojeIso = new Date().toISOString()
    const hojeStr = new Date().toLocaleDateString('pt-BR')
    
    let atualizado = [...pesosLog]
    const entryExiste = atualizado.find(p => p.data === hojeStr)
    if (entryExiste) {
      entryExiste.peso = pesoNum
    } else {
      atualizado.push({ data: hojeStr, peso: pesoNum, iso: hojeIso })
    }
    
    setPesosLog(atualizado)
    localStorage.setItem('bronks_pesos_' + user.id, JSON.stringify(atualizado))
    
    const updatedUser = {
      ...user,
      peso: pesoNum,
      daily_logs: { ...(user.daily_logs || {}), pesos: atualizado }
    }
    
    // Atualiza peso no perfil local
    await db.users.put(updatedUser)
    setUser(updatedUser)
    setNovoPeso('')
    setShowAddPeso(false)
    window.dispatchEvent(new Event('profileSynced'))

    // Sincroniza com Supabase
    try {
      const { supabase } = await import('../lib/supabase')
      await supabase.from('profiles').update({ 
        peso: pesoNum,
        daily_logs: updatedUser.daily_logs
      }).eq('celular', user.celular)
      console.log('✅ Peso e histórico sincronizados na nuvem')
    } catch (e) {
      console.warn('Offline: não sincronizou com supabase agora', e)
    }
  }

  const excluirPeso = async (idx) => {
    const atualizado = pesosLog.filter((_, i) => i !== idx)
    setPesosLog(atualizado)
    localStorage.setItem('bronks_pesos_' + user.id, JSON.stringify(atualizado))

    const novoPesoAtual = atualizado.length > 0 ? atualizado[atualizado.length - 1].peso : user.peso

    const updatedUser = {
      ...user,
      peso: novoPesoAtual,
      daily_logs: { ...(user.daily_logs || {}), pesos: atualizado }
    }

    await db.users.put(updatedUser)
    setUser(updatedUser)
    window.dispatchEvent(new Event('profileSynced'))

    // Sincroniza com Supabase
    try {
      const { supabase } = await import('../lib/supabase')
      await supabase.from('profiles').update({ 
        peso: novoPesoAtual,
        daily_logs: updatedUser.daily_logs
      }).eq('celular', user.celular)
      console.log('✅ Peso deletado e atualizado na nuvem')
    } catch (e) {
      console.warn('Offline: não sincronizou com supabase agora', e)
    }
  }

  const selecionarFoto = (e) => {
    const file = e.target.files[0]
    if (!file) return
    const reader = new FileReader()
    reader.onloadend = () => setFotoPreview(reader.result)
    reader.readAsDataURL(file)
  }

  const salvarFoto = () => {
    if (!fotoPreview || !user) return
    const nova = { data: new Date().toLocaleDateString('pt-BR'), iso: new Date().toISOString(), url: fotoPreview, descricao: descFoto }
    const atualizado = [...fotos, nova]
    setFotos(atualizado)
    localStorage.setItem('bronks_fotos_' + user.id, JSON.stringify(atualizado))
    setFotoPreview(null)
    setDescFoto('')
    setShowAddFoto(false)
    alert('Foto de evolução salva com sucesso! 🎉')
  }

  const excluirFoto = (idx) => {
    const atualizado = fotos.filter((_, i) => i !== idx)
    setFotos(atualizado)
    localStorage.setItem('bronks_fotos_' + user.id, JSON.stringify(atualizado))
  }

  if (!user) return <div className="p16"><div className="spinner"></div></div>

  const pesoAtual = pesosLog.length > 0 ? pesosLog[pesosLog.length - 1].peso : user.peso
  const pesoInicial = pesosLog.length > 0 ? pesosLog[0].peso : null
  const diferenca = pesoAtual && pesoInicial ? (pesoAtual - pesoInicial).toFixed(1) : null

  // Gráfico simples de linha
  const maxPeso = pesosLog.length > 0 ? Math.max(...pesosLog.map(p => p.peso)) : 100
  const minPeso = pesosLog.length > 0 ? Math.min(...pesosLog.map(p => p.peso)) : 50
  const range = maxPeso - minPeso || 1

  const hoje = new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long' })

  return (
    <div style={{ paddingBottom: '100px' }}>
      <div style={{ padding: '24px 20px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h1 style={{ color: '#fff', fontSize: '24px', fontWeight: 'bold', margin: 0 }}>Evolução</h1>
        <TrendingUp color="#FFD700" size={24} />
      </div>

      <div style={{ padding: '0 20px', display: 'flex', flexDirection: 'column', gap: '20px' }}>

        {/* Relatório do Dia */}
        {relatorio && (
          <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,215,0,0.15)', borderRadius: '20px', overflow: 'hidden' }}>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ color: '#fff', fontWeight: 'bold', fontSize: '15px' }}>📋 Relatório de Hoje</span>
              <span style={{ color: '#555', fontSize: '11px', textTransform: 'capitalize' }}>{hoje}</span>
            </div>
            <div style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>

              {/* Água */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ fontSize: '20px' }}>💧</span>
                  <div>
                    <div style={{ color: '#fff', fontSize: '13px', fontWeight: 'bold' }}>Hidratação</div>
                    <div style={{ color: '#555', fontSize: '11px' }}>{relatorio.agua.ml}ml de {relatorio.agua.mlMeta}ml</div>
                  </div>
                </div>
                {relatorio.agua.garrafas >= relatorio.agua.meta
                  ? <CheckCircle size={22} color="#66BB6A" />
                  : relatorio.agua.garrafas > 0
                    ? <Clock size={22} color="#FFA726" />
                    : <XCircle size={22} color="#e53935" />}
              </div>

              {/* Treino */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ fontSize: '20px' }}>🏋️</span>
                  <div>
                    <div style={{ color: '#fff', fontSize: '13px', fontWeight: 'bold' }}>Treino</div>
                    <div style={{ color: '#555', fontSize: '11px' }}>
                      {relatorio.treino
                        ? relatorio.treino.completado
                          ? `Treino ${relatorio.treino.tipo} concluído`
                          : `Em andamento: ${relatorio.treino.exercicios}/${relatorio.treino.total} exercícios`
                        : 'Ainda não treinou hoje'}
                    </div>
                  </div>
                </div>
                {relatorio.treino?.completado
                  ? <CheckCircle size={22} color="#66BB6A" />
                  : relatorio.treino
                    ? <Clock size={22} color="#FFA726" />
                    : <XCircle size={22} color="#e53935" />}
              </div>

              {/* Dieta - baseado em horário */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ fontSize: '20px' }}>🥗</span>
                  <div>
                    <div style={{ color: '#fff', fontSize: '13px', fontWeight: 'bold' }}>Alimentação</div>
                    <div style={{ color: '#555', fontSize: '11px' }}>Veja sua dieta personalizada</div>
                  </div>
                </div>
                <button onClick={() => navigate('/dieta')} style={{ background: 'rgba(255,215,0,0.1)', border: '1px solid rgba(255,215,0,0.2)', borderRadius: '10px', color: '#FFD700', fontSize: '11px', fontWeight: 'bold', padding: '4px 10px', cursor: 'pointer' }}>Ver</button>
              </div>

              {/* Atividades Complementares */}
              {relatorio.atividades.length > 0 && relatorio.atividades.map(a => (
                <div key={a.nome} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ fontSize: '20px' }}>{a.nome === 'Corrida' ? '🏃' : a.nome === 'Natação' ? '🏊' : a.nome === 'Futebol' ? '⚽' : a.nome === 'Ciclismo' ? '🚴' : a.nome === 'Luta' ? '🥊' : '🏅'}</span>
                    <div>
                      <div style={{ color: '#fff', fontSize: '13px', fontWeight: 'bold' }}>{a.nome}</div>
                      <div style={{ color: '#555', fontSize: '11px' }}>{a.completada ? 'Concluída' : 'Pendente hoje'}</div>
                    </div>
                  </div>
                  {a.completada ? <CheckCircle size={22} color="#66BB6A" /> : <XCircle size={22} color="#e53935" />}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Card Peso Atual */}
        <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '20px', padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
            <div>
              <div style={{ color: '#666', fontSize: '11px', fontWeight: 'bold', letterSpacing: '0.5px', marginBottom: '8px' }}>PESO ATUAL</div>
              <div style={{ color: '#fff', fontSize: '40px', fontWeight: '900', lineHeight: 1 }}>
                {pesoAtual || '—'} <span style={{ color: '#666', fontSize: '18px' }}>kg</span>
              </div>
              {diferenca && (
                <div style={{ marginTop: '8px', color: Number(diferenca) < 0 ? '#66BB6A' : '#e53935', fontSize: '14px', fontWeight: 'bold' }}>
                  {Number(diferenca) > 0 ? '+' : ''}{diferenca} kg desde o início
                </div>
              )}
            </div>
            <button
              onClick={() => setShowAddPeso(true)}
              style={{ background: 'rgba(255,215,0,0.15)', border: '1px solid rgba(255,215,0,0.3)', borderRadius: '14px', padding: '10px 18px', color: '#FFD700', fontWeight: 'bold', fontSize: '13px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <Plus size={15} /> Atualizar
            </button>
          </div>

          {/* Gráfico de linha simples */}
          {pesosLog.length > 1 ? (
            <div>
              <div style={{ color: '#555', fontSize: '11px', marginBottom: '10px' }}>LINHA DO TEMPO</div>
              <div style={{ position: 'relative', height: '80px', background: 'rgba(255,255,255,0.03)', borderRadius: '12px', padding: '10px', overflow: 'hidden' }}>
                <svg width="100%" height="100%" viewBox={`0 0 ${Math.max(pesosLog.length * 50, 200)} 60`} preserveAspectRatio="none">
                  <polyline
                    fill="none"
                    stroke="#FFD700"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    points={pesosLog.map((p, i) => {
                      const x = (i / (pesosLog.length - 1)) * (Math.max(pesosLog.length * 50, 200) - 20) + 10
                      const y = 60 - ((p.peso - minPeso) / range) * 50 - 5
                      return `${x},${y}`
                    }).join(' ')}
                  />
                  {pesosLog.map((p, i) => {
                    const x = (i / (pesosLog.length - 1)) * (Math.max(pesosLog.length * 50, 200) - 20) + 10
                    const y = 60 - ((p.peso - minPeso) / range) * 50 - 5
                    return <circle key={i} cx={x} cy={y} r="4" fill="#FFD700" />
                  })}
                </svg>
              </div>
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '10px 0', color: '#555', fontSize: '13px' }}>
              Atualize seu peso regularmente para ver a evolução aqui 📈
            </div>
          )}
        </div>

        {/* Histórico de Pesos */}
        {pesosLog.length > 0 && (
          <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '20px', overflow: 'hidden' }}>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
              <span style={{ color: '#fff', fontWeight: 'bold', fontSize: '15px' }}>Histórico de Peso</span>
            </div>
            <div style={{ maxHeight: '240px', overflowY: 'auto' }}>
              {[...pesosLog].reverse().map((entry, idx) => {
                const realIdx = pesosLog.length - 1 - idx
                const anterior = realIdx > 0 ? pesosLog[realIdx - 1].peso : null
                const diff = anterior ? (entry.peso - anterior).toFixed(1) : null
                return (
                  <div key={idx} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 20px', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                    <div>
                      <div style={{ color: '#fff', fontWeight: 'bold', fontSize: '16px' }}>{entry.peso} kg</div>
                      <div style={{ color: '#555', fontSize: '12px' }}>{entry.data}</div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      {diff && <span style={{ color: Number(diff) < 0 ? '#66BB6A' : '#e53935', fontSize: '13px', fontWeight: 'bold' }}>{Number(diff) > 0 ? '+' : ''}{diff} kg</span>}
                      <button onClick={() => excluirPeso(realIdx)} style={{ background: 'rgba(229,57,53,0.1)', border: 'none', borderRadius: '8px', padding: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                        <Trash2 size={14} color="#e53935" />
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Ranking de Usuários */}
        {ranking.length > 0 && (
          <div style={{ background: 'linear-gradient(145deg, #1A1A1A, #111)', border: '1px solid rgba(255,215,0,0.2)', borderRadius: '25px', overflow: 'hidden', boxShadow: '0 12px 40px rgba(0,0,0,0.6)' }}>
            
            {/* Header */}
            <div style={{ padding: '18px 20px', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Trophy size={20} color="#FFD700" />
              <span style={{ color: '#fff', fontWeight: '900', fontSize: '16px', letterSpacing: '0.5px' }}>Arena de Campeões</span>
              <span style={{ marginLeft: 'auto', background: 'rgba(255,215,0,0.12)', color: '#FFD700', padding: '4px 10px', borderRadius: '20px', fontSize: '10px', fontWeight: 'bold', border: '1px solid rgba(255,215,0,0.2)' }}>TOP 5</span>
            </div>

            {/* Podium Destaque dos 3 Primeiros */}
            <div style={{ 
              display: 'flex', 
              justifyContent: 'center', 
              alignItems: 'flex-end', 
              gap: '12px', 
              padding: '24px 16px 16px', 
              background: 'linear-gradient(to bottom, rgba(0,0,0,0.3), rgba(0,0,0,0.1))',
              borderBottom: '1px solid rgba(255,255,255,0.03)' 
            }}>
              
              {/* 2º Lugar */}
              {ranking[1] && (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1, maxWidth: '90px' }}>
                  <div style={{ position: 'relative', width: '52px', height: '52px', borderRadius: '50%', border: '2px solid #C0C0C0', overflow: 'hidden', background: '#222', boxShadow: '0 4px 15px rgba(192,192,192,0.25)' }}>
                    {ranking[1].avatar_url ? (
                      <img src={ranking[1].avatar_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#C0C0C0', fontWeight: 'bold', fontSize: '15px' }}>
                        {ranking[1].nome.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div style={{ position: 'absolute', bottom: -1, right: -1, background: '#C0C0C0', color: '#000', borderRadius: '50%', width: '16px', height: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', fontWeight: '900' }}>2</div>
                  </div>
                  <span style={{ color: '#eee', fontSize: '11px', fontWeight: 'bold', marginTop: '6px', textAlign: 'center', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', width: '100%' }}>{ranking[1].nome.split(' ')[0]}</span>
                  <span style={{ color: '#C0C0C0', fontSize: '10px', fontWeight: '900', display: 'flex', alignItems: 'center', gap: '2px' }}><Star size={8} fill="#C0C0C0" color="#C0C0C0" /> {ranking[1].pontos}</span>
                  <div style={{ width: '100%', height: '40px', background: 'linear-gradient(to top, rgba(192,192,192,0.02), rgba(192,192,192,0.15))', borderTop: '2px solid #C0C0C0', borderRadius: '8px 8px 0 0', marginTop: '6px' }}></div>
                </div>
              )}

              {/* 1º Lugar */}
              {ranking[0] && (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1, maxWidth: '105px', transform: 'translateY(-12px)' }}>
                  <div style={{ position: 'relative', width: '64px', height: '64px', borderRadius: '50%', border: '3px solid #FFD700', boxShadow: '0 0 20px rgba(255,215,0,0.45)', overflow: 'hidden', background: '#222' }}>
                    {ranking[0].avatar_url ? (
                      <img src={ranking[0].avatar_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#FFD700', fontWeight: 'bold', fontSize: '18px' }}>
                        {ranking[0].nome.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div style={{ position: 'absolute', bottom: -1, right: -1, background: '#FFD700', color: '#000', borderRadius: '50%', width: '20px', height: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: '900' }}>1</div>
                  </div>
                  <Trophy size={14} color="#FFD700" style={{ marginTop: '2px' }} />
                  <span style={{ color: '#fff', fontSize: '12px', fontWeight: '900', marginTop: '1px', textAlign: 'center', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', width: '100%' }}>{ranking[0].nome.split(' ')[0]}</span>
                  <span style={{ color: '#FFD700', fontSize: '11px', fontWeight: '900', display: 'flex', alignItems: 'center', gap: '2px' }}><Star size={9} fill="#FFD700" color="#FFD700" /> {ranking[0].pontos}</span>
                  <div style={{ width: '100%', height: '55px', background: 'linear-gradient(to top, rgba(255,215,0,0.03), rgba(255,215,0,0.22))', borderTop: '3px solid #FFD700', borderRadius: '10px 10px 0 0', marginTop: '6px' }}></div>
                </div>
              )}

              {/* 3º Lugar */}
              {ranking[2] && (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1, maxWidth: '90px' }}>
                  <div style={{ position: 'relative', width: '48px', height: '48px', borderRadius: '50%', border: '2px solid #CD7F32', overflow: 'hidden', background: '#222', boxShadow: '0 4px 15px rgba(205,127,50,0.25)' }}>
                    {ranking[2].avatar_url ? (
                      <img src={ranking[2].avatar_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#CD7F32', fontWeight: 'bold', fontSize: '14px' }}>
                        {ranking[2].nome.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div style={{ position: 'absolute', bottom: -1, right: -1, background: '#CD7F32', color: '#000', borderRadius: '50%', width: '14px', height: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '9px', fontWeight: '900' }}>3</div>
                  </div>
                  <span style={{ color: '#eee', fontSize: '11px', fontWeight: 'bold', marginTop: '6px', textAlign: 'center', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', width: '100%' }}>{ranking[2].nome.split(' ')[0]}</span>
                  <span style={{ color: '#CD7F32', fontSize: '10px', fontWeight: '900', display: 'flex', alignItems: 'center', gap: '2px' }}><Star size={8} fill="#CD7F32" color="#CD7F32" /> {ranking[2].pontos}</span>
                  <div style={{ width: '100%', height: '30px', background: 'linear-gradient(to top, rgba(205,127,50,0.02), rgba(205,127,50,0.15))', borderTop: '2px solid #CD7F32', borderRadius: '8px 8px 0 0', marginTop: '6px' }}></div>
                </div>
              )}

            </div>

            {/* Lista dos demais competidores (Posições 4 e 5) */}
            <div style={{ padding: '4px 0' }}>
              {ranking.slice(3, 5).map((r, idx) => {
                const globalIdx = idx + 3
                const isMe = r.celular === user?.celular
                return (
                  <div key={globalIdx} style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '12px', 
                    padding: '12px 20px',
                    background: isMe ? 'rgba(255,215,0,0.05)' : 'transparent',
                    borderLeft: isMe ? '3px solid #FFD700' : '3px solid transparent'
                  }}>
                    <span style={{ color: '#666', fontWeight: 'bold', width: '20px', textAlign: 'center', fontSize: '13px' }}>{globalIdx + 1}º</span>
                    <div style={{ width: '38px', height: '38px', borderRadius: '10px', overflow: 'hidden', background: '#222', border: isMe ? '2px solid #FFD700' : '1px solid #333' }}>
                      {r.avatar_url ? (
                        <img src={r.avatar_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      ) : (
                        <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#888', fontWeight: 'bold', fontSize: '13px' }}>
                          {r.nome?.charAt(0).toUpperCase()}
                        </div>
                      )}
                    </div>
                    <div style={{ flex: 1 }}>
                      <span style={{ color: isMe ? '#FFD700' : '#fff', fontWeight: 'bold', fontSize: '13px' }}>{r.nome} {isMe && '(Você)'}</span>
                      <div style={{ color: '#555', fontSize: '10px' }}>{r.nivel || 'Iniciante'}</div>
                    </div>
                    <div style={{ textAlign: 'right', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <span style={{ color: '#fff', fontWeight: '900', fontSize: '13px' }}>{r.pontos}</span>
                      <Star size={11} color="#FFD700" fill="#FFD700" />
                    </div>
                  </div>
                )
              })}
            </div>
            
          </div>
        )}

        {/* Galeria de Evolução */}
        <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '20px', overflow: 'hidden' }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ color: '#fff', fontWeight: 'bold', fontSize: '15px' }}>Galeria de Evolução</span>
            <button
              onClick={() => setShowAddFoto(true)}
              style={{ background: 'rgba(255,215,0,0.15)', border: '1px solid rgba(255,215,0,0.3)', borderRadius: '20px', padding: '6px 14px', color: '#FFD700', fontWeight: 'bold', fontSize: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <Camera size={14} /> Nova Foto
            </button>
          </div>
          <div style={{ padding: '16px 20px' }}>
            {fotos.length === 0 ? (
              <div
                onClick={() => setShowAddFoto(true)}
                style={{ border: '2px dashed rgba(255,255,255,0.1)', borderRadius: '16px', padding: '36px 20px', textAlign: 'center', cursor: 'pointer' }}
              >
                <Camera size={32} color="#444" style={{ margin: '0 auto 12px', display: 'block' }} />
                <p style={{ color: '#555', fontSize: '14px', margin: 0 }}>Adicione sua primeira foto de evolução</p>
                <p style={{ color: '#444', fontSize: '12px', marginTop: '6px' }}>Registre seu progresso com fotos e datas</p>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
                {fotos.map((foto, idx) => (
                  <div key={idx} style={{ position: 'relative', borderRadius: '14px', overflow: 'hidden', background: '#111' }}>
                    <img src={foto.url} alt="" style={{ width: '100%', height: '140px', objectFit: 'cover', display: 'block' }} />
                    <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.85), transparent)', padding: '20px 10px 8px' }}>
                      <div style={{ color: '#fff', fontSize: '11px', fontWeight: 'bold' }}>{foto.data}</div>
                      {foto.descricao && <div style={{ color: '#ccc', fontSize: '10px', marginTop: '2px' }}>{foto.descricao}</div>}
                    </div>
                    <button
                      onClick={() => excluirFoto(idx)}
                      style={{ position: 'absolute', top: '6px', right: '6px', background: 'rgba(0,0,0,0.7)', border: 'none', borderRadius: '50%', width: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                    >
                      <Trash2 size={13} color="#e53935" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

      </div>

      {/* Modal: Atualizar Peso */}
      {showAddPeso && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 999, padding: '20px' }} onClick={() => setShowAddPeso(false)}>
          <div onClick={e => e.stopPropagation()} style={{ width: '100%', maxWidth: '440px', background: '#161616', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '28px', padding: '28px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ color: '#fff', margin: 0, fontSize: '18px', fontWeight: 'bold' }}>Atualizar Peso</h3>
              <button onClick={() => setShowAddPeso(false)} style={{ background: 'transparent', border: 'none', cursor: 'pointer' }}><X size={20} color="#666" /></button>
            </div>
            <input
              type="number" step="0.1" value={novoPeso} onChange={e => setNovoPeso(e.target.value)}
              placeholder="Ex: 85.5"
              autoFocus
              style={{ width: '100%', height: '56px', background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,215,0,0.4)', borderRadius: '14px', color: '#fff', fontSize: '24px', fontWeight: 'bold', textAlign: 'center', boxSizing: 'border-box', outline: 'none', marginBottom: '16px' }}
            />
            <button
              onClick={adicionarPeso}
              disabled={!novoPeso}
              style={{ width: '100%', height: '50px', background: novoPeso ? 'linear-gradient(135deg, #FFD700, #FFA500)' : 'rgba(255,215,0,0.2)', border: 'none', borderRadius: '14px', color: '#000', fontWeight: 'bold', fontSize: '16px', cursor: novoPeso ? 'pointer' : 'default' }}
            >
              Salvar Peso
            </button>
          </div>
        </div>
      )}

      {/* Modal: Nova Foto */}
      {showAddFoto && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 999, padding: '20px' }} onClick={() => { setShowAddFoto(false); setFotoPreview(null); setDescFoto('') }}>
          <div onClick={e => e.stopPropagation()} style={{ width: '100%', maxWidth: '440px', background: '#161616', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '28px', padding: '28px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ color: '#fff', margin: 0, fontSize: '18px', fontWeight: 'bold' }}>Nova Foto de Evolução</h3>
              <button onClick={() => { setShowAddFoto(false); setFotoPreview(null) }} style={{ background: 'transparent', border: 'none', cursor: 'pointer' }}><X size={20} color="#666" /></button>
            </div>

            {fotoPreview ? (
              <img src={fotoPreview} alt="" style={{ width: '100%', height: '180px', objectFit: 'cover', borderRadius: '16px', marginBottom: '14px' }} />
            ) : (
              <div
                onClick={() => fileRef.current.click()}
                style={{ border: '2px dashed rgba(255,255,255,0.15)', borderRadius: '16px', height: '140px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', marginBottom: '14px' }}
              >
                <Camera size={28} color="#555" />
                <p style={{ color: '#555', fontSize: '13px', marginTop: '10px' }}>Toque para selecionar foto</p>
              </div>
            )}
            <input type="file" accept="image/*" ref={fileRef} style={{ display: 'none' }} onChange={selecionarFoto} />

            {fotoPreview && (
              <button onClick={() => fileRef.current.click()} style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', color: '#aaa', padding: '8px 14px', fontSize: '12px', cursor: 'pointer', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Camera size={13} /> Trocar foto
              </button>
            )}

            <input
              type="text" value={descFoto} onChange={e => setDescFoto(e.target.value)}
              placeholder="Descrição (ex: 3 meses de treino)"
              style={{ width: '100%', height: '46px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: '#fff', fontSize: '14px', padding: '0 14px', boxSizing: 'border-box', outline: 'none', marginBottom: '16px' }}
            />
            <button
              onClick={salvarFoto}
              disabled={!fotoPreview}
              style={{ width: '100%', height: '50px', background: fotoPreview ? 'linear-gradient(135deg, #FFD700, #FFA500)' : 'rgba(255,215,0,0.2)', border: 'none', borderRadius: '14px', color: '#000', fontWeight: 'bold', fontSize: '16px', cursor: fotoPreview ? 'pointer' : 'default' }}
            >
              Salvar Foto
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
