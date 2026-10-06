import { useState, useEffect } from 'react'
import { Play, ChevronRight, Droplet, Flame, Activity, ArrowRight, Zap, Plus, Check, Download, Trophy, Star, Newspaper, ChevronLeft, Dumbbell, Salad, TrendingUp, Sparkles, ShoppingBag, Tag, ExternalLink, X } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import db from '../db/database'
import { adaptarTreinos, calcularTreinoHoje, getBrasiliaISODate, getBrasiliaWeekDay, getBrasiliaLast7Days, toBrasiliaISODate } from '../lib/treinoUtils'
import { saveWaterLog, loadTodayWater, saveActivityLog, loadTodayActivities, loadLogsRange } from '../lib/syncHelpers'
import { Headphones } from 'lucide-react'
import { supabase } from '../lib/supabase'

const ML_POR_GARRAFA = 500

// ── Sistema de XP e Níveis ──
const NIVEIS = [
  { nome: 'Iniciante',        xpMin: 0,    emoji: '🌱', cor: '#9E9E9E' },
  { nome: 'Comprometido',     xpMin: 100,  emoji: '💪', cor: '#42A5F5' },
  { nome: 'Focado',           xpMin: 300,  emoji: '🔥', cor: '#FFA726' },
  { nome: 'Disciplinado',     xpMin: 600,  emoji: '⚡', cor: '#AB47BC' },
  { nome: 'Atleta',           xpMin: 1000, emoji: '🏆', cor: '#FFD700' },
  { nome: 'Monstro da Bronks',xpMin: 2000, emoji: '👑', cor: '#FF5722' },
]

function calcularXP(historico) {
  let xp = 0
  // +20 XP por treino concluído
  xp += (historico.workouts?.filter(w => w.completado)?.length || 0) * 20
  // +5 XP por dia que bateu a meta de água
  xp += (historico.water?.filter(w => w.garrafas >= 4)?.length || 0) * 5
  // +10 XP por atividade complementar feita
  xp += (historico.activities?.filter(a => a.completada)?.length || 0) * 10
  return xp
}

function getNivel(xp) {
  let nivel = NIVEIS[0]
  for (const n of NIVEIS) {
    if (xp >= n.xpMin) nivel = n
  }
  return nivel
}

function getProximoNivel(xp) {
  for (const n of NIVEIS) {
    if (xp < n.xpMin) return n
  }
  return null // já é o máximo
}

// ── Notícias / Dicas de Fitness ──
const NOTICIAS = [
  { titulo: 'Sono é anabolizante natural', resumo: 'Dormir 7-9h por noite pode aumentar em até 30% a produção de hormônio do crescimento, essencial para ganho muscular.', emoji: '😴', cor: '#7E57C2' },
  { titulo: 'Proteína: o timing importa', resumo: 'Consumir proteína dentro de 2h após o treino maximiza a síntese proteica e acelera a recuperação muscular.', emoji: '🥩', cor: '#EF5350' },
  { titulo: 'Água e performance', resumo: 'Uma desidratação de apenas 2% do peso corporal pode reduzir sua performance no treino em até 25%.', emoji: '💧', cor: '#42A5F5' },
  { titulo: 'Creatina: o suplemento #1', resumo: 'A creatina é o suplemento mais estudado do mundo. 3-5g por dia aumentam força, potência e volume muscular.', emoji: '💊', cor: '#66BB6A' },
  { titulo: 'Treino de manhã queima mais', resumo: 'Treinar em jejum ou logo cedo pode aumentar a oxidação de gordura em até 20% comparado ao treino noturno.', emoji: '🌅', cor: '#FFA726' },
  { titulo: 'Descanso é progresso', resumo: 'Músculos não crescem durante o treino — crescem no descanso. Respeite os dias de recovery.', emoji: '🧘', cor: '#26C6DA' },
  { titulo: 'Carboidratos são aliados', resumo: 'Carboidratos repõem o glicogênio muscular e são essenciais para treinos intensos. Não os elimine!', emoji: '🍚', cor: '#FFCA28' },
  { titulo: 'Consistência > Intensidade', resumo: 'Treinar 4x por semana durante 1 ano gera mais resultados do que treinar 7x por semana durante 2 meses.', emoji: '📅', cor: '#FF7043' },
  { titulo: 'Alongamento pós-treino', resumo: 'Alongar após o treino melhora a flexibilidade, reduz dores musculares e acelera a recuperação.', emoji: '🤸', cor: '#EC407A' },
  { titulo: 'Cafeína turbina o treino', resumo: '200-400mg de cafeína 30min antes do treino melhora foco, resistência e força. Equivale a 2 xícaras de café.', emoji: '☕', cor: '#8D6E63' },
]

export default function Dashboard() {
  const [user, setUser] = useState(null)
  const [garrafasAtivas, setGarrafasAtivas] = useState(0)
  const [bgCustom, setBgCustom] = useState(null)
  const [horaAtual, setHoraAtual] = useState(new Date())
  const [refeicaoLembrete, setRefeicaoLembrete] = useState(null)
  const [showInstallGuide, setShowInstallGuide] = useState(() => {
    if (window.matchMedia && window.matchMedia('(display-mode: standalone)').matches) return false
    return localStorage.getItem('bronks_hide_install') !== 'true'
  })
  const [atividadesHoje, setAtividadesHoje] = useState([])
  const [treinoHoje, setTreinoHoje] = useState({ key: 'A', titulo: 'Carregando...' })
  const [historico, setHistorico] = useState({ water: [], workouts: [], activities: [] })
  const [historicoTotal, setHistoricoTotal] = useState({ water: [], workouts: [], activities: [] })
  const [showCycleReset, setShowCycleReset] = useState(false)
  const [noticiaIdx, setNoticiaIdx] = useState(() => Math.floor(Math.random() * NOTICIAS.length))
  const [promoPopup, setPromoPopup] = useState(null)
  const [affiliateProducts, setAffiliateProducts] = useState([])
  const navigate = useNavigate()

  // Load affiliate products
  useEffect(() => {
    supabase.from('admin_affiliate_products').select('*').eq('ativo', true).order('ordem').then(({ data }) => {
      setAffiliateProducts(data || [])
    }).catch(() => {})
  }, [])

  useEffect(() => {
    const loadData = () => {
      db.users.toArray().then(async users => {
        if (users.length > 0) {
          const u = users[0]
          setUser(u)
          if (u.hero_bg) setBgCustom(u.hero_bg)

          // Carrega histórico para o gráfico (7 dias) e total (365 dias para XP)
          if (u.celular) {
            loadLogsRange(u.celular, 7).then(async (res) => {
              const localLogs = await db.workouts.toArray()
              const mergedWorkouts = [...res.workouts]
              localLogs.forEach(l => {
                if (l.completado) {
                  const idx = mergedWorkouts.findIndex(mw => toBrasiliaISODate(mw.data) === toBrasiliaISODate(l.data))
                  if (idx >= 0) {
                    mergedWorkouts[idx].completado = true
                  } else {
                    mergedWorkouts.push({ ...l, data: toBrasiliaISODate(l.data) })
                  }
                }
              })
              setHistorico({ ...res, workouts: mergedWorkouts })
            })
            
            loadLogsRange(u.celular, 365).then(async (res) => {
              const localLogs = await db.workouts.toArray()
              const mergedWorkouts = [...res.workouts]
              localLogs.forEach(l => {
                if (l.completado) {
                  const idx = mergedWorkouts.findIndex(mw => toBrasiliaISODate(mw.data) === toBrasiliaISODate(l.data))
                  if (idx >= 0) {
                    mergedWorkouts[idx].completado = true
                  } else {
                    mergedWorkouts.push({ ...l, data: toBrasiliaISODate(l.data) })
                  }
                }
              })
              setHistoricoTotal({ ...res, workouts: mergedWorkouts })
            })
          }
          // Checa ciclo de 25 dias
          if (u.ultimo_reset_plano) {
            const dias = (Date.now() - new Date(u.ultimo_reset_plano).getTime()) / (1000 * 60 * 60 * 24)
            if (dias >= 25) setShowCycleReset(true)
          } else if (u.peso) {
            // Se não tem data, inicializa com hoje para começar a contar
            const hoje = new Date().toISOString()
            await db.users.update(u.id, { ultimo_reset_plano: hoje })
            if (u.celular) {
               const { supabase } = await import('../lib/supabase')
               await supabase.from('profiles').update({ ultimo_reset_plano: hoje }).eq('celular', u.celular)
            }
          }

          // Carrega treino do dia com base no perfil real
          const treinos = adaptarTreinos(u)
          const keys = Object.keys(treinos)
          let logs = await db.workouts.toArray()
          
          // Se não tem log de hoje localmente, checa na nuvem (cross-device)
          const hojeStr = getBrasiliaISODate()
          const temHojeLocal = logs.some(l => l.completado && toBrasiliaISODate(l.data) === hojeStr)
          if (!temHojeLocal && u.celular) {
            try {
              const { data: cloudLog } = await supabase
                .from('workout_logs')
                .select('tipo, completado')
                .eq('celular', u.celular)
                .eq('data', hojeStr)
                .maybeSingle()
              if (cloudLog && cloudLog.completado) {
                await db.workouts.add({ data: hojeStr + 'T12:00:00Z', tipo: cloudLog.tipo, completado: true })
                logs = await db.workouts.toArray()
              }
            } catch(e) {}
          }
          
          // Verifica se há estado salvo localmente hoje (Brasília)
          const savedStateStr = localStorage.getItem('bronks_workout_state')
          let treinoKey = calcularTreinoHoje(logs, keys)
          if (savedStateStr) {
            try {
              const s = JSON.parse(savedStateStr)
              if (s.date === hojeStr) treinoKey = s.treinoHojeKey
            } catch(e) {}
          }
          
          const isCompletado = logs.some(l => l.completado && toBrasiliaISODate(l.data) === hojeStr)
          setTreinoHoje({ key: treinoKey, titulo: treinos[treinoKey]?.titulo || '', completado: isCompletado })

          // Carrega água do dia
          if (u.celular) {
            const cloudWater = await loadTodayWater(u.celular)
            if (cloudWater) {
              setGarrafasAtivas(cloudWater.garrafas)
            } else {
              const saved = localStorage.getItem('hydration_' + new Date().toDateString())
              if (saved) setGarrafasAtivas(Number(saved))
            }
          } else {
            const saved = localStorage.getItem('hydration_' + new Date().toDateString())
            if (saved) setGarrafasAtivas(Number(saved))
          }

          // Carrega atividades do dia (fuso Brasília)
          if (u.atividades_extras && Object.keys(u.atividades_extras).length > 0) {
            const diaSemana = getBrasiliaWeekDay()
            const atividadesDoDia = Object.entries(u.atividades_extras)
              .filter(([, dias]) => dias.includes(diaSemana))
              .map(([nome]) => nome)

            if (atividadesDoDia.length > 0 && u.celular) {
              const logsCloud = await loadTodayActivities(u.celular)
              const mapa = {}
              logsCloud.forEach(l => { mapa[l.atividade] = l.completada })
              const hoje = new Date().toDateString()
              const localKey = 'bronks_activities_' + hoje
              const localSaved = JSON.parse(localStorage.getItem(localKey) || '{}')
              setAtividadesHoje(atividadesDoDia.map(nome => ({
                nome,
                completada: mapa[nome] ?? localSaved[nome] ?? false
              })))
            } else {
              setAtividadesHoje([])
            }
          } else {
            setAtividadesHoje([])
          }
          // Carrega popups promocionais ativos
          try {
            const { supabase: sb } = await import('../lib/supabase')
            const { data: popups } = await sb.from('admin_popups').select('*').eq('ativo', true).order('ordem')
            if (popups && popups.length > 0) {
              const hoje = new Date().toDateString()
              const visto = JSON.parse(localStorage.getItem('bronks_popups_seen') || '{}')
              const naoVisto = popups.find(p => visto[p.id] !== hoje)
              if (naoVisto) {
                setTimeout(() => {
                  setPromoPopup(naoVisto)
                }, 3000)
              }
            }
          } catch(e) {}
        }
      })
    }

    loadData()
    window.addEventListener('profileSynced', loadData)


    const hoje = new Date().toDateString()
    const timerInterval = setInterval(() => {
      const now = new Date()
      setHoraAtual(now)
      const h = now.getHours(), m = now.getMinutes()
      const lastReminder = localStorage.getItem('last_meal_reminder')
      let meal = null
      if (h === 8 && m >= 0 && m <= 5) meal = 'Café da Manhã'
      else if (h === 12 && m >= 30 && m <= 35) meal = 'Almoço'
      else if (h === 16 && m >= 0 && m <= 5) meal = 'Lanche da Tarde'
      else if (h === 20 && m >= 0 && m <= 5) meal = 'Jantar'
      if (meal && lastReminder !== `${hoje}_${meal}`) {
        setRefeicaoLembrete(meal)
        localStorage.setItem('last_meal_reminder', `${hoje}_${meal}`)
      }
    }, 1000)
    return () => {
      clearInterval(timerInterval)
      window.removeEventListener('profileSynced', loadData)
    }
  }, [])

  const toggleGarrafa = async (idx) => {
    const novaAtiva = garrafasAtivas === idx + 1 ? idx : idx + 1
    setGarrafasAtivas(novaAtiva)
    const hoje = new Date().toDateString()
    localStorage.setItem('hydration_' + hoje, novaAtiva)
    if (user?.celular) {
      await saveWaterLog(user.celular, novaAtiva, ML_POR_GARRAFA)
    }
  }

  const toggleAtividade = async (nome) => {
    const atualizado = atividadesHoje.map(a =>
      a.nome === nome ? { ...a, completada: !a.completada } : a
    )
    setAtividadesHoje(atualizado)
    const completada = atualizado.find(a => a.nome === nome).completada
    // Salva local
    const hoje = new Date().toDateString()
    const localKey = 'bronks_activities_' + hoje
    const local = JSON.parse(localStorage.getItem(localKey) || '{}')
    local[nome] = completada
    localStorage.setItem(localKey, JSON.stringify(local))
    // Salva cloud
    if (user?.celular) await saveActivityLog(user.celular, nome, completada)
  }

  const handleHeroBg = (e) => {
    const file = e.target.files[0]
    if (!file) return
    const reader = new FileReader()
    reader.onloadend = async () => {
      setBgCustom(reader.result)
      const users = await db.users.toArray()
      if (users.length > 0) {
        await db.users.update(users[0].id, { hero_bg: reader.result })
        if (users[0].celular) {
          try {
            const { supabase } = await import('../lib/supabase')
            await supabase.from('profiles').update({ hero_bg: reader.result }).eq('celular', users[0].celular)
          } catch (e) { console.warn('Supabase offline', e) }
        }
      }
    }
    reader.readAsDataURL(file)
  }

  if (!user) return <div className="p16"><div className="spinner"></div></div>

  const peso = Number(user.peso) || 70
  const obj = user.objetivo || ''
  const emEmagrecimento = obj.toLowerCase().includes('emagre') || obj.toLowerCase().includes('secar')
  const emHipertrofia = obj.toLowerCase().includes('massa') || obj.toLowerCase().includes('hipertrofia')
  
  let fatorKcal = 30
  if (emEmagrecimento) fatorKcal = 24
  if (emHipertrofia) fatorKcal = 36
  
  const kcal = Math.round(peso * fatorKcal)
  const litros = ((peso * 35) / 1000).toFixed(1)
  const totalGarrafas = Math.ceil(peso * 35 / ML_POR_GARRAFA)
  const mlConsumido = garrafasAtivas * ML_POR_GARRAFA

  const heroStyle = bgCustom
    ? { background: `linear-gradient(160deg, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0.7) 100%), url(${bgCustom}) center/cover no-repeat` }
    : { background: 'linear-gradient(160deg, rgba(10,10,30,0.98) 0%, rgba(5,30,60,0.98) 60%, rgba(0,20,50,0.98) 100%)' }

  return (
    <div style={{ paddingBottom: '100px', overflowX: 'hidden' }}>

      {/* Header */}
      <div style={{ padding: '32px 20px 24px' }}>
        <div className="flex justify-between items-start mb24">
          <div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', marginBottom: '12px' }}>
              <span style={{ color: 'var(--yellow)', fontSize: '13px', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '1px' }}>
                {horaAtual.toLocaleDateString('pt-BR', { weekday: 'long' })}, {horaAtual.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })}
              </span>
              <h1 style={{ color: '#fff', fontSize: '42px', fontWeight: '900', margin: 0, lineHeight: 1, letterSpacing: '-1px' }}>
                {horaAtual.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
              </h1>
            </div>
            <p style={{ color: 'var(--gray)', fontSize: '15px', margin: 0 }}>Fala, <span style={{ color: '#fff', fontWeight: 'bold' }}>{user.nome?.split(' ')[0]}</span>! 🔥</p>
          </div>
          <div className="flex items-center gap12">
            <div 
              onClick={() => window.dispatchEvent(new Event('openRadio'))}
              style={{ width: '42px', height: '42px', borderRadius: '14px', background: 'rgba(255,215,0,0.1)', border: '1px solid rgba(255,215,0,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
            >
              <Headphones size={20} color="var(--yellow)" />
            </div>
            <div onClick={() => navigate('/perfil')} style={{ width: '54px', height: '54px', borderRadius: '18px', background: 'var(--card2)', border: '2px solid var(--yellow)', boxShadow: '0 0 20px rgba(255,215,0,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', cursor: 'pointer', flexShrink: 0 }}>
              {user.avatar_url
                ? <img src={user.avatar_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                : <span style={{ color: 'var(--yellow)', fontWeight: 'bold', fontSize: '24px' }}>{user.nome?.charAt(0).toUpperCase()}</span>
              }
            </div>
          </div>
        </div>

        <div className="flex gap8">
          {[
            { icon: <Flame size={16} color="#FF7043" />, val: kcal, label: 'Kcal/dia' },
            { icon: <Activity size={16} color="#66BB6A" />, val: `${user.dias_treino || 3}x`, label: 'Treinos/sem' },
            { icon: <Droplet size={16} color="#42A5F5" />, val: `${litros}L`, label: 'Meta água' },
          ].map(s => (
            <div key={s.label} style={{ flex: 1, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '16px', padding: '14px 8px', textAlign: 'center' }}>
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '6px' }}>{s.icon}</div>
              <div style={{ color: '#fff', fontWeight: 'bold', fontSize: '16px', lineHeight: 1 }}>{s.val}</div>
              <div style={{ color: 'var(--gray)', fontSize: '10px', marginTop: '4px' }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Hidratação */}
      <div style={{ padding: '0 20px', marginBottom: '24px' }}>
        <div className="flex justify-between items-center mb14">
          <h2 style={{ color: '#fff', fontSize: '18px', fontWeight: 'bold' }}>Hidratação</h2>
          <span style={{ color: mlConsumido >= litros * 1000 ? 'var(--green)' : 'var(--blue)', fontSize: '13px', fontWeight: 'bold' }}>{mlConsumido}ml / {litros * 1000}ml</span>
        </div>
        <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '20px', padding: '20px' }}>
          <div style={{ background: 'rgba(255,255,255,0.07)', borderRadius: '8px', height: '5px', marginBottom: '20px', overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${Math.min(100, (garrafasAtivas / totalGarrafas) * 100)}%`, background: 'linear-gradient(to right, #42A5F5, #1E88E5)', borderRadius: '8px', transition: 'width 0.4s ease' }}></div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', flexWrap: 'wrap' }}>
            {Array.from({ length: totalGarrafas }).map((_, idx) => {
              const ativa = idx < garrafasAtivas
              return (
                <div key={idx} onClick={() => toggleGarrafa(idx)} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
                  <div style={{ width: '36px', height: '56px', position: 'relative', filter: ativa ? 'drop-shadow(0 0 8px rgba(66,165,245,0.8))' : 'none', transition: 'filter 0.3s, transform 0.15s', transform: ativa ? 'scale(1.08)' : 'scale(1)' }}>
                    <svg viewBox="0 0 36 56" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: '100%', height: '100%' }}>
                      <rect x="11" y="0" width="14" height="7" rx="2" fill={ativa ? '#42A5F5' : 'rgba(255,255,255,0.2)'} />
                      <rect x="4" y="8" width="28" height="44" rx="8" fill={ativa ? 'rgba(66,165,245,0.25)' : 'rgba(255,255,255,0.05)'} stroke={ativa ? '#42A5F5' : 'rgba(255,255,255,0.2)'} strokeWidth="1.5" />
                      {ativa && <rect x="5.5" y="22" width="25" height="28" rx="6" fill="rgba(66,165,245,0.5)" />}
                      <rect x="9" y="14" width="4" height="20" rx="2" fill={ativa ? 'rgba(255,255,255,0.3)' : 'rgba(255,255,255,0.08)'} />
                    </svg>
                  </div>
                  <span style={{ fontSize: '10px', fontWeight: 'bold', color: ativa ? '#42A5F5' : 'var(--gray)' }}>{ML_POR_GARRAFA}ml</span>
                </div>
              )
            })}
          </div>
          <p style={{ color: 'var(--gray)', fontSize: '11px', textAlign: 'center', marginTop: '14px' }}>
            {garrafasAtivas === 0 ? 'Toque nas garrafinhas conforme for bebendo 💧' :
             garrafasAtivas >= totalGarrafas ? '🎉 Meta de hidratação atingida!' :
             `${totalGarrafas - garrafasAtivas} garrafa${totalGarrafas - garrafasAtivas > 1 ? 's' : ''} restante${totalGarrafas - garrafasAtivas > 1 ? 's' : ''} para a meta`}
          </p>
        </div>
      </div>

      {/* Sistema de XP e Nível */}
      {(() => {
        const xp = calcularXP(historicoTotal)
        const nivel = getNivel(xp)
        const proximo = getProximoNivel(xp)
        const progXP = proximo ? ((xp - nivel.xpMin) / (proximo.xpMin - nivel.xpMin)) * 100 : 100
        return (
          <div style={{ padding: '0 20px', marginBottom: '24px' }}>
            <div style={{ background: `linear-gradient(135deg, ${nivel.cor}15, ${nivel.cor}08)`, border: `1px solid ${nivel.cor}40`, borderRadius: '24px', padding: '20px', position: 'relative', overflow: 'hidden' }}>
              {/* Brilho decorativo */}
              <div style={{ position: 'absolute', top: '-30px', right: '-20px', width: '100px', height: '100px', borderRadius: '50%', background: `${nivel.cor}15`, filter: 'blur(30px)' }} />
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', position: 'relative' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ width: '48px', height: '48px', borderRadius: '16px', background: `${nivel.cor}20`, border: `2px solid ${nivel.cor}50`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px' }}>
                    {nivel.emoji}
                  </div>
                  <div>
                    <div style={{ color: nivel.cor, fontSize: '11px', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '1px' }}>Nível Atual</div>
                    <div style={{ color: '#fff', fontSize: '18px', fontWeight: '900' }}>{nivel.nome}</div>
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ color: '#FFD700', fontSize: '22px', fontWeight: '900' }}>{xp}</div>
                  <div style={{ color: '#888', fontSize: '10px', fontWeight: '700' }}>XP TOTAL</div>
                </div>
              </div>
              {/* Barra de progresso XP */}
              <div style={{ background: 'rgba(255,255,255,0.08)', borderRadius: '8px', height: '8px', overflow: 'hidden', marginBottom: '8px' }}>
                <div style={{
                  height: '100%', width: `${progXP}%`,
                  background: `linear-gradient(90deg, ${nivel.cor}, ${proximo?.cor || nivel.cor})`,
                  borderRadius: '8px', transition: 'width 1.5s cubic-bezier(0.22, 1, 0.36, 1)',
                  boxShadow: `0 0 12px ${nivel.cor}60`
                }} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: '#666', fontSize: '10px', fontWeight: '700' }}>{nivel.emoji} {nivel.nome}</span>
                {proximo
                  ? <span style={{ color: '#666', fontSize: '10px', fontWeight: '700' }}>{proximo.emoji} {proximo.nome} ({proximo.xpMin} XP)</span>
                  : <span style={{ color: '#FFD700', fontSize: '10px', fontWeight: '700' }}>🏅 Nível Máximo!</span>
                }
              </div>
              {/* Como ganhar XP */}
              <div style={{ display: 'flex', gap: '8px', marginTop: '14px', flexWrap: 'wrap' }}>
                {[
                  { emoji: '🏋️', label: 'Treino', xp: '+20 XP' },
                  { emoji: '🏃', label: 'Atividade', xp: '+10 XP' },
                  { emoji: '💧', label: 'Água', xp: '+5 XP' },
                ].map(item => (
                  <div key={item.label} style={{ flex: 1, background: 'rgba(255,255,255,0.04)', borderRadius: '10px', padding: '8px 6px', textAlign: 'center', minWidth: '70px' }}>
                    <div style={{ fontSize: '16px' }}>{item.emoji}</div>
                    <div style={{ color: '#888', fontSize: '9px', fontWeight: '700', marginTop: '2px' }}>{item.label}</div>
                    <div style={{ color: '#FFD700', fontSize: '11px', fontWeight: '900' }}>{item.xp}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )
      })()}

      {/* Gráfico de Atividade */}
      <div style={{ padding: '0 20px', marginBottom: '24px' }}>
        <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '24px', padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <div>
              <h3 style={{ color: '#fff', fontSize: '18px', fontWeight: 'bold', margin: 0 }}>Atividade Semanal</h3>
              <p style={{ color: 'var(--gray)', fontSize: '11px', margin: '4px 0 0' }}>Consistência é a chave 🗝️</p>
            </div>
            <span style={{ color: 'var(--yellow)', fontSize: '11px', fontWeight: '900', background: 'rgba(255,215,0,0.1)', padding: '4px 10px', borderRadius: '20px' }}>7 DIAS</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', height: '140px', gap: '10px' }}>
            {getBrasiliaLast7Days().map((dateStr) => {
              const temTreino = historico.workouts.some(w => toBrasiliaISODate(w.data) === dateStr && w.completado)
              
              // Verifica atividades na nuvem e no localStorage
              const temAtividadesCloud = historico.activities.filter(a => toBrasiliaISODate(a.data) === dateStr && a.completada).length
              const dObj = new Date(dateStr + 'T12:00:00')
              const localKey = 'bronks_activities_' + dObj.toDateString()
              const localSaved = JSON.parse(localStorage.getItem(localKey) || '{}')
              const temAtividadesLocal = Object.values(localSaved).filter(v => v === true).length
              const temAtividades = Math.max(temAtividadesCloud, temAtividadesLocal)
              
              // Pct Treino (máximo 50%)
              let pctTreino = temTreino ? 40 : 0
              if (temTreino) pctTreino = Math.min(50, 40 + (temAtividades * 10))
              else if (temAtividades > 0) pctTreino = Math.min(50, temAtividades * 20)

              // Pct Água (máximo 25%)
              const garrafas = historico.water.find(w => toBrasiliaISODate(w.data) === dateStr)?.garrafas || 0
              const localGarrafas = Number(localStorage.getItem('hydration_' + dObj.toDateString()) || 0)
              const garrafasHoje = Math.max(garrafas, localGarrafas)
              const metaAgua = Math.ceil((Number(user?.peso)||70) * 35 / 500) || 4
              const pctWater = garrafasHoje > 0 ? Math.min(25, (garrafasHoje / metaAgua) * 25) : 0

              // Pct Dieta (máximo 25%)
              let pctDiet = 0
              try {
                const dietData = JSON.parse(localStorage.getItem('bronks_diet_' + dObj.toLocaleDateString()))
                if (dietData && dietData.refeicoes) {
                   const feitas = dietData.refeicoes.filter(r => r.feita).length
                   const total = dietData.refeicoes.length
                   if (total > 0) pctDiet = Math.min(25, (feitas / total) * 25)
                }
              } catch(e) {}
              
              const totalPct = pctTreino + pctWater + pctDiet
              const showEmpty = totalPct === 0
              const isToday = dateStr === toBrasiliaISODate()
              
              return (
                <div key={dateStr} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', height: '100%' }}>
                  <div style={{ 
                    flex: 1, width: '100%', position: 'relative', display: 'flex', alignItems: 'flex-end', justifyContent: 'center'
                  }}>
                    {/* Background track */}
                    <div style={{ position: 'absolute', width: '12px', height: '100%', background: 'rgba(255,255,255,0.03)', borderRadius: '10px' }} />
                    {/* Stacked bar container */}
                    <div style={{ 
                      width: '12px', 
                      height: '100%', 
                      position: 'absolute', bottom: 0,
                      display: 'flex', flexDirection: 'column', justifyContent: 'flex-end',
                      borderRadius: '10px', overflow: 'hidden',
                      zIndex: 2
                    }}>
                      {showEmpty && <div style={{ height: '5%', background: 'rgba(255,255,255,0.08)', width: '100%' }} />}
                      {pctTreino > 0 && <div style={{ height: `${pctTreino}%`, background: '#FFD700', width: '100%', transition: 'height 1s' }} title="Treino" />}
                      {pctWater > 0 && <div style={{ height: `${pctWater}%`, background: '#4FC3F7', width: '100%', transition: 'height 1s' }} title="Água" />}
                      {pctDiet > 0 && <div style={{ height: `${pctDiet}%`, background: '#4CAF50', width: '100%', transition: 'height 1s' }} title="Dieta" />}
                    </div>
                  </div>
                  <span style={{ 
                    color: toBrasiliaISODate(new Date()) === dateStr ? 'var(--yellow)' : 'var(--gray)', 
                    fontSize: '11px', 
                    fontWeight: '800',
                    textTransform: 'uppercase'
                  }}>
                    {new Date(dateStr + 'T12:00:00').toLocaleDateString('pt-BR', { weekday: 'short' }).split('.')[0]}
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {showInstallGuide && (
        <div style={{ padding: '0 20px', marginBottom: '24px' }}>
          <div style={{ background: 'linear-gradient(135deg, rgba(255,215,0,0.1), rgba(255,165,0,0.05))', border: '1px solid rgba(255,215,0,0.2)', borderRadius: '20px', padding: '16px', position: 'relative' }}>
            <button onClick={() => { setShowInstallGuide(false); localStorage.setItem('bronks_hide_install', 'true') }} style={{ position: 'absolute', top: '12px', right: '12px', background: 'transparent', border: 'none', color: '#888', cursor: 'pointer', fontSize: '18px', padding: '4px' }}>×</button>
            <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
              <div style={{ width: '40px', height: '40px', background: 'linear-gradient(135deg, #FFD700, #FFA500)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: '2px' }}>
                {/android/i.test(navigator.userAgent) ? <Download size={20} color="#000" /> : <Zap size={20} color="#000" />}
              </div>
              <div>
                {/android/i.test(navigator.userAgent) ? (
                  <>
                    <h3 style={{ color: '#FFD700', fontSize: '15px', fontWeight: 'bold', margin: '0 0 6px' }}>Baixe o Aplicativo (APK)</h3>
                    <p style={{ color: '#aaa', fontSize: '12px', margin: '0 0 10px', lineHeight: 1.4 }}>Instale o app nativo para ter notificações e a melhor performance.</p>
                    <a href="/bronks-gym.apk" download style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: '#FFD700', color: '#000', padding: '6px 12px', borderRadius: '12px', textDecoration: 'none', fontSize: '13px', fontWeight: 'bold' }}>
                      <Download size={14} /> Baixar Agora
                    </a>
                  </>
                ) : (
                  <>
                    <h3 style={{ color: '#FFD700', fontSize: '15px', fontWeight: 'bold', margin: '0 0 6px' }}>Instalar Aplicativo</h3>
                    <p style={{ color: '#aaa', fontSize: '12px', margin: '0 0 10px', lineHeight: 1.4 }}>Tenha a melhor experiência de treino. Adicione à sua tela inicial:</p>
                    <ol style={{ color: '#ccc', fontSize: '12px', margin: 0, paddingLeft: '16px', lineHeight: 1.6 }}>
                      <li>Toque no ícone de <strong>Compartilhar</strong> (iOS) ou nos <strong>3 pontos</strong> (Android)</li>
                      <li>Selecione <strong>"Adicionar à Tela de Início"</strong></li>
                      <li>Acesse o <strong>Bronks Gym</strong> direto do celular!</li>
                    </ol>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Atividades Complementares do dia */}
      {atividadesHoje.length > 0 && (
        <div style={{ padding: '0 20px', marginBottom: '24px' }}>
          <h2 style={{ color: '#fff', fontSize: '18px', fontWeight: 'bold', marginBottom: '12px' }}>🏃 Atividades de Hoje</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {atividadesHoje.map(ativ => (
              <div key={ativ.nome} style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                background: ativ.completada ? 'rgba(76,175,80,0.08)' : 'rgba(255,167,38,0.07)',
                border: `1px solid ${ativ.completada ? 'rgba(76,175,80,0.3)' : 'rgba(255,167,38,0.25)'}`,
                borderRadius: '16px', padding: '14px 16px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span style={{ fontSize: '22px' }}>
                    {ativ.nome === 'Corrida' ? '🏃' : ativ.nome === 'Natação' ? '🏊' : ativ.nome === 'Futebol' ? '⚽' : ativ.nome === 'Ciclismo' ? '🚴' : ativ.nome === 'Luta' ? '🥊' : '🏋️'}
                  </span>
                  <div>
                    <div style={{ color: ativ.completada ? '#66BB6A' : '#fff', fontWeight: 'bold', fontSize: '14px' }}>{ativ.nome}</div>
                    <div style={{ color: ativ.completada ? '#66BB6A' : '#FFA726', fontSize: '11px' }}>
                      {ativ.completada ? '✅ Concluída hoje!' : '⚠️ Faça hoje!'}
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => toggleAtividade(ativ.nome)}
                  style={{
                    width: '40px', height: '40px', borderRadius: '12px', border: 'none',
                    background: ativ.completada ? '#4CAF50' : 'rgba(255,255,255,0.08)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
                    flexShrink: 0, transition: 'all 0.2s'
                  }}
                >
                  {ativ.completada ? <Check size={20} color="#fff" strokeWidth={3} /> : <div style={{ width: '20px', height: '20px', border: '2px solid rgba(255,255,255,0.3)', borderRadius: '6px' }} />}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Treino Card */}
      <div style={{ padding: '0 20px', marginBottom: '24px' }}>
        <div className="flex justify-between items-center mb12">
          <h2 style={{ color: '#fff', fontSize: '18px', fontWeight: 'bold' }}>Treino de Hoje</h2>
          <span onClick={() => navigate('/treino')} style={{ color: 'var(--yellow)', fontSize: '13px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>
            Ver todos <ArrowRight size={14} />
          </span>
        </div>
        <div style={{ borderRadius: '20px', overflow: 'hidden', position: 'relative', minHeight: '210px', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', border: '1px solid rgba(255,215,0,0.2)', boxShadow: '0 8px 32px rgba(0,0,0,0.6)', ...heroStyle }}>
          <label style={{ position: 'absolute', top: '14px', right: '14px', zIndex: 2, background: 'rgba(0,0,0,0.55)', border: '1px solid rgba(255,255,255,0.15)', color: 'var(--gray)', padding: '5px 10px', borderRadius: '20px', cursor: 'pointer', fontSize: '11px', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 'bold' }}>
            <Plus size={12} /> Foto
            <input type="file" accept="image/*" onChange={handleHeroBg} style={{ display: 'none' }} />
          </label>
          {!bgCustom && <div style={{ position: 'absolute', top: '-20px', right: '20px', width: '100px', height: '100px', borderRadius: '50%', background: 'rgba(255,215,0,0.1)', filter: 'blur(30px)' }}></div>}
          <div style={{ position: 'absolute', top: '14px', left: '14px', background: 'rgba(255,215,0,0.9)', color: '#000', padding: '4px 12px', borderRadius: '20px', fontSize: '11px', fontWeight: 'bold', letterSpacing: '0.5px' }}>TREINO {treinoHoje.key}</div>
          <div style={{ padding: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
              <Zap size={14} color="var(--yellow)" />
              <span style={{ color: 'var(--yellow)', fontSize: '11px', fontWeight: 'bold', letterSpacing: '0.5px' }}>FOCO: {(obj || 'PERFORMANCE').toUpperCase()}</span>
            </div>
            <h3 style={{ color: '#fff', fontSize: '20px', fontWeight: 'bold', margin: '0 0 14px 0', textShadow: '0 2px 8px rgba(0,0,0,0.8)' }}>{treinoHoje.titulo || 'Meu Treino'}</h3>
            {treinoHoje.completado ? (
              <div style={{ width: '100%', height: '48px', background: 'rgba(76,175,80,0.2)', border: '1px solid rgba(76,175,80,0.4)', borderRadius: '14px', color: '#66BB6A', fontWeight: '800', fontSize: '15px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                <Check size={20} strokeWidth={3} /> Treino Concluído
              </div>
            ) : (
              <button onClick={() => navigate('/treino')} style={{ width: '100%', height: '48px', background: 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)', border: 'none', borderRadius: '14px', color: '#000', fontWeight: '800', fontSize: '15px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', cursor: 'pointer', boxShadow: '0 4px 20px rgba(255,165,0,0.4)' }}
                onTouchStart={e => { e.currentTarget.style.transform = 'scale(0.97)' }}
                onTouchEnd={e => { e.currentTarget.style.transform = 'scale(1)' }}>
                <Play size={18} fill="#000" /> Iniciar Treino
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Ofertas Especiais (Achadinhos) */}
      {affiliateProducts.length > 0 && (
        <div style={{ marginBottom: '24px' }}>
          <div style={{ padding: '0 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
            <h2 style={{ color: '#fff', fontSize: '16px', fontWeight: '900', margin: 0, display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Tag size={18} color="var(--yellow)" /> Achadinhos Bronks
            </h2>
          </div>
          <div style={{ display: 'flex', gap: '12px', overflowX: 'auto', padding: '0 20px 10px 20px', scrollSnapType: 'x mandatory' }}>
            {affiliateProducts.map(p => (
              <div
                key={p.id}
                style={{
                  flexShrink: 0,
                  width: '220px',
                  background: '#141414',
                  border: '1px solid rgba(255,215,0,0.15)',
                  borderRadius: '16px',
                  overflow: 'hidden',
                  display: 'flex',
                  flexDirection: 'column',
                  scrollSnapAlign: 'start',
                  boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
                  position: 'relative'
                }}
              >
                {/* Imagens com scroll horizontal */}
                <div style={{ width: '100%', height: '180px', background: '#000', position: 'relative' }}>
                  {p.imagens && p.imagens.length > 0 ? (
                    <div className="hide-scrollbar" style={{ display: 'flex', overflowX: 'auto', scrollSnapType: 'x mandatory', width: '100%', height: '100%', WebkitOverflowScrolling: 'touch' }}>
                      {p.imagens.map((img, idx) => (
                        <img 
                          key={idx} 
                          src={img} 
                          onClick={(e) => {
                            e.preventDefault();
                            supabase.rpc('increment_product_clicks', { product_id: p.id }).then(res => { if(res.error) console.error(res.error) });
                            window.open(p.link_afiliado, '_blank');
                          }}
                          style={{ width: '100%', height: '100%', objectFit: 'cover', flexShrink: 0, scrollSnapAlign: 'start', cursor: 'pointer' }} 
                        />
                      ))}
                    </div>
                  ) : (
                    <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <ShoppingBag size={40} color="#333" />
                    </div>
                  )}
                  {p.loja && (
                    <div style={{ position: 'absolute', top: 8, left: 8, background: 'rgba(0,0,0,0.8)', padding: '4px 8px', borderRadius: '8px', border: '1px solid #333', fontSize: '10px', fontWeight: 'bold', color: '#fff', display: 'flex', alignItems: 'center', gap: '4px', pointerEvents: 'none' }}>
                      {p.loja === 'mercadolivre' ? '🟡 ML' : p.loja === 'amazon' ? '📦 Amazon' : p.loja === 'shopee' ? '🧡 Shopee' : '🔗 Loja'}
                    </div>
                  )}
                  {p.imagens && p.imagens.length > 1 && (
                    <div style={{ position: 'absolute', bottom: 8, left: 0, width: '100%', display: 'flex', justifyContent: 'center', gap: '4px', pointerEvents: 'none' }}>
                      {p.imagens.map((_, i) => (
                         <div key={i} style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'rgba(255,255,255,0.8)', boxShadow: '0 1px 3px rgba(0,0,0,0.5)' }} />
                      ))}
                    </div>
                  )}
                </div>
                
                {/* Conteúdo e Botão */}
                <div style={{ padding: '12px', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <div 
                    onClick={() => {
                      supabase.rpc('increment_product_clicks', { product_id: p.id }).then(res => { if(res.error) console.error(res.error) });
                      window.open(p.link_afiliado, '_blank');
                    }}
                    style={{ cursor: 'pointer' }}
                  >
                    <h3 style={{ color: '#fff', fontSize: '14px', fontWeight: 'bold', margin: '0 0 6px 0', lineHeight: 1.3, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{p.titulo}</h3>
                    {p.descricao && <p style={{ color: '#888', fontSize: '11px', margin: '0 0 8px 0', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{p.descricao}</p>}
                  </div>
                  <div 
                    onClick={() => {
                      supabase.rpc('increment_product_clicks', { product_id: p.id }).then(res => { if(res.error) console.error(res.error) });
                      window.open(p.link_afiliado, '_blank');
                    }}
                    style={{ cursor: 'pointer', marginTop: 'auto' }}
                  >
                    {p.preco_promocional && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
                        {p.preco_original && <span style={{ color: '#666', fontSize: '11px', textDecoration: 'line-through' }}>{p.preco_original}</span>}
                        <span style={{ color: '#e53935', fontSize: '16px', fontWeight: '900' }}>{p.preco_promocional}</span>
                      </div>
                    )}
                    <div style={{
                      background: 'rgba(255,215,0,0.1)',
                      color: 'var(--yellow)',
                      border: '1px solid rgba(255,215,0,0.3)',
                      padding: '8px',
                      borderRadius: '8px',
                      fontSize: '11px',
                      fontWeight: 'bold',
                      textAlign: 'center',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '4px',
                      transition: 'background 0.2s'
                    }}>
                      {p.botao_texto || 'Ver Oferta'} <ExternalLink size={12} />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      
      {/* Dieta */}
      <div style={{ padding: '0 20px', marginBottom: '24px' }}>
        <h2 style={{ color: '#fff', fontSize: '18px', fontWeight: 'bold', marginBottom: '14px' }}>Próxima Refeição</h2>
        <div onClick={() => navigate('/dieta')} style={{ display: 'flex', alignItems: 'center', gap: '14px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '16px', padding: '14px 16px', cursor: 'pointer' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: 'rgba(102,187,106,0.15)', border: '1px solid rgba(102,187,106,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '22px', flexShrink: 0 }}>🥗</div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ color: '#fff', fontWeight: 'bold', fontSize: '15px', marginBottom: '3px' }}>Minha Dieta</div>
            <div style={{ color: 'var(--gray)', fontSize: '12px' }}>Toque para ver suas 6 refeições do dia</div>
          </div>
          <div style={{ background: 'rgba(255,255,255,0.05)', borderRadius: '50%', padding: '8px', flexShrink: 0 }}>
            <ChevronRight size={16} color="var(--gray)" />
          </div>
        </div>
      </div>

      {/* Dicas e Notícias Fitness */}
      <div style={{ padding: '0 20px', marginBottom: '24px' }}>
        <div className="flex justify-between items-center mb12">
          <h2 style={{ color: '#fff', fontSize: '18px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Newspaper size={18} color="#FFD700" /> Dica do Dia
          </h2>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button onClick={() => setNoticiaIdx(i => (i - 1 + NOTICIAS.length) % NOTICIAS.length)} style={{ background: 'rgba(255,255,255,0.06)', border: 'none', borderRadius: '10px', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
              <ChevronLeft size={16} color="#888" />
            </button>
            <button onClick={() => setNoticiaIdx(i => (i + 1) % NOTICIAS.length)} style={{ background: 'rgba(255,255,255,0.06)', border: 'none', borderRadius: '10px', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
              <ChevronRight size={16} color="#888" />
            </button>
          </div>
        </div>
        {(() => {
          const noticia = NOTICIAS[noticiaIdx]
          return (
            <div style={{ background: `linear-gradient(135deg, ${noticia.cor}12, ${noticia.cor}06)`, border: `1px solid ${noticia.cor}30`, borderRadius: '20px', padding: '20px', position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', top: '-20px', right: '-10px', fontSize: '60px', opacity: 0.08 }}>{noticia.emoji}</div>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px', position: 'relative' }}>
                <div style={{ width: '44px', height: '44px', borderRadius: '14px', background: `${noticia.cor}20`, border: `1px solid ${noticia.cor}40`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '22px', flexShrink: 0 }}>
                  {noticia.emoji}
                </div>
                <div style={{ flex: 1 }}>
                  <h3 style={{ color: '#fff', fontSize: '15px', fontWeight: 'bold', margin: '0 0 6px' }}>{noticia.titulo}</h3>
                  <p style={{ color: '#aaa', fontSize: '12px', lineHeight: 1.5, margin: 0 }}>{noticia.resumo}</p>
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'center', gap: '4px', marginTop: '14px' }}>
                {NOTICIAS.map((_, i) => (
                  <div key={i} onClick={() => setNoticiaIdx(i)} style={{ width: i === noticiaIdx ? '16px' : '6px', height: '6px', borderRadius: '3px', background: i === noticiaIdx ? noticia.cor : 'rgba(255,255,255,0.15)', transition: 'all 0.3s', cursor: 'pointer' }} />
                ))}
              </div>
            </div>
          )
        })()}
      </div>

      {/* Popup Refeição */}
      {refeicaoLembrete && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(5px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }}>
          <div style={{ background: 'linear-gradient(145deg, #1A1A1A, #111)', border: '1px solid rgba(102,187,106,0.3)', borderRadius: '24px', padding: '30px', width: '100%', maxWidth: '340px', textAlign: 'center', boxShadow: '0 20px 40px rgba(0,0,0,0.5)' }}>
            <div style={{ fontSize: '50px', marginBottom: '10px' }}>🥗</div>
            <h2 style={{ color: '#fff', fontSize: '22px', fontWeight: 'bold', margin: '0 0 10px' }}>Hora de Comer!</h2>
            <p style={{ color: '#aaa', fontSize: '14px', margin: '0 0 24px', lineHeight: 1.5 }}>Está na hora do seu <strong>{refeicaoLembrete}</strong>.</p>
            <button onClick={() => { setRefeicaoLembrete(null); navigate('/dieta') }} style={{ width: '100%', padding: '14px', borderRadius: '14px', background: '#66BB6A', color: '#000', fontWeight: 'bold', fontSize: '16px', border: 'none', cursor: 'pointer', marginBottom: '10px' }}>Ver Refeição</button>
            <button onClick={() => setRefeicaoLembrete(null)} style={{ width: '100%', padding: '14px', borderRadius: '14px', background: 'transparent', color: '#888', fontWeight: 'bold', fontSize: '14px', border: 'none', cursor: 'pointer' }}>Agora não</button>
          </div>
        </div>
      )}

      {/* Popup Ciclo 25 dias */}
      {showCycleReset && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.9)', backdropFilter: 'blur(10px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000, padding: '20px' }}>
          <div style={{ background: 'var(--card2)', border: '1px solid var(--yellow)', borderRadius: '32px', padding: '32px', width: '100%', maxWidth: '400px', textAlign: 'center', boxShadow: '0 0 50px rgba(255,215,0,0.15)' }}>
            <div style={{ width: '80px', height: '80px', background: 'rgba(255,215,0,0.1)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
              <Zap size={40} color="var(--yellow)" />
            </div>
            <h2 style={{ color: '#fff', fontSize: '24px', fontWeight: 'bold', margin: '0 0 12px' }}>Fim do Ciclo! 🔥</h2>
            <p style={{ color: '#aaa', fontSize: '14px', margin: '0 0 24px', lineHeight: 1.6 }}>
              Parabéns! Você completou <strong>25 dias</strong> de foco. Vamos atualizar seus dados e gerar um <strong>novo plano de treinos</strong> para você continuar evoluindo?
            </p>
            
            <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: '20px', padding: '20px', marginBottom: '24px', textAlign: 'left' }}>
              <h4 style={{ color: 'var(--yellow)', fontSize: '13px', textTransform: 'uppercase', marginBottom: '12px' }}>Resumo do Ciclo:</h4>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ color: '#888', fontSize: '13px' }}>Treinos realizados:</span>
                <span style={{ color: '#fff', fontSize: '13px', fontWeight: 'bold' }}>{historico.workouts.length}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#888', fontSize: '13px' }}>Média de água:</span>
                <span style={{ color: '#fff', fontSize: '13px', fontWeight: 'bold' }}>2.4L/dia</span>
              </div>
            </div>

            <button 
              onClick={() => {
                setShowCycleReset(false)
                navigate('/perfil')
              }} 
              style={{ width: '100%', padding: '16px', borderRadius: '16px', background: 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)', color: '#000', fontWeight: 'bold', fontSize: '16px', border: 'none', cursor: 'pointer', marginBottom: '12px', boxShadow: '0 4px 15px rgba(255,165,0,0.3)' }}
            >
              Atualizar Dados e Reiniciar
            </button>
            <button onClick={() => setShowCycleReset(false)} style={{ color: '#666', fontSize: '14px', background: 'none', border: 'none', cursor: 'pointer' }}>Lembrar mais tarde</button>
          </div>
        </div>
      )}

      {/* Popup Promocional do Admin */}
      {promoPopup && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.9)', backdropFilter: 'blur(10px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 3000, padding: '20px' }}>
          <div style={{ background: '#141414', border: '1px solid rgba(255,215,0,0.3)', borderRadius: '28px', width: '100%', maxWidth: '380px', overflow: 'hidden', boxShadow: '0 20px 60px rgba(0,0,0,0.8)' }}>
            {promoPopup.imagem_url && (
              <div style={{ width: '100%', maxHeight: '400px', background: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <img src={promoPopup.imagem_url} alt="" style={{ width: '100%', height: '100%', maxHeight: '400px', objectFit: 'contain' }} />
              </div>
            )}
            <div style={{ padding: '24px' }}>
              <h2 style={{ color: '#fff', fontSize: '20px', fontWeight: '900', margin: '0 0 8px' }}>{promoPopup.titulo}</h2>
              {promoPopup.descricao && <p style={{ color: '#aaa', fontSize: '13px', lineHeight: 1.5, margin: '0 0 20px' }}>{promoPopup.descricao}</p>}
              {promoPopup.botao_link && (
                <a href={promoPopup.botao_link} target="_blank" rel="noopener noreferrer" 
                  onClick={() => {
                    supabase.rpc('increment_popup_metric', { popup_id: promoPopup.id, metric: 'cliques' }).then(()=>{}).catch(()=>{})
                    const visto = JSON.parse(localStorage.getItem('bronks_popups_seen') || '{}')
                    visto[promoPopup.id] = new Date().toDateString()
                    localStorage.setItem('bronks_popups_seen', JSON.stringify(visto))
                    setPromoPopup(null)
                  }}
                  style={{ display: 'block', width: '100%', padding: '14px', background: 'linear-gradient(135deg, #FFD700, #FFA500)', borderRadius: '14px', color: '#000', fontWeight: 'bold', fontSize: '15px', textAlign: 'center', textDecoration: 'none', marginBottom: '10px', boxSizing: 'border-box' }}>
                  {promoPopup.botao_texto || 'Saiba mais'}
                </a>
              )}
              <button onClick={() => {
                supabase.rpc('increment_popup_metric', { popup_id: promoPopup.id, metric: 'cancelamentos' }).then(()=>{}).catch(()=>{})
                const visto = JSON.parse(localStorage.getItem('bronks_popups_seen') || '{}')
                visto[promoPopup.id] = new Date().toDateString()
                localStorage.setItem('bronks_popups_seen', JSON.stringify(visto))
                setPromoPopup(null)
              }} style={{ width: '100%', padding: '12px', background: 'transparent', border: 'none', color: '#666', fontSize: '14px', cursor: 'pointer', fontWeight: 'bold' }}>
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
