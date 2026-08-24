// spec: specs/interview-schedule-test-plan.md (CAL01-2)

import { test, expect } from '@playwright/test';
import { login, goToInterviewSchedule } from '../helpers/candidate-helpers';

test.describe('RMS-CAL-01: Month calendar view', () => {
  test('CAL01-2. Weekend shading', async ({ page }) => {
    await login(page);
    await goToInterviewSchedule(page);

    // 1. Sat/Sun column headers carry the confirmed weekend shading.
    const satHeader = page.locator('.fc-col-header-cell.fc-day-sat');
    const sunHeader = page.locator('.fc-col-header-cell.fc-day-sun');
    for (const header of [satHeader, sunHeader]) {
      const { bg, color } = await header.evaluate((el) => {
        const style = getComputedStyle(el);
        return { bg: style.backgroundColor, color: style.color };
      });
      expect(bg).toBe('rgb(255, 229, 229)');
      expect(color).toBe('rgb(255, 0, 0)');
    }

    // 2. A Mon-Fri header is visually distinct (transparent bg, default/black text).
    const monHeader = page.locator('.fc-col-header-cell.fc-day-mon');
    const monStyle = await monHeader.evaluate((el) => {
      const style = getComputedStyle(el);
      return { bg: style.backgroundColor, color: style.color };
    });
    expect(monStyle.bg).not.toBe('rgb(255, 229, 229)');
    expect(monStyle.color).not.toBe('rgb(255, 0, 0)');

    // 3. The weekend shading also carries into the grid body's day cells, not just headers.
    const satDayCell = page.locator('.fc-daygrid-day.fc-day-sat').first();
    const satCellBg = await satDayCell.evaluate((el) => getComputedStyle(el).backgroundColor);
    expect(satCellBg).toBe('rgb(255, 229, 229)');
  });
});
