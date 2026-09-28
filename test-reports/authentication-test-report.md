# Test Execution Report: Authentication & Session Handling

**User story:** none recorded — this module has no `user-stories/scrum_*.md` entry yet, unlike
Candidate/Job/Interview Schedule/Advance Report.
**Test plan:** none formal — `tests/authentication/*.spec.ts` (`empty-fields-login`,
`forgot-password-link`, `invalid-login`, `logout-session`, `valid-login`) predates a written test
plan for this module (gap noted under Recommendations).
**Exploratory results:** `specs/authentication-exploratory-results.md`
**Environment:** https://rms-dev.allweb.com.kh/welcome (Keycloak-backed SSO, realm
`aw_recruitment`), real, shared remote dev server
**Date:** 2026-09-15
**Browsers:** Chromium, Firefox, WebKit — 3 independent full-suite runs (423 tests each)

## 1. Executive Summary

| Metric | Value |
|---|---|
| Full-suite runs analyzed | 3 (default parallel; `--workers=1` CI-equivalent; default parallel again) |
| Genuine app defects found | 1 (AUTH-D1, below) |
| WebKit failures attributable to AUTH-D1 | 66-76% of that project's failures, every run |
| Chromium/Firefox failures attributable to AUTH-D1 | 0-3 tests per run (background noise level) |

**Overall status:** one confirmed, high-impact defect (AUTH-D1) that specifically breaks login
under WebKit. This is a pre-existing app/Keycloak-configuration issue, not something introduced by
recent repo or test changes — see `specs/authentication-exploratory-results.md` for the
investigation trail and cross-run numbers.

## 2. How this was found

This report did not originate from a dedicated manual exploratory pass. It surfaced while
re-running the full suite three times to verify that a repo file-reorganization and an
`FAPA_EMAIL`/`FAPA_PASSWORD` → `RMS_EMAIL`/`RMS_PASSWORD` env-var rename hadn't changed any
behavior. All three runs showed WebKit failing 1.5-2x more often than Chromium/Firefox; inspecting
the actual error text (rather than assuming generic timeouts) traced the majority of that gap to
one specific, reproducible Keycloak error. Full methodology and per-run numbers are in
`specs/authentication-exploratory-results.md`.

## 3. Defects Log

### AUTH-D1 — Keycloak silent-SSO check rejects WebKit's login flow with `unauthorized_client` (High)

- **Where:** `/welcome` (Keycloak-backed login page), any WebKit-based browser context — reproduces
  on both a **fresh, first-time login** (`tests/helpers/candidate-helpers.ts`'s shared `login()`,
  used by nearly every spec in the suite) and, per the pre-existing note in that same file, on a
  **page reload of an already-authenticated protected route**.
- **Steps to reproduce:**
  1. Open `https://rms-dev.allweb.com.kh/welcome` in a WebKit-based browser (e.g. Playwright's
     `webkit` project, or Safari).
  2. Enter valid credentials (from `.env`, `RMS_EMAIL`/`RMS_PASSWORD`) and click Login.
  3. Observe the redirect target.
- **Expected:** navigation lands on `/admin/dashboard` (as it reliably does on Chromium and
  Firefox with identical credentials and identical test code).
- **Actual:** frequently (66-76% of all WebKit test failures, across 3 independent full-suite
  runs) redirects instead to:
  ```
  /welcome?error=unauthorized_client&error_description=Client+is+not+allowed+to+initiate+browser
  +login+with+given+response_type.+Standard+flow+is+disabled+for+the+client.
  &iss=https://rms-dev.allweb.com.kh:8070/realms/aw_recruitment
  ```
  Login fails outright — this is a hard rejection from Keycloak, not a slow success.
- **Evidence:** captured directly from three independent full-suite run logs (raw redirect URL and
  Playwright's own `expect(page).toHaveURL` failure output above); no screenshot was taken since
  this is a URL/protocol-level failure, not a rendering one, and no live browser session was
  otherwise opened during this investigation. Per-run reproduction counts:

  | Run (concurrency) | WebKit tests hitting this error | WebKit total failures |
  |---|---|---|
  | 1 (default parallel) | 66 | 91 |
  | 2 (`--workers=1`, CI-equivalent) | 49 | 74 |
  | 3 (default parallel) | 68 | 90 |

  Chromium and Firefox combined hit this same error only 0-5 times total per run (background
  noise), out of 141 tests per browser per run.
- **Root cause (working theory, not yet confirmed against the app's Keycloak client config):**
  Keycloak JS adapters typically run a hidden-iframe "silent check-sso" against the Keycloak realm
  on page load to detect an existing SSO session before the login form is even used. WebKit's
  Intelligent Tracking Prevention (ITP) partitions/blocks third-party storage access from
  cross-origin iframes by default; Chromium and Firefox do not restrict this the same way out of
  the box. When the silent check can't read session storage under WebKit, the app's Keycloak
  client appears to fall back to a login flow / `response_type` that this Keycloak client only
  permits for its configured "Standard Flow" — and Keycloak rejects the mismatch outright.
- **Related:** this is the same underlying error already documented (for a different trigger —
  protected-route reload, not fresh login) in `tests/helpers/candidate-helpers.ts`'s
  `goToJobDescriptions` docstring and in `specs/job-management-exploratory-results.md` (Insight #1,
  2026-08-24). That prior finding was worked around on the test side by preferring in-app
  navigation over `page.goto()` on protected routes. This finding shows the same misconfiguration
  also blocks the very first login, which has no equivalent test-side workaround — the suite has no
  way to complete a WebKit login attempt when it hits this state.
- **Suggested fix:** on the Keycloak client (`aw_recruitment` realm), verify why the silent-SSO /
  check-login-iframe path picks a `response_type` outside the client's allowed "Standard Flow"
  when third-party iframe storage is unavailable — either enable the flow variant the fallback
  requests, or have the frontend's Keycloac adapter disable/skip the silent iframe check
  (`onLoad: 'check-sso'` → `'login-required'`, or `checkLoginIframe: false`) so a blocked iframe
  can't redirect the top-level page into an error state at all.

## 4. Impact on suite-wide results

Until AUTH-D1 is fixed app-side, the WebKit project's pass rate is **not a reliable signal** for
anything else in the suite — a large, variable share of its failures are this one login-layer issue
firing non-deterministically, not real behavior regressions in the features those tests target.
Chromium and Firefox results are unaffected and remain trustworthy as-is.

## 5. Recommendations

1. Fix AUTH-D1 at the Keycloak/app-config level (see Suggested fix above) — this is out of scope
   for the test suite to work around, since it blocks login itself.
2. Until fixed, treat WebKit failures suite-wide with this defect in mind: re-check whether a
   WebKit failure's error is `unauthorized_client` (this defect) before treating it as a feature
   regression.
3. Consider excluding the `webkit` project from routine local/CI runs (or moving it to a
   non-blocking/allowed-to-fail lane) until AUTH-D1 is resolved, so it stops masking real
   signal in the other 60-80% of that project's runs.
4. Separately, this module has no `user-stories/scrum_*.md` or `specs/authentication-test-plan.md`
   — unlike every other tested module. Worth backfilling for the same acceptance-criteria-driven
   coverage the other modules have, independent of this defect.
