// spec: specs/dashboard-test-plan.md (DASH01-1)
// exploratory: "ALLWEB RMS" branding text and the exact search placeholder text are both
// present on load. The notification bell is a matBadge-wrapped mat-icon (current value "0").
// The user menu (triggered by the "Super ADMIN" label) opens a role=menu with exactly one item,
// "Logout" - not clicked here, per this epic's read-only constraint.

import { test, expect } from '@playwright/test';
import { login } from '../helpers/candidate-helpers';

test.describe('RMS-DASH-01: View top navigation and global search', () => {
  test('DASH01-1. Top-bar branding, notification bell badge, and user menu label', async ({ page }) => {
    await login(page);

    await expect(page.getByText('ALLWEB RMS')).toBeVisible();
    await expect(
      page.locator('span.placeholder', { hasText: 'Search: Name, phone number, university, GPA, Status...' })
    ).toBeVisible();

    const bell = page.locator('mat-icon:has-text("notifications")').first();
    await expect(bell).toBeVisible();
    await expect(bell.locator('.mat-badge-content')).toBeVisible();

    const userMenuTrigger = page.getByText('Super ADMIN').first();
    await expect(userMenuTrigger).toBeVisible();
    await userMenuTrigger.click();

    const menu = page.locator('[role="menu"]').first();
    await expect(menu).toBeVisible();
    // The menuitem's raw textContent includes its mat-icon's font-ligature text ("login") ahead
    // of the visible label ("Logout") - confirmed live, the icon is a mismatched "login" glyph
    // for a logout action (a minor cosmetic note, not a functional defect). Match on the
    // trailing label rather than an exact string.
    const menuItems = menu.locator('[role="menuitem"]');
    await expect(menuItems).toHaveCount(1);
    await expect(menuItems.first()).toContainText('Logout');

    // Never click "Logout" - close the menu instead, leaving the session intact.
    await page.keyboard.press('Escape');
    await expect(page).toHaveURL(/\/admin\/dashboard/);
  });
});
