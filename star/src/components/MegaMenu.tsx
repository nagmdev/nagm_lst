import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

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

export const productColumns: MenuColumn[] = [
  {
    category: 'Hire & Qualify',
    categoryIcon: '💼',
    color: '#6366F1',
    items: [
      {
        title: 'AI Sourcing & 6D Match',
        desc: 'Semantic vectors rank the top 5% candidates automatically from thousands.',
        icon: '🎯',
        badge: 'AI-Native',
        href: '/features/ai-matching',
      },
      {
        title: '9-Stage Kanban ATS',
        desc: 'Visual applicant tracking pipeline with customizable stages and notes.',
        icon: '📊',
        href: '/features/kanban-ats',
      },
      {
        title: 'Candidate Rediscovery',
        desc: '1-click recycling of past qualified applicants at zero additional cost.',
        icon: '🔁',
        badge: 'Zero Cost',
        href: '/features/candidate-rediscovery',
      },
      {
        title: 'Enterprise KYB Verification',
        desc: 'Automated OCR auditing of Commercial Registrations & Tax Cards.',
        icon: '🛡️',
        badge: 'Verified',
        href: '/features/kyb-verification',
      },
    ],
  },
  {
    category: 'Career Empowerment',
    categoryIcon: '🚀',
    color: '#EC4899',
    items: [
      {
        title: 'Arabic/English BiDi CV Engine',
        desc: 'Export modern ATS-proof PDFs with zero Arabic letter reversal.',
        icon: '📄',
        badge: 'True RTL',
        href: '/features/bidi-resume',
      },
      {
        title: 'Explainable ATS Scoring',
        desc: 'Deep resume analysis with actionable feedback and skill gap insights.',
        icon: '✨',
        href: '/features/ats-analysis',
      },
      {
        title: 'STAR Interview Simulator',
        desc: 'AI behavioural coaching aligned with global unicorn leadership principles.',
        icon: '🎙️',
        href: '/features/interview-coach',
      },
      {
        title: 'Verified Developer Profiles',
        desc: 'Live GitHub code analysis with language breakdowns & showcase repos.',
        icon: '💻',
        badge: 'New',
        href: '/features/verified-developer',
      },
    ],
  },
  {
    category: 'Platform & Intelligence',
    categoryIcon: '⚡',
    color: '#10B981',
    items: [
      {
        title: 'Multi-Model LLM Routing',
        desc: 'DeepSeek + Claude Bedrock with SHA-256 caching (70% cost reduction).',
        icon: '🧠',
        badge: 'High Scale',
        href: '/features/ai-matching',
      },
      {
        title: 'Enterprise Multi-Tenancy',
        desc: 'Segregated entity workspaces with 6 granular workspace RBAC roles.',
        icon: '👥',
        href: '/solutions/enterprise',
      },
      {
        title: 'WhatsApp Conversational Intake',
        desc: 'Mobile-first applicant intake and dialect parsing for field talent.',
        icon: '💬',
        badge: 'Mobile-First',
        href: '/solutions/sales',
      },
      {
        title: 'Data Privacy & Encryption',
        desc: 'AES-256 token encryption, GDPR right-to-be-forgotten & regional compliance.',
        icon: '🔒',
        href: '/features/kyb-verification',
      },
    ],
  },
];

export const solutionsColumns: MenuColumn[] = [
  {
    category: 'By Hiring Vertical',
    categoryIcon: '🏢',
    color: '#F59E0B',
    items: [
      {
        title: 'Sales & Customer Care',
        desc: 'Telesales, account managers, BPO agents, and commercial teams.',
        icon: '📞',
        href: '/solutions/sales',
      },
      {
        title: 'Retail & Hospitality',
        desc: 'Store managers, frontline retail staff, cashiers, and hotel teams.',
        icon: '🛍️',
        href: '/solutions/retail',
      },
      {
        title: 'Education & Teachers',
        desc: 'K-12 educators, private academic tutors, and school administrators.',
        icon: '🎓',
        href: '/solutions/education',
      },
      {
        title: 'Operations & Logistics',
        desc: 'Warehouse supervisors, logistics coordinators, and supply chain staff.',
        icon: '🚚',
        href: '/solutions/logistics',
      },
    ],
  },
  {
    category: 'By Company Scale',
    categoryIcon: '🏛️',
    color: '#8B5CF6',
    items: [
      {
        title: 'Emerging Startups & SMBs',
        desc: 'Affordable $120/mo subscription to hire top talent without expensive agencies.',
        icon: '🌱',
        href: '/solutions/smb',
      },
      {
        title: 'Mid-Market & Enterprises',
        desc: 'Multi-seat workspaces, custom permissions, and KYB automated compliance.',
        icon: '🏢',
        href: '/solutions/enterprise',
      },
    ],
  },
];

export const whyNagmColumns: MenuColumn[] = [
  {
    category: 'The Structural Advantages',
    categoryIcon: '🛡️',
    color: '#3B82F6',
    items: [
      {
        title: 'Why Teams Choose Nagm',
        desc: 'Direct comparison: Nagm vs. Legacy Regional Job Boards vs. Western ATS.',
        icon: '⚔️',
        badge: 'The Moat',
        href: '/why-nagm',
      },
      {
        title: 'Anti-Ghosting Guarantee',
        desc: 'Eliminating the "Resume Black Hole" with real-time status notifications.',
        icon: '🔔',
        href: '/why-nagm',
      },
      {
        title: 'Fraud-Free Employer Trust',
        desc: 'Commercial Registration (CR) auditing preventing scam & ghost job posts.',
        icon: '✅',
        href: '/features/kyb-verification',
      },
      {
        title: 'Native Arabic BiDi Support',
        desc: 'Zero letter inversion or corruption for Middle Eastern resumes.',
        icon: '🌍',
        href: '/features/bidi-resume',
      },
    ],
  },
];

export const MegaMenu: React.FC = () => {
  const [activeMenu, setActiveMenu] = useState<'products' | 'solutions' | 'why' | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
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
          <span>Products</span>
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
          <span>Solutions</span>
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
          <span>Why Nagm</span>
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
              {productColumns.map((col) => (
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
              {solutionsColumns.map((col) => (
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
              {whyNagmColumns.map((col) => (
                <div key={col.category} className="ng-megamenu-column">
                  <div className="ng-megamenu-col-header" style={{ borderBottomColor: col.color }}>
                    <span className="ng-col-icon">{col.categoryIcon}</span>
                    <span className="ng-col-title" style={{ color: col.color }}>{col.category}</span>
                  </div>
                  <div className="ng-megamenu-items ng-grid-2-sub">
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

          {/* Footer Bar inside Mega Menu */}
          <div className="ng-megamenu-footer">
            <div className="ng-mm-footer-text">
              <strong>Need a customized enterprise solution or high-volume hiring setup?</strong>
            </div>
            <div className="ng-mm-footer-links">
              <button
                type="button"
                className="ng-mm-footer-btn"
                onClick={() => { setActiveMenu(null); navigate('/solutions/enterprise'); }}
              >
                <span>Explore Enterprise Solutions</span>
                <span>→</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
