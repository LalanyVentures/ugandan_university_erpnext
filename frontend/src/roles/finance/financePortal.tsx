import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { callMethod, type FrappeRow } from '../../api/frappe'

export type FinancePortalData = {
  officer: FrappeRow
  university: FrappeRow
  students: FrappeRow[]
  enrolments: FrappeRow[]
  fee_structures: FrappeRow[]
  invoices: FrappeRow[]
  payments: FrappeRow[]
  sponsorships: FrappeRow[]
  clearance: FrappeRow[]
  semesters: FrappeRow[]
}
type FinanceState = { data: FinancePortalData | null; loading: boolean; error: string; refresh: () => void }
const FinanceContext = createContext<FinanceState | null>(null)
const method = 'ugandan_university_education.ugandan_university_education.api.get_finance_portal_data'

export function FinancePortalProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<FinancePortalData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  function refresh() {
    setLoading(true); setError('')
    callMethod<FinancePortalData>(method).then(setData).catch(cause => setError(cause instanceof Error ? cause.message : 'Unable to load the finance workspace.')).finally(() => setLoading(false))
  }
  useEffect(refresh, [])
  return <FinanceContext.Provider value={{ data, loading, error, refresh }}>{children}</FinanceContext.Provider>
}
export function useFinancePortal() {
  const value = useContext(FinanceContext)
  if (!value) throw new Error('useFinancePortal must be used inside FinancePortalProvider')
  return value
}
