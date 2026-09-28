# Candidate List (RMS-CANDLIST) Test Plan

## Application Overview

Application under test: ALLWEB Recruitment Management System (RMS), List Candidates page at
`https://rms-dev.allweb.com.kh/admin/candidate` (real, shared, production-like data — 35 active
candidates, 15 per page, 3 pages at time of planning). Login via `/welcome` using
`RMS_EMAIL`/`RMS_PASSWORD` from `.env`; reuse `login()` / `goToCandidateList()` /
`searchFor()` / `openRowMenu()` / `clickRowMenuItem()` from `tests/helpers/candidate-helpers.ts`.

This plan covers all 14 stories of Part 1 of
`user-stories/scrum-candidate-list-interview-schedule.md` (RMS-CANDLIST-01..14). It
**supersedes the candidate-list portion of `specs/candidate-management.md`** (planned 2026-08-06
from the older 10-AC `SCRUM.md` story) for the list page. The older plan's scenario IDs (A1–A14)
are kept on the existing specs; this plan maps each story to them and adds the gaps. Part 2 of
the same file (RMS-CAL) is unchanged since `specs/interview-schedule-test-plan.md` and is not
re-planned here.

**Smart re-run context (2026-09-28):** chosen as a FULL re-run for this story only, because the
story file is new since the last commit (2026-09-22) and is much more prescriptive than the story
the existing suite was built from. See `test-reports/candidate-list-test-report.md`.

**How this was explored:** the Playwright MCP browser tools were not loaded in this session
(the `playwright-test` agents/MCP were installed mid-session and need a restart to load). All
exploration used throwaway Node scripts driving `@playwright/test`'s `chromium`, headless,
from the session scratch directory. Findings are in `specs/candidate-list-exploratory-results.md`.

## Key Findings That Change the Story's Assumptions

1. **The story's data table misreads the Interview/Created columns.** The Interview column holds
   the *scheduled interview date/time*, followed by the assessment score when one exists
   (e.g. `17/Sep/2026 10:05 AM 91% (Quiz: 45, Coding: 46 )`). The Created column is separate —
   the values the story marks as "obscured, begins 16/Se…" are the real Created values.
2. **Live data drifts.** Row 1 "Ms. Kanna II" is now `PASSED` (story: `MISSED`), and concurrent
   test runs create/archive synthetic candidates. The story's "row 1 exact values" AC is therefore
   planned as a rule check on a stable fixture, **not** a hard-coded row-1 assertion.
3. **Search scope (open question resolved):** case-insensitive; matches name, position,
   university, status, gender and priority. It does **not** match phone or GPA.
4. **Status (open questions resolved):** the pill is an inline-editable menu trigger
   (`mat-menu-trigger` + `arrow_drop_down`). All 7 statuses render the same colour because every
   pill gets the same CSS class `select-status following` — logged as a defect, not a design choice.
5. **Action menu:** order confirmed exactly as the story states. "Add Activity Log" **does** have
   an icon (`activity icon`) — the story's open question is resolved as "no issue". "Add to
   archive" text is not red (only the icon is).
6. **Add interview result** is enabled only once an interview has been set (confirmed business
   rule carried over from `specs/candidate-management.md`).
7. **Add to archive** has a confirmation step ("Are you sure you want to archive this candidate").
8. **Set Interview** pre-fills both Candidate and "Apply for" (from the applied-for position;
   empty when the candidate has none), as the story expects.
9. **Pagination** page numbers are `<span>` elements with no role and `tabIndex=-1` —
   not keyboard-reachable (accessibility finding).
10. **Sorting** (verified over all 35 rows on a quiet server): default order is Created
    descending; Created sorts correctly both ways. **GPA and Priority do not sort by their own
    values**, Full Name orders by salutation first, and **sorting doesn't return to page 1**.
    See the exploratory results, §3.

## Test Data

| Fixture | Use | Mutated? |
|---|---|---|
| Mr. Sovan NI | No position, no photo, no interview, `Add interview result` disabled | No |
| Mr. Phumra CHAN | Position "Java Backend Developer", interview + score | No |
| Mr. Vk KONG | Score `88.5% (Quiz: 45, Coding: 87 )` | No |
| Ms. Ranny QA / Ms. Windy QA | 3 / 2 universities | No |
| Ms. Kim MOUY, Ms. Sopheak PHAL | GPA `0` open question | No |
| Synthetic `QaAutomationTest CANDIDATE <suffix> <timestamp>` | Any write (status, modify, interview, archive) | Yes — archived in cleanup |

Read-only scenarios must never change fixture data. Every write scenario must create its own
synthetic candidate and archive it in cleanup.

## Scenario → Story → Spec Map

| Story | Scenario | Spec file | Status |
|---|---|---|---|
| 01 Header | CL01-1 Breadcrumb, title, subtitle, Archive/+Add | `candidate-list/page-structure.spec.ts` | Existing |
| 01 | CL01-2 Archive opens archived view | `candidate-list/archive-view-entry.spec.ts` | Existing |
| 01 | CL01-3 +Add opens creation wizard | `candidate-add/add-candidate-success.spec.ts` | Existing |
| 02 Filter/search | CL02-1 Filter panel + Total recomputes | `candidate-list/filter-dropdown.spec.ts` | Existing |
| 02 | CL02-2 Search narrows + Total recomputes | `candidate-list/search-filters-list.spec.ts` | Existing |
| 02 | CL02-3 Search scope: matched and non-matched fields | `candidate-list/search-scope.spec.ts` | **New** |
| 03 Columns/rows | CL03-1 Column order | `candidate-list/page-structure.spec.ts` | Existing |
| 03 | CL03-2 Subtitle, multi-university, initials, GPA 0 | `candidate-list/row-data-static-assertions.spec.ts` | Existing (untracked, from 09-22) |
| 04 Sort | CL04-1 Only 4 sortable headers; default Created desc | `candidate-list/sort-headers-and-default.spec.ts` | **New** |
| 04 | CL04-2 Clicking re-orders the table | `candidate-list/column-sorting.spec.ts` | Existing |
| 05 Status | CL05-1 Inline status change persists | `candidate-list/inline-status-update.spec.ts` | Existing |
| 05 | CL05-2 Every row has a status menu trigger; colour by status | `candidate-list/status-pill-rendering.spec.ts` | **New** (colour part documents defect) |
| 06 Score | CL06-1 Score format / N/A | `candidate-list/interview-score-format.spec.ts` | Existing (untracked, from 09-22) |
| 07 Pagination | CL07-1 Arrows + Total | `candidate-list/pagination.spec.ts` | Existing |
| 07 | CL07-2 Numbered pages, active state, 15 per page | `candidate-list/pagination-page-numbers.spec.ts` | **New** |
| 08 Navigate | CL08-1 Eye icon → details | `candidate-list/view-candidate.spec.ts` | Existing |
| 08 | CL08-2 Full Name link → details | `candidate-list/name-link-opens-details.spec.ts` | **New** |
| 09 Menu/Modify | CL09-1 Menu items in exact order, with icons | `candidate-list/row-menu-order.spec.ts` | **New** |
| 09 | CL09-2 Modify opens pre-filled form, persists | `candidate-list/row-menu-modify.spec.ts` | Existing |
| 10 Reminder | CL10-1 Set Reminder associated with candidate | `candidate-list/row-menu-set-reminder.spec.ts` | Existing |
| 11 Interview | CL11-1 Set Interview end-to-end | `candidate-list/row-menu-set-interview.spec.ts` | Existing |
| 11 | CL11-2 Set Interview pre-fills candidate + position | `candidate-list/set-interview-prefill.spec.ts` | **New** |
| 12 Activity | CL12-1 Add Activity Log | `candidate-list/row-menu-activity-log.spec.ts` | Existing |
| 13 Result | CL13-1 Disabled without interview, enabled with | `candidate-list/row-menu-interview-result-state.spec.ts` | Existing |
| 14 Archive | CL14-1 Confirmation, removed from list, in Archive | `candidate-list/row-menu-archive.spec.ts` | Existing |

## New Scenarios (detail)

### CL02-3. Search scope — matched and non-matched fields
**Data:** read-only fixtures. **Seed:** `tests/seed-candidate.spec.ts`.
1. Log in, open Candidate list. — List shows `Total: N` (N > 0).
2. Search `phumra` (lower case). — Only "Mr. Phumra CHAN" is listed; search is case-insensitive.
3. Search `Java Backend`. — "Mr. Phumra CHAN" is listed (position is searched).
4. Search `Norton`. — Every listed row contains "Norton University" (university is searched).
5. Search `088 933 9739` (Phumra CHAN's phone). — **Expected per story/Dashboard placeholder:**
   "Mr. Phumra CHAN" is listed. **Actual:** `Total: 0`. Documented as a scope gap (open
   question for PM), asserted as the current behaviour with a comment, not as a pass/fail defect.

### CL04-1. Sortable headers, default order, sort correctness
**a.** 1. Open Candidate list without any sort. — Exactly `Full Name`, `gpa`, `priority`,
`created` headers carry `aria-sort`; the other 10 do not. 2. Read the Created column of page 1.
— Newest first. 3. Click `created`. — `aria-sort="ascending"`, page 1 oldest first. 4. Click
again. — `aria-sort="descending"`.
**b.** Go to page 2, click `created`. — Page 1 becomes active. *(Fails: defect CANDLIST-04-2.)*
**c.** Click `gpa` (ascending). — Numeric GPA values on page 1 are non-decreasing (N/A ignored,
first line of multi-university cells). *(Fails: defect CANDLIST-04-3.)*
**d.** Click `priority` twice (descending). — All High rows come before any Normal row.
*(Fails: defect CANDLIST-04-4.)*

### CL05-2. Status pill rendering
1. Open Candidate list. — Every data row's Status cell contains a menu trigger with a
   `arrow_drop_down` icon.
2. Compare the pill CSS class/colour of two rows with different statuses (e.g. PASSED vs
   NEW REQUEST). — **Expected (consistent with the Dashboard and Candidate Details status
   colouring):** different. **Actual:** identical (`select-status following`). Kept as a failing
   defect-documenting test, same convention as `header-status-badge-color-defect.spec.ts`.

### CL07-2. Numbered pagination
1. Open Candidate list. — 15 data rows, page `1` has the active state, pages `2`, `3` render, `Total: 35`
   (count asserted as `Total: \d+` and page count as `ceil(total / 15)` since live data drifts).
2. Click page `2`. — Page `2` becomes active, page `1` is not; the first row differs from page 1's.
3. Click the last page. — It is active and has `total − 15 × (pages − 1)` rows.

### CL08-2. Full Name link opens details
1. Search `Sovan NI`. 2. Click the "Mr. Sovan NI" link. — URL matches
   `/admin/candidate/candidateDetail/\d+` and equals the link's `href`; the first level-2 heading
   reads "Mr. Sovan NI".

### CL09-1. Action menu order
1. Search `Sovan NI`, open its ⋮ menu. — Menu items are exactly, in order: Modify, Set Reminder,
   Set Interview, Add Activity Log, Add interview result, Add to archive; each has an icon;
   "Add interview result" is disabled. Close with Escape (no write).

### CL11-2. Set Interview pre-fill
1. Search `Phumra`, open ⋮ → Set Interview. — Dialog opens; Candidate combobox reads
   "Mr. Phumra CHAN".
2. Read "Apply for". — "Java Backend Developer" (the candidate's applied-for position).
3. Click Cancel. — Dialog closes; nothing is saved.

## Out of Scope

Destination forms (Modify, Set Reminder, Set Interview, Add Activity Log, Interview Result, +Add
wizard, Archive list) beyond their entry points — covered by their own plans. The interview
scoring formula (open question, not asserted). Cross-browser runs of write scenarios (the suite
runs on chromium by default against the shared server; firefox/webkit are configured).
