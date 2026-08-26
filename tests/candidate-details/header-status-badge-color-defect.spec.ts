// spec: specs/candidate-details-test-plan.md (CAND01-2)
// exploratory CONFIRMED DEFECT: `.profile-header-status span` always renders class="following"
// and computed background-color rgb(253, 244, 219), regardless of the candidate's actual
// status text - reconfirmed across FOLLOWING UP, NEW REQUEST, IN PROGRESS, and PASSED (5 data
// points across two exploration sessions). This test documents the CURRENT (single-color,
// single-class) behavior - it is NOT asserting the story's AC-assumed per-status coloring, and
// must not be "fixed" to expect distinct colors.

import { test, expect } from '@playwright/test';
import { login, goToCandidateDetails } from '../helpers/candidate-helpers';

test.describe('RMS-CAND-01: View candidate header and status', () => {
  test('CAND01-2. Status badge color does not vary by status (documents a confirmed defect)', async ({ page }) => {
    await login(page);

    await goToCandidateDetails(page, 'Raksa CHANN'); // FOLLOWING UP
    const badge1 = page.locator('.profile-header-status span');
    await expect(badge1).toHaveText(/FOLLOWING UP/i);
    await expect(badge1).toHaveClass('following');
    const color1 = await badge1.evaluate((el) => getComputedStyle(el).backgroundColor);
    expect(color1).toBe('rgb(253, 244, 219)');

    await goToCandidateDetails(page, 'Sopheak PHAL'); // IN PROGRESS
    const badge2 = page.locator('.profile-header-status span');
    await expect(badge2).toHaveText(/IN PROGRESS/i);
    // Confirmed defect: identical class and computed color despite the different status text.
    await expect(badge2).toHaveClass('following');
    const color2 = await badge2.evaluate((el) => getComputedStyle(el).backgroundColor);
    expect(color2).toBe(color1);
  });
});
