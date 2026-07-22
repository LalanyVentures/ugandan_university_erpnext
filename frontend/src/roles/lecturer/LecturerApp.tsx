import { Navigate, Route, Routes } from 'react-router-dom'
import type { UniversitySession } from '../../api/frappe'
import { LecturerPortalProvider } from './lecturerPortal'
import { LecturerShell } from './layout/LecturerShell'
import { LecturerDashboardPage } from './pages/dashboard/LecturerDashboardPage'
import { LecturerProfilePage } from './pages/profile/LecturerProfilePage'
import { LecturerTeachingPage } from './pages/teaching/LecturerTeachingPage'
import { LecturerAttendancePage } from './pages/attendance/LecturerAttendancePage'
import { LecturerAssessmentPage } from './pages/results/LecturerAssessmentPage'

export function LecturerApp({session,onLogout}:{session:UniversitySession;onLogout:()=>void}){return <LecturerPortalProvider><LecturerShell session={session} onLogout={onLogout}><Routes>
  <Route path="/lecturer" element={<LecturerDashboardPage/>}/><Route path="/lecturer/profile" element={<LecturerProfilePage/>}/>
  <Route path="/lecturer/offerings" element={<LecturerTeachingPage view="offerings"/>}/><Route path="/lecturer/students" element={<LecturerTeachingPage view="students"/>}/><Route path="/lecturer/timetable" element={<LecturerTeachingPage view="timetable"/>}/>
  <Route path="/lecturer/attendance" element={<LecturerAttendancePage/>}/><Route path="/lecturer/assessments" element={<LecturerAssessmentPage view="assessments"/>}/><Route path="/lecturer/marks" element={<LecturerAssessmentPage view="marks"/>}/><Route path="/lecturer/results" element={<LecturerAssessmentPage view="results"/>}/><Route path="/lecturer/reviews" element={<LecturerAssessmentPage view="reviews"/>}/><Route path="/lecturer/submissions" element={<LecturerAssessmentPage view="submissions"/>}/>
  <Route path="*" element={<Navigate to="/lecturer" replace/>}/>
 </Routes></LecturerShell></LecturerPortalProvider>}
