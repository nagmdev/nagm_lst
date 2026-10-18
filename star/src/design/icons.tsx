import type { SVGProps } from 'react';

/**
 * Nagm icon set — drawn for this site, not pulled from a library.
 *
 * Every glyph sits on the same 24-unit grid with a 1.75 stroke, and carries
 * one of two signatures taken from the logo mark: a 45° cut where a library
 * icon would round a corner, or a short chevron accent. Accent strokes use
 * `--icAccent` (cyan by default) so a tile can recolour them without a new
 * drawing — the gradient tile sets it to translucent white.
 *
 * Usage: <Icon name="match" size={22} />. Directional glyphs (arrow) flip in
 * RTL through the `.ns-arrow` class, not here.
 */

export type IconName =
  | 'profile' | 'cv' | 'match' | 'interview' | 'stages' | 'analytics' | 'jobs' | 'applicants'
  | 'mention' | 'rediscover' | 'workspace' | 'verified' | 'code' | 'share' | 'language' | 'bell'
  | 'sheet' | 'search' | 'calendar' | 'team' | 'building' | 'spark' | 'arrow' | 'check' | 'plus'
  | 'menu' | 'close' | 'sun' | 'moon' | 'card' | 'instalments' | 'lock' | 'mail' | 'pin' | 'clock'
  | 'download' | 'chevronDown' | 'globe' | 'history' | 'shield' | 'invoice' | 'seat' | 'infinity'
  | 'star' | 'funnel' | 'handshake' | 'eye' | 'eyeOff' | 'refresh' | 'tag' | 'user';

type Stroke = { d: string; accent?: boolean; fill?: boolean };

const G: Record<IconName, Stroke[]> = {
  // A card with the cut corner; the person is the primary stroke, the two
  // detail lines are the accent.
  profile: [
    { d: 'M4 5h12.5L20 8.5V19H4z' },
    { d: 'M9 13.2a2.4 2.4 0 1 0 0-4.8 2.4 2.4 0 0 0 0 4.8z' },
    { d: 'M5.4 17c.7-1.6 2-2.4 3.6-2.4s2.9.8 3.6 2.4' },
    { d: 'M14 12h3M14 15h3', accent: true },
  ],
  cv: [
    { d: 'M6 3h8l4 4v14H6z' },
    { d: 'M14 3v4h4' },
    { d: 'M9 12.5h6M9 16h6' },
    { d: 'M9 9h2.5', accent: true },
  ],
  match: [
    { d: 'M12 20a8 8 0 1 1 0-16' },
    { d: 'M12 15.5a3.5 3.5 0 1 1 0-7' },
    { d: 'M12 12l8.5-8.5', accent: true },
    { d: 'M16.5 3.5h4v4', accent: true },
  ],
  interview: [
    { d: 'M4 5h16v11h-9l-4 3.5V16H4z' },
    { d: 'M10.5 8.5 14 10.5l-3.5 2', accent: true },
  ],
  stages: [
    { d: 'M3 5h4v14H3zM10 5h4v10h-4zM17 5h4v6h-4z' },
    { d: 'M7.5 15.5 9 17l-1.5 1.5M14.5 11.5 16 13l-1.5 1.5', accent: true },
  ],
  analytics: [
    { d: 'M5 20v-7M11 20V9M17 20v-5' },
    { d: 'M4 9l5-4 4 3 7-5', accent: true },
    { d: 'M17 3h3v3', accent: true },
  ],
  jobs: [
    { d: 'M3 8h18v11H3z' },
    { d: 'M9 8V6.2L10.7 4.5h2.6L15 6.2V8' },
    { d: 'M3 13h8M13 13h8' },
    { d: 'M11 11.5h2v3h-2z', accent: true },
  ],
  applicants: [
    { d: 'M9 11a3 3 0 1 0 0-6 3 3 0 0 0 0 6z' },
    { d: 'M3 20c0-3.3 2.7-6 6-6s6 2.7 6 6' },
    { d: 'M17 11.4a2.4 2.4 0 1 0 0-4.8 2.4 2.4 0 0 0 0 4.8z', accent: true },
    { d: 'M16.5 14.6c2.6.3 4.5 2.5 4.5 5.4', accent: true },
  ],
  mention: [
    { d: 'M16 12v1.5a2.5 2.5 0 0 0 5 0V12a9 9 0 1 0-3.5 7.1' },
    { d: 'M12 15.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7z', accent: true },
  ],
  rediscover: [
    { d: 'M12 3a9 9 0 1 0 9 9' },
    { d: 'M12 7a5 5 0 1 0 5 5' },
    { d: 'M12 12l6.5-6.5', accent: true },
    { d: 'M15.5 8.5h.01', accent: true },
  ],
  workspace: [
    { d: 'M3 3h7v7H3zM14 3h7v7h-7zM3 14h7v7H3z' },
    { d: 'M14 14h7v4l-3 3h-4z', accent: true },
  ],
  verified: [
    { d: 'M12 3l7 3v6c0 4-3 7-7 9-4-2-7-5-7-9V6z' },
    { d: 'M9 12l2 2 4-4.5', accent: true },
  ],
  code: [
    { d: 'M4 5h12.5L20 8.5V19H4z' },
    { d: 'M9 10l-2.5 2L9 14M15 10l2.5 2L15 14', accent: true },
    { d: 'M13 9l-2 6' },
  ],
  share: [
    { d: 'M10 14a4 4 0 0 1 0-5.7l2.3-2.3a4 4 0 0 1 5.7 5.7l-1 1' },
    { d: 'M14 10a4 4 0 0 1 0 5.7L11.7 18a4 4 0 0 1-5.7-5.7l1-1', accent: true },
  ],
  language: [
    { d: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18z' },
    { d: 'M3 12h18' },
    { d: 'M12 3c-3 3-3 15 0 18' },
    { d: 'M12 3c3 3 3 15 0 18', accent: true },
  ],
  globe: [
    { d: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18z' },
    { d: 'M3.5 9h17M3.5 15h17' },
    { d: 'M12 3c-2.5 3-2.5 15 0 18', accent: true },
  ],
  bell: [
    { d: 'M6 16v-5a6 6 0 0 1 12 0v5l1.5 2h-15z' },
    { d: 'M10 21h4', accent: true },
  ],
  sheet: [
    { d: 'M4 4h16v16H4z' },
    { d: 'M4 9.5h16M9.5 4v16' },
    { d: 'M15.5 12v6M13 15.5l2.5 2.5 2.5-2.5', accent: true },
  ],
  search: [
    { d: 'M10.5 17a6.5 6.5 0 1 0 0-13 6.5 6.5 0 0 0 0 13z' },
    { d: 'M15.5 15.5 21 21' },
    { d: 'M8 10.5l2 2 3-3.5', accent: true },
  ],
  calendar: [
    { d: 'M4 6h16v15H4z' },
    { d: 'M4 10h16M8 3v4M16 3v4' },
    { d: 'M8 14h2.5v2.5H8z', accent: true },
  ],
  team: [
    { d: 'M12 8.2a2.2 2.2 0 1 0 0-4.4 2.2 2.2 0 0 0 0 4.4zM6 19.2a2.2 2.2 0 1 0 0-4.4 2.2 2.2 0 0 0 0 4.4zM18 19.2a2.2 2.2 0 1 0 0-4.4 2.2 2.2 0 0 0 0 4.4z' },
    { d: 'M10.8 7.8 7.2 15.2M13.2 7.8l3.6 7.4' },
    { d: 'M8.2 17h7.6', accent: true },
  ],
  building: [
    { d: 'M4 21V5l8-2v18' },
    { d: 'M12 9l8 2v10' },
    { d: 'M8 8h1M8 12h1M8 16h1M16 14h1M16 17h1' },
    { d: 'M2 21h20', accent: true },
  ],
  spark: [
    { d: 'M12 3l1.8 7.2L21 12l-7.2 1.8L12 21l-1.8-7.2L3 12l7.2-1.8z' },
    { d: 'M19 2.5v4M17 4.5h4', accent: true },
  ],
  star: [
    { d: 'M12 3.5l2.6 5.4 5.9.8-4.3 4.1 1.1 5.9L12 16.9l-5.3 2.8 1.1-5.9-4.3-4.1 5.9-.8z' },
  ],
  arrow: [{ d: 'M5 12h14M13 6l6 6-6 6' }],
  check: [{ d: 'M5 12.5l4.5 4.5L19 7' }],
  plus: [{ d: 'M12 5v14M5 12h14' }],
  menu: [{ d: 'M4 7h16M4 12h16M4 17h10' }],
  close: [{ d: 'M6 6l12 12M18 6 6 18' }],
  sun: [
    { d: 'M12 16a4 4 0 1 0 0-8 4 4 0 0 0 0 8z' },
    { d: 'M12 2.5v2M12 19.5v2M2.5 12h2M19.5 12h2M5.3 5.3l1.4 1.4M17.3 17.3l1.4 1.4M5.3 18.7l1.4-1.4M17.3 6.7l1.4-1.4' },
  ],
  moon: [{ d: 'M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5z' }],
  card: [
    { d: 'M3 6h18v12H3z' },
    { d: 'M3 10h18' },
    { d: 'M7 15h4', accent: true },
  ],
  instalments: [
    { d: 'M3 12a9 9 0 0 1 9-9' },
    { d: 'M12 3a9 9 0 0 1 9 9' },
    { d: 'M21 12a9 9 0 0 1-9 9' },
    { d: 'M12 21a9 9 0 0 1-9-9', accent: true },
    { d: 'M12 8.5v7M9.5 12h5' },
  ],
  lock: [
    { d: 'M6 11h12v10H6z' },
    { d: 'M9 11V7a3 3 0 0 1 6 0v4' },
    { d: 'M12 15v2.5', accent: true },
  ],
  shield: [
    { d: 'M12 3l7 3v6c0 4-3 7-7 9-4-2-7-5-7-9V6z' },
    { d: 'M12 8v5', accent: true },
    { d: 'M12 16h.01', accent: true },
  ],
  mail: [
    { d: 'M3 6h18v12H3z' },
    { d: 'M3 7l9 6 9-6', accent: true },
  ],
  pin: [
    { d: 'M12 21s-6-5.3-6-10a6 6 0 0 1 12 0c0 4.7-6 10-6 10z' },
    { d: 'M12 13a2 2 0 1 0 0-4 2 2 0 0 0 0 4z', accent: true },
  ],
  clock: [
    { d: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18z' },
    { d: 'M12 7v5l3 2', accent: true },
  ],
  history: [
    { d: 'M4 12a8 8 0 1 0 2.3-5.7' },
    { d: 'M4 4v4.5h4.5' },
    { d: 'M12 8v4l2.5 1.5', accent: true },
  ],
  download: [
    { d: 'M12 4v11M7 10l5 5 5-5' },
    { d: 'M5 20h14', accent: true },
  ],
  chevronDown: [{ d: 'M6 9l6 6 6-6' }],
  invoice: [
    { d: 'M6 3h12v18l-3-2-3 2-3-2-3 2z' },
    { d: 'M9 8h6M9 12h6' },
    { d: 'M9 16h3', accent: true },
  ],
  seat: [
    { d: 'M6 11V6a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v5' },
    { d: 'M4 11h16v5H4z' },
    { d: 'M6 16v3M18 16v3', accent: true },
  ],
  infinity: [
    { d: 'M12 12c-2-2.5-3.5-4-6-4a4 4 0 0 0 0 8c2.5 0 4-1.5 6-4z' },
    { d: 'M12 12c2 2.5 3.5 4 6 4a4 4 0 0 0 0-8c-2.5 0-4 1.5-6 4z', accent: true },
  ],
  funnel: [
    { d: 'M3 4h18l-7 8v6l-4 2v-8z' },
    { d: 'M8 8h8', accent: true },
  ],
  handshake: [
    { d: 'M2 10l4-4 6 3 6-3 4 4-5 7-5 3-5-3z' },
    { d: 'M8 13l4 2.5 4-2.5', accent: true },
  ],
  eye: [
    { d: 'M2.5 12s3.5-6 9.5-6 9.5 6 9.5 6-3.5 6-9.5 6-9.5-6-9.5-6z' },
    { d: 'M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z', accent: true },
  ],
  eyeOff: [
    { d: 'M2.5 12s3.5-6 9.5-6c1.6 0 3 .4 4.2 1M21.5 12s-3.5 6-9.5 6c-1.6 0-3-.4-4.2-1' },
    { d: 'M9.9 14.1a3 3 0 0 1 4.2-4.2', accent: true },
    { d: 'M4 20 20 4' },
  ],
  user: [
    { d: 'M12 11.5a3.75 3.75 0 1 0 0-7.5 3.75 3.75 0 0 0 0 7.5z' },
    { d: 'M4.5 20.5c.9-3.6 3.8-5.6 7.5-5.6s6.6 2 7.5 5.6' },
    { d: 'M15.5 3.5l1.5-1.5', accent: true },
  ],
  refresh: [
    { d: 'M20 12a8 8 0 1 1-2.3-5.7' },
    { d: 'M20 4v4.5h-4.5', accent: true },
  ],
  tag: [
    { d: 'M3 12V4h8l9 9-8 8z' },
    { d: 'M7.5 8.5h.01', accent: true },
  ],
};

export interface IconProps extends Omit<SVGProps<SVGSVGElement>, 'name'> {
  name: IconName;
  size?: number;
  /** Stroke width on the 24 grid; smaller glyphs read better a touch heavier. */
  weight?: number;
}

export function Icon({ name, size = 22, weight = 1.75, style, ...rest }: IconProps) {
  const strokes = G[name];
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={weight}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      style={{ display: 'inline-block', flexShrink: 0, ...style }}
      {...rest}
    >
      {strokes.map((s, i) => (
        <path
          key={i}
          d={s.d}
          stroke={s.accent ? 'var(--icAccent, var(--cyan))' : undefined}
          fill={s.fill ? 'currentColor' : 'none'}
        />
      ))}
    </svg>
  );
}

/** The directional arrow used in buttons and links; flips with the page. */
export const Arrow = ({ size = 18 }: { size?: number }) => <Icon name="arrow" size={size} className="ns-arrow" />;

/** The brand mark as vector: two interlocking brackets in the gradient. */
export function Mark({ size = 28, id = 'nsMark' }: { size?: number; id?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true" focusable="false" style={{ display: 'block', flexShrink: 0 }}>
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#15C7E0" />
          <stop offset=".55" stopColor="#6D5BF5" />
          <stop offset="1" stopColor="#A23DEA" />
        </linearGradient>
      </defs>
      <path d="M3 9.5 12 3h4.5v4L9 12.2V17L3 21.5z" fill={`url(#${id})`} />
      <path d="M21 14.5 12 21H7.5v-4l7.5-5.2V7L21 2.5z" fill={`url(#${id})`} opacity=".85" />
    </svg>
  );
}

export const ICON_NAMES = Object.keys(G) as IconName[];
