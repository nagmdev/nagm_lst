/**
 * Feature #1 — sign-up on nagm.io. Renders the real page; only the API calls
 * are mocked, so nothing leaves the test.
 */
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom';
import AuthPage from './AuthPage';
import { setLang } from '../i18n/lang';

vi.mock('../auth', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../auth')>();
  return {
    ...actual,
    handoffToApp: vi.fn(),
    authApi: {
      ...actual.authApi,
      register: vi.fn(),
      resend: vi.fn(),
      requestPasswordReset: vi.fn(),
      login: vi.fn(),
    },
  };
});
import { authApi, pendingSignInFor, forgetPendingSignIn } from '../auth';
const api = authApi as unknown as Record<string, ReturnType<typeof vi.fn>>;

let lastVerifyState: unknown = null;
const VerifyProbe = () => {
  lastVerifyState = useLocation().state;
  return <div>verify page</div>;
};

const renderSignup = (path = '/register') =>
  render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path="/register" element={<AuthPage />} />
        <Route path="/login" element={<AuthPage />} />
        <Route path="/verify" element={<VerifyProbe />} />
      </Routes>
    </MemoryRouter>,
  );

const type = (label: RegExp | string, value: string) => fireEvent.change(screen.getByLabelText(label), { target: { value } });
const submit = () => fireEvent.click(screen.getByRole('button', { name: /^Create account/ }));

const fill = (over: Partial<Record<'name' | 'email' | 'password' | 'company', string>> = {}) => {
  const v = { name: 'Sara Mansour', email: 'sara@example.com', password: 'Str0ngPass!', ...over };
  if (over.company !== undefined) type(/^Company Name/, over.company);
  type(/^Your name/, v.name);
  type(/^(Email|Business Email)/, v.email);
  type(/^Password/, v.password);
};

beforeEach(() => {
  vi.clearAllMocks();
  forgetPendingSignIn();
  lastVerifyState = null;
  api.register.mockResolvedValue({ message: 'ok', id: 'u1', email: 'sara@example.com' });
});

describe('one short form', () => {
  it('asks a job seeker for a name, an email and a password, nothing else', () => {
    renderSignup();
    const inputs = Array.from(document.querySelectorAll('form input')).map((el) => el.getAttribute('name'));
    expect(inputs).toEqual(['name', 'email', 'password']);
    expect(screen.queryByLabelText(/Confirm|Phone|Country|Job Title|LinkedIn/)).not.toBeInTheDocument();
    expect(screen.queryByRole('checkbox')).not.toBeInTheDocument();
    expect(screen.getByText(/By creating an account, you agree to the/)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Terms of Service' })).toHaveAttribute('href', '/terms');
    expect(screen.getByRole('link', { name: 'Privacy Policy' })).toHaveAttribute('href', '/privacy');
  });

  it('a company adds only its name', () => {
    renderSignup('/register?role=company');
    const inputs = Array.from(document.querySelectorAll('form input')).map((el) => el.getAttribute('name'));
    expect(inputs).toEqual(['companyName', 'name', 'email', 'password']);
    expect(screen.getByText(/commercial registration and tax card/)).toBeInTheDocument();
  });

  it('a recruiter needs no company to pick; joining a team is by invitation', () => {
    renderSignup('/register?role=recruiter');
    const inputs = Array.from(document.querySelectorAll('form input')).map((el) => el.getAttribute('name'));
    expect(inputs).toEqual(['name', 'email', 'password']);
    expect(screen.getByText(/Ask your company admin to invite you/)).toBeInTheDocument();
  });
});

describe('validation before anything is sent', () => {
  it('flags every required field on an empty submit, marks them invalid and focuses the first', async () => {
    renderSignup();
    submit();
    expect(await screen.findByText('Your name is required')).toBeInTheDocument();
    expect(screen.getByText('Email is required')).toBeInTheDocument();
    expect(screen.getByText('Password is required')).toBeInTheDocument();
    const first = screen.getByLabelText(/^Your name/);
    expect(first).toHaveAttribute('aria-invalid', 'true');
    expect(first).toHaveAttribute('aria-describedby', 'name-error');
    await waitFor(() => expect(first).toHaveFocus());
    expect(api.register).not.toHaveBeenCalled();
  });

  it('treats a whitespace-only name as missing, and caps it where the server does', async () => {
    renderSignup();
    fill({ name: '   ' });
    submit();
    expect(await screen.findByText('Your name is required')).toBeInTheDocument();
    type(/^Your name/, 'ع'.repeat(161));
    submit();
    expect(await screen.findByText('Your name must be 160 characters or less')).toBeInTheDocument();
    expect(api.register).not.toHaveBeenCalled();
  });

  it.each([
    ['a@b', 'Add a domain ending, like .com'],
    ['x@@example.com', 'Email must contain a single @'],
  ])('rejects the email %p', async (email, message) => {
    renderSignup();
    fill({ email });
    submit();
    expect(await screen.findByText(message)).toBeInTheDocument();
    expect(api.register).not.toHaveBeenCalled();
  });

  it.each([
    ['short1!', 'Password must be at least 8 characters'],
    ['password', 'Include at least 3 of: uppercase, lowercase, number, symbol'],
    [`${'Aa1!'.repeat(32)}x`, 'Password must be 128 characters or less'],
  ])('enforces the password policy (%p)', async (password, message) => {
    renderSignup();
    fill({ password });
    submit();
    expect(await screen.findByText(message)).toBeInTheDocument();
    expect(api.register).not.toHaveBeenCalled();
  });

  it('tells a company to use its own email domain before sending anything', async () => {
    renderSignup('/register?role=company');
    fill({ company: 'Acme', email: 'layla@gmail.com' });
    submit();
    expect(await screen.findByText(/Use your company email/)).toBeInTheDocument();
    expect(api.register).not.toHaveBeenCalled();
  });
});

describe('a valid sign-up', () => {
  it('sends the name, email and password, then goes to /verify without the password in history', async () => {
    renderSignup();
    fill({ name: '  Sara Mansour ' });
    submit();
    await screen.findByText('verify page');
    expect(api.register).toHaveBeenCalledWith({ role: 'candidate', name: 'Sara Mansour', email: 'sara@example.com', password: 'Str0ngPass!' });
    // returnTo is null: this visit did not come from an app link.
    expect(lastVerifyState).toEqual({ email: 'sara@example.com', rememberMe: true, returnTo: null });
    expect(JSON.stringify(lastVerifyState)).not.toContain('Str0ngPass!');
    expect(pendingSignInFor('sara@example.com')).toBe('Str0ngPass!');
  });

  it('a company sends its name too', async () => {
    renderSignup('/register?role=company');
    fill({ company: ' Tie Apps ', name: 'Mahmoud Hashim', email: 'admin@tieapps.com' });
    submit();
    await screen.findByText('verify page');
    expect(api.register).toHaveBeenCalledWith({ role: 'company', companyName: 'Tie Apps', name: 'Mahmoud Hashim', email: 'admin@tieapps.com', password: 'Str0ngPass!' });
  });

  it('a recruiter plan from the pricing page signs up and comes back to pay for it', async () => {
    renderSignup('/register?role=recruiter&plan=RECRUITER_PRO&interval=YEAR');
    fill({ name: 'Mona Saleh', email: 'mona@gmail.com' });
    submit();
    await screen.findByText('verify page');
    expect(api.register).toHaveBeenCalledWith(expect.objectContaining({ role: 'recruiter', email: 'mona@gmail.com' }));
    expect((lastVerifyState as { returnTo?: string }).returnTo).toMatch(/\/billing\?plan=RECRUITER_PRO&interval=YEAR$/);
  });

  it('an invitation: no type to choose, the invited email is fixed, and the account joins as a teammate', async () => {
    renderSignup('/register?email=karim%40acme.com&role=recruiter&returnTo=https%3A%2F%2Fapp.nagm.io%2Finvite%2Ftok123');
    expect(screen.queryByRole('radiogroup', { name: 'Account type' })).not.toBeInTheDocument();
    expect(screen.getByText(/You were invited to join a hiring team/)).toBeInTheDocument();
    expect(screen.getByLabelText(/^Email/)).toHaveAttribute('readonly');
    type(/^Your name/, 'Karim Adel');
    type(/^Password/, 'Str0ngPass!');
    submit();
    await screen.findByText('verify page');
    expect(api.register).toHaveBeenCalledWith({ role: 'recruiter', name: 'Karim Adel', email: 'karim@acme.com', password: 'Str0ngPass!' });
    expect((lastVerifyState as { returnTo?: string }).returnTo).toBe('https://app.nagm.io/invite/tok123');
  });

  it('sends one request even when submitted twice quickly', async () => {
    let finish: () => void = () => {};
    api.register.mockImplementation(() => new Promise<void>((r) => { finish = r; }));
    renderSignup();
    fill();
    const form = screen.getByRole('button', { name: /^Create account/ }).closest('form')!;
    fireEvent.submit(form);
    fireEvent.submit(form);
    expect(api.register).toHaveBeenCalledTimes(1);
    expect(screen.getByRole('button', { name: 'Creating…' })).toBeDisabled();
    await act(async () => finish());
  });

  it('shows a server refusal in the page language', async () => {
    api.register.mockRejectedValue({ response: { status: 409, data: { error: 'Email already exists' } } });
    renderSignup();
    fill();
    submit();
    expect(await screen.findByRole('alert')).toHaveTextContent('Email already exists');
    expect(screen.getByRole('button', { name: /^Create account/ })).not.toBeDisabled();
  });

  it('sends a guest applicant to set a password by emailed code instead of creating anything (SEC-16)', async () => {
    api.register.mockRejectedValue({ response: { status: 409, data: { error: 'You have already applied with this email.', guestAccount: true } } });
    api.requestPasswordReset.mockResolvedValue({ message: 'ok' });
    renderSignup();
    fill();
    submit();
    expect(await screen.findByLabelText('6-digit verification code')).toBeInTheDocument();
    expect(api.requestPasswordReset).toHaveBeenCalledWith('sara@example.com');
    expect(screen.getByText(/You already applied to a job with sara@example.com/)).toBeInTheDocument();
    expect(lastVerifyState).toBeNull();
    expect(pendingSignInFor('sara@example.com')).toBeFalsy();
  });
});

describe('Arabic / RTL', () => {
  it('shows the whole form in Arabic, right-to-left, with emails and passwords kept left-to-right', async () => {
    act(() => setLang('ar'));
    renderSignup();
    expect(document.documentElement).toHaveAttribute('dir', 'rtl');
    expect(document.documentElement).toHaveAttribute('lang', 'ar');
    expect(screen.getByRole('heading', { name: 'أنشئ حسابك' })).toBeInTheDocument();
    expect(screen.getByLabelText(/^اسمك/)).toHaveAttribute('dir', 'auto');
    expect(screen.getByLabelText(/^البريد الإلكتروني/)).toHaveAttribute('dir', 'ltr');
    expect(screen.getByLabelText(/^كلمة المرور/)).toHaveAttribute('dir', 'ltr');
    expect(screen.queryByText(/Your name|Create your account/)).not.toBeInTheDocument();
  });

  it('gives validation and server errors in Arabic', async () => {
    act(() => setLang('ar'));
    api.register.mockRejectedValue({ response: { status: 409, data: { error: 'Email already exists' } } });
    renderSignup();
    fireEvent.click(screen.getByRole('button', { name: /^إنشاء الحساب/ }));
    expect(await screen.findByText('الاسم مطلوب')).toBeInTheDocument();
    type(/^اسمك/, 'سارة منصور');
    type(/^البريد الإلكتروني/, 'sara@example.com');
    type(/^كلمة المرور/, 'Str0ngPass!');
    fireEvent.click(screen.getByRole('button', { name: /^إنشاء الحساب/ }));
    expect(await screen.findByRole('alert')).toHaveTextContent('يوجد حساب بهذا البريد الإلكتروني بالفعل.');
  });

  it('re-translates errors already on screen when the language is switched', async () => {
    renderSignup();
    submit();
    expect(await screen.findByText('Your name is required')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'التبديل إلى العربية' }));
    expect(await screen.findByText('الاسم مطلوب')).toBeInTheDocument();
    expect(screen.queryByText('Your name is required')).not.toBeInTheDocument();
  });

  it('moves between account types with the arrow keys in visual order', async () => {
    act(() => setLang('ar'));
    renderSignup();
    const user = userEvent.setup();
    const candidate = screen.getByRole('radio', { name: /مرشّح/ });
    candidate.focus();
    await user.keyboard('{ArrowLeft}'); // in RTL the next card is to the LEFT
    const recruiter = () => screen.getByRole('radio', { name: /مسؤول توظيف/ });
    await waitFor(() => expect(recruiter()).toHaveAttribute('aria-checked', 'true'), { timeout: 3000 });
    await waitFor(() => expect(recruiter()).toHaveFocus(), { timeout: 3000 });
  });
});

describe('when the code email does not go out', () => {
  it('a created account whose code was not sent says so on the code page', async () => {
    api.register.mockResolvedValue({ message: 'ok', id: 'u1', email: 'sara@example.com', emailSent: false });
    renderSignup();
    fill();
    submit();
    await screen.findByText('verify page');
    expect(lastVerifyState).toEqual(expect.objectContaining({ email: 'sara@example.com', notice: 'codeNotSent' }));
  });

  it('signing up again with an unconfirmed email sends a new code and goes to enter it (no dead end)', async () => {
    api.register.mockRejectedValue({ response: { status: 409, data: { pendingVerification: true, error: 'x' } } });
    api.resend.mockResolvedValue({ message: 'ok' });
    renderSignup();
    fill();
    submit();
    await screen.findByText('verify page');
    expect(api.resend).toHaveBeenCalledWith('sara@example.com');
    expect(lastVerifyState).toEqual(expect.objectContaining({ email: 'sara@example.com', notice: 'pendingAccount' }));
    // The password typed now may not be that account's: never used to sign in.
    expect(pendingSignInFor('sara@example.com')).toBeUndefined();
  });

  it('…and if even that code cannot be sent, the code page says so', async () => {
    api.register.mockRejectedValue({ response: { status: 409, data: { pendingVerification: true } } });
    api.resend.mockRejectedValue({ response: { status: 503, data: { code: 'EMAIL_NOT_SENT' } } });
    renderSignup();
    fill();
    submit();
    await screen.findByText('verify page');
    expect(lastVerifyState).toEqual(expect.objectContaining({ notice: 'codeNotSent' }));
  });
});
