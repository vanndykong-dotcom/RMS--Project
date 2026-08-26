// spec: specs/candidate-details-test-plan.md (CAND01-1)
// exploratory: header renders exactly `<h2 class="profile-header-name">{Salutation}. {Full
// Name}</h2>` followed by `<div class="profile-header-status"><span>{STATUS}</span></div>`,
// then `<h4 class="sub-title">{Applied-For Position}</h4>` below - confirmed on 4 candidates.

import { test, expect } from '@playwright/test';
import { login, goToCandidateDetails } from '../helpers/candidate-helpers';

test.describe('RMS-CAND-01: View candidate header and status', () => {
  test('CAND01-1. Header renders salutation, name, and status badge inline', async ({ page }) => {
    await login(page);
    await goToCandidateDetails(page, 'Raksa CHANN');

    // The rendered header text carries a leading space (confirmed live: " Ms. Raksa CHANN") -
    // tolerate leading/trailing whitespace rather than anchoring straight to the salutation.
    await expect(page.locator('h2.profile-header-name')).toHaveText(/^\s*Ms\.\s*Raksa CHANN\s*$/i);

    const statusBadge = page.locator('.profile-header-status span');
    await expect(statusBadge).toBeVisible();
    await expect(statusBadge).toHaveText(/FOLLOWING UP/i);

    // Subtitle directly under the name is the applied-for position, not a reference code.
    const subTitle = page.locator('h4.sub-title');
    await expect(subTitle).toBeVisible();
    await expect(subTitle).not.toBeEmpty();
  });
});
