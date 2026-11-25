import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { headersFor } from '../scripts/vercel-routes.mjs';
import { buildCsp } from '../scripts/csp.mjs';

/**
 * Sheet #47: nagm.io's security headers and Content-Security-Policy.
 *
 * The repo has two vercel.json files. The one at the repo root — the one a
 * root-level Vercel project reads — had no headers and no redirects at all;
 * the full set sat in star/vercel.json only. Both now say the same.
 *
 * Scripts are governed by the CSP <meta> the build writes into every page
 * (scripts/csp.mjs, with a hash for the inlined boot script); the header adds
 * what a <meta> cannot (frame-ancestors). Browsers enforce both together.
 */
const read = (p: string) => JSON.parse(fs.readFileSync(path.resolve(__dirname, p), 'utf8'));
const star = read('../vercel.json');
const root = read('../../vercel.json');
const headerCsp = headersFor('/')['Content-Security-Policy'] as string;
const pageCsp = buildCsp({ scriptHashes: "'sha256-abc='", apiOrigin: 'https://backend-yqpd.vercel.app' });
const directiveOf = (csp: string) => (name: string) => (csp.split(';').map((d) => d.trim()).find((d) => d.startsWith(`${name} `)) || '');
const directive = directiveOf(pageCsp);

describe('nagm.io security headers', () => {
  it('the root vercel.json carries the same headers, redirects and rewrites as star/vercel.json', () => {
    for (const key of ['headers', 'redirects', 'rewrites', 'cleanUrls', 'trailingSlash']) {
      expect(root[key], key).toEqual(star[key]);
    }
    expect(root.outputDirectory).toBe('star/dist');
  });

  it('sends the usual hardening headers on every page', () => {
    const h = headersFor('/pricing');
    expect(h['Strict-Transport-Security']).toMatch(/max-age=\d{7,}/);
    expect(h['X-Content-Type-Options']).toBe('nosniff');
    expect(h['X-Frame-Options']).toBe('DENY');
    expect(h['Referrer-Policy']).toBeTruthy();
    expect(h['Permissions-Policy']).toBeTruthy();
  });

  it('restricts scripts: no inline, no eval, only our origin and the tag manager', () => {
    expect(directive('default-src')).toBe("default-src 'self'");
    const scripts = directive('script-src');
    expect(scripts).toContain("'self'");
    expect(scripts).toContain('https://www.googletagmanager.com');
    expect(scripts).not.toMatch(/unsafe-inline|unsafe-eval|\*(?!\.)| https?: /);
    expect(directive('script-src')).toContain("'sha256-abc='");
    expect(directive('object-src')).toBe("object-src 'none'");
    expect(directive('base-uri')).toBe("base-uri 'self'");
    // A <meta> cannot forbid framing: the header does.
    expect(directiveOf(headerCsp)('frame-ancestors')).toBe("frame-ancestors 'none'");
    expect(directive('connect-src')).toContain('https://backend-yqpd.vercel.app');
  });

  it('the page itself has no inline script the policy would refuse', () => {
    const html = fs.readFileSync(path.resolve(__dirname, '../index.html'), 'utf8');
    const inline = [...html.matchAll(/<script(?![^>]*\bsrc=)(?![^>]*type="application\/ld\+json")[^>]*>([\s\S]*?)<\/script>/g)]
      .map((m) => m[1].trim()).filter(Boolean);
    expect(inline).toEqual([]);
  });
});
