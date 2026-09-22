// spec: specs/dashboard-test-plan.md (DASH05-1)
// exploratory: Top Candidates uses a real ngx-slick-carousel with 7 DOM slides total - 3 real
// ones at data-slick-index 0/1/2, plus 4 slick-generated clones (class includes "slick-cloned")
// that exist purely for infinite-loop wraparound. Automation must exclude clones. Real cards
// match the story's data/order exactly: Julie MARTIN (photo), Pheakkdey MUT (initials "PM"),
// Kimlong KUN (photo), each 4 filled stars.

import { test, expect } from '@playwright/test';
import { login } from '../helpers/candidate-helpers';

test.describe('RMS-DASH-05: View Top Candidates', () => {
  test('DASH05-1. Exactly 3 real (non-cloned) cards, in order, with correct avatar/name/stars', async ({ page }) => {
    await login(page);

    const realCards = page.locator('app-dashboard-top-candidate mat-card[ngxslickitem]:not(.slick-cloned)');
    await expect(realCards).toHaveCount(3);

    const expected = [
      { name: 'Ms. Julie MARTIN' },
      { name: 'Mr. Pheakkdey MUT' },
      { name: 'Mr. Kimlong KUN' },
    ];

    for (let i = 0; i < expected.length; i += 1) {
      const card = realCards.nth(i);
      await expect(card.locator('.avatar-name')).toContainText(expected[i].name);
      const stars = card.locator('app-aw-rating-star i.fa-star.ng-star-inserted');
      await expect(stars).toHaveCount(4);
      // Only the currently-active slide is exposed to the accessibility tree - slick.js marks
      // every other (still real, non-cloned) slide aria-hidden="true", so getByRole('button')
      // matches ZERO elements for those - confirmed live during healing. A plain text/class
      // locator (which ignores aria-hidden, unlike getByRole) finds the button regardless of
      // which slide is currently active.
      await expect(card.locator('app-aw-rich-button', { hasText: 'View' })).toHaveCount(1);
    }
  });
});
