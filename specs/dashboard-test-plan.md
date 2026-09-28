# Dashboard (Home) Test Plan

## Application Overview

Application under test: ALLWEB Recruitment Management System (RMS) Dashboard at
`https://rms-dev.allweb.com.kh/admin/dashboard` — the default landing page immediately after
login (real, production-like data, September 2026 build). Login via `/welcome` using
`RMS_EMAIL`/`RMS_PASSWORD` from `.env` (reuse `login()` from
`tests/helpers/candidate-helpers.ts` — it already asserts `toHaveURL(/\/admin\/dashboard/)` on
success, so **no new `goToDashboard()` helper is needed**: landing there is a side effect of
`login()` itself, confirmed live this session).

This plan covers all 8 acceptance-criteria groups of the Dashboard epic
(`user-stories/scrum-dashboard.md`, RMS-DASH-01..08), refined against live exploration
findings from 2026-09-21. **This epic is read-only observation only** — no "+ Add"/"+
Interview"/"+ Candidate"/"+ Reminder" form is ever submitted, and "Archive" is only exercised
because it was confirmed live to be a safe, reversible, non-destructive in-place view toggle (see
below) — never a delete/mutate action.

**How this was explored:** Playwright MCP browser tools were checked via `ToolSearch` and
confirmed unavailable (consistent with every prior session in this repo). All exploration below
was done with small throwaway Node ESM scripts (`import { chromium } from 'playwright-core'`),
run headless against the live site from the session's scratch temp directory only, then left
there (never copied into the repo — confirmed via `git status` at the end of this task).

## Key Findings From Live Exploration (ground truth for the scenarios below)

- **Top bar "search" is not a real `<input>` — it's a decorative `<span class="placeholder">`**
  with the exact text `"Search: Name, phone number, university, GPA, Status..."`, followed by a
  `tune` (filter) icon. Neither is a fillable textbox. **Clicking either one opens the SAME
  dialog**: `<app-advance-search-dialog>` titled **"Advance Search"**, containing a real form
  (`Enter candidate` text field, `Gender`/`University`/`Position` selects, a `GPA` field) plus
  **"Export"** and **"Clear"** action buttons (the button's icon ligature happens to read "clear_all", but the accessible/visible label text is just "Clear") and a live, paginated candidate results table
  (columns `firstname`, `GPA`, `Priority`, `Created At`, each row with `View`/`more_vert`
  actions). This fully resolves RMS-DASH-01's two open questions: the "search" is really an
  advance-search entry point, not a submit-and-navigate query box, and the filter icon opens the
  identical dialog, not a separate control. Closes cleanly via `Escape`.
- **Notification bell**: `mat-icon` "notifications" wrapped in a `matBadge`, current value **"0"**
  (`mat-badge-content`). **User menu**: clicking the "Super ADMIN" label opens a `role="menu"`
  with **exactly one item, "Logout"** (its icon curiously reads `login`, a minor icon/label
  mismatch worth a design note, not a functional defect). This resolves nothing the story asked
  as an open question but documents the full top-bar surface for automation.
- **Left nav Setting/Administration submenus are ALREADY resolved by existing specs in this repo**
  (`tests/navigation/nav-setting.spec.ts`, `tests/navigation/nav-administration.spec.ts`), not
  newly discovered this session, but carried forward here since RMS-DASH-02 asks for them:
  **Setting** expands to exactly: Migration, Company Profile, Interview Template, Job, Project,
  Email Configuration, Email Template, System Configuration, Candidate Status, University (10
  items). **Administration** expands to exactly: User, Role, Group (3 items). Both toggles change
  no URL (`/admin/dashboard` is unchanged) — confirmed live again this session.
- **Quick Access cards are a real Angular component (`<app-aw-card>`) with typed attributes**,
  not styled `<div>`s — `primarytext`/`secondarytext`/`type`/`routerlink`/`icon`. Confirmed
  exactly: card 1 `primarytext="Total" secondarytext="Interview" type="primary"
  routerlink="/admin/calendar" icon="calendar_month"`, value `"48 interviews"`, avatar background
  `rgb(31,57,150)` (dark blue). Card 2 `secondarytext="Passed Candidate" type="passed"
  routerlink="/admin/candidate"`, value `"5 candidates"`, avatar `rgb(0,82,204)` (blue). Card 3
  `secondarytext="Failed Candidate" type="failed" routerlink="/admin/candidate"`, value `"4
  candidates"`, avatar `rgb(226,26,30)` (red). Card 4 `secondarytext="Candidate" type="danger"
  routerlink="/admin/candidate"`, value `"35 candidates"`, avatar `rgb(249,111,111)` (a
  reddish/pink, **not blue**).
  **Correction to the story's documented color mapping**: the story's AC (RMS-DASH-03) claims
  "'Total Passed Candidate' and 'Total Candidate' use a blue circular icon and 'Total Failed
  Candidate' uses a red circular icon" — live exploration shows this is only half right: Passed
  Candidate is indeed blue, but **"Total Candidate" is actually styled with `type="danger"` and a
  reddish/pink avatar, not blue**. This is flagged as a spec inaccuracy to correct (see Open
  Items), not asserted as the story's claimed behavior.
  **New finding not in the story at all**: all 4 cards carry a real `routerlink` and are
  genuinely clickable (`class="link-effect"`, `tabindex="0"`) — "Total Interview" goes to
  `/admin/calendar`, the other three go to `/admin/candidate`. This is worth its own scenario.
- **Resource Demanding table**: columns confirmed exactly `No.`, `Project Name` (sortable),
  `Position` (sortable, underlying `cdk-column-jobDescription`), `QTY`, `Exp. Level`, `Deadline`
  (sortable, **already sorted ascending by default** — `aria-sort="ascending"` on load, not
  `"none"` as might be assumed), `Resources`, `Status`. Row 1 confirmed exactly as the story
  states. Sort headers work: clicking `Project Name` cycles `aria-sort` `none` → `ascending` →
  `descending`, confirmed live.
  **Defect found**: the Deadline badge's `title` tooltip attribute reads **`"Overdue by -264
  days"`** — a negative day count for a demand that unambiguously *is* overdue (deadline
  31/Dec/2025, "today" is 21/Sep/2026 per the story's own dataset, i.e. ~264 days overdue). The
  sign looks inverted/miscalculated — a positive "Overdue by 264 days" would read correctly; the
  visible red/danger pill styling itself is correct, only the tooltip's number is wrong. Screenshot:
  `test-reports/evidence/defect-DASH04-1-overdue-negative-days-tooltip.png`.
  **"+ Add" resolved**: navigates to a full page, `/admin/demand/create`, heading "Manage
  demands" — not a dialog.
  **"Archive" resolved (was an open question)**: clicking it does **not** navigate anywhere and
  does **not** open a dialog — it's an **in-place, reversible view toggle** on the same
  Resource-Demanding table: the single visible row swaps from the active demand ("VK-Microsoft",
  Qty 5000) to an archived demand ("Testing Java Backend Developer", Qty 1, Resources 0), and
  clicking "Archive" again swaps it straight back. Confirmed safe and idempotent across two full
  toggle cycles live — no data was created, deleted, or otherwise mutated, only the displayed
  filter. This can be safely automated as a real click (not just an entry-point-and-cancel), since
  it's read-only.
- **Top Candidates uses a real carousel** (`ngx-slick-carousel`/slick.js), not a static 3-card
  row. The DOM contains **7 `<mat-card>` slides**: 3 real ones at `data-slick-index="0"` (Julie
  MARTIN, currently active, photo avatar), `"1"` (Pheakkdey MUT, initials "PM"), `"2"` (Kimlong
  KUN, photo avatar) — each with 4 filled stars, matching the story's data and order exactly —
  plus 4 **slick-generated clones** (`class` includes `slick-cloned`, `aria-hidden="true"`) that
  exist purely for the carousel's infinite-loop wraparound and must be excluded by automation
  (filter on `:not(.slick-cloned)` or by `data-slick-index` 0/1/2). "View" on the active card
  (Julie MARTIN) navigated to `/admin/candidate/candidateDetail/3519` with header "Ms. Julie
  MARTIN" — confirms the View-button destination. "+ Candidate" navigates to a full page,
  `/admin/candidate/add`, heading "Add Information" (the same 5-step wizard
  `createSyntheticCandidate()` already automates elsewhere in this repo).
- **This Week Interview**: confirmed exactly 2 `<app-reminder-interview-card>` entries matching
  the story's data. **Defect reconfirmed at the DOM level (was flagged as "likely" in the
  story)**: the "Ms. Kanna TESTING" card genuinely renders **two separate `<app-aw-badge>`
  elements**, both with text "Chamrong THOR" (raw DOM case; CSS uppercases it visually to
  "CHAMRONG THOR") — this is not a text-rendering artifact, it is two distinct sibling elements in
  the same `gap: 10px` flex wrapper. **Confirmed real defect.** Screenshot:
  `test-reports/evidence/defect-DASH06-1-duplicate-interviewer-badge.png`.
  **Resolved (was an open question)**: clicking anywhere on an interview entry card opens an
  **"Interview Detail"-style dialog** (no explicit dialog title, but shows the candidate's
  avatar/name, a status pill "FOLLOWING UP", "Apply for" position, "Date & Time",
  "Interviewers" — **including the same duplicate "Chamrong THOR" badge, further confirming the
  defect below** — "Description", "Edit"/"Add Result" actions, and a "Close" button) rather than
  navigating anywhere (URL stays `/admin/dashboard`, no page change). Entries are interactive via
  an in-place dialog, not a page navigation.
  **"+ Interview" resolved**: opens a `role="dialog"` titled **"Create Interview"** with fields
  `Candidate *`, `Interviewers *`, `Date & time *`, a "Send invitation mail to candidate"
  checkbox, "Reminder Me ... minutes in advance", `Apply for *`, `Description`, and
  `Cancel`/`Save` buttons — entry point only, must always close via `Cancel`/`Escape`, never
  `Save`.
- **This Week Reminder**: confirmed exactly 1 `<app-reminder-report-card>` entry matching the
  story's data (`INTERVIEW` orange/warning tag, "Marketing Manager-VK", "22/Sep/2026 03:48 PM").
  **Correction to the story**: the candidate name is rendered as a plain `<p class="candidate-name">
  Ms. Kanna II</p>` — **not an `<a>` link** as the story's AC assumed. **Resolved (was an open
  question)**: the *entire card* (it carries `title="View reminder"`) is clickable and opens a
  `role="dialog"` titled **"Reminder Detail"** with fields Reminder Type, Title, Interview, Date
  time, Created at, Status ("Active"), Description — **not** a navigation to the linked
  candidate's Candidate Details page as the story assumed. "+ Reminder" resolved: navigates to a
  full page, `/admin/reminders/add?type=INTERVIEW` (unlike "+ Interview", this is a page, not a
  dialog).
- **New finding, out of the story's stated scope**: below "Top Candidates" the live page also
  renders two more sections not mentioned anywhere in `user-stories/scrum-dashboard.md`: a
  "Candidate" section (`app-dashboard-candidate-graph`, two Chart.js canvases) and an
  "Interviews" section (`app-dashboard-interview-graph`, one Chart.js canvas). These are real,
  visible parts of the live Dashboard page. Since they're outside the story's 8 documented
  acceptance-criteria groups, they are **not** given their own automated scenarios here, but are
  flagged in Open Items — a future refinement should confirm with PM whether RMS-DASH needs a
  RMS-DASH-09 for them.
- Helpers to reuse from `tests/helpers/candidate-helpers.ts`: `login()` (lands on Dashboard
  directly — no separate navigation helper needed), `goToCandidateDetails`-style patterns are not
  needed since the View button's own click is asserted directly. No new helper functions were
  needed for this module; all interactions are single-page, in-place dialogs/toggles.

## Test Scenarios

### 1. RMS-DASH-01: View top navigation and global search

**Seed:** none

#### 1.1. DASH01-1. Top-bar branding, notification bell badge, and user menu label

**File:** `tests/dashboard/topbar-branding-and-user-menu.spec.ts`

**Steps:**
  1. Log in (lands directly on the Dashboard)
     - expect: page text contains "ALLWEB RMS"; the search placeholder span reads exactly
       "Search: Name, phone number, university, GPA, Status..."
  2. Observe the top-right corner
     - expect: a `notifications` mat-icon with a numeric badge is visible; a "Super ADMIN" label
       is visible
  3. Click the "Super ADMIN" label
     - expect: a menu opens with exactly one item, "Logout" — do not click it
  4. Close the menu (Escape)
     - expect: menu closes; URL/session unchanged

**Test data:** none required.

#### 1.2. DASH01-2. Global search / filter icon open the same "Advance Search" dialog (resolves story's open questions)

**File:** `tests/dashboard/global-search-advance-dialog.spec.ts`

**Steps:**
  1. Click the search placeholder span
     - expect: an `<app-advance-search-dialog>` opens titled "Advance Search" with field labels
       "Enter candidate", "Gender", "University", "GPA", "Position" and buttons "Export"/"Clear"
       all"
  2. Close it (Escape)
     - expect: dialog closes, URL unchanged (`/admin/dashboard`)
  3. Click the `tune` icon beside the search span
     - expect: the identical "Advance Search" dialog opens (same component, confirming both
       triggers share one entry point)
  4. Close it (Escape)

**Test data:** none required. Screenshot evidence:
`test-reports/evidence/DASH01-1-advance-search-dialog.png`.

### 2. RMS-DASH-02: View left navigation menu

**Seed:** none

#### 2.1. DASH02-1. Nav item order and active-state highlighting

**File:** `tests/dashboard/left-nav-order-and-active-state.spec.ts`

**Steps:**
  1. On the Dashboard, read the sidebar tree's button list
     - expect: exactly these items in this order: Dashboard, Interview Schedule, Candidate,
       Demand, Report, Advance Report, Activity, Reminder, File Manager, Toggle Setting, Toggle
       Administration
  2. Inspect the "Dashboard" item's class
     - expect: it carries an active/highlighted class; no other item does

**Test data:** none required.

#### 2.2. DASH02-2. Setting and Administration chevrons expand in place (no navigation)

**File:** `tests/dashboard/left-nav-setting-administration-expand.spec.ts`

**Steps:**
  1. Click "Toggle Setting"
     - expect: URL stays `/admin/dashboard`; exactly these 10 sub-items appear: Migration,
       Company Profile, Interview Template, Job, Project, Email Configuration, Email Template,
       System Configuration, Candidate Status, University
  2. Click "Toggle Administration"
     - expect: URL stays `/admin/dashboard`; exactly these 3 sub-items appear: User, Role, Group

**Test data:** none required. (Submenu contents already independently confirmed by
`tests/navigation/nav-setting.spec.ts` / `nav-administration.spec.ts`; this scenario re-confirms
them from the Dashboard's own starting context per the story's own AC wording.)

#### 2.3. DASH02-3. Clicking another nav item navigates and updates the active item

**File:** `tests/dashboard/left-nav-candidate-navigation.spec.ts`

**Steps:**
  1. Click "Candidate" in the sidebar
     - expect: navigates to `/admin/candidate`; heading "Manage Candidates" is visible; "Candidate"
       is now the active nav item and "Dashboard" is not

**Test data:** none required.

### 3. RMS-DASH-03: View Quick Access summary counts

**Seed:** none

#### 3.1. DASH03-1. Exactly 4 cards, exact labels/values, in the documented layout order

**File:** `tests/dashboard/quick-access-cards-values.spec.ts`

**Steps:**
  1. On the Dashboard, locate the `app-aw-card` elements inside the Quick Access section
     - expect: exactly 4, in this order: (Total/Interview, "48 interviews" or current live
       value), (Total/Passed Candidate, "5 candidates"), (Total/Failed Candidate, "4
       candidates"), (Total/Candidate, "35 candidates")

**Test data:** none required — values are read and asserted as of execution time where the
underlying counts could plausibly have changed since exploration (documented per-card).

#### 3.2. DASH03-2. Card color coding (corrects the story's documented mapping)

**File:** `tests/dashboard/quick-access-color-coding.spec.ts`

**Steps:**
  1. Read each card's `type` attribute and avatar background color
     - expect: Interview card `type="primary"`; Passed Candidate `type="passed"` (blue-family);
       Failed Candidate `type="failed"` (red-family); **Candidate card `type="danger"`** (a
       reddish/pink, not blue — this asserts the corrected, live-confirmed behavior, not the
       story's original claim that it's blue)

**Test data:** none required.

#### 3.3. DASH03-3. Cards are clickable links to their documented destinations (new finding, not in story)

**File:** `tests/dashboard/quick-access-card-links.spec.ts`

**Steps:**
  1. Click the "Total Interview" card
     - expect: navigates to `/admin/calendar`
  2. Return to Dashboard via the sidebar; click the "Total Candidate" card
     - expect: navigates to `/admin/candidate`

**Test data:** none required.

### 4. RMS-DASH-04: View Resource Demanding table

**Seed:** none

#### 4.1. DASH04-1. Table columns and row 1 field values

**File:** `tests/dashboard/resource-demanding-columns-and-row.spec.ts`

**Steps:**
  1. Observe the table header
     - expect: columns in order No., Project Name, Position, QTY, Exp. Level, Deadline,
       Resources, Status
  2. Observe row 1
     - expect: No. "1", Project Name "VK-Microsoft" (a link), Position "Marketing Manager-VK",
       QTY "5000", Exp. Level "Junior", Deadline "31/Dec/2025" inside a danger-styled badge,
       Resources "5" with an `add_circle` icon, Status "IN PROGRESS" inside a success-styled badge

**Test data:** the current live single-row dataset; if it has changed, assert structure over
exact values where noted.

#### 4.2. DASH04-2. Sortable headers cycle sort direction

**File:** `tests/dashboard/resource-demanding-sort-headers.spec.ts`

**Steps:**
  1. Note the Deadline header's `aria-sort` on load
     - expect: `"ascending"` (confirmed default sort, not `"none"`)
  2. Click the "Project Name" header once, then again
     - expect: `aria-sort` cycles `none` → `ascending` → `descending`

**Test data:** none required.

#### 4.3. DASH04-3. Overdue deadline defect (negative day count in tooltip)

**File:** `tests/dashboard/resource-demanding-overdue-deadline-defect.spec.ts`

**Steps:**
  1. Read the Deadline badge's `title` attribute for row 1
     - expect (documents a **confirmed defect**): the tooltip text matches `/Overdue by -\d+
       days/` (a negative count) rather than a correctly-signed positive count, even though the
       badge is visibly styled as overdue/danger

**Test data:** none required. Screenshot:
`test-reports/evidence/defect-DASH04-1-overdue-negative-days-tooltip.png`.

#### 4.4. DASH04-4. Pagination controls and total count

**File:** `tests/dashboard/resource-demanding-pagination.spec.ts`

**Steps:**
  1. Locate the pagination row below the table
     - expect: prev/active-page-"1"/next controls are visible, both chevrons carry a `disabled`
       class (single-page dataset), and `Total: 1` (or current live count) is shown

**Test data:** none required.

#### 4.5. DASH04-5. "Archive" toggles the table in place and is fully reversible (resolves story's open question)

**File:** `tests/dashboard/resource-demanding-archive-toggle.spec.ts`

**Steps:**
  1. Record row 1's Project Name (expected "VK-Microsoft")
  2. Click "Archive"
     - expect: no navigation, no dialog; row 1 now shows a different (archived) demand
  3. Click "Archive" again
     - expect: row 1 reverts to the original "VK-Microsoft" row exactly

**Test data:** none required — this is a safe, read-only, confirmed-reversible view toggle, not a
destructive action, so it is exercised as a real click rather than only an entry-point check.

#### 4.6. DASH04-6. "+ Add" entry point (do not submit)

**File:** `tests/dashboard/resource-demanding-add-entry-point.spec.ts`

**Steps:**
  1. Click "+ Add"
     - expect: navigates to `/admin/demand/create`, heading "Manage demands"
  2. Navigate back to Dashboard via the sidebar (not `goBack()`, per this repo's Keycloak
     deep-link caution)
     - expect: Resource Demanding row 1 unchanged

**Test data:** none required; nothing is submitted.

### 5. RMS-DASH-05: View Top Candidates

**Seed:** none

#### 5.1. DASH05-1. Exactly 3 real (non-cloned) cards, in order, with correct avatar/name/stars

**File:** `tests/dashboard/top-candidates-cards.spec.ts`

**Steps:**
  1. Locate the carousel's real slides (`data-slick-index` 0/1/2, excluding `.slick-cloned`)
     - expect: exactly 3, in order: "Ms. Julie MARTIN" (photo avatar) 4 stars, "Mr. Pheakkdey
       MUT" (initials "PM") 4 stars, "Mr. Kimlong KUN" (photo avatar) 4 stars — each with a
       "View" button

**Test data:** none required.

#### 5.2. DASH05-2. "View" navigates to that candidate's Candidate Details page

**File:** `tests/dashboard/top-candidates-view-navigation.spec.ts`

**Steps:**
  1. Click "View" on the active (first) card
     - expect: navigates to `/admin/candidate/candidateDetail/{id}`; the Candidate Details header
       matches that card's name ("Ms. Julie MARTIN")

**Test data:** none required.

#### 5.3. DASH05-3. "+ Candidate" entry point (do not submit)

**File:** `tests/dashboard/top-candidates-add-entry-point.spec.ts`

**Steps:**
  1. Click "+ Candidate"
     - expect: navigates to `/admin/candidate/add`, heading "Add Information" (the same wizard
       `createSyntheticCandidate()` automates elsewhere — not filled in here)
  2. Navigate back to Dashboard via the sidebar without submitting anything

**Test data:** none required.

### 6. RMS-DASH-06: View This Week Interview panel

**Seed:** none

#### 6.1. DASH06-1. Exactly 2 entries with exact fields

**File:** `tests/dashboard/this-week-interview-entries.spec.ts`

**Steps:**
  1. Locate the `app-reminder-interview-card` entries
     - expect: exactly 2, in date/time ascending order: ("KT"/"Ms. Kanna TESTING"/"MARKETING
       MANAGER-VK"/"21/Sep/2026 01:37 PM"), ("KI"/"Ms. Kanna II"/"MARKETING
       MANAGER-VK"/"22/Sep/2026 03:48 PM")

**Test data:** none required.

#### 6.2. DASH06-2. Duplicate interviewer badge defect (confirmed at DOM level)

**File:** `tests/dashboard/this-week-interview-duplicate-badge-defect.spec.ts`

**Steps:**
  1. Count the interviewer `app-aw-badge` elements inside the "Ms. Kanna TESTING" card
     - expect (documents a **confirmed defect**): exactly 2 distinct badge elements, both reading
       "Chamrong THOR" — i.e. this is a real DOM duplication, not a text-rendering artifact
  2. Count the same for the "Ms. Kanna II" card
     - expect: exactly 1 badge, "Chamrong THOR"

**Test data:** none required. Screenshot:
`test-reports/evidence/defect-DASH06-1-duplicate-interviewer-badge.png`.

#### 6.3. DASH06-3. Clicking an interview entry opens an Interview Detail dialog (resolves story's open question)

**File:** `tests/dashboard/this-week-interview-entry-detail-dialog.spec.ts`

**Steps:**
  1. Click directly on an interview entry card (not on the "+ Interview" button)
     - expect: no navigation occurs (URL remains `/admin/dashboard`); a `role="dialog"` opens
       showing the candidate's name, a status pill, "Apply for" position, "Date & Time",
       "Interviewers" (including the same duplicate badge seen in DASH06-2), "Description", and
       "Edit"/"Add Result"/"Close" actions
  2. Close it (Escape)
     - expect: dialog closes; URL unchanged

**Test data:** none required.

#### 6.4. DASH06-4. "+ Interview" opens a "Create Interview" dialog (entry point only — Cancel, never Save)

**File:** `tests/dashboard/this-week-interview-add-entry-point.spec.ts`

**Steps:**
  1. Click "+ Interview"
     - expect: a `role="dialog"` opens titled "Create Interview" with fields `Candidate *`,
       `Interviewers *`, `Date & time *`, a "Send invitation mail to candidate" checkbox,
       "Reminder Me" minutes-in-advance, `Apply for *`, `Description`, and Cancel/Save buttons
  2. Click "Cancel" (never "Save")
     - expect: dialog closes; the two existing interview entries are unchanged

**Test data:** none required; nothing is submitted.

### 7. RMS-DASH-07: View This Week Reminder panel

**Seed:** none

#### 7.1. DASH07-1. Exactly 1 entry with exact fields

**File:** `tests/dashboard/this-week-reminder-entry.spec.ts`

**Steps:**
  1. Locate the `app-reminder-report-card` entries
     - expect: exactly 1: type tag "INTERVIEW" (warning/orange), title "Marketing Manager-VK",
       date/time "22/Sep/2026 03:48 PM", candidate name "Ms. Kanna II" (plain text, **not** a
       link — corrects the story's assumption)

**Test data:** none required.

#### 7.2. DASH07-2. Clicking the reminder opens a "Reminder Detail" dialog (resolves/corrects story's open question)

**File:** `tests/dashboard/this-week-reminder-detail-dialog.spec.ts`

**Steps:**
  1. Click the reminder card
     - expect: a `role="dialog"` opens titled "Reminder Detail" with fields Reminder Type, Title,
       Interview, Date time, Created at, Status ("Active"), Description — **not** a navigation to
       Candidate Details, contrary to the story's original assumption
  2. Close it (Escape)
     - expect: dialog closes; URL unchanged

**Test data:** none required.

#### 7.3. DASH07-3. "+ Reminder" navigates to a full add-reminder page (entry point only)

**File:** `tests/dashboard/this-week-reminder-add-entry-point.spec.ts`

**Steps:**
  1. Click "+ Reminder"
     - expect: navigates to `/admin/reminders/add?type=INTERVIEW` (a page, unlike "+ Interview"
       which is a dialog)
  2. Navigate back to Dashboard via the sidebar without submitting anything

**Test data:** none required.

### 8. RMS-DASH-08: Dashboard data freshness and empty states

**Seed:** none

#### 8.1. DASH08-1. Data persists identically across a reload (partial coverage of "freshness")

**File:** `tests/dashboard/data-freshness-reload.spec.ts`

**Steps:**
  1. Record the 4 Quick Access values and the Resource Demanding row 1 values
  2. Reload the Dashboard (re-login, since a raw reload risks the documented Keycloak
     silent-SSO bounce on this app)
     - expect: the same values are displayed, i.e. no stale client-side caching prevents a
       correct re-read

**Test data:** none required. **Coverage note**: this only proves the Dashboard *re-reads*
correctly on a fresh load; it does not exercise the story's full AC of "change data in another
module, then confirm the Dashboard reflects it after reload" — doing that would require a real
write elsewhere in the app, which is out of scope for this read-only epic. Flagged as a coverage
gap below, not silently skipped.

## Open Items Carried Forward (not fixed here, flagged for design/dev/PM)

1. **Resource Demanding "Overdue by -264 days" tooltip defect**: the deadline badge's tooltip
   shows a negative day count for a demand that is unambiguously overdue. The visible red/danger
   pill styling is correct; only the number's sign in the tooltip text looks inverted or
   miscalculated. Needs a dev fix.
2. **This Week Interview duplicate interviewer badge, now confirmed at the DOM level** (the story
   itself flagged this as "likely a defect, not confirmed"): the "Ms. Kanna TESTING" card renders
   two separate `<app-aw-badge>` elements both reading "Chamrong THOR", not one. Still needs a
   product decision — genuinely two identical interviewers, or a rendering bug — but the
   duplication itself is now a confirmed DOM fact, not a hypothesis.
3. **Quick Access color-coding spec inaccuracy**: the story's AC claims "Total Passed Candidate"
   and "Total Candidate" both use a blue icon — live exploration shows "Total Candidate" actually
   uses `type="danger"` with a reddish/pink avatar. The story text should be corrected to match
   the live app rather than automation asserting the story's original (incorrect) claim.
4. **Two dashboard sections exist live that the story never mentions**: a "Candidate" chart
   section and an "Interviews" chart section, both rendered below "Top Candidates" using Chart.js
   canvases. Not given their own scenarios here since they're outside RMS-DASH-01..08's stated
   acceptance criteria — flagged for a future RMS-DASH-09 or a story update.
5. **This Week Reminder's "linked candidate name" is not actually a link** — it's plain text
   inside a card whose *entire surface* opens a "Reminder Detail" dialog, not a navigation to
   Candidate Details. The story's own open question ("whether reminders exist independent of
   interviews...") remains unresolved — only one reminder exists in the live data, always tied to
   an interview, so independent-reminder behavior and other type-tag colors besides orange
   "INTERVIEW" could not be observed.
6. **Empty-state copy/design for every section remains fully unresolved** — every section had
   data at exploration time (no way to safely force a zero-item state without a real write in
   another module, against this epic's read-only constraint) — this is a genuine, unautomatable
   coverage gap, not something documented here.
7. **RMS-DASH-08's full "change data elsewhere, then confirm Dashboard reflects it" flow was not
   exercised** for the same read-only-epic reason — only a same-data reload was verified (see
   DASH08-1).
8. **Non-overdue Deadline styling could not be observed** — only one Resource Demanding row
   exists (plus one archived row, also apparently in the past) — no example of a *future*
   deadline's pill styling exists in the live data to confirm the cutoff/non-danger styling
   logic.
9. **Advance Search dialog's "Export"/"Clear" buttons and its own results table were observed
   but not exercised** (clicking "Export" could trigger a real file download or a real
   backend export job — out of scope for a read-only Dashboard-epic pass; a future
   Candidate/Advance-Search-focused spec should cover it, mirroring how `advance-report`'s own
   spec already covers similar controls elsewhere in this repo).
