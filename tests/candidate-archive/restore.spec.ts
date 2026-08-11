// spec: specs/candidate-management.md
// seed: tests/seed-candidate.spec.ts

import { test } from '@playwright/test';
import {
  login, goToCandidateList, createSyntheticCandidate, searchFor, clickRowMenuItem, archiveCandidateFromActiveList, waitForRowAfterWrite,
} from '../helpers/candidate-helpers';

test.describe('E. Archive Management', () => {
  test('E2. Restore from archive', async ({ page }) => {
    await login(page);
    await goToCandidateList(page);
    const name = await createSyntheticCandidate(page, { lastNameSuffix: 'E2' });
    await searchFor(page, 'Candidate E2');
    await archiveCandidateFromActiveList(page, name);

    // 1. In the Archive view, a restore row action exists. The app has an observed read-
    // after-write lag - the just-archived record does not always show up in the very next
    // filtered search, only in a later one (see report - flagged as a candidate app defect) -
    // so waitForRowAfterWrite retries the search itself rather than a one-shot search + assert.
    await searchFor(page, '');
    await page.getByRole('button', { name: 'Archive' }).click();
    await waitForRowAfterWrite(page, name, 'Candidate E2');

    // 2. Restore the candidate and check the main Manage Candidates list. Uses
    // clickRowMenuItem (rather than a bare openRowMenu + click) for resilience against the
    // list occasionally re-rendering (background refresh) mid-interaction - see
    // candidate-helpers.ts. It also implicitly proves the "Restore" action exists: it throws
    // (failing the test) if that menu item is never found after its retries.
    await clickRowMenuItem(page, name, 'Restore');
    await page.getByRole('button', { name: 'Confirm' }).click();

    await searchFor(page, '');
    await page.getByRole('button', { name: 'Archive' }).click(); // toggle back to active list
    await waitForRowAfterWrite(page, name, 'Candidate E2');

    // cleanup
    await archiveCandidateFromActiveList(page, name);
  });
});
