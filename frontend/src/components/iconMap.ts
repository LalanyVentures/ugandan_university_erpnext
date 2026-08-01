import { AlertTriangle, Archive, BookOpen, CheckCircle2, CircleDollarSign, Download, Edit3, FileBadge2, FolderTree, GraduationCap, History, Plus, Search, ShieldAlert, Upload, UserRound, UsersRound, XCircle } from 'lucide-react'

export const universityIconMap = Object.freeze({
  student: UserRound, students: UsersRound, programme: GraduationCap, course: BookOpen,
  finance: CircleDollarSign, transcript: FileBadge2, explorer: FolderTree, search: Search,
  create: Plus, edit: Edit3, import: Upload, export: Download, history: History,
  success: CheckCircle2, warning: AlertTriangle, error: XCircle, permission: ShieldAlert, archive: Archive,
})

export type UniversityIconName = keyof typeof universityIconMap

export function iconA11y(name: UniversityIconName, label: string) {
  return { Icon: universityIconMap[name], title: label, 'aria-label': label }
}
