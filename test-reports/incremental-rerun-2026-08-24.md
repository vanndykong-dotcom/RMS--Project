# Test Execution Report: Incremental Re-run (Smart Re-run / Step 8)

**Mode:** PARTIAL RE-RUN (Steps 4-7 only)
**Environment:** https://rms-dev.allweb.com.kh (real, production-like data)
**Date:** 2026-08-24
**Browser:** Chromium (affected-suite scope, serial execution)

## 1. Re-run Scope Decision

Compared the working tree against the last recorded run
(`test-reports/incremental-rerun-2026-08-12.md`, 2026-08-12):

| Artifact | Status | Conclusion |
|---|---|---|
| `specs/candidate-management.md`, `specs/candidate-delete-test-plan.md` | Unchanged | Test plans still current |
| `user-stories/SCRUM.md` | Unchanged since 08-12 consolidation | No new acceptance criteria |
| All `tests/**/*.spec.ts`, `tests/helpers/candidate-helpers.ts` | Unchanged since the 08-12 commit | No code drift to verify |
| Git history | No commits between 2026-08-12 and today | Nothing in the repo changed |

Since neither the test plans, acceptance criteria, nor test code had changed in 12 days,
**no re-planning, re-exploration, or full-suite re-run was performed**. The only thing that
could plausibly have drifted is the *live environment* itself (real time passing, and the
carried-forward Archive-view cleanup recommendation from the last report) - so this session
re-verified exactly the tests the last report flagged as uncertain, plus a live environment
check, rather than redoing Steps 1-4 or the full ~40-file suite.

## 2. Environment Drift Check

- **Archive-view leftover synthetic candidates:** the 08-12 report flagged ~139 leftover
  `QaAutomationTest CANDIDATE ...` records as an open cleanup recommendation, not yet
  actioned. Checked live: the Archive view now holds only 11 records, none of them leftover
  per-run synthetic candidates - all are the small set of permanent, pre-established
  automation-owned candidates (e.g. Vk KONG, Raksa CHANN, Sopheak PHAL) already documented in
  `specs/candidate-management.md` as safe fixtures. **This recommendation is resolved** (by
  whom/when is not recorded - possibly cleaned up between sessions); no action needed now.

## 3. Automated Test Results

### Scope executed

The 3 tests the last report carried forward as unresolved/uncertain, re-run first to check
for drift:

| Test | 08-12 result | 08-24 result (before healing) |
|---|---|---|
| `candidate-list/row-menu-archive.spec.ts` (A13) | FAIL (known defect, by design) | FAIL (same defect) |
| `candidate-archive/restore.spec.ts` (E2) | FAIL (flaky, confirmed not a regression) | **PASS** |
| `candidate-list/row-menu-set-reminder.spec.ts` (A9) | FAIL (flaky, confirmed not a regression) | FAIL (new cause - see below) |

Then broadened to the rest of this session's originally-failing set to confirm nothing else
had drifted: `row-menu-set-interview.spec.ts` (A10), `inline-status-update.spec.ts` (A5),
`add-candidate-success.spec.ts` (B2), `reschedule-cancel.spec.ts` (D2),
`edit-persist-session.spec.ts` (C1) - 8 tests total, Chromium, `--workers=1`.

### Result: 2 new real failures found - both genuine environment drift, not flakiness

**A10 (Set Interview) and D2 (Interview Schedule reschedule) failed** with the calendar's
"Open calendar" day-grid picker refusing to click a specific day. Root cause: both tests
hardcoded a fixed calendar day (`'August 20,'`), which was a valid *future* date when the
suite was first written (2026-08-06) but is now a **disabled past date** now that real time
has moved to 2026-08-24 - the datepicker correctly refuses to select it, and the click retries
for the full test timeout instead of failing fast.

**A9 (Set Reminder) failed for a related but previously-unaddressed reason:** the Set Reminder
dialog's Date & time field auto-fills to the current moment, which the app's own validation
rejects with a toast ("Invalid Date & time. Can't be current time"). This silently blocks Save
- the reminder is never created, so the later search for it times out. This is the *same*
defaulted-to-now validation rule Set Interview has, but A9 had never received the
explicit-date-pick fix that A10/D2 already had, so this was not new drift - it was a real,
pre-existing gap the 08-12 report had misattributed to generic "read-after-write lag" flakiness
(reasonable at the time, since the two failures looked identical and the dialog itself was not
re-inspected live).

### Healing performed

1. Added a shared `pickFutureCalendarDate(page, daysAhead = 3)` helper to
   `tests/helpers/candidate-helpers.ts` that computes a real future date relative to "now" (with
   month navigation via the calendar's "Next month" button) instead of a hardcoded day, and
   returns the picked `Date` so callers can build matching assertions/lookups. `daysAhead`
   defaults to a small value (3, not e.g. 14) specifically so the picked date stays within the
   currently-displayed month for the Interview Schedule calendar widget these tests also
   inspect, which does not itself navigate months.
2. `row-menu-set-interview.spec.ts` (A10): uses the helper; the post-save row assertion now
   checks the dynamically-formatted date instead of a hardcoded `'20/Aug/2026'`.
3. `reschedule-cancel.spec.ts` (D2): uses the helper; the FullCalendar day-cell lookup
   (`data-date="..."`) is now built from the picked date instead of a hardcoded `-20` day.
4. `row-menu-set-reminder.spec.ts` (A9): added a call to the same helper before filling the
   title and saving, closing the actual gap rather than continuing to attribute the failure to
   environment flakiness.

### Final results (re-run after healing)

| Test | Result |
|---|---|
| `candidate-list/row-menu-set-interview.spec.ts` (A10) | PASS |
| `candidate-list/row-menu-set-reminder.spec.ts` (A9) | PASS |
| `interview-schedule/reschedule-cancel.spec.ts` (D2) | PASS |
| `candidate-list/row-menu-archive.spec.ts` (A13) | FAIL (unchanged, by design) |
| `candidate-list/inline-status-update.spec.ts` (A5) | PASS (unchanged) |
| `candidate-add/add-candidate-success.spec.ts` (B2) | PASS (unchanged) |
| `candidate-archive/restore.spec.ts` (E2) | PASS (unchanged) |
| `candidate-modify/edit-persist-session.spec.ts` (C1) | PASS (unchanged) |

**7/8 passing** (the 8th, A13, is an intentional documentation of an open app defect, not a
test failure to fix).

## 4. Defects / Risks Carried Forward

- A13's Archive-search-ignores-Last-Name defect remains open (pre-existing, tracked via its
  own inline test assertion) - reconfirmed live today with the same signature.
- D1 (Delete dialog close-icon accessibility gap, from `candidate-delete-test-report.md`)
  remains open; not re-verified this session (out of scope - nothing about it had changed).
- **New, generalizable observation:** any test that hardcodes a specific calendar date is a
  latent time bomb against this environment's "no date in the past" validation rule. The new
  `pickFutureCalendarDate` helper should be the standard way to pick a date going forward
  rather than a literal string, and any *other* still-undiscovered hardcoded date elsewhere in
  the suite should be treated as a candidate for the same class of failure once enough real
  time passes.

## 5. Housekeeping

Removed three throwaway one-off diagnostic scripts (`_archive-count.mjs`, `_archive-list.mjs`,
`_diag-calendar.mjs`) written during this session's live investigation; they were never meant
to be part of the delivered suite. The pre-existing `_check-orphans.mjs` / `_cleanup-orphans.mjs`
utilities (committed 2026-08-11) were reused as-is and left in place.

## 6. Commit Scope (Step 7)

- `tests/helpers/candidate-helpers.ts` (new `pickFutureCalendarDate` helper)
- `tests/candidate-list/row-menu-set-interview.spec.ts` (A10 - dynamic date)
- `tests/candidate-list/row-menu-set-reminder.spec.ts` (A9 - actual fix, not just re-flagged)
- `tests/interview-schedule/reschedule-cancel.spec.ts` (D2 - dynamic date)
- `defect-A13-archive-search-ignores-lastname.png`, `defect-D2-calendar-event-title-zero-width.png` (evidence screenshots refreshed by this session's runs)
- `test-reports/incremental-rerun-2026-08-24.md` (this report)
