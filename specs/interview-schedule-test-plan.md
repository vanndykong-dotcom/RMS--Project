# Interview Schedule (Calendar) Test Plan

## Application Overview

Application under test: ALLWEB Recruitment Management System (RMS) Interview Schedule / Calendar module at https://rms-dev.allweb.com.kh/admin/calendar (real, production-like data — 30 event pills observed across August 2026 at time of planning). Login via /welcome using FAPA_EMAIL/FAPA_PASSWORD from .env (reuse `login()` from `tests/helpers/candidate-helpers.ts`), then click 'Interview Schedule' in the left sidebar tree (`page.getByRole('tree').getByRole('button', { name: 'Interview Schedule' })`) to land on `/admin/calendar`.

This plan covers all 7 acceptance criteria groups of the "Manage Interview Schedule" epic (user-stories/scrum_InterviewSchedule.md, RMS-CAL-01..07), refined against live exploration findings from 2026-08-24:

- **Breadcrumb confirmed exactly as specified**: `[class*="bread"]` element renders "Dashboard > Calendar > List calendar" (verified via live DOM read). Page heading is `role=heading name="Manage Interview Schedule"`, with a second heading holding the period label (e.g. "August 2026").
- **Toolbar buttons confirmed with exact accessible names**: `button[aria-label="prev"]` and `button[aria-label="next"]` (icon-only chevrons, no visible text), `button name="today"`, and three exact-match toggle buttons `button name="Day"`, `button name="Week"`, `button name="Month"`. The create entry point is `button name="Create Interview"` (icon "add" + text, top-right of the page header).
- **Two distinct search boxes exist on this page — do not confuse them.** The global topbar search (`textbox placeholder="Search"`) is unrelated to the calendar. The calendar's own search is `textbox placeholder="Search interviews, candidates..."` in the toolbar. Confirmed via network inspection that this search **filters the DOM** (not a highlight or jump-to-date): typing "Chhan" reduced visible event pills from 10 to 1 (the exact matching interview), and it fires a debounced (observed: 2 requests for 4 keystrokes typed 50ms apart) GET to `.../rms-service/api/v1/interview?pageSize=1000&page=1&startDate=01-08-2026&endDate=01-09-2026&filter={term}` — **this resolves the story's open question: search scope is the currently-displayed period only** (startDate/endDate match the visible month), not all dates. A no-match term (`zzzznotfound12345`) renders zero pills with **no empty-state message** — noted as an open UX item, not a defect to fix here.
- **Status colors confirmed, and the shared-color note in the story is verified with an added twist**: NEW REQUEST → CSS class `new-request`, text/border color `rgb(149,75,151)` (purple). PASSED → class `pass`, color `rgb(0,82,204)` (blue). IN PROGRESS **and** FOLLOWING UP both render with the exact same CSS class `following` and the exact same color `rgb(255,153,0)` (orange) — they are not just visually similar, they use the identical class name, which reads as IN PROGRESS reusing the "following-up" style rather than an intentional shared-color decision. Flagged as an open item for design/dev confirmation, tests should assert the current (shared) behavior and note it as such rather than asserting it as a bug.
- **Weekend shading and today highlight confirmed with exact computed colors**: Sat/Sun `.fc-col-header-cell` header text is `rgb(255,0,0)` on background `rgb(255,229,229)` (pink/red); Mon–Fri headers are unstyled (transparent bg, black text). The current day's cell (`.fc-day-today`) has background `rgba(255,220,40,0.15)` (pale yellow).
- **Event pill click opens a modal dialog** (`role="dialog"`), not a tooltip or side panel — resolves the story's RMS-CAL-06 open question. Confirmed dialog contents: candidate initials avatar, candidate name (e.g. "Miss. Chhan DONG"), status label, "Apply for" position, "Date & Time", "Interviewers", "Description", an "Edit" button, an interview-result action ("No Interview Result" / "Add Result"), and a "Close" button. A known pre-existing defect (documented in `tests/interview-schedule/reschedule-cancel.spec.ts`): the pill's own `.event-title` (candidate/position text) computes to 0px width once the status text is long, so a pill's day-cell text is effectively only "`{time} - {STATUS}`" to a real user — do not rely on candidate-name text being visible on the pill itself, only inside the opened dialog.
- **Create Interview dialog confirmed** (opens as a `role="dialog"` titled "Create Interview", not a full-page navigation): fields are Candidate*, Interviewers*, Date & time*, "Send invitation mail to candidate" (checkbox), "Reminder Me" + minutes-in-advance, Apply for*, Description (200-char limit), Cancel/Save buttons, plus a close (X) icon. This plan only verifies the entry point opens correctly and cancels out — completing a real interview creation is out of scope per instructions (and per the candidate-management plan's real-data safety note, should only ever target synthetic/automation-owned candidates if a later step chooses to test submission).
- **View toggle preserves date context, confirmed by live navigation**: from Month view, clicking "next" twice reached "October 2026"; switching to Week view then showed "Sep 28 – Oct 4, 2026" (the week containing Oct 1); switching to Day view then showed "October 1, 2026" — i.e. Week/Day default to the 1st of the last-viewed month when no specific day cell was clicked first. The "today" button reliably returns to the current month ("August 2026") regardless of how far navigation had drifted.
- **Real data safety note**: this is a read-only exploration environment with real interview/candidate records. Automated tests must not submit the Create Interview dialog, must not use the Edit action inside the event-detail dialog to save changes, and must always cancel/close such dialogs after verifying structure — mirroring the safety rule already established in `specs/candidate-management.md`. The existing `tests/interview-schedule/reschedule-cancel.spec.ts` (D2) already shows the accepted pattern: create a synthetic "QA Automation Test" candidate via `createSyntheticCandidate()`, set an interview on it, verify from the calendar, then cancel/archive — reuse that pattern rather than touching real candidates' interviews.
- Helpers to reuse from `tests/helpers/candidate-helpers.ts`: `login()`, `selectComboboxOption()`, `searchFor()` (candidate-list search — not applicable to the calendar's own search box, which needs its own wait-for-response helper mirroring the same debounce-safety pattern), `pickFutureCalendarDate()`, `createSyntheticCandidate()`, `openRowMenu()`/`clickRowMenuItem()`, `archiveCandidateFromActiveList()`, `ensureOnCandidateList()`. A later automation step should add a calendar-specific `searchCalendar(page, term)` helper following the same "fill + waitForResponse(filter=...)" shape as `searchFor()`, since the calendar search hits a different endpoint (`/rms-service/api/v1/interview`) than the candidate list.

## Test Scenarios

### 1. RMS-CAL-01: Month calendar view

**Seed:** none (read-only exploration of existing seeded interview data)

#### 1.1. CAL01-1. Month grid structure and header

**File:** `tests/interview-schedule/month-grid-structure.spec.ts`

**Steps:**
  1. Log in and navigate to Interview Schedule via the sidebar tree
    - expect: URL is `/admin/calendar`; breadcrumb reads "Dashboard > Calendar > List calendar"; heading "Manage Interview Schedule" is visible
  2. Observe the calendar toolbar and grid on initial load
    - expect: A period-label heading shows the current month and year (e.g. "August 2026")
    - expect: Column headers Sun–Sat are visible in that order
    - expect: The grid renders full weeks (leading/trailing days from adjacent months may appear, greyed/muted)
  3. Observe a day cell containing interviews
    - expect: Each interview renders as a pill with visible time and a status label (`{time} {Position/Track} - {STATUS}` format, noting the event-title text-collapse defect may hide the position/track portion visually)
  4. Observe a day cell with no interviews
    - expect: Cell renders empty, with no placeholder text (e.g. no "No events" string)

**Test data:** none required; relies on existing seeded interviews in August 2026.

#### 1.2. CAL01-2. Weekend shading

**File:** `tests/interview-schedule/weekend-shading.spec.ts`

**Steps:**
  1. On the Month view, locate the Sat and Sun column headers (`.fc-col-header-cell.fc-day-sat` / `.fc-day-sun`)
    - expect: Both have background color `rgb(255, 229, 229)` and text color `rgb(255, 0, 0)`
  2. Locate a Mon–Fri column header
    - expect: Background is transparent and text is default (black), i.e. visually distinct from weekend columns
  3. Locate a Saturday or Sunday day cell in the grid body (not just the header)
    - expect: The day cell itself also carries the weekend shading (verify via computed style), consistent with the header

**Test data:** none required.

#### 1.3. CAL01-3. Today highlight

**File:** `tests/interview-schedule/today-highlight.spec.ts`

**Steps:**
  1. On Month view showing the current month, locate today's cell (`.fc-day-today`)
    - expect: Background color is `rgba(255, 220, 40, 0.15)` (pale yellow), distinct from non-today cells
  2. Navigate away to a different month via "next", then navigate back via "today"
    - expect: The pale-yellow highlight is present only on the actual current date, and reappears correctly after returning via "today"

**Test data:** none required (date-relative; use `new Date()` in the test rather than a hardcoded date, per the `pickFutureCalendarDate()` lesson already learned in this codebase).

### 2. RMS-CAL-02: Day/Week/Month toggle

**Seed:** none

#### 2.1. CAL02-1. Toggle buttons visible and active state indicated

**File:** `tests/interview-schedule/view-toggle-buttons.spec.ts`

**Steps:**
  1. On the calendar toolbar, locate the three toggle buttons
    - expect: `button[name="Day"]`, `button[name="Week"]`, `button[name="Month"]` are all visible, top-right of the toolbar
    - expect: On initial load, "Month" is visually indicated as active (e.g. filled/highlighted class or `aria-pressed`) — capture the exact selector/attribute used for the active state during execution
  2. Click "Week"
    - expect: "Week" becomes the visually active button; "Month" no longer shows the active indicator
  3. Click "Day"
    - expect: "Day" becomes active; grid re-renders to a single-day layout

**Test data:** none required.

#### 2.2. CAL02-2. Switching views preserves date context

**File:** `tests/interview-schedule/view-toggle-preserves-date.spec.ts`

**Steps:**
  1. On Month view, click "next" twice to reach a future month (compute expected label from current date + 2 months, not a hardcoded string)
    - expect: Period-label heading updates to that month/year
  2. Click "Week"
    - expect: Period-label heading shows the week containing the 1st of the previously-viewed month (e.g. "Sep 28 – Oct 4, 2026" when the Month view had shown "October 2026")
  3. Click "Day"
    - expect: Period-label heading shows the 1st of that month (e.g. "October 1, 2026")
  4. Click "Month" again
    - expect: Returns to the same month/year shown in step 1 (the navigated-to month, not reset to today)

**Test data:** none required; use relative month math from the current date.

### 3. RMS-CAL-03: Period navigation

**Seed:** none

#### 3.1. CAL03-1. Prev/next chevrons update the period label

**File:** `tests/interview-schedule/period-navigation.spec.ts`

**Steps:**
  1. On Month view, record the current period label
    - expect: Label matches the actual current month/year
  2. Click `button[aria-label="next"]`
    - expect: Label advances by exactly one month
  3. Click `button[aria-label="prev"]` twice
    - expect: Label moves back two months from the value in step 2 (one month before the original)
  4. Click "today"
    - expect: Label resets to the current month/year regardless of prior navigation

**Test data:** none required.

#### 3.2. CAL03-2. Navigating many periods forward/back (edge case)

**File:** `tests/interview-schedule/period-navigation-far.spec.ts`

**Steps:**
  1. From Month view, click "next" 12 times in a row
    - expect: Label reflects exactly 12 months ahead of the starting month/year (e.g. crosses a year boundary correctly, Dec → Jan of next year); no error state or broken grid rendering
  2. Click "prev" 24 times in a row
    - expect: Label reflects 12 months before the original starting point; grid still renders correctly with no console errors
  3. Click "today"
    - expect: Returns cleanly to the current month regardless of the deep navigation

**Test data:** none required.

### 4. RMS-CAL-04: Search interviews and candidates

**Seed:** none (uses existing seeded interview data; avoid destructive actions)

#### 4.1. CAL04-1. Search input identity and placeholder

**File:** `tests/interview-schedule/search-input-identity.spec.ts`

**Steps:**
  1. Locate the calendar toolbar's search box specifically (`getByPlaceholder('Search interviews, candidates...')`), distinct from the unrelated global topbar search (`placeholder="Search"`)
    - expect: Exactly one match for the calendar-specific placeholder text

**Test data:** none required.

#### 4.2. CAL04-2. Search filters visible events (happy path)

**File:** `tests/interview-schedule/search-filters-events.spec.ts`

**Steps:**
  1. Record the number of visible event pills (`.custom-calendar-event`) before searching
    - expect: Baseline count recorded (>0, given seeded August 2026 data)
  2. Type a known candidate-name fragment that matches exactly one seeded interview (e.g. a fragment of a synthetic/automation-owned candidate's name, confirmed safe per the real-data note)
    - expect: A debounced GET fires to `.../api/v1/interview?...&filter={term}` scoped to the currently displayed month's `startDate`/`endDate`
    - expect: Visible pill count narrows to only the matching interview(s)
  3. Clear the search box
    - expect: The original, unfiltered pill count is restored

**Test data:** a search term guaranteed to match at least one seeded, non-destructive-to-touch interview (e.g. an automation-owned candidate's position tag "Software Testing Automation", already established elsewhere in this suite as safe).

#### 4.3. CAL04-3. Search with no matches (negative/edge case)

**File:** `tests/interview-schedule/search-no-matches.spec.ts`

**Steps:**
  1. Type a query guaranteed to match nothing (e.g. `zzzznotfound12345`)
    - expect: Pill count drops to 0
    - expect: Document current behavior: no explicit empty-state message is shown (open UX item — not treated as a defect without product/design confirmation)
  2. Clear the search box
    - expect: The full unfiltered list of pills for the current period is restored

**Test data:** a nonsense string with no realistic match.

#### 4.4. CAL04-4. Search is debounced

**File:** `tests/interview-schedule/search-debounce.spec.ts`

**Steps:**
  1. Type a multi-character term character-by-character with a short delay between keystrokes (e.g. `pressSequentially` with ~50ms delay)
    - expect: Fewer network requests fire than characters typed (confirms debounce is active rather than firing on every keystroke) — observed live: 4 keystrokes produced 2 requests
  2. Stop typing and wait
    - expect: Exactly one final request fires reflecting the complete typed term, and the pill list settles to match it

**Test data:** any 4+ character term.

#### 4.5. CAL04-5. Search scope is the current period only (documents resolved open question)

**File:** `tests/interview-schedule/search-scope-current-period.spec.ts`

**Steps:**
  1. On Month view showing the current month, inspect the outgoing filtered request's `startDate`/`endDate` query params while typing a search term
    - expect: `startDate`/`endDate` match the currently displayed month's boundaries (e.g. `startDate=01-08-2026&endDate=01-09-2026` for August 2026), confirming search does not silently jump the calendar to a different period to find matches elsewhere
  2. Navigate to a different month, then repeat a search for a term known to only exist in the original month
    - expect: No matching pill appears in the new month (search does not cross periods), consistent with a per-period filter rather than a global jump-to-match

**Test data:** a term known to match an interview in one specific, already-known month.

### 5. RMS-CAL-05: Create a new interview (entry point only)

**Seed:** none

#### 5.1. CAL05-1. Create Interview button visible and always accessible

**File:** `tests/interview-schedule/create-interview-entry-point.spec.ts`

**Steps:**
  1. On initial calendar load, locate the button
    - expect: `button[name="Create Interview"]` (icon "add" + label text) is visible in the top-right of the page header
  2. Switch to Week view, then Day view
    - expect: The button remains visible and unchanged in position/label across all three views
  3. Scroll the page (if the grid is tall enough to scroll)
    - expect: The button remains visible/reachable (per story: "always visible regardless of view or scroll position") — document actual behavior if it scrolls out of view, as that would be a gap versus the acceptance criterion

**Test data:** none required.

#### 5.2. CAL05-2. Clicking Create Interview opens the creation dialog (structure only, no submission)

**File:** `tests/interview-schedule/create-interview-dialog-structure.spec.ts`

**Steps:**
  1. Click "Create Interview"
    - expect: A `role="dialog"` opens titled "Create Interview" (not a full navigation to a separate page)
    - expect: Visible fields: Candidate*, Interviewers*, Date & time*, "Send invitation mail to candidate" checkbox, "Reminder Me" toggle with minutes-in-advance input, Apply for*, Description (200-char limit), Cancel and Save buttons
  2. Without filling any field, click "Cancel" (or the close "X" icon)
    - expect: Dialog closes; no new interview is created (spot-check: pill count for the current period is unchanged)

**Test data:** none required — this scenario explicitly does not submit the form (per task instructions, entry-point exploration only; a future step covering the interview-creation form itself, out of scope for this epic per the story's "Out of Scope" section, would own full submission testing).

#### 5.3. CAL05-3. Successful creation reflects on the calendar without reload (synthetic candidate only — flagged for a later automation step)

**File:** `tests/interview-schedule/create-interview-success.spec.ts`

**Steps:**
  1. Using a synthetic/automation-owned candidate (per the safety rule already established in `specs/candidate-management.md`), open "Create Interview" and fill all required fields with valid data (candidate, interviewer, a future date/time via a `pickFutureCalendarDate()`-style helper, Apply for = "Software Testing Automation")
    - expect: Form validates and "Save" is enabled
  2. Click "Save"
    - expect: Dialog closes; the new interview's pill appears in the correct day cell without a full page reload (verify via network — no full document navigation, only XHR)
  3. Clean up: locate the created interview and remove/cancel it if a cancel action exists, or note as a known cleanup gap otherwise

**Test data:** one synthetic automation-owned candidate (e.g. reuse `createSyntheticCandidate()` from `candidate-helpers.ts`), a future date computed relative to "now", interviewer "Chamrong THOR" (already used successfully in `reschedule-cancel.spec.ts`), Apply for = "Software Testing Automation".

### 6. RMS-CAL-06: Interview status at a glance

**Seed:** none

#### 6.1. CAL06-1. Status colors match the confirmed model, text label always present

**File:** `tests/interview-schedule/status-colors.spec.ts`

**Steps:**
  1. Locate a NEW REQUEST pill (`.custom-calendar-event.new-request`)
    - expect: Computed text/border color is `rgb(149, 75, 151)` (purple); the literal text "NEW REQUEST" is present in the pill (not color-only)
  2. Locate a PASSED pill (`.custom-calendar-event.pass`)
    - expect: Computed color `rgb(0, 82, 204)` (blue); text "PASSED" present
  3. Locate an IN PROGRESS pill and a FOLLOWING UP pill (both currently render with CSS class `.custom-calendar-event.following`)
    - expect: Both computed colors are `rgb(255, 153, 0)` (orange) — document this as the confirmed current (shared) behavior, resolving the story's open question about whether the shared color is intentional; flag to design/PM that the underlying CSS class name (`following`) is shared too, suggesting IN PROGRESS may be unintentionally reusing FOLLOWING UP's style
  4. For each status above, confirm the status text label is present in the pill DOM (accessibility: not conveyed by color alone)
    - expect: All four statuses show their literal text label

**Test data:** none required; relies on at least one seeded interview of each status existing in the visible month (confirmed present in August 2026 at planning time — re-verify at execution time and seed via `createSyntheticCandidate()` + status changes if any status is missing).

#### 6.2. CAL06-2. Clicking a pill opens a detail dialog (resolves hover-vs-click open question)

**File:** `tests/interview-schedule/event-detail-dialog.spec.ts`

**Steps:**
  1. Click any event pill
    - expect: A `role="dialog"` opens (not a tooltip, not a side panel) showing: candidate initials avatar, candidate name, status, "Apply for" position, "Date & Time", "Interviewers", "Description", an "Edit" button, an interview-result control ("No Interview Result"/"Add Result" or similar), and a "Close" button
  2. Click "Close" (do not click "Edit" and save, per the real-data safety note)
    - expect: Dialog closes, calendar view unchanged

**Test data:** any existing seeded interview pill.

#### 6.3. CAL06-3. Status colors are consistent across Day/Week/Month views

**File:** `tests/interview-schedule/status-colors-consistency.spec.ts`

**Steps:**
  1. On Month view, note the computed color of one pill of each status present
    - expect: Colors recorded per RMS-CAL06-1
  2. Switch to Week view (navigated to the same period containing those interviews), locate the same pills
    - expect: Colors are unchanged from Month view
  3. Switch to Day view for a day containing at least one of those interviews
    - expect: Color is unchanged from Month/Week view

**Test data:** relies on interviews with known statuses in a specific day; reuse the interviews identified in 6.1.

### 7. RMS-CAL-07: Breadcrumb navigation

**Seed:** none

#### 7.1. CAL07-1. Breadcrumb text and link behavior

**File:** `tests/interview-schedule/breadcrumb.spec.ts`

**Steps:**
  1. On the calendar page, locate the breadcrumb element (`[class*="bread"]`)
    - expect: Text reads exactly "Dashboard > Calendar > List calendar"
  2. Click the "Dashboard" segment
    - expect: Navigates to `/admin/dashboard`
  3. Return to the calendar, click the "Calendar" segment (if it is a separate clickable link distinct from "List calendar")
    - expect: Document actual behavior — either it also lands on `/admin/calendar` (since List calendar is the only page under it) or is non-interactive; do not assume without confirming during execution
  4. Confirm "List calendar" (the current page segment) is not a link
    - expect: Rendered as plain text, not clickable, consistent with breadcrumb conventions for the active page

**Test data:** none required.

## Open Items Carried Forward (not fixed here, flagged for design/dev/PM)

1. IN PROGRESS and FOLLOWING UP pills share not just a color but the same underlying CSS class (`following`) — confirm with design/dev whether IN PROGRESS should have its own distinct style.
2. A no-match search result shows zero pills with no "no results" message — confirm with design/PM whether an empty-state message is desired.
3. The pre-existing defect noted in `tests/interview-schedule/reschedule-cancel.spec.ts` (event `.event-title` collapsing to 0px width for long status text, hiding the candidate/position name on the pill itself) still applies to every pill in this module and should be considered when writing selectors for later automation — prefer matching on `{time} - {STATUS}` text or the day-cell/status CSS class rather than assuming the position/candidate name is visible on the pill.
4. The "Calendar" breadcrumb segment's exact link target (vs. "List calendar" as a separate node) was not fully disambiguated live and should be confirmed during automation-script execution.
5. Whether the "Create Interview" button truly stays visible through all scroll positions (per story wording "always visible regardless of view or scroll position") was not exhaustively verified against a very tall/scrolled Day view — flagged for confirmation during execution.
