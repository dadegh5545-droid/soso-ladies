import { InstagramIcon, WhatsappIcon } from '@/components/icons';
import { strings } from '@/lib/site/strings';
import type { SiteView } from '@/lib/site/view';
import { whatsappLink } from '@/lib/whatsapp';
import styles from './Footer.module.css';

export function Footer({ view }: { view: SiteView }) {
  const t = strings[view.lang];
  return (
    <footer className={styles.footer} data-floating={view.whatsapp ? '' : undefined}>
      <div className={styles.identity}>
        <span className={styles.name} lang={view.salonName.lang}>
          {view.salonName.text}
        </span>
        <span className={styles.rights}>{t.rights}</span>
      </div>
      {view.instagramUrl && (
        <a className={styles.instagram} href={view.instagramUrl} target="_blank" rel="noopener noreferrer">
          <InstagramIcon size={20} />
          <span>{t.followInstagram}</span>
        </a>
      )}
    </footer>
  );
}

/** Fixed round WhatsApp button; not rendered without a number. */
export function FloatingWhatsapp({ view }: { view: SiteView }) {
  if (!view.whatsapp) return null;
  return (
    <a
      className={styles.floating}
      href={whatsappLink(view.whatsapp)}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={strings[view.lang].whatsappCta}
    >
      <WhatsappIcon size={26} />
    </a>
  );
}

export function DemoBanner({ view }: { view: SiteView }) {
  if (!view.demo) return null;
  return (
    <div className={styles.demo} role="note">
      {strings[view.lang].demoBanner}
    </div>
  );
}
