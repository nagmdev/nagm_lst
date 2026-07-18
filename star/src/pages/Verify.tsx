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
    try {
      await authApi.verifyEmail(email, otp.trim());
      if (password) {
        // Auto sign-in with the credentials just used, then hand off to the app.
        const t = await authApi.login(email, password, remember);
        handoffToApp(t, remember);
        return;
      }
      // No password in flight (verifying an existing login) — go sign in.
      navigate('/login');
    } catch (e2) {
      setErr(apiError(e2, 'That code didn’t work. Please try again.'));
      setBusy(false);
    }
  };

  const resend = async () => {
    setErr(''); setMsg('');
    try { await authApi.resend(email); setMsg('A new code is on its way.'); }
    catch (e2) { setErr(apiError(e2, 'Could not resend the code.')); }
  };

  return (
    <AuthShell title="Enter your code" subtitle={`We sent a 6-digit code to ${email}.`}>
      <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div>
          <label>Verification code</label>
          <input inputMode="numeric" autoFocus required value={otp} onChange={(e) => setOtp(e.target.value)} placeholder="123456" style={{ letterSpacing: '.3em', textAlign: 'center', fontSize: 18, fontWeight: 700 }} />
        </div>
        {msg && <div style={{ fontSize: 13.5, color: 'var(--ok, #1F9D57)', background: 'var(--okSoft, #E5F5EC)', padding: '10px 12px', borderRadius: 10 }}>{msg}</div>}
        {err && <div style={{ fontSize: 13.5, color: 'var(--danger, #D6453F)', background: 'var(--dangerSoft, #FCEAE9)', padding: '10px 12px', borderRadius: 10 }}>{err}</div>}
        <button type="submit" disabled={busy}>{busy ? 'Verifying…' : 'Verify & continue'}</button>
      </form>
      <button onClick={resend} style={{ marginTop: 16, width: '100%', background: 'none', border: 'none', color: 'var(--brandInk)', fontWeight: 600, fontSize: 13.5, cursor: 'pointer' }}>Resend code</button>
    </AuthShell>
  );
};

export default Verify;
