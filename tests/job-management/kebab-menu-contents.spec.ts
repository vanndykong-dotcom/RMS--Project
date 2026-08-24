// spec: specs/job-management-test-plan.md (JOB06-1)
// exploratory: button[mattooltip="More"] opens a role=menu with exactly 4 role=menuitems, in
// order: "Get file" (picture_as_pdf icon), "Modify", "Delete", "Share". Both "Modify" and
// "Delete" render an <img alt="delete icon"> for their icon, so `name: 'Delete'` alone is
// ambiguous (its accessible name substring-matches "delete icon Modify" too via the shared
// icon alt text) - the full accessible name ('delete icon Delete') disambiguates.

import { test, expect } from '@playwright/test';
import { login, goToJobDescriptions, getJobRowByExactTitle, openJobRowMenu } from '../helpers/candidate-helpers';

test.describe('RMS-JOB-06: Row action menu - Modify, Delete, Share, Get file', () => {
  test('JOB06-1. Kebab menu contents, exact order', async ({ page }) => {
    await login(page);
    await goToJobDescriptions(page);

    const row = getJobRowByExactTitle(page, 'QA Automation');
    await openJobRowMenu(row);

    const menu = page.getByRole('menu');
    await expect(menu).toBeVisible();
    const items = menu.getByRole('menuitem');
    await expect(items).toHaveCount(4);
    await expect(items.nth(0)).toHaveText(/Get file/);
    await expect(items.nth(1)).toHaveText(/Modify/);
    await expect(items.nth(2)).toHaveText(/Delete/);
    await expect(items.nth(3)).toHaveText(/Share/);

    // Full accessible name required - 'Delete' alone is ambiguous with 'Modify' via the
    // shared "delete icon" alt text.
    await expect(menu.getByRole('menuitem', { name: 'delete icon Delete' })).toBeVisible();

    await page.keyboard.press('Escape');
    await expect(menu).not.toBeVisible();
  });
});
