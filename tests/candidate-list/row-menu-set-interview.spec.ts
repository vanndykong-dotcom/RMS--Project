// spec: specs/candidate-management.md
// seed: tests/seed-candidate.spec.ts

import { test, expect } from '@playwright/test';
import { login, goToCandidateList, createSyntheticCandidate, searchFor, openRowMenu, clickRowMenuItem, archiveCandidateFromActiveList, selectComboboxOption, pickFutureCalendarDate } from '../helpers/candidate-helpers';

test.describe('A. Manage Candidates - List Page', () => {
  test('A10. Row action menu - Set Interview', async ({ page }) => {
    // The Set Interview dialog is taller than the default viewport, which leaves its Save
    // button unreachable even after scrollIntoViewIfNeeded (dialog-internal scroll, not
    // page scroll) - a larger viewport avoids that entirely.
    await page.setViewportSize({ width: 1280, height: 1600 });
    await login(page);
    await goToCandidateList(page);
    const name = await createSyntheticCandidate(page, { lastNameSuffix: 'A10' });
    await searchFor(page, 'Candidate A10');

    // 1. Open the more_vert menu for a candidate whose Interview column is N/A
    await expect(page.getByRole('row', { name })).toContainText('N/A');
    // The list occasionally re-renders (background refresh) right as the menu opens,
    // detaching the very item being clicked - clickRowMenuItem retries by reopening the
    // menu instead of assuming a one-off actionability hiccup (see its doc comment).
    await clickRowMenuItem(page, name, /Set Interview/);
    // 'Set Interview' also matches the row menu item itself, so scope to the opened dialog.
    await expect(page.getByRole('dialog').getByText('Set Interview')).toBeVisible();

    // 2. Select a required Interviewer.
    await selectComboboxOption(page, 'Interviewers *', 'Chamrong THOR');
    await page.keyboard.press('Escape');

    // 3. Fill in a future interview date/time and save
    const interviewDate = await pickFutureCalendarDate(page);

    // 4. Select "Apply for"
    await selectComboboxOption(page, 'Apply for', 'Software Testing Automation');

    const saveButton = page.getByRole('button', { name: 'Save' });
    await saveButton.scrollIntoViewIfNeeded();
    await saveButton.click();
    // Wait for the dialog to actually close (i.e. the save round-trip to complete) before
    // reloading - reloading immediately on click races the backend persisting the interview,
    // which intermittently left the list still showing N/A after reload.
    await expect(page.getByRole('dialog')).toBeHidden();

    // 3. The candidate's Interview column now shows the scheduled date/time (list may need reload)
    await page.reload();
    await searchFor(page, 'Candidate A10');
    const displayDate = `${String(interviewDate.getDate()).padStart(2, '0')}/${interviewDate.toLocaleString('en-US', { month: 'short' })}/${interviewDate.getFullYear()}`;
    await expect(page.getByRole('row', { name })).toContainText(displayDate);

    // 4. The same interview appears in the Interview Schedule module (some days render more
    // events than fit visually, so this checks DOM presence rather than strict visibility)
    await page.getByRole('tree').getByRole('button', { name: 'Interview Schedule' }).click();
    await expect(page).toHaveURL(/\/admin\/calendar/);
    await expect(page.locator('body')).toContainText('Software Testing Automation');

    // 5. Add interview result is now enabled (business rule: enabled once set, regardless of date)
    await goToCandidateList(page);
    await searchFor(page, 'Candidate A10');
    await openRowMenu(page, name);
    await expect(page.getByRole('menuitem', { name: /Add interview result/ })).toBeEnabled();

    // cleanup
    await page.keyboard.press('Escape');
    await archiveCandidateFromActiveList(page, name);
  });
});
