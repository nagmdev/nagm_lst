import type { Lang } from './lang';

/**
 * The Terms of Service and the Privacy Policy, in Arabic and English.
 *
 * Written from what the platform actually does (see backend: auth, billing,
 * AI features, storage, account deletion). When a practice changes, change the
 * text here and the `updated` date.
 */
export interface LegalSection { id: string; title: string; body: string[]; list?: string[] }
export interface LegalDoc { title: string; updated: string; intro: string; sections: LegalSection[] }

const UPDATED = { ar: '25 أكتوبر 2026', en: '25 October 2026' };
const SUPPORT = 'support@nagm.io';

const termsEn: LegalDoc = {
  title: 'Terms of Service',
  updated: UPDATED.en,
  intro: 'These terms apply to nagm.io and app.nagm.io ("Nagm"). By creating an account or using Nagm, you agree to them. If you do not agree, please do not use Nagm.',
  sections: [
    {
      id: 'accounts', title: '1. Your account',
      body: ['You need an account to use most of Nagm. Keep your details accurate and your password private; you are responsible for what happens under your account.'],
      list: [
        'You must be at least 18 years old.',
        'One email address is one account. A company registers with its own business email.',
        'Tell us at ' + SUPPORT + ' straight away if you think someone else has used your account.',
      ],
    },
    {
      id: 'types', title: '2. Account types',
      body: ['Nagm has three kinds of account, and each comes with its own responsibilities.'],
      list: [
        'Job seekers build a profile and CV, use the career tools and apply to jobs.',
        'Independent recruiters hire on their own, in a personal workspace. Nagm reviews their job posts before they go live.',
        'Companies register their organisation and upload their commercial registration and tax card. Nagm may approve or refuse a company, and may ask for more documents. Team members join a company by invitation, with the role the company gives them.',
      ],
    },
    {
      id: 'use', title: '3. Using Nagm properly',
      body: ['You agree not to:'],
      list: [
        'post jobs that do not exist, mislead candidates, or ask candidates to pay to apply or to be hired;',
        'discriminate unlawfully against candidates;',
        'use candidate information for anything other than recruiting for the job they applied to, or copy it out of Nagm in bulk;',
        'scrape, overload, probe or break the security of Nagm, or use it to send spam;',
        'upload content that is unlawful, infringes others\' rights, or contains malware.',
      ],
    },
    {
      id: 'content', title: '4. Your content',
      body: [
        'You keep ownership of what you add to Nagm: your profile, CVs, job posts, notes and documents. You give Nagm the permission it needs to host, process, display and share that content in order to run the service you use, including sending your application to the company you apply to and analysing it with the AI features you choose to use.',
        'You are responsible for having the right to share what you upload.',
      ],
    },
    {
      id: 'ai', title: '5. AI features',
      body: ['Nagm uses AI to help write and analyse CVs, compare a profile with a job, draft job posts and practise interviews. Its results are suggestions, may be incomplete or wrong, and do not replace your own judgement. Hiring decisions are always made by the employer, not by Nagm.'],
    },
    {
      id: 'billing', title: '6. Paid plans and billing',
      body: ['Some features need a paid plan. The plan page shows what each plan includes and its price before you pay.'],
      list: [
        'Prices are in your country\'s currency and include VAT. Once you have paid, your account keeps your country\'s prices.',
        'Monthly plans renew automatically on the saved card until you cancel. Yearly plans are paid once a year.',
        'You can cancel at any time. Your plan stays active until the end of the period you paid for, and then returns to the free plan.',
        'If a renewal cannot be charged, you have 3 days to pay before the plan ends.',
        'Changing plan in the middle of a period credits the unused time of your current plan against the new one.',
        'Card payments are processed by Paymob, and instalments by Tamara under its own terms. Nagm never sees or stores your full card number.',
        'Payments are not refundable except where the law requires it, or where Nagm agrees to a refund (for example, a duplicate or mistaken charge). Write to ' + SUPPORT + ' about a charge.',
      ],
    },
    {
      id: 'end', title: '7. Suspending or closing an account',
      body: ['You can close your account from your account settings, or by writing to us. Nagm may suspend or close an account that breaks these terms, puts others at risk, or is used fraudulently. Where it is fair and lawful, we will tell you why.'],
    },
    {
      id: 'liability', title: '8. Our responsibility',
      body: [
        'Nagm is provided as it is. We work to keep it available and correct, but we do not promise that it will always be uninterrupted or free of errors, or that any application will lead to a job or any job post to a hire.',
        'As far as the law allows, Nagm is not liable for indirect or consequential losses, and our total liability for any claim is limited to what you paid Nagm in the 12 months before it.',
      ],
    },
    {
      id: 'changes', title: '9. Changes to these terms',
      body: ['We may update these terms. If a change matters, we will tell you in the app or by email before it takes effect. Continuing to use Nagm after that means you accept the new terms.'],
    },
    {
      id: 'law', title: '10. Law and contact',
      body: [
        'These terms are governed by the laws of the Arab Republic of Egypt, without limiting any rights the law of your own country gives you as a consumer.',
        'Questions: ' + SUPPORT + '.',
      ],
    },
  ],
};

const termsAr: LegalDoc = {
  title: 'شروط الخدمة',
  updated: UPDATED.ar,
  intro: 'تسري هذه الشروط على nagm.io وapp.nagm.io («نجم»). بإنشائك حساباً أو استخدامك نجم فأنت توافق عليها، وإن لم توافق فيُرجى عدم استخدام نجم.',
  sections: [
    {
      id: 'accounts', title: '1. حسابك',
      body: ['تحتاج إلى حساب لاستخدام معظم خدمات نجم. احرص على أن تكون بياناتك صحيحة وأن تبقى كلمة مرورك سرية، فأنت مسؤول عمّا يحدث من خلال حسابك.'],
      list: [
        'يجب ألا يقل عمرك عن 18 عاماً.',
        'لكل بريد إلكتروني حساب واحد، وتسجّل الشركة ببريد العمل الخاص بها.',
        'أبلغنا فوراً على ' + SUPPORT + ' إذا اعتقدت أن شخصاً آخر استخدم حسابك.',
      ],
    },
    {
      id: 'types', title: '2. أنواع الحسابات',
      body: ['في نجم ثلاثة أنواع من الحسابات، ولكل منها مسؤولياته.'],
      list: [
        'الباحث عن عمل: يبني ملفه المهني وسيرته الذاتية، ويستخدم الأدوات المهنية، ويتقدّم للوظائف.',
        'مسؤول التوظيف المستقل: يوظّف لحسابه في مساحة عمل شخصية، وتراجع نجم وظائفه قبل نشرها.',
        'الشركة: تسجّل مؤسستها وترفع السجل التجاري والبطاقة الضريبية. يحق لنجم قبول الشركة أو رفضها وطلب مستندات إضافية. وينضم أعضاء الفريق إلى الشركة بدعوة منها وبالدور الذي تحدده لهم.',
      ],
    },
    {
      id: 'use', title: '3. الاستخدام السليم',
      body: ['توافق على ألا تقوم بما يلي:'],
      list: [
        'نشر وظائف غير حقيقية، أو تضليل المرشحين، أو مطالبتهم بدفع أي مبلغ للتقديم أو التوظيف؛',
        'التمييز غير القانوني ضد المرشحين؛',
        'استخدام بيانات المرشحين لأي غرض غير التوظيف للوظيفة التي تقدّموا لها، أو نسخها خارج نجم بكميات كبيرة؛',
        'استخراج البيانات آلياً من نجم، أو إثقاله، أو محاولة اختراق حمايته، أو استخدامه لإرسال رسائل مزعجة؛',
        'رفع محتوى مخالف للقانون أو ينتهك حقوق الآخرين أو يحتوي على برمجيات ضارة.',
      ],
    },
    {
      id: 'content', title: '4. المحتوى الذي تضيفه',
      body: [
        'يبقى ما تضيفه إلى نجم ملكاً لك: ملفك المهني وسيرك الذاتية وإعلانات الوظائف والملاحظات والمستندات. وتمنح نجم الإذن اللازم لاستضافة هذا المحتوى ومعالجته وعرضه ومشاركته لتشغيل الخدمة التي تستخدمها، ومن ذلك إرسال طلبك إلى الشركة التي تتقدّم لها، وتحليله بأدوات الذكاء الاصطناعي التي تختار استخدامها.',
        'وأنت مسؤول عن امتلاكك الحق في مشاركة ما ترفعه.',
      ],
    },
    {
      id: 'ai', title: '5. أدوات الذكاء الاصطناعي',
      body: ['يستخدم نجم الذكاء الاصطناعي للمساعدة في كتابة السير الذاتية وتحليلها، ومقارنة الملف المهني بالوظيفة، وصياغة إعلانات الوظائف، والتدرّب على المقابلات. ونتائجه اقتراحات قد تكون ناقصة أو غير دقيقة، ولا تغني عن تقديرك الشخصي. وقرار التوظيف يتخذه صاحب العمل دائماً، لا نجم.'],
    },
    {
      id: 'billing', title: '6. الخطط المدفوعة والفوترة',
      body: ['تحتاج بعض الميزات إلى خطة مدفوعة. وتعرض صفحة الخطط ما تشمله كل خطة وسعرها قبل الدفع.'],
      list: [
        'الأسعار بعملة بلدك وشاملة ضريبة القيمة المضافة، وبعد أول دفع يحتفظ حسابك بأسعار بلدك.',
        'تتجدّد الخطط الشهرية تلقائياً على البطاقة المحفوظة إلى أن تلغيها، وتُدفع الخطط السنوية مرة كل عام.',
        'يمكنك الإلغاء في أي وقت، وتبقى خطتك فعّالة حتى نهاية المدة المدفوعة ثم تعود إلى الخطة المجانية.',
        'إذا تعذّر تحصيل التجديد فأمامك 3 أيام للدفع قبل انتهاء الخطة.',
        'عند تغيير الخطة في منتصف المدة، تُخصم قيمة الوقت غير المستخدم من خطتك الحالية من سعر الخطة الجديدة.',
        'تتم المدفوعات بالبطاقة عبر Paymob، والتقسيط عبر تمارا وفق شروطها. ولا يطّلع نجم على رقم بطاقتك كاملاً ولا يحفظه.',
        'المدفوعات غير قابلة للاسترداد إلا حيث يوجب القانون ذلك، أو حيث يوافق نجم على الاسترداد (مثل الخصم المكرر أو الخاطئ). راسلنا على ' + SUPPORT + ' بخصوص أي عملية خصم.',
      ],
    },
    {
      id: 'end', title: '7. إيقاف الحساب أو إغلاقه',
      body: ['يمكنك إغلاق حسابك من إعدادات الحساب أو بمراسلتنا. ويحق لنجم إيقاف أو إغلاق أي حساب يخالف هذه الشروط أو يعرّض الآخرين للخطر أو يُستخدم في الاحتيال، وسنوضّح لك السبب متى كان ذلك عادلاً ومسموحاً قانوناً.'],
    },
    {
      id: 'liability', title: '8. حدود مسؤوليتنا',
      body: [
        'نقدّم نجم بحالته الراهنة. ونعمل على أن يبقى متاحاً ودقيقاً، لكننا لا نضمن أن يعمل دون انقطاع أو أخطاء، ولا أن يؤدي أي طلب تقديم إلى وظيفة أو أي إعلان إلى توظيف.',
        'وفي الحدود التي يسمح بها القانون، لا يتحمّل نجم مسؤولية الخسائر غير المباشرة أو التبعية، ولا تتجاوز مسؤوليته الإجمالية عن أي مطالبة ما دفعته لنجم خلال الأشهر الاثني عشر السابقة لها.',
      ],
    },
    {
      id: 'changes', title: '9. تعديل هذه الشروط',
      body: ['قد نحدّث هذه الشروط. وإذا كان التعديل جوهرياً فسنخبرك داخل التطبيق أو بالبريد الإلكتروني قبل سريانه، واستمرارك في استخدام نجم بعد ذلك يعني قبولك للشروط الجديدة.'],
    },
    {
      id: 'law', title: '10. القانون والتواصل',
      body: [
        'تخضع هذه الشروط لقوانين جمهورية مصر العربية، دون المساس بأي حقوق يمنحها لك قانون بلدك بصفتك مستهلكاً.',
        'للاستفسارات: ' + SUPPORT + '.',
      ],
    },
  ],
};

const privacyEn: LegalDoc = {
  title: 'Privacy Policy',
  updated: UPDATED.en,
  intro: 'This policy explains what personal information Nagm (nagm.io and app.nagm.io) collects, why, who sees it, and the choices you have. Nagm does not sell your personal information.',
  sections: [
    {
      id: 'collect', title: '1. What we collect',
      body: ['We collect what you give us and what we need to run the service safely:'],
      list: [
        'Account: your name, email address, password (stored only as a one-way hash), account type, language and the country you signed up from.',
        'Profile and CVs (job seekers): phone number, photo, experience, education, skills, CV files and the answers you save when practising interviews.',
        'Applications: the jobs you apply to, what you send with them and how each application moves through the employer\'s stages.',
        'Hiring (recruiters and companies): company details, verification documents (commercial registration, tax card), job posts, notes, interview schedules and team members.',
        'Payments: invoices, plan, amounts and the payment provider\'s reference. For a saved card we keep only the provider\'s token, the card brand and its last 4 digits.',
        'Technical: IP address, browser and device, sign-in sessions and security logs.',
        'Usage: pages visited and actions in the app, through Google Analytics.',
      ],
    },
    {
      id: 'use', title: '2. How we use it',
      list: [
        'To run your account and the features you use: profiles, CVs, applications, job posts and hiring stages.',
        'To send you sign-in codes, receipts, renewal notices and notifications about your applications, jobs and team.',
        'To take payments, issue tax invoices and handle refunds.',
        'To verify companies and keep Nagm safe: preventing fraud, abuse and unauthorised access.',
        'To understand how Nagm is used and improve it.',
        'To meet legal and tax obligations.',
      ],
      body: [],
    },
    {
      id: 'ai', title: '3. AI processing',
      body: ['When you use an AI feature (CV analysis, matching a profile to a job, drafting a job post, interview practice), we send the text that feature needs to an AI provider: Anthropic\'s Claude through Amazon Bedrock, or DeepSeek. We send only what the feature needs, and we use the result only to give it back to you or to the employer you applied to.'],
    },
    {
      id: 'share', title: '4. Who can see your information',
      list: [
        'Companies you apply to: your application, CV and contact details. Recruiters can find a candidate in their talent search only if that candidate applied to one of their company\'s jobs.',
        'People you share your profile with: anyone with a share link you create, until you turn the link off.',
        'Your company\'s team: members see company data according to the role the company gives them.',
        'Nagm staff: only to support you, verify companies, review jobs and keep the platform safe.',
        'Service providers who run Nagm for us, bound to use the data only for that: Vercel (hosting), Neon (database), Amazon Web Services (file storage and AI), DeepSeek (AI), our email delivery provider, Paymob and Tamara (payments) and Google Analytics (usage).',
        'Authorities, when the law requires it.',
      ],
      body: [],
    },
    {
      id: 'transfer', title: '5. Where your data is stored',
      body: ['Our providers may store and process data outside your country, for example in the United States. We use providers with recognised security standards and share only what each one needs.'],
    },
    {
      id: 'retention', title: '6. How long we keep it',
      list: [
        'Your account and profile: for as long as the account exists.',
        'When you delete your account, your profile, CVs and files are deleted. If you have applications or job posts, write to support so we can close the account properly with the companies involved.',
        'Invoices and payment records: for as long as tax law requires.',
        'Security logs: only as long as they are needed to protect accounts.',
      ],
      body: [],
    },
    {
      id: 'rights', title: '7. Your rights',
      body: ['Under the data protection laws that apply to you (such as Egypt\'s Personal Data Protection Law and Saudi Arabia\'s Personal Data Protection Law), you can:'],
      list: [
        'see and correct your information, most of it directly in your profile;',
        'delete your account from your account settings;',
        'ask us (at ' + SUPPORT + ') for a copy of your data, or object to or limit how we use it;',
        'complain to your country\'s data protection authority.',
      ],
    },
    {
      id: 'cookies', title: '8. Cookies and local storage',
      list: [
        'Needed to sign you in: a secure session cookie on our API, a short-lived cookie that links nagm.io to the app when you sign in, and a cookie that remembers the accounts signed in on this browser.',
        'Preferences: your language and similar settings, kept in your browser.',
        'Analytics: Google Analytics in the app, to count visits and purchases.',
      ],
      body: [],
    },
    {
      id: 'security', title: '9. Security',
      body: ['Passwords are stored as one-way hashes, sign-in codes expire within minutes and lock after repeated wrong attempts, traffic is encrypted, and staff access is limited by role. No system is perfectly secure; if a breach affects you, we will tell you as the law requires.'],
    },
    {
      id: 'children', title: '10. Children',
      body: ['Nagm is for people aged 18 and over. We do not knowingly collect information from anyone younger.'],
    },
    {
      id: 'changes', title: '11. Changes and contact',
      body: [
        'We will update this policy when our practices change, and tell you in the app or by email when a change matters.',
        'Questions or requests about your data: ' + SUPPORT + '.',
      ],
    },
  ],
};

const privacyAr: LegalDoc = {
  title: 'سياسة الخصوصية',
  updated: UPDATED.ar,
  intro: 'توضّح هذه السياسة البيانات الشخصية التي يجمعها نجم (nagm.io وapp.nagm.io)، ولماذا، ومن يطّلع عليها، والخيارات المتاحة لك. ولا يبيع نجم بياناتك الشخصية.',
  sections: [
    {
      id: 'collect', title: '1. البيانات التي نجمعها',
      body: ['نجمع ما تقدّمه لنا وما نحتاجه لتشغيل الخدمة بأمان:'],
      list: [
        'الحساب: اسمك وبريدك الإلكتروني وكلمة المرور (تُحفظ بصيغة مشفّرة لا يمكن عكسها) ونوع الحساب واللغة والدولة التي سجّلت منها.',
        'الملف المهني والسير الذاتية (للباحثين عن عمل): رقم الهاتف والصورة والخبرات والتعليم والمهارات وملفات السيرة الذاتية والإجابات التي تحفظها عند التدرّب على المقابلات.',
        'طلبات التقديم: الوظائف التي تتقدّم لها وما ترسله معها وتنقّل كل طلب بين مراحل التوظيف لدى صاحب العمل.',
        'التوظيف (لمسؤولي التوظيف والشركات): بيانات الشركة ومستندات التوثيق (السجل التجاري والبطاقة الضريبية) وإعلانات الوظائف والملاحظات ومواعيد المقابلات وأعضاء الفريق.',
        'المدفوعات: الفواتير والخطة والمبالغ ومرجع مزوّد الدفع. وللبطاقة المحفوظة نحتفظ فقط برمز مزوّد الدفع ونوع البطاقة وآخر 4 أرقام منها.',
        'البيانات التقنية: عنوان IP والمتصفح والجهاز وجلسات تسجيل الدخول وسجلات الأمان.',
        'الاستخدام: الصفحات التي تزورها والإجراءات داخل التطبيق، عبر Google Analytics.',
      ],
    },
    {
      id: 'use', title: '2. كيف نستخدمها',
      list: [
        'لتشغيل حسابك والميزات التي تستخدمها: الملفات المهنية والسير الذاتية والطلبات والوظائف ومراحل التوظيف.',
        'لإرسال رموز الدخول والإيصالات وإشعارات التجديد والتنبيهات الخاصة بطلباتك ووظائفك وفريقك.',
        'لتحصيل المدفوعات وإصدار الفواتير الضريبية ومعالجة الاسترداد.',
        'لتوثيق الشركات وحماية نجم من الاحتيال وإساءة الاستخدام والدخول غير المصرّح به.',
        'لفهم طريقة استخدام نجم وتحسينه.',
        'للوفاء بالالتزامات القانونية والضريبية.',
      ],
      body: [],
    },
    {
      id: 'ai', title: '3. المعالجة بالذكاء الاصطناعي',
      body: ['عند استخدامك أداة ذكاء اصطناعي (تحليل السيرة الذاتية، أو مطابقة الملف بالوظيفة، أو صياغة إعلان وظيفة، أو التدرّب على المقابلات) نرسل النص الذي تحتاجه الأداة إلى مزوّد ذكاء اصطناعي: Claude من Anthropic عبر Amazon Bedrock، أو DeepSeek. ونرسل فقط ما تحتاجه الأداة، ولا نستخدم النتيجة إلا لعرضها عليك أو على صاحب العمل الذي تقدّمت له.'],
    },
    {
      id: 'share', title: '4. من يطّلع على بياناتك',
      list: [
        'الشركات التي تتقدّم لها: طلبك وسيرتك الذاتية وبيانات التواصل. ولا يجد مسؤول التوظيف المرشح في البحث عن الكفاءات إلا إذا تقدّم المرشح لإحدى وظائف شركته.',
        'من تشارك معهم ملفك: كل من يملك رابط المشاركة الذي أنشأته، إلى أن توقف الرابط.',
        'فريق شركتك: يطّلع الأعضاء على بيانات الشركة بحسب الدور الذي تمنحه لهم الشركة.',
        'فريق نجم: فقط لدعمك وتوثيق الشركات ومراجعة الوظائف والحفاظ على أمان المنصة.',
        'مزوّدو الخدمات الذين يشغّلون نجم لصالحنا، والملزمون باستخدام البيانات لهذا الغرض فقط: Vercel (الاستضافة)، وNeon (قاعدة البيانات)، وAmazon Web Services (تخزين الملفات والذكاء الاصطناعي)، وDeepSeek (الذكاء الاصطناعي)، ومزوّد إرسال البريد الإلكتروني، وPaymob وتمارا (المدفوعات)، وGoogle Analytics (الاستخدام).',
        'الجهات الرسمية، متى أوجب القانون ذلك.',
      ],
      body: [],
    },
    {
      id: 'transfer', title: '5. أين تُحفظ بياناتك',
      body: ['قد يحفظ مزوّدو الخدمات البيانات ويعالجونها خارج بلدك، ومن ذلك الولايات المتحدة. ونعتمد على مزوّدين ملتزمين بمعايير أمان معترف بها، ولا نشارك مع كل منهم إلا ما يحتاجه.'],
    },
    {
      id: 'retention', title: '6. مدة الاحتفاظ',
      list: [
        'الحساب والملف المهني: طوال وجود الحساب.',
        'عند حذف حسابك تُحذف ملفاتك المهنية وسيرك الذاتية وملفاتك. وإذا كانت لديك طلبات تقديم أو إعلانات وظائف فراسل الدعم لنغلق الحساب بشكل سليم مع الشركات المعنية.',
        'الفواتير وسجلات الدفع: طوال المدة التي يشترطها قانون الضرائب.',
        'سجلات الأمان: فقط طوال المدة اللازمة لحماية الحسابات.',
      ],
      body: [],
    },
    {
      id: 'rights', title: '7. حقوقك',
      body: ['وفقاً لقوانين حماية البيانات التي تسري عليك (مثل قانون حماية البيانات الشخصية المصري ونظام حماية البيانات الشخصية السعودي) يحق لك:'],
      list: [
        'الاطّلاع على بياناتك وتصحيحها، ومعظمها مباشرة من ملفك؛',
        'حذف حسابك من إعدادات الحساب؛',
        'طلب نسخة من بياناتك (على ' + SUPPORT + ')، أو الاعتراض على طريقة استخدامها أو تقييدها؛',
        'تقديم شكوى إلى جهة حماية البيانات في بلدك.',
      ],
    },
    {
      id: 'cookies', title: '8. ملفات تعريف الارتباط والتخزين المحلي',
      list: [
        'ضرورية لتسجيل دخولك: ملف جلسة آمن على خادمنا، وملف قصير العمر يربط nagm.io بالتطبيق عند تسجيل الدخول، وملف يتذكّر الحسابات المسجّلة على هذا المتصفح.',
        'التفضيلات: لغتك وما يشبهها، وتُحفظ في متصفحك.',
        'التحليلات: Google Analytics داخل التطبيق لاحتساب الزيارات وعمليات الشراء.',
      ],
      body: [],
    },
    {
      id: 'security', title: '9. الأمان',
      body: ['تُحفظ كلمات المرور بصيغة مشفّرة لا يمكن عكسها، وتنتهي صلاحية رموز الدخول خلال دقائق وتُقفل بعد المحاولات الخاطئة المتكررة، وتُشفّر البيانات أثناء نقلها، ويقتصر وصول الفريق على ما يحتاجه دوره. ولا يوجد نظام آمن تماماً، وإذا تأثّرت بياناتك باختراق فسنبلغك وفق ما يوجبه القانون.'],
    },
    {
      id: 'children', title: '10. الأطفال',
      body: ['نجم مخصّص لمن بلغوا 18 عاماً فأكثر، ولا نجمع عن قصد بيانات من هم أصغر سناً.'],
    },
    {
      id: 'changes', title: '11. التعديلات والتواصل',
      body: [
        'سنحدّث هذه السياسة عند تغيّر ممارساتنا، ونخبرك داخل التطبيق أو بالبريد الإلكتروني عندما يكون التعديل جوهرياً.',
        'للاستفسارات أو الطلبات المتعلقة ببياناتك: ' + SUPPORT + '.',
      ],
    },
  ],
};

export const LEGAL: Record<'terms' | 'privacy', Record<Lang, LegalDoc>> = {
  terms: { en: termsEn, ar: termsAr },
  privacy: { en: privacyEn, ar: privacyAr },
};
