import { Navigate, Route, Routes } from 'react-router-dom'
import type { UniversitySession } from '../../api/frappe'
import { StudentShell } from './layout/StudentShell'
import { StudentPortalProvider } from './studentPortal'
import { StudentDashboardPage } from './pages/dashboard/StudentDashboardPage'
import { StudentProfilePage } from './pages/profile/StudentProfilePage'
import { StudentAcademicsPage } from './pages/academics/StudentAcademicsPage'
import { StudentFinancePage } from './pages/finance/StudentFinancePage'
import { StudentResultsPage } from './pages/results/StudentResultsPage'
import { StudentTranscriptPage } from './pages/transcript/StudentTranscriptPage'
import { StudentClearancePage } from './pages/clearance/StudentClearancePage'

export function StudentApp({session,onLogout}:{session:UniversitySession;onLogout:()=>void}){return <StudentPortalProvider><StudentShell session={session} onLogout={onLogout}><Routes>
  <Route path="/student" element={<StudentDashboardPage/>}/>
  <Route path="/student/profile" element={<StudentProfilePage/>}/>
  <Route path="/student/registration" element={<StudentAcademicsPage view="registration"/>}/>
  <Route path="/student/courses" element={<StudentAcademicsPage view="courses"/>}/>
  <Route path="/student/timetable" element={<StudentAcademicsPage view="timetable"/>}/>
  <Route path="/student/attendance" element={<StudentAcademicsPage view="attendance"/>}/>
  <Route path="/student/finance" element={<StudentFinancePage/>}/>
  <Route path="/student/results" element={<StudentResultsPage/>}/>
  <Route path="/student/transcript" element={<StudentTranscriptPage/>}/>
  <Route path="/student/clearance" element={<StudentClearancePage/>}/>
  <Route path="*" element={<Navigate to="/student" replace/>}/>
 </Routes></StudentShell></StudentPortalProvider>}
