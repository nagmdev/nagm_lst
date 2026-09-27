import { useLang } from './lang';

export interface LandingStrings {
  isAr: boolean;
  nav: {
    jobs: string;
    pricing: string;
    about: string;
    tour: string;
    login: string;
    getStarted: string;
  };
  hero: {
    badge: string;
    titlePart1: string;
    titlePart2: string;
    subtitle: string;
    buildCvFree: string;
    hireWithNagm: string;
    card1Name: string;
    card1Title: string;
    card1Ats: string;
    card2Title: string;
    card2Desc: string;
  };
  metrics: {
    title: string;
    subtitle: string;
    totalUsers: string;
    thisWeek: (n: number) => string;
    jobsPosted: string;
    applications: string;
    jobViews: string;
    liveViews: string;
    companies: string;
    verified: string;
    avgAtsScore: string;
    points: (n: number) => string;
  };
  twoSides: {
    overline: string;
    title: string;
    candidates: {
      title: string;
      desc: string;
      bullets: string[];
      btn: string;
    };
    companies: {
      title: string;
      desc: string;
      bullets: string[];
      btn: string;
    };
  };
  aiMoat: {
    badge: string;
    title: string;
    desc: string;
    layers: {
      tag: string;
      title: string;
      desc: string;
    }[];
  };
  differentiators: {
    overline: string;
    title: string;
    cards: {
      icon: string;
      title: string;
      desc: string;
    }[];
  };
  pricing: {
    overline: string;
    title: string;
    popular: string;
    plans: {
      aud: string;
      name: string;
      price: string;
      per: string;
      featured: boolean;
      feats: string[];
      btn: string;
    }[];
  };
  finalCta: {
    title: string;
    desc: (users: string, companies: number) => string;
    buildCvFree: string;
    hireWithNagm: string;
  };
  footer: {
    tagline: string;
    copy: string;
  };
}

export const AR_LANDING: LandingStrings = {
  isAr: true,
  nav: {
    jobs: 'الوظائف',
    pricing: 'الأسعار',
    about: 'عن نجم',
    tour: 'جولة',
    login: 'تسجيل الدخول',
    getStarted: 'ابدأ الآن',
  },
  hero: {
    badge: 'الأولى باللغة العربية · توظيف مدعوم بالذكاء الاصطناعي',
    titlePart1: 'أنشئ سيرتك الذاتية. قدّم. ',
    titlePart2: 'احصل على الوظيفة.',
    subtitle:
      'تحوّل نجم سيرتك الذاتية إلى بيانات منظمة تتيح للشركات التوظيف فوراً دون معالجة PDF معقدة. تجربة عربية أصيلة، متكاملة مع واتساب، ومدعومة بالذكاء الاصطناعي في كل خطوة.',
    buildCvFree: 'أنشئ سيرتك الذاتية — مجاناً',
    hireWithNagm: 'وظّف مع نجم',
    card1Name: 'سارة منصور',
    card1Title: 'مهندسة برمجيات · القاهرة',
    card1Ats: 'توافق ATS 92',
    card2Title: 'مطابقة ذكية',
    card2Desc: 'توافق قوي مع متطلبات React والمحتوى العربي لهذه الوظيفة',
  },
  metrics: {
    title: 'مؤشرات المنصة الحية',
    subtitle: 'نشاط المنصة الإجمالي في الوقت الفعلي · للعرض فقط',
    totalUsers: 'إجمالي المستخدمين',
    thisWeek: (n: number) => `+${n} هذا الأسبوع`,
    jobsPosted: 'الوظائف المنشورة',
    applications: 'طلبات التقديم',
    jobViews: 'مشاهدات الوظائف',
    liveViews: 'مشاهدات مباشرة',
    companies: 'الشركات',
    verified: 'موثقة',
    avgAtsScore: 'متوسط درجة ATS',
    points: (n: number) => `+${n} نقاط`,
  },
  twoSides: {
    overline: 'منصة واحدة، وجهان',
    title: 'حيث تلتقي الكفاءات والشركات أخيراً',
    candidates: {
      title: 'للباحثين عن عمل',
      desc: 'صانع سير ذاتية احترافي بالعربية والإنجليزية، وذكاء اصطناعي يكتب معك، ومسار حقيقي من السيرة الذاتية إلى الوظيفة.',
      bullets: [
        'قوالب عربية RTL وإنجليزية احترافية + تصدير PDF',
        'ذكاء اصطناعي يكتب ويحسّن ويخصص سيرتك الذاتية لكل وظيفة',
        'تقييم فوري لدرجة ATS وتوصيات وظيفية مخصصة',
        'متابعة طلبات التقديم مع تنبيهات فورية بحالة التوظيف',
      ],
      btn: 'استكشف بوابة المرشحين',
    },
    companies: {
      title: 'للشركات ومسؤولي التوظيف',
      desc: 'نظام تتبع طلبات توظيف (ATS) متكامل مع مطابقة ذكية، بيانات منظمة، وتواصل عبر واتساب لضمان عدم ضياع أفضل الكفاءات.',
      bullets: [
        'مسار توظيف كانبان من 9 مراحل مع بطاقات تقييم',
        'مطابقة دلالية سداسية الأبعاد (المهارات، الخبرة، والمتجهات)',
        'استعادة المرشحين — إعادة تدوير الكفاءات السابقة بنقرة واحدة وبدون تكلفة',
        'تحقق آلي من السجل التجاري والبطاقة الضريبية للشركات (KYB)',
      ],
      btn: 'استكشف بوابة التوظيف',
    },
  },
  aiMoat: {
    badge: 'القوة التقنية للذكاء الاصطناعي',
    title: 'الذكاء الاصطناعي الذي يفهم السير الذاتية العربية بدقة',
    desc: 'يتم تحويل كل مرشح وسيرة ذاتية ووصف وظيفي إلى متجهات باستخدام pgvector. محرك ثلاثي الطبقات يفرز، يقيّم، ثم يفسر — بالعربية أو الإنجليزية.',
    layers: [
      {
        tag: 'L1',
        title: 'فلترة المعايير الأساسية',
        desc: 'الموقع، الأهلية، سنوات الخبرة، واللغة — يتم استبعاد غير المتطابقين فوراً.',
      },
      {
        tag: 'L2',
        title: 'درجة المتجهات (0-100)',
        desc: 'تشابه المتجهات وقواعد الفرز لإنتاج درجة مفهومة ومفسرة لكل مرشح مقارنة بمتطلبات الوظيفة.',
      },
      {
        tag: 'L3',
        title: 'إعادة الترتيب والشرح التوليدي',
        desc: 'نموذج ذكاء اصطناعي يعيد الترتيب ويكتب تقرير "لماذا هذا المرشح" بالعربية أو الإنجليزية.',
      },
    ],
  },
  differentiators: {
    overline: 'لماذا تتفوق نجم',
    title: 'صُممت لمنطقة الشرق الأوسط وشمال أفريقيا، وليست مجرد ترجمة',
    cards: [
      {
        icon: '🇪🇬',
        title: 'دعم عربي أصيل (RTL)',
        desc: 'قوالب وذكاء اصطناعي بجودة عربية فائقة — بالضبط حيث تفشل الأدوات العالمية.',
      },
      {
        icon: '💬',
        title: 'تكامل أصيل مع واتساب',
        desc: 'تقديم، تنبيهات، جدولة مقابلات، وعروض عمل مباشرة عبر محادثات واتساب.',
      },
      {
        icon: '🧩',
        title: 'بيانات مهيكلة ومنظمة',
        desc: 'كل سيرة ذاتية تتحول لبيانات قابلة للفرز والبحث فوراً — بدون أخطاء قراءة PDF.',
      },
      {
        icon: '🔁',
        title: 'استعادة الكفاءات السابقة',
        desc: 'إعادة تدوير فورية وبنقرة واحدة لقواعد المتقدمين السابقين بدون تكلفة إضافية.',
      },
      {
        icon: '✅',
        title: 'أصحاب عمل موثقون رسمياً',
        desc: 'قراءة ضوئية آلية وتدقيق رسمي للسجل التجاري والبطاقة الضريبية.',
      },
      {
        icon: '📊',
        title: 'استخبارات الرواتب الإقليمية',
        desc: 'مؤشرات وتوقعات رواتب واقعية مستمدة من بيانات سوق العمل الإقليمي.',
      },
    ],
  },
  pricing: {
    overline: 'خطط الأسعار',
    title: 'مجاناً للمواهب. ويتدرج مع نمو الشركات.',
    popular: 'الأكثر طلباً',
    plans: [
      {
        aud: 'للباحثين عن عمل',
        name: 'مجاني',
        price: '$0',
        per: '',
        featured: false,
        feats: ['قالب واحد + علامة مائية', 'تقييم ATS أساسي', 'التقديم على الوظائف'],
        btn: 'ابدأ مجاناً',
      },
      {
        aud: 'للباحثين عن عمل',
        name: 'المحترف (Pro)',
        price: '$5',
        per: '/شهرياً',
        featured: true,
        feats: ['جميع القوالب · بدون علامة مائية', 'باقة ذكاء اصطناعي كاملة', 'رابط سيرة ذاتية عام ومشارك'],
        btn: 'الترقية للمحترف',
      },
      {
        aud: 'للشركات',
        name: 'الاحترافي السنوي',
        price: '$120',
        per: '/شهرياً (1,440$/سنوياً)',
        featured: true,
        feats: [
          'بحث غير محدود في المرشحين',
          'مسار ATS كانبان كامل بـ 9 مراحل',
          'مطابقة ذكية سداسية الأبعاد بالمتجهات',
          'تحقق آلي من السجل التجاري (KYB)',
          'مساحات عمل وأدوار للفريق',
        ],
        btn: 'ابدأ التوظيف الآن',
      },
      {
        aud: 'للشركات',
        name: 'المؤسسات (Enterprise)',
        price: 'مخصص',
        per: '',
        featured: false,
        feats: [
          'وظائف ومقاعد غير محدودة',
          'إدارة مسارات توظيف متعددة للوكالات',
          'مدير حساب مخصص واتفاقية مستوى الخدمة SLA',
          'استضافة بيانات محلية في السعودية والإمارات',
        ],
        btn: 'تواصل مع المبيعات',
      },
    ],
  },
  finalCta: {
    title: 'احكِ قصتك كما ينبغي. بالذكاء الاصطناعي.',
    desc: (users, companies) =>
      `انضم إلى أكثر من ${users} مرشح و ${companies} شركات توظف بالفعل عبر نجم.`,
    buildCvFree: 'أنشئ سيرتك الذاتية — مجاناً',
    hireWithNagm: 'وظّف مع نجم',
  },
  footer: {
    tagline: 'احكِها كما ينبغي. بالذكاء الاصطناعي.',
    copy: '© 2026 نجم · القاهرة · الرياض · دبي',
  },
};

export const EN_LANDING: LandingStrings = {
  isAr: false,
  nav: {
    jobs: 'Jobs',
    pricing: 'Pricing',
    about: 'About',
    tour: 'Tour',
    login: 'Sign in',
    getStarted: 'Get started',
  },
  hero: {
    badge: 'Arabic-first · AI-native hiring',
    titlePart1: 'Build your CV. Apply. ',
    titlePart2: 'Get hired.',
    subtitle:
      'Nagm turns the CV you build into structured data companies can hire from instantly — no PDF parsing. Arabic-first, WhatsApp-native, powered by AI at every step.',
    buildCvFree: 'Build your CV — free',
    hireWithNagm: 'Hire with Nagm',
    card1Name: 'Sara Mansour',
    card1Title: 'Software Engineer · Cairo',
    card1Ats: 'ATS 92',
    card2Title: 'AI match',
    card2Desc: 'Strong React + Arabic content match for this role',
  },
  metrics: {
    title: 'Live Platform Metrics',
    subtitle: 'Real-time aggregate platform activity · Read-only',
    totalUsers: 'Total Users',
    thisWeek: (n: number) => `+${n} this week`,
    jobsPosted: 'Jobs Posted',
    applications: 'Applications',
    jobViews: 'Job Views',
    liveViews: 'Live views',
    companies: 'Companies',
    verified: 'Verified',
    avgAtsScore: 'Avg ATS Score',
    points: (n: number) => `+${n} points`,
  },
  twoSides: {
    overline: 'One platform, two sides',
    title: 'Where talent and companies finally meet',
    candidates: {
      title: 'For candidates',
      desc: 'A beautiful Arabic & English CV builder, AI that writes with you, and a real path from CV to hired.',
      bullets: [
        'Arabic RTL & English templates + PDF export',
        'AI writes, improves & tailors your CV to a job',
        'Instant ATS score & job recommendations',
        'Track applications with real-time status alerts',
      ],
      btn: 'Explore candidate app',
    },
    companies: {
      title: 'For companies & recruiters',
      desc: 'A full ATS with AI matching, structured candidate data, and WhatsApp-native outreach that stops candidates slipping away.',
      bullets: [
        '9-Stage Kanban hiring pipeline with scorecards',
        '6D semantic matching (skills, tenure & vectors)',
        'Candidate Rediscovery — 1-click recycling at zero cost',
        'Enterprise KYB automated Commercial Registration verification',
      ],
      btn: 'Explore recruiter app',
    },
  },
  aiMoat: {
    badge: 'The AI moat',
    title: 'The AI that actually understands Arabic CVs',
    desc: 'Every candidate, resume and job is embedded with pgvector. A three-layer engine filters, scores, then explains — in Arabic or English.',
    layers: [
      {
        tag: 'L1',
        title: 'Hard filters',
        desc: 'Location, eligibility, years of experience, language — non-matches drop out instantly.',
      },
      {
        tag: 'L2',
        title: 'Vector score 0–100',
        desc: 'pgvector similarity + rules produce an explainable score per candidate against the JD.',
      },
      {
        tag: 'L3',
        title: 'LLM re-rank & explain',
        desc: 'An LLM re-ranks and writes “why this candidate” in Arabic or English.',
      },
    ],
  },
  differentiators: {
    overline: 'Why Nagm wins',
    title: 'Built for MENA, not adapted for it',
    cards: [
      {
        icon: '🇪🇬',
        title: 'True Arabic RTL',
        desc: 'Arabic-quality templates & AI — exactly where rivals are weak.',
      },
      {
        icon: '💬',
        title: 'WhatsApp-native',
        desc: 'Apply, alerts, scheduling & offers via conversational intake.',
      },
      {
        icon: '🧩',
        title: 'Structured data',
        desc: 'Every CV is filterable data — no PDF parsing, ever.',
      },
      {
        icon: '🔁',
        title: 'Candidate Rediscovery',
        desc: '1-click zero-cost re-indexing of past applicant pools.',
      },
      {
        icon: '✅',
        title: 'Verified employer',
        desc: 'Automated OCR for Commercial Registration & Tax Card validation.',
      },
      {
        icon: '📊',
        title: 'Salary intelligence',
        desc: 'Salary signals from real regional platform data.',
      },
    ],
  },
  pricing: {
    overline: 'Pricing',
    title: 'Free for talent. Scales for companies.',
    popular: 'Popular',
    plans: [
      {
        aud: 'Candidate',
        name: 'Free',
        price: '$0',
        per: '',
        featured: false,
        feats: ['1 template + watermark', 'Basic ATS score', 'Apply to jobs'],
        btn: 'Get started free',
      },
      {
        aud: 'Candidate',
        name: 'Pro',
        price: '$5',
        per: '/mo',
        featured: true,
        feats: ['All templates · no watermark', 'Full AI quota', 'Public CV link'],
        btn: 'Upgrade to Pro',
      },
      {
        aud: 'Company',
        name: 'Annual Pro',
        price: '$120',
        per: '/mo ($1,440/yr)',
        featured: true,
        feats: [
          'Unlimited candidate search',
          'Full 9-Stage ATS pipeline',
          '6D AI vector matching',
          'Automated KYB verification',
          'Team workspaces & roles',
        ],
        btn: 'Start hiring now',
      },
      {
        aud: 'Company',
        name: 'Enterprise',
        price: 'Custom',
        per: '',
        featured: false,
        feats: [
          'Unlimited jobs & seats',
          'Agency multi-pipeline mode',
          'Dedicated success & SLA',
          'KSA / UAE data residency',
        ],
        btn: 'Contact sales',
      },
    ],
  },
  finalCta: {
    title: 'Tell your story right. With AI.',
    desc: (users, companies) =>
      `Join ${users} candidates and ${companies} companies already hiring on Nagm.`,
    buildCvFree: 'Build your CV — free',
    hireWithNagm: 'Hire with Nagm',
  },
  footer: {
    tagline: 'Tell it right. With AI.',
    copy: '© 2026 Nagm.io · Cairo · Riyadh · Dubai',
  },
};

export function useLandingText(): LandingStrings {
  const lang = useLang();
  return lang === 'ar' ? AR_LANDING : EN_LANDING;
}
