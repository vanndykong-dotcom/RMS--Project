// spec: specs/SCRUM.md
// seed: tests/seed.spec.ts

import { test, expect } from '@playwright/test';

test.describe('AC2 - Navigation', () => {
  test('Reminder nav item reaches the Reminder section', async ({ page }) => {
    // 1. Precondition: start already logged in as a valid user, currently on the Dashboard
    await page.goto('https://rms-dev.allweb.com.kh/welcome');
    await page.getByRole('textbox', { name: 'Enter Username' }).fill(process.env.FAPA_EMAIL as string);
    await page.getByRole('textbox', { name: 'Enter Password' }).fill(process.env.FAPA_PASSWORD as string);
    await page.getByRole('button', { name: 'Login' }).click();
    await expect(page).toHaveURL(/\/admin\/dashboard/);
    const sidebarTree = page.getByRole('tree');
    await expect(sidebarTree).toBeVisible();

    // 2. Click the 'Reminder' item in the left sidebar
    await sidebarTree.getByRole('button', { name: 'Reminder' }).click();
    await expect(page).toHaveURL(/\/admin\/reminders/);
    await expect(page.getByRole('heading', { name: 'Manage Reminder' })).toBeVisible();
  });
});
