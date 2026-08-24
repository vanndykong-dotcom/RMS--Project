// spec: specs/interview-schedule-test-plan.md (CAL02-1)
// exploratory: active state is CSS class `fc-button-active`, NOT aria-pressed (always null
// - see Observation #1 / Insight #2).

import { test, expect } from '@playwright/test';
import { login, goToInterviewSchedule } from '../helpers/candidate-helpers';

async function isActive(button: import('@playwright/test').Locator) {
  return button.evaluate((el) => el.classList.contains('fc-button-active'));
}

test.describe('RMS-CAL-02: Day/Week/Month toggle', () => {
  test('CAL02-1. Toggle buttons visible and active state indicated', async ({ page }) => {
    await login(page);
    await goToInterviewSchedule(page);

    const dayBtn = page.getByRole('button', { name: 'Day', exact: true });
    const weekBtn = page.getByRole('button', { name: 'Week', exact: true });
    const monthBtn = page.getByRole('button', { name: 'Month', exact: true });

    // 1. All three visible; Month active on initial load.
    await expect(dayBtn).toBeVisible();
    await expect(weekBtn).toBeVisible();
    await expect(monthBtn).toBeVisible();
    expect(await isActive(monthBtn)).toBe(true);
    expect(await isActive(weekBtn)).toBe(false);
    expect(await isActive(dayBtn)).toBe(false);

    // 2. Click "Week" - active state moves to Week, off Month.
    await weekBtn.click();
    expect(await isActive(weekBtn)).toBe(true);
    expect(await isActive(monthBtn)).toBe(false);

    // 3. Click "Day" - active state moves to Day; grid re-renders to a single-day layout.
    await dayBtn.click();
    expect(await isActive(dayBtn)).toBe(true);
    expect(await isActive(weekBtn)).toBe(false);
    // Day view renders exactly one day column header.
    await expect(page.locator('.fc-col-header-cell')).toHaveCount(1);
  });
});
