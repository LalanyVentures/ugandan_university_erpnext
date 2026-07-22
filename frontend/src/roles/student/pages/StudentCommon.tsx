import type { ReactNode } from 'react'
import { RefreshCw } from 'lucide-react'
import { useStudentPortal } from '../studentPortal'

export function StudentPageState({children}:{children:(data:NonNullable<ReturnType<typeof useStudentPortal>['data']>)=>ReactNode}) {
  const {data,loading,error,refresh}=useStudentPortal()
  if(loading) return <section className="student-state card"><span className="student-state-spinner"/><h2>Opening your student records</h2><p>Please wait while the university portal prepares your information.</p></section>
  if(error||!data) return <section className="student-state card"><h2>We could not open your records</h2><p>{error||'No student information was returned.'}</p><button className="primary-button" onClick={refresh}><RefreshCw size={16}/>Try again</button></section>
  return <>{children(data)}</>
}

export function StudentMetric({icon:Icon,label,value,detail,tone='green'}:{icon:any;label:string;value:string|number;detail:string;tone?:string}) {
  return <article className="student-portal-metric card"><span className={`student-portal-metric-icon tone-${tone}`}><Icon size={20}/></span><div><small>{label}</small><strong>{value}</strong><p>{detail}</p></div></article>
}

export function formatStudentDate(value:unknown) {
  if(!value) return '—'
  const text=String(value), date=new Date(text.length===10?`${text}T00:00:00`:text.replace(' ','T'))
  return Number.isNaN(date.getTime())?text:new Intl.DateTimeFormat('en-UG',{day:'2-digit',month:'short',year:'numeric'}).format(date)
}

export function StudentStatus({children,tone='green'}:{children:ReactNode;tone?:'green'|'gold'|'danger'|'blue'}) {
  return <span className={`status-pill tone-${tone}`}>{children}</span>
}
