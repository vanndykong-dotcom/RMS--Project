// spec: specs/advance-report-test-plan.md (RPT03-1)
// exploratory: pill text joins two dates with an arrow glyph (not a hyphen); the panel shows
// 8 preset buttons in a fixed order; "Custom date ranged" carries the active CSS class by
// default (no semantic "This Week" preset exists - open item #5, not fixed here).

import { test, expect } from '@playwright/test';
import { login, goToAdvanceReport } from '../helpers/candidate-helpers';

test.describe('RMS-RPT-03: Filter by date range', () => {
  test('RPT03-1. Date-range control structure and default value', async ({ page }) => {
    await login(page);
    await goToAdvanceReport(page);

    const dateRangePill = page.getByText(/[A-Za-z]{3}\s+\d{1,2}.+[A-Za-z]{3}\s+\d{1,2}/).first();
    await expect(dateRangePill).toBeVisible();
    await expect(dateRangePill).not.toContainText(' - ');

    await dateRangePill.click();

    const presetNames = [
      'Today', 'Yesterday', 'Last 7 Days', 'Last 30 Days', 'This month', 'Last month',
      'Last 3 months', 'Custom date ranged',
    ];
    for (const name of presetNames) {
      await expect(page.getByRole('button', { name, exact: true })).toBeVisible();
    }

    // "Custom date ranged" is the active/highlighted preset by default.
    await expect(page.getByRole('button', { name: 'Custom date ranged' })).toHaveClass(/active/);

    await expect(page.getByRole('button', { name: 'Generate' })).toBeVisible();
  });
});
