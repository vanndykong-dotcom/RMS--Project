// spec: specs/dashboard-test-plan.md (DASH05-3)
// exploratory: "+ Candidate" navigates to /admin/candidate/add, heading "Add Information" - the
// same 5-step wizard createSyntheticCandidate() automates elsewhere in this repo. Entry point
// only, nothing is submitted here.

import { test, expect } from '@playwright/test';
import { login } from '../helpers/candidate-helpers';

test.describe('RMS-DASH-05: View Top Candidates', () => {
  test('DASH05-3. "+ Candidate" opens the candidate creation wizard', async ({ page }) => {
    await login(page);

    await page.locator('.top-candidate').getByRole('button', { name: /Candidate/ }).click();
    await expect(page).toHaveURL(/\/admin\/candidate\/add/);
    await expect(page.getByRole('heading', { name: 'Add Information' })).toBeVisible();

    await page.getByRole('tree').getByRole('button', { name: 'Dashboard' }).click();
    await expect(page).toHaveURL(/\/admin\/dashboard/);
    await expect(page.getByRole('heading', { name: 'Top Candidates' })).toBeVisible();
  });
});
