import React, { useState, useCallback, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Building2, Briefcase, Check, Eye, EyeOff, Mail, ArrowLeft, ArrowRight, Globe, Search, User } from 'lucide-react';
import AuthShell from './AuthShell';
import RoleCards from '../components/auth/RoleCards';
import SelectDropdown from '../components/auth/SelectDropdown';
import { authApi, handoffToApp, apiError, rememberPendingSignIn } from '../auth';
import type { AccountRole, RegisterPayload, CompanyOption } from '../auth';
import { emailError, emailSuggestion, phoneError, phoneExample, normalizePhone, COUNTRY_NAMES_AR } from '../utils/contact';
import { linkIssue } from '../utils/links';
import { useAuthText, localizeServerMessage } from '../i18n/authText';

type AuthText = ReturnType<typeof useAuthText>;

type AuthMode = 'signup' | 'login';


const COUNTRY_CODES: Record<string, string> = {
  'Egypt': '(+20)', 'Saudi Arabia': '(+966)', 'United Arab Emirates': '(+971)',
};

const COUNTRY_OPTIONS = ['Egypt', 'Saudi Arabia', 'United Arab Emirates'];
const DEFAULT_COUNTRY = 'Egypt';

// Max mobile-number digits per country — the phone input is capped to this as
// it's typed (e.g. Egypt = 11 digits).
const COUNTRY_PHONE_MAX: Record<string, number> = {
  Egypt: 11, 'Saudi Arabia': 9, 'United Arab Emirates': 9,
};

// Recruiter job titles — a scrollable dropdown, with "Other" revealing a
// free-text "please specify" field.
const JOB_TITLES = [
  'Recruiter', 'Senior Recruiter', 'Technical Recruiter', 'Lead Recruiter',
  'Recruitment Coordinator', 'Talent Sourcer', 'Talent Acquisition Specialist',
  'Talent Acquisition Partner', 'Talent Acquisition Manager', 'HR Specialist',
  'HR Generalist', 'HR Manager', 'HR Business Partner', 'Hiring Manager',
  'Head of Talent Acquisition', 'HR Director', 'Other',
];

// Arabic labels for the job-title list. The English title is still what gets
// stored, so recruiters' titles stay searchable whatever language they used.
const JOB_TITLES_AR: Record<string, string> = {
  Recruiter: 'مسؤول توظيف', 'Senior Recruiter': 'مسؤول توظيف أول', 'Technical Recruiter': 'مسؤول توظيف تقني',
  'Lead Recruiter': 'قائد فريق التوظيف', 'Recruitment Coordinator': 'منسّق توظيف', 'Talent Sourcer': 'باحث عن الكفاءات',
  'Talent Acquisition Specialist': 'أخصائي استقطاب مواهب', 'Talent Acquisition Partner': 'شريك استقطاب مواهب',
  'Talent Acquisition Manager': 'مدير استقطاب مواهب', 'HR Specialist': 'أخصائي موارد بشرية',
  'HR Generalist': 'أخصائي موارد بشرية عام', 'HR Manager': 'مدير موارد بشرية', 'HR Business Partner': 'شريك أعمال الموارد البشرية',
  'Hiring Manager': 'مدير التوظيف', 'Head of Talent Acquisition': 'رئيس استقطاب المواهب', 'HR Director': 'مدير إدارة الموارد البشرية',
  Other: 'أخرى',
};

// Same limits the API enforces (backend/src/middlewares/validation.ts), so the
// form stops a too-long value before the server has to.
const MAX_LEN: Record<string, number> = {
  firstName: 80, lastName: 80, companyName: 160, jobTitleOther: 120,
};
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
 * nagm.io's unified sign-up / sign-in page with three account types.
 *
 * Signing in hands the session off to app.nagm.io. Choosing "Recruiter" or
 * "Company" only *requests* that access — the account is created as a normal
 * user until a Nagm admin approves it.
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
  // Briefly true right after a failed submit — drives the one-shot shake/glow on
  // every invalid field so a re-submit replays the effect instead of going stale.
  const [animatingErrors, setAnimatingErrors] = useState(false);
  const flashErrors = () => { setAnimatingErrors(true); setTimeout(() => setAnimatingErrors(false), 550); };
  const [remember, setRemember] = useState(true);
  // A recruiter joins an existing company, creates a new one, or works
  // independently (a freelance recruiter with no company yet).
  const [companyMode, setCompanyMode] = useState<'join' | 'create' | 'independent'>('join');
  const [companyQuery, setCompanyQuery] = useState('');
  const [companyResults, setCompanyResults] = useState<CompanyOption[]>([]);
  const [pickedCompany, setPickedCompany] = useState<CompanyOption | null>(null);
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [showPwd, setShowPwd] = useState<Record<string, boolean>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  // Forgot password flow
  const [forgotMode, setForgotMode] = useState<'none' | 'request' | 'reset'>('none');
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotOtp, setForgotOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
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
  // Where the app wants the person back after signing in (validated in appPathFor).
  const returnTo = queryParams.get('returnTo');

  const [values, setValues] = useState<Record<string, string>>({
    firstName: '', lastName: '',
    email: queryEmail,
    companyEmail: queryEmail,
    businessEmail: queryEmail,
    phone: '', password: '', confirmPassword: '', country: DEFAULT_COUNTRY,
    jobTitle: '', jobTitleOther: '', linkedInProfile: '', companyName: '', industry: '', companySize: '',
    websiteUrl: '',
  });

  // Pre-fill email and role if supplied via query params (e.g. from invite link)
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const emailParam = params.get('email');
    const roleParam = params.get('role') as AccountRole | null;
    if (emailParam) {
      setValues((v) => ({
        ...v,
        email: v.email || emailParam,
        companyEmail: v.companyEmail || emailParam,
        businessEmail: v.businessEmail || emailParam,
      }));
    }
    if (roleParam && ['candidate', 'recruiter', 'company'].includes(roleParam)) {
      setRole((r) => (r === 'candidate' ? roleParam : r));
    }
  }, [location.search]);

  // Debounced company lookup. The work email is sent too so a matching domain
  // surfaces the right company first ("sara@microsoft.com" -> Microsoft).
  useEffect(() => {
    if (role !== 'recruiter' || companyMode !== 'join' || pickedCompany) { setCompanyResults([]); return; }
    const q = companyQuery.trim();
    const email = values.companyEmail.trim();
    if (q.length < 2 && !email.includes('@')) { setCompanyResults([]); return; }
    let alive = true;
    const t = setTimeout(async () => {
      const r = await authApi.searchCompanies(q, email);
      if (alive) setCompanyResults(r.companies);
    }, 280);
    return () => { alive = false; clearTimeout(t); };
  }, [companyQuery, values.companyEmail, role, companyMode, pickedCompany]);

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
      case 'firstName': err = v ? tooLong(t.firstName) : t.firstNameRequired; break;
      case 'lastName': err = v ? tooLong(t.lastName) : t.lastNameRequired; break;
      case 'companyName': err = v ? tooLong(t.companyName) : t.companyNameRequired; break;
      case 'jobTitle': err = v ? '' : t.jobTitleRequired; break;
      case 'jobTitleOther': err = values.jobTitle === 'Other' && !v ? t.jobTitleOtherRequired : tooLong(t.jobTitle); break;
      // The join picker isn't a text field — validate the selection itself.
      case 'company': err = companyMode === 'join' && !pickedCompany ? t.chooseCompany : ''; break;
      case 'email': err = emailError(v, true, t.lang); break;
      // A recruiter's email may be a company address OR a personal one — a new
      // company often has no domain email yet, and freelance recruiters use a
      // personal address. So we only check the address is valid, not its domain.
      case 'companyEmail':
      case 'businessEmail':
        err = emailError(v, true, t.lang);
        break;
      // Phone is optional, but a number that IS typed must be one the server
      // accepts. It used to pass here unchecked ("123") and come back as a
      // server error after the whole form had been submitted.
      case 'phone': err = phoneError(v, values.country, false, t.lang); break;
      case 'linkedInProfile': err = linkIssue('linkedin', v) ? t.invalidLinkedIn : ''; break;
      case 'websiteUrl': err = linkIssue('website', v) ? t.invalidWebsite : ''; break;
      case 'password': err = passwordIssue(values.password, t); break;
      case 'confirmPassword':
        err = !v ? t.confirmRequired : v !== values.password ? t.passwordsDontMatch : '';
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
    // Cap the phone number to the selected country's digit count, digits only.
    if (name === 'phone') {
      const max = COUNTRY_PHONE_MAX[values.country] ?? 15;
      value = value.replace(/\D/g, '').slice(0, max);
    }
    setValues((p) => ({ ...p, [name]: value }));
    if (touched[name]) validateField(name, value);
    // The phone rule depends on the country: re-check a typed number when it changes.
    if (name === 'country' && touched.phone) {
      setErrors((p) => ({ ...p, phone: phoneError(values.phone, value, false, t.lang) }));
    }
  };
  const handleBlur = (name: string) => {
    setTouched((p) => ({ ...p, [name]: true }));
    validateField(name);
  };

  // In on-screen order, so the first failing one is the first the user sees.
  const signupFields = (): string[] => {
    switch (role) {
      case 'candidate': return ['firstName', 'lastName', 'email', 'phone', 'password', 'confirmPassword'];
      case 'recruiter': return [
        'firstName', 'lastName', 'companyEmail',
        // Independent (freelancer) recruiters have no company to validate.
        ...(companyMode === 'join' ? ['company'] : companyMode === 'create' ? ['companyName'] : []),
        'phone', 'jobTitle',
        ...(values.jobTitle === 'Other' ? ['jobTitleOther'] : []),
        'linkedInProfile', 'password', 'confirmPassword',
      ];
      case 'company': return ['companyName', 'firstName', 'lastName', 'businessEmail', 'phone', 'password', 'confirmPassword'];
    }
  };

  /** Focus a field of THIS form on the next frame; a no-op once the form is gone. */
  const focusInForm = (id: string) =>
    requestAnimationFrame(() => formRef.current?.querySelector<HTMLElement>(`#${id}`)?.focus());

  /** Move focus to the first invalid field so keyboard and screen-reader users land on the problem. */
  const focusFirstInvalid = (fields: string[], errs: Record<string, string>) => {
    const first = fields.find((f) => errs[f]);
    const id = first === 'company' ? 'company-search-input' : first === 'jobTitle' ? null : first;
    requestAnimationFrame(() => {
      const el = id
        ? formRef.current?.querySelector<HTMLElement>(`#${id}`)
        : formRef.current?.querySelector<HTMLElement>('[aria-invalid="true"]');
      el?.focus();
    });
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
    else if (authMode === 'signup' && !acceptTerms) focusInForm('accept-terms');
    return fieldsOk && (authMode !== 'signup' || acceptTerms);
  };

  const emailForRole = () =>
    role === 'candidate' ? values.email.trim()
      : role === 'recruiter' ? values.companyEmail.trim()
        : values.businessEmail.trim();

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Enter pressed again (or a double click) while a request is in flight.
    if (busy) return;
    setError(''); setSuccessMsg('');
    if (!isValid()) {
      if (authMode === 'signup' && !acceptTerms) setError(t.acceptTerms);
      flashErrors();
      return;
    }
    setBusy(true);

    if (authMode === 'signup') {
      const email = emailForRole();
      const payload: RegisterPayload = { role, email, password: values.password, country: values.country };
      if (role === 'candidate') {
        payload.firstName = values.firstName.trim();
        payload.lastName = values.lastName.trim();
        if (values.phone.trim()) payload.phone = normalizePhone(values.phone, values.country);
      } else if (role === 'recruiter') {
        payload.firstName = values.firstName.trim();
        payload.lastName = values.lastName.trim();
        if (values.phone.trim()) payload.phone = normalizePhone(values.phone, values.country);
        payload.jobTitle = (values.jobTitle === 'Other' ? values.jobTitleOther : values.jobTitle).trim();
        payload.linkedInProfile = values.linkedInProfile.trim();
        // Joining sends the chosen company's id (a request their admin approves);
        // creating sends the new company's details and makes them its owner;
        // independent (freelancer) sends no company at all.
        if (companyMode === 'join' && pickedCompany) {
          payload.joinCompanyId = pickedCompany.id;
          payload.companyName = pickedCompany.name;
        } else if (companyMode === 'create') {
          payload.companyName = values.companyName.trim();
          if (values.websiteUrl.trim()) payload.websiteUrl = values.websiteUrl.trim();
        }
      } else {
        payload.companyName = values.companyName.trim();
        if (values.firstName.trim()) payload.firstName = values.firstName.trim();
        if (values.lastName.trim()) payload.lastName = values.lastName.trim();
        if (values.phone.trim()) payload.phone = normalizePhone(values.phone, values.country);
        payload.industry = values.industry;
        payload.companySize = values.companySize;
        if (values.websiteUrl.trim()) payload.websiteUrl = values.websiteUrl.trim();
      }
      try {
        await authApi.register(payload);
        // Registration sends an OTP; verify it, then we auto-sign-in and hand off.
        // The password stays in memory for that sign-in — never in history.state,
        // which the browser keeps (and restores) with the page history.
        rememberPendingSignIn(email, values.password);
        navigate('/verify', { state: { email, rememberMe: true, returnTo } });
      } catch (e2) {
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
    opts?: { type?: string; placeholder?: string; required?: boolean; autoComplete?: string; icon?: React.ReactNode; inputMode?: React.HTMLAttributes<HTMLInputElement>['inputMode'] },
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
      {errorText(name)}
    </div>
  );

  const countrySelect = () => (
    <div style={{ marginBottom: 16 }}>
      <SelectDropdown
        value={values.country || DEFAULT_COUNTRY}
        onChange={(v) => handleChange('country', v)}
        options={COUNTRY_OPTIONS.map((c) => ({
          value: c,
          label: `${t.isAr ? COUNTRY_NAMES_AR[c] || c : c} ${COUNTRY_CODES[c] || ''}`,
        }))}
        label={t.country}
        required
      />
    </div>
  );

  // Country and phone sit side by side — the country's dial code frames the number.
  const countryPhoneRow = () => (
    <div className="ng-field-pair" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, alignItems: 'start' }}>
      {countrySelect()}
      {field('phone', t.phone, { type: 'tel', placeholder: phoneExample(values.country), required: false, autoComplete: 'tel', inputMode: 'tel' })}
    </div>
  );

  const termsInvalid = !acceptTerms && error === t.acceptTerms;
  const terms = () => (
    <label className="ng-check" style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', fontSize: 13, color: 'var(--ink2)', marginBottom: 16 }}>
      <span style={{ position: 'relative', width: 18, height: 18, flexShrink: 0 }}>
        <input
          id="accept-terms"
          type="checkbox" checked={acceptTerms}
          onChange={(e) => { setAcceptTerms(e.target.checked); if (e.target.checked && error === t.acceptTerms) setError(''); }}
          aria-invalid={termsInvalid || undefined}
          aria-describedby={termsInvalid ? 'form-error' : undefined}
          style={{ position: 'absolute', inset: 0, margin: 0, opacity: 0, cursor: 'pointer', zIndex: 1 }}
        />
        <span aria-hidden="true" style={{
          position: 'absolute', inset: 0, borderRadius: 5,
          border: `2px solid ${acceptTerms ? 'var(--brand)' : termsInvalid ? 'var(--danger)' : 'var(--line)'}`,
          background: acceptTerms ? 'var(--brand)' : 'transparent',
          display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all .15s',
        }}>
          {acceptTerms && (
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          )}
        </span>
      </span>
      <span>
        {t.termsPrefix}<span style={{ color: 'var(--brand)', fontWeight: 600 }}>{t.terms}</span>{t.termsAnd}<span style={{ color: 'var(--brand)', fontWeight: 600 }}>{t.privacy}</span>
      </span>
    </label>
  );

  const approvalNote = () => (
    <div style={{
      display: 'flex', gap: 8, alignItems: 'flex-start', padding: '10px 12px', borderRadius: 10,
      background: 'var(--brandSoft)', border: '1px solid var(--brandBorder)', marginBottom: 16,
      fontSize: 12.5, color: 'var(--ink2)', lineHeight: 1.45,
    }}>
      <Check size={15} aria-hidden="true" style={{ color: 'var(--brand)', flexShrink: 0, marginTop: 1 }} />
      {/* There is no human review step any more — a company goes live the moment
          it registers. Promising an approval that never comes left people
          waiting for an email that was never going to arrive. */}
      <span>{role === 'company' ? t.approvalCompany : t.approvalRecruiter}</span>
    </div>
  );

  const candidateForm = () => (
    <>
      <div className="ng-field-pair" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        {field('firstName', t.firstName, { autoComplete: 'given-name', placeholder: t.isAr ? 'سارة' : 'Sara' })}
        {field('lastName', t.lastName, { autoComplete: 'family-name', placeholder: t.isAr ? 'منصور' : 'Mansour' })}
      </div>
      {field('email', t.email, { type: 'email', placeholder: 'you@example.com', autoComplete: 'email', icon: <Mail size={15} /> })}
      {countryPhoneRow()}
      {passwordField('password', t.password, 'new-password')}
      {passwordField('confirmPassword', t.confirmPassword, 'new-password')}
      {terms()}
    </>
  );

  const companyModes = [
    ['join', t.joinExisting, Building2],
    ['create', t.createNew, Briefcase],
    ['independent', t.independent, User],
  ] as const;

  const recruiterForm = () => (
    <>
      {approvalNote()}
      <div className="ng-field-pair" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        {field('firstName', t.firstName, { autoComplete: 'given-name' })}
        {field('lastName', t.lastName, { autoComplete: 'family-name' })}
      </div>
      {field('companyEmail', t.email, { type: 'email', placeholder: 'you@company.com', autoComplete: 'email', icon: <Mail size={15} /> })}

      {/* A recruiter joins an existing company, creates one (never a duplicate),
          or works independently as a freelance recruiter with no company. */}
      <div style={{ marginBottom: 16 }}>
        <div id="company-mode-label" style={{ fontSize: 13, fontWeight: 600, color: 'var(--ink2)', display: 'block', marginBottom: 6 }}>
          {t.yourCompany}
        </div>
        <div role="radiogroup" aria-labelledby="company-mode-label" className="ng-company-modes" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, marginBottom: 12 }}>
          {companyModes.map(([val, label, Icon]) => {
            const active = companyMode === val;
            return (
              <button
                key={val}
                type="button"
                role="radio"
                aria-checked={active}
                onClick={() => { setCompanyMode(val); setErrors((p) => ({ ...p, company: '', companyName: '' })); }}
                className="ng-role-tab"
                style={{
                  display: 'flex', alignItems: 'center', gap: 8, padding: '11px 12px', borderRadius: 12,
                  border: `1.5px solid ${active ? 'var(--brand)' : 'var(--line)'}`,
                  background: active ? 'var(--brandSoft)' : 'var(--panel)',
                  color: active ? 'var(--brandInk)' : 'var(--ink2)',
                  fontFamily: 'inherit', fontSize: 13.5, fontWeight: 600, cursor: 'pointer', minWidth: 0,
                  transition: 'border-color .15s, background .15s, color .15s',
                }}
              >
                <Icon size={15} aria-hidden="true" style={{ flexShrink: 0 }} /> <span style={{ minWidth: 0 }}>{label}</span>
              </button>
            );
          })}
        </div>

        {companyMode === 'join' ? (
          <>
            <div style={{ position: 'relative' }}>
              <Search size={15} aria-hidden="true" style={{ position: 'absolute', insetInlineStart: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--ink3)', pointerEvents: 'none', zIndex: 1 }} />
              <label htmlFor="company-search-input" className="sr-only">{t.searchCompanies}</label>
              <input
                id="company-search-input"
                dir="auto"
                value={companyQuery}
                onChange={(e) => { setCompanyQuery(e.target.value); setPickedCompany(null); }}
                placeholder={t.searchCompaniesPlaceholder}
                aria-invalid={showErr('company') || undefined}
                aria-describedby={showErr('company') ? errId('company') : undefined}
                className="ng-auth-field"
                style={inputStyle('company', { paddingBlock: 0, ...pad(38, 14) })}
              />
            </div>

            {pickedCompany ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: 9, marginTop: 8, padding: '10px 12px', borderRadius: 10, background: 'var(--brandSoft)', border: '1px solid var(--brandBorder)' }}>
                <Check size={15} aria-hidden="true" style={{ color: 'var(--brand)', flexShrink: 0 }} />
                <bdi style={{ fontSize: 13.5, fontWeight: 700, color: 'var(--ink)', flex: 1 }}>{pickedCompany.name}</bdi>
                <button type="button" onClick={() => { setPickedCompany(null); setCompanyQuery(''); }} style={{ border: 'none', background: 'none', color: 'var(--ink3)', cursor: 'pointer', fontSize: 12.5 }}>{t.change}</button>
              </div>
            ) : companyResults.length > 0 ? (
              <div className="ng-dropdown-list" style={{ marginTop: 8, borderRadius: 10, border: '1px solid var(--line)', background: 'var(--panel)', maxHeight: 190, overflowY: 'auto' }}>
                {companyResults.map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => { setPickedCompany(c); setCompanyQuery(c.name); setErrors((p) => ({ ...p, company: '' })); }}
                    style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%', padding: '10px 12px', border: 'none', background: 'transparent', color: 'var(--ink)', fontFamily: 'inherit', fontSize: 13.5, textAlign: 'start', cursor: 'pointer' }}
                  >
                    <Building2 size={14} aria-hidden="true" style={{ color: 'var(--ink3)', flexShrink: 0 }} />
                    <bdi style={{ flex: 1 }}>{c.name}</bdi>
                    {c.verified && <Check size={13} aria-label={t.isAr ? 'موثّقة' : 'Verified'} style={{ color: 'var(--ok)' }} />}
                  </button>
                ))}
              </div>
            ) : companyQuery.trim().length > 1 ? (
              <p style={{ fontSize: 12.5, color: 'var(--ink3)', margin: '8px 0 0' }}>{t.noCompanyMatch}</p>
            ) : null}

            {pickedCompany && (
              <p style={{ fontSize: 12, color: 'var(--ink3)', margin: '8px 0 0' }}>{t.joinNote(pickedCompany.name)}</p>
            )}
            {errorText('company')}
          </>
        ) : companyMode === 'create' ? (
          <>
            {field('companyName', t.companyName, { placeholder: 'Acme Corp', icon: <Building2 size={15} /> })}
            <p style={{ fontSize: 12, color: 'var(--ink3)', margin: 0 }}>{t.ownerNote}</p>
          </>
        ) : (
          <p style={{ fontSize: 12.5, color: 'var(--ink3)', margin: 0, lineHeight: 1.5 }}>{t.independentNote}</p>
        )}
      </div>
      {countryPhoneRow()}
      <div style={{ marginBottom: 16 }}>
        <SelectDropdown
          value={values.jobTitle}
          onChange={(v) => { handleChange('jobTitle', v); setTouched((p) => ({ ...p, jobTitle: true })); validateField('jobTitle', v); }}
          options={JOB_TITLES.map((j) => ({ value: j, label: t.isAr ? JOB_TITLES_AR[j] || j : j }))}
          placeholder={t.selectJobTitle}
          label={t.jobTitle}
          required
          error={errors.jobTitle}
          touched={touched.jobTitle}
        />
      </div>
      {values.jobTitle === 'Other' && field('jobTitleOther', t.jobTitleOther, { placeholder: t.isAr ? 'مثل: نائب رئيس المواهب' : 'e.g. VP of Talent', icon: <Briefcase size={15} /> })}
      {field('linkedInProfile', t.linkedIn, { type: 'url', placeholder: 'linkedin.com/in/yourprofile', required: false, icon: <Globe size={15} /> })}
      {passwordField('password', t.password, 'new-password')}
      {passwordField('confirmPassword', t.confirmPassword, 'new-password')}
      {terms()}
    </>
  );

  const companyForm = () => (
    <>
      {approvalNote()}
      {field('companyName', t.companyName, { placeholder: t.isAr ? 'مثال: شركة تاي ابس' : 'Acme Corp', icon: <Building2 size={15} /> })}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12 }}>
        {field('firstName', t.isAr ? 'الاسم الأول (المسؤول)' : 'First Name (Admin)', { autoComplete: 'given-name', placeholder: t.isAr ? 'محمود' : 'John' })}
        {field('lastName', t.isAr ? 'اسم العائلة' : 'Last Name', { autoComplete: 'family-name', placeholder: t.isAr ? 'هاشم' : 'Doe' })}
      </div>
      {field('businessEmail', t.businessEmail, { type: 'email', placeholder: 'hello@company.com', autoComplete: 'email', icon: <Mail size={15} /> })}
      {countryPhoneRow()}
      {passwordField('password', t.password, 'new-password')}
      {passwordField('confirmPassword', t.confirmPassword, 'new-password')}
      {terms()}
    </>
  );

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
      setConfirmNewPassword('');
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
    if (newPassword !== confirmNewPassword) {
      setForgotErr(t.passwordsDontMatch);
      focusInForm('reset-confirm-password');
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
      setConfirmNewPassword('');
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

          <div>
            <label htmlFor="reset-confirm-password" style={labelStyle}>{t.confirmNewPassword}</label>
            <div style={{ position: 'relative' }}>
              <input
                id="reset-confirm-password"
                name="confirm-new-password"
                type={showPwd['resetConfirmPassword'] ? 'text' : 'password'}
                dir="ltr"
                value={confirmNewPassword}
                onChange={(e) => setConfirmNewPassword(e.target.value)}
                autoComplete="new-password"
                placeholder={t.confirmNewPasswordPlaceholder}
                required
                className="ng-auth-field"
                style={{ ...plainInput, ...pad(14, 42), textAlign: t.isAr ? 'right' : undefined }}
              />
              {eyeButton('resetConfirmPassword')}
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
          setConfirmNewPassword('');
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
                setConfirmNewPassword('');
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

  const roleLabel = role === 'candidate' ? t.roleCandidate : role === 'recruiter' ? t.roleRecruiter : t.roleCompany;
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

      {authMode === 'signup' && (
        <>
          <p style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: t.isAr ? 0 : '.06em', color: 'var(--ink3)', margin: '4px 0 12px' }}>
            {t.chooseAccountType}
          </p>
          <RoleCards selected={role} onSelect={switchRole} />
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
            {authMode === 'login' ? loginForm()
              : role === 'candidate' ? candidateForm()
                : role === 'recruiter' ? recruiterForm()
                  : companyForm()}

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
                  : <>{authMode === 'signup' ? t.createAccount(roleLabel) : t.signIn} <ForwardArrow size={17} aria-hidden="true" /></>}
              </button>
            )}
          </form>
        </div>
      </div>
    </AuthShell>
  );
};

export default AuthPage;
