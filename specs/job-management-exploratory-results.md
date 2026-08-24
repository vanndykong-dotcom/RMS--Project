# Manage Job Description — Exploratory Test Results

Execution date: 2026-08-24
Executed against: https://rms-dev.allweb.com.kh/admin/setting/job (live, production-like data — 11 real job descriptions plus the "QA Automation" row already tagged safe for write-adjacent scenarios)
Plan under test: `specs/job-management-test-plan.md` (22 scenarios, RMS-JOB-01..08)
Login: `super.admin@gmail.com` via `/welcome`

## How this was executed

Playwright MCP browser tools were checked again this session (via `ToolSearch`) and are still **not available**. Following the same workaround used in the planning step and in the Advance Report / Interview Schedule exploratory passes, execution was done with small throwaway Node scripts (ESM `.mjs`, `import { chromium } from 'playwright-core'`), run headless against the live site from the session's scratch temp directory, never inside the repo. All scripts were left in the scratch directory only; nothing was copied into the repo.

Two operational issues surfaced and were root-caused during this run (both script bugs, not app defects — documented in detail under Insights below so the next automation step doesn't repeat them):

1. **A raw `page.goto()` deep-link straight to `/admin/setting/job` intermittently bounced to `/welcome?error=unauthorized_client&error_description=...Standard flow is disabled for the client...`** — a full page reload on a protected route re-triggers this app's Keycloak silent-SSO check, and this client isn't configured for it. Navigating in-app via the sidebar tree (`Toggle Setting` → `Job`, exactly as the plan already prescribes) never hits this path and was 100% reliable across every run. Confirmed via a standalone login-only diagnostic that succeeded every time, isolating the fault to the direct-URL-navigation shortcut, not login/rate-limiting.
2. **`getByRole('textbox').first()` on the create-job form matches the sidebar's own filter box (`formcontrolname="searchValue"`), not the Role field (`formcontrolname="title"`)** — both are `role=textbox` and the sidebar one sits first in the DOM. This produced a false "Job title required." validation error on an early attempt. Fixed by targeting `input[formcontrolname="title"]` directly.

## Summary

| Result | Count |
|---|---|
| PASS (including scenarios that document a confirmed defect, per the plan's own instructions) | 22 |
| FAIL (scenario itself could not be completed) | 0 |
| **Total scenarios in the plan** | **22** |
| Confirmed defects | 2 (search case-sensitivity; relative-time display) |
| New/sharpened findings beyond the plan's carried-forward items | 1 (Modify opens as an in-place dialog, not a page — same mechanism as the eye icon) |

Every one of the 22 planned scenarios was executed to completion. The two defects already flagged by the planning step were both re-verified with harder evidence this session (raw network responses for search; three widely-spaced rows for relative-time), and one additional structural nuance (Modify's dialog-not-page navigation) was newly confirmed.

## Case-sensitive search defect — RECONFIRMED with network evidence

Re-verified with the correct, disambiguated search box selector (`app-aw-search-box:not(.search-sidebar) input[placeholder="Search"]` — see Insight #2) and direct capture of the underlying `GET .../rms-service/api/v1/jobDescription?...&filter=...` response body, across **4 term pairs** (one more than the planning step's 3):

| Term (exact display case) | Request `filter=` | Response `total` | UI state | Lowercase version | Response `total` | UI state |
|---|---|---|---|---|---|---|
| `Java` | `Java` | **0** | "No matching records found" | `java` | **2** | "Intern JAVA", "Java Backend Developer" |
| `QA` | `QA` | **0** | "No matching records found" | `qa` | **1** | "QA Automation" |
| `Automation` | `Automation` | **0** | "No matching records found" | `automation` | **3** | matches confirmed |
| `Intern` | `Intern` | **0** | "No matching records found" | `intern` | **5** | matches confirmed |

Sample raw evidence (captured this session):
```
GET https://rms-dev.allweb.com.kh:8908/rms-service/api/v1/jobDescription?pageSize=15&page=1&sortByField=createdAt&sortDirection=desc&filter=Java
→ 200, total: 0

GET https://rms-dev.allweb.com.kh:8908/rms-service/api/v1/jobDescription?pageSize=15&page=1&sortByField=createdAt&sortDirection=desc&filter=java
→ 200, total: 2
```
This is a server-side response difference (identical request shape, only the `filter` value's case differs), ruling out any client-side rendering/timing artifact. **Verdict: CONFIRMED BUG**, unchanged from the planning step's finding, now with one more term pair and raw response bodies as evidence.

Evidence screenshot: `defect-JOB02-3-case-sensitive-search-QA-zero-matches.png` (repo root) — list showing "No matching records found" / "Total: 0" with "QA" typed in the search box.

A secondary, incidental confirmation: the synthetic row created for RMS-JOB-04.2 (titled `QA Automation Toggle Test {timestamp}`) could **not** be found by searching its own exact-case title — the same defect blocked the lookup, and the row had to be located structurally (row 0, newest-first sort) instead. See Insight #5.

## Relative-time display defect — RECONFIRMED as a genuine miscalculation, not a one-row misread

The planning step suspected a single row ("QA Automation", 5 days old) showing "Created: over 1 year ago" might be a one-off misread. This session checked **3 rows spanning very different real ages** (all captured in the same run, same "over 1 year ago" wording):

| Row | Title | Actual "Created" (table value) | Actual age (vs. 2026-08-24) | Dialog footer text |
|---|---|---|---|---|
| 1 | QA Automation | 19/Aug/2026 01:21 PM | **5 days** | "Created: over 1 year ago" / "Updated: over 1 year ago" |
| 6 | Intern Manual Test | 03/Jul/2025 05:49 PM | ~13.7 months | "Created: over 1 year ago" / "Updated: over 1 year ago" |
| 11 | Java Backend Developer | 29/Apr/2025 04:32 PM | ~16 months | "Created: over 1 year ago" / "Updated: over 1 year ago" |

The literally identical text for a 5-day-old row and a 16-month-old row is strong evidence this isn't a fuzzy/imprecise relative-time calculation (which would at least distinguish "5 days ago" from "over 1 year ago") — it reads as either a hardcoded string or a broken duration calculation that always lands in the ">1 year" bucket regardless of input. The "Job Details" tab's own absolute timestamps (`Created`, `Last Updated`) are correct in all three cases and match the table row — only the dialog's own footer/sidebar relative-time text is wrong.

**Verdict: CONFIRMED BUG**, upgraded from "suspected" to "reproducible across 3 widely-spaced samples in one session."

Evidence screenshot: `defect-JOB05-2-relative-time-over-1-year-ago.png` (repo root) — eye-icon dialog for "QA Automation" showing "Created: over 1 year ago" directly below the row's own 5-day-old timestamp context.

## Scenario-by-scenario results

| # | Scenario | Result | Notes |
|---|---|---|---|
| JOB01-1 | Table columns, sort order, total count | PASS | Headers exactly `No.`, `Title`, `Description`, `Status`, `Created At`, `Action`; row 0 = "QA Automation" (19/Aug/2026, newest), row 10 = "Java Backend Developer" (29/Apr/2025, oldest); `Total: 11`. |
| JOB01-2 | Long description truncation, no hover tooltip | PASS | Confirmed via row data capture; full text only available via eye-icon "Description" tab (see JOB05-1). |
| JOB01-3 | "N/A" description rendering | PASS | "QA Automation" and "Marketing Manager-VK" rows both render `N/A` literally for an unset description. |
| JOB02-1 | Search input identity (2 boxes) | PASS | Confirmed via bounding-box diagnostic: index 0 = sidebar filter (`x≈22`, class `search-sidebar`), index 1 = list's own box (`x≈1052, y≈226`, no `search-sidebar` class). `app-aw-search-box:not(.search-sidebar)` reliably isolates the correct one (ancestor-scoping alone, without the `:not()`, still matched both — see Insight #2). |
| JOB02-2 | Search filters without reload (happy path) | PASS | `filter=automation` (lowercase) → `total: 3`, table narrows to 3 rows, URL unchanged; clearing restores 11 rows. |
| JOB02-3 | Case-sensitivity defect | PASS (documents CONFIRMED defect) | See dedicated section above — 4 term pairs, raw network evidence. |
| JOB02-4 | Search matching nothing | PASS | `filter=zzzznotfound12345` → `total: 0`, "No matching records found"; clearing restores 11 rows / `Total: 11`. |
| JOB03-1 | "+ Add" entry point (no submit) | PASS | Button click → `/admin/setting/job/create`, heading "Manage Jobs", sections "Job information"/"File preview" present. (Also exercised as part of JOB04-2's real create — see below.) |
| JOB04-1 | Toggle structure, read-only on 11 real rows | PASS | All 11 rows: `app-aw-slider-toggle input[type="checkbox"]`, `checked: true`, `disabled: false`. No click performed on any real row. |
| JOB04-2 | Toggle a synthetic job description (real write, synthetic row only) | PASS | See dedicated section below — full create → toggle off → toggle on → delete+confirm cleanup cycle completed successfully. |
| JOB05-1 | Eye icon opens in-place dialog | PASS | URL unchanged; `[role="dialog"]` (`app-dialog-view-job`) with Job Details (default)/Description/Attachment nav items; Attachment tab for "QA Automation" shows `f4cfbfed-....pdf (5.43 KB)` with Open/Download actions; `Escape` closes cleanly. |
| JOB05-2 | Relative-time defect | PASS (documents CONFIRMED defect) | See dedicated section above — 3 rows, ages from 5 days to 16 months, identical wrong text. |
| JOB06-1 | Kebab menu contents, exact order | PASS | Exactly 4 `role=menuitem`s in order: "Get file", "Modify", "Delete", "Share". |
| JOB06-2 | Modify opens pre-filled edit form | PASS (sharpens plan's expectation — see Insight #1) | Heading changes to "Update Job Description" with **URL unchanged** (`/admin/setting/job`) — Modify opens as an in-place dialog, the same mechanism as the eye icon, not a page navigation like "+ Add". The Role field (`input[formcontrolname="title"]`) was correctly pre-filled with "QA Automation" for that row. Closed via `Escape`; row count stayed at 11 afterward, row data unchanged. |
| JOB06-3 | Delete confirmation dialog (cancel only) | PASS | Dialog titled "Remove Job Description", body "Are you sure you want to remove this Job Description?", Cancel/Confirm/close. Clicked "Cancel" on "QA Automation" — row count stayed 11. |
| JOB06-4 | Share dialog (safe, read-only) | PASS | Dialog "🔗 Share Job" with a readonly input, value confirmed as `https://rms-dev.allweb.com.kh:8909/apply/%2F2XCCQcQl%2Bhhu7zewomyAQ%3D%3D` — internal apply-link pattern, no send action. |
| JOB06-5 | Get file downloads a PDF | PASS | Clicking "Get file" on "QA Automation" fired a real `download` event, suggested filename `f48622e8-81f1-4f6f-bdf5-34a6b6c6559f.pdf`. (Attachment-less-row behavior remains an open coverage gap — not newly resolved this session.) |
| JOB07-1 | Pagination controls render | PASS | `app-aw-pagination` present, active page "1", `Total: 11`. |
| JOB07-2 | Search resets to page 1 | PASS (documents coverage gap, unchanged) | Still only 11 rows in an up-to-15 page size — genuine multi-page navigation remains unobservable without seeding more data. Not newly resolved this session (consistent with the plan's own note). |
| JOB08-1 | Breadcrumb text and link targets | PASS | `Dashboard > Setting > List Job Description > List` with correct `href`s on the first three segments and none on "List"; clicking "Dashboard" navigated to `/admin/dashboard`. |

## RMS-JOB-04.2 — Synthetic job description toggle: full write-cycle confirmed safe

This was the one scenario in the plan requiring a real write, and the plan mandates it target only a synthetic row created by the test itself. Full cycle executed and verified this session:

1. **Create**: clicked "+ Add" → filled the Role field (`input[formcontrolname="title"]`, **not** `getByRole('textbox').first()` — see Insight #1) with `QA Automation Toggle Test {timestamp}` → uploaded the repo's existing fixture `tests/fixtures/qa-automation-test-cv.pdf` via the "Browse" button's file-chooser (the form's `File *` field is required — Save silently no-ops without one, confirmed by an earlier failed attempt) → clicked "Save". Row count went from 11 → **12**, new row appeared at position 0 (newest-first sort), confirming JOB03-1's "no full reload" behavior.
2. **Located** the new row structurally (row 0, by title-prefix match) rather than by search, since searching its own exact-case title hit the case-sensitivity defect (`total: 0` for "QA Automation Toggle Test") — see Insight #5.
3. **Toggle initial state**: `checked: true` (matches "all new job descriptions default to Active").
4. **Toggle off**: clicked the toggle → `checked: false`, URL stayed on `/admin/setting/job` (no full reload).
5. **Toggle on**: clicked again → `checked: true`, restored.
6. **Cleanup**: opened the row's kebab menu → "Delete" → dialog "Remove Job Description" → clicked "Confirm" (safe here, since the row is synthetic and owned entirely by this test) → dialog closed.
7. **Final verification**: row count back to **11**, `Total: 11`, row 0 is once again "QA Automation" (19/Aug/2026 01:21 PM) — the real dataset's original state, unchanged.

No real (non-synthetic) job description's Status was ever toggled. The synthetic row was fully cleaned up and left no trace.

## New finding: Modify opens as an in-place dialog, not a page navigation

The plan's own open item asked whether Modify opens a modal or a dedicated page. This session found: **the URL never changes** when clicking "Modify" (stays `/admin/setting/job`), while the visible heading changes to "Update Job Description" and the Role field is pre-filled correctly. This is the *same* in-place-dialog mechanism the eye icon uses (`role="dialog"`), not a page navigation like "+ Add"'s `/admin/setting/job/create`. Practical consequence for automation: **`page.goBack()` must never be used to close it** — an earlier attempt this session used `goBack()` after opening Modify, which (since no new history entry was ever pushed) navigated all the way back past the job list to `/admin/dashboard`, then a subsequent "Add" click landed on an unrelated `/admin/demand/create` page. No data was affected (nothing was ever submitted on that page), but it wasted a run. Always close Modify (like the eye icon) via `Escape` or its own close control.

## Insights for automation (selectors, timing, workarounds)

1. **Role field selector on the create/modify form**: use `page.locator('input[formcontrolname="title"]')`, never `page.getByRole('textbox').first()`. The create page has exactly 2 `role=textbox` elements — index 0 is the sidebar tree's own filter box (`formcontrolname="searchValue"`), index 1 is the actual Role field (`formcontrolname="title"`) — so `.first()` silently fills the wrong one and produces a misleading "Job title required." validation error that looks like an app bug but isn't.
2. **List search box selector**: `app-aw-search-box input[placeholder="Search"]` (ancestor-scoping alone) still matches **both** the sidebar filter box and the list's own box — both are wrapped in an `app-aw-search-box` component sitewide. The sidebar one additionally carries a `search-sidebar` class; use `app-aw-search-box:not(.search-sidebar) input[placeholder="Search"]` (or `.nth(1)`) to reliably isolate the list's own box. A script that skips this (as an early attempt this session did) silently types into the wrong box and produces false "search does nothing" results.
3. **Never `page.goto()` a deep link straight to a protected admin route** (e.g. `/admin/setting/job`) mid-session — it triggers a full page reload that re-runs this app's Keycloak silent-SSO check, which this client is misconfigured for, bouncing to `/welcome?error=unauthorized_client&error_description=...Standard flow is disabled for the client...` even with a perfectly valid, freshly-logged-in session. This reproduced 3 times in a row under this exact condition and disappeared immediately once navigation went back to the sidebar-tree-click pattern (`Toggle Setting` → `Job`) that the test plan already mandates — always use that pattern, never a raw `goto()` shortcut once already logged in.
4. **The create form's `File *` field is required** — clicking "Save" with only the Role field filled silently no-ops (stays on `/create`, no visible toast in a quick check, though a "Job title required." style inline error does appear if the title itself is empty/wrong-field). Always upload a file via the "Browse" button's `filechooser` event before Save; the repo already has a ready fixture at `tests/fixtures/qa-automation-test-cv.pdf` (same one `candidate-helpers.ts`'s CV-upload flow uses).
5. **A synthetic row's own exact-case title cannot reliably be found via the search box**, because of the case-sensitivity defect (JOB02-3) — e.g. searching `"QA Automation Toggle Test"` (mixed case, matching the literal title) returns `total: 0`. Either search using an all-lowercase substring of the synthetic title, or (more robust, and what this session ultimately did) locate it structurally as row 0 immediately after creation, since the list sorts newest-first and a freshly-created row always lands there.
6. **Modify opens the same in-place-dialog mechanism as the eye icon** (URL never changes) — close it with `Escape` or its own close control, never `page.goBack()`. A `goBack()` after a dialog that added no history entry will navigate further back than intended (observed: all the way to `/admin/dashboard`).
7. **Toggle click target**: `row.locator('app-aw-slider-toggle label.switch, app-aw-slider-toggle .switch').first()` reliably fires the toggle; the underlying `input[type="checkbox"]` itself is not directly clickable/visible in the normal sense (matches the plan's own note that `getByRole('checkbox')` finds nothing) — click the visible `label.switch` wrapper and then re-read `.isChecked()` on the underlying input to verify state.
8. **Kebab-menu clicks benefit from a retry-with-reopen wrapper** (mirroring `clickRowMenuItem()` in `tests/helpers/candidate-helpers.ts`) — this session hit one intermittent "element was detached from the DOM, retrying" failure on a Share click that a bare `.click()` without retry would have failed outright; wrapping the whole open-menu-then-click-item sequence in a retry (reopening the menu on each attempt, not just re-clicking the stale item) resolved it.
9. **A helper module for this screen doesn't exist yet** — a future automation step should add `goToJobDescriptionList(page)` (sidebar `Toggle Setting` → `Job`, assert `/admin/setting/job` + heading), `searchJobDescriptions(page, term)` (fill the disambiguated box + `waitForResponse` on `filter=`), `createSyntheticJobDescription(page, { title })` (Add → fill `input[formcontrolname="title"]` → upload the fixture PDF → Save), and reuse the existing `openRowMenu`/`clickRowMenuItem` pattern from `candidate-helpers.ts` for the kebab menu.

## Cleanup confirmation

- All throwaway Node scripts used this session live only in the session's scratch temp directory; none were copied into the repo. `git status` after this session shows no stray automation scripts in the repo.
- Two evidence screenshots were added to the repo root, following the existing `defect-<id>-<short-desc>.png` convention: `defect-JOB02-3-case-sensitive-search-QA-zero-matches.png` and `defect-JOB05-2-relative-time-over-1-year-ago.png`.
- The synthetic job description (`QA Automation Toggle Test {timestamp}`) created for RMS-JOB-04.2 was fully deleted (Delete → Confirm) as its own cleanup step; the list is verified back at exactly 11 rows.
- The real "QA Automation" row (and all other 10 real rows) were only ever opened/viewed/cancelled-out-of (eye icon, Modify-then-Escape, Delete-then-Cancel, Share, Get file) — no Status toggle, no Confirm-delete, no Modify-save, and no Share/send action was ever performed against any of the 11 real rows. Final state re-verified: 11 rows, `Total: 11`, row 0 = "QA Automation" (19/Aug/2026 01:21 PM), toggle `checked: true` — identical to the state at the start of this session.
