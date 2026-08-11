// spec: specs/candidate-management.md
// seed: tests/seed-candidate.spec.ts

import { test, expect } from '@playwright/test';
import { login, goToCandidateList } from '../helpers/candidate-helpers';

test.describe('A. Manage Candidates - List Page', () => {
  test('A4. Column sorting', async ({ page }) => {
    await login(page);
    await goToCandidateList(page);

    // Note: the sort direction arrow is rendered as a Material icon ligature, not visible
    // text, so these assertions check row order changing rather than an arrow glyph.
    const firstRowName = () => page.getByRole('grid').getByRole('row').nth(1).textContent();

    // 1. Click the sort arrow next to Full Name; observe order. Click again to reverse.
    const fullNameSort = page.getByRole('button', { name: /Full Name/ });
    const initialFirst = await firstRowName();
    await fullNameSort.click();
    await expect.poll(firstRowName).not.toBe(initialFirst);
    const ascendingFirst = await firstRowName();
    await fullNameSort.click();
    await expect.poll(firstRowName).not.toBe(ascendingFirst);

    // 2. Repeat for GPA - clicking twice should not error and should re-order the table
    const gpaSort = page.getByRole('button', { name: /gpa/ });
    const beforeGpaSort = await firstRowName();
    await gpaSort.click();
    await expect.poll(firstRowName).not.toBe(beforeGpaSort);
    await gpaSort.click();

    // 3. Repeat for Priority
    const prioritySort = page.getByRole('button', { name: /priority/ });
    const beforePrioritySort = await firstRowName();
    await prioritySort.click();
    await expect.poll(firstRowName).not.toBe(beforePrioritySort);
    await prioritySort.click();

    // 4. Repeat for Created
    const createdSort = page.getByRole('button', { name: /created/ });
    const beforeCreatedSort = await firstRowName();
    await createdSort.click();
    await expect.poll(firstRowName).not.toBe(beforeCreatedSort);
    await createdSort.click();
  });
});
