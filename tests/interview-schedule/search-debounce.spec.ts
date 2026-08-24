// spec: specs/interview-schedule-test-plan.md (CAL04-4)
// exploratory: 4 keystrokes (pressSequentially, 50ms delay) produced only 1 request for the
// completed term - some run-to-run variance is expected with a debounced input, so this
// asserts "fewer requests than keystrokes" rather than an exact count.

import { test, expect } from '@playwright/test';
import { login, goToInterviewSchedule } from '../helpers/candidate-helpers';

test.describe('RMS-CAL-04: Search interviews and candidates', () => {
  test('CAL04-4. Search is debounced', async ({ page }) => {
    await login(page);
    await goToInterviewSchedule(page);

    // The event pills load asynchronously after navigation; without waiting for at least one
    // to render, this baseline count can race the initial fetch and come back 0.
    const pillsLocator = page.locator('.custom-calendar-event');
    await expect(pillsLocator.first()).toBeVisible();
    const baselineCount = await pillsLocator.count();

    const filterRequests: string[] = [];
    page.on('request', (req) => {
      if (req.method() !== 'GET') return;
      const url = new URL(req.url());
      if (url.pathname.includes('/api/v1/interview') && url.searchParams.has('filter')) {
        filterRequests.push(url.searchParams.get('filter') ?? '');
      }
    });

    const term = 'Chhan';
    const search = page.getByPlaceholder('Search interviews, candidates...');
    await search.pressSequentially(term, { delay: 50 });

    // 1. Fewer requests fired than characters typed - confirms debounce, not per-keystroke.
    await page.waitForTimeout(1500);
    expect(filterRequests.length).toBeLessThan(term.length);
    expect(filterRequests.length).toBeGreaterThan(0);

    // 2. The final settled request reflects the complete typed term, and the pill list
    // has settled to match it (narrower than the unfiltered baseline).
    expect(filterRequests[filterRequests.length - 1]).toBe(term);
    const settledCount = await page.locator('.custom-calendar-event').count();
    expect(settledCount).toBeLessThan(baselineCount);
    expect(settledCount).toBeGreaterThan(0);
  });
});
