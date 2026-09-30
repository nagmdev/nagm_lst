import { test, expect, type Page, type BrowserContext } from '@playwright/test';

/**
 * Signing in on nagm.io and landing in the app, in a real browser.
 *
 * Two reported symptoms were one bug here: Back from inside the app returned to
 * the sign-in form, and that form's button was stuck disabled. The hand-off
 * navigated with `location.href`, which pushed a history entry and left
 * nagm.io/login underneath the app. It now uses `location.replace`.
 *
 * jsdom has no real history, so only a browser can show where Back actually
 * goes. The API (localhost:5189) and the app (localhost:5190) are stand-ins
 * the tests intercept - nothing reaches production, and no real account is
 * used. The test password is a literal for a mock that accepts anything.
 */

const API = 'http://localhost:5189/api';
const APP = 'http://localhost:5190';
const TEST_PASSWORD = 'test-only-password';

interface Calls { login: number; handoff: number; handoffBody?: Record<string, unknown> }

async function stubBackendAndApp(context: BrowserContext): Promise<Calls> {
  const calls: Calls = { login: 0, handoff: 0 };
  await context.route(`${API}/**`, async (route) => {
    const path = new URL(route.request().url()).pathname.replace(/^\/api/, '');
    if (path === '/auth/login') {
      calls.login += 1;
      return route.fulfill({ json: { accessToken: 'test.access.token', refreshToken: 'test-refresh' } });
    }
    if (path === '/auth/handoff/create') {
      calls.handoff += 1;
      calls.handoffBody = JSON.parse(route.request().postData() || '{}');
      return route.fulfill({ json: { code: 'one-time-code-123' } });
    }
    return route.fulfill({ json: {} });
  });
  // The app, standing in: just enough of a page to land on.
  await context.route(`${APP}/**`, (route) =>
    route.fulfill({ contentType: 'text/html', body: '<!doctype html><title>app</title><h1 id="app">app.nagm.io</h1>' }));
  return calls;
}

async function signIn(page: Page): Promise<void> {
  await page.locator('#email').fill('amira@example.com');
  await page.locator('#password').fill(TEST_PASSWORD);
  await Promise.all([
    page.waitForURL(`${APP}/**`, { timeout: 15_000 }),
    page.locator('button[type="submit"]').first().click(),
  ]);
}

test('signing in lands in the app with a one-time code, never a token, in the URL', async ({ page, context }) => {
  const calls = await stubBackendAndApp(context);
  await page.goto('/login');
  await signIn(page);

  const url = new URL(page.url());
  expect(url.origin).toBe(APP);
  expect(url.hash).toBe('#code=one-time-code-123');
  // The code is useless without the nonce cookie; the token itself never rides
  // in the URL, where it would land in history, logs and referrers.
  expect(page.url()).not.toContain('test.access.token');
  expect(page.url()).not.toContain('test-refresh');
  expect(calls.handoff).toBe(1);
  expect(typeof calls.handoffBody?.nonce).toBe('string');
});

test('Back from the app does not return to the sign-in form', async ({ page, context }) => {
  await stubBackendAndApp(context);
  // Arrive on the landing first, then choose to sign in - the real path.
  await page.goto('/');
  await page.goto('/login');
  await signIn(page);
  await expect(page.locator('#app')).toBeVisible();

  await page.goBack();
  await page.waitForLoadState('load');

  // location.replace swapped the sign-in page for the app in one history slot,
  // so Back goes to where the person was BEFORE choosing to sign in.
  const back = new URL(page.url());
  expect(back.pathname).not.toBe('/login');
  expect(back.pathname).toBe('/');
});

test('a sign-in the server refuses leaves the button usable', async ({ page, context }) => {
  let loginAttempts = 0;
  await context.route(`${API}/**`, (route) => {
    if (route.request().url().includes('/auth/login')) loginAttempts += 1;
    return route.fulfill({ status: 401, json: { error: 'Invalid email or password' } });
  });
  await page.goto('/login');
  await page.locator('#email').fill('amira@example.com');
  await page.locator('#password').fill(TEST_PASSWORD);
  const submit = page.locator('button[type="submit"]').first();
  await submit.click();

  // The request really went to the server - otherwise "the button is enabled"
  // is also true of a form that never submitted at all, which is exactly what
  // happened before sign-in stopped enforcing the sign-up password policy.
  await expect.poll(() => loginAttempts, { timeout: 10_000 }).toBe(1);
  // Still on sign-in, and the button re-enabled so they can try again.
  await expect(submit).toBeEnabled({ timeout: 10_000 });
  expect(new URL(page.url()).pathname).toBe('/login');
});

test('a form restored from the back-forward cache is usable again', async ({ page, context }) => {
  // A successful sign-in sets `busy` and navigates away without resetting it.
  // If the page comes back out of the back-forward cache, React does not re-run.
  // Browsers under automation do not reliably put pages in the bfcache, so
  // this drives the exact event a restore delivers - pageshow, persisted: true -
  // against the real, mounted form in a real browser.
  await context.route(`${API}/**`, (route) => route.fulfill({ status: 200, json: {} }));
  await page.goto('/login');
  const submit = page.locator('button[type="submit"]').first();
  await expect(submit).toBeEnabled();

  // Freeze the form mid-submit the way a successful sign-in leaves it: the
  // login request never answers.
  await context.unroute(`${API}/**`);
  await context.route(`${API}/**`, () => { /* never fulfilled */ });
  await page.locator('#email').fill('amira@example.com');
  await page.locator('#password').fill(TEST_PASSWORD);
  await submit.click();
  await expect(submit).toBeDisabled();

  await page.evaluate(() => {
    const e = new Event('pageshow') as PageTransitionEvent;
    Object.defineProperty(e, 'persisted', { value: true });
    window.dispatchEvent(e);
  });

  await expect(submit).toBeEnabled();
});
