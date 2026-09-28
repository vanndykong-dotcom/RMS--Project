# Automation-RMS

Playwright end-to-end tests and QA documentation for **ALLWEB RMS** (Recruitment Management System), run against `https://rms-dev.allweb.com.kh`.

## Setup

```bash
npm ci
npx playwright install
cp .env.example .env   # then fill in RMS_EMAIL and RMS_PASSWORD
```

## Running tests

| Command | What it does |
|---|---|
| `npm test` | Full suite on Chromium, Firefox and WebKit |
| `npm run test:chromium` | Chromium only, read and write projects (recommended local check) |
| `npm run test:headed` / `npm run test:ui` | Watch the browser / Playwright UI mode |
| `npm run report` | Open the last HTML report |
| `npm run orphans:check` / `npm run orphans:cleanup` | Find or archive leftover test candidates on the dev server |

Each browser has two projects: `<browser>` runs the read-only specs in parallel, and `<browser>-writes` runs the specs that create, archive, modify or upload records, one at a time, because they all share one live candidate list. **If you add a spec that writes to the server, add it to `WRITE_SPECS` in `playwright.config.js`.**

CI runs on demand via **Actions → Playwright Tests** (`.github/workflows/playwright.yml`) and uses the `RMS_EMAIL` / `RMS_PASSWORD` repository secrets.

## Project layout

```
tests/                    Playwright specs, one folder per module
  <module>/*.spec.ts        e.g. candidate-list/, dashboard/, job-management/
  helpers/                  shared helpers (login, candidate create/cleanup)
  fixtures/                 upload files used by tests
  seed.spec.ts              seed files used by the Playwright planner/generator agents
  seed-candidate.spec.ts
user-stories/             source requirements
  scrum-<module>.md         one feature spec per module (epic RMS-*)
  backlog.md                consolidated backlog and QA coverage map
specs/                    test plans and exploratory results (see specs/README.md)
test-reports/             final reports per module
  <module>-test-report.md
  performance-report.md
  reruns/                   dated incremental re-run reports
  evidence/                 screenshots referenced by specs and reports
docs/                     process docs (e2e-workflow-guide.md)
scripts/                  one-off maintenance scripts for the dev server
.github/agents/           Playwright planner / generator / healer agent definitions
```

## Workflow per module

`user-stories/scrum-<module>.md` → `specs/<module>-test-plan.md` → exploratory pass (`specs/<module>-exploratory-results.md`) → `tests/<module>/` → `test-reports/<module>-test-report.md`.

Full details are in [docs/e2e-workflow-guide.md](docs/e2e-workflow-guide.md).

## Naming conventions

- Module slugs are kebab-case and the same everywhere, e.g. `interview-schedule` in `tests/`, `specs/`, `test-reports/` and `user-stories/`.
- Evidence screenshots are named `<test-id>-<description>.png`, prefixed with `defect-` when they show a bug.
- Generated output (`test-results/`, `playwright-report/`, `.playwright-mcp/`) is git-ignored. Don't commit it.
