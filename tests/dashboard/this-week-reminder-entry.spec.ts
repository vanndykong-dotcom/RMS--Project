// spec: specs/dashboard-test-plan.md (DASH07-1)
// exploratory: each entry is an <app-reminder-report-card> with a type badge, a
// "DD/Mon/YYYY hh:mm AM" date and a candidate name. The candidate name is confirmed to be plain
// text (<p class="candidate-name">), NOT an <a> link as the story's AC assumed - see
// specs/dashboard-exploratory-results.md "Story corrections" #2.
//
// Healed 2026-09-28 (smart re-run): originally asserted the single entry seen the week of
// 21 Sep 2026 (Ms. Kanna II, 22/Sep/2026 03:48 PM), which could only pass that week. Now
// asserts the panel's rules against whatever this week's data is.

import { test, expect } from '@playwright/test';
import { login } from '../helpers/candidate-helpers';
import { parseRmsDateTime, currentWeekWindow } from '../helpers/date-helpers';

test.describe('RMS-DASH-07: View This Week Reminder panel', () => {
  test('DASH07-1. Every entry has a type badge, a date in this week, and a plain-text candidate name', async ({ page }) => {
    await login(page);
    await expect(page.getByText('This Week Reminder')).toBeVisible();
    // The panel populates after the rest of the dashboard (measured 4-8s on the shared server).
    await page.waitForLoadState('networkidle');

    const cards = page.locator('app-reminder-report-card');
    const count = await cards.count();
    test.skip(count === 0, 'No reminders this week - nothing to verify');

    const { start, end } = currentWeekWindow();
    for (const card of await cards.all()) {
      await expect(card.locator('app-aw-badge')).not.toHaveCount(0);
      const when = parseRmsDateTime(await card.innerText());
      expect(when).toBeGreaterThanOrEqual(start);
      expect(when).toBeLessThan(end);

      const candidateName = card.locator('.candidate-name');
      await expect(candidateName).not.toBeEmpty();
      // Corrects the story's assumption: this is a <p>, not an <a> link.
      expect(await candidateName.evaluate((el) => el.tagName.toLowerCase())).toBe('p');
    }
  });
});
