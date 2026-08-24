// spec: specs/advance-report-test-plan.md (RPT05-4)
// exploratory: confirmed live - a nonsense term under the default ALL filter produced "No
// matching records found"/"Total: 0"; clearing the box restored the original row and Total.

import { test, expect } from '@playwright/test';
import { login, goToAdvanceReport } from '../helpers/candidate-helpers';

test.describe('RMS-RPT-05: Search within the report', () => {
  test('RPT05-4. Search matching nothing', async ({ page }) => {
    await login(page);
    await goToAdvanceReport(page);

    const reportSearch = page.locator('input[placeholder="Search"]').nth(1);
    await reportSearch.fill('zzzznotfound12345');

    await expect(page.getByText('No matching records found')).toBeVisible();
    await expect(page.getByText('Total: 0')).toBeVisible();

    await reportSearch.fill('');
    await expect(page.getByRole('row', { name: /Vannyda PICH/i })).toBeVisible();
    await expect(page.getByText('Total: 1')).toBeVisible();
  });
});
