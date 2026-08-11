// spec: specs/candidate-management.md
// seed: tests/seed-candidate.spec.ts

import { test, expect } from '@playwright/test';
import { login, goToCandidateList } from '../helpers/candidate-helpers';

test.describe('A. Manage Candidates - List Page', () => {
  test('A7. View candidate (eye icon)', async ({ page }) => {
    await login(page);
    await goToCandidateList(page);

    // 1. Click the eye icon in the Action column for the first candidate row
    const firstRow = page.getByRole('grid').getByRole('row').nth(1);
    const candidateName = (await firstRow.getByRole('link').first().textContent()) ?? '';
    await firstRow.getByRole('button').first().click();

    await expect(page).toHaveURL(/\/admin\/candidate\/candidateDetail\/\d+/);
    // The detail page has multiple level-2 headings (profile name, Education, etc.) -
    // the profile name is always the first one.
    await expect(page.getByRole('heading', { level: 2 }).first()).toContainText(candidateName.trim());

    // Note: per exploration, this "view" entry point also exposes quick-action shortcuts
    // (Add activity, Set interview, Set reminder, Edit, Interview result) - it is not a
    // pure read-only view as the user story assumed. This is documented as a deviation,
    // not asserted as a failure here.
  });
});
