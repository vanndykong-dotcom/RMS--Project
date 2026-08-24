// spec: specs/advance-report-test-plan.md (RPT02-3)
// exploratory: resolves the story's open question - 8 columns, no split-header issue like
// Following Up. Synthetic "QA Automation Test CANDIDATE ..." rows are safe, pre-existing
// fixtures from other suites and populate correctly here.

import { test, expect } from '@playwright/test';
import { login, goToAdvanceReport } from '../helpers/candidate-helpers';

test.describe('RMS-RPT-02: Switch between report tabs', () => {
  test('RPT02-3. Summary Full Staff column set', async ({ page }) => {
    await login(page);
    await goToAdvanceReport(page);

    await page.getByRole('tab', { name: 'Summary Full Staff' }).click();
    await expect(page.getByText(/FULL STAFF \(.+ - .+\)/)).toBeVisible();

    const headerRow = page.locator('table thead tr').last();
    const headers = await headerRow.locator('th').allInnerTexts();
    expect(headers).toEqual([
      'No', 'NAME', 'University', 'Number of Candidates', 'Degree', 'Apply For', 'Interview Status', 'Remark',
    ]);

    // At least one data row populates without error (e.g. a synthetic QA Automation row).
    const firstRow = page.locator('table tbody tr').first();
    await expect(firstRow).toBeVisible();
    await expect(firstRow.locator('td')).toHaveCount(8);
  });
});
