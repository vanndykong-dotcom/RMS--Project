// spec: specs/dashboard-test-plan.md (DASH06-1)
// exploratory: exactly 2 <app-reminder-interview-card> entries, in date/time ascending order,
// matching the story's data exactly.

import { test, expect } from '@playwright/test';
import { login } from '../helpers/candidate-helpers';

test.describe('RMS-DASH-06: View This Week Interview panel', () => {
  test('DASH06-1. Exactly 2 entries with exact fields', async ({ page }) => {
    await login(page);

    const cards = page.locator('app-reminder-interview-card');
    await expect(cards).toHaveCount(2);

    const first = cards.nth(0);
    await expect(first.locator('.profile-info-name')).toContainText('Ms. Kanna TESTING');
    await expect(first.locator('.profile-info-position-title').first()).toContainText('Marketing Manager-VK');
    await expect(first.locator('mat-card-subtitle')).toContainText('21/Sep/2026 01:37 PM');

    const second = cards.nth(1);
    await expect(second.locator('.profile-info-name')).toContainText('Ms. Kanna II');
    await expect(second.locator('.profile-info-position-title').first()).toContainText('Marketing Manager-VK');
    await expect(second.locator('mat-card-subtitle')).toContainText('22/Sep/2026 03:48 PM');
  });
});
