import Image from 'next/image';
import Link from 'next/link';
import { InstagramIcon, PinIcon, WhatsappIcon } from '@/components/icons';
import { PAGE_KEYS, pathFor } from '@/lib/site/routes';
import { strings } from '@/lib/site/strings';
import type { SiteView } from '@/lib/site/view';
import { whatsappLink } from '@/lib/whatsapp';
import styles from './Footer.module.css';

const osmLink = ({ lat, lng }: { lat: number; lng: number }) =>
  `https://www.openstreetmap.org/?mlat=${lat.toFixed(5)}&mlon=${lng.toFixed(5)}#map=17/${lat.toFixed(5)}/${lng.toFixed(5)}`;

/**
 * Wordmark and round links (Instagram, WhatsApp, map), then the contact block
 * from the admin settings (address, opening hours, phone). Anything empty is
 * left out.
 */
export function Footer({ view }: { view: SiteView }) {
  const t = strings[view.lang].footer;
  const booking = strings[view.lang].messages.booking;
  const mapHref = view.mapUrl ?? (view.geo ? osmLink(view.geo) : null);
  type RoundLink = { href: string; label: string; Icon: typeof InstagramIcon };
  const links: RoundLink[] = [];
  if (view.instagramUrl) links.push({ href: view.instagramUrl, label: t.instagram, Icon: InstagramIcon });
  if (view.whatsapp) links.push({ href: whatsappLink(view.whatsapp, booking), label: t.whatsapp, Icon: WhatsappIcon });
  if (mapHref) links.push({ href: mapHref, label: t.map, Icon: PinIcon });

  return (
    <footer id="contact" className={styles.footer}>
      <div className={styles.inner}>
        <div className={styles.top}>
          <Image src="/brand/soso-magenta.svg" alt={view.salonName.text} width={390} height={182} unoptimized className={styles.wordmark} />
          {links.length > 0 && (
            <ul className={styles.links}>
              {links.map(({ href, label, Icon }) => (
                <li key={label}>
                  <a href={href} target="_blank" rel="noopener noreferrer" aria-label={label}>
                    <Icon size={18} strokeWidth={1.7} />
                  </a>
                </li>
              ))}
            </ul>
          )}
        </div>

        <nav className={styles.pages} aria-label={strings[view.lang].mainNav}>
          {PAGE_KEYS.map((key) => (
            <Link key={key} href={pathFor(key, view.lang)}>
              {strings[view.lang].nav[key]}
            </Link>
          ))}
        </nav>

        {(view.address || view.workingHours || view.phone) && (
          <dl className={styles.contact}>
            {view.address && (
              <div>
                <dt>{t.address}</dt>
                <dd lang={view.address.lang} dir="auto">
                  {view.address.text}
                </dd>
              </div>
            )}
            {view.workingHours && (
              <div>
                <dt>{t.hours}</dt>
                <dd lang={view.workingHours.lang} dir="auto">
                  {view.workingHours.text}
                </dd>
              </div>
            )}
            {view.phone && (
              <div>
                <dt>{t.phone}</dt>
                <dd>
                  <a href={`tel:${view.phone.replace(/[^\d+]/g, '')}`} dir="ltr">
                    {view.phone}
                  </a>
                </dd>
              </div>
            )}
          </dl>
        )}

        <p className={styles.copyright} dir="ltr">
          {t.copyright}
        </p>
      </div>
    </footer>
  );
}

/** Development only: the banner shown while demo content is on screen. */
export function DemoBanner({ view }: { view: SiteView }) {
  if (!view.demoNote) return null;
  return (
    <div className={styles.demo} role="note">
      {view.demoNote}
    </div>
  );
}
