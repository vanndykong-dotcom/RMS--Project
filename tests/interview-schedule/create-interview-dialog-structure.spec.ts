// spec: specs/interview-schedule-test-plan.md (CAL05-2)
// Real-data safety: this scenario only opens and cancels the dialog - never fills or saves.

import { test, expect } from '@playwright/test';
import { login, goToInterviewSchedule } from '../helpers/candidate-helpers';

test.describe('RMS-CAL-05: Create a new interview (entry point only)', () => {
  test('CAL05-2. Clicking Create Interview opens the creation dialog (structure only, no submission)', async ({ page }) => {
    // The Create Interview dialog is taller than the default viewport, which leaves its
    // Cancel button outside the visible area (dialog-internal scroll, not page scroll) -
    // same fix as reschedule-cancel.spec.ts's Set Interview dialog.
    await page.setViewportSize({ width: 1280, height: 1600 });
    await login(page);
    await goToInterviewSchedule(page);

    // The event pills load asynchronously after navigation; without waiting for at least one
    // to render, this baseline count can race the initial fetch and come back 0, which then
    // makes the post-cancel "unchanged count" assertion fail once the real pills load in.
    const pills = page.locator('.custom-calendar-event');
    await expect(pills.first()).toBeVisible();
    const pillCountBefore = await pills.count();

    // 1. Click "Create Interview" - a dialog opens (not a full navigation).
    await page.getByRole('button', { name: 'Create Interview' }).click();
    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible();
    await expect(dialog.getByText('Create Interview')).toBeVisible();
    await expect(page).toHaveURL(/\/admin\/calendar/);

    // Expected fields per the exploratory results' confirmed field list.
    await expect(dialog.locator('mat-select[formcontrolname="candidateId"]')).toBeVisible();
    await expect(dialog.locator('mat-select[formcontrolname="employees"]')).toBeVisible();
    await expect(dialog.getByRole('button', { name: 'Open calendar' })).toBeVisible();
    await expect(dialog.getByText('Send invitation mail to candidate')).toBeVisible();
    await expect(dialog.getByText('Reminder Me')).toBeVisible();
    await expect(dialog.locator('mat-select[formcontrolname="title"]')).toBeVisible();
    // Description is a Quill rich-text editor, not a plain textarea.
    await expect(dialog.locator('quill-editor[formcontrolname="description"] .ql-editor')).toBeVisible();
    await expect(dialog.getByRole('button', { name: 'Cancel' })).toBeVisible();
    await expect(dialog.getByRole('button', { name: 'Save' })).toBeVisible();

    // 2. Cancel without filling anything - dialog closes, no interview created.
    await dialog.getByRole('button', { name: 'Cancel' }).click();
    await expect(dialog).not.toBeVisible();
    await expect(pills).toHaveCount(pillCountBefore);
  });
});
