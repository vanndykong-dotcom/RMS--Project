// spec: specs/candidate-details-test-plan.md (CAND02-3)
// exploratory: a no-photo candidate renders `.aw-avatar-title span` initials inside a colored
// `.aw-avatar-container.aw-avatar-{color}` circle, with no `<img>` inside `.contain-avatar-
// button`; a candidate with an uploaded photo renders `<img class="avatar-button"
// src="blob:...">` instead.

import { test, expect } from '@playwright/test';
import { login, goToCandidateDetails } from '../helpers/candidate-helpers';

test.describe('RMS-CAND-02: View candidate profile information', () => {
  test('CAND02-3. Avatar shows initials-on-color when no photo, and a real image when one exists', async ({ page }) => {
    await login(page);

    await goToCandidateDetails(page, 'Vk KONG');
    await expect(page.locator('.aw-avatar-title span')).toHaveText('VK');
    await expect(page.locator('.aw-avatar-container')).toHaveClass(/aw-avatar-/);
    await expect(page.locator('.contain-avatar-button img')).toHaveCount(0);

    await goToCandidateDetails(page, 'Raksa CHANN');
    const photo = page.locator('img.avatar-button');
    await expect(photo).toBeVisible();
    await expect(photo).toHaveAttribute('src', /^blob:/);
  });
});
