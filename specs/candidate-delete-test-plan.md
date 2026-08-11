# Candidate Delete Test Plan

## Application Overview

Application under test: ALLWEB Recruitment Management System (RMS) Candidate module at
https://rms-dev.allweb.com.kh/admin/candidate (real, production-like data). Login via
Keycloak-backed /welcome page using FAPA_EMAIL/FAPA_PASSWORD from `.env`, then click
'Candidate' in the left sidebar tree.

This plan covers `user-stories/Scrum_Delete.md` ("Manage Candidates" - Restore/Delete
revision). That story restates several acceptance criteria already covered by the existing
`specs/candidate-management.md` plan (table structure, bulk Archive, eye-icon detail view,
pagination preserving filters, inline status-dropdown editing) - those are **not**
duplicated here; see the coverage map below. This plan focuses on what changed: the
**Restore / Delete** row actions.

### Live exploration findings (2026-08-11)

- AC4/AC5 ("⋮ menu shows Restore and Delete", "Delete asks for confirmation") describe the
  **Archive view's** row menu, not the active Manage Candidates list. Confirmed live:
  - Active list ⋮ menu (unchanged): `Modify, Set Reminder, Set Interview, Add Activity Log,
    Add interview result, Add to archive`.
  - Archive view ⋮ menu (new): `Restore, Delete`.
- Clicking **Delete** in the Archive view opens a dialog titled "Delete Candidate" with body
  text "Are you sure you want to delete this candidate?" and a note: "Data associated with
  [candidate name] will be permanently deleted." — see
  `test-results/evidence/archive-delete-confirmation-dialog.png`.
- **This resolves the story's open question**: Delete is a **hard/permanent delete**, not a
  soft delete (unlike Archive, which is recoverable via Restore in the same menu).
- **Safety constraint for this test suite**: because deletion is permanent and this
  environment holds real, production-like data, no automated or manual test in this plan
  ever clicks the dialog's final **Confirm** button. Every Delete scenario stops at
  verifying the dialog's presence/content, then dismisses it (Cancel or the X icon).
  Restore (already recoverable, already covered by `tests/candidate-archive/restore.spec.ts`)
  is unaffected by this constraint.

### Coverage map vs. Scrum_Delete.md acceptance criteria

| AC | Description | Coverage |
|----|--------------|----------|
| 1 | Table columns render | `tests/candidate-list/page-structure.spec.ts` (existing) |
| 2 | Bulk Archive | `tests/candidate-list/row-menu-archive.spec.ts` (existing, single-row Add to archive) |
| 3 | Eye icon -> detail view | `tests/candidate-list/view-candidate.spec.ts` (existing) |
| 4 | ⋮ menu shows Restore and Delete | **New: D1 below** |
| 5 | Delete asks for confirmation before permanent removal | **New: D2, D3 below** |
| 6 | Pagination preserves filter state | `tests/candidate-list/pagination.spec.ts` (existing) |
| 7 | Inline status dropdown | `tests/candidate-list/inline-status-update.spec.ts` (existing) |

## Test Scenarios

### 1. F. Archive View - Delete Action

**Seed:** `tests/seed-candidate.spec.ts`

#### 1.1. F1. Archive view row menu shows Restore and Delete

**File:** `tests/candidate-archive/delete-menu-visibility.spec.ts`

**Steps:**
  1. Create a synthetic candidate, archive it, and open the Archive view
     - expect: The synthetic candidate's row is visible in the Archive view
  2. Open the ⋮ (more_vert) action menu for that row
     - expect: Menu shows exactly `Restore` and `Delete` (no other items)

#### 1.2. F2. Delete opens a permanent-removal confirmation dialog

**File:** `tests/candidate-archive/delete-confirmation-dialog.spec.ts`

**Steps:**
  1. Create a synthetic candidate, archive it, open the Archive view, and open its ⋮ menu
     - expect: `Delete` menu item is visible and enabled
  2. Click `Delete`
     - expect: A dialog titled "Delete Candidate" appears
     - expect: Dialog text asks "Are you sure you want to delete this candidate?"
     - expect: Dialog includes a note that the candidate's data will be **permanently
       deleted**, referencing the candidate by name
  3. Click `Cancel` in the dialog (never click Confirm - this is a permanent action)
     - expect: Dialog closes
     - expect: The candidate record still exists in the Archive view (not deleted)

#### 1.3. F3. Delete dialog dismisses via the close (X) icon without deleting

**File:** `tests/candidate-archive/delete-dialog-dismiss.spec.ts`

**Steps:**
  1. Create a synthetic candidate, archive it, open the Archive view, open its ⋮ menu, and
     click `Delete`
     - expect: Confirmation dialog is visible
  2. Click the dialog's close ("X") icon instead of Cancel or Confirm
     - expect: Dialog closes
     - expect: The candidate record still exists in the Archive view (not deleted)

## Notes / Out of Scope

- No test in this suite ever clicks the Delete dialog's `Confirm` button, by design (see
  Safety constraint above). Verifying that a confirmed Delete actually removes the record
  server-side is intentionally left as a manual, deliberate exercise against a
  disposable/synthetic record only, outside of this automated suite.
- Whether the top-right bulk `Archive` button (AC2) supports multi-select was already an
  open question in the base `candidate-management.md` plan and remains unresolved; not
  re-investigated here since it is unrelated to Delete.
