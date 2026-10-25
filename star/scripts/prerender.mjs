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
 *
 * Needs the server bundle: vite build --ssr src/entry-server.tsx --outDir dist-ssr
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

// React and the router pick their production builds from this.
process.env.NODE_ENV ??= 'production';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const dist = path.join(root, 'dist');
const ssr = await import(pathToFileURL(path.join(root, 'dist-ssr', 'entry-server.js')).href);
const { render, headHtml, ALL_PAGES, pageUrl, pagePath } = ssr;

const template = fs.readFileSync(path.join(dist, 'index.html'), 'utf8');
const SEO_BLOCK = /<!-- seo:start[\s\S]*?<!-- seo:end -->/;
if (!SEO_BLOCK.test(template) || !template.includes('<div id="root"></div>')) {
  throw new Error('prerender: index.html is missing the seo markers or the empty #root');
}

function page({ head, lang, url, body }) {
  return template
    .replace(/<html lang="[^"]*" dir="[^"]*">/, lang === 'ar' ? '<html lang="ar" dir="rtl" class="rtl">' : '<html lang="en" dir="ltr">')
    .replace(SEO_BLOCK, head)
    .replace('<div id="root"></div>', `<div id="root"${url ? ` data-prerendered="${url}"` : ''}>${body}</div>`);
}

const fileFor = (url) => (url === '/' ? 'index.html' : `${url.slice(1)}.html`);
const write = (file, html) => {
  const out = path.join(dist, file);
  fs.mkdirSync(path.dirname(out), { recursive: true });
  fs.writeFileSync(out, html);
};

// The sign-in pages share one shell the browser renders; keep it out of search.
const noindex = '<meta name="robots" content="noindex" />';
write('app.html', template.replace(SEO_BLOCK, (block) => `${block}\n    ${noindex}`));

for (const { page: p, lang } of ALL_PAGES) {
  const url = pagePath(p, lang);
  const body = render(url, lang);
  if (!body.includes('<h1')) throw new Error(`prerender: ${url} rendered without an <h1>`);
  write(fileFor(url), page({ head: headHtml(p, lang), lang, url, body }));
}

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

console.log(`prerender: ${ALL_PAGES.length} pages, 404.html, app.html, sitemap.xml`);
