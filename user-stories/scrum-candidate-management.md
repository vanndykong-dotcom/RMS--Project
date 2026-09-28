# Feature: Manage Candidates

**Module:** Candidate
**Screen:** Dashboard > Candidates > List Candidates
**Product:** ALLWEB RMS (Recruitment Management System)

## Epic

As a recruitment team, we need a centralized place to view, search, filter, and manage all job candidates so we can track them through the hiring pipeline from initial request to final decision.

## User Story

**As a** Super Admin / recruiter
**I want to** view a searchable, filterable list of all candidates with their key details and status
**So that** I can quickly find a candidate, review their profile summary, and take the next action in the hiring process (schedule an interview, log activity, update status, or archive them).

## Description

The "Manage Candidates" page displays a paginated table of all candidates submitted to the system. Each row summarizes a candidate's personal details, academic background, application priority, current pipeline status, and interview schedule, with row-level actions for managing that candidate's record.

## UI Components

- **Header:** Page title "Manage Candidates" with subtitle "List all candidate", and breadcrumb `Dashboard > Candidates > List candidates`.
- **Primary actions (top right):**
  - `Archive` button — navigates to the archived candidates list.
  - `+ Add` button — opens a form to create a new candidate record.
- **Filter bar:** `Filter` dropdown for narrowing the candidate list (e.g. by status, university, priority).
- **Search box:** Free-text search with placeholder "Search: Name, phone number, university, GPA, Status...", supporting lookups by name, phone number, university, GPA, or status.
- **Candidate table** with columns:
  - `NO.` — row index
  - `PHOTO` — candidate avatar/initials
  - `FULL NAME` (sortable) — candidate name with a secondary line showing their applied position/skill tag (e.g. "Software Testing Automation", "QA Automation")
  - `GENDER`
  - `AGE`
  - `PHONE`
  - `UNIVERSITY`
  - `GPA` (sortable)
  - `EXPERIENCE`
  - `PRIORITY` (sortable) — e.g. Normal
  - `STATUS` — inline dropdown badge (e.g. `NEW REQUEST`, `PASSED`) allowing status updates directly from the table
  - `INTERVIEW` — scheduled interview date/time, or `N/A` if not yet scheduled
  - `CREATED` (sortable) — record creation date/time
  - `ACTION` — row-level action menu
- **Pagination:** Page controls with total candidate count (e.g. "Total: 3").

## Row Actions Menu

Each candidate row exposes a quick-view (eye) icon and a "⋮" menu with:

- **Modify** — edit candidate details
- **Set Reminder** — create a follow-up reminder for this candidate
- **Set Interview** — schedule an interview
- **Add Activity Log** — record an activity/note on the candidate's history
- **Add Interview Result** — log the outcome of an interview (disabled until an interview has been set/completed)
- **Add to Archive** — move the candidate to the archived list

## Acceptance Criteria

1. Given I navigate to Candidate > List candidates, the table displays all non-archived candidates with photo, full name, gender, age, phone, university, GPA, experience, priority, status, interview date, and created date.
2. Given I type a search term (name, phone, university, or GPA) into the search box, the table filters to matching candidates only.
3. Given I click the `Filter` dropdown, I can narrow the list by additional criteria (e.g. status, priority).
4. Given I click a sortable column header (`FULL NAME`, `GPA`, `PRIORITY`, `CREATED`), the table re-sorts by that column.
5. Given I click the status badge dropdown on a row, I can change the candidate's status inline without leaving the page.
6. Given I click the `⋮` action menu on a row, I see Modify, Set Reminder, Set Interview, Add Activity Log, Add Interview Result, and Add to Archive options.
7. Given a candidate has no interview scheduled yet, "Add Interview Result" is disabled until "Set Interview" has been used.
8. Given I click `Add to Archive`, the candidate is removed from this list and appears in the `Archive` view instead.
9. Given I click `+ Add`, I am taken to a form to create a new candidate record.
10. Given the candidate list spans multiple pages, pagination controls let me navigate pages and show the total candidate count.

## Notes / Open Questions

- Confirm whether GPA of `1` (Miss. Vannyda PICH) is a valid/expected value or a data entry issue — GPA scale should be clarified (e.g. out of 4.0).
- Confirm whether `EXPERIENCE` being `N/A` for all listed candidates is expected or indicates the field is not yet being populated on candidate creation.
- Confirm access control: is inline status editing and archiving available to all roles, or restricted to Super Admin/specific permissions?
