import type { Lang } from '../i18n/lang';
import { siteText } from '../i18n/siteText';
import { ALL_PAGES, SITE_URL, SOCIAL, pageCopy, pageUrl } from './site';

/**
 * /llms.txt: a short, plain-text map of nagm.io for AI assistants and the
 * crawlers that feed them (the llmstxt.org convention), built from the same
 * copy as the pages so it never drifts from them. /llms-full.txt carries the
 * full text of every page (scripts/prerender.mjs).
 */
export function llmsTxt(): string {
  const pages = (lang: Lang) => ALL_PAGES.filter((p) => p.lang === lang)
    .map(({ page }) => `- [${pageCopy(page, lang).title}](${pageUrl(page, lang)}): ${pageCopy(page, lang).description}`);
  const faq = (lang: Lang) => siteText[lang].home.faq.items.map((q) => `### ${q.q}\n${q.a}`);
  return [
    '# Nagm (نجم)',
    '',
    `> ${pageCopy('/', 'en').description}`,
    '',
    'Nagm is used by job seekers to build a professional profile and CV, check how well their CV matches a job (ATS check), practise interviews and apply to jobs; and by companies and independent recruiters to post jobs, review applicants with AI match analysis, run hiring stages as a team and track hiring analytics.',
    '',
    '- Website: https://nagm.io (Arabic) and https://nagm.io/en (English)',
    '- App: https://app.nagm.io (sign-in, jobs board, candidate and hiring workspaces)',
    '- Markets: Egypt (EGP), Saudi Arabia (SAR), United Arab Emirates (AED); US dollars elsewhere',
    '- Languages: Arabic (default, right-to-left) and English',
    '- Contact: support@nagm.io (support), sales@nagm.io (sales)',
    `- Social: ${SOCIAL.map((s) => `[${s.label}](${s.url})`).join(', ')}`,
    '',
    '## Pages (English)',
    ...pages('en'),
    '',
    '## الصفحات (العربية)',
    ...pages('ar'),
    '',
    '## Frequently asked questions',
    ...faq('en'),
    '',
    '## أسئلة شائعة',
    ...faq('ar'),
    '',
    '## Optional',
    `- [Full text of every page](${SITE_URL}/llms-full.txt)`,
    `- [Sitemap](${SITE_URL}/sitemap.xml)`,
    '',
  ].join('\n');
}
