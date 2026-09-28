// spec: specs/candidate-list-test-plan.md (RMS-CANDLIST-11, CL11-2)
// seed: tests/seed-candidate.spec.ts
// Read-only: the dialog is opened and cancelled, never saved. row-menu-set-interview.spec.ts
// covers the full save flow on a synthetic candidate.

import { test, expect } from '@playwright/test';
import { login, goToCandidateList, searchFor, clickRowMenuItem } from '../helpers/candidate-helpers';

test.describe('RMS-CANDLIST-11. Row action - Set Interview', () => {
  test('CL11-2. Set Interview opens pre-filled with the candidate and applied-for position', async ({ page }) => {
    // Same tall-dialog workaround as row-menu-set-interview.spec.ts (Cancel sits below the fold)
    await page.setViewportSize({ width: 1280, height: 1600 });
    await login(page);
    await goToCandidateList(page);

    // Phumra CHAN's applied-for position is "Java Backend Developer" (subtitle under the name)
    await searchFor(page, 'Phumra');
    await expect(page.getByRole('row', { name: /Phumra CHAN/ })).toContainText('Java Backend Developer');

    await clickRowMenuItem(page, /Phumra CHAN/, /Set Interview/);
    const dialog = page.getByRole('dialog');
    await expect(dialog.getByText('Set Interview')).toBeVisible();

    // 1. Candidate identity is pre-filled
    await expect(dialog.getByRole('combobox').first()).toHaveText(/Mr\. Phumra CHAN/);

    // 2. "Apply for" is pre-filled from the candidate's applied-for position. (It is empty for
    // candidates with no position, e.g. Sovan NI - that is expected, not a defect.)
    // Comboboxes in the dialog, in order: Candidate, Interviewers, Apply for.
    const applyFor = dialog.getByRole('combobox').nth(2);
    try {
      await expect(applyFor).toHaveText(/Java Backend Developer/);
    } finally {
      // 3. Cancel - nothing is saved, even when an assertion above fails
      await dialog.getByRole('button', { name: 'Cancel' }).click();
      await expect(dialog).toBeHidden();
    }
  });
});
