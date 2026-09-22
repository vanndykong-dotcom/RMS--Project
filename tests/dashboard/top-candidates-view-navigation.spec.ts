// spec: specs/dashboard-test-plan.md (DASH05-2)
// exploratory: clicking "View" on the active card (Julie MARTIN) navigated to
// /admin/candidate/candidateDetail/{id} with the Candidate Details header matching that card's
// name - confirms the View-button destination.

import { test, expect } from '@playwright/test';
import { login } from '../helpers/candidate-helpers';

test.describe('RMS-DASH-05: View Top Candidates', () => {
  test('DASH05-2. "View" navigates to that candidate\'s Candidate Details page', async ({ page }) => {
    await login(page);

    const activeCard = page.locator('app-dashboard-top-candidate mat-card.slick-active');
    // Wait for the carousel to actually be populated before reading it - under this suite's
    // default 3-worker concurrency, this was observed to occasionally exceed the test timeout
    // waiting on a card that had not yet hydrated after login() resolved.
    await expect(activeCard.locator('.avatar-name')).toBeVisible({ timeout: 15000 });
    const name = (await activeCard.locator('.avatar-name').innerText()).replace('Name:', '').trim();

    await activeCard.getByRole('button', { name: 'View' }).click();
    await expect(page).toHaveURL(/\/admin\/candidate\/candidateDetail\/\d+/);
    await expect(page.locator('h2.profile-header-name')).toContainText(name);
  });
});
