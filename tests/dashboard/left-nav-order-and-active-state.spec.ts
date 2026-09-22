// spec: specs/dashboard-test-plan.md (DASH02-1)
// exploratory: the sidebar tree's button list reads exactly Dashboard, Interview Schedule,
// Candidate, Demand, Report, Advance Report, Activity, Reminder, File Manager, Toggle Setting,
// Toggle Administration - "Dashboard" carries an active/highlighted class and no sibling does.

import { test, expect } from '@playwright/test';
import { login } from '../helpers/candidate-helpers';

test.describe('RMS-DASH-02: View left navigation menu', () => {
  test('DASH02-1. Nav item order and active-state highlighting', async ({ page }) => {
    await login(page);

    const sidebarTree = page.getByRole('tree');
    const navButtons = sidebarTree.getByRole('button');
    // Under this suite's default 3-worker concurrency against the shared remote dev server, the
    // sidebar tree can still be hydrating right after login() resolves (which only waits for the
    // URL, not for the tree's own render) - wait for at least one nav button before reading all
    // of them, confirmed to eliminate an intermittent "0 buttons read" race seen during healing.
    await expect(navButtons.first()).toBeVisible({ timeout: 10000 });
    const names = (await navButtons.allInnerTexts()).map((t) => t.replace(/\s+/g, ' ').trim());

    // Each button's accessible text concatenates its icon ligature with its label (e.g.
    // "dashboardDashboard") - match on a trailing substring rather than an exact equality.
    const expectedOrder = [
      'Dashboard', 'Interview Schedule', 'Candidate', 'Demand', 'Report', 'Advance Report',
      'Activity', 'Reminder', 'File Manager', 'Setting', 'Administration',
    ];
    expect(names.length).toBe(expectedOrder.length);
    expectedOrder.forEach((label, i) => {
      expect(names[i].toLowerCase()).toContain(label.toLowerCase());
    });

    const activeCount = await sidebarTree.locator('button[class*="active"]').count();
    expect(activeCount).toBe(1);
    const activeText = await sidebarTree.locator('button[class*="active"]').innerText();
    expect(activeText.toLowerCase()).toContain('dashboard');
  });
});
