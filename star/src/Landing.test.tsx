import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, act, within } from '@testing-library/react';
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom';
import Landing from './Landing';
import { APP_ORIGIN } from './auth';
import { setLang } from './i18n/lang';
import { LegacyRedirect, FEATURE_REDIRECTS, SOLUTION_REDIRECTS } from './legacyRoutes';

/**
 * The home page: the owner's copy in both languages, links into the pre-auth
 * flow, and no prices invented on the page (they come from data/pricing).
 */
const renderHome = () =>
  render(
    <MemoryRouter initialEntries={['/']}>
      <Landing />
    </MemoryRouter>,
  );

describe('home page', () => {
  beforeEach(() => {
    act(() => setLang('en'));
  });

  it('shows the English hero, nav and both entry points', () => {
    renderHome();
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Show what you can do.Find the right fit.Take your next step.');
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
    fireEvent.click(screen.getByRole('button', { name: 'التبديل إلى العربية' }));
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('أظهر قدراتك.');
    expect(document.documentElement.getAttribute('lang')).toBe('ar');
  });

  it('teases four plans with the approved list prices and links to the full pricing page', () => {
    localStorage.setItem('nagm_market', 'INTL');
    renderHome();
    const plans = screen.getByRole('link', { name: /Compare all plans and prices/ });
    expect(plans).toHaveAttribute('href', '/pricing');
    const growth = screen.getByRole('article', { name: 'Growth' });
    expect(within(growth).getByText('$120')).toBeInTheDocument();
    const pro = screen.getByRole('article', { name: 'Pro' });
    expect(within(pro).getByText('$5')).toBeInTheDocument();
    expect(within(screen.getByRole('article', { name: 'Enterprise' })).getByRole('link', { name: /Contact sales/ })).toHaveAttribute('href', 'mailto:sales@nagm.io');
  });

  it('opens the Products menu with links to page sections', () => {
    renderHome();
    const trigger = screen.getByRole('button', { name: 'Products' });
    fireEvent.click(trigger);
    expect(trigger).toHaveAttribute('aria-expanded', 'true');
    const panel = screen.getByRole('region', { name: 'Products' });
    expect(within(panel).getByRole('link', { name: /ATS check/ })).toHaveAttribute('href', '/job-seekers#match');
    expect(within(panel).getByRole('link', { name: /Team collaboration/ })).toHaveAttribute('href', '/companies#team');
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
    // No live yearly price: falls back to the approved list (449 × 12 × 0.8).
    expect(priceOf(cat, 'COMPANY_GROWTH', 'YEAR')).toBe(431000);
    spy.mockRestore();
  });
});
