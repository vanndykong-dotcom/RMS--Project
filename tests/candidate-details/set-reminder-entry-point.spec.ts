// spec: specs/candidate-details-test-plan.md (CAND07-1)
// exploratory: "Set reminder" navigates to a FULL PAGE (not a dialog):
// /admin/reminders/add/{id}/SPECIAL, heading "Manage Create reminder".

import { test, expect } from '@playwright/test';
import { login, goToCandidateDetails } from '../helpers/candidate-helpers';

test.describe('RMS-CAND-07: Set a reminder for the candidate (entry point only)', () => {
  test('CAND07-1. "Set reminder" opens a full-page pre-associated form (entry point only - do not save)', async ({ page }) => {
    await login(page);
    await goToCandidateDetails(page, 'Vk KONG');

    await page.locator('.sub-navigation', { hasText: 'Set reminder' }).click();
    await expect(page).toHaveURL(/\/admin\/reminders\/add\/\d+\/SPECIAL/);
    await expect(page.getByRole('heading', { name: 'Manage Create reminder' })).toBeVisible();

    // Navigate away without saving - this is a real route (not a dialog), so goBack() is safe.
    await page.goBack();
    await expect(page).toHaveURL(/\/admin\/candidate\/candidateDetail\/\d+/);
  });
});
