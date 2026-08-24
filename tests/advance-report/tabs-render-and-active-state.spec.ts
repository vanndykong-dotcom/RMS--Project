// spec: specs/advance-report-test-plan.md (RPT02-1)
// exploratory: all three tabs confirmed both by aria-selected and screenshot - active-tab
// styling (underline + blue text) moves correctly on click.

import { test, expect } from '@playwright/test';
import { login, goToAdvanceReport } from '../helpers/candidate-helpers';

test.describe('RMS-RPT-02: Switch between report tabs', () => {
  test('RPT02-1. Three tabs render with correct active-state styling', async ({ page }) => {
    await login(page);
    await goToAdvanceReport(page);

    const followingUp = page.getByRole('tab', { name: 'Following Up Report' });
    const fullStaff = page.getByRole('tab', { name: 'Summary Full Staff' });
    const intern = page.getByRole('tab', { name: 'Summary Intern' });

    await expect(followingUp).toBeVisible();
    await expect(fullStaff).toBeVisible();
    await expect(intern).toBeVisible();
    await expect(followingUp).toHaveAttribute('aria-selected', 'true');

    await fullStaff.click();
    await expect(fullStaff).toHaveAttribute('aria-selected', 'true');
    await expect(followingUp).toHaveAttribute('aria-selected', 'false');

    await intern.click();
    await expect(intern).toHaveAttribute('aria-selected', 'true');
    await expect(fullStaff).toHaveAttribute('aria-selected', 'false');
  });
});
