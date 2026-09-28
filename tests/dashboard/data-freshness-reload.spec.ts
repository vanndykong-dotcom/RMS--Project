// spec: specs/dashboard-test-plan.md (DASH08-1)
// exploratory: this proves the Dashboard re-reads correctly on a fresh navigation (no stale
// client-side caching) - it does not exercise a genuine cross-module write-then-reload cycle,
// which is out of scope for this read-only epic (see specs/dashboard-exploratory-results.md
// "Coverage note" under DASH08-1). Navigates away and back via the sidebar rather than a raw
// page reload, per this repo's documented Keycloak silent-SSO caution on protected routes.

import { test, expect } from '@playwright/test';
import { login } from '../helpers/candidate-helpers';

test.describe('RMS-DASH-08: Dashboard data freshness and empty states', () => {
  test('DASH08-1. Quick Access and Resource Demanding values persist identically after navigating away and back', async ({ page }) => {
    await login(page);

    const rdRowBefore = page.locator('app-dashboard-resource-demanding tbody tr').first();
    await expect(rdRowBefore).not.toHaveText('');
    const qaValuesBefore = await page.locator('app-aw-card h4').allTextContents();
    const rdProjectNameBefore = await rdRowBefore.locator('td').nth(1).innerText();

    const sidebarTree = page.getByRole('tree');
    await sidebarTree.getByRole('button', { name: 'Interview Schedule' }).click();
    await expect(page).toHaveURL(/\/admin\/calendar/);
    await sidebarTree.getByRole('button', { name: 'Dashboard' }).click();
    await expect(page).toHaveURL(/\/admin\/dashboard/);

    // The Resource Demanding table briefly renders a "no-data-row" placeholder while it
    // re-fetches after navigating back (confirmed live during healing) - wait for it to be
    // populated again before comparing, rather than reading immediately after the URL change.
    const rdRowAfter = page.locator('app-dashboard-resource-demanding tbody tr').first();
    await expect(rdRowAfter.locator('td').nth(1)).toHaveText(rdProjectNameBefore, { timeout: 10000 });

    const qaValuesAfter = await page.locator('app-aw-card h4').allTextContents();
    expect(qaValuesAfter).toEqual(qaValuesBefore);
  });
});
