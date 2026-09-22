// spec: specs/dashboard-test-plan.md (DASH02-3)
// exploratory: clicking any other nav item (e.g. "Candidate") navigates to that module and
// updates the active nav item away from "Dashboard".

import { test, expect } from '@playwright/test';
import { login } from '../helpers/candidate-helpers';

test.describe('RMS-DASH-02: View left navigation menu', () => {
  test('DASH02-3. Clicking "Candidate" navigates and updates the active nav item', async ({ page }) => {
    await login(page);
    const sidebarTree = page.getByRole('tree');

    await sidebarTree.getByRole('button', { name: 'Candidate' }).click();
    await expect(page).toHaveURL(/\/admin\/candidate$/);
    await expect(page.getByRole('heading', { name: 'Manage Candidates' })).toBeVisible();

    const candidateButton = sidebarTree.getByRole('button', { name: 'Candidate' });
    await expect(candidateButton).toHaveClass(/active/);
    const dashboardButton = sidebarTree.getByRole('button', { name: 'Dashboard' });
    await expect(dashboardButton).not.toHaveClass(/active/);
  });
});
