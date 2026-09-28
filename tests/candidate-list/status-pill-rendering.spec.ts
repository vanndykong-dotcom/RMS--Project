// spec: specs/candidate-list-test-plan.md (RMS-CANDLIST-05, CL05-2)
// seed: tests/seed-candidate.spec.ts
// inline-status-update.spec.ts covers changing a status. This covers how the pill renders.

import { test, expect } from '@playwright/test';
import { login, goToCandidateList } from '../helpers/candidate-helpers';

test.describe('RMS-CANDLIST-05. Status rendering', () => {
  test('CL05-2a. Every row renders its status as a dropdown menu trigger', async ({ page }) => {
    await login(page);
    await goToCandidateList(page);

    // Right after navigation the table briefly renders a single placeholder row - wait for the
    // real page size (15, or the total when smaller) before counting.
    const total = Number((await page.getByText(/^Total: \d+$/).innerText()).replace(/\D/g, ''));
    const count = Math.min(total, 15);
    await expect(page.locator('tbody tr.mat-row')).toHaveCount(count);
    // Column 11 is Status (see page-structure.spec.ts for the full column order)
    await expect(page.locator('tbody tr td:nth-child(11) .mat-menu-trigger')).toHaveCount(count);
    await expect(page.locator('tbody tr td:nth-child(11) mat-icon', { hasText: 'arrow_drop_down' })).toHaveCount(count);
  });

  test('CL05-2b. Status pill styling differs by status (documents a confirmed defect)', async ({ page }) => {
    await login(page);
    await goToCandidateList(page);

    // KNOWN APP DEFECT (confirmed live 2026-09-28, see
    // test-reports/evidence/defect-CANDLIST05-2-status-pills-same-class.png): every status pill -
    // NEW REQUEST, PASSED, FAILED, MISSED, ATTENDED, IN PROGRESS, FOLLOWING UP - gets the same
    // hardcoded class "select-status following mat-select-following", so all seven render the
    // same tan/amber. Same family as CAND01-2 on Candidate Details. Asserts the expected behaviour
    // (more than one pill class across different statuses) so it keeps failing until fixed.
    const total = Number((await page.getByText(/^Total: \d+$/).innerText()).replace(/\D/g, ''));
    await expect(page.locator('tbody tr.mat-row')).toHaveCount(Math.min(total, 15));
    const pills = page.locator('tbody tr td:nth-child(11) .select-status');
    const byStatus = await pills.evaluateAll((els) =>
      els.map((e) => [(e.textContent ?? '').replace('arrow_drop_down', '').trim(), e.className]));
    expect(new Set(byStatus.map(([status]) => status)).size).toBeGreaterThan(1);
    expect(new Set(byStatus.map(([, className]) => className)).size).toBeGreaterThan(1);
  });
});
