// spec: specs/interview-schedule-test-plan.md (CAL04-3)
// exploratory / open item #2: a no-match search shows 0 pills with NO explicit empty-state
// message - documented current behavior, not treated as a defect without design/PM sign-off.

import { test, expect } from '@playwright/test';
import { login, goToInterviewSchedule, searchCalendar } from '../helpers/candidate-helpers';

test.describe('RMS-CAL-04: Search interviews and candidates', () => {
  test('CAL04-3. Search with no matches (negative/edge case)', async ({ page }) => {
    await login(page);
    await goToInterviewSchedule(page);

    // The event pills load asynchronously after navigation; without waiting for at least one
    // to render, this baseline count can race the initial fetch and come back 0.
    const pills = page.locator('.custom-calendar-event');
    await expect(pills.first()).toBeVisible();
    const baselineCount = await pills.count();
    expect(baselineCount).toBeGreaterThan(0);

    await searchCalendar(page, 'zzzznotfound12345');
    await expect(pills).toHaveCount(0);
    // Documents open item #2: no "no results"/empty-state message is rendered.
    await expect(page.getByText(/no result/i)).toHaveCount(0);

    await searchCalendar(page, '');
    await expect(pills).toHaveCount(baselineCount);
  });
});
