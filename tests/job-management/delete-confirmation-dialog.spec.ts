// spec: specs/job-management-test-plan.md (JOB06-3)
// exploratory: clicking "Delete" opens a dialog titled "Remove Job Description" with body text
// "Are you sure you want to remove this Job Description?" and three controls: close (X),
// "Cancel", "Confirm". This was clicked live on the real "QA Automation" row and immediately
// cancelled - row count re-verified unchanged.
// SAFETY: only "Cancel"/close may ever be exercised against a real pre-existing row -
// "Confirm" must only be used against a synthetic row created by the test itself (see
// status-toggle-synthetic.spec.ts's cleanup step for that path).

import { test, expect } from '@playwright/test';
import { login, goToJobDescriptions, getJobRowByExactTitle, clickJobRowMenuItem } from '../helpers/candidate-helpers';

test.describe('RMS-JOB-06: Row action menu - Modify, Delete, Share, Get file', () => {
  test('JOB06-3. Delete shows a confirmation dialog (cancel only, real row)', async ({ page }) => {
    await login(page);
    await goToJobDescriptions(page);

    const row = getJobRowByExactTitle(page, 'QA Automation');
    await clickJobRowMenuItem(row, 'delete icon Delete');

    const dialog = page.getByRole('dialog');
    await expect(dialog.getByText('Remove Job Description')).toBeVisible();
    await expect(dialog.getByText('Are you sure you want to remove this Job Description?')).toBeVisible();
    await expect(dialog.getByRole('button', { name: 'Cancel' })).toBeVisible();
    await expect(dialog.getByRole('button', { name: 'Confirm' })).toBeVisible();

    // Never "Confirm" against a real pre-existing row.
    await dialog.getByRole('button', { name: 'Cancel' }).click();
    await expect(dialog).not.toBeVisible();

    await expect(row).toBeVisible();
    await expect(page.locator('table tbody tr')).toHaveCount(11);
  });
});
