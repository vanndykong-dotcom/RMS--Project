// spec: specs/interview-schedule-test-plan.md (CAL02-2)
// exploratory: confirmed live - Aug 2026 -> next x2 -> Oct 2026 -> Week "Sep 28 - Oct 4, 2026"
// -> Day "October 1, 2026" -> Month -> back to Oct 2026 (not reset to today). Week/Day default
// to the 1st of the last-viewed month when no specific day cell was clicked first.

import { test, expect } from '@playwright/test';
import { login, goToInterviewSchedule } from '../helpers/candidate-helpers';

test.describe('RMS-CAL-02: Day/Week/Month toggle', () => {
  test('CAL02-2. Switching views preserves date context', async ({ page }) => {
    await login(page);
    await goToInterviewSchedule(page);

    const periodLabel = page.locator('.fc-toolbar-title');
    const now = new Date();
    const targetMonth = new Date(now.getFullYear(), now.getMonth() + 2, 1);
    const targetMonthYear = targetMonth.toLocaleString('en-US', { month: 'long', year: 'numeric' });

    // 1. "next" x2 reaches the target month, computed relative to today (not hardcoded).
    const nextBtn = page.locator('button[aria-label="next"]');
    await nextBtn.click();
    await nextBtn.click();
    await expect(periodLabel).toContainText(targetMonthYear);

    // 2. Week view shows the week containing the 1st of that month (a day/month abbreviation
    // for the 1st should appear in the label).
    await page.getByRole('button', { name: 'Week', exact: true }).click();
    const targetMonthAbbrev = targetMonth.toLocaleString('en-US', { month: 'short' });
    await expect(periodLabel).toContainText(targetMonthAbbrev);
    await expect(periodLabel).toContainText(String(targetMonth.getFullYear()));

    // 3. Day view then shows the 1st of that month specifically. Day view's label format is
    // "Month D, YYYY" (e.g. "October 1, 2026"), not the Month/Week views' "Month YYYY" - so
    // checking the combined "Month YYYY" string as a substring fails here on the comma/format
    // mismatch. Check the month name, year, and day components separately instead.
    await page.getByRole('button', { name: 'Day', exact: true }).click();
    await expect(periodLabel).toContainText(targetMonth.toLocaleString('en-US', { month: 'long' }));
    await expect(periodLabel).toContainText(String(targetMonth.getFullYear()));
    await expect(periodLabel).toContainText('1,');

    // 4. Back to Month - returns to the navigated-to month, NOT reset to today's month.
    await page.getByRole('button', { name: 'Month', exact: true }).click();
    await expect(periodLabel).toContainText(targetMonthYear);
  });
});
