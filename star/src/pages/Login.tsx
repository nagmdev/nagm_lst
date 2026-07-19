import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import AuthShell from './AuthShell';
import { authApi, handoffToApp, apiError } from '../auth';

const Login: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(true);
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr('');
    setBusy(true);
    try {
      const t = await authApi.login(email.trim(), password, remember);
      await handoffToApp(t, remember); // → app.nagm.io, already signed in
    } catch (e2: any) {
      // The backend signals "email not verified" via HTTP 403 (which axios
      // rejects), so it lands here — route into the verify flow instead of
      // showing a dead-end error to an unverified user.
      const resp = e2?.response;
      if (resp?.status === 403 && resp?.data?.requiresVerification) {
        navigate('/verify', { state: { email: email.trim(), password, rememberMe: remember } });
        return;
      }
      setErr(apiError(e2, 'Could not sign you in. Check your email and password.'));
      setBusy(false);
    }
  };

  return (
    <AuthShell
      title="Welcome back"
      subtitle="Sign in to continue to your Nagm dashboard."
      footer={<>Don’t have an account? <Link to="/register" style={{ color: 'var(--brandInk)', fontWeight: 700 }}>Create one</Link></>}
    >
      <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div>
          <label>Email address</label>
          <input type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />
        </div>
        <div>
          <label>Password</label>
          <div style={{ position: 'relative' }}>
            <input type={show ? 'text' : 'password'} autoComplete="current-password" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" />
            <button type="button" onClick={() => setShow((s) => !s)} aria-label="Show password" style={{ position: 'absolute', right: 10, top: 12, background: 'none', border: 'none', cursor: 'pointer', color: 'var(--ink3)' }}>
              {show ? '🙈' : '👁️'}
            </button>
          </div>
        </div>
        <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13.5, color: 'var(--ink2)', fontWeight: 500 }}>
          <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} style={{ width: 16, height: 16, accentColor: 'var(--brand)' }} />
          Keep me signed in for 30 days
        </label>
        {err && <div style={{ fontSize: 13.5, color: 'var(--danger, #D6453F)', background: 'var(--dangerSoft, #FCEAE9)', padding: '10px 12px', borderRadius: 10 }}>{err}</div>}
        <button type="submit" disabled={busy}>{busy ? 'Signing in…' : 'Sign in'}</button>
      </form>
    </AuthShell>
  );
};

export default Login;
