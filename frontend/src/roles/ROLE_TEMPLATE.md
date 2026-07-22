# University portal role template

Every portal role follows the same ParishOS-derived shell and responsive behaviour. A role changes navigation, permissions, metrics, tables and API queries; it does not fork the visual system.

## Folder contract

```text
roles/<role-name>/
  index.ts
  roleConfig.ts
  layout/<Role>Shell.tsx
  navigation/                 # only when role-specific navigation logic is needed
  pages/dashboard/DashboardPage.tsx
  pages/<workflow>/<Workflow>Page.tsx
```

## Implementation checklist

- [ ] Define the ERPNext/Frappe roles that can enter the workspace.
- [ ] Declare primary desktop/mobile navigation in `roleConfig.ts`.
- [ ] Reuse the shared shell dimensions, cards, buttons, table styles and breakpoints.
- [ ] Keep four primary mobile destinations plus the `More` sheet.
- [ ] Query only role-authorised DocTypes through session-authenticated Frappe APIs.
- [ ] Provide loading, empty, error and restricted states for every table.
- [ ] Never put API keys or API secrets in the browser application.
- [ ] Verify desktop, tablet, mobile and print layouts.

## Planned roles

1. University Administrator — implemented first.
2. Registrar / Academic Affairs — admissions, registration, approvals and transcripts.
3. Faculty Head — programme oversight, result approval and transcript approval.
4. Lecturer — assigned offerings, assessments, marks and attendance.
5. Finance Officer — fee structures, invoices, payments, balances and clearance.
6. Student — registration, results, invoices, payments, clearance and approved transcripts.
