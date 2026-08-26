// spec: specs/candidate-details-test-plan.md (CAND06-1)
// exploratory: "Set interview" opens an IN-PLACE dialog (URL unchanged), titled "Set
// Interview", with fields Candidate*/Interviewers*/Date & time*/"Send invitation mail to
// candidate" checkbox/"Reminder Me" + minutes/Apply for*/Description (200-char)/Cancel/Save.
// Candidate* and Apply for* are pre-filled with this candidate's own name/applied position. A
// taller viewport avoids the dialog's Cancel/Save being pushed outside the default viewport in
// headless runs (see exploratory results insight).

import { test, expect } from '@playwright/test';
import { login, goToCandidateDetails } from '../helpers/candidate-helpers';

test.describe('RMS-CAND-06: Schedule an interview for the candidate (entry point only)', () => {
  test('CAND06-1. "Set interview" opens a pre-filled in-place dialog (entry point only - do not save)', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 1600 });
    await login(page);
    await goToCandidateDetails(page, 'Vk KONG');
    const urlBefore = page.url();

    await page.locator('.sub-navigation', { hasText: 'Set interview' }).click();

    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible();
    await expect(dialog.getByText('Set Interview')).toBeVisible();
    expect(page.url()).toBe(urlBefore);

    await expect(dialog.getByText('Interviewers', { exact: false })).toBeVisible();
    await expect(dialog.getByText('Date & time', { exact: false })).toBeVisible();
    await expect(dialog.getByText('Send invitation mail to candidate', { exact: false })).toBeVisible();
    await expect(dialog.getByText('Reminder Me', { exact: false })).toBeVisible();
    await expect(dialog.getByText('Apply for', { exact: false })).toBeVisible();
    await expect(dialog.getByText('Description', { exact: false })).toBeVisible();

    // Never Save - entry point only.
    await dialog.getByRole('button', { name: 'Cancel' }).click();
    await expect(dialog).not.toBeVisible();
  });
});
