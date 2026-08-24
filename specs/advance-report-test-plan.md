# Manage Candidates Advance Report Test Plan

## Application Overview

Application under test: ALLWEB Recruitment Management System (RMS) Candidates Advance Report module at `https://rms-dev.allweb.com.kh/admin/candidate/advance-report` (real, production-like data — read-only exploration, August 2026 build, v3.16.0). Login via `/welcome` using FAPA_EMAIL/FAPA_PASSWORD from `.env` (reuse `login()` from `tests/helpers/candidate-helpers.ts`), then click 'Advance Report' in the left sidebar tree (`page.getByRole('tree').getByRole('button', { name: 'Advance Report' })`) to land on `/admin/candidate/advance-report`, confirming heading `role=heading name="Manage Candidates Advance Report"` (already proven working in `tests/navigation/nav-advance-report.spec.ts`).

This plan covers all 10 acceptance-criteria groups of the "Manage Candidates Advance Report" epic (`user-stories/scrum_AdvanceReport.md`, RMS-RPT-01..10), refined against live exploration findings from 2026-08-24 (Playwright MCP browser tools were confirmed unavailable this session too; all findings below come from small throwaway Node scripts run against the repo's own `@playwright/test` `chromium` launcher, targeting the live site, then deleted):

- **Three tabs confirmed as `role=tab`**: `tab name="Following Up Report"` (default/active on load, underlined blue), `tab name="Summary Full Staff"`, `tab name="Summary Intern"`. Sub-heading under the page title reads "List candidates advance report by filter".
- **Breadcrumb confirmed exactly, including link targets**: `nav.aw-breadcrumb` renders `<a href="/admin">Dashboard</a> > <a href="/admin/candidate">Candidates</a> > <a>Candidate advance report</a>` — the current-page segment is an `<a>` with **no `href`**, i.e. not actually navigable (consistent with breadcrumb convention for the active page). Clicking "Dashboard" was verified live to land on `/admin/dashboard`.
- **Following Up Report columns confirmed via DOM colspan/rowspan inspection AND a screenshot, with an important label/data mismatch found**: the table has a two-row `<thead>`. Row 1 (the orange banner) is `colspan=10` "FOLLOWING-UP QUALIFIED CANDIDATES ({start} - {end})" + `colspan=1` "Interview Date" + `colspan=3` "" (blank) + `colspan=1` "Remark" (red text, confirmed). Row 2 (15 plain `<th>`s) reads: No, Full Name, Gender, Age, School, School Year, Apply For, Company, Experience, Status, **Recruit + OM + HR + TL** (yellow-highlighted, confirmed), Quiz, Coding, Grade, "" (blank, for the eye icon). Because colspans stack positionally, **the "Interview Date" banner label sits directly above the "Recruit + OM + HR + TL" sub-header, and the seeded data row's actual date/time value (`24/Aug/26 10:28 AM`) renders in that same column** — i.e. the column literally labeled "Recruit + OM + HR + TL" displays the interview date, while no distinct value for the composite score itself is visible anywhere in the row (Quiz/Coding/Grade show `-`/`-`/`N/A` in their own correctly-positioned columns to the right). This is flagged as a likely header/column mislabeling defect candidate for design/dev confirmation (mirroring how the calendar plan flagged its shared-CSS-class finding) — tests should assert the *current* positional behavior, not the story's assumed semantics.
- **Summary Full Staff and Summary Intern columns resolved by direct observation (the story's stated open question)**: both tabs share an identical 8-column layout — No, NAME, University, Number of Candidates, Degree, Apply For, Interview Status, Remark — under a single-cell banner header ("FULL STAFF (...)" / "INTERNSHIP (...)" respectively), no split-header issue like the Following Up tab. Summary Full Staff's live data includes leftover synthetic `QA Automation Test CANDIDATE ...` rows from prior automation runs (per `createSyntheticCandidate()` in `tests/helpers/candidate-helpers.ts`) — safe to use as known non-destructive search/filter targets. Summary Intern returned "No matching records found" for the default date window (24–28 Aug 2026) at exploration time — a naturally-occurring negative case, not an error.
- **Date-range control confirmed exact widget and default**: a pill button reading `"Aug 24" → "Aug 28"` (calendar icon, arrow glyph between the two dates — not a hyphen) with a `expand_more` chevron. Clicking it opens a panel: left column of preset buttons — Today, Yesterday, Last 7 Days, Last 30 Days, This month, Last month, Last 3 months, **Custom date ranged** (this last one is the active/highlighted preset by default) — and a right-side inline month calendar (prev/next chevrons, "AUG 2026" label, Sun–Sat grid) with the 24th and 28th pre-circled, plus a "Generate" button to apply a new selection. **Default range on load resolves the story's open question**: it is Aug 24–28, 2026 (Monday–Friday of the current week, since 24 Aug 2026 is a Monday) — implemented as an already-applied "Custom date ranged" value rather than a semantic "This Week" preset (no such preset exists in the list).
- **Filter dropdown fields resolved by direct observation (the story's other open question)**: it is **not** the speculated Position/Status/Company/School multi-field panel. It is a simple 3-option radio group — **ALL** (default/selected), **INTERN**, **STAFF** — i.e. a candidate-type filter, applying across whichever tab is active. Confirmed live that selecting a non-ALL option that excludes the only seeded Following-Up row yields "No matching records found" and "Total: 0".
- **Three near-identical "Search" inputs exist on this page — do not confuse them**: the global topbar search (`input[placeholder="Search: Name, phone number, university, GPA, Status..."]`), the left sidebar nav's own filter box (`input[placeholder="Search"]`, top of the `role=tree`, boundingBox x≈22), and the report's own search box (also `input[placeholder="Search"]`, positioned top-right of the table, boundingBox x≈1052/1125) — the latter two share the exact same placeholder text, so automation must scope by position/container (e.g. `.nth(1)` after excluding the sidebar, or a nearer structural selector confirmed at script-writing time), not by placeholder alone. Confirmed live: filling the report's own search box while the INTERN filter was active produced a combined result ("No matching records found", Total: 0) — **search composes with the active filter rather than replacing it**, resolving RMS-RPT-05's acceptance criterion.
- **Excel export button confirmed exact label/icon/markup**: `<button class="aw-btn-primary aw-btn ...">` containing `<i class="far fa-file-excel mr-2"></i>Excel` — a blue pill button, top-right of the page header, next to the page title, visible regardless of active tab. Per task instructions this plan verifies only that the button is present/enabled/clickable and does not error — it does **not** trigger-and-inspect an actual downloaded file.
- **Candidate name is a button, not a link, and opens a modal — not a page navigation (corrects the story's assumption)**: the "Full Name" cell renders `<button class="candidate-name-button">`, not an `<a>`. Clicking it was confirmed live to open a `role="dialog"` **in place** (URL stays on `/admin/candidate/advance-report` — no navigation occurs at all) showing a rich read-only profile: header (name, status pill, a subtitle), an info grid (Gender, Date of Birth, Telephone Line 1/2, Email, Year of Experience, Created By, Create at, Last Modify, Priority, Description), an "Interview" section with radial/radar score charts, and a red-outlined "Close" button — no Edit affordance anywhere. Because it never navigates, RMS-RPT-07's "back navigation preserves state" criterion is trivially satisfied: closing the dialog simply reveals the still-intact underlying report.
- **Eye icon confirmed exact mechanism (resolves RMS-RPT-08's modal-vs-panel open question) and surfaces remark text the table itself hides**: clicking the `visibility` icon opens a separate, smaller `role="dialog"` titled **"Remark"** with fields Full Name, Interview Status, Quiz, Coding, Description. Live example: the row's own Remark table cell renders empty/blank, yet this dialog's Description field showed `"Passed."` — i.e. **the table's Remark column does not reliably show remark text; the eye-icon dialog is the only confirmed place it is visible.** Also note this dialog's Quiz/Coding values ("N/A"/"N/A") did not match the row's own Quiz/Coding cells ("-"/"-") for the same candidate, a minor data-consistency point worth asserting as observed rather than assumed.
- **Pagination controls confirmed**: prev chevron / active page-number button (blue, e.g. "1") / next chevron, with a "Total: {n}" line below. At exploration time the live dataset only ever produced 0 or 1 matching rows (a single seeded Following-Up candidate, plus a handful of Summary Full Staff rows), so true multi-page navigation could not be directly observed — flagged as a live-data limitation for later automation, not a defect.
- **Real-data safety note**: this entire module was confirmed to be read-only. No edit/create/delete affordance was found anywhere on the Advance Report screen itself — not in the candidate-name profile modal (no Edit button, unlike the calendar's event dialog), not in the eye-icon Remark dialog, not in the tabs/filter/date-range/search controls. The only action that resembles a "write" is the Excel export, which triggers a client-side file download and does not mutate server data. Automated tests for this module therefore need no synthetic-candidate cleanup step of their own, though several already point at pre-existing synthetic `QA Automation Test CANDIDATE ...` records from other suites — treat those as safe, pre-existing fixtures, not something this plan's tests create or delete.
- Helpers to reuse from `tests/helpers/candidate-helpers.ts`: `login()`. `goToInterviewSchedule()`/`goToCandidateList()` are not directly applicable (there is no `goToAdvanceReport()` yet — a future automation step should add one following the same pattern: `sidebarTree.getByRole('button', { name: 'Advance Report' }).click()` + URL/heading assertion, exactly as already proven in `tests/navigation/nav-advance-report.spec.ts`). `selectComboboxOption()` is not applicable (the Filter panel uses plain radio buttons, not a combobox). A later automation step should add a `searchAdvanceReport(page, term)` helper mirroring `searchFor()`'s "fill + waitForResponse" shape, scoped carefully to the report's own search input (not the sidebar's or topbar's, both sharing the same placeholder).

## Test Scenarios

### 1. RMS-RPT-01: View Following-Up Qualified Candidates report

**Seed:** none (read-only exploration of existing seeded candidate data)

#### 1.1. RPT01-1. Default tab, banner text, and column structure on load

**File:** `tests/advance-report/following-up-default-view.spec.ts`

**Steps:**
  1. Log in and navigate to Advance Report via the sidebar tree
    - expect: URL is `/admin/candidate/advance-report`; heading "Manage Candidates Advance Report" is visible; sub-heading "List candidates advance report by filter" is visible
  2. Observe the active tab
    - expect: `role=tab name="Following Up Report"` is the active/selected tab (underlined, blue) without any click needed
  3. Observe the banner row above the table
    - expect: Text matches `FOLLOWING-UP QUALIFIED CANDIDATES ({start} - {end})` format (e.g. "FOLLOWING-UP QUALIFIED CANDIDATES (24 Aug 2026 - 28 Aug 2026)"), with "Interview Date" and "Remark" as separate banner-row labels to its right (Remark rendered in red per the story)
  4. Observe the column header row
    - expect: Exactly these 14 named columns in order: No, Full Name, Gender, Age, School, School Year, Apply For, Company, Experience, Status, Recruit + OM + HR + TL, Quiz, Coding, Grade — plus one unnamed trailing column for the eye icon
  5. Observe the "Recruit + OM + HR + TL" sub-header's actual displayed value against the row's known interview date/time
    - expect: Document current behavior exactly as observed (see App Overview finding) — do not assert the story's assumed semantic mapping without re-confirming live at execution time

**Test data:** none required; relies on at least one existing seeded Following Up candidate (confirmed present: "Miss. Vannyda PICH").

#### 1.2. RPT01-2. Missing vs. ungraded value rendering conventions

**File:** `tests/advance-report/following-up-value-conventions.spec.ts`

**Steps:**
  1. On a seeded row with unset fields (e.g. School Year, Company, Experience blank in source data)
    - expect: Those cells render literally as `-`
  2. On the same row's ungraded score-type cell(s) (e.g. Grade)
    - expect: Renders literally as `N/A`, distinct from the `-` convention used for simple missing fields

**Test data:** the existing seeded row ("Miss. Vannyda PICH") already exhibits both conventions and can be used as-is.

#### 1.3. RPT01-3. Total row count is shown

**File:** `tests/advance-report/following-up-total-count.spec.ts`

**Steps:**
  1. On initial load with the default date range
    - expect: A "Total: {n}" line is visible below the table matching the number of visible/matching rows (confirmed live: "Total: 1")

**Test data:** none required.

### 2. RMS-RPT-02: Switch between report tabs

**Seed:** none

#### 2.1. RPT02-1. Three tabs render with correct active-state styling

**File:** `tests/advance-report/tabs-render-and-active-state.spec.ts`

**Steps:**
  1. On page load, locate the tab bar
    - expect: `role=tab` elements named "Following Up Report", "Summary Full Staff", "Summary Intern" are all visible, in that order
    - expect: "Following Up Report" carries the active-tab styling (underline + blue text); the other two do not
  2. Click "Summary Full Staff"
    - expect: It becomes visually active; "Following Up Report" no longer is
  3. Click "Summary Intern"
    - expect: It becomes visually active; "Summary Full Staff" no longer is

**Test data:** none required.

#### 2.2. RPT02-2. Switching tabs preserves the active date range

**File:** `tests/advance-report/tabs-preserve-date-range.spec.ts`

**Steps:**
  1. On "Following Up Report", note the date-range pill's text (e.g. "Aug 24 → Aug 28")
  2. Click "Summary Full Staff"
    - expect: The same date-range pill text is still shown, and the tab's own banner reflects the same date window (e.g. "FULL STAFF (24 Aug 2026 - 28 Aug 2026)")
  3. Click "Summary Intern"
    - expect: Same date range preserved again (e.g. "INTERNSHIP (24 Aug 2026 - 28 Aug 2026)")

**Test data:** none required.

#### 2.3. RPT02-3. Summary Full Staff column set (resolves story's open question)

**File:** `tests/advance-report/summary-full-staff-columns.spec.ts`

**Steps:**
  1. Click "Summary Full Staff"
    - expect: Banner reads `FULL STAFF ({start} - {end})`
    - expect: Column headers, in order, are exactly: No, NAME, University, Number of Candidates, Degree, Apply For, Interview Status, Remark (8 total)
  2. Observe at least one data row
    - expect: Row values populate under their respective headers without error (e.g. a "QA Automation Test CANDIDATE ..." row showing a University, a numeric Number of Candidates, an Apply For value, and an Interview Status like "NEW REQUEST")

**Test data:** relies on existing seeded/synthetic Full Staff rows (already present at exploration time).

#### 2.4. RPT02-4. Summary Intern column set and no-data negative case (resolves story's open question)

**File:** `tests/advance-report/summary-intern-columns.spec.ts`

**Steps:**
  1. Click "Summary Intern"
    - expect: Banner reads `INTERNSHIP ({start} - {end})`
    - expect: Column headers are identical in name/order to Summary Full Staff's: No, NAME, University, Number of Candidates, Degree, Apply For, Interview Status, Remark
  2. With the default date range (no seeded intern data in that window, confirmed at exploration time)
    - expect: Table body shows "No matching records found" and "Total: 0" rather than an error or blank table

**Test data:** none required; if intern data exists in the window at execution time, adapt step 2's expectation to a populated-table check instead and note the discrepancy.

### 3. RMS-RPT-03: Filter by date range

**Seed:** none

#### 3.1. RPT03-1. Date-range control structure and default value

**File:** `tests/advance-report/date-range-control-structure.spec.ts`

**Steps:**
  1. On initial load, locate the date-range pill (calendar icon + two date labels + `expand_more` chevron)
    - expect: Text reads two dates separated by an arrow glyph (e.g. "Aug 24 → Aug 28"), not a hyphen
  2. Click the pill
    - expect: A panel opens showing 8 preset buttons in this order: Today, Yesterday, Last 7 Days, Last 30 Days, This month, Last month, Last 3 months, Custom date ranged
    - expect: "Custom date ranged" is the active/highlighted preset by default, and the adjoining inline calendar shows the current month with the range's start/end days pre-circled
    - expect: A "Generate" button is present to apply a newly-picked range

**Test data:** none required; use relative date math (current date ± offsets) rather than hardcoded "Aug 24/28" strings so the test does not silently rot, per the lesson already captured in `pickFutureCalendarDate()`.

#### 3.2. RPT03-2. Selecting a preset updates both banner and table (happy path)

**File:** `tests/advance-report/date-range-preset-selection.spec.ts`

**Steps:**
  1. Open the date-range panel and click "Today"
    - expect: Panel's own date display updates to today's single date; clicking "Generate" (if required) applies it
    - expect: Table banner's date-range portion updates to reflect the new single-day window
    - expect: Table re-queries (row set changes if applicable, or explicitly shows 0/appropriate rows for that narrower window)
  2. Re-open the panel and click "Last 7 Days"
    - expect: Panel and banner both update again to the new 7-day window

**Test data:** none required; compute expected label text relative to the current date rather than hardcoding.

#### 3.3. RPT03-3. Date range with no results (negative/edge case)

**File:** `tests/advance-report/date-range-no-results.spec.ts`

**Steps:**
  1. Pick a date range known to contain no seeded interviews (e.g. a window far in the past before any seed data, or a far-future window)
    - expect: Table shows "No matching records found" and "Total: 0", not an error or stuck loading state
    - expect: Banner's date-range text still updates correctly to reflect the (empty) selected window

**Test data:** a date range with no known seeded candidates — confirm a safe empty window at execution time (e.g. several months before/after the current seed data's known range).

### 4. RMS-RPT-04: Apply additional filters

**Seed:** none

#### 4.1. RPT04-1. Filter dropdown fields (resolves story's open question)

**File:** `tests/advance-report/filter-dropdown-fields.spec.ts`

**Steps:**
  1. Click the "Filter" button (chevron dropdown, next to the date-range control)
    - expect: A panel titled "Filter" opens with exactly 3 radio options, in order: ALL, INTERN, STAFF
    - expect: "ALL" is selected by default

**Test data:** none required.

#### 4.2. RPT04-2. Selecting a filter option narrows results (happy/negative path)

**File:** `tests/advance-report/filter-narrows-results.spec.ts`

**Steps:**
  1. On "Following Up Report" with the default ALL filter and default date range, note the current row count/Total
  2. Open Filter and select "INTERN" (or "STAFF", whichever the seeded row does not belong to)
    - expect: Table updates to "No matching records found" and "Total: 0" if the seeded row's candidate type doesn't match, confirming the filter actually re-queries rather than being cosmetic
  3. Re-open Filter and select "ALL"
    - expect: The original row(s) and Total reappear

**Test data:** relies on knowing the seeded Following-Up candidate's actual type (INTERN vs STAFF) at execution time — confirm via the candidate's own profile (opened via the name button) if ambiguous, rather than assuming.

#### 4.3. RPT04-3. Filter selection persists when reopening the dropdown

**File:** `tests/advance-report/filter-selection-persists.spec.ts`

**Steps:**
  1. Open Filter, select "STAFF", close the dropdown (e.g. click elsewhere or press Escape)
  2. Re-open Filter
    - expect: "STAFF" is still shown as the selected radio option (state persisted, not reset to "ALL")

**Test data:** none required.

### 5. RMS-RPT-05: Search within the report

**Seed:** none

#### 5.1. RPT05-1. Search input identity — disambiguating three near-identical "Search" boxes

**File:** `tests/advance-report/search-input-identity.spec.ts`

**Steps:**
  1. On the Advance Report page, count all `input[placeholder="Search"]` elements
    - expect: Exactly 2 matches: one in the left sidebar (top of the nav tree, unrelated to the report), one positioned top-right of the report's table (the one this plan's other scenarios must target) — distinct from the global topbar search which has its own longer placeholder ("Search: Name, phone number, university, GPA, Status...")
    - expect: Document the precise scoping selector used to target the report's own box (position-based or container-based) so later automation doesn't accidentally hit the sidebar box

**Test data:** none required.

#### 5.2. RPT05-2. Search composes with the active filter rather than replacing it

**File:** `tests/advance-report/search-composes-with-filter.spec.ts`

**Steps:**
  1. Apply a non-default Filter option (e.g. "INTERN") so the table shows "No matching records found"/"Total: 0" (per 4.2)
  2. Type a search term into the report's own search box (e.g. "QA Automation")
    - expect: Filter panel still shows "INTERN" selected (not reset to ALL) — confirming search doesn't clear other controls
    - expect: Table result reflects both conditions combined (confirmed live: still "No matching records found"/"Total: 0" when the term matches nothing under that filter)

**Test data:** a search term guaranteed not to match anything under the applied filter (e.g. "QA Automation" combined with a filter the seeded row doesn't belong to), and separately a term that should match a real row under "ALL", to exercise both outcomes.

#### 5.3. RPT05-3. Clearing search restores the prior filtered result set

**File:** `tests/advance-report/search-clear-restores-results.spec.ts`

**Steps:**
  1. With a filter and/or date range applied and a search term entered (per 5.2), clear the search box
    - expect: Table returns to the result set matching the filter/date range alone (not the fully-unfiltered set, and not an empty set)

**Test data:** none required beyond 5.2's setup.

#### 5.4. RPT05-4. Search matching nothing (negative/edge case)

**File:** `tests/advance-report/search-no-matches.spec.ts`

**Steps:**
  1. With default tab/date-range/filter (ALL), type a nonsense term (e.g. "zzzznotfound12345") into the report's search box
    - expect: Table shows "No matching records found" and "Total: 0"
  2. Clear the search box
    - expect: Original row(s)/Total are restored

**Test data:** a nonsense string with no realistic match.

### 6. RMS-RPT-06: Export report to Excel

**Seed:** none

#### 6.1. RPT06-1. Excel button exact label/icon/position, always visible

**File:** `tests/advance-report/excel-export-button-visible.spec.ts`

**Steps:**
  1. On initial load, locate the button
    - expect: `button[name*="Excel"]` (or matching the confirmed markup: `<i class="far fa-file-excel">` icon + "Excel" text) is visible top-right of the page header, next to the page title
  2. Switch tabs (Summary Full Staff, Summary Intern) and re-apply various date ranges/filters
    - expect: The Excel button remains visible, enabled, and unchanged in label/position across all states

**Test data:** none required.

#### 6.2. RPT06-2. Clicking Excel does not error (structure-only — no download-content verification)

**File:** `tests/advance-report/excel-export-clickable.spec.ts`

**Steps:**
  1. Click the "Excel" button
    - expect: No unhandled page error/console error is thrown; the button remains in a sane state afterward (per task instructions, this plan does not download-and-inspect the resulting file — only confirms the click is safe and click-able)

**Test data:** none required. This is the only scenario touching an export-like action; it is read-only from the app's perspective (a client-side file generation), consistent with the real-data safety note.

### 7. RMS-RPT-07: Open a candidate's profile from the report

**Seed:** none

#### 7.1. RPT07-1. Full Name renders as a button, not a hyperlink (corrects story's assumption)

**File:** `tests/advance-report/candidate-name-is-button.spec.ts`

**Steps:**
  1. Locate the Full Name cell for a seeded row
    - expect: It is a `<button class="candidate-name-button">`, not an `<a>` — document this exactly so later automation doesn't search for `role=link`

**Test data:** the existing seeded row.

#### 7.2. RPT07-2. Clicking the name opens an in-place profile modal (resolves open question — not a page navigation)

**File:** `tests/advance-report/candidate-name-opens-modal.spec.ts`

**Steps:**
  1. Click a candidate's name button
    - expect: URL remains `/admin/candidate/advance-report` (no navigation occurs)
    - expect: A `role="dialog"` opens showing: name + status pill in the header, an info grid (Gender, Date of Birth, Telephone Line 1/2, Email, Year of Experience, Created By, Create at, Last Modify, Priority, Description), an "Interview" section with score charts, and a "Close" button
    - expect: No "Edit" affordance is present anywhere in this dialog (read-only)
  2. Click "Close"
    - expect: Dialog closes; the underlying report (tab, date range, filter, search) is unchanged, trivially satisfying the "state preserved on return" criterion since no navigation ever happened

**Test data:** the existing seeded row.

### 8. RMS-RPT-08: View row detail via eye icon

**Seed:** none

#### 8.1. RPT08-1. Eye icon opens a "Remark" dialog (resolves modal-vs-panel open question)

**File:** `tests/advance-report/eye-icon-remark-dialog.spec.ts`

**Steps:**
  1. Click the `visibility` (eye) icon at the end of a row
    - expect: A `role="dialog"` titled "Remark" opens (not a side panel), showing fields: Full Name, Interview Status, Quiz, Coding, Description
  2. Compare the dialog's Description value against the same row's own (visually blank) Remark table cell
    - expect: Document current behavior exactly as observed — the dialog may show remark text (e.g. "Passed.") that the table's own Remark column does not display, confirming the eye icon is the only reliable way to see it
  3. Close the dialog
    - expect: Returns cleanly to the report with no state change

**Test data:** the existing seeded row, or any row with known Remark content if the seeded one changes.

### 9. RMS-RPT-09: Paginate report results

**Seed:** none

#### 9.1. RPT09-1. Pagination controls and total count text render

**File:** `tests/advance-report/pagination-controls-render.spec.ts`

**Steps:**
  1. On any tab with at least one result, locate the pagination row below the table
    - expect: A prev chevron, an active page-number button (e.g. "1"), and a next chevron are visible
    - expect: A "Total: {n}" line is visible and matches the actual number of matching rows (or "Total: 0" for an empty result set)

**Test data:** none required.

#### 9.2. RPT09-2. Changing tab/date-range/filter/search resets to page 1 (best-effort — live dataset is currently single-page)

**File:** `tests/advance-report/pagination-resets-on-change.spec.ts`

**Steps:**
  1. If a multi-page result set can be produced (e.g. via a broad date range or the ALL filter across a long window), navigate to page 2 or later
    - expect: Page indicator shows the later page
  2. Change the active filter, search term, or date range
    - expect: Page indicator resets to "1"

**Test data:** a date range/filter combination wide enough to produce more than one page of results — not available in the live dataset at exploration time (only 0–1 rows were observed in every combination tried); confirm at execution time whether enough seeded data exists, and if not, document this as a coverage gap rather than skip the scenario silently.

### 10. RMS-RPT-10: Breadcrumb navigation

**Seed:** none

#### 10.1. RPT10-1. Breadcrumb text and link targets

**File:** `tests/advance-report/breadcrumb.spec.ts`

**Steps:**
  1. On the Advance Report page, locate the breadcrumb (`nav.aw-breadcrumb` / `[class*="bread"]`)
    - expect: Text reads "Dashboard > Candidates > Candidate advance report"
    - expect: "Dashboard" is an `<a href="/admin">`; "Candidates" is an `<a href="/admin/candidate">`; "Candidate advance report" is an `<a>` with **no `href`** (not actually navigable)
  2. Click "Dashboard"
    - expect: Navigates to `/admin/dashboard`
  3. Return to the report, click "Candidates"
    - expect: Navigates to `/admin/candidate` (the Manage Candidates list)
  4. Return to the report, attempt to click "Candidate advance report" itself
    - expect: No navigation occurs (confirmed no `href`), consistent with it being the current-page segment

**Test data:** none required.

## Open Items Carried Forward (not fixed here, flagged for design/dev/PM)

1. The "Recruit + OM + HR + TL" sub-header column on the Following Up Report tab visually displays the row's Interview Date value (confirmed via colspan analysis and a screenshot), while no distinct value for the composite score itself appears anywhere in the row. Needs design/dev confirmation on whether this is a genuine column-mislabeling defect or an artifact of the single available sample row — recommend re-verifying against a second/third seeded row with populated composite scores before filing as a confirmed bug.
2. The eye-icon "Remark" dialog's Quiz/Coding values did not match the same row's own table-cell Quiz/Coding values in the one sample observed ("N/A"/"N/A" in the dialog vs. "-"/"-" in the table). Flagged as a data-consistency item to re-check with more sample rows.
3. The table's own Remark column appeared visually empty for the one seeded row, while the eye-icon dialog's Description field showed real text ("Passed."). Needs confirmation on whether the Remark column is supposed to render truncated remark text inline (per the story's Data Model section) or is intentionally blank until the eye icon is opened.
4. Multi-page pagination behavior (RMS-RPT-09) could not be directly observed live — every date-range/filter/tab combination tried during exploration produced 0 or 1 rows. A future automation/seeding step should establish a known multi-page dataset (e.g. via several `createSyntheticCandidate()` calls with interviews in the same window) before this scenario can be fully automated end-to-end.
5. The default date range (a "Custom date ranged" value already set to the current Mon–Fri work week) is not backed by any of the listed semantic presets (no "This Week" option exists) — confirm with product whether this is the intended default-range mechanism or an artifact of when the report was last generated/cached.
