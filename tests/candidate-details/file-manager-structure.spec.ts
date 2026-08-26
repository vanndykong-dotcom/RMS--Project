// spec: specs/candidate-details-test-plan.md (CAND04-1)
// exploratory: elFinder toolbar buttons are `[title="..."]` divs, not semantic buttons.
// Folder tree confirmed: Places > upload > candidate > {id} > cv, profile. Status bar's live
// item count/size is most reliably read from `.elfinder-stat-size`'s `title` attribute (e.g.
// "Items: 2,&nbsp;Sum: 517 KB") rather than its rendered text, which is split across child
// spans.

import { test, expect } from '@playwright/test';
import { login, goToCandidateDetails, getFileManager } from '../helpers/candidate-helpers';

test.describe('RMS-CAND-04: Browse and manage candidate files', () => {
  test('CAND04-1. Folder tree, toolbar, and status bar structure (read-only)', async ({ page }) => {
    await login(page);
    await goToCandidateDetails(page, 'Raksa CHANN');

    const fileManager = await getFileManager(page);
    await expect(fileManager).toBeVisible();

    // Folder tree: Places > upload > candidate > {id} > cv, profile
    await expect(fileManager).toContainText('upload');
    await expect(fileManager).toContainText('candidate');
    await expect(fileManager).toContainText('cv');
    await expect(fileManager).toContainText('profile');

    // Toolbar - at minimum these exact title attributes are present.
    for (const title of ['Upload files', 'Download', 'Delete', 'Rename', 'Preview', 'List view', 'Find files']) {
      await expect(fileManager.locator(`[title="${title}"]`).first()).toBeVisible();
    }

    // Status bar format: "Items: {n}, Sum: {size}" - the outer status-bar div carries this
    // title; a nested `.elfinder-stat-size-recursive` span (shown once a folder is selected)
    // shares the base class but has no title/"Items:" prefix, so exclude it here too.
    await expect(fileManager.locator('.elfinder-stat-size:not(.elfinder-stat-size-recursive)')).toHaveAttribute('title', /^Items: \d+,\s*Sum: .+$/);
  });
});
