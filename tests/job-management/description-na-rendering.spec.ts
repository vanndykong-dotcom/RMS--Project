// spec: specs/job-management-test-plan.md (JOB01-3)
// exploratory: "QA Automation" (and "Marketing Manager-VK") both render the Description cell
// literally as "N/A" when unset.

import { test, expect } from '@playwright/test';
import { login, goToJobDescriptions, getJobRowByExactTitle } from '../helpers/candidate-helpers';

test.describe('RMS-JOB-01: View list of job descriptions', () => {
  test('JOB01-3. "N/A" description rendering', async ({ page }) => {
    await login(page);
    await goToJobDescriptions(page);

    const row = getJobRowByExactTitle(page, 'QA Automation');
    const descriptionCell = row.locator('td').nth(2);
    await expect(descriptionCell).toHaveText('N/A');
  });
});
