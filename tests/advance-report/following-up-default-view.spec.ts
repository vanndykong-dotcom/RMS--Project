// spec: specs/advance-report-test-plan.md (RPT01-1)
// exploratory: CONFIRMED BUG - the "Recruit + OM + HR + TL" column displays the row's
// Interview Date value (e.g. "24/Aug/26 10:28 AM"), never a composite score - confirmed
// across all 3 seeded Following-Up rows (specs/advance-report-exploratory-results.md, Bug #1).
// This test documents that current (defective) behavior rather than asserting a fictional
// "correct" score value.

import { test, expect } from '@playwright/test';
import { login, goToAdvanceReport } from '../helpers/candidate-helpers';

test.describe('RMS-RPT-01: View Following-Up Qualified Candidates report', () => {
  test('RPT01-1. Default tab, banner text, and column structure on load', async ({ page }) => {
    await login(page);
    await goToAdvanceReport(page);

    // 1. Sub-heading is visible alongside the page heading.
    await expect(page.getByText('List candidates advance report by filter')).toBeVisible();

    // 2. "Following Up Report" is the active tab on load, with no click needed.
    const followingUpTab = page.getByRole('tab', { name: 'Following Up Report' });
    await expect(followingUpTab).toHaveAttribute('aria-selected', 'true');
    await expect(page.getByRole('tab', { name: 'Summary Full Staff' })).toHaveAttribute('aria-selected', 'false');
    await expect(page.getByRole('tab', { name: 'Summary Intern' })).toHaveAttribute('aria-selected', 'false');

    // 3. Banner row above the table matches the confirmed format, with "Interview Date" and
    // "Remark" as separate labels to its right (Remark rendered in red).
    await expect(page.getByText(/FOLLOWING-UP QUALIFIED CANDIDATES \(.+ - .+\)/)).toBeVisible();
    await expect(page.getByText('Interview Date', { exact: true })).toBeVisible();
    await expect(page.getByText('Remark', { exact: true }).first()).toBeVisible();

    // 4. Exactly 14 named columns in order, plus one unnamed trailing column for the eye icon.
    const headerRow = page.locator('table thead tr').nth(1);
    const headers = await headerRow.locator('th').allInnerTexts();
    expect(headers.slice(0, 14)).toEqual([
      'No', 'Full Name', 'Gender', 'Age', 'School', 'School Year', 'Apply For', 'Company',
      'Experience', 'Status', 'Recruit + OM + HR + TL', 'Quiz', 'Coding', 'Grade',
    ]);
    expect(headers[14]?.trim()).toBe('');

    // 5. CONFIRMED BUG (see exploratory-results.md "Bug #1"): the "Recruit + OM + HR + TL"
    // column's actual displayed value is a timestamp in "DD/Mon/YY HH:MM AM/PM" format (or "-"
    // if no interview date is recorded), never a distinct composite score - this documents the
    // current defective behavior rather than the story's assumed semantics.
    const firstDataRow = page.locator('table tbody tr').first();
    const compositeScoreCell = firstDataRow.locator('td').nth(10);
    // toHaveText() normalizes internal whitespace but not leading/trailing whitespace, and the
    // live cell renders with surrounding padding (e.g. " 24/Aug/26 10:28 AM ") - trim the actual
    // text ourselves rather than anchoring the regex against the untrimmed string.
    const compositeScoreText = (await compositeScoreCell.innerText()).trim();
    expect(compositeScoreText).toMatch(/^(-|\d{1,2}\/[A-Za-z]{3}\/\d{2}\s+\d{1,2}:\d{2}\s*[AP]M)$/);
  });
});
