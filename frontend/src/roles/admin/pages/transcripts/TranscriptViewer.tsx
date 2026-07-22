import { useEffect, useState } from 'react'
import { ArrowLeft, Download, FileCheck2, Printer, RefreshCw, ShieldCheck } from 'lucide-react'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { callMethod, fetchList, type FrappeRow } from '../../../../api/frappe'
import styles from './TranscriptViewer.module.css'

type TranscriptCourse = { course_code?: string; course_name?: string; mark_percent?: number; credit_units?: number; grade?: string; grade_point?: number; attempt_type?: string; result_status?: string }
type TranscriptSemester = { semester_name: string; courses: TranscriptCourse[]; semester_gpa?: number; cumulative_gpa?: number; earned_credits?: number }
type TranscriptPayload = {
  transcript: { name: string; transcript_type: string; status: string; verification_number?: string; faculty_head_user?: string; faculty_head_approved_on?: string; registrar_user?: string; registrar_issued_on?: string; generated_pdf?: string; can_view: boolean; is_approved_document?: boolean }
  student: { name?: string; student_name?: string; student_number?: string; gender?: string; nationality?: string; student_email_id?: string }
  programme: { name?: string; programme_name?: string; programme_code?: string; award_type?: string; academic_unit?: string }
  faculty?: string
  semesters?: TranscriptSemester[]
  final_cgpa?: number
  total_credits_earned?: number
  total_gpa_credits?: number
  result_count?: number
}

const method = 'ugandan_university_education.ugandan_university_education.api.get_transcript_view'

function displayNumber(value: unknown, places = 2) {
  const number = Number(value)
  return Number.isFinite(number) ? number.toFixed(places) : '—'
}

function displayDate(value?: string) {
  if (!value) return 'Not issued'
  const date = new Date(value.replace(' ', 'T'))
  return Number.isNaN(date.getTime()) ? value : new Intl.DateTimeFormat('en-UG', { day: '2-digit', month: 'long', year: 'numeric' }).format(date)
}

export function TranscriptViewer({ roleLabel }: { roleLabel: string }) {
  const navigate = useNavigate()
  const { transcriptName = '' } = useParams()
  const [searchParams] = useSearchParams()
  const studentName = searchParams.get('student') ?? ''
  const [students, setStudents] = useState<FrappeRow[]>([])
  const [data, setData] = useState<TranscriptPayload | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    Promise.all([
      fetchList('Student Course Result', ['student'], undefined, 5000),
      fetchList('Student', ['name', 'student_name', 'student_number', 'status'], undefined, 2000),
    ]).then(([results, studentRows]) => {
      const studentsWithMarks = new Set(results.map(row => String(row.student ?? '')).filter(Boolean))
      setStudents(studentRows.filter(row => studentsWithMarks.has(String(row.name))))
    }).catch(() => setStudents([]))
  }, [])

  useEffect(() => {
    if (!transcriptName && !studentName) { setData(null); setLoading(false); return }
    setLoading(true)
    setError('')
    const args: Record<string, string> = transcriptName ? { transcript_name: transcriptName } : { student: studentName }
    callMethod<TranscriptPayload>(method, args)
      .then(payload => setData(payload))
      .catch(cause => setError(cause instanceof Error ? cause.message : 'Unable to load the student marks.'))
      .finally(() => setLoading(false))
  }, [studentName, transcriptName])

  const semesters = data?.semesters ?? []
  const issuedDate = data?.transcript.registrar_issued_on ?? data?.transcript.faculty_head_approved_on
  const hasSelection = Boolean(transcriptName || studentName)
  const selectedStudent = data?.student.name ?? studentName
  const approvedDocument = Boolean(data?.transcript.is_approved_document)

  return <section className={styles.transcriptViewerContainer}>
    <div className={styles.viewerHeading}>
      <div><span className={styles.eyebrow}>AWU ADMINISTRATOR & REGISTRAR SERVICES</span><h1>Academic Transcript Viewer</h1><p>Live administrative preview using every mark currently recorded in ERPNext.</p></div>
      <div className={styles.viewerActions}>{hasSelection?<button onClick={() => navigate('/transcripts')}><ArrowLeft size={16}/>Choose another student</button>:null}<button onClick={() => window.location.reload()}><RefreshCw size={16}/>Refresh marks</button><button className={styles.primaryAction} disabled={!data} onClick={() => window.print()}><Printer size={16}/>{approvedDocument?'Print transcript':'Print preview'}</button>{data?.transcript.generated_pdf ? <a href={data.transcript.generated_pdf} target="_blank" rel="noreferrer"><Download size={16}/>Issued PDF</a> : null}</div>
    </div>

    <div className={styles.filters}>
      <div className={styles.filterGroup}><label htmlFor="studentFilter">Student with recorded marks:</label><select id="studentFilter" value={selectedStudent} onChange={event => event.target.value && navigate(`/transcripts?student=${encodeURIComponent(event.target.value)}`)} className={styles.filterSelect}><option value="">Select a Student</option>{students.map(student => <option key={String(student.name)} value={String(student.name)}>{String(student.student_name ?? student.name)} — {String(student.student_number ?? student.name)}</option>)}</select></div>
      <div className={styles.accessBadge}><ShieldCheck size={16}/><span>{roleLabel} · Live marks access</span></div>
    </div>

    {loading ? <div className={styles.noDataMessage}>Loading all available marks from ERPNext…</div> : error ? <div className={styles.errorMessage}>{error}</div> : !data ? <div className={styles.noDataMessage}>{students.length ? 'Select a student to build the transcript preview.' : 'No student result records are available.'}</div> :
      <article className={styles.transcriptContent}>
        <div className={styles.securityStrip}><span><FileCheck2 size={15}/>{approvedDocument?'Approved academic record':'Live administrative results preview'}</span><span>{data.result_count ?? 0} marks · {data.transcript.status}</span></div>
        <header className={styles.transcriptHeader}>
          <div className={styles.universityIdentity}><img src="/awu-logo.png" alt="Ankole Western University crest"/><div><strong>ANKOLE WESTERN UNIVERSITY</strong><span>LIGHT OF THE WORLD</span></div></div>
          <h2>{approvedDocument && data.transcript.transcript_type === 'Official' ? 'OFFICIAL ACADEMIC TRANSCRIPT' : approvedDocument ? 'PROVISIONAL ACADEMIC TRANSCRIPT' : 'ADMINISTRATIVE ACADEMIC TRANSCRIPT PREVIEW'}</h2>
          <p>Office of the Academic Registrar</p>
        </header>

        <section className={styles.studentInfo}>
          <div><Info label="Student Name" value={data.student.student_name}/><Info label="Student ID" value={data.student.student_number ?? data.student.name}/><Info label="Gender" value={data.student.gender}/><Info label="Nationality" value={data.student.nationality}/></div>
          <div><Info label="Programme" value={data.programme.programme_name ?? data.programme.name}/><Info label="Programme Code" value={data.programme.programme_code}/><Info label="Faculty" value={data.faculty ?? data.programme.academic_unit}/><Info label="Issued Date" value={displayDate(issuedDate)}/></div>
        </section>

        <section className={styles.semesterGrid}>
          {semesters.map(semester => <article className={styles.semesterBlock} key={semester.semester_name}><div className={styles.semesterHeading}><h3>{semester.semester_name}</h3><span>{semester.courses.length} course units</span></div><table className={styles.transcriptTable}><thead><tr><th>Code</th><th>Module Name</th><th>Mark (%)</th><th>Credit</th><th>Grade</th></tr></thead><tbody>{semester.courses.map((course,index)=><tr key={`${course.course_code}-${index}`}><td>{course.course_code ?? '—'}</td><td><strong>{course.course_name ?? 'Course Unit'}</strong>{course.attempt_type && course.attempt_type !== 'Normal' ? <small>{course.attempt_type}</small> : null}{course.result_status && course.result_status !== 'Complete' ? <small>{course.result_status}</small> : null}</td><td>{displayNumber(course.mark_percent,0)}</td><td>{displayNumber(course.credit_units,0)}</td><td><b>{course.grade ?? '—'}</b></td></tr>)}</tbody></table><div className={styles.semesterSummary}><span>GPA: <strong>{displayNumber(semester.semester_gpa)}</strong></span><span>CGPA: <strong>{displayNumber(semester.cumulative_gpa)}</strong></span></div></article>)}
        </section>

        <footer className={styles.transcriptFooter}>
          <div className={styles.finalSummary}><Info label="CGPA Final" value={displayNumber(data.final_cgpa)}/><Info label="Total Credits Earned" value={String(data.total_credits_earned ?? 0)}/><Info label="Total Cumulative Credits" value={String(data.total_gpa_credits ?? 0)}/></div>
          <div className={styles.signature}><span>{approvedDocument ? data.transcript.registrar_user ?? 'Academic Registrar' : 'Administrative Preview'}</span><strong>Academic Registrar</strong></div>
        </footer>
        <div className={styles.verificationFooter}><span>Record: {data.transcript.name}</span><span>Verification: {data.transcript.verification_number ?? 'Not officially issued'}</span><span>{approvedDocument ? `Faculty approval: ${displayDate(data.transcript.faculty_head_approved_on)}` : 'Unapproved marks are visible to administrators only'}</span></div>
        <div className={styles.watermark} aria-hidden="true">AWU</div>
      </article>}
  </section>
}

function Info({ label, value }: { label: string; value?: string }) { return <p><strong>{label}</strong><span>:</span><b>{value || 'N/A'}</b></p> }
