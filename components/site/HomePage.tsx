import { useMemo } from 'react';
import type { SiteProps } from '@/lib/server/site-props';
import { serviceRows } from '@/lib/site/services';
import { BrandStrip } from './BrandStrip';
import { FinalCta } from './FinalCta';
import { HeroCarousel } from './HeroCarousel';
import { HomeTeaser } from './HomeTeaser';
import { HowTo } from './HowTo';
import { Marquee } from './Marquee';
import { Occasions } from './Occasions';
import { ServicesPreview } from './Services';
import { Signature } from './Signature';
import { SiteLayout } from './SiteLayout';
import { Statement } from './Statement';
import { Why } from './Why';

/**
 * Home: the photo carousel, the services marquee and statement, the first
 * services (all of them on /services), the signature service, the home
 * service, occasions, the brand strip, why Soso, how to book, and the final
 * call to action. Without services the marquee and the preview are left out.
 */
export function HomePage(props: SiteProps) {
  const { view } = props;
  const rows = useMemo(() => serviceRows(view.services, view.lang), [view.services, view.lang]);
  const hasServices = rows.length > 0;

  return (
    <SiteLayout {...props} page="home">
      <HeroCarousel view={view} showPlaces={hasServices} />
      {hasServices && <Marquee names={rows.map((row) => row.name)} lang={view.lang} />}
      <Statement lang={view.lang} />
      {hasServices && <ServicesPreview rows={rows} lang={view.lang} whatsapp={view.whatsapp} />}
      <Signature lang={view.lang} whatsapp={view.whatsapp} />
      <HomeTeaser lang={view.lang} />
      <Occasions lang={view.lang} whatsapp={view.whatsapp} />
      <BrandStrip lang={view.lang} />
      <Why lang={view.lang} />
      <HowTo lang={view.lang} />
      <FinalCta lang={view.lang} whatsapp={view.whatsapp} />
    </SiteLayout>
  );
}
