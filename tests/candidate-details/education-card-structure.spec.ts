// spec: specs/candidate-details-test-plan.md (CAND03-1)
// exploratory: Education renders inside a `mat-tab-group`, one tab per school; fields beneath
// the active tab render in this order: Major, "Degress" (confirmed live typo - assert the
// current mis-spelled label, do NOT correct it to "Degree"), GPA, Start Date, End Date.
// Degress/GPA blank out to "--"; Start Date/End Date blank to true-empty - the same mixed
// convention already found on the profile card.

import { test, expect } from '@playwright/test';
import { login, goToCandidateDetails } from '../helpers/candidate-helpers';

test.describe('RMS-CAND-03: View candidate education history', () => {
  test('CAND03-1. Education card structure and the "Degress" label typo', async ({ page }) => {
    await login(page);
    await goToCandidateDetails(page, 'Raksa CHANN');

    // Confirmed live: TWO mat-tab-group elements render on this page - one under
    // app-candidate-interview (the interview/exam score card, "MOST RECENT / OVERALL: 83.5%")
    // and one under app-candidate-education (the actual education history card asserted here).
    // Scope to the education component so this never picks up the interview one.
    const educationCard = page.locator('app-candidate-education mat-tab-group');
    await educationCard.scrollIntoViewIfNeeded();
    await expect(educationCard).toBeVisible();

    const tab = page.getByRole('tab').first();
    await expect(tab).toBeVisible();
    await expect(tab).not.toBeEmpty();

    const labels = await educationCard.locator('.text-label').allTextContents();
    expect(labels.map((l) => l.trim())).toEqual(['Major', 'Degress', 'GPA', 'Start Date', 'End Date']);

    const values = await educationCard.locator('.text-value').allTextContents();
    expect(values[1].trim()).toBe('--'); // Degress
    expect(values[2].trim()).toBe('--'); // GPA
    expect(values[3].trim()).toBe(''); // Start Date
    expect(values[4].trim()).toBe(''); // End Date
  });
});
