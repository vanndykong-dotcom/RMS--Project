// spec: specs/candidate-management.md
import { test, expect } from '@playwright/test';

test.describe('Seed', () => {
  test('seed - logged in on Manage Candidates page', async ({ page }) => {
    await page.goto('https://rms-dev.allweb.com.kh/welcome');
    await page.getByRole('textbox', { name: 'Enter Username' }).fill(process.env.FAPA_EMAIL as string);
    await page.getByRole('textbox', { name: 'Enter Password' }).fill(process.env.FAPA_PASSWORD as string);
    await page.getByRole('button', { name: 'Login' }).click();
    await expect(page).toHaveURL(/\/admin\/dashboard/);

    const sidebarTree = page.getByRole('tree');
    await sidebarTree.getByRole('button', { name: 'Candidate' }).click();
    await expect(page).toHaveURL(/\/admin\/candidate/);
    await expect(page.getByRole('heading', { name: 'Manage Candidates' })).toBeVisible();
  });
});
