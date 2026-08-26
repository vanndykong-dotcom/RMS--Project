// spec: specs/candidate-details-test-plan.md (CAND05-1)
// exploratory: "Add activity" is a `div.sub-navigation` element inside `app-aw-navigation` (not
// a semantic button/link - `getByRole('button', { name })` times out; target by text instead).
// It navigates to a FULL PAGE (not a dialog): /admin/activities/update?candidateId={id},
// heading "Manage Activity" with sections "Activity information" and "Associate information".

import { test, expect } from '@playwright/test';
import { login, goToCandidateDetails } from '../helpers/candidate-helpers';

test.describe('RMS-CAND-05: Log an activity against the candidate (entry point only)', () => {
  test('CAND05-1. "Add activity" opens a full-page form (entry point only - do not submit)', async ({ page }) => {
    await login(page);
    await goToCandidateDetails(page, 'Raksa CHANN');

    await page.locator('.sub-navigation', { hasText: 'Add activity' }).click();
    await expect(page).toHaveURL(/\/admin\/activities\/update\?candidateId=\d+/);
    await expect(page.getByRole('heading', { name: 'Manage Activity' })).toBeVisible();
    await expect(page.getByText('Activity information')).toBeVisible();
    await expect(page.getByText('Associate information')).toBeVisible();

    // Never submit - entry point only.
    await page.getByRole('button', { name: 'Cancel' }).click();
    await expect(page).toHaveURL(/\/admin\/candidate\/candidateDetail\/\d+/);
  });
});
