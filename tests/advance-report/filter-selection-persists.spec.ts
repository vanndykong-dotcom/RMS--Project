// spec: specs/advance-report-test-plan.md (RPT04-3)
// exploratory: confirmed live - selecting STAFF then closing via Escape and reopening still
// shows STAFF checked, not reset to ALL.

import { test, expect } from '@playwright/test';
import { login, goToAdvanceReport } from '../helpers/candidate-helpers';

test.describe('RMS-RPT-04: Apply additional filters', () => {
  test('RPT04-3. Filter selection persists when reopening the dropdown', async ({ page }) => {
    await login(page);
    await goToAdvanceReport(page);

    await page.getByText('Filter', { exact: true }).first().click();
    await page.getByText('STAFF', { exact: true }).click();
    await page.keyboard.press('Escape');

    await page.getByText('Filter', { exact: true }).first().click();
    const checkedLabel = await page.evaluate(() => {
      const radios = Array.from(document.querySelectorAll('input[type="radio"]'));
      const checked = radios.find((r) => (r as HTMLInputElement).checked);
      return checked?.closest('mat-radio-button')?.textContent?.trim();
    });
    expect(checkedLabel).toBe('STAFF');
  });
});
