// spec: specs/candidate-details-test-plan.md (CAND04-3)
// exploratory: the toolbar's "Upload files" button opens an in-page drag-and-drop dialog, NOT
// a native file chooser - automation must target the underlying `input[type="file"]` directly
// via setInputFiles(), never `page.waitForEvent('filechooser')`. Delete requires confirmation:
// a dialog titled "Delete" with "Are you sure you want to permanently remove items? This
// cannot be undone!" and Remove/Cancel buttons.
// SAFETY: only ever targets a file this test itself creates - a unique marker-named .txt built
// in-memory (never written to disk), uploaded only into Vanndy VK's (a synthetic/automation-
// owned candidate's) own folder. Originally used Raksa CHANN, which collided with CAND04-1
// (file-manager-structure.spec.ts) also reading Raksa CHANN's folder concurrently under this
// suite's default parallel workers - confirmed intermittently flaky because of that (see
// report). Every one of the 4 file-manager specs now uses a distinct one of the 4
// confirmed-safe synthetic candidates (specs/candidate-management.md): Raksa CHANN (CAND04-1),
// Vk KONG (CAND04-2), Vanndy VK (this file), Sopheak PHAL (CAND04-4). The exact visible
// filename is verified to contain the marker before Delete is ever clicked. try/finally
// guarantees the throwaway file is removed even if an assertion above fails.

import { test, expect } from '@playwright/test';
import { login, goToCandidateDetails, getFileManager, getFileManagerItemCount } from '../helpers/candidate-helpers';

test.describe('RMS-CAND-04: Browse and manage candidate files', () => {
  test('CAND04-3. Upload, verify, and delete a throwaway file (happy path)', async ({ page }) => {
    // This shared remote dev server has been observed to take well over the suite's default
    // 45s on the upload+delete round trip (elFinder's own connector calls) - a generous test
    // timeout avoids failing this safety-relevant cleanup path on nothing more than server lag.
    test.setTimeout(90000);
    await login(page);
    await goToCandidateDetails(page, 'Vanndy VK');

    const fileManager = await getFileManager(page);
    const baselineItems = await getFileManagerItemCount(fileManager);

    const marker = `qa-automation-${Date.now()}`;
    const fileName = `${marker}.txt`;

    try {
      await fileManager.locator('[title="Upload files"]').click();
      const fileInput = fileManager.locator('input[type="file"]').first();
      await fileInput.setInputFiles({
        name: fileName,
        mimeType: 'text/plain',
        buffer: Buffer.from('QA automation throwaway file - safe to delete.'),
      });

      // The server renames the file with a UUID prefix but keeps the marker substring.
      const uploadedFile = fileManager.getByText(new RegExp(marker)).first();
      await expect(uploadedFile).toBeVisible({ timeout: 15000 });
      await expect.poll(() => getFileManagerItemCount(fileManager), { timeout: 15000 }).toBe(baselineItems + 1);

      // Verify the exact filename before ever clicking Delete.
      const visibleName = (await uploadedFile.textContent())?.trim() ?? '';
      expect(visibleName).toContain(marker);

      await uploadedFile.click();
      await fileManager.locator('[title="Delete"]').click();

      // Confirmed live: elFinder's own dialogs (verified on its "notify" and "help" popups,
      // which share this exact markup convention) are plain jQuery UI `.ui-dialog` elements -
      // NOT ARIA `role="dialog"` - so `page.getByRole('dialog')` never matches this delete
      // confirmation and hangs forever waiting for it. Scope to the visible `.ui-dialog`
      // instead (`:visible` because elFinder keeps several dialog instances in the DOM at
      // once, hidden via `display:none`, e.g. its own notify/help dialogs).
      const dialog = page.locator('.ui-dialog:visible').filter({ hasText: 'Delete' }).last();
      await expect(dialog).toBeVisible();
      // Confirmed live: "Are you sure...items?" and "This cannot be undone!" render as two
      // separate DOM nodes (a line break between them, no actual space/newline character in
      // their combined textContent) - tolerate that instead of asserting one literal string.
      await expect(dialog).toContainText(/Are you sure you want to permanently remove items\?\s*This cannot be undone!/);
      await dialog.getByRole('button', { name: 'Remove' }).click();

      // Generous timeout: this shared remote dev server has been observed to take well over
      // the default 5s to actually process a delete and refresh the file list.
      await expect(fileManager.getByText(new RegExp(marker))).toHaveCount(0, { timeout: 15000 });
      await expect.poll(() => getFileManagerItemCount(fileManager), { timeout: 15000 }).toBe(baselineItems);
    } finally {
      // Safety net: if the throwaway file is still present for any reason (e.g. an assertion
      // above failed after upload but before delete), remove it now so nothing is left behind.
      // Uses the same corrected `.ui-dialog` scoping as above - this is the exact selector bug
      // that previously left orphaned throwaway files behind when the cleanup dialog lookup
      // silently never matched anything (see report).
      //
      // If the try block's own Remove click above is still resolving (slow server), its
      // confirm dialog may still be open here and would intercept any click on the file row
      // underneath it - always resolve that dialog FIRST (it can only ever be for the file this
      // test itself just uploaded, since nothing else in this test's flow opens one) before
      // touching anything else.
      const staleDialog = page.locator('.ui-dialog:visible').filter({ hasText: 'Delete' }).last();
      if (await staleDialog.isVisible().catch(() => false)) {
        await staleDialog.getByRole('button', { name: 'Remove' }).click().catch(() => {});
        await expect(staleDialog).not.toBeVisible({ timeout: 15000 }).catch(() => {});
      }

      const leftover = fileManager.getByText(new RegExp(marker)).first();
      // Re-check visibility fresh on every attempt (not once up front): the try block's own
      // delete may still be resolving in the background on this slow server and complete
      // between checks, so a leftover seen as present a moment ago can legitimately be gone by
      // the time of the actual click - that's success, not a failure to handle.
      for (let attempt = 1; attempt <= 3; attempt += 1) {
        if (!(await leftover.isVisible().catch(() => false))) break;
        try {
          await leftover.click({ timeout: 15000 });
          await fileManager.locator('[title="Delete"]').click();
          const cleanupDialog = page.locator('.ui-dialog:visible').filter({ hasText: 'Delete' }).last();
          await expect(cleanupDialog).toBeVisible({ timeout: 15000 });
          await cleanupDialog.getByRole('button', { name: 'Remove' }).click();
          await expect(leftover).not.toBeVisible({ timeout: 15000 });
          break;
        } catch (e) {
          if (attempt === 3) throw e;
          await page.waitForTimeout(1000);
        }
      }
    }
  });
});
