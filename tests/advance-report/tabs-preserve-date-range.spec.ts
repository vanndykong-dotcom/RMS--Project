// spec: specs/advance-report-test-plan.md (RPT02-2)
// exploratory: PASS only holds for the untouched default range - see Bug #5 in
// advance-report-exploratory-results.md. A genuinely widened range on Following Up does NOT
// carry over to the Summary tabs (each tab's date-range state appears independent, and the
// Summary tabs' totals may not be date-filtered at all). This test sticks to the plan's own
// worked example (default range, never changed) rather than asserting the untested "widened
// range carries over" behavior, which was shown to be false.

import { test, expect } from '@playwright/test';
import { login, goToAdvanceReport } from '../helpers/candidate-helpers';

test.describe('RMS-RPT-02: Switch between report tabs', () => {
  test('RPT02-2. Switching tabs preserves the active date range (default, untouched range)', async ({ page }) => {
    await login(page);
    await goToAdvanceReport(page);

    // Captured via innerText() (not the toHaveText() matcher) and compared the same way below -
    // the pill renders its start/end dates as two separate inline elements with no dash/arrow
    // text node between them ("Aug 24Aug 28"), and toHaveText()'s own whitespace-normalized
    // textContent() comparison collapses that differently than innerText() does, so mixing the
    // two produces a false mismatch even when the rendered dates are identical.
    const dateRangePill = page.getByText(/[A-Za-z]{3}\s+\d{1,2}.+[A-Za-z]{3}\s+\d{1,2}/).first();
    const initialRangeText = await dateRangePill.innerText();

    await page.getByRole('tab', { name: 'Summary Full Staff' }).click();
    await expect(page.getByText(/FULL STAFF \(.+\)/)).toBeVisible();
    expect(await dateRangePill.innerText()).toBe(initialRangeText);

    await page.getByRole('tab', { name: 'Summary Intern' }).click();
    await expect(page.getByText(/INTERNSHIP \(.+\)/)).toBeVisible();
    expect(await dateRangePill.innerText()).toBe(initialRangeText);
  });
});
