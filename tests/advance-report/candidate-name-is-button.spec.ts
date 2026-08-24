// spec: specs/advance-report-test-plan.md (RPT07-1)
// exploratory: corrects the story's assumption - the "Full Name" cell renders
// <button class="candidate-name-button">, not an <a>.

import { test, expect } from '@playwright/test';
import { login, goToAdvanceReport } from '../helpers/candidate-helpers';

test.describe('RMS-RPT-07: Open a candidate profile from the report', () => {
  test('RPT07-1. Full Name renders as a button, not a hyperlink', async ({ page }) => {
    await login(page);
    await goToAdvanceReport(page);

    const nameButton = page.locator('button.candidate-name-button').first();
    await expect(nameButton).toBeVisible();
    const tagName = await nameButton.evaluate((el) => el.tagName.toLowerCase());
    expect(tagName).toBe('button');

    await expect(page.getByRole('link', { name: /Vannyda PICH/i })).toHaveCount(0);
  });
});
