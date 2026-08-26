// spec: specs/candidate-details-test-plan.md (CAND01-3)
// exploratory: a normally-named candidate's header contains only "{Salutation}. {Full Name}" -
// no separate reference-code field exists anywhere in the header area. The story's screenshot
// example was almost certainly a candidate name mangled by the already-documented
// name-sanitization defect (see candidate-helpers.ts's createSyntheticCandidate() comment), not
// a real distinct field.

import { test, expect } from '@playwright/test';
import { login, goToCandidateDetails } from '../helpers/candidate-helpers';

test.describe('RMS-CAND-01: View candidate header and status', () => {
  test('CAND01-3. No separate reference code is rendered for a normally-named candidate', async ({ page }) => {
    await login(page);
    await goToCandidateDetails(page, 'Vk KONG');

    const heading = page.locator('h2.profile-header-name');
    const headingText = (await heading.textContent())?.trim() ?? '';
    expect(headingText).toMatch(/^Mr\.\s*Vk KONG$/i);
    // Nothing beyond salutation + name appears in the heading itself.
    expect(headingText.replace(/^Mr\.\s*Vk KONG$/i, '')).toBe('');
  });
});
