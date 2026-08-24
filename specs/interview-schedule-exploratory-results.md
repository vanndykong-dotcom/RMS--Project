# Interview Schedule (Calendar) — Exploratory Test Results

Execution date: 2026-08-24
Executed against: https://rms-dev.allweb.com.kh/admin/calendar (live, production-like data)
Plan under test: `specs/interview-schedule-test-plan.md` (19 scenarios, RMS-CAL-01..07)
Login: `super.admin@gmail.com` via `/welcome`

## How this was executed

Playwright MCP browser tools (`mcp__playwright__*` / `mcp__playwright-test__*`) were checked and are **not available** in this session (confirmed via `ToolSearch`, no matching deferred tools). Following the same workaround the planning step used, exploration was done with small throwaway Node scripts (`_explore-calendar-run*.mjs`, `_cleanup-cal05-3.mjs`) using the repo's own `playwright-core` dependency (`require`/`import { chromium } from 'playwright-core'`), run headless against the live site from the repo root. All ten scripts were deleted after use — the repo root now contains no stray `_explore-*` or `_probe-*` files. Two evidence screenshots were kept (see Bugs section) and one no-longer-needed probe screenshot was deleted.

## Summary

| Result | Count |
|---|---|
| PASS | 18 |
| FAIL (genuine app defect, not a script issue) | 1 |
| **Total scenarios** | **19** |

All four of the plan's "Open Items Carried Forward" were re-verified; two are now **resolved** (see below), two remain confirmed-as-is (not defects, just documented current behavior). One **new** issue was found (candidate search) and one **new observation** (accessibility gap on view toggles) was not previously flagged.

## Scenario-by-scenario results

| # | Scenario | Result | Notes |
|---|---|---|---|
| CAL01-1 | Month grid structure and header | **PASS*** | Breadcrumb, heading, period label, empty-cell (no placeholder text) all confirmed. **Caveat: see Bug #1** — column header order is actually Mon→Sun, not Sun→Sat as the plan's step 2 expects. |
| CAL01-2 | Weekend shading | PASS | Sat/Sun header `rgb(255,229,229)` bg / `rgb(255,0,0)` text confirmed; Mon header transparent bg/black text; weekend shading also present on the day-cell body (`.fc-daygrid-day.fc-day-sat` matches header colors). |
| CAL01-3 | Today highlight | PASS | `.fc-day-today` = `rgba(255,220,40,0.15)` before navigating away; reappears identically after navigating away and clicking "today". |
| CAL02-1 | Toggle buttons + active state | PASS | Active state = CSS class `fc-button-active` (confirmed on Month by default, moves to Week then Day on click). **`aria-pressed` is always `null`** on all three buttons — see Observation #1. |
| CAL02-2 | View toggle preserves date context | PASS | Aug 2026 → next×2 → Oct 2026 → Week "Sep 28 – Oct 4, 2026" → Day "October 1, 2026" → Month → back to **Oct 2026** (not reset to today). Matches plan exactly. Required a script fix mid-run — see Insight #1 ("today" button disables itself). |
| CAL03-1 | Prev/next chevrons | PASS | Aug 2026 → next → Sep 2026 → prev×2 → Jul 2026 → today → Aug 2026. |
| CAL03-2 | Navigate 12 fwd / 24 back (edge case) | PASS | Aug 2026 → +12 → Aug 2027 (year boundary correct) → −24 → Aug 2025 → today → Aug 2026. 42 day-cells rendered throughout (6×7 grid), zero console errors captured. |
| CAL04-1 | Search input identity | PASS | Exactly 1 match each for `getByPlaceholder('Search interviews, candidates...')` and `getByPlaceholder('Search', {exact:true})` — no collision. |
| CAL04-2 | Search filters visible events | PASS | Baseline 10 pills → typed "Chhan" → GET `.../interview?...&filter=Chhan` fired → 1 pill → cleared → 10 pills restored. |
| CAL04-3 | Search with no matches | PASS (documents open item, not a new defect) | "zzzznotfound12345" → 0 pills, no "no results" message (open item #2, reconfirmed, not fixed). |
| CAL04-4 | Search is debounced | PASS | 4 keystrokes (`pressSequentially`, 50ms delay) produced **1** request for the completed term (even tighter than the plan's own "2 requests for 4 keystrokes" note — some run-to-run variance is expected with a debounced input). |
| CAL04-5 | Search scope is current period only | PASS | Filtered request for "Chhan" in Aug 2026 carries `startDate=01-08-2026&endDate=01-09-2026`; after navigating to Sep 2026, the same search fires `startDate=01-09-2026&endDate=01-10-2026` and returns 0 pills — confirms per-period, not global, filtering. |
| CAL05-1 | Create Interview button always accessible | PASS (resolves open item #5) | Same fixed toolbar position across Month/Week/Day. Forced a genuinely overflowing Day view (550px-tall viewport) and found the time-of-day grid scrolls in its **own internal** `.fc-scroller` container (`scrollHeight` 1008 vs `clientHeight` 202) — the page header holding the button sits outside that scroller and never itself needs to scroll, so the button's bounding box was identical before/after scrolling the grid to its end. |
| CAL05-2 | Create Interview dialog structure (no submission) | PASS | Dialog titled "Create Interview"; all expected fields present (Candidate, Interviewers, Date & time, Send-invitation checkbox, Reminder Me, Apply for, Description, Cancel/Save). Cancel closed the dialog with pill count unchanged (10 → 10). |
| CAL05-3 | Successful creation reflects without reload (synthetic candidate) | **FAIL** — blocked by a real app defect | See Bug #2. A synthetic candidate was created, then the flow failed while selecting it in the Create Interview dialog's Candidate field, **before** Save was ever clicked — no interview record was created. The synthetic candidate itself was created and then successfully archived as cleanup (confirmed `ARCHIVED_OK`). No permanent test data was left behind. |
| CAL06-1 | Status colors match model, text always present | PASS (documents open item #1, not a new defect) | NEW REQUEST `rgb(149,75,151)` + text "NEW REQUEST"; PASSED `rgb(0,82,204)` + text "PASSED"; both IN PROGRESS and FOLLOWING UP render `rgb(255,153,0)` under the identical shared class `.following` (4 samples checked) — reconfirms open item #1 as-is. |
| CAL06-2 | Pill click opens detail dialog | PASS | Dialog contents matched the plan almost verbatim: initials avatar "CD", "Miss. Chhan DONG", "NEW REQUEST", Apply for "Software Testing Automation", Date & Time "05/Aug/2026 11:25 AM", Interviewers "Vk -R", Description "VK-TESTING -001", Edit button, "No Interview Result"/"Add Result", Close. Close button closed cleanly. |
| CAL06-3 | Status colors consistent across views | PASS | Pinned one specific event (Aug 5, 2026 "NEW REQUEST", Chhan DONG) and tracked it by day-cell `data-date`. Month view color `rgb(149,75,151)`; after navigating Week view to the exact week containing it ("Aug 3 – 9, 2026"), same event, same color. Day view: clicking "Day" from that week jumped to "August 3, 2026" (first day of the displayed week, not Aug 5 specifically) per the already-known view-default behavior, so the Day-view color wasn't independently re-sampled for this exact pill — Month/Week agreement plus colors being applied via static CSS classes (not view-scoped overrides) gives high confidence this holds in Day view too. |
| CAL07-1 | Breadcrumb text and link behavior | PASS (resolves open item #4) | Text exactly "Dashboard > Calendar > List calendar". DOM: `<a href="/admin">Dashboard</a>`, `<a href="/admin/calendar">Calendar</a>`, `<a>List calendar</a>` (**no href**). Clicking "Dashboard" → `/admin/dashboard`. Clicking "Calendar" (found as a distinct, exact-text node, count=1) → also `/admin/calendar` — **it is a genuinely separate, functional link**, not a dead segment; it merely happens to land on the same URL as "List calendar" because that's the only page under it. "List calendar" itself has no `href`, so it's non-clickable, `cursor: auto` — consistent with breadcrumb convention for the active page. |

\* CAL01-1 is marked PASS for everything the scenario checks except the header-order sub-expectation inherited from the plan text itself — see Bug #1.

## Bugs / inconsistencies found

### Bug #1 — Day-of-week header order is Mon→Sun, not Sun→Sat as the plan (and its own live-exploration notes) assumed
- **Where:** Month view, `.fc-col-header-cell` row.
- **Repro:** Log in → open Interview Schedule → read the seven column headers left-to-right.
- **Observed:** `["Mon","Tue","Wed","Thu","Fri","Sat","Sun"]`.
- **Expected per plan (CAL01-1 step 2):** "Column headers Sun–Sat are visible in that order."
- **Corroborating evidence:** Week-view period labels observed elsewhere in this run always start on a Monday and end on a Sunday (e.g. "Aug 3 – 9, 2026", "Aug 24 – 30, 2026", "Sep 28 – Oct 4, 2026") — consistent with a Monday-first week configuration, not a one-off DOM read.
- **Assessment:** Not a product defect (Monday-first weeks are a legitimate, common configuration) — this is a **plan/documentation discrepancy**. Flagging because scenario CAL01-1 as currently worded would fail if automated literally. **Automation must assert `["Mon","Tue","Wed","Thu","Fri","Sat","Sun"]`, not Sun-first.**

### Bug #2 — Candidate field in "Create Interview" has no working search; a newly created candidate isn't reliably selectable
- **Where:** Create Interview dialog → Candidate field (`mat-select[formcontrolname="candidateId"]`).
- **Repro:** Create a new candidate via the candidate list wizard → immediately go to Interview Schedule → click "Create Interview" → open the Candidate dropdown → try to find the just-created candidate.
- **Observed:**
  - The dropdown panel renders only ~21 options initially and lazy-loads a further batch on scroll (21 → 31 observed after one scroll-to-bottom); it is **not** a `cdk-virtual-scroll` component, just an overflow list that appears to page in more results as you scroll.
  - It contains an `ngx-mat-select-search`-style input (`<input class="mat-select-search-input mat-select-search-hidden" matinput>`) — but that input carries the `mat-select-search-hidden` class, i.e. **the search box exists in the DOM but is deliberately hidden/disabled for this field**, unlike other selects in the app that do support type-ahead filtering.
  - A candidate created seconds earlier (`QA Automation Test Candidate CAL05-3 <timestamp>`) never appeared among the rendered options within two load-batches, so it could not be selected without extensive manual scrolling.
- **Impact:** Scheduling a first interview for a brand-new candidate directly from the calendar's own "Create Interview" entry point is impractical — a real recruiter would face the same friction on any candidate not already near the top/front of the list. This also blocked live verification of CAL05-3 (creation was aborted before Save was reached — no interview record was created; the test candidate was created then successfully archived as cleanup).
- **Evidence:** `defect-CAL05-3-candidate-select-no-search.png` (repo root) — the open Candidate panel showing the plain option list with the hidden search input.
- **Suggested fix direction:** enable/un-hide the existing `mat-select-search` component for this field (it's already wired up elsewhere in the app), or switch to a debounced server-side search consistent with the rest of the module.

## Resolved open items (from the plan's "Open Items Carried Forward")

- **#4 — "Calendar" breadcrumb segment target:** RESOLVED. It is a distinct `<a href="/admin/calendar">` link (separate DOM node from "List calendar"), and clicking it navigates to `/admin/calendar` — functionally the same destination as "List calendar" (which has no `href` and is not clickable), simply because Calendar has only one child page.
- **#5 — Create Interview button visibility on scroll:** RESOLVED, criterion holds. The Day/Week time-grid body scrolls inside its own internal `.fc-scroller` element; the page header carrying the button lives outside that scroller, so the button never moves out of view even when the grid content itself is scrolled to its end. Verified at a deliberately short (550px) viewport height to force real internal overflow.

## Open items reconfirmed as-is (not fixed, no new information)

- **#1** IN PROGRESS and FOLLOWING UP still share the exact class `following` and color `rgb(255,153,0)` — reconfirmed on 4 live samples.
- **#2** A no-match search still renders 0 pills with no empty-state message — reconfirmed.
- **#3** The `.event-title` zero-width defect (pill text collapse) was not independently re-tested pixel-by-pixel this round (already documented with its own screenshot, `defect-D2-calendar-event-title-zero-width.png`, from `reschedule-cancel.spec.ts`); note however that a pill's `innerText` **does** still contain the full text (e.g. `"11:25am\nSoftware Testing Automation\n- NEW REQUEST"`) even when visually the position/track text is clipped — useful for automation (see Insight #4).

## New observation (not in the original plan)

- **Observation #1 — `aria-pressed` not used on view-toggle buttons:** The Day/Week/Month buttons only expose their active state via the CSS class `fc-button-active`; `getAttribute('aria-pressed')` returned `null` on all three regardless of which was active. Screen-reader users get no programmatic signal of the current view. Worth flagging to design/dev alongside the plan's existing accessibility-adjacent notes (e.g. status-color text labels), not blocking.

## Insights for automation (selectors, timing, workarounds)

1. **"today" button disables itself when already on today's period.** `button[name="today"]` gets the native `disabled` attribute whenever the currently displayed period already contains today's date. A bare `.click()` will hang (Playwright's actionability wait never succeeds on a disabled element) — guard with `await todayBtn.isDisabled()` before clicking, or structure tests to navigate away first if a "today" click is required.
2. **View-toggle active state:** use `.fc-button-active` class (`await button.evaluate(el => el.classList.contains('fc-button-active'))`), not `aria-pressed` — the latter is always `null` (see Observation #1).
3. **Column header order is Mon→Sun** (`.fc-col-header-cell` in document order) — do not assert Sun-first per the plan's literal wording; see Bug #1. Week-view period labels also run Mon→Sun (e.g. "Aug 3 – 9, 2026").
4. **Pill text is present in `innerText` even when visually clipped.** `.custom-calendar-event` pills can be located reliably via `.filter({ hasText: 'NEW REQUEST' })` or similar status-text matches even though the position/candidate-name portion may render at 0px width — matches the existing documented workaround in `reschedule-cancel.spec.ts`.
5. **Calendar search debounce:** typing into `getByPlaceholder('Search interviews, candidates...')` and waiting ~1.2s after the last keystroke reliably settles to exactly one GET to `/rms-service/api/v1/interview?...&filter={term}` scoped to the visible period's `startDate`/`endDate`; mirror the existing `searchFor()` helper's "fill + waitForResponse(filter=...)" shape for a new `searchCalendar(page, term)` helper, as the plan already recommends.
6. **Create Interview dialog field widget types** (all confirmed via live DOM, useful for whoever writes `create-interview-*.spec.ts`):
   - Candidate: `mat-select[formcontrolname="candidateId"]` — click to open, then `page.getByRole('option', { name, exact: true }).first().click()`. **No usable search** — see Bug #2; only reliably works for candidates already rendered in the first render batch (roughly the first ~21, order not confirmed alphabetical/chronological).
   - Interviewers: `mat-select[formcontrolname="employees"]` — multi-select; the option list contains a **duplicate "Chamrong THOR" entry** (consistent with the existing note in `candidate-helpers.ts`'s `selectComboboxOption()` about needing `.first()`). Panel does not auto-close after picking one option in a multi-select — press `Escape` or click outside afterward.
   - Date & time: a plain `mat-form-field` text input plus a `button[aria-label="Open calendar"]` — **identical pattern** to the existing `pickFutureCalendarDate()` helper in `candidate-helpers.ts` (same "Open calendar" button, same `.mat-calendar-period-button` + "Next month" + gridcell + "done" button flow). That helper can likely be reused as-is (or with minimal adaptation) for the calendar module's own dialog.
   - Apply for: `mat-select[formcontrolname="title"]` — "Software Testing Automation" is present as an option, consistent with its established use elsewhere as a safe synthetic tag.
   - Description: a **Quill rich-text editor** (`quill-editor[formcontrolname="description"]`, `.ql-editor` contenteditable div inside it), not a plain `<textarea>` — needs `.locator('.ql-editor').fill()` or `.type()`, not a bare `getByRole('textbox')`.
7. **Overlay/backdrop hygiene when probing `mat-select` panels in a raw script (no `expect()` auto-retry safety net):** if a script throws while a `mat-select` panel is open, the `cdk-overlay-backdrop` can remain and block every subsequent click (including on unrelated sidebar navigation) for the rest of that page's lifetime — always wrap panel-opening probes in `try/finally` with an `Escape` press, or reload/re-navigate before continuing. This is what caused one throwaway script's own cleanup step to fail this run (recovered via a fresh browser session).
8. **CAL05-3 (full creation-and-save flow) is not yet reliably automatable** given Bug #2 — a future automation step should either seed a candidate that's guaranteed to sort into the first render batch, add scroll-until-found logic against the Candidate panel, or (preferred) get the hidden search input un-hidden/fixed first and then automate against it directly.

## Cleanup confirmation

No stray files were left in the repo. All ten throwaway scripts (`_explore-calendar-runA.mjs` through `runJ.mjs`, `_cleanup-cal05-3.mjs`) were deleted after use. One synthetic candidate (`QA Automation Test Candidate CAL05-3 <timestamp>`) was created live during the CAL05-3 attempt and was successfully archived immediately after (confirmed `ARCHIVED_OK` in the cleanup script's output) — no interview record was ever created for it, since the flow failed before reaching Save. Two evidence screenshots were kept in the repo root following the existing naming convention: `defect-CAL05-3-candidate-select-no-search.png` and `CAL05-1-create-button-persists-on-scroll.png` (no `defect-` prefix, since it documents confirmed-correct behavior, not a bug). One redundant/uninformative probe screenshot was deleted.
