import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLang } from '../i18n/lang';

export interface MenuItem {
  title: string;
  desc: string;
  icon: string;
  badge?: string;
  href: string;
  isExternal?: boolean;
}

export interface MenuColumn {
  category: string;
  categoryIcon: string;
  color: string;
  items: MenuItem[];
}

export const getProductColumns = (isAr: boolean): MenuColumn[] => [
  {
    category: isAr ? 'التوظيف والتأهيل' : 'Hire & Qualify',
    categoryIcon: '💼',
    color: '#6366F1',
    items: [
      {
        title: isAr ? 'البحث الذكي والمطابقة سداسية الأبعاد' : 'AI Sourcing & 6D Match',
        desc: isAr
          ? 'متجهات دلالية تصنف تلقائياً أفضل 5% من المرشحين من بين الآلاف.'
          : 'Semantic vectors rank the top 5% candidates automatically from thousands.',
        icon: '🎯',
        badge: isAr ? 'ذكاء اصطناعي' : 'AI-Native',
        href: '/features/ai-matching',
      },
      {
        title: isAr ? 'نظام كانبان لتتبع المرشحين (9 مراحل)' : '9-Stage Kanban ATS',
        desc: isAr
          ? 'مسار مرئي لمتابعة المتقدمين مع مراحل وملاحظات قابلة للتخصيص.'
          : 'Visual applicant tracking pipeline with customizable stages and notes.',
        icon: '📊',
        href: '/features/kanban-ats',
      },
      {
        title: isAr ? 'استعادة الكفاءات السابقة' : 'Candidate Rediscovery',
        desc: isAr
          ? 'إعادة تدوير المرشحين المؤهلين السابقين بنقرة واحدة وبدون تكلفة إضافية.'
          : '1-click recycling of past qualified applicants at zero additional cost.',
        icon: '🔁',
        badge: isAr ? 'بدون تكلفة' : 'Zero Cost',
        href: '/features/candidate-rediscovery',
      },
      {
        title: isAr ? 'التحقق المعتمد للشركات (KYB)' : 'Enterprise KYB Verification',
        desc: isAr
          ? 'تدقيق وقراءة ضوئية آلية للسجلات التجارية والبطاقات الضريبية.'
          : 'Automated OCR auditing of Commercial Registrations & Tax Cards.',
        icon: '🛡️',
        badge: isAr ? 'موثق' : 'Verified',
        href: '/features/kyb-verification',
      },
    ],
  },
  {
    category: isAr ? 'تمكين المسار المهني' : 'Career Empowerment',
    categoryIcon: '🚀',
    color: '#EC4899',
    items: [
      {
        title: isAr ? 'محرك السير الذاتية ثنائي اللغة (BiDi)' : 'Arabic/English BiDi CV Engine',
        desc: isAr
          ? 'تصدير ملفات PDF عصرية متوافقة مع أنظمة ATS بدون عكس للحروف العربية.'
          : 'Export modern ATS-proof PDFs with zero Arabic letter reversal.',
        icon: '📄',
        badge: isAr ? 'RTL أصيل' : 'True RTL',
        href: '/features/bidi-resume',
      },
      {
        title: isAr ? 'تقييم ATS المفسَّر' : 'Explainable ATS Scoring',
        desc: isAr
          ? 'تحليل عميق للسيرة الذاتية مع نصائح قابلة للتطبيق وتحليل فجوات المهارات.'
          : 'Deep resume analysis with actionable feedback and skill gap insights.',
        icon: '✨',
        href: '/features/ats-analysis',
      },
      {
        title: isAr ? 'محاكي مقابلات STAR' : 'STAR Interview Simulator',
        desc: isAr
          ? 'تدريب سلوكي بالذكاء الاصطناعي متوافق مع مبادئ القيادة العالمية.'
          : 'AI behavioural coaching aligned with global unicorn leadership principles.',
        icon: '🎙️',
        href: '/features/interview-coach',
      },
      {
        title: isAr ? 'ملفات المطورين الموثقة' : 'Verified Developer Profiles',
        desc: isAr
          ? 'تحليل حي لأكواد GitHub مع تفصيل للغات البرمجة وأهم المستودعات.'
          : 'Live GitHub code analysis with language breakdowns & showcase repos.',
        icon: '💻',
        badge: isAr ? 'جديد' : 'New',
        href: '/features/verified-developer',
      },
    ],
  },
  {
    category: isAr ? 'المنصة والذكاء الاصطناعي' : 'Platform & Intelligence',
    categoryIcon: '⚡',
    color: '#10B981',
    items: [
      {
        title: isAr ? 'توجيه النماذج اللغوية المتعددة' : 'Multi-Model LLM Routing',
        desc: isAr
          ? 'دمج DeepSeek وClaude Bedrock مع كاش SHA-256 لتوفير 70% من التكلفة.'
          : 'DeepSeek + Claude Bedrock with SHA-256 caching (70% cost reduction).',
        icon: '🧠',
        badge: isAr ? 'أداء عالٍ' : 'High Scale',
        href: '/features/ai-matching',
      },
      {
        title: isAr ? 'تعدد المستأجرين للشركات' : 'Enterprise Multi-Tenancy',
        desc: isAr
          ? 'مساحات عمل مفصولة مع 6 أدوار وصلاحيات دقيقة للفريق.'
          : 'Segregated entity workspaces with 6 granular workspace RBAC roles.',
        icon: '👥',
        href: '/solutions/enterprise',
      },
      {
        title: isAr ? 'التوظيف التواصلي عبر واتساب' : 'WhatsApp Conversational Intake',
        desc: isAr
          ? 'استقبال طلبات التقديم وفهم اللهجات المحلية مباشرة عبر الهاتف.'
          : 'Mobile-first applicant intake and dialect parsing for field talent.',
        icon: '💬',
        badge: isAr ? 'عبر الهاتف' : 'Mobile-First',
        href: '/solutions/sales',
      },
      {
        title: isAr ? 'خصوصية البيانات والتشفير' : 'Data Privacy & Encryption',
        desc: isAr
          ? 'تشفير AES-256 للتوكنات والامتثال لمعايير GDPR والتواجد الإقليمي.'
          : 'AES-256 token encryption, GDPR right-to-be-forgotten & regional compliance.',
        icon: '🔒',
        href: '/features/kyb-verification',
      },
    ],
  },
];

export const getSolutionsColumns = (isAr: boolean): MenuColumn[] => [
  {
    category: isAr ? 'حسب التخصص والقطاع' : 'By Hiring Vertical',
    categoryIcon: '🏢',
    color: '#F59E0B',
    items: [
      {
        title: isAr ? 'المبيعات وخدمة العملاء' : 'Sales & Customer Care',
        desc: isAr
          ? 'فرق المبيعات الهاتفية، مدراء الحسابات، ومراكز الاتصال.'
          : 'Telesales, account managers, BPO agents, and commercial teams.',
        icon: '📞',
        href: '/solutions/sales',
      },
      {
        title: isAr ? 'التجزئة والضيافة' : 'Retail & Hospitality',
        desc: isAr
          ? 'مدراء المتاجر، موظفو البيع بالتجزئة، الكاشير، وفرق الفنادق.'
          : 'Store managers, frontline retail staff, cashiers, and hotel teams.',
        icon: '🛍️',
        href: '/solutions/retail',
      },
      {
        title: isAr ? 'التعليم والمعلمون' : 'Education & Teachers',
        desc: isAr
          ? 'المعلمون، الأكاديميون، وإداريو المدارس والمؤسسات التعليمية.'
          : 'K-12 educators, private academic tutors, and school administrators.',
        icon: '🎓',
        href: '/solutions/education',
      },
      {
        title: isAr ? 'العمليات وسلاسل الإمداد' : 'Operations & Logistics',
        desc: isAr
          ? 'مشرفو المستودعات، منسقو الخدمات اللوجستية، وسلاسل الإمداد.'
          : 'Warehouse supervisors, logistics coordinators, and supply chain staff.',
        icon: '🚚',
        href: '/solutions/logistics',
      },
    ],
  },
  {
    category: isAr ? 'حسب حجم الشركة' : 'By Company Scale',
    categoryIcon: '🏛️',
    color: '#8B5CF6',
    items: [
      {
        title: isAr ? 'الشركات الناشئة والصغيرة' : 'Emerging Startups & SMBs',
        desc: isAr
          ? 'اشتراك اقتصادي بـ 120$/شهرياً لتوظيف أفضل الكفاءات دون وكالات باهظة.'
          : 'Affordable $120/mo subscription to hire top talent without expensive agencies.',
        icon: '🌱',
        href: '/solutions/smb',
      },
      {
        title: isAr ? 'الشركات المتوسطة والكبرى' : 'Mid-Market & Enterprises',
        desc: isAr
          ? 'مساحات عمل متعددة المقاعد، صلاحيات مخصصة، وتحقق آلي KYB.'
          : 'Multi-seat workspaces, custom permissions, and KYB automated compliance.',
        icon: '🏢',
        href: '/solutions/enterprise',
      },
    ],
  },
];

export const getWhyNagmColumns = (isAr: boolean): MenuColumn[] => [
  {
    category: isAr ? 'المزايا الجوهرية لنجم' : 'The Structural Advantages',
    categoryIcon: '🛡️',
    color: '#3B82F6',
    items: [
      {
        title: isAr ? 'لماذا تختار الفرق نجم' : 'Why Teams Choose Nagm',
        desc: isAr
          ? 'مقارنة مباشرة: نجم مقابل المنصات الإقليمية القديمة وأنظمة ATS الغربية.'
          : 'Direct comparison: Nagm vs. Legacy Regional Job Boards vs. Western ATS.',
        icon: '⚔️',
        badge: isAr ? 'القوة التنافسية' : 'The Moat',
        href: '/why-nagm',
      },
      {
        title: isAr ? 'ضمان عدم تجاهل المرشحين' : 'Anti-Ghosting Guarantee',
        desc: isAr
          ? 'القضاء على "الثقب الأسود للسير الذاتية" بإشعارات حالة فورية للمتقدمين.'
          : 'Eliminating the "Resume Black Hole" with real-time status notifications.',
        icon: '🔔',
        href: '/why-nagm',
      },
      {
        title: isAr ? 'بيئة توظيف موثوقة خالية من الاحتيال' : 'Fraud-Free Employer Trust',
        desc: isAr
          ? 'تدقيق السجل التجاري لمنع الوظائف الوهمية والاحتيالية.'
          : 'Commercial Registration (CR) auditing preventing scam & ghost job posts.',
        icon: '✅',
        href: '/features/kyb-verification',
      },
      {
        title: isAr ? 'دعم عربي BiDi أصيل' : 'Native Arabic BiDi Support',
        desc: isAr
          ? 'بدون أي تشويه أو قلب للحروف في السير الذاتية بالشرق الأوسط.'
          : 'Zero letter inversion or corruption for Middle Eastern resumes.',
        icon: '🌍',
        href: '/features/bidi-resume',
      },
    ],
  },
];

export const productColumns: MenuColumn[] = getProductColumns(false);
export const solutionsColumns: MenuColumn[] = getSolutionsColumns(false);
export const whyNagmColumns: MenuColumn[] = getWhyNagmColumns(false);

export const MegaMenu: React.FC = () => {
  const [activeMenu, setActiveMenu] = useState<'products' | 'solutions' | 'why' | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const lang = useLang();
  const isAr = lang === 'ar';

  const currentProductColumns = getProductColumns(isAr);
  const currentSolutionsColumns = getSolutionsColumns(isAr);
  const currentWhyNagmColumns = getWhyNagmColumns(isAr);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setActiveMenu(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleItemClick = (item: MenuItem) => {
    setActiveMenu(null);
    if (item.isExternal) {
      window.location.href = item.href;
    } else {
      navigate(item.href);
    }
  };

  return (
    <div ref={menuRef} className="ng-megamenu-wrapper" style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: 4 }}>
      {/* Products Trigger */}
      <div
        className="ng-nav-dropdown-trigger"
        onMouseEnter={() => setActiveMenu('products')}
        onClick={() => setActiveMenu(activeMenu === 'products' ? null : 'products')}
      >
        <button
          type="button"
          className={`ng-nav-btn ${activeMenu === 'products' ? 'active' : ''}`}
          aria-expanded={activeMenu === 'products'}
        >
          <span>{isAr ? 'المنتجات' : 'Products'}</span>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className={`ng-chevron ${activeMenu === 'products' ? 'rotate' : ''}`}>
            <path d="M6 9l6 6 6-6" />
          </svg>
        </button>
      </div>

      {/* Solutions Trigger */}
      <div
        className="ng-nav-dropdown-trigger"
        onMouseEnter={() => setActiveMenu('solutions')}
        onClick={() => setActiveMenu(activeMenu === 'solutions' ? null : 'solutions')}
      >
        <button
          type="button"
          className={`ng-nav-btn ${activeMenu === 'solutions' ? 'active' : ''}`}
          aria-expanded={activeMenu === 'solutions'}
        >
          <span>{isAr ? 'الحلول' : 'Solutions'}</span>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className={`ng-chevron ${activeMenu === 'solutions' ? 'rotate' : ''}`}>
            <path d="M6 9l6 6 6-6" />
          </svg>
        </button>
      </div>

      {/* Why Nagm Trigger */}
      <div
        className="ng-nav-dropdown-trigger"
        onMouseEnter={() => setActiveMenu('why')}
        onClick={() => setActiveMenu(activeMenu === 'why' ? null : 'why')}
      >
        <button
          type="button"
          className={`ng-nav-btn ${activeMenu === 'why' ? 'active' : ''}`}
          aria-expanded={activeMenu === 'why'}
        >
          <span>{isAr ? 'لماذا نجم' : 'Why Nagm'}</span>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className={`ng-chevron ${activeMenu === 'why' ? 'rotate' : ''}`}>
            <path d="M6 9l6 6 6-6" />
          </svg>
        </button>
      </div>

      {/* Mega Menu Dropdown Panes */}
      {activeMenu && (
        <div
          className="ng-megamenu-panel"
          onMouseLeave={() => setActiveMenu(null)}
        >
          {activeMenu === 'products' && (
            <div className="ng-megamenu-grid-3">
              {currentProductColumns.map((col) => (
                <div key={col.category} className="ng-megamenu-column">
                  <div className="ng-megamenu-col-header" style={{ borderBottomColor: col.color }}>
                    <span className="ng-col-icon">{col.categoryIcon}</span>
                    <span className="ng-col-title" style={{ color: col.color }}>{col.category}</span>
                  </div>
                  <div className="ng-megamenu-items">
                    {col.items.map((item) => (
                      <div
                        key={item.title}
                        className="ng-megamenu-item"
                        onClick={() => handleItemClick(item)}
                      >
                        <div className="ng-item-icon-box">{item.icon}</div>
                        <div className="ng-item-content">
                          <div className="ng-item-header">
                            <span className="ng-item-title">{item.title}</span>
                            {item.badge && (
                              <span className="ng-item-badge">{item.badge}</span>
                            )}
                          </div>
                          <p className="ng-item-desc">{item.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeMenu === 'solutions' && (
            <div className="ng-megamenu-grid-2">
              {currentSolutionsColumns.map((col) => (
                <div key={col.category} className="ng-megamenu-column">
                  <div className="ng-megamenu-col-header" style={{ borderBottomColor: col.color }}>
                    <span className="ng-col-icon">{col.categoryIcon}</span>
                    <span className="ng-col-title" style={{ color: col.color }}>{col.category}</span>
                  </div>
                  <div className="ng-megamenu-items">
                    {col.items.map((item) => (
                      <div
                        key={item.title}
                        className="ng-megamenu-item"
                        onClick={() => handleItemClick(item)}
                      >
                        <div className="ng-item-icon-box">{item.icon}</div>
                        <div className="ng-item-content">
                          <div className="ng-item-header">
                            <span className="ng-item-title">{item.title}</span>
                            {item.badge && (
                              <span className="ng-item-badge">{item.badge}</span>
                            )}
                          </div>
                          <p className="ng-item-desc">{item.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeMenu === 'why' && (
            <div className="ng-megamenu-grid-1">
              {currentWhyNagmColumns.map((col) => (
                <div key={col.category} className="ng-megamenu-column">
                  <div className="ng-megamenu-col-header" style={{ borderBottomColor: col.color }}>
                    <span className="ng-col-icon">{col.categoryIcon}</span>
                    <span className="ng-col-title" style={{ color: col.color }}>{col.category}</span>
                  </div>
                  <div className="ng-megamenu-items">
                    {col.items.map((item) => (
                      <div
                        key={item.title}
                        className="ng-megamenu-item"
                        onClick={() => handleItemClick(item)}
                      >
                        <div className="ng-item-icon-box">{item.icon}</div>
                        <div className="ng-item-content">
                          <div className="ng-item-header">
                            <span className="ng-item-title">{item.title}</span>
                            {item.badge && (
                              <span className="ng-item-badge">{item.badge}</span>
                            )}
                          </div>
                          <p className="ng-item-desc">{item.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
