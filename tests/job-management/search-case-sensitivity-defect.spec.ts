// spec: specs/job-management-test-plan.md (JOB02-3)
// exploratory: CONFIRMED DEFECT, reconfirmed with raw network evidence across 4 term pairs
// (Java/java, QA/qa, Automation/automation, Intern/intern) in fresh browser contexts - the
// server-side filter is effectively case-broken. Searching the exact display case of a real
// title (e.g. "Java", matching "Java Backend Developer") reliably returns
// GET .../jobDescription?...&filter=Java -> {"total":0}, while the identical term fully
// lowercased ("java") correctly returns total:2. This test intentionally asserts the CURRENT
// buggy behavior (not the intuitively-expected case-insensitive match) - see
// specs/job-management-exploratory-results.md and the plan's Open Items #1 for the writeup.
// This is a genuine, reproducible server-side defect that should be flagged to dev/PM, not
// "fixed" by asserting a fictional passing behavior here.

import { test, expect } from '@playwright/test';
import { login, goToJobDescriptions, searchJobDescriptions } from '../helpers/candidate-helpers';

test.describe('RMS-JOB-02: Search job descriptions', () => {
  test('JOB02-3. Case-sensitivity defect - exact-case search finds nothing, lowercase works', async ({ page }) => {
    await login(page);
    await goToJobDescriptions(page);

    // Step 1: exact display-case term - CONFIRMED DEFECT, documents current (buggy) behavior.
    await searchJobDescriptions(page, 'Java');
    await expect(page.getByText('No matching records found')).toBeVisible();
    await expect(page.getByText(/^Total:\s*0$/)).toBeVisible();

    // Step 2: same term fully lowercased - matches correctly.
    await searchJobDescriptions(page, '');
    await searchJobDescriptions(page, 'java');
    await expect(page.locator('table tbody tr')).toHaveCount(2);
    await expect(page.getByRole('row', { name: /Java Backend Developer/ })).toBeVisible();
    await expect(page.getByRole('row', { name: /Intern JAVA/i })).toBeVisible();

    await searchJobDescriptions(page, '');
  });
});
