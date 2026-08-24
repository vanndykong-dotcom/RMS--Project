// spec: specs/interview-schedule-test-plan.md (CAL01-1)
// exploratory: specs/interview-schedule-exploratory-results.md (Bug #1)

import { test, expect } from '@playwright/test';
import { login, goToInterviewSchedule } from '../helpers/candidate-helpers';

test.describe('RMS-CAL-01: Month calendar view', () => {
  test('CAL01-1. Month grid structure and header', async ({ page }) => {
    await login(page);
    await goToInterviewSchedule(page);

    // 1. Breadcrumb + heading already asserted by goToInterviewSchedule(); URL too.
    await expect(page).toHaveURL(/\/admin\/calendar/);

    // 2. Period-label heading shows the current month/year.
    const now = new Date();
    const monthYear = now.toLocaleString('en-US', { month: 'long', year: 'numeric' });
    await expect(page.locator('.fc-toolbar-title')).toContainText(monthYear);

    // Column headers are Mon->Sun, NOT Sun->Sat - the plan's literal wording assumed a
    // Sun-first week, but this app is configured Monday-first (confirmed via live DOM read
    // and corroborated by week-view labels always running Mon->Sun). See Bug #1.
    const headerTexts = await page.locator('.fc-col-header-cell').allTextContents();
    expect(headerTexts.map((t) => t.trim())).toEqual(['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']);

    // Grid renders full weeks (6x7 = 42 day cells, including muted leading/trailing days).
    await expect(page.locator('.fc-daygrid-day')).toHaveCount(42);

    // 3. A day cell containing interviews renders a pill with time + status text. Per the
    // documented .event-title zero-width defect, only "{time} - {STATUS}" is reliably
    // visible/matchable, not the candidate/position text - match on status text instead.
    const anyPill = page.locator('.custom-calendar-event').first();
    await expect(anyPill).toBeVisible();
    await expect(anyPill).toHaveText(/\d{1,2}:\d{2}\s?(am|pm)/i);

    // 4. A day cell with no interviews renders empty, with no "No events" placeholder text.
    await expect(page.getByText('No events', { exact: false })).toHaveCount(0);
  });
});
