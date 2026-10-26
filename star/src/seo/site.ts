import type { Lang, PagePath } from '../i18n/lang';
import { pagePath, PAGE_PATHS } from '../i18n/lang';
import { LEGAL } from '../i18n/legalText';
import { siteText } from '../i18n/siteText';

/**
 * Everything a search engine or a link preview reads about nagm.io: each
 * page's title and description in both languages, its canonical address and
 * language alternates, the share card, and the structured data that names
 * Nagm and its social accounts.
 *
 * One source for both the pages pre-rendered at build time
 * (scripts/prerender.mjs) and the head the browser updates on navigation
 * (usePageMeta), so the two can never disagree.
 */
export const SITE_URL = 'https://nagm.io';

/** Nagm's own accounts. Footer icons and the Organization's sameAs both read this. */
export const SOCIAL = [
  { key: 'facebook', label: 'Facebook', url: 'https://www.facebook.com/nagmio2025' },
  { key: 'instagram', label: 'Instagram', url: 'https://www.instagram.com/nagm._2025' },
  { key: 'youtube', label: 'YouTube', url: 'https://www.youtube.com/@Nagm-io' },
  { key: 'x', label: 'X', url: 'https://x.com/Nagm_2025' },
] as const;
export type SocialKey = (typeof SOCIAL)[number]['key'];
const X_HANDLE = '@Nagm_2025';

interface PageCopy { title: string; description: string }

const legal = (doc: 'terms' | 'privacy', lang: Lang, description: string): PageCopy => ({
  title: `${LEGAL[doc][lang].title} | ${lang === 'ar' ? 'نجم' : 'Nagm'}`,
  description,
});

// Titles stay within 60 characters and lead with what people search for;
// descriptions stay under ~155. Search results cut anything longer.
const COPY: Record<PagePath, Record<Lang, PageCopy>> = {
  '/': {
    ar: {
      title: 'نجم | منصة توظيف بالذكاء الاصطناعي للباحثين عن عمل والشركات',
      description: 'نجم منصة توظيف عربية بالذكاء الاصطناعي: ملف مهني وسيرة ذاتية وتحليل توافق للباحثين عن عمل، وأدوات توظيف للشركات في مكان واحد.',
    },
    en: {
      title: 'Nagm | AI hiring platform for job seekers and companies',
      description: 'Nagm is an AI-powered hiring platform: a profile, CV builder and job match analysis for job seekers, plus hiring tools for companies.',
    },
  },
  '/job-seekers': {
    ar: {
      title: 'نجم للباحثين عن عمل | سيرة ذاتية وفحص ATS ووظائف',
      description: 'أنشئ ملفك المهني وسيرتك الذاتية مع نجم، وحلّل توافقك مع متطلبات الوظائف، وتدرّب على المقابلات، وتابع طلباتك في مكان واحد.',
    },
    en: {
      title: 'Nagm for job seekers | CV builder, ATS check and jobs',
      description: 'Build your profile and CV with Nagm, see how well you match a job, practise interviews and track every application in one place.',
    },
  },
  '/companies': {
    ar: {
      title: 'نجم للشركات | نظام توظيف ATS وفرز المرشحين بالذكاء الاصطناعي',
      description: 'انشر وظائفك مع نجم، وراجع المرشحين بتحليل توافق بالذكاء الاصطناعي، وأدِر مراحل التوظيف وفريقك وقاعدة مرشحيك في مكان واحد.',
    },
    en: {
      title: 'Nagm for companies | AI applicant tracking and hiring',
      description: 'Post jobs with Nagm, review candidates with AI match analysis, and run hiring stages, your team and your candidate base in one place.',
    },
  },
  '/pricing': {
    ar: {
      title: 'أسعار نجم | باقات للباحثين عن عمل والشركات',
      description: 'باقات نجم للباحثين عن عمل ومسؤولي التوظيف والشركات: ابدأ مجانًا، ثم ادفع شهريًا أو سنويًا بعملتك في مصر والسعودية والإمارات.',
    },
    en: {
      title: 'Nagm pricing | Plans for job seekers and companies',
      description: 'Nagm plans for job seekers, recruiters and companies: start free, then pay monthly or yearly in your currency in Egypt, Saudi Arabia or the UAE.',
    },
  },
  '/about': {
    ar: {
      title: 'عن نجم | منصة التوظيف العربية بالذكاء الاصطناعي',
      description: 'تعرّف على نجم: منصة توظيف عربية تساعد الباحثين عن عمل على إظهار قدراتهم، وتساعد الشركات على الوصول إلى المرشحين الأنسب.',
    },
    en: {
      title: 'About Nagm | The Arabic-first AI hiring platform',
      description: 'About Nagm: an Arabic-first hiring platform that helps job seekers show what they can do and helps companies find the right candidates.',
    },
  },
  '/terms': {
    ar: legal('terms', 'ar', 'شروط خدمة نجم: القواعد التي تحكم استخدامك لموقع nagm.io وتطبيق app.nagm.io، والحسابات، والاشتراكات والدفع، والمحتوى الذي تنشره.'),
    en: legal('terms', 'en', 'Nagm Terms of Service: the rules for using nagm.io and app.nagm.io, including accounts, subscriptions and payments, and what you post.'),
  },
  '/privacy': {
    ar: legal('privacy', 'ar', 'سياسة خصوصية نجم: ما البيانات التي نجمعها ولماذا، ومع من نشاركها، وكيف نحميها، وحقوقك في الوصول إليها وتصحيحها وحذفها.'),
    en: legal('privacy', 'en', 'Nagm Privacy Policy: what data we collect and why, who we share it with, how we protect it, and your rights to access, correct and delete it.'),
  },
};

export function pageCopy(page: PagePath, lang: Lang): PageCopy {
  return COPY[page][lang];
}

/** Absolute address of `page` in `lang`. */
export const pageUrl = (page: PagePath, lang: Lang) => {
  const path = pagePath(page, lang);
  return path === '/' ? `${SITE_URL}/` : `${SITE_URL}${path}`;
};

/** Every indexable address, for the sitemap and the pre-renderer. */
export const ALL_PAGES: { page: PagePath; lang: Lang }[] = PAGE_PATHS.flatMap((page) => (['ar', 'en'] as const).map((lang) => ({ page, lang })));

/** A <head> element: tag name, attributes, and (for scripts) its text. */
export interface HeadTag { tag: 'meta' | 'link' | 'script'; attrs: Record<string, string>; text?: string }

const BREADCRUMB_HOME: Record<Lang, string> = { ar: 'الرئيسية', en: 'Home' };

/** Pages whose visible questions and answers are also marked up as an FAQPage. */
const FAQ: Partial<Record<PagePath, (lang: Lang) => { q: string; a: string }[]>> = {
  '/': (lang) => siteText[lang].home.faq.items,
  '/pricing': (lang) => siteText[lang].pricing.faq.items,
};
const PAGE_TYPE: Partial<Record<PagePath, string>> = { '/about': 'AboutPage' };

function structuredData(page: PagePath, lang: Lang, copy: PageCopy) {
  const org = {
    '@type': 'Organization',
    '@id': `${SITE_URL}/#organization`,
    name: 'Nagm',
    alternateName: 'نجم',
    url: `${SITE_URL}/`,
    logo: { '@type': 'ImageObject', url: `${SITE_URL}/nagm-mark.png` },
    description: lang === 'ar'
      ? 'نجم منصة توظيف عربية مدعومة بالذكاء الاصطناعي للباحثين عن عمل والشركات ومسؤولي التوظيف.'
      : 'Nagm is an Arabic-first, AI-powered hiring platform for job seekers, companies and recruiters.',
    email: 'support@nagm.io',
    areaServed: ['EG', 'SA', 'AE'].map((c) => ({ '@type': 'Country', name: c })),
    knowsAbout: ['Recruitment', 'Applicant tracking system', 'CV writing', 'ATS resume check', 'Job search', 'Interview preparation'],
    sameAs: SOCIAL.map((s) => s.url),
    contactPoint: [
      { '@type': 'ContactPoint', contactType: 'customer support', email: 'support@nagm.io', availableLanguage: ['Arabic', 'English'] },
      { '@type': 'ContactPoint', contactType: 'sales', email: 'sales@nagm.io', availableLanguage: ['Arabic', 'English'] },
    ],
  };
  const website = {
    '@type': 'WebSite',
    '@id': `${SITE_URL}/#website`,
    url: `${SITE_URL}/`,
    name: lang === 'ar' ? 'نجم' : 'Nagm',
    alternateName: lang === 'ar' ? 'Nagm' : 'نجم',
    inLanguage: ['ar', 'en'],
    publisher: { '@id': org['@id'] },
  };
  const url = pageUrl(page, lang);
  const webpage: Record<string, unknown> = {
    '@type': PAGE_TYPE[page] ?? 'WebPage',
    '@id': `${url}#webpage`,
    url,
    name: copy.title,
    description: copy.description,
    inLanguage: lang,
    isPartOf: { '@id': website['@id'] },
    about: { '@id': org['@id'] },
    primaryImageOfPage: { '@type': 'ImageObject', url: `${SITE_URL}/og/nagm-${lang}.png` },
  };
  const graph: Record<string, unknown>[] = [org, website, webpage];
  const faq = FAQ[page]?.(lang);
  if (faq) {
    graph.push({
      '@type': 'FAQPage',
      '@id': `${url}#faq`,
      inLanguage: lang,
      isPartOf: { '@id': webpage['@id'] },
      mainEntity: faq.map((q) => ({ '@type': 'Question', name: q.q, acceptedAnswer: { '@type': 'Answer', text: q.a } })),
    });
  }
  if (page === '/') {
    // The product itself, for assistants and search engines comparing tools.
    graph.push({
      '@type': 'WebApplication',
      '@id': `${SITE_URL}/#app`,
      name: lang === 'ar' ? 'نجم' : 'Nagm',
      url: 'https://app.nagm.io/',
      applicationCategory: 'BusinessApplication',
      applicationSubCategory: lang === 'ar' ? 'منصة توظيف ونظام تتبع المتقدمين (ATS)' : 'Hiring platform and applicant tracking system (ATS)',
      operatingSystem: 'Web',
      inLanguage: ['ar', 'en'],
      description: copy.description,
      publisher: { '@id': org['@id'] },
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD', description: lang === 'ar' ? 'باقات مجانية للباحثين عن عمل ومسؤولي التوظيف والشركات' : 'Free plans for job seekers, recruiters and companies', url: pageUrl('/pricing', lang) },
    });
  }
  if (page !== '/') {
    const crumbs = {
      '@type': 'BreadcrumbList',
      '@id': `${url}#breadcrumb`,
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: BREADCRUMB_HOME[lang], item: pageUrl('/', lang) },
        { '@type': 'ListItem', position: 2, name: copy.title.split(' | ')[0], item: url },
      ],
    };
    webpage.breadcrumb = { '@id': crumbs['@id'] };
    graph.push(crumbs);
  }
  return { '@context': 'https://schema.org', '@graph': graph };
}

/** The <head> tags for `page` in `lang`, besides <title>. */
export function headTags(page: PagePath, lang: Lang): HeadTag[] {
  const copy = pageCopy(page, lang);
  const url = pageUrl(page, lang);
  const image = `${SITE_URL}/og/nagm-${lang}.png`;
  const imageAlt = lang === 'ar' ? 'نجم — منصة توظيف مدعومة بالذكاء الاصطناعي' : 'Nagm — AI-powered hiring platform';
  const meta = (key: 'name' | 'property', k: string, content: string): HeadTag => ({ tag: 'meta', attrs: { [key]: k, content } });
  return [
    meta('name', 'description', copy.description),
    meta('name', 'robots', 'index, follow, max-image-preview:large'),
    { tag: 'link', attrs: { rel: 'canonical', href: url } },
    { tag: 'link', attrs: { rel: 'alternate', hreflang: 'ar', href: pageUrl(page, 'ar') } },
    { tag: 'link', attrs: { rel: 'alternate', hreflang: 'en', href: pageUrl(page, 'en') } },
    { tag: 'link', attrs: { rel: 'alternate', hreflang: 'x-default', href: pageUrl(page, 'ar') } },
    meta('property', 'og:type', 'website'),
    meta('property', 'og:site_name', lang === 'ar' ? 'نجم' : 'Nagm'),
    meta('property', 'og:title', copy.title),
    meta('property', 'og:description', copy.description),
    meta('property', 'og:url', url),
    meta('property', 'og:locale', lang === 'ar' ? 'ar_AR' : 'en_US'),
    meta('property', 'og:locale:alternate', lang === 'ar' ? 'en_US' : 'ar_AR'),
    meta('property', 'og:image', image),
    meta('property', 'og:image:width', '1200'),
    meta('property', 'og:image:height', '630'),
    meta('property', 'og:image:alt', imageAlt),
    meta('name', 'twitter:card', 'summary_large_image'),
    meta('name', 'twitter:site', X_HANDLE),
    meta('name', 'twitter:title', copy.title),
    meta('name', 'twitter:description', copy.description),
    meta('name', 'twitter:image', image),
    meta('name', 'twitter:image:alt', imageAlt),
    { tag: 'script', attrs: { type: 'application/ld+json' }, text: JSON.stringify(structuredData(page, lang, copy)) },
  ];
}

const escapeAttr = (v: string) => v.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');
// Inside <script>, only "</" can end the element early.
const escapeScript = (v: string) => v.replace(/<\//g, '<\\/');

/** The same tags as HTML, marked so the browser can replace them on navigation. */
export function headHtml(page: PagePath, lang: Lang): string {
  const copy = pageCopy(page, lang);
  const tags = headTags(page, lang).map(({ tag, attrs, text }) => {
    const a = Object.entries(attrs).map(([k, v]) => ` ${k}="${escapeAttr(v)}"`).join('');
    return tag === 'script' ? `<script data-seo${a}>${escapeScript(text ?? '')}</script>` : `<${tag} data-seo${a} />`;
  });
  return [`<title>${escapeAttr(copy.title)}</title>`, ...tags].join('\n    ');
}
