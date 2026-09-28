# Test Execution Report: Dashboard / Home (RMS-DASH)

**User story:** `user-stories/scrum-dashboard.md`
**Test plan:** `specs/dashboard-test-plan.md`
**Exploratory results:** `specs/dashboard-exploratory-results.md`
**Environment:** https://rms-dev.allweb.com.kh/admin/dashboard, real, production-like data
**Date:** 2026-09-21
**Browsers:** Chromium (full run, healed and re-verified across 4 additional runs), Firefox (full
spot-check)

## 1. Executive Summary

| Metric | Count |
|---|---|
| Acceptance criteria groups in scope | 8 (RMS-DASH-01..08) |
| Test scenarios planned | 25 |
| Scenarios executed manually (exploratory) | 25 |
| Automated scripts generated | 25 (`tests/dashboard/*.spec.ts`) |
| Automated tests passing (chromium, final stable run) | 25 / 25 |
| Automated tests passing (firefox, spot-check) | 25 / 25 |
| Genuine app defects found | 2 confirmed (see Defects Log) |
| Story corrections found (live behavior vs. story assumption) | 3 (see Defects Log / Coverage) |

Overall status: **STABLE and PASSING**. This epic was read-only observation throughout — no "+
Add"/"+ Interview"/"+ Candidate"/"+ Reminder" form was ever submitted, and the one real,
repeated write-adjacent interaction ("Archive" on the Resource Demanding table) was confirmed
live to be a safe, reversible, client-side view toggle, not a mutation. No data was created,
modified, or deleted at any point in this task, and no incident occurred.

The only failure class observed during healing and repeated re-runs was **intermittent Keycloak
login rejection under this suite's default 3-worker concurrency** (`unauthorized_client` /
stuck-on-`/welcome`, always failing inside the shared `login()` helper itself, never inside a
Dashboard-specific assertion) — a known environment characteristic of this shared remote dev
server, already noted in `playwright.config.js`'s own comments and in
`test-reports/job-management-test-report.md`. It is not a script defect: every one of the 25
scenarios has been independently confirmed correct (each one passed both in isolation and
across multiple full-suite runs), and a clean 25/25 chromium run was achieved as the final state.

## 2. Manual Test Results (Exploratory)

Playwright MCP browser tools were unavailable this session (as in every prior session of this
workflow); exploration used real `playwright-core` scripts against the live app, run headless
from the session's scratch temp directory. All 25 planned scenarios passed as specified during
exploration.

Key findings:

1. **The top-bar "search" is not a real input** — it's a decorative span; clicking it (or the
   adjacent filter icon) opens an "Advance Search" dialog with its own candidate-search form and
   results table. This resolves the story's two open questions about the search's destination.
2. **Resource Demanding's "Archive" button is a safe, reversible, in-place view toggle**, not a
   navigation or a destructive action — resolves the story's open question, confirmed via two
   full toggle cycles with no data change.
3. **Top Candidates is a real carousel** (slick.js) with slick-generated clone slides that must be
   excluded from automation, and its non-active real slides are `aria-hidden="true"`, invisible
   to `getByRole` queries — a structural nuance not obvious from the story's screenshot-based
   description.
4. **Two defects confirmed**: a negative day count in the Resource Demanding overdue-deadline
   tooltip, and a genuine DOM-level duplicate interviewer badge on the "Ms. Kanna TESTING" This
   Week Interview entry (the story itself had flagged this as "likely," now confirmed).
   Screenshots: `test-reports/evidence/defect-DASH04-1-overdue-negative-days-tooltip.png`,
   `test-reports/evidence/defect-DASH06-1-duplicate-interviewer-badge.png`.
5. **Three corrections to the story's own assumptions**: the "Total Candidate" Quick Access card
   is styled reddish/pink (`type="danger"`), not blue; the This Week Reminder's candidate name is
   plain text, not a link; and clicking a reminder opens a "Reminder Detail" dialog rather than
   navigating to Candidate Details.
6. **A correction found only during automation** (not the exploratory pass): clicking a This Week
   Interview entry opens an "Interview Detail" dialog — the exploratory pass had only checked the
   URL after clicking and missed that a dialog opens, initially (and incorrectly) recording
   entries as "not clickable." The plan, results, and automated test were all corrected in place
   once this was caught by a failing assertion during healing.

## 3. Automated Test Results

### Initial run

25 spec files were generated under `tests/dashboard/`, one scenario per file, following this
repo's established job-management-style granularity. No new helpers were needed in
`tests/helpers/candidate-helpers.ts` — `login()` already lands on the Dashboard, and every
Dashboard interaction is a single click plus an in-place assertion/dialog/navigation.

Initial chromium run: **15 / 25 passing**, 10 failing.

### Healing performed

| # | Test(s) | Fix |
|---|---|---|
| 1 | `topbar-branding-and-user-menu` | The "Logout" menu item's raw text includes its mat-icon's ligature ("login Logout") - matched on the trailing label instead of an exact string. |
| 2 | `global-search-advance-dialog` | The "Clear" button's icon ligature happens to read "clear_all", but its real accessible label is just "Clear", not "Clear all" - fixed the regex. |
| 3 | `resource-demanding-add-entry-point`, `data-freshness-reload` | Comparing a whole row's `.innerText()` against Playwright's `toHaveText()` failed on whitespace-normalization differences between the two APIs, compounded by a transient "no-data-row" placeholder while the table re-fetches after navigating back - switched to comparing one stable, non-empty cell, consistently via the same read method on both sides. |
| 4 | `this-week-interview-add-entry-point` | The dialog's "Cancel" button sits below the fold once the "Description" field is present, causing "element is outside of the viewport" - switched to closing via `Escape` (confirmed live to work identically). |
| 5 | `this-week-interview-entry-not-clickable` → renamed `this-week-interview-entry-detail-dialog` | **Genuine correction, not just a selector fix**: the original scenario asserted no dialog opens on click - automation caught that this is wrong (a dialog does open). Rewrote the test (and the plan/results docs) to assert the actual, corrected behavior. |
| 6 | `top-candidates-cards` | Non-active carousel slides are `aria-hidden="true"` (slick.js standard behavior), so `getByRole('button', { name: 'View' })` matched zero elements for them - switched to a plain (non-role) locator that isn't pruned by `aria-hidden`. |
| 7 | `top-candidates-view-navigation` | A bare `.innerText()` read immediately after `login()` raced the carousel's own async hydration under concurrent-worker load - added an explicit wait for the name element before reading it. |
| 8 | `left-nav-order-and-active-state`, `resource-demanding-columns-and-row`, `this-week-interview-add-entry-point` (baseline count) | Same hydration-race root cause as #7, on the sidebar tree, the table header, and the interview-card count respectively - added explicit `toBeVisible()`/`toBeAttached()`-style waits before each raw read. |
| 9 | `resource-demanding-archive-toggle`, `resource-demanding-overdue-deadline-defect` | Hardened proactively against the same hydration-race pattern found in #7/#8, even though these two had not yet failed, since they shared the identical "raw read right after `login()`" shape. |
| 10 | `quick-access-cards-values` | The Quick Access `<h4>` value briefly renders a "0 interview(s)" placeholder before its async count loads - switched from a one-shot `innerText()` + regex match to an auto-retrying `toHaveText()` assertion, and loosened the pattern to tolerate singular/plural grammar. |

**Not a script issue — environment characteristic, documented rather than "fixed":** across 4
additional full-suite chromium runs after the above healing, 3 runs showed exactly 1 failure and
1 run showed 0 failures, and in every failing case the failure was inside the shared `login()`
helper itself (`unauthorized_client` or stuck on `/welcome`), on a different, non-repeating test
each time. Re-running the same failing spec file individually always passed immediately. This
matches the exact failure signature already documented in
`test-reports/job-management-test-report.md` and `playwright.config.js`'s own comment about this
shared remote dev server's limited concurrency tolerance — it is a login-endpoint rate/session
limit under 3 concurrent logins, not a Dashboard-specific or script-specific defect.

### Final results

| Suite | Result |
|---|---|
| Chromium, `tests/dashboard/` (25 specs), final confirmation run | **25 / 25 passing** |
| Chromium, prior confirmation runs during healing (for reference) | 24/25, 24/25, 24/25 (each failure was the login-concurrency flake described above, a different test each time, never a repeat) |
| Firefox, full run (not just a spot-check — all 25 specs) | **25 / 25 passing**, first attempt, no healing needed |

No synthetic data was created or left behind by generation or healing. Every scenario is either a
pure read, a confirmed-safe reversible toggle ("Archive"), or an entry-point-and-cancel/navigate-
away flow that never clicks Save/Submit/Confirm on a form.

## 4. Defects Log

### D1 — Resource Demanding overdue-deadline tooltip shows a negative day count (Low)

- **Where:** Dashboard → Resource Demanding → Deadline column badge tooltip.
- **Steps to reproduce:** read the `title` attribute of an overdue demand's Deadline badge.
- **Expected:** a positive, correctly-worded count, e.g. "Overdue by 264 days".
- **Actual:** `title="Overdue by -264 days"` — a negative count, even though the visible
  red/danger pill styling correctly identifies the row as overdue.
- **Evidence:** `test-reports/evidence/defect-DASH04-1-overdue-negative-days-tooltip.png`.
- **Suggested fix:** correct the sign in the duration calculation feeding this tooltip string.

### D2 — This Week Interview duplicate interviewer badge (Medium)

- **Where:** Dashboard → This Week Interview → "Ms. Kanna TESTING" entry (also visible inside
  that entry's own detail dialog).
- **Steps to reproduce:** open the "Interviewers" row of that card.
- **Expected:** one badge per distinct interviewer.
- **Actual:** two separate `<app-aw-badge>` DOM elements, both reading "Chamrong THOR" — confirmed
  via raw `innerHTML`, not a CSS/text-rendering artifact. The adjacent "Ms. Kanna II" entry has
  exactly one such badge for comparison.
- **Evidence:** `test-reports/evidence/defect-DASH06-1-duplicate-interviewer-badge.png`.
- **Suggested fix:** needs a product decision first (see Coverage gaps below) — either de-duplicate
  the render, or if this candidate genuinely has two same-named interviewer records, distinguish
  them visually (e.g. by role or a differentiating suffix).

### Story corrections (not app defects — the story text should be updated to match live behavior)

1. **Quick Access "Total Candidate" card color**: story claims blue; live is `type="danger"`,
   reddish/pink.
2. **This Week Reminder's candidate name**: story claims a link; live is plain `<p>` text, with
   the entire card (not just the name) being the clickable surface.
3. **Clicking the reminder**: story implies navigation to Candidate Details; live opens a
   "Reminder Detail" dialog instead.
4. **This Week Interview entries are clickable**: an earlier draft of this task's own exploratory
   pass first (incorrectly) recorded entries as "not clickable"; automation caught that they
   actually open an "Interview Detail" dialog. Corrected in the plan, results, and test suite
   before this report was written (see Section 3, healing item #5).

## 5. Test Coverage Analysis

| Acceptance criteria group | Manual coverage | Automated coverage |
|---|---|---|
| RMS-DASH-01 (top nav/search) | Yes | Yes — resolves both of the story's open questions |
| RMS-DASH-02 (left nav) | Yes | Yes |
| RMS-DASH-03 (Quick Access) | Yes | Yes, incl. a new finding (cards are clickable links) not in the story |
| RMS-DASH-04 (Resource Demanding) | Yes | Yes, incl. D1 documented and the Archive open question resolved |
| RMS-DASH-05 (Top Candidates) | Yes | Yes |
| RMS-DASH-06 (This Week Interview) | Yes | Yes, incl. D2 documented and the click-behavior open question resolved (and self-corrected) |
| RMS-DASH-07 (This Week Reminder) | Yes | Yes, incl. 2 story corrections documented |
| RMS-DASH-08 (freshness/empty states) | Partial | Partial — see gaps below |

Gaps / recommendations:

- **Empty-state copy/design for every section remains completely unverified.** Every section had
  data at exploration/automation time, and forcing a genuine zero-item state would require a real
  write in another module (Interview Schedule, Reminder, Candidate, Demand) — explicitly out of
  scope for this read-only epic. A future task with write access to a disposable dataset should
  cover this.
- **RMS-DASH-08's full "change data in another module, reload, confirm it's reflected" flow was
  not exercised** — only a same-data reload was verified (`data-freshness-reload.spec.ts`), which
  proves the Dashboard re-reads correctly but not that it reflects a genuinely new value.
- **Non-overdue Deadline pill styling could not be observed** — only one (overdue) Resource
  Demanding row exists in the live data.
- **Two dashboard sections exist live that the story never documents**: a "Candidate" chart
  section and an "Interviews" chart section (both Chart.js canvases, below "Top Candidates"). Not
  covered by any scenario here since they fall outside RMS-DASH-01..08's stated acceptance
  criteria — flag for a future RMS-DASH-09 or a story update.
- **The Advance Search dialog's own "Export" action and results table were observed but not
  exercised** (Export could trigger a real download or backend job) — a future,
  advance-search-focused spec should cover it.
- **D2's product question is unresolved**: whether "Ms. Kanna TESTING" genuinely has two
  interviewers both named Chamrong Thor, or this is a pure render bug, needs a PM/dev decision
  before a regression test can assert the "correct" post-fix state.
- **WebKit was not run for this epic** (chromium + firefox only, per task priority).

## 6. Summary and Recommendations

Overall app quality: **solid**. Both confirmed defects (D1, D2) are minor-to-medium and
well-evidenced; neither blocks the epic's core acceptance criteria. Three story-vs.-live
discrepancies were found and corrected in the documentation rather than silently automated
against the story's (incorrect) original claims — this keeps the automated suite honest about
what the app actually does today.

The automated suite is stable: a clean 25/25 chromium run and a clean 25/25 firefox run (first
attempt) were both achieved. The only observed instability across repeated runs was login-level
Keycloak concurrency rejection under this suite's shared-server-friendly 3-worker default — a
known, previously-documented environment characteristic of this dev server, not a Dashboard or
script defect. No workaround was applied to the shared `login()` helper or the global Playwright
config, consistent with this task's instruction not to touch unrelated pre-existing files; a
future cross-cutting fix (e.g. a retry wrapper around `login()`, or lowering `workers` further)
would likely eliminate it, but that decision affects every spec in this repo, not just Dashboard,
and was left out of scope here.

Next steps: (1) fix D1 (tooltip sign) and get a product decision on D2 (duplicate interviewer);
(2) update `user-stories/scrum-dashboard.md` itself to reflect the three story corrections
found (Quick Access card color, reminder link vs. plain text, reminder click destination), so the
next person reading it isn't misled; (3) consider a small, cross-cutting `login()` retry-once
wrapper in `tests/helpers/candidate-helpers.ts` if this Keycloak-concurrency flake becomes a
recurring nuisance across future modules' suites, not just this one; (4) plan a follow-up pass
for empty-state coverage once a disposable/seedable dataset is available.

## Notes

Playwright MCP browser tools were confirmed unavailable again this session. All exploration,
script generation, and healing used real Playwright/`playwright-core` scripts and the
`@playwright/test` runner directly against the live app. No data was created, modified, or
deleted at any point (the "Archive" toggle, the only repeated write-adjacent interaction, was
confirmed live to be a safe, reversible, client-side view filter). All throwaway exploration
scripts (~18 across this task) were written and run only from the session's scratch temp
directory and were never copied into the repo.
