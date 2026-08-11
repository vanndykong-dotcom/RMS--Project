# User Story: RMS

## Story Title
RMS (Recruitment Management System) designed to register candidates seeking employment. It manages interview schedules, test quiz outcomes, reports, and overall job management.

## Story Description
RMS (Recruitment Management System) designed to register candidates seeking employment. It manages interview schedules, test quiz outcomes, reports, and overall job management.


## Application URL
https://rms-dev.allweb.com.kh/welcome

## Test Credentials
Credentials are not stored in this file. Copy `.env.example` to a local `.env`
(gitignored, never committed) and set `FAPA_EMAIL` / `FAPA_PASSWORD` (and
`---` for report-generation tests) there. The automated
suite in `tests/fapa-test/` reads these same variables.


## Acceptance Criteria

### AC1: Authentication
- A user can log in with a valid email/password and is redirected to the Dashboard.
- Invalid credentials show an error and keep the user on the login page.
- Submitting the login form with empty fields shows inline "required" validation
  for both Email and Password.
- A "Forgot password?" link is available and navigates to a dedicated flow.
- Signing out ends the session; protected routes then redirect back to /login.

### AC2: Navigation
- The top navigation bar (Dashboard, Interview Schedule, Candidates, Demands, Report, Advance Report, Activities,Reminder, File Manager, Setting, Administration )
  reaches every section when clicked.
- Known gap: navigating directly to /markets (rather than clicking the nav
  button) does not resolve to the Markets section — only the nav button
  

### Error Handling
- Invalid login, empty required fields, and no-data report months all
  produce a visible, specific message rather than a silent failure or a
  broken page.
- Real-data safety: destructive/creating actions (Add Client, Add User, Add
  Currency, Import File, Edit ISIN row) must not be exercised for real by
  automated tests unless explicitly intended, since this environment holds
  real, production-like client and financial data.

## Business Rules
- Each of the 10 upload categories is scoped to a single calendar month per
  import; re-importing the same category/month appears to update that
  period's data (confirmed via repeated real imports in the Upload history).
- A generated report's PDF content must trace back to the most recently
  imported source data for that client/month — this is the basis of the
  content-validation tests.
- Once a report is marked "Validate PDF" / verified, that action is not
  undone by the UI observed so far (treat as a one-way state change in tests).
- The application manages real, production-like client and user data (not
  synthetic fixtures) even in the "develop" environment — automated tests
  must default to read-only interactions and cancel any create/edit dialog
  unless a test is specifically and deliberately exercising a real write.
- Report-generation tests are the one deliberate exception that writes real
  data (client creation, password reset, file import), and they do so
  against a dedicated synthetic client ("QA Automation Client") created
  specifically for this purpose - never against a real production-like
  client, including ones belonging to the account owner. The client's Excel
  name, email, and password are all synthetic/randomized, and all 10 Excel
  fixtures were updated so their embedded client-identifying columns
  (Client / Propriétaire / Souscripteur) reference this same synthetic name.

## Technical Notes
- Use Playwright for test automation.
- Test across Chrome, Firefox, and Safari browsers.
- Validate all form validation messages.
- Test navigation flow and back button behavior.

## Definition of Done
- [x] All acceptance criteria have test cases
- [x] Manual exploratory testing completed
- [x] Automated test scripts created and passing
- [x] Test results documented
- [x] Bugs logged for any failures
- [x] Code committed to repository