// spec: specs/candidate-management.md
// seed: tests/seed-candidate.spec.ts

import { test, expect } from '@playwright/test';
import { login, goToCandidateList } from '../helpers/candidate-helpers';

test.describe('A. Manage Candidates - List Page', () => {
  test('A14. Archive button navigates to archived list', async ({ page }) => {
    await login(page);
    await goToCandidateList(page);

    // 1. Click the Archive button top-right of Manage Candidates
    await page.getByRole('button', { name: 'Archive' }).click();

    // Structurally similar table, same column headers, containing only archived records
    await expect(page.getByRole('grid')).toBeVisible();
    await expect(page.getByRole('columnheader', { name: 'Full Name' })).toBeVisible();

    // A way back to the active list is available (the Archive toggle itself)
    const archiveToggle = page.getByRole('button', { name: 'Archive' });
    await expect(archiveToggle).toBeVisible();
    await archiveToggle.click();
    await expect(page.getByRole('button', { name: 'Add' })).toBeVisible();
  });
});
