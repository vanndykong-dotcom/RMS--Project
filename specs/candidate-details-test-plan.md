# Candidate Details Test Plan

## Application Overview

Application under test: ALLWEB Recruitment Management System (RMS) Candidate Details page at `https://rms-dev.allweb.com.kh/admin/candidate/candidateDetail/{id}` (real, production-like data, August 2026 build, v3.16.0). This is a sub-page of the Candidate list — reached by logging in via `/welcome` (FAPA_EMAIL/FAPA_PASSWORD from `.env`, reuse `login()` from `tests/helpers/candidate-helpers.ts`), navigating to `/admin/candidate` via `goToCandidateList()`, then clicking the `visibility` (eye) icon in a candidate row's Action column — **not** the row's name text and **not** `more_vert`, which opens the row action menu instead. Heading structure on load: `h2.profile-header-name` (salutation + full name), `h4.sub-title` (applied-for position).

This plan covers all 10 user stories of the "Manage Candidates (Candidate Details)" epic (`user-stories/scrum_Candidate Details.md`, RMS-CAND-01..10), refined against live exploration findings from 2026-08-24 (Playwright MCP browser tools were confirmed unavailable this session too, consistent with every prior session of this workflow; all findings below come from small throwaway Node scripts run against the repo's own `playwright-core` dependency, targeting the live site, then fully deleted from the repo root and session scratch directory — nothing was left behind, and every write action below was performed only against `Raksa CHANN` / `Vk KONG` / `Sopheak PHAL`, pre-established synthetic/automation-owned candidates per `specs/candidate-management.md`):

- **Header structure confirmed, and the story's "reference code" resolved as a name-sanitization defect artifact, not a real field**: the heading is exactly `<h2 class="profile-header-name">{Salutation}. {Full Name}</h2>` immediately followed by `<div class="profile-header-status"><span class="{cssClass}">{STATUS TEXT}</span></div>`, then `<h4 class="sub-title">{Applied-For Position}</h4>` below. Two normal synthetic candidates ("Ms. Raksa CHANN", "Mr. Vk KONG") showed **no separate reference code anywhere in the DOM** — just salutation + name. A third candidate's header rendered as `"Ms. QaAutomationTest CANDIDATE CAL05-3 1787544382116"` — this is **not a distinct reference-code field**; it is that candidate's actual stored Last Name, mangled by the already-documented name-sanitization defect in `createSyntheticCandidate()` (see `tests/helpers/candidate-helpers.ts`: "a known name-sanitization defect... mutates casing/spacing on every save"). The story's screenshot example was almost certainly this same defect artifact, not a real system-generated reference code. Automation should assert the header as `{Salutation}. {Full Name}` only, and must not assume a reference code exists.
- **CONFIRMED DEFECT — status badge color/class is hardcoded and does not vary by status**: `.profile-header-status span` always renders `class="following"` with computed `background-color: rgb(253, 244, 219)` / `color: rgb(255, 153, 0)` (an orange/tan style) regardless of the candidate's actual status. Verified across **three different real status texts** on three different candidates: "FOLLOWING UP" (Raksa CHANN), "NEW REQUEST" (Vk KONG, and the sanitization-defect candidate), and "IN PROGRESS" (Sopheak PHAL) — all three rendered the identical class and identical computed color. This directly contradicts RMS-CAND-01's AC ("Status badge uses the same color/label vocabulary as elsewhere in the system") — the candidate list's own inline status dropdown does show distinct colors per status (per `specs/candidate-management.md`), but this page's badge does not. Flag as a genuine, reportable UI defect — automation should assert the *current* (single-color, single-class) behavior, not the AC's assumed per-status coloring.
- **Profile card fields and empty-value convention confirmed exactly**: `Gender`, `Date of Birth`, `Email`, `Telephone Line 1`, `Telephone Line 2`, `Year of Experience`, `Created By`, `Create at`, `Last Modify`, `Priority`, `Description` all render as `<span class="text-label">{label}</span><br><span class="text-value">{value}</span>` pairs. Empty-value convention resolved: an unset phone (`Telephone Line 2`) renders literally as `"--"`; an unset `Year of Experience` renders as a **truly empty** `<span class="text-value"></span>` (no "--", no placeholder) — confirming the AC's claimed "--" vs. blank split is real, and extending it: numeric/duration-ish fields blank out silently rather than showing "--". Audit timestamps confirmed in exactly `DD/Mon/YYYY hh:mm AM/PM` format (e.g. `22/Jun/2026 09:35 AM`), matching the AC.
- **Avatar confirmed both modes**: a candidate with an uploaded photo renders `<img class="avatar-button" src="blob:...">` (a real fetched image — confirmed for Raksa CHANN, though the actual photo file was a generic stock photo mismatched to the candidate's stated gender, a pre-existing data artifact, not a UI defect); a candidate with no photo renders `<div class="aw-avatar-title"><span>{INITIALS}</span></div>` inside a colored `aw-avatar-container aw-avatar-{success|danger|...}` circle (confirmed "VK" on a green/success circle for Vk KONG) — matching the AC exactly.
- **Education card structure confirmed, including a genuine label typo, and the multi-entry question resolved with moderate confidence**: renders inside an Angular Material `mat-tab-group`, **one tab per school** (tab label = school name, e.g. "AMERICAN UNIVERSITY OF PHNOM PENH (AUPP)"), with `Major`, a field literally labeled **"Degress"** (confirmed typo in the live app — should read "Degree"), `GPA`, `Start Date`, `End Date` underneath as the same `text-label`/`text-value` pairs used in the profile card. Missing values (`Degress`, `GPA` here) render as `"--"`; `Start Date`/`End Date` render blank (not "--") when unset — another instance of the mixed "--"/blank convention. Only single-entry candidates were available live, so the multi-entry stacking question is **not directly confirmed**, but the `mat-tab-group` markup strongly implies additional entries would render as **additional tabs**, not stacked banners as the story assumed — flagged as a design-inferred, not live-confirmed, resolution; a coverage gap for later automation/seeding.
- **File manager (elFinder) toolbar, tree, and status bar confirmed exactly**: toolbar buttons (by `title` attribute, in DOM order) are: Find files, Back, Forward, **Go to parent folder**, New folder, New file, Upload files, Open, Download, Undo, Redo, Get info, Preview, Copy, Cut, Paste, **Delete**, Duplicate, **Rename**, Edit file, Select all, Select none, Invert selection, List view, Sort, About this software — a superset of the AC's "at minimum" list. Folder tree confirmed: `Places > upload > candidate > {id} > cv, profile`. Status bar confirmed format: `"Items: {n}, Sum: {size}"` (e.g. `"Items: 2, Sum: 517 KB"`), and the current-path breadcrumb below the toolbar reads `upload / candidate / {id}`.
- **CONFIRMED SECURITY DEFECT — folder scope is not actually enforced (resolves the story's open security question, in the negative)**: "Go to parent folder" carries a CSS `ui-state-disabled` class and computed `pointer-events: none` while inside a candidate's own folder — but clicking it (with a **normal, non-forced** Playwright click, which succeeded without any `force: true` override) still navigated up to the shared `upload/candidate` directory, revealing **63 items / 26.47 MB across all candidates' folders** — i.e. the "disabled" state is purely a CSS/visual hint, not a real access-control boundary, and any user can click through it to browse every other candidate's files. This is a genuine security finding worth escalating, not just a UI nit. Reloading the page was confirmed to safely reset the view back to the candidate's own scoped folder (`Items: 2, Sum: 517 KB`) with no data changed — the safe recovery step used during this exploration.
- **CONFIRMED — file delete requires a confirmation dialog (resolves the story's other open question)**: selecting a file and clicking "Delete" opens a dialog titled **"Delete"** showing the file's icon/name/size/modified date and the text **"Are you sure you want to permanently remove items? This cannot be undone!"**, with **"Remove"** and **"Cancel"** buttons. Verified end-to-end on two throwaway `.txt` files uploaded by this exploration itself (via `input[type="file"].setInputFiles()` — the toolbar's "Upload files" button opens a drag-and-drop dialog, not a native file-chooser event, so automation must target the underlying `<input type="file">` directly, not `page.waitForEvent('filechooser')`): each was uploaded (status bar item count incremented), its exact server-returned filename was verified to contain the exploration's own marker string before deletion, "Delete" → "Remove" was clicked, and the status bar returned to the original `Items: 2, Sum: 517 KB` afterward with no other files touched.
- **Header action buttons confirmed exactly — 3 are full-page navigations, 2 are in-place dialogs (none are simple modals-only as the story's grouping might suggest)**: "Add activity" → full-page nav to `/admin/activities/update?candidateId={id}`, heading "Manage Activity" (sections "Activity information", "Associate information"); "Set interview" → **in-place dialog** (URL unchanged), titled "Set Interview", fields `Candidate*` (pre-filled with the candidate's name), `Interviewers*`, `Date & time*`, "Send invitation mail to candidate" checkbox, "Reminder Me" + minutes-in-advance, `Apply for*` (pre-filled with the candidate's applied position — confirms RMS-CAND-06's AC), `Description` (200-char limit), Cancel/Save; "Set reminder" → full-page nav to `/admin/reminders/add/{id}/SPECIAL`, heading "Manage Create reminder"; "Edit" → full-page nav to `/admin/candidate/editCandidate/{id}`, heading "Update Information"; "Interview result" → **in-place dialog** titled with the **candidate's own name** (not "Interview Result"), showing Apply for/Date & Time/Interviewers/Description plus an "Interview Result" section (Quiz*, Coding*, Average, English*, Logical*, Flexibility*, Oral question*, Description, Cancel/Update). All five were opened and cleanly cancelled without submitting, per task safety instructions; none of the underlying candidate data changed. Note the action buttons themselves are **not** semantic `<button>`/`<a>` elements with an accessible name (`getByRole('button', { name: ... })` times out) — they are plain `div.sub-navigation` elements inside `app-aw-navigation`; automation must target `.sub-navigation` filtered by its text, not by role.
- **Confirmed defect (minor) — a typo inside the "Interview result" dialog**: the candidate's status at time of interview renders as **"New Reqeust"** (misspelled) rather than "New Request" inside that dialog's read-only summary — worth flagging alongside the "Degress" typo above as a second confirmed spelling defect, though this one is scoped to a specific dialog rather than the main status badge.
- **Breadcrumb confirmed exactly as specified — but only after in-app navigation, not a direct URL load**: navigating via the eye icon from the candidate list renders `nav.aw-breadcrumb` as `<a href="/admin">Dashboard</a> > <a href="/admin/candidate">Candidates</a> > <a>Candidate Details</a>` (current segment has no `href`), matching the story's exact text. **Caveat found**: navigating straight to `/admin/candidate/candidateDetail/{id}` via `page.goto()` (a cold/direct load, not a client-side nav) rendered an **empty** `<nav class="aw-breadcrumb"><ul></ul></nav>` in this exploration — automation should always reach this page via the confirmed click path (list → eye icon), not a direct `goto`, both for this reason and consistent with similar direct-reload quirks already documented elsewhere in this suite (see `goToJobDescriptions()`'s comment on Keycloak silent-SSO issues on full reload).
- **Additional page structure noted (out of the 10 stories' scope, but present and relevant to locator design)**: an "Interview" score card (radial Coding/Quiz charts, Average, English/Flexibility/Q&A/Logical ratings) sits between the profile card and the Education card, and "Activity ({n})"/"Interview ({n})" history sections sit below the file manager — the latter **resolves RMS-CAND-05's open question**: a logged activity ("NEW REQUEST -> FOLLOWING UP", with author and timestamp) is confirmed to display directly on this same Candidate Details page's "Activity" section, not a separate view.
- Helpers to reuse from `tests/helpers/candidate-helpers.ts`: `login()`, `goToCandidateList()`, `searchFor()`. None of the existing helpers reach the detail page itself yet — a future automation step should add a `openCandidateDetail(page, rowName)` helper (search → `row.locator('button:has-text("visibility")').first().click()` → assert URL matches `/candidateDetail/\d+/` and `.profile-header-name` is visible), mirroring the eye-icon pattern already proven live above.

**Real-data safety note (read before automating — this page has a real embedded file manager with delete/rename/upload capability):**
This page's file manager operates on a real, per-candidate upload folder that may contain meaningful fixtures (an actual CV, an actual profile photo) left by prior sessions or prior automated runs. Automated tests for RMS-CAND-04 must:
- Only ever upload files that the test itself creates, with a clearly-marked throwaway name (e.g. a `qa-automation-`/timestamp-prefixed fixture), and only into a synthetic/automation-owned candidate's own folder (e.g. Raksa CHANN, Vk KONG, or another candidate from the safe list in `specs/candidate-management.md`) — never a real candidate's folder.
- Never click "Delete" (or "Remove" in the resulting confirmation dialog) against any pre-existing file — verify the exact filename about to be deleted matches something the test itself just uploaded moments earlier, every time, before confirming.
- Never rely on, or click, "Go to parent folder" (or manually navigate the folder tree above the candidate's own node) as part of a normal test flow — this exploration confirmed it is not actually access-controlled and will expose every other candidate's files; a dedicated, clearly-labelled security-regression test may exercise this once (read-only, no delete/rename) to document the boundary, but general RMS-CAND-04 tests should stay scoped to the candidate's own folder and recover via a page reload if they ever end up navigated out of it.
- Never submit the Add Activity / Set Interview / Set Reminder / Edit / Interview Result forms opened from this page's header buttons in a way that would leave residue in a real candidate's record — per task-level convention, these five entry points are confirmed structurally (this plan) and always cancelled out of; any full submit-and-verify test for those flows belongs to their own separate specs (already out of scope per this epic's "Out of Scope" section) and must target only a synthetic candidate if written later.

## Test Scenarios

### 1. RMS-CAND-01: View candidate header and status

**Seed:** none (read-only exploration of existing synthetic candidates)

#### 1.1. CAND01-1. Header renders salutation, name, and status badge inline

**File:** `tests/candidate-details/header-name-and-status.spec.ts`

**Steps:**
  1. Open a synthetic candidate's detail page via the eye icon from the candidate list
    - expect: `h2.profile-header-name` reads `"{Salutation}. {Full Name}"` (e.g. "Ms. Raksa CHANN")
    - expect: A status badge (`.profile-header-status span`) is visible immediately to the right of the name, showing the candidate's current status text in uppercase (e.g. "FOLLOWING UP")
  2. Observe the subtitle directly under the name
    - expect: `h4.sub-title` shows the candidate's applied-for position (e.g. "QA Automation"), not a reference code

**Test data:** any synthetic candidate (e.g. Raksa CHANN, Vk KONG).

#### 1.2. CAND01-2. Status badge color does not vary by status (documents a confirmed defect)

**File:** `tests/candidate-details/header-status-badge-color-defect.spec.ts`

**Steps:**
  1. Open a candidate with status "FOLLOWING UP" and record the status span's `class` attribute and computed `background-color`
    - expect: class is `"following"`, background is `rgb(253, 244, 219)` (per this exploration)
  2. Open a candidate with a different status, e.g. "NEW REQUEST" or "IN PROGRESS", and record the same
    - expect: **Confirmed defect** — class and computed color are identical to step 1's, despite the different status text, contradicting the story's AC that the badge should use distinct color/label vocabulary per status

**Test data:** at least two synthetic candidates with different statuses (e.g. Raksa CHANN = FOLLOWING UP, Vk KONG = NEW REQUEST, Sopheak PHAL = IN PROGRESS — all three confirmed identical live).

#### 1.3. CAND01-3. No separate reference code is rendered for a normally-named candidate

**File:** `tests/candidate-details/header-no-reference-code.spec.ts`

**Steps:**
  1. Open a synthetic candidate whose name was not affected by the known name-sanitization defect
    - expect: The header contains only `"{Salutation}. {Full Name}"` — no additional code/number string appears anywhere in the header area

**Test data:** Vk KONG or Raksa CHANN. Document (do not assert as a bug) that a name mangled by the sanitization defect (e.g. a candidate whose Last Name became "CANDIDATE CAL05-3 1787544382116") can visually resemble a "reference code" in the header — this is the likely origin of the story's screenshot example, not a real distinct field.

### 2. RMS-CAND-02: View candidate profile information

**Seed:** none

#### 2.1. CAND02-1. All profile fields render with correct labels and audit timestamp format

**File:** `tests/candidate-details/profile-card-fields.spec.ts`

**Steps:**
  1. On a synthetic candidate's detail page, read every `text-label`/`text-value` pair in the profile card
    - expect: Labels present, in this structure, are exactly: Gender, Date of Birth, Email, Telephone Line 1, Telephone Line 2, Year of Experience, Created By, Create at, Last Modify, Priority, Description
    - expect: `Create at` and `Last Modify` values match the pattern `DD/Mon/YYYY hh:mm AM/PM` (e.g. `22/Jun/2026 09:35 AM`)

**Test data:** Raksa CHANN (has values recorded live for all fields above).

#### 2.2. CAND02-2. Empty-value convention: "--" for phone, blank for numeric/duration fields

**File:** `tests/candidate-details/profile-card-empty-values.spec.ts`

**Steps:**
  1. On a candidate with an unset `Telephone Line 2`
    - expect: Value renders literally as `"--"`
  2. On the same or another candidate with an unset `Year of Experience`
    - expect: Value renders as a truly empty string (no "--", no placeholder text)

**Test data:** Raksa CHANN (confirmed live: Telephone Line 2 = "--", Year of Experience = blank).

#### 2.3. CAND02-3. Avatar shows initials-on-color when no photo, and a real image when one exists

**File:** `tests/candidate-details/profile-card-avatar.spec.ts`

**Steps:**
  1. Open a candidate with no uploaded photo
    - expect: `.aw-avatar-title span` shows two-letter initials (e.g. "VK") inside a colored `aw-avatar-container aw-avatar-{color}` circle; no `<img>` is rendered inside `.contain-avatar-button`
  2. Open a candidate with an uploaded photo
    - expect: An `<img class="avatar-button" src="blob:...">` renders instead of the initials circle

**Test data:** Vk KONG (no photo, confirmed "VK" initials) for step 1; Raksa CHANN (has an uploaded photo) for step 2.

### 3. RMS-CAND-03: View candidate education history

**Seed:** none for the single-entry case; a coverage gap for the multi-entry case (see Open Items)

#### 3.1. CAND03-1. Education card structure and the "Degress" label typo

**File:** `tests/candidate-details/education-card-structure.spec.ts`

**Steps:**
  1. On a candidate with one education entry, observe the Education card
    - expect: Renders inside a `mat-tab-group`; the single tab's label is the school name (e.g. "AMERICAN UNIVERSITY OF PHNOM PENH (AUPP)")
    - expect: Beneath the tab, fields render in this order: Major, **"Degress"** (confirmed live typo — assert the current mis-spelled label, not "Degree"), GPA, Start Date, End Date
  2. Observe an unset `Degress`/`GPA` value vs. an unset `Start Date`/`End Date` value
    - expect: `Degress`/`GPA` render `"--"`; `Start Date`/`End Date` render blank — consistent with the mixed convention already found on the profile card

**Test data:** Raksa CHANN (Major: IT, Degress/GPA: "--", Start/End Date: blank — all confirmed live).

#### 3.2. CAND03-2. Multiple education entries (coverage gap — not confirmed live)

**File:** `tests/candidate-details/education-card-multi-entry.spec.ts`

**Steps:**
  1. Open a candidate known to have 2+ education entries (requires seeding via the Edit flow, since the Add-candidate wizard and `createSyntheticCandidate()` only add one)
    - expect: **Unconfirmed** — the `mat-tab-group` markup found live strongly suggests additional entries render as additional tabs (one per school), not stacked banners as the story assumed; this step should confirm or correct that inference once a multi-entry candidate is available

**Test data:** none available live at planning time — flagged as a coverage gap, consistent with similar gaps already documented in `specs/job-management-test-plan.md` and `specs/advance-report-test-plan.md`.

### 4. RMS-CAND-04: Browse and manage candidate files

**Seed:** a synthetic candidate's existing file-manager folder (e.g. Raksa CHANN, candidate id confirmed live as 3274) plus a throwaway file created by the test itself for any write scenario

#### 4.1. CAND04-1. Folder tree, toolbar, and status bar structure (read-only)

**File:** `tests/candidate-details/file-manager-structure.spec.ts`

**Steps:**
  1. Observe the folder tree on the left of the File manager card
    - expect: Shows `Places > upload > candidate > {id} > cv, profile`
  2. Observe the toolbar above the file grid
    - expect: At minimum, buttons with these exact `title` attributes are present: "Upload files", "Download", "Delete", "Rename", "Preview", plus "List view" (grid/list toggle) and the in-panel search (`[title="Find files"]`)
  3. Observe the status bar
    - expect: Reads `"Items: {n}, Sum: {size}"` for the currently selected folder (e.g. `"Items: 2, Sum: 517 KB"`)

**Test data:** Raksa CHANN's file manager (2 items, 517 KB, as of this exploration — assert the format, not the exact live count, since it may change).

#### 4.2. CAND04-2. Folder scope is not actually enforced above the candidate's own folder (confirms a security defect)

**File:** `tests/candidate-details/file-manager-scope-boundary-defect.spec.ts`

**Steps:**
  1. Note the status bar's item count while inside the candidate's own folder
    - expect: Matches the candidate's own known item count (read-only baseline)
  2. Click "Go to parent folder" (present, styled as disabled via CSS, but not blocked by `pointer-events` at the click-dispatch level per this exploration)
    - expect: **Confirmed defect** — navigation succeeds to the shared `upload/candidate` directory, and the status bar's item count jumps to a much larger number spanning every candidate's folders (63 items / 26.47 MB at exploration time)
  3. Reload the page to recover
    - expect: View resets back to the candidate's own scoped folder with the original item count restored; no file was touched during this scenario

**Test data:** Raksa CHANN. This scenario is strictly read-only (navigation only) — no delete/rename/upload is performed against any file seen while outside the candidate's own folder.

#### 4.3. CAND04-3. Upload, verify, and delete a throwaway file (happy path — confirms delete requires confirmation)

**File:** `tests/candidate-details/file-manager-upload-delete-cycle.spec.ts`

**Steps:**
  1. Note the status bar's baseline item count in a synthetic candidate's own folder
  2. Click "Upload files"; in the resulting drag-and-drop dialog, set files directly on the underlying `input[type="file"]` (do **not** wait for a native `filechooser` event — the toolbar button opens an in-page drop-zone dialog, not a native chooser) with a throwaway file whose name embeds a unique, test-owned marker string
    - expect: Status bar's item count increments by 1; the uploaded file (server-renamed with a UUID prefix, but still containing the original marker substring) appears in the grid
  3. Select the just-uploaded file (verify its visible name contains the marker string before proceeding) and click "Delete"
    - expect: **Confirmed** — a dialog titled "Delete" opens showing the file's name/size/modified date and the text "Are you sure you want to permanently remove items? This cannot be undone!", with "Remove" and "Cancel" buttons
  4. Click "Remove"
    - expect: Dialog closes; status bar's item count returns to the step-1 baseline; the marker-named file no longer appears in the grid

**Test data:** a fresh throwaway `.txt` file created by the test itself (unique per run, e.g. timestamp-suffixed), uploaded into and deleted from a synthetic candidate's own folder only (e.g. Raksa CHANN). Never target a pre-existing file.

#### 4.4. CAND04-4. Delete cancellation leaves the file intact (negative/safety path)

**File:** `tests/candidate-details/file-manager-delete-cancel.spec.ts`

**Steps:**
  1. Upload a throwaway file as in 4.3, step 2
  2. Select it and click "Delete", then click "Cancel" in the confirmation dialog instead of "Remove"
    - expect: Dialog closes; the file is still present in the grid and the status bar's item count is unchanged from immediately after upload
  3. Clean up by repeating the delete-and-confirm flow from 4.3 so no throwaway file is left behind

**Test data:** a fresh throwaway file, same constraints as 4.3.

### 5. RMS-CAND-05: Log an activity against the candidate (entry point only)

**Seed:** none

#### 5.1. CAND05-1. "Add activity" opens a full-page form (entry point only — do not submit)

**File:** `tests/candidate-details/add-activity-entry-point.spec.ts`

**Steps:**
  1. Click the "Add activity" header action (a `div.sub-navigation` element, not a semantic button — target by text, not role)
    - expect: Navigates to `/admin/activities/update?candidateId={id}` (a full page, not a dialog); heading "Manage Activity" is visible with sections "Activity information" and "Associate information"
  2. Click "Cancel" without filling anything in
    - expect: Returns to the candidate's detail page with no new activity created

**Test data:** any synthetic candidate.

#### 5.2. CAND05-2. Logged activities display in this page's own "Activity" section (resolves story's open question)

**File:** `tests/candidate-details/activity-section-placement.spec.ts`

**Steps:**
  1. On a candidate with at least one prior logged activity, scroll to the "Activity ({n})" section below the File manager card
    - expect: **Confirmed** — a logged activity (e.g. a status-change entry like "NEW REQUEST -> FOLLOWING UP") displays here directly, with author and timestamp, on this same Candidate Details page — not on a separate Activity view

**Test data:** Raksa CHANN (confirmed live: "Activity (1)" section shows one status-change entry).

### 6. RMS-CAND-06: Schedule an interview for the candidate (entry point only)

**Seed:** none

#### 6.1. CAND06-1. "Set interview" opens a pre-filled in-place dialog (entry point only — do not save)

**File:** `tests/candidate-details/set-interview-entry-point.spec.ts`

**Steps:**
  1. Click the "Set interview" header action
    - expect: URL is unchanged; a `role="dialog"` titled "Set Interview" opens with fields `Candidate*` (pre-filled with this candidate's name), `Interviewers*`, `Date & time*`, "Send invitation mail to candidate" checkbox, "Reminder Me" + minutes-in-advance, `Apply for*` (pre-filled with this candidate's applied-for position), `Description` (200-char limit), and Cancel/Save buttons
  2. Click "Cancel"
    - expect: Dialog closes; no interview was created; the candidate's own Interview history section is unchanged

**Test data:** any synthetic candidate — confirms both pre-fill fields (Candidate, Apply for) per the story's AC.

### 7. RMS-CAND-07: Set a reminder for the candidate (entry point only)

**Seed:** none

#### 7.1. CAND07-1. "Set reminder" opens a full-page pre-associated form (entry point only — do not save)

**File:** `tests/candidate-details/set-reminder-entry-point.spec.ts`

**Steps:**
  1. Click the "Set reminder" header action
    - expect: Navigates to `/admin/reminders/add/{id}/SPECIAL` (a full page, not a dialog); heading "Manage Create reminder" is visible
  2. Navigate away without saving
    - expect: Returns cleanly; no reminder was created

**Test data:** any synthetic candidate.

### 8. RMS-CAND-08: Edit candidate details (entry point only)

**Seed:** none

#### 8.1. CAND08-1. "Edit" opens a full-page pre-filled form (entry point only — do not save)

**File:** `tests/candidate-details/edit-entry-point.spec.ts`

**Steps:**
  1. Click the "Edit" header action
    - expect: Navigates to `/admin/candidate/editCandidate/{id}` (a full page, not a dialog); heading "Update Information" is visible
  2. Navigate away without saving
    - expect: Returns to the candidate's detail page with all original field values unchanged (re-verify at least Gender, Email, Priority against the pre-edit values)

**Test data:** any synthetic candidate, values re-verified after cancel.

### 9. RMS-CAND-09: Record an interview result (entry point only)

**Seed:** a candidate with an interview already set (required for the button to be meaningfully populated — Raksa CHANN qualifies)

#### 9.1. CAND09-1. "Interview result" is the primary button and opens a pre-filled in-place dialog (entry point only — do not update)

**File:** `tests/candidate-details/interview-result-entry-point.spec.ts`

**Steps:**
  1. Observe the header action buttons
    - expect: "Interview result" is visually distinct (filled/primary style) from the four secondary (outlined) buttons — Add activity, Set interview, Set reminder, Edit
  2. Click "Interview result"
    - expect: URL is unchanged; a `role="dialog"` opens titled with the **candidate's own name** (not literally "Interview Result"), showing read-only Apply for/Date & Time/Interviewers/Description plus an editable "Interview Result" section (Quiz*, Coding*, Average, English*, Logical*, Flexibility*, Oral question*, Description) and Cancel/Update buttons
    - expect: Note the dialog's status summary text reads **"New Reqeust"** (a confirmed spelling defect — assert the current mis-spelled text, do not assume it will read "New Request")
  3. Click "Cancel"
    - expect: Dialog closes; the candidate's status badge (RMS-CAND-01) is unchanged

**Test data:** Raksa CHANN (has an interview already set, confirmed live).

### 10. RMS-CAND-10: Breadcrumb navigation

**Seed:** none

#### 10.1. CAND10-1. Breadcrumb text and link targets, reached via in-app navigation

**File:** `tests/candidate-details/breadcrumb.spec.ts`

**Steps:**
  1. Reach the Candidate Details page via the candidate list's eye icon (in-app client-side navigation — **not** a direct `page.goto()` to the detail URL, per this exploration's caveat below)
    - expect: `nav.aw-breadcrumb` renders `Dashboard > Candidates > Candidate Details`; "Dashboard" is `<a href="/admin">`, "Candidates" is `<a href="/admin/candidate">`, "Candidate Details" is a plain `<a>` with **no `href`**
  2. Click "Dashboard"
    - expect: Navigates to `/admin/dashboard`
  3. Return to the candidate's detail page, click "Candidates"
    - expect: Navigates to `/admin/candidate`

**Test data:** any synthetic candidate.

#### 10.2. CAND10-2. Direct URL navigation may render an empty breadcrumb (documents a caveat, not asserted as the happy path)

**File:** `tests/candidate-details/breadcrumb-direct-navigation-caveat.spec.ts`

**Steps:**
  1. Navigate directly via `page.goto('/admin/candidate/candidateDetail/{id}')` (a cold load, bypassing the candidate list)
    - expect: **Unconfirmed reliability** — this exploration observed an empty `<nav class="aw-breadcrumb"><ul></ul></nav>` on a direct load; document this as a known caveat for test authors (always navigate via the list + eye icon in other scenarios) rather than asserting a specific broken/working state here, since the underlying cause (timing vs. a genuine router-data resolution gap) was not conclusively isolated

**Test data:** any candidate id. This scenario exists to document the caveat for future automation, not to assert a fixed behavior.

## Open Items Carried Forward (not fixed here, flagged for design/dev/PM)

1. **Status badge color/class does not vary by status** (`.profile-header-status span` is always `class="following"`, same computed color) — confirmed across three distinct real status values (FOLLOWING UP, NEW REQUEST, IN PROGRESS). This is the most significant finding in this plan and directly contradicts RMS-CAND-01's AC; needs a dev fix (likely a missing per-status class mapping, possibly a leftover default value never wired to the actual status enum).
2. **File manager folder-scope is not actually access-controlled** — "Go to parent folder" is visually disabled (CSS class + `pointer-events: none`) while inside a candidate's own folder, but a normal (non-forced) click still navigates up to the shared `upload/candidate` directory (63 items / 26.47 MB across all candidates at exploration time). This resolves the story's open security question in the negative and should be escalated as a security/access-control gap, not merely a UI polish item — any user who can reach one candidate's detail page can browse every other candidate's uploaded files this way.
3. **Two confirmed spelling defects**: the Education card's "Degress" label (should read "Degree") and the Interview Result dialog's "New Reqeust" status text (should read "New Request"). Both are low-severity but straightforward to fix and worth batching into the same dev ticket as other UI-text cleanup.
4. **The story's "reference code" does not exist as a distinct field** — what the story's screenshot likely showed was a candidate name mangled by the already-documented name-sanitization defect (`createSyntheticCandidate()`'s known casing/spacing mutation on save). Confirms this is the same root-cause defect already flagged elsewhere in this suite, not a second, unrelated one — no new dev ticket needed beyond the existing name-sanitization one, but the story's AC should be corrected to drop the reference-code claim.
5. **Multiple education entries were not confirmed live** — every synthetic candidate available at exploration time had exactly one education entry. The `mat-tab-group` markup strongly suggests additional entries render as additional tabs rather than the story's assumed stacked banners, but this needs a real multi-entry candidate (via the Edit flow, since the Add wizard only adds one) to confirm before RMS-CAND-03's multi-entry scenario (3.2 above) can move from "coverage gap" to "confirmed."
6. **Breadcrumb rendering on a direct/cold page load is unreliable** (empty `<ul>` observed once in this exploration, vs. working correctly every time via in-app navigation) — worth a short follow-up investigation to determine whether this is a genuine defect (a router-data resolution race on cold load) or specific to headless/scripted navigation; in the meantime, all breadcrumb automation should navigate via the candidate list, never via a direct URL.
