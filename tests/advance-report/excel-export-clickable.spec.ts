// spec: specs/advance-report-test-plan.md (RPT06-2)
// exploratory: a pre-existing, unrelated Firebase-Messaging console error fires on every page
// load - filtered out of the console/page-error assertions here (insight #6). The download
// event does not reliably fire within a couple of seconds in this environment either (insight
// #5), so per the plan's own scope, this only asserts "no new error + button stays usable" and
// does not download-and-inspect the resulting file.

import { test, expect } from '@playwright/test';
import { login, goToAdvanceReport } from '../helpers/candidate-helpers';

test.describe('RMS-RPT-06: Export report to Excel', () => {
  test('RPT06-2. Clicking Excel does not error', async ({ page }) => {
    await login(page);
    await goToAdvanceReport(page);

    const pageErrors: Error[] = [];
    page.on('pageerror', (err) => pageErrors.push(err));
    const consoleErrors: string[] = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error' && !msg.text().includes('Firebase Messaging')) {
        consoleErrors.push(msg.text());
      }
    });

    const excelButton = page.getByRole('button', { name: /Excel/ });
    await excelButton.click();
    await page.waitForTimeout(2000);

    expect(pageErrors).toHaveLength(0);
    expect(consoleErrors).toHaveLength(0);
    await expect(excelButton).toBeEnabled();
  });
});
