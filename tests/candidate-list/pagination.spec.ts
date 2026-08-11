// spec: specs/candidate-management.md
// seed: tests/seed-candidate.spec.ts

import { test, expect } from '@playwright/test';
import { login, goToCandidateList } from '../helpers/candidate-helpers';

test.describe('A. Manage Candidates - List Page', () => {
  test('A6. Pagination', async ({ page }) => {
    await login(page);
    await goToCandidateList(page);

    const firstRowName = () => page.getByRole('grid').getByRole('row').nth(1).textContent();
    const totalBefore = await page.getByText(/^Total: \d+$/).textContent();
    const page1FirstRow = await firstRowName();

    // 1. Click the next-page arrow (list re-render is async, so poll rather than read once)
    await page.getByText('keyboard_arrow_right').click();
    await expect.poll(firstRowName).not.toBe(page1FirstRow);
    // Total count reflects the full unpaginated result set, not just the current page
    await expect(page.getByText(totalBefore as string)).toBeVisible();

    // 2. Click the previous-page arrow - returns to page 1
    await page.getByText('keyboard_arrow_left').click();
    await expect.poll(firstRowName).toBe(page1FirstRow);
  });
});
