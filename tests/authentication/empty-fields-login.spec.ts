// spec: specs/SCRUM.md
// seed: tests/seed.spec.ts
//
// KNOWN GAP-CONFIRMED (exploratory findings 2026-08-04, scenario 1.3):
// The user story describes a distinct "This field is required" validation message when
// submitting the login form with empty fields. The actual observed behavior is that the
// app reuses the SAME "The username is wrong. Please try again" / "The password is wrong.
// Please try again" alerts used for wrong-credentials submissions. This test asserts the
// CURRENT, actual behavior as a regression guard. Re-confirm with product/dev whether a
// dedicated required-field message is intended; update this test if/when that is fixed.

import { test, expect } from '@playwright/test';

test.describe('AC1 - Authentication', () => {
  test('Empty fields show inline required validation on submit', async ({ page }) => {
    // 1. Precondition: ensure a fresh, logged-out session by navigating to https://rms-dev.allweb.com.kh/welcome
    await page.goto('https://rms-dev.allweb.com.kh/welcome');
    const usernameField = page.getByRole('textbox', { name: 'Enter Username' });
    const passwordField = page.getByRole('textbox', { name: 'Enter Password' });
    const loginButton = page.getByRole('button', { name: 'Login' });
    await expect(usernameField).toHaveValue('');
    await expect(passwordField).toHaveValue('');

    // 2. Without typing anything into either field, click the 'Login' button
    await loginButton.click();
    await expect(page).toHaveURL(/\/welcome/);
    // KNOWN DISCREPANCY: same alerts as wrong-credentials case, not a distinct "required" message.
    await expect(page.getByText('The username is wrong. Please try again')).toBeVisible();
    await expect(page.getByText('The password is wrong. Please try again')).toBeVisible();
  });
});
