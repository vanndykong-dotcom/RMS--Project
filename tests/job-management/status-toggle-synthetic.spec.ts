// spec: specs/job-management-test-plan.md (JOB04-2)
// exploratory: full create -> toggle off -> toggle on -> delete+confirm cycle was confirmed
// safe live, entirely against a synthetic row. SAFETY: this is the one scenario in the whole
// module requiring a real write - it must never target any of the 11 real rows. The toggle's
// underlying <input type="checkbox"> is not directly clickable - click the visible
// `label.switch` wrapper instead (matches the plan's own note that getByRole('checkbox') finds
// nothing), then re-read the input's checked state to verify.

import { test, expect } from '@playwright/test';
import {
  login, goToJobDescriptions, createSyntheticJobDescription, getJobRowByExactTitle, deleteJobDescriptionRow,
} from '../helpers/candidate-helpers';

test.describe('RMS-JOB-04: Toggle job description active status', () => {
  test('JOB04-2. Toggling a synthetic job description\'s status', async ({ page }) => {
    await login(page);
    await goToJobDescriptions(page);

    const title = await createSyntheticJobDescription(page, { titleSuffix: 'JOB04-2' });
    const row = getJobRowByExactTitle(page, title);

    try {
      const toggleInput = row.locator('app-aw-slider-toggle input[type="checkbox"]');
      const toggleLabel = row.locator('app-aw-slider-toggle label.switch, app-aw-slider-toggle .switch').first();

      // New job descriptions default to Active.
      await expect(toggleInput).toBeChecked();

      await toggleLabel.click();
      await expect(toggleInput).not.toBeChecked();
      // No full reload - the URL stays put and the row itself is still present.
      await expect(page).toHaveURL(/\/admin\/setting\/job$/);
      await expect(row).toBeVisible();

      await toggleLabel.click();
      await expect(toggleInput).toBeChecked();
    } finally {
      // Cleanup: always remove the synthetic row, even if an assertion above failed, so no
      // orphaned "QA Automation Job Test..." row is left in the real list.
      await deleteJobDescriptionRow(row);
      await expect(getJobRowByExactTitle(page, title)).toHaveCount(0);
    }
  });
});
