import type { ReactNode } from 'react';
import type { SiteProps } from '@/lib/server/site-props';
import type { PageKey } from '@/lib/site/routes';
import { strings } from '@/lib/site/strings';
import { fontVariables } from './fonts';
import { DemoBanner, Footer } from './Footer';
import { Header } from './Header';
import { MetaPixel } from './MetaPixel';
import { Seo } from './Seo';
import { StickyBar } from './StickyBar';
import styles from './SiteLayout.module.css';

/**
 * Production builds only: local development never sends events to Meta.
 * NODE_ENV is inlined at build time.
 */
const META_PIXEL_ON = process.env.NODE_ENV === 'production';

/**
 * Frame of every public page: fonts and theme, SEO, the Meta Pixel, the
 * fixed header with the page menu, the footer and the phone booking bar.
 */
export function SiteLayout({
  view,
  origin,
  unavailable,
  page,
  title,
  description,
  brandHero = false,
  children,
}: SiteProps & {
  page: PageKey;
  title?: string;
  description?: string;
  /** The page opens on a brand-magenta banner (a PageHero without a photo). */
  brandHero?: boolean;
  children: ReactNode;
}) {
  const t = strings[view.lang];
  // Development only: NODE_ENV is inlined at build time, so production builds
  // drop the banner entirely. It sits above the fixed header, which moves down.
  const showDemoBanner = process.env.NODE_ENV === 'development' && !!view.demoNote;

  return (
    <div className={`${fontVariables} ${styles.page}`} data-lang={view.lang} data-demo={showDemoBanner || undefined}>
      <style jsx global>{`
        body {
          background: var(--bg);
        }
      `}</style>
      <Seo view={view} origin={origin} page={page} title={title} description={description} noindex={unavailable} />
      {META_PIXEL_ON && <MetaPixel />}
      <a className={styles.skip} href="#main">
        {t.skipToContent}
      </a>
      {showDemoBanner && <DemoBanner view={view} />}
      <Header view={view} page={page} onBrand={brandHero} />
      <main id="main">{children}</main>
      <Footer view={view} />
      {view.whatsapp && <StickyBar lang={view.lang} whatsapp={view.whatsapp} />}
    </div>
  );
}
