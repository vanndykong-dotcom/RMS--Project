// spec: specs/candidate-management.md
// seed: tests/seed-candidate.spec.ts

import { test, expect } from '@playwright/test';
import {
  login, goToCandidateList, createSyntheticCandidate, searchFor, clickRowMenuItem, waitForRowAfterWrite,
} from '../helpers/candidate-helpers';

test.describe('E. Archive Management', () => {
  test('E1. Archived candidate data integrity', async ({ page }) => {
    await login(page);
    await goToCandidateList(page);
    const name = await createSyntheticCandidate(page, { lastNameSuffix: 'E1' });
    await searchFor(page, 'Candidate E1');

    // 1. Record all visible field values before archiving
    const rowBefore = page.getByRole('row', { name });
    await expect(rowBefore).toBeVisible();
    const valuesBefore = await rowBefore.allTextContents();

    // 2. Archive the candidate. Uses clickRowMenuItem (rather than a bare openRowMenu +
    // click) for resilience against the list occasionally re-rendering (background refresh)
    // mid-interaction - see candidate-helpers.ts.
    await clickRowMenuItem(page, name, /Add to archive/);
    await page.getByRole('button', { name: 'Confirm' }).click();

    // 3. Open the same candidate in the Archive view. The app has an observed read-after-
    // write lag - the just-archived record does not always show up in the very next
    // filtered search, only in a later one (see report - flagged as a candidate app defect) -
    // so waitForRowAfterWrite retries the search itself rather than a one-shot assertion.
    await searchFor(page, '');
    await page.getByRole('button', { name: 'Archive' }).click();
    const rowAfter = await waitForRowAfterWrite(page, name, 'Candidate E1');
    const valuesAfter = await rowAfter.allTextContents();

    // All field values match exactly what was recorded before archiving
    expect(valuesAfter).toEqual(valuesBefore);
  });
});
