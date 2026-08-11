// spec: specs/candidate-management.md
// seed: tests/seed-candidate.spec.ts

import { test, expect } from '@playwright/test';
import { login, goToCandidateList, createSyntheticCandidate, searchFor, archiveCandidateFromActiveList } from '../helpers/candidate-helpers';

test.describe('A. Manage Candidates - List Page', () => {
  test('A5. Inline status update', async ({ page }) => {
    await login(page);
    await goToCandidateList(page);
    const name = await createSyntheticCandidate(page, { lastNameSuffix: 'A5' });

    await searchFor(page, 'Candidate A5');
    const row = page.getByRole('row', { name });
    await expect(row.getByText('NEW REQUEST')).toBeVisible();

    // 1. Click the status badge/dropdown
    await row.getByText('NEW REQUEST').click();

    // 2. Select a different status. Note: this overlay's items are not exposed via ARIA
    // roles (accessibility gap, see report), so a text locator is used deliberately. The
    // dropdown overlay renders last in the DOM (as a portal), so .last() targets its
    // option rather than an unrelated existing row already showing "PASSED".
    await page.getByText('PASSED', { exact: true }).last().click();

    // Selecting a status opens a "Change Status" confirmation dialog that must be confirmed.
    await expect(page.getByRole('heading', { name: 'Change Status' })).toBeVisible();
    await page.getByRole('button', { name: 'Confirm' }).click();

    // KNOWN APP DEFECT (confirmed live, see defect-A5-status-change-to-passed-fails.png):
    // Confirming still calls PATCH .../candidate/{id}/status/{statusId}, but for the PASSED
    // status that call always returns HTTP 400 {"message":"Candidate not allowed to update"}
    // - reproduced from NEW REQUEST directly, and again after progressing the same candidate
    // through NEW REQUEST -> IN PROGRESS -> ATTENDED first, so it is not merely a workflow-order
    // rule. The UI surfaces only a generic, non-actionable toast ("Unable to change candidate
    // status. Please review the requirements and try again.") and the badge silently stays on
    // its previous value - it never becomes visible as "PASSED", contradicting this scenario's
    // spec expectation ("The badge updates immediately"). Other statuses (IN PROGRESS, ATTENDED,
    // FAILED, CANCELED) were verified to apply successfully via this same dropdown+Confirm flow,
    // so the defect is specific to transitioning to PASSED, not the inline-status feature as a
    // whole. This assertion is intentionally left as the spec's correct expected behavior (not
    // weakened to pass) so it keeps failing until the defect is fixed.
    await expect(row.getByText('PASSED')).toBeVisible();

    // 3. Reload the page - the change persisted server-side
    await page.reload();
    await searchFor(page, 'Candidate A5');
    await expect(page.getByRole('row', { name }).getByText('PASSED')).toBeVisible();

    // cleanup
    await archiveCandidateFromActiveList(page, name);
  });
});
