import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Landing from './Landing';
import AuthPage from './pages/AuthPage';
import Verify from './pages/Verify';
import AboutPage from './pages/AboutPage';

// nagm.io: marketing landing + the pre-auth flow (login / register / verify).
// After a successful sign-in these hand the session off to app.nagm.io.
export default function Root() {
  return (
    <BrowserRouter>
      <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:p-2 focus:bg-white focus:text-black">Skip to main content</a>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/features" element={<AboutPage />} />
        <Route path="/solutions" element={<AboutPage />} />
        <Route path="/why-nagm" element={<AboutPage />} />
        <Route path="/products" element={<AboutPage />} />
        <Route path="/login" element={<AuthPage />} />
        <Route path="/register" element={<AuthPage />} />
        {/* Aliases. Every other spelling fell through to the catch-all and
            bounced the visitor to the landing page with no explanation, which
            reads as "there is nowhere to go". */}
        <Route path="/signup" element={<Navigate to="/register" replace />} />
        <Route path="/sign-up" element={<Navigate to="/register" replace />} />
        <Route path="/signin" element={<Navigate to="/login" replace />} />
        <Route path="/sign-in" element={<Navigate to="/login" replace />} />
        {/* Deep link straight to the company form, for "Register your company" CTAs. */}
        <Route path="/register/company" element={<AuthPage />} />
        <Route path="/verify" element={<Verify />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
