import type { GetServerSidePropsContext, GetServerSidePropsResult } from 'next';
import type { Lang } from '@/lib/site/strings';
import { buildSiteView, type SiteView } from '@/lib/site/view';
import { loadPublicData } from './public-data';
import { siteOrigin } from './site-url';

export type HomeProps = { view: SiteView; origin: string; unavailable: boolean };

/**
 * Content freshness on Amplify Hosting: the page is server-rendered (full
 * content in the first HTML) and the CDN may keep it for 30 s, then serve it
 * stale for up to 15 s while it refetches. With the 15 s in-memory read cache
 * an owner's change shows within about a minute, with no rebuild. ISR is not
 * used: on Amplify Hosting each instance starts from the build-time snapshot,
 * which serves old content.
 */
const CACHE_CONTROL = 'public, s-maxage=30, stale-while-revalidate=15';

const emptyCatalog = { categories: [], services: [], galleryImages: [] };

export async function getHomeProps(
  context: GetServerSidePropsContext,
  lang: Lang,
): Promise<GetServerSidePropsResult<HomeProps>> {
  const origin = siteOrigin(context.req);
  let view: SiteView;
  let hasSettings = false;
  let unavailable = false;

  try {
    const { data } = await loadPublicData();
    hasSettings = !!data.settings;
    view = buildSiteView(lang, data.settings, data.catalog);
    context.res.setHeader('Cache-Control', CACHE_CONTROL);
  } catch {
    // No data and no earlier copy: render the static parts, tell crawlers to
    // retry, and keep this response out of every cache.
    view = buildSiteView(lang, null, emptyCatalog);
    unavailable = true;
    context.res.statusCode = 503;
    context.res.setHeader('Retry-After', '60');
    context.res.setHeader('Cache-Control', 'no-store');
  }

  if (process.env.NODE_ENV === 'development') {
    if (process.env.DEMO_CONTENT !== 'off' && !unavailable) {
      const { applyDemo } = await import('@/lib/demo-content');
      view = applyDemo(view, hasSettings);
    }
  }

  return { props: { view, origin, unavailable } };
}
