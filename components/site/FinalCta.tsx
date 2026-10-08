import Image from 'next/image';
import { revealItem, useReveal } from '@/lib/site/reveal';
import { strings, type Lang } from '@/lib/site/strings';
import { whatsappLink } from '@/lib/whatsapp';
import { Lines, PrimaryButton } from './ui';
import styles from './FinalCta.module.css';

/** Cream card closing the page; the sticky bar hides while it is in view. */
export function FinalCta({ lang, whatsapp }: { lang: Lang; whatsapp: string | null }) {
  const t = strings[lang];
  const ref = useReveal<HTMLElement>();
  return (
    <section id="book" ref={ref} data-reveal className={styles.section} aria-labelledby="cta-title">
      <div className={styles.card} {...revealItem(0)}>
        <Image src="/brand/soso-magenta.svg" alt="Soso" width={390} height={182} unoptimized className={styles.wordmark} />
        <h2 id="cta-title" className={styles.title}>
          <Lines lines={t.cta.titleLines} />
        </h2>
        <p className={styles.body}>{t.cta.body}</p>
        {whatsapp && (
          <PrimaryButton href={whatsappLink(whatsapp, t.messages.booking)} className={styles.button}>
            {t.cta.button}
          </PrimaryButton>
        )}
      </div>
    </section>
  );
}
