// spec: specs/interview-schedule-test-plan.md (CAL07-1)
// exploratory: resolves open item #4 - DOM is <a href="/admin">Dashboard</a>,
// <a href="/admin/calendar">Calendar</a>, <a>List calendar</a> (no href - not clickable).
// "Calendar" is a genuinely separate, functional link, not a dead segment.

import { test, expect } from '@playwright/test';
import { login, goToInterviewSchedule } from '../helpers/candidate-helpers';

test.describe('RMS-CAL-07: Breadcrumb navigation', () => {
  test('CAL07-1. Breadcrumb text and link behavior', async ({ page }) => {
    await login(page);
    await goToInterviewSchedule(page);

    // 1. Breadcrumb text reads "Dashboard > Calendar > List calendar". The live DOM renders
    // this with inconsistent whitespace around the "&gt;" separators (observed: a stray
    // leading space, and no space between "&gt;" and "List calendar") depending on how the
    // separator/text nodes are concatenated, so compare on whitespace-normalized text rather
    // than the raw string.
    const breadcrumb = page.locator('[class*="bread"]').first();
    const breadcrumbText = (await breadcrumb.innerText()).trim().replace(/\s*>\s*/g, ' > ');
    expect(breadcrumbText).toBe('Dashboard > Calendar > List calendar');

    // 2. Click "Dashboard" -> /admin/dashboard.
    await breadcrumb.getByRole('link', { name: 'Dashboard' }).click();
    await expect(page).toHaveURL(/\/admin\/dashboard/);

    // 3. Return, click "Calendar" - a distinct functional link, lands on /admin/calendar too.
    await goToInterviewSchedule(page);
    const breadcrumb2 = page.locator('[class*="bread"]').first();
    const calendarLink = breadcrumb2.getByRole('link', { name: 'Calendar', exact: true });
    await expect(calendarLink).toHaveCount(1);
    await calendarLink.click();
    await expect(page).toHaveURL(/\/admin\/calendar/);

    // 4. "List calendar" (current page segment) is plain text, not a link.
    const breadcrumb3 = page.locator('[class*="bread"]').first();
    await expect(breadcrumb3.getByText('List calendar')).toBeVisible();
    await expect(breadcrumb3.getByRole('link', { name: 'List calendar' })).toHaveCount(0);
  });
});
