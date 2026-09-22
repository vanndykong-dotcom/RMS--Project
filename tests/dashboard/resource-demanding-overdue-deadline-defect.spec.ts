// spec: specs/dashboard-test-plan.md (DASH04-3)
// exploratory: CONFIRMED DEFECT - the Deadline badge's `title` tooltip attribute reads
// "Overdue by -264 days" (a negative count) for a demand that is unambiguously overdue. The
// visible red/danger pill styling itself is correct; only the tooltip's number carries an
// inverted/miscalculated sign. See specs/dashboard-exploratory-results.md "Defect 1" and
// test-reports/evidence/defect-DASH04-1-overdue-negative-days-tooltip.png.
// This test documents the CURRENT (buggy) behavior rather than asserting the intuitively
// correct positive count, per this repo's convention for known-defect scenarios.

import { test, expect } from '@playwright/test';
import { login } from '../helpers/candidate-helpers';

test.describe('RMS-DASH-04: View Resource Demanding table', () => {
  test('DASH04-3. Overdue deadline tooltip shows a negative day count (confirmed defect)', async ({ page }) => {
    await login(page);

    const rd = page.locator('app-dashboard-resource-demanding');
    const deadlineBadge = rd.locator('tbody tr').first().locator('td').nth(5).locator('app-aw-badge');
    // Wait for the badge to be attached/populated before reading its title attribute - under
    // this suite's default 3-worker concurrency, the table can still be hydrating right after
    // login() resolves.
    await expect(deadlineBadge).toBeVisible({ timeout: 10000 });
    const title = await deadlineBadge.getAttribute('title');

    // Documents the confirmed defect: a negative day count in an "Overdue by" message.
    expect(title).toMatch(/Overdue by -\d+ days/);
  });
});
