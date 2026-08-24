// spec: specs/advance-report-test-plan.md (RPT03-2)
// exploratory: clicking "Today" + Generate updated the banner to a single-day window and the
// row set re-evaluated correctly. Banner dates render as "D Mon YYYY" (e.g. "24 Aug 2026"),
// computed here relative to the current date rather than hardcoded, per the lesson already
// captured in pickFutureCalendarDate().
//
// Automation note: clicking Generate closes the date-range panel, but its cdk-overlay-backdrop
// lingers in the DOM for a moment after the banner/table have already re-rendered - reopening
// the pill immediately after (for the second preset) can race that teardown and the table's
// own re-render, intermittently timing out with a table header intercepting the click. Waiting
// for the backdrop to fully detach before reopening the pill avoids the race.

import { test, expect } from '@playwright/test';
import { login, goToAdvanceReport } from '../helpers/candidate-helpers';

function formatBannerDate(d: Date) {
  return `${d.getDate()} ${d.toLocaleString('en-US', { month: 'short' })} ${d.getFullYear()}`;
}

test.describe('RMS-RPT-03: Filter by date range', () => {
  test('RPT03-2. Selecting a preset updates both banner and table', async ({ page }) => {
    await login(page);
    await goToAdvanceReport(page);

    const dateRangePill = page.getByText(/[A-Za-z]{3}\s+\d{1,2}.+[A-Za-z]{3}\s+\d{1,2}/).first();
    const todayLabel = formatBannerDate(new Date());
    const generateButton = page.getByRole('button', { name: 'Generate' });

    // 1. "Today" preset narrows the window to a single day.
    await dateRangePill.click();
    await page.getByRole('button', { name: 'Today', exact: true }).click();
    if (await generateButton.isVisible().catch(() => false)) await generateButton.click();

    await expect(
      page.getByText(new RegExp(`FOLLOWING-UP QUALIFIED CANDIDATES \\(${todayLabel} - ${todayLabel}\\)`)),
    ).toBeVisible();
    // Let the closed panel's own backdrop/re-render finish settling before reopening the pill -
    // see file header note.
    await page.locator('.cdk-overlay-backdrop').first().waitFor({ state: 'detached', timeout: 5000 }).catch(() => {});

    // 2. "Last 7 Days" preset updates the window again.
    await dateRangePill.click();
    await page.getByRole('button', { name: 'Last 7 Days', exact: true }).click();
    if (await generateButton.isVisible().catch(() => false)) await generateButton.click();
    await expect(page.getByText(/FOLLOWING-UP QUALIFIED CANDIDATES \(.+ - .+\)/)).toBeVisible();
  });
});
