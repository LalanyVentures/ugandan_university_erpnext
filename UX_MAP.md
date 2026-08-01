# University Platform UX Map 2.0

This is the canonical UX architecture for the current React frontend in `frontend/src`.
It is intentionally one continuous tree. Routes use React `HashRouter`, so `/students`
appears as `#/students` inside the active JDD artifact URL.

```text
UNIVERSITY PLATFORM UX MAP 2.0 [ROOT:UX-AWU]
├── [SPEC:UX-DOCUMENT] Document contract
│   ├── version: 2.0
│   ├── status: current implementation map + target UX contracts
│   ├── last-source-audit: 2026-08-01
│   ├── reviewed-source: frontend/src
│   ├── routing: React HashRouter
│   ├── backend-data: ERPNext through JDD application proxy
│   ├── authentication: JDD application session / shared-link bootstrap
│   ├── document-shape: one continuous tree
│   ├── scope
│   │   ├── information architecture
│   │   ├── navigation
│   │   ├── reusable UI components
│   │   ├── page component instances
│   │   ├── metrics
│   │   ├── tables and column contracts
│   │   ├── forms and field contracts
│   │   ├── buttons and links
│   │   ├── dialogs, overlays, and previews
│   │   ├── page and component states
│   │   ├── role visibility and permissions
│   │   ├── responsive layout behavior
│   │   ├── data/API lineage
│   │   ├── accessibility requirements
│   │   └── source/test traceability
│   └── node grammar
│       ├── [ROOT:*] product root
│       ├── [SHELL:*] persistent application frame
│       ├── [PORTAL:*] role-owned workspace
│       ├── [PAGE:P-*] routed page
│       ├── [LAYOUT:L-*] spatial arrangement
│       ├── [CONTAINER:C-*] structural container/card/section
│       ├── [COMPONENT:CP-*] reusable component definition
│       ├── [INSTANCE:I-*] component instance
│       ├── [NAV:N-*] navigation collection
│       ├── [TAB:TB-*] contextual tab
│       ├── [TABLE:T-*] data table
│       ├── [COLUMN:COL-*] table-column contract
│       ├── [FORM:F-*] form
│       ├── [FIELD:FLD-*] input contract
│       ├── [METRIC:MT-*] calculated summary
│       ├── [BUTTON:B-*] command
│       ├── [LINK:LK-*] navigation edge
│       ├── [ACTION:AC-*] table/record action contract
│       ├── [LIST:LS-*] repeated-item collection
│       ├── [LABEL:LB-*] visible text label
│       ├── [IMAGE:IMG-*] visual asset
│       ├── [STATUS:ST-*] status display
│       ├── [STATE:S-*] UI state
│       ├── [DIALOG:D-*] modal/prompt/confirmation/overlay
│       ├── [DATA:DT-*] entity/API source
│       ├── [PERMISSION:PM-*] visibility/action rule
│       ├── [RESPONSIVE:R-*] breakpoint behavior
│       ├── [A11Y:A-*] accessibility rule
│       └── [TEST:Q-*] QA acceptance contract
├── [SPEC:UX-LINKS] Link and cross-reference model
│   ├── internal-route syntax
│   │   └── → #/route
│   ├── parameterized internal-route syntax
│   │   └── → #/students/profile/:studentName
│   ├── same-tree cross-reference syntax
│   │   └── ↗ [PAGE:P-A-STUDENT-PROFILE]
│   ├── external ERPNext syntax
│   │   └── ⇱ ERPNext:/app/:doctype/:name
│   ├── generated-document syntax
│   │   └── ⇱ FILE:generated_pdf
│   ├── JDD stable business launch
│   │   └── /app/university-platform?businessId=:businessId&shareToken=:token
│   ├── JDD runtime artifact
│   │   └── /app-api/apps/university-platform/artifact/:launchToken/?launchToken=:launchToken#/route
│   └── required link contract
│       ├── source node ID
│       ├── trigger label
│       ├── target node ID or external target
│       ├── route parameters
│       ├── same-tab/new-tab behavior
│       ├── required role
│       ├── enabled condition
│       └── failure behavior
├── [SPEC:UX-STATUS] Implementation status vocabulary
│   ├── IMPLEMENTED: visible and wired in current source
│   ├── PARTIAL: visible but incomplete
│   ├── INACTIVE: rendered without an action handler
│   ├── CONDITIONAL: rendered only when data/state permits
│   ├── EXTERNAL: completed in ERPNext Desk or generated file
│   ├── PROPOSED: target contract not yet implemented
│   └── DEPRECATED: source exists but is outside the active React route tree
├── [ENTRY:E-APP] Application entry
│   ├── source: frontend/src/App.tsx
│   ├── [STATE:S-APP-LOADING] Checking session
│   │   ├── [CONTAINER:C-APP-LOADING]
│   │   │   ├── [IMAGE:IMG-C-APP-LOADING-AWU-CREST] AWU crest
│   │   │   └── [LABEL:LB-C-APP-LOADING-OPENING-THE-AWU-ACADEMIC-WORKSPACE] Opening the AWU academic workspace…
│   │   └── next
│   │       ├── valid session → [ENTRY:E-ROLE-RESOLVER]
│   │       └── no session → [PAGE:P-LOGIN]
│   ├── [STATE:S-APP-SHARED-BOOTSTRAP] Shared-link launch
│   │   ├── input: JDD launch token
│   │   ├── action: POST /app-api/apps/:appSlug/auth/bootstrap
│   │   ├── output: HttpOnly application-session cookie
│   │   ├── success → [ENTRY:E-ROLE-RESOLVER]
│   │   └── failure → [PAGE:P-LOGIN]
│   └── [ENTRY:E-ROLE-RESOLVER] Role resolver
│       ├── precedence
│       │   ├── System Manager / Administrator → [PORTAL:ADMIN]
│       │   ├── Registrar / Academics User → [PORTAL:REGISTRAR]
│       │   ├── Faculty Head → [PORTAL:FACULTY]
│       │   ├── Instructor → [PORTAL:LECTURER]
│       │   ├── Accounts Manager / Accounts User → [PORTAL:FINANCE]
│       │   ├── Student → [PORTAL:STUDENT]
│       │   └── Other staff → [PORTAL:ADMIN] Overview only
│       └── source: frontend/src/roles/admin/roleConfig.ts
├── [PAGE:P-LOGIN] Login
│   ├── route: session-gated root; visually behaves as #/login
│   ├── source: frontend/src/pages/auth/LoginPage.tsx
│   ├── visibility: unauthenticated users
│   ├── [LAYOUT:L-LOGIN]
│   │   ├── desktop: two-column shell
│   │   │   ├── left: welcome/brand panel
│   │   │   └── right: login form panel
│   │   ├── tablet: responsive two-panel or compressed layout
│   │   └── mobile: vertically stacked form-first layout
│   ├── [CONTAINER:C-LOGIN-WELCOME] Welcome panel
│   │   ├── [IMAGE:IMG-C-LOGIN-WELCOME-AWU-CREST] AWU crest
│   │   │   ├── alt: Ankole Western University crest
│   │   │   └── source: /awu-logo.png
│   │   ├── [LABEL:LB-C-LOGIN-WELCOME-ANKOLE-WESTERN-UNIVERSITY] Ankole Western University
│   │   ├── [LABEL:LB-C-LOGIN-WELCOME-LIGHT-OF-THE-WORLD] Light of the World
│   │   ├── [LABEL:LB-LOGIN-EYEBROW] AWU Academic Services
│   │   ├── [HEADING:H1] Your university. Your academic journey.
│   │   └── [LABEL:LB-LOGIN-SERVICE-SUMMARY] Admissions, teaching, assessment, student finance, transcripts
│   ├── [FORM:F-LOGIN] Credentials card
│   │   ├── [HEADING:H2] Welcome to AWU
│   │   ├── [LABEL:LB-LOGIN-INSTRUCTION] Use the account issued by Ankole Western University
│   │   ├── [FIELD:FLD-LOGIN-ID]
│   │   │   ├── label: Username or email
│   │   │   ├── type: text
│   │   │   ├── required: yes
│   │   │   ├── autocomplete: username
│   │   │   ├── placeholder: name@awu.ac.ug
│   │   │   ├── initial-value: localStorage university.remembered-user
│   │   │   └── accessibility: visible label + user icon decorative
│   │   ├── [FIELD:FLD-LOGIN-PASSWORD]
│   │   │   ├── label: Password
│   │   │   ├── type: password / text when revealed
│   │   │   ├── required: yes
│   │   │   ├── autocomplete: current-password
│   │   │   └── placeholder: Enter your password
│   │   ├── [BUTTON:B-LOGIN-REVEAL]
│   │   │   ├── label: Show password / Hide password
│   │   │   ├── action: toggle password field type
│   │   │   └── accessibility: dynamic aria-label
│   │   ├── [FIELD:FLD-LOGIN-REMEMBER]
│   │   │   ├── label: Remember this device
│   │   │   ├── type: checkbox
│   │   │   ├── default: checked
│   │   │   └── effect: persist/remove remembered identifier
│   │   ├── [BUTTON:B-LOGIN-SUBMIT]
│   │   │   ├── type: submit
│   │   │   ├── label: Sign in
│   │   │   ├── loading-label: Signing in…
│   │   │   ├── disabled-when: authentication request active
│   │   │   ├── action: authApi.login(identifier, password)
│   │   │   └── success → [ENTRY:E-ROLE-RESOLVER]
│   │   ├── [STATE:S-LOGIN-ERROR]
│   │   │   ├── trigger: authentication failure
│   │   │   ├── role: alert
│   │   │   └── fallback: Invalid username or password
│   │   └── [LABEL:LB-F-LOGIN-SECURE-ACADEMIC-SERVICES-FOOTER] Secure academic services footer
│   ├── [DATA:DT-LOGIN]
│   │   ├── JDD runtime: POST /app-api/apps/:appSlug/auth/login
│   │   ├── direct ERPNext: POST /api/method/login
│   │   └── credentials: included application cookie
│   ├── [A11Y:A-LOGIN]
│   │   ├── keyboard-submit: Enter
│   │   ├── focus-order: identifier → password → reveal → remember → submit
│   │   ├── error-announcement: role=alert
│   │   └── password-toggle-name: required
│   └── [TEST:Q-LOGIN]
│       ├── loads remembered username
│       ├── toggles password visibility
│       ├── blocks empty required fields
│       ├── disables submit while loading
│       ├── announces invalid credentials
│       ├── persists identifier when remember is checked
│       └── routes each successful role correctly
├── [COMPONENT-REGISTRY:CR-SHARED] Reusable UI definitions
│   ├── [COMPONENT:CP-PAGE-INTRO] Page Intro
│   │   ├── slots: icon | eyebrow | title | description | optional action
│   │   ├── semantic heading: H1
│   │   ├── responsive: action stacks below title on narrow screens
│   │   └── instances: all role portal pages
│   ├── [COMPONENT:CP-METRIC] Metric Card
│   │   ├── slots: icon | label | value | detail
│   │   ├── tones: default | blue | green | gold | violet | danger | rose
│   │   ├── optional behavior: button/link navigation
│   │   ├── value contract: number | currency | percentage | status text
│   │   ├── responsive: 4-column → 2-column → 1-column
│   │   └── accessibility: value and label read as one meaningful unit
│   ├── [COMPONENT:CP-STATUS] Status Badge
│   │   ├── tones: green | blue | gold | violet | danger
│   │   ├── content: concise status text
│   │   ├── requirement: status cannot rely on colour alone
│   │   └── variants: pill | chip | inline label
│   ├── [COMPONENT:CP-DATA-TABLE] Data Table
│   │   ├── children: caption/header | toolbar | head | body | rows | empty state
│   │   ├── optional: search | selection | row actions | status cells
│   │   ├── row-action limit: four in shared RecordsPage
│   │   ├── responsive target
│   │   │   ├── desktop: full columns
│   │   │   ├── tablet: horizontal scroll + sticky first/action columns
│   │   │   └── mobile: priority columns or record cards [PROPOSED]
│   │   ├── accessibility
│   │   │   ├── semantic table/head/body
│   │   │   ├── explicit column headings
│   │   │   ├── accessible row-action names
│   │   │   └── selected-row state announced
│   │   └── states: loading | populated | filtered-empty | source-empty | error
│   ├── [COMPONENT:CP-SEARCH] Search Field
│   │   ├── children: icon | text input | optional loading label
│   │   ├── optional: URL query synchronization
│   │   ├── clear behavior: empty input restores complete result set
│   │   └── accessibility: visible or aria label required
│   ├── [COMPONENT:CP-ACCORDION] Accordion
│   │   ├── children: summary trigger | heading | detail | status | body
│   │   ├── native implementation: details/summary
│   │   ├── initial-open rule: first item or first actionable item
│   │   └── nested content: metrics | definitions | tables | action group
│   ├── [COMPONENT:CP-CARD-GRID] Card Grid
│   │   ├── repeated semantic articles
│   │   ├── children: header | status | title | metadata | actions
│   │   └── responsive: multi-column → single-column
│   ├── [COMPONENT:CP-FORM-MESSAGE] Form Message
│   │   ├── variants: neutral | success | error
│   │   ├── trigger: mutation response
│   │   └── target: aria-live polite [PROPOSED]
│   ├── [COMPONENT:CP-STATE-PANEL] State Panel
│   │   ├── loading: spinner + heading + explanation
│   │   ├── error: heading + message + retry button
│   │   └── empty: icon + heading + explanation + optional action
│   ├── [COMPONENT:CP-BUTTON] Button
│   │   ├── variants: primary | secondary | danger | icon | inline | row action
│   │   ├── states: default | hover | focus | active | disabled | busy
│   │   ├── contract: action verb + object
│   │   └── busy behavior: disabled + progressive label
│   ├── [COMPONENT:CP-FIELD] Form Field
│   │   ├── children: visible label | input/select/textarea | help | error
│   │   ├── states: default | focused | filled | invalid | disabled | read-only
│   │   └── contract: name | type | value | validation | permission | save target
│   ├── [COMPONENT:CP-MOBILE-MORE] Mobile More Sheet
│   │   ├── type: overlay + bottom sheet
│   │   ├── children: backdrop | heading | close button | link list | sign out
│   │   ├── close: backdrop | close button | destination selection
│   │   └── accessibility target: focus trap + Escape close [PROPOSED]
│   └── [COMPONENT:CP-RECEIPT-DOCUMENT] Receipt Document
│       ├── university identity
│       ├── payer/student identity
│       ├── payment summary
│       ├── allocation details
│       ├── close action
│       └── print action
├── [SHELL:S-ROLE] Shared authenticated role shell
│   ├── source families
│   │   ├── frontend/src/roles/admin/layout/AdminShell.tsx
│   │   ├── frontend/src/roles/student/layout/StudentShell.tsx
│   │   ├── frontend/src/roles/lecturer/layout/LecturerShell.tsx
│   │   ├── frontend/src/roles/faculty-head/layout/FacultyShell.tsx
│   │   ├── frontend/src/roles/registrar/layout/RegistrarShell.tsx
│   │   └── frontend/src/roles/finance/layout/FinanceShell.tsx
│   ├── [LAYOUT:L-DESKTOP-SHELL]
│   │   ├── left: fixed desktop sidebar
│   │   ├── top: desktop topbar
│   │   ├── centre: workspace
│   │   └── optional: contextual subtab row under topbar
│   ├── [CONTAINER:C-TOPBAR]
│   │   ├── [INSTANCE:I-GLOBAL-SEARCH] Global Search — Administrator only
│   │   ├── [LABEL:LB-C-TOPBAR-CURRENT-WORKSPACE-PAGE] Current workspace/page
│   │   ├── [BUTTON:B-NOTIFICATIONS] Notifications
│   │   │   ├── status: INACTIVE
│   │   │   └── proposed-target: [DIALOG:D-NOTIFICATIONS]
│   │   └── [BUTTON:B-PROFILE-CHIP] User profile chip
│   │       ├── Administrator → #/settings
│   │       ├── Student → #/student/profile
│   │       ├── Lecturer → #/lecturer/profile
│   │       ├── Faculty Head → #/faculty/profile
│   │       ├── Registrar: INACTIVE
│   │       └── Finance: INACTIVE
│   ├── [CONTAINER:C-SIDEBAR]
│   │   ├── [IMAGE:IMG-C-SIDEBAR-AWU-LOGO] AWU logo
│   │   ├── [LABEL:LB-C-SIDEBAR-ROLE-PORTAL-IDENTITY] Role portal identity
│   │   ├── [NAV:N-PRIMARY] Role-specific navigation
│   │   └── [CONTAINER:C-SIDEBAR-BOTTOM] Bottom action dock
│   │       ├── [LINK:LK-SETTINGS] Administrator settings → #/settings
│   │       ├── [BUTTON:B-SIDEBAR-PROFILE] Profile
│   │       └── [BUTTON:B-LOGOUT] Sign out
│   │           ├── action: authApi.logout()
│   │           ├── state: local session cleared
│   │           └── target → [PAGE:P-LOGIN]
│   ├── [CONTAINER:C-WORKSPACE]
│   │   ├── [NAV:N-SUBTABS] Contextual subtabs — Administrator only
│   │   └── [CONTAINER:C-PAGE-STACK] Routed page outlet
│   ├── [LAYOUT:L-MOBILE-SHELL]
│   │   ├── top: mobile header
│   │   ├── centre: page content
│   │   └── bottom: priority navigation
│   ├── [CONTAINER:C-MOBILE-HEADER]
│   │   ├── AWU logo
│   │   ├── current page label
│   │   ├── search button — Administrator only
│   │   └── notification button — INACTIVE
│   ├── [NAV:N-MOBILE-BOTTOM]
│   │   ├── first four role-priority destinations
│   │   └── [BUTTON:B-MOBILE-MORE] More → [DIALOG:D-MOBILE-MORE]
│   ├── [DIALOG:D-MOBILE-MORE]
│   │   ├── uses: [COMPONENT:CP-MOBILE-MORE]
│   │   ├── remaining role destinations
│   │   └── sign out → [PAGE:P-LOGIN]
│   ├── [DIALOG:D-NOTIFICATIONS] Notification centre [PROPOSED]
│   │   ├── trigger: [BUTTON:B-NOTIFICATIONS]
│   │   ├── header
│   │   │   ├── [LABEL:LB-D-NOTIFICATIONS-NOTIFICATIONS] Notifications
│   │   │   ├── [METRIC:MT-UNREAD-NOTIFICATIONS] unread count
│   │   │   └── [BUTTON:B-MARK-ALL-READ] Mark all as read
│   │   ├── [LIST:LS-NOTIFICATIONS]
│   │   │   ├── title
│   │   │   ├── message preview
│   │   │   ├── created-at timestamp
│   │   │   ├── read/unread status
│   │   │   └── destination link when supplied
│   │   ├── states: loading | populated | empty | error
│   │   ├── close: close icon | Escape | outside click
│   │   └── accessibility: labelled dialog; focus trapped; focus returned to trigger
│   ├── [RESPONSIVE:R-SHELL]
│   │   ├── desktop: sidebar + topbar visible; mobile navigation hidden
│   │   ├── mobile: desktop sidebar/topbar hidden; mobile header/bottom nav visible
│   │   └── target tablet behavior: collapsed sidebar [PROPOSED]
│   └── [TEST:Q-SHELL]
│       ├── highlights current primary route
│       ├── highlights exact contextual subtab
│       ├── profile chip follows role destination
│       ├── logout remains within current artifact
│       ├── mobile More opens and closes
│       └── unauthorized role destinations are absent
├── [PORTAL:ADMIN] Administrator Portal
│   ├── role-match: System Manager | Administrator | fallback staff
│   ├── route-owner: frontend/src/App.tsx
│   ├── shell: [SHELL:S-ROLE] via AdminShell
│   ├── [PERMISSION:PM-ADMIN]
│   │   ├── full-navigation: System Manager / Administrator
│   │   ├── fallback-staff-navigation: Overview only
│   │   ├── settings: Administrator only
│   │   └── record mutations: server-side ERPNext permission remains authoritative
│   ├── [NAV:N-ADMIN-PRIMARY]
│   │   ├── Overview → [PAGE:P-A-DASHBOARD]
│   │   ├── Students → [PAGE:P-A-STUDENTS]
│   │   ├── Academic Structure → [PAGE:P-A-PROGRAMMES]
│   │   ├── Registration → [PAGE:P-A-SEMESTER-REG]
│   │   ├── Fees & Payments → [PAGE:P-A-BALANCES]
│   │   ├── Results → [PAGE:P-A-RESULTS]
│   │   ├── Transcripts → [PAGE:P-A-TRANSCRIPT]
│   │   └── Clearance → [PAGE:P-A-CLEARANCE]
│   ├── [NAV:N-ADMIN-SUBTABS]
│   │   ├── Students
│   │   │   ├── Student Directory → [PAGE:P-A-STUDENTS]
│   │   │   ├── Student Profile → [PAGE:P-A-STUDENT-PROFILE]
│   │   │   ├── Applications → [PAGE:P-A-APPLICATIONS]
│   │   │   ├── Programme Enrolments → [PAGE:P-A-ENROLMENTS]
│   │   │   └── Cohorts → [PAGE:P-A-COHORTS]
│   │   ├── Academic Structure
│   │   │   ├── Programmes → [PAGE:P-A-PROGRAMMES]
│   │   │   ├── Courses → [PAGE:P-A-COURSES]
│   │   │   ├── Academic Units → [PAGE:P-A-UNITS]
│   │   │   ├── Curricula → [PAGE:P-A-CURRICULA]
│   │   │   └── Academic Calendar → [PAGE:P-A-CALENDAR]
│   │   ├── Registration
│   │   │   ├── Semester Registration → [PAGE:P-A-SEMESTER-REG]
│   │   │   ├── Course Registration → [PAGE:P-A-COURSE-REG]
│   │   │   ├── Course Offerings → [PAGE:P-A-OFFERINGS]
│   │   │   ├── Timetables → [PAGE:P-A-TIMETABLES]
│   │   │   └── Attendance → [PAGE:P-A-ATTENDANCE]
│   │   ├── Fees & Payments
│   │   │   ├── Student Balances → [PAGE:P-A-BALANCES]
│   │   │   ├── Fee Structures → [PAGE:P-A-FEE-STRUCTURES]
│   │   │   ├── Invoices → [PAGE:P-A-INVOICES]
│   │   │   ├── Payment Receipts → [PAGE:P-A-RECEIPTS]
│   │   │   ├── Financial Analysis → [PAGE:P-A-FIN-ANALYSIS]
│   │   │   └── Sponsorships → [PAGE:P-A-SPONSORSHIPS]
│   │   ├── Results
│   │   │   ├── Course Results → [PAGE:P-A-RESULTS]
│   │   │   ├── Assessments → [PAGE:P-A-ASSESSMENTS]
│   │   │   ├── Approval Batches → [PAGE:P-A-APPROVALS]
│   │   │   ├── Review Requests → [PAGE:P-A-REVIEWS]
│   │   │   └── Grading Schemes → [PAGE:P-A-GRADING]
│   │   ├── Transcripts
│   │   │   ├── Transcript Viewer → [PAGE:P-A-TRANSCRIPT]
│   │   │   └── Issuance Register → [PAGE:P-A-TRANSCRIPT-REGISTER]
│   │   ├── Clearance
│   │   │   ├── Clearance Cases → [PAGE:P-A-CLEARANCE]
│   │   │   └── Graduation Readiness → [PAGE:P-A-READINESS]
│   │   └── Settings
│   │       ├── University Profile → [PAGE:P-A-SETTINGS]
│   │       ├── Academic Years → [PAGE:P-A-YEARS]
│   │       ├── Semesters → [PAGE:P-A-SEMESTERS]
│   │       └── Grading Schemes → [PAGE:P-A-SETTINGS-GRADING]
│   ├── [COMPONENT:CP-ADMIN-RECORDS-PAGE] Shared RecordsPage contract
│   │   ├── source: frontend/src/roles/admin/pages/records/RecordsPage.tsx
│   │   ├── [CONTAINER:C-RECORDS-INTRO]
│   │   │   ├── icon
│   │   │   ├── eyebrow
│   │   │   ├── H1 title
│   │   │   ├── description
│   │   │   └── [BUTTON:B-MANAGE-FULL-RECORDS]
│   │   │       ├── label: Manage full records
│   │   │       ├── behavior: new tab
│   │   │       └── target ⇱ ERPNext:/app/:doctype
│   │   ├── [CONTAINER:C-RECORDS-SUMMARY]
│   │   │   ├── icon
│   │   │   ├── [METRIC:MT-RECORD-COUNT] total returned records
│   │   │   └── [STATUS:ST-LIVE-DATA] Live university data
│   │   ├── [CONTAINER:C-RECORDS-TOOLBAR]
│   │   │   ├── H3 view title
│   │   │   ├── helper text
│   │   │   └── [FIELD:FLD-RECORD-SEARCH]
│   │   │       ├── type: search text
│   │   │       ├── filter: JSON-string representation of each row
│   │   │       ├── URL state: `?q=`
│   │   │       └── update behavior: replace current history entry
│   │   ├── [INSTANCE:I-RECORDS-TABLE] uses [COMPONENT:CP-DATA-TABLE]
│   │   │   ├── columns: page-specific
│   │   │   ├── final column: Actions
│   │   │   ├── row actions
│   │   │   │   ├── student-scoped: Profile | Transcript | Finance | Details
│   │   │   │   ├── programme: Courses | Enrolments | Details
│   │   │   │   ├── course: Offerings | Results | Details
│   │   │   │   ├── cohort: Enrolments | Registrations | Details
│   │   │   │   ├── calendar: Registrations | Results | Details
│   │   │   │   ├── fee structure: Invoices | Details
│   │   │   │   ├── transcript register: Transcript | Details
│   │   │   │   └── default: Details
│   │   │   └── states
│   │   │       ├── [STATE:S-RECORDS-LOADING] Loading records…
│   │   │       ├── [STATE:S-RECORDS-READY] rows displayed
│   │   │       └── [STATE:S-RECORDS-EMPTY] No matching records found
│   │   ├── [DATA:DT-RECORDS]
│   │   │   ├── source: ERPNext DocType list API
│   │   │   ├── transport: JDD ERPNext proxy
│   │   │   ├── limit: 1000
│   │   │   └── readiness-filter: clearance_type = Graduation
│   │   ├── [RESPONSIVE:R-RECORDS]
│   │   │   ├── desktop: toolbar inline; full table
│   │   │   ├── tablet: toolbar wraps; table horizontal scroll
│   │   │   └── mobile target: cards with priority fields [PROPOSED]
│   │   └── [TEST:Q-RECORDS]
│   │       ├── loads declared fields only
│   │       ├── query filters visible rows
│   │       ├── query survives route refresh
│   │       ├── Details opens correct ERPNext record
│   │       ├── student links carry the correct student name
│   │       └── empty and loading states span all columns
│   ├── [PAGE:P-A-DASHBOARD] Administrator Overview
│   │   ├── route → #/dashboard
│   │   ├── source: frontend/src/roles/admin/pages/dashboard/DashboardPage.tsx
│   │   ├── [LAYOUT:L-A-DASHBOARD]
│   │   │   ├── welcome hero
│   │   │   ├── five-card metric grid
│   │   │   ├── academic-period + quick-action grid
│   │   │   └── recent-finance full-width table
│   │   ├── [CONTAINER:C-A-WELCOME]
│   │   │   ├── role-aware heading and description
│   │   │   ├── [BUTTON:B-A-HERO-PRIMARY] role-dependent primary route
│   │   │   ├── [BUTTON:B-A-HERO-SECONDARY] role-dependent secondary route
│   │   │   └── signed-in role/access status
│   │   ├── [CONTAINER:C-A-METRICS]
│   │   │   ├── [METRIC:MT-A-STUDENTS] Active Students
│   │   │   │   ├── calculation: count Student records
│   │   │   │   └── link → [PAGE:P-A-STUDENTS]
│   │   │   ├── [METRIC:MT-A-PROGRAMMES] Programmes
│   │   │   │   ├── calculation: count Academic Programme records
│   │   │   │   └── link → [PAGE:P-A-PROGRAMMES]
│   │   │   ├── [METRIC:MT-A-OUTSTANDING] Outstanding Fees
│   │   │   │   ├── calculation: SUM(Sales Invoice.outstanding_amount)
│   │   │   │   ├── detail: collection percentage
│   │   │   │   └── link → [PAGE:P-A-BALANCES]
│   │   │   ├── [METRIC:MT-A-RESULTS] Results
│   │   │   │   ├── calculation: count Student Course Result records
│   │   │   │   └── link → [PAGE:P-A-RESULTS]
│   │   │   └── [METRIC:MT-A-TRANSCRIPTS] Transcripts
│   │   │       ├── calculation: count Academic Transcript records
│   │   │       └── link → [PAGE:P-A-TRANSCRIPT]
│   │   ├── [CONTAINER:C-A-PERIOD]
│   │   │   ├── current semester label
│   │   │   ├── [METRIC:MT-C-A-PERIOD-REGISTRATION-COUNT] Registration count
│   │   │   ├── [METRIC:MT-C-A-PERIOD-FEES-RECEIVED] Fees received
│   │   │   ├── [BUTTON:B-C-A-PERIOD-STUDENT-BALANCES] Student balances → [PAGE:P-A-BALANCES]
│   │   │   ├── [BUTTON:B-C-A-PERIOD-APPROVAL-QUEUE] Approval queue → [PAGE:P-A-RESULTS]
│   │   │   └── [BUTTON:B-C-A-PERIOD-TRANSCRIPTS] Transcripts → [PAGE:P-A-TRANSCRIPT]
│   │   ├── [CONTAINER:C-A-QUICK-ACTIONS]
│   │   │   ├── [BUTTON:B-C-A-QUICK-ACTIONS-REGISTER-A-STUDENT] Register a student → [PAGE:P-A-STUDENTS]
│   │   │   ├── [BUTTON:B-C-A-QUICK-ACTIONS-OPEN-COURSE-REGISTRATION] Open course registration → [PAGE:P-A-SEMESTER-REG]
│   │   │   ├── [BUTTON:B-C-A-QUICK-ACTIONS-REVIEW-STUDENT-BALANCES] Review student balances → [PAGE:P-A-BALANCES]
│   │   │   └── [BUTTON:B-C-A-QUICK-ACTIONS-APPROVE-RESULTS] Approve results → [PAGE:P-A-RESULTS]
│   │   ├── [TABLE:T-A-RECENT-FINANCE]
│   │   │   ├── title: Latest student balances
│   │   │   ├── [COLUMN:COL-A-RECENT-FINANCE-STUDENT] Student
│   │   │   │   ├── source: student/customer
│   │   │   │   └── secondary: invoice name
│   │   │   ├── [COLUMN:COL-A-RECENT-FINANCE-SEMESTER] Semester
│   │   │   ├── [COLUMN:COL-A-RECENT-FINANCE-INVOICE] Invoice
│   │   │   │   └── format: UGX grand_total
│   │   │   ├── [COLUMN:COL-A-RECENT-FINANCE-PAID] Paid
│   │   │   │   └── calculation: grand_total - outstanding_amount
│   │   │   ├── [COLUMN:COL-A-RECENT-FINANCE-BALANCE] Balance
│   │   │   │   └── format: UGX outstanding_amount
│   │   │   ├── [COLUMN:COL-A-RECENT-FINANCE-STATUS] Status
│   │   │   │   └── Paid | Partly Paid | Outstanding
│   │   │   ├── [COLUMN:COL-A-RECENT-FINANCE-ACTIONS] Actions
│   │   │   │   ├── Profile → [PAGE:P-A-STUDENT-PROFILE]
│   │   │   │   ├── Balance → [PAGE:P-A-FIN-ANALYSIS]
│   │   │   │   └── Receipts → [PAGE:P-A-RECEIPTS]
│   │   │   └── [STATE:S-T-A-RECENT-FINANCE-NO-SUBMITTED-STUDENT-INVOICES] No submitted student invoices
│   │   └── [TEST:Q-A-DASHBOARD]
│   │       ├── metric totals match loaded datasets
│   │       ├── every metric navigates to its detail page
│   │       ├── finance status derives correctly from totals
│   │       └── role-specific hero actions are valid
│   ├── [PAGE:P-A-STUDENTS] Student Directory
│   │   ├── route → #/students
│   │   ├── source: RecordsPage view=students
│   │   ├── uses: [COMPONENT:CP-ADMIN-RECORDS-PAGE]
│   │   ├── data: Student
│   │   ├── [TABLE:T-A-STUDENTS]
│   │   │   ├── [COLUMN:COL-A-STUDENTS-STUDENT] Student ← student_name; primary text
│   │   │   ├── [COLUMN:COL-A-STUDENTS-STUDENT-NUMBER] Student Number ← student_number
│   │   │   ├── [COLUMN:COL-A-STUDENTS-GENDER] Gender ← gender
│   │   │   ├── [COLUMN:COL-A-STUDENTS-STATUS] Status ← status; status pill
│   │   │   ├── [COLUMN:COL-A-STUDENTS-EMAIL] Email ← student_email_id
│   │   │   └── [COLUMN:COL-A-STUDENTS-ACTIONS] Actions
│   │   │       ├── Profile → [PAGE:P-A-STUDENT-PROFILE]
│   │   │       ├── Transcript → [PAGE:P-A-TRANSCRIPT]
│   │   │       ├── Finance → [PAGE:P-A-FIN-ANALYSIS]
│   │   │       └── Details ⇱ ERPNext:/app/student/:name
│   │   └── [BUTTON:B-P-A-STUDENTS-MANAGE-FULL-RECORDS] Manage full records ⇱ ERPNext:/app/student
│   ├── [PAGE:P-A-APPLICATIONS] University Applications
│   │   ├── route → #/students/applications
│   │   ├── source: RecordsPage view=applications
│   │   ├── data: University Application
│   │   └── [TABLE:T-A-APPLICATIONS]
│   │       ├── [COLUMN:COL-A-APPLICATIONS-APPLICANT] Applicant ← applicant_name
│   │       ├── [COLUMN:COL-A-APPLICATIONS-APPLICATION] Application ← application_number
│   │       ├── [COLUMN:COL-A-APPLICATIONS-PROGRAMME] Programme ← academic_programme
│   │       ├── [COLUMN:COL-A-APPLICATIONS-YEAR] Year ← academic_year
│   │       ├── [COLUMN:COL-A-APPLICATIONS-STATUS] Status ← status
│   │       └── [COLUMN:COL-A-APPLICATIONS-ACTIONS] Actions ← student links when admitted + Details
│   ├── [PAGE:P-A-ENROLMENTS] Programme Enrolments
│   │   ├── route → #/students/enrolments
│   │   ├── source: RecordsPage view=enrolments
│   │   ├── data: Student Programme Enrolment
│   │   └── [TABLE:T-A-ENROLMENTS]
│   │       ├── [COLUMN:COL-A-ENROLMENTS-STUDENT] Student
│   │       ├── [COLUMN:COL-A-ENROLMENTS-PROGRAMME] Programme
│   │       ├── [COLUMN:COL-A-ENROLMENTS-COHORT] Cohort
│   │       ├── [COLUMN:COL-A-ENROLMENTS-ADMISSION-YEAR] Admission Year
│   │       ├── [COLUMN:COL-A-ENROLMENTS-STATUS] Status
│   │       ├── [COLUMN:COL-A-ENROLMENTS-EXPECTED-COMPLETION] Expected Completion
│   │       └── [COLUMN:COL-A-ENROLMENTS-ACTIONS] Actions ← Profile | Transcript | Finance | Details
│   ├── [PAGE:P-A-COHORTS] Student Cohorts
│   │   ├── route → #/students/cohorts
│   │   ├── source: RecordsPage view=cohorts
│   │   ├── data: Student Cohort
│   │   └── [TABLE:T-A-COHORTS]
│   │       ├── [COLUMN:COL-A-COHORTS-CODE] Code
│   │       ├── [COLUMN:COL-A-COHORTS-COHORT] Cohort
│   │       ├── [COLUMN:COL-A-COHORTS-PROGRAMME] Programme
│   │       ├── [COLUMN:COL-A-COHORTS-YEAR] Year
│   │       ├── [COLUMN:COL-A-COHORTS-CAMPUS] Campus
│   │       ├── [COLUMN:COL-A-COHORTS-STATUS] Status
│   │       └── [COLUMN:COL-A-COHORTS-ACTIONS] Actions ← Enrolments | Registrations | Details
│   ├── [PAGE:P-A-STUDENT-PROFILE] Complete Student Profile
│   │   ├── routes
│   │   │   ├── #/students/profile
│   │   │   └── #/students/profile/:studentName
│   │   ├── source: frontend/src/roles/admin/pages/students/StudentProfilePage.tsx
│   │   ├── [STATE:S-A-PROFILE-PICKER] No selected student
│   │   │   ├── [FIELD:FLD-A-STUDENT-SEARCH]
│   │   │   │   ├── type: search
│   │   │   │   └── placeholder: Search student name or registration number
│   │   │   └── [LIST:LS-S-A-PROFILE-PICKER-MATCHING-STUDENTS] Matching students
│   │   │       └── [BUTTON:B-LS-S-A-PROFILE-PICKER-MATCHING-STUDENTS-STUDENT-AVATAR-IDENTITY] Student avatar + identity → selected profile route
│   │   ├── [STATE:S-A-PROFILE-LOADING] Loading related records
│   │   ├── [STATE:S-A-PROFILE-ERROR] Profile error panel
│   │   └── [STATE:S-A-PROFILE-READY] Selected profile
│   │       ├── [CONTAINER:C-A-STUDENT-HERO]
│   │       │   ├── avatar initials
│   │       │   ├── student name/number/status
│   │       │   ├── [BUTTON:B-C-A-STUDENT-HERO-FINANCIAL-ANALYSIS] Financial analysis → [PAGE:P-A-FIN-ANALYSIS]
│   │       │   ├── [BUTTON:B-C-A-STUDENT-HERO-TRANSCRIPT] Transcript → [PAGE:P-A-TRANSCRIPT]
│   │       │   └── [BUTTON:B-C-A-STUDENT-HERO-EDIT-STUDENT-CANCEL-EDIT] Edit student / Cancel edit
│   │       ├── [CONTAINER:C-A-STUDENT-METRICS]
│   │       │   ├── [METRIC:MT-C-A-STUDENT-METRICS-PROGRAMME-ENROLMENTS] Programme Enrolments
│   │       │   ├── [METRIC:MT-C-A-STUDENT-METRICS-SEMESTER-REGISTRATIONS] Semester Registrations
│   │       │   ├── [METRIC:MT-C-A-STUDENT-METRICS-RECORDED-RESULTS] Recorded Results
│   │       │   └── [METRIC:MT-C-A-STUDENT-METRICS-OUTSTANDING-BALANCE] Outstanding Balance
│   │       ├── [FORM:F-A-STUDENT-EDIT]
│   │       │   ├── visibility: edit mode
│   │       │   ├── [FIELD:FLD-F-A-STUDENT-EDIT-FIRST-NAME] First Name; text
│   │       │   ├── [FIELD:FLD-F-A-STUDENT-EDIT-MIDDLE-NAME] Middle Name; text
│   │       │   ├── [FIELD:FLD-F-A-STUDENT-EDIT-LAST-NAME] Last Name; text
│   │       │   ├── [FIELD:FLD-F-A-STUDENT-EDIT-GENDER] Gender; select: blank | Male | Female | Other
│   │       │   ├── [FIELD:FLD-F-A-STUDENT-EDIT-DATE-OF-BIRTH] Date of Birth; date
│   │       │   ├── [FIELD:FLD-F-A-STUDENT-EDIT-NATIONALITY] Nationality; text
│   │       │   ├── [FIELD:FLD-F-A-STUDENT-EDIT-STUDENT-EMAIL] Student Email; email
│   │       │   ├── [FIELD:FLD-F-A-STUDENT-EDIT-STATUS] Status; select: Applicant | Active | On Leave | Completed | Discontinued | Withdrawn
│   │       │   ├── [BUTTON:B-F-A-STUDENT-EDIT-SAVE-STUDENT-DETAILS] Save student details
│   │       │   └── states: editing | saving | saved | error
│   │       ├── [CONTAINER:C-A-ENROLMENT-CARDS] Programme enrolments
│   │       ├── [TABLE:T-A-STUDENT-INVOICES]
│   │       │   ├── [COLUMN:COL-A-STUDENT-INVOICES-INVOICE] Invoice
│   │       │   ├── [COLUMN:COL-A-STUDENT-INVOICES-SEMESTER] Semester
│   │       │   ├── [COLUMN:COL-A-STUDENT-INVOICES-DATE] Date
│   │       │   ├── [COLUMN:COL-A-STUDENT-INVOICES-BILLED] Billed
│   │       │   ├── [COLUMN:COL-A-STUDENT-INVOICES-PAID] Paid
│   │       │   ├── [COLUMN:COL-A-STUDENT-INVOICES-BALANCE] Balance
│   │       │   ├── [COLUMN:COL-A-STUDENT-INVOICES-STATUS] Status
│   │       │   └── [COLUMN:COL-A-STUDENT-INVOICES-ACTIONS] Actions ← Balance | Receipts
│   │       ├── [TABLE:T-A-STUDENT-RESULTS]
│   │       │   ├── [COLUMN:COL-A-STUDENT-RESULTS-SEMESTER] Semester
│   │       │   ├── [COLUMN:COL-A-STUDENT-RESULTS-COURSE] Course
│   │       │   ├── [COLUMN:COL-A-STUDENT-RESULTS-MARK] Mark
│   │       │   ├── [COLUMN:COL-A-STUDENT-RESULTS-GRADE] Grade
│   │       │   ├── [COLUMN:COL-A-STUDENT-RESULTS-RESULT] Result
│   │       │   ├── [COLUMN:COL-A-STUDENT-RESULTS-APPROVED] Approved
│   │       │   ├── [COLUMN:COL-A-STUDENT-RESULTS-PUBLISHED] Published
│   │       │   └── [COLUMN:COL-A-STUDENT-RESULTS-ACTION] Action ← Transcript
│   │       ├── [DATA:DT-A-STUDENT-PROFILE]
│   │       │   ├── Student
│   │       │   ├── Student Programme Enrolment
│   │       │   ├── Semester Registration
│   │       │   ├── Sales Invoice
│   │       │   └── Student Course Result
│   │       └── [TEST:Q-A-STUDENT-PROFILE]
│   │           ├── picker filters by name/number
│   │           ├── route parameter reloads selected student
│   │           ├── edit cancel restores read mode
│   │           ├── save updates visible identity
│   │           └── finance/transcript links preserve student ID
│   ├── [PAGE:P-A-PROGRAMMES] Academic Programmes
│   │   ├── route → #/academics
│   │   ├── source: RecordsPage view=programmes
│   │   ├── data: Academic Programme
│   │   └── [TABLE:T-A-PROGRAMMES]
│   │       ├── [COLUMN:COL-A-PROGRAMMES-CODE] Code
│   │       ├── [COLUMN:COL-A-PROGRAMMES-PROGRAMME] Programme
│   │       ├── [COLUMN:COL-A-PROGRAMMES-AWARD] Award
│   │       ├── [COLUMN:COL-A-PROGRAMMES-ACADEMIC-UNIT] Academic Unit
│   │       ├── [COLUMN:COL-A-PROGRAMMES-YEARS] Years
│   │       ├── [COLUMN:COL-A-PROGRAMMES-STATUS] Status
│   │       └── [COLUMN:COL-A-PROGRAMMES-ACTIONS] Actions ← Courses | Enrolments | Details
│   ├── [PAGE:P-A-COURSES] Courses
│   │   ├── route → #/academics/courses
│   │   ├── source: RecordsPage view=courses
│   │   ├── data: Course
│   │   └── [TABLE:T-A-COURSES]
│   │       ├── [COLUMN:COL-A-COURSES-CODE] Code
│   │       ├── [COLUMN:COL-A-COURSES-COURSE] Course
│   │       ├── [COLUMN:COL-A-COURSES-ACADEMIC-UNIT] Academic Unit
│   │       ├── [COLUMN:COL-A-COURSES-CREDITS] Credits
│   │       ├── [COLUMN:COL-A-COURSES-LEVEL] Level
│   │       ├── [COLUMN:COL-A-COURSES-STATUS] Status
│   │       └── [COLUMN:COL-A-COURSES-ACTIONS] Actions ← Offerings | Results | Details
│   ├── [PAGE:P-A-UNITS] Academic Units
│   │   ├── route → #/academics/units
│   │   ├── data: Academic Unit
│   │   └── [TABLE:T-A-UNITS]
│   │       ├── [COLUMN:COL-A-UNITS-CODE] Code
│   │       ├── [COLUMN:COL-A-UNITS-ACADEMIC-UNIT] Academic Unit
│   │       ├── [COLUMN:COL-A-UNITS-TYPE] Type
│   │       ├── [COLUMN:COL-A-UNITS-PARENT] Parent
│   │       ├── [COLUMN:COL-A-UNITS-HEAD] Head
│   │       ├── [COLUMN:COL-A-UNITS-STATUS] Status
│   │       └── [COLUMN:COL-A-UNITS-ACTIONS] Actions
│   ├── [PAGE:P-A-CURRICULA] Programme Curricula
│   │   ├── route → #/academics/curricula
│   │   ├── data: Programme Curriculum
│   │   └── [TABLE:T-A-CURRICULA]
│   │       ├── [COLUMN:COL-A-CURRICULA-CURRICULUM] Curriculum
│   │       ├── [COLUMN:COL-A-CURRICULA-PROGRAMME] Programme
│   │       ├── [COLUMN:COL-A-CURRICULA-ACADEMIC-YEAR] Academic Year
│   │       ├── [COLUMN:COL-A-CURRICULA-EFFECTIVE-FROM] Effective From
│   │       ├── [COLUMN:COL-A-CURRICULA-STATUS] Status
│   │       └── [COLUMN:COL-A-CURRICULA-ACTIONS] Actions
│   ├── [PAGE:P-A-CALENDAR] Academic Calendar
│   │   ├── route → #/academics/calendar
│   │   ├── data: Academic Semester
│   │   └── [TABLE:T-A-CALENDAR]
│   │       ├── [COLUMN:COL-A-CALENDAR-SEMESTER] Semester
│   │       ├── [COLUMN:COL-A-CALENDAR-YEAR] Year
│   │       ├── [COLUMN:COL-A-CALENDAR-NUMBER] Number
│   │       ├── [COLUMN:COL-A-CALENDAR-STARTS] Starts
│   │       ├── [COLUMN:COL-A-CALENDAR-ENDS] Ends
│   │       ├── [COLUMN:COL-A-CALENDAR-REGISTRATION-OPEN] Registration Open
│   │       ├── [COLUMN:COL-A-CALENDAR-STATUS] Status
│   │       └── [COLUMN:COL-A-CALENDAR-ACTIONS] Actions
│   ├── [PAGE:P-A-SEMESTER-REG] Semester Registrations
│   │   ├── route → #/registration
│   │   ├── data: Semester Registration
│   │   └── [TABLE:T-A-SEMESTER-REG]
│   │       ├── [COLUMN:COL-A-SEMESTER-REG-STUDENT] Student
│   │       ├── [COLUMN:COL-A-SEMESTER-REG-SEMESTER] Semester
│   │       ├── [COLUMN:COL-A-SEMESTER-REG-REGISTERED] Registered
│   │       ├── [COLUMN:COL-A-SEMESTER-REG-ENROLMENT] Enrolment
│   │       ├── [COLUMN:COL-A-SEMESTER-REG-STATUS] Status
│   │       └── [COLUMN:COL-A-SEMESTER-REG-ACTIONS] Actions
│   ├── [PAGE:P-A-COURSE-REG] Course Registrations
│   │   ├── route → #/registration/courses
│   │   ├── data: Course Registration
│   │   └── [TABLE:T-A-COURSE-REG]
│   │       ├── [COLUMN:COL-A-COURSE-REG-STUDENT] Student
│   │       ├── [COLUMN:COL-A-COURSE-REG-OFFERING] Offering
│   │       ├── [COLUMN:COL-A-COURSE-REG-COHORT] Cohort
│   │       ├── [COLUMN:COL-A-COURSE-REG-TYPE] Type
│   │       ├── [COLUMN:COL-A-COURSE-REG-ATTEMPT] Attempt
│   │       ├── [COLUMN:COL-A-COURSE-REG-STATUS] Status
│   │       └── [COLUMN:COL-A-COURSE-REG-ACTIONS] Actions
│   ├── [PAGE:P-A-OFFERINGS] Course Offerings
│   │   ├── route → #/registration/offerings
│   │   ├── data: Course Offering
│   │   └── [TABLE:T-A-OFFERINGS]
│   │       ├── [COLUMN:COL-A-OFFERINGS-COURSE] Course
│   │       ├── [COLUMN:COL-A-OFFERINGS-SEMESTER] Semester
│   │       ├── [COLUMN:COL-A-OFFERINGS-COHORT] Cohort
│   │       ├── [COLUMN:COL-A-OFFERINGS-TYPE] Type
│   │       ├── [COLUMN:COL-A-OFFERINGS-CAPACITY] Capacity
│   │       ├── [COLUMN:COL-A-OFFERINGS-STATUS] Status
│   │       └── [COLUMN:COL-A-OFFERINGS-ACTIONS] Actions
│   ├── [PAGE:P-A-TIMETABLES] Teaching Timetables
│   │   ├── route → #/registration/timetables
│   │   ├── data: Teaching Timetable Entry
│   │   └── [TABLE:T-A-TIMETABLES]
│   │       ├── [COLUMN:COL-A-TIMETABLES-OFFERING] Offering
│   │       ├── [COLUMN:COL-A-TIMETABLES-DAY] Day
│   │       ├── [COLUMN:COL-A-TIMETABLES-STARTS] Starts
│   │       ├── [COLUMN:COL-A-TIMETABLES-ENDS] Ends
│   │       ├── [COLUMN:COL-A-TIMETABLES-VENUE] Venue
│   │       ├── [COLUMN:COL-A-TIMETABLES-SESSION] Session
│   │       ├── [COLUMN:COL-A-TIMETABLES-STATUS] Status
│   │       └── [COLUMN:COL-A-TIMETABLES-ACTIONS] Actions
│   ├── [PAGE:P-A-ATTENDANCE] Student Attendance
│   │   ├── route → #/registration/attendance
│   │   ├── data: Student Attendance
│   │   └── [TABLE:T-A-ATTENDANCE]
│   │       ├── [COLUMN:COL-A-ATTENDANCE-STUDENT] Student
│   │       ├── [COLUMN:COL-A-ATTENDANCE-COURSE-REGISTRATION] Course Registration
│   │       ├── [COLUMN:COL-A-ATTENDANCE-DATE] Date
│   │       ├── [COLUMN:COL-A-ATTENDANCE-ATTENDANCE] Attendance
│   │       ├── [COLUMN:COL-A-ATTENDANCE-REMARKS] Remarks
│   │       └── [COLUMN:COL-A-ATTENDANCE-ACTIONS] Actions
│   ├── [PAGE:P-A-BALANCES] Student Balances
│   │   ├── route → #/finance
│   │   ├── source: RecordsPage view=balances + InvoiceTable
│   │   ├── data: Sales Invoice
│   │   └── [TABLE:T-A-BALANCES]
│   │       ├── [COLUMN:COL-A-BALANCES-STUDENT] Student
│   │       ├── [COLUMN:COL-A-BALANCES-SEMESTER] Semester
│   │       ├── [COLUMN:COL-A-BALANCES-INVOICE] Invoice
│   │       ├── [COLUMN:COL-A-BALANCES-PAID] Paid
│   │       ├── [COLUMN:COL-A-BALANCES-BALANCE] Balance
│   │       ├── [COLUMN:COL-A-BALANCES-STATUS] Status
│   │       ├── [COLUMN:COL-A-BALANCES-ACTIONS] Actions
│   │       ├── [ACTION:AC-T-A-BALANCES-PROFILE] Profile
│   │       ├── [ACTION:AC-T-A-BALANCES-BALANCE] Balance
│   │       └── [ACTION:AC-T-A-BALANCES-RECEIPTS] Receipts
│   ├── [PAGE:P-A-FEE-STRUCTURES] University Fee Structures
│   │   ├── route → #/finance/structures
│   │   ├── data: University Fee Structure
│   │   └── [TABLE:T-A-FEE-STRUCTURES]
│   │       ├── [COLUMN:COL-A-FEE-STRUCTURES-STRUCTURE] Structure
│   │       ├── [COLUMN:COL-A-FEE-STRUCTURES-PROGRAMME] Programme
│   │       ├── [COLUMN:COL-A-FEE-STRUCTURES-SEMESTER] Semester
│   │       ├── [COLUMN:COL-A-FEE-STRUCTURES-CURRENCY] Currency
│   │       ├── [COLUMN:COL-A-FEE-STRUCTURES-EFFECTIVE-FROM] Effective From
│   │       ├── [COLUMN:COL-A-FEE-STRUCTURES-STATUS] Status
│   │       └── [COLUMN:COL-A-FEE-STRUCTURES-ACTIONS] Actions
│   ├── [PAGE:P-A-INVOICES] Student Invoices
│   │   ├── route → #/finance/invoices
│   │   ├── source: RecordsPage view=invoices + InvoiceTable
│   │   ├── data: Sales Invoice
│   │   └── [TABLE:T-A-INVOICES]
│   │       ├── [COLUMN:COL-A-INVOICES-STUDENT] Student
│   │       ├── [COLUMN:COL-A-INVOICES-SEMESTER] Semester
│   │       ├── [COLUMN:COL-A-INVOICES-INVOICE] Invoice
│   │       ├── [COLUMN:COL-A-INVOICES-PAID] Paid
│   │       ├── [COLUMN:COL-A-INVOICES-BALANCE] Balance
│   │       ├── [COLUMN:COL-A-INVOICES-STATUS] Status
│   │       └── [COLUMN:COL-A-INVOICES-ACTIONS] Actions
│   ├── [PAGE:P-A-RECEIPTS] Payment Receipts
│   │   ├── route → #/finance/payments
│   │   ├── source: frontend/src/roles/admin/pages/finance/PaymentReceiptsPage.tsx
│   │   ├── [CONTAINER:C-A-RECEIPT-INTRO]
│   │   │   ├── page title/description
│   │   │   └── [BUTTON:B-A-REFRESH-PAYMENTS] Refresh payments
│   │   ├── [CONTAINER:C-A-RECEIPT-TOOLBAR]
│   │   │   ├── [FIELD:FLD-A-PAYMENT-SEARCH]
│   │   │   │   └── placeholder: Search payer, payment number, reference or method
│   │   │   ├── [BUTTON:B-A-SELECT-ALL] Select all results / Clear results
│   │   │   └── [BUTTON:B-A-PREVIEW-RECEIPT]
│   │   │       ├── labels: Preview receipt | Preview combined receipt | Preparing…
│   │   │       └── enabled-when: one or more payments selected
│   │   ├── [TABLE:T-A-PAYMENTS]
│   │   │   ├── [COLUMN:COL-A-PAYMENTS-SELECT] Select
│   │   │   ├── [COLUMN:COL-A-PAYMENTS-PAYMENT] Payment
│   │   │   ├── [COLUMN:COL-A-PAYMENTS-DATE] Date
│   │   │   ├── [COLUMN:COL-A-PAYMENTS-STUDENT-PAYER] Student / Payer
│   │   │   ├── [COLUMN:COL-A-PAYMENTS-METHOD] Method
│   │   │   ├── [COLUMN:COL-A-PAYMENTS-REFERENCE] Reference
│   │   │   ├── [COLUMN:COL-A-PAYMENTS-AMOUNT] Amount
│   │   │   └── [COLUMN:COL-A-PAYMENTS-ACTION] Action ← Receipt
│   │   ├── [TABLE:T-A-ALLOCATIONS]
│   │   │   ├── [COLUMN:COL-A-ALLOCATIONS-PAYMENT] Payment
│   │   │   ├── [COLUMN:COL-A-ALLOCATIONS-INVOICE-REFERENCE] Invoice / Reference
│   │   │   ├── [COLUMN:COL-A-ALLOCATIONS-STUDENT] Student
│   │   │   ├── [COLUMN:COL-A-ALLOCATIONS-ACADEMIC-SEMESTER] Academic Semester
│   │   │   ├── [COLUMN:COL-A-ALLOCATIONS-INVOICE-TOTAL] Invoice Total
│   │   │   ├── [COLUMN:COL-A-ALLOCATIONS-ALLOCATED] Allocated
│   │   │   └── [COLUMN:COL-A-ALLOCATIONS-CURRENT-BALANCE] Current Balance
│   │   ├── [DIALOG:D-A-RECEIPT-PREVIEW]
│   │   │   ├── implementation: full-page conditional receipt view
│   │   │   ├── uses: [COMPONENT:CP-RECEIPT-DOCUMENT]
│   │   │   ├── [BUTTON:B-D-A-RECEIPT-PREVIEW-CLOSE-PREVIEW] Close preview
│   │   │   └── [BUTTON:B-D-A-RECEIPT-PREVIEW-PRINT-RECEIPT] Print receipt
│   │   ├── [DATA:DT-A-RECEIPTS]
│   │   │   ├── Payment Entry
│   │   │   ├── Payment Entry Reference
│   │   │   └── method: get_payment_receipt_data
│   │   └── [TEST:Q-A-RECEIPTS]
│   │       ├── search filters payer/payment/reference/method
│   │       ├── select all reflects filtered rows
│   │       ├── combined receipt includes selected entries
│   │       ├── close returns to previous selections
│   │       └── print action invokes browser print
│   ├── [PAGE:P-A-FIN-ANALYSIS] Financial Analysis
│   │   ├── route → #/finance/analysis
│   │   ├── source: frontend/src/roles/admin/pages/finance/FinancialRiskPage.tsx
│   │   ├── [FIELD:FLD-A-FIN-SEARCH]
│   │   │   └── placeholder: Search student or registration number
│   │   ├── [CONTAINER:C-A-FIN-GLOBAL-METRICS]
│   │   │   ├── [METRIC:MT-C-A-FIN-GLOBAL-METRICS-TOTAL-BILLED] Total Billed
│   │   │   ├── [METRIC:MT-C-A-FIN-GLOBAL-METRICS-PAYMENTS-RECEIVED] Payments Received
│   │   │   ├── [METRIC:MT-C-A-FIN-GLOBAL-METRICS-OUTSTANDING-BALANCE] Outstanding Balance
│   │   │   └── [METRIC:MT-C-A-FIN-GLOBAL-METRICS-STUDENTS-ANALYSED] Students Analysed
│   │   ├── [TABLE:T-A-FIN-STUDENTS]
│   │   │   ├── [COLUMN:COL-A-FIN-STUDENTS-STUDENT] Student
│   │   │   ├── [COLUMN:COL-A-FIN-STUDENTS-TOTAL-COST] Total Cost
│   │   │   ├── [COLUMN:COL-A-FIN-STUDENTS-PAID] Paid
│   │   │   ├── [COLUMN:COL-A-FIN-STUDENTS-BALANCE-TO-PAY] Balance to Pay
│   │   │   ├── [COLUMN:COL-A-FIN-STUDENTS-OVERDUE] Overdue
│   │   │   ├── [COLUMN:COL-A-FIN-STUDENTS-COLLECTION] Collection
│   │   │   ├── [COLUMN:COL-A-FIN-STUDENTS-ACTIONS] Actions
│   │   │   ├── [ACTION:AC-T-A-FIN-STUDENTS-ANALYSE] Analyse
│   │   │   ├── [ACTION:AC-T-A-FIN-STUDENTS-PROFILE] Profile
│   │   │   └── [ACTION:AC-T-A-FIN-STUDENTS-TRANSCRIPT] Transcript
│   │   └── [STATE:S-A-FIN-SELECTED]
│   │       ├── [CONTAINER:C-A-FIN-STUDENT-METRICS]
│   │       │   ├── [METRIC:MT-C-A-FIN-STUDENT-METRICS-ASSESSED-COST] Assessed Cost
│   │       │   ├── [METRIC:MT-C-A-FIN-STUDENT-METRICS-PAID-TO-DATE] Paid to Date
│   │       │   ├── [METRIC:MT-C-A-FIN-STUDENT-METRICS-BALANCE-TO-PAY] Balance to Pay
│   │       │   └── [METRIC:MT-C-A-FIN-STUDENT-METRICS-INVOICES] Invoices
│   │       ├── [BUTTON:B-S-A-FIN-SELECTED-FIND-RECEIPTS] Find receipts → [PAGE:P-A-RECEIPTS]
│   │       ├── [BUTTON:B-S-A-FIN-SELECTED-STUDENT-PROFILE] Student profile → [PAGE:P-A-STUDENT-PROFILE]
│   │       ├── [TABLE:T-A-FIN-STRUCTURES]
│   │       │   ├── [COLUMN:COL-A-FIN-STRUCTURES-FEE-STRUCTURE] Fee Structure
│   │       │   ├── [COLUMN:COL-A-FIN-STRUCTURES-PROGRAMME-SEMESTER] Programme/Semester
│   │       │   ├── [COLUMN:COL-A-FIN-STRUCTURES-ASSESSED] Assessed
│   │       │   ├── [COLUMN:COL-A-FIN-STRUCTURES-PAID] Paid
│   │       │   ├── [COLUMN:COL-A-FIN-STRUCTURES-BALANCE-TO-PAY] Balance to Pay
│   │       │   ├── [COLUMN:COL-A-FIN-STRUCTURES-COVERAGE] Coverage
│   │       │   └── [COLUMN:COL-A-FIN-STRUCTURES-STATUS] Status
│   │       └── [TABLE:T-A-FIN-SEMESTERS]
│   │           ├── [COLUMN:COL-A-FIN-SEMESTERS-ACADEMIC-SEMESTER] Academic Semester
│   │           ├── [COLUMN:COL-A-FIN-SEMESTERS-OPENING-BALANCE] Opening Balance
│   │           ├── [COLUMN:COL-A-FIN-SEMESTERS-SEMESTER-CHARGES] Semester Charges
│   │           ├── [COLUMN:COL-A-FIN-SEMESTERS-PAYMENTS] Payments
│   │           ├── [COLUMN:COL-A-FIN-SEMESTERS-BALANCE-TO-PAY] Balance to Pay
│   │           ├── [COLUMN:COL-A-FIN-SEMESTERS-INVOICES] Invoices
│   │           ├── [COLUMN:COL-A-FIN-SEMESTERS-ACTIONS] Actions
│   │           ├── [ACTION:AC-T-A-FIN-SEMESTERS-INVOICES] Invoices
│   │           └── [ACTION:AC-T-A-FIN-SEMESTERS-RECEIPTS] Receipts
│   ├── [PAGE:P-A-SPONSORSHIPS] Sponsorship Awards
│   │   ├── route → #/finance/sponsorships
│   │   ├── data: Sponsorship Award
│   │   └── [TABLE:T-A-SPONSORSHIPS]
│   │       ├── [COLUMN:COL-A-SPONSORSHIPS-STUDENT] Student
│   │       ├── [COLUMN:COL-A-SPONSORSHIPS-SPONSOR] Sponsor
│   │       ├── [COLUMN:COL-A-SPONSORSHIPS-PROGRAMME] Programme
│   │       ├── [COLUMN:COL-A-SPONSORSHIPS-COVERAGE] Coverage
│   │       ├── [COLUMN:COL-A-SPONSORSHIPS-AMOUNT] Amount
│   │       ├── [COLUMN:COL-A-SPONSORSHIPS-STATUS] Status
│   │       └── [COLUMN:COL-A-SPONSORSHIPS-ACTIONS] Actions
│   ├── [PAGE:P-A-RESULTS] Student Course Results
│   │   ├── route → #/results
│   │   ├── data: Student Course Result
│   │   └── [TABLE:T-A-RESULTS]
│   │       ├── [COLUMN:COL-A-RESULTS-STUDENT] Student
│   │       ├── [COLUMN:COL-A-RESULTS-COURSE] Course
│   │       ├── [COLUMN:COL-A-RESULTS-SEMESTER] Semester
│   │       ├── [COLUMN:COL-A-RESULTS-MARK] Mark
│   │       ├── [COLUMN:COL-A-RESULTS-GRADE] Grade
│   │       ├── [COLUMN:COL-A-RESULTS-RESULT] Result
│   │       ├── [COLUMN:COL-A-RESULTS-APPROVED] Approved
│   │       ├── [COLUMN:COL-A-RESULTS-PUBLISHED] Published
│   │       └── [COLUMN:COL-A-RESULTS-ACTIONS] Actions
│   ├── [PAGE:P-A-ASSESSMENTS] Course Assessments
│   │   ├── route → #/results/assessments
│   │   ├── data: Course Assessment
│   │   └── [TABLE:T-A-ASSESSMENTS]
│   │       ├── [COLUMN:COL-A-ASSESSMENTS-ASSESSMENT] Assessment
│   │       ├── [COLUMN:COL-A-ASSESSMENTS-OFFERING] Offering
│   │       ├── [COLUMN:COL-A-ASSESSMENTS-TYPE] Type
│   │       ├── [COLUMN:COL-A-ASSESSMENTS-MAXIMUM] Maximum
│   │       ├── [COLUMN:COL-A-ASSESSMENTS-WEIGHT] Weight
│   │       ├── [COLUMN:COL-A-ASSESSMENTS-DATE] Date
│   │       ├── [COLUMN:COL-A-ASSESSMENTS-STATUS] Status
│   │       └── [COLUMN:COL-A-ASSESSMENTS-ACTIONS] Actions
│   ├── [PAGE:P-A-APPROVALS] Approval Batches
│   │   ├── route → #/results/approvals
│   │   ├── data: Result Approval Batch
│   │   └── [TABLE:T-A-APPROVALS]
│   │       ├── [COLUMN:COL-A-APPROVALS-OFFERING] Offering
│   │       ├── [COLUMN:COL-A-APPROVALS-SEMESTER] Semester
│   │       ├── [COLUMN:COL-A-APPROVALS-STAGE] Stage
│   │       ├── [COLUMN:COL-A-APPROVALS-STATUS] Status
│   │       ├── [COLUMN:COL-A-APPROVALS-SUBMITTED-BY] Submitted By
│   │       ├── [COLUMN:COL-A-APPROVALS-APPROVED-BY] Approved By
│   │       └── [COLUMN:COL-A-APPROVALS-ACTIONS] Actions
│   ├── [PAGE:P-A-REVIEWS] Result Review Requests
│   │   ├── route → #/results/reviews
│   │   ├── data: Result Review Request
│   │   └── [TABLE:T-A-REVIEWS]
│   │       ├── [COLUMN:COL-A-REVIEWS-STUDENT] Student
│   │       ├── [COLUMN:COL-A-REVIEWS-RESULT] Result
│   │       ├── [COLUMN:COL-A-REVIEWS-REQUEST] Request
│   │       ├── [COLUMN:COL-A-REVIEWS-STATUS] Status
│   │       ├── [COLUMN:COL-A-REVIEWS-DECISION] Decision
│   │       ├── [COLUMN:COL-A-REVIEWS-REVIEWED-BY] Reviewed By
│   │       └── [COLUMN:COL-A-REVIEWS-ACTIONS] Actions
│   ├── [PAGE:P-A-GRADING] Grading Schemes
│   │   ├── route → #/results/grading
│   │   ├── data: Grading Scheme
│   │   └── [TABLE:T-A-GRADING]
│   │       ├── [COLUMN:COL-A-GRADING-SCHEME] Scheme
│   │       ├── [COLUMN:COL-A-GRADING-DESCRIPTION] Description
│   │       ├── [COLUMN:COL-A-GRADING-STATUS] Status
│   │       └── [COLUMN:COL-A-GRADING-ACTIONS] Actions
│   ├── [PAGE:P-A-TRANSCRIPT] Transcript Viewer
│   │   ├── routes
│   │   │   ├── #/transcripts
│   │   │   └── #/transcripts/view/:transcriptName
│   │   ├── source: frontend/src/roles/admin/pages/transcripts/TranscriptViewer.tsx
│   │   ├── [FIELD:FLD-A-TRANSCRIPT-STUDENT]
│   │   │   ├── type: select
│   │   │   ├── label: Student with recorded marks
│   │   │   └── change: updates `?student=` route query
│   │   ├── [CONTAINER:C-A-TRANSCRIPT-ACTIONS]
│   │   │   ├── [BUTTON:B-C-A-TRANSCRIPT-ACTIONS-CHOOSE-ANOTHER-STUDENT] Choose another student
│   │   │   ├── [BUTTON:B-C-A-TRANSCRIPT-ACTIONS-REFRESH-MARKS] Refresh marks
│   │   │   ├── [BUTTON:B-C-A-TRANSCRIPT-ACTIONS-PRINT-PREVIEW-PRINT-TRANSCRIPT] Print preview / Print transcript
│   │   │   └── [LINK:LK-C-A-TRANSCRIPT-ACTIONS-ISSUED-PDF] Issued PDF ⇱ FILE:generated_pdf
│   │   ├── [CONTAINER:C-A-TRANSCRIPT-DOCUMENT]
│   │   │   ├── university identity
│   │   │   ├── student identity
│   │   │   ├── programme/award metadata
│   │   │   ├── verification/status metadata
│   │   │   └── semester blocks
│   │   │       └── [TABLE:T-A-TRANSCRIPT-SEMESTER]
│   │   │           ├── [COLUMN:COL-A-TRANSCRIPT-SEMESTER-CODE] Code
│   │   │           ├── [COLUMN:COL-A-TRANSCRIPT-SEMESTER-MODULE-NAME] Module Name
│   │   │           ├── [COLUMN:COL-A-TRANSCRIPT-SEMESTER-MARK] Mark (%)
│   │   │           ├── [COLUMN:COL-A-TRANSCRIPT-SEMESTER-CREDIT] Credit
│   │   │           ├── [COLUMN:COL-A-TRANSCRIPT-SEMESTER-GRADE] Grade
│   │   │           ├── [METRIC:MT-T-A-TRANSCRIPT-SEMESTER-SEMESTER-GPA] Semester GPA
│   │   │           └── [METRIC:MT-T-A-TRANSCRIPT-SEMESTER-CUMULATIVE-GPA] Cumulative GPA
│   │   ├── states: choose student | loading | loaded | no marks | error
│   │   └── [TEST:Q-A-TRANSCRIPT]
│   │       ├── student selection loads correct data
│   │       ├── semester grouping is stable
│   │       ├── GPA formatting is consistent
│   │       ├── print is disabled without data
│   │       └── issued PDF appears only when available
│   ├── [PAGE:P-A-TRANSCRIPT-REGISTER] Transcript Issuance Register
│   │   ├── route → #/transcripts/register
│   │   ├── data: Academic Transcript
│   │   └── [TABLE:T-A-TRANSCRIPT-REGISTER]
│   │       ├── [COLUMN:COL-A-TRANSCRIPT-REGISTER-STUDENT] Student
│   │       ├── [COLUMN:COL-A-TRANSCRIPT-REGISTER-PROGRAMME] Programme
│   │       ├── [COLUMN:COL-A-TRANSCRIPT-REGISTER-TYPE] Type
│   │       ├── [COLUMN:COL-A-TRANSCRIPT-REGISTER-STATUS] Status
│   │       ├── [COLUMN:COL-A-TRANSCRIPT-REGISTER-VERIFICATION] Verification
│   │       ├── [COLUMN:COL-A-TRANSCRIPT-REGISTER-ISSUED] Issued
│   │       └── [COLUMN:COL-A-TRANSCRIPT-REGISTER-ACTIONS] Actions
│   ├── [PAGE:P-A-CLEARANCE] Student Clearance Cases
│   │   ├── route → #/clearance
│   │   ├── data: Student Clearance
│   │   └── [TABLE:T-A-CLEARANCE]
│   │       ├── [COLUMN:COL-A-CLEARANCE-STUDENT] Student
│   │       ├── [COLUMN:COL-A-CLEARANCE-TYPE] Type
│   │       ├── [COLUMN:COL-A-CLEARANCE-SEMESTER] Semester
│   │       ├── [COLUMN:COL-A-CLEARANCE-FINANCE] Finance
│   │       ├── [COLUMN:COL-A-CLEARANCE-ACADEMIC] Academic
│   │       ├── [COLUMN:COL-A-CLEARANCE-STATUS] Status
│   │       ├── [COLUMN:COL-A-CLEARANCE-CLEARED] Cleared
│   │       └── [COLUMN:COL-A-CLEARANCE-ACTIONS] Actions
│   ├── [PAGE:P-A-READINESS] Graduation Readiness
│   │   ├── route → #/clearance/readiness
│   │   ├── filter: clearance_type = Graduation
│   │   └── [TABLE:T-A-READINESS]
│   │       ├── [COLUMN:COL-A-READINESS-STUDENT] Student
│   │       ├── [COLUMN:COL-A-READINESS-TYPE] Type
│   │       ├── [COLUMN:COL-A-READINESS-FINANCE] Finance
│   │       ├── [COLUMN:COL-A-READINESS-ACADEMIC] Academic
│   │       ├── [COLUMN:COL-A-READINESS-STATUS] Status
│   │       ├── [COLUMN:COL-A-READINESS-CLEARED] Cleared
│   │       └── [COLUMN:COL-A-READINESS-ACTIONS] Actions
│   ├── [PAGE:P-A-SETTINGS] University Profile
│   │   ├── route → #/settings
│   │   ├── data: University Education Settings
│   │   └── [TABLE:T-A-SETTINGS]
│   │       ├── [COLUMN:COL-A-SETTINGS-UNIVERSITY] University
│   │       ├── [COLUMN:COL-A-SETTINGS-COUNTRY] Country
│   │       ├── [COLUMN:COL-A-SETTINGS-CURRENCY] Currency
│   │       ├── [COLUMN:COL-A-SETTINGS-GRADING-SCHEME] Grading Scheme
│   │       └── [COLUMN:COL-A-SETTINGS-ACTIONS] Actions
│   ├── [PAGE:P-A-YEARS] Academic Years
│   │   ├── route → #/settings/years
│   │   ├── data: Academic Year
│   │   └── [TABLE:T-A-YEARS]
│   │       ├── [COLUMN:COL-A-YEARS-ACADEMIC-YEAR] Academic Year
│   │       ├── [COLUMN:COL-A-YEARS-STARTS] Starts
│   │       ├── [COLUMN:COL-A-YEARS-ENDS] Ends
│   │       ├── [COLUMN:COL-A-YEARS-STATUS] Status
│   │       └── [COLUMN:COL-A-YEARS-ACTIONS] Actions
│   ├── [PAGE:P-A-SEMESTERS] Academic Semesters
│   │   ├── route → #/settings/semesters
│   │   ├── data: Academic Semester
│   │   └── [TABLE:T-A-SEMESTERS]
│   │       ├── [COLUMN:COL-A-SEMESTERS-SEMESTER] Semester
│   │       ├── [COLUMN:COL-A-SEMESTERS-YEAR] Year
│   │       ├── [COLUMN:COL-A-SEMESTERS-NUMBER] Number
│   │       ├── [COLUMN:COL-A-SEMESTERS-STARTS] Starts
│   │       ├── [COLUMN:COL-A-SEMESTERS-ENDS] Ends
│   │       ├── [COLUMN:COL-A-SEMESTERS-REGISTRATION] Registration
│   │       ├── [COLUMN:COL-A-SEMESTERS-STATUS] Status
│   │       └── [COLUMN:COL-A-SEMESTERS-ACTIONS] Actions
│   └── [PAGE:P-A-SETTINGS-GRADING] Settings Grading Schemes
│       ├── route → #/settings/grading
│       ├── data: Grading Scheme
│       └── [TABLE:T-A-SETTINGS-GRADING]
│           ├── [COLUMN:COL-A-SETTINGS-GRADING-SCHEME-NAME] Scheme
│           ├── [COLUMN:COL-A-SETTINGS-GRADING-DESCRIPTION] Description
│           ├── [COLUMN:COL-A-SETTINGS-GRADING-STATUS] Status
│           └── [COLUMN:COL-A-SETTINGS-GRADING-ACTIONS] Actions
├── [PORTAL:STUDENT] Student Portal
│   ├── role-match: Student
│   ├── route-owner: frontend/src/roles/student/StudentApp.tsx
│   ├── shell: frontend/src/roles/student/layout/StudentShell.tsx
│   ├── data-provider: frontend/src/roles/student/studentPortal.tsx
│   ├── [PERMISSION:PM-STUDENT]
│   │   ├── data scope: authenticated student's own record
│   │   ├── navigation: student routes only
│   │   ├── mutations: none except receipt selection/preview in current frontend
│   │   ├── transcript: only approved/issued records returned by backend
│   │   └── ERPNext credentials: never exposed to browser
│   ├── [NAV:N-STUDENT]
│   │   ├── Overview → [PAGE:P-S-DASHBOARD]
│   │   ├── My Profile → [PAGE:P-S-PROFILE]
│   │   ├── Registration → [PAGE:P-S-REGISTRATION]
│   │   ├── My Courses → [PAGE:P-S-COURSES]
│   │   ├── Timetable → [PAGE:P-S-TIMETABLE]
│   │   ├── Attendance → [PAGE:P-S-ATTENDANCE]
│   │   ├── Fees & Receipts → [PAGE:P-S-FINANCE]
│   │   ├── Results → [PAGE:P-S-RESULTS]
│   │   ├── Transcript → [PAGE:P-S-TRANSCRIPT]
│   │   └── Clearance → [PAGE:P-S-CLEARANCE]
│   ├── [RESPONSIVE:R-STUDENT-NAV]
│   │   ├── desktop: all destinations in left sidebar
│   │   ├── mobile-priority: Overview | Profile | Registration | Courses
│   │   └── mobile-More: Timetable | Attendance | Fees | Results | Transcript | Clearance | Sign out
│   ├── [PAGE:P-S-DASHBOARD] Student Overview
│   │   ├── route → #/student
│   │   ├── source: frontend/src/roles/student/pages/dashboard/StudentDashboardPage.tsx
│   │   ├── [LAYOUT:L-S-DASHBOARD]
│   │   │   ├── welcome hero
│   │   │   ├── four-card metric grid
│   │   │   └── two-card academic/services grid
│   │   ├── [CONTAINER:C-S-WELCOME]
│   │   │   ├── personalized H1 using first_name/student_name
│   │   │   ├── [BUTTON:B-S-MY-COURSES] My courses → [PAGE:P-S-COURSES]
│   │   │   ├── [BUTTON:B-S-FEES] Fees and receipts → [PAGE:P-S-FINANCE]
│   │   │   ├── student number
│   │   │   ├── current programme
│   │   │   └── [STATUS:ST-C-S-WELCOME-STUDENT-STATUS] Student status
│   │   ├── [CONTAINER:C-S-METRICS]
│   │   │   ├── [METRIC:MT-S-COURSES]
│   │   │   │   ├── label: Registered courses
│   │   │   │   └── calculation: course_registrations.length
│   │   │   ├── [METRIC:MT-S-SEMESTERS]
│   │   │   │   ├── label: Semester registrations
│   │   │   │   └── calculation: semester_registrations.length
│   │   │   ├── [METRIC:MT-S-BALANCE]
│   │   │   │   ├── label: Balance to pay
│   │   │   │   ├── calculation: SUM(invoice.outstanding_amount)
│   │   │   │   ├── format: UGX
│   │   │   │   └── detail: total paid to date
│   │   │   └── [METRIC:MT-S-RESULTS]
│   │   │       ├── label: Published results
│   │   │       └── calculation: results.length
│   │   ├── [CONTAINER:C-S-ACADEMIC-RECORD]
│   │   │   ├── Programme
│   │   │   ├── Academic year
│   │   │   ├── Cohort
│   │   │   ├── Status
│   │   │   └── [BUTTON:B-C-S-ACADEMIC-RECORD-VIEW-REGISTRATION-DETAILS] View registration details → [PAGE:P-S-REGISTRATION]
│   │   ├── [CONTAINER:C-S-DOCUMENT-READINESS]
│   │   │   ├── [BUTTON:B-C-S-DOCUMENT-READINESS-RESULTS] Results → [PAGE:P-S-RESULTS]
│   │   │   ├── [BUTTON:B-C-S-DOCUMENT-READINESS-TRANSCRIPT] Transcript → [PAGE:P-S-TRANSCRIPT]
│   │   │   └── [BUTTON:B-C-S-DOCUMENT-READINESS-CLEARANCE] Clearance → [PAGE:P-S-CLEARANCE]
│   │   ├── [DATA:DT-S-DASHBOARD]
│   │   │   ├── Student
│   │   │   ├── Student Programme Enrolment
│   │   │   ├── Semester Registration
│   │   │   ├── Course Registration
│   │   │   ├── Sales Invoice
│   │   │   ├── Student Course Result
│   │   │   ├── Academic Transcript
│   │   │   └── Student Clearance
│   │   └── [TEST:Q-S-DASHBOARD]
│   │       ├── greeting uses student identity
│   │       ├── active enrolment takes precedence
│   │       ├── monetary totals reconcile
│   │       └── all service buttons reach student routes
│   ├── [PAGE:P-S-PROFILE] Personal Profile
│   │   ├── route → #/student/profile
│   │   ├── source: frontend/src/roles/student/pages/profile/StudentProfilePage.tsx
│   │   ├── [CONTAINER:C-S-PROFILE-BANNER]
│   │   │   ├── avatar initials
│   │   │   ├── registered-student label
│   │   │   ├── student name
│   │   │   ├── student number
│   │   │   └── student status
│   │   ├── [CONTAINER:C-S-PROFILE-METRICS]
│   │   │   ├── [METRIC:MT-C-S-PROFILE-METRICS-STUDENT-NUMBER] Student Number
│   │   │   ├── [METRIC:MT-C-S-PROFILE-METRICS-PROGRAMME] Programme
│   │   │   ├── [METRIC:MT-C-S-PROFILE-METRICS-ADMISSION-YEAR] Admission Year
│   │   │   └── [METRIC:MT-C-S-PROFILE-METRICS-UNIVERSITY-EMAIL] University Email
│   │   ├── [CONTAINER:C-S-IDENTITY]
│   │   │   ├── Full Name
│   │   │   ├── Gender
│   │   │   ├── Date of Birth
│   │   │   ├── Nationality
│   │   │   ├── Email
│   │   │   └── Record Status
│   │   ├── [CONTAINER:C-S-ENROLMENT]
│   │   │   ├── Academic Programme
│   │   │   ├── Curriculum
│   │   │   ├── Student Cohort
│   │   │   └── Expected Completion
│   │   ├── [RESPONSIVE:R-S-PROFILE]
│   │   │   ├── desktop: identity and enrolment side by side
│   │   │   └── mobile: stacked cards
│   │   └── [TEST:Q-S-PROFILE]
│   │       ├── active enrolment displayed first
│   │       ├── missing values render em dash
│   │       └── dates use student date formatter
│   ├── [PAGE:P-S-REGISTRATION] Semester Registration
│   │   ├── route → #/student/registration
│   │   ├── source: StudentAcademicsPage view=registration
│   │   ├── [CONTAINER:C-S-REG-METRICS]
│   │   │   ├── [METRIC:MT-C-S-REG-METRICS-PROGRAMME-ENROLMENTS] Programme Enrolments
│   │   │   ├── [METRIC:MT-C-S-REG-METRICS-REGISTERED-SEMESTERS] Registered Semesters
│   │   │   ├── [METRIC:MT-C-S-REG-METRICS-COURSE-REGISTRATIONS] Course Registrations
│   │   │   └── [METRIC:MT-C-S-REG-METRICS-ACTIVE-STATUS] Active Status
│   │   ├── [CONTAINER:C-S-REG-ACCORDIONS]
│   │   │   └── [INSTANCE:I-C-S-REG-ACCORDIONS-SEMESTER-REGISTRATION-ACCORDION] Semester registration accordion
│   │   │       ├── semester title
│   │   │       ├── course count
│   │   │       ├── [STATUS:ST-I-C-S-REG-ACCORDIONS-SEMESTER-REGISTRATION-ACCORDION-REGISTERED-PENDING-STATUS] Registered / pending status
│   │   │       ├── Registration Date
│   │   │       ├── Registration Number
│   │   │       └── [TABLE:T-S-REG-COURSES]
│   │   │           ├── [COLUMN:COL-S-REG-COURSES-COURSE] Course
│   │   │           ├── [COLUMN:COL-S-REG-COURSES-SEMESTER] Semester
│   │   │           ├── [COLUMN:COL-S-REG-COURSES-CREDIT-UNITS] Credit Units
│   │   │           ├── [COLUMN:COL-S-REG-COURSES-REGISTRATION] Registration
│   │   │           ├── [COLUMN:COL-S-REG-COURSES-ATTEMPT] Attempt
│   │   │           └── [COLUMN:COL-S-REG-COURSES-STATUS] Status
│   │   ├── [STATE:S-P-S-REGISTRATION-NO-COURSE-REGISTRATIONS-LINKED-TO-SEMESTER] No course registrations linked to semester
│   │   └── [TEST:Q-S-REGISTRATION]
│   │       ├── courses group by semester_registration
│   │       ├── first semester starts expanded
│   │       └── status tone matches registration state
│   ├── [PAGE:P-S-COURSES] Registered Courses
│   │   ├── route → #/student/courses
│   │   ├── source: StudentAcademicsPage view=courses
│   │   └── [TABLE:T-S-COURSES]
│   │       ├── [COLUMN:COL-S-COURSES-COURSE] Course
│   │       │   ├── primary: course name
│   │       │   └── secondary: course code/offering
│   │       ├── [COLUMN:COL-S-COURSES-SEMESTER] Semester
│   │       ├── [COLUMN:COL-S-COURSES-CREDIT-UNITS] Credit Units
│   │       ├── [COLUMN:COL-S-COURSES-REGISTRATION] Registration
│   │       ├── [COLUMN:COL-S-COURSES-ATTEMPT] Attempt
│   │       ├── [COLUMN:COL-S-COURSES-STATUS] Status
│   │       └── [STATE:S-T-S-COURSES-NO-REGISTERED-COURSES] No registered courses
│   ├── [PAGE:P-S-TIMETABLE] Teaching Timetable
│   │   ├── route → #/student/timetable
│   │   ├── source: StudentAcademicsPage view=timetable
│   │   ├── [CONTAINER:C-S-SCHEDULE-GRID]
│   │   │   └── [INSTANCE:I-C-S-SCHEDULE-GRID-SCHEDULE-CARD] Schedule card
│   │   │       ├── weekday
│   │   │       ├── [STATUS:ST-I-C-S-SCHEDULE-GRID-SCHEDULE-CARD-SESSION-TYPE] session type
│   │   │       ├── course name/code
│   │   │       ├── start/end time
│   │   │       ├── venue
│   │   │       └── semester
│   │   ├── [STATE:S-S-NO-TIMETABLE]
│   │   │   ├── heading: No published timetable yet
│   │   │   └── explanation: appears after university publication
│   │   └── [TEST:Q-S-TIMETABLE]
│   │       ├── only student-scoped timetable returned
│   │       ├── missing venue gets fallback
│   │       └── empty state appears with zero sessions
│   ├── [PAGE:P-S-ATTENDANCE] Attendance Record
│   │   ├── route → #/student/attendance
│   │   ├── source: StudentAcademicsPage view=attendance
│   │   └── [TABLE:T-S-ATTENDANCE]
│   │       ├── [COLUMN:COL-S-ATTENDANCE-DATE] Date
│   │       ├── [COLUMN:COL-S-ATTENDANCE-COURSE-REGISTRATION] Course Registration
│   │       ├── [COLUMN:COL-S-ATTENDANCE-TIMETABLE-SESSION] Timetable Session
│   │       ├── [COLUMN:COL-S-ATTENDANCE-STATUS] Status
│   │       │   └── tones: Present=green | Late=gold | other=danger
│   │       ├── [COLUMN:COL-S-ATTENDANCE-REMARKS] Remarks
│   │       └── [STATE:S-T-S-ATTENDANCE-NO-ATTENDANCE-ENTRIES-PUBLISHED] No attendance entries published
│   ├── [PAGE:P-S-FINANCE] Fees, Payments & Receipts
│   │   ├── route → #/student/finance
│   │   ├── source: frontend/src/roles/student/pages/finance/StudentFinancePage.tsx
│   │   ├── [CONTAINER:C-S-FINANCE-INTRO]
│   │   │   └── [BUTTON:B-S-PREVIEW-SELECTED]
│   │   │       ├── visibility: one or more payments selected
│   │   │       ├── label: Preview selected receipt · selected total
│   │   │       ├── busy label: Preparing…
│   │   │       └── action → [DIALOG:D-S-RECEIPT]
│   │   ├── [CONTAINER:C-S-FINANCE-METRICS]
│   │   │   ├── [METRIC:MT-S-ASSESSED]
│   │   │   │   ├── label: Total Assessed
│   │   │   │   └── calculation: SUM(invoice.grand_total)
│   │   │   ├── [METRIC:MT-S-PAID]
│   │   │   │   ├── label: Paid Against Fees
│   │   │   │   └── calculation: assessed - outstanding
│   │   │   ├── [METRIC:MT-S-OWING]
│   │   │   │   ├── label: Balance to Pay
│   │   │   │   └── calculation: SUM(outstanding_amount)
│   │   │   └── [METRIC:MT-S-PAYMENTS]
│   │   │       ├── label: Payments Recorded
│   │   │       └── calculation: SUM(received_amount or paid_amount)
│   │   ├── [CONTAINER:C-S-SEMESTER-FINANCE]
│   │   │   └── [INSTANCE:I-C-S-SEMESTER-FINANCE-SEMESTER-FINANCE-ACCORDION] Semester finance accordion
│   │   │       ├── semester
│   │   │       ├── assessed amount
│   │   │       ├── balance to pay
│   │   │       ├── [STATUS:ST-I-C-S-SEMESTER-FINANCE-SEMESTER-FINANCE-ACCORDION-PAID-PARTLY-PAID-OUTSTANDING] Paid | Partly Paid | Outstanding
│   │   │       ├── [METRIC:MT-C-S-SEMESTER-FINANCE-OPENING-BALANCE] Opening Balance
│   │   │       ├── [METRIC:MT-C-S-SEMESTER-FINANCE-SEMESTER-CHARGES] Semester Charges
│   │   │       ├── [METRIC:MT-C-S-SEMESTER-FINANCE-PAYMENTS] Payments
│   │   │       ├── [METRIC:MT-C-S-SEMESTER-FINANCE-BALANCE-TO-PAY] Balance to Pay
│   │   │       ├── [TABLE:T-S-INVOICES]
│   │   │       │   ├── [COLUMN:COL-S-INVOICES-INVOICE] Invoice
│   │   │       │   ├── [COLUMN:COL-S-INVOICES-DATE] Date
│   │   │       │   ├── [COLUMN:COL-S-INVOICES-FEE-STRUCTURE] Fee Structure
│   │   │       │   ├── [COLUMN:COL-S-INVOICES-ASSESSED] Assessed
│   │   │       │   ├── [COLUMN:COL-S-INVOICES-PAID] Paid
│   │   │       │   └── [COLUMN:COL-S-INVOICES-BALANCE] Balance
│   │   │       ├── [BUTTON:B-C-S-SEMESTER-FINANCE-SELECT-SEMESTER-CLEAR-SEMESTER] Select semester / Clear semester
│   │   │       └── [TABLE:T-S-PAYMENTS]
│   │   │           ├── [COLUMN:COL-S-PAYMENTS-SELECTION] Selection
│   │   │           ├── [COLUMN:COL-S-PAYMENTS-PAYMENT] Payment
│   │   │           ├── [COLUMN:COL-S-PAYMENTS-DATE] Date
│   │   │           ├── [COLUMN:COL-S-PAYMENTS-METHOD] Method
│   │   │           ├── [COLUMN:COL-S-PAYMENTS-REFERENCE] Reference
│   │   │           ├── [COLUMN:COL-S-PAYMENTS-AMOUNT] Amount
│   │   │           └── [COLUMN:COL-S-PAYMENTS-RECEIPT] Receipt ← Preview button
│   │   ├── [DIALOG:D-S-RECEIPT]
│   │   │   ├── implementation: full-page conditional receipt view
│   │   │   ├── uses: [COMPONENT:CP-RECEIPT-DOCUMENT]
│   │   │   ├── close: returns to finance page
│   │   │   └── print: browser print
│   │   ├── [DATA:DT-S-FINANCE]
│   │   │   ├── Sales Invoice
│   │   │   ├── Payment Entry
│   │   │   ├── payment allocations grouped by semester
│   │   │   └── method: get_payment_receipt_data
│   │   └── [TEST:Q-S-FINANCE]
│   │       ├── invoices and payments group into correct semester
│   │       ├── select-semester toggles all visible payments
│   │       ├── selected total is accurate
│   │       ├── receipt preview uses selected payment IDs
│   │       └── zero-balance status displays Paid
│   ├── [PAGE:P-S-RESULTS] Published Results
│   │   ├── route → #/student/results
│   │   ├── source: frontend/src/roles/student/pages/results/StudentResultsPage.tsx
│   │   ├── [CONTAINER:C-S-RESULT-METRICS]
│   │   │   ├── [METRIC:MT-C-S-RESULT-METRICS-CUMULATIVE-GPA] Cumulative GPA
│   │   │   ├── [METRIC:MT-C-S-RESULT-METRICS-PUBLISHED-COURSES] Published Courses
│   │   │   ├── [METRIC:MT-C-S-RESULT-METRICS-COMPLETED-COURSES] Completed Courses
│   │   │   └── [METRIC:MT-C-S-RESULT-METRICS-SEMESTERS-REPORTED] Semesters Reported
│   │   ├── [CONTAINER:C-P-S-RESULTS-RESULTS-GROUPED-BY-SEMESTER] Results grouped by semester
│   │   └── [TABLE:T-S-RESULTS]
│   │       ├── [COLUMN:COL-S-RESULTS-COURSE] Course
│   │       ├── [COLUMN:COL-S-RESULTS-CREDIT-UNITS] Credit Units
│   │       ├── [COLUMN:COL-S-RESULTS-COURSEWORK] Coursework
│   │       ├── [COLUMN:COL-S-RESULTS-EXAMINATION] Examination
│   │       ├── [COLUMN:COL-S-RESULTS-FINAL-MARK] Final Mark
│   │       ├── [COLUMN:COL-S-RESULTS-GRADE] Grade
│   │       ├── [COLUMN:COL-S-RESULTS-GRADE-POINT] Grade Point
│   │       └── [COLUMN:COL-S-RESULTS-STATUS] Status
│   ├── [PAGE:P-S-TRANSCRIPT] Academic Transcript
│   │   ├── route → #/student/transcript
│   │   ├── source: frontend/src/roles/student/pages/transcript/StudentTranscriptPage.tsx
│   │   ├── [CONTAINER:C-S-TRANSCRIPT-BANNER]
│   │   │   ├── AWU logo
│   │   │   ├── student name
│   │   │   ├── student number
│   │   │   └── programme
│   │   ├── [CONTAINER:C-S-DOCUMENT-GRID]
│   │   │   └── [INSTANCE:I-C-S-DOCUMENT-GRID-TRANSCRIPT-DOCUMENT-CARD] Transcript document card
│   │   │       ├── [STATUS:ST-I-C-S-DOCUMENT-GRID-TRANSCRIPT-DOCUMENT-CARD-TRANSCRIPT-STATUS] transcript status
│   │   │       ├── transcript type
│   │   │       ├── programme
│   │   │       ├── document number
│   │   │       ├── verification number
│   │   │       ├── issued date
│   │   │       ├── [LINK:LK-C-S-DOCUMENT-GRID-OPEN-TRANSCRIPT-PDF] Open transcript PDF ⇱ FILE:generated_pdf
│   │   │       └── [STATE:S-C-S-DOCUMENT-GRID-PDF-PREPARATION-PENDING] PDF preparation pending
│   │   ├── [STATE:S-S-NO-TRANSCRIPT]
│   │   │   ├── heading: No approved transcript is available yet
│   │   │   └── explanation: waits for approval/issuance controls
│   │   └── [TEST:Q-S-TRANSCRIPT]
│   │       ├── unapproved documents are absent
│   │       ├── generated PDF link opens new tab
│   │       └── pending PDF state is explicit
│   └── [PAGE:P-S-CLEARANCE] Student Clearance
│       ├── route → #/student/clearance
│       ├── source: frontend/src/roles/student/pages/clearance/StudentClearancePage.tsx
│       ├── [CONTAINER:C-S-CLEARANCE-METRICS]
│       │   ├── [METRIC:MT-C-S-CLEARANCE-METRICS-CLEARANCE-CASES] Clearance Cases
│       │   ├── [METRIC:MT-C-S-CLEARANCE-METRICS-CLEARED] Cleared
│       │   ├── [METRIC:MT-C-S-CLEARANCE-METRICS-PENDING] Pending
│       │   └── [METRIC:MT-C-S-CLEARANCE-METRICS-GRADUATION-READINESS] Graduation Readiness; Ready / Not Cleared
│       ├── [CONTAINER:C-S-CLEARANCE-GRID]
│       │   └── [INSTANCE:I-C-S-CLEARANCE-GRID-CLEARANCE-CASE-CARD] Clearance case card
│       │       ├── clearance type
│       │       ├── semester
│       │       ├── [STATUS:ST-I-C-S-CLEARANCE-GRID-CLEARANCE-CASE-CARD-OVERALL-STATUS] overall status
│       │       ├── [STATUS:ST-I-C-S-CLEARANCE-GRID-CLEARANCE-CASE-CARD-FINANCIAL-CLEARANCE] financial clearance
│       │       ├── [STATUS:ST-I-C-S-CLEARANCE-GRID-CLEARANCE-CASE-CARD-ACADEMIC-CLEARANCE] academic clearance
│       │       ├── reference
│       │       └── cleared date / awaiting completion
│       ├── [STATE:S-S-NO-CLEARANCE] No clearance case opened
│       └── [TEST:Q-S-CLEARANCE]
│           ├── graduation readiness requires cleared graduation case
│           ├── financial/academic checks do not rely only on colour
│           └── empty state explains when cases appear
├── [PORTAL:LECTURER] Lecturer Portal
│   ├── role-match: Instructor
│   ├── route-owner: frontend/src/roles/lecturer/LecturerApp.tsx
│   ├── shell: frontend/src/roles/lecturer/layout/LecturerShell.tsx
│   ├── data-provider: frontend/src/roles/lecturer/lecturerPortal.tsx
│   ├── [PERMISSION:PM-LECTURER]
│   │   ├── scope: assigned course offerings only
│   │   ├── students: registrations in assigned offerings only
│   │   ├── attendance mutation: assigned offering/session only
│   │   ├── marks mutation: assigned assessment/registration only
│   │   └── publication: lecturer submits; cannot publish to students
│   ├── [NAV:N-LECTURER]
│   │   ├── Overview → [PAGE:P-L-DASHBOARD]
│   │   ├── My Profile → [PAGE:P-L-PROFILE]
│   │   ├── Course Offerings → [PAGE:P-L-OFFERINGS]
│   │   ├── Class Lists → [PAGE:P-L-STUDENTS]
│   │   ├── Timetable → [PAGE:P-L-TIMETABLE]
│   │   ├── Attendance → [PAGE:P-L-ATTENDANCE]
│   │   ├── Assessments → [PAGE:P-L-ASSESSMENTS]
│   │   ├── Enter Marks → [PAGE:P-L-MARKS]
│   │   ├── Course Results → [PAGE:P-L-RESULTS]
│   │   ├── Review Requests → [PAGE:P-L-REVIEWS]
│   │   └── Approval Batches → [PAGE:P-L-SUBMISSIONS]
│   ├── [RESPONSIVE:R-LECTURER-NAV]
│   │   ├── mobile-priority: Overview | Offerings | Attendance | Enter Marks
│   │   └── mobile-More: remaining routes + sign out
│   ├── [PAGE:P-L-DASHBOARD] Lecturer Overview
│   │   ├── route → #/lecturer
│   │   ├── source: frontend/src/roles/lecturer/pages/dashboard/LecturerDashboardPage.tsx
│   │   ├── [CONTAINER:C-L-WELCOME]
│   │   │   ├── lecturer/teaching identity
│   │   │   ├── [BUTTON:B-C-L-WELCOME-TAKE-ATTENDANCE] Take attendance → [PAGE:P-L-ATTENDANCE]
│   │   │   └── [BUTTON:B-C-L-WELCOME-ENTER-MARKS] Enter marks → [PAGE:P-L-MARKS]
│   │   ├── [CONTAINER:C-L-METRICS]
│   │   │   ├── [METRIC:MT-C-L-METRICS-ASSIGNED-OFFERINGS] Assigned Offerings
│   │   │   ├── [METRIC:MT-C-L-METRICS-REGISTERED-STUDENTS] Registered Students
│   │   │   ├── [METRIC:MT-C-L-METRICS-TODAY] Today
│   │   │   └── [METRIC:MT-C-L-METRICS-RESULTS-IN-PROGRESS] Results in Progress
│   │   ├── [CONTAINER:C-L-SERVICES]
│   │   │   ├── [BUTTON CARD] Class Attendance → [PAGE:P-L-ATTENDANCE]
│   │   │   └── [BUTTON CARD] Assessment Marks → [PAGE:P-L-MARKS]
│   │   └── [TEST:Q-L-DASHBOARD]
│   │       ├── counts include assigned data only
│   │       └── operational buttons reach correct forms
│   ├── [PAGE:P-L-PROFILE] Lecturer Profile
│   │   ├── route → #/lecturer/profile
│   │   ├── source: frontend/src/roles/lecturer/pages/profile/LecturerProfilePage.tsx
│   │   ├── [CONTAINER:C-P-L-PROFILE-LECTURER-IDENTITY-STATUS] Lecturer identity/status
│   │   ├── [METRIC:MT-P-L-PROFILE-COURSE-OFFERINGS] Course Offerings
│   │   ├── [METRIC:MT-P-L-PROFILE-PRIMARY-ASSIGNMENTS] Primary Assignments
│   │   ├── [METRIC:MT-P-L-PROFILE-MEMBER-TYPE] Member Type
│   │   ├── [METRIC:MT-P-L-PROFILE-PORTAL-ACCOUNT] Portal Account
│   │   └── [CONTAINER:C-P-L-PROFILE-MEMBER-AND-ASSIGNMENT-DETAILS] Member and assignment details
│   ├── [PAGE:P-L-OFFERINGS] Course Offerings
│   │   ├── route → #/lecturer/offerings
│   │   ├── source: LecturerTeachingPage view=offerings
│   │   ├── [CONTAINER:C-L-OFFERING-METRICS]
│   │   │   ├── [METRIC:MT-C-L-OFFERING-METRICS-ASSIGNED] Assigned
│   │   │   ├── [METRIC:MT-C-L-OFFERING-METRICS-REGISTRATIONS] Registrations
│   │   │   ├── [METRIC:MT-C-L-OFFERING-METRICS-SCHEDULED-SESSIONS] Scheduled Sessions
│   │   │   └── [METRIC:MT-C-L-OFFERING-METRICS-PRIMARY-LECTURER] Primary Lecturer
│   │   ├── [CONTAINER:C-L-OFFERING-GRID]
│   │   │   └── [INSTANCE:I-C-L-OFFERING-GRID-COURSE-OFFERING-CARD] Course-offering card
│   │   │       ├── course code
│   │   │       ├── [STATUS:ST-I-C-L-OFFERING-GRID-COURSE-OFFERING-CARD-OPEN-PLANNED] Open / Planned
│   │   │       ├── course name
│   │   │       ├── semester
│   │   │       ├── class size/capacity
│   │   │       ├── cohort
│   │   │       ├── teaching role
│   │   │       └── credit units
│   │   └── [STATE:S-P-L-OFFERINGS-NO-ASSIGNED-OFFERINGS] No assigned offerings
│   ├── [PAGE:P-L-STUDENTS] Student Class Lists
│   │   ├── route → #/lecturer/students
│   │   ├── source: LecturerTeachingPage view=students
│   │   └── [TABLE:T-L-STUDENTS]
│   │       ├── [COLUMN:COL-L-STUDENTS-STUDENT] Student; name + student number
│   │       ├── [COLUMN:COL-L-STUDENTS-COURSE] Course; code + name
│   │       ├── [COLUMN:COL-L-STUDENTS-SEMESTER] Semester
│   │       ├── [COLUMN:COL-L-STUDENTS-TYPE] Type
│   │       ├── [COLUMN:COL-L-STUDENTS-ATTEMPT] Attempt
│   │       ├── [COLUMN:COL-L-STUDENTS-STATUS] Status
│   │       └── [STATE:S-T-L-STUDENTS-NO-STUDENTS-REGISTERED] No students registered
│   ├── [PAGE:P-L-TIMETABLE] Teaching Timetable
│   │   ├── route → #/lecturer/timetable
│   │   ├── source: LecturerTeachingPage view=timetable
│   │   ├── [CONTAINER:C-L-SCHEDULE]
│   │   │   └── [INSTANCE:I-C-L-SCHEDULE-TEACHING-SESSION-CARD] Teaching-session card
│   │   │       ├── weekday
│   │   │       ├── session type/status
│   │   │       ├── offering code
│   │   │       ├── course name
│   │   │       ├── time
│   │   │       ├── venue
│   │   │       └── semester
│   │   └── [STATE:S-P-L-TIMETABLE-NO-TIMETABLE-ENTRIES] No timetable entries
│   ├── [PAGE:P-L-ATTENDANCE] Take Attendance
│   │   ├── route → #/lecturer/attendance
│   │   ├── source: frontend/src/roles/lecturer/pages/attendance/LecturerAttendancePage.tsx
│   │   ├── [CONTAINER:C-L-ATTENDANCE-INTRO]
│   │   │   └── [BUTTON:B-L-SAVE-ATTENDANCE]
│   │   │       ├── label: Save attendance
│   │   │       ├── busy-label: Saving…
│   │   │       ├── disabled-when: saving | no registrations | no session
│   │   │       └── action: save attendance entries in one batch
│   │   ├── [CONTAINER:C-L-ATTENDANCE-METRICS]
│   │   │   ├── [METRIC:MT-C-L-ATTENDANCE-METRICS-CLASS-SIZE] Class Size
│   │   │   ├── [METRIC:MT-C-L-ATTENDANCE-METRICS-TIMETABLE-SESSIONS] Timetable Sessions
│   │   │   ├── [METRIC:MT-C-L-ATTENDANCE-METRICS-RECORDED-TODAY] Recorded Today
│   │   │   └── [METRIC:MT-C-L-ATTENDANCE-METRICS-ATTENDANCE-RECORDS] Attendance Records
│   │   ├── [FORM:F-L-ATTENDANCE-CONTROLS]
│   │   │   ├── [FIELD:FLD-L-OFFERING]
│   │   │   │   ├── type: select
│   │   │   │   ├── options: assigned course offerings
│   │   │   │   └── change: resets session and drafts
│   │   │   ├── [FIELD:FLD-L-SESSION]
│   │   │   │   ├── type: select
│   │   │   │   ├── options: timetable sessions for selected offering
│   │   │   │   └── change: resets drafts
│   │   │   └── [FIELD:FLD-L-DATE]
│   │   │       ├── type: date
│   │   │       ├── default: current date
│   │   │       └── change: resets drafts
│   │   ├── [TABLE:T-L-ATTENDANCE]
│   │   │   ├── [COLUMN:COL-L-ATTENDANCE-STUDENT] Student; name + number
│   │   │   ├── [COLUMN:COL-L-ATTENDANCE-REGISTRATION] Registration
│   │   │   ├── [COLUMN:COL-L-ATTENDANCE-ATTENDANCE] Attendance
│   │   │   │   └── field-control=select: Present | Absent | Late | Excused
│   │   │   ├── [COLUMN:COL-L-ATTENDANCE-REMARKS] Remarks
│   │   │   │   └── field-control=text: Optional note
│   │   │   ├── [COLUMN:COL-L-ATTENDANCE-RECORDED] Recorded
│   │   │   │   └── [STATUS:ST-COL-L-ATTENDANCE-RECORDED-SAVED-NEW] Saved / New
│   │   │   └── [STATE:S-T-L-ATTENDANCE-SELECT-OFFERING-WITH-STUDENTS-AND-SESSION] Select offering with students and session
│   │   ├── [DATA:DT-L-ATTENDANCE]
│   │   │   ├── Course Offering
│   │   │   ├── Teaching Timetable Entry
│   │   │   ├── Course Registration
│   │   │   ├── Student Attendance
│   │   │   └── method: save_lecturer_attendance
│   │   └── [TEST:Q-L-ATTENDANCE]
│   │       ├── changing controls clears stale drafts
│   │       ├── existing record pre-fills status/remarks
│   │       ├── batch contains one row per registration
│   │       ├── success refreshes source data
│   │       └── disabled state prevents empty save
│   ├── [PAGE:P-L-ASSESSMENTS] Course Assessments
│   │   ├── route → #/lecturer/assessments
│   │   ├── source: LecturerAssessmentPage view=assessments
│   │   ├── [METRIC:MT-P-L-ASSESSMENTS-COMPONENTS] Components
│   │   ├── [METRIC:MT-P-L-ASSESSMENTS-OPEN] Open
│   │   ├── [METRIC:MT-P-L-ASSESSMENTS-PUBLISHED] Published
│   │   ├── [METRIC:MT-P-L-ASSESSMENTS-TOTAL-STUDENTS] Total Students
│   │   └── [TABLE:T-L-ASSESSMENTS]
│   │       ├── [COLUMN:COL-L-ASSESSMENTS-ASSESSMENT] Assessment
│   │       ├── [COLUMN:COL-L-ASSESSMENTS-COURSE-OFFERING] Course Offering
│   │       ├── [COLUMN:COL-L-ASSESSMENTS-TYPE] Type
│   │       ├── [COLUMN:COL-L-ASSESSMENTS-MAXIMUM] Maximum
│   │       ├── [COLUMN:COL-L-ASSESSMENTS-WEIGHT] Weight
│   │       ├── [COLUMN:COL-L-ASSESSMENTS-DATE] Date
│   │       ├── [COLUMN:COL-L-ASSESSMENTS-STATUS] Status
│   │       └── [STATE:S-T-L-ASSESSMENTS-NO-ASSESSMENTS-CONFIGURED] No assessments configured
│   ├── [PAGE:P-L-MARKS] Enter Assessment Marks
│   │   ├── route → #/lecturer/marks
│   │   ├── source: LecturerAssessmentPage view=marks
│   │   ├── [CONTAINER:C-L-MARKS-INTRO]
│   │   │   └── [BUTTON:B-L-SAVE-MARKS]
│   │   │       ├── label: Save marks
│   │   │       ├── busy-label: Saving…
│   │   │       └── disabled-when: busy | no selected assessment
│   │   ├── [FORM:F-L-ASSESSMENT-CONTEXT]
│   │   │   ├── field-control=select: Assessment component
│   │   │   ├── [LABEL/METRIC] Assessment Type
│   │   │   ├── [LABEL/METRIC] Maximum Mark
│   │   │   ├── [LABEL/METRIC] Result Weighting
│   │   │   └── [STATUS:ST-F-L-ASSESSMENT-CONTEXT-ASSESSMENT-STATE] Assessment state
│   │   ├── [TABLE:T-L-MARKS]
│   │   │   ├── [COLUMN:COL-L-MARKS-STUDENT] Student
│   │   │   ├── [COLUMN:COL-L-MARKS-REGISTRATION] Registration
│   │   │   ├── [COLUMN:COL-L-MARKS-MARK-MAXIMUM] Mark / Maximum
│   │   │   │   └── [FIELD:number] min=0; max=assessment.maximum_mark
│   │   │   ├── [COLUMN:COL-L-MARKS-LECTURER-COMMENT] Lecturer Comment
│   │   │   │   └── field-control=text: Optional feedback
│   │   │   ├── [COLUMN:COL-L-MARKS-RESULT-STATUS] Result Status
│   │   │   │   └── [STATUS:ST-COL-L-MARKS-RESULT-STATUS-RECORDED-NOT-STARTED] Recorded / Not Started
│   │   │   └── [STATE:S-T-L-MARKS-SELECT-ASSESSMENT-WITH-REGISTERED-STUDENTS] Select assessment with registered students
│   │   ├── [DATA:DT-L-MARKS]
│   │   │   ├── Course Assessment
│   │   │   ├── Course Registration
│   │   │   ├── Student Course Result.assessment_marks
│   │   │   └── method: save_lecturer_marks
│   │   └── [TEST:Q-L-MARKS]
│   │       ├── saved marks pre-fill fields
│   │       ├── maximum mark constrains numeric input
│   │       ├── blank marks are omitted from mutation
│   │       └── successful save clears drafts and refreshes
│   ├── [PAGE:P-L-RESULTS] Course Results
│   │   ├── route → #/lecturer/results
│   │   ├── source: LecturerAssessmentPage Results component
│   │   ├── [BUTTON:B-L-SUBMIT-RESULTS]
│   │   │   ├── label: Submit for review
│   │   │   ├── busy-label: Submitting…
│   │   │   ├── disabled-when: busy | no result rows
│   │   │   └── action: create approval batch
│   │   ├── field-control=select: Course offering
│   │   ├── [METRIC:MT-P-L-RESULTS-STUDENTS-WITH-RESULTS] Students with Results
│   │   ├── [METRIC:MT-P-L-RESULTS-COMPLETE] Complete
│   │   ├── [METRIC:MT-P-L-RESULTS-APPROVED] Approved
│   │   ├── [METRIC:MT-P-L-RESULTS-PUBLISHED] Published
│   │   ├── [TABLE:T-L-RESULTS]
│   │   │   ├── [COLUMN:COL-L-RESULTS-STUDENT] Student
│   │   │   ├── [COLUMN:COL-L-RESULTS-COURSEWORK] Coursework
│   │   │   ├── [COLUMN:COL-L-RESULTS-EXAMINATION] Examination
│   │   │   ├── [COLUMN:COL-L-RESULTS-FINAL-MARK] Final Mark
│   │   │   ├── [COLUMN:COL-L-RESULTS-GRADE] Grade
│   │   │   ├── [COLUMN:COL-L-RESULTS-STATUS] Status
│   │   │   └── [COLUMN:COL-L-RESULTS-PUBLICATION] Publication
│   │   └── [TEST:Q-P-L-RESULTS-CONTRACT]
│   │       ├── selected offering filters result rows
│   │       ├── submission blocked without results
│   │       └── successful submission exposes batch ID
│   ├── [PAGE:P-L-REVIEWS] Result Review Requests
│   │   ├── route → #/lecturer/reviews
│   │   ├── source: LecturerAssessmentPage view=reviews
│   │   └── [TABLE:T-L-REVIEWS]
│   │       ├── [COLUMN:COL-L-REVIEWS-REQUEST] Request
│   │       ├── [COLUMN:COL-L-REVIEWS-STUDENT] Student
│   │       ├── [COLUMN:COL-L-REVIEWS-RESULT] Result
│   │       ├── [COLUMN:COL-L-REVIEWS-TYPE] Type
│   │       ├── [COLUMN:COL-L-REVIEWS-REASON] Reason
│   │       ├── [COLUMN:COL-L-REVIEWS-STATUS] Status
│   │       └── [STATE:S-T-L-REVIEWS-NO-RELATED-REVIEW-REQUESTS] No related review requests
│   └── [PAGE:P-L-SUBMISSIONS] Approval Batches
│       ├── route → #/lecturer/submissions
│       ├── source: LecturerAssessmentPage view=submissions
│       └── [TABLE:T-L-SUBMISSIONS]
│           ├── [COLUMN:COL-L-SUBMISSIONS-BATCH] Batch
│           ├── [COLUMN:COL-L-SUBMISSIONS-COURSE-OFFERING] Course Offering
│           ├── [COLUMN:COL-L-SUBMISSIONS-SEMESTER] Semester
│           ├── [COLUMN:COL-L-SUBMISSIONS-STAGE] Stage
│           ├── [COLUMN:COL-L-SUBMISSIONS-SUBMITTED-BY] Submitted By
│           ├── [COLUMN:COL-L-SUBMISSIONS-STATUS] Status
│           └── [STATE:S-T-L-SUBMISSIONS-NO-SUBMITTED-APPROVAL-BATCHES] No submitted approval batches
├── [PORTAL:FACULTY] Faculty Head Portal
│   ├── role-match: Faculty Head
│   ├── route-owner: frontend/src/roles/faculty-head/FacultyApp.tsx
│   ├── shell: frontend/src/roles/faculty-head/layout/FacultyShell.tsx
│   ├── data-provider: frontend/src/roles/faculty-head/facultyPortal.tsx
│   ├── [PERMISSION:PM-FACULTY]
│   │   ├── scope: academic units headed by current member
│   │   ├── programmes/courses: units in faculty scope
│   │   ├── people: lecturers and students attached to scoped offerings/programmes
│   │   ├── approvals: submitted result batches in scope
│   │   ├── transcript action: certify/return; cannot issue official document
│   │   └── result publication: not permitted
│   ├── [NAV:N-FACULTY]
│   │   ├── Overview → [PAGE:P-FH-DASHBOARD]
│   │   ├── My Faculty → [PAGE:P-FH-PROFILE]
│   │   ├── Programmes → [PAGE:P-FH-PROGRAMMES]
│   │   ├── Courses & Curricula → [PAGE:P-FH-COURSES]
│   │   ├── Lecturers → [PAGE:P-FH-LECTURERS]
│   │   ├── Students & Cohorts → [PAGE:P-FH-STUDENTS]
│   │   ├── Course Offerings → [PAGE:P-FH-OFFERINGS]
│   │   ├── Result Approvals → [PAGE:P-FH-APPROVALS]
│   │   ├── Faculty Results → [PAGE:P-FH-RESULTS]
│   │   ├── Review Requests → [PAGE:P-FH-REVIEWS]
│   │   ├── Transcript Review → [PAGE:P-FH-TRANSCRIPTS]
│   │   └── Graduation Readiness → [PAGE:P-FH-READINESS]
│   ├── [RESPONSIVE:R-FACULTY-NAV]
│   │   ├── mobile-priority: Overview | Programmes | Result Approvals | Transcript Review
│   │   └── mobile-More: remaining routes + sign out
│   ├── [PAGE:P-FH-DASHBOARD] Faculty Overview
│   │   ├── route → #/faculty
│   │   ├── source: frontend/src/roles/faculty-head/pages/dashboard/FacultyDashboardPage.tsx
│   │   ├── [CONTAINER:C-FH-WELCOME]
│   │   │   ├── faculty/unit heading
│   │   │   ├── [BUTTON:B-C-FH-WELCOME-REVIEW-RESULTS] Review results → [PAGE:P-FH-APPROVALS]
│   │   │   ├── [BUTTON:B-C-FH-WELCOME-REVIEW-TRANSCRIPTS] Review transcripts → [PAGE:P-FH-TRANSCRIPTS]
│   │   │   ├── faculty-head identity
│   │   │   └── [STATUS:ST-C-FH-WELCOME-MEMBER-STATUS] Member status
│   │   ├── [CONTAINER:C-FH-METRICS]
│   │   │   ├── [METRIC:MT-C-FH-METRICS-PROGRAMMES] Programmes
│   │   │   ├── [METRIC:MT-C-FH-METRICS-ACTIVE-STUDENTS] Active Students
│   │   │   ├── [METRIC:MT-C-FH-METRICS-RESULT-APPROVALS] Result Approvals
│   │   │   └── [METRIC:MT-C-FH-METRICS-TRANSCRIPT-REVIEWS] Transcript Reviews
│   │   ├── [CONTAINER:C-FH-UNITS]
│   │   │   └── [LIST:LS-C-FH-UNITS-ACADEMIC-UNITS] Academic units; name | code/type | status
│   │   ├── [CONTAINER:C-FH-QUEUE]
│   │   │   ├── [BUTTON:B-C-FH-QUEUE-SUBMITTED-RESULT-BATCHES] Submitted result batches → [PAGE:P-FH-APPROVALS]
│   │   │   ├── [BUTTON:B-C-FH-QUEUE-RESULT-REVIEW-REQUESTS] Result review requests → [PAGE:P-FH-REVIEWS]
│   │   │   └── [BUTTON:B-C-FH-QUEUE-GRADUATION-READINESS] Graduation readiness → [PAGE:P-FH-READINESS]
│   │   └── [TEST:Q-P-FH-DASHBOARD-CONTRACT]
│   │       ├── queues count only faculty scope
│   │       └── actions reach leadership pages
│   ├── [PAGE:P-FH-PROFILE] Faculty Scope
│   │   ├── route → #/faculty/profile
│   │   ├── source: FacultyStructurePage view=profile
│   │   ├── [CONTAINER:C-FH-PROFILE-BANNER]
│   │   │   ├── faculty-head initials
│   │   │   ├── full name
│   │   │   ├── headed units
│   │   │   └── [STATUS:ST-C-FH-PROFILE-BANNER-MEMBER-STATUS] Member status
│   │   └── [CONTAINER:C-FH-SCOPE-DEFINITIONS]
│   │       ├── Member Number
│   │       ├── User Account
│   │       ├── Primary Units
│   │       ├── Units in Scope
│   │       ├── Programmes
│   │       └── Lecturers
│   ├── [PAGE:P-FH-PROGRAMMES] Faculty Programmes
│   │   ├── route → #/faculty/programmes
│   │   ├── source: FacultyStructurePage view=programmes
│   │   ├── [METRIC:MT-P-FH-PROGRAMMES-PROGRAMMES] Programmes
│   │   ├── [METRIC:MT-P-FH-PROGRAMMES-CURRICULA] Curricula
│   │   ├── [METRIC:MT-P-FH-PROGRAMMES-ENROLMENTS] Enrolments
│   │   ├── [METRIC:MT-P-FH-PROGRAMMES-ACADEMIC-UNITS] Academic Units
│   │   └── [TABLE:T-FH-PROGRAMMES]
│   │       ├── [COLUMN:COL-FH-PROGRAMMES-PROGRAMME] Programme; name + code
│   │       ├── [COLUMN:COL-FH-PROGRAMMES-AWARD] Award
│   │       ├── [COLUMN:COL-FH-PROGRAMMES-ACADEMIC-UNIT] Academic Unit
│   │       ├── [COLUMN:COL-FH-PROGRAMMES-DURATION] Duration
│   │       ├── [COLUMN:COL-FH-PROGRAMMES-STUDENTS] Students; calculated enrolment count
│   │       └── [COLUMN:COL-FH-PROGRAMMES-STATUS] Status
│   ├── [PAGE:P-FH-COURSES] Courses and Curricula
│   │   ├── route → #/faculty/courses
│   │   ├── source: FacultyStructurePage view=courses
│   │   ├── [LAYOUT:L-P-FH-COURSES-TWO-COLUMN-SPLIT-GRID] Two-column split grid
│   │   ├── [TABLE:T-FH-COURSES]
│   │   │   ├── [COLUMN:COL-FH-COURSES-COURSE] Course; code + name
│   │   │   ├── [COLUMN:COL-FH-COURSES-UNIT] Unit
│   │   │   ├── [COLUMN:COL-FH-COURSES-CREDITS] Credits
│   │   │   ├── [COLUMN:COL-FH-COURSES-LEVEL] Level
│   │   │   └── [COLUMN:COL-FH-COURSES-STATUS] Status
│   │   └── [CONTAINER:C-FH-CURRICULA]
│   │       └── [LIST:LS-C-FH-CURRICULA-CURRICULUM-VERSIONS] Curriculum Versions
│   │           ├── Curriculum Name
│   │           ├── Programme
│   │           ├── Effective Date
│   │           └── [STATUS:ST-LS-C-FH-CURRICULA-CURRICULUM-VERSIONS-APPROVAL-STATUS] Approval status
│   ├── [PAGE:P-FH-LECTURERS] Lecturers and Teaching Assignments
│   │   ├── route → #/faculty/lecturers
│   │   ├── source: FacultyPeoplePage view=lecturers
│   │   ├── [CONTAINER:C-FH-LECTURER-GRID]
│   │   │   └── [INSTANCE:I-C-FH-LECTURER-GRID-LECTURER-CARD] Lecturer card
│   │   │       ├── avatar initials
│   │   │       ├── [STATUS:ST-I-C-FH-LECTURER-GRID-LECTURER-CARD-MEMBER-STATUS] Member status
│   │   │       ├── full name
│   │   │       ├── member number/user
│   │   │       ├── [METRIC:MT-C-FH-LECTURER-GRID-ASSIGNED-OFFERINGS] Assigned Offerings
│   │   │       └── [METRIC:MT-C-FH-LECTURER-GRID-PRIMARY-ROLES] Primary Roles
│   │   └── [STATE:S-P-FH-LECTURERS-NO-LECTURER-ASSIGNMENTS] No lecturer assignments
│   ├── [PAGE:P-FH-STUDENTS] Students and Programme Enrolments
│   │   ├── route → #/faculty/students
│   │   ├── source: FacultyPeoplePage view=students
│   │   ├── [METRIC:MT-P-FH-STUDENTS-STUDENTS] Students
│   │   ├── [METRIC:MT-P-FH-STUDENTS-ACTIVE-ENROLMENTS] Active Enrolments
│   │   ├── [METRIC:MT-P-FH-STUDENTS-COHORTS] Cohorts
│   │   ├── [METRIC:MT-P-FH-STUDENTS-COMPLETED] Completed
│   │   └── [TABLE:T-FH-STUDENTS]
│   │       ├── [COLUMN:COL-FH-STUDENTS-STUDENT] Student; name + number
│   │       ├── [COLUMN:COL-FH-STUDENTS-PROGRAMME] Programme
│   │       ├── [COLUMN:COL-FH-STUDENTS-ACADEMIC-YEAR] Academic Year
│   │       ├── [COLUMN:COL-FH-STUDENTS-COHORT] Cohort
│   │       ├── [COLUMN:COL-FH-STUDENTS-ADMISSION] Admission
│   │       └── [COLUMN:COL-FH-STUDENTS-STATUS] Status
│   ├── [PAGE:P-FH-OFFERINGS] Faculty Course Offerings
│   │   ├── route → #/faculty/offerings
│   │   ├── source: FacultyStructurePage view=offerings
│   │   └── [TABLE:T-FH-OFFERINGS]
│   │       ├── [COLUMN:COL-FH-OFFERINGS-COURSE] Course; code + name
│   │       ├── [COLUMN:COL-FH-OFFERINGS-SEMESTER] Semester
│   │       ├── [COLUMN:COL-FH-OFFERINGS-COHORT] Cohort
│   │       ├── [COLUMN:COL-FH-OFFERINGS-TYPE] Type
│   │       ├── [COLUMN:COL-FH-OFFERINGS-CAPACITY] Capacity
│   │       └── [COLUMN:COL-FH-OFFERINGS-STATUS] Status
│   ├── [PAGE:P-FH-APPROVALS] Result Approval Batches
│   │   ├── route → #/faculty/approvals
│   │   ├── source: FacultyResultsPage view=approvals
│   │   ├── [CONTAINER:C-FH-APPROVAL-METRICS]
│   │   │   ├── [METRIC:MT-C-FH-APPROVAL-METRICS-SUBMITTED] Submitted
│   │   │   ├── [METRIC:MT-C-FH-APPROVAL-METRICS-APPROVED] Approved
│   │   │   ├── [METRIC:MT-C-FH-APPROVAL-METRICS-RETURNED] Returned
│   │   │   └── [METRIC:MT-C-FH-APPROVAL-METRICS-RESULT-RECORDS] Result Records
│   │   ├── [CONTAINER:C-FH-APPROVAL-LIST]
│   │   │   └── [INSTANCE:I-C-FH-APPROVAL-LIST-RESULT-BATCH-ACCORDION] Result-batch accordion
│   │   │       ├── batch ID
│   │   │       ├── offering code
│   │   │       ├── result count
│   │   │       ├── [STATUS:ST-I-C-FH-APPROVAL-LIST-RESULT-BATCH-ACCORDION-BATCH-STATUS] Batch status
│   │   │       ├── Academic Semester
│   │   │       ├── Submitted By
│   │   │       ├── Approval Stage
│   │   │       ├── [TABLE:T-FH-BATCH-RESULTS]
│   │   │       │   ├── [COLUMN:COL-FH-BATCH-RESULTS-RESULT] Result
│   │   │       │   ├── [COLUMN:COL-FH-BATCH-RESULTS-STUDENT] Student
│   │   │       │   ├── [COLUMN:COL-FH-BATCH-RESULTS-FINAL-MARK] Final Mark
│   │   │       │   ├── [COLUMN:COL-FH-BATCH-RESULTS-GRADE] Grade
│   │   │       │   └── [COLUMN:COL-FH-BATCH-RESULTS-REVIEW] Review
│   │   │       ├── [BUTTON:B-FH-RETURN-BATCH]
│   │   │       │   ├── label: Return for correction
│   │   │       │   └── decision: Rejected
│   │   │       └── [BUTTON:B-FH-APPROVE-BATCH]
│   │   │           ├── label: Approve results
│   │   │           ├── busy-label: Saving…
│   │   │           └── decision: Approved
│   │   ├── [DATA:DT-FH-APPROVALS]
│   │   │   ├── Result Approval Batch
│   │   │   ├── Result Approval Batch Item
│   │   │   ├── Student Course Result
│   │   │   └── method: review_faculty_result_batch
│   │   └── [TEST:Q-FH-APPROVALS]
│   │       ├── only Submitted batches show decision buttons
│   │       ├── first actionable batch starts expanded
│   │       ├── approval does not set student publication
│   │       └── successful decision refreshes list
│   ├── [PAGE:P-FH-RESULTS] Faculty Course Results
│   │   ├── route → #/faculty/results
│   │   ├── source: FacultyResultsPage view=results
│   │   └── [TABLE:T-FH-RESULTS]
│   │       ├── [COLUMN:COL-FH-RESULTS-STUDENT] Student
│   │       ├── [COLUMN:COL-FH-RESULTS-COURSE] Course
│   │       ├── [COLUMN:COL-FH-RESULTS-SEMESTER] Semester
│   │       ├── [COLUMN:COL-FH-RESULTS-FINAL] Final
│   │       ├── [COLUMN:COL-FH-RESULTS-GRADE] Grade
│   │       ├── [COLUMN:COL-FH-RESULTS-STATUS] Status
│   │       ├── [COLUMN:COL-FH-RESULTS-APPROVAL] Approval
│   │       └── [COLUMN:COL-FH-RESULTS-PUBLICATION] Publication
│   ├── [PAGE:P-FH-REVIEWS] Result Review Requests
│   │   ├── route → #/faculty/reviews
│   │   ├── source: FacultyResultsPage view=reviews
│   │   ├── [TABLE:T-FH-REVIEWS]
│   │   │   ├── [COLUMN:COL-FH-REVIEWS-REQUEST] Request
│   │   │   ├── [COLUMN:COL-FH-REVIEWS-STUDENT] Student
│   │   │   ├── [COLUMN:COL-FH-REVIEWS-TYPE] Type
│   │   │   ├── [COLUMN:COL-FH-REVIEWS-REASON] Reason
│   │   │   ├── [COLUMN:COL-FH-REVIEWS-CURRENT-STATUS] Current Status
│   │   │   └── [COLUMN:COL-FH-REVIEWS-FACULTY-ACTION] Faculty Action
│   │   │       ├── [BUTTON:B-COL-FH-REVIEWS-FACULTY-ACTION-START-REVIEW] Start review
│   │   │       └── [BUTTON:B-COL-FH-REVIEWS-FACULTY-ACTION-RESOLVE] Resolve
│   │   ├── [DIALOG:D-FH-REVIEW-DECISION]
│   │   │   ├── implementation: window.prompt
│   │   │   ├── field: faculty decision/guidance
│   │   │   └── cancel: abort mutation
│   │   └── [TEST:Q-P-FH-REVIEWS-CONTRACT]
│   │       ├── decision required before mutation
│   │       └── status action updates request
│   ├── [PAGE:P-FH-TRANSCRIPTS] Transcript Review
│   │   ├── route → #/faculty/transcripts
│   │   ├── source: FacultyTranscriptsPage view=transcripts
│   │   ├── [METRIC:MT-P-FH-TRANSCRIPTS-UNDER-REVIEW] Under Review
│   │   ├── [METRIC:MT-P-FH-TRANSCRIPTS-FACULTY-APPROVED] Faculty Approved
│   │   ├── [METRIC:MT-P-FH-TRANSCRIPTS-REGISTRAR-ISSUED] Registrar Issued
│   │   ├── [METRIC:MT-P-FH-TRANSCRIPTS-FACULTY-STUDENTS] Faculty Students
│   │   ├── [CONTAINER:C-FH-TRANSCRIPT-GRID]
│   │   │   └── [INSTANCE:I-C-FH-TRANSCRIPT-GRID-TRANSCRIPT-REVIEW-CARD] Transcript review card
│   │   │       ├── university logo
│   │   │       ├── [STATUS:ST-I-C-FH-TRANSCRIPT-GRID-TRANSCRIPT-REVIEW-CARD-DOCUMENT-STATUS] Document status
│   │   │       ├── student name/number
│   │   │       ├── programme
│   │   │       ├── Document
│   │   │       ├── Type
│   │   │       ├── Result Snapshot
│   │   │       ├── Faculty Approval
│   │   │       ├── [BUTTON:B-C-FH-TRANSCRIPT-GRID-RETURN] Return
│   │   │       └── [BUTTON:B-C-FH-TRANSCRIPT-GRID-CERTIFY] Certify
│   │   ├── [STATE:S-P-FH-TRANSCRIPTS-NO-TRANSCRIPTS-IN-REVIEW] No transcripts in review
│   │   ├── [DATA:DT-P-FH-TRANSCRIPTS-CONTRACT]
│   │   │   ├── Academic Transcript
│   │   │   └── method: review_faculty_transcript
│   │   └── [TEST:Q-P-FH-TRANSCRIPTS-CONTRACT]
│   │       ├── decision buttons appear only for Draft/Faculty Head Review
│   │       ├── certify moves document toward registrar
│   │       └── return does not issue document
│   └── [PAGE:P-FH-READINESS] Graduation Readiness
│       ├── route → #/faculty/readiness
│       ├── source: FacultyTranscriptsPage view=readiness
│       ├── filter: clearance_type = Graduation
│       ├── [METRIC:MT-P-FH-READINESS-GRADUATION-CASES] Graduation Cases
│       ├── [METRIC:MT-P-FH-READINESS-FULLY-CLEARED] Fully Cleared
│       ├── [METRIC:MT-P-FH-READINESS-ACADEMIC-HOLDS] Academic Holds
│       ├── [METRIC:MT-P-FH-READINESS-FINANCE-PENDING] Finance Pending
│       └── [TABLE:T-FH-READINESS]
│           ├── [COLUMN:COL-FH-READINESS-STUDENT] Student
│           ├── [COLUMN:COL-FH-READINESS-SEMESTER] Semester
│           ├── [COLUMN:COL-FH-READINESS-ACADEMIC-CLEARANCE] Academic Clearance
│           ├── [COLUMN:COL-FH-READINESS-FINANCIAL-CLEARANCE] Financial Clearance
│           ├── [COLUMN:COL-FH-READINESS-OVERALL-READINESS] Overall Readiness
│           ├── [COLUMN:COL-FH-READINESS-CLEARED-ON] Cleared On
│           └── [STATE:S-T-FH-READINESS-NO-GRADUATION-CLEARANCE-CASES] No graduation clearance cases
├── [PORTAL:REGISTRAR] Academic Registrar Portal
│   ├── role-match: Registrar | Academics User
│   ├── route-owner: frontend/src/roles/registrar/RegistrarApp.tsx
│   ├── shell: frontend/src/roles/registrar/layout/RegistrarShell.tsx
│   ├── data-provider: frontend/src/roles/registrar/registrarPortal.tsx
│   ├── [PERMISSION:PM-REGISTRAR]
│   │   ├── data scope: institution-wide academic records
│   │   ├── admissions: review/accept/reject
│   │   ├── semester registration: approve/cancel
│   │   ├── result publication: Faculty Head approved batches only
│   │   ├── transcripts: issue/revoke Faculty Head certified records
│   │   └── clearance: refresh and certify eligible candidates
│   ├── [NAV:N-REGISTRAR]
│   │   ├── Overview → [PAGE:P-R-DASHBOARD]
│   │   ├── Admissions → [PAGE:P-R-ADMISSIONS]
│   │   ├── Student Records → [PAGE:P-R-STUDENTS]
│   │   ├── Programmes → [PAGE:P-R-PROGRAMMES]
│   │   ├── Academic Calendar → [PAGE:P-R-CALENDAR]
│   │   ├── Semester Registration → [PAGE:P-R-SEMESTER-REG]
│   │   ├── Course Registration → [PAGE:P-R-COURSE-REG]
│   │   ├── Result Publication → [PAGE:P-R-PUBLISH]
│   │   ├── Approval Register → [PAGE:P-R-BATCHES]
│   │   ├── Transcript Issuance → [PAGE:P-R-TRANSCRIPTS]
│   │   └── Graduation & Clearance → [PAGE:P-R-CLEARANCE]
│   ├── [RESPONSIVE:R-REGISTRAR-NAV]
│   │   ├── mobile-priority: Overview | Admissions | Result Publication | Transcript Issuance
│   │   └── mobile-More: remaining destinations + sign out
│   ├── [PAGE:P-R-DASHBOARD] Registrar Overview
│   │   ├── route → #/registrar
│   │   ├── source: frontend/src/roles/registrar/pages/dashboard/RegistrarDashboardPage.tsx
│   │   ├── [CONTAINER:C-R-WELCOME]
│   │   │   ├── operations heading/description
│   │   │   ├── [BUTTON:B-C-R-WELCOME-REVIEW-ADMISSIONS] Review admissions → [PAGE:P-R-ADMISSIONS]
│   │   │   ├── [BUTTON:B-C-R-WELCOME-ISSUE-TRANSCRIPTS] Issue transcripts → [PAGE:P-R-TRANSCRIPTS]
│   │   │   ├── signed-in registrar identity
│   │   │   └── [STATUS:ST-C-R-WELCOME-AUTHORISED] Authorised
│   │   ├── [CONTAINER:C-R-METRICS]
│   │   │   ├── [METRIC:MT-C-R-METRICS-ADMISSION-QUEUE] Admission Queue
│   │   │   ├── [METRIC:MT-C-R-METRICS-ACTIVE-STUDENTS] Active Students
│   │   │   ├── [METRIC:MT-C-R-METRICS-RESULTS-TO-PUBLISH] Results to Publish
│   │   │   └── [METRIC:MT-C-R-METRICS-TRANSCRIPTS-TO-ISSUE] Transcripts to Issue
│   │   ├── [CONTAINER:C-R-CALENDAR]
│   │   │   └── [LIST:LS-C-R-CALENDAR-UP-TO-FIVE-CURRENT-SEMESTER-RECORDS] Up to five current semester records
│   │   ├── [CONTAINER:C-R-ACTIONS]
│   │   │   ├── [BUTTON:B-C-R-ACTIONS-REGISTRATION-APPROVALS] Registration approvals → [PAGE:P-R-SEMESTER-REG]
│   │   │   ├── [BUTTON:B-C-R-ACTIONS-RESULT-PUBLICATION] Result publication → [PAGE:P-R-PUBLISH]
│   │   │   └── [BUTTON:B-C-R-ACTIONS-GRADUATION-CLEARANCE] Graduation clearance → [PAGE:P-R-CLEARANCE]
│   │   └── [TEST:Q-P-R-DASHBOARD-CONTRACT]
│   │       ├── queue metrics use actionable status filters
│   │       └── action buttons reach registrar-owned pages
│   ├── [PAGE:P-R-ADMISSIONS] University Applications
│   │   ├── route → #/registrar/admissions
│   │   ├── source: frontend/src/roles/registrar/pages/admissions/RegistrarAdmissionsPage.tsx
│   │   ├── [CONTAINER:C-R-ADMISSION-METRICS]
│   │   │   ├── [METRIC:MT-C-R-ADMISSION-METRICS-SUBMITTED] Submitted
│   │   │   ├── [METRIC:MT-C-R-ADMISSION-METRICS-UNDER-REVIEW] Under Review
│   │   │   ├── [METRIC:MT-C-R-ADMISSION-METRICS-ACCEPTED] Accepted
│   │   │   └── [METRIC:MT-C-R-ADMISSION-METRICS-REJECTED] Rejected
│   │   ├── [FIELD:FLD-R-APPLICATION-SEARCH]
│   │   │   └── placeholder: Search applicant, application or programme
│   │   ├── [TABLE:T-R-APPLICATIONS]
│   │   │   ├── [COLUMN:COL-R-APPLICATIONS-APPLICANT] Applicant; name + application/email
│   │   │   ├── [COLUMN:COL-R-APPLICATIONS-PROGRAMME] Programme
│   │   │   ├── [COLUMN:COL-R-APPLICATIONS-ACADEMIC-YEAR] Academic Year
│   │   │   ├── [COLUMN:COL-R-APPLICATIONS-APPLIED] Applied
│   │   │   ├── [COLUMN:COL-R-APPLICATIONS-STATUS] Status
│   │   │   └── [COLUMN:COL-R-APPLICATIONS-ACTION] Action
│   │   │       ├── [BUTTON:B-COL-R-APPLICATIONS-ACTION-START-REVIEW] Start review
│   │   │       ├── [BUTTON:B-COL-R-APPLICATIONS-ACTION-REJECT] Reject
│   │   │       └── [BUTTON:B-COL-R-APPLICATIONS-ACTION-ACCEPT-ADMIT] Accept & admit
│   │   ├── [DIALOG:D-R-ADMISSION-COMMENTS]
│   │   │   ├── implementation: window.prompt
│   │   │   ├── field: Registrar comments for decision
│   │   │   └── current behavior: blank comments allowed
│   │   ├── [DATA:DT-R-ADMISSIONS]
│   │   │   ├── University Application
│   │   │   └── method: review_registrar_application
│   │   └── [TEST:Q-R-ADMISSIONS]
│   │       ├── search filters applicant/application/programme
│   │       ├── Start review appears only for Submitted
│   │       ├── accept/reject appears for Submitted/Under Review
│   │       └── accept creates student/enrolment through backend workflow
│   ├── [PAGE:P-R-STUDENTS] Official Student Records
│   │   ├── route → #/registrar/students
│   │   ├── source: RegistrarRecordsPage view=students
│   │   ├── [METRIC:MT-P-R-STUDENTS-STUDENTS] Students
│   │   ├── [METRIC:MT-P-R-STUDENTS-ACTIVE-ENROLMENTS] Active Enrolments
│   │   ├── [METRIC:MT-P-R-STUDENTS-COHORTS] Cohorts
│   │   ├── [METRIC:MT-P-R-STUDENTS-COMPLETED] Completed
│   │   └── [TABLE:T-R-STUDENTS]
│   │       ├── [COLUMN:COL-R-STUDENTS-STUDENT] Student; name + number
│   │       ├── [COLUMN:COL-R-STUDENTS-PROGRAMME] Programme
│   │       ├── [COLUMN:COL-R-STUDENTS-ACADEMIC-YEAR] Academic Year
│   │       ├── [COLUMN:COL-R-STUDENTS-COHORT] Cohort
│   │       ├── [COLUMN:COL-R-STUDENTS-ADMISSION] Admission
│   │       └── [COLUMN:COL-R-STUDENTS-STATUS] Status
│   ├── [PAGE:P-R-PROGRAMMES] Programmes and Academic Structure
│   │   ├── route → #/registrar/programmes
│   │   ├── source: RegistrarRecordsPage view=programmes
│   │   ├── [LAYOUT:L-P-R-PROGRAMMES-PROGRAMMES-TABLE-ACADEMIC-UNIT-LIST] Programmes table + academic-unit list
│   │   ├── [TABLE:T-R-PROGRAMMES]
│   │   │   ├── [COLUMN:COL-R-PROGRAMMES-PROGRAMME] Programme
│   │   │   ├── [COLUMN:COL-R-PROGRAMMES-AWARD] Award
│   │   │   ├── [COLUMN:COL-R-PROGRAMMES-UNIT] Unit
│   │   │   ├── [COLUMN:COL-R-PROGRAMMES-DURATION] Duration
│   │   │   └── [COLUMN:COL-R-PROGRAMMES-STATUS] Status
│   │   └── [CONTAINER:C-R-UNITS]
│   │       └── [LIST:LS-C-R-UNITS-UNIT-NAME] Unit Name | Code/Parent | Unit Type
│   ├── [PAGE:P-R-CALENDAR] Years and Semesters
│   │   ├── route → #/registrar/calendar
│   │   ├── source: RegistrarRecordsPage view=calendar
│   │   └── [CONTAINER:C-R-YEAR-GRID]
│   │       └── [INSTANCE:I-C-R-YEAR-GRID-ACADEMIC-YEAR-CARD] Academic-year card
│   │           ├── year name
│   │           ├── [STATUS:ST-I-C-R-YEAR-GRID-ACADEMIC-YEAR-CARD-YEAR-STATUS] Year status
│   │           ├── start/end dates
│   │           └── [LIST:LS-C-R-YEAR-GRID-CHILD-SEMESTERS] Child semesters
│   │               ├── semester name
│   │               ├── start/end dates
│   │               └── [STATUS:ST-LS-C-R-YEAR-GRID-CHILD-SEMESTERS-REGISTRATION-OPEN-SEMESTER-STATUS] Registration open / semester status
│   ├── [PAGE:P-R-SEMESTER-REG] Semester Registration
│   │   ├── route → #/registrar/registration
│   │   ├── source: RegistrarRegistrationPage view=semesters
│   │   ├── [METRIC:MT-P-R-SEMESTER-REG-TOTAL-RECORDS] Total Records
│   │   ├── [METRIC:MT-P-R-SEMESTER-REG-REGISTERED] Registered
│   │   ├── [METRIC:MT-P-R-SEMESTER-REG-PENDING] Pending
│   │   ├── [METRIC:MT-P-R-SEMESTER-REG-CANCELLED] Cancelled
│   │   ├── [TABLE:T-R-SEMESTER-REG]
│   │   │   ├── [COLUMN:COL-R-SEMESTER-REG-STUDENT] Student
│   │   │   ├── [COLUMN:COL-R-SEMESTER-REG-SEMESTER] Semester
│   │   │   ├── [COLUMN:COL-R-SEMESTER-REG-REGISTRATION-DATE] Registration Date
│   │   │   ├── [COLUMN:COL-R-SEMESTER-REG-STATUS] Status
│   │   │   └── [COLUMN:COL-R-SEMESTER-REG-REGISTRAR-ACTION] Registrar Action
│   │   │       ├── [BUTTON:B-COL-R-SEMESTER-REG-REGISTRAR-ACTION-CANCEL] Cancel
│   │   │       └── [BUTTON:B-COL-R-SEMESTER-REG-REGISTRAR-ACTION-APPROVE] Approve
│   │   ├── [DATA:DT-P-R-SEMESTER-REG-CONTRACT]
│   │   │   ├── Semester Registration
│   │   │   └── method: review_semester_registration
│   │   └── [TEST:Q-P-R-SEMESTER-REG-CONTRACT]
│   │       ├── actions only appear for Draft/Pending Approval
│   │       └── status updates after refresh
│   ├── [PAGE:P-R-COURSE-REG] University Course Registrations
│   │   ├── route → #/registrar/courses
│   │   ├── source: RegistrarRegistrationPage view=courses
│   │   └── [TABLE:T-R-COURSE-REG]
│   │       ├── [COLUMN:COL-R-COURSE-REG-STUDENT] Student
│   │       ├── [COLUMN:COL-R-COURSE-REG-COURSE-OFFERING] Course Offering
│   │       ├── [COLUMN:COL-R-COURSE-REG-SEMESTER-REGISTRATION] Semester Registration
│   │       ├── [COLUMN:COL-R-COURSE-REG-COHORT] Cohort
│   │       ├── [COLUMN:COL-R-COURSE-REG-TYPE] Type
│   │       ├── [COLUMN:COL-R-COURSE-REG-ATTEMPT] Attempt
│   │       └── [COLUMN:COL-R-COURSE-REG-STATUS] Status
│   ├── [PAGE:P-R-PUBLISH] Result Publication
│   │   ├── route → #/registrar/results
│   │   ├── source: RegistrarResultsPage view=publication
│   │   ├── [CONTAINER:C-R-PUBLISH-METRICS]
│   │   │   ├── [METRIC:MT-C-R-PUBLISH-METRICS-READY-TO-PUBLISH] Ready to Publish
│   │   │   ├── [METRIC:MT-C-R-PUBLISH-METRICS-PUBLISHED-RESULTS] Published Results
│   │   │   ├── [METRIC:MT-C-R-PUBLISH-METRICS-APPROVED-RESULTS] Approved Results
│   │   │   └── [METRIC:MT-C-R-PUBLISH-METRICS-INTERNAL-RESULTS] Internal Results
│   │   ├── [CONTAINER:C-R-PUBLISH-GRID]
│   │   │   └── [INSTANCE:I-C-R-PUBLISH-GRID-PUBLICATION-CARD] Publication card
│   │   │       ├── [STATUS:ST-I-C-R-PUBLISH-GRID-PUBLICATION-CARD-FACULTY-APPROVED] Faculty approved
│   │   │       ├── offering code
│   │   │       ├── semester
│   │   │       ├── result count
│   │   │       ├── batch ID
│   │   │       ├── faculty approver
│   │   │       └── [BUTTON:B-R-PUBLISH] Publish results
│   │   ├── [DIALOG:D-R-PUBLISH-CONFIRM]
│   │   │   ├── implementation: window.confirm
│   │   │   ├── warning: publishes all approved results to students
│   │   │   └── cancel: no mutation
│   │   ├── [STATE:S-P-R-PUBLISH-NO-BATCHES-READY-FOR-PUBLICATION] No batches ready for publication
│   │   ├── [DATA:DT-P-R-PUBLISH-CONTRACT]
│   │   │   ├── Result Approval Batch where status=Approved and stage=Faculty Head
│   │   │   ├── Student Course Result
│   │   │   └── method: publish_registrar_result_batch
│   │   └── [TEST:Q-R-PUBLISH]
│   │       ├── only eligible batches render
│   │       ├── confirmation required
│   │       ├── cancel does nothing
│   │       └── publication marks results visible to students
│   ├── [PAGE:P-R-BATCHES] Approval Register
│   │   ├── route → #/registrar/batches
│   │   ├── source: RegistrarResultsPage view=batches
│   │   └── [TABLE:T-R-BATCHES]
│   │       ├── [COLUMN:COL-R-BATCHES-BATCH] Batch
│   │       ├── [COLUMN:COL-R-BATCHES-OFFERING] Offering
│   │       ├── [COLUMN:COL-R-BATCHES-SEMESTER] Semester
│   │       ├── [COLUMN:COL-R-BATCHES-STAGE] Stage
│   │       ├── [COLUMN:COL-R-BATCHES-STATUS] Status
│   │       ├── [COLUMN:COL-R-BATCHES-SUBMITTED-BY] Submitted By
│   │       └── [COLUMN:COL-R-BATCHES-APPROVED-BY] Approved By
│   ├── [PAGE:P-R-TRANSCRIPTS] Transcript Issuance
│   │   ├── route → #/registrar/transcripts
│   │   ├── source: RegistrarTranscriptsPage view=transcripts
│   │   ├── [CONTAINER:C-R-TRANSCRIPT-METRICS]
│   │   │   ├── [METRIC:MT-C-R-TRANSCRIPT-METRICS-READY-TO-ISSUE] Ready to Issue
│   │   │   ├── [METRIC:MT-C-R-TRANSCRIPT-METRICS-ISSUED] Issued
│   │   │   ├── [METRIC:MT-C-R-TRANSCRIPT-METRICS-REVOKED] Revoked
│   │   │   └── [METRIC:MT-C-R-TRANSCRIPT-METRICS-STUDENTS] Students
│   │   ├── [CONTAINER:C-R-TRANSCRIPT-GRID]
│   │   │   └── [INSTANCE:I-C-R-TRANSCRIPT-GRID-TRANSCRIPT-ISSUANCE-CARD] Transcript issuance card
│   │   │       ├── university logo
│   │   │       ├── [STATUS:ST-I-C-R-TRANSCRIPT-GRID-TRANSCRIPT-ISSUANCE-CARD-TRANSCRIPT-STATUS] Transcript status
│   │   │       ├── student name/number
│   │   │       ├── programme
│   │   │       ├── Document
│   │   │       ├── Type
│   │   │       ├── Faculty Certified date
│   │   │       ├── Verification number
│   │   │       ├── [BUTTON:B-C-R-TRANSCRIPT-GRID-ISSUE-TRANSCRIPT] Issue transcript
│   │   │       ├── [LINK:LK-C-R-TRANSCRIPT-GRID-PDF] PDF ⇱ FILE:generated_pdf
│   │   │       └── [BUTTON:B-C-R-TRANSCRIPT-GRID-REVOKE] Revoke
│   │   ├── [DIALOG:D-R-REVOKE-REASON]
│   │   │   ├── implementation: window.prompt
│   │   │   ├── field: formal reason for revocation
│   │   │   └── blank/cancel: abort mutation
│   │   ├── [DATA:DT-P-R-TRANSCRIPTS-CONTRACT]
│   │   │   ├── Academic Transcript
│   │   │   ├── method: issue_registrar_transcript
│   │   │   └── method: revoke_registrar_transcript
│   │   └── [TEST:Q-R-TRANSCRIPTS]
│   │       ├── Issue appears only for Faculty Head Approved
│   │       ├── PDF/Revoke appear only for Registrar Issued
│   │       ├── revocation requires reason
│   │       └── revoked status disables issued document path
│   └── [PAGE:P-R-CLEARANCE] Graduation and Clearance
│       ├── route → #/registrar/clearance
│       ├── source: RegistrarTranscriptsPage view=clearance
│       ├── filter: clearance_type = Graduation
│       ├── [METRIC:MT-P-R-CLEARANCE-GRADUATION-CASES] Graduation Cases
│       ├── [METRIC:MT-P-R-CLEARANCE-CLEARED] Cleared
│       ├── [METRIC:MT-P-R-CLEARANCE-ACADEMIC-HOLDS] Academic Holds
│       ├── [METRIC:MT-P-R-CLEARANCE-FINANCE-PENDING] Finance Pending
│       ├── [TABLE:T-R-CLEARANCE]
│       │   ├── [COLUMN:COL-R-CLEARANCE-STUDENT] Student
│       │   ├── [COLUMN:COL-R-CLEARANCE-SEMESTER] Semester
│       │   ├── [COLUMN:COL-R-CLEARANCE-ACADEMIC] Academic
│       │   ├── [COLUMN:COL-R-CLEARANCE-FINANCIAL] Financial
│       │   ├── [COLUMN:COL-R-CLEARANCE-OVERALL-STATUS] Overall Status
│       │   ├── [COLUMN:COL-R-CLEARANCE-CLEARED-ON] Cleared On
│       │   └── [COLUMN:COL-R-CLEARANCE-ACTION] Action ← Refresh checks
│       ├── [DATA:DT-P-R-CLEARANCE-CONTRACT]
│       │   ├── Student Clearance
│       │   └── method: review_registrar_clearance
│       └── [TEST:Q-P-R-CLEARANCE-CONTRACT]
│           ├── only graduation cases appear
│           ├── refresh recalculates academic/finance checks
│           └── certification occurs only when both checks pass
├── [PORTAL:FINANCE] Finance Portal
│   ├── role-match: Accounts Manager | Accounts User
│   ├── route-owner: frontend/src/roles/finance/FinanceApp.tsx
│   ├── shell: frontend/src/roles/finance/layout/FinanceShell.tsx
│   ├── data-provider: frontend/src/roles/finance/financePortal.tsx
│   ├── [PERMISSION:PM-FINANCE]
│   │   ├── scope: institution student accounts and finance records
│   │   ├── invoices: create draft from approved fee structure; submit draft
│   │   ├── sponsorships: approve/activate/cancel
│   │   ├── clearance: refresh financial position
│   │   ├── academic results: no mutation permission
│   │   └── credentials: server-side ERPNext integration only
│   ├── [NAV:N-FINANCE]
│   │   ├── Finance Overview → [PAGE:P-F-DASHBOARD]
│   │   ├── Student Accounts → [PAGE:P-F-ACCOUNTS]
│   │   ├── Fee Structures → [PAGE:P-F-STRUCTURES]
│   │   ├── Student Billing → [PAGE:P-F-BILLING]
│   │   ├── Payment Receipts → [PAGE:P-A-RECEIPTS]
│   │   ├── Reconciliation → [PAGE:P-F-RECONCILIATION]
│   │   ├── Financial Analysis → [PAGE:P-F-ANALYSIS]
│   │   ├── Sponsorships → [PAGE:P-F-SPONSORSHIPS]
│   │   └── Financial Clearance → [PAGE:P-F-CLEARANCE]
│   ├── [RESPONSIVE:R-FINANCE-NAV]
│   │   ├── mobile-priority: Overview | Student Accounts | Payment Receipts | Financial Analysis
│   │   └── mobile-More: remaining destinations + sign out
│   ├── [PAGE:P-F-DASHBOARD] Finance Overview
│   │   ├── route → #/finance
│   │   ├── source: frontend/src/roles/finance/pages/dashboard/FinanceDashboardPage.tsx
│   │   ├── [CONTAINER:C-F-WELCOME]
│   │   │   ├── finance operations heading
│   │   │   ├── [BUTTON:B-C-F-WELCOME-OPEN-BILLING-DESK] Open billing desk → [PAGE:P-F-BILLING]
│   │   │   ├── [BUTTON:B-C-F-WELCOME-PAYMENT-RECEIPTS] Payment receipts → [PAGE:P-A-RECEIPTS]
│   │   │   ├── [METRIC:MT-C-F-WELCOME-COLLECTION-PERCENTAGE] Collection percentage
│   │   │   ├── [METRIC:MT-C-F-WELCOME-OUTSTANDING-AMOUNT] Outstanding amount
│   │   │   └── [STATUS:ST-C-F-WELCOME-BALANCES-REQUIRE-FOLLOW-UP-ACCOUNTS-SETTLED] Balances require follow-up / Accounts settled
│   │   ├── [CONTAINER:C-F-METRICS]
│   │   │   ├── [METRIC:MT-C-F-METRICS-TOTAL-ASSESSED] Total Assessed
│   │   │   ├── [METRIC:MT-C-F-METRICS-PAYMENTS-RECEIVED] Payments Received
│   │   │   ├── [METRIC:MT-C-F-METRICS-BALANCE-TO-COLLECT] Balance to Collect
│   │   │   └── [METRIC:MT-C-F-METRICS-STUDENT-ACCOUNTS] Student Accounts
│   │   ├── [CONTAINER:C-F-PRIORITIES]
│   │   │   └── [BUTTON LIST] Accounts requiring attention
│   │   │       ├── student name/number/semester
│   │   │       ├── outstanding amount
│   │   │       └── target → [PAGE:P-F-ANALYSIS]?student=:student
│   │   ├── [CONTAINER:C-F-OPERATIONS]
│   │   │   ├── [BUTTON:B-C-F-OPERATIONS-FEE-STRUCTURES] Fee structures → [PAGE:P-F-STRUCTURES]
│   │   │   ├── [BUTTON:B-C-F-OPERATIONS-SPONSORSHIPS] Sponsorships → [PAGE:P-F-SPONSORSHIPS]
│   │   │   └── [BUTTON:B-C-F-OPERATIONS-CLEARANCE] Clearance → [PAGE:P-F-CLEARANCE]
│   │   └── [TEST:Q-P-F-DASHBOARD-CONTRACT]
│   │       ├── collection percentage handles zero assessed
│   │       ├── priority list contains outstanding accounts only
│   │       └── operational queue counts match source records
│   ├── [PAGE:P-F-ACCOUNTS] Student Accounts
│   │   ├── route → #/finance/students
│   │   ├── source: frontend/src/roles/finance/pages/accounts/FinanceAccountsPage.tsx
│   │   ├── [CONTAINER:C-F-ACCOUNT-METRICS]
│   │   │   ├── [METRIC:MT-C-F-ACCOUNT-METRICS-ACCOUNTS-SHOWN] Accounts Shown
│   │   │   ├── [METRIC:MT-C-F-ACCOUNT-METRICS-ASSESSED] Assessed
│   │   │   ├── [METRIC:MT-C-F-ACCOUNT-METRICS-PAID] Paid
│   │   │   └── [METRIC:MT-C-F-ACCOUNT-METRICS-BALANCE-TO-PAY] Balance to Pay
│   │   ├── [FIELD:FLD-F-ACCOUNT-SEARCH]
│   │   │   ├── placeholder: Search student name, number, programme or customer account
│   │   │   └── URL state: `?q=`
│   │   ├── [TABLE:T-F-ACCOUNTS]
│   │   │   ├── [COLUMN:COL-F-ACCOUNTS-STUDENT] Student; name + number
│   │   │   ├── [COLUMN:COL-F-ACCOUNTS-PROGRAMME] Programme
│   │   │   ├── [COLUMN:COL-F-ACCOUNTS-ASSESSED] Assessed
│   │   │   ├── [COLUMN:COL-F-ACCOUNTS-PAID] Paid
│   │   │   ├── [COLUMN:COL-F-ACCOUNTS-BALANCE-TO-PAY] Balance to Pay
│   │   │   ├── [COLUMN:COL-F-ACCOUNTS-ACCOUNT-STATUS] Account Status
│   │   │   │   └── Paid | Partly Paid | Outstanding | Not Billed
│   │   │   └── [COLUMN:COL-F-ACCOUNTS-ACTIONS] Actions
│   │   │       ├── Analysis → [PAGE:P-F-ANALYSIS]
│   │   │       ├── Receipts → [PAGE:P-A-RECEIPTS]
│   │   │       └── Bill → [PAGE:P-F-BILLING]
│   │   └── [TEST:Q-P-F-ACCOUNTS-CONTRACT]
│   │       ├── totals equal filtered accounts
│   │       ├── URL query initializes search
│   │       └── row actions carry correct student identifier
│   ├── [PAGE:P-F-STRUCTURES] University Fee Structures
│   │   ├── route → #/finance/structures
│   │   ├── source: frontend/src/roles/finance/pages/structures/FinanceStructuresPage.tsx
│   │   ├── [METRIC:MT-P-F-STRUCTURES-FEE-STRUCTURES] Fee Structures
│   │   ├── [METRIC:MT-P-F-STRUCTURES-ACTIVE] Active
│   │   ├── [METRIC:MT-P-F-STRUCTURES-ACTIVE-VALUE] Active Value
│   │   ├── [METRIC:MT-P-F-STRUCTURES-SEMESTERS-COVERED] Semesters Covered
│   │   └── [CONTAINER:C-F-STRUCTURE-LIST]
│   │       └── [INSTANCE:I-C-F-STRUCTURE-LIST-FEE-STRUCTURE-ACCORDION] Fee-structure accordion
│   │           ├── structure name
│   │           ├── programme/semester/amount
│   │           ├── [STATUS:ST-I-C-F-STRUCTURE-LIST-FEE-STRUCTURE-ACCORDION-ACTIVE-OTHER] Active / other
│   │           ├── [METRIC:MT-C-F-STRUCTURE-LIST-PROGRAMME] Programme
│   │           ├── [METRIC:MT-C-F-STRUCTURE-LIST-ACADEMIC-PERIOD] Academic Period
│   │           ├── [METRIC:MT-C-F-STRUCTURE-LIST-EFFECTIVE-PERIOD] Effective Period
│   │           ├── [METRIC:MT-C-F-STRUCTURE-LIST-TOTAL-ASSESSED] Total Assessed
│   │           └── [TABLE:T-F-FEE-LINES]
│   │               ├── [COLUMN:COL-F-FEE-LINES-ITEM] Item
│   │               ├── [COLUMN:COL-F-FEE-LINES-DESCRIPTION] Description
│   │               ├── [COLUMN:COL-F-FEE-LINES-QUANTITY] Quantity
│   │               ├── [COLUMN:COL-F-FEE-LINES-RATE] Rate
│   │               ├── [COLUMN:COL-F-FEE-LINES-LINE-TOTAL] Line Total
│   │               │   └── calculation: quantity × rate
│   │               └── [COLUMN:COL-F-FEE-LINES-REQUIREMENT] Requirement
│   │                   └── Mandatory / Optional
│   ├── [PAGE:P-F-BILLING] Student Invoices
│   │   ├── route → #/finance/invoices
│   │   ├── source: frontend/src/roles/finance/pages/billing/FinanceBillingPage.tsx
│   │   ├── [CONTAINER:C-F-BILL-METRICS]
│   │   │   ├── [METRIC:MT-C-F-BILL-METRICS-SUBMITTED-INVOICES] Submitted Invoices
│   │   │   ├── [METRIC:MT-C-F-BILL-METRICS-DRAFT-REVIEW-QUEUE] Draft Review Queue
│   │   │   ├── [METRIC:MT-C-F-BILL-METRICS-FULLY-PAID] Fully Paid
│   │   │   └── [METRIC:MT-C-F-BILL-METRICS-OUTSTANDING] Outstanding
│   │   ├── [FORM:F-F-CREATE-INVOICE]
│   │   │   ├── heading: Bill a student from an approved structure
│   │   │   ├── [FIELD:FLD-F-BILL-STUDENT]
│   │   │   │   ├── type: select
│   │   │   │   ├── options: student accounts
│   │   │   │   └── change: clears selected structure
│   │   │   ├── [FIELD:FLD-F-BILL-STRUCTURE]
│   │   │   │   ├── type: select
│   │   │   │   ├── options: active structures available to selected student
│   │   │   │   └── disabled-when: no student selected
│   │   │   ├── [BUTTON:B-F-CREATE-DRAFT]
│   │   │   │   ├── label: Create draft invoice
│   │   │   │   ├── busy-label: Creating…
│   │   │   │   ├── disabled-when: missing student/structure | busy
│   │   │   │   └── method: create_finance_invoice
│   │   │   └── [STATE:S-F-F-CREATE-INVOICE-SUCCESS-ERROR-MESSAGE] Success/error message
│   │   ├── [FIELD:FLD-F-INVOICE-SEARCH]
│   │   │   └── placeholder: Search invoice, student, semester or fee structure
│   │   ├── [TABLE:T-F-INVOICES]
│   │   │   ├── [COLUMN:COL-F-INVOICES-INVOICE] Invoice; number + dates
│   │   │   ├── [COLUMN:COL-F-INVOICES-STUDENT-ACCOUNT] Student Account; identity
│   │   │   ├── [COLUMN:COL-F-INVOICES-SEMESTER-STRUCTURE] Semester / Structure
│   │   │   ├── [COLUMN:COL-F-INVOICES-ASSESSED] Assessed
│   │   │   ├── [COLUMN:COL-F-INVOICES-PAID] Paid
│   │   │   ├── [COLUMN:COL-F-INVOICES-BALANCE] Balance
│   │   │   ├── [COLUMN:COL-F-INVOICES-STATUS] Status
│   │   │   └── [COLUMN:COL-F-INVOICES-ACTION] Action
│   │   │       └── [BUTTON:B-F-SUBMIT-INVOICE]
│   │   │           ├── label: Submit
│   │   │           ├── visibility: docstatus=0
│   │   │           ├── busy-label: Submitting…
│   │   │           └── method: submit_finance_invoice
│   │   └── [TEST:Q-F-BILLING]
│   │       ├── student selection filters structures
│   │       ├── draft creation requires both selections
│   │       ├── new draft appears after refresh
│   │       ├── submit only appears on drafts
│   │       └── posted invoices cannot be submitted again
│   ├── [PAGE:P-F-PAYMENTS] Payment Receipts
│   │   ├── route → #/finance/payments
│   │   ├── implementation-shared-with → [PAGE:P-A-RECEIPTS]
│   │   └── permissions: Finance role through app session
│   ├── [PAGE:P-F-RECONCILIATION] Payment Allocation Control
│   │   ├── route → #/finance/reconciliation
│   │   ├── source: frontend/src/roles/finance/pages/payments/FinanceReconciliationPage.tsx
│   │   ├── [METRIC:MT-P-F-RECONCILIATION-RECEIPTS-REVIEWED] Receipts Reviewed
│   │   ├── [METRIC:MT-P-F-RECONCILIATION-ALLOCATED] Allocated
│   │   ├── [METRIC:MT-P-F-RECONCILIATION-UNALLOCATED] Unallocated
│   │   ├── [METRIC:MT-P-F-RECONCILIATION-ALLOCATION-COVERAGE] Allocation Coverage
│   │   ├── [FIELD:FLD-F-RECON-SEARCH]
│   │   │   └── placeholder: Search payment, student, reference, mode or semester
│   │   └── [TABLE:T-F-RECONCILIATION]
│   │       ├── [COLUMN:COL-F-RECONCILIATION-PAYMENT] Payment
│   │       ├── [COLUMN:COL-F-RECONCILIATION-STUDENT-CUSTOMER] Student / Customer
│   │       ├── [COLUMN:COL-F-RECONCILIATION-REFERENCE] Reference
│   │       ├── [COLUMN:COL-F-RECONCILIATION-RECEIVED] Received
│   │       ├── [COLUMN:COL-F-RECONCILIATION-ALLOCATED] Allocated
│   │       ├── [COLUMN:COL-F-RECONCILIATION-UNALLOCATED] Unallocated
│   │       ├── [COLUMN:COL-F-RECONCILIATION-COVERAGE] Coverage
│   │       └── [COLUMN:COL-F-RECONCILIATION-ACTIONS] Actions ← Receipt → [PAGE:P-F-PAYMENTS]
│   ├── [PAGE:P-F-ANALYSIS] Financial Analysis
│   │   ├── route → #/finance/analysis
│   │   ├── source: shared FinancialRiskPage with financeMode=true
│   │   ├── component-contract → [PAGE:P-A-FIN-ANALYSIS]
│   │   └── data-source: FinancePortalProvider snapshot
│   ├── [PAGE:P-F-SPONSORSHIPS] Student Sponsorships
│   │   ├── route → #/finance/sponsorships
│   │   ├── source: frontend/src/roles/finance/pages/sponsorships/FinanceSponsorshipsPage.tsx
│   │   ├── [CONTAINER:C-F-SPONSOR-METRICS]
│   │   │   ├── [METRIC:MT-C-F-SPONSOR-METRICS-AWARDS] Awards
│   │   │   ├── [METRIC:MT-C-F-SPONSOR-METRICS-ACTIVE] Active
│   │   │   ├── [METRIC:MT-C-F-SPONSOR-METRICS-AWAITING-ACTION] Awaiting Action
│   │   │   └── [METRIC:MT-C-F-SPONSOR-METRICS-FIXED-COMMITMENTS] Fixed Commitments
│   │   ├── [FIELD:FLD-F-SPONSOR-SEARCH]
│   │   │   └── placeholder: Search student, sponsor, programme, year or reference
│   │   ├── [TABLE:T-F-SPONSORSHIPS]
│   │   │   ├── [COLUMN:COL-F-SPONSORSHIPS-STUDENT] Student
│   │   │   ├── [COLUMN:COL-F-SPONSORSHIPS-SPONSOR] Sponsor
│   │   │   ├── [COLUMN:COL-F-SPONSORSHIPS-ACADEMIC-COVERAGE] Academic Coverage
│   │   │   ├── [COLUMN:COL-F-SPONSORSHIPS-AWARD] Award
│   │   │   ├── [COLUMN:COL-F-SPONSORSHIPS-APPROVAL-REFERENCE] Approval Reference
│   │   │   ├── [COLUMN:COL-F-SPONSORSHIPS-STATUS] Status
│   │   │   └── [COLUMN:COL-F-SPONSORSHIPS-ACTION] Action
│   │   │       ├── [BUTTON:B-COL-F-SPONSORSHIPS-ACTION-APPROVE] Approve; Draft only
│   │   │       ├── [BUTTON:B-COL-F-SPONSORSHIPS-ACTION-ACTIVATE] Activate; Approved only
│   │   │       └── [BUTTON:B-COL-F-SPONSORSHIPS-ACTION-CANCEL] Cancel; unless Cancelled/Exhausted
│   │   ├── [DATA:DT-P-F-SPONSORSHIPS-CONTRACT]
│   │   │   ├── Sponsorship Award
│   │   │   └── method: finance sponsorship decision
│   │   └── [TEST:Q-P-F-SPONSORSHIPS-CONTRACT]
│   │       ├── button visibility follows lifecycle
│   │       ├── fixed commitments sum fixed awards
│   │       └── decision refreshes status
│   └── [PAGE:P-F-CLEARANCE] Student Financial Clearance
│       ├── route → #/finance/clearance
│       ├── source: frontend/src/roles/finance/pages/clearance/FinanceClearancePage.tsx
│       ├── [METRIC:MT-P-F-CLEARANCE-CLEARANCE-CASES] Clearance Cases
│       ├── [METRIC:MT-P-F-CLEARANCE-FINANCIALLY-CLEARED] Financially Cleared
│       ├── [METRIC:MT-P-F-CLEARANCE-OUTSTANDING] Outstanding
│       ├── [METRIC:MT-P-F-CLEARANCE-GRADUATION-CHECKS] Graduation Checks
│       ├── [FIELD:FLD-F-CLEARANCE-SEARCH]
│       │   └── placeholder: Search student, semester, clearance type or status
│       ├── [TABLE:T-F-CLEARANCE]
│       │   ├── [COLUMN:COL-F-CLEARANCE-STUDENT] Student
│       │   ├── [COLUMN:COL-F-CLEARANCE-CLEARANCE-REQUEST] Clearance Request
│       │   ├── [COLUMN:COL-F-CLEARANCE-CURRENT-BALANCE] Current Balance
│       │   ├── [COLUMN:COL-F-CLEARANCE-FINANCE-STATUS] Finance Status
│       │   ├── [COLUMN:COL-F-CLEARANCE-ACADEMIC-STATUS] Academic Status
│       │   ├── [COLUMN:COL-F-CLEARANCE-OVERALL-STATUS] Overall Status
│       │   ├── [COLUMN:COL-F-CLEARANCE-LAST-CLEARED] Last Cleared
│       │   └── [COLUMN:COL-F-CLEARANCE-ACTION] Action ← Refresh balance
│       ├── [DATA:DT-P-F-CLEARANCE-CONTRACT]
│       │   ├── Student Clearance
│       │   ├── Sales Invoice balance lookup
│       │   └── method: finance clearance review
│       └── [TEST:Q-P-F-CLEARANCE-CONTRACT]
│           ├── balance agrees with submitted invoices
│           ├── refresh shows busy state
│           └── cleared status requires zero outstanding balance
├── [INTERACTION-GRAPH:IG-AWU] Cross-page and external edges
│   ├── [EDGE:LK-A-DASH-STUDENTS]
│   │   ├── source: [METRIC:MT-A-STUDENTS]
│   │   ├── trigger: click metric card
│   │   ├── target: [PAGE:P-A-STUDENTS]
│   │   ├── route → #/students
│   │   ├── tab: same
│   │   └── role: Administrator
│   ├── [EDGE:LK-A-DASH-FINANCE]
│   │   ├── source: [METRIC:MT-A-OUTSTANDING]
│   │   ├── target: [PAGE:P-A-BALANCES]
│   │   └── route → #/finance
│   ├── [EDGE:LK-STUDENT-PROFILE]
│   │   ├── sources
│   │   │   ├── table-instance → [TABLE:T-A-STUDENTS] Profile action
│   │   │   ├── table-instance → [TABLE:T-A-RECENT-FINANCE] Profile action
│   │   │   ├── Global Search student result
│   │   │   └── table-instance → [TABLE:T-A-FIN-STUDENTS] Profile action
│   │   ├── target: [PAGE:P-A-STUDENT-PROFILE]
│   │   ├── route → #/students/profile/:studentName
│   │   ├── parameter: studentName = Student.name
│   │   └── tab: same
│   ├── [EDGE:LK-STUDENT-TRANSCRIPT]
│   │   ├── sources: student tables | profile | Global Search | finance analysis
│   │   ├── target: [PAGE:P-A-TRANSCRIPT]
│   │   ├── route → #/transcripts?student=:studentName
│   │   └── parameter: student = Student.name
│   ├── [EDGE:LK-STUDENT-FINANCE]
│   │   ├── sources: directory | profile | dashboard finance row
│   │   ├── target: [PAGE:P-A-FIN-ANALYSIS]
│   │   └── route → #/finance/analysis?student=:studentName
│   ├── [EDGE:LK-FINANCE-RECEIPTS]
│   │   ├── sources: dashboard | profile invoice | account row | reconciliation row
│   │   ├── target: [PAGE:P-A-RECEIPTS]
│   │   ├── route → #/finance/payments?q=:paymentOrStudent
│   │   └── query meaning: payment number or student number
│   ├── [EDGE:LK-FINANCE-BILL]
│   │   ├── source: [TABLE:T-F-ACCOUNTS] Bill
│   │   ├── target: [PAGE:P-F-BILLING]
│   │   ├── route → #/finance/invoices?student=:studentName
│   │   └── target behavior: preselect student [PARTIAL]
│   ├── [EDGE:LK-PROGRAMME-COURSES]
│   │   ├── source: [TABLE:T-A-PROGRAMMES] Courses
│   │   ├── target: [PAGE:P-A-COURSES]
│   │   └── route → #/academics/courses?q=:programmeCode
│   ├── [EDGE:LK-PROGRAMME-ENROLMENTS]
│   │   ├── source: [TABLE:T-A-PROGRAMMES] Enrolments
│   │   ├── target: [PAGE:P-A-ENROLMENTS]
│   │   └── route → #/students/enrolments?q=:programmeName
│   ├── [EDGE:LK-COURSE-OFFERINGS]
│   │   ├── source: [TABLE:T-A-COURSES] Offerings
│   │   ├── target: [PAGE:P-A-OFFERINGS]
│   │   └── route → #/registration/offerings?q=:courseName
│   ├── [EDGE:LK-COURSE-RESULTS]
│   │   ├── source: [TABLE:T-A-COURSES] Results
│   │   ├── target: [PAGE:P-A-RESULTS]
│   │   └── route → #/results?q=:courseName
│   ├── [EDGE:LK-COHORT-ENROLMENTS]
│   │   ├── source: [TABLE:T-A-COHORTS] Enrolments
│   │   ├── target: [PAGE:P-A-ENROLMENTS]
│   │   └── route → #/students/enrolments?q=:cohortName
│   ├── [EDGE:LK-COHORT-REGISTRATIONS]
│   │   ├── source: [TABLE:T-A-COHORTS] Registrations
│   │   ├── target: [PAGE:P-A-COURSE-REG]
│   │   └── route → #/registration/courses?q=:cohortName
│   ├── [EDGE:LK-SEMESTER-REGISTRATIONS]
│   │   ├── source: calendar/year/semester record action
│   │   ├── target: [PAGE:P-A-SEMESTER-REG]
│   │   └── route → #/registration?q=:semesterName
│   ├── [EDGE:LK-FEE-STRUCTURE-INVOICES]
│   │   ├── source: [TABLE:T-A-FEE-STRUCTURES] Invoices
│   │   ├── target: [PAGE:P-A-INVOICES]
│   │   └── route → #/finance/invoices?q=:academicSemester
│   ├── [EDGE:LK-DETAILS-ERP]
│   │   ├── source: shared RecordsPage Details action
│   │   ├── target ⇱ ERPNext:/app/:doctypeSlug/:recordName
│   │   ├── tab: new
│   │   ├── rel: noopener,noreferrer
│   │   └── permission: ERPNext server validates user/integration request
│   ├── [EDGE:LK-MANAGE-ERP]
│   │   ├── source: shared RecordsPage Manage full records
│   │   ├── target ⇱ ERPNext:/app/:doctypeSlug
│   │   ├── tab: new
│   │   └── purpose: create/edit capabilities outside packaged frontend
│   ├── [EDGE:LK-TRANSCRIPT-PDF]
│   │   ├── sources: student transcript | registrar issuance | admin viewer
│   │   ├── target ⇱ FILE:generated_pdf
│   │   ├── tab: new
│   │   └── enabled-when: generated_pdf exists and document status permits
│   ├── [EDGE:LK-LOGOUT]
│   │   ├── sources: desktop bottom sidebar | mobile More sheet
│   │   ├── action: POST auth/logout
│   │   ├── target: [PAGE:P-LOGIN]
│   │   ├── route: #/login in current artifact
│   │   └── invariant: never redirect to JDD dashboard login
│   └── [TEST:Q-LINK-GRAPH]
│       ├── every internal target ID exists
│       ├── every parameterized route names its parameter source
│       ├── external links use a new tab safely
│       ├── no role links to a forbidden portal
│       └── logout remains artifact-relative
├── [STATE-MACHINES:SM-AWU] Interaction and page lifecycle contracts
│   ├── [MACHINE:SM-ASYNC-PAGE] Generic data page
│   │   ├── initial
│   │   │   └── transition: mount → loading
│   │   ├── loading
│   │   │   ├── success with rows → ready
│   │   │   ├── success without rows → empty
│   │   │   └── failure → error
│   │   ├── ready
│   │   │   ├── search change → filtering
│   │   │   ├── refresh → loading
│   │   │   └── mutation → submitting
│   │   ├── filtering
│   │   │   ├── matches → ready-filtered
│   │   │   └── no matches → filtered-empty
│   │   ├── submitting
│   │   │   ├── success → success-message → loading/ready
│   │   │   └── failure → mutation-error → ready
│   │   ├── empty
│   │   │   └── refresh → loading
│   │   └── error
│   │       └── retry → loading
│   ├── [MACHINE:SM-LOGIN] Login lifecycle
│   │   ├── idle
│   │   ├── entering credentials
│   │   ├── submitting
│   │   ├── authenticated → role resolver
│   │   └── rejected → error alert → entering credentials
│   ├── [MACHINE:SM-STUDENT-EDIT] Administrator student edit
│   │   ├── read-only
│   │   │   └── Edit Student → editing
│   │   ├── editing
│   │   │   ├── Cancel Edit → read-only
│   │   │   └── Save → saving
│   │   ├── saving
│   │   │   ├── success → saved → read-only
│   │   │   └── failure → edit-error → editing
│   │   └── invariant: route-selected student does not change during save
│   ├── [MACHINE:SM-RECEIPT] Receipt selection/preview
│   │   ├── no-selection
│   │   │   └── select row/semester → selected
│   │   ├── selected
│   │   │   ├── toggle selection → selected/no-selection
│   │   │   └── Preview → preparing
│   │   ├── preparing
│   │   │   ├── success → preview
│   │   │   └── failure → preview-error → selected
│   │   └── preview
│   │       ├── Print → browser print → preview
│   │       └── Close → selected
│   ├── [MACHINE:SM-ATTENDANCE] Lecturer attendance
│   │   ├── select offering
│   │   ├── select session
│   │   ├── select date
│   │   ├── edit per-student drafts
│   │   ├── save batch
│   │   ├── success → clear drafts + refresh
│   │   └── failure → preserve drafts + error message
│   ├── [MACHINE:SM-MARKS] Lecturer marks
│   │   ├── select assessment
│   │   ├── prefill saved marks
│   │   ├── edit mark/comment drafts
│   │   ├── save provisional marks
│   │   ├── success → clear drafts + refresh
│   │   └── submit course results occurs in separate approval workflow
│   ├── [MACHINE:SM-RESULT-WORKFLOW] Controlled result lifecycle
│   │   ├── Lecturer
│   │   │   ├── create assessment marks
│   │   │   ├── calculate provisional course results
│   │   │   └── Submit for Review → batch Submitted
│   │   ├── Faculty Head
│   │   │   ├── Return for Correction → batch Rejected
│   │   │   └── Approve Results → batch Approved at Faculty Head stage
│   │   └── Registrar
│   │       ├── confirmation dialog
│   │       └── Publish Results → result.is_published = true
│   ├── [MACHINE:SM-TRANSCRIPT-WORKFLOW] Controlled transcript lifecycle
│   │   ├── Draft / Faculty Head Review
│   │   ├── Faculty Head
│   │   │   ├── Return → Draft
│   │   │   └── Certify → Faculty Head Approved
│   │   ├── Registrar
│   │   │   ├── Issue → Registrar Issued + verification/PDF
│   │   │   └── Revoke with reason → Revoked
│   │   └── Student
│   │       └── sees only approved/issued document allowed by backend
│   ├── [MACHINE:SM-SPONSORSHIP] Sponsorship lifecycle
│   │   ├── Draft → Approve → Approved
│   │   ├── Approved → Activate → Active
│   │   ├── Draft/Approved/Active → Cancel → Cancelled
│   │   └── Exhausted/Cancelled → no action buttons
│   ├── [MACHINE:SM-INVOICE] Finance invoice lifecycle
│   │   ├── select student
│   │   ├── select approved fee structure
│   │   ├── Create Draft → draft invoice
│   │   ├── review draft row
│   │   ├── Submit → posted invoice
│   │   └── posted invoice → no Submit button
│   └── [MACHINE:SM-MOBILE-MORE] Mobile More overlay
│       ├── closed
│       │   └── More button → open
│       └── open
│           ├── backdrop → closed
│           ├── close button → closed
│           ├── destination → navigate + closed
│           └── sign out → [PAGE:P-LOGIN]
├── [PERMISSION-MATRIX:PM-AWU] Role visibility and action authority
│   ├── Administrator
│   │   ├── view: all administrator routes
│   │   ├── settings: yes
│   │   ├── student edit: yes, subject to ERPNext permission
│   │   ├── record Details/Manage links: yes
│   │   └── dedicated role portals: no direct navigation
│   ├── Student
│   │   ├── view: own profile/academic/finance/result/document/clearance data
│   │   ├── edit official profile: no
│   │   ├── view unpublished results: no
│   │   ├── view unapproved transcript: no
│   │   └── print own receipt: yes
│   ├── Lecturer
│   │   ├── view: assigned offerings and enrolled class students
│   │   ├── attendance mutation: yes
│   │   ├── marks mutation: yes
│   │   ├── submit approval batch: yes
│   │   ├── faculty approval: no
│   │   └── registrar publication: no
│   ├── Faculty Head
│   │   ├── view: scoped units/programmes/people/results/transcripts
│   │   ├── approve/return result batches: yes
│   │   ├── resolve result reviews: yes
│   │   ├── certify/return transcripts: yes
│   │   ├── issue transcripts: no
│   │   └── publish results: no
│   ├── Registrar
│   │   ├── institution-wide academic records: yes
│   │   ├── admissions decisions: yes
│   │   ├── registration decisions: yes
│   │   ├── publish approved results: yes
│   │   ├── issue/revoke transcripts: yes
│   │   └── finance invoice mutation: no
│   ├── Finance
│   │   ├── student account visibility: yes
│   │   ├── create/submit invoices: yes
│   │   ├── sponsorship lifecycle: yes
│   │   ├── refresh financial clearance: yes
│   │   ├── academic approval/publication: no
│   │   └── transcript issuance: no
│   ├── Shared-link application session
│   │   ├── roles: manifest.sharedLinkRoles
│   │   ├── business: fixed by share link
│   │   ├── release: fixed/follows configured channel
│   │   ├── tenant override from browser: forbidden
│   │   └── revocation: invalidates link and derived sessions
│   └── [TEST:Q-PERMISSIONS]
│       ├── hidden navigation cannot be reached through role shell
│       ├── direct route falls back to role home
│       ├── mutation endpoints enforce server-side scope
│       ├── browser-supplied business cannot override session
│       └── revoked share link loses active access
├── [DATA-LINEAGE:DL-AWU] Entities, calculations, and transport
│   ├── [DATA:DT-STUDENT]
│   │   ├── entity: Student
│   │   ├── consumers: directories | profiles | search | role providers
│   │   └── key: name; display identifiers: student_name/student_number
│   ├── [DATA:DT-ENROLMENT]
│   │   ├── entity: Student Programme Enrolment
│   │   ├── consumers: profiles | cohorts | programme metrics | registrar/faculty
│   │   └── active-selection rule: status=Active first, else first record
│   ├── [DATA:DT-SEMESTER-REG]
│   │   ├── entity: Semester Registration
│   │   ├── consumers: student registration | registrar approval | dashboard metrics
│   │   └── relation: student_programme_enrolment + academic_semester
│   ├── [DATA:DT-COURSE-REG]
│   │   ├── entity: Course Registration
│   │   ├── consumers: student courses | lecturer class/attendance/marks
│   │   └── relations: semester_registration + course_offering + student
│   ├── [DATA:DT-OFFERING]
│   │   ├── entity: Course Offering
│   │   ├── consumers: lecturer/faculty/registrar/registration
│   │   └── relations: course + semester + cohort + lecturer assignments
│   ├── [DATA:DT-TIMETABLE]
│   │   ├── entity: Teaching Timetable Entry
│   │   ├── consumers: student/lecturer schedule and attendance
│   │   └── relation: course_offering
│   ├── [DATA:DT-ATTENDANCE]
│   │   ├── entity: Student Attendance
│   │   ├── consumers: student record | lecturer entry
│   │   └── uniqueness context: registration + timetable entry + date
│   ├── [DATA:DT-INVOICE]
│   │   ├── entity: Sales Invoice
│   │   ├── consumers: balances | billing | analysis | dashboards | clearance
│   │   ├── assessed: grand_total
│   │   ├── outstanding: outstanding_amount
│   │   ├── paid: grand_total - outstanding_amount
│   │   └── account status
│   │       ├── balance=0 and assessed>0 → Paid
│   │       ├── 0<balance<assessed → Partly Paid
│   │       ├── balance=assessed → Outstanding
│   │       └── assessed=0 → Not Billed
│   ├── [DATA:DT-PAYMENT]
│   │   ├── entity: Payment Entry
│   │   ├── consumers: receipts | reconciliation | student finance
│   │   ├── amount: received_amount fallback paid_amount
│   │   └── allocations: Payment Entry Reference
│   ├── [DATA:DT-FEE-STRUCTURE]
│   │   ├── entity: University Fee Structure
│   │   ├── consumers: structure review | invoice creation | financial analysis
│   │   └── total: SUM(fee_line.quantity × fee_line.rate)
│   ├── [DATA:DT-RESULT]
│   │   ├── entity: Student Course Result
│   │   ├── consumers: lecturer | faculty | registrar | student | transcript
│   │   ├── lifecycle fields: result_status | is_approved | is_published
│   │   └── assessment child rows: assessment_marks
│   ├── [DATA:DT-BATCH]
│   │   ├── entity: Result Approval Batch
│   │   ├── consumers: lecturer submissions | faculty decisions | registrar publication
│   │   └── lifecycle: Submitted → Approved/Rejected → Published outcome
│   ├── [DATA:DT-TRANSCRIPT]
│   │   ├── entity: Academic Transcript
│   │   ├── consumers: admin viewer | faculty review | registrar issue | student document
│   │   ├── control fields: status | verification_number | generated_pdf
│   │   └── lifecycle: faculty certification → registrar issuance/revocation
│   ├── [DATA:DT-CLEARANCE]
│   │   ├── entity: Student Clearance
│   │   ├── consumers: student | faculty | registrar | finance
│   │   ├── component statuses: financial_status | academic_status
│   │   └── overall: status
│   ├── [DATA:DT-TRANSPORT]
│   │   ├── browser request: /app-api/apps/:appSlug/erpnext/api/*
│   │   ├── JDD validates application session/share session
│   │   ├── JDD resolves business and physical ERPNext site
│   │   ├── JDD loads encrypted server-side API credential
│   │   ├── JDD executes ERPNext request
│   │   └── browser receives authorized response only
│   └── [TEST:Q-DATA]
│       ├── all monetary metrics declare formula and currency
│       ├── all role providers filter by server-resolved identity/scope
│       ├── empty/null values have visible fallback
│       └── status mappings match entity lifecycle
├── [RESPONSIVE-SYSTEM:RS-AWU] Layout and breakpoint contracts
│   ├── desktop
│   │   ├── persistent left sidebar
│   │   ├── persistent topbar
│   │   ├── contextual subtabs under topbar for administrator
│   │   ├── content uses page-stack vertical rhythm
│   │   ├── metric grids: up to four/five columns
│   │   └── tables: full schema visible where viewport permits
│   ├── tablet target [PARTIAL/PROPOSED]
│   │   ├── collapsed or narrower sidebar
│   │   ├── wrapped topbar search/actions
│   │   ├── metric grids: two columns
│   │   ├── split panels may remain two columns when usable
│   │   └── tables: horizontal scrolling
│   ├── mobile
│   │   ├── desktop sidebar/topbar hidden
│   │   ├── mobile header shown
│   │   ├── bottom navigation fixed/visible
│   │   ├── More sheet holds secondary destinations
│   │   ├── metric grids stack one/two columns
│   │   ├── hero actions wrap/stack
│   │   ├── cards become single-column
│   │   └── tables currently scroll; card-row conversion recommended
│   ├── table priority target
│   │   ├── priority-1: primary identity
│   │   ├── priority-2: status/key amount
│   │   ├── priority-3: primary action
│   │   ├── lower priority: hidden behind row details on mobile
│   │   └── actions: overflow menu when more than two [PROPOSED]
│   ├── sticky/scroll target
│   │   ├── sidebar: viewport-height fixed
│   │   ├── topbar: sticky [verify styling]
│   │   ├── subtab strip: horizontal scroll on narrow screens
│   │   ├── table header: sticky for long datasets [PROPOSED]
│   │   └── first/action columns: sticky where horizontal scroll [PROPOSED]
│   └── [TEST:Q-RESPONSIVE]
│       ├── no navigation destination disappears between breakpoints
│       ├── no primary button is clipped
│       ├── tables retain identity/status/action access
│       ├── More sheet is reachable one-handed
│       └── 320px viewport has no page-level horizontal overflow except tables
├── [ACCESSIBILITY:A11Y-AWU] Accessibility contract
│   ├── semantics
│   │   ├── one H1 per page
│   │   ├── headings follow hierarchy
│   │   ├── nav elements have role-specific aria-labels
│   │   ├── tables use thead/tbody/th
│   │   ├── forms use visible labels
│   │   └── meaningful links use descriptive text
│   ├── keyboard
│   │   ├── every action reachable by Tab
│   │   ├── visible focus indicator
│   │   ├── Global Search supports Up/Down/Enter/Escape
│   │   ├── native details/summary supports keyboard toggle
│   │   ├── dialogs close with Escape [PROPOSED where custom]
│   │   └── no hover-only action
│   ├── focus management
│   │   ├── route change moves focus to page H1 [PROPOSED]
│   │   ├── mobile More traps focus [PROPOSED]
│   │   ├── closing preview returns focus to trigger [PROPOSED]
│   │   ├── form error focuses/announces summary [PROPOSED]
│   │   └── browser prompts provide native focus behavior
│   ├── names and descriptions
│   │   ├── icon-only buttons require aria-label
│   │   ├── notification icon requires destination/status
│   │   ├── table selection identifies payment row
│   │   ├── status meaning included as text
│   │   └── decorative icons/images hidden or empty-alt
│   ├── live feedback
│   │   ├── errors: role=alert
│   │   ├── success/busy updates: aria-live polite [PROPOSED]
│   │   ├── loading state: aria-busy [PROPOSED]
│   │   └── result counts announced after search [PROPOSED]
│   ├── visual
│   │   ├── WCAG AA text contrast target
│   │   ├── status never colour-only
│   │   ├── minimum target size 44×44px on touch
│   │   ├── text zoom to 200% without information loss
│   │   └── reduced-motion preference respected [PROPOSED]
│   └── [TEST:Q-A11Y]
│       ├── automated axe scan per routed page
│       ├── full keyboard journey per role
│       ├── screen-reader labels for icon controls
│       ├── contrast check for every status tone
│       └── focus restoration for sheets/previews
├── [TRACEABILITY:TR-AWU] Source, coverage, and quality governance
│   ├── canonical route sources
│   │   ├── Administrator: frontend/src/App.tsx
│   │   ├── Student: frontend/src/roles/student/StudentApp.tsx
│   │   ├── Lecturer: frontend/src/roles/lecturer/LecturerApp.tsx
│   │   ├── Faculty Head: frontend/src/roles/faculty-head/FacultyApp.tsx
│   │   ├── Registrar: frontend/src/roles/registrar/RegistrarApp.tsx
│   │   └── Finance: frontend/src/roles/finance/FinanceApp.tsx
│   ├── canonical navigation sources
│   │   ├── Administrator: frontend/src/roles/admin/roleConfig.ts
│   │   ├── Student: frontend/src/roles/student/roleConfig.ts
│   │   ├── Lecturer: frontend/src/roles/lecturer/roleConfig.ts
│   │   ├── Faculty Head: frontend/src/roles/faculty-head/roleConfig.ts
│   │   ├── Registrar: frontend/src/roles/registrar/roleConfig.ts
│   │   └── Finance: frontend/src/roles/finance/roleConfig.ts
│   ├── implementation labels
│   │   ├── source path attached to every complex page contract
│   │   ├── route attached to every routed page
│   │   ├── entity attached to every data-heavy page
│   │   ├── columns attached to every implemented table
│   │   ├── fields attached to every implemented form
│   │   └── action condition attached to controlled mutations
│   ├── known inactive controls
│   │   ├── notification buttons in all shells
│   │   ├── Administrator bottom Profile button
│   │   ├── Registrar top/bottom Profile buttons
│   │   └── Finance top/bottom Profile buttons
│   ├── known structural gaps
│   │   ├── no shared third-level sub-sub-tab component
│   │   ├── role portals use flat sidebars rather than contextual subtabs
│   │   ├── some browser prompts should become accessible application dialogs
│   │   ├── table mobile-card transformation not standardized
│   │   ├── notification centre not implemented
│   │   └── profile destination missing for Registrar and Finance
│   ├── proposed automated map checks
│   │   ├── parse every `<Route path>` and require [PAGE] node
│   │   ├── parse every `<th>` and require matching [COLUMN]
│   │   ├── parse every metric label and require [METRIC]
│   │   ├── parse every button/link and require action/status
│   │   ├── parse every input/select and require [FIELD]
│   │   ├── detect window.prompt/confirm and require [DIALOG]
│   │   └── fail documentation check when source route is unmapped
│   ├── release review checklist
│   │   ├── update version/date
│   │   ├── compare route inventory
│   │   ├── compare navigation labels
│   │   ├── compare table columns
│   │   ├── compare mutations/dialogs
│   │   ├── verify responsive behavior
│   │   ├── verify role visibility
│   │   ├── verify links/cross-references
│   │   └── record known gaps
│   └── definition of done for a mapped page
│       ├── stable page ID
│       ├── route
│       ├── source file
│       ├── role/permission
│       ├── layout
│       ├── containers/components
│       ├── metrics and calculations
│       ├── tables and column contracts
│       ├── forms and field contracts
│       ├── buttons/links and target edges
│       ├── states and transitions
│       ├── data/API lineage
│       ├── responsive behavior
│       ├── accessibility behavior
│       └── acceptance tests
└── [TARGET-HIERARCHY:TH-AWU] Structurally sound UX hierarchy
    └── Product
        ├── Entry and authentication
        ├── Shared component definitions
        ├── Persistent shell
        ├── Role portal
        │   ├── Primary sidebar destination
        │   │   ├── Contextual workspace subtab
        │   │   │   ├── Page-level sub-sub-tab [PROPOSED shared component]
        │   │   │   │   ├── Page state
        │   │   │   │   │   ├── Layout region
        │   │   │   │   │   │   ├── Container/card
        │   │   │   │   │   │   │   ├── Metric/table/form/list
        │   │   │   │   │   │   │   │   ├── Field/column/status
        │   │   │   │   │   │   │   │   └── Button/link
        │   │   │   │   │   │   │   └── Empty/loading/error feedback
        │   │   │   │   │   │   └── Responsive variant
        │   │   │   │   │   └── Permission and data scope
        │   │   │   │   └── Interaction edge to another target
        │   │   │   └── Route and source traceability
        │   │   └── Mobile navigation equivalent
        │   └── Bottom action dock
        ├── Cross-page interaction graph
        ├── State-machine registry
        ├── Permission matrix
        ├── Data/API lineage
        ├── Responsive system
        ├── Accessibility contract
        └── QA and source traceability
```

## Phase 1 implementation overlay — shared shell and three-level navigation

Implementation status: complete. This overlay supersedes every earlier `[PROPOSED shared component]` marker for the application shell, sub-sub-tabs, shared states, and role navigation.

```text
[COMPONENT:C-APPLICATION-SHELL] ApplicationShell
├── [MODEL:M-SHELL-PROPS] Shell contract
│   ├── session: UniversitySession
│   ├── navigation: ShellNavItem[]
│   ├── subtabs: ShellTab[]
│   ├── subSubtabs: ShellTab[]
│   ├── portalLabel + profilePath + roleKey
│   ├── contextualActions: ReactNode
│   └── children: active route page
├── [REGISTRY:R-ROLE-NAVIGATION] navigationRegistry.ts
│   ├── administrator → adminNavigation
│   ├── registrar → registrarNavigation
│   ├── faculty-head → facultyHeadNavigation
│   ├── lecturer → lecturerNavigation
│   ├── finance → financeNavigation
│   ├── student → studentNavigation
│   └── staff → Overview only
├── [REGION:RG-DESKTOP-TOPBAR] Desktop topbar
│   ├── [COMPONENT:C-GLOBAL-SEARCH] GlobalSearch
│   ├── [BUTTON:B-NOTIFICATIONS] Notifications
│   │   ├── icon: Bell [coloured shared icon language]
│   │   ├── tooltip/title: Notifications
│   │   └── aria-label: Notifications
│   └── [BUTTON:B-PROFILE-CHIP] Profile
│       ├── avatar initials
│       ├── full name + role label
│       └── link → role profilePath
├── [REGION:RG-DESKTOP-SIDEBAR] Desktop sidebar
│   ├── AWU logo + role portal label
│   ├── [NAV:N-PRIMARY] role-filtered primary destinations
│   │   ├── coloured category icon
│   │   ├── label + tooltip + aria-label
│   │   ├── route active state
│   │   └── query state: ?primary=:primarySlug
│   └── [DOCK:D-SIDEBAR-ACTIONS] bottom action dock
│       ├── [BUTTON:B-PROFILE] Profile
│       ├── [BUTTON:B-SETTINGS] Settings [administrator]
│       └── [BUTTON:B-LOGOUT] Sign out
├── [REGION:RG-MOBILE-HEADER] Mobile header
│   ├── AWU brand + current destination
│   ├── [BUTTON:B-MOBILE-SEARCH] Search
│   ├── [BUTTON:B-MOBILE-NOTIFICATIONS] Notifications
│   └── [BUTTON:B-MOBILE-MENU] Menu
├── [REGION:RG-WORKSPACE] Workspace
│   ├── [COMPONENT:C-BREADCRUMB] portalLabel / current destination
│   ├── [NAV:N-SUBTABS] contextual subtabs
│   │   ├── no layout gap above next row
│   │   ├── horizontal mobile overflow
│   │   ├── active route state
│   │   └── query state: ?tab=:tabSlug
│   ├── [NAV:N-SUB-SUB-TABS] view navigation
│   │   ├── All
│   │   ├── Active
│   │   ├── Needs attention
│   │   ├── directly adjacent to subtab row
│   │   ├── horizontal mobile overflow
│   │   └── query state: ?subtab=:viewSlug
│   ├── [COMPONENT:C-SHELL-PAGE-HEADING] Page context
│   │   ├── coloured current-route icon
│   │   ├── descriptive portal eyebrow
│   │   ├── focus-managed page title
│   │   ├── contextual action slot
│   │   └── development route trace
│   └── [REGION:RG-ROUTE-PAGE] Existing route output
│       ├── metrics remain page-owned
│       ├── tables remain page-owned until Phase 2 DataWorkbench
│       ├── forms/modals/drawers remain page-owned until their scheduled phases
│       └── every administrator/student/lecturer/faculty/registrar/finance route renders here
├── [NAV:N-MOBILE-BOTTOM] Mobile bottom navigation
│   ├── first four role destinations
│   └── [BUTTON:B-MORE] More
│       └── [SHEET:S-MOBILE-MORE] overflow destinations + Sign out
├── [COMPONENT:C-SHELL-STATE-PANEL] Shared route states
│   ├── [STATE:ST-LOADING] skeleton + live status
│   ├── [STATE:ST-EMPTY] empty result guidance
│   ├── [STATE:ST-ERROR] alert feedback
│   └── [STATE:ST-PERMISSION] permission-denied guidance
├── [REGISTRY:R-ICON-MAP] universityIconMap
│   ├── entities: student | students | programme | course | finance | transcript
│   ├── navigation: explorer | search
│   ├── actions: create | edit | import | export | history | archive
│   └── states: success | warning | error | permission
└── [ACCESSIBILITY:A-SHELL]
    ├── focus moves to page title on pathname/query navigation
    ├── icon-only buttons have aria-label
    ├── navigation icons have visible labels and title tooltips
    ├── state panels use status/alert and aria-live
    └── browser back/forward restores route and query-selected navigation

[FORM-IMPACT:FI-PHASE-1]
├── No business entity form schema changed in Phase 1
├── Existing create/update forms continue inside RG-ROUTE-PAGE
├── Modal/drawer conversion remains governed by Phase 0 link classification
└── Phase 2/3 will map each table/form into DataWorkbench and native record surfaces
```

## Phase 2 implementation overlay — native Data Workbench

```text
[COMPONENT:C-DATA-WORKBENCH] DataWorkbench(schema, loadPage, actions)
├── [MODEL:M-WORKBENCH-SCHEMA]
│   ├── entity + title + description
│   ├── columns[]: field | label | optional renderer
│   ├── searchFields[] [server allowlisted]
│   ├── defaultSort
│   ├── allowImport
│   └── quickFilters[]
├── [QUERY:Q-WORKBENCH] URL-serialized state
│   ├── q: debounced server text search
│   ├── filters: advanced filter JSON
│   ├── sort + order
│   ├── page + pageSize: 25 | 50 | 100 | 2000
│   ├── columns: selected ordered fields
│   ├── density: compact | comfortable | spacious
│   └── primary + tab + subtab preserved from ApplicationShell
├── [API:A-FETCH-LIST-PAGE] fetchListPage
│   ├── limit_start = (page - 1) × pageSize
│   ├── limit_page_length = pageSize [default 50]
│   ├── order_by = allowlisted field + direction
│   ├── filters = AND filters
│   ├── or_filters = server-side text search across searchFields
│   ├── AbortSignal cancellation
│   └── hasNext from returned page length
├── [TOOLBAR:T-WORKBENCH]
│   ├── [INPUT:I-SERVER-SEARCH] debounced search
│   ├── [BUTTON:B-FILTERS] advanced filter builder
│   ├── [BUTTON:B-COLUMNS] visibility + order manager
│   ├── [SELECT:S-DENSITY] compact | comfortable | spacious
│   ├── [GROUP:G-EXPORT]
│   │   ├── current page CSV
│   │   ├── selected rows CSV
│   │   └── all filtered CSV [bounded at 10,000]
│   ├── [BUTTON:B-IMPORT] import wizard or disabled permission state
│   ├── [BUTTON:B-SAVE-VIEW] save URL state to localStorage
│   └── [BUTTON:B-LOAD-VIEW] restore named saved view
├── [FILTERS:F-WORKBENCH]
│   ├── quick chips: Active | Draft | Completed where status exists
│   └── advanced rows: field | operator | value | remove
├── [TABLE:TB-WORKBENCH]
│   ├── caption for screen readers
│   ├── select-all checkbox
│   ├── sortable column headers
│   ├── selected-row checkboxes
│   ├── native rendered values/status pills
│   └── [COLUMN:COL-ACTIONS]
│       ├── [BUTTON:B-VIEW] native Record Drawer
│       └── up to two contextual native route actions
├── [BAR:BR-BULK] selected count | export selection | clear
├── [PAGINATION:P-WORKBENCH]
│   ├── Previous
│   ├── current page + returned row count
│   ├── page-size selector 25 | 50 | 100 | 2000
│   └── Next [disabled when hasNext=false]
├── [DRAWER:D-RECORD] native read-only record details
│   ├── entity + record identity
│   ├── schema columns as definition list
│   └── close button/backdrop
├── [MODAL:M-IMPORT-WIZARD]
│   ├── CSV selection
│   ├── 10 MiB size validation
│   ├── selected file summary
│   └── validation-before-commit contract
├── [STATE:ST-WORKBENCH]
│   ├── loading skeleton
│   ├── empty
│   ├── error + retry
│   └── stale response ignored by request sequence
└── [RESPONSIVE:R-WORKBENCH]
    ├── horizontally scrollable semantic table
    ├── stacked toolbar/filter builder/pagination on mobile
    ├── full-width mobile record drawer
    └── labelled controls and icon buttons

[ROUTE-MIGRATION:RM-PHASE-2]
├── /students → Student Directory
├── /students/applications → Applications
├── /students/cohorts → Cohorts
├── /academics → Programmes
├── /finance/invoices → Invoices
├── /results → Results
└── all remaining administrator RecordsPage views use the same native workbench contract

[DESK-LINK-REMOVAL:DLR-PHASE-2]
├── Generic record Details → native Record Drawer
├── Manage full records → removed
├── Global Search student/course/programme/transcript actions → native routes
└── normal-user ERPNext Desk navigation remaining in React source: none
```

## Phase 4 implementation overlay — Administrator lifecycle experience

```text
[PORTAL:P-ADMIN-PHASE-4] Native administrator lifecycle
├── [NAV:N-ADMIN-SUBSUBTABS] URL-backed third-level navigation
│   ├── Student Directory → All | Active | On Leave | Completed | Withdrawn | Saved views
│   ├── Applications → All | Draft | Under Review | Admitted | Rejected
│   ├── Academic structure → All | Active | Archived | Effective year
│   └── Governance → approval, issuance, revocation and clearance states
├── [COMPONENT:C-DATA-WORKBENCH-P4] DataWorkbench
│   ├── search + advanced field filters + quick filters
│   ├── sortable/reorderable columns + 25 | 50 | 100 | 2000 pagination
│   ├── page | selected | all-filtered export
│   ├── approved CSV template + 10 MiB validation + native import
│   └── custom lifecycle drawer and create-action slots
├── [DIALOG:D-ADMIN-RECORD-FORM] Student, Application and academic structure forms
├── [DIALOG:D-GUARDIAN-CONTACT] Contact modal linked to current Student
├── [DRAWER:D-ADMIN-RECORD] Rich lifecycle drawer
│   ├── Student → Profile | Enrolment | Finance | Results | Documents | Activity
│   ├── Programme → Profile | Cohorts | Offerings | Students | Activity
│   ├── Offering → timetable | lecturer assignment context
│   └── Cohort → Add student with cohort context
├── [WORKFLOW:W-ADMIN-GOVERNANCE]
│   ├── Application → review | admit/create student | reject
│   ├── Result batch → publish
│   ├── Transcript → issue | revoke with reason
│   ├── Clearance → recalculate/review
│   └── Invoice/sponsorship → guarded finance transitions
├── [API:A-ADMIN-ACADEMIC-QUERY] query_admin_academic_records
│   ├── entity and field allowlists + ERPNext read permission check
│   ├── faculty/unit → programme/course/curriculum/cohort/offering resolution
│   ├── programme/year/semester/cohort → offering relationship resolution
│   └── lecturer → Course Offering Lecturer parent resolution
├── [DATA:DT-UNIVERSITY-AUDIT-EVENT] Persistent lifecycle audit
│   ├── entity | record | action | reason | actor | event time
│   ├── server-side entity/action allowlists and record permission check
│   ├── redacted metadata only
│   └── drawer Activity tab loads server timeline; bounded browser fallback remains
└── [SECURITY:S-ADMIN-PHASE-4]
    ├── no ERPNext Desk navigation or browser credentials
    ├── create/update enforced by ERPNext document permissions
    └── transitions enforced by whitelisted role-aware University methods

[DEPLOYMENT:D-PHASE-4]
├── deploy updated University ERPNext app
├── run bench migrate to create University Audit Event
├── build/upload the matching immutable JDD frontend release
└── verify relational filters and audit timeline against the assigned business site
```

## Phase 5 implementation overlay — Lecturer scope foundation

```text
[PORTAL:P-LECTURER-PHASE-5] Assigned teaching workspace
├── [COMPONENT:C-LECTURER-SCOPE-BAR]
│   ├── search → assigned student | offering | course | timetable session
│   ├── semester selector → assigned semesters only
│   ├── offering selector → assigned offerings only
│   ├── page size → 25 | 50 | 100 | 2000
│   ├── previous/next page
│   ├── export class list
│   └── export marks template [no result-workflow import]
├── [DRAWER:D-LECTURER-OFFERING]
│   ├── course | semester | cohort | teaching role
│   ├── roster and timetable metrics
│   └── attendance | assessments | marks/results | result batches
├── [STORE:S-LECTURER-SCOPE] persistent local scope
└── [PERMISSION:P-LECTURER-SCOPE] source remains get_lecturer_portal_data
    ├── backend resolves current University Member from authenticated user
    └── unassigned offerings and students never enter the browser dataset

[TREE:T-LECTURER-EXPLORER]
└── My Offerings
    └── Assigned Offering [course | semester | status]
        └── Course Registration [student | number | registration status]
            └── Student [read-only assigned-class destination]

[STORE:S-LECTURER-MARKS-DRAFT]
├── key: awu-lecturer-marks-drafts
├── payload: registration → mark + lecturer comment
└── survives route changes and browser refresh until server save

[DIALOG:D-LECTURER-ATTENDANCE]
├── offering selector → assigned offerings only
├── timetable-session selector + attendance date
├── bulk roster grid → Present | Absent | Late | Excused + remarks
├── validation → date + session + non-empty assigned class
└── save → save_lecturer_attendance + success/error feedback

[PAGE:P-LECTURER-MARKS-V2]
├── assessment component selector
├── registration-scoped marks grid
├── assessment-specific local drafts [mark + comment]
├── validation → at least one mark + finite range 0..maximum
├── Save provisional → save_lecturer_marks
└── Submit offering → explicit confirmation → submit_lecturer_results
```

## Phase 3 implementation overlay — Tree Explorer and Global Search

```text
[COMPONENT:C-UNIVERSITY-EXPLORER] UniversityExplorer
├── [BUTTON:B-OPEN-EXPLORER] topbar/mobile FolderTree icon
├── [DIALOG:D-EXPLORER] left-side modal explorer panel
│   ├── focus on open
│   ├── Escape/backdrop close
│   └── restore focus to opener
├── [ROOT:R-AWU] Ankole Western University
│   ├── [GROUP:G-STUDENTS] Students and cohorts
│   │   ├── Cohorts → lazy 25-row page
│   │   │   └── Cohort → lazy programme enrolments
│   │   └── Students → lazy 25-row page → native profile
│   ├── [GROUP:G-ACADEMICS] Academic structure
│   │   ├── Programmes → lazy page → DataWorkbench drawer
│   │   └── Courses → lazy page → DataWorkbench drawer
│   ├── [GROUP:G-REGISTRATION] Teaching and registration
│   │   ├── Course Offerings
│   │   └── Programme Enrolments
│   ├── [GROUP:G-FINANCE] Finance → Student Invoices
│   ├── [GROUP:G-RESULTS] Results → Course Results
│   └── [GROUP:G-TRANSCRIPTS] Transcripts → Academic Transcripts
├── [NODE:N-EXPLORER]
│   ├── chevron + coloured type icon
│   ├── label + metadata/status
│   ├── pin/unpin
│   ├── open native destination
│   ├── create-context action when permitted
│   └── ArrowRight | ArrowLeft | Enter keyboard behavior
├── [STORE:S-EXPLORER]
│   ├── localStorage pins [maximum 12]
│   └── localStorage recent nodes [maximum 8]
└── [PERMISSION:P-DISCOVERY]
    ├── administrator: full University entity discovery
    ├── registrar: academic record discovery
    ├── finance: Student + Invoice discovery
    ├── faculty-head: navigation only until faculty server scope exists
    ├── lecturer: navigation only until assignment server scope exists
    ├── student: navigation only; no unscoped record discovery
    └── staff: no explorer roots

[API:A-UNIVERSITY-DISCOVERY] universityDiscovery.ts
├── explorerRoots(role)
├── loadExplorerChildren(node, role, AbortSignal)
│   ├── lazy entity requests
│   ├── pageSize 25
│   ├── server filters for child relationships
│   └── roleEntities deny-by-default gate
├── searchUniversity(query, role, AbortSignal)
│   ├── parallel allowlisted entity queries
│   ├── maximum five records per entity
│   ├── request cancellation
│   └── role/entity intersection before network calls
└── auditDiscovery(event, metadata)
    ├── events: search | tree_open | tree_select | search_select
    ├── stores query length, never raw query
    ├── removes URL query from audited route
    ├── bounded local audit fallback [100]
    └── best-effort JDD audit beacon

[COMPONENT:C-GLOBAL-SEARCH-V2] Grouped global search
├── [INPUT:I-GLOBAL-SEARCH] Ctrl/Cmd+K focus shortcut
├── 280 ms debounce + AbortController + stale request ID
├── [GROUP:SG-NAVIGATION] permitted portal destinations
├── [GROUP:SG-RECORDS] Student | Cohort | Offering | Invoice | Result | Transcript
├── [GROUP:SG-TREE] matching hierarchy nodes
├── [GROUP:SG-ACTIONS] permitted quick-create/action destinations
├── [GROUP:SG-HELP] workbench help
├── ArrowDown | ArrowUp | Enter | Escape
├── focus restoration after close/selection
└── [DEEPLINK:DL-SEARCH]
    ├── searchResult=:resultId
    ├── tree=university/:entity/:recordId
    ├── record=:recordId opens DataWorkbench drawer
    └── route/query survives refresh and browser history

[SECURITY:S-DISCOVERY]
├── Browser role cannot add entities outside roleEntities
├── Student/lecturer/faculty record discovery remains closed without server scope
├── normal-user ERPNext Desk links: none
└── audit metadata excludes names, raw searches, credentials and record payloads
```
