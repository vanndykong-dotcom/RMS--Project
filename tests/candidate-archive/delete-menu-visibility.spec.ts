// spec: specs/candidate-delete-test-plan.md
// seed: tests/seed-candidate.spec.ts

import { test, expect } from '@playwright/test';
import {
  login, goToCandidateList, createSyntheticCandidate, searchFor, archiveCandidateFromActiveList, waitForRowAfterWrite,
} from '../helpers/candidate-helpers';

test.describe('F. Archive View - Delete Action', () => {
  test('F1. Archive view row menu shows Restore and Delete', async ({ page }) => {
    await login(page);
    await goToCandidateList(page);
    const name = await createSyntheticCandidate(page, { lastNameSuffix: 'F1' });
    await searchFor(page, 'Candidate F1');
    await archiveCandidateFromActiveList(page, name);

    // 1. Open the Archive view and confirm the synthetic candidate is present.
    await searchFor(page, '');
    await page.getByRole('button', { name: 'Archive' }).click();
    const row = await waitForRowAfterWrite(page, name, 'Candidate F1');

    // 2. Open the ⋮ (more_vert) action menu for that row.
    await row.getByRole('button').last().click();
    const menuItems = await page.getByRole('menuitem').allTextContents();

    // Menu shows exactly Restore and Delete (no other items).
    expect(menuItems).toHaveLength(2);
    expect(menuItems.some((item) => /Restore/i.test(item))).toBe(true);
    expect(menuItems.some((item) => /Delete/i.test(item))).toBe(true);
  });
});
