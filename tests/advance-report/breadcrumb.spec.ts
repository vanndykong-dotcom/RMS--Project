// spec: specs/advance-report-test-plan.md (RPT10-1)
// exploratory: nav.aw-breadcrumb renders <a href="/admin">Dashboard</a> >
// <a href="/admin/candidate">Candidates</a> > <a>Candidate advance report</a> - the current-
// page segment is an <a> with no href, i.e. not actually navigable.

import { test, expect } from '@playwright/test';
import { login, goToAdvanceReport } from '../helpers/candidate-helpers';

test.describe('RMS-RPT-10: Breadcrumb navigation', () => {
  test('RPT10-1. Breadcrumb text and link targets', async ({ page }) => {
    await login(page);
    await goToAdvanceReport(page);

    const breadcrumb = page.locator('nav.aw-breadcrumb').first();
    const breadcrumbText = (await breadcrumb.innerText()).trim().replace(/\s*>\s*/g, ' > ');
    expect(breadcrumbText).toBe('Dashboard > Candidates > Candidate advance report');

    const dashboardLink = breadcrumb.getByRole('link', { name: 'Dashboard' });
    await expect(dashboardLink).toHaveAttribute('href', '/admin');

    const candidatesLink = breadcrumb.getByRole('link', { name: 'Candidates' });
    await expect(candidatesLink).toHaveAttribute('href', '/admin/candidate');

    // The current-page segment has no href - not actually navigable.
    await expect(breadcrumb.getByRole('link', { name: 'Candidate advance report' })).toHaveCount(0);
    await expect(breadcrumb.getByText('Candidate advance report')).toBeVisible();

    await dashboardLink.click();
    await expect(page).toHaveURL(/\/admin\/dashboard/);

    await goToAdvanceReport(page);
    const breadcrumb2 = page.locator('nav.aw-breadcrumb').first();
    await breadcrumb2.getByRole('link', { name: 'Candidates' }).click();
    await expect(page).toHaveURL(/\/admin\/candidate$/);
  });
});
