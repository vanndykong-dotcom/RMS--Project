// spec: specs/SCRUM.md
// seed: tests/seed.spec.ts

import { test, expect } from '@playwright/test';

test.describe('AC1 - Authentication', () => {
  test('Invalid credentials show error and keep user on login page', async ({ page }) => {
    // 1. Precondition: ensure a fresh, logged-out session by navigating to https://rms-dev.allweb.com.kh/welcome
    await page.goto('https://rms-dev.allweb.com.kh/welcome');
    const usernameField = page.getByRole('textbox', { name: 'Enter Username' });
    const passwordField = page.getByRole('textbox', { name: 'Enter Password' });
    const loginButton = page.getByRole('button', { name: 'Login' });
    await expect(usernameField).toBeVisible();
    await expect(usernameField).toHaveValue('');
    await expect(passwordField).toBeVisible();
    await expect(passwordField).toHaveValue('');

    // 2. Enter a non-existent username, e.g. 'invalid@example.com', into the Username field
    await usernameField.fill('invalid@example.com');
    await expect(usernameField).toHaveValue('invalid@example.com');

    // 3. Enter an incorrect password, e.g. 'wrongpassword', into the Password field
    await passwordField.fill('wrongpassword');
    await expect(passwordField).toHaveValue('wrongpassword');

    // 4. Click the 'Login' button
    await loginButton.click();
    await expect(page).toHaveURL(/\/welcome/);
    await expect(page.getByText('The username is wrong. Please try again')).toBeVisible();
    await expect(page.getByText('The password is wrong. Please try again')).toBeVisible();
    await expect(usernameField).toHaveAttribute('aria-invalid', 'true');
    await expect(passwordField).toHaveAttribute('aria-invalid', 'true');
  });
});
