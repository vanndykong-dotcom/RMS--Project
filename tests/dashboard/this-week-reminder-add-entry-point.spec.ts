// spec: specs/dashboard-test-plan.md (DASH07-3)
// exploratory: "+ Reminder" navigates to a full page, /admin/reminders/add?type=INTERVIEW -
// unlike "+ Interview" (a dialog), this is a page navigation. Entry point only, nothing is
// submitted.

import { test, expect } from '@playwright/test';
import { login } from '../helpers/candidate-helpers';

test.describe('RMS-DASH-07: View This Week Reminder panel', () => {
  test('DASH07-3. "+ Reminder" opens the reminder creation page', async ({ page }) => {
    await login(page);

    const wrHeading = page.getByRole('heading', { name: 'This Week Reminder' });
    // Healed 2026-09-28: the panel count was hardcoded to last week's 1 entry. What this step
    // checks is that nothing got submitted, so compare against the count before the click.
    await page.waitForLoadState('networkidle');
    const cards = page.locator('app-reminder-report-card');
    const cardsBefore = await cards.count();
    const addBtn = wrHeading.locator('xpath=..').getByRole('button');
    await addBtn.click();

    await expect(page).toHaveURL(/\/admin\/reminders\/add/);

    await page.getByRole('tree').getByRole('button', { name: 'Dashboard' }).click();
    await expect(page).toHaveURL(/\/admin\/dashboard/);
    await expect(cards).toHaveCount(cardsBefore);
  });
});
