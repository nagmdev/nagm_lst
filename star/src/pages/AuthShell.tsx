import React, { useState, useEffect } from 'react';
import { Globe } from '../design/glyphs';
import { Icon, type IconName } from '../design/icons';
import { ChevronField } from '../design/art';
import { MatchCard, ScaleBox } from '../design/mock';
import { applyLangToDocument, setLang, useLang } from '../i18n/lang';

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
        <div style={{ position: 'absolute', inset: 0, color: '#8B7BFF' }}><ChevronField opacity={0.07} rows={5} cols={4} /></div>
        <a href="/" style={{ display: 'flex', alignItems: 'center', gap: 12, textDecoration: 'none', color: '#fff', position: 'relative' }}>
          <img src="/nagm-mark.png" width={36} height={36} alt="" style={{ display: 'block' }} />
          <span style={{ fontFamily: 'var(--fontDisplay)', fontSize: 22, fontWeight: 800 }}>{isAr ? 'نجم' : 'Nagm'}</span>
        </a>
        <div style={{ position: 'relative', maxWidth: 440, opacity: 0.92, marginInline: 'auto', width: '100%' }} aria-hidden="true">
          <ScaleBox width={420} height={318}><MatchCard /></ScaleBox>
        </div>
        <div style={{ position: 'relative' }}>
          {/* The owner's brand line (footer copy, Oct 2026) — no counts here:
              the marketing copy replaced platform statistics with capabilities. */}
          <h1 style={{ fontFamily: 'var(--fontDisplay)', fontSize: 34, fontWeight: 700, lineHeight: 1.35, margin: '0 0 14px', textWrap: 'balance' }}>
            {isAr ? <>ملف مهني أوضح.<br />ورحلة توظيف أكثر تنظيمًا.</> : <>A clearer professional profile.<br />A better-organised hiring journey.</>}
          </h1>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 22 }}>
            {(isAr
              ? [['cv', 'السيرة الذاتية'], ['match', 'تحليل التوافق'], ['stages', 'مراحل التوظيف']]
              : [['cv', 'CV builder'], ['match', 'Match analysis'], ['stages', 'Hiring stages']]
            ).map(([icon, label]) => (
              <span key={label} style={{ display: 'inline-flex', alignItems: 'center', gap: 8, height: 34, padding: '0 12px', borderRadius: 10, background: 'rgba(255,255,255,.06)', border: '1px solid rgba(255,255,255,.1)', fontSize: 13, color: 'rgba(255,255,255,.82)' }}>
                <Icon name={icon as IconName} size={16} style={{ color: '#A99BFF' }} />{label}
              </span>
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
            <Icon name={dark ? 'sun' : 'moon'} size={17} />
          </button>
        </div>
        <div style={{ width: '100%', maxWidth: 400, textAlign: isAr ? 'right' : 'left' }}>
          <h1 className="sr-only">{isAr ? 'نجم — توظيف بالذكاء الاصطناعي، بالعربية أولاً' : 'Nagm — Arabic-first, AI-native hiring'}</h1>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 7, padding: '5px 12px', borderRadius: 30, background: 'var(--brandSoft)', border: '1px solid var(--brandBorder)', fontSize: 12.5, fontWeight: 600, color: 'var(--brandInk)', marginBottom: 18 }}>
            <Icon name="lock" size={14} />
            {isAr ? 'تسجيل دخول آمن وموثق' : 'Secure OTP sign-in'}
          </div>
          <h2 style={{ fontFamily: 'var(--fontDisplay)', fontSize: 28, fontWeight: 800, color: 'var(--ink)', margin: '0 0 6px' }}>{title}</h2>
          <p style={{ fontSize: 14.5, color: 'var(--ink2)', margin: '0 0 26px', lineHeight: 1.5 }}>{subtitle}</p>
          {children}
          {footer && <div style={{ marginTop: 22, fontSize: 13.5, color: 'var(--ink2)', textAlign: 'center' }}>{footer}</div>}
        </div>
      </main>
    </div>
  );
};

export default AuthShell;
