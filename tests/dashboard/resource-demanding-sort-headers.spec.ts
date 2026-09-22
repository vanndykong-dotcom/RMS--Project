// spec: specs/dashboard-test-plan.md (DASH04-2)
// exploratory: the Deadline header defaults to aria-sort="ascending" on load (NOT "none" as
// might be assumed for an unsorted table). Clicking "Project Name" cycles its own aria-sort
// none -> ascending -> descending, confirming sort headers are functional mat-sort-header
// elements.

import { test, expect } from '@playwright/test';
import { login } from '../helpers/candidate-helpers';

test.describe('RMS-DASH-04: View Resource Demanding table', () => {
  test('DASH04-2. Sortable headers cycle sort direction on click', async ({ page }) => {
    await login(page);

    const rd = page.locator('app-dashboard-resource-demanding');
    const deadlineHeader = rd.locator('th').filter({ hasText: 'Deadline' });
    await expect(deadlineHeader).toHaveAttribute('aria-sort', 'ascending');

    const projectHeader = rd.locator('th').filter({ hasText: 'Project Name' });
    await expect(projectHeader).toHaveAttribute('aria-sort', 'none');

    await projectHeader.click();
    await expect(projectHeader).toHaveAttribute('aria-sort', 'ascending');

    await projectHeader.click();
    await expect(projectHeader).toHaveAttribute('aria-sort', 'descending');
  });
});
