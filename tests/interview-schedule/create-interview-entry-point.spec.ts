// spec: specs/interview-schedule-test-plan.md (CAL05-1)
// exploratory: resolves open item #5 - the Day/Week time-grid body scrolls inside its own
// internal .fc-scroller, while the page header holding the button sits outside that scroller,
// so the button never scrolls out of view even in a deliberately short viewport.

import { test, expect } from '@playwright/test';
import { login, goToInterviewSchedule } from '../helpers/candidate-helpers';

test.describe('RMS-CAL-05: Create a new interview (entry point only)', () => {
  test('CAL05-1. Create Interview button visible and always accessible', async ({ page }) => {
    await login(page);
    await goToInterviewSchedule(page);

    const createBtn = page.getByRole('button', { name: 'Create Interview' });
    await expect(createBtn).toBeVisible();
    const monthBox = await createBtn.boundingBox();

    // 2. Remains visible/unchanged across Week and Day views.
    await page.getByRole('button', { name: 'Week', exact: true }).click();
    await expect(createBtn).toBeVisible();

    await page.getByRole('button', { name: 'Day', exact: true }).click();
    await expect(createBtn).toBeVisible();
    const dayBox = await createBtn.boundingBox();
    expect(dayBox?.x).toBeCloseTo(monthBox?.x ?? 0, 0);
    expect(dayBox?.y).toBeCloseTo(monthBox?.y ?? 0, 0);

    // 3. Force a short viewport so the Day time-grid genuinely overflows, then scroll the
    // grid's own internal .fc-scroller to its end - the button lives outside that scroller
    // and should remain reachable regardless.
    await page.setViewportSize({ width: 1280, height: 550 });
    const scroller = page.locator('.fc-scroller').first();
    await scroller.evaluate((el) => { el.scrollTop = el.scrollHeight; });
    await expect(createBtn).toBeVisible();
    await expect(createBtn).toBeInViewport();
  });
});
