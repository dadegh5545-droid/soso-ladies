import { HomeIcon, SalonIcon, WhatsappIcon } from '@/components/icons';
import { strings } from '@/lib/site/strings';
import type { SiteView } from '@/lib/site/view';
import { whatsappLink } from '@/lib/whatsapp';
import { HeroCarousel } from './HeroCarousel';
import styles from './Hero.module.css';

/**
 * Hero: the tagline and calls to action beside a self-advancing slideshow,
 * over a deep plum backdrop with slowly drifting light. The backdrop is pure
 * CSS (no image to download); the text animates in with CSS only.
 */
export function Hero({ view, hasServices }: { view: SiteView; hasServices: boolean }) {
  const t = strings[view.lang];
  // With no services yet, "browse" leads to the salon/home section instead.
  const browseHref = hasServices ? '#services' : '#experience';

  return (
    <section id="top" className={styles.hero} aria-labelledby="hero-title">
      <div className={styles.backdrop} aria-hidden="true">
        <span className={styles.glowA} />
        <span className={styles.glowB} />
        <span className={styles.glowC} />
      </div>

      <div className={styles.inner}>
        <div className={styles.content}>
          <p className={styles.eyebrow}>
            <span className={styles.line} aria-hidden="true" />
            <span lang={view.salonName.lang}>{view.salonName.text}</span>
          </p>
          <h1 id="hero-title" className={styles.title} lang={view.tagline.lang}>
            {view.tagline.text}
          </h1>
          {view.subtitle && (
            <p className={styles.subtitle} lang={view.subtitle.lang} dir="auto">
              {view.subtitle.text}
            </p>
          )}
          <ul className={styles.modes} aria-label={t.tabsLabel}>
            <li>
              <SalonIcon size={20} />
              <span>{t.badgeSalon}</span>
            </li>
            <li>
              <HomeIcon size={20} />
              <span>{t.badgeHome}</span>
            </li>
          </ul>
          <div className={styles.buttons}>
            {view.whatsapp && (
              <a className={styles.primary} href={whatsappLink(view.whatsapp)} target="_blank" rel="noopener noreferrer">
                <WhatsappIcon size={20} />
                <span>{t.whatsappCta}</span>
              </a>
            )}
            <a className={styles.secondary} href={browseHref}>
              {t.browseServices}
            </a>
          </div>
        </div>

        <HeroCarousel lang={view.lang} />
      </div>

      <a className={styles.scrollCue} href={browseHref} aria-label={t.discoverMore}>
        <span className={styles.mouse} aria-hidden="true" />
      </a>
    </section>
  );
}
