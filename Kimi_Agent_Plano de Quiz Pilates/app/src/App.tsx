import { Routes, Route, Navigate } from 'react-router'
import QuizPage from './quiz/QuizPage'
import CheckoutPage from './checkout/CheckoutPage'
import { useFunnel } from './funnel/loader'

function Entry() {
  const runtime = useFunnel()
  return <Navigate to={`/quiz/${runtime.firstId}`} replace />
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Entry />} />
      <Route path="/quiz/:stepId" element={<QuizPage />} />
      <Route path="/checkout" element={<CheckoutPage />} />
      <Route path="*" element={<Entry />} />
    </Routes>
  )
}
