import type { GetServerSideProps } from 'next';
import { siteOrigin } from '@/lib/server/site-url';

/** The two public pages with their language alternates; /admin is not listed. */
export const getServerSideProps: GetServerSideProps = async ({ req, res }) => {
  const origin = siteOrigin(req);
  const alternates = `
    <xhtml:link rel="alternate" hreflang="ar" href="${origin}/"/>
    <xhtml:link rel="alternate" hreflang="en" href="${origin}/en"/>
    <xhtml:link rel="alternate" hreflang="x-default" href="${origin}/"/>`;
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
  <url>
    <loc>${origin}/</loc>${alternates}
  </url>
  <url>
    <loc>${origin}/en</loc>${alternates}
  </url>
</urlset>
`;
  res.setHeader('Content-Type', 'application/xml; charset=utf-8');
  res.setHeader('Cache-Control', 'public, s-maxage=3600');
  res.end(xml);
  return { props: {} };
};

export default function Sitemap() {
  return null;
}
