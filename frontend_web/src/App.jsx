import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  Activity, ArrowRight, ArrowUpRight, Bell, BookOpen,
  BriefcaseBusiness, ChevronDown, CircleHelp, FileText, FlaskConical,
  FolderKanban, GraduationCap, LayoutDashboard, Library, LogOut, Menu,
  MessageCircle, Plus, Search, Settings2, ShieldCheck, Sparkles, Users, X,
} from 'lucide-react'
import brandLogo from './assets/logo_wuro.jpeg'
import './App.css'

const API_URL = (import.meta.env.VITE_API_URL || 'https://wuroen-app.onrender.com/api').replace(/\/$/, '')
const sections = [
  { id: 'overview', label: 'Vue d’ensemble', icon: LayoutDashboard },
  { id: 'articles', label: 'Articles', icon: FileText },
  { id: 'library', label: 'Bibliothèque', icon: Library },
  { id: 'tools', label: 'Outils', icon: FlaskConical },
]
const firstName = (name = '') => name.trim().split(/\s+/)[0] || 'vous'
const dateLabel = new Intl.DateTimeFormat('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' }).format(new Date())

async function request(path, token, options = {}) {
  const send = (accessToken) => fetch(`${API_URL}${path}`, {
    ...options,
    credentials: 'include',
    headers: {
      ...(options.body ? { 'Content-Type': 'application/json' } : {}),
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
      ...options.headers,
    },
  })
  let response = await send(token)
  if (response.status === 401 && token && path !== '/auth/refresh') {
    const refreshed = await fetch(`${API_URL}/auth/refresh`, { method: 'POST', credentials: 'include' }).catch(() => null)
    if (refreshed?.ok) {
      const refreshedData = await refreshed.json().catch(() => ({}))
      if (refreshedData.token) {
        sessionStorage.setItem('wuroen-token', refreshedData.token)
        window.dispatchEvent(new CustomEvent('wuroen:token', { detail: refreshedData.token }))
        response = await send(refreshedData.token)
      }
    }
  }
  const data = await response.json().catch(() => ({}))
  if (!response.ok) throw new Error(data.message || `Erreur ${response.status}`)
  return data
}

function Login({ onLogin }) {
  const [mode, setMode] = useState('login')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  useEffect(() => {
    const syncToken = (event) => setSession((current) => ({ ...current, token: event.detail }))
    window.addEventListener('wuroen:token', syncToken)
    return () => window.removeEventListener('wuroen:token', syncToken)
  }, [])
  const submit = async (event) => {
    event.preventDefault()
    setBusy(true)
    setError('')
    const form = new FormData(event.currentTarget)
    const body = Object.fromEntries(form.entries())
    try {
      const data = await request(`/auth/${mode === 'login' ? 'login' : 'register'}`, null, { method: 'POST', body: JSON.stringify(body) })
      onLogin(data)
    } catch (err) { setError(err.message) } finally { setBusy(false) }
  }
  return (
    <main className="auth-page">
      <div className="auth-art">
        <div className="auth-brand"><img className="brand-logo auth-logo" src={brandLogo} alt="Wuro’en" /></div>
        <div className="auth-copy"><span className="eyebrow light"><Sparkles size={14} /> LA RECHERCHE EN MOUVEMENT</span><h1>Faites grandir<br />vos idées.</h1><p>Un espace de travail pensé pour les chercheurs, les équipes et celles et ceux qui font avancer le savoir.</p>
          <div className="auth-quote"><span className="quote-avatars"><i>AM</i><i>SK</i><i>JD</i></span><span>Rejoignez une communauté qui partage ses découvertes.</span></div>
        </div><div className="auth-foot">Savoir · Collaboration · Impact</div>
      </div>
      <section className="auth-form-wrap"><form className="auth-form" onSubmit={submit}>
        <span className="eyebrow">VOTRE ESPACE DE RECHERCHE</span><h2>{mode === 'login' ? 'Heureux de vous revoir' : 'Créer votre compte'}</h2><p className="muted">{mode === 'login' ? 'Connectez-vous pour retrouver votre espace.' : 'Rejoignez Wuro’en et partagez vos travaux.'}</p>
        {mode === 'register' && <label>Nom complet<input name="name" autoComplete="name" placeholder="Ex. Amina Diallo" required minLength="2" /></label>}
        <label>Adresse e-mail<input name="email" type="email" autoComplete="email" placeholder="vous@institution.org" required /></label>
        <label>Mot de passe<input name="password" type="password" autoComplete={mode === 'login' ? 'current-password' : 'new-password'} placeholder="6 caractères minimum" minLength="6" required /></label>
        {error && <p className="form-error" role="alert">{error}</p>}
        <button className="button primary full" disabled={busy}>{busy ? 'Connexion…' : mode === 'login' ? 'Se connecter' : 'Créer mon compte'}<ArrowRight size={17} /></button>
        <p className="switch-auth">{mode === 'login' ? 'Pas encore de compte ?' : 'Vous avez déjà un compte ?'} <button type="button" onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setError('') }}>{mode === 'login' ? 'S’inscrire' : 'Se connecter'}</button></p>
        <p className="auth-privacy"><ShieldCheck size={15} /> Vos données restent protégées et privées.</p>
      </form></section>
    </main>
  )
}

function Sidebar({ active, onChange, user, onLogout, open, onClose }) {
  return <><div className={`sidebar-scrim ${open ? 'visible' : ''}`} onClick={onClose} /><aside className={`sidebar ${open ? 'open' : ''}`}>
    <div className="brand"><img className="brand-logo" src={brandLogo} alt="Wuro’en" /><span className="brand-beta">ESPACE</span><button className="icon-button mobile-close" onClick={onClose}><X size={18} /></button></div>
    <div className="workspace-switch"><div className="workspace-icon"><BriefcaseBusiness size={17} /></div><div><strong>Mon espace</strong><span>Recherche personnelle</span></div><ChevronDown size={15} /></div>
    <span className="nav-caption">ESPACE DE TRAVAIL</span><nav className="main-nav">{sections.map(({ id, label, icon: Icon }) => <button key={id} onClick={() => { onChange(id); onClose() }} className={`nav-link ${active === id ? 'active' : ''}`}><Icon size={18} strokeWidth={1.8} /><span>{label}</span>{id === 'articles' && <span className="nav-count">12</span>}</button>)}</nav>
    <span className="nav-caption team-caption">COLLABORATION</span><nav className="main-nav"><button className="nav-link" onClick={() => onChange('workspace')}><Users size={18} strokeWidth={1.8} /><span>Équipes & projets</span></button><button className="nav-link" onClick={() => onChange('messages')}><MessageCircle size={18} strokeWidth={1.8} /><span>Messages</span><span className="unread-dot" /></button></nav>
    <div className="sidebar-spacer" /><div className="sidebar-help"><div className="help-icon"><CircleHelp size={18} /></div><div><strong>Besoin d’aide ?</strong><p>Consultez notre guide de démarrage.</p><button onClick={() => onChange('help')}>Ouvrir le guide <ArrowRight size={13} /></button></div></div>
    <button className="user-menu" onClick={onLogout}><div className="avatar avatar-purple">{(user?.name || 'U').split(/\s+/).map(n => n[0]).slice(0, 2).join('').toUpperCase()}</div><div className="user-info"><strong>{user?.name || 'Utilisateur'}</strong><span>{user?.email}</span></div><LogOut size={17} /><span className="sr-only">Se déconnecter</span></button>
  </aside></>
}

function Topbar({ user, onMenu, query, setQuery, onSearch }) {
  return <header className="topbar"><button className="icon-button mobile-menu" onClick={onMenu}><Menu size={20} /></button><div className="breadcrumb">Espace de travail <span>/</span> <strong>Wuro’en</strong></div><div className="top-actions"><label className="search-box"><Search size={16} /><input aria-label="Rechercher" placeholder="Rechercher" value={query} onChange={(e) => { setQuery(e.target.value); onSearch(e.target.value) }} /><kbd>⌘ K</kbd></label><button className="icon-button notification-button" aria-label="Notifications"><Bell size={19} /><i /></button><div className="top-avatar">{(user?.name || 'U').split(/\s+/).map(n => n[0]).slice(0, 2).join('').toUpperCase()}</div></div></header>
}

function Overview({ user, stats, articles, onNavigate, loading, refresh }) {
  const items = [
    { label: 'Articles publiés', value: stats.articles, note: '+2 ce mois-ci', icon: FileText, color: 'violet', trend: true },
    { label: 'Catégories disponibles', value: stats.resources, note: 'dans la bibliothèque', icon: BookOpen, color: 'green' },
    { label: 'Collaborateurs', value: '08', note: 'dans vos équipes', icon: Users, color: 'orange' },
  ]
  return <>
    <div className="welcome-row"><div><div className="eyebrow date-eyebrow">{dateLabel}</div><h1>Bonjour {firstName(user?.name)} <span className="wave">✳</span></h1><p>Voici ce qui se passe dans votre espace aujourd’hui.</p></div><button className="button primary" onClick={() => onNavigate('articles')}><Plus size={17} /> Nouvel article</button></div>
    <section className="stat-grid">{items.map(({ label, value, note, icon: Icon, color, trend }) => <article className="stat-card" key={label}><div className="stat-top"><span>{label}</span><span className={`stat-icon ${color}`}><Icon size={18} /></span></div><div className="stat-number">{loading ? '—' : value}</div><div className="stat-note">{trend && <span className="trend-up"><ArrowUpRight size={14} /></span>}{note}</div></article>)}</section>
    <div className="content-grid"><section className="panel activity-panel"><div className="panel-heading"><div><span className="eyebrow">VOTRE ESPACE</span><h2>Activité récente</h2></div><button className="text-button" onClick={() => onNavigate('articles')}>Voir les articles <ArrowRight size={15} /></button></div>
      {loading ? <div className="empty-state"><span className="spinner" /> Chargement de votre activité…</div> : articles.length ? <div className="article-list">{articles.slice(0, 4).map((article, i) => <article className="article-row" key={article._id || i}><span className={`article-icon article-${i % 4}`}><FileText size={18} /></span><div className="article-copy"><strong>{article.title}</strong><span>{article.author?.name || 'Équipe Wuro’en'} · {article.category || 'Recherche'} · {article.publishedAt || article.createdAt ? new Date(article.publishedAt || article.createdAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' }) : 'Publication récente'}</span></div><span className="status-pill"><i /> Publié</span><button className="row-arrow" aria-label="Ouvrir l’article"><ArrowRight size={16} /></button></article>)}</div> : <div className="empty-state"><FileText size={23} /><strong>Aucun article à afficher</strong><span>Les articles publiés apparaîtront ici.</span><button className="text-button" onClick={refresh}>Actualiser</button></div>}
    </section><aside className="right-column"><div className="focus-card"><div className="focus-orbit orbit-one" /><div className="focus-orbit orbit-two" /><span className="focus-symbol"><Sparkles size={18} /></span><span className="eyebrow light">PENSÉ POUR VOS PROJETS</span><h3>Le savoir avance<br />quand on le partage.</h3><p>Rassemblez vos idées, vos ressources et votre équipe au même endroit.</p><button onClick={() => onNavigate('workspace')}>Explorer mon espace <ArrowRight size={15} /></button></div><div className="tip-card"><div className="tip-heading"><span><GraduationCap size={17} /></span><strong>Petit conseil</strong></div><p>Ajoutez vos domaines de recherche à votre profil pour recevoir des ressources plus pertinentes.</p><button onClick={() => onNavigate('profile')}>Compléter mon profil <ArrowRight size={14} /></button></div></aside></div>
    <section className="quick-links"><div className="quick-title"><span className="eyebrow">POUR ALLER PLUS LOIN</span><h2>Reprendre là où vous en étiez</h2></div><button className="quick-card" onClick={() => onNavigate('library')}><span className="quick-icon q-green"><Library size={19} /></span><span><strong>Bibliothèque</strong><small>Retrouvez vos ressources</small></span><ArrowRight size={17} /></button><button className="quick-card" onClick={() => onNavigate('workspace')}><span className="quick-icon q-blue"><FolderKanban size={19} /></span><span><strong>Projets d’équipe</strong><small>Suivez vos collaborations</small></span><ArrowRight size={17} /></button></section>
  </>
}

function DataSection({ section, data, loading, error, onRefresh, query }) {
  const title = { articles: 'Articles', library: 'Bibliothèque', tools: 'Outils', workspace: 'Équipes & projets', messages: 'Messages', help: 'Centre d’aide', profile: 'Mon profil' }[section] || 'Espace de travail'
  const description = { articles: 'Découvrez les publications partagées par la communauté.', library: 'Explorez les ressources documentaires de Wuro’en.', tools: 'Les outils à votre disposition pour vos travaux.', workspace: 'Retrouvez vos espaces et projets de recherche.' }[section] || 'Retrouvez ici les informations de votre espace Wuro’en.'
  const items = data[section] || []
  const filtered = items.filter((item) => `${item.title || item.name || ''} ${item.description || ''}`.toLowerCase().includes(query.toLowerCase()))
  return <section className="data-page"><div className="page-heading"><div><span className="eyebrow">Wuro’en · ESPACE DE TRAVAIL</span><h1>{title}</h1><p>{description}</p></div><button className="button outline" onClick={onRefresh}><Activity size={16} /> Actualiser</button></div>{error && <div className="notice"><CircleHelp size={18} /><span>{error}</span><button onClick={onRefresh}>Réessayer</button></div>}{loading ? <div className="loading-panel"><span className="spinner" /> Chargement…</div> : filtered.length ? <div className="data-grid">{filtered.map((item, i) => <article className="data-card" key={item._id || i}><span className={`data-icon data-${i % 4}`}>{section === 'library' ? <BookOpen size={20} /> : section === 'tools' ? <Settings2 size={20} /> : <FileText size={20} />}</span><h3>{item.title || item.name || 'Ressource Wuro’en'}</h3><p>{item.intro || item.description || item.category || 'Découvrez cette ressource de la communauté Wuro’en.'}</p><span className="data-meta">{item.author?.name || item.createdBy?.name || item.specialty || 'Communauté Wuro’en'}</span><button className="text-button" onClick={() => item.url || item.actionUrl ? window.open(item.url || item.actionUrl, '_blank', 'noopener,noreferrer') : null}>Consulter <ArrowRight size={15} /></button></article>)}</div> : <div className="empty-panel"><span className="empty-art"><BookOpen size={27} /></span><h3>{query ? 'Aucun résultat' : 'Votre espace se construit'}</h3><p>{query ? 'Essayez un autre terme de recherche.' : 'Les nouvelles ressources et publications apparaîtront ici au fil de vos projets.'}</p><button className="button outline" onClick={onRefresh}>Actualiser les contenus</button></div>}</section>
}

async function loadWorkspaceData(token) {
  const results = await Promise.allSettled([
    request('/articles?page=1&limit=12', token),
    request('/library/categories/root', token),
    request('/tools', token),
    request('/workspaces', token),
  ])
  const values = results.map((result) => result.status === 'fulfilled' ? result.value : null)
  const articleResult = values[0]
  const data = {
    articles: articleResult?.articles || (Array.isArray(articleResult) ? articleResult : []),
    articleTotal: articleResult?.total || articleResult?.articles?.length || 0,
    library: Array.isArray(values[1]) ? values[1] : [],
    tools: Array.isArray(values[2]) ? values[2] : [],
    workspace: Array.isArray(values[3]) ? values[3] : values[3]?.workspaces || [],
  }
  const failed = results.filter((result) => result.status === 'rejected')
  const error = failed.length === results.length
    ? 'Impossible de joindre le serveur. Vérifiez que l’API Wuro’en est démarrée et que VITE_API_URL pointe vers la bonne adresse.'
    : failed.length ? 'Certaines données ne sont pas disponibles pour le moment.' : ''
  return { data, error }
}

export default function App() {
  const [session, setSession] = useState(() => ({ token: sessionStorage.getItem('wuroen-token'), user: JSON.parse(sessionStorage.getItem('wuroen-user') || 'null') }))
  const [active, setActive] = useState('overview')
  const [mobileOpen, setMobileOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [data, setData] = useState({ articles: [], library: [], tools: [], workspace: [] })
  const [loading, setLoading] = useState(Boolean(session.token))
  const [error, setError] = useState('')
  const saveSession = (payload) => {
    sessionStorage.setItem('wuroen-token', payload.token)
    const { token, ...user } = payload
    sessionStorage.setItem('wuroen-user', JSON.stringify(user))
    setSession({ token, user })
    setLoading(true)
  }
  const logout = useCallback(async () => {
    try { await request('/auth/logout', session.token, { method: 'POST' }) } catch { /* la session locale reste révocable ici */ }
    sessionStorage.removeItem('wuroen-token'); sessionStorage.removeItem('wuroen-user'); setSession({ token: null, user: null })
  }, [session.token])
  const loadData = useCallback(async () => {
    if (!session.token) return
    setLoading(true); setError('')
    const result = await loadWorkspaceData(session.token)
    setData(result.data); setError(result.error); setLoading(false)
  }, [session.token])
  useEffect(() => {
    let active = true
    if (session.token) {
      loadWorkspaceData(session.token).then((result) => {
        if (active) { setData(result.data); setError(result.error); setLoading(false) }
      })
    }
    return () => { active = false }
  }, [session.token])
  const stats = useMemo(() => ({ articles: String(data.articleTotal || data.articles.length).padStart(2, '0'), resources: String(data.library.length).padStart(2, '0') }), [data])
  if (!session.token) return <Login onLogin={saveSession} />
  return <div className="app-shell"><Sidebar active={active} onChange={setActive} user={session.user} onLogout={logout} open={mobileOpen} onClose={() => setMobileOpen(false)} /><div className="main-shell"><Topbar user={session.user} onMenu={() => setMobileOpen(true)} query={query} setQuery={setQuery} onSearch={() => { if (active !== 'overview') return }} /><main className="page-content">{error && <div className="notice global-notice"><CircleHelp size={17} /><span>{error}</span><button onClick={loadData}>Réessayer</button></div>}{active === 'overview' ? <Overview user={session.user} stats={stats} articles={data.articles} onNavigate={setActive} loading={loading} refresh={loadData} /> : <DataSection section={active} data={data} loading={loading} error="" onRefresh={loadData} query={query} />}</main><footer className="app-footer"><span>© 2026 Wuro’en</span><span>Un espace pour faire avancer le savoir.</span><button onClick={() => setActive('help')}>Aide & support <ArrowUpRight size={13} /></button></footer></div></div>
}
