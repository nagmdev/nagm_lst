import { describe, it, expect } from 'vitest';
import { pageFromPath, pagePath, PAGE_PATHS } from './lang';

describe('one address per language', () => {
  it('reads the language and page from an address', () => {
    expect(pageFromPath('/')).toEqual({ lang: 'ar', page: '/' });
    expect(pageFromPath('/en')).toEqual({ lang: 'en', page: '/' });
    expect(pageFromPath('/en/')).toEqual({ lang: 'en', page: '/' });
    expect(pageFromPath('/pricing')).toEqual({ lang: 'ar', page: '/pricing' });
    expect(pageFromPath('/en/pricing/')).toEqual({ lang: 'en', page: '/pricing' });
  });

  it('knows sign-in, app links and unknown paths are not pages', () => {
    for (const p of ['/login', '/register', '/verify', '/jobs', '/en/login', '/english', '/pricing/x']) expect(pageFromPath(p)).toBeNull();
  });

  it('builds the address of a page in each language, keeping the query and section', () => {
    expect(pagePath('/', 'en')).toBe('/en');
    expect(pagePath('/', 'ar')).toBe('/');
    expect(pagePath('/pricing?for=companies', 'en')).toBe('/en/pricing?for=companies');
    expect(pagePath('/job-seekers#match', 'en')).toBe('/en/job-seekers#match');
    expect(pagePath('/en/companies#team', 'ar')).toBe('/companies#team');
    for (const p of PAGE_PATHS) expect(pageFromPath(pagePath(p, 'en'))).toEqual({ lang: 'en', page: p });
  });

  it('leaves every other link alone', () => {
    for (const to of ['/login', '/register?role=company', 'mailto:sales@nagm.io', 'https://app.nagm.io/jobs', '#why']) {
      expect(pagePath(to, 'en')).toBe(to);
    }
  });
});
