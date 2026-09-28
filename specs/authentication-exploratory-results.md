# Authentication — Exploratory Test Execution Results (2026-09-15)

## Summary

Unlike the other modules' exploratory passes, this one did not start as a dedicated manual
walkthrough of `tests/authentication/*.spec.ts`. It surfaced as a side effect of re-running the
**entire** suite three times in a row (full parallel, CI-equivalent serial `--workers=1`, and full
parallel again) to verify that an unrelated repo file-reorganization and an env-var rename
(`FAPA_EMAIL`/`FAPA_PASSWORD` → `RMS_EMAIL`/`RMS_PASSWORD`, kept consistent across
`playwright.config.js`, every spec, `tests/helpers/candidate-helpers.ts`, and
`.github/workflows/playwright.yml`) hadn't broken anything. Every one of those three runs showed a
large, oddly browser-skewed pass/fail swing that didn't fit either change, since neither touched
test logic or selectors:

| Run | Concurrency | Passed | Failed | Skipped | Duration |
|---|---|---|---|---|---|
| 1 | Default (3 workers × 3 browser projects) | 247 | 173 | 3 | 21.7m |
| 2 | `--workers=1` (matches `.github/workflows/playwright.yml`) | 261 | 159 | 3 | 1.1h |
| 3 | Default (3 workers × 3 browser projects) | 211 | 189 | 3 (+20 did not run) | 23.9m |

Failures by browser project (out of 141 tests per project) were consistent across all three runs:

| Run | Chromium failed | Firefox failed | WebKit failed |
|---|---|---|---|
| 1 | 40 | 42 | 91 |
| 2 | 42 | 43 | 74 |
| 3 | 46 | 53 | 90 |

WebKit fails 1.5-2x more often than the other two engines in every run, and reducing concurrency
to CI's own `--workers=1` (removing any load the reorg's local runs might have added) barely moved
the numbers — ruling out "our own test concurrency" as the explanation.

## Root-cause investigation

The initial assumption — plain server slowness under load — didn't hold up once the actual error
text (not just "timeout") was inspected. The dominant WebKit failure, from
`tests/helpers/candidate-helpers.ts:10` (the shared `login()` helper's own
`await expect(page).toHaveURL(/\/admin\/dashboard/)`), is:

```
Error: expect(page).toHaveURL(expected) failed
Expected pattern: /\/admin\/dashboard/
Received string:  "https://rms-dev.allweb.com.kh/welcome?error=unauthorized_client&error_description=
  Client%20is%20not%20allowed%20to%20initiate%20browser%20login%20with%20given%20response_type.
  %20Standard%20flow%20is%20disabled%20for%20the%20client.
  &iss=https:%2F%2Frms-dev.allweb.com.kh:8070%2Frealms%2Faw_recruitment"
```

Counting only *unique failing tests* whose failure block contains this exact error (not raw line
occurrences, which double-count Playwright's repeated call-log entries):

| Run | Chromium | Firefox | WebKit |
|---|---|---|---|
| 1 | 1 | 1 | 66 |
| 2 | 0 | 1 | 49 |
| 3 | 2 | 3 | 68 |

This one Keycloak error accounts for **66-76% of every WebKit run's total failures**, and almost
none of Chromium's or Firefox's. That skew is the actual explanation for the browser-level pass
count differences above — not generic flakiness.

**This is not a new class of defect.** `tests/helpers/candidate-helpers.ts` (see the docstring
above `goToJobDescriptions`) and `specs/job-management-exploratory-results.md` (Insight #1) already
document this exact Keycloak error, previously observed only as a **page reload on an
already-authenticated protected route** re-triggering the app's Keycloak silent-SSO check, which
this client isn't configured for. What's new here is that the identical error also fires on a
**fresh, first-time login** (a brand-new browser context that has never had a session) — and it
does so overwhelmingly under WebKit specifically.

**Working theory:** Keycloak JS adapters commonly perform a hidden-iframe "silent check-sso"
against the Keycloak realm on page load, before the user even submits credentials, to detect an
existing SSO session. WebKit enforces Intelligent Tracking Prevention (ITP) by default, which
partitions/blocks third-party storage access from cross-origin iframes — Chromium and Firefox do
not restrict this the same way out of the box. When that silent iframe check can't read session
storage under WebKit's ITP, the app's Keycloak client appears to fall back to constructing the
login redirect with a `response_type` this Keycloak client isn't configured to allow ("Standard
Flow" only), and Keycloak rejects it outright with `unauthorized_client` — regardless of whether
the credentials that follow would otherwise have been valid.

See the formal write-up (with reproduction steps, evidence, and a suggested fix) in
[`test-reports/authentication-test-report.md`](../test-reports/authentication-test-report.md),
Defects Log entry **AUTH-D1**.

## Safety confirmation

No new manual actions were taken against the app for this investigation — every data point above
came from re-running the suite's own existing, already-reviewed `tests/**/*.spec.ts` files (no new
scripts, no new synthetic records, no writes beyond what those specs already do). No credentials or
other secret values are reproduced in this document or in `authentication-test-report.md`.
