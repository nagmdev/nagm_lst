import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, act, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import LegalPage from './LegalPage';
import { LEGAL } from '../i18n/legalText';
import { setLang } from '../i18n/lang';

const renderDoc = (doc: 'terms' | 'privacy') =>
  render(
    <MemoryRouter initialEntries={[`/${doc}`]}>
      <LegalPage doc={doc} />
    </MemoryRouter>,
  );

describe('Terms of Service and Privacy Policy', () => {
  beforeEach(() => act(() => setLang('en')));

  it.each(['terms', 'privacy'] as const)('%s: every section is listed in the contents and links to its heading', (doc) => {
    renderDoc(doc);
    const d = LEGAL[doc].en;
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(d.title);
    expect(screen.getByTestId('legal-updated')).toHaveTextContent(d.updated);
    const toc = screen.getByRole('navigation', { name: 'Contents' });
    for (const s of d.sections) {
      expect(within(toc).getByRole('link', { name: s.title })).toHaveAttribute('href', `#${s.id}`);
      expect(screen.getByRole('heading', { level: 2, name: s.title }).closest('section')).toHaveAttribute('id', s.id);
    }
  });

  it('links each document to the other', () => {
    renderDoc('terms');
    const main = screen.getByRole('main');
    expect(within(main).getByRole('link', { name: 'Privacy Policy' })).toHaveAttribute('href', '/privacy');
    // …and the site footer offers both on every page.
    const footer = screen.getByRole('contentinfo');
    expect(within(footer).getByRole('link', { name: 'Terms of Service' })).toHaveAttribute('href', '/terms');
    expect(within(footer).getByRole('link', { name: 'Privacy Policy' })).toHaveAttribute('href', '/privacy');
  });

  it('reads in Arabic, right-to-left', () => {
    act(() => setLang('ar'));
    renderDoc('privacy');
    expect(document.documentElement).toHaveAttribute('dir', 'rtl');
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('سياسة الخصوصية');
    expect(screen.getByRole('navigation', { name: 'المحتويات' })).toBeInTheDocument();
    expect(screen.queryByText(/Privacy Policy|Last updated/)).not.toBeInTheDocument();
  });

  it('both languages carry the same sections, in the same order', () => {
    for (const doc of ['terms', 'privacy'] as const) {
      expect(LEGAL[doc].ar.sections.map((s) => s.id)).toEqual(LEGAL[doc].en.sections.map((s) => s.id));
    }
  });

  it('says what the platform actually does: no card numbers kept, no selling of data, the real providers', () => {
    const text = JSON.stringify(LEGAL.privacy.en);
    expect(text).toMatch(/last 4 digits/);
    expect(text).toMatch(/does not sell your personal information/);
    for (const p of ['Paymob', 'Tamara', 'Amazon Bedrock', 'DeepSeek', 'Google Analytics', 'Vercel', 'Neon']) expect(text).toContain(p);
  });
});
