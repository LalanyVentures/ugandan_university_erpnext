import { useEffect, useMemo, useState } from 'react'
import { ArrowRight, BarChart3, CalendarClock, CheckCircle2, CircleAlert, Coins, FileBadge2, FileSpreadsheet, Search, UserRound, WalletCards } from 'lucide-react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { fetchList, type FrappeRow, ugx } from '../../../../api/frappe'

type StudentAccount = {
  id: string
  label: string
  number: string
  invoices: FrappeRow[]
  invoiced: number
  paid: number
  balance: number
  overdue: number
  collection: number
}
type FeeStructure = { name:string; structure_name?:string; academic_programme?:string; academic_semester?:string; status?:string }
export type FinancialAnalysisSource = { students:FrappeRow[]; invoices:FrappeRow[]; feeStructures:FrappeRow[] }

const money = (value: unknown) => Number(value ?? 0)

export function FinancialAnalysisPage({source,financeMode=false}:{source?:FinancialAnalysisSource;financeMode?:boolean} = {}) {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const [students, setStudents] = useState<FrappeRow[]>([])
  const [invoices, setInvoices] = useState<FrappeRow[]>([])
  const [feeStructures, setFeeStructures] = useState<FeeStructure[]>([])
  const [loading, setLoading] = useState(true)
  const [query, setQuery] = useState(searchParams.get('q') ?? searchParams.get('student') ?? '')
  const selectedId = searchParams.get('student') ?? ''

  useEffect(() => {
    if (source) {
      setStudents(source.students)
      setInvoices(source.invoices.filter(row => Number(row.docstatus) === 1))
      setFeeStructures(source.feeStructures as FeeStructure[])
      setLoading(false)
      return
    }
    Promise.all([
      fetchList('Student', ['name', 'student_name', 'student_number', 'customer', 'status'], undefined, 3000),
      fetchList('Sales Invoice', ['name', 'student', 'customer', 'university_fee_structure', 'academic_semester', 'posting_date', 'due_date', 'grand_total', 'outstanding_amount', 'status', 'docstatus'], undefined, 5000),
      fetchList('University Fee Structure', ['name', 'structure_name', 'academic_programme', 'academic_semester', 'status'], undefined, 2000),
    ]).then(([studentRows, invoiceRows, structureRows]) => {
      setStudents(studentRows)
      setInvoices(invoiceRows.filter(row => Number(row.docstatus) === 1))
      setFeeStructures(structureRows as FeeStructure[])
    }).finally(() => setLoading(false))
  }, [source])

  const accounts = useMemo<StudentAccount[]>(() => {
    const today = new Date().toISOString().slice(0, 10)
    return students.map(student => {
      const id = String(student.name)
      const customer = String(student.customer ?? '')
      const rows = invoices.filter(invoice => String(invoice.student ?? '') === id || Boolean(customer && String(invoice.customer ?? '') === customer))
      const invoiced = rows.reduce((sum, row) => sum + money(row.grand_total), 0)
      const balance = rows.reduce((sum, row) => sum + money(row.outstanding_amount), 0)
      const paid = Math.max(0, invoiced - balance)
      const overdue = rows.filter(row => String(row.due_date ?? '') < today).reduce((sum, row) => sum + money(row.outstanding_amount), 0)
      const collection = invoiced ? Math.round((paid / invoiced) * 100) : 100
      return { id, label:String(student.student_name ?? id), number:String(student.student_number ?? id), invoices:rows, invoiced, paid, balance, overdue, collection }
    }).sort((a,b) => b.balance - a.balance)
  }, [students, invoices])

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase()
    return accounts.filter(account => !needle || `${account.label} ${account.number} ${account.id}`.toLowerCase().includes(needle))
  }, [accounts, query])
  const selected = accounts.find(account => account.id === selectedId)
  const selectedStructureRows = useMemo(() => {
    if (!selected) return []
    const groups = new Map<string, FrappeRow[]>()
    selected.invoices.forEach(invoice => {
      const key = String(invoice.university_fee_structure ?? 'No linked fee structure')
      groups.set(key, [...(groups.get(key) ?? []), invoice])
    })
    return [...groups.entries()].map(([key, rows]) => {
      const structure = feeStructures.find(item => item.name === key)
      const assessed = rows.reduce((sum,row) => sum + money(row.grand_total), 0)
      const outstanding = rows.reduce((sum,row) => sum + money(row.outstanding_amount), 0)
      return { key, name:structure?.structure_name ?? key, semester:structure?.academic_semester ?? (rows.map(row=>String(row.academic_semester ?? '')).filter(Boolean).join(', ') || 'Unassigned semester'), programme:structure?.academic_programme ?? '—', assessed, paid:Math.max(0, assessed-outstanding), outstanding, status:outstanding === 0 ? 'Settled' : outstanding < assessed ? 'Partly settled' : 'Outstanding' }
    }).sort((a,b)=>b.outstanding-a.outstanding)
  }, [feeStructures, selected])
  const ledger = useMemo(() => {
    if (!selected) return []
    const groups = new Map<string, FrappeRow[]>()
    selected.invoices.forEach(invoice => {
      const semester = String(invoice.academic_semester ?? 'Unassigned semester')
      groups.set(semester, [...(groups.get(semester) ?? []), invoice])
    })
    let opening = 0
    return [...groups.entries()].sort((a,b) => String(a[1][0]?.posting_date ?? a[0]).localeCompare(String(b[1][0]?.posting_date ?? b[0]))).map(([semester, rows]) => {
      const charges = rows.reduce((sum,row) => sum + money(row.grand_total), 0)
      const currentOutstanding = rows.reduce((sum,row) => sum + money(row.outstanding_amount), 0)
      const payments = Math.max(0, charges - currentOutstanding)
      const closing = opening + charges - payments
      const entry = { semester, opening, charges, payments, closing, invoices:rows.length }
      opening = closing
      return entry
    })
  }, [selected])

  const totals = useMemo(() => accounts.reduce((sum, account) => ({ billed:sum.billed+account.invoiced, paid:sum.paid+account.paid, balance:sum.balance+account.balance }), {billed:0,paid:0,balance:0}), [accounts])

  function selectStudent(id:string) {
    setSearchParams({ student:id }, {replace:true})
    setQuery(id)
  }

  return <section className="records-page financial-analysis-page">
    <div className="page-intro"><div><span className="eyebrow">STUDENT ACCOUNT CONTROL</span><h1><BarChart3 size={28}/>Financial Analysis</h1><p>Review semester costs, payments, balances carried forward and the amount remaining for every student.</p></div></div>
    <section className="analysis-kpi-grid">
      <AnalysisMetric label="Total billed" value={ugx(totals.billed)} detail="submitted student charges" />
      <AnalysisMetric label="Payments received" value={ugx(totals.paid)} detail="allocated against invoices" />
      <AnalysisMetric label="Outstanding balance" value={ugx(totals.balance)} detail="amount left to pay" />
      <AnalysisMetric label="Students analysed" value={accounts.length} detail="active student accounts" />
    </section>

    <article className="card records-table-card">
      <div className="table-toolbar"><div><h3>Student finance register</h3><p>Select a student to inspect semester costs and balance movement.</p></div><label className="search-input"><Search size={16}/><input value={query} onChange={event=>{setQuery(event.target.value);setSearchParams(event.target.value?{q:event.target.value}:{},{replace:true})}} placeholder="Search student or registration number"/></label></div>
      <div className="table-wrap"><table className="data-table"><thead><tr><th>Student</th><th>Total Cost</th><th>Paid</th><th>Balance to Pay</th><th>Overdue</th><th>Collection</th><th>Actions</th></tr></thead><tbody>{loading?<tr><td colSpan={7} className="data-table-empty">Loading student accounts…</td></tr>:filtered.length?filtered.map(account=><tr key={account.id} className={selectedId===account.id?'selected-payment-row':''}><td><strong>{account.label}</strong><small>{account.number}</small></td><td>{ugx(account.invoiced)}</td><td>{ugx(account.paid)}</td><td><strong>{ugx(account.balance)}</strong></td><td>{ugx(account.overdue)}</td><td>{account.collection}%</td><td><div className="table-row-actions"><button onClick={()=>selectStudent(account.id)}><WalletCards size={14}/>Analyse</button><button onClick={()=>navigate(`/students/profile/${encodeURIComponent(account.id)}`)}><UserRound size={14}/>Profile</button><button onClick={()=>navigate(`/transcripts?student=${encodeURIComponent(account.id)}`)}><FileBadge2 size={14}/>Transcript</button></div></td></tr>):<tr><td colSpan={7} className="data-table-empty">No matching student accounts.</td></tr>}</tbody></table></div>
    </article>

    {selected?<article className="card analysis-detail-card"><div className="analysis-detail-heading"><div><span className="eyebrow">ACCOUNT ANALYSIS</span><h2>{selected.label}</h2><p>{selected.number} · {selected.invoices.length} submitted invoices · semester-by-semester account view</p></div><div className="analysis-detail-actions"><button onClick={()=>navigate(`/finance/payments?q=${encodeURIComponent(selected.number)}`)}>Find receipts <ArrowRight size={14}/></button><button onClick={()=>navigate(`/students/profile/${encodeURIComponent(selected.id)}`)}>Student profile <ArrowRight size={14}/></button></div></div><section className="student-finance-metrics"><FinanceMetric icon={Coins} label="Assessed cost" value={ugx(selected.invoiced)} detail="all submitted charges"/><FinanceMetric icon={CheckCircle2} label="Paid to date" value={ugx(selected.paid)} detail={`${selected.collection}% collected`} tone="good"/><FinanceMetric icon={CircleAlert} label="Balance to pay" value={ugx(selected.balance)} detail={selected.overdue?`${ugx(selected.overdue)} overdue`:'currently outstanding'} tone={selected.balance?'balance':''}/><FinanceMetric icon={CalendarClock} label="Invoices" value={selected.invoices.length} detail="semester billing records"/></section><section className="fee-structure-analysis"><div className="analysis-section-heading"><div><span className="eyebrow">FEE STRUCTURE COVERAGE</span><h3>What this student paid for</h3></div><FileSpreadsheet size={22}/></div><div className="table-wrap"><table className="data-table"><thead><tr><th>Fee Structure</th><th>Programme / Semester</th><th>Assessed</th><th>Paid</th><th>Balance to Pay</th><th>Coverage</th><th>Status</th></tr></thead><tbody>{selectedStructureRows.length?selectedStructureRows.map(row=>{const coverage=row.assessed?Math.round(row.paid/row.assessed*100):0;return <tr key={row.key}><td><strong>{row.name}</strong><small>{row.key==='No linked fee structure'?'Invoice is not linked to a fee structure':row.key}</small></td><td>{row.programme}<small>{row.semester}</small></td><td>{ugx(row.assessed)}</td><td>{ugx(row.paid)}</td><td><strong>{ugx(row.outstanding)}</strong></td><td><div className="coverage-cell"><span><i style={{width:`${coverage}%`}}/></span><b>{coverage}%</b></div></td><td><span className={`status-pill ${row.outstanding===0?'tone-green':row.paid?'tone-gold':'tone-red'}`}>{row.status}</span></td></tr>}) : <tr><td colSpan={7} className="data-table-empty">No fee-linked invoices are available for this student.</td></tr>}</tbody></table></div></section><section className="semester-ledger"><div className="analysis-section-heading"><div><span className="eyebrow">TIME-BASED ACCOUNT MOVEMENT</span><h3>Balance carried forward by semester</h3></div><BarChart3 size={22}/></div><table className="data-table"><thead><tr><th>Academic Semester</th><th>Opening Balance</th><th>Semester Charges</th><th>Payments</th><th>Balance to Pay</th><th>Invoices</th><th>Actions</th></tr></thead><tbody>{ledger.map(row=><tr key={row.semester}><td><strong>{row.semester}</strong></td><td>{ugx(row.opening)}</td><td>{ugx(row.charges)}</td><td>{ugx(row.payments)}</td><td><strong>{ugx(row.closing)}</strong></td><td>{row.invoices}</td><td><div className="table-row-actions"><button onClick={()=>navigate(`/finance/invoices?q=${encodeURIComponent(row.semester)}`)}>Invoices</button><button onClick={()=>navigate(`/finance/payments?q=${encodeURIComponent(selected.number)}`)}>Receipts</button></div></td></tr>)}</tbody></table></section><p className="balance-note">Opening balance is the previous semester's closing balance. Charges are amounts assessed for that semester, payments are the paid portion of those invoices, and closing balance is what carries into the next period.</p></article>:null}
  </section>
}

function AnalysisMetric({label,value,detail}:{label:string;value:string|number;detail:string}) {
  return <article className="card analysis-metric"><span>{label}</span><strong>{value}</strong><small>{detail}</small></article>
}

function FinanceMetric({icon:Icon,label,value,detail,tone='neutral'}:{icon:typeof Coins;label:string;value:string|number;detail:string;tone?:string}) {
  return <article className={`card finance-detail-metric finance-detail-${tone}`}><span className="finance-detail-icon"><Icon size={19}/></span><div><small>{label}</small><strong>{value}</strong><p>{detail}</p></div></article>
}
