// spec: specs/interview-schedule-test-plan.md (CAL01-3)

import { test, expect } from '@playwright/test';
import { login, goToInterviewSchedule } from '../helpers/candidate-helpers';

test.describe('RMS-CAL-01: Month calendar view', () => {
  test('CAL01-3. Today highlight', async ({ page }) => {
    await login(page);
    await goToInterviewSchedule(page);

    // 1. Today's cell carries the pale-yellow highlight, distinct from a non-today cell.
    const todayCell = page.locator('.fc-day-today');
    await expect(todayCell).toHaveCount(1);
    const todayBg = await todayCell.evaluate((el) => getComputedStyle(el).backgroundColor);
    expect(todayBg).toBe('rgba(255, 220, 40, 0.15)');

    const otherCell = page.locator('.fc-daygrid-day').filter({ hasNot: page.locator('.fc-day-today') }).first();
    const otherBg = await otherCell.evaluate((el) => getComputedStyle(el).backgroundColor);
    expect(otherBg).not.toBe('rgba(255, 220, 40, 0.15)');

    // 2. Navigate away, then back via "today" - the highlight must reappear on the actual date.
    await page.locator('button[aria-label="next"]').click();
    await expect(page.locator('.fc-day-today')).toHaveCount(0);

    // "today" gets the native disabled attribute when already showing today's period (see
    // insight #1) - not the case here since we just navigated away, but guard anyway for safety.
    const todayBtn = page.getByRole('button', { name: 'today' });
    if (!(await todayBtn.isDisabled())) {
      await todayBtn.click();
    }
    const restoredCell = page.locator('.fc-day-today');
    await expect(restoredCell).toHaveCount(1);
    const restoredBg = await restoredCell.evaluate((el) => getComputedStyle(el).backgroundColor);
    expect(restoredBg).toBe('rgba(255, 220, 40, 0.15)');
  });
});
