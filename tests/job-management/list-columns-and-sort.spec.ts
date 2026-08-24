// spec: specs/job-management-test-plan.md (JOB01-1)
// exploratory: thead th reads exactly No., Title, Description, Status, Created At, Action;
// row 0 is newest-created ("QA Automation", 19/Aug/2026) and the last row is oldest ("Java
// Backend Developer", 29/Apr/2025), confirming default sort is newest-created-first. Total
// renders as literal "Total: {n}" text below the table via a shared <app-aw-pagination>.

import { test, expect } from '@playwright/test';
import { login, goToJobDescriptions } from '../helpers/candidate-helpers';

// "Created At" cells render like "19/Aug/2026 01:21 PM" - parsed here only to compare
// relative ordering, not to assert an exact absolute value.
function parseCreatedAt(text: string): Date {
  const match = text.trim().match(/(\d{1,2})\/(\w{3})\/(\d{4})\s+(\d{1,2}):(\d{2})\s*(AM|PM)/i);
  if (!match) throw new Error(`Unrecognized "Created At" format: "${text}"`);
  const [, day, monStr, year, hourStr, minute, ampm] = match;
  const months = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];
  const month = months.indexOf(monStr.toLowerCase());
  let hour = parseInt(hourStr, 10) % 12;
  if (ampm.toUpperCase() === 'PM') hour += 12;
  return new Date(Number(year), month, Number(day), hour, Number(minute));
}

test.describe('RMS-JOB-01: View list of job descriptions', () => {
  test('JOB01-1. Table columns, sort order, and total count on load', async ({ page }) => {
    await login(page);
    await goToJobDescriptions(page);

    const breadcrumb = page.locator('[class*="bread"]').first();
    await expect(breadcrumb).toContainText('Dashboard');
    await expect(breadcrumb).toContainText('Setting');
    await expect(breadcrumb).toContainText('List Job Description');

    // Header cells' raw DOM text carries incidental leading/trailing whitespace (e.g.
    // " TITLE ") and inconsistent casing (all-caps for most headers, but "Action" is title-case
    // in the raw DOM even though CSS text-transform renders it visually as "ACTION" too) -
    // confirmed live. Compare trimmed + uppercased to be tolerant of both without over-asserting
    // on that casing inconsistency.
    const headers = page.locator('table thead th');
    const headerTexts = (await headers.allTextContents()).map((t) => t.trim().toUpperCase());
    expect(headerTexts).toEqual(['NO.', 'TITLE', 'DESCRIPTION', 'STATUS', 'CREATED AT', 'ACTION']);

    const rows = page.locator('table tbody tr');
    const rowCount = await rows.count();
    expect(rowCount).toBeGreaterThan(0);

    const createdAtTexts = await page.locator('table tbody tr td:nth-child(5)').allInnerTexts();
    const dates = createdAtTexts.map(parseCreatedAt);
    // Newest-created-first: the first row's date must be >= the last row's date.
    expect(dates[0].getTime()).toBeGreaterThanOrEqual(dates[dates.length - 1].getTime());

    await expect(page.getByText(/^Total:\s*\d+$/)).toBeVisible();
  });
});
