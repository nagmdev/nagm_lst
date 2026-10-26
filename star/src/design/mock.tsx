import { useEffect, useLayoutEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react';

// Layout effects don't run when a page is rendered ahead of time; there a plain effect stands in.
const useBrowserLayoutEffect = typeof window === 'undefined' ? useEffect : useLayoutEffect;
import { useLang, type Lang } from '../i18n/lang';
import { Icon, type IconName } from './icons';

/**
 * Product mockups for nagm.io — the app's screens rebuilt in HTML at
 * marketing scale. They replace wireframe bars with what a visitor actually
 * wants to see: a candidate, a job, a score, a hiring board. Every person,
 * company and number here is sample data, written in both languages, so
 * the mockups translate and flip with the page like the product does.
 */

type T = { ar: string; en: string };
const tr = (lang: Lang, v: T) => v[lang];

/* ------------------------------------------------------------------ */
/* sample data                                                         */

export const SAMPLE = {
  job: { title: { ar: 'مهندس/ة Backend أول', en: 'Senior Backend Engineer' }, place: { ar: 'القاهرة · هجين', en: 'Cairo · Hybrid' } },
  company: { name: { ar: 'مدار للتقنية', en: 'Madar Tech' }, meta: { ar: 'برمجيات · القاهرة', en: 'Software · Cairo' } },
  people: {
    sara: { name: { ar: 'سارة منصور', en: 'Sara Mansour' }, role: { ar: 'مهندسة Backend', en: 'Backend engineer' }, city: { ar: 'القاهرة', en: 'Cairo' }, score: 86, hue: 0 },
    omar: { name: { ar: 'عمر خالد', en: 'Omar Khaled' }, role: { ar: 'مهندس DevOps', en: 'DevOps engineer' }, city: { ar: 'الرياض', en: 'Riyadh' }, score: 78, hue: 1 },
    layla: { name: { ar: 'ليلى حسن', en: 'Layla Hassan' }, role: { ar: 'مهندسة برمجيات', en: 'Software engineer' }, city: { ar: 'دبي', en: 'Dubai' }, score: 74, hue: 2 },
    yousef: { name: { ar: 'يوسف عادل', en: 'Yousef Adel' }, role: { ar: 'مطوّر Full-stack', en: 'Full-stack developer' }, city: { ar: 'الإسكندرية', en: 'Alexandria' }, score: 67, hue: 3 },
    nour: { name: { ar: 'نور سامي', en: 'Nour Sami' }, role: { ar: 'مهندسة بيانات', en: 'Data engineer' }, city: { ar: 'جدة', en: 'Jeddah' }, score: 91, hue: 4 },
    huda: { name: { ar: 'هدى فؤاد', en: 'Huda Fouad' }, role: { ar: 'مطوّرة Node.js', en: 'Node.js developer' }, city: { ar: 'القاهرة', en: 'Cairo' }, score: 58, hue: 5 },
    reem: { name: { ar: 'ريم عاطف', en: 'Reem Atef' }, role: { ar: 'مسؤولة توظيف', en: 'Recruiter' }, city: { ar: '', en: '' }, score: 0, hue: 6 },
    ahmed: { name: { ar: 'أحمد ناصر', en: 'Ahmed Nasser' }, role: { ar: 'مدير الهندسة', en: 'Engineering manager' }, city: { ar: '', en: '' }, score: 0, hue: 7 },
  },
  skills: ['Node.js', 'PostgreSQL', 'TypeScript', 'AWS', 'Redis'],
};
type PersonKey = keyof typeof SAMPLE.people;

const STAGES: { key: string; label: T }[] = [
  { key: 'applied', label: { ar: 'تقدّم', en: 'Applied' } },
  { key: 'screening', label: { ar: 'الفرز', en: 'Screening' } },
  { key: 'interview', label: { ar: 'المقابلة', en: 'Interview' } },
  { key: 'offer', label: { ar: 'العرض', en: 'Offer' } },
];

/* ------------------------------------------------------------------ */
/* atoms                                                               */

const HUES = [
  ['#6D5BF5', '#A23DEA'], ['#0891B2', '#15C7E0'], ['#C2410C', '#F59E0B'], ['#0F766E', '#34D399'],
  ['#7C3AED', '#EC4899'], ['#1D4ED8', '#60A5FA'], ['#BE185D', '#F472B6'], ['#334155', '#64748B'],
];

export function Avatar({ who, size = 32, ring }: { who: PersonKey; size?: number; ring?: boolean }) {
  const lang = useLang();
  const p = SAMPLE.people[who];
  // A zero-width non-joiner keeps Arabic initials as two letters instead of
  // fusing them into a word.
  const initials = tr(lang, p.name).split(/\s+/).map((w) => w[0]).slice(0, 2).join(lang === 'ar' ? '\u200C' : '');
  const [a, b] = HUES[p.hue % HUES.length];
  return (
    <span className="nm-avatar" aria-hidden="true" style={{ width: size, height: size, fontSize: size * 0.38, background: `linear-gradient(135deg, ${a}, ${b})`, boxShadow: ring ? '0 0 0 2px var(--panel)' : undefined }}>
      {initials}
    </span>
  );
}

const scoreTone = (s: number) => (s >= 80 ? 'ok' : s >= 65 ? 'brand' : 'warn');

export function ScorePill({ value }: { value: number }) {
  return <span className={`nm-score nm-score--${scoreTone(value)}`}><bdi>{value}</bdi></span>;
}

export function Ring({ value, size = 76, stroke = 7, label }: { value: number; size?: number; stroke?: number; label?: string }) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  return (
    <div className="nm-ring" style={{ width: size, height: size }} role="img" aria-label={label ? `${label}: ${value}/100` : `${value}/100`}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-hidden="true">
        <defs>
          <linearGradient id={`nmring${size}`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#15C7E0" /><stop offset=".55" stopColor="#6D5BF5" /><stop offset="1" stopColor="#A23DEA" />
          </linearGradient>
        </defs>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--line)" strokeWidth={stroke} />
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={`url(#nmring${size})`} strokeWidth={stroke} strokeLinecap="round"
          strokeDasharray={c} strokeDashoffset={c * (1 - value / 100)} transform={`rotate(-90 ${size / 2} ${size / 2})`} />
      </svg>
      <span className="nm-ring-num" style={{ fontSize: size * 0.3 }}><bdi>{value}</bdi></span>
    </div>
  );
}

function Bar({ value, tone = 'grad' }: { value: number; tone?: 'grad' | 'ok' | 'warn' | 'cyan' }) {
  return <span className="nm-bar"><span className={`nm-bar-fill nm-bar-fill--${tone}`} style={{ width: `${value}%` }} /></span>;
}

export function Window({ title, icon, children, actions, style, className = '' }: { title?: ReactNode; icon?: IconName; children: ReactNode; actions?: ReactNode; style?: CSSProperties; className?: string }) {
  return (
    <div className={`nm-window ${className}`} style={style}>
      {title !== undefined && (
        <div className="nm-window-bar">
          <span className="nm-dots" aria-hidden="true"><i /><i /><i /></span>
          {icon && <Icon name={icon} size={14} />}
          <span className="nm-window-title">{title}</span>
          {actions && <span className="nm-window-actions">{actions}</span>}
        </div>
      )}
      <div className="nm-window-body">{children}</div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* screens                                                             */

/** A candidate's profile card — the "complete professional profile". */
export function CandidateCard({ who = 'sara', eyebrow, tabs, compact, style }: { who?: PersonKey; eyebrow?: string; tabs?: string[]; compact?: boolean; style?: CSSProperties }) {
  const lang = useLang();
  const p = SAMPLE.people[who];
  return (
    <Window style={style} className="nm-candidate">
      {eyebrow && <div className="nm-eyebrow"><Icon name="profile" size={13} />{eyebrow}</div>}
      <div className="nm-row" style={{ gap: 12 }}>
        <Avatar who={who} size={compact ? 40 : 48} />
        <div style={{ minWidth: 0, flex: 1 }}>
          <div className="nm-name">{tr(lang, p.name)} <Icon name="verified" size={14} style={{ color: 'var(--cyan)', verticalAlign: -2 }} /></div>
          <div className="nm-sub">{tr(lang, p.role)} · {tr(lang, p.city)}</div>
        </div>
      </div>
      {tabs && (
        <div className="nm-tabs" role="presentation">
          {tabs.map((tb, i) => <span key={tb} className={i === 0 ? 'is-on' : ''}>{tb}</span>)}
        </div>
      )}
      <div className="nm-chips">
        {SAMPLE.skills.slice(0, compact ? 3 : 5).map((s) => <span key={s} className="nm-chip" dir="ltr">{s}</span>)}
      </div>
      {!compact && (
        <div className="nm-facts">
          <div><b><bdi>6</bdi></b><span>{lang === 'ar' ? 'سنوات خبرة' : 'years'}</span></div>
          <div><b>{lang === 'ar' ? 'ع · En' : 'AR · EN'}</b><span>{lang === 'ar' ? 'اللغات' : 'languages'}</span></div>
          <div><b><bdi>92%</bdi></b><span>{lang === 'ar' ? 'اكتمال الملف' : 'complete'}</span></div>
        </div>
      )}
    </Window>
  );
}

/** ATS check result: score, breakdown, and what to change. */
export function MatchCard({ title, body, compact, style }: { title?: string; body?: string; compact?: boolean; style?: CSSProperties }) {
  const lang = useLang();
  const rows: [T, number, 'grad' | 'ok' | 'warn'][] = [
    [{ ar: 'المهارات', en: 'Skills' }, 90, 'ok'],
    [{ ar: 'الخبرة', en: 'Experience' }, 80, 'grad'],
    [{ ar: 'الكلمات المفتاحية', en: 'Keywords' }, 64, 'warn'],
  ];
  return (
    <Window style={style} className="nm-match">
      {title && <div className="nm-eyebrow nm-eyebrow--cyan"><Icon name="match" size={13} />{title}</div>}
      <div className="nm-row" style={{ gap: 14, alignItems: 'center' }}>
        <Ring value={82} size={compact ? 62 : 76} label={lang === 'ar' ? 'درجة التوافق' : 'Match score'} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div className="nm-name" style={{ fontSize: 13.5 }}>{tr(lang, SAMPLE.job.title)}</div>
          <div className="nm-sub">{tr(lang, SAMPLE.company.name)} · {tr(lang, SAMPLE.job.place)}</div>
          {body && !compact && <p className="nm-note">{body}</p>}
        </div>
      </div>
      <div className="nm-breakdown">
        {rows.slice(0, compact ? 2 : 3).map(([l, v, tone]) => (
          <div key={l.en} className="nm-break-row">
            <span>{tr(lang, l)}</span><Bar value={v} tone={tone} /><bdi className="nm-num">{v}</bdi>
          </div>
        ))}
      </div>
      {!compact && (
        <ul className="nm-recs">
          <li className="ok"><Icon name="check" size={13} weight={2.2} />{lang === 'ar' ? 'خبرتك في PostgreSQL تغطي 4 من 5 متطلبات.' : 'Your PostgreSQL work covers 4 of 5 requirements.'}</li>
          <li className="warn"><Icon name="plus" size={13} weight={2.2} />{lang === 'ar' ? 'أضف سطرًا عن Kubernetes؛ الوظيفة تطلبه.' : 'Add a line on Kubernetes — the job asks for it.'}</li>
        </ul>
      )}
    </Window>
  );
}

const BOARD: Record<string, PersonKey[]> = {
  applied: ['yousef', 'huda', 'layla'],
  screening: ['omar', 'nour'],
  interview: ['sara'],
  offer: [],
};

/** Hiring stages board for one job. */
/** Board cards use "Omar K." in English, as compact kanban UIs do; Arabic names stay whole. */
function shortName(name: string, lang: string) {
  if (lang === 'ar') return name;
  const [first, last] = name.split(' ');
  return last ? `${first} ${last[0]}.` : first;
}

export function PipelineBoard({ style, moving = 'nour', compact }: { style?: CSSProperties; moving?: PersonKey; compact?: boolean }) {
  const lang = useLang();
  const counts = { applied: 38, screening: 12, interview: 5, offer: 1 } as Record<string, number>;
  const stages = compact ? STAGES.slice(0, 3) : STAGES;
  return (
    <Window style={style} title={<>{tr(lang, SAMPLE.job.title)}<span className="nm-muted"> · {lang === 'ar' ? 'المتقدمون' : 'Applicants'}</span></>} icon="stages"
      actions={<span className="nm-pill"><Icon name="funnel" size={12} />{lang === 'ar' ? 'الأعلى توافقًا' : 'Best match'}</span>} className="nm-board">
      <div className="nm-cols" style={{ gridTemplateColumns: `repeat(${stages.length}, minmax(0, 1fr))` }}>
        {stages.map((s) => (
          <div key={s.key} className="nm-col">
            <div className="nm-col-head"><span>{tr(lang, s.label)}</span><bdi className="nm-count">{counts[s.key]}</bdi></div>
            {BOARD[s.key].slice(0, compact ? 2 : 3).map((who) => {
              const p = SAMPLE.people[who];
              return (
                <div key={who} className={`nm-mini${who === moving ? ' is-moving' : ''}`}>
                  <Avatar who={who} size={22} />
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <div className="nm-mini-name">{shortName(tr(lang, p.name), lang)}</div>
                    <div className="nm-mini-sub">{tr(lang, p.city)}</div>
                  </div>
                  <ScorePill value={p.score} />
                </div>
              );
            })}
            {s.key === 'offer' && <div className="nm-drop">{lang === 'ar' ? 'اسحب المرشح هنا' : 'Drop a candidate here'}</div>}
          </div>
        ))}
      </div>
    </Window>
  );
}

/** Company candidate base: everyone once, searchable. */
export function ApplicantsTable({ style, rows = 5 }: { style?: CSSProperties; rows?: number }) {
  const lang = useLang();
  const list: [PersonKey, T, string][] = [
    ['nour', { ar: 'مهندس/ة بيانات', en: 'Data Engineer' }, 'screening'],
    ['sara', SAMPLE.job.title, 'interview'],
    ['omar', { ar: 'مهندس/ة DevOps', en: 'DevOps Engineer' }, 'screening'],
    ['layla', SAMPLE.job.title, 'applied'],
    ['yousef', { ar: 'مطوّر/ة Full-stack', en: 'Full-stack Developer' }, 'applied'],
    ['huda', SAMPLE.job.title, 'applied'],
  ];
  const stage = (k: string) => STAGES.find((s) => s.key === k)!.label;
  return (
    <Window style={style} title={lang === 'ar' ? 'قاعدة مرشحي الشركة' : 'Company candidates'} icon="applicants">
      <div className="nm-search">
        <Icon name="search" size={14} />
        <span dir="ltr" className="nm-typed">Node.js</span>
        <span className="nm-filter">{lang === 'ar' ? 'القاهرة' : 'Cairo'} ×</span>
        <span className="nm-filter">{lang === 'ar' ? '+5 سنوات' : '5+ yrs'} ×</span>
      </div>
      <div className="nm-table" role="presentation">
        {list.slice(0, rows).map(([who, job, st], i) => (
          <div key={who} className={`nm-tr${i === 1 ? ' is-sel' : ''}`}>
            <Avatar who={who} size={26} />
            <div className="nm-td-main">
              <div className="nm-mini-name">{tr(lang, SAMPLE.people[who].name)}</div>
              <div className="nm-mini-sub">{tr(lang, job)}</div>
            </div>
            <span className={`nm-stage nm-stage--${st}`}>{tr(lang, stage(st))}</span>
            <ScorePill value={SAMPLE.people[who].score} />
          </div>
        ))}
      </div>
    </Window>
  );
}

/** Hiring funnel for a period, with conversion between stages. */
export function FunnelPanel({ style }: { style?: CSSProperties }) {
  const lang = useLang();
  const rows: [T, number][] = [
    [{ ar: 'تقدّم', en: 'Applied' }, 148],
    [{ ar: 'الفرز', en: 'Screening' }, 62],
    [{ ar: 'المقابلة', en: 'Interview' }, 21],
    [{ ar: 'العرض', en: 'Offer' }, 6],
    [{ ar: 'التعيين', en: 'Hired' }, 4],
  ];
  const max = rows[0][1];
  return (
    <Window style={style} title={lang === 'ar' ? 'مسار المتقدمين' : 'Applicant funnel'} icon="analytics"
      actions={<span className="nm-seg"><span>{lang === 'ar' ? '7 أيام' : '7d'}</span><span className="is-on">{lang === 'ar' ? '30 يومًا' : '30d'}</span><span>{lang === 'ar' ? '90' : '90d'}</span></span>}>
      <div className="nm-funnel">
        {rows.map(([l, v], i) => (
          <div key={l.en} className="nm-funnel-row">
            <span className="nm-funnel-label">{tr(lang, l)}</span>
            <span className="nm-funnel-track"><span style={{ width: `${Math.max(6, (v / max) * 100)}%`, opacity: 1 - i * 0.13 }} /></span>
            <bdi className="nm-num">{v}</bdi>
            <span className="nm-conv">{i === 0 ? '' : <bdi>{Math.round((v / rows[i - 1][1]) * 100)}%</bdi>}</span>
          </div>
        ))}
      </div>
      <div className="nm-callout"><Icon name="spark" size={13} />{lang === 'ar' ? 'أكبر انخفاض بين الفرز والمقابلة.' : 'Biggest drop-off: Screening → Interview.'}</div>
    </Window>
  );
}

/** An interview-practice answer, structured. */
export function AnswerCard({ style }: { style?: CSSProperties }) {
  const lang = useLang();
  const parts: [T, T][] = [
    [{ ar: 'الموقف', en: 'Situation' }, { ar: 'بطء صفحة الطلبات وقت الذروة.', en: 'Orders page slowed down at peak.' }],
    [{ ar: 'الإجراء', en: 'Action' }, { ar: 'أضفت فهارس وطبقة Redis للتخزين المؤقت.', en: 'Added indexes and a Redis cache layer.' }],
    [{ ar: 'النتيجة', en: 'Result' }, { ar: 'زمن الاستجابة من 900 إلى 180 مللي ثانية.', en: 'Response time from 900 to 180 ms.' }],
  ];
  return (
    <Window style={style} title={lang === 'ar' ? 'مكتبة إجاباتي' : 'My answer library'} icon="interview">
      <div className="nm-q"><span className="nm-tag">{lang === 'ar' ? 'سلوكي' : 'Behavioural'}</span>{lang === 'ar' ? 'حدّثنا عن مرة حللت فيها مشكلة أداء.' : 'Tell us about a time you fixed a performance problem.'}</div>
      <div className="nm-star">
        {parts.map(([k, v]) => <div key={k.en}><b>{tr(lang, k)}</b><span>{tr(lang, v)}</span></div>)}
      </div>
      <div className="nm-row" style={{ justifyContent: 'space-between', marginTop: 10 }}>
        <span className="nm-saved"><Icon name="check" size={13} weight={2.2} />{lang === 'ar' ? 'محفوظة · عُدّلت أمس' : 'Saved · edited yesterday'}</span>
        <span className="nm-pill">{lang === 'ar' ? '3 من 12 سؤالًا' : '3 of 12 questions'}</span>
      </div>
    </Window>
  );
}

/** Internal note with a mention, next to the next scheduled step. */
export function TeamThread({ style }: { style?: CSSProperties }) {
  const lang = useLang();
  return (
    <Window style={style} title={<>{tr(lang, SAMPLE.people.sara.name)}<span className="nm-muted"> · {tr(lang, SAMPLE.job.title)}</span></>} icon="mention">
      <div className="nm-event">
        <span className="nm-event-icon"><Icon name="calendar" size={14} /></span>
        <div style={{ flex: 1 }}>
          <b>{lang === 'ar' ? 'مقابلة تقنية' : 'Technical interview'}</b>
          <div className="nm-mini-sub">{lang === 'ar' ? 'الخميس · 11:00 ص' : 'Thursday · 11:00'}</div>
        </div>
        <span className="nm-stack"><Avatar who="ahmed" size={22} ring /><Avatar who="reem" size={22} ring /></span>
      </div>
      <div className="nm-msg">
        <Avatar who="reem" size={26} />
        <div className="nm-bubble">
          <div className="nm-mini-name">{tr(lang, SAMPLE.people.reem.name)} <span className="nm-muted">· {lang === 'ar' ? 'ملاحظة داخلية' : 'internal note'}</span></div>
          <p><span className="nm-mention">@{tr(lang, SAMPLE.people.ahmed.name)}</span> {lang === 'ar' ? 'راجعت حلّها للاختبار التقني؟ قوي في تصميم قواعد البيانات.' : 'did you see her take-home? Strong on database design.'}</p>
        </div>
      </div>
      <div className="nm-msg">
        <Avatar who="ahmed" size={26} />
        <div className="nm-bubble">
          <div className="nm-mini-name">{tr(lang, SAMPLE.people.ahmed.name)}</div>
          <p>{lang === 'ar' ? 'نعم. لننقلها إلى المقابلة النهائية.' : 'Yes — let’s move her to the final round.'}</p>
        </div>
      </div>
    </Window>
  );
}

/** Public company page header with verification. */
export function CompanyHeader({ style }: { style?: CSSProperties }) {
  const lang = useLang();
  const jobs: T[] = [SAMPLE.job.title, { ar: 'مهندس/ة DevOps', en: 'DevOps Engineer' }, { ar: 'مصمم/ة منتجات', en: 'Product Designer' }];
  return (
    <Window style={style} className="nm-company">
      <div className="nm-cover" aria-hidden="true" />
      <div className="nm-row" style={{ gap: 12, marginTop: -26, alignItems: 'flex-end' }}>
        <span className="nm-logo" aria-hidden="true"><Icon name="building" size={22} /></span>
        <div style={{ flex: 1, minWidth: 0, paddingBottom: 2 }}>
          <div className="nm-name">{tr(lang, SAMPLE.company.name)}</div>
          <div className="nm-sub">{tr(lang, SAMPLE.company.meta)}</div>
        </div>
        <span className="nm-verified"><Icon name="verified" size={13} />{lang === 'ar' ? 'شركة موثّقة' : 'Verified'}</span>
      </div>
      <div className="nm-joblist">
        {jobs.map((j, i) => (
          <div key={j.en}><span>{tr(lang, j)}</span><span className="nm-muted">{i === 0 ? (lang === 'ar' ? 'هجين' : 'Hybrid') : i === 1 ? (lang === 'ar' ? 'عن بُعد' : 'Remote') : (lang === 'ar' ? 'في المكتب' : 'On-site')}</span></div>
        ))}
      </div>
    </Window>
  );
}

/** Upload → fields filled from the CV. */
export function AutofillCard({ style }: { style?: CSSProperties }) {
  const lang = useLang();
  const fields: [T, string][] = [
    [{ ar: 'المسمى الوظيفي', en: 'Job title' }, tr(lang, SAMPLE.people.sara.role)],
    [{ ar: 'الخبرة', en: 'Experience' }, lang === 'ar' ? '6 سنوات · 3 شركات' : '6 years · 3 companies'],
    [{ ar: 'المهارات', en: 'Skills' }, 'Node.js, PostgreSQL, AWS'],
    [{ ar: 'اللغات', en: 'Languages' }, lang === 'ar' ? 'العربية، الإنجليزية' : 'Arabic, English'],
  ];
  return (
    <Window style={style} title={lang === 'ar' ? 'ملفي المهني' : 'My profile'} icon="profile">
      <div className="nm-upload"><Icon name="cv" size={16} /><span dir="ltr">Sara_Mansour_CV.pdf</span><span className="nm-tag nm-tag--ok">{lang === 'ar' ? 'تمت القراءة' : 'Read'}</span></div>
      <div className="nm-fields">
        {fields.map(([l, v]) => (
          <div key={l.en} className="nm-field">
            <span>{tr(lang, l)}</span>
            <b>{v}</b>
            <span className="nm-filled"><Icon name="spark" size={12} />{lang === 'ar' ? 'من السيرة' : 'from CV'}</span>
          </div>
        ))}
      </div>
    </Window>
  );
}

/* ------------------------------------------------------------------ */
/* layout helpers                                                      */

/**
 * Lays a mockup out at its design size and scales it down to the column it
 * sits in, so text and spacing keep their proportions on any screen.
 */
export function ScaleBox({ width, height, children, max = 1 }: { width: number; height: number; children: ReactNode; max?: number }) {
  const lang = useLang();
  const ref = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  useBrowserLayoutEffect(() => {
    const el = ref.current;
    if (!el || typeof ResizeObserver === 'undefined') return;
    const ro = new ResizeObserver(([entry]) => setScale(Math.min(max, entry.contentRect.width / width)));
    ro.observe(el);
    return () => ro.disconnect();
  }, [width, max]);
  return (
    // The height comes from the aspect ratio, so a pre-rendered page already has
    // the right height before the scale is measured: nothing below it moves.
    // Clipped, because until the scale is measured the mockup is at full design
    // width: on a phone it would overflow, and on a right-to-left page overflow
    // pushes the whole page sideways. The margin keeps card shadows visible.
    <div ref={ref} style={{ width: '100%', maxWidth: width * max, aspectRatio: `${width} / ${height}`, position: 'relative', overflow: 'clip', overflowClipMargin: 24 }}>
      <div style={{ width, height, position: 'absolute', top: 0, insetInlineStart: 0, transform: `scale(${scale})`, transformOrigin: lang === 'ar' ? 'top right' : 'top left' }}>
        {children}
      </div>
    </div>
  );
}

/** Hero for candidates and the home page: profile in front, the match result beside it, the hiring board behind. */
export function SeekerStage({ card1, card1Tags, card2, card2Body, back = 'board' }: { card1: string; card1Tags?: string[]; card2: string; card2Body?: string; back?: 'board' | 'autofill' }) {
  return (
    <ScaleBox width={560} height={500}>
      <div className="nm-stage-area" style={{ width: 560, height: 500 }}>
        {back === 'board'
          ? <PipelineBoard compact style={{ top: 0, insetInlineEnd: 0, width: 520, opacity: 0.96 }} />
          : <AutofillCard style={{ top: 0, insetInlineEnd: 0, width: 400 }} />}
        <CandidateCard eyebrow={card1} tabs={card1Tags} style={{ bottom: 18, insetInlineStart: 0, width: 300 }} />
        <div className="nm-float-b" style={{ position: 'absolute', bottom: 0, insetInlineEnd: 6, width: 268 }}>
          <MatchCard title={card2} body={card2Body} compact />
        </div>
      </div>
    </ScaleBox>
  );
}

/** Hero for hiring teams: the board, the conversation about a candidate, the next interview. */
export function TeamStage({ card1, card2 }: { card1: string; card2: string }) {
  const lang = useLang();
  return (
    <ScaleBox width={560} height={410}>
      <div className="nm-stage-area" style={{ width: 560, height: 410 }}>
        <PipelineBoard compact style={{ top: 0, insetInlineEnd: 0, width: 560 }} />
        <div className="nm-float-a" style={{ position: 'absolute', bottom: 0, insetInlineStart: 0, width: 290 }}>
          <CandidateCard compact eyebrow={card1} />
        </div>
        <div className="nm-float-b" style={{ position: 'absolute', bottom: 22, insetInlineEnd: 10, width: 250 }}>
          <Window>
            <div className="nm-eyebrow nm-eyebrow--cyan"><Icon name="calendar" size={13} />{card2}</div>
            <div className="nm-event" style={{ marginTop: 2 }}>
              <span className="nm-event-icon"><Icon name="calendar" size={14} /></span>
              <div style={{ flex: 1 }}>
                <b>{lang === 'ar' ? 'مقابلة تقنية' : 'Technical interview'}</b>
                <div className="nm-mini-sub">{lang === 'ar' ? 'الخميس · 11:00 ص' : 'Thursday · 11:00'}</div>
              </div>
            </div>
            <div className="nm-row" style={{ gap: 6 }}><span className="nm-stage nm-stage--interview">{lang === 'ar' ? 'المقابلة' : 'Interview'}</span><span className="nm-muted" style={{ fontSize: 11 }}>{lang === 'ar' ? '2 ملاحظات من الفريق' : '2 team notes'}</span></div>
          </Window>
        </div>
      </div>
    </ScaleBox>
  );
}
