import { ChartNoAxesCombined, CircleAlert, ReceiptText, Search, UsersRound, WalletCards } from 'lucide-react'
import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { ugx } from '../../../../api/frappe'
import { accountTone, FinanceIntro, FinanceMetric, FinancePageState, FinanceStatus } from '../FinanceCommon'

export function FinanceAccountsPage() {
  const navigate = useNavigate(), [params, setParams] = useSearchParams(), [query, setQuery] = useState(params.get('q') ?? '')
  return <FinancePageState>{data => {
    const accounts = data.students.map(student => {
      const invoices = data.invoices.filter(row => Number(row.docstatus) === 1 && (String(row.student ?? '') === String(student.name) || String(row.customer ?? '') === String(student.customer)))
      const assessed = invoices.reduce((sum, row) => sum + Number(row.grand_total ?? 0), 0), balance = invoices.reduce((sum, row) => sum + Number(row.outstanding_amount ?? 0), 0)
      return { student, invoices, assessed, paid: assessed - balance, balance }
    }).filter(account => !query || JSON.stringify(account.student).toLowerCase().includes(query.toLowerCase()))
    const total = accounts.reduce((sum, row) => sum + row.assessed, 0), balance = accounts.reduce((sum, row) => sum + row.balance, 0)
    return <section className="student-portal-page"><FinanceIntro icon={UsersRound} eyebrow="STUDENT ACCOUNT REGISTER" title="Student Accounts" description="Search every student account, monitor assessed fees and balances, then move directly to receipts or detailed financial analysis."/>
      <section className="student-portal-metrics"><FinanceMetric icon={UsersRound} label="Accounts shown" value={accounts.length} detail="matching students" tone="blue"/><FinanceMetric icon={WalletCards} label="Assessed" value={ugx(total)} detail="submitted charges"/><FinanceMetric icon={ReceiptText} label="Paid" value={ugx(total - balance)} detail="settled against invoices" tone="violet"/><FinanceMetric icon={CircleAlert} label="Balance to pay" value={ugx(balance)} detail="outstanding across results" tone={balance ? 'gold' : 'green'}/></section>
      <article className="card student-table-card"><div className="receipt-selection-toolbar"><label className="search-input"><Search size={16}/><input value={query} onChange={event => { setQuery(event.target.value); setParams(event.target.value ? { q: event.target.value } : {}, { replace: true }) }} placeholder="Search student name, number, programme or customer account"/></label></div><div className="table-wrap"><table className="data-table"><thead><tr><th>Student</th><th>Programme</th><th>Assessed</th><th>Paid</th><th>Balance to Pay</th><th>Account Status</th><th>Actions</th></tr></thead><tbody>{accounts.length ? accounts.map(({ student, assessed, paid, balance }) => <tr key={String(student.name)}><td><strong>{String(student.student_name)}</strong><small>{String(student.student_number ?? student.name)}</small></td><td>{String(student.academic_programme ?? 'Not assigned')}</td><td>{ugx(assessed)}</td><td>{ugx(paid)}</td><td><strong>{ugx(balance)}</strong></td><td><FinanceStatus tone={accountTone(balance, assessed)}>{balance === 0 ? assessed ? 'Paid' : 'Not billed' : paid ? 'Partly paid' : 'Outstanding'}</FinanceStatus></td><td><div className="table-row-actions"><button onClick={() => navigate(`/finance/analysis?student=${encodeURIComponent(String(student.name))}`)}><ChartNoAxesCombined size={14}/>Analysis</button><button onClick={() => navigate(`/finance/payments?q=${encodeURIComponent(String(student.student_number ?? student.name))}`)}><ReceiptText size={14}/>Receipts</button><button onClick={() => navigate(`/finance/invoices?student=${encodeURIComponent(String(student.name))}`)}><WalletCards size={14}/>Bill</button></div></td></tr>) : <tr><td colSpan={7} className="data-table-empty">No student account matches this search.</td></tr>}</tbody></table></div></article>
    </section>
  }}</FinancePageState>
}
