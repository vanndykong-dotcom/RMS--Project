// spec: specs/advance-report-test-plan.md (RPT09-1)
// exploratory: prev chevron / active page-number / next chevron confirmed present, with
// "Total: {n}" below. Page numbers render as <span class="page-note-item">, not <button> or
// role=button (insight #3) - the active page carries an additional "active" class.

import { test, expect } from '@playwright/test';
import { login, goToAdvanceReport } from '../helpers/candidate-helpers';

test.describe('RMS-RPT-09: Paginate report results', () => {
  test('RPT09-1. Pagination controls and total count text render', async ({ page }) => {
    await login(page);
    await goToAdvanceReport(page);

    const activePage = page.locator('span.page-note-item.active');
    await expect(activePage).toBeVisible();
    await expect(activePage).toHaveText('1');

    await expect(page.getByText(/^Total:\s*\d+$/)).toBeVisible();
  });
});
