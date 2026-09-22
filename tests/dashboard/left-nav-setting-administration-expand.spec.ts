// spec: specs/dashboard-test-plan.md (DASH02-2)
// exploratory: "Toggle Setting" and "Toggle Administration" both expand their submenu IN PLACE
// (URL stays /admin/dashboard) - already independently confirmed by this repo's own
// tests/navigation/nav-setting.spec.ts and nav-administration.spec.ts; re-confirmed here from
// the Dashboard's own starting context per the story's own AC wording.

import { test, expect } from '@playwright/test';
import { login } from '../helpers/candidate-helpers';

test.describe('RMS-DASH-02: View left navigation menu', () => {
  test('DASH02-2. Setting and Administration chevrons expand their submenus in place', async ({ page }) => {
    await login(page);
    const sidebarTree = page.getByRole('tree');

    await sidebarTree.getByRole('button', { name: 'Toggle Setting' }).click();
    await expect(page).toHaveURL(/\/admin\/dashboard/);
    for (const item of [
      'Migration', 'Company Profile', 'Interview Template', 'Job', 'Project',
      'Email Configuration', 'Email Template', 'System Configuration', 'Candidate Status', 'University',
    ]) {
      await expect(sidebarTree.getByRole('button', { name: item })).toBeVisible();
    }

    await sidebarTree.getByRole('button', { name: 'Toggle Administration' }).click();
    await expect(page).toHaveURL(/\/admin\/dashboard/);
    for (const item of ['User', 'Role', 'Group']) {
      await expect(sidebarTree.getByRole('button', { name: item })).toBeVisible();
    }
  });
});
