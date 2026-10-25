/**
 * How Vercel answers a request for nagm.io, from vercel.json and the built
 * dist/: redirects first, then a file (with cleanUrls: /pricing is
 * pricing.html), then rewrites, then 404.html with a 404 status.
 *
 * Used by the SEO audit's local server and by the unit test that keeps the
 * server redirects in step with the app's own table of retired pages.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const config = JSON.parse(fs.readFileSync(path.join(root, 'vercel.json'), 'utf8'));

/** A path-to-regexp source (`/a/:slug`, `/a/:slug(x|y)`, `/a/:path*`) as a RegExp. */
function compile(source) {
  let re = '';
  for (let i = 0; i < source.length;) {
    const m = /^:([A-Za-z_]\w*)(\(([^)]*)\))?(\*)?/.exec(source.slice(i));
    if (m) {
      const [, name, , custom, star] = m;
      re += star ? `(?<${name}>.*)` : `(?<${name}>${custom ?? '[^/]+'})`;
      i += m[0].length;
    } else if (source.startsWith('(.*)', i)) {
      re += '(.*)';
      i += 4;
    } else {
      re += source[i].replace(/[.+?^${}()|[\]\\]/g, '\\$&');
      i += 1;
    }
  }
  return new RegExp(`^${re}$`);
}

const fill = (dest, groups = {}) => dest.replace(/:([A-Za-z_]\w*)\*?/g, (_, k) => groups[k] ?? '');
const redirects = (config.redirects ?? []).map((r) => ({ ...r, re: compile(r.source) }));
const rewrites = (config.rewrites ?? []).map((r) => ({ ...r, re: compile(r.source) }));

/**
 * @returns {{ status: number, location?: string, file?: string }}
 *   a redirect (status + location) or a file in `distDir` to send with `status`.
 */
export function resolveRequest(pathname, distDir = path.join(root, 'dist')) {
  const exists = (rel) => {
    const f = path.join(distDir, rel);
    return f.startsWith(distDir) && fs.existsSync(f) && fs.statSync(f).isFile() ? rel : null;
  };
  const fileFor = (p) => {
    if (p === '/') return exists('index.html');
    if (config.cleanUrls && exists(`${p.slice(1)}.html`)) return `${p.slice(1)}.html`;
    return exists(p.slice(1));
  };

  if (config.trailingSlash === false && pathname.length > 1 && pathname.endsWith('/')) {
    return { status: 308, location: pathname.replace(/\/+$/, '') };
  }
  if (config.cleanUrls && /\.html$/.test(pathname)) {
    const clean = pathname.replace(/(\/index)?\.html$/, '') || '/';
    return { status: 308, location: clean };
  }
  for (const r of redirects) {
    const m = r.re.exec(pathname);
    if (m) return { status: r.permanent ? 308 : 307, location: fill(r.destination, m.groups) };
  }
  const file = fileFor(pathname);
  if (file) return { status: 200, file };
  for (const r of rewrites) {
    const m = r.re.exec(pathname);
    if (m) {
      const target = fileFor(fill(r.destination, m.groups));
      if (target) return { status: 200, file: target };
    }
  }
  return { status: 404, file: exists('404.html') ?? undefined };
}
