// spec: specs/job-management-test-plan.md (JOB05-2)
// exploratory: CONFIRMED DEFECT, reconfirmed across 3 rows spanning very different real ages
// (5 days, ~13.7 months, ~16 months) - the dialog footer reads the IDENTICAL "Created: over 1
// year ago" / "Updated: over 1 year ago" text for all of them, even though the "Job Details"
// tab's own absolute timestamps are correct in every case. The identical text for a 5-day-old
// row and a 16-month-old row rules out a merely-imprecise calculation - this reads as a
// hardcoded string or a duration calculation that always lands in the ">1 year" bucket. This
// test documents the CURRENT (incorrect) behavior rather than asserting the intuitively-correct
// relative time - see specs/job-management-exploratory-results.md and the plan's Open Items #2.

import { test, expect } from '@playwright/test';
import { login, goToJobDescriptions, getJobRowByExactTitle } from '../helpers/candidate-helpers';

test.describe('RMS-JOB-05: View a job description\'s full detail (eye icon)', () => {
  test('JOB05-2. Relative-time defect in the dialog footer', async ({ page }) => {
    await login(page);
    await goToJobDescriptions(page);

    // "QA Automation" was created 19/Aug/2026 01:21 PM - only ~5 days before this test's
    // execution date (2026-08-24) - yet the footer reads "over 1 year ago".
    const row = getJobRowByExactTitle(page, 'QA Automation');
    await row.locator('button[mattooltip="View"]').click();

    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible();

    // CONFIRMED DEFECT - documents current (wrong) behavior, not a fictional correct one.
    await expect(dialog.getByText(/Created:\s*over 1 year ago/i)).toBeVisible();
    await expect(dialog.getByText(/Updated:\s*over 1 year ago/i)).toBeVisible();

    await page.keyboard.press('Escape');
    await expect(dialog).not.toBeVisible();
  });
});
