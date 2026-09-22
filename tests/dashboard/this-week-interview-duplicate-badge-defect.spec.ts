// spec: specs/dashboard-test-plan.md (DASH06-2)
// exploratory: CONFIRMED DEFECT (upgraded from the story's own "likely bug, not confirmed") -
// the "Ms. Kanna TESTING" card renders TWO separate <app-aw-badge color="secondary"> elements
// under "Interviewers", both reading "Chamrong THOR" - confirmed via raw innerHTML, not a text-
// rendering artifact. The "Ms. Kanna II" card has exactly one such badge for comparison. See
// specs/dashboard-exploratory-results.md "Defect 2" and
// test-reports/evidence/defect-DASH06-1-duplicate-interviewer-badge.png.
// This test documents the CURRENT (buggy) behavior, per this repo's convention for known
// defects.

import { test, expect } from '@playwright/test';
import { login } from '../helpers/candidate-helpers';

test.describe('RMS-DASH-06: View This Week Interview panel', () => {
  test('DASH06-2. Duplicate interviewer badge on the "Ms. Kanna TESTING" entry (confirmed defect)', async ({ page }) => {
    await login(page);

    const cards = page.locator('app-reminder-interview-card');
    const testingCard = cards.filter({ hasText: 'Ms. Kanna TESTING' });
    const testingBadges = testingCard.locator('app-aw-badge[color="secondary"]');
    await expect(testingBadges).toHaveCount(2);
    const testingTexts = (await testingBadges.allTextContents()).map((t) => t.trim());
    expect(testingTexts).toEqual(['Chamrong THOR', 'Chamrong THOR']);

    const kannaIiCard = cards.filter({ hasText: 'Ms. Kanna II' });
    const kannaIiBadges = kannaIiCard.locator('app-aw-badge[color="secondary"]');
    await expect(kannaIiBadges).toHaveCount(1);
  });
});
