// spec: specs/candidate-delete-test-plan.md
// seed: tests/seed-candidate.spec.ts

import { test, expect } from '@playwright/test';
import {
  login, goToCandidateList, createSyntheticCandidate, searchFor, clickRowMenuItem, archiveCandidateFromActiveList, waitForRowAfterWrite,
} from '../helpers/candidate-helpers';

test.describe('F. Archive View - Delete Action', () => {
  test('F2. Delete opens a permanent-removal confirmation dialog', async ({ page }) => {
    await login(page);
    await goToCandidateList(page);
    const name = await createSyntheticCandidate(page, { lastNameSuffix: 'F2' });
    await searchFor(page, 'Candidate F2');
    await archiveCandidateFromActiveList(page, name);

    await searchFor(page, '');
    await page.getByRole('button', { name: 'Archive' }).click();
    const row = await waitForRowAfterWrite(page, name, 'Candidate F2');

    // 1. Delete menu item is visible and enabled.
    await clickRowMenuItem(page, name, 'Delete');

    // 2. A "Delete Candidate" dialog appears with the expected warning copy.
    const dialog = page.getByRole('dialog');
    await expect(dialog.getByText('Delete Candidate')).toBeVisible();
    await expect(dialog.getByText(/Are you sure you want to delete this candidate/)).toBeVisible();
    await expect(dialog.getByText(/will be permanently deleted/)).toBeVisible();
    await expect(dialog).toContainText(name);
    await page.screenshot({ path: 'test-reports/evidence/archive-delete-confirmation-dialog.png' });

    // 3. Cancel - never Confirm, since this action is permanent (see plan's safety constraint).
    await dialog.getByRole('button', { name: 'Cancel' }).click();

    // The candidate record still exists in the Archive view (not deleted).
    await expect(row).toBeVisible();

    // cleanup: restore the synthetic candidate back to the active list.
    await clickRowMenuItem(page, name, 'Restore');
    await page.getByRole('button', { name: 'Confirm' }).click();
  });
});
