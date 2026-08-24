// spec: specs/advance-report-test-plan.md (RPT05-3)
// exploratory: confirmed live - clearing the search box after a STAFF+non-matching-term
// combination restored the STAFF-filtered single row (Vannyda), not the fully-unfiltered set
// and not still empty.

import { test, expect } from '@playwright/test';
import { login, goToAdvanceReport } from '../helpers/candidate-helpers';

test.describe('RMS-RPT-05: Search within the report', () => {
  test('RPT05-3. Clearing search restores the prior filtered result set', async ({ page }) => {
    await login(page);
    await goToAdvanceReport(page);

    await page.getByText('Filter', { exact: true }).first().click();
    await page.getByText('STAFF', { exact: true }).click();

    const reportSearch = page.locator('input[placeholder="Search"]').nth(1);
    await reportSearch.fill('zzzNoMatch999');
    await expect(page.getByText('No matching records found')).toBeVisible();

    await reportSearch.fill('');
    await expect(page.getByRole('row', { name: /Vannyda PICH/i })).toBeVisible();
    await expect(page.getByText('Total: 1')).toBeVisible();
  });
});
