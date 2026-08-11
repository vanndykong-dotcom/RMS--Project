# User Story: Manage Candidates

**Epic:** Candidate Management
**Feature:** Candidate List View
**Breadcrumb:** Dashboard > Candidates > List Candidates

## User Story

As a **recruiter / HR user**, I want to **view, search, filter, and manage a list of all candidates** so that I can **track their application status, review key details, and take actions (archive, delete) without leaving the candidates list**.

## Description

The Manage Candidates page displays a paginated table of all candidates in the system. Each row summarizes a candidate's core profile (photo, name, gender, age, phone, university, GPA, experience, priority, status, interview) and provides quick actions to view details or manage the record. Users can search, and filter.

## UI Components

- Page header: "Manage Candidates" with subtitle "List all candidate"
- Primary actions (top right): **Archive** button (bulk archive)
- Row-level **Action** column with:
  - Eye icon → View candidate details
  - Overflow (⋮) menu → **Delete**

## Acceptance Criteria

1. **Given** I navigate to Dashboard > Candidates > List Candidates, **when** the page loads, **then** I see a table listing all candidates with columns: No., Photo, Full Name, Gender, Age, Phone, University, GPA, Experience, Priority, Status, Interview, and Created.
2. **Given** I select one or more candidates and click **Archive**, **when** the action is confirmed, **then** the selected candidates are moved out of the active list.
3. **Given** a candidate row, **when** I click the eye icon, **then** I am taken to that candidate's detail view.
4. **Given** a candidate row, **when** I open the ⋮ action menu, **then** I see **Restore** and **Delete** options.
5. **Given** the ⋮ action menu, **when** I click **Delete**, **then** I am asked to confirm before the candidate record is permanently removed.
6. **Given** the candidate list has more results than fit on one page, **when** I use the pagination control, **then** I can navigate between pages without losing my active search/filter state.
7. **Given** a candidate's Status badge (e.g. "NEW REQUEST"), **when** I click its dropdown, **then** I can change the status directly from the list view.

## Notes / Open Questions

- Confirm whether **Archive** (top-right button) applies to a bulk multi-select or requires row selection first — no checkboxes are visible in the current screenshot.
- Confirm whether **Delete** is a soft delete (recoverable via Restore) or a hard delete, since both Delete and Restore appear in the same action menu.
- "Experience" and "Interview" columns currently show "N/A" for all rows — confirm data source/mapping for these fields.
- Confirm sortable columns (arrows appear next to Full Name, GPA, Priority, Created).

## Definition of Done

- [ ] Table renders all specified columns with correct data bindings
- [ ] Search and Filter both work independently and together
- [ ] Add, Archive, and Delete actions function as specified with appropriate confirmations
- [ ] Pagination works and preserves search/filter state
- [ ] Status can be updated inline from the dropdown
- [ ] Page is responsive and matches design at standard breakpoints
- [ ] QA sign-off on all acceptance criteria above
