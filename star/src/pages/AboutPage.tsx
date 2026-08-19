import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { productColumns, solutionsColumns, whyNagmColumns } from '../components/MegaMenu';

const Mark = ({ size = 32 }: { size?: number }) => (
  <div style={{
    width: size, height: size, borderRadius: size * 0.28,
    background: 'var(--grad)', color: '#fff', display: 'flex',
    alignItems: 'center', justifyContent: 'center', fontWeight: 800,
    fontSize: size * 0.5, flexShrink: 0
  }}>N</div>
);

export const AboutPage: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'employer' | 'candidate' | 'platform' | 'moat' | 'team'>('employer');
  const [dark, setDark] = useState<boolean>(() =>
    typeof document !== 'undefined' && document.documentElement.classList.contains('dark'),
  );

  const toggleTheme = () => {
    const el = document.documentElement;
    el.classList.toggle('dark');
    setDark(el.classList.contains('dark'));
  };

  const container: React.CSSProperties = { maxWidth: 1180, margin: '0 auto', padding: '0 24px' };

  return (
    <div style={{ background: 'var(--bg)', color: 'var(--ink)', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Top Navigation */}
      <header style={{ position: 'sticky', top: 0, zIndex: 50, backdropFilter: 'blur(16px)', background: 'var(--navbg)', borderBottom: '1px solid var(--line)' }}>
        <div style={{ ...container, minHeight: 66, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer' }} onClick={() => navigate('/')}>
            <Mark size={32} />
            <span style={{ fontSize: 20, fontWeight: 800, letterSpacing: '-.02em' }}>Nagm.io</span>
            <span style={{ fontSize: 12, fontWeight: 600, padding: '2px 8px', borderRadius: 6, background: 'rgba(99, 102, 241, 0.1)', color: '#6366F1' }}>
              Product Ecosystem
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <button
              onClick={() => navigate('/')}
              style={{
                fontSize: 14, fontWeight: 600, padding: '8px 14px', borderRadius: 8,
                border: '1px solid var(--line)', background: 'var(--panel)', color: 'var(--ink2)', cursor: 'pointer'
              }}
            >
              ← Back to Home
            </button>
            <button
              onClick={toggleTheme}
              title="Toggle theme"
              style={{
                width: 40, height: 40, borderRadius: 8, border: '1px solid var(--line)',
                background: 'var(--panel)', color: 'var(--ink2)', cursor: 'pointer', display: 'flex',
                alignItems: 'center', justifyContent: 'center'
              }}
            >
              {dark ? '☀️' : '🌙'}
            </button>
            <button
              onClick={() => navigate('/register', { state: { role: 'recruiter' } })}
              style={{
                padding: '9px 18px', borderRadius: 8, border: 'none',
                background: 'var(--grad)', color: '#fff', fontWeight: 700, fontSize: 14, cursor: 'pointer'
              }}
            >
              Hire with Nagm
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section style={{ padding: '60px 0 40px', textAlign: 'center', borderBottom: '1px solid var(--line)', background: 'linear-gradient(180deg, rgba(99,102,241,0.03) 0%, transparent 100%)' }}>
        <div style={container}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '6px 14px', borderRadius: 999, background: 'rgba(99, 102, 241, 0.08)', color: '#6366F1', fontWeight: 600, fontSize: 13, marginBottom: 16 }}>
            <span>🌟</span>
            <span>The AI-Native, Arabic-First Intelligent Hiring Infrastructure</span>
          </div>
          <h1 style={{ fontSize: 'clamp(28px, 4vw, 44px)', fontWeight: 800, letterSpacing: '-0.03em', lineHeight: 1.15, maxWidth: 840, margin: '0 auto 16px' }}>
            Built for MENA Talent. Engineered for Modern Employers.
          </h1>
          <p style={{ fontSize: 18, color: 'var(--ink2)', maxWidth: 720, margin: '0 auto 32px', lineHeight: 1.6 }}>
            Nagm bridges emerging market talent with ambitious companies through automated ATS scoring, 6-dimensional semantic matching, instant BiDi Arabic resume generation, and enterprise KYB corporate verification.
          </p>

          {/* Quick Metrics Bar */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 16, maxWidth: 880, margin: '0 auto', padding: '20px', borderRadius: 16, background: 'var(--panel)', border: '1px solid var(--line)' }}>
            <div>
              <div style={{ fontSize: 28, fontWeight: 800, color: '#6366F1' }}>667+</div>
              <div style={{ fontSize: 12, color: 'var(--ink2)', fontWeight: 600 }}>Active Candidates</div>
            </div>
            <div>
              <div style={{ fontSize: 28, fontWeight: 800, color: '#EC4899' }}>53</div>
              <div style={{ fontSize: 12, color: 'var(--ink2)', fontWeight: 600 }}>Created Jobs</div>
            </div>
            <div>
              <div style={{ fontSize: 28, fontWeight: 800, color: '#10B981' }}>245+</div>
              <div style={{ fontSize: 12, color: 'var(--ink2)', fontWeight: 600 }}>AI Resume Scans</div>
            </div>
            <div>
              <div style={{ fontSize: 28, fontWeight: 800, color: '#F59E0B' }}>10</div>
              <div style={{ fontSize: 12, color: 'var(--ink2)', fontWeight: 600 }}>Corporate Workspaces</div>
            </div>
            <div>
              <div style={{ fontSize: 28, fontWeight: 800, color: '#3B82F6' }}>$120/mo</div>
              <div style={{ fontSize: 12, color: 'var(--ink2)', fontWeight: 600 }}>Affordable SaaS ACV</div>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Tabs */}
      <section style={{ padding: '30px 0 60px', flex: 1 }}>
        <div style={container}>
          {/* Tab Controls */}
          <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 12, borderBottom: '1px solid var(--line)', marginBottom: 40 }}>
            {[
              { id: 'employer', label: '💼 Employer & ATS Suite', color: '#6366F1' },
              { id: 'candidate', label: '🚀 Candidate Career Suite', color: '#EC4899' },
              { id: 'platform', label: '⚡ Platform & Intelligence', color: '#10B981' },
              { id: 'moat', label: '🛡️ The Competitive Moat', color: '#3B82F6' },
              { id: 'team', label: '👥 Team & Vision', color: '#F59E0B' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                style={{
                  padding: '12px 20px', borderRadius: 10, fontWeight: 700, fontSize: 15,
                  border: activeTab === tab.id ? `2px solid ${tab.color}` : '1px solid var(--line)',
                  background: activeTab === tab.id ? 'var(--panel)' : 'transparent',
                  color: activeTab === tab.id ? tab.color : 'var(--ink2)',
                  cursor: 'pointer', whiteSpace: 'nowrap', transition: 'all 0.2s ease',
                  display: 'flex', alignItems: 'center', gap: 8
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* TAB 1: Employer & ATS Suite */}
          {activeTab === 'employer' && (
            <div>
              <div style={{ marginBottom: 32 }}>
                <h2 style={{ fontSize: 28, fontWeight: 800, letterSpacing: '-0.02em', marginBottom: 8 }}>
                  End-to-End Recruitment Suite for Modern Hiring Teams
                </h2>
                <p style={{ color: 'var(--ink2)', fontSize: 16, maxWidth: 780 }}>
                  Everything you need to source, screen, interview, verify, and hire the top 5% of applicants without spending hours manually sifting through unstructured CVs.
                </p>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 24 }}>
                {productColumns[0].items.map((feat) => (
                  <div
                    key={feat.title}
                    id={feat.href.split('#')[1]}
                    style={{
                      padding: 24, borderRadius: 16, background: 'var(--panel)', border: '1px solid var(--line)',
                      display: 'flex', flexDirection: 'column', gap: 12
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span style={{ fontSize: 32 }}>{feat.icon}</span>
                      {feat.badge && (
                        <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 8px', borderRadius: 6, background: 'rgba(99, 102, 241, 0.12)', color: '#6366F1' }}>
                          {feat.badge}
                        </span>
                      )}
                    </div>
                    <h3 style={{ fontSize: 19, fontWeight: 700, margin: 0 }}>{feat.title}</h3>
                    <p style={{ color: 'var(--ink2)', fontSize: 14, lineHeight: 1.6, margin: 0, flex: 1 }}>{feat.desc}</p>
                    <div style={{ paddingTop: 12, borderTop: '1px dashed var(--line)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span style={{ fontSize: 12, fontWeight: 600, color: '#6366F1' }}>Production Live</span>
                      <button
                        onClick={() => navigate('/register', { state: { role: 'recruiter' } })}
                        style={{ background: 'none', border: 'none', color: 'var(--ink)', fontWeight: 600, fontSize: 13, cursor: 'pointer' }}
                      >
                        Try Feature →
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Recruitment Solution Callout */}
              <div style={{ marginTop: 40, padding: 32, borderRadius: 20, background: 'linear-gradient(135deg, rgba(99,102,241,0.08) 0%, rgba(236,72,153,0.08) 100%)', border: '1px solid var(--line)' }}>
                <h3 style={{ fontSize: 22, fontWeight: 800, marginBottom: 8 }}>Target Verticals & High-Volume Hiring</h3>
                <p style={{ color: 'var(--ink2)', fontSize: 15, marginBottom: 20, maxWidth: 760 }}>
                  Engineered specifically for high-turnover regional sectors: Sales & Care, Retail & Hospitality, K-12 Education, and Logistics.
                </p>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16 }}>
                  {solutionsColumns[0].items.map((vert) => (
                    <div key={vert.title} style={{ padding: 16, borderRadius: 12, background: 'var(--panel)', border: '1px solid var(--line)' }}>
                      <div style={{ fontSize: 24, marginBottom: 6 }}>{vert.icon}</div>
                      <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 4 }}>{vert.title}</div>
                      <div style={{ fontSize: 13, color: 'var(--ink2)' }}>{vert.desc}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: Candidate Career Suite */}
          {activeTab === 'candidate' && (
            <div>
              <div style={{ marginBottom: 32 }}>
                <h2 style={{ fontSize: 28, fontWeight: 800, letterSpacing: '-0.02em', marginBottom: 8 }}>
                  Candidate Career Suite: Turn Your Experience into Career Capital
                </h2>
                <p style={{ color: 'var(--ink2)', fontSize: 16, maxWidth: 780 }}>
                  Empowering job seekers across Egypt & the GCC with native Arabic/English resume generation, deep AI feedback, and real-time application tracking.
                </p>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 24 }}>
                {productColumns[1].items.map((feat) => (
                  <div
                    key={feat.title}
                    id={feat.href.split('#')[1]}
                    style={{
                      padding: 24, borderRadius: 16, background: 'var(--panel)', border: '1px solid var(--line)',
                      display: 'flex', flexDirection: 'column', gap: 12
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span style={{ fontSize: 32 }}>{feat.icon}</span>
                      {feat.badge && (
                        <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 8px', borderRadius: 6, background: 'rgba(236, 72, 153, 0.12)', color: '#EC4899' }}>
                          {feat.badge}
                        </span>
                      )}
                    </div>
                    <h3 style={{ fontSize: 19, fontWeight: 700, margin: 0 }}>{feat.title}</h3>
                    <p style={{ color: 'var(--ink2)', fontSize: 14, lineHeight: 1.6, margin: 0, flex: 1 }}>{feat.desc}</p>
                    <div style={{ paddingTop: 12, borderTop: '1px dashed var(--line)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span style={{ fontSize: 12, fontWeight: 600, color: '#EC4899' }}>Candidate Feature</span>
                      <button
                        onClick={() => navigate('/register')}
                        style={{ background: 'none', border: 'none', color: 'var(--ink)', fontWeight: 600, fontSize: 13, cursor: 'pointer' }}
                      >
                        Create Free Profile →
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* BiDi Highlighting Box */}
              <div style={{ marginTop: 40, padding: 32, borderRadius: 20, background: 'var(--panel)', border: '1px solid var(--line)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                  <span style={{ fontSize: 28 }}>🇪🇬 🇸🇦 🇦🇪</span>
                  <h3 style={{ fontSize: 22, fontWeight: 800, margin: 0 }}>True Arabic RTL BiDi Technology</h3>
                </div>
                <p style={{ color: 'var(--ink2)', fontSize: 15, lineHeight: 1.7, maxWidth: 820 }}>
                  Global ATS systems (like Workday, Taleo, and Greenhouse) notoriously corrupt Arabic letters, inverting text order and rendering qualified MENA resumes as 0% matches. Nagm's PDF engine renders native Noto Sans Arabic typography with perfect Bidirectional (BiDi) flow, ensuring every applicant's qualifications are parsed cleanly.
                </p>
              </div>
            </div>
          )}

          {/* TAB 3: Platform & Intelligence */}
          {activeTab === 'platform' && (
            <div>
              <div style={{ marginBottom: 32 }}>
                <h2 style={{ fontSize: 28, fontWeight: 800, letterSpacing: '-0.02em', marginBottom: 8 }}>
                  High-Scale AI Intelligence & Enterprise Multi-Tenancy
                </h2>
                <p style={{ color: 'var(--ink2)', fontSize: 16, maxWidth: 780 }}>
                  Under the hood, Nagm operates a hybrid AI model router, AES-256 encrypted connector adapters, and multi-tenant schema isolation.
                </p>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 24 }}>
                {productColumns[2].items.map((feat) => (
                  <div
                    key={feat.title}
                    id={feat.href.split('#')[1]}
                    style={{
                      padding: 24, borderRadius: 16, background: 'var(--panel)', border: '1px solid var(--line)',
                      display: 'flex', flexDirection: 'column', gap: 12
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span style={{ fontSize: 32 }}>{feat.icon}</span>
                      {feat.badge && (
                        <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 8px', borderRadius: 6, background: 'rgba(16, 185, 129, 0.12)', color: '#10B981' }}>
                          {feat.badge}
                        </span>
                      )}
                    </div>
                    <h3 style={{ fontSize: 19, fontWeight: 700, margin: 0 }}>{feat.title}</h3>
                    <p style={{ color: 'var(--ink2)', fontSize: 14, lineHeight: 1.6, margin: 0, flex: 1 }}>{feat.desc}</p>
                    <div style={{ paddingTop: 12, borderTop: '1px dashed var(--line)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span style={{ fontSize: 12, fontWeight: 600, color: '#10B981' }}>Architecture Layer</span>
                      <span style={{ fontSize: 13, color: 'var(--ink2)' }}>Scalable Infra</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: The Competitive Moat */}
          {activeTab === 'moat' && (
            <div>
              <div style={{ marginBottom: 32 }}>
                <h2 style={{ fontSize: 28, fontWeight: 800, letterSpacing: '-0.02em', marginBottom: 8 }}>
                  Competitive Moat: Why Nagm Replaces Legacy Job Boards
                </h2>
                <p style={{ color: 'var(--ink2)', fontSize: 16, maxWidth: 780 }}>
                  A clear comparison illustrating Nagm's structural advantages over legacy regional boards (Wuzzuf, Bayt) and Western enterprise platforms (Greenhouse, Workday).
                </p>
              </div>

              {/* Side-by-side Table */}
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
                      {
                        cap: 'Arabic BiDi PDF Engine',
                        nagm: '✅ Native RTL (Zero Corruption)',
                        legacy: '⚠️ Text Corruption / Reversed',
                        western: '❌ Incompatible / 0% Match',
                      },
                      {
                        cap: 'Corporate KYB Verification',
                        nagm: '✅ Automated OCR (CR & Tax IDs)',
                        legacy: '❌ Unvetted / Ghost Listings',
                        western: '⚠️ No Regional Verification',
                      },
                      {
                        cap: 'Candidate Rediscovery',
                        nagm: '✅ 1-Click Zero Cost Recycling',
                        legacy: '❌ Pay Per Search / Re-source',
                        western: '⚠️ Complex Setup / Clunky',
                      },
                      {
                        cap: 'Verified Developer Connectors',
                        nagm: '✅ GitHub Code & Skill Analysis',
                        legacy: '❌ None / Keyword only',
                        western: '❌ None / Paid Addon',
                      },
                      {
                        cap: 'Candidate Status Tracking',
                        nagm: '✅ Real-time Anti-Ghosting Alerts',
                        legacy: '❌ Resume Black Hole (75% unnotified)',
                        western: '⚠️ Generic Auto-rejection',
                      },
                      {
                        cap: 'Pricing Structure',
                        nagm: '✅ $1,440/yr ($120/mo) Flat SaaS',
                        legacy: '❌ Expensive Postings ($200+/job)',
                        western: '❌ $10,000+ Enterprise Seats',
                      },
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

              {/* 3 Pillar Explanations */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 20, marginTop: 32 }}>
                {whyNagmColumns[0].items.slice(1).map((item) => (
                  <div key={item.title} style={{ padding: 20, borderRadius: 14, background: 'var(--panel)', border: '1px solid var(--line)' }}>
                    <div style={{ fontSize: 24, marginBottom: 8 }}>{item.icon}</div>
                    <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 6 }}>{item.title}</div>
                    <div style={{ fontSize: 13, color: 'var(--ink2)', lineHeight: 1.6 }}>{item.desc}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 5: Team & Vision */}
          {activeTab === 'team' && (
            <div>
              <div style={{ marginBottom: 32 }}>
                <h2 style={{ fontSize: 28, fontWeight: 800, letterSpacing: '-0.02em', marginBottom: 8 }}>
                  Leadership Team & Core Engineering
                </h2>
                <p style={{ color: 'var(--ink2)', fontSize: 16, maxWidth: 780 }}>
                  Founded by seasoned software engineers, AI researchers, strategic angel investors, and growth marketers.
                </p>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 20 }}>
                {[
                  {
                    name: 'Mahmoud Mostafa',
                    role: 'Founder — AI Engineering',
                    desc: 'Leads core AI engineering, Arabic NLP dialect models, and matching algorithms.',
                    tag: 'AI Engineering Lead',
                  },
                  {
                    name: 'Ahmed Hashem',
                    role: 'Co-Founder — AI Consultant',
                    desc: 'AI strategy, LLM architecture, and candidate data layer scalability.',
                    tag: 'AI Strategy',
                  },
                  {
                    name: 'Mahmoud Hamed',
                    role: 'Co-Founder — Sr. Developer',
                    desc: 'Full-stack development, WhatsApp API architecture, and platform engineering.',
                    tag: 'Full-Stack Lead',
                  },
                  {
                    name: 'Mahmoud Hashem',
                    role: 'Angel Investor & Advisor',
                    desc: 'Strategic advisor driving investor relations, capital allocation, and GCC expansion.',
                    tag: 'Strategic Investment',
                  },
                  {
                    name: 'Yusuf Sweilm',
                    role: 'Marketing Consultant',
                    desc: 'Growth marketing, customer acquisition channels, and regional strategy.',
                    tag: 'Growth Marketing',
                  },
                ].map((member) => (
                  <div key={member.name} style={{ padding: 24, borderRadius: 16, background: 'var(--panel)', border: '1px solid var(--line)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                      <div style={{ width: 44, height: 44, borderRadius: 12, background: 'var(--grad)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 18 }}>
                        {member.name.charAt(0)}
                      </div>
                      <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 8px', borderRadius: 6, background: 'rgba(99, 102, 241, 0.1)', color: '#6366F1' }}>
                        {member.tag}
                      </span>
                    </div>
                    <div style={{ fontWeight: 800, fontSize: 17, marginBottom: 2 }}>{member.name}</div>
                    <div style={{ fontSize: 13, color: '#6366F1', fontWeight: 600, marginBottom: 10 }}>{member.role}</div>
                    <p style={{ fontSize: 13, color: 'var(--ink2)', lineHeight: 1.6, margin: 0 }}>{member.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Bottom CTA Banner */}
      <footer style={{ padding: '50px 0', borderTop: '1px solid var(--line)', background: 'var(--navbg)', textAlign: 'center' }}>
        <div style={container}>
          <h2 style={{ fontSize: 28, fontWeight: 800, marginBottom: 12 }}>Ready to Transform Your Hiring or Career?</h2>
          <p style={{ color: 'var(--ink2)', fontSize: 16, marginBottom: 24, maxWidth: 600, margin: '0 auto 24px' }}>
            Join hundreds of ambitious candidates and verified regional employers using Nagm.io today.
          </p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <button
              onClick={() => navigate('/register', { state: { role: 'recruiter' } })}
              style={{
                padding: '12px 24px', borderRadius: 10, border: 'none',
                background: 'var(--grad)', color: '#fff', fontWeight: 700, fontSize: 15, cursor: 'pointer'
              }}
            >
              Start Hiring as a Company ($120/mo)
            </button>
            <button
              onClick={() => navigate('/register')}
              style={{
                padding: '12px 24px', borderRadius: 10, border: '1px solid var(--line)',
                background: 'var(--panel)', color: 'var(--ink)', fontWeight: 700, fontSize: 15, cursor: 'pointer'
              }}
            >
              Create Candidate CV (Free)
            </button>
          </div>
          <div style={{ marginTop: 32, fontSize: 13, color: 'var(--ink3)' }}>
            © {new Date().getFullYear()} Nagm.io — AI-Native Talent Infrastructure. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default AboutPage;
