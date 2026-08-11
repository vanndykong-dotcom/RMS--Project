# Candidate Management Test Plan

## Application Overview

Application under test: ALLWEB Recruitment Management System (RMS) Candidate module at https://rms-dev.allweb.com.kh/admin/candidate (real, production-like data — 27 candidates seeded at time of planning, spanning 2 pages). Login via Keycloak-backed /welcome page using FAPA_EMAIL/FAPA_PASSWORD from .env, then click 'Candidate' in the left sidebar tree.

This plan covers all 10 acceptance criteria of the "Manage Candidates" user story (user-stories/scrum_2.md), refined against QAE2EpromptFile_1.md's Scenario Groups A-E using live exploration findings from 2026-08-06:

- The table search box (placeholder "Search") filters across name/phone/university/GPA/status; confirmed searching "Van" correctly narrows 27 candidates down to the 3 baseline candidates (Sovan NI, Vanndy VK, Vannyda PICH).
- The Filter dropdown has two tabs (INTERVIEW / REMINDER) plus a Status radiogroup with options: ALL, ATTENDED, CANCELED, FAILED, FOLLOWING UP, IN PROGRESS, MISSED, NEW REQUEST, PASSED, WAIT FOR FEEDBACK - a larger set than the 2 statuses (NEW REQUEST, PASSED) visible in the story's screenshot. A "Reset" link clears the filter.
- Sortable columns confirmed via a clickable header button with a direction arrow: Full Name, gpa, priority, created (each independently toggleable).
- The row "more_vert" (⋮) action menu confirmed to contain exactly: Modify, Set Reminder, Set Interview, Add Activity Log, Add interview result, Add to archive.
- CONFIRMED BUSINESS RULE (resolves the story's open question): "Add interview result" is disabled only when NO interview has been set (Interview = N/A) for that candidate. It becomes enabled immediately once "Set Interview" has been used, regardless of whether the interview date is in the future or past - verified against a candidate with a future-dated interview (Sopheak PHAL, 06/Aug/2026, later the same day as this exploration) and a past-dated one (Vanndy VK, 05/Aug/2026), both showing it enabled, versus Sovan NI (Interview = N/A) showing it disabled.
- The "+ Add" button opens a 5-step wizard at /admin/candidate/add: "1. Information", "2. Education", "3. Experience", "4. Upload CV", "5. Preview" - NOT a single-page form as the story implied. Step 1 "Information" fields: Profile photo (Clear/Upload), Salutation* (dropdown), First name*, Last name*, Date of Birth* (date picker), Gender* (radio Male/Female, defaults Male), Phone numbers* (with "Add more" to add additional numbers), Email*, Priority* (dropdown, defaults "Normal"), Status* (dropdown, defaults "NEW REQUEST"), "Send to candidate email" (checkbox), Description (textarea, 255 char limit with live counter), Cancel/Next buttons. University/GPA/Experience fields are expected on later wizard steps (Education/Experience) - not yet explored, to be confirmed during execution.
- A pre-existing, unrelated console error was observed on every page: "Error initializing Firebase Messaging: FirebaseError: Installations: Missing App configuration value: projectId" - a push-notification config gap, not a Candidate-module defect; note but do not fail tests on it.

IMPORTANT - Real data safety: this environment holds real, production-like candidate records (27 seeded candidates observed, most NOT synthetic/test-labeled). Automated tests must default to READ-ONLY interactions for anything destructive (Add to archive, Modify-and-save, inline status change-and-save, Set Interview/Reminder-and-save) against real candidates - cancel out of any such dialog after verifying its structure/validation, unless the test is specifically targeting one of the candidates whose name or position tag already contains "QA Automation", "Software Testing Automation", or "Intern Automation Test" (e.g. Vanndy VK, Vannyda PICH, Chhan DONG, Vk KONG, Raksa CHANN, Chutima CHAN, Sopheak PHAL, Hong SAN), which are pre-established synthetic/automation-owned candidates safe for read-write exercises. Creating a brand-new candidate (B2) must use clearly synthetic data (e.g. name prefixed "QA Automation Test") so it can be identified and is a candidate for archiving afterward as cleanup, not left as clutter in the real list.

## Test Scenarios

### 1. A. Manage Candidates - List Page

**Seed:** `tests/seed-candidate.spec.ts`

#### 1.1. A1. Page loads with correct structure

**File:** `tests/candidate-list/page-structure.spec.ts`

**Steps:**
  1. Precondition: logged in and on the Manage Candidates page (via seed)
    - expect: Breadcrumb reads Dashboard > Candidates > List candidates
    - expect: Heading 'Manage Candidates' with subtext 'List all candidate' is visible
  2. Observe the top-right action buttons
    - expect: An 'Archive' button and an 'Add' button are visible top-right
  3. Observe the filter/search bar above the table
    - expect: A 'Filter' dropdown button is visible
    - expect: A table 'Search' textbox is visible above the table
  4. Observe the table column headers
    - expect: Columns appear in this order: No., Photo, Full Name, gender, age, phone, university, gpa, experience, priority, status, interview, created, action
  5. Observe the pagination area below the table
    - expect: Pagination controls (previous/page numbers/next) are visible
    - expect: A 'Total: N' count is shown and matches the known total candidate count

#### 1.2. A2. Search candidates by keyword

**File:** `tests/candidate-list/search-filters-list.spec.ts`

**Steps:**
  1. Type 'Van' into the table Search textbox
    - expect: The table filters down to only candidates whose name/phone/university/gpa/status contains 'Van' (Sovan NI, Vanndy VK, Vannyda PICH)
    - expect: The Total count updates to 3
  2. Clear the search box
    - expect: The full, unfiltered candidate list is restored with the original Total count
  3. Type a search term that matches nothing, e.g. 'zzzznotfound'
    - expect: An empty results state is shown (no rows), not an error, and Total updates to 0

#### 1.3. A3. Filter dropdown

**File:** `tests/candidate-list/filter-dropdown.spec.ts`

**Steps:**
  1. Click the 'Filter' button above the table
    - expect: A dropdown opens with INTERVIEW/REMINDER tabs and a Status radiogroup: ALL, ATTENDED, CANCELED, FAILED, FOLLOWING UP, IN PROGRESS, MISSED, NEW REQUEST, PASSED, WAIT FOR FEEDBACK
    - expect: A 'Reset' link/button is visible in the panel
  2. Select the 'NEW REQUEST' status radio option
    - expect: The table narrows to only candidates with status NEW REQUEST and the Total count updates accordingly
  3. Click 'Reset' in the filter panel
    - expect: The table returns to the full, unfiltered list

#### 1.4. A4. Column sorting

**File:** `tests/candidate-list/column-sorting.spec.ts`

**Steps:**
  1. Click the 'Full Name' column header sort button
    - expect: Rows reorder alphabetically by Full Name
  2. Click 'Full Name' again
    - expect: Row order reverses
  3. Click the 'gpa' column header sort button twice
    - expect: Rows reorder by GPA ascending then descending; document where 'N/A' values sort (first, last, or excluded)
  4. Click the 'priority' column header sort button twice
    - expect: Rows reorder by priority ascending then descending
  5. Click the 'created' column header sort button twice
    - expect: Rows reorder by created date ascending then descending

#### 1.5. A5. Inline status update (synthetic candidate only)

**File:** `tests/candidate-list/inline-status-update.spec.ts`

**Steps:**
  1. Search for a synthetic automation-owned candidate (e.g. 'Vannyda PICH') and click their status badge dropdown
    - expect: A dropdown of valid statuses appears as color-coded options
  2. Select a different status than the current one
    - expect: The badge updates immediately without a full page reload
  3. Reload the page and re-check the same candidate's status
    - expect: The new status persisted after reload (saved server-side)
  4. Set the status back to its original value to leave the synthetic record as found
    - expect: Status reverts to the original value

#### 1.6. A6. Pagination

**File:** `tests/candidate-list/pagination.spec.ts`

**Steps:**
  1. Confirm more than one page exists given the current Total (observed 27 candidates across 2 pages)
    - expect: Page controls show at least pages 1 and 2
  2. Click the next-page arrow
    - expect: Page 2 loads a different subset of rows; Total count is unchanged and reflects the full result set
  3. Click the previous-page arrow
    - expect: Returns to page 1 with the original first-page rows

#### 1.7. A7. View candidate (eye icon)

**File:** `tests/candidate-list/view-candidate.spec.ts`

**Steps:**
  1. Click the eye ('visibility') icon in the Action column for any candidate row
    - expect: A read-only candidate detail view opens (navigates to /admin/candidate/candidateDetail/{id}) showing full candidate information
    - expect: No edit controls are present on this view

#### 1.8. A8. Row action menu contents and Modify (synthetic candidate only)

**File:** `tests/candidate-list/row-menu-modify.spec.ts`

**Steps:**
  1. Click the ⋮ (more_vert) action menu button for any candidate row
    - expect: Menu shows exactly: Modify, Set Reminder, Set Interview, Add Activity Log, Add interview result, Add to archive
  2. On a synthetic automation-owned candidate, click 'Modify'
    - expect: An editable form opens pre-populated with the candidate's existing values
  3. Change one field (e.g. phone number) and save, then reload and reopen the candidate
    - expect: The change persists after reload
  4. Attempt to save an invalid value (e.g. malformed phone number)
    - expect: Inline validation error is shown; save is blocked, not a silent failure or crash

#### 1.9. A9. Row action menu - Set Reminder (synthetic candidate only)

**File:** `tests/candidate-list/row-menu-set-reminder.spec.ts`

**Steps:**
  1. Open the ⋮ menu for a synthetic automation-owned candidate and click 'Set Reminder'
    - expect: Reminder form opens accepting a date/time and message
  2. Fill in a future date/time and message, save
    - expect: Reminder saves successfully
  3. Navigate to the 'Reminder' section in the left sidebar
    - expect: The new reminder appears, correctly associated with the candidate

#### 1.10. A10. Row action menu - Set Interview (synthetic candidate only)

**File:** `tests/candidate-list/row-menu-set-interview.spec.ts`

**Steps:**
  1. Open the ⋮ menu for a synthetic automation-owned candidate whose Interview column is 'N/A' and click 'Set Interview'
    - expect: Interview scheduling form opens
  2. Fill in a future interview date/time and save
    - expect: The candidate's Interview column now shows the scheduled date/time instead of N/A
  3. Navigate to 'Interview Schedule' in the left sidebar
    - expect: The same interview appears there with matching date/time and candidate name
  4. Return to the candidate row and open the ⋮ menu again
    - expect: 'Add interview result' is now enabled (confirms the business rule found during planning: enabling depends only on an interview being set, not on the date passing)

#### 1.11. A11. Row action menu - Add Activity Log (synthetic candidate only)

**File:** `tests/candidate-list/row-menu-activity-log.spec.ts`

**Steps:**
  1. Open the ⋮ menu for a synthetic automation-owned candidate and click 'Add Activity Log'
    - expect: A free-text note form opens
  2. Enter a note referencing this automated test run and save
    - expect: Note saves successfully
  3. Navigate to the 'Activity' section in the left sidebar
    - expect: The note is visible with correct candidate association, timestamp, and author

#### 1.12. A12. Row action menu - Add interview result disabled/enabled state

**File:** `tests/candidate-list/row-menu-interview-result-state.spec.ts`

**Steps:**
  1. Open the ⋮ menu for a candidate with Interview = N/A (e.g. Sovan NI)
    - expect: 'Add interview result' menu item is disabled (greyed, not clickable)
  2. Open the ⋮ menu for a candidate with a scheduled interview, past or future (e.g. Vanndy VK - past, or Sopheak PHAL - future)
    - expect: 'Add interview result' is enabled for both, confirming it depends only on an interview being set, not on the date having passed

#### 1.13. A13. Row action menu - Add to archive (synthetic candidate only)

**File:** `tests/candidate-list/row-menu-archive.spec.ts`

**Steps:**
  1. Note the current Total count on the Manage Candidates page
    - expect: Total count recorded
  2. Open the ⋮ menu for a synthetic automation-owned candidate created specifically for cleanup (e.g. the B2 test-created candidate) and click 'Add to archive'
    - expect: A confirmation prompt appears since this is a destructive action
  3. Confirm the archive action
    - expect: The candidate is removed from the active list
    - expect: Total count decrements by 1
  4. Click the 'Archive' button top-right
    - expect: The archived candidate now appears in the Archive view with all data intact

#### 1.14. A14. Archive button navigates to archived list

**File:** `tests/candidate-list/archive-view-entry.spec.ts`

**Steps:**
  1. Click the 'Archive' button top-right of Manage Candidates
    - expect: Navigates to an Archived Candidates list, structurally similar to the main table, containing only archived records
  2. Look for a way back to the active list
    - expect: A breadcrumb or button returns to the active Manage Candidates list

### 2. B. Add Candidate

**Seed:** `tests/seed-candidate.spec.ts`

#### 2.1. B1. Add Candidate form validation

**File:** `tests/candidate-add/add-candidate-validation.spec.ts`

**Steps:**
  1. Click '+ Add', arriving at the 5-step wizard (1. Information, 2. Education, 3. Experience, 4. Upload CV, 5. Preview)
    - expect: Step 1 'Information' is shown with fields: Salutation*, First name*, Last name*, Date of Birth*, Gender*, Phone numbers*, Email*, Priority*, Status*, Description
  2. Click 'Next' with all required fields empty
    - expect: Inline validation errors are shown for each required field; the wizard does not advance to step 2
  3. Fill an invalid Email format and an invalid phone number, then click Next
    - expect: Format-specific inline errors are shown; wizard does not advance
  4. Click 'Cancel'
    - expect: Returns to the Manage Candidates list with no new record created (verify by checking the Total count is unchanged)

#### 2.2. B2. Successfully add a new synthetic candidate

**File:** `tests/candidate-add/add-candidate-success.spec.ts`

**Steps:**
  1. Click '+ Add' and fill Step 1 'Information' with valid synthetic data (First name/Last name prefixed 'QA Automation Test', valid phone, valid email, default Priority/Status), click Next
    - expect: Advances to Step 2 'Education'
  2. Fill any required Education fields (e.g. university, GPA) with valid synthetic data, click Next
    - expect: Advances to Step 3 'Experience'
  3. Fill or skip optional Experience fields per actual required-field behavior found during execution, click Next
    - expect: Advances to Step 4 'Upload CV'
  4. Skip file upload if optional, click Next
    - expect: Advances to Step 5 'Preview'
  5. Review the preview and submit
    - expect: Form submits successfully and returns to the Manage Candidates list
  6. Search for the new candidate by the synthetic name
    - expect: New candidate appears with all entered values, default Status 'NEW REQUEST', and a Created timestamp matching now
    - expect: Total count incremented by 1

### 3. C. Modify Candidate

**Seed:** `tests/seed-candidate.spec.ts`

#### 3.1. C1. Edit and persist candidate details across sessions (synthetic candidate only)

**File:** `tests/candidate-modify/edit-persist-session.spec.ts`

**Steps:**
  1. Use Modify (⋮ menu) on the B2 synthetic candidate to change multiple fields at once (e.g. university, GPA, priority)
    - expect: Form accepts and saves the changes
  2. Log out and log back in
    - expect: Session ends and a fresh login succeeds
  3. Re-open the same candidate
    - expect: All changed fields persisted correctly across the new session

### 4. D. Interview Schedule Module

**Seed:** `tests/seed-candidate.spec.ts`

#### 4.1. D1. Interview Schedule list reflects candidate interviews

**File:** `tests/interview-schedule/list-consistency.spec.ts`

**Steps:**
  1. Navigate to 'Interview Schedule' in the left sidebar
    - expect: Page loads at /admin/calendar with heading 'Manage Interview Schedule' and a calendar grid
  2. Cross-reference entries against candidates with a non-N/A Interview value in Manage Candidates (e.g. Vanndy VK 05/Aug/2026 10:40 PM, Sopheak PHAL 06/Aug/2026 04:42 PM)
    - expect: Each has a matching entry here with the same date/time and candidate name

#### 4.2. D2. Reschedule or cancel an interview reflects back on candidate record (synthetic candidate only)

**File:** `tests/interview-schedule/reschedule-cancel.spec.ts`

**Steps:**
  1. From Interview Schedule, open the interview entry created in A10 for the synthetic candidate and change its date/time
    - expect: Save succeeds
  2. Return to Manage Candidates and check the same candidate's Interview column
    - expect: Reflects the updated date/time
  3. Cancel the interview if a cancel action exists
    - expect: Candidate's Interview column reverts to N/A or shows a Cancelled state, consistently in both places

### 5. E. Archive Management

**Seed:** `tests/seed-candidate.spec.ts`

#### 5.1. E1. Archived candidate data integrity (synthetic candidate only)

**File:** `tests/candidate-archive/data-integrity.spec.ts`

**Steps:**
  1. Before archiving, record all visible field values for the B2 synthetic candidate
    - expect: Values recorded as baseline
  2. Archive the candidate (per A13) and open it in the Archive view
    - expect: All field values match exactly what was recorded before archiving
    - expect: Historical activity logs/reminders/interview records tied to the candidate remain accessible

#### 5.2. E2. Restore from archive

**File:** `tests/candidate-archive/restore.spec.ts`

**Steps:**
  1. In the Archive view, look for a restore/unarchive row action
    - expect: Document whether such an action exists
  2. If present, restore the archived synthetic candidate and check the main Manage Candidates list
    - expect: Candidate reappears in the active list with all original data intact and Total increments accordingly
  3. If absent, document as current one-way behavior
    - expect: Documented as current behavior, not treated as a defect without product confirmation
