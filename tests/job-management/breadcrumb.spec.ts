// spec: specs/job-management-test-plan.md (JOB08-1)
// exploratory: [class*="bread"] renders <a href="/admin">Dashboard</a> >
// <a href="/admin/setting">Setting</a> > <a href="/admin/setting/job">List Job
// Description</a> > <a>List</a> - the current-page segment ("List") is an <a> with NO href,
// so it renders with no role=link.

import { test, expect } from '@playwright/test';
import { login, goToJobDescriptions } from '../helpers/candidate-helpers';

test.describe('RMS-JOB-08: Breadcrumb navigation', () => {
  test('JOB08-1. Breadcrumb text and link targets', async ({ page }) => {
    await login(page);
    await goToJobDescriptions(page);

    const breadcrumb = page.locator('[class*="bread"]').first();
    const breadcrumbText = (await breadcrumb.innerText()).trim().replace(/\s*>\s*/g, ' > ');
    expect(breadcrumbText).toBe('Dashboard > Setting > List Job Description > List');

    const dashboardLink = breadcrumb.getByRole('link', { name: 'Dashboard' });
    await expect(dashboardLink).toHaveAttribute('href', '/admin');

    const settingLink = breadcrumb.getByRole('link', { name: 'Setting', exact: true });
    await expect(settingLink).toHaveAttribute('href', '/admin/setting');

    const jobLink = breadcrumb.getByRole('link', { name: 'List Job Description' });
    await expect(jobLink).toHaveAttribute('href', '/admin/setting/job');

    // Current-page segment has no href - not actually navigable/not a link role.
    await expect(breadcrumb.getByRole('link', { name: 'List', exact: true })).toHaveCount(0);
    const listSegment = breadcrumb.getByText('List', { exact: true });
    await expect(listSegment).toBeVisible();
    // Confirmed live: the wrapping `<ul>` intercepts pointer events at this segment's location,
    // blocking a plain click (retries all fail with "<ul> intercepts pointer events"). Since
    // this segment is a plain `<a>` with no href (it's the current-page marker, not a real
    // navigation target - see the block above), forcing the click is safe: it has nowhere to
    // navigate to, so the URL simply stays put, which is exactly what's asserted next.
    await listSegment.click({ force: true });
    await expect(page).toHaveURL(/\/admin\/setting\/job$/);

    await dashboardLink.click();
    await expect(page).toHaveURL(/\/admin\/dashboard/);

    await goToJobDescriptions(page);
    const breadcrumb2 = page.locator('[class*="bread"]').first();
    await breadcrumb2.getByRole('link', { name: 'Setting', exact: true }).click();
    // Confirmed live: /admin/setting immediately client-side-redirects to its default child
    // route, /admin/setting/job (the Job list itself) - it is never a settled destination on
    // its own, so asserting the bare /admin/setting URL is racy (it only passes if checked in
    // the narrow window before the redirect fires). Assert on the settled URL instead.
    await expect(page).toHaveURL(/\/admin\/setting(\/job)?$/);

    // goToJobDescriptions() is now safe to call again here even though we may already be on
    // the Job list via that redirect - it only toggles the sidebar's Setting submenu open when
    // it isn't already (see its own comment for why an unconditional toggle broke this).
    await goToJobDescriptions(page);
    const breadcrumb3 = page.locator('[class*="bread"]').first();
    await breadcrumb3.getByRole('link', { name: 'List Job Description' }).click();
    await expect(page).toHaveURL(/\/admin\/setting\/job$/);
  });
});
