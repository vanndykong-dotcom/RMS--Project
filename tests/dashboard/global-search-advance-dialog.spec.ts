// spec: specs/dashboard-test-plan.md (DASH01-2)
// exploratory: the top-bar "search" is NOT a real <input> - it's a decorative
// <span class="placeholder"> plus an adjacent "tune" icon. Clicking EITHER one opens the same
// <app-advance-search-dialog> titled "Advance Search", with field labels "Enter candidate",
// "Gender", "University", "GPA", "Position" and "Export"/"Clear all" buttons. This resolves the
// story's two open questions about the search box's submit destination and the filter icon.

import { test, expect } from '@playwright/test';
import { login } from '../helpers/candidate-helpers';

test.describe('RMS-DASH-01: View top navigation and global search', () => {
  test('DASH01-2. Global search and filter icon both open the "Advance Search" dialog', async ({ page }) => {
    await login(page);

    const searchSpan = page.locator('span.placeholder', { hasText: 'Search: Name' });
    await searchSpan.click();

    const dialog = page.locator('app-advance-search-dialog');
    await expect(dialog.getByText('Advance Search')).toBeVisible();
    const labels = await dialog.locator('mat-label').allTextContents();
    expect(labels).toEqual(['Enter candidate', 'Gender', 'University', 'GPA', 'Position']);
    await expect(dialog.getByRole('button', { name: /Export/ })).toBeVisible();
    // The button's icon font-ligature text happens to read "clear_all", but its actual
    // accessible/visible label (aria-hidden excludes the icon from the computed name) is just
    // "Clear" - confirmed live, do not match on "Clear all".
    await expect(dialog.getByRole('button', { name: /Clear/ })).toBeVisible();

    await page.keyboard.press('Escape');
    await expect(page.locator('app-advance-search-dialog')).not.toBeVisible();
    await expect(page).toHaveURL(/\/admin\/dashboard/);

    // The tune (filter) icon triggers the identical dialog.
    const tuneIcon = page.locator('mat-icon:has-text("tune")').first();
    await tuneIcon.click();
    await expect(page.locator('app-advance-search-dialog').getByText('Advance Search')).toBeVisible();

    await page.keyboard.press('Escape');
    await expect(page.locator('app-advance-search-dialog')).not.toBeVisible();
  });
});
