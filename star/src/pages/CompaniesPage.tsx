import { useSiteText } from '../i18n/siteText';
import { Shell, Hero, Section, SectionHead, Strip, FeatureCard, Steps, Note, CtaBand, usePageMeta, links } from '../design/ui';
import { TeamStage, PipelineBoard, ApplicantsTable, TeamThread, FunnelPanel, CompanyHeader, ScaleBox } from '../design/mock';
import { Icon, type IconName } from '../design/icons';
import { CompanyStart } from '../design/companyStart';

/** Solutions → by user → companies and recruiters. */
const STRIP_ICONS: IconName[] = ['spark', 'applicants', 'stages', 'mention', 'rediscover', 'analytics'];

export default function CompaniesPage() {
  const t = useSiteText();
  const c = t.companies;
  usePageMeta('/companies');

  return (
    <Shell>
      <Hero
        copy={c.hero}
        art={<TeamStage card1={c.hero.card1.title} card2={c.hero.card2.title} />}
        primary={{ to: links.register('company') }}
        secondary={{ to: links.register('recruiter') }}
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
          <div className="ns-sticky-visual"><ScaleBox width={680} height={330}><PipelineBoard /></ScaleBox></div>
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
          <div><ScaleBox width={460} height={330}><TeamThread /></ScaleBox></div>
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
          <div><ScaleBox width={470} height={400}><ApplicantsTable rows={6} /></ScaleBox></div>
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
          <div><ScaleBox width={420} height={300}><CompanyHeader /></ScaleBox></div>
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
          <div><ScaleBox width={470} height={290}><FunnelPanel /></ScaleBox></div>
        </div>
      </Section>

      <CompanyStart />

      <CtaBand copy={c.cta} primary={{ to: links.register('company') }} secondary={{ to: links.register('recruiter') }} />
    </Shell>
  );
}

function IconSmall({ i }: { i: number }) {
  const names: IconName[] = ['mention', 'interview', 'bell', 'history'];
  return <Icon name={names[i]} size={20} />;
}
