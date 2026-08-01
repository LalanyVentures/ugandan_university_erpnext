import { useEffect, useMemo, useRef, useState, type ComponentType, type CSSProperties, type PointerEvent as ReactPointerEvent, type ReactNode } from 'react'
import { Bell, ChevronRight, FolderTree, Home, LogOut, Menu, Minus, MoreHorizontal, PanelLeftClose, PanelLeftOpen, Plus, Search, X } from 'lucide-react'
import { NavLink, useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import { authApi, type UniversitySession } from '../api/frappe'
import { GlobalSearch } from './GlobalSearch'
import { UniversityExplorer } from './UniversityExplorer'
import type { PortalRole } from '../roles/admin/roleConfig'

export type ShellNavItem = { label: string; path: string; icon: ComponentType<{ size?: number }> }
export type ShellTab = ShellNavItem

type Props = {
  session: UniversitySession
  onLogout: () => void
  children: ReactNode
  navigation: readonly ShellNavItem[]
  subtabs?: readonly ShellTab[]
  subSubtabs?: readonly ShellTab[]
  portalLabel: string
  profilePath: string
  roleKey?: PortalRole
  contextualActions?: ReactNode
}

function active(path: string, pathname: string, landingPath?: string) {
  return pathname === path || (path !== landingPath && pathname.startsWith(`${path}/`))
}

function slug(label: string) { return label.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') }

function tabTarget(item: ShellTab, level: 'primary' | 'tab' | 'subtab', currentSearch = '') {
  const params = new URLSearchParams(currentSearch)
  params.set(level, item.label.toLowerCase().replace(/\s+/g, '-'))
  return { pathname: item.path, search: `?${params.toString()}` }
}

export function ApplicationShell({ session, onLogout, children, navigation, subtabs = [], subSubtabs = [], portalLabel, profilePath, roleKey = 'staff', contextualActions }: Props) {
  const location = useLocation()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [moreOpen, setMoreOpen] = useState(false)
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false)
  const [explorerOpen, setExplorerOpen] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => localStorage.getItem('university-sidebar-collapsed') === 'true')
  const [sidebarWidth, setSidebarWidth] = useState(() => {
    const saved = Number(localStorage.getItem('university-sidebar-width'))
    return Number.isFinite(saved) && saved >= 220 && saved <= 420 ? saved : 260
  })
  const explorerButtonRef = useRef<HTMLButtonElement>(null)
  const pageHeadingRef = useRef<HTMLHeadingElement>(null)
  const current = useMemo(() => navigation.find(item => active(item.path, location.pathname, navigation[0]?.path)) ?? navigation[0], [navigation, location.pathname])
  const mobileItems = navigation.slice(0, 4)
  const breadcrumb = [portalLabel, current?.label].filter(Boolean)

  useEffect(() => localStorage.setItem('university-sidebar-collapsed', String(sidebarCollapsed)), [sidebarCollapsed])
  useEffect(() => localStorage.setItem('university-sidebar-width', String(sidebarWidth)), [sidebarWidth])

  useEffect(() => {
    pageHeadingRef.current?.focus({ preventScroll: true })
  }, [location.pathname, location.search])

  async function logout() {
    await authApi.logout().catch(() => undefined)
    onLogout()
    navigate('/login', { replace: true })
  }

  function startSidebarResize(event: ReactPointerEvent<HTMLButtonElement>) {
    if (sidebarCollapsed) return
    event.preventDefault()
    const startX = event.clientX
    const startWidth = sidebarWidth
    const resize = (moveEvent: PointerEvent) => setSidebarWidth(Math.min(420, Math.max(220, startWidth + moveEvent.clientX - startX)))
    const stop = () => {
      window.removeEventListener('pointermove', resize)
      window.removeEventListener('pointerup', stop)
      document.body.classList.remove('sidebar-is-resizing')
    }
    document.body.classList.add('sidebar-is-resizing')
    window.addEventListener('pointermove', resize)
    window.addEventListener('pointerup', stop)
  }

  const NavItems = ({ items, mode = 'sidebar' }: { items: readonly ShellNavItem[]; mode?: 'sidebar' | 'bottom' | 'more' }) => <>
    {items.map(item => <NavLink key={item.path} to={tabTarget(item, 'primary', location.search)} end={item.path === navigation[0]?.path} title={item.label} aria-label={item.label} onClick={() => mode === 'more' && setMoreOpen(false)} className={() => mode === 'more' ? 'mobile-more-item' : mode === 'bottom' ? active(item.path, location.pathname, navigation[0]?.path) ? 'bottom-nav-item bottom-nav-item-active' : 'bottom-nav-item' : active(item.path, location.pathname, navigation[0]?.path) ? 'nav-item nav-item-active' : 'nav-item'}><span className={`shell-icon shell-icon-${slug(item.label)}`}><item.icon size={18} /></span><span>{item.label}</span></NavLink>)}
  </>

  return <div className={`app-shell role-shell role-shell-${roleKey} ${sidebarCollapsed ? 'app-shell-sidebar-collapsed' : ''}`} style={{ '--sidebar-width': `${sidebarCollapsed ? 72 : sidebarWidth}px` } as CSSProperties}>
    <div className="desktop-sidebar-cap"><div className="desktop-sidebar-cap-mark"><img src="/awu-logo.png" alt="Ankole Western University" /></div></div>
    <header className="topbar card desktop-topbar">
      <GlobalSearch role={roleKey} />
      <div className="topbar-actions"><button ref={explorerButtonRef} className="topbar-icon-button" type="button" onClick={()=>setExplorerOpen(true)} aria-label="Open University explorer" title="University explorer"><FolderTree size={18}/></button><button className="topbar-icon-button" type="button" aria-label="Notifications"><Bell size={18} /><i /></button><button className="topbar-user-chip" type="button" onClick={() => navigate(profilePath)}><span className="topbar-user-avatar">{session.initials}</span><span className="topbar-user-copy"><strong>{session.fullName}</strong><small>{session.roleLabel}</small></span></button></div>
    </header>
    <aside className="sidebar desktop-sidebar"><div className="sidebar-heading"><img src="/awu-logo.png" alt="" /><span><strong>AWU</strong><small>{portalLabel}</small></span></div><nav className="nav-list" aria-label={`${session.roleLabel} navigation`}><NavItems items={navigation} /></nav><div className="sidebar-actions"><button className="sidebar-icon-button" type="button" onClick={() => navigate(navigation[0]?.path ?? '/dashboard')} aria-label="Open dashboard" title="Dashboard"><Home size={18}/></button><button className="sidebar-icon-button" type="button" onClick={()=>setExplorerOpen(true)} aria-label="Open University explorer" title="University explorer"><FolderTree size={18}/></button><button className="sidebar-icon-button" type="button" onClick={() => setSidebarCollapsed(value => !value)} aria-label={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'} title={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}>{sidebarCollapsed ? <PanelLeftOpen size={18} /> : <PanelLeftClose size={18} />}</button><button className="sidebar-icon-button" type="button" disabled={sidebarCollapsed || sidebarWidth <= 220} onClick={() => setSidebarWidth(width => Math.max(220, width - 24))} aria-label="Make sidebar narrower" title="Narrower"><Minus size={18}/></button><button className="sidebar-icon-button" type="button" disabled={sidebarCollapsed || sidebarWidth >= 420} onClick={() => setSidebarWidth(width => Math.min(420, width + 24))} aria-label="Make sidebar wider" title="Wider"><Plus size={18}/></button><button className="sidebar-icon-button" type="button" onClick={logout} aria-label="Sign out" title="Sign out"><LogOut size={18} /></button></div><button type="button" className="sidebar-resize-handle" onPointerDown={startSidebarResize} onDoubleClick={() => setSidebarWidth(260)} aria-label="Resize sidebar; double click to reset" title="Drag to resize · Double-click to reset" /></aside>
    <header className="mobile-header card"><div className="mobile-header-brand"><div className="brand-mark"><img src="/awu-logo.png" alt="Ankole Western University" /></div><div><p>{portalLabel}</p><strong>{current?.label}</strong></div></div><div className="mobile-header-actions"><button className="mobile-icon-button" type="button" onClick={()=>setExplorerOpen(true)} aria-label="Open University explorer"><FolderTree size={18}/></button><button className="mobile-icon-button" type="button" onClick={() => setMobileSearchOpen(value => !value)} aria-label="Search University records"><Search size={18} /></button><button className="mobile-icon-button" type="button" onClick={() => setMoreOpen(value => !value)} aria-label="Open menu"><Menu size={18} /></button></div></header>
    {mobileSearchOpen ? <div className="mobile-global-search"><GlobalSearch role={roleKey} mobile onNavigate={() => setMobileSearchOpen(false)} /></div> : null}
    <section className="workspace">
      <div className="shell-breadcrumb" aria-label="Breadcrumb">{breadcrumb.map((item, index) => <span key={item}>{index ? <ChevronRight size={13} /> : null}{item}</span>)}</div>
      {subtabs.length ? <nav className="workspace-subtabs" aria-label={`${current?.label ?? 'Section'} tabs`}><span className="shell-tab-label">{current?.label}</span>{subtabs.map(item => <NavLink key={item.path} to={tabTarget(item, 'tab', location.search)} className={() => active(item.path, location.pathname, subtabs[0]?.path) ? 'workspace-subtab workspace-subtab-active' : 'workspace-subtab'} title={item.label} aria-label={item.label}><item.icon size={15} /><span>{item.label}</span></NavLink>)}</nav> : null}
      {subSubtabs.length ? <nav className="workspace-subsubtabs" aria-label="Sub-section tabs">{subSubtabs.map((item, index) => { const selected = searchParams.get('subtab'); const isSelected = selected ? selected === slug(item.label) : index === 0; return <NavLink key={`${item.path}-${item.label}`} to={tabTarget(item, 'subtab', location.search)} className={isSelected ? 'workspace-subsubtab workspace-subsubtab-active' : 'workspace-subsubtab'} title={item.label} aria-label={item.label}><item.icon size={14} /><span>{item.label}</span></NavLink> })}</nav> : null}
      <div className="shell-page-heading"><div className="shell-page-title"><span className={`shell-title-icon shell-icon-${slug(current?.label ?? 'workspace')}`}>{current ? <current.icon size={21} /> : null}</span><span><span className="eyebrow">{portalLabel}</span><h1 ref={pageHeadingRef} tabIndex={-1}>{current?.label ?? 'Workspace'}</h1></span></div><div className="shell-context-actions">{contextualActions}<span className="shell-route-state">{location.pathname}</span></div></div>
      <main className="page-stack">{children}</main>
    </section>
    <nav className="mobile-bottom-nav card" aria-label="Mobile navigation"><NavItems items={mobileItems} mode="bottom" /> <button type="button" className={moreOpen ? 'bottom-nav-item bottom-nav-item-active' : 'bottom-nav-item'} onClick={() => setMoreOpen(value => !value)} aria-label="More navigation"><MoreHorizontal size={18} /><span>More</span></button></nav>
    {moreOpen ? <div className="mobile-more-overlay mobile-more-overlay-open"><button className="mobile-more-backdrop" type="button" onClick={() => setMoreOpen(false)} aria-label="Close menu" /><section className="mobile-more-sheet card"><div className="mobile-more-sheet-header"><div><span className="eyebrow">{portalLabel}</span><h2>More services</h2></div><button className="mobile-icon-button" type="button" onClick={() => setMoreOpen(false)} aria-label="Close more menu"><X size={18} /></button></div><div className="mobile-more-list"><NavItems items={navigation.slice(4)} mode="more" /><button className="mobile-more-item ghost-danger" type="button" onClick={logout}><LogOut size={18} /><span>Sign out</span></button></div></section></div> : null}
    <UniversityExplorer role={roleKey} open={explorerOpen} onClose={()=>setExplorerOpen(false)} returnFocus={explorerButtonRef}/>
  </div>
}
