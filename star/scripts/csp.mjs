/**
 * nagm.io's Content-Security-Policy, written into every pre-rendered page as a
 * <meta> (scripts/prerender.mjs). It is the page's script policy: no inline
 * script runs unless its SHA-256 hash is listed (boot.js is inlined and
 * hashed), and nothing evals. The vercel.json header adds what a <meta> can't
 * say (frame-ancestors). Kept in its own file so it is tested (sheet #47).
 *
 * @param {{ scriptHashes: string, apiOrigin?: string }} opts
 */
export function buildCsp({ scriptHashes, apiOrigin = '' }) {
  return [
    "default-src 'self'",
    `script-src 'self' ${scriptHashes} https://www.googletagmanager.com https://*.googletagmanager.com https://tagmanager.google.com https://www.google-analytics.com https://*.google-analytics.com https://*.doubleclick.net https://*.googleadservices.com https://*.googlesyndication.com https://www.google.com https://vercel.live`,
    // React writes style="" attributes; allow Google Tag Manager / Tag Assistant / Vercel Toolbar styles too.
    "style-src 'self' 'unsafe-inline' https://www.googletagmanager.com https://*.googletagmanager.com https://tagmanager.google.com https://fonts.googleapis.com https://vercel.live",
    "img-src 'self' data: https:",
    "font-src 'self' https://fonts.gstatic.com https://vercel.live data:",
    `connect-src 'self'${apiOrigin ? ` ${apiOrigin}` : ''} https://www.googletagmanager.com https://*.googletagmanager.com https://www.google-analytics.com https://*.google-analytics.com https://*.analytics.google.com https://*.doubleclick.net https://*.googleadservices.com https://*.googlesyndication.com https://www.google.com https://www.google.com.eg https://www.google.com.sa https://www.google.ae https://www.google.co.uk https://vercel.live wss://vercel.live wss://*.pusher.com https://*.pusher.com`,
    "frame-src 'self' https://www.googletagmanager.com https://*.doubleclick.net https://www.google.com https://vercel.live",
    "manifest-src 'self'",
    "base-uri 'self'",
    "object-src 'none'",
    "form-action 'self'",
  ].join('; ');
}
