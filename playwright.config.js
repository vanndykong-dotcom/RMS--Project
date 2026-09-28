// @ts-check
import { defineConfig, devices } from '@playwright/test';

/**
 * Read environment variables from file.
 * https://github.com/motdotla/dotenv
 */
import dotenv from 'dotenv';
import path from 'path';
dotenv.config({ path: path.resolve(__dirname, '.env') });

/* Specs that create, archive, modify or upload real records on the shared dev server. They all
 * act on the one shared candidate / job list, so running them side by side makes them read each
 * other's rows and time out behind each other's slow saves (see
 * test-reports/reruns/incremental-rerun-2026-09-28.md). They run in their own `*-writes`
 * project, one at a time; everything else keeps running in parallel.
 * Add any new spec that writes to the server here. */
const WRITE_SPECS = [
  '**/candidate-add/add-candidate-success.spec.ts',
  '**/candidate-archive/**/*.spec.ts',
  '**/candidate-details/education-card-multi-entry.spec.ts',
  '**/candidate-details/header-no-reference-code.spec.ts',
  '**/candidate-details/file-manager-delete-cancel.spec.ts',
  '**/candidate-details/file-manager-upload-delete-cycle.spec.ts',
  '**/candidate-list/inline-status-update.spec.ts',
  '**/candidate-list/row-menu-activity-log.spec.ts',
  '**/candidate-list/row-menu-archive.spec.ts',
  '**/candidate-list/row-menu-modify.spec.ts',
  '**/candidate-list/row-menu-set-interview.spec.ts',
  '**/candidate-list/row-menu-set-reminder.spec.ts',
  '**/candidate-modify/**/*.spec.ts',
  '**/dashboard/top-candidates-add-entry-point.spec.ts',
  '**/interview-schedule/create-interview-success.spec.ts',
  '**/interview-schedule/reschedule-cancel.spec.ts',
  '**/job-management/status-toggle-synthetic.spec.ts',
];

/* Each browser gets a parallel read-only project and a serial `-writes` project. */
const browserProjects = (name, device) => [
  { name, use: { ...device }, testIgnore: WRITE_SPECS },
  { name: `${name}-writes`, use: { ...device }, testMatch: WRITE_SPECS, workers: 1 },
];

/**
 * @see https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
  testDir: './tests',
  /* Run tests in files in parallel */
  fullyParallel: true,
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  /* Retry on CI only */
  retries: process.env.CI ? 2 : 0,
  /* This suite runs against a real, shared remote dev server (not a local instance) -
   * keep concurrency modest so tests don't overwhelm it or read each other's timing noise. */
  workers: process.env.CI ? 1 : 3,
  /* The default 30s is tight against that same shared remote server - flows spanning a
   * create/archive/search round trip can occasionally run past it on nothing more than
   * normal server-side lag (see tests/helpers/candidate-helpers.ts for documented cases). */
  timeout: 45_000,
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: 'html',
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    /* Base URL to use in actions like `await page.goto('')`. */
    // baseURL: 'http://localhost:3000',

    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: 'on-first-retry',
  },

  /* Configure projects for major browsers */
  projects: [
    ...browserProjects('chromium', devices['Desktop Chrome']),
    ...browserProjects('firefox', devices['Desktop Firefox']),
    ...browserProjects('webkit', devices['Desktop Safari']),

    /* Test against mobile viewports. */
    // {
    //   name: 'Mobile Chrome',
    //   use: { ...devices['Pixel 5'] },
    // },
    // {
    //   name: 'Mobile Safari',
    //   use: { ...devices['iPhone 12'] },
    // },

    /* Test against branded browsers. */
    // {
    //   name: 'Microsoft Edge',
    //   use: { ...devices['Desktop Edge'], channel: 'msedge' },
    // },
    // {
    //   name: 'Google Chrome',
    //   use: { ...devices['Desktop Chrome'], channel: 'chrome' },
    // },
  ],

  /* Run your local dev server before starting the tests */
  // webServer: {
  //   command: 'npm run start',
  //   url: 'http://localhost:3000',
  //   reuseExistingServer: !process.env.CI,
  // },
});

