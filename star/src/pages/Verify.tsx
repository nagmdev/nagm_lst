import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import AuthShell from './AuthShell';
import { authApi, handoffToApp, apiError } from '../auth';

interface VState { email?: string; password?: string; rememberMe?: boolean }

const Verify: React.FC = () => {
  const navigate = useNavigate();
  const { state } = useLocation() as { state?: VState };
  const email = state?.email || '';
  const password = state?.password;
  const remember = state?.rememberMe ?? true;

  const [otp, setOtp] = useState('');
  const [busy, setBusy] = useState(false);
  const [resending, setResending] = useState(false);
  const [err, setErr] = useState('');
  const [msg, setMsg] = useState('');

  if (!email) {
    // Reached directly without an email in flight — send them to sign in.
    return (
      <AuthShell title="Verify your email" subtitle="Start from the sign-in page to receive a code.">
        <Link to="/login" style={{ color: 'var(--brandInk)', fontWeight: 700 }}>Go to sign in</Link>
      </AuthShell>
    );
  }

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr('');
    setBusy(true);
    // Verify the code on its own, so a failure here is genuinely a bad/expired code.
    try {
      await authApi.verifyEmail(email, otp.trim());
    } catch (e2) {
      setErr(apiError(e2, 'That code didn’t work. Please try again.'));
      setBusy(false);
      return;
    }
    // Code accepted and the account is now active. Sign in + hand off separately,
    // so a transient sign-in blip isn't mislabelled as a bad code.
    try {
      if (password) {
        const t = await authApi.login(email, password, remember);
        await handoffToApp(t, remember);
        return;
      }
      // No password in flight (verifying an existing login) — go sign in.
      navigate('/login');
    } catch (e3) {
      setErr(apiError(e3, 'Your email is verified, but sign-in didn’t complete. Please sign in.'));
      setBusy(false);
    }
  };

  const resend = async () => {
    if (resending) return; // guard against a double-tap firing two /resend calls
    setResending(true);
    setErr(''); setMsg('');
    try { await authApi.resend(email); setMsg('A new code is on its way.'); }
    catch (e2) { setErr(apiError(e2, 'Could not resend the code.')); }
    finally { setResending(false); }
  };

  return (
    <AuthShell title="Enter your code" subtitle={`We sent a 6-digit code to ${email}.`}>
      <div style={{ marginBottom: 16 }}>
        <button
          type="button"
          onClick={() => (window.history.length > 1 ? navigate(-1) : navigate('/register'))}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 6, background: 'none',
            border: 'none', color: 'var(--ink2)', fontWeight: 600, fontSize: 13.5,
            cursor: 'pointer', padding: 0,
          }}
        >
          ← Back
        </button>
      </div>
      <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div>
          <label htmlFor="verification-code-input">Verification code</label>
          <input id="verification-code-input" inputMode="numeric" autoFocus required value={otp} onChange={(e) => setOtp(e.target.value)} placeholder="123456" style={{ letterSpacing: '.3em', textAlign: 'center', fontSize: 18, fontWeight: 700 }} />
        </div>
        {msg && <div style={{ fontSize: 13.5, color: 'var(--ok, #1F9D57)', background: 'var(--okSoft, #E5F5EC)', padding: '10px 12px', borderRadius: 10 }}>{msg}</div>}
        {err && <div style={{ fontSize: 13.5, color: 'var(--danger, #D6453F)', background: 'var(--dangerSoft, #FCEAE9)', padding: '10px 12px', borderRadius: 10 }}>{err}</div>}
        <button type="submit" disabled={busy}>{busy ? 'Verifying…' : 'Verify & continue'}</button>
      </form>
      <div style={{ marginTop: 16, display: 'flex', flexDirection: 'column', gap: 10, alignItems: 'center' }}>
        <button type="button" onClick={resend} disabled={resending} style={{ width: '100%', background: 'none', border: 'none', color: 'var(--brandInk)', fontWeight: 600, fontSize: 13.5, cursor: resending ? 'default' : 'pointer', opacity: resending ? 0.6 : 1 }}>{resending ? 'Sending…' : 'Resend code'}</button>
        <button type="button" onClick={() => navigate('/register')} style={{ background: 'none', border: 'none', color: 'var(--ink2)', fontWeight: 500, fontSize: 13, cursor: 'pointer', padding: '4px 8px' }}>← Back to sign up / Change email</button>
      </div>
    </AuthShell>
  );
};

export default Verify;
