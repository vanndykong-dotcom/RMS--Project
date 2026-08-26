// spec: specs/candidate-details-test-plan.md (CAND02-1)
// exploratory: profile card fields render as `<span class="text-label">{label}</span><br>
// <span class="text-value">{value}</span>` pairs. Labels confirmed, in order: Gender, Date of
// Birth, Email, Telephone Line 1, Telephone Line 2, Year of Experience, Created By, Create at,
// Last Modify, Priority, Description. Audit timestamps confirmed as `DD/Mon/YYYY hh:mm AM/PM`.

import { test, expect } from '@playwright/test';
import { login, goToCandidateDetails, getProfileCardFields } from '../helpers/candidate-helpers';

const AUDIT_TIMESTAMP = /^\d{2}\/[A-Za-z]{3}\/\d{4} \d{2}:\d{2} (AM|PM)$/;

test.describe('RMS-CAND-02: View candidate profile information', () => {
  test('CAND02-1. All profile fields render with correct labels and audit timestamp format', async ({ page }) => {
    await login(page);
    await goToCandidateDetails(page, 'Raksa CHANN');

    const fields = await getProfileCardFields(page);
    expect(Object.keys(fields)).toEqual([
      'Gender', 'Date of Birth', 'Email', 'Telephone Line 1', 'Telephone Line 2',
      'Year of Experience', 'Created By', 'Create at', 'Last Modify', 'Priority', 'Description',
    ]);

    expect(fields['Create at']).toMatch(AUDIT_TIMESTAMP);
    expect(fields['Last Modify']).toMatch(AUDIT_TIMESTAMP);
  });
});
