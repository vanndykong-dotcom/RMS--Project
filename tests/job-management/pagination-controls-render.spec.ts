// spec: specs/job-management-test-plan.md (JOB07-1)
// exploratory: rendered by a shared <app-aw-pagination> component - prev chevron
// (keyboard_arrow_left) / active page number ("1", .page-note-item.active) / next chevron
// (keyboard_arrow_right), both chevrons carrying a "disabled" CSS class since all 11 rows fit
// on one pageSize=15 page, plus the "Total: 11" message line.

import { test, expect } from '@playwright/test';
import { login, goToJobDescriptions } from '../helpers/candidate-helpers';

test.describe('RMS-JOB-07: Paginate the job description list', () => {
  test('JOB07-1. Pagination controls and total count render', async ({ page }) => {
    await login(page);
    await goToJobDescriptions(page);

    const activePage = page.locator('.page-note-item.active');
    await expect(activePage).toBeVisible();
    await expect(activePage).toHaveText('1');

    await expect(page.getByText(/^Total:\s*\d+$/)).toBeVisible();

    // The "disabled" class lives on the wrapping `.page-note-nav` <span>, not on the <mat-icon>
    // itself (confirmed live: <span class="page-note page-note-nav ... disabled"><mat-icon
    // class="mat-icon ...">keyboard_arrow_left</mat-icon></span>) - the mat-icon's own class is
    // just the generic Material icon classes regardless of disabled state.
    const prevChevron = page.locator('.page-note-nav', { has: page.getByText('keyboard_arrow_left', { exact: true }) });
    const nextChevron = page.locator('.page-note-nav', { has: page.getByText('keyboard_arrow_right', { exact: true }) });
    await expect(prevChevron).toBeVisible();
    await expect(nextChevron).toBeVisible();
    // Single-page dataset - both chevrons are disabled.
    await expect(prevChevron).toHaveClass(/disabled/);
    await expect(nextChevron).toHaveClass(/disabled/);
  });
});
