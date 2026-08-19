export interface FeatureBenefit {
  title: string;
  desc: string;
  stat?: string;
  statLabel?: string;
}

export interface FeatureStep {
  number: string;
  title: string;
  desc: string;
}

export interface FeatureFaq {
  q: string;
  a: string;
}

export interface FeatureData {
  slug: string;
  title: string;
  headline: string;
  subheadline: string;
  badge: string;
  category: 'Hire & ATS' | 'Candidate Suite' | 'Intelligence & Infra';
  categoryColor: string;
  icon: string;
  targetAudience: 'employers' | 'candidates' | 'both';
  primaryCtaText: string;
  primaryCtaRole: 'recruiter' | 'candidate';
  benefits: FeatureBenefit[];
  steps: FeatureStep[];
  interactiveType: 'match-radar' | 'kanban-demo' | 'bidi-preview' | 'ats-gauge' | 'kyb-audit' | 'developer-card' | 'rediscovery' | 'analytics-funnel';
  faqs: FeatureFaq[];
}

export const FEATURES_MAP: Record<string, FeatureData> = {
  'ai-matching': {
    slug: 'ai-matching',
    title: 'AI Sourcing & 6D Match',
    headline: 'Instantly Identify the Top 5% of Qualified Candidates',
    subheadline: 'Multi-dimensional semantic matching that scores skills, experience, verified code repositories, and career relevance across thousands of applicants in seconds.',
    badge: 'AI-Powered Matching',
    category: 'Hire & ATS',
    categoryColor: '#6366F1',
    icon: '🎯',
    targetAudience: 'employers',
    primaryCtaText: 'Start Matching Candidates',
    primaryCtaRole: 'recruiter',
    benefits: [
      {
        title: '6-Dimensional Vector Scoring',
        desc: 'Evaluates required skills, years of verified tenure, domain authority, languages, and semantic career similarity.',
        stat: '94%',
        statLabel: 'Match Precision',
      },
      {
        title: 'Zero Manual Keyword Skimming',
        desc: 'Eliminates 30+ hours per week of manual resume skimming by instantly surfacing candidates with proven relevance.',
        stat: '30+ hrs',
        statLabel: 'Saved per Recruiter / Week',
      },
      {
        title: 'Explainable AI Match Breakdown',
        desc: 'Every match score includes transparent, bulleted reasoning in Arabic and English explaining why this applicant is recommended.',
        stat: '100%',
        statLabel: 'Explainable Reasoning',
      },
    ],
    steps: [
      { number: '01', title: 'Post or Import Job Requirements', desc: 'Define your desired skills, experience levels, language preferences, and work mode in natural language.' },
      { number: '02', title: '6D Vector Analysis Runs Instantly', desc: 'Our dual-model AI extracts structured vectors from applicant profiles and GitHub codebases.' },
      { number: '03', title: 'Ranked Shortlist with Scorecards', desc: 'Review ranked applicant cards with highlighted matching skills and instant interview scheduling.' },
    ],
    interactiveType: 'match-radar',
    faqs: [
      { q: 'How does Nagm avoid traditional ATS keyword gaming?', a: 'Nagm analyzes semantic meaning and verified proof (e.g. GitHub repos, actual project deliverables, and structured skill graphs) rather than raw keyword repetition.' },
      { q: 'Does the matching work for Arabic and English profiles?', a: 'Yes. Nagm is natively bilingual and processes Arabic dialect CVs, English resumes, and hybrid regional formats with equal fidelity.' },
    ],
  },

  'kanban-ats': {
    slug: 'kanban-ats',
    title: '9-Stage Visual Kanban ATS',
    headline: 'Manage Your Entire Hiring Pipeline in One Visual Workspace',
    subheadline: 'Drag-and-drop candidates through customizable pipeline stages from applied to hired, complete with team scorecards, stage velocity metrics, and automated notifications.',
    badge: 'Recruiter Workflow',
    category: 'Hire & ATS',
    categoryColor: '#6366F1',
    icon: '📊',
    targetAudience: 'employers',
    primaryCtaText: 'Launch Your Hiring Pipeline',
    primaryCtaRole: 'recruiter',
    benefits: [
      {
        title: 'Collaborative Team Scorecards',
        desc: 'Allow interviewers and hiring managers to leave standardized ratings and notes without leaking salary or private candidate data.',
        stat: '9 Stages',
        statLabel: 'From Applied to Hired',
      },
      {
        title: 'Automated Status Synchronization',
        desc: 'Moving a card automatically updates candidate tracking portals in real time, preventing candidate ghosting.',
        stat: '0%',
        statLabel: 'Candidate Ghosting',
      },
      {
        title: 'Stage Bottleneck Detection',
        desc: 'Identify which stages cause candidate drop-off and optimize time-to-hire across your entire hiring team.',
        stat: '12 Days',
        statLabel: 'Avg Time-to-Hire',
      },
    ],
    steps: [
      { number: '01', title: 'Customize Your Workflow', desc: 'Configure custom stages: Screen, Tech Assessment, Interview, Background Check, and Offer.' },
      { number: '02', title: 'Drag & Drop Pipeline', desc: 'Easily move applicants between columns with instant audit logging of all actions.' },
      { number: '03', title: 'Make Confident Offers', desc: 'Generate offer letters and manage onboarding all from within the workspace.' },
    ],
    interactiveType: 'kanban-demo',
    faqs: [
      { q: 'Can multiple recruiters collaborate on the same job?', a: 'Yes. Nagm supports 6 workspace roles (Owner, Admin, Recruiter, Hiring Manager, Interviewer, Viewer) with fine-grained access control.' },
      { q: 'Can I export applicant data?', a: 'Yes. You can export filtered candidate lists, pipeline summaries, and structured profiles securely.' },
    ],
  },

  'candidate-rediscovery': {
    slug: 'candidate-rediscovery',
    title: '1-Click Candidate Rediscovery',
    headline: 'Stop Paying to Re-Source Candidates You Already Screened',
    subheadline: 'Unlock the hidden value in your existing applicant pool. When you open a new job, Nagm automatically re-scores past qualified runner-ups at zero additional sourcing cost.',
    badge: 'Cost Reduction',
    category: 'Hire & ATS',
    categoryColor: '#6366F1',
    icon: '🔁',
    targetAudience: 'employers',
    primaryCtaText: 'Explore Talent Rediscovery',
    primaryCtaRole: 'recruiter',
    benefits: [
      {
        title: 'Instant Silver-Medalist Matching',
        desc: 'Automatically discovers candidates who reached late interview stages for past jobs and matches them with your new opening.',
        stat: '$0',
        statLabel: 'Re-sourcing Cost',
      },
      {
        title: 'No Stale Databases',
        desc: 'Candidate profiles auto-update when applicants add new certifications, languages, or GitHub projects.',
        stat: '1-Click',
        statLabel: 'Talent Pool Activation',
      },
      {
        title: 'Reduced Time-to-Fill',
        desc: 'Fill urgent positions in days instead of weeks by reaching out to pre-vetted candidates already interested in your company.',
        stat: '3x Faster',
        statLabel: 'Time-to-Offer',
      },
    ],
    steps: [
      { number: '01', title: 'Open New Job Opening', desc: 'Publish a new role or position within your verified company workspace.' },
      { number: '02', title: 'Automatic Talent Pool Scan', desc: 'Nagm matches your new job against every past applicant across all your previous listings.' },
      { number: '03', title: 'Instant Outreach', desc: 'Directly invite high-match previous applicants to the new role in one click.' },
    ],
    interactiveType: 'rediscovery',
    faqs: [
      { q: 'Is my candidate database shared with competitor companies?', a: 'Never. Your applicant database and internal candidate ratings are strictly isolated inside your private multi-tenant workspace.' },
    ],
  },

  'kyb-verification': {
    slug: 'kyb-verification',
    title: 'Enterprise KYB Verification',
    headline: 'Automated Commercial Registration & Tax Card Auditing',
    subheadline: 'Eliminate scam job posts and ghost employers across MENA. Nagm uses automated OCR inspection to verify official company documents before jobs can go live.',
    badge: 'Trust & Safety',
    category: 'Hire & ATS',
    categoryColor: '#6366F1',
    icon: '🛡️',
    targetAudience: 'employers',
    primaryCtaText: 'Verify Your Company',
    primaryCtaRole: 'recruiter',
    benefits: [
      {
        title: 'Instant OCR Document Validation',
        desc: 'Upload Commercial Registration (CR) and Tax Card PDFs; OCR extracts company registration number, legal name, and tax ID automatically.',
        stat: '100%',
        statLabel: 'Verified Legal Entities',
      },
      {
        title: 'Verified Employer Badge',
        desc: 'Verified companies receive a trust badge on all job postings, boosting high-quality candidate applications by over 60%.',
        stat: '+60%',
        statLabel: 'Application Conversion',
      },
      {
        title: 'Zero Ghost Postings',
        desc: 'Protects candidates from identity theft and phantom listings, creating a safe, professional hiring ecosystem.',
        stat: '0',
        statLabel: 'Fake Listings Allowed',
      },
    ],
    steps: [
      { number: '01', title: 'Work Email Verification', desc: 'Verify your corporate email address with an instant 6-digit secure code.' },
      { number: '02', title: 'Upload Official Documents', desc: 'Attach official Commercial Registration and Tax Card documents in PDF or image format.' },
      { number: '03', title: 'Instant OCR Verification & Activation', desc: 'Our AI extracts legal credentials and provisions your verified corporate workspace.' },
    ],
    interactiveType: 'kyb-audit',
    faqs: [
      { q: 'What documents are required to post jobs on Nagm?', a: 'Companies must provide a valid Commercial Registration (CR) and Tax Card from their respective country of operation (Egypt, Saudi Arabia, UAE, etc.).' },
    ],
  },

  'bidi-resume': {
    slug: 'bidi-resume',
    title: 'Arabic/English BiDi Resume Builder',
    headline: 'Create ATS-Proof Resumes with Native Arabic Typography',
    subheadline: 'Stop losing job opportunities to corrupted Arabic formatting and reversed letters. Nagm’s bidirectional rendering engine guarantees pixel-perfect Arabic & English PDF exports.',
    badge: 'True Arabic RTL',
    category: 'Candidate Suite',
    categoryColor: '#EC4899',
    icon: '📄',
    targetAudience: 'candidates',
    primaryCtaText: 'Build Your Free Arabic CV',
    primaryCtaRole: 'candidate',
    benefits: [
      {
        title: 'Zero Letter Disconnection',
        desc: 'Engineered with embedded Noto Sans Arabic to eliminate disjointed or inverted Arabic typography completely.',
        stat: '100%',
        statLabel: 'Font & Layout Integrity',
      },
      {
        title: 'Modern ATS-Friendly Templates',
        desc: 'Structured single-column and dual-column layouts designed to parse cleanly in global and regional applicant tracking systems.',
        stat: '5+',
        statLabel: 'Curated Templates',
      },
      {
        title: 'Instant Bilingual PDF Export',
        desc: 'Switch between Arabic RTL and English LTR layouts with one click without re-typing your career history.',
        stat: '1-Click',
        statLabel: 'Language Switch',
      },
    ],
    steps: [
      { number: '01', title: 'Enter Your Career Details', desc: 'Fill in work history, education, certifications, and skills in Arabic or English.' },
      { number: '02', title: 'AI Enhances Bullet Points', desc: 'Our AI suggests action verbs and impactful metrics tailored to your industry.' },
      { number: '03', title: 'Download Clean PDF', desc: 'Export your professional, ATS-ready resume with zero watermarks or formatting glitches.' },
    ],
    interactiveType: 'bidi-preview',
    faqs: [
      { q: 'Is the resume builder really free for candidates?', a: 'Yes! Candidates can build, edit, and download their standard resumes for free.' },
    ],
  },

  'ats-analysis': {
    slug: 'ats-analysis',
    title: 'AI Resume Score & Gap Analysis',
    headline: 'Optimize Your Resume to Pass Every ATS Filter',
    subheadline: 'Scan your resume against any target job description to get a breakdown of missing keywords, formatting errors, and actionable suggestions to double your interview callbacks.',
    badge: 'Instant AI Audit',
    category: 'Candidate Suite',
    categoryColor: '#EC4899',
    icon: '✨',
    targetAudience: 'candidates',
    primaryCtaText: 'Audit Your Resume Now',
    primaryCtaRole: 'candidate',
    benefits: [
      {
        title: 'Real ATS Compatibility Score',
        desc: 'Get an objective 0–100 score analyzing keyword density, structure, section headings, and experience relevance.',
        stat: '0–100',
        statLabel: 'Compatibility Score',
      },
      {
        title: 'Actionable Keyword Recommendations',
        desc: 'Discover critical technical and soft skills present in the job description that are missing from your resume.',
        stat: '2x',
        statLabel: 'Higher Callback Rate',
      },
      {
        title: 'Bilingual AI Suggestions',
        desc: 'Receive clear, bulleted improvement advice in Arabic or English to rewrite weak bullet points into measurable achievements.',
        stat: 'Instant',
        statLabel: 'Analysis in < 5s',
      },
    ],
    steps: [
      { number: '01', title: 'Upload or Select Your CV', desc: 'Upload your existing PDF or select a resume built on Nagm.' },
      { number: '02', title: 'Paste Target Job Description', desc: 'Enter the job post or select a live opening on Nagm.' },
      { number: '03', title: 'Review Instant Audit Report', desc: 'See your overall score, missing keywords, and 1-click tailored suggestions.' },
    ],
    interactiveType: 'ats-gauge',
    faqs: [
      { q: 'How many times can I scan my CV?', a: 'Candidates get free daily scans with full feedback and suggestions.' },
    ],
  },

  'interview-coach': {
    slug: 'interview-coach',
    title: 'STAR Interview Simulator',
    headline: 'Master Behavioral & Technical Interviews with AI Coaching',
    subheadline: 'Practice real leadership and situational questions using the proven STAR method (Situation, Task, Action, Result) with instant, constructive AI grading.',
    badge: 'Career Coaching',
    category: 'Candidate Suite',
    categoryColor: '#EC4899',
    icon: '🎙️',
    targetAudience: 'candidates',
    primaryCtaText: 'Start Interview Practice',
    primaryCtaRole: 'candidate',
    benefits: [
      {
        title: 'Global Leadership Frameworks',
        desc: 'Questions modeled on top tech and corporate leadership principles: Customer Obsession, Ownership, Bias for Action, and Deliver Results.',
        stat: '500+',
        statLabel: 'Curated Questions',
      },
      {
        title: 'STAR Structured Feedback',
        desc: 'AI grades each component of your response: Did you clarify the Situation? Was the Action specific? Did you quantify Results?',
        stat: '4-Part',
        statLabel: 'STAR Scoring Rubric',
      },
      {
        title: 'Bilingual Practice',
        desc: 'Practice speaking or typing in Arabic or English to build confidence before walking into real recruiter meetings.',
        stat: 'Bilingual',
        statLabel: 'Arabic & English AI',
      },
    ],
    steps: [
      { number: '01', title: 'Select Position & Principle', desc: 'Choose your desired job role (e.g. Sales Manager, Frontend Engineer) and competency.' },
      { number: '02', title: 'Record or Type Your Answer', desc: 'Formulate your answer using the interactive STAR guide helper.' },
      { number: '03', title: 'Get Instant Score & Tips', desc: 'Receive constructive feedback highlighting strengths and exact areas for refinement.' },
    ],
    interactiveType: 'bidi-preview',
    faqs: [
      { q: 'What is the STAR method?', a: 'STAR stands for Situation, Task, Action, Result. It is the global standard for structuring compelling behavioral interview answers.' },
    ],
  },

  'verified-developer': {
    slug: 'verified-developer',
    title: 'GitHub Verified Developer Profiles',
    headline: 'Prove Your Skills with Code, Not Just Bullet Points',
    subheadline: 'Connect your GitHub account to generate an AI-verified developer card showing your top programming languages, active repositories, star counts, and seniority signals.',
    badge: 'Code Verified',
    category: 'Candidate Suite',
    categoryColor: '#EC4899',
    icon: '💻',
    targetAudience: 'both',
    primaryCtaText: 'Connect GitHub Profile',
    primaryCtaRole: 'candidate',
    benefits: [
      {
        title: 'Real Code Proof',
        desc: 'Analyzes original public repositories (ignoring forks), calculating byte-level language percentages and star counts.',
        stat: '100%',
        statLabel: 'Verified Tech Skills',
      },
      {
        title: 'AI Seniority & Domain Analysis',
        desc: 'DeepSeek AI evaluates repository complexity to summarize primary engineering domain (Frontend, Backend, DevOps, Data/AI).',
        stat: 'AES-256',
        statLabel: 'Encrypted Security',
      },
      {
        title: 'Stand Out to Tech Recruiters',
        desc: 'Verified skills boost match scores in recruiter searches and highlight your showcase projects directly on your profile.',
        stat: '3 Showcase',
        statLabel: 'Top Featured Projects',
      },
    ],
    steps: [
      { number: '01', title: 'Connect GitHub with OAuth', desc: 'One-click secure connection with encrypted token storage.' },
      { number: '02', title: 'Automatic Repo Analysis', desc: 'Our engine computes language breakdown and extracts showcase repositories.' },
      { number: '03', title: 'Verified Badge & Profile Card', desc: 'Recruiters see your verified languages and code activity alongside your resume.' },
    ],
    interactiveType: 'developer-card',
    faqs: [
      { q: 'Does Nagm access private repositories?', a: 'No. Nagm only inspects public repositories that you choose to showcase.' },
      { q: 'Can I disconnect my GitHub account?', a: 'Yes. Disconnecting immediately hard-deletes all stored access tokens and normalized payload data.' },
    ],
  },
};
