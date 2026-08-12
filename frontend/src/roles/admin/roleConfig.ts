import { Award, BarChart3, BookOpen, Building2, CalendarDays, ClipboardCheck, CreditCard, FileBadge, FileCheck2, GraduationCap, LayoutDashboard, Library, ListChecks, Receipt, ScrollText, Settings, ShieldCheck, UserRoundCheck, Users, WalletCards } from 'lucide-react'
import { facultyHeadAcademicTabs, facultyHeadPrimaryNavigation, facultyHeadResultTabs } from '../faculty-head/roleConfig'
import { financePrimaryNavigation, financeStudentTabs, financeTabs } from '../finance/roleConfig'
import { lecturerPrimaryNavigation, lecturerRegistrationTabs, lecturerResultTabs, lecturerStudentTabs } from '../lecturer/roleConfig'
import { registrarFinanceTabs, registrarPrimaryNavigation } from '../registrar/roleConfig'
import { studentFinanceTabs, studentPrimaryNavigation, studentRegistrationTabs, studentResultTabs } from '../student/roleConfig'

export const adminRoleKey = 'university_admin'
export const adminRoleName = 'AWU Administrator'

export const adminNavigation = [
  { label: 'Overview', path: '/dashboard', icon: LayoutDashboard },
  { label: 'Students', path: '/students', icon: Users },
  { label: 'Academic Structure', path: '/academics', icon: Library },
  { label: 'Registration', path: '/registration', icon: BookOpen },
  { label: 'Fees & Payments', path: '/finance', icon: CreditCard },
  { label: 'Results', path: '/results', icon: Award },
  { label: 'Transcripts', path: '/transcripts', icon: FileBadge },
  { label: 'Clearance', path: '/clearance', icon: ShieldCheck },
  { label: 'Audit Logs', path: '/audit-logs', icon: ScrollText },
] as const

export type PortalRole = 'administrator' | 'registrar' | 'faculty-head' | 'lecturer' | 'finance' | 'student' | 'staff'

export function portalRoleFor(roles: string[]): PortalRole {
  if (roles.includes('System Manager') || roles.includes('Administrator')) return 'administrator'
  if (roles.includes('Registrar') || roles.includes('Academics User')) return 'registrar'
  if (roles.includes('Faculty Head')) return 'faculty-head'
  if (roles.includes('Instructor')) return 'lecturer'
  if (roles.includes('Accounts Manager') || roles.includes('Accounts User')) return 'finance'
  if (roles.includes('Student')) return 'student'
  return 'staff'
}

const primaryByRole: Record<PortalRole, readonly string[]> = {
  administrator: ['Overview','Students','Academic Structure','Registration','Fees & Payments','Results','Transcripts','Clearance','Audit Logs'],
  registrar: registrarPrimaryNavigation,
  'faculty-head': facultyHeadPrimaryNavigation,
  lecturer: lecturerPrimaryNavigation,
  finance: financePrimaryNavigation,
  student: studentPrimaryNavigation,
  staff: ['Overview'],
}

export function navigationFor(roles: string[]) {
  const labels = primaryByRole[portalRoleFor(roles)]
  return adminNavigation.filter(item => labels.includes(item.label))
}

export const adminSubNavigation = {
  students: [
    { label: 'Student Directory', path: '/students', icon: Users },
    { label: 'Student Profile', path: '/students/profile', icon: UserRoundCheck },
    { label: 'Applications', path: '/students/applications', icon: ClipboardCheck },
    { label: 'Programme Enrolments', path: '/students/enrolments', icon: GraduationCap },
    { label: 'Cohorts', path: '/students/cohorts', icon: Users },
  ],
  academics: [
    { label: 'Programmes', path: '/academics', icon: GraduationCap },
    { label: 'Courses', path: '/academics/courses', icon: BookOpen },
    { label: 'Academic Units', path: '/academics/units', icon: Building2 },
    { label: 'Curricula', path: '/academics/curricula', icon: Library },
    { label: 'Academic Calendar', path: '/academics/calendar', icon: CalendarDays },
  ],
  registration: [
    { label: 'Semester Registration', path: '/registration', icon: CalendarDays },
    { label: 'Course Registration', path: '/registration/courses', icon: ListChecks },
    { label: 'Course Offerings', path: '/registration/offerings', icon: BookOpen },
    { label: 'Timetables', path: '/registration/timetables', icon: CalendarDays },
    { label: 'Attendance', path: '/registration/attendance', icon: ClipboardCheck },
  ],
  finance: [
    { label: 'Student Balances', path: '/finance', icon: WalletCards },
    { label: 'Fee Structures', path: '/finance/structures', icon: Receipt },
    { label: 'Invoices', path: '/finance/invoices', icon: FileCheck2 },
    { label: 'Payment Receipts', path: '/finance/payments', icon: CreditCard },
    { label: 'Financial Analysis', path: '/finance/analysis', icon: BarChart3 },
    { label: 'Sponsorships', path: '/finance/sponsorships', icon: ShieldCheck },
  ],
  results: [
    { label: 'Course Results', path: '/results', icon: Award },
    { label: 'Assessments', path: '/results/assessments', icon: ClipboardCheck },
    { label: 'Approval Batches', path: '/results/approvals', icon: FileCheck2 },
    { label: 'Review Requests', path: '/results/reviews', icon: ShieldCheck },
    { label: 'Grading Schemes', path: '/results/grading', icon: Settings },
  ],
  transcripts: [
    { label: 'Transcript Viewer', path: '/transcripts', icon: FileBadge },
    { label: 'Issuance Register', path: '/transcripts/register', icon: FileCheck2 },
  ],
  clearance: [
    { label: 'Clearance Cases', path: '/clearance', icon: ShieldCheck },
    { label: 'Graduation Readiness', path: '/clearance/readiness', icon: GraduationCap },
  ],
  settings: [
    { label: 'University Profile', path: '/settings', icon: Building2 },
    { label: 'Academic Years', path: '/settings/years', icon: CalendarDays },
    { label: 'Semesters', path: '/settings/semesters', icon: CalendarDays },
    { label: 'Grading Schemes', path: '/settings/grading', icon: Award },
  ],
} as const

export function subNavigationFor(pathname: string, roles: string[] = ['System Manager']) {
  const role = portalRoleFor(roles)
  const allowed = (items: readonly {label:string;path:string;icon:typeof Award}[], labels?:string[]) => labels ? items.filter(item => labels.includes(item.label)) : items
  if (pathname.startsWith('/students')) return allowed(adminSubNavigation.students, role === 'lecturer' ? [...lecturerStudentTabs] : role === 'finance' ? [...financeStudentTabs] : role === 'student' ? ['Student Profile'] : undefined)
  if (pathname.startsWith('/academics')) return allowed(adminSubNavigation.academics, role === 'faculty-head' ? [...facultyHeadAcademicTabs] : undefined)
  if (pathname.startsWith('/registration')) return allowed(adminSubNavigation.registration, role === 'lecturer' ? [...lecturerRegistrationTabs] : role === 'student' ? [...studentRegistrationTabs] : undefined)
  if (pathname.startsWith('/finance')) return allowed(adminSubNavigation.finance, role === 'student' ? [...studentFinanceTabs] : role === 'registrar' ? [...registrarFinanceTabs] : role === 'finance' ? [...financeTabs] : undefined)
  if (pathname.startsWith('/results')) return allowed(adminSubNavigation.results, role === 'lecturer' ? [...lecturerResultTabs] : role === 'student' ? [...studentResultTabs] : role === 'faculty-head' ? [...facultyHeadResultTabs] : undefined)
  if (pathname.startsWith('/transcripts')) return allowed(adminSubNavigation.transcripts, role === 'student' ? ['Transcript Viewer'] : undefined)
  if (pathname.startsWith('/clearance')) return allowed(adminSubNavigation.clearance, role === 'student' ? ['Clearance Cases','Graduation Readiness'] : undefined)
  if (pathname.startsWith('/settings')) return role === 'administrator' ? adminSubNavigation.settings : []
  return []
}
