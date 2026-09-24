/** Feature #2 — signing in on nagm.io and handing the session to the app. API mocked. */
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom';
import AuthPage from './AuthPage';
import { setLang } from '../i18n/lang';

vi.mock('../auth', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../auth')>();
  return {
    ...actual,
    handoffToApp: vi.fn(),
    authApi: { ...actual.authApi, login: vi.fn(), searchCompanies: vi.fn() },
  };
});
import { authApi, handoffToApp, appPathFor, pendingSignInFor, forgetPendingSignIn } from '../auth';
const api = authApi as unknown as Record<string, ReturnType<typeof vi.fn>>;

let probe: { pathname: string; search: string; state: unknown } | null = null;
const Probe = () => {
  const l = useLocation();
  probe = { pathname: l.pathname, search: l.search, state: l.state };
  return <div>verify page</div>;
};
const LocationSpy = () => {
  const l = useLocation();
  probe = { pathname: l.pathname, search: l.search, state: l.state };
  return null;
};

const renderLogin = (path = '/login') =>
  render(
    <MemoryRouter initialEntries={[path]}>
      <LocationSpy />
      <Routes>
        <Route path="/login" element={<AuthPage />} />
        <Route path="/register" element={<AuthPage />} />
        <Route path="/verify" element={<Probe />} />
      </Routes>
    </MemoryRouter>,
  );
const type = (label: RegExp, value: string) => fireEvent.change(screen.getByLabelText(label), { target: { value } });
const signIn = () => fireEvent.click(screen.getByRole('button', { name: /^Sign in/ }));

beforeEach(() => {
  vi.clearAllMocks();
  forgetPendingSignIn();
  probe = null;
  api.login.mockResolvedValue({ accessToken: 'a', refreshToken: 'r', role: 'user' });
  api.searchCompanies.mockResolvedValue({ companies: [], suggestedByDomain: [] });
});

describe('signing in', () => {
  it('asks for both fields without calling the server', async () => {
    renderLogin();
    signIn();
    expect(await screen.findByText('Email is required')).toBeInTheDocument();
    expect(screen.getByText('Password is required')).toBeInTheDocument();
    expect(api.login).not.toHaveBeenCalled();
  });

  it('signs in with "keep me signed in" on by default and hands off to the app', async () => {
    renderLogin();
    type(/^Email/, '  sara@example.com ');
    type(/^Password/, 'Str0ngPass!');
    signIn();
    await waitFor(() => expect(handoffToApp).toHaveBeenCalledWith({ accessToken: 'a', refreshToken: 'r', role: 'user' }, true, null));
    expect(api.login).toHaveBeenCalledWith('sara@example.com', 'Str0ngPass!', true);
  });

  it('respects an unticked "keep me signed in"', async () => {
    renderLogin();
    type(/^Email/, 'sara@example.com');
    type(/^Password/, 'Str0ngPass!');
    fireEvent.click(screen.getByLabelText('Keep me signed in for 30 days'));
    signIn();
    await waitFor(() => expect(api.login).toHaveBeenCalledWith('sara@example.com', 'Str0ngPass!', false));
  });

  it('returns to the page the app sent the person from', async () => {
    const back = 'https://app.nagm.io/invite/tok123?x=1';
    renderLogin(`/login?email=sara%40example.com&returnTo=${encodeURIComponent(back)}`);
    expect(screen.getByLabelText(/^Email/)).toHaveValue('sara@example.com');
    type(/^Password/, 'Str0ngPass!');
    signIn();
    await waitFor(() => expect(handoffToApp).toHaveBeenCalledWith(expect.anything(), true, back));
  });

  it('sends an unverified account to the code step, keeping the password in memory and the return link', async () => {
    api.login.mockRejectedValue({ response: { status: 403, data: { error: 'Email not verified', requiresVerification: true } } });
    renderLogin('/login?returnTo=%2Fjobs%2F9');
    type(/^Email/, 'sara@example.com');
    type(/^Password/, 'Str0ngPass!');
    signIn();
    await screen.findByText('verify page');
    expect(probe?.state).toEqual({ email: 'sara@example.com', rememberMe: true, returnTo: '/jobs/9' });
    expect(JSON.stringify(probe?.state)).not.toContain('Str0ngPass!');
    expect(pendingSignInFor('sara@example.com')).toBe('Str0ngPass!');
  });

  it('shows "invalid credentials" and lets the person try again', async () => {
    api.login.mockRejectedValue({ response: { status: 401, data: { error: 'Invalid credentials' } } });
    renderLogin();
    type(/^Email/, 'sara@example.com');
    type(/^Password/, 'Wrong-pass1');
    signIn();
    expect(await screen.findByRole('alert')).toHaveTextContent('Invalid credentials');
    expect(screen.getByRole('button', { name: /^Sign in/ })).not.toBeDisabled();
  });

  it('signs in once even when Enter is pressed twice', async () => {
    let finish: (v: unknown) => void = () => {};
    api.login.mockImplementation(() => new Promise((r) => { finish = r; }));
    renderLogin();
    type(/^Email/, 'sara@example.com');
    type(/^Password/, 'Str0ngPass!');
    const form = screen.getByLabelText(/^Email/).closest('form')!;
    fireEvent.submit(form);
    fireEvent.submit(form);
    expect(api.login).toHaveBeenCalledTimes(1);
    await act(async () => finish({ accessToken: 'a', refreshToken: 'r' }));
  });

  it('keeps ?email and ?returnTo when switching to Sign Up', async () => {
    renderLogin('/login?email=sara%40example.com&returnTo=%2Finvite%2Fabc');
    fireEvent.click(screen.getByRole('tab', { name: 'Sign Up' }));
    await waitFor(() => expect(probe?.pathname).toBe('/register'));
    expect(probe?.search).toBe('?email=sara%40example.com&returnTo=%2Finvite%2Fabc');
  });
});

describe('Arabic', () => {
  it('translates a wrong password and an account lockout', async () => {
    act(() => setLang('ar'));
    api.login
      .mockRejectedValueOnce({ response: { status: 401, data: { error: 'Invalid credentials' } } })
      .mockRejectedValueOnce({ response: { status: 429, data: { error: 'Too many attempts', message: 'Too many failed sign-in attempts. Try again in 812s.', retryAfter: 812 } } });
    renderLogin();
    type(/^البريد الإلكتروني/, 'sara@example.com');
    type(/^كلمة المرور/, 'Wrong-pass1');
    fireEvent.click(screen.getByRole('button', { name: /^تسجيل الدخول/ }));
    expect(await screen.findByRole('alert')).toHaveTextContent('البريد الإلكتروني أو كلمة المرور غير صحيحة.');
    fireEvent.click(screen.getByRole('button', { name: /^تسجيل الدخول/ }));
    await waitFor(() => expect(screen.getByRole('alert')).toHaveTextContent('محاولات دخول فاشلة كثيرة. حاول مرة أخرى بعد 812 ثانية.'));
  });
});

describe('appPathFor — only paths on the app itself are followed', () => {
  it.each([
    ['https://app.nagm.io/invite/abc?x=1', '/invite/abc?x=1'],
    ['/applications/42', '/applications/42'],
    [null, '/'],
    ['', '/'],
    ['https://evil.example.com/steal', '/'],
    ['//evil.example.com/steal', '/'],
    ['javascript:alert(1)', '/'],
    ['https://app.nagm.io.evil.com/x', '/'],
  ])('%p → %p', (returnTo, path) => {
    expect(appPathFor(returnTo)).toBe(path);
  });
});
