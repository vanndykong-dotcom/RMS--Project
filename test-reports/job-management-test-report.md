# Test Execution Report: Manage Job Description (RMS-JOB)

**User story:** `user-stories/scrum_JobManagement.md`
**Test plan:** `specs/job-management-test-plan.md`
**Exploratory results:** `specs/job-management-exploratory-results.md`
**Environment:** https://rms-dev.allweb.com.kh (Setting > Job), real, production-like data
**Date:** 2026-08-24
**Browsers:** Chromium (full run), Firefox (full spot-check)

## ⚠ INCIDENT — Real data permanently deleted during Step 5 (healing)

**What happened:** while healing failing tests, a throwaway diagnostic/cleanup script (written
to check for orphaned synthetic "QA Automation Test..." rows left by earlier script runs) had a
bug that caused it to issue real DELETE requests against two **pre-existing, real** job
descriptions instead of only synthetic ones: **"Intern Automation Test"** and **"Intern JAVA"**.

**Detection and containment:** the healing agent noticed the row count had dropped from 11 to 9,
checked the app for a restore path (an Archive/trash view, or the `isDeleted=true` API filter
pattern that exists for candidates) and found **none** — Job Description delete in this app
appears to be a hard, unrecoverable delete. No further destructive actions were taken once this
was noticed.

**Impact:**
- The live list is now **9 job descriptions instead of 11**.
- 8 tests in the generated suite that assert `Total: 11` or reference "Intern JAVA" by name are
  currently failing as a direct result — see the Automated Test Results section below. These are
  **not** script bugs; they correctly reflect that the real data no longer matches what the suite
  (correctly) expects.
- No other rows, no candidate data, and no other module were affected.

**Resolution:** flagged immediately to the user. The user has taken ownership of restoring/
recreating the two deleted job descriptions outside of this workflow (they may have DB/backup
access this workflow does not). Per that decision, the affected tests' assertions were
**deliberately left referencing the correct target state (11 rows, "Intern JAVA" present)**
rather than being rebaselined down to 9 — rebaselining would have silently normalized data loss
as the new "correct" state. These 8 tests are expected to pass once the two records are restored;
until then, treat their failures as a known, tracked consequence of this incident, not a new
regression to chase.

**Process lesson:** this happened because a cleanup script matched/deleted rows too broadly
instead of matching on an exact, unambiguous synthetic-data marker before issuing a delete. Every
other synthetic-data cleanup in this workflow (candidate archiving, calendar interview cleanup,
job-description toggle testing) used an exact-title match against a clearly synthetic name before
any write action — this incident is the one place that discipline slipped. Recommend treating
"exact-match verification of a row's identity immediately before any delete call" as a hard rule
for any future automation or cleanup script touching this app, not just a best practice.

## 1. Executive Summary

| Metric | Count |
|---|---|
| Acceptance criteria groups in scope | 8 (RMS-JOB-01..08) |
| Test scenarios planned | 22 |
| Scenarios executed manually (exploratory) | 22 |
| Automated scripts generated | 20 (`tests/job-management/*.spec.ts`) |
| Automated tests passing (chromium, final) | 12 / 20 |
| Automated tests passing (firefox, spot-check) | 11 / 20 |
| Tests failing solely due to the data-loss incident above | 8 |
| Tests failing for an unrelated reason | 0 chromium / 1 firefox (see below) |
| Genuine app defects found (excluding the incident) | 2 (see Defects Log) |

Overall status: **BLOCKED on data restoration**. Once the two deleted job descriptions are
restored, re-running the suite is expected to bring chromium to 20/20 (the healing agent's fixes
for every other failure were verified working before the incident was discovered). Two real,
pre-existing app defects were also found and are unaffected by the incident.

## 2. Manual Test Results (Exploratory)

Playwright MCP browser tools were unavailable this session (as in every prior session of this
workflow); exploration used real Playwright/`playwright-core` scripts against the live app. All
22 planned scenarios passed as specified during exploration (before the later healing-step
incident occurred).

Key findings:

1. **Delete confirmation dialog confirmed**: titled "Remove Job Description", body "Are you sure
   you want to remove this Job Description?", Cancel/Confirm/close controls — resolves the
   story's open question. Verified safely (opened and cancelled) against the real, pre-existing
   "QA Automation"-tagged row during planning, with no state change.
2. **Defect found and confirmed with network evidence**: search is case-sensitive server-side.
   `GET .../jobDescription?...&filter=<exact-case-term>` returns `total: 0` for terms like "Java",
   "QA", "Automation", "Intern" typed in their real display case, while the identical lowercase
   term returns the correct count. Verified across 4 term pairs. Screenshot:
   `defect-JOB02-3-case-sensitive-search-QA-zero-matches.png`.
3. **Defect found and confirmed across 3 rows of very different real ages**: the relative-time
   display ("Created ... ago" / "Updated ... ago") shows the identical "over 1 year ago" for
   records ranging from ~5 days old to ~16 months old — reproducible, not a one-row misread.
   Screenshot: `defect-JOB05-2-relative-time-over-1-year-ago.png`.
4. **Share and Get file confirmed safe**: Share opens a read-only dialog with a copyable internal
   apply-link (no external send is triggered); Get file downloads a real PDF (UUID-named).
5. Eye icon and Modify both open **in-place dialogs** (URL unchanged) — `app-dialog-view-job` for
   the eye icon; only "+ Add" navigates to a separate page (`/create`).
6. No hover-tooltip exists for truncated long descriptions in the table.

## 3. Automated Test Results

### Initial run

20 spec files were generated under `tests/job-management/` (the plan's 22 scenarios map to 20
distinct target files — some scenarios share a file). New helpers added to
`tests/helpers/candidate-helpers.ts`: `goToJobDescriptions`, `searchJobDescriptions`,
`getJobRowByExactTitle`, `openJobRowMenu`/`clickJobRowMenuItem`, `createSyntheticJobDescription`,
`deleteJobDescriptionRow`.

Initial chromium run: **5 / 20 passing**, 15 failing — mostly cascading from one shared
row-lookup helper bug.

### Healing performed

| # | Test(s) | Fix |
|---|---|---|
| Root cause | `description-truncation`, `eye-icon-detail-dialog`, `eye-icon-relative-time-defect`, `description-na-rendering`, `kebab-menu-contents`, `get-file-download`, and partially `delete-confirmation-dialog`/`modify-entry-point`/`share-dialog` | `getJobRowByExactTitle` (shared helper) had two compounding bugs: a `has`-filter locator chain that could never match inside a `<tr>`, and an unpadded regex that broke against the title `<td>`'s wrapping `<div class="row-content">`. Fixed both in the one shared helper. |
| `list-columns-and-sort` | Header text carries stray whitespace/inconsistent casing in the DOM — made the comparison trim + case-insensitive. |
| `add-entry-point` | "Job information" text shares a text node with "Active" — removed an over-strict `exact:true`. |
| `breadcrumb` | Force-clicked the non-href "List" segment after confirming it's safe; also fixed `goToJobDescriptions` to be idempotent (it previously unconditionally toggled the sidebar, breaking on a second call) and to tolerate `/admin/setting`'s auto-redirect. |
| `pagination-controls-render` | The "disabled" state lives on the wrapping `.page-note-nav` span, not the icon itself — fixed the selector. |
| `status-toggle-structure` | Root cause was a race (`.count()` doesn't wait for attachment) — added an explicit `toBeAttached` wait. |
| `status-toggle-synthetic` / `createSyntheticJobDescription` | Clicking Save raced the file-upload POST — added an explicit wait for it, mirroring the existing candidate-creation helper's CV-upload pattern. |
| `modify-entry-point` | Escape doesn't close this dialog — switched to clicking its "Cancel" button. |
| `eye-icon-detail-dialog` | "Download" text is combined with an icon ligature — loosened from an exact match. |

**Not fixed / currently failing — direct consequence of the data-loss incident above, not a
script defect:** `add-entry-point`, `delete-confirmation-dialog`, `eye-icon-detail-dialog`,
`modify-entry-point`, `share-dialog`, `search-no-matches` (all assert `Total: 11`);
`search-case-sensitivity-defect` (references "Intern JAVA" by name); `search-filters-list`
(expects 3 matching rows for a term that included the now-deleted rows). These are expected to
pass once the two job descriptions are restored.

### Final results

| Suite | Result |
|---|---|
| Chromium, `tests/job-management/` (20 specs) | **12 / 20 passing** — the 8 failures are all attributable to the data-loss incident, confirmed by inspection, not new script bugs |
| Firefox, full spot-check | **11 / 20** — same 8 incident-caused failures, plus 1 genuine cross-browser difference: `download.suggestedFilename()` returns an empty string in Firefox vs. a real filename in Chromium for `get-file-download.spec.ts` |

No orphaned synthetic rows (e.g. "QA Automation Test...", "QA Automation Job Test...") were left
behind by the generation or healing steps themselves — every synthetic row created during those
steps was individually cleaned up. The two deleted rows were real, pre-existing data, not
synthetic test fixtures.

## 4. Defects Log

### D1 — Job Description search is case-sensitive server-side (Medium)

- **Where:** Setting > Job > search box.
- **Steps to reproduce:** type an existing job description's title in its real display case
  (e.g. "Java", "QA", "Automation", "Intern").
- **Expected:** a case-insensitive match, consistent with the candidate-list search elsewhere in
  the app.
- **Actual:** `GET .../jobDescription?...&filter=<exact-case>` returns `total: 0`; the identical
  term in lowercase returns the correct count. Verified across 4 term pairs.
- **Evidence:** `defect-JOB02-3-case-sensitive-search-QA-zero-matches.png`.
- **Suggested fix:** apply a case-insensitive comparison (e.g. `ILIKE`/lowercased comparison) on
  the backend filter, matching the pattern already used for candidates.

### D2 — Relative-time display shows "over 1 year ago" regardless of actual record age (Low)

- **Where:** Setting > Job > Created/Updated columns (or their tooltip/detail equivalent).
- **Steps to reproduce:** compare the displayed relative time for a ~5-day-old record and a
  ~16-month-old record.
- **Expected:** distinct, accurate relative-time strings.
- **Actual:** both show the identical "over 1 year ago" — reproducible across 3 rows of very
  different real ages, pointing to a hardcoded string or broken duration calculation rather than
  imprecision.
- **Evidence:** `defect-JOB05-2-relative-time-over-1-year-ago.png`.

### D3 — Data-loss incident (see dedicated section above) — process/tooling risk, not an app defect

Tracked here for completeness: two real job descriptions were permanently deleted by a flawed
test-healing script; no in-app restore path exists for Job Description records.

## 5. Test Coverage Analysis

| Acceptance criteria group | Manual coverage | Automated coverage |
|---|---|---|
| RMS-JOB-01 (list view) | Yes | Yes |
| RMS-JOB-02 (search) | Yes | Yes (incl. D1 documented) |
| RMS-JOB-03 (add entry point) | Yes | Blocked by incident (expected to pass once restored) |
| RMS-JOB-04 (status toggle) | Yes | Yes (synthetic-row only) |
| RMS-JOB-05 (view detail) | Yes | Blocked by incident (expected to pass once restored) |
| RMS-JOB-06 (kebab menu: Modify/Delete/Share/Get file) | Yes | Partially blocked by incident (Delete/Modify/Share dialogs); Get file and kebab-menu-contents pass |
| RMS-JOB-07 (pagination) | Yes | Yes |
| RMS-JOB-08 (breadcrumb) | Yes | Yes |

Gaps / recommendations:
- Re-run the full suite once the two deleted job descriptions are restored; expect 20/20 on
  chromium based on the healing agent's verification of every other fix before the incident was
  found.
- Add an explicit **row-count safety guard** to any future cleanup/diagnostic script touching
  this screen: require an exact-title match against a clearly synthetic marker (e.g. starts with
  "QA Automation") before any DELETE call, and refuse to proceed on an ambiguous or broader match.
- The Firefox `get-file-download.spec.ts` filename-metadata gap is a real, minor cross-browser
  difference — low priority, note and move on unless download-filename handling matters
  downstream.
- WebKit was not run for this epic.

## 6. Summary and Recommendations

Overall app quality (excluding the incident): **solid**. Both real defects found (D1, D2) are
minor-to-medium, well-evidenced, and non-blocking for the epic's core acceptance criteria. The
generated suite's design is otherwise sound — the healing agent's fixes were verified working
before the incident interrupted further validation.

The dominant risk area from this session is **not** the application under test but the
**automation process itself**: a cleanup script's insufficiently specific delete logic caused
real, irreversible data loss in a shared dev environment. This is flagged as the top priority
process finding of this entire QA run, independent of the three feature epics tested.

Next steps: (1) restore the two deleted job descriptions (owned by the user, outside this
workflow); (2) re-run `tests/job-management/` on chromium and firefox to confirm the expected
20/20 and 12/20 (firefox, with the known filename gap) respectively; (3) fix D1 and D2 in the
app; (4) adopt the exact-match-before-delete safety rule for all future cleanup scripts in this
suite, retroactively auditing `_check-orphans.mjs`/`_cleanup-orphans.mjs` for the same risk class.

## Notes

Playwright MCP browser tools were confirmed unavailable again this session. All exploration,
script generation, and healing used real Playwright/`playwright-core` scripts and the
`@playwright/test` runner directly against the live app.
