import { describe, it, expect, beforeAll } from 'vitest';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { resolveRequest } from '../scripts/vercel-routes.mjs';
import { FEATURE_REDIRECTS, SOLUTION_REDIRECTS } from './legacyRoutes';

/**
 * vercel.json, read the way Vercel reads it: retired pages answer with a
 * permanent redirect before the app loads, and those redirects must say the
 * same as the app's own table (legacyRoutes.tsx).
 */
let dist = '';
beforeAll(() => {
  dist = fs.mkdtempSync(path.join(os.tmpdir(), 'nagm-dist-'));
  for (const f of ['index.html', 'en.html', 'pricing.html', 'en/pricing.html', '404.html', 'app.html', 'robots.txt', 'sitemap.xml']) {
    fs.mkdirSync(path.dirname(path.join(dist, f)), { recursive: true });
    fs.writeFileSync(path.join(dist, f), f);
  }
});

describe('nagm.io addresses on Vercel', () => {
  it.each(Object.entries(FEATURE_REDIRECTS))('/features/%s → %s, permanently', (slug, to) => {
    expect(resolveRequest(`/features/${slug}`, dist)).toEqual({ status: 308, location: to });
  });

  it.each(Object.entries(SOLUTION_REDIRECTS))('/solutions/%s → %s, permanently', (slug, to) => {
    expect(resolveRequest(`/solutions/${slug}`, dist)).toEqual({ status: 308, location: to });
  });

  it('sends job and application links to the app', () => {
    expect(resolveRequest('/jobs/42', dist)).toEqual({ status: 308, location: 'https://app.nagm.io/jobs/42' });
    expect(resolveRequest('/invite/abc', dist)).toEqual({ status: 307, location: 'https://app.nagm.io/invite/abc' });
  });

  it('serves each page from its own file, at one address', () => {
    expect(resolveRequest('/', dist)).toEqual({ status: 200, file: 'index.html' });
    expect(resolveRequest('/en', dist)).toEqual({ status: 200, file: 'en.html' });
    expect(resolveRequest('/en/pricing', dist)).toEqual({ status: 200, file: 'en/pricing.html' });
    expect(resolveRequest('/pricing/', dist)).toEqual({ status: 308, location: '/pricing' });
    expect(resolveRequest('/pricing.html', dist)).toEqual({ status: 308, location: '/pricing' });
    expect(resolveRequest('/robots.txt', dist)).toEqual({ status: 200, file: 'robots.txt' });
  });

  it('renders sign-in pages in the browser and answers anything else with a 404', () => {
    for (const p of ['/login', '/register', '/register/company', '/verify', '/signup']) expect(resolveRequest(p, dist)).toEqual({ status: 200, file: 'app.html' });
    for (const p of ['/nope', '/en/nope', '/pricing/extra']) expect(resolveRequest(p, dist)).toEqual({ status: 404, file: '404.html' });
  });
});
