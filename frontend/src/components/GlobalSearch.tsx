import { useEffect, useMemo, useState, type ComponentType } from 'react'
import { Award, BookOpen, CircleOff, CreditCard, Eye, FileBadge2, FileText, GraduationCap, IdCard, Search, UserRoundCog, Users } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { fetchList, type FrappeRow } from '../api/frappe'

type SearchKind = 'Student' | 'Lecturer' | 'Staff' | 'Course' | 'Programme' | 'Transcript'
type SearchAction = { label: string; icon: ComponentType<{ size?: number }>; run: () => void }
type SearchResult = {
  id: string
  kind: SearchKind
  title: string
  reference: string
  primaryDetail: string
  secondaryDetail: string
  status: string
  score: number
  actions: SearchAction[]
}

type SearchData = {
  students: FrappeRow[]
  enrolments: FrappeRow[]
  members: FrappeRow[]
  courses: FrappeRow[]
  programmes: FrappeRow[]
  transcripts: FrappeRow[]
}

const emptyData: SearchData = { students: [], enrolments: [], members: [], courses: [], programmes: [], transcripts: [] }

function normalize(value: unknown) {
  return String(value ?? '').toLowerCase().replace(/[^a-z0-9\s]/g, ' ').replace(/\s+/g, ' ').trim()
}

function fuzzyScore(query: string, values: unknown[]) {
  const normalizedQuery = normalize(query)
  if (!normalizedQuery) return 0
  const normalizedValues = values.map(normalize)
  const joined = normalizedValues.join(' ')
  const tokens = normalizedQuery.split(' ').filter(Boolean)
  let score = joined.includes(normalizedQuery) ? 120 : 0
  if (normalizedValues.some(value => value.startsWith(normalizedQuery))) score += 90
  for (const token of tokens) {
    if (normalizedValues.some(value => value === token)) score += 36
    else if (normalizedValues.some(value => value.startsWith(token))) score += 24
    else if (joined.includes(token)) score += 12
  }
  let pointer = 0
  for (const character of joined) {
    if (character === normalizedQuery[pointer]) pointer += 1
    if (pointer === normalizedQuery.length) break
  }
  return score + pointer * 2
}

function deskOrigin() {
  if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    return import.meta.env.VITE_FRAPPE_URL || 'https://erp-university.jdd.arthlabs.space'
  }
  return window.location.origin
}

const deskSlugs: Record<string, string> = {
  Student: 'student', 'University Member': 'university-member', Course: 'course',
  'Academic Programme': 'academic-programme', 'Academic Transcript': 'academic-transcript',
}

function openDesk(doctype: keyof typeof deskSlugs, name: unknown) {
  window.open(`${deskOrigin()}/app/${deskSlugs[doctype]}/${encodeURIComponent(String(name))}`, '_blank', 'noopener,noreferrer')
}

async function loadSearchData(): Promise<SearchData> {
  const requests = await Promise.allSettled([
    fetchList('Student', ['name', 'student_name', 'student_number', 'student_email_id', 'status'], undefined, 1000),
    fetchList('Student Programme Enrolment', ['student', 'academic_programme', 'student_cohort', 'academic_year', 'status'], undefined, 1000),
    fetchList('University Member', ['name', 'member_number', 'full_name', 'member_type', 'user', 'employee', 'status'], undefined, 1000),
    fetchList('Course', ['name', 'course_code', 'course_name', 'academic_unit', 'credit_units', 'study_level', 'status'], undefined, 1000),
    fetchList('Academic Programme', ['name', 'programme_code', 'programme_name', 'award_type', 'academic_unit', 'status'], undefined, 1000),
    fetchList('Academic Transcript', ['name', 'student', 'academic_programme', 'transcript_type', 'status', 'verification_number', 'generated_pdf'], undefined, 1000),
  ])
  const rows = requests.map(result => result.status === 'fulfilled' ? result.value : [])
  return { students: rows[0], enrolments: rows[1], members: rows[2], courses: rows[3], programmes: rows[4], transcripts: rows[5] }
}

export function GlobalSearch({ mobile = false, onNavigate }: { mobile?: boolean; onNavigate?: () => void }) {
  const navigate = useNavigate()
  const [data, setData] = useState<SearchData>(emptyData)
  const [loaded, setLoaded] = useState(false)
  const [loading, setLoading] = useState(false)
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState(false)
  const [highlighted, setHighlighted] = useState(0)

  function ensureData() {
    if (loaded || loading) return
    setLoading(true)
    loadSearchData().then(setData).finally(() => { setLoaded(true); setLoading(false) })
  }

  const results = useMemo(() => {
    if (query.trim().length < 2) return [] as SearchResult[]
    const rows: SearchResult[] = []
    const transcriptByStudent = new Map(data.transcripts.map(row => [String(row.student), row]))
    const enrolmentByStudent = new Map(data.enrolments.map(row => [String(row.student), row]))
    const route = (path: string) => () => { navigate(path); setOpen(false); onNavigate?.() }

    for (const student of data.students) {
      const enrolment = enrolmentByStudent.get(String(student.name))
      const transcript = transcriptByStudent.get(String(student.name))
      const score = fuzzyScore(query, [student.student_name, student.student_number, student.name, student.student_email_id, enrolment?.academic_programme, enrolment?.student_cohort])
      if (!score) continue
      const actions: SearchAction[] = [
        { label: 'View complete student profile', icon: Eye, run: route(`/students/profile/${encodeURIComponent(String(student.name))}`) },
        { label: 'Open full student record', icon: IdCard, run: () => openDesk('Student', student.name) },
        { label: 'View student finance', icon: CreditCard, run: route(`/finance?q=${encodeURIComponent(String(student.name))}`) },
      ]
      actions.push({ label: transcript ? 'View student transcript' : 'Search student transcript', icon: transcript ? FileBadge2 : FileText, run: route(`/transcripts?student=${encodeURIComponent(String(student.name))}`) })
      rows.push({ id: `student-${student.name}`, kind: 'Student', title: String(student.student_name ?? student.name), reference: String(student.student_number ?? student.name), primaryDetail: String(enrolment?.academic_programme ?? 'Programme not assigned'), secondaryDetail: String(enrolment?.student_cohort ?? student.student_email_id ?? 'Cohort not assigned'), status: String(student.status ?? enrolment?.status ?? 'Active'), score: score + 18, actions })
    }

    for (const member of data.members) {
      const type = String(member.member_type ?? 'Staff')
      const kind: SearchKind = type.toLowerCase().includes('lecturer') ? 'Lecturer' : 'Staff'
      const score = fuzzyScore(query, [member.full_name, member.member_number, member.name, member.user, member.employee, member.member_type])
      if (!score) continue
      rows.push({ id: `member-${member.name}`, kind, title: String(member.full_name ?? member.name), reference: String(member.member_number ?? member.name), primaryDetail: type, secondaryDetail: String(member.user ?? member.employee ?? 'University member'), status: String(member.status ?? 'Active'), score: score + 10, actions: [
        { label: `View ${kind.toLowerCase()} details`, icon: Eye, run: () => openDesk('University Member', member.name) },
        { label: 'View teaching and registration', icon: BookOpen, run: route(`/registration?q=${encodeURIComponent(String(member.full_name ?? member.name))}`) },
      ] })
    }

    for (const course of data.courses) {
      const score = fuzzyScore(query, [course.course_code, course.course_name, course.name, course.academic_unit, course.study_level])
      if (!score) continue
      rows.push({ id: `course-${course.name}`, kind: 'Course', title: String(course.course_name ?? course.name), reference: String(course.course_code ?? course.name), primaryDetail: String(course.academic_unit ?? 'Academic unit not assigned'), secondaryDetail: `${Number(course.credit_units ?? 0)} credit units · Level ${String(course.study_level ?? '—')}`, status: String(course.status ?? 'Active'), score, actions: [
        { label: 'View course details', icon: Eye, run: () => openDesk('Course', course.name) },
        { label: 'View course registrations', icon: BookOpen, run: route(`/registration?q=${encodeURIComponent(String(course.course_code ?? course.name))}`) },
        { label: 'View course results', icon: Award, run: route(`/results?q=${encodeURIComponent(String(course.course_code ?? course.name))}`) },
      ] })
    }

    for (const programme of data.programmes) {
      const score = fuzzyScore(query, [programme.programme_code, programme.programme_name, programme.name, programme.award_type, programme.academic_unit])
      if (!score) continue
      rows.push({ id: `programme-${programme.name}`, kind: 'Programme', title: String(programme.programme_name ?? programme.name), reference: String(programme.programme_code ?? programme.name), primaryDetail: String(programme.academic_unit ?? 'Academic unit not assigned'), secondaryDetail: String(programme.award_type ?? 'Academic programme'), status: String(programme.status ?? 'Active'), score, actions: [
        { label: 'View programme details', icon: Eye, run: () => openDesk('Academic Programme', programme.name) },
        { label: 'Open academic structure', icon: GraduationCap, run: route(`/academics?q=${encodeURIComponent(String(programme.programme_code ?? programme.name))}`) },
      ] })
    }

    for (const transcript of data.transcripts) {
      const score = fuzzyScore(query, [transcript.name, transcript.student, transcript.academic_programme, transcript.transcript_type, transcript.verification_number])
      if (!score) continue
      const actions: SearchAction[] = [
        { label: 'View student transcript', icon: Eye, run: route(`/transcripts?student=${encodeURIComponent(String(transcript.student ?? transcript.name))}`) },
        { label: 'Open official transcript record', icon: IdCard, run: () => openDesk('Academic Transcript', transcript.name) },
        { label: 'Open student transcript', icon: FileBadge2, run: route(`/transcripts?student=${encodeURIComponent(String(transcript.student ?? transcript.name))}`) },
      ]
      if (transcript.generated_pdf) actions.push({ label: 'Open generated transcript PDF', icon: FileText, run: () => window.open(`${deskOrigin()}${String(transcript.generated_pdf)}`, '_blank', 'noopener,noreferrer') })
      rows.push({ id: `transcript-${transcript.name}`, kind: 'Transcript', title: `Transcript · ${String(transcript.student ?? transcript.name)}`, reference: String(transcript.verification_number ?? transcript.name), primaryDetail: String(transcript.academic_programme ?? 'Programme not assigned'), secondaryDetail: String(transcript.transcript_type ?? 'Academic transcript'), status: String(transcript.status ?? 'Draft'), score: score + 6, actions })
    }

    return rows.sort((left, right) => right.score - left.score || left.title.localeCompare(right.title)).slice(0, 8)
  }, [data, navigate, onNavigate, query])

  useEffect(() => setHighlighted(0), [query, results.length])

  return <div className={`topbar-search-block${mobile ? ' mobile-search-block' : ''}`} onBlur={() => setTimeout(() => setOpen(false), 140)}>
    <label className="topbar-search" aria-label="Search University records"><Search size={18}/><input value={query} placeholder="Search student, lecturer, course, programme or transcript" onFocus={() => { ensureData(); setOpen(true) }} onChange={event => { setQuery(event.target.value); ensureData(); setOpen(true) }} onKeyDown={event => {
      if (event.key === 'ArrowDown') { event.preventDefault(); setHighlighted(value => Math.min(results.length - 1, value + 1)) }
      if (event.key === 'ArrowUp') { event.preventDefault(); setHighlighted(value => Math.max(0, value - 1)) }
      if (event.key === 'Escape') setOpen(false)
      if (event.key === 'Enter' && results[highlighted]) { event.preventDefault(); results[highlighted].actions[0]?.run() }
    }}/>{loading ? <span className="search-loading">Loading…</span> : null}</label>
    {open && query.trim().length >= 2 ? <div className="global-search-results card"><div className="global-search-header"><strong>Best University matches</strong><span>{results.length} of 8 shown</span></div>{results.length ? <div className="global-search-list">{results.map((result,index)=><article key={result.id} className={highlighted===index?'global-search-item global-search-item-active':'global-search-item'} onMouseEnter={()=>setHighlighted(index)}><button type="button" className="global-search-main" onMouseDown={event=>event.preventDefault()} onClick={result.actions[0]?.run}><div className="global-search-main-row"><div className="global-search-main-top"><KindIcon kind={result.kind}/><strong>{result.title}</strong><span className={`global-search-type-chip kind-${result.kind.toLowerCase()}`}>{result.kind}</span><span className="global-search-type-chip tone-green">{result.status}</span></div><span className="global-search-detail global-search-detail-emphasis">{result.reference}</span></div><div className="global-search-main-row"><span className="global-search-detail">{result.primaryDetail}</span><span className="global-search-detail">{result.secondaryDetail}</span></div></button><div className="global-search-actions">{result.actions.map(action=><button key={action.label} type="button" className="mini-action-button mini-action-button-icon" onMouseDown={event=>event.preventDefault()} onClick={action.run} aria-label={action.label} title={action.label}><action.icon size={14}/></button>)}</div></article>)}</div>:<div className="empty-state"><CircleOff size={16}/><span>No matching University records.</span></div>}</div>:null}
  </div>
}

function KindIcon({ kind }: { kind: SearchKind }) {
  const Icon = kind === 'Student' ? Users : kind === 'Lecturer' || kind === 'Staff' ? UserRoundCog : kind === 'Course' ? BookOpen : kind === 'Programme' ? GraduationCap : FileBadge2
  return <span className="global-search-record-icon"><Icon size={15}/></span>
}
