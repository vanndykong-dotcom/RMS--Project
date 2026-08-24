// spec: specs/job-management-test-plan.md (JOB06-2)
// exploratory NEW FINDING: Modify opens the SAME in-place-dialog mechanism as the eye icon
// (URL never changes, stays /admin/setting/job) while the heading changes to "Update Job
// Description" - it is not a page navigation like "+ Add". Crucially, page.goBack() must NEVER
// be used to close it: since no new history entry is pushed, an earlier exploration attempt
// using goBack() navigated all the way past the job list to /admin/dashboard. Always close via
// Escape (or its own close control) instead.

import { test, expect } from '@playwright/test';
import { login, goToJobDescriptions, getJobRowByExactTitle, clickJobRowMenuItem } from '../helpers/candidate-helpers';

test.describe('RMS-JOB-06: Row action menu - Modify, Delete, Share, Get file', () => {
  test('JOB06-2. Modify opens the pre-filled edit form (entry point only)', async ({ page }) => {
    await login(page);
    await goToJobDescriptions(page);

    const urlBefore = page.url();
    const row = getJobRowByExactTitle(page, 'QA Automation');
    await clickJobRowMenuItem(row, 'Modify');

    // In-place dialog, not a page navigation.
    expect(page.url()).toBe(urlBefore);
    await expect(page.getByRole('heading', { name: 'Update Job Description' })).toBeVisible();
    await expect(page.locator('input[formcontrolname="title"]')).toHaveValue('QA Automation');

    // Close without saving - never via goBack() (see note above). Escape does NOT close this
    // particular mat-dialog (confirmed live - the dialog stays open after pressing it, likely
    // configured with disableClose); use its own "Cancel" button instead.
    await page.getByRole('button', { name: 'Cancel' }).click();
    await expect(page.getByRole('heading', { name: 'Update Job Description' })).not.toBeVisible();

    // The row's data is unchanged in the list afterward.
    await expect(getJobRowByExactTitle(page, 'QA Automation')).toBeVisible();
    await expect(page.locator('table tbody tr')).toHaveCount(11);
  });
});
