/** Feature #4 — forgot password on nagm.io (request code → code + new password). API mocked. */
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import AuthPage from './AuthPage';
import { setLang } from '../i18n/lang';

vi.mock('../auth', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../auth')>();
  return {
    ...actual,
    handoffToApp: vi.fn(),
    authApi: {
      ...actual.authApi,
      login: vi.fn(),
      searchCompanies: vi.fn(),
      requestPasswordReset: vi.fn(),
      resetPasswordWithOtp: vi.fn(),
    },
  };
});
import { authApi } from '../auth';
const api = authApi as unknown as Record<string, ReturnType<typeof vi.fn>>;

const renderLogin = () =>
  render(
    <MemoryRouter initialEntries={['/login']}>
      <Routes><Route path="/login" element={<AuthPage />} /></Routes>
    </MemoryRouter>,
  );
const type = (label: RegExp | string, value: string) => fireEvent.change(screen.getByLabelText(label), { target: { value } });

const toCodeStep = async (email = 'sara@example.com') => {
  renderLogin();
  type(/^Email/, email);
  fireEvent.click(screen.getByRole('button', { name: 'Forgot your password?' }));
  expect(screen.getByLabelText('Your email address')).toHaveValue(email);
  fireEvent.click(screen.getByRole('button', { name: 'Send reset code' }));
  await screen.findByLabelText('6-digit verification code');
};
const fillReset = (code: string, pw: string, confirm = pw) => {
  type('6-digit verification code', code);
  type('New password', pw);
  type('Confirm new password', confirm);
};
const resetBtn = () => screen.getByRole('button', { name: 'Reset password' });

beforeEach(() => {
  vi.clearAllMocks();
  api.searchCompanies.mockResolvedValue({ companies: [], suggestedByDomain: [] });
  api.requestPasswordReset.mockResolvedValue({ message: 'If the email exists, an OTP has been sent.' });
  api.resetPasswordWithOtp.mockResolvedValue({ message: 'Password reset successfully' });
});

describe('forgot password', () => {
  it('refuses to send a code to a malformed address', async () => {
    renderLogin();
    fireEvent.click(screen.getByRole('button', { name: 'Forgot your password?' }));
    type('Your email address', 'not-an-email');
    fireEvent.click(screen.getByRole('button', { name: 'Send reset code' }));
    expect(await screen.findByRole('alert')).toHaveTextContent('Please enter a valid email address');
    expect(api.requestPasswordReset).not.toHaveBeenCalled();
  });

  it('sends the code, says where it went, and holds "resend" for 60 seconds', async () => {
    await toCodeStep();
    expect(api.requestPasswordReset).toHaveBeenCalledWith('sara@example.com');
    expect(screen.getByRole('status')).toHaveTextContent('A 6-digit reset code was sent to sara@example.com');
    expect(screen.getByRole('button', { name: /Resend in \d+s/ })).toBeDisabled();
  });

  it('keeps only digits in the code box', async () => {
    await toCodeStep();
    type('6-digit verification code', '48 29-1a3x9');
    expect(screen.getByLabelText('6-digit verification code')).toHaveValue('482913');
  });

  it.each([
    ['48291', 'N3w-password!', 'N3w-password!', 'Please enter the 6-digit verification code'],
    ['482913', 'weak', 'weak', 'Password must be at least 8 characters'],
    ['482913', 'password1', 'password1', 'Include at least 3 of: uppercase, lowercase, number, symbol'],
    ['482913', `${'Aa1!'.repeat(32)}x`, `${'Aa1!'.repeat(32)}x`, 'Password must be 128 characters or less'],
    ['482913', 'N3w-password!', 'N3w-password?', 'Passwords do not match'],
  ])('checks code %p / password %p before sending', async (code, pw, confirm, message) => {
    await toCodeStep();
    fillReset(code, pw, confirm);
    fireEvent.click(resetBtn());
    expect(await screen.findByRole('alert')).toHaveTextContent(message);
    expect(api.resetPasswordWithOtp).not.toHaveBeenCalled();
  });

  it('resets, returns to sign-in with the email filled in, and says so', async () => {
    await toCodeStep();
    fillReset('482913', 'N3w-password!');
    fireEvent.click(resetBtn());
    await waitFor(() => expect(api.resetPasswordWithOtp).toHaveBeenCalledWith('sara@example.com', '482913', 'N3w-password!'));
    expect(await screen.findByRole('status')).toHaveTextContent('Password reset successfully! Please sign in with your new password.');
    expect(screen.getByLabelText(/^Email/)).toHaveValue('sara@example.com');
    expect(screen.getByLabelText(/^Password/)).toHaveValue('');
  });

  it('resets once even when submitted twice', async () => {
    let finish: (v: unknown) => void = () => {};
    api.resetPasswordWithOtp.mockImplementation(() => new Promise((r) => { finish = r; }));
    await toCodeStep();
    fillReset('482913', 'N3w-password!');
    const form = resetBtn().closest('form')!;
    fireEvent.submit(form);
    fireEvent.submit(form);
    expect(api.resetPasswordWithOtp).toHaveBeenCalledTimes(1);
    await act(async () => finish({ message: 'ok' }));
  });

  it('shows the server\'s explanation of a wrong code and keeps the form', async () => {
    api.resetPasswordWithOtp.mockRejectedValue({ response: { status: 400, data: { error: 'Invalid or expired OTP', message: 'This code is incorrect or has expired. Check the latest email, or request a new code.' } } });
    await toCodeStep();
    fillReset('000000', 'N3w-password!');
    fireEvent.click(resetBtn());
    expect(await screen.findByRole('alert')).toHaveTextContent('This code is incorrect or has expired.');
    expect(screen.getByLabelText('6-digit verification code')).toHaveValue('000000');
  });

  it('lets the person go back and change the email', async () => {
    await toCodeStep();
    fireEvent.click(screen.getByRole('button', { name: 'Change' }));
    expect(screen.getByLabelText('Your email address')).toBeInTheDocument();
  });

  it('works in Arabic, server message included', async () => {
    act(() => setLang('ar'));
    api.resetPasswordWithOtp.mockRejectedValue({ response: { status: 400, data: { error: 'Invalid or expired OTP', message: 'This code is incorrect or has expired. Check the latest email, or request a new code.' } } });
    renderLogin();
    type(/^البريد الإلكتروني/, 'sara@example.com');
    fireEvent.click(screen.getByRole('button', { name: 'نسيت كلمة المرور؟' }));
    fireEvent.click(screen.getByRole('button', { name: 'إرسال رمز إعادة التعيين' }));
    await screen.findByLabelText('رمز التحقق (6 أرقام)');
    expect(screen.getByRole('heading', { name: 'إعادة تعيين كلمة المرور' })).toBeInTheDocument();
    type('رمز التحقق (6 أرقام)', '000000');
    type('كلمة المرور الجديدة', 'N3w-password!');
    type('تأكيد كلمة المرور الجديدة', 'N3w-password!');
    fireEvent.click(screen.getByRole('button', { name: 'إعادة تعيين كلمة المرور' }));
    expect(await screen.findByRole('alert')).toHaveTextContent('الرمز غير صحيح أو انتهت صلاحيته. تحقّق من أحدث رسالة، أو اطلب رمزاً جديداً.');
  });
});
