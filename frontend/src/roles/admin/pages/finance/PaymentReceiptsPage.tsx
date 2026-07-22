import { useEffect, useMemo, useState } from 'react'
import { CheckSquare2, CreditCard, FileText, Printer, Receipt, RefreshCw, Search, Square, X } from 'lucide-react'
import { callMethod, fetchList, type FrappeRow, ugx } from '../../../../api/frappe'

type Allocation = { reference_doctype?: string; reference_name?: string; allocated_amount?: number; total_amount?: number; outstanding_amount?: number; student?: string; academic_semester?: string }
type ReceiptPayment = { name:string; posting_date?:string; payment_type?:string; party?:string; party_name?:string; student?:{name?:string;student_name?:string;student_number?:string}; mode_of_payment?:string; reference_no?:string; reference_date?:string; paid_amount?:number; received_amount?:number; paid_to_account_currency?:string; remarks?:string; docstatus?:number; allocations:Allocation[] }
type ReceiptPayload = { university:{name:string;country?:string;currency?:string;footer?:string};generated_on:string;generated_by:string;payments:ReceiptPayment[] }

const receiptMethod = 'ugandan_university_education.ugandan_university_education.api.get_payment_receipt_data'

function amountOf(payment: ReceiptPayment) {
  return Number(payment.received_amount || payment.paid_amount || 0)
}

function formatDate(value?: string) {
  if (!value) return '—'
  const normalized = value.includes(' ') ? value.replace(' ', 'T') : value.length === 10 ? `${value}T00:00:00` : value
  const date = new Date(normalized)
  return Number.isNaN(date.getTime()) ? value : new Intl.DateTimeFormat('en-UG',{day:'2-digit',month:'short',year:'numeric'}).format(date)
}

export function PaymentReceiptsPage() {
  const [payments,setPayments] = useState<FrappeRow[]>([])
  const [selected,setSelected] = useState<Set<string>>(new Set())
  const [query,setQuery] = useState('')
  const [loading,setLoading] = useState(true)
  const [generating,setGenerating] = useState(false)
  const [error,setError] = useState('')
  const [receipt,setReceipt] = useState<ReceiptPayload|null>(null)

  function load() {
    setLoading(true); setError('')
    fetchList('Payment Entry',['name','posting_date','payment_type','party_type','party','party_name','mode_of_payment','reference_no','reference_date','paid_amount','received_amount','paid_to_account_currency','docstatus','remarks'],undefined,2000)
      .then(rows => setPayments(rows.filter(row => Number(row.docstatus) === 1 && String(row.payment_type ?? '') === 'Receive')))
      .catch(cause => setError(cause instanceof Error ? cause.message : 'Unable to load payment transactions.'))
      .finally(() => setLoading(false))
  }
  useEffect(load,[])

  const filtered = useMemo(() => {
    const value=query.trim().toLowerCase()
    return payments.filter(row => !value || JSON.stringify(row).toLowerCase().includes(value))
  },[payments,query])
  const allShownSelected = filtered.length > 0 && filtered.every(row => selected.has(String(row.name)))

  function toggle(name:string) {
    setSelected(current => { const next=new Set(current); next.has(name)?next.delete(name):next.add(name); return next })
  }
  function selectShown() {
    setSelected(current => { const next=new Set(current); if(allShownSelected) filtered.forEach(row=>next.delete(String(row.name))); else filtered.forEach(row=>next.add(String(row.name))); return next })
  }
  async function generate() {
    if(!selected.size) { setError('Select at least one payment transaction to generate a receipt.'); return }
    setGenerating(true); setError('')
    try {
      const payload=await callMethod<ReceiptPayload>(receiptMethod,{payment_entries:JSON.stringify([...selected])})
      setReceipt(payload)
    } catch(cause) { setError(cause instanceof Error ? cause.message : 'Unable to generate the payment receipt.') }
    finally { setGenerating(false) }
  }

  return <section className="records-page payment-receipts-page">
    <div className="page-intro no-print"><div><span className="eyebrow">AWU FINANCE OFFICE</span><h1><Receipt size={28}/>Payment Receipts</h1><p>Select one payment for an individual receipt, several payments for a combined receipt, or all filtered payments for a complete statement-style receipt.</p></div><button className="secondary-button" onClick={load}><RefreshCw size={16}/>Refresh payments</button></div>
    {error?<div className="profile-error no-print">{error}</div>:null}

    <article className="card receipt-selection-card no-print">
      <div className="receipt-selection-toolbar"><label className="search-input"><Search size={16}/><input value={query} onChange={event=>setQuery(event.target.value)} placeholder="Search student, payment number, reference or method"/></label><div className="receipt-selection-actions"><button className="secondary-button" onClick={selectShown}>{allShownSelected?<CheckSquare2 size={16}/>:<Square size={16}/>} {allShownSelected?'Clear shown':'Select all shown'}</button><span className="selected-count">{selected.size} selected</span><button className="primary-button" disabled={!selected.size||generating} onClick={generate}><FileText size={16}/>{generating?'Preparing…':selected.size===1?'Generate receipt':'Generate combined receipt'}</button></div></div>
      <div className="table-wrap"><table className="data-table receipt-picker-table"><thead><tr><th><button className="table-check" onClick={selectShown} aria-label="Select all shown">{allShownSelected?<CheckSquare2 size={17}/>:<Square size={17}/>}</button></th><th>Payment</th><th>Date</th><th>Student / Payer</th><th>Method</th><th>Reference</th><th>Amount</th></tr></thead><tbody>{loading?<tr><td colSpan={7} className="data-table-empty">Loading received payments…</td></tr>:filtered.length?filtered.map(row=>{const name=String(row.name);return <tr key={name} className={selected.has(name)?'selected-payment-row':''} onClick={()=>toggle(name)}><td><button className="table-check" aria-label={`Select ${name}`}>{selected.has(name)?<CheckSquare2 size={17}/>:<Square size={17}/>}</button></td><td><strong>{name}</strong></td><td>{formatDate(String(row.posting_date??''))}</td><td>{String(row.party_name??row.party??'Student account')}</td><td>{String(row.mode_of_payment??'—')}</td><td>{String(row.reference_no??'—')}</td><td><strong>{ugx(row.received_amount??row.paid_amount)}</strong></td></tr>}):<tr><td colSpan={7} className="data-table-empty">No submitted incoming payments match this search.</td></tr>}</tbody></table></div>
    </article>

    {receipt?<ReceiptDocument data={receipt} onClose={()=>setReceipt(null)}/>:null}
  </section>
}

function ReceiptDocument({data,onClose}:{data:ReceiptPayload;onClose:()=>void}) {
  const total=data.payments.reduce((sum,payment)=>sum+amountOf(payment),0)
  const parties=[...new Set(data.payments.map(payment=>payment.party_name||payment.student?.student_name||payment.party).filter(Boolean))]
  const receiptNumber=data.payments.length===1?data.payments[0].name:`AWU-CONSOLIDATED-${new Date(data.generated_on).toISOString().slice(0,10).replace(/-/g,'')}`
  return <div className="receipt-preview-layer"><div className="receipt-preview-actions no-print"><button className="secondary-button" onClick={onClose}><X size={16}/>Close preview</button><button className="primary-button" onClick={()=>window.print()}><Printer size={16}/>Print receipt</button></div><article className="payment-receipt-document">
    <header className="receipt-header"><img src="/awu-logo.png" alt="Ankole Western University crest"/><div><strong>{data.university.name||'Ankole Western University'}</strong><span>LIGHT OF THE WORLD</span><p>Office of the University Bursar</p></div><section><b>{data.payments.length===1?'OFFICIAL PAYMENT RECEIPT':'CONSOLIDATED PAYMENT RECEIPT'}</b><small>Receipt reference</small><strong>{receiptNumber}</strong></section></header>
    <div className="receipt-meta"><div><small>Received from</small><strong>{parties.length===1?parties[0]:'Multiple student accounts'}</strong></div><div><small>Receipt date</small><strong>{formatDate(data.generated_on)}</strong></div><div><small>Transactions included</small><strong>{data.payments.length}</strong></div><div><small>Total received</small><strong>{ugx(total)}</strong></div></div>
    <section className="receipt-section"><div className="receipt-section-title"><h2>Payment transactions</h2><span>{data.payments.length===1?'Individual payment':'Combined payment selection'}</span></div><table className="receipt-table"><thead><tr><th>Date</th><th>Payment No.</th><th>Student / Payer</th><th>Semester(s)</th><th>Method & Reference</th><th>Amount</th></tr></thead><tbody>{data.payments.map(payment=>{const semesters=[...new Set(payment.allocations.map(row=>row.academic_semester).filter(Boolean))];return <tr key={payment.name}><td>{formatDate(payment.posting_date)}</td><td><strong>{payment.name}</strong></td><td><strong>{payment.student?.student_name||payment.party_name||payment.party||'Student account'}</strong><small>{payment.student?.student_number||payment.student?.name||''}</small></td><td>{semesters.length?semesters.join(', '):'Unallocated / advance'}</td><td><strong>{payment.mode_of_payment||'Payment'}</strong><small>{payment.reference_no||'No external reference'}</small></td><td><strong>{ugx(amountOf(payment))}</strong></td></tr>})}</tbody><tfoot><tr><td colSpan={5}>TOTAL RECEIVED</td><td>{ugx(total)}</td></tr></tfoot></table></section>
    <section className="receipt-section"><div className="receipt-section-title"><h2>Invoice allocation details</h2><span>How the selected payments were applied</span></div><table className="receipt-table allocation-table"><thead><tr><th>Payment</th><th>Invoice / Reference</th><th>Student</th><th>Academic Semester</th><th>Allocated</th></tr></thead><tbody>{data.payments.flatMap(payment=>payment.allocations.length?payment.allocations.map((allocation,index)=><tr key={`${payment.name}-${allocation.reference_name}-${index}`}><td>{payment.name}</td><td>{allocation.reference_name||allocation.reference_doctype||'Advance payment'}</td><td>{allocation.student||payment.student?.student_number||payment.party||'—'}</td><td>{allocation.academic_semester||'Unallocated / advance'}</td><td><strong>{ugx(allocation.allocated_amount)}</strong></td></tr>):[<tr key={`${payment.name}-advance`}><td>{payment.name}</td><td>Advance / unallocated payment</td><td>{payment.student?.student_number||payment.party||'—'}</td><td>Not yet allocated</td><td><strong>{ugx(amountOf(payment))}</strong></td></tr>])}</tbody></table></section>
    <footer className="receipt-footer"><div><p>Amount received</p><strong>{ugx(total)}</strong><span>This receipt acknowledges the payment transactions listed above. It is valid subject to successful bank or cash reconciliation.</span></div><section><span>Generated by</span><strong>{data.generated_by}</strong><i/><b>University Bursar / Authorised Officer</b></section></footer>
    <div className="receipt-bottom-line"><span>{data.university.name}</span><span>{data.university.country||'Uganda'}</span><span>Computer-generated university receipt</span></div>
  </article></div>
}
