import { useState, useEffect, useRef, useCallback } from 'react'

/* ========================================================
   NEXA FIT PRO — Funil de Quiz de Alta Conversão
   - Slider Interativo de Peso e Altura com cálculo de IMC em tempo real
   - Imagens 100% segregadas por gênero e corrigidas
   - Promessa de até 15kg em 60 dias
   - Treino em casa sem academia
   - Beep sonoro a cada escolha
   - Botão fixo dinâmico com indicador de rolagem inteligente
   ======================================================== */

// ── Sintetizador de Som de Clique (Zero Delay) ──
function playQuizBeep(frequency = 600, duration = 0.07) {
  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext
    if (!AudioCtx) return
    const ctx = new AudioCtx()
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.type = 'sine'
    osc.frequency.setValueAtTime(frequency, ctx.currentTime)
    osc.frequency.exponentialRampToValueAtTime(frequency * 1.5, ctx.currentTime + duration)
    gain.gain.setValueAtTime(0.12, ctx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration)
    osc.connect(gain)
    gain.connect(ctx.destination)
    osc.start()
    osc.stop(ctx.currentTime + duration)
  } catch (e) {}
}

// ── Dados do Quiz ──
const QUIZ_DATA = {
  sections: ['Meu Perfil', 'Atividade & Local', 'Música & Rotina', 'Nutrição', 'Quase Lá'],
  ages: [
    { id: '18-29', label: '18–29 anos', emoji: '🔥' },
    { id: '30-39', label: '30–39 anos', emoji: '💪' },
    { id: '40-49', label: '40–49 anos', emoji: '⚡' },
    { id: '50-plus', label: '50+ anos', emoji: '🏆' },
  ],
  goals: [
    { id: 'emagrecer', label: 'Secar até 15kg de Gordura Rápido', icon: '🔥' },
    { id: 'massa', label: 'Ganhar Massa Muscular e Volume', icon: '💪' },
    { id: 'definir', label: 'Definir Abdômen e Tonificar Músculos', icon: '✨' },
    { id: 'saude', label: 'Melhorar Saúde, Postura e Vigor', icon: '❤️' },
  ],
  location: [
    { id: 'casa', label: 'Em Casa (100% sem equipamentos)', icon: '🏠' },
    { id: 'academia', label: 'Na Academia com aparelhos', icon: '🏋️' },
    { id: 'hibrido', label: 'Onde eu estiver (Casa ou Academia)', icon: '🔄' },
  ],
  secondaryGoals: [
    { id: 'barriga', label: 'Eliminar gordura visceral da barriga', icon: '🎯' },
    { id: 'postura', label: 'Corrigir postura e acabar com dores', icon: '🧍' },
    { id: 'flexibilidade', label: 'Aumentar flexibilidade e mobilidade', icon: '🤸' },
    { id: 'core', label: 'Fortalecer abdômen e lombar', icon: '🛡️' },
    { id: 'estresse', label: 'Reduzir ansiedade e estresse diário', icon: '🧘' },
    { id: 'energia', label: 'Acordar com energia e disposição total', icon: '⚡' },
  ],
  bodyTypes: [
    { id: 'magro', label: 'Magro com pouca massa', icon: '🏃' },
    { id: 'medio', label: 'Médio / Pouca definição', icon: '🧍' },
    { id: 'grande', label: 'Acima do peso / Gordura localizada', icon: '🏋️' },
    { id: 'obeso', label: 'Muito acima do peso (+15kg)', icon: '💪' },
  ],
  dreamBodies: [
    { id: 'atletico', label: 'Físico Atlético e Seco', icon: '🏆' },
    { id: 'tonificado', label: 'Abdômen Tonificado e Riscado', icon: '✨' },
    { id: 'forte', label: 'Forte, Musculoso e Posturado', icon: '💪' },
    { id: 'saudavel', label: 'Saudável, Leve e em Forma', icon: '❤️' },
  ],
  experience: [
    { id: 'sim', label: 'Sim, treino regularmente', icon: '✅' },
    { id: 'pouco', label: 'Sim, mas falho na consistência', icon: '🔄' },
    { id: 'nao', label: 'Não, sou iniciante do zero', icon: '🆕' },
  ],
  frequency: [
    { id: 'diario', label: '4 a 6 dias por semana (15 a 30 min)', icon: '🔥' },
    { id: 'varias', label: '2 a 3 dias por semana', icon: '💪' },
    { id: 'mensal', label: '1 vez por semana ou esporádico', icon: '📅' },
    { id: 'nunca', label: 'Quase nunca / Sedentário no momento', icon: '🆕' },
  ],
  focusZones: [
    { id: 'abdomen', label: 'Abdômen & Cintura (Core)', icon: '🎯', desc: 'Queima de gordura visceral e definição da musculatura profunda' },
    { id: 'peito', label: 'Peitoral & Costas (Dorsais)', icon: '🫁', desc: 'Abertura de caixa torácica, densidade e postura alinhada' },
    { id: 'bracos', label: 'Braços (Bíceps & Tríceps)', icon: '💪', desc: 'Tonificação e volume muscular nos membros superiores' },
    { id: 'ombros', label: 'Ombros & Deltoides', icon: '⚡', desc: 'Aspecto atlético em V e largura postural' },
    { id: 'pernas', label: 'Pernas & Quadríceps', icon: '🦵', desc: 'Força, firmeza e tônus nos membros inferiores' },
    { id: 'gluteos', label: 'Glúteos & Posterior', icon: '🍑', desc: 'Elevação, hipertrofia e fortalecimento do quadril' },
  ],
  plank: [
    { id: 'nao', label: 'Não consigo nem 15 segundos', icon: '😅' },
    { id: 'menos30', label: 'Entre 15 e 30 segundos', icon: '⏱️' },
    { id: '30-60', label: 'Entre 30 e 60 segundos', icon: '💪' },
    { id: 'mais60', label: 'Mais de 1 minuto com facilidade', icon: '🔥' },
  ],
  likesMusic: [
    { id: 'sim', label: 'Sim, me dá muito mais foco e energia', icon: '🎧' },
    { id: 'nao', label: 'Não, prefiro treinar em silêncio / meu próprio som', icon: '🔇' },
  ],
  music: [
    { id: 'psytrance', label: 'Psytrance / Eletrônica Pesada', icon: '⚡', desc: 'BPM acelerado para treinos de máxima intensidade' },
    { id: 'hiphop', label: 'Hip Hop, Trap & Phonk', icon: '🔥', desc: 'Batidas pesadas para foco e explosão muscular' },
    { id: 'pagode', label: 'Pagode & Samba / Resenha', icon: '🥁', desc: 'Ritmo brasileiro e alto astral para treinar no pique' },
    { id: 'sertanejo_univ', label: 'Sertanejo Universitário', icon: '🤠', desc: 'Hits atuais, animação e motivação contínua' },
    { id: 'sertanejo_modao', label: 'Sertanejo Modão & Raiz', icon: '🪕', desc: 'Clássicos de viola caipira e nostalgia pura' },
    { id: 'rock', label: 'Rock Clássico & Heavy Metal', icon: '🎸', desc: 'Guitarras enérgicas e adrenalina pura' },
    { id: 'lofi', label: 'Lo-Fi Chill & Foco', icon: '🎧', desc: 'Concentração profunda e ritmo constante' },
  ],
  workRoutine: [
    { id: '9-18', label: 'Horário comercial (8h às 18h)', icon: '🏢' },
    { id: 'flex', label: 'Home office ou horários flexíveis', icon: '🏠' },
    { id: 'noturno', label: 'Turnos noturnos ou escalas', icon: '🌙' },
    { id: 'livre', label: 'Tempo livre / Aposentado', icon: '🏖️' },
  ],
  typicalDay: [
    { id: 'sentado', label: 'Passo quase o dia todo sentado(a)', icon: '🪑' },
    { id: 'pausas', label: 'Alterno entre sentado e em pé', icon: '🚶' },
    { id: 'pe', label: 'Fico de pé ou me movimentando o dia todo', icon: '🧍' },
  ],
  energy: [
    { id: 'baixa', label: 'Baixa, sinto cansaço e preguiça quase o dia todo', icon: '😩' },
    { id: 'queda', label: 'Forte queda de rendimento após as refeições', icon: '😴' },
    { id: 'oscila', label: 'Oscila com picos de estresse e fadiga', icon: '📉' },
    { id: 'alta', label: 'Boa energia, quero direcionar para resultados', icon: '⚡' },
  ],
  water: [
    { id: 'pouco', label: 'Menos de 1 Litro (quase nada)', icon: '☕' },
    { id: 'medio', label: '1 a 2 Litros por dia', icon: '🥛' },
    { id: 'ideal', label: 'Mais de 2.5 Litros (meta batida)', icon: '💧' },
  ],
  sleep: [
    { id: 'menos5', label: 'Menos de 5 horas (sono péssimo)', icon: '😵' },
    { id: '5-6', label: '5 a 6 horas por noite', icon: '😪' },
    { id: '7-8', label: '7 a 8 horas (sono reparador)', icon: '😊' },
    { id: '8+', label: 'Mais de 8 horas', icon: '😴' },
  ],
  diet: [
    { id: 'tudo', label: 'Tradicional (como de tudo sem regras)', icon: '🍽️' },
    { id: 'lowcarb', label: 'Low carb / Alta proteína', icon: '🥩' },
    { id: 'vegetariana', label: 'Vegetariana ou Vegana', icon: '🥗' },
    { id: 'flexivel', label: 'Dieta Flexível (contando macros)', icon: '🥑' },
  ],
  badHabits: [
    { id: 'emocional', label: 'Comer por ansiedade, tédio ou estresse', icon: '😔' },
    { id: 'doces', label: 'Vontade incontrolável de doces ou beliscar à noite', icon: '🍫' },
    { id: 'fimdesemana', label: 'Exagerar aos finais de semana', icon: '🍔' },
    { id: 'pular', label: 'Pular refeições ou ficar sem comer horas', icon: '⏭️' },
    { id: 'nenhum', label: 'Nenhum, tenho disciplina regular', icon: '✅' },
  ],
  weightTriggers: [
    { id: 'metabolismo', label: 'Metabolismo lento após certa idade', icon: '🐌' },
    { id: 'estresse', label: 'Estresse e correria da rotina diária', icon: '💼' },
    { id: 'sedentarismo', label: 'Falta de tempo para academias tradicionais', icon: '🛋️' },
    { id: 'refeicoes', label: 'Alimentação desregulada fora de casa', icon: '🍕' },
    { id: 'nenhum', label: 'Nenhum dos fatores acima', icon: '✅' },
  ],
  mainReason: [
    { id: 'confianca', label: 'Me olhar no espelho e ter orgulho do meu corpo', icon: '💫' },
    { id: 'roupas', label: 'Voltar a vestir qualquer roupa sem vergonha', icon: '👕' },
    { id: 'saude', label: 'Mais saúde, vigor físico e longevidade', icon: '❤️' },
    { id: 'atraente', label: 'Me sentir atraente e com autoestima nas alturas', icon: '🔥' },
  ],
  confidence: [
    { id: 'sim', label: 'Quero começar hoje mesmo e vou com tudo! 💪', icon: '🔥' },
    { id: 'talvez', label: 'Preciso de um passo a passo simples e guiado', icon: '🎯' },
    { id: 'inseguro', label: 'Já tentei de tudo, mas quero dar uma última chance', icon: '✨' },
  ],
}

// ── Diagnósticos ──
function getDiagnosis(answers) {
  const isMale = answers.gender === 'male'

  if (answers.goal === 'emagrecer' || answers.bodyType === 'grande' || answers.bodyType === 'obeso') return {
    title: 'Metabolismo Bloqueado & Gordura Visceral',
    text: 'Seu organismo acumulou gordura resistente devido a treinos genéricos ou dietas restritivas. O protocolo NEXA FIT PRO **desbloqueia os receptores lipolíticos** para eliminar até **15kg em 60 dias** treinando em casa ou na academia.',
    icon: '🔥',
    image: '/images/visceral-fat.png'
  }
  if (answers.plank === 'nao' || answers.plank === 'menos30') return {
    title: 'Core Desativado & Perda de Tônus',
    text: 'Os músculos profundos do abdômen e lombar estão inibidos, projetando a barriga para frente. Nosso método reativa o **cinturão abdominal profundo** em menos de 14 dias com sessões curtas em casa.',
    icon: '🎯',
    image: isMale ? '/images/genetic-male.png' : '/images/genetic-female.png'
  }
  if (answers.goal === 'massa' || answers.dreamBody === 'forte') return {
    title: 'Potencial Anabólico Inexplorado',
    text: 'Sua estrutura muscular tem grande capacidade de hipertrofia acelerada, precisando apenas de **sobrecarga progressiva inteligente** sem exigir horas na academia.',
    icon: '💪',
    image: isMale ? '/images/body-fit-man.png' : '/images/body-fit-woman.png'
  }
  return {
    title: 'Fase de Transformação Acelerada',
    text: 'Você está no momento ideal para remodelar a composição corporal e queimar gordura aceleradamente com treinos dinâmicos.',
    icon: '✨',
    image: isMale ? '/images/transform-male.png' : '/images/transform-female.png'
  }
}

// ── Telas do Quiz ──
const SCREENS = [
  // 0: Landing de Promessa Forte + Botão de Avaliação Grátis
  { id: 'intro', type: 'intro', section: null, progress: false },
  
  // 1: Escolha de Gênero (Homem / Mulher)
  { id: 'gender-select', type: 'gender-select', section: null, progress: false },

  // 2: Idade adaptada por gênero
  { id: 'age', type: 'age-select', section: null, progress: false },
  { id: 'social-proof', type: 'interstitial', section: null, progress: false },
  
  // BLOCO 1 — Meu Perfil & Local
  { id: 'goal', type: 'single', section: 0, data: 'goals' },
  { id: 'location', type: 'single', section: 0, data: 'location' },
  { id: 'i-goal', type: 'interstitial', section: 0, progress: false },
  { id: 'body-type', type: 'single', section: 0, data: 'bodyTypes' },
  { id: 'dream-body', type: 'single', section: 0, data: 'dreamBodies' },
  { id: 'secondary-goals', type: 'multi', section: 0, data: 'secondaryGoals' },
  
  // BLOCO 2 — Atividade & Vídeo
  { id: 'experience', type: 'single', section: 1, data: 'experience' },
  { id: 'frequency', type: 'single', section: 1, data: 'frequency' },
  { id: 'focus-zones', type: 'focus-zones-muscle', section: 1, data: 'focusZones' },
  { id: 'i-workout-video', type: 'video-interstitial', section: 1, progress: false },
  { id: 'plank', type: 'single', section: 1, data: 'plank' },
  { id: 'i-diagnosis', type: 'diagnosis', section: 1, progress: false },
  
  // BLOCO 3 — Música & Rotina
  { id: 'likes-music', type: 'single', section: 2, data: 'likesMusic' },
  { id: 'music', type: 'music-select', section: 2, data: 'music' },
  { id: 'i-music', type: 'interstitial', section: 2, progress: false },
  { id: 'work-routine', type: 'single', section: 2, data: 'workRoutine' },
  { id: 'typical-day', type: 'single', section: 2, data: 'typicalDay' },
  { id: 'energy', type: 'single', section: 2, data: 'energy' },
  { id: 'i-energy', type: 'interstitial', section: 2, progress: false },
  { id: 'water', type: 'single', section: 2, data: 'water' },
  { id: 'sleep', type: 'single', section: 2, data: 'sleep' },
  
  // BLOCO 4 — Nutrição
  { id: 'diet', type: 'single', section: 3, data: 'diet' },
  { id: 'bad-habits', type: 'multi', section: 3, data: 'badHabits' },
  { id: 'i-authority', type: 'interstitial', section: 3, progress: false },
  
  // BLOCO 5 — Slider de Medidas (Peso + Altura + IMC em Tempo Real)
  { id: 'measurements', type: 'measurements-slider', section: 4 },
  { id: 'goal-weight', type: 'input', section: 4, inputType: 'goalWeight' },
  { id: 'age-input', type: 'input', section: 4, inputType: 'age' },
  
  // Processamento
  { id: 'loading-analysis', type: 'loading', section: null, progress: false },
  { id: 'wellness-profile', type: 'result', section: null, progress: false },
  
  // Emoção & Metas
  { id: 'weight-triggers', type: 'multi', section: null, data: 'weightTriggers' },
  { id: 'projection', type: 'projection', section: null, progress: false },
  { id: 'main-reason', type: 'single', section: null, data: 'mainReason' },
  { id: 'confidence', type: 'single', section: null, data: 'confidence' },
  
  // Finalização & Checkout
  { id: 'loading-plan', type: 'loading-plan', section: null, progress: false },
  { id: 'email', type: 'input', section: null, inputType: 'email' },
  { id: 'name', type: 'input', section: null, inputType: 'name' },
  { id: 'plan-ready', type: 'plan-ready', section: null, progress: false },
  { id: 'checkout', type: 'checkout', section: null, progress: false },
]

// ── Títulos das perguntas ──
const QUESTION_TITLES = {
  goal: 'Qual é o seu objetivo número #1 agora?',
  location: 'Onde você prefere treinar?',
  'body-type': 'Qual dessas opções melhor descreve seu corpo atual?',
  'dream-body': 'Como você quer que o seu corpo fique?',
  'secondary-goals': 'O que mais você quer conquistar nas próximas semanas?',
  experience: 'Você já praticou musculação ou exercícios antes?',
  frequency: 'Quantos dias por semana você pode dedicar (15 a 30 min)?',
  'focus-zones': 'Quais regiões do corpo você quer transformar com prioridade?',
  plank: 'Por quanto tempo você aguenta segurar uma prancha abdominal?',
  'likes-music': 'Você gosta de ouvir música enquanto treina?',
  music: 'Qual estilo musical acelera mais o seu treino?',
  'work-routine': 'Como funciona a sua rotina de trabalho diária?',
  'typical-day': 'Como é a maior parte do seu dia?',
  energy: 'Como estão os seus níveis de disposição durante o dia?',
  water: 'Quantos litros de água você costuma beber por dia?',
  sleep: 'Quantas horas de sono você tem por noite em média?',
  diet: 'Que estilo de alimentação melhor representa a sua rotina?',
  'bad-habits': 'Você se identifica com algum desses comportamentos?',
  'weight-triggers': 'O que mais atrapalhou seus resultados no passado?',
  'main-reason': 'Qual é o verdadeiro motivo para você querer essa transformação?',
  confidence: 'Quão pronto(a) você está para assumir o controle do seu corpo?',
}

const QUESTION_SUBTITLES = {
  location: 'Nossos treinos funcionam 100% em casa ou na academia',
  'secondary-goals': 'Selecione todas as metas que deseja atingir',
  'focus-zones': 'Toque nas áreas musculares que você deseja focar no seu treino',
  'bad-habits': 'Selecione com honestidade para calibrarmos sua dieta',
  'weight-triggers': 'Descubra como o Nexa FIT PRO elimina essas barreiras',
  'dream-body': 'Visualize com clareza para mantermos sua motivação em alta',
  'likes-music': 'Estudos comprovam que o ritmo sonoro certo pode aumentar seu rendimento em até 28%',
  music: 'Estações de música contínua integradas no app, selecionadas para manter seu ritmo e foco',
}

// ── Componente de Barra Fixa sem necessidade de rolagem ──
// ── Componente de Barra Fixa Elegante & Profissional ──
function StickyBottomAction({ 
  onClick, 
  text = 'CONTINUAR', 
  disabled = false, 
  disabledText = 'Selecione uma opção acima para avançar' 
}) {
  const [shaking, setShaking] = useState(false)

  const handleClick = (e) => {
    if (disabled) {
      e.preventDefault()
      playQuizBeep(280, 0.08)
      setShaking(true)
      setTimeout(() => setShaking(false), 500)
      return
    }
    playQuizBeep(750, 0.08)
    onClick()
  }

  return (
    <div style={{
      position: 'fixed',
      bottom: 0,
      left: 0,
      right: 0,
      padding: '10px 16px calc(12px + env(safe-area-inset-bottom, 0px))',
      background: 'linear-gradient(180deg, rgba(8,8,8,0) 0%, rgba(8,8,8,0.75) 25%, rgba(8,8,8,0.96) 60%, #080808 100%)',
      backdropFilter: 'blur(20px)',
      WebkitBackdropFilter: 'blur(20px)',
      zIndex: 999,
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      pointerEvents: 'auto',
      borderTop: '1px solid rgba(255,255,255,0.05)'
    }}>
      <div style={{ width: '100%', maxWidth: 440 }}>
        <button
          type="button"
          onClick={handleClick}
          style={{
            width: '100%',
            height: 52,
            borderRadius: 16,
            background: disabled 
              ? 'rgba(26,26,26,0.9)' 
              : 'linear-gradient(135deg, #BEF264 0%, #A3E635 100%)',
            color: disabled ? '#888' : '#000',
            border: disabled ? '1px solid rgba(255,255,255,0.08)' : 'none',
            boxShadow: disabled ? 'none' : '0 6px 25px rgba(163,230,53,0.45)',
            cursor: disabled ? 'default' : 'pointer',
            animation: shaking ? 'horizontalShake 0.4s ease-in-out' : 'none',
            transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
            fontSize: 14,
            fontWeight: 900,
            letterSpacing: 0.5,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
            padding: '0 20px',
            textTransform: 'uppercase'
          }}
          onMouseDown={(e) => { if (!disabled) e.currentTarget.style.transform = 'scale(0.98)' }}
          onMouseUp={(e) => { if (!disabled) e.currentTarget.style.transform = 'scale(1)' }}
        >
          {disabled ? (
            <span style={{ fontSize: 12, fontWeight: 700, color: '#aaa', textTransform: 'none', display: 'flex', alignItems: 'center', gap: 6 }}>
              <span>👆</span>
              <span>{disabledText}</span>
            </span>
          ) : (
            <>
              <span>{text}</span>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#000" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <line x1="5" y1="12" x2="19" y2="12" />
                <polyline points="12 5 19 12 12 19" />
              </svg>
            </>
          )}
        </button>
      </div>
    </div>
  )
}

// ── Componente Principal ──
export default function QuizFunnel({ onComplete }) {
  const [currentScreen, setCurrentScreen] = useState(0)
  const [answers, setAnswers] = useState({ gender: 'female' })
  const contentRef = useRef(null)

  const screen = SCREENS[currentScreen] || SCREENS[0]
  const totalQuestions = SCREENS.filter(s => s.type !== 'intro' && s.type !== 'gender-select' && s.type !== 'interstitial' && s.type !== 'video-interstitial' && s.type !== 'loading' && s.type !== 'loading-plan' && s.type !== 'diagnosis' && s.type !== 'result' && s.type !== 'projection' && s.type !== 'plan-ready' && s.type !== 'checkout' && s.type !== 'age-select' && s.progress !== false).length
  const answeredQuestions = SCREENS.slice(0, currentScreen).filter(s => s.type !== 'intro' && s.type !== 'gender-select' && s.type !== 'interstitial' && s.type !== 'video-interstitial' && s.type !== 'loading' && s.type !== 'loading-plan' && s.type !== 'diagnosis' && s.type !== 'result' && s.type !== 'projection' && s.type !== 'plan-ready' && s.type !== 'checkout' && s.type !== 'age-select' && s.progress !== false).length
  const progress = Math.min((answeredQuestions / totalQuestions) * 100, 100)

  const goNext = useCallback(() => {
    if (currentScreen < SCREENS.length - 1) {
      const current = SCREENS[currentScreen]
      if (current.id === 'likes-music' && answers.likesMusic === 'nao') {
        const workIndex = SCREENS.findIndex(s => s.id === 'work-routine')
        if (workIndex !== -1) {
          setCurrentScreen(workIndex)
          window.scrollTo(0, 0)
          return
        }
      }
      setCurrentScreen(prev => prev + 1)
      window.scrollTo(0, 0)
    }
  }, [currentScreen, answers.likesMusic])

  const goBack = useCallback(() => {
    if (currentScreen > 0) {
      const current = SCREENS[currentScreen]
      if (current.id === 'work-routine' && answers.likesMusic === 'nao') {
        const likesIndex = SCREENS.findIndex(s => s.id === 'likes-music')
        if (likesIndex !== -1) {
          setCurrentScreen(likesIndex)
          window.scrollTo(0, 0)
          return
        }
      }
      setCurrentScreen(prev => prev - 1)
      window.scrollTo(0, 0)
    }
  }, [currentScreen, answers.likesMusic])

  const setAnswer = (key, value) => {
    setAnswers(prev => ({ ...prev, [key]: value }))
  }

  const handleGenderSelect = (gender) => {
    playQuizBeep(650, 0.08)
    setAnswer('gender', gender)
    setTimeout(goNext, 250)
  }

  const handleSingleSelect = (key, value) => {
    playQuizBeep(580, 0.07)
    setAnswer(key, value)
    if (key === 'likesMusic') {
      localStorage.setItem('nexafit_likes_music', value)
      if (value === 'nao') {
        const workIndex = SCREENS.findIndex(s => s.id === 'work-routine')
        if (workIndex !== -1) {
          setTimeout(() => {
            setCurrentScreen(workIndex)
            window.scrollTo(0, 0)
          }, 250)
          return
        }
      }
    }
    setTimeout(goNext, 250)
  }

  const handleMultiToggle = (key, value) => {
    playQuizBeep(520, 0.06)
    setAnswers(prev => {
      const current = prev[key] || []
      if (value === 'nenhum') return { ...prev, [key]: ['nenhum'] }
      const filtered = current.filter(v => v !== 'nenhum')
      return { ...prev, [key]: filtered.includes(value) ? filtered.filter(v => v !== value) : [...filtered, value] }
    })
  }

  // Renderizar tela atual
  const renderScreen = () => {
    switch (screen.type) {
      case 'intro': return <IntroScreen onStart={goNext} />
      case 'gender-select': return <GenderSelectScreen onSelect={handleGenderSelect} />
      case 'age-select': return <AgeSelect answers={answers} onSelect={(v) => handleSingleSelect('ageBucket', v)} />
      case 'single': {
        const ansKey = screen.id === 'likes-music' 
          ? 'likesMusic'
          : screen.id.replace(/-/g, '_').replace('body_type','bodyType').replace('dream_body','dreamBody').replace('work_routine','workRoutine').replace('typical_day','typicalDay').replace('main_reason','mainReason')
        return <SingleQuestion screen={screen} answers={answers} onSelect={(v) => handleSingleSelect(ansKey, v)} />
      }
      case 'multi': return <MultiQuestion screen={screen} answers={answers} onToggle={(v) => handleMultiToggle(screen.id.replace(/-/g, '_').replace('secondary_goals','secondaryGoals').replace('bad_habits','badHabits').replace('weight_triggers','weightTriggers'), v)} onNext={goNext} />
      case 'focus-zones-muscle': return <FocusZonesMuscularScreen answers={answers} onToggle={(v) => handleMultiToggle('focusZones', v)} onNext={goNext} />
      case 'music-select': return <MusicSelectScreen answers={answers} onSelect={(v) => handleSingleSelect('musicStyle', v)} />
      case 'measurements-slider': return <MeasurementsSliderScreen answers={answers} onSave={(w, h) => { setAnswer('weight', w); setAnswer('height', h); goNext(); }} />
      case 'interstitial': return <Interstitial screen={screen} answers={answers} onContinue={goNext} />
      case 'video-interstitial': return <VideoInterstitial answers={answers} onContinue={goNext} />
      case 'diagnosis': return <DiagnosisScreen answers={answers} onContinue={goNext} />
      case 'input': return <InputScreen screen={screen} answers={answers} setAnswer={setAnswer} onNext={goNext} />
      case 'loading': return <LoadingScreen onComplete={goNext} />
      case 'result': return <ResultScreen answers={answers} onContinue={goNext} />
      case 'projection': return <ProjectionScreen answers={answers} onContinue={goNext} />
      case 'loading-plan': return <LoadingPlanScreen onComplete={goNext} />
      case 'plan-ready': return <PlanReadyScreen answers={answers} onContinue={goNext} />
      case 'checkout': return <CheckoutScreen answers={answers} onPurchase={() => onComplete(answers)} />
      default: return null
    }
  }

  const showTopBar = currentScreen > 0 && screen.type !== 'checkout' && screen.type !== 'loading' && screen.type !== 'loading-plan'

  return (
    <div className="quiz-container" style={{ position: 'relative', minHeight: '100vh', background: '#0A0A0A' }}>
      
      {/* ── TOP HEADER FIXO COM BOTÃO VOLTAR E BARRA DE PROGRESSO INTEGRADA ── */}
      {showTopBar && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 100,
          background: 'rgba(10,10,10,0.94)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
          padding: '8px 16px 10px'
        }}>
          <div style={{ maxWidth: 480, margin: '0 auto' }}>
            
            {/* Linha de Navegação: Voltar à Esquerda, Seção à Direita */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              minHeight: 34,
              marginBottom: screen.section !== null ? 6 : 0
            }}>
              <button
                onClick={goBack}
                style={{
                  background: 'rgba(255,255,255,0.08)',
                  border: '1px solid rgba(255,255,255,0.12)',
                  color: '#fff',
                  borderRadius: 10,
                  fontSize: 12,
                  fontWeight: 800,
                  cursor: 'pointer',
                  padding: '5px 12px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 4
                }}
              >
                <span>←</span>
                <span>Voltar</span>
              </button>

              {screen.progress !== false && screen.section !== null && (
                <span style={{ fontSize: 10, fontWeight: 900, color: 'var(--neon)', textTransform: 'uppercase', letterSpacing: 1 }}>
                  {QUIZ_DATA.sections[screen.section]}
                </span>
              )}
            </div>

            {/* Barra de Progresso Fina */}
            {screen.progress !== false && screen.section !== null && (
              <div style={{ width: '100%', height: 4, background: '#1c1c1c', borderRadius: 2, overflow: 'hidden' }}>
                <div style={{
                  width: `${progress}%`,
                  height: '100%',
                  background: 'var(--neon-gradient)',
                  borderRadius: 2,
                  transition: 'width 0.3s cubic-bezier(0.2, 0.8, 0.2, 1)'
                }} />
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── CONTEÚDO DA TELA COM ESPAÇAMENTO GENEROSO (SEM CONFLITO COM O BOTÃO VOLTAR) ── */}
      <div
        className={screen.type === 'checkout' ? 'quiz-checkout-content' : 'quiz-content'}
        ref={contentRef}
        key={currentScreen}
        style={{
          animation: 'fadeIn 0.2s ease',
          paddingTop: showTopBar ? (screen.section !== null ? 82 : 62) : (screen.type === 'checkout' ? 0 : 16),
          paddingBottom: screen.type === 'checkout' ? 0 : 95
        }}
      >
        {renderScreen()}
      </div>
    </div>
  )
}

// ══════════════════════════════════════════════
// SUB-COMPONENTES
// ══════════════════════════════════════════════

// ── 0. INTRO SCREEN COM PROMOÇÃO DE 15KG EM 60 DIAS E BOTÃO DE AVALIAÇÃO GRÁTIS ──
function IntroScreen({ onStart }) {
  return (
    <div style={{ maxWidth: 520, margin: '0 auto', textAlign: 'center', padding: '10px 16px 40px' }}>
      
      {/* Logo Grande Centralizado Sem Sombra Verde */}
      <div style={{ width: '100%', display: 'flex', justifyContent: 'center', marginBottom: 16 }}>
        <img
          src="/logo.png"
          alt="NEXA FIT PRO"
          style={{ width: '84%', maxWidth: 280, height: 'auto', display: 'block', filter: 'none' }}
        />
      </div>

      {/* Badge */}
      <div style={{
        display: 'inline-flex', alignItems: 'center', gap: 6,
        padding: '6px 16px', borderRadius: 999,
        background: 'rgba(163,230,53,0.15)', border: '1px solid rgba(163,230,53,0.4)',
        color: 'var(--neon)', fontSize: 12, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em',
        marginBottom: 14
      }}>
        ⚡ PROTOCOLO CIENTÍFICO 2026
      </div>

      {/* Headline Agressiva com 15kg em 60 dias */}
      <h1 style={{
        fontFamily: 'var(--font-primary)',
        fontSize: 'clamp(22px, 5.8vw, 30px)',
        fontWeight: 900,
        lineHeight: 1.15,
        color: '#FFFFFF',
        marginBottom: 12,
        textTransform: 'uppercase'
      }}>
        CONSTRUA O CORPO DOS SEUS SONHOS E ELIMINE ATÉ <span style={{ color: 'var(--neon)', textShadow: '0 0 20px rgba(163,230,53,0.6)' }}>15KG EM 60 DIAS</span>
      </h1>

      {/* Subheadline com ênfase em Treinar em Casa */}
      <p style={{
        fontSize: 'clamp(13px, 3.6vw, 15px)',
        color: 'var(--text-secondary)',
        lineHeight: 1.5,
        marginBottom: 18
      }}>
        Descubra o protocolo 100% individualizado para secar até <strong style={{ color: '#fff' }}>15kg de gordura pura</strong> treinando <strong style={{ color: 'var(--neon)' }}>em casa ou na academia</strong>, sem passar fome e sem gastar com mensalidades caras.
      </p>

      {/* Vídeo Hero (GIF Style) */}
      <div style={{
        position: 'relative',
        borderRadius: 20,
        overflow: 'hidden',
        border: '1.5px solid rgba(163,230,53,0.3)',
        boxShadow: '0 0 30px rgba(163,230,53,0.2)',
        marginBottom: 18,
        background: '#000',
        maxHeight: 260
      }}>
        <video
          src="/videos/quiz-intro.mp4"
          autoPlay
          loop
          muted
          playsInline
          style={{ width: '100%', height: '100%', display: 'block', objectFit: 'cover' }}
        />
        <div style={{
          position: 'absolute', bottom: 8, left: 10, right: 10,
          background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(8px)',
          borderRadius: 8, padding: '4px 10px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6
        }}>
          <span style={{ color: 'var(--neon)', fontSize: 11 }}>🏠</span>
          <span style={{ fontSize: 11, fontWeight: 700, color: '#fff' }}>Treine na sua sala ou na academia (15–30 min/dia)</span>
        </div>
      </div>

      {/* Lista de Vantagens */}
      <div style={{ background: '#121212', borderRadius: 16, padding: '14px 16px', marginBottom: 18, border: '1px solid rgba(255,255,255,0.06)', textAlign: 'left' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8, fontSize: 13, color: '#ddd' }}>
          <span style={{ color: 'var(--neon)', fontSize: 14 }}>✓</span>
          <span>Plano 100% individualizado para o seu biotipo</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8, fontSize: 13, color: '#ddd' }}>
          <span style={{ color: 'var(--neon)', fontSize: 14 }}>✓</span>
          <span>Exercícios em vídeo guiados para fazer em casa ou academia</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13, color: '#ddd' }}>
          <span style={{ color: 'var(--neon)', fontSize: 14 }}>✓</span>
          <span>Rádio Fitness 24h sem anúncios & Cardápios flexíveis</span>
        </div>
      </div>

      {/* BOTÃO PRINCIPAL DE FAZER AVALIAÇÃO GRÁTIS */}
      <button
        onClick={() => {
          playQuizBeep(750, 0.08)
          onStart()
        }}
        className="quiz-cta"
        style={{
          width: '100%',
          maxWidth: 440,
          margin: '0 0 14px',
          padding: '18px 20px',
          fontSize: '16px',
          fontWeight: 900,
          letterSpacing: '0.05em',
          textTransform: 'uppercase',
          boxShadow: '0 6px 25px rgba(163,230,53,0.5)',
          animation: 'pulse 2s infinite'
        }}
      >
        FAZER AVALIAÇÃO GRÁTIS ⚡
      </button>

      {/* Social Proof */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
        <span style={{ color: '#F59E0B' }}>⭐⭐⭐⭐⭐</span>
        <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>+147.000 vidas transformadas</span>
      </div>
    </div>
  )
}

// ── 1. ESCOLHA DE GÊNERO COM CARDS EXPANSIVOS ──
function GenderSelectScreen({ onSelect }) {
  return (
    <div style={{ maxWidth: 520, margin: '0 auto', textAlign: 'center', padding: '16px 16px 40px' }}>
      <img src="/logo.png" alt="NEXA FIT PRO" style={{ height: 38, marginBottom: 16, display: 'block', margin: '0 auto 16px' }} />
      
      <h2 style={{ fontSize: 22, fontWeight: 900, color: '#fff', marginBottom: 6, textTransform: 'uppercase' }}>
        QUAL É O SEU <span style={{ color: 'var(--neon)' }}>GÊNERO BIOLÓGICO?</span>
      </h2>
      <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 24 }}>
        Calibração metabólica para queima acelerada e tônus muscular
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
        
        {/* Card Homem */}
        <div
          onClick={() => onSelect('male')}
          style={{
            background: '#151515',
            border: '2px solid rgba(255,255,255,0.1)',
            borderRadius: 20,
            padding: '20px 12px',
            cursor: 'pointer',
            transition: 'all 0.25s ease',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 10,
            boxShadow: '0 8px 30px rgba(0,0,0,0.5)'
          }}
          onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--neon)'; e.currentTarget.style.transform = 'translateY(-4px)' }}
          onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; e.currentTarget.style.transform = 'translateY(0)' }}
        >
          <div style={{ width: 80, height: 80, borderRadius: '50%', overflow: 'hidden', border: '2.5px solid var(--neon)' }}>
            <img src="/images/body-fit-man.png" alt="Homem" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>
          <div style={{ fontSize: 17, fontWeight: 900, color: '#fff' }}>👨 HOMEM</div>
          <span style={{ fontSize: 12, color: 'var(--neon)', fontWeight: 700 }}>Massa & Definição</span>
        </div>

        {/* Card Mulher */}
        <div
          onClick={() => onSelect('female')}
          style={{
            background: '#151515',
            border: '2px solid rgba(255,255,255,0.1)',
            borderRadius: 20,
            padding: '20px 12px',
            cursor: 'pointer',
            transition: 'all 0.25s ease',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 10,
            boxShadow: '0 8px 30px rgba(0,0,0,0.5)'
          }}
          onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--neon)'; e.currentTarget.style.transform = 'translateY(-4px)' }}
          onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; e.currentTarget.style.transform = 'translateY(0)' }}
        >
          <div style={{ width: 80, height: 80, borderRadius: '50%', overflow: 'hidden', border: '2.5px solid var(--neon)' }}>
            <img src="/images/body-fit-woman.png" alt="Mulher" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>
          <div style={{ fontSize: 17, fontWeight: 900, color: '#fff' }}>👩 MULHER</div>
          <span style={{ fontSize: 12, color: 'var(--neon)', fontWeight: 700 }}>Secar & Tonificar</span>
        </div>

      </div>
    </div>
  )
}

// ── COMPONENTE DE ANATOMIA 3D VETORIAL PURA (SEM IMAGENS) ──
function InteractiveAnatomyDiagram({ selected = [], onToggle }) {
  const isZoneActive = (id) => selected.includes(id)

  // Configuração visual de cores neon por região muscular
  const ZONE_CONFIG = {
    abdomen: { color: '#A3E635', glow: 'rgba(163,230,53,0.95)', fill: 'rgba(163,230,53,0.55)', name: 'Abdômen & Core', icon: '🎯' },
    peito:   { color: '#38BDF8', glow: 'rgba(56,189,248,0.95)', fill: 'rgba(56,189,248,0.55)', name: 'Peitoral & Costas', icon: '🫁' },
    bracos:  { color: '#F59E0B', glow: 'rgba(245,158,11,0.95)', fill: 'rgba(245,158,11,0.55)', name: 'Braços (Bíceps/Tríceps)', icon: '💪' },
    ombros:  { color: '#818CF8', glow: 'rgba(129,140,248,0.95)', fill: 'rgba(129,140,248,0.55)', name: 'Ombros & Deltoides', icon: '⚡' },
    gluteos: { color: '#EC4899', glow: 'rgba(236,72,153,0.95)', fill: 'rgba(236,72,153,0.55)', name: 'Glúteos & Posterior', icon: '🍑' },
    pernas:  { color: '#10B981', glow: 'rgba(16,185,129,0.95)', fill: 'rgba(16,185,129,0.55)', name: 'Pernas & Quadríceps', icon: '🦵' },
  }

  const getStyle = (id) => {
    const active = isZoneActive(id)
    const cfg = ZONE_CONFIG[id] || { color: '#A3E635', fill: 'rgba(163,230,53,0.4)', glow: 'rgba(163,230,53,0.8)' }
    return {
      fill: active ? cfg.fill : 'rgba(255, 255, 255, 0.035)',
      stroke: active ? cfg.color : 'rgba(255, 255, 255, 0.22)',
      strokeWidth: active ? 2.2 : 1.4,
      filter: active ? `drop-shadow(0 0 8px ${cfg.glow})` : 'none',
      cursor: 'pointer',
      transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
    }
  }

  const handleZoneClick = (id) => {
    playQuizBeep(600, 0.05)
    onToggle(id)
  }

  return (
    <div style={{
      background: 'radial-gradient(ellipse at center, #151820 0%, #0c0e12 60%, #060709 100%)',
      borderRadius: 22,
      border: '1.5px solid rgba(255, 255, 255, 0.1)',
      padding: '16px 12px 14px',
      position: 'relative',
      overflow: 'hidden',
      boxShadow: '0 12px 40px rgba(0,0,0,0.7), inset 0 1px 0 rgba(255,255,255,0.1)',
      marginBottom: 16
    }}>
      {/* Laser Scanline Beam Animado */}
      <div style={{
        position: 'absolute',
        left: 0,
        right: 0,
        height: 2,
        background: 'linear-gradient(90deg, transparent 0%, rgba(163,230,53,0.8) 50%, transparent 100%)',
        boxShadow: '0 0 12px rgba(163,230,53,0.9)',
        animation: 'laserScan 3.2s ease-in-out infinite',
        pointerEvents: 'none',
        zIndex: 5
      }} />

      {/* Header Biométrico HUD */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '0 6px 10px',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        marginBottom: 8
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--neon)', boxShadow: '0 0 8px var(--neon)', animation: 'pulse 1.2s infinite' }} />
          <span style={{ fontSize: 11, fontWeight: 900, letterSpacing: 1, color: '#eee', textTransform: 'uppercase' }}>
            SCANNER ANATÔMICO 3D
          </span>
        </div>
        <div style={{
          fontSize: 10,
          fontWeight: 800,
          color: 'var(--neon)',
          background: 'rgba(163,230,53,0.12)',
          border: '1px solid rgba(163,230,53,0.3)',
          padding: '2px 8px',
          borderRadius: 8
        }}>
          {selected.length === 0 ? 'TOQUE PARA MAPEAR' : `${selected.length} ÁREAS ATIVAS`}
        </div>
      </div>

      {/* SVG Dual Body (Frontal + Posterior) */}
      <div style={{ position: 'relative', width: '100%', display: 'flex', justifyContent: 'center' }}>
        <svg
          viewBox="0 0 540 410"
          style={{ width: '100%', maxHeight: 290, display: 'block' }}
        >
          <defs>
            {/* Grid Pattern de fundo */}
            <pattern id="cyberGrid" width="20" height="20" patternUnits="userSpaceOnUse">
              <path d="M 20 0 L 0 0 0 20" fill="none" stroke="rgba(255,255,255,0.025)" strokeWidth="0.8" />
            </pattern>
            {/* Gradientes e Brilhos */}
            <radialGradient id="hologramBg" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="rgba(56,189,248,0.06)" />
              <stop offset="100%" stopColor="rgba(0,0,0,0)" />
            </radialGradient>
          </defs>

          {/* Fundo com Grid Cibernético */}
          <rect width="540" height="410" fill="url(#cyberGrid)" />
          <circle cx="145" cy="205" r="160" fill="url(#hologramBg)" />
          <circle cx="395" cy="205" r="160" fill="url(#hologramBg)" />

          {/* Eixos Guia e Linhas Biométricas */}
          <line x1="145" y1="20" x2="145" y2="400" stroke="rgba(255,255,255,0.06)" strokeDasharray="3 3" strokeWidth="1" />
          <line x1="395" y1="20" x2="395" y2="400" stroke="rgba(255,255,255,0.06)" strokeDasharray="3 3" strokeWidth="1" />

          {/* ============================================================ */}
          {/* CORPO 1 — VISTA FRONTAL (ANTERIOR VIEW) - Centro X: 145 */}
          {/* ============================================================ */}
          <g id="body-front">
            {/* Label da Vista */}
            <text x="145" y="24" textAnchor="middle" fill="rgba(255,255,255,0.5)" fontSize="11" fontWeight="800" letterSpacing="1">
              VISTA FRONTAL
            </text>

            {/* Cabeça & Pescoço Silhueta */}
            <ellipse cx="145" cy="54" rx="19" ry="24" fill="#12161f" stroke="rgba(255,255,255,0.25)" strokeWidth="1.4" />
            <path d="M 137,76 L 135,94 L 155,94 L 153,76 Z" fill="#12161f" stroke="rgba(255,255,255,0.2)" strokeWidth="1.2" />
            {/* Rosto / Visor Cyber */}
            <path d="M 134,50 Q 145,55 156,50" fill="none" stroke="rgba(56,189,248,0.4)" strokeWidth="1.5" />

            {/* ── OMBROS (Deltoides Anteriores / Laterais) ── */}
            <g onClick={() => handleZoneClick('ombros')} style={getStyle('ombros')}>
              {/* Ombro Esquerdo */}
              <path d="M 106,94 C 92,102 88,124 96,140 C 104,138 112,126 116,112 C 117,100 112,95 106,94 Z" />
              {/* Ombro Direito */}
              <path d="M 184,94 C 198,102 202,124 194,140 C 186,138 178,126 174,112 C 173,100 178,95 184,94 Z" />
            </g>

            {/* ── PEITORAL (Pectoralis Major) ── */}
            <g onClick={() => handleZoneClick('peito')} style={getStyle('peito')}>
              {/* Peito Esquerdo */}
              <path d="M 118,104 C 132,103 143,108 144,122 C 144,142 128,150 114,146 C 110,132 112,114 118,104 Z" />
              {/* Peito Direito */}
              <path d="M 172,104 C 158,103 147,108 146,122 C 146,142 162,150 176,146 C 180,132 178,114 172,104 Z" />
            </g>

            {/* ── BRAÇOS (Bíceps & Antebraços Frontais) ── */}
            <g onClick={() => handleZoneClick('bracos')} style={getStyle('bracos')}>
              {/* Bíceps Esquerdo */}
              <path d="M 94,138 C 84,150 82,174 88,188 C 96,186 102,174 102,156 C 102,146 98,140 94,138 Z" />
              {/* Antebraço Esquerdo */}
              <path d="M 87,190 C 80,208 76,236 80,254 C 88,252 92,238 96,216 C 98,200 94,192 87,190 Z" />
              <circle cx="79" cy="262" r="5" fill="#12161f" stroke="rgba(255,255,255,0.2)" />

              {/* Bíceps Direito */}
              <path d="M 196,138 C 206,150 208,174 202,188 C 194,186 188,174 188,156 C 188,146 192,140 196,138 Z" />
              {/* Antebraço Direito */}
              <path d="M 203,190 C 210,208 214,236 210,254 C 202,252 198,238 194,216 C 192,200 196,192 203,190 Z" />
              <circle cx="211" cy="262" r="5" fill="#12161f" stroke="rgba(255,255,255,0.2)" />
            </g>

            {/* ── ABDÔMEN & CINTURA (Core / 6-Pack + Oblíquos) ── */}
            <g onClick={() => handleZoneClick('abdomen')} style={getStyle('abdomen')}>
              {/* Oblíquos / Laterais */}
              <path d="M 114,152 C 120,172 118,206 122,228 C 114,216 110,190 108,164 Z" />
              <path d="M 176,152 C 170,172 172,206 168,228 C 176,216 180,190 182,164 Z" />
              
              {/* 6-Pack Superior */}
              <path d="M 126,152 C 134,152 143,153 144,166 C 144,176 134,178 126,176 C 122,166 122,156 126,152 Z" />
              <path d="M 164,152 C 156,152 147,153 146,166 C 146,176 156,178 164,176 C 168,166 168,156 164,152 Z" />

              {/* 6-Pack Médio */}
              <path d="M 127,180 C 135,180 143,181 144,194 C 144,204 135,206 127,204 C 124,196 124,186 127,180 Z" />
              <path d="M 163,180 C 155,180 147,181 146,194 C 146,204 155,206 163,204 C 166,196 166,186 163,180 Z" />

              {/* 6-Pack Inferior / V-Taper */}
              <path d="M 128,208 C 136,208 143,210 144,226 C 136,234 128,232 126,224 C 125,218 125,212 128,208 Z" />
              <path d="M 162,208 C 154,208 147,210 146,226 C 154,234 162,234 164,224 C 165,218 165,212 162,208 Z" />
            </g>

            {/* Pélvis / Quadril Estrutural */}
            <path d="M 126,232 Q 145,248 164,232 L 158,246 L 132,246 Z" fill="#12161f" stroke="rgba(255,255,255,0.18)" strokeWidth="1.2" />

            {/* ── PERNAS (Quadríceps & Panturrilhas Frontais) ── */}
            <g onClick={() => handleZoneClick('pernas')} style={getStyle('pernas')}>
              {/* Coxa Esquerda */}
              <path d="M 120,248 C 112,272 108,310 118,338 C 130,340 140,324 142,298 C 144,270 140,250 120,248 Z" />
              {/* Joelho Esquerdo */}
              <circle cx="124" cy="346" r="6" fill="#12161f" stroke="rgba(255,255,255,0.3)" />
              {/* Canela / Panturrilha Esquerda */}
              <path d="M 118,354 C 112,370 114,394 118,404 L 126,404 C 130,394 130,374 128,354 Z" />

              {/* Coxa Direita */}
              <path d="M 170,248 C 178,272 182,310 172,338 C 160,340 150,324 148,298 C 146,270 150,250 170,248 Z" />
              {/* Joelho Direito */}
              <circle cx="166" cy="346" r="6" fill="#12161f" stroke="rgba(255,255,255,0.3)" />
              {/* Canela / Panturrilha Direita */}
              <path d="M 172,354 C 178,370 176,394 172,404 L 164,404 C 160,394 160,374 162,354 Z" />
            </g>
          </g>

          {/* ============================================================ */}
          {/* CORPO 2 — VISTA POSTERIOR / COSTAS - Centro X: 395 */}
          {/* ============================================================ */}
          <g id="body-back">
            {/* Label da Vista */}
            <text x="395" y="24" textAnchor="middle" fill="rgba(255,255,255,0.5)" fontSize="11" fontWeight="800" letterSpacing="1">
              VISTA DORSAL (COSTAS)
            </text>

            {/* Cabeça & Nuca */}
            <ellipse cx="395" cy="54" rx="19" ry="24" fill="#12161f" stroke="rgba(255,255,255,0.25)" strokeWidth="1.4" />
            <path d="M 387,76 L 385,94 L 405,94 L 403,76 Z" fill="#12161f" stroke="rgba(255,255,255,0.2)" strokeWidth="1.2" />
            {/* Linha Cervical da Espinha */}
            <line x1="395" y1="78" x2="395" y2="230" stroke="rgba(56,189,248,0.35)" strokeDasharray="4 2" strokeWidth="1.5" />

            {/* ── OMBROS POSTERIORES (Deltoides Posteriores) ── */}
            <g onClick={() => handleZoneClick('ombros')} style={getStyle('ombros')}>
              {/* Ombro Posterior Esquerdo */}
              <path d="M 356,94 C 342,102 338,124 346,140 C 354,138 362,126 366,112 C 367,100 362,95 356,94 Z" />
              {/* Ombro Posterior Direito */}
              <path d="M 434,94 C 448,102 452,124 444,140 C 436,138 428,126 424,112 C 423,100 428,95 434,94 Z" />
            </g>

            {/* ── COSTAS & DORSAIS (Trapézio, Grande Dorsal & Asas) ── */}
            <g onClick={() => handleZoneClick('peito')} style={getStyle('peito')}>
              {/* Trapézio Superior & Médio (Diamante) */}
              <path d="M 395,84 L 372,102 L 384,138 L 395,148 L 406,138 L 418,102 Z" />
              
              {/* Grande Dorsal Esquerdo (Asa) */}
              <path d="M 366,120 C 352,142 350,180 370,210 C 376,192 380,164 382,140 C 374,132 368,124 366,120 Z" />
              {/* Grande Dorsal Direito (Asa) */}
              <path d="M 424,120 C 438,142 440,180 420,210 C 414,192 410,164 408,140 C 416,132 422,124 424,120 Z" />

              {/* Lombar / Eretor da Espinha */}
              <path d="M 384,152 C 384,185 386,218 388,228 L 395,230 L 402,228 C 404,218 406,185 406,152 Z" />
            </g>

            {/* ── BRAÇOS POSTERIORES (Tríceps & Extensores) ── */}
            <g onClick={() => handleZoneClick('bracos')} style={getStyle('bracos')}>
              {/* Tríceps Esquerdo */}
              <path d="M 344,138 C 334,150 332,174 338,188 C 346,186 352,174 352,156 C 352,146 348,140 344,138 Z" />
              {/* Extensor Antebraço Esquerdo */}
              <path d="M 337,190 C 330,208 326,236 330,254 C 338,252 342,238 346,216 C 348,200 344,192 337,190 Z" />
              <circle cx="329" cy="262" r="5" fill="#12161f" stroke="rgba(255,255,255,0.2)" />

              {/* Tríceps Direito */}
              <path d="M 446,138 C 456,150 458,174 452,188 C 444,186 438,174 438,156 C 438,146 442,140 446,138 Z" />
              {/* Extensor Antebraço Direito */}
              <path d="M 453,190 C 460,208 464,236 460,254 C 452,252 448,238 444,216 C 442,200 446,192 453,190 Z" />
              <circle cx="461" cy="262" r="5" fill="#12161f" stroke="rgba(255,255,255,0.2)" />
            </g>

            {/* ── GLÚTEOS (Glúteo Máximo & Glúteo Médio) ── */}
            <g onClick={() => handleZoneClick('gluteos')} style={getStyle('gluteos')}>
              {/* Glúteo Esquerdo */}
              <path d="M 368,232 C 360,252 364,284 388,288 C 394,276 394,250 393,232 C 382,230 372,231 368,232 Z" />
              {/* Glúteo Direito */}
              <path d="M 422,232 C 430,252 426,284 402,288 C 396,276 396,250 397,232 C 408,230 418,231 422,232 Z" />
            </g>

            {/* ── PERNAS POSTERIORES (Isquiotibiais & Panturrilhas) ── */}
            <g onClick={() => handleZoneClick('pernas')} style={getStyle('pernas')}>
              {/* Posterior de Coxa Esquerdo */}
              <path d="M 368,290 C 360,314 358,336 368,344 C 378,344 388,330 390,305 C 392,292 386,290 368,290 Z" />
              {/* Fossa Poplítea (Atrás do Joelho) */}
              <circle cx="374" cy="348" r="5" fill="#12161f" stroke="rgba(255,255,255,0.3)" />
              {/* Panturrilha Esquerda (Gastrocnêmio & Tendão de Aquiles) */}
              <path d="M 366,354 C 358,370 360,394 366,404 L 374,404 C 378,394 378,374 376,354 Z" />

              {/* Posterior de Coxa Direito */}
              <path d="M 422,290 C 430,314 432,336 422,344 C 412,344 402,330 400,305 C 398,292 404,290 422,290 Z" />
              {/* Fossa Poplítea Direita */}
              <circle cx="416" cy="348" r="5" fill="#12161f" stroke="rgba(255,255,255,0.3)" />
              {/* Panturrilha Direita (Gastrocnêmio & Tendão de Aquiles) */}
              <path d="M 424,354 C 432,370 430,394 424,404 L 416,404 C 412,394 412,374 414,354 Z" />
            </g>
          </g>
        </svg>
      </div>

      {/* Legenda dos Músculos Iluminados */}
      <div style={{
        marginTop: 10,
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'center',
        gap: 6
      }}>
        {selected.length === 0 ? (
          <span style={{ fontSize: 11, color: '#888', fontWeight: 600 }}>
            Toque nos músculos do corpo 3D ou nos cards abaixo para iluminar
          </span>
        ) : (
          selected.map(id => {
            const cfg = ZONE_CONFIG[id] || { color: 'var(--neon)', name: id, icon: '🔥' }
            return (
              <span
                key={id}
                onClick={() => handleZoneClick(id)}
                style={{
                  fontSize: 11,
                  background: 'rgba(0,0,0,0.6)',
                  color: cfg.color,
                  border: `1.5px solid ${cfg.color}`,
                  padding: '3px 9px',
                  borderRadius: 14,
                  fontWeight: 800,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 4,
                  boxShadow: `0 0 12px ${cfg.fill}`,
                  cursor: 'pointer',
                  animation: 'pulse 2s infinite'
                }}
              >
                <span>{cfg.icon}</span>
                <span>{cfg.name}</span>
                <span style={{ fontSize: 10, opacity: 0.7 }}>✕</span>
              </span>
            )
          })
        )}
      </div>
    </div>
  )
}

// ── BONECO REALISTA MUSCULAR INTERATIVO (ÁREAS MUSCULARES) ──
function FocusZonesMuscularScreen({ answers, onToggle, onNext }) {
  const selected = answers.focusZones || []
  const options = QUIZ_DATA.focusZones

  const isZoneActive = (id) => selected.includes(id)

  const ZONE_ACCENT_COLORS = {
    abdomen: '#A3E635',
    peito: '#38BDF8',
    bracos: '#F59E0B',
    ombros: '#818CF8',
    gluteos: '#EC4899',
    pernas: '#10B981',
  }

  return (
    <div className="quiz-question" style={{ maxWidth: 480, margin: '0 auto', textAlign: 'center' }}>
      <h2 className="quiz-question-title">Quais regiões do corpo você quer transformar com prioridade?</h2>
      <p className="quiz-question-subtitle" style={{ marginBottom: 14 }}>
        Toque nos músculos do corpo 3D ou selecione as opções abaixo
      </p>

      {/* Visual Muscular Anatômico 3D Vetorial Puro */}
      <InteractiveAnatomyDiagram selected={selected} onToggle={onToggle} />

      {/* Grid de Opções de Zonas Musculares */}
      <div className="quiz-options" style={{ gap: 10 }}>
        {options.map(opt => {
          const active = isZoneActive(opt.id)
          const accentColor = ZONE_ACCENT_COLORS[opt.id] || 'var(--neon)'
          return (
            <div
              key={opt.id}
              className={`quiz-option ${active ? 'selected' : ''}`}
              onClick={() => onToggle(opt.id)}
              style={{
                background: active ? `rgba(${opt.id === 'abdomen' ? '163,230,53' : opt.id === 'peito' ? '56,189,248' : opt.id === 'bracos' ? '245,158,11' : opt.id === 'ombros' ? '129,140,248' : opt.id === 'gluteos' ? '236,72,153' : '16,185,129'}, 0.14)` : '#141414',
                borderColor: active ? accentColor : 'rgba(255,255,255,0.08)',
                boxShadow: active ? `0 0 18px ${accentColor}40` : 'none',
                padding: '12px 14px'
              }}
            >
              <div className="quiz-option-icon" style={{ fontSize: 20 }}>{opt.icon}</div>
              <div style={{ flex: 1, textAlign: 'left' }}>
                <span className="quiz-option-text" style={{ fontSize: 14, fontWeight: 800, color: active ? '#fff' : '#ddd' }}>
                  {opt.label}
                </span>
                <p style={{ fontSize: 11, color: active ? '#aaa' : '#888', margin: '2px 0 0' }}>{opt.desc}</p>
              </div>
              <div className="quiz-option-radio" style={{
                background: active ? accentColor : 'transparent',
                borderColor: active ? accentColor : '#555',
                boxShadow: active ? `0 0 8px ${accentColor}` : 'none'
              }} />
            </div>
          )
        })}
      </div>

      {/* Botão de Continuar Fixo com Trava Obrigatória */}
      <StickyBottomAction
        onClick={onNext}
        disabled={selected.length === 0}
        text={selected.length > 0 ? `CONTINUAR COM ${selected.length} REGIÕE${selected.length > 1 ? 'S' : ''}` : 'CONTINUAR'}
        disabledText="SELECIONE AO MENOS 1 REGIÃO DO CORPO"
      />
    </div>
  )
}

// ── TELA DE MÚSICA COM ESTAÇÕES CONTÍNUAS ──
function MusicSelectScreen({ answers, onSelect }) {
  const options = QUIZ_DATA.music

  return (
    <div className="quiz-question" style={{ maxWidth: 480, margin: '0 auto', textAlign: 'center' }}>
      <h2 className="quiz-question-title">Qual estilo musical acelera mais o seu treino?</h2>
      <p className="quiz-question-subtitle" style={{ marginBottom: 14 }}>
        Estações de música contínua integradas no app, selecionadas para manter seu ritmo e foco sem anúncios
      </p>

      {/* Banner Rádio Fitness Integrada */}
      <div style={{
        background: 'rgba(163,230,53,0.1)',
        border: '1px solid rgba(163,230,53,0.3)',
        borderRadius: 16,
        padding: '10px 14px',
        marginBottom: 16,
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        textAlign: 'left'
      }}>
        <div style={{
          background: 'var(--neon)', color: '#000', fontSize: 10, fontWeight: 900,
          padding: '3px 8px', borderRadius: 6, display: 'flex', alignItems: 'center', gap: 4, whiteSpace: 'nowrap'
        }}>
          <span>🎧</span>
          <span>RÁDIO FITNESS</span>
        </div>
        <span style={{ fontSize: 12, color: '#eee', fontWeight: 600 }}>
          Música contínua no app para você treinar com foco total sem precisar pagar outro streaming!
        </span>
      </div>

      {/* Opções de Música */}
      <div className="quiz-options" style={{ gap: 10 }}>
        {options.map(opt => (
          <div
            key={opt.id}
            className={`quiz-option ${answers.musicStyle === opt.id ? 'selected' : ''}`}
            onClick={() => onSelect(opt.id)}
            style={{ padding: '12px 14px' }}
          >
            <div className="quiz-option-icon" style={{ fontSize: 22 }}>{opt.icon}</div>
            <div style={{ flex: 1, textAlign: 'left' }}>
              <span className="quiz-option-text" style={{ fontSize: 14, fontWeight: 800 }}>{opt.label}</span>
              <p style={{ fontSize: 11, color: '#888', margin: '2px 0 0' }}>{opt.desc}</p>
            </div>
            <div className="quiz-option-radio" />
          </div>
        ))}
      </div>
    </div>
  )
}

// ── 1. AGE SELECT (ADAPTATIVO HOMEM/MULHER) ──
function AgeSelect({ answers, onSelect }) {
  const isMale = answers.gender === 'male'

  const ageImages = {
    '18-29': isMale ? '/images/man-18-29.png' : '/images/woman-18-29.png',
    '30-39': isMale ? '/images/man-30-39.png' : '/images/woman-30-39.png',
    '40-49': isMale ? '/images/man-40-49.png' : '/images/woman-40-49.png',
    '50-plus': isMale ? '/images/man-50-plus.png' : '/images/woman-50-plus.png',
  }

  return (
    <div className="quiz-question" style={{ paddingTop: 16 }}>
      <img src="/logo.png" alt="NEXA FIT PRO" className="quiz-logo" style={{ marginBottom: 16 }} />
      <h1 className="quiz-question-title">PLANO DE TREINO<br /><span style={{ color: 'var(--neon)' }}>{isMale ? 'MASCULINO' : 'FEMININO'} PERSONALIZADO</span></h1>
      <p className="quiz-question-subtitle" style={{ marginBottom: 20 }}>Qual é a sua faixa etária?</p>
      
      <div className="quiz-age-cards">
        {QUIZ_DATA.ages.map(age => (
          <div key={age.id} className={`quiz-age-card ${answers.ageBucket === age.id ? 'selected' : ''}`} onClick={() => onSelect(age.id)}>
            <img src={ageImages[age.id]} alt={age.label} className="quiz-age-card-bg" style={{ objectFit: 'cover' }} />
            <div className="quiz-age-card-label">{age.label}</div>
          </div>
        ))}
      </div>
      <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 16, lineHeight: 1.5 }}>
        Treinos em Casa ou Academia • Acesso Completo • Protocolo Individual
      </p>
    </div>
  )
}

// ── SINGLE QUESTION (COM IMAGENS 100% PRECISAS E CORRIGIDAS) ──
function SingleQuestion({ screen, answers, onSelect }) {
  const ansKey = screen.id === 'likes-music' ? 'likesMusic' : screen.id.replace(/-/g, '_').replace('body_type','bodyType').replace('dream_body','dreamBody').replace('work_routine','workRoutine').replace('typical_day','typicalDay').replace('main_reason','mainReason')
  const options = QUIZ_DATA[screen.data] || []
  const isMale = answers.gender === 'male'
  const useImageCards = ['goal', 'body-type', 'dream-body'].includes(screen.id)

  const getCardImage = (screenId, optId) => {
    if (screenId === 'body-type') {
      if (isMale) {
        if (optId === 'magro') return '/images/man-status-1.png'
        if (optId === 'medio') return '/images/man-status-2.png'
        if (optId === 'grande') return '/images/man-status-3.png'
        return '/images/body-fat-man.png'
      } else {
        if (optId === 'magro') return '/images/woman-status-1.png'
        if (optId === 'medio') return '/images/woman-status-2.png'
        if (optId === 'grande') return '/images/woman-status-3.png'
        return '/images/body-fat-woman.png'
      }
    }
    if (screenId === 'dream-body') {
      if (isMale) {
        if (optId === 'atletico') return '/images/body-fit-man.png'
        if (optId === 'tonificado') return '/images/genetic-male.png'
        if (optId === 'forte') return '/images/transform-male.png'
        if (optId === 'saudavel') return '/images/healthy-man.jpg'
        return '/images/healthy-man.jpg'
      } else {
        if (optId === 'atletico') return '/images/body-fit-woman.png'
        if (optId === 'tonificado') return '/images/woman-ab-tone.jpg'
        if (optId === 'forte') return '/images/transform-female.png'
        if (optId === 'saudavel') return '/images/healthy-woman.jpg'
        return '/images/healthy-woman.jpg'
      }
    }
    if (screenId === 'goal') {
      if (isMale) {
        if (optId === 'emagrecer') return '/images/man-status-3.png'
        if (optId === 'massa') return '/images/transform-male.png'
        if (optId === 'definir') return '/images/genetic-male.png'
        return '/images/man-18-29.png'
      } else {
        if (optId === 'emagrecer') return '/images/woman-status-3.png'
        if (optId === 'massa') return '/images/transform-female.png'
        if (optId === 'definir') return '/images/woman-ab-tone.jpg'
        return '/images/body-fit-woman.png'
      }
    }
    return isMale ? '/images/healthy-man.jpg' : '/images/healthy-woman.jpg'
  }

  return (
    <div className="quiz-question">
      <h2 className="quiz-question-title">{QUESTION_TITLES[screen.id]}</h2>
      {QUESTION_SUBTITLES[screen.id] && <p className="quiz-question-subtitle">{QUESTION_SUBTITLES[screen.id]}</p>}
      
      {useImageCards ? (
        <div className="quiz-age-cards">
          {options.map(opt => (
            <div key={opt.id} className={`quiz-age-card ${answers[ansKey] === opt.id ? 'selected' : ''}`} onClick={() => onSelect(opt.id)}>
              <img src={getCardImage(screen.id, opt.id)} alt={opt.label} className="quiz-age-card-bg" style={{ objectFit: 'cover' }} />
              <div className="quiz-age-card-label" style={{ fontSize: 13, padding: '10px 8px' }}>{opt.label}</div>
            </div>
          ))}
        </div>
      ) : (
        <div className="quiz-options">
          {options.map(opt => (
            <div key={opt.id} className={`quiz-option ${answers[ansKey] === opt.id ? 'selected' : ''}`} onClick={() => onSelect(opt.id)}>
              <div className="quiz-option-icon">{opt.icon}</div>
              <span className="quiz-option-text">{opt.label}</span>
              <div className="quiz-option-radio" />
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ── MULTI QUESTION ──
function MultiQuestion({ screen, answers, onToggle, onNext }) {
  const ansKey = screen.id.replace(/-/g, '_').replace('secondary_goals','secondaryGoals').replace('focus_zones','focusZones').replace('bad_habits','badHabits').replace('weight_triggers','weightTriggers')
  const selected = answers[ansKey] || []
  const options = QUIZ_DATA[screen.data] || []

  return (
    <div className="quiz-question">
      <h2 className="quiz-question-title">{QUESTION_TITLES[screen.id]}</h2>
      {QUESTION_SUBTITLES[screen.id] && <p className="quiz-question-subtitle">{QUESTION_SUBTITLES[screen.id]}</p>}
      
      <div className="quiz-options">
        {options.map(opt => (
          <div key={opt.id} className={`quiz-option ${selected.includes(opt.id) ? 'selected' : ''}`} onClick={() => onToggle(opt.id)}>
            <div className="quiz-option-icon">{opt.icon}</div>
            <span className="quiz-option-text">{opt.label}</span>
            <div className="quiz-option-radio" />
          </div>
        ))}
      </div>

      <StickyBottomAction
        onClick={onNext}
        disabled={selected.length === 0}
        text={selected.length > 0 ? `CONTINUAR (${selected.length} SELECIONADA${selected.length > 1 ? 'S' : ''})` : 'CONTINUAR'}
        disabledText="SELECIONE AO MENOS 1 OPÇÃO"
      />
    </div>
  )
}

// ── NOVO SLIDER DE PESO & ALTURA COM IMC EM TEMPO REAL ──
function MeasurementsSliderScreen({ answers, onSave }) {
  const [weight, setWeight] = useState(() => Number(answers.weight) || 75)
  const [height, setHeight] = useState(() => Number(answers.height) || 170)

  const bmi = (weight / Math.pow(height / 100, 2)).toFixed(1)
  const numBmi = Number(bmi)

  // Status e cor do IMC
  let statusText = 'Peso Normal'
  let statusColor = '#22C55E'

  if (numBmi < 18.5) {
    statusText = 'Abaixo do Peso'
    statusColor = '#3B82F6'
  } else if (numBmi >= 18.5 && numBmi < 25) {
    statusText = 'Peso Normal (Saudável)'
    statusColor = '#22C55E'
  } else if (numBmi >= 25 && numBmi < 30) {
    statusText = 'Sobrepeso'
    statusColor = '#F59E0B'
  } else if (numBmi >= 30 && numBmi < 35) {
    statusText = 'Obesidade Grau I'
    statusColor = '#F97316'
  } else {
    statusText = 'Obesidade II+'
    statusColor = '#EF4444'
  }

  // Posição na escala de 15 a 40
  const markerPercent = Math.min(Math.max(((numBmi - 15) / (40 - 15)) * 100, 2), 98)

  const weightPercent = ((weight - 20) / (300 - 20)) * 100
  const heightPercent = ((height - 50) / (250 - 50)) * 100

  const adjustWeight = (delta) => {
    playQuizBeep(520, 0.04)
    setWeight(w => Math.min(Math.max(w + delta, 20), 300))
  }

  const adjustHeight = (delta) => {
    playQuizBeep(520, 0.04)
    setHeight(h => Math.min(Math.max(h + delta, 50), 250))
  }

  return (
    <div className="quiz-question" style={{ maxWidth: 440, margin: '0 auto', textAlign: 'center' }}>
      
      {/* ── 1. SEU PESO ── */}
      <div style={{ marginBottom: 28, background: '#111', padding: '16px 14px', borderRadius: 16, border: '1px solid rgba(255,255,255,0.06)' }}>
        <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-secondary)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 }}>Seu peso</h3>
        
        {/* Number Box with (-) and (+) */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 20, marginBottom: 14 }}>
          <button
            onClick={() => adjustWeight(-1)}
            style={{
              width: 46, height: 46, borderRadius: '50%', background: '#1c1c1c', border: '1.5px solid #333',
              color: '#fff', fontSize: 24, fontWeight: 900, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 4px 12px rgba(0,0,0,0.5)', transition: 'all 0.15s'
            }}
            onMouseDown={(e) => e.currentTarget.style.transform = 'scale(0.92)'}
            onMouseUp={(e) => e.currentTarget.style.transform = 'scale(1)'}
          >
            -
          </button>
          
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, minWidth: 120, justifyContent: 'center' }}>
            <span style={{ fontSize: 46, fontWeight: 900, color: '#fff', fontFamily: 'var(--font-primary)', letterSpacing: -1 }}>{weight}</span>
            <span style={{ fontSize: 18, color: 'var(--text-muted)', fontWeight: 700 }}>kg</span>
          </div>

          <button
            onClick={() => adjustWeight(1)}
            style={{
              width: 46, height: 46, borderRadius: '50%', background: '#1c1c1c', border: '1.5px solid #333',
              color: '#fff', fontSize: 24, fontWeight: 900, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 4px 12px rgba(0,0,0,0.5)', transition: 'all 0.15s'
            }}
            onMouseDown={(e) => e.currentTarget.style.transform = 'scale(0.92)'}
            onMouseUp={(e) => e.currentTarget.style.transform = 'scale(1)'}
          >
            +
          </button>
        </div>

        {/* Range Slider Peso */}
        <div style={{ padding: '0 6px' }}>
          <input
            type="range"
            min="20"
            max="300"
            value={weight}
            onChange={(e) => { playQuizBeep(500, 0.02); setWeight(Number(e.target.value)) }}
            style={{
              width: '100%',
              accentColor: 'var(--neon)',
              height: 8,
              borderRadius: 4,
              cursor: 'pointer',
              background: `linear-gradient(to right, var(--neon) 0%, var(--neon) ${weightPercent}%, #2A2A2A ${weightPercent}%, #2A2A2A 100%)`,
              outline: 'none'
            }}
          />
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--text-muted)', marginTop: 6, fontWeight: 600 }}>
            <span>20kg</span>
            <span>300kg</span>
          </div>
        </div>
      </div>

      {/* ── 2. SUA ALTURA ── */}
      <div style={{ marginBottom: 28, background: '#111', padding: '16px 14px', borderRadius: 16, border: '1px solid rgba(255,255,255,0.06)' }}>
        <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-secondary)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 }}>Sua altura</h3>
        
        {/* Number Box with (-) and (+) */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 20, marginBottom: 14 }}>
          <button
            onClick={() => adjustHeight(-1)}
            style={{
              width: 46, height: 46, borderRadius: '50%', background: '#1c1c1c', border: '1.5px solid #333',
              color: '#fff', fontSize: 24, fontWeight: 900, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 4px 12px rgba(0,0,0,0.5)', transition: 'all 0.15s'
            }}
            onMouseDown={(e) => e.currentTarget.style.transform = 'scale(0.92)'}
            onMouseUp={(e) => e.currentTarget.style.transform = 'scale(1)'}
          >
            -
          </button>
          
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, minWidth: 120, justifyContent: 'center' }}>
            <span style={{ fontSize: 46, fontWeight: 900, color: '#fff', fontFamily: 'var(--font-primary)', letterSpacing: -1 }}>{height}</span>
            <span style={{ fontSize: 18, color: 'var(--text-muted)', fontWeight: 700 }}>cm</span>
          </div>

          <button
            onClick={() => adjustHeight(1)}
            style={{
              width: 46, height: 46, borderRadius: '50%', background: '#1c1c1c', border: '1.5px solid #333',
              color: '#fff', fontSize: 24, fontWeight: 900, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 4px 12px rgba(0,0,0,0.5)', transition: 'all 0.15s'
            }}
            onMouseDown={(e) => e.currentTarget.style.transform = 'scale(0.92)'}
            onMouseUp={(e) => e.currentTarget.style.transform = 'scale(1)'}
          >
            +
          </button>
        </div>

        {/* Range Slider Altura */}
        <div style={{ padding: '0 6px' }}>
          <input
            type="range"
            min="50"
            max="250"
            value={height}
            onChange={(e) => { playQuizBeep(500, 0.02); setHeight(Number(e.target.value)) }}
            style={{
              width: '100%',
              accentColor: 'var(--neon)',
              height: 8,
              borderRadius: 4,
              cursor: 'pointer',
              background: `linear-gradient(to right, var(--neon) 0%, var(--neon) ${heightPercent}%, #2A2A2A ${heightPercent}%, #2A2A2A 100%)`,
              outline: 'none'
            }}
          />
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--text-muted)', marginTop: 6, fontWeight: 600 }}>
            <span>50cm</span>
            <span>250cm</span>
          </div>
        </div>
      </div>

      {/* ── 3. CARD DE IMC EM TEMPO REAL ── */}
      <div style={{
        background: '#141414',
        borderRadius: 20,
        padding: 22,
        border: '1.5px solid rgba(255,255,255,0.08)',
        boxShadow: '0 8px 30px rgba(0,0,0,0.5)',
        marginBottom: 16
      }}>
        <div style={{ fontSize: 13, color: 'var(--text-muted)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4 }}>
          Seu IMC
        </div>
        
        <div style={{ fontSize: 44, fontWeight: 900, color: 'var(--neon)', lineHeight: 1, marginBottom: 6, fontFamily: 'var(--font-primary)' }}>
          {bmi}
        </div>

        <div style={{ fontSize: 15, fontWeight: 800, color: statusColor, marginBottom: 18 }}>
          {statusText}
        </div>

        {/* Multi-Segment Color Scale */}
        <div style={{ position: 'relative', height: 12, borderRadius: 6, background: 'linear-gradient(to right, #3B82F6 0%, #22C55E 25%, #F59E0B 50%, #F97316 75%, #EF4444 100%)', marginBottom: 10, boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.5)' }}>
          {/* Marker Dot */}
          <div style={{
            position: 'absolute',
            top: '50%',
            left: `${markerPercent}%`,
            transform: 'translate(-50%, -50%)',
            width: 20,
            height: 20,
            borderRadius: '50%',
            background: '#000',
            border: '3px solid #fff',
            boxShadow: '0 0 10px rgba(0,0,0,0.9), 0 0 6px var(--neon)',
            transition: 'left 0.15s ease'
          }} />
        </div>

        {/* Number Scale Labels */}
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--text-muted)', fontWeight: 700 }}>
          <span>15</span>
          <span>18.5</span>
          <span>25</span>
          <span>30</span>
          <span>35</span>
          <span>40</span>
        </div>
      </div>

      <StickyBottomAction onClick={() => onSave(weight, height)} text="CONTINUAR" />
    </div>
  )
}

// ── INTERSTITIAL COM TEXTO E PROVAS REAIS SEGREGADAS POR GÊNERO ──
function Interstitial({ screen, answers, onContinue }) {
  const content = getInterstitialContent(screen.id, answers)
  const isMale = answers.gender === 'male'
  const isSocialProof = screen.id === 'social-proof'

  return (
    <div className="quiz-interstitial" style={{ maxWidth: 480, margin: '0 auto', textAlign: 'center', paddingBottom: 10 }}>
      {/* Se for prova social, exibe a foto real do antes/depois do gênero */}
      {isSocialProof && (
        <div style={{
          borderRadius: 18,
          overflow: 'hidden',
          border: '2px solid rgba(163,230,53,0.4)',
          boxShadow: '0 8px 30px rgba(0,0,0,0.6)',
          marginBottom: 16,
          background: '#111',
          position: 'relative'
        }}>
          <img
            src={isMale ? '/images/male-transformation.jpg' : '/images/jennifer-transformation.jpg'}
            alt="Resultado Real de Aluno"
            style={{ width: '100%', height: 260, objectFit: 'cover', display: 'block' }}
          />
          <div style={{
            position: 'absolute', bottom: 8, left: 10, right: 10,
            background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)',
            borderRadius: 10, padding: '6px 12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between'
          }}>
            <span style={{ fontSize: 11, color: 'var(--neon)', fontWeight: 800 }}>⚡ CASO REAL DE SUCESSO</span>
            <span style={{ fontSize: 11, color: '#fff', fontWeight: 700 }}>-15kg em 60 dias</span>
          </div>
        </div>
      )}

      <div className="quiz-interstitial-icon">{content.icon}</div>
      <h2 className="quiz-interstitial-title" dangerouslySetInnerHTML={{ __html: content.title }} />
      <p className="quiz-interstitial-text" dangerouslySetInnerHTML={{ __html: content.text }} />
      
      {content.social && (
        <div className="quiz-social-proof">
          <div className="quiz-social-avatars">
            {['M','C','A','R','P'].map((l,i) => <div key={i} className="quiz-social-avatar">{l}</div>)}
          </div>
          <span className="quiz-social-text" dangerouslySetInnerHTML={{ __html: content.social }} />
        </div>
      )}

      {/* Botão posicionado naturalmente abaixo do texto e fixando no rodapé com sticky quando necessário */}
      <div style={{
        position: 'sticky',
        bottom: 16,
        zIndex: 50,
        width: '100%',
        maxWidth: 440,
        margin: '16px auto 0'
      }}>
        <button
          type="button"
          onClick={() => {
            playQuizBeep(750, 0.08)
            onContinue()
          }}
          className="quiz-cta"
          style={{
            width: '100%',
            height: 52,
            fontSize: 14,
            fontWeight: 900,
            textTransform: 'uppercase',
            letterSpacing: 0.5,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
            boxShadow: '0 6px 25px rgba(163,230,53,0.45)'
          }}
        >
          <span>CONTINUAR</span>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#000" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <line x1="5" y1="12" x2="19" y2="12" />
            <polyline points="12 5 19 12 12 19" />
          </svg>
        </button>
      </div>
    </div>
  )
}

// ── VÍDEO INTERSTITIAL (GIF STYLE COMPACTO + BOTÃO STICKY ABAIXO DO TEXTO) ──
function VideoInterstitial({ onContinue }) {
  return (
    <div className="quiz-interstitial" style={{ maxWidth: 480, margin: '0 auto', textAlign: 'center', paddingBottom: 16 }}>
      <div style={{
        borderRadius: 20,
        overflow: 'hidden',
        border: '2px solid rgba(163,230,53,0.4)',
        boxShadow: '0 0 25px rgba(163,230,53,0.25)',
        marginBottom: 14,
        background: '#000',
        height: 240
      }}>
        <video
          src="/videos/quiz-step.mp4"
          autoPlay
          loop
          muted
          playsInline
          style={{ width: '100%', height: 240, display: 'block', objectFit: 'cover' }}
        />
      </div>

      <h2 className="quiz-interstitial-title" style={{ fontSize: 20, marginBottom: 8 }}>
        Treinos com <span className="highlight">Biomecânica de Alta Precisão</span>
      </h2>
      <p className="quiz-interstitial-text" style={{ fontSize: 13, lineHeight: 1.5, marginBottom: 16 }}>
        Feito para você treinar <strong>na sala da sua casa</strong> ou na academia. Movimentos demonstrados em alta definição com instruções passo a passo, cronômetro de descanso e contagem de repetições.
      </p>

      {/* Botão posicionado naturalmente abaixo do texto e fixando no rodapé com sticky quando necessário */}
      <div style={{
        position: 'sticky',
        bottom: 16,
        zIndex: 50,
        width: '100%',
        maxWidth: 440,
        margin: '16px auto 0'
      }}>
        <button
          type="button"
          onClick={() => {
            playQuizBeep(750, 0.08)
            onContinue()
          }}
          className="quiz-cta"
          style={{
            width: '100%',
            height: 52,
            fontSize: 14,
            fontWeight: 900,
            textTransform: 'uppercase',
            letterSpacing: 0.5,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
            boxShadow: '0 6px 25px rgba(163,230,53,0.45)'
          }}
        >
          <span>CONTINUAR</span>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#000" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <line x1="5" y1="12" x2="19" y2="12" />
            <polyline points="12 5 19 12 12 19" />
          </svg>
        </button>
      </div>
    </div>
  )
}

function getInterstitialContent(id, answers) {
  const isMale = answers.gender === 'male'
  switch(id) {
    case 'social-proof': return {
      icon: '🏆', title: 'Mais de <span class="highlight">147.000 pessoas</span> já transformaram o corpo',
      text: `${isMale ? 'Homens' : 'Mulheres'} no Brasil inteiro usam o protocolo NEXA FIT PRO para eliminar gordura e definir os músculos treinando em casa ou na academia.`,
      social: `<strong>147.832</strong> usuários ativos hoje`
    }
    case 'i-goal': {
      const goalTexts = {
        emagrecer: 'eliminar até 15kg de gordura pura e acelerar o metabolismo',
        massa: 'construir músculos densos e volumosos com estímulo progressivo',
        definir: 'trincar o abdômen e tonificar os músculos visíveis',
        saude: 'ganhar vigor, vitalidade e qualidade de vida inigualável',
      }
      return {
        icon: '✅', title: 'Nós sabemos exatamente como <span class="highlight">chegar lá!</span>',
        text: `O algoritmo do NEXA FIT PRO calcula suas necessidades diárias para <strong>${goalTexts[answers.goal] || 'alcançar seus objetivos'}</strong> no conforto da sua casa ou na academia.`,
      }
    }
    case 'i-music': return {
      icon: '🎧', title: 'Rádio Fitness <span class="highlight">Integrada no App</span>',
      text: 'O NEXA FIT PRO possui <strong>estações de música contínua (eletrônica, hip hop, sertanejo e rock) sem anúncios</strong> para você treinar sempre com energia e motivação máxima!',
    }
    case 'i-energy': return {
      icon: '⚡', title: 'Seu nível de energia vai <span class="highlight">explodir</span>',
      text: 'Com treinos rápidos de 15 a 30 minutos e hidratação guiada, seu corpo atinge o pico de queima calórica e disposição.',
    }
    case 'i-authority': return {
      icon: '🏅', title: 'Metodologia <span class="highlight">Científica Aprovada</span>',
      text: 'Planos elaborados para queima acelerada e preservação de massa magra, sem precisar de nenhum equipamento caro.',
    }
    case 'i-awards': return {
      icon: '🛡️', title: 'Condição Especial Liberada',
      text: '✅ <strong>Sem mensalidades</strong> — pague uma única vez e acesse para sempre<br/>✅ <strong>Garantia Incondicional de 30 dias</strong><br/>✅ <strong>Treinos em Casa & Academia, Dietas & Rádio 24h inclusos</strong>',
    }
    default: return { icon: '✨', title: 'Continuando...', text: '' }
  }
}

// ── DIAGNÓSTICO COM IMAGENS REAIS SEGREGADAS ──
function DiagnosisScreen({ answers, onContinue }) {
  const diag = getDiagnosis(answers)
  return (
    <div className="quiz-interstitial" style={{ maxWidth: 480, margin: '0 auto', paddingBottom: 10 }}>
      {diag.image && (
        <div style={{ width: '100%', height: 160, borderRadius: 16, overflow: 'hidden', marginBottom: 14, border: '1px solid rgba(163,230,53,0.2)' }}>
          <img src={diag.image} alt={diag.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        </div>
      )}
      <div className="quiz-interstitial-icon" style={{ fontSize: 32 }}>{diag.icon}</div>
      <h2 className="quiz-interstitial-title" style={{ fontSize: 20 }}>
        Diagnóstico: <span className="highlight">{diag.title}</span>
      </h2>
      {/* Botão posicionado naturalmente abaixo do texto e fixando no rodapé com sticky quando necessário */}
      <div style={{
        position: 'sticky',
        bottom: 16,
        zIndex: 50,
        width: '100%',
        maxWidth: 440,
        margin: '16px auto 0'
      }}>
        <button
          type="button"
          onClick={() => {
            playQuizBeep(750, 0.08)
            onContinue()
          }}
          className="quiz-cta"
          style={{
            width: '100%',
            height: 52,
            fontSize: 14,
            fontWeight: 900,
            textTransform: 'uppercase',
            letterSpacing: 0.5,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
            boxShadow: '0 6px 25px rgba(163,230,53,0.45)'
          }}
        >
          <span>CONTINUAR</span>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#000" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <line x1="5" y1="12" x2="19" y2="12" />
            <polyline points="12 5 19 12 12 19" />
          </svg>
        </button>
      </div>
    </div>
  )
}

// ── INPUT SCREEN COM SLIDERS INTERATIVOS PARA PESO DESEJADO & IDADE ──
function InputScreen({ screen, answers, setAnswer, onNext }) {
  const isGoalWeight = screen.inputType === 'goalWeight'
  const isAge = screen.inputType === 'age'

  // ── 1. SLIDER DE PESO DESEJADO ──
  if (isGoalWeight) {
    const currentWeight = Number(answers.weight) || 75
    const initialGoal = Number(answers.goalWeight) || Math.max(currentWeight - 10, 45)
    const [goalVal, setGoalVal] = useState(initialGoal)

    const min = 35
    const max = 180
    const percent = Math.min(Math.max(((goalVal - min) / (max - min)) * 100, 0), 100)
    const weightDiff = (currentWeight - goalVal).toFixed(1)
    const isWeightLoss = currentWeight > goalVal
    const isWeightGain = currentWeight < goalVal

    const updateGoal = (val) => {
      const clamped = Math.min(Math.max(val, min), max)
      setGoalVal(clamped)
      setAnswer('goalWeight', String(clamped))
    }

    const adjust = (delta) => {
      playQuizBeep(520, 0.04)
      updateGoal(goalVal + delta)
    }

    return (
      <div className="quiz-question" style={{ maxWidth: 460, margin: '0 auto', textAlign: 'center' }}>
        <h2 className="quiz-question-title">Qual é o seu peso desejado?</h2>
        <p className="quiz-question-subtitle" style={{ marginBottom: 18 }}>
          Defina sua meta para calibrarmos seu déficit calórico e treino
        </p>

        {/* Card Principal com Slider de Peso Desejado */}
        <div style={{
          background: '#121212',
          borderRadius: 20,
          padding: '20px 16px',
          border: '1.5px solid rgba(255,255,255,0.08)',
          boxShadow: '0 8px 30px rgba(0,0,0,0.5)',
          marginBottom: 16
        }}>
          <div style={{ fontSize: 12, fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 12 }}>
            Sua Meta de Peso
          </div>

          {/* Valor Numérico Grande com Botões (+) e (-) */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 20, marginBottom: 16 }}>
            <button
              type="button"
              onClick={() => adjust(-1)}
              style={{
                width: 48,
                height: 48,
                borderRadius: '50%',
                background: '#1e1e1e',
                border: '1.5px solid #333',
                color: '#fff',
                fontSize: 24,
                fontWeight: 900,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 12px rgba(0,0,0,0.5)',
                transition: 'all 0.15s ease'
              }}
              onMouseDown={(e) => e.currentTarget.style.transform = 'scale(0.92)'}
              onMouseUp={(e) => e.currentTarget.style.transform = 'scale(1)'}
            >
              -
            </button>

            <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, minWidth: 130, justifyContent: 'center' }}>
              <span style={{ fontSize: 52, fontWeight: 900, color: 'var(--neon)', fontFamily: 'var(--font-primary)', letterSpacing: -1, lineHeight: 1 }}>
                {goalVal}
              </span>
              <span style={{ fontSize: 20, color: '#fff', fontWeight: 800 }}>kg</span>
            </div>

            <button
              type="button"
              onClick={() => adjust(1)}
              style={{
                width: 48,
                height: 48,
                borderRadius: '50%',
                background: '#1e1e1e',
                border: '1.5px solid #333',
                color: '#fff',
                fontSize: 24,
                fontWeight: 900,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 12px rgba(0,0,0,0.5)',
                transition: 'all 0.15s ease'
              }}
              onMouseDown={(e) => e.currentTarget.style.transform = 'scale(0.92)'}
              onMouseUp={(e) => e.currentTarget.style.transform = 'scale(1)'}
            >
              +
            </button>
          </div>

          {/* Barra Range Deslizante */}
          <div style={{ padding: '0 8px', marginBottom: 6 }}>
            <input
              type="range"
              min={min}
              max={max}
              value={goalVal}
              onChange={(e) => {
                playQuizBeep(480, 0.02)
                updateGoal(Number(e.target.value))
              }}
              style={{
                width: '100%',
                accentColor: 'var(--neon)',
                height: 10,
                borderRadius: 5,
                cursor: 'pointer',
                background: `linear-gradient(to right, var(--neon) 0%, var(--neon) ${percent}%, #2A2A2A ${percent}%, #2A2A2A 100%)`,
                outline: 'none'
              }}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--text-muted)', marginTop: 8, fontWeight: 700 }}>
              <span>{min}kg</span>
              <span>80kg</span>
              <span>120kg</span>
              <span>{max}kg</span>
            </div>
          </div>
        </div>

        {/* Card Comparativo com o Peso Atual */}
        <div style={{
          background: 'linear-gradient(135deg, rgba(163,230,53,0.1) 0%, rgba(20,20,20,0.9) 100%)',
          borderRadius: 16,
          padding: '14px 16px',
          border: '1.5px solid rgba(163,230,53,0.3)',
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          textAlign: 'left',
          marginBottom: 16
        }}>
          <div style={{
            fontSize: 28,
            width: 44,
            height: 44,
            borderRadius: 12,
            background: 'rgba(163,230,53,0.15)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0
          }}>
            🎯
          </div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 900, color: '#fff' }}>
              {isWeightLoss ? (
                <>Eliminar <span style={{ color: 'var(--neon)' }}>{Math.abs(weightDiff)} kg</span> de gordura</>
              ) : isWeightGain ? (
                <>Ganhar <span style={{ color: 'var(--neon)' }}>{Math.abs(weightDiff)} kg</span> de massa muscular</>
              ) : (
                <>Manter o peso e <span style={{ color: 'var(--neon)' }}>trocar gordura por massa</span></>
              )}
            </div>
            <div style={{ fontSize: 11, color: '#aaa', marginTop: 2 }}>
              Peso atual: <strong>{currentWeight}kg</strong> → Meta: <strong>{goalVal}kg</strong>
            </div>
          </div>
        </div>

        <StickyBottomAction onClick={onNext} text="CONFIRMAR META DE PESO" />
      </div>
    )
  }

  // ── 2. SLIDER DE IDADE ──
  if (isAge) {
    const initialAge = Number(answers.ageYears) || 30
    const [ageVal, setAgeVal] = useState(initialAge)

    const min = 14
    const max = 85
    const percent = Math.min(Math.max(((ageVal - min) / (max - min)) * 100, 0), 100)

    const updateAge = (val) => {
      const clamped = Math.min(Math.max(val, min), max)
      setAgeVal(clamped)
      setAnswer('ageYears', String(clamped))
    }

    const adjust = (delta) => {
      playQuizBeep(520, 0.04)
      updateAge(ageVal + delta)
    }

    // Diagnóstico biológico por faixa etária
    let ageBadge = {
      title: 'Pico de Hipertrofia & Força',
      desc: 'Taxa metabólica alta e ótima resposta a estímulos progressivos.',
      icon: '🔥',
      color: '#A3E635'
    }

    if (ageVal < 24) {
      ageBadge = {
        title: 'Metabolismo Jovem & Rápido',
        desc: 'Recuperação muscular acelerada e alta capacidade lipolítica.',
        icon: '⚡',
        color: '#38BDF8'
      }
    } else if (ageVal >= 24 && ageVal <= 38) {
      ageBadge = {
        title: 'Pico de Hipertrofia & Força',
        desc: 'Fase ideal para consolidação de massa magra e definição rápida.',
        icon: '🔥',
        color: '#A3E635'
      }
    } else if (ageVal >= 39 && ageVal <= 52) {
      ageBadge = {
        title: 'Otimização Metabólica & Hormonal',
        desc: 'Foco em treinos inteligentes para evitar platô e queimar gordura profunda.',
        icon: '🎯',
        color: '#F59E0B'
      }
    } else {
      ageBadge = {
        title: 'Longevidade, Vitalidade & Articulações',
        desc: 'Preservação de massa magra, saúde articular e vigor físico duradouro.',
        icon: '🛡️',
        color: '#EC4899'
      }
    }

    return (
      <div className="quiz-question" style={{ maxWidth: 460, margin: '0 auto', textAlign: 'center' }}>
        <h2 className="quiz-question-title">Qual é a sua idade?</h2>
        <p className="quiz-question-subtitle" style={{ marginBottom: 18 }}>
          Fundamental para calcularmos seu gasto calórico basal e intensidade ideal
        </p>

        {/* Card Principal com Slider de Idade */}
        <div style={{
          background: '#121212',
          borderRadius: 20,
          padding: '20px 16px',
          border: '1.5px solid rgba(255,255,255,0.08)',
          boxShadow: '0 8px 30px rgba(0,0,0,0.5)',
          marginBottom: 16
        }}>
          <div style={{ fontSize: 12, fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 12 }}>
            Sua Idade
          </div>

          {/* Valor Numérico Grande com Botões (+) e (-) */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 20, marginBottom: 16 }}>
            <button
              type="button"
              onClick={() => adjust(-1)}
              style={{
                width: 48,
                height: 48,
                borderRadius: '50%',
                background: '#1e1e1e',
                border: '1.5px solid #333',
                color: '#fff',
                fontSize: 24,
                fontWeight: 900,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 12px rgba(0,0,0,0.5)',
                transition: 'all 0.15s ease'
              }}
              onMouseDown={(e) => e.currentTarget.style.transform = 'scale(0.92)'}
              onMouseUp={(e) => e.currentTarget.style.transform = 'scale(1)'}
            >
              -
            </button>

            <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, minWidth: 130, justifyContent: 'center' }}>
              <span style={{ fontSize: 52, fontWeight: 900, color: 'var(--neon)', fontFamily: 'var(--font-primary)', letterSpacing: -1, lineHeight: 1 }}>
                {ageVal}
              </span>
              <span style={{ fontSize: 20, color: '#fff', fontWeight: 800 }}>anos</span>
            </div>

            <button
              type="button"
              onClick={() => adjust(1)}
              style={{
                width: 48,
                height: 48,
                borderRadius: '50%',
                background: '#1e1e1e',
                border: '1.5px solid #333',
                color: '#fff',
                fontSize: 24,
                fontWeight: 900,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 12px rgba(0,0,0,0.5)',
                transition: 'all 0.15s ease'
              }}
              onMouseDown={(e) => e.currentTarget.style.transform = 'scale(0.92)'}
              onMouseUp={(e) => e.currentTarget.style.transform = 'scale(1)'}
            >
              +
            </button>
          </div>

          {/* Barra Range Deslizante */}
          <div style={{ padding: '0 8px', marginBottom: 6 }}>
            <input
              type="range"
              min={min}
              max={max}
              value={ageVal}
              onChange={(e) => {
                playQuizBeep(480, 0.02)
                updateAge(Number(e.target.value))
              }}
              style={{
                width: '100%',
                accentColor: 'var(--neon)',
                height: 10,
                borderRadius: 5,
                cursor: 'pointer',
                background: `linear-gradient(to right, var(--neon) 0%, var(--neon) ${percent}%, #2A2A2A ${percent}%, #2A2A2A 100%)`,
                outline: 'none'
              }}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--text-muted)', marginTop: 8, fontWeight: 700 }}>
              <span>{min} anos</span>
              <span>30 anos</span>
              <span>50 anos</span>
              <span>{max} anos</span>
            </div>
          </div>
        </div>

        {/* Card de Diagnóstico Biológico por Idade */}
        <div style={{
          background: 'linear-gradient(135deg, rgba(255,255,255,0.04) 0%, rgba(20,20,20,0.9) 100%)',
          borderRadius: 16,
          padding: '14px 16px',
          border: `1.5px solid ${ageBadge.color}40`,
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          textAlign: 'left',
          marginBottom: 16
        }}>
          <div style={{
            fontSize: 28,
            width: 44,
            height: 44,
            borderRadius: 12,
            background: `${ageBadge.color}18`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0
          }}>
            {ageBadge.icon}
          </div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 900, color: ageBadge.color }}>
              {ageBadge.title}
            </div>
            <div style={{ fontSize: 11, color: '#bbb', marginTop: 2 }}>
              {ageBadge.desc}
            </div>
          </div>
        </div>

        <StickyBottomAction onClick={onNext} text="CONFIRMAR IDADE" />
      </div>
    )
  }

  // ── 3. INPUT DE TEXTO / E-MAIL / NOME ──
  const config = {
    email: { label: 'Digite seu melhor e-mail para receber seu plano', placeholder: 'seu@email.com', unit: '', key: 'email', type: 'email' },
    name: { label: 'Qual é o seu primeiro nome?', placeholder: 'Seu nome', unit: '', key: 'name', type: 'text' },
  }
  const cfg = config[screen.inputType] || { label: 'Preencha o campo abaixo', placeholder: '', unit: '', key: 'val', type: 'text' }
  const val = answers[cfg.key] || ''
  const isValid = cfg.type === 'email' ? /\S+@\S+\.\S+/.test(val) : val.trim().length >= 2

  const handleSubmit = (e) => {
    if (e) e.preventDefault()
    if (isValid) {
      onNext()
    }
  }

  return (
    <div className="quiz-question" style={{ maxWidth: 460, margin: '0 auto', paddingBottom: 110 }}>
      <h2 className="quiz-question-title">{cfg.label}</h2>
      {screen.inputType === 'email' && (
        <p className="quiz-question-subtitle" style={{ marginBottom: 18 }}>
          🔒 Enviaremos os dados de acesso e o resumo do seu protocolo individual.
        </p>
      )}
      
      <form onSubmit={handleSubmit} style={{ width: '100%' }}>
        <div className="quiz-input-group" style={{ marginBottom: 20 }}>
          <input
            className="quiz-input"
            type={cfg.type || 'text'}
            placeholder={cfg.placeholder}
            value={val}
            onChange={(e) => setAnswer(cfg.key, e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleSubmit(e)
              }
            }}
            autoFocus
            style={{
              fontSize: 18,
              padding: '16px 20px',
              borderRadius: 16,
              background: '#141414',
              border: '2px solid rgba(255,255,255,0.12)',
              color: '#fff',
              width: '100%',
              outline: 'none',
              boxShadow: '0 4px 20px rgba(0,0,0,0.4)',
              transition: 'border-color 0.2s'
            }}
            onFocus={(e) => e.target.style.borderColor = 'var(--neon)'}
            onBlur={(e) => e.target.style.borderColor = 'rgba(255,255,255,0.12)'}
          />
        </div>
        
        <StickyBottomAction
          onClick={handleSubmit}
          text="PRÓXIMO PASSO"
          disabled={!isValid}
          disabledText="PREENCHA O CAMPO PARA CONTINUAR"
        />
      </form>
    </div>
  )
}

// ── LOADING ANALYSIS ──
function LoadingScreen({ onComplete }) {
  const [progress, setProgress] = useState(0)
  const [bars, setBars] = useState([0, 0, 0, 0])
  const labels = ['Biotipo & Genética', 'Adaptação Treino em Casa/Academia', 'Taxa Metabólica Basal', 'Divisão de Macros']

  useEffect(() => {
    const steps = [
      { time: 400, bar: 0, val: 100, prog: 25 },
      { time: 1200, bar: 1, val: 100, prog: 50 },
      { time: 2000, bar: 2, val: 100, prog: 75 },
      { time: 2800, bar: 3, val: 100, prog: 100 },
    ]
    const timers = steps.map(s => setTimeout(() => {
      setBars(prev => { const n = [...prev]; n[s.bar] = s.val; return n })
      setProgress(s.prog)
    }, s.time))
    const done = setTimeout(onComplete, 3800)
    return () => { timers.forEach(clearTimeout); clearTimeout(done) }
  }, [onComplete])

  return (
    <div className="quiz-loading">
      <div className="quiz-loading-circle">
        <svg viewBox="0 0 120 120">
          <circle className="track" cx="60" cy="60" r="54" />
          <circle className="fill" cx="60" cy="60" r="54" style={{ strokeDashoffset: 339.292 - (339.292 * progress / 100) }} />
        </svg>
        <div className="quiz-loading-percent">{progress}%</div>
      </div>
      <h3 style={{ fontFamily: 'var(--font-primary)', fontSize: 20, fontWeight: 800, marginBottom: 8 }}>Analisando seus dados corporais...</h3>
      <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginBottom: 24 }}>Calculando déficit metabólico e curvas de treino</p>
      <div className="quiz-loading-bars">
        {labels.map((label, i) => (
          <div key={i} className="quiz-loading-bar">
            <span className="quiz-loading-bar-label">{label}</span>
            <div className="quiz-loading-bar-track"><div className="quiz-loading-bar-fill" style={{ width: `${bars[i]}%` }} /></div>
            <span className="quiz-loading-bar-check">{bars[i] === 100 ? '✅' : ''}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

// ── RESULT PROFILE SCREEN COM COMPARATIVO VALIDADO ──
function ResultScreen({ answers, onContinue }) {
  const bmi = answers.height && answers.weight ? (Number(answers.weight) / Math.pow(Number(answers.height) / 100, 2)).toFixed(1) : '24.2'
  const diag = getDiagnosis(answers)
  const isMale = answers.gender === 'male'

  return (
    <div className="quiz-result" style={{ maxWidth: 460, margin: '0 auto', paddingBottom: 110 }}>
      <h2 style={{ fontFamily: 'var(--font-primary)', fontSize: 19, fontWeight: 900, textAlign: 'center', marginBottom: 12 }}>
        Seu Diagnóstico Corporal está Pronto!
      </h2>

      {/* Card Antes vs Depois Base Validada */}
      <div style={{
        background: '#111',
        borderRadius: 18,
        padding: 12,
        border: '1.5px solid rgba(255,255,255,0.08)',
        marginBottom: 12
      }}>
        <div style={{
          borderRadius: 14,
          overflow: 'hidden',
          marginBottom: 10,
          border: '1px solid #222',
          background: '#000'
        }}>
          <img
            src={isMale ? '/images/male-transformation.jpg' : '/images/jennifer-transformation.jpg'}
            alt="Transformação Real"
            style={{ width: '100%', height: 'auto', objectFit: 'contain', display: 'block' }}
          />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
          {/* Card Antes */}
          <div style={{ background: '#181818', borderRadius: 10, padding: 8, border: '1px solid rgba(239,68,68,0.3)' }}>
            <div style={{ fontSize: 9, fontWeight: 900, color: '#EF4444', textTransform: 'uppercase', marginBottom: 4 }}>
              🔴 ANTES
            </div>
            <div style={{ fontSize: 10, color: '#aaa', marginBottom: 2 }}>
              <strong>Gordura:</strong> Média / Alta
            </div>
            <div style={{ fontSize: 10, color: '#aaa', marginBottom: 2 }}>
              <strong>Condição:</strong> Iniciante
            </div>
            <div style={{ fontSize: 10, color: '#aaa' }}>
              <strong>Comida:</strong> Cansaço & culpa
            </div>
          </div>

          {/* Card Depois */}
          <div style={{ background: '#181818', borderRadius: 10, padding: 8, border: '1px solid rgba(163,230,53,0.4)', boxShadow: '0 0 15px rgba(163,230,53,0.1)' }}>
            <div style={{ fontSize: 9, fontWeight: 900, color: 'var(--neon)', textTransform: 'uppercase', marginBottom: 4 }}>
              🟢 DEPOIS (60 DIAS)
            </div>
            <div style={{ fontSize: 10, color: '#fff', marginBottom: 2 }}>
              <strong>Gordura:</strong> Baixa (-15kg)
            </div>
            <div style={{ fontSize: 10, color: '#fff', marginBottom: 2 }}>
              <strong>Condição:</strong> Evoluindo
            </div>
            <div style={{ fontSize: 10, color: '#fff' }}>
              <strong>Comida:</strong> Controle & foco
            </div>
          </div>
        </div>
      </div>

      <div className="quiz-result-bmi" style={{ marginBottom: 12, padding: '10px 14px' }}>
        <p style={{ fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 2 }}>Índice de Massa Corporal (IMC)</p>
        <p style={{ fontFamily: 'var(--font-primary)', fontSize: 26, fontWeight: 900, color: 'var(--neon)' }}>{bmi}</p>
        <div className="quiz-result-bmi-scale">
          <div className="quiz-result-bmi-marker" style={{ left: `${Math.min(Math.max((bmi - 15) / 25 * 100, 2), 98)}%` }} />
        </div>
      </div>

      <div className="quiz-result-cards" style={{ marginBottom: 12 }}>
        <div className="quiz-result-card" style={{ padding: '8px 10px' }}>
          <div className="quiz-result-card-label" style={{ fontSize: 10 }}>Diagnóstico</div>
          <div className="quiz-result-card-value" style={{ fontSize: 11 }}>{diag.title}</div>
        </div>
        <div className="quiz-result-card" style={{ padding: '8px 10px' }}>
          <div className="quiz-result-card-label" style={{ fontSize: 10 }}>Modalidade</div>
          <div className="quiz-result-card-value" style={{ fontSize: 11 }}>Casa ou Academia</div>
        </div>
      </div>

      {/* ── BARRA DE AVALIAÇÃO DA PESSOA NA FOTO ── */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(163,230,53,0.06) 0%, #141414 100%)',
        border: '1.5px solid rgba(163,230,53,0.3)',
        borderRadius: 16,
        padding: '12px 14px',
        marginBottom: 16,
        boxShadow: '0 6px 20px rgba(0,0,0,0.4)',
        textAlign: 'left'
      }}>
        {/* Header da Avaliação */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8, flexWrap: 'wrap', gap: 6 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{
              width: 32,
              height: 32,
              borderRadius: '50%',
              background: 'var(--neon)',
              color: '#000',
              fontWeight: 900,
              fontSize: 13,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 0 10px rgba(163,230,53,0.3)'
            }}>
              {isMale ? 'C' : 'J'}
            </div>
            <div>
              <div style={{ fontSize: 12, fontWeight: 900, color: '#fff', display: 'flex', alignItems: 'center', gap: 4 }}>
                <span>{isMale ? 'Carlos Eduardo, 36 anos' : 'Jennifer Souza, 34 anos'}</span>
                <span style={{ fontSize: 9, color: '#22C55E', background: 'rgba(34,197,94,0.15)', padding: '1px 6px', borderRadius: 6, fontWeight: 800 }}>
                  ✓ Verificada
                </span>
              </div>
              <div style={{ fontSize: 10, color: 'var(--neon)', fontWeight: 800 }}>
                {isMale ? '🔥 -18 kg eliminados com este protocolo' : '🔥 -15 kg eliminados com este protocolo'}
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 3, color: '#FBBF24', fontSize: 12 }}>
            <span>⭐⭐⭐⭐⭐</span>
            <span style={{ fontSize: 11, fontWeight: 900, color: '#fff', marginLeft: 2 }}>5.0</span>
          </div>
        </div>

        {/* Citação do Depoimento */}
        <p style={{
          fontSize: 11.5,
          color: '#ddd',
          lineHeight: 1.45,
          margin: 0,
          fontStyle: 'italic',
          background: 'rgba(0,0,0,0.35)',
          padding: '8px 10px',
          borderRadius: 10,
          border: '1px solid rgba(255,255,255,0.06)'
        }}>
          {isMale
            ? '“Eu sempre desistia de dietas restritivas. O Nexa Fit Pro montou treinos diretos de 20min e cardápios com o que eu gosto. Em 60 dias perdi 18kg e recuperei meu tônus muscular!”'
            : '“Eu achava que precisava passar fome pra perder a barriga. Com o protocolo personalizado do app, comi bem, treinei em casa e o resultado na foto fala por si só. Valeu cada segundo!”'}
        </p>
      </div>

      <StickyBottomAction onClick={onContinue} text="CONTINUAR" />
    </div>
  )
}

// ── PROJECTION SCREEN COM GRÁFICO DE LINHAS MODERNO E FUTURISTA ──
function ProjectionScreen({ answers, onContinue }) {
  const current = Number(answers.weight) || 82
  const target = Number(answers.goalWeight) || Math.max(current - 15, 60)
  const diff = current - target
  const targetDate = new Date()
  targetDate.setDate(targetDate.getDate() + 60)
  const dateStr = targetDate.toLocaleDateString('pt-BR', { day: 'numeric', month: 'long' })

  // 5 Pontos de evolução ao longo de 8 semanas (60 dias)
  const points = []
  for (let i = 0; i <= 4; i++) {
    const w = current - (diff * (i / 4))
    points.push({ week: `Sem ${i === 0 ? '0' : i * 2}`, weight: Number(w.toFixed(1)) })
  }

  // Coordenadas SVG para gráfico de linha com viewBox 0 0 340 140
  const svgWidth = 340
  const svgHeight = 140
  const paddingX = 24
  const paddingY = 24
  const plotWidth = svgWidth - (paddingX * 2)
  const plotHeight = svgHeight - (paddingY * 2)

  // Mapear pontos para X e Y
  const coords = points.map((p, i) => {
    const x = paddingX + (i / 4) * plotWidth
    const y = paddingY + (i / 4) * plotHeight
    return { x, y, week: p.week, weight: p.weight }
  })

  // Path da linha suave
  const linePath = coords.reduce((acc, c, idx) => {
    if (idx === 0) return `M ${c.x} ${c.y}`
    const prev = coords[idx - 1]
    const cx1 = prev.x + (c.x - prev.x) / 2
    const cy1 = prev.y
    const cx2 = prev.x + (c.x - prev.x) / 2
    const cy2 = c.y
    return `${acc} C ${cx1} ${cy1}, ${cx2} ${cy2}, ${c.x} ${c.y}`
  }, '')

  // Path da área sombreada abaixo da linha
  const areaPath = `${linePath} L ${coords[coords.length - 1].x} ${svgHeight - 10} L ${coords[0].x} ${svgHeight - 10} Z`

  return (
    <div className="quiz-interstitial" style={{ maxWidth: 460, margin: '0 auto', paddingBottom: 110, textAlign: 'center' }}>
      <div style={{
        display: 'inline-flex', alignItems: 'center', gap: 6,
        padding: '4px 12px', borderRadius: 999,
        background: 'rgba(163,230,53,0.12)', border: '1px solid rgba(163,230,53,0.3)',
        color: 'var(--neon)', fontSize: 11, fontWeight: 800, textTransform: 'uppercase', letterSpacing: 0.5,
        marginBottom: 10
      }}>
        ⚡ PROJEÇÃO CIENTÍFICA
      </div>

      <h2 className="quiz-interstitial-title" style={{ fontSize: 22, fontWeight: 900, marginBottom: 8, lineHeight: 1.2 }}>
        Sua Projeção: <span className="highlight">Menos {diff.toFixed(0)}kg em 60 Dias</span>
      </h2>
      <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 18, lineHeight: 1.4 }}>
        Seguindo o protocolo diário em casa ou na academia, você atingirá <strong style={{ color: 'var(--neon)' }}>{target} kg</strong> até <strong style={{ color: 'var(--neon)' }}>{dateStr}</strong>
      </p>
      
      {/* Card do Gráfico Futurista com Linhas */}
      <div style={{
        background: 'linear-gradient(180deg, #131418 0%, #0d0e11 100%)',
        borderRadius: 20,
        padding: '16px 14px 12px',
        border: '1px solid rgba(255,255,255,0.08)',
        boxShadow: '0 12px 32px rgba(0,0,0,0.6)',
        marginBottom: 16
      }}>
        {/* Header do Gráfico */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10, padding: '0 4px' }}>
          <div style={{ textAlign: 'left' }}>
            <span style={{ fontSize: 10, color: '#71717A', fontWeight: 700, textTransform: 'uppercase' }}>Início</span>
            <div style={{ fontSize: 14, fontWeight: 900, color: '#fff' }}>{current} kg</div>
          </div>
          
          <div style={{
            background: 'rgba(163,230,53,0.15)',
            border: '1px solid var(--neon)',
            padding: '4px 10px',
            borderRadius: 10,
            textAlign: 'right'
          }}>
            <span style={{ fontSize: 9, color: 'var(--neon)', fontWeight: 800, textTransform: 'uppercase' }}>Meta 60 Dias</span>
            <div style={{ fontSize: 14, fontWeight: 900, color: 'var(--neon)' }}>{target} kg (-{diff.toFixed(0)}kg)</div>
          </div>
        </div>

        {/* Gráfico SVG de Linha e Área */}
        <div style={{ width: '100%', position: 'relative' }}>
          <svg viewBox="0 0 340 140" style={{ width: '100%', height: 'auto', overflow: 'visible' }}>
            <defs>
              <linearGradient id="projLineGradient" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#38BDF8" />
                <stop offset="50%" stopColor="#A3E635" />
                <stop offset="100%" stopColor="#BEF264" />
              </linearGradient>
              <linearGradient id="projAreaGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="rgba(163,230,53,0.35)" />
                <stop offset="70%" stopColor="rgba(163,230,53,0.05)" />
                <stop offset="100%" stopColor="rgba(163,230,53,0)" />
              </linearGradient>
              <filter id="neonLineGlow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="3" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            {/* Linhas de Grade de Fundo Sutis */}
            <line x1="20" y1="30" x2="320" y2="30" stroke="rgba(255,255,255,0.05)" strokeDasharray="3 3" />
            <line x1="20" y1="70" x2="320" y2="70" stroke="rgba(255,255,255,0.05)" strokeDasharray="3 3" />
            <line x1="20" y1="110" x2="320" y2="110" stroke="rgba(255,255,255,0.05)" strokeDasharray="3 3" />

            {/* Área Sombreada */}
            <path d={areaPath} fill="url(#projAreaGradient)" />

            {/* Linha Curva do Gráfico */}
            <path
              d={linePath}
              fill="none"
              stroke="url(#projLineGradient)"
              strokeWidth="3.5"
              strokeLinecap="round"
              filter="url(#neonLineGlow)"
            />

            {/* Pontos & Valores */}
            {coords.map((c, i) => {
              const isLast = i === coords.length - 1
              return (
                <g key={i}>
                  {/* Linha vertical pontilhada */}
                  <line x1={c.x} y1={c.y} x2={c.x} y2={svgHeight - 15} stroke="rgba(255,255,255,0.06)" strokeDasharray="2 2" />

                  {/* Valor do Peso em cima do ponto */}
                  <text
                    x={c.x}
                    y={c.y - 9}
                    textAnchor="middle"
                    fill={isLast ? 'var(--neon)' : '#D4D4D8'}
                    fontSize="10"
                    fontWeight={isLast ? '900' : '700'}
                  >
                    {c.weight}kg
                  </text>

                  {/* Círculo do Ponto */}
                  {isLast ? (
                    <g>
                      <circle cx={c.x} cy={c.y} r="8" fill="rgba(163,230,53,0.3)" />
                      <circle cx={c.x} cy={c.y} r="5" fill="var(--neon)" stroke="#000" strokeWidth="2" />
                    </g>
                  ) : (
                    <circle cx={c.x} cy={c.y} r="4" fill="#38BDF8" stroke="#121214" strokeWidth="1.5" />
                  )}

                  {/* Label da Semana */}
                  <text
                    x={c.x}
                    y={svgHeight - 2}
                    textAnchor="middle"
                    fill={isLast ? 'var(--neon)' : '#71717A'}
                    fontSize="9"
                    fontWeight="700"
                  >
                    {c.week}
                  </text>
                </g>
              )
            })}
          </svg>
        </div>
      </div>

      <StickyBottomAction onClick={onContinue} text="CONTINUAR" />
    </div>
  )
}

// ── LOADING PLAN SCREEN ──
function LoadingPlanScreen({ onComplete }) {
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => setProgress(p => Math.min(p + 3, 100)), 90)
    const done = setTimeout(onComplete, 3800)
    return () => { clearInterval(interval); clearTimeout(done) }
  }, [onComplete])

  return (
    <div className="quiz-loading">
      <div className="quiz-loading-circle">
        <svg viewBox="0 0 120 120">
          <circle className="track" cx="60" cy="60" r="54" />
          <circle className="fill" cx="60" cy="60" r="54" style={{ strokeDashoffset: 339.292 - (339.292 * progress / 100) }} />
        </svg>
        <div className="quiz-loading-percent">{progress}%</div>
      </div>
      <h3 style={{ fontFamily: 'var(--font-primary)', fontSize: 20, fontWeight: 800, marginBottom: 12 }}>
        {progress < 100 ? 'Montando seu Protocolo de 60 Dias...' : 'Tudo Pronto! 🎉'}
      </h3>
      <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>Treinos em casa & academia, cardápios e rádio 24h</p>
    </div>
  )
}

// ── PLAN READY SCREEN ──
function PlanReadyScreen({ answers, onContinue }) {
  const name = answers.name || 'Campeão(a)'
  const goalLabels = { emagrecer: 'Queima de até 15kg de Gordura', massa: 'Ganho de Massa Muscular', definir: 'Definição & Tonificação', saude: 'Saúde & Disposição' }

  return (
    <div className="quiz-interstitial" style={{ paddingBottom: 10 }}>
      <img src="/logo.png" alt="NEXA FIT PRO" style={{ height: 48, marginBottom: 12, objectFit: 'contain' }} />
      <h2 className="quiz-interstitial-title" style={{ fontSize: 22 }}>
        <span className="highlight">{name}</span>, seu Protocolo Individual foi Gerado!
      </h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, width: '100%', marginTop: 14 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, background: 'var(--bg-card)', borderRadius: 'var(--radius-lg)', padding: 12, border: '1px solid var(--border)' }}>
          <span style={{ fontSize: 22 }}>🎯</span>
          <div><div style={{ fontSize: 10, color: 'var(--text-muted)' }}>OBJETIVO</div><div style={{ fontWeight: 700, fontSize: 14 }}>{goalLabels[answers.goal] || 'Transformação total'}</div></div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, background: 'var(--bg-card)', borderRadius: 'var(--radius-lg)', padding: 12, border: '1px solid var(--border)' }}>
          <span style={{ fontSize: 22 }}>🏠</span>
          <div><div style={{ fontSize: 10, color: 'var(--text-muted)' }}>MODALIDADE</div><div style={{ fontWeight: 700, fontSize: 14, color: 'var(--neon)' }}>Treine em Casa ou Academia</div></div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, background: 'var(--bg-card)', borderRadius: 'var(--radius-lg)', padding: 12, border: '1px solid var(--border)' }}>
          <span style={{ fontSize: 22 }}>⚡</span>
          <div><div style={{ fontSize: 10, color: 'var(--text-muted)' }}>ACESSO</div><div style={{ fontWeight: 700, fontSize: 14, color: 'var(--neon)' }}>Planos de 1 Mês, 6 Meses ou 1 Ano</div></div>
        </div>
      </div>
      
      {/* Botão posicionado naturalmente abaixo do card e fixando no rodapé com sticky quando necessário */}
      <div style={{
        position: 'sticky',
        bottom: 16,
        zIndex: 50,
        width: '100%',
        maxWidth: 440,
        margin: '20px auto 0'
      }}>
        <button
          type="button"
          onClick={() => {
            playQuizBeep(750, 0.08)
            onContinue()
          }}
          className="quiz-cta"
          style={{
            width: '100%',
            height: 52,
            fontSize: 14,
            fontWeight: 900,
            textTransform: 'uppercase',
            letterSpacing: 0.5,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
            boxShadow: '0 6px 25px rgba(163,230,53,0.45)'
          }}
        >
          <span>DESBLOQUEAR MEU ACESSO AGORA</span>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#000" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <line x1="5" y1="12" x2="19" y2="12" />
            <polyline points="12 5 19 12 12 19" />
          </svg>
        </button>
      </div>
    </div>
  )
}

// ── PRÉVIA INTERATIVA DE RÁDIO FITNESS (DEGUSTAÇÃO COM LIMITE DE 60s) ──
function RadioQuizPreview({ onUnlockClick }) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [selectedStation, setSelectedStation] = useState(0)
  const [secondsRemaining, setSecondsRemaining] = useState(60)
  const [isExpired, setIsExpired] = useState(false)
  const audioRef = useRef(null)

  const STATIONS = [
    { name: 'EDM & Eletrônica', genre: '130 BPM • Energia Máxima', url: 'https://stream.laut.fm/dance', icon: '⚡', color: '#06B6D4' },
    { name: 'Hip Hop & Phonk', genre: '140 BPM • Peso & Força', url: 'https://stream.laut.fm/hiphop', icon: '🔥', color: '#EF4444' },
    { name: 'Rock Adrenalina', genre: '150 BPM • Motivação Pura', url: 'https://stream.laut.fm/rock', icon: '🎸', color: '#E11D48' },
    { name: 'Sertanejo Hits', genre: '128 BPM • Alto Astral', url: 'https://cast.mgtradio.net/radio/8020/aac', icon: '🤠', color: '#10B981' },
    { name: 'Lo-Fi & Foco', genre: '80 BPM • Concentração', url: 'https://stream.laut.fm/lofi', icon: '🎧', color: '#8B5CF6' }
  ]

  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause()
        audioRef.current.src = ''
        audioRef.current = null
      }
    }
  }, [])

  useEffect(() => {
    let interval = null
    if (isPlaying && secondsRemaining > 0 && !isExpired) {
      interval = setInterval(() => {
        setSecondsRemaining(prev => {
          if (prev <= 1) {
            clearInterval(interval)
            setIsPlaying(false)
            setIsExpired(true)
            if (audioRef.current) {
              audioRef.current.pause()
            }
            return 0
          }
          return prev - 1
        })
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [isPlaying, secondsRemaining, isExpired])

  const handleStationSelect = (idx) => {
    if (isExpired) return
    setSelectedStation(idx)
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current.src = STATIONS[idx].url
    } else {
      audioRef.current = new Audio(STATIONS[idx].url)
    }
    audioRef.current.play().then(() => {
      setIsPlaying(true)
    }).catch(e => {
      console.warn('Audio play error:', e)
      setIsPlaying(false)
    })
  }

  const togglePlay = () => {
    if (isExpired) return

    if (isPlaying) {
      if (audioRef.current) audioRef.current.pause()
      setIsPlaying(false)
    } else {
      if (!audioRef.current) {
        audioRef.current = new Audio(STATIONS[selectedStation].url)
      }
      audioRef.current.play().then(() => {
        setIsPlaying(true)
      }).catch(e => {
        console.warn('Audio play error:', e)
        setIsPlaying(false)
      })
    }
  }

  const activeStation = STATIONS[selectedStation]
  const progressPercent = ((60 - secondsRemaining) / 60) * 100

  return (
    <div style={{ padding: '0 16px', marginBottom: 24 }}>
      <div style={{
        background: 'linear-gradient(135deg, rgba(163,230,53,0.08) 0%, #121212 100%)',
        border: '1.5px solid rgba(163,230,53,0.35)',
        borderRadius: 22,
        padding: '18px 16px',
        boxShadow: '0 10px 30px rgba(0,0,0,0.6)',
        position: 'relative',
        overflow: 'hidden'
      }}>
        
        {/* Top Header com Badge Degustação */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ fontSize: 18 }}>🎧</span>
            <div>
              <span style={{ fontSize: 10, fontWeight: 900, color: 'var(--neon)', textTransform: 'uppercase', letterSpacing: 1 }}>
                DEGUSTAÇÃO EXCLUSIVA
              </span>
              <h3 style={{ fontSize: 15, fontWeight: 900, color: '#fff', margin: 0 }}>
                Rádio Fitness 24h Ao Vivo
              </h3>
            </div>
          </div>
          
          <div style={{
            background: isExpired ? 'rgba(239,68,68,0.2)' : 'rgba(163,230,53,0.15)',
            border: isExpired ? '1px solid #EF4444' : '1px solid var(--neon)',
            borderRadius: 12,
            padding: '4px 8px',
            textAlign: 'right'
          }}>
            <span style={{ fontSize: 9, color: isExpired ? '#EF4444' : 'var(--neon)', fontWeight: 900, display: 'block' }}>
              {isExpired ? '🔒 ENCERRADA' : '⏱️ PRÉVIA'}
            </span>
            <span style={{ fontSize: 13, fontWeight: 900, color: '#fff', fontFamily: 'monospace' }}>
              {secondsRemaining}s
            </span>
          </div>
        </div>

        {/* Barra de Progresso dos 60s */}
        <div style={{ width: '100%', height: 4, background: '#222', borderRadius: 4, overflow: 'hidden', marginBottom: 14 }}>
          <div style={{
            width: `${progressPercent}%`,
            height: '100%',
            background: isExpired ? '#EF4444' : 'var(--neon)',
            transition: 'width 1s linear'
          }} />
        </div>

        {/* Seletor de Estações de Rádio */}
        <div style={{ display: 'flex', gap: 6, overflowX: 'auto', paddingBottom: 6, marginBottom: 14, scrollbarWidth: 'none' }}>
          {STATIONS.map((station, idx) => {
            const isCurrent = selectedStation === idx
            return (
              <button
                key={idx}
                onClick={() => handleStationSelect(idx)}
                style={{
                  background: isCurrent ? 'rgba(255,255,255,0.12)' : '#1a1a1a',
                  border: isCurrent ? `1.5px solid ${station.color}` : '1px solid #2a2a2a',
                  borderRadius: 12,
                  padding: '6px 10px',
                  color: isCurrent ? '#fff' : '#888',
                  fontSize: 11,
                  fontWeight: 800,
                  whiteSpace: 'nowrap',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 5,
                  cursor: isExpired ? 'not-allowed' : 'pointer',
                  opacity: isExpired && !isCurrent ? 0.4 : 1,
                  transition: 'all 0.2s'
                }}
              >
                <span>{station.icon}</span>
                <span>{station.name}</span>
              </button>
            )
          })}
        </div>

        {/* Player Box Principal */}
        <div style={{
          background: '#0d0d0d',
          borderRadius: 16,
          padding: '12px 14px',
          border: '1px solid #222',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 12
        }}>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {/* Botão Play / Pause */}
            <button
              onClick={togglePlay}
              disabled={isExpired}
              style={{
                width: 44,
                height: 44,
                borderRadius: '50%',
                background: isExpired ? '#333' : 'var(--neon)',
                color: '#000',
                border: 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 18,
                fontWeight: 900,
                cursor: isExpired ? 'not-allowed' : 'pointer',
                boxShadow: isPlaying ? '0 0 15px rgba(163,230,53,0.5)' : 'none',
                transition: 'all 0.2s'
              }}
            >
              {isExpired ? '🔒' : isPlaying ? '⏸' : '▶'}
            </button>

            <div>
              <div style={{ fontSize: 13, fontWeight: 900, color: '#fff' }}>
                {activeStation.name}
              </div>
              <div style={{ fontSize: 11, color: activeStation.color, fontWeight: 700 }}>
                {activeStation.genre}
              </div>
            </div>
          </div>

          {/* Equalizer Wave / Status */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 3, height: 20 }}>
            {isPlaying ? (
              <>
                <span style={{ width: 3, height: 16, background: 'var(--neon)', borderRadius: 2 }} />
                <span style={{ width: 3, height: 22, background: 'var(--neon)', borderRadius: 2 }} />
                <span style={{ width: 3, height: 12, background: 'var(--neon)', borderRadius: 2 }} />
                <span style={{ width: 3, height: 18, background: 'var(--neon)', borderRadius: 2 }} />
              </>
            ) : (
              <span style={{ fontSize: 10, color: '#666', fontWeight: 700 }}>
                {isExpired ? 'BLOQUEADO' : 'TOQUE NO PLAY'}
              </span>
            )}
          </div>
        </div>

        {/* Mensagem Pós-60s ou Chamada para Ação */}
        {isExpired ? (
          <div style={{ marginTop: 12, textAlign: 'center' }}>
            <p style={{ fontSize: 12, color: '#F87171', fontWeight: 800, margin: '0 0 8px' }}>
              🔒 Sua degustação de 60 segundos encerrou!
            </p>
            <button
              onClick={onUnlockClick}
              style={{
                width: '100%',
                background: 'linear-gradient(90deg, var(--neon), #84cc16)',
                color: '#000',
                border: 'none',
                borderRadius: 12,
                padding: '12px 14px',
                fontSize: 13,
                fontWeight: 900,
                cursor: 'pointer',
                textTransform: 'uppercase',
                letterSpacing: 0.5,
                boxShadow: '0 4px 15px rgba(163,230,53,0.4)'
              }}
            >
              DESBLOQUEAR STREAMING ILIMITADO 24H ⚡
            </button>
          </div>
        ) : (
          <p style={{ fontSize: 11, color: '#888', textAlign: 'center', margin: '10px 0 0' }}>
            {isPlaying ? '⚡ Curta a energia! O app inclui acesso ilimitado sem anúncios.' : '👉 Toque no Play para testar o som do app antes de escolher seu plano.'}
          </p>
        )}

      </div>
    </div>
  )
}

// ── PÁGINA DE OFERTA / CHECKOUT VALIDADA DE ALTA CONVERSÃO ──
function CheckoutScreen({ answers, onPurchase }) {
  const [timer, setTimer] = useState(1591) // 26:31 countdown
  const [selectedPlan, setSelectedPlan] = useState('12m') // '1m', '12m', '3m'
  const [faqOpen, setFaqOpen] = useState(null)
  
  const isMale = answers.gender === 'male'
  const name = answers.name || 'Seu perfil individual'
  const goalWeight = answers.goalWeight || '65'

  useEffect(() => {
    const i = setInterval(() => setTimer(t => t > 0 ? t - 1 : 0), 1000)
    return () => clearInterval(i)
  }, [])

  const mins = Math.floor(timer / 60)
  const secs = timer % 60

  const plans = [
    {
      id: '1m',
      title: '1 Mês',
      tag: 'TESTE POR 30 DIAS',
      price: 'R$ 29,90',
      daily: 'R$ 0,99/dia',
      discount: '',
      isBest: false,
      checkoutUrl: 'https://lastlink.com/p/C29E63DD9/checkout-payment/',
      features: [
        'Acesso completo a todos os treinos em vídeo',
        'Protocolo de cardápios e substituições',
        'IA Nutricional e Treinador 24h',
        'Rádio Fitness 24h sem anúncios',
        'Garantia incondicional de 30 dias'
      ]
    },
    {
      id: '6m',
      title: '6 Meses — Semestral',
      tag: 'SEMESTRAL • MAIS ESCOLHIDO',
      price: 'R$ 47,90',
      daily: 'R$ 0,26/dia',
      discount: '42% de desconto',
      isBest: false,
      checkoutUrl: 'https://lastlink.com/p/CD478083B/checkout-payment/',
      features: [
        'Acesso semestral completo por 6 meses',
        'Mais de 600 treinos e cardápios flexíveis',
        'IA Nutricional e Biomecânica 24h',
        'Rádio Fitness 24h sem anúncios',
        'Acompanhamento de progresso e medidas',
        'Garantia blindada de 30 dias'
      ]
    },
    {
      id: '12m',
      title: '12 Meses — Melhor Escolha',
      tag: 'ANUAL • 🔥 MELHOR ESCOLHA',
      price: 'R$ 78,46',
      daily: 'R$ 0,21/dia',
      discount: '65% de desconto',
      isBest: true,
      checkoutUrl: 'https://lastlink.com/p/C3DFDBF21/checkout-payment/',
      features: [
        'Acesso completo por 1 ano sem mensalidade',
        'Mais de 600 treinos e cardápios flexíveis',
        'IA Nutricional e Biomecânica 24h',
        'Desafios motivadores semanais',
        'Rádio Fitness 24h sem anúncios',
        'Acompanhamento de progresso e medidas',
        'Suporte prioritário via WhatsApp',
        'Atualizações gratuitas inclusas',
        'Garantia blindada de 30 dias'
      ]
    }
  ]

  const scrollToPlans = () => {
    playQuizBeep(700, 0.08)
    const el = document.getElementById('planos-section')
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  const handleCheckout = (customPlanId) => {
    playQuizBeep(880, 0.1)
    const planKey = (typeof customPlanId === 'string' && customPlanId) ? customPlanId : selectedPlan
    const plan = plans.find(p => p.id === planKey) || plans.find(p => p.id === selectedPlan) || plans[0]
    
    // Salva rascunho temporário do quiz para montar o plano pós-compra
    try {
      localStorage.setItem('nexafit_pending_plan', plan.id)
      if (answers) {
        localStorage.setItem('nexafit_quiz_draft', JSON.stringify(answers))
      }
    } catch (e) {}

    // Redireciona imediatamente para o checkout da Lastlink correspondente
    if (plan && plan.checkoutUrl) {
      window.location.href = plan.checkoutUrl
    } else {
      onPurchase()
    }
  }

  const testimonials = [
    {
      name: 'Lorena, 42 anos',
      weight: '-15 kg',
      img: '/images/LORENA.png',
      text: 'Eu tinha 18 anos quando fui diagnosticada com alterações hormonais. Depois de anos de medicação, comecei a ganhar peso e me sentia letárgica. Cheguei a ter que parar de me exercitar porque não tinha energia. Quando comecei o protocolo individualizado do Nexa Fit, minha energia explodiu e eliminei 15kg comendo bem e sem passar fome!'
    },
    {
      name: 'Sandra, 27 anos',
      weight: '-28 kg',
      img: '/images/sandra.png',
      text: 'Ao olhar para as minhas fotos antigas, eu me sentia inchada e sem disposição. Prometi a mim mesma que me faria feliz sendo disciplinada e consistente. O Nexa Fit Pro simplificou tudo: treinos rápidos na sala e cardápio direto ao ponto. Já foram 28kg a menos!'
    },
    {
      name: 'Marcelo, 57 anos',
      weight: '-27 kg',
      img: '/images/Marcelo.png',
      text: 'Depois de um susto de saúde no ano passado, decidi que queria uma transformação de verdade. Seguir um plano feito sob medida para a minha rotina fez toda a diferença. O corpo respondeu muito rápido e hoje tenho mais saúde e disposição do que aos 30 anos!'
    }
  ]

  const faqs = [
    {
      q: 'De que consistirão minhas refeições?',
      a: 'Seu plano nutricional é 100% individualizado para suas preferências e objetivos (low carb, cetogênica, flexível ou hipertrofia). Você recebe café da manhã, almoço, jantar e opções de lanches rápidos sem ingredientes caros ou difíceis de achar.'
    },
    {
      q: 'O que diferencia o Nexa Fit Pro dos outros aplicativos?',
      a: 'Nós não tentamos te encaixar em uma fórmula genérica. O algoritmo ajusta as calorias, os treinos para casa ou academia com demonstração em vídeo, e você ainda tem IA 24h e Rádio Fitness contínua sem anúncios.'
    },
    {
      q: 'Em quanto tempo posso esperar ver resultados visíveis?',
      a: 'A maioria dos alunos relata redução de inchaço e ganho imediato de energia nos primeiros 7 dias. Entre 30 e 60 dias, a eliminação de até 15kg de gordura e ganho de tônus muscular se tornam evidentes no espelho e nas roupas.'
    },
    {
      q: 'Este plano alimentar e de treino é difícil de seguir?',
      a: 'Não! Foi desenhado especificamente para pessoas ocupadas. As refeições são práticas e os treinos duram de 15 a 30 minutos, podendo ser feitos em casa ou na academia.'
    },
    {
      q: 'Sentirei fome com o plano?',
      a: 'Absolutamente não. Nossos cardápios priorizam alta saciedade com proteínas nobres e gorduras boas, estabilizando a glicemia e eliminando a compulsão por doces e beliscos.'
    },
    {
      q: 'Como vou receber o meu acesso?',
      a: 'Imediatamente após a confirmação do pagamento via PIX ou Cartão, você recebe seus dados de acesso por e-mail e na tela, com login instantâneo e acesso liberado.'
    }
  ]

  return (
    <div style={{ width: '100%', color: '#fff', paddingBottom: 60, fontFamily: 'var(--font-primary)' }}>
      
      {/* ── 1. STICKY TOP URGENCY BAR COM ANCORAGEM (100% LARGURA TOTAL) ── */}
      <div
        onClick={scrollToPlans}
        style={{
          position: 'sticky', top: 0, left: 0, right: 0, zIndex: 100,
          width: '100%',
          background: '#DC2626', color: '#fff', textAlign: 'center', padding: '12px 14px',
          fontWeight: 900, fontSize: 13, textTransform: 'uppercase', letterSpacing: 0.5,
          boxShadow: '0 4px 20px rgba(220,38,38,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
          cursor: 'pointer'
        }}
        title="Toque para ver os planos com desconto"
      >
        <span>⏱️</span>
        <span>Desconto de 51% reservado para:</span>
        <span style={{ background: '#000', color: 'var(--neon)', padding: '2px 8px', borderRadius: 6, fontFamily: 'monospace', fontSize: 14 }}>
          {String(mins).padStart(2,'0')}:{String(secs).padStart(2,'0')}
        </span>
        <span style={{ fontSize: 11, marginLeft: 4, opacity: 0.9 }}>↓</span>
      </div>

      {/* Container Centralizado para o Conteúdo */}
      <div style={{ maxWidth: 500, margin: '0 auto', width: '100%' }}>

      {/* ── 2. HERO PRINCIPAL ── */}
      <div style={{ padding: '20px 16px 10px', textAlign: 'center' }}>
        <img src="/logo.png" alt="NEXA FIT PRO" style={{ height: 42, margin: '0 auto 14px', display: 'block', objectFit: 'contain' }} />
        
        <h1 style={{ fontSize: 'clamp(20px, 5.2vw, 26px)', fontWeight: 900, lineHeight: 1.25, marginBottom: 12 }}>
          Emagreça com um plano feito sob medida para você — <span style={{ color: 'var(--neon)' }}>sem comer o que odeia e sem recomeçar toda semana.</span>
        </h1>

        <p style={{ fontSize: 14, color: '#ccc', lineHeight: 1.5, marginBottom: 18 }}>
          Depois de analisar suas respostas, nossa IA criou um plano alimentar e de treinos que respeita seu corpo, seus gostos e sua rotina real.
        </p>

        <div style={{ display: 'inline-flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 18 }}>
          <span style={{ background: '#1c1c1c', border: '1px solid #333', padding: '6px 12px', borderRadius: 20, fontSize: 12, fontWeight: 700, color: '#aaa' }}>
            ❌ Nada de dieta genérica
          </span>
          <span style={{ background: '#1c1c1c', border: '1px solid #333', padding: '6px 12px', borderRadius: 20, fontSize: 12, fontWeight: 700, color: '#aaa' }}>
            ❌ Nada de cardápio imposto
          </span>
        </div>

        {/* Botão de Ancoragem Hero */}
        <button
          onClick={scrollToPlans}
          className="quiz-cta"
          style={{
            width: '100%',
            padding: '16px 20px',
            fontSize: 15,
            fontWeight: 900,
            textTransform: 'uppercase',
            letterSpacing: 0.5,
            marginBottom: 12,
            boxShadow: '0 4px 20px rgba(163,230,53,0.4)'
          }}
        >
          VER PLANOS DISPONÍVEIS ⚡ ↓
        </button>
      </div>

      {/* ── 3. BLOCO DE IDENTIFICAÇÃO (SE VOCÊ CHEGOU ATÉ AQUI...) ── */}
      <div style={{ padding: '0 16px', marginBottom: 20 }}>
        <div style={{ background: '#141414', borderRadius: 18, padding: 16, border: '1px solid rgba(255,255,255,0.08)' }}>
          <p style={{ fontSize: 13, color: '#aaa', fontWeight: 700, marginBottom: 10 }}>
            Se você chegou até aqui, provavelmente já tentou:
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 14 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: '#1c1c1c', padding: '10px 12px', borderRadius: 10, fontSize: 13, color: '#eee' }}>
              <span style={{ color: '#EF4444' }}>•</span>
              <span>Dietas restritivas e monótonas</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: '#1c1c1c', padding: '10px 12px', borderRadius: 10, fontSize: 13, color: '#eee' }}>
              <span style={{ color: '#EF4444' }}>•</span>
              <span>Cardápios prontos da internet</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: '#1c1c1c', padding: '10px 12px', borderRadius: 10, fontSize: 13, color: '#eee' }}>
              <span style={{ color: '#EF4444' }}>•</span>
              <span>Planos que funcionam por alguns dias… e depois desmoronam</span>
            </div>
          </div>
          <p style={{ fontSize: 13, color: '#bbb', lineHeight: 1.5, margin: 0 }}>
            Isso não aconteceu porque você é fraco(a).<br />
            <strong style={{ color: 'var(--neon)' }}>Aconteceu porque o método não foi feito para você.</strong>
          </p>
        </div>
      </div>

      {/* ── 4. COMPARATIVO ANTES VS DEPOIS COM FOTO REAL ── */}
      <div style={{ padding: '0 16px', marginBottom: 20 }}>
        <div style={{
          background: '#111',
          borderRadius: 20,
          padding: 16,
          border: '1.5px solid rgba(163,230,53,0.3)',
          boxShadow: '0 8px 30px rgba(0,0,0,0.7)'
        }}>
          {/* Foto de Antes e Depois do Gênero */}
          <div style={{
            borderRadius: 14,
            overflow: 'hidden',
            marginBottom: 14,
            border: '1px solid #333'
          }}>
            <img
              src={isMale ? '/images/male-transformation.jpg' : '/images/jennifer-transformation.jpg'}
              alt="Comparativo Antes e Depois"
              style={{ width: '100%', height: 'auto', display: 'block', objectFit: 'cover' }}
            />
          </div>

          {/* Tabela Comparativa de Métricas */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            
            {/* ANTES */}
            <div style={{ background: '#181818', borderRadius: 14, padding: 12, border: '1.5px solid rgba(239,68,68,0.4)' }}>
              <div style={{ fontSize: 11, fontWeight: 900, color: '#EF4444', textTransform: 'uppercase', marginBottom: 8, textAlign: 'center' }}>
                🔴 ANTES
              </div>
              <div style={{ marginBottom: 8 }}>
                <div style={{ fontSize: 10, color: '#888' }}>Gordura corporal</div>
                <div style={{ fontSize: 12, fontWeight: 700, color: '#ddd' }}>Média / Alta</div>
              </div>
              <div style={{ marginBottom: 8 }}>
                <div style={{ fontSize: 10, color: '#888' }}>Condicionamento</div>
                <div style={{ fontSize: 12, fontWeight: 700, color: '#ddd' }}>Iniciante / Cansado</div>
              </div>
              <div>
                <div style={{ fontSize: 10, color: '#888' }}>Relação com comida</div>
                <div style={{ fontSize: 12, fontWeight: 700, color: '#ddd' }}>Cansaço e culpa</div>
              </div>
            </div>

            {/* DEPOIS */}
            <div style={{ background: '#181818', borderRadius: 14, padding: 12, border: '1.5px solid var(--neon)', boxShadow: '0 0 15px rgba(163,230,53,0.15)' }}>
              <div style={{ fontSize: 11, fontWeight: 900, color: 'var(--neon)', textTransform: 'uppercase', marginBottom: 8, textAlign: 'center' }}>
                🟢 DEPOIS
              </div>
              <div style={{ marginBottom: 8 }}>
                <div style={{ fontSize: 10, color: 'var(--neon)' }}>Gordura corporal</div>
                <div style={{ fontSize: 12, fontWeight: 800, color: '#fff' }}>Baixa (-15kg)</div>
              </div>
              <div style={{ marginBottom: 8 }}>
                <div style={{ fontSize: 10, color: 'var(--neon)' }}>Condicionamento</div>
                <div style={{ fontSize: 12, fontWeight: 800, color: '#fff' }}>Evoluindo sempre</div>
              </div>
              <div>
                <div style={{ fontSize: 10, color: 'var(--neon)' }}>Relação com comida</div>
                <div style={{ fontSize: 12, fontWeight: 800, color: '#fff' }}>Controle e constância</div>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* ── 5. SEU OBJETIVO PERSONALIZADO ── */}
      <div style={{ padding: '0 16px', marginBottom: 20 }}>
        <div style={{
          background: 'linear-gradient(135deg, #111e2e 0%, #0a111a 100%)',
          borderRadius: 18,
          padding: 16,
          border: '1.5px solid #1E3A8A',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: 12, fontWeight: 900, color: '#60A5FA', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 12 }}>
            🎯 SEU OBJETIVO INDIVIDUAL
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
            <div style={{ background: 'rgba(0,0,0,0.4)', borderRadius: 10, padding: 8 }}>
              <div style={{ fontSize: 10, color: '#93C5FD' }}>Meta Principal</div>
              <div style={{ fontSize: 12, fontWeight: 800, color: '#fff', marginTop: 2 }}>Secar gordura</div>
            </div>
            <div style={{ background: 'rgba(0,0,0,0.4)', borderRadius: 10, padding: 8 }}>
              <div style={{ fontSize: 10, color: '#93C5FD' }}>Peso Desejado</div>
              <div style={{ fontSize: 14, fontWeight: 900, color: 'var(--neon)', marginTop: 2 }}>{goalWeight} kg</div>
            </div>
            <div style={{ background: 'rgba(0,0,0,0.4)', borderRadius: 10, padding: 8 }}>
              <div style={{ fontSize: 10, color: '#93C5FD' }}>Plano para</div>
              <div style={{ fontSize: 12, fontWeight: 800, color: '#fff', marginTop: 2 }}>{name}</div>
            </div>
          </div>
        </div>
      </div>

      {/* ── 6. ALERTA IMPORTANTE ── */}
      <div style={{ padding: '0 16px', marginBottom: 24 }}>
        <div style={{
          background: '#2A1F05',
          borderRadius: 14,
          padding: '12px 14px',
          border: '1.5px solid #F59E0B',
          display: 'flex',
          gap: 10,
          alignItems: 'center'
        }}>
          <span style={{ fontSize: 24 }}>⚠️</span>
          <p style={{ fontSize: 12, color: '#FEF3C7', margin: 0, lineHeight: 1.4 }}>
            <strong>Importante:</strong> Se você fechar esta página, perde a condição especial liberada exclusivamente após a sua avaliação.
          </p>
        </div>
      </div>

      {/* ── 7. O GRANDE ERRO DAS DIETAS TRADICIONAIS ── */}
      <div style={{ padding: '0 16px', marginBottom: 24 }}>
        <div style={{ background: '#141414', borderRadius: 20, padding: 18, border: '1px solid rgba(255,255,255,0.06)' }}>
          <h2 style={{ fontSize: 17, fontWeight: 900, color: 'var(--neon)', textTransform: 'uppercase', marginBottom: 8 }}>
            O Grande Erro das Dietas Tradicionais
          </h2>
          <p style={{ fontSize: 14, color: '#fff', fontWeight: 700, marginBottom: 12 }}>
            O erro não é comer pouco. O erro é seguir um plano genérico.
          </p>
          <div style={{ fontSize: 13, color: '#ccc', lineHeight: 1.6, marginBottom: 12 }}>
            Dietas comuns falham porque:
            <ul style={{ margin: '8px 0', paddingLeft: 20 }}>
              <li>Ignoram o que você gosta ou odeia comer</li>
              <li>Não se adaptam à sua rotina real</li>
              <li>Exigem força de vontade infinita</li>
            </ul>
          </div>
          <div style={{ background: '#1e1e1e', borderRadius: 10, padding: 10, fontSize: 13, color: '#fff' }}>
            👉 <strong>Resultado?</strong> Você até começa… mas não sustenta.
          </div>
        </div>
      </div>

      {/* ── 8. O MECANISMO NEXA FIT PRO ── */}
      <div style={{ padding: '0 16px', marginBottom: 28 }}>
        <div style={{ background: 'linear-gradient(135deg, #161616 0%, #0d0d0d 100%)', borderRadius: 20, padding: 18, border: '1.5px solid rgba(163,230,53,0.3)' }}>
          <h2 style={{ fontSize: 17, fontWeight: 900, color: '#fff', textTransform: 'uppercase', marginBottom: 4 }}>
            O Mecanismo de Alta Performance
          </h2>
          <p style={{ fontSize: 12, color: 'var(--neon)', fontWeight: 800, marginBottom: 12 }}>
            O que faz isso funcionar quando o resto falhou
          </p>
          <p style={{ fontSize: 13, color: '#ccc', lineHeight: 1.5, marginBottom: 12 }}>
            O <strong>NEXA FIT PRO</strong> não tenta te encaixar em um método. Ele <strong>adapta o método a você</strong>.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: 13, color: '#eee', marginBottom: 14 }}>
            <div>✓ Quando o plano respeita seus gostos</div>
            <div>✓ Elimina alimentos que você não gosta</div>
            <div>✓ Simplifica decisões no dia a dia</div>
          </div>
          <div style={{ borderTop: '1px solid #333', paddingTop: 10, fontSize: 14, fontWeight: 800, color: 'var(--neon)' }}>
            👉 O corpo responde naturalmente. Não é sobre restrição. É sobre alinhamento.
          </div>
        </div>
      </div>

      {/* ── 8.5 PRÉVIA INTERATIVA DA RÁDIO FITNESS (DEGUSTAÇÃO 60s) ── */}
      <RadioQuizPreview onUnlockClick={scrollToPlans} />

      {/* ── 9. SELEÇÃO DE PLANOS & TABELA DE PREÇOS (ÂNCORA) ── */}
      <div id="planos-section" style={{ padding: '0 16px', marginBottom: 28, scrollMarginTop: 60 }}>
        <div style={{ textAlign: 'center', marginBottom: 16 }}>
          <span style={{ fontSize: 11, color: 'var(--neon)', fontWeight: 900, textTransform: 'uppercase', letterSpacing: 1 }}>
            SEM MENSALIDADE
          </span>
          <h2 style={{ fontSize: 20, fontWeight: 900, color: '#fff', marginTop: 2 }}>
            Escolha o tempo de acesso ao Aplicativo Completo
          </h2>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {plans.map(plan => {
            const isSelected = selectedPlan === plan.id
            return (
              <div
                key={plan.id}
                onClick={() => {
                  playQuizBeep(650, 0.06)
                  setSelectedPlan(plan.id)
                }}
                style={{
                  background: isSelected ? 'rgba(163,230,53,0.08)' : '#141414',
                  border: isSelected ? '2px solid var(--neon)' : '1.5px solid rgba(255,255,255,0.08)',
                  borderRadius: 20,
                  padding: 16,
                  cursor: 'pointer',
                  position: 'relative',
                  boxShadow: isSelected ? '0 0 25px rgba(163,230,53,0.25)' : 'none',
                  transition: 'all 0.2s ease'
                }}
              >
                {/* Badge Topo */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                  <span style={{
                    fontSize: 10, fontWeight: 900,
                    background: plan.isBest ? 'var(--neon)' : '#222',
                    color: plan.isBest ? '#000' : 'var(--neon)',
                    padding: '3px 8px', borderRadius: 6, textTransform: 'uppercase'
                  }}>
                    {plan.tag}
                  </span>
                  {plan.discount && (
                    <span style={{ fontSize: 11, color: '#EF4444', fontWeight: 900, background: 'rgba(239,68,68,0.15)', padding: '2px 8px', borderRadius: 6 }}>
                      {plan.discount}
                    </span>
                  )}
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 12 }}>
                  <div>
                    <h3 style={{ fontSize: 16, fontWeight: 900, color: '#fff' }}>{plan.title}</h3>
                    <div style={{ fontSize: 12, color: '#888' }}>{plan.daily}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: 24, fontWeight: 900, color: isSelected ? 'var(--neon)' : '#fff' }}>
                      {plan.price}
                    </div>
                  </div>
                </div>

                {/* Lista de Recursos */}
                <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: 10, display: 'flex', flexDirection: 'column', gap: 4 }}>
                  <div style={{ fontSize: 11, fontWeight: 800, color: '#aaa', marginBottom: 4 }}>✨ Tudo que você recebe:</div>
                  {plan.features.map((feat, fIdx) => (
                    <div key={fIdx} style={{ fontSize: 12, color: '#ccc', display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span style={{ color: 'var(--neon)', fontSize: 11 }}>✓</span>
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>

                {/* Radio Selector */}
                <div style={{
                  position: 'absolute', top: 16, right: 16,
                  width: 20, height: 20, borderRadius: '50%',
                  border: isSelected ? '6px solid var(--neon)' : '2px solid #555',
                  background: isSelected ? '#000' : 'transparent',
                  transition: 'all 0.2s'
                }} />
              </div>
            )
          })}
        </div>

        {/* Botão Principal de Compra */}
        <button
          onClick={() => handleCheckout(selectedPlan)}
          className="quiz-cta"
          style={{
            width: '100%',
            marginTop: 20,
            padding: '18px 20px',
            fontSize: 16,
            fontWeight: 900,
            boxShadow: '0 6px 30px rgba(163,230,53,0.5)',
            textTransform: 'uppercase',
            letterSpacing: 0.5
          }}
        >
          GARANTIR MEU ACESSO AGORA ⚡
        </button>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 14, marginTop: 12, flexWrap: 'wrap' }}>
          <span style={{ fontSize: 11, color: '#aaa' }}>🔒 Pagamento 100% Seguro</span>
          <span style={{ fontSize: 11, color: '#aaa' }}>⚡ PIX ou Cartão</span>
          <span style={{ fontSize: 11, color: '#aaa' }}>📱 Acesso Imediato</span>
        </div>
      </div>

      {/* ── 10. O QUE VOCÊ DESBLOQUEIA AO ENTRAR ── */}
      <div style={{ padding: '0 16px', marginBottom: 28 }}>
        <div style={{ background: '#121212', borderRadius: 20, padding: 18, border: '1px solid rgba(255,255,255,0.06)' }}>
          <h2 style={{ fontSize: 16, fontWeight: 900, color: 'var(--neon)', textTransform: 'uppercase', marginBottom: 14, textAlign: 'center' }}>
            O Que Você Desbloqueia ao Entrar
          </h2>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div style={{ display: 'flex', gap: 12 }}>
              <span style={{ fontSize: 24 }}>🥗</span>
              <div>
                <div style={{ fontWeight: 800, fontSize: 14, color: '#fff' }}>Plano Alimentar Personalizado</div>
                <div style={{ fontSize: 12, color: '#aaa', marginTop: 2 }}>Café da manhã, almoço, jantar e lanches adaptados ao seu gosto e rotina, sem contagem complexa.</div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: 12 }}>
              <span style={{ fontSize: 24 }}>📱</span>
              <div>
                <div style={{ fontWeight: 800, fontSize: 14, color: '#fff' }}>Treinos em Vídeo & Lista de Exercícios</div>
                <div style={{ fontSize: 12, color: '#aaa', marginTop: 2 }}>Vídeos com biomecânica explicada em português, cronômetro de descanso e registro de séries.</div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: 12 }}>
              <span style={{ fontSize: 24 }}>🤖</span>
              <div>
                <div style={{ fontWeight: 800, fontSize: 14, color: '#fff' }}>IA Nutricional & Treinador 24h</div>
                <div style={{ fontSize: 12, color: '#aaa', marginTop: 2 }}>Assistente inteligente no app para tirar dúvidas, sugerir trocas de alimentos e evitar erros.</div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: 12 }}>
              <span style={{ fontSize: 24 }}>🎧</span>
              <div>
                <div style={{ fontWeight: 800, fontSize: 14, color: '#fff' }}>Rádio Fitness 24h Sem Anúncios</div>
                <div style={{ fontSize: 12, color: '#aaa', marginTop: 2 }}>Música contínua no app (Eletrônica, Hip Hop, Rock) para você treinar sempre no pico da motivação.</div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: 12 }}>
              <span style={{ fontSize: 24 }}>📊</span>
              <div>
                <div style={{ fontWeight: 800, fontSize: 14, color: '#fff' }}>Monitoramento de Progresso & Metas</div>
                <div style={{ fontSize: 12, color: '#aaa', marginTop: 2 }}>Acompanhe sua perda de peso, ingestão de água e evolução corporal semana a semana.</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── 11. DEPOIMENTOS REAIS COM FOTOS ── */}
      <div style={{ padding: '0 16px', marginBottom: 28 }}>
        <div style={{ textAlign: 'center', marginBottom: 14 }}>
          <h2 style={{ fontSize: 18, fontWeight: 900, color: '#fff' }}>
            Pessoas como você obtiveram ótimos resultados
          </h2>
          <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>
            Estamos orgulhosos destes resultados e ansiosos para ver os seus!
          </p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {testimonials.map((t, idx) => (
            <div
              key={idx}
              style={{
                background: '#141414',
                borderRadius: 18,
                padding: 16,
                border: '1px solid rgba(255,255,255,0.08)'
              }}
            >
              {/* Imagem do Aluno */}
              <div style={{
                borderRadius: 12,
                overflow: 'hidden',
                marginBottom: 12,
                border: '1px solid #222',
                maxHeight: 200,
                background: '#000'
              }}>
                <img
                  src={t.img}
                  alt={t.name}
                  style={{ width: '100%', height: '100%', objectFit: 'contain', display: 'block' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                <div>
                  <h3 style={{ fontSize: 15, fontWeight: 900, color: '#fff' }}>{t.name}</h3>
                  <span style={{ fontSize: 14, fontWeight: 900, color: 'var(--neon)' }}>{t.weight}</span>
                </div>
                <span style={{ fontSize: 10, background: 'rgba(34,197,94,0.15)', color: '#22C55E', padding: '3px 8px', borderRadius: 6, fontWeight: 800 }}>
                  ✓ Cliente verificado
                </span>
              </div>

              <p style={{ fontSize: 12, color: '#ccc', lineHeight: 1.5, margin: 0, fontStyle: 'italic' }}>
                "{t.text}"
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* ── 12. SEGUNDO BLOCO DE PLANOS E CTA (ÂNCORA) ── */}
      <div style={{ padding: '0 16px', marginBottom: 28 }}>
        <div style={{
          background: '#111',
          borderRadius: 20,
          padding: 16,
          border: '1.5px solid rgba(163,230,53,0.3)',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: 11, color: 'var(--neon)', fontWeight: 900, textTransform: 'uppercase', marginBottom: 6 }}>
            GARANTA SUA CONDIÇÃO EXCLUSIVA
          </div>
          <h3 style={{ fontSize: 18, fontWeight: 900, color: '#fff', marginBottom: 14 }}>
            Plano Anual Completo por apenas R$ 78,46
          </h3>
          <button
            onClick={scrollToPlans}
            className="quiz-cta"
            style={{
              width: '100%',
              padding: '16px 20px',
              fontSize: 15,
              fontWeight: 900
            }}
          >
            SELECIONAR MEU PLANO COM DESCONTO ⚡
          </button>
        </div>
      </div>

      {/* ── 13. GARANTIA TOTAL DE 30 DIAS ── */}
      <div style={{ padding: '0 16px', marginBottom: 28 }}>
        <div style={{
          background: '#161616',
          borderRadius: 20,
          padding: 20,
          border: '1.5px solid rgba(255,255,255,0.1)',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: 42, marginBottom: 8 }}>🛡️</div>
          <h2 style={{ fontSize: 18, fontWeight: 900, color: '#fff', textTransform: 'uppercase', marginBottom: 8 }}>
            GARANTIA TOTAL DE 30 DIAS
          </h2>
          <p style={{ fontSize: 13, color: '#ccc', lineHeight: 1.5, marginBottom: 12 }}>
            Teste o <strong>NEXA FIT PRO</strong> por 30 dias sem nenhum risco.<br />
            Se não fizer sentido para você ou não tiver resultados, devolvemos <strong>100% do valor pago</strong>.
          </p>
          <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 700 }}>
            Sem perguntas. Sem complicação.
          </div>
          <div style={{ marginTop: 14, paddingTop: 12, borderTop: '1px solid #282828', fontSize: 13, color: 'var(--neon)', fontWeight: 800 }}>
            Você não está comprando uma dieta.<br />
            Está escolhendo parar de recomeçar.
          </div>
        </div>
      </div>

      {/* ── 14. PERGUNTAS FREQUENTES (FAQ ACCORDION) ── */}
      <div style={{ padding: '0 16px', marginBottom: 28 }}>
        <h2 style={{ fontSize: 18, fontWeight: 900, color: '#fff', textAlign: 'center', marginBottom: 14 }}>
          Perguntas Frequentes
        </h2>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {faqs.map((faq, i) => {
            const isOpen = faqOpen === i
            return (
              <div
                key={i}
                style={{
                  background: '#141414',
                  borderRadius: 12,
                  border: '1px solid rgba(255,255,255,0.06)',
                  overflow: 'hidden'
                }}
              >
                <button
                  onClick={() => setFaqOpen(isOpen ? null : i)}
                  style={{
                    width: '100%',
                    padding: '14px 16px',
                    background: 'transparent',
                    border: 'none',
                    color: '#fff',
                    textAlign: 'left',
                    fontWeight: 800,
                    fontSize: 13,
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    cursor: 'pointer'
                  }}
                >
                  <span>{faq.q}</span>
                  <span style={{ color: 'var(--neon)', fontSize: 16, transition: 'transform 0.2s', transform: isOpen ? 'rotate(45deg)' : 'none' }}>
                    +
                  </span>
                </button>
                {isOpen && (
                  <div style={{ padding: '0 16px 14px', fontSize: 12, color: '#bbb', lineHeight: 1.5, borderTop: '1px solid #222' }}>
                    {faq.a}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* ── 15. BOTÃO FINAL DE FECHAMENTO (EXTRA NO FINAL DA PÁGINA) ── */}
      <div style={{ padding: '0 16px', marginBottom: 28 }}>
        <div style={{
          background: 'linear-gradient(135deg, rgba(163,230,53,0.12) 0%, rgba(15,15,15,0.95) 100%)',
          borderRadius: 22,
          padding: 20,
          border: '2px solid var(--neon)',
          boxShadow: '0 0 35px rgba(163,230,53,0.25)',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: 12, color: 'var(--neon)', fontWeight: 900, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 6 }}>
            🔥 ÚLTIMA CHANCE • OFERTA LIMITADA
          </div>
          <h2 style={{ fontSize: 20, fontWeight: 900, color: '#fff', marginBottom: 6, lineHeight: 1.25 }}>
            Comece Hoje Sua Transformação de 60 Dias
          </h2>
          <p style={{ fontSize: 12, color: '#ccc', marginBottom: 16 }}>
            Acesso imediato ao protocolo alimentar, treinos guiados em vídeo, IA 24h e Rádio Fitness.
          </p>

          <button
            onClick={scrollToPlans}
            className="quiz-cta"
            style={{
              width: '100%',
              padding: '18px 20px',
              fontSize: 16,
              fontWeight: 900,
              boxShadow: '0 6px 30px rgba(163,230,53,0.6)',
              textTransform: 'uppercase',
              letterSpacing: 0.5
            }}
          >
            QUERO MEU PLANO PERSONALIZADO AGORA ⚡
          </button>

          <div style={{ display: 'flex', justifyContent: 'center', gap: 14, marginTop: 12, fontSize: 11, color: '#888' }}>
            <span>🔒 Compra 100% Segura</span>
            <span>⚡ PIX ou Cartão</span>
            <span>🛡️ Garantia de 30 Dias</span>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div style={{ padding: '20px', textAlign: 'center', borderTop: '1px solid var(--border)' }}>
        <img src="/logo.png" alt="NEXA FIT PRO" style={{ height: 28, opacity: 0.5, marginBottom: 12, objectFit: 'contain' }} />
        <p style={{ fontSize: 11, color: 'var(--text-muted)', lineHeight: 1.6 }}>
          NEXA FIT PRO • Todos os direitos reservados<br />
          Termos de Uso • Política de Privacidade • Garantia Incondicional de 30 Dias
        </p>
      </div>

      </div> {/* Fim do container interno maxWidth: 500 */}

    </div>
  )
}
