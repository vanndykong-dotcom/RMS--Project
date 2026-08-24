// spec: specs/advance-report-test-plan.md (RPT04-1)
// exploratory: resolves the story's open question - not a Position/Status/Company/School
// multi-field panel, just a simple 3-option radio group (ALL, INTERN, STAFF), ALL selected by
// default. Reading the checked state directly off the radio input (insight #4) is more
// reliable than scoping through mat-radio-button/[class*="radio"] alone.

import { test, expect } from '@playwright/test';
import { login, goToAdvanceReport } from '../helpers/candidate-helpers';

test.describe('RMS-RPT-04: Apply additional filters', () => {
  test('RPT04-1. Filter dropdown fields', async ({ page }) => {
    await login(page);
    await goToAdvanceReport(page);

    await page.getByText('Filter', { exact: true }).first().click();

    await expect(page.getByText('ALL', { exact: true })).toBeVisible();
    await expect(page.getByText('INTERN', { exact: true })).toBeVisible();
    await expect(page.getByText('STAFF', { exact: true })).toBeVisible();

    const checkedLabel = await page.evaluate(() => {
      const radios = Array.from(document.querySelectorAll('input[type="radio"]'));
      const checked = radios.find((r) => (r as HTMLInputElement).checked);
      return checked?.closest('mat-radio-button')?.textContent?.trim();
    });
    expect(checkedLabel).toBe('ALL');
  });
});
