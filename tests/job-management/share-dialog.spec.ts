// spec: specs/job-management-test-plan.md (JOB06-4)
// exploratory: "Share" opens a small dialog (<app-share>) titled "Share Job" containing a
// single readonly text input pre-filled with an internal apply-style URL
// (https://rms-dev.allweb.com.kh:8909/apply/{token} pattern) and a "copy to clipboard" icon
// button (content_copy). No email is sent and no external action is triggered - safe,
// read-only. Do not assert on clipboard contents (unreliable in CI) - the input's own value
// attribute is sufficient.

import { test, expect } from '@playwright/test';
import { login, goToJobDescriptions, getJobRowByExactTitle, clickJobRowMenuItem } from '../helpers/candidate-helpers';

test.describe('RMS-JOB-06: Row action menu - Modify, Delete, Share, Get file', () => {
  test('JOB06-4. Share opens a safe, read-only link dialog', async ({ page }) => {
    await login(page);
    await goToJobDescriptions(page);

    const row = getJobRowByExactTitle(page, 'QA Automation');
    await clickJobRowMenuItem(row, 'Share');

    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible();
    await expect(dialog.getByText('Share Job', { exact: false })).toBeVisible();

    const shareInput = dialog.locator('input[readonly]');
    await expect(shareInput).toHaveCount(1);
    await expect(shareInput).toHaveValue(/^https:\/\/rms-dev\.allweb\.com\.kh:8909\/apply\//);

    await page.keyboard.press('Escape');
    await expect(dialog).not.toBeVisible();
    // Closing has no side effects - the underlying list is unchanged.
    await expect(page.locator('table tbody tr')).toHaveCount(11);
  });
});
