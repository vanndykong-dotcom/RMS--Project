# Test Execution Report: Manage Candidates List (RMS-CANDLIST)

**Date:** 2026-09-28 · **Environment:** https://rms-dev.allweb.com.kh (shared dev, live data,
build v3.19.0) · **Browser:** Chromium (Desktop Chrome) · **Story:** Part 1 of
`user-stories/scrum-candidate-list-interview-schedule.md` · **Plan:**
`specs/candidate-list-test-plan.md` · **Exploratory results:**
`specs/candidate-list-exploratory-results.md`

Part of the 2026-09-28 smart re-run: **FULL** for this story (new since the last commit), and
**PARTIAL** for every other module. The partial side is in
`test-reports/reruns/incremental-rerun-2026-09-28.md`.

## 1. Executive Summary

| Metric | Count |
|---|---|
| Stories in scope | 14 (RMS-CANDLIST-01..14) |
| Scenarios planned | 25 (16 on existing specs, 9 new) |
| Scenarios executed manually (exploratory) | 25 |
| New automated tests | 11 in 7 files |
| Automated tests in `tests/candidate-list/` | 31 (23 pass, 4 fail by design, 4 blocked by server write latency) |
| New defects confirmed | 7 (2 Medium, 5 Low) plus 1 environment blocker |
| Story corrections | 3 |
| Open questions resolved from the story | 7 of 9 |

**Overall: CONDITIONAL PASS.** Every story's core behaviour works. Sorting is the weak area:
GPA and Priority don't sort by their own values, and sorting doesn't return to page 1. The shared
dev environment was unstable all day (see §4 ENV-1/ENV-2), which limited final confirmation of the
write-flow specs.

## 2. Manual Test Results (Exploratory)

| Story | Result | Key observation |
|---|---|---|
| 01 Header | PASS | Exact breadcrumb/title/subtitle ("List all candidate", singular). |
| 02 Filter/search | PASS* | Search covers name, position, university, status, gender and priority, but **not phone or GPA** (CANDLIST-02-1). |
| 03 Columns/rows | PASS | Column order exact. The story's data table misplaces the Interview/Created values (story correction). |
| 04 Sort | **FAIL** | Created correct; GPA, Priority wrong; page not reset (CANDLIST-04-1..4). |
| 05 Status | PASS / defect | Inline-editable (resolved). All 7 statuses share one CSS class (CANDLIST-05-2). |
| 06 Score | PASS | `NN% (Quiz: NN, Coding: NN )`; formula still open. |
| 07 Pagination | PASS / a11y | 15/15/5 rows, Total 35. Page numbers not keyboard-reachable (CANDLIST-07-1). |
| 08 Navigate | PASS | Name link and eye icon both open Candidate Details. |
| 09 Menu | PASS | Exact order; every item has an icon (story's open question on Add Activity Log resolved). |
| 10–12 Reminder / Interview / Activity | PASS | Set Interview pre-fills Candidate **and** Apply for. |
| 13 Interview result | PASS | Disabled until an interview is set; label becomes "Last interview result" once a result exists. |
| 14 Archive | PASS | Confirmation step exists (open question resolved). Label not red, only the icon. |

Evidence: `test-reports/evidence/CANDLIST-*.png`, `defect-CANDLIST04-2-*.png`,
`defect-CANDLIST05-2-*.png`.

**Self-corrections made during exploration** (kept here so the record is honest): a suspected
"Apply for not pre-filled" defect was withdrawn, since Sovan NI simply has no position, and a
suspected "Created sort inverted" was really CANDLIST-04-2 (the list was on page 3). Both were
caught by re-checking on a quiet server before any defect was logged.

## 3. Automated Test Results

### New specs (Step 4)

| File | Tests | Result (final) |
|---|---|---|
| `search-scope.spec.ts` | CL02-3 | PASS |
| `sort-headers-and-default.spec.ts` | CL04-1a / 1b / 1c / 1d | PASS / FAIL (defect) / FAIL (defect) / PASS ⚠ |
| `status-pill-rendering.spec.ts` | CL05-2a / 2b | PASS / FAIL (defect) |
| `pagination-page-numbers.spec.ts` | CL07-2 | PASS |
| `name-link-opens-details.spec.ts` | CL08-2 | PASS |
| `row-menu-order.spec.ts` | CL09-1 | PASS |
| `set-interview-prefill.spec.ts` | CL11-2 | PASS |

⚠ **CL04-1d is not a reliable defect detector.** It failed when run on its own on a quiet server,
but passed in both full runs, because page 1's order depends on what other data exists at the
time. It should check the order across all pages, as the exploration did. Logged as a follow-up.
Treat CANDLIST-04-4 as confirmed by exploration, not by this test.

### Healing on this story's specs

| # | Spec | Cause | Fix |
|---|---|---|---|
| 1 | CL04-1a, CL05-2a (new) | Read `tbody tr` while the table showed its one-row loading placeholder | Wait for the rendered rows to match `min(Total, 15)` |
| 2 | A8, A9, A10, E2 cleanup (`archiveCandidateFromActiveList`) | Re-searched with the **same** text, so no new request fired and the helper re-read stale rows, then "retried" archiving an already-archived record | Clear the box, search again, and poll up to 15s before retrying |
| 3 | A10 (`row-menu-set-interview`) | Interview booked 3 days out (1 Oct), but the calendar opened on September and only loads its own month | New `goToCalendarMonth()` to the booked month |
| 4 | A10, C1 (`ensureOnCandidateList`) | A full reload repeats the Keycloak SSO round trip, and 5s wasn't enough | 20s for the heading after a reload |
| 5 | Post-login redirect (all specs) | Keycloak redirect measured up to ~8s under 3 workers; the 5s default failed 32 tests | 20s on the post-login URL assertion (17 call sites) |

### Final results for `tests/candidate-list/` (23 files, 31 tests)

| Run | Pass | Fail (defect, by design) | Fail (other) |
|---|---|---|---|
| Baseline, start of day (20 tests before the new specs) | 13 | — | 7 |
| Full parallel run (3 workers) | **22** | 4 (CL04-1b, CL04-1c, CL05-2b, A13\*) | 5 (A1, A5, A8, A10, A11) |
| Serial re-run of those 5, login restored | A1 ✓ | — | 4 (A5, A8, A10, A11): **blocked**, server took >30s to answer create requests (see re-run report, run 7) |

\* A13 fails by design (known defect "archive search ignores last name", carried forward).

A1 is a login-only failure. The write-flow specs (A5, A8, A10, A11) passed serially earlier today (runs 2–3) and fail only
under 3 parallel workers, where they create and archive rows on the one shared list. Their final
confirmation after heals #2–#4 was blocked by the login outage. **Status: healed but not
re-verified.**

## 4. Defects Log

| ID | Sev. | Title | Steps | Expected | Actual | Evidence |
|---|---|---|---|---|---|---|
| CANDLIST-04-3 | **Medium** | GPA sort doesn't sort by GPA | Candidate list → click `gpa` → read all 3 pages; click again | Rows ordered by GPA value | Ascending `1, 3, 1, 2, 1…`; descending is the exact reverse sequence (server sorts by another field) | exploratory §3; CL04-1c |
| CANDLIST-04-4 | **Medium** | Priority sort doesn't group High/Normal | Click `priority` (×1, ×2), read all pages | All High before (or after) all Normal | High rows at positions 4, 5, 29, 31; descending = exact reverse | exploratory §3 |
| CANDLIST-04-2 | Low | Sorting keeps the current page | Go to page 2 → click any sort header | Returns to page 1 | Request sent with `page=2`; page 2 stays active | `defect-CANDLIST04-2-sort-keeps-current-page.png`; CL04-1b |
| CANDLIST-04-1 | Low | Full Name sort groups by salutation | Click `Full Name` | Ordered by name | `sortByField=firstname`, but rows go Miss. → Mr. → Mrs. → Ms., then first name | `CANDLIST-04-sort-full-name.png` |
| CANDLIST-05-2 | Low | Every status pill has the same style | Compare status pills | Colour per status (as on Dashboard) | All 7 statuses: class `select-status following`, bg `rgb(253,244,219)` | `defect-CANDLIST05-2-status-pills-same-class.png`; CL05-2b |
| CANDLIST-07-1 | Low (a11y) | Page numbers not keyboard-reachable | Tab through the footer | Page controls focusable buttons | `<span>`, no role, `tabIndex=-1` | exploratory §2.4 |
| CANDLIST-02-1 | Low | Search misses phone/GPA; hyphenated terms | Search `088 933 9739`, `3.5`, `CAL05-3` | Matches (Dashboard search advertises phone and GPA) | `Total: 0` for all three | exploratory §2.1, §3 |
| ENV-1 | **High (environment)** | Keycloak login intermittently fails | Log in repeatedly | Dashboard | Intermittent `unauthorized_client: Standard flow is disabled for the client` for `rms-angular`; from ~09:55 on 2026-09-28, logins hung on `/welcome` for 30–54s | run logs, see re-run report |

Environment details for all rows: rms-dev, v3.19.0, Chromium via Playwright 1.62.1, Windows 11,
account `RMS_EMAIL` (Super ADMIN).

**Story corrections (not defects):**
1. The story's data table puts interview dates under "Created" and marks the real Created values as obscured.
2. Row 1 status is now PASSED (not MISSED); row values drift, so no automation hard-codes them.
3. "Add Activity Log" does have an icon.

## 5. Test Coverage Analysis

| Story | Manual | Automated |
|---|---|---|
| 01, 03, 06, 08, 09, 10, 12, 13, 14 | Yes | Yes |
| 02 | Yes | Yes, incl. search scope (CL02-3) |
| 04 | Yes | Yes (CL04-1a..d + A4); 1d needs an all-pages rewrite |
| 05 | Yes | Yes (A5, CL05-2a/b) |
| 07 | Yes | Yes (A6, CL07-2) |
| 11 | Yes | Yes (A10, CL11-2) |

**Gaps:**
- The interview scoring formula (open question, not asserted).
- The Filter panel is covered by status only (INTERVIEW/REMINDER tabs not exercised).
- Keyboard accessibility is noted, not automated.
- Cross-browser: this run was chromium only; firefox and webkit weren't run.

## 6. Summary and Recommendations

- **Quality:** the list page is functionally sound. Fix the GPA and Priority sorts (Medium)
  before relying on them for triage, and reset to page 1 on sort.
- **Risk:** the shared dev environment. Intermittent Keycloak failures and slow redirects
  caused most of today's red results. Ask DevOps about the `rms-angular` client's Standard-flow
  setting flipping, and about Keycloak brute-force limits for the automation account.
- **Next steps:**
  1. Re-verify the 6 write-flow specs once login is stable (`npx playwright test --project=chromium --workers=1 tests/candidate-list`).
  2. Run the write suites serially in CI: add a `workers: 1` project for `candidate-list`, `candidate-archive`, `candidate-modify` and `interview-schedule` writes. This is a config change for the team to decide on.
  3. Rewrite CL04-1d to check across all pages.
  4. Done: today's leftover synthetic candidates are archived (active list back to 35).
  5. Take the open questions (GPA "0", scoring formula, the "Last interview result" label) to PM.
