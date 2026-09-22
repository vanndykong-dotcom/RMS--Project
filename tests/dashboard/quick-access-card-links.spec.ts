// spec: specs/dashboard-test-plan.md (DASH03-3)
// exploratory: all 4 Quick Access cards carry a real Angular `routerlink` and are genuinely
// clickable (class="link-effect", tabindex="0") - a finding not mentioned anywhere in the story.
// "Total Interview" -> /admin/calendar; the other three -> /admin/candidate.

import { test, expect } from '@playwright/test';
import { login } from '../helpers/candidate-helpers';

test.describe('RMS-DASH-03: View Quick Access summary counts', () => {
  test('DASH03-3. Cards are clickable links to their documented destinations', async ({ page }) => {
    await login(page);

    const cards = page.locator('app-dashboard-quick-access app-aw-card');
    await expect(cards.nth(0)).toHaveAttribute('routerlink', '/admin/calendar');
    await expect(cards.nth(3)).toHaveAttribute('routerlink', '/admin/candidate');

    await cards.nth(0).click();
    await expect(page).toHaveURL(/\/admin\/calendar/);

    await page.getByRole('tree').getByRole('button', { name: 'Dashboard' }).click();
    await expect(page).toHaveURL(/\/admin\/dashboard/);

    await page.locator('app-dashboard-quick-access app-aw-card').nth(3).click();
    await expect(page).toHaveURL(/\/admin\/candidate$/);
    await expect(page.getByRole('heading', { name: 'Manage Candidates' })).toBeVisible();
  });
});
