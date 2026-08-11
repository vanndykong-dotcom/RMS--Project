# RMS Authentication and Navigation Test Plan

## Application Overview

Application under test: ALLWEB Recruitment Management System (RMS), a real, production-like system at https://rms-dev.allweb.com.kh/welcome (backed by a Keycloak/OIDC realm "aw_recruitment"). This plan covers exactly two acceptance criteria from the user story:

AC1 - Authentication: login page behavior (valid login, invalid credentials, empty-field validation, "Forgot password?" link, sign-out and post-logout protected-route redirect).
AC2 - Navigation: every top-level sidebar nav item (Dashboard, Interview Schedule, Candidates, Demands, Report, Advance Report, Activities, Reminder, File Manager, Setting, Administration) reaches its section via its nav button, plus a documented scenario for the known gap where navigating directly to the /markets URL does not resolve to a "Markets" section.

Exploration findings (2026-08-04) that testers/automation should be aware of:
- The login page uses fields labeled "Username" and "Password" (not "Email"), with a "Login" button. No "Forgot password?" link currently exists on the page - this is flagged as a gap to confirm, not assumed to exist.
- A valid login redirects to /admin/dashboard.
- Invalid credentials produce two inline alerts: "The username is wrong. Please try again" and "The password is wrong. Please try again", staying on /welcome.
- Submitting completely empty fields currently reproduces the SAME "wrong username/password" alerts rather than a distinct "required" message - this is a discrepancy versus the AC's "required" wording that should be confirmed with the product owner/dev team.
- The sidebar's actual item labels are singular ("Candidate", "Demand", "Activity") rather than the plural wording used in the user story ("Candidates", "Demands", "Activities"); both refer to the same nav items.
- "Setting" and "Administration" are expandable tree toggles (not direct pages themselves); clicking them expands a level-2 submenu (Setting: Migration, Company Profile, Interview Template, Job, Project, Email Configuration, Email Template, System Configuration, Candidate Status, University; Administration: User, Role, Group). A representative child of each was verified to navigate correctly.
- Logout is reached via the "Super ADMIN" account link in the top bar, which opens a menu containing "Logout". After logout the app lands on /welcome; visiting a protected route afterward (e.g. /admin/dashboard) redirects back to /welcome (sometimes carrying a Keycloak "unauthorized_client" error query string) rather than to a route literally named "/login" as the AC states - testers should confirm whether "/login" is an intended alias.
- Directly navigating to https://rms-dev.allweb.com.kh/markets (a route with no corresponding nav item at all) rewrites the URL to "/" and renders a blank page - it does NOT show any Markets content and does NOT auto-redirect on to the Dashboard the way a normal "/" visit does when logged in. This confirms the documented gap; it is not to be treated as a bug to fix, only verified/documented.

All test data (username/password) must be sourced from the project's .env file (keys FAPA_EMAIL and FAPA_PASSWORD) - never hardcode the real credential values inside test steps or committed artifacts. Every scenario in the Authentication suite assumes a fresh, logged-out starting state unless it is the logout scenario itself (which starts logged in). Every scenario in the Navigation suite assumes the user is already logged in.

## Test Scenarios

### 1. AC1 - Authentication

**Seed:** `tests/seed.spec.ts`

#### 1.1. Valid login redirects to Dashboard

**File:** `tests/authentication/valid-login.spec.ts`

**Steps:**
  1. Precondition: ensure a fresh, logged-out session by navigating to https://rms-dev.allweb.com.kh/welcome
    - expect: The login page renders with heading 'Welcome!' / 'Sign in your account', an empty Username textbox, an empty Password textbox, and a 'Login' button. No user is authenticated.
  2. Enter the valid username from the FAPA_EMAIL value in .env into the Username field
    - expect: The Username field displays the entered value.
  3. Enter the valid password from the FAPA_PASSWORD value in .env into the Password field
    - expect: The Password field displays the entered value masked.
  4. Click the 'Login' button
    - expect: The browser navigates away from /welcome to /admin/dashboard.
    - expect: A 'Dashboard' heading is visible along with 'Quick Access', 'Resource Demanding', and 'Top Candidates' widgets.
    - expect: The top bar shows a Search box, a notifications icon, and a 'Super ADMIN' account link, and the left sidebar shows the full navigation tree.

#### 1.2. Invalid credentials show error and keep user on login page

**File:** `tests/authentication/invalid-login.spec.ts`

**Steps:**
  1. Precondition: ensure a fresh, logged-out session by navigating to https://rms-dev.allweb.com.kh/welcome
    - expect: The login page is shown with empty Username and Password fields.
  2. Enter a non-existent username, e.g. 'invalid@example.com', into the Username field
    - expect: The Username field displays the entered value.
  3. Enter an incorrect password, e.g. 'wrongpassword', into the Password field
    - expect: The Password field displays the entered value masked.
  4. Click the 'Login' button
    - expect: The user remains on the /welcome login page; there is no redirect to /admin/dashboard.
    - expect: An inline alert 'The username is wrong. Please try again' is shown under the Username field.
    - expect: An inline alert 'The password is wrong. Please try again' is shown under the Password field.
    - expect: Both the Username and Password fields are marked invalid.

#### 1.3. Empty fields show inline required validation on submit

**File:** `tests/authentication/empty-fields-login.spec.ts`

**Steps:**
  1. Precondition: ensure a fresh, logged-out session by navigating to https://rms-dev.allweb.com.kh/welcome
    - expect: The login page is shown with empty Username and Password fields.
  2. Without typing anything into either field, click the 'Login' button
    - expect: The user remains on the /welcome login page; there is no redirect to /admin/dashboard.
    - expect: Both the Username and Password fields show an inline validation message.
    - expect: KNOWN DISCREPANCY TO CONFIRM: as observed on 2026-08-04, the app currently shows the same 'The username is wrong. Please try again' and 'The password is wrong. Please try again' alerts used for wrong credentials, rather than a distinct 'This field is required' message described in the user story. Testers should verify current behavior against the intended design and log a discrepancy if a dedicated required-field message is expected but missing.

#### 1.4. 'Forgot password?' link navigates to a dedicated recovery flow

**File:** `tests/authentication/forgot-password-link.spec.ts`

**Steps:**
  1. Precondition: ensure a fresh, logged-out session by navigating to https://rms-dev.allweb.com.kh/welcome
    - expect: The login page is shown with empty Username and Password fields and a 'Login' button.
  2. Visually inspect the login form area (near the Password field and Login button) for a 'Forgot password?' (or similarly labeled) link
    - expect: A 'Forgot password?' link/button is present on the login page.
    - expect: GAP TO CONFIRM: exploration on 2026-08-04 found NO such link anywhere on the current /welcome page (only Username field, Password field, and Login button exist). Testers/automation should re-check this on the latest build; if still absent, report it as a missing-feature gap rather than force a false pass.
  3. If the link is present, click the 'Forgot password?' link
    - expect: The user is navigated away from the login form to a dedicated password-recovery flow (e.g. a distinct page/modal requesting an email or username to begin a reset), clearly separate from the login page itself.

#### 1.5. Sign out ends session; protected route afterward redirects back to login

**File:** `tests/authentication/logout-session.spec.ts`

**Steps:**
  1. Precondition: start already logged in - navigate to https://rms-dev.allweb.com.kh/welcome, enter the valid credentials from .env (FAPA_EMAIL / FAPA_PASSWORD), and click 'Login'
    - expect: The user lands on /admin/dashboard and the Dashboard is displayed.
  2. Click the 'Super ADMIN' account link (with the account_circle icon) in the top-right of the navigation bar
    - expect: A menu opens containing a 'Logout' menu item.
  3. Click the 'Logout' menu item
    - expect: The session ends and the browser is redirected to the login page (observed URL: /welcome), showing empty Username/Password fields again.
  4. Attempt to navigate directly to a protected route, e.g. https://rms-dev.allweb.com.kh/admin/dashboard
    - expect: The Dashboard content is NOT shown.
    - expect: The app redirects back to the login page (observed at /welcome; in some cases the URL carries an SSO error query string such as 'error=unauthorized_client' from the underlying Keycloak/OIDC provider), and the login form is displayed again, confirming the session was fully ended.
    - expect: NOTE TO CONFIRM: the user story describes the redirect target as a route literally named '/login'; the observed route is '/welcome'. Testers should confirm with the team whether this naming difference is expected or should be treated as a discrepancy.

### 2. AC2 - Navigation

**Seed:** `tests/seed.spec.ts`

#### 2.1. Dashboard nav item reaches the Dashboard section

**File:** `tests/navigation/nav-dashboard.spec.ts`

**Steps:**
  1. Precondition: start already logged in as a valid user (see the Authentication suite's valid-login steps), currently on any admin page
    - expect: The left sidebar navigation tree is visible with items: Dashboard, Interview Schedule, Candidate, Demand, Report, Advance Report, Activity, Reminder, File Manager, Setting, Administration.
  2. Click the 'Dashboard' item in the left sidebar navigation tree
    - expect: The app navigates to /admin/dashboard.
    - expect: A 'Dashboard' heading and the Quick Access / Resource Demanding / Top Candidates widgets are displayed.

#### 2.2. Interview Schedule nav item reaches the calendar section

**File:** `tests/navigation/nav-interview-schedule.spec.ts`

**Steps:**
  1. Precondition: start already logged in as a valid user, currently on the Dashboard
    - expect: The left sidebar navigation tree is visible.
  2. Click the 'Interview Schedule' item in the left sidebar
    - expect: The app navigates to /admin/calendar.
    - expect: A 'Manage Interview Schedule' heading and a monthly calendar grid are displayed, with a breadcrumb 'Dashboard > Calendar > List calendar'.

#### 2.3. Candidates nav item reaches the Candidate section

**File:** `tests/navigation/nav-candidates.spec.ts`

**Steps:**
  1. Precondition: start already logged in as a valid user, currently on the Dashboard
    - expect: The left sidebar navigation tree is visible.
  2. Click the 'Candidate' item in the left sidebar (this is the UI's actual label for the 'Candidates' nav entry from the user story)
    - expect: The app navigates to /admin/candidate.
    - expect: The Candidate list/management section is displayed.

#### 2.4. Demands nav item reaches the Demand section

**File:** `tests/navigation/nav-demands.spec.ts`

**Steps:**
  1. Precondition: start already logged in as a valid user, currently on the Dashboard
    - expect: The left sidebar navigation tree is visible.
  2. Click the 'Demand' item in the left sidebar (this is the UI's actual label for the 'Demands' nav entry from the user story)
    - expect: The app navigates to /admin/demand.
    - expect: The Demand list/management section is displayed.

#### 2.5. Report nav item reaches the Report section

**File:** `tests/navigation/nav-report.spec.ts`

**Steps:**
  1. Precondition: start already logged in as a valid user, currently on the Dashboard
    - expect: The left sidebar navigation tree is visible.
  2. Click the 'Report' item in the left sidebar
    - expect: The app navigates to /admin/candidate/report.
    - expect: The Report section is displayed.

#### 2.6. Advance Report nav item reaches the Advance Report section

**File:** `tests/navigation/nav-advance-report.spec.ts`

**Steps:**
  1. Precondition: start already logged in as a valid user, currently on the Dashboard
    - expect: The left sidebar navigation tree is visible.
  2. Click the 'Advance Report' item in the left sidebar
    - expect: The app navigates to /admin/candidate/advance-report.
    - expect: The Advance Report section is displayed.

#### 2.7. Activities nav item reaches the Activity section

**File:** `tests/navigation/nav-activities.spec.ts`

**Steps:**
  1. Precondition: start already logged in as a valid user, currently on the Dashboard
    - expect: The left sidebar navigation tree is visible.
  2. Click the 'Activity' item in the left sidebar (this is the UI's actual label for the 'Activities' nav entry from the user story)
    - expect: The app navigates to /admin/activities.
    - expect: The Activity section is displayed.

#### 2.8. Reminder nav item reaches the Reminder section

**File:** `tests/navigation/nav-reminder.spec.ts`

**Steps:**
  1. Precondition: start already logged in as a valid user, currently on the Dashboard
    - expect: The left sidebar navigation tree is visible.
  2. Click the 'Reminder' item in the left sidebar
    - expect: The app navigates to /admin/reminders.
    - expect: The Reminder section is displayed.

#### 2.9. File Manager nav item reaches the File Manager section

**File:** `tests/navigation/nav-file-manager.spec.ts`

**Steps:**
  1. Precondition: start already logged in as a valid user, currently on the Dashboard
    - expect: The left sidebar navigation tree is visible.
  2. Click the 'File Manager' item in the left sidebar
    - expect: The app navigates to /admin/setting/file-manager.
    - expect: A 'Manage Advance File Manager' heading and a file browser view are displayed.

#### 2.10. Setting nav item expands its submenu and each child reaches the Setting section

**File:** `tests/navigation/nav-setting.spec.ts`

**Steps:**
  1. Precondition: start already logged in as a valid user, currently on the Dashboard
    - expect: The left sidebar navigation tree is visible.
  2. Click the 'Setting' item in the left sidebar
    - expect: 'Setting' is a toggle, not a direct page: the tree item expands in place (chevron changes from pointing right to pointing down) revealing level-2 child items: Migration, Company Profile, Interview Template, Job, Project, Email Configuration, Email Template, System Configuration, Candidate Status, University.
    - expect: The URL does not change when only the toggle is clicked.
  3. Click the 'Company Profile' child item under Setting (read-only check - do not submit any changes)
    - expect: The app navigates to /admin/setting/feature-company-profile.
    - expect: A 'Manage Company Profile' heading is displayed along with a breadcrumb 'Dashboard > Setting > Company profile', confirming the Setting section is reachable via its submenu.

#### 2.11. Administration nav item expands its submenu and each child reaches the Administration section

**File:** `tests/navigation/nav-administration.spec.ts`

**Steps:**
  1. Precondition: start already logged in as a valid user, currently on the Dashboard
    - expect: The left sidebar navigation tree is visible.
  2. Click the 'Administration' item in the left sidebar
    - expect: 'Administration' is a toggle, not a direct page: the tree item expands in place revealing level-2 child items: User, Role, Group.
    - expect: The URL does not change when only the toggle is clicked.
  3. Click the 'User' child item under Administration (read-only check - do not create/edit/delete any user)
    - expect: The app navigates to /admin/administration/users.
    - expect: The Administration/User management section is displayed, confirming the Administration section is reachable via its submenu.

#### 2.12. KNOWN GAP: direct navigation to the /markets URL does not resolve to a Markets section

**File:** `tests/navigation/nav-markets-direct-url-gap.spec.ts`

**Steps:**
  1. Precondition: start already logged in as a valid user, currently on the Dashboard. First confirm there is no 'Markets' item anywhere in the left sidebar navigation tree
    - expect: The sidebar only contains: Dashboard, Interview Schedule, Candidate, Demand, Report, Advance Report, Activity, Reminder, File Manager, Setting, Administration - no 'Markets' entry exists to click.
  2. While still logged in, type https://rms-dev.allweb.com.kh/markets directly into the browser address bar and navigate to it (do not click any nav button)
    - expect: Actual observed behavior (2026-08-04): the URL is rewritten by the app to the site root '/', and the rendered page is blank/empty.
    - expect: The page does NOT show any 'Markets' content (none exists), and it does NOT auto-redirect on to /admin/dashboard the way a normal, unprompted visit to '/' does for a logged-in user.
    - expect: This confirms the documented navigation gap: reaching a section by directly typing its URL does not behave the same as reaching it by clicking its sidebar nav button. Per instructions this is to be documented/verified only, not treated as a bug to fix.
  3. For contrast, while still logged in, navigate directly to https://rms-dev.allweb.com.kh/ (the bare root, not /markets)
    - expect: The root path correctly redirects to /admin/dashboard and the Dashboard is displayed, proving the blank-page behavior is specific to unrecognized paths like /markets rather than a general problem with direct root navigation.
