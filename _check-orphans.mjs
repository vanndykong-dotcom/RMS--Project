import { chromium } from '@playwright/test';
import dotenv from 'dotenv';
import path from 'path';
dotenv.config({ path: path.resolve('.env') });
const BASE_URL = 'https://rms-dev.allweb.com.kh';

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
  for (const term of ['Candidate B2', 'Candidate A13', 'Candidate A9', 'Candidate E2', 'Candidate A5', 'Candidate A10', 'Candidate D2', 'Candidate C1']) {
    await search.fill(term);
    await page.waitForTimeout(900);
    const rows = page.getByRole('row', { name: new RegExp(term, 'i') });
    const count = await rows.count();
    console.log(`"${term}": ${count} row(s) in active list`);
    for (let i = 0; i < count; i++) {
      console.log('   -', (await rows.nth(i).innerText()).replace(/\n/g, ' | ').slice(0, 160));
    }
  }
  await browser.close();
})();
