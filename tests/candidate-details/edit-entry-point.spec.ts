// spec: specs/candidate-details-test-plan.md (CAND08-1)
// exploratory: "Edit" navigates to a FULL PAGE (not a dialog):
// /admin/candidate/editCandidate/{id}, heading "Update Information".

import { test, expect } from '@playwright/test';
import { login, goToCandidateDetails, getProfileCardFields } from '../helpers/candidate-helpers';

test.describe('RMS-CAND-08: Edit candidate details (entry point only)', () => {
  test('CAND08-1. "Edit" opens a full-page pre-filled form (entry point only - do not save)', async ({ page }) => {
    await login(page);
    await goToCandidateDetails(page, 'Vk KONG');

    const before = await getProfileCardFields(page);

    await page.locator('.sub-navigation', { hasText: 'Edit' }).click();
    await expect(page).toHaveURL(/\/admin\/candidate\/editCandidate\/\d+/);
    await expect(page.getByRole('heading', { name: 'Update Information' })).toBeVisible();

    // Navigate away without saving - this is a real route (not a dialog), so goBack() is safe.
    await page.goBack();
    await expect(page).toHaveURL(/\/admin\/candidate\/candidateDetail\/\d+/);

    const after = await getProfileCardFields(page);
    expect(after['Gender']).toBe(before['Gender']);
    expect(after['Email']).toBe(before['Email']);
    expect(after['Priority']).toBe(before['Priority']);
  });
});
