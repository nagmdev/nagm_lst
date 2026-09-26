import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Users,
  FileText,
  Send,
  Eye,
  Building2,
  BarChart3,
} from 'lucide-react';
import { api, APP_ORIGIN } from './auth';
import { MegaMenu } from './components/MegaMenu';
import './landing.css';

/**
 * nagm.io marketing landing. CTAs go to nagm.io's own login/register (the
 * pre-auth flow); those pages sign the visitor in and only THEN hand off to
 * app.nagm.io — so nobody reaches the app before authenticating.
 */

const ARROW = 'M5 12h14M13 6l6 6-6 6';

interface PlatformStatsPayload {
  stats: {
    totalUsers: number;
    totalJobs: number;
    totalApplications: number;
    totalJobViews: number;
    closedJobs: number;
    totalCompanies: number;
    averageAtsScore: number;
  };
  allTime: {
    users: number;
    jobs: number;
    applications: number;
    closedJobs: number;
    workspaces: number;
    views: number;
  };
  sparklines: {
    users: { i: number; v: number }[];
    jobs: { i: number; v: number }[];
    applications: { i: number; v: number }[];
    views: { i: number; v: number }[];
  };
}

const DEFAULT_PLATFORM_STATS: PlatformStatsPayload = {
  stats: {
    totalUsers: 109,
    totalJobs: 1,
    totalApplications: 107,
    totalJobViews: 8394,
    closedJobs: 3,
    totalCompanies: 5,
    averageAtsScore: 47,
  },
  allTime: {
    users: 983,
    jobs: 57,
    applications: 755,
    closedJobs: 3,
    workspaces: 5,
    views: 8394,
  },
  sparklines: {
    users: [{ i: 0, v: 2 }, { i: 1, v: 4 }, { i: 2, v: 5 }, { i: 3, v: 3 }, { i: 4, v: 7 }, { i: 5, v: 4 }, { i: 6, v: 2 }],
    jobs: [{ i: 0, v: 0 }, { i: 1, v: 1 }, { i: 2, v: 0 }, { i: 3, v: 1 }, { i: 4, v: 0 }, { i: 5, v: 0 }, { i: 6, v: 1 }],
    applications: [{ i: 0, v: 1 }, { i: 1, v: 3 }, { i: 2, v: 4 }, { i: 3, v: 2 }, { i: 4, v: 5 }, { i: 5, v: 4 }, { i: 6, v: 2 }],
    views: [{ i: 0, v: 120 }, { i: 1, v: 340 }, { i: 2, v: 450 }, { i: 3, v: 290 }, { i: 4, v: 510 }, { i: 5, v: 420 }, { i: 6, v: 310 }],
  },
};

const Sparkline: React.FC<{ data: { i: number; v: number }[]; color: string }> = ({ data, color }) => {
  if (!data || data.length === 0) return <div style={{ height: 40 }} />;
  const width = 140;
  const height = 40;
  const padding = 4;
  const maxV = Math.max(...data.map((d) => d.v), 1);
  const minV = Math.min(...data.map((d) => d.v), 0);
  const range = maxV - minV || 1;

  const points = data.map((d, index) => {
    const x = (index / Math.max(data.length - 1, 1)) * width;
    const y = height - padding - ((d.v - minV) / range) * (height - padding * 2);
    return { x, y };
  });

  const linePath = points.reduce((acc, p, i) => `${acc} ${i === 0 ? 'M' : 'L'} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`, '');
  const areaPath = `${linePath} L ${width} ${height} L 0 ${height} Z`;
  const gradId = `spark-grad-${color.replace('#', '')}`;

  return (
    <div style={{ width: '100%', height: 40, overflow: 'hidden' }}>
      <svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none">
        <defs>
          <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity={0.35} />
            <stop offset="100%" stopColor={color} stopOpacity={0} />
          </linearGradient>
        </defs>
        <path d={areaPath} fill={`url(#${gradId})`} />
        <path d={linePath} fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </div>
  );
};

const CircularProgress: React.FC<{ progress: number; color: string }> = ({ progress, color }) => {
  const r = 14;
  const c = 2 * Math.PI * r;
  const clampedProgress = Math.min(Math.max(progress, 0), 100);
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-start', height: 40, paddingLeft: 4 }}>
      <svg width="36" height="36" viewBox="0 0 36 36">
        <circle cx="18" cy="18" r={r} fill="none" stroke="var(--line2)" strokeWidth="3.5" />
        <circle
          cx="18"
          cy="18"
          r={r}
          fill="none"
          stroke={color}
          strokeWidth="3.5"
          strokeDasharray={c}
          strokeDashoffset={c - (clampedProgress / 100) * c}
          transform="rotate(-90 18 18)"
          strokeLinecap="round"
        />
      </svg>
    </div>
  );
};


const candBullets = [
  'Arabic RTL & English templates + PDF export',
  'AI writes, improves & tailors your CV to a job',
  'Instant ATS score & job recommendations',
  'Track applications with real-time status alerts',
];

const hrBullets = [
  '9-Stage Kanban hiring pipeline with scorecards',
  '6D semantic matching (skills, tenure & vectors)',
  'Candidate Rediscovery — 1-click recycling at zero cost',
  'Enterprise KYB automated Commercial Registration verification',
];

const aiLayers = [
  { tag: 'L1', title: 'Hard filters', desc: 'Location, eligibility, years of experience, language — non-matches drop out instantly.' },
  { tag: 'L2', title: 'Vector score 0–100', desc: 'pgvector similarity + rules produce an explainable score per candidate against the JD.' },
  { tag: 'L3', title: 'LLM re-rank & explain', desc: 'An LLM re-ranks and writes “why this candidate” in Arabic or English.' },
];

const diffs = [
  { icon: '🇪🇬', title: 'True Arabic RTL', desc: 'Arabic-quality templates & AI — exactly where rivals are weak.' },
  { icon: '💬', title: 'WhatsApp-native', desc: 'Apply, alerts, scheduling & offers via conversational intake.' },
  { icon: '🧩', title: 'Structured data', desc: 'Every CV is filterable data — no PDF parsing, ever.' },
  { icon: '🔁', title: 'Candidate Rediscovery', desc: '1-click zero-cost re-indexing of past applicant pools.' },
  { icon: '✅', title: 'Verified employer', desc: 'Automated OCR for Commercial Registration & Tax Card validation.' },
  { icon: '📊', title: 'Salary intelligence', desc: 'Salary signals from real regional platform data.' },
];

const pricing = [
  { aud: 'Candidate', name: 'Free', price: '$0', per: '', featured: false, feats: ['1 template + watermark', 'Basic ATS score', 'Apply to jobs'] },
  { aud: 'Candidate', name: 'Pro', price: '$5', per: '/mo', featured: true, feats: ['All templates · no watermark', 'Full AI quota', 'Public CV link'] },
  { aud: 'Company', name: 'Annual Pro', price: '$120', per: '/mo ($1,440/yr)', featured: true, feats: ['Unlimited candidate search', 'Full 9-Stage ATS pipeline', '6D AI vector matching', 'Automated KYB verification', 'Team workspaces & roles'] },
  { aud: 'Company', name: 'Enterprise', price: 'Custom', per: '', featured: false, feats: ['Unlimited jobs & seats', 'Agency multi-pipeline mode', 'Dedicated success & SLA', 'KSA / UAE data residency'] },
];

const Mark = ({ size = 30 }: { size?: number }) => (
  <div style={{ width: size, height: size, borderRadius: size * 0.28, background: 'var(--grad)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: size * 0.5, flexShrink: 0 }}>N</div>
);

const Check = ({ color }: { color: string }) => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.4" style={{ flexShrink: 0 }}>
    <path d="M20 6L9 17l-5-5" />
  </svg>
);

const Spark = ({ size = 14, fill = '#fff' }: { size?: number; fill?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={fill}>
    <path d="M12 2l1.6 5.4L19 9l-5.4 1.6L12 16l-1.6-5.4L5 9l5.4-1.6L12 2z" />
  </svg>
);

const Landing: React.FC = () => {
  const navigate = useNavigate();
  const goRegister = () => navigate('/register');
  // "Hire with Nagm" opens sign-up with the Recruiter account type preselected.
  const goRecruiter = () => navigate('/register', { state: { role: 'recruiter' } });
  const goLogin = () => navigate('/login');
  const [dark, setDark] = useState<boolean>(() =>
    typeof document !== 'undefined' && document.documentElement.classList.contains('dark'),
  );
  const toggleTheme = () => {
    const el = document.documentElement;
    el.classList.toggle('dark');
    setDark(el.classList.contains('dark'));
  };

  const [platformStats, setPlatformStats] = useState<PlatformStatsPayload>(DEFAULT_PLATFORM_STATS);

  useEffect(() => {
    let active = true;
    const fetchStats = () => {
      api
        .get<PlatformStatsPayload>('/public/platform-stats', {
          params: { _t: Date.now() },
        })
        .then((res) => {
          if (active && res.data && res.data.stats) {
            setPlatformStats(res.data);
          }
        })
        .catch(() => {
          // Fallback pre-populated
        });
    };

    fetchStats();
    // Auto-update every 30 seconds
    const interval = setInterval(fetchStats, 30000);
    // Instant update when switching back to tab
    const onVisibilityOrFocus = () => {
      if (document.visibilityState === 'visible') {
        fetchStats();
      }
    };
    window.addEventListener('visibilitychange', onVisibilityOrFocus);
    window.addEventListener('focus', onVisibilityOrFocus);

    return () => {
      active = false;
      clearInterval(interval);
      window.removeEventListener('visibilitychange', onVisibilityOrFocus);
      window.removeEventListener('focus', onVisibilityOrFocus);
    };
  }, []);


  const kpiCards = [
    {
      name: 'Total Users',
      value: (platformStats.allTime?.users ?? 983).toLocaleString(),
      delta: `+${platformStats.stats?.totalUsers ?? 109} this week`,
      deltaTone: 'brand' as const,
      icon: Users,
      color: '#6366F1',
      spark: platformStats.sparklines?.users || [],
    },
    {
      name: 'Jobs Posted',
      value: platformStats.allTime?.jobs ?? 57,
      delta: `+${platformStats.stats?.totalJobs ?? 1} this week`,
      deltaTone: 'brand' as const,
      icon: FileText,
      color: '#F59E0B',
      spark: platformStats.sparklines?.jobs || [],
    },
    {
      name: 'Applications',
      value: (platformStats.allTime?.applications ?? 755).toLocaleString(),
      delta: `+${platformStats.stats?.totalApplications ?? 107} this week`,
      deltaTone: 'ok' as const,
      icon: Send,
      color: '#10B981',
      spark: platformStats.sparklines?.applications || [],
    },
    {
      name: 'Job Views',
      value: (platformStats.allTime?.views ?? platformStats.stats?.totalJobViews ?? 8394).toLocaleString(),
      delta: 'Live views',
      deltaTone: 'ok' as const,
      icon: Eye,
      color: '#06B6D4',
      spark: platformStats.sparklines?.views || [],
    },
    {
      name: 'Companies',
      value: platformStats.allTime?.workspaces ?? 5,
      delta: 'Verified',
      deltaTone: 'brand' as const,
      icon: Building2,
      color: '#F43F5E',
      spark: platformStats.sparklines?.jobs || [],
    },
    {
      name: 'Avg ATS Score',
      value: `${platformStats.stats?.averageAtsScore ?? 47}%`,
      delta: '+3 points',
      deltaTone: 'brand' as const,
      icon: BarChart3,
      color: '#6D5BF5',
      ringProgress: platformStats.stats?.averageAtsScore ?? 47,
    },
  ];


  const container: React.CSSProperties = { maxWidth: 1160, margin: '0 auto', padding: '0 24px' };


  return (
    <div style={{ background: 'var(--bg)', color: 'var(--ink)', minHeight: '100vh' }}>
      {/* Nav with Breezy-Style MegaMenu */}
      <nav style={{ position: 'sticky', top: 0, zIndex: 50, backdropFilter: 'blur(16px)', background: 'var(--navbg)', borderBottom: '1px solid var(--line)' }}>
        <div style={{ ...container, minHeight: 66, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }} onClick={() => navigate('/')}>
            <Mark size={30} />
            <span style={{ fontSize: 19, fontWeight: 800, letterSpacing: '-.02em' }}>Nagm</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }} className="ng-topbar-search">
            <MegaMenu />
            <a
              href={`${APP_ORIGIN}/jobs`}
              style={{ fontSize: 14, fontWeight: 500, color: 'var(--ink2)', textDecoration: 'none', padding: '10px 14px', borderRadius: 8, cursor: 'pointer', minHeight: 44, display: 'inline-flex', alignItems: 'center' }}
            >
              Jobs
            </a>
            <a
              href="#pricing"
              style={{ fontSize: 14, fontWeight: 500, color: 'var(--ink2)', textDecoration: 'none', padding: '10px 14px', borderRadius: 8, cursor: 'pointer', minHeight: 44, display: 'inline-flex', alignItems: 'center' }}
            >
              Pricing
            </a>
            <Link
              to="/about"
              style={{ fontSize: 14, fontWeight: 600, color: '#6366F1', textDecoration: 'none', padding: '10px 14px', borderRadius: 8, cursor: 'pointer', minHeight: 44, display: 'inline-flex', alignItems: 'center', gap: 4 }}
            >
              <span>About</span>
              <span style={{ fontSize: 10, padding: '2px 5px', borderRadius: 4, background: 'rgba(99, 102, 241, 0.12)' }}>Tour</span>
            </Link>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
            <button onClick={toggleTheme} title="Toggle theme" aria-label="Toggle theme" style={{ width: 44, height: 44, minWidth: 44, minHeight: 44, borderRadius: 10, border: '1px solid var(--line)', background: 'var(--panel)', color: 'var(--ink2)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {dark ? (
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="4" /><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" /></svg>
              ) : (
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" /></svg>
              )}
            </button>
            <button onClick={goLogin} style={{ height: 44, minHeight: 44, padding: '0 14px', borderRadius: 10, border: '1px solid var(--line)', background: 'var(--panel)', color: 'var(--ink)', fontFamily: 'inherit', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>Sign in</button>
            <button onClick={goRegister} style={{ height: 44, minHeight: 44, padding: '0 17px', borderRadius: 10, border: 'none', background: 'var(--grad)', color: '#fff', fontFamily: 'inherit', fontSize: 14, fontWeight: 700, cursor: 'pointer', boxShadow: '0 4px 14px var(--brandShadow)' }}>Get started</button>
          </div>
        </div>
      </nav>

      <main id="main-content">
        {/* Hero */}
        <section style={{ position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', inset: 0, background: 'var(--heroGlow)', pointerEvents: 'none' }} />
          <div className="ng-dash-grid" style={{ ...container, position: 'relative', display: 'grid', gridTemplateColumns: 'minmax(0,1fr) minmax(0,1fr)', gap: 40, alignItems: 'center', padding: '72px 24px 84px' }}>
            <div>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '6px 13px', borderRadius: 30, background: 'var(--brandSoft)', border: '1px solid var(--brandBorder)', fontSize: 13, fontWeight: 600, color: 'var(--brandInk)', marginBottom: 22 }}>
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--brand)', boxShadow: '0 0 0 3px var(--brandSoft2)' }} />Arabic-first · AI-native hiring
              </div>
              <h1 style={{ fontSize: 54, lineHeight: 1.05, fontWeight: 800, letterSpacing: '-.025em', margin: '0 0 20px' }}>
                Build your CV. Apply. <span className="ng-grad-text">Get hired.</span>
              </h1>
              <p style={{ fontSize: 18, lineHeight: 1.6, color: 'var(--ink2)', margin: '0 0 30px', maxWidth: 480 }}>
                Nagm turns the CV you build into structured data companies can hire from instantly — no PDF parsing. Arabic-first, WhatsApp-native, powered by AI at every step.
              </p>
              <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                <button onClick={goRegister} style={{ height: 50, padding: '0 24px', borderRadius: 13, border: 'none', background: 'var(--grad)', color: '#fff', fontFamily: 'inherit', fontSize: 15.5, fontWeight: 700, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 9, boxShadow: '0 6px 20px var(--brandShadow)' }}>
                  Build your CV — free
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d={ARROW} /></svg>
                </button>
                <button onClick={goRecruiter} style={{ height: 50, padding: '0 22px', borderRadius: 13, border: '1px solid var(--line)', background: 'var(--panel)', color: 'var(--ink)', fontFamily: 'inherit', fontSize: 15.5, fontWeight: 600, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 9 }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 21h18M5 21V7l8-4v18M19 21V11l-6-3" /></svg>Hire with Nagm
                </button>
              </div>
            </div>

            {/* Floating hero cards */}
            <div style={{ position: 'relative', minHeight: 420 }} className="ng-topbar-search">
              <div style={{ position: 'absolute', top: 30, right: 10, width: 330, background: 'var(--panel)', border: '1px solid var(--line)', borderRadius: 20, boxShadow: 'var(--shadowLg)', padding: 20, animation: 'ngFloat 7s ease-in-out infinite' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 11, marginBottom: 15 }}>
                  <div style={{ width: 40, height: 40, borderRadius: 11, background: 'var(--grad)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: 15 }}>SM</div>
                  <div><div style={{ fontSize: 14.5, fontWeight: 700 }}>Sara Mansour</div><div style={{ fontSize: 12, color: 'var(--ink3)' }}>Software Engineer · Cairo</div></div>
                  <div style={{ marginLeft: 'auto', fontSize: 11, fontWeight: 700, color: 'var(--ok)', background: 'var(--okSoft)', padding: '3px 9px', borderRadius: 20 }}>ATS 92</div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <div style={{ height: 9, borderRadius: 5, background: 'var(--line2)', width: '90%' }} />
                  <div style={{ height: 9, borderRadius: 5, background: 'var(--line2)', width: '75%' }} />
                  <div style={{ height: 9, borderRadius: 5, background: 'linear-gradient(90deg,var(--brand),transparent)', width: '60%' }} />
                  <div style={{ height: 9, borderRadius: 5, background: 'var(--line2)', width: '82%' }} />
                  <div style={{ height: 9, borderRadius: 5, background: 'var(--line2)', width: '50%' }} />
                </div>
                <div style={{ marginTop: 16, display: 'flex', gap: 7 }}>
                  <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--brandInk)', background: 'var(--brandSoft)', padding: '4px 10px', borderRadius: 7 }}>React</span>
                  <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--brandInk)', background: 'var(--brandSoft)', padding: '4px 10px', borderRadius: 7 }}>Node.js</span>
                  <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--ink3)', background: 'var(--hover)', padding: '4px 10px', borderRadius: 7 }}>+4</span>
                </div>
              </div>

              <div style={{ position: 'absolute', bottom: 24, left: 0, width: 250, background: 'var(--panel)', border: '1px solid var(--line)', borderRadius: 18, boxShadow: 'var(--shadowLg)', padding: 16, animation: 'ngFloat2 6s ease-in-out infinite' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 13 }}>
                  <div style={{ width: 26, height: 26, borderRadius: 8, background: 'var(--grad)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Spark /></div>
                  <div style={{ fontSize: 13, fontWeight: 700 }}>AI match</div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ position: 'relative', width: 54, height: 54, flexShrink: 0 }}>
                    <svg width="54" height="54" viewBox="0 0 54 54">
                      <circle cx="27" cy="27" r="23" fill="none" stroke="var(--line2)" strokeWidth="6" />
                      <circle cx="27" cy="27" r="23" fill="none" stroke="var(--brand)" strokeWidth="6" strokeLinecap="round" strokeDasharray="144.5" strokeDashoffset="16" transform="rotate(-90 27 27)" />
                    </svg>
                    <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15, fontWeight: 800, fontFamily: "'IBM Plex Mono',monospace" }}>89</div>
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--ink2)', lineHeight: 1.45 }}>Strong React + Arabic content match for this role</div>
                </div>
              </div>
            </div>
          </div>

          {/* Live Platform Stats Showcase — 7 Admin KPI Cards (strictly read-only) */}
          <div style={{ ...container, paddingBottom: 60, paddingTop: 6 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14, flexWrap: 'wrap', gap: 8 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--ok)', boxShadow: '0 0 0 3px var(--okSoft)' }} />
                <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--ink2)', textTransform: 'uppercase', letterSpacing: '.06em' }}>
                  Live Platform Metrics
                </span>
              </div>
              <span style={{ fontSize: 12, color: 'var(--ink3)', fontWeight: 500 }}>
                Real-time aggregate platform activity · Read-only
              </span>
            </div>

            <div className="ng-platform-kpi-grid">
              {kpiCards.map((k) => {
                const Icon = k.icon;
                return (
                  <div
                    key={k.name}
                    style={{
                      padding: '12px 10px 0',
                      display: 'block',
                      overflow: 'hidden',
                      cursor: 'default',
                      userSelect: 'none',
                      pointerEvents: 'none',
                      minWidth: 0,
                      background: 'var(--panel)',
                      border: '1px solid var(--line)',
                      borderRadius: 14,
                      textAlign: 'left',
                      width: '100%',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 5, flexWrap: 'nowrap' }}>
                      <div style={{ width: 26, height: 26, borderRadius: 7, background: `${k.color}1A`, color: k.color, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <Icon size={13} />
                      </div>
                      <div style={{ fontSize: 18, fontWeight: 800, color: 'var(--ink)', fontFamily: "'IBM Plex Mono',monospace", letterSpacing: '-.02em', lineHeight: 1, whiteSpace: 'nowrap' }}>
                        {typeof k.value === 'number' ? k.value.toLocaleString() : k.value}
                      </div>
                      <span
                        style={{
                          fontSize: 10,
                          fontWeight: 700,
                          padding: '1px 5px',
                          borderRadius: 999,
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          color: k.deltaTone === 'ok' ? 'var(--ok)' : 'var(--brandInk)',
                          background: k.deltaTone === 'ok' ? 'var(--okSoft)' : 'var(--brandSoft)',
                          marginLeft: 'auto',
                        }}
                      >
                        {k.delta}
                      </span>
                    </div>
                    <div style={{ fontSize: 11.5, fontWeight: 600, color: 'var(--ink2)', marginBottom: 4, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {k.name}
                    </div>
                    <div>
                      {k.spark && k.spark.length > 0 ? (
                        <Sparkline data={k.spark} color={k.color} />
                      ) : k.ringProgress !== undefined ? (
                        <CircularProgress progress={k.ringProgress} color={k.color} />
                      ) : (
                        <div style={{ height: 40 }} />
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>


        {/* Two sides */}
        <section id="features" style={{ ...container, padding: '40px 24px' }}>
          <div style={{ textAlign: 'center', marginBottom: 34 }}>
            <div style={{ fontSize: 13, fontWeight: 700, letterSpacing: '.08em', textTransform: 'uppercase', color: 'var(--brandInk)', marginBottom: 10 }}>One platform, two sides</div>
            <h2 style={{ fontSize: 36, fontWeight: 800, letterSpacing: '-.02em', margin: 0 }}>Where talent and companies finally meet</h2>
          </div>
          <div className="ng-dash-grid" style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) minmax(0,1fr)', gap: 24 }}>
            <div style={{ background: 'var(--panel)', border: '1px solid var(--line)', borderRadius: 22, padding: 30 }}>
              <div style={{ width: 46, height: 46, borderRadius: 13, background: 'var(--brandSoft)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--brand)', marginBottom: 18 }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 11l-3 3-1.5-1.5" /></svg>
              </div>
              <h3 style={{ fontSize: 23, fontWeight: 800, margin: '0 0 7px', letterSpacing: '-.01em' }}>For candidates</h3>
              <p style={{ fontSize: 14.5, color: 'var(--ink2)', lineHeight: 1.55, margin: '0 0 18px' }}>A beautiful Arabic &amp; English CV builder, AI that writes with you, and a real path from CV to hired.</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 11, marginBottom: 22 }}>
                {candBullets.map((b) => (<div key={b} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 14 }}><Check color="var(--brand)" />{b}</div>))}
              </div>
              <button onClick={goRegister} style={{ height: 44, padding: '0 20px', borderRadius: 11, border: 'none', background: 'var(--grad)', color: '#fff', fontFamily: 'inherit', fontSize: 14.5, fontWeight: 700, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 8, boxShadow: '0 4px 14px var(--brandShadow)' }}>
                Explore candidate app<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d={ARROW} /></svg>
              </button>
            </div>
            <div style={{ background: 'var(--inkPanel)', border: '1px solid var(--inkPanelLine)', borderRadius: 22, padding: 30, position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', top: -40, right: -40, width: 160, height: 160, borderRadius: '50%', background: 'var(--grad)', opacity: 0.16, filter: 'blur(30px)' }} />
              <div style={{ width: 46, height: 46, borderRadius: 13, background: 'rgba(255,255,255,.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--cyan)', marginBottom: 18, position: 'relative' }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 21h18M5 21V7l8-4v18M19 21V11l-6-3" /></svg>
              </div>
              <h3 style={{ fontSize: 23, fontWeight: 800, margin: '0 0 7px', letterSpacing: '-.01em', color: '#fff' }}>For companies &amp; recruiters</h3>
              <p style={{ fontSize: 14.5, color: 'rgba(255,255,255,.7)', lineHeight: 1.55, margin: '0 0 18px' }}>A full ATS with AI matching, structured candidate data, and WhatsApp-native outreach that stops candidates slipping away.</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 11, marginBottom: 22 }}>
                {hrBullets.map((b) => (<div key={b} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 14, color: 'rgba(255,255,255,.92)' }}><Check color="var(--cyan)" />{b}</div>))}
              </div>
              <button onClick={goRecruiter} style={{ height: 44, padding: '0 20px', borderRadius: 11, border: '1px solid rgba(255,255,255,.2)', background: 'rgba(255,255,255,.1)', color: '#fff', fontFamily: 'inherit', fontSize: 14.5, fontWeight: 700, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 8, position: 'relative' }}>
                Explore recruiter app<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d={ARROW} /></svg>
              </button>
            </div>
          </div>
        </section>

        {/* AI moat */}
        <section style={{ ...container, padding: '40px 24px' }}>
          <div style={{ background: 'var(--inkPanel)', borderRadius: 28, padding: '46px 44px', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: -60, left: '30%', width: 300, height: 300, borderRadius: '50%', background: 'var(--grad)', opacity: 0.18, filter: 'blur(60px)', pointerEvents: 'none' }} />
            <div style={{ position: 'relative' }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 7, padding: '6px 13px', borderRadius: 30, background: 'rgba(255,255,255,.08)', border: '1px solid rgba(255,255,255,.14)', fontSize: 12.5, fontWeight: 600, color: 'var(--cyan)', marginBottom: 18 }}><Spark fill="currentColor" />The AI moat</div>
              <h2 style={{ fontSize: 32, fontWeight: 800, letterSpacing: '-.02em', margin: '0 0 10px', color: '#fff', maxWidth: 620 }}>The AI that actually understands Arabic CVs</h2>
              <p style={{ fontSize: 15.5, color: 'rgba(255,255,255,.65)', lineHeight: 1.6, margin: '0 0 30px', maxWidth: 620 }}>Every candidate, resume and job is embedded with pgvector. A three-layer engine filters, scores, then explains — in Arabic or English.</p>
              <div className="ng-dash-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3,minmax(0,1fr))', gap: 18 }}>
                {aiLayers.map((l) => (
                  <div key={l.tag} style={{ background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.1)', borderRadius: 16, padding: 22 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
                      <div style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 12, fontWeight: 700, color: '#0B0E14', background: 'var(--cyan)', width: 30, height: 30, borderRadius: 9, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{l.tag}</div>
                      <div style={{ fontSize: 15, fontWeight: 700, color: '#fff' }}>{l.title}</div>
                    </div>
                    <p style={{ fontSize: 13.5, color: 'rgba(255,255,255,.62)', lineHeight: 1.5, margin: 0 }}>{l.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Differentiators */}
        <section id="about" style={{ ...container, padding: '40px 24px' }}>
          <div style={{ textAlign: 'center', marginBottom: 30 }}>
            <div style={{ fontSize: 13, fontWeight: 700, letterSpacing: '.08em', textTransform: 'uppercase', color: 'var(--brandInk)', marginBottom: 10 }}>Why Nagm wins</div>
            <h2 style={{ fontSize: 34, fontWeight: 800, letterSpacing: '-.02em', margin: 0 }}>Built for MENA, not adapted for it</h2>
          </div>
          <div className="ng-dash-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3,minmax(0,1fr))', gap: 18 }}>
            {diffs.map((d) => (
              <div key={d.title} style={{ background: 'var(--panel)', border: '1px solid var(--line)', borderRadius: 18, padding: 24 }}>
                <div style={{ width: 42, height: 42, borderRadius: 12, background: 'var(--brandSoft)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 15, fontSize: 20 }}>{d.icon}</div>
                <h3 style={{ fontSize: 16.5, fontWeight: 700, margin: '0 0 7px' }}>{d.title}</h3>
                <p style={{ fontSize: 13.5, color: 'var(--ink2)', lineHeight: 1.55, margin: 0 }}>{d.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Pricing */}
        <section id="pricing" style={{ ...container, padding: '40px 24px' }}>
          <div style={{ textAlign: 'center', marginBottom: 30 }}>
            <div style={{ fontSize: 13, fontWeight: 700, letterSpacing: '.08em', textTransform: 'uppercase', color: 'var(--brandInk)', marginBottom: 10 }}>Pricing</div>
            <h2 style={{ fontSize: 34, fontWeight: 800, letterSpacing: '-.02em', margin: 0 }}>Free for talent. Scales for companies.</h2>
          </div>
          <div className="ng-dash-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4,minmax(0,1fr))', gap: 18 }}>
            {pricing.map((p) => (
              <div key={p.name} style={{ background: p.featured ? 'var(--inkPanel)' : 'var(--panel)', border: `1px solid ${p.featured ? 'var(--brandBorder)' : 'var(--line)'}`, borderRadius: 18, padding: '26px 22px', position: 'relative', boxShadow: p.featured ? 'var(--shadowLg)' : 'none', display: 'flex', flexDirection: 'column' }}>
                {p.featured && <div style={{ position: 'absolute', top: 14, right: 14, fontSize: 10.5, fontWeight: 700, letterSpacing: '.05em', textTransform: 'uppercase', color: '#fff', background: 'var(--grad)', padding: '3px 9px', borderRadius: 20 }}>Popular</div>}
                <div style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.06em', color: p.featured ? 'var(--cyan)' : 'var(--brandInk)', marginBottom: 12 }}>{p.aud}</div>
                <h3 style={{ fontSize: 17, fontWeight: 800, color: p.featured ? '#fff' : 'var(--ink)', margin: 0, marginBottom: 6 }}>{p.name}</h3>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginBottom: 16 }}>
                  <span style={{ fontSize: 30, fontWeight: 800, color: p.featured ? '#fff' : 'var(--ink)', fontFamily: "'IBM Plex Mono',monospace" }}>{p.price}</span>
                  <span style={{ fontSize: 13, color: p.featured ? 'rgba(255,255,255,.5)' : 'var(--ink3)' }}>{p.per}</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 22 }}>
                  {p.feats.map((f) => (<div key={f} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: p.featured ? 'rgba(255,255,255,.85)' : 'var(--ink2)' }}><Check color={p.featured ? 'var(--cyan)' : 'var(--brand)'} />{f}</div>))}
                </div>
                <button
                  onClick={p.aud === 'Candidate' ? goRegister : goRecruiter}
                  style={{
                    width: '100%',
                    padding: '11px 14px',
                    borderRadius: 10,
                    border: p.featured ? 'none' : '1px solid var(--line)',
                    background: p.featured ? 'var(--grad)' : 'var(--panel)',
                    color: p.featured ? '#fff' : 'var(--ink)',
                    fontSize: 13.5,
                    fontWeight: 700,
                    cursor: 'pointer',
                    marginTop: 'auto',
                    display: 'block',
                    textAlign: 'center',
                    boxShadow: p.featured ? '0 4px 14px var(--brandShadow)' : 'none',
                  }}
                >
                  {p.aud === 'Candidate' ? (p.price === '$0' ? 'Get started free' : 'Upgrade to Pro') : (p.price === 'Custom' ? 'Contact sales' : 'Start hiring now')}
                </button>
              </div>
            ))}
          </div>
        </section>

        {/* Final CTA */}
        <section id="contact" style={{ ...container, padding: '40px 24px 60px' }}>
          <div style={{ background: 'var(--grad)', borderRadius: 28, padding: '52px 44px', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
            <h2 style={{ fontSize: 34, fontWeight: 800, letterSpacing: '-.02em', margin: '0 0 12px', color: '#fff' }}>Tell your story right. With AI.</h2>
            <p style={{ fontSize: 16, color: 'rgba(255,255,255,.9)', margin: '0 0 26px' }}>
              Join {(platformStats.allTime?.users ?? 983).toLocaleString()}+ candidates and {(platformStats.allTime?.workspaces ?? 5)} companies already hiring on Nagm.
            </p>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
              <button onClick={goRegister} style={{ height: 50, padding: '0 26px', borderRadius: 13, border: 'none', background: '#fff', color: 'var(--brandInk)', fontFamily: 'inherit', fontSize: 15.5, fontWeight: 700, cursor: 'pointer', boxShadow: '0 8px 24px rgba(0,0,0,.18)' }}>Build your CV — free</button>
              <button onClick={goRecruiter} style={{ height: 50, padding: '0 26px', borderRadius: 13, border: '1px solid rgba(255,255,255,.4)', background: 'rgba(255,255,255,.12)', color: '#fff', fontFamily: 'inherit', fontSize: 15.5, fontWeight: 700, cursor: 'pointer' }}>Hire with Nagm</button>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer style={{ borderTop: '1px solid var(--line)' }}>
        <div style={{ ...container, padding: '26px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Mark size={28} />
            <div><div style={{ fontSize: 15, fontWeight: 800 }}>Nagm</div><div style={{ fontSize: 11.5, color: 'var(--ink3)' }}>Tell it right. With AI.</div></div>
          </div>
          <div style={{ fontSize: 12.5, color: 'var(--ink3)' }}>© 2026 Nagm.io · Cairo · Riyadh · Dubai</div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
