// spec: specs/advance-report-test-plan.md (RPT04-2)
// exploratory: confirmed live - the seeded Following-Up candidate (Vannyda PICH) is
// STAFF-type, so selecting INTERN excludes her row entirely, proving the filter genuinely
// re-queries rather than being cosmetic.
//
// Automation note: after selecting a radio option, the Filter panel's transparent
// cdk-overlay-backdrop stays in the DOM as "showing" indefinitely - it's a full-viewport
// element that intercepts any subsequent click, and Playwright's default .click() on it
// fails because its default click point (bounding-box center) is covered by the filter panel
// rendered on top of it. Clicking the backdrop at an explicit corner position, away from the
// panel, reliably dismisses it (the selection itself survives - see RPT04-3) before
// reopening Filter.

import { test, expect } from '@playwright/test';
import { login, goToAdvanceReport } from '../helpers/candidate-helpers';

test.describe('RMS-RPT-04: Apply additional filters', () => {
  test('RPT04-2. Selecting a filter option narrows results', async ({ page }) => {
    await login(page);
    await goToAdvanceReport(page);

    const totalText = page.getByText(/^Total:\s*\d+$/);
    await expect(totalText).toHaveText('Total: 1');

    await page.getByText('Filter', { exact: true }).first().click();
    await page.getByText('INTERN', { exact: true }).click();

    await expect(page.getByText('No matching records found')).toBeVisible();
    await expect(totalText).toHaveText('Total: 0');

    // Dismiss the lingering (but stale) backdrop from the previous Filter selection before
    // reopening it - see file header note.
    const backdrop = page.locator('.cdk-overlay-backdrop');
    if (await backdrop.first().isVisible().catch(() => false)) {
      await backdrop.first().click({ position: { x: 5, y: 5 } });
    }
    await page.getByText('Filter', { exact: true }).first().click();
    await page.getByText('ALL', { exact: true }).click();

    await expect(totalText).toHaveText('Total: 1');
  });
});
