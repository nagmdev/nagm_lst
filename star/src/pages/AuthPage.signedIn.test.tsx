/** Sheet #99 — "stay signed in for 30 days": nagm.io/login sends an already signed-in visitor back into the app. */
import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import AuthPage from './AuthPage';
import { signedInAppUrl, SITE_SESSION_COOKIE, APP_ORIGIN } from '../auth';

const realLocation = window.location;
const replace = vi.fn();
const mark = () => { document.cookie = `${SITE_SESSION_COOKIE}=1; path=/`; };
const unmark = () => { document.cookie = `${SITE_SESSION_COOKIE}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`; };
const q = (s: string) => new URLSearchParams(s);

const renderAt = (path: string) =>
  render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path="/login" element={<AuthPage />} />
        <Route path="/register" element={<AuthPage />} />
      </Routes>
    </MemoryRouter>,
  );

beforeEach(() => {
  unmark();
  sessionStorage.clear();
  replace.mockReset();
  Object.defineProperty(window, 'location', { configurable: true, value: { ...realLocation, replace } });
});
afterEach(() => {
  Object.defineProperty(window, 'location', { configurable: true, value: realLocation });
  unmark();
});

describe('signedInAppUrl', () => {
  it('no mark → show the form', () => {
    expect(signedInAppUrl(q(''))).toBeNull();
  });

  it('marked → the app, on the page the app asked to come back to', () => {
    mark();
    expect(signedInAppUrl(q('returnTo=' + encodeURIComponent(`${APP_ORIGIN}/applications/42?tab=cv`)))).toBe(`${APP_ORIGIN}/applications/42?tab=cv`);
  });

  it('marked, no returnTo → the app home; a pricing plan → its billing page', () => {
    mark();
    expect(signedInAppUrl(q(''), 1_000_000)).toBe(`${APP_ORIGIN}/`);
    sessionStorage.clear();
    expect(signedInAppUrl(q('plan=CANDIDATE_PRO&interval=YEAR'))).toBe(`${APP_ORIGIN}/billing?plan=CANDIDATE_PRO&interval=YEAR`);
  });

  it('never follows a returnTo to another site', () => {
    mark();
    expect(signedInAppUrl(q('returnTo=' + encodeURIComponent('https://evil.example/steal')))).toBe(`${APP_ORIGIN}/`);
  });

  it('signing in to another account (add_account / an invitation naming the address) still shows the form', () => {
    mark();
    expect(signedInAppUrl(q('add_account=true'))).toBeNull();
    expect(signedInAppUrl(q('email=new%40x.io&returnTo=' + encodeURIComponent(`${APP_ORIGIN}/invite/t`)))).toBeNull();
  });

  it('a second visit within a minute shows the form (the mark outlived the session — no redirect loop)', () => {
    mark();
    expect(signedInAppUrl(q(''), 1_000_000)).not.toBeNull();
    expect(signedInAppUrl(q(''), 1_030_000)).toBeNull();
    expect(signedInAppUrl(q(''), 1_061_000)).not.toBeNull();
  });

  it('a look-alike cookie name is not the mark', () => {
    document.cookie = `x${SITE_SESSION_COOKIE}=1; path=/`;
    expect(signedInAppUrl(q(''))).toBeNull();
    document.cookie = `x${SITE_SESSION_COOKIE}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
  });
});

describe('the sign-in page', () => {
  it('a signed-in visitor goes straight into the app', () => {
    mark();
    renderAt('/login?returnTo=' + encodeURIComponent(`${APP_ORIGIN}/manage-jobs`));
    expect(replace).toHaveBeenCalledWith(`${APP_ORIGIN}/manage-jobs`);
  });

  it('a signed-out visitor sees the form', () => {
    renderAt('/login');
    expect(replace).not.toHaveBeenCalled();
    expect(screen.getByRole('button', { name: /^Sign in/ })).toBeInTheDocument();
  });

  it('the sign-up page is never redirected', () => {
    mark();
    renderAt('/register');
    expect(replace).not.toHaveBeenCalled();
  });
});
