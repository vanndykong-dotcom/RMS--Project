// spec: specs/interview-schedule-test-plan.md (CAL06-3)
// exploratory: Month/Week views re-confirmed the exact same color for the exact same pinned
// event; Day view (which jumps to the first day of the displayed week/month by default, not
// the specific pinned day - see CAL02-2) wasn't independently re-sampled for that same pill.
// This test therefore only asserts equality for whichever statuses happen to still be visible
// after each view switch, rather than depending on one specific real candidate/date existing.

import { test, expect } from '@playwright/test';
import { login, goToInterviewSchedule } from '../helpers/candidate-helpers';

const STATUS_CLASSES = ['new-request', 'pass', 'following'];

async function colorsByStatus(page: import('@playwright/test').Page) {
  const colors: Record<string, string> = {};
  for (const cls of STATUS_CLASSES) {
    const pill = page.locator(`.custom-calendar-event.${cls}`).first();
    if (await pill.count() > 0 && await pill.isVisible().catch(() => false)) {
      colors[cls] = await pill.evaluate((el) => getComputedStyle(el).color);
    }
  }
  return colors;
}

test.describe('RMS-CAL-06: Interview status at a glance', () => {
  test('CAL06-3. Status colors are consistent across Day/Week/Month views', async ({ page }) => {
    await login(page);
    await goToInterviewSchedule(page);

    // The event pills load asynchronously after navigation; without waiting for at least one
    // to render, colorsByStatus() can sample too early and find zero pills for any status.
    await expect(page.locator('.custom-calendar-event').first()).toBeVisible();

    // 1. Record computed colors per status present in Month view.
    const monthColors = await colorsByStatus(page);
    expect(Object.keys(monthColors).length).toBeGreaterThan(0);

    // 2. Switch to Week view - for any status still visible in this narrower range, the
    // color must be unchanged (colors are applied via static CSS classes, not view-scoped).
    await page.getByRole('button', { name: 'Week', exact: true }).click();
    const weekColors = await colorsByStatus(page);
    for (const [status, color] of Object.entries(weekColors)) {
      if (monthColors[status]) expect(color).toBe(monthColors[status]);
    }

    // 3. Switch to Day view - same check, tolerating that the default day shown may not
    // contain any of the previously-seen statuses.
    await page.getByRole('button', { name: 'Day', exact: true }).click();
    const dayColors = await colorsByStatus(page);
    for (const [status, color] of Object.entries(dayColors)) {
      if (monthColors[status]) expect(color).toBe(monthColors[status]);
    }
  });
});
