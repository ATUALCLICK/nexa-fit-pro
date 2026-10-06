import { NavLink, Outlet, useLocation } from 'react-router-dom'
import { useState, useRef, useEffect } from 'react'

/* ========================================================
   NEXA FIT PRO — Layout Principal
   Nav: Dieta | Treinos | [ INÍCIO (Centro) ] | Música | Perfil
   ======================================================== */

export const STATIONS = [
  { 
    id: 1, 
    name: 'Psytrance / Full-On', 
    genre: 'Eletrônica', 
    bpm: '142-148 BPM',
    badge: 'ALTA INTENSIDADE',
    url: 'https://hirschmilch.de:7001/psytrance.mp3', 
    cover: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=600&auto=format&fit=crop&q=80',
    color: '#8B5CF6'
  },
  { 
    id: 2, 
    name: 'Progressive Psytrance', 
    genre: 'Psytrance', 
    bpm: '138-142 BPM',
    badge: 'FOCO & RITMO',
    url: 'https://hirschmilch.de:7001/prog-house.mp3', 
    cover: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=600&auto=format&fit=crop&q=80',
    color: '#3B82F6'
  },
  { 
    id: 3, 
    name: 'Deep House / Underground', 
    genre: 'House', 
    bpm: '124-128 BPM',
    badge: 'ENERGIA CONSTANTE',
    url: 'https://hirschmilch.de:7001/electronic.mp3', 
    cover: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=600&auto=format&fit=crop&q=80',
    color: '#06B6D4'
  },
  { 
    id: 4, 
    name: 'Hip Hop, Trap & Phonk', 
    genre: 'Hip Hop', 
    bpm: '130-160 BPM',
    badge: 'PESO & EXPLOSÃO',
    url: 'https://stream.laut.fm/hiphop', 
    cover: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=600&auto=format&fit=crop&q=80',
    color: '#EF4444'
  },
  { 
    id: 5, 
    name: 'Pagode & Samba / Resenha', 
    genre: 'Pagode', 
    bpm: '95-115 BPM',
    badge: 'RITMO BRASILEIRO',
    url: 'https://stream.laut.fm/pagode', 
    cover: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=600&auto=format&fit=crop&q=80',
    color: '#F59E0B'
  },
  { 
    id: 6, 
    name: 'Sertanejo Universitário', 
    genre: 'Sertanejo', 
    bpm: '120-135 BPM',
    badge: 'HITS & ANIMAÇÃO',
    url: 'https://cast.mgtradio.net/radio/8020/aac', 
    cover: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=600&auto=format&fit=crop&q=80',
    color: '#10B981'
  },
  { 
    id: 7, 
    name: 'Sertanejo Modão & Raiz', 
    genre: 'Modão', 
    bpm: '90-110 BPM',
    badge: 'CLÁSSICOS & VIOLA',
    url: 'https://cast.mgtradio.net/radio/8000/aac', 
    cover: 'https://images.unsplash.com/photo-1465847899084-d164df4dedc6?w=600&auto=format&fit=crop&q=80',
    color: '#D97706'
  },
  { 
    id: 8, 
    name: 'Rock & Heavy Metal', 
    genre: 'Rock', 
    bpm: '130-170 BPM',
    badge: 'ADRENALINA PURA',
    url: 'https://stream.laut.fm/rock', 
    cover: 'https://images.unsplash.com/photo-1498038432885-c6f3f1b912ee?w=600&auto=format&fit=crop&q=80',
    color: '#E11D48'
  },
  { 
    id: 9, 
    name: 'Lo-Fi Chill & Foco', 
    genre: 'Lo-Fi', 
    bpm: '70-90 BPM',
    badge: 'CONCENTRAÇÃO',
    url: 'https://stream.laut.fm/lofi', 
    cover: 'https://images.unsplash.com/photo-1518609878373-06d740f60d8b?w=600&auto=format&fit=crop&q=80',
    color: '#6366F1'
  },
  { 
    id: 10, 
    name: 'Eletrônica / Dance & EDM', 
    genre: 'Dance / EDM', 
    bpm: '128-132 BPM',
    badge: 'ENERGIA MÁXIMA',
    url: 'https://stream.laut.fm/dance', 
    cover: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=600&auto=format&fit=crop&q=80',
    color: '#06B6D4'
  }
]

export default function Layout() {
  const [currentStation, setCurrentStation] = useState(STATIONS[0])
  const [isPlaying, setIsPlaying] = useState(false)
  const audioRef = useRef(null)
  const location = useLocation()

  useEffect(() => {
    if (isPlaying) {
      audioRef.current?.play().catch(() => setIsPlaying(false))
    } else {
      audioRef.current?.pause()
    }
  }, [isPlaying, currentStation])

  return (
    <div className="app-layout" style={{ position: 'relative', overflow: 'hidden', minHeight: '100vh', background: '#000' }}>
      {/* Background Logo */}
      <div style={{
        position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
        opacity: 0.04, zIndex: 0, pointerEvents: 'none', width: '130%', display: 'flex', justifyContent: 'center'
      }}>
        <img src="/logo.png" alt="" style={{ width: '100%', filter: 'grayscale(100%) brightness(200%)' }} />
      </div>

      <audio ref={audioRef} src={currentStation.url} preload="none" />

      {/* Page Content */}
      <main className="app-page" style={{ position: 'relative', zIndex: 1, height: isPlaying && location.pathname !== '/musica' ? 'calc(100vh - 132px)' : 'calc(100vh - 72px)', overflowY: 'auto' }}>
        <Outlet context={{ currentStation, setCurrentStation, isPlaying, setIsPlaying, stations: STATIONS }} />
      </main>

      {/* Mini Player Flutuante Global quando fora da aba Música */}
      {isPlaying && location.pathname !== '/musica' && (
        <div style={{
          position: 'fixed',
          bottom: 72,
          left: 12,
          right: 12,
          background: 'rgba(20, 20, 20, 0.95)',
          backdropFilter: 'blur(16px)',
          border: '1.5px solid var(--neon)',
          borderRadius: 16,
          padding: '8px 14px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          zIndex: 98,
          boxShadow: '0 4px 20px rgba(163,230,53,0.3)',
          animation: 'fadeInUp 0.3s ease'
        }}>
          {/* Link para abrir tela de música */}
          <NavLink to="/musica" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none', flex: 1, overflow: 'hidden' }}>
            <img
              src={currentStation.cover}
              alt=""
              style={{ width: 38, height: 38, borderRadius: 10, objectFit: 'cover', border: '1px solid var(--neon)' }}
            />
            <div style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ fontSize: 13, fontWeight: 800, color: '#fff', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
                  {currentStation.name}
                </span>
                <span style={{ fontSize: 9, background: '#EF4444', color: '#fff', padding: '1px 5px', borderRadius: 4, fontWeight: 900 }}>
                  24H AO VIVO
                </span>
              </div>
              <span style={{ fontSize: 11, color: 'var(--neon)', fontWeight: 600 }}>
                {currentStation.genre} • Toque para abrir
              </span>
            </div>
          </NavLink>

          {/* Equalizador e Botão Play/Pause */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ display: 'flex', gap: 3, height: 16, alignItems: 'center' }}>
              <div className="music-bar" style={{ animationDelay: '0.1s' }} />
              <div className="music-bar" style={{ animationDelay: '0.2s' }} />
              <div className="music-bar" style={{ animationDelay: '0.3s' }} />
            </div>

            <button
              onClick={() => setIsPlaying(!isPlaying)}
              style={{
                width: 36, height: 36, borderRadius: '50%', background: 'var(--neon)',
                color: '#000', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer', boxShadow: '0 2px 10px rgba(163,230,53,0.4)'
              }}
            >
              {isPlaying ? (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16"></rect><rect x="14" y="4" width="4" height="16"></rect></svg>
              ) : (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" style={{ marginLeft: 2 }}><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Bottom Navigation: Dieta | Treinos | [ Início ] | Música | Perfil */}
      <nav className="app-nav" style={{
        justifyContent: 'space-between',
        padding: '0 12px',
        display: 'flex',
        alignItems: 'center',
        background: 'rgba(17, 17, 17, 0.95)',
        backdropFilter: 'blur(20px)',
        borderTop: '1px solid rgba(255, 255, 255, 0.08)',
        zIndex: 99
      }}>
        
        {/* 1. Dieta */}
        <NavLink to="/dieta" className={({ isActive }) => `app-nav-item ${isActive ? 'active' : ''}`} style={{ flex: 1 }}>
          <svg className="app-nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 8h1a4 4 0 0 1 0 8h-1" />
            <path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z" />
            <line x1="6" y1="1" x2="6" y2="4" />
            <line x1="10" y1="1" x2="10" y2="4" />
            <line x1="14" y1="1" x2="14" y2="4" />
          </svg>
          <span style={{ fontSize: '10px' }}>Dieta</span>
        </NavLink>

        {/* 2. Treinos */}
        <NavLink to="/treinos" className={({ isActive }) => `app-nav-item ${isActive ? 'active' : ''}`} style={{ flex: 1 }}>
          <svg className="app-nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <span style={{ fontSize: '10px' }}>Treinos</span>
        </NavLink>

        {/* 3. Início (Botão Central com Raio Estilo Leve Profissional) */}
        <div style={{ flex: 1, display: 'flex', justifyContent: 'center' }}>
          <NavLink
            to="/"
            end
            className="nav-main-action"
            style={{
              background: 'linear-gradient(135deg, #BEF264 0%, #A3E635 100%)',
              width: 54,
              height: 54,
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#000',
              boxShadow: '0 0 24px rgba(163,230,53,0.6), 0 4px 12px rgba(0,0,0,0.8)',
              marginTop: '-22px',
              border: '3px solid #0E0E0E',
              textDecoration: 'none',
              transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)'
            }}
            title="Início / Dashboard"
          >
            {/* Raio Estilizado Leve e Profissional */}
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="#000"
              style={{ filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.3))' }}
            >
              <polygon points="13 2 4 14 12 14 11 22 20 10 12 10 13 2" />
            </svg>
          </NavLink>
        </div>

        {/* 4. Música */}
        <NavLink to="/musica" className={({ isActive }) => `app-nav-item ${isActive ? 'active' : ''}`} style={{ flex: 1 }}>
          <svg className="app-nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 18V5l12-2v13" />
            <circle cx="6" cy="18" r="3" />
            <circle cx="18" cy="16" r="3" />
          </svg>
          <span style={{ fontSize: '10px' }}>Música</span>
        </NavLink>

        {/* 5. Perfil */}
        <NavLink to="/perfil" className={({ isActive }) => `app-nav-item ${isActive ? 'active' : ''}`} style={{ flex: 1 }}>
          <svg className="app-nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
            <circle cx="12" cy="7" r="4" />
          </svg>
          <span style={{ fontSize: '10px' }}>Perfil</span>
        </NavLink>

      </nav>
    </div>
  )
}
