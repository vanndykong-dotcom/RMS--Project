// spec: specs/candidate-details-test-plan.md (CAND10-1)
// exploratory: reached via in-app navigation (list -> eye icon), `nav.aw-breadcrumb` renders
// Dashboard > Candidates > Candidate Details - "Dashboard"/"Candidates" are real `<a href>`
// links, the current segment is a plain `<a>` with NO href (no link role). See
// breadcrumb-direct-navigation-caveat.spec.ts for the direct-URL-load caveat.

import { test, expect } from '@playwright/test';
import { login, goToCandidateDetails } from '../helpers/candidate-helpers';

test.describe('RMS-CAND-10: Breadcrumb navigation', () => {
  test('CAND10-1. Breadcrumb text and link targets, reached via in-app navigation', async ({ page }) => {
    await login(page);
    await goToCandidateDetails(page, 'Vk KONG');

    const breadcrumb = page.locator('nav.aw-breadcrumb');
    await expect(breadcrumb).toBeVisible();

    const dashboardLink = breadcrumb.getByRole('link', { name: 'Dashboard' });
    await expect(dashboardLink).toHaveAttribute('href', '/admin');
    const candidatesLink = breadcrumb.getByRole('link', { name: 'Candidates' });
    await expect(candidatesLink).toHaveAttribute('href', '/admin/candidate');

    // Current-page segment has no href - not actually navigable/not a link role.
    await expect(breadcrumb.getByRole('link', { name: 'Candidate Details' })).toHaveCount(0);
    await expect(breadcrumb.getByText('Candidate Details')).toBeVisible();

    await dashboardLink.click();
    await expect(page).toHaveURL(/\/admin\/dashboard/);

    await goToCandidateDetails(page, 'Vk KONG');
    await page.locator('nav.aw-breadcrumb').getByRole('link', { name: 'Candidates' }).click();
    await expect(page).toHaveURL(/\/admin\/candidate$/);
  });
});
