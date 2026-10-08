import Image from 'next/image';
import { revealItem, revealMedia, useReveal } from '@/lib/site/reveal';
import { strings, type Lang } from '@/lib/site/strings';
import type { LText } from '@/lib/site/view';
import { PHOTOS } from './media';
import { Eyebrow } from './ui';
import styles from './Story.module.css';

/**
 * About page: the salon's story beside a photo. The statement copy opens it;
 * the owner's own "about" text from the admin follows when there is one.
 */
export function Story({ lang, about }: { lang: Lang; about: LText | null }) {
  const t = strings[lang];
  const ref = useReveal<HTMLElement>();
  const photo = PHOTOS.facial;
  return (
    <section ref={ref} data-reveal className={styles.section} aria-labelledby="story-title">
      <div className={styles.inner}>
        <div className={styles.text} {...revealItem(0)}>
          <Eyebrow>{t.aboutPage.storyEyebrow}</Eyebrow>
          <h2 id="story-title" className={styles.statement}>
            {t.statement.line1}
            <br />
            <em className={styles.italic}>{t.statement.line2}</em>
          </h2>
          <p className={styles.body}>{t.statement.body}</p>
          {about && (
            <p className={styles.about} lang={about.lang} dir="auto">
              {about.text}
            </p>
          )}
        </div>
        <div className={styles.media} {...revealMedia(1)}>
          <Image
            src={photo.image}
            alt={t.signature.imageAlt}
            fill
            placeholder="blur"
            sizes="(min-width: 1024px) 520px, 100vw"
            className={styles.photo}
            style={{ objectPosition: photo.position }}
          />
        </div>
      </div>
    </section>
  );
}
