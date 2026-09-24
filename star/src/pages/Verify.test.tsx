/** Feature #1 — the email-verification step after sign-up. API calls mocked. */
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import Verify from './Verify';
import { setLang } from '../i18n/lang';

vi.mock('../auth', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../auth')>();
  return {
    ...actual,
    handoffToApp: vi.fn(),
    authApi: { ...actual.authApi, verifyEmail: vi.fn(), login: vi.fn(), resend: vi.fn() },
  };
});
import { authApi, handoffToApp, rememberPendingSignIn, forgetPendingSignIn, pendingSignInFor } from '../auth';
const api = authApi as unknown as Record<string, ReturnType<typeof vi.fn>>;

const renderVerify = (state: unknown = { email: 'sara@example.com', rememberMe: true }) =>
  render(
    <MemoryRouter initialEntries={[{ pathname: '/verify', state }]}>
      <Routes>
        <Route path="/verify" element={<Verify />} />
        <Route path="/login" element={<div>login page</div>} />
      </Routes>
    </MemoryRouter>,
  );
const code = () => screen.getByLabelText('Verification code');
const verify = () => fireEvent.click(screen.getByRole('button', { name: 'Verify & continue' }));

beforeEach(() => {
  vi.clearAllMocks();
  forgetPendingSignIn();
  api.verifyEmail.mockResolvedValue({ message: 'ok' });
  api.login.mockResolvedValue({ accessToken: 'a', refreshToken: 'r' });
});

describe('Verify', () => {
  it('keeps only digits and at most 6 of them', () => {
    renderVerify();
    fireEvent.change(code(), { target: { value: '12 34-5a678' } });
    expect(code()).toHaveValue('123456');
  });

  it('asks for all 6 digits without calling the server', () => {
    renderVerify();
    fireEvent.change(code(), { target: { value: '12345' } });
    verify();
    expect(screen.getByRole('alert')).toHaveTextContent('Please enter the 6-digit verification code');
    expect(code()).toHaveAttribute('aria-invalid', 'true');
    expect(api.verifyEmail).not.toHaveBeenCalled();
  });

  it('verifies, signs in with the in-memory password, hands off and forgets the password', async () => {
    rememberPendingSignIn('sara@example.com', 'Str0ngPass!');
    renderVerify();
    fireEvent.change(code(), { target: { value: '482913' } });
    verify();
    await waitFor(() => expect(handoffToApp).toHaveBeenCalledWith({ accessToken: 'a', refreshToken: 'r' }, true, undefined));
    expect(api.verifyEmail).toHaveBeenCalledWith('sara@example.com', '482913');
    expect(api.login).toHaveBeenCalledWith('sara@example.com', 'Str0ngPass!', true);
    expect(pendingSignInFor('sara@example.com')).toBeUndefined();
  });

  it('keeps the password for a retry after a wrong code', async () => {
    rememberPendingSignIn('sara@example.com', 'Str0ngPass!');
    api.verifyEmail.mockRejectedValueOnce({ response: { status: 400, data: { error: 'Invalid OTP', message: 'The verification code you entered is incorrect. Please try again or request a new code.' } } });
    renderVerify();
    fireEvent.change(code(), { target: { value: '000000' } });
    verify();
    // The sentence, not the terse "Invalid OTP" code.
    expect(await screen.findByRole('alert')).toHaveTextContent('The verification code you entered is incorrect.');
    fireEvent.change(code(), { target: { value: '482913' } });
    verify();
    await waitFor(() => expect(api.login).toHaveBeenCalledWith('sara@example.com', 'Str0ngPass!', true));
  });

  it('sends the user to sign in when there is no password in memory (e.g. after a reload)', async () => {
    renderVerify();
    fireEvent.change(code(), { target: { value: '482913' } });
    verify();
    expect(await screen.findByText('login page')).toBeInTheDocument();
    expect(api.login).not.toHaveBeenCalled();
  });

  it('does not send a second verification while the first is in flight', async () => {
    let finish: () => void = () => {};
    api.verifyEmail.mockImplementation(() => new Promise<void>((r) => { finish = r; }));
    renderVerify();
    fireEvent.change(code(), { target: { value: '482913' } });
    const form = code().closest('form')!;
    fireEvent.submit(form);
    fireEvent.submit(form);
    expect(api.verifyEmail).toHaveBeenCalledTimes(1);
    await act(async () => finish());
  });

  it('explains how to start when opened without an email', () => {
    renderVerify(null);
    expect(screen.getByRole('link', { name: 'Go to sign in' })).toHaveAttribute('href', '/login');
  });

  it('speaks Arabic, keeps the email left-to-right and translates server errors', async () => {
    act(() => setLang('ar'));
    api.verifyEmail.mockRejectedValue({ response: { status: 400, data: { error: 'OTP expired', message: 'This verification code has expired. Please request a new one.' } } });
    renderVerify();
    expect(screen.getByText('sara@example.com').closest('bdi')).toHaveAttribute('dir', 'ltr');
    fireEvent.change(screen.getByLabelText('رمز التحقق'), { target: { value: '482913' } });
    fireEvent.click(screen.getByRole('button', { name: 'تحقّق وتابع' }));
    expect(await screen.findByRole('alert')).toHaveTextContent('انتهت صلاحية رمز التحقق. اطلب رمزاً جديداً.');
  });

  it('resends a code once per tap', async () => {
    let finish: () => void = () => {};
    api.resend.mockImplementation(() => new Promise<void>((r) => { finish = r; }));
    renderVerify();
    const button = screen.getByRole('button', { name: 'Resend code' });
    fireEvent.click(button);
    fireEvent.click(button);
    expect(api.resend).toHaveBeenCalledTimes(1);
    await act(async () => finish());
    expect(await screen.findByRole('status')).toHaveTextContent('A new code is on its way.');
  });
});
