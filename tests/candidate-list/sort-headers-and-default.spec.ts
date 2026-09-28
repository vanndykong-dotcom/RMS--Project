// spec: specs/candidate-list-test-plan.md (RMS-CANDLIST-04, CL04-1)
// seed: tests/seed-candidate.spec.ts
// column-sorting.spec.ts (A4) only checks that clicking a header changes the row order. This
// checks WHICH headers sort, the default order, and whether the resulting order is correct.
// Exploration on a quiet server (2026-09-28, all 35 rows across 3 pages) found Created sorts
// correctly but GPA and Priority do not, and sorting doesn't return to page 1 - those three are
// kept as failing, defect-documenting tests (same convention as the other *-defect specs).

import { test, expect, Page } from '@playwright/test';
import { login, goToCandidateList } from '../helpers/candidate-helpers';
import { parseRmsDateTime } from '../helpers/date-helpers';

// Column indexes (0-based td) - see page-structure.spec.ts for the full column order
const GPA = 7;
const PRIORITY = 9;
const CREATED = 12;

// Right after navigation the table briefly renders a single placeholder <tr> before the data
// rows arrive - wait for the real page size (15, or the total when smaller) before reading.
async function waitForDataRows(page: Page) {
  const total = Number((await page.getByText(/^Total: \d+$/).innerText()).replace(/\D/g, ''));
  await expect(page.locator('tbody tr.mat-row')).toHaveCount(Math.min(total, 15));
}

async function columnValues(page: Page, index: number) {
  await waitForDataRows(page);
  return page.locator('tbody tr.mat-row').evaluateAll(
    (rows, i) => rows.map((r) => (r.querySelectorAll('td')[i] as HTMLElement).innerText.trim()), index);
}

async function clickSortAndWait(page: Page, header: RegExp, direction: 'asc' | 'desc') {
  const response = page.waitForResponse((res) => /\/api\/v1\/candidate\?/.test(res.url())
    && new URL(res.url()).searchParams.get('sortDirection') === direction);
  await page.getByRole('button', { name: header }).click();
  await response;
  await waitForDataRows(page);
}

test.describe('RMS-CANDLIST-04. Sort the candidate list', () => {
  test('CL04-1a. Only Full Name, GPA, Priority and Created are sortable; default is Created newest first', async ({ page }) => {
    await login(page);
    await goToCandidateList(page);

    // Sortable headers carry aria-sort; the other ten columns don't
    const sortable = await page.locator('th[aria-sort]').allInnerTexts();
    expect(sortable.map((t) => t.replace(/[^a-z ]/gi, '').trim().toLowerCase())).toEqual(['full name', 'gpa', 'priority', 'created']);
    await expect(page.locator('th')).toHaveCount(14);

    // Default order: Created descending
    const created = (await columnValues(page, CREATED)).map(parseRmsDateTime);
    expect(created).toEqual([...created].sort((a, b) => b - a));

    // Clicking Created toggles ascending, then descending, and the header reflects it
    const createdHeader = page.locator('th', { hasText: /created/i });
    await clickSortAndWait(page, /created/, 'asc');
    await expect(createdHeader).toHaveAttribute('aria-sort', 'ascending');
    const asc = (await columnValues(page, CREATED)).map(parseRmsDateTime);
    expect(asc).toEqual([...asc].sort((a, b) => a - b));
    await clickSortAndWait(page, /created/, 'desc');
    await expect(createdHeader).toHaveAttribute('aria-sort', 'descending');
  });

  test('CL04-1b. Sorting returns to page 1 (documents a confirmed defect)', async ({ page }) => {
    await login(page);
    await goToCandidateList(page);

    await page.locator('.page-note-item', { hasText: /^\s*2\s*$/ }).click();
    await expect(page.locator('.page-note-item.active')).toHaveText('2');

    // KNOWN APP DEFECT (confirmed live 2026-09-28, see
    // test-reports/evidence/defect-CANDLIST04-2-sort-keeps-current-page.png): the sort request is
    // sent with page=2 and page 2 stays active, so the user lands mid-way through the newly
    // sorted list instead of at its start.
    await clickSortAndWait(page, /created/, 'asc');
    await expect(page.locator('.page-note-item.active')).toHaveText('1');
  });

  test('CL04-1c. GPA ascending orders rows by GPA value (documents a confirmed defect)', async ({ page }) => {
    await login(page);
    await goToCandidateList(page);

    // KNOWN APP DEFECT (confirmed live 2026-09-28 across all 35 rows): the GPA sort returns rows
    // in an order unrelated to GPA (ascending begins 1, 3, 1, 2, 1 ...) and descending is exactly
    // that order reversed, i.e. the server sorts by some other field. Multi-university cells
    // list several GPAs; the first line is compared. N/A rows are ignored.
    await clickSortAndWait(page, /gpa/, 'asc');
    const gpas = (await columnValues(page, GPA))
      .map((cell) => cell.split('\n')[0].trim())
      .filter((v) => v !== 'N/A')
      .map(Number);
    expect(gpas.length).toBeGreaterThan(1);
    expect(gpas).toEqual([...gpas].sort((a, b) => a - b));
  });

  test('CL04-1d. Priority descending puts High before Normal (documents a confirmed defect)', async ({ page }) => {
    await login(page);
    await goToCandidateList(page);

    // KNOWN APP DEFECT (confirmed live 2026-09-28): High-priority rows are scattered through
    // both sort directions, and descending is exactly ascending reversed.
    await clickSortAndWait(page, /priority/, 'asc');
    await clickSortAndWait(page, /priority/, 'desc');
    const priorities = await columnValues(page, PRIORITY);
    const firstNormal = priorities.indexOf('Normal');
    expect(priorities.slice(firstNormal)).not.toContain('High');
  });
});
