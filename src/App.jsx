import { useState, useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import Layout from './components/Layout'
import QuizFunnel from './pages/QuizFunnel'
import DashboardNexaFit from './pages/DashboardNexaFit'
import TreinosCatalogo from './pages/TreinosCatalogo'
import Dieta from './pages/Dieta'
import Progresso from './pages/Progresso'
import Perfil from './pages/Perfil'
import Musica from './pages/Musica'
import Corrida from './pages/Corrida'
import Login from './pages/Login'
import { getCurrentAuthSession } from './lib/authAccess'

/* ========================================================
   NEXA FIT PRO — Roteamento Principal
   - Portal de Login (/login)
   - Funil do Quiz (/quiz)
   - App Completo Protegido (/)
   ======================================================== */

function AppRoutes() {
  const [hasPurchased, setHasPurchased] = useState(() => {
    const purchased = localStorage.getItem('nexafit_purchased') === 'true'
    const session = getCurrentAuthSession()
    return purchased || (session && session.subscription?.isValid)
  })

  useEffect(() => {
    const checkAuth = () => {
      const purchased = localStorage.getItem('nexafit_purchased') === 'true'
      const session = getCurrentAuthSession()
      setHasPurchased(purchased || (session && session.subscription?.isValid))
    }
    window.addEventListener('storage', checkAuth)
    return () => window.removeEventListener('storage', checkAuth)
  }, [])

  const handleQuizComplete = (answers) => {
    localStorage.setItem('nexafit_purchased', 'true')
    localStorage.setItem('nexafit_answers', JSON.stringify(answers))
    if (answers.name) localStorage.setItem('nexafit_name', answers.name)
    if (answers.email) localStorage.setItem('nexafit_email', answers.email)
    setHasPurchased(true)
  }

  return (
    <Routes>
      {/* 1. Portal de Login do Aluno (E-mail de Compra) */}
      <Route path="/login" element={<Login />} />

      {/* 2. Funil do Quiz de Alta Conversão */}
      <Route path="/quiz" element={<QuizFunnel onComplete={handleQuizComplete} />} />

      {/* 3. Aplicação Completa Protegida */}
      <Route
        path="/"
        element={
          hasPurchased ? (
            <Layout />
          ) : (
            <QuizFunnel onComplete={handleQuizComplete} />
          )
        }
      >
        <Route index element={<DashboardNexaFit />} />
        <Route path="treinos" element={<TreinosCatalogo />} />
        <Route path="corrida" element={<Corrida />} />
        <Route path="dieta" element={<Dieta />} />
        <Route path="progresso" element={<Progresso />} />
        <Route path="musica" element={<Musica />} />
        <Route path="perfil" element={<Perfil />} />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

function App() {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  )
}

export default App
