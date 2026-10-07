import type { GetServerSideProps } from 'next';
import { siteOrigin } from '@/lib/server/site-url';

/**
 * /admin is not disallowed here on purpose: crawlers must be able to fetch it
 * to see its noindex (meta tag and X-Robots-Tag header, next.config.mjs).
 */
export const getServerSideProps: GetServerSideProps = async ({ req, res }) => {
  res.setHeader('Content-Type', 'text/plain; charset=utf-8');
  res.setHeader('Cache-Control', 'public, s-maxage=3600');
  res.end(`User-agent: *\nAllow: /\n\nSitemap: ${siteOrigin(req)}/sitemap.xml\n`);
  return { props: {} };
};

export default function Robots() {
  return null;
}
