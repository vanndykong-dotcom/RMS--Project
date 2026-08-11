// spec: specs/candidate-management.md
// seed: tests/seed-candidate.spec.ts

import { test, expect } from '@playwright/test';
import { login, goToCandidateList, createSyntheticCandidate, searchFor, archiveCandidateFromActiveList } from '../helpers/candidate-helpers';

test.describe('B. Add Candidate', () => {
  test('B2. Successfully add a new synthetic candidate', async ({ page }) => {
    await login(page);
    await goToCandidateList(page);

    // 1-5. Fill Step 1 (Information), skip optional Education/Experience, upload the
    // required CV, submit from Preview
    const name = await createSyntheticCandidate(page, { lastNameSuffix: 'B2' });

    // 6. Search for the new candidate. Filtering by its own unique name (rather than the
    // generic "Candidate B2" family prefix) keeps Total meaningful even if a prior run's
    // synthetic candidate was left unarchived, and avoids reading timing noise from other
    // tests running concurrently against this real, shared server.
    await searchFor(page, name.source);
    const row = page.getByRole('row', { name });
    await expect(row).toBeVisible();
    await expect(row).toContainText('NEW REQUEST');
    await expect(page.getByText('Total: 1')).toBeVisible();

    // cleanup
    await searchFor(page, name.source);
    await archiveCandidateFromActiveList(page, name);
  });
});
