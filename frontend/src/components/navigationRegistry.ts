import type { PortalRole } from '../roles/admin/roleConfig'
import { adminNavigation } from '../roles/admin/roleConfig'
import { facultyHeadNavigation } from '../roles/faculty-head/roleConfig'
import { financeNavigation } from '../roles/finance/roleConfig'
import { lecturerNavigation } from '../roles/lecturer/roleConfig'
import { registrarNavigation } from '../roles/registrar/roleConfig'
import { studentNavigation } from '../roles/student/roleConfig'
import type { ShellNavItem } from './ApplicationShell'

const registry: Record<PortalRole, readonly ShellNavItem[]> = {
  administrator: adminNavigation,
  registrar: registrarNavigation,
  'faculty-head': facultyHeadNavigation,
  lecturer: lecturerNavigation,
  finance: financeNavigation,
  student: studentNavigation,
  staff: adminNavigation.slice(0, 1),
}

export function navigationForPortal(role: PortalRole) { return registry[role] }

function currentItem(navigation: readonly ShellNavItem[], pathname: string) {
  return navigation.find(item => item.path === pathname) ?? [...navigation].sort((a, b) => b.path.length - a.path.length).find(item => item.path !== navigation[0]?.path && pathname.startsWith(`${item.path}/`)) ?? navigation[0]
}

const groups: Partial<Record<PortalRole, readonly (readonly string[])[]>> = {
  student: [['Registration','My Courses','Timetable','Attendance'],['Fees & Receipts','Results','Transcript','Clearance']],
  lecturer: [['Course Offerings','Class Lists','Timetable','Attendance'],['Assessments','Enter Marks','Course Results','Review Requests','Approval Batches']],
  'faculty-head': [['My Faculty','Programmes','Courses & Curricula','Lecturers','Students & Cohorts','Course Offerings'],['Result Approvals','Faculty Results','Review Requests','Transcript Review','Graduation Readiness']],
  registrar: [['Admissions','Student Records','Programmes','Academic Calendar'],['Semester Registration','Course Registration'],['Result Publication','Approval Register','Transcript Issuance','Graduation & Clearance']],
  finance: [['Student Accounts','Fee Structures','Student Billing'],['Payment Receipts','Reconciliation','Financial Analysis','Sponsorships','Financial Clearance']],
}

export function contextualNavigationFor(role: PortalRole, pathname: string): readonly ShellNavItem[] {
  const navigation = registry[role]
  const current = currentItem(navigation, pathname)
  const group = groups[role]?.find(labels => current && labels.includes(current.label))
  return group ? navigation.filter(item => group.includes(item.label)) : []
}

export function viewNavigationFor(role: PortalRole, pathname: string): readonly ShellNavItem[] {
  const navigation = registry[role]
  const current = currentItem(navigation, pathname)
  if (!current) return []
  if (role === 'administrator') {
    const labels = pathname === '/students' ? ['All','Active','On Leave','Completed','Withdrawn','Saved views']
      : pathname === '/students/applications' ? ['All','Draft','Under Review','Admitted','Rejected']
      : ['/academics/programmes','/academics/courses','/academics/units','/academics/curricula','/students/cohorts','/registration/offerings'].includes(pathname) ? ['All','Active','Archived','Effective year']
      : pathname.includes('transcript') ? ['All','Approved','Issued','Revoked']
      : pathname.includes('clearance') || pathname.includes('readiness') ? ['All','Cleared','Outstanding']
      : pathname.includes('approval') || pathname.includes('results') ? ['All','Draft','Approved','Published']
      : ['All','Active','Needs attention']
    return labels.map(label => ({ label, path: current.path, icon: current.icon }))
  }
  if (role === 'lecturer') {
    const labels = pathname.includes('/marks') || pathname.includes('/results') || pathname.includes('/submissions') ? ['Current semester','Selected offering','Draft','Submitted','Reviewed'] : ['Current semester','Selected offering','All assigned']
    return labels.map(label => ({ label, path: current.path, icon: current.icon }))
  }
  if (role === 'student') {
    const labels = pathname.includes('/transcript') || pathname.includes('/clearance') ? ['Current','History','Available','Pending'] : ['Current semester','History','Selected semester']
    return labels.map(label => ({ label, path: current.path, icon: current.icon }))
  }
  return [
    { label: 'All', path: current.path, icon: current.icon },
    { label: 'Active', path: current.path, icon: current.icon },
    { label: 'Needs attention', path: current.path, icon: current.icon },
  ]
}
