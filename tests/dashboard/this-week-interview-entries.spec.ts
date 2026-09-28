// spec: specs/dashboard-test-plan.md (DASH06-1)
// exploratory: every entry is an <app-reminder-interview-card> with name, primary (position)
// badge, "DD/Mon/YYYY hh:mm AM" subtitle and secondary (interviewer) badges, ordered by
// date/time ascending.
//
// Healed 2026-09-28 (smart re-run): this originally asserted the exact 2 entries seen the week
// of 21 Sep 2026 (Ms. Kanna TESTING / Ms. Kanna II). The panel is by definition "this week", so
// that snapshot could only ever pass during that one week - on 28 Sep it held entirely different
// (synthetic) entries. Now asserts the panel's rules against whatever this week's data is.

import { test, expect } from '@playwright/test';
import { login } from '../helpers/candidate-helpers';
import { parseRmsDateTime, currentWeekWindow } from '../helpers/date-helpers';

test.describe('RMS-DASH-06: View This Week Interview panel', () => {
  test('DASH06-1. Every entry has the required fields, falls in this week, in ascending order', async ({ page }) => {
    await login(page);
    await expect(page.getByText('This Week Interview')).toBeVisible();
    // The panel populates after the rest of the dashboard (measured 4-8s on the shared server).
    await page.waitForLoadState('networkidle');

    const cards = page.locator('app-reminder-interview-card');
    const count = await cards.count();
    test.skip(count === 0, 'No interviews scheduled this week - nothing to verify');

    const { start, end } = currentWeekWindow();
    const times: number[] = [];
    for (const card of await cards.all()) {
      await expect(card.locator('.profile-info-name')).not.toBeEmpty();
      await expect(card.locator('app-aw-badge[color="primary"]')).not.toHaveCount(0);
      await expect(card.getByText('Interviewers')).toBeVisible();
      await expect(card.locator('app-aw-badge[color="secondary"]')).not.toHaveCount(0);
      const when = parseRmsDateTime(await card.locator('mat-card-subtitle').innerText());
      expect(when).toBeGreaterThanOrEqual(start);
      expect(when).toBeLessThan(end);
      times.push(when);
    }
    expect(times).toEqual([...times].sort((a, b) => a - b));
  });
});
