import { Award, BarChart3, BookOpenCheck, Building2, FileBadge2, FileCheck2, GraduationCap, LayoutDashboard, Library, MessageSquareWarning, ShieldCheck, UserRound, UsersRound } from 'lucide-react'

export const facultyHeadPrimaryNavigation = ['Overview', 'Students', 'Academic Structure', 'Registration', 'Results', 'Transcripts'] as const
export const facultyHeadAcademicTabs = ['Programmes', 'Courses', 'Academic Units', 'Curricula'] as const
export const facultyHeadResultTabs = ['Course Results', 'Assessments', 'Approval Batches', 'Review Requests'] as const
export const facultyHeadNavigation=[
 {label:'Overview',path:'/faculty',icon:LayoutDashboard},{label:'My Faculty',path:'/faculty/profile',icon:Building2},
 {label:'Programmes',path:'/faculty/programmes',icon:GraduationCap},{label:'Courses & Curricula',path:'/faculty/courses',icon:Library},
 {label:'Lecturers',path:'/faculty/lecturers',icon:UserRound},{label:'Students & Cohorts',path:'/faculty/students',icon:UsersRound},
 {label:'Workload',path:'/faculty/workload',icon:BarChart3},
 {label:'Course Offerings',path:'/faculty/offerings',icon:BookOpenCheck},{label:'Result Approvals',path:'/faculty/approvals',icon:FileCheck2},
 {label:'Faculty Results',path:'/faculty/results',icon:Award},{label:'Review Requests',path:'/faculty/reviews',icon:MessageSquareWarning},
 {label:'Transcript Review',path:'/faculty/transcripts',icon:FileBadge2},{label:'Graduation Readiness',path:'/faculty/readiness',icon:ShieldCheck},
] as const
