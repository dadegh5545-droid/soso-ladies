import { useState } from 'react';
import type { HomeProps } from '@/lib/server/home-props';
import { strings } from '@/lib/site/strings';
import type { ServiceTab } from '@/lib/whatsapp';
import { About } from './About';
import { BrandStrip } from './BrandStrip';
import { Contact, hasContact } from './Contact';
import { CtaBand } from './CtaBand';
import { DemoBanner, FloatingWhatsapp, Footer } from './Footer';
import { Gallery } from './Gallery';
import { Header, type NavItem } from './Header';
import { Hero } from './Hero';
import { Highlights } from './Highlights';
import { Seo } from './Seo';
import { ServiceModes } from './ServiceModes';
import { Services } from './Services';
import { Showcase } from './Showcase';
import { Steps } from './Steps';
import styles from './HomePage.module.css';

/**
 * Section order: header, hero (carousel), the salon/home section with the
 * services list right after it, why Soso, about, the video, how it works,
 * the brand strip, gallery, a closing WhatsApp band, contact and footer, plus
 * the floating WhatsApp button. The fixed sections (hero, salon/home, why
 * Soso, how it works, brand strip) always show; sections without content are
 * left out, together with their menu link.
 */
export function HomePage({ view, origin, unavailable }: HomeProps) {
  const t = strings[view.lang];
  const hasServices = view.services.length > 0;
  const showContact = hasContact(view);
  // Shared with the salon/home cards, which can switch the services tab.
  const [serviceTab, setServiceTab] = useState<ServiceTab>('all');

  const nav: NavItem[] = [
    { href: '#top', label: t.nav.home },
    { href: hasServices ? '#services' : '#experience', label: t.nav.services },
    ...(view.about ? [{ href: '#about', label: t.nav.about }] : []),
    ...(view.gallery.length ? [{ href: '#gallery', label: t.nav.gallery }] : []),
    ...(showContact ? [{ href: '#contact', label: t.nav.contact }] : []),
  ];

  return (
    <>
      <Seo view={view} origin={origin} noindex={unavailable} />
      <a className={styles.skip} href="#main">
        {t.skipToContent}
      </a>
      <DemoBanner view={view} />
      <Header view={view} nav={nav} />
      <main id="main">
        <Hero view={view} hasServices={hasServices} />
        <ServiceModes view={view} onBrowse={setServiceTab} />
        {hasServices && <Services view={view} tab={serviceTab} onTabChange={setServiceTab} />}
        <Highlights lang={view.lang} />
        {view.about && <About view={view} about={view.about} />}
        {view.heroVideoSrc && <Showcase view={view} src={view.heroVideoSrc} />}
        <Steps lang={view.lang} />
        <BrandStrip lang={view.lang} />
        {view.gallery.length > 0 && <Gallery view={view} />}
        {view.whatsapp && <CtaBand lang={view.lang} whatsapp={view.whatsapp} />}
        {showContact && <Contact view={view} />}
      </main>
      <Footer view={view} />
      <FloatingWhatsapp view={view} />
    </>
  );
}
