import { useMemo } from 'react';
import type { SiteProps } from '@/lib/server/site-props';
import { inPlace, serviceRows } from '@/lib/site/services';
import { strings } from '@/lib/site/strings';
import { FinalCta } from './FinalCta';
import { HowTo } from './HowTo';
import { PHOTOS } from './media';
import { PageHero } from './PageHero';
import { ServicesSection } from './Services';
import { SiteLayout } from './SiteLayout';
import { Facts } from './Statement';
import styles from './InnerPage.module.css';

/** Home service: what it is, how it works, and the services offered at home. */
export function HomeServicePage(props: SiteProps) {
  const { view } = props;
  const t = strings[view.lang];
  const h = t.homeVisit;
  const homeRows = useMemo(
    () => serviceRows(view.services, view.lang).filter((row) => inPlace(row.availability, 'home')),
    [view.services, view.lang],
  );

  return (
    <SiteLayout {...props} page="homeService" title={t.nav.homeService} description={t.pages.homeService.lead}>
      <PageHero
        lang={view.lang}
        page="homeService"
        eyebrow={t.pages.homeService.eyebrow}
        titleLines={t.pages.homeService.titleLines}
        lead={t.pages.homeService.lead}
        photo={PHOTOS.makeup}
        alt={t.pages.homeService.imageAlt}
      />
      <div className={styles.facts}>
        <Facts items={h.facts} label={h.factsLabel} />
      </div>
      <HowTo lang={view.lang} id="home-steps-title" eyebrow={h.stepsEyebrow} title={h.stepsTitle} items={h.steps} />
      {homeRows.length > 0 && (
        <ServicesSection
          id="home-services-title"
          eyebrow={h.servicesEyebrow}
          titleLines={[h.servicesTitle]}
          rows={homeRows}
          lang={view.lang}
          whatsapp={view.whatsapp}
        />
      )}
      <FinalCta lang={view.lang} whatsapp={view.whatsapp} message={t.messages.homeVisit} button={h.cta} />
    </SiteLayout>
  );
}
