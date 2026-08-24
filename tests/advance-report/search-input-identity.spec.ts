// spec: specs/advance-report-test-plan.md (RPT05-1)
// exploratory: exactly 2 elements match input[placeholder="Search"] on this page - the left
// sidebar nav's own filter box (x~22) and the report's own search box (x~1372, top-right of
// the table). The global topbar search has a distinct, longer label and is not part of
// this count - it is not actually an input with a placeholder attribute at all, but a plain
// <button> whose visible text reads "Search: Name, phone number, university, GPA,
// Status...", so getByPlaceholder() for it always resolves to 0 elements; getByText() is the
// correct way to identify it. The report's own box is targeted as .nth(1) after excluding
// the sidebar one.

import { test, expect } from '@playwright/test';
import { login, goToAdvanceReport } from '../helpers/candidate-helpers';

test.describe('RMS-RPT-05: Search within the report', () => {
  test('RPT05-1. Search input identity', async ({ page }) => {
    await login(page);
    await goToAdvanceReport(page);

    const genericSearchBoxes = page.locator('input[placeholder="Search"]');
    await expect(genericSearchBoxes).toHaveCount(2);

    const topbarSearch = page.getByText('Search: Name, phone number, university, GPA, Status...', { exact: true });
    await expect(topbarSearch).toHaveCount(1);

    // The report's own search box is the second "Search"-placeholder input (index 1), after
    // the sidebar nav's own filter box (index 0).
    const reportSearch = genericSearchBoxes.nth(1);
    await expect(reportSearch).toBeVisible();
  });
});
