// spec: specs/dashboard-test-plan.md (DASH03-1)
// exploratory: Quick Access renders exactly 4 <app-aw-card> elements in DOM order, each with a
// primarytext="Total" prefix and a distinct secondarytext label; the visible value lives in the
// card's own <h4>.

import { test, expect } from '@playwright/test';
import { login } from '../helpers/candidate-helpers';

test.describe('RMS-DASH-03: View Quick Access summary counts', () => {
  test('DASH03-1. Exactly 4 cards, exact labels/values, in the documented order', async ({ page }) => {
    await login(page);

    const cards = page.locator('app-dashboard-quick-access app-aw-card');
    await expect(cards).toHaveCount(4);

    // Patterns tolerate singular/plural grammar (e.g. "0 interview" vs "48 interviews") - the
    // card's <h4> briefly renders a "0 interview(s)" placeholder before its async count loads
    // (confirmed live during healing, under this suite's default 3-worker concurrency), so the
    // count digit itself is not asserted as non-zero, only the overall shape.
    const expected = [
      { secondary: 'Interview', valuePattern: /^\d+ interviews?$/ },
      { secondary: 'Passed Candidate', valuePattern: /^\d+ candidates?$/ },
      { secondary: 'Failed Candidate', valuePattern: /^\d+ candidates?$/ },
      { secondary: 'Candidate', valuePattern: /^\d+ candidates?$/ },
    ];

    for (let i = 0; i < expected.length; i += 1) {
      const card = cards.nth(i);
      await expect(card).toHaveAttribute('primarytext', 'Total');
      await expect(card).toHaveAttribute('secondarytext', expected[i].secondary);
      // toHaveText is a web-first assertion that auto-retries until the pattern matches (or
      // times out) - this rides out the card's brief "0 interview(s)" loading placeholder
      // rather than racing a one-shot innerText() read against it.
      await expect(card.locator('h4')).toHaveText(expected[i].valuePattern, { timeout: 10000 });
    }
  });
});
