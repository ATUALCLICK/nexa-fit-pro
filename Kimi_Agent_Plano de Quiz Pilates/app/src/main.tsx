import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { HashRouter as BrowserRouter } from 'react-router'
import './index.css'
import App from './App.tsx'
import { FunnelProvider } from './funnel/loader'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <FunnelProvider>
        <App />
      </FunnelProvider>
    </BrowserRouter>
  </StrictMode>,
)
