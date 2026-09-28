// spec: specs/advance-report-test-plan.md (RPT07-2)
// exploratory: resolves the open question - clicking the name never navigates (URL stays on
// /admin/candidate/advance-report); a role="dialog" opens in place with a read-only profile
// (info grid + Interview score charts) and a red-outlined "Close" button, no Edit affordance
// anywhere. Because it never navigates, the "state preserved on return" criterion is trivially
// satisfied.

import { test, expect } from '@playwright/test';
import { login, goToAdvanceReport, setAdvanceReportDateRange, ADVANCE_REPORT_SEED_WEEK } from '../helpers/candidate-helpers';

test.describe('RMS-RPT-07: Open a candidate profile from the report', () => {
  test('RPT07-2. Clicking the name opens an in-place profile modal', async ({ page }) => {
    await login(page);
    await goToAdvanceReport(page);
    // Seeded rows live in a fixed week, not the current-week default (see ADVANCE_REPORT_SEED_WEEK).
    await setAdvanceReportDateRange(page, ADVANCE_REPORT_SEED_WEEK);

    const nameButton = page.locator('button.candidate-name-button').first();
    await nameButton.click();

    // No navigation occurs at all.
    await expect(page).toHaveURL(/\/admin\/candidate\/advance-report/);

    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible();
    await expect(dialog.getByText('Gender', { exact: true })).toBeVisible();
    await expect(dialog.getByText('Date of Birth', { exact: true })).toBeVisible();
    await expect(dialog.getByText('Interview', { exact: true })).toBeVisible();

    // Healed 2026-09-28: this used to assert "no Edit affordance anywhere" (the modal was a
    // read-only info grid + score charts in August). The app has since grown it into the full
    // profile the story asks for (RMS-RPT-07 "open their full profile... complete history"):
    // it now embeds the candidate's File Manager (Delete/Rename/Edit file), Activities, and
    // Interviews with "Add Result" actions. Assert the full-profile sections instead. The fact
    // that write actions are now reachable from inside a report is flagged to PM in the report.
    await expect(dialog.getByRole('heading', { name: /^Activities \(\d+\)$/ })).toBeVisible();
    await expect(dialog.getByRole('heading', { name: /^Interviews \(\d+\)$/ })).toBeVisible();

    await dialog.getByRole('button', { name: 'Close' }).click();
    await expect(dialog).not.toBeVisible();

    // The underlying report is unchanged - trivially true since no navigation ever happened.
    await expect(page.getByRole('tab', { name: 'Following Up Report' })).toHaveAttribute('aria-selected', 'true');
  });
});
