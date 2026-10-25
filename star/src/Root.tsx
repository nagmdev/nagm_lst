import { lazy } from 'react';
import { BrowserRouter } from 'react-router-dom';
import Landing from './Landing';
import AppRoutes, { type SitePages } from './AppRoutes';

// nagm.io: marketing site + the pre-auth flow (login / register / verify).
// After a successful sign-in these hand the session off to app.nagm.io.
const pages: SitePages = {
  Landing,
  JobSeekersPage: lazy(() => import('./pages/JobSeekersPage')),
  CompaniesPage: lazy(() => import('./pages/CompaniesPage')),
  PricingPage: lazy(() => import('./pages/PricingPage')),
  AboutPage: lazy(() => import('./pages/AboutPage')),
  LegalPage: lazy(() => import('./pages/LegalPage')),
  NotFoundPage: lazy(() => import('./pages/NotFoundPage')),
  AuthPage: lazy(() => import('./pages/AuthPage')),
  Verify: lazy(() => import('./pages/Verify')),
};

export default function Root() {
  return (
    <BrowserRouter>
      <AppRoutes pages={pages} />
    </BrowserRouter>
  );
}
