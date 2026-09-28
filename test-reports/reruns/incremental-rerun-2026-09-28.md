# Test Execution Report: Smart Re-run (Step 8), 2026-09-28

**Environment:** https://rms-dev.allweb.com.kh (shared dev, live data, v3.19.0) ·
**Browser:** Chromium · **Playwright:** 1.62.1 · **Previous run:** commit `a02ddf7` (2026-09-22)

## 1. Re-run Scope Decision

| Artifact | Change since last run | Decision |
|---|---|---|
| `user-stories/scrum-candidate-list-interview-schedule.md` Part 1 (RMS-CANDLIST) | **New** (23 Sep), far more prescriptive than the 6 Aug story the list suite was built from | **FULL** re-run of Steps 2–6 for this story: see `test-reports/candidate-list-test-report.md` |
| Same file, Part 2 (RMS-CAL) | Identical to the old `scrum_InterviewSchedule.md` apart from heading levels | PARTIAL |
| `scrum-advance-report.md`, `scrum-candidate-details.md`, `scrum-candidate-management.md`, `scrum-job-management.md` | 100% renames, content unchanged | PARTIAL |
| `scrum-dashboard.md` | Dated 21 Sep, before its suite was committed | PARTIAL |
| `tests/**` | `FAPA_*` → `RMS_*` credential rename (~20 specs); 3 helper fixes from an uncommitted 22 Sep session | PARTIAL: execute and fix |

**Tooling note:** the `playwright-test-planner`/`-generator`/`-healer` agents and the
`playwright-test` MCP server were installed during this session (`npx playwright init-agents
--loop=claude`). They only load on a session restart, so planning, exploration and fixing in this
run were done with scripted Playwright and `npx playwright test`.

## 2. Automated Results (Chromium)

| Run | Scope | Passed | Failed | Skipped |
|---|---|---|---|---|
| 1. Baseline | Full suite, 170 tests, 3 workers | 100 | 69 | 1 |
| 2. After the login-timeout fix | 69 failures, 3 workers | 25 | 44 | 0 |
| 3. Serial | 44 remaining, 1 worker | 18 | 24 | 2 |
| **4. Final full** | **Full suite, 181 tests (incl. 11 new), 3 workers** | **160** | **19** | **2** |
| 5. Serial re-check | Run 4's 19 failures | 7 | 14 | 1 |
| 6. Serial re-check | 11 remaining | 0 | 11 | 0 (all hit the login outage, ENV-1) |
| 7. Serial re-check, login restored (~10:36) | 10 unverified | 4 | 6 | 0 |

**Final status of the 181 tests:** 168 pass · 3 skipped with a stated reason · 4 fail by
design (confirmed-defect documentation: A13, CL04-1b, CL04-1c, CL05-2b) · **6 blocked by
server write latency** (A5, A8, A10, A11, E2, JOB04-2).

Run 7 root cause for the 6: every one of them creates a record first, and the server was taking
**over 30s to answer create requests**. Candidate creates (`POST /api/v1/candidate`) got no
response within 30s, yet the records appeared in the list 1–3 minutes later; job creates stayed
on `/create` past the 10s wait and landed later too. Before this re-run's last fix,
`ensureOnCandidateList`'s fallback `page.goto()` **aborted** the in-flight create (trace: status
-1), so candidates were silently never created and tests failed later with "row not found".
`createSyntheticCandidate` now waits for the create response (30s) and fails with its HTTP status.
Re-verify these 6 when saves return in a few seconds.

**Possible new app defect (JOB04-2, needs confirmation):** in one run where creation succeeded,
both toggle clicks on the synthetic job sent `PATCH /jobDescription/{id}/active/false`; the
second click, meant to re-activate it, sent "false" again. Seen once, under heavy load; re-check
before logging.

Per module, final full run (pass/fail): Advance Report 23/2 · Authentication 5/0 · Candidate
Add 2/0 · Candidate Archive 2/3 · Candidate Details 18/1 · Candidate List 22/9 · Candidate
Modify 1/0 · Dashboard 22/2 · Interview Schedule 20/1 · Job Management 19/1 · Navigation 12/0 ·
Performance 12/0. Advance Report 2, Candidate Archive 2 and Candidate Details 1 were fixed and
passed or skipped in run 5.

## 3. Root Causes and Fixes

| # | Root cause | Affected | Fix |
|---|---|---|---|
| 1 | Post-login Keycloak redirect takes up to ~8s under load; the 5s default timed out | 32 tests (run 1) | 20s on the post-login URL assertion (`login()` + 16 inline logins) |
| 2 | **Time-bound fixtures: Advance Report** defaults to the current Mon–Fri week; the seed row (Vannyda PICH) lives in 24–28 Aug | 12 specs | `ADVANCE_REPORT_SEED_WEEK` + `setAdvanceReportDateRange()` |
| 3 | **Time-bound fixtures: Interview Schedule** opens on the current month; fixtures live in Aug 2026 | 4 specs | `CALENDAR_SEED_MONTH` + `goToCalendarMonth()` |
| 4 | Interviews booked "today + 3 days" cross into next month (1 Oct), which the September view doesn't load | A10, D2 | `goToCalendarMonth(interviewDate)` |
| 5 | **Dashboard "This Week"** specs pinned last week's exact entries | DASH06-1/2/3, DASH07-1/3 | Week-agnostic rules (fields present, in-week, ascending), or skip when no entries; new `tests/helpers/date-helpers.ts` |
| 6 | **Shared data drift:** 2 real job descriptions (incl. "Intern JAVA") deleted outside the suite; Sopheak PHAL's status changed | 8 Job specs, CAND01-2 | Compare against the count on load (`readJobListRowCount()`); assert "a different status", not a specific one |
| 7 | App change: the Advance Report profile modal now embeds File Manager, Activities and Interviews (with Add Result) | RPT07-2 | Assert the full-profile sections (matches the story); write actions now reachable from the report flagged to PM |
| 8 | Summary Full Staff has no second page in any available range (synthetic rows archived) | RPT09-2 | Skip with reason |
| 9 | Archive-helper verification re-filled the same search text, so no request fired and it read stale rows | E2, A9, CAL05-3 cleanup | Clear, re-search, poll 15s |
| 10 | Table placeholder row / elFinder status read before load | job counts, CAND04-2, new list specs | Wait for real rows / the `Items:` title |
| 11 | `ensureOnCandidateList` reload re-does Keycloak SSO | A10, C1 | 20s heading wait |
| 12 | Two specs wrote screenshots to the repo root | A13, D2 | Write to `test-reports/evidence/` |

No assertion was weakened to hide a defect. Known-defect specs still assert the expected
behaviour and still fail (A13); the new ones (CL04-1b/c, CL05-2b) follow the same convention.

## 4. Defects and Risks

- **New (RMS-CANDLIST):** 7 defects, 2 Medium: the GPA and Priority sorts. See the Candidate List report.
- **ENV-1 (High, environment):** intermittent Keycloak `unauthorized_client: Standard flow is disabled for the client` (client `rms-angular`), then a full login outage from ~09:55 (logins stuck on `/welcome` for 30–54s). Possibly Keycloak brute-force protection on the automation account after several hundred logins in one day; needs DevOps confirmation.
- **ENV-2 (Medium):** the shared server slows markedly under 3 workers (Keycloak redirect up to 8s, dashboard panels 4–8s).
- **Carried forward, re-confirmed:** A13 archive search ignores last name; CAND01-2 status badge single colour.
- **Carried forward, not re-verifiable this week:** DASH06-2 duplicate interviewer badge (its entry has left the "This Week" window; the spec skips).
- **Previously known, now fixed:** A5, the PASSED status change (HTTP 400 in August); verified fixed by the 22 Sep session and passing again today.

## 5. Housekeeping

- **Orphaned synthetic candidates:** all of today's leftovers (9 after runs 1–2, about 20 after runs 3–7, plus `CANDIDATE E2 1790561629952`, which was restored during an investigation) were archived. The active list is back to **Total 35**. The one pre-existing synthetic row, `CAL05-3 1787544382116` from 24 Aug, was left as-is.
- **Synthetic job descriptions:** 4 remain (`QA Automation Job Test JOB04-2 …`: 3 from today, 1 from 15 Sep). They can only be permanently deleted (no archive), so they were left for the team to decide.
- `scripts/check-orphans.mjs` / `cleanup-orphans.mjs` still read `FAPA_*`; they need the `RMS_*` rename before they can be used.
- Recommendation: give the write-heavy suites their own `workers: 1` Playwright project. Almost every remaining red result is concurrency on the one shared list.
