// spec: specs/candidate-management.md
// seed: tests/seed-candidate.spec.ts

import { test, expect } from '@playwright/test';
import { login, goToCandidateList, createSyntheticCandidate, searchFor, archiveCandidateFromActiveList } from '../helpers/candidate-helpers';

test.describe('A. Manage Candidates - List Page', () => {
  test('A5. Inline status update', async ({ page }) => {
    await login(page);
    await goToCandidateList(page);
    const name = await createSyntheticCandidate(page, { lastNameSuffix: 'A5' });

    await searchFor(page, 'Candidate A5');
    const row = page.getByRole('row', { name });
    await expect(row.getByText('NEW REQUEST')).toBeVisible();

    // 1. Click the status badge/dropdown
    await row.getByText('NEW REQUEST').click();

    // 2. Select a different status. Note: this overlay's items are not exposed via ARIA
    // roles (accessibility gap, see report), so a text locator is used deliberately. The
    // dropdown overlay renders last in the DOM (as a portal), so .last() targets its
    // option rather than an unrelated existing row already showing "PASSED".
    await page.getByText('PASSED', { exact: true }).last().click();

    // Selecting a status opens a "Change Status" confirmation dialog that must be confirmed.
    await expect(page.getByRole('heading', { name: 'Change Status' })).toBeVisible();
    await page.getByRole('button', { name: 'Confirm' }).click();

    // PREVIOUSLY KNOWN APP DEFECT, NOW CONFIRMED FIXED (see defect-A5-status-change-to-passed-fails.png
    // for the original evidence, and specs/candidate-list-exploratory-results.md for this
    // session's re-check): confirming a PASSED transition used to make PATCH
    // .../candidate/{id}/status/{statusId} always return HTTP 400 {"message":"Candidate not
    // allowed to update"}, leaving the badge silently stuck on its previous value. Re-verified
    // live this session (2026-09-22) with direct network inspection: the same PATCH call now
    // returns HTTP 200 with candidateStatus.title "PASSED" in the response body, and the badge
    // updates as expected. Left as a real (not weakened) assertion, since it now genuinely
    // reflects the app's current, correct behavior rather than documenting a defect.
    await expect(row.getByText('PASSED')).toBeVisible();

    // 3. Reload the page - the change persisted server-side
    await page.reload();
    await searchFor(page, 'Candidate A5');
    await expect(page.getByRole('row', { name }).getByText('PASSED')).toBeVisible();

    // cleanup
    await archiveCandidateFromActiveList(page, name);
  });
});
