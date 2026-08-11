// spec: specs/SCRUM.md
// seed: tests/seed.spec.ts

import { test, expect } from '@playwright/test';

test.describe('AC2 - Navigation', () => {
  test('Setting nav item expands its submenu and each child reaches the Setting section', async ({ page }) => {
    // 1. Precondition: start already logged in as a valid user, currently on the Dashboard
    await page.goto('https://rms-dev.allweb.com.kh/welcome');
    await page.getByRole('textbox', { name: 'Enter Username' }).fill(process.env.FAPA_EMAIL as string);
    await page.getByRole('textbox', { name: 'Enter Password' }).fill(process.env.FAPA_PASSWORD as string);
    await page.getByRole('button', { name: 'Login' }).click();
    await expect(page).toHaveURL(/\/admin\/dashboard/);
    const sidebarTree = page.getByRole('tree');
    await expect(sidebarTree).toBeVisible();

    // 2. Click the 'Setting' item in the left sidebar
    // 'Setting' is a toggle, not a direct page: clicking it must not change the URL.
    await sidebarTree.getByRole('button', { name: 'Toggle Setting' }).click();
    await expect(page).toHaveURL(/\/admin\/dashboard/);
    await expect(sidebarTree.getByRole('button', { name: 'Migration' })).toBeVisible();
    await expect(sidebarTree.getByRole('button', { name: 'Company Profile' })).toBeVisible();
    await expect(sidebarTree.getByRole('button', { name: 'Interview Template' })).toBeVisible();
    await expect(sidebarTree.getByRole('button', { name: 'Job' })).toBeVisible();
    await expect(sidebarTree.getByRole('button', { name: 'Project', exact: true })).toBeVisible();
    await expect(sidebarTree.getByRole('button', { name: 'Email Configuration' })).toBeVisible();
    await expect(sidebarTree.getByRole('button', { name: 'Email Template' })).toBeVisible();
    await expect(sidebarTree.getByRole('button', { name: 'System Configuration' })).toBeVisible();
    await expect(sidebarTree.getByRole('button', { name: 'Candidate Status' })).toBeVisible();
    await expect(sidebarTree.getByRole('button', { name: 'University' })).toBeVisible();

    // 3. Click the 'Company Profile' child item under Setting (read-only check - do not submit any changes)
    await sidebarTree.getByRole('button', { name: 'Company Profile' }).click();
    await expect(page).toHaveURL(/\/admin\/setting\/feature-company-profile/);
    await expect(page.getByRole('heading', { name: 'Manage Company Profile' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Setting' })).toBeVisible();
    await expect(page.getByText('Company profile', { exact: true })).toBeVisible();
    // Read-only check: the form is displayed but the 'Update' button is intentionally NOT clicked.
    await expect(page.getByRole('button', { name: 'Update' })).toBeVisible();
  });
});
