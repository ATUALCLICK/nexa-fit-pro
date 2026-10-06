import { useState, useEffect, useRef } from 'react'
import { CheckCircle, X, Video, Play, Check, Maximize2, Volume2, VolumeX, BookOpen, Headphones, Eye, Dumbbell, Tv } from 'lucide-react'
import db from '../db/database'
import { supabase } from '../lib/supabase'
import { saveWorkoutLog } from '../lib/syncHelpers'
import { adaptarTreinos, getBrasiliaLocaleDateString, getBrasiliaISODate, toBrasiliaISODate } from '../lib/treinoUtils'

// Imagens: locais para exercícios gerados, Unsplash para os demais
const IMG_BASE = 'https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/'
const IMG = {
  bench:        `${IMG_BASE}Dumbbell_Bench_Press/0.jpg`,
  crucifixo:    `${IMG_BASE}Incline_Dumbbell_Flyes/0.jpg`,
  crossover:    `${IMG_BASE}Cable_Crossover/0.jpg`,
  lat:          `${IMG_BASE}Wide-Grip_Lat_Pulldown/0.jpg`,
  squat:        `${IMG_BASE}Barbell_Squat/0.jpg`,
  shoulder:     `${IMG_BASE}Dumbbell_Shoulder_Press/0.jpg`,
  tricepsCorda: `${IMG_BASE}Triceps_Pushdown/0.jpg`,
  remada:       `${IMG_BASE}Bent_Over_Barbell_Row/0.jpg`,
  rosca:        `${IMG_BASE}Barbell_Curl/0.jpg`,
  legPress:     `${IMG_BASE}Leg_Press/0.jpg`,
  extensora:    `${IMG_BASE}Leg_Extensions/0.jpg`,
  elevLateral:  `${IMG_BASE}Side_Lateral_Raise/0.jpg`,
  crunch:       `${IMG_BASE}Crunches/0.jpg`,
  stiff:        `${IMG_BASE}Stiff-Legged_Dumbbell_Deadlift/0.jpg`,
  pantorrinha:  `${IMG_BASE}Standing_Calf_Raises/0.jpg`,
  pushups:      `${IMG_BASE}Push-Up_Wide/0.jpg`,
  pushupDiamond:`${IMG_BASE}Clock_Push-Up/1.jpg`,
  benchDips:    `${IMG_BASE}Push-Ups_With_Feet_Elevated/1.jpg`,
  gluteBridge:  `${IMG_BASE}Pelvic_Tilt_Into_Bridge/1.jpg`,
  chinUps:      `${IMG_BASE}Chin-Up/1.jpg`,
  pullUps:      `${IMG_BASE}Pullups/1.jpg`,
  invertedRow:  `${IMG_BASE}Inverted_Row/0.jpg`,
  gobletSquat:  `${IMG_BASE}Goblet_Squat/0.jpg`,
  plank:        `${IMG_BASE}Plank/0.jpg`,
  inclineMachine: `${IMG_BASE}Smith_Machine_Incline_Bench_Press/0.jpg`,
  frontRaise:   `${IMG_BASE}Front_Dumbbell_Raise/0.jpg`,
}

const GIF_BASE = 'https://cdn.jsdelivr.net/gh/hasaneyldrm/exercises-dataset@main/videos/'
const GIF = {
  dumbbellBench:    `${GIF_BASE}0289-SpYC0Kp.gif`,
  dumbbellFly:      `${GIF_BASE}0308-yz9nUhF.gif`,
  cableCrossover:   `${GIF_BASE}1270-j7XMAyn.gif`,
  tricepsPushdown:  `${GIF_BASE}0241-gAwDzB3.gif`,
  skullCrusher:     `${GIF_BASE}0060-h8LFzo9.gif`,   // Barbell Skull Crusher
  latPulldown:      `${GIF_BASE}0198-RVwzP10.gif`,   // Cable Pulldown
  barbellRow:       `${GIF_BASE}0025-EIeI8Vf.gif`,   // Barbell Bench (usamos para remada visual)
  barbellCurl:      `${GIF_BASE}0031-25GPyDY.gif`,   // Barbell Curl
  altBicepCurl:     `${GIF_BASE}0285-BU15nH4.gif`,   // Dumbbell Alternate Biceps Curl
  barbellSquat:     `${GIF_BASE}0043-qXTaZnJ.gif`,   // Barbell Full Squat
  sledLegPress:     `${GIF_BASE}1425-WWD6FzI.gif`,   // Sled 45° Leg Press
  legExtension:     `${GIF_BASE}0585-my33uHU.gif`,   // Lever Leg Extension
  romanianDL:       `${GIF_BASE}1459-rR0LJzx.gif`,   // Dumbbell Romanian Deadlift
  calfRaise:        `${GIF_BASE}1373-bJYHBIN.gif`,   // Bodyweight Standing Calf Raise
  shoulderPress:    `${GIF_BASE}0219-PzQanLE.gif`,   // Cable Shoulder Press (visual similar)
  lateralRaise:     `${GIF_BASE}0334-DsgkuIt.gif`,   // Dumbbell Lateral Raise
  frontRaise:       `${GIF_BASE}0310-3eGE2JC.gif`,   // Dumbbell Front Raise
  crunch:           `${GIF_BASE}0175-WW95auq.gif`,   // Cable Kneeling Crunch (visual crunch)
  plank:            `${GIF_BASE}0464-CosupLu.gif`,   // Front Plank
  pushup:           `${GIF_BASE}0283-soIB2rj.gif`,   // Diamond Push-up (close)
  chinUp:           `${GIF_BASE}1326-T2mxWqc.gif`,   // Chin-up
  pullUp:           `${GIF_BASE}0652-lBDjFxJ.gif`,   // Pull-up
  invertedRow:      `${GIF_BASE}0499-bZGHsAZ.gif`,   // Inverted Row
  benchDip:         `${GIF_BASE}0129-RrLske5.gif`,   // Bench Dip
  gluteBridge:      `${GIF_BASE}1409-qKBpF7I.gif`,   // Barbell Glute Bridge
  gobletSquat:      `${GIF_BASE}1760-yn8yg1r.gif`,   // Dumbbell Goblet Squat
  inclineMachine:   `${GIF_BASE}0025-EIeI8Vf.gif`,   // Barbell Bench Press (supino inclinado visual)
}

// Base de treinos — adaptada depois pelo perfil
// videoId = YouTube video IDs (prioridade PT-BR quando disponível)
const BASE = {
  A: {
    titulo: 'Peito & Tríceps',
    exercicios: [
      { id: 1,  nome: 'Supino Reto com Halteres',   series: 4, reps: '8-12', descanso: 90,  img: IMG.bench,          gifKey: 'dumbbellBench',    videoId: 'VmB1G1K7v94', descricao: 'Deite no banco segurando um halter em cada mão. Desça os halteres até a altura do peito com controle, cotovelos levemente abertos. Empurre para cima contraindo o peitoral. Mantenha os pés firmes no chão e a lombar com leve curva natural.' },
      { id: 2,  nome: 'Crucifixo Inclinado',         series: 3, reps: '10-12', descanso: 60, img: IMG.crucifixo,       gifKey: 'dumbbellFly',       videoId: 'bDaIL_wOXNw', descricao: 'Banco inclinado a 30-45°. Segure os halteres com braços quase estendidos e abra-os em arco até sentir o alongamento no peitoral. Feche de volta como se abraçasse uma árvore. Foque no peitoral, não nos ombros.' },
      { id: 3,  nome: 'Supino Inclinado na Máquina', series: 3, reps: '10-15', descanso: 60, img: IMG.inclineMachine,  gifKey: 'inclineMachine',   videoId: 'SrqOu55lrYU', descricao: 'Ajuste o assento da máquina Smith para o banco inclinado. Posicione as mãos ligeiramente mais largas que os ombros. Desça até sentir o peitoral ser esticado e empurre de volta contraindo a parte superior do peito.' },
      { id: 4,  nome: 'Crossover Polia Alta',        series: 3, reps: '12-15', descanso: 45, img: IMG.crossover,       gifKey: 'cableCrossover',   videoId: 'taI4XduLpTk', descricao: 'Fique no centro entre as polias altas. Puxe os cabos em arco para baixo e para frente, cruzando as mãos à frente do corpo. Mantenha uma leve flexão nos cotovelos durante todo o movimento. Foque na contração do peitoral no final.' },
      { id: 5,  nome: 'Tríceps na Corda',            series: 4, reps: '10-15', descanso: 60, img: IMG.tricepsCorda,   gifKey: 'tricepsPushdown',  videoId: 'kiuVA0gs3EI', descricao: 'Segure a corda com as duas mãos. Mantenha os cotovelos fixos ao lado do corpo. Empurre a corda para baixo até a extensão completa, abrindo levemente as mãos ao final para maximizar a contração. Suba com controle.' },
      { id: 6,  nome: 'Tríceps Testa',               series: 3, reps: '10-12', descanso: 60, img: IMG.tricepsCorda,   gifKey: 'skullCrusher',     videoId: 'ir5PsbniVSc', descricao: 'Deitado no banco, segure a barra acima do rosto com braços estendidos. Dobre apenas os cotovelos, descendo a barra em direção à testa. Mantenha os cotovelos apontados para o teto. Estenda de volta com contração do tríceps.' },
    ]
  },
  B: {
    titulo: 'Costas & Bíceps',
    exercicios: [
      { id: 7,  nome: 'Puxada Frontal Polia',        series: 4, reps: '8-12',  descanso: 90, img: IMG.lat,    gifKey: 'latPulldown',  videoId: 'CAwf7n6Luuc', descricao: 'Sente-se na máquina de puxada. Segure a barra com pegada larga e puxe em direção ao peito, passando pela linha do queixo. Retraia as escápulas ao puxar. Suba a barra com controle, sem balançar o tronco.' },
      { id: 8,  nome: 'Remada Curvada com Barra',    series: 4, reps: '8-12',  descanso: 90, img: IMG.remada, gifKey: 'barbellRow',   videoId: 'vT2GjY_Umpw', descricao: 'Incline o tronco a 45°, costas retas. Puxe a barra em direção ao abdômen, mantendo os cotovelos próximos ao corpo. Aperte as costas no topo do movimento. Desça com controle sem arredondar a lombar.' },
      { id: 9,  nome: 'Remada Unilateral Halter',    series: 3, reps: '10-12', descanso: 60, img: IMG.remada, gifKey: 'barbellRow',   videoId: 'roCP_6QLTP0', descricao: 'Apoie o joelho e a mão no banco. Puxe o halter em linha reta para cima, cotovelo apontando para o teto. Estenda o braço completamente ao descer. Foque no lat, não no bíceps.' },
      { id: 10, nome: 'Rosca Direta com Barra',      series: 3, reps: '10-12', descanso: 60, img: IMG.rosca,  gifKey: 'barbellCurl',  videoId: 'ykJmrZ5v0Oo', descricao: 'Fique em pé com a barra na pegada supinada (palmas para cima). Cotovelos fixos ao lado do corpo. Flexione os antebraços até o bíceps atingir a contração máxima. Desça lentamente. Evite balançar o tronco.' },
      { id: 11, nome: 'Rosca Alternada com Halteres',series: 3, reps: '12-15', descanso: 45, img: IMG.rosca,  gifKey: 'altBicepCurl', videoId: 'soxrZlIl35U', descricao: 'Em pé ou sentado. Curl alternado: levante um halter de cada vez, girando o punho (supinação) durante o movimento. Isso maximiza a contração do bíceps. Desça devagar antes de trocar de braço.' },
    ]
  },
  C: {
    titulo: 'Pernas Completas',
    exercicios: [
      { id: 12, nome: 'Agachamento Livre',            series: 4, reps: '8-10',  descanso: 120, img: IMG.squat,      gifKey: 'barbellSquat', videoId: 'aclHkVaku9U', descricao: 'Barra nas costas (trapézio), pés na largura dos ombros. Desça com o quadril para trás e para baixo, joelhos alinhados com os pés. Vá até as coxas paralelas ao chão (ou abaixo). Suba empurrando o chão. Lombar sempre neutra.' },
      { id: 13, nome: 'Leg Press 45°',                series: 4, reps: '10-12', descanso: 90,  img: IMG.legPress,   gifKey: 'sledLegPress', videoId: 'IZxyjW7MPJQ', descricao: 'Posicione os pés na plataforma na largura dos ombros. Desça o peso até os joelhos formarem 90°, sem deixar as costas saírem do encosto. Empurre de volta sem travar os joelhos no topo.' },
      { id: 14, nome: 'Cadeira Extensora',            series: 3, reps: '12-15', descanso: 60,  img: IMG.extensora,  gifKey: 'legExtension', videoId: 'YyvSfVjQeL0', descricao: 'Sente-se na cadeira com os tornozelos atrás do rolo. Estenda os joelhos completamente, contraindo o quadríceps no topo. Segure por 1 segundo e desça com controle. Ótimo exercício de isolamento para a frente da coxa.' },
      { id: 15, nome: 'Stiff com Halteres',           series: 3, reps: '10-12', descanso: 60,  img: IMG.stiff,      gifKey: 'romanianDL',   videoId: '1uDiW5--rAE', descricao: 'Em pé, halteres na frente das coxas. Incline o tronco para frente empurrando o quadril para trás, mantendo as costas retas. Desça os halteres ao longo das pernas até sentir o alongamento do posterior de coxa. Suba contraindo glúteos.' },
      { id: 16, nome: 'Panturrilha em Pé',            series: 4, reps: '15-20', descanso: 45,  img: IMG.pantorrinha,gifKey: 'calfRaise',    videoId: 'gwLzBJYoWlQ', descricao: 'Fique na ponta dos pés em uma borda elevada (degrau ou máquina). Desça o calcanhar abaixo do nível da superfície para alongar, depois suba o máximo possível. Faça o movimento lento e controlado para sentir a panturrilha.' },
    ]
  },
  D: {
    titulo: 'Ombros & Abdômen',
    exercicios: [
      { id: 17, nome: 'Desenvolvimento com Halteres', series: 4, reps: '8-12',  descanso: 90, img: IMG.shoulder,    gifKey: 'shoulderPress', videoId: 'qEwKCR5JCog', descricao: 'Sentado ou em pé, halteres ao lado da cabeça na altura dos ombros. Empurre os halteres diretamente para cima até quase tocar no topo. Desça com controle até os braços formarem 90°. Evite arquear a lombar.' },
      { id: 18, nome: 'Elevação Lateral',             series: 4, reps: '12-15', descanso: 45, img: IMG.elevLateral, gifKey: 'lateralRaise',  videoId: 'FeJPLCpQDVc', descricao: 'Em pé, halteres ao lado do corpo. Eleve os braços lateralmente até a altura dos ombros, cotovelos levemente dobrados. O polegar fica ligeiramente para baixo (como despejando água). Desça com controle. Use cargas leves e foque na execução.' },
      { id: 19, nome: 'Elevação Frontal',             series: 3, reps: '12-15', descanso: 45, img: IMG.frontRaise,  gifKey: 'frontRaise',    videoId: 'sOoBKAiPzJU', descricao: 'Em pé, halteres na frente das coxas. Eleve um ou ambos os braços à frente até a altura dos ombros, mantendo os cotovelos quase estendidos. Desça com controle. Foca no deltóide anterior (frente do ombro).' },
      { id: 20, nome: 'Crunch Abdominal',             series: 4, reps: '15-20', descanso: 45, img: IMG.crunch,      gifKey: 'crunch',        videoId: 'Xyd_fa5zoEU', descricao: 'Deitado de costas, joelhos dobrados. Eleve apenas o tronco superior do chão, contraindo o abdômen. Não force o pescoço com as mãos. Suba na expiração e desça na inspiração. Mantenha o movimento controlado e curto.' },
      { id: 21, nome: 'Prancha',                      series: 3, reps: '30-45s', descanso: 45, img: IMG.plank,      gifKey: 'plank',         videoId: 'ASdvN_XEl_c', descricao: 'Apoie antebraços e pontas dos pés. Mantenha o corpo reto da cabeça ao calcanhar — sem elevar o quadril nem deixar afundar. Contraia abdômen, glúteos e respire normalmente. Aumente o tempo progressivamente.' },
    ]
  }
}

const BASE_CALISTENIA = {
  A: {
    titulo: 'Peito & Tríceps (Calistenia)',
    exercicios: [
      { id: 101, nome: 'Flexão de Braço Padrão', series: 4, reps: '10-20', descanso: 60, img: IMG.pushups, gifKey: 'pushup', videoId: 'IODxDxX7oi4' },
      { id: 102, nome: 'Flexão Diamante', series: 3, reps: '8-15', descanso: 60, img: IMG.pushups, gifKey: 'pushup', videoId: 'J0DnG1_S92I' },
      { id: 103, nome: 'Mergulho no Banco (Dips)', series: 3, reps: '10-15', descanso: 60, img: IMG.benchDips, gifKey: 'benchDip', videoId: 'c3ZGl4pAwZ4' },
    ]
  },
  B: {
    titulo: 'Costas & Bíceps (Calistenia)',
    exercicios: [
      { id: 104, nome: 'Barra Fixa Supinada (Chin-ups)', series: 4, reps: '5-12', descanso: 90, img: IMG.chinUps, gifKey: 'chinUp', videoId: 'mRy9m2Q9_1I' },
      { id: 105, nome: 'Barra Fixa Pronada (Pull-ups)', series: 4, reps: '5-12', descanso: 90, img: IMG.pullUps, gifKey: 'pullUp', videoId: 'eGo4IYtlbpU' },
      { id: 106, nome: 'Remada Invertida', series: 3, reps: '10-15', descanso: 60, img: IMG.invertedRow, gifKey: 'invertedRow', videoId: 'XZV9IwluPjw' },
    ]
  },
  C: {
    titulo: 'Pernas & Core (Calistenia)',
    exercicios: [
      { id: 107, nome: 'Agachamento Livre (Pistol opcional)', series: 4, reps: '15-30', descanso: 60, img: IMG.squat, gifKey: 'barbellSquat', videoId: 'aclHkVaku9U' },
      { id: 108, nome: 'Afundo Alternado', series: 4, reps: '10-20', descanso: 60, img: IMG.squat, gifKey: 'barbellSquat', videoId: 'D7KaRcUTQeE' },
      { id: 109, nome: 'Elevação Pélvica Solo', series: 3, reps: '15-20', descanso: 45, img: IMG.gluteBridge, gifKey: 'gluteBridge', videoId: '0H0v_V2Vq1A' },
      { id: 110, nome: 'Prancha', series: 4, reps: '45-60s', descanso: 45, img: IMG.plank, gifKey: 'plank', videoId: 'ASdvN_XEl_c' },
    ]
  }
}

const BASE_CASA = {
  A: {
    titulo: 'Superiores em Casa (Halteres)',
    exercicios: [
      { id: 201, nome: 'Supino com Halteres no Chão', series: 4, reps: '10-15', descanso: 60, img: IMG.bench, gifKey: 'dumbbellBench', videoId: 'uUGDRwge4F8' },
      { id: 202, nome: 'Crucifixo com Halteres no Chão', series: 3, reps: '10-15', descanso: 60, img: IMG.crucifixo, gifKey: 'dumbbellFly', videoId: '1Tq3Qd_n4pI' },
      { id: 203, nome: 'Tríceps Coice com Halter', series: 3, reps: '10-12', descanso: 60, img: IMG.tricepsCorda, gifKey: 'tricepsPushdown', videoId: '1uDiW5--rAE' },
      { id: 204, nome: 'Remada Curvada com Halteres', series: 4, reps: '10-12', descanso: 60, img: IMG.remada, gifKey: 'barbellRow', videoId: 'vT2GjY_Umpw' },
      { id: 205, nome: 'Rosca Direta com Halteres', series: 3, reps: '10-15', descanso: 60, img: IMG.rosca, gifKey: 'altBicepCurl', videoId: 'ykJmrZ5v0Oo' },
    ]
  },
  B: {
    titulo: 'Inferiores em Casa (Halteres)',
    exercicios: [
      { id: 206, nome: 'Agachamento Goblet com Halter', series: 4, reps: '10-15', descanso: 60, img: IMG.gobletSquat, gifKey: 'gobletSquat', videoId: 'MeIiIdhgPyg' },
      { id: 207, nome: 'Afundo com Halteres', series: 4, reps: '10-12', descanso: 60, img: IMG.squat, gifKey: 'barbellSquat', videoId: 'D7KaRcUTQeE' },
      { id: 208, nome: 'Stiff com Halteres', series: 3, reps: '10-15', descanso: 60, img: IMG.stiff, gifKey: 'romanianDL', videoId: '1uDiW5--rAE' },
      { id: 209, nome: 'Elevação de Panturrilha c/ Halter', series: 4, reps: '15-20', descanso: 45, img: IMG.pantorrinha, gifKey: 'calfRaise', videoId: 'gwLzBJYoWlQ' },
    ]
  }
}

const LABELS = { A: 'Peito & Tríceps', B: 'Costas & Bíceps', C: 'Pernas Completas', D: 'Ombros & Abdômen' }

const RANDOM_END_TIMER_AUDIOS = [
  'https://www.myinstants.com/media/sounds/bom-dia-magnata.mp3',
  'https://www.myinstants.com/media/sounds/ai-que-delicia-mickey.mp3',
  'https://www.myinstants.com/media/sounds/lula-vai-todo-mindo-se-fdr.mp3',
  'https://www.myinstants.com/media/sounds/pq-nao-trabaia-toma-sua-gu.mp3',
  'https://www.myinstants.com/media/sounds/byd.mp3',
  'https://www.myinstants.com/media/sounds/nao-sobrou-nada.mp3',
  'https://www.myinstants.com/media/sounds/bora-frango.mp3'
]
const PAPO_AUDIO = 'https://www.myinstants.com/media/sounds/papo-de-undaia.mp3'

export default function Treino() {
  const [user, setUser] = useState(null)
  const [treinos, setTreinos] = useState(null)
  const [tab, setTab] = useState('hoje')
  const [planoTab, setPlanoTab] = useState('A')
  const [hojeTreino, setHojeTreino] = useState([])
  const [timerAtivo, setTimerAtivo] = useState(false)
  const [tempoDescanso, setTempoDescanso] = useState(0)
  const [timerCount, setTimerCount] = useState(0)
  const [videoAtivo, setVideoAtivo] = useState(null)
  const [imagemAtiva, setImagemAtiva] = useState(null)
  const [treinoSalvo, setTreinoSalvo] = useState(false)
  const [treinoConfirmado, setTreinoConfirmado] = useState(false)
  const [somAtivo, setSomAtivo] = useState(true)
  const [descansoCustom, setDescansoCustom] = useState(null) // null = usa o do exercício
  const [seriesFeitas, setSeriesFeitas] = useState({}) // { [id]: nSeries }
  const [pesosExercicios, setPesosExercicios] = useState({})
  const isUltimaSerieRef = useRef(false)
  const [tvAberto, setTvAberto] = useState(false)
  const [tvExpandido, setTvExpandido] = useState(false)
  const [tvCanal, setTvCanal] = useState('warner')
  const [showCanais, setShowCanais] = useState(false)
  const salvarPesoExercicio = async (exId, peso) => {
     setPesosExercicios(prev => {
        const next = { ...prev, [exId]: peso }
        localStorage.setItem('bronks_weights', JSON.stringify(next))
        return next
     })
  }

  const syncPesoExercicio = async (exId, peso) => {
     if (user?.celular && peso) {
        try {
           await supabase.from('exercise_weights').upsert(
              { celular: user.celular, exercicio_id: exId, peso: Number(peso), updated_at: new Date().toISOString() }, 
              { onConflict: 'celular,exercicio_id' }
           )
        } catch(e) {}
     }
  }

  const toggleRadio = () => {
    window.dispatchEvent(new Event('openRadio'))
  }

  const somAtivoRef = useRef(true)
  useEffect(() => { somAtivoRef.current = somAtivo }, [somAtivo])

  // Refs para Áudios persistentes
  const beepAudioRef = useRef(null)
  const papoAudioRef = useRef(null)
  const frangoAudiosRef = useRef([])

  useEffect(() => {
    beepAudioRef.current = new Audio('https://actions.google.com/sounds/v1/alarms/beep_short.ogg')
    papoAudioRef.current = new Audio(PAPO_AUDIO)
    frangoAudiosRef.current = RANDOM_END_TIMER_AUDIOS.map(url => new Audio(url))
    
    // Desbloqueia o áudio no primeiro toque do usuário
    const unlock = () => {
      const unlockAudio = (a) => {
        if (a) {
          a.load() // Crucial para iOS
          const p = a.play()
          if (p !== undefined) {
            p.then(() => {
              a.pause()
              a.currentTime = 0
            }).catch(() => {})
          }
        }
      }
      unlockAudio(beepAudioRef.current)

      document.removeEventListener('touchstart', unlock)
      document.removeEventListener('click', unlock)
    }
    document.addEventListener('touchstart', unlock, { once: true })
    document.addEventListener('click', unlock, { once: true })
    return () => {
      document.removeEventListener('touchstart', unlock)
      document.removeEventListener('click', unlock)
    }
  }, [])

  const playBeep = () => {
    if (!somAtivoRef.current || !beepAudioRef.current) return
    try {
      beepAudioRef.current.currentTime = 0
      beepAudioRef.current.volume = 0.5
      beepAudioRef.current.play().catch(() => {})
    } catch(e) { console.warn('Beep error:', e) }
  }

  const playFrango = () => {
    if (!somAtivoRef.current || frangoAudiosRef.current.length === 0) return
    try {
      const idx = Math.floor(Math.random() * frangoAudiosRef.current.length)
      const audio = frangoAudiosRef.current[idx]
      audio.currentTime = 0
      audio.volume = 0.85
      audio.play().catch(() => {})
    } catch(e) {}
  }

  const playPapo = () => {
    if (!somAtivoRef.current || !papoAudioRef.current) return
    try {
      papoAudioRef.current.currentTime = 0
      papoAudioRef.current.volume = 0.85
      papoAudioRef.current.play().catch(() => {})
    } catch(e) {}
  }

  const [explicacaoAtiva, setExplicacaoAtiva] = useState(null)
  const [treinoHojeKey, setTreinoHojeKey] = useState('A')

  // Helper para corrigir URLs
  const getSafeImage = (url) => {
    if (!url) return ''
    let safe = url.replace('raw.githubusercontent.com/yuhonas/free-exercise-db/main', 'cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main')
    safe = safe.replace('cdn.statically.io/gh/yuhonas/free-exercise-db/main', 'cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main')
    
    // Força a correção de nomes de pastas e arquivos para calistenia
    if (safe.includes('Chin-up') || safe.includes('Chin_Up')) {
      return 'https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/Chin-Up/1.jpg'
    }
    if (safe.includes('Pull-up') || safe.includes('Pull_Up') || safe.includes('Pullups')) {
      return 'https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/Pullups/1.jpg'
    }
    if (safe.includes('Pushups')) {
      return 'https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/Push_Up/0.jpg'
    }
    
    return safe
  }

  // Componente interno
  const ExercicioCard = ({ ex, onCheck, mostrarCheck = true, onShowVideo, onShowImage, isLocked = false }) => (
    <div style={{
      background: ex.concluido ? 'rgba(76,175,80,0.06)' : 'rgba(255,255,255,0.03)',
      border: `1px solid ${ex.concluido ? 'rgba(76,175,80,0.25)' : 'rgba(255,255,255,0.07)'}`,
      borderRadius: '20px', padding: '14px 14px 10px', marginBottom: '12px',
      transition: 'all 0.3s ease', position: 'relative'
    }}>
      {/* Linha superior: imagem + info + botões */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
        {/* Imagem clicável */}
        <div 
          onClick={() => onShowImage && onShowImage(ex)}
          style={{ 
            width: '70px', height: '70px', borderRadius: '14px', background: 'var(--card)', border: '2px solid #FFD700', overflow: 'hidden', cursor: 'pointer', flexShrink: 0, position: 'relative' 
          }}
        >
          <img src={getSafeImage(ex.img)} alt={ex.nome} style={{ width: '100%', height: '100%', objectFit: 'cover' }} loading="lazy" />
          <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Eye size={20} color="#FFD700" />
          </div>
        </div>

        {/* Nome + badges */}
        <div style={{ 
          flex: 1, minWidth: 0,
          opacity: isLocked ? 0.2 : (ex.concluido ? 0.65 : 1), 
          filter: isLocked ? 'grayscale(1)' : 'none',
          pointerEvents: isLocked ? 'none' : 'auto'
        }}>
          <h4 style={{ color: '#fff', fontSize: '14px', fontWeight: '700', margin: '0 0 6px', lineHeight: 1.2 }}>{ex.nome}</h4>
          {/* Badges coloridos de séries e reps */}
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
            <span style={{ 
              background: 'rgba(255,215,0,0.15)', border: '1px solid rgba(255,215,0,0.4)',
              color: '#FFD700', fontSize: '11px', fontWeight: '800', padding: '3px 8px', borderRadius: '8px'
            }}>
              {ex.series} séries
            </span>
            <span style={{ 
              background: 'rgba(99,179,237,0.15)', border: '1px solid rgba(99,179,237,0.4)',
              color: '#63B3ED', fontSize: '11px', fontWeight: '800', padding: '3px 8px', borderRadius: '8px'
            }}>
              {ex.reps} reps
            </span>
            <span style={{ 
              background: 'rgba(154,230,180,0.12)', border: '1px solid rgba(154,230,180,0.3)',
              color: '#9AE6B4', fontSize: '11px', fontWeight: '700', padding: '3px 8px', borderRadius: '8px'
            }}>
              {ex.descanso}s desc.
            </span>
          </div>
        </div>

        {/* Botões direita */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', pointerEvents: isLocked ? 'none' : 'auto', opacity: isLocked ? 0.1 : 1 }}>
          <button 
            onClick={() => !isLocked && onShowVideo && onShowVideo(ex)}
            style={{ 
              background: 'rgba(255,215,0,0.12)', border: '1px solid rgba(255,215,0,0.25)', 
              borderRadius: '12px', width: '38px', height: '38px', cursor: !isLocked ? 'pointer' : 'default', 
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 
            }}
            title="Ver vídeo"
          >
            <Video size={16} color="#FFD700" />
          </button>

          {mostrarCheck && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px' }}>
              {/* Indicadores de série */}
              {ex.series > 1 && (
                <div style={{ display: 'flex', gap: '3px' }}>
                  {Array.from({ length: ex.series }).map((_, i) => (
                    <div key={i} style={{
                      width: '8px', height: '8px', borderRadius: '50%',
                      background: i < (seriesFeitas[ex.id] || (ex.concluido ? ex.series : 0))
                        ? '#4CAF50' : 'rgba(255,255,255,0.15)'
                    }} />
                  ))}
                </div>
              )}
              <button
                onClick={() => !isLocked && onCheck(ex.id)}
                style={{ 
                  width: '44px', height: '44px', borderRadius: '12px', border: 'none', 
                  background: ex.concluido ? '#4CAF50' : 'rgba(255,165,0,0.15)', 
                  border: ex.concluido ? 'none' : '1px solid rgba(255,165,0,0.4)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', 
                  cursor: !isLocked && !ex.concluido ? 'pointer' : 'default', flexShrink: 0
                }}
                title={ex.concluido ? 'Concluído!' : `Série ${(seriesFeitas[ex.id]||0)+1} de ${ex.series}`}
              >
                {ex.concluido 
                  ? <Check size={20} color="#fff" strokeWidth={3} />
                  : <span style={{ color: '#FFA500', fontWeight: '900', fontSize: '13px' }}>
                      {(seriesFeitas[ex.id]||0)+1}/{ex.series}
                    </span>
                }
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Botão de explicação e Input de Peso */}
      {!isLocked && (
        <div style={{ marginTop: '10px', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
          {ex.descricao ? (
            <button
              onClick={() => setExplicacaoAtiva(explicacaoAtiva?.id === ex.id ? null : ex)}
              style={{ 
                background: 'transparent', border: 'none', color: '#888', 
                fontSize: '12px', cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center', gap: '5px'
              }}
            >
              <BookOpen size={13} color="#888" />
              {explicacaoAtiva?.id === ex.id ? 'Ocultar explicação' : 'Como executar'}
            </button>
          ) : <div />}

          {/* Registro de Carga */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
             <Dumbbell size={14} color="#aaa" />
             <input
                type="number"
                placeholder="Carga (kg)"
                value={pesosExercicios[ex.id] || ''}
                onChange={(e) => salvarPesoExercicio(ex.id, e.target.value)}
                onBlur={(e) => syncPesoExercicio(ex.id, e.target.value)}
                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', padding: '4px 8px', borderRadius: '6px', fontSize: '12px', width: '75px', outline: 'none', textAlign: 'center' }}
             />
          </div>

          {explicacaoAtiva?.id === ex.id && ex.descricao && (
            <p style={{ width: '100%', color: '#aaa', fontSize: '12px', lineHeight: 1.6, margin: '8px 0 0', padding: '10px', background: 'rgba(255,255,255,0.03)', borderRadius: '10px' }}>
              {ex.descricao}
            </p>
          )}
        </div>
      )}
    </div>
  )
  const carregarTreinoParaHoje = (key, userObj, treinosObj) => {
    if (!treinosObj[key]) return;
    setTreinoHojeKey(key);
    
    const diaSemana = new Date().getDay()
    const extras = []
    if (userObj && userObj.atividades_extras) {
      Object.entries(userObj.atividades_extras).forEach(([ativ, dias], idx) => {
        if (dias.includes(diaSemana)) {
          extras.push({
            id: 900 + idx, nome: ativ + ' (Complementar)', series: 1, reps: 'Meta diária', descanso: 0, concluido: false, img: IMG.crunch
          })
        }
      })
    }
    
    setHojeTreino([...treinosObj[key].exercicios, ...extras]);
  }

  useEffect(() => {
    db.users.toArray().then(async users => {
      if (users.length > 0) {
        const u = users[0]
        setUser(u)
        let t = adaptarTreinos(u)

        // Carrega pesos dos exercícios
        if (u.celular) {
           supabase.from('exercise_weights').select('exercicio_id, peso').eq('celular', u.celular)
             .then(({ data: weights }) => {
                if (weights) {
                   const wp = {}
                   weights.forEach(w => wp[w.exercicio_id] = w.peso)
                   setPesosExercicios(wp)
                   localStorage.setItem('bronks_weights', JSON.stringify(wp))
                }
             })
             .catch(() => {
                const localW = JSON.parse(localStorage.getItem('bronks_weights') || '{}')
                setPesosExercicios(localW)
             })
        } else {
           const localW = JSON.parse(localStorage.getItem('bronks_weights') || '{}')
           setPesosExercicios(localW)
        }

        // Carrega customizações de exercícios do admin
        try {
          const { data: overrides } = await supabase.from('admin_exercises').select('*')
          if (overrides && overrides.length > 0) {
            const map = {}
            overrides.forEach(o => { map[o.exercise_id] = o })
            // Aplica overrides em todos os treinos
            for (const key of Object.keys(t)) {
              t[key].exercicios = t[key].exercicios.map(ex => {
                const ov = map[ex.id]
                if (!ov) return ex
                return {
                  ...ex,
                  ...(ov.video_id && { videoId: ov.video_id }),
                  ...(ov.imagem_url && { img: ov.imagem_url }),
                  ...(ov.descricao && { descricao: ov.descricao }),
                  ...(ov.series && { series: ov.series }),
                  ...(ov.reps && { reps: ov.reps }),
                  ...(ov.descanso && { descanso: ov.descanso }),
                }
              })
            }
          }
        } catch(e) { console.warn('Admin overrides offline', e) }

        setTreinos(t)

        db.workouts.toArray().then(async (logs) => {
          let loaded = false
          const completed = logs.filter(l => l.completado)
          
          const hojeStr = getBrasiliaISODate()
          const logHoje = completed.find(l => toBrasiliaISODate(l.data) === hojeStr)
          let treinouHoje = !!(logHoje && logHoje.completado)
          
          // 1. Tenta carregar do LocalStorage (mais recente para a sessão atual)
          const savedStateStr = localStorage.getItem('bronks_workout_state')
          if (savedStateStr) {
            try {
              const savedState = JSON.parse(savedStateStr)
              if (savedState.date === hojeStr) {
                setTreinoHojeKey(savedState.treinoHojeKey)
                const freshTreino = t[savedState.treinoHojeKey]?.exercicios || []
                const mergedTreino = savedState.hojeTreino.map(cachedEx => {
                  const freshEx = freshTreino.find(f => f.id === cachedEx.id) || {}
                  return { ...freshEx, ...cachedEx, descricao: freshEx.descricao || cachedEx.descricao }
                })
                setHojeTreino(mergedTreino)
                setTreinoConfirmado(savedState.treinoConfirmado)
                if (savedState.seriesFeitas) {
                  setSeriesFeitas(savedState.seriesFeitas)
                  seriesFeitasRef.current = savedState.seriesFeitas
                }
                loaded = true
              }
            } catch (e) { console.error(e) }
          }
          
          // 2. Se não achou localmente como completado ou em progresso, checa na nuvem (cross-device sync)
          if (!treinouHoje && !loaded && u.celular) {
            try {
              const { data: cloudLog } = await supabase
                .from('workout_logs')
                .select('*')
                .eq('celular', u.celular)
                .eq('data', hojeStr)
                .maybeSingle()
              
              if (cloudLog) {
                await db.workouts.where('data').startsWith(hojeStr).delete()
                await db.workouts.add({ 
                  data: hojeStr + 'T12:00:00Z', 
                  tipo: cloudLog.tipo, 
                  completado: cloudLog.completado,
                  series_feitas: cloudLog.series_feitas,
                  exercicios_concluidos: cloudLog.exercicios_concluidos,
                  total_exercicios: cloudLog.total_exercicios
                })
                
                if (cloudLog.completado) {
                  treinouHoje = true
                } else if (cloudLog.series_feitas && Object.keys(cloudLog.series_feitas).length > 0) {
                  const key = cloudLog.tipo || 'A'
                  setTreinoHojeKey(key)
                  const baseExs = t[key]?.exercicios || []
                  const progressExs = baseExs.map(ex => ({
                    ...ex,
                    concluido: (cloudLog.series_feitas[ex.id] || 0) >= ex.series
                  }))
                  setHojeTreino(progressExs)
                  setSeriesFeitas(cloudLog.series_feitas)
                  seriesFeitasRef.current = cloudLog.series_feitas
                  setTreinoConfirmado(true)
                  loaded = true 
                }
              }
            } catch(e) { console.warn('Cloud workout check failed:', e) }
          }
          
          if (treinouHoje) {
            setTreinoSalvo(true)
            const key = logHoje?.tipo || 'A'
            carregarTreinoParaHoje(key, u, t)
            return
          }

          if (!loaded) {
            const completedTreinos = completed.filter(l => l.tipo !== 'Descanso')
            let nextKey = 'A'
            if (completedTreinos.length > 0) {
              const lastType = completedTreinos[completedTreinos.length - 1].tipo
              const keys = Object.keys(t)
              const idx = keys.indexOf(lastType)
              if (idx >= 0) {
                nextKey = keys[(idx + 1) % keys.length]
              }
            }
            carregarTreinoParaHoje(nextKey, u, t)
          }
        })
      }
    })
  }, [])

  useEffect(() => {
    if (hojeTreino.length > 0 && !treinoSalvo) {
              localStorage.setItem('bronks_workout_state', JSON.stringify({
        date: getBrasiliaISODate(),
        treinoHojeKey,
        hojeTreino,
        treinoConfirmado,
        seriesFeitas: seriesFeitasRef.current
      }))
    }
  }, [hojeTreino, treinoConfirmado, treinoHojeKey, treinoSalvo, seriesFeitas])

  const selecionarTreinoHoje = (key) => {
    carregarTreinoParaHoje(key, user, treinos)
    setTreinoConfirmado(false)
  }

  // Timer de descanso (por série)
  const playBeepRef = useRef(null)
  const playFrangoRef = useRef(null)
  const playPapoRef = useRef(null)
  useEffect(() => { 
    playBeepRef.current = playBeep
    playFrangoRef.current = playFrango
    playPapoRef.current = playPapo
  }, [somAtivo])

  useEffect(() => {
    if (!timerAtivo || timerCount <= 0) {
      if (timerCount <= 0 && timerAtivo) setTimerAtivo(false)
      return
    }
    const interval = setInterval(() => {
      setTimerCount(c => {
        const next = c - 1
        if (next <= 5 && next > 0) playBeepRef.current?.()
        if (next === 0) {
          setTimeout(() => playBeepRef.current?.(), 0)
          setTimeout(() => playBeepRef.current?.(), 300)
        }
        return next
      })
    }, 1000)
    return () => clearInterval(interval)
  }, [timerAtivo, timerCount])

  const seriesFeitasRef = useRef({})

  if (!user || !treinos) return <div className="p16"><div className="spinner"></div></div>

  // Registra UMA série feita e dispara o timer de descanso
  const registrarSerie = async (id) => {
    if (!treinoConfirmado) return
    const ex = hojeTreino.find(e => e.id === id)
    if (!ex || ex.concluido) return

    const anterior = seriesFeitasRef.current[id] || 0
    const atual = anterior + 1
    seriesFeitasRef.current[id] = atual
    setSeriesFeitas(prev => ({ ...prev, [id]: atual }))

    let novoHojeTreino = hojeTreino
    if (atual >= ex.series) {
      novoHojeTreino = hojeTreino.map(e => e.id === id ? { ...e, concluido: true } : e)
      setHojeTreino(novoHojeTreino)
    }

    // Salva progresso no Supabase a cada série
    if (user?.celular) {
      const concluidos = novoHojeTreino.filter(e => e.concluido).length
      await saveWorkoutLog(user.celular, {
        tipo: treinoHojeKey,
        seriesFeitas: seriesFeitasRef.current,
        exerciciosConcluidos: concluidos,
        totalExercicios: novoHojeTreino.length,
        completado: false
      })
    }

    // Dispara timer para todas as séries (incluindo a de finalização do exercício)
    isUltimaSerieRef.current = atual >= ex.series
    
    const tempo = descansoCustom !== null ? descansoCustom : ex.descanso
    if (tempo > 0) {
      setTimerCount(tempo)
      setTimerAtivo(true)
    }
  }


  const toggleConcluido = (id) => {
    if (!treinoConfirmado) return
    const ex = hojeTreino.find(e => e.id === id)
    setHojeTreino(hojeTreino.map(e => e.id === id ? { ...e, concluido: !ex.concluido } : e))
  }

  const concluidos = hojeTreino.filter(e => e.concluido).length
  const total = hojeTreino.length
  const progresso = total > 0 ? (concluidos / total) * 100 : 0

  const finalizarTreino = async () => {
    try {
      const dataStr = new Date().toISOString()
      const hojeStr = new Date().toLocaleDateString()
      await db.workouts.add({ data: dataStr, tipo: treinoHojeKey, completado: true })
      
      // Sincroniza com Supabase (log dedicado + campo no perfil)
      if (user?.celular) {
        await saveWorkoutLog(user.celular, {
          tipo: treinoHojeKey,
          seriesFeitas: seriesFeitasRef.current,
          exerciciosConcluidos: hojeTreino.length,
          totalExercicios: hojeTreino.length,
          completado: true
        })
        // Atualiza campo legado no perfil
        await supabase.from('profiles').update({
          workout_log: { date: hojeStr, type: treinoHojeKey, completed: true, timestamp: dataStr }
        }).eq('celular', user.celular)
      }

      setTreinoSalvo(true)
    } catch (err) { console.error('Erro ao salvar treino:', err) }
  }

  const pularTreino = async () => {
    if (window.confirm('Tem certeza que não vai treinar hoje? Isso será registrado no seu progresso.')) {
      try {
        const dataStr = new Date().toISOString()
        const hojeStr = new Date().toLocaleDateString()
        await db.workouts.add({ data: dataStr, tipo: 'Descanso', completado: true })
        
        // Sincroniza com Supabase
        if (user?.celular) {
          await supabase.from('profiles').update({
            workout_log: { date: hojeStr, type: 'Descanso', completed: true, timestamp: dataStr }
          }).eq('celular', user.celular)
        }

        setTreinoSalvo(true)
        setTreinoConfirmado(true)
        setHojeTreino([]) // Limpa a lista pra mostrar que finalizou
      } catch (err) { console.error('Erro ao pular treino:', err) }
    }
  }

  const listaPlano = treinos[planoTab]?.exercicios || []



  return (
    <div style={{ paddingBottom: '100px' }}>
      <div style={{ padding: '24px 20px 0', marginBottom: '4px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1 style={{ color: '#fff', fontSize: '24px', fontWeight: 'bold', margin: 0 }}>Meus Treinos</h1>
          <p style={{ color: '#555', fontSize: '13px', margin: '4px 0 0' }}>
            Adaptado para: <span style={{ color: '#FFD700', fontWeight: 'bold' }}>{user.objetivo || 'Hipertrofia'}</span>
          </p>
        </div>
        <button 
          onClick={toggleRadio}
          style={{ 
            background: 'rgba(255,255,255,0.05)', 
            border: '1px solid rgba(255,255,255,0.1)', 
            borderRadius: '12px', padding: '10px', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', transition: 'all 0.2s'
          }}
        >
          <Headphones size={18} color="#FFD700" />
          <span style={{ color: '#FFD700', fontSize: '11px', fontWeight: 'bold' }}>MÚSICA</span>
        </button>
        
        <button 
          onClick={() => setTvAberto(!tvAberto)}
          style={{ 
            background: tvAberto ? '#FFD700' : 'rgba(255,255,255,0.05)', 
            border: '1px solid rgba(255,255,255,0.1)', 
            borderRadius: '12px', padding: '10px', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', transition: 'all 0.2s'
          }}
        >
          <Tv size={18} color={tvAberto ? '#000' : '#FFD700'} />
          <span style={{ color: tvAberto ? '#000' : '#FFD700', fontSize: '11px', fontWeight: 'bold' }}>TV</span>
        </button>
      </div>

      {/* IPTV Player Inline */}
      {tvAberto && (() => {
        const TV_CANAIS = [
          { cat: 'Filmes & Séries', canais: [
            { id: 'warner', nome: 'Warner Channel' },
            { id: 'hbo', nome: 'HBO' },
            { id: 'hbo2', nome: 'HBO 2' },
            { id: 'tnt', nome: 'TNT' },
            { id: 'telecine-premium', nome: 'Telecine Premium' },
            { id: 'telecine-action', nome: 'Telecine Action' },
            { id: 'megapix', nome: 'Megapix' },
            { id: 'universal', nome: 'Universal TV' },
            { id: 'fx', nome: 'FX' },
            { id: 'space', nome: 'Space' },
            { id: 'a-e', nome: 'A&E' },
            { id: 'amc', nome: 'AMC' },
            { id: 'paramount', nome: 'Paramount' },
            { id: 'star-channel', nome: 'Star Channel' },
            { id: 'axn', nome: 'AXN' },
            { id: 'cinemax', nome: 'Cinemax' },
          ]},
          { cat: 'Esportes', canais: [
            { id: 'sportv', nome: 'SporTV' },
            { id: 'sportv2', nome: 'SporTV 2' },
            { id: 'sportv3', nome: 'SporTV 3' },
            { id: 'espn', nome: 'ESPN' },
            { id: 'espn2', nome: 'ESPN 2' },
            { id: 'espn3', nome: 'ESPN 3' },
            { id: 'espn4', nome: 'ESPN 4' },
            { id: 'premiere', nome: 'Premiere' },
            { id: 'combate', nome: 'Combate' },
            { id: 'band-sports', nome: 'Band Sports' },
            { id: 'nsports', nome: 'NSports' },
          ]},
          { cat: 'Variedades', canais: [
            { id: 'globo', nome: 'TV Globo' },
            { id: 'multishow', nome: 'Multishow' },
            { id: 'gnt', nome: 'GNT' },
            { id: 'discovery', nome: 'Discovery' },
            { id: 'history', nome: 'History' },
            { id: 'natgeo', nome: 'Nat Geo' },
            { id: 'food-network', nome: 'Food Network' },
            { id: 'animal-planet', nome: 'Animal Planet' },
            { id: 'discovery-turbo', nome: 'Discovery Turbo' },
            { id: 'tlc', nome: 'TLC' },
          ]},
          { cat: 'Infantil', canais: [
            { id: 'cartoon', nome: 'Cartoon Network' },
            { id: 'disney-channel', nome: 'Disney Channel' },
            { id: 'nickelodeon', nome: 'Nickelodeon' },
            { id: 'discovery-kids', nome: 'Discovery Kids' },
            { id: 'gloob', nome: 'Gloob' },
          ]},
          { cat: 'Notícias', canais: [
            { id: 'globo-news', nome: 'Globo News' },
            { id: 'band-news', nome: 'Band News' },
            { id: 'cnn-brasil', nome: 'CNN Brasil' },
            { id: 'record-news', nome: 'Record News' },
          ]},
        ]
        const EMBED_BASE = 'https://embedcanaisdetv.xyz/e/index.php?canal='
        return (
          <div style={{ margin: '12px 20px', borderRadius: '14px', overflow: 'hidden', border: '2px solid rgba(255, 215, 0, 0.4)', background: '#0a0a0a', position: 'relative' }}>
            {/* Player area */}
            <div style={{ position: 'relative', width: '100%', height: tvExpandido ? '55vh' : '200px', transition: 'height 0.3s', background: '#000' }}>
              <iframe
                key={tvCanal}
                src={`${EMBED_BASE}${tvCanal}`}
                title="TV Ao Vivo"
                style={{ width: '100%', height: '100%', border: 'none' }}
                allow="autoplay; fullscreen; encrypted-media"
                allowFullScreen
                sandbox="allow-scripts allow-same-origin allow-forms"
                loading="lazy"
              />
              {/* Overlay controls */}
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '40px', background: 'linear-gradient(to bottom, rgba(0,0,0,0.85), transparent)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 10px', zIndex: 5 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#f44', boxShadow: '0 0 6px #f44', animation: 'pulse 2s infinite' }} />
                  <span style={{ color: '#fff', fontSize: '12px', fontWeight: 'bold', textShadow: '0 1px 3px #000' }}>
                    {TV_CANAIS.flatMap(c => c.canais).find(c => c.id === tvCanal)?.nome || 'TV'}
                  </span>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button onClick={() => setShowCanais(!showCanais)} style={{ background: 'rgba(255,215,0,0.2)', border: '1px solid rgba(255,215,0,0.4)', borderRadius: '8px', width: '30px', height: '30px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }} title="Canais">
                    <Tv size={14} color="#FFD700" />
                  </button>
                  <button onClick={() => setTvExpandido(!tvExpandido)} style={{ background: 'rgba(255,255,255,0.15)', border: 'none', borderRadius: '8px', width: '30px', height: '30px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                    <Maximize2 size={14} color="#fff" />
                  </button>
                  <button onClick={() => { setTvAberto(false); setShowCanais(false) }} style={{ background: 'rgba(255,255,255,0.15)', border: 'none', borderRadius: '8px', width: '30px', height: '30px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                    <X size={14} color="#fff" />
                  </button>
                </div>
              </div>
            </div>

            {/* Channel list panel */}
            {showCanais && (
              <div style={{ maxHeight: '250px', overflowY: 'auto', background: '#111', borderTop: '1px solid rgba(255,215,0,0.2)', padding: '10px' }}>
                {TV_CANAIS.map(grupo => (
                  <div key={grupo.cat} style={{ marginBottom: '10px' }}>
                    <p style={{ color: '#FFD700', fontSize: '11px', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '1px', margin: '0 0 6px', padding: '0 4px' }}>{grupo.cat}</p>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                      {grupo.canais.map(c => (
                        <button
                          key={c.id}
                          onClick={() => { setTvCanal(c.id); setShowCanais(false) }}
                          style={{
                            padding: '6px 10px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontSize: '11px', fontWeight: '700', transition: 'all 0.2s',
                            background: tvCanal === c.id ? '#FFD700' : 'rgba(255,255,255,0.08)',
                            color: tvCanal === c.id ? '#000' : '#ccc',
                          }}
                        >
                          {c.nome}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )
      })()}

      {/* Tabs */}
      <div style={{ display: 'flex', margin: '16px 20px', background: 'rgba(255,255,255,0.05)', borderRadius: '14px', padding: '4px', gap: '4px' }}>
        {[['hoje', 'Hoje'], ['plano', 'Plano Completo']].map(([key, label]) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            style={{ flex: 1, height: '38px', borderRadius: '10px', border: 'none', cursor: 'pointer', fontWeight: 'bold', fontSize: '13px', transition: 'all 0.2s',
              background: tab === key ? '#fff' : 'transparent',
              color: tab === key ? '#000' : '#666'
            }}
          >{label}</button>
        ))}
      </div>

      <div style={{ padding: '0 20px' }}>
        {tab === 'hoje' && (
          <div>
            <div style={{ marginBottom: '16px', display: 'flex', gap: '10px', alignItems: 'center' }}>
              <select 
                value={treinoHojeKey} 
                onChange={(e) => selecionarTreinoHoje(e.target.value)}
                style={{ flex: 1, padding: '10px', borderRadius: '12px', background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', outline: 'none' }}
              >
                {Object.keys(treinos).map(k => (
                  <option key={k} value={k} style={{ color: '#000' }}>Treino {k} - {treinos[k].titulo.split('(')[0]}</option>
                ))}
              </select>
              {!treinoSalvo && (
                <button onClick={pularTreino} style={{ background: 'rgba(229,57,53,0.15)', color: '#e53935', border: '1px solid rgba(229,57,53,0.3)', padding: '10px 16px', borderRadius: '12px', fontWeight: 'bold', cursor: 'pointer', whiteSpace: 'nowrap' }}>
                  Hoje não
                </button>
              )}
            </div>

            {/* Mensagem de Conclusão se já treinou */}
            {treinoSalvo && (
              <div style={{ background: 'rgba(76,175,80,0.1)', border: '1px solid rgba(76,175,80,0.3)', borderRadius: '16px', padding: '24px', textAlign: 'center', marginBottom: '24px' }}>
                <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: '#4CAF50', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', boxShadow: '0 4px 20px rgba(76,175,80,0.4)' }}>
                  <Check size={32} color="#fff" strokeWidth={3} />
                </div>
                <h3 style={{ color: '#fff', fontSize: '20px', fontWeight: 'bold', margin: '0 0 8px' }}>Treino Concluído!</h3>
                <p style={{ color: '#aaa', fontSize: '14px', margin: '0' }}>Você já finalizou o treino de hoje. Bom descanso, monstro!</p>
              </div>
            )}

            {/* Hero card */}
            {hojeTreino.length > 0 && !treinoSalvo && (
              <div style={{ borderRadius: '18px', overflow: 'hidden', marginBottom: '16px', background: 'linear-gradient(rgba(0,0,0,0.55), rgba(0,0,0,0.85)), url("https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=800&auto=format&fit=crop") center/cover', padding: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                  <div>
                    <span style={{ background: 'rgba(255,215,0,0.9)', color: '#000', padding: '3px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: 'bold' }}>TREINO {treinoHojeKey}</span>
                    <h3 style={{ color: '#fff', fontSize: '20px', fontWeight: 'bold', margin: '8px 0 0' }}>{treinos[treinoHojeKey]?.titulo}</h3>
                  </div>
                  <span style={{ color: '#FFD700', fontSize: '22px', fontWeight: '900' }}>{Math.round(progresso)}%</span>
                </div>
                <div style={{ background: 'rgba(255,255,255,0.2)', borderRadius: '6px', height: '5px', overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${progresso}%`, background: '#FFD700', transition: 'width 0.5s', borderRadius: '6px' }} />
                </div>
              </div>
            )}

            {!treinoConfirmado && hojeTreino.length > 0 && !treinoSalvo && (
              <button 
                onClick={() => setTreinoConfirmado(true)} 
                style={{ width: '100%', height: '52px', background: 'linear-gradient(135deg, #FFD700, #FFA500)', border: 'none', borderRadius: '16px', color: '#000', fontWeight: 'bold', fontSize: '16px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '16px', boxShadow: '0 4px 14px rgba(255,215,0,0.3)' }}
              >
                <Play size={20} fill="#000" /> Confirmar Treino
              </button>
            )}

            {/* Seletor de tempo de descanso */}
            {treinoConfirmado && !treinoSalvo && (
              <div style={{ marginBottom: '16px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '16px', padding: '12px 14px' }}>
                <p style={{ color: '#888', fontSize: '11px', fontWeight: '600', margin: '0 0 8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Tempo de Descanso entre Séries</p>
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                  {[15, 30, 45, 60, 90, 120].map(t => {
                    const ex = hojeTreino[0]
                    const recomendado = ex?.descanso === t
                    const selected = descansoCustom === t || (descansoCustom === null && recomendado)
                    return (
                      <button key={t} onClick={() => setDescansoCustom(descansoCustom === t && !recomendado ? null : t)}
                        style={{
                          padding: '6px 12px', borderRadius: '10px', border: 'none', cursor: 'pointer',
                          fontWeight: '700', fontSize: '12px', transition: 'all 0.2s',
                          background: selected ? '#FFA500' : 'rgba(255,255,255,0.06)',
                          color: selected ? '#000' : '#aaa',
                          position: 'relative'
                        }}
                      >
                        {t}s{recomendado ? ' ★' : ''}
                      </button>
                    )
                  })}
                  {descansoCustom !== null && (
                    <button onClick={() => setDescansoCustom(null)}
                      style={{ padding: '6px 12px', borderRadius: '10px', border: 'none', background: '#FFD700', color: '#000', fontWeight: 'bold', cursor: 'pointer', fontSize: '12px', boxShadow: '0 2px 8px rgba(255,215,0,0.3)' }}
                    >Reset</button>
                  )}
                </div>
              </div>
            )}

            {/* Exercícios */}
            {!treinoSalvo && hojeTreino.map(ex => (
              <div key={ex.id}>
                {ExercicioCard({
                  ex, 
                  isLocked: !treinoConfirmado,
                  onCheck: registrarSerie, 
                  onShowVideo: setVideoAtivo, 
                  onShowImage: setImagemAtiva 
                })}
              </div>
            ))}

            {treinoConfirmado && concluidos === total && total > 0 && !treinoSalvo && (
              <button onClick={finalizarTreino} style={{ width: '100%', height: '52px', background: 'linear-gradient(135deg, #66BB6A, #43A047)', border: 'none', borderRadius: '16px', color: '#fff', fontWeight: 'bold', fontSize: '16px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginTop: '8px' }}>
                <CheckCircle size={20} /> Concluir e Salvar Treino
              </button>
            )}

            {treinoSalvo && (
              <div style={{ background: 'rgba(76,175,80,0.1)', border: '1px solid rgba(76,175,80,0.4)', borderRadius: '16px', padding: '20px', textAlign: 'center', marginTop: '8px' }}>
                <CheckCircle size={32} color="#66BB6A" style={{ margin: '0 auto 8px', display: 'block' }} />
                <h3 style={{ color: '#66BB6A', margin: '0 0 6px' }}>Treino Concluído! 🎉</h3>
                <p style={{ color: '#666', fontSize: '13px', margin: 0 }}>Registrado no seu histórico com sucesso.</p>
              </div>
            )}
          </div>
        )}

        {tab === 'plano' && (
          <div>
            {/* Seletor de dias */}
            <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', overflowX: 'auto', paddingBottom: '4px', scrollbarWidth: 'none' }}>
              {Object.entries(LABELS).map(([letra, titulo]) => (
                <button
                  key={letra}
                  onClick={() => setPlanoTab(letra)}
                  style={{
                    flexShrink: 0, padding: '8px 20px', borderRadius: '20px', border: 'none', cursor: 'pointer', fontWeight: 'bold', fontSize: '13px', transition: 'all 0.2s',
                    background: planoTab === letra ? '#FFD700' : 'rgba(255,255,255,0.07)',
                    color: planoTab === letra ? '#000' : '#888'
                  }}
                >
                  Treino {letra}
                </button>
              ))}
            </div>

            <div style={{ marginBottom: '14px' }}>
              <h3 style={{ color: '#fff', fontSize: '18px', fontWeight: 'bold', margin: '0 0 4px' }}>{treinos[planoTab]?.titulo}</h3>
              <p style={{ color: '#555', fontSize: '13px', margin: 0 }}>{listaPlano.length} exercícios</p>
            </div>

            {listaPlano.map(ex => (
              <div key={ex.id}>
                {ExercicioCard({
                  ex: { ...ex, concluido: false },
                  onCheck: () => {},
                  mostrarCheck: false,
                  onShowVideo: setVideoAtivo,
                  onShowImage: setImagemAtiva
                })}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Timer de Descanso */}
      {timerAtivo && timerCount > 0 && (
        <div style={{
          position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
          width: 'calc(100% - 40px)', maxWidth: '300px',
          background: 'rgba(20,20,20,0.97)', border: '1px solid rgba(255,165,0,0.5)',
          borderRadius: '24px', padding: '30px 20px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px',
          boxShadow: '0 20px 50px rgba(0,0,0,0.8), 0 0 40px rgba(255,165,0,0.1)', zIndex: 1000, textAlign: 'center'
        }}>
          <div style={{ position: 'absolute', top: '16px', right: '16px', display: 'flex', gap: '10px' }}>
            <button onClick={() => setSomAtivo(!somAtivo)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: '4px' }}>
              {somAtivo ? <Volume2 size={20} color="#FFD700" /> : <VolumeX size={20} color="#666" />}
            </button>
            <button onClick={() => setTimerAtivo(false)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: '4px' }}>
              <X size={20} color="#888" />
            </button>
          </div>

          <div style={{ width: '100px', height: '100px', borderRadius: '50%', border: `4px solid ${timerCount <= 5 ? '#EF4444' : '#FFA500'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', background: timerCount <= 5 ? 'rgba(239,68,68,0.1)' : 'rgba(255,165,0,0.1)', boxShadow: timerCount <= 5 ? 'inset 0 0 20px rgba(239,68,68,0.2)' : 'inset 0 0 20px rgba(255,165,0,0.2)' }}>
            <span style={{ color: timerCount <= 5 ? '#EF4444' : '#FFA500', fontWeight: '900', fontSize: '36px' }}>{timerCount}</span>
          </div>
          
          <div>
            <div style={{ color: '#fff', fontWeight: 'bold', fontSize: '18px', marginBottom: '4px' }}>Descanso</div>
            <div style={{ color: '#aaa', fontSize: '14px' }}>Respire fundo. Recupere as energias.</div>
          </div>
        </div>
      )}

      {/* Modal de Vídeo */}
      {videoAtivo && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.9)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 999, padding: '20px' }} onClick={() => setVideoAtivo(null)}>
          <div onClick={e => e.stopPropagation()} style={{ width: '100%', maxWidth: '440px', background: '#111', borderRadius: '24px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.1)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 20px', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
              <h3 style={{ color: '#fff', margin: 0, fontSize: '15px' }}>{videoAtivo.nome}</h3>
              <button onClick={() => setVideoAtivo(null)} style={{ background: 'transparent', border: 'none', cursor: 'pointer' }}><X size={22} color="#666" /></button>
            </div>
            <div style={{ position: 'relative', width: '100%', paddingBottom: '56.25%' }}>
              <iframe
                src={`https://www.youtube.com/embed/${videoAtivo.videoId}?autoplay=1&rel=0&modestbranding=1`}
                style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 'none' }}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope"
                allowFullScreen
              />
            </div>
            <div style={{ padding: '12px 20px 16px' }}>
              <p style={{ color: '#555', fontSize: '12px', margin: 0 }}>{videoAtivo.series} séries × {videoAtivo.reps} reps • {videoAtivo.descanso}s de descanso</p>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Imagem/GIF */}
      {imagemAtiva && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.95)', backdropFilter: 'blur(10px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }} onClick={() => setImagemAtiva(null)}>
          <div onClick={e => e.stopPropagation()} style={{ width: '100%', maxWidth: '440px', background: '#161616', borderRadius: '32px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.1)', boxShadow: '0 20px 50px rgba(0,0,0,0.5)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 24px' }}>
              <h3 style={{ color: '#fff', margin: 0, fontSize: '18px', fontWeight: 'bold' }}>{imagemAtiva.nome}</h3>
              <button onClick={() => setImagemAtiva(null)} style={{ background: 'rgba(255,255,255,0.05)', border: 'none', borderRadius: '50%', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                <X size={20} color="#fff" />
              </button>
            </div>
            
            <div style={{ width: '100%', background: '#000', minHeight: '240px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <img 
                src={GIF[imagemAtiva.gifKey] || getSafeImage(imagemAtiva.img)} 
                alt={imagemAtiva.nome} 
                style={{ width: '100%', maxHeight: '55vh', objectFit: 'contain' }} 
              />
            </div>

            {/* Descrição abaixo do GIF */}
            {imagemAtiva.descricao && (
              <div style={{ padding: '16px 20px', borderTop: '1px solid rgba(255,255,255,0.06)', maxHeight: '30vh', overflowY: 'auto' }}>
                <p style={{ color: '#888', fontSize: '11px', fontWeight: '700', margin: '0 0 6px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Como executar</p>
                <p style={{ color: '#ccc', fontSize: '13px', lineHeight: 1.7, margin: 0 }}>{imagemAtiva.descricao}</p>
              </div>
            )}

            <div style={{ padding: '16px 20px 20px', textAlign: 'center' }}>
              <button 
                onClick={() => setImagemAtiva(null)}
                style={{ width: '100%', height: '46px', background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '14px', color: '#fff', fontWeight: 'bold', fontSize: '15px', cursor: 'pointer' }}
              >
                Fechar Visualização
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
