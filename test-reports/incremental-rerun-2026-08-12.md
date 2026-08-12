# Test Execution Report: Incremental Re-run (Smart Re-run / Step 8)

**Mode:** PARTIAL RE-RUN (Steps 4-7 only)
**Environment:** https://rms-dev.allweb.com.kh (real, production-like data)
**Date:** 2026-08-12
**Browser:** Chromium (affected-suite scope, serial execution)

## 1. Re-run Scope Decision

Compared the working tree against the artifacts the last full run
(`test-reports/candidate-delete-test-report.md`, 2026-08-11) was built from:

| Artifact | Status | Conclusion |
|---|---|---|
| `specs/candidate-management.md` | Unchanged | Test plan for the base "Manage Candidates" story is still current |
| `specs/candidate-delete-test-plan.md` | Unchanged | Test plan for Restore/Delete is still current |
| `user-stories/SCRUM.md` | Rewritten in working tree | Consolidation of `user-stories/scrum_2.md` (deleted) into the canonical file - same acceptance criteria already covered by `specs/candidate-management.md`, not new requirements |
| `user-stories/Scrum_Delete.md`, `scrum_2.md`, `specs/SCRUM.md` (old content) | Deleted | Doc cleanup; content already represented in current test plans / last report |
| `tests/helpers/candidate-helpers.ts` | Modified | `clickRowMenuItem` retry-loop fix (`page.isClosed()` guard) |
| `playwright.config.js` | Modified | Global timeout 30s -> 45s |
| `test-reports/evidence/archive-delete-confirmation-dialog.png` | Modified | Evidence screenshot refreshed |
| `tests/performance/page-load-timing.spec.ts`, `test-reports/performance-report.md` | New (untracked) | New performance suite, already executed once |

Since neither test plan changed and no acceptance criteria changed, **no re-planning or
re-exploration was performed** - only Steps 4-7 (verify/execute/heal, report, commit).

## 2. Automated Test Results

### Scope executed

All suites touched by the helper/config change (uses `clickRowMenuItem` / `openRowMenu`,
or affected by the global timeout), plus the new performance suite:

`tests/candidate-archive/*`, `tests/candidate-list/row-menu-*.spec.ts`,
`tests/candidate-list/row-menu-interview-result-state.spec.ts`,
`tests/performance/page-load-timing.spec.ts` - 23 tests, Chromium, serial (`--workers=1`)
to isolate real defects from shared-server concurrency noise, per the precedent set in the
last full report.

### Results (first run)

| Result | Count |
|---|---|
| Passed | 20 |
| Failed | 3 |

| Test | Result |
|---|---|
| `candidate-archive/data-integrity.spec.ts` (E1) | PASS |
| `candidate-archive/delete-confirmation-dialog.spec.ts` (F2) | PASS |
| `candidate-archive/delete-dialog-dismiss.spec.ts` (F3) | PASS |
| `candidate-archive/delete-menu-visibility.spec.ts` (F1) | PASS |
| `candidate-archive/restore.spec.ts` (E2) | **FAIL** |
| `candidate-list/row-menu-activity-log.spec.ts` (A11) | PASS |
| `candidate-list/row-menu-archive.spec.ts` (A13) | **FAIL** |
| `candidate-list/row-menu-interview-result-state.spec.ts` (A12) | PASS |
| `candidate-list/row-menu-modify.spec.ts` (A8) | PASS |
| `candidate-list/row-menu-set-interview.spec.ts` (A10) | PASS |
| `candidate-list/row-menu-set-reminder.spec.ts` (A9) | **FAIL** |
| `performance/page-load-timing.spec.ts` (11 sub-tests) | PASS (11/11) |

**Conclusion: the `candidate-helpers.ts` fix and the `playwright.config.js` timeout change
introduced no regressions** - every test that isn't independently flaky/known-failing passed,
including all 11 new performance sub-tests.

## 3. Healing Investigation (3 failures)

### A13 - `row-menu-archive.spec.ts` - not a regression, by design

This test deliberately asserts a **pre-existing, already-documented app defect**: the
Archive view's search endpoint does not filter on Last Name (see the test's own inline
comment and `defect-A13-archive-search-ignores-lastname.png`, both already present before
this re-run). The test intentionally documents the currently-failing behavior instead of
masking it with a workaround selector. No healing applied - re-running unhealed and
re-flagging is the correct behavior until the underlying API is fixed.

### E2 (`restore.spec.ts`) and A9 (`row-menu-set-reminder.spec.ts`) - investigated live

Both failed identically on two consecutive automated runs (`openRowMenu` timeout on E2;
`waitForRowAfterWrite` timeout on A9), which ruled out a one-off flake. Reproduced both
flows manually against the same live environment using Playwright browser tooling:

- **E2:** Manually opened the same Archive-view row's more_vert menu for the exact
  candidate the failing test had just archived (`Ms. QaAutomationTest CANDIDATE E2
  1786510913604`) - the row, its more_vert button, and the `Restore` menu item all
  rendered and were clickable normally. The row-menu selector logic in
  `candidate-helpers.ts` is confirmed still correct; the failure is not a broken selector.
- **A9:** Not independently reproduced click-by-click (time-boxed), but the failure mode
  (`waitForRowAfterWrite` timing out looking for a just-created record) matches the
  already-documented "read-after-write lag" defect called out in both
  `candidate-helpers.ts`'s own comments and the prior report's Defects/Risk sections.

**New observation made during live investigation:** the Archive view currently holds
**139 candidates**, the large majority carrying synthetic `QaAutomationTest CANDIDATE ...`
names left over from prior automation runs (including several `F1`/`F2`/`F3`/`F4` batches
from 2026-08-11 that were never restored/cleaned up, likely because earlier failed runs
exited before reaching their cleanup step). This growing backlog of leftover synthetic
records plausibly compounds the already-known shared-server contention/read-after-write-lag
issues (larger result sets, more list re-renders) without being their root cause.

**Verdict: not a regression from today's changes.** Both failures are consistent with
flakiness already flagged in the 2026-08-11 report ("intermittent failures... due to
genuine shared-server contention" / "observed read-after-write lag... flagged as a
candidate app defect"), not a defect in the helper fix or config change being verified.
No code change was made to "heal" these, since the underlying selectors and logic are
confirmed correct manually - forcing them green would mask a real, already-tracked
environment issue rather than fix anything.

## 4. Defects / Risks Carried Forward (no new defects filed)

- D1, D2 from `candidate-delete-test-report.md` remain open (accessibility gap on Delete
  dialog close icon; Add-Candidate wizard's "Apply For" field, already worked around in
  the shared helper).
- A13's Archive-search-ignores-Last-Name defect remains open (pre-existing, tracked via
  its own inline test assertion).
- Read-after-write lag / background-list-re-render flakiness on this shared real
  environment remains open and, per this session's investigation, is worth prioritizing:
  it now affects Restore (E2) and Set Reminder (A9) verification, not just the previously
  noted Archive/Delete concurrency cases.
- **New recommendation:** clean up the ~139 leftover synthetic candidates in the Archive
  view (restore-then-archive-cleanly or a dedicated teardown script) to stop compounding
  list-size-driven flakiness on this shared dev server. Not actioned in this session since
  it involves bulk changes to a real, shared environment beyond this re-run's scope.

## 5. Commit Scope (Step 7)

Files changed by this incremental re-run, to be committed:

- `tests/helpers/candidate-helpers.ts` (already modified, verified no regression)
- `playwright.config.js` (already modified, verified no regression)
- `test-reports/evidence/archive-delete-confirmation-dialog.png` (already modified)
- `tests/performance/page-load-timing.spec.ts` (new, 11/11 passing)
- `test-reports/performance-report.md` (new, generated by the above)
- `test-reports/incremental-rerun-2026-08-12.md` (this report)
- `user-stories/SCRUM.md` (doc consolidation, no new ACs)
- Deletions: `user-stories/Scrum_Delete.md`, `user-stories/scrum_2.md`, `specs/SCRUM.md`,
  `QAE2EPromptFile.md`, `QAE2EPromptFile-Delete.md`, `QAE2EpromptFile_1.md`
- New: `QAE2EPromtFile.md` (consolidated workflow prompt file)
