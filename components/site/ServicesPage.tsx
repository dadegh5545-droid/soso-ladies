import { useRouter } from 'next/router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import type { SiteProps } from '@/lib/server/site-props';
import { needsPlaceFilter, parsePlace, serviceRows, type Place } from '@/lib/site/services';
import { strings } from '@/lib/site/strings';
import { FinalCta } from './FinalCta';
import { PHOTOS } from './media';
import { Occasions } from './Occasions';
import { PageHero } from './PageHero';
import { Services } from './Services';
import { SiteLayout } from './SiteLayout';

/**
 * Services: every active service in the admin's order. The place filter
 * (?place=salon|home, also set from the home page) is applied on the client
 * and kept in the URL.
 */
export function ServicesPage(props: SiteProps) {
  const { view } = props;
  const t = strings[view.lang];
  const router = useRouter();
  const rows = useMemo(() => serviceRows(view.services, view.lang), [view.services, view.lang]);

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

  return (
    <SiteLayout {...props} page="services" title={t.nav.services} description={t.pages.services.lead}>
      <PageHero
        lang={view.lang}
        page="services"
        eyebrow={t.pages.services.eyebrow}
        titleLines={t.pages.services.titleLines}
        lead={t.pages.services.lead}
        photo={PHOTOS.manicure}
        alt={t.pages.services.imageAlt}
      />
      {rows.length > 0 && (
        <Services
          rows={rows}
          lang={view.lang}
          whatsapp={view.whatsapp}
          place={place}
          onPlace={setPlace}
          showFilter={needsPlaceFilter(rows)}
        />
      )}
      <Occasions lang={view.lang} whatsapp={view.whatsapp} />
      <FinalCta lang={view.lang} whatsapp={view.whatsapp} />
    </SiteLayout>
  );
}
