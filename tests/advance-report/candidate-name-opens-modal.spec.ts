// spec: specs/advance-report-test-plan.md (RPT07-2)
// exploratory: resolves the open question - clicking the name never navigates (URL stays on
// /admin/candidate/advance-report); a role="dialog" opens in place with a read-only profile
// (info grid + Interview score charts) and a red-outlined "Close" button, no Edit affordance
// anywhere. Because it never navigates, the "state preserved on return" criterion is trivially
// satisfied.

import { test, expect } from '@playwright/test';
import { login, goToAdvanceReport } from '../helpers/candidate-helpers';

test.describe('RMS-RPT-07: Open a candidate profile from the report', () => {
  test('RPT07-2. Clicking the name opens an in-place profile modal', async ({ page }) => {
    await login(page);
    await goToAdvanceReport(page);

    const nameButton = page.locator('button.candidate-name-button').first();
    await nameButton.click();

    // No navigation occurs at all.
    await expect(page).toHaveURL(/\/admin\/candidate\/advance-report/);

    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible();
    await expect(dialog.getByText('Gender', { exact: true })).toBeVisible();
    await expect(dialog.getByText('Date of Birth', { exact: true })).toBeVisible();
    await expect(dialog.getByText('Interview', { exact: true })).toBeVisible();

    // No Edit affordance anywhere in this read-only dialog.
    await expect(dialog.getByRole('button', { name: /edit/i })).toHaveCount(0);

    await dialog.getByRole('button', { name: 'Close' }).click();
    await expect(dialog).not.toBeVisible();

    // The underlying report is unchanged - trivially true since no navigation ever happened.
    await expect(page.getByRole('tab', { name: 'Following Up Report' })).toHaveAttribute('aria-selected', 'true');
  });
});
