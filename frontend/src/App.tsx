import { useEffect, useState } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import { authApi, type UniversitySession } from './api/frappe'
import { LoginPage } from './pages/auth/LoginPage'
import { AdminShell } from './roles/admin/layout/AdminShell'
import { DashboardPage } from './roles/admin/pages/dashboard/DashboardPage'
import { RecordsPage } from './roles/admin/pages/records/RecordsPage'
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
        <Route path="/students" element={<RecordsPage section="students" />} />
        <Route path="/academics" element={<RecordsPage section="academics" />} />
        <Route path="/registration" element={<RecordsPage section="registration" />} />
        <Route path="/finance" element={<RecordsPage section="finance" />} />
        <Route path="/results" element={<RecordsPage section="results" />} />
        <Route path="/transcripts" element={<TranscriptViewer roleLabel={session.roleLabel} />} />
        <Route path="/transcripts/view/:transcriptName" element={<TranscriptViewer roleLabel={session.roleLabel} />} />
        <Route path="/clearance" element={<RecordsPage section="clearance" />} />
        <Route path="/settings" element={<RecordsPage section="settings" />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </AdminShell>
  )
}
