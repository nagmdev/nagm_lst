import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, act, within, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom';
import Landing from './Landing';
import { APP_ORIGIN } from './auth';
import { setLang } from './i18n/lang';
import { LegacyRedirect, FEATURE_REDIRECTS, SOLUTION_REDIRECTS } from './legacyRoutes';

/**
 * The home page: the owner's copy in both languages, links into the pre-auth
 * flow, and no prices invented on the page (they come from data/pricing).
 */
// English lives at /en; every link on an English page stays in English.
const Where = () => <div data-testid="where">{useLocation().pathname}</div>;
const renderHome = () =>
  render(
    <MemoryRouter initialEntries={['/en']}>
      <Landing />
      <Where />
    </MemoryRouter>,
  );

describe('home page', () => {
  beforeEach(() => {
    act(() => setLang('en'));
  });

  it('shows the English hero, nav and both entry points', () => {
    renderHome();
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Show what you can do. Find the right fit. Take your next step.');
    expect(screen.getByRole('button', { name: 'Products' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Solutions' })).toBeInTheDocument();
    const jobs = screen.getAllByRole('link', { name: /^Jobs$/ });
    expect(jobs[0]).toHaveAttribute('href', `${APP_ORIGIN}/jobs`);
    expect(screen.getByRole('link', { name: /Start your career journey/ })).toHaveAttribute('href', '/register?role=candidate');
    expect(screen.getByRole('link', { name: 'Hire with Nagm' })).toHaveAttribute('href', '/register?role=company');
  });

  it('shows the Arabic copy and flips the document to RTL', () => {
    act(() => setLang('ar'));
    renderHome();
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('أظهر قدراتك.');
    expect(screen.getByText('كل ما تحتاجه لتتقدّم.')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'المنتجات' })).toBeInTheDocument();
    expect(document.documentElement.getAttribute('dir')).toBe('rtl');
  });

  it('switches language from the nav', () => {
    renderHome();
    // The name starts with the visible text, so "click عربي" works for voice control.
    fireEvent.click(screen.getByRole('button', { name: 'عربي — التبديل إلى العربية' }));
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('أظهر قدراتك.');
    expect(document.documentElement.getAttribute('lang')).toBe('ar');
    // …and to the Arabic address of the same page.
    expect(screen.getByTestId('where')).toHaveTextContent(/^\/$/);
  });

  it('teases four plans with the approved list prices and links to the full pricing page', () => {
    localStorage.setItem('nagm_market', 'INTL');
    renderHome();
    const plans = screen.getByRole('link', { name: /Compare all plans and prices/ });
    expect(plans).toHaveAttribute('href', '/en/pricing');
    const growth = screen.getByRole('article', { name: 'Growth' });
    expect(within(growth).getByText('$120')).toBeInTheDocument();
    const pro = screen.getByRole('article', { name: 'Pro' });
    expect(within(pro).getByText('$5')).toBeInTheDocument();
    expect(within(screen.getByRole('article', { name: 'Enterprise' })).getByRole('link', { name: /Contact sales/ })).toHaveAttribute('href', 'mailto:sales@nagm.io');
  });

  it('keeps crawlers off sign-up and sign-in links, and on the pages worth indexing', () => {
    renderHome();
    for (const a of screen.getAllByRole('link')) {
      const href = a.getAttribute('href') ?? '';
      if (/^\/(register|login)/.test(href) || (href.startsWith('/') && href.includes('?'))) expect(a.getAttribute('rel'), href).toContain('nofollow');
      if (/^\/en(\/(pricing|about|companies|job-seekers))?$/.test(href)) expect(a.getAttribute('rel') ?? '', href).not.toContain('nofollow');
    }
    expect(screen.getAllByRole('link').some((a) => a.getAttribute('href')?.startsWith('/register'))).toBe(true);
  });

  it("links Nagm's four social accounts from the footer, in a new tab", () => {
    renderHome();
    const social = within(screen.getByRole('contentinfo')).getByRole('list', { name: 'Nagm on social media' });
    const links = within(social).getAllByRole('link');
    expect(links.map((a) => [a.getAttribute('aria-label'), a.getAttribute('href')])).toEqual([
      ['Nagm on Facebook', 'https://www.facebook.com/nagmio2025'],
      ['Nagm on Instagram', 'https://www.instagram.com/nagm._2025'],
      ['Nagm on YouTube', 'https://www.youtube.com/@Nagm-io'],
      ['Nagm on X', 'https://x.com/Nagm_2025'],
    ]);
    for (const a of links) {
      expect(a).toHaveAttribute('target', '_blank');
      expect(a.getAttribute('rel')).toContain('noopener');
    }
  });

  it('opens the Products menu with links to page sections', () => {
    renderHome();
    const trigger = screen.getByRole('button', { name: 'Products' });
    fireEvent.click(trigger);
    expect(trigger).toHaveAttribute('aria-expanded', 'true');
    const panel = screen.getByRole('region', { name: 'Products' });
    expect(within(panel).getByRole('link', { name: /ATS check/ })).toHaveAttribute('href', '/en/job-seekers#match');
    expect(within(panel).getByRole('link', { name: /Team collaboration/ })).toHaveAttribute('href', '/en/companies#team');
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(screen.queryByRole('region', { name: 'Products' })).not.toBeInTheDocument();
  });
});

describe('retired pages', () => {
  const Where = () => {
    const l = useLocation();
    return <div data-testid="at">{l.pathname + l.search + l.hash}</div>;
  };
  const visit = (path: string) =>
    render(
      <MemoryRouter initialEntries={[path]}>
        <Routes>
          <Route path="/features/:slug" element={<LegacyRedirect table={FEATURE_REDIRECTS} fallback="/" />} />
          <Route path="/solutions/:slug" element={<LegacyRedirect table={SOLUTION_REDIRECTS} fallback="/companies" />} />
          <Route path="*" element={<Where />} />
        </Routes>
      </MemoryRouter>,
    );

  it.each([
    ['/features/ats-analysis', '/job-seekers#match'],
    ['/features/talent-pool', '/companies#base'],
    ['/features/something-unknown', '/'],
    ['/solutions/recruiters', '/companies'],
    ['/solutions/enterprise', '/pricing?for=companies'],
    ['/solutions/retail', '/companies'],
  ])('%s lands on %s', (from, to) => {
    visit(from);
    expect(screen.getByTestId('at')).toHaveTextContent(to);
  });
});

describe('live catalog', () => {
  it('reads the API price shape ({ MONTH, YEAR }) and prefers it over the list prices', async () => {
    const { api } = await import('./auth');
    const { fetchCatalog, priceOf } = await import('./data/pricing');
    const spy = vi.spyOn(api, 'get').mockResolvedValue({
      data: {
        market: 'SA', currency: 'SAR', vatBps: 1500, tamaraAvailable: true, providers: ['paymob', 'tamara'],
        plans: [{ id: 'COMPANY_GROWTH', audience: 'COMPANY', prices: { MONTH: { interval: 'MONTH', currency: 'SAR', amountMinor: 46900 }, YEAR: null } }],
      },
    } as never);
    const cat = await fetchCatalog('SA');
    expect(cat.live).toBe(true);
    expect(priceOf(cat, 'COMPANY_GROWTH', 'MONTH')).toBe(46900);
    // No live yearly price: not sold yearly. Never a yearly price computed from
    // the OLD list monthly next to a new live monthly price.
    expect(priceOf(cat, 'COMPANY_GROWTH', 'YEAR')).toBeUndefined();
    spy.mockRestore();
  });

  it('savings come from the two real prices, and vanish when yearly is not cheaper', async () => {
    const { yearlySavings, deriveYearlyMinor, savingsOf, staticCatalog } = await import('./data/pricing');
    expect(yearlySavings(5000, 65000)).toBeNull(); // monthly 50, stale yearly 650
    expect(yearlySavings(5000, 60000)).toBeNull();
    expect(yearlySavings(5000, 50000)).toEqual({ percent: 17, amountMinor: 10000, monthsFree: 2 });
    expect(yearlySavings(24900, 239000)).toEqual({ percent: 20, amountMinor: 59800, monthsFree: null });
    expect(deriveYearlyMinor(5000, 1667)).toBe(50000);
    expect(deriveYearlyMinor(24900)).toBe(239000);
    expect(savingsOf(staticCatalog('EG'), 'CANDIDATE_PRO')?.percent).toBe(20);
  });
});

describe('pricing page', () => {
  const liveCatalog = (over: Record<string, unknown> = {}) => ({
    market: 'EG', currency: 'EGP', vatBps: 1400, tamaraAvailable: false, providers: ['paymob'],
    plans: [
      { id: 'COMPANY_STARTER', audience: 'COMPANY', entitlements: { seats: 2 }, prices: { MONTH: { currency: 'EGP', amountMinor: 245000 }, YEAR: { currency: 'EGP', amountMinor: 2352000 } }, promotions: [] },
      { id: 'COMPANY_GROWTH', audience: 'COMPANY', entitlements: { seats: 5 }, prices: { MONTH: { currency: 'EGP', amountMinor: 5000 }, YEAR: { currency: 'EGP', amountMinor: 65000 } },
        promotions: [{ id: 'p1', kind: 'PERCENT', value: 50, label: null, labelAr: null, intervals: ['MONTH'], endsAt: null, maxRedemptions: 50, remaining: 38, prices: { MONTH: { listMinor: 5000, totalMinor: 2500, discountMinor: 2500 } } }] },
      { id: 'COMPANY_BUSINESS', audience: 'COMPANY', entitlements: { seats: 15 }, prices: { MONTH: { currency: 'EGP', amountMinor: 1490000 }, YEAR: { currency: 'EGP', amountMinor: 14900000 } }, promotions: [] },
      { id: 'RECRUITER_PRO', audience: 'RECRUITER', entitlements: { seats: 1 }, prices: { MONTH: { currency: 'EGP', amountMinor: 145000 }, YEAR: { currency: 'EGP', amountMinor: 1392000 } }, promotions: [] },
    ],
    ...over,
  });

  const renderPricing = async (path: string, data = liveCatalog()) => {
    const { api } = await import('./auth');
    const spy = vi.spyOn(api, 'get').mockResolvedValue({ data } as never);
    const { default: PricingPage } = await import('./pages/PricingPage');
    render(<MemoryRouter initialEntries={[path]}><PricingPage /></MemoryRouter>);
    await waitFor(() => expect(spy).toHaveBeenCalled());
    return spy;
  };

  it('company cards lead with users, show the live promotion, and the comparison starts with Users', async () => {
    localStorage.setItem('nagm_lang', 'en');
    await renderPricing('/pricing?for=companies&market=EG');
    fireEvent.click(screen.getByRole('button', { name: 'Monthly' }));
    const growth = await screen.findByRole('article', { name: 'Growth' });
    expect(within(growth).getByTestId('plan-users')).toHaveTextContent(/5 users.*hiring team/);
    await waitFor(() => expect(within(growth).getByTestId('plan-promo')).toHaveTextContent('50% off'));
    expect(within(growth).getByTestId('plan-was')).toHaveTextContent(/EGP 50/);
    expect(within(growth).getByTestId('plan-price')).toHaveTextContent(/25/);
    expect(within(growth).getByTestId('plan-left')).toHaveTextContent('38 of 50 left');
    expect(within(screen.getByRole('article', { name: 'Starter' })).queryByTestId('plan-promo')).not.toBeInTheDocument();
    const firstRow = screen.getAllByRole('row')[1];
    expect(firstRow).toHaveTextContent(/^Users \(seats\)/);
    expect(screen.getByTestId('recruiter-or-company')).toHaveTextContent(/companies cannot subscribe to them/);
  });

  it('yearly: a saving only where the real yearly price is cheaper; "save up to" is the best real one', async () => {
    localStorage.setItem('nagm_lang', 'en');
    await renderPricing('/pricing?for=companies&market=EG');
    await waitFor(() => expect(screen.getByTestId('save-up-to')).toHaveTextContent('Save up to 20%'));
    // Yearly is the default tab.
    const starter = await screen.findByRole('article', { name: 'Starter' });
    expect(within(starter).getByTestId('plan-saving')).toHaveTextContent(/Save 20%/);
    await waitFor(() => expect(within(screen.getByRole('article', { name: 'Growth' })).queryByTestId('plan-saving')).not.toBeInTheDocument());
    expect(within(screen.getByRole('article', { name: 'Business' })).getByTestId('plan-saving')).toHaveTextContent(/2 months free/);
  });

  it('a recruiter card says 1 user — for an independent recruiter', async () => {
    localStorage.setItem('nagm_lang', 'en');
    await renderPricing('/pricing?for=recruiters&market=EG');
    const pro = await screen.findByRole('article', { name: 'Pro' });
    expect(within(pro).getByTestId('plan-users')).toHaveTextContent(/1 user.*independent recruiter/);
  });

  it('opens on the audience the menu link names (#recruiters), without a query string', async () => {
    localStorage.setItem('nagm_lang', 'en');
    await renderPricing('/pricing?market=EG#recruiters');
    expect(await screen.findByRole('tab', { name: /recruiter/i, selected: true })).toBeInTheDocument();
  });
});
