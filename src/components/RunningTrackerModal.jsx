import React, { useState, useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { completeRunForDay, getFormattedDate } from '../lib/dailyLogs'

/* ========================================================
   NEXA FIT PRO — Running & Cycling Tracker GPS (Leaflet)
   Guia em Azul • Progresso em Verde Neon • 100% Estável
   ======================================================== */

// Cidades e Locais Populares Pré-configurados no Brasil
const POPULAR_LOCATIONS = [
  { name: '📍 Minha Localização Atual (GPS Real)', coords: null },
  { name: '🏙️ São Paulo - Pq. Ibirapuera & Jardins', coords: [-23.5874, -46.6576] },
  { name: '🏖️ Rio de Janeiro - Orla de Copacabana', coords: [-22.9711, -43.1822] },
  { name: '🏛️ Brasília - Eixo Monumental & Parque', coords: [-15.7938, -47.8827] },
  { name: '🌊 Florianópolis - Av. Beira-Mar Norte', coords: [-27.5855, -48.5528] },
  { name: '🌳 Belo Horizonte - Lagoa da Pampulha', coords: [-19.8519, -43.9781] },
  { name: '🏖️ Salvador - Farol da Barra & Orla', coords: [-13.0101, -38.5326] },
  { name: '🌸 Curitiba - Jardim Botânico & Cristo Rei', coords: [-25.4429, -49.2393] }
]

const DISTANCE_PRESETS = [1, 3, 5, 10, 15, 21]

// Fórmula de Haversine para calcular distância real em metros
function calculateDistanceMeters(lat1, lon1, lat2, lon2) {
  const R = 6371e3
  const rad = Math.PI / 180
  const dLat = (lat2 - lat1) * rad
  const dLon = (lon2 - lon1) * rad
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1 * rad) * Math.cos(lat2 * rad) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

// Gera um circuito fechado suave para qualquer coordenada
function generateDefaultCircuit(centerLat, centerLon, distKm = 3) {
  const radiusKm = (distKm / (2 * Math.PI)) * 0.95
  const degLat = radiusKm / 111
  const degLon = radiusKm / (111 * Math.cos((centerLat * Math.PI) / 180))
  const points = []
  const steps = 32
  for (let i = 0; i <= steps; i++) {
    const theta = (i / steps) * 2 * Math.PI
    const lat = centerLat + degLat * Math.sin(theta) + (Math.sin(i * 3) * degLat * 0.12)
    const lon = centerLon + degLon * (1 - Math.cos(theta)) + (Math.cos(i * 2) * degLon * 0.08)
    points.push([lat, lon])
  }
  return points
}

export default function RunningTrackerModal({ isOpen, onClose, onRunSaved, initialMode = 'running' }) {
  const [activityMode, setActivityMode] = useState(initialMode) // 'running' | 'cycling'
  const [isRunning, setIsRunning] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [isSimulating, setIsSimulating] = useState(false)
  const [simulationSpeed, setSimulationSpeed] = useState(1) // 1x, 2x, 5x, 10x
  
  // Métricas
  const [seconds, setSeconds] = useState(0)
  const [distanceKm, setDistanceKm] = useState(0)
  const [paceFormatted, setPaceFormatted] = useState('--:--')
  const [caloriesBurnt, setCaloriesBurnt] = useState(0)
  const [elevationGain, setElevationGain] = useState(15)
  const [gpsStatus, setGpsStatus] = useState('Pronto para começar')

  // Configuração e Rota em Azul (Guia Alvo)
  const [targetDistanceKm, setTargetDistanceKm] = useState(3)
  const [showConfigModal, setShowConfigModal] = useState(false)
  const [selectedLocIndex, setSelectedLocIndex] = useState(1)
  const [showSavedSummary, setShowSavedSummary] = useState(false)
  const [lastSavedRunSummary, setLastSavedRunSummary] = useState(null)

  // Referências Leaflet & Mutable Refs para evitar re-renders / loops de estado
  const mapRef = useRef(null)
  const mapInstanceRef = useRef(null)
  const greenPolylineRef = useRef(null)
  const bluePolylineRef = useRef(null)
  const markerRef = useRef(null)
  
  const watchIdRef = useRef(null)
  const lastGpsCoordRef = useRef(null)
  const distanceKmRef = useRef(0)
  const secondsRef = useRef(0)
  const pathCoordinatesRef = useRef([])
  const blueRouteCoordsRef = useRef([])
  const simIndexRef = useRef(0)

  // Mantém secondsRef sincronizado
  useEffect(() => {
    secondsRef.current = seconds
  }, [seconds])

  // Inicializa o Mapa Leaflet com tema Dark e Rota Azul Guia
  useEffect(() => {
    if (!isOpen) return

    const timer = setTimeout(() => {
      if (mapRef.current && !mapInstanceRef.current) {
        const defaultCenter = POPULAR_LOCATIONS[1].coords

        const map = L.map(mapRef.current, {
          center: defaultCenter,
          zoom: 15,
          zoomControl: false,
          attributionControl: false
        })

        // Tile layer OSM com filtro Dark
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          maxZoom: 19,
          subdomains: 'abc',
          className: 'dark-map-tiles',
          attribution: '&copy; OpenStreetMap'
        }).addTo(map)

        // Circuito inicial em Azul
        let initialBlueCircuit = []
        try {
          const saved = localStorage.getItem('nexafit_saved_target_route')
          if (saved) initialBlueCircuit = JSON.parse(saved)
        } catch (e) {}

        if (!initialBlueCircuit || initialBlueCircuit.length === 0) {
          initialBlueCircuit = generateDefaultCircuit(defaultCenter[0], defaultCenter[1], targetDistanceKm)
        }
        blueRouteCoordsRef.current = initialBlueCircuit

        // 1. Linha do Percurso Alvo em AZUL (Guia para seguir)
        const bluePolyline = L.polyline(initialBlueCircuit, {
          color: '#0284C7',
          weight: 6,
          opacity: 0.85,
          lineJoin: 'round'
        }).addTo(map)

        // 2. Linha do Progresso em VERDE NEON (Cobre o azul)
        const greenPolyline = L.polyline([], {
          color: '#A3E635',
          weight: 6,
          opacity: 0.95,
          lineJoin: 'round'
        }).addTo(map)

        // Marcador do Corredor com Pulso Neon
        const runnerIcon = L.divIcon({
          className: 'custom-runner-pin',
          html: `<div style="
            width: 22px; height: 22px; border-radius: 50%;
            background: #A3E635;
            border: 3px solid #000;
            box-shadow: 0 0 16px #A3E635, 0 0 6px #fff;
          "></div>`,
          iconSize: [22, 22],
          iconAnchor: [11, 11]
        })

        const startPin = initialBlueCircuit[0] || defaultCenter
        const marker = L.marker(startPin, { icon: runnerIcon }).addTo(map)

        mapInstanceRef.current = map
        bluePolylineRef.current = bluePolyline
        greenPolylineRef.current = greenPolyline
        markerRef.current = marker

        if (initialBlueCircuit.length > 0) {
          try {
            const bounds = L.latLngBounds(initialBlueCircuit)
            map.fitBounds(bounds, { padding: [40, 40] })
          } catch (e) {}
        }

        // Tenta obter GPS real do dispositivo
        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(
            (pos) => {
              const latlng = [pos.coords.latitude, pos.coords.longitude]
              POPULAR_LOCATIONS[0].coords = latlng
              
              // Se o usuário não tinha uma rota salva, gera o circuito azul na posição dele!
              const saved = localStorage.getItem('nexafit_saved_target_route')
              if (!saved) {
                const userCircuit = generateDefaultCircuit(latlng[0], latlng[1], targetDistanceKm)
                blueRouteCoordsRef.current = userCircuit
                if (bluePolylineRef.current) bluePolylineRef.current.setLatLngs(userCircuit)
                map.setView(latlng, 16)
                marker.setLatLng(latlng)
              }
              setGpsStatus('GPS Conectado (Alta Precisão)')
            },
            () => {
              setGpsStatus('GPS Local Disponível')
            },
            { enableHighAccuracy: true, timeout: 8000 }
          )
        }
      }
    }, 150)

    return () => {
      clearTimeout(timer)
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove()
        mapInstanceRef.current = null
      }
    }
  }, [isOpen])

  // Timer de Duração
  useEffect(() => {
    let interval = null
    if (isRunning && !isPaused) {
      interval = setInterval(() => {
        setSeconds(s => s + 1)
      }, 1000)
    }
    return () => {
      if (interval) clearInterval(interval)
    }
  }, [isRunning, isPaused])

  // Rastreamento GPS Real — Sem loop de render e com filtro de teleport/ruído
  useEffect(() => {
    if (isRunning && !isPaused && !isSimulating) {
      if (navigator.geolocation) {
        setGpsStatus('Rastreando Rota em Tempo Real 🟢')
        
        watchIdRef.current = navigator.geolocation.watchPosition(
          (pos) => {
            const { latitude, longitude } = pos.coords
            const newPoint = [latitude, longitude]

            const lastPoint = lastGpsCoordRef.current
            if (lastPoint) {
              const distMeters = calculateDistanceMeters(lastPoint[0], lastPoint[1], latitude, longitude)
              
              // Filtra ruído GPS (< 2m) e filtra saltos gigantescos / teleport inicial (> 300m em 1 segundo)
              if (distMeters >= 2 && distMeters < 300) {
                distanceKmRef.current += distMeters / 1000
                const currentDist = parseFloat(distanceKmRef.current.toFixed(2))
                setDistanceKm(currentDist)

                const cals = Math.round(currentDist * (activityMode === 'cycling' ? 45 : 78))
                setCaloriesBurnt(cals)

                const currentSec = secondsRef.current
                if (currentDist > 0.05 && currentSec > 5) {
                  if (activityMode === 'cycling') {
                    const speedKmh = (currentDist / (currentSec / 3600)).toFixed(1)
                    setPaceFormatted(`${speedKmh}`)
                  } else {
                    const paceDecimal = (currentSec / 60) / currentDist
                    const paceMin = Math.floor(paceDecimal)
                    const paceSec = Math.round((paceDecimal - paceMin) * 60)
                    setPaceFormatted(`${paceMin}:${String(paceSec).padStart(2, '0')}`)
                  }
                }
                lastGpsCoordRef.current = newPoint
              }
            } else {
              // Primeiro ponto GPS capturado
              lastGpsCoordRef.current = newPoint
            }

            pathCoordinatesRef.current.push(newPoint)
            if (greenPolylineRef.current) greenPolylineRef.current.setLatLngs(pathCoordinatesRef.current)
            if (markerRef.current) markerRef.current.setLatLng(newPoint)
            if (mapInstanceRef.current) mapInstanceRef.current.panTo(newPoint)
          },
          (err) => {
            console.warn('GPS error:', err)
            setGpsStatus('Aguardando Sinal GPS...')
          },
          { enableHighAccuracy: true, maximumAge: 1000, timeout: 5000 }
        )
      }
    } else {
      if (watchIdRef.current) {
        navigator.geolocation.clearWatch(watchIdRef.current)
        watchIdRef.current = null
      }
    }

    return () => {
      if (watchIdRef.current) {
        navigator.geolocation.clearWatch(watchIdRef.current)
        watchIdRef.current = null
      }
    }
  }, [isRunning, isPaused, isSimulating, activityMode])

  // Rastreamento no Modo Simulação Turn-by-Turn em Ruas Reais
  useEffect(() => {
    let simInterval = null
    if (isRunning && !isPaused && isSimulating && blueRouteCoordsRef.current.length > 0) {
      setGpsStatus(`Simulação em Ruas Reais (${simulationSpeed}x) ⚡`)
      
      const intervalMs = Math.max(120, Math.floor(900 / simulationSpeed))
      
      simInterval = setInterval(() => {
        const points = blueRouteCoordsRef.current
        const currIdx = simIndexRef.current

        if (currIdx >= points.length - 1) {
          setGpsStatus('🏆 Percurso Concluído!')
          setIsPaused(true)
          return
        }

        const nextIdx = currIdx + 1
        simIndexRef.current = nextIdx
        const currentCoord = points[currIdx]
        const nextCoord = points[nextIdx]

        const distMeters = calculateDistanceMeters(currentCoord[0], currentCoord[1], nextCoord[0], nextCoord[1])
        
        // Filtra distâncias irreais no salto entre pontos
        if (distMeters < 500) {
          distanceKmRef.current += distMeters / 1000
          const currentDist = parseFloat(distanceKmRef.current.toFixed(2))
          setDistanceKm(currentDist)
          setCaloriesBurnt(Math.round(currentDist * (activityMode === 'cycling' ? 45 : 78)))
          setElevationGain(prev => prev + (Math.random() > 0.8 ? 1 : 0))

          if (activityMode === 'cycling') {
            const speed = (22 + (Math.sin(nextIdx) * 6)).toFixed(1)
            setPaceFormatted(`${speed}`)
          } else {
            const paceMin = 5 + Math.floor(Math.sin(nextIdx) * 0.8)
            const paceSec = 30 + Math.floor(Math.cos(nextIdx) * 20)
            setPaceFormatted(`${paceMin}:${String(Math.abs(paceSec)).padStart(2, '0')}`)
          }
        }

        pathCoordinatesRef.current.push(nextCoord)
        if (greenPolylineRef.current) greenPolylineRef.current.setLatLngs(pathCoordinatesRef.current)
        if (markerRef.current) markerRef.current.setLatLng(nextCoord)
        if (mapInstanceRef.current) mapInstanceRef.current.panTo(nextCoord)

      }, intervalMs)
    }
    return () => {
      if (simInterval) clearInterval(simInterval)
    }
  }, [isRunning, isPaused, isSimulating, simulationSpeed, activityMode])

  // Iniciar corrida Real GPS
  const handleStartRealRun = () => {
    setShowConfigModal(false)
    setShowSavedSummary(false)
    setIsSimulating(false)
    setIsRunning(true)
    setIsPaused(false)
    
    // Zera contadores
    setSeconds(0)
    setDistanceKm(0)
    setCaloriesBurnt(0)
    setPaceFormatted('--:--')
    
    distanceKmRef.current = 0
    secondsRef.current = 0
    lastGpsCoordRef.current = null
    pathCoordinatesRef.current = []

    if (greenPolylineRef.current) {
      greenPolylineRef.current.setLatLngs([])
    }
  }

  // Iniciar Simulação da rota azul
  const handleStartSimulation = () => {
    setShowConfigModal(false)
    setShowSavedSummary(false)
    setIsSimulating(true)
    setIsRunning(true)
    setIsPaused(false)

    setSeconds(0)
    setDistanceKm(0)
    setCaloriesBurnt(0)
    setPaceFormatted('--:--')
    
    distanceKmRef.current = 0
    secondsRef.current = 0
    lastGpsCoordRef.current = null
    pathCoordinatesRef.current = []
    simIndexRef.current = 0

    if (greenPolylineRef.current) {
      greenPolylineRef.current.setLatLngs([])
    }

    if (blueRouteCoordsRef.current.length > 0 && mapInstanceRef.current) {
      mapInstanceRef.current.setView(blueRouteCoordsRef.current[0], 16)
      if (markerRef.current) markerRef.current.setLatLng(blueRouteCoordsRef.current[0])
    }
  }

  // Trocar Percurso / Localização / KM
  const handleChangeRouteDistance = (newDistKm, locIdx = selectedLocIndex) => {
    setTargetDistanceKm(newDistKm)
    setSelectedLocIndex(locIdx)

    const locCoords = POPULAR_LOCATIONS[locIdx].coords || POPULAR_LOCATIONS[1].coords
    const newCircuit = generateDefaultCircuit(locCoords[0], locCoords[1], newDistKm)
    
    blueRouteCoordsRef.current = newCircuit
    localStorage.setItem('nexafit_saved_target_route', JSON.stringify(newCircuit))

    if (bluePolylineRef.current) {
      bluePolylineRef.current.setLatLngs(newCircuit)
    }
    if (mapInstanceRef.current) {
      const bounds = L.latLngBounds(newCircuit)
      mapInstanceRef.current.fitBounds(bounds, { padding: [40, 40] })
      if (markerRef.current) markerRef.current.setLatLng(newCircuit[0])
    }
  }

  // FINALIZAR & SALVAR
  const handleFinishAndSave = () => {
    setIsRunning(false)
    setIsPaused(false)
    setIsSimulating(false)

    const durationMin = Math.floor(seconds / 60)
    const durationSecRem = seconds % 60
    const durationFormatted = `${String(durationMin).padStart(2, '0')}:${String(durationSecRem).padStart(2, '0')}`

    const finalRunData = {
      type: activityMode,
      distanceKm: distanceKm > 0 ? distanceKm.toFixed(2) : targetDistanceKm.toFixed(2),
      pace: paceFormatted !== '--:--' ? paceFormatted : (activityMode === 'cycling' ? '24.5' : '5:30'),
      durationSec: seconds > 0 ? seconds : 480,
      durationFormatted: seconds > 0 ? durationFormatted : '08:00',
      calories: caloriesBurnt > 0 ? caloriesBurnt : (activityMode === 'cycling' ? 180 : 250),
      elevationM: elevationGain,
      avgHeartRate: activityMode === 'cycling' ? 142 : 155,
      polyline: pathCoordinatesRef.current.length > 0 ? pathCoordinatesRef.current : blueRouteCoordsRef.current
    }

    // Salva no log diário
    completeRunForDay(getFormattedDate(), finalRunData)

    if (onRunSaved) {
      onRunSaved(finalRunData)
    }

    setLastSavedRunSummary(finalRunData)
    setShowSavedSummary(true)
  }

  const formatTime = (totalSec) => {
    const hrs = Math.floor(totalSec / 3600)
    const mins = Math.floor((totalSec % 3600) / 60)
    const secs = totalSec % 60
    if (hrs > 0) {
      return `${String(hrs).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`
    }
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`
  }

  if (!isOpen) return null

  return createPortal(
    <div style={{
      position: 'fixed',
      inset: 0,
      zIndex: 999999,
      background: '#0a0a0a',
      display: 'flex',
      flexDirection: 'column',
      color: '#fff',
      fontFamily: 'var(--font-primary)'
    }}>
      {/* Header com Status do GPS, Seletor de Modalidade e Botão Fechar */}
      <div style={{
        padding: '12px 16px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        background: 'rgba(10,10,10,0.96)',
        borderBottom: '1px solid rgba(255,255,255,0.08)',
        zIndex: 10
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 22 }}>{activityMode === 'cycling' ? '🚴' : '🏃'}</span>
          <div>
            <h3 style={{ fontSize: 15, fontWeight: 900, margin: 0, color: '#fff' }}>
              {activityMode === 'cycling' ? 'Nexa Cycling GPS' : 'Nexa Running GPS'}
            </h3>
            <span style={{ fontSize: 10, color: activityMode === 'cycling' ? '#38BDF8' : 'var(--neon)', fontWeight: 700 }}>
              {gpsStatus}
            </span>
          </div>
        </div>

        {/* Seletor Rápido Corrida / Ciclismo */}
        {!isRunning && !showSavedSummary && (
          <div style={{ display: 'flex', background: '#1c1c1c', borderRadius: 10, padding: 3, gap: 4, border: '1px solid #333' }}>
            <button
              onClick={() => setActivityMode('running')}
              style={{
                background: activityMode === 'running' ? 'var(--neon)' : 'transparent',
                color: activityMode === 'running' ? '#000' : '#888',
                border: 'none',
                borderRadius: 8,
                padding: '4px 10px',
                fontSize: 11,
                fontWeight: 800,
                cursor: 'pointer'
              }}
            >
              🏃 Corrida
            </button>
            <button
              onClick={() => setActivityMode('cycling')}
              style={{
                background: activityMode === 'cycling' ? '#38BDF8' : 'transparent',
                color: activityMode === 'cycling' ? '#000' : '#888',
                border: 'none',
                borderRadius: 8,
                padding: '4px 10px',
                fontSize: 11,
                fontWeight: 800,
                cursor: 'pointer'
              }}
            >
              🚴 Ciclismo
            </button>
          </div>
        )}

        <button
          onClick={onClose}
          style={{
            background: '#1c1c1c',
            border: '1px solid #333',
            color: '#fff',
            width: 36,
            height: 36,
            borderRadius: '50%',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 16
          }}
        >
          ✕
        </button>
      </div>

      {/* Viewport do Mapa Leaflet Interativo */}
      <div style={{ flex: 1, position: 'relative', width: '100%' }}>
        <div ref={mapRef} style={{ width: '100%', height: '100%', background: '#0a0a0a' }} />

        {/* HUD de Métricas Flutuante no Topo do Mapa */}
        <div style={{
          position: 'absolute',
          top: 12,
          left: 14,
          right: 14,
          background: 'rgba(15,15,15,0.92)',
          backdropFilter: 'blur(16px)',
          borderRadius: 18,
          padding: '12px 16px',
          border: '1.5px solid rgba(163,230,53,0.35)',
          boxShadow: '0 10px 30px rgba(0,0,0,0.8)',
          zIndex: 500,
          display: 'grid',
          gridTemplateColumns: '1fr 1fr 1fr',
          gap: 8,
          textAlign: 'center'
        }}>
          <div>
            <div style={{ fontSize: 9, color: 'var(--text-muted)', fontWeight: 800, textTransform: 'uppercase' }}>Distância</div>
            <div style={{ fontSize: 22, fontWeight: 900, color: 'var(--neon)' }}>
              {distanceKm.toFixed(2)} <span style={{ fontSize: 11 }}>KM</span>
            </div>
          </div>

          <div>
            <div style={{ fontSize: 9, color: 'var(--text-muted)', fontWeight: 800, textTransform: 'uppercase' }}>
              {activityMode === 'cycling' ? 'Velocidade' : 'Pace'}
            </div>
            <div style={{ fontSize: 22, fontWeight: 900, color: '#fff' }}>
              {paceFormatted} <span style={{ fontSize: 10, color: '#888' }}>{activityMode === 'cycling' ? 'km/h' : '/KM'}</span>
            </div>
          </div>

          <div>
            <div style={{ fontSize: 9, color: 'var(--text-muted)', fontWeight: 800, textTransform: 'uppercase' }}>Tempo</div>
            <div style={{ fontSize: 22, fontWeight: 900, color: '#38BDF8' }}>
              {formatTime(seconds)}
            </div>
          </div>
        </div>

        {/* Legenda das Cores: Azul = Rota Guia / Verde = Progresso */}
        <div style={{
          position: 'absolute',
          top: 85,
          left: 14,
          background: 'rgba(15,15,15,0.88)',
          backdropFilter: 'blur(8px)',
          borderRadius: 10,
          padding: '4px 10px',
          border: '1px solid rgba(255,255,255,0.12)',
          zIndex: 500,
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          fontSize: 10,
          fontWeight: 800
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <div style={{ width: 10, height: 4, background: '#0284C7', borderRadius: 2 }} />
            <span style={{ color: '#38BDF8' }}>Percurso Salvo (Azul)</span>
          </div>
          <span style={{ color: '#666' }}>➔</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <div style={{ width: 10, height: 4, background: '#A3E635', borderRadius: 2 }} />
            <span style={{ color: '#A3E635' }}>Você Aqui (Verde)</span>
          </div>
        </div>

        {/* Controles de Velocidade no Modo Simulação */}
        {isSimulating && isRunning && (
          <div style={{
            position: 'absolute',
            top: 85,
            right: 14,
            background: 'rgba(15,15,15,0.9)',
            backdropFilter: 'blur(10px)',
            borderRadius: 12,
            padding: '4px 8px',
            border: '1px solid rgba(255,255,255,0.15)',
            zIndex: 500,
            display: 'flex',
            gap: 4,
            alignItems: 'center'
          }}>
            <span style={{ fontSize: 9, color: '#aaa', fontWeight: 800, marginRight: 2 }}>⚡ Speed:</span>
            {[1, 2, 5, 10].map(speed => (
              <button
                key={speed}
                onClick={() => setSimulationSpeed(speed)}
                style={{
                  background: simulationSpeed === speed ? 'var(--neon)' : '#222',
                  color: simulationSpeed === speed ? '#000' : '#fff',
                  border: 'none',
                  borderRadius: 6,
                  padding: '2px 5px',
                  fontSize: 10,
                  fontWeight: 900,
                  cursor: 'pointer'
                }}
              >
                {speed}x
              </button>
            ))}
          </div>
        )}

        {/* HUD Inferior de Calorias & Elevação */}
        <div style={{
          position: 'absolute',
          bottom: 12,
          left: 14,
          right: 14,
          background: 'rgba(15,15,15,0.88)',
          backdropFilter: 'blur(12px)',
          borderRadius: 14,
          padding: '8px 14px',
          border: '1px solid rgba(255,255,255,0.08)',
          zIndex: 500,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span>🔥</span>
            <span style={{ fontSize: 13, fontWeight: 800 }}>{caloriesBurnt} kcal</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span>📈</span>
            <span style={{ fontSize: 13, fontWeight: 800 }}>+{elevationGain} m ganho</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span>❤️</span>
            <span style={{ fontSize: 13, fontWeight: 800, color: '#EF4444' }}>
              {activityMode === 'cycling' ? '142 bpm' : '155 bpm'}
            </span>
          </div>
        </div>
      </div>

      {/* POPUP / MODAL DE TREINO SALVO COM SUCESSO */}
      {showSavedSummary && lastSavedRunSummary && (
        <div style={{
          position: 'absolute',
          inset: 0,
          background: 'rgba(0,0,0,0.85)',
          backdropFilter: 'blur(10px)',
          zIndex: 2500,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 20
        }}>
          <div style={{
            width: '100%',
            maxWidth: 420,
            background: '#121216',
            borderRadius: 24,
            border: '1.5px solid rgba(163,230,53,0.5)',
            padding: 24,
            boxShadow: '0 20px 50px rgba(0,0,0,0.9)',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: 44, marginBottom: 8 }}>🏆</div>
            <h2 style={{ fontSize: 20, fontWeight: 900, color: 'var(--neon)', margin: '0 0 4px' }}>
              Percurso & Treino Salvos!
            </h2>
            <p style={{ fontSize: 12, color: '#A1A1AA', margin: '0 0 16px', lineHeight: 1.4 }}>
              O percurso foi salvo em <strong style={{ color: '#38BDF8' }}>Azul no Mapa</strong>. Você pode seguir este trajeto e cobri-lo de <strong style={{ color: '#A3E635' }}>Verde</strong> a qualquer momento!
            </p>

            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr 1fr',
              gap: 8,
              background: '#18181f',
              padding: 12,
              borderRadius: 14,
              marginBottom: 18,
              border: '1px solid rgba(255,255,255,0.06)'
            }}>
              <div>
                <div style={{ fontSize: 10, color: '#888', fontWeight: 800 }}>DISTÂNCIA</div>
                <div style={{ fontSize: 16, fontWeight: 900, color: '#fff' }}>{lastSavedRunSummary.distanceKm} km</div>
              </div>
              <div>
                <div style={{ fontSize: 10, color: '#888', fontWeight: 800 }}>TEMPO</div>
                <div style={{ fontSize: 16, fontWeight: 900, color: '#fff' }}>{lastSavedRunSummary.durationFormatted}</div>
              </div>
              <div>
                <div style={{ fontSize: 10, color: '#888', fontWeight: 800 }}>CALORIAS</div>
                <div style={{ fontSize: 16, fontWeight: 900, color: '#EF4444' }}>{lastSavedRunSummary.calories} kcal</div>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <button
                onClick={() => {
                  setShowSavedSummary(false)
                  handleStartRealRun()
                }}
                style={{
                  width: '100%',
                  padding: '14px',
                  background: 'var(--neon)',
                  color: '#000',
                  border: 'none',
                  borderRadius: 14,
                  fontSize: 14,
                  fontWeight: 900,
                  cursor: 'pointer'
                }}
              >
                🏃 INICIAR NOVO TREINO NESTE PERCURSO
              </button>

              <button
                onClick={() => {
                  setShowSavedSummary(false)
                  if (greenPolylineRef.current) greenPolylineRef.current.setLatLngs([])
                }}
                style={{
                  width: '100%',
                  padding: '12px',
                  background: '#222',
                  color: '#38BDF8',
                  border: '1px solid #38BDF8',
                  borderRadius: 14,
                  fontSize: 13,
                  fontWeight: 800,
                  cursor: 'pointer'
                }}
              >
                🗺️ Continuar no Mapa
              </button>

              <button
                onClick={onClose}
                style={{
                  width: '100%',
                  padding: '10px',
                  background: 'transparent',
                  color: '#71717A',
                  border: 'none',
                  fontSize: 12,
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                Fechar e voltar ao início
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Escolha de KM e Local */}
      {showConfigModal && (
        <div style={{
          position: 'absolute',
          inset: 0,
          background: 'rgba(0,0,0,0.85)',
          backdropFilter: 'blur(12px)',
          zIndex: 2000,
          display: 'flex',
          alignItems: 'flex-end',
          justifyContent: 'center'
        }}>
          <div style={{
            width: '100%',
            maxWidth: 500,
            background: '#121216',
            borderTopLeftRadius: 24,
            borderTopRightRadius: 24,
            border: '1px solid rgba(255,255,255,0.15)',
            borderBottom: 'none',
            padding: '20px 20px calc(24px + env(safe-area-inset-bottom, 16px))'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
              <div>
                <h3 style={{ fontSize: 17, fontWeight: 900, margin: '0 0 2px', color: '#fff' }}>
                  🗺️ Ajustar Percurso em Azul
                </h3>
                <p style={{ fontSize: 11, color: '#888', margin: 0 }}>
                  Selecione o local e a quilometragem desejada
                </p>
              </div>
              <button
                onClick={() => setShowConfigModal(false)}
                style={{
                  background: '#222', border: '1px solid #444', color: '#fff',
                  width: 30, height: 30, borderRadius: '50%', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14
                }}
              >
                ✕
              </button>
            </div>

            {/* Local */}
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 800, color: 'var(--neon)', marginBottom: 8, textTransform: 'uppercase' }}>
                1. Local de Partida:
              </label>
              <select
                value={selectedLocIndex}
                onChange={(e) => {
                  const idx = Number(e.target.value)
                  handleChangeRouteDistance(targetDistanceKm, idx)
                }}
                style={{
                  width: '100%',
                  padding: '12px 14px',
                  background: '#1c1c22',
                  color: '#fff',
                  border: '1.5px solid rgba(255,255,255,0.15)',
                  borderRadius: 12,
                  fontSize: 13,
                  fontWeight: 700,
                  outline: 'none',
                  cursor: 'pointer'
                }}
              >
                {POPULAR_LOCATIONS.map((loc, i) => (
                  <option key={i} value={i}>
                    {loc.name}
                  </option>
                ))}
              </select>
            </div>

            {/* KM */}
            <div style={{ marginBottom: 18 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <label style={{ fontSize: 12, fontWeight: 800, color: 'var(--neon)', textTransform: 'uppercase' }}>
                  2. Distância do Percurso:
                </label>
                <span style={{ fontSize: 14, fontWeight: 900, color: '#38BDF8' }}>
                  {targetDistanceKm} KM
                </span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 6, marginBottom: 10 }}>
                {DISTANCE_PRESETS.map((km) => (
                  <button
                    key={km}
                    onClick={() => handleChangeRouteDistance(km, selectedLocIndex)}
                    style={{
                      padding: '8px 0',
                      background: targetDistanceKm === km ? 'var(--neon)' : '#1c1c22',
                      color: targetDistanceKm === km ? '#000' : '#fff',
                      border: targetDistanceKm === km ? 'none' : '1px solid #333',
                      borderRadius: 10,
                      fontSize: 12,
                      fontWeight: 900,
                      cursor: 'pointer'
                    }}
                  >
                    {km}k
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={() => setShowConfigModal(false)}
              style={{
                width: '100%',
                padding: '14px',
                background: 'var(--neon)',
                color: '#000',
                border: 'none',
                borderRadius: 14,
                fontSize: 14,
                fontWeight: 900,
                cursor: 'pointer'
              }}
            >
              ✓ Confirmar Percurso
            </button>
          </div>
        </div>
      )}

      {/* Barra de Ações & Controles Inferior */}
      <div style={{
        padding: '16px 20px calc(24px + env(safe-area-inset-bottom, 16px))',
        background: '#0d0d10',
        borderTop: '1px solid rgba(255,255,255,0.1)',
        zIndex: 1000,
        display: 'flex',
        flexDirection: 'column',
        gap: 10
      }}>
        {!isRunning ? (
          <div style={{ display: 'flex', gap: 10 }}>
            <button
              onClick={handleStartRealRun}
              style={{
                flex: 1,
                padding: '16px 18px',
                background: activityMode === 'cycling' ? 'linear-gradient(135deg, #38BDF8 0%, #0284C7 100%)' : 'var(--neon)',
                color: '#000',
                border: 'none',
                borderRadius: 16,
                fontWeight: 900,
                fontSize: 15,
                cursor: 'pointer',
                boxShadow: activityMode === 'cycling' ? '0 4px 20px rgba(56,189,248,0.4)' : '0 4px 20px rgba(163,230,53,0.4)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8
              }}
            >
              <span>▶ COMEÇAR TREINO GPS</span>
            </button>

            <button
              onClick={handleStartSimulation}
              style={{
                padding: '16px 14px',
                background: '#1c1c22',
                color: '#fff',
                border: '1.5px solid rgba(163,230,53,0.4)',
                borderRadius: 16,
                fontWeight: 800,
                fontSize: 12,
                cursor: 'pointer',
                whiteSpace: 'nowrap'
              }}
              title="Testar simulação no mapa"
            >
              ⚡ Simular Rota
            </button>

            <button
              onClick={() => setShowConfigModal(true)}
              style={{
                padding: '16px 14px',
                background: '#1c1c22',
                color: '#aaa',
                border: '1px solid #333',
                borderRadius: 16,
                fontWeight: 800,
                fontSize: 12,
                cursor: 'pointer'
              }}
              title="Ajustar KM / Cidade"
            >
              ⚙️ KM
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', gap: 10 }}>
            <button
              onClick={() => setIsPaused(!isPaused)}
              style={{
                flex: 1,
                padding: '15px',
                background: isPaused ? 'var(--neon)' : '#F59E0B',
                color: '#000',
                border: 'none',
                borderRadius: 14,
                fontWeight: 900,
                fontSize: 15,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 6
              }}
            >
              {isPaused ? '▶ RETOMAR' : '⏸ PAUSAR'}
            </button>

            <button
              onClick={handleFinishAndSave}
              style={{
                flex: 1,
                padding: '15px',
                background: '#EF4444',
                color: '#fff',
                border: 'none',
                borderRadius: 14,
                fontWeight: 900,
                fontSize: 15,
                cursor: 'pointer',
                boxShadow: '0 4px 15px rgba(239,68,68,0.4)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 6
              }}
            >
              ⏹ FINALIZAR & SALVAR
            </button>
          </div>
        )}
      </div>
    </div>,
    document.body
  )
}
