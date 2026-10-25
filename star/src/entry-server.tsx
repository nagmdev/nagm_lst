import { StrictMode } from 'react';
import { renderToString } from 'react-dom/server';
import { StaticRouter } from 'react-router-dom';
import AppRoutes, { type SitePages } from './AppRoutes';
import { setRenderLang, type Lang } from './i18n/lang';
import Landing from './Landing';
import JobSeekersPage from './pages/JobSeekersPage';
import CompaniesPage from './pages/CompaniesPage';
import PricingPage from './pages/PricingPage';
import AboutPage from './pages/AboutPage';
import LegalPage from './pages/LegalPage';
import NotFoundPage from './pages/NotFoundPage';

/**
 * Build-time rendering of the marketing pages (scripts/prerender.mjs), so a
 * crawler or link preview gets the whole page without running JavaScript.
 * The browser then hydrates the same tree.
 */
const Never = () => null;
const pages: SitePages = {
  Landing, JobSeekersPage, CompaniesPage, PricingPage, AboutPage, LegalPage, NotFoundPage,
  // Sign-in pages are never pre-rendered.
  AuthPage: Never, Verify: Never,
};

export function render(url: string, lang: Lang): string {
  setRenderLang(lang);
  return renderToString(
    <StrictMode>
      <StaticRouter location={url}>
        <AppRoutes pages={pages} />
      </StaticRouter>
    </StrictMode>,
  );
}

export { headHtml, ALL_PAGES, pageUrl, SITE_URL } from './seo/site';
export { pagePath } from './i18n/lang';
