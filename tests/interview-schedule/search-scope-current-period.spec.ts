// spec: specs/interview-schedule-test-plan.md (CAL04-5)
// exploratory: filtered request for "Chhan" in Aug 2026 carried startDate=01-08-2026&
// endDate=01-09-2026; after navigating to Sep 2026, the same search fired startDate=
// 01-09-2026&endDate=01-10-2026 and returned 0 pills - confirms per-period, not global,
// filtering (resolves the story's open question).

import { test, expect } from '@playwright/test';
import { login, goToInterviewSchedule } from '../helpers/candidate-helpers';

function ddmmyyyy(date: Date) {
  const d = String(date.getDate()).padStart(2, '0');
  const m = String(date.getMonth() + 1).padStart(2, '0');
  return `${d}-${m}-${date.getFullYear()}`;
}

test.describe('RMS-CAL-04: Search interviews and candidates', () => {
  test('CAL04-5. Search scope is the current period only', async ({ page }) => {
    await login(page);
    await goToInterviewSchedule(page);

    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const nextMonthStart = new Date(now.getFullYear(), now.getMonth() + 1, 1);

    // 1. The filtered request's startDate/endDate match the currently-displayed month.
    const search = page.getByPlaceholder('Search interviews, candidates...');
    const [firstRequest] = await Promise.all([
      page.waitForRequest((req) => req.method() === 'GET' && new URL(req.url()).searchParams.get('filter') === 'Chhan'),
      search.fill('Chhan'),
    ]);
    const firstUrl = new URL(firstRequest.url());
    expect(firstUrl.searchParams.get('startDate')).toBe(ddmmyyyy(monthStart));
    expect(firstUrl.searchParams.get('endDate')).toBe(ddmmyyyy(nextMonthStart));

    // 2. Navigate to a different month; the same search does not cross periods to find a
    // match that only exists in the original month.
    await search.fill('');
    await page.waitForTimeout(500);
    await page.locator('button[aria-label="next"]').click();

    const [secondRequest] = await Promise.all([
      page.waitForRequest((req) => req.method() === 'GET' && new URL(req.url()).searchParams.get('filter') === 'Chhan'),
      search.fill('Chhan'),
    ]);
    const secondUrl = new URL(secondRequest.url());
    expect(secondUrl.searchParams.get('startDate')).toBe(ddmmyyyy(nextMonthStart));
    await expect(page.locator('.custom-calendar-event')).toHaveCount(0);
  });
});
