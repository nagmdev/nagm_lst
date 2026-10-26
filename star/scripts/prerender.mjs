#!/usr/bin/env node
/**
 * Pre-render nagm.io's marketing pages after `vite build`.
 *
 * Every page, in Arabic and English, becomes a real HTML file with its own
 * title, description, canonical address, language alternates, share card,
 * structured data and its full content, so search engines and link previews
 * read it without running JavaScript. The browser then hydrates it.
 *
 *   dist/index.html, dist/pricing.html, …        Arabic   (/ , /pricing …)
 *   dist/en.html, dist/en/pricing.html, …        English  (/en, /en/pricing …)
 *   dist/404.html                                 any unknown address (noindex)
 *   dist/app.html                                 sign-in pages, rendered in the browser (noindex)
 *   dist/sitemap.xml                              every page with its alternates
 *   dist/llms.txt, dist/llms-full.txt             the site for AI assistants (llmstxt.org)
 *
 * Every HTML file also gets the page's Content Security Policy as a <meta>:
 * it names the API this build talks to, which only the build knows. The
 * frame-ancestors part, which a <meta> can't carry, is a header (vercel.json).
 *
 * Needs the server bundle: vite build --ssr src/entry-server.tsx --outDir dist-ssr
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { createHash } from 'node:crypto';
import { JSDOM } from 'jsdom';
import Beasties from 'beasties';

// React and the router pick their production builds from this.
process.env.NODE_ENV ??= 'production';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const dist = path.join(root, 'dist');
const ssr = await import(pathToFileURL(path.join(root, 'dist-ssr', 'entry-server.js')).href);
const { render, headHtml, ALL_PAGES, pageUrl, pageCopy, pagePath, llmsTxt, API_BASE } = ssr;

const template = fs.readFileSync(path.join(dist, 'index.html'), 'utf8');
const SEO_BLOCK = /<!-- seo:start[\s\S]*?<!-- seo:end -->/;
if (!SEO_BLOCK.test(template) || !template.includes('<div id="root"></div>')) {
  throw new Error('prerender: index.html is missing the seo markers or the empty #root');
}

// boot.js (theme before first paint) goes inline: one request fewer before the
// page can draw. The CSP allows exactly that script, by its hash.
const BOOT = fs.readFileSync(path.join(dist, 'boot.js'), 'utf8');
const BOOT_HASH = `'sha256-${createHash('sha256').update(BOOT).digest('base64')}'`;

// The API origin baked into this build (VITE_BACKEND_API), or same-origin for a relative one.
const apiOrigin = /^https?:/.test(API_BASE) ? new URL(API_BASE).origin : '';
const CSP = [
  "default-src 'self'",
  `script-src 'self' ${BOOT_HASH}`,
  // React writes style="" attributes; no inline <style> or script is needed.
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: https:",
  "font-src 'self' data:",
  `connect-src 'self'${apiOrigin ? ` ${apiOrigin}` : ''}`,
  "manifest-src 'self'",
  "base-uri 'self'",
  "object-src 'none'",
  "form-action 'self'",
].join('; ');
const harden = (html) => html
  .replace('<meta charset="UTF-8" />', `<meta charset="UTF-8" />\n    <meta http-equiv="Content-Security-Policy" content="${CSP}" />`)
  .replace('<script src="/boot.js"></script>', `<script>${BOOT}</script>`);

// The CSS the first screen needs goes inline; the full stylesheet still loads,
// from the end of <body>, so it no longer holds up the first paint. No JS
// loader is involved, which the CSP would refuse.
const beasties = new Beasties({ path: dist, publicPath: '/', preload: 'body', pruneSource: false, reduceInlineStyles: false, logLevel: 'warn', inlineFonts: true, preloadFonts: false });

// The Arabic body and heading fonts, fetched alongside the CSS rather than
// after it: an Arabic page otherwise paints in a fallback font and jumps when
// these arrive (a large layout shift). English text keeps its first paint.
const assets = fs.readdirSync(path.join(dist, 'assets'));
const fontFile = (re) => {
  const f = assets.find((a) => re.test(a));
  if (!f) throw new Error(`prerender: no font file matches ${re}`);
  return `<link rel="preload" href="/assets/${f}" as="font" type="font/woff2" crossorigin />`;
};
const PRELOAD = {
  ar: [fontFile(/^ibm-plex-sans-arabic-arabic-400-normal-.*\.woff2$/), fontFile(/^noto-kufi-arabic-arabic-700-normal-.*\.woff2$/)].join('\n    '),
  en: '',
};

function page({ head, lang, url, body }) {
  return harden(template)
    .replace(/<html lang="[^"]*" dir="[^"]*">/, lang === 'ar' ? '<html lang="ar" dir="rtl" class="rtl">' : '<html lang="en" dir="ltr">')
    .replace(SEO_BLOCK, PRELOAD[lang] ? `${head}\n    ${PRELOAD[lang]}` : head)
    .replace('<div id="root"></div>', `<div id="root"${url ? ` data-prerendered="${url}"` : ''}>${body}</div>`);
}

const fileFor = (url) => (url === '/' ? 'index.html' : `${url.slice(1)}.html`);
const inlineCritical = async (html) => beasties.process(html);
const write = (file, html) => {
  const out = path.join(dist, file);
  fs.mkdirSync(path.dirname(out), { recursive: true });
  fs.writeFileSync(out, html);
};

// The sign-in pages share one shell the browser renders; keep it out of search.
const noindex = '<meta name="robots" content="noindex" />';
write('app.html', harden(template).replace(SEO_BLOCK, (block) => `${block}\n    ${noindex}`));

/** A page's readable text as Markdown: headings, paragraphs, list items, questions. Illustrations are left out. */
function pageText(body) {
  const main = new JSDOM(body).window.document.querySelector('main');
  if (!main) return '';
  main.querySelectorAll('[aria-hidden="true"], [class*="nm-"], svg, button, nav').forEach((el) => el.remove());
  const lines = [];
  for (const el of main.querySelectorAll('h1, h2, h3, h4, p, li, summary')) {
    const text = el.textContent.replace(/\s+/g, ' ').trim();
    if (!text || (el.tagName === 'P' && el.closest('li'))) continue;
    const line = /^H[1-4]$/.test(el.tagName) ? `${'#'.repeat(Number(el.tagName[1]) + 1)} ${text}`
      : el.tagName === 'LI' ? `- ${text}`
        : el.tagName === 'SUMMARY' ? `**${text}**`
          : text;
    if (lines[lines.length - 1] !== line) lines.push(line);
  }
  return lines.join('\n\n');
}

const fullText = [];
for (const { page: p, lang } of ALL_PAGES) {
  const url = pagePath(p, lang);
  const body = render(url, lang);
  if (!body.includes('<h1')) throw new Error(`prerender: ${url} rendered without an <h1>`);
  write(fileFor(url), await inlineCritical(page({ head: headHtml(p, lang), lang, url, body })));
  fullText.push(`# ${pageCopy(p, lang).title}\n\nURL: ${pageUrl(p, lang)}\n\n${pageText(body)}`);
}

write('llms.txt', llmsTxt());
write('llms-full.txt', `${['# Nagm (نجم) — the full text of nagm.io', '', `> Every page in Arabic and English. Summary and links: ${pageUrl('/', 'ar')}llms.txt`, ''].join('\n')}\n${fullText.join('\n\n---\n\n')}\n`);

write('404.html', page({
  head: `<title>الصفحة غير موجودة — نجم</title>\n    ${noindex}`,
  lang: 'ar',
  url: '',
  body: render('/404', 'ar'),
}));

const today = new Date().toISOString().slice(0, 10);
const byPage = [...new Set(ALL_PAGES.map((x) => x.page))];
const sitemap = [
  '<?xml version="1.0" encoding="UTF-8"?>',
  '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">',
  ...byPage.flatMap((p) => ['ar', 'en'].map((lang) => [
    '  <url>',
    `    <loc>${pageUrl(p, lang)}</loc>`,
    `    <lastmod>${today}</lastmod>`,
    `    <xhtml:link rel="alternate" hreflang="ar" href="${pageUrl(p, 'ar')}" />`,
    `    <xhtml:link rel="alternate" hreflang="en" href="${pageUrl(p, 'en')}" />`,
    `    <xhtml:link rel="alternate" hreflang="x-default" href="${pageUrl(p, 'ar')}" />`,
    '  </url>',
  ].join('\n'))),
  '</urlset>',
  '',
].join('\n');
write('sitemap.xml', sitemap);

console.log(`prerender: ${ALL_PAGES.length} pages, 404.html, app.html, sitemap.xml, llms.txt, llms-full.txt (connect-src ${apiOrigin || "'self'"})`);
