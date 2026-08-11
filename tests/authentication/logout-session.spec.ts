// spec: specs/SCRUM.md
// seed: tests/seed.spec.ts
//
// NOTE ON KNOWN BUG (exploratory findings 2026-08-04, scenario 1.5):
// The exploratory findings document reported that the Username/Password fields are NOT
// cleared after logout (stale values carried over). Re-running this flow live during
// automation generation (same day) did NOT reproduce that behavior - both fields were
// observed empty immediately after logout, across two separate login/logout cycles. This
// test therefore asserts the CURRENTLY OBSERVED behavior (fields ARE empty after logout).
// This discrepancy between the two observations should be re-confirmed with product/dev -
// the original bug may be intermittent/timing-related rather than fully resolved.
//
// NOTE ON ROUTE NAMING (per test plan): the user story describes the post-logout/protected-
// route redirect target as a route literally named '/login'. The actually observed target
// is '/welcome' (sometimes with a Keycloak 'unauthorized_client' SSO error query string).
// This is asserted as-is; confirm with the team whether '/login' is an intended alias.

import { test, expect } from '@playwright/test';

test.describe('AC1 - Authentication', () => {
  test('Sign out ends session; protected route afterward redirects back to login', async ({ page }) => {
    // 1. Precondition: start already logged in - navigate to https://rms-dev.allweb.com.kh/welcome, enter the valid credentials from .env (FAPA_EMAIL / FAPA_PASSWORD), and click 'Login'
    await page.goto('https://rms-dev.allweb.com.kh/welcome');
    await page.getByRole('textbox', { name: 'Enter Username' }).fill(process.env.FAPA_EMAIL as string);
    await page.getByRole('textbox', { name: 'Enter Password' }).fill(process.env.FAPA_PASSWORD as string);
    await page.getByRole('button', { name: 'Login' }).click();
    await expect(page).toHaveURL(/\/admin\/dashboard/);
    await expect(page.getByRole('heading', { name: 'Dashboard', level: 1 })).toBeVisible();

    // 2. Click the 'Super ADMIN' account link (with the account_circle icon) in the top-right of the navigation bar
    const accountLink = page.getByRole('link', { name: 'Super ADMIN' });
    await accountLink.click();
    const logoutMenuItem = page.getByRole('menuitem', { name: 'Logout' });
    await expect(logoutMenuItem).toBeVisible();

    // 3. Click the 'Logout' menu item
    await logoutMenuItem.click();
    await expect(page).toHaveURL(/\/welcome/);
    const usernameField = page.getByRole('textbox', { name: 'Enter Username' });
    const passwordField = page.getByRole('textbox', { name: 'Enter Password' });
    // Currently observed behavior: fields are empty after logout (see note above re: prior bug report).
    await expect(usernameField).toHaveValue('');
    await expect(passwordField).toHaveValue('');

    // 4. Attempt to navigate directly to a protected route, e.g. https://rms-dev.allweb.com.kh/admin/dashboard
    await page.goto('https://rms-dev.allweb.com.kh/admin/dashboard');
    await expect(page).toHaveURL(/\/welcome/);
    await expect(page.getByRole('heading', { name: 'Dashboard', level: 1 })).not.toBeVisible();
    await expect(page.getByText('Welcome!')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Login' })).toBeVisible();
  });
});
