// spec: specs/job-management-test-plan.md (JOB05-1)
// exploratory: clicking button[mattooltip="View"] opens an in-place [role="dialog"]
// (<app-dialog-view-job>, URL unchanged) with a nav menu of plain <a class="nav-item"> items
// (NOT role=tab): "Job Details" (default), "Description", "Attachment". Attachment tab for
// "QA Automation" shows a filename, size (e.g. "5.43 KB"), and "Open in Browser"/"Download".
// Escape closes cleanly.

import { test, expect } from '@playwright/test';
import { login, goToJobDescriptions, getJobRowByExactTitle } from '../helpers/candidate-helpers';

test.describe('RMS-JOB-05: View a job description\'s full detail (eye icon)', () => {
  test('JOB05-1. Eye icon opens an in-place dialog, not a page navigation', async ({ page }) => {
    await login(page);
    await goToJobDescriptions(page);

    const urlBefore = page.url();
    const row = getJobRowByExactTitle(page, 'QA Automation');
    await row.locator('button[mattooltip="View"]').click();

    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible();
    expect(page.url()).toBe(urlBefore);

    // Plain <a class="nav-item"> items, not role=tab.
    await expect(dialog.locator('a.nav-item', { hasText: 'Job Details' })).toBeVisible();
    await expect(dialog.locator('a.nav-item', { hasText: 'Description' })).toBeVisible();
    await expect(dialog.locator('a.nav-item', { hasText: 'Attachment' })).toBeVisible();

    // "Job Details" is the default view.
    await expect(dialog.getByText('Job Title', { exact: true })).toBeVisible();
    await expect(dialog.getByText('Status', { exact: true })).toBeVisible();
    await expect(dialog.getByText('Created', { exact: true }).first()).toBeVisible();
    await expect(dialog.getByText('Last Updated', { exact: true })).toBeVisible();

    await dialog.locator('a.nav-item', { hasText: 'Description' }).click();
    // "QA Automation" itself has an unset description (renders N/A - see
    // description-na-rendering.spec.ts); this step only confirms the panel switches, not any
    // specific text.

    await dialog.locator('a.nav-item', { hasText: 'Attachment' }).click();
    await expect(dialog.getByText(/\d+(\.\d+)?\s*(KB|MB)/i)).toBeVisible();
    await expect(dialog.getByText('Open in Browser', { exact: false })).toBeVisible();
    // Not exact: the control's accessible text combines its mat-icon ligature name with its
    // label in one node ("download Download", same pattern as the kebab menu's "delete icon
    // Delete" - confirmed live), so an exact "Download" match never matches.
    await expect(dialog.getByText('Download', { exact: false })).toBeVisible();

    await page.keyboard.press('Escape');
    await expect(dialog).not.toBeVisible();
    await expect(page.locator('table tbody tr')).toHaveCount(11);
  });
});
