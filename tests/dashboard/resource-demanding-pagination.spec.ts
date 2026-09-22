// spec: specs/dashboard-test-plan.md (DASH04-4)
// exploratory: pagination is rendered by the shared <app-aw-pagination> component - prev
// chevron / active page "1" / next chevron, both chevrons carrying a `disabled` class (single-
// page dataset), plus a "Total: N" message line.

import { test, expect } from '@playwright/test';
import { login } from '../helpers/candidate-helpers';

test.describe('RMS-DASH-04: View Resource Demanding table', () => {
  test('DASH04-4. Pagination controls and total count render', async ({ page }) => {
    await login(page);

    const rd = page.locator('app-dashboard-resource-demanding');
    const pagination = rd.locator('app-aw-pagination');
    await expect(pagination).toBeVisible();
    await expect(pagination.locator('.page-note-item.active')).toHaveText('1');
    await expect(pagination.getByText(/^Total:\s*\d+$/)).toBeVisible();
  });
});
