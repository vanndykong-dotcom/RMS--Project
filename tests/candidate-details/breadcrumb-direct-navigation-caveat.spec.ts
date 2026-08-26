// spec: specs/candidate-details-test-plan.md (CAND10-2)
// exploratory: documents a CAVEAT, not a fixed happy path - a direct/cold page.goto() to the
// detail URL was observed to render an empty `<nav class="aw-breadcrumb"><ul></ul></nav>` in
// exploration, vs. rendering correctly via in-app navigation (see breadcrumb.spec.ts). This
// test intentionally does not hard-assert the link count either way, since the underlying
// cause (timing vs. a genuine router-data resolution gap) was not conclusively isolated -
// it exists to surface/document current behavior for future automation, per the plan.

import { test, expect } from '@playwright/test';
import { login, goToCandidateDetails } from '../helpers/candidate-helpers';

test.describe('RMS-CAND-10: Breadcrumb navigation', () => {
  test('CAND10-2. Direct URL navigation may render an empty breadcrumb (documents a caveat)', async ({ page }) => {
    await login(page);
    // Reach a real, currently-existing candidate ID via the normal in-app path first - never
    // hardcode an ID from a prior exploration session, since the live candidate list has
    // churned before (27 -> 15 rows across sessions per the exploratory results).
    await goToCandidateDetails(page, 'Vk KONG');
    const detailUrl = page.url();

    // Cold/direct load, bypassing the candidate list.
    await page.goto(detailUrl);
    await expect(page.locator('h2.profile-header-name')).toBeVisible();

    const breadcrumb = page.locator('nav.aw-breadcrumb');
    await expect(breadcrumb).toBeVisible();
    const linkCount = await breadcrumb.getByRole('link').count();
    // Documented caveat only - NOT asserted as pass/fail either way, since the underlying
    // cause wasn't conclusively isolated in exploration.
    console.log(`CAND10-2: breadcrumb link count after direct navigation = ${linkCount}`);
  });
});
