import React, { useState, useEffect, useMemo } from 'react'
import {
  Users, Eye, TrendingUp, Target, CheckCircle2, Mail, Search, Filter,
  Download, RefreshCw, Send, Lock, KeyRound, ExternalLink, ShieldAlert,
  ArrowRight, Sparkles, Smartphone, Monitor, ChevronRight, Check,
  Clock, AlertCircle, Copy, BarChart2, Flame, Layers, PlayCircle, Settings
} from 'lucide-react'
import { getTrackedSessions, updateLeadRecoveryStatus, calculateInleadMetrics } from '../lib/quizTracker'

/* ========================================================
   NEXA FIT PRO — DASHBOARD DE ALTA CONVERSÃO & FUNIL (/dash)
   Modelado fielmente à interface Inlead:
   - Acesso Privilegiado (Autenticação server-side sem expor senha no front)
   - Rastreamento de cada etapa e respostas detalhadas do Quiz
   - Métricas avançadas de Campanhas e Criativos via UTMs
   - Sessão de Remarketing & Automação de E-mails via Resend
   - Design Clean, Profissional com Logo Nexa Fit Pro
   ======================================================== */

// Templates prontos de recuperação de alta conversão
const RECOVERY_TEMPLATES = {
  d0: {
    id: 'd0',
    title: 'D0 — Recuperação Imediata (1h - 2h após abandono)',
    tag: 'Alta Urgência',
    subject: '🔥 {nome}, seu plano personalizado Nexa Fit Pro foi gerado (expira hoje)',
    badgeColor: '#E11D48',
    defaultBody: `Olá, {nome}!

Notamos que você concluiu sua avaliação para atingir o objetivo de {objetivo}, mas sua vaga promocional ainda não foi confirmada.

Seu protocolo exclusivo de queima acelerada e treinos de 15 a 30 minutos em casa foi calibrado para o seu perfil.

Como as vagas no servidor são limitadas por coach, guardamos seu plano até a meia-noite de hoje com a condição especial de avaliação.

Clique no botão abaixo para garantir seu plano e começar hoje mesmo!`
  },
  d1: {
    id: 'd1',
    title: 'D1 — Quebra de Objeção "Sem Academia" (24h após)',
    tag: 'Quebra de Objeção',
    subject: '⚠️ {nome}, veja por que você NÃO precisa de academia para eliminar até 15kg',
    badgeColor: '#F59E0B',
    defaultBody: `Oi {nome}, tudo bem?

Muitas pessoas deixam de começar porque acham que precisam passar horas em aparelhos de academia ou gastar com mensalidades caras.

O método NEXA FIT PRO foi desenvolvido exatamente para o ritmo corrido do dia a dia:
✓ Sem equipamentos obrigatórios
✓ Sessões práticas de 15 a 30 minutos
✓ Cardápio simples com alimentos do seu cotidiano

Seu perfil com foco em {objetivo} tem alto potencial de resposta rápida.

Ainda dá tempo de resgatar seu plano com garantia total de 7 dias!`
  },
  d2: {
    id: 'd2',
    title: 'D2 — Última Chamada & Desconto Vitalício (48h após)',
    tag: 'Última Oportunidade',
    subject: '🚨 Última chamada: sua condição especial será cancelada nas próximas horas',
    badgeColor: '#8B5CF6',
    defaultBody: `{nome}, esta é a nossa última mensagem sobre sua avaliação de condicionamento.

O desconto especial liberado no final do seu teste expira nas próximas horas e não conseguiremos manter essa condição depois.

Você está a 1 clique de iniciar uma transformação real de até 15kg em 60 dias:
✓ Acesso imediato no aplicativo
✓ Lista de compras inteligente e receitas rápidas
✓ Comunidade exclusiva de alunos

Não deixe para o próximo mês o corpo que você pode começar a construir hoje.`
  }
}

// ── Dicionário de Formatação de Respostas Humanizadas ──
const ANSWER_LABELS = {
  goals: {
    emagrecer: '🔥 Secar até 15kg de Gordura Rápido',
    massa: '💪 Ganhar Massa Muscular e Volume',
    definir: '✨ Definir Abdômen e Tonificar Músculos',
    saude: '❤️ Melhorar Saúde, Postura e Vigor'
  },
  location: {
    casa: '🏠 Em Casa (100% sem equipamentos)',
    academia: '🏋️ Na Academia com aparelhos',
    hibrido: '🔄 Onde eu estiver (Casa ou Academia)'
  },
  secondaryGoals: {
    barriga: '🎯 Eliminar gordura visceral da barriga',
    postura: '🧍 Corrigir postura e acabar com dores',
    flexibilidade: '🤸 Aumentar flexibilidade e mobilidade',
    core: '🛡️ Fortalecer abdômen e lombar',
    estresse: '🧘 Reduzir ansiedade e estresse diário',
    energia: '⚡ Acordar com energia e disposição total'
  },
  bodyTypes: {
    magro: '🏃 Magro com pouca massa',
    medio: '🧍 Médio / Pouca definição',
    grande: '🏋️ Acima do peso / Gordura localizada',
    obeso: '💪 Muito acima do peso (+15kg)'
  },
  dreamBodies: {
    atletico: '🏆 Físico Atlético e Seco',
    tonificado: '✨ Abdômen Tonificado e Riscado',
    forte: '💪 Forte, Musculoso e Posturado',
    saudavel: '❤️ Saudável, Leve e em Forma'
  },
  experience: {
    sim: '✅ Sim, treino regularmente',
    pouco: '🔄 Sim, mas falho na consistência',
    nao: '🆕 Não, sou iniciante do zero'
  },
  frequency: {
    diario: '🔥 4 a 6 dias por semana (15 a 30 min)',
    varias: '💪 2 a 3 dias por semana',
    mensal: '📅 1 vez por semana ou esporádico',
    nunca: '🆕 Quase nunca / Sedentário no momento'
  },
  focusZones: {
    abdomen: '🎯 Abdômen & Cintura (Core)',
    peito: '🫁 Peitoral & Costas (Dorsais)',
    bracos: '💪 Braços (Bíceps & Tríceps)',
    ombros: '⚡ Ombros & Deltoides',
    pernas: '🦵 Pernas & Quadríceps',
    gluteos: '🍑 Glúteos & Posterior'
  },
  plank: {
    nao: '😅 Menos de 15 segundos',
    menos30: '⏱️ Entre 15 e 30 segundos',
    '30-60': '💪 Entre 30 e 60 segundos',
    mais60: '🔥 Mais de 1 minuto com facilidade'
  },
  likesMusic: {
    sim: '🎧 Sim, dá foco e energia (+28% rendimento)',
    nao: '🔇 Não, prefiro silêncio / meu som'
  },
  music: {
    psytrance: '⚡ Psytrance / Eletrônica Pesada',
    hiphop: '🔥 Hip Hop, Trap & Phonk',
    pagode: '🥁 Pagode & Samba',
    sertanejo_univ: '🤠 Sertanejo Universitário',
    sertanejo_modao: '🪕 Sertanejo Modão & Raiz',
    rock: '🎸 Rock Clássico & Heavy Metal',
    lofi: '🎧 Lo-Fi Chill & Foco'
  },
  workRoutine: {
    '9-18': '🏢 Horário comercial (8h às 18h)',
    flex: '🏠 Home office ou flexível',
    noturno: '🌙 Turnos noturnos ou escalas',
    livre: '🏖️ Tempo livre / Aposentado'
  },
  typicalDay: {
    sentado: '🪑 Quase o dia todo sentado',
    pausas: '🚶 Alterna entre sentado e em pé',
    pe: '🧍 Em pé ou movimentando o dia todo'
  },
  energy: {
    baixa: '😩 Baixa, cansaço frequente',
    queda: '😴 Queda de rendimento pós-refeições',
    oscila: '📉 Oscila com picos de estresse',
    alta: '⚡ Boa energia contínua'
  },
  water: {
    pouco: '☕ Menos de 1 Litro (pouco)',
    medio: '🥛 1 a 2 Litros por dia',
    ideal: '💧 Mais de 2.5 Litros (meta batida)'
  },
  sleep: {
    menos5: '😵 Menos de 5 horas',
    '5-6': '😪 5 a 6 horas por noite',
    '7-8': '😊 7 a 8 horas (reparador)',
    '8+': '😴 Mais de 8 horas'
  },
  diet: {
    tudo: '🍽️ Tradicional (come de tudo)',
    lowcarb: '🥩 Low carb / Alta proteína',
    vegetariana: '🥗 Vegetariana / Vegana',
    flexivel: '🥑 Dieta flexível (contando macros)'
  },
  badHabits: {
    emocional: '😔 Comer por ansiedade/estresse',
    doces: '🍫 Vontade de doces à noite',
    fimdesemana: '🍔 Exagerar nos finais de semana',
    pular: '⏭️ Pular refeições',
    nenhum: '✅ Nenhum, disciplina regular'
  },
  weightTriggers: {
    metabolismo: '🐌 Metabolismo lento após certa idade',
    estresse: '💼 Estresse e correria diária',
    sedentarismo: '🛋️ Falta de tempo para academia',
    refeicoes: '🍕 Alimentação desregulada fora de casa',
    nenhum: '✅ Nenhum dos fatores acima'
  },
  mainReason: {
    confianca: '💫 Olhar no espelho e ter orgulho',
    roupas: '👕 Voltar a vestir qualquer roupa',
    saude: '❤️ Mais saúde, vigor e longevidade',
    atraente: '🔥 Sentir-se atraente e com autoestima alta'
  },
  confidence: {
    sim: '🔥 Quero começar hoje e vou com tudo!',
    talvez: '🎯 Preciso de passo a passo guiado',
    inseguro: '✨ Já tentei de tudo, última chance'
  }
}

function formatVal(group, key) {
  if (!key) return null
  if (Array.isArray(key)) {
    return key.map(k => ANSWER_LABELS[group]?.[k] || k).join(', ')
  }
  return ANSWER_LABELS[group]?.[key] || key
}

export default function DashFunnel() {
  // Autenticação Privilegiada
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [authChecking, setAuthChecking] = useState(true)
  const [passwordInput, setPasswordInput] = useState('')
  const [loginError, setLoginError] = useState('')
  const [loggingIn, setLoggingIn] = useState(false)

  // Abas do Dashboard
  const [activeTab, setActiveTab] = useState('leads') // 'leads' | 'utms' | 'remarketing' | 'funnel' | 'settings'

  // Dados das Sessões / Leads
  const [sessions, setSessions] = useState([])
  const [loading, setLoading] = useState(false)
  const [lastRefreshed, setLastRefreshed] = useState(null)
  const [selectedLead, setSelectedLead] = useState(null)
  const [selectedIds, setSelectedIds] = useState([])

  // Filtros de busca
  const [searchTerm, setSearchTerm] = useState('')
  const [filterSource, setFilterSource] = useState('todos')
  const [filterCampaign, setFilterCampaign] = useState('todas')
  const [filterCreative, setFilterCreative] = useState('todos')
  const [filterStatus, setFilterStatus] = useState('todos')

  // Remarketing & Resend
  const [resendApiKey, setResendApiKey] = useState(() => localStorage.getItem('nexafit_resend_api_key') || '')
  const [selectedTemplate, setSelectedTemplate] = useState('d0')
  const [customSubject, setCustomSubject] = useState(RECOVERY_TEMPLATES.d0.subject)
  const [customBody, setCustomBody] = useState(RECOVERY_TEMPLATES.d0.defaultBody)
  const [sendingEmail, setSendingEmail] = useState(false)
  const [emailStatusMsg, setEmailStatusMsg] = useState(null)
  const [batchProgress, setBatchProgress] = useState(null)
  const [sqlCopied, setSqlCopied] = useState(false)

  // 1. Verificação de Sessão Token no Início (Server-side validation)
  useEffect(() => {
    checkCurrentAuth()
  }, [])

  const checkCurrentAuth = async () => {
    setAuthChecking(true)
    try {
      const token = sessionStorage.getItem('nexafit_dash_token')
      if (!token) {
        setIsAuthenticated(false)
        setAuthChecking(false)
        return
      }

      // Valida token com o backend /api/dash-auth
      const res = await fetch('/api/dash-auth', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (res.ok) {
        setIsAuthenticated(true)
      } else {
        sessionStorage.removeItem('nexafit_dash_token')
        setIsAuthenticated(false)
      }
    } catch (e) {
      // Se falhar a requisição de rede mas o token existir, permite sessão temporária
      const token = sessionStorage.getItem('nexafit_dash_token')
      setIsAuthenticated(!!token)
    } finally {
      setAuthChecking(false)
    }
  }

  // 2. Login com Senha (Autenticado no servidor, NUNCA no front)
  const handleLogin = async (e) => {
    if (e) e.preventDefault()
    setLoginError('')
    setLoggingIn(true)

    try {
      const res = await fetch('/api/dash-auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: passwordInput })
      })

      const data = await res.json()

      if (res.ok && data.success && data.token) {
        sessionStorage.setItem('nexafit_dash_token', data.token)
        setIsAuthenticated(true)
        setPasswordInput('')
      } else {
        setLoginError(data.error || 'Senha incorreta. Verifique os dígitos.')
      }
    } catch (err) {
      setLoginError('Erro ao conectar ao servidor de autenticação.')
    } finally {
      setLoggingIn(false)
    }
  }

  const handleLogout = () => {
    sessionStorage.removeItem('nexafit_dash_token')
    setIsAuthenticated(false)
  }

  // 3. Carregar Sessões e Leads
  const loadSessionsData = async () => {
    setLoading(true)
    try {
      const data = await getTrackedSessions()
      setSessions(data || [])
      setLastRefreshed(new Date())
    } catch (e) {
      console.warn('Erro ao carregar sessões:', e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (isAuthenticated) {
      loadSessionsData()
      // Auto-refresh a cada 45 segundos
      const interval = setInterval(loadSessionsData, 45000)
      return () => clearInterval(interval)
    }
  }, [isAuthenticated])

  // Salvar Chave do Resend
  const handleSaveResendKey = (key) => {
    setResendApiKey(key)
    localStorage.setItem('nexafit_resend_api_key', key)
  }

  // Trocar template de remarketing
  const handleTemplateChange = (tplId) => {
    setSelectedTemplate(tplId)
    const tpl = RECOVERY_TEMPLATES[tplId]
    if (tpl) {
      setCustomSubject(tpl.subject)
      setCustomBody(tpl.defaultBody)
    }
  }

  // 4. Métricas estilo Inlead calculadas dinamicamente
  const metrics = useMemo(() => {
    return calculateInleadMetrics(sessions)
  }, [sessions])

  // Opções para os filtros baseados nos dados reais
  const filterOptions = useMemo(() => {
    const sources = new Set()
    const campaigns = new Set()
    const creatives = new Set()

    sessions.forEach(s => {
      if (s.utm_source) sources.add(s.utm_source)
      if (s.utm_campaign) campaigns.add(s.utm_campaign)
      if (s.utm_content) creatives.add(s.utm_content)
    })

    return {
      sources: Array.from(sources),
      campaigns: Array.from(campaigns),
      creatives: Array.from(creatives)
    }
  }, [sessions])

  // Filtragem dos Leads
  const filteredSessions = useMemo(() => {
    return sessions.filter(s => {
      const searchMatch = !searchTerm || (
        (s.name && s.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (s.email && s.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (s.utm_campaign && s.utm_campaign.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (s.utm_content && s.utm_content.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (s.utm_source && s.utm_source.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (s.goal && s.goal.toLowerCase().includes(searchTerm.toLowerCase()))
      )

      const sourceMatch = filterSource === 'todos' || s.utm_source === filterSource
      const campaignMatch = filterCampaign === 'todas' || s.utm_campaign === filterCampaign
      const creativeMatch = filterCreative === 'todos' || s.utm_content === filterCreative

      let statusMatch = true
      if (filterStatus === 'com_email') statusMatch = !!s.email
      else if (filterStatus === 'checkout') statusMatch = s.status === 'checkout_reached' || s.status === 'checkout_clicked'
      else if (filterStatus === 'qualificados') statusMatch = s.status === 'qualified' || s.step_number >= 15
      else if (filterStatus === 'abandono') statusMatch = s.status === 'in_progress' && !s.email

      return searchMatch && sourceMatch && campaignMatch && creativeMatch && statusMatch
    })
  }, [sessions, searchTerm, filterSource, filterCampaign, filterCreative, filterStatus])

  // Leads qualificados para Remarketing (têm email mas não converteram como compradores)
  const remarketingLeads = useMemo(() => {
    return sessions.filter(s => s.email && s.email.includes('@'))
  }, [sessions])

  // Agrupamento por Criativos (utm_content) para análise de anúncios
  const creativeMetrics = useMemo(() => {
    const map = {}
    sessions.forEach(s => {
      const creative = s.utm_content || 'Orgânico / Direto'
      if (!map[creative]) {
        map[creative] = {
          name: creative,
          visits: 0,
          interacted: 0,
          qualified: 0,
          withEmail: 0,
          checkout: 0
        }
      }
      map[creative].visits += 1
      if (s.step_number > 0) map[creative].interacted += 1
      if (s.status === 'qualified' || s.step_number >= 15) map[creative].qualified += 1
      if (s.email) map[creative].withEmail += 1
      if (s.status === 'checkout_reached' || s.status === 'checkout_clicked') map[creative].checkout += 1
    })

    return Object.values(map).sort((a, b) => b.visits - a.visits)
  }, [sessions])

  // Agrupamento por Campanhas (utm_campaign)
  const campaignMetrics = useMemo(() => {
    const map = {}
    sessions.forEach(s => {
      const camp = s.utm_campaign || 'Orgânico / Sem Campanha'
      if (!map[camp]) {
        map[camp] = {
          name: camp,
          visits: 0,
          withEmail: 0,
          checkout: 0
        }
      }
      map[camp].visits += 1
      if (s.email) map[camp].withEmail += 1
      if (s.status === 'checkout_reached' || s.status === 'checkout_clicked') map[camp].checkout += 1
    })

    return Object.values(map).sort((a, b) => b.visits - a.visits)
  }, [sessions])

  // Disparo de E-mail de Recuperação individual via Resend
  const handleSendRecoveryEmail = async (lead) => {
    if (!lead || !lead.email) return
    if (!resendApiKey) {
      alert('Por favor, configure sua chave de API do Resend na aba Remarketing ou Configurações primeiro.')
      return
    }

    setSendingEmail(true)
    setEmailStatusMsg(null)

    const finalSubject = customSubject
      .replace('{nome}', lead.name || 'Atleta')
      .replace('{objetivo}', lead.goal || 'seu objetivo físico')

    const finalBody = customBody
      .replace('{nome}', lead.name || 'Atleta')
      .replace('{objetivo}', lead.goal || 'transformação corporal')

    try {
      const res = await fetch('/api/send-recovery-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          apiKey: resendApiKey,
          to: lead.email,
          leadName: lead.name || 'Atleta Nexa',
          subject: finalSubject,
          goal: lead.goal || 'Definir o corpo em 60 dias',
          targetWeight: lead.target_weight || '',
          customHtml: `<div style="font-family: sans-serif; max-width: 580px; margin: auto; padding: 24px; background: #0c0d0e; color: #fff; border-radius: 12px;">
            <h1 style="color: #BEF264; font-size: 24px; margin-bottom: 16px;">NEXA FIT PRO</h1>
            <p style="white-space: pre-line; line-height: 1.6; color: #ddd; font-size: 15px;">${finalBody}</p>
            <div style="margin: 28px 0; text-align: center;">
              <a href="https://pay.lastlink.com/nexafit-pro" style="display: inline-block; background: #BEF264; color: #000; font-weight: 900; padding: 16px 32px; border-radius: 8px; text-decoration: none; text-transform: uppercase;">Acessar Meu Plano Agora</a>
            </div>
            <p style="color: #666; font-size: 11px; text-align: center;">Equipe Nexa Fit Pro © 2026</p>
          </div>`
        })
      })

      const data = await res.json()

      if (res.ok && data.success) {
        await updateLeadRecoveryStatus(lead.session_id, `sent_${selectedTemplate}`, finalSubject)
        setEmailStatusMsg({ type: 'success', text: `E-mail enviado com sucesso para ${lead.email}!` })
        loadSessionsData()
      } else {
        setEmailStatusMsg({ type: 'error', text: data.error || 'Falha ao enviar e-mail via Resend.' })
      }
    } catch (err) {
      setEmailStatusMsg({ type: 'error', text: 'Erro ao conectar à API do Resend.' })
    } finally {
      setSendingEmail(false)
    }
  }

  // Disparo em lote de automação para todos os leads pendentes
  const handleBatchSend = async () => {
    if (!resendApiKey) {
      alert('Insira sua Chave do Resend antes de disparar automações.')
      return
    }

    const pending = remarketingLeads.filter(l => !l.recovery_status || l.recovery_status === 'pending')
    if (pending.length === 0) {
      alert('Nenhum lead com e-mail pendente de recuperação no momento.')
      return
    }

    if (!confirm(`Deseja disparar o e-mail de recuperação "${RECOVERY_TEMPLATES[selectedTemplate].title}" para ${pending.length} leads?`)) {
      return
    }

    setBatchProgress({ total: pending.length, current: 0, success: 0, failed: 0 })

    for (let i = 0; i < pending.length; i++) {
      const lead = pending[i]
      setBatchProgress(prev => ({ ...prev, current: i + 1 }))

      try {
        const finalSubject = customSubject
          .replace('{nome}', lead.name || 'Atleta')
          .replace('{objetivo}', lead.goal || 'seu objetivo físico')

        const finalBody = customBody
          .replace('{nome}', lead.name || 'Atleta')
          .replace('{objetivo}', lead.goal || 'transformação corporal')

        const res = await fetch('/api/send-recovery-email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            apiKey: resendApiKey,
            to: lead.email,
            leadName: lead.name || 'Atleta Nexa',
            subject: finalSubject,
            goal: lead.goal || 'Definir o corpo em 60 dias',
            customHtml: `<div style="font-family: sans-serif; max-width: 580px; margin: auto; padding: 24px; background: #0c0d0e; color: #fff; border-radius: 12px;">
              <h1 style="color: #BEF264; font-size: 24px; margin-bottom: 16px;">NEXA FIT PRO</h1>
              <p style="white-space: pre-line; line-height: 1.6; color: #ddd; font-size: 15px;">${finalBody}</p>
              <div style="margin: 28px 0; text-align: center;">
                <a href="https://pay.lastlink.com/nexafit-pro" style="display: inline-block; background: #BEF264; color: #000; font-weight: 900; padding: 16px 32px; border-radius: 8px; text-decoration: none; text-transform: uppercase;">Acessar Meu Plano Agora</a>
              </div>
              <p style="color: #666; font-size: 11px; text-align: center;">Equipe Nexa Fit Pro © 2026</p>
            </div>`
          })
        })

        if (res.ok) {
          await updateLeadRecoveryStatus(lead.session_id, `sent_${selectedTemplate}`, finalSubject)
          setBatchProgress(prev => ({ ...prev, success: prev.success + 1 }))
        } else {
          setBatchProgress(prev => ({ ...prev, failed: prev.failed + 1 }))
        }
      } catch (e) {
        setBatchProgress(prev => ({ ...prev, failed: prev.failed + 1 }))
      }

      // Delay de 500ms entre envios para respeitar taxa da API
      await new Promise(r => setTimeout(r, 500))
    }

    loadSessionsData()
    setTimeout(() => setBatchProgress(null), 5000)
  }

  // Exportar dados em CSV
  const handleExportCSV = () => {
    if (sessions.length === 0) {
      alert('Nenhum dado para exportar.')
      return
    }

    const headers = ['Data', 'Nome', 'Email', 'Genero', 'Idade', 'Objetivo', 'Local', 'Etapa Maxima', 'Status', 'UTM Source', 'UTM Campaign', 'Criativo (UTM Content)']
    const rows = sessions.map(s => [
      s.created_at ? new Date(s.created_at).toLocaleString('pt-BR') : '',
      `"${(s.name || '').replace(/"/g, '""')}"`,
      s.email || '',
      s.gender || '',
      s.age || '',
      `"${(s.goal || '').replace(/"/g, '""')}"`,
      s.location || '',
      s.highest_screen || '',
      s.status || '',
      s.utm_source || '',
      s.utm_campaign || '',
      `"${(s.utm_content || '').replace(/"/g, '""')}"`
    ])

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n')
    const encodedUri = encodeURI(csvContent)
    const link = document.createElement('a')
    link.setAttribute('href', encodedUri)
    link.setAttribute('download', `nexafit_leads_${new Date().toISOString().slice(0, 10)}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  // Copiar SQL para a área de transferência
  const copySqlScript = () => {
    const sql = `-- Script de Criação no Supabase
CREATE TABLE IF NOT EXISTS public.quiz_sessions (
  id text PRIMARY KEY,
  session_id text UNIQUE NOT NULL,
  email text,
  name text,
  gender text,
  age text,
  goal text,
  location text,
  body_type text,
  dream_body text,
  highest_screen text,
  step_number integer DEFAULT 0,
  total_steps integer DEFAULT 32,
  status text DEFAULT 'in_progress',
  answers jsonb DEFAULT '{}',
  utm_source text,
  utm_medium text,
  utm_campaign text,
  utm_content text,
  recovery_status text DEFAULT 'pending',
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now())
);
ALTER TABLE public.quiz_sessions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "quiz_sessions_all" ON public.quiz_sessions FOR ALL USING (true);`

    navigator.clipboard.writeText(sql)
    setSqlCopied(true)
    setTimeout(() => setSqlCopied(false), 3000)
  }

  // ─── TELA DE LOGIN PRIVILEGIADO ───────────────────────────────
  if (authChecking) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#F8FAFC' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 40, height: 40, border: '3px solid #E2E8F0', borderTopColor: '#BEF264', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
          <span style={{ fontSize: 13, color: '#64748B', fontWeight: 600 }}>Verificando credenciais seguras...</span>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return (
      <div style={{
        minHeight: '100vh',
        backgroundColor: '#0F1115',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
        fontFamily: "'Inter', -apple-system, sans-serif"
      }}>
        <div style={{
          width: '100%',
          maxWidth: 420,
          backgroundColor: '#161920',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: 24,
          padding: '40px 32px',
          boxShadow: '0 25px 60px rgba(0,0,0,0.7)',
          textAlign: 'center'
        }}>
          {/* Logo do Usuário */}
          <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'center' }}>
            <img
              src="/logo.png"
              alt="Nexa Fit Pro"
              style={{ maxHeight: 52, objectFit: 'contain' }}
              onError={(e) => {
                e.currentTarget.style.display = 'none'
              }}
            />
          </div>

          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '6px 14px', borderRadius: 99, background: 'rgba(190,242,100,0.1)', border: '1px solid rgba(190,242,100,0.25)', marginBottom: 16 }}>
            <Lock size={14} color="#BEF264" />
            <span style={{ fontSize: 11, fontWeight: 800, color: '#BEF264', letterSpacing: 1, textTransform: 'uppercase' }}>
              Acesso Privilegiado
            </span>
          </div>

          <h2 style={{ color: '#fff', fontSize: 22, fontWeight: 800, margin: '0 0 8px 0', letterSpacing: -0.5 }}>
            Painel do Funil & Métricas
          </h2>
          <p style={{ color: '#94A3B8', fontSize: 13, margin: '0 0 28px 0', lineHeight: 1.5 }}>
            Acesso administrativo seguro. Digite a senha para visualizar dados de conversão e leads em tempo real.
          </p>

          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ position: 'relative' }}>
              <KeyRound size={18} color="#64748B" style={{ position: 'absolute', left: 16, top: 16 }} />
              <input
                type="password"
                placeholder="Digite a senha de acesso"
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                autoFocus
                required
                style={{
                  width: '100%',
                  boxSizing: 'border-box',
                  padding: '16px 16px 16px 48px',
                  backgroundColor: '#0D0E12',
                  border: '1px solid rgba(255,255,255,0.12)',
                  borderRadius: 14,
                  color: '#fff',
                  fontSize: 16,
                  outline: 'none',
                  transition: 'border-color 0.2s',
                  letterSpacing: 2
                }}
              />
            </div>

            {loginError && (
              <div style={{
                backgroundColor: 'rgba(239,68,68,0.12)',
                border: '1px solid rgba(239,68,68,0.3)',
                color: '#EF4444',
                padding: '10px 14px',
                borderRadius: 10,
                fontSize: 12,
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                textAlign: 'left'
              }}>
                <ShieldAlert size={16} />
                <span>{loginError}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={loggingIn || !passwordInput}
              style={{
                width: '100%',
                padding: '16px',
                borderRadius: 14,
                backgroundColor: '#BEF264',
                color: '#000',
                fontSize: 14,
                fontWeight: 900,
                textTransform: 'uppercase',
                letterSpacing: 1,
                border: 'none',
                cursor: (loggingIn || !passwordInput) ? 'not-allowed' : 'pointer',
                opacity: (loggingIn || !passwordInput) ? 0.6 : 1,
                boxShadow: '0 8px 25px rgba(190,242,100,0.3)',
                transition: 'all 0.2s',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8
              }}
            >
              {loggingIn ? 'Autenticando...' : (
                <>
                  <span>Desbloquear Painel</span>
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>

          <div style={{ marginTop: 24, fontSize: 11, color: '#475569' }}>
            🔒 Validação server-side com proteção contra força bruta
          </div>
        </div>
      </div>
    )
  }

  // ─── DASHBOARD PRINCIPAL (MODELO INLEAD) ──────────────────────
  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#F8FAFC',
      color: '#0F172A',
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
    }}>
      
      {/* ── HEADER SUPERIOR NO FORMATO INLEAD ── */}
      <header style={{
        backgroundColor: '#FFFFFF',
        borderBottom: '1px solid #E2E8F0',
        position: 'sticky',
        top: 0,
        zIndex: 50,
        boxShadow: '0 1px 3px rgba(0,0,0,0.03)'
      }}>
        <div style={{
          maxWidth: 1400,
          margin: '0 auto',
          padding: '0 20px',
          height: 64,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          {/* Logo & Marca */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <img
                src="/logo.png"
                alt="Nexa Fit Pro"
                style={{ height: 36, objectFit: 'contain' }}
                onError={(e) => { e.currentTarget.style.display = 'none' }}
              />
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontSize: 14, fontWeight: 900, letterSpacing: -0.5, color: '#0F172A', lineHeight: 1.1 }}>
                  NEXA <span style={{ color: '#65A30D' }}>FIT PRO</span>
                </span>
                <span style={{ fontSize: 10, fontWeight: 700, color: '#64748B', letterSpacing: 0.5, textTransform: 'uppercase' }}>
                  Analytics & Leads
                </span>
              </div>
            </div>

            {/* Separador */}
            <div style={{ width: 1, height: 24, backgroundColor: '#E2E8F0' }} />

            {/* Abas Superiores no estilo Inlead (Construtor, Fluxo, Design, Leads, etc.) */}
            <nav style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <button
                onClick={() => setActiveTab('leads')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '8px 16px',
                  borderRadius: 8,
                  fontSize: 13,
                  fontWeight: activeTab === 'leads' ? 700 : 500,
                  color: activeTab === 'leads' ? '#0F172A' : '#64748B',
                  backgroundColor: activeTab === 'leads' ? '#F1F5F9' : 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'all 0.15s'
                }}
              >
                <Users size={16} color={activeTab === 'leads' ? '#0F172A' : '#64748B'} />
                <span>Leads & Respostas</span>
              </button>

              <button
                onClick={() => setActiveTab('utms')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '8px 16px',
                  borderRadius: 8,
                  fontSize: 13,
                  fontWeight: activeTab === 'utms' ? 700 : 500,
                  color: activeTab === 'utms' ? '#0F172A' : '#64748B',
                  backgroundColor: activeTab === 'utms' ? '#F1F5F9' : 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'all 0.15s'
                }}
              >
                <BarChart2 size={16} color={activeTab === 'utms' ? '#0F172A' : '#64748B'} />
                <span>Campanhas & Criativos</span>
              </button>

              <button
                onClick={() => setActiveTab('remarketing')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '8px 16px',
                  borderRadius: 8,
                  fontSize: 13,
                  fontWeight: activeTab === 'remarketing' ? 700 : 500,
                  color: activeTab === 'remarketing' ? '#0F172A' : '#64748B',
                  backgroundColor: activeTab === 'remarketing' ? '#F1F5F9' : 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'all 0.15s',
                  position: 'relative'
                }}
              >
                <Mail size={16} color={activeTab === 'remarketing' ? '#0F172A' : '#64748B'} />
                <span>Remarketing Resend</span>
                {remarketingLeads.length > 0 && (
                  <span style={{
                    backgroundColor: '#BEF264',
                    color: '#000',
                    fontSize: 10,
                    fontWeight: 900,
                    padding: '2px 6px',
                    borderRadius: 99
                  }}>
                    {remarketingLeads.length}
                  </span>
                )}
              </button>

              <button
                onClick={() => setActiveTab('settings')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '8px 16px',
                  borderRadius: 8,
                  fontSize: 13,
                  fontWeight: activeTab === 'settings' ? 700 : 500,
                  color: activeTab === 'settings' ? '#0F172A' : '#64748B',
                  backgroundColor: activeTab === 'settings' ? '#F1F5F9' : 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'all 0.15s'
                }}
              >
                <Settings size={16} color={activeTab === 'settings' ? '#0F172A' : '#64748B'} />
                <span>Configurações & SQL</span>
              </button>
            </nav>
          </div>

          {/* Ações da Direita */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <button
              onClick={loadSessionsData}
              disabled={loading}
              title="Atualizar dados em tempo real"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                padding: '8px 14px',
                borderRadius: 8,
                fontSize: 12,
                fontWeight: 600,
                color: '#475569',
                backgroundColor: '#F8FAFC',
                border: '1px solid #E2E8F0',
                cursor: 'pointer',
                transition: 'background 0.2s'
              }}
            >
              <RefreshCw size={14} className={loading ? 'spin' : ''} />
              <span>{loading ? 'Atualizando...' : 'Atualizar'}</span>
            </button>

            <a
              href="/quiz"
              target="_blank"
              rel="noreferrer"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                padding: '8px 14px',
                borderRadius: 8,
                fontSize: 12,
                fontWeight: 600,
                color: '#475569',
                backgroundColor: '#F8FAFC',
                border: '1px solid #E2E8F0',
                textDecoration: 'none'
              }}
            >
              <PlayCircle size={14} />
              <span>Ver Quiz Ao Vivo</span>
            </a>

            <button
              onClick={handleExportCSV}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                padding: '8px 14px',
                borderRadius: 8,
                fontSize: 12,
                fontWeight: 600,
                color: '#0F172A',
                backgroundColor: '#F1F5F9',
                border: '1px solid #E2E8F0',
                cursor: 'pointer'
              }}
            >
              <Download size={14} />
              <span>Exportar CSV</span>
            </button>

            <button
              onClick={handleLogout}
              style={{
                padding: '8px 12px',
                borderRadius: 8,
                fontSize: 12,
                fontWeight: 600,
                color: '#EF4444',
                backgroundColor: 'rgba(239,68,68,0.06)',
                border: '1px solid rgba(239,68,68,0.2)',
                cursor: 'pointer'
              }}
            >
              Sair
            </button>
          </div>
        </div>
      </header>

      {/* ── CONTEÚDO PRINCIPAL DO DASHBOARD ── */}
      <main style={{ maxWidth: 1400, margin: '0 auto', padding: '28px 20px 80px 20px' }}>

        {/* ── CARDS DE MÉTRICAS EXATAMENTE COMO NA IMAGEM DA INLEAD ── */}
        <section style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
          gap: 16,
          marginBottom: 28
        }}>
          {/* Card 1: Visitantes */}
          <div style={{
            backgroundColor: '#FFFFFF',
            borderRadius: 14,
            padding: '20px 22px',
            border: '1px solid #E2E8F0',
            boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
          }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#64748B', letterSpacing: 0.5, textTransform: 'uppercase', marginBottom: 12 }}>
              VISITANTES
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
              <div style={{ width: 34, height: 34, borderRadius: 10, backgroundColor: '#F1F5F9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Eye size={18} color="#0F172A" />
              </div>
              <span style={{ fontSize: 32, fontWeight: 900, color: '#0F172A', letterSpacing: -1 }}>
                {metrics.visitors.toLocaleString('pt-BR')}
              </span>
            </div>
            <div style={{ fontSize: 12, color: '#64748B' }}>
              Visitantes que acessaram o funil
            </div>
          </div>

          {/* Card 2: Leads Adquiridos */}
          <div style={{
            backgroundColor: '#FFFFFF',
            borderRadius: 14,
            padding: '20px 22px',
            border: '1px solid #E2E8F0',
            boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
          }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#64748B', letterSpacing: 0.5, textTransform: 'uppercase', marginBottom: 12 }}>
              LEADS ADQUIRIDOS
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
              <div style={{ width: 34, height: 34, borderRadius: 10, backgroundColor: '#F1F5F9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Users size={18} color="#0F172A" />
              </div>
              <span style={{ fontSize: 32, fontWeight: 900, color: '#0F172A', letterSpacing: -1 }}>
                {metrics.leads.toLocaleString('pt-BR')}
              </span>
            </div>
            <div style={{ fontSize: 12, color: '#64748B' }}>
              Iniciaram alguma interação com o funil
            </div>
          </div>

          {/* Card 3: Taxa de Interação */}
          <div style={{
            backgroundColor: '#FFFFFF',
            borderRadius: 14,
            padding: '20px 22px',
            border: '1px solid #E2E8F0',
            boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
          }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#64748B', letterSpacing: 0.5, textTransform: 'uppercase', marginBottom: 12 }}>
              TAXA DE INTERAÇÃO
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
              <div style={{ width: 34, height: 34, borderRadius: 10, backgroundColor: '#ECFDF5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <TrendingUp size={18} color="#059669" />
              </div>
              <span style={{ fontSize: 32, fontWeight: 900, color: '#0F172A', letterSpacing: -1 }}>
                {metrics.interactionRate}
              </span>
            </div>
            <div style={{ fontSize: 12, color: '#64748B' }}>
              Visitantes que interagiram com o funil
            </div>
          </div>

          {/* Card 4: Leads Qualificados */}
          <div style={{
            backgroundColor: '#FFFFFF',
            borderRadius: 14,
            padding: '20px 22px',
            border: '1px solid #E2E8F0',
            boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
          }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#64748B', letterSpacing: 0.5, textTransform: 'uppercase', marginBottom: 12 }}>
              LEADS QUALIFICADOS
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
              <div style={{ width: 34, height: 34, borderRadius: 10, backgroundColor: '#FEF3C7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Target size={18} color="#D97706" />
              </div>
              <span style={{ fontSize: 32, fontWeight: 900, color: '#0F172A', letterSpacing: -1 }}>
                {metrics.qualifiedLeads.toLocaleString('pt-BR')}
              </span>
            </div>
            <div style={{ fontSize: 12, color: '#64748B' }}>
              +50% de etapas interagidas
            </div>
          </div>

          {/* Card 5: Fluxos Completos */}
          <div style={{
            backgroundColor: '#FFFFFF',
            borderRadius: 14,
            padding: '20px 22px',
            border: '1px solid #E2E8F0',
            boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
          }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#64748B', letterSpacing: 0.5, textTransform: 'uppercase', marginBottom: 12 }}>
              FLUXOS COMPLETOS
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
              <div style={{ width: 34, height: 34, borderRadius: 10, backgroundColor: '#F0FDF4', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <CheckCircle2 size={18} color="#16A34A" />
              </div>
              <span style={{ fontSize: 32, fontWeight: 900, color: '#0F172A', letterSpacing: -1 }}>
                {metrics.completeFlows.toLocaleString('pt-BR')}
              </span>
            </div>
            <div style={{ fontSize: 12, color: '#64748B' }}>
              Passaram da última etapa do funil
            </div>
          </div>

          {/* Card 6: Leads com Email (Remarketing) */}
          <div style={{
            backgroundColor: '#FFFFFF',
            borderRadius: 14,
            padding: '20px 22px',
            border: '1px solid #E2E8F0',
            boxShadow: '0 2px 4px rgba(0,0,0,0.02)',
            background: 'linear-gradient(180deg, #FFFFFF 0%, #F7FEE7 100%)'
          }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#4D7C0F', letterSpacing: 0.5, textTransform: 'uppercase', marginBottom: 12 }}>
              E-MAILS PARA REMARKETING
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
              <div style={{ width: 34, height: 34, borderRadius: 10, backgroundColor: '#ECFCCB', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Mail size={18} color="#4D7C0F" />
              </div>
              <span style={{ fontSize: 32, fontWeight: 900, color: '#0F172A', letterSpacing: -1 }}>
                {metrics.withEmail.toLocaleString('pt-BR')}
              </span>
            </div>
            <div style={{ fontSize: 12, color: '#4D7C0F', fontWeight: 600 }}>
              Leads prontos para envio diário Resend
            </div>
          </div>
        </section>

        {/* ── ABA 1: TABELA DE LEADS NO ESTILO INLEAD ── */}
        {activeTab === 'leads' && (
          <section style={{
            backgroundColor: '#FFFFFF',
            borderRadius: 16,
            border: '1px solid #E2E8F0',
            overflow: 'hidden',
            boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)'
          }}>
            {/* Barra de Filtros e Busca */}
            <div style={{
              padding: '18px 20px',
              borderBottom: '1px solid #E2E8F0',
              display: 'flex',
              flexWrap: 'wrap',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 12
            }}>
              {/* Input de Busca */}
              <div style={{ position: 'relative', minWidth: 280, flex: 1, maxWidth: 400 }}>
                <Search size={16} color="#94A3B8" style={{ position: 'absolute', left: 14, top: 12 }} />
                <input
                  type="text"
                  placeholder="Pesquisar por nome, email, UTM, criativo..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  style={{
                    width: '100%',
                    boxSizing: 'border-box',
                    padding: '10px 14px 10px 38px',
                    borderRadius: 10,
                    border: '1px solid #E2E8F0',
                    backgroundColor: '#F8FAFC',
                    fontSize: 13,
                    color: '#0F172A',
                    outline: 'none'
                  }}
                />
              </div>

              {/* Filtros em Linha */}
              <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
                {/* Filtro por Origem (utm_source) */}
                <select
                  value={filterSource}
                  onChange={(e) => setFilterSource(e.target.value)}
                  style={{
                    padding: '9px 12px',
                    borderRadius: 8,
                    border: '1px solid #E2E8F0',
                    backgroundColor: '#FFFFFF',
                    fontSize: 12,
                    color: '#334155',
                    outline: 'none'
                  }}
                >
                  <option value="todos">Todas as Origens</option>
                  {filterOptions.sources.map(src => (
                    <option key={src} value={src}>{src}</option>
                  ))}
                </select>

                {/* Filtro por Campanha (utm_campaign) */}
                <select
                  value={filterCampaign}
                  onChange={(e) => setFilterCampaign(e.target.value)}
                  style={{
                    padding: '9px 12px',
                    borderRadius: 8,
                    border: '1px solid #E2E8F0',
                    backgroundColor: '#FFFFFF',
                    fontSize: 12,
                    color: '#334155',
                    outline: 'none'
                  }}
                >
                  <option value="todas">Todas as Campanhas</option>
                  {filterOptions.campaigns.map(camp => (
                    <option key={camp} value={camp}>{camp}</option>
                  ))}
                </select>

                {/* Filtro por Criativo (utm_content) */}
                <select
                  value={filterCreative}
                  onChange={(e) => setFilterCreative(e.target.value)}
                  style={{
                    padding: '9px 12px',
                    borderRadius: 8,
                    border: '1px solid #E2E8F0',
                    backgroundColor: '#FFFFFF',
                    fontSize: 12,
                    color: '#334155',
                    outline: 'none'
                  }}
                >
                  <option value="todos">Todos os Criativos</option>
                  {filterOptions.creatives.map(cr => (
                    <option key={cr} value={cr}>{cr}</option>
                  ))}
                </select>

                {/* Filtro por Status */}
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  style={{
                    padding: '9px 12px',
                    borderRadius: 8,
                    border: '1px solid #E2E8F0',
                    backgroundColor: '#FFFFFF',
                    fontSize: 12,
                    color: '#334155',
                    outline: 'none'
                  }}
                >
                  <option value="todos">Todos os Status</option>
                  <option value="com_email">Com E-mail Capturado</option>
                  <option value="checkout">Chegou ao Checkout</option>
                  <option value="qualificados">Qualificados (+50%)</option>
                  <option value="abandono">Abandono no Início</option>
                </select>
              </div>
            </div>

            {/* TABELA NO FORMATO EXATO DA IMAGEM DA INLEAD */}
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: 1000 }}>
                <thead>
                  <tr style={{ backgroundColor: '#F8FAFC', borderBottom: '1px solid #E2E8F0' }}>
                    <th style={{ padding: '14px 18px', width: 40, fontSize: 12, fontWeight: 700, color: '#64748B' }}>
                      <input
                        type="checkbox"
                        checked={selectedIds.length > 0 && selectedIds.length === filteredSessions.length}
                        onChange={(e) => {
                          if (e.target.checked) setSelectedIds(filteredSessions.map(s => s.session_id))
                          else setSelectedIds([])
                        }}
                      />
                    </th>

                    {/* Coluna 1: Entrada */}
                    <th style={{ padding: '14px 18px', fontSize: 12, fontWeight: 800, color: '#334155', borderTop: '3px solid #64748B' }}>
                      Entrada
                    </th>

                    {/* Coluna 2: Início (Verde) */}
                    <th style={{ padding: '14px 18px', fontSize: 12, fontWeight: 800, color: '#16A34A', borderTop: '3px solid #16A34A' }}>
                      Início (Gênero/Idade)
                    </th>

                    {/* Coluna 3: Interesses (Verde) */}
                    <th style={{ padding: '14px 18px', fontSize: 12, fontWeight: 800, color: '#16A34A', borderTop: '3px solid #16A34A' }}>
                      Interesses & Local
                    </th>

                    {/* Coluna 4: Identificação de Perfil (Amarelo) */}
                    <th style={{ padding: '14px 18px', fontSize: 12, fontWeight: 800, color: '#D97706', borderTop: '3px solid #D97706' }}>
                      Identificação de Perfil
                    </th>

                    {/* Coluna 5: Rotina & Medidas (Laranja) */}
                    <th style={{ padding: '14px 18px', fontSize: 12, fontWeight: 800, color: '#EA580C', borderTop: '3px solid #EA580C' }}>
                      Rotina & Medidas
                    </th>

                    {/* Coluna 6: Contato Capturado */}
                    <th style={{ padding: '14px 18px', fontSize: 12, fontWeight: 800, color: '#2563EB', borderTop: '3px solid #2563EB' }}>
                      Contato (Lead)
                    </th>

                    {/* Coluna 7: Status & Ações */}
                    <th style={{ padding: '14px 18px', fontSize: 12, fontWeight: 800, color: '#475569', textAlign: 'right', borderTop: '3px solid #475569' }}>
                      Ações
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {filteredSessions.length === 0 ? (
                    <tr>
                      <td colSpan={8} style={{ padding: 60, textAlign: 'center', color: '#64748B' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
                          <Users size={36} color="#CBD5E1" />
                          <span style={{ fontSize: 15, fontWeight: 600 }}>Nenhuma sessão encontrada para os filtros selecionados.</span>
                          <span style={{ fontSize: 13, color: '#94A3B8' }}>
                            Assim que alguém acessar o funil ou responder perguntas no quiz, os dados aparecerão aqui em tempo real.
                          </span>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredSessions.map((session) => {
                      const isSelected = selectedIds.includes(session.session_id)
                      const ans = session.answers || {}
                      const dateFormatted = session.created_at
                        ? new Date(session.created_at).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })
                        : 'Recente'

                      return (
                        <tr
                          key={session.session_id}
                          style={{
                            borderBottom: '1px solid #F1F5F9',
                            backgroundColor: isSelected ? '#F8FAFC' : '#FFFFFF',
                            transition: 'background-color 0.1s'
                          }}
                        >
                          <td style={{ padding: '16px 18px' }}>
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={(e) => {
                                if (e.target.checked) setSelectedIds(prev => [...prev, session.session_id])
                                else setSelectedIds(prev => prev.filter(id => id !== session.session_id))
                              }}
                            />
                          </td>

                          {/* Entrada */}
                          <td style={{ padding: '16px 18px' }}>
                            <div style={{ fontSize: 12, fontWeight: 700, color: '#0F172A', marginBottom: 4 }}>
                              {dateFormatted}
                            </div>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                              <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 6px', borderRadius: 4, backgroundColor: '#F1F5F9', color: '#475569' }}>
                                {session.utm_source || 'Direto'}
                              </span>
                              {session.utm_content && (
                                <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 6px', borderRadius: 4, backgroundColor: '#FEF3C7', color: '#92400E' }}>
                                  🎨 {session.utm_content}
                                </span>
                              )}
                            </div>
                          </td>

                          {/* Início (Gênero / Idade) */}
                          <td style={{ padding: '16px 18px' }}>
                            <div style={{ fontSize: 13, fontWeight: 600, color: '#0F172A' }}>
                              {session.gender === 'male' ? '👨 Homem' : (session.gender === 'female' ? '👩 Mulher' : '—')}
                            </div>
                            <div style={{ fontSize: 11, color: '#64748B', marginTop: 2 }}>
                              {session.age ? `${session.age} anos` : 'Idade não informada'}
                            </div>
                          </td>

                          {/* Interesses & Local */}
                          <td style={{ padding: '16px 18px' }}>
                            <div style={{ fontSize: 13, fontWeight: 600, color: '#0F172A' }}>
                              {session.goal ? (
                                session.goal === 'emagrecer' ? '🔥 Secar até 15kg' :
                                session.goal === 'massa' ? '💪 Ganhar Massa' :
                                session.goal === 'definir' ? '✨ Definir Abdômen' :
                                session.goal === 'saude' ? '❤️ Vigor & Saúde' : session.goal
                              ) : '—'}
                            </div>
                            <div style={{ fontSize: 11, color: '#64748B', marginTop: 2 }}>
                              {session.location === 'casa' ? '🏠 Em Casa' : session.location === 'academia' ? '🏋️ Na Academia' : session.location || '—'}
                            </div>
                          </td>

                          {/* Identificação de Perfil */}
                          <td style={{ padding: '16px 18px' }}>
                            <div style={{ fontSize: 12, fontWeight: 600, color: '#0F172A' }}>
                              {session.body_type ? `Corpo: ${session.body_type}` : '—'}
                            </div>
                            <div style={{ fontSize: 11, color: '#64748B', marginTop: 2 }}>
                              {session.dream_body ? `Meta: ${session.dream_body}` : ''}
                            </div>
                          </td>

                          {/* Rotina & Medidas */}
                          <td style={{ padding: '16px 18px' }}>
                            <div style={{ fontSize: 12, color: '#334155' }}>
                              {session.current_weight ? `Peso: ${session.current_weight}` : ''} {session.target_weight ? `➔ Meta: ${session.target_weight}` : ''}
                            </div>
                            <div style={{ fontSize: 11, color: '#64748B', marginTop: 2 }}>
                              {session.highest_screen ? `Tela: ${session.highest_screen}` : ''}
                            </div>
                          </td>

                          {/* Contato (Lead) */}
                          <td style={{ padding: '16px 18px' }}>
                            {session.email ? (
                              <div>
                                <div style={{ fontSize: 13, fontWeight: 700, color: '#2563EB' }}>
                                  {session.email}
                                </div>
                                <div style={{ fontSize: 11, fontWeight: 600, color: '#475569', marginTop: 2 }}>
                                  {session.name || 'Sem nome informado'}
                                </div>
                              </div>
                            ) : (
                              <span style={{ fontSize: 11, color: '#94A3B8', fontStyle: 'italic' }}>
                                Não informou e-mail
                              </span>
                            )}
                          </td>

                          {/* Ações */}
                          <td style={{ padding: '16px 18px', textAlign: 'right' }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 6 }}>
                              <button
                                onClick={() => setSelectedLead(session)}
                                style={{
                                  padding: '6px 10px',
                                  borderRadius: 6,
                                  border: '1px solid #E2E8F0',
                                  backgroundColor: '#F8FAFC',
                                  fontSize: 12,
                                  fontWeight: 600,
                                  color: '#0F172A',
                                  cursor: 'pointer'
                                }}
                              >
                                Ver Raio-X
                              </button>

                              {session.email && (
                                <button
                                  onClick={() => handleSendRecoveryEmail(session)}
                                  disabled={sendingEmail}
                                  title="Enviar e-mail de recuperação via Resend"
                                  style={{
                                    padding: '6px 10px',
                                    borderRadius: 6,
                                    border: 'none',
                                    backgroundColor: '#BEF264',
                                    color: '#000',
                                    fontSize: 12,
                                    fontWeight: 800,
                                    cursor: 'pointer'
                                  }}
                                >
                                  ✉️ Recuperar
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      )
                    })
                  )}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {/* ── ABA 2: ANÁLISE DE CAMPANHAS & CRIATIVOS (UTMs) ── */}
        {activeTab === 'utms' && (
          <section style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            {/* Banner de Rastreamento de Tráfego */}
            <div style={{
              backgroundColor: '#FFFFFF',
              borderRadius: 16,
              padding: 24,
              border: '1px solid #E2E8F0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 20
            }}>
              <div>
                <h3 style={{ margin: '0 0 6px 0', fontSize: 18, fontWeight: 800, color: '#0F172A' }}>
                  Análise de Desempenho por Anúncio & Criativo
                </h3>
                <p style={{ margin: 0, fontSize: 13, color: '#64748B' }}>
                  Descubra quais criativos (`utm_content`) e campanhas (`utm_campaign`) trazem mais conversão, leads qualificados e checkouts iniciados.
                </p>
              </div>

              <div style={{ display: 'flex', gap: 12 }}>
                <div style={{ padding: '10px 16px', borderRadius: 10, backgroundColor: '#F8FAFC', border: '1px solid #E2E8F0', textAlign: 'center' }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: '#64748B' }}>CRIATIVOS ATIVOS</div>
                  <div style={{ fontSize: 20, fontWeight: 900, color: '#0F172A' }}>{creativeMetrics.length}</div>
                </div>
                <div style={{ padding: '10px 16px', borderRadius: 10, backgroundColor: '#F8FAFC', border: '1px solid #E2E8F0', textAlign: 'center' }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: '#64748B' }}>CAMPANHAS</div>
                  <div style={{ fontSize: 20, fontWeight: 900, color: '#0F172A' }}>{campaignMetrics.length}</div>
                </div>
              </div>
            </div>

            {/* Tabela de Criativos (utm_content) */}
            <div style={{ backgroundColor: '#FFFFFF', borderRadius: 16, border: '1px solid #E2E8F0', overflow: 'hidden' }}>
              <div style={{ padding: '16px 20px', borderBottom: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', gap: 8 }}>
                <Flame size={18} color="#EA580C" />
                <h4 style={{ margin: 0, fontSize: 15, fontWeight: 800, color: '#0F172A' }}>
                  Performance por Criativo de Anúncio (`utm_content`)
                </h4>
              </div>

              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                  <thead>
                    <tr style={{ backgroundColor: '#F8FAFC', borderBottom: '1px solid #E2E8F0' }}>
                      <th style={{ padding: '12px 18px', fontSize: 12, fontWeight: 700, color: '#64748B' }}>Criativo / Anúncio</th>
                      <th style={{ padding: '12px 18px', fontSize: 12, fontWeight: 700, color: '#64748B' }}>Acessos (Cliques)</th>
                      <th style={{ padding: '12px 18px', fontSize: 12, fontWeight: 700, color: '#64748B' }}>Iniciaram Quiz</th>
                      <th style={{ padding: '12px 18px', fontSize: 12, fontWeight: 700, color: '#64748B' }}>Qualificados (+50%)</th>
                      <th style={{ padding: '12px 18px', fontSize: 12, fontWeight: 700, color: '#64748B' }}>E-mails Capturados</th>
                      <th style={{ padding: '12px 18px', fontSize: 12, fontWeight: 700, color: '#64748B' }}>Checkouts</th>
                      <th style={{ padding: '12px 18px', fontSize: 12, fontWeight: 700, color: '#64748B' }}>Taxa de E-mail</th>
                    </tr>
                  </thead>
                  <tbody>
                    {creativeMetrics.map((cr) => {
                      const emailRate = cr.visits > 0 ? ((cr.withEmail / cr.visits) * 100).toFixed(1) + '%' : '0%'
                      return (
                        <tr key={cr.name} style={{ borderBottom: '1px solid #F1F5F9' }}>
                          <td style={{ padding: '14px 18px', fontSize: 13, fontWeight: 700, color: '#0F172A' }}>
                            {cr.name}
                          </td>
                          <td style={{ padding: '14px 18px', fontSize: 13, fontWeight: 600 }}>{cr.visits}</td>
                          <td style={{ padding: '14px 18px', fontSize: 13 }}>{cr.interacted}</td>
                          <td style={{ padding: '14px 18px', fontSize: 13, color: '#D97706', fontWeight: 600 }}>{cr.qualified}</td>
                          <td style={{ padding: '14px 18px', fontSize: 13, color: '#2563EB', fontWeight: 700 }}>{cr.withEmail}</td>
                          <td style={{ padding: '14px 18px', fontSize: 13, color: '#16A34A', fontWeight: 700 }}>{cr.checkout}</td>
                          <td style={{ padding: '14px 18px', fontSize: 13, fontWeight: 800, color: '#059669' }}>{emailRate}</td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Tabela de Campanhas (utm_campaign) */}
            <div style={{ backgroundColor: '#FFFFFF', borderRadius: 16, border: '1px solid #E2E8F0', overflow: 'hidden' }}>
              <div style={{ padding: '16px 20px', borderBottom: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', gap: 8 }}>
                <Target size={18} color="#2563EB" />
                <h4 style={{ margin: 0, fontSize: 15, fontWeight: 800, color: '#0F172A' }}>
                  Performance por Campanha (`utm_campaign`)
                </h4>
              </div>

              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                  <thead>
                    <tr style={{ backgroundColor: '#F8FAFC', borderBottom: '1px solid #E2E8F0' }}>
                      <th style={{ padding: '12px 18px', fontSize: 12, fontWeight: 700, color: '#64748B' }}>Nome da Campanha</th>
                      <th style={{ padding: '12px 18px', fontSize: 12, fontWeight: 700, color: '#64748B' }}>Acessos</th>
                      <th style={{ padding: '12px 18px', fontSize: 12, fontWeight: 700, color: '#64748B' }}>E-mails Capturados</th>
                      <th style={{ padding: '12px 18px', fontSize: 12, fontWeight: 700, color: '#64748B' }}>Checkouts Abertos</th>
                    </tr>
                  </thead>
                  <tbody>
                    {campaignMetrics.map((camp) => (
                      <tr key={camp.name} style={{ borderBottom: '1px solid #F1F5F9' }}>
                        <td style={{ padding: '14px 18px', fontSize: 13, fontWeight: 700, color: '#0F172A' }}>{camp.name}</td>
                        <td style={{ padding: '14px 18px', fontSize: 13, fontWeight: 600 }}>{camp.visits}</td>
                        <td style={{ padding: '14px 18px', fontSize: 13, color: '#2563EB', fontWeight: 700 }}>{camp.withEmail}</td>
                        <td style={{ padding: '14px 18px', fontSize: 13, color: '#16A34A', fontWeight: 700 }}>{camp.checkout}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </section>
        )}

        {/* ── ABA 3: REMARKETING & AUTOMAÇÃO DE E-MAILS (RESEND) ── */}
        {activeTab === 'remarketing' && (
          <section style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            {/* Configuração da Chave do Resend */}
            <div style={{
              backgroundColor: '#FFFFFF',
              borderRadius: 16,
              padding: 24,
              border: '1px solid #E2E8F0',
              display: 'flex',
              flexWrap: 'wrap',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 16
            }}>
              <div style={{ maxWidth: 500 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                  <Mail size={18} color="#65A30D" />
                  <h3 style={{ margin: 0, fontSize: 16, fontWeight: 800, color: '#0F172A' }}>
                    Integração Resend API (Recuperação Diária)
                  </h3>
                </div>
                <p style={{ margin: 0, fontSize: 13, color: '#64748B' }}>
                  Insira sua chave da Resend (ex: <code style={{ backgroundColor: '#F1F5F9', padding: '2px 4px', borderRadius: 4 }}>re_123456...</code>) para enviar e-mails diretamente para a caixa de entrada dos leads que ainda não compraram.
                </p>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1, minWidth: 280, maxWidth: 450 }}>
                <input
                  type="password"
                  placeholder="re_xxxxxxxxxxxxxxxxx"
                  value={resendApiKey}
                  onChange={(e) => handleSaveResendKey(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '12px 14px',
                    borderRadius: 10,
                    border: '1px solid #CBD5E1',
                    fontSize: 13,
                    fontFamily: 'monospace',
                    outline: 'none'
                  }}
                />
                <button
                  onClick={() => alert('Chave do Resend configurada com sucesso!')}
                  style={{
                    padding: '12px 18px',
                    borderRadius: 10,
                    backgroundColor: '#0F172A',
                    color: '#fff',
                    fontSize: 13,
                    fontWeight: 700,
                    border: 'none',
                    cursor: 'pointer',
                    whiteSpace: 'nowrap'
                  }}
                >
                  Salvar
                </button>
              </div>
            </div>

            {/* Seletor de Sequência de E-mails Prontos */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
              {Object.values(RECOVERY_TEMPLATES).map((tpl) => {
                const isSelected = selectedTemplate === tpl.id
                return (
                  <div
                    key={tpl.id}
                    onClick={() => handleTemplateChange(tpl.id)}
                    style={{
                      backgroundColor: '#FFFFFF',
                      borderRadius: 14,
                      padding: 20,
                      border: isSelected ? '2px solid #BEF264' : '1px solid #E2E8F0',
                      cursor: 'pointer',
                      transition: 'all 0.15s',
                      boxShadow: isSelected ? '0 4px 15px rgba(190,242,100,0.2)' : 'none'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                      <span style={{
                        fontSize: 11,
                        fontWeight: 800,
                        color: tpl.badgeColor,
                        backgroundColor: `${tpl.badgeColor}15`,
                        padding: '4px 8px',
                        borderRadius: 6
                      }}>
                        {tpl.tag}
                      </span>
                      {isSelected && <Check size={16} color="#65A30D" />}
                    </div>
                    <div style={{ fontSize: 14, fontWeight: 800, color: '#0F172A', marginBottom: 6 }}>
                      {tpl.title}
                    </div>
                    <div style={{ fontSize: 12, color: '#64748B', lineHeight: 1.4 }}>
                      Assunto: {tpl.subject.replace('{nome}', 'Aluno')}
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Editor & Visualizador do E-mail Selecionado */}
            <div style={{
              backgroundColor: '#FFFFFF',
              borderRadius: 16,
              padding: 24,
              border: '1px solid #E2E8F0'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
                <div>
                  <h4 style={{ margin: '0 0 4px 0', fontSize: 16, fontWeight: 800, color: '#0F172A' }}>
                    Personalizar E-mail de Recuperação ({RECOVERY_TEMPLATES[selectedTemplate].tag})
                  </h4>
                  <span style={{ fontSize: 12, color: '#64748B' }}>
                    Variáveis disponíveis: <code style={{ color: '#2563EB' }}>{'{nome}'}</code>, <code style={{ color: '#2563EB' }}>{'{objetivo}'}</code>
                  </span>
                </div>

                <button
                  onClick={handleBatchSend}
                  disabled={batchProgress !== null}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    padding: '12px 20px',
                    borderRadius: 10,
                    backgroundColor: '#BEF264',
                    color: '#000',
                    fontSize: 13,
                    fontWeight: 900,
                    border: 'none',
                    cursor: batchProgress !== null ? 'not-allowed' : 'pointer',
                    boxShadow: '0 4px 15px rgba(190,242,100,0.3)'
                  }}
                >
                  <Send size={15} />
                  <span>Disparar para Todos os Pendentes ({remarketingLeads.length})</span>
                </button>
              </div>

              {batchProgress && (
                <div style={{
                  padding: 16,
                  borderRadius: 10,
                  backgroundColor: '#F8FAFC',
                  border: '1px solid #E2E8F0',
                  marginBottom: 20
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, fontWeight: 700, marginBottom: 8 }}>
                    <span>Disparando e-mails em lote...</span>
                    <span>{batchProgress.current} de {batchProgress.total}</span>
                  </div>
                  <div style={{ width: '100%', height: 8, backgroundColor: '#E2E8F0', borderRadius: 99, overflow: 'hidden' }}>
                    <div style={{
                      width: `${(batchProgress.current / batchProgress.total) * 100}%`,
                      height: '100%',
                      backgroundColor: '#65A30D',
                      transition: 'width 0.3s'
                    }} />
                  </div>
                </div>
              )}

              {emailStatusMsg && (
                <div style={{
                  padding: '12px 16px',
                  borderRadius: 10,
                  marginBottom: 20,
                  backgroundColor: emailStatusMsg.type === 'success' ? '#ECFDF5' : '#FEF2F2',
                  border: `1px solid ${emailStatusMsg.type === 'success' ? '#A7F3D0' : '#FECACA'}`,
                  color: emailStatusMsg.type === 'success' ? '#065F46' : '#991B1B',
                  fontSize: 13,
                  fontWeight: 600
                }}>
                  {emailStatusMsg.text}
                </div>
              )}

              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#475569', marginBottom: 6 }}>
                    Assunto do E-mail
                  </label>
                  <input
                    type="text"
                    value={customSubject}
                    onChange={(e) => setCustomSubject(e.target.value)}
                    style={{
                      width: '100%',
                      boxSizing: 'border-box',
                      padding: '12px 14px',
                      borderRadius: 10,
                      border: '1px solid #E2E8F0',
                      fontSize: 14,
                      fontWeight: 600,
                      outline: 'none'
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#475569', marginBottom: 6 }}>
                    Corpo da Mensagem (Texto Persuasivo)
                  </label>
                  <textarea
                    rows={8}
                    value={customBody}
                    onChange={(e) => setCustomBody(e.target.value)}
                    style={{
                      width: '100%',
                      boxSizing: 'border-box',
                      padding: '14px',
                      borderRadius: 10,
                      border: '1px solid #E2E8F0',
                      fontSize: 13,
                      lineHeight: 1.6,
                      fontFamily: 'inherit',
                      outline: 'none'
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Lista de Leads com E-mail Capturado para Remarketing */}
            <div style={{ backgroundColor: '#FFFFFF', borderRadius: 16, border: '1px solid #E2E8F0', overflow: 'hidden' }}>
              <div style={{ padding: '16px 20px', borderBottom: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <h4 style={{ margin: 0, fontSize: 15, fontWeight: 800, color: '#0F172A' }}>
                  Fila de Leads para Recuperação Diária ({remarketingLeads.length})
                </h4>
                <span style={{ fontSize: 12, color: '#64748B' }}>
                  Usuários que digitaram o e-mail no quiz
                </span>
              </div>

              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                  <thead>
                    <tr style={{ backgroundColor: '#F8FAFC', borderBottom: '1px solid #E2E8F0' }}>
                      <th style={{ padding: '12px 18px', fontSize: 12, fontWeight: 700, color: '#64748B' }}>Nome & E-mail</th>
                      <th style={{ padding: '12px 18px', fontSize: 12, fontWeight: 700, color: '#64748B' }}>Objetivo Selecionado</th>
                      <th style={{ padding: '12px 18px', fontSize: 12, fontWeight: 700, color: '#64748B' }}>Criativo de Origem</th>
                      <th style={{ padding: '12px 18px', fontSize: 12, fontWeight: 700, color: '#64748B' }}>Status de Envio</th>
                      <th style={{ padding: '12px 18px', fontSize: 12, fontWeight: 700, color: '#64748B', textAlign: 'right' }}>Ação Rápida</th>
                    </tr>
                  </thead>
                  <tbody>
                    {remarketingLeads.map((lead) => (
                      <tr key={lead.session_id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                        <td style={{ padding: '14px 18px' }}>
                          <div style={{ fontSize: 13, fontWeight: 700, color: '#0F172A' }}>{lead.name || 'Atleta'}</div>
                          <div style={{ fontSize: 12, color: '#2563EB', fontWeight: 600 }}>{lead.email}</div>
                        </td>
                        <td style={{ padding: '14px 18px', fontSize: 13, color: '#334155' }}>
                          {lead.goal || 'Transformação corporal'}
                        </td>
                        <td style={{ padding: '14px 18px', fontSize: 12, color: '#64748B' }}>
                          {lead.utm_content || lead.utm_source || 'Direto'}
                        </td>
                        <td style={{ padding: '14px 18px' }}>
                          <span style={{
                            fontSize: 11,
                            fontWeight: 700,
                            padding: '3px 8px',
                            borderRadius: 6,
                            backgroundColor: lead.recovery_status?.startsWith('sent_') ? '#DCFCE7' : '#FEF3C7',
                            color: lead.recovery_status?.startsWith('sent_') ? '#166534' : '#92400E'
                          }}>
                            {lead.recovery_status?.startsWith('sent_') ? `✓ Enviado (${lead.recovery_status})` : 'Pendente de envio'}
                          </span>
                        </td>
                        <td style={{ padding: '14px 18px', textAlign: 'right' }}>
                          <button
                            onClick={() => handleSendRecoveryEmail(lead)}
                            disabled={sendingEmail}
                            style={{
                              padding: '6px 14px',
                              borderRadius: 8,
                              backgroundColor: '#BEF264',
                              color: '#000',
                              fontSize: 12,
                              fontWeight: 800,
                              border: 'none',
                              cursor: 'pointer'
                            }}
                          >
                            Enviar Agora
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </section>
        )}

        {/* ── ABA 4: CONFIGURAÇÕES & SCRIPT SQL SUPABASE ── */}
        {activeTab === 'settings' && (
          <section style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            <div style={{ backgroundColor: '#FFFFFF', borderRadius: 16, padding: 24, border: '1px solid #E2E8F0' }}>
              <h3 style={{ margin: '0 0 8px 0', fontSize: 18, fontWeight: 800, color: '#0F172A' }}>
                Script SQL para Criar a Tabela no Supabase
              </h3>
              <p style={{ margin: '0 0 18px 0', fontSize: 13, color: '#64748B' }}>
                Copie o script abaixo e execute no <strong>SQL Editor</strong> do seu painel Supabase para ativar a sincronização em nuvem e histórico perpétuo de sessões:
              </p>

              <button
                onClick={copySqlScript}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '10px 16px',
                  borderRadius: 8,
                  backgroundColor: sqlCopied ? '#16A34A' : '#0F172A',
                  color: '#fff',
                  fontSize: 13,
                  fontWeight: 700,
                  border: 'none',
                  cursor: 'pointer',
                  marginBottom: 16,
                  transition: 'background 0.2s'
                }}
              >
                {sqlCopied ? <Check size={16} /> : <Copy size={16} />}
                <span>{sqlCopied ? 'SQL Copiado com Sucesso!' : 'Copiar Script SQL'}</span>
              </button>

              <pre style={{
                backgroundColor: '#0F1115',
                color: '#BEF264',
                padding: 16,
                borderRadius: 10,
                fontSize: 12,
                overflowX: 'auto',
                lineHeight: 1.5,
                margin: 0
              }}>
{`CREATE TABLE IF NOT EXISTS public.quiz_sessions (
  id text PRIMARY KEY,
  session_id text UNIQUE NOT NULL,
  email text,
  name text,
  gender text,
  age text,
  goal text,
  location text,
  body_type text,
  dream_body text,
  highest_screen text,
  step_number integer DEFAULT 0,
  total_steps integer DEFAULT 32,
  status text DEFAULT 'in_progress',
  answers jsonb DEFAULT '{}',
  utm_source text,
  utm_medium text,
  utm_campaign text,
  utm_content text,
  recovery_status text DEFAULT 'pending',
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now())
);
ALTER TABLE public.quiz_sessions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "quiz_sessions_all" ON public.quiz_sessions FOR ALL USING (true);`}
              </pre>
            </div>
          </section>
        )}
      </main>

      {/* ── MODAL RAIO-X COMPLETO DO LEAD SELECIONADO ── */}
      {selectedLead && (
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(0,0,0,0.6)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 20,
          zIndex: 100
        }}>
          <div style={{
            backgroundColor: '#FFFFFF',
            borderRadius: 20,
            maxWidth: 680,
            width: '100%',
            maxHeight: '90vh',
            overflowY: 'auto',
            padding: 28,
            boxShadow: '0 25px 60px rgba(0,0,0,0.3)',
            position: 'relative'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20, borderBottom: '1px solid #E2E8F0', paddingBottom: 16 }}>
              <div>
                <span style={{ fontSize: 11, fontWeight: 800, color: '#65A30D', textTransform: 'uppercase' }}>
                  Ficha Completa do Visitante
                </span>
                <h3 style={{ margin: '4px 0 0 0', fontSize: 20, fontWeight: 800, color: '#0F172A' }}>
                  {selectedLead.name || 'Visitante Anônimo'}
                </h3>
              </div>

              <button
                onClick={() => setSelectedLead(null)}
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 8,
                  border: '1px solid #E2E8F0',
                  backgroundColor: '#F8FAFC',
                  cursor: 'pointer',
                  fontSize: 16,
                  fontWeight: 700
                }}
              >
                ✕
              </button>
            </div>

            {/* 1. Origem & Tráfego Pago (UTMs) */}
            <div style={{ marginBottom: 20, padding: 16, borderRadius: 12, backgroundColor: '#F8FAFC', border: '1px solid #E2E8F0' }}>
              <div style={{ fontSize: 11, fontWeight: 800, color: '#64748B', textTransform: 'uppercase', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 6 }}>
                <span>📢</span> ORIGEM, CAMPANHA & DISPOSITIVO (UTMs)
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 10, fontSize: 12 }}>
                <div><span style={{ color: '#64748B', display: 'block' }}>Origem (utm_source):</span> <strong style={{ color: '#0F172A' }}>{selectedLead.utm_source || 'Direto'}</strong></div>
                <div><span style={{ color: '#64748B', display: 'block' }}>Campanha:</span> <strong style={{ color: '#0F172A' }}>{selectedLead.utm_campaign || 'Orgânico'}</strong></div>
                <div><span style={{ color: '#64748B', display: 'block' }}>Criativo (utm_content):</span> <strong style={{ color: '#D97706' }}>{selectedLead.utm_content || 'Padrão'}</strong></div>
                <div><span style={{ color: '#64748B', display: 'block' }}>Dispositivo:</span> <strong style={{ color: '#0F172A' }}>{selectedLead.device_type || 'Desktop'}</strong></div>
                <div><span style={{ color: '#64748B', display: 'block' }}>Data/Hora de Entrada:</span> <strong style={{ color: '#0F172A' }}>{selectedLead.created_at ? new Date(selectedLead.created_at).toLocaleString('pt-BR') : 'Hoje'}</strong></div>
                <div><span style={{ color: '#64748B', display: 'block' }}>Etapa Mais Alta:</span> <strong style={{ color: '#16A34A' }}>{selectedLead.highest_screen || 'Início'}</strong></div>
              </div>
            </div>

            {/* Helper de respostas */}
            {(() => {
              const ans = selectedLead.answers || {}
              return (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 18, marginBottom: 24 }}>
                  {/* Bloco 1: Perfil & Local */}
                  <div style={{ border: '1px solid #E2E8F0', borderRadius: 12, padding: 16 }}>
                    <div style={{ fontSize: 12, fontWeight: 800, color: '#16A34A', textTransform: 'uppercase', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span>🎯</span> 1. Perfil & Objetivos
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12, fontSize: 13 }}>
                      <div>
                        <span style={{ color: '#64748B', fontSize: 11, display: 'block' }}>Gênero:</span>
                        <strong>{selectedLead.gender === 'male' ? '👨 Homem' : selectedLead.gender === 'female' ? '👩 Mulher' : 'Não informado'}</strong>
                      </div>
                      <div>
                        <span style={{ color: '#64748B', fontSize: 11, display: 'block' }}>Idade:</span>
                        <strong>{selectedLead.age ? `${selectedLead.age} anos` : 'Não informada'}</strong>
                      </div>
                      <div>
                        <span style={{ color: '#64748B', fontSize: 11, display: 'block' }}>Objetivo #1:</span>
                        <strong style={{ color: '#EA580C' }}>{formatVal('goals', ans.goal || selectedLead.goal) || 'Não informado'}</strong>
                      </div>
                      <div>
                        <span style={{ color: '#64748B', fontSize: 11, display: 'block' }}>Local de Treino:</span>
                        <strong>{formatVal('location', ans.location || selectedLead.location) || 'Não informado'}</strong>
                      </div>
                      <div style={{ gridColumn: '1 / -1' }}>
                        <span style={{ color: '#64748B', fontSize: 11, display: 'block' }}>Metas Secundárias:</span>
                        <strong>{formatVal('secondaryGoals', ans.secondaryGoals) || 'Nenhuma selecionada'}</strong>
                      </div>
                    </div>
                  </div>

                  {/* Bloco 2: Atividade & Treino */}
                  <div style={{ border: '1px solid #E2E8F0', borderRadius: 12, padding: 16 }}>
                    <div style={{ fontSize: 12, fontWeight: 800, color: '#2563EB', textTransform: 'uppercase', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span>🏋️</span> 2. Atividade Física & Músculos
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12, fontSize: 13 }}>
                      <div>
                        <span style={{ color: '#64748B', fontSize: 11, display: 'block' }}>Experiência Prévia:</span>
                        <strong>{formatVal('experience', ans.experience) || 'Não informado'}</strong>
                      </div>
                      <div>
                        <span style={{ color: '#64748B', fontSize: 11, display: 'block' }}>Frequência Pretendida:</span>
                        <strong>{formatVal('frequency', ans.frequency) || 'Não informada'}</strong>
                      </div>
                      <div>
                        <span style={{ color: '#64748B', fontSize: 11, display: 'block' }}>Teste de Prancha:</span>
                        <strong>{formatVal('plank', ans.plank) || 'Não informado'}</strong>
                      </div>
                      <div>
                        <span style={{ color: '#64748B', fontSize: 11, display: 'block' }}>Gosta de Música no Treino:</span>
                        <strong>{formatVal('likesMusic', ans.likesMusic) || 'Não informado'}</strong>
                      </div>
                      {ans.music && (
                        <div>
                          <span style={{ color: '#64748B', fontSize: 11, display: 'block' }}>Estilo Musical:</span>
                          <strong>{formatVal('music', ans.music)}</strong>
                        </div>
                      )}
                      <div style={{ gridColumn: '1 / -1' }}>
                        <span style={{ color: '#64748B', fontSize: 11, display: 'block' }}>Regiões Musculares de Foco:</span>
                        <strong>{formatVal('focusZones', ans.focusZones) || 'Não informado'}</strong>
                      </div>
                    </div>
                  </div>

                  {/* Bloco 3: Medidas Corporais & IMC */}
                  <div style={{ border: '1px solid #E2E8F0', borderRadius: 12, padding: 16 }}>
                    <div style={{ fontSize: 12, fontWeight: 800, color: '#D97706', textTransform: 'uppercase', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span>📏</span> 3. Medidas & Composição Corporal
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12, fontSize: 13 }}>
                      <div>
                        <span style={{ color: '#64748B', fontSize: 11, display: 'block' }}>Corpo Atual:</span>
                        <strong>{formatVal('bodyTypes', ans.bodyType || selectedLead.body_type) || 'Não informado'}</strong>
                      </div>
                      <div>
                        <span style={{ color: '#64748B', fontSize: 11, display: 'block' }}>Físico Desejado:</span>
                        <strong>{formatVal('dreamBodies', ans.dreamBody || selectedLead.dream_body) || 'Não informado'}</strong>
                      </div>
                      <div>
                        <span style={{ color: '#64748B', fontSize: 11, display: 'block' }}>Peso Atual:</span>
                        <strong>{ans.weight ? `${ans.weight} kg` : selectedLead.current_weight || '—'}</strong>
                      </div>
                      <div>
                        <span style={{ color: '#64748B', fontSize: 11, display: 'block' }}>Altura:</span>
                        <strong>{ans.height ? `${ans.height} cm` : selectedLead.height || '—'}</strong>
                      </div>
                      <div>
                        <span style={{ color: '#64748B', fontSize: 11, display: 'block' }}>IMC Calculado:</span>
                        <strong style={{ color: '#EA580C' }}>{ans.imc || selectedLead.imc || '—'}</strong>
                      </div>
                      <div>
                        <span style={{ color: '#64748B', fontSize: 11, display: 'block' }}>Meta de Peso:</span>
                        <strong style={{ color: '#16A34A' }}>{ans.goalWeight ? `${ans.goalWeight} kg` : selectedLead.target_weight || '—'}</strong>
                      </div>
                    </div>
                  </div>

                  {/* Bloco 4: Rotina, Sono & Dieta */}
                  <div style={{ border: '1px solid #E2E8F0', borderRadius: 12, padding: 16 }}>
                    <div style={{ fontSize: 12, fontWeight: 800, color: '#7C3AED', textTransform: 'uppercase', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span>🥗</span> 4. Rotina, Sono, Água & Dieta
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12, fontSize: 13 }}>
                      <div>
                        <span style={{ color: '#64748B', fontSize: 11, display: 'block' }}>Rotina de Trabalho:</span>
                        <strong>{formatVal('workRoutine', ans.workRoutine) || 'Não informada'}</strong>
                      </div>
                      <div>
                        <span style={{ color: '#64748B', fontSize: 11, display: 'block' }}>Maior Parte do Dia:</span>
                        <strong>{formatVal('typicalDay', ans.typicalDay) || 'Não informado'}</strong>
                      </div>
                      <div>
                        <span style={{ color: '#64748B', fontSize: 11, display: 'block' }}>Nível de Disposição:</span>
                        <strong>{formatVal('energy', ans.energy) || 'Não informado'}</strong>
                      </div>
                      <div>
                        <span style={{ color: '#64748B', fontSize: 11, display: 'block' }}>Consumo de Água:</span>
                        <strong>{formatVal('water', ans.water) || 'Não informado'}</strong>
                      </div>
                      <div>
                        <span style={{ color: '#64748B', fontSize: 11, display: 'block' }}>Horas de Sono:</span>
                        <strong>{formatVal('sleep', ans.sleep) || 'Não informado'}</strong>
                      </div>
                      <div>
                        <span style={{ color: '#64748B', fontSize: 11, display: 'block' }}>Estilo Alimentar:</span>
                        <strong>{formatVal('diet', ans.diet) || 'Não informado'}</strong>
                      </div>
                      <div style={{ gridColumn: '1 / -1' }}>
                        <span style={{ color: '#64748B', fontSize: 11, display: 'block' }}>Dificuldades / Hábitos Ruins:</span>
                        <strong>{formatVal('badHabits', ans.badHabits) || 'Nenhum'}</strong>
                      </div>
                    </div>
                  </div>

                  {/* Bloco 5: Gatilhos & Motivação Real */}
                  <div style={{ border: '1px solid #E2E8F0', borderRadius: 12, padding: 16 }}>
                    <div style={{ fontSize: 12, fontWeight: 800, color: '#BE123C', textTransform: 'uppercase', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span>🧠</span> 5. Gatilhos, Emoção & Mindset
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 12, fontSize: 13 }}>
                      <div>
                        <span style={{ color: '#64748B', fontSize: 11, display: 'block' }}>O Que Mais Atrapalhou no Passado:</span>
                        <strong>{formatVal('weightTriggers', ans.weightTriggers) || 'Não informado'}</strong>
                      </div>
                      <div>
                        <span style={{ color: '#64748B', fontSize: 11, display: 'block' }}>Motivo Real da Transformação:</span>
                        <strong style={{ color: '#0F172A' }}>{formatVal('mainReason', ans.mainReason) || 'Não informado'}</strong>
                      </div>
                      <div>
                        <span style={{ color: '#64748B', fontSize: 11, display: 'block' }}>Nível de Prontidão / Confiança:</span>
                        <strong style={{ color: '#16A34A' }}>{formatVal('confidence', ans.confidence) || 'Não informado'}</strong>
                      </div>
                    </div>
                  </div>

                  {/* Bloco 6: Contato & Conversão */}
                  <div style={{ border: '1px solid #E2E8F0', borderRadius: 12, padding: 16, backgroundColor: '#F0FDF4' }}>
                    <div style={{ fontSize: 12, fontWeight: 800, color: '#15803D', textTransform: 'uppercase', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span>✉️</span> 6. Dados do Lead & Contato
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12, fontSize: 13 }}>
                      <div>
                        <span style={{ color: '#64748B', fontSize: 11, display: 'block' }}>Nome:</span>
                        <strong>{selectedLead.name || 'Não informado'}</strong>
                      </div>
                      <div>
                        <span style={{ color: '#64748B', fontSize: 11, display: 'block' }}>E-mail:</span>
                        <strong style={{ color: '#2563EB' }}>{selectedLead.email || 'Não informado'}</strong>
                      </div>
                      <div>
                        <span style={{ color: '#64748B', fontSize: 11, display: 'block' }}>Status no Funil:</span>
                        <strong style={{ color: '#16A34A' }}>{selectedLead.status}</strong>
                      </div>
                      <div>
                        <span style={{ color: '#64748B', fontSize: 11, display: 'block' }}>Status Remarketing:</span>
                        <strong>{selectedLead.recovery_status || 'Pendente'}</strong>
                      </div>
                    </div>
                  </div>

                  {/* Bloco 7: Linha do Tempo de Etapas (steps_history) */}
                  {Array.isArray(selectedLead.steps_history) && selectedLead.steps_history.length > 0 && (
                    <div style={{ border: '1px solid #E2E8F0', borderRadius: 12, padding: 16, backgroundColor: '#FAF5FF' }}>
                      <div style={{ fontSize: 12, fontWeight: 800, color: '#7E22CE', textTransform: 'uppercase', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 6 }}>
                        <span>📍</span> Linha do Tempo das Telas Percorridas ({selectedLead.steps_history.length} etapas)
                      </div>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                        {selectedLead.steps_history.map((step, idx) => (
                          <span
                            key={idx}
                            style={{
                              fontSize: 11,
                              fontWeight: 600,
                              padding: '4px 8px',
                              borderRadius: 6,
                              backgroundColor: '#FFFFFF',
                              border: '1px solid #E9D5FF',
                              color: '#6B21A8'
                            }}
                          >
                            {idx + 1}. {step.screen_id}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )
            })()}

            {/* Ações */}
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              {selectedLead.email && (
                <button
                  onClick={() => {
                    handleSendRecoveryEmail(selectedLead)
                    setSelectedLead(null)
                  }}
                  style={{
                    padding: '12px 20px',
                    borderRadius: 10,
                    backgroundColor: '#BEF264',
                    color: '#000',
                    fontSize: 13,
                    fontWeight: 800,
                    border: 'none',
                    cursor: 'pointer'
                  }}
                >
                  ✉️ Disparar E-mail de Recuperação
                </button>
              )}
              <button
                onClick={() => setSelectedLead(null)}
                style={{
                  padding: '12px 18px',
                  borderRadius: 10,
                  backgroundColor: '#F1F5F9',
                  color: '#475569',
                  fontSize: 13,
                  fontWeight: 700,
                  border: 'none',
                  cursor: 'pointer'
                }}
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}
