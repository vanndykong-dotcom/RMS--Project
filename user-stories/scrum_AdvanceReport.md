# Feature Spec — Manage Candidates Advance Report

**Module:** Candidates > Advance Report (Dashboard > Candidates > Candidate advance report)
**Epic:** RMS-RPT — Manage Candidates Advance Report
**Source:** Existing UI screenshot, ALLWEB RMS, August 2026 build

## Epic Description

As a recruiter, HR lead, or team lead, I need a filterable, exportable report of candidates across the pipeline — grouped into different report views (following-up candidates, full-staff summary, intern summary) — so I can track who needs action within a date range and share the numbers outside the system. This epic covers the Advance Report screen: its tabs, date-range and general filters, search, the results table with its scoring columns, row-level detail access, pagination, and Excel export. It does not cover how the underlying scores (Quiz, Coding, Grade, the Recruit+OM+HR+TL composite) are calculated or entered — that's owned by the interview/evaluation modules and is only consumed here.

## Report Views (Tabs)

Three tabs switch the report's content and columns: **Following Up Report** (candidates currently in "following up" status within the selected date range — shown in the screenshot), **Summary Full Staff**, and **Summary Intern**. Only Following Up Report's layout is visible in the current screenshot; the other two tabs' exact columns need to be confirmed against their own screens before they can be spec'd in detail.

## Data Model — Following Up Report (as displayed)

Each row shows a sequential number, full name (as a clickable link to the candidate profile), gender, age, school, school year, the position applied for, company, experience, current status (e.g. "FOLLOWING UP"), interview date/time, and three scoring columns — Quiz, Coding, Grade — plus a composite column labeled "Recruit + OM + HR + TL" highlighted in yellow. A "Remark" header appears at the far right of the banner row in red, though no remark content is shown in the current single-row example. Empty fields render as "-"; ungraded fields render as "N/A".

## User Stories

### RMS-RPT-01: View Following-Up Qualified Candidates report
**As a** recruiter, **I want to** see a table of candidates currently in follow-up status for a given date range, **so that** I know who needs the next action without digging through individual candidate records.

Acceptance criteria:
- Default tab on page load is "Following Up Report".
- The orange banner row states the report name and the active date range in plain text (e.g. "FOLLOWING-UP QUALIFIED CANDIDATES (24 Aug 2026 - 28 Aug 2026)"), updating live when the date range changes.
- Table columns match the Data Model above; missing values show "-" and ungraded values show "N/A" rather than blank cells.
- A total row count is shown below the table (e.g. "Total: 1").

Estimate: 5 points. Priority: High.

### RMS-RPT-02: Switch between report tabs
**As a** recruiter or team lead, **I want to** switch between Following Up Report, Summary Full Staff, and Summary Intern, **so that** I can view the report format relevant to my role or purpose.

Acceptance criteria:
- Three tabs render above the filter bar; the active tab is underlined and colored blue.
- Switching tabs swaps the table columns and data source but keeps the currently selected date range and any active filters where they apply to the new tab.
- Each tab's column set and data source need to be confirmed with design/PM — Summary Full Staff and Summary Intern are not yet visible in the current screenshots.

Estimate: 8 points (covers building out the two additional tab views). Priority: High. Dependency: designs/specs for Summary Full Staff and Summary Intern layouts.

### RMS-RPT-03: Filter by date range
**As a** recruiter, **I want to** pick a start and end date, **so that** the report only shows candidates relevant to that window.

Acceptance criteria:
- A date-range control (calendar icon, "Aug 24 → Aug 28" style label, dropdown chevron) sits above the table.
- Selecting a new range re-queries the report and updates both the table and the banner row's date label.
- Default range on first load needs to be confirmed (current week, current sprint, last 7 days, etc.).

Estimate: 5 points. Priority: High.

### RMS-RPT-04: Apply additional filters
**As a** recruiter, **I want to** filter the report by criteria beyond date (e.g. position, status, school), **so that** I can narrow results to exactly the candidates I'm looking for.

Acceptance criteria:
- A "Filter" button with a dropdown chevron sits next to the date range control.
- Clicking it opens a filter panel; exact filter fields are not visible in the current screenshot and need confirmation from design (likely candidates: Apply For / position, Status, Company, School).
- Applied filters are visually indicated on the button (e.g. a count badge) and can be cleared.

Estimate: 5 points. Priority: Medium. Open question: full list of filterable fields.

### RMS-RPT-05: Search within the report
**As a** recruiter, **I want to** search the current report by name or keyword, **so that** I can find a specific candidate quickly within a filtered view.

Acceptance criteria:
- A search input sits top-right of the table, independent of the date-range/Filter controls.
- Search applies on top of the current tab, date range, and filters rather than replacing them.
- Clearing search restores the full filtered result set.

Estimate: 3 points. Priority: Medium.

### RMS-RPT-06: Export report to Excel
**As a** HR lead, **I want to** export the current report view to an Excel file, **so that** I can share it outside the system or archive it for a status meeting.

Acceptance criteria:
- An "Excel" button with a download icon sits top-right of the page header, always visible.
- Exported file reflects exactly what's currently on screen: active tab, date range, filters, and search.
- Export includes all matching rows, not just the current page, if pagination is active.
- File naming convention (e.g. including tab name and date range) needs confirmation.

Estimate: 5 points. Priority: High.

### RMS-RPT-07: Open a candidate's profile from the report
**As a** recruiter, **I want to** click a candidate's name to open their full profile, **so that** I can see their complete history without leaving the report to search for them separately.

Acceptance criteria:
- Full Name renders as a link (shown in blue, e.g. "Miss. Vannyda PICH").
- Clicking it navigates to (or opens) the candidate detail/profile screen for that person.
- Returning from the profile (back navigation) preserves the report's tab, date range, filters, and search state.

Estimate: 3 points. Priority: Medium.

### RMS-RPT-08: View row detail via eye icon
**As a** recruiter, **I want to** open a quick detail view for a row without leaving the report, **so that** I can check specifics (like score breakdown) without a full navigation.

Acceptance criteria:
- An eye icon at the end of each row opens a read-only detail view (modal vs. side panel to be confirmed).
- Detail view shows, at minimum, the same fields as the row plus any Remark text not visible in the truncated table.

Estimate: 3 points. Priority: Low.

### RMS-RPT-09: Paginate report results
**As a** recruiter, **I want to** page through results when a report returns more candidates than fit on one screen, **so that** the report stays fast and readable at scale.

Acceptance criteria:
- Pagination controls (prev/next, page number, Total count) appear below the table, consistent with other list screens in the system.
- Changing tab, date range, filter, or search resets pagination to page 1.

Estimate: 2 points. Priority: Low.

### RMS-RPT-10: Breadcrumb navigation
**As a** user, **I want to** see where this report sits in the app hierarchy, **so that** I can navigate back to Candidates or the Dashboard easily.

Acceptance criteria:
- Breadcrumb reads "Dashboard > Candidates > Candidate advance report" and each segment before the current page links back to that screen.

Estimate: 1 point. Priority: Low.

## Out of Scope (this epic)

How Quiz, Coding, Grade, and the Recruit+OM+HR+TL composite score are calculated or entered; the candidate profile screen itself; the Summary Full Staff and Summary Intern tabs' detailed column specs (pending design); and Excel template/branding for the exported file are all separate specs and not covered here.

## Open Questions for Refinement

Column sets for the Summary Full Staff and Summary Intern tabs need design input before RMS-RPT-02 can be broken into buildable tasks. The full list of fields available in the "Filter" dropdown needs confirmation. The default date range on first page load, and whether the Remark column has an input/edit affordance or is display-only, both need a product decision.

---
*Feature spec derived from the current Manage Candidates Advance Report screen, ALLWEB RMS. Prepared for sprint backlog refinement — Paris Partners Softwares.*
