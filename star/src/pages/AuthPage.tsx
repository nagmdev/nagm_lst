import React, { useState, useCallback, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Building2, Check, Eye, EyeOff, Mail, ArrowLeft, ArrowRight, User } from '../design/glyphs';
import AuthShell from './AuthShell';
import RoleCards from '../components/auth/RoleCards';
import { authApi, handoffToApp, apiError, rememberPendingSignIn, planReturnTo } from '../auth';
import { useBfcacheReset } from '../utils/useBfcacheReset';
import { signInPasswordIssue } from '../utils/signInPassword';
import type { AccountRole, RegisterPayload } from '../auth';
import { emailError, emailSuggestion } from '../utils/contact';
import { useAuthText, localizeServerMessage } from '../i18n/authText';

type AuthText = ReturnType<typeof useAuthText>;

type AuthMode = 'signup' | 'login';


// Free mailbox providers: a company signs up with its own domain (the API
// refuses these too, but only after the whole form has been sent).
const FREE_EMAIL_DOMAINS = new Set(['gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com', 'icloud.com', 'aol.com', 'protonmail.com']);

// Same limits the API enforces (backend/src/middlewares/validation.ts), so the
// form stops a too-long value before the server has to.
const MAX_LEN: Record<string, number> = { name: 160, companyName: 160 };
const PASSWORD_MAX = 128;

/** Mirrors the backend policy: 8–128 chars and at least 3 of the 4 character classes. */
function passwordIssue(pw: string, t: AuthText): string {
  if (!pw) return t.passwordRequired;
  if (pw.length < 8) return t.passwordTooShort;
  if (pw.length > PASSWORD_MAX) return t.passwordTooLong;
  const classes = [/[A-Z]/, /[a-z]/, /[0-9]/, /[^A-Za-z0-9]/].filter((re) => re.test(pw)).length;
  if (classes < 3) return t.passwordClasses;
  return '';
}

/** Fields whose content is always left-to-right, even on the Arabic page. */
const LTR_TYPES = new Set(['email', 'tel', 'url', 'password']);

/**
 * nagm.io's sign-up / sign-in page.
 *
 * Sign-up is one short form for everyone: who you are (job seeker, recruiter
 * working on their own, or a company), your name, email and a password — plus
 * the company's name for a company. Everything else is asked later, in the app.
 * A recruiter joining a company's team signs up from the invitation link.
 * Signing in hands the session off to app.nagm.io.
 */
const AuthPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const t = useAuthText();
  /** Server messages arrive in English; show them in the page's language. */
  const tr = (message: string) => localizeServerMessage(message, t.lang);
  const formRef = useRef<HTMLFormElement>(null);

  const initialMode: AuthMode = location.pathname === '/login' ? 'login' : 'signup';
  const [authMode, setAuthMode] = useState<AuthMode>(initialMode);
  // Sign-up has three entities — Candidate | Recruiter | Company — and "Company"
  // is a real one: it registers the organisation and that person becomes its
  // Company Manager. A previous change mapped `company` onto `recruiter` here,
  // so every "Register your company" link quietly landed on the wrong form.
  const preset =
    (location.state as { role?: AccountRole } | null)?.role ??
    (location.pathname === '/register/company' ? 'company' : undefined);
  const queryParams = new URLSearchParams(location.search);
  const paramRole = queryParams.get('role') as AccountRole | null;
  const initialRole: AccountRole =
    preset === 'recruiter' || preset === 'company'
      ? preset
      : paramRole && ['candidate', 'recruiter', 'company'].includes(paramRole)
      ? paramRole
      : 'candidate';

  const [role, setRole] = useState<AccountRole>(initialRole);

  const [transitioning, setTransitioning] = useState(false);
  const [transitionDir, setTransitionDir] = useState<'left' | 'right'>('right');
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [busy, setBusy] = useState(false);

  // A successful sign-in sets `busy` and navigates away without resetting it.
  // If the browser keeps this page in its back-forward cache, Back restores it
  // exactly as it was - button disabled, no effects re-run - and the person
  // cannot sign in without a reload. Put the form back into a usable state.
  useBfcacheReset(() => {
    setBusy(false);
    setTransitioning(false);
  });
  // Briefly true right after a failed submit — drives the one-shot shake/glow on
  // every invalid field so a re-submit replays the effect instead of going stale.
  const [animatingErrors, setAnimatingErrors] = useState(false);
  const flashErrors = () => { setAnimatingErrors(true); setTimeout(() => setAnimatingErrors(false), 550); };
  const [remember, setRemember] = useState(true);
  const [showPwd, setShowPwd] = useState<Record<string, boolean>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  // Forgot password flow
  const [forgotMode, setForgotMode] = useState<'none' | 'request' | 'reset'>('none');
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotOtp, setForgotOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [forgotMsg, setForgotMsg] = useState('');
  const [forgotErr, setForgotErr] = useState('');
  const [forgotBusy, setForgotBusy] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [resendingCode, setResendingCode] = useState(false);

  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setInterval(() => {
      setResendCooldown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [resendCooldown]);


  const queryEmail = queryParams.get('email') || '';
  // Where the app wants the person back after signing in (validated in appPathFor),
  // else the plan chosen on the pricing page: its billing page, on that plan.
  const returnTo = queryParams.get('returnTo') || planReturnTo(queryParams);

  // Opened from a company invitation: the account joins that company's team,
  // so there is no type to choose and the invited address is the one to use.
  const invited = /\/invite\//.test(returnTo || '') && Boolean(queryEmail);

  const [values, setValues] = useState<Record<string, string>>({ name: '', email: queryEmail, companyName: '', password: '' });

  // Pre-fill email and role if supplied via query params (e.g. from invite link)
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const emailParam = params.get('email');
    const roleParam = params.get('role') as AccountRole | null;
    if (emailParam) setValues((v) => ({ ...v, email: v.email || emailParam }));
    if (roleParam && ['candidate', 'recruiter', 'company'].includes(roleParam)) {
      setRole((r) => (r === 'candidate' ? roleParam : r));
    }
  }, [location.search]);

  const switchMode = useCallback((mode: AuthMode) => {
    if (mode === authMode || transitioning) return;
    setTransitionDir(mode === 'signup' ? 'right' : 'left');
    setTransitioning(true);
    setTimeout(() => {
      setAuthMode(mode);
      setError(''); setSuccessMsg(''); setErrors({}); setTouched({});
      setTransitioning(false);
      // Keep ?email=…&returnTo=… — switching tabs used to drop the invite context.
      navigate({ pathname: mode === 'signup' ? '/register' : '/login', search: location.search }, { replace: true });
    }, 150);
  }, [authMode, transitioning, navigate, location.search]);

  const switchRole = useCallback((newRole: AccountRole) => {
    if (newRole === role || transitioning) return;
    setTransitionDir('right');
    setTransitioning(true);
    setTimeout(() => {
      setRole(newRole);
      setError(''); setSuccessMsg(''); setErrors({}); setTouched({});
      setTransitioning(false);
    }, 150);
  }, [role, transitioning]);

  const validateField = (name: string, val?: string): string => {
    const v = (val ?? values[name] ?? '').trim();
    const tooLong = (label: string) => (MAX_LEN[name] && v.length > MAX_LEN[name] ? t.tooLong(label, MAX_LEN[name]) : '');
    let err = '';
    switch (name) {
      case 'name': err = v ? tooLong(t.fullName) : t.fullNameRequired; break;
      case 'companyName': err = v ? tooLong(t.companyName) : t.companyNameRequired; break;
      case 'email':
        err = emailError(v, true, t.lang);
        // A company signs up with its own domain, which the API insists on too.
        if (!err && authMode === 'signup' && role === 'company' && !invited && FREE_EMAIL_DOMAINS.has(v.split('@')[1]?.toLowerCase() || '')) {
          err = t.useWorkEmail;
        }
        break;
      // Signing in checks an EXISTING password, which only the server can judge;
      // the full policy belongs where a password is being chosen. See
      // utils/signInPassword for how the old behaviour locked people out.
      case 'password':
        err = authMode === 'login' ? signInPasswordIssue(values.password, t) : passwordIssue(values.password, t);
        break;
    }
    setErrors((p) => ({ ...p, [name]: err }));
    return err;
  };

  // A language switch re-renders every shown error in the new language.
  useEffect(() => {
    Object.keys(touched).forEach((name) => { if (touched[name]) validateField(name); });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [t.lang]);

  const handleChange = (name: string, value: string) => {
    setValues((p) => ({ ...p, [name]: value }));
    if (touched[name]) validateField(name, value);
  };
  const handleBlur = (name: string) => {
    setTouched((p) => ({ ...p, [name]: true }));
    validateField(name);
  };

  // In on-screen order, so the first failing one is the first the user sees.
  const signupFields = (): string[] => [...(role === 'company' && !invited ? ['companyName'] : []), 'name', 'email', 'password'];

  /** Focus a field of THIS form on the next frame; a no-op once the form is gone. */
  const focusInForm = (id: string) =>
    requestAnimationFrame(() => formRef.current?.querySelector<HTMLElement>(`#${id}`)?.focus());

  /** Move focus to the first invalid field so keyboard and screen-reader users land on the problem. */
  const focusFirstInvalid = (fields: string[], errs: Record<string, string>) => {
    const first = fields.find((f) => errs[f]);
    if (first) focusInForm(first);
  };

  const isValid = (): boolean => {
    const fields = authMode === 'signup' ? signupFields() : ['email', 'password'];
    const errs: Record<string, string> = {};
    fields.forEach((f) => { errs[f] = validateField(f); });
    setTouched((p) => {
      const next = { ...p };
      fields.forEach((f) => { next[f] = true; });
      return next;
    });
    const fieldsOk = fields.every((f) => !errs[f]);
    if (!fieldsOk) focusFirstInvalid(fields, errs);
    return fieldsOk;
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Enter pressed again (or a double click) while a request is in flight.
    if (busy) return;
    setError(''); setSuccessMsg('');
    if (!isValid()) {
      flashErrors();
      return;
    }
    setBusy(true);

    if (authMode === 'signup') {
      const email = values.email.trim();
      // An invited teammate joins the company that invited them.
      const payload: RegisterPayload = { role: invited ? 'recruiter' : role, email, password: values.password, name: values.name.trim() };
      if (role === 'company' && !invited) payload.companyName = values.companyName.trim();
      try {
        const created = await authApi.register(payload);
        // Registration sends an OTP; verify it, then we auto-sign-in and hand off.
        // The password stays in memory for that sign-in — never in history.state,
        // which the browser keeps (and restores) with the page history.
        rememberPendingSignIn(email, values.password);
        // emailSent:false — the account exists but the code did not go: say so.
        navigate('/verify', { state: { email, rememberMe: true, returnTo, notice: created?.emailSent === false ? 'codeNotSent' : undefined } });
      } catch (e2) {
        const resp = (e2 as { response?: { status?: number; data?: { guestAccount?: boolean; pendingVerification?: boolean } } })?.response;
        if (resp?.status === 409 && resp.data?.pendingVerification) {
          // Signed up before but never confirmed (often: the code never came).
          // Send a fresh code and go enter it. Their password is the one from
          // that first sign-up, so nothing is remembered for auto sign-in.
          let notice: 'pendingAccount' | 'codeNotSent' = 'pendingAccount';
          try {
            await authApi.resend(email);
          } catch (e3) {
            if ((e3 as { response?: { status?: number } })?.response?.status === 503) notice = 'codeNotSent';
          }
          navigate('/verify', { state: { email, rememberMe: true, returnTo, notice } });
          return;
        }
        if (resp?.status === 409 && resp.data?.guestAccount) {
          // They applied to a job as a guest. Sign-up no longer writes to that
          // account; they finish it by setting a password with an emailed code,
          // which proves the inbox first.
          try {
            await authApi.requestPasswordReset(email);
          } catch {
            // The code can be resent from the next screen.
          }
          setForgotEmail(email);
          setForgotOtp('');
          setNewPassword('');
          setForgotErr('');
          setForgotMsg(t.guestFinishAccount(email));
          setResendCooldown(60);
          setForgotMode('reset');
          setAuthMode('login');
          setBusy(false);
          navigate({ pathname: '/login', search: location.search }, { replace: true });
          return;
        }
        setError(tr(apiError(e2, t.failCreate)));
        setBusy(false);
      }
      return;
    }

    // Sign in — the server decides the account's real role.
    try {
      const tokens = await authApi.login(values.email.trim(), values.password, remember);
      await handoffToApp(tokens, remember, returnTo); // → app.nagm.io, already signed in
    } catch (e2) {
      const resp = (e2 as { response?: { status?: number; data?: { requiresVerification?: boolean } } })?.response;
      // The backend signals "email not verified" via HTTP 403 — route into the
      // verify flow instead of showing a dead-end error.
      if (resp?.status === 403 && resp?.data?.requiresVerification) {
        rememberPendingSignIn(values.email.trim(), values.password);
        navigate('/verify', { state: { email: values.email.trim(), rememberMe: remember, returnTo } });
        return;
      }
      setError(tr(apiError(e2, t.failSignIn)));
      setBusy(false);
    }
  };

  const togglePwd = (k: string) => setShowPwd((p) => ({ ...p, [k]: !p[k] }));

  const showErr = (name: string) => !!errors[name] && !!touched[name];
  const errId = (name: string) => `${name}-error`;
  const errorText = (name: string) =>
    showErr(name) ? <div id={errId(name)} style={{ fontSize: 12, color: 'var(--danger)', marginTop: 4 }}>{errors[name]}</div> : null;
  const requiredMark = <span aria-hidden="true"> *</span>;

  // Padding by the PAGE direction: `lead` on the side where field icons sit, `trail`
  // where the show-password button sits. Physical sides, because an email or
  // password input is itself dir="ltr" on the Arabic page, so its own logical
  // start/end would be the opposite of the icon's and the text ran under it.
  const pad = (lead: number, trail: number): React.CSSProperties =>
    t.isAr ? { paddingRight: lead, paddingLeft: trail } : { paddingLeft: lead, paddingRight: trail };

  const inputStyle = (name: string, extra: React.CSSProperties = {}): React.CSSProperties => ({
    width: '100%', height: 46, borderRadius: 12, fontSize: 14, fontFamily: 'inherit',
    border: `1px solid ${showErr(name) ? 'var(--danger)' : 'var(--line)'}`,
    background: 'var(--panel)', color: 'var(--ink)', outline: 'none',
    marginTop: 0,
    boxShadow: showErr(name) ? '0 0 0 3px var(--dangerSoft)' : 'none',
    transition: 'border-color .15s, box-shadow .15s',
    ...extra,
  });

  const field = (
    name: string,
    label: string,
    opts?: { type?: string; placeholder?: string; required?: boolean; autoComplete?: string; icon?: React.ReactNode; inputMode?: React.HTMLAttributes<HTMLInputElement>['inputMode']; readOnly?: boolean },
  ) => {
    const type = opts?.type || 'text';
    const suggestion = type === 'email' && !errors[name] ? emailSuggestion(values[name] || '') : null;
    const required = opts?.required !== false;
    return (
      <div style={{ marginBottom: 16 }}>
        <label htmlFor={name} style={{ fontSize: 13, fontWeight: 600, color: 'var(--ink2)', display: 'block', marginBottom: 4 }}>
          {label}{required ? requiredMark : ''}
        </label>
        <div style={{ position: 'relative' }}>
          {opts?.icon && (
            <div aria-hidden="true" style={{ position: 'absolute', insetInlineStart: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--ink3)', pointerEvents: 'none', zIndex: 1 }}>
              {opts.icon}
            </div>
          )}
          <input
            id={name}
            name={name}
            type={type}
            value={values[name] || ''}
            placeholder={opts?.placeholder}
            autoComplete={opts?.autoComplete}
            inputMode={opts?.inputMode}
            readOnly={opts?.readOnly}
            // Emails, phones and links read left-to-right even on the Arabic
            // page; names follow whatever script was typed.
            dir={LTR_TYPES.has(type) ? 'ltr' : 'auto'}
            maxLength={MAX_LEN[name] ? MAX_LEN[name] + 20 : undefined}
            aria-required={required || undefined}
            aria-invalid={showErr(name) || undefined}
            aria-describedby={showErr(name) ? errId(name) : undefined}
            onChange={(e) => handleChange(name, e.target.value)}
            onBlur={() => handleBlur(name)}
            className={`ng-auth-field ${animatingErrors && showErr(name) ? 'ng-error-pulse' : ''}`}
            style={inputStyle(name, {
              paddingBlock: 0,
              ...pad(opts?.icon ? 38 : 14, 14),
              textAlign: t.isAr && LTR_TYPES.has(type) ? 'right' : undefined,
            })}
          />
        </div>
        {errorText(name)}
        {/* Catch the classic "@gmial.com" slip — one tap fixes it. */}
        {suggestion && (
          <div style={{ fontSize: 12, color: 'var(--ink2)', marginTop: 4 }}>
            {t.didYouMean}{' '}
            <button
              type="button"
              dir="ltr"
              onClick={() => { handleChange(name, suggestion); setTouched((p) => ({ ...p, [name]: true })); }}
              style={{ border: 'none', background: 'none', padding: 0, font: 'inherit', color: 'var(--brandInk)', fontWeight: 700, cursor: 'pointer' }}
            >
              {suggestion}
            </button>
            {t.isAr ? '؟' : '?'}
          </div>
        )}
      </div>
    );
  };

  const passwordField = (name: string, label: string, autoComplete: string) => (
    <div style={{ marginBottom: 16 }}>
      <label htmlFor={name} style={{ fontSize: 13, fontWeight: 600, color: 'var(--ink2)', display: 'block', marginBottom: 4 }}>{label}{requiredMark}</label>
      <div style={{ position: 'relative' }}>
        <input
          id={name}
          name={name}
          type={showPwd[name] ? 'text' : 'password'}
          value={values[name] || ''}
          autoComplete={autoComplete}
          dir="ltr"
          aria-required
          aria-invalid={showErr(name) || undefined}
          aria-describedby={showErr(name) ? errId(name) : undefined}
          onChange={(e) => handleChange(name, e.target.value)}
          onBlur={() => handleBlur(name)}
          className={`ng-auth-field ${animatingErrors && showErr(name) ? 'ng-error-pulse' : ''}`}
          style={inputStyle(name, {
            paddingBlock: 0, ...pad(14, 42),
            textAlign: t.isAr ? 'right' : undefined,
          })}
        />
        <button
          type="button" aria-label={showPwd[name] ? t.hidePassword : t.showPassword}
          aria-pressed={!!showPwd[name]}
          onClick={() => togglePwd(name)}
          style={{
            position: 'absolute', top: 0, bottom: 0, insetInlineEnd: 6, margin: 'auto', height: 30, width: 30,
            display: 'flex', alignItems: 'center', justifyContent: 'center', border: 'none',
            background: 'transparent', color: 'var(--ink3)', cursor: 'pointer', borderRadius: 7,
          }}
        >
          {showPwd[name] ? <EyeOff size={16} aria-hidden="true" /> : <Eye size={16} aria-hidden="true" />}
        </button>
      </div>
      {errorText(name) ?? (authMode === 'signup' && <div style={{ fontSize: 12, color: 'var(--ink3)', marginTop: 4 }}>{t.passwordHint}</div>)}
    </div>
  );

  // Agreeing is what creating the account means; the server records when.
  // The documents open in a new tab so the half-filled form stays put.
  const consentLink: React.CSSProperties = { color: 'var(--brandInk)', fontWeight: 600 };
  const consent = () => (
    <p style={{ fontSize: 12.5, color: 'var(--ink3)', margin: '0 0 14px', lineHeight: 1.55 }}>
      {t.consentPrefix}<Link to="/terms" target="_blank" rel="noopener" style={consentLink}>{t.terms}</Link>{t.termsAnd}<Link to="/privacy" target="_blank" rel="noopener" style={consentLink}>{t.privacy}</Link>{t.consentSuffix}
    </p>
  );

  const note = (text: string) => (
    <div style={{
      display: 'flex', gap: 8, alignItems: 'flex-start', padding: '10px 12px', borderRadius: 10,
      background: 'var(--brandSoft)', border: '1px solid var(--brandBorder)', marginBottom: 16,
      fontSize: 12.5, color: 'var(--ink2)', lineHeight: 1.45,
    }}>
      <Check size={15} aria-hidden="true" style={{ color: 'var(--brand)', flexShrink: 0, marginTop: 1 }} />
      <span>{text}</span>
    </div>
  );

  // One form for everyone. A company adds its name; nothing else differs.
  const signupForm = () => {
    const company = role === 'company' && !invited;
    return (
      <>
        {invited ? note(t.invitedNote) : company ? note(t.approvalCompany) : null}
        {company && field('companyName', t.companyName, { placeholder: t.isAr ? 'مثال: شركة تاي ابس' : 'Acme Corp', icon: <Building2 size={15} />, autoComplete: 'organization' })}
        {field('name', t.fullName, { autoComplete: 'name', placeholder: t.isAr ? 'سارة منصور' : 'Sara Mansour', icon: <User size={15} /> })}
        {field('email', company ? t.businessEmail : t.email, {
          type: 'email', placeholder: company ? 'you@company.com' : 'you@example.com', autoComplete: 'email', icon: <Mail size={15} />, readOnly: invited,
        })}
        {passwordField('password', t.password, 'new-password')}
        {consent()}
      </>
    );
  };

  const handleRequestReset = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (forgotBusy) return;
    setForgotErr('');
    setForgotMsg('');
    const em = forgotEmail.trim();
    if (!em || emailError(em)) {
      setForgotErr(t.enterValidEmail);
      focusInForm('forgot-email');
      return;
    }
    try {
      setForgotBusy(true);
      await authApi.requestPasswordReset(em);
      setForgotOtp('');
      setNewPassword('');
      setForgotMsg(t.resetCodeSent(em));
      setResendCooldown(60);
      setForgotMode('reset');
    } catch (err) {
      setForgotErr(tr(apiError(err, t.failSendReset)));
    } finally {
      setForgotBusy(false);
    }
  };

  const handleResendCode = async () => {
    if (resendCooldown > 0 || resendingCode || forgotBusy) return;
    setForgotErr('');
    const em = forgotEmail.trim();
    if (!em) {
      setForgotErr(t.enterValidEmail);
      return;
    }
    try {
      setResendingCode(true);
      await authApi.requestPasswordReset(em);
      setForgotMsg(t.newResetCodeSent(em));
      setResendCooldown(60);
    } catch (err) {
      setForgotErr(tr(apiError(err, t.failResend)));
    } finally {
      setResendingCode(false);
    }
  };

  const handleResetPassword = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (forgotBusy) return;
    setForgotErr('');
    setForgotMsg('');
    const cleanedOtp = forgotOtp.replace(/\D/g, '').trim();
    if (!cleanedOtp || cleanedOtp.length !== 6) {
      setForgotErr(t.enterCode);
      focusInForm('reset-otp-input');
      return;
    }
    const pwIssue = passwordIssue(newPassword, t);
    if (pwIssue) {
      setForgotErr(pwIssue);
      focusInForm('reset-new-password');
      return;
    }
    try {
      setForgotBusy(true);
      await authApi.resetPasswordWithOtp(forgotEmail.trim(), cleanedOtp, newPassword);
      setForgotMode('none');
      setSuccessMsg(t.resetDone);
      setValues((v) => ({ ...v, email: forgotEmail.trim(), password: '' }));
      setForgotOtp('');
      setNewPassword('');
    } catch (err) {
      setForgotErr(tr(apiError(err, t.failReset)));
    } finally {
      setForgotBusy(false);
    }
  };

  const BackArrow = t.isAr ? ArrowRight : ArrowLeft;
  const ForwardArrow = t.isAr ? ArrowLeft : ArrowRight;
  const plainInput: React.CSSProperties = {
    width: '100%', height: 46, borderRadius: 12, fontSize: 14, fontFamily: 'inherit',
    border: '1px solid var(--line)', background: 'var(--panel)', color: 'var(--ink)', outline: 'none', paddingBlock: 0, paddingInline: 14,
  };
  const labelStyle: React.CSSProperties = { display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--ink2)', marginBottom: 6 };
  const alertBox = (text: string, id?: string) => (
    <div id={id} role="alert" style={{ fontSize: 13.5, color: 'var(--danger)', background: 'var(--dangerSoft)', padding: '10px 12px', borderRadius: 10 }}>{text}</div>
  );
  const eyeButton = (key: string) => (
    <button
      type="button"
      aria-label={showPwd[key] ? t.hidePassword : t.showPassword}
      aria-pressed={!!showPwd[key]}
      onClick={() => togglePwd(key)}
      style={{
        position: 'absolute', top: 0, bottom: 0, insetInlineEnd: 6, margin: 'auto', height: 30, width: 30,
        display: 'flex', alignItems: 'center', justifyContent: 'center', border: 'none',
        background: 'transparent', color: 'var(--ink3)', cursor: 'pointer', borderRadius: 7,
      }}
    >
      {showPwd[key] ? <EyeOff size={16} aria-hidden="true" /> : <Eye size={16} aria-hidden="true" />}
    </button>
  );

  const forgotForm = () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {forgotMode === 'request' ? (
        <>
          <div>
            <label htmlFor="forgot-email" style={labelStyle}>{t.yourEmail}</label>
            <input
              id="forgot-email"
              name="email"
              type="email"
              dir="ltr"
              autoComplete="email"
              value={forgotEmail}
              onChange={(e) => setForgotEmail(e.target.value)}
              placeholder="you@example.com"
              required
              aria-invalid={!!forgotErr || undefined}
              aria-describedby={forgotErr ? 'forgot-error' : undefined}
              className="ng-auth-field"
              style={{ ...plainInput, textAlign: t.isAr ? 'right' : undefined }}
            />
          </div>
          {forgotErr && alertBox(forgotErr, 'forgot-error')}
          <button
            type="submit"
            disabled={forgotBusy}
            aria-busy={forgotBusy || undefined}
            style={{
              width: '100%', height: 46, borderRadius: 12, border: 'none', background: 'var(--grad)', color: '#fff',
              fontFamily: 'inherit', fontSize: 14.5, fontWeight: 700, cursor: forgotBusy ? 'not-allowed' : 'pointer',
              boxShadow: forgotBusy ? 'none' : '0 6px 18px var(--brandShadow)',
            }}
          >
            {forgotBusy ? t.sendingCode : t.sendResetCode}
          </button>
        </>
      ) : (
        <>
          {/* Hidden identity field: prevents browser password managers from autofilling account email into the OTP box */}
          <input
            type="email"
            name="username"
            value={forgotEmail}
            readOnly
            tabIndex={-1}
            autoComplete="username"
            style={{ position: 'absolute', width: 0, height: 0, opacity: 0, pointerEvents: 'none' }}
            aria-hidden="true"
          />

          <div
            role="status"
            style={{
              fontSize: 13, color: 'var(--ok)', background: 'var(--okSoft)', padding: '10px 12px', borderRadius: 10,
              display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, lineHeight: 1.4,
            }}
          >
            <span style={{ wordBreak: 'break-word' }}>{forgotMsg || t.resetCodeSent(forgotEmail)}</span>
            <button
              type="button"
              onClick={() => {
                setForgotMode('request');
                setForgotOtp('');
                setForgotErr('');
              }}
              style={{
                border: 'none', background: 'none', padding: '2px 4px', fontFamily: 'inherit', fontSize: 12, fontWeight: 700,
                color: 'var(--brandInk)', cursor: 'pointer', textDecoration: 'underline', whiteSpace: 'nowrap', flexShrink: 0,
              }}
            >
              {t.changeEmail}
            </button>
          </div>

          <div>
            <label htmlFor="reset-otp-input" style={labelStyle}>{t.codeLabel}</label>
            <input
              id="reset-otp-input"
              name="one-time-code"
              type="text"
              dir="ltr"
              inputMode="numeric"
              pattern="[0-9]*"
              autoComplete="one-time-code"
              data-1p-ignore="true"
              data-lpignore="true"
              data-form-type="other"
              maxLength={6}
              value={forgotOtp}
              onChange={(e) => setForgotOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
              placeholder="123456"
              required
              aria-describedby={forgotErr ? 'forgot-error' : undefined}
              className="ng-auth-field"
              style={{ ...plainInput, fontSize: 18, fontWeight: 700, letterSpacing: '.25em', textAlign: 'center' }}
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 13, color: 'var(--ink2)', marginTop: -6 }}>
            <span>{t.noCode}</span>
            <button
              type="button"
              onClick={handleResendCode}
              disabled={resendCooldown > 0 || resendingCode || forgotBusy}
              style={{
                background: 'none', border: 'none', padding: 0, fontFamily: 'inherit', fontSize: 13, fontWeight: 700,
                color: resendCooldown > 0 ? 'var(--ink3)' : 'var(--brandInk)',
                cursor: resendCooldown > 0 ? 'not-allowed' : 'pointer', textDecoration: 'none',
              }}
            >
              {resendingCode ? t.sending : resendCooldown > 0 ? t.resendIn(resendCooldown) : t.resendCode}
            </button>
          </div>

          <div>
            <label htmlFor="reset-new-password" style={labelStyle}>{t.newPassword}</label>
            <div style={{ position: 'relative' }}>
              <input
                id="reset-new-password"
                name="new-password"
                type={showPwd['resetNewPassword'] ? 'text' : 'password'}
                dir="ltr"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                autoComplete="new-password"
                placeholder={t.newPasswordPlaceholder}
                required
                className="ng-auth-field"
                style={{ ...plainInput, ...pad(14, 42), textAlign: t.isAr ? 'right' : undefined }}
              />
              {eyeButton('resetNewPassword')}
            </div>
          </div>

          {forgotErr && alertBox(forgotErr, 'forgot-error')}
          <button
            type="submit"
            disabled={forgotBusy}
            aria-busy={forgotBusy || undefined}
            style={{
              width: '100%', height: 46, borderRadius: 12, border: 'none', background: 'var(--grad)', color: '#fff',
              fontFamily: 'inherit', fontSize: 14.5, fontWeight: 700, cursor: forgotBusy ? 'not-allowed' : 'pointer',
              boxShadow: forgotBusy ? 'none' : '0 6px 18px var(--brandShadow)',
            }}
          >
            {/* It resets the password and returns to sign-in — it does not sign
                in by itself, so the button no longer promises "& sign in". */}
            {forgotBusy ? t.resetting : t.resetPassword}
          </button>
        </>
      )}
      <button
        type="button"
        onClick={() => {
          setForgotMode('none');
          setForgotErr('');
          setForgotMsg('');
          setForgotOtp('');
          setNewPassword('');
        }}
        style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 6, background: 'none', border: 'none', color: 'var(--ink2)', fontSize: 13, fontWeight: 600, cursor: 'pointer', marginTop: 4, fontFamily: 'inherit' }}
      >
        <BackArrow size={14} aria-hidden="true" /> {t.backToSignIn}
      </button>
    </div>
  );

  const loginForm = () => (
    <>
      {forgotMode !== 'none' ? (
        forgotForm()
      ) : (
        <>
          {field('email', t.email, { type: 'email', placeholder: 'you@example.com', autoComplete: 'email', icon: <Mail size={15} /> })}
          {passwordField('password', t.password, 'current-password')}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginBottom: 16, flexWrap: 'wrap' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13.5, color: 'var(--ink2)', fontWeight: 500, cursor: 'pointer' }}>
              <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} style={{ width: 16, height: 16, accentColor: 'var(--brand)' }} />
              {t.keepSignedIn}
            </label>
            <button
              type="button"
              onClick={() => {
                setForgotEmail(values.email || '');
                setForgotErr('');
                setForgotMsg('');
                setForgotOtp('');
                setNewPassword('');
                setForgotMode('request');
              }}
              style={{ background: 'none', border: 'none', padding: 0, fontSize: 13.5, fontWeight: 600, color: 'var(--brandInk)', textDecoration: 'none', cursor: 'pointer', fontFamily: 'inherit' }}
            >
              {t.forgotPassword}
            </button>
          </div>
        </>
      )}
    </>
  );

  const linkButton: React.CSSProperties = { background: 'none', border: 'none', padding: 0, font: 'inherit', color: 'var(--brandInk)', fontWeight: 700, cursor: 'pointer' };

  return (
    <AuthShell
      title={authMode === 'signup' ? t.titleSignup : forgotMode !== 'none' ? t.titleReset : t.titleLogin}
      subtitle={authMode === 'signup'
        ? t.subSignup
        : forgotMode === 'request'
        ? t.subResetRequest
        : forgotMode === 'reset'
        ? t.subResetCode
        : t.subLogin}
      footer={
        authMode === 'signup' ? (
          <>{t.haveAccount}{' '}
            <button type="button" onClick={() => { setForgotMode('none'); switchMode('login'); }} style={linkButton}>{t.signInLink}</button>
          </>
        ) : (
          <>{t.noAccount}{' '}
            <button type="button" onClick={() => { setForgotMode('none'); switchMode('signup'); }} style={linkButton}>{t.createOneLink}</button>
          </>
        )
      }
    >
      {/* Sign Up / Log In tabs */}
      <div role="tablist" aria-label={t.authModeLabel} style={{ display: 'flex', background: 'var(--hover)', borderRadius: 12, padding: 4, marginBottom: 22 }}>
        {(['signup', 'login'] as AuthMode[]).map((mode) => (
          <button
            key={mode} type="button" role="tab" aria-selected={authMode === mode}
            onClick={() => { setForgotMode('none'); switchMode(mode); }}
            style={{
              flex: 1, padding: '10px 0', border: 'none', borderRadius: 10,
              background: authMode === mode ? 'var(--panel)' : 'transparent',
              color: authMode === mode ? 'var(--ink)' : 'var(--ink3)',
              fontFamily: 'inherit', fontSize: 14, fontWeight: 700, cursor: 'pointer',
              boxShadow: authMode === mode ? 'var(--shadow)' : 'none',
              transition: 'all 200ms ease-in-out',
            }}
          >
            {mode === 'signup' ? t.tabSignup : t.tabLogin}
          </button>
        ))}
      </div>

      {authMode === 'signup' && !invited && (
        <>
          <p style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: t.isAr ? 0 : '.06em', color: 'var(--ink3)', margin: '4px 0 12px' }}>
            {t.chooseAccountType}
          </p>
          <RoleCards selected={role} onSelect={switchRole} />
          {role !== 'candidate' && (
            <p style={{ fontSize: 12.5, color: 'var(--ink3)', margin: '10px 0 0', lineHeight: 1.5 }}>{t.teammateHint}</p>
          )}
        </>
      )}

      <div style={{ position: 'relative', overflow: 'hidden', marginTop: 12 }}>
        <div style={{
          transition: 'opacity 250ms ease-in-out, transform 250ms ease-in-out',
          opacity: transitioning ? 0 : 1,
          transform: transitioning ? `translateX(${(transitionDir === 'right' ? 20 : -20) * (t.isAr ? -1 : 1)}px)` : 'translateX(0)',
        }}>
          <form
            ref={formRef}
            onSubmit={
              authMode === 'login' && forgotMode === 'request'
                ? handleRequestReset
                : authMode === 'login' && forgotMode === 'reset'
                ? handleResetPassword
                : submit
            }
            noValidate
            aria-busy={busy || undefined}
          >
            {authMode === 'login' ? loginForm() : signupForm()}

            {error && (
              <div id="form-error" role="alert" style={{ fontSize: 13.5, color: 'var(--danger)', background: 'var(--dangerSoft)', padding: '10px 12px', borderRadius: 10, marginBottom: 12 }}>
                {error}
              </div>
            )}
            {successMsg && (
              <div role="status" style={{ fontSize: 13.5, color: 'var(--ok)', background: 'var(--okSoft)', padding: '10px 12px', borderRadius: 10, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
                <Check size={16} aria-hidden="true" /> {successMsg}
              </div>
            )}

            {authMode === 'login' && forgotMode !== 'none' ? null : (
              <button
                type="submit"
                disabled={busy || transitioning}
                style={{
                  width: '100%', height: 48, borderRadius: 12, border: 'none',
                  background: busy ? 'var(--line)' : 'var(--grad)', color: '#fff',
                  fontFamily: 'inherit', fontSize: 15, fontWeight: 700,
                  cursor: busy ? 'not-allowed' : 'pointer',
                  boxShadow: busy ? 'none' : '0 6px 18px var(--brandShadow)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                  transition: 'all .15s',
                }}
              >
                {busy
                  ? (authMode === 'signup' ? t.creating : t.signingIn)
                  : <>{authMode === 'signup' ? t.createAccount : t.signIn} <ForwardArrow size={17} aria-hidden="true" /></>}
              </button>
            )}
          </form>
        </div>
      </div>
    </AuthShell>
  );
};

export default AuthPage;
