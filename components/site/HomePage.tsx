import { useRouter } from 'next/router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import type { HomeProps } from '@/lib/server/home-props';
import { needsPlaceFilter, parsePlace, serviceRows, type Place } from '@/lib/site/services';
import { strings } from '@/lib/site/strings';
import { FinalCta } from './FinalCta';
import { fontVariables } from './fonts';
import { DemoBanner, Footer } from './Footer';
import { Header, type NavItem } from './Header';
import { Hero } from './Hero';
import { HowTo } from './HowTo';
import { Marquee } from './Marquee';
import { Occasions } from './Occasions';
import { Seo } from './Seo';
import { Services } from './Services';
import { Signature } from './Signature';
import { Statement } from './Statement';
import { StickyBar } from './StickyBar';
import { Why } from './Why';
import styles from './HomePage.module.css';

/**
 * Homepage (October 2026 redesign, editorial dark): header, hero video,
 * services marquee, statement, services, signature service, occasions, why
 * Soso, how to book, final call to action, footer, and the phone booking bar.
 * Services, marquee and footer contact come from the admin data; without
 * services the marquee and the services section are left out.
 */
export function HomePage({ view, origin, unavailable }: HomeProps) {
  const t = strings[view.lang];
  const router = useRouter();
  const rows = useMemo(() => serviceRows(view.services, view.lang), [view.services, view.lang]);
  const hasServices = rows.length > 0;

  // The place filter (?place=salon|home) is shared by the hero control and the
  // services filter row. It is applied on the client to the list already in
  // the page; the URL keeps it across reloads.
  const [place, setPlaceState] = useState<Place>('all');
  useEffect(() => {
    if (router.isReady) setPlaceState(parsePlace(router.query.place));
  }, [router.isReady, router.query.place]);

  const setPlace = useCallback(
    (next: Place) => {
      setPlaceState(next);
      const query = next === 'all' ? {} : { place: next };
      void router.replace({ pathname: router.pathname, query }, undefined, { shallow: true, scroll: false });
    },
    [router],
  );

  const choosePlaceFromHero = useCallback(
    (next: Exclude<Place, 'all'>) => {
      setPlace(next);
      const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      document.getElementById('services')?.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });
    },
    [setPlace],
  );

  // Development only: NODE_ENV is inlined at build time, so production builds
  // drop the banner entirely. It sits above the fixed header, which moves down.
  const showDemoBanner = process.env.NODE_ENV === 'development' && !!view.demoNote;

  const nav: NavItem[] = [
    { href: '#top', label: t.nav.home },
    ...(hasServices ? [{ href: '#services', label: t.nav.services }] : []),
    { href: '#about', label: t.nav.about },
    { href: '#contact', label: t.nav.contact },
  ];

  return (
    <div className={`${fontVariables} ${styles.page}`} data-lang={view.lang} data-demo={showDemoBanner || undefined}>
      <style jsx global>{`
        body {
          background: var(--bg);
        }
      `}</style>
      <Seo view={view} origin={origin} noindex={unavailable} />
      <a className={styles.skip} href="#main">
        {t.skipToContent}
      </a>
      {showDemoBanner && <DemoBanner view={view} />}
      <Header view={view} nav={nav} />
      <main id="main">
        <Hero view={view} place={place} onPlace={choosePlaceFromHero} showPlaces={hasServices} />
        {hasServices && <Marquee names={rows.map((row) => row.name)} lang={view.lang} />}
        <Statement lang={view.lang} />
        {hasServices && (
          <Services
            rows={rows}
            lang={view.lang}
            whatsapp={view.whatsapp}
            place={place}
            onPlace={setPlace}
            showFilter={needsPlaceFilter(rows)}
          />
        )}
        <Signature lang={view.lang} whatsapp={view.whatsapp} />
        <Occasions lang={view.lang} whatsapp={view.whatsapp} />
        <Why lang={view.lang} />
        <HowTo lang={view.lang} />
        <FinalCta lang={view.lang} whatsapp={view.whatsapp} />
      </main>
      <Footer view={view} />
      {view.whatsapp && <StickyBar lang={view.lang} whatsapp={view.whatsapp} />}
    </div>
  );
}
