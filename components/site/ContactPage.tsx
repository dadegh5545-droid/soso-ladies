import type { SiteProps } from '@/lib/server/site-props';
import { strings } from '@/lib/site/strings';
import { ContactPanel } from './ContactPanel';
import { PageHero } from './PageHero';
import { SiteLayout } from './SiteLayout';

/** Contact: a brand-magenta banner, then the contact cards and the map. */
export function ContactPage(props: SiteProps) {
  const { view } = props;
  const t = strings[view.lang];
  return (
    <SiteLayout {...props} page="contact" title={t.nav.contact} description={t.pages.contact.lead}>
      <PageHero
        lang={view.lang}
        page="contact"
        eyebrow={t.pages.contact.eyebrow}
        titleLines={t.pages.contact.titleLines}
        lead={t.pages.contact.lead}
      />
      <ContactPanel view={view} />
    </SiteLayout>
  );
}
