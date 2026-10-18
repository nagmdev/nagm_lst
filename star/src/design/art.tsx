import type { ReactNode } from 'react';

/**
 * Vector scenes for nagm.io — background fields and the few abstract scenes
 * (region map, billing) that are not product screens; product views are HTML
 * mockups in design/mock. Every colour is a token, so the
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
