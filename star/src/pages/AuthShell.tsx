import React, { useState, useEffect } from 'react';
import { Globe } from 'lucide-react';
import { applyLangToDocument, setLang, useLang } from '../i18n/lang';

const Mark = ({ size = 34, light = false }: { size?: number; light?: boolean }) => (
  <div style={{ width: size, height: size, borderRadius: size * 0.28, background: light ? 'rgba(255,255,255,.16)' : 'var(--grad)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: size * 0.5, flexShrink: 0 }}>N</div>
);

/** Split-screen auth layout: brand panel on the left, form on the right. */
const AuthShell: React.FC<{ title: string; subtitle: React.ReactNode; children: React.ReactNode; footer?: React.ReactNode }> = ({ title, subtitle, children, footer }) => {
  const [dark, setDark] = useState<boolean>(() =>
    typeof document !== 'undefined' && document.documentElement.classList.contains('dark'),
  );
  // One shared language for the shell AND the form inside it (see i18n/lang).
  const lang = useLang();

  useEffect(() => {
    applyLangToDocument(lang);
  }, [lang]);

  const toggleLanguage = () => {
    setLang(lang === 'ar' ? 'en' : 'ar');
  };

  const toggleTheme = () => {
    const el = document.documentElement;
    el.classList.toggle('dark');
    setDark(el.classList.contains('dark'));
  };

  const isAr = lang === 'ar';

  return (
    <div className="ng-auth ng-auth-grid" style={{ height: '100vh', overflow: 'hidden', display: 'grid', gridTemplateColumns: '1fr 1fr', direction: isAr ? 'rtl' : 'ltr' }}>
      {/* Brand panel */}
      <div className="ng-auth-brand" style={{ position: 'relative', overflow: 'hidden', background: 'var(--inkPanel)', color: '#fff', padding: '56px 52px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', textAlign: isAr ? 'right' : 'left' }}>
        <div style={{ position: 'absolute', top: -80, left: isAr ? 'auto' : '20%', right: isAr ? '20%' : 'auto', width: 360, height: 360, borderRadius: '50%', background: 'var(--grad)', opacity: 0.22, filter: 'blur(70px)', pointerEvents: 'none' }} />
        <a href="/" style={{ display: 'flex', alignItems: 'center', gap: 12, textDecoration: 'none', color: '#fff', position: 'relative' }}>
          <Mark size={38} light /><span style={{ fontSize: 22, fontWeight: 800, letterSpacing: '-.02em' }}>{isAr ? 'نجم' : 'Nagm'}</span>
        </a>
        <div style={{ position: 'relative' }}>
          <h1 style={{ fontSize: 38, fontWeight: 800, letterSpacing: '-.03em', lineHeight: 1.2, margin: '0 0 16px' }}>
            {isAr ? <>منظومة توظيف ذكية بالذكاء الاصطناعي،<br />باللغة العربية أولاً.</> : <>Arabic-first,<br />AI-native hiring.</>}
          </h1>
          <p style={{ fontSize: 15.5, color: 'rgba(255,255,255,.72)', lineHeight: 1.6, margin: 0, maxWidth: 400 }}>
            {isAr
              ? 'حساب واحد متكامل. أنشئ سيرة ذاتية توظفك كبرى الشركات فوراً — أو وظف أفضل الكفاءات بأسرع وقت.'
              : 'One account. Build a CV that companies hire from instantly — or hire the right people, faster.'}
          </p>
          <div style={{ display: 'flex', gap: 30, marginTop: 34 }}>
            {(isAr
              ? [['+335', 'مرشح'], ['25', 'شركة'], ['ذكاء اصطناعي', 'في كل خطوة']]
              : [['335+', 'candidates'], ['25', 'companies'], ['AI', 'at every step']]
            ).map(([v, l]) => (
              <div key={l}><div style={{ fontSize: 22, fontWeight: 800, fontFamily: isAr ? 'inherit' : "'IBM Plex Mono',monospace" }}>{v}</div><div style={{ fontSize: 12.5, color: 'rgba(255,255,255,.55)' }}>{l}</div></div>
            ))}
          </div>
        </div>
        <div style={{ position: 'relative', fontSize: 12.5, color: 'rgba(255,255,255,.5)' }}>
          {isAr ? '© 2026 Nagm.io · القاهرة · الرياض · دبي' : '© 2026 Nagm.io · Cairo · Riyadh · Dubai'}
        </div>
      </div>

      {/* Form panel — scrolls independently so the brand panel stays fixed. */}
      <main id="main-content" className="ng-auth-scroll" style={{ position: 'relative', background: 'var(--bg)', height: '100vh', overflowY: 'auto', display: 'flex', alignItems: 'safe center', justifyContent: 'center', padding: '48px 28px' }}>
        <div style={{ position: 'absolute', top: 22, [isAr ? 'left' : 'right']: 22, display: 'flex', alignItems: 'center', gap: 8, zIndex: 10 }}>
          <button
            type="button"
            onClick={toggleLanguage}
            title={isAr ? 'Switch to English' : 'التبديل إلى العربية'}
            aria-label={isAr ? 'Switch to English' : 'التبديل إلى العربية'}
            lang={isAr ? 'en' : 'ar'}
            style={{
              height: 40,
              padding: '0 12px',
              borderRadius: 10,
              border: '1px solid var(--line)',
              background: 'var(--panel)',
              color: 'var(--ink)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              fontSize: 13,
              fontWeight: 700,
            }}
          >
            <Globe size={15} style={{ color: 'var(--brand)' }} />
            <span>{isAr ? 'English' : 'عربي'}</span>
          </button>
          <button type="button" onClick={toggleTheme} title={isAr ? 'تبديل المظهر' : 'Toggle theme'} aria-label={isAr ? 'تبديل المظهر' : 'Toggle theme'} aria-pressed={dark} style={{ width: 40, height: 40, minWidth: 40, minHeight: 40, borderRadius: 10, border: '1px solid var(--line)', background: 'var(--panel)', color: 'var(--ink2)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {dark ? (
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="4" /><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" /></svg>
            ) : (
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" /></svg>
            )}
          </button>
        </div>
        <div style={{ width: '100%', maxWidth: 400, textAlign: isAr ? 'right' : 'left' }}>
          <h1 className="sr-only">{isAr ? 'نجم — توظيف بالذكاء الاصطناعي، بالعربية أولاً' : 'Nagm — Arabic-first, AI-native hiring'}</h1>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 7, padding: '5px 12px', borderRadius: 30, background: 'var(--brandSoft)', border: '1px solid var(--brandBorder)', fontSize: 12.5, fontWeight: 600, color: 'var(--brandInk)', marginBottom: 18 }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>
            {isAr ? 'تسجيل دخول آمن وموثق' : 'Secure OTP sign-in'}
          </div>
          <h2 style={{ fontSize: 28, fontWeight: 800, letterSpacing: '-.02em', color: 'var(--ink)', margin: '0 0 6px' }}>{title}</h2>
          <p style={{ fontSize: 14.5, color: 'var(--ink2)', margin: '0 0 26px', lineHeight: 1.5 }}>{subtitle}</p>
          {children}
          {footer && <div style={{ marginTop: 22, fontSize: 13.5, color: 'var(--ink2)', textAlign: 'center' }}>{footer}</div>}
        </div>
      </main>
    </div>
  );
};

export default AuthShell;
