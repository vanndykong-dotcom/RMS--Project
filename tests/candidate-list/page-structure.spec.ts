// spec: specs/candidate-management.md
// seed: tests/seed-candidate.spec.ts

import { test, expect } from '@playwright/test';

test.describe('A. Manage Candidates - List Page', () => {
  test('A1. Page loads with correct structure', async ({ page }) => {
    await page.goto('https://rms-dev.allweb.com.kh/welcome');
    await page.getByRole('textbox', { name: 'Enter Username' }).fill(process.env.FAPA_EMAIL as string);
    await page.getByRole('textbox', { name: 'Enter Password' }).fill(process.env.FAPA_PASSWORD as string);
    await page.getByRole('button', { name: 'Login' }).click();
    await expect(page).toHaveURL(/\/admin\/dashboard/);
    await page.getByRole('tree').getByRole('button', { name: 'Candidate' }).click();
    await expect(page).toHaveURL(/\/admin\/candidate/);

    // 1. Observe the breadcrumb, page title, and table
    const breadcrumb = page.getByRole('navigation').filter({ hasText: 'Candidates' }).first();
    await expect(breadcrumb.getByRole('link', { name: 'Dashboard' })).toBeVisible();
    await expect(breadcrumb.getByRole('link', { name: 'Candidates' })).toBeVisible();
    await expect(breadcrumb.getByText('List candidates')).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Manage Candidates' })).toBeVisible();
    await expect(page.getByText('List all candidate')).toBeVisible();

    // Archive (red outline) and + Add (solid blue) buttons visible top-right
    await expect(page.getByRole('button', { name: 'Archive' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Add' })).toBeVisible();

    // Filter dropdown and dedicated table search box are visible above the table
    await expect(page.getByRole('button', { name: 'aw-dropdown-icon Filter' })).toBeVisible();
    const tableSearch = page.locator('app-aw-layout-list').getByRole('textbox', { name: 'Search' });
    await expect(tableSearch).toBeVisible();

    // Table columns appear in this order
    const headerRow = page.getByRole('grid').getByRole('row').first();
    const columnNames = await headerRow.getByRole('columnheader').allTextContents();
    // Sortable columns append an icon ligature (e.g. "arrow_upward") after the label -
    // strip anything that isn't a letter/space so only the label itself is compared.
    const normalized = columnNames.map((c) => c.replace(/[^a-z ]/gi, ' ').trim().toLowerCase().replace(/\s+/g, ' '));
    expect(normalized).toEqual([
      'no', 'photo', 'full name', 'gender', 'age', 'phone', 'university',
      'gpa', 'experience', 'priority', 'status', 'interview', 'created', 'action',
    ]);

    // Pagination control and Total count are shown below the table
    await expect(page.getByText(/^Total: \d+$/)).toBeVisible();
  });
});
