# University Platform UX Enhancement Roadmap

## 1. Decision and outcome

This roadmap makes the University Platform an application-native system. Users must be able to find, view, create, update, import, export, and act on permitted records without being sent to ERPNext Desk.

The University implementation is first. The shared components, JDD API contracts, tree explorer, table workbench, and design rules then become the baseline for Primary and Secondary.

`Modal` is used below to mean the model/form window for entering, viewing, or editing information.

## Progress tracking

- [ ] Not started
- [x] Complete
- [-] Partially complete / blocked; add a short note directly below the item

All numbered delivery tasks, exit criteria, definition-of-done gates, and the first implementation slice use Markdown checkboxes. Tick an item only after its code, tests, UX-map update, and required server authorization are complete.

```text
CURRENT
React application → JDD proxy → ERPNext data
                         └── some actions escape to ERPNext Desk

TARGET
React application → JDD application API → assigned ERPNext site
       │                    │
       │                    ├── server-side business/site/credential resolution
       │                    ├── permissions and record scope
       │                    ├── schema, list, record, import, export, mutation APIs
       │                    └── audit trail
       │
       └── native pages, explorer, filters, table, record drawer, modal forms
```

## 2. Non-negotiable product rules

- Do not send normal users to ERPNext Desk through `ERPNext:/app/...` links.
- Do not expose ERPNext API keys, secrets, passwords, site names, or tenant selection to the browser.
- Do not load an unbounded record list into the browser.
- Do not use hidden navigation as authorization. JDD and ERPNext must enforce every read and mutation server-side.
- Every table has: search, structured filters, saved views, pagination, column control, export, import where allowed, empty/loading/error states, and accessible row actions.
- Every create/edit operation has a native modal or full-page form, validation, permission check, confirmation/error feedback, and audit event.
- Global Search, Tree Explorer, side navigation, subtabs, and sub-sub-tabs must point to the same canonical destinations.
- Icons reinforce labels and status; icons never replace an accessible name or the business meaning of a status.

## 3. Target navigation architecture

```text
University application shell
├── Top navigation bar
│   ├── Global Search
│   ├── Tree Explorer trigger
│   ├── Quick create trigger
│   ├── Notifications
│   ├── Context/breadcrumb label
│   └── Profile and sign out
├── Left sidebar
│   ├── Role-aware primary navigation
│   ├── Pinned destinations
│   ├── Recent records
│   └── Bottom dock: settings | help | profile | sign out
├── Primary workspace area
│   ├── Subtab row (section level)
│   ├── Sub-sub-tab row (view level; directly below subtabs, no blank gap)
│   ├── Breadcrumb row
│   └── Page content
└── Mobile shell
    ├── Compact top navigation
    ├── Bottom primary navigation
    ├── More sheet
    └── Explorer/search opened as full-height sheets
```

### 3.1 Navigation levels

| Level | Purpose | Example | State source |
|---|---|---|---|
| Sidebar primary tab | Major business area | Students, Academics, Finance | role + route |
| Subtab | Section grouping | Students: Directory, Applications, Enrolments | route section |
| Sub-sub-tab | Current view/workflow | Directory: All, Active, Applicants, Alumni | route query / saved view |
| Tree node | Entity hierarchy and direct action | Cohort → Student → Results | explorer state |
| Breadcrumb | Where the user is | Students / P2 Cohort / Amina / Results | route + selected entity |

### 3.2 Sub-sub-tab contract

The new row sits immediately below the existing subtab row. It has the same visual language, but a slightly quieter hierarchy.

```text
Topbar
────────────────────────────────────────────────────────────
Subtabs:       Directory | Applications | Enrolments | Cohorts
Sub-sub-tabs:  All | Active | On Leave | Completed | Saved view ▾
────────────────────────────────────────────────────────────
Breadcrumb: Students / Directory / Active
```

- The subtab selects the business area.
- The sub-sub-tab selects a view, workflow stage, or scope within that area.
- A sub-sub-tab may represent a saved filter, status segment, period, or user-specific view.
- Only one sub-sub-tab is active at a time.
- On narrow screens, both rows scroll horizontally with visible focus and a selected-state indicator.
- The selected sub-sub-tab serializes into the URL/query so refresh, browser navigation, shared links, and saved views remain correct.

## 4. Shared component system

Every role uses the same component contracts. Role pages differ by data, permissions, available actions, and defaults—not by inventing a separate interaction model.

```text
Component registry
├── ApplicationShell
├── PrimaryNav / SubtabNav / SubSubtabNav / Breadcrumbs
├── GlobalSearch
├── TreeExplorer
├── QuickCreateMenu
├── PageIntro
├── MetricCard
├── StatusBadge
├── DataWorkbench
│   ├── FilterBar
│   ├── FilterBuilder
│   ├── SavedViewMenu
│   ├── ColumnManager
│   ├── BulkActionBar
│   ├── Pagination
│   ├── ExportMenu
│   ├── ImportWizard
│   └── RowActionMenu
├── RecordDrawer
├── RecordModal
├── ConfirmDialog
├── FormField
├── InlineValidation
├── StatePanel
├── AuditTimeline
└── Toast / LiveFeedback
```

### 4.1 Iconography contract

- Each sidebar item, subtab, tree node type, metric, table action, and form section gets a meaningful coloured icon.
- Icon colours identify category, not permission or destructive meaning alone.
- Destructive actions use a danger colour plus a label and confirmation.
- Tree nodes use type icons: organization, campus, faculty, programme, cohort, class, student, course, invoice, result, transcript, alert, folder, form, import/export.
- Row actions use compact icons with tooltips and `aria-label`: view, edit, add child, duplicate, archive, import, export, print, history, more.
- Use a shared icon map. Do not choose new icons ad hoc on every page.

## 5. Data Workbench: mandatory table specification

Every table becomes a Data Workbench.

```text
Data Workbench
├── Header
│   ├── Page title and record count
│   ├── Add record button
│   ├── Import button (permission + entity capability)
│   ├── Export button
│   └── More actions
├── Search and filters
│   ├── Search all configured searchable fields
│   ├── Quick filter chips
│   ├── Advanced filter builder
│   ├── Saved views
│   ├── Clear filters
│   └── Filter result summary
├── Table controls
│   ├── Column visibility/order
│   ├── Density
│   ├── Sort
│   ├── Page-size selector
│   └── Refresh
├── Table
│   ├── Select-all-current-page checkbox
│   ├── Row checkbox
│   ├── Typed columns
│   ├── Status cells
│   ├── Row action menu
│   └── Empty/loading/error rows
├── Bulk action bar
│   ├── selected count
│   ├── Export selected
│   ├── permitted status/action changes
│   └── Clear selection
└── Footer
    ├── Range summary
    ├── Previous / Next / page jump
    └── Page size: 25 | 50 | 100 | 2000
```

### 5.1 Search and filter behavior

- Search is a server-side query, not a browser-only filter over loaded rows.
- Typing waits 250–400ms before requesting results; Enter executes immediately.
- Search terms are sent with the active filters, sort, page, and permission scope.
- Each table declares its searchable fields. Example Student Directory: student name, student number, email, cohort, programme, status.
- Filters are entity-aware. Do not expose arbitrary ERPNext fields without an approved filter definition.
- Quick filters are visible chips for common values: academic year, semester, cohort, programme, status, invoice status, result state, approval stage.
- Advanced filters support `field + operator + value`, grouped with `AND` / `OR` only where an entity explicitly permits it.
- Active filters appear as removable chips and serialize into the URL/query.
- Saved views store: selected columns, sort, filters, sub-sub-tab, density, and page size.

### 5.2 Pagination behavior

- Default page size: 50.
- Allowed page sizes: 25, 50, 100, 2000.
- `2000` is an explicit high-volume option with a warning about performance and permission-scoped maximums.
- API contract uses `limit` and opaque `cursor` where possible. Offset paging may be used only where ERPNext querying requires it.
- API returns: rows, `nextCursor`, `previousCursor` when available, `totalEstimate` / `totalCount` where cost allows, and applied query metadata.
- Switching page size resets to the first page unless the API can preserve the anchor record.
- Select-all defaults to the current page. “Select all matching filters” is a separate confirmed server-side selection action.
- Exports do not depend on loading every row into the UI.

### 5.3 Exports

- Export current page.
- Export selected rows.
- Export all rows matching the active server-side filters.
- Formats: CSV and XLSX first; PDF only for document-oriented views such as transcript, invoice, receipt, report, or approval summary.
- Export dialog displays entity, filter summary, row scope, selected columns, privacy warning, and format.
- Large exports become background jobs with status, download link, expiry, and audit event.
- Export respects current role, business, record-level scope, and field-redaction policy.

### 5.4 Imports

- Import is enabled only for entities with an approved import schema and role permission.
- Import wizard: choose template → download template → upload CSV/XLSX → map columns → validate → preview errors → confirm → background import result.
- Never allow direct import into sensitive workflow fields, approval fields, calculated balances, or audit fields.
- Import result shows created, updated, skipped, failed, downloadable error report, and correlation ID.
- Initial University import candidates: applicants, students, guardians, cohorts, programmes, course offerings, enrolments, attendance, assessment marks, fee structures, sponsorships.
- Imports that can create financial, result, transcript, or clearance consequences require stricter permission and confirmation.

## 6. Native records and modal forms

### 6.1 Record interaction model

```text
Table row
├── View → Record Drawer
├── Edit → Record Modal
├── Add related record → Child Record Modal
├── History → Audit Timeline drawer
├── Export/Print → Native export/print workflow
└── More → allowed context actions
```

- Row click opens a Record Drawer; it does not open ERPNext Desk.
- Drawer contains summary, related tabs, recent activity, role-allowed actions, and links to internal related records.
- Edit opens a modal for short forms and a native full-page editor for complex multi-section forms.
- Create opens a modal with a clear default context from the current table/tree node.
- Every modal supports: title, purpose, field groups, required markers, help text, validation, Save, Save and add another, Cancel, dirty-state confirmation, success/error feedback.
- Workflow actions use confirmation dialogs with reason fields where required: submit, approve, return, publish, issue, revoke, archive, delete.

### 6.2 University entity form priority

| Entity | Create/edit surface | Related context | First release actions |
|---|---|---|---|
| Student | full-page editor + quick edit modal | enrolments, invoices, results, transcript | create, edit profile, change status |
| Application | modal/full page | applicant, guardian, entry programme | create, review, admit/reject |
| Programme / Course / Unit | modal | curriculum, offerings | create, edit, archive |
| Cohort | modal | programme, enrolments, offerings | create, edit, add enrolment |
| Enrolment / Registration | modal workflow | student, cohort, semester | create, approve, cancel |
| Course Offering | modal/full page | course, cohort, lecturer, timetable | create, assign, schedule |
| Attendance | bulk entry form | offering, timetable, registrations | capture, amend permitted rows |
| Assessment / Result | bulk entry + review modal | offering, students, components | save, submit, approve, publish |
| Fee structure | full-page builder | programme, semester, fee lines | create, version, activate |
| Invoice / Payment | native form/drawer | student, sponsor, allocation | create permitted invoice, view payment allocation |
| Transcript / Clearance | workflow drawer | student, result/finance status | request, review, issue/revoke where allowed |

## 7. Tree Explorer: the system-understanding interface

The Tree Explorer is not a copy of the sidebar. It is a permission-scoped, expandable map of the institution and its records, inspired by a code editor file explorer.

```text
Explorer header
├── Search this tree
├── Scope selector: My work | Current business | Authorized institution
├── Expand all / collapse all
├── Recent / pinned toggle
└── Create button when selected node permits it

Explorer row
├── Expand/collapse chevron
├── Type icon (coloured)
├── Node label
├── Inline secondary identifier
├── Inline action icons: view | add child | edit | more
└── Right-side metadata: count | status | balance | alert
```

### 7.1 University explorer roots

```text
University
├── Academic years
│   └── Semesters
├── Faculties / Academic units
│   └── Programmes
│       └── Cohorts
│           ├── Students
│           │   ├── Enrolments
│           │   ├── Semester registrations
│           │   ├── Course registrations
│           │   ├── Results
│           │   ├── Finance
│           │   └── Transcript / clearance
│           └── Course offerings
│               ├── Lecturer assignments
│               ├── Timetable sessions
│               ├── Attendance
│               └── Assessment/result batches
├── Finance
│   ├── Fee structures
│   ├── Invoices
│   ├── Payments
│   └── Sponsorships
├── Result governance
│   ├── Approval batches
│   ├── Review requests
│   └── Published results
└── Documents
    ├── Transcripts
    └── Clearance cases
```

### 7.2 Tree behavior

- Nodes load children lazily. Expanding a programme never fetches every student in the institution.
- The tree only shows entities/children that the current role may see.
- Node label opens the internal record drawer or filtered table.
- `+` action uses the selected node as a default context. Example: select Cohort → `+ Student enrolment` pre-fills cohort.
- Right-side metrics are concise and permission-safe: `42 students`, `8 pending`, `UGX 3.2m outstanding`, `3 alerts`.
- Tree search matches node labels, identifiers, and approved aliases; selecting a result expands the ancestor path and focuses the node.
- A tree node can be pinned, copied as an internal link, or opened in a new application tab/view—not ERPNext Desk.
- Tree state persists per user: expanded nodes, pins, last scope, selected node.

## 8. Global Search: links to every system capability

Global Search is the command layer over the navigation tree, record data, and permitted actions.

```text
Search result groups
├── Navigate
│   ├── Pages, subtabs, sub-sub-tabs, saved views
│   └── Tree nodes
├── Records
│   ├── Students, staff, programmes, cohorts, offerings
│   ├── Invoices, payments, results, transcripts, clearance
│   └── Ranked by exact identifier then name
├── Actions
│   ├── Add student
│   ├── Add programme / cohort / offering
│   ├── Import students
│   ├── Export current filtered table
│   └── Role-permitted workflow actions
└── Help
    ├── Explain this page
    ├── Keyboard shortcuts
    └── Permission explanation
```

- Search input supports `Cmd/Ctrl + K`.
- Prefixes are optional: `student:`, `cohort:`, `invoice:`, `action:`, `page:`.
- Search calls a JDD search endpoint that receives only the server-resolved business and permitted entity types.
- Results include icon, title, secondary identifier, entity type, status, and destination/action.
- Selecting a record opens a drawer; selecting a page opens the correct primary tab, subtab, and sub-sub-tab.
- Search must not leak names, balances, grades, or safeguarding-sensitive records to unauthorized roles.

## 9. JDD application API roadmap

The frontend cannot deliver this experience by proxying raw ERPNext list calls alone. JDD must provide application-native APIs.

### 9.1 Required endpoint families

```text
GET    /app-api/apps/university-platform/schema/:entity
GET    /app-api/apps/university-platform/entities/:entity
POST   /app-api/apps/university-platform/entities/:entity/query
POST   /app-api/apps/university-platform/entities/:entity
GET    /app-api/apps/university-platform/entities/:entity/:id
PATCH  /app-api/apps/university-platform/entities/:entity/:id
POST   /app-api/apps/university-platform/entities/:entity/:id/actions/:action
GET    /app-api/apps/university-platform/entities/:entity/:id/relations

POST   /app-api/apps/university-platform/search
GET    /app-api/apps/university-platform/explorer
GET    /app-api/apps/university-platform/explorer/children

POST   /app-api/apps/university-platform/exports
GET    /app-api/apps/university-platform/exports/:exportId
POST   /app-api/apps/university-platform/imports/validate
POST   /app-api/apps/university-platform/imports/commit
GET    /app-api/apps/university-platform/imports/:importId

GET    /app-api/apps/university-platform/saved-views
POST   /app-api/apps/university-platform/saved-views
PATCH  /app-api/apps/university-platform/saved-views/:id
DELETE /app-api/apps/university-platform/saved-views/:id
```

### 9.2 Server responsibilities

- Validate application session or revocable shared-link session.
- Resolve organization, business, current user, role set, integration, ERPNext site, and server-side credentials.
- Convert application entity names to an approved ERPNext DocType/operation allowlist.
- Apply role, field, record, child-record, and workflow permission checks.
- Apply query filters only after validating field/operator/value against the entity schema.
- Enforce page-size limits, cursor integrity, query timeout, rate limits, export size limits, and import schema.
- Redact sensitive fields before returning data.
- Produce audit events for views of sensitive records, mutations, exports, imports, workflow actions, and shared-link access.
- Return normalized application DTOs; avoid coupling frontend layouts to raw ERPNext response shapes.

### 9.3 Entity schema contract

Each supported entity schema returns:

```json
{
  "entity": "student",
  "label": "Student",
  "primaryKey": "name",
  "display": { "title": "student_name", "subtitle": "student_number" },
  "searchFields": ["student_name", "student_number", "student_email_id"],
  "columns": [],
  "filters": [],
  "form": { "create": [], "edit": [], "view": [] },
  "actions": [],
  "relations": [],
  "permissions": { "create": false, "update": false, "import": false, "export": true }
}
```

The schema is an allowlist. It must not expose every ERPNext field automatically.

## 10. Delivery phases

### Phase 0 — Architecture, governance, and API foundation

- [ ] Freeze an application entity catalogue for University.
- [ ] Classify every current ERPNext Desk link in `UX_MAP.md` as: replace with drawer, replace with modal, replace with native page, or deliberately remove.
- [ ] Remove all normal-user ERPNext Desk links from the frontend after their native destination is ready.
- [ ] Define JDD entity schema allowlists for Student, Application, Guardian/contact, Programme, Course, Cohort, Enrolment, Registration, Offering, Attendance, Result, Invoice, Payment, Transcript, Clearance.
- [ ] Define server permission matrix per entity/action/field/workflow transition.
- [ ] Add audit model for search, record view, create, update, export, import, approve, publish, issue, revoke, and shared-link use.
- [ ] Add API query model: filters, search, sort, cursor, page size, selected columns, include relations.
- [ ] Define API limits: default 50, max 2000, export thresholds, import file size, rate limits, query timeout.
- [ ] Define error taxonomy: authentication, authorization, validation, conflict, missing integration, missing DocType, backend timeout, job pending.
- [ ] Build contract tests for tenant resolution and browser-supplied tenant/role rejection.

Exit criteria:

- [ ] JDD resolves all business and ERPNext context server-side.
- [ ] Schema endpoint returns safe, versioned entity contracts.
- [ ] Native list/read/write routes exist for one vertical slice: Student Directory.
- [ ] No Student Directory workflow needs ERPNext Desk.

### Phase 1 — Shared shell, visual language, icons, and three-level navigation

- [x] Create shared `ApplicationShell`.
- [x] Implement sidebar, topbar, breadcrumb, mobile header, mobile More sheet.
- [x] Add coloured shared icon map and tooltip/aria-label policy.
- [x] Implement contextual subtabs.
- [x] Implement sub-sub-tab row directly below subtabs.
- [x] Serialize primary/subtab/sub-sub-tab selection into URL/query.
- [x] Implement page title, icon, descriptive eyebrow, and contextual action area.
- [x] Add focus management for navigation changes.
- [x] Add role-aware nav configuration to one source of truth.
- [x] Add skeleton loading, empty, error, and permission-denied shared panels.

Exit criteria:

- [x] Every existing University route renders inside the new shell.
- [x] No blank space exists between subtab and sub-sub-tab rows.
- [x] Active state, browser back/forward, mobile overflow, and role filtering work.

### Phase 2 — Data Workbench and pagination

- [x] Build `DataWorkbench` with entity schema input.
- [x] Implement server-side text search.
- [x] Implement quick filter chips.
- [x] Implement advanced filter builder.
- [x] Implement URL query serialization.
- [x] Implement saved views.
- [x] Implement column picker/order/density.
- [x] Implement sorting.
- [x] Implement cursor/offset pagination with page sizes 25, 50, 100, 2000.
- [x] Implement row selection and bulk action bar.
- [x] Implement export current page, selection, and all filtered records.
- [x] Implement import wizard framework, initially disabled where schema does not permit import.
- [x] Implement native row action menu and Record Drawer.
- [x] Implement query cancellation/debouncing and stale-response protection.
- [x] Add table accessibility and mobile behaviour.

Exit criteria:

- [x] Student Directory, Applications, Programmes, Cohorts, Invoices, and Results use native pagination.
- [x] No list loads the full dataset by default.
- [x] Every migrated table has filters, search, export controls, and page-size selector.

### Phase 3 — Tree Explorer and Global Search

- [x] Implement explorer API and lazy node loading.
- [x] Implement explorer panel/drawer, row layout, node icons, action icons, metadata, pins, and recent nodes.
- [x] Implement University roots and hierarchy.
- [x] Implement node permission/scoping rules.
- [x] Implement node-to-drawer, node-to-table, and node-to-create-context actions.
- [x] Implement global search API.
- [x] Implement grouped navigation, records, tree, actions, and help search results.
- [x] Add keyboard shortcut, keyboard navigation, and focus restoration.
- [x] Add search result telemetry/audit with sensitive-result redaction.
- [x] Add deep-link support for selected tree path and search result.

Exit criteria:

- [x] A user can find a student, cohort, offering, invoice, result, or transcript by explorer or global search.
- [x] Selecting a tree node/action never requires ERPNext Desk.
- [x] Explorer and search expose only permitted records and actions.

### Phase 4 — Administrator experience enhancement

Subphase A — Student and admissions workspace

- [x] Student Directory sub-sub-tabs: All, Active, On Leave, Completed, Withdrawn, Saved views.
- [x] Application sub-sub-tabs: Draft, Under Review, Admitted, Rejected.
- [x] Build native Student Drawer: profile, enrolment, finance, results, documents, activity.
- [x] Build Student create/edit forms and admission conversion workflow.
- [x] Add Guardian/contact related-record modals.
- [x] Add cohort-aware `Add student` action from Explorer and Cohort page.
- [x] Add filters for programme, cohort, status, year, admission date, and missing-data alerts.
- [x] Add import/export for approved student/application templates.

Subphase B — Academic structure workspace

- [x] Programme, Course, Unit, Curriculum, Cohort, Offering tables use Data Workbench.
- [x] Add sub-sub-tabs for active/archive/effective academic year/status.
- [x] Build modal forms for programme, course, unit, cohort, curriculum, offering.
- [x] Build nested related-record views: Programme → cohorts → offerings → students.
- [x] Add timetable and lecturer assignment actions within Offering Drawer.
- [x] Add filters for faculty/unit, programme, academic year, semester, cohort, lecturer, status.

Subphase C — Governance and operations workspace

- [x] Replace result/transcript/clearance external links with workflow drawers.
- [x] Add approval/review/publish/issue/revoke dialogs with reason/audit fields.
- [x] Add finance filters, payment allocation drawers, export, and permission-safe bulk actions.
- [x] Add audit timeline to records with sensitive action history.

Exit criteria:

- [x] Administrator manages the priority University lifecycle natively.
- [x] Every migrated action has form validation, server authorization, audit trail, and user feedback.

### Phase 5 — Lecturer experience enhancement

- [x] Lecturer sidebar: Overview, My Offerings, Students, Timetable, Attendance, Assessments, Marks, Results, Reviews.
- [x] Sub-sub-tabs: current semester, selected offering, draft/submitted/reviewed status.
- [x] Explorer scope defaults to My Offerings → registrations → students.
- [x] Build offering drawer with timetable, roster, attendance, assessments, marks, result batch.
- [x] Build attendance bulk-entry modal with date/session context and save validation.
- [x] Build marks grid with component filters, draft preservation, validation, and submission confirmation.
- [x] Add search for assigned student, offering, course, timetable session.
- [x] Add exports for permitted class lists and marks templates.
- [x] Prevent imports/exports that bypass result workflow controls.
- [x] Add visible read-only reason for data outside lecturer assignment scope.

Exit criteria:

- [x] Lecturer completes attendance and marks workflows without ERPNext Desk.
- [x] All lists paginate and filter by assigned offering/semester.

### Phase 6 — Student experience enhancement

- [x] Student shell: Overview, Profile, Registration, Courses, Timetable, Attendance, Finance, Results, Transcript, Clearance.
- [x] Use friendly cards first; tables remain available for detail/history.
- [x] Explorer scope is personal: My Programme → My Semester → My Courses → My Results/Finance/Documents.
- [x] Add sub-sub-tabs for current/history and selected semester.
- [x] Add filters for semester, status, course, payment status, transcript/clearance status.
- [x] Add native receipt, invoice, transcript, and clearance drawers/print actions.
- [x] Do not expose create/import/admin actions.
- [x] Add clear explanation panels for unavailable or unpublished results.

Exit criteria:

- [x] Student can understand their complete academic journey through cards, tree, search, and filtered history.

### Phase 7 — Faculty Head experience enhancement

- [ ] Explorer scope: assigned faculties/units → programmes → offerings → lecturers/students/results.
- [ ] Add sub-sub-tabs for active semester, approval queue, review queue, transcript readiness.
- [ ] Implement result batch drawer with compare, approve, return, reason, and audit history.
- [ ] Implement review request triage table with status chips and filters.
- [ ] Implement programme and lecturer workload dashboards.
- [ ] Add export of approved operational summaries only.
- [ ] Add search across scoped programmes, offerings, staff, and approval batches.

Exit criteria:

- [ ] Faculty approval, review, and academic oversight occur inside the application with scope enforcement.

### Phase 8 — Registrar experience enhancement

- [ ] Explorer scope: institution → admissions → students → enrolment/registration → results → transcripts/clearance.
- [ ] Add sub-sub-tabs for admissions stage, registration stage, result publication stage, transcript issuance stage.
- [ ] Implement applicant decision, registration decision, publish results, issue/revoke transcript, and clearance decision dialogs.
- [ ] Build institution-wide conflict and completeness filters.
- [ ] Add import templates for approved admissions/registration bulk operations.
- [ ] Add controlled exports and issuance register reports.
- [ ] Add audit timeline and reason capture to every decision.

Exit criteria:

- [ ] Registrar can complete institutional academic workflow without ERPNext Desk.

### Phase 9 — Finance experience enhancement

- [ ] Explorer scope: fee structures → student accounts → invoices → payments → allocations → sponsorships → clearance.
- [ ] Add sub-sub-tabs for academic period, invoice state, arrears band, sponsorship state, clearance state.
- [ ] Build student-account drawer: invoices, allocations, balance calculation, sponsorship context, clearance status.
- [ ] Build fee-structure builder and version/activate workflow.
- [ ] Build invoice create/submit flow where JDD policy permits it.
- [ ] Build payment allocation/receipt view; do not expose unrestricted financial mutation.
- [ ] Add filters for semester, programme, cohort, invoice status, due date, arrears band, sponsor.
- [ ] Add export for ageing, collections, outstanding balances, sponsorship reports.
- [ ] Add import for fee structures and approved sponsorships only.

Exit criteria:

- [ ] Finance users manage scoped account workflows natively with immutable audit records.

### Phase 10 — Primary and Secondary adoption

- [ ] Extract shared shell, Data Workbench, tree, search, modal, export/import, and saved-view packages.
- [ ] Keep University schema/entity names out of shared components.
- [ ] Map Primary entity hierarchy: school → year/term → class/stream → pupil → attendance/assessment/fees/welfare/report card.
- [ ] Map Secondary hierarchy: school → year/term → S1–S6 stream → learner → subject enrolment → assessment/UNEB/finance/boarding.
- [ ] Convert Primary and Secondary ERPNext Desk links to native record drawers/forms.
- [ ] Preserve Primary routes and Secondary local-module architecture initially; introduce Secondary durable deep links as a controlled migration.
- [ ] Repeat role-by-role UX phases using the same acceptance checklist.

## 11. UX map enhancement process

Every phase updates `UX_MAP.md` before and after implementation.

```text
For every page/role/entity
├── Navigation placement
│   ├── Sidebar primary tab
│   ├── Subtab
│   └── Sub-sub-tab
├── Explorer placement
│   ├── Root/parent path
│   ├── Node icon
│   ├── Inline actions
│   └── Right-side metrics/status
├── Search behavior
│   ├── Searchable fields
│   ├── Search result title/subtitle/icon
│   └── Record/page/action destination
├── Data Workbench
│   ├── Columns
│   ├── Filters
│   ├── Sorts
│   ├── Saved views
│   ├── Pagination
│   ├── Export/import capability
│   └── Row/bulk actions
├── Record interaction
│   ├── Drawer tabs
│   ├── Create/edit/view modal fields
│   ├── Workflow actions
│   └── Audit events
├── Permission/data rules
├── Loading/empty/error states
├── Responsive rules
├── Accessibility rules
└── Tests and release acceptance
```

## 12. Definition of done

A phase is complete only when:

- [ ] The UX map contains the page/tree/search/table/form/action/permission contract.
- [ ] The JDD API supports the required server-side operation.
- [ ] No migrated action sends the user to ERPNext Desk.
- [ ] Lists are paginated and never default to loading all records.
- [ ] Search and filters run against server-scoped data.
- [ ] Create/edit/import/export permissions are enforced server-side.
- [ ] Audit events exist for sensitive reads, writes, imports, exports, and workflow actions.
- [ ] Keyboard, mobile, loading, empty, error, and permission-denied paths are tested.
- [ ] The role has a completed acceptance journey from search/tree discovery through action and confirmation.

## 13. First implementation slice

Start with University Administrator → Students → Student Directory.

- [ ] JDD Student schema and query endpoint.
- [ ] Native paginated Student Directory with 25/50/100/2000 selector.
- [ ] Search, quick filters, advanced filters, saved views, column controls.
- [ ] Export current/selected/all-filtered students.
- [ ] Student Drawer with Profile, Enrolments, Finance, Results, Documents, Activity tabs.
- [ ] Create/edit Student modal and validation.
- [ ] Student/Programme/Cohort Tree Explorer path.
- [ ] Global Search for student number/name and `Add student` command.
- [ ] Remove `Manage full records` and `Details` ERPNext Desk links from this completed slice.
- [ ] Update `UX_MAP.md`, add automated API/UI tests, then repeat for Applications and Cohorts.
