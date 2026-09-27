import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Globe } from 'lucide-react';
import { useLang, setLang } from '../i18n/lang';

const Mark = ({ size = 30 }: { size?: number }) => (
  <div style={{ width: size, height: size, borderRadius: size * 0.28, background: 'var(--grad)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: size * 0.5, flexShrink: 0 }}>N</div>
);

export const AboutPage: React.FC = () => {
  const navigate = useNavigate();
  const lang = useLang();
  const isAr = lang === 'ar';
  const toggleLanguage = () => setLang(isAr ? 'en' : 'ar');

  const [dark, setDark] = useState<boolean>(() =>
    typeof document !== 'undefined' && document.documentElement.classList.contains('dark'),
  );

  const toggleTheme = () => {
    const el = document.documentElement;
    el.classList.toggle('dark');
    setDark(el.classList.contains('dark'));
  };

  const container: React.CSSProperties = { maxWidth: 1160, margin: '0 auto', padding: '0 24px' };

  return (
    <div style={{ background: 'var(--bg)', color: 'var(--ink)', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Top Header */}
      <header style={{ position: 'sticky', top: 0, zIndex: 50, backdropFilter: 'blur(16px)', background: 'var(--navbg)', borderBottom: '1px solid var(--line)' }}>
        <div style={{ ...container, minHeight: 66, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }} onClick={() => navigate('/')}>
            <Mark size={30} />
            <span style={{ fontSize: 19, fontWeight: 800, letterSpacing: '-.02em' }}>{isAr ? 'نجم' : 'Nagm'}</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Link to="/" style={{ fontSize: 14, fontWeight: 600, color: 'var(--ink2)', textDecoration: 'none', padding: '8px 12px', borderRadius: 8 }}>
              {isAr ? '← العودة للرئيسية' : '← Back to Home'}
            </Link>
            <button
              type="button"
              onClick={toggleLanguage}
              title={isAr ? 'Switch to English' : 'التبديل إلى العربية'}
              aria-label={isAr ? 'Switch to English' : 'التبديل إلى العربية'}
              lang={isAr ? 'en' : 'ar'}
              style={{
                height: 40,
                padding: '0 10px',
                borderRadius: 8,
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
            <button
              onClick={toggleTheme}
              title={isAr ? 'تبديل المظهر' : 'Toggle theme'}
              style={{ width: 40, height: 40, borderRadius: 8, border: '1px solid var(--line)', background: 'var(--panel)', color: 'var(--ink2)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >
              {dark ? '☀️' : '🌙'}
            </button>
            <button
              onClick={() => navigate('/register', { state: { role: 'recruiter' } })}
              style={{ padding: '9px 18px', borderRadius: 8, border: 'none', background: 'var(--grad)', color: '#fff', fontWeight: 700, fontSize: 14, cursor: 'pointer' }}
            >
              {isAr ? 'انضم لنجم' : 'Join Nagm'}
            </button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section style={{ padding: '60px 0 40px', borderBottom: '1px solid var(--line)', background: 'linear-gradient(180deg, rgba(99,102,241,0.03) 0%, transparent 100%)', textAlign: 'center' }}>
        <div style={container}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '6px 14px', borderRadius: 999, background: 'rgba(99, 102, 241, 0.08)', color: '#6366F1', fontWeight: 600, fontSize: 13, marginBottom: 16 }}>
            <span>🌟</span>
            <span>{isAr ? 'رسالتنا وقصتنا' : 'Our Mission & Story'}</span>
          </div>
          <h1 style={{ fontSize: 'clamp(28px, 4.5vw, 46px)', fontWeight: 800, letterSpacing: '-0.03em', lineHeight: 1.15, maxWidth: 840, margin: '0 auto 18px' }}>
            {isAr ? 'تمكين الكفاءات الصاعدة في الشرق الأوسط' : 'Empowering Emerging Talent Across the Middle East'}
          </h1>
          <p style={{ fontSize: 18, color: 'var(--ink2)', maxWidth: 740, margin: '0 auto 32px', lineHeight: 1.6 }}>
            {isAr
              ? 'بدأنا نجم لإدراكنا أن ملايين مهندسي البرمجيات والكوادر الماهرة في الشرق الأوسط وشمال أفريقيا يتم تجاهلهم لأن المنصات العالمية لم تُصمم للغة العربية، أو لمسارات العمل الإقليمية، أو لتوثيق المهارات الحقيقي.'
              : 'We started Nagm with a simple realization: millions of exceptional software engineers, sales professionals, and skilled candidates in the MENA region are overlooked because existing hiring platforms were never built for Arabic language, regional workflows, or modern developer verification.'}
          </p>
        </div>
      </section>

      {/* Story & Philosophy */}
      <section style={{ padding: '60px 0', borderBottom: '1px solid var(--line)' }}>
        <div style={{ ...container, maxWidth: 860 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
            <div>
              <h2 style={{ fontSize: 26, fontWeight: 800, marginBottom: 12 }}>
                {isAr ? 'المشكلة التي نحلها' : 'The Problem We Are Solving'}
              </h2>
              <p style={{ fontSize: 16, color: 'var(--ink2)', lineHeight: 1.7 }}>
                {isAr
                  ? 'للمرشحين: كانت رحلة البحث عن عمل تشبه الصراخ في فراغ؛ سير ذاتية تتشوه بسبب فلاتر ATS الغربية، طلبات تختفي في "الثقب الأسود" بدون أي رد، ووظائف وهمية تضيع الوقت.'
                  : 'For candidates, the job hunt has felt like shouting into a void. Resumes get corrupted by Western ATS filters, applications disappear into "resume black holes" with zero feedback, and fake job postings waste precious time.'}
              </p>
              <p style={{ fontSize: 16, color: 'var(--ink2)', lineHeight: 1.7 }}>
                {isAr
                  ? 'لأصحاب العمل: التوظيف في أسواق سريعة يعني الغرق في آلاف ملفات PDF غير المنظمة، وقضاء أكثر من 30 ساعة أسبوعياً في فرز السير يدوياً، ودفع آلاف الدولارات في كل عملية توظيف.'
                  : 'For employers, hiring in high-volume markets has meant drowning in thousands of unstructured PDFs, spending 30+ hours a week manually skimming resumes, and paying thousands of dollars every time they need to fill a seat.'}
              </p>
            </div>

            <div>
              <h2 style={{ fontSize: 26, fontWeight: 800, marginBottom: 12 }}>
                {isAr ? 'فلسفتنا الهندسية' : 'Our Engineering Philosophy'}
              </h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 20, marginTop: 20 }}>
                <div style={{ padding: 24, borderRadius: 14, background: 'var(--panel)', border: '1px solid var(--line)' }}>
                  <div style={{ fontSize: 24, marginBottom: 8 }}>⚡</div>
                  <h3 style={{ fontSize: 17, fontWeight: 700, marginBottom: 6 }}>
                    {isAr ? 'ذكاء اصطناعي أصيل وشفاف' : 'AI-Native, Not AI-Gimmick'}
                  </h3>
                  <p style={{ fontSize: 14, color: 'var(--ink2)', lineHeight: 1.5, margin: 0 }}>
                    {isAr
                      ? 'نبني ذكاءً اصطناعياً يقدم تفسيراً واضحاً — مطابقة للمهارات، والخبرة المنظمة، والأكواد الموثقة بدلاً من مجرد عد الكلمات المفتاحية.'
                      : 'We build AI that produces explainable, transparent reasoning—matching skills, verified code, and structured experience rather than keyword counts.'}
                  </p>
                </div>

                <div style={{ padding: 24, borderRadius: 14, background: 'var(--panel)', border: '1px solid var(--line)' }}>
                  <div style={{ fontSize: 24, marginBottom: 8 }}>🌍</div>
                  <h3 style={{ fontSize: 17, fontWeight: 700, marginBottom: 6 }}>
                    {isAr ? 'عربية أولاً مع معايير عالمية' : 'Arabic First & Global Standards'}
                  </h3>
                  <p style={{ fontSize: 14, color: 'var(--ink2)', lineHeight: 1.5, margin: 0 }}>
                    {isAr
                      ? 'صممنا الخطوط ومحركات معالجة اللغة الطبيعية من الصفر لتناسب اللهجات العربية، واتجاه الكتابة من اليمين لليسار، ومتطلبات الأعمال الإقليمية.'
                      : 'We engineered our typography and NLP from the ground up for Arabic dialects, RTL directionality, and regional business requirements.'}
                  </p>
                </div>

                <div style={{ padding: 24, borderRadius: 14, background: 'var(--panel)', border: '1px solid var(--line)' }}>
                  <div style={{ fontSize: 24, marginBottom: 8 }}>🛡️</div>
                  <h3 style={{ fontSize: 17, fontWeight: 700, marginBottom: 6 }}>
                    {isAr ? 'الثقة والخصوصية والتحقق' : 'Trust, Privacy & Verification'}
                  </h3>
                  <p style={{ fontSize: 14, color: 'var(--ink2)', lineHeight: 1.5, margin: 0 }}>
                    {isAr
                      ? 'يتم التحقق من كل صاحب عمل بوثائق السجل التجاري الرسمية، وتتم حماية بيانات المرشحين بأعلى معايير تشفير AES-256.'
                      : 'Every employer is verified with official Commercial Registration (CR) documents, and candidate data is protected with enterprise AES-256 encryption.'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Locations */}
      <section style={{ padding: '60px 0', borderBottom: '1px solid var(--line)', background: 'var(--bg2)' }}>
        <div style={container}>
          <div style={{ textAlign: 'center', marginBottom: 36 }}>
            <h2 style={{ fontSize: 26, fontWeight: 800, marginBottom: 8 }}>
              {isAr ? 'تواجدنا الإقليمي' : 'Our Regional Presence'}
            </h2>
            <p style={{ color: 'var(--ink2)', fontSize: 15 }}>
              {isAr ? 'نعمل عبر القاهرة، الرياض، ودبي.' : 'Operating across Cairo, Riyadh, and Dubai.'}
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 24 }}>
            <div style={{ padding: 24, borderRadius: 16, background: 'var(--panel)', border: '1px solid var(--line)', textAlign: 'center' }}>
              <div style={{ fontSize: 32, marginBottom: 8 }}>🇪🇬</div>
              <h3 style={{ fontSize: 18, fontWeight: 800, marginBottom: 4 }}>{isAr ? 'القاهرة، مصر' : 'Cairo, Egypt'}</h3>
              <p style={{ fontSize: 13, color: 'var(--ink2)', margin: 0 }}>{isAr ? 'مركز الهندسة الأساسية وتطوير المنتجات' : 'Core Engineering & Product Development Hub'}</p>
            </div>
            <div style={{ padding: 24, borderRadius: 16, background: 'var(--panel)', border: '1px solid var(--line)', textAlign: 'center' }}>
              <div style={{ fontSize: 32, marginBottom: 8 }}>🇸🇦</div>
              <h3 style={{ fontSize: 18, fontWeight: 800, marginBottom: 4 }}>{isAr ? 'الرياض، السعودية' : 'Riyadh, Saudi Arabia'}</h3>
              <p style={{ fontSize: 13, color: 'var(--ink2)', margin: 0 }}>{isAr ? 'شراكات الشركات والتوسع في الخليج' : 'Enterprise Client Partnerships & GCC Expansion'}</p>
            </div>
            <div style={{ padding: 24, borderRadius: 16, background: 'var(--panel)', border: '1px solid var(--line)', textAlign: 'center' }}>
              <div style={{ fontSize: 32, marginBottom: 8 }}>🇦🇪</div>
              <h3 style={{ fontSize: 18, fontWeight: 800, marginBottom: 4 }}>{isAr ? 'دبي، الإمارات' : 'Dubai, UAE'}</h3>
              <p style={{ fontSize: 13, color: 'var(--ink2)', margin: 0 }}>{isAr ? 'الاستراتيجية الإقليمية والاستشارات' : 'Regional Strategy & Advisory'}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ padding: '60px 0', background: 'var(--navbg)', textAlign: 'center', marginTop: 'auto' }}>
        <div style={container}>
          <h2 style={{ fontSize: 28, fontWeight: 800, marginBottom: 12 }}>
            {isAr ? 'انضم إلينا في بناء مستقبل العمل' : 'Join Us in Building the Future of Work'}
          </h2>
          <p style={{ color: 'var(--ink2)', fontSize: 16, marginBottom: 24, maxWidth: 500, margin: '0 auto 24px' }}>
            {isAr ? 'ابدأ بناء مسارك المهني أو وظّف أفضل الكفاءات العالمية مع نجم اليوم.' : 'Start building your career or hire world-class talent with Nagm today.'}
          </p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <button
              onClick={() => navigate('/register', { state: { role: 'recruiter' } })}
              style={{ padding: '14px 28px', borderRadius: 12, border: 'none', background: 'var(--grad)', color: '#fff', fontWeight: 700, fontSize: 16, cursor: 'pointer' }}
            >
              {isAr ? 'وظّف مع نجم' : 'Hire with Nagm'}
            </button>
            <button
              onClick={() => navigate('/register')}
              style={{ padding: '14px 24px', borderRadius: 12, border: '1px solid var(--line)', background: 'var(--panel)', color: 'var(--ink)', fontWeight: 600, fontSize: 15, cursor: 'pointer' }}
            >
              {isAr ? 'انضم كباحث عن عمل' : 'Join as a Candidate'}
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default AboutPage;
