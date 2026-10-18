import type { CSSProperties } from 'react';
import { Icon, type IconName } from './icons';

/**
 * Drop-in names for the auth flow, which was written against an icon
 * library's API (`<Mail size={15} />`). Each one draws from Nagm's own set, so
 * the sign-in and sign-up screens match the rest of nagm.io.
 */
type GlyphProps = { size?: number | string; style?: CSSProperties; className?: string; strokeWidth?: number; 'aria-hidden'?: boolean | 'true' | 'false'; 'aria-label'?: string };

const make = (name: IconName, flip = false) => {
  const Glyph = ({ size = 18, style, className, strokeWidth, ...aria }: GlyphProps) => (
    <Icon
      name={name}
      size={typeof size === 'number' ? size : parseInt(size, 10) || 18}
      weight={strokeWidth ?? 1.9}
      className={className}
      style={flip ? { transform: 'scaleX(-1)', ...style } : style}
      {...(aria['aria-label'] ? { role: 'img', 'aria-label': aria['aria-label'], 'aria-hidden': undefined } : {})}
    />
  );
  Glyph.displayName = `Glyph(${name})`;
  return Glyph;
};

export const Building2 = make('building');
export const Briefcase = make('jobs');
export const Check = make('check');
export const Eye = make('eye');
export const EyeOff = make('eyeOff');
export const Mail = make('mail');
export const ArrowRight = make('arrow');
export const ArrowLeft = make('arrow', true);
export const Globe = make('globe');
export const Search = make('search');
export const User = make('user');
