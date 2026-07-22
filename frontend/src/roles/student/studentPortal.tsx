import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { callMethod, type FrappeRow } from '../../api/frappe'

export type StudentPortalData = {
  student:FrappeRow
  enrolments:FrappeRow[]
  semester_registrations:FrappeRow[]
  course_registrations:FrappeRow[]
  timetable:FrappeRow[]
  attendance:FrappeRow[]
  results:FrappeRow[]
  invoices:FrappeRow[]
  payments:FrappeRow[]
  clearance:FrappeRow[]
  transcripts:FrappeRow[]
}

type StudentPortalState = {data:StudentPortalData|null;loading:boolean;error:string;refresh:()=>void}
const StudentPortalContext = createContext<StudentPortalState|null>(null)
const method = 'ugandan_university_education.ugandan_university_education.api.get_student_portal_data'

export function StudentPortalProvider({children}:{children:ReactNode}) {
  const [data,setData] = useState<StudentPortalData|null>(null)
  const [loading,setLoading] = useState(true)
  const [error,setError] = useState('')
  function refresh() {
    setLoading(true);setError('')
    callMethod<StudentPortalData>(method).then(setData).catch(cause=>setError(cause instanceof Error?cause.message:'Unable to load your student portal.')).finally(()=>setLoading(false))
  }
  useEffect(refresh,[])
  return <StudentPortalContext.Provider value={{data,loading,error,refresh}}>{children}</StudentPortalContext.Provider>
}

export function useStudentPortal() {
  const value=useContext(StudentPortalContext)
  if(!value) throw new Error('useStudentPortal must be used inside StudentPortalProvider')
  return value
}
