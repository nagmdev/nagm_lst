import { Link } from '../i18n/links';
import { useSiteText } from '../i18n/siteText';
import { Section, SectionHead, Steps, Note, links } from './ui';
import { Arrow } from './icons';

/**
 * How a company starts: sign up with a work email, upload the documents, pick
 * a plan and pay, and Nagm activates the dashboard. Home and /companies.
 */
export function CompanyStart({ more }: { more?: boolean }) {
  const s = useSiteText().home.start;
  return (
    <Section id="company-start" tone="band">
      <SectionHead copy={s} center />
      <Steps steps={s.steps} />
      <div style={{ marginTop: 20 }}><Note icon="shield">{s.note}</Note></div>
      <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap', marginTop: 24 }}>
        <Link to={links.register('company')} className="ns-btn ns-btn--primary" data-testid="company-start-cta">{s.cta}<Arrow /></Link>
        {more && <Link to="/companies" className="ns-btn ns-btn--secondary">{s.more}<Arrow /></Link>}
      </div>
    </Section>
  );
}
