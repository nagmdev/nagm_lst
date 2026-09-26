import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom';
import Landing from './Landing';
import { APP_ORIGIN } from './auth';

describe('Landing page enhancements', () => {
  let navTarget = '';
  let navState: any = null;

  const MockLandingContainer = () => {
    return (
      <MemoryRouter initialEntries={['/']}>
        <Landing />
      </MemoryRouter>
    );
  };

  it('renders Jobs navigation link pointing to APP_ORIGIN/jobs', () => {
    render(<MockLandingContainer />);
    const jobsLinks = screen.getAllByRole('link', { name: /^Jobs$/i });
    expect(jobsLinks.length).toBeGreaterThan(0);
    expect(jobsLinks[0]).toHaveAttribute('href', `${APP_ORIGIN}/jobs`);
  });

  it('renders interactive CTA buttons on all pricing cards', () => {
    render(<MockLandingContainer />);
    const freePlanBtn = screen.getByRole('button', { name: /get started free/i });
    const proPlanBtn = screen.getByRole('button', { name: /upgrade to pro/i });
    const companyPlanBtn = screen.getByRole('button', { name: /start hiring now/i });
    const enterprisePlanBtn = screen.getByRole('button', { name: /contact sales/i });

    expect(freePlanBtn).toBeInTheDocument();
    expect(proPlanBtn).toBeInTheDocument();
    expect(companyPlanBtn).toBeInTheDocument();
    expect(enterprisePlanBtn).toBeInTheDocument();
  });
});
