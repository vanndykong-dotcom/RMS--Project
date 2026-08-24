# Manage Job Description Test Plan

## Application Overview

Application under test: ALLWEB Recruitment Management System (RMS) Job Description module at `https://rms-dev.allweb.com.kh/admin/setting/job` (real, production-like data — 11 existing job descriptions, read-only exploration except for a safely-cancelled Delete-dialog check, August 2026 build). Login via `/welcome` using FAPA_EMAIL/FAPA_PASSWORD from `.env` (reuse `login()` from `tests/helpers/candidate-helpers.ts`), then click `sidebarTree.getByRole('button', { name: 'Toggle Setting' })` to expand the Setting submenu (this does **not** navigate — URL stays `/admin/dashboard`, per the confirmed pattern in `tests/navigation/nav-setting.spec.ts`) followed by `sidebarTree.getByRole('button', { name: 'Job' })` to land on `/admin/setting/job`, heading `role=heading name="Manage Job Description"`.

This plan covers all 8 acceptance-criteria groups of the "Manage Job Description" epic (`user-stories/scrum_JobManagement.md`, RMS-JOB-01..08), refined against live exploration findings from 2026-08-24 (Playwright MCP browser tools were confirmed unavailable this session too; all findings below come from small throwaway Node scripts run against the repo's own `@playwright/test` `chromium` launcher, targeting the live site, then deleted from the session scratch directory — nothing was left in the repo):

- **Breadcrumb confirmed exactly as specified, including link targets**: `[class*="bread"]` renders `<a href="/admin">Dashboard</a> > <a href="/admin/setting">Setting</a> > <a href="/admin/setting/job">List Job Description</a> > <a>List</a>` — matches the story's exact text "Dashboard > Setting > List Job Description > List", and the current-page segment ("List") is an `<a>` with **no `href`**, consistent with the breadcrumb convention seen on the Advance Report and Calendar screens.
- **Table columns confirmed exactly, 11 rows, newest-first sort confirmed**: `thead th` reads (trimmed) `No.`, `Title`, `Description`, `Status`, `Created At`, `Action` — matching the story precisely. Row 1 is "QA Automation" (created `19/Aug/2026 01:21 PM`) and row 11 is "Java Backend Developer" (created `29/Apr/2025 04:32 PM`), confirming default sort is newest-created-first, exactly the example dates cited in the story's AC. Total count renders as literal text `Total: 11` below the table (via a shared `<app-aw-pagination>` component).
- **Description truncation resolved (story's open "hover to see full text" question) — no hover tooltip exists**: the truncated cell (`.row-content`) has computed `text-overflow: clip` (not CSS `ellipsis`) and **no `title` attribute** anywhere in the cell — the "..." seen in long descriptions (e.g. `"...Experience Level: Mid to Senior-Level (3–..."`) is a hard character-slice with a literal `"..."` string appended, not a CSS truncation with hover-reveal. **The only confirmed way to read the full text is the eye-icon detail view's "Description" nav section** (see below) — automation should assert this, not a hover interaction.
- **Search input confirmed server-side, and a significant case-sensitivity defect found**: the list's own search box is `input[placeholder="Search"]` inside `<app-aw-search-box>` (there are **two** `input[placeholder="Search"]` elements on the page — the sidebar tree's own filter box at `x≈22` and the list's own box at `x≈1052, y≈226` — scope by the `app-aw-search-box` ancestor or `.nth(1)`, mirroring the disambiguation already documented in `specs/advance-report-test-plan.md`). Typing fires a debounced `GET /rms-service/api/v1/jobDescription?pageSize=15&page=1&sortByField=createdAt&sortDirection=desc&filter={term}` (confirmed server-side, `pageSize=15`). **Defect**: the filter is effectively case-broken — searching the exact title case as displayed (e.g. `"Java"`, `"QA"`, `"Automation"`, `"Intern"`) reliably returns `total:0`/"No matching records found", while the **all-lowercase** version of the same term (`"java"`, `"qa"`, `"automation"`) correctly matches (verified across 4 independent fresh-browser-context trials: `"Java"→0`, `"java"→2` incl. "Java Backend Developer", `"JAVA"→0`; `"QA"→0`, `"qa"→1` "QA Automation"; `"Automation"→0`, `"automation"→3`). This is a genuine, reproducible defect worth flagging to dev/PM — automation should assert the *current* (lowercase-only) behavior and flag mixed/upper-case search as a known-failing case rather than asserting the intuitively-expected case-insensitive match. Clearing the search restores the full unfiltered/paginated list (confirmed).
- **"+ Add" entry point confirmed — not a modal, a dedicated page**: a pill button `getByRole('button', { name: 'Add' })` (icon "add" + text, `aw-btn-primary`, 285×48px, rounded, positioned top-right of the header) navigates to `/admin/setting/job/create` (full page nav, not a dialog) with heading "Manage Jobs" and sections "Job information" (first visible field: "Role *") and "File preview". Per task instructions, only the entry point was confirmed — the form was not filled in; navigating back (`page.goBack()`) safely returned to `/admin/setting/job` with all 11 rows intact.
- **Status toggle structure confirmed, NOT exercised live (safety constraint)**: each row's Status cell renders `<app-aw-slider-toggle appdisablecomponent>` wrapping a native `<label class="switch"><input type="checkbox">...</label>`. All 11 toggles are confirmed `checked: true` and `disabled: false` (i.e. clickable for this Super Admin session) — consistent with the story's "all shown on" data. **The toggle input is not exposed via `getByRole('checkbox')`** (`page.getByRole('checkbox')` returned a count of 0 site-wide despite `type="checkbox"` inputs existing) — automation must target it structurally, e.g. `row.locator('app-aw-slider-toggle input[type="checkbox"]')`, not by role. **No click was performed on any real row's toggle during this exploration** — the story itself flags an open product question (does "off" only hide it from new selections, or also affect existing linked demands/interviews?), and this is a real dataset of 11 job descriptions likely referenced elsewhere in the app, so a real toggle was judged not safely/obviously reversible without risking a stuck-off state on shared data. **Automation for RMS-JOB-04 must create its own synthetic job description first (via the confirmed `/admin/setting/job/create` entry point) and toggle only that row**, mirroring the `createSyntheticCandidate()` pattern already used elsewhere in this suite, rather than touching any of the 11 pre-existing rows.
- **Eye icon confirmed exact mechanism (resolves RMS-JOB-05's modal-vs-page open question) and surfaces two more findings**: clicking the `visibility` icon (`button[mattooltip="View"]`) opens an in-place `[role="dialog"]` (`<app-dialog-view-job>`, URL unchanged) with a left sidebar (status badge, job title, and a nav menu of plain `<a class="nav-item">` items — **not** `role=tab`, so `getByRole('tab')` will not find them) offering "Job Details" (default), "Description", "Attachment", plus footer lines "Created: {relative}" / "Updated: {relative}". "Job Details" shows Job Title, Status, Created (`19/Aug/2026 01:21 PM`), Last Updated (same). "Description" shows the full untruncated text (confirmed against the truncated "Java Backend Developer" row — the complete multi-paragraph job posting rendered in full). "Attachment" shows an attached file entry (filename truncated with an ellipsis, size e.g. "18.37 KB", "Open in Browser" and "Download" actions). **Defect found**: the footer's relative-time text reads **"Created: over 1 year ago"** for a job description whose own "Created" field is `19/Aug/2026 01:21 PM` — only 5 days before this exploration's date (2026-08-24) — i.e. the relative-time calculation is wrong/hardcoded, not just imprecise. Closing via `Escape` was confirmed to close the dialog cleanly (a `.close-button` is also present).
- **Kebab (⋮) menu contents confirmed exactly as the story expects, in order**: `button[mattooltip="More"]` opens a `role=menu` with exactly 4 `role=menuitem`s, in order: **"Get file"** (picture_as_pdf icon), **"Modify"**, **"Delete"**, **"Share"**. Note for automation: both "Modify" and "Delete" menu items use an `<img alt="delete icon">` for their icon, so `getByRole('menuitem', { name: 'Delete' })` alone is ambiguous (matches "delete icon Modify" too) — use the full accessible name `'delete icon Delete'` or scope by icon `src`/text content instead.
- **Delete confirmation dialog CONFIRMED TO EXIST (resolves the story's open question) — was opened and safely cancelled, no data was removed**: clicking "Delete" opens a dialog titled **"Remove Job Description"** with body text **"Are you sure you want to remove this Job Description?"** and three controls: a close (X) icon, **"Cancel"**, and **"Confirm"**. This was clicked live on row 1 ("QA Automation") and immediately cancelled via the "Cancel" button — row count was re-verified at 11 immediately after, confirming no deletion occurred. Automation must always click "Cancel" (or the close icon) and never "Confirm" against the 11 real rows; if delete-success needs testing later, it must target a synthetic job description created by the test itself.
- **Share confirmed safe and read-only — an internal link generator, not an email/external send (resolves the story's open question)**: clicking "Share" opens a small dialog (`<app-share>`) titled **"🔗 Share Job"** containing a single readonly text input pre-filled with an internal apply-style URL (confirmed format: `https://rms-dev.allweb.com.kh:8909/apply/{encoded-token}`) and a "copy to clipboard" icon button (`content_copy`). No email is sent and no external action is triggered by opening this dialog or reading/copying the link — it was safe to open and inspect live. Automation should assert the dialog/title/input value pattern and stop short of asserting clipboard contents (clipboard permissions are unreliable in CI).
- **Get file confirmed exactly (resolves the story's open format question) — triggers a real, safe file download**: clicking "Get file" on row 1 ("QA Automation", which has an attachment per the eye-icon's "Attachment" tab) triggered a genuine browser `download` event for a **PDF** file (suggested filename was a bare UUID + `.pdf`, e.g. `191b3f20-....pdf`) — i.e. it downloads the row's underlying attached document rather than generating a freshly-formatted DOCX/plain-text export. This was safely triggered and inspected live (a download is reversible/non-destructive). **Caveat for later automation**: this was only confirmed for a row known to have an attachment; behavior for a job description with no attachment is unconfirmed and flagged as a coverage gap, not assumed.
- **Pagination controls confirmed**: rendered by a shared `<app-aw-pagination>` component — `keyboard_arrow_left` / active page number ("1", `.page-note-item.active`) / `keyboard_arrow_right`, both arrow spans carrying a `disabled` CSS class (since all 11 rows fit on one `pageSize=15` page), plus the `"Total: 11"` message line. A hidden "go to page" number input (`formcontrolname="gotoPage"`) also exists in the DOM (`class="d-none"` until some interaction reveals it) — noted for completeness, not exercised. True multi-page navigation could not be observed live (only 11 of a max-15-per-page dataset exists) — flagged as a coverage gap for later automation/seeding, consistent with the same gap already documented in the Advance Report plan.
- **Real-data safety note (important — read before automating)**: this list holds 11 real, pre-existing job descriptions that other parts of the app (Demand, Interview Schedule/Templates) likely reference. Automated tests for this module must never: (a) leave any of the 11 rows' Status toggle in a changed state — RMS-JOB-04 tests must create and toggle only a synthetic job description; (b) click "Confirm" on the Delete dialog against any of the 11 rows — only "Cancel"/close may be exercised against real rows, and any delete-success test must target a synthetic row created by the test; (c) treat opening the Share dialog or clicking "Get file" as fully risk-free by default in every future run — both were verified safe in this exploration (no send, a plain download), but tests should still avoid asserting on clipboard state and should tolerate a missing attachment gracefully rather than assuming "Get file" always succeeds.
- Helpers to reuse from `tests/helpers/candidate-helpers.ts`: `login()`. None of `goToInterviewSchedule()`/`goToAdvanceReport()`/`selectComboboxOption()`/`searchFor()` apply directly to this screen (no combobox, and the search box needs its own scoped locator) — a later automation step should add a `goToJobDescriptionList(page)` helper (Toggle Setting → click "Job" → assert `/admin/setting/job` + heading) and a `searchJobDescriptions(page, term)` helper mirroring `searchFor()`'s "fill + waitForResponse(filter=...)" shape but scoped to `app-aw-search-box` on this page, plus a `openJobRowMenu`/`clickJobRowMenuItem` pair mirroring `openRowMenu()`/`clickRowMenuItem()` if row-menu flakiness (as already documented for the candidate list) turns out to reproduce here too.

## Test Scenarios

### 1. RMS-JOB-01: View list of job descriptions

**Seed:** none (read-only exploration of existing seeded job description data)

#### 1.1. JOB01-1. Table columns, sort order, and total count on load

**File:** `tests/job-management/list-columns-and-sort.spec.ts`

**Steps:**
  1. Log in and navigate to Job Description via Setting → Job in the sidebar tree
    - expect: URL is `/admin/setting/job`; heading "Manage Job Description" is visible; breadcrumb reads "Dashboard > Setting > List Job Description > List"
  2. Observe the table header row
    - expect: Exactly these 6 columns in order: No., Title, Description, Status, Created At, Action
  3. Observe the first and last data rows
    - expect: Rows are ordered newest-created first (row 1's Created At is the most recent timestamp, the last row's is the oldest)
  4. Observe the total count line below the table
    - expect: Text reads `Total: 11` (or the current live count, if it has changed since exploration)

**Test data:** none required.

#### 1.2. JOB01-2. Long description truncation with no hover tooltip (resolves story's open question)

**File:** `tests/job-management/description-truncation.spec.ts`

**Steps:**
  1. Locate a row with a long Description value (e.g. "Java Backend Developer")
    - expect: The cell's visible text ends in a literal `"..."` and is a hard character-slice (not a CSS `text-overflow: ellipsis`)
    - expect: The cell (and its contents) carry no `title` attribute — hovering does not reveal the full text natively
  2. Open that row's eye-icon detail view and select the "Description" nav item
    - expect: The full, untruncated description text is shown — this is the only confirmed place to read it in full

**Test data:** the existing "Java Backend Developer" row (or any row with a truncated description at execution time).

#### 1.3. JOB01-3. "N/A" description rendering

**File:** `tests/job-management/description-na-rendering.spec.ts`

**Steps:**
  1. Locate a row whose Description is unset (e.g. "QA Automation")
    - expect: Cell renders literally as `N/A`

**Test data:** the existing "QA Automation" row (or any row with an unset description at execution time).

### 2. RMS-JOB-02: Search job descriptions

**Seed:** none

#### 2.1. JOB02-1. Search input identity — disambiguating the two "Search" boxes

**File:** `tests/job-management/search-input-identity.spec.ts`

**Steps:**
  1. On the Job Description page, count all `input[placeholder="Search"]` elements
    - expect: Exactly 2 matches: the sidebar tree's own filter box (unrelated) and the list's own box (inside `app-aw-search-box`, top-right of the table) — document the scoping selector used so later automation targets the right one

**Test data:** none required.

#### 2.2. JOB02-2. Search is server-side and filters without a full page reload (happy path)

**File:** `tests/job-management/search-filters-list.spec.ts`

**Steps:**
  1. Type a lowercase term known to match an existing row (e.g. `"automation"`)
    - expect: A debounced `GET .../jobDescription?...&filter=automation` request fires; no full page navigation/reload occurs
    - expect: The table narrows to only the matching row(s) (confirmed live: 3 rows match "automation")
  2. Clear the search box
    - expect: The full, unfiltered, paginated 11-row list is restored

**Test data:** `"automation"` (confirmed live to match "QA Automation", "Software Testing Automation", "Intern Automation Test").

#### 2.3. JOB02-3. Case-sensitivity defect (documents a confirmed defect, not the story's assumed behavior)

**File:** `tests/job-management/search-case-sensitivity-defect.spec.ts`

**Steps:**
  1. Type the exact display-case title of an existing row (e.g. `"Java"`, matching "Java Backend Developer")
    - expect: **Confirmed defect** — table shows "No matching records found" and "Total: 0" despite an exact-case substring existing in a real title
  2. Clear and type the same term fully lowercased (`"java"`)
    - expect: The matching row(s) now appear correctly (confirmed live: 2 rows, "Intern JAVA" and "Java Backend Developer")

**Test data:** `"Java"` / `"java"` pair (or `"QA"`/`"qa"`, `"Automation"`/`"automation"` — all reproduced this defect live). Flag this scenario's step 1 result as a known defect in the test's own comments/report, not as an assertion that the intuitive case-insensitive behavior exists.

#### 2.4. JOB02-4. Search matching nothing (negative/edge case)

**File:** `tests/job-management/search-no-matches.spec.ts`

**Steps:**
  1. Type a nonsense lowercase term (e.g. `"zzzznotfound12345"`)
    - expect: Table shows "No matching records found" and `Total: 0`
  2. Clear the search box
    - expect: Original 11 rows and `Total: 11` are restored

**Test data:** a nonsense lowercase string with no realistic match (lowercase, to avoid confounding with the case-sensitivity defect above).

### 3. RMS-JOB-03: Add a new job description (entry point only)

**Seed:** none

#### 3.1. JOB03-1. "+ Add" button opens the creation page (entry point only — do not submit)

**File:** `tests/job-management/add-entry-point.spec.ts`

**Steps:**
  1. Locate the "Add" button (top-right of the header)
    - expect: Visible, labeled "Add" with an "add" icon
  2. Click it
    - expect: Navigates to `/admin/setting/job/create` (a dedicated page, not a modal); heading "Manage Jobs" is visible with sections "Job information" and "File preview"
  3. Navigate back without submitting anything
    - expect: Returns to `/admin/setting/job` with the original 11 rows and `Total: 11` intact (no new row created)

**Test data:** none required. Per task instructions, the creation form itself is out of scope — only the entry point and a clean cancel-out are verified here.

### 4. RMS-JOB-04: Toggle job description active status

**Seed:** a synthetic job description created via the confirmed `/admin/setting/job/create` entry point (this module has no existing helper for it yet — a future automation step should add one, e.g. `createSyntheticJobDescription()`)

#### 4.1. JOB04-1. Toggle structure and current state on the 11 real rows (read-only — no click)

**File:** `tests/job-management/status-toggle-structure.spec.ts`

**Steps:**
  1. Inspect the Status cell of every existing row
    - expect: Each renders an `app-aw-slider-toggle` wrapping a native `input[type="checkbox"]`, `checked: true`, `disabled: false`, matching the story's "all shown on" data
    - expect: No click is performed on any of these 11 rows — this scenario is structural inspection only

**Test data:** none required; the existing 11 rows are read-only observed, never toggled.

#### 4.2. JOB04-2. Toggling a synthetic job description's status (happy path — real write, but on a synthetic row only)

**File:** `tests/job-management/status-toggle-synthetic.spec.ts`

**Steps:**
  1. Create a synthetic job description via the Add entry point (e.g. title "QA Automation Toggle Test {timestamp}")
  2. Locate its row and note the toggle's initial state (expected: checked/on, matching creation default)
  3. Click its toggle
    - expect: Updates without a full page reload (optimistic UI or confirmed-on-response); the toggle now shows unchecked/off
  4. Click it again
    - expect: Returns to checked/on
  5. Clean-up: leave the synthetic row in a known state or delete it via the row's own Delete + Confirm (safe here because it is synthetic, unlike the 11 real rows)

**Test data:** a synthetic job description created and owned entirely by this test — never one of the 11 real pre-existing rows.

### 5. RMS-JOB-05: View a job description's full detail (eye icon)

**Seed:** none

#### 5.1. JOB05-1. Eye icon opens an in-place dialog, not a page navigation (resolves story's open question)

**File:** `tests/job-management/eye-icon-detail-dialog.spec.ts`

**Steps:**
  1. Click the `visibility` icon on a row
    - expect: URL is unchanged; a `role="dialog"` (`app-dialog-view-job`) opens showing a status badge, the job title, and a nav menu with "Job Details" (default-active), "Description", "Attachment" items — note these are plain `<a class="nav-item">` elements, not `role=tab`
  2. On "Job Details" (default view)
    - expect: Shows Job Title, Status, Created, Last Updated fields matching the row's own table values
  3. Click "Description"
    - expect: Shows the full untruncated description text
  4. Click "Attachment" (on a row known to have one)
    - expect: Shows a filename (possibly truncated with an ellipsis), a file size, and "Open in Browser"/"Download" actions
  5. Close the dialog (via the close button or `Escape`)
    - expect: Dialog closes cleanly; underlying list is unchanged

**Test data:** an existing row with an attachment (confirmed: "QA Automation") for step 4; any row for steps 1-3.

#### 5.2. JOB05-2. Relative-time defect in the dialog footer (documents a confirmed defect)

**File:** `tests/job-management/eye-icon-relative-time-defect.spec.ts`

**Steps:**
  1. Open the eye-icon dialog for a row created recently (e.g. within the last week, per its own "Created At" table value)
    - expect: **Confirmed defect** — the dialog's footer reads "Created: over 1 year ago" / "Updated: over 1 year ago" regardless of the row's actual recency; document the current (incorrect) behavior rather than asserting the intuitively-correct relative time

**Test data:** the existing "QA Automation" row (created `19/Aug/2026`, 5 days before this exploration's date) or any other recently-created row at execution time.

### 6. RMS-JOB-06: Row action menu — Modify, Delete, Share, Get file

**Seed:** none for structural/read-only checks; a synthetic job description for any eventual Modify/Delete-success automation (not covered by this plan's scenarios below, which all stop short of a real write against the 11 real rows)

#### 6.1. JOB06-1. Kebab menu contents, exact order (confirms story's expectation)

**File:** `tests/job-management/kebab-menu-contents.spec.ts`

**Steps:**
  1. Click the `more_vert` ("More") icon on a row
    - expect: A `role=menu` opens with exactly 4 `role=menuitem`s, in order: "Get file", "Modify", "Delete", "Share"
    - expect: Both "Modify" and "Delete" items render an `<img alt="delete icon">` — automation must disambiguate by full accessible name (`'delete icon Delete'`) or another selector, not `name: 'Delete'` alone

**Test data:** none required.

#### 6.2. JOB06-2. Modify opens the pre-filled edit form (entry point only — do not save changes)

**File:** `tests/job-management/modify-entry-point.spec.ts`

**Steps:**
  1. Open the kebab menu on a known row and click "Modify"
    - expect: Opens the same form used for creation, pre-filled with that row's Title/Description/etc.
  2. Navigate away without saving
    - expect: The row's data is unchanged in the list afterward

**Test data:** an existing row (e.g. "QA Automation"), verified unchanged after the test via a re-read of its table cells.

#### 6.3. JOB06-3. Delete shows a confirmation dialog (resolves story's open question — confirmed to exist)

**File:** `tests/job-management/delete-confirmation-dialog.spec.ts`

**Steps:**
  1. Open the kebab menu on a row and click "Delete"
    - expect: A dialog titled "Remove Job Description" opens with body text "Are you sure you want to remove this Job Description?" and three controls: close (X), "Cancel", "Confirm"
  2. Click "Cancel" (never "Confirm" against a real pre-existing row)
    - expect: Dialog closes; the row is still present in the table; `Total: 11` (or current count) is unchanged

**Test data:** any of the 11 real rows may be used for this cancel-only flow (safe — confirmed live on "QA Automation" with no data loss). A real delete-success path (clicking "Confirm") must only ever be exercised against a synthetic job description created by the test itself, and is not included in this plan's scenarios.

#### 6.4. JOB06-4. Share opens a safe, read-only link dialog (resolves story's open question)

**File:** `tests/job-management/share-dialog.spec.ts`

**Steps:**
  1. Open the kebab menu on a row and click "Share"
    - expect: A dialog titled "🔗 Share Job" opens with a single readonly text input pre-filled with an internal apply-style URL (`https://rms-dev.allweb.com.kh:8909/apply/{token}` pattern) and a copy-to-clipboard icon button
    - expect: No network request resembling an email/send action fires as a result of opening this dialog (assert the response of interest is limited to reading the row's own share-link data, not a send/notify endpoint)
  2. Close the dialog
    - expect: Closes cleanly with no side effects

**Test data:** any existing row. Do not assert on actual clipboard contents (unreliable in CI) — asserting the input's `value` attribute directly is sufficient.

#### 6.5. JOB06-5. Get file triggers a real PDF download (resolves story's open format question)

**File:** `tests/job-management/get-file-download.spec.ts`

**Steps:**
  1. Open the kebab menu on a row known to have an attachment (e.g. "QA Automation") and click "Get file"
    - expect: A browser `download` event fires; the downloaded file's suggested filename ends in `.pdf`
  2. (Coverage gap, document rather than assume) On a row with no attachment
    - expect: Behavior is unconfirmed as of this exploration — a future automation/exploration step should determine whether "Get file" is disabled, errors, or behaves differently for such a row before asserting a specific outcome

**Test data:** "QA Automation" (confirmed to have an attachment) for step 1; any row without one, if identifiable, for step 2's follow-up investigation.

### 7. RMS-JOB-07: Paginate the job description list

**Seed:** none

#### 7.1. JOB07-1. Pagination controls and total count render

**File:** `tests/job-management/pagination-controls-render.spec.ts`

**Steps:**
  1. On page load, locate the pagination row below the table
    - expect: A prev chevron (`keyboard_arrow_left`), active page number "1", and next chevron (`keyboard_arrow_right`) are visible; both chevrons carry a `disabled` class (single-page dataset)
    - expect: `Total: 11` (or current count) is shown

**Test data:** none required.

#### 7.2. JOB07-2. Search resets to page 1 (best-effort — live dataset is currently single-page)

**File:** `tests/job-management/pagination-resets-on-search.spec.ts`

**Steps:**
  1. If a multi-page result set can be produced (requires more than `pageSize=15` job descriptions, not available in the live 11-row dataset at exploration time), navigate to page 2+
    - expect: Page indicator shows the later page
  2. Type a search term
    - expect: Page indicator resets to "1"

**Test data:** not available with the current 11-row dataset (page size is 15) — document this as a coverage gap, consistent with the same gap already flagged in the Advance Report and Calendar plans, rather than skip the scenario silently.

### 8. RMS-JOB-08: Breadcrumb navigation

**Seed:** none

#### 8.1. JOB08-1. Breadcrumb text and link targets

**File:** `tests/job-management/breadcrumb.spec.ts`

**Steps:**
  1. On the Job Description page, locate the breadcrumb (`[class*="bread"]`)
    - expect: Text reads "Dashboard > Setting > List Job Description > List"
    - expect: "Dashboard" is `<a href="/admin">`; "Setting" is `<a href="/admin/setting">`; "List Job Description" is `<a href="/admin/setting/job">`; "List" is an `<a>` with **no `href`**
  2. Click "Dashboard"
    - expect: Navigates to `/admin/dashboard`
  3. Return to the list, click "Setting"
    - expect: Navigates to `/admin/setting`
  4. Return to the list, click "List Job Description"
    - expect: Navigates to `/admin/setting/job` (itself — a same-page link)
  5. Attempt to click "List" itself
    - expect: No navigation occurs (confirmed no `href`), consistent with it being the current-page segment

**Test data:** none required.

## Open Items Carried Forward (not fixed here, flagged for design/dev/PM)

1. **Search filter case-sensitivity defect**: the job description search filter reliably fails to match a term typed in its real display case (e.g. `"Java"` finds nothing despite "Java Backend Developer" existing) but succeeds when the same term is typed fully lowercase. Confirmed reproducible across 3 independent term pairs (`Java`/`java`, `QA`/`qa`, `Automation`/`automation`) in fresh browser contexts, ruling out a debounce/race artifact. Needs a dev fix (likely a missing case-fold on one side of the filter comparison) — flagged as a genuine defect, not a design choice.
2. **Relative-time display defect in the eye-icon dialog**: "Created: over 1 year ago" / "Updated: over 1 year ago" was shown for a job description created only 5 days before the exploration date. The underlying "Created"/"Last Updated" fields on the "Job Details" nav item show the correct absolute timestamp, so this only affects the sidebar's relative-time footer text — needs a dev fix (likely a hardcoded or miscalculated duration).
3. **No hover-reveal for truncated descriptions**: the story's AC speculated full text "is available on view/hover (interaction to be confirmed)" — resolved as **no hover tooltip exists at all**; the only confirmed way to read a truncated description in full is the eye-icon dialog's "Description" nav item. If a hover tooltip is desired, that is a product/design gap, not something to build into automation as if it already exists.
4. **Get file's behavior on an attachment-less job description is unconfirmed.** Every row observed with a Description also happened to have an attachment in the one sample checked ("QA Automation"); a future exploration/automation step should identify (or create) a job description with no attachment and confirm whether "Get file" is disabled, silently no-ops, or errors, before writing a test that asserts a specific outcome for that case.
5. **Multi-page pagination (RMS-JOB-07) could not be observed live** — the current 11-row dataset fits entirely within one `pageSize=15` page. A future automation/seeding step (e.g. creating several synthetic job descriptions) would be needed to exercise real page-2+ navigation and the "reset to page 1 on search" behavior end-to-end.
6. **The story's own open questions about Status toggle semantics** (does "off" only hide it from new Demand/Interview selections, or also affect existing linked records?) were not resolved by this exploration, since no toggle was exercised against the real dataset per the safety constraint — this remains a product decision to be made before RMS-JOB-04's synthetic-row test (4.2 above) can assert downstream behavior in the Demand/Interview modules, beyond the toggle's own on/off state.
