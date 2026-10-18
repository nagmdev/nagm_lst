import { Link } from 'react-router-dom';
import { useLang } from '../i18n/lang';
import { useSiteText } from '../i18n/siteText';
import { Icon, Arrow } from './icons';
import { links } from './ui';
import { formatMoney, moneyParts, priceOf, type Catalog, type Interval, type PlanDef, type Market } from '../data/pricing';
import type { Lang } from '../i18n/lang';

/**
 * A plan card, shared by the pricing page and the home teaser. The card
 * knows how to price itself from a catalog; who it is for decides the CTA.
 */
function Amount({ minor, market, lang }: { minor: number; market: Market; lang: Lang }) {
  const m = moneyParts(minor, market, lang);
  if (market === 'INTL') return <span className="ns-amt"><bdi>${m.amount}</bdi></span>;
  return m.prefix
    ? <><span className="ns-cur">{m.currency}</span><span className="ns-amt"><bdi>{m.amount}</bdi></span></>
    : <><span className="ns-amt"><bdi>{m.amount}</bdi></span><span className="ns-cur">{m.currency}</span></>;
}

export function PlanCard({ plan, cat, interval, compact, tag, wide }: { plan: PlanDef; cat: Catalog; interval: Interval; compact?: boolean; tag?: string; wide?: boolean }) {
  const lang = useLang();
  const t = useSiteText().pricing;
  const amount = priceOf(cat, plan.id, interval);
  const monthly = priceOf(cat, plan.id, 'MONTH');
  const isQuote = amount === undefined;
  const isFree = amount === null;

  const ctaTo = isQuote ? links.sales
    : plan.audience === 'CANDIDATE' ? links.register('candidate')
    : plan.audience === 'RECRUITER' ? links.register('recruiter')
    : links.register('company');
  const ctaLabel = isQuote ? t.contactSales : isFree ? t.startFree : t.choose(plan.name[lang]);
  const ctaClass = `ns-btn ns-btn--block${plan.featured && !tag ? ' ns-btn--primary' : ' ns-btn--secondary'}`;

  // Yearly cards show the per-month equivalent large and the yearly total small.
  const perMonthEquivalent = !isQuote && !isFree && interval === 'YEAR' ? Math.round((amount as number) / 1200) * 100 : null;

  return (
    <article className={`ns-card ns-plan${plan.featured && !tag ? ' ns-plan--featured' : ''}${wide ? ' ns-plan--wide' : ''}`} aria-label={plan.name[lang]}>
      <div className="ns-plan-name">
        <b>{plan.name[lang]}</b>
        {tag ? <span className="ns-tag">{tag}</span> : plan.featured && <span className="ns-tag ns-tag--brand">{t.mostPopular}</span>}
      </div>
      <div>
        <div className="ns-price">
          {isQuote ? (
            <span className="ns-amt" style={{ fontSize: 26 }}>{t.quote}</span>
          ) : isFree ? (
            <Amount minor={0} market={cat.market} lang={lang} />
          ) : (
            <>
              <Amount minor={perMonthEquivalent ?? (amount as number)} market={cat.market} lang={lang} />
              <span className="ns-per">{t.perMonth}</span>
            </>
          )}
        </div>
        <div className="ns-price-sub">
          {!isQuote && !isFree && interval === 'YEAR' && <span style={{ display: 'block' }}>{t.billedYearly(formatMoney(amount as number, cat.market, lang))}</span>}
          {!isQuote && !isFree && interval === 'MONTH' && t.billedMonthly}
          {isFree && (lang === 'ar' ? 'بلا بطاقة، وبلا حد زمني.' : 'No card, no time limit.')}
          {isQuote && (lang === 'ar' ? 'عقد سنوي وفاتورة.' : 'Annual contract, invoiced.')}
          {interval === 'YEAR' && monthly && !isQuote && !isFree && (
            <span className="ns-tag ns-tag--ok" style={{ display: 'inline-block', marginTop: 6 }}>{t.interval.save}</span>
          )}
        </div>
      </div>
      <div style={{ display: 'grid', gap: 12 }}>
        <p className="ns-body" style={{ fontSize: 14 }}>{plan.blurb[lang]}</p>
        {!compact && (
          <ul className="ns-list">
            {plan.points[lang].map((p) => <li key={p} style={{ fontSize: 14 }}><Icon name="check" size={15} weight={2.2} />{p}</li>)}
          </ul>
        )}
      </div>
      {isQuote ? (
        <a href={ctaTo} className={ctaClass}>{ctaLabel}<Arrow size={16} /></a>
      ) : (
        <Link to={ctaTo} className={ctaClass}>{ctaLabel}<Arrow size={16} /></Link>
      )}
    </article>
  );
}
