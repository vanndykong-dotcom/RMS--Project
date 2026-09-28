// spec: specs/dashboard-test-plan.md (DASH06-4)
// exploratory: "+ Interview" opens a role=dialog titled "Create Interview" with fields
// Candidate*/Interviewers*/Date & time*/Send invitation mail checkbox/Reminder Me/Apply for*/
// Description and Cancel/Save buttons - entry point only, always Cancel, never Save.

import { test, expect } from '@playwright/test';
import { login } from '../helpers/candidate-helpers';

test.describe('RMS-DASH-06: View This Week Interview panel', () => {
  test('DASH06-4. "+ Interview" opens a "Create Interview" dialog (do not save)', async ({ page }) => {
    await login(page);

    // Under this suite's default 3-worker concurrency, the panel can still be hydrating right
    // after login() resolves - wait for at least one entry before capturing the baseline count,
    // confirmed to eliminate an intermittent "0 entries read" race seen during healing.
    const interviewCards = page.locator('app-reminder-interview-card');
    await expect(interviewCards.first()).toBeVisible({ timeout: 10000 });
    const entriesBefore = await interviewCards.count();

    await page.locator('.reminder-interview').getByRole('button', { name: /Interview/ }).click();
    const dialog = page.locator('[role="dialog"]').first();
    await expect(dialog).toContainText('Create Interview');
    await expect(dialog).toContainText('Candidate');
    await expect(dialog).toContainText('Interviewers');
    await expect(dialog).toContainText('Date & time');
    await expect(dialog).toContainText('Apply for');
    await expect(dialog.getByRole('button', { name: 'Cancel' })).toBeVisible();
    await expect(dialog.getByRole('button', { name: 'Save' })).toBeVisible();

    // Never click "Save" - close via Escape rather than the "Cancel" button: the form's own
    // "Description" field sits below the fold and pushes "Cancel" outside the dialog's visible
    // scroll area, which made a direct .click() flake on "element is outside of the viewport"
    // during healing. Escape was confirmed live to close this dialog cleanly without that issue.
    await page.keyboard.press('Escape');
    await expect(page.locator('[role="dialog"]')).toHaveCount(0);
    await expect(page.locator('app-reminder-interview-card')).toHaveCount(entriesBefore);
  });
});
