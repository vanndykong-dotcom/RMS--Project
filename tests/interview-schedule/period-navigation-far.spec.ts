// spec: specs/interview-schedule-test-plan.md (CAL03-2)
// exploratory: confirmed live - Aug 2026 -> +12 -> Aug 2027 (year boundary correct) ->
// -24 -> Aug 2025 -> today -> Aug 2026. 42 day-cells rendered throughout, zero console errors.

import { test, expect } from '@playwright/test';
import { login, goToInterviewSchedule } from '../helpers/candidate-helpers';

function monthYear(date: Date) {
  return date.toLocaleString('en-US', { month: 'long', year: 'numeric' });
}

test.describe('RMS-CAL-03: Period navigation', () => {
  test('CAL03-2. Navigating many periods forward/back (edge case)', async ({ page }) => {
    // A pre-existing, unrelated Firebase Messaging console error ("Error initializing
    // Firebase Messaging... Missing App configuration value: projectId") fires on this app
    // regardless of the Candidate/Calendar module being exercised - see
    // specs/candidate-management.md. It's a known non-issue (missing Firebase config, not a
    // module defect), so it's filtered out here rather than failing this assertion on it.
    const consoleErrors: string[] = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error' && !msg.text().includes('Error initializing Firebase Messaging')) {
        consoleErrors.push(msg.text());
      }
    });

    await login(page);
    await goToInterviewSchedule(page);

    const periodLabel = page.locator('.fc-toolbar-title');
    const now = new Date();
    const nextBtn = page.locator('button[aria-label="next"]');
    const prevBtn = page.locator('button[aria-label="prev"]');

    // 1. "next" x12 crosses a year boundary correctly; no broken grid rendering.
    for (let i = 0; i < 12; i += 1) {
      await nextBtn.click();
    }
    const twelveMonthsAhead = new Date(now.getFullYear(), now.getMonth() + 12, 1);
    await expect(periodLabel).toContainText(monthYear(twelveMonthsAhead));
    await expect(page.locator('.fc-daygrid-day')).toHaveCount(42);

    // 2. "prev" x24 lands 12 months before the original starting point.
    for (let i = 0; i < 24; i += 1) {
      await prevBtn.click();
    }
    const twelveMonthsBefore = new Date(now.getFullYear(), now.getMonth() - 12, 1);
    await expect(periodLabel).toContainText(monthYear(twelveMonthsBefore));
    await expect(page.locator('.fc-daygrid-day')).toHaveCount(42);
    expect(consoleErrors).toEqual([]);

    // 3. "today" returns cleanly to the current month regardless of the deep navigation.
    const todayBtn = page.getByRole('button', { name: 'today' });
    if (!(await todayBtn.isDisabled())) {
      await todayBtn.click();
    }
    await expect(periodLabel).toContainText(monthYear(now));
  });
});
