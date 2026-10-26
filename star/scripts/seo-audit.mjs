#!/usr/bin/env node
/**
 * SEO audit for nagm.io: `npm run seo:audit` (add --no-build to reuse dist/).
 *
 * Serves the built site locally exactly as Vercel would (scripts/vercel-routes.mjs)
 * under the real host name, then checks every page in Arabic and English:
 *
 *  1. Lighthouse: SEO, Accessibility and Best Practices must each score 100.
 *  2. What a crawler gets WITHOUT JavaScript: status, lang/dir, title,
 *     description, canonical, hreflang, share card, structured data, one <h1>,
 *     real content, image alt text, working internal links, the social links.
 *  3. Site files: robots.txt, sitemap.xml (every page and its alternates).
 *  4. Addresses: retired pages 301/308 to their new home, trailing slashes and
 *     .html fold into one address, unknown pages answer 404 + noindex.
 *  5. In a real browser: no console errors (a failed hydration shows up here).
 *
 * Exits 1 on any failure. Writes seo-report/report.md and report.json.
 *
 * Without internet access to the live API, build with VITE_BACKEND_API=/api and
 * set SEO_AUDIT_API=http://127.0.0.1:4100 (a local backend): the audit server
 * then forwards /api/* to it, so pages that fetch prices load without errors.
 */
import fs from 'node:fs';
import http from 'node:http';
import zlib from 'node:zlib';
import { createHash } from 'node:crypto';
import path from 'node:path';
import { execSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { JSDOM } from 'jsdom';
import lighthouse from 'lighthouse';
import * as chromeLauncher from 'chrome-launcher';
import { chromium } from '@playwright/test';
import { resolveRequest, headersFor } from './vercel-routes.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const dist = path.join(root, 'dist');
const args = new Set(process.argv.slice(2));
const CHROME = process.env.CHROME_PATH || (fs.existsSync('/opt/pw-browsers/chromium') ? '/opt/pw-browsers/chromium' : chromium.executablePath());
const HOST = 'nagm.io';
const SITE = 'https://nagm.io';
const SOCIAL = [
  'https://www.facebook.com/nagmio2025',
  'https://www.instagram.com/nagm._2025',
  'https://www.youtube.com/@Nagm-io',
  'https://x.com/Nagm_2025',
];
const PAGES = ['/', '/job-seekers', '/companies', '/pricing', '/about', '/terms', '/privacy'];
const URLS = PAGES.flatMap((p) => [
  { path: p, lang: 'ar', alt: p === '/' ? '/en' : `/en${p}` },
  { path: p === '/' ? '/en' : `/en${p}`, lang: 'en', alt: p },
]).map((u) => ({ ...u, ar: u.lang === 'ar' ? u.path : u.alt, en: u.lang === 'en' ? u.path : u.alt }));
const abs = (p) => (p === '/' ? `${SITE}/` : `${SITE}${p}`);

if (!args.has('--no-build')) execSync('npm run build', { cwd: root, stdio: 'inherit' });

/* ------------------------------------------------------------------ */
/* local server that answers like Vercel                               */

const TYPES = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css', '.png': 'image/png', '.svg': 'image/svg+xml', '.txt': 'text/plain; charset=utf-8', '.xml': 'application/xml; charset=utf-8', '.json': 'application/json', '.woff2': 'font/woff2', '.ico': 'image/x-icon' };
const API = process.env.SEO_AUDIT_API;
const server = http.createServer((req, res) => {
  const url = new URL(req.url, `http://${HOST}`);
  if (API && url.pathname.startsWith('/api/')) {
    fetch(`${API}${url.pathname}${url.search}`, { headers: { accept: req.headers.accept ?? '*/*' } })
      .then(async (r) => { res.writeHead(r.status, { 'Content-Type': r.headers.get('content-type') ?? 'application/json' }); res.end(Buffer.from(await r.arrayBuffer())); })
      .catch(() => { res.writeHead(502); res.end(); });
    return;
  }
  const r = resolveRequest(decodeURIComponent(url.pathname), dist);
  const headers = headersFor(url.pathname);
  // HSTS and COOP only apply over HTTPS; on this plain-http copy Chrome would
  // just warn about them. Both are checked as headers in vercel.json below.
  delete headers['Strict-Transport-Security'];
  delete headers['Cross-Origin-Opener-Policy'];
  if (r.location) {
    res.writeHead(r.status, { ...headers, Location: r.location + (r.location.includes('?') ? '' : url.search) });
    return res.end();
  }
  if (!r.file) { res.writeHead(404, headers); return res.end(); }
  const body = fs.readFileSync(path.join(dist, r.file));
  const type = TYPES[path.extname(r.file)] ?? 'application/octet-stream';
  // Compressed like Vercel's edge, so performance is measured on what visitors download.
  if (/text|javascript|json|xml|svg/.test(type) && /gzip/.test(req.headers['accept-encoding'] ?? '')) {
    res.writeHead(r.status, { 'Content-Type': type, 'Content-Encoding': 'gzip', Vary: 'Accept-Encoding', ...headers });
    return res.end(zlib.gzipSync(body));
  }
  res.writeHead(r.status, { 'Content-Type': type, ...headers });
  res.end(body);
});
await new Promise((ok) => server.listen(0, '127.0.0.1', ok));
const PORT = server.address().port;
const local = (p) => `http://127.0.0.1:${PORT}${p}`;
// Chrome visits the real host name, routed to this server, so canonical and hreflang are judged as in production.
// Behind an HTTPS-inspecting proxy (CI, sandboxes) third-party files such as
// the web fonts still load, through it; the site itself never goes through it.
const PROXY = process.env.HTTPS_PROXY || process.env.https_proxy;
const CHROME_FLAGS = [
  '--headless=new', '--no-sandbox',
  `--host-resolver-rules=MAP ${HOST}:80 127.0.0.1:${PORT}`,
  // The local copy is plain http; don't let Chrome try https first.
  '--disable-features=HttpsUpgrades,HttpsFirstBalancedModeAutoEnable,HttpsFirstModeV2ForEngagedSites',
  ...(PROXY ? [`--proxy-server=${PROXY}`, `--proxy-bypass-list=${HOST};127.0.0.1`, '--ignore-certificate-errors'] : ['--no-proxy-server']),
];
// Served over plain http here, so these two belong to hosting, not the pages:
// Vercel serves nagm.io over HTTPS and redirects http to it.
const HOSTING_AUDITS = ['is-on-https', 'redirects-http'];

/* ------------------------------------------------------------------ */

const failures = [];
const rows = [];
const fail = (where, what) => failures.push(`${where}: ${what}`);
const check = (cond, where, what) => { if (!cond) fail(where, what); return cond; };

async function get(p) {
  const r = await fetch(local(p), { redirect: 'manual' });
  return { status: r.status, location: r.headers.get('location'), type: r.headers.get('content-type') ?? '', headers: r.headers, text: await r.text() };
}

/** Follow up to 5 local redirects; external targets end the chain. */
async function finalStatus(p) {
  let cur = p;
  for (let i = 0; i < 5; i++) {
    const r = await get(cur);
    if (r.status < 300 || r.status >= 400) return { status: r.status, at: cur };
    const loc = new URL(r.location, abs(cur));
    if (loc.host !== HOST) return { status: 200, at: loc.href };
    cur = `${loc.pathname}${loc.search}`;
  }
  return { status: 0, at: cur };
}

/* 2. without JavaScript ------------------------------------------------ */

for (const u of URLS) {
  const where = u.path;
  const r = await get(u.path);
  check(r.status === 200, where, `status ${r.status}`);
  check(r.type.startsWith('text/html'), where, `content-type ${r.type}`);
  const doc = new JSDOM(r.text).window.document;
  const $ = (s) => doc.querySelector(s);
  const $$ = (s) => [...doc.querySelectorAll(s)];
  const html = doc.documentElement;
  check(html.getAttribute('lang') === u.lang, where, `<html lang> is "${html.getAttribute('lang')}"`);
  check(html.getAttribute('dir') === (u.lang === 'ar' ? 'rtl' : 'ltr'), where, `<html dir> is "${html.getAttribute('dir')}"`);

  const titles = $$('title');
  const title = titles[0]?.textContent?.trim() ?? '';
  check(titles.length === 1, where, `${titles.length} <title> tags`);
  check(title.length >= 15 && title.length <= 60, where, `title length ${title.length} (max 60): "${title}"`);
  const descs = $$('meta[name="description"]');
  const desc = descs[0]?.getAttribute('content') ?? '';
  check(descs.length === 1, where, `${descs.length} meta descriptions`);
  check(desc.length >= 70 && desc.length <= 160, where, `description length ${desc.length}`);
  check(!$$('meta[name="robots"]').some((m) => /noindex/i.test(m.getAttribute('content'))), where, 'marked noindex');

  const canon = $$('link[rel="canonical"]');
  check(canon.length === 1 && canon[0].getAttribute('href') === abs(u.path), where, `canonical ${canon.map((c) => c.getAttribute('href')).join(', ') || 'missing'}`);
  const alt = (l) => $(`link[rel="alternate"][hreflang="${l}"]`)?.getAttribute('href');
  check(alt('ar') === abs(u.ar), where, `hreflang ar → ${alt('ar')}`);
  check(alt('en') === abs(u.en), where, `hreflang en → ${alt('en')}`);
  check(alt('x-default') === abs(u.ar), where, `hreflang x-default → ${alt('x-default')}`);

  const og = (k) => $(`meta[property="og:${k}"]`)?.getAttribute('content');
  check(og('title') === title, where, 'og:title differs from the title');
  check(og('description') === desc, where, 'og:description differs from the description');
  check(og('url') === abs(u.path), where, `og:url ${og('url')}`);
  const image = og('image') ?? '';
  check(image.startsWith(`${SITE}/`) && (await get(new URL(image).pathname)).status === 200, where, `og:image ${image} not served`);
  check($('meta[name="twitter:card"]')?.getAttribute('content') === 'summary_large_image', where, 'twitter:card');

  let graph = [];
  for (const s of $$('script[type="application/ld+json"]')) {
    try { graph = graph.concat(JSON.parse(s.textContent)['@graph'] ?? []); } catch (e) { fail(where, `JSON-LD does not parse: ${e.message}`); }
  }
  const org = graph.find((n) => n['@type'] === 'Organization');
  check(org && SOCIAL.every((s) => org.sameAs?.includes(s)), where, 'Organization sameAs is missing a social account');
  check(graph.some((n) => /WebPage|AboutPage/.test(n['@type']) && n.url === abs(u.path)), where, 'no WebPage for this address');
  if (u.ar !== '/') check(graph.some((n) => n['@type'] === 'BreadcrumbList'), where, 'no BreadcrumbList');

  const body = $('#root');
  check(body?.getAttribute('data-prerendered') === u.path, where, 'page is not pre-rendered');
  const h1 = $$('#root h1');
  check(h1.length === 1 && h1[0].textContent.trim().length > 3, where, `${h1.length} <h1> in the pre-rendered page`);
  const words = (body?.textContent ?? '').replace(/\s+/g, ' ').trim();
  check(words.length > 600, where, `only ${words.length} characters of text without JavaScript`);
  for (const img of $$('#root img')) check(img.hasAttribute('alt'), where, `<img src="${img.getAttribute('src')}"> has no alt`);

  const footerLinks = $$('footer a').map((a) => a.getAttribute('href'));
  for (const s of SOCIAL) check(footerLinks.includes(s), where, `footer is missing ${s}`);

  const internal = new Set($$('#root a[href]').map((a) => a.getAttribute('href'))
    .filter((h) => h.startsWith('/') || h.startsWith(SITE))
    .map((h) => new URL(h, abs(u.path))).map((x) => `${x.pathname}${x.search}`));
  for (const h of internal) {
    const f = await finalStatus(h);
    check(f.status === 200, where, `link ${h} ends in ${f.status} at ${f.at}`);
  }
  rows.push({ url: u.path, title, description: desc.length, links: internal.size });
}

/* 3. robots.txt and sitemap.xml ----------------------------------------- */

{
  const r = await get('/robots.txt');
  check(r.status === 200 && r.type.startsWith('text/plain'), 'robots.txt', `status ${r.status} ${r.type}`);
  check(/^Sitemap: https:\/\/nagm\.io\/sitemap\.xml$/m.test(r.text), 'robots.txt', 'no Sitemap line');
  check(!/^Disallow:\s*\/\s*$/m.test(r.text), 'robots.txt', 'blocks the whole site');
  const s = await get('/sitemap.xml');
  check(s.status === 200 && s.type.includes('xml'), 'sitemap.xml', `status ${s.status} ${s.type}`);
  const locs = [...s.text.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]).sort();
  const want = URLS.map((u) => abs(u.path)).sort();
  check(JSON.stringify(locs) === JSON.stringify(want), 'sitemap.xml', `lists ${locs.length} addresses, expected ${want.length}`);
  check((s.text.match(/<xhtml:link /g) ?? []).length === want.length * 3, 'sitemap.xml', 'each address needs ar, en and x-default alternates');
}

/* 3b. AI assistants: llms.txt, llms-full.txt, crawler access -------------- */

{
  const l = await get('/llms.txt');
  check(l.status === 200 && /^text\/plain/.test(l.type) && /charset=utf-8/i.test(l.type), 'llms.txt', `status ${l.status} ${l.type}`);
  check(/^# Nagm/.test(l.text) && /^> /m.test(l.text), 'llms.txt', 'needs an H1 and a > summary line (llmstxt.org)');
  for (const u of URLS) check(l.text.includes(`(${abs(u.path)})`), 'llms.txt', `does not list ${abs(u.path)}`);
  const f = await get('/llms-full.txt');
  check(f.status === 200 && f.text.length > 20000, 'llms-full.txt', `status ${f.status}, ${f.text.length} characters`);
  for (const u of URLS) check(f.text.includes(`URL: ${abs(u.path)}`), 'llms-full.txt', `is missing ${u.path}`);
  check(!/Sara Mansour|Omar Khaled|Layla Hassan|Madar Tech/.test(f.text), 'llms-full.txt', 'carries sample names from the illustrations');
  const robots = (await get('/robots.txt')).text;
  for (const bot of ['GPTBot', 'OAI-SearchBot', 'ClaudeBot', 'PerplexityBot', 'Google-Extended']) {
    check(new RegExp(`^User-agent: ${bot}$`, 'm').test(robots), 'robots.txt', `does not name ${bot}`);
  }
}

/* 3c. security headers ---------------------------------------------------- */

{
  const want = {
    'x-content-type-options': /^nosniff$/, 'x-frame-options': /^DENY$/, 'referrer-policy': /strict-origin/,
    'permissions-policy': /camera=\(\)/, 'content-security-policy': /frame-ancestors 'none'/,
  };
  for (const p of ['/', '/en/pricing', '/login', '/no-such-page']) {
    const r = await get(p);
    for (const [k, re] of Object.entries(want)) check(re.test(r.headers.get(k) ?? ''), p, `header ${k}: ${r.headers.get(k)}`);
    if (r.type.startsWith('text/html')) check(/<meta http-equiv="Content-Security-Policy" content="default-src 'self'; script-src 'self'[^;"]*;/.test(r.text), p, 'no Content-Security-Policy <meta>');
    // Every inline script must be allowed by its hash, or the CSP blocks it.
    const csp = /<meta http-equiv="Content-Security-Policy" content="([^"]+)"/.exec(r.text)?.[1] ?? '';
    for (const [, js] of r.text.matchAll(/<script>([\s\S]*?)<\/script>/g)) {
      const hash = `'sha256-${createHash('sha256').update(js).digest('base64')}'`;
      check(csp.includes(hash), p, 'an inline script is not allowed by the CSP');
    }
  }
  check(/max-age=\d{8,}/.test(headersFor('/')['Strict-Transport-Security'] ?? ''), 'vercel.json', 'no long-lived Strict-Transport-Security');
  check(headersFor('/')['Cross-Origin-Opener-Policy'] === 'same-origin', 'vercel.json', 'no Cross-Origin-Opener-Policy');
}

/* 4. addresses ------------------------------------------------------------ */

const REDIRECTS = [
  ['/pricing/', '/pricing'], ['/en/', '/en'], ['/pricing.html', '/pricing'], ['/index.html', '/'],
  ['/plans', '/pricing'], ['/why-nagm', '/#why'], ['/features', '/'], ['/features/cv-builder', '/job-seekers#cv'],
  ['/features/analytics', '/companies#analytics'], ['/features/whatever', '/'], ['/solutions', '/companies'],
  ['/solutions/candidates', '/job-seekers'], ['/solutions/enterprise', '/pricing?for=companies'],
  ['/jobs', 'https://app.nagm.io/jobs'], ['/jobs/42', 'https://app.nagm.io/jobs/42'],
];
for (const [from, to] of REDIRECTS) {
  const r = await get(from);
  check([301, 308].includes(r.status) && r.location === to, from, `answers ${r.status} → ${r.location}, expected 301/308 → ${to}`);
}
for (const p of ['/no-such-page', '/en/no-such-page', '/features-old/x']) {
  const r = await get(p);
  check(r.status === 404, p, `answers ${r.status}, expected 404`);
  check(/<meta name="robots" content="noindex"/.test(r.text), p, '404 page is not noindex');
}
for (const p of ['/login', '/register', '/verify']) {
  const r = await get(p);
  check(r.status === 200 && /<meta name="robots" content="noindex"/.test(r.text), p, 'sign-in page should load and be noindex');
}

/* 5. real browser: no console errors ------------------------------------ */

{
  const browser = await chromium.launch({ executablePath: CHROME, args: CHROME_FLAGS.slice(1) });
  for (const u of URLS) {
    const page = await browser.newPage();
    const errors = [];
    page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
    page.on('pageerror', (e) => errors.push(e.message));
    await page.goto(`http://${HOST}${u.path}`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(300);
    // Ignore what the sandbox can't reach (fonts, the API); anything else is ours.
    const ours = errors.filter((e) => !/net::ERR_|Failed to load resource/.test(e));
    check(ours.length === 0, u.path, `console errors after load: ${ours.join(' | ')}`);
    const title = await page.title();
    check(title === rows.find((r) => r.url === u.path)?.title, u.path, `title after hydration is "${title}"`);
    await page.close();
  }
  await browser.close();
}

/* 1. Lighthouse ------------------------------------------------------------ */

const CATEGORIES = ['seo', 'accessibility', 'best-practices', ...(args.has('--perf') ? ['performance'] : [])];
const chrome = await chromeLauncher.launch({ chromePath: CHROME, chromeFlags: CHROME_FLAGS });
const scores = [];
try {
  for (const u of URLS) {
    const { lhr } = await lighthouse(`http://${HOST}${u.path}`, { port: chrome.port, output: 'json', logLevel: 'error', onlyCategories: CATEGORIES }, { extends: 'lighthouse:default', settings: { skipAudits: HOSTING_AUDITS } });
    if (lhr.runtimeError) fail(u.path, `Lighthouse could not load the page: ${lhr.runtimeError.code}`);
    const row = { url: u.path };
    for (const c of CATEGORIES) {
      const cat = lhr.categories[c];
      row[c] = Math.round(cat.score * 100);
      if (c !== 'performance' && row[c] < 100) {
        const misses = cat.auditRefs.map((a) => lhr.audits[a.id]).filter((a) => a.score !== null && a.score < 1 && a.scoreDisplayMode !== 'informative' && a.scoreDisplayMode !== 'manual');
        fail(u.path, `Lighthouse ${c} ${row[c]}: ${misses.map((a) => a.id).join(', ')}`);
      }
    }
    scores.push(row);
    console.log(`lighthouse ${u.path.padEnd(16)} ${CATEGORIES.map((c) => `${c} ${row[c]}`).join('  ')}`);
  }
} finally {
  await chrome.kill();
  server.close();
}

/* report ------------------------------------------------------------------ */

const out = path.join(root, 'seo-report');
fs.mkdirSync(out, { recursive: true });
fs.writeFileSync(path.join(out, 'report.json'), JSON.stringify({ when: new Date().toISOString(), scores, pages: rows, failures }, null, 2));
const md = [
  '# nagm.io SEO audit', '',
  `| Page | ${CATEGORIES.join(' | ')} |`, `|---|${CATEGORIES.map(() => '---').join('|')}|`,
  ...scores.map((s) => `| ${s.url} | ${CATEGORIES.map((c) => s[c]).join(' | ')} |`), '',
  failures.length ? `## ${failures.length} failure(s)\n\n${failures.map((f) => `- ${f}`).join('\n')}` : '## All checks passed',
  '',
].join('\n');
fs.writeFileSync(path.join(out, 'report.md'), md);

if (failures.length) {
  console.error(`\n${failures.length} SEO check(s) failed:\n${failures.map((f) => `  ✗ ${f}`).join('\n')}`);
  process.exit(1);
}
const ENFORCED = CATEGORIES.filter((c) => c !== 'performance');
console.log(`\nAll SEO checks passed: ${URLS.length} pages × Lighthouse ${ENFORCED.join(', ')} = 100, plus crawler, sitemap, robots, llms.txt, security header, redirect and 404 checks.${CATEGORIES.includes('performance') ? ' (Performance is reported, not enforced: it depends on the network the audit runs on.)' : ''}`);
