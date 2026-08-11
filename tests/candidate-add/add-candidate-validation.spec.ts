// spec: specs/candidate-management.md
// seed: tests/seed-candidate.spec.ts

import { test, expect } from '@playwright/test';
import { login, goToCandidateList } from '../helpers/candidate-helpers';

test.describe('B. Add Candidate', () => {
  test('B1. Add Candidate form validation', async ({ page }) => {
    await login(page);
    await goToCandidateList(page);
    const totalBefore = await page.getByText(/^Total: \d+$/).textContent();

    // 1. Click + Add
    await page.getByRole('button', { name: 'Add' }).click();
    await expect(page.getByRole('heading', { name: 'Add Information' })).toBeVisible();

    // 2. Attempt to submit the form with all required fields empty
    await page.getByRole('button', { name: 'Next' }).click();
    // The wizard does not advance to step 2
    await expect(page.getByRole('heading', { name: 'Add Information' })).toBeVisible();
    // Note: required fields are marked with a red border only - no inline error text is
    // shown (accessibility/UX gap, see report), so this test asserts on non-advancement
    // rather than a specific error message.

    // 3. Cancel - no partial record is created
    await page.getByRole('button', { name: 'Cancel' }).click();
    await expect(page).toHaveURL(/\/admin\/candidate$/);
    await expect(page.getByText(totalBefore as string)).toBeVisible();
  });
});
