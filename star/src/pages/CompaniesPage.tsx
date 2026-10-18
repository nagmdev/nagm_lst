import { useLang } from '../i18n/lang';
import { useSiteText } from '../i18n/siteText';
import { Shell, Hero, Float, Section, SectionHead, Strip, FeatureCard, Steps, Note, CtaBand, usePageMeta, links } from '../design/ui';
import { PipelineScene, BaseScene, TeamScene, AnalyticsScene, CompanyScene } from '../design/art';
import { Icon, type IconName } from '../design/icons';

/** Solutions → by user → companies and recruiters. */
const STRIP_ICONS: IconName[] = ['spark', 'applicants', 'stages', 'mention', 'rediscover', 'analytics'];

export default function CompaniesPage() {
  const t = useSiteText();
  const lang = useLang();
  const c = t.companies;
  usePageMeta(lang === 'ar' ? 'نجم للشركات ومسؤولي التوظيف — وظائفك ومرشحوك وفريقك في مكان واحد' : 'Nagm for companies and recruiters — jobs, candidates and team in one place', c.hero.body ?? '');

  return (
    <Shell>
      <Hero
        copy={c.hero}
        art={<PipelineScene />}
        primary={{ to: links.register('company') }}
        secondary={{ to: links.register('recruiter') }}
        floats={
          <>
            <Float title={c.hero.card1.title} body={c.hero.card1.body} icon="profile" style={{ left: 0, top: '2%', width: 270, animation: 'ngFloat 7s ease-in-out infinite' }} />
            <Float title={c.hero.card2.title} body={c.hero.card2.body} icon="calendar" tone="cyan" style={{ right: 0, bottom: '4%', width: 250, animation: 'ngFloat2 8s ease-in-out infinite' }} />
          </>
        }
      />

      <Section tight tone="band">
        <SectionHead copy={{ title: [c.strip.title] }} />
        <Strip items={c.strip.items} icons={STRIP_ICONS} />
      </Section>

      {/* 3 — jobs */}
      <Section id="jobs">
        <SectionHead copy={c.jobs} center />
        <div className="ns-grid ns-grid-2">
          {c.jobs.cards.map((x, i) => <FeatureCard key={x.title} card={x} icon={i === 0 ? 'spark' : 'jobs'} tone={i === 0 ? 'violet' : undefined} cut={i === 0} />)}
        </div>
      </Section>

      {/* 4 — review */}
      <Section id="review" tone="band">
        <SectionHead copy={c.review} />
        <div className="ns-grid ns-grid-3">
          {c.review.cards.map((x, i) => <FeatureCard key={x.title} card={x} icon={(['applicants', 'match', 'profile'] as IconName[])[i]} tone={([undefined, 'cyan', 'violet'] as const)[i]} />)}
        </div>
        <div style={{ marginTop: 20 }}><Note>{c.review.note}</Note></div>
      </Section>

      {/* 5 — stages */}
      <Section id="stages">
        <div className="ns-split">
          <div>
            <SectionHead copy={c.stages} />
            <Steps steps={c.stages.steps} stack />
          </div>
          <div><PipelineScene /></div>
        </div>
      </Section>

      {/* 6 — team */}
      <Section id="team" tone="ink" field>
        <div className="ns-split ns-split--reverse">
          <div>
            <SectionHead copy={c.team} />
            <div className="ns-grid ns-grid-2" style={{ gap: 14 }}>
              {c.team.cards.map((x, i) => (
                <article key={x.title} style={{ background: 'rgba(255,255,255,.04)', border: '1px solid var(--inkPanelLine)', borderRadius: 18, padding: 22, display: 'grid', gap: 10, alignContent: 'start' }}>
                  <span className="ns-icon-tile ns-icon-tile--grad" style={{ width: 40, height: 40, borderRadius: 12, ['--icAccent' as string]: 'rgba(255,255,255,.75)' }}>
                    <IconSmall i={i} />
                  </span>
                  <h3 className="ns-h3" style={{ color: '#fff', fontSize: 17 }}>{x.title}</h3>
                  <p className="ns-body" style={{ color: '#B6BFCF', fontSize: 14 }}>{x.body}</p>
                </article>
              ))}
            </div>
          </div>
          <div><TeamScene /></div>
        </div>
      </Section>

      {/* 7 — candidate base */}
      <Section id="base">
        <div className="ns-split">
          <div>
            <SectionHead copy={c.base} />
            <div className="ns-grid" style={{ gap: 14 }}>
              {c.base.cards.map((x, i) => <FeatureCard key={x.title} card={x} icon={i === 0 ? 'applicants' : 'search'} tone={i === 0 ? undefined : 'cyan'} lift={false} />)}
            </div>
          </div>
          <div><BaseScene /></div>
        </div>
      </Section>

      {/* 8 — rediscovery */}
      <Section id="rediscover" tone="band">
        <SectionHead copy={c.rediscover} center />
        <Steps steps={c.rediscover.steps} />
      </Section>

      {/* 9 — workspace */}
      <Section id="workspace">
        <SectionHead copy={c.workspace} center />
        <div className="ns-grid ns-grid-2">
          {c.workspace.cards.map((x, i) => <FeatureCard key={x.title} card={x} icon={i === 0 ? 'team' : 'workspace'} tone={i === 0 ? 'violet' : 'cyan'} cut={i === 1} />)}
        </div>
      </Section>

      {/* 10 — presence + verification */}
      <Section id="presence" tone="band">
        <div className="ns-split ns-split--reverse">
          <div>
            <SectionHead copy={c.presence} />
            <div className="ns-grid" style={{ gap: 14 }}>
              {c.presence.cards.map((x, i) => <FeatureCard key={x.title} card={x} icon={(['building', 'star', 'verified'] as IconName[])[i]} tone={([undefined, 'violet', 'cyan'] as const)[i]} lift={false} />)}
            </div>
          </div>
          <div><CompanyScene /></div>
        </div>
      </Section>

      {/* 11 — analytics */}
      <Section id="analytics">
        <div className="ns-split">
          <div>
            <SectionHead copy={c.analytics} />
            <div className="ns-grid" style={{ gap: 14 }}>
              {c.analytics.cards.map((x, i) => <FeatureCard key={x.title} card={x} icon={i === 0 ? 'funnel' : 'sheet'} tone={i === 0 ? undefined : 'cyan'} lift={false} />)}
            </div>
          </div>
          <div><AnalyticsScene /></div>
        </div>
      </Section>

      <CtaBand copy={c.cta} primary={{ to: links.register('company') }} secondary={{ to: links.register('recruiter') }} />
    </Shell>
  );
}

function IconSmall({ i }: { i: number }) {
  const names: IconName[] = ['mention', 'interview', 'bell', 'history'];
  return <Icon name={names[i]} size={20} />;
}
