import { useState, type ReactNode } from 'react'
import { Bell, LogOut, MoreHorizontal, Search, Settings, UserCircle2, X } from 'lucide-react'
import { NavLink, useLocation, useNavigate } from 'react-router-dom'
import { authApi, type UniversitySession } from '../../../api/frappe'
import { GlobalSearch } from '../../../components/GlobalSearch'
import { adminNavigation, subNavigationFor } from '../roleConfig'

function active(path: string, location: string) {
  return location === path || (path !== '/dashboard' && location.startsWith(path))
}

function subtabActive(path: string, location: string) {
  const rootPaths = ['/students', '/academics', '/registration', '/finance', '/results', '/transcripts', '/clearance', '/settings']
  return location === path || (!rootPaths.includes(path) && location.startsWith(`${path}/`))
}

export function AdminShell({ session, onLogout, children }: { session: UniversitySession; onLogout: () => void; children: ReactNode }) {
  const location = useLocation()
  const navigate = useNavigate()
  const [moreOpen, setMoreOpen] = useState(false)
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false)
  const current = adminNavigation.find(item => active(item.path, location.pathname)) ?? adminNavigation[0]
  const contextualNavigation = subNavigationFor(location.pathname)
  const mobileItems = adminNavigation.slice(0, 4)

  async function logout() {
    await authApi.logout().catch(() => undefined)
    onLogout()
    navigate('/dashboard', { replace: true })
  }

  return (
    <div className="app-shell role-shell role-shell-admin">
      <div className="desktop-sidebar-cap"><div className="desktop-sidebar-cap-mark"><img src="/awu-logo.png" alt="Ankole Western University" /></div></div>
      <header className="topbar card desktop-topbar">
        <GlobalSearch />
        <div className="topbar-actions">
          <button className="topbar-icon-button" type="button" aria-label="Notifications"><Bell size={18} /><i /></button>
          <button className="topbar-user-chip" type="button" onClick={() => navigate('/settings')}>
            <span className="topbar-user-avatar">{session.initials}</span><span className="topbar-user-copy"><strong>{session.fullName}</strong><small>{session.roleLabel}</small></span>
          </button>
        </div>
      </header>

      <aside className="sidebar desktop-sidebar">
        <div className="sidebar-heading"><img src="/awu-logo.png" alt=""/><span><strong>AWU</strong><small>Ankole Western University</small></span></div>
        <nav className="nav-list" aria-label="University administrator navigation">
          {adminNavigation.map(item => <NavLink key={item.path} to={item.path} className={() => active(item.path, location.pathname) ? 'nav-item nav-item-active' : 'nav-item'}><item.icon size={18} /><span>{item.label}</span>{item.path === '/results' ? <b>8</b> : null}</NavLink>)}
        </nav>
        <div className="sidebar-actions">
          <NavLink to="/settings" className="sidebar-icon-button" aria-label="Settings"><Settings size={17} /></NavLink>
          <button type="button" className="sidebar-icon-button" aria-label="Profile"><UserCircle2 size={17} /></button>
          <button type="button" className="sidebar-icon-button" onClick={logout} aria-label="Sign out"><LogOut size={17} /></button>
        </div>
      </aside>

      <header className="mobile-header card">
        <div className="mobile-header-brand"><div className="brand-mark"><img src="/awu-logo.png" alt="Ankole Western University" /></div><div><p>Ankole Western University</p><strong>{current.label}</strong></div></div>
        <div className="mobile-header-actions"><button className="mobile-icon-button" onClick={() => setMobileSearchOpen(value => !value)} aria-label="Search University records"><Search size={18} /></button><button className="mobile-icon-button"><Bell size={18} /></button></div>
      </header>

      {mobileSearchOpen ? <div className="mobile-global-search"><GlobalSearch mobile onNavigate={() => setMobileSearchOpen(false)} /></div> : null}

      <section className="workspace">
        {contextualNavigation.length ? <nav className="workspace-subtabs" aria-label={`${current.label} navigation`}>{contextualNavigation.map(item => <NavLink key={item.label} to={item.path} className={() => subtabActive(item.path, location.pathname) ? 'workspace-subtab workspace-subtab-active' : 'workspace-subtab'}><item.icon size={15} /><span>{item.label}</span></NavLink>)}</nav> : null}
        <main className="page-stack">{children}</main>
      </section>

      <nav className="mobile-bottom-nav card" aria-label="Mobile navigation">
        {mobileItems.map(item => <NavLink key={item.path} to={item.path} className={() => active(item.path, location.pathname) ? 'bottom-nav-item bottom-nav-item-active' : 'bottom-nav-item'}><item.icon size={18} /><span>{item.label === 'Academic Structure' ? 'Academics' : item.label}</span></NavLink>)}
        <button type="button" className={moreOpen ? 'bottom-nav-item bottom-nav-item-active' : 'bottom-nav-item'} onClick={() => setMoreOpen(value => !value)}><MoreHorizontal size={18} /><span>More</span></button>
      </nav>

      {moreOpen ? <div className="mobile-more-overlay mobile-more-overlay-open"><button className="mobile-more-backdrop" onClick={() => setMoreOpen(false)} aria-label="Close menu" /><section className="mobile-more-sheet card"><div className="mobile-more-sheet-header"><div><span className="eyebrow">ANKOLE WESTERN UNIVERSITY</span><h2>More services</h2></div><button className="mobile-icon-button" onClick={() => setMoreOpen(false)}><X size={18} /></button></div><div className="mobile-more-list">{adminNavigation.slice(4).map(item => <NavLink key={item.path} to={item.path} className="mobile-more-item" onClick={() => setMoreOpen(false)}><item.icon size={18} /><span>{item.label}</span></NavLink>)}<button className="mobile-more-item ghost-danger" onClick={logout}><LogOut size={18} /><span>Sign out</span></button></div></section></div> : null}
    </div>
  )
}
