import { type ReactNode } from 'react'
import { ApplicationShell } from '../../../components/ApplicationShell'
import { contextualNavigationFor, navigationForPortal, viewNavigationFor } from '../../../components/navigationRegistry'
import { type UniversitySession } from '../../../api/frappe'
import { useLocation } from 'react-router-dom'
import { LecturerScopeBar } from '../components/LecturerScopeBar'

export function LecturerShell({ session, onLogout, children }: { session: UniversitySession; onLogout: () => void; children: ReactNode }) {
  const location = useLocation(), role = 'lecturer' as const
  return <ApplicationShell session={session} onLogout={onLogout} navigation={navigationForPortal(role)} subtabs={contextualNavigationFor(role, location.pathname)} subSubtabs={viewNavigationFor(role, location.pathname)} portalLabel="AWU Teaching Portal" profilePath="/lecturer/profile" roleKey={role}><LecturerScopeBar/>{children}</ApplicationShell>
}
