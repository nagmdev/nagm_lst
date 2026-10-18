import { useLang, type Lang } from './lang';

/**
 * Marketing copy for nagm.io, both languages, one shape. The Arabic is the
 * source text (owner-supplied, Oct 2026); the English follows it line for
 * line — same number of cards, bullets and buttons on every page. Prices are
 * not here: they come from the billing catalog (see data/pricing.ts).
 */

export interface Card { title: string; body: string; bullets?: string[]; cta?: string }
export interface Strip { title: string; body: string }
export interface Section { eyebrow?: string; title: string[]; body?: string }

export interface SiteText {
  isAr: boolean;
  nav: {
    products: string; solutions: string; jobs: string; pricing: string; about: string; login: string; start: string;
    forSeekers: string; forSeekersSub: string; forCompanies: string; forCompaniesSub: string;
    productHead: string; solutionsHead: string;
    productItems: { key: string; title: string; sub: string; to: string }[];
    theme: string; lang: string; menu: string; close: string;
  };
  footer: {
    tagline: string[]; rights: string;
    cols: { head: string; links: { label: string; to: string; ext?: boolean }[] }[];
  };
  home: {
    hero: Section & { cta1: string; cta2: string; card1: { title: string; body: string; tags: string[] }; card2: { title: string; body: string } };
    strip: { title: string; body: string; items: Strip[] };
    twoSides: Section & { seekers: Card; companies: Card };
    ai: Section & { stages: { tag: string; title: string; body: string }[] };
    why: Section & { cards: Card[] };
    plans: Section & { more: string };
    cta: Section & { cta1: string; cta2: string };
  };
  seekers: {
    hero: Section & { cta1: string; cta2: string; card1: { title: string; body: string }; card2: { title: string; body: string } };
    strip: { title: string; items: Strip[] };
    profile: Section & { cards: Card[] };
    cv: Section & { cards: Card[]; bullets: string[] };
    match: Section & { steps: Card[]; note: string };
    discover: Section & { cards: Card[]; cta: string };
    apply: Section & { cards: Card[] };
    interview: Section & { cards: Card[] };
    share: Section & { cards: Card[] };
    cta: Section & { cta1: string; cta2: string };
  };
  companies: {
    hero: Section & { cta1: string; cta2: string; card1: { title: string; body: string }; card2: { title: string; body: string } };
    strip: { title: string; items: Strip[] };
    jobs: Section & { cards: Card[] };
    review: Section & { cards: Card[]; note: string };
    stages: Section & { steps: Card[] };
    team: Section & { cards: Card[] };
    base: Section & { cards: Card[] };
    rediscover: Section & { steps: Card[] };
    workspace: Section & { cards: Card[] };
    presence: Section & { cards: Card[] };
    analytics: Section & { cards: Card[] };
    cta: Section & { cta1: string; cta2: string };
  };
  about: {
    back: string; join: string;
    hero: Section;
    problem: Section & { seekers: string; companies: string };
    philosophy: Section & { cards: Card[] };
    region: Section & { cities: { city: string; role: string }[]; note: string };
    cta: Section & { cta1: string; cta2: string };
  };
  pricing: {
    hero: Section;
    audience: { seekers: string; recruiters: string; companies: string };
    interval: { month: string; year: string; save: string };
    market: { label: string; EG: string; SA: string; AE: string; INTL: string; vatNote: (rate: string) => string; noVat: string };
    perMonth: string; perYear: string; billedYearly: (amount: string) => string; billedMonthly: string; free: string; quote: string;
    mostPopular: string; current: string; startFree: string; choose: (name: string) => string; contactSales: string;
    tamara: { title: string; body: string; badge: string };
    pay: { title: string; body: string; card: string; wallet: string; tamara: string; applePay: string; invoice: string };
    addons: { eyebrow: string; title: string; body: string; items: { name: string; body: string }[] };
    compare: { title: string; feature: string; unlimited: string; yes: string; no: string };
    faq: { title: string; items: { q: string; a: string }[] };
    recruiterNote: string;
    enterprise: { name: string; body: string; bullets: string[] };
    loading: string; offline: string;
  };
}

const ar: SiteText = {
  isAr: true,
  nav: {
    products: 'المنتجات', solutions: 'الحلول', jobs: 'الوظائف', pricing: 'الأسعار', about: 'عن نجم', login: 'تسجيل الدخول', start: 'ابدأ الآن',
    forSeekers: 'للباحثين عن عمل', forSeekersSub: 'ملف مهني، سيرة ذاتية، تحليل توافق، وتدريب على المقابلات.',
    forCompanies: 'للشركات ومسؤولي التوظيف', forCompaniesSub: 'وظائف، متقدمون، مراحل توظيف، وتعاون الفريق في مساحة واحدة.',
    productHead: 'أدوات نجم', solutionsHead: 'حسب المستخدم',
    productItems: [
      { key: 'profile', title: 'الملف المهني', sub: 'خبراتك ومهاراتك ولغاتك في ملف واحد.', to: '/job-seekers#profile' },
      { key: 'cv', title: 'إنشاء السيرة الذاتية', sub: 'أنشئ سيرتك ونظّم نسخها.', to: '/job-seekers#cv' },
      { key: 'match', title: 'فحص ATS وتحليل التوافق', sub: 'افهم توافق سيرتك مع الوظيفة قبل التقديم.', to: '/job-seekers#match' },
      { key: 'interview', title: 'التدريب على المقابلات', sub: 'بنك أسئلة ومكتبة لإجاباتك.', to: '/job-seekers#interview' },
      { key: 'stages', title: 'إدارة المرشحين والمراحل', sub: 'طلبات منظّمة ومراحل توظيف واضحة.', to: '/companies#stages' },
      { key: 'rediscover', title: 'قاعدة المرشحين وإعادة الاكتشاف', sub: 'ابحث في متقدمي شركتك وأعد اكتشاف المناسبين.', to: '/companies#base' },
      { key: 'team', title: 'مساحة عمل الفريق', sub: 'أدوار وصلاحيات ودعوات وطلبات انضمام.', to: '/companies#workspace' },
      { key: 'analytics', title: 'تحليلات التوظيف', sub: 'نظرة عامة حسب الفترة وتصدير إلى Excel.', to: '/companies#analytics' },
    ],
    theme: 'تبديل المظهر', lang: 'Switch to English', menu: 'القائمة', close: 'إغلاق',
  },
  footer: {
    tagline: ['ملف مهني أوضح.', 'ورحلة توظيف أكثر تنظيمًا.'],
    rights: '© 2026 نجم. جميع الحقوق محفوظة.',
    cols: [
      { head: 'الحلول', links: [{ label: 'للباحثين عن عمل', to: '/job-seekers' }, { label: 'للشركات ومسؤولي التوظيف', to: '/companies' }, { label: 'الأسعار', to: '/pricing' }] },
      { head: 'المنصة', links: [{ label: 'الوظائف', to: '/jobs', ext: true }, { label: 'تسجيل الدخول', to: '/login' }, { label: 'إنشاء حساب', to: '/register' }] },
      { head: 'نجم', links: [{ label: 'عن نجم', to: '/about' }, { label: 'تواصل مع المبيعات', to: 'mailto:sales@nagm.io', ext: true }, { label: 'الدعم', to: 'mailto:support@nagm.io', ext: true }] },
    ],
  },
  home: {
    hero: {
      eyebrow: 'نجم للمرشحين والشركات · توظيف مدعوم بالذكاء الاصطناعي',
      title: ['أظهر قدراتك.', 'اكتشف الأنسب.', 'واتخذ خطوتك التالية.'],
      body: 'من ملفك المهني إلى فرصة تناسب خبراتك، ومن إعلان الوظيفة إلى إدارة المرشحين؛ تجمع نجم إنشاء السير الذاتية، وتحليل التوافق، وأدوات التوظيف في منصة واحدة، ليبدأ كل طرف بصورة أوضح.',
      cta1: 'ابدأ رحلتك المهنية', cta2: 'وظّف مع نجم',
      card1: { title: 'ملف مهني متكامل', body: 'خبراتك ومهاراتك وسيرتك الذاتية في مكان واحد', tags: ['الخبرات', 'المهارات', 'السيرة الذاتية'] },
      card2: { title: 'افهم مدى توافقك', body: 'حلّل سيرتك أمام متطلبات الوظيفة، واطّلع على التقييم والتوصيات.' },
    },
    strip: {
      title: 'أدوات مترابطة لكل خطوة في رحلة التوظيف',
      body: 'من تجهيز الملف المهني إلى متابعة طلبات التقديم وإدارة المرشحين.',
      items: [
        { title: 'ملف مهني', body: 'يجمع خبراتك ومهاراتك' },
        { title: 'إنشاء السيرة الذاتية', body: 'وتنظيم نسخها' },
        { title: 'تحليل التوافق', body: 'مع متطلبات الوظيفة' },
        { title: 'تدريب المقابلات', body: 'وإعداد إجاباتك' },
        { title: 'إدارة المرشحين', body: 'ومراحل التوظيف' },
        { title: 'تحليلات التوظيف', body: 'لمتابعة أداء العملية' },
      ],
    },
    twoSides: {
      eyebrow: 'للمرشحين وفرق التوظيف',
      title: ['كل ما تحتاجه لتتقدّم.', 'وكل ما يحتاجه فريقك ليختار.'],
      seekers: {
        title: 'قدّم خبراتك بوضوح، واستعد لفرصتك التالية.',
        body: 'ابنِ ملفًا مهنيًا يعكس قدراتك، وافهم مدى توافق سيرتك مع الوظيفة قبل التقديم. ومع نجم، تقدر تتابع طلباتك وتتدرّب على المقابلات من نفس المنصة.',
        bullets: [
          'أنشئ سيرتك الذاتية، واحفظ نسخها، واملأ ملفك من سيرة مرفوعة.',
          'حلّل توافق سيرتك مع وظيفة محددة، واكتشف التوصيات والوظائف المقترحة لك.',
          'قدّم على الوظائف، وتابع حالة طلباتك، وشارك ملفك برابط قابل للإلغاء.',
          'تدرّب على أسئلة المقابلات، واحفظ إجاباتك وطوّرها مع استعدادك لكل فرصة.',
        ],
        cta: 'أنشئ حسابك كمرشح',
      },
      companies: {
        title: 'من أول متقدّم إلى قرارك التالي، الصورة أمام فريقك.',
        body: 'اجمع وظائفك ومتقدميك وتواصل فريقك في مساحة عمل واحدة. راجع الملفات، وقيّم التوافق، وحرّك المرشحين بين مراحل التوظيف مع الاحتفاظ بتاريخ كل خطوة.',
        bullets: [
          'جهّز وصف الوظيفة وأسئلة الفرز ومنشور الإعلان بمساعدة الذكاء الاصطناعي.',
          'راجع المتقدمين وتقييمات سيرهم، ونظّم القوائم المختصرة ومراحل التوظيف.',
          'تعاون بالملاحظات والإشارات للفريق، وتابع المحادثات والمكالمات والمقابلات.',
          'ابحث في متقدمي شركتك، وأعد اكتشاف المناسبين لفرص جديدة، وتابع تحليلات التوظيف.',
        ],
        cta: 'أنشئ حسابك للتوظيف',
      },
    },
    ai: {
      eyebrow: 'ذكاء اصطناعي يخدم خطواتك الفعلية',
      title: ['من بيانات متفرقة إلى صورة أوضح عن التوافق.'],
      body: 'تساعدك نجم على تنظيم معلومات المرشح ومتطلبات الوظيفة، وفهم العلاقة بينهما، والاستفادة من النتائج في التقديم أو مراجعة المتقدمين.',
      stages: [
        { tag: 'المرحلة الأولى L1', title: 'حوّل المعلومات إلى ملف واضح.', body: 'استخرج المهارات من السيرة الذاتية، واملأ الملف المهني، وحلّل متطلبات الوظيفة لتصبح المعلومات أسهل في المراجعة والبحث.' },
        { tag: 'المرحلة الثانية L2', title: 'افهم مدى ملاءمة المرشح للوظيفة.', body: 'حلّل السيرة الذاتية أمام وصف وظيفي أو وظيفة على نجم، واطّلع على درجة التوافق والتفاصيل والتوصيات المرتبطة بها.' },
        { tag: 'المرحلة الثالثة L3', title: 'استفد من النتائج في خطوتك التالية.', body: 'اكتشف وظائف مقترحة للمرشح، أو أعد اكتشاف متقدمين سابقين يناسبون وظيفة جديدة، وقيّمهم وادعُهم للتقديم.' },
      ],
    },
    why: {
      eyebrow: 'تفاصيل تصنع فرقًا في الاستخدام اليومي',
      title: ['اعرف المرشح أكثر.', 'ونظّم رحلة التوظيف أفضل.'],
      cards: [
        { title: 'صورة مهنية تتجاوز السيرة الذاتية', body: 'اجمع الخبرات والمهارات واللغات في ملف واحد، مع ملخص بالذكاء الاصطناعي لنقاط القوة والتوجه المهني. ويمكن للمطوّرين ربط GitHub لإظهار بطاقة مطوّر موثّقة.' },
        { title: 'استعداد أفضل للمقابلات', body: 'تدرّب باستخدام بنك أسئلة المقابلات، واكتب إجاباتك واحفظها وعدّلها، لتراجع طريقة عرض خبراتك قبل المقابلة التالية.' },
        { title: 'تعاون مرتبط بكل مرشح', body: 'دوّن ملاحظاتك الداخلية، وأشر لزملائك، وتابع المحادثات والأنشطة المجدولة وسجل المرشح، ليبقى فريقك على اطلاع بما تم وما يحتاج متابعة.' },
        { title: 'قاعدة مرشحين تستفيد منها مجددًا', body: 'اجمع متقدمي الشركة دون تكرار الشخص، وابحث بالمهارات والخبرة والموقع وغيرها. وعند فتح وظيفة جديدة، اكتشف المناسبين من المتقدمين السابقين.' },
        { title: 'مساحة عمل تناسب فريقك', body: 'أدر أعضاء الفريق وأدوارهم وصلاحياتهم، وأرسل الدعوات وراجع طلبات الانضمام. وتنقّل بين مساحات الشركات التي تنتمي إليها من حسابك.' },
        { title: 'متابعة أوضح لعملية التوظيف', body: 'راجع نظرة عامة على التوظيف حسب الفترة ومسار المتقدمين بين المراحل، وصدّر متقدمي الوظيفة إلى Excel عندما تحتاج إلى العمل على بياناتهم.' },
      ],
    },
    plans: {
      eyebrow: 'باقات نجم',
      title: ['ابدأ بما تحتاجه اليوم.', 'واختر ما يناسب خطوتك التالية.'],
      body: 'سواء كنت تستعد لفرصة جديدة أو تدير التوظيف لشركتك، تعرّف على الخيارات المتاحة لك.',
      more: 'قارن كل الباقات والأسعار',
    },
    cta: {
      title: ['فرصتك التالية تبدأ بوضوح.', 'وقرارك التوظيفي كذلك.'],
      body: 'ابنِ ملفك، وافهم توافقك، واستعد للتقديم. أو اجمع فريقك ومرشحيك في مساحة تساعدك على إدارة التوظيف خطوة بخطوة.',
      cta1: 'ابدأ رحلتك كمرشح', cta2: 'ابدأ التوظيف لشركتك',
    },
  },
  seekers: {
    hero: {
      eyebrow: 'حلول نجم للباحثين عن عمل',
      title: ['خبراتك تستحق أن تظهر.', 'وفرصتك التالية تستحق الاستعداد.'],
      body: 'اجمع خبراتك في ملف مهني متكامل، وجهّز سيرتك الذاتية، وافهم مدى توافقها مع الوظائف التي تهمك. من اكتشاف الفرص والتقديم عليها إلى التدريب على المقابلات، تساعدك نجم على الاستعداد لكل خطوة ومتابعتها من مكان واحد.',
      cta1: 'أنشئ حسابك كمرشح', cta2: 'تصفّح الوظائف',
      card1: { title: 'ملفك المهني في صورة متكاملة', body: 'خبرات · مهارات · لغات · سيرة ذاتية' },
      card2: { title: 'تعرّف على مدى توافقك', body: 'تقييم لسيرتك أمام متطلبات الوظيفة، مع تفاصيل وتوصيات للمراجعة.' },
    },
    strip: {
      title: 'أدوات تحتاجها قبل التقديم وبعده.',
      items: [
        { title: 'ابنِ ملفك', body: 'واجمع خبراتك ومهاراتك.' },
        { title: 'جهّز سيرتك', body: 'ونظّم نسخها.' },
        { title: 'افهم توافقك', body: 'مع الوظيفة المستهدفة.' },
        { title: 'اكتشف الفرص', body: 'وراجع الوظائف المقترحة.' },
        { title: 'تابع طلباتك', body: 'واعرف حالتها.' },
        { title: 'استعد للمقابلات', body: 'وتدرّب على إجاباتك.' },
      ],
    },
    profile: {
      eyebrow: 'قدّم صورة أوضح عن قدراتك',
      title: ['خبراتك ومهاراتك، مترابطة في ملف واحد.'],
      body: 'ابنِ ملفًا يضم المعلومات التي تعبّر عنك مهنيًا، ويساعدك على تقديم نفسك بصورة منظمة كلما ظهرت فرصة جديدة.',
      cards: [
        { title: 'ابدأ بسيرتك، واستكمل ملفك.', body: 'ارفع سيرتك الذاتية لتعبئة بيانات ملفك تلقائيًا، ثم راجع المعلومات واستكملها. أضف خبراتك ومهاراتك ولغاتك وموقعك وتوقعاتك للراتب، وحدّثها مع تطور مسارك المهني.', bullets: ['تعبئة بيانات الملف من السيرة الذاتية المرفوعة.', 'تنظيم المهارات والخبرات واللغات.', 'إضافة الموقع وتوقعات الراتب.', 'متابعة اكتمال الملف من لوحة حسابك.'] },
        { title: 'ملخص مهني بالذكاء الاصطناعي.', body: 'حوّل بيانات ملفك إلى ملخص يبرز نقاط قوتك ومستويات مهاراتك وتوجهك المهني، ليضيف قراءة مترابطة إلى تفاصيل خبراتك.', bullets: ['ملخص مبني على بيانات المرشح.', 'إبراز نقاط القوة المهنية.', 'عرض تقديرات مستويات المهارات.', 'توضيح التوجه المهني المستخلص من البيانات.'] },
      ],
    },
    cv: {
      eyebrow: 'سيرتك الذاتية، جاهزة ومنظمة',
      title: ['أنشئ سيرتك.', 'واحتفظ بنسخك في مكان واحد.'],
      cards: [
        { title: 'أنشئ سيرة ذاتية من داخل المنصة.', body: 'استخدم منشئ السيرة الذاتية لإعداد سيرة منسّقة داخل المتصفح، وعاينها أثناء العمل لتراجع طريقة عرض معلوماتك وخبراتك.' },
        { title: 'نظّم نسخ سيرتك بسهولة.', body: 'ارفع عدة نسخ إلى مكتبة السير الذاتية، وحدّد نسختك الحالية. يمكنك معاينة الملفات وتنزيلها وحذف النسخ التي لم تعد تحتاج إليها، مع استخراج المهارات من الملفات المرفوعة.' },
      ],
      bullets: ['إنشاء السيرة الذاتية ومعاينتها.', 'رفع عدة نسخ والاحتفاظ بها.', 'اختيار النسخة الحالية.', 'معاينة الملفات وتنزيلها وحذفها.'],
    },
    match: {
      eyebrow: 'تحليل السيرة الذاتية للوظيفة المستهدفة',
      title: ['قبل أن تقدّم، افهم مدى توافق سيرتك.'],
      body: 'تختلف متطلبات كل وظيفة. يتيح لك فحص ATS في نجم تحليل سيرتك أمام وصف وظيفي محدد، والحصول على تقييم وتفاصيل وتوصيات مرتبطة بهذه الفرصة.',
      steps: [
        { title: 'حدّد الوظيفة.', body: 'ألصق الوصف الوظيفي الذي تريد تحليله، أو استخدم وظيفة منشورة على نجم لتقييم سيرتك أمام متطلباتها.' },
        { title: 'افهم النتيجة.', body: 'راجع درجة التوافق وتفاصيل التقييم والتوصيات، لتعرف ما يحتاج إلى مراجعة في طريقة عرض خبراتك ومهاراتك.' },
        { title: 'ارجع إلى تحليلاتك السابقة.', body: 'احتفظ بمرجع لفحوصاتك داخل سجل ATS، واطّلع على نتائجها والوظائف التي أُجريت مقابلها.' },
      ],
      note: 'تقييم التوافق يساعدك على المراجعة والاستعداد، ولا يضمن القبول أو الحصول على الوظيفة.',
    },
    discover: {
      eyebrow: 'اكتشف فرصك التالية',
      title: ['ابحث عن الفرصة، وافهم متطلباتها.'],
      body: 'تصفّح الوظائف المنشورة، واستكشف التوصيات المخصصة لك، وراجع توافقك مع الفرص التي تهمك قبل اتخاذ قرار التقديم.',
      cards: [
        { title: 'وظائف مقترحة لك.', body: 'استكشف توصيات الوظائف للمرشح، وراجع الفرص المقترحة في ضوء خبراتك وما تبحث عنه في خطوتك التالية.' },
        { title: 'درجة توافق مع الوظيفة.', body: 'اطّلع على درجة المطابقة بين ملفك والوظيفة، واستخدمها كإشارة تساعدك على ترتيب الفرص التي تريد مراجعتها.' },
        { title: 'تفاصيل بالعربية والإنجليزية.', body: 'استخدم ترجمة إعلان الوظيفة بين العربية والإنجليزية لتقرأ المتطلبات باللغة الأنسب لك، وتصفّح صفحة الشركة ووظائفها المتاحة.' },
      ],
      cta: 'تصفّح الوظائف',
    },
    apply: {
      eyebrow: 'من إرسال الطلب إلى متابعة حالته',
      title: ['قدّم على الفرصة.', 'وتابع طلبك من حسابك.'],
      cards: [
        { title: 'قدّم بحسابك أو كضيف.', body: 'أرسل طلبك باستخدام سيرتك الذاتية، سواء كنت مسجلًا على نجم أو تتقدم كضيف. تُقيّم السيرة عبر ATS عند التقديم، ويمكنك بعد التقديم كضيف إنشاء حساب للاحتفاظ بطلبك ضمنه.', bullets: ['التقديم على الوظائف باستخدام السيرة الذاتية.', 'التقديم بحساب أو كضيف.', 'تقييم السيرة الذاتية عند الإرسال.', 'تحويل تقديم الضيف إلى حساب.'] },
        { title: 'طلباتك وحالاتها أمامك.', body: 'راجع طلبات التقديم وحالة كل طلب من حسابك، وتابع الإشعارات داخل المنصة. وإذا قررت عدم الاستمرار في فرصة، يمكنك سحب طلبك.', bullets: ['عرض طلبات التقديم وحالاتها.', 'سحب الطلب عند الرغبة.', 'إشعارات داخل المنصة مع مؤشر لغير المقروء.', 'إدارة الإشعارات وتعليمها كمقروءة.'] },
      ],
    },
    interview: {
      eyebrow: 'استعد لعرض خبراتك في المقابلة',
      title: ['حوّل تجاربك إلى إجابات جاهزة للنقاش.'],
      body: 'امنح نفسك مساحة للتحضير قبل المقابلة. استكشف بنك الأسئلة، واكتب إجابات تستند إلى مواقفك وخبراتك، ثم احفظها وراجعها وعدّلها مع كل تجربة جديدة.',
      cards: [
        { title: 'استكشف أسئلة المقابلات.', body: 'تعرّف على أسئلة المقابلات وأنواعها، واستفد من المراجع المرتبطة بالشركات والمسميات الوظيفية والمبادئ القيادية أثناء التحضير.' },
        { title: 'ابنِ مكتبة إجاباتك.', body: 'اكتب إجاباتك واحفظها، لتحتفظ بالأمثلة والمواقف التي تريد الاستعانة بها عند الحديث عن خبراتك.' },
        { title: 'راجع وطوّر باستمرار.', body: 'ارجع إلى إجاباتك لتعديلها وإضافة أمثلة أحدث، واحذف ما لم يعد يعكس خبراتك أو طريقة تقديمك لنفسك.' },
      ],
    },
    share: {
      eyebrow: 'سهّل الوصول إلى صورتك المهنية',
      title: ['شارك خبراتك.', 'وأضف حضورك التقني إلى ملفك.'],
      cards: [
        { title: 'رابط واحد لملفك وسيرتك.', body: 'أنشئ رابط مشاركة يتيح الاطّلاع على ملفك المهني وسيرتك الذاتية دون الحاجة إلى حساب على نجم. ويمكنك إلغاء الرابط عندما لا ترغب في استمرار الوصول من خلاله.' },
        { title: 'بطاقة مطوّر مرتبطة بـGitHub.', body: 'اربط حساب GitHub وزامن بياناته لإظهار بطاقة مطوّر موثّقة داخل ملفك. ويمكنك إدارة الاتصال ومزامنته أو إزالته من المنصة.' },
      ],
    },
    cta: {
      title: ['ابدأ بما أنجزته.', 'واستعد لما تطمح إليه.'],
      body: 'ابنِ ملفك المهني، ونظّم سيرتك، وافهم توافقك مع الوظائف، وتدرّب على المقابلات. اجمع خطوات استعدادك وتقديمك ومتابعتك في حساب واحد على نجم.',
      cta1: 'أنشئ حسابك كمرشح', cta2: 'تصفّح الوظائف',
    },
  },
  companies: {
    hero: {
      eyebrow: 'حلول نجم للشركات ومسؤولي التوظيف',
      title: ['وظائفك ومرشحوك وفريقك.', 'رحلة توظيف تديرها من مكان واحد.'],
      body: 'جهّز إعلانات الوظائف، وراجع توافق المتقدمين، ونظّم مراحل التوظيف والتواصل والمتابعة. تجمع نجم ملفات المرشحين وملاحظات الفريق وأنشطته في مساحة عمل مشتركة، لتبني قراراتك على معلومات واضحة وتستفيد من قاعدة مرشحيك مع كل فرصة جديدة.',
      cta1: 'أنشئ حساب شركتك', cta2: 'سجّل كمسؤول توظيف',
      card1: { title: 'ملف المرشح أمام فريقك', body: 'السيرة الذاتية · المهارات · تقييم التوافق · سجل الأنشطة' },
      card2: { title: 'لكل طلب خطوة تالية', body: 'مرحلة توظيف واضحة، وملاحظات مشتركة، وأنشطة للمتابعة.' },
    },
    strip: {
      title: 'أدوات مترابطة من نشر الوظيفة إلى متابعة المرشحين.',
      items: [
        { title: 'جهّز الوظائف', body: 'بمساعدة الذكاء الاصطناعي.' },
        { title: 'راجع المتقدمين', body: 'وافهم مدى توافقهم.' },
        { title: 'نظّم المراحل', body: 'وتابع تقدّم الطلبات.' },
        { title: 'تعاون مع فريقك', body: 'حول كل مرشح.' },
        { title: 'استعد المرشحين المناسبين', body: 'من طلبات سابقة.' },
        { title: 'تابع أداء التوظيف', body: 'بالتقارير والبيانات.' },
      ],
    },
    jobs: {
      eyebrow: 'ابدأ بمتطلبات واضحة',
      title: ['جهّز الوظيفة للنشر.', 'واجمع أدوات الإعلان حولها.'],
      cards: [
        { title: 'مساعدة بالذكاء الاصطناعي قبل استقبال الطلبات.', body: 'ولّد مسودة للوصف الوظيفي وأسئلة الفرز ومنشور للسوشيال ميديا، وراجع المحتوى بما يناسب الوظيفة التي تريد شغلها.', bullets: ['توليد وصف وظيفي بالذكاء الاصطناعي.', 'توليد أسئلة لفرز المتقدمين.', 'تجهيز منشور للترويج للوظيفة على السوشيال ميديا.', 'استخراج المهارات والمتطلبات من الوظيفة لدعم المطابقة.'] },
        { title: 'إدارة الوظائف خلال دورة نشرها.', body: 'أنشئ وظائفك، وراجع تفاصيلها، وعدّلها، وتحكّم في نشرها وفتحها وإغلاقها وفق صلاحيات الشركة. واعرض فرصك المنشورة على صفحة شركتك العامة.', bullets: ['إنشاء الوظائف وعرضها في قائمة واحدة.', 'تعديل بيانات الوظيفة وحذفها عند الحاجة.', 'إدارة حالة الوظيفة والنشر وفق الصلاحيات.', 'إتاحة ترجمة الإعلان للقارئ بين العربية والإنجليزية.'] },
      ],
    },
    review: {
      eyebrow: 'اعرف من يتقدّم إليك',
      title: ['راجع الخبرات والتوافق قبل خطوتك التالية.'],
      body: 'اطّلع على طلبات كل وظيفة وملفات المتقدمين، وراجع تقييمات السير الذاتية وتفاصيل المرشحين، لتكوّن صورة تساعدك على تحديد من تريد متابعة ترشيحه.',
      cards: [
        { title: 'طلبات منظّمة لكل وظيفة.', body: 'اعرض المتقدمين، وافتح تفاصيل كل طلب، وراجع السيرة الذاتية أو نزّلها، وحدّث حالة الطلب مع تقدّم المراجعة.' },
        { title: 'تقييم مرتبط بمتطلبات الوظيفة.', body: 'راجع نتائج تقييم السيرة الذاتية ودرجة المطابقة بين المرشح والوظيفة. ويمكنك إعادة فحص ATS أو إعادة حساب المطابقة عند الحاجة.' },
        { title: 'صورة مهنية أوسع عن المرشح.', body: 'اطّلع على الملف المهني وملخصه بالذكاء الاصطناعي، وراجع الخبرات والمهارات والمعلومات المتاحة بجانب السيرة الذاتية.' },
      ],
      note: 'تقييمات التوافق تدعم المراجعة؛ ويظل قرار الانتقال بين المراحل والاختيار لفريق التوظيف.',
    },
    stages: {
      eyebrow: 'من المراجعة إلى المتابعة',
      title: ['اعرف أين وصل كل مرشح، وما الذي يأتي بعده.'],
      body: 'حرّك المتقدمين بين مراحل التوظيف الخاصة بشركتك، وحدّث حالات الطلبات، واربط المتابعة بأنشطة واضحة داخل طلب التقديم.',
      steps: [
        { title: 'حدّد مرحلة المرشح.', body: 'انقل طلب التقديم بين مراحل الشركة مع تقدّم عملية التوظيف، لتبقى حالة كل مرشح واضحة للفريق.' },
        { title: 'جهّز النشاط التالي.', body: 'جدول مكالمة أو مقابلة مرتبطة بطلب التقديم، لتحتفظ بخطوات المتابعة ضمن سياق المرشح نفسه.' },
        { title: 'سجّل ما تم.', body: 'علّم الأنشطة المنجزة، وأزل ما لم تعد تحتاج إليه، وراجع سجل الأنشطة لمعرفة ما حدث قبل اتخاذ الخطوة التالية.' },
      ],
    },
    team: {
      eyebrow: 'المعلومات تصل إلى من يحتاجها',
      title: ['اجمع النقاش والمتابعة حول المرشح نفسه.'],
      body: 'احتفظ بملاحظات الفريق ومحادثاته وأنشطته في سياق طلب التقديم، وارجع إلى تاريخ التعامل مع المرشح عبر الوظائف.',
      cards: [
        { title: 'ملاحظات داخلية وإشارات للفريق.', body: 'دوّن ملاحظاتك على المتقدم، واستخدم ‎@mentions لتنبيه زملائك إلى نقطة تحتاج مراجعتهم أو مشاركتهم.' },
        { title: 'محادثات مرتبطة بطلب التقديم.', body: 'تابع سلسلة الرسائل مع المرشح إلى جانب سجل النشاط، لتراجع التواصل والخطوات السابقة من نفس السياق.' },
        { title: 'متابعة المرشحين المهمين.', body: 'تابع مرشحًا أو طلب تقديم لتتلقى إشعارات بتحديثاته، وتبقى على اطلاع بما يستجد.' },
        { title: 'تاريخ المرشح عبر الوظائف.', body: 'راجع سجلًا زمنيًا لما حدث مع المرشح عبر الوظائف، لتستفيد من المعلومات السابقة عند التعامل معه مجددًا.' },
      ],
    },
    base: {
      eyebrow: 'حوّل الطلبات المتفرقة إلى قاعدة قابلة للاستخدام',
      title: ['مرشحو شركتك، منظّمون وجاهزون للبحث.'],
      cards: [
        { title: 'كل مرشح مرة واحدة.', body: 'اطّلع على الأشخاص الذين تقدموا لشركتك في قاعدة موحّدة، يظهر فيها كل شخص مرة واحدة مع الوظائف التي تقدم إليها.', bullets: ['رؤية موحّدة لمتقدمي الشركة.', 'ربط المرشح بالوظائف التي تقدم إليها.', 'الوصول إلى ملفه المهني.', 'الرجوع إلى تاريخ التعامل معه.'] },
        { title: 'ابحث وفق متطلبات الفرصة.', body: 'ابحث داخل قاعدة مرشحي شركتك باستخدام المهارات والخبرة واللغات والموقع والراتب المتوقع والوسوم، ونظّم المرشحين الذين تريد العودة إليهم في قائمة مختصرة.', bullets: ['فلاتر متعددة للبحث داخل مرشحي الشركة.', 'ترتيب النتائج واستعراضها على صفحات.', 'إضافة المرشحين إلى القائمة المختصرة.', 'إزالة المرشح من القائمة عند انتهاء الحاجة إليه.'] },
      ],
    },
    rediscover: {
      eyebrow: 'فرصة جديدة قد تناسب مرشحًا تعرفه بالفعل',
      title: ['ابدأ بحثك التالي من قاعدة مرشحيك السابقة.'],
      body: 'قد لا يناسب المرشح وظيفة سابقة، بينما تلائم خبراته فرصة جديدة. تساعدك نجم على إعادة اكتشاف المتقدمين السابقين المناسبين، وتقييمهم ودعوتهم للتقديم.',
      steps: [
        { title: 'اكتشف المرشحين المحتملين.', body: 'راجع المتقدمين السابقين الذين قد تتوافق خبراتهم مع الوظيفة الجديدة.' },
        { title: 'قيّم التوافق من جديد.', body: 'استخدم تقييم ATS لمراجعة سيرهم الذاتية أمام متطلبات الفرصة الحالية.' },
        { title: 'ادعُهم للفرصة المناسبة.', body: 'أضف المرشحين الذين تريد متابعتهم، ووجّه إليهم دعوة للتقديم على الوظيفة الجديدة.' },
      ],
    },
    workspace: {
      eyebrow: 'تنظيم يناسب فريق التوظيف',
      title: ['أدوار واضحة.', 'وصلاحيات تُدار حسب المسؤولية.'],
      cards: [
        { title: 'أدر أعضاء الفريق ووصولهم.', body: 'أضف أعضاء الفريق أو أزلهم، وحدّد أدوارهم وصلاحياتهم التفصيلية. وأدر دعوات الانضمام وطلبات الالتحاق بمساحة الشركة.', bullets: ['إضافة الأعضاء وإزالتهم وتعديل أدوارهم.', 'ضبط الصلاحيات التفصيلية.', 'إرسال الدعوات بالبريد وإعادة إرسالها أو إلغاؤها.', 'مراجعة طلبات الانضمام بالموافقة أو الرفض.'] },
        { title: 'تنقّل بين الشركات التي تعمل معها.', body: 'إذا كنت عضوًا في أكثر من شركة، يمكنك الانتقال بين مساحات عملها من حسابك، والاطّلاع على صلاحياتك داخل كل مساحة.', bullets: ['عرض مساحات الشركات التي تنتمي إليها.', 'التبديل بين مساحات العمل.', 'الاطّلاع على صلاحياتك في الشركة الحالية.', 'متابعة الدعوات وقبولها أو رفضها.'] },
      ],
    },
    presence: {
      eyebrow: 'قدّم شركتك للمرشحين',
      title: ['هوية واضحة للشركة، بجانب الفرص التي تقدمها.'],
      cards: [
        { title: 'صفحة عامة وهوية للشركة.', body: 'حدّث بيانات الشركة وشعارها وغلافها، وقدّم للمرشحين صفحة عامة تعرض شركتك ووظائفها المفتوحة، مع إخضاع التغييرات الحساسة لمسار مراجعة.' },
        { title: 'قيم تعبّر عن بيئة عملك.', body: 'أضف قيم شركتك ومبادئها، أو اربطها بصفحة على الويب، واستعن بالذكاء الاصطناعي لتلخيصها.' },
        { title: 'مسار لتوثيق الشركة.', body: 'أكّد بريد العمل، وارفع مستندات تسجيل الشركة، ثم قدّم طلب التوثيق للمراجعة من إدارة المنصة.' },
      ],
    },
    analytics: {
      eyebrow: 'راجع العملية واستفد من بياناتها',
      title: ['رؤية أوضح لحركة التوظيف داخل شركتك.'],
      cards: [
        { title: 'تحليلات حسب الفترة ومراحل التقديم.', body: 'راجع نظرة عامة على التوظيف خلال الفترة التي تختارها، واطّلع على مسار المتقدمين بين المراحل لمتابعة حركة الطلبات وتحديد ما يحتاج مراجعة.' },
        { title: 'بيانات المتقدمين بصيغة Excel.', body: 'صدّر متقدمي الوظيفة إلى جدول بيانات، لتستخدم المعلومات في المراجعات والتقارير التي يحتاجها فريقك.' },
      ],
    },
    cta: {
      title: ['امنح فريقك مساحة أوضح للعمل.', 'ومرشحيك متابعة أكثر تنظيمًا.'],
      body: 'من تجهيز الوظيفة إلى مراجعة الطلبات والتعاون وإعادة اكتشاف المرشحين، اجمع أدوات التوظيف في مساحة واحدة مع نجم.',
      cta1: 'أنشئ حساب شركتك', cta2: 'سجّل كمسؤول توظيف',
    },
  },
  about: {
    back: 'العودة للرئيسية', join: 'انضم لنجم',
    hero: {
      eyebrow: 'عن نجم · رسالتنا وقصتنا',
      title: ['نقرّب المسافة بين قدرات الأشخاص', 'واحتياجات الشركات.'],
      body: 'نؤمن أن رحلة التوظيف تبدأ بفهم أفضل: المرشح يعرف كيف يقدّم خبراته وما يناسبها من فرص، والشركة تجد المعلومات والأدوات التي تساعدها على تقييم المتقدمين ومتابعتهم. لذلك تجمع نجم بناء الملف المهني، وتحليل التوافق، والاستعداد للمقابلات، وإدارة التوظيف في منصة واحدة.',
    },
    problem: {
      title: ['خبرات تستحق أن تُفهم.', 'وقرارات تحتاج صورة أوضح.'],
      seekers: 'قد تمتلك الخبرة المناسبة، لكن تقديمها في سيرة ذاتية واضحة، وفهم مدى توافقها مع كل وظيفة، والاستعداد للمقابلة يحتاج إلى أدوات تساعدك. تمنحك نجم مساحة لبناء ملفك المهني، وتنظيم سيرك الذاتية، وتحليل توافقك مع متطلبات الوظائف، والتدرّب على إجاباتك، ثم متابعة طلباتك بعد التقديم.',
      companies: 'مع تعدّد الوظائف والمتقدمين، تتوزع المعلومات بين السير الذاتية والمحادثات وملاحظات الفريق. تجمع نجم هذه الخطوات في مساحة عمل مترابطة: من تجهيز الإعلان وتقييم المتقدمين إلى إدارة المراحل والأنشطة ومراجعة تاريخ المرشح، مع إمكانية العودة إلى المتقدمين السابقين عند ظهور فرصة تناسبهم.',
    },
    philosophy: {
      title: ['كيف نبني تجربة نجم؟'],
      cards: [
        { title: 'القدرات تستحق صورة متكاملة', body: 'نربط السيرة الذاتية بالخبرات والمهارات واللغات داخل ملف مهني، وندعمه بملخص بالذكاء الاصطناعي. وللمطوّرين، يتيح ربط GitHub إضافة بطاقة مطوّر موثّقة إلى هذه الصورة.' },
        { title: 'التوافق يحتاج إلى فهم', body: 'نساعد المرشح وفريق التوظيف على فهم العلاقة بين السيرة الذاتية ومتطلبات الوظيفة، من خلال تقييم وتفاصيل وتوصيات تدعم المراجعة وتترك القرار لأصحابه.' },
        { title: 'كل خطوة تبني على ما قبلها', body: 'نربط مراحل التوظيف بالملاحظات والمحادثات والأنشطة وسجل المرشح، ليواصل الفريق عمله بمعلومات مشتركة، ويستفيد من علاقاته بالمتقدمين في الفرص التالية.' },
      ],
    },
    region: {
      title: ['من المنطقة، وبالقرب من احتياجاتها.'],
      body: 'يمتد عملنا عبر القاهرة والرياض ودبي، لربط تطوير المنتج باحتياجات المرشحين والشركات في المنطقة.',
      cities: [
        { city: 'القاهرة، مصر', role: 'تطوير المنتج والهندسة التقنية.' },
        { city: 'الرياض، السعودية', role: 'شراكات الشركات والتوسع في الخليج.' },
        { city: 'دبي، الإمارات', role: 'الاستراتيجية الإقليمية والاستشارات.' },
      ],
      note: '',
    },
    cta: {
      title: ['ابدأ بخبراتك.', 'أو بمن يحتاجهم فريقك.'],
      body: 'سواء كنت تستعد لفرصة مهنية جديدة أو تبحث عن المرشحين المناسبين لشركتك، تمنحك نجم الأدوات لتبدأ وتتابع خطوتك التالية.',
      cta1: 'وظّف مع نجم', cta2: 'انضم كباحث عن عمل',
    },
  },
  pricing: {
    hero: {
      eyebrow: 'باقات نجم',
      title: ['ابدأ بما تحتاجه اليوم.', 'واختر ما يناسب خطوتك التالية.'],
      body: 'باقات للباحثين عن عمل ولمسؤولي التوظيف المستقلين وللشركات. الأسعار بعملة بلدك وشاملة الضريبة، وتُدفع بالبطاقة أو بالمحفظة، وبالتقسيط عبر تمارا للاشتراك السنوي في السعودية والإمارات.',
    },
    audience: { seekers: 'للباحثين عن عمل', recruiters: 'لمسؤولي التوظيف', companies: 'للشركات' },
    interval: { month: 'شهري', year: 'سنوي', save: 'وفّر 20%' },
    market: { label: 'الدولة', EG: 'مصر', SA: 'السعودية', AE: 'الإمارات', INTL: 'دولي', vatNote: (rate) => `الأسعار شاملة ضريبة القيمة المضافة (${rate}).`, noVat: 'الأسعار بالدولار الأمريكي.' },
    perMonth: '/ شهريًا', perYear: '/ سنويًا', billedYearly: (amount) => `تُسدّد سنويًا بقيمة ${amount}`, billedMonthly: 'تتجدد شهريًا، وتُلغى في أي وقت', free: 'مجانًا', quote: 'عرض مخصص',
    mostPopular: 'الأكثر اختيارًا', current: 'باقتك الحالية', startFree: 'ابدأ مجانًا', choose: (name) => `اختر ${name}`, contactSales: 'تواصل مع المبيعات',
    tamara: { title: 'قسّطها مع تمارا', body: 'في السعودية والإمارات، ادفع الاشتراك السنوي على دفعات عبر تمارا بدون فوائد، وفق شروط تمارا.', badge: 'تمارا متاحة' },
    pay: { title: 'طرق الدفع', body: 'نستخدم بوابات دفع معتمدة في كل سوق؛ لا تُحفظ بيانات بطاقتك على خوادم نجم.', card: 'بطاقات مدى وفيزا وماستركارد', wallet: 'المحافظ الإلكترونية في مصر', tamara: 'تمارا للتقسيط في السعودية والإمارات', applePay: 'Apple Pay', invoice: 'فاتورة ضريبية لكل عملية' },
    addons: {
      eyebrow: 'إضافات عند الحاجة',
      title: 'وسّع باقتك دون تغييرها.',
      body: 'إضافات تُشترى مرة واحدة أو شهريًا من داخل حسابك.',
      items: [
        { name: 'وظيفة مميزة لمدة 30 يومًا', body: 'تظهر في أعلى نتائج الوظائف وصفحة الشركة.' },
        { name: 'مقعد إضافي للفريق', body: 'أضف عضوًا إلى مساحة العمل فوق حد الباقة.' },
        { name: 'حزمة 100 مطابقة بالذكاء الاصطناعي', body: 'لذروة التوظيف دون ترقية الباقة.' },
        { name: 'صفحة شركة مميزة', body: 'إبراز صفحة شركتك ووظائفها للمرشحين.' },
      ],
    },
    compare: { title: 'قارن المزايا بالتفصيل', feature: 'الميزة', unlimited: 'غير محدود', yes: 'متاح', no: '—' },
    faq: {
      title: 'أسئلة شائعة',
      items: [
        { q: 'هل يمكنني الإلغاء في أي وقت؟', a: 'نعم. الاشتراك الشهري يتجدد تلقائيًا ويمكن إيقاف التجديد في أي وقت من صفحة الاشتراك، وتستمر المزايا حتى نهاية الفترة المدفوعة.' },
        { q: 'كيف يعمل الاشتراك السنوي؟', a: 'يُدفع مرة واحدة مقدمًا بخصم 20% مقارنة بالشهري. في السعودية والإمارات يمكن تقسيطه عبر تمارا، وتُفعّل الباقة فور اعتماد الدفعة الأولى.' },
        { q: 'هل الأسعار شاملة الضريبة؟', a: 'نعم. في مصر والسعودية والإمارات تُعرض الأسعار بالعملة المحلية شاملة ضريبة القيمة المضافة، وتصلك فاتورة ضريبية لكل عملية.' },
        { q: 'ماذا يحدث عند تجاوز حدود الباقة؟', a: 'تظهر لك رسالة واضحة بالحد والمستخدم منه، ويمكنك الترقية أو شراء إضافة. لا تُقطع الخدمة فجأة ولا تُحذف بياناتك.' },
        { q: 'ما الفرق بين باقة مسؤول التوظيف وباقة الشركة؟', a: 'باقة مسؤول التوظيف لمساحة عمل شخصية لفرد واحد. باقات الشركات لمساحة عمل مشتركة بأعضاء وأدوار وصلاحيات، وتتاح لها شارة الشركة الموثّقة بعد التوثيق.' },
        { q: 'هل تُنشر وظائفي مباشرة؟', a: 'وظائف الشركات الموثّقة تُنشر فورًا. غير ذلك تمر الوظيفة بمراجعة سريعة من فريق نجم قبل الظهور على اللوحة.' },
      ],
    },
    recruiterNote: 'باقات مسؤول التوظيف لمساحة عمل شخصية بمقعد واحد. تُراجع الوظائف قبل النشر، ولا تُمنح شارة التوثيق إلا للشركات.',
    enterprise: { name: 'المؤسسات', body: 'ناقش احتياجات شركتك من الوظائف وأعضاء الفريق ومساحات العمل، واحصل على عرض يناسب نطاق استخدامك.', bullets: ['حدّد حجم التوظيف المتوقع.', 'ناقش عدد المستخدمين ومساحات العمل.', 'تعرّف على الخيارات المناسبة لفريقك.', 'احصل على عرض واضح النطاق والتكلفة.'] },
    loading: 'جارٍ تحميل الأسعار…', offline: 'نعرض أسعار القائمة المعتمدة؛ قد تختلف قليلًا عند الدفع.',
  },
};

const en: SiteText = {
  isAr: false,
  nav: {
    products: 'Products', solutions: 'Solutions', jobs: 'Jobs', pricing: 'Pricing', about: 'About', login: 'Log in', start: 'Get started',
    forSeekers: 'For job seekers', forSeekersSub: 'Profile, CV, match analysis and interview practice.',
    forCompanies: 'For companies and recruiters', forCompaniesSub: 'Jobs, applicants, hiring stages and team collaboration in one workspace.',
    productHead: 'Nagm tools', solutionsHead: 'By who you are',
    productItems: [
      { key: 'profile', title: 'Professional profile', sub: 'Experience, skills and languages in one profile.', to: '/job-seekers#profile' },
      { key: 'cv', title: 'CV builder', sub: 'Build your CV and keep its versions organised.', to: '/job-seekers#cv' },
      { key: 'match', title: 'ATS check and match analysis', sub: 'Understand your fit before you apply.', to: '/job-seekers#match' },
      { key: 'interview', title: 'Interview practice', sub: 'A question bank and a library of your answers.', to: '/job-seekers#interview' },
      { key: 'stages', title: 'Candidate and stage management', sub: 'Organised applications and clear hiring stages.', to: '/companies#stages' },
      { key: 'rediscover', title: 'Candidate base and rediscovery', sub: 'Search your applicants and bring back the right ones.', to: '/companies#base' },
      { key: 'team', title: 'Team workspace', sub: 'Roles, permissions, invitations and join requests.', to: '/companies#workspace' },
      { key: 'analytics', title: 'Hiring analytics', sub: 'An overview by period, and export to Excel.', to: '/companies#analytics' },
    ],
    theme: 'Toggle theme', lang: 'التبديل إلى العربية', menu: 'Menu', close: 'Close',
  },
  footer: {
    tagline: ['A clearer professional profile.', 'A better-organised hiring journey.'],
    rights: '© 2026 Nagm. All rights reserved.',
    cols: [
      { head: 'Solutions', links: [{ label: 'For job seekers', to: '/job-seekers' }, { label: 'For companies and recruiters', to: '/companies' }, { label: 'Pricing', to: '/pricing' }] },
      { head: 'Platform', links: [{ label: 'Jobs', to: '/jobs', ext: true }, { label: 'Log in', to: '/login' }, { label: 'Create an account', to: '/register' }] },
      { head: 'Nagm', links: [{ label: 'About', to: '/about' }, { label: 'Contact sales', to: 'mailto:sales@nagm.io', ext: true }, { label: 'Support', to: 'mailto:support@nagm.io', ext: true }] },
    ],
  },
  home: {
    hero: {
      eyebrow: 'Nagm for candidates and companies · AI-assisted hiring',
      title: ['Show what you can do.', 'Find the right fit.', 'Take your next step.'],
      body: 'From your profile to a role that fits your experience, and from the job post to managing candidates: Nagm brings CV building, match analysis and hiring tools together in one platform, so both sides start with a clearer picture.',
      cta1: 'Start your career journey', cta2: 'Hire with Nagm',
      card1: { title: 'A complete professional profile', body: 'Your experience, skills and CV in one place', tags: ['Experience', 'Skills', 'CV'] },
      card2: { title: 'Understand your fit', body: 'Analyse your CV against the job requirements and see your score and recommendations.' },
    },
    strip: {
      title: 'Connected tools for every step of the hiring journey',
      body: 'From building a profile to tracking applications and managing candidates.',
      items: [
        { title: 'Professional profile', body: 'Your experience and skills, together' },
        { title: 'CV builder', body: 'With your versions organised' },
        { title: 'Match analysis', body: 'Against the job requirements' },
        { title: 'Interview practice', body: 'Prepare your answers' },
        { title: 'Candidate management', body: 'And hiring stages' },
        { title: 'Hiring analytics', body: 'Track how the process is performing' },
      ],
    },
    twoSides: {
      eyebrow: 'For candidates and hiring teams',
      title: ['Everything you need to apply.', 'Everything your team needs to choose.'],
      seekers: {
        title: 'Present your experience clearly, and get ready for your next opportunity.',
        body: 'Build a profile that reflects what you can do, and understand how well your CV matches a job before you apply. With Nagm, you can track your applications and practise for interviews from the same platform.',
        bullets: [
          'Build your CV, keep its versions, and fill in your profile from an uploaded CV.',
          'Analyse how your CV matches a specific job, and see recommendations and suggested jobs for you.',
          'Apply to jobs, track the status of your applications, and share your profile with a revocable link.',
          'Practise interview questions, and save and refine your answers as you prepare for each opportunity.',
        ],
        cta: 'Create a candidate account',
      },
      companies: {
        title: 'From the first applicant to your next decision, your team sees the full picture.',
        body: 'Bring your jobs, applicants and team communication into one workspace. Review profiles, assess fit, and move candidates between hiring stages while keeping a history of every step.',
        bullets: [
          'Prepare the job description, screening questions and announcement post with AI assistance.',
          'Review applicants and their CV scores, and organise shortlists and hiring stages.',
          'Collaborate with notes and @mentions, and keep track of conversations, calls and interviews.',
          "Search your company's applicants, rediscover the right people for new roles, and follow your hiring analytics.",
        ],
        cta: 'Create a hiring account',
      },
    },
    ai: {
      eyebrow: 'AI that serves the steps you actually take',
      title: ['From scattered data to a clearer picture of fit.'],
      body: 'Nagm helps you organise candidate information and job requirements, understand how they relate, and put the results to work when applying or reviewing applicants.',
      stages: [
        { tag: 'Stage 1 — L1', title: 'Turn information into a clear profile.', body: 'Extract skills from the CV, fill in the professional profile, and analyse the job requirements so the information is easier to review and search.' },
        { tag: 'Stage 2 — L2', title: 'Understand how well the candidate fits the job.', body: 'Analyse the CV against a job description or a job on Nagm, and see the match score, the details behind it and the related recommendations.' },
        { tag: 'Stage 3 — L3', title: 'Use the results in your next step.', body: 'Discover suggested jobs for the candidate, or rediscover past applicants who fit a new role, assess them and invite them to apply.' },
      ],
    },
    why: {
      eyebrow: 'Details that make a difference in daily use',
      title: ['Know the candidate better.', 'Run the hiring journey better.'],
      cards: [
        { title: 'A professional picture beyond the CV', body: 'Bring experience, skills and languages into one profile, with an AI summary of strengths and career direction. Developers can connect GitHub to show a verified developer card.' },
        { title: 'Better interview preparation', body: 'Practise with the interview question bank, write, save and edit your answers, and review how you present your experience before the next interview.' },
        { title: 'Collaboration tied to each candidate', body: "Leave internal notes, @mention colleagues, and follow conversations, scheduled activities and the candidate's history, so your team knows what has been done and what needs follow-up." },
        { title: 'A candidate base you can use again', body: "Keep your company's applicants in one place with each person listed once, and search by skills, experience, location and more. When a new job opens, find the right people among past applicants." },
        { title: 'A workspace built for your team', body: 'Manage team members, their roles and permissions, send invitations and review join requests. Switch between the company workspaces you belong to from your account.' },
        { title: 'A clearer view of the hiring process', body: "Review a hiring overview by period and how applicants move between stages, and export a job's applicants to Excel when you need to work with their data." },
      ],
    },
    plans: {
      eyebrow: 'Nagm plans',
      title: ['Start with what you need today.', 'Choose what fits your next step.'],
      body: "Whether you're preparing for a new opportunity or running hiring for your company, see the options available to you.",
      more: 'Compare all plans and prices',
    },
    cta: {
      title: ['Your next opportunity starts with clarity.', 'So does your next hiring decision.'],
      body: 'Build your profile, understand your fit, and get ready to apply. Or bring your team and candidates into a workspace that helps you manage hiring step by step.',
      cta1: 'Start as a candidate', cta2: 'Start hiring for your company',
    },
  },
  seekers: {
    hero: {
      eyebrow: 'Nagm solutions for job seekers',
      title: ['Your experience deserves to be seen.', 'Your next opportunity deserves preparation.'],
      body: 'Bring your experience into a complete professional profile, prepare your CV, and understand how well it matches the jobs you care about. From discovering opportunities and applying to practising for interviews, Nagm helps you prepare for every step and follow it from one place.',
      cta1: 'Create a candidate account', cta2: 'Browse jobs',
      card1: { title: 'Your professional profile, complete', body: 'Experience · Skills · Languages · CV' },
      card2: { title: 'See how well you match', body: 'A score for your CV against the job requirements, with details and recommendations to review.' },
    },
    strip: {
      title: 'The tools you need before you apply, and after.',
      items: [
        { title: 'Build your profile', body: 'Bring your experience and skills together.' },
        { title: 'Prepare your CV', body: 'Keep its versions organised.' },
        { title: 'Understand your fit', body: "With the job you're targeting." },
        { title: 'Discover opportunities', body: 'Review suggested jobs.' },
        { title: 'Track your applications', body: 'Know where each one stands.' },
        { title: 'Prepare for interviews', body: 'Practise your answers.' },
      ],
    },
    profile: {
      eyebrow: 'Present a clearer picture of what you can do',
      title: ['Your experience and skills, connected in one profile.'],
      body: 'Build a profile that holds the information that represents you professionally, and helps you present yourself in an organised way whenever a new opportunity comes up.',
      cards: [
        { title: 'Start with your CV, then complete your profile.', body: 'Upload your CV to fill in your profile automatically, then review and complete the information. Add your experience, skills, languages, location and expected salary, and update them as your career develops.', bullets: ['Fill in your profile from an uploaded CV.', 'Organise skills, experience and languages.', 'Add your location and expected salary.', 'Track profile completeness from your dashboard.'] },
        { title: 'An AI professional summary.', body: 'Turn your profile data into a summary that highlights your strengths, skill levels and career direction, adding a connected reading to the details of your experience.', bullets: ['A summary built from your candidate data.', 'Highlights your professional strengths.', 'Shows estimated skill levels.', 'Describes the career direction drawn from your data.'] },
      ],
    },
    cv: {
      eyebrow: 'Your CV, ready and organised',
      title: ['Build your CV.', 'Keep your versions in one place.'],
      cards: [
        { title: 'Build a CV inside the platform.', body: 'Use the CV builder to prepare a formatted CV in your browser, and preview it as you work to check how your information and experience come across.' },
        { title: 'Keep your CV versions organised.', body: 'Upload several versions to your CV library and set your current one. You can preview and download files, delete versions you no longer need, and extract skills from the files you upload.' },
      ],
      bullets: ['Build and preview your CV.', 'Upload and keep several versions.', 'Choose your current version.', 'Preview, download and delete files.'],
    },
    match: {
      eyebrow: "CV analysis for the job you're targeting",
      title: ['Before you apply, understand how well your CV matches.'],
      body: "Every job has different requirements. Nagm's ATS check lets you analyse your CV against a specific job description and get a score, details and recommendations tied to that opportunity.",
      steps: [
        { title: 'Pick the job.', body: 'Paste the job description you want to analyse, or use a job posted on Nagm to score your CV against its requirements.' },
        { title: 'Understand the result.', body: 'Review your match score, the details behind it and the recommendations, so you know what to revisit in how you present your experience and skills.' },
        { title: 'Go back to earlier analyses.', body: 'Keep a record of your checks in your ATS history, and see their results and the jobs they were run against.' },
      ],
      note: 'The match score helps you review and prepare. It does not guarantee acceptance or getting the job.',
    },
    discover: {
      eyebrow: 'Discover your next opportunities',
      title: ['Find the opportunity, and understand what it asks for.'],
      body: 'Browse published jobs, explore recommendations tailored to you, and review your fit with the opportunities you care about before deciding to apply.',
      cards: [
        { title: 'Jobs suggested for you.', body: "Explore job recommendations for you as a candidate, and review suggested opportunities in light of your experience and what you're looking for next." },
        { title: 'A match score for each job.', body: 'See the match score between your profile and the job, and use it as a signal to help you prioritise the opportunities you want to review.' },
        { title: 'Details in Arabic and English.', body: "Translate the job post between Arabic and English to read the requirements in the language that suits you, and browse the company's page and its open jobs." },
      ],
      cta: 'Browse jobs',
    },
    apply: {
      eyebrow: 'From sending your application to tracking its status',
      title: ['Apply to the opportunity.', 'Track your application from your account.'],
      cards: [
        { title: 'Apply with your account or as a guest.', body: "Send your application with your CV, whether you're registered on Nagm or applying as a guest. Your CV is scored by ATS when you apply, and after applying as a guest you can create an account to keep the application in it.", bullets: ['Apply to jobs with your CV.', 'Apply with an account or as a guest.', 'CV scored on submission.', 'Convert a guest application into an account.'] },
        { title: 'Your applications and their status, in view.', body: 'Review your applications and the status of each one from your account, and follow in-platform notifications. If you decide not to continue with an opportunity, you can withdraw your application.', bullets: ['View your applications and their status.', 'Withdraw an application whenever you choose.', 'In-platform notifications with an unread indicator.', 'Manage notifications and mark them as read.'] },
      ],
    },
    interview: {
      eyebrow: 'Get ready to present your experience in the interview',
      title: ['Turn your experiences into answers ready for discussion.'],
      body: 'Give yourself room to prepare before the interview. Explore the question bank, write answers grounded in your own situations and experience, then save, review and refine them with each new experience.',
      cards: [
        { title: 'Explore interview questions.', body: 'Get to know interview questions and their types, and draw on references linked to companies, job titles and leadership principles as you prepare.' },
        { title: 'Build your answer library.', body: 'Write and save your answers, so you keep the examples and situations you want to draw on when talking about your experience.' },
        { title: 'Review and improve over time.', body: 'Come back to your answers to edit them and add newer examples, and delete anything that no longer reflects your experience or how you present yourself.' },
      ],
    },
    share: {
      eyebrow: 'Make your professional picture easy to reach',
      title: ['Share your experience.', 'Add your technical presence to your profile.'],
      cards: [
        { title: 'One link for your profile and CV.', body: 'Create a share link that lets people view your professional profile and CV without a Nagm account. You can revoke the link whenever you no longer want it to give access.' },
        { title: 'A developer card linked to GitHub.', body: 'Connect your GitHub account and sync its data to show a verified developer card in your profile. You can manage the connection, re-sync it or remove it from the platform.' },
      ],
    },
    cta: {
      title: ["Start with what you've achieved.", "Prepare for what you're aiming for."],
      body: 'Build your professional profile, organise your CV, understand your fit with jobs, and practise for interviews. Bring your preparation, applications and follow-up together in one Nagm account.',
      cta1: 'Create a candidate account', cta2: 'Browse jobs',
    },
  },
  companies: {
    hero: {
      eyebrow: 'Nagm solutions for companies and recruiters',
      title: ['Your jobs, your candidates, your team.', 'One place to run the whole hiring journey.'],
      body: 'Prepare job posts, review how well applicants match, and organise hiring stages, communication and follow-up. Nagm brings candidate profiles, team notes and activities into a shared workspace, so you base decisions on clear information and draw on your candidate base with every new role.',
      cta1: 'Create a company account', cta2: 'Sign up as a recruiter',
      card1: { title: "The candidate's profile, in front of your team", body: 'CV · Skills · Match score · Activity history' },
      card2: { title: 'Every application has a next step', body: 'A clear hiring stage, shared notes, and activities to follow up on.' },
    },
    strip: {
      title: 'Connected tools from posting the job to following up with candidates.',
      items: [
        { title: 'Prepare jobs', body: 'With AI assistance.' },
        { title: 'Review applicants', body: 'Understand how well they match.' },
        { title: 'Organise stages', body: 'Track how applications progress.' },
        { title: 'Collaborate with your team', body: 'Around each candidate.' },
        { title: 'Bring back the right candidates', body: 'From past applications.' },
        { title: 'Track hiring performance', body: 'With reports and data.' },
      ],
    },
    jobs: {
      eyebrow: 'Start with clear requirements',
      title: ['Get the job ready to publish.', 'Keep the posting tools around it.'],
      cards: [
        { title: 'AI assistance before applications come in.', body: 'Generate a draft job description, screening questions and a social media post, then review the content to suit the role you want to fill.', bullets: ['AI-generated job description.', 'Generated screening questions for applicants.', 'A ready-to-use social media post to promote the job.', 'Skills and requirements extracted from the job to support matching.'] },
        { title: 'Manage jobs through their publishing cycle.', body: "Create your jobs, review and edit their details, and control publishing, opening and closing according to your company's permissions. Show your published roles on your public company page.", bullets: ['Create jobs and see them in one list.', 'Edit job details and delete jobs when needed.', 'Manage job status and publishing according to permissions.', 'Let readers translate the post between Arabic and English.'] },
      ],
    },
    review: {
      eyebrow: 'Know who is applying',
      title: ['Review experience and fit before your next step.'],
      body: "See the applications for each job and the applicants' profiles, and review CV scores and candidate details, to build a picture that helps you decide whose candidacy to take forward.",
      cards: [
        { title: 'Organised applications for every job.', body: 'View applicants, open the details of each application, review or download the CV, and update the application status as your review progresses.' },
        { title: 'A score tied to the job requirements.', body: 'Review the CV score and the match score between the candidate and the job. You can re-run the ATS check or recalculate the match when needed.' },
        { title: 'A wider professional picture of the candidate.', body: 'See the professional profile and its AI summary, and review the experience, skills and other information available alongside the CV.' },
      ],
      note: 'Match scores support your review; decisions about moving candidates between stages and selecting them stay with the hiring team.',
    },
    stages: {
      eyebrow: 'From review to follow-up',
      title: ['Know where every candidate stands, and what comes next.'],
      body: "Move applicants between your company's hiring stages, update application statuses, and tie follow-up to clear activities inside the application.",
      steps: [
        { title: "Set the candidate's stage.", body: "Move the application between your company's stages as the hiring process progresses, so every candidate's status stays clear to the team." },
        { title: 'Set up the next activity.', body: "Schedule a call or interview linked to the application, so follow-up steps stay in the candidate's own context." },
        { title: 'Record what happened.', body: 'Mark activities as done, remove the ones you no longer need, and check the activity history to see what happened before taking the next step.' },
      ],
    },
    team: {
      eyebrow: 'Information reaches the people who need it',
      title: ['Keep the discussion and follow-up around the same candidate.'],
      body: "Keep the team's notes, conversations and activities in the context of the application, and look back at the candidate's history across jobs.",
      cards: [
        { title: 'Internal notes and @mentions for the team.', body: "Write notes on the applicant, and use @mentions to flag a point that needs a colleague's review or input." },
        { title: 'Conversations linked to the application.', body: 'Follow the message thread with the candidate alongside the activity history, so you can review communication and earlier steps from the same context.' },
        { title: 'Follow the candidates that matter.', body: 'Follow a candidate or an application to receive notifications about updates and stay on top of what changes.' },
        { title: "The candidate's history across jobs.", body: 'Review a timeline of what happened with the candidate across jobs, so you can draw on past information when you work with them again.' },
      ],
    },
    base: {
      eyebrow: 'Turn scattered applications into a base you can use',
      title: ["Your company's candidates, organised and searchable."],
      cards: [
        { title: 'Each candidate, once.', body: 'See everyone who has applied to your company in one unified base, where each person appears once along with the jobs they applied to.', bullets: ["A unified view of your company's applicants.", 'Each candidate linked to the jobs they applied to.', 'Access to their professional profile.', 'Look back at your history with them.'] },
        { title: 'Search by the requirements of the role.', body: "Search your company's candidate base by skills, experience, languages, location, expected salary and tags, and keep the candidates you want to come back to in a shortlist.", bullets: ["Multiple filters for searching your company's candidates.", 'Sort results and browse them page by page.', 'Add candidates to the shortlist.', 'Remove a candidate from the shortlist when no longer needed.'] },
      ],
    },
    rediscover: {
      eyebrow: 'A new role might suit a candidate you already know',
      title: ['Start your next search from the candidates you already have.'],
      body: 'A candidate may not have fit an earlier job, yet their experience suits a new one. Nagm helps you rediscover suitable past applicants, assess them and invite them to apply.',
      steps: [
        { title: 'Discover potential candidates.', body: 'Review past applicants whose experience may match the new job.' },
        { title: 'Assess the fit again.', body: 'Use the ATS check to review their CVs against the requirements of the current role.' },
        { title: 'Invite them to the right role.', body: 'Add the candidates you want to follow up with, and send them an invitation to apply to the new job.' },
      ],
    },
    workspace: {
      eyebrow: 'Organisation that fits the hiring team',
      title: ['Clear roles.', 'Permissions managed by responsibility.'],
      cards: [
        { title: 'Manage team members and their access.', body: 'Add or remove team members, and set their roles and granular permissions. Manage invitations and requests to join the company workspace.', bullets: ['Add and remove members, and change their roles.', 'Set granular permissions.', 'Send email invitations, and resend or cancel them.', 'Review join requests and approve or reject them.'] },
        { title: 'Switch between the companies you work with.', body: "If you're a member of more than one company, you can move between their workspaces from your account and see your permissions in each one.", bullets: ['See the company workspaces you belong to.', 'Switch between workspaces.', 'See your permissions in the current company.', 'Keep track of invitations and accept or decline them.'] },
      ],
    },
    presence: {
      eyebrow: 'Introduce your company to candidates',
      title: ['A clear company identity, alongside the roles you offer.'],
      cards: [
        { title: 'A public page and identity for your company.', body: 'Update your company details, logo and cover image, and give candidates a public page that presents your company and its open jobs, with sensitive changes going through a review process.' },
        { title: 'Values that reflect your workplace.', body: "Add your company's values and principles, or link to a web page, and use AI to summarise them." },
        { title: 'A path to company verification.', body: 'Confirm your work email, upload your company registration documents, then submit the verification request for review by the platform team.' },
      ],
    },
    analytics: {
      eyebrow: 'Review the process and put its data to use',
      title: ['A clearer view of hiring activity inside your company.'],
      cards: [
        { title: 'Analytics by period and application stage.', body: 'Review a hiring overview for the period you choose, and see how applicants move between stages, to follow the flow of applications and spot what needs attention.' },
        { title: 'Applicant data in Excel.', body: "Export a job's applicants to a spreadsheet, so you can use the information in the reviews and reports your team needs." },
      ],
    },
    cta: {
      title: ['Give your team a clearer place to work.', 'And your candidates a better-organised follow-up.'],
      body: 'From preparing the job to reviewing applications, collaborating and rediscovering candidates, bring your hiring tools into one place with Nagm.',
      cta1: 'Create a company account', cta2: 'Sign up as a recruiter',
    },
  },
  about: {
    back: 'Back to home', join: 'Join Nagm',
    hero: {
      eyebrow: 'About Nagm · Our mission and story',
      title: ['Closing the distance between what people can do', 'and what companies need.'],
      body: "We believe the hiring journey starts with better understanding: the candidate knows how to present their experience and which opportunities suit it, and the company finds the information and tools it needs to assess applicants and follow up with them. That's why Nagm brings profile building, match analysis, interview preparation and hiring management together in one platform.",
    },
    problem: {
      title: ['Experience that deserves to be understood.', 'Decisions that need a clearer picture.'],
      seekers: 'You may have the right experience, but presenting it in a clear CV, understanding how well it matches each job, and preparing for the interview take tools that help. Nagm gives you a place to build your professional profile, organise your CVs, analyse your fit with job requirements, practise your answers, and then track your applications after you apply.',
      companies: "As jobs and applicants multiply, information ends up spread across CVs, conversations and team notes. Nagm brings these steps into one connected workspace: from preparing the post and assessing applicants to managing stages and activities and reviewing a candidate's history, with the option to return to past applicants when a role that suits them comes up.",
    },
    philosophy: {
      title: ['How we build the Nagm experience'],
      cards: [
        { title: 'Abilities deserve a complete picture', body: 'We connect the CV with experience, skills and languages inside a professional profile, and back it with an AI summary. For developers, connecting GitHub adds a verified developer card to that picture.' },
        { title: 'Fit needs understanding', body: 'We help the candidate and the hiring team understand how the CV relates to the job requirements, through a score, details and recommendations that support the review and leave the decision to the people who make it.' },
        { title: 'Every step builds on the last', body: "We tie hiring stages to notes, conversations, activities and the candidate's history, so the team keeps working from shared information and benefits from its relationships with applicants in the roles that follow." },
      ],
    },
    region: {
      title: ['From the region, and close to its needs.'],
      body: 'We work across Cairo, Riyadh and Dubai, connecting product development to the needs of candidates and companies in the region.',
      cities: [
        { city: 'Cairo, Egypt', role: 'Product development and engineering.' },
        { city: 'Riyadh, Saudi Arabia', role: 'Company partnerships and Gulf expansion.' },
        { city: 'Dubai, UAE', role: 'Regional strategy and advisory.' },
      ],
      note: '',
    },
    cta: {
      title: ['Start with your experience.', 'Or with the people your team needs.'],
      body: "Whether you're preparing for a new career opportunity or looking for the right candidates for your company, Nagm gives you the tools to start and follow through on your next step.",
      cta1: 'Hire with Nagm', cta2: 'Join as a job seeker',
    },
  },
  pricing: {
    hero: {
      eyebrow: 'Nagm plans',
      title: ['Start with what you need today.', 'Choose what fits your next step.'],
      body: 'Plans for job seekers, independent recruiters and companies. Prices are shown in your currency with tax included, paid by card or wallet — or in instalments with Tamara on yearly plans in Saudi Arabia and the UAE.',
    },
    audience: { seekers: 'Job seekers', recruiters: 'Recruiters', companies: 'Companies' },
    interval: { month: 'Monthly', year: 'Yearly', save: 'Save 20%' },
    market: { label: 'Country', EG: 'Egypt', SA: 'Saudi Arabia', AE: 'UAE', INTL: 'International', vatNote: (rate) => `Prices include VAT (${rate}).`, noVat: 'Prices in US dollars.' },
    perMonth: '/ month', perYear: '/ year', billedYearly: (amount) => `Billed yearly at ${amount}`, billedMonthly: 'Renews monthly, cancel any time', free: 'Free', quote: 'Custom quote',
    mostPopular: 'Most popular', current: 'Your plan', startFree: 'Start for free', choose: (name) => `Choose ${name}`, contactSales: 'Contact sales',
    tamara: { title: 'Split it with Tamara', body: 'In Saudi Arabia and the UAE, pay the yearly plan in interest-free instalments with Tamara, subject to Tamara’s terms.', badge: 'Tamara available' },
    pay: { title: 'Ways to pay', body: 'We use licensed payment gateways in each market; your card details never touch Nagm’s servers.', card: 'mada, Visa and Mastercard', wallet: 'Mobile wallets in Egypt', tamara: 'Tamara instalments in KSA and the UAE', applePay: 'Apple Pay', invoice: 'A tax invoice for every payment' },
    addons: {
      eyebrow: 'Add-ons when you need them',
      title: 'Extend your plan without changing it.',
      body: 'Add-ons you buy once or monthly from inside your account.',
      items: [
        { name: 'Featured job for 30 days', body: 'Shown at the top of job results and your company page.' },
        { name: 'Extra team seat', body: 'Add a member to the workspace above the plan limit.' },
        { name: '100 AI matches pack', body: 'For hiring peaks, without upgrading the plan.' },
        { name: 'Featured company page', body: 'Put your company page and its jobs in front of candidates.' },
      ],
    },
    compare: { title: 'Compare the details', feature: 'Feature', unlimited: 'Unlimited', yes: 'Included', no: '—' },
    faq: {
      title: 'Frequently asked questions',
      items: [
        { q: 'Can I cancel at any time?', a: 'Yes. Monthly plans renew automatically and you can stop the renewal at any time from your subscription page; your plan stays active until the end of the paid period.' },
        { q: 'How does the yearly plan work?', a: 'It is paid once, up front, at 20% less than monthly. In Saudi Arabia and the UAE you can split it with Tamara; the plan activates as soon as the first instalment is approved.' },
        { q: 'Do prices include tax?', a: 'Yes. In Egypt, Saudi Arabia and the UAE prices are shown in local currency with VAT included, and you receive a tax invoice for every payment.' },
        { q: 'What happens when I reach a plan limit?', a: 'You see a clear message with the limit and what you have used, and you can upgrade or buy an add-on. Service is never cut off abruptly and your data is never deleted.' },
        { q: 'What is the difference between a recruiter plan and a company plan?', a: 'A recruiter plan is a personal workspace for one person. Company plans are a shared workspace with members, roles and permissions, and can carry the Verified company badge after verification.' },
        { q: 'Are my jobs published immediately?', a: 'Jobs from verified companies go live at once. Otherwise a job passes a quick review by the Nagm team before it appears on the board.' },
      ],
    },
    recruiterNote: 'Recruiter plans are a one-seat personal workspace. Jobs are reviewed before publishing, and the Verified badge is reserved for companies.',
    enterprise: { name: 'Enterprise', body: "Talk through your company's needs for jobs, team members and workspaces, and get a quote that fits your scale of use.", bullets: ['Define your expected hiring volume.', 'Discuss the number of users and workspaces.', 'Explore the options that suit your team.', 'Get a quote with clear scope and cost.'] },
    loading: 'Loading prices…', offline: 'Showing list prices; the amount may differ slightly at checkout.',
  },
};

export const siteText: Record<Lang, SiteText> = { ar, en };

export function useSiteText(): SiteText {
  return siteText[useLang()];
}
