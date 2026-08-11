// spec: specs/SCRUM.md
// seed: tests/seed.spec.ts
//
// KNOWN GAP-CONFIRMED (exploratory findings 2026-08-04, scenario 2.12):
// There is no 'Markets' nav item anywhere in the sidebar. Directly typing the
// /markets URL into the address bar does not resolve to any Markets section - the
// app rewrites the URL to the site root '/' and renders a BLANK page, without the
// auto-redirect to /admin/dashboard that a normal, unprompted visit to '/' produces
// for a logged-in user. Per instructions this is documented/verified only, not
// treated as a bug to fix. This test asserts the CURRENT, actual behavior as a
// regression-guard; re-confirm with product/dev if/when a Markets section is added.

import { test, expect } from '@playwright/test';

test.describe('AC2 - Navigation', () => {
  test('KNOWN GAP: direct navigation to the /markets URL does not resolve to a Markets section', async ({ page }) => {
    // 1. Precondition: start already logged in as a valid user, currently on the Dashboard. First confirm there is no 'Markets' item anywhere in the left sidebar navigation tree
    await page.goto('https://rms-dev.allweb.com.kh/welcome');
    await page.getByRole('textbox', { name: 'Enter Username' }).fill(process.env.FAPA_EMAIL as string);
    await page.getByRole('textbox', { name: 'Enter Password' }).fill(process.env.FAPA_PASSWORD as string);
    await page.getByRole('button', { name: 'Login' }).click();
    await expect(page).toHaveURL(/\/admin\/dashboard/);
    const sidebarTree = page.getByRole('tree');
    await expect(sidebarTree).toBeVisible();
    await expect(sidebarTree.getByRole('button', { name: 'Markets' })).toHaveCount(0);
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

    // 2. While still logged in, type https://rms-dev.allweb.com.kh/markets directly into the browser address bar and navigate to it (do not click any nav button)
    await page.goto('https://rms-dev.allweb.com.kh/markets');
    // Actual observed behavior: the URL is rewritten to the site root, and the page stays blank
    // with no auto-redirect to /admin/dashboard - confirmed even after a short wait.
    await expect(page).toHaveURL('https://rms-dev.allweb.com.kh/');
    await expect(page.getByText('Markets', { exact: false })).toHaveCount(0);
    await expect(page.locator('body')).toBeEmpty({ timeout: 3000 });
    await expect(page).toHaveURL('https://rms-dev.allweb.com.kh/');

    // 3. For contrast, while still logged in, navigate directly to https://rms-dev.allweb.com.kh/ (the bare root, not /markets)
    await page.goto('https://rms-dev.allweb.com.kh/');
    await expect(page).toHaveURL(/\/admin\/dashboard/);
    await expect(page.getByRole('heading', { name: 'Dashboard', level: 1 })).toBeVisible();
  });
});
