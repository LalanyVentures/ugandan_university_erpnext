import { type ReactNode } from 'react'
import { useLocation } from 'react-router-dom'
import { ApplicationShell } from '../../../components/ApplicationShell'
import { navigationForPortal, viewNavigationFor } from '../../../components/navigationRegistry'
import { type UniversitySession } from '../../../api/frappe'
import { portalRoleFor, subNavigationFor } from '../roleConfig'

export function AdminShell({ session, onLogout, children }: { session: UniversitySession; onLogout: () => void; children: ReactNode }) {
  const location = useLocation()
  const role = portalRoleFor(session.roles)
  const navigation = navigationForPortal(role)
  const currentPath = location.pathname
  const subtabs = subNavigationFor(currentPath, session.roles)
  return <ApplicationShell session={session} onLogout={onLogout} navigation={navigation} subtabs={subtabs} subSubtabs={viewNavigationFor(role, currentPath)} portalLabel="Ankole Western University" profilePath={role === 'administrator' ? '/settings' : '/dashboard'} roleKey={role}>
    {children}
  </ApplicationShell>
}
