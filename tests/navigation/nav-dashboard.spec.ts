// spec: specs/SCRUM.md
// seed: tests/seed.spec.ts

import { test, expect } from '@playwright/test';

test.describe('AC2 - Navigation', () => {
  test('Dashboard nav item reaches the Dashboard section', async ({ page }) => {
    // 1. Precondition: start already logged in as a valid user, currently on any admin page
    await page.goto('https://rms-dev.allweb.com.kh/welcome');
    await page.getByRole('textbox', { name: 'Enter Username' }).fill(process.env.FAPA_EMAIL as string);
    await page.getByRole('textbox', { name: 'Enter Password' }).fill(process.env.FAPA_PASSWORD as string);
    await page.getByRole('button', { name: 'Login' }).click();
    await expect(page).toHaveURL(/\/admin\/dashboard/);
    const sidebarTree = page.getByRole('tree');
    await expect(sidebarTree).toBeVisible();
    await expect(sidebarTree.getByRole('button', { name: 'Dashboard' })).toBeVisible();
    await expect(sidebarTree.getByRole('button', { name: 'Interview Schedule' })).toBeVisible();
    await expect(sidebarTree.getByRole('button', { name: 'Candidate' })).toBeVisible();
    await expect(sidebarTree.getByRole('button', { name: 'Demand' })).toBeVisible();
    await expect(sidebarTree.getByRole('button', { name: 'Report', exact: true })).toBeVisible();
    await expect(sidebarTree.getByRole('button', { name: 'Advance Report' })).toBeVisible();
    await expect(sidebarTree.getByRole('button', { name: 'Activity' })).toBeVisible();
    await expect(sidebarTree.getByRole('button', { name: 'Reminder' })).toBeVisible();
    await expect(sidebarTree.getByRole('button', { name: 'File Manager' })).toBeVisible();
    await expect(sidebarTree.getByRole('button', { name: 'Toggle Setting' })).toBeVisible();
    await expect(sidebarTree.getByRole('button', { name: 'Toggle Administration' })).toBeVisible();

    // 2. Click the 'Dashboard' item in the left sidebar navigation tree
    await sidebarTree.getByRole('button', { name: 'Dashboard' }).click();
    await expect(page).toHaveURL(/\/admin\/dashboard/);
    await expect(page.getByRole('heading', { name: 'Dashboard', level: 1 })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Quick Access' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Resource Demanding' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Top Candidates' })).toBeVisible();
  });
});
