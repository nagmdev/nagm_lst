import { describe, it, expect } from 'vitest';
import { llmsTxt } from './llms';
import { ALL_PAGES, pageUrl, SOCIAL } from './site';

describe('/llms.txt', () => {
  const txt = llmsTxt();

  it('follows llmstxt.org: a title, a one-line summary, then linked sections', () => {
    expect(txt.split('\n')[0]).toBe('# Nagm (نجم)');
    expect(txt).toMatch(/^> .{60,}$/m);
    expect(txt).toMatch(/^## Pages \(English\)$/m);
    expect(txt).toMatch(/^## Optional$/m);
  });

  it('links every page in both languages, the social accounts and the full text', () => {
    for (const { page, lang } of ALL_PAGES) expect(txt).toContain(`](${pageUrl(page, lang)}):`);
    for (const s of SOCIAL) expect(txt).toContain(s.url);
    expect(txt).toContain('https://nagm.io/llms-full.txt');
  });

  it('answers the common questions in both languages', () => {
    expect(txt).toContain('### What is Nagm?');
    expect(txt).toContain('### ما هو نجم؟');
  });
});
