import React, { useState, useEffect } from 'react'

/* ========================================================
   NEXA FIT PRO — Protocolo Nutricional & Metabólico
   Alta Performance • Imagens Gourmet • Bio-Individualidade
   Ajuste por Biotipo, Calorias & Distribuição de Macronutrientes
   ======================================================== */

const DIET_PRESETS = {
  tradicional: {
    name: 'Equilíbrio & Performance',
    desc: 'Carboidratos complexos, proteínas nobres e gorduras anti-inflamatórias',
    ratio: { p: 30, c: 45, g: 25 },
    meals: [
      {
        id: 1,
        title: 'Café da Manhã • Ativação Metabólica',
        time: '08:00',
        icon: '🍳',
        image: '/images/meal-breakfast.jpg',
        cals: 480,
        macros: 'P: 35g • C: 48g • G: 16g',
        items: [
          '4 Ovos mexidos preparados com azeite de oliva extra virgem',
          '2 Fatias de pão sourdough ou 100% integral artesanal',
          '1 Porção de frutas antioxidantes (Mirtilos ou Banana)',
          'Café especial 100% arábica sem açúcar'
        ]
      },
      {
        id: 2,
        title: 'Almoço • Síntese & Densidade Muscular',
        time: '12:30',
        icon: '🍽️',
        image: '/images/meal-lunch.jpg',
        cals: 680,
        macros: 'P: 58g • C: 65g • G: 18g',
        items: [
          '180g Salmão grelhado ou Peito de frango orgânico',
          '150g Quinoa real ou Arroz selvagem aromático',
          'Mix de aspargos verdes e brócolis grelhados na brasa',
          'Salada de folhas nobres com azeite extra virgem e limão siciliano'
        ]
      },
      {
        id: 3,
        title: 'Snack da Tarde • Pré-Treino Anabólico',
        time: '16:30',
        icon: '⚡',
        image: '/images/meal-snack.jpg',
        cals: 420,
        macros: 'P: 38g • C: 44g • G: 10g',
        items: [
          'Bowl de Açaí puro com Whey Protein Isolado (30g P)',
          'Fatias de banana com canela do Ceilão e nibs de cacau',
          '25g Castanhas nobres (Amêndoas e Castanha-do-Pará)',
          'Sementes de chia ativadas para saciedade prolongada'
        ]
      },
      {
        id: 4,
        title: 'Jantar • Recuperação Muscular & Sono Profundo',
        time: '20:30',
        icon: '🥗',
        image: '/images/meal-dinner.jpg',
        cals: 520,
        macros: 'P: 48g • C: 32g • G: 18g',
        items: [
          '180g Filé Mignon grelhado ou Tilápia fresca ao alecrim',
          '120g Cubos de batata-doce rústica assada com flor de sal',
          'Cogumelos Paris salteados no alho com espinafre fresco',
          'Fio de azeite de oliva extra virgem prensado a frio'
        ]
      }
    ]
  },
  lowcarb: {
    name: 'Low Carb • Otimização Glicêmica',
    desc: 'Controle de insulina, queima de gordura visceral e foco mental constante',
    ratio: { p: 40, c: 20, g: 40 },
    meals: [
      {
        id: 1,
        title: 'Café da Manhã • Cetogênico Suave',
        time: '08:00',
        icon: '🥑',
        image: '/images/meal-breakfast.jpg',
        cals: 460,
        macros: 'P: 38g • C: 12g • G: 28g',
        items: [
          '3 Ovos caipiras preparados na manteiga Ghee',
          'Meio abacate Hass fatiado com flor de sal e limão',
          '30g Queijo artesanal curado',
          'Café preto filtrado com óleo TCM'
        ]
      },
      {
        id: 2,
        title: 'Almoço • Oxidação Lipídica Acelerada',
        time: '12:30',
        icon: '🥩',
        image: '/images/meal-lunch.jpg',
        cals: 650,
        macros: 'P: 62g • C: 18g • G: 34g',
        items: [
          '200g Picanha magra na grelha ou Coxa de frango desossada',
          'Bouquet de brócolis, couve e abobrinha no vapor com azeite',
          'Mix de folhas escuras com azeitonas pretas',
          '80g Purê rústico de abóbora cabotiá'
        ]
      },
      {
        id: 3,
        title: 'Lanche • Proteína & Lipídios Nobres',
        time: '16:30',
        icon: '🥜',
        image: '/images/meal-snack.jpg',
        cals: 380,
        macros: 'P: 32g • C: 10g • G: 24g',
        items: [
          'Shake de Whey Protein Isolado batido com leite de amêndoas',
          '30g Mix de nozes, macadâmias e castanha de caju',
          'Morangos frescos silvestres'
        ]
      },
      {
        id: 4,
        title: 'Jantar • Recuperação Anti-inflamatória',
        time: '20:30',
        icon: '🐟',
        image: '/images/meal-dinner.jpg',
        cals: 540,
        macros: 'P: 52g • C: 12g • G: 30g',
        items: [
          '200g Lombo de Salmão selvagem grelhado na manteiga de ervas',
          'Espinafre baby salteado com lâminas de alho dourado',
          'Salada de rúcula selvagem e tomates cereja confitados',
          'Azeite de oliva extravirgem'
        ]
      }
    ]
  },
  cetogenica: {
    name: 'Cetogênica • Alta Performance',
    desc: 'Indução estável de corpos cetônicos para energia infinita e zero picos de fome',
    ratio: { p: 25, c: 5, g: 70 },
    meals: [
      {
        id: 1,
        title: 'Café da Manhã • Bulletproof & Ovos',
        time: '08:30',
        icon: '☕',
        image: '/images/meal-breakfast.jpg',
        cals: 490,
        macros: 'P: 22g • C: 5g • G: 42g',
        items: [
          'Café Turbo (Café arábica + TCM C8 + Manteiga Ghee)',
          '3 Ovos caipiras mexidos com lascas de parmesão de 24 meses',
          'Azeite de oliva e orégano fresco'
        ]
      },
      {
        id: 2,
        title: 'Almoço • Alta Densidade Energética',
        time: '13:00',
        icon: '🥗',
        image: '/images/meal-lunch.jpg',
        cals: 720,
        macros: 'P: 48g • C: 8g • G: 56g',
        items: [
          '220g Costela bovina premium assada lentamente ou Salmão',
          'Abacate fatiado temperado com flor de sal e azeite',
          'Salada de folhas verdes com molho cremoso de azeite e limão',
          'Castanhas de macadâmia salpicadas'
        ]
      },
      {
        id: 3,
        title: 'Lanche • Queijos Nobres & Nozes',
        time: '17:00',
        icon: '🧀',
        image: '/images/meal-snack.jpg',
        cals: 360,
        macros: 'P: 18g • C: 4g • G: 30g',
        items: [
          '40g Queijo Gouda ou Provolone curado',
          '30g Mix de nozes pecan e macadâmias crocantes'
        ]
      },
      {
        id: 4,
        title: 'Jantar • Proteína & Lipídios Reparadores',
        time: '20:30',
        icon: '🥩',
        image: '/images/meal-dinner.jpg',
        cals: 600,
        macros: 'P: 44g • C: 6g • G: 45g',
        items: [
          '200g Bife Ancho grelhado com manteiga de chimichurri',
          'Aspargos salteados e cogumelos Portobello',
          'Salada de agrião com azeite de oliva extravirgem'
        ]
      }
    ]
  },
  carnivora: {
    name: 'Bio-Carnívora • Máxima Biodisponibilidade',
    desc: 'Nutrientes de altíssima absorção, densidade mineral e zero antinutrientes vegetais',
    ratio: { p: 45, c: 2, g: 53 },
    meals: [
      {
        id: 1,
        title: 'Refeição 01 • Ovos & Proteína Nobre',
        time: '10:00',
        icon: '🍳',
        image: '/images/meal-breakfast.jpg',
        cals: 620,
        macros: 'P: 54g • C: 2g • G: 42g',
        items: [
          '4 Ovos caipiras preparados na manteiga de fazenda',
          '120g Carne moída de corte nobre com sal integral',
          'Queijo artesanal de leite cru'
        ]
      },
      {
        id: 2,
        title: 'Refeição 02 • Bife Prime & Ovos',
        time: '14:00',
        icon: '🥩',
        image: '/images/meal-lunch.jpg',
        cals: 850,
        macros: 'P: 78g • C: 1g • G: 58g',
        items: [
          '350g Contrafilé maturada na brasa com sal grosso',
          '2 Ovos fritos com gema mole por cima',
          'Manteiga Ghee derretida'
        ]
      },
      {
        id: 3,
        title: 'Refeição 03 • Corte Suíno / Aves & Caldo',
        time: '19:30',
        icon: '🍗',
        image: '/images/meal-dinner.jpg',
        cals: 680,
        macros: 'P: 68g • C: 1g • G: 44g',
        items: [
          '300g Sobrecoxa de frango caipira com pele crocante',
          '50g Bacon artesanal defumado em lenha nobre',
          'Caldo de ossos concentrado aquecido com sal marinho'
        ]
      }
    ]
  },
  vegetariana: {
    name: 'Plant-Based • Síntese Proteica',
    desc: 'Fontes vegetais de alto valor biológico, grãos germinados e leguminosas nobres',
    ratio: { p: 30, c: 45, g: 25 },
    meals: [
      {
        id: 1,
        title: 'Café da Manhã • Panqueca Proteica',
        time: '08:00',
        icon: '🥞',
        image: '/images/meal-breakfast.jpg',
        cals: 440,
        macros: 'P: 30g • C: 52g • G: 12g',
        items: [
          'Panqueca de banana, aveia laminada e claras de ovos',
          '1 scoop de Proteína Vegetal isolada (Arroz & Ervilha)',
          'Canela pura e mel silvestre'
        ]
      },
      {
        id: 2,
        title: 'Almoço • Proteína Vegetal Completa',
        time: '12:30',
        icon: '🍛',
        image: '/images/meal-lunch.jpg',
        cals: 620,
        macros: 'P: 42g • C: 72g • G: 16g',
        items: [
          '160g Tofu orgânico marinado e grelhado com gergelim',
          '180g Grão-de-bico com açafrão da terra e azeite',
          '100g Arroz negro com sementes de abóbora',
          'Brócolis e legumes coloridos cozidos no vapor'
        ]
      },
      {
        id: 3,
        title: 'Snack • Iogurte Grego & Superfoods',
        time: '16:30',
        icon: '🥜',
        image: '/images/meal-snack.jpg',
        cals: 390,
        macros: 'P: 32g • C: 38g • G: 12g',
        items: [
          '200g Iogurte Grego natural de alta proteína',
          '30g Sementes de chia, linhaça e abóbora',
          'Frutas vermelhas frescas'
        ]
      },
      {
        id: 4,
        title: 'Jantar • Omelete Gourmet & Lentilhas',
        time: '20:30',
        icon: '🍲',
        image: '/images/meal-dinner.jpg',
        cals: 510,
        macros: 'P: 38g • C: 56g • G: 14g',
        items: [
          'Omelete de 3 ovos caipiras com espinafre e cogumelos Shimeji',
          '150g Lentilhas nobres cozidas com ervas finas',
          'Salada de tomate italiano, pepino japonês e azeite extravirgem'
        ]
      }
    ]
  }
}

export default function Dieta() {
  const [selectedDiet, setSelectedDiet] = useState(() => {
    const raw = localStorage.getItem('nexafit_diet_type')
    return raw || 'tradicional'
  })

  const [dietMeals, setDietMeals] = useState(DIET_PRESETS[selectedDiet]?.meals || DIET_PRESETS.tradicional.meals)

  const storedAnswers = localStorage.getItem('nexafit_answers') ? JSON.parse(localStorage.getItem('nexafit_answers')) : {}
  const userGoal = storedAnswers.goal || 'emagrecer'
  const userWeight = Number(storedAnswers.weight) || 75
  const userGoalWeight = Number(storedAnswers.goalWeight) || 68

  // Cálculo calórico inteligente
  const baseCals = userGoal === 'massa' ? Math.round(userWeight * 33) : userGoal === 'emagrecer' ? Math.round(userWeight * 24) : Math.round(userWeight * 28)
  const targetCals = baseCals > 1200 ? baseCals : 2100

  const currentPreset = DIET_PRESETS[selectedDiet] || DIET_PRESETS.tradicional
  const totalProtein = Math.round((targetCals * (currentPreset.ratio.p / 100)) / 4)
  const totalCarbs = Math.round((targetCals * (currentPreset.ratio.c / 100)) / 4)
  const totalFat = Math.round((targetCals * (currentPreset.ratio.g / 100)) / 9)

  // Água recomendada (35ml por kg)
  const waterTargetLiters = ((userWeight * 35) / 1000).toFixed(1)

  const handleSelectDiet = (dietKey) => {
    setSelectedDiet(dietKey)
    localStorage.setItem('nexafit_diet_type', dietKey)
    setDietMeals(DIET_PRESETS[dietKey].meals)
  }

  const swapItem = (mealId, itemIdx) => {
    const alternatives = [
      '160g Peito de frango grelhado com lemon pepper',
      'Omelete de 3 ovos com queijo parmesão e orégano',
      '160g Patinho moído magro com ervas aromáticas',
      '180g Filé de tilápia fresca grelhada com azeite',
      '140g Batata-doce assada com flor de sal',
      '120g Mandioca cozida com azeite de oliva',
      '100g Arroz negro com gergelim tostado',
      'Meio abacate Hass temperado com azeite e limão',
      '30g Mix de castanhas nobres (amêndoas e nozes)'
    ]
    const randomAlt = alternatives[Math.floor(Math.random() * alternatives.length)]
    
    setDietMeals(prev => prev.map(meal => {
      if (meal.id === mealId) {
        const nextItems = [...meal.items]
        nextItems[itemIdx] = randomAlt
        return { ...meal, items: nextItems }
      }
      return meal
    }))
  }

  const goalText = {
    'emagrecer': 'Oxidação Lipídica',
    'massa': 'Hipertrofia & Volume',
    'definir': 'Definição Muscular',
    'saude': 'Longevidade & Vitalidade'
  }[userGoal] || 'Otimização Metabólica'

  return (
    <div style={{ background: '#0a0a0c', minHeight: '100vh', color: '#fff', padding: '16px 16px 110px', maxWidth: 500, margin: '0 auto', fontFamily: 'var(--font-primary)' }}>
      
      {/* Header Profissional */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
            <span style={{ fontSize: 18 }}>🥗</span>
            <h1 style={{ fontSize: 22, fontWeight: 900, margin: 0, letterSpacing: -0.5 }}>
              Nutrição & Macros
            </h1>
          </div>
          <p style={{ fontSize: 12, color: 'var(--text-muted)', margin: 0 }}>
            Protocolo individualizado calibrado por biotipo
          </p>
        </div>
        <div style={{
          background: 'rgba(163,230,53,0.12)',
          color: 'var(--neon)',
          border: '1.5px solid rgba(163,230,53,0.35)',
          padding: '6px 12px',
          borderRadius: 20,
          fontSize: 11,
          fontWeight: 900,
          textTransform: 'uppercase',
          letterSpacing: 0.5
        }}>
          {goalText}
        </div>
      </div>

      {/* Seletor de Protocolo Alimentar */}
      <div style={{ background: '#121215', borderRadius: 18, padding: 14, marginBottom: 16, border: '1px solid rgba(255,255,255,0.06)' }}>
        <div style={{ fontSize: 11, color: '#888', fontWeight: 800, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 10 }}>
          Protocolo Nutricional Selecionado:
        </div>
        <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 4, scrollbarWidth: 'none' }}>
          {Object.entries(DIET_PRESETS).map(([key, data]) => {
            const isSelected = selectedDiet === key
            return (
              <button
                key={key}
                onClick={() => handleSelectDiet(key)}
                style={{
                  padding: '9px 14px', borderRadius: 12, fontWeight: 800, fontSize: 12, whiteSpace: 'nowrap',
                  background: isSelected ? 'var(--neon)' : '#1A1A1F',
                  color: isSelected ? '#000' : '#aaa',
                  border: isSelected ? '1px solid var(--neon)' : '1px solid #282830',
                  cursor: 'pointer', transition: 'all 0.2s ease',
                  boxShadow: isSelected ? '0 2px 10px rgba(163,230,53,0.3)' : 'none'
                }}
              >
                {data.name}
              </button>
            )
          })}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 10, fontSize: 11, color: '#bbb' }}>
          <span style={{ color: 'var(--neon)' }}>⚡</span>
          <span>{currentPreset.desc}</span>
        </div>
      </div>

      {/* Cartão de Telemetria de Calorias e Macros */}
      <div style={{
        background: 'linear-gradient(135deg, #16161c 0%, #101014 100%)',
        borderRadius: 22,
        padding: 18,
        marginBottom: 20,
        border: '1.5px solid rgba(163,230,53,0.25)',
        boxShadow: '0 8px 30px rgba(0,0,0,0.6)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
          <div>
            <div style={{ fontSize: 10, color: 'var(--neon)', fontWeight: 900, letterSpacing: 1, textTransform: 'uppercase' }}>
              META CALÓRICA DIÁRIA
            </div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginTop: 2 }}>
              <span style={{ fontSize: 32, fontWeight: 900, color: '#fff', letterSpacing: -1 }}>{targetCals}</span>
              <span style={{ color: '#888', fontSize: 14, fontWeight: 700 }}>kcal</span>
            </div>
          </div>
          <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', gap: 4 }}>
            <span style={{ fontSize: 11, color: '#aaa' }}>Peso: <strong style={{ color: '#fff' }}>{userWeight} kg</strong></span>
            <span style={{ fontSize: 11, color: 'var(--neon)', background: 'rgba(163,230,53,0.1)', padding: '2px 8px', borderRadius: 6, fontWeight: 700 }}>
              💧 Meta de Água: {waterTargetLiters} L
            </span>
          </div>
        </div>

        {/* 3 Macro Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
          <div style={{ background: '#1c1c24', borderRadius: 14, padding: '10px 8px', textAlign: 'center', border: '1px solid rgba(59,130,246,0.25)' }}>
            <div style={{ color: '#38BDF8', fontSize: 18, fontWeight: 900 }}>{totalProtein}g</div>
            <div style={{ color: '#aaa', fontSize: 10, fontWeight: 700, textTransform: 'uppercase', marginTop: 2 }}>Proteínas</div>
            <div style={{ fontSize: 9, color: '#666', marginTop: 1 }}>{currentPreset.ratio.p}%</div>
          </div>
          <div style={{ background: '#1c1c24', borderRadius: 14, padding: '10px 8px', textAlign: 'center', border: '1px solid rgba(245,158,11,0.25)' }}>
            <div style={{ color: '#F59E0B', fontSize: 18, fontWeight: 900 }}>{totalCarbs}g</div>
            <div style={{ color: '#aaa', fontSize: 10, fontWeight: 700, textTransform: 'uppercase', marginTop: 2 }}>Carboidratos</div>
            <div style={{ fontSize: 9, color: '#666', marginTop: 1 }}>{currentPreset.ratio.c}%</div>
          </div>
          <div style={{ background: '#1c1c24', borderRadius: 14, padding: '10px 8px', textAlign: 'center', border: '1px solid rgba(239,68,68,0.25)' }}>
            <div style={{ color: '#EF4444', fontSize: 18, fontWeight: 900 }}>{totalFat}g</div>
            <div style={{ color: '#aaa', fontSize: 10, fontWeight: 700, textTransform: 'uppercase', marginTop: 2 }}>Lipídios</div>
            <div style={{ fontSize: 9, color: '#666', marginTop: 1 }}>{currentPreset.ratio.g}%</div>
          </div>
        </div>
      </div>

      {/* Lista de Refeições Gourmet com Fotografia de Alta Definição */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
        {dietMeals.map(meal => (
          <div
            key={meal.id}
            style={{
              background: '#131317',
              borderRadius: 22,
              overflow: 'hidden',
              border: '1px solid rgba(255,255,255,0.08)',
              boxShadow: '0 8px 24px rgba(0,0,0,0.5)'
            }}
          >
            {/* Foto Gourmet da Refeição */}
            <div style={{ position: 'relative', width: '100%', height: 160, background: '#000' }}>
              <img
                src={meal.image || '/images/meal-lunch.jpg'}
                alt={meal.title}
                loading="lazy"
                style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
              />
              
              {/* Overlay com Horário e Calorias */}
              <div style={{
                position: 'absolute', inset: 0,
                background: 'linear-gradient(to top, rgba(19,19,23,0.98) 10%, rgba(19,19,23,0.3) 60%, transparent 100%)',
                display: 'flex', flexDirection: 'column', justifyContent: 'flex-end',
                padding: '12px 16px'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                  <div>
                    <span style={{ fontSize: 11, color: 'var(--neon)', fontWeight: 900, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                      ⏰ {meal.time}
                    </span>
                    <h3 style={{ fontSize: 16, fontWeight: 900, color: '#fff', margin: '2px 0 0' }}>
                      {meal.title}
                    </h3>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: 16, fontWeight: 900, color: 'var(--neon)' }}>
                      {meal.cals} <span style={{ fontSize: 11, color: '#aaa' }}>kcal</span>
                    </div>
                    <span style={{ fontSize: 10, color: '#bbb', background: 'rgba(0,0,0,0.6)', padding: '2px 6px', borderRadius: 4 }}>
                      {meal.macros}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Lista de Alimentos com Botão de Troca Rápida */}
            <div style={{ padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: 8 }}>
              <div style={{ fontSize: 11, fontWeight: 800, color: '#888', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                📋 Ingredientes Recomendados:
              </div>
              
              {meal.items.map((item, i) => (
                <div
                  key={i}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '10px 12px',
                    background: '#191920',
                    borderRadius: 12,
                    border: '1px solid rgba(255,255,255,0.04)'
                  }}
                >
                  <span style={{ fontSize: 13, color: '#f4f4f5', flex: 1, paddingRight: 8, lineHeight: 1.4 }}>
                    • {item}
                  </span>
                  
                  <button
                    onClick={() => swapItem(meal.id, i)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 4,
                      background: 'rgba(56,189,248,0.12)',
                      border: '1px solid #38BDF8',
                      color: '#38BDF8',
                      padding: '5px 10px',
                      borderRadius: 8,
                      fontSize: 11,
                      fontWeight: 800,
                      cursor: 'pointer',
                      flexShrink: 0
                    }}
                    title="Substituir por alimento equivalente"
                  >
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.59-9.21l5.67-1.42" />
                    </svg>
                    Trocar
                  </button>
                </div>
              ))}
            </div>

          </div>
        ))}
      </div>

    </div>
  )
}
