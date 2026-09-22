// spec: specs/dashboard-test-plan.md (DASH06-3)
// exploratory: resolves the story's open question about whether interview entries are
// clickable. CORRECTION found only during automation (not the earlier live-exploration pass,
// which had only checked the URL after clicking): clicking an entry card opens an "Interview
// Detail"-style dialog (candidate name, status pill, "Apply for" position, "Date & Time",
// "Interviewers" - including the same duplicate badge seen in DASH06-2 - "Description", and
// Edit/Add Result/Close actions), NOT "nothing" as first recorded. No page navigation occurs.
// See specs/dashboard-exploratory-results.md Insight #10.

import { test, expect } from '@playwright/test';
import { login } from '../helpers/candidate-helpers';

test.describe('RMS-DASH-06: View This Week Interview panel', () => {
  test('DASH06-3. Clicking an interview entry opens an Interview Detail dialog', async ({ page }) => {
    await login(page);

    const card = page.locator('app-reminder-interview-card').filter({ hasText: 'Ms. Kanna TESTING' });
    await card.click();

    const dialog = page.locator('[role="dialog"]').first();
    await expect(dialog).toContainText('Ms. Kanna TESTING');
    await expect(dialog).toContainText('Apply for');
    await expect(dialog).toContainText('Marketing Manager-VK');
    await expect(dialog).toContainText('Date & Time');
    await expect(dialog).toContainText('Interviewers');
    await expect(dialog).toContainText('Description');
    await expect(dialog.getByRole('button', { name: 'Close' })).toBeVisible();

    // No page navigation occurred.
    await expect(page).toHaveURL(/\/admin\/dashboard/);

    await page.keyboard.press('Escape');
    await expect(page.locator('[role="dialog"]')).toHaveCount(0);
  });
});
