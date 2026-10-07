import type { HomeProps } from '@/lib/server/home-props';
import { strings } from '@/lib/site/strings';
import { About } from './About';
import { BrandStrip } from './BrandStrip';
import { Contact, hasContact } from './Contact';
import { DemoBanner, FloatingWhatsapp, Footer } from './Footer';
import { Gallery } from './Gallery';
import { Header, type NavItem } from './Header';
import { Hero } from './Hero';
import { Seo } from './Seo';
import { Services } from './Services';
import styles from './HomePage.module.css';

/**
 * Section order is fixed by the design: header, hero (video), services right
 * under the hero, about, brand strip, gallery, contact, footer, plus the
 * floating WhatsApp button. Sections without content are left out, together
 * with their menu link.
 */
export function HomePage({ view, origin, unavailable }: HomeProps) {
  const t = strings[view.lang];
  const hasServices = view.services.length > 0;
  const showContact = hasContact(view);

  const nav: NavItem[] = [
    { href: '#top', label: t.nav.home },
    ...(hasServices ? [{ href: '#services', label: t.nav.services }] : []),
    ...(view.about ? [{ href: '#about', label: t.nav.about }] : []),
    ...(view.gallery.length ? [{ href: '#gallery', label: t.nav.gallery }] : []),
    ...(showContact ? [{ href: '#contact', label: t.nav.contact }] : []),
  ];

  return (
    <>
      <Seo view={view} origin={origin} noindex={unavailable} />
      <a className={styles.skip} href={hasServices ? '#services' : '#main'}>
        {t.skipToContent}
      </a>
      <DemoBanner view={view} />
      <Header view={view} nav={nav} />
      <main id="main">
        <Hero view={view} hasServices={hasServices} />
        {hasServices && <Services view={view} />}
        {view.about && <About view={view} about={view.about} />}
        <BrandStrip lang={view.lang} />
        {view.gallery.length > 0 && <Gallery view={view} />}
        {showContact && <Contact view={view} />}
      </main>
      <Footer view={view} />
      <FloatingWhatsapp view={view} />
    </>
  );
}
