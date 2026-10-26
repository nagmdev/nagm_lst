import { describe, it, expect } from 'vitest';
import { ALL_PAGES, SOCIAL, headHtml, headTags, pageCopy, pageUrl } from './site';

const attr = (tags: ReturnType<typeof headTags>, match: Record<string, string>, key: string) =>
  tags.find((t) => Object.entries(match).every(([k, v]) => t.attrs[k] === v))?.attrs[key];

describe('what search engines read about each page', () => {
  it.each(ALL_PAGES)('$page ($lang): a title and description that fit in a search result', ({ page, lang }) => {
    const { title, description } = pageCopy(page, lang);
    expect(title.length).toBeGreaterThanOrEqual(15);
    expect(title.length).toBeLessThanOrEqual(60);
    expect(description.length).toBeGreaterThanOrEqual(70);
    expect(description.length).toBeLessThanOrEqual(160);
  });

  it('gives every page its own title and description', () => {
    const titles = ALL_PAGES.map(({ page, lang }) => pageCopy(page, lang).title);
    const descriptions = ALL_PAGES.map(({ page, lang }) => pageCopy(page, lang).description);
    expect(new Set(titles).size).toBe(titles.length);
    expect(new Set(descriptions).size).toBe(descriptions.length);
  });

  it.each(ALL_PAGES)('$page ($lang): canonical, both languages and a default', ({ page, lang }) => {
    const tags = headTags(page, lang);
    expect(attr(tags, { rel: 'canonical' }, 'href')).toBe(pageUrl(page, lang));
    expect(attr(tags, { rel: 'alternate', hreflang: 'ar' }, 'href')).toBe(pageUrl(page, 'ar'));
    expect(attr(tags, { rel: 'alternate', hreflang: 'en' }, 'href')).toBe(pageUrl(page, 'en'));
    expect(attr(tags, { rel: 'alternate', hreflang: 'x-default' }, 'href')).toBe(pageUrl(page, 'ar'));
    expect(attr(tags, { property: 'og:url' }, 'content')).toBe(pageUrl(page, lang));
    expect(attr(tags, { property: 'og:image' }, 'content')).toBe(`https://nagm.io/og/nagm-${lang}.png`);
  });

  it('uses absolute addresses: the Arabic home at /, English under /en', () => {
    expect(pageUrl('/', 'ar')).toBe('https://nagm.io/');
    expect(pageUrl('/', 'en')).toBe('https://nagm.io/en');
    expect(pageUrl('/pricing', 'en')).toBe('https://nagm.io/en/pricing');
  });

  it('names Nagm and links its four social accounts in the structured data', () => {
    const ld = JSON.parse(headTags('/about', 'en').find((t) => t.tag === 'script')!.text!);
    const org = ld['@graph'].find((n: { '@type': string }) => n['@type'] === 'Organization');
    expect(org.sameAs).toEqual(SOCIAL.map((s) => s.url));
    expect(SOCIAL.map((s) => s.url)).toEqual([
      'https://www.facebook.com/nagmio2025',
      'https://www.instagram.com/nagm._2025',
      'https://www.youtube.com/@Nagm-io',
      'https://x.com/Nagm_2025',
    ]);
    expect(ld['@graph'].map((n: { '@type': string }) => n['@type'])).toEqual(['Organization', 'WebSite', 'AboutPage', 'BreadcrumbList']);
    expect(org.areaServed.map((c: { name: string }) => c.name)).toEqual(['EG', 'SA', 'AE']);
  });

  it.each(['ar', 'en'] as const)('marks up the visible questions on the home and pricing pages as an FAQPage (%s)', (lang) => {
    for (const page of ['/', '/pricing'] as const) {
      const ld = JSON.parse(headTags(page, lang).find((t) => t.tag === 'script')!.text!);
      const faq = ld['@graph'].find((n: { '@type': string }) => n['@type'] === 'FAQPage');
      expect(faq.mainEntity.length).toBeGreaterThanOrEqual(5);
      for (const q of faq.mainEntity) {
        expect(q['@type']).toBe('Question');
        expect(q.acceptedAnswer.text.length).toBeGreaterThan(40);
      }
    }
    const home = JSON.parse(headTags('/', lang).find((t) => t.tag === 'script')!.text!);
    expect(home['@graph'].some((n: { '@type': string }) => n['@type'] === 'WebApplication')).toBe(true);
  });

  it('writes head HTML a quote or a closing tag cannot break out of', () => {
    const html = headHtml('/', 'ar');
    expect(html).toMatch(/^<title>[^<]+<\/title>/);
    expect(html).not.toMatch(/<\/script>[\s\S]*<\/script>[\s\S]*<\/script>/);
    expect(html.match(/<script /g)).toHaveLength(1);
  });
});
