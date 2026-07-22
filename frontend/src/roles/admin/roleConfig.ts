import { Award, BookOpen, CreditCard, FileBadge, GraduationCap, LayoutDashboard, Library, ListChecks, Settings, ShieldCheck, UserRoundCheck, Users } from 'lucide-react'

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

export const adminSubNavigation = [
  { label: 'Applications', path: '/students', icon: UserRoundCheck },
  { label: 'Programmes', path: '/academics', icon: GraduationCap },
  { label: 'Course Registration', path: '/registration', icon: ListChecks },
  { label: 'Student Balances', path: '/finance', icon: CreditCard },
  { label: 'Approval Queue', path: '/results', icon: Award },
  { label: 'Configuration', path: '/settings', icon: Settings },
] as const
