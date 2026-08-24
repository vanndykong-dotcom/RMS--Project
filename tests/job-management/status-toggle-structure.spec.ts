// spec: specs/job-management-test-plan.md (JOB04-1)
// exploratory: each row's Status cell renders <app-aw-slider-toggle appdisablecomponent>
// wrapping a native <label class="switch"><input type="checkbox">...</label>. All 11 rows are
// checked:true, disabled:false. The toggle input is NOT exposed via getByRole('checkbox')
// (site-wide count 0 despite type="checkbox" existing) - target it structurally.
// SAFETY: no click is performed on any of the 11 real rows in this scenario - structural
// inspection only (see status-toggle-synthetic.spec.ts for the real write-cycle test).

import { test, expect } from '@playwright/test';
import { login, goToJobDescriptions } from '../helpers/candidate-helpers';

test.describe('RMS-JOB-04: Toggle job description active status', () => {
  test('JOB04-1. Toggle structure and current state on the real rows (read-only)', async ({ page }) => {
    await login(page);
    await goToJobDescriptions(page);

    // The selector itself is correct (confirmed live: each row's Status cell is exactly
    // <app-aw-slider-toggle appdisablecomponent><div class="aw-slide-toggle"><label
    // class="switch"><input type="checkbox">...). The failure was a timing race: rows render
    // before this async component mounts its own <input>, and .count() reads the DOM
    // synchronously with no auto-wait/retry (unlike expect() assertions) - calling it right
    // after goToJobDescriptions() can catch the toggle mid-render. Wait for the first one to
    // actually attach before counting.
    const toggles = page.locator('table tbody tr app-aw-slider-toggle input[type="checkbox"]');
    await expect(toggles.first()).toBeAttached({ timeout: 10000 });
    const count = await toggles.count();
    expect(count).toBeGreaterThan(0);

    for (let i = 0; i < count; i += 1) {
      await expect(toggles.nth(i)).toBeChecked();
      await expect(toggles.nth(i)).toBeEnabled();
    }
    // No click is performed on any of these rows above - read-only inspection only.
  });
});
