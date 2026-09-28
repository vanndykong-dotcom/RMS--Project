// spec: specs/candidate-list-test-plan.md (RMS-CANDLIST-09/12/13, CL09-1)
// seed: tests/seed-candidate.spec.ts
// row-menu-modify.spec.ts checks each item is present; this asserts the exact ORDER the story
// specifies and that every item carries an icon (resolves the RMS-CANDLIST-12 open question -
// "Add Activity Log" does have one). Read-only: the menu is closed with Escape, nothing clicked.

import { test, expect } from '@playwright/test';
import { login, goToCandidateList, searchFor, openRowMenu } from '../helpers/candidate-helpers';

test.describe('RMS-CANDLIST-09. Row action menu', () => {
  test('CL09-1. Menu lists all six actions in the specified order, each with an icon', async ({ page }) => {
    await login(page);
    await goToCandidateList(page);

    // Sovan NI has no interview set, so "Add interview result" is disabled (RMS-CANDLIST-13)
    await searchFor(page, 'Sovan NI');
    await openRowMenu(page, /Sovan NI/);

    const items = page.getByRole('menu').getByRole('menuitem');
    await expect(items).toHaveText([
      /Modify/, /Set Reminder/, /Set Interview/, /Add Activity Log/, /Add interview result/, /Add to archive/,
    ]);
    for (const item of await items.all()) {
      await expect(item.getByRole('img')).toBeVisible();
    }
    await expect(items.nth(4)).toBeDisabled();

    await page.keyboard.press('Escape');
    await expect(page.getByRole('menu')).toBeHidden();
  });
});
