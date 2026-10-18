import { useEffect, useRef, useState, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { APP_ORIGIN } from '../auth';
import { useLang, setLang, applyLangToDocument } from '../i18n/lang';
import { useSiteText, type Card, type Section as SectionCopy } from '../i18n/siteText';
import { Icon, Arrow, type IconName } from './icons';
import { ChevronField } from './art';
import { ScaleBox, MatchCard, CandidateCard, PipelineBoard } from './mock';

/**
 * Site chrome and section primitives for nagm.io. Pages compose these with
 * copy from i18n/siteText and scenes from design/art; nothing here carries
 * text of its own beyond aria labels.
 */

/* ------------------------------------------------------------------ */
/* document                                                            */

export function usePageMeta(title: string, description: string) {
  const lang = useLang();
  useEffect(() => {
    document.title = title;
    const set = (sel: string, attr: string, value: string) => {
      let el = document.head.querySelector<HTMLMetaElement>(sel);
      if (!el) {
        el = document.createElement('meta');
        const [k, v] = sel.replace(/^meta\[|\]$/g, '').split('=');
        el.setAttribute(k, v.replace(/"/g, ''));
        document.head.appendChild(el);
      }
      el.setAttribute(attr, value);
    };
    set('meta[name="description"]', 'content', description);
    set('meta[property="og:title"]', 'content', title);
    set('meta[property="og:description"]', 'content', description);
    set('meta[property="og:locale"]', 'content', lang === 'ar' ? 'ar_EG' : 'en_US');
  }, [title, description, lang]);
}

const THEME_KEY = 'nagm_theme';

function readTheme(): boolean {
  try {
    const saved = localStorage.getItem(THEME_KEY);
    if (saved === 'dark') return true;
    if (saved === 'light') return false;
  } catch { /* ignore */ }
  return typeof window !== 'undefined' && !!window.matchMedia?.('(prefers-color-scheme: dark)').matches;
}

function useTheme() {
  const [dark, setDark] = useState<boolean>(() => (typeof document !== 'undefined' && document.documentElement.classList.contains('dark')) || readTheme());
  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark);
    try { localStorage.setItem(THEME_KEY, dark ? 'dark' : 'light'); } catch { /* ignore */ }
  }, [dark]);
  return { dark, toggle: () => setDark((d) => !d) };
}

/** Scroll to the hash target after a route change (menus deep-link to sections). */
function useHashScroll() {
  const { pathname, hash } = useLocation();
  useEffect(() => {
    if (hash) {
      const el = document.getElementById(hash.slice(1));
      if (el) { el.scrollIntoView({ block: 'start' }); return; }
    }
    window.scrollTo({ top: 0 });
  }, [pathname, hash]);
}

/* ------------------------------------------------------------------ */
/* nav                                                                 */

export const links = {
  register: (role?: 'candidate' | 'recruiter' | 'company') => (role ? `/register?role=${role}` : '/register'),
  login: '/login',
  jobs: `${APP_ORIGIN}/jobs`,
  sales: 'mailto:sales@nagm.io',
};

export function Logo({ size = 30 }: { size?: number }) {
  const lang = useLang();
  return (
    <Link to="/" aria-label={lang === 'ar' ? 'نجم — الرئيسية' : 'Nagm — home'} style={{ display: 'inline-flex', alignItems: 'center', gap: 10, textDecoration: 'none', color: 'var(--ink)' }}>
      <img src="/nagm-mark.png" width={size} height={size} alt="" style={{ display: 'block' }} />
      <span style={{ fontFamily: 'var(--fontDisplay)', fontWeight: 800, fontSize: 20, letterSpacing: lang === 'ar' ? 0 : '-0.02em' }}>{lang === 'ar' ? 'نجم' : 'Nagm'}</span>
    </Link>
  );
}

type MenuKey = 'products' | 'solutions';

const PRODUCT_ICON: Record<string, IconName> = {
  profile: 'profile', cv: 'cv', match: 'match', interview: 'interview',
  stages: 'stages', rediscover: 'rediscover', team: 'mention', analytics: 'analytics',
};

/** One tool in the Products menu: a strong icon, a short name, one line. */
const MenuItem = ({ to, icon, title, sub, tone }: { to: string; icon: IconName; title: string; sub: string; tone?: 'cyan' }) => (
  <Link to={to} className={`ns-mitem${tone ? ` ns-mitem--${tone}` : ''}`}>
    <span className="ns-mitem-icon"><Icon name={icon} size={20} /></span>
    <span className="ns-mitem-text"><b>{title}</b><span>{sub}</span></span>
  </Link>
);

function ProductsPanel() {
  const t = useSiteText().nav;
  const group = (g: 'seekers' | 'teams') => t.productItems.filter((p) => p.group === g);
  const Col = ({ g, title, explore, to, tone }: { g: 'seekers' | 'teams'; title: string; explore: string; to: string; tone?: 'cyan' }) => (
    <div className="ns-mega-col">
      <div className="ns-mega-head">
        <span className={`ns-mega-dot${tone ? ` ns-mega-dot--${tone}` : ''}`} aria-hidden="true" />
        <h3>{title}</h3>
        <Link to={to} className="ns-mega-explore">{explore}<Arrow size={14} /></Link>
      </div>
      <div className="ns-mega-items">
        {group(g).map((p) => <MenuItem key={p.key} to={p.to} icon={PRODUCT_ICON[p.key] ?? 'spark'} title={p.title} sub={p.sub} tone={tone} />)}
      </div>
    </div>
  );
  return (
    <div className="ns-mega-grid">
      <Col g="seekers" title={t.groupSeekers} explore={t.exploreSeekers} to="/job-seekers" />
      <Col g="teams" title={t.groupTeams} explore={t.exploreTeams} to="/companies" tone="cyan" />
      <aside className="ns-mega-feature">
        <span className="ns-mega-kicker"><Icon name="spark" size={14} />{t.featured.eyebrow}</span>
        <div className="ns-mega-visual" aria-hidden="true"><ScaleBox width={300} height={146}><MatchCard compact /></ScaleBox></div>
        <b className="ns-mega-ftitle">{t.featured.title}</b>
        <p>{t.featured.body}</p>
        <div className="ns-mega-factions">
          <Link to={links.register('candidate')} className="ns-btn ns-btn--primary ns-btn--sm">{t.featured.cta}<Arrow size={15} /></Link>
          <Link to="/pricing" className="ns-mega-explore">{t.menuFooter.pricing}</Link>
        </div>
      </aside>
    </div>
  );
}

function SolutionsPanel() {
  const t = useSiteText();
  const n = t.nav;
  const Card = ({ to, title, body, cta, visual, tone }: { to: string; title: string; body: string; cta: string; visual: ReactNode; tone?: 'cyan' }) => (
    <Link to={to} className={`ns-scard${tone ? ` ns-scard--${tone}` : ''}`}>
      <div className="ns-scard-visual" aria-hidden="true">{visual}</div>
      <div className="ns-scard-copy">
        <b>{title}</b>
        <span>{body}</span>
        <span className="ns-scard-cta">{cta}<Arrow size={14} /></span>
      </div>
    </Link>
  );
  return (
    <div className="ns-mega-grid ns-mega-grid--sol">
      <Card to="/job-seekers" title={n.solutionCards.seekers.title} body={n.solutionCards.seekers.body} cta={n.solutionCards.seekers.cta}
        visual={<ScaleBox width={330} height={210}><CandidateCard compact /></ScaleBox>} />
      <Card to="/companies" title={n.solutionCards.teams.title} body={n.solutionCards.teams.body} cta={n.solutionCards.teams.cta} tone="cyan"
        visual={<ScaleBox width={470} height={210}><PipelineBoard compact /></ScaleBox>} />
      <aside className="ns-mega-side">
        <span className="ns-mega-sidehead">{t.nav.pricing}</span>
        <Link to="/pricing?for=seekers">{t.pricing.audience.seekers}<Arrow size={14} /></Link>
        <Link to="/pricing?for=recruiters">{t.pricing.audience.recruiters}<Arrow size={14} /></Link>
        <Link to="/pricing?for=companies">{t.pricing.audience.companies}<Arrow size={14} /></Link>
        <span className="ns-mega-sidehead" style={{ marginTop: 14 }}>{n.menuFooter.text}</span>
        <Link to={links.register()}>{n.menuFooter.start}<Arrow size={14} /></Link>
      </aside>
    </div>
  );
}

export function Nav() {
  const t = useSiteText();
  const lang = useLang();
  const { dark, toggle } = useTheme();
  const [drawer, setDrawer] = useState(false);
  const [menu, setMenu] = useState<MenuKey | null>(null);
  const closeTimer = useRef<number | null>(null);
  const headerRef = useRef<HTMLElement>(null);
  const { pathname, hash } = useLocation();
  useEffect(() => { setDrawer(false); setMenu(null); }, [pathname, hash]);
  useHashScroll();

  const cancelClose = () => { if (closeTimer.current) { window.clearTimeout(closeTimer.current); closeTimer.current = null; } };
  const openMenu = (k: MenuKey) => { cancelClose(); setMenu(k); };
  const closeSoon = () => { cancelClose(); closeTimer.current = window.setTimeout(() => setMenu(null), 140); };

  useEffect(() => {
    if (!menu) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return;
      setMenu(null);
      headerRef.current?.querySelector<HTMLButtonElement>(`[data-menu="${menu}"]`)?.focus();
    };
    const onDoc = (e: MouseEvent) => { if (!headerRef.current?.contains(e.target as Node)) setMenu(null); };
    document.addEventListener('keydown', onKey);
    document.addEventListener('mousedown', onDoc);
    return () => { document.removeEventListener('keydown', onKey); document.removeEventListener('mousedown', onDoc); };
  }, [menu]);

  // A render helper, not a component: a component declared here would remount
  // on every render and drop keyboard focus when the menu opens.
  const trigger = (k: MenuKey, label: string) => (
    <button
      type="button" className="ns-nav-link" data-menu={k}
      aria-expanded={menu === k} aria-controls={`ns-mega-${k}`}
      onClick={() => (menu === k ? setMenu(null) : openMenu(k))}
      onMouseEnter={() => openMenu(k)} onMouseLeave={closeSoon}
    >
      {label}
      <Icon name="chevronDown" size={14} style={{ transform: menu === k ? 'rotate(180deg)' : undefined, transition: 'transform .2s' }} />
    </button>
  );

  return (
    <header className="ns-nav" ref={headerRef}>
      <div className="ns-container ns-nav-inner">
        <Logo />
        <nav className="ns-nav-links" aria-label={lang === 'ar' ? 'الرئيسية' : 'Main'}>
          {trigger('products', t.nav.products)}
          {trigger('solutions', t.nav.solutions)}
          <a className="ns-nav-link" href={links.jobs}>{t.nav.jobs}</a>
          <NavLink className={({ isActive }) => `ns-nav-link${isActive ? ' is-active' : ''}`} to="/pricing">{t.nav.pricing}</NavLink>
          <NavLink className={({ isActive }) => `ns-nav-link${isActive ? ' is-active' : ''}`} to="/about">{t.nav.about}</NavLink>
        </nav>
        <div className="ns-nav-actions">
          <button type="button" className="ns-langbtn" onClick={() => setLang(lang === 'ar' ? 'en' : 'ar')} aria-label={t.nav.lang} title={t.nav.lang}>
            {lang === 'ar' ? 'EN' : 'عربي'}
          </button>
          <button type="button" className="ns-iconbtn" onClick={toggle} aria-label={t.nav.theme} title={t.nav.theme} aria-pressed={dark}>
            <Icon name={dark ? 'sun' : 'moon'} size={18} />
          </button>
          <Link to={links.login} className="ns-btn ns-btn--ghost ns-btn--sm ns-nav-cta">{t.nav.login}</Link>
          <Link to={links.register()} className="ns-btn ns-btn--primary ns-btn--sm ns-nav-cta">{t.nav.start}</Link>
          <button type="button" className="ns-iconbtn ns-burger" onClick={() => setDrawer((d) => !d)} aria-expanded={drawer} aria-controls="ns-drawer" aria-label={drawer ? t.nav.close : t.nav.menu}>
            <Icon name={drawer ? 'close' : 'menu'} size={20} />
          </button>
        </div>
      </div>

      {menu && (
        <>
          {/* The header's backdrop blur would trap a fixed child, so the scrim lives on <body>. */}
          {createPortal(<div className="ns-mega-scrim" aria-hidden="true" onClick={() => setMenu(null)} />, document.body)}
          <div
            id={`ns-mega-${menu}`} className="ns-mega" role="region"
            aria-label={menu === 'products' ? t.nav.products : t.nav.solutions}
            onMouseEnter={cancelClose} onMouseLeave={closeSoon}
          >
            <div className="ns-container">{menu === 'products' ? <ProductsPanel /> : <SolutionsPanel />}</div>
          </div>
        </>
      )}

      {drawer && (
        <div id="ns-drawer" className="ns-drawer">
          {(['seekers', 'teams'] as const).map((g) => (
            <div key={g} className="ns-drawer-group">
              <Link to={g === 'seekers' ? '/job-seekers' : '/companies'} className="ns-drawer-head">
                {g === 'seekers' ? t.nav.groupSeekers : t.nav.groupTeams}<Arrow size={16} />
              </Link>
              <div className="ns-drawer-sub">
                {t.nav.productItems.filter((p) => p.group === g).map((p) => (
                  <Link key={p.key} to={p.to}><Icon name={PRODUCT_ICON[p.key] ?? 'spark'} size={18} />{p.title}</Link>
                ))}
              </div>
            </div>
          ))}
          <a href={links.jobs}>{t.nav.jobs}<Arrow size={16} /></a>
          <Link to="/pricing">{t.nav.pricing}<Arrow size={16} /></Link>
          <Link to="/about">{t.nav.about}<Arrow size={16} /></Link>
          <div className="ns-drawer-ctas">
            <Link to={links.register()} className="ns-btn ns-btn--primary ns-btn--block">{t.nav.start}</Link>
            <Link to={links.login} className="ns-btn ns-btn--secondary ns-btn--block">{t.nav.login}</Link>
          </div>
        </div>
      )}
    </header>
  );
}

/* ------------------------------------------------------------------ */
/* footer                                                              */

export function Footer() {
  const t = useSiteText();
  const lang = useLang();
  return (
    <footer className="ns-footer">
      <div className="ns-container">
        <div className="ns-footer-grid">
          <div>
            <Logo />
            <p className="ns-body" style={{ marginTop: 16, maxWidth: 320 }}>
              {t.footer.tagline[0]}<br />{t.footer.tagline[1]}
            </p>
            <div style={{ display: 'flex', gap: 8, marginTop: 18 }}>
              <button type="button" className="ns-market-pill" aria-pressed={lang === 'ar'} onClick={() => setLang('ar')}>عربي</button>
              <button type="button" className="ns-market-pill" aria-pressed={lang === 'en'} onClick={() => setLang('en')}>English</button>
            </div>
          </div>
          {t.footer.cols.map((c) => (
            <div key={c.head}>
              <h4>{c.head}</h4>
              <ul>
                {c.links.map((l) => (
                  <li key={l.label}>
                    {l.ext ? <a href={l.to === '/jobs' ? links.jobs : l.to}>{l.label}</a> : <Link to={l.to}>{l.label}</Link>}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="ns-footer-bottom">
          <span>{t.footer.rights}</span>
          <span className="ns-mono" style={{ fontSize: 12 }}>nagm.io · app.nagm.io</span>
        </div>
      </div>
    </footer>
  );
}

export function Shell({ children }: { children: ReactNode }) {
  const lang = useLang();
  // A saved language choice must reach <html> on first paint of any page,
  // not only after the visitor toggles it.
  useEffect(() => applyLangToDocument(lang), [lang]);
  return (
    <>
      <Nav />
      <main id="main-content">{children}</main>
      <Footer />
    </>
  );
}

/* ------------------------------------------------------------------ */
/* section primitives                                                  */

export function Eyebrow({ children }: { children: ReactNode }) {
  return <span className="ns-eyebrow">{children}</span>;
}

/** Headline lines break where the copy breaks them. */
export function Lines({ lines, as: Tag = 'h2', className = 'ns-h2' }: { lines: string[]; as?: 'h1' | 'h2' | 'h3' | 'p'; className?: string }) {
  return (
    <Tag className={className}>
      {lines.map((l, i) => (
        <span key={i} style={{ display: 'block' }}>{l}</span>
      ))}
    </Tag>
  );
}

export function SectionHead({ copy, center, row, children }: { copy: SectionCopy; center?: boolean; row?: boolean; children?: ReactNode }) {
  return (
    <div className={`ns-head${center ? ' ns-head--center' : ''}${row ? ' ns-head--row' : ''}`}>
      <div style={{ display: 'grid', gap: 14 }}>
        {copy.eyebrow && <Eyebrow>{copy.eyebrow}</Eyebrow>}
        <Lines lines={copy.title} />
      </div>
      {(copy.body || children) && (
        <div style={{ display: 'grid', gap: 16 }}>
          {copy.body && <p className="ns-lede">{copy.body}</p>}
          {children}
        </div>
      )}
    </div>
  );
}

export function Section({ id, children, tone, tight, field }: { id?: string; children: ReactNode; tone?: 'band' | 'ink'; tight?: boolean; field?: boolean }) {
  return (
    <section id={id} className={`ns-section${tone ? ` ns-section--${tone}` : ''}${tight ? ' ns-section--tight' : ''}`} style={{ scrollMarginTop: 80 }}>
      {field && <div className="ns-field"><ChevronField opacity={tone === 'ink' ? 0.06 : 0.04} /></div>}
      <div className="ns-container" style={{ position: 'relative' }}>{children}</div>
    </section>
  );
}

export function Bullets({ items }: { items: string[] }) {
  return (
    <ul className="ns-list">
      {items.map((b) => (
        <li key={b}><Icon name="check" size={16} weight={2.2} />{b}</li>
      ))}
    </ul>
  );
}

export function FeatureCard({ card, icon, tone, cut, lift = true }: { card: Card; icon?: IconName; tone?: 'cyan' | 'violet' | 'grad' | 'line'; cut?: boolean; lift?: boolean }) {
  return (
    <article className={`ns-card${lift ? ' ns-card--lift' : ''}${cut ? ' ns-card--cut' : ''}`} style={{ display: 'grid', gap: 14, alignContent: 'start' }}>
      {icon && <span className={`ns-icon-tile${tone ? ` ns-icon-tile--${tone}` : ''}`}><Icon name={icon} /></span>}
      <h3 className="ns-h3">{card.title}</h3>
      <p className="ns-body">{card.body}</p>
      {card.bullets && <Bullets items={card.bullets} />}
    </article>
  );
}

export function Steps({ steps, stack }: { steps: Card[]; stack?: boolean }) {
  return (
    <ol className={`ns-steps${stack ? ' ns-steps--stack' : ''}`} style={{ listStyle: 'none', margin: 0, padding: 0 }}>
      {steps.map((s) => (
        <li key={s.title} className="ns-step">
          <div className="ns-card" style={{ display: 'grid', gap: 10, alignContent: 'start' }}>
            <h3 className="ns-h3">{s.title}</h3>
            <p className="ns-body">{s.body}</p>
          </div>
        </li>
      ))}
    </ol>
  );
}

export function Strip({ items, icons }: { items: { title: string; body: string }[]; icons: IconName[] }) {
  const tones = ['', 'ns-icon-tile--cyan', 'ns-icon-tile--violet', '', 'ns-icon-tile--cyan', 'ns-icon-tile--violet'];
  return (
    <div className="ns-strip">
      {items.map((it, i) => (
        <div key={it.title} className="ns-strip-item">
          <span className={`ns-icon-tile ${tones[i % tones.length]}`} style={{ width: 40, height: 40, borderRadius: 12 }}><Icon name={icons[i]} size={20} /></span>
          <b>{it.title}</b>
          <span>{it.body}</span>
        </div>
      ))}
    </div>
  );
}

export function Note({ children, icon = 'shield' }: { children: ReactNode; icon?: IconName }) {
  return <p className="ns-note"><Icon name={icon} size={16} />{children}</p>;
}

export function CtaBand({ copy, primary, secondary }: { copy: SectionCopy & { cta1: string; cta2: string }; primary: { to: string; ext?: boolean }; secondary: { to: string; ext?: boolean } }) {
  const Btn = ({ to, ext, cls, children }: { to: string; ext?: boolean; cls: string; children: ReactNode }) =>
    ext ? <a href={to} className={cls}>{children}</a> : <Link to={to} className={cls}>{children}</Link>;
  return (
    <Section tight>
      <div className="ns-cta">
        <div className="ns-field"><ChevronField opacity={0.1} rows={3} /></div>
        <div style={{ position: 'relative', display: 'grid', gap: 18, maxWidth: 720 }}>
          <Lines lines={copy.title} />
          {copy.body && <p className="ns-lede">{copy.body}</p>}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, marginTop: 8 }}>
            <Btn to={primary.to} ext={primary.ext} cls="ns-btn ns-btn--ink">{copy.cta1}<Arrow /></Btn>
            <Btn to={secondary.to} ext={secondary.ext} cls="ns-btn ns-btn--outline-ink">{copy.cta2}</Btn>
          </div>
        </div>
      </div>
    </Section>
  );
}

/** A floating UI card over a hero scene. */
export function Float({ title, body, tags, style, icon = 'profile', tone }: { title: string; body: string; tags?: string[]; style: React.CSSProperties; icon?: IconName; tone?: 'cyan' | 'violet' | 'grad' }) {
  return (
    <div className="ns-float" style={style}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <span className={`ns-icon-tile${tone ? ` ns-icon-tile--${tone}` : ''}`} style={{ width: 36, height: 36, borderRadius: 10 }}><Icon name={icon} size={18} /></span>
        <b>{title}</b>
      </div>
      <p>{body}</p>
      {tags && <div className="ns-tags">{tags.map((x) => <span key={x} className="ns-tag ns-tag--brand">{x}</span>)}</div>}
    </div>
  );
}

export function Hero({ copy, art, floats, primary, secondary }: {
  copy: SectionCopy & { cta1: string; cta2: string };
  art: ReactNode;
  /** Optional callouts layered over the art (absolute positioned). */
  floats?: ReactNode;
  primary: { to: string; ext?: boolean };
  secondary: { to: string; ext?: boolean };
}) {
  const Btn = ({ to, ext, cls, children }: { to: string; ext?: boolean; cls: string; children: ReactNode }) =>
    ext ? <a href={to} className={cls}>{children}</a> : <Link to={to} className={cls}>{children}</Link>;
  return (
    <section className="ns-hero">
      <div className="ns-glow" />
      <div className="ns-field"><ChevronField opacity={0.045} /></div>
      <div className="ns-container ns-hero-grid" style={{ position: 'relative' }}>
        <div className="ns-hero-copy">
          {copy.eyebrow && <Eyebrow>{copy.eyebrow}</Eyebrow>}
          <Lines lines={copy.title} as="h1" className="ns-h1" />
          {copy.body && <p className="ns-lede">{copy.body}</p>}
          <div className="ns-hero-actions">
            <Btn to={primary.to} ext={primary.ext} cls="ns-btn ns-btn--primary">{copy.cta1}<Arrow /></Btn>
            <Btn to={secondary.to} ext={secondary.ext} cls="ns-btn ns-btn--secondary">{copy.cta2}</Btn>
          </div>
        </div>
        {floats ? (
          <div className="ns-hero-art">
            <div style={{ position: 'absolute', inset: 0 }}>{art}</div>
            {floats}
          </div>
        ) : (
          <div className="ns-hero-art ns-hero-art--flow">{art}</div>
        )}
      </div>
    </section>
  );
}
