import React, { useState, useEffect } from 'react'
import RunningTrackerModal from '../components/RunningTrackerModal'

/* ========================================================
   NEXA FIT PRO — Treinos Personalizados por Foco Muscular
   Ombros, Peito, Pernas, Abdômen, Costas, Corrida & Ciclismo GPS
   Mobile-First • GIFs Animados • Vídeos com Instrutor em PT-BR
   Cronômetro de Recuperação & Registro de Séries/Cargas
   ======================================================== */

const EXERCISE_DATABASE = {
  ombros: [
    {
      id: 101,
      name: 'Desenvolvimento com Halteres',
      target: 'Deltoide Anterior & Médio',
      sets: 4,
      reps: '12-15 reps',
      rest: 45,
      gif: 'https://cdn.jsdelivr.net/gh/hasaneyldrm/exercises-dataset@main/videos/0405-znQUdHY.gif',
      youtubeId: 'v4x7_BqR_eI',
      desc: 'Mantenha os cotovelos alinhados e empurre os halteres para cima sem encostar no topo. Controle a descida até a altura das orelhas.',
      instructions: [
        'Sente-se com as costas apoiadas e abdômen contraído.',
        'Suba os halteres em arco controlado sem travar os cotovelos.',
        'Desça lentamente sentindo a tensão lateral do deltoide.'
      ],
      mistake: 'Evite curvar a lombar ou bater os halteres no topo.'
    },
    {
      id: 102,
      name: 'Elevação Lateral com Halteres',
      target: 'Deltoide Lateral (Ombros Largos)',
      sets: 4,
      reps: '15-20 reps',
      rest: 40,
      gif: 'https://cdn.jsdelivr.net/gh/hasaneyldrm/exercises-dataset@main/videos/0334-DsgkuIt.gif',
      youtubeId: '3VcKaXpzqRo',
      desc: 'Eleve os braços na linha dos ombros com ligeira flexão dos cotovelos. Foque na contração lateral sem usar impulso.',
      instructions: [
        'Incline o tronco 5º para a frente.',
        'Pense em empurrar as paredes laterais, não em puxar para cima.',
        'Segure 1 segundo no pico de contração.'
      ],
      mistake: 'Não balance o tronco nem use pesos excessivos que causem roubo.'
    },
    {
      id: 103,
      name: 'Elevação Frontal com Halteres',
      target: 'Deltoide Anterior',
      sets: 3,
      reps: '12-15 reps',
      rest: 45,
      gif: 'https://cdn.jsdelivr.net/gh/hasaneyldrm/exercises-dataset@main/videos/0310-3eGE2JC.gif',
      youtubeId: 'hRJ6zt84iEI',
      desc: 'Suba o halter até a altura dos olhos de forma controlada. Mantenha o abdômen travado.',
      instructions: [
        'Mantenha os joelhos semiflexionados para estabilidade.',
        'Eleve até a altura da linha dos olhos.',
        'Desça em 2 a 3 segundos resistindo à gravidade.'
      ],
      mistake: 'Não jogue os quadris para frente para iniciar o movimento.'
    },
    {
      id: 104,
      name: 'Crucifixo Inverso com Halteres',
      target: 'Deltoide Posterior & Romboides',
      sets: 4,
      reps: '15 reps',
      rest: 45,
      gif: 'https://cdn.jsdelivr.net/gh/hasaneyldrm/exercises-dataset@main/videos/0378-8DiFDVA.gif',
      youtubeId: 'Z_rQ0cT2Gps',
      desc: 'Tronco inclinado para a frente, abra os braços espremendo as escápulas atrás para desenhar o ombro 3D.',
      instructions: [
        'Incline o tronco em 45º com as costas alinhadas.',
        'Abra os braços focando na parte traseira dos ombros.',
        'Não contraia excessivamente os trapézios.'
      ],
      mistake: 'Não use impulso da coluna lombar.'
    },
    {
      id: 105,
      name: 'Encolhimento de Ombros com Halteres',
      target: 'Trapézio Superior',
      sets: 3,
      reps: '15 reps',
      rest: 40,
      gif: 'https://cdn.jsdelivr.net/gh/hasaneyldrm/exercises-dataset@main/videos/0406-NJzBsGJ.gif',
      youtubeId: 'g6qbq491nw8',
      desc: 'Eleve os ombros em direção às orelhas, segure 2 segundos no topo e desça alongando bem.',
      instructions: [
        'Puxe os ombros em linha reta para cima.',
        'Segure 2 segundos no topo contraindo o trapézio.',
        'Desça até o alongamento completo sem girar os ombros.'
      ],
      mistake: 'Nunca gire os ombros para trás ou para frente para proteger os tendões.'
    }
  ],
  peito: [
    {
      id: 201,
      name: 'Supino Reto com Barra',
      target: 'Peitoral Maior Completo',
      sets: 4,
      reps: '10-12 reps',
      rest: 60,
      gif: 'https://cdn.jsdelivr.net/gh/hasaneyldrm/exercises-dataset@main/videos/0025-EIeI8Vf.gif',
      youtubeId: 'rT7DgCr-3pg',
      desc: 'Pés firmes no chão, escápulas travadas no banco. Desça a barra até tocar suavemente no peito e suba com força.',
      instructions: [
        'Aduza as escápulas e mantenha o peito estufado.',
        'Desça a barra na linha dos mamilos com cotovelos a 70º.',
        'Empurre contraindo o peitoral no topo sem desencaixar as escápulas.'
      ],
      mistake: 'Não abra os cotovelos a 90º em linha com o ombro.'
    },
    {
      id: 202,
      name: 'Supino Inclinado com Halteres',
      target: 'Peitoral Superior',
      sets: 4,
      reps: '12-15 reps',
      rest: 45,
      gif: 'https://cdn.jsdelivr.net/gh/hasaneyldrm/exercises-dataset@main/videos/0314-ns0SIbU.gif',
      youtubeId: '8iPEnn-ltC8',
      desc: 'Banco em 30º a 45º. Excelente para dar volume e preenchimento na parte superior do peito.',
      instructions: [
        'Regule o banco entre 30º e 45º para não sobrecarregar o ombro.',
        'Desça alongando o peitoral superior.',
        'Suba aproximando os halteres sem bater.'
      ],
      mistake: 'Evite inclinação acima de 45º para não virar desenvolvimento de ombro.'
    },
    {
      id: 203,
      name: 'Crossover na Polia / Crucifixo',
      target: 'Miolo e Isolamento Peitoral',
      sets: 3,
      reps: '15 reps',
      rest: 40,
      gif: 'https://cdn.jsdelivr.net/gh/hasaneyldrm/exercises-dataset@main/videos/0179-FVmZVhk.gif',
      youtubeId: 'H_U_G3f5s1w',
      desc: 'Cruze os punhos à frente do peito sentindo a contração máxima do músculo peitoral.',
      instructions: [
        'Mantenha uma leve flexão nos cotovelos durante todo o arco.',
        'Traga os punhos à frente espremendo o miolo do peitoral.',
        'Retorne abrindo bem a caixa torácica.'
      ],
      mistake: 'Não flexione e estenda os cotovelos como se fosse um supino.'
    },
    {
      id: 204,
      name: 'Flexão de Braço no Solo',
      target: 'Peito, Ombros e Core',
      sets: 3,
      reps: 'Até a falha',
      rest: 45,
      gif: 'https://cdn.jsdelivr.net/gh/hasaneyldrm/exercises-dataset@main/videos/0259-x6KpKpq.gif',
      youtubeId: 'IODxDxX7oi4',
      desc: 'Corpo reto em prancha. Excelente para fazer em casa sem nenhum equipamento.',
      instructions: [
        'Mãos um pouco mais largas que a largura dos ombros.',
        'Abdômen e glúteos travados em prancha reta.',
        'Desça o peito até 2cm do chão e empurre com explosão.'
      ],
      mistake: 'Não deixe o quadril cair nem aponte os cotovelos para fora.'
    },
    {
      id: 205,
      name: 'Tríceps Corda na Polia',
      target: 'Tríceps Lateral & Ferradura',
      sets: 4,
      reps: '15 reps',
      rest: 40,
      gif: 'https://cdn.jsdelivr.net/gh/hasaneyldrm/exercises-dataset@main/videos/0200-dU605di.gif',
      youtubeId: 'vB5OHsJ3EME',
      desc: 'Abra a corda no final do movimento para contrair o tríceps por completo.',
      instructions: [
        'Cotovelos colados e travados na lateral do tronco.',
        'Empurre para baixo e abra as pontas da corda no final.',
        'Retorne até formar um ângulo de 90º nos cotovelos.'
      ],
      mistake: 'Não mexa os cotovelos para frente e para trás durante a execução.'
    }
  ],
  costas: [
    {
      id: 301,
      name: 'Puxada Frontal Aberta',
      target: 'Dorsal e Asa (Costas em V)',
      sets: 4,
      reps: '12-15 reps',
      rest: 45,
      gif: 'https://cdn.jsdelivr.net/gh/hasaneyldrm/exercises-dataset@main/videos/2330-LEprlgG.gif',
      youtubeId: 'CAwf7n6Luuc',
      desc: 'Puxe a barra até a altura do queixo, projetando o peito para cima e puxando com as costas.',
      instructions: [
        'Incline o tronco levemente para trás (10º a 15º).',
        'Puxe com os cotovelos apontando para o chão.',
        'Sinta as asas da dorsal abrirem no retorno.'
      ],
      mistake: 'Não puxe a barra atrás da nuca nem faça gangorra com a coluna.'
    },
    {
      id: 302,
      name: 'Remada Curvada com Barra',
      target: 'Espessura Dorsal & Romboides',
      sets: 4,
      reps: '12 reps',
      rest: 60,
      gif: 'https://cdn.jsdelivr.net/gh/hasaneyldrm/exercises-dataset@main/videos/0027-eZyBC3j.gif',
      youtubeId: 'vT2GjY_Umpw',
      desc: 'Coluna alinhada em 45º, puxe os halteres rente ao quadril espremendo as costas.',
      instructions: [
        'Quadril jogado para trás e coluna perfeitamente reta.',
        'Puxe os halteres em direção ao umbigo.',
        'Esmague as escápulas no topo por 1 segundo.'
      ],
      mistake: 'Não curve a coluna lombar durante a puxada.'
    },
    {
      id: 303,
      name: 'Remada Baixa no Cabo / Triângulo',
      target: 'Miolo das Costas & Densidade',
      sets: 3,
      reps: '15 reps',
      rest: 45,
      gif: 'https://cdn.jsdelivr.net/gh/hasaneyldrm/exercises-dataset@main/videos/0239-Tq6gbK6.gif',
      youtubeId: 'GZbfZ033fbo',
      desc: 'Postura ereta, traga o triângulo no abdômen sem inclinar o corpo para trás.',
      instructions: [
        'Mantenha o peito aberto e joelhos semiflexionados.',
        'Puxe o triângulo contra o abdômen.',
        'Alongue a dorsal na volta sem arredondar as costas.'
      ],
      mistake: 'Não balance as costas excessivamente.'
    },
    {
      id: 304,
      name: 'Rosca Direta com Barra',
      target: 'Bíceps Braquial',
      sets: 4,
      reps: '12 reps',
      rest: 40,
      gif: 'https://cdn.jsdelivr.net/gh/hasaneyldrm/exercises-dataset@main/videos/0031-25GPyDY.gif',
      youtubeId: 'in7PaeYlhrM',
      desc: 'Cotovelos colados ao lado do corpo, faça o movimento controlado para pico de contração.',
      instructions: [
        'Cotovelos fixos ao lado das costelas.',
        'Suba a barra com força mantendo os punhos firmes.',
        'Desça controlando sem jogar os braços para trás.'
      ],
      mistake: 'Não balance o tronco para levantar o peso.'
    },
    {
      id: 305,
      name: 'Rosca Martelo com Halteres',
      target: 'Braquial e Antebraço',
      sets: 3,
      reps: '15 reps',
      rest: 40,
      gif: 'https://cdn.jsdelivr.net/gh/hasaneyldrm/exercises-dataset@main/videos/0313-slDvUAU.gif',
      youtubeId: 'zC3nLlEvin4',
      desc: 'Pegada neutra (palmas viradas uma para a outra). Dá densidade lateral ao braço.',
      instructions: [
        'Mantenha as palmas voltadas uma para a outra o tempo todo.',
        'Suba até a flexão completa do braço.',
        'Excelente para proteger os punhos e aumentar a espessura do braço.'
      ],
      mistake: 'Não projete os ombros para frente.'
    }
  ],
  pernas: [
    {
      id: 401,
      name: 'Agachamento Livre com Barra',
      target: 'Quadríceps, Glúteos & Core',
      sets: 4,
      reps: '12-15 reps',
      rest: 60,
      gif: 'https://cdn.jsdelivr.net/gh/hasaneyldrm/exercises-dataset@main/videos/0043-qXTaZnJ.gif',
      youtubeId: 'U3HlEF_E9zg',
      desc: 'Pés na largura dos ombros, desça jogando o quadril para trás mantendo os joelhos alinhados.',
      instructions: [
        'Pés apontados levemente para fora (15º a 30º).',
        'Inicie o movimento jogando o quadril para trás e para baixo.',
        'Desça até as coxas ficarem paralelas ao solo.'
      ],
      mistake: 'Não deixe os joelhos fecharem para dentro (valgo dinâmico).'
    },
    {
      id: 402,
      name: 'Leg Press 45º',
      target: 'Pernas Completo & Carga',
      sets: 4,
      reps: '12-15 reps',
      rest: 60,
      gif: 'https://cdn.jsdelivr.net/gh/hasaneyldrm/exercises-dataset@main/videos/0739-10Z2DXU.gif',
      youtubeId: 'IZxyjW7MPJQ',
      desc: 'Apoie toda a sola dos pés na plataforma. Desça sem levantar a lombar do banco.',
      instructions: [
        'Pés no meio da plataforma na largura dos ombros.',
        'Desça até 90º nos joelhos mantendo o quadril colado no encosto.',
        'Empurre pelos calcanhares sem travar os joelhos no topo.'
      ],
      mistake: 'Nunca estale os joelhos (hiperextensão) no final da subida.'
    },
    {
      id: 403,
      name: 'Elevação Pélvica / Glute Bridge',
      target: 'Glúteos & Isquiotibiais',
      sets: 4,
      reps: '15 reps',
      rest: 45,
      gif: 'https://cdn.jsdelivr.net/gh/hasaneyldrm/exercises-dataset@main/videos/1409-qKBpF7I.gif',
      youtubeId: 'SEdqd1n01G4',
      desc: 'Escápulas apoiadas, suba o quadril contraindo os glúteos fortemente no topo por 2 segundos.',
      instructions: [
        'Escápulas apoiadas na borda do banco ou solo.',
        'Pés firmes no chão na largura dos quadris.',
        'Suba o quadril até alinhar coxa e tronco, esmagando os glúteos.'
      ],
      mistake: 'Não arqueie a lombar além da linha reta do corpo.'
    },
    {
      id: 404,
      name: 'Cadeira Extensora',
      target: 'Definição Quadríceps',
      sets: 3,
      reps: '15-20 reps',
      rest: 40,
      gif: 'https://cdn.jsdelivr.net/gh/hasaneyldrm/exercises-dataset@main/videos/0585-my33uHU.gif',
      youtubeId: 'YyvSfVGIvL8',
      desc: 'Estenda os joelhos até alinhar as pernas e segure 1 segundo no topo antes de descer devagar.',
      instructions: [
        'Ajuste o rolo logo acima dos tornozelos.',
        'Estenda as pernas contraindo o quadríceps.',
        'Segure 1 segundo no topo e desça em 3 segundos.'
      ],
      mistake: 'Não use impulso para chutar o peso.'
    },
    {
      id: 405,
      name: 'Panturrilha em Pé',
      target: 'Gastrocnêmio & Sóleo',
      sets: 4,
      reps: '20 reps',
      rest: 30,
      gif: 'https://cdn.jsdelivr.net/gh/hasaneyldrm/exercises-dataset@main/videos/1372-8ozhUIZ.gif',
      youtubeId: 'gwLzBJYoWlI',
      desc: 'Suba na ponta dos pés o mais alto possível e desça alongando o calcanhar ao máximo.',
      instructions: [
        'Apoie a ponta dos pés em um degrau ou bloco.',
        'Eleve os calcanhares no ponto mais alto possível.',
        'Desça até sentir o alongamento completo da panturrilha.'
      ],
      mistake: 'Não faça repetições curtas e rápidas sem amplitude.'
    }
  ],
  abdomen: [
    {
      id: 501,
      name: 'Prancha Isométrica no Solo',
      target: 'Core Profundo & Cintura Fina',
      sets: 4,
      reps: '40-60 seg',
      rest: 40,
      gif: 'https://cdn.jsdelivr.net/gh/hasaneyldrm/exercises-dataset@main/videos/0464-CosupLu.gif',
      youtubeId: 'pSHjTRCQxIw',
      desc: 'Cotovelos sob os ombros, abdômen e glúteos contraídos. Não deixe o quadril cair.',
      instructions: [
        'Apoie os antebraços no chão alinhados com os ombros.',
        'Contraia o abdômen como se fosse receber um soco.',
        'Mantenha a respiração ritmada pelo nariz.'
      ],
      mistake: 'Não deixe o quadril afundar em direção ao solo.'
    },
    {
      id: 502,
      name: 'Crunch Abdominal Clássico',
      target: 'Reto Abdominal Superior',
      sets: 4,
      reps: '20 reps',
      rest: 35,
      gif: 'https://cdn.jsdelivr.net/gh/hasaneyldrm/exercises-dataset@main/videos/0001-2gPfomN.gif',
      youtubeId: 'Xyd_fa5zoEU',
      desc: 'Eleve os ombros do chão espremendo o abdômen sem puxar a cabeça com as mãos.',
      instructions: [
        'Deite-se de costas com joelhos dobrados e pés firmes no chão.',
        'Eleve as escápulas do chão focando na aproximação das costelas do quadril.',
        'Solte o ar na subida e aperte o abdômen.'
      ],
      mistake: 'Não puxe o pescoço com as mãos.'
    },
    {
      id: 503,
      name: 'Elevação de Pernas / Infra',
      target: 'Abdômen Infra & Linha Baixa',
      sets: 3,
      reps: '15 reps',
      rest: 40,
      gif: 'https://cdn.jsdelivr.net/gh/hasaneyldrm/exercises-dataset@main/videos/2963-weoDEpH.gif',
      youtubeId: 'l4kQd9eWclE',
      desc: 'Mãos sob o quadril, eleve as pernas estendidas e desça devagar sem tocar os pés no chão.',
      instructions: [
        'Coloque as mãos sob a região do cóccix para proteger a lombar.',
        'Eleve as pernas retas até 90º com o solo.',
        'Desça de forma controlada parando 5cm antes de tocar o chão.'
      ],
      mistake: 'Não descole a lombar do chão na fase de descida.'
    },
    {
      id: 504,
      name: 'Prancha Lateral',
      target: 'Oblíquos & Afinamento',
      sets: 3,
      reps: '30 seg / lado',
      rest: 35,
      gif: 'https://cdn.jsdelivr.net/gh/hasaneyldrm/exercises-dataset@main/videos/3544-5VXmnV5.gif',
      youtubeId: 'K2VljzCC16g',
      desc: 'Mantenha o corpo reto de lado sustentado pelo antebraço para queimar a gordura dos flancos.',
      instructions: [
        'Apoie um antebraço no chão diretamente sob o ombro.',
        'Eleve o quadril formando uma linha reta da cabeça aos pés.',
        'Mantenha o abdômen lateral contraído durante todo o tempo.'
      ],
      mistake: 'Não deixe o quadril descer para o chão.'
    },
    {
      id: 505,
      name: 'Abdominal Supra na Polia / Crunch',
      target: 'Definição & Densidade Abdominal',
      sets: 3,
      reps: '15-20 reps',
      rest: 30,
      gif: 'https://cdn.jsdelivr.net/gh/hasaneyldrm/exercises-dataset@main/videos/0175-WW95auq.gif',
      youtubeId: 'N17E8ItZZfc',
      desc: 'Ajoelhe-se e flexione o tronco contraindo o abdômen ao máximo contra a resistência.',
      instructions: [
        'Segure a corda ao lado das têmporas.',
        'Flexione a coluna enrolando o tronco em direção aos joelhos.',
        'Solte o ar no final da contração e retorne devagar.'
      ],
      mistake: 'Não puxe o peso com os braços, use a força do abdômen.'
    }
  ]
}

// ── Sintetizadores de Áudio para Descanso do Treino ──
function playWarningBell() {
  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext
    if (!AudioCtx) return
    const ctx = new AudioCtx()
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.type = 'sine'
    osc.frequency.setValueAtTime(920, ctx.currentTime)
    gain.gain.setValueAtTime(0.25, ctx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.28)
    osc.connect(gain)
    gain.connect(ctx.destination)
    osc.start()
    osc.stop(ctx.currentTime + 0.28)
  } catch (e) {}
}

function playBoxingGong() {
  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext
    if (!AudioCtx) return
    const ctx = new AudioCtx()
    const freqs = [220, 330, 440, 660, 880]
    freqs.forEach((freq, idx) => {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.type = idx === 0 ? 'triangle' : 'sine'
      osc.frequency.setValueAtTime(freq, ctx.currentTime)
      const initialVol = 0.35 / (idx + 1)
      gain.gain.setValueAtTime(initialVol, ctx.currentTime)
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 1.8)
      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.start()
      osc.stop(ctx.currentTime + 1.8)
    })
  } catch (e) {}
}

export default function TreinosCatalogo() {
  const storedAnswers = localStorage.getItem('nexafit_answers') ? JSON.parse(localStorage.getItem('nexafit_answers')) : {}
  const primaryFocusFromQuiz = (storedAnswers.focusZones && storedAnswers.focusZones[0]) || localStorage.getItem('nexafit_focus_group') || 'ombros'

  const getMappedCategory = (key) => {
    if (key === 'bracos') return 'costas'
    if (key === 'gluteos') return 'pernas'
    if (key === 'peito') return 'peito'
    if (key === 'costas') return 'costas'
    if (key === 'abdomen') return 'abdomen'
    if (key === 'pernas') return 'pernas'
    return 'ombros'
  }

  const initialCat = getMappedCategory(primaryFocusFromQuiz)
  const [selectedGroup, setSelectedGroup] = useState(initialCat)
  const [runningModalOpen, setRunningModalOpen] = useState(false)
  const [runningMode, setRunningMode] = useState('running')
  const [restTime, setRestTime] = useState(45)
  const [progress, setProgress] = useState({}) // { [exId]: completedSets }
  const [weights, setWeights] = useState({}) // { [exId]: weightKg }
  const [timer, setTimer] = useState(0) // rest timer seconds
  const [gongActive, setGongActive] = useState(false)
  const [modalExercise, setModalExercise] = useState(null) // exercise details modal
  const [modalTab, setModalTab] = useState('video') // 'video' or 'gif'
  const [hoverGifId, setHoverGifId] = useState(null)

  useEffect(() => {
    let int
    if (timer > 0) {
      if (timer <= 5) {
        playWarningBell()
      }
      int = setInterval(() => {
        setTimer(t => {
          if (t <= 1) {
            playBoxingGong()
            setGongActive(true)
            setTimeout(() => setGongActive(false), 2200)
            return 0
          }
          return t - 1
        })
      }, 1000)
    }
    return () => clearInterval(int)
  }, [timer])

  const completeSet = (ex) => {
    const current = progress[ex.id] || 0
    if (current < ex.sets) {
      setProgress(p => ({ ...p, [ex.id]: current + 1 }))
      setTimer(restTime)
    }
  }

  const cancelRest = () => {
    setTimer(0)
    setGongActive(false)
  }

  const adjustTimer = (delta) => {
    setTimer(t => Math.max(t + delta, 5))
  }

  const formatTime = (s) => {
    const m = Math.floor(s / 60)
    const sec = s % 60
    return `${m}:${sec.toString().padStart(2, '0')}`
  }

  const currentWorkout = EXERCISE_DATABASE[selectedGroup] || EXERCISE_DATABASE.ombros

  const groupLabels = [
    { key: 'ombros', label: 'Ombros & Trapézio', icon: '⚡' },
    { key: 'peito', label: 'Peito & Tríceps', icon: '🫁' },
    { key: 'costas', label: 'Costas & Bíceps', icon: '🔙' },
    { key: 'pernas', label: 'Pernas & Glúteos', icon: '🦵' },
    { key: 'abdomen', label: 'Abdômen & Core', icon: '🎯' },
    { key: 'cardio', label: 'Corrida & GPS', icon: '🏃' },
  ]

  const isUrgent = timer <= 5 && timer > 0

  return (
    <div style={{
      maxWidth: 480,
      margin: '0 auto',
      padding: '12px 14px 110px',
      background: 'transparent',
      minHeight: '100vh',
      color: '#fff',
      fontFamily: 'var(--font-primary)'
    }}>
      
      {/* ── MODAL PROFISSIONAL DE DESCANSO ── */}
      {(timer > 0 || gongActive) && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.88)', backdropFilter: 'blur(16px)',
          zIndex: 300, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16
        }}>
          <div style={{
            background: isUrgent ? '#1A0B0B' : '#111',
            borderRadius: 24,
            padding: '24px 20px',
            width: '100%',
            maxWidth: 360,
            textAlign: 'center',
            border: isUrgent ? '2px solid #EF4444' : '2px solid rgba(163,230,53,0.4)',
            boxShadow: isUrgent ? '0 0 40px rgba(239, 68, 68, 0.6)' : '0 10px 40px rgba(0,0,0,0.8)',
            animation: isUrgent ? 'pulse 0.8s infinite' : 'none',
            position: 'relative'
          }}>
            <button
              onClick={cancelRest}
              style={{
                position: 'absolute', top: 12, right: 12,
                background: 'rgba(255,255,255,0.1)', border: 'none', color: '#fff',
                width: 32, height: 32, borderRadius: '50%', fontSize: 16, cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}
              title="Cancelar Descanso"
            >
              ✕
            </button>

            {gongActive ? (
              <div style={{ padding: '16px 0' }}>
                <div style={{ fontSize: 44, marginBottom: 8 }}>🥊</div>
                <h2 style={{ fontSize: 22, fontWeight: 900, color: 'var(--neon)', textTransform: 'uppercase' }}>
                  GONGO! HORA DA SÉRIE!
                </h2>
                <p style={{ color: '#fff', fontSize: 13, marginTop: 4 }}>Foco total no movimento e na contração!</p>
              </div>
            ) : (
              <>
                <div style={{
                  display: 'inline-flex', alignItems: 'center', gap: 6,
                  padding: '4px 12px', borderRadius: 20,
                  background: isUrgent ? 'rgba(239,68,68,0.2)' : 'rgba(163,230,53,0.15)',
                  color: isUrgent ? '#EF4444' : 'var(--neon)',
                  fontSize: 11, fontWeight: 800, textTransform: 'uppercase', letterSpacing: 0.5,
                  marginBottom: 14
                }}>
                  {isUrgent ? '🔔 SINO DE ALERTA: ÚLTIMOS 5 SEGUNDOS!' : '⏱️ TEMPO DE RECUPERAÇÃO'}
                </div>

                <div style={{
                  width: 150, height: 150, borderRadius: '50%',
                  margin: '0 auto 16px',
                  background: '#161616',
                  border: isUrgent ? '5px solid #EF4444' : '5px solid var(--neon)',
                  boxShadow: isUrgent ? '0 0 30px rgba(239,68,68,0.7)' : '0 0 25px rgba(163,230,53,0.3)',
                  display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                  transition: 'all 0.3s ease'
                }}>
                  <span style={{
                    fontSize: 42, fontWeight: 900,
                    color: isUrgent ? '#EF4444' : '#fff',
                    fontFamily: 'var(--font-primary)', lineHeight: 1
                  }}>
                    {formatTime(timer)}
                  </span>
                  <span style={{ fontSize: 10, color: isUrgent ? '#EF4444' : 'var(--text-muted)', fontWeight: 700, marginTop: 4 }}>
                    {isUrgent ? 'PREPARE-SE' : 'DESCANSE'}
                  </span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'center', gap: 10, marginBottom: 16 }}>
                  <button
                    onClick={() => adjustTimer(-15)}
                    style={{
                      background: '#222', border: '1px solid #333', color: '#ccc',
                      borderRadius: 10, padding: '6px 12px', fontSize: 12, fontWeight: 800, cursor: 'pointer'
                    }}
                  >
                    -15s
                  </button>
                  <button
                    onClick={() => adjustTimer(15)}
                    style={{
                      background: '#222', border: '1px solid #333', color: '#ccc',
                      borderRadius: 10, padding: '6px 12px', fontSize: 12, fontWeight: 800, cursor: 'pointer'
                    }}
                  >
                    +15s
                  </button>
                </div>

                <button
                  onClick={cancelRest}
                  style={{
                    width: '100%',
                    background: isUrgent ? '#EF4444' : 'var(--neon)',
                    color: '#000',
                    border: 'none',
                    padding: '12px 0',
                    borderRadius: 12,
                    fontWeight: 900,
                    fontSize: 13,
                    cursor: 'pointer',
                    boxShadow: isUrgent ? '0 4px 20px rgba(239,68,68,0.5)' : '0 4px 20px rgba(163,230,53,0.4)',
                    textTransform: 'uppercase',
                    letterSpacing: 0.5
                  }}
                >
                  ✕ Pular Descanso / Iniciar Série
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 900, marginBottom: 2 }}>Treinos Guiados</h1>
          <p style={{ fontSize: 11, color: 'var(--text-muted)' }}>Em Casa ou Academia • GIFs & Vídeos em Português</p>
        </div>
        {selectedGroup === initialCat && (
          <div style={{ background: 'rgba(163,230,53,0.15)', color: 'var(--neon)', border: '1px solid rgba(163,230,53,0.4)', padding: '4px 8px', borderRadius: 16, fontSize: 10, fontWeight: 800 }}>
            🎯 SEU FOCO
          </div>
        )}
      </div>

      {/* Muscle Group Selector (Scroll Horizontal Suave) */}
      <div style={{
        display: 'flex',
        gap: 6,
        overflowX: 'auto',
        paddingBottom: 8,
        marginBottom: 12,
        scrollbarWidth: 'none',
        msOverflowStyle: 'none'
      }}>
        {groupLabels.map(g => {
          const isSelected = selectedGroup === g.key
          return (
            <button
              key={g.key}
              onClick={() => setSelectedGroup(g.key)}
              style={{
                display: 'flex', alignItems: 'center', gap: 5,
                padding: '7px 12px', borderRadius: 12, fontWeight: 700, fontSize: 11, whiteSpace: 'nowrap',
                background: isSelected ? 'var(--neon)' : '#141414',
                color: isSelected ? '#000' : '#aaa',
                border: isSelected ? '1px solid var(--neon)' : '1px solid #242424',
                cursor: 'pointer', transition: 'all 0.2s ease',
                flexShrink: 0,
                boxShadow: isSelected ? '0 2px 10px rgba(163,230,53,0.3)' : 'none'
              }}
            >
              <span style={{ fontSize: 13 }}>{g.icon}</span>
              <span>{g.label}</span>
              {g.key === initialCat && !isSelected && <span style={{ color: 'var(--neon)', fontSize: 9 }}>★</span>}
            </button>
          )
        })}
      </div>

      {/* Se for a aba de Corrida & GPS, exibe a interface com o mapa e botões de início */}
      {selectedGroup === 'cardio' ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Card Banner do Mapa GPS */}
          <div style={{
            position: 'relative',
            borderRadius: 22,
            overflow: 'hidden',
            border: '2px solid rgba(56,189,248,0.4)',
            boxShadow: '0 10px 30px rgba(0,0,0,0.7)',
            background: '#0a0a0a'
          }}>
            <img
              src="/images/cardio-gps-banner.jpg"
              alt="Outdoor Cardio GPS"
              style={{ width: '100%', height: 210, objectFit: 'cover', display: 'block' }}
            />
            
            {/* Gradiente Overlay & Tag */}
            <div style={{
              position: 'absolute', inset: 0,
              background: 'linear-gradient(to top, rgba(10,10,10,0.95) 15%, rgba(10,10,10,0.3) 60%, transparent 100%)',
              display: 'flex', flexDirection: 'column', justifyContent: 'flex-end',
              padding: '16px 18px'
            }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'rgba(56,189,248,0.2)', border: '1px solid #38BDF8', color: '#38BDF8', padding: '3px 10px', borderRadius: 8, fontSize: 10, fontWeight: 900, width: 'fit-content', marginBottom: 6 }}>
                🛰️ RASTREADOR GPS AO VIVO
              </div>
              <h2 style={{ fontSize: 18, fontWeight: 900, color: '#fff', margin: '0 0 4px' }}>
                Corrida & Ciclismo Outdoor
              </h2>
              <p style={{ fontSize: 12, color: '#93C5FD', margin: 0, lineHeight: 1.4 }}>
                Acompanhe distância, pace, queima calórica e rota desenhada no mapa em tempo real.
              </p>
            </div>
          </div>

          {/* Botões de Ação Imediata: Corrida vs Ciclismo */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <button
              onClick={() => {
                setRunningMode('running')
                setRunningModalOpen(true)
              }}
              style={{
                padding: '18px 14px',
                background: 'linear-gradient(135deg, #BEF264 0%, #A3E635 100%)',
                color: '#000',
                border: 'none',
                borderRadius: 18,
                fontWeight: 900,
                fontSize: 14,
                cursor: 'pointer',
                boxShadow: '0 6px 20px rgba(163,230,53,0.45)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 6
              }}
            >
              <span style={{ fontSize: 26 }}>🏃💨</span>
              <span>INICIAR CORRIDA</span>
              <span style={{ fontSize: 10, fontWeight: 700, opacity: 0.8 }}>Pace & Calorias</span>
            </button>

            <button
              onClick={() => {
                setRunningMode('cycling')
                setRunningModalOpen(true)
              }}
              style={{
                padding: '18px 14px',
                background: 'linear-gradient(135deg, #38BDF8 0%, #0284C7 100%)',
                color: '#000',
                border: 'none',
                borderRadius: 18,
                fontWeight: 900,
                fontSize: 14,
                cursor: 'pointer',
                boxShadow: '0 6px 20px rgba(56,189,248,0.45)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 6
              }}
            >
              <span style={{ fontSize: 26 }}>🚴⚡</span>
              <span>INICIAR CICLISMO</span>
              <span style={{ fontSize: 10, fontWeight: 700, opacity: 0.8 }}>Velocidade & Rota</span>
            </button>
          </div>

          {/* Cards de Métricas & Benefícios */}
          <div style={{ background: '#121214', borderRadius: 18, padding: 16, border: '1px solid rgba(255,255,255,0.06)' }}>
            <div style={{ fontSize: 11, color: '#aaa', fontWeight: 800, textTransform: 'uppercase', marginBottom: 10 }}>
              ⚡ Recursos do Rastreador Satelital:
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, fontSize: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ color: 'var(--neon)', fontWeight: 900 }}>✓</span>
                <span>Rastreamento em tempo real via OpenStreetMap (Zero travamentos)</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ color: 'var(--neon)', fontWeight: 900 }}>✓</span>
                <span>Cálculo de ritmo médio (/km) e velocidade pontual</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ color: 'var(--neon)', fontWeight: 900 }}>✓</span>
                <span>Registro automático no seu Calendário de Progresso Diário</span>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <>
          {/* Selector de Descanso */}
          <div style={{ background: '#111', borderRadius: 14, padding: '10px 12px', marginBottom: 14, border: '1px solid rgba(255,255,255,0.06)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <span style={{ fontSize: 10, color: '#888', fontWeight: 800, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                Descanso entre Séries
              </span>
              <span style={{ fontSize: 11, color: 'var(--neon)', fontWeight: 800 }}>{restTime} segundos</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 5 }}>
              {[15, 30, 45, 60, 90, 120].map(t => (
                <button
                  key={t}
                  onClick={() => setRestTime(t)}
                  style={{
                    padding: '5px 0', borderRadius: 8, fontWeight: 800, fontSize: 11,
                    background: restTime === t ? 'rgba(163,230,53,0.2)' : '#1A1A1A',
                    color: restTime === t ? 'var(--neon)' : '#888',
                    border: restTime === t ? '1px solid var(--neon)' : '1px solid #222',
                    cursor: 'pointer',
                    textAlign: 'center'
                  }}
                >
                  {t}s
                </button>
              ))}
            </div>
          </div>

          {/* Lista de Exercícios Mobile-First */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {currentWorkout.map((ex, idx) => {
              const currentSet = progress[ex.id] || 0
              const isFinished = currentSet >= ex.sets
              const isHovered = hoverGifId === ex.id

              return (
                <div
                  key={ex.id}
                  style={{
                    background: isFinished ? 'rgba(163,230,53,0.04)' : '#121212',
                    borderRadius: 16,
                    padding: '12px 14px',
                    border: isFinished ? '1px solid rgba(163,230,53,0.4)' : '1px solid rgba(255,255,255,0.06)',
                    boxShadow: isFinished ? '0 0 15px rgba(163,230,53,0.1)' : '0 4px 16px rgba(0,0,0,0.4)',
                    transition: 'all 0.2s ease'
                  }}
                >
              {/* Header do Exercício com GIF direto */}
              <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 10 }}>
                
                {/* GIF Animado Direto do Exercício */}
                <div
                  onClick={() => {
                    setModalExercise(ex)
                    setModalTab('video')
                  }}
                  style={{
                    width: 84, height: 84, borderRadius: 14, overflow: 'hidden', position: 'relative',
                    border: '1.5px solid rgba(163,230,53,0.5)', flexShrink: 0, background: '#000', cursor: 'pointer',
                    boxShadow: '0 4px 14px rgba(0,0,0,0.5)'
                  }}
                  title="Toque para assistir vídeo explicativo"
                >
                  <img
                    src={ex.gif}
                    alt={ex.name}
                    loading="lazy"
                    style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                  />
                  
                  {/* Badge GIF Indicador */}
                  <div style={{
                    position: 'absolute', bottom: 4, right: 4,
                    background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(4px)',
                    color: 'var(--neon)', fontSize: 8, fontWeight: 900,
                    padding: '1px 5px', borderRadius: 4, border: '1px solid rgba(163,230,53,0.4)',
                    letterSpacing: 0.5
                  }}>
                    GIF
                  </div>
                </div>

                {/* Informações de Nome & Músculo */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
                    <span style={{ fontSize: 11, color: 'var(--neon)', fontWeight: 900 }}>#{idx + 1}</span>
                    <h3
                      onClick={() => {
                        setModalExercise(ex)
                        setModalTab('video')
                      }}
                      style={{
                        fontSize: 14, fontWeight: 900, lineHeight: 1.2,
                        color: isFinished ? 'var(--neon)' : '#fff',
                        cursor: 'pointer',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis'
                      }}
                    >
                      {ex.name}
                    </h3>
                  </div>

                  <div style={{ fontSize: 11, color: '#aaa', margin: '2px 0 4px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {ex.target}
                  </div>

                  <div style={{ display: 'flex', gap: 6, alignItems: 'center', flexWrap: 'wrap' }}>
                    <span style={{ fontSize: 10, background: '#1c1c1c', padding: '2px 6px', borderRadius: 4, color: 'var(--neon)', fontWeight: 800 }}>
                      {ex.sets} séries
                    </span>
                    <span style={{ fontSize: 10, color: '#aaa' }}>
                      {ex.reps}
                    </span>
                    
                    {/* Botão Secundário de Vídeo Explicativo */}
                    <button
                      onClick={() => {
                        setModalExercise(ex)
                        setModalTab('video')
                      }}
                      style={{
                        background: 'rgba(56, 189, 248, 0.12)',
                        border: '1px solid rgba(56, 189, 248, 0.35)',
                        color: '#38BDF8',
                        fontSize: 10, fontWeight: 800, cursor: 'pointer',
                        display: 'flex', alignItems: 'center', gap: 4,
                        padding: '3px 7px', borderRadius: 6, marginLeft: 'auto',
                        transition: 'all 0.2s ease'
                      }}
                    >
                      <span>▶</span>
                      <span>Vídeo Explicativo</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Barra Inferior de Progresso de Séries & Carga */}
              <div style={{
                background: '#181818', borderRadius: 10, padding: '8px 10px',
                display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8
              }}>
                
                {/* Bolinhas de Séries */}
                <div style={{ display: 'flex', gap: 5, alignItems: 'center' }}>
                  {Array.from({ length: ex.sets }).map((_, sIdx) => {
                    const done = sIdx < currentSet
                    return (
                      <div
                        key={sIdx}
                        style={{
                          width: 24, height: 24, borderRadius: '50%',
                          background: done ? 'var(--neon)' : '#262626',
                          color: done ? '#000' : '#777',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: 10, fontWeight: 900, border: done ? 'none' : '1px solid #333'
                        }}
                      >
                        {done ? '✓' : sIdx + 1}
                      </div>
                    )
                  })}
                </div>

                {/* Input de Carga Compacto */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                  <input
                    type="number"
                    placeholder="0"
                    value={weights[ex.id] || ''}
                    onChange={(e) => setWeights({ ...weights, [ex.id]: e.target.value })}
                    style={{
                      width: 44, background: '#222', border: '1px solid #333', color: '#fff',
                      borderRadius: 6, padding: '3px 4px', textAlign: 'center', fontSize: 11, fontWeight: 700
                    }}
                  />
                  <span style={{ fontSize: 10, color: '#888' }}>kg</span>
                </div>

                {/* Botão Concluir Série */}
                <button
                  onClick={() => completeSet(ex)}
                  disabled={isFinished}
                  style={{
                    background: isFinished ? '#242424' : 'var(--neon)',
                    color: isFinished ? '#666' : '#000',
                    border: 'none',
                    padding: '6px 12px', borderRadius: 8,
                    fontWeight: 900, fontSize: 11, cursor: isFinished ? 'default' : 'pointer',
                    boxShadow: isFinished ? 'none' : '0 2px 10px rgba(163,230,53,0.3)',
                    whiteSpace: 'nowrap'
                  }}
                >
                  {isFinished ? 'Concluído 🎉' : `Série ${currentSet + 1}`}
                </button>
              </div>
            </div>
          )
        })}
      </div>
      </>
      )}

      {/* Modal GPS Tracker para Corrida e Ciclismo */}
      <RunningTrackerModal
        isOpen={runningModalOpen}
        initialMode={runningMode}
        onClose={() => setRunningModalOpen(false)}
      />

      {/* Modal de Vídeo & Biomecânica em PT-BR */}
      {modalExercise && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.9)', backdropFilter: 'blur(14px)',
          zIndex: 400, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 14
        }}>
          <div style={{
            background: '#141414', borderRadius: 20, padding: 16, width: '100%', maxWidth: 440,
            border: '1.5px solid rgba(163,230,53,0.4)', boxShadow: '0 10px 40px rgba(0,0,0,0.9)',
            maxHeight: '92vh', overflowY: 'auto'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <div>
                <span style={{ fontSize: 10, color: 'var(--neon)', fontWeight: 800, textTransform: 'uppercase' }}>
                  {modalExercise.target}
                </span>
                <h3 style={{ fontSize: 16, fontWeight: 900, color: '#fff', margin: '2px 0 0' }}>{modalExercise.name}</h3>
              </div>
              <button
                onClick={() => setModalExercise(null)}
                style={{ background: '#222', border: 'none', color: '#fff', width: 30, height: 30, borderRadius: '50%', fontSize: 15, cursor: 'pointer' }}
              >
                ✕
              </button>
            </div>

            {/* Alternador de Visualização: Vídeo ou GIF */}
            <div style={{ display: 'flex', gap: 6, marginBottom: 12 }}>
              <button
                onClick={() => setModalTab('video')}
                style={{
                  flex: 1, padding: '6px 0', borderRadius: 8, fontSize: 11, fontWeight: 800,
                  background: modalTab === 'video' ? 'var(--neon)' : '#222',
                  color: modalTab === 'video' ? '#000' : '#aaa',
                  border: 'none', cursor: 'pointer'
                }}
              >
                ▶ Vídeo em Português
              </button>
              <button
                onClick={() => setModalTab('gif')}
                style={{
                  flex: 1, padding: '6px 0', borderRadius: 8, fontSize: 11, fontWeight: 800,
                  background: modalTab === 'gif' ? 'var(--neon)' : '#222',
                  color: modalTab === 'gif' ? '#000' : '#aaa',
                  border: 'none', cursor: 'pointer'
                }}
              >
                🔄 GIF Demonstração
              </button>
            </div>

            {/* Player de Vídeo ou GIF */}
            <div style={{ borderRadius: 12, overflow: 'hidden', height: 210, marginBottom: 12, background: '#000', border: '1px solid #222' }}>
              {modalTab === 'video' ? (
                <iframe
                  width="100%"
                  height="100%"
                  src={`https://www.youtube-nocookie.com/embed/${modalExercise.youtubeId}?autoplay=1&rel=0&modestbranding=1`}
                  title={modalExercise.name}
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  style={{ display: 'block' }}
                />
              ) : (
                <img
                  src={modalExercise.gif || modalExercise.img}
                  alt=""
                  style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                />
              )}
            </div>

            {/* Instruções de Biomecânica Passo a Passo */}
            <div style={{ background: '#1c1c1c', borderRadius: 12, padding: 12, marginBottom: 12 }}>
              <div style={{ fontSize: 11, color: 'var(--neon)', fontWeight: 800, marginBottom: 6 }}>
                📋 Execução Correta:
              </div>
              <ul style={{ margin: 0, paddingLeft: 16, fontSize: 12, color: '#ccc', lineHeight: 1.5 }}>
                {modalExercise.instructions?.map((inst, i) => (
                  <li key={i} style={{ marginBottom: 4 }}>{inst}</li>
                )) || <li>{modalExercise.desc}</li>}
              </ul>
              {modalExercise.mistake && (
                <div style={{ marginTop: 8, padding: '6px 8px', borderRadius: 6, background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)', color: '#FCA5A5', fontSize: 11 }}>
                  ⚠️ <strong>Erro comum:</strong> {modalExercise.mistake}
                </div>
              )}
            </div>

            <button
              onClick={() => setModalExercise(null)}
              style={{
                width: '100%', background: 'var(--neon)', color: '#000', border: 'none',
                padding: '12px 0', borderRadius: 10, fontWeight: 900, fontSize: 13, cursor: 'pointer'
              }}
            >
              Entendido, Iniciar Série! 💪
            </button>
          </div>
        </div>
      )}

    </div>
  )
}
