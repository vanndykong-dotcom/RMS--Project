// spec: specs/interview-schedule-test-plan.md (CAL05-3)
// exploratory: Bug #2 - the Candidate field's search is non-functional. Re-verified live: the
// open panel actually contains TWO elements matching `input.mat-select-search-input` (not the
// single hidden one the original exploratory note described) - one carries the
// `mat-select-search-hidden` class outright, and the other is visually present but sits inside
// a `mat-option` that itself carries `aria-disabled="true"`/`mat-option-disabled`, so Playwright
// (and a real user) cannot focus or type into it either. Both are therefore non-interactive, and
// a just-created candidate does not reliably appear among the lazily-loaded option batches.
// This blocks a full create-and-save flow before Save is ever reached. Per task instructions,
// this test documents/asserts that blocked behavior against a synthetic candidate rather than
// faking a pass - it intentionally does NOT reach Save.

import { test, expect } from '@playwright/test';
import {
  login, goToCandidateList, goToInterviewSchedule, createSyntheticCandidate, searchFor,
  archiveCandidateFromActiveList,
} from '../helpers/candidate-helpers';

test.describe('RMS-CAL-05: Create a new interview (entry point only)', () => {
  test('CAL05-3. Successful creation reflects on the calendar without reload - currently blocked by Bug #2', async ({ page }) => {
    // The Create Interview dialog is taller than the default viewport, which leaves its
    // Cancel button outside the visible area (dialog-internal scroll, not page scroll) -
    // same fix as reschedule-cancel.spec.ts's Set Interview dialog and
    // create-interview-dialog-structure.spec.ts.
    await page.setViewportSize({ width: 1280, height: 1600 });
    await login(page);
    await goToCandidateList(page);
    const name = await createSyntheticCandidate(page, { lastNameSuffix: 'CAL05-3' });

    await goToInterviewSchedule(page);
    await page.getByRole('button', { name: 'Create Interview' }).click();
    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible();

    // Open the Candidate mat-select and try to locate the just-created candidate.
    const candidateSelect = dialog.locator('mat-select[formcontrolname="candidateId"]');
    await candidateSelect.click();

    // Bug #2: the search inputs exist but are non-interactive for this field. The panel
    // renders two elements matching this class - assert both are unusable rather than
    // assuming a single hidden one.
    const searchInputs = page.locator('input.mat-select-search-input');
    await expect(searchInputs).toHaveCount(2);
    const hiddenSearchInput = page.locator('input.mat-select-search-input.mat-select-search-hidden');
    await expect(hiddenSearchInput).toHaveCount(1);
    // The second input is visually present but lives inside a disabled mat-option, so it
    // cannot be focused/typed into either - confirm via the ancestor's aria-disabled rather
    // than attempting an interaction that would just time out.
    const disabledSearchOption = page.locator('mat-option.mat-option-disabled', {
      has: page.locator('input.mat-select-search-input:not(.mat-select-search-hidden)'),
    });
    await expect(disabledSearchOption).toHaveAttribute('aria-disabled', 'true');

    // Scroll the option panel once (the panel lazy-loads a further batch on scroll) and
    // confirm the freshly-created candidate still isn't selectable - documents the defect
    // rather than asserting a false pass.
    const panel = page.locator('.mat-select-panel, .cdk-overlay-pane .mat-mdc-select-panel').first();
    await panel.evaluate((el) => { el.scrollTop = el.scrollHeight; }).catch(() => {});
    await page.waitForTimeout(500);
    const matchingOption = page.getByRole('option', { name });
    await expect(matchingOption).toHaveCount(0);

    // Close the panel and the dialog without saving - no interview record is created.
    await page.keyboard.press('Escape');
    await dialog.getByRole('button', { name: 'Cancel' }).click();
    await expect(dialog).not.toBeVisible();

    // Cleanup: archive the synthetic candidate (no interview was ever created for it).
    await goToCandidateList(page);
    await searchFor(page, 'Candidate CAL05-3');
    await archiveCandidateFromActiveList(page, name);
  });
});
