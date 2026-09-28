// spec: specs/dashboard-test-plan.md (DASH04-6)
// exploratory: "+ Add" is a full page navigation to /admin/demand/create, heading
// "Manage demands" - NOT a dialog. Entry point only, nothing is submitted.

import { test, expect } from '@playwright/test';
import { login } from '../helpers/candidate-helpers';

test.describe('RMS-DASH-04: View Resource Demanding table', () => {
  test('DASH04-6. "+ Add" opens the demand creation page', async ({ page }) => {
    await login(page);

    const rd = page.locator('app-dashboard-resource-demanding');
    const originalRow = page.locator('app-dashboard-resource-demanding').locator('tbody tr').first();
    await expect(originalRow).toContainText('VK-Microsoft');
    const originalProjectName = await originalRow.locator('td').nth(1).innerText();

    await rd.getByRole('button', { name: 'Add' }).click();
    await expect(page).toHaveURL(/\/admin\/demand\/create/);
    await expect(page.getByRole('heading', { name: 'Manage demands' })).toBeVisible();

    // Return via the sidebar (not goBack()) per this repo's Keycloak deep-link caution.
    await page.getByRole('tree').getByRole('button', { name: 'Dashboard' }).click();
    await expect(page).toHaveURL(/\/admin\/dashboard/);

    // Compare on the specific "Project Name" cell text rather than the whole row's innerText:
    // `toHaveText` normalizes internal whitespace differently than `innerText()` does (the raw
    // row also briefly renders a "no-data-row" placeholder while the table re-fetches after
    // navigating back), so comparing one stable, non-empty cell avoids both the whitespace
    // mismatch and the loading-placeholder race confirmed live during healing.
    const restoredRow = page.locator('app-dashboard-resource-demanding').locator('tbody tr').first();
    await expect(restoredRow.locator('td').nth(1)).toHaveText(originalProjectName, { timeout: 10000 });
  });
});
