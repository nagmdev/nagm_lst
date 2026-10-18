import { api } from '../auth';
import type { Lang } from '../i18n/lang';

/**
 * The plan catalog as the site knows it. The API's `/billing/catalog` is the
 * source of truth (prices are edited from the admin); this file is the list
 * the page shows while that request is in flight or when it fails, and the
 * feature matrix the API does not carry. Keep the two in step: the numbers
 * below are the owner's approved list prices (Oct 2026), VAT-inclusive in
 * EG/SA/AE and in minor units (piastres, halalas, fils, cents).
 */

export type Market = 'EG' | 'SA' | 'AE' | 'INTL';
export type Audience = 'CANDIDATE' | 'RECRUITER' | 'COMPANY';
export type Interval = 'MONTH' | 'YEAR';
export type Provider = 'paymob' | 'tamara' | 'manual';

export const MARKETS: Market[] = ['EG', 'SA', 'AE', 'INTL'];
export const MARKET_META: Record<Market, { currency: string; vatBps: number; locale: string; tamara: boolean }> = {
  EG: { currency: 'EGP', vatBps: 1400, locale: 'ar-EG', tamara: false },
  SA: { currency: 'SAR', vatBps: 1500, locale: 'ar-SA', tamara: true },
  AE: { currency: 'AED', vatBps: 500, locale: 'ar-AE', tamara: true },
  INTL: { currency: 'USD', vatBps: 0, locale: 'en', tamara: false },
};

export interface PlanDef {
  id: string;
  audience: Audience;
  tier: number;
  name: { ar: string; en: string };
  blurb: { ar: string; en: string };
  /** Monthly price per market in minor units; `null` = free; absent = quote. */
  monthly?: Record<Market, number> | null;
  featured?: boolean;
  /** Bullet list on the card. */
  points: { ar: string[]; en: string[] };
  /** Values for the comparison table, keyed by FEATURES ids. */
  matrix: Record<string, number | boolean | null | string>;
}

export const FEATURES: { id: string; audience: Audience; label: { ar: string; en: string } }[] = [
  { id: 'aiUses', audience: 'CANDIDATE', label: { ar: 'استخدامات الذكاء الاصطناعي شهريًا (فحص ATS، ملخص، توافق)', en: 'AI uses per month (ATS check, summary, match)' } },
  { id: 'cvVersions', audience: 'CANDIDATE', label: { ar: 'نسخ السيرة الذاتية المحفوظة', en: 'Saved CV versions' } },
  { id: 'shareLinks', audience: 'CANDIDATE', label: { ar: 'روابط مشاركة الملف', en: 'Profile share links' } },
  { id: 'matchAnalysis', audience: 'CANDIDATE', label: { ar: 'تحليل التوافق التفصيلي مع التوصيات', en: 'Detailed match analysis with recommendations' } },
  { id: 'interview', audience: 'CANDIDATE', label: { ar: 'التدريب على المقابلات ومكتبة الإجابات', en: 'Interview practice and answer library' } },
  { id: 'activeJobs', audience: 'COMPANY', label: { ar: 'الوظائف النشطة', en: 'Active jobs' } },
  { id: 'seats', audience: 'COMPANY', label: { ar: 'مقاعد الفريق', en: 'Team seats' } },
  { id: 'aiMatches', audience: 'COMPANY', label: { ar: 'مطابقات بالذكاء الاصطناعي شهريًا', en: 'AI matches per month' } },
  { id: 'analytics', audience: 'COMPANY', label: { ar: 'تحليلات التوظيف', en: 'Hiring analytics' } },
  { id: 'export', audience: 'COMPANY', label: { ar: 'تصدير المتقدمين إلى Excel', en: 'Export applicants to Excel' } },
  { id: 'rediscovery', audience: 'COMPANY', label: { ar: 'إعادة اكتشاف المرشحين السابقين', en: 'Rediscover past applicants' } },
  { id: 'verified', audience: 'COMPANY', label: { ar: 'شارة الشركة الموثّقة (بعد التوثيق)', en: 'Verified company badge (after verification)' } },
  { id: 'api', audience: 'COMPANY', label: { ar: 'واجهة برمجية وتكاملات', en: 'API and integrations' } },
  { id: 'support', audience: 'COMPANY', label: { ar: 'دعم بأولوية', en: 'Priority support' } },
];

const P = (usd: number, eg: number, sa: number, ae: number): Record<Market, number> => ({ INTL: usd, EG: eg, SA: sa, AE: ae });

export const PLANS: PlanDef[] = [
  {
    id: 'CANDIDATE_FREE', audience: 'CANDIDATE', tier: 0, monthly: null,
    name: { ar: 'مجاني', en: 'Free' },
    blurb: { ar: 'خطوتك الأولى لبناء حضورك المهني والتقديم على الوظائف.', en: 'Your first step to building a professional presence and applying to jobs.' },
    points: { ar: ['إنشاء السيرة الذاتية.', 'تحليل ATS أساسي.', 'التقديم على الوظائف.'], en: ['CV builder.', 'Basic ATS check.', 'Apply to jobs.'] },
    matrix: { aiUses: 3, cvVersions: 2, shareLinks: 1, matchAnalysis: false, interview: 'limited' },
  },
  {
    id: 'CANDIDATE_PRO', audience: 'CANDIDATE', tier: 1, monthly: P(500, 24900, 1900, 1900), featured: true,
    name: { ar: 'المحترف', en: 'Pro' },
    blurb: { ar: 'أدوات إضافية لتجهيز ملفك المهني والاستفادة من الذكاء الاصطناعي.', en: 'Extra tools to prepare your profile and get more from AI.' },
    points: { ar: ['خيارات إضافية لإنشاء السيرة الذاتية.', 'أدوات الذكاء الاصطناعي للملف المهني.', 'مشاركة الملف والسيرة الذاتية.', 'تحليل التوافق التفصيلي مع التوصيات.'], en: ['Additional CV builder options.', 'AI tools for your profile.', 'Profile and CV sharing.', 'Detailed match analysis with recommendations.'] },
    matrix: { aiUses: 20, cvVersions: 10, shareLinks: 5, matchAnalysis: true, interview: 'full' },
  },
  {
    id: 'CANDIDATE_PLUS', audience: 'CANDIDATE', tier: 2, monthly: P(1200, 59900, 4500, 4500),
    name: { ar: 'المسار المهني+', en: 'Career Plus' },
    blurb: { ar: 'لمن يبحث بجدية: حدود أعلى، ونسخ وروابط بلا قيود، ودعم بأولوية.', en: 'For the serious search: higher limits, unlimited versions and links, priority support.' },
    points: { ar: ['كل ما في المحترف.', '60 استخدامًا للذكاء الاصطناعي شهريًا.', 'نسخ سيرة وروابط مشاركة بلا حد.', 'دعم بأولوية.'], en: ['Everything in Pro.', '60 AI uses a month.', 'Unlimited CV versions and share links.', 'Priority support.'] },
    matrix: { aiUses: 60, cvVersions: null, shareLinks: null, matchAnalysis: true, interview: 'full' },
  },
  {
    id: 'RECRUITER_FREE', audience: 'RECRUITER', tier: 0, monthly: null,
    name: { ar: 'مجاني', en: 'Free' },
    blurb: { ar: 'جرّب نجم بوظيفة واحدة ومساحة عمل شخصية.', en: 'Try Nagm with one job and a personal workspace.' },
    points: { ar: ['وظيفة نشطة واحدة.', '10 مطابقات بالذكاء الاصطناعي شهريًا.', 'مراجعة المتقدمين ومراحل التوظيف.'], en: ['One active job.', '10 AI matches a month.', 'Applicant review and hiring stages.'] },
    matrix: { activeJobs: 1, seats: 1, aiMatches: 10, analytics: false, export: false, rediscovery: false, verified: false, api: false, support: false },
  },
  {
    id: 'RECRUITER_PRO', audience: 'RECRUITER', tier: 1, monthly: P(2900, 145000, 10900, 10900), featured: true,
    name: { ar: 'المحترف', en: 'Pro' },
    blurb: { ar: 'لمسؤول التوظيف المستقل الذي يدير عدة وظائف في وقت واحد.', en: 'For the independent recruiter running several roles at once.' },
    points: { ar: ['5 وظائف نشطة.', '100 مطابقة بالذكاء الاصطناعي شهريًا.', 'تحليلات التوظيف وتصدير المتقدمين.', 'مساعدة الذكاء الاصطناعي في تجهيز الوظائف.'], en: ['5 active jobs.', '100 AI matches a month.', 'Hiring analytics and applicant export.', 'AI help preparing jobs.'] },
    matrix: { activeJobs: 5, seats: 1, aiMatches: 100, analytics: true, export: true, rediscovery: false, verified: false, api: false, support: false },
  },
  {
    id: 'RECRUITER_ADVANCED', audience: 'RECRUITER', tier: 2, monthly: P(7900, 395000, 29900, 29000),
    name: { ar: 'المتقدم', en: 'Advanced' },
    blurb: { ar: 'لوكالات التوظيف الصغيرة وحجم بحث أكبر.', en: 'For small agencies and a bigger search volume.' },
    points: { ar: ['15 وظيفة نشطة.', '400 مطابقة بالذكاء الاصطناعي شهريًا.', 'إعادة اكتشاف المرشحين السابقين.', 'دعم بأولوية.'], en: ['15 active jobs.', '400 AI matches a month.', 'Rediscover past applicants.', 'Priority support.'] },
    matrix: { activeJobs: 15, seats: 1, aiMatches: 400, analytics: true, export: true, rediscovery: true, verified: false, api: false, support: true },
  },
  {
    id: 'COMPANY_FREE', audience: 'COMPANY', tier: 0, monthly: null,
    name: { ar: 'مجاني', en: 'Free' },
    blurb: { ar: 'ابدأ بوظيفة واحدة ومساحة عمل لشركتك.', en: 'Start with one job and a workspace for your company.' },
    points: { ar: ['وظيفة نشطة واحدة ومقعد واحد.', '10 مطابقات بالذكاء الاصطناعي شهريًا.', 'صفحة شركة عامة ومسار التوثيق.'], en: ['One active job and one seat.', '10 AI matches a month.', 'Public company page and the verification path.'] },
    matrix: { activeJobs: 1, seats: 1, aiMatches: 10, analytics: false, export: false, rediscovery: false, verified: true, api: false, support: false },
  },
  {
    id: 'COMPANY_STARTER', audience: 'COMPANY', tier: 1, monthly: P(4900, 245000, 18500, 18000),
    name: { ar: 'البداية', en: 'Starter' },
    blurb: { ar: 'للشركات الصغيرة التي توظّف بضع وظائف في السنة.', en: 'For small companies hiring a few roles a year.' },
    points: { ar: ['3 وظائف نشطة ومقعدان.', '100 مطابقة بالذكاء الاصطناعي شهريًا.', 'تحليلات التوظيف.', 'مساعدة الذكاء الاصطناعي في تجهيز الوظائف.'], en: ['3 active jobs and 2 seats.', '100 AI matches a month.', 'Hiring analytics.', 'AI help preparing jobs.'] },
    matrix: { activeJobs: 3, seats: 2, aiMatches: 100, analytics: true, export: false, rediscovery: false, verified: true, api: false, support: false },
  },
  {
    id: 'COMPANY_GROWTH', audience: 'COMPANY', tier: 2, monthly: P(12000, 599000, 44900, 43900), featured: true,
    name: { ar: 'النمو', en: 'Growth' },
    blurb: { ar: 'مساحة تجمع وظائفك ومرشحيك وأدوات فريق التوظيف.', en: 'One workspace for your jobs, candidates and hiring-team tools.' },
    points: { ar: ['15 وظيفة نشطة و5 مقاعد.', '500 مطابقة بالذكاء الاصطناعي شهريًا.', 'البحث في قاعدة متقدمي الشركة وإعادة الاكتشاف.', 'تصدير المتقدمين وإدارة الأدوار والصلاحيات.'], en: ['15 active jobs and 5 seats.', '500 AI matches a month.', 'Search your applicant base and rediscover candidates.', 'Applicant export, roles and permissions.'] },
    matrix: { activeJobs: 15, seats: 5, aiMatches: 500, analytics: true, export: true, rediscovery: true, verified: true, api: false, support: false },
  },
  {
    id: 'COMPANY_BUSINESS', audience: 'COMPANY', tier: 3, monthly: P(29900, 1490000, 112000, 109900),
    name: { ar: 'الأعمال', en: 'Business' },
    blurb: { ar: 'لفرق التوظيف التي تدير عشرات الوظائف وتحتاج تكاملات.', en: 'For hiring teams running dozens of roles and needing integrations.' },
    points: { ar: ['50 وظيفة نشطة و15 مقعدًا.', '2,000 مطابقة بالذكاء الاصطناعي شهريًا.', 'واجهة برمجية وتكاملات.', 'دعم بأولوية.'], en: ['50 active jobs and 15 seats.', '2,000 AI matches a month.', 'API and integrations.', 'Priority support.'] },
    matrix: { activeJobs: 50, seats: 15, aiMatches: 2000, analytics: true, export: true, rediscovery: true, verified: true, api: true, support: true },
  },
  {
    id: 'COMPANY_ENTERPRISE', audience: 'COMPANY', tier: 4,
    name: { ar: 'المؤسسات', en: 'Enterprise' },
    blurb: { ar: 'ناقش احتياجات شركتك من الوظائف وأعضاء الفريق ومساحات العمل، واحصل على عرض يناسب نطاق استخدامك.', en: "Talk through your company's needs for jobs, team members and workspaces, and get a quote that fits your scale of use." },
    points: { ar: ['حدّد حجم التوظيف المتوقع.', 'ناقش عدد المستخدمين ومساحات العمل.', 'تعرّف على الخيارات المناسبة لفريقك.', 'احصل على عرض واضح النطاق والتكلفة.'], en: ['Define your expected hiring volume.', 'Discuss the number of users and workspaces.', 'Explore the options that suit your team.', 'Get a quote with clear scope and cost.'] },
    matrix: { activeJobs: null, seats: null, aiMatches: null, analytics: true, export: true, rediscovery: true, verified: true, api: true, support: true },
  },
];

/** Yearly = 12 months less 20%, rounded to the major unit. */
export const yearlyMinor = (monthlyMinor: number) => Math.round((monthlyMinor * 12 * 0.8) / 100) * 100;

const CURRENCY_LABEL: Record<Market, { ar: string; en: string }> = {
  EG: { ar: 'ج.م', en: 'EGP' },
  SA: { ar: 'ر.س', en: 'SAR' },
  AE: { ar: 'د.إ', en: 'AED' },
  INTL: { ar: '$', en: '$' },
};

/** Number and currency as separate parts, so a card can size them apart. */
export function moneyParts(minor: number, market: Market, lang: Lang): { amount: string; currency: string; prefix: boolean } {
  const major = minor / 100;
  const amount = major.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: Number.isInteger(major) ? 0 : 2 });
  const currency = CURRENCY_LABEL[market][lang];
  // "$5" everywhere; "SAR 449" in English; "449 ر.س" in Arabic.
  const prefix = market === 'INTL' || lang === 'en';
  return { amount, currency, prefix };
}

export function formatMoney(minor: number, market: Market, lang: Lang): string {
  const { amount, currency, prefix } = moneyParts(minor, market, lang);
  if (market === 'INTL') return `$${amount}`;
  // Isolate the run so the number keeps its place inside Arabic sentences.
  return prefix ? `\u2068${currency} ${amount}\u2069` : `\u2068${amount} ${currency}\u2069`;
}

export const vatLabel = (market: Market) => `${MARKET_META[market].vatBps / 100}%`;

/** A first guess at the visitor's market before the API answers. */
export function guessMarket(): Market {
  try {
    const saved = localStorage.getItem('nagm_market') as Market | null;
    if (saved && MARKETS.includes(saved)) return saved;
  } catch { /* ignore */ }
  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || '';
    if (tz === 'Africa/Cairo') return 'EG';
    if (tz === 'Asia/Riyadh') return 'SA';
    if (tz === 'Asia/Dubai') return 'AE';
    const lang = typeof navigator !== 'undefined' ? navigator.language : '';
    if (/-EG$/i.test(lang)) return 'EG';
    if (/-SA$/i.test(lang)) return 'SA';
    if (/-AE$/i.test(lang)) return 'AE';
  } catch { /* ignore */ }
  return 'INTL';
}

export function rememberMarket(m: Market) {
  try { localStorage.setItem('nagm_market', m); } catch { /* ignore */ }
}

/* ---------------- live catalog ---------------- */

export interface LivePrice { interval: Interval; amountMinor: number; currency: string }
export interface LivePlan { id: string; audience: Audience; prices: LivePrice[]; features?: Record<string, unknown>; active?: boolean }
export interface Catalog {
  market: Market; currency: string; vatBps: number; tamaraAvailable: boolean; providers: Provider[];
  plans: LivePlan[]; live: boolean;
}

/** The static list, shaped like the API answer. */
export function staticCatalog(market: Market): Catalog {
  const meta = MARKET_META[market];
  return {
    market, currency: meta.currency, vatBps: meta.vatBps, tamaraAvailable: meta.tamara,
    providers: market === 'INTL' ? ['manual'] : meta.tamara ? ['paymob', 'tamara'] : ['paymob'],
    live: false,
    plans: PLANS.filter((p) => p.monthly !== undefined).map((p) => ({
      id: p.id, audience: p.audience,
      prices: p.monthly ? [
        { interval: 'MONTH', amountMinor: p.monthly[market], currency: meta.currency },
        { interval: 'YEAR', amountMinor: yearlyMinor(p.monthly[market]), currency: meta.currency },
      ] : [],
    })),
  };
}

export async function fetchCatalog(market: Market, signal?: AbortSignal): Promise<Catalog> {
  const { data } = await api.get('/billing/catalog', { params: { market }, signal, timeout: 6000 });
  const m: Market = MARKETS.includes(data?.market) ? data.market : market;
  const meta = MARKET_META[m];
  // The API sends prices as { MONTH: Price | null, YEAR: Price | null }; an
  // array of prices is accepted too.
  type ApiPrice = { interval?: Interval; amountMinor: number | string; currency: string };
  const pricesOf = (raw: unknown): LivePrice[] => {
    const list: [Interval | undefined, ApiPrice | null | undefined][] = Array.isArray(raw)
      ? (raw as ApiPrice[]).map((x) => [x?.interval, x])
      : raw && typeof raw === 'object'
        ? (Object.entries(raw as Record<string, ApiPrice | null>) as [Interval, ApiPrice | null][])
        : [];
    return list
      .filter(([interval, x]) => (interval === 'MONTH' || interval === 'YEAR') && x && Number.isFinite(Number(x.amountMinor)))
      .map(([interval, x]) => ({ interval: interval as Interval, amountMinor: Number(x!.amountMinor), currency: x!.currency }));
  };
  const plans: LivePlan[] = Array.isArray(data?.plans) ? data.plans.map((p: LivePlan & { prices?: unknown }) => ({
    id: p.id, audience: p.audience, active: p.active, features: p.features,
    prices: pricesOf(p.prices),
  })) : [];
  return {
    market: m,
    currency: data?.currency || meta.currency,
    vatBps: typeof data?.vatBps === 'number' ? data.vatBps : meta.vatBps,
    tamaraAvailable: typeof data?.tamaraAvailable === 'boolean' ? data.tamaraAvailable : meta.tamara,
    providers: Array.isArray(data?.providers) ? data.providers : staticCatalog(m).providers,
    plans, live: true,
  };
}

/** Price of a plan for an interval in a catalog; `null` when free; `undefined` when quote-only. */
export function priceOf(cat: Catalog, planId: string, interval: Interval): number | null | undefined {
  const def = PLANS.find((p) => p.id === planId);
  if (!def || def.monthly === undefined) return undefined;
  if (def.monthly === null) return null;
  const live = cat.plans.find((p) => p.id === planId)?.prices.find((x) => x.interval === interval);
  if (live && live.amountMinor > 0) return live.amountMinor;
  const m = def.monthly[cat.market];
  return interval === 'MONTH' ? m : yearlyMinor(m);
}
