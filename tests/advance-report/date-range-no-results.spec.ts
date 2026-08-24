// spec: specs/advance-report-test-plan.md (RPT03-3)
// exploratory: no seeded Following-Up data exists further back than ~1 Feb 2026 (confirmed
// empty even back to Feb 2019) - navigating the inline calendar back 24 months from "now"
// guarantees an empty window without hardcoding an absolute date. Calendar chevrons are
// <mat-icon class="... arrow ...">keyboard_arrow_left</mat-icon>, not role=button -
// dispatchEvent('click') is used because a plain .click() intermittently fails with "element
// intercepts pointer events" from the calendar's own hover/animation layer (insight #2).

import { test, expect } from '@playwright/test';
import { login, goToAdvanceReport } from '../helpers/candidate-helpers';

test.describe('RMS-RPT-03: Filter by date range', () => {
  test('RPT03-3. Date range with no results', async ({ page }) => {
    await login(page);
    await goToAdvanceReport(page);

    const dateRangePill = page.getByText(/[A-Za-z]{3}\s+\d{1,2}.+[A-Za-z]{3}\s+\d{1,2}/).first();
    await dateRangePill.click();

    const prevMonthArrow = page.locator('mat-icon.arrow', { hasText: 'keyboard_arrow_left' });
    for (let i = 0; i < 24; i += 1) {
      await prevMonthArrow.dispatchEvent('click');
    }

    const dayOneCell = page.getByRole('gridcell', { name: /^1,|\s1,/ }).first();
    await dayOneCell.click();
    await dayOneCell.click();

    await page.getByRole('button', { name: 'Generate' }).click();

    await expect(page.getByText('No matching records found')).toBeVisible();
    await expect(page.getByText('Total: 0')).toBeVisible();
    await expect(page.getByText(/FOLLOWING-UP QUALIFIED CANDIDATES \(.+ - .+\)/)).toBeVisible();
  });
});
