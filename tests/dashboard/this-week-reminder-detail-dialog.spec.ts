// spec: specs/dashboard-test-plan.md (DASH07-2)
// exploratory: resolves/corrects the story's open question - clicking the reminder card (which
// carries title="View reminder") opens a role=dialog titled "Reminder Detail" with fields
// Reminder Type/Title/Interview/Date time/Created at/Status/Description. It does NOT navigate
// to Candidate Details as the story's AC assumed - see
// specs/dashboard-exploratory-results.md "Story corrections" #3.

import { test, expect } from '@playwright/test';
import { login } from '../helpers/candidate-helpers';

test.describe('RMS-DASH-07: View This Week Reminder panel', () => {
  test('DASH07-2. Clicking the reminder opens a "Reminder Detail" dialog, not a navigation', async ({ page }) => {
    await login(page);

    const card = page.locator('app-reminder-report-card').first();
    await card.click();

    const dialog = page.locator('[role="dialog"]').first();
    await expect(dialog).toContainText('Reminder Detail');
    await expect(dialog).toContainText('Reminder Type');
    await expect(dialog).toContainText('Title');
    await expect(dialog).toContainText('Interview');
    await expect(dialog).toContainText('Date time');
    await expect(dialog).toContainText('Created at');
    await expect(dialog).toContainText('Status');
    await expect(dialog).toContainText('Description');

    // Confirms no navigation occurred - still on the Dashboard.
    await expect(page).toHaveURL(/\/admin\/dashboard/);

    await page.keyboard.press('Escape');
    await expect(page.locator('[role="dialog"]')).toHaveCount(0);
  });
});
