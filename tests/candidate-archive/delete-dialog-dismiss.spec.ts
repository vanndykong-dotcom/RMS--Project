// spec: specs/candidate-delete-test-plan.md
// seed: tests/seed-candidate.spec.ts

import { test, expect } from '@playwright/test';
import {
  login, goToCandidateList, createSyntheticCandidate, searchFor, clickRowMenuItem, archiveCandidateFromActiveList, waitForRowAfterWrite,
} from '../helpers/candidate-helpers';

test.describe('F. Archive View - Delete Action', () => {
  test('F3. Delete dialog dismisses via the close (X) icon without deleting', async ({ page }) => {
    await login(page);
    await goToCandidateList(page);
    const name = await createSyntheticCandidate(page, { lastNameSuffix: 'F3' });
    await searchFor(page, 'Candidate F3');
    await archiveCandidateFromActiveList(page, name);

    await searchFor(page, '');
    await page.getByRole('button', { name: 'Archive' }).click();
    const row = await waitForRowAfterWrite(page, name, 'Candidate F3');

    // 1. Open Delete confirmation dialog.
    await clickRowMenuItem(page, name, 'Delete');
    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible();

    // 2. Dismiss via the close ("X") icon instead of Cancel or Confirm.
    // Known defect (see report): this icon button exposes no accessible name (its icon
    // is aria-hidden and the button has no aria-label), unlike Cancel/Confirm - it can only
    // be targeted structurally (first button in the dialog, before Cancel/Confirm), not by
    // role+name like every other control in this suite.
    await dialog.getByRole('button').first().click();
    await expect(dialog).not.toBeVisible();

    // The candidate record still exists in the Archive view (not deleted).
    await expect(row).toBeVisible();

    // cleanup: restore the synthetic candidate back to the active list.
    await clickRowMenuItem(page, name, 'Restore');
    await page.getByRole('button', { name: 'Confirm' }).click();
  });
});
