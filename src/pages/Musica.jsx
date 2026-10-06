import React, { useState, useEffect } from 'react'
import { useOutletContext } from 'react-router-dom'

/* ========================================================
   NEXA FIT PRO — Rádio Oficial 24 Horas Ao Vivo
   Sem anúncios • Sem interrupções • Qualidade HD
   ======================================================== */

export default function Musica() {
  const { currentStation, setCurrentStation, isPlaying, setIsPlaying, stations } = useOutletContext()
  const [activeCategory, setActiveCategory] = useState('todos')
  const [imgErrors, setImgErrors] = useState({})

  const togglePlay = () => setIsPlaying(!isPlaying)

  const handleImgError = (id) => {
    setImgErrors(prev => ({ ...prev, [id]: true }))
  }

  const categories = [
    { id: 'todos', label: 'Todas as Rádios' },
    { id: 'Eletrônica', label: '⚡ Eletrônica' },
    { id: 'Sertanejo', label: '🤠 Sertanejo' },
    { id: 'Modão', label: '🪕 Modão Raiz' },
    { id: 'Pagode', label: '🥁 Pagode & Samba' },
    { id: 'Hip Hop', label: '🔥 Hip Hop & Trap' },
    { id: 'Rock', label: '🎸 Rock' },
    { id: 'Lo-Fi', label: '🎧 Lo-Fi Relax' },
  ]

  const filteredStations = activeCategory === 'todos' 
    ? stations 
    : stations.filter(s => s.genre.toLowerCase().includes(activeCategory.toLowerCase()) || (s.badge && s.badge.toLowerCase().includes(activeCategory.toLowerCase())))

  return (
    <div style={{ padding: '20px 16px 110px', minHeight: '100vh', color: '#fff', maxWidth: 540, margin: '0 auto' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 900, fontFamily: 'var(--font-primary)', letterSpacing: -0.5, margin: 0 }}>
            Nexa Music <span style={{ color: 'var(--neon)' }}>24H</span>
          </h1>
          <p style={{ fontSize: 12, color: 'var(--text-muted)', margin: '4px 0 0' }}>
            Rádios contínuas ao vivo para treino de alta performance
          </p>
        </div>
        <div style={{
          background: 'rgba(239,68,68,0.15)',
          border: '1px solid #EF4444',
          color: '#EF4444',
          fontSize: 10,
          fontWeight: 900,
          padding: '4px 9px',
          borderRadius: 8,
          display: 'flex',
          alignItems: 'center',
          gap: 5
        }}>
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#EF4444', animation: 'pulse 1s infinite' }} />
          AO VIVO
        </div>
      </div>

      {/* ── CARD PRINCIPAL DO PLAYER AO VIVO (SEM PROGRESSO OU BOTÕES DE PULAR) ── */}
      <div style={{
        background: 'linear-gradient(180deg, #151515 0%, #0c0c0c 100%)',
        borderRadius: 24,
        padding: '22px 18px',
        marginBottom: 24,
        border: '1.5px solid rgba(255,255,255,0.08)',
        boxShadow: isPlaying ? '0 12px 40px rgba(163,230,53,0.15)' : '0 12px 30px rgba(0,0,0,0.6)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Glow de Fundo Dinâmico */}
        <div style={{
          position: 'absolute',
          top: '-20%',
          left: '50%',
          transform: 'translateX(-50%)',
          width: 260,
          height: 260,
          borderRadius: '50%',
          background: currentStation.color || 'var(--neon)',
          filter: 'blur(80px)',
          opacity: isPlaying ? 0.2 : 0.08,
          pointerEvents: 'none',
          transition: 'all 0.5s ease'
        }} />

        {/* Capa do Álbum com Badge 24H */}
        <div style={{ position: 'relative', width: 190, height: 190, marginBottom: 18 }}>
          {!imgErrors[currentStation.id] ? (
            <img 
              src={currentStation.cover} 
              alt={currentStation.name}
              onError={() => handleImgError(currentStation.id)}
              style={{
                width: '100%',
                height: '100%',
                borderRadius: 20,
                objectFit: 'cover',
                border: isPlaying ? `2px solid ${currentStation.color || 'var(--neon)'}` : '2px solid rgba(255,255,255,0.12)',
                boxShadow: isPlaying ? `0 8px 32px ${currentStation.color || 'var(--neon)'}40` : '0 8px 24px rgba(0,0,0,0.5)',
                transition: 'all 0.4s ease'
              }} 
            />
          ) : (
            <div style={{
              width: '100%',
              height: '100%',
              borderRadius: 20,
              background: `linear-gradient(135deg, ${currentStation.color || '#333'} 0%, #111 100%)`,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: 12,
              textAlign: 'center',
              border: `2px solid ${currentStation.color || 'var(--neon)'}`
            }}>
              <span style={{ fontSize: 44, marginBottom: 6 }}>📻</span>
              <span style={{ fontSize: 13, fontWeight: 900, color: '#fff' }}>{currentStation.genre}</span>
            </div>
          )}

          {/* Badge AO VIVO no canto da capa */}
          <div style={{
            position: 'absolute',
            top: 8,
            right: 8,
            background: 'rgba(0,0,0,0.85)',
            backdropFilter: 'blur(6px)',
            color: '#fff',
            fontSize: 9,
            fontWeight: 900,
            padding: '3px 8px',
            borderRadius: 6,
            border: '1px solid rgba(255,255,255,0.15)',
            display: 'flex',
            alignItems: 'center',
            gap: 4
          }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: isPlaying ? '#22C55E' : '#EF4444', animation: isPlaying ? 'pulse 1s infinite' : 'none' }} />
            {isPlaying ? 'NO AR' : 'ONLINE'}
          </div>

          {currentStation.bpm && (
            <div style={{
              position: 'absolute',
              bottom: 8,
              left: 8,
              background: 'rgba(0,0,0,0.85)',
              backdropFilter: 'blur(6px)',
              color: 'var(--neon)',
              fontSize: 9,
              fontWeight: 800,
              padding: '3px 8px',
              borderRadius: 6,
              border: '1px solid rgba(163,230,53,0.3)'
            }}>
              ⚡ {currentStation.bpm}
            </div>
          )}
        </div>

        {/* Informações da Rádio */}
        <h2 style={{ fontSize: 20, fontWeight: 900, marginBottom: 4, textAlign: 'center', color: '#fff' }}>
          {currentStation.name}
        </h2>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
          <span style={{ color: currentStation.color || 'var(--neon)', fontSize: 13, fontWeight: 800 }}>
            {currentStation.genre}
          </span>
          <span style={{ color: '#444' }}>•</span>
          <span style={{ fontSize: 11, color: '#888', background: '#1c1c1c', padding: '2px 7px', borderRadius: 4, fontWeight: 700 }}>
            {currentStation.badge || 'TRANSMISSÃO 24H'}
          </span>
        </div>

        {/* Equalizador de Ondas Sonoras ao Vivo */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 4,
          height: 28,
          marginBottom: 18,
          padding: '0 20px',
          width: '100%'
        }}>
          {[18, 24, 12, 28, 16, 22, 14, 26, 20, 10, 24, 18, 28, 15, 22, 12].map((h, i) => (
            <div
              key={i}
              style={{
                width: 3,
                height: isPlaying ? `${Math.max(6, (h * (i % 2 === 0 ? 1 : 0.8)))}px` : '4px',
                background: isPlaying ? (currentStation.color || 'var(--neon)') : '#333',
                borderRadius: 2,
                transition: 'height 0.2s ease, background 0.3s ease',
                animation: isPlaying ? `equalizerPulse 0.8s ease-in-out infinite alternate ${i * 0.05}s` : 'none'
              }}
            />
          ))}
        </div>

        {/* Status Textual de Transmissão Contínua */}
        <div style={{
          fontSize: 11,
          color: '#999',
          fontWeight: 700,
          letterSpacing: 0.5,
          textTransform: 'uppercase',
          marginBottom: 20,
          display: 'flex',
          alignItems: 'center',
          gap: 6
        }}>
          <span>🔊 ÁUDIO DIGITAL HD</span>
          <span>•</span>
          <span style={{ color: 'var(--neon)' }}>SEM ANÚNCIOS</span>
          <span>•</span>
          <span>100% ILIMITADO</span>
        </div>

        {/* Botão de Play / Pause Central */}
        <button
          onClick={togglePlay}
          style={{ 
            width: 72,
            height: 72,
            borderRadius: '50%',
            background: isPlaying ? 'var(--neon)' : '#222',
            color: isPlaying ? '#000' : '#fff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: isPlaying ? 'none' : '2px solid rgba(255,255,255,0.2)',
            boxShadow: isPlaying ? '0 0 30px rgba(163,230,53,0.5), 0 0 10px rgba(163,230,53,0.3)' : '0 4px 15px rgba(0,0,0,0.5)',
            cursor: 'pointer',
            transition: 'all 0.25s cubic-bezier(0.34, 1.56, 0.64, 1)'
          }}
          onMouseDown={(e) => e.currentTarget.style.transform = 'scale(0.92)'}
          onMouseUp={(e) => e.currentTarget.style.transform = 'scale(1)'}
        >
          {isPlaying ? (
            <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor">
              <rect x="6" y="4" width="4" height="16" rx="1.5"></rect>
              <rect x="14" y="4" width="4" height="16" rx="1.5"></rect>
            </svg>
          ) : (
            <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor" style={{ marginLeft: 4 }}>
              <polygon points="5 3 19 12 5 21 5 3"></polygon>
            </svg>
          )}
        </button>
      </div>

      {/* ── FILTRO DE CATEGORIAS ── */}
      <div style={{
        display: 'flex',
        gap: 8,
        overflowX: 'auto',
        paddingBottom: 12,
        marginBottom: 14,
        scrollbarWidth: 'none'
      }}>
        {categories.map(cat => {
          const isActive = activeCategory === cat.id
          return (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              style={{
                background: isActive ? 'var(--neon)' : '#161616',
                color: isActive ? '#000' : '#bbb',
                border: isActive ? 'none' : '1px solid rgba(255,255,255,0.08)',
                padding: '7px 14px',
                borderRadius: 20,
                fontSize: 12,
                fontWeight: 800,
                whiteSpace: 'nowrap',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                boxShadow: isActive ? '0 2px 10px rgba(163,230,53,0.3)' : 'none'
              }}
            >
              {cat.label}
            </button>
          )
        })}
      </div>

      {/* ── LISTA DE ESTAÇÕES AO VIVO ── */}
      <h3 style={{ fontSize: 15, fontWeight: 900, marginBottom: 12, color: '#fff', textTransform: 'uppercase', letterSpacing: 0.5 }}>
        Todas as Rádios ({filteredStations.length})
      </h3>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {filteredStations.map(station => {
          const isSelected = currentStation.id === station.id
          const hasError = imgErrors[station.id]

          return (
            <div 
              key={station.id} 
              onClick={() => {
                setCurrentStation(station)
                setIsPlaying(true)
              }}
              style={{ 
                display: 'flex',
                alignItems: 'center',
                padding: '12px 14px',
                borderRadius: 16, 
                background: isSelected ? 'rgba(163,230,53,0.1)' : '#131313',
                border: isSelected ? '1.5px solid var(--neon)' : '1px solid rgba(255,255,255,0.06)',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                boxShadow: isSelected ? '0 0 20px rgba(163,230,53,0.15)' : 'none'
              }}
            >
              {/* Capa Miniatura com Fallback Seguro */}
              <div style={{ width: 48, height: 48, borderRadius: 12, overflow: 'hidden', marginRight: 14, flexShrink: 0, position: 'relative' }}>
                {!hasError ? (
                  <img
                    src={station.cover}
                    alt={station.name}
                    onError={() => handleImgError(station.id)}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                ) : (
                  <div style={{
                    width: '100%',
                    height: '100%',
                    background: `linear-gradient(135deg, ${station.color || '#333'} 0%, #111 100%)`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 20
                  }}>
                    📻
                  </div>
                )}
                {isSelected && isPlaying && (
                  <div style={{
                    position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.6)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                  }}>
                    <div className="music-bar" style={{ animationDelay: '0.1s' }} />
                    <div className="music-bar" style={{ animationDelay: '0.2s' }} />
                    <div className="music-bar" style={{ animationDelay: '0.3s' }} />
                  </div>
                )}
              </div>

              {/* Informações da Rádio */}
              <div style={{ flex: 1, textAlign: 'left', overflow: 'hidden' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <h4 style={{
                    fontSize: 14,
                    fontWeight: 800,
                    color: isSelected ? 'var(--neon)' : '#fff',
                    margin: 0,
                    whiteSpace: 'nowrap',
                    textOverflow: 'ellipsis',
                    overflow: 'hidden'
                  }}>
                    {station.name}
                  </h4>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 3 }}>
                  <span style={{ fontSize: 11, color: '#888' }}>{station.genre}</span>
                  <span style={{ fontSize: 10, color: '#444' }}>•</span>
                  <span style={{ fontSize: 10, color: station.color || 'var(--neon)', fontWeight: 700 }}>
                    {station.badge}
                  </span>
                </div>
              </div>

              {/* Status Play / Indicator */}
              <div style={{ marginLeft: 10, flexShrink: 0 }}>
                {isSelected ? (
                  <div style={{
                    width: 32,
                    height: 32,
                    borderRadius: '50%',
                    background: 'var(--neon)',
                    color: '#000',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 12
                  }}>
                    {isPlaying ? '❚❚' : '▶'}
                  </div>
                ) : (
                  <div style={{
                    width: 32,
                    height: 32,
                    borderRadius: '50%',
                    background: '#1c1c1c',
                    color: '#888',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 12
                  }}>
                    ▶
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>

    </div>
  )
}

