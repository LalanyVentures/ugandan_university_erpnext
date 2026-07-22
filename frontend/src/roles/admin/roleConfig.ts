import { Award, BarChart3, BookOpen, Building2, CalendarDays, ClipboardCheck, CreditCard, FileBadge, FileCheck2, GraduationCap, LayoutDashboard, Library, ListChecks, Receipt, Settings, ShieldCheck, UserRoundCheck, Users, WalletCards } from 'lucide-react'

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
] as const

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

export function subNavigationFor(pathname: string) {
  if (pathname.startsWith('/students')) return adminSubNavigation.students
  if (pathname.startsWith('/academics')) return adminSubNavigation.academics
  if (pathname.startsWith('/registration')) return adminSubNavigation.registration
  if (pathname.startsWith('/finance')) return adminSubNavigation.finance
  if (pathname.startsWith('/results')) return adminSubNavigation.results
  if (pathname.startsWith('/transcripts')) return adminSubNavigation.transcripts
  if (pathname.startsWith('/clearance')) return adminSubNavigation.clearance
  if (pathname.startsWith('/settings')) return adminSubNavigation.settings
  return []
}
