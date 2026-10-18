import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useLang } from './i18n/lang';
import { useSiteText } from './i18n/siteText';
import { Shell, Hero, Section, SectionHead, Strip, CtaBand, Lines, Eyebrow, Bullets, usePageMeta, links } from './design/ui';
import { SeekerStage, MatchCard, PipelineBoard, ScaleBox, CandidateCard, ApplicantsTable, FunnelPanel } from './design/mock';
import { Icon, Arrow, type IconName } from './design/icons';
import { PlanCard } from './design/plans';
import { PLANS, staticCatalog, guessMarket } from './data/pricing';

/**
 * nagm.io home. CTAs go to nagm.io's own login/register (the pre-auth flow);
 * those pages sign the visitor in and only THEN hand off to app.nagm.io — so
 * nobody reaches the app before authenticating.
 */

const STRIP_ICONS: IconName[] = ['profile', 'cv', 'match', 'interview', 'stages', 'analytics'];
const TEASER_PLANS = ['CANDIDATE_FREE', 'CANDIDATE_PRO', 'COMPANY_GROWTH', 'COMPANY_ENTERPRISE'];

export default function Landing() {
  const t = useSiteText();
  const lang = useLang();
  usePageMeta(
    lang === 'ar' ? 'نجم — أظهر قدراتك، اكتشف الأنسب، واتخذ خطوتك التالية' : 'Nagm — Show what you can do. Find the right fit.',
    t.home.hero.body ?? '',
  );
  const cat = useMemo(() => staticCatalog(guessMarket()), []);
  const h = t.home;

  return (
    <Shell>
      <Hero
        copy={h.hero}
        art={<SeekerStage card1={h.hero.card1.title} card1Tags={h.hero.card1.tags} card2={h.hero.card2.title} card2Body={h.hero.card2.body} />}
        primary={{ to: links.register('candidate') }}
        secondary={{ to: links.register('company') }}
      />

      {/* 3 — six-card strip */}
      <Section tight tone="band">
        <SectionHead copy={{ title: [h.strip.title], body: h.strip.body }} row />
        <Strip items={h.strip.items} icons={STRIP_ICONS} />
      </Section>

      {/* 4 — one platform, two sides */}
      <Section id="two-sides">
        <SectionHead copy={h.twoSides} center />
        <div className="ns-grid ns-grid-2" style={{ alignItems: 'stretch' }}>
          <SideCard card={h.twoSides.seekers} scene={<ScaleBox width={470} height={318}><MatchCard /></ScaleBox>} to={links.register('candidate')} icon="profile" />
          <SideCard card={h.twoSides.companies} scene={<ScaleBox width={560} height={318}><PipelineBoard /></ScaleBox>} to={links.register('company')} icon="building" tone="cyan" />
        </div>
      </Section>

      {/* 5 — AI */}
      <Section tone="ink" field>
        <SectionHead copy={h.ai} />
        <div className="ns-grid ns-grid-3">
          {h.ai.stages.map((s, i) => (
            <article key={s.tag} style={{ position: 'relative', background: 'rgba(255,255,255,.04)', border: '1px solid var(--inkPanelLine)', borderRadius: 18, padding: 26, display: 'grid', gap: 12, alignContent: 'start' }}>
              <span className="ns-kicker" style={{ color: 'var(--cyan)' }}>{s.tag}</span>
              <span style={{ position: 'absolute', top: 22, insetInlineEnd: 22, width: 34, height: 34, borderRadius: 10, background: 'var(--grad)', display: 'grid', placeItems: 'center', color: '#fff' }}>
                <Icon name={(['cv', 'match', 'rediscover'] as IconName[])[i]} size={18} style={{ ['--icAccent' as string]: 'rgba(255,255,255,.75)' }} />
              </span>
              <h3 className="ns-h3" style={{ color: '#fff', paddingInlineEnd: 44 }}>{s.title}</h3>
              <p className="ns-body" style={{ color: '#B6BFCF' }}>{s.body}</p>
            </article>
          ))}
        </div>
      </Section>

      {/* 6 — why Nagm: a bento, so the three heaviest ideas show the product */}
      <Section id="why">
        <SectionHead copy={h.why} center />
        <div className="ns-bento">
          <BentoCard card={h.why.cards[0]} icon="profile" wide visual={<ScaleBox width={360} height={250}><CandidateCard /></ScaleBox>} />
          <BentoCard card={h.why.cards[1]} icon="interview" tone="violet" />
          <BentoCard card={h.why.cards[2]} icon="mention" tone="cyan" />
          <BentoCard card={h.why.cards[3]} icon="rediscover" wide visual={<ScaleBox width={430} height={300}><ApplicantsTable rows={4} /></ScaleBox>} />
          <BentoCard card={h.why.cards[4]} icon="workspace" tone="cyan" className="ns-bento-e" />
          <BentoCard card={h.why.cards[5]} icon="analytics" wide visual={<ScaleBox width={430} height={300}><FunnelPanel /></ScaleBox>} className="ns-bento-f" />
        </div>
      </Section>

      {/* 7 — plans */}
      <Section tone="band" id="plans">
        <SectionHead copy={h.plans} center />
        <div className="ns-pricing-grid ns-pricing-grid--4">
          {TEASER_PLANS.map((id) => {
            const p = PLANS.find((x) => x.id === id)!;
            return <PlanCard key={id} plan={p} cat={cat} interval="MONTH" compact tag={p.audience === 'CANDIDATE' ? t.pricing.audience.seekers : t.pricing.audience.companies} />;
          })}
        </div>
        <div style={{ textAlign: 'center', marginTop: 28 }}>
          <Link to="/pricing" className="ns-btn ns-btn--secondary">{h.plans.more}<Arrow /></Link>
        </div>
      </Section>

      {/* 8 — closing */}
      <CtaBand copy={h.cta} primary={{ to: links.register('candidate') }} secondary={{ to: links.register('company') }} />
    </Shell>
  );
}

function BentoCard({ card, icon, tone, wide, visual, className = '' }: { card: { title: string; body: string }; icon: IconName; tone?: 'cyan' | 'violet'; wide?: boolean; visual?: React.ReactNode; className?: string }) {
  const copy = (
    <div className="ns-bento-copy">
      <span className={`ns-icon-tile${tone ? ` ns-icon-tile--${tone}` : ''}`}><Icon name={icon} /></span>
      <h3 className="ns-h3">{card.title}</h3>
      <p className="ns-body">{card.body}</p>
    </div>
  );
  return (
    <article className={`ns-card ns-bento-card${wide ? ' ns-bento-wide' : ''} ${className}`}>
      {copy}
      {wide && visual && <div className="ns-bento-visual" aria-hidden="true">{visual}</div>}
    </article>
  );
}

function SideCard({ card, scene, to, icon, tone }: { card: { title: string; body: string; bullets?: string[]; cta?: string }; scene: React.ReactNode; to: string; icon: IconName; tone?: 'cyan' }) {
  return (
    <article className="ns-card" style={{ padding: 0, display: 'grid', gridTemplateRows: 'auto 1fr' }}>
      <div className="ns-peek" aria-hidden="true">{scene}</div>
      <div style={{ padding: 26, display: 'grid', gap: 16, alignContent: 'start' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span className={`ns-icon-tile${tone ? ` ns-icon-tile--${tone}` : ''}`} style={{ width: 40, height: 40, borderRadius: 12 }}><Icon name={icon} size={20} /></span>
          <h3 className="ns-h3">{card.title}</h3>
        </div>
        <p className="ns-body">{card.body}</p>
        {card.bullets && <Bullets items={card.bullets} />}
        <div style={{ marginTop: 'auto', paddingTop: 8 }}>
          <Link to={to} className="ns-btn ns-btn--primary">{card.cta}<Arrow /></Link>
        </div>
      </div>
    </article>
  );
}

// Kept for pages that want the headline block without the whole hero.
export { Lines, Eyebrow };
