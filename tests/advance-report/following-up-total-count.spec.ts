// spec: specs/advance-report-test-plan.md (RPT01-3)
// exploratory: confirmed live "Total: 1" on the default date range, matching the single
// seeded Following-Up candidate visible at that time.

import { test, expect } from '@playwright/test';
import { login, goToAdvanceReport, setAdvanceReportDateRange, ADVANCE_REPORT_SEED_WEEK } from '../helpers/candidate-helpers';

test.describe('RMS-RPT-01: View Following-Up Qualified Candidates report', () => {
  test('RPT01-3. Total row count is shown', async ({ page }) => {
    await login(page);
    await goToAdvanceReport(page);
    // Seeded rows live in a fixed week, not the current-week default (see ADVANCE_REPORT_SEED_WEEK).
    await setAdvanceReportDateRange(page, ADVANCE_REPORT_SEED_WEEK);

    const totalText = page.getByText(/^Total:\s*\d+$/);
    await expect(totalText).toBeVisible();
    await expect(totalText).toHaveText('Total: 1');
  });
});
