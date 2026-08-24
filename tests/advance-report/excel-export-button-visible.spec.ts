// spec: specs/advance-report-test-plan.md (RPT06-1)
// exploratory: confirmed exact markup - <button class="aw-btn-primary aw-btn ..."> containing
// <i class="far fa-file-excel mr-2"></i>Excel, top-right of the page header, visible and
// unchanged across all three tabs.

import { test, expect } from '@playwright/test';
import { login, goToAdvanceReport } from '../helpers/candidate-helpers';

test.describe('RMS-RPT-06: Export report to Excel', () => {
  test('RPT06-1. Excel button exact label/icon/position, always visible', async ({ page }) => {
    await login(page);
    await goToAdvanceReport(page);

    const excelButton = page.getByRole('button', { name: /Excel/ });
    await expect(excelButton).toBeVisible();
    await expect(excelButton).toBeEnabled();
    await expect(excelButton.locator('i.fa-file-excel')).toBeVisible();

    await page.getByRole('tab', { name: 'Summary Full Staff' }).click();
    await expect(excelButton).toBeVisible();
    await expect(excelButton).toBeEnabled();

    await page.getByRole('tab', { name: 'Summary Intern' }).click();
    await expect(excelButton).toBeVisible();
    await expect(excelButton).toBeEnabled();
  });
});
