# Consolidated Backlog — ALLWEB RMS

Triage of the 6 files in `user-stories/` into one backlog: `scrum-candidate-management.md`, `scrum-advance-report.md` (RMS-RPT), `scrum-candidate-details.md` (RMS-CAND), `scrum-candidate-list-interview-schedule.md` (RMS-CANDLIST + RMS-CAL), `scrum-job-management.md` (RMS-JOB), `scrum-dashboard.md` (RMS-DASH).

**53 backlog items, 152 estimated points** (43 pointed stories across 5 epics + 10 unpointed acceptance criteria in the un-estimated `scrum-candidate-management.md` epic). Cross-referenced against QA coverage in `specs/` and `test-reports/`.

## 1. Priority summary

| Priority | Stories | Points |
|---|---|---|
| High | 19 | 76 |
| Medium | 17 | 65 |
| Low | 7 | 11 |
| Unscored (scrum-candidate-management.md) | 10 ACs | — |

## 2. High priority — do first

| ID | Epic | Story | Pts | Blocked by |
|---|---|---|---|---|
| RMS-DASH-04 | Dashboard | Resource Demanding table (sort, pagination, status theming, 3 entry points) | 8 | Demand module spec; status/color vocab; overdue-threshold logic |
| RMS-RPT-02 | Advance Report | Switch report tabs (Full Staff / Intern) | 8 | Designs for the other 2 tabs — **not buildable yet** |
| RMS-JOB-06 | Job Management | Row menu: Modify/Delete/Share/Get file | 8 | Delete confirmation copy; Share destination; file export format |
| RMS-CAND-04 | Candidate Details | Browse/manage candidate files | 8 | Delete-confirmation decision (data-loss risk) |
| RMS-RPT-01 | Advance Report | View Following-Up report | 5 | — |
| RMS-RPT-03 | Advance Report | Filter by date range | 5 | Default range not defined |
| RMS-RPT-06 | Advance Report | Export to Excel | 5 | File-naming convention |
| RMS-CAL-01 | Interview Schedule | Monthly calendar view | 5 | — |
| RMS-CAL-02 | Interview Schedule | Day/Week/Month toggle | 5 | — |
| RMS-DASH-06 | Dashboard | This Week Interview panel | 5 | Duplicate-interviewer-badge defect to verify; week-boundary rule |
| RMS-CAL-03 | Interview Schedule | Navigate periods (prev/next/today) | 3 | — |
| RMS-CAL-05 | Interview Schedule | Create interview from calendar | 3 | Interview creation form spec |
| RMS-JOB-01 | Job Management | View job description list | 3 | — |
| RMS-JOB-03 | Job Management | Add job description (entry point) | 3 | Add/edit form spec |
| RMS-DASH-02 | Dashboard | Left nav menu | 3 | Setting/Administration submenu contents |
| RMS-DASH-03 | Dashboard | Quick Access summary counts | 3 | — |
| RMS-CAND-02 | Candidate Details | Profile info card | 3 | — |
| RMS-CAND-08 | Candidate Details | Edit candidate (entry point) | 3 | Edit form spec |
| RMS-CAND-01 | Candidate Details | Header + status badge | 2 | — |
| RMS-CAND-06 | Candidate Details | Schedule interview (entry point) | 2 | Set Interview form spec, RMS-CAL |
| RMS-CAND-09 | Candidate Details | Record interview result (entry point) | 2 | Interview Result form spec |

**19 stories, 76 points.** Note: RMS-RPT-02 and RMS-JOB-06 are High-priority but explicitly not buildable as-is — flag for refinement before sprint commitment rather than pulling into a sprint as-is.

## 3. Medium priority

| ID | Epic | Story | Pts |
|---|---|---|---|
| RMS-CAND-04 dep... | *(see above — High)* | | |
| RMS-RPT-04 | Advance Report | Additional filters | 5 |
| RMS-RPT-07 | Advance Report | Open candidate profile from report | 3 |
| RMS-RPT-05 | Advance Report | Search within report | 3 |
| RMS-CAND-03 | Candidate Details | Education history | 3 |
| RMS-CAND-05 | Candidate Details | Log activity (entry point) | 2 |
| RMS-CAND-07 | Candidate Details | Set reminder (entry point) | 2 |
| RMS-CAL-04 | Interview Schedule | Search interviews/candidates | 5 |
| RMS-CAL-06 | Interview Schedule | Status color-coding + detail on click | 5 |
| RMS-JOB-02 | Job Management | Search job descriptions | 3 |
| RMS-JOB-04 | Job Management | Toggle active status | 3 |
| RMS-JOB-05 | Job Management | View full detail | 2 |
| RMS-DASH-01 | Dashboard | Top nav + global search | 2 |
| RMS-DASH-05 | Dashboard | Top Candidates section | 5 |
| RMS-DASH-07 | Dashboard | This Week Reminder panel | 3 |
| RMS-DASH-08 | Dashboard | Data freshness + empty states | 3 |

**17 stories, 65 points.**

## 4. Low priority

| ID | Epic | Story | Pts |
|---|---|---|---|
| RMS-RPT-08 | Advance Report | Row detail via eye icon | 3 |
| RMS-RPT-09 | Advance Report | Pagination | 2 |
| RMS-RPT-10 | Advance Report | Breadcrumb | 1 |
| RMS-CAND-10 | Candidate Details | Breadcrumb | 1 |
| RMS-CAL-07 | Interview Schedule | Breadcrumb | 1 |
| RMS-JOB-07 | Job Management | Pagination | 2 |
| RMS-JOB-08 | Job Management | Breadcrumb | 1 |

**7 stories, 11 points.** All 3 breadcrumb stories are trivial and can be batched into a single ticket if the header component is shared.

## 5. Unscored — `scrum-candidate-management.md` (Manage Candidates list)

This file predates the RMS-* epic ID convention (`specs/candidate-management.md` still refers to it by an older name, `scrum_2.md`) and has no per-story point/priority breakdown — it's a single epic with 10 acceptance criteria instead of 10 discrete stories. Flag to backfill an epic ID (e.g. `RMS-CANDLIST`) and split/estimate its ACs so it triages the same way as the other five.

Its 3 open questions (GPA scale, `EXPERIENCE` always N/A, access control on inline status edit) are already **resolved** by QA exploration recorded in `specs/candidate-management.md` — worth folding those answers back into this file so it stops listing them as open.

## 6. Cross-epic blockers (recurring themes)

These aren't per-story issues — they block multiple stories across different epics and should be resolved once, centrally, rather than re-litigated per ticket:

- **Delete without confirmation** — flagged as a data-loss risk in both RMS-CAND-04 (candidate files) and RMS-JOB-06 (job descriptions). One product decision (require confirm dialog on all destructive actions) unblocks both.
- **Status vocabulary / color mapping** — used inconsistently across RMS-CAL (interview status pills), RMS-DASH-04 (demand status), and RMS-CAND-01 (candidate status badge). A single documented status→color table would remove 3 separate open questions.
- **Empty states** — undefined for RMS-DASH-08 and implicitly relevant to every list/table story (RPT, JOB, CAL). Worth a shared design decision rather than per-epic guesswork.
- **"This week" boundary (Mon vs Sun)** — blocks RMS-DASH-06 and RMS-DASH-07 identically.

## 7. QA coverage vs. backlog (gap check)

| Epic | Backlog file | Test plan | Exploratory results | Test report |
|---|---|---|---|---|
| Manage Candidates (list) | scrum-candidate-management.md | `candidate-management.md` | — | — |
| RMS-CAND (Candidate Details) | scrum-candidate-details.md | `candidate-details-test-plan.md` | `candidate-details-exploratory-results.md` | `candidate-details-test-report.md` |
| RMS-RPT (Advance Report) | scrum-advance-report.md | `advance-report-test-plan.md` | `advance-report-exploratory-results.md` | `advance-report-test-report.md` |
| RMS-CAL (Interview Schedule) | scrum-candidate-list-interview-schedule.md | `interview-schedule-test-plan.md` | `interview-schedule-exploratory-results.md` | `interview-schedule-test-report.md` |
| RMS-JOB (Job Management) | scrum-job-management.md | `job-management-test-plan.md` | `job-management-exploratory-results.md` | `job-management-test-report.md` |
| **RMS-DASH (Dashboard)** | scrum-dashboard.md | **none** | **none** | **none** |

**Gap: Dashboard has zero QA artifacts.** It's the newest spec (captured 21/Sep/2026, today's date) and was explicitly written "as input for Claude Code to generate and run automated UI tests," so this is likely just next in queue rather than an oversight — but it's the one epic with no test-plan started, despite carrying 32 points and 4 High-priority stories (RMS-DASH-02/03/04/06).

Side note, not a backlog gap but worth knowing: `authentication-exploratory-results.md` and `authentication-test-report.md` exist with no corresponding `scrum-authentication.md` — QA has coverage for a flow that was never written up as a backlog story.

## 8. Recommended sequencing

1. **Resolve cross-epic blockers (§6)** — one round of product decisions unblocks the most stories per unit of effort.
2. **Pull RMS-DASH High-priority stories into the next test-plan cycle** — only epic with no QA artifacts yet, and it's already fully spec'd.
3. **Build High-priority, unblocked stories** (§2 minus RMS-RPT-02 and RMS-JOB-06, which need design/product input first).
4. **Backfill scrum-candidate-management.md** with epic ID + per-AC points so it stops being the one inconsistent file in the set.
