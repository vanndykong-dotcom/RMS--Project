// spec: specs/candidate-details-test-plan.md (CAND02-2)
// exploratory: an unset Telephone Line 2 renders literally as "--"; an unset Year of
// Experience renders as a TRULY EMPTY text-value (no "--", no placeholder) - confirmed on
// Raksa CHANN. Sopheak PHAL's Year of Experience shows "0 year" (a real value), confirming the
// field only blanks when genuinely unset, not merely falsy - documented in the exploratory
// results but out of this scenario's own scope, so not re-asserted here.

import { test, expect } from '@playwright/test';
import { login, goToCandidateDetails, getProfileCardFields } from '../helpers/candidate-helpers';

test.describe('RMS-CAND-02: View candidate profile information', () => {
  test('CAND02-2. Empty-value convention: "--" for phone, blank for numeric/duration fields', async ({ page }) => {
    await login(page);
    await goToCandidateDetails(page, 'Raksa CHANN');

    const fields = await getProfileCardFields(page);
    expect(fields['Telephone Line 2']).toBe('--');
    expect(fields['Year of Experience']).toBe('');
  });
});
