// spec: specs/advance-report-test-plan.md (RPT08-1)
// exploratory: resolves the modal-vs-panel open question - the eye icon opens a separate,
// smaller role="dialog" titled "Remark" with Full Name/Interview Status/Quiz/Coding/
// Description fields. The dialog and the row's own Quiz/Coding cells use different
// placeholder conventions for an absent value ("-" in the table vs "N/A" in the dialog), but
// agree exactly once a candidate has real scores (see Bug #3, refined from the plan's open
// item #2) - not asserted here since it needs a graded row not guaranteed present.
//
// The "eye icon" itself is a <mat-icon>visibility</mat-icon> (aria-hidden, tooltip "View
// remark") inside the row's last <td>, not a role=button element - the row's only actual
// <button> is the Full Name button, which opens the unrelated candidate-profile dialog (see
// RPT07-2). The Remark dialog also has no aria-label/aria-labelledby, so its accessible name
// is empty and getByRole('dialog', { name: 'Remark' }) never matches - assert on the plain
// role=dialog locator and check its "Remark" heading text instead.

import { test, expect } from '@playwright/test';
import { login, goToAdvanceReport } from '../helpers/candidate-helpers';

test.describe('RMS-RPT-08: View row detail via eye icon', () => {
  test('RPT08-1. Eye icon opens a "Remark" dialog', async ({ page }) => {
    await login(page);
    await goToAdvanceReport(page);

    const firstRow = page.locator('table tbody tr').first();
    await firstRow.locator('[mattooltip="View remark"]').click();

    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible();
    await expect(dialog.getByText('Remark', { exact: true }).first()).toBeVisible();
    await expect(dialog.getByText('Full Name', { exact: true })).toBeVisible();
    await expect(dialog.getByText('Interview Status', { exact: true })).toBeVisible();
    await expect(dialog.getByText('Quiz', { exact: true })).toBeVisible();
    await expect(dialog.getByText('Coding', { exact: true })).toBeVisible();
    await expect(dialog.getByText('Description', { exact: true })).toBeVisible();

    // Closing returns cleanly to the report with no state change.
    await page.keyboard.press('Escape');
    await expect(dialog).not.toBeVisible();
    await expect(page.getByRole('tab', { name: 'Following Up Report' })).toHaveAttribute('aria-selected', 'true');
  });
});
