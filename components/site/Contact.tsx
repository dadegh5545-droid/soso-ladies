import type { ReactNode } from 'react';
import { ClockIcon, InstagramIcon, MapIcon, PhoneIcon, PinIcon, WhatsappIcon } from '@/components/icons';
import { revealItem, useReveal } from '@/lib/site/reveal';
import { strings } from '@/lib/site/strings';
import type { LText, SiteView } from '@/lib/site/view';
import { whatsappLink } from '@/lib/whatsapp';
import { SectionHeading } from './SectionHeading';
import styles from './Contact.module.css';

/** True when the contact section has anything to show. */
export function hasContact(view: SiteView): boolean {
  return !!(view.address || view.workingHours || view.phone || view.whatsapp || view.instagramUrl || view.mapUrl || view.geo);
}

function osmEmbed({ lat, lng }: { lat: number; lng: number }): string {
  const d = 0.004;
  const bbox = [lng - d * 1.5, lat - d, lng + d * 1.5, lat + d].map((n) => n.toFixed(5)).join(',');
  return `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${lat.toFixed(5)},${lng.toFixed(5)}`;
}

const osmLink = ({ lat, lng }: { lat: number; lng: number }) =>
  `https://www.openstreetmap.org/?mlat=${lat.toFixed(5)}&mlon=${lng.toFixed(5)}#map=17/${lat.toFixed(5)}/${lng.toFixed(5)}`;

function Row({ icon, label, children }: { icon: ReactNode; label: string; children: ReactNode }) {
  return (
    <div className={styles.row}>
      <span className={styles.icon}>{icon}</span>
      <div>
        <div className={styles.label}>{label}</div>
        {children}
      </div>
    </div>
  );
}

const TextValue = ({ value }: { value: LText }) => (
  <div className={styles.value} lang={value.lang} dir="auto">
    {value.text}
  </div>
);

export function Contact({ view }: { view: SiteView }) {
  const t = strings[view.lang];
  const mapHref = view.mapUrl ?? (view.geo ? osmLink(view.geo) : null);
  const hasCard = !!(view.address || view.workingHours || view.phone || view.whatsapp || view.instagramUrl);
  const hasMap = !!(view.geo || view.mapUrl);
  const ref = useReveal<HTMLElement>();

  return (
    <section id="contact" ref={ref} data-reveal className={styles.section} aria-labelledby="contact-title">
      <div {...revealItem(0)}>
        <SectionHeading id="contact-title" title={t.contactTitle} />
      </div>
      <div className={styles.layout} {...revealItem(1)}>
        {hasCard && (
          <div className={styles.card}>
            {view.address && (
              <Row icon={<PinIcon size={24} />} label={t.address}>
                <TextValue value={view.address} />
              </Row>
            )}
            {view.workingHours && (
              <Row icon={<ClockIcon size={24} />} label={t.workingHours}>
                <TextValue value={view.workingHours} />
              </Row>
            )}
            {view.phone && (
              <Row icon={<PhoneIcon size={24} />} label={t.phone}>
                <a className={styles.phone} href={`tel:${view.phone.replace(/[^\d+]/g, '')}`} dir="ltr">
                  {view.phone}
                </a>
              </Row>
            )}
            {(view.whatsapp || view.instagramUrl) && (
              <div className={styles.buttons}>
                {view.whatsapp && (
                  <a className={styles.whatsapp} href={whatsappLink(view.whatsapp)} target="_blank" rel="noopener noreferrer">
                    <WhatsappIcon size={20} />
                    <span>{t.whatsapp}</span>
                  </a>
                )}
                {view.instagramUrl && (
                  <a className={styles.instagram} href={view.instagramUrl} target="_blank" rel="noopener noreferrer">
                    <InstagramIcon size={20} />
                    <span>{t.instagram}</span>
                  </a>
                )}
              </div>
            )}
          </div>
        )}

        {hasMap && (
          <div className={view.geo ? styles.map : styles.mapLinkOnly}>
            {view.geo && (
              <iframe
                className={styles.frame}
                title={t.mapTitle}
                src={osmEmbed(view.geo)}
                loading="lazy"
                referrerPolicy="strict-origin-when-cross-origin"
              />
            )}
            {mapHref && (
              <a className={styles.mapLink} href={mapHref} target="_blank" rel="noopener noreferrer">
                <MapIcon size={20} />
                <span>{t.openMap}</span>
              </a>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
