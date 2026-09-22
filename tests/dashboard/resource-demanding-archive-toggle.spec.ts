// spec: specs/dashboard-test-plan.md (DASH04-5)
// exploratory: resolves the story's open question about "Archive"'s destination. Clicking it
// does NOT navigate and does NOT open a dialog - it's an in-place, reversible view toggle on
// the same table: the single row swaps to a different (archived) demand, and clicking Archive
// again swaps it straight back. Confirmed safe/idempotent across two full toggle cycles live -
// exercised here as a real click since it is read-only (a client-side filter, not a mutation).

import { test, expect } from '@playwright/test';
import { login } from '../helpers/candidate-helpers';

test.describe('RMS-DASH-04: View Resource Demanding table', () => {
  test('DASH04-5. "Archive" toggles the table in place and is fully reversible', async ({ page }) => {
    await login(page);

    const rd = page.locator('app-dashboard-resource-demanding');
    const row = rd.locator('tbody tr').first();
    // Wait for the row to actually be populated before reading it - under this suite's default
    // 3-worker concurrency, the table can still be hydrating right after login() resolves.
    await expect(row).toContainText('VK-Microsoft', { timeout: 10000 });
    const originalText = await row.innerText();

    const archiveBtn = rd.getByRole('button', { name: 'Archive' });
    await archiveBtn.click();
    await expect(page).toHaveURL(/\/admin\/dashboard/);
    await expect(page.locator('[role="dialog"]')).toHaveCount(0);
    await expect(row).not.toContainText('VK-Microsoft');

    await archiveBtn.click();
    await expect(row).toContainText('VK-Microsoft');
    const restoredText = await row.innerText();
    expect(restoredText).toBe(originalText);
  });
});
