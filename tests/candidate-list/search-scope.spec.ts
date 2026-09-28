// spec: specs/candidate-list-test-plan.md (RMS-CANDLIST-02, CL02-3)
// seed: tests/seed-candidate.spec.ts
// Resolves the story's open question "exact fields covered by Search on this page" against
// read-only fixtures. Phone is NOT searched on this page even though the Dashboard's global
// search placeholder advertises "Name, phone number, university, GPA, Status" - asserted as
// the current behaviour (documented scope gap, see exploratory results), not weakened.

import { test, expect } from '@playwright/test';
import { login, goToCandidateList, searchFor } from '../helpers/candidate-helpers';

test.describe('RMS-CANDLIST-02. Search scope', () => {
  test('CL02-3. Search matches name (case-insensitive), position and university, not phone', async ({ page }) => {
    await login(page);
    await goToCandidateList(page);
    const grid = page.getByRole('grid');
    const total = page.getByText(/^Total: \d+$/);

    // 1. Lower-case name - search is case-insensitive
    await searchFor(page, 'phumra');
    await expect(grid.getByRole('row', { name: /Phumra CHAN/ })).toBeVisible();
    await expect(total).toHaveText('Total: 1');

    // 2. Applied-for position is searched
    await searchFor(page, 'Java Backend');
    await expect(grid.getByRole('row', { name: /Phumra CHAN/ })).toBeVisible();

    // 3. University is searched - every returned row mentions it
    await searchFor(page, 'Norton');
    const rows = grid.getByRole('rowgroup').nth(1).getByRole('row');
    await expect(rows.first()).toContainText('Norton University');
    for (const text of await rows.allInnerTexts()) expect(text).toContain('Norton University');

    // 4. Phone is not searched - Phumra CHAN's exact phone number returns nothing
    await searchFor(page, '088 933 9739');
    await expect(total).toHaveText('Total: 0');
  });
});
