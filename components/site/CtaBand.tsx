import { WhatsappIcon } from '@/components/icons';
import { revealItem, useReveal } from '@/lib/site/reveal';
import { strings, type Lang } from '@/lib/site/strings';
import { whatsappLink } from '@/lib/whatsapp';
import styles from './CtaBand.module.css';

/** Closing invitation to message the salon; shown only with a WhatsApp number. */
export function CtaBand({ lang, whatsapp }: { lang: Lang; whatsapp: string }) {
  const t = strings[lang];
  const ref = useReveal<HTMLElement>();
  return (
    <section ref={ref} data-reveal className={styles.band} aria-labelledby="cta-title">
      <span className={styles.glow} aria-hidden="true" />
      <div className={styles.inner}>
        <h2 id="cta-title" className={styles.title} {...revealItem(0)}>
          {t.cta.title}
        </h2>
        <p className={styles.text} {...revealItem(1)}>
          {t.cta.text}
        </p>
        <div {...revealItem(2)}>
          <a className={styles.button} href={whatsappLink(whatsapp)} target="_blank" rel="noopener noreferrer">
            <WhatsappIcon size={22} />
            <span>{t.whatsappCta}</span>
          </a>
        </div>
      </div>
    </section>
  );
}
