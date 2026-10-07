import Head from 'next/head';
import type { SiteView } from '@/lib/site/view';

const PATHS = { ar: '/', en: '/en' } as const;

function description(view: SiteView): string {
  const source = view.subtitle ?? view.about ?? view.tagline;
  const text = source.text.replace(/\s+/g, ' ').trim();
  return text.length > 160 ? `${text.slice(0, 157).trimEnd()}…` : text;
}

/** schema.org BeautySalon, from SiteSettings only; empty fields are left out. */
function jsonLd(view: SiteView, origin: string) {
  const data: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'BeautySalon',
    name: view.salonName.text,
    url: `${origin}${PATHS[view.lang]}`,
    image: `${origin}/brand/soso-logo-v2-1080.png`,
    logo: `${origin}/brand/soso-logo-v2-1080.png`,
    description: description(view),
  };
  if (view.phone) data.telephone = view.phone;
  if (view.address) data.address = { '@type': 'PostalAddress', streetAddress: view.address.text };
  if (view.geo) data.geo = { '@type': 'GeoCoordinates', latitude: view.geo.lat, longitude: view.geo.lng };
  if (view.mapUrl) data.hasMap = view.mapUrl;
  if (view.instagramUrl) data.sameAs = [view.instagramUrl];
  // Escape "<" so the JSON can never close the script tag.
  return JSON.stringify(data).replace(/</g, '\\u003c');
}

export function Seo({ view, origin, noindex }: { view: SiteView; origin: string; noindex?: boolean }) {
  const title = view.tagline.text === view.salonName.text ? view.salonName.text : `${view.salonName.text} | ${view.tagline.text}`;
  const desc = description(view);
  const url = `${origin}${PATHS[view.lang]}`;
  const image = `${origin}/brand/soso-logo-v2-1080.png`;

  return (
    <Head>
      <title>{title}</title>
      <meta name="description" content={desc} />
      {noindex && <meta name="robots" content="noindex" />}
      <link rel="canonical" href={url} />
      <link rel="alternate" hrefLang="ar" href={`${origin}/`} />
      <link rel="alternate" hrefLang="en" href={`${origin}/en`} />
      <link rel="alternate" hrefLang="x-default" href={`${origin}/`} />
      <meta property="og:type" content="website" />
      <meta property="og:site_name" content={view.salonName.text} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={desc} />
      <meta property="og:url" content={url} />
      <meta property="og:image" content={image} />
      <meta property="og:image:width" content="1080" />
      <meta property="og:image:height" content="1080" />
      <meta property="og:image:alt" content={view.salonName.text} />
      <meta property="og:locale" content={view.lang === 'ar' ? 'ar_AR' : 'en_US'} />
      <meta property="og:locale:alternate" content={view.lang === 'ar' ? 'en_US' : 'ar_AR'} />
      <meta name="twitter:card" content="summary" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={desc} />
      <meta name="twitter:image" content={image} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(view, origin) }} />
    </Head>
  );
}
