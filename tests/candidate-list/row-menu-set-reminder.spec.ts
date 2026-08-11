// spec: specs/candidate-management.md
// seed: tests/seed-candidate.spec.ts

import { test, expect } from '@playwright/test';
import { login, goToCandidateList, createSyntheticCandidate, searchFor, clickRowMenuItem, archiveCandidateFromActiveList, ensureOnCandidateList, waitForRowAfterWrite } from '../helpers/candidate-helpers';

test.describe('A. Manage Candidates - List Page', () => {
  test('A9. Row action menu - Set Reminder', async ({ page }) => {
    await login(page);
    await goToCandidateList(page);
    const name = await createSyntheticCandidate(page, { lastNameSuffix: 'A9' });
    await searchFor(page, 'Candidate A9');

    // 1. Open the more_vert menu and click Set Reminder. Uses clickRowMenuItem (rather than
    // a bare openRowMenu + click) for resilience against the list occasionally re-rendering
    // (background refresh) mid-interaction - see candidate-helpers.ts.
    await clickRowMenuItem(page, name, /Set Reminder/);
    await expect(page.getByRole('heading', { name: 'Manage Create reminder' })).toBeVisible();

    // 2. Fill in a title (Title is a plain textbox on this form) and save
    await page.getByRole('textbox', { name: 'title' }).fill('QA E2E automated reminder test');
    await page.getByRole('button', { name: 'Save' }).click();
    await ensureOnCandidateList(page);

    // 3. Navigate to the Reminder section - the new reminder appears, associated with the
    // candidate. The list is paginated, so filter by the reminder's own title to find it
    // regardless of what page it would otherwise land on. The app has an observed read-
    // after-write lag - a just-created reminder does not always show up in the very next
    // filtered search, only in a later one (see report - flagged as a candidate app defect) -
    // so waitForRowAfterWrite retries the search itself rather than a one-shot search + assert.
    await page.getByRole('tree').getByRole('button', { name: 'Reminder' }).click();
    await expect(page).toHaveURL(/\/admin\/reminders/);
    const reminderRow = await waitForRowAfterWrite(page, /QA E2E automated reminder test/, 'QA E2E automated reminder test');
    await expect(reminderRow.getByRole('link', { name })).toBeVisible();

    // cleanup
    await goToCandidateList(page);
    await searchFor(page, 'Candidate A9');
    await archiveCandidateFromActiveList(page, name);
  });
});
