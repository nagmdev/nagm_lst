import { forwardRef } from 'react';
import { Link as RouterLink, NavLink as RouterNavLink, type LinkProps, type NavLinkProps } from 'react-router-dom';
import { pagePath, useLang } from './lang';

/**
 * react-router's Link and NavLink, pointed at the current language's address
 * of a page: on an English page `to="/pricing"` goes to /en/pricing. Any other
 * target (sign-in, a mailto:, another site) is left as it is.
 */
/**
 * Sign-in and sign-up pages are noindex, and a URL with ?parameters is one
 * page under many addresses: links to either are not for crawlers to follow.
 */
export const crawlRel = (to: LinkProps['to'], rel?: string): string | undefined => {
  const path = typeof to === 'string' ? to : `${to.pathname ?? ''}${to.search ?? ''}`;
  const skip = /^\/(login|register|signup|sign-up|signin|sign-in|verify)\b/.test(path) || path.includes('?');
  return skip ? [rel, 'nofollow'].filter(Boolean).join(' ') : rel;
};

export const Link = forwardRef<HTMLAnchorElement, LinkProps>(function Link({ to, rel, ...rest }, ref) {
  const lang = useLang();
  return <RouterLink ref={ref} to={typeof to === 'string' ? pagePath(to, lang) : to} rel={crawlRel(to, rel)} {...rest} />;
});

export const NavLink = forwardRef<HTMLAnchorElement, NavLinkProps>(function NavLink({ to, end, ...rest }, ref) {
  const lang = useLang();
  const target = typeof to === 'string' ? pagePath(to, lang) : to;
  // The English home (/en) is a prefix of every English page: match it exactly.
  return <RouterNavLink ref={ref} to={target} end={end ?? target === '/en'} {...rest} />;
});
