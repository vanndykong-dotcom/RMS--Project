// spec: specs/SCRUM.md
// seed: tests/seed.spec.ts
//
// Measures real-world timing (not a load/stress test) against the shared remote dev
// server: initial page load (Navigation Timing API) plus click-to-rendered elapsed time
// for login and every main sidebar SPA route. Runs serially in one shared page so later
// navigations aren't skewed by a fresh session's extra login/auth round trip.
// Results are written to test-reports/performance-report.md for review.

import { test, expect, type Page } from '@playwright/test';
import fs from 'fs';
import path from 'path';

const BASE_URL = 'https://rms-dev.allweb.com.kh';
// Generous per playwright.config.js's own note: this suite runs against a real, shared
// remote dev server, not a local instance - budgets allow for normal server-side lag
// rather than asserting on a local/CI-fast timing profile.
const NAV_BUDGET_MS = 15_000;

type Result = { name: string; ms: number };
const results: Result[] = [];

function record(name: string, ms: number) {
  results.push({ name, ms: Math.round(ms) });
}

async function measureSidebarNav(page: Page, navLabel: string, heading: string, url: RegExp, exact = false) {
  const sidebarTree = page.getByRole('tree');
  const start = Date.now();
  await sidebarTree.getByRole('button', { name: navLabel, exact }).click();
  await expect(page).toHaveURL(url);
  await expect(page.getByRole('heading', { name: heading })).toBeVisible();
  const elapsed = Date.now() - start;
  record(`Navigate: ${navLabel}`, elapsed);
  expect(elapsed).toBeLessThan(NAV_BUDGET_MS);
}

test.describe.serial('Performance - Page Load Timing', () => {
  let page: Page;

  test.beforeAll(async ({ browser }) => {
    page = await browser.newPage();
  });

  test.afterAll(async () => {
    await page.close();
    writeReport(results);
  });

  test('Welcome (login) page load timing', async () => {
    const start = Date.now();
    await page.goto(`${BASE_URL}/welcome`, { waitUntil: 'load' });
    await expect(page.getByText('Welcome!')).toBeVisible();
    record('Welcome page: goto -> visible', Date.now() - start);

    const nav = await page.evaluate(() => {
      const [entry] = performance.getEntriesByType('navigation') as PerformanceNavigationTiming[];
      if (!entry) return null;
      return {
        ttfb: entry.responseStart - entry.requestStart,
        domContentLoaded: entry.domContentLoadedEventEnd - entry.startTime,
        windowLoad: entry.loadEventEnd - entry.startTime,
      };
    });
    if (nav) {
      record('Welcome page: TTFB', nav.ttfb);
      record('Welcome page: DOMContentLoaded', nav.domContentLoaded);
      record('Welcome page: window.load', nav.windowLoad);
    }
  });

  test('Login submit -> Dashboard render timing', async () => {
    await page.getByRole('textbox', { name: 'Enter Username' }).fill(process.env.FAPA_EMAIL as string);
    await page.getByRole('textbox', { name: 'Enter Password' }).fill(process.env.FAPA_PASSWORD as string);

    const start = Date.now();
    await page.getByRole('button', { name: 'Login' }).click();
    await expect(page).toHaveURL(/\/admin\/dashboard/);
    await expect(page.getByRole('heading', { name: 'Dashboard', level: 1 })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Quick Access' })).toBeVisible();
    const elapsed = Date.now() - start;
    record('Login submit -> Dashboard visible', elapsed);
    expect(elapsed).toBeLessThan(NAV_BUDGET_MS);
  });

  test('Navigate: Candidate', async () => {
    await measureSidebarNav(page, 'Candidate', 'Manage Candidates', /\/admin\/candidate$/);
  });

  test('Candidate list search response timing', async () => {
    const search = page.locator('app-aw-layout-list').getByRole('textbox', { name: 'Search' });
    const start = Date.now();
    const waitForFilteredResponse = page.waitForResponse((res) => {
      if (res.request().method() !== 'GET') return false;
      try {
        return new URL(res.url()).searchParams.get('filter') === 'QA Automation Test';
      } catch {
        return false;
      }
    }, { timeout: NAV_BUDGET_MS });
    await search.fill('QA Automation Test');
    await waitForFilteredResponse;
    record('Candidate list: search filter response', Date.now() - start);
    await search.fill('');
  });

  test('Navigate: Interview Schedule', async () => {
    await measureSidebarNav(page, 'Interview Schedule', 'Manage Interview Schedule', /\/admin\/calendar/);
  });

  test('Navigate: Demand', async () => {
    await measureSidebarNav(page, 'Demand', 'Manage Demands', /\/admin\/demand/);
  });

  test('Navigate: Report', async () => {
    // exact:true required - a substring match would also hit "Advance Report".
    await measureSidebarNav(page, 'Report', 'Manage Candidates Report', /\/admin\/candidate\/report/, true);
  });

  test('Navigate: Advance Report', async () => {
    await measureSidebarNav(page, 'Advance Report', 'Manage Candidates Advance Report', /\/admin\/candidate\/advance-report/);
  });

  test('Navigate: Activity', async () => {
    await measureSidebarNav(page, 'Activity', 'Manage Activities', /\/admin\/activities/);
  });

  test('Navigate: Reminder', async () => {
    await measureSidebarNav(page, 'Reminder', 'Manage Reminder', /\/admin\/reminders/);
  });

  test('Navigate: File Manager', async () => {
    await measureSidebarNav(page, 'File Manager', 'Manage Advance File Manager', /\/admin\/setting\/file-manager/);
  });

  test('Navigate: Dashboard (return)', async () => {
    await measureSidebarNav(page, 'Dashboard', 'Dashboard', /\/admin\/dashboard/);
  });
});

function writeReport(rows: Result[]) {
  const dir = path.resolve(__dirname, '..', '..', 'test-reports');
  fs.mkdirSync(dir, { recursive: true });
  const now = new Date().toISOString();
  const lines = [
    '# Performance Test Report: Page Load Timing',
    '',
    `**Environment:** ${BASE_URL} (real, shared remote dev server)`,
    `**Generated:** ${now}`,
    '',
    '| Metric | Elapsed (ms) |',
    '|---|---|',
    ...rows.map((r) => `| ${r.name} | ${r.ms} |`),
    '',
  ];
  fs.writeFileSync(path.join(dir, 'performance-report.md'), lines.join('\n'), 'utf-8');
}
