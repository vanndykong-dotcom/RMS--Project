// spec: specs/advance-report-test-plan.md (RPT05-2)
// exploratory: confirmed live - with STAFF filter active, searching "Vannyda" (matches) kept
// her row visible; searching a non-matching term produced "No matching records found". The
// Filter panel still showed STAFF checked throughout - search does not reset or replace it.
//
// Automation note: after selecting a radio option, the Filter panel's transparent
// cdk-overlay-backdrop stays in the DOM ("showing") indefinitely - it's a full-viewport
// element that intercepts any subsequent click anywhere on the page (even on unrelated
// elements like the page heading), so pressing Escape only closes it when focus is still
// inside the overlay itself; here focus has since moved to the search box, so Escape has no
// effect on it. Playwright's own .click() on the backdrop also fails because its default
// click point (bounding-box center) is covered by the filter panel that's rendered on top of
// it. Clicking the backdrop at an explicit corner position, away from the panel, reliably
// dismisses it (the STAFF selection itself survives - see RPT04-3) before reopening Filter.

import { test, expect } from '@playwright/test';
import { login, goToAdvanceReport } from '../helpers/candidate-helpers';

test.describe('RMS-RPT-05: Search within the report', () => {
  test('RPT05-2. Search composes with the active filter rather than replacing it', async ({ page }) => {
    await login(page);
    await goToAdvanceReport(page);

    await page.getByText('Filter', { exact: true }).first().click();
    await page.getByText('STAFF', { exact: true }).click();

    const reportSearch = page.locator('input[placeholder="Search"]').nth(1);

    // A term that should match the STAFF-type seeded row.
    await reportSearch.fill('Vannyda');
    await expect(page.getByRole('row', { name: /Vannyda PICH/i })).toBeVisible();

    // A term guaranteed not to match anything under the applied filter.
    await reportSearch.fill('zzzNoMatch999');
    await expect(page.getByText('No matching records found')).toBeVisible();
    await expect(page.getByText('Total: 0')).toBeVisible();

    // The Filter panel still shows STAFF selected - search doesn't reset other controls.
    // Dismiss the lingering (but stale) backdrop from the earlier Filter selection first -
    // see file header note.
    const backdrop = page.locator('.cdk-overlay-backdrop');
    if (await backdrop.first().isVisible().catch(() => false)) {
      await backdrop.first().click({ position: { x: 5, y: 5 } });
    }
    await page.getByText('Filter', { exact: true }).first().click();
    const checkedLabel = await page.evaluate(() => {
      const radios = Array.from(document.querySelectorAll('input[type="radio"]'));
      const checked = radios.find((r) => (r as HTMLInputElement).checked);
      return checked?.closest('mat-radio-button')?.textContent?.trim();
    });
    expect(checkedLabel).toBe('STAFF');
  });
});
