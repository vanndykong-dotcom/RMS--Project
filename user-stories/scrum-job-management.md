# Feature Spec — Manage Job Description

**Module:** Setting > Job (Dashboard > Setting > List Job Description > List)
**Epic:** RMS-JOB — Manage Job Description
**Source:** Existing UI screenshot, ALLWEB RMS, August 2026 build

## Epic Description

As a Super Admin or HR setting manager, I need a place to view, create, edit, enable/disable, and remove job descriptions so that these can be attached to demands, interviews, and candidate applications elsewhere in the RMS. This epic covers the Job Description list screen: the data table, search, status toggle, row actions (view, modify, delete, share, get file), pagination, and the entry point for adding a new job description. It does not cover the add/edit form itself, or how a job description is consumed by the Demand or Interview Schedule modules — those are separate specs referenced as dependencies.

## Data Model (as displayed)

Each row in the list shows a sequential number, a title (e.g. "QA Automation", "Java Backend Developer"), a description (free text, sometimes "N/A" when not filled in, truncated with an ellipsis when long), a status toggle, and a created-at timestamp (format `DD/Mon/YYYY hh:mm AM/PM`). The list currently holds 11 job descriptions, all with status toggled on.

## User Stories

### RMS-JOB-01: View list of job descriptions
**As a** Super Admin, **I want to** see all job descriptions in a sortable table, **so that** I can review what's been defined before creating a demand or interview template.

Acceptance criteria:
- Table shows columns No., Title, Description, Status, Created At, and Action.
- Long descriptions are truncated with an ellipsis; full text is available on view/hover (interaction to be confirmed).
- Rows are ordered newest-created first by default (matches screenshot: 19/Aug/2026 at top, 29/Apr/2025 at bottom).
- A total count is shown below the table (e.g. "Total: 11").

Estimate: 3 points. Priority: High.

### RMS-JOB-02: Search job descriptions
**As a** Super Admin, **I want to** search the job description list by title or keyword, **so that** I can find an existing job description quickly instead of scanning all pages.

Acceptance criteria:
- A search input with a magnifying-glass icon sits above the table, right-aligned.
- Typing filters the table results (client-side or server-side, to be confirmed) without a full page reload.
- Clearing the search restores the full, unfiltered, paginated list.

Estimate: 3 points. Priority: Medium.

### RMS-JOB-03: Add a new job description
**As a** Super Admin, **I want to** open a form to create a new job description, **so that** I can define a role before it's needed by a demand or interview.

Acceptance criteria:
- A prominent "+ Add" button sits top-right of the page header, always visible.
- Clicking it opens the job description creation form (separate spec — out of scope here).
- On successful save, the new row appears at the top of the list (or wherever sort order places it) without a full page reload, and the Total count increments.

Estimate: 3 points (list-side integration only; excludes the form itself). Priority: High. Dependency: job description add/edit form spec.

### RMS-JOB-04: Toggle job description active status
**As a** Super Admin, **I want to** enable or disable a job description directly from the list, **so that** I can retire outdated roles without deleting their history.

Acceptance criteria:
- Each row has a toggle switch in the Status column, defaulting to the job description's current state (all shown "on" in the current data).
- Toggling updates status immediately (optimistic UI or confirmed on response) without a full page reload.
- A disabled job description is no longer selectable when creating a new demand or interview (behavior to confirm with the modules that consume this list).

Estimate: 3 points. Priority: Medium. Open question: does "off" mean archived/hidden, or does it also affect job descriptions already linked to existing demands/interviews?

### RMS-JOB-05: View a job description's full detail
**As a** Super Admin, **I want to** open a job description to read it in full, **so that** I can review the complete text when the table truncates it.

Acceptance criteria:
- An eye icon in the Action column opens a read-only detail view (modal or dedicated page, to confirm) showing the untruncated title, description, status, and created-at timestamp.

Estimate: 2 points. Priority: Medium.

### RMS-JOB-06: Row action menu — Modify, Delete, Share, Get file
**As a** Super Admin, **I want to** access modify, delete, share, and export actions from a single menu per row, **so that** I can manage each job description without cluttering the table with extra columns.

Acceptance criteria:
- A kebab (three-dot) icon in the Action column opens a dropdown with four options: Get file, Modify, Delete, Share.
- **Modify** opens the same form used for creation, pre-filled with the row's data.
- **Delete** removes the job description after a confirmation step (not yet shown in the UI — needs a confirm dialog to prevent accidental loss, especially if the job description is referenced elsewhere).
- **Share** produces a shareable link or shares the job description to another destination (exact behavior — internal share vs. external link vs. email — needs product confirmation).
- **Get file** exports the job description as a downloadable file (format — PDF, DOCX, or plain text — needs confirmation).

Estimate: 8 points (covers all four sub-actions). Priority: Medium. Open questions: Delete confirmation copy and whether delete is blocked/warned when the job description is in use; Share destination and permissions; Get file format.

### RMS-JOB-07: Paginate the job description list
**As a** Super Admin, **I want to** page through job descriptions when there are more than fit on one screen, **so that** the list stays fast and readable as the number of job descriptions grows.

Acceptance criteria:
- Pagination controls (prev/next arrows, page number, Total count) appear below the table.
- Page size is fixed (current data — 11 rows — fits on a single page, so page size needs confirming from a larger dataset or from the spec).
- Search and any future filters reset pagination to page 1.

Estimate: 2 points. Priority: Low.

### RMS-JOB-08: Breadcrumb navigation
**As a** user, **I want to** see where this screen sits in the app hierarchy, **so that** I can navigate back to Setting or the Dashboard easily.

Acceptance criteria:
- Breadcrumb reads "Dashboard > Setting > List Job Description > List" and each segment before the current page links back to that screen.

Estimate: 1 point. Priority: Low.

## Out of Scope (this epic)

The job description add/edit form and its fields/validation, how job descriptions attach to Demand records or Interview Templates, permission rules for who can add/modify/delete (beyond Super Admin), and audit/history logging for changes are all separate specs and not covered here.

## Open Questions for Refinement

Whether the Status toggle only hides a job description from new selections or also affects records already linked to it needs a product decision. The Share action's destination and access model needs to be defined before RMS-JOB-06 can be split and estimated precisely. The Get file export format and its content (full text vs. formatted template) needs confirmation from design/PM. A confirmation step for Delete should be added to the design before RMS-JOB-06 is built, to avoid accidental data loss.

---
*Feature spec derived from the current Manage Job Description screen, ALLWEB RMS. Prepared for sprint backlog refinement — Paris Partners Softwares.*
