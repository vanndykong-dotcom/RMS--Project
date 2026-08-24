// spec: specs/job-management-test-plan.md (JOB03-1)
// exploratory: the "Add" pill button (icon "add" + text, aw-btn-primary) navigates to a
// dedicated page, /admin/setting/job/create (NOT a modal), heading "Manage Jobs", sections
// "Job information" (first field "Role *") and "File preview". Only the entry point is
// confirmed here - the form itself is out of scope. page.goBack() is safe on this route since
// it's a real page navigation, unlike Modify (an in-place dialog - see
// modify-entry-point.spec.ts, where goBack() is unsafe).

import { test, expect } from '@playwright/test';
import { login, goToJobDescriptions } from '../helpers/candidate-helpers';

test.describe('RMS-JOB-03: Add a new job description (entry point only)', () => {
  test('JOB03-1. "+ Add" button opens the creation page', async ({ page }) => {
    await login(page);
    await goToJobDescriptions(page);

    const addButton = page.getByRole('button', { name: 'Add' });
    await expect(addButton).toBeVisible();
    await addButton.click();

    await expect(page).toHaveURL(/\/admin\/setting\/job\/create$/);
    await expect(page.getByRole('heading', { name: 'Manage Jobs' })).toBeVisible();
    // Not exact: "Job information" shares its element with the adjacent "Active" status-toggle
    // label (rendered as one combined text node, "Job information Active") - confirmed live -
    // so an exact match never matches. Substring is sufficient to confirm the section exists.
    await expect(page.getByText('Job information')).toBeVisible();
    await expect(page.getByText('File preview', { exact: true })).toBeVisible();

    await page.goBack();
    await expect(page).toHaveURL(/\/admin\/setting\/job$/);
    await expect(page.locator('table tbody tr')).toHaveCount(11);
    await expect(page.getByText(/^Total:\s*11$/)).toBeVisible();
  });
});
