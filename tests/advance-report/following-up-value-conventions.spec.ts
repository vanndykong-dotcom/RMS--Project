// spec: specs/advance-report-test-plan.md (RPT01-2)
// exploratory: the seeded row "Miss. Vannyda PICH" exhibits both conventions - blank source
// fields render literally as "-", the ungraded Grade cell renders literally as "N/A".

import { test, expect } from '@playwright/test';
import { login, goToAdvanceReport } from '../helpers/candidate-helpers';

test.describe('RMS-RPT-01: View Following-Up Qualified Candidates report', () => {
  test('RPT01-2. Missing vs. ungraded value rendering conventions', async ({ page }) => {
    await login(page);
    await goToAdvanceReport(page);

    const row = page.getByRole('row', { name: /Vannyda PICH/i });
    await expect(row).toBeVisible();
    const cells = row.locator('td');

    // 1. Unset source fields (School Year, Company, Experience) render literally as "-".
    await expect(cells.nth(5)).toHaveText('-'); // School Year
    await expect(cells.nth(7)).toHaveText('-'); // Company
    await expect(cells.nth(8)).toHaveText('-'); // Experience

    // 2. The ungraded Grade cell renders literally as "N/A", distinct from the "-" convention.
    await expect(cells.nth(13)).toHaveText('N/A'); // Grade
  });
});
