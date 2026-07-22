import { Navigate, Route, Routes } from 'react-router-dom'
import type { UniversitySession } from '../../api/frappe'
import { PaymentReceiptsPage } from '../admin/pages/finance/PaymentReceiptsPage'
import { FinancialAnalysisPage } from '../admin/pages/finance/FinancialRiskPage'
import { FinancePortalProvider } from './financePortal'
import { FinanceShell } from './layout/FinanceShell'
import { FinanceDashboardPage } from './pages/dashboard/FinanceDashboardPage'
import { FinanceAccountsPage } from './pages/accounts/FinanceAccountsPage'
import { FinanceStructuresPage } from './pages/structures/FinanceStructuresPage'
import { FinanceBillingPage } from './pages/billing/FinanceBillingPage'
import { FinanceReconciliationPage } from './pages/payments/FinanceReconciliationPage'
import { FinanceSponsorshipsPage } from './pages/sponsorships/FinanceSponsorshipsPage'
import { FinanceClearancePage } from './pages/clearance/FinanceClearancePage'
import { FinancePageState } from './pages/FinanceCommon'

function FinanceAnalysisRoute() {
  return <FinancePageState>{data => <FinancialAnalysisPage financeMode source={{ students: data.students, invoices: data.invoices, feeStructures: data.fee_structures }}/>}</FinancePageState>
}

export function FinanceApp({ session, onLogout }: { session: UniversitySession; onLogout: () => void }) {
  return <FinancePortalProvider><FinanceShell session={session} onLogout={onLogout}><Routes>
    <Route path="/finance" element={<FinanceDashboardPage/>}/>
    <Route path="/finance/students" element={<FinanceAccountsPage/>}/>
    <Route path="/finance/structures" element={<FinanceStructuresPage/>}/>
    <Route path="/finance/invoices" element={<FinanceBillingPage/>}/>
    <Route path="/finance/payments" element={<PaymentReceiptsPage/>}/>
    <Route path="/finance/reconciliation" element={<FinanceReconciliationPage/>}/>
    <Route path="/finance/analysis" element={<FinanceAnalysisRoute/>}/>
    <Route path="/finance/sponsorships" element={<FinanceSponsorshipsPage/>}/>
    <Route path="/finance/clearance" element={<FinanceClearancePage/>}/>
    <Route path="*" element={<Navigate to="/finance" replace/>}/>
  </Routes></FinanceShell></FinancePortalProvider>
}
