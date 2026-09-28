// spec: specs/job-management-test-plan.md (JOB02-2)
// exploratory: typing fires a debounced GET .../jobDescription?...&filter={term} (confirmed
// server-side, pageSize=15); "automation" (lowercase) matched 3 rows live ("QA Automation",
// "Software Testing Automation", "Intern Automation Test"). Clearing restores the full
// unfiltered/paginated list.

import { test, expect } from '@playwright/test';
import { login, goToJobDescriptions, searchJobDescriptions, readJobListRowCount } from '../helpers/candidate-helpers';

test.describe('RMS-JOB-02: Search job descriptions', () => {
  test('JOB02-2. Search is server-side and filters without a full page reload', async ({ page }) => {
    await login(page);
    await goToJobDescriptions(page);
    // The real-row count drifts on this shared server (11 at planning, 10 on 2026-09-28 after
    // two real rows were removed outside this suite) - compare against the count on load.
    const initialRowCount = await readJobListRowCount(page);

    const urlBefore = page.url();
    await searchJobDescriptions(page, 'automation');
    expect(page.url()).toBe(urlBefore);

    await expect(page.locator('table tbody tr')).toHaveCount(3);
    await expect(page.getByText(/^Total:\s*3$/)).toBeVisible();

    await searchJobDescriptions(page, '');
    await expect(page.locator('table tbody tr')).toHaveCount(initialRowCount);
    await expect(page.getByText(new RegExp(`^Total:\\s*${initialRowCount}$`))).toBeVisible();
  });
});
