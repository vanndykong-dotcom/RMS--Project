// spec: specs/dashboard-test-plan.md (DASH06-3)
// exploratory: resolves the story's open question about whether interview entries are
// clickable. CORRECTION found only during automation (not the earlier live-exploration pass,
// which had only checked the URL after clicking): clicking an entry card opens an "Interview
// Detail"-style dialog (candidate name, status pill, "Apply for" position, "Date & Time",
// "Interviewers" - including the same duplicate badge seen in DASH06-2 - "Description", and
// Edit/Add Result/Close actions), NOT "nothing" as first recorded. No page navigation occurs.
// See specs/dashboard-exploratory-results.md Insight #10.
//
// Healed 2026-09-28 (smart re-run): originally clicked the "Ms. Kanna TESTING" card from the
// week of 21 Sep 2026, which is no longer in this week's panel. Now opens whichever entry this
// week has, and checks the dialog against that card's own name and position.

import { test, expect } from '@playwright/test';
import { login } from '../helpers/candidate-helpers';

test.describe('RMS-DASH-06: View This Week Interview panel', () => {
  test('DASH06-3. Clicking an interview entry opens an Interview Detail dialog', async ({ page }) => {
    await login(page);
    await expect(page.getByText('This Week Interview')).toBeVisible();
    // The panel populates after the rest of the dashboard (measured 4-8s on the shared server).
    await page.waitForLoadState('networkidle');

    const card = page.locator('app-reminder-interview-card').first();
    test.skip((await card.count()) === 0, 'No interviews scheduled this week - nothing to open');
    const candidateName = (await card.locator('.profile-info-name').innerText()).trim();
    const position = (await card.locator('app-aw-badge[color="primary"]').first().innerText()).trim();

    await card.click();

    const dialog = page.locator('[role="dialog"]').first();
    await expect(dialog).toContainText(candidateName);
    await expect(dialog).toContainText('Apply for');
    // The card's badge is CSS-uppercased (innerText "SOFTWARE TESTING AUTOMATION") while the
    // dialog renders the stored case - compare case-insensitively.
    await expect(dialog).toContainText(new RegExp(position.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i'));
    await expect(dialog).toContainText('Date & Time');
    await expect(dialog).toContainText('Interviewers');
    await expect(dialog.getByRole('button', { name: 'Close' })).toBeVisible();

    // No page navigation occurred.
    await expect(page).toHaveURL(/\/admin\/dashboard/);

    await page.keyboard.press('Escape');
    await expect(page.locator('[role="dialog"]')).toHaveCount(0);
  });
});
