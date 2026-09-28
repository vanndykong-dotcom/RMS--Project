# Feature Spec — Manage Candidates (List Candidates) & Manage Interview Schedule

This file combines two epics that were previously kept in separate specs (`scrum-candidate-list.md` and `scrum-interview-schedule.md`). They are linked: the "Set Interview" row action on the candidate list (RMS-CANDLIST-11) feeds the interview calendar (RMS-CAL), and both screens display the same candidate statuses (NEW REQUEST, IN PROGRESS, FOLLOWING UP, PASSED, …).

| Part | Epic | Module |
|---|---|---|
| [Part 1](#part-1--manage-candidates-list-candidates) | RMS-CANDLIST — Manage Candidates List | Dashboard > Candidates > List candidates |
| [Part 2](#part-2--manage-interview-schedule) | RMS-CAL — Manage Interview Schedule | Dashboard > Calendar > List calendar |

---

## Part 1 — Manage Candidates (List Candidates)

**Module:** Candidates > List Candidates (Dashboard > Candidates > List candidates)
**Epic:** RMS-CANDLIST — Manage Candidates List
**Source:** Existing UI screenshot, ALLWEB RMS, captured 21–22/Sep/2026 (Total: 35 candidates)
**Purpose of this document:** Written as input for Claude Code to generate and run automated UI tests (e.g. Playwright/Cypress) against the candidate list/table view. Every acceptance criterion is phrased as a concrete, checkable Given/When/Then assertion (exact text, exact count, exact column order) rather than a general description, so it converts to a test step with minimal interpretation. A companion Gherkin file, `candidates-list.feature`, implements these scenarios directly.

### Epic Description

As a recruiter or hiring coordinator, I need a single table view that lists every candidate in the pipeline — with enough columns to triage at a glance (status, GPA, experience, priority, interview/assessment score) — plus quick per-row actions (view, modify, set reminder, set interview, log activity, record interview result, archive) so I can manage the whole pipeline without opening each candidate individually. This epic covers the List Candidates page: the header/breadcrumb, the Filter and Search controls, the table itself (columns, sorting, status rendering, pagination), and the per-row Action menu. It does not cover the destination screens those actions open (Modify/Edit form, Set Reminder form, Set Interview form, Add Activity Log form, Add Interview Result form, the single-candidate Candidate Details page, or the Archive list) — those are separate specs (Candidate Details is already covered by `scrum-candidate-management.md`).

### Page Layout (as displayed)

**Breadcrumb:** "Dashboard > Candidates > List candidates".

**Page header:** title "Manage Candidates", subtitle "List all candidate", and two header actions on the right: "Archive" (red/outline button with a folder icon) and "+ Add" (solid blue button).

**Toolbar row:** a "Filter" dropdown button (with a chevron, contents not expanded in the captured screenshot) on the left, and a "Search" input with a magnifying-glass icon on the right.

**Table columns, in order:** No., Photo, Full Name (sortable — has a sort-direction icon), Gender, Age, Phone, University, GPA (sortable), Experience, Priority (sortable), Status, Interview, Created (sortable), Action.

**Per row:** Photo renders as an uploaded avatar image or, when none is set, two-letter initials on a colored circle. Full Name renders as a link, with the candidate's applied-for position as a smaller subtitle directly beneath the name when one is set (e.g. "Marketing Manager-VK", "Java Backend Developer"). University can list more than one institution, stacked as separate lines within the same cell, each with its own GPA value aligned to it (seen for "Ms. Ranny QA": three universities, three "N/A" GPA lines; and "Ms. Windy QA": two universities, two "N/A" GPA lines). Status renders as a colored pill inside a dropdown-style control (has a chevron, implying status may be changeable inline from this table). Interview shows either "N/A" or, for candidates who completed an assessment, a combined score line formatted as "NN% (Quiz: NN, Coding: NN)". Action contains two controls: an eye/"View" icon and a "⋮" (more) icon that opens a per-row action menu.

**Action menu (opened via ⋮):** in order — "Modify" (pencil icon), "Set Reminder" (bell icon), "Set Interview" (calendar icon), "Add Activity Log" (no icon shown, appears indented), "Add interview result" (rendered greyed-out/disabled in the captured screenshot), "Add to archive" (red text, destructive-styled, at the bottom).

**Pagination footer:** page controls (prev arrow, numbered pages, next arrow) and a "Total: N" count, e.g. "1  2  3" with "Total: 35".

### Data Observed (for test fixtures / assertions)

15 of 35 candidates are visible on page 1 of the captured screenshot:

| No. | Full Name | Position (subtitle) | Gender | Age | Phone | University | GPA | Experience | Priority | Status | Interview | Created |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| 1 | Ms. Kanna II | — | Female | 18 | 098 765 43321123 | American University of Phnom Penh (AUPP) | N/A | N/A | Normal | MISSED | N/A | 21/Sep/2026 01:44 PM |
| 2 | Ms. Kanna TESTING | Marketing Manager-VK | Female | 18 | 032 165 4987 | American University of Phnom Penh (AUPP) | N/A | N/A | Normal | FOLLOWING UP | 21/Sep/2026 01:37 PM | *(obscured by open action menu in screenshot — begins "16/Se...")* |
| 3 | Mr. Phumra CHAN | Java Backend Developer | Male | 18 | 088 933 9739 | RUPP (Royal University Of Phnom Penh) | N/A | N/A | Normal | IN PROGRESS | 91% (Quiz: 45, Coding: 46) | 17/Sep/2026 10:05 AM *(row's Created value obscured — begins "31/Au...")* |
| 4 | Ms. Qaautomationtest CANDIDATE CAL05-3 1787544382116 | Software Testing Automation | Female | 18 | 012 345 678 | ITC (The Institute of Technology of Cambodia) | 3.5 | N/A | Normal | IN PROGRESS | N/A | 24/Aug/2026 05:20 PM *(obscured — begins "24/Au...")* |
| 5 | Ms. Julie MARTIN | Marketing Manager | Female | 41 | 096 223 3999 | Norton University | 4 | 10 | High | PASSED | N/A | 17/Sep/2026 09:20 AM *(obscured — begins "20/A...")* |
| 6 | Mr. Sunny QA | — | Male | 18 | 096 220 3500 | Norton University | N/A | N/A | Normal | FAILED | N/A | *(obscured — begins "12/Au...")* |
| 7 | Ms. Ranny QA | — | Female | 18 | 096 220 3500 | RUPP (Royal University Of Phnom Penh); SETEC Institute; Norton University (3 entries) | N/A / N/A / N/A | 4 | High | FOLLOWING UP | N/A | 12/Aug/2026 10:18 AM *(partially obscured)* |
| 8 | Ms. Windy QA | — | Female | 19 | 096 220 3500 | American University of Phnom Penh (AUPP); Norton University (2 entries) | N/A / N/A | N/A | Normal | FOLLOWING UP | N/A | 12/Aug/2026 10:02 AM |
| 9 | Ms. Kim MOUY | — | Female | 23 | 098 765 4321 | American University of Phnom Penh (AUPP) | 0 | N/A | Normal | ATTENDED | N/A | 05/Aug/2026 04:47 PM |
| 10 | Ms. Sopheak PHAL | Intern Automation Test | Female | 21 | 097 208 2194 | Build Bright University (BBU) | 0 | N/A | Normal | ATTENDED | N/A | 05/Aug/2026 04:40 PM |
| 11 | Miss. Chhan DONG | Software Testing Automation | Female | 18 | 096 220 3500 | SETEC Institute | N/A | 10 | Normal | NEW REQUEST | N/A | 23/Jul/2026 10:09 AM |
| 12 | Mr. Sovan NI | — | Male | 37 | 078 347 4565 | ITC (The Institute of Technology of Cambodia) | 3.4 | N/A | Normal | NEW REQUEST | N/A | 10/Jul/2026 12:56 PM |
| 13 | Mr. Vk KONG | QA Automation | Male | 18 | 096 220 3500 | American University of Phnom Penh (AUPP) | N/A | N/A | Normal | NEW REQUEST | 88.5% (Quiz: 45, Coding: 87) | 09/Jul/2026 04:58 PM |
| 14 | Ms. SreyNeang PHEAK | — | Female | 23 | 045 497 5475 | ITC (The Institute of Technology of Cambodia) | 3.5 | N/A | Normal | IN PROGRESS | N/A | 07/Jul/2026 05:35 PM |
| 15 | Ms. Thida PICH | — | Female | 18 | 097 408 1367 | ITC (The Institute of Technology of Cambodia) | 3.6 | N/A | Normal | IN PROGRESS | N/A | 07/Jul/2026 02:55 PM |

Pagination: pages "1" (active), "2", "3"; footer reads "Total: 35".

Distinct Status values observed: MISSED, FOLLOWING UP, IN PROGRESS, PASSED, FAILED, ATTENDED, NEW REQUEST — all seven render with the same tan/amber pill styling and dark text in the captured screenshot (no color differentiation by status, unlike the green "IN PROGRESS" / red overdue-deadline pills seen on the Dashboard's Resource Demanding table — flagged as an open question below).

Distinct Priority values observed: "Normal" (13 of 15 rows) and "High" (Ms. Julie MARTIN, Ms. Ranny QA) — both render as plain text with no pill or color coding visible.

### User Stories

#### RMS-CANDLIST-01: View page header and primary actions
**As a** recruiter, **I want to** see the page title, breadcrumb, and top-level actions, **so that** I know where I am and can archive or add a candidate immediately.

Acceptance criteria:
- Breadcrumb reads "Dashboard > Candidates > List candidates".
- Page displays title "Manage Candidates" and subtitle "List all candidate" exactly (verbatim, including the singular "candidate" — flag to PM/copy as a possible typo, but assert the current literal string until corrected).
- Header renders an "Archive" button (red/outline, folder icon) and a "+ Add" button (solid blue) to its right.
- Clicking "Archive" navigates to (or opens) the archived-candidates view (separate spec — out of scope here).
- Clicking "+ Add" opens the new-candidate creation form (separate spec — out of scope here).

Estimate: 2 points. Priority: High.

#### RMS-CANDLIST-02: Filter and search the candidate list
**As a** recruiter, **I want to** filter and search the candidate table, **so that** I can narrow 35+ candidates down to the ones I need.

Acceptance criteria:
- A "Filter" dropdown button renders above the table, left-aligned; clicking it opens a filter panel (exact fields not visible in the captured screenshot — open question).
- A "Search" input with a magnifying-glass icon renders above the table, right-aligned.
- Given I type a query into "Search" and submit it, then the table re-renders showing only candidates matching that query (exact matched fields — name, phone, university, GPA, status per the Dashboard's global search placeholder — need confirming against this page's own search scope, since this input's placeholder text differs from the Dashboard's).
- Given a filter and/or search query is active, then the "Total: N" pagination count updates to reflect the filtered result set, not the full 35.

Estimate: 3 points. Priority: Medium. Open question: exact fields covered by Filter and by Search on this page.

#### RMS-CANDLIST-03: View candidate table columns and row data
**As a** recruiter, **I want to** see every candidate's key attributes in one table, **so that** I can triage the whole pipeline without opening individual records.

Acceptance criteria:
- Table displays columns in this exact order: No., Photo, Full Name, Gender, Age, Phone, University, GPA, Experience, Priority, Status, Interview, Created, Action.
- Given the current data set, then row 1 displays: No. "1", Full Name "Ms. Kanna II", Gender "Female", Age "18", Phone "098 765 43321123", University "American University of Phnom Penh (AUPP)", GPA "N/A", Experience "N/A", Priority "Normal", Status "MISSED", Interview "N/A", Created "21/Sep/2026 01:44 PM".
- Given a candidate has an applied-for position set (e.g. "Ms. Kanna TESTING"), then that position renders as a subtitle directly beneath the Full Name link; given none is set (e.g. "Ms. Kanna II"), no subtitle line renders.
- Given a candidate attended more than one university (e.g. "Ms. Ranny QA": 3 universities; "Ms. Windy QA": 2 universities), then each university renders on its own line within the University cell, with a corresponding GPA value aligned per line in the GPA cell.
- Given no photo is uploaded for a candidate, then the Photo cell renders two-letter initials on a colored circle instead of a broken image.
- Missing/unset values (GPA, Experience, Interview) render as "N/A" consistently; row 9 ("Ms. Kim MOUY") and row 10 ("Ms. Sopheak PHAL") show GPA "0" rather than "N/A" — needs confirmation whether "0" is a real GPA value or a display default that should read "N/A" instead (open question / possible defect).

Estimate: 5 points. Priority: High.

#### RMS-CANDLIST-04: Sort the candidate list
**As a** recruiter, **I want to** sort the table by Full Name, GPA, Priority, or Created date, **so that** I can order candidates the way I need for the task at hand (e.g. newest first, highest GPA first).

Acceptance criteria:
- "Full Name", "GPA", "Priority", and "Created" column headers each render a sort-direction icon; other columns do not.
- Given I click a sortable column header, then the table re-sorts by that column and the header's icon reflects the active direction (ascending/descending).
- Given the table is sorted by "Created" descending (the default order observed, newest first: 21/Sep/2026 before 17/Sep/2026 before 24/Aug/2026, etc.), then this remains the default sort when no user sort is applied — needs confirmation this is indeed the default vs. an artifact of the captured data (open question).

Estimate: 3 points. Priority: Medium. Open question: default sort column/direction on first page load.

#### RMS-CANDLIST-05: View candidate status
**As a** recruiter, **I want to** see each candidate's pipeline status at a glance, **so that** I can identify who needs follow-up.

Acceptance criteria:
- Status renders as a pill-style control with a dropdown chevron for every row.
- Given the current data set, then the following distinct Status values are observed: MISSED, FOLLOWING UP, IN PROGRESS, PASSED, FAILED, ATTENDED, NEW REQUEST.
- Given the Status control has a dropdown chevron, when I click it, then I can change the candidate's status inline from this table (needs confirmation this is an inline editable control and not purely decorative — open question, since no dropdown was opened for Status in the captured screenshot).
- Given all seven observed Status values currently render with identical tan/amber pill styling, then QA should confirm with design/PM whether status-specific color coding (as used for the Dashboard's Resource Demanding "Status" column) is intended here too, or whether a single neutral pill color is the deliberate design for this table (open question / possible inconsistency).

Estimate: 5 points. Priority: High. Open question: whether Status is inline-editable from this table; whether status values should be color-differentiated.

#### RMS-CANDLIST-06: View interview/assessment score
**As a** recruiter, **I want to** see a candidate's quiz/coding assessment score directly in the list, **so that** I can spot strong technical candidates without opening their profile.

Acceptance criteria:
- Given a candidate has completed an assessment, then the Interview column displays a combined score formatted exactly as "NN%(space)(Quiz: NN, Coding: NN)" — observed: "91% (Quiz: 45, Coding: 46)" for Mr. Phumra CHAN, and "88.5% (Quiz: 45, Coding: 87)" for Mr. Vk KONG.
- Given a candidate has not completed an assessment, then the Interview column displays "N/A".
- Given the overall percentage, then it should equal a computed function of the Quiz and Coding sub-scores (e.g. an average or weighted average) — the exact formula is not derivable from the two observed examples alone (91% vs 45/46; 88.5% vs 45/87) and needs confirmation from the team (open question) before asserting the calculation in a test.

Estimate: 3 points. Priority: Medium. Open question: the scoring formula behind the displayed percentage.

#### RMS-CANDLIST-07: View pagination and total count
**As a** recruiter, **I want to** page through the full candidate list and see the total count, **so that** I know how many candidates exist beyond the current page.

Acceptance criteria:
- Given the current data set has 35 candidates, then the pagination footer renders page controls "1" (active), "2", "3", and the text "Total: 35".
- Given I click page "2", then the table displays the next set of candidates and page "2" becomes the active page control.
- Given a filter or search is applied, then the pagination page count and "Total: N" both recompute against the filtered result set (see RMS-CANDLIST-02).

Estimate: 2 points. Priority: Medium.

#### RMS-CANDLIST-08: Navigate to candidate detail from the list
**As a** recruiter, **I want to** open a candidate's full profile from this table, **so that** I can see everything about them without leaving the list to search again.

Acceptance criteria:
- Given I click a candidate's Full Name link, then I navigate to that candidate's Candidate Details page (see `scrum-candidate-management.md`).
- Given I click the eye/"View" icon in the Action column for a row, then I navigate to that same candidate's Candidate Details page.

Estimate: 2 points. Priority: High. Dependency: RMS-CAND-01 (Candidate Details header/identity).

#### RMS-CANDLIST-09: Row action — Modify
**As a** recruiter, **I want to** edit a candidate directly from the list, **so that** I don't have to open their detail page first.

Acceptance criteria:
- Given I click the "⋮" action icon for a row, then an action menu opens listing, in order: Modify, Set Reminder, Set Interview, Add Activity Log, Add interview result, Add to archive.
- Given I click "Modify" in that menu, then the candidate edit form opens pre-filled with that row's data (separate spec — out of scope here).

Estimate: 2 points (menu + entry point only). Priority: High. Dependency: candidate edit form spec.

#### RMS-CANDLIST-10: Row action — Set Reminder
**As a** recruiter, **I want to** create a reminder for a candidate directly from the list, **so that** I don't forget a follow-up action.

Acceptance criteria:
- Given I open the row action menu and click "Set Reminder", then the reminder creation flow opens pre-associated with that candidate (separate spec — out of scope here).

Estimate: 1 point (entry point only). Priority: Medium. Dependency: Set Reminder form spec.

#### RMS-CANDLIST-11: Row action — Set Interview
**As a** recruiter, **I want to** schedule an interview for a candidate directly from the list, **so that** I don't have to re-enter their details elsewhere.

Acceptance criteria:
- Given I open the row action menu and click "Set Interview", then the interview creation flow opens pre-filled with that candidate's identity and applied-for position (separate spec — out of scope here).

Estimate: 1 point (entry point only). Priority: High. Dependency: Set Interview form spec, RMS-CAL epic (Part 2 of this file).

#### RMS-CANDLIST-12: Row action — Add Activity Log
**As a** recruiter, **I want to** log an activity for a candidate directly from the list, **so that** the team has a shared history of what's happened with them.

Acceptance criteria:
- Given I open the row action menu and click "Add Activity Log", then the activity logging flow opens for that candidate (separate spec — out of scope here).
- This menu item renders without a leading icon in the captured screenshot, unlike the other menu items — confirm with design whether that's intentional (open question).

Estimate: 1 point (entry point only). Priority: Medium. Dependency: Add Activity form spec.

#### RMS-CANDLIST-13: Row action — Add interview result (conditional)
**As a** hiring manager, **I want to** only be able to record an interview result once it's applicable, **so that** results can't be entered before an interview has actually happened.

Acceptance criteria:
- Given a candidate has not yet reached the stage where an interview result can be recorded, then "Add interview result" renders disabled/greyed-out in the row action menu and is not clickable (observed for the row captured in the screenshot).
- Given a candidate has reached the appropriate stage (exact trigger — status = ATTENDED, or an interview marked complete — needs confirmation from the team), then "Add interview result" renders enabled, and clicking it opens the interview-result entry flow for that candidate (separate spec — out of scope here).
- Given a result is recorded, then the candidate's Status cell (RMS-CANDLIST-05) updates accordingly (e.g. to PASSED or FAILED).

Estimate: 3 points (menu + conditional enable logic; excludes the result form itself). Priority: High. Open question: exact condition that enables "Add interview result". Dependency: Interview Result form spec.

#### RMS-CANDLIST-14: Row action — Add to archive
**As a** recruiter, **I want to** archive a candidate directly from the list, **so that** I can remove them from the active pipeline view without deleting their record.

Acceptance criteria:
- Given I open the row action menu and click "Add to archive" (rendered in red/destructive styling), then a confirmation step should appear before the candidate is archived — needs confirming whether one currently exists (open question, since irreversible/hard-to-reverse actions without confirmation are a data-loss risk, same concern flagged for file deletion in `scrum-candidate-management.md` RMS-CAND-04).
- Given a candidate is archived, then they no longer appear in the default "List candidates" view and the "Total: N" count decreases by 1.
- Given I click the page-level "Archive" button (RMS-CANDLIST-01), then I can see candidates archived this way listed there.

Estimate: 3 points. Priority: Medium. Open question: whether "Add to archive" has (or needs) a confirmation step.

### Out of Scope (this epic)

The destination screens/flows opened from this page — candidate Modify/edit form, Set Reminder form, Set Interview form, Add Activity Log form, Add Interview Result form, the single-candidate Candidate Details page (see `scrum-candidate-management.md`), the new-candidate "+ Add" form, and the Archive list view — are separate specs and not covered here. The exact contents of the Filter panel are also out of scope until that panel's fields are confirmed.

### Open Questions for Refinement

Exact fields covered by the Filter panel and by the Search input (and whether Search matches the Dashboard's global-search scope or a narrower one specific to this table); whether the Status pill is inline-editable from this table; whether Status values are meant to be color-differentiated (all seven currently share one tan/amber styling) or that's deliberate; the scoring formula behind the Interview column's "NN% (Quiz: NN, Coding: NN)" display; whether GPA "0" (seen for 2 of 15 candidates) is a real value or should default to "N/A"; the default sort column/direction on first page load; the exact condition that enables "Add interview result" in the row action menu; why "Add Activity Log" renders without an icon unlike its sibling menu items; and whether "Add to archive" needs a confirmation step before archiving a candidate.

### Suggested Test Priorities for Claude Code

High-value, low-ambiguity tests to automate first: RMS-CANDLIST-03's static row assertions (column order and row 1 field values), RMS-CANDLIST-01's exact header text and button presence, RMS-CANDLIST-07's pagination/total-count assertions, and RMS-CANDLIST-08/09/10/11's action-menu entry-point navigation checks. Defer tests that depend on open questions above (Filter/Search scope, inline status editing, the interview-result enable condition, archive confirmation) until those are confirmed with the team, or write them against documented expected behavior once answered.

---

## Part 2 — Manage Interview Schedule


**Module:** Calendar (Dashboard > Calendar > List calendar)
**Epic:** RMS-CAL — Manage Interview Schedule
**Source:** Existing UI screenshot, RMS System, August 2026 build

### Epic Description

As a recruiter or hiring coordinator, I need a calendar view of all scheduled candidate interviews so I can see what's coming up, check on status at a glance, search for a specific interview or candidate, and create new interviews without leaving the calendar. This epic covers the calendar screen itself: navigation, display of interview events, status color-coding, search, and interview creation entry point. It does not cover the interview creation form or candidate detail screens, which are separate features referenced below as dependencies.

### Status Model

The calendar renders each interview as a pill labeled `{time} {Position/Track} - {STATUS}`. Four statuses are visible in the current build, each with its own color:

| Status | Color | Meaning |
|---|---|---|
| NEW REQUEST | Purple/magenta | Interview requested, not yet confirmed or started |
| IN PROGRESS | Orange/yellow | Interview process is actively underway |
| FOLLOWING UP | Orange/yellow | Awaiting a follow-up action (e.g. feedback, next round scheduling) |
| PASSED | Blue | Candidate passed this interview stage |

Note: IN PROGRESS and FOLLOWING UP currently share the same color. This should be confirmed with design — if they're meant to be visually distinct, they need separate colors; if the shared color is intentional (both read as "active/pending"), that should be documented rather than left ambiguous.

### User Stories

#### RMS-CAL-01: View interviews in a monthly calendar
**As a** recruiter, **I want to** see all scheduled interviews laid out on a month grid, **so that** I can quickly scan interview volume and timing across weeks.

Acceptance criteria:
- Calendar displays a full month grid (Sun–Sat columns) with the current month and year shown in the header (e.g. "August 2026").
- Each day cell shows all interviews scheduled that day, stacked vertically, each showing time, position/track, and status.
- Weekend columns (Sat, Sun) are visually distinguished (currently shaded pink/red, with header text in red).
- The current day is visually highlighted (currently shaded pale yellow).
- Days with no interviews render as empty cells without placeholder text.

Estimate: 5 points. Priority: High.

#### RMS-CAL-02: Switch between Day, Week, and Month views
**As a** recruiter, **I want to** toggle between Day, Week, and Month views, **so that** I can drill into a single day's schedule or zoom out to plan across the month.

Acceptance criteria:
- Three toggle buttons (Day / Week / Month) are always visible in the top-right of the calendar toolbar.
- The active view is visually indicated (currently a filled blue pill).
- Switching views preserves the currently selected date/period where possible (e.g. switching from Month to Day lands on today or the last-viewed date).

Estimate: 5 points. Priority: High.

#### RMS-CAL-03: Navigate between periods
**As a** recruiter, **I want to** move forward/backward through months (or weeks/days) and jump back to today, **so that** I can review past interviews or plan ahead without losing my place.

Acceptance criteria:
- Left/right chevron controls step the calendar back/forward one period at a time (one month in Month view).
- A "today" button resets the view to the current date regardless of how far the user has navigated.
- The period label (e.g. "August 2026") updates immediately on navigation.

Estimate: 3 points. Priority: High.

#### RMS-CAL-04: Search interviews and candidates
**As a** recruiter, **I want to** search by candidate name, position, or keyword, **so that** I can find a specific interview without scrolling through the calendar.

Acceptance criteria:
- A search input labeled "Search interviews, candidates..." is available in the toolbar.
- Typing a query filters or highlights matching interview pills across the visible calendar (behavior — filter vs. jump-to — needs confirmation from design/PM).
- Empty search returns to the unfiltered calendar view.
- Search is debounced to avoid firing on every keystroke.

Estimate: 5 points. Priority: Medium. Open question: does search restrict to the currently displayed period, or search across all dates and jump the calendar to the first match?

#### RMS-CAL-05: Create a new interview
**As a** recruiter, **I want to** open a create-interview form from the calendar, **so that** I can schedule a new interview without navigating away.

Acceptance criteria:
- A prominent "+ Create Interview" button sits in the top-right of the page header, always visible regardless of view or scroll position.
- Clicking it opens the interview creation flow (separate spec — out of scope here) pre-filled with the currently selected date if one is active.
- On successful creation, the new interview appears on the calendar in the correct date cell without requiring a full page reload.

Estimate: 3 points (calendar-side integration only; excludes the form itself). Priority: High. Dependency: interview creation form/modal spec.

#### RMS-CAL-06: View interview status at a glance
**As a** hiring manager, **I want to** distinguish interview statuses by color and label, **so that** I can tell what needs my attention without opening each interview.

Acceptance criteria:
- Each interview pill is colored according to the Status Model above and shows the status label as text (not color alone, for accessibility).
- Hovering or clicking a pill surfaces full interview details (candidate, interviewer, time, status) — exact interaction (tooltip vs. modal vs. side panel) to be confirmed.
- Status colors are consistent across Day, Week, and Month views.

Estimate: 5 points. Priority: Medium.

#### RMS-CAL-07: Breadcrumb navigation
**As a** user, **I want to** see where the calendar sits in the app's navigation hierarchy, **so that** I can orient myself and navigate back to parent screens.

Acceptance criteria:
- Breadcrumb reads "Dashboard > Calendar > List calendar" and each segment before the current page is a working link back to that screen.

Estimate: 1 point. Priority: Low.

### Out of Scope (this epic)

Interview creation form fields and validation, candidate profile/detail view, interviewer assignment and availability, notifications/reminders for upcoming interviews, and reporting/analytics on interview outcomes are all separate specs and not covered here.

### Open Questions for Refinement

Whether IN PROGRESS and FOLLOWING UP should have visually distinct colors needs a design decision. The exact interaction for viewing full interview details from a pill (click vs. hover) needs to be specified before RMS-CAL-06 can be estimated with confidence. Search scope (current view only vs. all dates) needs a product decision before RMS-CAL-04 is built.

---
*Feature specs derived from the current Manage Candidates / List Candidates and Manage Interview Schedule screens, ALLWEB RMS. Prepared for sprint backlog refinement and Claude Code test authoring — Paris Partners Softwares.*
