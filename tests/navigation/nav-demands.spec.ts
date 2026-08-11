// spec: specs/SCRUM.md
// seed: tests/seed.spec.ts

import { test, expect } from '@playwright/test';

test.describe('AC2 - Navigation', () => {
  test('Demands nav item reaches the Demand section', async ({ page }) => {
    // 1. Precondition: start already logged in as a valid user, currently on the Dashboard
    await page.goto('https://rms-dev.allweb.com.kh/welcome');
    await page.getByRole('textbox', { name: 'Enter Username' }).fill(process.env.FAPA_EMAIL as string);
    await page.getByRole('textbox', { name: 'Enter Password' }).fill(process.env.FAPA_PASSWORD as string);
    await page.getByRole('button', { name: 'Login' }).click();
    await expect(page).toHaveURL(/\/admin\/dashboard/);
    const sidebarTree = page.getByRole('tree');
    await expect(sidebarTree).toBeVisible();

    // 2. Click the 'Demand' item in the left sidebar (this is the UI's actual label for the 'Demands' nav entry from the user story)
    await sidebarTree.getByRole('button', { name: 'Demand' }).click();
    await expect(page).toHaveURL(/\/admin\/demand/);
    await expect(page.getByRole('heading', { name: 'Manage Demands' })).toBeVisible();
  });
});
