import { BadgeDollarSign, ChartNoAxesCombined, CircleDollarSign, FileSpreadsheet, HandCoins, LayoutDashboard, ReceiptText, ShieldCheck, UsersRound } from 'lucide-react'

export const financePrimaryNavigation = ['Overview', 'Students', 'Fees & Payments', 'Clearance'] as const
export const financeStudentTabs = ['Student Directory', 'Student Profile'] as const
export const financeTabs = ['Student Balances', 'Fee Structures', 'Invoices', 'Payment Receipts', 'Financial Analysis', 'Sponsorships'] as const

export const financeNavigation = [
  { label: 'Finance Overview', path: '/finance', icon: LayoutDashboard },
  { label: 'Student Accounts', path: '/finance/students', icon: UsersRound },
  { label: 'Fee Structures', path: '/finance/structures', icon: FileSpreadsheet },
  { label: 'Student Billing', path: '/finance/invoices', icon: BadgeDollarSign },
  { label: 'Payment Receipts', path: '/finance/payments', icon: ReceiptText },
  { label: 'Reconciliation', path: '/finance/reconciliation', icon: CircleDollarSign },
  { label: 'Financial Analysis', path: '/finance/analysis', icon: ChartNoAxesCombined },
  { label: 'Sponsorships', path: '/finance/sponsorships', icon: HandCoins },
  { label: 'Financial Clearance', path: '/finance/clearance', icon: ShieldCheck },
] as const
