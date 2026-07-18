import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import AuthShell from './AuthShell';
import { authApi, apiError } from '../auth';

const Register: React.FC = () => {
  const navigate = useNavigate();
  const [f, setF] = useState({ firstName: '', lastName: '', phone: '', email: '', password: '' });
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  const set = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement>) => setF((p) => ({ ...p, [k]: e.target.value }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr('');
    setBusy(true);
    try {
      await authApi.register({
        firstName: f.firstName.trim(), lastName: f.lastName.trim(),
        phone: f.phone.trim() || undefined, email: f.email.trim(), password: f.password,
      });
      // Registration sends an OTP; verify it, then we auto-sign-in and hand off.
      navigate('/verify', { state: { email: f.email.trim(), password: f.password, rememberMe: true } });
    } catch (e2) {
      setErr(apiError(e2, 'Could not create your account.'));
      setBusy(false);
    }
  };

  return (
    <AuthShell
      title="Create your account"
      subtitle="Verify your email with a one-time code and get started."
      footer={<>Already have an account? <Link to="/login" style={{ color: 'var(--brandInk)', fontWeight: 700 }}>Sign in</Link></>}
    >
      <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <div><label>First name</label><input required value={f.firstName} onChange={set('firstName')} placeholder="Sara" /></div>
          <div><label>Last name</label><input required value={f.lastName} onChange={set('lastName')} placeholder="Mansour" /></div>
        </div>
        <div><label>Phone (optional)</label><input value={f.phone} onChange={set('phone')} placeholder="01xxxxxxxxx" /></div>
        <div><label>Email address</label><input type="email" autoComplete="email" required value={f.email} onChange={set('email')} placeholder="you@example.com" /></div>
        <div>
          <label>Password</label>
          <div style={{ position: 'relative' }}>
            <input type={show ? 'text' : 'password'} autoComplete="new-password" required minLength={8} value={f.password} onChange={set('password')} placeholder="At least 8 characters" />
            <button type="button" onClick={() => setShow((s) => !s)} aria-label="Show password" style={{ position: 'absolute', right: 10, top: 12, background: 'none', border: 'none', cursor: 'pointer', color: 'var(--ink3)' }}>{show ? '🙈' : '👁️'}</button>
          </div>
        </div>
        {err && <div style={{ fontSize: 13.5, color: 'var(--danger, #D6453F)', background: 'var(--dangerSoft, #FCEAE9)', padding: '10px 12px', borderRadius: 10 }}>{err}</div>}
        <button type="submit" disabled={busy}>{busy ? 'Creating…' : 'Create account'}</button>
      </form>
    </AuthShell>
  );
};

export default Register;
