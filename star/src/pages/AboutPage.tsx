import { Link } from '../i18n/links';
import { useLang } from '../i18n/lang';
import { useSiteText } from '../i18n/siteText';
import { Shell, Section, SectionHead, Lines, Eyebrow, FeatureCard, CtaBand, usePageMeta, links } from '../design/ui';
import { RegionScene, ChevronField } from '../design/art';
import { Icon, Arrow, type IconName } from '../design/icons';

export default function AboutPage() {
  const t = useSiteText();
  const lang = useLang();
  const a = t.about;
  usePageMeta('/about');

  return (
    <Shell>
      <section className="ns-hero" style={{ paddingBottom: 0 }}>
        <div className="ns-glow" />
        <div className="ns-field"><ChevronField opacity={0.045} /></div>
        <div className="ns-container" style={{ position: 'relative' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, marginBottom: 36, flexWrap: 'wrap' }}>
            <Link to="/" className="ns-btn ns-btn--ghost ns-btn--sm" style={{ paddingInlineStart: 6 }}><Icon name="arrow" size={16} style={{ transform: lang === 'ar' ? 'none' : 'scaleX(-1)' }} />{a.back}</Link>
            <Link to={links.register()} className="ns-btn ns-btn--primary ns-btn--sm">{a.join}<Arrow size={16} /></Link>
          </div>
          <div className="ns-hero-copy" style={{ maxWidth: 820 }}>
            <Eyebrow>{a.hero.eyebrow}</Eyebrow>
            <Lines lines={a.hero.title} as="h1" className="ns-h1" />
            <p className="ns-lede" style={{ maxWidth: '68ch' }}>{a.hero.body}</p>
          </div>
        </div>
      </section>

      {/* 3 — the problem */}
      <Section>
        <div className="ns-split" style={{ alignItems: 'start' }}>
          <div><Lines lines={a.problem.title} /></div>
          <div style={{ display: 'grid', gap: 18 }}>
            <Para icon="profile" text={a.problem.seekers} />
            <Para icon="building" text={a.problem.companies} tone="cyan" />
          </div>
        </div>
      </Section>

      {/* 4 — philosophy */}
      <Section tone="band">
        <SectionHead copy={a.philosophy} center />
        <div className="ns-grid ns-grid-3">
          {a.philosophy.cards.map((c, i) => <FeatureCard key={c.title} card={c} icon={(['profile', 'match', 'stages'] as IconName[])[i]} tone={([undefined, 'cyan', 'violet'] as const)[i]} cut={i === 0} />)}
        </div>
      </Section>

      {/* 5 — region */}
      <Section>
        <div className="ns-split">
          <div>
            <SectionHead copy={a.region} />
            <div style={{ display: 'grid', gap: 12 }}>
              {a.region.cities.map((c, i) => (
                <div key={c.city} className="ns-card" style={{ display: 'flex', gap: 14, alignItems: 'center', padding: '16px 18px' }}>
                  <span className={`ns-icon-tile ${['', 'ns-icon-tile--cyan', 'ns-icon-tile--violet'][i]}`} style={{ width: 40, height: 40, borderRadius: 12 }}><Icon name="pin" size={20} /></span>
                  <div>
                    <b style={{ fontFamily: 'var(--fontDisplay)', color: 'var(--ink)', display: 'block' }}>{c.city}</b>
                    <span className="ns-body" style={{ fontSize: 14 }}>{c.role}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div><RegionScene /></div>
        </div>
      </Section>

      <CtaBand copy={a.cta} primary={{ to: links.register('company') }} secondary={{ to: links.register('candidate') }} />
    </Shell>
  );
}

function Para({ icon, text, tone }: { icon: IconName; text: string; tone?: 'cyan' }) {
  return (
    <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
      <span className={`ns-icon-tile${tone ? ` ns-icon-tile--${tone}` : ''}`} style={{ width: 40, height: 40, borderRadius: 12 }}><Icon name={icon} size={20} /></span>
      <p className="ns-lede" style={{ fontSize: 16 }}>{text}</p>
    </div>
  );
}
