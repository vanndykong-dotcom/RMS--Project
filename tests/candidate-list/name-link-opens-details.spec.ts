// spec: specs/candidate-list-test-plan.md (RMS-CANDLIST-08, CL08-2)
// seed: tests/seed-candidate.spec.ts
// view-candidate.spec.ts already covers the eye icon; this covers the other entry point the
// story names - the Full Name link itself.

import { test, expect } from '@playwright/test';
import { login, goToCandidateList, searchFor } from '../helpers/candidate-helpers';

test.describe('RMS-CANDLIST-08. Navigate to candidate detail', () => {
  test('CL08-2. Full Name link opens that candidate\'s details page', async ({ page }) => {
    await login(page);
    await goToCandidateList(page);

    await searchFor(page, 'Sovan NI');
    const link = page.getByRole('row', { name: /Sovan NI/ }).getByRole('link', { name: 'Mr. Sovan NI' });
    const href = await link.getAttribute('href');
    expect(href).toMatch(/^\/admin\/candidate\/candidateDetail\/\d+$/);

    await link.click();
    await expect(page).toHaveURL(new RegExp(`${href}$`));
    await expect(page.getByRole('heading', { level: 2 }).first()).toHaveText('Mr. Sovan NI');
  });
});
