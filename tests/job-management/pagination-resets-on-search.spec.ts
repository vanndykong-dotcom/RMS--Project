// spec: specs/job-management-test-plan.md (JOB07-2)
// exploratory: a genuine multi-page result set could not be observed live - the current 11-row
// dataset fits entirely within one pageSize=15 page. This is a documented coverage gap
// (consistent with the same gap already flagged in the Advance Report and Calendar plans), not
// a silently-skipped scenario - it asserts the single-page state directly and documents the
// gap rather than fabricating a page-2+ scenario.

import { test, expect } from '@playwright/test';
import { login, goToJobDescriptions, searchJobDescriptions } from '../helpers/candidate-helpers';

test.describe('RMS-JOB-07: Paginate the job description list', () => {
  test('JOB07-2. Search resets to page 1 (best-effort - dataset is currently single-page)', async ({ page }) => {
    await login(page);
    await goToJobDescriptions(page);

    const activePage = page.locator('.page-note-item.active');
    await expect(activePage).toHaveText('1');

    // COVERAGE GAP: with only 11 rows (max 15 per page), there is no page 2+ to navigate away
    // from first - this only confirms the page indicator stays "1" through a search, not a
    // genuine reset from a later page.
    await searchJobDescriptions(page, 'automation');
    await expect(activePage).toHaveText('1');

    await searchJobDescriptions(page, '');
  });
});
