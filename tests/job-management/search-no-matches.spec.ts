// spec: specs/job-management-test-plan.md (JOB02-4)
// exploratory: filter=zzzznotfound12345 -> total:0, "No matching records found"; clearing
// restores the full 11-row list. Lowercase, to avoid confounding with the case-sensitivity
// defect (JOB02-3).

import { test, expect } from '@playwright/test';
import { login, goToJobDescriptions, searchJobDescriptions } from '../helpers/candidate-helpers';

test.describe('RMS-JOB-02: Search job descriptions', () => {
  test('JOB02-4. Search matching nothing', async ({ page }) => {
    await login(page);
    await goToJobDescriptions(page);

    await searchJobDescriptions(page, 'zzzznotfound12345');
    await expect(page.getByText('No matching records found')).toBeVisible();
    await expect(page.getByText(/^Total:\s*0$/)).toBeVisible();

    await searchJobDescriptions(page, '');
    await expect(page.locator('table tbody tr')).toHaveCount(11);
    await expect(page.getByText(/^Total:\s*11$/)).toBeVisible();
  });
});
