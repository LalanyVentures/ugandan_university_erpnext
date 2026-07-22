import { useEffect, useMemo, useState } from 'react'
import { ArrowRight, Award, BookOpenCheck, CalendarDays, CreditCard, FileBadge, GraduationCap, ReceiptText, ShieldCheck, TrendingUp, UserPlus, UserRound, Users, WalletCards } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { fetchList, ugx, type FrappeRow, type UniversitySession } from '../../../../api/frappe'
import { portalRoleFor, type PortalRole } from '../../roleConfig'

type Snapshot = { students: number; programmes: number; cohorts: number; registrations: number; results: number; transcripts: number; invoiced: number; outstanding: number; invoices: FrappeRow[]; live: boolean }
const initial: Snapshot = { students: 0, programmes: 0, cohorts: 0, registrations: 0, results: 0, transcripts: 0, invoiced: 0, outstanding: 0, invoices: [], live: false }

const dashboardCopy: Record<PortalRole, {title:string;description:string;desk:string}> = {
  administrator: {title:'Academic Operations And Student Services',description:'Manage the complete AWU student journey from application and cohort placement to fees, approved results, clearance and official transcripts.',desk:'Academic control desk'},
  registrar: {title:'Registrar And Academic Affairs',description:'Coordinate admissions, programme enrolment, semester registration, academic governance and controlled transcript services.',desk:'Registrar control desk'},
  'faculty-head': {title:'Faculty Academic Oversight',description:'Monitor programmes, teaching delivery, assessments, results approval and transcript readiness across the faculty.',desk:'Faculty oversight desk'},
  lecturer: {title:'Teaching And Assessment Workspace',description:'Work with assigned course offerings, class schedules, attendance, assessments and student marks.',desk:'Lecturer teaching desk'},
  finance: {title:'Student Finance And Receipts',description:'Monitor fee structures, student invoices, payments, balances, sponsorships and financial clearance.',desk:'Finance control desk'},
  student: {title:'My Academic Journey',description:'Review registration, courses, results, fee payments, balances, clearance and available academic documents.',desk:'Student services desk'},
  staff: {title:'University Staff Workspace',description:'Access the university services permitted for your assigned role.',desk:'University services desk'},
}

export function DashboardPage({session}:{session?:UniversitySession}) {
  const navigate = useNavigate()
  const [data, setData] = useState(initial)
  const portalRole = portalRoleFor(session?.roles ?? ['System Manager'])
  const copy = dashboardCopy[portalRole]
  const heroActions = portalRole === 'finance'
    ? [{label:'Payment receipts',path:'/finance/payments'},{label:'Financial analysis',path:'/finance/analysis'}]
    : portalRole === 'lecturer'
      ? [{label:'Course offerings',path:'/registration/offerings'},{label:'Assessments',path:'/results/assessments'}]
      : portalRole === 'faculty-head'
        ? [{label:'Faculty results',path:'/results'},{label:'Approval batches',path:'/results/approvals'}]
        : portalRole === 'student'
          ? [{label:'My profile',path:'/students/profile'},{label:'My registration',path:'/registration'}]
          : [{label:'Student records',path:'/students'},{label:'Registration',path:'/registration'}]

  useEffect(() => {
    Promise.allSettled([
      fetchList('Student', ['name', 'student_name', 'status']), fetchList('Academic Programme', ['name']), fetchList('Student Cohort', ['name']),
      fetchList('Course Registration', ['name']), fetchList('Student Course Result', ['name', 'approval_status', 'result_status']), fetchList('Academic Transcript', ['name', 'status']),
      fetchList('Sales Invoice', ['name', 'student', 'academic_semester', 'grand_total', 'outstanding_amount', 'status', 'posting_date'], undefined, 200),
    ]).then(results => {
      const rows = results.map(result => result.status === 'fulfilled' ? result.value : [])
      const [students, programmes, cohorts, registrations, courseResults, transcripts, invoices] = rows
      setData({ students: students.length, programmes: programmes.length, cohorts: cohorts.length, registrations: registrations.length, results: courseResults.length, transcripts: transcripts.length, invoiced: invoices.reduce((sum,row)=>sum+Number(row.grand_total??0),0), outstanding: invoices.reduce((sum,row)=>sum+Number(row.outstanding_amount??0),0), invoices, live: results.some(result => result.status === 'fulfilled') })
    })
  }, [])

  const paid = Math.max(0, data.invoiced - data.outstanding)
  const collection = data.invoiced ? Math.round((paid / data.invoiced) * 100) : 0
  const watchlist = useMemo(() => [
    { label: 'Semester registrations', detail: `${data.registrations} course registrations captured`, status: 'Open', tone: 'green' },
    { label: 'Result approvals', detail: `${data.results} result records under governance`, status: 'Review', tone: 'gold' },
    { label: 'Student finance', detail: `${ugx(data.outstanding)} outstanding`, status: collection >= 70 ? 'Healthy' : 'Attention', tone: collection >= 70 ? 'green' : 'danger' },
  ], [collection, data])

  return <section className="dashboard-page">
    <section className="secretary-hero">
      <article className="secretary-hero-copy card">
        <div className="secretary-hero-content"><span className="secretary-hero-eyebrow">ANKOLE WESTERN UNIVERSITY</span><h2>{copy.title}</h2><p>{copy.description}</p><div className="secretary-hero-meta"><span>{data.students} Students</span><span>{data.programmes} Programmes</span><span>{data.cohorts} Cohorts</span></div><div className="hero-action-row"><button className="primary-button light" onClick={() => navigate(heroActions[0].path)}><UserPlus size={16} />{heroActions[0].label}</button><button className="secondary-button translucent" onClick={() => navigate(heroActions[1].path)}><BookOpenCheck size={16} />{heroActions[1].label}</button></div></div>
        <div className="dashboard-watchlist"><div className="preview-header"><div className="preview-icon"><img src="/awu-logo.png" alt="" /></div><div><strong>AWU Watchlist</strong><span>{data.live ? 'Connected to university records' : 'Preview data while connecting'}</span></div></div><div className="preview-list">{watchlist.map(item => <div className="preview-row" key={item.label}><div><strong>{item.label}</strong><span>{item.detail}</span></div><Status tone={item.tone}>{item.status}</Status></div>)}</div><div className="preview-foot"><div><strong>{data.students}</strong><span>Students</span></div><div><strong>{collection}%</strong><span>Collected</span></div><div><strong>{data.results}</strong><span>Results</span></div></div></div>
      </article>
      <article className="card activity-card"><div><span className="eyebrow">CURRENT SEMESTER</span><h3>{copy.desk}</h3><p>Quick checks for registration, results and finance before operational work begins.</p></div><div className="activity-date"><CalendarDays size={28} /><div><strong>2026 Semester 1</strong><span>Registration and assessment cycle</span></div></div><div className="mini-stat-grid"><div><strong>{data.registrations}</strong><span>Registrations</span></div><div><strong>{ugx(paid)}</strong><span>Fees received</span></div></div><div className="mini-links"><button onClick={() => navigate('/finance')}>Student balances</button><button onClick={() => navigate('/results')}>Approval queue</button><button onClick={() => navigate('/transcripts')}>Transcripts</button></div></article>
    </section>

    <section className="dashboard-kpi-grid">
      <Metric icon={Users} label="Active Students" value={data.students} detail="registered student records" tone="blue" onClick={() => navigate('/students')} />
      <Metric icon={GraduationCap} label="Programmes" value={data.programmes} detail="academic programmes" tone="violet" onClick={() => navigate('/academics')} />
      <Metric icon={CreditCard} label="Outstanding Fees" value={ugx(data.outstanding)} detail={`${collection}% collection rate`} tone="gold" onClick={() => navigate('/finance')} />
      <Metric icon={Award} label="Results" value={data.results} detail="course result records" tone="green" onClick={() => navigate('/results')} />
      <Metric icon={FileBadge} label="Transcripts" value={data.transcripts} detail="controlled transcript records" tone="rose" onClick={() => navigate('/transcripts')} />
    </section>

    <section className="dashboard-content-grid">
      <article className="card chart-card"><div className="section-heading"><div><span className="eyebrow">ENROLMENT TREND</span><h3>Student activity</h3></div><span className="trend-chip"><TrendingUp size={14} />12.8%</span></div><div className="chart-summary"><strong>{data.students}</strong><span>active student records across the university</span></div><div className="bar-chart">{[42,58,48,76,65,88,72].map((height,index)=><div className="bar-column" key={index}><div><i style={{height:`${height}%`}} /></div><span>{['Dec','Jan','Feb','Mar','Apr','May','Jun'][index]}</span></div>)}</div></article>
      <article className="card quick-actions"><div className="section-heading"><div><span className="eyebrow">QUICK ACTIONS</span><h3>Most used tools</h3></div></div><Quick icon={Users} label="Register a student" detail="Admissions and student records" onClick={()=>navigate('/students')} /><Quick icon={BookOpenCheck} label="Open course registration" detail="Semester academic operations" onClick={()=>navigate('/registration')} /><Quick icon={CreditCard} label="Review student balances" detail="Invoices, payments and arrears" onClick={()=>navigate('/finance')} /><Quick icon={ShieldCheck} label="Approve results" detail="Faculty and Senate workflow" onClick={()=>navigate('/results')} /></article>
    </section>

    <article className="card table-card"><div className="section-heading"><div><span className="eyebrow">RECENT FINANCE ACTIVITY</span><h3>Latest student balances</h3></div><button className="inline-link" onClick={()=>navigate('/finance')}>View all <ArrowRight size={15} /></button></div><InvoiceTable rows={data.invoices.slice(0,6)} /></article>
  </section>
}

function Status({ tone, children }: { tone: string; children: string }) { return <span className={`status-pill tone-${tone}`}>{children}</span> }
function Metric({ icon: Icon, label, value, detail, tone, onClick }: { icon: typeof Users; label: string; value: string|number; detail: string; tone: string; onClick:()=>void }) { return <button className="dashboard-metric-card" onClick={onClick}><span className={`dashboard-metric-icon tone-${tone}`}><Icon size={21} /></span><span className="metric-copy"><strong>{value}</strong><span>{label}</span><p>{detail}</p></span><ArrowRight className="dashboard-metric-arrow" size={16} /></button> }
function Quick({ icon: Icon, label, detail, onClick }: { icon: typeof Users; label:string; detail:string; onClick:()=>void }) { return <button className="quick-action" onClick={onClick}><span className="quick-icon"><Icon size={18}/></span><span><strong>{label}</strong><small>{detail}</small></span><ArrowRight size={15}/></button> }
export function InvoiceTable({ rows }: { rows:FrappeRow[] }) {
  const navigate = useNavigate()
  return <div className="table-wrap"><table className="data-table"><thead><tr><th>Student</th><th>Semester</th><th>Invoice</th><th>Paid</th><th>Balance</th><th>Status</th><th>Actions</th></tr></thead><tbody>{rows.length ? rows.map((row,index)=>{const total=Number(row.grand_total??0), balance=Number(row.outstanding_amount??0), student=String(row.student??''), search=String(row.customer||student||row.name||'');return <tr key={String(row.name??index)}><td><strong>{String(row.student??row.customer??'Student account')}</strong><small>{String(row.name??'Sales Invoice')}</small></td><td>{String(row.academic_semester??'Current semester')}</td><td>{ugx(total)}</td><td>{ugx(total-balance)}</td><td><strong>{ugx(balance)}</strong></td><td><Status tone={balance===0?'green':balance<total?'gold':'danger'}>{balance===0?'Paid':balance<total?'Partly Paid':'Outstanding'}</Status></td><td><div className="table-row-actions">{student?<button onClick={()=>navigate(`/students/profile/${encodeURIComponent(student)}`)}><UserRound size={14}/>Profile</button>:null}<button onClick={()=>navigate(`/finance/analysis?${student?`student=${encodeURIComponent(student)}`:`q=${encodeURIComponent(search)}`}`)}><WalletCards size={14}/>Balance</button><button onClick={()=>navigate(`/finance/payments?q=${encodeURIComponent(search)}`)}><ReceiptText size={14}/>Receipts</button></div></td></tr>}) : <tr><td colSpan={7} className="data-table-empty">No submitted student invoices are available yet.</td></tr>}</tbody></table></div>
}
