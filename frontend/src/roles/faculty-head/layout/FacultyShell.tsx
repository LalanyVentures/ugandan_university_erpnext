import { type ReactNode } from 'react'
import { ApplicationShell } from '../../../components/ApplicationShell'
import { contextualNavigationFor, navigationForPortal, viewNavigationFor } from '../../../components/navigationRegistry'
import { type UniversitySession } from '../../../api/frappe'
import { useLocation } from 'react-router-dom'
import { FacultyScopeBar } from '../components/FacultyScopeBar'

export function FacultyShell({ session, onLogout, children }: { session: UniversitySession; onLogout: () => void; children: ReactNode }) {
  const location = useLocation(), role = 'faculty-head' as const
  return <ApplicationShell session={session} onLogout={onLogout} navigation={navigationForPortal(role)} subtabs={contextualNavigationFor(role, location.pathname)} subSubtabs={viewNavigationFor(role, location.pathname)} portalLabel="AWU Faculty Leadership" profilePath="/faculty/profile" roleKey={role}><FacultyScopeBar/>{children}</ApplicationShell>
}
