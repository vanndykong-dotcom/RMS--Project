# Feature Spec — Manage Candidates (Candidate Details)

**Module:** Candidates > Candidate Details (Dashboard > Candidates > Candidate Details)
**Epic:** RMS-CAND — Manage Candidates
**Source:** Existing UI screenshot, ALLWEB RMS, August 2026 build

## Epic Description

As a recruiter or hiring coordinator, I need a single page that shows everything about one candidate — contact info, education, uploaded documents — and lets me act on their pipeline (log activity, schedule an interview, set a reminder, record a result) without switching screens. This epic covers the Candidate Details page: the header/status area, the profile info card, the education section, the embedded file manager, and the five header action buttons. It does not cover the underlying Add Activity, Set Interview, Set Reminder, Edit, or Interview Result forms/flows themselves — those are separate specs this page launches into.

## Data Model (as displayed)

**Header:** candidate salutation + full name + a system-generated candidate reference code (e.g. "CANDIDATE CAL05-3 1787544382116"), a status badge (e.g. "NEW REQUEST" — reuses the same status vocabulary as the Interview Schedule and Job Description modules), and the position applied for shown as a subtitle (e.g. "Software Testing Automation").

**Profile card:** avatar (initials on a colored circle when no photo is set), Gender, Date of Birth, Email, Telephone Line 1, Telephone Line 2, Year of Experience, Created By, Create at, Last Modify, Priority (e.g. "Normal"), and Description. Empty fields render as "--" or blank rather than being hidden.

**Education card:** one banner per school attended (e.g. "ITC (THE INSTITUTE OF TECHNOLOGY OF CAMBODIA)"), each with Major, Degree, GPA, Start Date, End Date underneath. Only one school entry is shown in the current example; whether multiple entries stack is to be confirmed.

**File manager card:** an embedded file browser scoped to this candidate's upload folder (path shown as `upload/candidate/{candidate_id}`), with a folder tree on the left (Places > upload > candidate > {id} > cv / profile) and a grid of folders/files on the right. A toolbar above offers navigation (back/forward/up/home/refresh), file operations (upload, download/save, cut/copy/paste, delete, rename, view info), display options (grid/list/detail view toggles), an in-panel search, and a help icon. A status bar shows the current path and item count/size (e.g. "Items: 2, Sum: 505 b").

## User Stories

### RMS-CAND-01: View candidate header and status
**As a** recruiter, **I want to** see the candidate's name, reference code, status, and applied-for position at the top of the page, **so that** I immediately know who I'm looking at and where they stand in the pipeline.

Acceptance criteria:
- Header shows salutation + full name + reference code as a single heading, with the status badge inline to its right.
- Status badge uses the same color/label vocabulary as elsewhere in the system (NEW REQUEST, IN PROGRESS, FOLLOWING UP, PASSED, etc.).
- Applied-for position renders as a subtitle directly under the name.

Estimate: 2 points. Priority: High.

### RMS-CAND-02: View candidate profile information
**As a** recruiter, **I want to** see the candidate's contact details, personal info, and audit metadata in one card, **so that** I have everything I need to reach out or evaluate them without opening another screen.

Acceptance criteria:
- Card displays Gender, Date of Birth, Email, Telephone Line 1, Telephone Line 2, Year of Experience, Priority, and Description.
- Card displays audit fields Created By, Create at, and Last Modify, each with a timestamp in `DD/Aug/YYYY hh:mm AM/PM` format.
- Missing values display as "--" (phone) or blank (description) consistently rather than mixing conventions.
- Avatar shows a photo if one is uploaded, otherwise initials on a colored placeholder circle.

Estimate: 3 points. Priority: High.

### RMS-CAND-03: View candidate education history
**As a** recruiter, **I want to** see a candidate's school, major, degree, and GPA, **so that** I can assess academic fit at a glance.

Acceptance criteria:
- Each school attended renders as its own banner block with Major, Degree, GPA, Start Date, and End Date beneath it.
- Multiple education entries (if the candidate attended more than one institution) stack vertically — needs confirmation from a multi-entry example, since the current screenshot only shows one.
- Missing values (Degree, Start/End Date in the example) render as "--".

Estimate: 3 points. Priority: Medium. Open question: layout and ordering when a candidate has multiple education entries.

### RMS-CAND-04: Browse and manage candidate files
**As a** recruiter, **I want to** browse, upload, download, rename, and delete files tied to this candidate (CV, profile photo, etc.), **so that** all their documents stay organized under one record.

Acceptance criteria:
- File manager is scoped to `upload/candidate/{candidate_id}` and cannot navigate above the candidate's own folder (or, if it can, that access boundary needs confirming with security/PM).
- Folder tree shows the candidate's subfolders (e.g. cv, profile); selecting a folder updates the file grid on the right.
- Toolbar supports at minimum: upload, download, delete, rename, and view/preview of a selected file, plus grid/list view toggles and in-panel search.
- Status bar reflects the current path and shows item count and total size for the selected folder.
- Deleting a file requires a confirmation step (not confirmed as present in the current UI — flag for review, since irreversible delete without confirmation is a data-loss risk).

Estimate: 8 points (embedding and scoping a full file manager is substantial). Priority: Medium. Open question: what file types/size limits are enforced on upload; whether delete has a confirmation step.

### RMS-CAND-05: Log an activity against the candidate
**As a** recruiter, **I want to** record an activity or note on this candidate's timeline, **so that** the team has a shared history of what's happened with them.

Acceptance criteria:
- "Add activity" button in the header opens the activity logging flow (separate spec — out of scope here).
- Newly logged activity should be reflected somewhere on this page or a linked Activity view (exact placement to be confirmed — not visible in the current screenshot).

Estimate: 2 points (button/entry point only). Priority: Medium. Dependency: Add Activity form spec.

### RMS-CAND-06: Schedule an interview for the candidate
**As a** recruiter, **I want to** set up an interview directly from the candidate's page, **so that** I don't have to re-enter their details on the Interview Schedule screen.

Acceptance criteria:
- "Set interview" button opens the interview creation flow pre-filled with this candidate's identity and applied-for position.
- On save, the new interview should appear on the Interview Schedule calendar (see RMS-CAL epic) and be reflected in this candidate's status if applicable.

Estimate: 2 points (button/entry point only). Priority: High. Dependency: Set Interview form spec, RMS-CAL epic.

### RMS-CAND-07: Set a reminder for the candidate
**As a** recruiter, **I want to** create a reminder tied to this candidate, **so that** I don't forget a follow-up action.

Acceptance criteria:
- "Set reminder" button opens the reminder creation flow, pre-associated with this candidate.
- Reminder should surface in the system's Reminder module (left nav) at the appropriate time.

Estimate: 2 points (button/entry point only). Priority: Medium. Dependency: Set Reminder form spec.

### RMS-CAND-08: Edit candidate details
**As a** recruiter, **I want to** edit a candidate's profile and education info, **so that** I can correct or update their record as I learn more.

Acceptance criteria:
- "Edit" button opens an editable form pre-filled with the current profile and education data shown on this page.
- Saving updates Last Modify to the current timestamp and refreshes the page's display without a full reload.

Estimate: 3 points (button/entry point only; excludes the edit form itself). Priority: High. Dependency: candidate edit form spec.

### RMS-CAND-09: Record an interview result
**As a** hiring manager, **I want to** enter or view the candidate's interview result from their detail page, **so that** the pipeline status stays current without navigating elsewhere.

Acceptance criteria:
- "Interview result" is the primary (filled) action button in the header, visually distinct from the other four secondary actions.
- Clicking it opens the interview result entry/view flow (separate spec — out of scope here).
- Recording a result should update the candidate's status badge shown in RMS-CAND-01.

Estimate: 2 points (button/entry point only). Priority: High. Dependency: Interview Result form spec.

### RMS-CAND-10: Breadcrumb navigation
**As a** user, **I want to** see where this page sits in the app hierarchy, **so that** I can navigate back to the Candidates list or Dashboard easily.

Acceptance criteria:
- Breadcrumb reads "Dashboard > Candidates > Candidate Details" and each segment before the current page links back to that screen.

Estimate: 1 point. Priority: Low.

## Out of Scope (this epic)

The Add Activity, Set Interview, Set Reminder, Edit, and Interview Result forms/flows themselves; how education entries are added/edited; file upload validation rules (type/size limits); and any activity timeline or history view are all separate specs and not covered here.

## Open Questions for Refinement

Whether the file manager should allow navigation outside the candidate's own upload folder needs a security/PM decision. Layout for multiple education entries needs a multi-entry example or design confirmation. Whether file delete has (or needs) a confirmation step should be resolved before RMS-CAND-04 is built, to avoid accidental data loss. Where logged activities are displayed after being added (this page vs. a separate Activity view) needs to be confirmed before RMS-CAND-05 can be fully spec'd.

---
*Feature spec derived from the current Manage Candidates / Candidate Details screen, ALLWEB RMS. Prepared for sprint backlog refinement — Paris Partners Softwares.*
