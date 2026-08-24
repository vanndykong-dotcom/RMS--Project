// spec: specs/job-management-test-plan.md (JOB06-5)
// exploratory: clicking "Get file" on "QA Automation" (confirmed to have an attachment per
// the eye-icon's "Attachment" tab) triggers a real browser `download` event for a PDF
// (suggested filename is a bare UUID + .pdf) - it downloads the row's underlying attached
// document, not a freshly-generated export. Coverage gap (documented, not assumed): behavior
// on an attachment-less row is unconfirmed as of the exploratory pass.

import { test, expect } from '@playwright/test';
import { login, goToJobDescriptions, getJobRowByExactTitle, clickJobRowMenuItem } from '../helpers/candidate-helpers';

test.describe('RMS-JOB-06: Row action menu - Modify, Delete, Share, Get file', () => {
  test('JOB06-5. Get file triggers a real PDF download', async ({ page }) => {
    await login(page);
    await goToJobDescriptions(page);

    const row = getJobRowByExactTitle(page, 'QA Automation');
    const [download] = await Promise.all([
      page.waitForEvent('download'),
      clickJobRowMenuItem(row, 'Get file'),
    ]);

    expect(download.suggestedFilename()).toMatch(/\.pdf$/i);
  });
});
