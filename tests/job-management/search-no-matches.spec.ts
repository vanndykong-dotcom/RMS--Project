// spec: specs/job-management-test-plan.md (JOB02-4)
// exploratory: filter=zzzznotfound12345 -> total:0, "No matching records found"; clearing
// restores the full 11-row list. Lowercase, to avoid confounding with the case-sensitivity
// defect (JOB02-3).

import { test, expect } from '@playwright/test';
import { login, goToJobDescriptions, searchJobDescriptions, readJobListRowCount } from '../helpers/candidate-helpers';

test.describe('RMS-JOB-02: Search job descriptions', () => {
  test('JOB02-4. Search matching nothing', async ({ page }) => {
    await login(page);
    await goToJobDescriptions(page);
    // The real-row count drifts on this shared server (11 at planning, 10 on 2026-09-28 after
    // two real rows were removed outside this suite) - compare against the count on load.
    const initialRowCount = await readJobListRowCount(page);

    await searchJobDescriptions(page, 'zzzznotfound12345');
    await expect(page.getByText('No matching records found')).toBeVisible();
    await expect(page.getByText(/^Total:\s*0$/)).toBeVisible();

    await searchJobDescriptions(page, '');
    await expect(page.locator('table tbody tr')).toHaveCount(initialRowCount);
    await expect(page.getByText(new RegExp(`^Total:\\s*${initialRowCount}$`))).toBeVisible();
  });
});
