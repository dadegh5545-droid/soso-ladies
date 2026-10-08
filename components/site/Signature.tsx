import Image from 'next/image';
import { revealItem, useReveal } from '@/lib/site/reveal';
import { strings, type Lang } from '@/lib/site/strings';
import { whatsappLink } from '@/lib/whatsapp';
import { PHOTOS } from './media';
import { Eyebrow, SecondaryButton } from './ui';
import styles from './Signature.module.css';

/**
 * The signature service, full bleed. The data model has no "featured" flag,
 * so this is the permanent-makeup copy from the brief with the facial photo.
 */
export function Signature({ lang, whatsapp }: { lang: Lang; whatsapp: string | null }) {
  const t = strings[lang];
  const photo = PHOTOS.facial;
  const ref = useReveal<HTMLElement>();
  return (
    <section ref={ref} data-reveal className={styles.section} aria-labelledby="signature-title">
      <Image
        src={photo.image}
        alt={t.signature.imageAlt}
        fill
        placeholder="blur"
        sizes="100vw"
        className={styles.photo}
        style={{ objectPosition: photo.position }}
      />
      <div className={styles.fade} aria-hidden="true" />
      <div className={styles.content}>
        <div className={styles.text} {...revealItem(0)}>
          <Eyebrow tone="gold">{t.signature.eyebrow}</Eyebrow>
          <h2 id="signature-title" className={styles.title}>
            {t.signature.title}
          </h2>
          <p className={styles.body}>{t.signature.body}</p>
          {whatsapp && (
            <div className={styles.cta}>
              <SecondaryButton href={whatsappLink(whatsapp, t.messages.consultation)}>{t.signature.cta}</SecondaryButton>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
