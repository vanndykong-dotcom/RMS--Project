// spec: specs/candidate-list-test-plan.md (RMS-CANDLIST-07, CL07-2)
// seed: tests/seed-candidate.spec.ts
// pagination.spec.ts (A6) covers the prev/next arrows. This covers the numbered page controls
// and page size. Counts are derived from "Total: N" rather than hard-coded, since the shared
// server's candidate count drifts (35 at planning; concurrent runs add synthetic rows).
// Page numbers are plain <span class="page-note-item"> elements (no role, tabIndex -1 - see the
// accessibility finding in the exploratory results), hence the CSS locators.

import { test, expect } from '@playwright/test';
import { login, goToCandidateList } from '../helpers/candidate-helpers';

const PAGE_SIZE = 15;

test.describe('RMS-CANDLIST-07. Pagination and total count', () => {
  test('CL07-2. Numbered pages match the total, the clicked page becomes active', async ({ page }) => {
    await login(page);
    await goToCandidateList(page);

    const rows = page.locator('tbody tr');
    const pageItems = page.locator('.page-note-item');
    const activePage = page.locator('.page-note-item.active');

    const totalText = await page.getByText(/^Total: \d+$/).innerText();
    const total = Number(totalText.replace(/\D/g, ''));
    const pageCount = Math.ceil(total / PAGE_SIZE);
    test.skip(pageCount < 2, 'Fewer than 16 candidates - only one page to check');

    // 1. Page 1 active, one control per page, full first page
    await expect(pageItems).toHaveCount(pageCount);
    await expect(activePage).toHaveText('1');
    await expect(rows).toHaveCount(PAGE_SIZE);
    const page1First = await rows.first().innerText();

    // 2. Click page 2 - it becomes the only active page and shows different rows
    await pageItems.nth(1).click();
    await expect(activePage).toHaveText('2');
    await expect(activePage).toHaveCount(1);
    await expect(rows.first()).not.toHaveText(page1First);

    // 3. Last page holds the remainder, and the total is unchanged
    await pageItems.last().click();
    await expect(activePage).toHaveText(String(pageCount));
    await expect(rows).toHaveCount(total - PAGE_SIZE * (pageCount - 1));
    await expect(page.getByText(totalText, { exact: true })).toBeVisible();
  });
});
