import type { GetServerSidePropsContext, GetServerSidePropsResult } from 'next';
import type { Lang } from '@/lib/site/strings';
import { buildSiteView, type SiteView } from '@/lib/site/view';
import { loadPublicData } from './public-data';
import { siteOrigin } from './site-url';

/** Props of every public page: the same settings and catalog, one language. */
export type SiteProps = { view: SiteView; origin: string; unavailable: boolean };

/**
 * Content freshness on Amplify Hosting: each page is server-rendered (full
 * content in the first HTML) and the CDN may keep it for 30 s, then serve it
 * stale for up to 15 s while it refetches. With the 15 s in-memory read cache
 * an owner's change shows within about a minute, with no rebuild. ISR is not
 * used: on Amplify Hosting each instance starts from the build-time snapshot,
 * which serves old content.
 */
const CACHE_CONTROL = 'public, s-maxage=30, stale-while-revalidate=15';

const emptyCatalog = { categories: [], services: [], galleryImages: [] };

export async function getSiteProps(
  context: GetServerSidePropsContext,
  lang: Lang,
  {
    fixedContent = false,
  }: {
    /**
     * The page's own content is fixed text (the privacy and data-deletion
     * pages), so it is complete even when the data cannot be read: it then
     * still answers 200 and stays indexable, because Meta's crawler checks
     * these URLs. Only the header and footer lose the owner's contact links.
     */
    fixedContent?: boolean;
  } = {},
): Promise<GetServerSidePropsResult<SiteProps>> {
  const origin = siteOrigin(context.req);
  let view: SiteView;
  let hasSettings = false;
  let unavailable = false;
  let noData = false;

  try {
    const { data } = await loadPublicData();
    hasSettings = !!data.settings;
    view = buildSiteView(lang, data.settings, data.catalog);
    context.res.setHeader('Cache-Control', CACHE_CONTROL);
  } catch {
    // No data and no earlier copy: render the static parts, tell crawlers to
    // retry (unless the page is fixed text), and keep this response out of
    // every cache.
    view = buildSiteView(lang, null, emptyCatalog);
    noData = true;
    context.res.setHeader('Cache-Control', 'no-store');
    if (!fixedContent) {
      unavailable = true;
      context.res.statusCode = 503;
      context.res.setHeader('Retry-After', '60');
    }
  }

  if (process.env.NODE_ENV === 'development') {
    if (process.env.DEMO_CONTENT !== 'off' && !noData) {
      const { applyDemo } = await import('@/lib/demo-content');
      view = applyDemo(view, hasSettings);
    }
  }

  return { props: { view, origin, unavailable } };
}
