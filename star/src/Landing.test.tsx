import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Landing from './Landing';
import { APP_ORIGIN } from './auth';
import { setLang } from './i18n/lang';

describe('Landing page bilingual enhancements', () => {
  const MockLandingContainer = () => {
    return (
      <MemoryRouter initialEntries={['/']}>
        <Landing />
      </MemoryRouter>
    );
  };

  beforeEach(() => {
    act(() => {
      setLang('en');
    });
  });

  it('renders English navigation links and content when language is en', () => {
    render(<MockLandingContainer />);
    const jobsLinks = screen.getAllByRole('link', { name: /^Jobs$/i });
    expect(jobsLinks.length).toBeGreaterThan(0);
    expect(jobsLinks[0]).toHaveAttribute('href', `${APP_ORIGIN}/jobs`);

    expect(screen.getByText(/Build your CV\. Apply\./i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /^Products$/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /^Solutions$/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /^Why Nagm$/i })).toBeInTheDocument();

    const freePlanBtn = screen.getByRole('button', { name: /get started free/i });
    const proPlanBtn = screen.getByRole('button', { name: /upgrade to pro/i });
    const companyPlanBtn = screen.getByRole('button', { name: /start hiring now/i });
    const enterprisePlanBtn = screen.getByRole('button', { name: /contact sales/i });

    expect(freePlanBtn).toBeInTheDocument();
    expect(proPlanBtn).toBeInTheDocument();
    expect(companyPlanBtn).toBeInTheDocument();
    expect(enterprisePlanBtn).toBeInTheDocument();
  });

  it('renders complete Arabic navigation links and content when language is ar', () => {
    act(() => {
      setLang('ar');
    });
    render(<MockLandingContainer />);

    const jobsLinks = screen.getAllByRole('link', { name: /^الوظائف$/i });
    expect(jobsLinks.length).toBeGreaterThan(0);
    expect(jobsLinks[0]).toHaveAttribute('href', `${APP_ORIGIN}/jobs`);

    expect(screen.getByText(/أنشئ سيرتك الذاتية\. قدّم\./i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /^المنتجات$/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /^الحلول$/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /^لماذا نجم$/i })).toBeInTheDocument();

    expect(screen.getByRole('button', { name: /ابدأ مجاناً/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /الترقية للمحترف/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /ابدأ التوظيف الآن/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /تواصل مع المبيعات/i })).toBeInTheDocument();

    expect(screen.getByText('سارة منصور')).toBeInTheDocument();
    expect(screen.getByText('مهندسة برمجيات · القاهرة')).toBeInTheDocument();
    expect(screen.getByText('مطابقة ذكية')).toBeInTheDocument();
  });

  it('toggles language seamlessly via language switch button', () => {
    render(<MockLandingContainer />);
    const langBtn = screen.getByRole('button', { name: /(Switch to English|التبديل إلى العربية)/i });
    expect(langBtn).toBeInTheDocument();

    // Currently 'en', so button says 'التبديل إلى العربية' / 'عربي'
    fireEvent.click(langBtn);

    // Now it should be Arabic
    expect(screen.getByText(/أنشئ سيرتك الذاتية\. قدّم\./i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /^المنتجات$/i })).toBeInTheDocument();
  });
});
