import { useEffect, useMemo, useState } from 'react'
import { Award, BookOpen, Building2, CalendarDays, ClipboardCheck, CreditCard, FileBadge, GraduationCap, Library, Plus, Receipt, Search, Settings, ShieldCheck, UserRoundCheck, Users } from 'lucide-react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { fetchList, type FrappeRow } from '../../../../api/frappe'
import { InvoiceTable } from '../dashboard/DashboardPage'

export type RecordView =
  | 'students' | 'applications' | 'enrolments' | 'cohorts'
  | 'programmes' | 'courses' | 'units' | 'curricula' | 'calendar'
  | 'semester-registrations' | 'course-registrations' | 'offerings' | 'timetables' | 'attendance'
  | 'balances' | 'fee-structures' | 'invoices' | 'payments' | 'sponsorships'
  | 'course-results' | 'assessments' | 'approval-batches' | 'review-requests' | 'grading'
  | 'transcript-register' | 'clearance' | 'readiness' | 'university-settings' | 'academic-years' | 'semesters' | 'settings-grading'

type SectionConfig = {
  eyebrow: string
  title: string
  description: string
  doctype: string
  fields: string[]
  icon: typeof Users
  columns: Array<[string, string]>
  invoiceTable?: boolean
}

const config: Record<RecordView, SectionConfig> = {
  students: { eyebrow:'ADMISSIONS & RECORDS', title:'Student Directory', description:'Find every student and open a complete identity, academic, finance and results profile.', doctype:'Student', fields:['name','student_name','student_number','gender','student_email_id','status'], icon:Users, columns:[['student_name','Student'],['student_number','Student Number'],['gender','Gender'],['status','Status'],['student_email_id','Email']] },
  applications: { eyebrow:'ADMISSIONS PIPELINE', title:'University Applications', description:'Review applicants, programme choices and admission decisions.', doctype:'University Application', fields:['name','application_number','applicant_name','academic_programme','academic_year','application_date','status','student'], icon:ClipboardCheck, columns:[['applicant_name','Applicant'],['application_number','Application'],['academic_programme','Programme'],['academic_year','Year'],['status','Status']] },
  enrolments: { eyebrow:'STUDENT ACADEMIC RECORD', title:'Programme Enrolments', description:'Monitor programme placement, curricula, cohorts and expected completion.', doctype:'Student Programme Enrolment', fields:['name','student','academic_programme','programme_curriculum','academic_year','student_cohort','admission_date','status','expected_completion_date'], icon:GraduationCap, columns:[['student','Student'],['academic_programme','Programme'],['student_cohort','Cohort'],['academic_year','Admission Year'],['status','Status'],['expected_completion_date','Expected Completion']] },
  cohorts: { eyebrow:'INTAKES & COHORTS', title:'Student Cohorts', description:'Organise students by programme, curriculum, campus and intake.', doctype:'Student Cohort', fields:['name','cohort_code','cohort_name','academic_programme','academic_year','campus','status'], icon:Users, columns:[['cohort_code','Code'],['cohort_name','Cohort'],['academic_programme','Programme'],['academic_year','Year'],['campus','Campus'],['status','Status']] },
  programmes: { eyebrow:'ACADEMIC STRUCTURE', title:'Academic Programmes', description:'Manage awards, duration and ownership of university programmes.', doctype:'Academic Programme', fields:['name','programme_code','programme_name','award_type','academic_unit','duration_years','status'], icon:GraduationCap, columns:[['programme_code','Code'],['programme_name','Programme'],['award_type','Award'],['academic_unit','Academic Unit'],['duration_years','Years'],['status','Status']] },
  courses: { eyebrow:'COURSE CATALOGUE', title:'Courses', description:'Review course codes, credit units, study levels and ownership.', doctype:'Course', fields:['name','course_code','course_name','academic_unit','credit_units','study_level','status'], icon:BookOpen, columns:[['course_code','Code'],['course_name','Course'],['academic_unit','Academic Unit'],['credit_units','Credits'],['study_level','Level'],['status','Status']] },
  units: { eyebrow:'FACULTIES & DEPARTMENTS', title:'Academic Units', description:'Maintain faculties, schools, departments and their leadership hierarchy.', doctype:'Academic Unit', fields:['name','unit_code','unit_name','unit_type','parent_academic_unit','head_member','status'], icon:Building2, columns:[['unit_code','Code'],['unit_name','Academic Unit'],['unit_type','Type'],['parent_academic_unit','Parent'],['head_member','Head'],['status','Status']] },
  curricula: { eyebrow:'PROGRAMME DESIGN', title:'Programme Curricula', description:'Track approved programme structures and effective academic years.', doctype:'Programme Curriculum', fields:['name','curriculum_name','academic_programme','academic_year','effective_from','status'], icon:Library, columns:[['curriculum_name','Curriculum'],['academic_programme','Programme'],['academic_year','Academic Year'],['effective_from','Effective From'],['status','Status']] },
  calendar: { eyebrow:'ACADEMIC CALENDAR', title:'Academic Semesters', description:'Review semester dates, sequence and registration availability.', doctype:'Academic Semester', fields:['name','semester_name','academic_year','semester_number','start_date','end_date','registration_open','status'], icon:CalendarDays, columns:[['semester_name','Semester'],['academic_year','Year'],['semester_number','Number'],['start_date','Starts'],['end_date','Ends'],['registration_open','Registration Open'],['status','Status']] },
  'semester-registrations': { eyebrow:'SEMESTER OPERATIONS', title:'Semester Registrations', description:'Monitor each student’s semester activation and registration status.', doctype:'Semester Registration', fields:['name','student','student_programme_enrolment','academic_semester','registration_date','status'], icon:CalendarDays, columns:[['student','Student'],['academic_semester','Semester'],['registration_date','Registered'],['student_programme_enrolment','Enrolment'],['status','Status']] },
  'course-registrations': { eyebrow:'COURSE SELECTION', title:'Course Registrations', description:'Review selected offerings, attempts and registration type.', doctype:'Course Registration', fields:['name','student','student_cohort','course_offering','attempt_number','registration_type','status'], icon:ClipboardCheck, columns:[['student','Student'],['course_offering','Offering'],['student_cohort','Cohort'],['registration_type','Type'],['attempt_number','Attempt'],['status','Status']] },
  offerings: { eyebrow:'TEACHING DELIVERY', title:'Course Offerings', description:'Manage courses offered by semester, cohort, capacity and grading scheme.', doctype:'Course Offering', fields:['name','course','academic_semester','student_cohort','offering_type','capacity','status'], icon:BookOpen, columns:[['course','Course'],['academic_semester','Semester'],['student_cohort','Cohort'],['offering_type','Type'],['capacity','Capacity'],['status','Status']] },
  timetables: { eyebrow:'TEACHING SCHEDULE', title:'Teaching Timetables', description:'Review scheduled classes, venues, session types and publication state.', doctype:'Teaching Timetable Entry', fields:['name','course_offering','academic_semester','weekday','start_time','end_time','venue','session_type','status'], icon:CalendarDays, columns:[['course_offering','Offering'],['weekday','Day'],['start_time','Starts'],['end_time','Ends'],['venue','Venue'],['session_type','Session'],['status','Status']] },
  attendance: { eyebrow:'CLASS PARTICIPATION', title:'Student Attendance', description:'Monitor attendance records by course registration and teaching session.', doctype:'Student Attendance', fields:['name','student','course_registration','timetable_entry','attendance_date','status','remarks'], icon:ClipboardCheck, columns:[['student','Student'],['course_registration','Course Registration'],['attendance_date','Date'],['status','Attendance'],['remarks','Remarks']] },
  balances: { eyebrow:'STUDENT FINANCE', title:'Student Balances', description:'See billed, paid and outstanding amounts across student semesters.', doctype:'Sales Invoice', fields:['name','student','customer','academic_semester','grand_total','outstanding_amount','status'], icon:CreditCard, columns:[], invoiceTable:true },
  'fee-structures': { eyebrow:'FEES CONFIGURATION', title:'University Fee Structures', description:'Review tuition and functional fee schedules by programme and semester.', doctype:'University Fee Structure', fields:['name','structure_name','academic_programme','academic_year','academic_semester','currency','effective_from','effective_to','status'], icon:Receipt, columns:[['structure_name','Structure'],['academic_programme','Programme'],['academic_semester','Semester'],['currency','Currency'],['effective_from','Effective From'],['status','Status']] },
  invoices: { eyebrow:'STUDENT BILLING', title:'Student Invoices', description:'Review semester charges and their current settlement status.', doctype:'Sales Invoice', fields:['name','student','customer','academic_semester','grand_total','outstanding_amount','status'], icon:FileBadge, columns:[], invoiceTable:true },
  payments: { eyebrow:'CASHIER & RECEIPTS', title:'Payment Entries', description:'Review posted receipts and amounts allocated to student accounts.', doctype:'Payment Entry', fields:['name','posting_date','party','paid_amount','received_amount','reference_no','status'], icon:CreditCard, columns:[['name','Payment'],['posting_date','Date'],['party','Student/Customer'],['paid_amount','Paid Amount'],['received_amount','Received Amount'],['reference_no','Reference'],['status','Status']] },
  sponsorships: { eyebrow:'SPONSOR FUNDING', title:'Sponsorship Awards', description:'Monitor student sponsorship coverage, approvals and award status.', doctype:'Sponsorship Award', fields:['name','student','sponsor','academic_programme','academic_year','coverage_type','coverage_percentage','coverage_amount','status'], icon:ShieldCheck, columns:[['student','Student'],['sponsor','Sponsor'],['academic_programme','Programme'],['coverage_type','Coverage'],['coverage_amount','Amount'],['status','Status']] },
  'course-results': { eyebrow:'ASSESSMENT GOVERNANCE', title:'Student Course Results', description:'Review final marks, grades, approval and publication readiness.', doctype:'Student Course Result', fields:['name','student','academic_semester','course','final_mark','grade','result_status','is_approved','is_published'], icon:Award, columns:[['student','Student'],['course','Course'],['academic_semester','Semester'],['final_mark','Mark'],['grade','Grade'],['result_status','Result'],['is_approved','Approved'],['is_published','Published']] },
  assessments: { eyebrow:'ASSESSMENT SETUP', title:'Course Assessments', description:'Review coursework and examination components, weights and dates.', doctype:'Course Assessment', fields:['name','course_offering','assessment_name','assessment_type','maximum_mark','weight','assessment_date','status'], icon:ClipboardCheck, columns:[['assessment_name','Assessment'],['course_offering','Offering'],['assessment_type','Type'],['maximum_mark','Maximum'],['weight','Weight'],['assessment_date','Date'],['status','Status']] },
  'approval-batches': { eyebrow:'RESULTS APPROVAL', title:'Approval Batches', description:'Track results through faculty and registrar approval stages.', doctype:'Result Approval Batch', fields:['name','course_offering','academic_semester','approval_stage','status','submitted_by','approved_by'], icon:ShieldCheck, columns:[['course_offering','Offering'],['academic_semester','Semester'],['approval_stage','Stage'],['status','Status'],['submitted_by','Submitted By'],['approved_by','Approved By']] },
  'review-requests': { eyebrow:'RESULTS GOVERNANCE', title:'Result Review Requests', description:'Review remark, correction and appeal requests with decisions.', doctype:'Result Review Request', fields:['name','student','student_course_result','request_type','reason','status','decision','reviewed_by'], icon:ShieldCheck, columns:[['student','Student'],['student_course_result','Result'],['request_type','Request'],['status','Status'],['decision','Decision'],['reviewed_by','Reviewed By']] },
  grading: { eyebrow:'GRADING POLICY', title:'Grading Schemes', description:'Maintain approved grade bands and institutional grading policies.', doctype:'Grading Scheme', fields:['name','scheme_name','description','status'], icon:Settings, columns:[['scheme_name','Scheme'],['description','Description'],['status','Status']] },
  'transcript-register': { eyebrow:'REGISTRAR SERVICES', title:'Transcript Issuance Register', description:'Review transcript type, status, verification and issuance dates.', doctype:'Academic Transcript', fields:['name','student','academic_programme','transcript_type','status','verification_number','registrar_issued_on'], icon:FileBadge, columns:[['student','Student'],['academic_programme','Programme'],['transcript_type','Type'],['status','Status'],['verification_number','Verification'],['registrar_issued_on','Issued']] },
  clearance: { eyebrow:'GOVERNANCE & CLEARANCE', title:'Student Clearance Cases', description:'Confirm financial, academic and administrative clearance.', doctype:'Student Clearance', fields:['name','student','clearance_type','academic_semester','financial_status','academic_status','status','cleared_on'], icon:ShieldCheck, columns:[['student','Student'],['clearance_type','Type'],['academic_semester','Semester'],['financial_status','Finance'],['academic_status','Academic'],['status','Status'],['cleared_on','Cleared']] },
  readiness: { eyebrow:'GRADUATION CONTROL', title:'Graduation Readiness', description:'Focus on graduation clearance and final academic/financial readiness.', doctype:'Student Clearance', fields:['name','student','clearance_type','financial_status','academic_status','status','cleared_on'], icon:GraduationCap, columns:[['student','Student'],['clearance_type','Type'],['financial_status','Finance'],['academic_status','Academic'],['status','Status'],['cleared_on','Cleared']] },
  'university-settings': { eyebrow:'UNIVERSITY CONFIGURATION', title:'University Profile', description:'Review institutional identity, currency and transcript controls.', doctype:'University Education Settings', fields:['name','university_name','country','default_currency','default_grading_scheme','transcript_logo'], icon:Building2, columns:[['university_name','University'],['country','Country'],['default_currency','Currency'],['default_grading_scheme','Grading Scheme']] },
  'academic-years': { eyebrow:'CALENDAR SETTINGS', title:'Academic Years', description:'Maintain academic year dates and operational status.', doctype:'Academic Year', fields:['name','year_name','year_start_date','year_end_date','status'], icon:CalendarDays, columns:[['year_name','Academic Year'],['year_start_date','Starts'],['year_end_date','Ends'],['status','Status']] },
  semesters: { eyebrow:'CALENDAR SETTINGS', title:'Academic Semesters', description:'Maintain semester dates, order and registration availability.', doctype:'Academic Semester', fields:['name','semester_name','academic_year','semester_number','start_date','end_date','registration_open','status'], icon:CalendarDays, columns:[['semester_name','Semester'],['academic_year','Year'],['semester_number','Number'],['start_date','Starts'],['end_date','Ends'],['registration_open','Registration'],['status','Status']] },
  'settings-grading': { eyebrow:'ACADEMIC POLICY', title:'Grading Schemes', description:'Configure grade bands used by results and transcripts.', doctype:'Grading Scheme', fields:['name','scheme_name','description','status'], icon:Award, columns:[['scheme_name','Scheme'],['description','Description'],['status','Status']] },
}

function deskOrigin() {
  return window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? import.meta.env.VITE_FRAPPE_URL || 'https://erp-school-academy.jdd.arthlabs.space'
    : window.location.origin
}

function deskSlug(doctype: string) {
  return doctype.toLowerCase().replace(/\s+/g, '-')
}

export function RecordsPage({ view }: { view: RecordView }) {
  const item = config[view]
  const Icon = item.icon
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const [rows, setRows] = useState<FrappeRow[]>([])
  const [query, setQuery] = useState(searchParams.get('q') ?? '')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    fetchList(item.doctype, item.fields, view === 'readiness' ? { clearance_type: 'Graduation' } : undefined, 1000)
      .then(setRows).catch(() => setRows([])).finally(() => setLoading(false))
  }, [item, view])
  useEffect(() => setQuery(searchParams.get('q') ?? ''), [searchParams])

  const filtered = useMemo(() => rows.filter(row => !query || JSON.stringify(row).toLowerCase().includes(query.toLowerCase())), [rows, query])
  const studentActions = view === 'students'
  const transcriptActions = view === 'transcript-register'
  const columnCount = item.columns.length + (studentActions || transcriptActions ? 1 : 0)

  return <section className="records-page">
    <div className="page-intro"><div><span className="eyebrow">{item.eyebrow}</span><h1><Icon size={28}/>{item.title}</h1><p>{item.description}</p></div><button className="primary-button" onClick={() => window.open(`${deskOrigin()}/app/${deskSlug(item.doctype)}`, '_blank', 'noopener,noreferrer')}><Plus size={16}/>Manage full records</button></div>
    <div className="records-summary card"><span className="records-summary-icon"><Icon size={24}/></span><div><strong>{rows.length}</strong><span>{item.doctype} records available</span></div><span className="source-chip">Live university data</span></div>
    <article className="card records-table-card">
      <div className="table-toolbar"><div><h3>{item.title}</h3><p>Search and review live university records.</p></div><label className="search-input"><Search size={16}/><input value={query} onChange={event => { const next=event.target.value; setQuery(next); setSearchParams(next ? {q:next} : {}, {replace:true}) }} placeholder={`Search ${item.title.toLowerCase()}`} /></label></div>
      {item.invoiceTable ? <InvoiceTable rows={filtered}/> : <div className="table-wrap"><table className="data-table">
        <thead><tr>{item.columns.map(column => <th key={column[0]}>{column[1]}</th>)}{studentActions || transcriptActions ? <th>Action</th> : null}</tr></thead>
        <tbody>{loading ? <tr><td colSpan={columnCount} className="data-table-empty">Loading records…</td></tr> : filtered.length ? filtered.map((row,index) => <tr key={String(row.name ?? index)}>{item.columns.map(([field]) => <td key={field}>{field === 'status' || field.startsWith('is_') || field.includes('_status') ? <span className="status-pill tone-green">{String(row[field] ?? '—')}</span> : <>{field === item.columns[0][0] ? <strong>{String(row[field] ?? row.name ?? '—')}</strong> : String(row[field] ?? '—')}</>}</td>)}{studentActions ? <td><button className="mini-action-button row-action-button" onClick={() => navigate(`/students/profile/${encodeURIComponent(String(row.name))}`)}>View profile</button></td> : transcriptActions ? <td><button className="mini-action-button row-action-button" onClick={() => navigate(`/transcripts?student=${encodeURIComponent(String(row.student))}`)}>View transcript</button></td> : null}</tr>) : <tr><td colSpan={columnCount} className="data-table-empty">No matching records found.</td></tr>}</tbody>
      </table></div>}
    </article>
  </section>
}
