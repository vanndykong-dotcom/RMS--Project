// spec: specs/candidate-details-test-plan.md (CAND09-1)
// exploratory: "Interview result" is visually distinct (filled/primary) from the 4 secondary
// (outlined) header buttons. It opens an IN-PLACE dialog (URL unchanged) titled with the
// CANDIDATE'S OWN NAME (not literally "Interview Result"), showing read-only Apply for/Date &
// Time/Interviewers/Description plus an editable "Interview Result" section (Quiz*, Coding*,
// Average, English*, Logical*, Flexibility*, Oral question*, Description). CONFIRMED DEFECT:
// the dialog's read-only status summary reads "New Reqeust" (misspelled) - assert the current
// mis-spelled text, do not assume it will read "New Request".

import { test, expect } from '@playwright/test';
import { login, goToCandidateDetails } from '../helpers/candidate-helpers';

test.describe('RMS-CAND-09: Record an interview result (entry point only)', () => {
  test('CAND09-1. "Interview result" is the primary button and opens a pre-filled in-place dialog (entry point only - do not update)', async ({ page }) => {
    // Confirmed live: this dialog (a real `role="dialog"` mat-dialog-container, content
    // verified correct) renders ~950px tall - taller than the default 720px headless viewport -
    // and its Cancel button sits below the fold with no working internal scroll, so a normal
    // click on it hangs forever (Playwright's own scroll-into-view never brings it on-screen).
    // Same fix already used by set-interview-entry-point.spec.ts for the same class of issue.
    await page.setViewportSize({ width: 1280, height: 1600 });
    await login(page);
    await goToCandidateDetails(page, 'Raksa CHANN');

    const interviewResultBtn = page.locator('.sub-navigation', { hasText: 'Interview result' });
    const addActivityBtn = page.locator('.sub-navigation', { hasText: 'Add activity' });
    const irBg = await interviewResultBtn.evaluate((el) => getComputedStyle(el).backgroundColor);
    const aaBg = await addActivityBtn.evaluate((el) => getComputedStyle(el).backgroundColor);
    // Visually distinct (filled/primary) vs. the secondary/outlined buttons.
    expect(irBg).not.toBe(aaBg);

    const statusBadgeBefore = await page.locator('.profile-header-status span').textContent();
    const urlBefore = page.url();

    await interviewResultBtn.click();
    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible();
    expect(page.url()).toBe(urlBefore);

    await expect(dialog.getByText('Apply for', { exact: false })).toBeVisible();
    await expect(dialog.getByText('Date & Time', { exact: false })).toBeVisible();
    await expect(dialog.getByText('Interviewers', { exact: false })).toBeVisible();
    await expect(dialog.getByText('Interview Result', { exact: false })).toBeVisible();
    await expect(dialog.getByText('Quiz', { exact: false })).toBeVisible();
    await expect(dialog.getByText('Coding', { exact: false })).toBeVisible();

    // Confirmed spelling defect - assert the current mis-spelling, not the correct "New Request".
    await expect(dialog.getByText('New Reqeust')).toBeVisible();

    // Never Update - entry point only.
    await dialog.getByRole('button', { name: 'Cancel' }).click();
    await expect(dialog).not.toBeVisible();

    await expect(page.locator('.profile-header-status span')).toHaveText(statusBadgeBefore ?? '');
  });
});
