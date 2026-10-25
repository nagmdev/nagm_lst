import { Suspense, useEffect, type ComponentType } from 'react';
import { Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { APP_ORIGIN } from './auth';
import { LegacyRedirect, FEATURE_REDIRECTS, SOLUTION_REDIRECTS } from './legacyRoutes';
import { getLang, pageFromPath, readSaved, setLang, useLang } from './i18n/lang';

/** The site's pages. The browser loads them lazily; the pre-renderer imports them directly. */
export interface SitePages {
  Landing: ComponentType;
  JobSeekersPage: ComponentType;
  CompaniesPage: ComponentType;
  PricingPage: ComponentType;
  AboutPage: ComponentType;
  LegalPage: ComponentType<{ doc: 'terms' | 'privacy' }>;
  NotFoundPage: ComponentType;
  AuthPage: ComponentType;
  Verify: ComponentType;
}

const PageFallback = () => (
  <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)', color: 'var(--ink2)' }}>
    <div style={{ width: 28, height: 28, border: '3px solid var(--line)', borderTopColor: 'var(--brand)', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
  </div>
);

/** An alias that keeps the query (`?role=…&plan=…&returnTo=…`), which a plain <Navigate> drops. */
function KeepQuery({ to }: { to: string }) {
  const { search } = useLocation();
  return <Navigate to={`${to}${search}`} replace />;
}

function RedirectToApp() {
  const location = useLocation();
  useEffect(() => {
    window.location.href = `${APP_ORIGIN}${location.pathname}${location.search}${location.hash}`;
  }, [location]);
  return null;
}

/**
 * A page's address decides its language (/pricing is Arabic, /en/pricing
 * English) and that becomes the saved choice. Someone who chose English and
 * comes back to the bare home page is taken to the English one.
 */
function LangFromUrl() {
  const { pathname, search, hash } = useLocation();
  const navigate = useNavigate();
  useEffect(() => {
    if (pathname === '/' && readSaved() === 'en') navigate(`/en${search}${hash}`, { replace: true });
    // Only on arrival: after that the visitor's own switch decides.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  useEffect(() => {
    const page = pageFromPath(pathname);
    if (page && page.lang !== getLang()) setLang(page.lang);
  }, [pathname]);
  return null;
}

export default function AppRoutes({ pages: P }: { pages: SitePages }) {
  const lang = useLang();
  const site = (prefix: '' | '/en') => [
    <Route key={`${prefix}/`} path={prefix || '/'} element={<P.Landing />} />,
    <Route key={`${prefix}/job-seekers`} path={`${prefix}/job-seekers`} element={<P.JobSeekersPage />} />,
    <Route key={`${prefix}/companies`} path={`${prefix}/companies`} element={<P.CompaniesPage />} />,
    <Route key={`${prefix}/pricing`} path={`${prefix}/pricing`} element={<P.PricingPage />} />,
    <Route key={`${prefix}/about`} path={`${prefix}/about`} element={<P.AboutPage />} />,
    <Route key={`${prefix}/terms`} path={`${prefix}/terms`} element={<P.LegalPage doc="terms" />} />,
    <Route key={`${prefix}/privacy`} path={`${prefix}/privacy`} element={<P.LegalPage doc="privacy" />} />,
  ];
  return (
    <>
      <LangFromUrl />
      <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:p-2 focus:bg-white focus:text-black">
        {lang === 'ar' ? 'انتقل إلى المحتوى' : 'Skip to main content'}
      </a>
      <Suspense fallback={<PageFallback />}>
        <Routes>
          {site('')}
          {site('/en')}

          {/* Retired pages. In production vercel.json answers these with a 301 before the app loads. */}
          <Route path="/features/:slug" element={<LegacyRedirect table={FEATURE_REDIRECTS} fallback="/" />} />
          <Route path="/features" element={<Navigate to="/" replace />} />
          <Route path="/solutions/:slug" element={<LegacyRedirect table={SOLUTION_REDIRECTS} fallback="/companies" />} />
          <Route path="/solutions" element={<Navigate to="/companies" replace />} />
          <Route path="/why-nagm" element={<Navigate to="/#why" replace />} />
          <Route path="/plans" element={<Navigate to="/pricing" replace />} />

          {/* Job, recruiter and shared application links live on app.nagm.io (vercel.json redirects them too). */}
          <Route path="/jobs" element={<RedirectToApp />} />
          <Route path="/jobs/*" element={<RedirectToApp />} />
          <Route path="/recruiters/:id" element={<RedirectToApp />} />
          <Route path="/recruiters/*" element={<RedirectToApp />} />
          <Route path="/resume-builder" element={<RedirectToApp />} />
          <Route path="/ats" element={<RedirectToApp />} />
          <Route path="/ats/*" element={<RedirectToApp />} />
          <Route path="/practice" element={<RedirectToApp />} />
          <Route path="/practice/*" element={<RedirectToApp />} />
          <Route path="/p/:token" element={<RedirectToApp />} />
          <Route path="/invite/:token" element={<RedirectToApp />} />
          <Route path="/co/:key" element={<RedirectToApp />} />

          {/* Sign-in and sign-up */}
          <Route path="/login" element={<P.AuthPage />} />
          <Route path="/register" element={<P.AuthPage />} />
          <Route path="/signup" element={<KeepQuery to="/register" />} />
          <Route path="/sign-up" element={<KeepQuery to="/register" />} />
          <Route path="/signin" element={<KeepQuery to="/login" />} />
          <Route path="/sign-in" element={<KeepQuery to="/login" />} />
          <Route path="/register/company" element={<P.AuthPage />} />
          <Route path="/verify" element={<P.Verify />} />
          <Route path="*" element={<P.NotFoundPage />} />
        </Routes>
      </Suspense>
    </>
  );
}
