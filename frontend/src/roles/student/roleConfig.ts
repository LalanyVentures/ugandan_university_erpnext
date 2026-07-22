import { Award, BookOpenCheck, CalendarDays, ClipboardCheck, FileBadge2, GraduationCap, LayoutDashboard, ReceiptText, ShieldCheck, UserRound } from 'lucide-react'

export const studentPrimaryNavigation = ['Overview', 'Registration', 'Fees & Payments', 'Results', 'Transcripts', 'Clearance'] as const
export const studentRegistrationTabs = ['Semester Registration', 'Course Registration', 'Timetables', 'Attendance'] as const
export const studentFinanceTabs = ['Student Balances', 'Payment Receipts'] as const
export const studentResultTabs = ['Course Results', 'Review Requests'] as const

export const studentNavigation = [
  {label:'Overview',path:'/student',icon:LayoutDashboard},
  {label:'My Profile',path:'/student/profile',icon:UserRound},
  {label:'Registration',path:'/student/registration',icon:GraduationCap},
  {label:'My Courses',path:'/student/courses',icon:BookOpenCheck},
  {label:'Timetable',path:'/student/timetable',icon:CalendarDays},
  {label:'Attendance',path:'/student/attendance',icon:ClipboardCheck},
  {label:'Fees & Receipts',path:'/student/finance',icon:ReceiptText},
  {label:'Results',path:'/student/results',icon:Award},
  {label:'Transcript',path:'/student/transcript',icon:FileBadge2},
  {label:'Clearance',path:'/student/clearance',icon:ShieldCheck},
] as const
