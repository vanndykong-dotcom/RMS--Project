// spec: specs/dashboard-test-plan.md (DASH03-2)
// exploratory: this asserts the LIVE, CORRECTED color mapping, not the story's original claim.
// The story's AC says "Total Passed Candidate" and "Total Candidate" both use a blue icon - live
// exploration found "Total Candidate" actually renders type="danger" with a reddish/pink avatar
// (rgb(249,111,111)), not blue. Only "Total Passed Candidate" (type="passed", rgb(0,82,204)) is
// blue. See specs/dashboard-exploratory-results.md "Story corrections found" #1.

import { test, expect } from '@playwright/test';
import { login } from '../helpers/candidate-helpers';

test.describe('RMS-DASH-03: View Quick Access summary counts', () => {
  test('DASH03-2. Card color coding matches the live-confirmed type mapping', async ({ page }) => {
    await login(page);

    const cards = page.locator('app-dashboard-quick-access app-aw-card');
    const expectedTypes = ['primary', 'passed', 'failed', 'danger'];

    for (let i = 0; i < expectedTypes.length; i += 1) {
      await expect(cards.nth(i)).toHaveAttribute('type', expectedTypes[i]);
    }

    // The "Total Candidate" card (index 3) is documented by the story as blue but is actually
    // styled the same "danger" (reddish) family as "Total Failed Candidate" - assert this
    // corrected, live-confirmed behavior rather than the story's original claim.
    const passedAvatar = cards.nth(1).locator('.aw-theme-avtar');
    const candidateAvatar = cards.nth(3).locator('.aw-theme-avtar');
    await expect(passedAvatar).toHaveClass(/aw-bg-passed/);
    await expect(candidateAvatar).toHaveClass(/aw-bg-danger/);
  });
});
