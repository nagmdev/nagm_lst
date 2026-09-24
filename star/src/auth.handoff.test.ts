/** Feature #3 — nagm.io's half of the hand-off to app.nagm.io. Network mocked. */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { api, handoffToApp, APP_ORIGIN } from './auth';

let href = '';
let cookieWrites: string[] = [];
const realLocation = window.location;

const stubPage = (url: string) => {
  const u = new URL(url);
  Object.defineProperty(window, 'location', {
    configurable: true,
    value: { protocol: u.protocol, hostname: u.hostname, origin: u.origin, set href(v: string) { href = v; }, get href() { return url; } },
  });
};

beforeEach(() => {
  href = '';
  cookieWrites = [];
  vi.spyOn(document, 'cookie', 'set').mockImplementation((v: string) => { cookieWrites.push(v); });
});
afterEach(() => {
  Object.defineProperty(window, 'location', { configurable: true, value: realLocation });
  vi.restoreAllMocks();
});

describe('handoffToApp', () => {
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
