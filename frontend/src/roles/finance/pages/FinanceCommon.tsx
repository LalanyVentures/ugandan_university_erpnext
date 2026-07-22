import type { ReactNode } from 'react'
import { RefreshCw } from 'lucide-react'
import { useFinancePortal } from '../financePortal'

export function FinancePageState({ children }: { children: (data: NonNullable<ReturnType<typeof useFinancePortal>['data']>) => ReactNode }) {
  const { data, loading, error, refresh } = useFinancePortal()
  if (loading) return <section className="student-state card"><span className="student-state-spinner"/><h2>Preparing the finance workspace</h2><p>Student accounts, billing and collection records are loading.</p></section>
  if (error || !data) return <section className="student-state card"><h2>We could not open finance records</h2><p>{error || 'No finance information was returned.'}</p><button className="primary-button" onClick={refresh}><RefreshCw size={16}/>Try again</button></section>
  return <>{children(data)}</>
}
export function FinanceMetric({ icon: Icon, label, value, detail, tone = 'green' }: { icon: any; label: string; value: string | number; detail: string; tone?: string }) {
  return <article className="student-portal-metric card"><span className={`student-portal-metric-icon tone-${tone}`}><Icon size={20}/></span><div><small>{label}</small><strong>{value}</strong><p>{detail}</p></div></article>
}
export function FinanceIntro({ icon: Icon, eyebrow, title, description, action }: { icon: any; eyebrow: string; title: string; description: string; action?: ReactNode }) {
  return <div className="page-intro"><div><span className="eyebrow">{eyebrow}</span><h1><Icon size={28}/>{title}</h1><p>{description}</p></div>{action}</div>
}
export function FinanceStatus({ children, tone = 'green' }: { children: ReactNode; tone?: 'green' | 'gold' | 'danger' | 'blue' }) { return <span className={`status-pill tone-${tone}`}>{children}</span> }
export function financeDate(value: unknown) { if (!value) return '—'; const text = String(value), date = new Date(text.length === 10 ? `${text}T00:00:00` : text.replace(' ', 'T')); return Number.isNaN(date.getTime()) ? text : new Intl.DateTimeFormat('en-UG', { day: '2-digit', month: 'short', year: 'numeric' }).format(date) }
export function accountTone(balance: number, total = balance) { return balance === 0 ? 'green' : balance < total ? 'gold' : 'danger' }
