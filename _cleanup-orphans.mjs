import { chromium } from '@playwright/test';
import dotenv from 'dotenv';
import path from 'path';
dotenv.config({ path: path.resolve('.env') });
const BASE_URL = 'https://rms-dev.allweb.com.kh';

const TERMS = ['Candidate B2', 'Candidate A13', 'Candidate A9', 'Candidate E2', 'Candidate A5', 'Candidate A10', 'Candidate D2', 'Candidate C1', 'Candidate DIAG'];

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.goto(`${BASE_URL}/welcome`);
  await page.getByRole('textbox', { name: 'Enter Username' }).fill(process.env.FAPA_EMAIL);
  await page.getByRole('textbox', { name: 'Enter Password' }).fill(process.env.FAPA_PASSWORD);
  await page.getByRole('button', { name: 'Login' }).click();
  await page.waitForURL(/\/admin\/dashboard/);
  await page.getByRole('tree').getByRole('button', { name: 'Candidate' }).click();
  await page.waitForURL(/\/admin\/candidate/);

  const search = page.locator('app-aw-layout-list').getByRole('textbox', { name: 'Search' });
  let totalArchived = 0;
  for (const term of TERMS) {
    // Loop archiving the first matching row repeatedly until none remain for this term,
    // since archiving one row shifts the rest up (safer than collecting a stale locator list).
    for (let guard = 0; guard < 20; guard++) {
      await search.fill(term);
      await page.waitForTimeout(900);
      const rows = page.getByRole('row', { name: new RegExp(term, 'i') });
      const count = await rows.count();
      if (count === 0) break;
      const row = rows.first();
      await row.getByRole('button').last().click();
      const archiveItem = page.getByRole('menuitem', { name: /Add to archive/ });
      if (!(await archiveItem.isVisible().catch(() => false))) {
        await page.keyboard.press('Escape').catch(() => {});
        break;
      }
      await archiveItem.click();
      await page.getByRole('button', { name: 'Confirm' }).click();
      await page.waitForTimeout(700);
      totalArchived += 1;
    }
    console.log(`done with "${term}"`);
  }
  console.log('total archived:', totalArchived);
  await browser.close();
})();
