// spec: specs/candidate-management.md
// seed: tests/seed-candidate.spec.ts

import { test, expect } from '@playwright/test';
import { login, goToCandidateList, createSyntheticCandidate, searchFor, clickRowMenuItem, archiveCandidateFromActiveList, ensureOnCandidateList } from '../helpers/candidate-helpers';

test.describe('C. Modify Candidate', () => {
  test('C1. Edit and persist candidate details across sessions', async ({ page }) => {
    await login(page);
    await goToCandidateList(page);
    const name = await createSyntheticCandidate(page, { lastNameSuffix: 'C1' });
    await searchFor(page, 'Candidate C1');

    // 1. Modify multiple fields at once: priority and phone number
    await clickRowMenuItem(page, name, /^editing icon Modify/);
    await expect(page.getByRole('heading', { name: 'Update Information' })).toBeVisible();

    await page.locator('app-aw-input-box-multiple').getByRole('textbox').fill('012 999 000');
    // Priority is a "textbox"-styled custom dropdown, same pattern as Salutation - not a
    // native combobox role.
    await page.locator('app-aw-input-box-select').filter({ hasText: 'Priority' }).getByRole('textbox').click();
    await page.getByRole('menuitem', { name: 'High' }).click();

    await page.getByRole('button', { name: 'Next', exact: true }).click();
    await expect(page.getByRole('heading', { name: 'Preview Candidate Information' })).toBeVisible();
    await page.getByRole('button', { name: 'Finish' }).click();
    await ensureOnCandidateList(page);

    // 2. Log out and log back in (new session)
    await page.getByRole('link', { name: 'Super ADMIN' }).click();
    await page.getByRole('menuitem', { name: 'Logout' }).click();
    await expect(page).toHaveURL(/\/welcome/);
    await login(page);
    await goToCandidateList(page);

    // 3. Re-check the record - all changed fields persisted across the new session
    await searchFor(page, 'Candidate C1');
    const row = page.getByRole('row', { name });
    await expect(row).toContainText('012 999 000');
    await expect(row).toContainText('High');

    // cleanup
    await archiveCandidateFromActiveList(page, name);
  });
});
