import { useEffect, useRef } from 'react'
import { useNavigate, useParams, Navigate } from 'react-router'
import { AnimatePresence, motion } from 'framer-motion'
import { useFunnel } from '../funnel/loader'
import { useQuiz } from './engine/store'
import { track } from './engine/analytics'
import type { AnswerValue, Screen } from './engine/types'
import Chrome from './components/Chrome'
import SelectCards from './templates/SelectCards'
import QuestionSingle from './templates/QuestionSingle'
import QuestionMulti from './templates/QuestionMulti'
import Interstitial from './templates/Interstitial'
import InputMeasure from './templates/InputMeasure'
import Loading from './templates/Loading'
import Result from './templates/Result'
import Scratch from './templates/Scratch'

export default function QuizPage() {
  const { stepId } = useParams()
  const navigate = useNavigate()
  const runtime = useFunnel()
  const { answers, orderId, setAnswer } = useQuiz()

  /* View: a tela final — pipeline inteiro atrás da seam do runtime */
  const view = stepId ? runtime.view(stepId, answers) : undefined
  const screen: Screen | undefined = view?.screen

  useEffect(() => {
    if (screen) {
      track('screen_viewed', {
        screen_id: screen.id,
        template: screen.template,
        section: screen.section,
        order_id: orderId,
      })
      window.scrollTo(0, 0)
    }
  }, [screen, orderId])

  if (!screen) return <Navigate to={`/quiz/${runtime.firstId}`} replace />

  /* direção da navegação: 1 = avanço, -1 = volta (dirige a transição) */
  const dirRef = useRef(1)

  const goNext = () => {
    dirRef.current = 1
    navigate(`/quiz/${runtime.resolveNext(screen, answers)}`)
  }
  const goBack = () => {
    dirRef.current = -1
    const prev = runtime.resolvePrev(screen.id, answers)
    if (prev) navigate(`/quiz/${prev}`)
  }

  const answer = (value: AnswerValue) => {
    if (screen.saveAs) {
      setAnswer(screen.saveAs, value)
      track('answer_submitted', {
        screen_id: screen.id,
        question_key: screen.saveAs,
        value,
        order_id: orderId,
      })
    }
    goNext()
  }

  const minimal = screen.template === 'loading'
  const showChrome = screen.template !== 'scratch'

  return (
    <div className="flex min-h-screen flex-col bg-[#FAF7F2]">
      {showChrome && (
        <Chrome
          section={screen.section}
          progress={runtime.progressOf(screen.id)}
          onBack={screen.id === runtime.firstId ? undefined : goBack}
          minimal={minimal}
        />
      )}

      <main className="flex flex-1 flex-col overflow-x-hidden pb-8 pt-6 md:pt-10">
        <AnimatePresence mode="wait" custom={dirRef.current}>
          <motion.div
            key={screen.id}
            custom={dirRef.current}
            variants={{
              enter: (dir: number) => ({ opacity: 0, x: 72 * dir, scale: 0.97 }),
              center: { opacity: 1, x: 0, scale: 1 },
              exit: (dir: number) => ({ opacity: 0, x: -56 * dir, scale: 0.98 }),
            }}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.3, ease: [0.32, 0.72, 0, 1] }}
          >
            {screen.template === 'select-cards' && <SelectCards screen={screen} onAnswer={answer} />}
            {screen.template === 'question-single' && <QuestionSingle screen={screen} answers={answers} onAnswer={answer} />}
            {screen.template === 'question-multi' && <QuestionMulti screen={screen} answers={answers} onAnswer={answer} />}
            {screen.template === 'interstitial' && <Interstitial screen={screen} answers={answers} onContinue={goNext} />}
            {screen.template === 'input-measure' && <InputMeasure screen={screen} answers={answers} onAnswer={answer} />}
            {screen.template === 'loading' && <Loading screen={screen} onDone={goNext} />}
            {screen.template === 'result' && view && <Result view={view} answers={answers} onContinue={goNext} />}
            {screen.template === 'scratch' && <Scratch screen={screen} onDone={() => navigate('/checkout')} />}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  )
}
