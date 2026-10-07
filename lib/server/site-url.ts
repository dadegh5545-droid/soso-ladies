import type { IncomingMessage } from 'http';

/**
 * Absolute origin of the site, for canonical/hreflang/OG/sitemap URLs.
 * SITE_URL (set in Amplify Hosting, see README) wins. Otherwise the Host
 * header is used; X-Forwarded-* headers are ignored because a visitor can set
 * them and the CDN would cache the result.
 */
export function siteOrigin(req: IncomingMessage): string {
  const configured = process.env.SITE_URL?.trim().replace(/\/+$/, '');
  if (configured) return configured;
  const host = req.headers.host?.trim() || 'localhost:3000';
  const local = /^(localhost|127\.0\.0\.1)(:\d+)?$/.test(host);
  return `${local ? 'http' : 'https'}://${host}`;
}
