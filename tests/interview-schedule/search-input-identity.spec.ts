// spec: specs/interview-schedule-test-plan.md (CAL04-1)
// exploratory: two distinct search boxes exist on this page - the global topbar search
// (placeholder="Search") is unrelated to the calendar's own search
// (placeholder="Search interviews, candidates..."). Confirmed no collision between the two.

import { test, expect } from '@playwright/test';
import { login, goToInterviewSchedule } from '../helpers/candidate-helpers';

test.describe('RMS-CAL-04: Search interviews and candidates', () => {
  test('CAL04-1. Search input identity and placeholder', async ({ page }) => {
    await login(page);
    await goToInterviewSchedule(page);

    const calendarSearch = page.getByPlaceholder('Search interviews, candidates...');
    await expect(calendarSearch).toHaveCount(1);
    await expect(calendarSearch).toBeVisible();

    // The global topbar search box is a distinct element with a different placeholder.
    const globalSearch = page.getByPlaceholder('Search', { exact: true });
    await expect(globalSearch).toHaveCount(1);
  });
});
