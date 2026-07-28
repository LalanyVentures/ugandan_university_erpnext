import { useState, type ReactNode } from 'react'
import { Bell, LogOut, MoreHorizontal, UserCircle2, X } from 'lucide-react'
import { NavLink, useLocation, useNavigate } from 'react-router-dom'
import { authApi, type UniversitySession } from '../../../api/frappe'
import { studentNavigation } from '../roleConfig'

function active(path:string,location:string) { return location===path || (path!=='/student' && location.startsWith(path)) }

export function StudentShell({session,onLogout,children}:{session:UniversitySession;onLogout:()=>void;children:ReactNode}) {
  const location=useLocation(), navigate=useNavigate()
  const [moreOpen,setMoreOpen]=useState(false)
  const current=studentNavigation.find(item=>active(item.path,location.pathname)) ?? studentNavigation[0]
  const mobileItems=studentNavigation.slice(0,4)
  async function logout(){await authApi.logout().catch(()=>undefined);onLogout();navigate('/login',{replace:true})}
  return <div className="app-shell role-shell role-shell-student">
    <div className="desktop-sidebar-cap"><div className="desktop-sidebar-cap-mark"><img src="/awu-logo.png" alt="Ankole Western University"/></div></div>
    <header className="topbar card desktop-topbar"><div className="student-topbar-context"><span className="eyebrow">MY AWU PORTAL</span><strong>{current.label}</strong></div><div className="topbar-actions"><button className="topbar-icon-button" aria-label="Notifications"><Bell size={18}/></button><button className="topbar-user-chip" onClick={()=>navigate('/student/profile')}><span className="topbar-user-avatar">{session.initials}</span><span className="topbar-user-copy"><strong>{session.fullName}</strong><small>Student</small></span></button></div></header>
    <aside className="sidebar desktop-sidebar"><div className="sidebar-heading"><img src="/awu-logo.png" alt=""/><span><strong>AWU</strong><small>Student Portal</small></span></div><nav className="nav-list" aria-label="Student navigation">{studentNavigation.map(item=><NavLink key={item.path} to={item.path} end={item.path==='/student'} className={()=>active(item.path,location.pathname)?'nav-item nav-item-active':'nav-item'}><item.icon size={18}/><span>{item.label}</span></NavLink>)}</nav><div className="sidebar-actions"><button className="sidebar-icon-button" onClick={()=>navigate('/student/profile')} aria-label="My profile"><UserCircle2 size={17}/></button><button className="sidebar-icon-button" onClick={logout} aria-label="Sign out"><LogOut size={17}/></button></div></aside>
    <header className="mobile-header card"><div className="mobile-header-brand"><div className="brand-mark"><img src="/awu-logo.png" alt="Ankole Western University"/></div><div><p>My AWU Portal</p><strong>{current.label}</strong></div></div><div className="mobile-header-actions"><button className="mobile-icon-button"><Bell size={18}/></button></div></header>
    <section className="workspace"><main className="page-stack">{children}</main></section>
    <nav className="mobile-bottom-nav card" aria-label="Student mobile navigation">{mobileItems.map(item=><NavLink key={item.path} to={item.path} end={item.path==='/student'} className={()=>active(item.path,location.pathname)?'bottom-nav-item bottom-nav-item-active':'bottom-nav-item'}><item.icon size={18}/><span>{item.label.replace('My ','')}</span></NavLink>)}<button className={moreOpen?'bottom-nav-item bottom-nav-item-active':'bottom-nav-item'} onClick={()=>setMoreOpen(value=>!value)}><MoreHorizontal size={18}/><span>More</span></button></nav>
    {moreOpen?<div className="mobile-more-overlay mobile-more-overlay-open"><button className="mobile-more-backdrop" onClick={()=>setMoreOpen(false)} aria-label="Close menu"/><section className="mobile-more-sheet card"><div className="mobile-more-sheet-header"><div><span className="eyebrow">MY AWU PORTAL</span><h2>More student services</h2></div><button className="mobile-icon-button" onClick={()=>setMoreOpen(false)}><X size={18}/></button></div><div className="mobile-more-list">{studentNavigation.slice(4).map(item=><NavLink key={item.path} to={item.path} className="mobile-more-item" onClick={()=>setMoreOpen(false)}><item.icon size={18}/><span>{item.label}</span></NavLink>)}<button className="mobile-more-item ghost-danger" onClick={logout}><LogOut size={18}/><span>Sign out</span></button></div></section></div>:null}
  </div>
}
