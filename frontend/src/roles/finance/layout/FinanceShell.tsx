import { type ReactNode } from 'react'
import { ApplicationShell } from '../../../components/ApplicationShell'
import { contextualNavigationFor, navigationForPortal, viewNavigationFor } from '../../../components/navigationRegistry'
import { type UniversitySession } from '../../../api/frappe'
import { useLocation } from 'react-router-dom'

export function FinanceShell({ session, onLogout, children }: { session: UniversitySession; onLogout: () => void; children: ReactNode }) {
  const location = useLocation(), role = 'finance' as const
  return <ApplicationShell session={session} onLogout={onLogout} navigation={navigationForPortal(role)} subtabs={contextualNavigationFor(role, location.pathname)} subSubtabs={viewNavigationFor(role, location.pathname)} portalLabel="AWU Finance Office" profilePath="/finance" roleKey={role}>{children}</ApplicationShell>
}
