import type { ReactNode } from 'react';

/**
 * Product scenes for nagm.io — vector illustrations drawn from the same
 * parts as the app's UI (panels, chips, bars, rings) so a scene reads as the
 * product rather than as a stock picture. Every colour is a token, so the
 * scenes follow light/dark on their own. Text is never baked in: the copy a
 * scene needs sits in the DOM beside it and translates with the page.
 */

const uid = (() => { let n = 0; return (p: string) => `${p}${++n}`; })();

/** Shared defs: the brand gradient and a soft panel shadow. */
function Defs({ id }: { id: string }) {
  return (
    <defs>
      <linearGradient id={`${id}-g`} x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stopColor="#15C7E0" />
        <stop offset=".55" stopColor="#6D5BF5" />
        <stop offset="1" stopColor="#A23DEA" />
      </linearGradient>
      <linearGradient id={`${id}-gh`} x1="0" y1="0" x2="1" y2="0">
        <stop offset="0" stopColor="#15C7E0" />
        <stop offset="1" stopColor="#6D5BF5" />
      </linearGradient>
      <filter id={`${id}-s`} x="-10%" y="-10%" width="120%" height="130%">
        <feDropShadow dx="0" dy="10" stdDeviation="12" floodColor="#101828" floodOpacity=".10" />
      </filter>
    </defs>
  );
}

const Panel = ({ x, y, w, h, r = 14, id, cut = false, children, strong = false }: { x: number; y: number; w: number; h: number; r?: number; id: string; cut?: boolean; children?: ReactNode; strong?: boolean }) => (
  <g filter={strong ? `url(#${id}-s)` : undefined}>
    {cut ? (
      <path d={`M${x + r} ${y}H${x + w - 18}L${x + w} ${y + 18}V${y + h - r}a${r} ${r} 0 0 1 -${r} ${r}H${x + r}a${r} ${r} 0 0 1 -${r} -${r}V${y + r}a${r} ${r} 0 0 1 ${r} -${r}z`} fill="var(--panel)" stroke="var(--line)" />
    ) : (
      <rect x={x} y={y} width={w} height={h} rx={r} fill="var(--panel)" stroke="var(--line)" />
    )}
    {cut && <path d={`M${x + w - 18} ${y}L${x + w} ${y + 18}V${y}z`} fill={`url(#${id}-g)`} />}
    {children}
  </g>
);

const Bar = ({ x, y, w, h = 8, tone = 'var(--line2)', r = 4 }: { x: number; y: number; w: number; h?: number; tone?: string; r?: number }) => (
  <rect x={x} y={y} width={w} height={h} rx={r} fill={tone} />
);

const Chip = ({ x, y, w, tone = 'var(--brandSoft)', ink = 'var(--brand)' }: { x: number; y: number; w: number; tone?: string; ink?: string }) => (
  <g>
    <rect x={x} y={y} width={w} height={20} rx={10} fill={tone} />
    <rect x={x + 9} y={y + 7} width={w - 18} height={6} rx={3} fill={ink} opacity=".7" />
  </g>
);

const Avatar = ({ x, y, r = 14, id, tone }: { x: number; y: number; r?: number; id?: string; tone?: string }) => (
  <g>
    <circle cx={x} cy={y} r={r} fill={tone ?? (id ? `url(#${id}-g)` : 'var(--brandSoft)')} />
    <circle cx={x} cy={y - r * 0.25} r={r * 0.32} fill="#fff" opacity=".9" />
    <path d={`M${x - r * 0.6} ${y + r * 0.75}c.3-${r * 0.5} ${r * 0.9}-${r * 0.5} ${r * 1.2} 0`} fill="#fff" opacity=".9" />
  </g>
);

/** Arc ring used for scores. `v` is 0–100. */
const Ring = ({ cx, cy, r, v, id, width = 7 }: { cx: number; cy: number; r: number; v: number; id: string; width?: number }) => {
  const c = 2 * Math.PI * r;
  return (
    <g transform={`rotate(-90 ${cx} ${cy})`}>
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="var(--line)" strokeWidth={width} />
      <circle cx={cx} cy={cy} r={r} fill="none" stroke={`url(#${id}-g)`} strokeWidth={width} strokeLinecap="round" strokeDasharray={c} strokeDashoffset={c * (1 - v / 100)} />
    </g>
  );
};

const Check = ({ x, y, tone = 'var(--ok)' }: { x: number; y: number; tone?: string }) => (
  <g>
    <circle cx={x} cy={y} r={8} fill={tone} opacity=".15" />
    <path d={`M${x - 3.5} ${y}l2.5 2.5 4.5-5`} stroke={tone} strokeWidth="1.8" fill="none" strokeLinecap="round" strokeLinejoin="round" />
  </g>
);

/* ------------------------------------------------------------------ */

/** Faint rows of the mark's chevron, for section backgrounds. */
export function ChevronField({ opacity = 0.06, rows = 4, cols = 7 }: { opacity?: number; rows?: number; cols?: number }) {
  const items: ReactNode[] = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const x = c * 180 + (r % 2) * 90;
      const y = r * 150;
      items.push(<path key={`${r}-${c}`} d={`M${x} ${y + 40}l40-28h20v18l-33 23v20l-27 20z`} fill="currentColor" />);
    }
  }
  return (
    <svg className="ns-chev-field" viewBox="0 0 1260 600" preserveAspectRatio="xMidYMid slice" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', color: 'var(--brand)', opacity }} aria-hidden="true">
      {items}
    </svg>
  );
}

/**
 * Hero stage: the back layer of the hero. The two front cards are HTML (so
 * their copy translates); this draws what sits behind and around them — a
 * score badge, a stage strip and a stacked profile sheet — leaving the two
 * card positions clear.
 */
export function HeroScene({ score = 82 }: { score?: number }) {
  const id = uid('hs');
  return (
    <svg viewBox="0 0 560 440" width="100%" height="100%" preserveAspectRatio="xMidYMid meet" aria-hidden="true" style={{ overflow: 'visible' }}>
      <Defs id={id} />
      <ellipse cx="290" cy="220" rx="250" ry="200" fill={`url(#${id}-g)`} opacity=".08" />
      <path d="M36 70l48-34h24v22l-40 28v24l-32 24z" fill={`url(#${id}-g)`} opacity=".22" />
      <path d="M492 392l36-26h18v17l-30 21v18l-24 18z" fill={`url(#${id}-g)`} opacity=".18" />

      {/* stacked sheet behind the profile card */}
      <g transform="rotate(-4 220 230)">
        <rect x={70} y={112} width={300} height={220} rx={18} fill="var(--panel)" stroke="var(--line)" opacity=".9" />
        <Bar x={96} y={280} w={240} h={6} tone="var(--line)" />
        <Bar x={96} y={296} w={180} h={6} tone="var(--line)" />
      </g>

      {/* score badge */}
      <Panel id={id} x={392} y={18} w={148} h={148} r={22} strong>
        <Ring cx={466} cy={86} r={44} v={score} id={id} width={9} />
        <text x={466} y={95} textAnchor="middle" fontFamily="var(--fontMono)" fontWeight="600" fontSize="28" fill="var(--ink)" direction="ltr">{score}</text>
        <text x={466} y={112} textAnchor="middle" fontFamily="var(--fontMono)" fontSize="10" fill="var(--ink3)" direction="ltr">/100</text>
        <Bar x={420} y={146} w={92} h={6} tone="var(--line2)" />
      </Panel>

      {/* stage strip */}
      <Panel id={id} x={18} y={350} w={228} h={78} r={16} strong>
        {[0, 1, 2].map((i) => (
          <g key={i}>
            <rect x={32 + i * 72} y={364} width={58} height={50} rx={10} fill={i === 2 ? 'var(--brandSoft)' : 'var(--bg)'} stroke={i === 2 ? 'var(--brandBorder)' : 'var(--line)'} />
            <Bar x={40 + i * 72} y={374} w={30} h={6} tone={i === 2 ? 'var(--brand)' : 'var(--ink3)'} />
            <Bar x={40 + i * 72} y={386} w={40} h={5} tone="var(--line2)" />
            <Bar x={40 + i * 72} y={398} w={26} h={5} tone="var(--line2)" />
          </g>
        ))}
        {[0, 1].map((i) => (
          <path key={i} d={`M${93 + i * 72} 389h6m-3-3 3 3-3 3`} stroke="var(--cyan)" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
        ))}
      </Panel>

      {/* connector from badge to the match card position */}
      <path d="M470 170c0 40-10 60-40 78" stroke="var(--brand)" strokeWidth="2" fill="none" strokeDasharray="3 6" strokeLinecap="round" opacity=".6" />
    </svg>
  );
}

/** Upload a CV → fields fill themselves. */
export function ProfileScene() {
  const id = uid('ps');
  return (
    <svg viewBox="0 0 520 380" width="100%" aria-hidden="true" style={{ overflow: 'visible' }}>
      <Defs id={id} />
      <ellipse cx="260" cy="200" rx="230" ry="160" fill={`url(#${id}-g)`} opacity=".07" />
      {/* CV document */}
      <Panel id={id} x={40} y={70} w={150} h={200} r={12} cut strong>
        <Bar x={58} y={96} w={70} h={9} tone="var(--ink)" />
        <Bar x={58} y={112} w={50} tone="var(--line2)" h={6} />
        {[0, 1, 2, 3, 4, 5].map((i) => <Bar key={i} x={58} y={136 + i * 16} w={i % 3 === 2 ? 70 : 112} h={6} tone="var(--line2)" />)}
        <Chip x={58} y={236} w={44} />
        <Chip x={108} y={236} w={56} tone="var(--cyanSoft)" ink="var(--cyan)" />
      </Panel>
      {/* flow arrows */}
      <path d="M198 150c40 0 40 20 80 20M198 190c40 0 40-20 80-20" stroke={`url(#${id}-gh)`} strokeWidth="2.5" fill="none" strokeDasharray="4 6" strokeLinecap="round" />
      <path d="M272 165l6 5-6 5" stroke="var(--brand)" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      {/* profile form */}
      <Panel id={id} x={290} y={44} w={200} h={290} r={16} strong>
        <Avatar x={322} y={78} r={16} id={id} />
        <Bar x={346} y={70} w={90} h={9} tone="var(--ink)" />
        <Bar x={346} y={86} w={60} h={6} tone="var(--line2)" />
        {[0, 1, 2, 3].map((i) => (
          <g key={i}>
            <Bar x={308} y={116 + i * 44} w={50} h={6} tone="var(--ink3)" />
            <rect x={308} y={128 + i * 44} width={164} height={24} rx={8} fill="var(--bg)" stroke="var(--line)" />
            <Bar x={318} y={137 + i * 44} w={i === 1 ? 110 : 80} h={6} tone={i < 3 ? 'var(--ink2)' : 'var(--line2)'} />
            {i < 3 && <Check x={458} y={140 + i * 44} />}
          </g>
        ))}
        <Bar x={308} y={300} w={164} h={6} tone="var(--line)" />
        <Bar x={308} y={300} w={120} h={6} tone={`url(#${id}-gh)`} />
        <Bar x={308} y={314} w={40} h={5} tone="var(--ink3)" />
      </Panel>
    </svg>
  );
}

/** ATS check: a job on one side, the CV on the other, a score between. */
export function MatchScene() {
  const id = uid('ms');
  return (
    <svg viewBox="0 0 520 380" width="100%" aria-hidden="true" style={{ overflow: 'visible' }}>
      <Defs id={id} />
      <ellipse cx="260" cy="190" rx="220" ry="150" fill={`url(#${id}-g)`} opacity=".07" />
      <Panel id={id} x={30} y={90} w={150} h={200} r={14} strong>
        <Bar x={48} y={112} w={24} h={6} tone="var(--cyan)" />
        <Bar x={48} y={126} w={100} h={10} tone="var(--ink)" />
        {[0, 1, 2, 3, 4].map((i) => <Bar key={i} x={48} y={152 + i * 18} w={[110, 90, 100, 70, 96][i]} h={6} tone="var(--line2)" />)}
        <Chip x={48} y={250} w={48} tone="var(--cyanSoft)" ink="var(--cyan)" />
        <Chip x={102} y={250} w={58} tone="var(--cyanSoft)" ink="var(--cyan)" />
      </Panel>
      <Panel id={id} x={340} y={90} w={150} h={200} r={14} cut strong>
        <Avatar x={366} y={122} r={14} id={id} />
        <Bar x={388} y={116} w={70} h={8} tone="var(--ink)" />
        <Bar x={388} y={130} w={46} h={6} tone="var(--line2)" />
        {[0, 1, 2, 3].map((i) => <Bar key={i} x={358} y={158 + i * 18} w={[112, 80, 100, 60][i]} h={6} tone="var(--line2)" />)}
        <Chip x={358} y={250} w={52} />
        <Chip x={416} y={250} w={44} tone="var(--violetSoft)" ink="var(--violet)" />
      </Panel>
      {/* connecting field */}
      <path d="M180 150h160M180 230h160" stroke="var(--line2)" strokeDasharray="3 7" strokeWidth="2" strokeLinecap="round" />
      <circle cx="260" cy="190" r="62" fill="var(--panel)" stroke="var(--line)" filter={`url(#${id}-s)`} />
      <Ring cx={260} cy={190} r={48} v={78} id={id} width={9} />
      <text x={260} y={199} textAnchor="middle" fontFamily="var(--fontMono)" fontWeight="600" fontSize="28" fill="var(--ink)" direction="ltr">78</text>
      <text x={260} y={216} textAnchor="middle" fontFamily="var(--fontMono)" fontSize="10" fill="var(--ink3)" direction="ltr">/100</text>
      {/* recommendation chips */}
      <g>
        <rect x={190} y={300} width={140} height={28} rx={14} fill="var(--okSoft)" />
        <Check x={206} y={314} />
        <Bar x={220} y={311} w={92} h={6} tone="var(--ok)" />
      </g>
      <g>
        <rect x={160} y={336} width={200} height={28} rx={14} fill="var(--warnSoft)" />
        <circle cx={176} cy={350} r={6} fill="var(--warn)" opacity=".8" />
        <Bar x={190} y={347} w={150} h={6} tone="var(--warn)" />
      </g>
    </svg>
  );
}

/** Hiring stages: columns, a card on the move, an activity badge. */
export function PipelineScene() {
  const id = uid('pl');
  const cols = [
    { x: 30, cards: 3, tone: 'var(--line2)' },
    { x: 190, cards: 2, tone: 'var(--brand)' },
    { x: 350, cards: 1, tone: 'var(--cyan)' },
  ];
  return (
    <svg viewBox="0 0 520 380" width="100%" aria-hidden="true" style={{ overflow: 'visible' }}>
      <Defs id={id} />
      <ellipse cx="260" cy="200" rx="240" ry="150" fill={`url(#${id}-g)`} opacity=".07" />
      {cols.map((c, ci) => (
        <g key={ci}>
          <rect x={c.x} y={50} width={140} height={300} rx={16} fill="var(--bg)" stroke="var(--line)" />
          <Bar x={c.x + 16} y={66} w={56} h={8} tone={c.tone} />
          <rect x={c.x + 108} y={62} width={18} height={16} rx={6} fill="var(--panel)" stroke="var(--line)" />
          {Array.from({ length: c.cards }).map((_, i) => (
            <g key={i} filter={`url(#${id}-s)`}>
              <rect x={c.x + 12} y={90 + i * 76} width={116} height={64} rx={12} fill="var(--panel)" stroke="var(--line)" />
              <Avatar x={c.x + 30} y={108 + i * 76} r={9} tone={i === 0 && ci === 1 ? `url(#${id}-g)` : 'var(--brandSoft)'} />
              <Bar x={c.x + 46} y={103 + i * 76} w={60} h={7} tone="var(--ink)" />
              <Bar x={c.x + 46} y={115 + i * 76} w={40} h={5} tone="var(--line2)" />
              <Chip x={c.x + 22} y={128 + i * 76} w={40} tone={ci === 2 ? 'var(--okSoft)' : 'var(--brandSoft)'} ink={ci === 2 ? 'var(--ok)' : 'var(--brand)'} />
              <Chip x={c.x + 68} y={128 + i * 76} w={30} tone="var(--bg)" ink="var(--ink3)" />
            </g>
          ))}
        </g>
      ))}
      {/* the moving card */}
      <g filter={`url(#${id}-s)`} transform="rotate(-4 300 250)">
        <rect x={250} y={236} width={116} height={64} rx={12} fill="var(--panel)" stroke="var(--brand)" />
        <Avatar x={268} y={254} r={9} id={id} />
        <Bar x={284} y={249} w={60} h={7} tone="var(--ink)" />
        <Bar x={284} y={261} w={40} h={5} tone="var(--line2)" />
        <Chip x={260} y={274} w={44} tone="var(--cyanSoft)" ink="var(--cyan)" />
      </g>
      <path d="M332 232c20-20 36-26 56-30" stroke="var(--brand)" strokeWidth="2.5" fill="none" strokeDasharray="4 6" strokeLinecap="round" />
      <path d="M382 198l8 2-4 7" stroke="var(--brand)" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      {/* activity badge */}
      <g filter={`url(#${id}-s)`}>
        <rect x={372} y={300} width={132} height={52} rx={14} fill="var(--panel)" stroke="var(--line)" />
        <rect x={384} y={312} width={28} height={28} rx={8} fill="var(--cyanSoft)" />
        <path d="M392 320h12M392 326h8M398 316v2" stroke="var(--cyan)" strokeWidth="1.8" strokeLinecap="round" />
        <Bar x={420} y={316} w={64} h={7} tone="var(--ink)" />
        <Bar x={420} y={330} w={44} h={5} tone="var(--line2)" />
      </g>
    </svg>
  );
}

/** Candidate base: search, filters, results — one person once. */
export function BaseScene() {
  const id = uid('bs');
  return (
    <svg viewBox="0 0 520 380" width="100%" aria-hidden="true" style={{ overflow: 'visible' }}>
      <Defs id={id} />
      <ellipse cx="260" cy="200" rx="240" ry="150" fill={`url(#${id}-g)`} opacity=".07" />
      <Panel id={id} x={40} y={40} w={440} h={300} r={18} strong>
        <rect x={60} y={60} width={300} height={36} rx={12} fill="var(--bg)" stroke="var(--line)" />
        <circle cx={80} cy={78} r={6} fill="none" stroke="var(--ink3)" strokeWidth="1.8" />
        <path d="M84.5 82.5l4 4" stroke="var(--ink3)" strokeWidth="1.8" strokeLinecap="round" />
        <Bar x={98} y={75} w={120} h={6} tone="var(--ink2)" />
        <rect x={372} y={60} width={88} height={36} rx={12} fill={`url(#${id}-g)`} />
        <Bar x={392} y={75} w={48} h={6} tone="#fff" />
        <Chip x={60} y={108} w={56} />
        <Chip x={122} y={108} w={70} tone="var(--cyanSoft)" ink="var(--cyan)" />
        <Chip x={198} y={108} w={62} tone="var(--violetSoft)" ink="var(--violet)" />
        <Chip x={266} y={108} w={50} tone="var(--bg)" ink="var(--ink3)" />
        {[0, 1, 2, 3].map((i) => (
          <g key={i}>
            <rect x={60} y={144 + i * 46} width={400} height={38} rx={10} fill={i === 1 ? 'var(--brandSoft)' : 'transparent'} stroke={i === 1 ? 'var(--brandBorder)' : 'var(--line)'} />
            <Avatar x={82} y={163 + i * 46} r={11} tone={i === 1 ? `url(#${id}-g)` : ['var(--cyanSoft)', '', 'var(--violetSoft)', 'var(--brandSoft)'][i]} />
            <Bar x={102} y={156 + i * 46} w={[80, 96, 70, 88][i]} h={7} tone="var(--ink)" />
            <Bar x={102} y={169 + i * 46} w={[60, 50, 72, 44][i]} h={5} tone="var(--line2)" />
            <Chip x={300} y={153 + i * 46} w={38} tone="var(--bg)" ink="var(--ink3)" />
            <Chip x={344} y={153 + i * 46} w={38} tone="var(--bg)" ink="var(--ink3)" />
            {/* jobs applied count */}
            <rect x={400} y={153 + i * 46} width={44} height={20} rx={10} fill="var(--bg)" stroke="var(--line)" />
            <Bar x={412} y={160 + i * 46} w={20} h={6} tone="var(--ink3)" />
            {i === 1 && <path d="M448 150l3 6 6.5 1-4.8 4.5 1.2 6.5-5.9-3.2-5.9 3.2 1.2-6.5-4.8-4.5 6.5-1z" fill="var(--warn)" />}
          </g>
        ))}
      </Panel>
    </svg>
  );
}

/** Team: an internal note with a mention, people, a follow bell. */
export function TeamScene() {
  const id = uid('ts');
  return (
    <svg viewBox="0 0 520 380" width="100%" aria-hidden="true" style={{ overflow: 'visible' }}>
      <Defs id={id} />
      <ellipse cx="260" cy="200" rx="240" ry="150" fill={`url(#${id}-g)`} opacity=".07" />
      <Panel id={id} x={50} y={60} w={300} h={180} r={16} cut strong>
        <Avatar x={78} y={92} r={14} id={id} />
        <Bar x={100} y={84} w={80} h={8} tone="var(--ink)" />
        <Bar x={100} y={98} w={40} h={5} tone="var(--line2)" />
        <Bar x={70} y={126} w={160} h={7} tone="var(--ink2)" />
        <rect x={234} y={120} width={70} height={19} rx={9} fill="var(--brandSoft)" />
        <text x={243} y={134} fontFamily="var(--fontMono)" fontSize="11" fontWeight="600" fill="var(--brand)">@</text>
        <Bar x={254} y={127} w={42} h={6} tone="var(--brand)" />
        <Bar x={70} y={144} w={240} h={7} tone="var(--ink2)" />
        <Bar x={70} y={162} w={190} h={7} tone="var(--ink2)" />
        <rect x={70} y={192} width={92} height={28} rx={10} fill="var(--bg)" stroke="var(--line)" />
        <Bar x={84} y={203} w={64} h={6} tone="var(--ink3)" />
        <rect x={170} y={192} width={64} height={28} rx={10} fill={`url(#${id}-g)`} />
        <Bar x={186} y={203} w={32} h={6} tone="#fff" />
      </Panel>
      {/* team avatars */}
      <g filter={`url(#${id}-s)`}>
        <rect x={330} y={120} width={150} height={60} rx={30} fill="var(--panel)" stroke="var(--line)" />
        <Avatar x={360} y={150} r={16} tone="var(--cyanSoft)" />
        <Avatar x={390} y={150} r={16} tone="var(--violetSoft)" />
        <Avatar x={420} y={150} r={16} id={id} />
        <circle cx={452} cy={150} r={16} fill="var(--bg)" stroke="var(--line)" />
        <path d="M447 150h10M452 145v10" stroke="var(--ink3)" strokeWidth="1.8" strokeLinecap="round" />
      </g>
      {/* timeline */}
      <Panel id={id} x={120} y={262} w={320} h={84} r={16} strong>
        <path d="M150 304h260" stroke="var(--line2)" strokeWidth="2" />
        {[0, 1, 2, 3].map((i) => (
          <g key={i}>
            <circle cx={160 + i * 80} cy={304} r={7} fill={i === 3 ? `url(#${id}-g)` : 'var(--panel)'} stroke={i === 3 ? 'none' : 'var(--brand)'} strokeWidth="2" />
            <Bar x={146 + i * 80} y={320} w={30} h={5} tone="var(--line2)" />
            <Bar x={148 + i * 80} y={282} w={26} h={6} tone="var(--ink3)" />
          </g>
        ))}
      </Panel>
    </svg>
  );
}

/** Analytics: a period selector, a funnel and an export sheet. */
export function AnalyticsScene() {
  const id = uid('as');
  const stages = [100, 72, 44, 22, 9];
  return (
    <svg viewBox="0 0 520 380" width="100%" aria-hidden="true" style={{ overflow: 'visible' }}>
      <Defs id={id} />
      <ellipse cx="260" cy="200" rx="240" ry="150" fill={`url(#${id}-g)`} opacity=".07" />
      <Panel id={id} x={40} y={40} w={320} h={300} r={18} strong>
        <Bar x={60} y={62} w={90} h={9} tone="var(--ink)" />
        <rect x={236} y={56} width={104} height={24} rx={8} fill="var(--bg)" stroke="var(--line)" />
        <Bar x={248} y={65} w={60} h={6} tone="var(--ink3)" />
        <path d="M322 65l3 3 3-3" stroke="var(--ink3)" strokeWidth="1.6" fill="none" />
        {stages.map((v, i) => (
          <g key={i}>
            <Bar x={60} y={100 + i * 44} w={50} h={6} tone="var(--ink3)" />
            <rect x={120} y={94 + i * 44} width={220} height={22} rx={8} fill="var(--bg)" />
            <rect x={120} y={94 + i * 44} width={(220 * v) / 100} height={22} rx={8} fill={`url(#${id}-gh)`} opacity={1 - i * 0.14} />
            <Bar x={120 + (220 * v) / 100 + 8} y={102 + i * 44} w={22} h={6} tone="var(--ink2)" />
          </g>
        ))}
      </Panel>
      {/* export sheet */}
      <g filter={`url(#${id}-s)`} transform="rotate(5 420 240)">
        <rect x={370} y={160} width={120} height={160} rx={12} fill="var(--panel)" stroke="var(--line)" />
        <path d="M370 190h120M370 216h120M370 242h120M370 268h120M410 172v148M450 172v148" stroke="var(--line)" />
        <rect x={370} y={160} width={120} height={30} rx={12} fill="var(--okSoft)" />
        <rect x={370} y={176} width={120} height={14} fill="var(--okSoft)" />
        <Bar x={380} y={172} w={24} h={5} tone="var(--ok)" />
        <Bar x={420} y={172} w={20} h={5} tone="var(--ok)" />
        <Bar x={460} y={172} w={20} h={5} tone="var(--ok)" />
        {[0, 1, 2, 3].map((i) => <g key={i}><Bar x={378} y={200 + i * 26} w={24} h={5} tone="var(--line2)" /><Bar x={418} y={200 + i * 26} w={22} h={5} tone="var(--line2)" /><Bar x={458} y={200 + i * 26} w={22} h={5} tone="var(--line2)" /></g>)}
      </g>
    </svg>
  );
}

/** Interview practice: a question, an answer being written, saved answers. */
export function InterviewScene() {
  const id = uid('is');
  return (
    <svg viewBox="0 0 520 380" width="100%" aria-hidden="true" style={{ overflow: 'visible' }}>
      <Defs id={id} />
      <ellipse cx="260" cy="200" rx="240" ry="150" fill={`url(#${id}-g)`} opacity=".07" />
      {/* question bubble */}
      <g filter={`url(#${id}-s)`}>
        <path d="M60 60h300a14 14 0 0 1 14 14v70a14 14 0 0 1-14 14H110l-26 22v-22H60a14 14 0 0 1-14-14V74a14 14 0 0 1 14-14z" fill="var(--panel)" stroke="var(--line)" />
        <rect x={64} y={76} width={54} height={18} rx={9} fill="var(--violetSoft)" />
        <Bar x={74} y={82} w={34} h={6} tone="var(--violet)" />
        <Bar x={64} y={106} w={270} h={8} tone="var(--ink)" />
        <Bar x={64} y={124} w={200} h={8} tone="var(--ink)" />
      </g>
      {/* answer editor */}
      <Panel id={id} x={130} y={190} w={350} h={150} r={16} cut strong>
        <Bar x={150} y={212} w={60} h={6} tone="var(--cyan)" />
        <Bar x={150} y={230} w={300} h={7} tone="var(--ink2)" />
        <Bar x={150} y={246} w={280} h={7} tone="var(--ink2)" />
        <Bar x={150} y={262} w={180} h={7} tone="var(--ink2)" />
        <rect x={331} y={259} width={2} height={12} fill="var(--brand)" />
        <rect x={150} y={294} width={80} height={28} rx={10} fill={`url(#${id}-g)`} />
        <Bar x={170} y={305} w={40} h={6} tone="#fff" />
        <rect x={240} y={294} width={28} height={28} rx={10} fill="var(--bg)" stroke="var(--line)" />
        <path d="M249 308h10M254 303v10" stroke="var(--ink3)" strokeWidth="1.6" strokeLinecap="round" />
      </Panel>
      {/* saved answers stack */}
      <g filter={`url(#${id}-s)`}>
        <rect x={30} y={214} width={84} height={112} rx={12} fill="var(--panel)" stroke="var(--line)" />
        {[0, 1, 2].map((i) => (
          <g key={i}>
            <Check x={46} y={236 + i * 30} />
            <Bar x={60} y={233 + i * 30} w={40} h={6} tone="var(--ink2)" />
          </g>
        ))}
      </g>
    </svg>
  );
}

/** Company page + verification: logo, cover, documents, a badge. */
export function CompanyScene() {
  const id = uid('cs');
  return (
    <svg viewBox="0 0 520 380" width="100%" aria-hidden="true" style={{ overflow: 'visible' }}>
      <Defs id={id} />
      <ellipse cx="260" cy="200" rx="240" ry="150" fill={`url(#${id}-g)`} opacity=".07" />
      <Panel id={id} x={40} y={50} w={300} h={280} r={18} strong>
        <path d={`M40 68a18 18 0 0 1 18-18h264a18 18 0 0 1 18 18v62H40z`} fill={`url(#${id}-g)`} opacity=".75" />
        <rect x={64} y={106} width={56} height={56} rx={14} fill="var(--panel)" stroke="var(--line)" />
        <path d="M80 148v-22l12-6v28M92 128l10 4v16" stroke="var(--brand)" strokeWidth="2" fill="none" strokeLinejoin="round" />
        <Bar x={132} y={142} w={110} h={9} tone="var(--ink)" />
        <Bar x={132} y={158} w={70} h={6} tone="var(--line2)" />
        <g>
          <rect x={248} y={140} width={74} height={22} rx={11} fill="var(--okSoft)" />
          <path d="M258 151l3 3 5-6" stroke="var(--ok)" strokeWidth="1.8" fill="none" strokeLinecap="round" strokeLinejoin="round" />
          <Bar x={270} y={148} w={42} h={6} tone="var(--ok)" />
        </g>
        <Bar x={64} y={190} w={240} h={7} tone="var(--ink2)" />
        <Bar x={64} y={206} w={200} h={7} tone="var(--ink2)" />
        {[0, 1].map((i) => (
          <g key={i}>
            <rect x={64 + i * 128} y={236} width={116} height={70} rx={12} fill="var(--bg)" stroke="var(--line)" />
            <Bar x={76 + i * 128} y={250} w={70} h={7} tone="var(--ink)" />
            <Bar x={76 + i * 128} y={264} w={50} h={5} tone="var(--line2)" />
            <Chip x={76 + i * 128} y={278} w={44} tone="var(--brandSoft)" />
          </g>
        ))}
      </Panel>
      {/* verification documents */}
      <g filter={`url(#${id}-s)`} transform="rotate(6 420 200)">
        <rect x={360} y={120} width={110} height={140} rx={12} fill="var(--panel)" stroke="var(--line)" />
        <path d="M360 132a12 12 0 0 1 12-12h70l28 28v100a12 12 0 0 1-12 12h-86a12 12 0 0 1-12-12z" fill="var(--panel)" stroke="var(--line)" />
        <path d="M442 120v28h28" stroke="var(--line2)" fill="var(--bg)" />
        {[0, 1, 2, 3].map((i) => <Bar key={i} x={376} y={168 + i * 16} w={i === 3 ? 40 : 78} h={6} tone="var(--line2)" />)}
        <rect x={376} y={234} width={60} height={14} rx={7} fill="var(--brandSoft)" />
        <Bar x={386} y={238} w={40} h={6} tone="var(--brand)" />
      </g>
      <g filter={`url(#${id}-s)`}>
        <circle cx={400} cy={300} r={30} fill="var(--panel)" stroke="var(--line)" />
        <path d="M400 282l12 5v10c0 7-5 12-12 15-7-3-12-8-12-15v-10z" fill={`url(#${id}-g)`} />
        <path d="M394 298l4 4 8-9" stroke="#fff" strokeWidth="2.2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      </g>
    </svg>
  );
}

/** Three cities on an abstract regional map. */
export function RegionScene() {
  const id = uid('rs');
  const pins = [
    { x: 150, y: 190 }, // Cairo
    { x: 330, y: 230 }, // Riyadh
    { x: 430, y: 180 }, // Dubai
  ];
  return (
    <svg viewBox="0 0 520 340" width="100%" aria-hidden="true" style={{ overflow: 'visible' }}>
      <Defs id={id} />
      <path d="M40 120c40-50 110-70 170-50s90 70 150 60 110-40 120-10v160c-60 30-140 20-200 0s-130-10-190 10-70-30-50-170z" fill={`url(#${id}-g)`} opacity=".08" />
      <g stroke="var(--line2)" strokeDasharray="3 7" strokeWidth="2" fill="none" strokeLinecap="round">
        <path d="M150 190c60-60 120-40 180 40" />
        <path d="M330 230c30-40 60-60 100-50" />
        <path d="M150 190c80 0 180-30 280-10" />
      </g>
      {pins.map((p, i) => (
        <g key={i} filter={`url(#${id}-s)`}>
          <circle cx={p.x} cy={p.y} r={22} fill="var(--panel)" stroke="var(--line)" />
          <path d={`M${p.x} ${p.y + 10}s-8-7-8-13a8 8 0 0 1 16 0c0 6-8 13-8 13z`} fill={`url(#${id}-g)`} />
          <circle cx={p.x} cy={p.y - 3} r={2.5} fill="#fff" />
          <circle cx={p.x} cy={p.y} r={34} fill="none" stroke="var(--brand)" opacity=".25">
            <animate attributeName="r" values="26;44" dur="2.4s" begin={`${i * 0.5}s`} repeatCount="indefinite" />
            <animate attributeName="opacity" values=".3;0" dur="2.4s" begin={`${i * 0.5}s`} repeatCount="indefinite" />
          </circle>
        </g>
      ))}
    </svg>
  );
}

/** Pricing page hero art: a card, an instalment plan, a receipt. */
export function BillingScene() {
  const id = uid('bl');
  return (
    <svg viewBox="0 0 520 300" width="100%" aria-hidden="true" style={{ overflow: 'visible' }}>
      <Defs id={id} />
      <ellipse cx="260" cy="150" rx="240" ry="120" fill={`url(#${id}-g)`} opacity=".07" />
      <g filter={`url(#${id}-s)`} transform="rotate(-6 160 150)">
        <rect x={60} y={90} width={200} height={124} rx={16} fill={`url(#${id}-g)`} />
        <rect x={80} y={120} width={34} height={26} rx={6} fill="#fff" opacity=".85" />
        <Bar x={80} y={168} w={120} h={8} tone="#fff" />
        <Bar x={80} y={186} w={60} h={6} tone="#fff" />
        <circle cx={228} cy={184} r={12} fill="#fff" opacity=".7" />
        <circle cx={212} cy={184} r={12} fill="#fff" opacity=".5" />
      </g>
      <Panel id={id} x={290} y={60} w={190} h={180} r={16} cut strong>
        <Bar x={310} y={82} w={70} h={8} tone="var(--ink)" />
        <Bar x={310} y={96} w={40} h={5} tone="var(--line2)" />
        {[0, 1, 2, 3].map((i) => (
          <g key={i}>
            <circle cx={320} cy={126 + i * 26} r={7} fill={i === 0 ? `url(#${id}-g)` : 'var(--bg)'} stroke={i === 0 ? 'none' : 'var(--line2)'} />
            {i === 0 && <path d="M317 126l2 2 4-4" stroke="#fff" strokeWidth="1.6" fill="none" strokeLinecap="round" strokeLinejoin="round" />}
            <Bar x={336} y={123 + i * 26} w={60} h={6} tone="var(--ink2)" />
            <Bar x={420} y={123 + i * 26} w={40} h={6} tone="var(--ink3)" />
          </g>
        ))}
      </Panel>
    </svg>
  );
}
