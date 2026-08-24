// spec: specs/interview-schedule-test-plan.md (CAL06-2)
// exploratory: confirmed a modal dialog (role="dialog"), not a tooltip/side panel. Real-data
// safety: only Close is clicked here, never Edit-then-save.

import { test, expect } from '@playwright/test';
import { login, goToInterviewSchedule } from '../helpers/candidate-helpers';

test.describe('RMS-CAL-06: Interview status at a glance', () => {
  test('CAL06-2. Clicking a pill opens a detail dialog', async ({ page }) => {
    await login(page);
    await goToInterviewSchedule(page);

    // The pill's own .event-title collapses to 0px width for long status text (documented
    // defect in reschedule-cancel.spec.ts) - click the whole event wrapper, not its title text.
    const anyPill = page.locator('.custom-calendar-event').first();
    await anyPill.click();

    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible();
    await expect(dialog.getByText('Apply for', { exact: false })).toBeVisible();
    await expect(dialog.getByText('Date & Time', { exact: false })).toBeVisible();
    await expect(dialog.getByText('Interviewers', { exact: false })).toBeVisible();
    await expect(dialog.getByText('Description', { exact: false })).toBeVisible();
    await expect(dialog.getByRole('button', { name: 'Edit' })).toBeVisible();
    // Strict-mode violation guard: "Add Result" matches both a status <span> and the "Add
    // Result" button, so a bare getByText() resolves to 2 elements - .first() is enough here
    // since either match proves the result section is present.
    await expect(dialog.getByText(/No Interview Result|Add Result/).first()).toBeVisible();
    await expect(dialog.getByRole('button', { name: 'Close' })).toBeVisible();

    // 2. Close (not Edit) - dialog closes, calendar view unchanged.
    await dialog.getByRole('button', { name: 'Close' }).click();
    await expect(dialog).not.toBeVisible();
    await expect(page.locator('.fc-toolbar-title')).toBeVisible();
  });
});
