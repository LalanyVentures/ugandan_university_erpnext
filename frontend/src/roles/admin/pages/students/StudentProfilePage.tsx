import { useEffect, useMemo, useState } from 'react'
import { ArrowRight, Award, BookOpen, CreditCard, Edit3, FileBadge2, GraduationCap, Mail, Save, Search, UserRound, X } from 'lucide-react'
import { useNavigate, useParams } from 'react-router-dom'
import { callMethod, fetchDocument, fetchList, type FrappeRow, ugx } from '../../../../api/frappe'

const editableFields = ['first_name','middle_name','last_name','gender','date_of_birth','nationality','student_email_id','status'] as const

async function settledRows(promise: Promise<FrappeRow[]>) {
  try { return await promise } catch { return [] }
}

export function StudentProfilePage() {
  const { studentName = '' } = useParams()
  const navigate = useNavigate()
  const [students, setStudents] = useState<FrappeRow[]>([])
  const [student, setStudent] = useState<FrappeRow | null>(null)
  const [draft, setDraft] = useState<FrappeRow>({})
  const [enrolments, setEnrolments] = useState<FrappeRow[]>([])
  const [registrations, setRegistrations] = useState<FrappeRow[]>([])
  const [results, setResults] = useState<FrappeRow[]>([])
  const [invoices, setInvoices] = useState<FrappeRow[]>([])
  const [editing, setEditing] = useState(false)
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [query, setQuery] = useState('')

  useEffect(() => {
    fetchList('Student', ['name','student_name','student_number','status','student_email_id'], undefined, 2000).then(setStudents).catch(() => setStudents([]))
  }, [])

  useEffect(() => {
    if (!studentName) { setStudent(null); return }
    setLoading(true)
    setError('')
    Promise.all([
      fetchDocument('Student', studentName),
      settledRows(fetchList('Student Programme Enrolment', ['name','academic_programme','programme_curriculum','academic_year','student_cohort','admission_date','expected_completion_date','status'], {student:studentName}, 50)),
      settledRows(fetchList('Semester Registration', ['name','academic_semester','registration_date','status'], {student:studentName}, 100)),
      settledRows(fetchList('Student Course Result', ['name','academic_semester','course','final_mark','grade','result_status','is_approved','is_published'], {student:studentName}, 1000)),
      settledRows(fetchList('Sales Invoice', ['name','student','customer','academic_semester','posting_date','grand_total','outstanding_amount','status'], {student:studentName}, 500)),
    ]).then(([profile, programmeRows, semesterRows, resultRows, invoiceRows]) => {
      setStudent(profile); setDraft(profile); setEnrolments(programmeRows); setRegistrations(semesterRows); setResults(resultRows); setInvoices(invoiceRows)
    }).catch(cause => setError(cause instanceof Error ? cause.message : 'Unable to load the student profile.')).finally(() => setLoading(false))
  }, [studentName])

  const matches = useMemo(() => {
    const value = query.toLowerCase().trim()
    if (!value) return students.slice(0, 12)
    return students.filter(row => JSON.stringify(row).toLowerCase().includes(value)).slice(0, 20)
  }, [query, students])
  const totalBilled = invoices.reduce((sum,row) => sum + Number(row.grand_total ?? 0), 0)
  const outstanding = invoices.reduce((sum,row) => sum + Number(row.outstanding_amount ?? 0), 0)
  const paid = totalBilled - outstanding
  const approvedResults = results.filter(row => Number(row.is_approved) === 1).length

  async function save() {
    if (!studentName) return
    setSaving(true); setError('')
    const values = Object.fromEntries(editableFields.map(field => [field, draft[field] ?? null]))
    try {
      const updated = await callMethod<FrappeRow>('ugandan_university_education.ugandan_university_education.api.update_student_profile', { student: studentName, values: JSON.stringify(values) })
      setStudent(updated); setDraft(updated); setEditing(false)
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Unable to save the student profile.')
    } finally { setSaving(false) }
  }

  if (!studentName) return <section className="records-page student-profile-page">
    <div className="page-intro"><div><span className="eyebrow">STUDENT RECORD</span><h1><UserRound size={28}/>Select a Student Profile</h1><p>Search by name, registration number or email to open a complete student record.</p></div></div>
    <article className="card student-profile-picker"><label className="search-input profile-search"><Search size={17}/><input value={query} onChange={event => setQuery(event.target.value)} placeholder="Search student name or registration number"/></label><div className="profile-picker-list">{matches.map(row => <button key={String(row.name)} onClick={() => navigate(`/students/profile/${encodeURIComponent(String(row.name))}`)}><span className="profile-avatar">{String(row.student_name ?? row.name).split(/\s+/).slice(0,2).map(word => word[0]).join('')}</span><span><strong>{String(row.student_name ?? row.name)}</strong><small>{String(row.student_number ?? row.name)} · {String(row.status ?? 'Active')}</small></span><ArrowRight size={17}/></button>)}</div></article>
  </section>

  if (loading) return <div className="card profile-loading">Loading student profile…</div>
  if (!student) return <div className="card profile-loading">{error || 'Student record not found.'}</div>

  return <section className="records-page student-profile-page">
    <div className="student-profile-hero card"><div className="profile-avatar profile-avatar-large">{String(student.student_name ?? student.name).split(/\s+/).slice(0,2).map(word => word[0]).join('')}</div><div className="student-profile-title"><span className="eyebrow">COMPLETE STUDENT RECORD</span><h1>{String(student.student_name ?? student.name)}</h1><p>{String(student.student_number ?? student.name)} · {String(student.status ?? 'Active')}</p></div><div className="student-profile-actions"><button className="secondary-button" onClick={() => navigate(`/transcripts?student=${encodeURIComponent(studentName)}`)}><FileBadge2 size={16}/>Transcript</button><button className="primary-button" onClick={() => setEditing(value => !value)}>{editing ? <X size={16}/> : <Edit3 size={16}/>} {editing ? 'Cancel edit' : 'Edit student'}</button></div></div>
    {error ? <div className="profile-error">{error}</div> : null}

    <div className="student-kpi-grid">
      <ProfileMetric icon={GraduationCap} label="Programme Enrolments" value={String(enrolments.length)} detail={String(enrolments[0]?.academic_programme ?? 'No programme assigned')}/>
      <ProfileMetric icon={BookOpen} label="Semester Registrations" value={String(registrations.length)} detail={String(registrations[0]?.academic_semester ?? 'No registration')}/>
      <ProfileMetric icon={Award} label="Recorded Results" value={String(results.length)} detail={`${approvedResults} approved`}/>
      <ProfileMetric icon={CreditCard} label="Outstanding Balance" value={ugx(outstanding)} detail={`${ugx(paid)} paid`}/>
    </div>

    <div className="student-profile-grid">
      <article className="card profile-panel"><div className="profile-panel-heading"><div><span className="eyebrow">IDENTITY & CONTACT</span><h2>Student Details</h2></div>{student.student_email_id ? <a href={`mailto:${String(student.student_email_id)}`}><Mail size={16}/>Email</a> : null}</div>{editing ? <div className="profile-form"><Field label="First Name" field="first_name" draft={draft} setDraft={setDraft}/><Field label="Middle Name" field="middle_name" draft={draft} setDraft={setDraft}/><Field label="Last Name" field="last_name" draft={draft} setDraft={setDraft}/><SelectField label="Gender" field="gender" options={['','Male','Female','Other']} draft={draft} setDraft={setDraft}/><Field label="Date of Birth" field="date_of_birth" type="date" draft={draft} setDraft={setDraft}/><Field label="Nationality" field="nationality" draft={draft} setDraft={setDraft}/><Field label="Student Email" field="student_email_id" type="email" draft={draft} setDraft={setDraft}/><SelectField label="Status" field="status" options={['Applicant','Active','On Leave','Completed','Discontinued','Withdrawn']} draft={draft} setDraft={setDraft}/><button className="primary-button profile-save" disabled={saving} onClick={save}><Save size={16}/>{saving ? 'Saving…' : 'Save student details'}</button></div> : <div className="profile-details"><Detail label="Registration Number" value={student.student_number ?? student.name}/><Detail label="First Name" value={student.first_name}/><Detail label="Middle Name" value={student.middle_name}/><Detail label="Last Name" value={student.last_name}/><Detail label="Gender" value={student.gender}/><Detail label="Date of Birth" value={student.date_of_birth}/><Detail label="Nationality" value={student.nationality}/><Detail label="Email" value={student.student_email_id}/><Detail label="Portal User" value={student.user}/><Detail label="Billing Account" value={student.customer}/></div>}</article>

      <article className="card profile-panel"><div className="profile-panel-heading"><div><span className="eyebrow">ACADEMIC JOURNEY</span><h2>Programme & Registration</h2></div></div><div className="profile-timeline">{enrolments.length ? enrolments.map(row => <div key={String(row.name)}><i/><span><strong>{String(row.academic_programme ?? 'Programme')}</strong><small>{String(row.student_cohort ?? 'No cohort')} · {String(row.academic_year ?? '')}</small><small>{String(row.status ?? '')} · Admitted {String(row.admission_date ?? '—')}</small></span></div>) : <p className="profile-empty">No programme enrolment recorded.</p>}</div><div className="profile-mini-table">{registrations.slice(0,8).map(row => <div key={String(row.name)}><span>{String(row.academic_semester ?? row.name)}</span><b>{String(row.status ?? 'Registered')}</b></div>)}</div></article>
    </div>

    <article className="card profile-panel"><div className="profile-panel-heading"><div><span className="eyebrow">STUDENT FINANCE</span><h2>Invoices, Payments & Balances</h2></div><div className="finance-summary"><span>Billed <b>{ugx(totalBilled)}</b></span><span>Paid <b>{ugx(paid)}</b></span><span>Balance <b>{ugx(outstanding)}</b></span></div></div><div className="table-wrap"><table className="data-table"><thead><tr><th>Invoice</th><th>Semester</th><th>Date</th><th>Billed</th><th>Paid</th><th>Balance</th><th>Status</th></tr></thead><tbody>{invoices.length ? invoices.map(row => { const total=Number(row.grand_total??0), balance=Number(row.outstanding_amount??0); return <tr key={String(row.name)}><td><strong>{String(row.name)}</strong></td><td>{String(row.academic_semester??'—')}</td><td>{String(row.posting_date??'—')}</td><td>{ugx(total)}</td><td>{ugx(total-balance)}</td><td><strong>{ugx(balance)}</strong></td><td><span className="status-pill tone-green">{balance===0?'Paid':balance<total?'Partly Paid':'Outstanding'}</span></td></tr> }) : <tr><td colSpan={7} className="data-table-empty">No student invoices found.</td></tr>}</tbody></table></div></article>

    <article className="card profile-panel"><div className="profile-panel-heading"><div><span className="eyebrow">ACADEMIC PERFORMANCE</span><h2>Latest Results</h2></div><button className="secondary-button" onClick={() => navigate(`/transcripts?student=${encodeURIComponent(studentName)}`)}>Open full transcript<ArrowRight size={16}/></button></div><div className="table-wrap"><table className="data-table"><thead><tr><th>Semester</th><th>Course</th><th>Mark</th><th>Grade</th><th>Result</th><th>Approved</th><th>Published</th></tr></thead><tbody>{results.length ? results.slice(0,20).map(row => <tr key={String(row.name)}><td>{String(row.academic_semester??'—')}</td><td><strong>{String(row.course??'—')}</strong></td><td>{String(row.final_mark??'—')}</td><td>{String(row.grade??'—')}</td><td>{String(row.result_status??'—')}</td><td>{Number(row.is_approved)===1?'Yes':'No'}</td><td>{Number(row.is_published)===1?'Yes':'No'}</td></tr>) : <tr><td colSpan={7} className="data-table-empty">No course results recorded.</td></tr>}</tbody></table></div></article>
  </section>
}

function ProfileMetric({icon:Icon,label,value,detail}:{icon:typeof UserRound;label:string;value:string;detail:string}) { return <article className="card profile-metric"><span><Icon size={19}/></span><div><small>{label}</small><strong>{value}</strong><p>{detail}</p></div></article> }
function Detail({label,value}:{label:string;value:unknown}) { return <div><small>{label}</small><strong>{String(value??'Not recorded')}</strong></div> }
function Field({label,field,draft,setDraft,type='text'}:{label:string;field:string;draft:FrappeRow;setDraft:(next:FrappeRow)=>void;type?:string}) { return <label><span>{label}</span><input type={type} value={String(draft[field]??'')} onChange={event => setDraft({...draft,[field]:event.target.value})}/></label> }
function SelectField({label,field,options,draft,setDraft}:{label:string;field:string;options:string[];draft:FrappeRow;setDraft:(next:FrappeRow)=>void}) { return <label><span>{label}</span><select value={String(draft[field]??'')} onChange={event => setDraft({...draft,[field]:event.target.value})}>{options.map(option => <option key={option} value={option}>{option||'Select'}</option>)}</select></label> }
