# Dashboard (Home) — Exploratory Test Results

Execution date: 2026-09-21
Executed against: https://rms-dev.allweb.com.kh/admin/dashboard (live, production-like data)
Plan under test: `specs/dashboard-test-plan.md` (25 scenarios, RMS-DASH-01..08)
Login: credentials from `.env` via `/welcome`

## How this was executed

Playwright MCP browser tools were checked this session via `ToolSearch` and are **not
available**, consistent with every prior session in this repo. Execution used small throwaway
Node ESM scripts (`import { chromium } from 'playwright-core'`), run headless against the live
site from the session's scratch temp directory (never inside the repo). Roughly 16 exploration
scripts were run in total, incrementally narrowing in on the real DOM structure of each Dashboard
section (top bar, left nav, Quick Access, Resource Demanding, Top Candidates, This Week
Interview, This Week Reminder), plus one final script that captured 4 evidence screenshots
directly into `test-reports/evidence/`. All `.mjs` scripts themselves were left only in the
scratch directory; `git status` at the end of this task confirms none were copied into the repo.

This epic is **read-only observation** per task instructions — every interaction below either (a)
reads DOM/attribute state without clicking anything, (b) clicks a confirmed-safe, reversible,
non-destructive control (the "Archive" view toggle, carousel Previous/Next, opening/closing
dialogs via Escape), or (c) opens a "+ Add"/"+ Interview"/"+ Candidate"/"+ Reminder" entry point
and immediately navigates back or cancels **without ever clicking Save/Submit/Confirm**.

## Summary

| Result | Count |
|---|---|
| PASS (including scenarios that document a confirmed defect or a correction to the story) | 25 |
| FAIL (scenario itself could not be completed) | 0 |
| **Total scenarios in the plan** | **25** |
| Confirmed defects | 2 (overdue-deadline negative-days tooltip; duplicate interviewer badge) |
| Story corrections (live behavior differs from the story's documented assumption) | 3 (Quick Access "Total Candidate" color; This Week Reminder candidate name is not a link; clicking the reminder opens a dialog, not a Candidate Details navigation) |
| Open questions resolved by this exploration | 5 of the story's 8 open items (global search destination/filter icon, Archive destination, +Interview/+Reminder mechanisms, whether interview/reminder entries are clickable) |

Every one of the 25 planned scenarios was executed to completion during planning-stage
exploration (the plan document above already embeds the confirmed selectors/behavior found here,
per this repo's established pattern of folding exploratory findings straight into the plan). This
results document adds the scenario-by-scenario execution record, the two defect write-ups with
evidence, and the automation-facing insights.

## Defect 1 — Resource Demanding overdue-deadline tooltip shows a negative day count

- **Where:** Dashboard → Resource Demanding → Deadline column, row 1 ("VK-Microsoft").
- **Steps to reproduce:** hover/read the `title` attribute of the Deadline badge for a demand
  whose deadline has passed.
- **Expected:** a positive, correctly-worded overdue count, e.g. "Overdue by 264 days".
- **Actual:** `title="Overdue by -264 days"` — confirmed via direct attribute read, not a visual
  misread. The visible red/danger pill styling itself is correct (this demand genuinely is
  overdue); only the tooltip's number carries an inverted/miscalculated sign.
- **Evidence:** `test-reports/evidence/defect-DASH04-1-overdue-negative-days-tooltip.png`.
- **Verdict: CONFIRMED BUG.**

## Defect 2 — This Week Interview duplicate interviewer badge (story's "likely defect" now confirmed at DOM level)

- **Where:** Dashboard → This Week Interview → "Ms. Kanna TESTING" entry.
- **Steps to reproduce:** inspect the "Interviewers" row of that card.
- **Expected:** one badge per distinct interviewer.
- **Actual:** two separate `<app-aw-badge color="secondary">` sibling elements, both containing
  the text "Chamrong THOR", inside the same `gap: 10px` flex wrapper — confirmed via raw
  `innerHTML`, ruling out a CSS/text-rendering artifact. The adjacent "Ms. Kanna II" entry has
  exactly one such badge for comparison, confirming the two-badge case is anomalous rather than a
  normal multi-interviewer rendering.
- **Evidence:** `test-reports/evidence/defect-DASH06-1-duplicate-interviewer-badge.png`.
- **Verdict: CONFIRMED BUG** (upgraded from the story's own "flagged as a likely bug, not a
  confirmed requirement" to a DOM-level confirmation). Still needs a product decision on whether
  this candidate genuinely has two same-named interviewers (in which case the UI should
  distinguish them, e.g. "Chamrong THOR" appearing twice for two different interviewer records)
  or whether the render logic itself duplicates a single interviewer.

## Story corrections found (live behavior differs from the story's documented assumption — not app defects, but the story text needs updating)

1. **Quick Access "Total Candidate" card color**: the story's AC states both "Total Passed
   Candidate" and "Total Candidate" use a blue icon. Live: "Total Candidate" actually renders
   `type="danger"` with avatar background `rgb(249,111,111)` (reddish/pink), not blue. Only
   "Total Passed Candidate" (`type="passed"`, `rgb(0,82,204)`) is blue.
2. **This Week Reminder's candidate name is plain text, not a link**: the story's AC says "linked
   candidate name (rendered as a link)". Live DOM: `<p class="candidate-name"> Ms. Kanna II
   </p>` — no `<a>`, no `href`.
3. **Clicking the reminder opens a dialog, not a Candidate Details navigation**: the story's AC
   says clicking the linked name navigates to Candidate Details. Live: the entire reminder card
   (which carries `title="View reminder"`) is clickable and opens a `role="dialog"` titled
   "Reminder Detail" showing Reminder Type/Title/Interview/Date time/Created at/Status/
   Description — no navigation occurs.

## Scenario-by-scenario results

| # | Scenario | Result | Notes |
|---|---|---|---|
| DASH01-1 | Top-bar branding, bell badge, user menu | PASS | "ALLWEB RMS" present; search placeholder text exact match; bell badge "0"; user menu = exactly one item "Logout" (icon reads "login" — minor cosmetic mismatch, not a functional defect). |
| DASH01-2 | Global search / filter icon → Advance Search dialog | PASS (resolves story's open question) | Both the search span and the `tune` icon open the identical `<app-advance-search-dialog>` ("Advance Search") with fields Enter candidate/Gender/University/GPA/Position and Export/Clear buttons (the Clear button's icon ligature reads "clear_all", but its actual accessible label is just "Clear"). |
| DASH02-1 | Left nav order + active state | PASS | Exact order confirmed; "Dashboard" carries an active class, no sibling does. |
| DASH02-2 | Setting/Administration chevrons expand in place | PASS | Setting → 10 items, Administration → 3 items, both confirmed without URL change (also cross-confirmed by this repo's existing `nav-setting.spec.ts`/`nav-administration.spec.ts`). |
| DASH02-3 | Clicking "Candidate" navigates + updates active item | PASS | `/admin/candidate`, heading "Manage Candidates". |
| DASH03-1 | Quick Access 4 cards, exact labels/values | PASS | "48 interviews"/"5 candidates"/"4 candidates"/"35 candidates" confirmed in the documented order. |
| DASH03-2 | Quick Access color coding | PASS (documents a correction to the story) | See "Story corrections" above. |
| DASH03-3 | Quick Access cards are clickable links | PASS (new finding, not in story) | "Total Interview" → `/admin/calendar`; "Total Candidate" → `/admin/candidate`. |
| DASH04-1 | Resource Demanding columns + row 1 | PASS | Columns and row 1 values match the story exactly. |
| DASH04-2 | Sortable headers cycle direction | PASS | Deadline defaults to `aria-sort="ascending"` on load (not "none"); Project Name cycles none→ascending→descending on click. |
| DASH04-3 | Overdue-deadline tooltip defect | PASS (documents CONFIRMED defect) | See Defect 1 above. |
| DASH04-4 | Pagination controls | PASS | Page "1" active, both chevrons disabled, "Total: 1". |
| DASH04-5 | Archive toggles table in place, reversibly | PASS (resolves story's open question) | Toggled twice live: row swapped to an archived demand then back to "VK-Microsoft" exactly, confirming a safe, non-destructive, idempotent view filter. |
| DASH04-6 | "+ Add" entry point | PASS | `/admin/demand/create`, heading "Manage demands"; nothing submitted; row 1 unchanged on return. |
| DASH05-1 | Top Candidates 3 real cards | PASS | Carousel confirmed to hold 3 real slides (`data-slick-index` 0/1/2) plus 4 slick-generated clones; real cards match the story's data/order exactly. |
| DASH05-2 | "View" navigates to Candidate Details | PASS | Clicked the active card's View button → `/admin/candidate/candidateDetail/3519`, header "Ms. Julie MARTIN". |
| DASH05-3 | "+ Candidate" entry point | PASS | `/admin/candidate/add`, heading "Add Information"; nothing submitted. |
| DASH06-1 | This Week Interview 2 entries, exact fields | PASS | Both entries match the story's data exactly. |
| DASH06-2 | Duplicate interviewer badge defect | PASS (documents CONFIRMED defect) | See Defect 2 above. |
| DASH06-3 | Interview entry click behavior | PASS (resolves story's open question — corrected mid-automation, see Insight #10) | Clicking a card opens an "Interview Detail"-style dialog (candidate name, status pill, Apply for, Date & Time, Interviewers — including the same duplicate badge — Description, Edit/Add Result/Close); no page navigation occurs. |
| DASH06-4 | "+ Interview" entry point | PASS | Dialog "Create Interview" with the documented fields; closed via Cancel, nothing saved. |
| DASH07-1 | This Week Reminder 1 entry, exact fields | PASS | Matches the story's data; candidate name confirmed as plain text (see Story corrections #2). |
| DASH07-2 | Reminder click → "Reminder Detail" dialog | PASS (resolves/corrects story's open question) | See Story corrections #3. |
| DASH07-3 | "+ Reminder" entry point | PASS | `/admin/reminders/add?type=INTERVIEW` (a page, unlike "+ Interview"'s dialog); nothing submitted. |
| DASH08-1 | Data persists across a reload | PASS (partial coverage — see plan's own caveat) | Quick Access values and Resource Demanding row 1 were read identically across roughly 10 independent fresh-browser-session script runs during this exploration, which is itself strong evidence against stale client-side caching, though it does not exercise a genuine cross-module write-then-reload cycle (out of scope for this read-only epic). |

## Insights for automation (selectors, timing, workarounds)

1. **The "global search" is not an `<input>`.** Automation must click
   `page.locator('span.placeholder', { hasText: 'Search: Name' })` (or the adjacent `tune`
   mat-icon), not attempt to `.fill()` anything — there is no fillable search box on the
   Dashboard itself, unlike other list pages in this repo (e.g. `searchFor()` in
   `candidate-helpers.ts`).
2. **Quick Access cards**: `page.locator('app-aw-card')` reliably returns exactly 4 in DOM order;
   read `primarytext`/`secondarytext`/`type`/`routerlink` attributes directly rather than parsing
   visible text, since "Total" is a shared `<small>` prefix on every card and the real
   differentiator is `secondarytext`.
3. **Resource Demanding row selector**: scope to `app-dashboard-resource-demanding tbody tr` —
   the component tag disambiguates this table from any other table that might appear elsewhere on
   a future, richer Dashboard.
4. **Top Candidates carousel**: `mat-card[ngxslickitem]` matches all 7 DOM slides including
   slick's own clones. Real cards must be isolated via `:not(.slick-cloned)` (or by
   `data-slick-index` 0/1/2) — a bare count or `.first()`/`.nth()` without that filter will
   intermittently pick up a cloned duplicate depending on slick's current scroll position.
5. **This Week Interview interviewer badges**: scope to the specific card
   (`app-reminder-interview-card`) before counting `app-aw-badge` elements — the card also
   contains a *different* `app-aw-badge` for the position title (`color="primary"`), so an
   unscoped page-wide badge count would conflate position badges with interviewer badges. Filter
   by `color="secondary"` within the "Interviewers" row's own wrapper `div[style*="gap: 10px"]`.
6. **Dialogs opened from the Dashboard** (Advance Search, Create Interview, Reminder Detail) all
   close cleanly via `Escape` — confirmed for all three; "Create Interview" additionally has its
   own "Cancel" button, useful as a fallback/more explicit close.
7. **Never `page.goto()` a deep link mid-session** (same caution already documented in every
   other spec in this repo) — always return to the Dashboard via
   `page.getByRole('tree').getByRole('button', { name: 'Dashboard' }).click()`, never `goBack()`
   or a raw URL navigation, to avoid the documented Keycloak silent-SSO `unauthorized_client`
   bounce.
8. **`/welcome` auto-redirects an already-authenticated session straight back to
   `/admin/dashboard`** without showing the login form — confirmed live when a script attempted a
   second `login()`-style call mid-session without first logging out. Any script/test needing a
   genuine reload of an authenticated session should navigate via the sidebar (e.g. to another
   page and back), not re-run the login flow.
9. **No new helper functions were needed** in `tests/helpers/candidate-helpers.ts` for this
   module — every interaction is a single click plus either a same-page assertion, an in-place
   dialog, or a simple navigation already coverable by existing patterns (`login()`'s own
   dashboard landing, direct `getByRole('tree')` sidebar clicks).
10. **Correction found only during automation, not the earlier live-exploration pass**: clicking a
    This Week Interview entry card does **not** do "nothing" as first recorded — it opens an
    Interview Detail dialog (confirmed once automation's `toHaveCount(0)` assertion against
    `[role="dialog"]` failed reproducibly). The earlier exploration pass had only checked the URL
    after the click, not dialog presence, and missed this. The test plan and this results table
    have both been updated to the corrected behavior (see DASH06-3 above and
    `tests/dashboard/this-week-interview-entry-detail-dialog.spec.ts`).
11. **Top Candidates carousel slides that are not the currently-active one carry
    `aria-hidden="true"`** (standard slick.js/carousel accessibility behavior — only the visible
    slide is exposed to the accessibility tree). `page.getByRole('button', { name: 'View' })`
    scoped to an inactive real slide therefore matches **zero** elements, even though the button
    exists in the DOM — `getByRole` prunes anything under an `aria-hidden` ancestor. Automation
    for non-active slides must use a plain CSS/text locator (e.g. `card.locator('button',
    { hasText: 'View' })` or `card.getByText('View')`) and a `toHaveCount(1)`-style existence
    check rather than `getByRole(...).toBeVisible()`.
12. **This suite's default `workers: 3` setting caused intermittent flakiness against the shared
    remote dev server** for a few Dashboard tests during healing (e.g.
    `resource-demanding-overdue-deadline-defect`, `top-candidates-view-navigation`) — both passed
    reliably when re-run with `--workers=1`. This is consistent with this repo's own
    `playwright.config.js` comment about the shared server's limited concurrency tolerance; no
    script defect was found in either case, only load-induced timing sensitivity.

## Cleanup confirmation

- All ~16 throwaway Node scripts used this session live only in the session's scratch temp
  directory; none were copied into the repo. `git status` at the end of this task shows no stray
  automation scripts in the repo root or anywhere under `tests/`/`specs/`.
- 4 evidence images were added to the repo, following this folder's existing conventions:
  `test-reports/evidence/defect-DASH04-1-overdue-negative-days-tooltip.png`,
  `test-reports/evidence/defect-DASH06-1-duplicate-interviewer-badge.png`,
  `test-reports/evidence/DASH03-1-quick-access-cards.png` (non-defect, structural evidence),
  `test-reports/evidence/DASH01-1-advance-search-dialog.png` (non-defect, structural evidence).
- No form was ever submitted and no data was ever created, modified, or deleted during this
  exploration. The one real, repeated write-adjacent interaction — clicking "Archive" on the
  Resource Demanding table — was confirmed to be a safe, reversible, client-side view filter (not
  a server-side mutation) and was toggled back to its original state before moving on, consistent
  with the task's read-only-epic constraint.
