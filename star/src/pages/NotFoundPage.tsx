import { useEffect } from 'react';
import { Link } from '../i18n/links';
import { useLang } from '../i18n/lang';
import { useSiteText } from '../i18n/siteText';
import { Shell, Eyebrow } from '../design/ui';

/** Any address that isn't a page. Served with a 404 status and kept out of search results. */
export default function NotFoundPage() {
  const lang = useLang();
  const t = useSiteText();
  const ar = lang === 'ar';
  const title = ar ? 'الصفحة غير موجودة — نجم' : 'Page not found — Nagm';
  useEffect(() => {
    document.title = title;
    document.head.querySelectorAll('[data-seo]').forEach((el) => el.remove());
    const robots = document.createElement('meta');
    robots.setAttribute('data-seo', '');
    robots.setAttribute('name', 'robots');
    robots.setAttribute('content', 'noindex');
    document.head.appendChild(robots);
  }, [title]);

  return (
    <Shell>
      <section className="ns-hero">
        <div className="ns-container" style={{ maxWidth: 720 }}>
          <Eyebrow>404</Eyebrow>
          <h1 className="ns-h1">{ar ? 'هذه الصفحة غير موجودة' : 'This page doesn’t exist'}</h1>
          <p className="ns-lede">
            {ar ? 'ربما نُقلت أو تغيّر عنوانها. هذه أهم صفحات نجم:' : 'It may have moved or been renamed. These are the main pages of Nagm:'}
          </p>
          <ul className="ns-body" style={{ display: 'grid', gap: 8, paddingInlineStart: 22, marginTop: 16 }}>
            <li><Link to="/">{ar ? 'الصفحة الرئيسية' : 'Home'}</Link></li>
            <li><Link to="/job-seekers">{t.nav.groupSeekers}</Link></li>
            <li><Link to="/companies">{t.nav.groupTeams}</Link></li>
            <li><Link to="/pricing">{t.nav.pricing}</Link></li>
            <li><Link to="/about">{t.nav.about}</Link></li>
          </ul>
        </div>
      </section>
    </Shell>
  );
}
