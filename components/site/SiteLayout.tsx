import type { ReactNode } from 'react';
import type { SiteProps } from '@/lib/server/site-props';
import type { PageKey } from '@/lib/site/routes';
import { strings } from '@/lib/site/strings';
import { fontVariables } from './fonts';
import { DemoBanner, Footer } from './Footer';
import { Header } from './Header';
import { Seo } from './Seo';
import { StickyBar } from './StickyBar';
import styles from './SiteLayout.module.css';

/**
 * Frame of every public page: fonts and theme, SEO, the fixed header with
 * the page menu, the footer and the phone booking bar.
 */
export function SiteLayout({
  view,
  origin,
  unavailable,
  page,
  title,
  description,
  children,
}: SiteProps & { page: PageKey; title?: string; description?: string; children: ReactNode }) {
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
      <a className={styles.skip} href="#main">
        {t.skipToContent}
      </a>
      {showDemoBanner && <DemoBanner view={view} />}
      <Header view={view} page={page} />
      <main id="main">{children}</main>
      <Footer view={view} />
      {view.whatsapp && <StickyBar lang={view.lang} whatsapp={view.whatsapp} />}
    </div>
  );
}
