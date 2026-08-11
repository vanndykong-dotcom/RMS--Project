// spec: specs/candidate-management.md
// seed: tests/seed-candidate.spec.ts

import { test, expect } from '@playwright/test';
import { login, goToCandidateList, searchFor } from '../helpers/candidate-helpers';

test.describe('A. Manage Candidates - List Page', () => {
  test('A2. Search candidates by keyword', async ({ page }) => {
    await login(page);
    await goToCandidateList(page);

    // 1. Type 'Van' into the search box on the right above the table
    await searchFor(page, 'Van');

    // 2. Observe the filtered results
    const grid = page.getByRole('grid');
    await expect(grid.getByRole('row', { name: /Sovan NI/ })).toBeVisible();
    await expect(grid.getByRole('row', { name: /Vanndy VK/ })).toBeVisible();
    await expect(grid.getByRole('row', { name: /Vannyda PICH/ })).toBeVisible();
    await expect(page.getByText('Total: 3')).toBeVisible();

    // A search with no matches shows an empty result, not an error
    await searchFor(page, 'zzzznotfound');
    await expect(page.getByText('Total: 0')).toBeVisible();

    // 3. Clear the search box - restores the full, unfiltered list (debounced, so retry)
    await searchFor(page, '');
    await expect
      .poll(async () => (await page.getByText(/^Total: \d+$/).textContent()) ?? '')
      .not.toBe('Total: 0');
    const totalAfterClear = await page.getByText(/^Total: \d+$/).textContent();
    expect(totalAfterClear).not.toBe('Total: 3');
  });
});
