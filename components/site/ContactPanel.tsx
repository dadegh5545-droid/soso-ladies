import type { ReactNode } from 'react';
import { ClockIcon, InstagramIcon, MapIcon, PhoneIcon, PinIcon, WhatsappIcon } from '@/components/icons';
import { revealItem, useReveal } from '@/lib/site/reveal';
import { strings } from '@/lib/site/strings';
import type { SiteView } from '@/lib/site/view';
import { whatsappLink } from '@/lib/whatsapp';
import styles from './ContactPanel.module.css';

function osmEmbed({ lat, lng }: { lat: number; lng: number }): string {
  const d = 0.004;
  const bbox = [lng - d * 1.5, lat - d, lng + d * 1.5, lat + d].map((n) => n.toFixed(5)).join(',');
  return `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${lat.toFixed(5)},${lng.toFixed(5)}`;
}

export const osmLink = ({ lat, lng }: { lat: number; lng: number }) =>
  `https://www.openstreetmap.org/?mlat=${lat.toFixed(5)}&mlon=${lng.toFixed(5)}#map=17/${lat.toFixed(5)}/${lng.toFixed(5)}`;

/**
 * Contact page body: the admin's contact details as cards (WhatsApp first),
 * then the map (OpenStreetMap when there are coordinates, else a link).
 * Anything empty is left out.
 */
export function ContactPanel({ view }: { view: SiteView }) {
  const t = strings[view.lang];
  const c = t.contactPage;
  const ref = useReveal<HTMLElement>();
  const mapHref = view.mapUrl ?? (view.geo ? osmLink(view.geo) : null);

  const cards: { key: string; icon: ReactNode; label: string; value: ReactNode; href?: string; primary?: boolean }[] = [];
  if (view.whatsapp)
    cards.push({
      key: 'whatsapp',
      icon: <WhatsappIcon size={24} />,
      label: c.whatsapp,
      value: c.whatsappHint,
      href: whatsappLink(view.whatsapp, t.messages.booking),
      primary: true,
    });
  if (view.phone)
    cards.push({
      key: 'phone',
      icon: <PhoneIcon size={24} />,
      label: c.phone,
      value: <span dir="ltr">{view.phone}</span>,
      href: `tel:${view.phone.replace(/[^\d+]/g, '')}`,
    });
  if (view.instagramUrl)
    cards.push({ key: 'instagram', icon: <InstagramIcon size={24} />, label: c.instagram, value: view.instagramUrl.replace(/^https?:\/\/(www\.)?/, ''), href: view.instagramUrl });
  if (view.address)
    cards.push({ key: 'address', icon: <PinIcon size={24} />, label: c.address, value: <span lang={view.address.lang}>{view.address.text}</span> });
  if (view.workingHours)
    cards.push({ key: 'hours', icon: <ClockIcon size={24} />, label: c.hours, value: <span lang={view.workingHours.lang}>{view.workingHours.text}</span> });

  return (
    <section ref={ref} data-reveal className={styles.section} aria-label={t.nav.contact}>
      <div className={styles.inner}>
        {cards.length === 0 ? (
          <p className={styles.empty}>{c.empty}</p>
        ) : (
          <ul className={styles.cards}>
            {cards.map((card, i) => {
              const content = (
                <>
                  <span className={styles.icon}>{card.icon}</span>
                  <span className={styles.label}>{card.label}</span>
                  <span className={styles.value}>{card.value}</span>
                </>
              );
              return (
                <li key={card.key} {...revealItem(i)}>
                  {card.href ? (
                    <a
                      className={styles.card}
                      data-primary={card.primary || undefined}
                      href={card.href}
                      target={card.href.startsWith('tel:') ? undefined : '_blank'}
                      rel="noopener noreferrer"
                    >
                      {content}
                    </a>
                  ) : (
                    <div className={styles.card}>{content}</div>
                  )}
                </li>
              );
            })}
          </ul>
        )}

        {(view.geo || mapHref) && (
          <div className={styles.map} data-embed={view.geo ? '' : undefined} {...revealItem(cards.length)}>
            {view.geo && <iframe className={styles.frame} title={c.mapTitle} src={osmEmbed(view.geo)} loading="lazy" referrerPolicy="strict-origin-when-cross-origin" />}
            {mapHref && (
              <a className={styles.mapLink} href={mapHref} target="_blank" rel="noopener noreferrer">
                <MapIcon size={20} />
                <span>{c.openMap}</span>
              </a>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
