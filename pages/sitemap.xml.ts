import type { GetServerSideProps } from 'next';
import { siteOrigin } from '@/lib/server/site-url';
import { PAGE_KEYS, pathFor } from '@/lib/site/routes';

/** Every public page in both languages, with alternates; /admin is not listed. */
export const getServerSideProps: GetServerSideProps = async ({ req, res }) => {
  const origin = siteOrigin(req);
  const urls = PAGE_KEYS.flatMap((page) => {
    const alternates = `
    <xhtml:link rel="alternate" hreflang="ar" href="${origin}${pathFor(page, 'ar')}"/>
    <xhtml:link rel="alternate" hreflang="en" href="${origin}${pathFor(page, 'en')}"/>
    <xhtml:link rel="alternate" hreflang="x-default" href="${origin}${pathFor(page, 'ar')}"/>`;
    return (['ar', 'en'] as const).map(
      (lang) => `  <url>
    <loc>${origin}${pathFor(page, lang)}</loc>${alternates}
  </url>`,
    );
  });
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
${urls.join('\n')}
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
