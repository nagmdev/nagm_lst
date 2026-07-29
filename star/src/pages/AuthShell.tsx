import React, { useState } from 'react';

const Mark = ({ size = 34, light = false }: { size?: number; light?: boolean }) => (
  <div style={{ width: size, height: size, borderRadius: size * 0.28, background: light ? 'rgba(255,255,255,.16)' : 'var(--grad)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: size * 0.5, flexShrink: 0 }}>N</div>
);

/** Split-screen auth layout: brand panel on the left, form on the right. */
const AuthShell: React.FC<{ title: string; subtitle: string; children: React.ReactNode; footer?: React.ReactNode }> = ({ title, subtitle, children, footer }) => {
  const [dark, setDark] = useState<boolean>(() =>
    typeof document !== 'undefined' && document.documentElement.classList.contains('dark'),
  );
  const toggleTheme = () => {
    const el = document.documentElement;
    el.classList.toggle('dark');
    setDark(el.classList.contains('dark'));
  };

  return (
    <div className="ng-auth ng-auth-grid" style={{ height: '100vh', overflow: 'hidden', display: 'grid', gridTemplateColumns: '1fr 1fr' }}>
      {/* Brand panel */}
      <div className="ng-auth-brand" style={{ position: 'relative', overflow: 'hidden', background: 'var(--inkPanel)', color: '#fff', padding: '56px 52px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
        <div style={{ position: 'absolute', top: -80, left: '20%', width: 360, height: 360, borderRadius: '50%', background: 'var(--grad)', opacity: 0.22, filter: 'blur(70px)', pointerEvents: 'none' }} />
        <a href="/" style={{ display: 'flex', alignItems: 'center', gap: 12, textDecoration: 'none', color: '#fff', position: 'relative' }}>
          <Mark size={38} light /><span style={{ fontSize: 22, fontWeight: 800, letterSpacing: '-.02em' }}>Nagm</span>
        </a>
        <div style={{ position: 'relative' }}>
          <h1 style={{ fontSize: 40, fontWeight: 800, letterSpacing: '-.03em', lineHeight: 1.1, margin: '0 0 16px' }}>Arabic-first,<br />AI-native hiring.</h1>
          <p style={{ fontSize: 15.5, color: 'rgba(255,255,255,.72)', lineHeight: 1.6, margin: 0, maxWidth: 380 }}>One account. Build a CV that companies hire from instantly — or hire the right people, faster.</p>
          <div style={{ display: 'flex', gap: 30, marginTop: 34 }}>
            {[['335+', 'candidates'], ['25', 'companies'], ['AI', 'at every step']].map(([v, l]) => (
              <div key={l}><div style={{ fontSize: 22, fontWeight: 800, fontFamily: "'IBM Plex Mono',monospace" }}>{v}</div><div style={{ fontSize: 12.5, color: 'rgba(255,255,255,.55)' }}>{l}</div></div>
            ))}
          </div>
        </div>
        <div style={{ position: 'relative', fontSize: 12.5, color: 'rgba(255,255,255,.5)' }}>© 2026 Nagm.io · Cairo · Riyadh · Dubai</div>
      </div>

      {/* Form panel — scrolls independently so the brand panel stays fixed. */}
      <div className="ng-auth-scroll" style={{ position: 'relative', background: 'var(--bg)', height: '100vh', overflowY: 'auto', display: 'flex', alignItems: 'safe center', justifyContent: 'center', padding: '48px 28px' }}>
        <button onClick={toggleTheme} title="Toggle theme" style={{ position: 'absolute', top: 22, right: 22, width: 40, height: 40, borderRadius: 11, border: '1px solid var(--line)', background: 'var(--panel)', color: 'var(--ink2)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {dark ? (
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="4" /><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" /></svg>
          ) : (
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" /></svg>
          )}
        </button>
        <div style={{ width: '100%', maxWidth: 400 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 7, padding: '5px 12px', borderRadius: 30, background: 'var(--brandSoft)', border: '1px solid var(--brandBorder)', fontSize: 12.5, fontWeight: 600, color: 'var(--brandInk)', marginBottom: 18 }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>
            Secure OTP sign-in
          </div>
          <h2 style={{ fontSize: 28, fontWeight: 800, letterSpacing: '-.02em', color: 'var(--ink)', margin: '0 0 6px' }}>{title}</h2>
          <p style={{ fontSize: 14.5, color: 'var(--ink2)', margin: '0 0 26px', lineHeight: 1.5 }}>{subtitle}</p>
          {children}
          {footer && <div style={{ marginTop: 22, fontSize: 13.5, color: 'var(--ink2)', textAlign: 'center' }}>{footer}</div>}
        </div>
      </div>
    </div>
  );
};

export default AuthShell;
