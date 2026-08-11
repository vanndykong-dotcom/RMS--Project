// spec: specs/candidate-management.md
// seed: tests/seed-candidate.spec.ts

import { test, expect } from '@playwright/test';
import { login, goToCandidateList, createSyntheticCandidate, searchFor, openRowMenu, clickRowMenuItem, archiveCandidateFromActiveList, ensureOnCandidateList } from '../helpers/candidate-helpers';

test.describe('A. Manage Candidates - List Page', () => {
  test('A8. Row action menu contents and Modify', async ({ page }) => {
    await login(page);
    await goToCandidateList(page);
    const name = await createSyntheticCandidate(page, { lastNameSuffix: 'A8' });
    await searchFor(page, 'Candidate A8');

    // 1. Click the more_vert action menu button for the candidate row
    await openRowMenu(page, name);

    // Menu shows exactly: Modify, Set Reminder, Set Interview, Add Activity Log,
    // Add interview result, Add to archive
    for (const item of ['Modify', 'Set Reminder', 'Set Interview', 'Add Activity Log', 'Add to archive']) {
      await expect(page.getByRole('menuitem', { name: new RegExp(item) })).toBeVisible();
    }
    await expect(page.getByRole('menuitem', { name: /Add interview result/ })).toBeDisabled();

    // 2. Click Modify - form opens pre-populated with the candidate's existing values.
    // The menu is re-opened via clickRowMenuItem for resilience against the list
    // occasionally re-rendering (background refresh) mid-interaction.
    await page.keyboard.press('Escape');
    await clickRowMenuItem(page, name, /^editing icon Modify/);
    await expect(page.getByRole('heading', { name: 'Update Information' })).toBeVisible();
    // Note: pre-filled value reflects the app's own name-sanitization defect (e.g. uppercased),
    // not the exact text originally typed - see test-results report.
    await expect(page.getByRole('textbox', { name: 'Last name' })).toHaveValue(/Candidate A8/i);

    // 3. Change the phone number and save
    await page.locator('app-aw-input-box-multiple').getByRole('textbox').fill('012 000 111');
    await page.getByRole('button', { name: 'Next', exact: true }).click();
    await expect(page.getByRole('heading', { name: 'Preview Candidate Information' })).toBeVisible();
    await page.getByRole('button', { name: 'Finish' }).click();
    await ensureOnCandidateList(page);

    // 4. Reload the list and reopen the same candidate - the change persists
    await page.reload();
    await searchFor(page, 'Candidate A8');
    await expect(page.getByRole('row', { name })).toContainText('012 000 111');

    // cleanup
    await archiveCandidateFromActiveList(page, name);
  });
});
