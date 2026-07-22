import { useEffect, useMemo, useState } from 'react'
import { AlertTriangle, ArrowRight, FileBadge2, Search, UserRound, WalletCards } from 'lucide-react'
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
  risk: 'High' | 'Medium' | 'Low'
}

const money = (value: unknown) => Number(value ?? 0)

function accountRisk(balance: number, overdue: number, collection: number): StudentAccount['risk'] {
  if (overdue > 0 && collection < 50) return 'High'
  if (balance > 0) return 'Medium'
  return 'Low'
}

export function FinancialRiskPage() {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const [students, setStudents] = useState<FrappeRow[]>([])
  const [invoices, setInvoices] = useState<FrappeRow[]>([])
  const [loading, setLoading] = useState(true)
  const [query, setQuery] = useState(searchParams.get('q') ?? searchParams.get('student') ?? '')
  const selectedId = searchParams.get('student') ?? ''

  useEffect(() => {
    Promise.all([
      fetchList('Student', ['name', 'student_name', 'student_number', 'customer', 'status'], undefined, 3000),
      fetchList('Sales Invoice', ['name', 'student', 'customer', 'academic_semester', 'posting_date', 'due_date', 'grand_total', 'outstanding_amount', 'status', 'docstatus'], undefined, 5000),
    ]).then(([studentRows, invoiceRows]) => {
      setStudents(studentRows)
      setInvoices(invoiceRows.filter(row => Number(row.docstatus) === 1))
    }).finally(() => setLoading(false))
  }, [])

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
      return { id, label:String(student.student_name ?? id), number:String(student.student_number ?? id), invoices:rows, invoiced, paid, balance, overdue, collection, risk:accountRisk(balance, overdue, collection) }
    }).sort((a,b) => b.balance - a.balance)
  }, [students, invoices])

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase()
    return accounts.filter(account => !needle || `${account.label} ${account.number} ${account.id} ${account.risk}`.toLowerCase().includes(needle))
  }, [accounts, query])
  const selected = accounts.find(account => account.id === selectedId)
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

  const totals = useMemo(() => accounts.reduce((sum, account) => ({ billed:sum.billed+account.invoiced, paid:sum.paid+account.paid, balance:sum.balance+account.balance, high:sum.high+(account.risk==='High'?1:0) }), {billed:0,paid:0,balance:0,high:0}), [accounts])

  function selectStudent(id:string) {
    setSearchParams({ student:id }, {replace:true})
    setQuery(id)
  }

  return <section className="records-page financial-risk-page">
    <div className="page-intro"><div><span className="eyebrow">STUDENT ACCOUNT CONTROL</span><h1><AlertTriangle size={28}/>Financial Risk & Balance Analysis</h1><p>Track semester costs, receipts, overdue exposure and balances carried forward for every student.</p></div></div>
    <section className="risk-kpi-grid">
      <RiskMetric label="Total billed" value={ugx(totals.billed)} detail="submitted student charges" />
      <RiskMetric label="Payments received" value={ugx(totals.paid)} detail="allocated against invoices" />
      <RiskMetric label="Outstanding balance" value={ugx(totals.balance)} detail="current student debt" />
      <RiskMetric label="High-risk accounts" value={totals.high} detail="overdue with low collection" danger={totals.high > 0} />
    </section>

    <article className="card records-table-card">
      <div className="table-toolbar"><div><h3>Student finance register</h3><p>Select a student to inspect semester costs and balance movement.</p></div><label className="search-input"><Search size={16}/><input value={query} onChange={event=>{setQuery(event.target.value);setSearchParams(event.target.value?{q:event.target.value}:{},{replace:true})}} placeholder="Search student, registration number or risk"/></label></div>
      <div className="table-wrap"><table className="data-table"><thead><tr><th>Student</th><th>Total Cost</th><th>Paid</th><th>Balance</th><th>Overdue</th><th>Collection</th><th>Risk</th><th>Actions</th></tr></thead><tbody>{loading?<tr><td colSpan={8} className="data-table-empty">Loading student accounts…</td></tr>:filtered.length?filtered.map(account=><tr key={account.id} className={selectedId===account.id?'selected-payment-row':''}><td><strong>{account.label}</strong><small>{account.number}</small></td><td>{ugx(account.invoiced)}</td><td>{ugx(account.paid)}</td><td><strong>{ugx(account.balance)}</strong></td><td>{ugx(account.overdue)}</td><td>{account.collection}%</td><td><span className={`status-pill risk-${account.risk.toLowerCase()}`}>{account.risk}</span></td><td><div className="table-row-actions"><button onClick={()=>selectStudent(account.id)}><WalletCards size={14}/>Analyse</button><button onClick={()=>navigate(`/students/profile/${encodeURIComponent(account.id)}`)}><UserRound size={14}/>Profile</button><button onClick={()=>navigate(`/transcripts?student=${encodeURIComponent(account.id)}`)}><FileBadge2 size={14}/>Transcript</button></div></td></tr>):<tr><td colSpan={8} className="data-table-empty">No matching student accounts.</td></tr>}</tbody></table></div>
    </article>

    {selected?<article className="card risk-detail-card"><div className="risk-detail-heading"><div><span className="eyebrow">ACCOUNT ANALYSIS</span><h2>{selected.label}</h2><p>{selected.number} · {selected.invoices.length} submitted invoices</p></div><div className="risk-detail-actions"><button onClick={()=>navigate(`/finance/payments?q=${encodeURIComponent(selected.number)}`)}>Find receipts <ArrowRight size={14}/></button><button onClick={()=>navigate(`/students/profile/${encodeURIComponent(selected.id)}`)}>Student profile <ArrowRight size={14}/></button></div></div><section className="semester-ledger"><table className="data-table"><thead><tr><th>Academic Semester</th><th>Opening Balance</th><th>Semester Charges</th><th>Payments</th><th>Closing Balance</th><th>Invoices</th><th>Actions</th></tr></thead><tbody>{ledger.map(row=><tr key={row.semester}><td><strong>{row.semester}</strong></td><td>{ugx(row.opening)}</td><td>{ugx(row.charges)}</td><td>{ugx(row.payments)}</td><td><strong>{ugx(row.closing)}</strong></td><td>{row.invoices}</td><td><div className="table-row-actions"><button onClick={()=>navigate(`/finance/invoices?q=${encodeURIComponent(row.semester)}`)}>Invoices</button><button onClick={()=>navigate(`/finance/payments?q=${encodeURIComponent(selected.number)}`)}>Receipts</button></div></td></tr>)}</tbody></table></section><p className="balance-note">Opening balance is the previous semester's closing balance. Payments represent amounts allocated against invoices in each semester; the closing balance becomes the next semester's balance carried forward.</p></article>:null}
  </section>
}

function RiskMetric({label,value,detail,danger=false}:{label:string;value:string|number;detail:string;danger?:boolean}) {
  return <article className={`card risk-metric ${danger?'risk-metric-danger':''}`}><span>{label}</span><strong>{value}</strong><small>{detail}</small></article>
}
