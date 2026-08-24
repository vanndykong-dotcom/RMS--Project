// spec: specs/interview-schedule-test-plan.md (CAL03-1)

import { test, expect } from '@playwright/test';
import { login, goToInterviewSchedule } from '../helpers/candidate-helpers';

function monthYear(date: Date) {
  return date.toLocaleString('en-US', { month: 'long', year: 'numeric' });
}

test.describe('RMS-CAL-03: Period navigation', () => {
  test('CAL03-1. Prev/next chevrons update the period label', async ({ page }) => {
    await login(page);
    await goToInterviewSchedule(page);

    const periodLabel = page.locator('.fc-toolbar-title');
    const now = new Date();

    // 1. Label matches the actual current month/year.
    await expect(periodLabel).toContainText(monthYear(now));

    // 2. "next" advances by exactly one month.
    const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
    await page.locator('button[aria-label="next"]').click();
    await expect(periodLabel).toContainText(monthYear(nextMonth));

    // 3. "prev" twice moves back two months from step 2's value (one month before original).
    const prevBtn = page.locator('button[aria-label="prev"]');
    await prevBtn.click();
    await prevBtn.click();
    const oneMonthBefore = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    await expect(periodLabel).toContainText(monthYear(oneMonthBefore));

    // 4. "today" resets to the current month/year regardless of prior navigation.
    // Guard: "today" gets the native disabled attribute once already on today's period
    // (see insight #1) - a bare .click() on a disabled button would hang forever.
    const todayBtn = page.getByRole('button', { name: 'today' });
    if (!(await todayBtn.isDisabled())) {
      await todayBtn.click();
    }
    await expect(periodLabel).toContainText(monthYear(now));
  });
});
