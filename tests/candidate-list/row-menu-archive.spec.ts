// spec: specs/candidate-management.md
// seed: tests/seed-candidate.spec.ts

import { test, expect } from '@playwright/test';
import { login, goToCandidateList, createSyntheticCandidate, searchFor, clickRowMenuItem } from '../helpers/candidate-helpers';

test.describe('A. Manage Candidates - List Page', () => {
  test('A13. Row action menu - Add to archive', async ({ page }) => {
    await login(page);
    await goToCandidateList(page);
    const name = await createSyntheticCandidate(page, { lastNameSuffix: 'A13' });

    // 1. Note this candidate is present in the (filtered) active list before archiving.
    // Filtering by its own unique name (rather than the generic "Candidate A13" family
    // prefix) keeps Total meaningful even if a prior run's synthetic candidate was left
    // unarchived, and avoids reading timing noise from other tests running concurrently
    // against this real, shared server.
    await searchFor(page, name.source);
    await expect(page.getByRole('row', { name })).toBeVisible();

    // 2. Open the menu and click Add to archive
    await clickRowMenuItem(page, name, /Add to archive/);

    // A confirmation prompt appears since this is a destructive action
    await expect(page.getByText(/Are you sure you want to archive this candidate/)).toBeVisible();

    // 3. Confirm the archive action
    await page.getByRole('button', { name: 'Confirm' }).click();

    // The candidate is removed from the active (filtered) list
    await searchFor(page, name.source);
    await expect(page.getByText('Total: 0')).toBeVisible();

    // 4. The archived candidate now appears in the Archive view with all data intact
    await searchFor(page, '');
    await page.getByRole('button', { name: 'Archive' }).click();
    await searchFor(page, name.source);

    // Known app defect (confirmed live, see screenshot): the archived candidate genuinely
    // is in the Archive view - it's immediately visible when the Search box is cleared and
    // the list is paginated/sorted by createdAt desc (confirmed via direct inspection of the
    // rendered rows) - but the Archive view's search request
    // (GET .../api/v1/candidate?...&isDeleted=true) does not filter on the Last Name field.
    // Filtering by any Last-Name-only substring (the unique suffix+timestamp used here, or
    // even just the family prefix "A13") reliably returns Total: 0, confirmed by polling for
    // 30+ seconds to rule out an indexing/propagation delay. The equivalent active-list
    // request (isDeleted=false) *does* filter on Last Name - this is a real inconsistency,
    // not a timing issue. Left asserting the expected (currently failing) behavior below,
    // rather than searching by a field that happens to work, so this keeps documenting the
    // defect instead of masking it.
    await page.screenshot({ path: 'defect-A13-archive-search-ignores-lastname.png' });
    await expect(page.getByRole('row', { name })).toBeVisible();
  });
});
