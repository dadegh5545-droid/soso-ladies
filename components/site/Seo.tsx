import Head from 'next/head';
import { pathFor, type PageKey } from '@/lib/site/routes';
import type { SiteView } from '@/lib/site/view';

function clip(text: string): string {
  const flat = text.replace(/\s+/g, ' ').trim();
  return flat.length > 160 ? `${flat.slice(0, 157).trimEnd()}…` : flat;
}

/** schema.org BeautySalon, from SiteSettings only; empty fields are left out. */
function jsonLd(view: SiteView, origin: string, description: string) {
  const data: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'BeautySalon',
    name: view.salonName.text,
    url: `${origin}${pathFor('home', view.lang)}`,
    image: `${origin}/brand/soso-logo-v2-1080.png`,
    logo: `${origin}/brand/soso-logo-v2-1080.png`,
    description,
  };
  if (view.phone) data.telephone = view.phone;
  if (view.address) data.address = { '@type': 'PostalAddress', streetAddress: view.address.text };
  if (view.geo) data.geo = { '@type': 'GeoCoordinates', latitude: view.geo.lat, longitude: view.geo.lng };
  if (view.mapUrl) data.hasMap = view.mapUrl;
  if (view.instagramUrl) data.sameAs = [view.instagramUrl];
  // Escape "<" so the JSON can never close the script tag.
  return JSON.stringify(data).replace(/</g, '\\u003c');
}

/**
 * Per-page title, description, canonical URL and language alternates. The
 * home and contact pages also carry the BeautySalon structured data.
 */
export function Seo({
  view,
  origin,
  page,
  title: pageTitle,
  description: pageDescription,
  noindex,
}: {
  view: SiteView;
  origin: string;
  page: PageKey;
  /** The page's own name; the home page uses the salon name and tagline. */
  title?: string;
  description?: string;
  noindex?: boolean;
}) {
  const brand = view.salonName.text;
  const title = page === 'home' ? (view.tagline.text === brand ? brand : `${brand} | ${view.tagline.text}`) : `${pageTitle} | ${brand}`;
  const desc = clip(pageDescription ?? (view.subtitle ?? view.about ?? view.tagline).text);
  const url = `${origin}${pathFor(page, view.lang)}`;
  const image = `${origin}/brand/soso-logo-v2-1080.png`;

  return (
    <Head>
      <title>{title}</title>
      <meta name="description" content={desc} />
      {noindex && <meta name="robots" content="noindex" />}
      <link rel="canonical" href={url} />
      <link rel="alternate" hrefLang="ar" href={`${origin}${pathFor(page, 'ar')}`} />
      <link rel="alternate" hrefLang="en" href={`${origin}${pathFor(page, 'en')}`} />
      <link rel="alternate" hrefLang="x-default" href={`${origin}${pathFor(page, 'ar')}`} />
      <meta property="og:type" content="website" />
      <meta property="og:site_name" content={brand} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={desc} />
      <meta property="og:url" content={url} />
      <meta property="og:image" content={image} />
      <meta property="og:image:width" content="1080" />
      <meta property="og:image:height" content="1080" />
      <meta property="og:image:alt" content={brand} />
      <meta property="og:locale" content={view.lang === 'ar' ? 'ar_AR' : 'en_US'} />
      <meta property="og:locale:alternate" content={view.lang === 'ar' ? 'en_US' : 'ar_AR'} />
      <meta name="twitter:card" content="summary" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={desc} />
      <meta name="twitter:image" content={image} />
      {(page === 'home' || page === 'contact') && (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(view, origin, desc) }} />
      )}
    </Head>
  );
}
