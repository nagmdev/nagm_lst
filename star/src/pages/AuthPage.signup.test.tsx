/**
 * Feature #1 — sign-up on nagm.io. Renders the real page; only the API calls
 * are mocked, so nothing leaves the test.
 */
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor, act, within } from '@testing-library/react';
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
      searchCompanies: vi.fn(),
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
const submit = () => fireEvent.click(screen.getByRole('button', { name: /Create .* Account/ }));
const acceptTerms = () => fireEvent.click(screen.getByLabelText(/I accept the/));

const fillCandidate = (over: Partial<Record<string, string>> = {}) => {
  const v = { first: 'Sara', last: 'Mansour', email: 'sara@example.com', password: 'Str0ngPass!', confirm: 'Str0ngPass!', ...over };
  type(/^First Name/, v.first);
  type(/^Last Name/, v.last);
  type(/^Email/, v.email);
  if (over.phone !== undefined) type(/^Phone Number/, over.phone);
  type(/^Password/, v.password);
  type(/^Confirm Password/, v.confirm);
};

beforeEach(() => {
  vi.clearAllMocks();
  forgetPendingSignIn();
  lastVerifyState = null;
  api.register.mockResolvedValue({ message: 'ok', id: 'u1', email: 'sara@example.com' });
  api.searchCompanies.mockResolvedValue({ companies: [], suggestedByDomain: [] });
});

describe('validation before anything is sent', () => {
  it('flags every required field on an empty submit, marks them invalid and focuses the first', async () => {
    renderSignup();
    submit();
    expect(await screen.findByText('First name is required')).toBeInTheDocument();
    expect(screen.getByText('Last name is required')).toBeInTheDocument();
    expect(screen.getByText('Email is required')).toBeInTheDocument();
    expect(screen.getByText('Password is required')).toBeInTheDocument();
    expect(screen.getByRole('alert')).toHaveTextContent('Please accept the Terms of Service to continue.');
    const first = screen.getByLabelText(/^First Name/);
    expect(first).toHaveAttribute('aria-invalid', 'true');
    expect(first).toHaveAttribute('aria-describedby', 'firstName-error');
    await waitFor(() => expect(first).toHaveFocus());
    expect(api.register).not.toHaveBeenCalled();
  });

  it('treats whitespace-only names as missing', async () => {
    renderSignup();
    fillCandidate({ first: '   ', last: '  ' });
    acceptTerms();
    submit();
    expect(await screen.findByText('First name is required')).toBeInTheDocument();
    expect(screen.getByText('Last name is required')).toBeInTheDocument();
    expect(api.register).not.toHaveBeenCalled();
  });

  it('refuses a name longer than the server allows', async () => {
    renderSignup();
    fillCandidate({ first: 'ع'.repeat(81) });
    acceptTerms();
    submit();
    expect(await screen.findByText('First Name must be 80 characters or less')).toBeInTheDocument();
    expect(api.register).not.toHaveBeenCalled();
  });

  it('checks a typed phone number instead of letting the server reject it', async () => {
    renderSignup();
    fillCandidate({ phone: '123' });
    acceptTerms();
    submit();
    expect(await screen.findByText(/Enter a valid Egypt mobile number/)).toBeInTheDocument();
    expect(api.register).not.toHaveBeenCalled();
  });

  it.each([
    ['a@b', 'Add a domain ending, like .com'],
    ['x@@example.com', 'Email must contain a single @'],
  ])('rejects the email %p', async (email, message) => {
    renderSignup();
    fillCandidate({ email });
    acceptTerms();
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
    fillCandidate({ password, confirm: password });
    acceptTerms();
    submit();
    expect(await screen.findByText(message)).toBeInTheDocument();
    expect(api.register).not.toHaveBeenCalled();
  });

  it('catches mismatched passwords', async () => {
    renderSignup();
    fillCandidate({ confirm: 'Str0ngPass?' });
    acceptTerms();
    submit();
    expect(await screen.findByText('Passwords do not match')).toBeInTheDocument();
  });
});

describe('a valid sign-up', () => {
  it('sends trimmed values and a normalised phone, then goes to /verify without the password in history', async () => {
    renderSignup();
    fillCandidate({ first: '  Sara ', phone: '01012345678' });
    acceptTerms();
    submit();
    await screen.findByText('verify page');
    expect(api.register).toHaveBeenCalledWith(expect.objectContaining({
      role: 'candidate', email: 'sara@example.com', firstName: 'Sara', lastName: 'Mansour',
      password: 'Str0ngPass!', phone: '+201012345678', country: 'Egypt',
    }));
    // returnTo is null: this visit did not come from an app link.
    expect(lastVerifyState).toEqual({ email: 'sara@example.com', rememberMe: true, returnTo: null });
    expect(JSON.stringify(lastVerifyState)).not.toContain('Str0ngPass!');
    expect(pendingSignInFor('sara@example.com')).toBe('Str0ngPass!');
  });

  it('sends one request even when submitted twice quickly', async () => {
    let finish: () => void = () => {};
    api.register.mockImplementation(() => new Promise<void>((r) => { finish = r; }));
    renderSignup();
    fillCandidate();
    acceptTerms();
    const form = screen.getByRole('button', { name: /Create .* Account/ }).closest('form')!;
    fireEvent.submit(form);
    fireEvent.submit(form);
    expect(api.register).toHaveBeenCalledTimes(1);
    expect(screen.getByRole('button', { name: 'Creating…' })).toBeDisabled();
    await act(async () => finish());
  });

  it('shows a server refusal in the page language', async () => {
    api.register.mockRejectedValue({ response: { status: 409, data: { error: 'Email already exists' } } });
    renderSignup();
    fillCandidate();
    acceptTerms();
    submit();
    expect(await screen.findByRole('alert')).toHaveTextContent('Email already exists');
    expect(screen.getByRole('button', { name: /Create .* Account/ })).not.toBeDisabled();
  });

  it('sends a guest applicant to set a password by emailed code instead of creating anything (SEC-16)', async () => {
    api.register.mockRejectedValue({ response: { status: 409, data: { error: 'You have already applied with this email.', guestAccount: true } } });
    api.requestPasswordReset.mockResolvedValue({ message: 'ok' });
    renderSignup();
    fillCandidate();
    acceptTerms();
    submit();
    expect(await screen.findByLabelText('6-digit verification code')).toBeInTheDocument();
    expect(api.requestPasswordReset).toHaveBeenCalledWith('sara@example.com');
    expect(screen.getByText(/You already applied to a job with sara@example.com/)).toBeInTheDocument();
    expect(lastVerifyState).toBeNull();
    expect(pendingSignInFor('sara@example.com')).toBeFalsy();
  });
});

describe('recruiter joining an existing company', () => {
  it('sends the picked company as joinCompanyId', async () => {
    api.searchCompanies.mockResolvedValue({ companies: [{ id: 12, name: 'Acme' }], suggestedByDomain: [] });
    renderSignup('/register?role=recruiter');
    type(/^First Name/, 'Omar');
    type(/^Last Name/, 'Ali');
    type(/^Email/, 'omar@acme.io');
    fireEvent.change(screen.getByLabelText('Search companies'), { target: { value: 'Ac' } });
    fireEvent.click(await screen.findByRole('button', { name: /Acme/ }, { timeout: 2000 }));
    fireEvent.click(screen.getByRole('button', { name: /Job Title/ }));
    fireEvent.click(screen.getByRole('option', { name: 'Recruiter' }));
    type(/^Password/, 'Str0ngPass!');
    type(/^Confirm Password/, 'Str0ngPass!');
    acceptTerms();
    submit();
    await screen.findByText('verify page');
    expect(api.register).toHaveBeenCalledWith(expect.objectContaining({ role: 'recruiter', joinCompanyId: 12, companyName: 'Acme', jobTitle: 'Recruiter' }));
  });

  it('offers join or independent, never "create"; a new company goes through company sign-up and KYB (SEC-04)', async () => {
    renderSignup('/register?role=recruiter');
    const modes = within(screen.getByRole('radiogroup', { name: 'Your company' })).getAllByRole('radio').map((r) => r.textContent?.trim());
    expect(modes).toEqual(['Join a company', 'Independent recruiter']);
    fireEvent.click(screen.getByRole('button', { name: 'Register your company' }));
    expect(await screen.findByLabelText(/^Company Name/)).toBeInTheDocument();
    expect(screen.getByLabelText(/^Business Email/)).toBeInTheDocument();
  });

  it('an independent recruiter sends independent: true and no company (owner decision 2026-10-18)', async () => {
    renderSignup('/register?role=recruiter');
    type(/^First Name/, 'Mona');
    type(/^Last Name/, 'Saleh');
    type(/^Email/, 'mona@gmail.com');
    fireEvent.click(screen.getByRole('radio', { name: 'Independent recruiter' }));
    expect(screen.queryByLabelText('Search companies')).not.toBeInTheDocument();
    expect(screen.getByText(/personal workspace/)).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /Job Title/ }));
    fireEvent.click(screen.getByRole('option', { name: 'Recruiter' }));
    type(/^Password/, 'Str0ngPass!');
    type(/^Confirm Password/, 'Str0ngPass!');
    acceptTerms();
    submit();
    await screen.findByText('verify page');
    const sent = api.register.mock.calls[0][0];
    expect(sent).toEqual(expect.objectContaining({ role: 'recruiter', independent: true }));
    expect(sent.joinCompanyId).toBeUndefined();
  });

  it('a recruiter plan from the pricing page starts on the independent path and comes back to pay for it', async () => {
    renderSignup('/register?role=recruiter&plan=RECRUITER_PRO&interval=YEAR');
    expect(screen.getByRole('radio', { name: 'Independent recruiter' })).toHaveAttribute('aria-checked', 'true');
    type(/^First Name/, 'Mona');
    type(/^Last Name/, 'Saleh');
    type(/^Email/, 'mona@gmail.com');
    fireEvent.click(screen.getByRole('button', { name: /Job Title/ }));
    fireEvent.click(screen.getByRole('option', { name: 'Recruiter' }));
    type(/^Password/, 'Str0ngPass!');
    type(/^Confirm Password/, 'Str0ngPass!');
    acceptTerms();
    submit();
    await screen.findByText('verify page');
    expect(api.register.mock.calls[0][0]).toEqual(expect.objectContaining({ role: 'recruiter', independent: true }));
    expect((lastVerifyState as { returnTo?: string }).returnTo).toMatch(/\/billing\?plan=RECRUITER_PRO&interval=YEAR$/);
  });

  it('refuses a javascript: LinkedIn link', async () => {
    renderSignup('/register?role=recruiter');
    type(/^LinkedIn Profile/, 'javascript:alert(1)');
    fireEvent.blur(screen.getByLabelText(/^LinkedIn Profile/));
    expect(await screen.findByText('Enter a valid linkedin.com profile link')).toBeInTheDocument();
  });

  it('company sign-up sends separate companyName and representative firstName / lastName', async () => {
    renderSignup('/register?role=company');
    type(/^Company Name/, 'Tie Apps');
    type(/^First Name/, 'Mahmoud');
    type(/^Last Name/, 'Hashim');
    type(/^Business Email/, 'admin@tieapps.com');
    type(/^Phone Number/, '01012345678');
    type(/^Password/, 'Str0ngPass!');
    type(/^Confirm Password/, 'Str0ngPass!');
    acceptTerms();
    submit();
    await screen.findByText('verify page');
    expect(api.register).toHaveBeenCalledWith(expect.objectContaining({
      role: 'company',
      companyName: 'Tie Apps',
      firstName: 'Mahmoud',
      lastName: 'Hashim',
      email: 'admin@tieapps.com',
    }));
  });
});

describe('Arabic / RTL', () => {
  it('shows the whole form in Arabic, right-to-left, with emails and passwords kept left-to-right', async () => {
    act(() => setLang('ar'));
    renderSignup();
    expect(document.documentElement).toHaveAttribute('dir', 'rtl');
    expect(document.documentElement).toHaveAttribute('lang', 'ar');
    expect(screen.getByRole('heading', { name: 'أنشئ حسابك' })).toBeInTheDocument();
    expect(screen.getByLabelText(/^الاسم الأول/)).toHaveAttribute('dir', 'auto');
    expect(screen.getByLabelText(/^البريد الإلكتروني/)).toHaveAttribute('dir', 'ltr');
    expect(screen.getByLabelText(/^كلمة المرور/)).toHaveAttribute('dir', 'ltr');
    expect(screen.queryByText(/First Name|Create your account/)).not.toBeInTheDocument();
  });

  it('gives validation and server errors in Arabic', async () => {
    act(() => setLang('ar'));
    api.register.mockRejectedValue({ response: { status: 409, data: { error: 'Email already exists' } } });
    renderSignup();
    fireEvent.click(screen.getByRole('button', { name: /إنشاء حساب مرشّح/ }));
    expect(await screen.findByText('الاسم الأول مطلوب')).toBeInTheDocument();
    type(/^الاسم الأول/, 'سارة');
    type(/^اسم العائلة/, 'منصور');
    type(/^البريد الإلكتروني/, 'sara@example.com');
    type(/^كلمة المرور/, 'Str0ngPass!');
    type(/^تأكيد كلمة المرور/, 'Str0ngPass!');
    fireEvent.click(screen.getByLabelText(/أوافق على/));
    fireEvent.click(screen.getByRole('button', { name: /إنشاء حساب مرشّح/ }));
    expect(await screen.findByRole('alert')).toHaveTextContent('يوجد حساب بهذا البريد الإلكتروني بالفعل.');
  });

  it('re-translates errors already on screen when the language is switched', async () => {
    renderSignup();
    submit();
    expect(await screen.findByText('First name is required')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'التبديل إلى العربية' }));
    expect(await screen.findByText('الاسم الأول مطلوب')).toBeInTheDocument();
    expect(screen.queryByText('First name is required')).not.toBeInTheDocument();
  });

  it('moves between account types with the arrow keys in visual order', async () => {
    act(() => setLang('ar'));
    renderSignup();
    const user = userEvent.setup();
    const candidate = screen.getByRole('radio', { name: /مرشّح/ });
    candidate.focus();
    await user.keyboard('{ArrowLeft}'); // in RTL the next card is to the LEFT
    // The switch runs after a 150ms cross-fade (timer-driven, so give it room
    // when the test files run in parallel on a busy machine).
    // The account-type card, not the recruiter form's "independent recruiter" choice.
    const recruiter = () => screen.getAllByRole('radio', { name: /مسؤول توظيف/ })[0];
    await waitFor(() => expect(recruiter()).toHaveAttribute('aria-checked', 'true'), { timeout: 3000 });
    await waitFor(() => expect(recruiter()).toHaveFocus(), { timeout: 3000 });
  });
});

describe('when the code email does not go out', () => {
  it('a created account whose code was not sent says so on the code page', async () => {
    api.register.mockResolvedValue({ message: 'ok', id: 'u1', email: 'sara@example.com', emailSent: false });
    renderSignup();
    fillCandidate();
    acceptTerms();
    submit();
    await screen.findByText('verify page');
    expect(lastVerifyState).toEqual(expect.objectContaining({ email: 'sara@example.com', notice: 'codeNotSent' }));
  });

  it('signing up again with an unconfirmed email sends a new code and goes to enter it (no dead end)', async () => {
    api.register.mockRejectedValue({ response: { status: 409, data: { pendingVerification: true, error: 'x' } } });
    api.resend.mockResolvedValue({ message: 'ok' });
    renderSignup();
    fillCandidate();
    acceptTerms();
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
    fillCandidate();
    acceptTerms();
    submit();
    await screen.findByText('verify page');
    expect(lastVerifyState).toEqual(expect.objectContaining({ notice: 'codeNotSent' }));
  });
});

