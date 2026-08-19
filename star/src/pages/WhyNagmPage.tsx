import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

const Mark = ({ size = 30 }: { size?: number }) => (
  <div style={{ width: size, height: size, borderRadius: size * 0.28, background: 'var(--grad)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: size * 0.5, flexShrink: 0 }}>N</div>
);

export const WhyNagmPage: React.FC = () => {
  const navigate = useNavigate();
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
      {/* Header */}
      <header style={{ position: 'sticky', top: 0, zIndex: 50, backdropFilter: 'blur(16px)', background: 'var(--navbg)', borderBottom: '1px solid var(--line)' }}>
        <div style={{ ...container, minHeight: 66, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }} onClick={() => navigate('/')}>
            <Mark size={30} />
            <span style={{ fontSize: 19, fontWeight: 800, letterSpacing: '-.02em' }}>Nagm</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <Link to="/" style={{ fontSize: 14, fontWeight: 600, color: 'var(--ink2)', textDecoration: 'none', padding: '8px 12px', borderRadius: 8 }}>
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
              onClick={() => navigate('/register', { state: { role: 'recruiter' } })}
              style={{ padding: '9px 18px', borderRadius: 8, border: 'none', background: 'var(--grad)', color: '#fff', fontWeight: 700, fontSize: 14, cursor: 'pointer' }}
            >
              Switch to Nagm
            </button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section style={{ padding: '60px 0 40px', borderBottom: '1px solid var(--line)', background: 'linear-gradient(180deg, rgba(59,130,246,0.03) 0%, transparent 100%)', textAlign: 'center' }}>
        <div style={container}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '6px 14px', borderRadius: 999, background: 'rgba(59, 130, 246, 0.08)', color: '#3B82F6', fontWeight: 600, fontSize: 13, marginBottom: 16 }}>
            <span>🛡️</span>
            <span>Why Modern MENA Teams Choose Nagm</span>
          </div>
          <h1 style={{ fontSize: 'clamp(28px, 4.5vw, 46px)', fontWeight: 800, letterSpacing: '-0.03em', lineHeight: 1.15, maxWidth: 880, margin: '0 auto 18px' }}>
            The AI-Native Alternative to Broken Legacy Job Boards
          </h1>
          <p style={{ fontSize: 18, color: 'var(--ink2)', maxWidth: 740, margin: '0 auto 36px', lineHeight: 1.6 }}>
            Legacy regional job sites treat resumes as PDFs and charge for every job post. Western enterprise ATSs corrupt Arabic typography and cost thousands. Nagm gives you an end-to-end modern hiring operating system designed specifically for the Middle East.
          </p>

          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <button
              onClick={() => navigate('/register', { state: { role: 'recruiter' } })}
              style={{ padding: '14px 28px', borderRadius: 12, border: 'none', background: 'var(--grad)', color: '#fff', fontWeight: 700, fontSize: 16, cursor: 'pointer' }}
            >
              Start Hiring with Nagm ($120/mo)
            </button>
            <button
              onClick={() => navigate('/register')}
              style={{ padding: '14px 24px', borderRadius: 12, border: '1px solid var(--line)', background: 'var(--panel)', color: 'var(--ink)', fontWeight: 600, fontSize: 15, cursor: 'pointer' }}
            >
              Create Free Candidate CV
            </button>
          </div>
        </div>
      </section>

      {/* 4 Pillars of Unfair Advantage */}
      <section style={{ padding: '60px 0', borderBottom: '1px solid var(--line)' }}>
        <div style={container}>
          <h2 style={{ fontSize: 28, fontWeight: 800, letterSpacing: '-0.02em', textAlign: 'center', marginBottom: 40 }}>
            4 Structural Advantages That Make Nagm Different
          </h2>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 24 }}>
            <div style={{ padding: 28, borderRadius: 16, background: 'var(--panel)', border: '1px solid var(--line)' }}>
              <div style={{ fontSize: 32, marginBottom: 12 }}>🇪🇬 🇸🇦 🇦🇪</div>
              <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>Native Arabic BiDi Engine</h3>
              <p style={{ fontSize: 14, color: 'var(--ink2)', lineHeight: 1.6, margin: 0 }}>
                Traditional ATS platforms invert Arabic letters or render disjointed characters, ranking qualified candidates at 0%. Nagm's bidirectional rendering ensures perfect font and layout fidelity in both Arabic and English.
              </p>
            </div>

            <div style={{ padding: 28, borderRadius: 16, background: 'var(--panel)', border: '1px solid var(--line)' }}>
              <div style={{ fontSize: 32, marginBottom: 12 }}>🔔</div>
              <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>Anti-Ghosting Guarantee</h3>
              <p style={{ fontSize: 14, color: 'var(--ink2)', lineHeight: 1.6, margin: 0 }}>
                Over 75% of regional job applicants never receive a response from legacy boards. Nagm syncs stage progression automatically, sending real-time application updates to respect candidate time.
              </p>
            </div>

            <div style={{ padding: 28, borderRadius: 16, background: 'var(--panel)', border: '1px solid var(--line)' }}>
              <div style={{ fontSize: 32, marginBottom: 12 }}>🛡️</div>
              <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>Fraud-Free Verified Employers</h3>
              <p style={{ fontSize: 14, color: 'var(--ink2)', lineHeight: 1.6, margin: 0 }}>
                Phantom and scam job posts plague free job boards. Nagm requires automated OCR auditing of official Commercial Registrations and Tax Cards before any company can publish vacancies.
              </p>
            </div>

            <div style={{ padding: 28, borderRadius: 16, background: 'var(--panel)', border: '1px solid var(--line)' }}>
              <div style={{ fontSize: 32, marginBottom: 12 }}>🔁</div>
              <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>1-Click Candidate Rediscovery</h3>
              <p style={{ fontSize: 14, color: 'var(--ink2)', lineHeight: 1.6, margin: 0 }}>
                Instead of paying hundreds of dollars every time you open a new job, Nagm automatically scans and ranks past high-scoring runner-ups from your talent pool at zero additional cost.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Side-by-Side Comparison Matrix */}
      <section style={{ padding: '60px 0', borderBottom: '1px solid var(--line)', background: 'var(--bg2)' }}>
        <div style={container}>
          <div style={{ textAlign: 'center', marginBottom: 36 }}>
            <h2 style={{ fontSize: 28, fontWeight: 800, letterSpacing: '-0.02em', marginBottom: 8 }}>Direct Feature Comparison</h2>
            <p style={{ color: 'var(--ink2)', fontSize: 16 }}>See how Nagm compares against legacy boards and enterprise ATS software.</p>
          </div>

          <div style={{ overflowX: 'auto', borderRadius: 16, border: '1px solid var(--line)', background: 'var(--panel)' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: 14 }}>
              <thead>
                <tr style={{ background: 'var(--navbg)', borderBottom: '2px solid var(--line)' }}>
                  <th style={{ padding: '16px 20px', fontWeight: 800 }}>Feature / Capability</th>
                  <th style={{ padding: '16px 20px', fontWeight: 800, color: '#6366F1' }}>🌟 Nagm.io</th>
                  <th style={{ padding: '16px 20px', fontWeight: 600, color: 'var(--ink2)' }}>Legacy Regional Job Boards</th>
                  <th style={{ padding: '16px 20px', fontWeight: 600, color: 'var(--ink2)' }}>Western Enterprise ATS</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { cap: 'Arabic BiDi PDF Engine', nagm: '✅ Native RTL (Zero Corruption)', legacy: '⚠️ Text Corruption / Inverted', western: '❌ Incompatible / 0% Match' },
                  { cap: 'Corporate KYB Verification', nagm: '✅ Automated OCR (CR & Tax IDs)', legacy: '❌ Unvetted / Ghost Listings', western: '⚠️ No Regional Verification' },
                  { cap: 'Candidate Rediscovery', nagm: '✅ 1-Click Zero Cost Recycling', legacy: '❌ Pay Per Search / Re-source', western: '⚠️ Complex Setup / Clunky' },
                  { cap: 'Verified Developer Connectors', nagm: '✅ GitHub Code & Skill Analysis', legacy: '❌ None / Keyword only', western: '❌ None / Paid Addon' },
                  { cap: 'Candidate Status Tracking', nagm: '✅ Real-time Anti-Ghosting Alerts', legacy: '❌ Resume Black Hole (75% unnotified)', western: '⚠️ Generic Auto-rejection' },
                  { cap: 'Pricing Structure', nagm: '✅ $1,440/yr ($120/mo) Flat SaaS', legacy: '❌ Expensive Postings ($200+/job)', western: '❌ $10,000+ Enterprise Seats' },
                ].map((row, idx) => (
                  <tr key={row.cap} style={{ borderBottom: '1px solid var(--line)', background: idx % 2 === 0 ? 'transparent' : 'rgba(99, 102, 241, 0.02)' }}>
                    <td style={{ padding: '16px 20px', fontWeight: 700 }}>{row.cap}</td>
                    <td style={{ padding: '16px 20px', fontWeight: 700, color: '#6366F1' }}>{row.nagm}</td>
                    <td style={{ padding: '16px 20px', color: 'var(--ink2)' }}>{row.legacy}</td>
                    <td style={{ padding: '16px 20px', color: 'var(--ink2)' }}>{row.western}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Footer CTA */}
      <footer style={{ padding: '60px 0', background: 'var(--navbg)', textAlign: 'center', marginTop: 'auto' }}>
        <div style={container}>
          <h2 style={{ fontSize: 30, fontWeight: 800, marginBottom: 12 }}>Ready to Experience Modern Hiring?</h2>
          <p style={{ color: 'var(--ink2)', fontSize: 16, marginBottom: 28, maxWidth: 540, margin: '0 auto 28px' }}>
            Join forward-thinking companies hiring top talent faster and fairer with Nagm.io.
          </p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <button
              onClick={() => navigate('/register', { state: { role: 'recruiter' } })}
              style={{ padding: '14px 28px', borderRadius: 12, border: 'none', background: 'var(--grad)', color: '#fff', fontWeight: 700, fontSize: 16, cursor: 'pointer' }}
            >
              Start Free Company Trial
            </button>
            <button
              onClick={() => navigate('/register')}
              style={{ padding: '14px 24px', borderRadius: 12, border: '1px solid var(--line)', background: 'var(--panel)', color: 'var(--ink)', fontWeight: 600, fontSize: 15, cursor: 'pointer' }}
            >
              Build Your Resume
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default WhyNagmPage;
