import { useState, useEffect } from 'react'
import { Users, Megaphone, Dumbbell, X, Trash2, Edit, Save, Eye, EyeOff, ArrowLeft, Search, Upload, Image as ImageIcon, Video, Clock, MessageSquare, ShoppingBag, Plus, ExternalLink, ChevronLeft, ChevronRight } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { BASE, BASE_CALISTENIA, BASE_CASA } from '../lib/treinoUtils'

const LOJAS = [
  { key: 'mercadolivre', label: 'Mercado Livre', emoji: '🟡', cor: '#FFE600' },
  { key: 'amazon', label: 'Amazon', emoji: '📦', cor: '#FF9900' },
  { key: 'shopee', label: 'Shopee', emoji: '🧡', cor: '#EE4D2D' },
  { key: 'outro', label: 'Outro', emoji: '🔗', cor: '#888' },
]

const TABS = [
  { id: 'users', label: 'Usuários', icon: Users },
  { id: 'popups', label: 'Popups', icon: Megaphone },
  { id: 'products', label: 'Produtos', icon: ShoppingBag },
  { id: 'exercises', label: 'Exercícios', icon: Dumbbell },
  { id: 'suggestions', label: 'Sugestões', icon: MessageSquare },
]

// Helper para converter objeto de base em array linear
const getExercisesFromBase = (baseObj) => {
  const list = []
  Object.keys(baseObj).forEach(grupo => {
    baseObj[grupo].exercicios.forEach(ex => {
      list.push({ ...ex, grupo })
    })
  })
  return list
}

const EXERCISE_CATEGORIES = [
  { key: 'academia', label: '🏋️ Academia', color: '#FFD700', exercises: getExercisesFromBase(BASE) },
  { key: 'calistenia', label: '💪 Calistenia', color: '#42A5F5', exercises: getExercisesFromBase(BASE_CALISTENIA) },
  { key: 'casa', label: '🏠 Casa (Halteres)', color: '#66BB6A', exercises: getExercisesFromBase(BASE_CASA) },
]

function formatLastSeen(dateStr) {
  if (!dateStr) return 'Nunca acessou'
  const date = new Date(dateStr)
  const now = new Date()
  const diffTime = now - date
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))
  const diffHours = Math.floor(diffTime / (1000 * 60 * 60))
  
  if (diffHours < 1) return 'Agora mesmo'
  if (diffHours < 24) return `Há ${diffHours}h`
  if (diffDays === 1) return 'Ontem'
  return `Há ${diffDays} dias`
}

export default function Admin() {
  const [authed, setAuthed] = useState(false)
  const [senha, setSenha] = useState('')
  const [erro, setErro] = useState('')
  const [tab, setTab] = useState('users')
  const [uploadingImg, setUploadingImg] = useState(false)

  // Users
  const [users, setUsers] = useState([])
  const [searchUser, setSearchUser] = useState('')
  const [deleteUserModal, setDeleteUserModal] = useState(null)
  const [deletingUser, setDeletingUser] = useState(false)

  // Suggestions
  const [suggestions, setSuggestions] = useState([])

  // Popups
  const [popups, setPopups] = useState([])
  const [editPopup, setEditPopup] = useState(null)
  const [popupForm, setPopupForm] = useState({ titulo: '', descricao: '', imagem_url: '', botao_texto: 'Saiba mais', botao_link: '', ativo: true })

  // Products (Affiliate)
  const [products, setProducts] = useState([])
  const [editProduct, setEditProduct] = useState(null)
  const [productForm, setProductForm] = useState({ titulo: '', descricao: '', imagens: [], link_afiliado: '', botao_texto: 'Ver Oferta', preco_original: '', preco_promocional: '', loja: 'mercadolivre', ativo: true })
  const [productImgPreview, setProductImgPreview] = useState([])

  // Exercises
  const [exOverrides, setExOverrides] = useState({})
  const [editEx, setEditEx] = useState(null)
  const [exForm, setExForm] = useState({ video_id: '', imagem_url: '', descricao: '', series: '', reps: '', descanso: '' })
  const [exCategory, setExCategory] = useState('academia')

  const login = async () => {
    try {
      const { data } = await supabase.from('admin_config').select('value').eq('key', 'admin_password').single()
      if (data?.value === senha) { setAuthed(true); setErro('') }
      else setErro('Senha incorreta')
    } catch { setErro('Erro ao conectar. Execute o SQL no Supabase primeiro.') }
  }

  useEffect(() => { if (authed) loadTab() }, [authed, tab])

  const loadTab = async () => {
    if (tab === 'users') {
      const { data, error } = await supabase.from('profiles').select('celular, nome, objetivo, nivel, last_seen, peso, altura, genero, created_at').order('created_at', { ascending: false }).limit(200)
      if (error) console.error("Error fetching profiles:", error)
      setUsers(data || [])
    } else if (tab === 'popups') {
      const { data } = await supabase.from('admin_popups').select('*').order('ordem')
      setPopups(data || [])
    } else if (tab === 'products') {
      const { data } = await supabase.from('admin_affiliate_products').select('*').order('ordem')
      setProducts(data || [])
    } else if (tab === 'exercises') {
      const { data } = await supabase.from('admin_exercises').select('*')
      const map = {}
      ;(data || []).forEach(e => { map[e.exercise_id] = e })
      setExOverrides(map)
    } else if (tab === 'suggestions') {
      const { data, error } = await supabase.from('suggestions').select('*').order('created_at', { ascending: false })
      if (error) {
        console.error("Error fetching suggestions with created_at, falling back:", error)
        const fallback = await supabase.from('suggestions').select('*')
        setSuggestions(fallback.data || [])
      } else {
        setSuggestions(data || [])
      }
    }
  }

  const uploadImage = async (file) => {
    try {
      const ext = file.name.split('.').pop()
      const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${ext}`
      const { error } = await supabase.storage.from('admin-assets').upload(fileName, file, { upsert: true })
      if (error) throw error
      const { data: { publicUrl } } = supabase.storage.from('admin-assets').getPublicUrl(fileName)
      return publicUrl
    } catch (error) {
      console.error('Upload error:', error)
      alert('Erro ao fazer upload da imagem.')
      return null
    }
  }

  // ── POPUP CRUD ──
  const handlePopupImageUpload = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploadingImg(true)
    const url = await uploadImage(file)
    if (url) setPopupForm({ ...popupForm, imagem_url: url })
    setUploadingImg(false)
  }

  const savePopup = async () => {
    if (!popupForm.titulo) return
    if (editPopup) {
      await supabase.from('admin_popups').update(popupForm).eq('id', editPopup.id)
    } else {
      await supabase.from('admin_popups').insert(popupForm)
    }
    setEditPopup(null)
    setPopupForm({ titulo: '', descricao: '', imagem_url: '', botao_texto: 'Saiba mais', botao_link: '', ativo: true })
    loadTab()
  }

  const deletePopup = async (id) => {
    if (!confirm('Excluir este popup?')) return
    await supabase.from('admin_popups').delete().eq('id', id)
    loadTab()
  }

  const togglePopup = async (popup) => {
    await supabase.from('admin_popups').update({ ativo: !popup.ativo }).eq('id', popup.id)
    loadTab()
  }

  // ── EXERCISE CRUD ──
  const handleExImageUpload = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploadingImg(true)
    const url = await uploadImage(file)
    if (url) setExForm({ ...exForm, imagem_url: url })
    setUploadingImg(false)
  }

  const saveExercise = async () => {
    if (!editEx) return
    const payload = { exercise_id: editEx.id }
    if (exForm.video_id) payload.video_id = exForm.video_id
    if (exForm.imagem_url) payload.imagem_url = exForm.imagem_url
    if (exForm.descricao) payload.descricao = exForm.descricao
    if (exForm.series) payload.series = Number(exForm.series)
    if (exForm.reps) payload.reps = exForm.reps
    if (exForm.descanso) payload.descanso = Number(exForm.descanso)
    payload.updated_at = new Date().toISOString()

    await supabase.from('admin_exercises').upsert(payload, { onConflict: 'exercise_id' })
    setEditEx(null)
    setExForm({ video_id: '', imagem_url: '', descricao: '', series: '', reps: '', descanso: '' })
    loadTab()
  }

  // ── PRODUCT CRUD ──
  const handleProductImageUpload = async (e) => {
    const files = Array.from(e.target.files || [])
    if (files.length === 0) return
    setUploadingImg(true)
    const newImagens = [...productForm.imagens]
    for (const file of files) {
      const url = await uploadImage(file)
      if (url) newImagens.push(url)
    }
    setProductForm({ ...productForm, imagens: newImagens })
    setUploadingImg(false)
  }

  const removeProductImage = (idx) => {
    const imgs = [...productForm.imagens]
    imgs.splice(idx, 1)
    setProductForm({ ...productForm, imagens: imgs })
  }

  const saveProduct = async () => {
    if (!productForm.titulo || !productForm.link_afiliado) { alert('Título e link de afiliado são obrigatórios!'); return }
    const payload = {
      titulo: productForm.titulo,
      descricao: productForm.descricao || null,
      imagens: productForm.imagens,
      link_afiliado: productForm.link_afiliado,
      botao_texto: productForm.botao_texto || 'Ver Oferta',
      preco_original: productForm.preco_original || null,
      preco_promocional: productForm.preco_promocional || null,
      loja: productForm.loja,
      ativo: productForm.ativo
    }
    if (editProduct) {
      await supabase.from('admin_affiliate_products').update(payload).eq('id', editProduct.id)
    } else {
      await supabase.from('admin_affiliate_products').insert(payload)
    }
    setEditProduct(null)
    setProductForm({ titulo: '', descricao: '', imagens: [], link_afiliado: '', botao_texto: 'Ver Oferta', preco_original: '', preco_promocional: '', loja: 'mercadolivre', ativo: true })
    loadTab()
  }

  const deleteProduct = async (id) => {
    if (!confirm('Excluir este produto?')) return
    await supabase.from('admin_affiliate_products').delete().eq('id', id)
    loadTab()
  }

  const toggleProduct = async (product) => {
    await supabase.from('admin_affiliate_products').update({ ativo: !product.ativo }).eq('id', product.id)
    loadTab()
  }

  const filteredUsers = users.filter(u =>
    !searchUser || u.nome?.toLowerCase().includes(searchUser.toLowerCase()) || u.celular?.includes(searchUser)
  )

  const deleteUser = async (celular) => {
    setDeletingUser(true)
    try {
      // Remove dados relacionados ao usuário em todas as tabelas
      await Promise.all([
        supabase.from('workout_logs').delete().eq('celular', celular),
        supabase.from('water_logs').delete().eq('celular', celular),
        supabase.from('activity_logs').delete().eq('celular', celular),
        supabase.from('suggestions').delete().eq('user_celular', celular),
      ])
      // Remove o perfil principal
      await supabase.from('profiles').delete().eq('celular', celular)
      console.log('✅ Usuário e dados removidos:', celular)
    } catch (e) {
      console.error('Erro ao excluir usuário:', e)
      alert('Erro ao excluir. Tente novamente.')
    }
    setDeletingUser(false)
    setDeleteUserModal(null)
    loadTab()
  }

  const deleteSuggestion = async (id) => {
    if (!confirm('Excluir esta sugestão?')) return
    await supabase.from('suggestions').delete().eq('id', id)
    loadTab()
  }

  // ── STYLES ──
  const card = { background: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: '16px', padding: '20px' }
  const input = { width: '100%', background: '#111', border: '1px solid #333', borderRadius: '10px', color: '#fff', padding: '12px', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }
  const btnPrimary = { background: 'linear-gradient(135deg, #FFD700, #FFA500)', border: 'none', borderRadius: '12px', color: '#000', fontWeight: 'bold', padding: '12px 24px', cursor: 'pointer', fontSize: '14px' }
  const btnDanger = { background: 'rgba(229,57,53,0.15)', border: '1px solid rgba(229,57,53,0.3)', borderRadius: '10px', color: '#e53935', padding: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }

  // ── LOGIN SCREEN ──
  if (!authed) return (
    <div style={{ minHeight: '100vh', background: '#080808', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
      <div style={{ ...card, maxWidth: '400px', width: '100%', textAlign: 'center' }}>
        <div style={{ width: '60px', height: '60px', background: 'linear-gradient(135deg, #FFD700, #FFA500)', borderRadius: '18px', margin: '0 auto 16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Dumbbell size={30} color="#000" />
        </div>
        <h2 style={{ color: '#fff', margin: '0 0 6px' }}>Painel Admin</h2>
        <p style={{ color: '#666', fontSize: '13px', margin: '0 0 20px' }}>Bronks Gym — Acesso restrito</p>
        <input type="password" value={senha} onChange={e => setSenha(e.target.value)} onKeyDown={e => e.key === 'Enter' && login()}
          placeholder="Senha de admin" style={{ ...input, marginBottom: '12px', textAlign: 'center' }} />
        {erro && <p style={{ color: '#e53935', fontSize: '12px', margin: '0 0 12px' }}>{erro}</p>}
        <button onClick={login} style={{ ...btnPrimary, width: '100%' }}>Entrar</button>
        <p style={{ color: '#444', fontSize: '11px', marginTop: '16px' }}>
          <a href="/" style={{ color: '#FFD700', textDecoration: 'none' }}>← Voltar ao app</a>
        </p>
      </div>
    </div>
  )

  // ── MAIN ADMIN ──
  return (
    <div style={{ minHeight: '100vh', background: '#080808', color: '#fff', paddingBottom: '40px' }}>
      {/* Header */}
      <div style={{ padding: '20px', borderBottom: '1px solid #1a1a1a', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <a href="/" style={{ color: '#888', display: 'flex' }}><ArrowLeft size={20} /></a>
          <h1 style={{ margin: 0, fontSize: '20px', fontWeight: '900' }}>Bronks <span style={{ color: '#FFD700' }}>Admin</span></h1>
        </div>
        <span style={{ color: '#666', fontSize: '12px' }}>{users.length} usuários</span>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', padding: '12px 20px', gap: '8px', borderBottom: '1px solid #1a1a1a', overflowX: 'auto' }}>
        {TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} style={{
            display: 'flex', alignItems: 'center', gap: '6px', padding: '10px 18px', borderRadius: '12px', border: 'none', cursor: 'pointer', fontWeight: 'bold', fontSize: '13px', whiteSpace: 'nowrap',
            background: tab === t.id ? '#FFD700' : 'rgba(255,255,255,0.05)', color: tab === t.id ? '#000' : '#888'
          }}>
            <t.icon size={16} /> {t.label}
          </button>
        ))}
      </div>

      <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>

        {/* ═══ TAB: USUÁRIOS ═══ */}
        {tab === 'users' && (
          <div>
            <div style={{ position: 'relative', marginBottom: '16px' }}>
              <Search size={16} color="#666" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
              <input value={searchUser} onChange={e => setSearchUser(e.target.value)} placeholder="Buscar por nome ou celular..." style={{ ...input, paddingLeft: '40px' }} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {filteredUsers.map(u => (
                <div key={u.celular} style={{ ...card, padding: '14px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1 }}>
                    <div style={{ width: '45px', height: '45px', borderRadius: '12px', background: '#FFD70020', border: '1px solid #FFD70040', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', flexShrink: 0 }}>
                      {u.avatar_url ? <img src={u.avatar_url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <span style={{ color: '#FFD700', fontWeight: 'bold' }}>{u.nome?.charAt(0) || '?'}</span>}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 'bold', fontSize: '15px', color: '#fff' }}>{u.nome || 'Sem nome'}</div>
                      <div style={{ color: '#888', fontSize: '12px', marginTop: '2px', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                        <span>📱 {u.celular}</span>
                        <span>🎯 {u.objetivo || '—'}</span>
                        <span>🔥 {u.nivel || '—'}</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#66BB6A', fontSize: '11px', marginTop: '6px', fontWeight: 'bold' }}>
                        <Clock size={12} /> Último acesso: {formatLastSeen(u.last_seen)}
                      </div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ textAlign: 'right', flexShrink: 0, paddingLeft: '12px', borderLeft: '1px solid #333' }}>
                      <div style={{ color: '#FFD700', fontSize: '16px', fontWeight: 'bold' }}>{u.peso || '--'} kg</div>
                      <div style={{ color: '#888', fontSize: '11px' }}>{u.altura || '--'} cm</div>
                      <div style={{ color: '#555', fontSize: '11px', marginTop: '4px' }}>{u.genero === 'feminino' ? '👩' : '👨'}</div>
                    </div>
                    <button onClick={() => setDeleteUserModal(u)} style={{ ...btnDanger, padding: '8px', borderRadius: '10px', flexShrink: 0 }}>
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
              {filteredUsers.length === 0 && <p style={{ color: '#555', textAlign: 'center', padding: '40px 0' }}>Nenhum usuário encontrado</p>}
            </div>

            {/* Modal de Confirmação de Exclusão de Usuário */}
            {deleteUserModal && (
              <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '20px' }}>
                <div style={{ ...card, maxWidth: '420px', width: '100%', textAlign: 'center' }}>
                  <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: 'rgba(229,57,53,0.15)', border: '2px solid rgba(229,57,53,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                    <Trash2 size={26} color="#e53935" />
                  </div>
                  <h3 style={{ color: '#fff', margin: '0 0 8px', fontSize: '18px' }}>Excluir Usuário</h3>
                  <p style={{ color: '#aaa', fontSize: '14px', margin: '0 0 6px', lineHeight: 1.5 }}>
                    Tem certeza que deseja excluir <strong style={{ color: '#FFD700' }}>{deleteUserModal.nome || 'este usuário'}</strong>?
                  </p>
                  <p style={{ color: '#e53935', fontSize: '12px', margin: '0 0 20px' }}>
                    ⚠️ Isso removerá TODOS os dados: perfil, treinos, água, atividades e sugestões.
                  </p>
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <button onClick={() => setDeleteUserModal(null)} disabled={deletingUser} style={{ flex: 1, background: '#222', border: '1px solid #333', borderRadius: '12px', padding: '12px', color: '#fff', fontWeight: 'bold', fontSize: '14px', cursor: 'pointer' }}>
                      Cancelar
                    </button>
                    <button onClick={() => deleteUser(deleteUserModal.celular)} disabled={deletingUser} style={{ flex: 1, background: 'linear-gradient(135deg, #e53935, #c62828)', border: 'none', borderRadius: '12px', padding: '12px', color: '#fff', fontWeight: 'bold', fontSize: '14px', cursor: 'pointer', opacity: deletingUser ? 0.6 : 1 }}>
                      {deletingUser ? 'Excluindo...' : '🗑️ Excluir'}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ═══ TAB: POPUPS ═══ */}
        {tab === 'popups' && (
          <div>
            {/* Formulário */}
            <div style={{ ...card, marginBottom: '20px' }}>
              <h3 style={{ margin: '0 0 16px', fontSize: '16px', color: '#FFD700' }}>{editPopup ? '✏️ Editar Popup' : '➕ Novo Popup Promocional'}</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <input value={popupForm.titulo} onChange={e => setPopupForm({ ...popupForm, titulo: e.target.value })} placeholder="Título (ex: Oferta de Whey Protein)" style={input} />
                <textarea value={popupForm.descricao} onChange={e => setPopupForm({ ...popupForm, descricao: e.target.value })} placeholder="Descrição detalhada..." rows={3} style={{ ...input, resize: 'vertical' }} />
                
                <div style={{ background: '#111', padding: '12px', borderRadius: '10px', border: '1px solid #333' }}>
                  <label style={{ color: '#888', fontSize: '12px', fontWeight: 'bold', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <span>IMAGEM DO BANNER</span>
                    <label style={{ color: '#FFD700', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      {uploadingImg ? 'Enviando...' : <><Upload size={14}/> Fazer Upload</>}
                      <input type="file" accept="image/*" style={{ display: 'none' }} onChange={handlePopupImageUpload} disabled={uploadingImg}/>
                    </label>
                  </label>
                  {popupForm.imagem_url ? (
                    <div style={{ position: 'relative' }}>
                      <img src={popupForm.imagem_url} style={{ width: '100%', maxHeight: '180px', objectFit: 'cover', borderRadius: '8px' }} />
                      <button onClick={() => setPopupForm({ ...popupForm, imagem_url: '' })} style={{ position: 'absolute', top: 8, right: 8, background: 'rgba(0,0,0,0.7)', border: 'none', borderRadius: '50%', width: 28, height: 28, color: '#fff', cursor: 'pointer' }}><X size={14}/></button>
                    </div>
                  ) : (
                    <div style={{ height: '80px', border: '1px dashed #333', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#555', fontSize: '12px' }}>
                      Nenhuma imagem selecionada
                    </div>
                  )}
                  <input value={popupForm.imagem_url} onChange={e => setPopupForm({ ...popupForm, imagem_url: e.target.value })} placeholder="Ou cole a URL da imagem aqui..." style={{ ...input, marginTop: '8px', padding: '8px', fontSize: '12px' }} />
                </div>

                <div style={{ display: 'flex', gap: '10px' }}>
                  <input value={popupForm.botao_texto} onChange={e => setPopupForm({ ...popupForm, botao_texto: e.target.value })} placeholder="Texto do botão" style={{ ...input, flex: 1 }} />
                  <input value={popupForm.botao_link} onChange={e => setPopupForm({ ...popupForm, botao_link: e.target.value })} placeholder="Link do botão (URL WhatsApp, Loja...)" style={{ ...input, flex: 2 }} />
                </div>
                
                <div style={{ display: 'flex', gap: '10px', marginTop: '6px' }}>
                  <button onClick={savePopup} style={{ ...btnPrimary, flex: 1 }}><Save size={14} style={{ marginRight: 6, verticalAlign: 'middle' }} />{editPopup ? 'Atualizar Popup' : 'Criar Popup'}</button>
                  {editPopup && <button onClick={() => { setEditPopup(null); setPopupForm({ titulo: '', descricao: '', imagem_url: '', botao_texto: 'Saiba mais', botao_link: '', ativo: true }) }} style={{ ...input, flex: 0, width: 'auto', padding: '12px 18px', cursor: 'pointer', textAlign: 'center' }}>Cancelar</button>}
                </div>
              </div>
            </div>

            {/* Lista de popups */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {popups.map(p => (
                <div key={p.id} style={{ ...card, padding: '14px', opacity: p.ativo ? 1 : 0.5 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px' }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                        <span style={{ fontWeight: 'bold', fontSize: '14px' }}>{p.titulo}</span>
                        <span style={{ background: p.ativo ? 'rgba(76,175,80,0.2)' : 'rgba(229,57,53,0.2)', color: p.ativo ? '#66BB6A' : '#e53935', fontSize: '10px', fontWeight: 'bold', padding: '2px 8px', borderRadius: '6px' }}>{p.ativo ? 'ATIVO' : 'INATIVO'}</span>
                      </div>
                      {p.descricao && <p style={{ color: '#888', fontSize: '12px', margin: '4px 0' }}>{p.descricao}</p>}
                      {p.botao_link && <p style={{ color: '#42A5F5', fontSize: '11px', margin: '2px 0' }}>{p.botao_link}</p>}
                    </div>
                    {p.imagem_url && <img src={p.imagem_url} style={{ width: '60px', height: '60px', borderRadius: '10px', objectFit: 'cover', flexShrink: 0 }} />}
                  </div>
                  
                  {/* Métricas do Popup */}
                  <div style={{ display: 'flex', gap: '16px', marginTop: '12px', background: '#0a0a0a', padding: '10px', borderRadius: '8px', border: '1px solid #1a1a1a' }}>
                    <div>
                      <div style={{ color: '#888', fontSize: '10px', fontWeight: 'bold' }}>CLIQUES (LINK)</div>
                      <div style={{ color: '#66BB6A', fontSize: '16px', fontWeight: 'bold' }}>{p.cliques || 0}</div>
                    </div>
                    <div>
                      <div style={{ color: '#888', fontSize: '10px', fontWeight: 'bold' }}>CANCELADOS (FECHAR)</div>
                      <div style={{ color: '#e53935', fontSize: '16px', fontWeight: 'bold' }}>{p.cancelamentos || 0}</div>
                    </div>
                    <div>
                      <div style={{ color: '#888', fontSize: '10px', fontWeight: 'bold' }}>CONVERSÃO (CTR)</div>
                      <div style={{ color: '#FFD700', fontSize: '16px', fontWeight: 'bold' }}>
                        {((p.cliques || 0) + (p.cancelamentos || 0)) > 0 
                          ? Math.round(((p.cliques || 0) / ((p.cliques || 0) + (p.cancelamentos || 0))) * 100) + '%' 
                          : '0%'}
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '8px', marginTop: '10px' }}>
                    <button onClick={() => togglePopup(p)} style={{ ...btnDanger, background: p.ativo ? 'rgba(229,57,53,0.1)' : 'rgba(76,175,80,0.1)', border: `1px solid ${p.ativo ? 'rgba(229,57,53,0.3)' : 'rgba(76,175,80,0.3)'}`, color: p.ativo ? '#e53935' : '#66BB6A', padding: '6px 12px', fontSize: '11px', fontWeight: 'bold' }}>
                      {p.ativo ? <><EyeOff size={12} style={{ marginRight: 4 }} />Desativar</> : <><Eye size={12} style={{ marginRight: 4 }} />Ativar</>}
                    </button>
                    <button onClick={() => { setEditPopup(p); setPopupForm({ titulo: p.titulo, descricao: p.descricao || '', imagem_url: p.imagem_url || '', botao_texto: p.botao_texto || 'Saiba mais', botao_link: p.botao_link || '', ativo: p.ativo }) }} style={{ background: 'rgba(255,215,0,0.1)', border: '1px solid rgba(255,215,0,0.3)', borderRadius: '10px', color: '#FFD700', padding: '6px 12px', cursor: 'pointer', fontSize: '11px', fontWeight: 'bold', display: 'flex', alignItems: 'center' }}>
                      <Edit size={12} style={{ marginRight: 4 }} />Editar
                    </button>
                    <button onClick={() => deletePopup(p.id)} style={{ ...btnDanger, padding: '6px 12px', fontSize: '11px', fontWeight: 'bold' }}>
                      <Trash2 size={12} style={{ marginRight: 4 }} />Excluir
                    </button>
                  </div>
                </div>
              ))}
              {popups.length === 0 && <p style={{ color: '#555', textAlign: 'center', padding: '40px 0' }}>Nenhum popup criado ainda. Crie o primeiro acima!</p>}
            </div>
          </div>
        )}

        {/* ═══ TAB: PRODUTOS AFILIADOS ═══ */}
        {tab === 'products' && (
          <div>
            {/* Formulário */}
            <div style={{ ...card, marginBottom: '20px' }}>
              <h3 style={{ margin: '0 0 16px', fontSize: '16px', color: '#FFD700' }}>{editProduct ? '✏️ Editar Produto' : '🛒 Novo Produto Afiliado'}</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <input value={productForm.titulo} onChange={e => setProductForm({ ...productForm, titulo: e.target.value })} placeholder="Título do produto (ex: Whey Protein 1kg Growth)" style={input} />
                <textarea value={productForm.descricao} onChange={e => setProductForm({ ...productForm, descricao: e.target.value })} placeholder="Descrição curta (opcional)..." rows={2} style={{ ...input, resize: 'vertical' }} />

                {/* Seletor de Loja */}
                <div>
                  <label style={{ color: '#888', fontSize: '11px', fontWeight: 'bold', display: 'block', marginBottom: '6px' }}>LOJA / MARKETPLACE</label>
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    {LOJAS.map(l => (
                      <button key={l.key} onClick={() => setProductForm({ ...productForm, loja: l.key })} style={{
                        padding: '8px 16px', borderRadius: '10px', border: 'none', cursor: 'pointer', fontWeight: 'bold', fontSize: '12px',
                        background: productForm.loja === l.key ? l.cor + '25' : '#111',
                        color: productForm.loja === l.key ? l.cor : '#888',
                        border: `1px solid ${productForm.loja === l.key ? l.cor + '60' : '#333'}`,
                      }}>
                        {l.emoji} {l.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Imagens do Produto */}
                <div style={{ background: '#111', padding: '12px', borderRadius: '10px', border: '1px solid #333' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <label style={{ color: '#888', fontSize: '11px', fontWeight: 'bold' }}>IMAGENS DO PRODUTO (carrossel)</label>
                    <label style={{ color: '#FFD700', cursor: 'pointer', fontSize: '11px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      {uploadingImg ? 'Enviando...' : <><Upload size={12}/> Adicionar Imagens</>}
                      <input type="file" accept="image/*" multiple style={{ display: 'none' }} onChange={handleProductImageUpload} disabled={uploadingImg}/>
                    </label>
                  </div>
                  {productForm.imagens.length > 0 ? (
                    <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '8px' }}>
                      {productForm.imagens.map((img, idx) => (
                        <div key={idx} style={{ position: 'relative', flexShrink: 0, width: '100px', height: '100px', borderRadius: '10px', overflow: 'hidden', border: '1px solid #333' }}>
                          <img src={img} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          <button onClick={() => removeProductImage(idx)} style={{ position: 'absolute', top: 4, right: 4, background: 'rgba(0,0,0,0.7)', border: 'none', borderRadius: '50%', width: 22, height: 22, color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0 }}><X size={12}/></button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div style={{ height: '80px', border: '1px dashed #333', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#555', fontSize: '12px' }}>
                      Nenhuma imagem — adicione fotos do produto
                    </div>
                  )}
                  <input value={productForm.imagens.join(', ')} readOnly placeholder="URLs das imagens..." style={{ ...input, marginTop: '8px', padding: '8px', fontSize: '11px', color: '#555' }} />
                </div>

                {/* Preços */}
                <div style={{ display: 'flex', gap: '10px' }}>
                  <div style={{ flex: 1 }}>
                    <label style={{ color: '#888', fontSize: '11px', fontWeight: 'bold', display: 'block', marginBottom: '4px' }}>PREÇO ORIGINAL</label>
                    <input value={productForm.preco_original} onChange={e => setProductForm({ ...productForm, preco_original: e.target.value })} placeholder="R$ 199,90" style={input} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <label style={{ color: '#888', fontSize: '11px', fontWeight: 'bold', display: 'block', marginBottom: '4px' }}>PREÇO PROMOCIONAL</label>
                    <input value={productForm.preco_promocional} onChange={e => setProductForm({ ...productForm, preco_promocional: e.target.value })} placeholder="R$ 129,90" style={input} />
                  </div>
                </div>

                {/* Link e Botão */}
                <div>
                  <label style={{ color: '#888', fontSize: '11px', fontWeight: 'bold', display: 'block', marginBottom: '4px' }}>LINK DE AFILIADO *</label>
                  <input value={productForm.link_afiliado} onChange={e => setProductForm({ ...productForm, link_afiliado: e.target.value })} placeholder="https://mercadolivre.com.br/seu-link-afiliado..." style={input} />
                </div>
                <input value={productForm.botao_texto} onChange={e => setProductForm({ ...productForm, botao_texto: e.target.value })} placeholder="Texto do botão (ex: Ver Oferta)" style={input} />

                <div style={{ display: 'flex', gap: '10px', marginTop: '6px' }}>
                  <button onClick={saveProduct} style={{ ...btnPrimary, flex: 1 }}><Save size={14} style={{ marginRight: 6, verticalAlign: 'middle' }} />{editProduct ? 'Atualizar Produto' : 'Cadastrar Produto'}</button>
                  {editProduct && <button onClick={() => { setEditProduct(null); setProductForm({ titulo: '', descricao: '', imagens: [], link_afiliado: '', botao_texto: 'Ver Oferta', preco_original: '', preco_promocional: '', loja: 'mercadolivre', ativo: true }) }} style={{ ...input, flex: 0, width: 'auto', padding: '12px 18px', cursor: 'pointer', textAlign: 'center' }}>Cancelar</button>}
                </div>
              </div>
            </div>

            {/* Lista de Produtos */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {products.map(p => {
                const loja = LOJAS.find(l => l.key === p.loja) || LOJAS[3]
                return (
                  <div key={p.id} style={{ ...card, padding: '14px', opacity: p.ativo ? 1 : 0.5 }}>
                    <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                      {/* Thumbnail */}
                      <div style={{ width: '70px', height: '70px', borderRadius: '12px', overflow: 'hidden', background: '#000', border: '1px solid #333', flexShrink: 0 }}>
                        {p.imagens?.length > 0 ? (
                          <img src={p.imagens[0]} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        ) : (
                          <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><ShoppingBag size={24} color="#333" /></div>
                        )}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                          <span style={{ fontWeight: 'bold', fontSize: '14px' }}>{p.titulo}</span>
                          <span style={{ background: p.ativo ? 'rgba(76,175,80,0.2)' : 'rgba(229,57,53,0.2)', color: p.ativo ? '#66BB6A' : '#e53935', fontSize: '10px', fontWeight: 'bold', padding: '2px 8px', borderRadius: '6px' }}>{p.ativo ? 'ATIVO' : 'INATIVO'}</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                          <span style={{ background: loja.cor + '20', color: loja.cor, fontSize: '10px', fontWeight: 'bold', padding: '2px 8px', borderRadius: '6px' }}>{loja.emoji} {loja.label}</span>
                          <span style={{ color: '#888', fontSize: '11px' }}>{p.imagens?.length || 0} imagem(ns)</span>
                        </div>
                        {p.preco_promocional && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            {p.preco_original && <span style={{ color: '#666', fontSize: '12px', textDecoration: 'line-through' }}>{p.preco_original}</span>}
                            <span style={{ color: '#66BB6A', fontSize: '14px', fontWeight: 'bold' }}>{p.preco_promocional}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Métricas */}
                    <div style={{ display: 'flex', gap: '16px', marginTop: '12px', background: '#0a0a0a', padding: '10px', borderRadius: '8px', border: '1px solid #1a1a1a' }}>
                      <div>
                        <div style={{ color: '#888', fontSize: '10px', fontWeight: 'bold' }}>CLIQUES</div>
                        <div style={{ color: '#66BB6A', fontSize: '16px', fontWeight: 'bold' }}>{p.cliques || 0}</div>
                      </div>
                      <div style={{ flex: 1, display: 'flex', alignItems: 'center' }}>
                        <a href={p.link_afiliado} target="_blank" rel="noopener noreferrer" style={{ color: '#42A5F5', fontSize: '11px', wordBreak: 'break-all', display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <ExternalLink size={12}/> {p.link_afiliado?.substring(0, 50)}...
                        </a>
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '8px', marginTop: '10px' }}>
                      <button onClick={() => toggleProduct(p)} style={{ ...btnDanger, background: p.ativo ? 'rgba(229,57,53,0.1)' : 'rgba(76,175,80,0.1)', border: `1px solid ${p.ativo ? 'rgba(229,57,53,0.3)' : 'rgba(76,175,80,0.3)'}`, color: p.ativo ? '#e53935' : '#66BB6A', padding: '6px 12px', fontSize: '11px', fontWeight: 'bold' }}>
                        {p.ativo ? <><EyeOff size={12} style={{ marginRight: 4 }} />Desativar</> : <><Eye size={12} style={{ marginRight: 4 }} />Ativar</>}
                      </button>
                      <button onClick={() => {
                        setEditProduct(p)
                        setProductForm({
                          titulo: p.titulo, descricao: p.descricao || '', imagens: p.imagens || [], link_afiliado: p.link_afiliado || '',
                          botao_texto: p.botao_texto || 'Ver Oferta', preco_original: p.preco_original || '', preco_promocional: p.preco_promocional || '',
                          loja: p.loja || 'outro', ativo: p.ativo
                        })
                      }} style={{ background: 'rgba(255,215,0,0.1)', border: '1px solid rgba(255,215,0,0.3)', borderRadius: '10px', color: '#FFD700', padding: '6px 12px', cursor: 'pointer', fontSize: '11px', fontWeight: 'bold', display: 'flex', alignItems: 'center' }}>
                        <Edit size={12} style={{ marginRight: 4 }} />Editar
                      </button>
                      <button onClick={() => deleteProduct(p.id)} style={{ ...btnDanger, padding: '6px 12px', fontSize: '11px', fontWeight: 'bold' }}>
                        <Trash2 size={12} style={{ marginRight: 4 }} />Excluir
                      </button>
                    </div>
                  </div>
                )
              })}
              {products.length === 0 && <p style={{ color: '#555', textAlign: 'center', padding: '40px 0' }}>Nenhum produto cadastrado. Adicione o primeiro acima!</p>}
            </div>
          </div>
        )}

        {/* ═══ TAB: EXERCÍCIOS ═══ */}
        {tab === 'exercises' && (
          <div>
            {editEx ? (
              <div style={card}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                  <h3 style={{ margin: 0, fontSize: '18px', color: '#FFD700', fontWeight: '900' }}>✏️ Editando: {editEx.nome}</h3>
                  <button onClick={() => setEditEx(null)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#888' }}><X size={24} /></button>
                </div>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  
                  {/* PREVIEWS */}
                  <div style={{ display: 'flex', gap: '16px', flexDirection: 'row', '@media(max-width: 600px)': { flexDirection: 'column' } }}>
                    
                    {/* Imagem Section */}
                    <div style={{ flex: 1, background: '#111', borderRadius: '12px', padding: '14px', border: '1px solid #333' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                        <label style={{ color: '#888', fontSize: '11px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '4px' }}><ImageIcon size={14}/> IMAGEM</label>
                        <label style={{ color: '#FFD700', cursor: 'pointer', fontSize: '11px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '4px' }}>
                          {uploadingImg ? 'Subindo...' : <><Upload size={12}/> Upar Nova</>}
                          <input type="file" accept="image/*" style={{ display: 'none' }} onChange={handleExImageUpload} disabled={uploadingImg}/>
                        </label>
                      </div>
                      <div style={{ width: '100%', height: '140px', borderRadius: '8px', overflow: 'hidden', background: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        {exForm.imagem_url ? (
                          <img src={exForm.imagem_url} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                        ) : (
                          <ImageIcon size={30} color="#333" />
                        )}
                      </div>
                      <input value={exForm.imagem_url} onChange={e => setExForm({ ...exForm, imagem_url: e.target.value })} placeholder="Ou cole a URL..." style={{ ...input, marginTop: '10px', padding: '8px', fontSize: '12px' }} />
                    </div>

                    {/* Vídeo Section */}
                    <div style={{ flex: 1, background: '#111', borderRadius: '12px', padding: '14px', border: '1px solid #333' }}>
                      <label style={{ color: '#888', fontSize: '11px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '10px' }}><Video size={14}/> ID DO VÍDEO (YOUTUBE)</label>
                      <div style={{ width: '100%', height: '140px', borderRadius: '8px', overflow: 'hidden', background: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
                        {exForm.video_id ? (
                          <>
                            <img src={`https://img.youtube.com/vi/${exForm.video_id}/hqdefault.jpg`} style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.7 }} />
                            <div style={{ position: 'absolute', width: '40px', height: '40px', background: 'rgba(255,0,0,0.8)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                              <div style={{ width: 0, height: 0, borderTop: '8px solid transparent', borderBottom: '8px solid transparent', borderLeft: '12px solid white', marginLeft: '4px' }}></div>
                            </div>
                          </>
                        ) : (
                          <Video size={30} color="#333" />
                        )}
                      </div>
                      <input value={exForm.video_id} onChange={e => setExForm({ ...exForm, video_id: e.target.value })} placeholder="Ex: VmB1G1K7v94" style={{ ...input, marginTop: '10px', padding: '8px', fontSize: '12px' }} />
                    </div>

                  </div>

                  <div>
                    <label style={{ color: '#888', fontSize: '11px', fontWeight: 'bold', display: 'block', marginBottom: '4px' }}>DESCRIÇÃO / DICAS DE EXECUÇÃO</label>
                    <textarea value={exForm.descricao} onChange={e => setExForm({ ...exForm, descricao: e.target.value })} rows={3} placeholder="Instruções para o aluno..." style={{ ...input, resize: 'vertical' }} />
                  </div>
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <div style={{ flex: 1 }}>
                      <label style={{ color: '#888', fontSize: '11px', fontWeight: 'bold', display: 'block', marginBottom: '4px' }}>SÉRIES</label>
                      <input type="number" value={exForm.series} onChange={e => setExForm({ ...exForm, series: e.target.value })} placeholder="4" style={input} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <label style={{ color: '#888', fontSize: '11px', fontWeight: 'bold', display: 'block', marginBottom: '4px' }}>REPS</label>
                      <input value={exForm.reps} onChange={e => setExForm({ ...exForm, reps: e.target.value })} placeholder="8-12" style={input} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <label style={{ color: '#888', fontSize: '11px', fontWeight: 'bold', display: 'block', marginBottom: '4px' }}>DESCANSO (s)</label>
                      <input type="number" value={exForm.descanso} onChange={e => setExForm({ ...exForm, descanso: e.target.value })} placeholder="90" style={input} />
                    </div>
                  </div>
                  <button onClick={saveExercise} style={{ ...btnPrimary, marginTop: '10px', padding: '16px' }}><Save size={16} style={{ marginRight: 6, verticalAlign: 'middle' }} />Salvar Alterações do Exercício</button>
                </div>
              </div>
            ) : (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                  <p style={{ color: '#888', fontSize: '13px', margin: 0 }}>Selecione um exercício para personalizar vídeos e imagens.</p>
                </div>
                
                {/* Seletor de categoria */}
                <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', overflowX: 'auto', paddingBottom: '4px' }}>
                  {EXERCISE_CATEGORIES.map(cat => (
                    <button key={cat.key} onClick={() => setExCategory(cat.key)} style={{
                      padding: '10px 18px', borderRadius: '12px', border: 'none', cursor: 'pointer', fontWeight: 'bold', fontSize: '13px', whiteSpace: 'nowrap',
                      background: exCategory === cat.key ? cat.color + '25' : '#111',
                      color: exCategory === cat.key ? cat.color : '#888',
                      border: exCategory === cat.key ? `1px solid ${cat.color}50` : '1px solid #333',
                      transition: 'all 0.2s'
                    }}>{cat.label}</button>
                  ))}
                </div>

                {(() => {
                  const cat = EXERCISE_CATEGORIES.find(c => c.key === exCategory)
                  const grupos = [...new Set(cat.exercises.map(e => e.grupo))]
                  return grupos.map(grupo => (
                    <div key={grupo} style={{ marginBottom: '20px' }}>
                      <h3 style={{ color: cat.color, fontSize: '14px', fontWeight: '900', margin: '0 0 10px', letterSpacing: '1px' }}>TREINO {grupo}</h3>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {cat.exercises.filter(e => e.grupo === grupo).map(ex => {
                          const ov = exOverrides[ex.id]
                          return (
                            <div key={ex.id} onClick={() => {
                              setEditEx(ex)
                              setExForm({
                                video_id: ov?.video_id || ex.videoId || '', 
                                imagem_url: ov?.imagem_url || ex.img || '',
                                descricao: ov?.descricao || ex.descricao || '', 
                                series: ov?.series || ex.series || '', 
                                reps: ov?.reps || ex.reps || '', 
                                descanso: ov?.descanso || ex.descanso || ''
                              })
                            }} style={{ ...card, padding: '12px 16px', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', transition: 'transform 0.2s, border 0.2s', border: ov ? `1px solid ${cat.color}50` : '1px solid #2a2a2a' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                                <div style={{ width: '40px', height: '40px', borderRadius: '8px', overflow: 'hidden', background: '#000', border: '1px solid #333' }}>
                                  <img src={ov?.imagem_url || ex.img} style={{ width: '100%', height: '100%', objectFit: 'contain' }} onError={e=>e.target.style.display='none'}/>
                                </div>
                                <div>
                                  <div style={{ fontWeight: 'bold', fontSize: '14px', color: '#fff' }}>{ex.nome}</div>
                                  <div style={{ color: ov ? cat.color : '#666', fontSize: '11px', marginTop: '2px', fontWeight: ov ? 'bold' : 'normal' }}>
                                    ID: {ex.id} {ov && ' • Customizado'}
                                  </div>
                                </div>
                              </div>
                              <Edit size={18} color={ov ? cat.color : '#555'} />
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  ))
                })()}
              </div>
            )}
          </div>
        )}

        {/* ═══ TAB: SUGESTÕES ═══ */}
        {tab === 'suggestions' && (
          <div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {suggestions.map(s => (
                <div key={s.id} style={{ ...card, padding: '16px', position: 'relative' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'rgba(255,215,0,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#FFD700', fontWeight: 'bold' }}>
                        {s.user_nome?.charAt(0) || '?'}
                      </div>
                      <div>
                        <div style={{ color: '#fff', fontSize: '14px', fontWeight: 'bold' }}>{s.user_nome || 'Anônimo'}</div>
                        <div style={{ color: '#888', fontSize: '11px' }}>{s.user_celular || ''}</div>
                      </div>
                    </div>
                    <div style={{ color: '#555', fontSize: '11px' }}>
                      {s.created_at ? `${new Date(s.created_at).toLocaleDateString('pt-BR')} às ${new Date(s.created_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}` : 'Data não registrada'}
                    </div>
                  </div>
                  <div style={{ background: '#111', padding: '12px', borderRadius: '8px', border: '1px solid #222', color: '#ccc', fontSize: '14px', lineHeight: '1.5' }}>
                    {s.texto}
                  </div>
                  <button onClick={() => deleteSuggestion(s.id)} style={{ position: 'absolute', top: '16px', right: '16px', background: 'transparent', border: 'none', color: '#e53935', cursor: 'pointer', padding: '4px' }}>
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
              {suggestions.length === 0 && <p style={{ color: '#555', textAlign: 'center', padding: '40px 0' }}>Nenhuma sugestão recebida ainda.</p>}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
