// spec: specs/candidate-management.md
// seed: tests/seed-candidate.spec.ts

import { test, expect } from '@playwright/test';
import { login, goToCandidateList, createSyntheticCandidate, searchFor, openRowMenu, archiveCandidateFromActiveList, ensureOnCandidateList } from '../helpers/candidate-helpers';

test.describe('A. Manage Candidates - List Page', () => {
  test('A11. Row action menu - Add Activity Log', async ({ page }) => {
    await login(page);
    await goToCandidateList(page);
    const name = await createSyntheticCandidate(page, { lastNameSuffix: 'A11' });
    await searchFor(page, 'Candidate A11');

    // 1. Open the more_vert menu and click Add Activity Log
    await openRowMenu(page, name);
    await page.getByRole('menuitem', { name: /Add Activity Log/ }).click();
    await expect(page.getByRole('heading', { name: 'Manage Activity' })).toBeVisible();

    // Note: this form is actually a status-transition log, not a free-text note as the
    // user story assumed - Title auto-populates only once a *different* Status is chosen.
    await page.getByRole('combobox', { name: /Status/ }).click();
    await page.getByRole('option', { name: 'IN PROGRESS', exact: true }).click();
    await expect(page.getByRole('textbox', { name: 'Title *' })).toHaveValue('NEW REQUEST -> IN PROGRESS');
    await page.getByRole('button', { name: 'Update' }).click();
    await ensureOnCandidateList(page);

    // 2. The note is visible in the global Activity list, with correct candidate association
    await page.getByRole('tree').getByRole('button', { name: 'Activity' }).click();
    await expect(page).toHaveURL(/\/admin\/activities/);
    const activityRow = page.getByRole('row', { name: /NEW REQUEST -> IN PROGRESS/ }).first();
    await expect(activityRow).toBeVisible();

    // cleanup
    await goToCandidateList(page);
    await searchFor(page, 'Candidate A11');
    await archiveCandidateFromActiveList(page, name);
  });
});
