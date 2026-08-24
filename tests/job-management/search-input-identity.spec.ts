// spec: specs/job-management-test-plan.md (JOB02-1)
// exploratory: exactly 2 elements match input[placeholder="Search"] - the sidebar tree's own
// filter box (x~22, carries a `search-sidebar` class on its app-aw-search-box ancestor) and
// the list's own box (x~1052, y~226, inside app-aw-search-box without that class). Ancestor-
// scoping by `app-aw-search-box` alone still matches both - the `:not(.search-sidebar)`
// exclusion is required to isolate the list's own box.

import { test, expect } from '@playwright/test';
import { login, goToJobDescriptions } from '../helpers/candidate-helpers';

test.describe('RMS-JOB-02: Search job descriptions', () => {
  test('JOB02-1. Search input identity - disambiguating the two "Search" boxes', async ({ page }) => {
    await login(page);
    await goToJobDescriptions(page);

    const genericSearchBoxes = page.locator('input[placeholder="Search"]');
    await expect(genericSearchBoxes).toHaveCount(2);

    const sidebarSearch = page.locator('app-aw-search-box.search-sidebar input[placeholder="Search"]');
    await expect(sidebarSearch).toHaveCount(1);

    const listSearch = page.locator('app-aw-search-box:not(.search-sidebar) input[placeholder="Search"]');
    await expect(listSearch).toHaveCount(1);
    await expect(listSearch).toBeVisible();
  });
});
