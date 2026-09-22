// spec: specs/dashboard-test-plan.md (DASH07-1)
// exploratory: exactly 1 <app-reminder-report-card> entry matching the story's data. The
// candidate name is confirmed to be plain text (<p class="candidate-name">), NOT an <a> link as
// the story's AC assumed - see specs/dashboard-exploratory-results.md "Story corrections" #2.

import { test, expect } from '@playwright/test';
import { login } from '../helpers/candidate-helpers';

test.describe('RMS-DASH-07: View This Week Reminder panel', () => {
  test('DASH07-1. Exactly 1 entry with exact fields', async ({ page }) => {
    await login(page);

    const cards = page.locator('app-reminder-report-card');
    await expect(cards).toHaveCount(1);

    const card = cards.first();
    await expect(card.locator('app-aw-badge[color="warning"]')).toContainText('INTERVIEW');
    await expect(card).toContainText('Marketing Manager-VK');
    await expect(card).toContainText('22/Sep/2026 03:48 PM');

    const candidateName = card.locator('.candidate-name');
    await expect(candidateName).toContainText('Ms. Kanna II');
    // Corrects the story's assumption: this is a <p>, not an <a> link.
    const tagName = await candidateName.evaluate((el) => el.tagName.toLowerCase());
    expect(tagName).toBe('p');
  });
});
