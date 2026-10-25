import { useEffect, useMemo, useState } from 'react';
import { useClientValue } from '../utils/useClientValue';
import { useSearchParams } from 'react-router-dom';
import { useLang } from '../i18n/lang';
import { useSiteText } from '../i18n/siteText';
import { Shell, Section, SectionHead, Lines, Eyebrow, Note, usePageMeta, links } from '../design/ui';
import { BillingScene, ChevronField } from '../design/art';
import { Icon, Arrow, type IconName } from '../design/icons';
import { PlanCard } from '../design/plans';
import {
  PLANS, FEATURES, MARKETS, MARKET_META, staticCatalog, fetchCatalog, guessMarket, rememberMarket, vatLabel, bestSavingsPercent, seatsOf,
  type Market, type Audience, type Interval, type Catalog,
} from '../data/pricing';

/**
 * Pricing. Three audiences, two billing intervals, four markets. Prices come
 * from the API catalog when it answers and from data/pricing.ts until then,
 * so the page is never empty and never shows a spinner where a number goes.
 */

const AUDIENCES: Audience[] = ['CANDIDATE', 'RECRUITER', 'COMPANY'];

export default function PricingPage() {
  const t = useSiteText();
  const lang = useLang();
  const p = t.pricing;
  usePageMeta('/pricing');

  const [params, setParams] = useSearchParams();
  const paramMarket = (params.get('market') || '').toUpperCase() as Market;
  // The guess needs the browser (saved choice, time zone): pre-rendered pages show INTL first.
  const guessed = useClientValue<Market>(guessMarket, 'INTL');
  const [picked, setMarket] = useState<Market | null>(MARKETS.includes(paramMarket) ? paramMarket : null);
  const market = picked ?? guessed;
  const paramAud = (params.get('for') || '').toLowerCase();
  const [audience, setAudience] = useState<Audience>(paramAud === 'companies' ? 'COMPANY' : paramAud === 'recruiters' ? 'RECRUITER' : paramAud === 'seekers' ? 'CANDIDATE' : 'COMPANY');
  const [interval, setInterval] = useState<Interval>('YEAR');
  const [cat, setCat] = useState<Catalog>(() => staticCatalog(market));

  useEffect(() => {
    if (picked) rememberMarket(picked);
    setCat(staticCatalog(market));
    const ctrl = new AbortController();
    fetchCatalog(market, ctrl.signal).then((c) => { if (!ctrl.signal.aborted) setCat(c); }).catch(() => { /* list prices stay */ });
    return () => ctrl.abort();
  }, [market, picked]);

  const pick = (m: Market) => {
    setMarket(m);
    const next = new URLSearchParams(params);
    next.set('market', m);
    setParams(next, { replace: true });
  };

  const plans = useMemo(() => PLANS.filter((x) => x.audience === audience), [audience]);
  // Quote-only plans (Enterprise) sit full width under the priced ones.
  const priced = plans.filter((x) => x.monthly !== undefined);
  const quoted = plans.filter((x) => x.monthly === undefined);
  const features = useMemo(() => FEATURES.filter((f) => f.audience === (audience === 'CANDIDATE' ? 'CANDIDATE' : 'COMPANY')), [audience]);
  const tamara = cat.tamaraAvailable && interval === 'YEAR';
  // "Save up to N%" from the real prices of the plans on this tab; no tag when nothing is saved.
  const bestSaving = bestSavingsPercent(cat, priced.map((x) => x.id));
  const companySeats = PLANS.filter((x) => x.audience === 'COMPANY' && x.monthly).map((x) => seatsOf(cat, x)).filter((n): n is number => typeof n === 'number' && n > 1);

  const audLabel: Record<Audience, string> = { CANDIDATE: p.audience.seekers, RECRUITER: p.audience.recruiters, COMPANY: p.audience.companies };
  const audIcon: Record<Audience, IconName> = { CANDIDATE: 'profile', RECRUITER: 'jobs', COMPANY: 'building' };

  return (
    <Shell>
      <section className="ns-hero" style={{ paddingBottom: 24 }}>
        <div className="ns-glow" />
        <div className="ns-field"><ChevronField opacity={0.045} /></div>
        <div className="ns-container ns-hero-grid" style={{ position: 'relative', alignItems: 'center' }}>
          <div className="ns-hero-copy">
            <Eyebrow>{p.hero.eyebrow}</Eyebrow>
            <Lines lines={p.hero.title} as="h1" className="ns-h1" />
            <p className="ns-lede">{p.hero.body}</p>
          </div>
          <div style={{ maxWidth: 460, justifySelf: 'end', width: '100%' }}><BillingScene /></div>
        </div>
      </section>

      {/* controls */}
      <Section tight>
        <div style={{ display: 'grid', gap: 18 }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, alignItems: 'center', justifyContent: 'space-between' }}>
            <div className="ns-seg" role="tablist" aria-label={lang === 'ar' ? 'الفئة' : 'Audience'}>
              {AUDIENCES.map((a) => (
                <button key={a} type="button" role="tab" aria-selected={audience === a} onClick={() => setAudience(a)}>
                  <Icon name={audIcon[a]} size={16} />{audLabel[a]}
                </button>
              ))}
            </div>
            <div className="ns-seg" role="group" aria-label={lang === 'ar' ? 'فترة الاشتراك' : 'Billing interval'}>
              <button type="button" aria-pressed={interval === 'MONTH'} onClick={() => setInterval('MONTH')}>{p.interval.month}</button>
              <button type="button" aria-pressed={interval === 'YEAR'} onClick={() => setInterval('YEAR')}>{p.interval.year}{bestSaving > 0 && <span className="ns-tag ns-tag--ok" data-testid="save-up-to">{p.interval.saveUpTo(bestSaving)}</span>}</button>
            </div>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center' }}>
            <span className="ns-body" style={{ fontSize: 13, marginInlineEnd: 4 }}><Icon name="globe" size={15} style={{ verticalAlign: -3, marginInlineEnd: 6 }} />{p.market.label}</span>
            {MARKETS.map((m) => (
              <button key={m} type="button" className="ns-market-pill" aria-pressed={market === m} onClick={() => pick(m)}>
                {p.market[m]} <span className="ns-mono" style={{ fontSize: 11 }}>{MARKET_META[m].currency}</span>
              </button>
            ))}
            <span className="ns-body" style={{ fontSize: 13, marginInlineStart: 'auto' }}>
              {market === 'INTL' ? p.market.noVat : p.market.vatNote(vatLabel(market))}
              {!cat.live && <span> · {p.offline}</span>}
            </span>
          </div>
        </div>
      </Section>

      {/* recruiter or company: the difference is users */}
      {audience !== 'CANDIDATE' && (
        <Section tight>
          <div style={{ display: 'grid', gap: 14 }} data-testid="recruiter-or-company">
            <div>
              <h2 className="ns-h3" style={{ fontSize: 22, marginBottom: 4 }}>{p.who.title}</h2>
              <p className="ns-body" style={{ fontSize: 14 }}>{p.who.body}</p>
            </div>
            <div className="ns-who">
              {(['RECRUITER', 'COMPANY'] as Audience[]).map((a) => {
                const w = a === 'RECRUITER' ? p.who.recruiter : p.who.company;
                const users = a === 'RECRUITER' ? p.who.recruiter.users : p.who.company.users(Math.min(...companySeats), Math.max(...companySeats));
                return (
                  <div key={a} className="ns-card ns-who-card" data-active={audience === a ? 'true' : undefined}>
                    <div className="ns-who-head">
                      <span className={`ns-icon-tile${a === 'COMPANY' ? ' ns-icon-tile--cyan' : ''}`}><Icon name={a === 'RECRUITER' ? 'user' : 'team'} /></span>
                      <b>{w.title}</b>
                      <span className={`ns-tag${a === 'COMPANY' ? ' ns-tag--brand' : ''}`}>{w.tag}</span>
                    </div>
                    <div className="ns-who-users">{users}</div>
                    <ul className="ns-list">{w.points.map((x) => <li key={x} style={{ fontSize: 14 }}><Icon name="check" size={15} weight={2.2} />{x}</li>)}</ul>
                    {audience !== a && <button type="button" className="ns-btn ns-btn--secondary ns-btn--sm" onClick={() => setAudience(a)}>{w.see}<Arrow size={15} /></button>}
                  </div>
                );
              })}
            </div>
            <Note icon="shield">{p.who.note}</Note>
          </div>
        </Section>
      )}

      {/* cards */}
      <Section tight>
        <div className={`ns-pricing-grid${priced.length > 3 ? ' ns-pricing-grid--4' : ''}`}>
          {priced.map((plan) => <PlanCard key={plan.id} plan={plan} cat={cat} interval={interval} />)}
        </div>
        {quoted.map((plan) => (
          <div key={plan.id} style={{ marginTop: 18 }}><PlanCard plan={plan} cat={cat} interval={interval} wide /></div>
        ))}
        {tamara && (
          <div className="ns-card ns-card--accent" style={{ marginTop: 22, display: 'flex', gap: 16, alignItems: 'center', flexWrap: 'wrap' }}>
            <span className="ns-icon-tile ns-icon-tile--grad ns-icon-tile--lg" style={{ ['--icAccent' as string]: 'rgba(255,255,255,.75)' }}><Icon name="instalments" size={26} /></span>
            <div style={{ flex: 1, minWidth: 240 }}>
              <b style={{ fontFamily: 'var(--fontDisplay)', color: 'var(--ink)', display: 'block', marginBottom: 4 }}>{p.tamara.title}</b>
              <span className="ns-body" style={{ fontSize: 14 }}>{p.tamara.body}</span>
            </div>
            <span className="ns-tag ns-tag--cyan">{p.tamara.badge}</span>
          </div>
        )}
      </Section>

      {/* ways to pay */}
      <Section tight tone="band">
        <div className="ns-split" style={{ alignItems: 'start' }}>
          <div style={{ display: 'grid', gap: 12 }}>
            <h2 className="ns-h3" style={{ fontSize: 22 }}>{p.pay.title}</h2>
            <p className="ns-body">{p.pay.body}</p>
          </div>
          <div className="ns-paylogos">
            <PayPill icon="card" label={p.pay.card} />
            {market === 'EG' && <PayPill icon="bell" label={p.pay.wallet} />}
            {(market === 'SA' || market === 'AE') && <PayPill icon="instalments" label={p.pay.tamara} />}
            <PayPill icon="lock" label={p.pay.applePay} />
            <PayPill icon="invoice" label={p.pay.invoice} />
          </div>
        </div>
      </Section>

      {/* add-ons */}
      {audience !== 'CANDIDATE' && (
        <Section>
          <SectionHead copy={{ eyebrow: p.addons.eyebrow, title: [p.addons.title], body: p.addons.body }} />
          <div className="ns-grid ns-grid-4">
            {p.addons.items.map((a, i) => (
              <div key={a.name} className="ns-card ns-card--lift" style={{ display: 'grid', gap: 10, alignContent: 'start' }}>
                <span className={`ns-icon-tile ${['', 'ns-icon-tile--cyan', 'ns-icon-tile--violet', ''][i]}`}><Icon name={(['star', 'seat', 'spark', 'building'] as IconName[])[i]} /></span>
                <b style={{ fontFamily: 'var(--fontDisplay)', color: 'var(--ink)' }}>{a.name}</b>
                <span className="ns-body" style={{ fontSize: 14 }}>{a.body}</span>
              </div>
            ))}
          </div>
        </Section>
      )}

      {/* comparison */}
      <Section tone={audience === 'CANDIDATE' ? undefined : 'band'}>
        <SectionHead copy={{ title: [p.compare.title] }} />
        <div className="ns-table-wrap">
          <table className="ns-table">
            <thead>
              <tr>
                <th>{p.compare.feature}</th>
                {plans.map((x) => <th key={x.id}>{x.name[lang]}</th>)}
              </tr>
            </thead>
            <tbody>
              {features.map((f) => (
                <tr key={f.id}>
                  <td style={{ color: 'var(--ink)' }}>{f.label[lang]}</td>
                  {plans.map((x) => <td key={x.id}><Cell v={x.matrix[f.id]} yes={p.compare.yes} no={p.compare.no} unlimited={p.compare.unlimited} lang={lang} /></td>)}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>

      {/* FAQ */}
      <Section>
        <SectionHead copy={{ title: [p.faq.title] }} center />
        <div className="ns-faq">
          {p.faq.items.map((q) => (
            <details key={q.q}>
              <summary>{q.q}<Icon name="plus" size={18} /></summary>
              <p>{q.a}</p>
            </details>
          ))}
        </div>
        <div style={{ textAlign: 'center', marginTop: 36, display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
          <a href={links.sales} className="ns-btn ns-btn--secondary">{p.contactSales}<Arrow /></a>
        </div>
      </Section>
    </Shell>
  );
}

function PayPill({ icon, label }: { icon: IconName; label: string }) {
  return <span className="ns-paylogo"><Icon name={icon} size={16} />{label}</span>;
}

function Cell({ v, yes, no, unlimited, lang }: { v: number | boolean | null | string | undefined; yes: string; no: string; unlimited: string; lang: 'ar' | 'en' }) {
  if (v === undefined) return <span style={{ color: 'var(--ink3)' }}>{no}</span>;
  if (v === null) return <span style={{ color: 'var(--ink)', fontWeight: 600 }}>{unlimited}</span>;
  if (typeof v === 'boolean') return v ? <Icon name="check" size={18} weight={2.2} style={{ color: 'var(--ok)' }} /> : <span style={{ color: 'var(--ink3)' }}>{no}</span>;
  if (typeof v === 'number') return <span className="ns-num" style={{ color: 'var(--ink)' }}>{v.toLocaleString(lang === 'ar' ? 'ar-EG-u-nu-latn' : 'en')}</span>;
  if (v === 'limited') return <span style={{ color: 'var(--ink2)' }}>{lang === 'ar' ? 'محدود' : 'Limited'}</span>;
  if (v === 'full') return <span style={{ color: 'var(--ink)' }}>{yes}</span>;
  return <span>{String(v)}</span>;
}
