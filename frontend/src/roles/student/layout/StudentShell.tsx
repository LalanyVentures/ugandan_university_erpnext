import { type ReactNode } from 'react'
import { ApplicationShell } from '../../../components/ApplicationShell'
import { contextualNavigationFor, navigationForPortal, viewNavigationFor } from '../../../components/navigationRegistry'
import { type UniversitySession } from '../../../api/frappe'
import { useLocation } from 'react-router-dom'
import { StudentScopeBar } from '../components/StudentScopeBar'

export function StudentShell({ session, onLogout, children }: { session: UniversitySession; onLogout: () => void; children: ReactNode }) {
  const location = useLocation(), role = 'student' as const
  return <ApplicationShell session={session} onLogout={onLogout} navigation={navigationForPortal(role)} subtabs={contextualNavigationFor(role, location.pathname)} subSubtabs={viewNavigationFor(role, location.pathname)} portalLabel="My AWU Student Portal" profilePath="/student/profile" roleKey={role}><StudentScopeBar/>{children}</ApplicationShell>
}
