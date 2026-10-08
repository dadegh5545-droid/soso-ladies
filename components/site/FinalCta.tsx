import Image from 'next/image';
import { revealItem, useReveal } from '@/lib/site/reveal';
import { strings, type Lang } from '@/lib/site/strings';
import { whatsappLink } from '@/lib/whatsapp';
import { Lines, PrimaryButton } from './ui';
import styles from './FinalCta.module.css';

/**
 * Closing call to action in the logo's colors: a magenta card with the
 * yellow wordmark. The phone booking bar hides while it is in view (#book).
 */
export function FinalCta({
  lang,
  whatsapp,
  message,
  button,
}: {
  lang: Lang;
  whatsapp: string | null;
  /** Prefilled WhatsApp message; defaults to the booking message. */
  message?: string;
  button?: string;
}) {
  const t = strings[lang];
  const ref = useReveal<HTMLElement>();
  return (
    <section id="book" ref={ref} data-reveal className={styles.section} aria-labelledby="cta-title">
      <div className={styles.card} {...revealItem(0)}>
        <span className={styles.glow} aria-hidden="true" />
        <Image src="/brand/soso-yellow.svg" alt="Soso" width={390} height={182} unoptimized className={styles.wordmark} />
        <h2 id="cta-title" className={styles.title}>
          <Lines lines={t.cta.titleLines} />
        </h2>
        <p className={styles.body}>{t.cta.body}</p>
        {whatsapp && (
          <PrimaryButton href={whatsappLink(whatsapp, message ?? t.messages.booking)} className={styles.button} tone="light">
            {button ?? t.cta.button}
          </PrimaryButton>
        )}
      </div>
    </section>
  );
}
