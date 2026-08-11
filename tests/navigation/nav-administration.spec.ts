// spec: specs/SCRUM.md
// seed: tests/seed.spec.ts

import { test, expect } from '@playwright/test';

test.describe('AC2 - Navigation', () => {
  test('Administration nav item expands its submenu and each child reaches the Administration section', async ({ page }) => {
    // 1. Precondition: start already logged in as a valid user, currently on the Dashboard
    await page.goto('https://rms-dev.allweb.com.kh/welcome');
    await page.getByRole('textbox', { name: 'Enter Username' }).fill(process.env.FAPA_EMAIL as string);
    await page.getByRole('textbox', { name: 'Enter Password' }).fill(process.env.FAPA_PASSWORD as string);
    await page.getByRole('button', { name: 'Login' }).click();
    await expect(page).toHaveURL(/\/admin\/dashboard/);
    const sidebarTree = page.getByRole('tree');
    await expect(sidebarTree).toBeVisible();

    // 2. Click the 'Administration' item in the left sidebar
    // 'Administration' is a toggle, not a direct page: clicking it must not change the URL.
    await sidebarTree.getByRole('button', { name: 'Toggle Administration' }).click();
    await expect(page).toHaveURL(/\/admin\/dashboard/);
    await expect(sidebarTree.getByRole('button', { name: 'User' })).toBeVisible();
    await expect(sidebarTree.getByRole('button', { name: 'Role' })).toBeVisible();
    await expect(sidebarTree.getByRole('button', { name: 'Group' })).toBeVisible();

    // 3. Click the 'User' child item under Administration (read-only check - do not create/edit/delete any user)
    await sidebarTree.getByRole('button', { name: 'User' }).click();
    await expect(page).toHaveURL(/\/admin\/administration\/users/);
    await expect(page.getByRole('heading', { name: 'Manage Users' })).toBeVisible();
  });
});
