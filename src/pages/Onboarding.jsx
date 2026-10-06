import { useState } from 'react'
import db from '../db/database'

export default function Onboarding({ onComplete }) {
  const [step, setStep] = useState(0)
  const [data, setData] = useState({
    nome: '', genero: '', dob: '', altura: '', peso: '', 
    objetivo: '', nivel: '', dias_treino: '', equipamentos: [], restricoes: [], foco_muscular: '',
    atividades_extras: {}, horario_treino: '18:00', estilo_dieta: 'Padrão'
  })

  const next = () => setStep(s => s + 1)
  const prev = () => setStep(s => s - 1)
  
  const finish = async () => {
    setStep(15) // Loading screen

    try {
      const users = await db.users.toArray()

      if (users.length > 0) {
        const u = users[0]

        // Dados completos para salvar
        const dadosCompletos = {
          nome: u.nome || data.nome,
          celular: u.celular,
          avatar_url: u.avatar_url || '',
          peso: Number(data.peso),
          altura: Number(data.altura),
          objetivo: data.objetivo,
          nivel: data.nivel,
          dias_treino: data.dias_treino,
          genero: data.genero,
          equipamentos: data.equipamentos,
          restricoes: data.restricoes,
          foco_muscular: data.foco_muscular,
          atividades_extras: data.atividades_extras,
          horario_treino: data.horario_treino,
          estilo_dieta: data.estilo_dieta
        }

        // Atualiza banco local
        await db.users.update(u.id, dadosCompletos)

        // Sincroniza com Supabase
        try {
          const { supabase } = await import('../lib/supabase')
          const { error } = await supabase
            .from('profiles')
            .update({
              peso: dadosCompletos.peso,
              altura: dadosCompletos.altura,
              objetivo: dadosCompletos.objetivo,
              nivel: dadosCompletos.nivel,
              dias_treino: dadosCompletos.dias_treino,
              genero: dadosCompletos.genero,
              equipamentos: dadosCompletos.equipamentos,
              restricoes: dadosCompletos.restricoes,
              foco_muscular: dadosCompletos.foco_muscular,
              atividades_extras: dadosCompletos.atividades_extras,
              horario_treino: dadosCompletos.horario_treino,
              estilo_dieta: dadosCompletos.estilo_dieta
            })
            .eq('celular', u.celular)

          if (error) console.warn('Supabase update error:', error)
          else console.log('✅ Perfil sincronizado com Supabase!')
        } catch (supErr) {
          console.warn('Offline: dados salvos apenas localmente', supErr)
        }

      } else {
        // Fallback: cria usuário do zero localmente
        await db.users.add({
          nome: data.nome,
          peso: Number(data.peso),
          altura: Number(data.altura),
          objetivo: data.objetivo,
          nivel: data.nivel,
          dias_treino: data.dias_treino,
          genero: data.genero,
          equipamentos: data.equipamentos,
          restricoes: data.restricoes,
          avatar_url: '',
        })
      }
    } catch (err) {
      console.error('Erro ao salvar onboarding:', err)
    }

    setTimeout(() => {
      onComplete()
      window.location.href = '/'
    }, 2500)
  }

  const toggleArrayItem = (field, item) => {
    const arr = data[field];
    if (arr.includes(item)) {
      setData({ ...data, [field]: arr.filter(i => i !== item) });
    } else {
      setData({ ...data, [field]: [...arr, item] });
    }
  }

  const toggleAtivExtra = (ativ) => {
    const newExt = { ...(data.atividades_extras || {}) }
    if (newExt[ativ]) delete newExt[ativ]
    else newExt[ativ] = []
    setData({ ...data, atividades_extras: newExt })
  }
  const toggleDiaAtivExtra = (ativ, diaIdx) => {
    const newExt = { ...(data.atividades_extras || {}) }
    const dias = newExt[ativ] || []
    if (dias.includes(diaIdx)) newExt[ativ] = dias.filter(x => x !== diaIdx)
    else newExt[ativ] = [...dias, diaIdx]
    setData({ ...data, atividades_extras: newExt })
  }

  return (
    <div className="onboarding-shell">
      {step > 1 && step < 15 && (
        <div className="ob-progress">
          {[...Array(13)].map((_, i) => (
            <div key={i} className={`ob-dot ${i < (step - 1) ? 'active' : ''}`}></div>
          ))}
        </div>
      )}

      {/* Wrapper to perfectly center content */}
      <div className="ob-content-wrapper">
        {step === 0 && (
          <div className="flex-col items-center text-center gap16">
            <div style={{ width: '88px', height: '88px', borderRadius: '26px', margin: '0 auto 10px', background: 'linear-gradient(135deg, #FFD700, #FFA500)', boxShadow: '0 8px 32px rgba(255,165,0,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="52" height="52" viewBox="0 0 52 52" fill="none">
                <rect x="3" y="19" width="9" height="14" rx="3" fill="rgba(0,0,0,0.85)"/>
                <rect x="10" y="15" width="6" height="22" rx="2" fill="rgba(0,0,0,0.85)"/>
                <rect x="16" y="23" width="20" height="6" rx="3" fill="rgba(0,0,0,0.85)"/>
                <rect x="36" y="15" width="6" height="22" rx="2" fill="rgba(0,0,0,0.85)"/>
                <rect x="40" y="19" width="9" height="14" rx="3" fill="rgba(0,0,0,0.85)"/>
              </svg>
            </div>
            <h1 className="text-yellow" style={{ fontSize: '32px' }}>Bronks Gym App</h1>
            <p className="text-gray mb16 text-lg">Treino e dieta no seu ritmo — do seu jeito.</p>
            <button className="btn btn-primary" onClick={() => setStep(2)}>Começar Agora</button>
          </div>
        )}

        {/* Passo do Nome removido por já termos no cadastro */}

        {step === 2 && (
          <div className="flex-col gap16">
            <h1 className="text-yellow text-center mb16">Gênero</h1>
            <div className={`option-card ${data.genero === 'Masculino' ? 'selected' : ''}`} onClick={() => setData({...data, genero: 'Masculino'})}>
               <div className="option-icon">👨</div>
               <div className="option-text">
                  <div className="option-title">Masculino</div>
               </div>
               <div className="option-check"></div>
            </div>
            <div className={`option-card ${data.genero === 'Feminino' ? 'selected' : ''}`} onClick={() => setData({...data, genero: 'Feminino'})}>
               <div className="option-icon">👩</div>
               <div className="option-text">
                  <div className="option-title">Feminino</div>
               </div>
               <div className="option-check"></div>
            </div>
            <div className={`option-card ${data.genero === 'Prefiro não dizer' ? 'selected' : ''}`} onClick={() => setData({...data, genero: 'Prefiro não dizer'})}>
               <div className="option-icon">👤</div>
               <div className="option-text">
                  <div className="option-title">Prefiro não dizer</div>
               </div>
               <div className="option-check"></div>
            </div>
            <div className="flex gap8 mt16">
              <button className="btn btn-secondary flex-1" onClick={() => setStep(0)}>Voltar</button>
              <button className="btn btn-primary flex-1" disabled={!data.genero} onClick={next}>Continuar</button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="flex-col gap16">
            <h1 className="text-yellow text-center mb8">Data de nascimento</h1>
            <p className="text-gray text-center mb24">Sua idade nos ajuda a ajustar as calorias.</p>
            
            <div style={{ position: 'relative', width: '100%' }}>
              <input 
                type="date" 
                className="input" 
                style={{ 
                  fontSize: '18px', 
                  height: '64px', 
                  textAlign: 'center', 
                  paddingLeft: '40px',
                  fontWeight: 'bold',
                  letterSpacing: '1px'
                }} 
                value={data.dob} 
                onChange={e => setData({...data, dob: e.target.value})} 
              />
            </div>
            <p className="text-sm text-gray text-center">Usado para calcular sua TMB (Taxa Metabólica Basal).</p>
            <div className="flex gap8 mt16">
              <button className="btn btn-secondary flex-1" onClick={prev}>Voltar</button>
              <button className="btn btn-primary flex-1" disabled={!data.dob} onClick={next}>Continuar</button>
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="flex-col gap16">
            <h1 className="text-yellow text-center mb16">Altura (cm)</h1>
            <input type="number" className="input text-center" style={{fontSize: '24px', fontWeight: 'bold'}} value={data.altura} onChange={e => setData({...data, altura: e.target.value})} placeholder="Ex: 175" />
            <div className="flex gap8 mt16">
              <button className="btn btn-secondary flex-1" onClick={prev}>Voltar</button>
              <button className="btn btn-primary flex-1" disabled={!data.altura || data.altura < 100 || data.altura > 250} onClick={next}>Continuar</button>
            </div>
          </div>
        )}

        {step === 5 && (
          <div className="flex-col gap16">
            <h1 className="text-yellow text-center mb16">Peso atual (kg)</h1>
            <input type="number" step="0.1" className="input text-center" style={{fontSize: '24px', fontWeight: 'bold'}} value={data.peso} onChange={e => setData({...data, peso: e.target.value})} placeholder="Ex: 75.5" />
            <div className="flex gap8 mt16">
              <button className="btn btn-secondary flex-1" onClick={prev}>Voltar</button>
              <button className="btn btn-primary flex-1" disabled={!data.peso || data.peso < 30 || data.peso > 300} onClick={next}>Continuar</button>
            </div>
          </div>
        )}

        {step === 6 && (
          <div className="flex-col gap16">
            <h1 className="text-yellow text-center mb16">Objetivo principal</h1>
            <div className={`option-card ${data.objetivo === 'Emagrecer e Secar' ? 'selected' : ''}`} onClick={() => setData({...data, objetivo: 'Emagrecer e Secar'})}>
               <div className="option-icon">🔥</div>
               <div className="option-text"><div className="option-title">Emagrecer e Secar</div><div className="option-sub">Déficit calórico com foco na perda de gordura.</div></div>
               <div className="option-check"></div>
            </div>
            <div className={`option-card ${data.objetivo === 'Ganhar Massa Muscular' ? 'selected' : ''}`} onClick={() => setData({...data, objetivo: 'Ganhar Massa Muscular'})}>
               <div className="option-icon">💪</div>
               <div className="option-text"><div className="option-title">Ganhar Massa Muscular</div><div className="option-sub">Superávit calórico para hipertrofia.</div></div>
               <div className="option-check"></div>
            </div>
            <div className={`option-card ${data.objetivo === 'Recomposição Corporal' ? 'selected' : ''}`} onClick={() => setData({...data, objetivo: 'Recomposição Corporal'})}>
               <div className="option-icon">⚡</div>
               <div className="option-text"><div className="option-title">Recomposição Corporal</div><div className="option-sub">Secar e ganhar ao mesmo tempo.</div></div>
               <div className="option-check"></div>
            </div>
            <div className={`option-card ${data.objetivo === 'Aumentar Força' ? 'selected' : ''}`} onClick={() => setData({...data, objetivo: 'Aumentar Força'})}>
               <div className="option-icon">🏋️</div>
               <div className="option-text"><div className="option-title">Aumentar Força</div><div className="option-sub">Foco em progressão de carga (Powerbuilding).</div></div>
               <div className="option-check"></div>
            </div>
            <div className={`option-card ${data.objetivo === 'Saúde e Condicionamento' ? 'selected' : ''}`} onClick={() => setData({...data, objetivo: 'Saúde e Condicionamento'})}>
               <div className="option-icon">❤️</div>
               <div className="option-text"><div className="option-title">Saúde e Condicionamento</div><div className="option-sub">Manutenção e bem-estar geral.</div></div>
               <div className="option-check"></div>
            </div>
            <div className={`option-card ${data.objetivo === 'Treino Híbrido (Força + Cardio)' ? 'selected' : ''}`} onClick={() => setData({...data, objetivo: 'Treino Híbrido (Força + Cardio)'})}>
               <div className="option-icon">🏃‍♂️</div>
               <div className="option-text"><div className="option-title">Treino Híbrido (Força + Cardio)</div><div className="option-sub">Mistura de musculação com corrida com metas.</div></div>
               <div className="option-check"></div>
            </div>
            <div className="flex gap8 mt16">
              <button className="btn btn-secondary flex-1" onClick={prev}>Voltar</button>
              <button className="btn btn-primary flex-1" disabled={!data.objetivo} onClick={next}>Continuar</button>
            </div>
          </div>
        )}

        {step === 7 && (
          <div className="flex-col gap16">
            <h1 className="text-yellow text-center mb8">O que quer melhorar?</h1>
            <p className="text-gray text-center mb16">Seu treino será focado nesse objetivo.</p>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              {[
                { label: 'Pernas & Coxas', icon: '🦵' },
                { label: 'Bumbum', icon: '🍑' },
                { label: 'Barriga / Abdômen', icon: '🍫' },
                { label: 'Braços (Bíceps/Tríceps)', icon: '💪' },
                { label: 'Peitoral', icon: '👕' },
                { label: 'Costas & Ombros', icon: '🦅' }
              ].map(f => (
                <div 
                  key={f.label}
                  onClick={() => setData({...data, foco_muscular: f.label})}
                  style={{
                    padding: '20px 12px', borderRadius: '16px', cursor: 'pointer', textAlign: 'center',
                    background: data.foco_muscular === f.label ? 'rgba(255,215,0,0.1)' : 'rgba(255,255,255,0.03)',
                    border: `1px solid ${data.foco_muscular === f.label ? '#FFD700' : 'rgba(255,255,255,0.08)'}`,
                    transition: 'all 0.2s'
                  }}
                >
                  <div style={{ fontSize: '24px', marginBottom: '8px' }}>{f.icon}</div>
                  <div style={{ color: data.foco_muscular === f.label ? '#FFD700' : '#fff', fontSize: '12px', fontWeight: 'bold' }}>{f.label}</div>
                </div>
              ))}
            </div>

            <div className="flex gap8 mt16">
              <button className="btn btn-secondary flex-1" onClick={prev}>Voltar</button>
              <button className="btn btn-primary flex-1" disabled={!data.foco_muscular} onClick={next}>Continuar</button>
            </div>
          </div>
        )}

        {step === 8 && (
          <div className="flex-col gap16" style={{ width: '100%', padding: '0 8px' }}>
            <h1 className="text-yellow text-center mb16">Nível de dificuldade</h1>
            
            <div 
              className={`img-card ${data.nivel === 'Iniciante' ? 'selected' : ''}`} 
              onClick={() => setData({...data, nivel: 'Iniciante'})}
            >
              <div className="img-card-bg" style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?q=80&w=1000&auto=format&fit=crop")' }}></div>
              <div className="img-card-overlay">
                 <div className="text-yellow text-sm mb4">★☆☆</div>
                 <div className="img-card-title">INICIANTE</div>
                 <div className="img-card-desc">- menos de 1 ano de treino<br/>- treinos irregulares</div>
              </div>
            </div>

            <div 
              className={`img-card ${data.nivel === 'Avançado' ? 'selected' : ''}`} 
              onClick={() => setData({...data, nivel: 'Avançado'})}
            >
              <div className="img-card-bg" style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=1000&auto=format&fit=crop")' }}></div>
              <div className="img-card-overlay">
                 <div className="text-yellow text-sm mb4">★★☆</div>
                 <div className="img-card-title">AVANÇADO</div>
                 <div className="img-card-desc">- mais de 1 ano de treino<br/>- treinos regulares</div>
              </div>
            </div>

            <div 
              className={`img-card ${data.nivel === 'Especialista' ? 'selected' : ''}`} 
              onClick={() => setData({...data, nivel: 'Especialista'})}
            >
              <div className="img-card-bg" style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1605296867304-46d5465a13f1?q=80&w=1000&auto=format&fit=crop")' }}></div>
              <div className="img-card-overlay">
                 <div className="text-yellow text-sm mb4">★★★</div>
                 <div className="img-card-title">ESPECIALISTA</div>
                 <div className="img-card-desc">- mais de 2 anos de treino<br/>- performance e consistência</div>
              </div>
            </div>

            <div className="flex gap8 mt16">
              <button className="btn btn-secondary flex-1" onClick={prev}>Voltar</button>
              <button className="btn btn-primary flex-1" disabled={!data.nivel} onClick={next}>Continuar</button>
            </div>
          </div>
        )}

        {step === 9 && (
          <div className="flex-col gap16">
            <h1 className="text-yellow text-center mb16">Dias de treino / semana</h1>
            <div className="flex wrap justify-center gap12">
              {[3, 4, 5, 6].map(d => (
                <div 
                  key={d} 
                  className={`day-pill ${data.dias_treino === d ? 'selected' : ''}`} 
                  onClick={() => setData({...data, dias_treino: d})}
                  style={{ width: '45%', textAlign: 'center', padding: '16px 0', fontSize: '18px' }}
                >
                  {d} dias
                </div>
              ))}
            </div>
            <div className="flex gap8 mt16">
              <button className="btn btn-secondary flex-1" onClick={prev}>Voltar</button>
              <button className="btn btn-primary flex-1" disabled={!data.dias_treino} onClick={next}>Continuar</button>
            </div>
          </div>
        )}

        {step === 10 && (
          <div className="flex-col gap16">
            <h1 className="text-yellow text-center mb16">Equipamentos disponíveis</h1>
            <p className="text-gray text-center mb8">Selecione todos que se aplicam:</p>
            {['Academia completa', 'Halteres em casa', 'Barra e anilhas', 'Sem equipamento (calistenia)'].map(eq => (
              <div 
                key={eq} 
                className={`checkbox-row ${data.equipamentos.includes(eq) ? 'checked' : ''}`} 
                onClick={() => toggleArrayItem('equipamentos', eq)}
              >
                <div className="checkbox-box">
                  {data.equipamentos.includes(eq) && <span>✓</span>}
                </div>
                <span className="text-white font-semibold">{eq}</span>
              </div>
            ))}
            <div className="flex gap8 mt16">
              <button className="btn btn-secondary flex-1" onClick={prev}>Voltar</button>
              <button className="btn btn-primary flex-1" disabled={data.equipamentos.length === 0} onClick={next}>Continuar</button>
            </div>
          </div>
        )}

        {step === 11 && (
          <div className="flex-col gap16">
            <h1 className="text-yellow text-center mb16">Restrições alimentares</h1>
            <p className="text-gray text-center mb8">Opcional. Selecione se houver restrições:</p>
            {['Nenhuma', 'Vegetariano', 'Vegano', 'Intolerante à lactose', 'Sem glúten', 'Alergia a frutos do mar'].map(res => (
              <div 
                key={res} 
                className={`checkbox-row ${data.restricoes.includes(res) ? 'checked' : ''}`} 
                onClick={() => {
                  if (res === 'Nenhuma') {
                    setData({ ...data, restricoes: ['Nenhuma'] });
                  } else {
                    const newRestricoes = data.restricoes.filter(r => r !== 'Nenhuma');
                    if (newRestricoes.includes(res)) {
                      setData({ ...data, restricoes: newRestricoes.filter(r => r !== res) });
                    } else {
                      setData({ ...data, restricoes: [...newRestricoes, res] });
                    }
                  }
                }}
              >
                <div className="checkbox-box">
                  {data.restricoes.includes(res) && <span>✓</span>}
                </div>
                <span className="text-white font-semibold">{res}</span>
              </div>
            ))}
            <div className="flex gap8 mt16">
              <button className="btn btn-secondary flex-1" onClick={prev}>Voltar</button>
              <button className="btn btn-primary flex-1" disabled={data.restricoes.length === 0} onClick={next}>Continuar</button>
            </div>
          </div>
        )}

        {step === 12 && (
          <div className="flex-col gap16">
            <h1 className="text-yellow text-center mb16">Estilo de Dieta</h1>
            <p className="text-gray text-center mb8">Escolha como prefere sua alimentação:</p>
            {['Padrão', 'Jejum Intermitente', 'Low Carb', 'Carnívora'].map(estilo => (
              <div 
                key={estilo} 
                className={`option-card ${data.estilo_dieta === estilo ? 'selected' : ''}`} 
                onClick={() => setData({...data, estilo_dieta: estilo})}
              >
                <div className="option-icon">{estilo === 'Padrão' ? '🥗' : estilo === 'Jejum Intermitente' ? '⏳' : estilo === 'Low Carb' ? '🥩' : '🍗'}</div>
                <div className="option-text">
                  <div className="option-title">{estilo}</div>
                </div>
                <div className="option-check"></div>
              </div>
            ))}
            <div className="flex gap8 mt16">
              <button className="btn btn-secondary flex-1" onClick={prev}>Voltar</button>
              <button className="btn btn-primary flex-1" disabled={!data.estilo_dieta} onClick={next}>Continuar</button>
            </div>
          </div>
        )}

        {step === 13 && (
          <div className="flex-col gap16">
            <h1 className="text-yellow text-center mb8">Horário de Treino</h1>
            <p className="text-gray text-center mb24">Para ajustarmos seu pré e pós-treino.</p>
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <input 
                type="time" 
                className="input" 
                style={{ fontSize: '32px', height: '80px', width: '200px', textAlign: 'center', fontWeight: 'bold', color: 'var(--yellow)', border: '2px solid var(--yellow)', borderRadius: '20px', background: 'rgba(255,215,0,0.05)' }} 
                value={data.horario_treino} 
                onChange={e => setData({...data, horario_treino: e.target.value})} 
              />
            </div>
            <div className="flex gap8 mt32">
              <button className="btn btn-secondary flex-1" onClick={prev}>Voltar</button>
              <button className="btn btn-primary flex-1" onClick={next}>Continuar</button>
            </div>
          </div>
        )}

        {step === 14 && (
          <div className="flex-col gap16">
            <h1 className="text-yellow text-center mb8">Atividades Complementares</h1>
            <p className="text-gray text-center mb8">Opcional. Selecione esportes que você pratica e nos dias:</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {['Corrida', 'Natação', 'Futebol', 'Ciclismo', 'Luta', 'Crossfit'].map(ativ => {
                const has = data.atividades_extras && data.atividades_extras[ativ]
                const dias = has || []
                return (
                  <div key={ativ} style={{ background: 'rgba(255,255,255,0.03)', borderRadius: '12px', padding: '12px', border: `1px solid ${has ? 'rgba(255,215,0,0.3)' : 'rgba(255,255,255,0.06)'}` }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: has ? '10px' : '0' }}>
                      <span style={{ color: '#fff', fontSize: '15px', fontWeight: 'bold' }}>{ativ}</span>
                      <button onClick={() => toggleAtivExtra(ativ)} style={{ background: has ? 'rgba(76,175,80,0.2)' : 'rgba(255,255,255,0.1)', border: 'none', borderRadius: '16px', padding: '5px 14px', color: has ? '#66BB6A' : '#aaa', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer' }}>
                        {has ? 'Ativo ✓' : 'Adicionar'}
                      </button>
                    </div>
                    {has && (
                      <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                        {['Dom','Seg','Ter','Qua','Qui','Sex','Sáb'].map((d, i) => (
                          <button key={i} onClick={() => toggleDiaAtivExtra(ativ, i)}
                            style={{ width: '36px', height: '36px', borderRadius: '8px', border: 'none', background: dias.includes(i) ? '#FFD700' : 'rgba(255,255,255,0.07)', color: dias.includes(i) ? '#000' : '#888', fontSize: '11px', fontWeight: 'bold', cursor: 'pointer' }}>
                            {d}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
            <div className="flex gap8 mt16">
              <button className="btn btn-secondary flex-1" onClick={prev}>Voltar</button>
              <button className="btn btn-primary flex-1" onClick={finish}>Gerar meu Plano</button>
            </div>
          </div>
        )}

        {step === 15 && (
          <div className="flex-col items-center text-center gap16">
            <div className="spinner mb16"></div>
            <h2 className="text-yellow">Criando seu plano personalizado...</h2>
            <p className="text-gray mt8">Cruzando informações com nossas tabelas avançadas...</p>
          </div>
        )}
      </div>
    </div>
  )
}
