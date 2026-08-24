# Test Execution Report: Manage Candidates Advance Report (RMS-RPT)

**User story:** `user-stories/scrum_AdvanceReport.md`
**Test plan:** `specs/advance-report-test-plan.md`
**Exploratory results:** `specs/advance-report-exploratory-results.md`
**Environment:** https://rms-dev.allweb.com.kh/admin/candidate/advance-report (real, production-like data)
**Date:** 2026-08-24
**Browsers:** Chromium (full run), Firefox (full spot-check)

## 1. Executive Summary

| Metric | Count |
|---|---|
| Acceptance criteria groups in scope | 10 (RMS-RPT-01..10) |
| Test scenarios planned | 25 |
| Scenarios executed manually (exploratory) | 25 + 1 bonus edge case |
| Automated scripts generated | 25 (`tests/advance-report/*.spec.ts`) |
| Automated tests passing (chromium, final) | 25 / 25 |
| Automated tests passing (firefox, spot-check) | 25 / 25 |
| Genuine app defects found | 2 (see Defects Log) |
| Open questions from the story resolved | 5 of 5 |

Overall status: **PASS**, with two logged defects — one confirmed data-display bug (composite
score column) and one column-availability inconsistency (Remark) — both documented rather than
worked around. The screen is fully read-only; no write-capable controls were found anywhere on
it.

## 2. Manual Test Results (Exploratory)

Playwright MCP browser tools were unavailable this session (as in every prior session of this
workflow); exploration and script execution used real Playwright/`playwright-core` scripts
against the live app (see Notes). All 25 planned scenarios passed as specified, plus a bonus
tab-switch-carryover check.

Key findings, resolving the story's open questions:

1. **Filter dropdown fields resolved**: a simple radio group — **ALL** (default), **INTERN**,
   **STAFF** — not the speculated Position/Status/Company/School panel. It exists only on the
   Following Up tab; absent from both Summary tabs.
2. **Summary Full Staff / Summary Intern column sets resolved**: both share an identical 8-column
   layout (No, NAME, University, Number of Candidates, Degree, Apply For, Interview Status,
   Remark).
3. **Default date range resolved**: current week (Mon–Fri, e.g. Aug 24–28, 2026), applied as an
   active "Custom date ranged" state — no semantic "This Week" preset exists among the 8 listed
   presets (Today/Yesterday/Last 7 Days/Last 30 Days/This month/Last month/Last 3 months/Custom
   date ranged).
4. **Candidate-name click and eye-icon behavior resolved** (both differ from the story's
   assumption): clicking a candidate's name opens an **in-place profile modal** — the URL never
   changes, so there is no "back navigation" to preserve state from, the modal simply closes. The
   eye icon opens a separate **"Remark" dialog** (a `<mat-icon mattooltip="View remark">`, not a
   `role=button`).
5. **Tabs keep fully independent state**: a manually widened date range or an active search term
   on one tab does not carry over when switching tabs — each tab re-applies its own default.
6. **Defect found and confirmed across the full seeded dataset (3 rows)**: the "Recruit + OM + HR
   + TL" composite score column displays the row's **interview-date timestamp** instead of a
   score, for every row, including one (Raksa CHANN) whose real composite score (`OVERALL: 83.5%`)
   is visible and correct inside her own profile modal — confirming the report column is
   mislabeled/mis-bound, not that the data doesn't exist. Screenshot:
   `defect-RPT01-composite-score-column-shows-interview-date.png`.
7. **Defect found**: the Following Up tab's Remark column never renders text (only ever blank),
   while Summary Full Staff's Remark column correctly shows text (e.g. "Passed.") for the same
   candidate. Screenshot: `defect-RPT08-remark-column-blank-only-on-following-up-tab.png`.
8. Confirmed fully read-only: no write-capable action exists anywhere on this screen besides the
   client-side Excel export.

## 3. Automated Test Results

### Initial run

25 new spec files were generated under `tests/advance-report/` from the test plan and exploratory
findings, reusing `login()` and a new `goToAdvanceReport()` helper added to
`tests/helpers/candidate-helpers.ts`.

Initial chromium run: **17 / 25 passing**, 8 failing — all script/assertion issues, not new app
defects (the one intentional defect-documentation test, RPT01-1, was itself failing only due to a
whitespace-matching bug in the test, not because it lost track of the real defect).

### Healing performed

| # | Test | Fix |
|---|---|---|
| 1 | `following-up-default-view.spec.ts` (RPT01-1) | Switched from an anchored regex match to `innerText().trim()` comparison so surrounding whitespace no longer breaks the check; the underlying assertion of the confirmed defect (column shows Interview Date, not a score) is unchanged and still documents the bug. |
| 2 | `eye-icon-remark-dialog.spec.ts` (RPT08-1) | Corrected the "eye icon" locator to `[mattooltip="View remark"]` (a `<mat-icon>`, not a `role=button` — the row's only real button opens the unrelated profile modal); asserted on the dialog's "Remark" heading text since the dialog itself has no `aria-label`. |
| 3, 4 | `filter-narrows-results.spec.ts`, `search-composes-with-filter.spec.ts` (RPT04-2, RPT05-2) | A transparent `cdk-overlay-backdrop` lingers full-viewport after a Filter selection; fixed by clicking the backdrop at an explicit off-panel corner before reopening Filter. |
| 5 | `search-input-identity.spec.ts` (RPT05-1) | The topbar "search" element is a `<button>` with static text, not an `<input placeholder>` — switched from `getByPlaceholder()` to `getByText(..., {exact:true})`. |
| 6 | `summary-intern-columns.spec.ts` (RPT02-4) | Live data had shifted to include one leftover synthetic intern row instead of the empty state observed during planning; rewrote the assertion to branch on the actual `Total: N` count rather than hardcoding an empty-state expectation. |
| 7 | `tabs-preserve-date-range.spec.ts` (RPT02-2) | Standardized both the baseline and comparison captures on `innerText()` (previously mixed with `textContent()`, which collapses whitespace differently, e.g. "Aug 24Aug 28"). |
| 8 | `date-range-preset-selection.spec.ts` (RPT03-2) | Reopening the date pill for a second preset raced the first preset's overlay teardown; added an explicit wait for the `.cdk-overlay-backdrop` to detach before reopening. |

### Final results

| Suite | Result |
|---|---|
| Chromium, `tests/advance-report/` (25 specs) | **25 / 25 passing**, stable across 2 consecutive runs |
| Firefox, full spot-check | **25 / 25 passing**, no browser-specific issues found |

No application code was changed for any fix — this screen is read-only, and every fix was a
test-side selector/wait/assertion correction.

## 4. Defects Log

### D1 — "Recruit + OM + HR + TL" composite score column shows the interview date, not a score (High)

- **Where:** Advance Report → Following Up Report tab → composite score column.
- **Steps to reproduce:** Open Advance Report, widen the date range to include any seeded
  candidate (e.g. 1 Feb – 28 Aug 2026), read the composite column for any row.
- **Expected:** A composite score value (e.g. derived from the visible OVERALL/Average shown in
  the candidate's own profile, such as Raksa CHANN's 83.5%).
- **Actual:** The column shows a timestamp identical in format to the Interview Date column (e.g.
  `24/Aug/26 10:28 AM`) or `-`, never a score, for all 3 rows in the seeded dataset — even for the
  one candidate whose real composite score is visible and correct elsewhere in the app.
- **Impact:** The report's headline scoring column is unusable for its stated purpose (deciding
  who needs follow-up action based on their composite score).
- **Evidence:** `defect-RPT01-composite-score-column-shows-interview-date.png`.
- **Suggested fix:** the column is very likely bound to the wrong backend field (interview
  date/time instead of the composite score field) — a data-binding fix, not a missing-feature
  gap.

### D2 — Remark column renders blank on the Following Up tab but not on Summary Full Staff (Medium)

- **Where:** Advance Report → Following Up Report tab, Remark column vs. Summary Full Staff tab,
  Remark column.
- **Steps to reproduce:** Find a candidate with a known remark (e.g. via their eye-icon dialog, or
  cross-referenced on Summary Full Staff); compare the same information on the Following Up tab.
- **Expected:** Consistent remark content across tabs for the same candidate, or an intentional,
  documented reason why one tab omits it.
- **Actual:** Following Up tab's Remark column is always blank; Summary Full Staff's Remark column
  correctly shows text (e.g. "Passed.") for the same candidate.
- **Impact:** Recruiters using the Following Up tab (the report's default/primary view) lose
  visibility into remark content that is available elsewhere in the same report.
- **Evidence:** `defect-RPT08-remark-column-blank-only-on-following-up-tab.png`.

## 5. Test Coverage Analysis

| Acceptance criteria group | Manual coverage | Automated coverage |
|---|---|---|
| RMS-RPT-01 (Following Up report view) | Yes | Yes (incl. D1 documented) |
| RMS-RPT-02 (tab switching) | Yes | Yes |
| RMS-RPT-03 (date range filter) | Yes | Yes |
| RMS-RPT-04 (additional filters) | Yes | Yes |
| RMS-RPT-05 (search) | Yes | Yes |
| RMS-RPT-06 (Excel export) | Yes (presence/clickability only) | Yes (presence only — file contents not verified, see gap below) |
| RMS-RPT-07 (candidate profile link-through) | Yes | Yes |
| RMS-RPT-08 (eye icon / row detail) | Yes (incl. D2 documented) | Yes |
| RMS-RPT-09 (pagination) | Yes | Yes |
| RMS-RPT-10 (breadcrumb) | Yes | Yes |

Gaps / recommendations:
- Excel export's downloaded file contents (correct rows/columns for the active tab/filter/search)
  were not verified — only that the export control is present and clickable. Recommend a follow-up
  pass that downloads and parses the file once a safe, repeatable way to do so in CI is confirmed.
- D1 should be re-tested against a larger seeded dataset once fixed, to confirm the composite
  value renders correctly across more than the current 3 rows.
- WebKit was not run for this epic (chromium full run + firefox spot-check only, per this
  session's scope) — recommend adding it to the epic's own CI matrix.

## 6. Summary and Recommendations

Overall quality: **solid for a read-only reporting screen**, with one high-severity data-display
defect (D1) that undermines the report's core purpose and one medium-severity inconsistency (D2).
Both are documented with reproducible evidence rather than silently worked around in the test
suite. The generated suite is fully stable (25/25 on both chromium and firefox) and reuses the
existing helper library.

Risk areas: D1 is the priority — a report whose headline scoring column doesn't show scores is a
functional regression risk for anyone relying on it to triage candidates. D2 is lower risk but
should be fixed for consistency.

Next steps: fix D1 (very likely a backend field-binding fix) and D2, re-run
`following-up-default-view.spec.ts` and `eye-icon-remark-dialog.spec.ts` afterward to confirm the
fixes, and add an Excel-export content-verification pass plus WebKit coverage in a follow-up.

## Notes

Playwright MCP browser tools were confirmed unavailable again this session. All exploration,
script generation, and healing used real Playwright/`playwright-core` scripts and the
`@playwright/test` runner directly against the live app. Throwaway diagnostic scripts were kept
only in the session scratch directory, never committed to the repo. During exploratory testing,
~58 orphaned `chrome.exe` processes from earlier interrupted script runs were found and cleaned up
as routine hygiene, unrelated to any app defect.
