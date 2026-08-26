// spec: specs/candidate-details-test-plan.md (CAND03-2)
// exploratory: COVERAGE GAP, not confirmed live - no candidate in the entire current live list
// (15 candidates as of 2026-08-24, down from 27) has 2+ education entries. The `mat-tab-group`
// markup found for the single-entry case strongly implies additional entries would render as
// additional tabs (one per school), not stacked banners as the story assumed, but this needs a
// real multi-entry candidate (seeded via the Edit flow, since the Add wizard and
// createSyntheticCandidate() only ever add one) to move from inference to confirmation.

import { test } from '@playwright/test';

test.describe('RMS-CAND-03: View candidate education history', () => {
  test.skip('CAND03-2. Multiple education entries (coverage gap - not confirmed live)', async () => {
    // Intentionally skipped rather than asserting an unconfirmed inference. Once a candidate
    // with 2+ education entries exists (via Edit, not the Add wizard), replace this skip with
    // an assertion that the mat-tab-group renders one tab per school.
  });
});
