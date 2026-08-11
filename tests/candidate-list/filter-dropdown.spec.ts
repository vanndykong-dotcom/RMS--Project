// spec: specs/candidate-management.md
// seed: tests/seed-candidate.spec.ts

import { test, expect } from '@playwright/test';
import { login, goToCandidateList } from '../helpers/candidate-helpers';

test.describe('A. Manage Candidates - List Page', () => {
  test('A3. Filter dropdown', async ({ page }) => {
    await login(page);
    await goToCandidateList(page);

    // 1. Click the Filter button above the table
    await page.getByRole('button', { name: 'aw-dropdown-icon Filter' }).click();

    // 2. Note which filter fields are offered (scoped to the filter menu itself, since
    // "INTERVIEW" and "REMINDER" also appear elsewhere on the page, e.g. the sidebar nav)
    const filterMenu = page.getByRole('menu');
    await expect(filterMenu.getByText('INTERVIEW', { exact: true })).toBeVisible();
    await expect(filterMenu.getByText('REMINDER', { exact: true })).toBeVisible();
    const statusGroup = page.getByRole('radiogroup', { name: 'Select an option' });
    for (const status of ['ALL', 'ATTENDED', 'CANCELED', 'FAILED', 'FOLLOWING UP', 'IN PROGRESS', 'MISSED', 'NEW REQUEST', 'PASSED', 'WAIT FOR FEEDBACK']) {
      await expect(statusGroup.getByText(status, { exact: true })).toBeVisible();
    }

    // 3. Apply one filter value and confirm
    const totalText = page.getByText(/^Total: \d+$/);
    const totalBefore = await totalText.textContent();
    await statusGroup.getByText('NEW REQUEST', { exact: true }).click();
    await expect.poll(async () => (await totalText.textContent()) ?? '').not.toBe(totalBefore);
    const filteredTotal = await totalText.textContent();

    // 4. Clear/reset the filter
    await page.getByRole('menuitem', { name: 'Filter Reset' }).getByText('Reset').click();
    await expect.poll(async () => (await totalText.textContent()) ?? '').not.toBe(filteredTotal);
  });
});
