// spec: specs/SCRUM.md
// seed: tests/seed.spec.ts

import { test, expect } from '@playwright/test';

test.describe('AC1 - Authentication', () => {
  test('Valid login redirects to Dashboard', async ({ page }) => {
    // 1. Precondition: ensure a fresh, logged-out session by navigating to https://rms-dev.allweb.com.kh/welcome
    await page.goto('https://rms-dev.allweb.com.kh/welcome');
    await expect(page.getByText('Welcome!')).toBeVisible();
    await expect(page.getByText('Sign in your account')).toBeVisible();
    const usernameField = page.getByRole('textbox', { name: 'Enter Username' });
    const passwordField = page.getByRole('textbox', { name: 'Enter Password' });
    const loginButton = page.getByRole('button', { name: 'Login' });
    await expect(usernameField).toBeVisible();
    await expect(usernameField).toHaveValue('');
    await expect(passwordField).toBeVisible();
    await expect(passwordField).toHaveValue('');
    await expect(loginButton).toBeVisible();

    // 2. Enter the valid username from the FAPA_EMAIL value in .env into the Username field
    await usernameField.fill(process.env.FAPA_EMAIL as string);
    await expect(usernameField).toHaveValue(process.env.FAPA_EMAIL as string);

    // 3. Enter the valid password from the FAPA_PASSWORD value in .env into the Password field
    await passwordField.fill(process.env.FAPA_PASSWORD as string);
    await expect(passwordField).toHaveValue(process.env.FAPA_PASSWORD as string);

    // 4. Click the 'Login' button
    await loginButton.click();
    await expect(page).toHaveURL(/\/admin\/dashboard/);
    await expect(page.getByRole('heading', { name: 'Dashboard', level: 1 })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Quick Access' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Resource Demanding' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Top Candidates' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Super ADMIN' })).toBeVisible();
    await expect(page.getByRole('tree')).toBeVisible();
  });
});
