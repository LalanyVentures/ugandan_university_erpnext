import { useEffect, useState } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import { authApi, type UniversitySession } from './api/frappe'
import { LoginPage } from './pages/auth/LoginPage'
import { AdminShell } from './roles/admin/layout/AdminShell'
import { DashboardPage } from './roles/admin/pages/dashboard/DashboardPage'
import { RecordsPage } from './roles/admin/pages/records/RecordsPage'
import { StudentProfilePage } from './roles/admin/pages/students/StudentProfilePage'
import { PaymentReceiptsPage } from './roles/admin/pages/finance/PaymentReceiptsPage'
import { FinancialRiskPage } from './roles/admin/pages/finance/FinancialRiskPage'
import { TranscriptViewer } from './roles/admin/pages/transcripts/TranscriptViewer'

export default function App() {
  const [session, setSession] = useState<UniversitySession | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    authApi.me().then(setSession).catch(() => setSession(null)).finally(() => setLoading(false))
  }, [])

  if (loading) {
    return <main className="app-loading"><div className="brand-mark"><img src="/awu-logo.png" alt="Ankole Western University" /></div><p>Opening the AWU academic workspace…</p></main>
  }

  if (!session) {
    return <LoginPage onLogin={setSession} />
  }

  return (
    <AdminShell session={session} onLogout={() => setSession(null)}>
      <Routes>
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/students" element={<RecordsPage view="students" />} />
        <Route path="/students/profile" element={<StudentProfilePage />} />
        <Route path="/students/profile/:studentName" element={<StudentProfilePage />} />
        <Route path="/students/applications" element={<RecordsPage view="applications" />} />
        <Route path="/students/enrolments" element={<RecordsPage view="enrolments" />} />
        <Route path="/students/cohorts" element={<RecordsPage view="cohorts" />} />
        <Route path="/academics" element={<RecordsPage view="programmes" />} />
        <Route path="/academics/courses" element={<RecordsPage view="courses" />} />
        <Route path="/academics/units" element={<RecordsPage view="units" />} />
        <Route path="/academics/curricula" element={<RecordsPage view="curricula" />} />
        <Route path="/academics/calendar" element={<RecordsPage view="calendar" />} />
        <Route path="/registration" element={<RecordsPage view="semester-registrations" />} />
        <Route path="/registration/courses" element={<RecordsPage view="course-registrations" />} />
        <Route path="/registration/offerings" element={<RecordsPage view="offerings" />} />
        <Route path="/registration/timetables" element={<RecordsPage view="timetables" />} />
        <Route path="/registration/attendance" element={<RecordsPage view="attendance" />} />
        <Route path="/finance" element={<RecordsPage view="balances" />} />
        <Route path="/finance/structures" element={<RecordsPage view="fee-structures" />} />
        <Route path="/finance/invoices" element={<RecordsPage view="invoices" />} />
        <Route path="/finance/payments" element={<PaymentReceiptsPage />} />
        <Route path="/finance/risk" element={<FinancialRiskPage />} />
        <Route path="/finance/sponsorships" element={<RecordsPage view="sponsorships" />} />
        <Route path="/results" element={<RecordsPage view="course-results" />} />
        <Route path="/results/assessments" element={<RecordsPage view="assessments" />} />
        <Route path="/results/approvals" element={<RecordsPage view="approval-batches" />} />
        <Route path="/results/reviews" element={<RecordsPage view="review-requests" />} />
        <Route path="/results/grading" element={<RecordsPage view="grading" />} />
        <Route path="/transcripts" element={<TranscriptViewer roleLabel={session.roleLabel} />} />
        <Route path="/transcripts/view/:transcriptName" element={<TranscriptViewer roleLabel={session.roleLabel} />} />
        <Route path="/transcripts/register" element={<RecordsPage view="transcript-register" />} />
        <Route path="/clearance" element={<RecordsPage view="clearance" />} />
        <Route path="/clearance/readiness" element={<RecordsPage view="readiness" />} />
        <Route path="/settings" element={<RecordsPage view="university-settings" />} />
        <Route path="/settings/years" element={<RecordsPage view="academic-years" />} />
        <Route path="/settings/semesters" element={<RecordsPage view="semesters" />} />
        <Route path="/settings/grading" element={<RecordsPage view="settings-grading" />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </AdminShell>
  )
}
