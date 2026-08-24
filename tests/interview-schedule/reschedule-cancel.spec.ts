// spec: specs/candidate-management.md
// seed: tests/seed-candidate.spec.ts

import { test, expect } from '@playwright/test';
import {
  login, goToCandidateList, createSyntheticCandidate, searchFor, openRowMenu, archiveCandidateFromActiveList, ensureOnCandidateList, selectComboboxOption, pickFutureCalendarDate,
} from '../helpers/candidate-helpers';

test.describe('D. Interview Schedule Module', () => {
  test('D2. Interview entry opens an editable dialog from the Interview Schedule module', async ({ page }) => {
    // The Set Interview dialog is taller than the default viewport, which leaves its Save
    // button unreachable even after scrollIntoViewIfNeeded (dialog-internal scroll, not
    // page scroll) - a larger viewport avoids that entirely.
    await page.setViewportSize({ width: 1280, height: 1600 });
    await login(page);
    await goToCandidateList(page);
    const name = await createSyntheticCandidate(page, { lastNameSuffix: 'D2' });
    await searchFor(page, 'Candidate D2');

    // Set an interview so there is an entry to inspect from the Interview Schedule module
    await openRowMenu(page, name);
    await page.getByRole('menuitem', { name: /Set Interview/ }).click();
    await selectComboboxOption(page, 'Interviewers *', 'Chamrong THOR');
    await page.keyboard.press('Escape');

    // A date/time must be explicitly picked - the field's auto-filled default is left
    // marked invalid and silently blocks Save otherwise (see A10 for the same requirement).
    const interviewDate = await pickFutureCalendarDate(page);

    await selectComboboxOption(page, 'Apply for', 'Software Testing Automation');
    const saveButton = page.getByRole('button', { name: 'Save' });
    await saveButton.scrollIntoViewIfNeeded();
    await saveButton.click();
    await ensureOnCandidateList(page);

    // 1. From Interview Schedule, open the entry
    await page.getByRole('tree').getByRole('button', { name: 'Interview Schedule' }).click();
    await expect(page).toHaveURL(/\/admin\/calendar/);

    // Known defect (see report): each calendar event chip is a flex row of
    // [.event-time, .event-title, .event-description], all `white-space: nowrap` with no
    // min-width override. For a freshly-created interview the status text is "NEW REQUEST"
    // (long), and the flex-shrink calculation collapses .event-title to a computed width of
    // 0px - confirmed via computed style even for a lone event with no sibling crowding in
    // its day cell. The candidate/position name is never rendered, so it can't be located or
    // clicked by its text (a real user can't read it either - only "<time> - NEW REQUEST" is
    // visible). Captured here for evidence; the chip's wrapper (visible) is clicked below
    // instead of its invisible title text as a workaround so the rest of the scenario can
    // still be exercised.
    await page.screenshot({ path: 'defect-D2-calendar-event-title-zero-width.png' });

    const bookedDateIso = `${interviewDate.getFullYear()}-${String(interviewDate.getMonth() + 1).padStart(2, '0')}-${String(interviewDate.getDate()).padStart(2, '0')}`;
    const eventChip = page
      .locator(`.fc-daygrid-day[data-date="${bookedDateIso}"]`)
      .locator('.custom-calendar-event')
      .filter({ hasText: 'NEW REQUEST' })
      .last();
    await eventChip.click();
    await expect(page.getByRole('dialog')).toBeVisible();
    await expect(page.getByRole('dialog').getByText('PASSED').or(page.getByRole('dialog').getByText('NEW REQUEST'))).toBeVisible();

    // 2. The Edit action opens an editable form (date/time is changeable from here)
    await page.getByRole('dialog').getByRole('button', { name: 'Edit' }).click();
    // A bare getByText('Date & time') is ambiguous here: the underlying read-only summary
    // still renders "Date & Time" (a plain text-xs div) alongside the edit form's own
    // "Date & time *" field label, and getByText's default case-insensitive substring match
    // hits both. Anchor on the field label's asterisk to target the editable form specifically.
    await expect(page.getByText('Date & time *')).toBeVisible();

    // Close without saving - real reschedule/cancel persistence for this module is
    // documented as not fully exercised live; see test-results report for the gap.
    await page.getByRole('button', { name: 'Cancel' }).click();

    // cleanup
    await goToCandidateList(page);
    await searchFor(page, 'Candidate D2');
    await archiveCandidateFromActiveList(page, name);
  });
});
