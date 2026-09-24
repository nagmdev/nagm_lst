import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import AuthShell from './AuthShell';
import { authApi, handoffToApp, apiError, pendingSignInFor, forgetPendingSignIn } from '../auth';
import { useAuthText, localizeServerMessage } from '../i18n/authText';

interface VState { email?: string; rememberMe?: boolean; returnTo?: string | null }

const Verify: React.FC = () => {
  const navigate = useNavigate();
  const { state } = useLocation() as { state?: VState };
  const t = useAuthText();
  const tr = (message: string) => localizeServerMessage(message, t.lang);
  const email = state?.email || '';
  // The sign-up password is held in memory (see auth.ts), never in history.state.
  // After a reload it is gone, and the flow falls back to "verify, then sign in".
  const password = email ? pendingSignInFor(email) : undefined;
  const remember = state?.rememberMe ?? true;

  const [otp, setOtp] = useState('');
  const [busy, setBusy] = useState(false);
  const [resending, setResending] = useState(false);
  const [err, setErr] = useState('');
  const [msg, setMsg] = useState('');

  const BackArrow = t.isAr ? ArrowRight : ArrowLeft;

  if (!email) {
    // Reached directly without an email in flight — send them to sign in.
    return (
      <AuthShell title={t.verifyNoEmailTitle} subtitle={t.verifyNoEmailSubtitle}>
        <Link to="/login" style={{ color: 'var(--brandInk)', fontWeight: 700 }}>{t.goToSignIn}</Link>
      </AuthShell>
    );
  }

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (busy) return; // Enter pressed again while the first request is in flight
    setErr('');
    setMsg('');
    const code = otp.trim();
    // The server only accepts exactly 6 digits; say so without a round trip.
    if (!/^\d{6}$/.test(code)) {
      setErr(t.enterCode);
      return;
    }
    setBusy(true);
    // Verify the code on its own, so a failure here is genuinely a bad/expired code.
    try {
      await authApi.verifyEmail(email, code);
    } catch (e2) {
      setErr(tr(apiError(e2, t.failCode)));
      setBusy(false);
      return;
    }
    // Code accepted and the account is now active. Sign in + hand off separately,
    // so a transient sign-in blip isn't mislabelled as a bad code.
    try {
      if (password) {
        const tokens = await authApi.login(email, password, remember);
        forgetPendingSignIn();
        await handoffToApp(tokens, remember, state?.returnTo);
        return;
      }
      // No password in flight (verifying an existing login, or after a reload) — go sign in,
      // still heading back to wherever the app sent them.
      navigate(state?.returnTo ? `/login?returnTo=${encodeURIComponent(state.returnTo)}` : '/login');
    } catch (e3) {
      forgetPendingSignIn();
      setErr(tr(apiError(e3, t.failSignInAfterVerify)));
      setBusy(false);
    }
  };

  const resend = async () => {
    if (resending) return; // guard against a double-tap firing two /resend calls
    setResending(true);
    setErr(''); setMsg('');
    try { await authApi.resend(email); setMsg(t.newCodeSent); }
    catch (e2) { setErr(tr(apiError(e2, t.failResendVerify))); }
    finally { setResending(false); }
  };

  const plainButton: React.CSSProperties = {
    display: 'inline-flex', alignItems: 'center', gap: 6, background: 'none', border: 'none',
    fontFamily: 'inherit', cursor: 'pointer', padding: 0,
  };

  return (
    <AuthShell
      title={t.verifyTitle}
      subtitle={<>{t.verifySubtitle} <bdi dir="ltr">{email}</bdi>.</>}
    >
      <div style={{ marginBottom: 16 }}>
        <button
          type="button"
          onClick={() => (window.history.length > 1 ? navigate(-1) : navigate('/register'))}
          style={{ ...plainButton, color: 'var(--ink2)', fontWeight: 600, fontSize: 13.5 }}
        >
          <BackArrow size={14} aria-hidden="true" /> {t.back}
        </button>
      </div>
      <form onSubmit={submit} noValidate aria-busy={busy || undefined} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div>
          <label htmlFor="verification-code-input" style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--ink2)', marginBottom: 6 }}>
            {t.verificationCode}
          </label>
          <input
            id="verification-code-input"
            name="one-time-code"
            dir="ltr"
            inputMode="numeric"
            autoComplete="one-time-code"
            pattern="[0-9]*"
            maxLength={6}
            autoFocus
            required
            value={otp}
            // Digits only — pasting "123 456" or a code with a stray letter still works.
            onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
            placeholder="123456"
            aria-invalid={!!err || undefined}
            aria-describedby={err ? 'verify-error' : undefined}
            className="ng-auth-field"
            style={{
              width: '100%', height: 50, borderRadius: 12, border: `1px solid ${err ? 'var(--danger)' : 'var(--line)'}`,
              background: 'var(--panel)', color: 'var(--ink)', outline: 'none',
              letterSpacing: '.3em', textAlign: 'center', fontSize: 18, fontWeight: 700, fontFamily: 'inherit',
            }}
          />
        </div>
        {msg && <div role="status" style={{ fontSize: 13.5, color: 'var(--ok, #1F9D57)', background: 'var(--okSoft, #E5F5EC)', padding: '10px 12px', borderRadius: 10 }}>{msg}</div>}
        {err && <div id="verify-error" role="alert" style={{ fontSize: 13.5, color: 'var(--danger, #D6453F)', background: 'var(--dangerSoft, #FCEAE9)', padding: '10px 12px', borderRadius: 10 }}>{err}</div>}
        <button
          type="submit"
          disabled={busy}
          style={{
            width: '100%', height: 48, borderRadius: 12, border: 'none',
            background: busy ? 'var(--line)' : 'var(--grad)', color: '#fff',
            fontFamily: 'inherit', fontSize: 15, fontWeight: 700, cursor: busy ? 'not-allowed' : 'pointer',
          }}
        >
          {busy ? t.verifying : t.verifyContinue}
        </button>
      </form>
      <div style={{ marginTop: 16, display: 'flex', flexDirection: 'column', gap: 10, alignItems: 'center' }}>
        <button type="button" onClick={resend} disabled={resending} style={{ ...plainButton, justifyContent: 'center', width: '100%', color: 'var(--brandInk)', fontWeight: 600, fontSize: 13.5, cursor: resending ? 'default' : 'pointer', opacity: resending ? 0.6 : 1 }}>
          {resending ? t.sending : t.resendCode}
        </button>
        <button type="button" onClick={() => navigate('/register')} style={{ ...plainButton, color: 'var(--ink2)', fontWeight: 500, fontSize: 13, padding: '4px 8px' }}>
          <BackArrow size={13} aria-hidden="true" /> {t.backToSignup}
        </button>
      </div>
    </AuthShell>
  );
};

export default Verify;
