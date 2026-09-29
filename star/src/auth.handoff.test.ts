/** Feature #3 — nagm.io's half of the hand-off to app.nagm.io. Network mocked. */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { api, handoffToApp, APP_ORIGIN } from './auth';

let href = '';
let replaced = false;
let cookieWrites: string[] = [];
const realLocation = window.location;

const stubPage = (url: string) => {
  const u = new URL(url);
  Object.defineProperty(window, 'location', {
    configurable: true,
    value: {
      protocol: u.protocol, hostname: u.hostname, origin: u.origin,
      set href(v: string) { href = v; replaced = false; }, get href() { return url; },
      replace(v: string) { href = v; replaced = true; },
    },
  });
};

beforeEach(() => {
  href = '';
  replaced = false;
  cookieWrites = [];
  vi.spyOn(document, 'cookie', 'set').mockImplementation((v: string) => { cookieWrites.push(v); });
});
afterEach(() => {
  Object.defineProperty(window, 'location', { configurable: true, value: realLocation });
  vi.restoreAllMocks();
});

describe('handoffToApp', () => {
  /**
   * The sign-in page must not stay behind in history.
   *
   * The hand-off used to navigate with `location.href = ...`, which PUSHES a
   * new entry and leaves nagm.io/login underneath app.nagm.io. Pressing Back
   * from inside the app then returned to the sign-in form - and returned to it
   * from the back-forward cache, frozen mid-submit with the button still
   * disabled, because the success path navigates away and never resets `busy`.
   * `replace` swaps the sign-in page for the app in the same history slot, so
   * Back goes wherever the person was before they chose to sign in.
   */
  it('replaces the sign-in page in history instead of pushing on top of it', async () => {
    stubPage('https://nagm.io/login');
    vi.spyOn(api, 'post').mockResolvedValue({ data: { code: 'abc123' } });
    await handoffToApp({ accessToken: 'acc', refreshToken: 'ref' }, true, null);
    expect(replaced).toBe(true);
    expect(href).toContain('#code=abc123');
  });

  it('binds the code to a fresh nonce cookie on .nagm.io and lands on the requested app page', async () => {
    stubPage('https://nagm.io/login');
    const post = vi.spyOn(api, 'post').mockResolvedValue({ data: { code: 'abc123' } });
    await handoffToApp({ accessToken: 'acc', refreshToken: 'ref' }, true, 'https://app.nagm.io/invite/tok?x=1');

    const cookie = cookieWrites.find((c) => c.startsWith('h_nonce='))!;
    const nonce = cookie.split(';')[0].slice('h_nonce='.length);
    expect(nonce).toMatch(/^[a-f0-9]{48}$/);
    expect(cookie).toContain('domain=nagm.io');
    expect(cookie).toContain('Secure');
    expect(cookie).toContain('SameSite=Lax');
    expect(cookie).toContain('max-age=120');

    expect(post).toHaveBeenCalledWith('/auth/handoff/create', { rememberMe: true, nonce }, { headers: { Authorization: 'Bearer acc' } });
    expect(href).toBe(`${APP_ORIGIN}/invite/tok?x=1#code=abc123`);
  });

  it('uses a new nonce every time', async () => {
    stubPage('https://nagm.io/login');
    vi.spyOn(api, 'post').mockResolvedValue({ data: { code: 'c' } });
    await handoffToApp({ accessToken: 'a', refreshToken: 'r' }, false);
    await handoffToApp({ accessToken: 'a', refreshToken: 'r' }, false);
    const nonces = cookieWrites.filter((c) => c.startsWith('h_nonce=')).map((c) => c.split(';')[0]);
    expect(new Set(nonces).size).toBe(2);
  });

  it('never follows a return link to another site', async () => {
    stubPage('https://nagm.io/login');
    vi.spyOn(api, 'post').mockResolvedValue({ data: { code: 'c' } });
    await handoffToApp({ accessToken: 'a', refreshToken: 'r' }, false, 'https://evil.example.com/phish');
    expect(href).toBe(`${APP_ORIGIN}/#code=c`);
  });

  it('URL-encodes the code', async () => {
    stubPage('https://nagm.io/login');
    vi.spyOn(api, 'post').mockResolvedValue({ data: { code: 'a b&c' } });
    await handoffToApp({ accessToken: 'a', refreshToken: 'r' }, false);
    expect(href).toBe(`${APP_ORIGIN}/#code=a%20b%26c`);
  });

  it('keeps the cookie host-only (no domain) and not Secure when run locally over http', async () => {
    stubPage('http://localhost:5180/login');
    vi.spyOn(api, 'post').mockResolvedValue({ data: { code: 'c' } });
    await handoffToApp({ accessToken: 'a', refreshToken: 'r' }, false);
    const cookie = cookieWrites.find((c) => c.startsWith('h_nonce='))!;
    expect(cookie).not.toContain('domain=');
    expect(cookie).not.toContain('Secure');
  });

  it('does not navigate when the code cannot be created', async () => {
    stubPage('https://nagm.io/login');
    vi.spyOn(api, 'post').mockRejectedValue({ response: { status: 500, data: { error: 'You are signed in, but the app could not be opened. Please try again.' } } });
    await expect(handoffToApp({ accessToken: 'a', refreshToken: 'r' }, false)).rejects.toBeTruthy();
    expect(href).toBe('');
  });
});

describe('api backend URL security and fallback', () => {
  it('rewrites requests targeted at nagm-backend to backend-yqpd', async () => {
    // Test that the interceptor rewrites both baseURL and url
    const requestHandlers = (api.interceptors.request as any).handlers;
    expect(requestHandlers.length).toBeGreaterThan(0);
    const interceptor = requestHandlers[0].fulfilled;

    const modifiedConfig = interceptor({
      baseURL: 'https://nagm-backend.vercel.app/api',
      url: '/auth/request-password-reset',
    });
    expect(modifiedConfig.baseURL).toBe('https://backend-yqpd.vercel.app/api');

    const modifiedUrlConfig = interceptor({
      url: 'https://nagm-backend.vercel.app/api/public/platform-stats',
    });
    expect(modifiedUrlConfig.url).toBe('https://backend-yqpd.vercel.app/api/public/platform-stats');
  });
});

