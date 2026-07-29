import React, { useState, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Building2, Briefcase, Check, Eye, EyeOff, Mail, ArrowRight, Globe } from 'lucide-react';
import AuthShell from './AuthShell';
import RoleCards from '../components/auth/RoleCards';
import SelectDropdown from '../components/auth/SelectDropdown';
import { authApi, handoffToApp, apiError } from '../auth';
import type { AccountRole, RegisterPayload } from '../auth';
import { emailError, emailSuggestion, phoneError, phoneExample, normalizePhone } from '../utils/contact';

type AuthMode = 'signup' | 'login';

const INDUSTRIES = [
  'Technology', 'Healthcare', 'Finance', 'Education', 'Consulting',
  'E-commerce', 'Manufacturing', 'Media', 'Real Estate', 'Energy',
  'Telecommunications', 'Transportation', 'Hospitality', 'Retail', 'Other',
];

const COMPANY_SIZES = ['1-10', '11-50', '51-200', '201-500', '501-1000', '1000+'];

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

const PERSONAL_DOMAINS = [
  'gmail.com', 'yahoo.com', 'outlook.com', 'hotmail.com', 'live.com',
  'icloud.com', 'mail.com', 'protonmail.com', 'aol.com', 'zoho.com',
  'yandex.com', 'gmx.com', 'fastmail.com', 'tutanota.com',
];


/** Mirrors the backend policy: 8+ chars and at least 3 of the 4 character classes. */
function passwordIssue(pw: string): string {
  if (!pw) return 'Password is required';
  if (pw.length < 8) return 'Password must be at least 8 characters';
  const classes = [/[A-Z]/, /[a-z]/, /[0-9]/, /[^A-Za-z0-9]/].filter((re) => re.test(pw)).length;
  if (classes < 3) return 'Include at least 3 of: uppercase, lowercase, number, symbol';
  return '';
}

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

  const initialMode: AuthMode = location.pathname === '/login' ? 'login' : 'signup';
  const [authMode, setAuthMode] = useState<AuthMode>(initialMode);
  const preset = (location.state as { role?: AccountRole } | null)?.role;
  const [role, setRole] = useState<AccountRole>(
    preset === 'recruiter' || preset === 'company' ? preset : 'candidate',
  );

  const [transitioning, setTransitioning] = useState(false);
  const [transitionDir, setTransitionDir] = useState<'left' | 'right'>('right');
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [busy, setBusy] = useState(false);
  const [remember, setRemember] = useState(true);
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [showPwd, setShowPwd] = useState<Record<string, boolean>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const [values, setValues] = useState<Record<string, string>>({
    firstName: '', lastName: '', email: '', companyEmail: '', businessEmail: '',
    phone: '', password: '', confirmPassword: '', country: DEFAULT_COUNTRY,
    jobTitle: '', jobTitleOther: '', linkedInProfile: '', companyName: '', industry: '', companySize: '',
    websiteUrl: '',
  });

  const switchMode = useCallback((mode: AuthMode) => {
    if (mode === authMode || transitioning) return;
    setTransitionDir(mode === 'signup' ? 'right' : 'left');
    setTransitioning(true);
    setTimeout(() => {
      setAuthMode(mode);
      setError(''); setSuccessMsg(''); setErrors({}); setTouched({});
      setTransitioning(false);
      navigate(mode === 'signup' ? '/register' : '/login', { replace: true });
    }, 150);
  }, [authMode, transitioning, navigate]);

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
    let err = '';
    switch (name) {
      case 'firstName': err = v ? '' : 'First name is required'; break;
      case 'lastName': err = v ? '' : 'Last name is required'; break;
      case 'companyName': err = v ? '' : 'Company name is required'; break;
      case 'jobTitle': err = v ? '' : 'Job title is required'; break;
      case 'jobTitleOther': err = values.jobTitle === 'Other' && !v ? 'Please specify your job title' : ''; break;
      case 'email': err = emailError(v); break;
      case 'companyEmail':
      case 'businessEmail':
        err = emailError(v);
        if (!err && PERSONAL_DOMAINS.includes(v.split('@')[1]?.toLowerCase())) {
          err = 'Please use your company email, not a personal address';
        }
        break;
      // Phone is optional for a candidate but required for hiring accounts —
      // recruiters get called back on it.
      case 'phone': err = phoneError(v, values.country, role !== 'candidate'); break;
      case 'linkedInProfile': err = v && !v.includes('linkedin.com') ? 'Enter a valid LinkedIn URL' : ''; break;
      case 'websiteUrl': err = v && !/^https?:\/\/.+\..+/.test(v) ? 'Invalid URL' : ''; break;
      case 'password': err = passwordIssue(values.password); break;
      case 'confirmPassword':
        err = !v ? 'Please confirm your password' : v !== values.password ? 'Passwords do not match' : '';
        break;
    }
    setErrors((p) => ({ ...p, [name]: err }));
    return err;
  };

  const handleChange = (name: string, value: string) => {
    // Cap the phone number to the selected country's digit count, digits only.
    if (name === 'phone') {
      const max = COUNTRY_PHONE_MAX[values.country] ?? 15;
      value = value.replace(/\D/g, '').slice(0, max);
    }
    setValues((p) => ({ ...p, [name]: value }));
    if (touched[name]) validateField(name, value);
  };
  const handleBlur = (name: string) => {
    setTouched((p) => ({ ...p, [name]: true }));
    validateField(name);
  };

  const signupFields = (): string[] => {
    switch (role) {
      case 'candidate': return ['firstName', 'lastName', 'email', 'password', 'confirmPassword'];
      case 'recruiter': return ['firstName', 'lastName', 'companyEmail', 'phone', 'jobTitle', ...(values.jobTitle === 'Other' ? ['jobTitleOther'] : []), 'linkedInProfile', 'password', 'confirmPassword'];
      case 'company': return ['companyName', 'businessEmail', 'phone', 'password', 'confirmPassword'];
    }
  };

  const isValid = (): boolean => {
    const fields = authMode === 'signup' ? signupFields() : ['email', 'password'];
    let ok = true;
    fields.forEach((f) => { if (validateField(f)) ok = false; });
    setTouched((p) => {
      const next = { ...p };
      fields.forEach((f) => { next[f] = true; });
      return next;
    });
    if (authMode === 'signup' && !acceptTerms) ok = false;
    return ok;
  };

  const emailForRole = () =>
    role === 'candidate' ? values.email.trim()
      : role === 'recruiter' ? values.companyEmail.trim()
        : values.businessEmail.trim();

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(''); setSuccessMsg('');
    if (!isValid()) {
      if (authMode === 'signup' && !acceptTerms) setError('Please accept the Terms of Service to continue.');
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
        payload.phone = normalizePhone(values.phone, values.country);
        payload.jobTitle = (values.jobTitle === 'Other' ? values.jobTitleOther : values.jobTitle).trim();
        payload.linkedInProfile = values.linkedInProfile.trim();
      } else {
        payload.companyName = values.companyName.trim();
        payload.phone = normalizePhone(values.phone, values.country);
        payload.industry = values.industry;
        payload.companySize = values.companySize;
        if (values.websiteUrl.trim()) payload.websiteUrl = values.websiteUrl.trim();
      }
      try {
        await authApi.register(payload);
        // Registration sends an OTP; verify it, then we auto-sign-in and hand off.
        navigate('/verify', { state: { email, password: values.password, rememberMe: true } });
      } catch (e2) {
        setError(apiError(e2, 'Could not create your account.'));
        setBusy(false);
      }
      return;
    }

    // Sign in — the server decides the account's real role.
    try {
      const t = await authApi.login(values.email.trim(), values.password, remember);
      await handoffToApp(t, remember); // → app.nagm.io, already signed in
    } catch (e2: any) {
      const resp = e2?.response;
      // The backend signals "email not verified" via HTTP 403 — route into the
      // verify flow instead of showing a dead-end error.
      if (resp?.status === 403 && resp?.data?.requiresVerification) {
        navigate('/verify', { state: { email: values.email.trim(), password: values.password, rememberMe: remember } });
        return;
      }
      setError(apiError(e2, 'Could not sign you in. Check your email and password.'));
      setBusy(false);
    }
  };

  const togglePwd = (k: string) => setShowPwd((p) => ({ ...p, [k]: !p[k] }));

  const field = (
    name: string,
    label: string,
    opts?: { type?: string; placeholder?: string; required?: boolean; autoComplete?: string; icon?: React.ReactNode },
  ) => (
    <div style={{ marginBottom: 16 }}>
      <label htmlFor={name} style={{ fontSize: 13, fontWeight: 600, color: 'var(--ink2)', display: 'block', marginBottom: 4 }}>
        {label}{opts?.required !== false ? ' *' : ''}
      </label>
      <div style={{ position: 'relative' }}>
        {opts?.icon && (
          <div style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--ink3)', pointerEvents: 'none', zIndex: 1 }}>
            {opts.icon}
          </div>
        )}
        <input
          id={name}
          type={opts?.type || 'text'}
          value={values[name] || ''}
          placeholder={opts?.placeholder}
          autoComplete={opts?.autoComplete}
          onChange={(e) => handleChange(name, e.target.value)}
          onBlur={() => handleBlur(name)}
          className="ng-auth-field"
          style={{
            width: '100%', height: 46, borderRadius: 12, fontSize: 14, fontFamily: 'inherit',
            border: `1px solid ${errors[name] && touched[name] ? 'var(--danger)' : 'var(--line)'}`,
            background: 'var(--panel)', color: 'var(--ink)', outline: 'none',
            padding: opts?.icon ? '0 14px 0 38px' : '0 14px',
            marginTop: 0,
            boxShadow: errors[name] && touched[name] ? '0 0 0 3px var(--dangerSoft)' : 'none',
            transition: 'border-color .15s, box-shadow .15s',
          }}
        />
      </div>
      {errors[name] && touched[name] && (
        <div style={{ fontSize: 12, color: 'var(--danger)', marginTop: 4 }}>{errors[name]}</div>
      )}
      {/* Catch the classic "@gmial.com" slip — one tap fixes it. */}
      {opts?.type === 'email' && !errors[name] && emailSuggestion(values[name] || '') && (
        <div style={{ fontSize: 12, color: 'var(--ink2)', marginTop: 4 }}>
          Did you mean{' '}
          <button
            type="button"
            onClick={() => { handleChange(name, emailSuggestion(values[name] || '')!); setTouched((p) => ({ ...p, [name]: true })); }}
            style={{ border: 'none', background: 'none', padding: 0, font: 'inherit', color: 'var(--brandInk)', fontWeight: 700, cursor: 'pointer' }}
          >
            {emailSuggestion(values[name] || '')}
          </button>
          ?
        </div>
      )}
    </div>
  );

  const passwordField = (name: string, label: string, autoComplete: string) => (
    <div style={{ marginBottom: 16 }}>
      <label htmlFor={name} style={{ fontSize: 13, fontWeight: 600, color: 'var(--ink2)', display: 'block', marginBottom: 4 }}>{label} *</label>
      <div style={{ position: 'relative' }}>
        <input
          id={name}
          type={showPwd[name] ? 'text' : 'password'}
          value={values[name] || ''}
          autoComplete={autoComplete}
          onChange={(e) => handleChange(name, e.target.value)}
          onBlur={() => handleBlur(name)}
          className="ng-auth-field"
          style={{
            width: '100%', height: 46, borderRadius: 12, fontSize: 14, fontFamily: 'inherit',
            border: `1px solid ${errors[name] && touched[name] ? 'var(--danger)' : 'var(--line)'}`,
            background: 'var(--panel)', color: 'var(--ink)', outline: 'none',
            padding: '0 42px 0 14px', marginTop: 0,
            boxShadow: errors[name] && touched[name] ? '0 0 0 3px var(--dangerSoft)' : 'none',
            transition: 'border-color .15s, box-shadow .15s',
          }}
        />
        <button
          type="button" tabIndex={-1} aria-label={showPwd[name] ? 'Hide password' : 'Show password'}
          onClick={() => togglePwd(name)}
          style={{
            position: 'absolute', top: 0, bottom: 0, right: 6, margin: 'auto', height: 30, width: 30,
            display: 'flex', alignItems: 'center', justifyContent: 'center', border: 'none',
            background: 'transparent', color: 'var(--ink3)', cursor: 'pointer', borderRadius: 7,
          }}
        >
          {showPwd[name] ? <EyeOff size={16} /> : <Eye size={16} />}
        </button>
      </div>
      {errors[name] && touched[name] && (
        <div style={{ fontSize: 12, color: 'var(--danger)', marginTop: 4 }}>{errors[name]}</div>
      )}
    </div>
  );

  const countrySelect = () => (
    <div style={{ marginBottom: 16 }}>
      <SelectDropdown
        value={values.country || DEFAULT_COUNTRY}
        onChange={(v) => handleChange('country', v)}
        options={COUNTRY_OPTIONS.map((c) => ({ value: c, label: `${c} ${COUNTRY_CODES[c] || ''}` }))}
        label="Country"
        required
      />
    </div>
  );

  const terms = () => (
    <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', fontSize: 13, color: 'var(--ink2)', marginBottom: 16 }}>
      <span style={{ position: 'relative', width: 18, height: 18, flexShrink: 0 }}>
        <input
          type="checkbox" checked={acceptTerms} onChange={(e) => setAcceptTerms(e.target.checked)}
          style={{ position: 'absolute', inset: 0, margin: 0, opacity: 0, cursor: 'pointer', zIndex: 1 }}
        />
        <span style={{
          position: 'absolute', inset: 0, borderRadius: 5,
          border: `2px solid ${acceptTerms ? 'var(--brand)' : 'var(--line)'}`,
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
      I accept the <span style={{ color: 'var(--brand)', fontWeight: 600 }}>Terms of Service</span> and <span style={{ color: 'var(--brand)', fontWeight: 600 }}>Privacy Policy</span>
    </label>
  );

  const approvalNote = () => (
    <div style={{
      display: 'flex', gap: 8, alignItems: 'flex-start', padding: '10px 12px', borderRadius: 10,
      background: 'var(--brandSoft)', border: '1px solid var(--brandBorder)', marginBottom: 16,
      fontSize: 12.5, color: 'var(--ink2)', lineHeight: 1.45,
    }}>
      <Check size={15} style={{ color: 'var(--brand)', flexShrink: 0, marginTop: 1 }} />
      <span>A Nagm admin reviews hiring accounts before they can access candidate profiles. You can sign in as soon as your email is verified.</span>
    </div>
  );

  const candidateForm = () => (
    <>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        {field('firstName', 'First Name', { autoComplete: 'given-name', placeholder: 'Sara' })}
        {field('lastName', 'Last Name', { autoComplete: 'family-name', placeholder: 'Mansour' })}
      </div>
      {field('email', 'Email', { type: 'email', placeholder: 'you@example.com', autoComplete: 'email', icon: <Mail size={15} /> })}
      {field('phone', 'Phone Number', { type: 'tel', placeholder: phoneExample(values.country), required: false, autoComplete: 'tel' })}
      {countrySelect()}
      {passwordField('password', 'Password', 'new-password')}
      {passwordField('confirmPassword', 'Confirm Password', 'new-password')}
      {terms()}
    </>
  );

  const recruiterForm = () => (
    <>
      {approvalNote()}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        {field('firstName', 'First Name', { autoComplete: 'given-name' })}
        {field('lastName', 'Last Name', { autoComplete: 'family-name' })}
      </div>
      {field('companyEmail', 'Company Email', { type: 'email', placeholder: 'you@company.com', autoComplete: 'email', icon: <Mail size={15} /> })}
      {field('phone', 'Phone Number', { type: 'tel', placeholder: phoneExample(values.country), autoComplete: 'tel' })}
      <div style={{ marginBottom: 16 }}>
        <SelectDropdown
          value={values.jobTitle}
          onChange={(v) => { handleChange('jobTitle', v); setTouched((p) => ({ ...p, jobTitle: true })); }}
          options={JOB_TITLES}
          placeholder="Select your job title"
          label="Job Title"
          required
        />
        {errors.jobTitle && touched.jobTitle && (
          <div style={{ fontSize: 12, color: 'var(--danger)', marginTop: 4 }}>{errors.jobTitle}</div>
        )}
      </div>
      {values.jobTitle === 'Other' && field('jobTitleOther', 'Please specify your job title', { placeholder: 'e.g. VP of Talent', icon: <Briefcase size={15} /> })}
      {field('linkedInProfile', 'LinkedIn Profile', { type: 'url', placeholder: 'https://linkedin.com/in/yourprofile', required: false, icon: <Globe size={15} /> })}
      {countrySelect()}
      {passwordField('password', 'Password', 'new-password')}
      {passwordField('confirmPassword', 'Confirm Password', 'new-password')}
      {terms()}
    </>
  );

  const companyForm = () => (
    <>
      {approvalNote()}
      {field('companyName', 'Company Name', { placeholder: 'Acme Corp', icon: <Building2 size={15} /> })}
      {field('businessEmail', 'Business Email', { type: 'email', placeholder: 'hello@company.com', autoComplete: 'email', icon: <Mail size={15} /> })}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
        <SelectDropdown
          value={values.industry} onChange={(v) => handleChange('industry', v)}
          options={INDUSTRIES} placeholder="Select Industry" label="Industry" required={false}
        />
        <SelectDropdown
          value={values.companySize} onChange={(v) => handleChange('companySize', v)}
          options={COMPANY_SIZES} placeholder="Select Size" label="Company Size" required={false}
        />
      </div>
      {field('websiteUrl', 'Website', { type: 'url', placeholder: 'https://company.com', required: false, icon: <Globe size={15} /> })}
      {countrySelect()}
      {field('phone', 'Phone Number', { type: 'tel', placeholder: phoneExample(values.country), autoComplete: 'tel' })}
      {passwordField('password', 'Password', 'new-password')}
      {passwordField('confirmPassword', 'Confirm Password', 'new-password')}
      {terms()}
    </>
  );

  const loginForm = () => (
    <>
      {field('email', 'Email', { type: 'email', placeholder: 'you@example.com', autoComplete: 'email', icon: <Mail size={15} /> })}
      {passwordField('password', 'Password', 'current-password')}
      <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13.5, color: 'var(--ink2)', fontWeight: 500, marginBottom: 16, cursor: 'pointer' }}>
        <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} style={{ width: 16, height: 16, accentColor: 'var(--brand)' }} />
        Keep me signed in for 30 days
      </label>
    </>
  );

  const roleLabel = role === 'candidate' ? 'Candidate' : role === 'recruiter' ? 'Recruiter' : 'Company';

  return (
    <AuthShell
      title={authMode === 'signup' ? 'Create your account' : 'Welcome back'}
      subtitle={authMode === 'signup'
        ? 'Verify your email with a one-time code and get started.'
        : 'Sign in to continue to your Nagm dashboard.'}
      footer={
        authMode === 'signup' ? (
          <>Already have an account?{' '}
            <span onClick={() => switchMode('login')} role="button" tabIndex={0}
              onKeyDown={(e) => { if (e.key === 'Enter') switchMode('login'); }}
              style={{ color: 'var(--brandInk)', fontWeight: 700, cursor: 'pointer' }}>Sign in</span>
          </>
        ) : (
          <>Don't have an account?{' '}
            <span onClick={() => switchMode('signup')} role="button" tabIndex={0}
              onKeyDown={(e) => { if (e.key === 'Enter') switchMode('signup'); }}
              style={{ color: 'var(--brandInk)', fontWeight: 700, cursor: 'pointer' }}>Create one</span>
          </>
        )
      }
    >
      {/* Sign Up / Log In tabs */}
      <div role="tablist" aria-label="Authentication mode" style={{ display: 'flex', background: 'var(--hover)', borderRadius: 12, padding: 4, marginBottom: 22 }}>
        {(['signup', 'login'] as AuthMode[]).map((mode) => (
          <button
            key={mode} type="button" role="tab" aria-selected={authMode === mode}
            onClick={() => switchMode(mode)}
            style={{
              flex: 1, padding: '10px 0', border: 'none', borderRadius: 10,
              background: authMode === mode ? 'var(--panel)' : 'transparent',
              color: authMode === mode ? 'var(--ink)' : 'var(--ink3)',
              fontFamily: 'inherit', fontSize: 14, fontWeight: 700, cursor: 'pointer',
              boxShadow: authMode === mode ? 'var(--shadow)' : 'none',
              transition: 'all 200ms ease-in-out',
            }}
          >
            {mode === 'signup' ? 'Sign Up' : 'Log In'}
          </button>
        ))}
      </div>

      {authMode === 'signup' && (
        <>
          <p style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.06em', color: 'var(--ink3)', margin: '4px 0 12px' }}>
            Choose your account type
          </p>
          <RoleCards selected={role} onSelect={switchRole} />
        </>
      )}

      <div style={{ position: 'relative', overflow: 'hidden', marginTop: 12 }}>
        <div style={{
          transition: 'opacity 250ms ease-in-out, transform 250ms ease-in-out',
          opacity: transitioning ? 0 : 1,
          transform: transitioning ? `translateX(${transitionDir === 'right' ? 20 : -20}px)` : 'translateX(0)',
        }}>
          <form onSubmit={submit} noValidate>
            {authMode === 'login' ? loginForm()
              : role === 'candidate' ? candidateForm()
                : role === 'recruiter' ? recruiterForm()
                  : companyForm()}

            {error && (
              <div style={{ fontSize: 13.5, color: 'var(--danger)', background: 'var(--dangerSoft)', padding: '10px 12px', borderRadius: 10, marginBottom: 12 }}>
                {error}
              </div>
            )}
            {successMsg && (
              <div style={{ fontSize: 13.5, color: 'var(--ok)', background: 'var(--okSoft)', padding: '10px 12px', borderRadius: 10, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
                <Check size={16} /> {successMsg}
              </div>
            )}

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
                ? (authMode === 'signup' ? 'Creating…' : 'Signing in…')
                : <>{authMode === 'signup' ? `Create ${roleLabel} Account` : 'Sign in'} <ArrowRight size={17} /></>}
            </button>
          </form>
        </div>
      </div>
    </AuthShell>
  );
};

export default AuthPage;
