import { useEffect, lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Landing from './Landing';
import { APP_ORIGIN } from './auth';

const AuthPage = lazy(() => import('./pages/AuthPage'));
const Verify = lazy(() => import('./pages/Verify'));
const AboutPage = lazy(() => import('./pages/AboutPage'));
const FeatureDetail = lazy(() => import('./pages/FeatureDetail'));
const SolutionsPage = lazy(() => import('./pages/SolutionsPage'));
const WhyNagmPage = lazy(() => import('./pages/WhyNagmPage'));

const PageFallback = () => (
  <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)', color: 'var(--ink2)' }}>
    <div style={{ width: 28, height: 28, border: '3px solid var(--line)', borderTopColor: 'var(--brand)', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
  </div>
);

function RedirectToApp() {
  const location = useLocation();
  useEffect(() => {
    window.location.href = `${APP_ORIGIN}${location.pathname}${location.search}${location.hash}`;
  }, [location]);
  return null;
}

// nagm.io: marketing landing + the pre-auth flow (login / register / verify).
// After a successful sign-in these hand the session off to app.nagm.io.
export default function Root() {
  return (
    <BrowserRouter>
      <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:p-2 focus:bg-white focus:text-black">Skip to main content</a>
      <Suspense fallback={<PageFallback />}>
        <Routes>
          <Route path="/" element={<Landing />} />
          
          {/* Real Dedicated Product Ecosystem Routes */}
          <Route path="/features/:slug" element={<FeatureDetail />} />
          <Route path="/features" element={<FeatureDetail />} />
          <Route path="/solutions/:slug" element={<SolutionsPage />} />
          <Route path="/solutions" element={<SolutionsPage />} />
          <Route path="/why-nagm" element={<WhyNagmPage />} />
          <Route path="/about" element={<AboutPage />} />

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
          <Route path="/signup" element={<Navigate to="/register" replace />} />
          <Route path="/sign-up" element={<Navigate to="/register" replace />} />
          <Route path="/signin" element={<Navigate to="/login" replace />} />
          <Route path="/sign-in" element={<Navigate to="/login" replace />} />
          {/* Deep link straight to company form */}
          <Route path="/register/company" element={<AuthPage />} />
          <Route path="/verify" element={<Verify />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}
