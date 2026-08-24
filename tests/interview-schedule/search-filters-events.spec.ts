// spec: specs/interview-schedule-test-plan.md (CAL04-2)
// exploratory: baseline 10 pills -> typed "Chhan" -> GET .../interview?...&filter=Chhan
// fired -> 1 pill -> cleared -> 10 pills restored. Search is read-only (no write action),
// so matching against this real seeded candidate is safe per the real-data note.

import { test, expect } from '@playwright/test';
import { login, goToInterviewSchedule, searchCalendar } from '../helpers/candidate-helpers';

test.describe('RMS-CAL-04: Search interviews and candidates', () => {
  test('CAL04-2. Search filters visible events (happy path)', async ({ page }) => {
    await login(page);
    await goToInterviewSchedule(page);

    // The event pills load asynchronously after navigation; without waiting for at least one
    // to render, this baseline count can race the initial fetch and come back 0.
    const pills = page.locator('.custom-calendar-event');
    await expect(pills.first()).toBeVisible();
    const baselineCount = await pills.count();
    expect(baselineCount).toBeGreaterThan(0);

    await searchCalendar(page, 'Chhan');
    const filteredCount = await pills.count();
    expect(filteredCount).toBeGreaterThan(0);
    expect(filteredCount).toBeLessThan(baselineCount);

    await searchCalendar(page, '');
    await expect(pills).toHaveCount(baselineCount);
  });
});
