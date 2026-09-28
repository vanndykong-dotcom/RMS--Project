# Feature Spec — Dashboard (Home)

**Module:** Dashboard (root landing page after login)
**Epic:** RMS-DASH — Dashboard Overview
**Source:** Existing UI screenshot, ALLWEB RMS, Super Admin role, captured 21/Sep/2026
**Purpose of this document:** Written as input for Claude Code to generate and run automated UI tests (e.g. Playwright/Cypress). Every acceptance criterion below is phrased as a concrete, checkable assertion (exact text, exact count, exact format) rather than a general description, so it can be converted into a test step with minimal interpretation.

## Epic Description

As any authenticated user (role observed: Super Admin), when I land on the Dashboard I need an at-a-glance summary of recruitment activity — interview volume, pass/fail counts, candidate volume, open resource demands, top-rated candidates, this week's interviews, and this week's reminders — with quick-add entry points into the modules that generate that data. This epic covers only the Dashboard page itself (its cards, table, and side panels) and the buttons that open other flows. It does not cover the destination screens/forms those buttons open (Add Interview, Add Reminder, Add Candidate, Resource Demand Add/Archive, Candidate View, Interview Schedule) — those are separate specs.

## Page Layout (as displayed)

**Top bar:** app logo "ALLWEB RMS" (top-left), a collapse/hamburger icon, a global search input with placeholder text "Search: Name, phone number, university, GPA, Status..." plus an adjacent filter/tune icon, a notification bell icon with a numeric badge, and a user menu showing an avatar icon and the label "Super ADMIN".

**Left navigation (in order):** Dashboard (active/highlighted), Interview Schedule, Candidate, Demand, Report, Advance Report, Activity, Reminder, File Manager, Setting (has an expand chevron), Administration (has an expand chevron). A "Search" input sits above the nav list.

**Main content, top to bottom:**
1. Page title "Dashboard"
2. "Quick Access" — a 2x2 grid of 4 stat cards
3. "Resource Demanding" — a data table with header actions "Archive" and "+ Add"
4. "Top Candidates" — a row of candidate cards with a header action "+ Candidate"

**Right sidebar, top to bottom:**
1. "This Week Interview" panel with header action "+ Interview"
2. "This Week Reminder" panel with header action "+ Reminder"

## Data Observed (for test fixtures / assertions)

Quick Access:
- Total Interview: 48 interviews
- Total Passed Candidate: 5 candidates
- Total Failed Candidate: 4 candidates
- Total Candidate: 35 candidates

Resource Demanding table (1 row):
- Project Name: "VK-Microsoft" (rendered as a link)
- Position: "Marketing Manager-VK"
- Qty: 5000
- Exp. Level: "Junior"
- Deadline: "31/Dec/2025" (rendered in a red/danger pill — this date is in the past relative to the page's observed date of 21/Sep/2026, i.e. an overdue demand)
- Resources: "5" (rendered as a link) with an adjacent "+" icon
- Status: "IN PROGRESS" (rendered in a green/success pill)
- Pagination footer: page control showing page "1" only, and "Total: 1"

Top Candidates (3 cards):
- Ms. Julie MARTIN — photo avatar, 4 filled stars (of a 5-star scale), "View" button
- Mr. Pheakkdey MUT — initials avatar "PM" on a colored circle (no photo), 4 filled stars, "View" button
- Mr. Kimlong KUN — photo avatar, 4 filled stars, "View" button

This Week Interview (2 entries):
- Initials avatar "KT", "Ms. Kanna TESTING", position badge "MARKETING MANAGER-VK", date/time "21/Sep/2026 01:37 PM", "Interviewers" label followed by two badges both reading "CHAMRONG THOR" (duplicate badge — flagged below as a likely defect, not a confirmed second interviewer).
- Initials avatar "KI", "Ms. Kanna II", position badge "MARKETING MANAGER-VK", date/time "22/Sep/2026 03:48 PM", "Interviewers" label followed by one badge "CHAMRONG THOR".

This Week Reminder (1 entry):
- Orange "INTERVIEW" type tag, title "Marketing Manager-VK", date/time "22/Sep/2026 03:48 PM", linked candidate name "Ms. Kanna II" (rendered as a link, matches the second This Week Interview entry).

## User Stories

### RMS-DASH-01: View top navigation and global search
**As a** logged-in user, **I want to** see the app header with search and my account context, **so that** I can search candidates and confirm I'm logged in as the right user.

Acceptance criteria:
- Given I am on the Dashboard, then the header displays the text "ALLWEB RMS" and a search input with placeholder text exactly "Search: Name, phone number, university, GPA, Status...".
- Given I am on the Dashboard, when I look at the top-right corner, then I see a notification bell icon with a numeric unread-count badge, and a user menu labeled "Super ADMIN".
- Given I type a query into the global search input and submit it, then the app navigates to (or filters to) matching results — exact destination screen to be confirmed with the team (open question).
- Given I click the filter/tune icon beside the search input, then an advanced filter control opens — fields to be confirmed (open question).

Estimate: 2 points. Priority: Medium. Open question: destination/behavior of global search submit and the filter icon are not visible in the current screenshot.

### RMS-DASH-02: View left navigation menu
**As a** logged-in user, **I want to** see all module entry points in a persistent left nav, **so that** I can move between modules from anywhere in the app.

Acceptance criteria:
- Given I am on the Dashboard, then the left nav lists exactly these items in this order: Dashboard, Interview Schedule, Candidate, Demand, Report, Advance Report, Activity, Reminder, File Manager, Setting, Administration.
- Given I am on the Dashboard, then the "Dashboard" nav item is visually marked as active (highlighted background/text) and no other item is marked active.
- Given "Setting" and "Administration" each render a chevron icon, when I click either, then it expands to reveal its sub-items in place (does not navigate away immediately) — sub-item list to be confirmed (open question).
- Given I click any other nav item (e.g. "Candidate"), then the app navigates to that module's page and that item becomes the active one instead of "Dashboard".

Estimate: 3 points. Priority: High. Open question: contents of the Setting and Administration submenus.

### RMS-DASH-03: View Quick Access summary counts
**As a** recruiter or manager, **I want to** see totals for interviews, passed candidates, failed candidates, and all candidates as soon as I land on the Dashboard, **so that** I can gauge pipeline health at a glance.

Acceptance criteria:
- Given I am on the Dashboard, then exactly 4 Quick Access cards render, labeled "Total Interview", "Total Passed Candidate", "Total Failed Candidate", and "Total Candidate", in that layout (top-left, top-right, bottom-left, bottom-right).
- Given the current data set, then "Total Interview" displays the value "48 interviews", "Total Passed Candidate" displays "5 candidates", "Total Failed Candidate" displays "4 candidates", and "Total Candidate" displays "35 candidates".
- Given "Total Passed Candidate" and "Total Candidate" use a blue circular icon and "Total Failed Candidate" uses a red circular icon, then this color coding must remain consistent across page reloads and role logins (i.e. it is a static semantic mapping, not per-session random).
- Given a new interview, candidate, pass, or fail event occurs elsewhere in the system, when I reload or revisit the Dashboard, then the corresponding count reflects the change without requiring a manual cache clear.

Estimate: 3 points. Priority: High.

### RMS-DASH-04: View Resource Demanding table
**As a** recruiter or manager, **I want to** see open resource demands with their deadlines and fulfillment progress on the Dashboard, **so that** I can spot urgent or overdue hiring needs without opening the Demand module.

Acceptance criteria:
- Given I am on the Dashboard, then the "Resource Demanding" table renders columns in this order: No., Project Name, Position, Qty, Exp. Level, Deadline, Resources, Status.
- Given the "Project Name", "Position", and "Deadline" column headers each render a sort-direction icon, when I click a sortable header, then the table re-sorts by that column and the icon reflects the active sort direction.
- Given the current data set, then row 1 reads: No. "1", Project Name "VK-Microsoft" (a clickable link), Position "Marketing Manager-VK", Qty "5000", Exp. Level "Junior", Deadline "31/Dec/2025", Resources "5" (a clickable link) with a "+" affordance beside it, Status "IN PROGRESS".
- Given a deadline date is in the past relative to today, then that Deadline value renders inside a red/danger-colored pill (as seen for "31/Dec/2025"); given a deadline is not yet passed, it should not use that danger styling — needs confirmation of the exact cutoff logic and styling for non-overdue rows (open question, since no non-overdue example is visible).
- Given a Status value of "IN PROGRESS", then it renders inside a green/success-colored pill; other status values and their colors are not yet observed (open question).
- Given the table has more rows than fit one page, then pagination controls at the bottom allow navigating pages and a "Total: N" count reflects the full row count; with the current single-row data set, pagination shows only page "1" and "Total: 1".
- Given I click the "Archive" button in the section header, then archived/closed resource demands are shown (destination behavior to be confirmed — separate spec).
- Given I click the "+ Add" button in the section header, then a form to create a new resource demand opens (separate spec, out of scope here).
- Given I click the "VK-Microsoft" project link, then I navigate to that project's detail view (separate spec, out of scope here).
- Given I click the "5" Resources link or its "+" icon, then I see the list of resources assigned to that demand, or can add one respectively (separate spec, out of scope here).

Estimate: 8 points (table + sort + pagination + status theming + 3 linked entry points). Priority: High. Dependency: Demand module spec. Open question: full status vocabulary and color mapping; overdue-deadline threshold logic; destination of "Archive".

### RMS-DASH-05: View Top Candidates
**As a** recruiter, **I want to** see a short list of top-rated candidates on the Dashboard, **so that** I can quickly jump to strong candidates without searching.

Acceptance criteria:
- Given I am on the Dashboard, then the "Top Candidates" section renders candidate cards, each with an avatar (photo if available, otherwise colored initials), a "Name:" label followed by the candidate's full name, a star rating (filled/unfilled out of 5), and a "View" button.
- Given the current data set, then exactly 3 cards render in this order: "Ms. Julie MARTIN" (photo avatar) rated 4 stars, "Mr. Pheakkdey MUT" (initials avatar "PM") rated 4 stars, "Mr. Kimlong KUN" (photo avatar) rated 4 stars.
- Given the section is meant to surface "top" candidates, then the cards shown should be the highest-rated candidates system-wide, sorted descending by rating — sort/selection rule needs confirmation from PM since all 3 visible examples tie at 4 stars (open question: tie-breaking order, and whether any 5-star candidates exist and would appear first).
- Given I click a candidate's "View" button, then I navigate to that candidate's Candidate Details page (see the existing RMS-CAND spec) for that specific candidate.
- Given I click the "+ Candidate" button in the section header, then a form to add a new candidate opens (separate spec, out of scope here).

Estimate: 5 points. Priority: Medium. Dependency: RMS-CAND-01 (Candidate Details header/identity). Open question: exact ranking/selection rule and card count limit (3 shown here — confirm if this is a fixed limit or responsive to card count of a "top N" setting).

### RMS-DASH-06: View This Week Interview panel
**As a** recruiter or interviewer, **I want to** see interviews scheduled for the current week on the Dashboard, **so that** I don't need to open the full Interview Schedule to check what's coming up.

Acceptance criteria:
- Given I am on the Dashboard, then the "This Week Interview" panel lists entries, each showing an initials avatar, the candidate's salutation + name, a position badge, a date/time string, and an "Interviewers" label followed by one badge per assigned interviewer.
- Given the current data set, then exactly 2 entries render: "Ms. Kanna TESTING" / badge "MARKETING MANAGER-VK" / "21/Sep/2026 01:37 PM" / interviewer badge(s) "CHAMRONG THOR"; and "Ms. Kanna II" / badge "MARKETING MANAGER-VK" / "22/Sep/2026 03:48 PM" / interviewer badge "CHAMRONG THOR".
- Given entries are scoped to "this week", then only interviews whose date falls within the current calendar week (as defined by the system's week start day — confirm Mon or Sun) are listed; an interview from a different week must not appear here even if it involves the same candidate.
- Given the "Ms. Kanna TESTING" entry currently renders two identical "CHAMRONG THOR" interviewer badges, then QA should confirm with the team whether this candidate genuinely has two interviewers both named Chamrong Thor, or whether this is a duplicate-render defect (flagged here as a likely bug, not a confirmed requirement) — a regression test should assert exactly one badge per distinct interviewer once resolved.
- Given entries are ordered by date/time ascending (21/Sep before 22/Sep in the current data), then this ordering must hold as more entries are added within the week.
- Given I click the "+ Interview" button in the panel header, then a form to schedule a new interview opens (separate spec, out of scope here).
- Given I click an entry, then I navigate to that interview's detail/edit view (separate spec, out of scope here — behavior not confirmed from the screenshot, open question).

Estimate: 5 points. Priority: High. Dependency: Interview Schedule module spec. Defect to verify: duplicate interviewer badge on the "Ms. Kanna TESTING" entry. Open question: week boundary definition; whether entries are clickable and where they lead.

### RMS-DASH-07: View This Week Reminder panel
**As a** recruiter, **I want to** see reminders due this week on the Dashboard, **so that** I don't miss a scheduled follow-up.

Acceptance criteria:
- Given I am on the Dashboard, then the "This Week Reminder" panel lists entries, each showing a colored type tag, a title, a date/time string, and a linked name.
- Given the current data set, then exactly 1 entry renders: type tag "INTERVIEW" (orange), title "Marketing Manager-VK", date/time "22/Sep/2026 03:48 PM", linked name "Ms. Kanna II".
- Given the reminder's date/time ("22/Sep/2026 03:48 PM") matches the second "This Week Interview" entry for "Ms. Kanna II" exactly, then this reminder should be understood as auto-generated from (or tied to) that interview — confirm with PM whether reminders can also be created independently of interviews, and if so what other type tags exist besides "INTERVIEW" (open question).
- Given entries are scoped to "this week", then only reminders due within the current calendar week are listed, consistent with the week-boundary rule from RMS-DASH-06.
- Given I click the "+ Reminder" button in the panel header, then a form to create a new reminder opens (separate spec, out of scope here).
- Given I click the linked candidate name ("Ms. Kanna II"), then I navigate to that candidate's Candidate Details page (see RMS-CAND spec).

Estimate: 3 points. Priority: Medium. Dependency: RMS-CAND-01, Reminder module spec. Open question: full set of reminder type tags/colors; whether reminders exist independent of interviews.

### RMS-DASH-08: Dashboard data freshness and empty states
**As a** user, **I want to** trust that Dashboard numbers and lists reflect current data, and understand what I see when there's nothing to show, **so that** I don't make decisions on stale or misleading information.

Acceptance criteria:
- Given any Quick Access count, Resource Demanding row, Top Candidate, This Week Interview entry, or This Week Reminder entry changes in its source module, when I reload the Dashboard, then the displayed value/list matches the source module's current state (no stale caching beyond a single reload).
- Given a section has zero items (e.g. no interviews scheduled this week, no reminders due this week, no resource demands open), then that section renders an explicit empty state (e.g. "No interviews this week") rather than an empty box or a broken layout — exact empty-state copy/design is not visible in the current screenshot and needs confirmation (open question, and a gap Claude Code should flag if no empty-state handling exists in the implementation).

Estimate: 3 points. Priority: Medium. Open question: empty-state copy and design for every section; whether counts are cached/debounced.

## Out of Scope (this epic)

The destination screens/flows opened from this page — Add Interview, Add Reminder, Add Candidate, Resource Demand Add/Archive/Detail, Candidate Detail (see existing RMS-CAND spec), global search results, and the Setting/Administration submenus — are separate specs and not covered here. Role-based visibility differences (this spec only observed the Super Admin role) are also out of scope until other-role screenshots are available.

## Open Questions for Refinement

Behavior and destination of the global search bar and its filter icon; contents of the Setting and Administration submenus; full status-pill vocabulary and color mapping for the Resource Demanding table, plus the exact overdue-deadline threshold logic; the selection/ranking rule and card-count limit for Top Candidates; the calendar week boundary used by "This Week Interview" and "This Week Reminder" (Monday or Sunday start); whether the duplicate "CHAMRONG THOR" interviewer badge on the Ms. Kanna TESTING entry is real data or a rendering defect; whether reminders can exist independent of interviews and what other reminder type tags exist; and empty-state copy/design for every section when it has zero items.

## Suggested Test Priorities for Claude Code

High-value, low-ambiguity tests to automate first: RMS-DASH-03 (exact Quick Access labels and values), RMS-DASH-04's static row assertions (column order and row 1 field values), RMS-DASH-05's card count/order/name assertions, and RMS-DASH-06/07's exact text and count assertions. Defer tests that depend on open questions above (sort behavior, empty states, submenu contents, search destination) until those are confirmed, or write them against documented expected behavior once the team answers the open questions.

---
*Feature spec derived from the current Dashboard (Home) screen, ALLWEB RMS, Super Admin role. Prepared for sprint backlog refinement and Claude Code test authoring — Paris Partners Softwares.*
