import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { FEATURES_MAP } from '../data/featureData';

const Mark = ({ size = 30 }: { size?: number }) => (
  <div style={{ width: size, height: size, borderRadius: size * 0.28, background: 'var(--grad)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: size * 0.5, flexShrink: 0 }}>N</div>
);

export const FeatureDetail: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [dark, setDark] = useState<boolean>(() =>
    typeof document !== 'undefined' && document.documentElement.classList.contains('dark'),
  );

  const toggleTheme = () => {
    const el = document.documentElement;
    el.classList.toggle('dark');
    setDark(el.classList.contains('dark'));
  };

  // Interactive Demo Widget States
  const [kanbanStage, setKanbanStage] = useState<'applied' | 'screening' | 'interview' | 'offer'>('screening');
  const [bidiLang, setBidiLang] = useState<'ar' | 'en'>('ar');
  const [atsScore, setAtsScore] = useState<number>(88);

  const feature = slug ? FEATURES_MAP[slug] : null;

  const container: React.CSSProperties = { maxWidth: 1160, margin: '0 auto', padding: '0 24px' };

  if (!feature) {
    return (
      <div style={{ background: 'var(--bg)', color: 'var(--ink)', minHeight: '100vh', padding: '80px 24px', textAlign: 'center' }}>
        <Mark size={48} />
        <h1 style={{ marginTop: 24, fontSize: 32, fontWeight: 800 }}>Feature Overview</h1>
        <p style={{ color: 'var(--ink2)', margin: '12px auto 24px', maxWidth: 480 }}>
          Explore our complete hiring, career, and intelligence platform features.
        </p>
        <button
          onClick={() => navigate('/')}
          style={{ padding: '12px 24px', borderRadius: 10, background: 'var(--grad)', color: '#fff', border: 'none', fontWeight: 700, cursor: 'pointer' }}
        >
          Return to Homepage
        </button>
      </div>
    );
  }

  return (
    <div style={{ background: 'var(--bg)', color: 'var(--ink)', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <header style={{ position: 'sticky', top: 0, zIndex: 50, backdropFilter: 'blur(16px)', background: 'var(--navbg)', borderBottom: '1px solid var(--line)' }}>
        <div style={{ ...container, minHeight: 66, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }} onClick={() => navigate('/')}>
            <Mark size={30} />
            <span style={{ fontSize: 19, fontWeight: 800, letterSpacing: '-.02em' }}>Nagm</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <Link
              to="/"
              style={{ fontSize: 14, fontWeight: 600, color: 'var(--ink2)', textDecoration: 'none', padding: '8px 12px', borderRadius: 8 }}
            >
              ← Back to Home
            </Link>
            <button
              onClick={toggleTheme}
              title="Toggle theme"
              style={{ width: 40, height: 40, borderRadius: 8, border: '1px solid var(--line)', background: 'var(--panel)', color: 'var(--ink2)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >
              {dark ? '☀️' : '🌙'}
            </button>
            <button
              onClick={() => navigate('/register', { state: { role: feature.primaryCtaRole } })}
              style={{ padding: '9px 18px', borderRadius: 8, border: 'none', background: 'var(--grad)', color: '#fff', fontWeight: 700, fontSize: 14, cursor: 'pointer' }}
            >
              {feature.primaryCtaText}
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section style={{ padding: '60px 0 40px', borderBottom: '1px solid var(--line)', background: 'linear-gradient(180deg, rgba(99,102,241,0.03) 0%, transparent 100%)' }}>
        <div style={container}>
          {/* Breadcrumb & Category */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
            <span style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: feature.categoryColor, background: 'var(--panel)', padding: '4px 10px', borderRadius: 6, border: '1px solid var(--line)' }}>
              {feature.icon} {feature.category}
            </span>
            <span style={{ color: 'var(--ink3)' }}>/</span>
            <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--ink2)' }}>{feature.title}</span>
          </div>

          <h1 style={{ fontSize: 'clamp(28px, 4.5vw, 46px)', fontWeight: 800, letterSpacing: '-0.03em', lineHeight: 1.15, maxWidth: 840, marginBottom: 18 }}>
            {feature.headline}
          </h1>
          <p style={{ fontSize: 18, color: 'var(--ink2)', maxWidth: 760, lineHeight: 1.6, marginBottom: 32 }}>
            {feature.subheadline}
          </p>

          <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', marginBottom: 48 }}>
            <button
              onClick={() => navigate('/register', { state: { role: feature.primaryCtaRole } })}
              style={{ padding: '14px 28px', borderRadius: 12, border: 'none', background: 'var(--grad)', color: '#fff', fontWeight: 700, fontSize: 16, cursor: 'pointer', boxShadow: '0 4px 16px var(--brandShadow)' }}
            >
              {feature.primaryCtaText} →
            </button>
            <button
              onClick={() => navigate('/login')}
              style={{ padding: '14px 24px', borderRadius: 12, border: '1px solid var(--line)', background: 'var(--panel)', color: 'var(--ink)', fontWeight: 600, fontSize: 15, cursor: 'pointer' }}
            >
              Sign In to Your Account
            </button>
          </div>

          {/* Interactive Feature Demo Mockup Box */}
          <div style={{ padding: 24, borderRadius: 20, background: 'var(--panel)', border: '1px solid var(--line)', boxShadow: 'var(--shadowLg)', maxWidth: 940, margin: '0 auto' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: 16, borderBottom: '1px solid var(--line)', marginBottom: 20 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#EF4444' }} />
                <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#F59E0B' }} />
                <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#10B981' }} />
                <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--ink2)', marginLeft: 8 }}>
                  Nagm Live Interactive Feature Preview
                </span>
              </div>
              <span style={{ fontSize: 12, fontWeight: 700, padding: '3px 8px', borderRadius: 6, background: 'rgba(99, 102, 241, 0.12)', color: '#6366F1' }}>
                Interactive UI Demo
              </span>
            </div>

            {/* Render Contextual Demo Widget */}
            {feature.interactiveType === 'kanban-demo' && (
              <div>
                <div style={{ display: 'flex', gap: 8, marginBottom: 16, overflowX: 'auto', paddingBottom: 6 }}>
                  {(['applied', 'screening', 'interview', 'offer'] as const).map((stage) => (
                    <button
                      key={stage}
                      onClick={() => setKanbanStage(stage)}
                      style={{
                        padding: '8px 16px', borderRadius: 8, fontWeight: 700, fontSize: 13,
                        border: kanbanStage === stage ? '2px solid #6366F1' : '1px solid var(--line)',
                        background: kanbanStage === stage ? 'rgba(99, 102, 241, 0.1)' : 'transparent',
                        color: kanbanStage === stage ? '#6366F1' : 'var(--ink2)', cursor: 'pointer'
                      }}
                    >
                      {stage.toUpperCase()} ({stage === kanbanStage ? 'Selected Stage' : 'Switch Column'})
                    </button>
                  ))}
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
                  <div style={{ padding: 16, borderRadius: 12, background: 'var(--bg)', border: '1px solid var(--line)' }}>
                    <div style={{ fontWeight: 800, fontSize: 14, marginBottom: 12, color: 'var(--ink)' }}>
                      Current Stage: <span style={{ color: '#6366F1' }}>{kanbanStage.toUpperCase()}</span>
                    </div>
                    <div style={{ padding: 12, borderRadius: 8, background: 'var(--panel)', border: '1px solid var(--line)', marginBottom: 8 }}>
                      <div style={{ fontWeight: 700, fontSize: 14 }}>Sara Mansour</div>
                      <div style={{ fontSize: 12, color: 'var(--ink2)' }}>Senior Software Engineer · Cairo</div>
                      <div style={{ marginTop: 8, fontSize: 11, fontWeight: 700, color: '#10B981', display: 'flex', alignItems: 'center', gap: 4 }}>
                        <span>✨ Match Score: 94%</span>
                      </div>
                    </div>
                    <div style={{ padding: 12, borderRadius: 8, background: 'var(--panel)', border: '1px solid var(--line)' }}>
                      <div style={{ fontWeight: 700, fontSize: 14 }}>Omar Khaled</div>
                      <div style={{ fontSize: 12, color: 'var(--ink2)' }}>Product Manager · Riyadh</div>
                      <div style={{ marginTop: 8, fontSize: 11, fontWeight: 700, color: '#6366F1', display: 'flex', alignItems: 'center', gap: 4 }}>
                        <span>✨ Match Score: 89%</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {feature.interactiveType === 'bidi-preview' && (
              <div>
                <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
                  <button
                    onClick={() => setBidiLang('ar')}
                    style={{
                      padding: '8px 16px', borderRadius: 8, fontWeight: 700, fontSize: 13,
                      border: bidiLang === 'ar' ? '2px solid #EC4899' : '1px solid var(--line)',
                      background: bidiLang === 'ar' ? 'rgba(236, 72, 153, 0.1)' : 'transparent',
                      color: bidiLang === 'ar' ? '#EC4899' : 'var(--ink2)', cursor: 'pointer'
                    }}
                  >
                    العربية (Arabic RTL Preview)
                  </button>
                  <button
                    onClick={() => setBidiLang('en')}
                    style={{
                      padding: '8px 16px', borderRadius: 8, fontWeight: 700, fontSize: 13,
                      border: bidiLang === 'en' ? '2px solid #EC4899' : '1px solid var(--line)',
                      background: bidiLang === 'en' ? 'rgba(236, 72, 153, 0.1)' : 'transparent',
                      color: bidiLang === 'en' ? '#EC4899' : 'var(--ink2)', cursor: 'pointer'
                    }}
                  >
                    English (LTR Layout)
                  </button>
                </div>
                <div style={{ padding: 20, borderRadius: 12, background: 'var(--bg)', border: '1px solid var(--line)', direction: bidiLang === 'ar' ? 'rtl' : 'ltr', textAlign: bidiLang === 'ar' ? 'right' : 'left' }}>
                  <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--ink)', marginBottom: 4 }}>
                    {bidiLang === 'ar' ? 'أحمد محمد — مهندس برمجيات أول' : 'Ahmed Mohamed — Senior Software Engineer'}
                  </div>
                  <div style={{ fontSize: 13, color: 'var(--ink2)', marginBottom: 12 }}>
                    {bidiLang === 'ar' ? 'القاهرة، مصر · خبرة 6 سنوات · متاح للعمل الفوري' : 'Cairo, Egypt · 6 Years Experience · Open to Relocation'}
                  </div>
                  <p style={{ fontSize: 14, color: 'var(--ink)', lineHeight: 1.6, margin: 0 }}>
                    {bidiLang === 'ar'
                      ? 'مهندس برمجيات متخصص في بناء أنظمة الويب الموزعة وتطبيقات الذكاء الاصطناعي عالية الأداء باستخدام Python و React و Node.js.'
                      : 'Software Engineer specializing in scalable distributed web systems and high-performance AI applications using Python, React, and Node.js.'}
                  </p>
                </div>
              </div>
            )}

            {feature.interactiveType === 'ats-gauge' && (
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 16 }}>
                  <div style={{ fontSize: 36, fontWeight: 800, color: atsScore >= 80 ? '#10B981' : '#F59E0B' }}>
                    {atsScore}<span style={{ fontSize: 18, color: 'var(--ink3)' }}>/100</span>
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, fontWeight: 700, marginBottom: 4 }}>
                      <span>ATS Resume Optimization Level</span>
                      <span>{atsScore >= 85 ? 'Excellent Compatibility' : 'Needs Keywords'}</span>
                    </div>
                    <input
                      type="range"
                      min={50}
                      max={98}
                      value={atsScore}
                      onChange={(e) => setAtsScore(Number(e.target.value))}
                      style={{ width: '100%', cursor: 'pointer' }}
                    />
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12 }}>
                  <div style={{ padding: 12, borderRadius: 8, background: 'rgba(16, 185, 129, 0.08)', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
                    <div style={{ fontWeight: 700, fontSize: 13, color: '#10B981' }}>✓ 14 Matched Keywords</div>
                    <div style={{ fontSize: 12, color: 'var(--ink2)' }}>Python, Docker, React, PostgreSQL</div>
                  </div>
                  <div style={{ padding: 12, borderRadius: 8, background: 'rgba(239, 68, 68, 0.08)', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
                    <div style={{ fontWeight: 700, fontSize: 13, color: '#EF4444' }}>⚠ 2 Missing Keywords</div>
                    <div style={{ fontSize: 12, color: 'var(--ink2)' }}>Add "Redis Caching" & "AWS ECS"</div>
                  </div>
                </div>
              </div>
            )}

            {feature.interactiveType === 'developer-card' && (
              <div style={{ padding: 20, borderRadius: 12, background: 'var(--bg)', border: '1px solid var(--line)' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ width: 40, height: 40, borderRadius: 10, background: '#1F2937', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800 }}>GH</div>
                    <div>
                      <div style={{ fontWeight: 800, fontSize: 15 }}>github.com/nagm-dev</div>
                      <div style={{ fontSize: 12, color: 'var(--ink2)' }}>18 Public Repos · 667 Stars</div>
                    </div>
                  </div>
                  <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 8px', borderRadius: 6, background: 'rgba(16, 185, 129, 0.12)', color: '#10B981' }}>
                    ✓ Verified Senior Developer
                  </span>
                </div>
                <div style={{ display: 'flex', gap: 6, height: 8, borderRadius: 4, overflow: 'hidden', marginBottom: 8 }}>
                  <div style={{ width: '44%', background: '#3572A5' }} title="Python 44%" />
                  <div style={{ width: '31%', background: '#3178C6' }} title="TypeScript 31%" />
                  <div style={{ width: '16%', background: '#00ADD8' }} title="Go 16%" />
                  <div style={{ width: '9%', background: '#F7DF1E' }} title="JavaScript 9%" />
                </div>
                <div style={{ fontSize: 12, color: 'var(--ink3)', display: 'flex', gap: 12 }}>
                  <span>● Python 44%</span>
                  <span>● TypeScript 31%</span>
                  <span>● Go 16%</span>
                </div>
              </div>
            )}

            {(feature.interactiveType === 'match-radar' || feature.interactiveType === 'rediscovery' || feature.interactiveType === 'kyb-audit') && (
              <div style={{ padding: 20, borderRadius: 12, background: 'var(--bg)', border: '1px solid var(--line)' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12 }}>
                  <div style={{ padding: 12, borderRadius: 8, background: 'var(--panel)', border: '1px solid var(--line)' }}>
                    <div style={{ fontSize: 12, color: 'var(--ink3)', fontWeight: 600 }}>Vector Dimension 1</div>
                    <div style={{ fontWeight: 800, fontSize: 15, marginTop: 4 }}>Skill Match: 96%</div>
                  </div>
                  <div style={{ padding: 12, borderRadius: 8, background: 'var(--panel)', border: '1px solid var(--line)' }}>
                    <div style={{ fontSize: 12, color: 'var(--ink3)', fontWeight: 600 }}>Vector Dimension 2</div>
                    <div style={{ fontWeight: 800, fontSize: 15, marginTop: 4 }}>Years Experience: 5.5 yrs</div>
                  </div>
                  <div style={{ padding: 12, borderRadius: 8, background: 'var(--panel)', border: '1px solid var(--line)' }}>
                    <div style={{ fontSize: 12, color: 'var(--ink3)', fontWeight: 600 }}>Vector Dimension 3</div>
                    <div style={{ fontWeight: 800, fontSize: 15, marginTop: 4 }}>Arabic/English: Bilingual</div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* 3 Core Value Benefits */}
      <section style={{ padding: '60px 0', borderBottom: '1px solid var(--line)' }}>
        <div style={container}>
          <h2 style={{ fontSize: 28, fontWeight: 800, letterSpacing: '-0.02em', textAlign: 'center', marginBottom: 40 }}>
            Key Capabilities & Strategic Advantages
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 24 }}>
            {feature.benefits.map((b) => (
              <div key={b.title} style={{ padding: 28, borderRadius: 16, background: 'var(--panel)', border: '1px solid var(--line)', display: 'flex', flexDirection: 'column' }}>
                {b.stat && (
                  <div style={{ marginBottom: 12 }}>
                    <div style={{ fontSize: 32, fontWeight: 800, color: feature.categoryColor }}>{b.stat}</div>
                    <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--ink3)' }}>{b.statLabel}</div>
                  </div>
                )}
                <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>{b.title}</h3>
                <p style={{ fontSize: 14, color: 'var(--ink2)', lineHeight: 1.6, margin: 0 }}>{b.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works (3 Steps) */}
      <section style={{ padding: '60px 0', borderBottom: '1px solid var(--line)', background: 'var(--bg2)' }}>
        <div style={container}>
          <div style={{ textAlign: 'center', marginBottom: 40 }}>
            <h2 style={{ fontSize: 28, fontWeight: 800, letterSpacing: '-0.02em', marginBottom: 8 }}>How It Works</h2>
            <p style={{ color: 'var(--ink2)', fontSize: 16 }}>Simple, automated 3-step workflow.</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 20 }}>
            {feature.steps.map((s) => (
              <div key={s.number} style={{ padding: 24, borderRadius: 16, background: 'var(--panel)', border: '1px solid var(--line)' }}>
                <div style={{ fontSize: 18, fontWeight: 800, color: feature.categoryColor, marginBottom: 10 }}>{s.number}</div>
                <h3 style={{ fontSize: 17, fontWeight: 700, marginBottom: 8 }}>{s.title}</h3>
                <p style={{ fontSize: 14, color: 'var(--ink2)', lineHeight: 1.6, margin: 0 }}>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQs */}
      <section style={{ padding: '60px 0', borderBottom: '1px solid var(--line)' }}>
        <div style={{ ...container, maxWidth: 840 }}>
          <h2 style={{ fontSize: 28, fontWeight: 800, letterSpacing: '-0.02em', textAlign: 'center', marginBottom: 32 }}>
            Frequently Asked Questions
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {feature.faqs.map((faq) => (
              <div key={faq.q} style={{ padding: 20, borderRadius: 14, background: 'var(--panel)', border: '1px solid var(--line)' }}>
                <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 6 }}>{faq.q}</h3>
                <p style={{ fontSize: 14, color: 'var(--ink2)', lineHeight: 1.6, margin: 0 }}>{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <footer style={{ padding: '60px 0', background: 'var(--navbg)', textAlign: 'center' }}>
        <div style={container}>
          <h2 style={{ fontSize: 30, fontWeight: 800, marginBottom: 12 }}>Ready to Get Started with {feature.title}?</h2>
          <p style={{ color: 'var(--ink2)', fontSize: 16, marginBottom: 28, maxWidth: 540, margin: '0 auto 28px' }}>
            Experience the future of Arabic-first intelligent hiring and career acceleration on Nagm.io.
          </p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <button
              onClick={() => navigate('/register', { state: { role: feature.primaryCtaRole } })}
              style={{ padding: '14px 28px', borderRadius: 12, border: 'none', background: 'var(--grad)', color: '#fff', fontWeight: 700, fontSize: 16, cursor: 'pointer' }}
            >
              {feature.primaryCtaText}
            </button>
            <button
              onClick={() => navigate('/')}
              style={{ padding: '14px 24px', borderRadius: 12, border: '1px solid var(--line)', background: 'var(--panel)', color: 'var(--ink)', fontWeight: 600, fontSize: 15, cursor: 'pointer' }}
            >
              Explore All Features
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default FeatureDetail;
