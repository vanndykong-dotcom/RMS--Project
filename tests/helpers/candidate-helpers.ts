import { Page, expect } from '@playwright/test';

const BASE_URL = 'https://rms-dev.allweb.com.kh';

export async function login(page: Page) {
  await page.goto(`${BASE_URL}/welcome`);
  await page.getByRole('textbox', { name: 'Enter Username' }).fill(process.env.FAPA_EMAIL as string);
  await page.getByRole('textbox', { name: 'Enter Password' }).fill(process.env.FAPA_PASSWORD as string);
  await page.getByRole('button', { name: 'Login' }).click();
  await expect(page).toHaveURL(/\/admin\/dashboard/);
}

export async function goToCandidateList(page: Page) {
  await page.getByRole('tree').getByRole('button', { name: 'Candidate' }).click();
  await expect(page).toHaveURL(/\/admin\/candidate/);
  await expect(page.getByRole('heading', { name: 'Manage Candidates' })).toBeVisible();
}

/**
 * Creates a synthetic "QA Automation Test" candidate through the full 5-step Add wizard
 * (CV upload is required by the app - a minimal fixture PDF is uploaded).
 * Returns the exact stored full name, which may differ in casing/spacing from the input
 * due to a known name-sanitization defect (see test-results report).
 */
export async function createSyntheticCandidate(page: Page, opts: { lastNameSuffix: string }): Promise<RegExp> {
  // A per-run unique token is appended so retries (or leftovers from a previously failed
  // run) never collide with this run's row lookups - searchFor('Candidate X') still matches
  // both by substring, but this returned regex only ever matches the one just created.
  const uniqueLastName = `${opts.lastNameSuffix} ${Date.now()}`;

  await page.getByRole('button', { name: 'Add' }).click();
  await expect(page.getByRole('heading', { name: 'Add Information' })).toBeVisible();

  await page.locator('app-aw-input-box-select').filter({ hasText: 'Salutation' }).getByRole('textbox').click();
  await page.getByRole('menuitem', { name: 'Ms.' }).click();
  await page.getByRole('textbox', { name: 'First name' }).fill('QA Automation Test');
  await page.getByRole('textbox', { name: 'Last name' }).fill(`Candidate ${uniqueLastName}`);

  await page.getByRole('textbox', { name: 'N/A' }).click();
  await page.getByRole('gridcell', { name: 'August 1,' }).first().click();
  await page.getByRole('button', { name: 'Apply' }).click();

  await page.locator('app-aw-input-box-multiple').getByRole('textbox').fill('012 345 678');
  await page.getByRole('textbox', { name: 'Email' }).fill(`qa.automation.${Date.now()}@example.com`);
  await page.getByRole('button', { name: 'Next', exact: true }).click();

  // Education step: NOT actually optional despite the UI implying so - skipping it
  // silently blocks with a toast ("The candidate needs at least one education.") and no
  // inline field error, so at least one entry must be added (see report for this defect).
  await expect(page.getByRole('heading', { name: 'Add Education' })).toBeVisible();
  await page.getByRole('button', { name: '+ Add education' }).click();
  await page.locator('app-aw-input-box-select').filter({ hasText: 'University' }).getByRole('textbox').click();
  await page.getByRole('menuitem', { name: 'ITC' }).click();
  await page.locator('app-aw-input-box-text').filter({ hasText: 'Major' }).getByRole('textbox').fill('Software Engineering');
  await page.getByRole('spinbutton').fill('3.5');
  await page.getByRole('button', { name: 'Apply' }).click();
  await page.getByRole('button', { name: 'Next', exact: true }).click();

  // Experience step: optional, skip
  await expect(page.getByRole('heading', { name: 'Add Experience' })).toBeVisible();
  await page.getByRole('button', { name: 'Next', exact: true }).click();

  // Upload CV step: required by the app despite no visible error message if skipped.
  // The upload is a background POST to /temporary/upload - clicking Next before it
  // resolves races ahead of it and the wizard rejects with "CV is required", so this
  // waits for that response explicitly rather than just the file appearing in the UI.
  await expect(page.getByRole('heading', { name: 'Upload CV' })).toBeVisible();

  // This step also requires an "Apply For" position (a new required field not present
  // when this wizard was first automated - omitting it leaves the wizard stuck on this
  // step with a "Please fill in Apply For field." error and no Preview step reached).
  // "Software Testing Automation" is one of the synthetic/automation-owned position tags
  // already treated as safe throughout this suite (see specs/candidate-management.md).
  await page.getByText('Apply For', { exact: false }).locator('..').getByRole('combobox').click();
  await page.getByRole('listbox').getByRole('option', { name: 'Software Testing Automation', exact: true }).click();

  const [fileChooser] = await Promise.all([
    page.waitForEvent('filechooser'),
    page.getByRole('button', { name: 'Browse' }).click(),
  ]);
  await Promise.all([
    page.waitForResponse((res) => res.url().includes('/temporary/upload') && res.ok()),
    fileChooser.setFiles('tests/fixtures/qa-automation-test-cv.pdf'),
  ]);
  await page.getByRole('button', { name: 'Next', exact: true }).click();

  await expect(page.getByRole('heading', { name: 'Preview Candidate Information' })).toBeVisible();
  await page.getByRole('button', { name: 'Finish' }).click();
  // Known defect (see report): submitting sometimes triggers a blocked Keycloak silent-refresh
  // that reloads the SPA and strands it on an unrelated cached page instead of the candidate
  // list. The record is still created either way, so navigate there explicitly rather than
  // trusting the app's own post-submit redirect.
  await ensureOnCandidateList(page);

  // Returns a case-insensitive regex matching the candidate's row, rather than a predicted
  // exact display name - the app's name-sanitization defect (see report) mutates casing/spacing
  // on every save, so asserting an exact display name here would be fragile by design.
  return new RegExp(`Candidate ${uniqueLastName}`, 'i');
}

/**
 * Some submit actions (Set Interview, Set Reminder, Activity Log Update, candidate
 * create/edit Finish) redirect unreliably - sometimes staying on the source page,
 * sometimes landing elsewhere - see report. Call this afterward instead of asserting
 * on the post-submit URL directly.
 */
export async function ensureOnCandidateList(page: Page) {
  await page.waitForURL(/\/admin\/candidate$/, { timeout: 8000 }).catch(() => {});
  if (!/\/admin\/candidate$/.test(page.url())) {
    await page.goto(`${BASE_URL}/admin/candidate`);
  }
  await expect(page.getByRole('heading', { name: 'Manage Candidates' })).toBeVisible();
}

/**
 * Selects an option from an Angular Material dropdown identified by its field label.
 * Scoped to the open listbox overlay (role=listbox/option) rather than a bare page-wide
 * text search - a bare `getByText(optionName)` can collide with unrelated same-text
 * elements elsewhere on the page (e.g. another candidate's position tag) and hang on a
 * backdrop-intercepted click. `.first()` additionally covers duplicate option entries
 * that exist in some dropdowns' underlying data (e.g. a repeated interviewer name).
 */
export async function selectComboboxOption(page: Page, fieldLabel: string, optionName: string) {
  await page.getByText(fieldLabel).locator('..').getByRole('combobox').click();
  await page.getByRole('listbox').getByRole('option', { name: optionName, exact: true }).first().click();
}

/**
 * Fills the list's search box and waits for the resulting filtered-list request to resolve.
 *
 * The app debounces the search box server-side: the filtered GET request fires some time
 * (observed: tens of ms up to ~400ms) after the input value changes, not synchronously with
 * fill(). If a caller proceeds immediately (e.g. openRowMenu -> click a menu item) without
 * waiting for that debounced request/response, the late-arriving response causes the app to
 * re-render the whole row list out from under an already-open row menu, detaching the very
 * menu item being clicked mid-click - this is the root cause behind the "element is not
 * stable" / "element was detached from the DOM, retrying" failures seen on several
 * openRowMenu()-based tests (see report). Waiting here, once, fixes it for every caller
 * instead of requiring each call site to guard against it individually.
 */
export async function searchFor(page: Page, term: string) {
  const search = page.locator('app-aw-layout-list').getByRole('textbox', { name: 'Search' });
  const waitForFilteredResponse = page.waitForResponse((res) => {
    if (res.request().method() !== 'GET') return false;
    try {
      return new URL(res.url()).searchParams.get('filter') === term;
    } catch {
      return false;
    }
  }, { timeout: 8000 }).catch(() => {});
  await search.fill(term);
  await waitForFilteredResponse;
}

/**
 * Waits for a row to appear after a write (archive/restore/create), tolerating a confirmed
 * app defect: this app's list endpoint returns ZERO matches for a text `filter` combined with
 * `isDeleted=true`, even for a record that unquestionably has isDeleted=true and matches the
 * filter text (verified directly against the API: the exact same record shows up immediately
 * in the unfiltered isDeleted=true list, but never shows up - not even after 15+ seconds - in
 * the filter+isDeleted=true combination; see report - flagged as a candidate backend query
 * defect, not hidden here). Text search alone can therefore never find a just-archived record
 * in the Archive view, no matter how long the test waits.
 *
 * Rather than accepting that as untestable, this retries the text search briefly (in case the
 * caller isn't hitting the broken combination - e.g. the active list's isDeleted=false path
 * genuinely does have a normal, short-lived debounce/lag and resolves fine), then falls back to
 * clearing the filter and relying on the *unfiltered* list, sorted by createdAt desc, where a
 * just-written synthetic candidate reliably sorts onto page 1 regardless of the filter defect.
 */
export async function waitForRowAfterWrite(page: Page, rowName: RegExp | string, term: string) {
  const row = page.getByRole('row', { name: rowName });
  if (await row.isVisible().catch(() => false)) return row;
  await searchFor(page, term);
  if (await row.isVisible().catch(() => false)) return row;
  // Confirmed app defect (see report): filter text + isDeleted=true reliably returns zero
  // matches, even for a record that unquestionably matches both - retrying the same filtered
  // search would never succeed, so don't waste time on that; go straight to the unfiltered
  // list, sorted by createdAt desc, where a just-written synthetic record reliably sorts onto
  // page 1 regardless of the filter defect.
  await searchFor(page, '');
  await expect(row).toBeVisible({ timeout: 8000 });
  return row;
}

export async function openRowMenu(page: Page, rowName: RegExp | string, timeout = 5000) {
  const row = page.getByRole('row', { name: rowName });
  await row.getByRole('button').last().click({ timeout });
}

/**
 * Opens a row's more_vert menu and clicks a menu item by name. The list appears to
 * re-render (likely a background refresh) occasionally right as the menu opens, detaching
 * the very item being clicked - this retries by reopening the menu rather than assuming a
 * one-off actionability hiccup.
 *
 * The reopen click itself (not just the subsequent menuitem click) must be inside the
 * retry/try-catch: the same background re-render can detach the row's more_vert button
 * before the menu even opens, and without a bounded per-attempt timeout that single click
 * silently consumes the whole test timeout on one attempt instead of being retried.
 */
export async function clickRowMenuItem(page: Page, rowName: RegExp | string, itemName: RegExp | string, attempts = 5) {
  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    try {
      await openRowMenu(page, rowName, 5000);
      await page.getByRole('menuitem', { name: itemName }).click({ timeout: 5000 });
      return;
    } catch (error) {
      await page.keyboard.press('Escape').catch(() => {});
      if (attempt === attempts) throw error;
      // Brief pause before reopening: a background refresh that raced the previous attempt
      // is usually done settling by now, so the reopen is less likely to race another one.
      await page.waitForTimeout(400);
    }
  }
}

export async function archiveCandidateFromActiveList(page: Page, rowName: RegExp | string) {
  await clickRowMenuItem(page, rowName, 'Add to archive');
  await page.getByRole('button', { name: 'Confirm' }).click();
}
