# QA E2E Prompt File — ALLWEB RMS: Candidate Module

## Purpose

This file contains natural-language test prompts intended to be run one at a time by an AI browser-automation agent (e.g. Claude in Chrome) against the ALLWEB RMS web application. Each prompt is self-contained: give the agent the "Objective" and "Steps," and have it confirm the "Expected Result." Source of truth for the UI in Scenario Group A is the "Manage Candidates" screenshot; Scenario Groups B–E extrapolate from the left-navigation menu and row-action menu (Candidate, Interview Schedule, Add, Modify, Set Interview, Add to archive) and should be adjusted once those screens are confirmed.

## Preconditions (apply to all scenarios)

- Base URL: `<insert test/staging URL for ALLWEB RMS>`
- Login as a user with the **Super ADMIN** role (or note the role actually used).
- At least 3 seeded candidate records exist, matching (or similar to) this baseline data set:

| # | Full Name | Gender | Age | Phone | University | GPA | Status | Interview |
|---|---|---|---|---|---|---|---|---|
| 1 | Mr. Sovan NI | Male | 37 | 078 347 4565 | ITC (Institute of Technology of Cambodia) | 3.4 | NEW REQUEST | N/A |
| 2 | Mr. Vanndy VK (Software Testing Automation) | Male | 33 | 096 220 3500 | Norton University | N/A | PASSED | 05/Aug/2026 10:40 PM |
| 3 | Miss. Vannyda PICH (QA Automation) | Female | 34 | 096 220 3500 | RUPP (Royal University of Phnom Penh) | 1 | NEW REQUEST | 08/Jul/2026 02:15 PM |

- Browser at desktop resolution (≥1440px wide) so the full table is visible without horizontal scrolling.
- Note actual environment/test data differences and adjust expected values accordingly before treating a mismatch as a bug.

---

## Scenario Group A — Manage Candidates (List Page)

### A1. Page loads with correct structure

**Objective:** Verify the Manage Candidates list page renders correctly.

**Steps:**
1. Navigate to Dashboard, then click **Candidate** in the left sidebar.
2. Observe the breadcrumb, page title, and table.

**Expected Result:**
- Breadcrumb reads `Dashboard > Candidates > List candidates`.
- Page heading is "Manage Candidates" with subtext "List all candidate".
- An **Archive** button (red outline) and a **+ Add** button (solid blue) are visible top-right.
- A **Filter** dropdown button is visible above the table, with a search input (placeholder "Search: Name, phone number, university, GPA, Status...") also present in the top nav bar and a dedicated table search box on the right.
- Table columns appear in this order: No., Photo, Full Name, Gender, Age, Phone, University, GPA, Experience, Priority, Status, Interview, Created, Action.
- Pagination control and a "Total: N" count are shown below the table and match the number of rows displayed.

---

### A2. Search candidates by keyword

**Objective:** Verify the table search box filters candidates.

**Steps:**
1. On the Manage Candidates page, type `Van` into the search box on the right above the table.
2. Observe the filtered results.
3. Clear the search box.

**Expected Result:**
- Results filter down to candidates whose name, phone, university, GPA, or status contains "Van" (e.g. "Vanndy VK", "Vannyda PICH").
- The "Total" count updates to match the filtered row count.
- Clearing the search restores the full, unfiltered candidate list.

**Additional checks:**
- Repeat with a phone number substring, a university substring, a GPA value, and a status value (per the placeholder text) to confirm each field is actually searchable.
- Search with a term that matches nothing and confirm an empty state (not an error) is shown.

---

### A3. Filter dropdown

**Objective:** Verify the Filter control narrows the candidate list independently of the search box.

**Steps:**
1. Click the **Filter** button above the table.
2. Note which filter fields are offered (e.g. status, priority, university, gender, date range).
3. Apply one filter value and confirm.
4. Clear/reset the filter.

**Expected Result:**
- Filter panel/dropdown opens showing selectable criteria.
- Applying a filter reduces the table to only matching rows and updates the Total count.
- A clear/reset action returns the table to the full list.

---

### A4. Column sorting

**Objective:** Verify sortable columns (indicated by an arrow icon: Full Name, GPA, Priority, Created) reorder the table.

**Steps:**
1. Click the sort arrow next to **Full Name**; observe order. Click again to reverse.
2. Repeat for **GPA**.
3. Repeat for **Priority**.
4. Repeat for **Created**.

**Expected Result:**
- Each click toggles ascending/descending order for that column.
- Rows with "N/A" values sort predictably (confirm whether they sort first, last, or are excluded — flag if inconsistent).
- Sorting one column does not silently reset an active search or filter.

---

### A5. Inline status update

**Objective:** Verify the Status column dropdown (e.g. "NEW REQUEST", "PASSED") allows inline status changes.

**Steps:**
1. Click the status badge/dropdown for a candidate currently marked "NEW REQUEST".
2. Select a different status (e.g. "PASSED") from the dropdown options.
3. Reload the page.

**Expected Result:**
- A dropdown list of valid statuses appears (color-coded badges, e.g. orange for "NEW REQUEST", green for "PASSED").
- Selecting a new status updates the badge immediately without a full page reload.
- The change persists after reloading the page (confirms it was saved server-side, not just a UI state change).
- Confirm whether changing status triggers any side effect (e.g. enabling "Add interview result" in the row action menu — see A12).

---

### A6. Pagination

**Objective:** Verify pagination controls work when candidate count exceeds one page.

**Steps:**
1. If only one page exists (as in the baseline 3-row screenshot), seed or filter data so more than one page's worth of rows exist, OR document that this check requires additional seed data.
2. Click the next-page arrow (`>`) and previous-page arrow (`<`).
3. Click a specific page number if multiple are shown.

**Expected Result:**
- Navigating pages loads the correct subset of rows.
- The "Total" count reflects the full unpaginated result set, not just the current page.
- Previous arrow is disabled on page 1; next arrow is disabled on the last page.

---

### A7. View candidate (eye icon)

**Objective:** Verify the eye/view icon in the Action column opens a read-only candidate detail view.

**Steps:**
1. Click the eye icon in the Action column for any candidate row.

**Expected Result:**
- A detail view (modal or dedicated page) opens showing full candidate information (photo, contact info, university, GPA, experience, priority, status, interview info, activity/notes if any).
- No edit controls should allow changes from this pure "view" entry point (edits should go through "Modify").

---

### A8. Row action menu — Modify

**Objective:** Verify "Modify" opens an editable form pre-filled with the candidate's data.

**Steps:**
1. Click the three-dot (⋮) action menu for a candidate row.
2. Click **Modify**.
3. Change one or more fields (e.g. phone number, priority).
4. Save.
5. Reload the list and reopen the same candidate.

**Expected Result:**
- Menu shows: Modify, Set Reminder, Set Interview, Add Activity Log, Add interview result, Add to archive.
- Modify form is pre-populated with the candidate's existing values.
- Saving updates the row in the list immediately and the change persists after reload.
- Required-field and format validation (e.g. phone number format, GPA numeric range) is enforced — attempt an invalid value and confirm an inline error, not a silent failure or crash.

---

### A9. Row action menu — Set Reminder

**Objective:** Verify a reminder can be scheduled against a candidate.

**Steps:**
1. Open the ⋮ menu for a candidate and click **Set Reminder**.
2. Fill in a reminder date/time and note/message, then save.
3. Navigate to the **Reminder** section in the left sidebar.

**Expected Result:**
- Reminder form accepts a date/time and message.
- The new reminder appears in the Reminder list, correctly associated with the candidate.
- Attempting to set a reminder in the past is either blocked or flagged (confirm actual behavior).

---

### A10. Row action menu — Set Interview

**Objective:** Verify scheduling an interview from the candidate row updates both the candidate record and the Interview Schedule module.

**Steps:**
1. Open the ⋮ menu for the "NEW REQUEST" candidate (e.g. Mr. Sovan NI) and click **Set Interview**.
2. Fill in an interview date/time (and interviewer, location/method, if offered) and save.
3. Return to the Manage Candidates list.
4. Navigate to **Interview Schedule** in the left sidebar.

**Expected Result:**
- The candidate's **Interview** column in the list now shows the scheduled date/time (previously "N/A").
- The same interview appears as an entry in the Interview Schedule module (see Scenario Group D).
- Setting an interview for a date/time in the past is either blocked or flagged.

---

### A11. Row action menu — Add Activity Log

**Objective:** Verify free-text activity notes can be logged against a candidate.

**Steps:**
1. Open the ⋮ menu for a candidate and click **Add Activity Log**.
2. Enter a note and save.
3. Navigate to the **Activity** section in the left sidebar (and/or reopen the candidate's detail view).

**Expected Result:**
- The activity note saves successfully.
- The note is visible in both the candidate's own activity history and the global Activity list, with correct candidate association, timestamp, and author.

---

### A12. Row action menu — Add interview result (disabled state)

**Objective:** Verify "Add interview result" is disabled/greyed out until an interview has actually occurred, and confirm the exact enabling condition.

**Steps:**
1. Open the ⋮ menu for a candidate with **no** interview scheduled (Interview = "N/A"). Confirm "Add interview result" is disabled (greyed text, not clickable).
2. Open the ⋮ menu for a candidate **with** a scheduled interview (e.g. Mr. Vanndy VK, interview 05/Aug/2026). Confirm whether "Add interview result" is enabled here, or only becomes enabled after the interview date/time has passed.
3. If enabled, click it, fill in a result, and save.

**Expected Result:**
- The disabled state has a clear, discoverable reason (tooltip, help text, or documented business rule) rather than being unexplained.
- Once the correct condition is met, the option becomes clickable and saving a result updates the candidate's status/record appropriately.
- Attempting to force the action via URL/API directly (if accessible) while the precondition is unmet is rejected server-side, not just hidden in the UI.

---

### A13. Row action menu — Add to archive

**Objective:** Verify archiving a candidate removes it from the active list and places it in the Archive view.

**Steps:**
1. Note the current Total count on the Manage Candidates page.
2. Open the ⋮ menu for a candidate and click **Add to archive** (red text — likely a destructive/confirmable action).
3. Confirm any confirmation dialog that appears.
4. Observe the list.
5. Click the **Archive** button top-right.

**Expected Result:**
- A confirmation prompt appears before archiving (since the action is styled as destructive); cancelling it leaves the candidate untouched.
- Confirming removes the candidate from the active Manage Candidates list and decrements the Total count.
- The archived candidate now appears in the Archive view with all data intact (see Scenario Group E for restore behavior).

---

### A14. Archive button (bulk view entry point)

**Objective:** Verify the top-level **Archive** button opens the archived-candidates view.

**Steps:**
1. Click the **Archive** button (red outline, top-right of Manage Candidates).

**Expected Result:**
- Navigates to an "Archived Candidates" list, structurally similar to the main table, containing only archived records.
- Search/filter/sort controls (if present here) operate the same way as A2–A4.
- A way back to the active list (breadcrumb or button) is available.

---

## Scenario Group B — Add Candidate

### B1. Add Candidate form validation

**Objective:** Verify required-field and format validation on the Add Candidate form.

**Steps:**
1. On Manage Candidates, click **+ Add**.
2. Attempt to submit the form with all fields empty.
3. Fill in an invalid phone number and/or an out-of-range GPA (e.g. negative or above the max scale) and attempt to submit.

**Expected Result:**
- Submitting empty required fields shows inline validation errors and does not create a record.
- Invalid formats (phone, GPA range, email if present) are rejected with a clear message.
- No partial/corrupt record is created in the database on a failed submit (verify by refreshing the list).

---

### B2. Successfully add a new candidate

**Objective:** Verify a fully valid submission creates a new candidate visible in the list.

**Steps:**
1. Click **+ Add** and fill in all fields with valid data (full name, gender, age, phone, university, GPA, experience, priority).
2. Submit.
3. Search for the new candidate by name in the list.

**Expected Result:**
- Form submits successfully and returns to (or redirects to) the Manage Candidates list.
- New candidate appears in the table with all entered values displayed correctly, default Status (likely "NEW REQUEST"), and a Created timestamp matching "now."
- Total count increments by 1.

---

## Scenario Group C — Modify Candidate

### C1. Edit and persist candidate details

**Objective:** Confirm end-to-end edit persistence beyond the single-field check in A8.

**Steps:**
1. Use **Modify** (via ⋮ menu) on an existing candidate to change multiple fields at once (e.g. university, GPA, priority, and photo if supported).
2. Save.
3. Log out and log back in (or open in a new session) and re-check the record.

**Expected Result:**
- All changed fields persist correctly across sessions, not just within the current browser session.
- If a photo upload field exists, verify it accepts a valid image, rejects invalid file types/oversized files, and displays the updated photo thumbnail in the list.

---

## Scenario Group D — Interview Schedule Module

### D1. Interview Schedule list reflects candidate interviews

**Objective:** Verify the standalone Interview Schedule page (left sidebar) is consistent with interviews set from the Candidate module.

**Steps:**
1. Navigate to **Interview Schedule** in the left sidebar.
2. Cross-reference entries against interviews set in A10 and any seeded data (e.g. Mr. Vanndy VK — 05/Aug/2026 10:40 PM; Miss. Vannyda PICH — 08/Jul/2026 02:15 PM).

**Expected Result:**
- Every candidate with a non-"N/A" Interview value in Manage Candidates has a matching entry here with the same date/time and candidate name.
- The page supports at minimum viewing and likely filtering by date/status — document actual capabilities found.

---

### D2. Reschedule or cancel an interview

**Objective:** Verify interview modification from the Interview Schedule module (if supported) reflects back on the candidate record.

**Steps:**
1. From Interview Schedule, open an existing interview entry and change its date/time (or cancel it).
2. Save.
3. Return to Manage Candidates and check the same candidate's Interview column.

**Expected Result:**
- The updated/cancelled state is reflected consistently in both the Interview Schedule module and the candidate's row (e.g. Interview column updates or reverts to "N/A" on cancellation).

---

## Scenario Group E — Archive Management

### E1. Archived candidate data integrity

**Objective:** Verify no data is lost or altered when a candidate is archived (extends A13/A14).

**Steps:**
1. Before archiving, record all visible field values for a candidate.
2. Archive the candidate (A13).
3. Open the same candidate in the Archive view.

**Expected Result:**
- All field values match exactly what was recorded before archiving.
- Historical activity logs, reminders, and interview records tied to the candidate remain accessible from the archived view.

---

### E2. Restore from archive

**Objective:** Verify whether archived candidates can be restored to the active list.

**Steps:**
1. In the Archive view, look for a restore/unarchive action (e.g. via a row action menu, mirroring "Add to archive").
2. If present, restore a candidate and check the main Manage Candidates list.
3. If absent, document that archiving is currently a one-way action and flag it as a question for the product owner rather than assuming it's a bug.

**Expected Result:**
- If restore exists: the candidate reappears in the active list with all original data intact, and Total increments accordingly.
- If restore does not exist: confirmed and documented as current behavior, not treated as a defect without product confirmation.

---

## Notes / Assumptions

- Scenario Group A is derived directly from the provided "Manage Candidates" screenshot; field names, button labels, and menu items should match exactly. Re-verify wording (e.g. "Add interview result" vs. any renamed label) if the UI changes.
- Scenario Groups B–E are inferred from the sidebar navigation and the ⋮ row-action menu and have **not** been visually confirmed against real screens. Update field lists and expected results once those pages are inspected directly.
- Wherever "confirm actual behavior" appears, the agent running this prompt file should record what it observes as ground truth and flag any behavior that looks unintentional (e.g. no confirmation dialog on a destructive action) as a candidate defect rather than silently treating it as expected.
