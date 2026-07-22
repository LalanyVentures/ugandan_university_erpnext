import { Award, BookOpenCheck, CalendarDays, ClipboardCheck, FileCheck2, GraduationCap, LayoutDashboard, ListChecks, MessageSquareWarning, UserRound, UsersRound } from 'lucide-react'

export const lecturerPrimaryNavigation = ['Overview', 'Registration', 'Results', 'Students'] as const
export const lecturerStudentTabs = ['Student Directory', 'Student Profile'] as const
export const lecturerRegistrationTabs = ['Course Offerings', 'Timetables', 'Attendance'] as const
export const lecturerResultTabs = ['Course Results', 'Assessments', 'Review Requests'] as const

export const lecturerNavigation = [
  {label:'Overview',path:'/lecturer',icon:LayoutDashboard},
  {label:'My Profile',path:'/lecturer/profile',icon:UserRound},
  {label:'Course Offerings',path:'/lecturer/offerings',icon:BookOpenCheck},
  {label:'Class Lists',path:'/lecturer/students',icon:UsersRound},
  {label:'Timetable',path:'/lecturer/timetable',icon:CalendarDays},
  {label:'Attendance',path:'/lecturer/attendance',icon:ClipboardCheck},
  {label:'Assessments',path:'/lecturer/assessments',icon:ListChecks},
  {label:'Enter Marks',path:'/lecturer/marks',icon:GraduationCap},
  {label:'Course Results',path:'/lecturer/results',icon:Award},
  {label:'Review Requests',path:'/lecturer/reviews',icon:MessageSquareWarning},
  {label:'Approval Batches',path:'/lecturer/submissions',icon:FileCheck2},
] as const
