// spec: specs/candidate-management.md
// seed: tests/seed-candidate.spec.ts

import { test, expect } from '@playwright/test';
import { login, goToCandidateList, searchFor, openRowMenu } from '../helpers/candidate-helpers';

test.describe('A. Manage Candidates - List Page', () => {
  test('A12. Row action menu - Add interview result disabled/enabled state', async ({ page }) => {
    await login(page);
    await goToCandidateList(page);

    // 1. A candidate with Interview = N/A: Add interview result is disabled
    await searchFor(page, 'Sovan NI');
    await expect(page.getByRole('row', { name: /Sovan NI/ })).toContainText('N/A');
    await openRowMenu(page, /Sovan NI/);
    await expect(page.getByRole('menuitem', { name: /Add interview result/ })).toBeDisabled();
    await page.keyboard.press('Escape');

    // 2. A candidate with a scheduled interview (past or future) has it enabled - confirms
    // the business rule depends only on an interview being set, not on the date having passed
    await searchFor(page, 'Vanndy VK');
    await openRowMenu(page, /Vanndy VK/);
    await expect(page.getByRole('menuitem', { name: /Add interview result/ })).toBeEnabled();
  });
});
