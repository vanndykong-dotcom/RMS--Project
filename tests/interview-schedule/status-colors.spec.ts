// spec: specs/interview-schedule-test-plan.md (CAL06-1)
// exploratory / open item #1: IN PROGRESS and FOLLOWING UP both render under the identical
// CSS class `.following` and identical color rgb(255,153,0) - this test asserts that
// confirmed *current* (shared) behavior, not a bug, per the plan's explicit instruction.

import { test, expect } from '@playwright/test';
import { login, goToInterviewSchedule } from '../helpers/candidate-helpers';

test.describe('RMS-CAL-06: Interview status at a glance', () => {
  test('CAL06-1. Status colors match the confirmed model, text label always present', async ({ page }) => {
    await login(page);
    await goToInterviewSchedule(page);

    // 1. NEW REQUEST - purple, text label present (not color-only).
    const newRequestPill = page.locator('.custom-calendar-event.new-request').first();
    await expect(newRequestPill).toBeVisible();
    await expect(newRequestPill).toContainText('NEW REQUEST');
    expect(await newRequestPill.evaluate((el) => getComputedStyle(el).color)).toBe('rgb(149, 75, 151)');

    // 2. PASSED - blue.
    const passedPill = page.locator('.custom-calendar-event.pass').first();
    await expect(passedPill).toBeVisible();
    await expect(passedPill).toContainText('PASSED');
    expect(await passedPill.evaluate((el) => getComputedStyle(el).color)).toBe('rgb(0, 82, 204)');

    // 3. IN PROGRESS and FOLLOWING UP both share the `.following` class and orange color.
    const followingPills = page.locator('.custom-calendar-event.following');
    const followingCount = await followingPills.count();
    expect(followingCount).toBeGreaterThan(0);
    for (let i = 0; i < followingCount; i += 1) {
      const pill = followingPills.nth(i);
      const text = await pill.innerText();
      expect(/IN PROGRESS|FOLLOWING UP/.test(text)).toBe(true);
      expect(await pill.evaluate((el) => getComputedStyle(el).color)).toBe('rgb(255, 153, 0)');
    }
  });
});
