// spec: specs/job-management-test-plan.md (JOB01-2)
// exploratory: the truncated cell (.row-content) uses computed text-overflow: clip (not CSS
// ellipsis) with a hard character-slice and a literal "..." appended, and carries no `title`
// attribute anywhere - there is no hover-reveal at all. The only confirmed way to read the full
// text is the eye-icon dialog's "Description" nav item, a plain <a class="nav-item"> (not
// role=tab).

import { test, expect } from '@playwright/test';
import { login, goToJobDescriptions, getJobRowByExactTitle } from '../helpers/candidate-helpers';

test.describe('RMS-JOB-01: View list of job descriptions', () => {
  test('JOB01-2. Long description truncation with no hover tooltip', async ({ page }) => {
    await login(page);
    await goToJobDescriptions(page);

    const row = getJobRowByExactTitle(page, 'Java Backend Developer');
    const descriptionCell = row.locator('td').nth(2);
    const truncatedText = (await descriptionCell.innerText()).trim();
    expect(truncatedText.endsWith('...')).toBeTruthy();

    // No title attribute anywhere in the cell - hovering does not reveal the full text.
    await expect(descriptionCell).not.toHaveAttribute('title', /.*/);
    await expect(descriptionCell.locator('[title]')).toHaveCount(0);

    await row.locator('button[mattooltip="View"]').click();
    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible();

    await dialog.locator('a.nav-item', { hasText: 'Description' }).click();
    const fullText = (await dialog.innerText()).trim();

    // The full view must contain strictly more text than the truncated snippet (minus its
    // trailing "...") - this is the only confirmed place to read the complete description.
    const truncatedPrefix = truncatedText.replace(/\.\.\.$/, '');
    expect(fullText.length).toBeGreaterThan(truncatedPrefix.length);
    expect(fullText).toContain(truncatedPrefix.slice(0, 25));

    await page.keyboard.press('Escape');
    await expect(dialog).not.toBeVisible();
  });
});
