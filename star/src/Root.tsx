import { useEffect, lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Landing from './Landing';
import { APP_ORIGIN } from './auth';
import { LegacyRedirect, FEATURE_REDIRECTS, SOLUTION_REDIRECTS } from './legacyRoutes';

const AuthPage = lazy(() => import('./pages/AuthPage'));
const Verify = lazy(() => import('./pages/Verify'));
const AboutPage = lazy(() => import('./pages/AboutPage'));
const JobSeekersPage = lazy(() => import('./pages/JobSeekersPage'));
const CompaniesPage = lazy(() => import('./pages/CompaniesPage'));
const PricingPage = lazy(() => import('./pages/PricingPage'));
const LegalPage = lazy(() => import('./pages/LegalPage'));

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

// nagm.io: marketing site + the pre-auth flow (login / register / verify).
// After a successful sign-in these hand the session off to app.nagm.io.
export default function Root() {
  return (
    <BrowserRouter>
      <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:p-2 focus:bg-white focus:text-black">Skip to main content</a>
      <Suspense fallback={<PageFallback />}>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/job-seekers" element={<JobSeekersPage />} />
          <Route path="/companies" element={<CompaniesPage />} />
          <Route path="/pricing" element={<PricingPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/terms" element={<LegalPage doc="terms" />} />
          <Route path="/privacy" element={<LegalPage doc="privacy" />} />

          {/* Retired pages */}
          <Route path="/features/:slug" element={<LegacyRedirect table={FEATURE_REDIRECTS} fallback="/" />} />
          <Route path="/features" element={<Navigate to="/" replace />} />
          <Route path="/solutions/:slug" element={<LegacyRedirect table={SOLUTION_REDIRECTS} fallback="/companies" />} />
          <Route path="/solutions" element={<Navigate to="/companies" replace />} />
          <Route path="/why-nagm" element={<Navigate to="/#why" replace />} />
          <Route path="/plans" element={<Navigate to="/pricing" replace />} />

          {/* Redirect all job, recruiter, and shared application links directly to app.nagm.io */}
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

          {/* Auth Routes */}
          <Route path="/login" element={<AuthPage />} />
          <Route path="/register" element={<AuthPage />} />
          {/* Aliases */}
          <Route path="/signup" element={<KeepQuery to="/register" />} />
          <Route path="/sign-up" element={<KeepQuery to="/register" />} />
          <Route path="/signin" element={<KeepQuery to="/login" />} />
          <Route path="/sign-in" element={<KeepQuery to="/login" />} />
          {/* Deep link straight to company form */}
          <Route path="/register/company" element={<AuthPage />} />
          <Route path="/verify" element={<Verify />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}
