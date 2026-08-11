// spec: specs/candidate-management.md
// seed: tests/seed-candidate.spec.ts

import { test, expect } from '@playwright/test';
import { login, goToCandidateList, searchFor } from '../helpers/candidate-helpers';

test.describe('D. Interview Schedule Module', () => {
  test('D1. Interview Schedule list reflects candidate interviews', async ({ page }) => {
    await login(page);
    await goToCandidateList(page);

    // Read the candidate's Interview column value first (seeded data: 05/Aug/2026 10:40 PM)
    await searchFor(page, 'Vanndy VK');
    const row = page.getByRole('row', { name: /Vanndy VK/ });
    await expect(row).toContainText('05/Aug/2026 10:40 PM');

    // Navigate to Interview Schedule
    await page.getByRole('tree').getByRole('button', { name: 'Interview Schedule' }).click();
    await expect(page).toHaveURL(/\/admin\/calendar/);
    await expect(page.getByRole('heading', { name: 'Manage Interview Schedule' })).toBeVisible();

    // The candidate's position tag appears as a calendar entry in the visible month. Some
    // days render more events than fit visually (truncated/collapsed), so this checks DOM
    // presence rather than strict visibility.
    await expect(page.locator('body')).toContainText('Software Testing Automation');
  });
});
