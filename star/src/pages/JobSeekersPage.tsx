import { useLang } from '../i18n/lang';
import { useSiteText } from '../i18n/siteText';
import { Shell, Hero, Float, Section, SectionHead, Strip, FeatureCard, Steps, Bullets, Note, CtaBand, usePageMeta, links } from '../design/ui';
import { ProfileScene, MatchScene, InterviewScene, HeroScene } from '../design/art';
import { Icon, Arrow, type IconName } from '../design/icons';

/** Solutions → by user → job seekers. */
const STRIP_ICONS: IconName[] = ['profile', 'cv', 'match', 'search', 'bell', 'interview'];

export default function JobSeekersPage() {
  const t = useSiteText();
  const lang = useLang();
  const s = t.seekers;
  usePageMeta(lang === 'ar' ? 'نجم للباحثين عن عمل — ملف مهني، سيرة ذاتية، تحليل توافق' : 'Nagm for job seekers — profile, CV, match analysis', s.hero.body ?? '');

  return (
    <Shell>
      <Hero
        copy={s.hero}
        art={<HeroScene />}
        primary={{ to: links.register('candidate') }}
        secondary={{ to: links.jobs, ext: true }}
        floats={
          <>
            <Float title={s.hero.card1.title} body={s.hero.card1.body} icon="profile" style={{ left: '10%', top: '24%', width: 290, animation: 'ngFloat 7s ease-in-out infinite' }} />
            <Float title={s.hero.card2.title} body={s.hero.card2.body} icon="match" tone="cyan" style={{ right: 0, top: '55%', width: 250, animation: 'ngFloat2 8s ease-in-out infinite' }} />
          </>
        }
      />

      <Section tight tone="band">
        <SectionHead copy={{ title: [s.strip.title] }} />
        <Strip items={s.strip.items} icons={STRIP_ICONS} />
      </Section>

      {/* 3 — profile */}
      <Section id="profile">
        <div className="ns-split">
          <div>
            <SectionHead copy={s.profile} />
            <div className="ns-grid" style={{ gap: 16 }}>
              {s.profile.cards.map((c, i) => <FeatureCard key={c.title} card={c} icon={i === 0 ? 'cv' : 'spark'} tone={i === 0 ? undefined : 'violet'} lift={false} />)}
            </div>
          </div>
          <div><ProfileScene /></div>
        </div>
      </Section>

      {/* 4 — CV */}
      <Section id="cv" tone="band">
        <SectionHead copy={s.cv} center />
        <div className="ns-grid ns-grid-2">
          {s.cv.cards.map((c, i) => <FeatureCard key={c.title} card={c} icon={i === 0 ? 'cv' : 'history'} tone={i === 0 ? undefined : 'cyan'} cut={i === 0} />)}
        </div>
        <div className="ns-card ns-card--soft" style={{ marginTop: 16 }}>
          <div className="ns-grid ns-grid-4" style={{ gap: 12 }}>
            {s.cv.bullets.map((b) => <Bullets key={b} items={[b]} />)}
          </div>
        </div>
      </Section>

      {/* 5 — match */}
      <Section id="match">
        <div className="ns-split ns-split--reverse">
          <div>
            <SectionHead copy={s.match} />
            <Steps steps={s.match.steps} stack />
            <div style={{ marginTop: 20 }}><Note>{s.match.note}</Note></div>
          </div>
          <div><MatchScene /></div>
        </div>
      </Section>

      {/* 6 — discover */}
      <Section id="discover" tone="ink" field>
        <SectionHead copy={s.discover} />
        <div className="ns-grid ns-grid-3">
          {s.discover.cards.map((c, i) => (
            <article key={c.title} style={{ background: 'rgba(255,255,255,.04)', border: '1px solid var(--inkPanelLine)', borderRadius: 18, padding: 24, display: 'grid', gap: 12, alignContent: 'start' }}>
              <span className="ns-icon-tile ns-icon-tile--grad" style={{ ['--icAccent' as string]: 'rgba(255,255,255,.75)' }}><Icon name={(['spark', 'match', 'language'] as IconName[])[i]} /></span>
              <h3 className="ns-h3" style={{ color: '#fff' }}>{c.title}</h3>
              <p className="ns-body" style={{ color: '#B6BFCF' }}>{c.body}</p>
            </article>
          ))}
        </div>
        <div style={{ marginTop: 28 }}>
          <a href={links.jobs} className="ns-btn ns-btn--ink">{s.discover.cta}<Arrow /></a>
        </div>
      </Section>

      {/* 7 — apply */}
      <Section id="apply">
        <SectionHead copy={s.apply} center />
        <div className="ns-grid ns-grid-2">
          {s.apply.cards.map((c, i) => <FeatureCard key={c.title} card={c} icon={i === 0 ? 'jobs' : 'bell'} tone={i === 0 ? undefined : 'cyan'} />)}
        </div>
      </Section>

      {/* 8 — interview */}
      <Section id="interview" tone="band">
        <div className="ns-split">
          <div>
            <SectionHead copy={s.interview} />
            <div className="ns-grid" style={{ gap: 14 }}>
              {s.interview.cards.map((c, i) => <FeatureCard key={c.title} card={c} icon={(['interview', 'cv', 'refresh'] as IconName[])[i]} tone={(['violet', undefined, 'cyan'] as const)[i]} lift={false} />)}
            </div>
          </div>
          <div><InterviewScene /></div>
        </div>
      </Section>

      {/* 9 — share + GitHub */}
      <Section id="share">
        <SectionHead copy={s.share} center />
        <div className="ns-grid ns-grid-2">
          {s.share.cards.map((c, i) => <FeatureCard key={c.title} card={c} icon={i === 0 ? 'share' : 'code'} tone={i === 0 ? 'cyan' : 'violet'} cut={i === 1} />)}
        </div>
      </Section>

      <CtaBand copy={s.cta} primary={{ to: links.register('candidate') }} secondary={{ to: links.jobs, ext: true }} />
    </Shell>
  );
}
