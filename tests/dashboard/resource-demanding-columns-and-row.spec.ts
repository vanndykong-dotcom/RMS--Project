// spec: specs/dashboard-test-plan.md (DASH04-1)
// exploratory: table headers read No., Project Name, Position, QTY, Exp. Level, Deadline,
// Resources, Status. Row 1 matches the story's documented data exactly: VK-Microsoft (a link),
// Marketing Manager-VK, 5000, Junior, 31/Dec/2025 (danger badge), Resources "5" + add_circle
// icon, Status "IN PROGRESS" (success badge).

import { test, expect } from '@playwright/test';
import { login } from '../helpers/candidate-helpers';

test.describe('RMS-DASH-04: View Resource Demanding table', () => {
  test('DASH04-1. Table columns and row 1 field values', async ({ page }) => {
    await login(page);

    const rd = page.locator('app-dashboard-resource-demanding');
    // Under this suite's default 3-worker concurrency, the table can still be hydrating right
    // after login() resolves - wait for the header row before reading it, confirmed to
    // eliminate an intermittent "0 headers read" race seen during healing.
    await expect(rd.locator('table thead th').first()).toBeVisible({ timeout: 10000 });
    const headers = (await rd.locator('table thead th').allTextContents()).map((t) => t.trim());
    expect(headers).toEqual(['No.', 'Project Name', 'Position', 'QTY', 'Exp. Level', 'Deadline', 'Resources', 'Status']);

    const row = rd.locator('tbody tr').first();
    await expect(row.locator('td').nth(0)).toHaveText('1');
    const projectLink = row.locator('td').nth(1).locator('a');
    await expect(projectLink).toHaveText('VK-Microsoft');
    await expect(projectLink).toHaveAttribute('href', /\/admin\/demand\/view\/\d+/);
    await expect(row.locator('td').nth(2)).toContainText('Marketing Manager-VK');
    await expect(row.locator('td').nth(3)).toHaveText('5000');
    await expect(row.locator('td').nth(4)).toHaveText('Junior');
    await expect(row.locator('td').nth(5).locator('app-aw-badge span')).toHaveClass(/danger/);
    await expect(row.locator('td').nth(6)).toContainText('5');
    await expect(row.locator('td').nth(7).locator('app-aw-badge span')).toHaveClass(/success/);
    await expect(row.locator('td').nth(7)).toContainText('IN PROGRESS');
  });
});
