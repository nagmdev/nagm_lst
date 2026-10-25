import { Link } from '../i18n/links';
import { useLang } from '../i18n/lang';
import { useSiteText } from '../i18n/siteText';
import { Icon, Arrow } from './icons';
import { links } from './ui';
import {
  formatMoney, moneyParts, priceOf, promotionOf, savingsOf, seatsOf,
  type Catalog, type Interval, type PlanDef, type Market,
} from '../data/pricing';
import type { Lang } from '../i18n/lang';

/**
 * A plan card, shared by the pricing page and the home teaser. The card
 * knows how to price itself from a catalog; who it is for decides the CTA.
 *
 * Every number on it comes from the catalog: the price, the yearly saving
 * (12 × monthly − yearly, from the two real prices — never a fixed "20%"),
 * and any running promotion's before/after. Hiring cards lead with users:
 * that is the difference between a recruiter plan and a company plan.
 */
function Amount({ minor, market, lang }: { minor: number; market: Market; lang: Lang }) {
  const m = moneyParts(minor, market, lang);
  if (market === 'INTL') return <span className="ns-amt"><bdi>${m.amount}</bdi></span>;
  return m.prefix
    ? <><span className="ns-cur">{m.currency}</span><span className="ns-amt"><bdi>{m.amount}</bdi></span></>
    : <><span className="ns-amt"><bdi>{m.amount}</bdi></span><span className="ns-cur">{m.currency}</span></>;
}

function Users({ plan, cat, quote }: { plan: PlanDef; cat: Catalog; quote: boolean }) {
  const t = useSiteText().pricing;
  const seats = seatsOf(cat, plan);
  const one = plan.audience === 'RECRUITER' || seats === 1;
  const big = quote || seats == null ? t.seats.unlimited : one ? t.seats.one : t.seats.many(seats);
  const sub = plan.audience === 'RECRUITER' ? t.seats.oneSub : one ? t.seats.ownerOnly : t.seats.teamSub;
  return (
    <div className="ns-plan-users" data-testid="plan-users" data-one={one ? 'true' : undefined}>
      <span className="ns-plan-users-icon" aria-hidden="true"><Icon name={one ? 'user' : 'team'} size={20} /></span>
      <span>
        <b>{big}</b>
        <span>{sub}</span>
      </span>
    </div>
  );
}

export function PlanCard({ plan, cat, interval, compact, tag, wide }: { plan: PlanDef; cat: Catalog; interval: Interval; compact?: boolean; tag?: string; wide?: boolean }) {
  const lang = useLang();
  const t = useSiteText().pricing;
  const amount = priceOf(cat, plan.id, interval);
  const isQuote = amount === undefined;
  const isFree = amount === null;
  const priced = !isQuote && !isFree;
  const promo = priced ? promotionOf(cat, plan.id, interval) : null;
  const promoPrice = promo?.prices[interval] ?? null;
  const discounted = promo && promo.kind !== 'FREE_DAYS' && promoPrice && promoPrice.totalMinor < promoPrice.listMinor ? promoPrice : null;
  const saving = priced && interval === 'YEAR' ? savingsOf(cat, plan.id) : null;

  // A paid plan's button carries the plan and the period shown, so the person
  // lands on paying for exactly this after signing up.
  const chosen = priced ? { id: plan.id, interval } : undefined;
  const ctaTo = isQuote ? links.sales
    : plan.audience === 'CANDIDATE' ? links.register('candidate', chosen)
    : plan.audience === 'RECRUITER' ? links.register('recruiter', chosen)
    : links.register('company', chosen);
  const ctaLabel = isQuote ? t.contactSales : isFree ? t.startFree : promo?.kind === 'FREE_DAYS' ? t.promo.startTrial : t.choose(plan.name[lang]);
  const ctaClass = `ns-btn ns-btn--block${(plan.featured && !tag) || promo ? ' ns-btn--primary' : ' ns-btn--secondary'}`;

  // What is charged now for this period: the promotion's first-period price, else the list price.
  const charged = priced ? (discounted ? discounted.totalMinor : (amount as number)) : null;
  // Yearly cards show the per-month equivalent large (to the major unit) and the exact yearly total small.
  const perMonthEquivalent = charged != null && interval === 'YEAR' ? Math.round(charged / 1200) * 100 : null;
  const dateFmt = (iso: string) => new Date(iso).toLocaleDateString(lang === 'ar' ? 'ar-EG-u-nu-latn' : 'en-GB', { day: 'numeric', month: 'short' });

  return (
    <article className={`ns-card ns-plan${plan.featured && !tag ? ' ns-plan--featured' : ''}${wide ? ' ns-plan--wide' : ''}${promo ? ' ns-plan--promo' : ''}${plan.audience !== 'CANDIDATE' && !compact ? ' ns-plan--users' : ''}`} aria-label={plan.name[lang]}>
      <div className="ns-plan-name">
        <b>{plan.name[lang]}</b>
        {promo ? (
          <span className="ns-tag ns-tag--ok" data-testid="plan-promo">
            <Icon name="spark" size={13} style={{ verticalAlign: -2, marginInlineEnd: 4 }} />
            {promo.kind === 'PERCENT' ? t.promo.percent(promo.value) : promo.kind === 'AMOUNT' ? t.promo.amount(formatMoney(promo.value, cat.market, lang)) : t.promo.freeDays(promo.value)}
          </span>
        ) : tag ? <span className="ns-tag">{tag}</span> : plan.featured && <span className="ns-tag ns-tag--brand">{t.mostPopular}</span>}
      </div>
      {plan.audience !== 'CANDIDATE' && !compact && <Users plan={plan} cat={cat} quote={isQuote} />}
      <div>
        {discounted && (
          <div className="ns-price-was" data-testid="plan-was"><s><bdi>{formatMoney(interval === 'YEAR' ? Math.round(discounted.listMinor / 1200) * 100 : discounted.listMinor, cat.market, lang)}</bdi></s></div>
        )}
        <div className="ns-price" data-testid="plan-price">
          {isQuote ? (
            <span className="ns-amt" style={{ fontSize: 26 }}>{t.quote}</span>
          ) : isFree ? (
            <Amount minor={0} market={cat.market} lang={lang} />
          ) : (
            <>
              <Amount minor={perMonthEquivalent ?? (charged as number)} market={cat.market} lang={lang} />
              <span className="ns-per">{t.perMonth}</span>
            </>
          )}
        </div>
        <div className="ns-price-sub">
          {priced && interval === 'YEAR' && <span style={{ display: 'block' }}>{t.billedYearly(formatMoney(charged as number, cat.market, lang))}</span>}
          {priced && interval === 'MONTH' && !discounted && !promo && t.billedMonthly}
          {discounted && <span style={{ display: 'block' }}>{(interval === 'YEAR' ? t.promo.firstYear : t.promo.firstMonth)(formatMoney(discounted.listMinor, cat.market, lang))}</span>}
          {promo?.kind === 'FREE_DAYS' && <span style={{ display: 'block' }}>{t.promo.trialThen(promo.value, `${formatMoney(amount as number, cat.market, lang)} ${interval === 'YEAR' ? t.perYear : t.perMonth}`)}</span>}
          {isFree && (lang === 'ar' ? 'بلا بطاقة، وبلا حد زمني.' : 'No card, no time limit.')}
          {isQuote && (lang === 'ar' ? 'عقد سنوي وفاتورة.' : 'Annual contract, invoiced.')}
          {saving && !discounted && (
            <span className="ns-tag ns-tag--ok" data-testid="plan-saving" style={{ display: 'inline-block', marginTop: 6 }}>
              {saving.monthsFree ? t.save.monthsFree(saving.monthsFree) : t.save.pct(saving.percent)} · {t.save.youSave(formatMoney(saving.amountMinor, cat.market, lang))}
            </span>
          )}
          {promo && promo.remaining != null && promo.maxRedemptions != null && (
            <span className="ns-plan-left" data-testid="plan-left">
              {t.promo.left(promo.remaining, promo.maxRedemptions)}{promo.endsAt ? ` · ${t.promo.until(dateFmt(promo.endsAt))}` : ''}
            </span>
          )}
          {promo && promo.remaining == null && promo.endsAt && <span className="ns-plan-left">{t.promo.until(dateFmt(promo.endsAt))}</span>}
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
