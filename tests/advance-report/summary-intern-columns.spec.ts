// spec: specs/advance-report-test-plan.md (RPT02-4)
// exploratory: resolves the story's open question - same 8-column layout as Summary Full
// Staff. At the time of the original exploratory pass no seeded intern data fell in the
// default date window, producing a naturally occurring "No matching records found" negative
// case; re-verified live now shows one leftover synthetic "QA Automation Test CANDIDATE..."
// row from another suite's create flow instead (see tests/helpers/candidate-helpers.ts). That
// leftover is incidental, not a fixture this suite owns, so this asserts on whichever state
// is actually present (empty-state message xor a real row, consistent with the "Total: N"
// count) rather than hard-coding either one.

import { test, expect } from '@playwright/test';
import { login, goToAdvanceReport } from '../helpers/candidate-helpers';

test.describe('RMS-RPT-02: Switch between report tabs', () => {
  test('RPT02-4. Summary Intern column set and no-data negative case', async ({ page }) => {
    await login(page);
    await goToAdvanceReport(page);

    await page.getByRole('tab', { name: 'Summary Intern' }).click();
    await expect(page.getByText(/INTERNSHIP \(.+ - .+\)/)).toBeVisible();

    const headerRow = page.locator('table thead tr').last();
    const headers = await headerRow.locator('th').allInnerTexts();
    expect(headers).toEqual([
      'No', 'NAME', 'University', 'Number of Candidates', 'Degree', 'Apply For', 'Interview Status', 'Remark',
    ]);

    // Whether intern data falls in the default date window depends on other suites'
    // leftover synthetic candidates (see file header note), so assert on whichever state is
    // actually present rather than hard-coding "no data".
    const totalText = page.getByText(/^Total:\s*\d+$/);
    await expect(totalText).toBeVisible();
    const total = Number((await totalText.innerText()).match(/\d+/)?.[0]);
    if (total === 0) {
      await expect(page.getByText('No matching records found')).toBeVisible();
    } else {
      await expect(page.locator('table tbody tr').first()).toBeVisible();
    }
  });
});
