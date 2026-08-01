import { AlertTriangle, Inbox, LoaderCircle, LockKeyhole } from 'lucide-react'
import type { ReactNode } from 'react'

type Variant = 'loading' | 'empty' | 'error' | 'permission'
const states = {
  loading: { Icon: LoaderCircle, title: 'Loading workspace', message: 'Preparing the latest University information.' },
  empty: { Icon: Inbox, title: 'Nothing here yet', message: 'No records match this view or its current filters.' },
  error: { Icon: AlertTriangle, title: 'Something went wrong', message: 'The University service could not complete this request.' },
  permission: { Icon: LockKeyhole, title: 'Permission required', message: 'Your current University role cannot open this area.' },
} as const

export function ShellStatePanel({ variant, title, message, action }: { variant: Variant; title?: string; message?: string; action?: ReactNode }) {
  const state = states[variant]
  return <section className={`shell-state-panel card shell-state-${variant}`} role={variant === 'error' ? 'alert' : 'status'} aria-live="polite"><state.Icon size={30} aria-hidden="true" /><h2>{title ?? state.title}</h2><p>{message ?? state.message}</p>{variant === 'loading' ? <div className="shell-skeleton-lines" aria-hidden="true"><i /><i /><i /></div> : action}</section>
}
