# University Phase 0 — Architecture and API Contract

Status: implementation baseline

This document freezes the first University application contract. The server-side source of truth is `server/universityPhase0.mjs` in `jdd-business-management`; the frontend must use these entity names and must not construct ERPNext Desk URLs.

## 1. Frozen application entity catalogue

| Entity | ERPNext source | Native destination | Primary relations |
|---|---|---|---|
| Student | Student | drawer; full native page | guardian, enrolments, registrations, results, invoices, payments, transcript, clearance |
| Application | Student Applicant | drawer/modal; native review page | student, programme |
| Guardian/contact | Guardian | drawer/modal | student |
| Programme | Academic Programme | native page | courses, cohorts, enrolments |
| Course | Course | native page | offerings, results |
| Cohort | Student Cohort | native page | students, enrolments, registrations |
| Enrolment | Student Programme Enrolment | drawer/native page | student, programme, cohort |
| Registration | Course Registration | drawer/native page | student, offering |
| Offering | Course Offering | native page | course, registrations, attendance, results |
| Attendance | Student Attendance | native page | student, registration, offering |
| Result | Student Course Result | drawer/native page | student, registration, offering, transcript |
| Invoice | Sales Invoice | native page | student, payments |
| Payment | Payment Entry | drawer/modal; native receipt page | student, invoice |
| Transcript | Academic Transcript | native page | student, results, clearance |
| Clearance | Student Clearance | drawer/native page | student, transcript, invoice |

The allowlisted fields, actions, relations, roles, limits, error codes, and audit event names are executable in `universityPhase0.mjs`. Fields not in that contract are denied by default.

## 2. Existing Desk-link classification

The current `UX_MAP.md` contains these Desk destinations. They are classified as follows:

| Current UX map destination | Decision | Replacement |
|---|---|---|
| `ERPNext:/app/:doctype/:name` record Details | replace with drawer initially; native page when the record is opened from the explorer | `/university/entities/:entity/:id` |
| `ERPNext:/app/:doctype` Manage full records | replace with native page | `/university/entities/:entity` |
| Student Details `ERPNext:/app/student/:name` | replace with drawer/native Student page | `/university/entities/Student/:id` |
| Student Manage full records `ERPNext:/app/student` | replace with native Student page | `/university/entities/Student` |
| Generic RecordsPage Details | replace with drawer | native record drawer with `View`, `Edit`, and related tabs |
| Generic RecordsPage Manage full records | replace with native page | native paginated table, filters, import/export |

No normal user should be sent to ERPNext Desk. The old links remain in `UX_MAP.md` only as migration evidence until the replacement page is shipped and verified. After that, remove the links from the frontend source and retain only this classification record.

## 3. Query contract

Every native table uses:

```json
{
  "search": "optional text",
  "filters": [{"field":"status","operator":"=","value":"Active"}],
  "sort": "modified desc",
  "cursor": "optional opaque cursor",
  "pageSize": 50,
  "selectedColumns": ["name", "status"],
  "includeRelations": ["programme"]
}
```

Allowed page sizes are `25`, `50`, `100`, and `2000`; the default is `50`. The maximum is `2000`. Search, filters, sort fields, selected columns, and relations are checked against the entity allowlist. The browser cannot select a tenant, ERPNext site, organization, member, or role.

Exports above `2000` rows become jobs; synchronous exports are capped at `10000` rows. Imports are capped at 10 MiB. The API rate limit is 120 requests per member per minute, and ERPNext queries time out after 15 seconds.

## 4. Permission model

Permissions are evaluated server-side using the resolved JDD member role and business context. The matrix includes `view`, `create`, `update`, `export`, `import`, `approve`, `publish`, `issue`, and `revoke`. Sensitive fields such as credentials, passwords, ownership internals, and workflow-controlled fields are denied by default. Workflow transitions are explicit; a client cannot set an arbitrary status to bypass approval.

Roles currently covered: `administrator`, `registrar`, `faculty-head`, `lecturer`, `finance`, and `student`.

## 5. Audit events

The required events are: `search`, `record_view`, `create`, `update`, `export`, `import`, `approve`, `publish`, `issue`, `revoke`, and `shared_link_use`. Each event records application, business, organization, member, role, entity, record, request ID, timestamp, and safe metadata. Secrets and raw credentials must never be written to audit metadata.

## 6. Error taxonomy

`authentication_required`, `authorization_denied`, `context_override_forbidden`, `validation_failed`, `conflict`, `missing_integration`, `missing_doctype`, `backend_timeout`, and `job_pending` are the stable client-facing error codes.

## 7. Contract tests

`server/universityPhase0.test.mjs` verifies the entity set, query defaults and allowlists, page sizes, relation validation, browser tenant/role rejection, and audit event coverage. These tests must run before a server deployment.
