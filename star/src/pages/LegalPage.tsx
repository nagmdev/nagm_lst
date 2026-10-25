import { Link } from '../i18n/links';
import { useLang } from '../i18n/lang';
import { LEGAL } from '../i18n/legalText';
import { Shell, Eyebrow, usePageMeta } from '../design/ui';

/** /terms and /privacy: one reading column, a contents list, the other document one click away. */
export default function LegalPage({ doc }: { doc: 'terms' | 'privacy' }) {
  const lang = useLang();
  const d = LEGAL[doc][lang];
  const other = doc === 'terms' ? 'privacy' : 'terms';
  const ar = lang === 'ar';
  usePageMeta(doc === 'terms' ? '/terms' : '/privacy');

  return (
    <Shell>
      <section className="ns-hero" style={{ paddingBottom: 24 }}>
        <div className="ns-container" style={{ maxWidth: 820 }}>
          <Eyebrow>{ar ? 'قانوني' : 'Legal'}</Eyebrow>
          <h1 className="ns-h1" style={{ marginBottom: 12 }}>{d.title}</h1>
          <p className="ns-body" style={{ color: 'var(--ink3)', margin: 0 }} data-testid="legal-updated">
            {ar ? 'آخر تحديث: ' : 'Last updated: '}{d.updated}
          </p>
          <p className="ns-lede" style={{ maxWidth: '68ch', marginTop: 18 }}>{d.intro}</p>
        </div>
      </section>

      <div className="ns-container" style={{ maxWidth: 820, paddingBottom: 72 }}>
        <nav aria-label={ar ? 'المحتويات' : 'Contents'} className="ns-card" style={{ padding: '16px 20px', marginBottom: 32 }}>
          <ol style={{ margin: 0, paddingInlineStart: 0, listStyle: 'none', display: 'grid', gap: 6, gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))' }}>
            {d.sections.map((s) => (
              <li key={s.id}><a href={`#${s.id}`} style={{ color: 'var(--brandInk)', textDecoration: 'none', fontSize: 14 }}>{s.title}</a></li>
            ))}
          </ol>
        </nav>

        <article style={{ display: 'grid', gap: 28 }}>
          {d.sections.map((s) => (
            <section key={s.id} id={s.id} style={{ scrollMarginTop: 96 }}>
              <h2 style={{ fontSize: 20, margin: '0 0 10px', color: 'var(--ink)' }}>{s.title}</h2>
              {s.body.map((p) => <p key={p} className="ns-body" style={{ margin: '0 0 10px', maxWidth: '72ch' }}>{p}</p>)}
              {s.list && (
                <ul className="ns-body" style={{ margin: 0, paddingInlineStart: 22, display: 'grid', gap: 6, maxWidth: '72ch' }}>
                  {s.list.map((li) => <li key={li}>{li}</li>)}
                </ul>
              )}
            </section>
          ))}
        </article>

        <p className="ns-body" style={{ marginTop: 40, color: 'var(--ink3)' }}>
          {ar ? 'اقرأ أيضاً: ' : 'See also: '}
          <Link to={`/${other}`} style={{ color: 'var(--brandInk)', fontWeight: 600 }}>{LEGAL[other][lang].title}</Link>
        </p>
      </div>
    </Shell>
  );
}
