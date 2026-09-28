# Feature Spec — Manage Interview Schedule

**Module:** Calendar (Dashboard > Calendar > List calendar)
**Epic:** RMS-CAL — Manage Interview Schedule
**Source:** Existing UI screenshot, RMS System, August 2026 build

## Epic Description

As a recruiter or hiring coordinator, I need a calendar view of all scheduled candidate interviews so I can see what's coming up, check on status at a glance, search for a specific interview or candidate, and create new interviews without leaving the calendar. This epic covers the calendar screen itself: navigation, display of interview events, status color-coding, search, and interview creation entry point. It does not cover the interview creation form or candidate detail screens, which are separate features referenced below as dependencies.

## Status Model

The calendar renders each interview as a pill labeled `{time} {Position/Track} - {STATUS}`. Four statuses are visible in the current build, each with its own color:

| Status | Color | Meaning |
|---|---|---|
| NEW REQUEST | Purple/magenta | Interview requested, not yet confirmed or started |
| IN PROGRESS | Orange/yellow | Interview process is actively underway |
| FOLLOWING UP | Orange/yellow | Awaiting a follow-up action (e.g. feedback, next round scheduling) |
| PASSED | Blue | Candidate passed this interview stage |

Note: IN PROGRESS and FOLLOWING UP currently share the same color. This should be confirmed with design — if they're meant to be visually distinct, they need separate colors; if the shared color is intentional (both read as "active/pending"), that should be documented rather than left ambiguous.

## User Stories

### RMS-CAL-01: View interviews in a monthly calendar
**As a** recruiter, **I want to** see all scheduled interviews laid out on a month grid, **so that** I can quickly scan interview volume and timing across weeks.

Acceptance criteria:
- Calendar displays a full month grid (Sun–Sat columns) with the current month and year shown in the header (e.g. "August 2026").
- Each day cell shows all interviews scheduled that day, stacked vertically, each showing time, position/track, and status.
- Weekend columns (Sat, Sun) are visually distinguished (currently shaded pink/red, with header text in red).
- The current day is visually highlighted (currently shaded pale yellow).
- Days with no interviews render as empty cells without placeholder text.

Estimate: 5 points. Priority: High.

### RMS-CAL-02: Switch between Day, Week, and Month views
**As a** recruiter, **I want to** toggle between Day, Week, and Month views, **so that** I can drill into a single day's schedule or zoom out to plan across the month.

Acceptance criteria:
- Three toggle buttons (Day / Week / Month) are always visible in the top-right of the calendar toolbar.
- The active view is visually indicated (currently a filled blue pill).
- Switching views preserves the currently selected date/period where possible (e.g. switching from Month to Day lands on today or the last-viewed date).

Estimate: 5 points. Priority: High.

### RMS-CAL-03: Navigate between periods
**As a** recruiter, **I want to** move forward/backward through months (or weeks/days) and jump back to today, **so that** I can review past interviews or plan ahead without losing my place.

Acceptance criteria:
- Left/right chevron controls step the calendar back/forward one period at a time (one month in Month view).
- A "today" button resets the view to the current date regardless of how far the user has navigated.
- The period label (e.g. "August 2026") updates immediately on navigation.

Estimate: 3 points. Priority: High.

### RMS-CAL-04: Search interviews and candidates
**As a** recruiter, **I want to** search by candidate name, position, or keyword, **so that** I can find a specific interview without scrolling through the calendar.

Acceptance criteria:
- A search input labeled "Search interviews, candidates..." is available in the toolbar.
- Typing a query filters or highlights matching interview pills across the visible calendar (behavior — filter vs. jump-to — needs confirmation from design/PM).
- Empty search returns to the unfiltered calendar view.
- Search is debounced to avoid firing on every keystroke.

Estimate: 5 points. Priority: Medium. Open question: does search restrict to the currently displayed period, or search across all dates and jump the calendar to the first match?

### RMS-CAL-05: Create a new interview
**As a** recruiter, **I want to** open a create-interview form from the calendar, **so that** I can schedule a new interview without navigating away.

Acceptance criteria:
- A prominent "+ Create Interview" button sits in the top-right of the page header, always visible regardless of view or scroll position.
- Clicking it opens the interview creation flow (separate spec — out of scope here) pre-filled with the currently selected date if one is active.
- On successful creation, the new interview appears on the calendar in the correct date cell without requiring a full page reload.

Estimate: 3 points (calendar-side integration only; excludes the form itself). Priority: High. Dependency: interview creation form/modal spec.

### RMS-CAL-06: View interview status at a glance
**As a** hiring manager, **I want to** distinguish interview statuses by color and label, **so that** I can tell what needs my attention without opening each interview.

Acceptance criteria:
- Each interview pill is colored according to the Status Model above and shows the status label as text (not color alone, for accessibility).
- Hovering or clicking a pill surfaces full interview details (candidate, interviewer, time, status) — exact interaction (tooltip vs. modal vs. side panel) to be confirmed.
- Status colors are consistent across Day, Week, and Month views.

Estimate: 5 points. Priority: Medium.

### RMS-CAL-07: Breadcrumb navigation
**As a** user, **I want to** see where the calendar sits in the app's navigation hierarchy, **so that** I can orient myself and navigate back to parent screens.

Acceptance criteria:
- Breadcrumb reads "Dashboard > Calendar > List calendar" and each segment before the current page is a working link back to that screen.

Estimate: 1 point. Priority: Low.

## Out of Scope (this epic)

Interview creation form fields and validation, candidate profile/detail view, interviewer assignment and availability, notifications/reminders for upcoming interviews, and reporting/analytics on interview outcomes are all separate specs and not covered here.

## Open Questions for Refinement

Whether IN PROGRESS and FOLLOWING UP should have visually distinct colors needs a design decision. The exact interaction for viewing full interview details from a pill (click vs. hover) needs to be specified before RMS-CAL-06 can be estimated with confidence. Search scope (current view only vs. all dates) needs a product decision before RMS-CAL-04 is built.

---
*Feature spec derived from the current Manage Interview Schedule screen, RMS System. Prepared for sprint backlog refinement — Paris Partners Softwares.*
