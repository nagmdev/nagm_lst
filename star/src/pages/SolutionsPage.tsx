import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { APP_ORIGIN } from '../auth';

interface SolutionInfo {
  slug: string;
  title: string;
  category: string;
  badge: string;
  headline: string;
  subheadline: string;
  icon: string;
  pains: { pain: string; solve: string }[];
  metrics: { value: string; label: string }[];
}

const SOLUTIONS_DATA: Record<string, SolutionInfo> = {
  sales: {
    slug: 'sales',
    title: 'Sales & Customer Care Recruitment',
    category: 'Industry Solution',
    badge: 'High-Volume Hiring',
    headline: 'Hire Top Telesales, Account Execs & BPO Teams Fast',
    subheadline: 'Screen thousands of commercial and customer care applicants in hours with automated Arabic dialect qualification and 6D sales competency scoring.',
    icon: '📞',
    pains: [
      { pain: 'High applicant drop-off & no-shows', solve: 'Real-time candidate notifications and automated interview scheduling.' },
      { pain: 'Unstructured audio & CV qualifications', solve: 'Dialect-aware conversational screening to assess customer communication skills.' },
      { pain: 'High turnover rate', solve: 'Candidate Rediscovery instantly activates qualified past applicants when seats open.' },
    ],
    metrics: [
      { value: '4x', label: 'Faster Screening' },
      { value: '85%', label: 'Interview Show-up Rate' },
      { value: '$0', label: 'Candidate Re-sourcing' },
    ],
  },
  retail: {
    slug: 'retail',
    title: 'Retail & Hospitality Hiring',
    category: 'Industry Solution',
    badge: 'Frontline Staffing',
    headline: 'Staff Retail Stores, Branches & Hospitality Teams',
    subheadline: 'Location-based candidate matching and mobile-friendly onboarding designed for high-turnover regional store networks.',
    icon: '🛍️',
    pains: [
      { pain: 'Paper resumes and walk-in chaos', solve: 'Structured digital candidate profiles filterable by store branch and proximity.' },
      { pain: 'Seasonal hiring surges', solve: 'Bulk applicant ranking with 9-stage visual pipeline management.' },
      { pain: 'Identity verification issues', solve: 'Automated national ID and legal document validation.' },
    ],
    metrics: [
      { value: '1-Click', label: 'Branch Filtering' },
      { value: '72 hrs', label: 'Average Time to Fill' },
      { value: '100%', label: 'Mobile Friendly' },
    ],
  },
  education: {
    slug: 'education',
    title: 'Education & Teacher Acquisition',
    category: 'Industry Solution',
    badge: 'Academic Hiring',
    headline: 'Recruit Vetted K-12 Educators and Academic Specialists',
    subheadline: 'Match verified credentials, subject matter expertise, and teaching experience for private schools and international academies across MENA.',
    icon: '🎓',
    pains: [
      { pain: 'Verifying subject matter certifications', solve: 'Structured academic credential validation and teaching portfolio reviews.' },
      { pain: 'Language fluency assessment', solve: 'Bilingual Arabic & English profile evaluation and video interview prompts.' },
      { pain: 'Strict term start deadlines', solve: 'Shortlist top candidates in days before the academic semester begins.' },
    ],
    metrics: [
      { value: '96%', label: 'Credential Accuracy' },
      { value: '2.5x', label: 'More Qualified Candidates' },
      { value: 'Bilingual', label: 'Full Arabic & English' },
    ],
  },
  logistics: {
    slug: 'logistics',
    title: 'Operations & Logistics Recruitment',
    category: 'Industry Solution',
    badge: 'Supply Chain Hiring',
    headline: 'Scale Warehouse, Fleet & Supply Chain Personnel',
    subheadline: 'Fast, automated applicant intake designed for fast-paced fulfillment centers and regional last-mile delivery fleets.',
    icon: '🚚',
    pains: [
      { pain: 'Non-desktop applicants unable to submit PDF CVs', solve: 'Mobile conversational intake that builds structured profiles via messaging.' },
      { pain: 'Urgent warehouse surge requirements', solve: 'Instant candidate rediscovery to fill urgent fulfillment shifts.' },
      { pain: 'License & permit verification', solve: 'OCR document extraction for driving licenses and work authorizations.' },
    ],
    metrics: [
      { value: '10x', label: 'Faster Pipeline Intake' },
      { value: '0 PDFs', label: 'Structured Mobile Profiles' },
      { value: '99%', label: 'On-time Shift Staffing' },
    ],
  },
  smb: {
    slug: 'smb',
    title: 'Startups & Growing SMBs',
    category: 'Business Scale',
    badge: 'Cost-Effective SaaS',
    headline: 'Enterprise-Grade Hiring Tools on an SMB Budget',
    subheadline: 'Ditch expensive recruitment agencies. Access unlimited candidate sourcing, AI matching, and visual ATS for just $120/month.',
    icon: '🌱',
    pains: [
      { pain: '$2,000+ recruitment agency fees per hire', solve: 'Flat $120/mo subscription with unlimited candidate discovery.' },
      { pain: 'No dedicated HR team to screen resumes', solve: 'AI automatically highlights the top 5% matches for your immediate review.' },
      { pain: 'Scam job board listings', solve: 'Get a verified company trust badge that attracts high-caliber talent.' },
    ],
    metrics: [
      { value: '$120/mo', label: 'Predictable Flat SaaS' },
      { value: '80%', label: 'Cost Savings vs Agencies' },
      { value: 'Top 5%', label: 'Automated Shortlist' },
    ],
  },
  enterprise: {
    slug: 'enterprise',
    title: 'Enterprise & Multi-Entity Workspaces',
    category: 'Enterprise Solution',
    badge: 'Governance & RBAC',
    headline: 'Multi-Tenant Governance, KYB Compliance & Custom Roles',
    subheadline: 'Built for regional enterprise holding groups requiring segregated entity workspaces, custom approval flows, and local data compliance.',
    icon: '🏢',
    pains: [
      { pain: 'Cross-subsidiary candidate leakage', solve: 'Strict multi-tenant workspace isolation with 6 granular RBAC roles.' },
      { pain: 'Regional compliance & data residence', solve: 'KSA PDPL, UAE privacy alignment, and AES-256 encrypted access.' },
      { pain: 'Audit and security reporting', solve: 'Comprehensive activity history and tamper-evident audit logs.' },
    ],
    metrics: [
      { value: '6 Roles', label: 'Granular RBAC' },
      { value: 'AES-256', label: 'Token Encryption' },
      { value: '100%', label: 'Tenant Isolation' },
    ],
  },
};

const Mark = ({ size = 30 }: { size?: number }) => (
  <div style={{ width: size, height: size, borderRadius: size * 0.28, background: 'var(--grad)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: size * 0.5, flexShrink: 0 }}>N</div>
);

export const SolutionsPage: React.FC = () => {
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

  const solution = slug && SOLUTIONS_DATA[slug] ? SOLUTIONS_DATA[slug] : SOLUTIONS_DATA['sales'];

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
              Hire for {solution.title.split(' ')[0]}
            </button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section style={{ padding: '60px 0 40px', borderBottom: '1px solid var(--line)', background: 'linear-gradient(180deg, rgba(245,158,11,0.03) 0%, transparent 100%)' }}>
        <div style={container}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
            <span style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#F59E0B', background: 'var(--panel)', padding: '4px 10px', borderRadius: 6, border: '1px solid var(--line)' }}>
              {solution.icon} {solution.category}
            </span>
            <span style={{ color: 'var(--ink3)' }}>/</span>
            <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--ink2)' }}>{solution.title}</span>
          </div>

          <h1 style={{ fontSize: 'clamp(28px, 4.5vw, 44px)', fontWeight: 800, letterSpacing: '-0.03em', lineHeight: 1.15, maxWidth: 840, marginBottom: 18 }}>
            {solution.headline}
          </h1>
          <p style={{ fontSize: 18, color: 'var(--ink2)', maxWidth: 760, lineHeight: 1.6, marginBottom: 32 }}>
            {solution.subheadline}
          </p>

          <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', marginBottom: 40 }}>
            <button
              onClick={() => navigate('/register', { state: { role: 'recruiter' } })}
              style={{ padding: '14px 28px', borderRadius: 12, border: 'none', background: 'var(--grad)', color: '#fff', fontWeight: 700, fontSize: 16, cursor: 'pointer', boxShadow: '0 4px 16px var(--brandShadow)' }}
            >
              Start Hiring in this Sector →
            </button>
            <button
              onClick={() => { window.location.href = `${APP_ORIGIN}/jobs`; }}
              style={{ padding: '14px 24px', borderRadius: 12, border: '1px solid var(--line)', background: 'var(--panel)', color: 'var(--ink)', fontWeight: 600, fontSize: 15, cursor: 'pointer' }}
            >
              View Open Roles
            </button>
          </div>

          {/* Quick Metrics */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
            {solution.metrics.map((m) => (
              <div key={m.label} style={{ padding: 20, borderRadius: 14, background: 'var(--panel)', border: '1px solid var(--line)', textAlign: 'center' }}>
                <div style={{ fontSize: 32, fontWeight: 800, color: '#F59E0B' }}>{m.value}</div>
                <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--ink2)', marginTop: 4 }}>{m.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pain Points vs Solutions */}
      <section style={{ padding: '60px 0', borderBottom: '1px solid var(--line)' }}>
        <div style={container}>
          <h2 style={{ fontSize: 28, fontWeight: 800, letterSpacing: '-0.02em', textAlign: 'center', marginBottom: 40 }}>
            Solving the Biggest Challenges in {solution.title}
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 24 }}>
            {solution.pains.map((item, idx) => (
              <div key={idx} style={{ padding: 24, borderRadius: 16, background: 'var(--panel)', border: '1px solid var(--line)', display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div style={{ padding: '8px 12px', borderRadius: 8, background: 'rgba(239, 68, 68, 0.08)', color: '#EF4444', fontSize: 13, fontWeight: 700 }}>
                  ✕ The Old Way: {item.pain}
                </div>
                <div style={{ padding: '12px', borderRadius: 8, background: 'rgba(16, 185, 129, 0.08)', color: 'var(--ink)', fontSize: 14, lineHeight: 1.5 }}>
                  <strong style={{ color: '#10B981', display: 'block', marginBottom: 4 }}>✓ The Nagm Solution:</strong>
                  {item.solve}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Switcher for other solutions */}
      <section style={{ padding: '40px 0 60px', background: 'var(--bg2)' }}>
        <div style={container}>
          <h3 style={{ fontSize: 20, fontWeight: 800, marginBottom: 16 }}>Explore Solutions for Other Verticals:</h3>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            {Object.values(SOLUTIONS_DATA).map((s) => (
              <button
                key={s.slug}
                onClick={() => navigate(`/solutions/${s.slug}`)}
                style={{
                  padding: '10px 16px', borderRadius: 10, border: '1px solid var(--line)',
                  background: s.slug === solution.slug ? '#F59E0B' : 'var(--panel)',
                  color: s.slug === solution.slug ? '#fff' : 'var(--ink)',
                  fontWeight: 700, fontSize: 14, cursor: 'pointer'
                }}
              >
                {s.icon} {s.title.split(' ')[0]}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ padding: '50px 0', background: 'var(--navbg)', textAlign: 'center', marginTop: 'auto' }}>
        <div style={container}>
          <h2 style={{ fontSize: 28, fontWeight: 800, marginBottom: 12 }}>Scale Your Hiring in {solution.title.split(' ')[0]} Today</h2>
          <p style={{ color: 'var(--ink2)', fontSize: 16, marginBottom: 24, maxWidth: 500, margin: '0 auto 24px' }}>
            Get started in minutes with verified candidates and intelligent ATS workflows.
          </p>
          <button
            onClick={() => navigate('/register', { state: { role: 'recruiter' } })}
            style={{ padding: '14px 28px', borderRadius: 12, border: 'none', background: 'var(--grad)', color: '#fff', fontWeight: 700, fontSize: 16, cursor: 'pointer' }}
          >
            Create Company Workspace
          </button>
        </div>
      </footer>
    </div>
  );
};

export default SolutionsPage;
