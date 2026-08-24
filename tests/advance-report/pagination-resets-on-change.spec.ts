// spec: specs/advance-report-test-plan.md (RPT09-2)
// exploratory: resolves the plan's open item #4 (pagination previously unobservable on
// Following Up's 0-1 row dataset) - Summary Full Staff already has 16 rows / 2 pages at its
// own default view, no date-range widening needed. Page numbers render as
// <span class="page-note-item">, not role=button (insight #3).

import { test, expect } from '@playwright/test';
import { login, goToAdvanceReport } from '../helpers/candidate-helpers';

test.describe('RMS-RPT-09: Paginate report results', () => {
  test('RPT09-2. Changing tab/date-range/filter/search resets to page 1', async ({ page }) => {
    await login(page);
    await goToAdvanceReport(page);

    await page.getByRole('tab', { name: 'Summary Full Staff' }).click();

    const page2 = page.locator('span.page-note-item', { hasText: '2' });
    await expect(page2).toBeVisible();
    await page2.click();
    await expect(page.locator('span.page-note-item.active')).toHaveText('2');

    const reportSearch = page.locator('input[placeholder="Search"]').nth(1);
    await reportSearch.fill('QA Automation');

    await expect(page.locator('span.page-note-item.active')).toHaveText('1');
  });
});
