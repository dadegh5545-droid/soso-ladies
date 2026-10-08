import type { SiteProps } from '@/lib/server/site-props';
import { strings } from '@/lib/site/strings';
import { BrandStrip } from './BrandStrip';
import { FinalCta } from './FinalCta';
import { PHOTOS } from './media';
import { PageHero } from './PageHero';
import { Showcase } from './Showcase';
import { SiteLayout } from './SiteLayout';
import { Story } from './Story';
import { Why } from './Why';

/** About: the story (with the owner's own text when set), the video, why Soso, the brand. */
export function AboutPage(props: SiteProps) {
  const { view } = props;
  const t = strings[view.lang];
  return (
    <SiteLayout {...props} page="about" title={t.nav.about} description={t.statement.body}>
      <PageHero
        lang={view.lang}
        page="about"
        eyebrow={t.pages.about.eyebrow}
        titleLines={t.pages.about.titleLines}
        lead={t.pages.about.lead}
        photo={PHOTOS.hair}
        alt={t.pages.about.imageAlt}
      />
      <Story lang={view.lang} about={view.about} />
      <Showcase lang={view.lang} />
      <Why lang={view.lang} />
      <BrandStrip lang={view.lang} />
      <FinalCta lang={view.lang} whatsapp={view.whatsapp} />
    </SiteLayout>
  );
}
