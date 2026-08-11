# Test Execution Report: Candidate Delete (Scrum_Delete)

**User story:** `user-stories/Scrum_Delete.md`
**Test plan:** `specs/candidate-delete-test-plan.md`
**Environment:** https://rms-dev.allweb.com.kh (real, production-like data)
**Date:** 2026-08-11
**Browser:** Chromium (Firefox/WebKit not run - see Test Coverage Analysis)

## 1. Executive Summary

| Metric | Count |
|---|---|
| Acceptance criteria in scope | 7 |
| Already covered by existing suite (AC1, 2, 3, 6, 7) | 5 |
| New scenarios written for this story (AC4, AC5) | 3 (F1, F2, F3) |
| Automated tests executed | 3 new + 2 existing archive/restore regression tests |
| Automated tests passing (serial run) | 5 / 5 |
| Defects found | 2 (see Defects Log) |
| Open questions resolved | 1 (Delete confirmed to be a hard/permanent delete) |

Overall status: **PASS**, with two logged defects (one pre-existing app-side test flakiness
under concurrency, one accessibility defect on the Delete dialog's close icon) that do not
block the acceptance criteria but should be tracked.

## 2. Manual Test Results (Exploratory)

Performed by driving real Playwright scripts against the live app in place of interactive
browser tooling (see Notes). Findings:

1. **AC4/AC5 apply to the Archive view, not the active list.** The active list's ⋮ menu is
   unchanged (`Modify, Set Reminder, Set Interview, Add Activity Log, Add interview result,
   Add to archive`). The Archive view's ⋮ menu now shows exactly `Restore, Delete`.
2. **Delete confirmation dialog copy confirmed:**
   - Heading: "Delete Candidate"
   - Body: "Are you sure you want to delete this candidate?"
   - Note: "Data associated with [candidate name] will be permanently deleted."
   - Buttons: an unlabeled close (X) icon, `Cancel`, `Confirm`.
   - Screenshot: `test-reports/evidence/archive-delete-confirmation-dialog.png`
3. **Resolved open question:** Delete is a **hard/permanent delete** (the dialog explicitly
   says so), distinct from Archive, which remains recoverable via Restore.
4. **Defect found:** the dialog's close (X) icon button has no accessible name (its icon is
   effectively `aria-hidden`, and the button has no `aria-label`) - a screen-reader user
   cannot identify this control. See Defects Log D1.
5. **Defect found (pre-existing, not new to this story):** the candidate-creation wizard's
   "Upload CV" step gained a new required "Apply For" field since the shared test helper
   (`tests/helpers/candidate-helpers.ts`) was last verified; without selecting it, the wizard
   silently refuses to reach the Preview step. This blocked every test in this suite that
   creates a synthetic candidate (not just the new Delete tests) until fixed. See Defects Log
   D2.
6. Per the agreed safety constraint for this environment, no manual or automated test in this
   suite ever clicks the Delete dialog's **Confirm** button - every scenario stops at
   verifying the dialog, then dismisses it via Cancel or the close icon.

## 3. Automated Test Results

### Initial run

The three new automation scripts (below) initially failed 3/3 - not due to a flaw in the new
test logic, but because the shared `createSyntheticCandidate` helper (used to set up every
test's synthetic record) could no longer complete the Add-Candidate wizard, due to defect D2
above.

### Healing performed

1. **D2 fix:** updated `tests/helpers/candidate-helpers.ts` `createSyntheticCandidate` to
   select an "Apply For" position (`Software Testing Automation`, an existing synthetic/
   automation-owned tag) on the Upload CV step before proceeding. This is a shared helper fix
   that benefits the whole existing suite, not just these new tests.
2. **Retry-loop bug fix:** `clickRowMenuItem`'s retry loop called `openRowMenu` (the click
   that opens a row's ⋮ menu) *outside* its own `try/catch`, with no per-attempt timeout. A
   single background list re-render (a previously documented behavior of this app) could
   therefore consume the entire test timeout on one unretried attempt. Moved the call inside
   the retry loop with a bounded 5s per-attempt timeout, matching the resilience already
   applied to the menu-item click itself.
3. **Selector fix (F3):** the Delete dialog's close icon has no accessible name (defect D1),
   so `getByRole('button', { name: 'close' })` could never match. Changed to
   `dialog.getByRole('button').first()`, which targets it structurally by DOM order instead.

### Final results (serial run, to isolate real defects from shared-server concurrency noise)

| Test | File | Result |
|---|---|---|
| F1. Archive view row menu shows Restore and Delete | `tests/candidate-archive/delete-menu-visibility.spec.ts` | PASS |
| F2. Delete opens a permanent-removal confirmation dialog | `tests/candidate-archive/delete-confirmation-dialog.spec.ts` | PASS |
| F3. Delete dialog dismisses via the close (X) icon without deleting | `tests/candidate-archive/delete-dialog-dismiss.spec.ts` | PASS |
| E1. Archived candidate data integrity (existing, regression) | `tests/candidate-archive/data-integrity.spec.ts` | PASS |
| E2. Restore from archive (existing, regression) | `tests/candidate-archive/restore.spec.ts` | PASS |

**5 / 5 passing.** All tests were also run once with the project's default 3 parallel workers;
F2, F3, and the pre-existing E1 intermittently failed in that mode due to genuine shared-
server contention (three workers simultaneously creating/archiving synthetic candidates on
the same real remote list causes list re-renders and row-position shifts) rather than any
defect in the test logic itself - see Recommendations.

## 4. Defects Log

### D1 - Delete dialog close icon has no accessible name

- **Severity:** Low (accessibility)
- **Description:** In the Archive view's Delete confirmation dialog, the close (X) icon
  button exposes no accessible name to assistive technology (no text content contributes to
  its name, and it has no `aria-label`), unlike every other interactive control in this
  dialog and app.
- **Steps to reproduce:** Archive view -> open a row's ⋮ menu -> Delete -> inspect the top-
  right close icon with a screen reader or accessibility tree.
- **Expected:** The button should have an accessible name, e.g. `aria-label="Close"`.
- **Actual:** Accessible name is empty; the button can only be identified visually or by DOM
  position.
- **Evidence:** `test-reports/evidence/archive-delete-confirmation-dialog.png`
- **Environment:** rms-dev.allweb.com.kh, Chromium, 2026-08-11.

### D2 - Add Candidate wizard's new "Apply For" field silently blocks the shared test helper

- **Severity:** Medium (test infrastructure, pre-existing app change not test-specific)
- **Description:** The "Upload CV" step of the Add Candidate wizard now requires an "Apply
  For" position selection that did not exist when `createSyntheticCandidate` was last
  verified. Omitting it blocks the wizard from reaching the Preview step with only an inline
  "Please fill in Apply For field." error (no wizard-level indicator) - this affected every
  test in the suite relying on synthetic candidate creation, not just the new Delete tests.
- **Steps to reproduce:** Add Candidate -> complete Information/Education/Experience -> on
  Upload CV, upload a CV but skip "Apply For" -> click Next.
- **Expected:** Either the field should not be required, or a wizard-level validation summary
  should make the block obvious without inspecting the DOM.
- **Actual:** Wizard silently stays on Upload CV; only a small inline alert explains why.
- **Fix applied:** `tests/helpers/candidate-helpers.ts` now selects "Software Testing
  Automation" for this field. This is a test-side fix, not an app fix - flagging for product/
  dev awareness since the lack of a clear validation summary is a UX gap.

## 5. Test Coverage Analysis

| Scrum_Delete.md AC | Covered by | Manual | Automated |
|---|---|---|---|
| 1. Table columns | `tests/candidate-list/page-structure.spec.ts` (existing) | Yes (prior run) | Yes |
| 2. Bulk Archive | `tests/candidate-list/row-menu-archive.spec.ts` (existing, single-row) | Yes (prior run) | Yes |
| 3. Eye icon -> detail view | `tests/candidate-list/view-candidate.spec.ts` (existing) | Yes (prior run) | Yes |
| 4. ⋮ menu shows Restore and Delete | `delete-menu-visibility.spec.ts` (new) | Yes | Yes |
| 5. Delete confirmation before permanent removal | `delete-confirmation-dialog.spec.ts`, `delete-dialog-dismiss.spec.ts` (new) | Yes | Yes |
| 6. Pagination preserves filters | `tests/candidate-list/pagination.spec.ts` (existing) | Yes (prior run) | Yes |
| 7. Inline status dropdown | `tests/candidate-list/inline-status-update.spec.ts` (existing) | Yes (prior run) | Yes |

**Gaps / not covered:**
- Whether the top-right bulk `Archive` button supports true multi-select remains an open
  question carried over from `specs/candidate-management.md` - unrelated to Delete, not
  investigated further here.
- A confirmed Delete (clicking the dialog's `Confirm` button) was **deliberately never
  exercised**, per the agreed safety constraint for this real, production-like environment.
  The server-side effect of a confirmed delete (e.g. whether it truly hard-deletes vs. leaves
  a tombstone, cascade behavior on related interviews/reminders/activity logs) is unverified.
- Only Chromium was run in this session; the project config also defines Firefox and WebKit
  projects, not exercised here.

## 6. Summary and Recommendations

- **Quality assessment:** The new Restore/Delete functionality in the Archive view behaves as
  the story describes, with clear, honest confirmation copy for a genuinely destructive
  action. No functional defects were found in the Delete flow itself.
- **Risk areas:**
  - D1 (accessibility) is low-risk but easy to fix (add `aria-label="Close"`).
  - The suite's default 3-worker local concurrency causes intermittent, environment-driven
    failures (not defects) when multiple workers mutate the same shared real candidate list
    concurrently; consider serializing tests that create/archive/restore synthetic candidates,
    or accepting `workers: 1` for this test directory specifically.
  - No test has verified actual server-side behavior of a confirmed Delete. If/when this
    environment gets a disposable non-production instance, that should be added as a
    deliberate, isolated scenario.
- **Next steps:**
  1. File D1 and D2 with the product/dev team.
  2. Consider a dedicated disposable environment to safely test a real, confirmed Delete
     end-to-end (including verifying related Interview Schedule / Reminder / Activity Log
     records referencing the deleted candidate).
  3. Run the new suite against Firefox and WebKit for full cross-browser coverage.

## Notes on this session's tooling

This workflow was executed without the `playwright-test` MCP server or GitHub MCP server
referenced in `.github/agents/*.md` (neither was connected in this session). Exploration,
test generation, and healing were performed by writing and running real Playwright specs via
`npx playwright test` and editing files directly, per an explicit decision made with the
requester at the start of this run.
