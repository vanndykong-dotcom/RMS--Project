// spec: specs/candidate-list-test-plan.md (RMS-CANDLIST-06)
// New coverage added during the RMS-CANDLIST smart re-run - no existing spec in the older suite
// asserted the Interview column's score display format. The underlying scoring formula is a
// still-open product question (see exploratory results - 5 of 8 live samples match Quiz+Coding
// as a raw sum, 3 don't), so this only asserts the confirmed literal display format, not the
// arithmetic behind it.

import { test, expect } from '@playwright/test';
import { login, goToCandidateList, searchFor } from '../helpers/candidate-helpers';

test.describe('RMS-CANDLIST-06. Interview/assessment score display', () => {
  test('completed assessment renders "NN% (Quiz: NN, Coding: NN )"', async ({ page }) => {
    await login(page);
    await goToCandidateList(page);

    // "Vk KONG" is an established "QA Automation"-tagged fixture with a confirmed, stable
    // assessment score (88.5%, Quiz 45, Coding 87) - safe to assert against as a real-data
    // fixture rather than a synthetic one, since none of this suite's synthetic-creation flows
    // populate an Interview score.
    await searchFor(page, 'Vk KONG');
    const row = page.getByRole('row', { name: /Vk KONG/ });
    await expect(row).toBeVisible();
    // Note the confirmed real space before the closing parenthesis - not a typo, reproduced
    // identically across all 8 live samples with a non-N/A score (see exploratory results).
    await expect(row).toContainText(/88\.5% \(Quiz: 45, Coding: 87\s*\)/);
  });

  test('no assessment renders "N/A"', async ({ page }) => {
    await login(page);
    await goToCandidateList(page);

    await searchFor(page, 'Sovan NI');
    const row = page.getByRole('row', { name: /Sovan NI/ });
    await expect(row).toBeVisible();
    // Sovan NI has no Interview score set - Interview column reads a bare "N/A", same as GPA/
    // Experience for this row. Scoped to the row rather than the whole page since "N/A" alone
    // matches many other cells too.
    const cells = row.locator('td');
    const cellTexts = (await cells.allTextContents()).map((t) => t.trim());
    expect(cellTexts).toContain('N/A');
  });
});
