// spec: specs/SCRUM.md
// seed: tests/seed.spec.ts
//
// KNOWN GAP-CONFIRMED (exploratory findings 2026-08-04, scenario 1.4):
// The user story expects a 'Forgot password?' (or similarly labeled) link on the login
// page, leading to a dedicated password-recovery flow. Exploration confirmed NO such
// link/button exists anywhere on the current /welcome page - only the Username field,
// Password field, and Login button are present. This test asserts the CURRENT, actual
// absence of the link as a regression guard (so a future removal of the link keeps
// passing, and the test only needs updating once the link is intentionally added).
// Re-confirm with product/dev whether this is a missing-feature gap to be built.

import { test, expect } from '@playwright/test';

test.describe('AC1 - Authentication', () => {
  test("'Forgot password?' link navigates to a dedicated recovery flow", async ({ page }) => {
    // 1. Precondition: ensure a fresh, logged-out session by navigating to https://rms-dev.allweb.com.kh/welcome
    await page.goto('https://rms-dev.allweb.com.kh/welcome');
    await expect(page.getByRole('textbox', { name: 'Enter Username' })).toBeVisible();
    await expect(page.getByRole('textbox', { name: 'Enter Password' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Login' })).toBeVisible();

    // 2. Visually inspect the login form area (near the Password field and Login button) for a 'Forgot password?' (or similarly labeled) link
    // GAP TO CONFIRM: no such link exists on the page as of 2026-08-04 - asserting its
    // current absence rather than forcing a false pass on a non-existent element.
    await expect(page.getByRole('link', { name: /forgot password/i })).toHaveCount(0);
    await expect(page.getByText(/forgot password/i)).toHaveCount(0);
  });
});
