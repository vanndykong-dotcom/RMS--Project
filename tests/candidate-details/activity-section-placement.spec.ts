// spec: specs/candidate-details-test-plan.md (CAND05-2)
// exploratory CONFIRMED: resolves the story's open question - a logged activity displays
// directly on this same Candidate Details page's own "Activity"/"Activities ({n})" section
// below the file manager, not on a separate view. Confirmed live on Vanndy VK: "Activities
// (14)" including an entry "FOLLOWING UP -> PASSED" with author and timestamp.

import { test, expect } from '@playwright/test';
import { login, goToCandidateDetails } from '../helpers/candidate-helpers';

test.describe('RMS-CAND-05: Log an activity against the candidate (entry point only)', () => {
  test('CAND05-2. Logged activities display in this page\'s own "Activity" section', async ({ page }) => {
    await login(page);
    await goToCandidateDetails(page, 'Vanndy VK');

    // Confirmed live: TWO identical "Activities (n)" <h2> headings render on this page - a
    // desktop-layout copy (`.candidate-detail-right`) and a small-screen-layout copy
    // (`.candidate-detail-small-screen`); only one is actually visible at any given viewport
    // (which one depends on the viewport's width), so scope to the visible one via the
    // engine's `:visible` pseudo-class rather than a bare text match.
    const activitySection = page.locator('h2:visible', { hasText: /Activit(?:y|ies) \(\d+\)/ });
    await activitySection.scrollIntoViewIfNeeded();
    await expect(activitySection).toBeVisible();
    await expect(page.locator('body')).toContainText(/FOLLOWING UP.*PASSED/);
  });
});
