import { Page, Locator, expect } from '@playwright/test';

const BASE_URL = 'https://rms-dev.allweb.com.kh';

export async function login(page: Page) {
  await page.goto(`${BASE_URL}/welcome`);
  await page.getByRole('textbox', { name: 'Enter Username' }).fill(process.env.RMS_EMAIL as string);
  await page.getByRole('textbox', { name: 'Enter Password' }).fill(process.env.RMS_PASSWORD as string);
  await page.getByRole('button', { name: 'Login' }).click();
  // The Login click round-trips through Keycloak (:8070 openid-connect/auth) before landing on
  // the dashboard. Under 3 concurrent workers that redirect alone was measured at up to ~8s on
  // the shared dev server (2026-09-28), so the default 5s expect timeout failed 32 tests at this
  // line with the page still mid-redirect - not a real login failure (see report).
  await expect(page).toHaveURL(/\/admin\/dashboard/, { timeout: 20_000 });
}

export async function goToCandidateList(page: Page) {
  await page.getByRole('tree').getByRole('button', { name: 'Candidate' }).click();
  await expect(page).toHaveURL(/\/admin\/candidate/);
  await expect(page.getByRole('heading', { name: 'Manage Candidates' })).toBeVisible();
}

export async function goToInterviewSchedule(page: Page) {
  await page.getByRole('tree').getByRole('button', { name: 'Interview Schedule' }).click();
  await expect(page).toHaveURL(/\/admin\/calendar/);
  await expect(page.getByRole('heading', { name: 'Manage Interview Schedule' })).toBeVisible();
}

/**
 * The month the Interview Schedule suite's fixture interviews live in (e.g. Miss. Chhan DONG
 * 05/Aug/2026 11:25 AM, Vanndy VK 05/Aug/2026 10:40 PM). The calendar opens on the CURRENT
 * month, so specs written in August silently lost their fixtures once it rolled over - on
 * 2026-09-28 September holds 7 unrelated events and no "Chhan". Same class of bug as
 * ADVANCE_REPORT_SEED_WEEK below.
 */
export const CALENDAR_SEED_MONTH = new Date(2026, 7, 1);

/** Moves the Interview Schedule calendar to the month containing `target` via prev/next. */
export async function goToCalendarMonth(page: Page, target: Date) {
  const title = page.locator('.fc-toolbar-title');
  const wanted = target.toLocaleString('en-US', { month: 'long', year: 'numeric' });
  for (let i = 0; i < 36; i += 1) {
    const current = (await title.innerText()).trim();
    if (current === wanted) break;
    const currentDate = new Date(`1 ${current}`);
    const direction = currentDate > target ? 'prev' : 'next';
    await page.locator(`button[aria-label="${direction}"]`).click();
    await expect(title).not.toHaveText(current);
  }
  await expect(title).toHaveText(wanted);
  // Events for the new month load asynchronously after the title changes
  await expect(page.locator('.custom-calendar-event').first()).toBeVisible();
}

export async function goToAdvanceReport(page: Page) {
  await page.getByRole('tree').getByRole('button', { name: 'Advance Report' }).click();
  await expect(page).toHaveURL(/\/admin\/candidate\/advance-report/);
  await expect(page.getByRole('heading', { name: 'Manage Candidates Advance Report' })).toBeVisible();
}

/**
 * The week the Advance Report suite's fixture data lives in. The report's date range defaults to
 * the CURRENT Mon-Fri week, so specs that relied on that default (written the week of 24 Aug
 * 2026, when "Miss. Vannyda PICH" was the one seeded Following-Up row in range) silently broke
 * once the calendar moved on - on 2026-09-28 the default week 28 Sep - 2 Oct is empty ("Total:
 * 0"). Same class of bug as the hardcoded calendar date fixed in pickFutureCalendarDate(). Specs
 * that assert on seeded rows pin this window explicitly instead of trusting "today".
 */
export const ADVANCE_REPORT_SEED_WEEK = { start: new Date(2026, 7, 24), end: new Date(2026, 7, 28) };

/**
 * Sets the Advance Report date range via the pill's inline calendar (month label
 * `label.header-label` e.g. "AUG 2026", day cells named e.g. "August 24, 2026"), clicks
 * Generate, and waits for the banner to show the new window.
 */
export async function setAdvanceReportDateRange(page: Page, range: { start: Date; end: Date }) {
  const { start, end } = range;
  await page.getByText(/[A-Za-z]{3}\s+\d{1,2}.+[A-Za-z]{3}\s+\d{1,2}/).first().click();

  // Two label.header-label elements render in the panel ("Calender" and e.g. "SEP 2026") -
  // match the month one by its text shape.
  const monthLabel = page.locator('.cdk-overlay-pane label.header-label').filter({ hasText: /^\s*[A-Z]{3} \d{4}\s*$/ });
  const target = `${start.toLocaleString('en-US', { month: 'short' }).toUpperCase()} ${start.getFullYear()}`;
  const monthIndex = (label: string) => {
    const [mon, year] = label.trim().split(' ');
    return Number(year) * 12 + new Date(`${mon} 1, 2000`).getMonth();
  };
  // Calendar chevrons are mat-icons, not buttons - dispatchEvent for the same reason as
  // date-range-no-results.spec.ts (the calendar's hover layer intercepts plain clicks).
  for (let i = 0; i < 36; i += 1) {
    const current = (await monthLabel.innerText()).trim();
    if (current === target) break;
    const direction = monthIndex(current) > monthIndex(target) ? 'keyboard_arrow_left' : 'keyboard_arrow_right';
    await page.locator('mat-icon.arrow', { hasText: direction }).dispatchEvent('click');
    await expect(monthLabel).not.toHaveText(current);
  }

  const cellName = (d: Date) => `${d.toLocaleString('en-US', { month: 'long' })} ${d.getDate()}, ${d.getFullYear()}`;
  await page.getByRole('gridcell', { name: cellName(start), exact: true }).click();
  await page.getByRole('gridcell', { name: cellName(end), exact: true }).click();
  await page.getByRole('button', { name: 'Generate' }).click();

  const bannerDate = (d: Date) => `${d.getDate()} ${d.toLocaleString('en-US', { month: 'short' })} ${d.getFullYear()}`;
  await expect(page.getByText(`(${bannerDate(start)} - ${bannerDate(end)})`).first()).toBeVisible();
  await page.locator('.cdk-overlay-backdrop').first().waitFor({ state: 'detached', timeout: 5000 }).catch(() => {});
}

/**
 * Fills the calendar toolbar's own search box (distinct from the unrelated global topbar
 * search) and waits for the resulting debounced filter request to resolve. Mirrors
 * searchFor()'s "fill + waitForResponse(filter=...)" shape, but targets the interview
 * endpoint (`/rms-service/api/v1/interview?...&filter=`) that the calendar's search hits,
 * not the candidate-list endpoint searchFor() waits on.
 */
export async function searchCalendar(page: Page, term: string) {
  const search = page.getByPlaceholder('Search interviews, candidates...');
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
  // The DOB calendar opens defaulted to (current month/year minus 18 years), not a fixed
  // month - a previous version of this hardcoded "August 1," (valid when this was first
  // automated in August), which silently broke once the current month rolled to September
  // (calendar then defaults to "SEP <year>", so no "August 1," cell exists without navigating
  // - see report). Matching day "1" of whatever month the calendar actually opens on avoids
  // re-breaking every time the month changes, since any valid past DOB works here.
  await page.getByRole('gridcell', { name: /^\w+ 1,/ }).first().click();
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
  // Wait for the create call itself before navigating anywhere. Healed 2026-09-28: with the
  // server slow, the POST took longer than ensureOnCandidateList's 8s redirect wait, whose
  // fallback page.goto() then ABORTED the in-flight request (trace: POST /api/v1/candidate,
  // status -1) - the candidate was never created, and the calling test failed later with a
  // confusing "row not found". Failing here, with the status, makes that visible.
  const createResponse = page.waitForResponse(
    (res) => res.request().method() === 'POST' && new URL(res.url()).pathname.endsWith('/api/v1/candidate'),
    { timeout: 30_000 },
  );
  await page.getByRole('button', { name: 'Finish' }).click();
  const created = await createResponse;
  expect(created.ok(), `create candidate returned HTTP ${created.status()}`).toBe(true);
  // Known defect (see report): submitting sometimes triggers a blocked Keycloak silent-refresh
  // that reloads the SPA and strands it on an unrelated cached page instead of the candidate
  // list, so navigate there explicitly rather than trusting the app's own post-submit redirect.
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
  // A full page.goto re-bootstraps the SPA, including the same Keycloak SSO round trip that
  // login() allows 20s for - the default 5s failed A10/C1 here on 2026-09-28 with the page
  // still blank (see report).
  await expect(page.getByRole('heading', { name: 'Manage Candidates' })).toBeVisible({ timeout: 20_000 });
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
 * Opens a "Open calendar" date/time field and picks a date `daysAhead` days from now,
 * confirming via the "done" button. A previous version of these tests hardcoded a fixed
 * calendar day (e.g. "August 20") - that was a valid future date when first written but
 * silently became a disabled *past* date as real time passed, hanging every click on it
 * (see report). Computing the target date relative to "now", and returning it, lets every
 * caller build matching assertions/lookups without re-deriving the date itself.
 */
// Kept small (rather than e.g. 14) so the picked date almost always stays within the
// currently-displayed month - callers that then look for the event on the Interview
// Schedule calendar (a separate widget from this date picker) only check the month
// that's already on screen and don't navigate it, so a cross-month date would hide there.
export async function pickFutureCalendarDate(page: Page, daysAhead = 3): Promise<Date> {
  await page.getByRole('button', { name: 'Open calendar' }).click();

  const target = new Date();
  target.setDate(target.getDate() + daysAhead);
  const monthAbbrev = target.toLocaleString('en-US', { month: 'short' }).toUpperCase();
  const monthFull = target.toLocaleString('en-US', { month: 'long' });
  const day = target.getDate();
  const year = target.getFullYear();

  // The calendar opens on the current month - step forward via "Next month" until its
  // header shows the target month/year (a no-op when daysAhead keeps it in the same month).
  const periodButton = page.locator('.mat-calendar-period-button');
  const nextMonthButton = page.getByRole('button', { name: 'Next month' });
  for (let i = 0; i < 12; i += 1) {
    const label = (await periodButton.innerText()).toUpperCase();
    if (label.includes(monthAbbrev) && label.includes(String(year))) break;
    await nextMonthButton.click();
  }

  await page.getByRole('gridcell', { name: `${monthFull} ${day},` }).click();
  await page.getByRole('button').filter({ hasText: 'done' }).click();
  return target;
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
      // If the page/context/browser is already gone, retrying (or even pressing Escape)
      // can't help and would throw its own "Target closed" error that masks the real one.
      if (page.isClosed() || attempt === attempts) throw error;
      await page.keyboard.press('Escape').catch(() => {});
      // Brief pause before reopening: a background refresh that raced the previous attempt
      // is usually done settling by now, so the reopen is less likely to race another one.
      await page.waitForTimeout(400);
    }
  }
}

/**
 * Archives a candidate via its own row menu, then VERIFIES the archive actually took effect
 * before returning, retrying the whole click+confirm sequence if not.
 *
 * A previous version of this helper fired the click+confirm sequence once and trusted it (no
 * verification) - under this suite's own heavier/concurrent runs, that reliably left synthetic
 * candidates un-archived on the shared live list even when the calling test itself reported a
 * pass (the click sequence can resolve without the archive having actually completed server-side,
 * likely a UI/backend race under load - see report). Every caller of this helper implicitly
 * relies on cleanup actually happening, so the verification belongs here once, not duplicated
 * per test. On a genuine failure to verify after retrying, this throws rather than silently
 * leaving the record un-archived and reporting success.
 */
export async function archiveCandidateFromActiveList(page: Page, rowName: RegExp | string, attempts = 3) {
  // The active list doesn't reliably self-refresh its rendered rows right after the Confirm
  // click (the existing row-menu-archive.spec.ts flow re-issues its own search afterward for the
  // same reason) - checking visibility without first re-querying the same filter term can read a
  // stale DOM and falsely conclude the archive didn't take effect. Re-searching by the row's own
  // term (its regex source, or the string itself) forces a fresh query before verifying.
  //
  // Healed 2026-09-28: re-searching must CLEAR the box first. Filling the search box with the
  // term it already holds fires no new request (no value change), so the old check re-read the
  // same stale rows every attempt and "retried" the archive on an already-archived record -
  // failing E2/A9/CAL05-3 cleanup with the record in fact archived. The list also lags a few
  // seconds after a write (confirmed live: a just-restored record searched as Total: 0, then
  // Total: 1 seconds later), so poll for the row to disappear before retrying the click.
  const searchTerm = typeof rowName === 'string' ? rowName : rowName.source;
  const row = page.getByRole('row', { name: rowName });
  const searchBox = page.locator('app-aw-layout-list').getByRole('textbox', { name: 'Search' });
  const goneAfterFreshSearch = async () => {
    if (await searchBox.inputValue()) await searchFor(page, '');
    await searchFor(page, searchTerm);
    return !(await row.isVisible().catch(() => false));
  };
  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    await clickRowMenuItem(page, rowName, 'Add to archive');
    await page.getByRole('button', { name: 'Confirm' }).click();
    const gone = await expect.poll(goneAfterFreshSearch, { timeout: 15_000, intervals: [1000, 2000, 3000] })
      .toBe(true).then(() => true, () => false);
    if (gone) return;
  }
  throw new Error(`archiveCandidateFromActiveList: row still visible in the active list after ${attempts} attempts`);
}

/**
 * Navigates to the Job Description list via the sidebar (Setting -> Job), matching the
 * confirmed pattern in tests/navigation/nav-setting.spec.ts: "Toggle Setting" expands the
 * submenu WITHOUT navigating (URL stays on the current page), then "Job" performs the actual
 * navigation. A raw page.goto() straight to /admin/setting/job is deliberately avoided here -
 * per the exploratory results, a full page reload on this protected route intermittently
 * re-triggers a Keycloak silent-SSO check that this client isn't configured for, bouncing to
 * /welcome?error=unauthorized_client... even with a valid session.
 */
/**
 * Returns the job description list's row count once the real rows have rendered. The table
 * briefly shows a single placeholder <tr> right after navigation, so a bare `.count()` can read
 * 1 - wait for the rendered rows to match the "Total: N" footer first (single-page dataset).
 * Specs compare against this instead of a hardcoded count: the shared server's real rows drift
 * (11 at planning, 10 on 2026-09-28).
 */
export async function readJobListRowCount(page: Page): Promise<number> {
  const totalText = page.getByText(/^Total:\s*\d+$/);
  await expect(totalText).toBeVisible();
  const rows = page.locator('table tbody tr');
  await expect.poll(async () => (await rows.count()) === Number((await totalText.innerText()).replace(/\D/g, '')))
    .toBe(true);
  return rows.count();
}

export async function goToJobDescriptions(page: Page) {
  const sidebarTree = page.getByRole('tree');
  const jobButton = sidebarTree.getByRole('button', { name: 'Job' });
  // "Toggle Setting" is a real open/close TOGGLE, not an idempotent "expand" - confirmed live,
  // the sidebar is a persistent component that survives in-app navigation (it isn't re-created
  // per route), so its expanded/collapsed state carries over from any earlier call. Calling this
  // helper a second time in the same page session (e.g. navigating away and back, as
  // breadcrumb.spec.ts does) would otherwise click Toggle on an already-expanded submenu,
  // collapsing it, then hang waiting for the now-hidden "Job" item. Only toggle when needed.
  if (!(await jobButton.isVisible().catch(() => false))) {
    await sidebarTree.getByRole('button', { name: 'Toggle Setting' }).click();
  }
  await jobButton.click();
  await expect(page).toHaveURL(/\/admin\/setting\/job$/);
  await expect(page.getByRole('heading', { name: 'Manage Job Description' })).toBeVisible();
}

/**
 * Fills the Job Description list's own search box and waits for the resulting debounced
 * filter request to resolve. There are TWO `input[placeholder="Search"]` elements on this
 * page (the sidebar tree's own filter box, plus this list's own box) - both live inside an
 * `app-aw-search-box` component, and the sidebar one additionally carries a `search-sidebar`
 * class, which is the only reliable way to exclude it (ancestor-scoping by `app-aw-search-box`
 * alone still matches both - see exploratory results insight #2).
 */
export async function searchJobDescriptions(page: Page, term: string) {
  const search = page.locator('app-aw-search-box:not(.search-sidebar) input[placeholder="Search"]');
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
 * Locates a job description row by an EXACT match on its Title column (2nd <td>), rather than
 * the row's full accessible name (which concatenates every column's text). This matters here
 * specifically because the real "QA Automation" row's title is a literal substring of this
 * module's own synthetic-row naming convention ("QA Automation Job Test {suffix} {ts}") - a
 * bare `page.getByRole('row', { name: 'QA Automation' })` would ambiguously match both if a
 * synthetic row happens to exist on the shared live list at the same moment (e.g. another spec
 * file's write-cycle test running concurrently), so every job-management spec that needs a
 * specific row (real or synthetic) should go through this helper instead.
 */
export function getJobRowByExactTitle(page: Page, title: string): Locator {
  const escaped = title.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  // Two independent bugs were compounding here (confirmed live against
  // https://rms-dev.allweb.com.kh/admin/setting/job), NOT a shifted/hidden column - td:nth-
  // child(2) is in fact the real Title column (No./Title/Description/Status/Created At/Action):
  //
  // 1. The `has` locator below must be a RELATIVE selector. A locator built as
  //    `page.locator('table tbody tr td:nth-child(2)')` (repeating the full ancestor chain)
  //    can never match as a descendant of a candidate `<tr>` - a `<tr>` cannot contain a
  //    nested `<table><tbody><tr>`, so `.filter({ has: <that locator> })` silently matches
  //    ZERO rows, always, regardless of the text condition. It must be scoped relative to the
  //    row instead (`td:nth-child(2)`, no repeated ancestor prefix).
  // 2. The cell's actual markup is `<td><div class="row-content"> {title} </div></td>` - the
  //    row-content div pads the text with a leading/trailing space, and Playwright's `hasText`
  //    regex matching does not trim that before testing, so a plain `^title$` anchor never
  //    matched either. Tolerate that whitespace explicitly.
  const titleCell = page.locator('td:nth-child(2)').filter({ hasText: new RegExp(`^\\s*${escaped}\\s*$`) });
  return page.locator('table tbody tr').filter({ has: titleCell });
}

/**
 * Opens a job description row's kebab (more_vert / "More") menu. Takes an already-scoped row
 * Locator (see getJobRowByExactTitle) rather than a row-name string, so callers never risk the
 * accessible-name ambiguity described above.
 */
export async function openJobRowMenu(row: Locator, timeout = 5000) {
  await row.locator('button[mattooltip="More"]').click({ timeout });
}

/**
 * Opens a row's kebab menu and clicks a menu item by name, retrying (by reopening the menu, not
 * just re-clicking the stale item) against the same kind of intermittent DOM-detach/background-
 * refresh flakiness already documented for clickRowMenuItem() on the candidate list (see
 * exploratory results insight #8).
 *
 * Both "Modify" and "Delete" menu items render an `<img alt="delete icon">` for their icon, so
 * `itemName: 'Delete'` alone is ambiguous (its accessible name substring-matches "delete icon
 * Modify" too, via the icon's own alt text) - pass the full accessible name
 * ('delete icon Delete') to disambiguate.
 */
export async function clickJobRowMenuItem(row: Locator, itemName: RegExp | string, attempts = 5) {
  const page = row.page();
  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    try {
      await openJobRowMenu(row, 5000);
      await page.getByRole('menuitem', { name: itemName }).click({ timeout: 5000 });
      return;
    } catch (error) {
      if (page.isClosed() || attempt === attempts) throw error;
      await page.keyboard.press('Escape').catch(() => {});
      await page.waitForTimeout(400);
    }
  }
}

/**
 * Creates a synthetic job description via the confirmed "+ Add" entry point
 * (/admin/setting/job/create) and returns its unique title. Must be called while already on
 * the Job Description list.
 *
 * The create form's `File *` field is required (Save silently no-ops without one, per the
 * exploratory results) - the repo's existing CV fixture is reused here purely as a generic
 * attachment, the same one candidate-helpers' own CV-upload flow uses.
 *
 * The Role field is `input[formcontrolname="title"]` - NOT `getByRole('textbox').first()`,
 * which on this form matches the sidebar's own filter box instead (both are `role=textbox`,
 * and the sidebar one sits first in the DOM) and produces a misleading "Job title required."
 * error (see exploratory results insight #1).
 */
export async function createSyntheticJobDescription(page: Page, opts: { titleSuffix: string }): Promise<string> {
  const title = `QA Automation Job Test ${opts.titleSuffix} ${Date.now()}`;

  await page.getByRole('button', { name: 'Add' }).click();
  await expect(page.getByRole('heading', { name: 'Manage Jobs' })).toBeVisible();
  await page.locator('input[formcontrolname="title"]').fill(title);

  const [fileChooser] = await Promise.all([
    page.waitForEvent('filechooser'),
    page.getByRole('button', { name: 'Browse' }).click(),
  ]);
  // Clicking Save immediately after setFiles() races the file's own background upload POST
  // (/rms-service/api/v1/jobDescription/file/upload) - confirmed live: Save clicked before
  // that request resolves silently no-ops (no toast, no error, no navigation - the form just
  // deletes the orphaned temporary upload moments later) rather than surfacing any inline
  // validation error, so there's nothing to detect after the fact. Waiting for the upload
  // response first (same pattern as createSyntheticCandidate's CV upload) avoids the race.
  await Promise.all([
    page.waitForResponse((res) => res.url().includes('/jobDescription/file/upload') && res.ok()),
    fileChooser.setFiles('tests/fixtures/qa-automation-test-cv.pdf'),
  ]);

  await page.getByRole('button', { name: 'Save' }).click();
  // A generous timeout: this shared remote dev server occasionally takes longer than the
  // default 5s on a full create round trip (see other documented cases in this file).
  await expect(page).toHaveURL(/\/admin\/setting\/job$/, { timeout: 10000 });

  const row = getJobRowByExactTitle(page, title);
  await expect(row).toBeVisible({ timeout: 8000 });
  return title;
}

/**
 * Deletes a job description row via its own kebab menu -> Delete -> Confirm. Only ever call
 * this against a synthetic row created by the test itself (see getJobRowByExactTitle /
 * createSyntheticJobDescription) - never against one of the 11 real pre-existing rows, which
 * must only ever be cancelled out of (see delete-confirmation-dialog.spec.ts).
 */
export async function deleteJobDescriptionRow(row: Locator) {
  const page = row.page();
  await clickJobRowMenuItem(row, 'delete icon Delete');
  const dialog = page.getByRole('dialog');
  await expect(dialog.getByText('Remove Job Description')).toBeVisible();
  await dialog.getByRole('button', { name: 'Confirm' }).click();
  await expect(dialog).not.toBeVisible();
}

/**
 * Navigates to the Candidate list, searches for a specific candidate, and opens their
 * Candidate Details page via the eye ("visibility") icon - confirmed live to be the row's
 * FIRST action-column button, distinct from the LAST button (more_vert, the row's own separate
 * menu - see openRowMenu/clickRowMenuItem). Per the exploratory results, this page must always
 * be reached this way (in-app click), never a direct page.goto() to the detail URL - a cold/
 * direct load was confirmed to sometimes render an empty breadcrumb (see
 * breadcrumb-direct-navigation-caveat.spec.ts, which deliberately tests that caveat on its own).
 */
export async function goToCandidateDetails(page: Page, rowName: RegExp | string, searchTerm?: string) {
  await goToCandidateList(page);
  await searchFor(page, searchTerm ?? (typeof rowName === 'string' ? rowName : rowName.source));
  const row = page.getByRole('row', { name: rowName });
  await expect(row).toBeVisible();
  // Same root cause as clickRowMenuItem (see its docstring): a background list refresh can
  // detach this row's own eye/view button right as it's clicked. Retry the click itself with
  // a bounded per-attempt timeout rather than let one detach burn the whole test timeout.
  let lastError: unknown;
  for (let attempt = 1; attempt <= 3; attempt += 1) {
    try {
      await row.getByRole('button').first().click({ timeout: 5000 });
      lastError = undefined;
      break;
    } catch (error) {
      lastError = error;
      if (page.isClosed()) throw error;
      await page.waitForTimeout(400);
    }
  }
  if (lastError) throw lastError;
  await expect(page).toHaveURL(/\/admin\/candidate\/candidateDetail\/\d+/);
  await expect(page.locator('h2.profile-header-name')).toBeVisible();
}

/**
 * Reads every label/value pair from the Candidate Details page's profile card, scoped via the
 * nearest card-like ancestor of the "Gender" label. This page can also render an Interview
 * score card and (for some candidates) an Experience card using the exact same
 * `.text-label`/`.text-value` markup convention as the profile card - an unscoped, page-wide
 * query would silently pick up those unrelated fields too (see exploratory results insight),
 * so every profile-card assertion should go through this helper rather than querying
 * `.text-label`/`.text-value` directly against the whole page.
 */
export async function getProfileCardFields(page: Page): Promise<Record<string, string>> {
  // Confirmed live: the profile card has NO ancestor whose class contains "card" at all (the
  // xpath `ancestor::*[contains(@class,"card")]` this used to use silently resolves to zero
  // elements, so every field read through it comes back empty) - its real, unique wrapper is
  // `.information-detail` (a single match on this page, containing exactly the 11 profile
  // fields and none of the education/interview cards' own `.text-label`/`.text-value` pairs).
  const profileCard = page.locator('.information-detail');
  // Wait for the card to actually be populated before reading it - callers that read this
  // right after an in-app navigation (e.g. back-navigation from the Edit page) can otherwise
  // race the page's own re-render and read back an empty card (see report).
  await expect(profileCard.locator('.text-label').first()).toBeVisible({ timeout: 10000 });
  const labels = await profileCard.locator('.text-label').allTextContents();
  const values = await profileCard.locator('.text-value').allTextContents();
  const fields: Record<string, string> = {};
  labels.forEach((label, i) => {
    fields[label.trim()] = (values[i] ?? '').trim();
  });
  return fields;
}

/**
 * Scrolls to and returns the Candidate Details page's embedded elFinder file manager, scoped
 * to `.elfinder` so toolbar/status-bar locators built from it never collide with anything else
 * on the page.
 */
export async function getFileManager(page: Page): Promise<Locator> {
  const fileManager = page.locator('.elfinder');
  await fileManager.scrollIntoViewIfNeeded();
  return fileManager;
}

/**
 * Reads the file manager's status-bar item count from its `title` attribute (e.g.
 * "Items: 2,&nbsp;Sum: 517 KB") rather than its rendered text, which is split across child
 * spans and unreliable to read directly (see exploratory results insight).
 */
export async function getFileManagerItemCount(fileManager: Locator): Promise<number> {
  // Two elements share the `.elfinder-stat-size` class - the outer status-bar `<div>` that
  // carries the `title="Items: {n}, Sum: {size}"` attribute this reads, and a nested
  // `<span class="elfinder-stat-size elfinder-stat-size-recursive">Sum: {size}</span>` (no
  // "Items:" prefix, no title attribute) that only appears once a folder is selected.
  // Exclude the recursive span so this always resolves to the one real title-bearing div.
  const stat = fileManager.locator('.elfinder-stat-size:not(.elfinder-stat-size-recursive)');
  // elFinder fills this title in only after its folder listing loads - under concurrent load a
  // bare getAttribute() read it before then and returned NaN (CAND04-2, 2026-09-28).
  await expect(stat).toHaveAttribute('title', /Items:\s*\d+/, { timeout: 15_000 });
  const title = await stat.getAttribute('title');
  const match = title?.match(/Items:\s*(\d+)/);
  return match ? Number(match[1]) : NaN;
}
