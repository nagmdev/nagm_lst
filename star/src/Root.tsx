import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Landing from './Landing';
import AuthPage from './pages/AuthPage';
import Verify from './pages/Verify';
import AboutPage from './pages/AboutPage';
import FeatureDetail from './pages/FeatureDetail';
import SolutionsPage from './pages/SolutionsPage';
import WhyNagmPage from './pages/WhyNagmPage';
import { APP_ORIGIN } from './auth';

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
      <Routes>
        <Route path="/" element={<Landing />} />
        
        {/* Real Dedicated Product Ecosystem Routes */}
        <Route path="/features/:slug" element={<FeatureDetail />} />
        <Route path="/features" element={<FeatureDetail />} />
        <Route path="/solutions/:slug" element={<SolutionsPage />} />
        <Route path="/solutions" element={<SolutionsPage />} />
        <Route path="/why-nagm" element={<WhyNagmPage />} />
        <Route path="/about" element={<AboutPage />} />

        {/* Redirect all job and shared application links directly to app.nagm.io */}
        <Route path="/jobs" element={<RedirectToApp />} />
        <Route path="/jobs/*" element={<RedirectToApp />} />
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
    </BrowserRouter>
  );
}
