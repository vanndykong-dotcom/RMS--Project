# Candidate List (RMS-CANDLIST) — Exploratory Testing Results

**Date:** 2026-09-28 · **Environment:** https://rms-dev.allweb.com.kh (shared dev, live data) ·
**Browser:** Chromium (headless, 1600×1000) · **Plan:** `specs/candidate-list-test-plan.md`

**Method:** Playwright MCP browser tools were not available in this session (the
`playwright-test` agents and MCP server were installed during the session and load only on
restart). Exploration used throwaway Node scripts driving `@playwright/test`'s `chromium` from the
session scratch directory. Nothing was written to live data: menus were closed with Escape and
dialogs with Cancel.

**Caveat on timing:** the first pass ran while the chromium regression was also running against
the same server, and those tests create and archive synthetic candidates. Anything
order- or count-sensitive (sorting, pagination) was re-checked on a quiet server; see §3.

## 1. Results by story

| Story | Result | Notes |
|---|---|---|
| 01 Header | PASS | Breadcrumb `Dashboard > Candidates > List candidates`, title `Manage Candidates`, subtitle `List all candidate` (singular, as the story expects), `Archive` and `Add` buttons. |
| 02 Filter/search | PASS, with scope gap | See §2.1. `Total: N` recomputes for both filter and search. |
| 03 Columns/rows | PASS, story data outdated | Column order exact. Subtitle only when a position is set. Initials fallback (`KI`, `SQ`…) when no photo. Multi-university stacking confirmed. See §2.2. |
| 04 Sort | **DEFECTS** (§3) | Four sortable headers only (`aria-sort` on Full Name, gpa, priority, created). Created sorts correctly; GPA and Priority don't; sorting keeps the current page. |
| 05 Status | PASS (inline edit) / **DEFECT** (colour) | Pill is a `mat-menu-trigger` with `arrow_drop_down` in every row, so it is inline-editable. All 7 statuses share one CSS class. See §2.3. |
| 06 Score | PASS | `88.5% (Quiz: 45, Coding: 87 )` and `91% (Quiz: 45, Coding: 46 )`, with a space before `)`. The scoring formula is still an open question. |
| 07 Pagination | PASS / a11y finding | 15/15/5 rows, `Total: 35`, pages 1–3, the active page gets class `active` (§3). Page numbers aren't reachable by keyboard (§2.4). |
| 08 Navigate | PASS | Name link `href=/admin/candidate/candidateDetail/<id>`, heading matches. Eye icon covered by the existing spec. |
| 09 Menu/Modify | PASS | Order exact: Modify, Set Reminder, Set Interview, Add Activity Log, Add interview result, Add to archive. |
| 10 Reminder | PASS (existing spec) | — |
| 11 Interview | PASS | Candidate and Apply for both pre-filled (§3). Minor: Date & time defaults to "now", which the form itself rejects ("Can't be current time"). |
| 12 Activity | PASS | Open question resolved: "Add Activity Log" **has** an icon (`activity icon`). |
| 13 Result | PASS | Disabled for Sovan NI (no interview), consistent with the rule confirmed in `candidate-management.md`. |
| 14 Archive | PASS (existing spec) | Confirmation step exists. Minor: the "Add to archive" label is not red (`rgba(0,0,0,.87)`); only the icon is styled. |

## 2. Findings

### 2.1 Search scope (open question resolved)
| Query | Total | Matched field |
|---|---|---|
| `phumra` / `KANNA` | 1 / 2 | Name, case-insensitive |
| `Java Backend`, `Marketing` | 5, 7 | Applied-for position |
| `Norton` | 5 | University |
| `PASSED` | 6 | Status |
| `Male` / `Female` | 18 / 17 | Gender (exact, "Male" does not match "Female") |
| `High` / `Normal` | 4 / 34 | Priority |
| `088 933 9739`, `0889339739`, `933` | 0 | **Phone is not searched** |
| `3.5` | 0 | **GPA is not searched** |

The Dashboard's global search advertises "Name, phone number, university, GPA, Status". This
page doesn't search phone or GPA. Logged as **CANDLIST-02-1 (Low, scope gap / PM question)**.

### 2.2 Story data table is inaccurate
The Interview column holds the scheduled interview date/time, plus the score if there is one
(e.g. `17/Sep/2026 10:05 AM 91% (Quiz: 45, Coding: 46 )`). The story recorded those
interview dates as "Created" and marked the real Created values as "obscured". Row 1 (Ms. Kanna
II) has also moved from `MISSED` to `PASSED` since the story was captured. Recommendation: fix the
story table, and don't hard-code row-1 values in automation.

### 2.3 DEFECT CANDLIST-05-2: every status pill gets the same class
Every status renders as `<span class="select-status following mat-select-following">`, e.g. for
NEW REQUEST, PASSED, FAILED, MISSED, ATTENDED, IN PROGRESS and FOLLOWING UP alike. The computed
colours are identical: background `rgb(253, 244, 219)`, text `rgb(255, 153, 0)`. The class name
suggests it was meant to vary per status (`following` = FOLLOWING UP). This is the same defect
family as CAND01-2 on Candidate Details. **Severity: Low (visual), but it defeats at-a-glance
triage, which is the point of RMS-CANDLIST-05.**

### 2.4 Accessibility: pagination not keyboard-reachable
Page numbers are `<span class="page-note page-note-item">` with no `role` and `tabIndex = -1`;
the prev/next arrows are `<span>` + `mat-icon`. A keyboard-only user can't change page.
**CANDLIST-07-1 (Low, a11y).**

### 2.5 GPA "0" (open question, unchanged)
Ms. Kim MOUY still shows GPA `0` (not `N/A`). Carried forward to PM; not asserted as a defect.

## 3. Re-checked on a quiet server

Re-run after the regression finished and today's 9 orphaned synthetic candidates were archived
(active list back to `Total: 35`). All sort checks read every row across all 3 pages, starting
from page 1.

| Check | Result |
|---|---|
| Pagination | Pages 1/2/3 hold 15/15/5 rows; clicked page gets `active`; Total stays 35. **PASS** |
| Default order | Created descending across all 35 rows. **PASS** (resolves the story's open question) |
| Created asc / desc | Monotonic across all 35 rows both ways; `aria-sort` toggles ascending/descending. **PASS** |
| Sort from page 2 | Request goes out with `page=2`, page 2 stays active. **DEFECT CANDLIST-04-2** |
| GPA asc / desc | Ascending starts `1, 3, 1, 2, 1, 1…`; descending is exactly that sequence reversed. The server sorts by some other field, not GPA. **DEFECT CANDLIST-04-3** |
| Priority asc / desc | The 4 High rows sit at positions 4, 5, 29, 31 ascending; descending is the exact reverse. **DEFECT CANDLIST-04-4** |
| Full Name asc / desc | `sortByField=firstname`, but rows group by salutation (Miss. → Mr. → Mrs. → Ms.), then first name. **DEFECT CANDLIST-04-1 (Low)** |
| Set Interview pre-fill (Phumra CHAN) | Candidate `Mr. Phumra CHAN`, Apply for `Java Backend Developer`. **PASS**. My first-pass suspicion was wrong: Sovan NI's empty "Apply for" is only because that candidate has no position. |
| Add interview result label | For a candidate who already has a result (Phumra CHAN), the item reads **"Last interview result"**, not "Add interview result". Not in the story; noted for PM. |

**Why the first pass looked wrong:** sorting from a later page keeps that page. So my first
"Created sort is inverted" reading was page 3 of a correct sort, which makes it a symptom of
CANDLIST-04-2 rather than a separate defect.

**Side finding:** searching `CAL05-3` returns `Total: 0`, although a candidate's last name is
`CANDIDATE CAL05-3 1787544382116`, while searching `Qaautomationtest` finds it. Searching
text with a hyphen or digits in it seems unreliable. Logged with CANDLIST-02-1.

## 4. Evidence
`test-reports/evidence/CANDLIST-*.png` (captured this session).
