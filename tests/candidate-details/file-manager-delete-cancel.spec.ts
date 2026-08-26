// spec: specs/candidate-details-test-plan.md (CAND04-4)
// exploratory: same upload/delete mechanics as CAND04-3 (see that file's header comment). This
// scenario additionally confirms that "Cancel" in the Delete confirmation dialog leaves the
// file intact, then cleans up via the confirmed delete-and-Remove flow so nothing is left
// behind.
// SAFETY: same constraints as CAND04-3 - a unique marker-named in-memory file, uploaded only
// into Sopheak PHAL's own folder. Originally used Vk KONG "to avoid two specs racing on the
// same folder's item count under parallel execution" - but CAND04-2 also targets Vk KONG,
// so that collision was still live; confirmed reproducing intermittently under this suite's
// default parallel workers (see report). Every one of the 4 file-manager specs now uses a
// distinct one of the 4 confirmed-safe synthetic candidates (specs/candidate-management.md):
// Raksa CHANN (CAND04-1), Vk KONG (CAND04-2), Vanndy VK (CAND04-3), Sopheak PHAL (this file).
// Exact filename verified before any Delete/Remove click; try/finally guarantees cleanup.

import { test, expect } from '@playwright/test';
import { login, goToCandidateDetails, getFileManager, getFileManagerItemCount } from '../helpers/candidate-helpers';

test.describe('RMS-CAND-04: Browse and manage candidate files', () => {
  test('CAND04-4. Delete cancellation leaves the file intact (negative/safety path)', async ({ page }) => {
    // This shared remote dev server has been observed to take well over the suite's default
    // 45s on the upload+delete round trip (elFinder's own connector calls) - a generous test
    // timeout avoids failing this safety-relevant cleanup path on nothing more than server lag.
    test.setTimeout(90000);
    await login(page);
    await goToCandidateDetails(page, 'Sopheak PHAL');

    const fileManager = await getFileManager(page);
    const marker = `qa-automation-cancel-${Date.now()}`;
    const fileName = `${marker}.txt`;

    try {
      await fileManager.locator('[title="Upload files"]').click();
      const fileInput = fileManager.locator('input[type="file"]').first();
      await fileInput.setInputFiles({
        name: fileName,
        mimeType: 'text/plain',
        buffer: Buffer.from('QA automation throwaway file - safe to delete.'),
      });

      const uploadedFile = fileManager.getByText(new RegExp(marker)).first();
      await expect(uploadedFile).toBeVisible({ timeout: 15000 });
      const itemsAfterUpload = await getFileManagerItemCount(fileManager);

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
      await dialog.getByRole('button', { name: 'Cancel' }).click();
      await expect(dialog).not.toBeVisible();

      // File is still present; item count unchanged from immediately after upload.
      await expect(uploadedFile).toBeVisible();
      expect(await getFileManagerItemCount(fileManager)).toBe(itemsAfterUpload);
    } finally {
      // Clean up via the confirmed delete-and-confirm flow so nothing is left behind. Uses the
      // same corrected `.ui-dialog` scoping as above - this is the exact selector bug that
      // previously left orphaned throwaway files behind when the cleanup dialog lookup silently
      // never matched anything (see spec header comment / report).
      //
      // Defense in depth: if the try block's own Cancel click above somehow left its confirm
      // dialog open (e.g. a slow render), resolve that dialog FIRST - it can only ever be for
      // the file this test itself just uploaded - before touching anything else, so it can
      // never intercept the cleanup's own click on the file row underneath it.
      const staleDialog = page.locator('.ui-dialog:visible').filter({ hasText: 'Delete' }).last();
      if (await staleDialog.isVisible().catch(() => false)) {
        await staleDialog.getByRole('button', { name: 'Cancel' }).click().catch(() => {});
        await expect(staleDialog).not.toBeVisible({ timeout: 15000 }).catch(() => {});
      }

      const leftover = fileManager.getByText(new RegExp(marker)).first();
      // Re-check visibility fresh on every attempt (not once up front): a background refresh
      // on this slow server can make a leftover seen as present a moment ago legitimately gone
      // by the time of the actual click.
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
